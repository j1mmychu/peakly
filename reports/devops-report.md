# Peakly DevOps Report — 2026-04-22

**Overall Status: YELLOW**
Cache busters were 5 days stale — bumped this run. A silent regression in `fetchInitialWeather` was leaving beach water-temp scoring dead on initial page load (tanning venues never got marine data in the first 100-venue batch) — fixed this run. Open-Meteo rate-limit time bomb is the only unresolved structural risk and has been P1 for 5 days.

---

## Checks Run

| Area | Result |
|------|--------|
| Live site health | YELLOW → **FIXED** — cache busters bumped to 20260422a |
| Flight proxy (HTTPS) | GREEN — `https://peakly-api.duckdns.org`, 5s timeout + AbortController correct |
| Open-Meteo API usage | YELLOW — rate-limit risk at viral traffic, no server-side cache yet |
| Security audit | GREEN — no exposed tokens, Sentry live, `.gitignore` covers all secrets |
| Travelpayouts token | GREEN — server-side only (`process.env`), `TP_MARKER` in client is affiliate marker (not secret) |
| Performance | RED — ~2.1MB raw JS cold load, Babel Standalone dominates |
| CDN SRI hashes | RED — zero integrity attributes on React, ReactDOM, Babel, Sentry scripts |
| Lazy image loading | GREEN — `loading="lazy"` on all `<img>` tags |
| tanning marine fetch | YELLOW → **FIXED** — `fetchInitialWeather` now fetches marine for tanning venues |
| Alerts polling worker | RED — endpoint registers alerts but no background worker fires push notifications |
| Sentry DSN | GREEN — DSN populated in both `app.jsx:8` and `index.html:77` |
| CORS | GREEN — allowlist covers `j1mmychu.github.io`, `peakly.app`, localhost |
| `.gitignore` | GREEN — covers `.env`, `*.key`, `*.pem`, `*.p8`, `node_modules/`, `.claude/` |
| Plausible analytics | GREEN — present, uncommented, domain `j1mmychu.github.io` (update to `peakly.app` when domain live) |

---

## Fixes Applied This Run

### 1. Cache Busters Bumped (20260417a → 20260422a)

**Problem:** Cache busters hadn't been bumped in 5 days (last code push April 17). SW-cached users would not pick up future code changes.

```
index.html: app.jsx?v=20260417a → app.jsx?v=20260422a
sw.js: CACHE_NAME "peakly-20260417" → "peakly-20260422"
```

### 2. Beach Marine Fetch Regression Fixed

**Problem:** `fetchInitialWeather` (the batch that runs on app load for the first 100 venues) only called `fetchMarine` for `category === "surfing"`. Beach/tanning venues never had marine data (water temp, wave height) on initial load — only when a user opened a venue's detail sheet. Beach cards showed stale/empty water conditions on the main Explore screen.

The fix from 2026-04-12 ("Beach marine data was NEVER FETCHED") patched `fetchVenueWeather` (single-venue lazy fetch at `app.jsx:6730`) but missed the initial batch path at `app.jsx:6751`.

**Fix applied at `app.jsx:6751`:**
```js
// Before
const needsMarine = v.category === "surfing";

// After
const needsMarine = v.category === "surfing" || v.category === "tanning";
```

**Cost:** Adds ~20–25 additional `fetchMarine` calls per cold load (beach venues in top 100). Still well within Open-Meteo free tier per session.

---

## P0 — Critical (Fix Today)

**None.**

---

## P1 — High (Fix This Week)

### Open-Meteo Rate Limit: Viral Traffic Will Break Core Feature

**Day 5 of this being P1. Still not shipped.**

- 100 venues × ~1.7 avg API calls (weather + marine for surf/tanning) = ~170 calls/cold session
- Open-Meteo free tier: 10,000 calls/day
- **Hard ceiling: ~58 simultaneous cold sessions** before quota burns for the day
- Any r/surfing or r/skiing post driving 60 users in the same hour kills conditions for all remaining users that day
- Result: condition scores show stale or missing — the app's entire value proposition disappears silently

**Fix — add `/api/weather` to `server/proxy.js` with 30-min in-memory cache:**

