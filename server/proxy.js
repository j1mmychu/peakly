'use strict';

const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '16kb' }));

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
if (!TOKEN) {
  console.error('[proxy] TRAVELPAYOUTS_TOKEN env var is required');
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

// ─── Rate limiting (in-memory, no deps) ───────────────────────────────────────
// 60 requests per minute per IP. Resets every 60s window.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;
const _rateMap = new Map();
function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const now = Date.now();
  const entry = _rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    _rateMap.set(ip, { start: now, count: 1 });
    return next();
  }
  if (entry.count >= RATE_LIMIT) {
    res.setHeader('Retry-After', Math.ceil((entry.start + RATE_WINDOW_MS - now) / 1000));
    return res.status(429).json({ success: false, error: 'Rate limit exceeded. Try again in 60s.' });
  }
  entry.count++;
  return next();
}
app.use(rateLimiter);
// Clean up stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, entry] of _rateMap) if (entry.start < cutoff) _rateMap.delete(ip);
}, 5 * 60 * 1000);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  'http://localhost:8000',
  'http://localhost:3000',
  'http://127.0.0.1:8000',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch JSON from a URL over HTTPS, returns parsed object or throws. */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      res.setTimeout(8000, () => { req.destroy(); reject(new Error('Response body timeout')); });
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(body) });
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
  });
}

