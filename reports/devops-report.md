# Peakly DevOps Report — 2026-04-16

**Overall Status: YELLOW**
No P0 blockers. One high-urgency scalability time-bomb (Open-Meteo), one stale cache buster fixed this run. App is live and functional, but will not survive a Reddit front-page spike without the weather proxy.

---

## Checks Run

| Area | Result |
|------|--------|
| Live site health | YELLOW — cache buster was 7 days stale (fixed this run) |
| Flight proxy (HTTPS) | GREEN — HTTPS confirmed, timeout + retry + semaphore correct |
| Open-Meteo API usage | YELLOW — 77 cold sessions exhaust free tier |
| Security audit | GREEN — no exposed tokens, .gitignore correct, Sentry live |
| Performance | RED — ~10.8 MB JS cold load due to Babel Standalone |
| CDN dependency versions | GREEN — all pinned to specific versions |
| Lazy image loading | GREEN — `loading="lazy"` on all img tags |
| .gitignore | GREEN — covers .env, *.key, *.pem, *.p8, node_modules |

---

## P0 — Critical (Fix Today)

*None active. Previous P0 (HTTP proxy) resolved in prior run.*

---

## P1 — High (Fix This Week)

### 1. Open-Meteo Rate Limit Will Explode on Reddit Spike

**Numbers:**
- Each cold user session fetches weather for 100 venues (`VENUES.slice(0, 100)`)
- Avg ~130 API calls per session (mix of `fetchWeather` + `fetchMarine` for surf/dive/kayak)
- Open-Meteo free tier: 10,000 calls/day
- **Hard limit: ~77 simultaneous cold sessions** before the free tier is exhausted
- 10-minute auto-refresh re-triggers the batch for any tab left open
- localStorage 30-min TTL cache helps returning visitors only; does nothing for new arrivals

**What happens:** A single r/surfing or r/skiing post sending 200 visitors in one hour burns through the daily API quota in minutes. All subsequent users get empty/blank condition scores. The app's entire value proposition disappears for the rest of the day.

**Fix — server-side weather cache (2-3 hours, deploy on existing $6 droplet):**

Add to `server/index.js`:

```javascript
// ─── Weather proxy with coordinate-level 30-min cache ─────────────────────────
const weatherCache = new Map(); // key: "lat,lon,type" → { data, expires }
const WEATHER_TTL = 30 * 60 * 1000; // 30 minutes

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type } = req.query; // type: "forecast" | "marine"
  if (!lat || !lon) return res.status(400).json({ error: 'lat/lon required' });

  const key = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)},${type || 'forecast'}`;
  const cached = weatherCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return res.json({ cached: true, data: cached.data });
  }

  const base = type === 'marine'
    ? 'https://marine-api.open-meteo.com/v1/marine'
    : 'https://api.open-meteo.com/v1/forecast';

  const params = type === 'marine'
    ? `?latitude=${lat}&longitude=${lon}&hourly=wave_height,swell_wave_height,swell_wave_period,ocean_current_velocity&daily=wave_height_max,swell_wave_height_max&timezone=auto&forecast_days=7`
    : `?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m,uv_index,snowfall&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,snowfall_sum,windspeed_10m_max&timezone=auto&forecast_days=7`;

  try {
    const r = await fetch(base + params);
    if (!r.ok) return res.status(r.status).json({ error: 'upstream error' });
    const data = await r.json();
    weatherCache.set(key, { data, expires: Date.now() + WEATHER_TTL });
    return res.json({ cached: false, data });
  } catch (e) {
    return res.status(502).json({ error: 'weather fetch failed' });
  }
});

// Evict expired cache entries hourly to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of weatherCache) {
    if (v.expires < now) weatherCache.delete(k);
  }
}, 60 * 60 * 1000);
```

Then update `app.jsx` — replace the two Open-Meteo base URL constants (~line 4449):

```javascript
// Before:
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";

// After:
const METEO_PROXY  = "https://peakly-api.duckdns.org/api/weather";
```

In `fetchWeather` (~line 4529), replace the fetch URL:
```javascript
// Before:
const url = `${METEO}/forecast?latitude=${lat}...`;

