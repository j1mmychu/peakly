# Peakly DevOps Report — 2026-06-07

**Status: 🟡 YELLOW**

No P0s. Cache buster bumped `20260606a → 20260607a` this run. Three issues warrant immediate attention: (1) localhost origins in production CORS — trivial fix, real attack surface; (2) VPS redeploy is now **34 days overdue** — weather proxy cache and weekend-specific flight pricing are dead code until that SSH command runs; (3) a proxy-down event at >41 concurrent cold-cache users will blow through Open-Meteo's 10K/day free tier.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache buster `20260606a → 20260607a` | `app.jsx:17` | 1 day stale → current |
| SW CACHE_NAME `peakly-20260606a → peakly-20260607a` | `sw.js:2` | Evicts stale cached assets |
| Query string `?v=20260606a → ?v=20260607a` | `index.html:400` | Forces browser reload |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **9,006 lines / 535 KB raw / ~161 KB gzip est.** |
| CDN scripts | All HTTPS, pinned to exact versions ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster | `v=20260607a` — **bumped this run** |
| SW CACHE_NAME | `peakly-20260607a` — **bumped this run** |
| PEAKLY_BUILD | `20260607a` — **bumped this run** |
| Sentry DSN | Active: `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/4511108673765376` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — safe on CDN failure ✅ |

### CDN Dependency Versions

| Library | Version | SRI |
|---------|---------|-----|
| React + ReactDOM | 18.3.1 | ❌ None |
| Babel Standalone | 7.29.7 | ❌ None |
| Supabase JS (eager) | 2.106.2 | ❌ None |
| Leaflet JS + CSS | 1.9.4 | ✅ sha256 |

---

## 2. Critical Issues (P0) — Fix Today

**None.** No blocked-launch items.

---

## 3. High Issues (P1) — Fix This Week

### P1-A: VPS Redeploy 34 Days Overdue

**What's broken:** `proxy.js` has had weekend-specific Travelpayouts date routing + Open-Meteo shared cache + in-flight deduplication committed since 2026-05-04. The **live server is still running the pre-05-04 build**. This means:
- All users hit Open-Meteo directly (no shared cache, no Reddit-spike protection)
- Travelpayouts queries return month-cheapest fares instead of Fri/Mon-specific prices
- `/api/weather` and `/api/marine` proxy endpoints **do not exist** on the live server

**Fix (one SSH session, ~3 minutes):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | jq .
```

Expected `/health` after redeploy:
```json
{
  "status": "ok",
  "wx_cache_size": 0,
  "alerts": 0,
  "apns": "unconfigured",
  "poll_interval_min": 30
}
```

If `wx_cache_size` is missing, the old build is still running — `pm2 logs peakly-proxy --lines 20`.

**Estimated fix time:** 5 minutes.

---

### P1-B: Open-Meteo Free Tier Exposure on Proxy Downtime

**What's broken:** `fetchWeather`/`fetchMarine` correctly try proxy first then fall back to direct Open-Meteo. But Open-Meteo's free tier is **10,000 calls/day**. 156 venues × ~1.6 calls each (weather + marine for beach) = ~245 calls per cold-cache user load. At **41 simultaneous cold-cache users with proxy down**, that's 10,045 calls — Open-Meteo 429s, every user sees blank scores.

Normal operation with proxy up: fine (shared 2hr cache). Failure mode: proxy crashes → 41 browsers simultaneously hammer Open-Meteo → free tier gone in minutes.

**Fix — add 5-minute proxy cooldown in app.jsx (~line 1041):**

```javascript
// Add above _tryProxyWx:
let _proxyWxFailedAt = 0;
const PROXY_WX_COOLDOWN_MS = 5 * 60 * 1000;

