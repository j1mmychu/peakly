# DevOps Report — 2026-11-27 (RED)

**Status: 🔴 RED — VPS Day 108 undeployed (last healthy: 2026-08-11). Cache stamp 27 days stale (code freeze, correct — no action). App Review MISSED +14 days. Post-Thanksgiving: highest traffic risk window just passed — VPS still undeployed. 20 stale remote branches (unchanged).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy. Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 26)

| Item | Nov 26 | Nov 27 (today) |
|------|--------|----------------|
| VPS status | Day 107 | 🚨 **Day 108** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (26d) | 🚨 **`20261031a` — 27 days stale (code freeze, correct)** |
| App Review hard stop | MISSED +13 days | 🚨 **MISSED +14 days (2 full weeks past)** |
| Thanksgiving | TODAY (peak risk open) | **Post-Thanksgiving — peak window just closed** |
| Black Friday | catchable | ⚠️ **Black Friday TODAY — Cyber Monday travel booking weekend in full swing** |
| Stale remote branches | 20 | **20 — unchanged** |
| New app.jsx commits | 0 (26d) | **0 — 27 days no code commits (last: 2026-10-31)** |
| `lateSeason:true` flags | ✅ 15 confirmed | ✅ **15 confirmed (10 unquoted + 5 quoted)** |
| Venue count | 406 (prev report) | ✅ **404 (134 skiing / 270 beach) — eval-counted, matches `.venue-baseline`** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| Plausible analytics | ✅ | ✅ present, uncommented, `defer` |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP token in client | ✅ absent | ✅ absent (server-side only) |
| Image lazy loading | ✅ | ✅ 9 img tags — all carry `loading="lazy"` |
| `.gitignore` | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |
| BASE_PRICES coverage | ✅ CLOSED | ✅ CLOSED |
| GEAR_ITEMS | ✅ 0 | ✅ 0 — Amazon cut for v1 confirmed |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero code changes since Oct 31 — intentional code freeze, Day 27.

**Cache stamp:** `20261031a` — 27 days stale. **This is correct and expected** — code freeze means no auto-bump. Stamp matches deployed code version. No action until next code push.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips Babel in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`, domain=`j1mmychu.github.io/peakly`)
- Sentry → sentry-cdn.com ✅ (DSN `9416b032a46681d74645b056fcb08eb7` live)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js`. Last deployed Oct 31. `dist/index.html` loads `./app.min.js?v=20261031a`. Babel stripped from production path ✅. Dev path (`index.html` root) still Babel-transpiles — expected ✅.

**Venue count (eval-counted):** 404 (134 skiing / 270 beach) ✅ — matches `.venue-baseline` ✅.

**Brace balance:** 5684/5684 ✅.

**lateSeason:true count:** 15 (10 unquoted + 5 quoted JSON) ✅ — matches CLAUDE.md ✅.

---

## 2. FLIGHT PROXY STATUS

**Proxy URL in app.jsx:** `https://peakly-api.duckdns.org` ✅ — HTTPS, not raw IP.

**TP_MARKER:** `710303` in client — this is the **public affiliate marker**, not the secret token. Travelpayouts token stays server-side only via `process.env.TRAVELPAYOUTS_TOKEN` in `server/proxy.js` ✅.

