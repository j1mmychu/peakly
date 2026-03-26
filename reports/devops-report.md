# Peakly DevOps Report — 2026-03-26

**Overall Status: YELLOW**
No production outages. HTTPS proxy confirmed live. One P0 that will cause silent weather API failures at scale. Two P1s that are losing money and creating stale-cache risk.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ✅ GREEN | app.jsx 6,072 lines / 404 KB |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` confirmed |
| Proxy timeout/fallback | ✅ GREEN | 5s timeout, AbortController, null fallback |
| Plausible analytics | ✅ GREEN | Present, uncommented, firing |
| Secrets in client code | ✅ GREEN | No tokens exposed |
| .gitignore | ✅ GREEN | Covers .env, *.pem, *.key |
| Sentry DSN | ❌ EMPTY | Zero production error visibility |
| Weather cache (localStorage) | ❌ MISSING | P0 — rate limit bomb |
| Service worker cache version | ⚠️ STALE | `peakly-v1` never bumped |
| REI affiliate tags | ❌ MISSING | 22 links earning $0 |
| Cache-buster | ⚠️ STALE | `v=20260325c` — from yesterday |
| React/ReactDOM CDN version | ⚠️ UNPINNED | `react@18` resolves to latest — supply chain risk |

---

## P0 — OPEN-METEO RATE LIMIT BOMB

**Fix today. Will silently break weather for all users before you hit 30 concurrent.**

**The math:** Every page load fires 192 weather calls + ~80 marine calls = **272 concurrent HTTP requests**. Open-Meteo free tier is 10,000 requests/day. That's **36 page loads before the daily quota is gone**. One moderately active user refreshing the app 6x hits 1,632 calls. Five active users on the same day = 8,160 calls = silent failure for everyone else.

There is no caching. Every `useEffect` mount, every 10-minute auto-refresh, every new visitor fires all 192 calls simultaneously. This is not a "scales badly" problem — this is a "breaks at 5 active users" problem.

**The fix — add a 30-minute localStorage cache to fetchWeather and fetchMarine.**

In `app.jsx`, replace the two fetch functions starting at line ~889 with:

```javascript
// ─── Weather/Marine fetch with 30-min localStorage cache ─────────────────────
const WX_CACHE_TTL = 30 * 60 * 1000; // 30 minutes in ms

function _wxCacheKey(type, lat, lon) {
  return `peakly_wx_${type}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

function _wxCacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > WX_CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function _wxCacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

async function fetchWeather(lat, lon) {
  const key = _wxCacheKey("w", lat, lon);
  const cached = _wxCacheGet(key);
  if (cached) return cached;
  const url = `${METEO}/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,snowfall_sum,snowdepth_new`
    + `&hourly=uv_index`
    + `&current_weather=true`
    + `&timezone=auto&forecast_days=7`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Weather ${r.status}`);
  const data = await r.json();
  _wxCacheSet(key, data);
  return data;
}

