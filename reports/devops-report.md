# Peakly DevOps Report — 2026-03-28

**Overall Status: YELLOW**
Three issues require action before any growth push. No P0 security incidents. One revenue-killing placeholder (TP_MARKER) has been silently broken since deployment — every flight click earning $0 commission.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ✅ GREEN | app.jsx 8,695 lines / 1.25 MB |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` confirmed |
| Proxy timeout/fallback | ✅ GREEN | 5s timeout, AbortController, semaphore (max 3), retry backoff |
| Plausible analytics | ✅ GREEN | Present, uncommented, firing |
| Secrets in client code | ✅ GREEN | No tokens exposed. Travelpayouts token server-side only |
| .gitignore | ✅ GREEN | Covers .env, .env.*, *.pem, *.key |
| Sentry DSN | ✅ GREEN | Live — `9416b032a46681d74645b056fcb08eb7` at peakly.sentry.io |
| Weather cache | ✅ GREEN | 30-min TTL, localStorage, WX_CACHE_TTL confirmed |
| Image lazy loading | ✅ GREEN | All 8 img tags have `loading="lazy"` |
| source.unsplash.com URLs | ✅ GREEN | Zero unstable URLs — all 2,226 use stable photo IDs |
| Flight semaphore | ✅ GREEN | Max 3 concurrent — prevents VPS flood |
| TP_MARKER | ❌ P0 | "YOUR_TP_MARKER" placeholder — earning $0 commission |
| Cache-buster | ⚠️ P1 | `v=20260326a` — 2 days stale |
| SW cache version | ⚠️ P1 | `peakly-20260326` — stale, deployed changes not forced on users |
| React CDN version | ⚠️ P1 | `react@18` unpinned — silent breakage risk |
| Open-Meteo rate limit | ⚠️ P1 | Free tier breaks at ~50 DAU — pre-growth blocker |

---

## CRITICAL (P0) — Fix Before Launch

### P0-1: TP_MARKER is a placeholder — earning $0 on every flight click
**File:** `app.jsx:3666`

```js
// CURRENT (broken):
const TP_MARKER = "YOUR_TP_MARKER";

// FIX — replace with your actual marker from tp.media dashboard:
const TP_MARKER = "YOUR_ACTUAL_MARKER_ID";
```

Log in to https://tp.media → My Programs → Markers → copy your marker ID. This is a one-line fix. The guard at line 3685 confirms: if TP_MARKER equals "YOUR_TP_MARKER", it bypasses the affiliate URL entirely and generates a non-commission deep link. Every day this is unset is a day of zero flight revenue.

**Time to fix: 2 minutes. Jack action (needs tp.media login).**

---

## HIGH (P1) — Fix This Week

### P1-1: Cache buster is 2 days stale (`v=20260326a`)
**File:** `index.html:247`

```html
<!-- CURRENT: -->
<script type="text/babel" src="./app.jsx?v=20260326a" data-presets="react"></script>

<!-- FIX: -->
<script type="text/babel" src="./app.jsx?v=20260328a" data-presets="react"></script>
```

SW cache name also needs bumping simultaneously:

```js
// sw.js line 2:
const CACHE_NAME = "peakly-20260328";
```

Any user who loaded the app on March 26 and hasn't hard-refreshed may be served stale content. Both values must stay in sync — a stale CACHE_NAME means the SW never evicts old assets even when index.html changes.

**Time to fix: 2 minutes.**

### P1-2: Open-Meteo will be rate-limited at ~50 DAU
**File:** `app.jsx:8378-8411`

Smart weather loads the top 100 venues on mount (100 weather + 100 marine = 200 API calls per cold session). Open-Meteo free tier = 10,000 calls/day.

**Math:**
- 50 DAU × 200 calls/session = 10,000 calls/day → exactly at the limit
- 100 DAU → 20,000 calls/day → **2x over, 429s begin**
- 500 DAU → 100,000 calls/day → **complete API failure, no venue scores**

When Open-Meteo 429s, venues show with null scores, the hero card disappears (it gates on weather loading), and users see a broken app with no explanation. The fix before a Reddit/TikTok campaign:

**Short-term (buy time):** Increase cache TTL from 30 min to 2 hours:
```js
// app.jsx line 2941:
const WX_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours (was 30 min)
```

**Real fix (before growth push):** Sign up for Open-Meteo commercial plan at $29/month — gives 10M calls/month, handles ~1,700 DAU before next tier. This is a Jack action (credit card, 5 minutes).

**Time to fix cache TTL: 1 minute. Open-Meteo signup: 5 minutes (Jack).**

### P1-3: React CDN is unpinned (`react@18`) — silent breakage risk
**File:** `index.html:80-81`

```html
<!-- CURRENT (risky): -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- FIX — pin to exact patch version: -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

