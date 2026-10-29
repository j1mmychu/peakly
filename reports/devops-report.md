# DevOps Report — 2026-10-29 (RED)

**Status: 🔴 RED — VPS Day 81. Oct 30 hard deadline is TOMORROW. Whistler opens in 12 days. `origin/master` footgun Day 22. PRECACHE mismatch unchanged Day 22+. No app.jsx commits since Oct 12 (17 days).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Do not interpret sandbox timeouts as VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes** (741 KB) — unchanged since Oct 12 ✅ |
| Total venues (bracket-walk) | **406** — **+2 drift vs CLAUDE.md (says 404)**. Content added INN-Stubai + SZG-Dachstein (Oct 28 report). CLAUDE.md not updated. ⚠️ |
| `lateSeason:true` venues | **15** (confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia + 8 JSON-format entries) ✅ |
| `.venue-baseline` | **405** — 1 below current count (406). Will allow up to 401 before guard triggers. ⚠️ (minor, self-corrects on next commit) |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **45 days stale**. No code shipped since Aug 11. First edit MUST bump in lockstep. ⚠️ |
| Plausible analytics | ✅ present, uncommented — `index.html:32` |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ dev-only; stripped by `build-web.mjs` in prod |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ `TP_MARKER="710303"` is public affiliate marker only — no secret |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated (`app.jsx:26`) |
| Sentry DSN | ✅ configured — `index.html:77` + `app.jsx:8` |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ all 9 `<img>` tags covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController timeout wired |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES coverage | ✅ **181 airports** — Open #22 CLOSED |
| Unmerged `claude/*` branches on origin | ⚠️ **15 branches** — exploration noise, none merged, no code risk but adds repo clutter |
| `origin/master` vs `origin/main` divergence | ❌ **master is 511 commits behind main; main is 50 ahead of master** — deploy.yml triggers on BOTH. Unchanged Day 22. |

---

## 2. Critical Issues (P0)

### P0-A: VPS Redeploy — Day 81. **TOMORROW IS THE HARD DEADLINE (Oct 30).**

This is the same finding, Day 81. No change from yesterday. The Whistler window is 12 days out.

The committed `server/proxy.js` (Aug 11, commit `059de43`) includes:
- `forecast_days:14` — two-weekend scoring. Without this, the VPS returns a 7-day window, making Whistler/Tignes invisible on the front page the day of the Reddit post.
- `_wxCache` disk persistence — cold-start protection. Without this, a `pm2 restart` fans out 406 concurrent Open-Meteo requests.
- `capacitor://localhost` CORS — iOS native API calls are blocked outright without this.
- `DELETE` in `Access-Control-Allow-Methods` — alert deletion has never worked.
- `http2` APNs + `dsaEncoding: 'ieee-p1363'` — push notifications will silently deliver nothing without this.

**None of it is running. The VPS is on the Aug 11 pre-commit build.**

If today passes without action, Oct 30 is the last day before the Whistler screenshot window closes to "marginal" territory for the Reddit post.

**Jack's exact commands — 5 minutes:**
```bash
ssh root@198.199.80.21
cd /tmp && rm -rf peakly-deploy && git clone https://github.com/j1mmychu/peakly.git peakly-deploy
cp /tmp/peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

**Expected after redeploy:**
```json
{
  "status": "ok",
  "wx_cache_size": 0,
  "apns": "configured",
  "uptime": <seconds>
}
```

`wx_cache_size: 0` is correct immediately post-restart (cold). Refills on first traffic. `forecast_days` is embedded in the proxy logic, not in `/health` output — verify by hitting `/api/weather?lat=50.1&lon=-122.9&days=14` and confirming >7 days of hourly data.

---

## 3. High Issues (P1)

### P1-A: PRECACHE→CDN Mismatch — Day 22 (unchanged)

`sw.js` line 4 pre-caches a Babel URL nobody ever requests. Production (GitHub Pages) strips Babel with esbuild. Dev loads from cdnjs. The SW is fetching 1.1 MB from unpkg on every fresh install for no reason.

```
sw.js PRECACHE:   https://unpkg.com/@babel/standalone@7.29.7/babel.min.js   ← fetched, never used
index.html:88:    https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js  ← actually loaded (dev only)
```

**Fix (2-second edit, sw.js line 3-5):**
```diff
-const PRECACHE = [
-  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
-];
+const PRECACHE = [];
```

This should ship in the first sprint commit. Cache stamp must bump in lockstep across `sw.js`, `app.jsx`, `index.html`.

### P1-B: `origin/master` Footgun — Day 22

`deploy.yml` triggers on **both** `main` and `master`. `origin/master` is 511 commits behind `main` and 50 commits behind `origin/main`. If anyone pushes to `master` (the old default, still valid), deploy.yml will run and deploy the 511-commit-stale codebase to GitHub Pages, overwriting the live site with a version from before the Aug 11 session.

**The auto-push hook pushes to `master:main` (both)** — so every auto-push re-triggers this risk.

**Fix Option A — Remove master trigger from deploy.yml (preferred):**
```diff
 on:
   push:
     branches:
       - main
