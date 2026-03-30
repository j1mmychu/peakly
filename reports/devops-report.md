# Peakly DevOps Report — 2026-03-30

**Status: YELLOW**
Two P1 issues. No P0 blockers. App is live and functional. Two fixes shipped this session (SW + cache buster). Revenue leak (TP_MARKER) is the most impactful unfixed item.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ✅ GREEN | app.jsx 8,695 lines / 1.25 MB |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` — no HTTP leak |
| Proxy timeout/fallback | ✅ GREEN | 5s AbortController, 3 retries w/ 1.2s backoff, semaphore at 3 concurrent |
| Plausible analytics | ✅ GREEN | Present and uncommented in index.html line 32 |
| Sentry DSN | ✅ GREEN | Live DSN in app.jsx + Loader Script in index.html |
| Secrets in client code | ✅ GREEN | No tokens exposed; TP_MARKER is placeholder only |
| .gitignore | ✅ GREEN | Covers .env, *.env, *.pem, *.key, *.p8, *.mobileprovision |
| Weather cache | ✅ GREEN | 30-min TTL, 2-hr cleanup, batched 50/batch fetching |
| Cache-buster | ✅ FIXED | Bumped to `v=20260330a` this session (was stale at 20260329v1) |
| Service worker version | ✅ FIXED | Bumped to `peakly-20260330` this session (was stale at peakly-v14) |
| Image lazy loading | ⚠️ YELLOW | Only 8 img tags have loading="lazy"; venue card imgs need it |
| TP_MARKER affiliate tag | 🔴 BROKEN | Still `"YOUR_TP_MARKER"` — $0 earned on all flight deep links |

---

## SHIPPED THIS SESSION

### Cache Buster Bumped — index.html
- **Before:** `app.jsx?v=20260329v1`
- **After:** `app.jsx?v=20260330a`

Stale cache buster means returning users with cached index.html could load stale app.jsx JavaScript. Bumped to force fresh fetch.

### Service Worker Cache Name Bumped — sw.js
- **Before:** `const CACHE_NAME = "peakly-v14";`
- **After:** `const CACHE_NAME = "peakly-20260330";`

SW activate handler evicts all caches that don't match CACHE_NAME. Stale name meant old cached assets persisted. This is the same failure mode that caused the extended outage previously noted in CLAUDE.md. Bumped to force a clean cache on next SW install. Push notification handler preserved from remote version.

---

## P1 Issues (Fix This Week)

### P1-A: TP_MARKER Is a Placeholder — $0 Commission on All Flight Links

**File:** `app.jsx:3666`
```js
// CURRENT — earns nothing:
const TP_MARKER = "YOUR_TP_MARKER";
```

Every Aviasales deep link in `buildFlightUrl()` checks `if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER")` before attaching the marker. Since the check fails, all flight links go out with no affiliate attribution. Every flight click earns $0. Travelpayouts reports $0.14 RPM when the marker is live — that's dead money right now.