// Replace existing _tryProxyWx body:
async function _tryProxyWx(kind, lat, lon) {
  if (Date.now() - _proxyWxFailedAt < PROXY_WX_COOLDOWN_MS) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const url = `${FLIGHT_PROXY}/api/${kind}?lat=${lat}&lon=${lon}`;
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) { _proxyWxFailedAt = Date.now(); return null; }
    const json = await r.json();
    if (json && json.success && json.data) { _proxyWxFailedAt = 0; return json.data; }
    _proxyWxFailedAt = Date.now(); return null;
  } catch { _proxyWxFailedAt = Date.now(); return null; }
}
```

156 parallel hammers → 1 probe per 5-minute cooldown window.

**Estimated fix time:** 15 minutes.

---

### P1-C: Localhost Origins in Production CORS

**Where:** `server/proxy.js:52–54`

```javascript
const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  'http://localhost:8000',   // ← any local process can hit production proxy
  'http://localhost:3000',   // ← same
  'http://127.0.0.1:8000',  // ← same
];
```

**Risk:** Any page on localhost:8000 or :3000 — a compromised npm package's dev server, VS Code Live Server — can make CORS-allowed requests to the production proxy, exhaust the rate limit, or probe the Travelpayouts integration. Token stays server-side; blast radius is limited. But there's zero reason to keep this open in prod.

**Fix:**
```javascript
const DEV_ORIGINS = process.env.NODE_ENV !== 'production'
  ? ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000']
  : [];

const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  ...DEV_ORIGINS,
];
```

Set `NODE_ENV=production` in pm2 ecosystem config or `.env` on VPS. Bundle into P1-A redeploy — same SSH session.

**Estimated fix time:** 5 minutes (bundled with P1-A).

---

### P1-D: APNS Still Unconfigured — 25 Days Past Deadline

`proxy.js:442` `_apnsConfigured()` returns false. All four env vars unset. `/health` returns `"apns": "unconfigured"`. Strike Alerts (shipped 2026-05-07, blocking App Store v1) is a no-op.

**Runbook already written:** `peakly-native/PUSH_SETUP.md`. Requires a `.p8` key from Apple Developer console and 5 `pm2 set` commands.

**Hard deadline — 2026-06-10:**
- **Path A:** Run the runbook. APNS live. App Store v1 includes Alerts.
- **Path B (fallback):** Add `Capacitor.isNativePlatform()` gate to hide Alerts tab on iOS native. Ship App Store v1 without push.

Path B gate code:
```javascript
const isNative = typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.();
// Conditionally render AlertsTab:
{(!isNative || apnsConfigured) && <AlertsTab ... />}
```

**Estimated fix time:** 30 min (APNS, if .p8 available) or 20 min (Path B gate).

---

## 4. Medium Issues (P2) — Fix This Sprint

### P2-A: Missing SRI Hashes on React, Babel, Supabase

Leaflet correctly has `integrity=` on both JS and CSS. React, ReactDOM, Babel Standalone, and Supabase JS do not. A compromised unpkg.com or cdn.jsdelivr.net could inject arbitrary JavaScript.

Note: strict `script-src` CSP is blocked by Babel Standalone's `unsafe-eval` requirement. SRI is the viable mitigation.

**Fix — generate and apply hashes:**
```bash
for url in \
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js" \
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" \
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js" \
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js"; do
  echo "$url"
  curl -s "$url" | openssl dgst -sha384 -binary | openssl base64 -A
  echo
done
```

Paste into index.html:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_HERE"></script>
```

**Caveat:** Version bumps now require regenerating hashes. Add comment in index.html: `<!-- SRI generated 2026-06-07 — regenerate on any CDN version bump -->`.

**Estimated fix time:** 20 minutes.

---

### P2-B: Auto-Bump Cache Buster in auto-push.sh

This report is the 12th+ time the cache buster has been manually bumped. Here is the fix that ends this permanently:

