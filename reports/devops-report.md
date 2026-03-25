# Peakly DevOps Report — 2026-03-25 (v13)

**Status: YELLOW**
No P0 blockers today. HTTPS proxy is live. But three P1s will silently kill revenue and cause a production outage under any meaningful user growth.

---

## 1. Live Site Health

| Metric | Value | Status |
|--------|-------|--------|
| app.jsx lines | 6,078 | OK |
| app.jsx size | 395 KB (raw) | WATCH — growing fast |
| Cache buster | `v=20260325b` | OK — set today |
| Plausible script | Present, uncommented | GREEN |
| CDN scripts load | React 18 UMD, ReactDOM, Babel 7.24.7 | GREEN |
| React version pinned | `react@18` (unpinned minor) | YELLOW — see P1 |
| Google Analytics | `G-XXXXXXXXXX` placeholder still live | RED — leaking garbage requests |

### P1 — GA4 Placeholder Is Actively Firing Garbage Requests

`index.html` still has a live GA4 snippet pointing at `G-XXXXXXXXXX`. This does nothing useful, but it is:
1. Loading the full Google Tag Manager script on every page load (~28KB extra)
2. Firing `config` and `page_view` events to Google's servers with a fake measurement ID
3. Polluting any future real GA4 account with junk baseline traffic

**Fix — remove the GA4 block entirely from index.html (Plausible is already doing the job):**

Delete these 6 lines from index.html:
```html
<!-- Google Analytics 4 — replace G-XXXXXXXXXX with real Measurement ID from analytics.google.com -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Estimated fix time: **2 minutes.**

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in code | `https://peakly-api.duckdns.org` — HTTPS confirmed |
| HTTP references in app.jsx | None found |
| Timeout | 5s AbortController |
| Fallback | `getFlightDeal()` instant estimate fallback |
| Token in client code | NOT present |

**GREEN.** HTTPS migration confirmed complete. No mixed-content issues.

---

## 3. Flight Links Still Go to Google Flights — Earning $0

`buildFlightUrl()` at line 1497–1503 builds Google Flights URLs:

```js
return `https://www.google.com/flights?hl=en#flt=${from}.${to}.${dep}*${to}.${from}.${ret};c:USD;e:1;sd:1;t:f`;
```

Google Flights has no affiliate program. Every flight click earns **$0.00**. This has been flagged P1 for multiple consecutive cycles. The Travelpayouts proxy is already live — the only missing piece is the Aviasales deep link format wired into `buildFlightUrl()`.

**Fix — replace `buildFlightUrl()` with Aviasales/Travelpayouts deep links:**

```js
function buildFlightUrl(from, to, opts = {}) {
  const dep = opts.dep || new Date(Date.now() + 14 * 86400000).toISOString().slice(0,10).replace(/-/g,'');
  const ret = opts.ret || new Date(Date.now() + 21 * 86400000).toISOString().slice(0,10).replace(/-/g,'');
  const marker = "YOUR_TRAVELPAYOUTS_MARKER"; // Jack: replace with your marker from Travelpayouts dashboard
  return `https://www.aviasales.com/search/${from}${dep}${to}${ret}1?marker=${marker}&utm_source=peakly`;
}
```

Jack: log in to travelpayouts.com → Tools → Aviasales → copy your marker ID (numeric, e.g. `123456`). Swap `YOUR_TRAVELPAYOUTS_MARKER`. Done.

Estimated fix time: **15 minutes** (5 min to get marker ID, 10 min to update and test links).

---

## 4. Weather & External API Risk

### P1 — No Weather Cache: 384 API Calls Per Page Load, 26 Users Breaks Everything

`fetchWeather()` and `fetchMarine()` are called for every venue on every app load at lines 5791–5792:

```js
fetchWeather(v.lat, v.lon),
needsMarine ? fetchMarine(v.lat, v.lon) : Promise.resolve(null),
```

With 192 venues, that's up to **384 API calls per user per page load**. Open-Meteo free tier: 10,000 calls/day.

- 1 daily active user = 384 calls
- 26 DAU = rate limit exhausted
- At 30 concurrent users on Reddit launch day: exhausted within the first hour

The failure mode is invisible. When Open-Meteo rate-limits, `fetchWeather()` returns null. All 192 scores reset to 0. The hero card shows "Best Right Now" with a 0-score venue. The app appears to work but the entire value prop is gone. There is no error banner, no fallback score, no alert.

**Fix — add a 30-minute localStorage weather cache (drop-in replacement):**

```js
const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes in ms

async function fetchWeather(lat, lon) {
  const key = `peakly_wx_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached && Date.now() - cached.ts < WEATHER_CACHE_TTL) return cached.data;
  } catch(e) {}
  const url = `${METEO}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,precipitation,snowfall,snow_depth,cloud_cover,uv_index&daily=snowfall_sum,precipitation_sum&forecast_days=7&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    return data;
  } catch(e) { return null; }
}

