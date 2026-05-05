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
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ─── GET /api/flights ─────────────────────────────────────────────────────────
// Calls Travelpayouts v2/prices/month-matrix
// Query params: origin (IATA), destination (IATA),
//   optional depart_date (YYYY-MM-DD), optional return_date (YYYY-MM-DD)
//
// Without dates: cheapest fare per month (legacy behavior).
// With depart_date: filter month-matrix to entries on that exact depart date.
//   When return_date also given, filter to that round-trip too. Picks cheapest
//   matching entry. Used for weekend-specific pricing — answers "what does
//   THIS Fri-Mon trip actually cost" instead of "what's the cheapest fare
//   anyone found in this month."
//
// Response: { success, data: { [destination]: { [YYYY-MM]: { price, ... } } } }
app.get('/api/flights', async (req, res) => {
  const { origin, destination, depart_date, return_date } = req.query;

  if (!IATA_RE.test(origin || '') || !IATA_RE.test(destination || '')) {
    return res.status(400).json({ success: false, error: 'origin and destination must be 3-letter IATA codes' });
  }
  if (depart_date && !DATE_RE.test(depart_date)) {
    return res.status(400).json({ success: false, error: 'depart_date must be YYYY-MM-DD' });
  }
  if (return_date && !DATE_RE.test(return_date)) {
    return res.status(400).json({ success: false, error: 'return_date must be YYYY-MM-DD' });
  }

  // When depart_date is specified, query the month containing that date.
  // Otherwise default to current/next month.
  const month = depart_date ? `${depart_date.slice(0, 7)}-01` : currentMonthParam();
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

    const prices = Array.isArray(json.data) ? json.data : [];

    // Specific-date branch: filter to the requested depart (and optionally return)
    if (depart_date) {
      const matches = prices.filter(e =>
        typeof e.price === 'number' && e.price > 0 &&
        e.depart_date === depart_date &&
        (!return_date || e.return_date === return_date)
      );
      if (matches.length === 0) {
        return res.json({
          success: true,
          data: { [destination]: {} },
          found_at: new Date().toISOString(),
          mode: 'specific',
          requested: { depart_date, return_date: return_date || null },
        });
      }
      const cheapest = matches.reduce((a, b) => a.price <= b.price ? a : b);
      const dateKey = depart_date.slice(0, 7); // keep month-keyed shape for client compat
      return res.json({
        success: true,
        data: { [destination]: { [dateKey]: {
          price: cheapest.price,
          depart_date: cheapest.depart_date,
          return_date: cheapest.return_date || null,
          found_at: cheapest.found_at || null,
        }}},
        found_at: new Date().toISOString(),
        mode: 'specific',
      });
    }

    // Legacy month-cheapest branch
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

// ─── Open-Meteo proxy with shared cache ──────────────────────────────────────
// Without this, every cold-start user fetches ~150 venues × 2 calls (weather +
// marine for beach) directly against Open-Meteo. A Reddit spike means N×300
// fetches with no cross-user reuse. Shared in-memory cache here means the
// hot fetch happens once per (lat,lon) per 2hr window — N users → 1 upstream.
//
// Coords are rounded to 2 decimals (~1.1km grid) to share cache across nearby
// venues without losing meaningful resolution. TTL 2 hours matches client.
// Cache evicts oldest entry on overflow; cap is generous for 150-venue catalog.
const WX_TTL_MS = 2 * 60 * 60 * 1000;
const WX_CACHE_MAX = 4000;
const _wxCache = new Map(); // key → { data, ts }

const COORD_RE = /^-?\d{1,3}(\.\d+)?$/;

function _wxCacheGet(key) {
  const entry = _wxCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > WX_TTL_MS) { _wxCache.delete(key); return null; }
  return entry.data;
}
function _wxCacheSet(key, data) {
  if (_wxCache.size >= WX_CACHE_MAX) {
    // Evict oldest entry (Map preserves insertion order)
    const firstKey = _wxCache.keys().next().value;
    if (firstKey) _wxCache.delete(firstKey);
  }
  _wxCache.set(key, { data, ts: Date.now() });
}

// In-flight request dedupe: 1000 simultaneous users hitting the same uncached
// (lat,lon) shouldn't trigger 1000 upstream calls. Coalesce to one.
const _wxInflight = new Map(); // key → Promise

function _round2(s) {
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n.toFixed(2);
}

async function _proxyWeather(req, res, kind) {
  const { lat, lon } = req.query;
  if (!COORD_RE.test(lat || '') || !COORD_RE.test(lon || '')) {
    return res.status(400).json({ success: false, error: 'lat and lon required, decimal degrees' });
  }
  const latR = _round2(lat), lonR = _round2(lon);
  if (latR == null || lonR == null) {
    return res.status(400).json({ success: false, error: 'lat/lon must parse as numbers' });
  }
  const cacheKey = `${kind}_${latR}_${lonR}`;
  const cached = _wxCacheGet(cacheKey);
  if (cached) {
    res.setHeader('X-Peakly-Cache', 'hit');
    return res.json({ success: true, data: cached, cached: true });
  }

  // Coalesce in-flight fetches for the same (lat,lon)
  let inflight = _wxInflight.get(cacheKey);
  if (!inflight) {
    inflight = (async () => {
      const url = kind === 'weather'
        ? `https://api.open-meteo.com/v1/forecast?latitude=${latR}&longitude=${lonR}`
          + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,`
          + `snow_depth_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,`
          + `uv_index_max,weather_code,precipitation_probability_max,sunshine_duration,`
          + `rain_sum,showers_sum,relative_humidity_2m_max,cloud_cover_max`
          + `&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=auto`
        : `https://marine-api.open-meteo.com/v1/marine?latitude=${latR}&longitude=${lonR}`
          + `&daily=ocean_temperature_max&forecast_days=7&timezone=auto`;
      const { status, json } = await fetchJson(url);
      if (status === 429 || status >= 500 || (json && json.error)) {
        throw new Error(`upstream ${status} ${json?.reason || ''}`);
      }
      _wxCacheSet(cacheKey, json);
      return json;
    })().finally(() => _wxInflight.delete(cacheKey));
    _wxInflight.set(cacheKey, inflight);
  }

  try {
    const data = await inflight;
    res.setHeader('X-Peakly-Cache', 'miss');
    return res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error(`[/api/${kind}] error:`, err.message);
    return res.status(502).json({ success: false, error: err.message });
  }
}

app.get('/api/weather', (req, res) => _proxyWeather(req, res, 'weather'));
app.get('/api/marine',  (req, res) => _proxyWeather(req, res, 'marine'));

// ─── POST /api/alerts ─────────────────────────────────────────────────────────
// Register a push notification alert (future: APNs / FCM / Web Push)
// Body: { alertId, userId, venueId, sport, region, targetScore, maxPrice,
//         dateFrom, dateTo, pushToken, pushPlatform }
// Response: { success, id, message }
const _alerts = new Map(); // in-memory store (replace with DB later)

const ALERTS_MAX = 10000;

app.post('/api/alerts', (req, res) => {
  const body = req.body || {};
  const { alertId, venueId, sport, targetScore, maxPrice, pushToken, pushPlatform } = body;

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
  if (_alerts.size >= ALERTS_MAX && !_alerts.has(alertId)) {
    return res.status(503).json({ success: false, error: 'Alert capacity reached' });
  }

  const record = {
    alertId,
    venueId: venueId || null,
    sport: typeof sport === 'string' ? sport.slice(0, 32) : null,
    targetScore: targetScore ?? null,
    maxPrice: maxPrice ?? null,
    pushToken: typeof pushToken === 'string' ? pushToken.slice(0, 512) : null,
    pushPlatform: typeof pushPlatform === 'string' ? pushPlatform.slice(0, 16) : null,
    registeredAt: new Date().toISOString(),
    lastChecked: null,
    fired: false,
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
    wx_cache_size: _wxCache.size,
    wx_inflight: _wxInflight.size,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[proxy] Peakly proxy listening on 127.0.0.1:${PORT}`);
});
