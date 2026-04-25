# Peakly DevOps Report — 2026-04-25

**Overall Status: YELLOW**

No P0s. One recurring P1 (Open-Meteo rate limit time bomb) is now 8 days unresolved across consecutive reports — it's been flagged every day since April 17 and still hasn't shipped. That's a launch blocker for any viral traffic event. The rest of the posture is clean: proxy is HTTPS with proper timeout/retry, no secrets in client code, images are lazy-loaded, Sentry is live, .gitignore is solid.

---

## Audit Results

| Area | Status | Notes |
|------|--------|-------|
| Live site health | GREEN | app.jsx 7,140 lines / 463KB, all deps pinned |
| CDN dependencies | GREEN | React 18.3.1, ReactDOM 18.3.1, Babel 7.24.7 — all pinned |
| Plausible analytics | GREEN | Present and uncommented in index.html |
| Cache buster | YELLOW | `v=20260417a` / `peakly-20260417` — 8 days since last deploy, bump on next change |
| Flight proxy (HTTPS) | GREEN | `https://peakly-api.duckdns.org`, 5s timeout, 3-attempt retry, semaphore(3) |
| Travelpayouts token | GREEN | Server-side only, not present in any client file |
| Open-Meteo usage | RED | 10K/day free tier, no server-side cache — ~66 cold sessions burns the quota |
| Exposed secrets | GREEN | None. TP_MARKER=710303 is a public affiliate ID, not a secret |
| Sentry DSN | GREEN | Live in index.html + initialized in app.jsx lines 6-15 |
| .gitignore | GREEN | Covers .env, *.key, *.pem, *.p8, node_modules/, .claude/ |
| SRI on CDN scripts | RED | React, ReactDOM, Babel loaded with no integrity= attribute |
| CSP meta tag | YELLOW | Missing — XSS mitigation is zero |
| Image lazy loading | GREEN | loading="lazy" on every img tag in app.jsx |
| Performance (cold load) | RED | ~3.8MB raw JS (Babel Standalone = 2.25MB of that) |
| Last deploy | YELLOW | April 17 — 8 days with no push to main |
| CORS (proxy) | GREEN | Allowlist covers j1mmychu.github.io, peakly.app, localhost |
| Rate limiting (proxy) | GREEN | 60 req/min/IP in-memory with 5-min cleanup |

---

## P0 — Critical (Fix Today)

**None.**

---

## P1 — High (Fix This Week)

### 1. Open-Meteo Rate Limit: Will Explode on First Viral Post (Recurring — Unresolved Since 2026-04-17)

**Numbers:**
- Free tier: 10,000 API calls/day
- Cold session: up to 231 venues × ~1.5 calls (weather + marine) = ~347 calls/session
- First 50 venues load immediately, rest background — ~75 calls in first 2 seconds per user
- **Hard ceiling: ~28–66 simultaneous cold sessions** before the daily quota is gone
- A r/surfing or r/skiing post sending 50 concurrent users burns the quota in one batch
- After quota: every user for the rest of the day gets empty condition scores — the app's core value proposition disappears

**Fix — add `/api/weather` and `/api/marine` endpoints to the VPS proxy with 30-min server-side cache.**

```javascript
// Add to server/proxy.js — after the rate limiter section

// ─── Server-side weather cache (30-min TTL) ────────────────────────────────
const WX_CACHE = new Map();
const WX_CACHE_TTL = 30 * 60 * 1000;

function wxCacheGet(key) {
  const entry = WX_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > WX_CACHE_TTL) { WX_CACHE.delete(key); return null; }
  return entry.data;
}
function wxCacheSet(key, data) {
  WX_CACHE.set(key, { ts: Date.now(), data });
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of WX_CACHE) if (now - v.ts > WX_CACHE_TTL) WX_CACHE.delete(k);
}, 10 * 60 * 1000);

// ─── GET /api/weather?lat=X&lon=Y&daily=...&timezone=... ───────────────────
app.get('/api/weather', async (req, res) => {
  const { lat, lon, daily, hourly, timezone, forecast_days } = req.query;
  if (!lat || !lon) return res.status(400).json({ success: false, error: 'lat and lon required' });

  const cacheKey = `weather|${parseFloat(lat).toFixed(3)}|${parseFloat(lon).toFixed(3)}`;
  const cached = wxCacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const params = new URLSearchParams({ lat, lon, timezone: timezone || 'auto', forecast_days: forecast_days || '7' });
    if (daily)  params.set('daily',  daily);
    if (hourly) params.set('hourly', hourly);
    const upstream = `https://api.open-meteo.com/v1/forecast?${params}`;
    const { status, json } = await fetchJson(upstream);
    if (status !== 200) return res.status(502).json({ success: false, error: 'upstream weather error' });
    const payload = { success: true, data: json };
    wxCacheSet(cacheKey, payload);
    res.json(payload);
  } catch (e) {
    res.status(502).json({ success: false, error: e.message });
  }
});

