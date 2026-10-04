# DevOps Report — 2026-10-04 (YELLOW)

**Status: 🟡 YELLOW — VPS P0 DEADLINE IS TODAY (Oct 4). Day 56 undeployed. `origin/master` footgun Day 12 unresolved. NEW: SW PRECACHE caches wrong Babel URL (dev-only, low impact). Code freeze Day 20 clean. All application code GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** |
| VENUES (authoritative eval count) | **404 total — 134 skiing / 270 beach** ✅ |
| lateSeason:true venues | **15 confirmed** ✅ |
| Plausible analytics | ✅ present, uncommented (index.html:32) |
| React 18.3.1 (cdnjs) | ✅ current |
| Babel Standalone 7.24.7 (cdnjs) | ✅ dev-only; production CI drops it |
| Sentry DSN | ✅ configured (index.html:77 + app.jsx:7–8, `9416b032...`) |
| PEAKLY_BUILD / CACHE_NAME stamp | ⚠️ `"20260914a"` — frozen Day 20. Expected during code freeze. Auto-bumps on next app.jsx commit. |
| All API calls HTTPS | ✅ no bare HTTP or hardcoded IPs in client |
| Secrets in client | ✅ no critical secrets (see §4) |
| Image lazy loading | ✅ all `<img>` tags carry `loading="lazy"` |
| Fetch timeouts | ✅ AbortController + 4s on proxy, 8s on direct Open-Meteo |

**Zero code commits to app.jsx/sw.js/index.html in 20 days.** Code freeze clean. Last ship: 2026-09-14.

---

## 2. Flight Proxy Status — 🔴 RED (TODAY IS THE DEADLINE — Day 56)

FLIGHT_PROXY points to `https://peakly-api.duckdns.org` (HTTPS ✅). The committed `server/proxy.js` fixes are correct and ready. **They have not been copied to `/opt/peakly-proxy` and pm2 has not been restarted.** This is Day 56. Oct 4 was the PM-set pre-traffic deadline. **Today is Oct 4.**

**What is broken right now:**
1. Two-weekend scoring returns null for all venues — front page only shows week 1
2. iOS native CORS block — `capacitor://localhost` not in allowed origins
3. Alert deletion silently fails — `DELETE` missing from `Access-Control-Allow-Methods`
4. Rate limiter reads first X-Forwarded-For entry — trivially spoofable; anyone can balloon `_rateMap`
5. Weather cache wiped on every pm2 restart (disk persistence not deployed)

**The 4 deploy commands:**

```bash
# From your local machine (NOT from a sandbox — sandbox has no VPS egress)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH in:
ssh root@198.199.80.21
cd /opt/peakly-proxy && pm2 restart peakly-proxy

# Verify from any networked machine:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected `/health` response after deploy:
```json
{
  "status": "ok",
  "uptime": 0,
  "wx_cache_size": 0,
  "wx_disk_cache_loaded": true,
  "apns": "unconfigured",
  "forecast_days": 14
}
```

**`forecast_days: 14` + `wx_disk_cache_loaded: true` = deploy confirmed.** If pm2 fails to start: `pm2 logs peakly-proxy --lines 50`.

**Weather cache warm-up:** After a cold restart, cache refills on first user traffic. If any Reddit/HN post lands before cache is warm, 500 concurrent users → 500 cold upstream Open-Meteo calls → rate ceiling hit in ~10 minutes → "conditions unavailable" for everyone. Manually warm before any planned traffic spike:

```bash
# Run from VPS after pm2 restart — hits top ski + beach coords
for coord in "50.116,122.949" "45.832,6.865" "36.578,-118.292" "18.467,-66.117" "-33.855,151.215" "8.696,-79.499"; do
  lat=$(echo $coord | cut -d, -f1); lon=$(echo $coord | cut -d, -f2)
  curl -s "https://peakly-api.duckdns.org/api/weather?lat=$lat&lon=$lon" > /dev/null &
done
wait
echo "Warm-up done"
```

**Time to fix: 10 minutes. This is the only P0. It was due today.**

---

## 3. Weather & External API — ✅ GREEN

- Open-Meteo: free tier ~10,000 req/day. 404 venues × 2 calls (weather + marine beach-only) = ~808 cold-cache requests per full sweep. VPS shared cache (once deployed) collapses concurrent users to 1 upstream call per coord per 2hr. **No rate-limit risk below ~12 MAU with VPS deployed.**
- Marine API: correctly gated to beach venues only (`needsMarine = category === "beach"`) — 270 calls max per cold sweep.
- All fetches carry AbortController timeouts. Fallback to score=50 on total weather failure. Cold-start reviewer-proof.
- `forecast_days=14` confirmed in fallback direct Open-Meteo URL (app.jsx:5548). Two-weekend scoring has the data it needs in the client fallback path.

---

## 4. Security Audit — ✅ GREEN (one accepted-risk item)

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present. `TP_MARKER="710303"` is the public affiliate marker — not a secret. Token is server-side env only. |
| Supabase ANON_KEY in client | ⚠️ **Accepted risk.** `eyJhbGc...` at app.jsx:26 is the public anon key, intentional per Supabase architecture (RLS-gated). Not a secret. |
| `.env` files committed | ✅ None. `.gitignore` covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`. |
| Sentry DSN in client | ✅ Expected — public DSN per Sentry's architecture. |
| APNS `.p8` key | ✅ Not committed. Covered by `.gitignore`. |
| Recent commits for secret leaks | ✅ Last 10 commits are report files only. No code changes since 2026-09-14. |
| `GEAR_ITEMS` | ✅ 0 occurrences. Amazon correctly cut. |
| No SRI on CDN scripts | ⚠️ P3 — Babel 7.24.7, React 18.3.1 loaded from cdnjs without `integrity=` hashes. Low risk. Add post-launch. |

