'use strict';

const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

// ─── Rate limiting ────────────────────────────────────────────────────────────
// 60 requests per minute per IP on all /api/ routes — prevents Travelpayouts quota exhaustion
// and basic DDoS. Install: npm install express-rate-limit
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
  app.use('/api/', rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, try again in a minute.' },
  }));
} catch (e) {
  console.warn('[proxy] express-rate-limit not installed — rate limiting disabled. Run: npm install express-rate-limit');
}

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

  if (!origin || !destination) {
    return res.status(400).json({ success: false, error: 'origin and destination are required' });
  }
  if (!IATA_RE.test(origin) || !IATA_RE.test(destination)) {
    return res.status(400).json({ success: false, error: 'origin and destination must be 3-letter uppercase IATA codes (e.g. LAX)' });
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

  if (!origin || !destination) {
    return res.status(400).json({ success: false, error: 'origin and destination are required' });
  }
  if (!IATA_RE.test(origin) || !IATA_RE.test(destination)) {
    return res.status(400).json({ success: false, error: 'origin and destination must be 3-letter uppercase IATA codes (e.g. LAX)' });
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

// ─── POST /api/waitlist ───────────────────────────────────────────────────────
// Appends email to server/data/waitlist.jsonl
// Body: { email }
// Response: { success, message }
const fs = require('fs');
const path = require('path');
const WAITLIST_FILE = path.join(__dirname, 'data', 'waitlist.jsonl');

app.post('/api/waitlist', (req, res) => {
  const { email } = req.body || {};
  if (!email || !email.includes('@') || email.length > 254) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }
  try {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    const entry = JSON.stringify({ email: email.trim().toLowerCase(), joinedAt: new Date().toISOString() });
    fs.appendFileSync(WAITLIST_FILE, entry + '\n', 'utf8');
    console.log(`[/api/waitlist] +1 signup: ${email}`);
    return res.status(201).json({ success: true, message: "You're on the list!" });
  } catch (err) {
    console.error('[/api/waitlist] write error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── POST /api/alerts ─────────────────────────────────────────────────────────
// Register a push notification alert (future: APNs / FCM / Web Push)
// Body: { alertId, userId, venueId, sport, region, targetScore, maxPrice,
//         dateFrom, dateTo, pushToken, pushPlatform }
// Response: { success, id, message }
const _alerts = new Map(); // in-memory store (replace with DB later)

app.post('/api/alerts', (req, res) => {
  const body = req.body || {};
  const { alertId, pushToken, pushPlatform } = body;

  if (!alertId) {
    return res.status(400).json({ success: false, error: 'alertId is required' });
  }

  const record = {
    ...body,
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

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), alerts: _alerts.size });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[proxy] Peakly proxy listening on 127.0.0.1:${PORT}`);
});
