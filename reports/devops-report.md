# Peakly DevOps Report — 2026-04-30

**Overall Status: YELLOW**

No P0s. The Open-Meteo rate limit issue has now been flagged in **every daily report since April 17** — that's 13 consecutive days unresolved. It is the single most likely thing to kill Peakly's launch moment. A Reddit post sending 30 cold users simultaneously eats the entire daily API quota in under 10 seconds. The rest of the posture is stable: proxy is HTTPS with proper timeout/retry/semaphore, no secrets in client code, Sentry is live, images are lazy-loaded, .gitignore is solid.

---

## Audit Results

| Area | Status | Notes |
|------|--------|-------|
| Live site health | GREEN | 7,150 lines / 467KB, all CDN deps present |
| CDN dependencies | GREEN | React 18.3.1, ReactDOM 18.3.1, Babel 7.24.7 — all pinned |
| Plausible analytics | GREEN | Present, uncommented, correct domain |
| Cache buster | YELLOW | `v=20260422a` / SW `peakly-20260422` — 8 days stale |
| Flight proxy (HTTPS) | GREEN | `https://peakly-api.duckdns.org`, 5s timeout, 3-retry exponential backoff, semaphore(3) |
| Travelpayouts token | GREEN | Server-side only via `process.env.TRAVELPAYOUTS_TOKEN` — not in any client file |
| Open-Meteo usage | RED | 10K/day free tier, no server-side cache — ~29 cold sessions burns the quota |
| Exposed secrets | GREEN | None. TP_MARKER is a public affiliate ID |
| Sentry | GREEN | DSN live in index.html + initialized in app.jsx lines 6–12 |
| .gitignore | GREEN | Covers .env, *.key, *.pem, *.p8, node_modules/, .claude/ |
| SRI on CDN scripts | RED | React, ReactDOM, Babel — no `integrity=` attribute, supply chain risk |
| CSP meta tag | YELLOW | Missing — any XSS has full page access |
| Image lazy loading | GREEN | `loading="lazy"` on every `<img>` in app.jsx |
| Cold-load JS weight | RED | ~3MB+ (Babel Standalone alone is ~2.25MB) |
| Babel version | YELLOW | 7.24.7 (April 2024 release) — pinned but stale, check for security patches |
| CORS (proxy) | GREEN | Allowlist covers j1mmychu.github.io, peakly.app, localhost |
| Rate limiting (proxy) | GREEN | 60 req/min/IP in-memory with 5-min cleanup |
| Recent commits | GREEN | No secrets introduced. Last meaningful deploy: April 22 |

---

## P0 — Critical (Fix Today)

**None.** Site is live and functional.

---

## P1 — High (Fix This Week)

### 1. Open-Meteo Rate Limit: Launch-Killer — Unresolved 13 Days

**This is the only issue that can kill Peakly's launch moment.**

**Numbers, precisely:**
- Free tier: 10,000 calls/day
- Cold session: 231 venues × 1.5 avg calls (weather + marine for surf/beach) = **~347 calls**
- That's **~28 simultaneous cold sessions** to exhaust the daily quota
- After quota hits: every user for the rest of the day sees `score: 50 "Swell data unavailable"` — the app's core value prop evaporates
- A r/surfing or r/skiing post sending 50 users in the first minute burns the quota in one batch cycle

**The fix — add server-side weather cache endpoints to proxy.js:**

```javascript
// Add to proxy.js after existing route definitions

const WEATHER_CACHE = new Map(); // key → { ts, data }
const WEATHER_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function weatherCacheKey(type, lat, lon) {
  return `${type}:${parseFloat(lat).toFixed(2)}:${parseFloat(lon).toFixed(2)}`;
}

// Transparent proxy for Open-Meteo /v1/forecast — caches 2hr per lat/lon
app.get('/api/weather/forecast', rateLimiter, async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) return res.status(400).json({ error: 'latitude and longitude required' });
  if (!/^-?\d+(\.\d+)?$/.test(latitude) || !/^-?\d+(\.\d+)?$/.test(longitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  const cacheKey = weatherCacheKey('weather', latitude, longitude);
  const cached = WEATHER_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < WEATHER_TTL_MS) return res.json(cached.data);

  const params = new URLSearchParams(req.query);
  try {
    const { status, json } = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (status === 200) WEATHER_CACHE.set(cacheKey, { ts: Date.now(), data: json });
    res.status(status).json(json);
  } catch { res.status(502).json({ error: 'upstream weather failed' }); }
});

// Transparent proxy for Open-Meteo marine — caches 2hr per lat/lon
app.get('/api/weather/marine', rateLimiter, async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) return res.status(400).json({ error: 'latitude and longitude required' });
  if (!/^-?\d+(\.\d+)?$/.test(latitude) || !/^-?\d+(\.\d+)?$/.test(longitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  const cacheKey = weatherCacheKey('marine', latitude, longitude);
  const cached = WEATHER_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < WEATHER_TTL_MS) return res.json(cached.data);

  const params = new URLSearchParams(req.query);
  try {
    const { status, json } = await fetchJson(`https://marine-api.open-meteo.com/v1/marine?${params}`);
    if (status === 200) WEATHER_CACHE.set(cacheKey, { ts: Date.now(), data: json });
    res.status(status).json(json);
  } catch { res.status(502).json({ error: 'upstream marine failed' }); }
});