`@18` resolves to whatever unpkg considers latest-18.x. A breaking minor or patch pushes silently without a deploy on your side. Current latest stable is 18.3.1.

**Time to fix: 2 minutes.**

### P1-4: Plausible domain is `j1mmychu.github.io` — breaks silently on domain migration
**File:** `index.html:32`

Not broken today. Will silently lose all analytics the moment the domain migrates to peakly.app without a code change. Also: all OG meta tags, canonical links, and JSON-LD structured data reference `j1mmychu.github.io`. Domain migration checklist must include a find-replace across index.html.

```bash
# When peakly.app is live, run:
sed -i 's/j1mmychu.github.io\/peakly/peakly.app/g' index.html
```

**Time to fix: 5 minutes when domain migrates.**

---

## MEDIUM (P2) — Fix This Sprint

### P2-1: Service worker PRECACHE misses versioned `app.jsx` URL
**File:** `sw.js:4-7`

PRECACHE lists `/peakly/app.jsx` (no query param). But `index.html` requests `./app.jsx?v=20260326a`. The SW caches the un-versioned path at install time, but all runtime requests include a query string — the SW cache never hits for app.jsx. It falls through to network every time. The SW is doing nothing for your 1.25MB main file.

```js
// sw.js — fix PRECACHE to use versioned URL matching index.html:
const APP_VERSION = "20260328a"; // keep in sync with index.html cache buster
const PRECACHE = [
  "/peakly/",
  "/peakly/index.html",
  `/peakly/app.jsx?v=${APP_VERSION}`
];
```

**Time to fix: 5 minutes.**

### P2-2: Sentry allowed-origins not configured — quota abuse risk
**File:** Sentry dashboard (not code)

Sentry DSN `9416b032a46681d74645b056fcb08eb7` is live and correct. However, without `allowedOrigins` set, anyone who finds the DSN in the client source can spam your Sentry event quota. In the Sentry dashboard: **Project Settings → Security → Allowed Domains** → add:
- `https://j1mmychu.github.io`
- `https://peakly.app`

**Time to fix: 5 minutes in Sentry dashboard. Jack action.**

### P2-3: No retry on Open-Meteo 429s — venues silently show no score
**File:** `app.jsx` — fetchWeather/fetchMarine functions

Both weather fetch functions return null on any error with no retry. A single 429 silently removes a venue from scoring, pushing it to the bottom of the list. Users interpret this as app quality issues. Add a single retry with 2s backoff on 429:

```js
// In fetchWeather and fetchMarine, before the final return null:
if (r.status === 429) {
  await new Promise(res => setTimeout(res, 2000));
  // retry once
}
```

**Time to fix: 20 minutes.**

---

## Infrastructure Checks — PASSED

| Check | Status | Detail |
|-------|--------|--------|
| FLIGHT_PROXY URL | ✅ HTTPS | `https://peakly-api.duckdns.org` confirmed at line 3481 |
| Travelpayouts token in client | ✅ CLEAN | Token is server-side only. Zero API keys in app.jsx |
| .gitignore | ✅ EXISTS | Covers `.env`, `.env.*`, `*.key`, `*.pem` |
| Sentry DSN | ✅ LIVE | Active at peakly.sentry.io |
| Recent commits for secrets | ✅ CLEAN | Last 15 commits reviewed — no credential leaks |
| Images with loading="lazy" | ✅ ALL | All 8 img tags confirmed |
| source.unsplash.com URLs | ✅ ZERO | All 2,226 photos use stable IDs |
| Flight timeout | ✅ 5s | AbortController with 5s timeout |
| Flight retry | ✅ 3 attempts | Exponential backoff (1.2s, 2.4s) |
| Plausible analytics | ✅ ACTIVE | Present, uncommented, 5+ custom events tracked |

---

## Performance Analysis

**JavaScript bundle load (first visit, uncompressed):**

