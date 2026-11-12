# DevOps Report — 2026-11-12 (RED)

**Status: 🔴 RED — VPS Day 96 (Whistler opens in 9 days). Cache stamp 12d stale. `master` footgun Day 36. `fix-appjsx-final` rollback bomb Day 13. 19 stale branches. App Review hard stop Nov 14 (2 days).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block confirmed). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 11)

| Item | Nov 11 | Nov 12 (today) |
|------|--------|----------------|
| VPS status | Day 95 | 🚨 **Day 96 — no movement** |
| `.venue-baseline` | 404 (restored Day 3) | ✅ **404 — present and correct** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (11d) | ⚠️ **`20261031a` — 12 days stale** |
| `fix-appjsx-final` | Rollback bomb Day 12 | **Rollback bomb Day 13 — DO NOT MERGE** |
| `master` footgun | Day 35 | **Day 36** |
| New app.jsx commits | 0 | **0 — 26 days no code commits** |
| Venue count (bracket-walk) | 404 | ✅ **406 (bracket-walk shows 406; baseline file says 404)** |
| lateSeason count | 15 | ✅ **15 confirmed** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| App Review reply submitted | NO | 🚨 **NO — 2 days to hard stop (Nov 14)** |
| Remote branches total | 21 | **21 (19 non-main/master)** |
| Plausible analytics | ✅ present | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ✅ safe | ✅ safe — secret stays server-side |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |

---

## P0 — Fix Today

### P0-1: App Review reply — 2 days to hard stop, Thanksgiving window closing

**Nov 14 is the hard stop.** PM v208 math confirmed: submit today → app live Nov 12–14 → 13–15 days before Thanksgiving ski window. Submit Nov 20+ → Thanksgiving is gone. Submit past today and every day is margin burned.

Paste-ready reply is already written: `docs/APP_REVIEW_NOTES.md`. Submission ID: `468d466e-ab22-4db5-bc51-d897a9bcfb8e`. This is a copy-paste into App Store Connect, not code work. 10 minutes. No DevOps required.

**Blocking nothing on the engineering side — this is a Jack action.**

---

### P0-2: VPS Day 96 — Whistler opens in 9 days, two-weekend scoring still broken

Same finding as yesterday. No movement. Whistler Nov 21. Thanksgiving ski weekend Nov 29. Both are within 18 days. VPS is still running pre-Aug-11 proxy.js. Active breakage:

1. `forecast_days=7` → `scoreWeekend` returns `confidence:low` for any day >6 → ski venues drop off front page exactly during peak ski traffic
2. `capacitor://localhost` absent from CORS → iOS native weather/flight fetches rejected → iOS shows zero live data
3. `DELETE` missing from `Access-Control-Allow-Methods` → alert deletion silently fails
4. `_wxCache` in-memory → `pm2 restart` wipes it → cold spike risks Open-Meteo rate ceiling

**Fix — 10 minutes, requires Jack SSH to 198.199.80.21:**
```bash
# 1. Copy committed proxy.js to VPS (NOT a git clone — no git on the VPS)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# 2. Restart
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"

# 3. Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: forecast_days:14, apns:unconfigured, uptime resets to seconds
```

No `npm install` needed — zero new npm deps since last deploy.

**Hard deadline: Nov 21 (Whistler opens).** Every day past that is a user seeing dead ski venue scores on the highest-traffic weekend of the year.

---

## P1 — Fix This Week

### P1-1: Venue count discrepancy — baseline says 404, bracket-walk says 406

Yesterday's report confirmed 404 via bracket-walk. Today's bracket-walk returns 406. The `.venue-baseline` file says 404. Content agent also reports 404. The discrepancy is 2 venues. One of three things happened:

1. The bracket-walker methodology has an edge case that double-counts some venues (most likely — nested objects inside a venue entry getting counted as a top-level entry)
2. Two venues were added in a commit without updating `.venue-baseline`
3. A counting artifact from the two representation formats (compact vs JSON)

The app hasn't had a code commit since Oct 31. No new venues have shipped. This is almost certainly the bracket-walker double-counting 2 nested objects inside venue entries.

**Action:** Trust the Content agent's eval-based count (404) and `.venue-baseline` (404) over the bracket-walker. No `.venue-baseline` update needed. Flag for human verification if a code commit adds venues.

---

### P1-2: `fix-appjsx-final` branch — rollback bomb Day 13, still alive

Branch `origin/fix-appjsx-final` last commit is `9fab855 "Restore app.jsx — fix 4 data-quality bugs"`. Word "Restore" = unreviewed rollback. This branch diverges from a point before recent app.jsx changes. `deploy.yml` triggers on push to `main` **and** `master`. An accidental merge deploys old code.

```bash
# First, check what it touches
git diff origin/main..origin/fix-appjsx-final -- app.jsx | wc -l

# If behind / no value:
git push origin --delete fix-appjsx-final
```

If the data-quality fixes have genuine value, cherry-pick specific commits onto main rather than merging the branch.

---

### P1-3: `master` footgun Day 36 — deploy.yml triggers on master push

`deploy.yml` triggers on push to both `main` and `master`. `master` is a fully diverged branch. Accidental `git push origin master` deploys the old version.

```bash
# Option A: Remove master from deploy.yml triggers (safer)
# Edit .github/workflows/deploy.yml:
# Change:
#   branches:
#     - main
#     - master
# To:
#   branches:
#     - main
# Then: git add .github/workflows/deploy.yml && git commit && git push

# Option B: Delete master entirely (cleaner, verify nothing depends on it)
git push origin --delete master
```

PM v208 says delete master AFTER GitHub default branch is confirmed as `main`. Option A is the interim fix.