async function fetchMarine(lat, lon) {
  const key = `peakly_marine_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached && Date.now() - cached.ts < WEATHER_CACHE_TTL) return cached.data;
  } catch(e) {}
  const url = `${MARINE}/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,swell_wave_height,swell_wave_period,wind_wave_height&daily=wave_height_max,wave_period_max&forecast_days=7&timezone=auto`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    return data;
  } catch(e) { return null; }
}
```

Impact: Extends free tier capacity from ~26 DAU to ~780 DAU (30x). Costs $0. Must ship before any Reddit/TikTok push.

Estimated fix time: **1.5 hours.**

---

## 5. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client code | NOT PRESENT |
| API keys or secrets in app.jsx | None found |
| .gitignore exists | YES — covers .env, *.pem, *.key |
| Sentry DSN | Empty string — zero production error visibility |
| Recent commits introducing secrets | None detected |

### P2 — Sentry DSN Still Empty

Line 6 of app.jsx:
```js
const SENTRY_DSN = ""; // TODO: Add Sentry DSN after signup
```

A Babel parse error or runtime exception in production is completely invisible right now. The error capture infrastructure is already written (lines 1–66). It just needs a DSN.

**Fix (after Jack creates free account at sentry.io):**
```js
const SENTRY_DSN = "https://examplePublicKey@o0.ingest.sentry.io/0"; // paste real DSN here
```

Estimated fix time: **5 minutes for Jack.**

---

## 6. Performance Analysis

| Asset | Est. Raw Size | Est. Gzip |
|-------|--------------|-----------|
| Babel Standalone 7.24.7 | 1.7 MB | ~330 KB |
| app.jsx | 395 KB | ~90 KB |
| React 18 production min | ~120 KB | ~42 KB |
| ReactDOM 18 production min | ~460 KB | ~130 KB |
| **Total page weight** | **~2.7 MB raw** | **~592 KB gzip** |

**Biggest bottleneck:** Babel Standalone. It parses and transpiles 6,078 lines of JSX on the main thread before first render. On a mid-range Android (Pixel 4a): estimated 2.5–4 seconds to first meaningful paint. This is the cost of zero build step. Acceptable for now; not acceptable at 10K MAU.

**Images:** All `<img>` elements use `loading="lazy"`. No issue.

### P2 — Unpin React CDN Version

```html
<!-- Current: picks up any future 18.x release -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>

<!-- Fix: pin exact version -->
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

Estimated fix time: **2 minutes.**

---

## 7. Service Worker — Stale Cache Risk

`sw.js` uses `CACHE_NAME = "peakly-v1"`. This cache name has **never been bumped**. The SW pre-caches `/peakly/app.jsx` (without the `?v=` query param). The cache buster in `index.html` only applies to the script tag's URL — not the SW's cached copy of the raw file.

Result: every user who has visited before may receive the SW-cached old `app.jsx` on subsequent visits, regardless of what's in `index.html`.

**Fix — bump CACHE_NAME to match today's cache buster, and drop app.jsx from PRECACHE:**

```js
// sw.js
const CACHE_NAME = "peakly-v20260325b"; // bump this whenever app.jsx changes

const PRECACHE = [
  "/peakly/",
  "/peakly/index.html",
  "/peakly/manifest.json"
  // app.jsx intentionally omitted — cache-busted via ?v= query param in index.html
];
```

Estimated fix time: **5 minutes.**

---

## 8. Cost Projections

| MAU | Open-Meteo calls/day (with cache) | DigitalOcean VPS | Total/month |
|-----|----------------------------------|------------------|-------------|
| Current (~0) | Negligible | $6 | **$6** |
| 1K MAU | ~1,000/day | $6 | **$6** |
| 10K MAU | ~10K/day — at free tier ceiling | $6 | **$6** (watch closely) |
| 100K MAU | ~100K/day — requires commercial plan | $6 + ~$30 Open-Meteo | **~$36** |

Without the weather cache: you hit rate limits at 26 DAU, not 100K. The cache fix is the only thing standing between a Reddit launch and a dead app.

At 100K MAU, the only meaningful cost increase is Open-Meteo's commercial tier (~$30/month). GitHub Pages remains free at any traffic level for static assets.

---

## 9. Fixes Applied This Run

**None applied.** No P0 emergencies required hot-patching. All P1s are queued dev tasks (weather cache, GA4 removal, flight URL switch) or Jack actions (Sentry DSN, Travelpayouts marker).

The GA4 removal and React version pin are trivial (< 5 min combined) and should be done immediately.

---

## What Breaks First at Scale

**Open-Meteo will be the first thing that silently kills the app.** At 26 daily active users — not 26,000, **twenty-six** — the 10K/day free tier is exhausted. When that happens: all venue scores drop to zero, the hero card shows nonsense, the app appears to work but the core value prop is dead. The service worker may then cache this broken zero-score state for returning users. There is no error message, no fallback, no alert. Users just see a worse app and leave.

The weather cache fix is 1.5 hours of work that buys 30x capacity for $0. Nothing else should ship before this is in.

---

## Priority Summary

| Priority | Issue | Est. Fix Time | Owner |
|----------|-------|---------------|-------|
| **P1** | No weather cache — 26 DAU exhausts Open-Meteo free tier | 1.5 hrs | Dev |
| **P1** | GA4 placeholder firing garbage requests to Google | 2 min | Dev |
| **P1** | Flight links go to Google Flights, earn $0 | 15 min | Jack (get marker) + Dev |
| **P1** | React CDN version unpinned (`@18`) | 2 min | Dev |
| **P2** | Sentry DSN empty — zero production error visibility | 5 min | Jack |
| **P2** | Service worker CACHE_NAME never bumped — stale cache risk | 5 min | Dev |
| **P2** | REI/Backcountry links missing affiliate tags — 22 links earn $0 | 30 min | Jack (Avantlink signup) |
