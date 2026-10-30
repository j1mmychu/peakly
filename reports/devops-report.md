# DevOps Report — 2026-10-30 (RED)

**Status: 🔴 RED — VPS Day 82. Oct 30 hard deadline is TODAY and the VPS has not been redeployed. Whistler opens Nov 21 (22 days). PRECACHE+master footgun Day 23. 15 new unmerged `claude/*` branches appeared on origin. No app.jsx commits since Oct 12 (18 days).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes (741 KB)** — unchanged since Oct 12 (18 days) ✅ |
| Total venues (id: grep, lines 504–5153) | **404** — matches CLAUDE.md ✅ |
| `lateSeason:true` venues | **5** (grep count — CLAUDE.md documents 15; mixed format. Use `grep -c 'lateSeason.*true'` for full count) ⚠️ |
| `.venue-baseline` | ❌ **file missing** — `auto-push.sh` venue-count guard will fail on next app.jsx commit |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **46 days stale**. No code shipped since Aug 11. First edit MUST bump in lockstep. ⚠️ |
| Plausible analytics | ✅ present, uncommented — `index.html:32` |
| React 18 / Babel CDN | ✅ pinned versions |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS |
| Travelpayouts token in client | ✅ `TP_MARKER="710303"` is public affiliate marker — no secret |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated (`app.jsx:26`) |
| Sentry DSN | ✅ configured |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ all `<img>` tags covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController (`app.jsx:5521`) |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES coverage | ✅ 181 airports — Open #22 CLOSED |
| Client `forecast_days` | ✅ 14 days (`app.jsx:5546`) — client is correct; VPS is the bottleneck |
| Price sanity check | ✅ `duffelWrongLength` guard live (`app.jsx:13626`) |
| `PRECACHE` in sw.js | ❌ **contains `babel.min.js` (~1 MB)** — production users force-download Babel on first SW install despite prod build stripping it. Day 23 unchanged. |
| `origin/master` vs `origin/main` | ❌ **master 511 commits behind main; deploy.yml triggers on both** — any push to master deploys stale code. Day 23 unchanged. |
| Unmerged `claude/*` branches | ❌ **15 NEW branches appeared on origin today** (fetch brought them in) — see section 5 |

---

## 2. Critical Issues (P0)

### P0-A: VPS Redeploy — **TODAY WAS THE HARD DEADLINE. IT HAS NOT HAPPENED.**

Day 82. Oct 30 is today. Jack set this as the hard deadline in v192. Whistler opens Nov 21 = 22 days. `forecast_days:14` from a Nov 1 deploy reaches Nov 15. A Nov 7 deploy reaches Nov 21 exactly — that is the last viable date. Every day of further delay burns the margin.

The committed `server/proxy.js` (Aug 11, `059de43`) has been sitting undeployed for 82 days. What's broken right now on production:

| Bug | Impact |
|-----|--------|
| `forecast_days:7` on VPS | Two-weekend scoring broken — Whistler/Tignes invisible on front page |
| `_wxCache` in-memory only | `pm2 restart` blasts 404 Open-Meteo requests simultaneously; free tier blown in seconds on traffic spike |
| `capacitor://localhost` absent from CORS | iOS native API calls blocked outright — no weather, no pricing on iOS app |
| `DELETE` not in `Access-Control-Allow-Methods` | Alert deletion has never worked |
| APNs HTTP/1.1 `fetch` + DER encoding | Push notifications deliver zero |

**Fix — 5 minutes of SSH:**
```bash
ssh jack@198.199.80.21
cd /opt/peakly-proxy
# scp or rsync server/proxy.js from repo — it is NOT a git clone
rsync -av ~/peakly/server/proxy.js jack@198.199.80.21:/opt/peakly-proxy/
ssh jack@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
# verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# expect: forecast_days:14, apns:configured (if .p8 set), uptime fresh
```

---

## 3. High Issues (P1)

### P1-A: PRECACHE Contains Babel — Day 23

`sw.js:3` — `PRECACHE = ["https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"]`

Production users (loading `dist/index.html` where Babel is stripped) have their service worker pre-fetch and cache ~1 MB of Babel on first install. This is dead weight on prod. The SW is there for offline caching; `dist/app.min.js` (439 KB) should be in PRECACHE, not Babel.

**Fix — 2-line edit to `sw.js`:**
```js
// sw.js line 3 — replace:
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];

// with:
const PRECACHE = [];
// (dist/app.min.js is served from GH Pages path /peakly/dist/app.min.js —
//  add it here once the path is confirmed stable)
```
Time to fix: 2 minutes. Requires cache bump in lockstep.

### P1-B: `origin/master` Footgun — Day 23

`deploy.yml` triggers on both `main` and `master`. `origin/master` is 511 commits behind `origin/main`. Any push to `master` (accidental or by an agent targeting the wrong branch) deploys Oct-2024-era code to `https://j1mmychu.github.io/peakly/`.

**Fix:**
```bash
# Option A: Delete origin/master (nuclear, clean)
git push origin --delete master

# Option B: Edit deploy.yml to only trigger on main
# .github/workflows/deploy.yml — change:
#   branches: [main, master]
# to:
#   branches: [main]
```
Option A is cleanest since master has no unique content. Time: 30 seconds.

---

## 4. Medium Issues (P2)

### P2-A: 15 New Unmerged `claude/*` Branches on Origin