// After:
const url = `${METEO_PROXY}?lat=${lat}&lon=${lon}&type=forecast`;
const r = await fetch(url, { signal: controller.signal });
const json = await r.json();
return json.data;
```

In `fetchMarine` (~line 4547), same pattern with `type=marine`.

**Impact:** 77-session hard limit → effectively unlimited. Open-Meteo sees at most 1 unique upstream call per coordinate per 30 minutes, regardless of concurrent user count.

**Estimated time:** 2-3 hours. Do this before any distribution push.

---

### 2. Cache Buster Stale — FIXED THIS RUN

**Before:** `v=20260409a` in index.html, `peakly-20260409` in sw.js (both 7 days old)
**After:** `v=20260416a` in index.html, `peakly-20260416` in sw.js

Users who hadn't refreshed since April 9 were potentially being served stale cached `app.jsx` via the service worker. Both are now aligned to today's date.

---

## P2 — Medium (Fix This Sprint)

### 3. Babel Standalone — 8.5 MB Performance Tax (Accepted Tech Debt)

**Total cold-load JS payload:**

| Resource | Raw Size | Gzip Est. |
|----------|----------|-----------|
| React 18.3.1 | ~42 KB | ~11 KB |
| ReactDOM 18.3.1 | ~380 KB | ~130 KB |
| **Babel Standalone 7.24.7** | **~8.5 MB** | **~2.0 MB** |
| app.jsx | **~2.0 MB** | ~550 KB |
| **Total** | **~11 MB** | **~2.7 MB** |

Babel is 75% of the payload. On a mid-range Android on a 5 Mbps real-world connection: 4–6 seconds network load + 1–3 seconds in-browser JSX transpilation = **7–10 second LCP before the app renders.** The splash screen provides UX cover, but this is a real retention risk.

Not fixable without a build step. Flag as tech debt; address at post-1K-user Vite migration.

**Short-term win — add preload hints to index.html (`<head>`, before `<script>` tags):**
```html
<link rel="preload" as="script" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" crossorigin>
<link rel="preload" as="script" href="./app.jsx?v=20260416a" crossorigin>
```
Saves ~300–700ms on cold loads by starting the download during HTML parse instead of waiting for `<script>` tags.

### 4. Service Worker Precaches app.jsx Without Cache Buster Query String

`sw.js` precaches `/peakly/app.jsx` (no `?v=` suffix). `index.html` loads `./app.jsx?v=20260416a`. These are different cache keys — the SW-cached copy and the versioned URL are never the same resource. SW precache of app.jsx is effectively a no-op and a waste of install bandwidth.

**Fix:**
```javascript
// sw.js — line 3-5
// Before:
const PRECACHE = ["/peakly/app.jsx"];

// After:
const PRECACHE = []; // app.jsx versioned via ?v= query string; let browser HTTP cache handle it
```

### 5. Plausible Domain — Update When peakly.app Goes Live

Current: `data-domain="j1mmychu.github.io"` (correct for now)

Once `peakly.app` DNS resolves:
1. Update `index.html` → `data-domain="peakly.app"`
2. Add domain in Plausible dashboard → Settings → Domains

Do NOT change before the domain is active or analytics will drop to zero.

---

## Security Audit

| Check | Status | Detail |
|-------|--------|--------|
| Travelpayouts token in app.jsx | PASS | Token is server-side only; `FLIGHT_PROXY` is a URL string, no secret |
| API keys / credentials in app.jsx | PASS | Grep clean — no tokens, passwords, or hardcoded secrets |
| .gitignore coverage | PASS | Covers `.env`, `*.env`, `*.key`, `*.pem`, `*.p8`, `*.mobileprovision`, `node_modules/` |
| Sentry DSN in app.jsx | PASS (expected) | DSN is a public project key — safe in client code by design |
| Sentry Loader Script in index.html | PASS | Hash matches app.jsx DSN |
| Recent commits for secrets (last 10) | PASS | No credential-looking content in commit messages or diffs |

**No credential exposure found.** Proxy architecture is correct.

---

## Flight Proxy Health

| Check | Status |
|-------|--------|
| Protocol | HTTPS — peakly-api.duckdns.org |
| Old HTTP IP (104.131.82.242) in client | NOT PRESENT |
| AbortController timeout | 5,000ms — correct |
| Retry logic | 3 attempts, 1.2s/2.4s backoff — correct |
| Concurrent request cap | 3 (semaphore) — correct |
| Fallback when proxy down | BASE_PRICES region estimate — correct |
| Flight price localStorage cache | 15-min TTL — present and correct |

Flight proxy is solid. No changes needed.

---

## Cost Projection

| Scale | Monthly Cost | Notes |
|-------|-------------|-------|
| ~50 MAU (current) | $6/month | $6 DO droplet for proxy; GitHub Pages free |
| 1K MAU | $6/month | Proxy handles it; GitHub Pages free tier unlimited |
| 10K MAU | $12–18/month | Upgrade to 2GB DO droplet ($12); weather proxy essential |
| 100K MAU | $60–120/month | $24 DO droplet + CDN/load balancer; Open-Meteo commercial plan ($250+/mo) if not proxied — server-side weather cache avoids this entirely |

**Cost optimization levers:**
1. Server-side weather cache (P1 above) keeps Open-Meteo free at any user scale
2. GitHub Pages handles all frontend traffic at $0 — don't move this
3. Flight proxy is the only compute cost — current $6 droplet handles ~10K MAU comfortably

---

## What Breaks First at Scale

**Open-Meteo is the first domino.** At 77 simultaneous cold page loads, the 10,000-call/day free tier is exhausted. A single Reddit post driving a traffic spike kills weather scoring for every user for the rest of the day. Users who arrive post-quota hit see blank condition scores, assume the app is broken, and never return. The fix is a server-side weather proxy with coordinate-level 30-minute caching on the existing DigitalOcean droplet — zero additional cost, 2-3 hours to build. This must ship before any distribution push to communities with more than 500 subscribers.

---

## Fixes Applied This Run

| File | Change |
|------|--------|
| `index.html` | Cache buster: `v=20260409a` → `v=20260416a` |
| `sw.js` | CACHE_NAME: `peakly-20260409` → `peakly-20260416` |
| `reports/devops-report.md` | This report |

---

*Generated: 2026-04-16 | DevOps agent*