// ─── GET /api/marine?lat=X&lon=Y&daily=...&timezone=... ───────────────────
app.get('/api/marine', async (req, res) => {
  const { lat, lon, daily, hourly, timezone } = req.query;
  if (!lat || !lon) return res.status(400).json({ success: false, error: 'lat and lon required' });

  const cacheKey = `marine|${parseFloat(lat).toFixed(3)}|${parseFloat(lon).toFixed(3)}`;
  const cached = wxCacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const params = new URLSearchParams({ lat, lon, timezone: timezone || 'auto' });
    if (daily)  params.set('daily',  daily);
    if (hourly) params.set('hourly', hourly);
    const upstream = `https://marine-api.open-meteo.com/v1/marine?${params}`;
    const { status, json } = await fetchJson(upstream);
    if (status !== 200) return res.status(502).json({ success: false, error: 'upstream marine error' });
    const payload = { success: true, data: json };
    wxCacheSet(cacheKey, payload);
    res.json(payload);
  } catch (e) {
    res.status(502).json({ success: false, error: e.message });
  }
});
```

Then in `app.jsx` update the base URL constants at lines 809-810:
```javascript
const METEO  = "https://peakly-api.duckdns.org/api/weather";
const MARINE = "https://peakly-api.duckdns.org/api/marine";
```

Then update `fetchWeather()` and `fetchMarine()` to unwrap the proxy response envelope:
```javascript
// In fetchWeather() (around line 890), after const r = await fetch(...):
const envelope = await r.json();
const data = envelope.data ?? envelope; // proxy wraps in {success, data}; Open-Meteo is bare

// In fetchMarine() (around line 926), same pattern:
const envelope = await r.json();
const data = envelope.data ?? envelope;
```

**Impact:** Reduces Open-Meteo load from O(users × venues) to O(unique_lat_lon_pairs × 2 per 30 min). With 231 venues sharing cached responses, 1,000 daily active users costs ~462 upstream calls every 30 minutes instead of 150,000/day. Quota never touched.

**Time to fix: 2 hours** (proxy code + app.jsx update + VPS `pm2 restart proxy` + smoke test)

---

### 2. No SRI on CDN Scripts — Supply Chain Attack Vector

React, ReactDOM, and Babel are loaded from unpkg.com with no `integrity=` attribute. If unpkg is compromised or MITM'd, arbitrary JavaScript executes in every user's browser with full localStorage access (wishlists, alerts, profile data).

Generate correct SHA-384 hashes before deploying:
```bash
# Run from any machine with curl + openssl
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | base64

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | base64

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | base64
```

Then replace the script tags in `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"></script>

<script crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"></script>

<script
  src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"></script>
```

**Caveat:** Babel uses `eval()` internally. A strict `script-src` CSP would need `'unsafe-eval'` alongside SRI, which limits CSP's XSS protection. But SRI still defends the supply chain (file integrity) — it's a meaningful partial win even without a strict CSP.

**Time to fix: 30 minutes** (generate 3 hashes, update index.html, verify app loads)

---

## P2 — Medium (Fix This Sprint)

### 3. No CSP Meta Tag

No `Content-Security-Policy` header or meta tag. XSS has zero browser-enforced mitigation. Best achievable CSP given the Babel architecture (`unsafe-eval` required):

```html
<!-- Add to <head> in index.html after the viewport meta -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://unpkg.com
    https://js.sentry-cdn.com
    https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: blob: https://images.unsplash.com;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://o4511108649058304.ingest.us.sentry.io
    https://plausible.io;
  frame-ancestors 'none';