```javascript
// Add to server/proxy.js after the rate limiter section

const weatherCache = new Map();
const WEATHER_TTL = 30 * 60 * 1000;

function evictWeatherCache() {
  const cutoff = Date.now() - WEATHER_TTL * 2;
  for (const [k, v] of weatherCache) if (v.ts < cutoff) weatherCache.delete(k);
}

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type, params } = req.query;
  if (!lat || !lon || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
    return res.status(400).json({ error: 'lat and lon required' });
  }
  const cacheKey = `${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)},${type || 'forecast'}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < WEATHER_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached.data);
  }
  const base = type === 'marine'
    ? 'https://marine-api.open-meteo.com/v1/marine'
    : 'https://api.open-meteo.com/v1/forecast';
  const url = params
    ? `${base}?latitude=${lat}&longitude=${lon}&${params}`
    : `${base}?latitude=${lat}&longitude=${lon}`;
  try {
    const upstream = await fetchJson(url);
    if (upstream.status !== 200) return res.status(upstream.status).json(upstream.json);
    weatherCache.set(cacheKey, { data: upstream.json, ts: Date.now() });
    if (weatherCache.size > 2000) evictWeatherCache();
    res.setHeader('X-Cache', 'MISS');
    return res.json(upstream.json);
  } catch (err) {
    return res.status(502).json({ error: 'upstream weather error', detail: err.message });
  }
});
```

Then in `app.jsx`, update `fetchWeather` and `fetchMarine` to call `${FLIGHT_PROXY}/api/weather?type=forecast&lat=...&lon=...&params=...` and `${FLIGHT_PROXY}/api/weather?type=marine&lat=...&lon=...&params=...` respectively.

**Estimated fix time: 2 hours.**

---

## P2 — Medium (Fix This Sprint)

### 1. Zero SRI Hashes on CDN Scripts — Supply Chain Risk

4 scripts loaded with no `integrity=` attribute. If `unpkg.com` is compromised, every Peakly user executes attacker JS.

```html
<!-- Current — no integrity verification -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<script src='https://js.sentry-cdn.com/9416b032a46681d74645b056fcb08eb7.min.js' crossorigin='anonymous'></script>
```

Sentry CDN URL is project-scoped and rotates — SRI won't work on it. The other three can be locked.

**Fix — generate hashes and add `integrity` attributes:**

```bash
# Run these locally, paste output into index.html
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH>" crossorigin="anonymous"></script>
```

**Note:** Babel Standalone uses `eval()` for JSX transpilation, so a CSP `script-src` directive would require `'unsafe-eval'` anyway. SRI is safe to add; a strict `script-src` CSP is not without a build step.

**Estimated fix time: 30 minutes.**

### 2. Alerts Push Worker Missing

`POST /api/alerts` registers alerts into the in-memory `_alerts` Map. No worker ever reads it. Zero push notifications fire. This feature is completely non-functional.

**Minimum viable fix** (add to `proxy.js` — gets delivery working, full scoring port is follow-up):

```javascript
// npm install web-push on VPS first
const webpush = require('web-push');
webpush.setVapidDetails(
  'mailto:jjciluzzi@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function pollAlerts() {
  for (const [alertId, alert] of _alerts) {
    if (!alert.pushSubscription) continue;
    try {
      // Minimal liveness check — full score comparison requires porting scoreVenue to server
      await webpush.sendNotification(
        alert.pushSubscription,
        JSON.stringify({
          title: 'Peakly Alert',
          body: `Conditions may be right at ${alert.venueTitle}. Check now.`,
          venueId: alert.venueId,
        })
      );
    } catch (e) {
      console.error(`[alerts] push failed ${alertId}:`, e.message);
      if (e.statusCode === 410) _alerts.delete(alertId); // expired subscription
    }
  }
}

setInterval(pollAlerts, 15 * 60 * 1000);
```

**Estimated fix time: 30 min (stub delivery) / 3–4 hours (full scoreVenue port to server).**

### 3. In-Memory State Dies on VPS Restart

`_alerts` Map is process-memory only. Any `pm2 restart` (every deploy) silently drops all registered alerts.

**Fix — persist to disk using the same pattern as `waitlist.jsonl`:**

```javascript
const ALERTS_PATH = process.env.ALERTS_PATH || path.join(__dirname, 'data', 'alerts.json');