// Cache eviction — runs every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - WEATHER_TTL_MS;
  for (const [k, v] of WEATHER_CACHE) if (v.ts < cutoff) WEATHER_CACHE.delete(k);
}, 30 * 60 * 1000);
```

**Then update app.jsx constants (lines 815–816):**

```javascript
// Before:
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";

// After:
const METEO  = "https://peakly-api.duckdns.org/api/weather";
const MARINE = "https://peakly-api.duckdns.org/api/weather";
```

The existing `fetchWeather` calls `${METEO}/forecast?latitude=...` and `fetchMarine` calls `${MARINE}/marine?latitude=...` — both URL patterns map cleanly to the new proxy routes with zero further changes.

**Deploy command on VPS:**
```bash
pm2 restart peakly-proxy && pm2 logs peakly-proxy --lines 20
```

**Impact:** 231-venue cold load goes from ~347 upstream calls to ~1 call per unique lat/lon per 2 hours. 100 users in the same hour = same API cost as 1 user. Free tier becomes effectively unlimited at launch scale.

**Time to fix:** 2 hours total (30m proxy code, 30m app.jsx + test, 30m VPS deploy, 30m verify in browser console).

---

### 2. SRI Missing on Three Critical CDN Scripts

React, ReactDOM, and Babel load from unpkg.com without `integrity=` attributes. A BGP hijack or compromised CDN delivers malicious JS with full localStorage access — `peakly_profile` (email + home airport), `peakly_alerts`, `peakly_errors`.

CDN supply chain poisoning is not theoretical: event-stream (2018), ua-parser-js (2021), polyfill.io (2024) all shipped malicious JS via CDN compromise.

**The fix — generate hashes and add them:**

```bash
# Run this on any machine to get the SRI hashes
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

**Then update index.html lines 80–84:**

```html
<script crossorigin="anonymous"
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_1>"></script>

<script crossorigin="anonymous"
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-<HASH_2>"></script>

<script crossorigin="anonymous"
  src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha384-<HASH_3>"></script>
```

Versions are pinned, so hashes won't drift under normal conditions — which is exactly what makes SRI safe to add. If unpkg changes the bytes at the same version URL, the browser refuses to execute it. That's the protection.

**Time to fix:** 30 minutes.

---

## P2 — Medium (Fix This Sprint)

### 1. Cache Buster Stale — Bump on Next Deploy

`app.jsx?v=20260422a` in index.html and `CACHE_NAME = "peakly-20260422"` in sw.js are 8 days old. Not a breaking bug today, but if any change ships without bumping both values, returning users get the stale build served from SW cache.

**The fix — bump both on every deploy that touches app.jsx:**

```html
<!-- index.html line ~117 -->
<script type="text/babel" src="./app.jsx?v=20260430a" data-presets="react"></script>
```

```javascript
// sw.js line 2
const CACHE_NAME = "peakly-20260430";
```

The date suffix is the deploy date. Both must match.

**Time to fix:** 2 minutes per deploy.

---

### 2. CSP Meta Tag Missing

No Content-Security-Policy on the page. XSS with a venue name or flight API data injection has full DOM and localStorage access.

**Constraint:** Babel Standalone requires `unsafe-eval`. A strict CSP that bans `unsafe-eval` breaks the app entirely. This is the inherent tradeoff of runtime JSX compilation.

**Partial CSP that's still worth adding (add to index.html `<head>`):**

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://unpkg.com
    https://js.sentry-cdn.com
    https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' https://images.unsplash.com data: blob:;
  connect-src 'self'
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://peakly-api.duckdns.org
    https://plausible.io
    https://o4511108649058304.ingest.us.sentry.io;
  worker-src 'self';
  frame-ancestors 'none';
