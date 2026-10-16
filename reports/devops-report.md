# DevOps Report — 2026-10-16 (RED)

**Status: 🔴 RED — VPS Day 68 (2 days to Oct 18 launch). `origin/master` footgun Day 10 (50 commits behind main, fires deploys). SW PRECACHE Babel mismatch Day 12. Code freeze Day 32 clean.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 32, unchanged since 2026-09-14 ✅ |
| VENUES (id-field counted) | **404** (134 skiing / 270 beach — matches CLAUDE.md) ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — 32-day freeze, **expected**, no action needed under code freeze |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned, stable CDN |
| Babel 7.24.7 (cdnjs, dev path) | ✅ esbuild strips in production CI build |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, not HTTP |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 sites across all card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController at app.jsx:6381 |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason: true` venues | ✅ 15 venues (`grep -c "lateSeason:true"` confirmed) |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| `dist/app.min.js` | Not in repo; CI-built on push via `scripts/build-web.mjs` — expected |

---

## 2. CRITICAL ISSUES (P0) — Fix today, blocks launch

### P0-A: VPS Redeploy STILL PENDING — **Day 68. LAUNCH IS SATURDAY.** 🚨🚨🚨

Day 68. Oct 18 is **2 days away**. The production VPS still runs the August 11 build. Every fix committed in the past 67 days is inert. This was "last viable window TODAY" in the Oct 15 PM report — that window passed. If it doesn't happen today or tomorrow, the product ships broken.

**Active regressions ON LAUNCH DAY if not fixed:**

| # | What breaks | User impact |
|---|-------------|-------------|
| 1 | `forecast_days: 7` not 14 | Two-weekend scoring **disabled**. The headline feature only shows one Fri–Mon window instead of two. |
| 2 | `capacitor://localhost` absent from CORS | Every iOS App Store user gets **CORS errors** on all proxy calls. App Store submission ships to a broken product for iOS. |
| 3 | `DELETE` missing from `Access-Control-Allow-Methods` | Alert deletion **silently fails**. UI removes the alert, server keeps it alive. Hidden by `.catch(()=>{})`. |
| 4 | `_wxCache` in-memory only | A `pm2 restart` (required by the redeploy itself) wipes it. Cold cache + Reddit/HN traffic = **Open-Meteo rate limit in minutes**. |

**Fix. Right now. 5 minutes.**

```bash
# Step 1: From your local machine in the peakly repo root
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Step 2: SSH in
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy
pm2 save

# Step 3: Verify (~5 seconds after restart)
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

**Expected `/health` after fix:**
```json
{
  "status": "ok",
  "forecast_days": 14,
  "disk_cache": "enabled",
  "apns": "configured",
  "uptime": "<60s (fresh restart)"
}
```

If `forecast_days` is 7 or `disk_cache` is absent — the old `proxy.js` is still running. Repeat the `scp`.

---

### P0-B: `origin/master` Footgun — **Day 10, 50 commits behind main** 🚨

`deploy.yml` triggers on BOTH `main` AND `master`. `origin/master` is 50 commits behind main — confirmed today via `git rev-list --count`. Any push to master deploys a **2.5-month regression** silently. No error. No rollback. GitHub Pages goes live in ~2 minutes.

The Oct 18 launch creates maximum risk: fresh attention means more people cloning the repo, more git activity, higher chance of a stale-branch push.

**Fix — Delete master (30 seconds, recommended):**
```bash
git push origin --delete master
```

**Fix — Remove master from deploy triggers (if branch must stay for some reason):**
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

---

## 3. HIGH ISSUES (P1) — Fix this week

### P1-A: SW PRECACHE Babel Version/CDN Mismatch — **Day 12**

`sw.js` PRECACHE caches `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` (unpkg, v7.29.7). `index.html` loads `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js` (cdnjs, v7.24.7).

Two problems:
1. **Different versions**: SW caches 7.29.7, app loads 7.24.7. Cache never gets a hit.
2. **Different CDNs**: SW points to unpkg (no SLA), app uses cdnjs (SLA). CLAUDE.md explicitly notes "cdnjs has SLA, unpkg does not."
3. **Wasted bandwidth**: SW eagerly fetches a 1MB+ Babel bundle that the production site never uses (esbuild strips Babel in `dist/app.min.js`).

Under code freeze this is dormant — production serves `dist/app.min.js` and never touches the Babel CDN. But it fires immediately in dev mode and burns on any new install of the PWA.

**Fix:**
```javascript
// sw.js line 4 — either clear the array (production doesn't need Babel cached)
const PRECACHE = [];

// OR align with what index.html actually loads if you want it cached:
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

Cleanest fix: empty array. Production loads `dist/app.min.js` (no Babel). Dev is local, never goes through SW. Nothing to precache.

**Time to fix: 2 minutes.** Deferred from code freeze only because it's not a live regression. Fix in the first post-launch patch.

---

## 4. MEDIUM ISSUES (P2) — Fix this sprint

### P2-A: BASE_PRICES Coverage — 68% of airports missing