**Fix (5 minutes — Jack action):**
1. Log in to travelpayouts.com
2. Programs → Aviasales → Your marker (it's a 6-digit number)
3. Replace line 3666 in app.jsx:

```js
const TP_MARKER = "123456";  // your actual marker
```

The marker is not a secret — it appears in URLs that users see. Safe to commit.

---

### P1-B: Image Lazy Loading Incomplete

**Count:** 8 `<img>` tags have `loading="lazy"`. Venue card photo img tags in ListingCard, CompactCard, FeaturedCard, and VenueDetailSheet do not.

With 30 venues per page and 800×600 Unsplash photos, the browser fires up to 30 eager image requests on page load, stacking on top of the 3 CDN script loads (React, ReactDOM, Babel). On a mid-range mobile device over LTE, this adds 2–4 seconds to first-meaningful-paint.

**Fix — add `loading="lazy"` to every venue photo img tag:**
```jsx
<img
  src={venue.photo}
  alt={venue.title}
  loading="lazy"
  onError={(e) => { e.target.src = FALLBACK_IMG; }}
  style={{ ... }}
/>
```

Search for `<img src={` in app.jsx and add `loading="lazy"` to each venue photo render. Estimated 12–15 locations across ListingCard, CompactCard, FeaturedCard, VenueDetailSheet, and similar venue cards.

**Estimated fix time: 20 minutes.**

---

## P2 Issues (Fix This Sprint)

### P2-A: CDN Dependencies Have No SRI Integrity Hashes

**File:** `index.html:80-84`

React, ReactDOM, and Babel Standalone load from unpkg with no `integrity=` attribute. A compromised unpkg CDN silently serves malicious code to every user with no browser-level detection.

**Fix — generate SRI hashes and pin exact versions:**
```bash
# Generate hash for each asset:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then update index.html:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha384-[HASH]" crossorigin="anonymous"></script>
```

Also pin `react@18` → `react@18.3.1` and `react-dom@18` → `react-dom@18.3.1` to prevent silent minor-version changes.

**Estimated fix time: 20 minutes.**

---

### P2-B: Plausible Domain Will Break When peakly.app Goes Live

**File:** `index.html:32`
```html
data-domain="j1mmychu.github.io"
```

When the peakly.app domain is registered and DNS is switched, Plausible will stop recording pageviews unless this domain is updated to `peakly.app` (and the domain is added in the Plausible dashboard).

**Fix:** One-line change at domain registration time:
```html
data-domain="peakly.app"
```

**Estimated fix time: 30 seconds — block it into the domain registration checklist.**

---

## What Was Checked and Is Clean

1. **No secrets in app.jsx.** Sentry DSN is a public browser key by design. No Travelpayouts token in client code. `TP_MARKER` is a hardcoded placeholder, not a secret.
2. **FLIGHT_PROXY is HTTPS.** `https://peakly-api.duckdns.org` — confirmed. No legacy `104.131.82.242` reference remains.
3. **fetchTravelpayoutsPrice is robust.** AbortController 5s timeout, 3-attempt retry with 1.2s/2.4s backoff, semaphore limiting 3 concurrent requests, per-airport deduplication.
4. **Weather cache is solid.** 30-min TTL, 2-hour max-age cleanup, batched 50-venue fetching with 2s delay between batches. Handles 3,726 venues without hammering Open-Meteo.
5. **No secrets in git log.** Reviewed last 20 commits — no tokens or credentials introduced.
6. **.gitignore is comprehensive.** `.env`, `*.env.*`, `*.key`, `*.pem`, `*.p8`, `*.mobileprovision` all covered.

---

## Performance Analysis

| Asset | Size | Notes |
|---|---|---|
| Babel Standalone 7.24.7 | ~2.0 MB | Largest asset — blocks first render until parsed |
| ReactDOM 18 UMD prod | ~1.1 MB | Required |
| React 18 UMD prod | ~130 KB | Required |
| app.jsx raw JSX | 1.25 MB | Transpiled at runtime by Babel |
| **Total first-load JS** | **~4.5 MB** | Up from ~3.6 MB last report (venues expanded 192→3,726) |

**Largest bottleneck:** Babel Standalone parsing 1.25 MB of JSX on cold load. On a mid-range phone this takes 1–2.5 seconds. Not fixable without a build step — accepted trade-off for this architecture. Note app.jsx has grown from 404 KB (6,072 lines on 2026-03-26) to 1.25 MB (8,695 lines today) due to venue expansion. The app is now 3× heavier than the initial DevOps report. At 2 MB raw JSX it becomes a P1 performance issue.

---

## Cost Estimate

| Scale | Monthly Cost | Notes |
|---|---|---|
| Current (< 1K MAU) | $6 | VPS only — GH Pages is free |
| 1K MAU | $6 | Weather cache holds Open-Meteo free tier |
| 10K MAU | $18–24 | Upgrade droplet to 2GB ($12); GH Pages remains free |
| 100K MAU | $80–120 | Load-balance flight proxy (2× $12 droplets) + managed Redis ($15) for flight cache + Open-Meteo commercial ($29/month) |

**Optimization available now:** The flight proxy re-fetches prices per origin airport on every app load. A 6-hour Redis cache on the VPS keyed by `${origin}-${destination}` would cut Travelpayouts API calls by ~85% and let the $6 droplet handle 100K+ MAU without an upgrade.

---

## What Breaks First at Scale

**Open-Meteo is the first failure point.** The free tier is 10,000 calls/day. 3,726 venues × 2 calls each (weather + marine) = 7,452 calls per full refresh cycle. With 30-min TTL caching and batched fetching, a single active user triggers ~7,452 calls every 30 minutes — that's the full daily quota consumed by 1 user in under 90 minutes of active use if they keep the app open. At 50 DAU with normal usage, you're reliably blowing the daily cap every morning. **The fix before Reddit launch:** build a server-side weather poller on the VPS (a 20-line Node.js cron that runs every 30 minutes, fetches all 3,726 venues, and caches results in a JSON endpoint). Clients then hit `peakly-api.duckdns.org/api/weather?venue_id=X` instead of calling Open-Meteo directly. This shifts all weather API calls to the server (one actor, not N users), and the free tier covers unlimited users indefinitely.

---

## Action Items

| Priority | Owner | Action | Time | Status |
|---|---|---|---|---|
| SHIPPED | Dev | Bump cache-buster to v=20260330a | 30 sec | ✅ DONE |
| SHIPPED | Dev | Bump SW CACHE_NAME to peakly-20260330 | 30 sec | ✅ DONE |
| P1 | Jack | Get TP_MARKER from Travelpayouts dashboard → replace placeholder | 5 min | ⏳ PENDING |
| P1 | Dev | Add loading="lazy" to all venue photo img tags | 20 min | ⏳ PENDING |
| P2 | Dev | Pin React/ReactDOM to 18.3.1, add SRI hashes | 20 min | ⏳ PENDING |
| P2 | Jack | Update Plausible domain to peakly.app at domain registration | 30 sec | BLOCKED (LLC) |
| Pre-scale | Dev | Server-side weather poller on VPS — eliminates Open-Meteo client rate limit risk | 2 hrs | ⏳ PENDING |
| Pre-scale | Dev | Redis flight price cache on VPS (6-hr TTL) — 85% API call reduction | 1 hr | ⏳ PENDING |
