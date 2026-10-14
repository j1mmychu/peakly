# DevOps Report — 2026-10-14 (RED)

**Status: 🔴 RED — VPS Day 66 (4 days to Oct 18 launch). `origin/master` footgun Day 8 (50 commits behind main, still fires deploys). SW PRECACHE Babel mismatch Day 10. Code freeze Day 30 clean.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox will always time out — not a VPS outage signal.

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** (code freeze Day 30 — no change since 2026-09-14) |
| VENUES (eval/bracket-counted) | **404** (134 skiing / 270 beach — matches CLAUDE.md) ✅ |
| `lateSeason:true` venues | **15 total**: 10 compact-format (`lateSeason:true`) + 5 JSON-format (`"lateSeason": true`). CLAUDE.md count of 15 is accurate; the `grep -c 'lateSeason:true'` pattern only catches compact format, returns 10. Both formats wire correctly to the scoring engine (`venue.lateSeason`). |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned, exact version |
| Babel 7.24.7 (cdnjs, dev path) | ✅ esbuild strips in production build |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **30-day freeze, expected under code freeze** |
| `FLIGHT_PROXY` URL | ✅ `https://peakly-api.duckdns.org` — HTTPS, no HTTP leak |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker, not a secret. |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated, documented) |
| All API calls HTTPS | ✅ Clean — full grep scan |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Image `loading="lazy"` | ✅ 9 sites across ListingCard, FeaturedCard, CompactCard |
| `fetchTravelpayoutsPrice` AbortController timeout | ✅ 4s timeout |
| `fetchWeather` VPS proxy fallback | ✅ try VPS → fall back to direct Open-Meteo |
| `server/proxy.js` APNs transport | ✅ `http2.connect` + `dsaEncoding: 'ieee-p1363'` — committed, **awaiting VPS deploy** |
| `server/proxy.js` disk weather cache | ✅ `WX_CACHE_FILE` → `wx-cache.json` — committed, **awaiting VPS deploy** |
| `server/proxy.js` `forecast_days` | ✅ 14 days — committed, **awaiting VPS deploy** |

---

## 2. CRITICAL ISSUES (P0) — Fix today, blocks launch

### P0-A: VPS Redeploy STILL PENDING — **Day 66, 4 days to launch** 🚨

This is Day 66 of the same P0. All `server/proxy.js` fixes are committed and ready. Nothing to code. The VPS runs the old code. **What users get today because of this:**

1. **Two-weekend scoring disabled.** Old proxy returns 7-day forecasts; client needs 14 days for the second Fri–Mon window. Half the scoring signal is missing.
2. **iOS native calls 100% blocked.** `capacitor://localhost` absent from CORS allowlist. Every iOS App Store user gets CORS errors on all proxy calls.
3. **Alert deletion silently fails.** `DELETE` missing from `Access-Control-Allow-Methods`. Client `.catch(()=>{})` hides it.
4. **Weather cache missing on VPS.** Without disk persistence (`wx-cache.json`), any `pm2 restart` wipes the in-memory cache. A cold restart right before/during launch traffic = Open-Meteo rate limit hit within minutes.

**The fix is literally one `scp` and one `pm2 restart`. All the hard code work is done.**

```bash
# From your LOCAL machine, in the peakly repo root:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH in:
ssh root@198.199.80.21
pm2 restart peakly-proxy
pm2 save

# Verify (takes ~5 seconds after restart):
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: "forecast_days": 14, "disk_cache": "enabled", uptime resets to seconds
```

**Estimated time: 5 minutes. 4 days left. This is your launch gate.**

---

### P0-B: `origin/master` Footgun — **Day 8** 🚨

`deploy.yml` triggers on BOTH `main` AND `master`. `origin/master` is **50 commits behind main**. Any accidental push to master — from a stale local clone, an old worktree, a git remote typo — deploys month-old code to production. No error. No warning. No rollback.

**What a bad push to master does:** silently replaces the live site with a 50-commit regression. Score changes, venue catalog, all Aug–Oct fixes — gone. GitHub Pages takes ~2 minutes to deploy. You'd see it only if you were watching the deploy tab.

**Fix A — Delete the master branch (recommended):**
```bash
# From local machine:
git push origin --delete master
```

**Fix B — Remove master from deploy triggers (keeps branch, removes footgun):**
```diff
# .github/workflows/deploy.yml
on:
  push:
    branches:
      - main
-     - master
```

Fix B is one line. Do it now. Push. The branch itself is harmless once removed from the trigger.

---

## 3. HIGH ISSUES (P1) — Fix this week

### P1-A: SW PRECACHE Babel Version Mismatch — **Day 10**

`sw.js` PRECACHE caches `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` (Day 10 unchanged). `index.html` loads `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js`. These are **different versions from different CDNs**. The SW is fetching and caching a file that is never actually used.

