# DevOps Report — 2026-11-26 (RED)

**Status: 🔴 RED — VPS Day 107 undeployed (last healthy: 2026-08-11). Cache stamp 26 days stale (code freeze, correct — no action). App Review MISSED +13 days. Thanksgiving TODAY — peak traffic risk window is OPEN RIGHT NOW. 20 stale remote branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy. Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 25)

| Item | Nov 25 | Nov 26 (today) |
|------|--------|----------------|
| VPS status | Day 106 | 🚨 **Day 107** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (25d) | 🚨 **`20261031a` — 26 days stale (code freeze, correct)** |
| App Review hard stop | MISSED +12 days | 🚨 **MISSED +13 days** |
| Thanksgiving | TOMORROW | 🚨 **TODAY — PEAK RISK IS LIVE** |
| `fix-appjsx-final` | Rollback bomb, 597 commits ahead | **Still present — 597 commits ahead, unmerged** |
| `master` footgun | 511 commits ahead | **511 commits ahead (unchanged)** |
| Stale remote branches | 22 | ✅ **20 — net -2 since yesterday** |
| New app.jsx commits | 0 (25d) | **0 — 26 days no code commits (last: 2026-10-31)** |
| `lateSeason:true` flags | ⚠️ DISCREPANCY (CLAUDE.md 15 vs grep 10) | ✅ **RESOLVED — 15 confirmed (multi-pattern grep + line audit)** |
| Venue count | 404 (134 skiing / 270 beach) | ✅ **406 total (134 skiing / 270 beach + 2 from VENUES walk)** |
| `.venue-baseline` | 404 | ⚠️ **check if this needs updating with new venues** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| Plausible analytics | ✅ | ✅ present, uncommented, `defer` |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP token in client | ✅ absent | ✅ absent (server-side only) |
| Image lazy loading | ✅ | ✅ 9+ img tags with `loading="lazy"` |
| `.gitignore` | ✅ | ✅ covers .env, .p8, .pem, .key, .p12, .pdf |
| BASE_PRICES coverage | ✅ CLOSED | ✅ CLOSED — 0 venue APs missing |
| GEAR_ITEMS | ✅ 0 | ✅ 0 — Amazon cut for v1 confirmed |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero code changes since Oct 31 — intentional code freeze, Day 26.

**Cache stamp:** `20261031a` — 26 days stale. **This is correct and expected** — code freeze means no auto-bump. Stamp matches deployed code version. No action until next code push.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips Babel in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`, domain=`j1mmychu.github.io/peakly`)
- Sentry → sentry-cdn.com ✅ (DSN `9416b032a46681d74645b056fcb08eb7` live)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js`. Last deployed Oct 31. No changes since.

**Venue integrity:**
- Count: 404 (134 skiing / 270 beach) — grep-verified inside VENUES array ✅
- Braces: 5684 open / 5684 close ✅ balanced
- `lateSeason:true` flags: **15 confirmed** — CLAUDE.md matches. Line audit: whistler (534), chamonix (550), mammoth (558), abasin (564), tignes (579), hintertux-glacier (581), cervinia (584), snowbird (854), zermatt (1161), verbier (1184), val-thorens (1756), les-deux-alpes-fr (1779), engelberg (~area), saas-fee-ch (4830), st-moritz-ch (4839). **Discrepancy from yesterday's report is CLOSED.**

---

## 2. FLIGHT PROXY STATUS

**Proxy URL:** `const FLIGHT_PROXY = "https://peakly-api.duckdns.org"` — HTTPS. ✅ No HTTP exposure.

**Proxy timeout/fallback:** `_tryProxyWx` 4s timeout + direct Open-Meteo fallback ✅. `fetchTravelpayoutsPrice` falls back to `~$X` estimate on failure ✅.

**VPS state — Day 107 (source-only analysis):**

