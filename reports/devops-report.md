# Peakly DevOps Report — 2026-04-26

**Status: YELLOW**
No P0 blockers. Two P1s that need fixing before Reddit launch. Three P2s to handle this sprint.

---

## 1. Live Site Health

| Metric | Value | Status |
|--------|-------|--------|
| app.jsx lines | 7,150 | OK |
| app.jsx size | 467,963 bytes (~457KB) | OK |
| React version | 18.3.1 (pinned) | OK |
| ReactDOM version | 18.3.1 (pinned) | OK |
| Babel Standalone | 7.24.7 | STALE — see P1 |
| Plausible analytics | Present, active | OK |
| Cache buster (index.html) | `?v=20260422a` | STALE — see P1 |
| Cache buster (sw.js) | `peakly-20260422` | STALE — see P1 |
| Venue count | 233 (CLAUDE.md says 229-231 — drift) | MINOR |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old IP (`104.131.82.242`) | Not present in app.jsx ✅ |
| Fetch timeout | 5,000ms AbortController ✅ |
| Retry logic | Exponential backoff, 2 retries ✅ |
| Token in client code | Not found ✅ |
| Rate limiter | 60 req/min/IP (in-memory) ⚠️ |

Proxy is solid. One gap: the rate limiter and the `_alerts` Map are both in-memory only. Every proxy restart zeroes them out. Not a crash risk at current scale, but it's a lie to tell users their alerts survive a server reboot.

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo weather | `api.open-meteo.com/v1` — free tier, no auth |
| Open-Meteo marine | `marine-api.open-meteo.com/v1/marine` — free tier |
| Batch size | 50 venues per batch |
| Retry on 429/5xx | Present ✅ |
| Cache TTL | 2hr fetch threshold, 6hr hard eviction ✅ |

**RATE LIMIT MATH:** 233 venues × (1 weather call + ~1 marine call for surf/beach) ≈ 363 API calls per full session. Open-Meteo free tier: ~10,000 calls/day. Break-even: **27 DAU** (~800 MAU). This is closer than it looks.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | Not found ✅ |
| Other secrets in app.jsx | Not found ✅ |
| .gitignore covers .env | Yes ✅ |
| Sentry DSN configured | Yes — populated in both index.html and app.jsx ✅ |
| SRI hashes on CDN scripts | Missing ⚠️ (known, P2) |
| CSP meta tag | Missing ⚠️ (known, P2) |
| CORS: localhost origins in prod proxy | Present ⚠️ (see P2) |

Sentry DSN is public in the HTML — intentional for client-side error capture. The DSN is write-only from the browser side; it does not grant read access to your project. This is standard practice, not a vulnerability.

---

## P1 — Fix Before Launch

### P1-A: Cache Buster Is 4 Days Stale

`index.html` loads `app.jsx?v=20260422a`. Today is 2026-04-26. If app.jsx changed after April 22, returning visitors are running stale code silently. The service worker (`peakly-20260422`) also won't invalidate their cached app.jsx.

**Fix — in `index.html`, line 346:**
```html
<!-- Change: -->
<script type="text/babel" src="./app.jsx?v=20260422a" data-presets="react"></script>

<!-- To: -->
<script type="text/babel" src="./app.jsx?v=20260426a" data-presets="react"></script>
```

**Fix — in `sw.js`, line 2:**
```js
// Change:
const CACHE_NAME = "peakly-20260422";

// To:
const CACHE_NAME = "peakly-20260426";
```

**Time to fix:** 2 minutes. **Do this every time app.jsx ships.**

---

### P1-B: Strike Alerts Are Completely Unimplemented — You Are Lying to Users

`/api/alerts` in `proxy.js` accepts registrations and responds: `"Conditions checked every 30 minutes."` There is no background worker. No cron. No `setInterval` polling conditions. No push delivery. Alerts are stored in a `Map` and never read again.

Users who tap "Set Alert" in the app get confirmation that something will happen. Nothing happens. This is a broken promise at launch.

**Immediate honest fix (do this today) — in `server/proxy.js`, line with the success message:**
```js
// Change:
message: 'Alert registered. Conditions checked every 30 minutes.',

// To:
message: 'Alert registered. Push delivery coming soon.',
```

**Full fix — add polling worker to `server/proxy.js`** (paste before `app.listen()`):

```js
// ─── Alert polling worker ─────────────────────────────────────────────────────
// Prereqs: npm install web-push on VPS, generate VAPID keys:
//   npx web-push generate-vapid-keys
// Set env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_MAILTO

const webpush = (() => { try { return require('web-push'); } catch { return null; } })();

if (webpush && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO || 'mailto:jjciluzzi@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('[alerts] Web Push VAPID configured');
} else {
  console.warn('[alerts] web-push not configured — alerts registered but push disabled');
}

async function checkAlerts() {
  if (_alerts.size === 0) return;
  for (const [alertId, alert] of _alerts) {
    if (!alert.pushToken || alert.fired) continue;
    try {
      alert.lastChecked = new Date().toISOString();
      // TODO: fetch venue weather here once venue lat/lon stored in alert record,
      // score it, and fire push if score >= alert.targetScore
      // Example push payload when condition met:
      // await webpush.sendNotification(
      //   JSON.parse(alert.pushToken),
      //   JSON.stringify({ title: 'Peakly Strike', body: `${alert.venueId} hit your target score!` })
      // );
      // alert.fired = true;
    } catch (err) {
      console.error(`[alerts] check failed for ${alertId}:`, err.message);
    }
  }
}

setInterval(checkAlerts, 30 * 60 * 1000);
```

**Time to fix:** Honest message — 2 minutes. Full polling worker — 4 hours (requires `npm install web-push` on VPS, VAPID key generation, and venue lat/lon stored in alert record).