| Asset | Size | Notes |
|-------|------|-------|
| `app.jsx` | 1.25 MB | 8,695 lines, entire app |
| `babel.min.js` | ~1.8 MB | Client-side transpiler — THE bottleneck |
| `react.production.min.js` | ~42 KB | Minified |
| `react-dom.production.min.js` | ~130 KB | Minified |
| Sentry loader | ~15 KB | Async, doesn't block |
| **Total first-load JS** | **~3.2 MB** | Transpiled at runtime |

**Biggest bottleneck: Babel Standalone.** Every user downloads 1.8MB of compiler, then the browser transpiles 1.25MB of JSX before any UI renders. On a mid-tier Android on 4G: 4–8 seconds of blank screen before the splash animates. This is the accepted architectural trade-off (no build step). When ready to fix, the pre-transpile approach eliminates the 1.8MB Babel dependency entirely:

```bash
# One-time deploy step — pre-transpile JSX to plain JS:
npx @babel/core --presets @babel/preset-react app.jsx -o app.js
# Then in index.html, drop type="text/babel" and load app.js directly
```
This is not urgent for launch but is the highest-ROI performance improvement available.

All images use `loading="lazy"` — confirmed across all 8 img tags.

---

## Cost Projection

| Tier | MAU | DAU est. | Open-Meteo calls/day | VPS | Open-Meteo | Total/mo |
|------|-----|----------|----------------------|-----|------------|----------|
| Now | <100 | <10 | <2,000 | $6 | Free | **$6** |
| Soft launch | 500 | 50 | ~10,000 | $6 | Free (at limit) | **$6** |
| Post-Reddit | 2,500 | 250 | ~50,000 | $6 | **$29 commercial** | **$35** |
| Growth | 10,000 | 1,000 | ~200,000 | $12 (2GB) | $29 | **$41** |
| Scale | 100,000 | 10,000 | ~2,000,000 | $48 (4×$12) | $99 | **$147** |

Unit economics are excellent. VPS only handles flight proxy requests — GitHub Pages serves all static assets. At 100K MAU: ~$147/month infrastructure vs ~$3,300/month revenue at post-LLC RPM ($33/1K MAU) = **22× margin**.

---

## What Breaks First at Scale

**Open-Meteo rate limits will be the first thing that kills Peakly in production.** The free tier caps at 10,000 calls/day. Smart weather batching fires ~200 API calls per cold user session. The app hits the wall at ~50 DAU — well below any meaningful growth campaign. Above that threshold, 429s cause venues to show with null scores, the hero card disappears, and users bounce with no error message. The fix costs $29/month and must be active before any Reddit or TikTok distribution push. Do not drive paid or organic traffic until the Open-Meteo commercial plan is live. Secondary scaling risk: the 1GB DigitalOcean VPS will start queuing Node.js requests at ~500 concurrent flight lookups — a 20-line in-memory LRU cache on the VPS (keyed by `${origin}-${destination}`, 5-min TTL) eliminates this risk cheaply before upgrading hardware.

---

## Action Items

| Priority | Owner | Action | Time | Status |
|---|---|---|---|---|
| P0 | Jack | Set TP_MARKER to real marker ID from tp.media | 2 min | ⏳ PENDING |
| P1 | Dev | Bump cache-buster to `v=20260328a` + SW to `peakly-20260328` | 2 min | ⏳ PENDING |
| P1 | Jack | Buy Open-Meteo commercial plan ($29/mo) before growth push | 5 min | ⏳ PENDING |
| P1 | Dev | Increase WX_CACHE_TTL to 2 hours (short-term rate limit buffer) | 1 min | ⏳ PENDING |
| P1 | Dev | Pin React/ReactDOM to `@18.3.1` in index.html | 2 min | ⏳ PENDING |
| P2 | Dev | Fix SW PRECACHE query param mismatch | 5 min | ⏳ PENDING |
| P2 | Jack | Set Sentry allowed origins in dashboard | 5 min | ⏳ PENDING |
| P2 | Dev | Add 429 retry to fetchWeather/fetchMarine | 20 min | ⏳ PENDING |
| Future | Jack | Update Plausible domain + all URLs when peakly.app goes live | 5 min | BLOCKED (domain) |
| Future | Dev | VPS Node.js flight price in-memory LRU cache | 20 min | ⏳ PENDING |
| Future | Dev | Pre-transpile app.jsx to eliminate 1.8MB Babel Standalone | 1 hr | ⏳ PENDING |