">
```

This blocks: data exfiltration to unknown domains, clickjacking, image hotlinking from unknown sources. It doesn't block XSS via eval (Babel requires it) but restricts where exfiltrated data can go.

**Test before ship** — open browser console after adding and check for CSP violation warnings. Adjust `connect-src` if any legitimate fetch is blocked.

**Time to fix:** 20 minutes + browser test.

---

### 3. Babel Standalone Version — Check for Security Patches

`@babel/standalone@7.24.7` was pinned April 2024. Check and update:

```bash
npm info @babel/standalone version
# If newer minor/patch exists, update index.html and regenerate SRI hash
```

**Time to fix:** 15 minutes.

---

## Performance Analysis

### Cold-Load JS Weight

| Asset | Estimated Size |
|-------|---------------|
| Babel Standalone 7.24.7 | ~2,250 KB |
| app.jsx (uncompressed) | ~468 KB |
| ReactDOM 18.3.1 prod | ~130 KB |
| React 18.3.1 prod | ~42 KB |
| Sentry SDK | ~60 KB |
| **Total raw** | **~2,950 KB** |

**Mobile 3G (~1.5 Mbps effective):** ~15s to first interactive.  
**LTE (~10 Mbps):** ~2.4s.

Babel Standalone is 76% of the total JS weight and exists solely to transpile JSX once per session. It's the architectural tax for no-build-step. The SW caches it after first load — returning users pay zero. First-visit on mobile is rough.

**Mitigation (without adding a build step):**

```html
<!-- Add to <head> — tells browser to start fetching Babel before parsing completes -->
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" as="script" crossorigin>
<link rel="preload" href="./app.jsx?v=20260422a" as="script" crossorigin>
```

Shaves 200–500ms off first contentful paint by parallelizing the fetch. Minimal effort, real gain.

**Images:** All use `loading="lazy"`. GREEN.

---

## Cost Projection

| Scale | Config | Monthly Cost |
|-------|--------|-------------|
| Now | 1GB DigitalOcean droplet | $6 |
| 1K MAU | Same droplet | $6 |
| 10K MAU | Same droplet + weather cache (P1 fix) | $6 |
| 100K MAU | Upgrade to 2GB droplet | $12 |
| 500K MAU | Load balancer + 2× 2GB droplets | $50–80 |

The weather cache proxy (P1 fix) extends the $6/month envelope to well past 10K MAU. Without it, 10K MAU could mean paid Open-Meteo tiers ($25–100/month) if quota busts become a daily occurrence.

---

## What Breaks First at Scale

Open-Meteo is the trip wire. The failure sequence:

1. Peakly gets posted to r/surfing (250K members, regular traffic spikes)
2. 30 users open it simultaneously — cold cache, ~347 upstream calls each = 10,410 calls in 30 seconds
3. Open-Meteo 429s for the rest of the day (quota resets at UTC midnight)
4. Every subsequent user sees score 50 "Swell data unavailable" on all 231 venues
5. Users bounce and post "this is broken" — the r/surfing thread becomes negative marketing

**Prevention:** The server-side weather cache proxy (P1 above). After that fix, 30 cold users = ~347 calls total (one per unique lat/lon bucket), not 10,410. Launch scale becomes a non-event for the free tier.

The second failure mode at scale is the in-memory rate limiter in proxy.js. At 100K MAU with traffic spikes, the `_rateMap` grows unbounded between cleanup cycles and the single-process Node app becomes a bottleneck. Fix: move rate limiting to Redis when upgrading to the 2GB droplet.

---

## Action Checklist

| Priority | Task | Time |
|----------|------|------|
| P1 | Add `/api/weather/forecast` + `/api/weather/marine` endpoints to proxy.js | 30m |
| P1 | Update `METEO` + `MARINE` constants in app.jsx (lines 815–816) + test | 30m |
| P1 | Deploy proxy changes to VPS + verify in browser network tab | 30m |
| P1 | Generate SRI hashes + add `integrity=` to 3 CDN script tags in index.html | 30m |
| P2 | Bump cache buster to `20260430a` in index.html + sw.js | 2m |
| P2 | Add partial CSP meta tag to index.html + browser test | 20m |
| P2 | Check Babel Standalone for newer version + update if available | 15m |
| P2 | Add `<link rel="preload">` for Babel + app.jsx in index.html | 5m |

**Total: ~3.5 hours.** The infrastructure is otherwise clean. Ship the weather cache proxy and this goes GREEN.
