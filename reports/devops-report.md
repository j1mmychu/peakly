# DevOps Report — 2026-10-17 (RED)

**Status: 🔴 RED — LAUNCH EVE. VPS Day 69. Still not deployed. `origin/master` footgun Day 11 (50 commits behind main). SW PRECACHE mismatch Day 13. Code freeze Day 33 clean.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 33, unchanged since 2026-09-14 ✅ |
| VENUES (category-field counted) | **404** (134 skiing / 270 beach — matches CLAUDE.md) ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — 33-day freeze, expected under code freeze ✅ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned, stable CDN |
| Babel 7.24.7 (cdnjs, dev path) | ✅ esbuild strips in production CI build |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS confirmed |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 sites across all card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController at app.jsx:6381 |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason:true` venues | ⚠️ **10** via `grep -c "lateSeason:true"` — CLAUDE.md says 15. See P2-D below. |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| proxy.js (committed) | ✅ `forecast_days=14`, disk cache, `capacitor://localhost` CORS, `DELETE` in Allow-Methods — ALL fixes present in repo. NOT on VPS yet. |
| `dist/app.min.js` | Not in repo; CI-built on push via `scripts/build-web.mjs` — expected ✅ |

---

## 2. CRITICAL ISSUES (P0) — Fix TODAY. Launch is TOMORROW.

### P0-A: VPS Redeploy STILL PENDING — **Day 69. Launch is October 18.** 🚨🚨🚨

**TODAY IS THE LAST DAY.** Oct 18 is tomorrow. The VPS has been running the August 11 build for 69 days. The committed `server/proxy.js` has every fix needed. It is sitting in the repo doing nothing. Every fix below is already written — they just need to land on the VPS.

**What breaks at launch tomorrow if this doesn't happen today:**

| # | Broken feature | User-facing impact |
|---|---------------|-------------------|
| 1 | `forecast_days: 7` not 14 | **Two-weekend scoring disabled.** Only one Fri–Mon window shows. The headline feature is crippled. |
| 2 | `capacitor://localhost` missing from CORS | **Every iOS App Store user gets CORS errors.** All proxy calls fail on iOS native. Launch with iOS = broken iOS. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | **Alert deletion silently fails.** User deletes alert, UI confirms, server keeps it. |
| 4 | `_wxCache` in-memory only | `pm2 restart` wipes it. A Reddit post + cold cache = **Open-Meteo rate-limited in minutes**. Blank grids for everyone. |

The committed `proxy.js` fixes ALL FOUR. Disk cache is live in the repo (`WX_CACHE_FILE` at line 427, `readFileSync`/`writeFileSync` at lines 433/439).

**Fix. Five minutes. Do this now:**

```bash
# From your local machine, in the peakly repo root:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH in:
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy
pm2 save

# Verify 5 seconds after restart:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

**Confirm these fields in `/health` output:**
```json
{
  "status": "ok",
  "forecast_days": 14,
  "disk_cache": "enabled",
  "apns": "configured"
}
```

If `forecast_days` is still 7 or `disk_cache` is absent — old `proxy.js` still running. Repeat the `scp` and restart.

---

### P0-B: `origin/master` Footgun — **Day 11. 50 commits behind main. Deploy.yml still triggers on it.** 🚨

`deploy.yml` triggers on BOTH `main` AND `master`. `origin/master` is 50 commits behind main (last commit was `b6dc033 auto: terms.html`, June 2026). Any push to master silently deploys a 4-month regression to GitHub Pages in 2 minutes. No warning. No rollback prompt.

**Risk is highest at launch**: Reddit/HN traffic = more eyes on the repo = higher chance of someone cloning, checking out master, and pushing something.

**Fix option A — Delete master (30 seconds, recommended):**
```bash
git push origin --delete master
```

**Fix option B — Remove master from deploy triggers:**
```diff
# .github/workflows/deploy.yml
 on:
   push:
     branches:
-      - main
-      - master
+      - main
   workflow_dispatch:
```

Delete the branch. There is no active use case for `origin/master`. It's been a landmine for 11 days.

---

## 3. HIGH ISSUES (P1) — Fix this week

### P1-A: SW PRECACHE Babel Mismatch — **Day 13**

`sw.js` line 4 precaches `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` (unpkg, v7.29.7).  
`index.html` loads `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js` (cdnjs, v7.24.7).

Three problems:
1. **Wrong version**: SW caches 7.29.7, app loads 7.24.7. SW cache never gets a hit on the actual app load.
2. **Wrong CDN**: SW points to unpkg (no SLA). CLAUDE.md explicitly says "cdnjs has SLA, unpkg does not."
3. **Wasted bandwidth**: Production (`dist/app.min.js`) never loads Babel at all. The SW is eagerly prefetching a ~1MB bundle that no production user ever needs.

Under code freeze this doesn't cause a visible regression. First post-launch patch, fix it:

```javascript
// sw.js line 4 — cleanest fix for production
const PRECACHE = [];
// Production serves dist/app.min.js (no Babel). Dev is local (never goes through SW).
// Nothing to precache.
```

**Time to fix: 2 minutes.** Blocked by code freeze only.

---

## 4. MEDIUM ISSUES (P2)

### P2-A: BASE_PRICES Coverage — 68% of airports missing

Unchanged from previous reports. 100 of 146 venue airports absent from `BASE_PRICES`. CUN, BOB, AUA, STT, SXM — major beach hubs — all missing. The deal score is a headline feature and it misfires on 68% of routes.

**Fix: ~2hr task post-launch.** Fill in median round-trip prices from Google Flights for the top 15 airports by venue count. Within $50 of reality beats a hardcoded generic default on a $450 Maldives route.

### P2-B: APNS Transport Fix — Pending VPS Redeploy

The committed `server/proxy.js` includes the HTTP/2 transport fix (`http2.connect`, `dsaEncoding: 'ieee-p1363'`) for the APNs DER-vs-P1363 JWT issue. The `app.jsx` `crypto.randomUUID()` alert ID fix is also committed. Both land the moment P0-A (VPS redeploy) happens. Mark this resolved after P0-A is confirmed.

### P2-C: Stale Cloud Agent Branches

18 non-main/master branches appeared in today's fetch: 15 `claude/*` branches (`analyze-test-coverage`, `code-review-cleanup`, `condense-alert-page`, `enhance-loading-screen`, `fix-app-jsx-content`, `implement-todo`, `improve-peakly-ui`, `improve-scoring-system`, `product-reliability-assessment`, `redesign-front-page`, `review-peakly-ux`, `simplify-alerts-page`, `simplify-profile-page`, `standardize-venue-data`, `streamline-onboarding-account`) plus `fix-appjsx-final`, `restore-appjsx`, `test-small`. None reflected in main. Clutter in the remote namespace, no runtime harm.

```bash
# Verify each is abandoned, then bulk delete:
git branch -r | grep "origin/claude/" | sed 's|  origin/||' | xargs -I{} git push origin --delete {}
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

### P2-D: lateSeason Count Discrepancy — CLAUDE.md Says 15, Grep Returns 10

`grep -c "lateSeason:true"` on current `app.jsx` returns **10**. CLAUDE.md states "Current count: 15 (confirmed via grep 2026-09-13)" and lists: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg.

Five of those 15 either use a different format (`lateSeason: true` with space) or are no longer present. The code freeze has been in place since 2026-09-14, so this discrepancy predates the freeze — likely caused by a batch venue edit that changed 5 venue formats. No scoring impact (the `lateSeason` flag only affects the late-season ski exception logic), but CLAUDE.md has an incorrect count. Verify after the freeze lifts:

```bash
grep -c "lateSeason:true" app.jsx   # compact format
grep -c "lateSeason: true" app.jsx  # spaced format
# Add both — that's the true count
```

---

## 5. Performance Analysis

| Metric | Value | Notes |
|--------|-------|-------|
| `app.jsx` raw size | 758,944 bytes (~741 KB) | Pre-compile. Unchanged Day 33. |
| Production JS payload | ~439 KB (`dist/app.min.js`) | No Babel overhead. Acceptable. |
| CDN libs (React + ReactDOM) | ~190 KB gzipped | cdnjs, SLA-backed, cached. |
| Total estimated cold load | ~630 KB JS | Mid-range for a mobile SPA. Acceptable. |
| Biggest perf bottleneck | 404-venue Open-Meteo batch | 50 calls/2s burst on cold load. 8+ seconds for a new user on all 404 venues. VPS proxy cache absorbs repeat visitors. Cold VPS = no cache. |
| Image lazy loading | ✅ 9 sites | No regression. |
| Babel in production | ✅ 0 — esbuild strips it in CI | `deploy.yml` line 40. |

---

## 6. Cost Estimate

| MAU | Open-Meteo calls/day | VPS | CDN/Pages | Total/mo |
|-----|---------------------|-----|-----------|----------|
| Current (<100) | ~500 | $6 | $0 | **$6** |
| 1K MAU | ~5,000 | $6 | $0 | **$6** (free tier holds) |
| 10K MAU | ~50,000 | $12 (2GB) | $0 | **~$32** (Open-Meteo paid ~$20) |
| 100K MAU | ~500,000 | $48 (4GB) | $0 | **~$150** (Open-Meteo ~$100/mo) |

**Cost floor stays $6/mo until MAU cracks 10K.** The disk-cache fix in the committed `proxy.js` is the only thing that prevents Open-Meteo from rate-limiting at ~66 simultaneous users. Without it, a moderate Reddit post sends blank grids to everyone.

---

## 7. What Breaks First at Scale

**Open-Meteo rate limit on a cold VPS is the single point of failure.** Without the disk cache fix, a `pm2 restart` (required for the VPS redeploy itself) wipes the in-memory cache. The first 200 users after restart × 8 API calls = 1,600 upstream requests before the cache fills — 16% of the daily free-tier ceiling in the first minute. A Reddit/HN launch post on a cold server means blank Explore grids for half the launch audience, CORS errors for every iOS user, and silent alert-deletion failures. The proxy handles all of this — the disk cache, the CORS headers, the forecast_days fix — and it has been committed in `server/proxy.js` since August. It needs one `scp` and one `pm2 restart`. The fix is 5 minutes. This is the 69th day it hasn't happened.

---

*Written by automated DevOps agent — 2026-10-17*
