# DevOps Report — 2026-11-11 (RED)

**Status: 🔴 RED — VPS Day 95 (Whistler opens in 10 days). Cache stamp 11d stale. `.venue-baseline` MISSING Day 3. `master` footgun Day 35. `fix-appjsx-final` rollback bomb Day 12. 19 stale branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block confirmed). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 10)

| Item | Nov 10 | Nov 11 (today) |
|------|--------|----------------|
| VPS status | Day 94 — deadline passed | 🚨 **Day 95 — no movement** |
| `.venue-baseline` | MISSING Day 2 | 🚨 **MISSING Day 3 — venue guard still broken** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (10d) | ⚠️ **`20261031a` — 11 days stale** |
| `fix-appjsx-final` | Rollback bomb Day 11 | **Rollback bomb Day 12 — DO NOT MERGE** |
| `master` footgun | Day 34 | **Day 35** |
| New app.jsx commits | 0 | **0 — 25 days no code commits** |
| Venue count (eval) | 404 | ✅ **404 confirmed (209 compact + 195 JSON)** |
| lateSeason venues | 15 | ✅ **15 confirmed (10 compact + 5 JSON)** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| BASE_PRICES coverage | ✅ 100% | ✅ **100% — stays closed** |
| Sentry DSN | live | ✅ live |
| Plausible | present, uncommented | ✅ present, uncommented |
| Proxy URL | HTTPS (duckdns) | ✅ `https://peakly-api.duckdns.org` |
| Travelpayouts token client-side | TP_MARKER only | ✅ safe — secret stays server-side |
| fetchTravelpayouts timeout | 4s AbortController | ✅ wired |
| Origin branches | 21 | **21 total (19 non-main/master)** |

---

## P0 — Fix Today

### P0-1: VPS Day 95 — Whistler opens in 10 days, two-weekend scoring still broken

**Countdown: Whistler Nov 21. Thanksgiving ski weekend Nov 29.** Both fall within the next 18 days. The live VPS is still running the pre-Aug-11 proxy.js (confirmed by prior sessions; no redeploy since then). That version returns `forecast_days=7`, which silently kills two-weekend scoring for any venue beyond day 6 → `scoreWeekend` returns `confidence:low` → front page filters those venues out. Half the ski catalog invisible on the highest-traffic weekend of the year.

**Broken on live VPS right now:**
1. `forecast_days=7` → two-weekend scoring dead → ski venues drop off front page beyond day 6
2. `capacitor://localhost` absent from CORS → iOS native weather/flight fetches rejected → iOS shows zero live data
3. `DELETE` missing from `Access-Control-Allow-Methods` → alert deletion silently fails (`.catch(()=>{})` swallows)
4. `_wxCache` in-memory only → `pm2 restart` wipes it → cold spike risks Open-Meteo free-tier ceiling

**Fix — 10 minutes, requires Jack SSH:**
```bash
# 1. Copy committed proxy.js to VPS (NOT a git clone — git pull fails there)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# 2. Restart
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"

# 3. Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: forecast_days:14, apns:unconfigured, uptime resets to seconds
# wx_cache_size refills within minutes of first traffic
```

No `npm install` required — zero new npm deps since last deploy.

**Deadline: before Nov 21.** Every day past that is a user seeing a degraded product on the ski season's first real weekend.

---

### P0-2: Cache stamp `20261031a` is 11 days stale

**Direct impact:** Every returning user whose service worker cached the Oct 31 build is still on that snapshot. `CACHE_NAME = "peakly-20261031a"` is unchanged, so their device never evicts. When a real app.jsx fix ships, those users won't see it until they hard-refresh or the cache expires.

This self-resolves when any app.jsx/sw.js change ships (auto-push.sh bumps the stamp atomically). No manual action needed unless a hotfix ships before then.

**Manual bump if needed immediately:**
```bash
# app.jsx line 17:
const PEAKLY_BUILD = "20261111a";

# sw.js line 1:
const CACHE_NAME = "peakly-20261111a";

# index.html line 395:
<script type="text/babel" src="./app.jsx?v=20261111a" data-presets="react"></script>
```

---

## P1 — Fix This Week

### P1-1: `.venue-baseline` MISSING Day 3 — venue integrity guard broken

`scripts/auto-push.sh` reads `.venue-baseline` to enforce a minimum venue count on every app.jsx commit. File is missing. This means the guard falls back to `guard_fail` behavior (or skips the check) on the next app.jsx edit. A regression that drops venues ships silently.

**Fix — 2 minutes:**
```bash
cd /home/user/peakly

# Write correct baseline (404 venues, verified today via eval)
echo "404" > .venue-baseline

git add .venue-baseline
git commit -m "restore: .venue-baseline to 404 (guard was broken for 3 days)"
git push -u origin main
```

Verify the guard picks it up: `grep -A5 "venue-baseline" scripts/auto-push.sh`

---

### P1-2: `fix-appjsx-final` branch — merge would deploy old app.jsx to production

Branch `origin/fix-appjsx-final` last commit is `9fab855 "Restore app.jsx — fix 4 data-quality bugs"`. That branch diverges from a point well before recent changes. `deploy.yml` triggers on push to `main` **and** `master`. If someone merges or force-pushes this branch to either trigger branch, GitHub Actions deploys whatever version of app.jsx is on that branch — which could be hundreds of commits behind current main.

The word "Restore" in the commit message is a red flag for unreviewed rollback work.

**Action:** Delete the branch before anyone accidentally merges it.
```bash
# Verify what it touches vs main before deleting
git diff origin/main..origin/fix-appjsx-final -- app.jsx | head -50

# If it's behind / diverged with no value, delete:
git push origin --delete fix-appjsx-final
```