```bash
# Add to scripts/auto-push.sh BEFORE the git add block:
TODAY=$(date +%Y%m%d)
CURRENT=$(grep -o 'PEAKLY_BUILD = "[0-9a-z]*"' app.jsx | grep -o '"[^"]*"' | tr -d '"')
if [[ "$CURRENT" < "${TODAY}a" ]]; then
  sed -i "s/PEAKLY_BUILD = \"[^\"]*\"/PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
  sed -i "s/CACHE_NAME = \"peakly-[^\"]*\"/CACHE_NAME = \"peakly-${TODAY}a\"/" sw.js
  sed -i "s/app\.jsx?v=[0-9a-z]*/app.jsx?v=${TODAY}a/" index.html
  echo "[auto-push] cache buster bumped to ${TODAY}a"
fi
```

**Estimated fix time:** 10 minutes.

---

### P2-C: Unsplash Images Missing `auto=format&q=80`

168 Unsplash URLs use `w=800&h=600&fit=crop` with no format/quality params. Defaults to JPEG ~q=85. Adding `auto=format&q=80` delivers WebP to supporting browsers (~30% smaller) and reduces JPEG weight for the rest. A 20-image Explore scroll: ~7MB → ~4.5MB.

**Fix:**
```bash
sed -i 's|\(images\.unsplash\.com/[^"?]*\?\?\?\)\([^"]*\)&fit=crop|\1\2\&fit=crop\&auto=format\&q=80|g' app.jsx
# Verify:
grep -c "auto=format" app.jsx
```

Correct sed pattern (handles both `?` and `&` param separators):
```bash
sed -i 's/\(images\.unsplash\.com[^"]*\)&fit=crop/\1\&fit=crop\&auto=format\&q=80/g' app.jsx
```

**Estimated fix time:** 5 minutes.

---

### P2-D: No Content-Security-Policy Meta Tag

No CSP in index.html. Babel Standalone requires `unsafe-eval` so a strict policy isn't viable, but a defined policy blocks unknown third-party injection and prevents `frame-ancestors` clickjacking.

**Fix (test in browser before ship):**
```html
<!-- Add in <head>, after viewport meta -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://unpkg.com https://cdn.jsdelivr.net
    https://js.sentry-cdn.com https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com
    https://maps.wikimedia.org https://*.tile.openstreetmap.org;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://wsoqcfwkvvemtlddcgfc.supabase.co
    https://api.open-meteo.com https://marine-api.open-meteo.com
    https://plausible.io https://o4511108649058304.ingest.us.sentry.io;
  frame-ancestors 'none';
">
```

**Estimated fix time:** 30 minutes including smoke test.

---

## 5. Security Audit Summary

| Check | Status |
|-------|--------|
| Travelpayouts API token in client code | ✅ NOT present — `process.env.TRAVELPAYOUTS_TOKEN` server-side only |
| TP_MARKER affiliate ID (`710303`) | ✅ Expected — public affiliate marker for building deep-links |
| Supabase anon key in client | ✅ By design — public-safe with RLS per Supabase architecture |
| `.env` / `.p8` / `.pem` in `.gitignore` | ✅ |
| Business plan PDFs in `.gitignore` | ✅ Added after 2026-05-09 incident |
| Recent commits for secrets | ✅ Clean — last 10 commits are agent reports only |
| Sentry DSN in client | ✅ Expected — public-safe per Sentry docs |
| CORS localhost origins in production proxy | ❌ **P1-C** |
| SRI on React / Babel / Supabase CDN scripts | ❌ Missing (P2-A) |
| CSP meta tag | ❌ Missing (P2-D) |
| `eval()` / `new Function()` / bare `innerHTML` in app.jsx | ✅ None — index.html error fallback `innerHTML` is static string, not user input |

---

## 6. Flight Proxy Status

