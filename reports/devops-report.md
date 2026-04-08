# DevOps Report — 2026-04-08

**Status: YELLOW**

Two weeks post-soft-launch infrastructure audit. HTTPS live, no secrets in client code, proxy is solid. Three fixable issues dragging this from GREEN: stale cache buster (fixed this run), zero rate limiting on the proxy, and TP_MARKER still a placeholder costing real affiliate revenue.

---

## Live Site Health

| Check | Result |
|-------|--------|
| app.jsx size | **10,976 lines / 1.99 MB** |
| React 18 CDN | ✅ `unpkg.com/react@18` (floating patch) |
| Babel Standalone | ✅ `7.24.7` (pinned) |
| Plausible analytics | ✅ present, uncommented, correct domain |
| Cache buster | ✅ bumped to `v=20260408a` (was stale at `v=20260331a` — 8 days) |
| Service worker version | ✅ bumped to `peakly-20260408` (was `peakly-20260330` — 9 days) |

**Cache buster mismatch was a silent bug.** The April 1 fixes (flight URL fix, airport modal, splash screen upgrade) shipped to GitHub Pages but the `?v=` param in `index.html` was not bumped. Users who visited March 31 or before had browsers serving old app.jsx. Fixed this run.

---

## Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | ✅ `https://peakly-api.duckdns.org` (HTTPS only, no HTTP fallback) |
| Old IP (198.199.80.21) in client | ✅ not found |
| AbortController timeout | ✅ 5s on `fetchTravelpayoutsPrice` |
| Fallback on error | ✅ falls back to BASE_PRICES with "est." label |
| TP_MARKER value | ❌ **"YOUR_TP_MARKER" placeholder** — affiliate deeplinks earn $0 |
| Proxy rate limiting | ❌ **NONE** — any actor can exhaust Travelpayouts quota |
| Alert persistence | ❌ **in-memory only** — process restart wipes all alerts |

---

## Weather & External APIs

- **Open-Meteo calls per page load:** 100 venues × ~1.3 avg calls (some marine) = **~130 calls/load**
- **Free tier:** 10,000 calls/day → allows **~77 simultaneous cold users** before daily cap is hit
- **Current mitigation:** 30-min localStorage TTL cache — reduces repeat-visitor load well, does nothing for cold visits
- **Batching:** top-100 in 2×50 batches, no inter-batch delay on weather (fine at current scale)
- **Risk trigger:** >100 simultaneous new users in a 30-minute window = rate limit hit, weather goes dark

---

## Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ not present — server-side env var only |
| Other tokens/secrets in app.jsx | ✅ clean |
| .gitignore covers .env | ✅ comprehensive |
| .bak files in .gitignore | ✅ `*.bak` covered |
| Sentry DSN | ✅ real DSN in loader + `Sentry.init()` — monitoring is live |
| Proxy CORS | ✅ restricted to `j1mmychu.github.io` + localhost only |
| Proxy auth | ✅ `TRAVELPAYOUTS_TOKEN` from env var, not hardcoded |
| **Proxy rate limiting** | ❌ **NONE — P1** |

No credentials exposed. CORS locked down. The gap is operational: no rate limiting means a bot (or a cost-conscious traveler) can enumerate hundreds of flight routes and exhaust the Travelpayouts quota in minutes, blacking out prices for all real users.

---

## Performance Analysis

| Asset | Estimated Size |
|-------|---------------|
| React 18 production min | ~144 KB |
| ReactDOM 18 production min | ~1.1 MB |
| Babel Standalone 7.24.7 | ~898 KB |
| app.jsx (transpiled at runtime) | ~2.0 MB raw |
| **Total JS loaded cold** | **~4.1 MB** |

**Largest single bottleneck: Babel Standalone.** On a mid-range Android (~300 Mbps), Babel parses and transpiles 2 MB of JSX in 2.8–4.5 seconds. This happens on every cold load. Not a launch blocker at <500 users but will tank Core Web Vitals. LCP will be 4–7 seconds on mobile outside the US.

**Good:** All `<img>` tags use `loading="lazy"` ✅

---

## Cost Projection

| Scale | Infra Cost | Notes |
|-------|-----------|-------|
| Current (~100 MAU) | $6/month | DigitalOcean 1 GB — well under limits |
| 1K MAU | $6/month | Weather cache handles repeat visitors, same droplet |
| 10K MAU | ~$12–18/month | Open-Meteo free tier at risk; droplet may need 2 GB bump |
| 100K MAU | ~$50–80/month | Open-Meteo paid ($50/month); droplet upgrade; CDN needed |

---

## Issues

### P0 — Fix Today

#### ~~Cache buster + SW version stale (8 days)~~ — FIXED THIS RUN

April 1 fixes did not update the cache buster. Users from March 31 were running old JS.

**Applied:**
- `index.html`: `app.jsx?v=20260408a` (was `v=20260331a`)
- `sw.js`: `CACHE_NAME = "peakly-20260408"` (was `peakly-20260330`)

---