async function fetchMarine(lat, lon) {
  const key = _wxCacheKey("m", lat, lon);
  const cached = _wxCacheGet(key);
  if (cached) return cached;
  const url = `${MARINE}/marine?latitude=${lat}&longitude=${lon}`
    + `&hourly=wave_height,swell_wave_height,swell_wave_period,wind_wave_height`
    + `&daily=wave_height_max,swell_wave_height_max`
    + `&timezone=auto&forecast_days=7`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Marine ${r.status}`);
  const data = await r.json();
  _wxCacheSet(key, data);
  return data;
}
```

**Effect:** First page load still fires all 192 calls (unavoidable on cold cache). Every subsequent load or 10-minute auto-refresh within 30 minutes reads from localStorage — zero network calls. At 30 concurrent users, daily Open-Meteo calls drop from ~50,000+ to ~192 (one cold cycle per 30-min window). This is the prerequisite for any growth push.

**Estimated fix time: 45 minutes**

---

## P1 — SERVICE WORKER CACHE NAME NEVER BUMPED

**Risk: Users get served stale index.html after a deploy.**

`sw.js` line 1: `const CACHE_NAME = "peakly-v1"` — this has never changed since the SW was created. The SW precaches `/peakly/index.html` and `/peakly/` using stale-while-revalidate. If `index.html` changes (new Plausible config, CDN version bump, cache-buster change), users who visited before may get the old `index.html` for hours until the SW decides to revalidate. This is how the outage happened previously.

Note: The SW precaches `/peakly/app.jsx` (bare path) while `index.html` loads `./app.jsx?v=20260325c` (with query param). These are different URLs so the versioned request bypasses the SW cache — that part accidentally works fine. The risk is on `index.html`.

**The fix — bump CACHE_NAME in sw.js:**

```javascript
// sw.js line 1 — bump this string on every deploy
const CACHE_NAME = "peakly-20260326";
```

Make bumping `CACHE_NAME` part of every deploy. Format: `peakly-YYYYMMDD`. One file, one line.

**Estimated fix time: 2 minutes**

---

## P1 — CACHE-BUSTER IS ONE DAY STALE

`index.html` line 95: `./app.jsx?v=20260325c`

Today is 2026-03-26. Multiple commits have landed since this was set. If any CDN or proxy edge is caching `app.jsx`, visitors may be running yesterday's code. The convention is to bump this on every push.

**The fix:**

```html
<!-- index.html line 95 -->
<script type="text/babel" src="./app.jsx?v=20260326a" data-presets="react"></script>
```

**Estimated fix time: 30 seconds**

---

## P2 — SENTRY DSN EMPTY

`app.jsx` line 6: `const SENTRY_DSN = ""; // TODO: Add Sentry DSN after signup`

Zero production error visibility. If Babel fails to parse a JSX syntax error, or a runtime crash hits the ErrorBoundary, you have no record of it except the user's console. The ErrorBoundary logs to `peakly_errors` in localStorage — which is only readable if you can access the user's browser.

**The fix — 5 minutes at sentry.io:**

1. Go to sentry.io → New Project → Browser JavaScript → Free tier
2. Copy the DSN (looks like `https://abc123@o456789.ingest.sentry.io/123456`)
3. In `app.jsx` line 6:

```javascript
const SENTRY_DSN = "https://YOUR_DSN_HERE@o123456.ingest.sentry.io/123456";
```

The Sentry-lite reporter at lines 1–66 is already wired to use this DSN. No SDK needed. It already handles global `window.onerror` and `unhandledrejection`.

**Estimated fix time: 5 minutes (Jack action)**

---

## P2 — UNPINNED CDN DEPENDENCY (REACT@18 / REACTDOM@18)

`index.html` lines 72–73 load `react@18` and `react-dom@18` without a specific patch version. unpkg resolves `@18` to whatever the latest 18.x release is today. This means:
- A new React 18.x patch could silently ship breaking behavior
- No SRI (Subresource Integrity) hash — a compromised unpkg edge could serve malicious code

Babel Standalone is correctly pinned to `7.24.7` — good practice, apply the same to React.

**The fix — pin to 18.3.1 with SRI:**

First, generate SRI hashes (run on Mac or VPS):
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then replace lines 72–73 in `index.html`:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE" crossorigin="anonymous"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE" crossorigin="anonymous"></script>
```

**Estimated fix time: 15 minutes**

---

## P2 — PLAUSIBLE DOMAIN MISMATCH (FUTURE RISK)

`index.html` line 27: `data-domain="j1mmychu.github.io"`

When peakly.app goes live (post-LLC), Plausible will stop recording events unless this is updated. Low urgency now but will create a silent data gap at launch if missed.

**The fix (when domain goes live):**

```html
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

**Estimated fix time: 30 seconds**

---

## Performance Analysis

**JavaScript loaded on first visit:**

| Asset | Size (gzipped est.) | Notes |
|---|---|---|
| Babel Standalone 7.24.7 | ~2.0 MB | Largest single asset |
| ReactDOM 18 UMD prod | ~1.1 MB | Required |
| React 18 UMD prod | ~130 KB | Required |
| app.jsx (raw JSX) | ~395 KB | Transpiled at runtime by Babel |
| **Total first-load JS** | **~3.6 MB** | Gzipped from CDN |

**Bottleneck #1: Babel Standalone.** It's 2MB that runs once to parse 395KB of JSX. After first load the browser caches it from unpkg CDN. For returning users this is zero cost. For first-time mobile visitors on 3G: expect 8–12 second first meaningful paint. Not fixable without a build step — this is the architecture trade-off.

**Image lazy loading:** Verified — all 8 `<img>` elements in app.jsx have `loading="lazy"`. No action needed.

**192 concurrent HTTP requests on cold load:** Even with weather caching (P0 fix), the first cold load fires 192 weather + 80 marine calls simultaneously. Browsers limit to 6 concurrent connections per HTTP/1.1 origin. Open-Meteo uses HTTP/2 (multiplexing), so parallelism is fine. But it's still a thundering herd on cold start. Future optimization: fetch top 20 venues first, lazy-fetch remaining 172 as user scrolls.

---

## Cost Projections

**Current: $6/month (DigitalOcean 1GB droplet + GitHub Pages free)**

| MAU | Infra Cost | Notes |
|---|---|---|
| Current (~0) | $6/mo | VPS handles flight proxy, no issues |
| 1K MAU | $6/mo | No changes needed. ~15 flight proxy req/user/session, 1GB RAM sufficient. |
| 10K MAU | $12–18/mo | Upgrade droplet to 2GB ($12). Add in-memory flight price cache on VPS. Consider Cloudflare free tier in front of GitHub Pages. |
| 100K MAU | $60–120/mo | Load balancer ($12) + 2× app servers ($24 each) + Redis ($15) + Cloudflare Pro ($20) + Open-Meteo commercial tier ($29). |

Open-Meteo cost break: with the P0 weather cache fix, free tier covers up to ~1K MAU. At 10K MAU, move to Open-Meteo's API tier (~$29/month) or build a server-side weather proxy with 30-min caching.

---

## What Breaks First at Scale

**Open-Meteo is the single point of failure that kills the app before anything else.** At ~5 active users with no weather cache, you blow the 10K daily free tier. The symptom is completely silent: all venue scores show 0, weather displays go blank, users see a broken Explore tab with no error message and no feedback. There is no monitoring to detect this. The fix is 45 minutes of code. The second failure point is the DigitalOcean VPS at 1GB RAM — the flight proxy is a simple Node.js process that will start queuing at ~500 concurrent users. Fix is a 20-line in-memory LRU cache on the server keyed by `${origin}-${destination}` with a 5-minute TTL. Nothing in client code changes.

---

## Action Items (Ordered)

| Priority | Owner | Action | Time |
|---|---|---|---|
| P0 | Dev | Weather/marine localStorage cache (30-min TTL) | 45 min |
| P1 | Dev | Bump SW cache name to `peakly-20260326` | 2 min |
| P1 | Dev | Bump cache-buster to `v=20260326a` | 30 sec |
| P2 | Jack | Add Sentry DSN at sentry.io (free tier) | 5 min |
| P2 | Jack | Sign up for REI Avantlink (no LLC needed) | 30 min |
| P2 | Dev | Pin React/ReactDOM to 18.3.1 with SRI hashes | 15 min |
| Future | Dev | Add flight price LRU cache on VPS Node server | 20 min |
| Future | Dev | Update Plausible domain to peakly.app when live | 30 sec |
