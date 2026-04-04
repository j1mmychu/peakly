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

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
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

// ─── GET /api/flights ─────────────────────────────────────────────────────────
// Calls Travelpayouts v2/prices/month-matrix
// Query params: origin (IATA), destination (IATA)
// Response: { success, data: { [destination]: { [YYYY-MM]: { price } } }, found_at }
app.get('/api/flights', async (req, res) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ success: false, error: 'origin and destination are required' });
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