/** Return YYYY-MM-01 for the current month (or next month if within 5 days of end). */
function currentMonthParam() {
  const now = new Date();
  // If we're near end of month, prefer next month for better price availability
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  if (daysLeft < 5) {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

// ─── IATA validation ──────────────────────────────────────────────────────────
const IATA_RE = /^[A-Z]{3}$/;

// ─── GET /api/flights ─────────────────────────────────────────────────────────
// Calls Travelpayouts v2/prices/month-matrix
// Query params: origin (IATA), destination (IATA)
// Response: { success, data: { [destination]: { [YYYY-MM]: { price } } }, found_at }
app.get('/api/flights', async (req, res) => {
  const { origin, destination } = req.query;

  if (!IATA_RE.test(origin || '') || !IATA_RE.test(destination || '')) {
    return res.status(400).json({ success: false, error: 'origin and destination must be 3-letter IATA codes' });
  }

  const month = currentMonthParam();
  const url = `https://api.travelpayouts.com/v2/prices/month-matrix`
    + `?origin=${encodeURIComponent(origin)}`
    + `&destination=${encodeURIComponent(destination)}`
    + `&month=${month}`
    + `&show_to_affiliates=true`
    + `&currency=usd`
    + `&token=${TOKEN}`;

  try {
    const { status, json } = await fetchJson(url);

    if (status === 429) {
      return res.status(429).json({ success: false, error: 'Rate limited by upstream' });
    }
    if (status >= 500) {
      return res.status(502).json({ success: false, error: 'Upstream server error' });
    }
    if (!json.success) {
      return res.status(502).json({ success: false, error: 'Upstream returned failure', upstream: json });
    }

    // Reshape: array of day prices → { [destination]: { [YYYY-MM]: { price } } }
    const prices = Array.isArray(json.data) ? json.data : [];
    const byMonth = {};
    for (const entry of prices) {
      if (typeof entry.price !== 'number' || entry.price <= 0) continue;
      const dateKey = (entry.depart_date || entry.found_at || '').slice(0, 7); // YYYY-MM
      if (!dateKey) continue;
      if (!byMonth[dateKey] || entry.price < byMonth[dateKey].price) {
        byMonth[dateKey] = { price: entry.price, depart_date: entry.depart_date };
      }
    }

    return res.json({
      success: true,
      data: { [destination]: byMonth },
      found_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/api/flights] error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/flights/latest ──────────────────────────────────────────────────
// Calls Travelpayouts v1/prices/latest
// Query params: origin (IATA), destination (IATA), period_type (month|year), one_way (bool)
// Response: { success, data: { [destination]: { [YYYY-MM]: { price } } }, found_at }
app.get('/api/flights/latest', async (req, res) => {
  const {
    origin,
    destination,
    period_type = 'month',
    one_way = 'true',
  } = req.query;

  if (!IATA_RE.test(origin || '') || !IATA_RE.test(destination || '')) {
    return res.status(400).json({ success: false, error: 'origin and destination must be 3-letter IATA codes' });
  }
  if (!['month', 'year'].includes(period_type)) {
    return res.status(400).json({ success: false, error: 'period_type must be month or year' });
  }

  const url = `https://api.travelpayouts.com/v1/prices/latest`
    + `?origin=${encodeURIComponent(origin)}`
    + `&destination=${encodeURIComponent(destination)}`
    + `&period_type=${encodeURIComponent(period_type)}`
    + `&one_way=${encodeURIComponent(one_way)}`
    + `&currency=usd`
    + `&token=${TOKEN}`;

  try {
    const { status, json } = await fetchJson(url);

    if (status === 429) {
      return res.status(429).json({ success: false, error: 'Rate limited by upstream' });
    }
    if (status >= 500) {
      return res.status(502).json({ success: false, error: 'Upstream server error' });
    }
    if (!json.success) {
      return res.status(502).json({ success: false, error: 'Upstream returned failure', upstream: json });
    }

    // Reshape: array → { [destination]: { [YYYY-MM]: { price } } }
    // v1/prices/latest returns: { success, data: [ { origin, destination, price, depart_date, ... } ] }
    const prices = Array.isArray(json.data) ? json.data : [];
    const byMonth = {};
    for (const entry of prices) {
      if (typeof entry.price !== 'number' || entry.price <= 0) continue;
      const dateKey = (entry.depart_date || '').slice(0, 7); // YYYY-MM
      if (!dateKey) continue;
      if (!byMonth[dateKey] || entry.price < byMonth[dateKey].price) {
        byMonth[dateKey] = {
          price: entry.price,
          depart_date: entry.depart_date,
          number_of_changes: entry.number_of_changes,
          found_at: entry.found_at,
        };
      }
    }

    return res.json({
      success: true,
      data: { [destination]: byMonth },
      found_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/api/flights/latest] error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/alerts ─────────────────────────────────────────────────────────
// Register a push notification alert (future: APNs / FCM / Web Push)
// Body: { alertId, userId, venueId, sport, region, targetScore, maxPrice,
//         dateFrom, dateTo, pushToken, pushPlatform }
// Response: { success, id, message }
const _alerts = new Map(); // in-memory store (replace with DB later)

const ALERTS_MAX = 10000;

app.post('/api/alerts', (req, res) => {
  const body = req.body || {};
  const { alertId, venueId, sport, targetScore, maxPrice, pushToken, pushPlatform, lat, lon } = body;

  if (typeof alertId !== 'string' || alertId.length === 0 || alertId.length > 128) {
    return res.status(400).json({ success: false, error: 'alertId must be a string of 1-128 chars' });
  }
  if (venueId !== undefined && (typeof venueId !== 'string' || venueId.length > 128)) {
    return res.status(400).json({ success: false, error: 'venueId must be a string of ≤128 chars' });
  }
  if (targetScore !== undefined && (typeof targetScore !== 'number' || targetScore < 0 || targetScore > 100)) {
    return res.status(400).json({ success: false, error: 'targetScore must be a number 0-100' });
  }
  if (maxPrice !== undefined && (typeof maxPrice !== 'number' || maxPrice < 0 || maxPrice > 100000)) {
    return res.status(400).json({ success: false, error: 'maxPrice must be a number 0-100000' });
  }
  if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
    return res.status(400).json({ success: false, error: 'lat must be a number between -90 and 90' });
  }
  if (lon !== undefined && (typeof lon !== 'number' || lon < -180 || lon > 180)) {
    return res.status(400).json({ success: false, error: 'lon must be a number between -180 and 180' });
  }
  if (_alerts.size >= ALERTS_MAX && !_alerts.has(alertId)) {
    return res.status(503).json({ success: false, error: 'Alert capacity reached' });
  }

  const record = {
    alertId,
    venueId: venueId || null,
    sport: typeof sport === 'string' ? sport.slice(0, 32) : null,
    targetScore: targetScore ?? null,
    maxPrice: maxPrice ?? null,
    lat: typeof lat === 'number' ? lat : null,
    lon: typeof lon === 'number' ? lon : null,
    pushToken: typeof pushToken === 'string' ? pushToken.slice(0, 512) : null,
    pushPlatform: typeof pushPlatform === 'string' ? pushPlatform.slice(0, 16) : null,
    registeredAt: new Date().toISOString(),
    lastChecked: null,
    lastScore: null,
    lastFiredAt: null,
    fired: false,
    enabled: true,
  };
  _alerts.set(alertId, record);

  console.log(`[/api/alerts] registered alert ${alertId} for platform=${pushPlatform || 'web'}`);

  return res.status(201).json({
    success: true,
    id: alertId,
    message: 'Alert registered. Conditions checked every 30 minutes.',
  });
});

// ─── GET /api/alerts/:alertId ─────────────────────────────────────────────────
// Check registration status of an alert
app.get('/api/alerts/:alertId', (req, res) => {
  const { alertId } = req.params;
  const record = _alerts.get(alertId);

  if (!record) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  return res.json({
    success: true,
    alert: {
      id: alertId,
      registeredAt: record.registeredAt,
      lastChecked: record.lastChecked,
      fired: record.fired,
      enabled: record.enabled !== false,
    },
  });
});

// ─── DELETE /api/alerts/:alertId ──────────────────────────────────────────────
app.delete('/api/alerts/:alertId', (req, res) => {
  const { alertId } = req.params;
  if (!_alerts.has(alertId)) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
  _alerts.delete(alertId);
  return res.json({ success: true, message: 'Alert removed' });
});

// ─── POST /api/waitlist ───────────────────────────────────────────────────────
// Append an email signup to data/waitlist.jsonl on disk. Zero-cost email capture.
// Body: { email, source? }
const WAITLIST_PATH = process.env.WAITLIST_PATH || path.join(__dirname, 'data', 'waitlist.jsonl');
try { fs.mkdirSync(path.dirname(WAITLIST_PATH), { recursive: true }); } catch {}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/waitlist', (req, res) => {
  const { email, source } = req.body || {};
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, error: 'valid email required' });
  }
  const record = {
    email: email.trim().toLowerCase(),
    source: typeof source === 'string' ? source.slice(0, 64) : null,
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress,
    at: new Date().toISOString(),
  };
  try {
    fs.appendFileSync(WAITLIST_PATH, JSON.stringify(record) + '\n');
    return res.status(201).json({ success: true, message: "You're on the list." });
  } catch (err) {
    console.error('[/api/waitlist] write failed:', err.message);
    return res.status(500).json({ success: false, error: 'failed to save signup' });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    alerts: _alerts.size,
    lastPollAt: _lastPollAt,
  });
});

// ─── Alert polling worker ─────────────────────────────────────────────────────
// Walks _alerts every 30 minutes, fetches Open-Meteo for each registered
// venue's coordinates, scores the next Fri–Mon weekend, and dispatches a push
// when score >= targetScore. Cooldown prevents re-firing within 24h.
//
// Scoring here is intentionally simpler than the in-app scoreWeekend: the goal
// is a triggering signal, not the full UX surface. Once a push lands, the user
// opens the app and sees the canonical score + confidence flag.

const POLL_INTERVAL_MS = 30 * 60 * 1000;
const FIRE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
let _lastPollAt = null;

/** Score a single forecast day (0-100). Category-aware: skiing or beach. */
function scoreDay(daily, idx, category) {
  const tMax = daily.temperature_2m_max?.[idx];
  const precip = daily.precipitation_sum?.[idx] ?? 0;
  const wind = daily.wind_speed_10m_max?.[idx] ?? 0;
  const snow = daily.snowfall_sum?.[idx] ?? 0;
  if (typeof tMax !== 'number') return null;

  if (category === 'skiing') {
    let s = 60;
    if (snow >= 5) s += 30;
    else if (snow >= 1) s += 12;
    if (precip > 5 && snow < 1) s -= 15; // rain on snow
    if (wind > 25) s -= 10;
    if (tMax > 5) s -= 8; // celsius — warm days melt snow
    return Math.max(0, Math.min(100, s));
  }
  // beach (default)
  let s = 40;
  if (tMax >= 28) s += 30;
  else if (tMax >= 24) s += 22;
  else if (tMax >= 20) s += 10;
  if (precip > 5) s -= 25;
  else if (precip > 1) s -= 10;
  if (wind > 25) s -= 15;
  else if (wind > 18) s -= 8;
  return Math.max(0, Math.min(100, s));
}

/** Score the next Fri–Mon window: best 2 consecutive days, capped at the smaller of the pair. */
function scoreWeekendDays(daily, category) {
  if (!daily?.time?.length) return null;
  const today = new Date();
  const dow = today.getUTCDay(); // 0=Sun..6=Sat
  const daysToFri = (5 - dow + 7) % 7;
  if (daysToFri + 3 >= daily.time.length) return null;
  const window = [];
  for (let i = 0; i < 4; i++) {
    const day = scoreDay(daily, daysToFri + i, category);
    if (day === null) return null;
    window.push(day);
  }
  let best = 0;
  for (let i = 0; i < 3; i++) best = Math.max(best, Math.min(window[i], window[i + 1]));
  return best;
}

/**
 * Pluggable push dispatch. Real APNs (iOS via Capacitor token), FCM (Android),
 * and web-push (VAPID) wiring lives here per platform. Until credentials are
 * provisioned, this logs the firing decision so deploys can verify the loop.
 */
async function dispatchPush(record, score) {
  console.log(
    `[push] FIRE alert=${record.alertId} venue=${record.venueId || '(any)'} ` +
    `sport=${record.sport} score=${score} target=${record.targetScore} ` +
    `platform=${record.pushPlatform || 'web'}`
  );
  // Future: switch on record.pushPlatform → call APNs / FCM / web-push libs.
  // The push token in record.pushToken is the per-device address.
}

async function pollAlertsOnce() {
  _lastPollAt = new Date().toISOString();
  if (_alerts.size === 0) return;
  const now = Date.now();
  let polled = 0;
  let fired = 0;
  for (const record of _alerts.values()) {
    if (record.enabled === false) continue;
    if (typeof record.lat !== 'number' || typeof record.lon !== 'number') continue;
    polled++;
    try {
      const url = `https://api.open-meteo.com/v1/forecast`
        + `?latitude=${record.lat}&longitude=${record.lon}`
        + `&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,snowfall_sum`
        + `&timezone=auto&forecast_days=10`
        + `&temperature_unit=celsius&wind_speed_unit=mph`;
      const { status, json } = await fetchJson(url);
      if (status !== 200 || !json?.daily) continue;

      const score = scoreWeekendDays(json.daily, record.sport);
      record.lastChecked = new Date().toISOString();
      record.lastScore = score;
      if (score === null) continue;

      const target = typeof record.targetScore === 'number' ? record.targetScore : 85;
      const sinceFired = record.lastFiredAt
        ? now - new Date(record.lastFiredAt).getTime()
        : Infinity;

      if (score >= target && sinceFired > FIRE_COOLDOWN_MS) {
        record.fired = true;
        record.lastFiredAt = new Date().toISOString();
        fired++;
        await dispatchPush(record, score);
      }
    } catch (err) {
      console.warn(`[poll] alert ${record.alertId} fetch failed:`, err.message);
    }
  }
  if (polled) console.log(`[poll] checked ${polled} alerts, fired ${fired}`);
}

setInterval(() => {
  pollAlertsOnce().catch(err => console.error('[poll] uncaught:', err.message));
}, POLL_INTERVAL_MS);
// First poll 60s after startup so a fresh deploy doesn't wait a full window.
setTimeout(() => {
  pollAlertsOnce().catch(err => console.error('[poll] startup uncaught:', err.message));
}, 60 * 1000);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[proxy] Peakly proxy listening on 127.0.0.1:${PORT}`);
});
