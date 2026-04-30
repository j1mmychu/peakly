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
| Cache buster | YELLOW | `v=20260422a` in index.html / SW `peakly-20260427` — mismatched |
| Flight proxy (HTTPS) | GREEN | `https://peakly-api.duckdns.org`, 5s timeout, 3-retry exponential backoff, semaphore(3) |
| Travelpayouts token | GREEN | Server-side only via `process.env.TRAVELPAYOUTS_TOKEN` — not in any client file |
| Open-Meteo usage | RED | 10K/day free tier, no server-side cache — ~28 cold sessions burns the quota |
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
| Recent commits | GREEN | No secrets introduced. SW bumped to peakly-20260427 (remote commit) |

---

## P0 — Critical (Fix Today)

**None.** Site is live and functional.

---

## P1 — High (Fix This Week)

### 1. Open-Meteo Rate Limit: Launch-Killer — Unresolved 13 Days

**This is the only issue that can kill Peakly's launch moment.**

**Numbers:**
- Free tier: 10,000 calls/day
- Cold session: 231 venues × 1.5 avg calls (weather + marine for surf/beach) = **~347 calls**
- Max simultaneous cold sessions before quota exhausted: **~28**
- After quota: every user sees score 50 "Swell data unavailable" on all venues — core value prop gone
- A r/surfing or r/skiing post sending 50 users in the first minute burns the quota in one batch

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

**Update app.jsx constants (lines 815–816):**

```javascript
// Before:
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";

// After:
const METEO  = "https://peakly-api.duckdns.org/api/weather";
const MARINE = "https://peakly-api.duckdns.org/api/weather";
```

`fetchWeather` already builds `${METEO}/forecast?latitude=...` and `fetchMarine` builds `${MARINE}/marine?latitude=...` — both map directly to the new proxy routes. Zero further changes.

**VPS deploy:**
```bash
pm2 restart peakly-proxy && pm2 logs peakly-proxy --lines 20
```

**Impact:** 28 cold sessions = ~347 upstream calls total (one per unique lat/lon), not 9,716. Free tier effective ceiling becomes unlimited at launch scale.

**Time to fix:** 2 hours (30m code, 30m test, 30m deploy, 30m verify).

---

### 2. SRI Missing on Three Critical CDN Scripts

React, ReactDOM, and Babel load from unpkg.com without `integrity=` attributes. A BGP hijack or CDN compromise delivers malicious JS with full localStorage access — `peakly_profile`, `peakly_alerts`, `peakly_errors`. This is not hypothetical: polyfill.io (2024) served malicious JS to 100K+ sites via CDN compromise.

**Generate the hashes:**

```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

**Update index.html lines 80–84:**

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

Versions are pinned — hashes won't drift under normal operation. Any byte change at the pinned URL (i.e., an attack) makes the browser refuse to execute.

**Time to fix:** 30 minutes.

---

## P2 — Medium (Fix This Sprint)

### 1. Cache Buster / SW Version Mismatch

`index.html` has `app.jsx?v=20260422a` but `sw.js` now has `CACHE_NAME = "peakly-20260427"` (updated in a remote commit today). Mismatched identifiers make stale-cache debugging harder. Not breaking.

**Fix — sync on next deploy that touches app.jsx:**

```html
<!-- index.html -->
<script type="text/babel" src="./app.jsx?v=20260430a" data-presets="react"></script>
```

```javascript
// sw.js line 2
const CACHE_NAME = "peakly-20260430";
```

**Time to fix:** 2 minutes per deploy.

---

### 2. CSP Meta Tag Missing

No Content-Security-Policy on the page. XSS via venue name or flight API response has full DOM + localStorage access.

**Constraint:** Babel Standalone requires `unsafe-eval`. Can't get rid of that without a build step.

**Partial CSP that's still worth having (add to index.html `<head>`):**

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

Blocks: data exfiltration to unknown domains, clickjacking, rogue image sources. Doesn't block XSS-via-eval but limits the blast radius.

**Time to fix:** 20 minutes + browser console check for false-positive violations.

---

### 3. Babel Standalone Version — Check for Security Patches

`@babel/standalone@7.24.7` was pinned April 2024. Minor/patch releases may include security fixes.

```bash
npm info @babel/standalone version
# If newer: update index.html version pin + regenerate SRI hash
```

**Time to fix:** 15 minutes.

---

### 4. Performance: Add Preload Hints

Cold-load JS weight is ~3MB (Babel Standalone is 76% of it). The SW caches after first load — returning users pay zero. But first-visit on mobile 3G is ~15 seconds to interactive.

**Low-effort mitigation:**

```html
<!-- Add to index.html <head>, before the script tags -->
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" as="script" crossorigin>
<link rel="preload" href="./app.jsx?v=20260422a" as="script" crossorigin>
```

Parallelizes the Babel + app.jsx fetch with the HTML parse. Shaves 200–500ms off first contentful paint at zero architectural cost.

**Time to fix:** 5 minutes.

---

## Cost Projection

| Scale | Config | Monthly Cost |
|-------|--------|-------------|
| Now | 1GB DigitalOcean droplet | $6 |
| 1K MAU | Same droplet | $6 |
| 10K MAU | Same + weather cache (P1 fix above) | $6 |
| 100K MAU | Upgrade to 2GB droplet | $12 |
| 500K MAU | Load balancer + 2× 2GB droplets | $50–80 |

The weather cache proxy eliminates the only cost inflection point before 100K MAU. Without it, hitting paid Open-Meteo tiers ($25–100/month) is possible once traffic spikes become a daily event.

---

## What Breaks First at Scale

Open-Meteo is the trip wire. Exact failure sequence:

1. Peakly gets linked on r/surfing (250K members)
2. 30 users open simultaneously — cold cache, ~347 upstream calls each = 10,410 calls in 30 seconds
3. Open-Meteo 429s for the rest of the day (resets UTC midnight)
4. Every user for 18+ hours sees score 50 "Swell data unavailable" on all 231 venues
5. Users post "this app is broken" — viral thread becomes negative marketing

Second failure mode at scale: in-memory rate limiter `_rateMap` in proxy.js grows unbounded between cleanup cycles under sustained traffic. Fix: Redis when upgrading to 2GB droplet at ~100K MAU.

---

## Action Checklist

| Priority | Task | Time |
|----------|------|------|
| P1 | Add `/api/weather/forecast` + `/api/weather/marine` to proxy.js | 30m |
| P1 | Update `METEO` + `MARINE` constants in app.jsx lines 815–816 + test | 30m |
| P1 | Deploy proxy to VPS + verify in browser network tab | 30m |
| P1 | Generate SRI hashes + add `integrity=` to 3 CDN scripts in index.html | 30m |
| P2 | Sync cache buster `v=20260430a` in index.html + sw.js on next deploy | 2m |
| P2 | Add partial CSP meta tag to index.html + browser test | 20m |
| P2 | Check Babel Standalone for newer version | 15m |
| P2 | Add `<link rel="preload">` for Babel + app.jsx | 5m |

**Total: ~3.5 hours to clear all open items.** Ship the weather cache proxy first — everything else is hardening.