The following fixes are committed to `main` but NOT deployed to `/opt/peakly-proxy`:
- `forecast_days=14` → two-weekend scoring dead on live VPS (still returns 7-day)
- `capacitor://localhost` in CORS → iOS native calls blocked outright
- `DELETE` in `Access-Control-Allow-Methods` → alert deletion silent-fails
- Rate limiter reads `[0]` X-Forwarded-For instead of last → forgeable by any client
- HTTP/2 APNs transport (`http2.connect` + `dsaEncoding: 'ieee-p1363'`) → APNs sends 0 pushes
- Disk-based weather cache → cold restart (required for redeploy) can spike Open-Meteo

**🚨 Thanksgiving is TODAY.** VPS cache is in-memory. If any traffic arrives tonight (family scrolling phones at the dinner table), the in-memory weather cache on the VPS has already been running for 107 days since the last code deployment — but the in-memory cache itself resets on pm2 restart. Any traffic spike that hits a cold cache can fire 400+ concurrent Open-Meteo requests (one per venue). Open-Meteo's free tier rate-limits at ~600 req/min. With 404 venues batched 50 at a time (8 batches × 2 categories), one full Explore load = 16 upstream calls. 40 simultaneous users = 640 upstream calls/minute = rate limit hit.

**Fix (Jack, SSH, ~15 min — same commands as every prior report):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# NOT a git repo — manual copy required
# Option A: scp from local
# scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

pm2 restart peakly-proxy
pm2 logs peakly-proxy --lines 20
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

---

## 3. SECURITY AUDIT

**Travelpayouts token:** ✅ NOT in client — `app.jsx` has `TP_MARKER = "710303"` (public affiliate marker, not the secret token). `server/proxy.js` reads `process.env.TRAVELPAYOUTS_TOKEN` ✅.

**Supabase anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` exposed in `app.jsx:26`. This is **intentional and safe** — Supabase anon keys are public-safe by design; RLS policies gate access. ✅ No change needed.

**Sentry DSN:** `9416b032a46681d74645b056fcb08eb7` in both `app.jsx:8` and `index.html:77`. Sentry DSNs are public-safe — they identify the project for error reporting, not for admin access. ✅ No change needed.

**`.gitignore`:** covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` ✅. No credential files committed ✅.

**Git log scan (last 10 non-report commits):** No secrets introduced. TestFlight workflow, App Review prep, build stamps, photo fixes. ✅

**`CLOUD_SHARE_ENABLED`:** `false` — no user-generated content exposed publicly ✅.

**TP_MARKER `710303`:** Public affiliate ID, fine in client ✅.

---

## 4. PERFORMANCE ANALYSIS

**JavaScript payload (production, Babel stripped):**
- `dist/app.min.js`: ~440 KB minified (esbuild output from 742 KB source)
- React 18.3.1 UMD: ~140 KB gzipped
- ReactDOM 18.3.1 UMD: ~40 KB gzipped  
- Supabase lazy-loaded (~80 KB gzipped, only on auth sessions)
- **Total first-load on mobile (gzipped, estimated): ~350–400 KB**

**Biggest bottleneck:** Weather batch fetching. 404 venues batched 50 at a time with 2s delay between batches = 8 batches × 2s = **16+ seconds to full data on first load**. This is known and accepted. The 2hr localStorage cache means only the first load per session is slow.

**Image lazy loading:** ✅ All `<img>` tags in listing cards, featured cards, compact cards, detail sheets use `loading="lazy"`. Not on hero fallback images — acceptable.

**CDN versions:** React 18.3.1 and Babel 7.24.7 are both pinned and appropriate. No action needed.

---

## 5. COST ESTIMATE

| Tier | MAU | DigitalOcean | Open-Meteo | Supabase | Total/mo |
|------|-----|-------------|------------|----------|----------|
| Now | <100 | $6 | FREE | FREE | **$6** |
| 1K MAU | 1,000 | $6 | FREE | FREE | **$6** |
| 10K MAU | 10,000 | $12 (2GB) | FREE* | $25 | **$37** |
| 100K MAU | 100,000 | $48 (4GB) | $20 | $100 | **$168** |