| Check | Status |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Raw IP in client code | None — historical 104.131.82.242 gone ✅ |
| Travelpayouts token | Server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s `AbortController` ✅ |
| Retry logic | 3 attempts, 1.2s/2.4s exponential backoff on 429/5xx ✅ |
| Concurrency cap | Semaphore: max 3 concurrent requests (`_flightSem`) ✅ |
| Rate limiting on proxy | 60 req/min/IP ✅ |
| VPS redeploy status | ❌ **Day 34 overdue** — P1-A above |

---

## 7. Infrastructure Cost Model

| MAU | GitHub Pages | DigitalOcean VPS | Supabase | Open-Meteo | Total/mo |
|-----|-------------|------------------|----------|------------|----------|
| Current (~100) | Free | $6 | Free | Free | **$6** |
| 1K | Free | $6 | Free | Free | **$6** |
| 10K | Free | $12 (2GB) | Free | Free (proxy cache holds) | **$12** |
| 100K | Free | $24 (4GB) | $25 Pro | $29 Commercial | **$78** |

**Open-Meteo free tier cliff:** With proxy up + 2hr shared cache, 156 venues = ~1,872 upstream calls/day regardless of user count. The $29/mo commercial plan is a 100K MAU precaution, not an immediate need.

**Supabase free tier:** 50K MAU, 500MB DB. At 10K MAU × 5 synced keys × avg 1KB = ~50MB. Comfortable through ~50K MAU.

**VPS RAM:** `_wxCache` 4,000 entries × ~2KB = ~8MB. `_alerts` 10,000 × ~500B = ~5MB. 1GB droplet holds through 10K MAU.

---

## 8. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` raw | 535 KB |
| `app.jsx` gzip est. | ~161 KB |
| Babel Standalone (gzip) | ~250 KB |
| React + ReactDOM (gzip) | ~172 KB |
| Supabase JS (gzip) | ~80 KB |
| Leaflet JS + CSS (gzip) | ~50 KB |
| **Total JS payload (gzip est.)** | **~713 KB** |
| Images: lazy loading | ✅ All venue image tags |
| Images: format optimization | ❌ No `auto=format` (P2-C) |

**Single largest bottleneck:** Babel Standalone (~250KB gzipped, ~2.5MB raw) blocks the main thread transpiling 535KB of JSX before first render. Budget Android + 4G = 2–3s white screen. Structural constraint of the no-build-step architecture. Accept it now; revisit at 5K MAU.

---

## 9. What Breaks First at Scale

**Babel on mobile, then the VPS.**

At 1K DAU: UX degradation is already live on budget devices — 3–4s TTI on cold load. No fix without a build step. Correct tradeoff for now; wrong at 5K.

At 10K MAU: VPS becomes the chokepoint. 500 simultaneous users × 15 airports each = 7,500 outbound Travelpayouts requests in 30 seconds. The 3-request client semaphore throttles per-user, not globally. The in-memory rate limiter (60/min/IP) handles abuse, not legitimate distributed load.

**Prevention checklist before 10K MAU:**
1. Redeploy proxy (P1-A) — get shared weather cache live
2. Fix CORS localhost (P1-C) — same SSH session
3. Add proxy-WX cooldown circuit breaker (P1-B) — 15 min
4. Add `auto=format&q=80` to Unsplash (P2-C) — 5 min
5. Add global RPS cap in proxy.js (`100 req/s` total) — prevents thundering herd
6. Auto-bump cache buster in auto-push.sh (P2-B) — 10 min, ends this recurring waste

---

## Appendix: VPS Actions Pending (Code-Complete on Main, Not Live)

| Feature | Merged | Days Waiting |
|---------|--------|-------------|
| Open-Meteo shared proxy cache | 2026-05-04 | **34 days** |
| Weekend-specific Travelpayouts dates | 2026-05-04 | **34 days** |
| Strike Alerts polling worker | 2026-05-07 | **31 days** |
| APNS push delivery | 2026-05-07 | **31 days (+ unconfigured env vars)** |

**One command unblocks the first three:**
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && pm2 save"
```
