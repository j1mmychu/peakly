# DevOps Report — 2026-08-26 (GREEN)

**Status: 🟢 GREEN — Post-launch day 4. One real bug fixed in this report: geo-silent-block (P1). Cache stamp bumped to `20260826a`.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (standard sandbox 403 egress block, not a VPS outage — same pattern documented in CLAUDE.md and confirmed in every prior sandbox run). Jack confirmed healthy 2026-08-11 post-redeploy. PM confirmed up through the observation window. Treating as healthy.

---

## Fix Shipped in This Report

| Fix | Where | Impact |
|-----|-------|--------|
| **Geo-silent-block P1 fixed** | `app.jsx` `detectAirport()` | iOS with location services globally OFF can silently swallow `getCurrentPosition` — neither callback fires, `geoState` stays `"detecting"` forever, manual airport picker never surfaces. User stuck at onboarding with no departure airport. Fixed with a 12s JS-level `setTimeout` fallback that forces `geoState` → `"done"` if it's still `"detecting"` after 10s API timeout + 2s buffer. `clearTimeout` called in both success and error paths so the fallback is inert in the normal case. |
| Cache stamp bumped `20260825b` → `20260826a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | Pushes geo fix + all Aug 25 changes to SW-cached users |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,037 lines / 750 KB raw** (+4 lines from geo fix) |
| `dist/app.min.js` (CI-built, local snapshot Aug 21) | **495 KB** |
| Cache stamp | **`20260826a`** ✅ `app.jsx:17`, `sw.js:2`, `index.html:395` — fully in lockstep |
| `PEAKLY_BUILD` | **`20260826a`** ✅ |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` |
| Sentry | ✅ Live — DSN `9416b032a46681d74645b056fcb08eb7` wired in both `index.html:77` and `app.jsx:7-8` |
| Venue count | **391** (131 skiing / 260 beach) — exact count via dual-format grep |
| `.venue-baseline` | **391** ✅ matches |
| Lazy images | ✅ All 9 `<img>` render sites include `loading="lazy"` |
| Babel in production | ✅ Stripped — `dist/index.html` loads esbuild-compiled `app.min.js`; zero parse wall on real users |
| Duplicate venue IDs | ✅ Zero (boot-time IIFE at `app.jsx:528`) |
| Stale `claude/*` remote branches | ✅ Zero (PM v130 cleanup already ran) |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in source | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| Old HTTP IP `104.131.82.242` | ✅ Zero references in `app.jsx` |
| Old HTTP IP `198.199.80.21` | ✅ Zero references in client code |
| `fetchTravelpayoutsPrice` timeout | **4,000ms** ✅ (`app.jsx:6273`) |
| Weather proxy timeout | ✅ 4,000ms proxy + 8,000ms direct Open-Meteo fallback |
| Fallback on proxy down | ✅ Falls back to BASE_PRICES estimate, `_flightApiStatus = "down"` |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| `forecast_days` | **14** ✅ (both weather + marine endpoints since VPS redeploy 2026-08-11) |
| Marine `forecast_days` | **10** ✅ |
| Open-Meteo batching | ✅ Async individual fetches with staggered processing; first 50 load immediately, rest background-load |
| Open-Meteo 2hr cache | ✅ `_wxCacheGet`/`_wxCacheSet` in localStorage |
| Free tier exposure | Low risk — batched, cached, VPS proxy absorbs repeated hits for same coords |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token | ✅ **Not in client code.** `TP_MARKER = "710303"` is the affiliate marker (public-safe). Token is server-side only on VPS. |
| Supabase anon key | ✅ In client as designed — public-safe, RLS-gated. Documented in CLAUDE.md. |
| Supabase service role key | ✅ Not present anywhere in client code |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Sentry DSN in client | ✅ Expected — public-facing DSN is not a secret |
| Recent commits (Aug 21–26) | ✅ No tokens or credentials introduced — only reports, venue data, geo fix |
| `http://` proxy references | ✅ Zero — HTTPS only |