The production build (`dist/app.min.js`) doesn't use Babel at all — esbuild stripped it. The `sw.js` PRECACHE only matters for the dev/local path, and even there it caches the wrong file.

**Fix — empty the PRECACHE (cleanest, since production doesn't need it):**
```javascript
// sw.js line 3-5 — change:
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
// to:
const PRECACHE = [];
```

**Or align CDN/version if you want offline-first dev support:**
```javascript
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

**Estimated time: 2 minutes.**

---

## 4. MEDIUM ISSUES (P2) — Fix this sprint

### P2-A: BASE_PRICES Covers Only 10% of Destination Airports

`BASE_PRICES` has **15 source airports** (YVR, JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, DFW, LAS, PHX, MSP, DTW). These are all US/Canada origins. The deal score's `~$X` estimate is blank for any user who doesn't fly from one of these 15 airports. This affects every international user and a large chunk of US users (no IAH, no PDX, no LGA, no SAN).

Open #22 — known gap, 100 of 146 venue airports uncovered. Backfill target: top ~15 by venue count before launch.

### P2-B: No SRI on CDN Scripts

`index.html` loads React 18.3.1 and Babel 7.24.7 from cdnjs without Subresource Integrity hashes. A cdnjs compromise silently injects arbitrary JS. Medium risk (cdnjs is major, has SLA), but it's a one-time fix.

```html
<!-- Generate SRI: https://www.srihash.org/ -->
<!-- Then add to each script tag: -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-XXXX">
</script>
```

**Estimated time: 20 minutes (generate hashes + add to 2 tags).**

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx raw | 759 KB |
| `dist/app.min.js` (esbuild, production) | ~439 KB (per CLAUDE.md; CI-built, not in local clone) |
| React 18 UMD (cdnjs) | ~42 KB gzipped |
| Babel standalone dev path (cdnjs) | ~860 KB uncompressed |
| Supabase JS lazy-load | ~80 KB gzipped (on-demand only) |

**Biggest performance bottleneck:** Babel standalone 7.24.7 on the dev/local path. 860 KB is wall time. **This does NOT affect production** — the CI build replaces it with `dist/app.min.js` via esbuild. Users on the live GitHub Pages site never parse Babel. Not a fix item for launch.

**Second-biggest bottleneck:** photos. ~346 venues use generic stock unrelated to the venue. These are all `https://images.unsplash.com/...?w=1200&h=900` — 1.2MP each, lazy-loaded but unoptimized. The `auto=format&q=75` query param helps but the underlying images are oversized for mobile cards. This is Open #20.

---

## 6. Cost Estimate

| Scale | Monthly Cost | Notes |
|-------|-------------|-------|
| **Current (<100 MAU)** | **$6/mo** | DO droplet only. GitHub Pages free. Supabase free tier. |
| **1K MAU** | **$6/mo** | DO handles traffic easily. Supabase free (≤50K rows). |
| **10K MAU** | **$6–12/mo** | DO may need $12 plan. Supabase still free. **Open-Meteo becomes the critical path** — see below. |
| **100K MAU** | **$31–55/mo** | DO $12, Supabase Pro $25, possible CDN costs. |

**What breaks first at scale:** Open-Meteo, without the VPS proxy deployed.

Without the VPS proxy cache: first-load fetches ~404 venues' weather directly from the client. At 10K MAU with 5% DAU = 500 active users/day, each triggering the weather batch: 500 × 50 requests (batched, 50/2s) = 25,000 Open-Meteo calls/day. Free tier ceiling is ~10,000/day. **You hit the ceiling at ~200 concurrent active users without the proxy.**

With the VPS proxy deployed (WX_CACHE_FILE live): 404 unique (lat,lon) pairs × 1 upstream refresh per 2hr TTL = ~4,848 upstream calls/day maximum, regardless of concurrent users. 10K MAU is trivially safe. 100K MAU stays under the ceiling.

**The VPS deploy is literally your $0 rate-limit fix. It costs nothing and is already written.**

---

## 7. Security Posture — ✅ CLEAN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present (server-side only) |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated |
| `.env`, `*.pem`, `*.p8`, `*.key` gitignored | ✅ Confirmed |
| No other secrets in client code | ✅ Full grep scan — clean |
| Sentry DSN | ✅ configured |
| Recent commits for accidental secret commits | ✅ Last 5 commits are report files only |

---

## Summary

**Three actions stand between you and a clean Oct 18 launch:**

1. **VPS scp + pm2 restart** (5 min) — unlocks two-weekend scoring, iOS CORS, alert deletion, weather cache persistence. Day 66 of this being open.
2. **Remove `master` from deploy.yml** (2 min) — defuses a footgun that's been armed for 8 days.
3. **PRECACHE = []** in sw.js (2 min) — stops caching a useless 860 KB file on install.

Total fix time: **9 minutes**. All three are in scope today.