If the data-quality fixes on this branch are genuinely needed, cherry-pick the specific commits onto main rather than merging the whole branch.

---

### P1-3: `master` branch footgun Day 35 — accidental push deploys old code

`deploy.yml` triggers on push to both `main` and `master`. `master` is 511 commits ahead of main's merge-base — it's a fully diverged branch with an old version of app.jsx. Any accidental `git push origin master` (easy to do from a local checkout that has master as the default) triggers a Pages deploy of the old code.

**Fix:**
```bash
# Option A: Remove master from deploy trigger (edit deploy.yml)
# Change:
#   branches:
#     - main
#     - master
# To:
#   branches:
#     - main

# Then commit and push to main.

# Option B: Delete the master branch entirely (more aggressive, verify nothing depends on it first)
git push origin --delete master
```

Option A is safer. Option B is cleaner. Neither requires a VPS SSH.

---

## P2 — Fix This Sprint

### P2-1: 19 stale remote branches (15 `claude/`) — namespace noise, CI risk

21 remote branches; 19 are not main or master. 15 are `claude/` agent branches from automated worktrees (most abandoned). Each runs CI on creation; none have been reviewed or merged.

```bash
# List all non-main/master remote branches
git branch -r | grep -v "origin/main\|origin/master\|HEAD"

# Batch delete the obviously-dead claude/ branches (adjust list after review):
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

Review `fix-appjsx-final` separately (P1-2 above).

---

## Infrastructure Health Snapshot

| Check | Status | Detail |
|-------|--------|--------|
| `app.jsx` size | ✅ | 14,256 lines / 742 KB |
| Braces balanced | ✅ | 5684/5684 |
| Venue count (eval) | ✅ | 404 (209 compact + 195 JSON) |
| lateSeason count | ✅ | 15 (10 compact + 5 JSON) |
| Plausible analytics | ✅ | Present, uncommented, `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ | Live (index.html line 77) |
| Proxy URL | ✅ | HTTPS `peakly-api.duckdns.org` (no HTTP) |
| CDN deps | ✅ | React 18.3.1, Babel 7.24.7, Sentry — all pinned versions |
| Babel in index.html | ✅ | Dev-only; `deploy.yml` strips it via `build-web.mjs` → `dist/` |
| Travelpayouts token | ✅ | `TP_MARKER = "710303"` (marker only — not the token) |
| Supabase anon key | ✅ | Public-safe per design (RLS-gated, documented) |
| `.gitignore` | ✅ | Covers `.env*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| No `.env` files | ✅ | None found in working tree |
| fetchTravelpayouts timeout | ✅ | 4s AbortController + fallback |
| Open-Meteo direct fallback | ✅ | `_tryProxyWx` → direct Open-Meteo on proxy failure |
| Cache stamp | ⚠️ | `20261031a` — 11 days stale (auto-bumps on next app.jsx ship) |
| `.venue-baseline` | 🚨 | MISSING (Day 3) — venue guard non-functional |
| VPS redeploy | 🚨 | Day 95 — Whistler opens in 10 days |

---

## Cost Estimate

| Tier | MAU | Infrastructure | Notes |
|------|-----|----------------|-------|
| Today | <1K | $6/mo (DigitalOcean 1GB) | Well under any ceiling |
| 1K MAU | 1K | $6/mo | VPS handles easily; Open-Meteo free tier (10K calls/day) covers 1K users |
| 10K MAU | 10K | $12–18/mo | Need VPS upgrade to 2GB ($12) + disk cache live (Open #23) |
| 100K MAU | 100K | $60–80/mo | Need weather cache disk persistence (Open #23), DigitalOcean managed DB, consider Cloudflare Workers in front |

**Single biggest cost optimization available right now:** Open #23 (disk-persist `_wxCache`). Currently, `pm2 restart` wipes the cache. At 10K MAU with a cold restart, every user triggers a direct Open-Meteo call simultaneously. At 10K DAU, that's well over the free tier ceiling in minutes. 30-line fix, deferred since July 25.

---

## What Breaks First at Scale

**Open-Meteo free tier hits the ceiling before the VPS does.** At ~66 concurrent users hitting the same uncached venue set, Open-Meteo's free tier throttles. The VPS proxy's shared in-memory cache prevents this — but only while `pm2` stays up. The VPS redeploy (P0-1) requires a `pm2 restart`, which wipes the cache. The disk-persistence fix (Open #23) is a ~30-line change to `server/proxy.js` that writes each weather response to a JSON file on disk and reads it on startup. Bundle this with the P0-1 redeploy: one SSH session, solve both. Without it, the first Reddit/HN traffic spike after any restart blows through Open-Meteo's rate ceiling in under a minute — and direct fallback calls hit Open-Meteo individually, compounding the problem. The VPS memory (1GB) is not the constraint; the network rate limit is.

---

## Action Summary for Jack

| Priority | Action | Time | Requires |
|----------|--------|------|---------|
| 🚨 P0 | SSH to VPS, `scp server/proxy.js`, `pm2 restart` | 10 min | SSH access |
| 🚨 P0 | Verify cache stamp self-bumps on next app.jsx ship | 0 min | (automatic) |
| ⚠️ P1 | `echo "404" > .venue-baseline && git add && commit && push` | 2 min | Terminal |
| ⚠️ P1 | Review + delete `fix-appjsx-final` branch | 5 min | GitHub |
| ⚠️ P1 | Remove `master` from deploy.yml triggers | 5 min | Edit + push |
| 📋 P2 | Batch-delete 19 stale remote branches | 5 min | Terminal |
