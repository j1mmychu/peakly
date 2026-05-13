'use strict';

const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const { makeStore, makeDispatcher, startWorker } = require('./alerts-worker');

// web-push is optional at boot — server still starts (and registration still
// works) without it, just no notifications are dispatched. Lets us deploy
// without the dep installed and discover the gap from /health.
let webpush = null;
try { webpush = require('web-push'); }
catch { console.warn('[proxy] web-push not installed — push dispatch disabled'); }

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

// ─── Strike-alerts store + push dispatch ──────────────────────────────────────
// POST /api/alerts registers an alert. The polling worker (alerts-worker.js)
// sweeps every 30 min, computes weekend score, and fires push when conditions
// hit the user's targetScore. Web push uses VAPID; iOS Capacitor sends an
// APNs token (delivery is currently logged-only — APNs cert wiring is ops).

const ALERTS_PATH = process.env.ALERTS_PATH || path.join(__dirname, 'data', 'alerts.json');
const _alertsStore = makeStore(ALERTS_PATH);
const ALERTS_MAX = 10000;

// VAPID keys — load from env. For first-time setup, the operator runs
// `npx web-push generate-vapid-keys` once and pastes the pair into systemd
// env. We do NOT auto-generate at boot: the public key would change on every
// restart and invalidate every existing subscription.
const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT     || 'mailto:jjciluzzi@gmail.com';

if (webpush && (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY)) {
  console.warn('[proxy] VAPID keys missing — push dispatch will no-op until VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are set.');
  console.warn('[proxy] Generate with: npx web-push generate-vapid-keys');
}

const _dispatcher = makeDispatcher({
  webpush,
  vapidPublicKey: VAPID_PUBLIC_KEY,
  vapidPrivateKey: VAPID_PRIVATE_KEY,
  vapidSubject: VAPID_SUBJECT,
});

startWorker({ store: _alertsStore, dispatcher: _dispatcher });

// ─── GET /api/push/vapid-public-key ───────────────────────────────────────────
// Client calls this once before subscribing to web push.
app.get('/api/push/vapid-public-key', (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(503).json({ success: false, error: 'VAPID not configured' });
  }
  res.json({ success: true, publicKey: VAPID_PUBLIC_KEY });
});