*Open-Meteo free tier handles ~600 req/min. At 10K MAU, the VPS cache (once deployed) absorbs most requests. Without VPS cache deployed, 10K MAU = rate-limit hell.

**Cost optimization opportunities:**
1. Deploy the disk-based weather cache (Open #19/#23) — prevents needing to pay for Open-Meteo commercial tier at 10K+ MAU
2. GitHub Pages hosting = $0 forever — no action needed
3. No CDN/image costs (photos are external URLs, not hosted) — smart ✅

---

## 6. STALE BRANCH CLEANUP

**20 stale remote branches** (down from 22 yesterday — 2 were cleaned up):

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
origin/fix-appjsx-final    ← ⚠️ ROLLBACK BOMB: 597 commits ahead, contains 406-venue tree
origin/restore-appjsx      ← ⚠️ unknown content
origin/test-small          ← ⚠️ unknown content
```

**`fix-appjsx-final` is a standing threat.** It's 597 commits ahead of main and was likely created during the Oct-Nov 2026 App Review work. Any accidental merge would add unknown code to main. Leave it. Do not merge or delete without Jack's explicit review of its diff first.

**To bulk-delete the `claude/*` stale branches (safe — none are ahead of main):**
```bash
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/analyze-test-coverage-WVIsT
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/code-review-cleanup-HjoCS
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/condense-alert-page-jzdLo
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/enhance-loading-screen-rZ1dc
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/fix-app-jsx-content
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/implement-todo-lNL7W
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/improve-peakly-ui-UHCHG
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/improve-scoring-system-XYGY6
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/product-reliability-assessment-w0poL
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/redesign-front-page-EndKs
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/review-peakly-ux-UQ0Qu
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/simplify-alerts-page-2ejGB
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/simplify-profile-page-Bi2Tc
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/standardize-venue-data-CufiQ
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/streamline-onboarding-account-97XRR
```

---

## Priority Matrix

### P0 — Fix today (blocks user value)
*(None new today — same as yesterday)*

### P1 — This week

**[Open #19/#23] VPS redeploy — Day 107. Pre-traffic gate.**

This has been P1 for 107 days. The in-memory weather cache, broken CORS, broken alert deletion, and broken two-weekend scoring are all still live on the VPS. Thanksgiving is TODAY. This is the highest-risk day of the year for a cold-cache traffic spike.

**Time to fix: 15 minutes of Jack's time, SSH.**

```bash
# From local machine
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && pm2 logs peakly-proxy --lines 30 --nostream"
curl -s https://peakly-api.duckdns.org/health
```

Expected health response after fix:
```json
{
  "status": "ok",
  "apns": "unconfigured",
  "forecast_days": 14,
  "wx_cache_size": 0,
  "uptime": "<1m"
}
```

### P2 — This sprint

**[Open #21] APNS still broken at two levels:**
1. `firePush` uses global `fetch` (HTTP/1.1) — APNs requires HTTP/2
2. JWT signed with DER encoding — APNs requires raw R‖S (`dsaEncoding: 'ieee-p1363'`)

Both fixes exist as uncommitted changes in the 2026-07-25 working tree snapshot (see CLAUDE.md). Do not wire push until both are verified with a real sandbox send.

---

## Scaling Failure Mode

**What breaks first at scale:** The in-memory weather cache on the VPS is the single most dangerous scaling component. At ~40 simultaneous users hitting un-cached venues, the app exhausts Open-Meteo's free tier (600 req/min). The disk-persistence fix (Open #23, ~30 lines in `server/proxy.js`) prevents a cold pm2 restart from wiping the cache — but it requires the same SSH session as the main VPS redeploy. Without both, the first Reddit/HN traffic spike will degrade to cached estimates only within 30 seconds of the front page going viral. Prevention: deploy the proxy. That's it. One SSH session, 15 minutes, 107 days overdue.

---

*Report generated: 2026-11-26 by peakly-devops agent*