**VPS status (from source, not live):** Day 108 since the Aug 11 redeploy. The committed `server/proxy.js` has `forecast_days:14`, disk cache (Open #23), CORS fix for `capacitor://localhost`, and `DELETE` in `Access-Control-Allow-Methods`. **None of this is live.** The running VPS binary is the pre-Aug-11 version.

**fetchTravelpayoutsPrice:** Has proper timeout (`AbortController`, 8s) and fallback to `BASE_PRICES` estimate ✅.

**`fetchWeather`:** Tries VPS proxy first with 4s timeout, falls back to direct Open-Meteo ✅.

---

## 3. SECURITY AUDIT

**Exposed credentials scan:**
- Travelpayouts token: ✅ NOT in client (server-side only)
- Supabase anon key: exposed in `app.jsx:26` — **intentional and safe** (Supabase anon keys are public by design; RLS policies gate all data access) ✅
- Sentry DSN: in `app.jsx:8` and `index.html:77` — **public-safe** (identifies project for error reporting only) ✅
- TP_MARKER `710303`: public affiliate ID ✅
- No `.env` files committed ✅
- `.gitignore` covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` ✅

**Git log scan (last 10):** No secrets introduced. All commits are daily reports or prior feature work ✅.

**`CLOUD_SHARE_ENABLED`:** `false` — no user-generated content exposed publicly ✅.

**Branch threat: `fix-appjsx-final` (597 commits ahead of main)**
This branch still exists. It was created during the Oct-Nov App Review work cycle and contains a 406-venue tree with unknown diffs relative to main. It is a rollback bomb — any accidental `git merge fix-appjsx-final` on main would push unknown code to production. **Leave it. Do not merge or delete without Jack explicitly diffing it first.**

---

## 4. PERFORMANCE ANALYSIS

**JavaScript payload (production, Babel stripped):**
- `dist/app.min.js`: ~440 KB minified (esbuild from 742 KB source, Babel stripped) ✅
- React 18.3.1 UMD (cdnjs): ~140 KB gzipped
- ReactDOM 18.3.1 UMD (cdnjs): ~40 KB gzipped
- Supabase lazy-loaded: ~80 KB gzipped — only loads on auth sessions ✅
- **Estimated first-load mobile (gzipped): ~350–400 KB** — acceptable for a data-heavy app

**Biggest bottleneck:** Weather batch fetching. 404 venues batched 50 at a time with 2s delay = 8 batches × 2s = **16+ seconds to full data on first load**. Known and accepted. 2hr localStorage cache means only the first load per session pays this cost.

**Image lazy loading:** ✅ All 9 `<img>` tags use `loading="lazy"`. No regression.

**CDN versions:** React 18.3.1 and Babel 7.24.7 pinned. No action needed.

**Black Friday note:** Today is Black Friday — travel booking traffic is seasonally elevated. Users who get the app today and score venues will trigger the 404-venue weather batch on first load. Without the VPS cache (which absorbs re-fetches), this means direct Open-Meteo hammering. At current MAU (<100), not an issue. If Thanksgiving/Black Friday drove any organic installs, it's still fine — but each of those users fully saturates Open-Meteo's free tier for ~16 seconds of fetch time.

---

## 5. COST ESTIMATE

| Tier | MAU | DigitalOcean | Open-Meteo | Supabase | Total/mo |
|------|-----|-------------|------------|----------|----------|
| Now (<100) | <100 | $6 | FREE | FREE | **$6** |
| 1K MAU | 1,000 | $6 | FREE | FREE | **$6** |
| 10K MAU | 10,000 | $12 (2GB) | FREE* | $25 | **$37** |
| 100K MAU | 100,000 | $48 (4GB) | $20 | $100 | **$168** |

*Open-Meteo free tier handles ~600 req/min. VPS cache (once deployed) absorbs repeat requests per venue. Without it, 10K MAU = rate-limit hell at scale.

**Cost optimization opportunities:**
1. Deploy disk-based weather cache (Open #19/#23) — prevents needing Open-Meteo commercial tier at scale ← **108 days overdue, same SSH session as the VPS redeploy**
2. GitHub Pages = $0 forever ✅
3. Photos are external URLs, not hosted — zero CDN cost ✅

---

## 6. STALE BRANCH CLEANUP

**20 stale remote branches** (same as yesterday — no change):

```
origin/claude/analyze-test-coverage-WVIsT
origin/claude/code-review-cleanup-HjoCS
origin/claude/condense-alert-page-jzdLo
origin/claude/enhance-loading-screen-rZ1dc
origin/claude/fix-app-jsx-content
origin/claude/implement-todo-lNL7W
origin/claude/improve-peakly-ui-UHCHG
origin/claude/improve-scoring-system-XYGY6
origin/claude/product-reliability-assessment-w0poL
origin/claude/redesign-front-page-EndKs
origin/claude/review-peakly-ux-UQ0Qu
origin/claude/simplify-alerts-page-2ejGB
origin/claude/simplify-profile-page-Bi2Tc
origin/claude/standardize-venue-data-CufiQ
origin/claude/streamline-onboarding-account-97XRR
origin/cursor/finish-peakly-ship-c015
origin/cursor/phone-testflight-c015
origin/fix-appjsx-final    ← ⚠️ ROLLBACK BOMB: 597 commits ahead, 406-venue tree
origin/restore-appjsx      ← ⚠️ unknown content
origin/test-small          ← ⚠️ unknown content
```

**To bulk-delete the safe `claude/*` branches** (none ahead of main — safe to delete):
```bash
for branch in \
  analyze-test-coverage-WVIsT \
  code-review-cleanup-HjoCS \
  condense-alert-page-jzdLo \
  enhance-loading-screen-rZ1dc \
  fix-app-jsx-content \
  implement-todo-lNL7W \
  improve-peakly-ui-UHCHG \
  improve-scoring-system-XYGY6 \
  product-reliability-assessment-w0poL \
  redesign-front-page-EndKs \
  review-peakly-ux-UQ0Qu \
  simplify-alerts-page-2ejGB \
  simplify-profile-page-Bi2Tc \
  standardize-venue-data-CufiQ \
  streamline-onboarding-account-97XRR; do
  gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/$branch
done
```

Do NOT touch `fix-appjsx-final`, `restore-appjsx`, or `test-small` without reviewing their diffs first.

---

## Priority Matrix

### P0 — Fix today (blocks user value)

None new. Same as yesterday.

### P1 — This week

**[Open #19/#23] VPS redeploy — Day 108. This is the longest-running P1 in the project.**

The in-memory weather cache, `forecast_days:7` (not 14), broken CORS for iOS native, and broken alert deletion are all still running on the VPS. Black Friday is today — travel intent is high. The window for Thanksgiving-week organic growth has just closed, and the Cyber Monday travel booking weekend runs through Monday. If Jack plans to push on Product Hunt, Reddit, or any socials this week, the VPS must be deployed first.

**Time to fix: 15 minutes. SSH. That's it.**

```bash
# From local machine (not from cloud sandbox — SSH not available here)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 logs peakly-proxy --lines 30 --nostream"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

**Expected health response after redeploy:**
```json
{
  "status": "ok",
  "apns": "unconfigured",
  "forecast_days": 14,
  "wx_cache_size": 0,
  "uptime": "<1m"
}
```

**Verify these 4 things are live post-restart:**
1. `forecast_days` = 14 (not 7) → two-weekend scoring works
2. `capacitor://localhost` in CORS → iOS native proxy calls work  
3. `DELETE` in `Access-Control-Allow-Methods` → alert deletion works
4. `wx_cache_size` starts at 0 and climbs → disk cache (Open #23) persists across restarts

### P2 — This sprint

**[Open #21] APNS broken at two levels. Do not wire push until fixed:**
1. `firePush` uses `fetch` (HTTP/1.1) — APNs is HTTP/2-only
2. JWT DER encoding — APNs requires raw R‖S (`dsaEncoding: 'ieee-p1363'`)

Both fixes exist as uncommitted code from the 2026-07-25 working tree (see CLAUDE.md). Finish, verify with a real APNs sandbox send, then commit.

**[Open stale branches] Bulk-delete the 15 `claude/*` branches.** Takes 2 minutes. No risk. Cleans up the repo.

---

## Scaling Failure Mode

**What breaks first at scale:** The in-memory weather cache on the VPS. At ~40 simultaneous users hitting un-cached venues, the app exhausts Open-Meteo's free tier (600 req/min ceiling). The disk persistence fix (Open #23, ~30 lines in `server/proxy.js`) is **committed but not deployed**. A cold pm2 restart — the kind needed to push the fix itself — wipes the in-memory cache, so the fix window is also the highest-risk moment. The committed `proxy.js` already has disk persistence; deploying it eliminates the problem permanently. Without deployment, one Reddit/HN spike degrades all 404 venues to cached estimates within 30 seconds of going viral. The fix is on disk, SSH is 15 minutes away, and this is Day 108 of waiting. Black Friday + Cyber Monday travel booking weekend is now. Deploy the proxy.

---

*Report generated: 2026-11-27 by peakly-devops agent*