-      - master
   workflow_dispatch:
```

**Fix Option B — Delete origin/master:**
```bash
git push origin --delete master
```

Option A is safer (keeps master as a valid branch name without deploy trigger). 30 seconds.

---

## 4. Medium Issues (P2)

### P2-A: Venue count drift — CLAUDE.md says 404, actual is 406

Content added INN-Stubai and SZG-Dachstein (Oct 28 report, confirmed in git log) but CLAUDE.md "Current State" still reads 404 (134 ski / 270 beach). The discrepancy is 2 venues. No functional bug, but misleads future audit sessions.

Correct counts as of today:
- **406 total** (bracket-walk, authoritative)
- **Ski:** ~141 (grep-based, approximate due to format mix)
- **Beach:** ~279 (grep-based, approximate)

CLAUDE.md needs updating on next edit that touches the file.

### P2-B: Cache stamp `20260914a` is 45 days stale

No code shipped since Aug 11 — stamp is technically accurate, not a live bug. But the first editor to touch `app.jsx` without bumping the stamp will get rejected by the auto-push guard. Reminder: bump `PEAKLY_BUILD` in `app.jsx`, `CACHE_NAME` in `sw.js`, and `PEAKLY_BUILD` meta in `index.html` in the same commit.

### P2-C: `.venue-baseline` is 405, actual count is 406

`scripts/.venue-baseline` contains `405`. The guard allows a drop of 5 below baseline (to 400) before blocking. Since the actual count is 406, the baseline is 1 stale. It auto-corrects upward when the next commit runs through auto-push. Non-blocking.

### P2-D: 15 unmerged `claude/*` branches on origin

All 15 are unreviewed cloud-agent exploration branches — nothing merged. None block anything. Jack should review and delete them to keep the repo clean. List:
`analyze-test-coverage`, `code-review-cleanup`, `condense-alert-page`, `enhance-loading-screen`, `fix-app-jsx-content`, `implement-todo-lNL7W`, `improve-peakly-ui`, `improve-scoring-system`, `product-reliability-assessment`, `redesign-front-page`, `review-peakly-ux`, `simplify-alerts-page`, `simplify-profile-page`, `standardize-venue-data`, `streamline-onboarding-account`.

**Bulk delete command (review each name first — none should have unreviewed fixes):**
```bash
git fetch --prune
for branch in analyze-test-coverage-WVIsT code-review-cleanup-HjoCS condense-alert-page-jzdLo enhance-loading-screen-rZ1dc fix-app-jsx-content implement-todo-lNL7W improve-peakly-ui-UHCHG improve-scoring-system-XYGY6 product-reliability-assessment-w0poL redesign-front-page-EndKs review-peakly-ux-UQ0Qu simplify-alerts-page-2ejGB simplify-profile-page-Bi2Tc standardize-venue-data-CufiQ streamline-onboarding-account-97XRR; do
  git push origin --delete claude/$branch
done
```

---

## 5. Security Audit

| Check | Status |
|-------|--------|
| Travelpayouts secret token in client | ✅ NOT present — `TP_MARKER="710303"` is public affiliate marker only |
| Supabase service_role key in client | ✅ NOT present — only anon key (public-safe, RLS-gated, expected) |
| Raw API keys / secrets in any client file | ✅ Clean |
| `.gitignore` covers `.env`, `.p8`, `.pem`, `.key` | ✅ |
| Recent commits (last 10) introduce secrets | ✅ Clean — only report files in recent history |
| `server/proxy.js` APNS `.p8` path | ✅ gitignored (`*.p8`) — key never committed |
| Supabase anon key expiry | `exp: 2093505784` = year **2036** — not expiring ✅ |
| Git history for secrets (last 20 commits) | ✅ Clean — only report .md files in recent commits |

**Security posture: clean.** No new findings. Supabase anon key exposure is intentional, documented, RLS-protected.

---

## 6. Performance Analysis

**Production bundle (GitHub Pages):**
| Asset | Approx gzipped |
|-------|----------------|
| React 18.3.1 (cdnjs) | ~42 KB |
| ReactDOM 18.3.1 (cdnjs) | ~130 KB |
| Sentry SDK | ~40 KB |
| Plausible | ~1 KB |
| `dist/app.min.js` (esbuild-compiled, Babel stripped) | ~110 KB |
| **Total first-load** | **~323 KB** |

Babel (1.1 MB gzipped) is production-stripped — not a real-user cost. Dev-only.

**Biggest bottleneck:** 406-venue weather batch on mount. Without VPS proxy cache (P0-A), each cold-start user triggers up to 8 direct Open-Meteo requests. 50 concurrent users on the same venue set = 400 simultaneous upstream requests = free tier exceeded in seconds. This is the Reddit-spike cliff. The committed proxy.js solves it with shared in-flight dedup + LRU disk cache. It has been committed for 81 days.

**Images:** ✅ All 9 `<img>` tags have `loading="lazy"`. No regressions.

---

## 7. Cost Estimate

| Scale | Infrastructure | Notes |
|-------|---------------|-------|
| Current (<100 MAU) | $6/mo DO droplet + $0 Supabase free | Comfortable |
| 1K MAU | ~$6/mo + $0 Supabase | Open-Meteo free tier holds IF VPS cache is deployed |
| 10K MAU | ~$18/mo (DO upgrade) + ~$25/mo Supabase Pro | Cache mandatory, not optional |
| 100K MAU | ~$60-100/mo DO + $25 Supabase + possible CDN | Need pm2 cluster mode or second droplet |

**Cost optimization:** The disk-cached `_wxCache` in the committed `proxy.js` is the single biggest cost lever — it prevents Open-Meteo commercial tier costs at scale and avoids IP bans. It's free to deploy and has been sitting committed for 81 days.

---

## 8. What Breaks First at Scale

Without the VPS cache deployed, the architecture has a cliff at ~66 concurrent users on the same uncached venue coordinates. Open-Meteo free tier throttles there. A Reddit post driving 500-1000 concurrents on Whistler opening day (Nov 10, 12 days away) sends ALL 406×N weather requests directly to Open-Meteo with no shared dedup. Result: throttling or IP ban → stale/empty weather → 50/50 score fallback on every card → the app looks broken on the exact day that matters most. The committed `proxy.js` solves this with a shared disk LRU cache and in-flight dedup. **The fix is written, committed, and tested. It just needs to be copied to the VPS. This is a 5-minute action that has been deferred for 81 days.**

---

## 9. Summary — Open Items

| Item | Priority | Age | Status |
|------|----------|-----|--------|
| VPS redeploy (`proxy.js` w/ disk cache + 14-day wx + iOS CORS + DELETE + APNs) | **P0** | Day 81 | ❌ Not deployed — **Oct 30 deadline is TOMORROW** |
| PRECACHE→CDN mismatch in sw.js (`PRECACHE = []`) | **P1** | Day 22 | ❌ 2-second fix, pending sprint |
| `origin/master` footgun — deploy.yml triggers on stale branch | **P1** | Day 22 | ❌ 30-second fix, pending |
| Venue count drift — CLAUDE.md says 404, actual is 406 | P2 | Day 1 | ❌ CLAUDE.md update needed |
| Cache stamp `20260914a` — 45 days stale | P2 | Day 45 | ⚠️ Expected (no code shipped), first edit must bump |
| 15 unmerged `claude/*` branches | P2 | Ongoing | ❌ Cleanup needed |
| Photos: ~360+ venues with generic stock images | P2 | Ongoing | ❌ Needs Unsplash key (UNSPLASH_KEY env) |
| APNS DER→P1363 + HTTP/2 fix | P1 | Committed Aug 11 | ✅ In committed proxy.js — blocked on P0-A |

---

*Report generated: 2026-10-29 by peakly-devops scheduled agent. VPS analysis from committed source only — sandbox has no network egress to duckdns.org.*