// ─── POST /api/alerts ─────────────────────────────────────────────────────────
// Register a push notification alert. Body:
//   alertId          required — stable client-generated id (e.g. timestamp)
//   venueId          required — venue identifier
//   venueName        optional — for nicer push body text
//   category         required — "skiing" | "beach" (drives marine fetch)
//   lat, lon         required — venue coordinates (server fetches Open-Meteo)
//   lateSeason       optional — bool, ski algorithm flag
//   poolPrimary      optional — bool, beach algorithm flag
//   sport            optional — same as category, kept for backwards compat
//   targetScore      required — 0..100, fire when scoreWeekend >= this
//   maxPrice         optional — currently informational; flight gate TBD
//   dateFrom, dateTo optional — ISO date strings, alert silenced after dateTo
//   pushSubscription optional — full PushSubscription JSON for web push
//   pushToken        optional — APNs/FCM token for native (Capacitor)
//   pushPlatform     optional — "web" | "ios" | "android"
app.post('/api/alerts', (req, res) => {
  const body = req.body || {};
  const {
    alertId, venueId, venueName, category, lat, lon, lateSeason, poolPrimary,
    sport, targetScore, maxPrice, dateFrom, dateTo,
    pushSubscription, pushToken, pushPlatform,
  } = body;

  if (typeof alertId !== 'string' || alertId.length === 0 || alertId.length > 128) {
    return res.status(400).json({ success: false, error: 'alertId must be a string of 1-128 chars' });
  }
  if (typeof venueId !== 'string' || venueId.length === 0 || venueId.length > 128) {
    return res.status(400).json({ success: false, error: 'venueId required (≤128 chars)' });
  }
  if (typeof lat !== 'number' || typeof lon !== 'number' || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ success: false, error: 'lat/lon required as valid numeric coordinates' });
  }
  const cat = typeof category === 'string' ? category : (typeof sport === 'string' ? sport : null);
  if (cat !== 'skiing' && cat !== 'beach') {
    return res.status(400).json({ success: false, error: 'category must be "skiing" or "beach"' });
  }
  if (typeof targetScore !== 'number' || targetScore < 0 || targetScore > 100) {
    return res.status(400).json({ success: false, error: 'targetScore must be a number 0-100' });
  }
  if (maxPrice !== undefined && maxPrice !== null && (typeof maxPrice !== 'number' || maxPrice < 0 || maxPrice > 100000)) {
    return res.status(400).json({ success: false, error: 'maxPrice must be a number 0-100000' });
  }
  if (pushSubscription !== undefined && pushSubscription !== null) {
    if (typeof pushSubscription !== 'object' || typeof pushSubscription.endpoint !== 'string'
        || !pushSubscription.keys || typeof pushSubscription.keys.p256dh !== 'string'
        || typeof pushSubscription.keys.auth !== 'string') {
      return res.status(400).json({ success: false, error: 'pushSubscription must be a valid PushSubscription JSON' });
    }
    if (pushSubscription.endpoint.length > 1024) {
      return res.status(400).json({ success: false, error: 'pushSubscription.endpoint too long' });
    }
  }
  if (_alertsStore.size() >= ALERTS_MAX && !_alertsStore.has(alertId)) {
    return res.status(503).json({ success: false, error: 'Alert capacity reached' });
  }

  const existing = _alertsStore.get(alertId);
  const record = {
    alertId,
    venueId,
    venueName: typeof venueName === 'string' ? venueName.slice(0, 96) : null,
    category: cat,
    lat,
    lon,
    lateSeason: !!lateSeason,
    poolPrimary: !!poolPrimary,
    sport: typeof sport === 'string' ? sport.slice(0, 32) : cat,
    targetScore,
    maxPrice: typeof maxPrice === 'number' ? maxPrice : null,
    dateFrom: typeof dateFrom === 'string' ? dateFrom.slice(0, 24) : null,
    dateTo: typeof dateTo === 'string' ? dateTo.slice(0, 24) : null,
    pushSubscription: pushSubscription || existing?.pushSubscription || null,
    pushToken: typeof pushToken === 'string' ? pushToken.slice(0, 512) : (existing?.pushToken || null),
    pushPlatform: typeof pushPlatform === 'string' ? pushPlatform.slice(0, 16) : (existing?.pushPlatform || 'web'),
    enabled: true,
    registeredAt: existing?.registeredAt || new Date().toISOString(),
    lastChecked: existing?.lastChecked || null,
    lastFiredAt: existing?.lastFiredAt || null,
    lastScore: existing?.lastScore || null,
    lastConfidence: existing?.lastConfidence || null,
  };
  _alertsStore.set(alertId, record);

  console.log(`[/api/alerts] ${existing ? 'updated' : 'registered'} ${alertId} for ${cat} venue ${venueId} target=${targetScore}`);

  return res.status(existing ? 200 : 201).json({
    success: true,
    id: alertId,
    message: 'Alert registered. Conditions checked every 30 minutes.',
  });
});

// ─── GET /api/alerts/:alertId ─────────────────────────────────────────────────
app.get('/api/alerts/:alertId', (req, res) => {
  const record = _alertsStore.get(req.params.alertId);
  if (!record) return res.status(404).json({ success: false, error: 'Alert not found' });

  return res.json({
    success: true,
    alert: {
      id: record.alertId,
      venueId: record.venueId,
      registeredAt: record.registeredAt,
      lastChecked: record.lastChecked,
      lastScore: record.lastScore,
      lastConfidence: record.lastConfidence,
      lastFiredAt: record.lastFiredAt,
      enabled: record.enabled !== false,
    },
  });
});

// ─── DELETE /api/alerts/:alertId ──────────────────────────────────────────────
app.delete('/api/alerts/:alertId', (req, res) => {
  if (!_alertsStore.delete(req.params.alertId)) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }
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
    alerts: _alertsStore.size(),
    push: {
      vapidConfigured: Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
      webpushAvailable: Boolean(webpush),
    },
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[proxy] Peakly proxy listening on 127.0.0.1:${PORT}`);
});