function persistAlerts() {
  try {
    fs.writeFileSync(ALERTS_PATH, JSON.stringify([..._alerts.entries()]));
  } catch (e) { console.error('[alerts] persist failed:', e.message); }
}

function loadAlerts() {
  try {
    if (fs.existsSync(ALERTS_PATH)) {
      JSON.parse(fs.readFileSync(ALERTS_PATH, 'utf8')).forEach(([k, v]) => _alerts.set(k, v));
      console.log(`[alerts] loaded ${_alerts.size} alerts from disk`);
    }
  } catch (e) { console.error('[alerts] load failed:', e.message); }
}
// Call loadAlerts() at startup
// Call persistAlerts() after every _alerts.set() and _alerts.delete()
```

**Estimated fix time: 30 minutes.**

### 4. Plausible Domain Will Need Update at Launch

`index.html:37` has `data-domain="j1mmychu.github.io"`. When `peakly.app` goes live, Plausible tracks zero traffic on the real domain.

**Fix when domain is live:**
```html
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

**Estimated fix time: 2 minutes.**

---

## Performance Analysis

| Asset | Raw Size | Approx Gzipped |
|-------|----------|----------------|
| Babel Standalone 7.24.7 | ~1,470 KB | ~390 KB |
| app.jsx | 474 KB | ~110 KB |
| React + ReactDOM 18.3.1 | ~143 KB | ~46 KB |
| Sentry SDK | ~80 KB | ~26 KB |
| **Total JS** | **~2,167 KB** | **~572 KB** |

**Biggest bottleneck: Babel Standalone.** It's 68% of raw JS payload and transpiles all 474KB of `app.jsx` synchronously on every cold load. On a mid-range mobile device this is 800ms–1.5s of parse+compile before React renders anything. The splash screen covers this perceptually.

No short-term fix without a build step — this is the architectural price of no-build-step JSX. Don't touch this until 10K+ MAU where load time measurably kills retention.

**Images:** `loading="lazy"` on all `<img>` tags. All Unsplash CDN with `?w=800&h=600&fit=crop`. Solid.

---

## Cost Projection

| Scale | GitHub Pages | VPS (proxy) | Est. Monthly |
|-------|-------------|-------------|-------------|
| Current (<100 MAU) | Free | $6/mo (DO 1GB) | **$6/mo** |
| 1K MAU | Free | $6/mo | **$6/mo** |
| 10K MAU | Free | $12/mo (DO 2GB, weather proxy critical) | **$12/mo** |
| 100K MAU | Free* | $40–48/mo (DO 4GB × 2 + Caddy LB) | **~$48/mo** |

*GitHub Pages has a 100GB/month bandwidth soft limit. 100K MAU × ~2.5MB/session cold = ~250GB. Most sessions will be SW-cached after first visit; realistic bandwidth is 30–60GB. Should be fine; monitor.

**Optimization opportunities:**
- Weather proxy (P1) eliminates Open-Meteo scaling cost entirely — 231 venues warm-cached on server after first 231 calls, every subsequent user pays zero API calls
- VPS has no monitoring. Add `pm2 monit` or Grafana Cloud (free tier) before any marketing push
- `server/data/` has no backup. `waitlist.jsonl` and future `alerts.json` are on single-disk VPS with no redundancy. Add weekly cron: `cp server/data/waitlist.jsonl ~/backups/waitlist-$(date +%F).jsonl`

---

## What Breaks First at Scale

**Open-Meteo rate limit is the single-point-of-failure before anything else.** At ~58 cold sessions burning the daily quota, a single r/surfing post with 100 upvotes kills condition scores for every user for the rest of the day — silently. No error message, just empty/stale scores. Users assume the app is broken and bounce. The fix is entirely server-side (2 hours), has been P1 for 5 days, and needs to ship before any marketing push.

After that: the in-memory `_alerts` Map on the $6 droplet dies on every deploy restart. At any non-trivial alert usage, users will start noticing their alerts disappearing. Fix is 30 minutes.