---

## P2 — Fix This Sprint

### P2-A: Open-Meteo Rate Limit Hits at ~27 DAU (9th consecutive report)

363 API calls per user session. 10K/day free limit. 27 DAU = ceiling. The 2hr client-side cache helps repeat visitors, nothing for new devices or incognito sessions.

**Fix — move weather to a server-side proxy cache in `server/proxy.js`:**

```js
// Add before app.listen():
const _weatherCache = new Map(); // { key: { data, fetchedAt } }
const WX_TTL_MS = 2 * 60 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const { lat, lon, venueId, vars: wVars } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const cacheKey = venueId || `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
  const cached = _weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < WX_TTL_MS) {
    return res.json({ success: true, data: cached.data, cached: true });
  }

  const defaultVars = 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,weathercode';
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}`
    + `&daily=${encodeURIComponent(wVars || defaultVars)}`
    + `&hourly=relativehumidity_2m&timezone=auto&forecast_days=7`;

  try {
    const { status, json } = await fetchJson(url);
    if (status !== 200) return res.status(502).json({ error: 'upstream error', status });
    _weatherCache.set(cacheKey, { data: json, fetchedAt: Date.now() });
    // Evict entries older than 6hr to cap memory
    for (const [k, v] of _weatherCache) {
      if (Date.now() - v.fetchedAt > 6 * WX_TTL_MS) _weatherCache.delete(k);
    }
    return res.json({ success: true, data: json, cached: false });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
```

Then in `app.jsx`, update `fetchWeather()` to call `https://peakly-api.duckdns.org/api/weather?lat=X&lon=Y&venueId=Z` instead of Open-Meteo directly. At 1K MAU this reduces Open-Meteo calls from ~9,000/day (33 DAU × 273 weather calls) to ~273/day (one server-side refresh per venue per 2hr window).

**This is the highest ROI fix before launch.** Time: 2 hours.

---

### P2-B: CORS Allows Dev Origins in Production

`proxy.js` ALLOWED_ORIGINS includes `http://localhost:8000` and `http://127.0.0.1:8000`. Harmless for security (browsers enforce CORS; server-to-server calls skip it regardless), but sloppy in production.

**Fix:**
```js
// In server/proxy.js, replace ALLOWED_ORIGINS with:
const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000']
    : []),
];
```

Set `NODE_ENV=production` in the systemd service file. **Time: 10 minutes.**

---

### P2-C: No SRI Hashes on CDN Scripts

All four CDN scripts load without Subresource Integrity. A CDN cache poisoning attack silently serves malicious JS.

**Generate hashes (run on your dev machine):**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then in `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<hash-from-above>"></script>
```

**Caveat:** Babel Standalone uses `eval()` internally for JSX transpilation. Adding a strict `script-src 'self'` CSP will break Babel. If you add SRI but not CSP, you get CDN tamper protection without breaking the app. Do SRI first, CSP later (or never, given the Babel constraint). **Time: 30 minutes.**

---

## 5. Performance Analysis

| Resource | Size (approx) | Notes |
|----------|---------------|-------|
| Babel Standalone 7.24.7 | ~920KB raw, ~260KB gzip | #1 bottleneck |
| app.jsx | ~468KB raw, ~110KB gzip | Runtime-transpiled by Babel |
| React 18.3.1 prod | ~130KB raw, ~42KB gzip | Pinned ✅ |
| ReactDOM 18.3.1 prod | ~38KB raw, ~12KB gzip | Pinned ✅ |
| Plus Jakarta Sans (4 weights) | ~120KB network | Preconnect ✅ |
| **Total cold load** | **~1.67MB raw / ~424KB gzip** | Slow on 3G |

Babel Standalone is a full JS compiler loaded on every cold visit. Users on 3G wait 6–8 seconds before Babel finishes downloading, then another 1–2 seconds for JSX transpilation of 468KB. That's 8–10 seconds to interactive on a bad connection. This is an architectural constraint of the no-build-step decision — the only mitigation is the service worker caching (returning visitors load Babel from cache instantly). First-time users on slow connections are just slow.

All 8 `<img>` tags use `loading="lazy"` ✅. Unsplash photos use `?w=800&h=600&fit=crop` ✅.

---

## 6. Cost Estimate

| Scale | Monthly Cost | Notes |
|-------|-------------|-------|
| Current (~0 MAU) | $6 | DigitalOcean 1GB VPS |
| 1K MAU | $6 | VPS handles it; bandwidth negligible |
| 10K MAU | $12 | Upgrade to 2GB for proxy headroom |
| 100K MAU | $48–96 | 2–4 droplets or migrate to Fly.io; GitHub Pages still free |

GitHub Pages serves all static assets for free regardless of traffic. VPS only serves flight prices and alert registrations. At 100K MAU with ~20% using flight lookup = ~20K proxy req/day — well within the current droplet's capacity. No hardware change needed until 100K MAU.

**Optimization:** P2-A (proxy weather cache) saves Open-Meteo from becoming a paid tier requirement. Zero-cost infrastructure until ~5M API calls/month.

---

## 7. What Breaks First At Scale

Open-Meteo is the first wall and it's closer than the MAU number suggests. At ~27 DAU (~800 MAU) with the current client-side fetch architecture, afternoon sessions start returning 429s. `fetchWeather()` retries then returns null. Scoring degrades to "Swell data unavailable / score 50" across all surfing venues, and "Off-season" false positives appear on ski resorts because the hemisphere-check has no fallback when weather is null. The app looks broken and there's no visible error — users just see flat scores across the board and assume the product is garbage. Fix this before the Reddit post by moving weather fetching to the proxy cache (P2-A). One server-side refresh every 2 hours for all 233 venues keeps all users in sync, eliminates the per-user call cost, and costs nothing.