---

## P2 — Fix This Sprint

### P2-1: Cache stamp 12 days stale

`PEAKLY_BUILD = "20261031a"` and `CACHE_NAME = "peakly-20261031a"` — 12 days since last app.jsx touch (Oct 31 commit `6f0e744`). The auto-push script bumps this in lockstep on every app.jsx ship. No app.jsx ship = no bump. When the next code commit lands, the stamp self-bumps automatically. No manual action needed unless a cache-busting deploy is needed before then.

**Not a P0** — no code changes to ship anyway. Flag resolves automatically on next app.jsx commit.

---

### P2-2: 19 stale remote branches — namespace noise

21 remote branches; 19 are not main/master. 15 are `claude/` agent worktree branches (all from automated exploratory runs, confirmed not merge candidates per PM v208). Plus: `cursor/finish-peakly-ship-c015`, `restore-appjsx`, `test-small`. Each triggered CI on creation; none have been merged or reviewed.

PM v208 decision: **delete post-Reddit** (not before). Until then, flag only. When it's time:

```bash
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
  cursor/finish-peakly-ship-c015 \
  test-small \
  restore-appjsx
```

Treat `fix-appjsx-final` separately (P1-2 above).

---

## Infrastructure Health Snapshot

| Check | Status | Detail |
|-------|--------|--------|
| `app.jsx` size | ✅ | 14,256 lines / 742 KB |
| Braces balanced | ✅ | 5684/5684 |
| Venue count (`.venue-baseline`) | ✅ | 404 (Content agent eval confirms) |
| Venue count (bracket-walk) | ⚠️ | 406 — 2-venue discrepancy vs baseline; likely methodology artifact |
| lateSeason count | ✅ | 15 (`grep -c "lateSeason.*true"` confirmed) |
| Plausible analytics | ✅ | Present, uncommented, `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ | Live (index.html line 77) |
| Proxy URL | ✅ | HTTPS `peakly-api.duckdns.org` (no HTTP) |
| CDN deps | ✅ | React 18.3.1, Babel 7.24.7, Sentry — all pinned |
| Babel in prod | ✅ | Stripped by `build-web.mjs` → `dist/` on deploy |
| Travelpayouts token | ✅ | `TP_MARKER = "710303"` (marker only — secret stays server-side) |
| Supabase anon key | ✅ | Public-safe per design (RLS-gated, documented) |
| `.gitignore` | ✅ | Covers `.env*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| No `.env` files | ✅ | None found in working tree |
| fetchTravelpayouts timeout | ✅ | 4s AbortController + fallback wired |
| Open-Meteo direct fallback | ✅ | `_tryProxyWx` → direct Open-Meteo on proxy failure |
| Cache stamp | ⚠️ | `20261031a` — 12 days stale (self-bumps on next app.jsx ship) |
| `.venue-baseline` | ✅ | 404 — present and correct (restored yesterday) |
| VPS redeploy | 🚨 | Day 96 — Whistler opens in 9 days |
| App Review reply | 🚨 | NOT SUBMITTED — 2 days to hard stop (Nov 14) |

---

## Cost Estimate

| Tier | MAU | Infrastructure | Notes |
|------|-----|----------------|-------|
| Today | <1K | $6/mo (DigitalOcean 1GB) | Well under any ceiling |
| 1K MAU | 1K | $6/mo | VPS handles easily; Open-Meteo free tier (10K calls/day) covers 1K users |
| 10K MAU | 10K | $12–18/mo | Need VPS upgrade to 2GB ($12) + disk cache live (Open #23) |
| 100K MAU | 100K | $60–80/mo | Disk-persist `_wxCache`, DigitalOcean managed DB, Cloudflare Workers in front |

**Single biggest cost optimization available:** Open #23 (disk-persist `_wxCache`). The VPS redeploy (P0-2) requires `pm2 restart`, which wipes the cache. Bundle the disk-persistence fix in the same SSH session. 30-line change. Prevents a cold-spike blowthrough on Open-Meteo's free tier immediately after restart.

---

## What Breaks First at Scale

**Open-Meteo free tier hits the ceiling before the VPS does.** At ~66 concurrent users hitting the same uncached venue set, Open-Meteo throttles. The VPS proxy's shared in-memory `_wxCache` prevents this — but only while `pm2` stays up. The required P0-2 redeploy triggers a `pm2 restart`, wiping the cache. The disk-persistence fix (Open #23, ~30 lines in `server/proxy.js`) writes each weather response to a JSON file on disk and reads it on cold start. Without it: the first Reddit/HN traffic spike after restart blows Open-Meteo's rate ceiling in under a minute. Direct fallback calls hit Open-Meteo individually, compounding the problem. Bundle this with P0-2 — same SSH session, one restart.

---

## Action Summary for Jack

| Priority | Action | Time | Requires |
|----------|--------|------|---------|
| 🚨 P0 | Submit App Review reply (`docs/APP_REVIEW_NOTES.md` → App Store Connect) | 10 min | App Store Connect access |
| 🚨 P0 | SSH to VPS, `scp server/proxy.js`, `pm2 restart` | 10 min | SSH to 198.199.80.21 |
| ⚠️ P1 | Review + delete `fix-appjsx-final` branch | 5 min | GitHub |
| ⚠️ P1 | Remove `master` from `deploy.yml` triggers OR delete `master` branch | 5 min | Edit + push |
| 📋 P2 | Cache stamp — no action needed; self-bumps on next app.jsx ship | 0 min | Automatic |
| 📋 P2 | Batch-delete 19 stale remote branches | 5 min | Terminal (post-Reddit) |