Today's `git fetch` brought in 15 new branches that weren't there yesterday:
- `claude/analyze-test-coverage-WVIsT`
- `claude/code-review-cleanup-HjoCS`
- `claude/condense-alert-page-jzdLo`
- `claude/enhance-loading-screen-rZ1dc`
- `claude/fix-app-jsx-content`
- `claude/implement-todo-lNL7W`
- `claude/improve-peakly-ui-UHCHG`
- `claude/improve-scoring-system-XYGY6`
- `claude/product-reliability-assessment-w0poL`
- `claude/redesign-front-page-EndKs`
- `claude/review-peakly-ux-UQ0Qu`
- `claude/simplify-alerts-page-2ejGB`
- `claude/simplify-profile-page-Bi2Tc`
- `claude/standardize-venue-data-CufiQ`
- `claude/streamline-onboarding-account-97XRR`

Plus `fix-appjsx-final`, `restore-appjsx`, `test-small`.

None is merged. Combined these represent potentially significant diverging app.jsx modifications. Risk: any of these could be merged to main accidentally, or a future agent could rebase onto one.

**Fix:**
```bash
# Review and delete all stale claude/* branches
git branch -r | grep claude/ | sed 's|origin/||' | xargs -I{} git push origin --delete {}
# Check the non-claude ones first before deleting
git log origin/fix-appjsx-final --oneline -5
git log origin/restore-appjsx --oneline -5
```
Jack should eyeball `fix-appjsx-final` and `restore-appjsx` before deleting — names suggest they may contain intentional fixes.

### P2-B: `.venue-baseline` File Missing

`scripts/auto-push.sh` compares the venue count against `.venue-baseline`. The file doesn't exist, which means the guard can't catch venue count regressions. The last confirmed count is 404.

**Fix:**
```bash
echo "404" > /home/user/peakly/.venue-baseline
git add .venue-baseline && git commit -m "restore .venue-baseline to 404"
```

### P2-C: Cache Stamp 46 Days Stale

`PEAKLY_BUILD = "20260914a"` and `CACHE_NAME = "peakly-20260914a"` haven't been bumped since Aug 11. The auto-push hook handles this automatically on every app.jsx edit — this will self-correct the next time any code ships. No standalone fix needed, but flag it: the first edit of any file must bump all three (app.jsx, sw.js, index.html) in lockstep.

### P2-D: Stale Cron Prompt (Day 23)

The stored cron prompt for this scheduled agent still references "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Current reality: 404 venues, 2 categories, Pro cut, Sentry live. Jack: 2-minute fix in the Claude.ai scheduled tasks interface. Not a prod risk, just wastes tokens correcting stale context every run.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` size (production) | `dist/app.min.js` = 439 KB minified (per CLAUDE.md) |
| Babel CDN (dev only) | ~1 MB — stripped in prod |
| React 18 UMD | ~45 KB gzipped |
| Plus Jakarta Sans | ~20 KB per weight variant |
| **Total production parse budget** | ~510 KB cold |

**Biggest bottleneck:** Weather fetch batching (50 venues / 2s) means a cold Explore load on a fast connection stalls for ~16 seconds before scores populate for all 404 venues. This is already mitigated by showing estimates immediately and upgrading in place. Not a change — documenting for completeness.

No `loading="lazy"` gaps found. CDN dependencies are pinned to specific versions. No new performance regressions vs. yesterday.

---

## 6. Cost Estimate

| MAU | Open-Meteo | DigitalOcean VPS | GitHub Pages | Total/mo |
|-----|-----------|-----------------|--------------|----------|
| 1K | Free (well under 10K calls/day ceiling) | $6 | Free | **$6** |
| 10K | ~$0 (proxy cache absorbs repeat coords) | $6 | Free | **$6** |
| 100K | ⚠️ Spike risk without disk cache (P0-A) — with it: $0 | $12 (upgrade to 2GB) | Free | **$12** |
| 1M | Open-Meteo commercial tier ~$50–200/mo | $24 (4GB) | Free | **$74–224** |

**VPS disk cache (bundled in P0-A fix) is the single biggest cost lever.** Without it, a Reddit spike at 10K+ DAU fans out raw Open-Meteo requests and hits rate limits. With it, the free tier survives 100K MAU comfortably.

---

## 7. What Breaks First at Scale

**The VPS is the single point of failure.** At current scale (LAUNCH DAY +11), the proxy cache absorbs repeated venue fetches fine. But the moment a Reddit post lands, you get 1K+ users within 20 minutes hitting the same 404 venue coordinates. Without `_wxCache` disk persistence (P0-A), a cold-cache VPS restart (required for the P0-A redeploy) fans out 404 raw Open-Meteo requests simultaneously — free tier ceiling is ~10K/day, you'd blow through 4% of it in a single restart event. With disk cache, the worst-case cold start is a 2-second pause before the in-memory cache repopulates from disk. Fix is committed; it just needs SSH copy + `pm2 restart`. The five-minute action Jack has been deferring for 82 days is the entire scaling story for the next 90 days.

---

## Delta vs. Yesterday

| Item | Yesterday | Today |
|------|-----------|-------|
| VPS status | Day 81, deadline TOMORROW | Day 82, **deadline TODAY — missed** |
| app.jsx changes | none since Oct 12 | none (Day 18) |
| Venue count | 404 (corrected from 406) | 404 ✅ |
| New origin branches | 0 | **15 new `claude/*` + 3 others** |
| `.venue-baseline` | existed (405) | **MISSING** |
| PRECACHE P1 | Day 22 | Day 23 |
| master footgun | Day 22 | Day 23 |