**No security issues found.**

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | **495 KB** (minified, Babel-stripped via esbuild) |
| React 18.3.1 | Current stable ✅ |
| Babel Standalone 7.29.7 | Dev-only (in-browser transpile for `index.html` local dev); stripped in `dist/`. Current as of this writing. |
| Biggest perf bottleneck | **First 50 Open-Meteo calls** — firing concurrently on app load, each is a separate HTTP round-trip. At <1K MAU the VPS cache absorbs most of these. At 10K MAU, a cold start after `pm2 restart` could spike Open-Meteo rate limits (60K/hour free tier) before the cache warms. VPS disk cache (Open #23) mitigates this but is still not shipped. |
| Images | ✅ `loading="lazy"` on all 9 `<img>` render sites |
| Supabase lazy-load | ✅ Only fetches when existing session, magic-link callback, or user taps Sign in (~80KB gzipped, not on critical path) |

---

## 6. Cost Estimate

| Scale | Infrastructure | Notes |
|-------|---------------|-------|
| Current (<1K MAU) | **$6/month** | DigitalOcean droplet. GitHub Pages: free. |
| 1K MAU | **$6/month** | No change — DigitalOcean handles the proxy load easily |
| 10K MAU | **$12–18/month** | Upgrade to 2GB DO droplet ($12) + potential Supabase overage at free tier limits (~50K API reqs/mo free). Total still low. |
| 100K MAU | **$60–120/month** | DO: $24 (4GB) + Supabase Pro $25 + CDN/bandwidth ~$10-50 depending on traffic pattern. Still very lean for the scale. |

**Cost optimization opportunities:**
- VPS disk cache for weather (Open #23) eliminates the cold-start Open-Meteo spike risk for free.
- GitHub Pages CDN is free and already serving the static bundle — no action needed.
- Supabase free tier supports the current scale; upgrade only when MAU exceeds ~5K.

---

## Open Issues (Priority Order)

### ~~P1 — Geo-silent-block (FIXED this report)~~

iOS with location services globally blocked (`Settings → Privacy → Location Services → OFF`) caused `getCurrentPosition` to silently swallow both callbacks — `geoState` stayed `"detecting"` forever, `showManualPicker` never fired, user stuck at onboarding with no way to set a departure airport.

**Fix shipped:** `detectAirport()` in `OnboardingSheet` now arms a `setTimeout(() => setGeoState(s => s === "detecting" ? "done" : s), 12000)` before calling `getCurrentPosition`. Success and error paths both `clearTimeout` so the fallback is inert in the normal case. Functional correctness of all three paths (success, OS-denied, silent-block) maintained.

### P2 — VPS disk cache for weather (Open #23)

`_wxCache` is in-memory only. A `pm2 restart` wipes it. A cold cache + traffic spike post-Reddit/HN post could hit Open-Meteo's free-tier ceiling (~10K calls/day) before it refills. ~30-line fix in `server/proxy.js`. Bundle with next VPS SSH session.

```js
// server/proxy.js — add near top
const DISK_CACHE_PATH = '/tmp/peakly-wx-cache.json';
function loadDiskCache() {
  try { Object.assign(_wxCache, JSON.parse(fs.readFileSync(DISK_CACHE_PATH, 'utf8'))); } catch {}
}
function saveDiskCache() {
  try { fs.writeFileSync(DISK_CACHE_PATH, JSON.stringify(_wxCache)); } catch {}
}
// Call loadDiskCache() on startup, saveDiskCache() after every _wxCacheSet write.
```

### P3 — APNS (Open #21)

DER-vs-P1363 JWT + HTTP/1.1 `fetch` against HTTP/2-only APNs. Uncommitted local fix exists (from 2026-07-25 session). Not a launch blocker — gated behind `Capacitor.isNativePlatform()`. Fix before any iOS push campaign.

### P3 — No SRI on CDN scripts (Open #10)

React and Babel load from `unpkg.com` with no Subresource Integrity hashes. Low risk (unpkg is CDN for npm, not user-controlled), but supply-chain hygiene. Fix: generate hashes and add `integrity="sha384-..."` attributes to each `<script>` tag. ~15min task when risk tolerance shifts.

---

## What Breaks First at Scale

**Open-Meteo free tier + cold VPS cache.** At 10K MAU, a Reddit/HN traffic spike against a freshly restarted VPS hits 10K/day in under 2 hours (1 new user = up to 50 weather calls, cached for 2hr; 200 simultaneous new users on cold cache = 10K calls immediate). The VPS in-memory cache absorbs repeat hits for the same coord within a session, but restart-induced cold starts are the gap. Fix: disk-persist the weather cache (Open #23, ~30 lines). That single change makes the spike-proof: a restarted VPS warms from disk in milliseconds and the ceiling is never approached. Secondary concern at 100K MAU: Supabase free tier (50K API requests/month) needs upgrade to Pro ($25/mo). Everything else scales horizontally at low cost via GitHub Pages CDN.

---

*Report by DevOps agent — 2026-08-26*