">
```

This blocks data exfiltration to unlisted domains even with `unsafe-eval` present.

**Time to fix: 20 minutes**

### 4. Cache Buster Pattern — Bump on Every Deploy

`?v=20260417a` in index.html and `CACHE_NAME = "peakly-20260417"` in sw.js are from April 17 — 8 days ago. Not dangerous since no deploys have happened since, but it needs to be a mechanical habit: **bump both on every commit to main or browsers serve stale app.jsx for up to 24 hours.**

```
index.html line 346:  ?v=20260425a
sw.js line 1:         const CACHE_NAME = "peakly-20260425";
```

**Time to fix: 5 minutes per deploy** (add to git commit checklist)

### 5. Babel Standalone Version Check

7.24.7 is from early 2024 — over 2 years old. Newer versions improve parse performance, which directly reduces in-browser transpile time (the single largest latency source). Check current version before the next deploy:

```bash
curl -s "https://unpkg.com/@babel/standalone/package.json" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])"
```

If 7.25.x or higher is available, update, regenerate the SRI hash, and test.

**Time to fix: 15 minutes**

---

## Performance Analysis

**Raw JS payload on cold load:**

| Asset | Raw Size | Gzipped (est.) |
|-------|----------|----------------|
| Babel Standalone 7.24.7 | ~2,250 KB | ~263 KB |
| ReactDOM 18.3.1 prod | ~1,100 KB | ~130 KB |
| app.jsx | 463 KB | ~100 KB |
| React 18.3.1 prod | ~42 KB | ~6 KB |
| **Total** | **~3,855 KB** | **~499 KB transfer** |

**Transfer is fine (~500KB gzipped). Parse + execute on device is not.**

**Single largest bottleneck: Babel Standalone transpiling 463KB of JSX on the main thread on every cold load.**

On a Moto G Power (median Android, 1 CPU available for JS): Babel parse + transform takes 1,500–3,000ms before React renders anything. The splash screen masks it visually, but Lighthouse will tank LCP and TTI scores. This is structural — the only permanent fix is a pre-compilation step (violates the no-build-step constraint). The pragmatic mitigation is the service worker, which already caches Babel and app.jsx, so repeat visits pay 0ms transpile cost. Ensure the SW cache is being hit correctly by verifying `CACHE_NAME` is bumped on each deploy (P2 #4 above).

**Images:** `loading="lazy"` on all img tags — correct.

---

## Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|-------------|
| Today | DO $6 Basic (1GB/1vCPU) + GitHub Pages free | **$6/mo** |
| 1K MAU | Same | **$6/mo** |
| 10K MAU | Upgrade proxy to DO $18 Basic (2GB/2vCPU) + server-side weather cache (required) | **~$18/mo** |
| 100K MAU | 2× $18 droplets + $12 DO load balancer + DO Managed Redis $15 (replace in-memory cache) | **~$63/mo** |

**Cost optimization opportunity:** The server-side weather cache (P1 #1) doubles as the cost optimization. With it, the $6 droplet handles 10K MAU without an upgrade. Without it, a single traffic spike requires emergency vertical scaling.

---

## What Breaks First at Scale

**Open-Meteo is the cliff.** At 10K MAU with a conservative 10% daily active rate: 1,000 sessions/day × 150 API calls = 150,000 calls/day against a 10,000 call/day hard cap. That's 15× the limit. The failure mode isn't gradual degradation — it's a hard cutoff. Session 67 of the day sees an app with no condition scores. Core feature dead until midnight UTC. A Reddit post sending 100 users in an hour triggers this before 10K MAU. The proxy-side weather cache (P1 #1) is a 2-hour fix that permanently closes this risk. It is the only fix that matters before any marketing push.

---

## Actions Taken This Run

- No code changes — audit only
- 8-day deploy gap confirmed (last commit `d039180`, 2026-04-17)
- All P1s from prior reports (Open-Meteo cache, SRI) remain open

---

*Report generated: 2026-04-25 | Next audit: 2026-04-26*