**No P0 security issues.**

---

## 5. NEW FINDING: SW PRECACHE Version Mismatch — ⚠️ P3

`sw.js` PRECACHE caches `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` but `index.html` loads `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js`. These are different URLs — the cached asset is never served because the requested URL doesn't match the cache entry.

**Impact:** Babel is never served from SW cache offline. For production users this is irrelevant — the esbuild production build (`dist/app.min.js`) strips Babel entirely. For dev-mode users (opening `index.html` locally), the SW cache doesn't help anyway. **Risk is P3 dev-quality only, not production.**

**Fix (30 seconds, can bundle with next app.jsx commit to auto-bump cache stamp):**

```diff
// sw.js line 3–5
const PRECACHE = [
-  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
+  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

Or empty it (`[]`) since the production build doesn't need Babel at all. Either is fine. **Do not bump cache stamp manually — let `auto-push.sh` handle it when this rides a real commit.**

---

## 6. Performance Analysis — 🟡 YELLOW

| Metric | Value |
|--------|-------|
| app.jsx raw | 759 KB / 14,237 lines |
| Babel parse wall (dev mode) | ~3–5s on mobile (production build eliminates this) |
| Production bundle (dist/app.min.js) | Rebuilt by CI on every push via esbuild (~440 KB minified) |
| React 18.3.1 UMD (cdnjs) | ~150 KB gzipped |
| Babel Standalone (dev only) | ~900 KB — stripped in production |
| Total production JS estimate | ~440 KB minified |
| Image lazy loading | ✅ all `<img>` tags |
| Largest bottleneck | 759 KB single-file JSX + 404 hardcoded VENUES — scales with venue count |

**CDN versions:**
- React 18.3.1 → latest stable ✅
- Babel Standalone 7.24.7 → current is 7.25.x. Dev-only, not blocking.

---

## 7. Cost Estimate

| Scale | Infra cost/month | Notes |
|-------|------------------|-------|
| 0–1K MAU | **$6** | DO droplet only. Open-Meteo free tier covers this. |
| 1K–10K MAU | **$6–$12** | VPS upgrade to 2GB RAM ($12) if wx cache grows beyond 4K entries. GitHub Pages free. |
| 10K–100K MAU | **$30–$80** | Add $24/mo DO managed DB (if alerts/sync moves off Supabase free), $6–12 VPS. Supabase free tier (50K MAU) covers 10K easily. |
| 100K MAU | **$80–$200** | Supabase Pro ($25/mo), VPS upgrade, CDN caching likely needed. |

No cost action needed before launch. Supabase free tier covers pre-monetization entirely.

---

## 8. `origin/master` Footgun — 🔴 RED (Day 12)

`origin/master` is now **561 commits behind `origin/main`** (frozen at June 2026). `deploy.yml` deploys on push to BOTH `main` AND `master`. A mistaken `git push origin master` deploys the June build — stripping 3.5 months of changes (46-venue expansion, scoring overhaul, onboarding rewrite) to production, silently.

**2-minute fix — run in the same SSH session as the Oct 4 VPS deploy:**

```bash
# Option A — recommended: delete the stale master branch entirely
git push origin --delete master

# Option B — keep master but remove it from deploy.yml (edit .github/workflows/deploy.yml)
# Change:
#   branches: [main, master]
# To:
#   branches: [main]
# Then: git add .github/workflows/deploy.yml && git commit -m "remove master from deploy trigger" && git push
```

---

## 9. Stale Remote Branches — ⚠️ P2 (Day 12)

**19 stale remote branches** (18 `claude/*` + `fix-appjsx-final` + `restore-appjsx` + `test-small`). Same list as yesterday. None merged to main. Low priority during code freeze.

```bash
# Bulk delete after Oct 4 deploy — run from local networked machine
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

---

## What Breaks First at Scale

**Open-Meteo is the rate-limit cliff.** A full cold sweep is ~808 upstream calls (404 weather + ~270 marine). Open-Meteo's free tier allows ~10,000 req/day — that's only ~12 full cold sweeps. At 100 MAU with different airports, you exceed this within hours. The VPS shared cache collapses this to ~1 upstream call per coordinate per 2hr regardless of concurrent users. It's already written and committed. The only thing preventing it from working is one `scp` + `pm2 restart`. If the r/skiing post lands before the VPS deploy, 500 users hit Open-Meteo cold, exhaust the free tier in 10 minutes, and everyone sees "conditions unavailable." That is a launch-day catastrophe with a 10-minute fix that's been ready for 56 days.

---

## Issue Summary

| # | Severity | Issue | Days Open | Fix Time |
|---|----------|-------|-----------|----------|
| P0 | 🔴 | VPS proxy.js not deployed — **DEADLINE TODAY** | **56** | 10 min SSH |
| P1 | 🔴 | `origin/master` footgun (deploys June build to prod) | 12 | 2 min |
| P2 | 🟡 | 19 stale remote branches | 12 | 5 min cleanup |
| P3 | ⚪ | SW PRECACHE caches wrong Babel URL (dev-only, no prod impact) | NEW | 30 sec with next commit |
| P3 | ⚪ | No SRI on CDN script tags | ongoing | 30 min post-launch |
| ✅ | — | Code freeze clean (Day 20) | — | — |
| ✅ | — | All secrets properly handled | — | — |
| ✅ | — | 404 venues correct (134 ski / 270 beach) | — | — |
| ✅ | — | 15 lateSeason:true venues confirmed | — | — |