### P1 — Fix This Week

#### 1. No rate limiting on proxy `/api/flights/latest`

Zero protection. Any request with valid `origin` + `destination` hits Travelpayouts upstream. A single scraper can fire 1,000 requests in seconds and exhaust daily quota.

**Fix — install and wire `express-rate-limit` on the VPS:**

```bash
# On VPS:
ssh root@198.199.80.21
cd /opt/peakly-proxy
npm install express-rate-limit
```

```js
// proxy.js — add after the require() block at the top:
const rateLimit = require('express-rate-limit');

const flightLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1-minute window
  max: 30,                // 30 req/min per IP — covers a full session (8 airport combos × retries)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — slow down' },
});

// Then change the two route declarations to:
app.get('/api/flights', flightLimiter, async (req, res) => { ... });
app.get('/api/flights/latest', flightLimiter, async (req, res) => { ... });
```

```bash
pm2 restart peakly-proxy
```

**Estimated fix time:** 20 minutes.

---

#### 2. TP_MARKER placeholder — $0 affiliate revenue on flight clicks

`app.jsx` line 5316:
```js
const TP_MARKER = "YOUR_TP_MARKER";
```

When this is a placeholder, `buildFlightUrl()` falls through to a direct Aviasales URL with no tracking. Every flight click earns $0 commission. This is the Travelpayouts affiliate marker, not the API token — it goes in the client.

**Fix:**
1. Log into https://tp.media dashboard → get your marker ID
2. Edit `app.jsx` line 5316:
```js
const TP_MARKER = "YOUR_REAL_MARKER_ID";
```
3. Bump cache buster to `v=20260408b` and push

**Estimated fix time:** 10 minutes (Jack action required for marker retrieval).

---

#### 3. Alerts stored in-memory — wiped on every restart

`proxy.js` line 196: `const _alerts = new Map()` — entirely in RAM. Every PM2 restart, process crash, or VPS reboot silently deletes all registered alerts. Users who set a "notify me when Pipeline hits 90" alert lose it with no feedback.

**Fix — persist to a flat JSON file (no DB needed at this scale):**

```js
// proxy.js — replace the _alerts declaration and add persistence:
const fs = require('fs');
const ALERTS_FILE = '/opt/peakly-proxy/alerts.json';

let _alerts;
try {
  _alerts = new Map(Object.entries(JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'))));
  console.log(`[alerts] Loaded ${_alerts.size} alerts from disk`);
} catch {
  _alerts = new Map();
}

function saveAlerts() {
  try {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(Object.fromEntries(_alerts)));
  } catch (e) {
    console.error('[alerts] Failed to persist:', e.message);
  }
}

// Then call saveAlerts() after every _alerts.set() and _alerts.delete() call.
```

**Estimated fix time:** 30 minutes.

---

### P2 — Fix This Sprint

#### 1. Open-Meteo rate limit exposure at scale

At 77 simultaneous cold-loading users the 10K/day free tier is gone. A single Reddit front-page post can spike 500+ cold loads in minutes. Weather goes dark for everyone.

**Fix — add a server-side weather cache route to the proxy:**
```js
// GET /api/weather?lat=X&lon=Y
// Proxies Open-Meteo, caches response in memory for 30 minutes per lat/lon.
// Reduces 130 client-side calls per page load to 1 server call per unique coordinate per 30 min.
```
This is ~2 hours of work. Queue it before any Reddit/influencer push.

#### 2. React 18 version pin is floating

`react@18` resolves to whatever latest 18.x.x npm has. Unlikely to break, but a silent regression is possible.

**Fix:**
```html
<!-- index.html lines 80–81 — pin to specific version: -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

#### 3. Babel Standalone parse time

2 MB of JSX transpiled in-browser on every cold load. 4–7 second LCP on mid-range mobile. Not fixable without a build step. Flag for post-1K-user migration to Vite.

#### 4. Plausible domain update pending

`data-domain="j1mmychu.github.io"` is correct for now. Once `peakly.app` is live, update to `data-domain="peakly.app"` and add the domain in the Plausible dashboard. Don't change before the domain is active.

---

## What Breaks First at Scale

**Open-Meteo is the first domino.** Today Peakly fires ~130 API calls per cold page load. At 77 simultaneous cold-loading users the 10K/day free tier is exhausted — in minutes during a Reddit spike. The localStorage cache helps returning visitors only. A single r/surfing front-page post that drives 500 cold visitors in an hour wipes out weather data for everyone for the remainder of the day. **The fix is a server-side weather proxy with 30-minute coordinate-level caching on the existing DigitalOcean droplet — ~2 hours to build. Ship this before any viral distribution push.**

---

## Fixes Applied This Run

| File | Change |
|------|--------|
| `index.html` | Cache buster: `v=20260331a` → `v=20260408a` |
| `sw.js` | Service worker: `peakly-20260330` → `peakly-20260408` |
| `reports/devops-report.md` | This report |

---

*Generated: 2026-04-08 | DevOps agent*