100 of 146 venue airports absent from `BASE_PRICES`. The deal score is a headline feature. Missing airports fall back to a hardcoded generic estimate that silently misprices the deal. This was quantified by Content on 2026-07-25 and has sat open since. CUN, BOB, AUA, STT, SXM — major beach destination hubs — all missing.

**Fix: ~2hr task.** Run `node scripts/validate-venues.mjs` to get the airport list, then fill in median round-trip prices from Google Flights for the top 15 by venue count. Rough data is fine — within $50 of reality is better than a $200 hardcoded default hitting a $450 Maldives route.

### P2-B: APNS Dead on Arrival

The APNs wiring issue (DER vs P1363 JWT + HTTP/1.1 `fetch` against HTTP/2 endpoint) is documented in Open #21. There's a committed fix in `server/proxy.js` (the Aug 11 post-redeploy state). Once the VPS is redeployed (P0-A), this is resolved for the transport layer. The `crypto.randomUUID()` alert ID fix in `app.jsx` was also committed. Mark this resolved after VPS redeploy confirmed.

### P2-C: Multiple Stale `claude/*` Branches in `origin/`

16 new `claude/*` branches appeared in this fetch — `analyze-test-coverage`, `code-review-cleanup`, `condense-alert-page`, `enhance-loading-screen`, `fix-app-jsx-content`, `implement-todo`, `improve-peakly-ui`, `improve-scoring-system`, `product-reliability-assessment`, `redesign-front-page`, `review-peakly-ux`, `simplify-alerts-page`, `simplify-profile-page`, `standardize-venue-data`, `streamline-onboarding-account` + `fix-appjsx-final`, `restore-appjsx`, `test-small`. These are cloud agent experiment branches. None are reflected in main. They pile up in the remote namespace but cause no runtime harm.

**Fix if they're all abandoned:**
```bash
# Delete all stale claude/* branches from origin (verify each is unmerged/abandonable first):
git branch -r | grep "origin/claude/" | sed 's|origin/||' | xargs -I{} git push origin --delete {}
# Also clean up the one-off branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

---

## 5. Performance Analysis

| Metric | Value | Notes |
|--------|-------|-------|
| `app.jsx` raw size | 758,944 bytes (~741 KB) | Pre-compile. esbuild → ~439 KB minified. |
| Production JS payload | ~439 KB (`dist/app.min.js`) | No Babel, no JSX overhead. Acceptable. |
| CDN libs (React + ReactDOM) | ~190 KB gzipped | Loaded from cdnjs with SLA. Cached aggressively. |
| Total estimated cold load | ~630 KB JS | Mid-range for a mobile app. Acceptable. |
| Biggest bottleneck | 404-venue Open-Meteo batch | 50 calls/2s burst on cold load. Proxy cache absorbs repeat visitors. New user = 8+ seconds of weather fetches. |
| Image lazy loading | ✅ 9 sites | No regression. |
| Babel overhead in production | ✅ 0 — esbuild strips it | CI build confirmed via `deploy.yml` line 40. |

**Biggest remaining perf risk:** a Reddit/HN post hitting a cold VPS (just restarted, `_wxCache` empty). 200 concurrent users × 8 API calls = 1,600 Open-Meteo requests before the cache fills. Open-Meteo free tier: 10,000 calls/day. That's 16% of the daily quota in the first minute. Disk cache (P0-A fix) makes restarts non-events. Without it, a cold restart + traffic spike = rate limit + blank Explore grids for everyone.

---

## 6. Cost Estimate

| MAU | Open-Meteo calls/day | VPS | CDN/Pages | Total/mo |
|-----|---------------------|-----|-----------|----------|
| Current (<100) | ~500 | $6 | $0 | **$6** |
| 1K MAU | ~5,000 | $6 | $0 | **$6** (free tier holds) |
| 10K MAU | ~50,000 | $12 (2GB) | $0 | **$12** (Open-Meteo paid plan ~$20 → **$32**) |
| 100K MAU | ~500,000 | $48 (4GB) | $0 | **~$150** (Open-Meteo $100/mo estimate) |

**Cost optimization opportunities:**
1. The VPS weather proxy + disk cache (P0-A) is the only thing preventing Open-Meteo rate limits from hitting below 1K MAU. Without it, 100 concurrent users on the same venue can hit the free ceiling.
2. At 10K MAU, consider Open-Meteo's paid API (~$20/mo) rather than complex caching gymnastics.
3. GitHub Pages stays free indefinitely. CDN costs zero until assets balloon beyond 1GB bandwidth/mo.

---

## 7. What Breaks First at Scale

**Open-Meteo rate limit is the single point of failure.** At 66+ simultaneous users hitting uncached venues, the free tier ceiling is gone. The proxy's in-memory cache is the solution — but only when the VPS is running the committed code. Right now, the VPS still runs the 7-day forecast, no disk cache, no `capacitor://localhost` CORS header. A moderate Reddit post (500 visitors in 30 minutes) on launch day without the VPS redeploy will produce: blank Explore grids for half the visitors, CORS errors for every iOS user, and alert deletions that silently fail. The proxy handles all of this — it's deployed to a $6 droplet, the fix is a 5-minute `scp + pm2 restart`, and it's been sitting undone for 68 days. Fix this before Saturday.

---

*Written by automated DevOps agent — 2026-10-16*
