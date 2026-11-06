# DevOps Report — 2026-11-06 (RED)

**Status: 🔴 RED — VPS Day 90, NOV 7 DEADLINE IS TOMORROW. Cache stamp 6d stale. `fix-appjsx-final` rollback bomb Day 6. `master` footgun Day 30. 21 branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 5)

| Item | Nov 5 | Nov 6 (today) |
|------|-------|--------------|
| VPS status | Day 89, 2 days to Nov 7 | **⚠️ Day 90 — DEADLINE IS TOMORROW** |
| `.venue-baseline` | `404` | ✅ **`404` — 134 ski / 270 beach, no drift** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (5d) | ⚠️ **`20261031a` — 6 days stale** |
| `fix-appjsx-final` | Rollback bomb Day 5 | **Rollback bomb Day 6** |
| Origin branches | 21 | **21** — no pruning |
| `master` footgun | Day 29 | **Day 30** |
| New commits to main | Reports only | **Reports only** — no app.jsx changes |
| Disk cache in proxy.js | Committed | ✅ **Committed (lines 433–439)** — just needs VPS deploy |

---

## P0 — Fix Today

### P0-1: VPS Nov 7 Deadline — TOMORROW. Two-weekend scoring is off. Alert deletion never works.

**Day 90.** The Nov 7 deadline set in PM v199 expires tomorrow. The committed `server/proxy.js` has been live in the repo since August 2026. The VPS at `/opt/peakly-proxy` is running a 3-month-old copy. What is broken RIGHT NOW:

- **Two-weekend scoring is off.** VPS still serves `forecast_days=7`. The client requests 14. When the VPS cache serves a 7-day payload, `scoreWeekend`'s second-weekend window silently returns no data.
- **iOS native calls blocked.** `capacitor://localhost` is in the committed CORS allowlist but not on the running VPS.
- **Alert deletion silently fails.** Committed proxy has `DELETE` in `Access-Control-Allow-Methods` (line 41). Running VPS doesn't.
- **Weather cache wipes on restart.** Disk cache (`fs.writeFileSync/readFileSync`, lines 433–439) is committed but not deployed. Any VPS restart nukes the in-memory cache.

**Fix — Jack SSH session, ~10 min:**

```bash
# SSH to the VPS
ssh root@198.199.80.21

# Copy new proxy.js (NOT a git clone — git pull won't work here)
# From local machine:
scp /home/user/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# On the VPS:
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: apns:configured|unconfigured, wx_cache_size:0 (refills fast), uptime:seconds
```

**Est. time:** 10 min if SSH keys are working.

---

### P0-2: Cache stamp 6 days stale — `20261031a` on Nov 6

`PEAKLY_BUILD = "20261031a"`, `CACHE_NAME = "peakly-20261031a"`, `dist/index.html` loads `app.min.js?v=20261031a`. Six days without a stamp bump. Any user who last visited before Nov 1 has a service worker that will never self-invalidate until the cache name changes. This matters most when the VPS redeploy commit lands — that commit MUST carry a stamp bump or the new proxy behavior won't reach users with cached SW.

**Fix (run before or with the VPS redeploy commit):**

```bash
cd /home/user/peakly
TODAY=$(date +%Y%m%d)
perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
perl -pi -e "s/const CACHE_NAME = \"[^\"]+\"/const CACHE_NAME = \"peakly-${TODAY}a\"/" sw.js
perl -pi -e "s/app\.jsx\?v=[^\"]*/app.jsx?v=${TODAY}a/" index.html
# Also update dist files for lockstep:
perl -pi -e "s/app\.min\.js\?v=[^\"]*/app.min.js?v=${TODAY}a/" dist/index.html
perl -pi -e "s/const CACHE_NAME = \"[^\"]+\"/const CACHE_NAME = \"peakly-${TODAY}a\"/" dist/sw.js
# Verify lockstep:
grep "PEAKLY_BUILD\|CACHE_NAME\|?v=" app.jsx sw.js index.html dist/index.html dist/sw.js
```

**Est. time:** 2 min. Bundle with the VPS redeploy commit.

---

### P0-3: `fix-appjsx-final` IS A 6-MONTH ROLLBACK BOMB — Close It

This is Day 6. Prior reports confirmed this. Reposting one final time for Jack's action:

- Branch `app.jsx`: 9,095 lines, `PEAKLY_BUILD = "20260513c"` (May 13, 2026)
- `main` `app.jsx`: 14,256 lines, `PEAKLY_BUILD = "20261031a"` (Oct 31, 2026)
- **Delta: 5,161 lines of shipped features would be deleted** — full 404-venue catalog, all 2026-07/08/09/10 fixes, App Review prep, iOS entitlements, geolocation fix, stale-price fix, improved onboarding

The 4 IATA fixes that branch contains from May 2026 are either already merged into main or are low enough risk that cherry-picking beats a catastrophic merge. **Close this branch without merging.**

```bash
# On GitHub: close the fix-appjsx-final PR (if open) without merging
# Then delete the remote branch:
git push origin --delete fix-appjsx-final
```

---

## P1 — Fix This Week

### P1-1: 21 Remote Branches — Active Sprawl Risk

21 remote branches outstanding. Breakdown:
- 15 `origin/claude/*` — orphaned agent worktrees, never merged
- 1 `origin/cursor/finish-peakly-ship-c015` — orphaned
- `origin/fix-appjsx-final` — rollback bomb (see P0-3)
- `origin/master` — footgun (see P1-2)
- `origin/restore-appjsx` — suspect (restore from what?)
- `origin/test-small` — suspect

Every one of these is a merge accident waiting to happen and noise in the GitHub UI.

**Fix:**

```bash
# Delete all stale claude/* branches:
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
  fix-appjsx-final \
  restore-appjsx \
  test-small

# Inspect master before deleting:
git log --oneline origin/master..origin/main | wc -l  # if 0, main is ahead — safe to delete
# If main is ahead of master:
git push origin --delete master
```

**Est. time:** 5 min. **Review `restore-appjsx` and `master` contents before deleting** — confirm they don't have unmerged commits.

---

### P1-2: `master` Branch — Active Footgun Day 30

`deploy.yml` pushes to both `main` AND `master`. Any push to `master` triggers a separate GitHub Pages deploy that races `main`. This is Day 30 of this known footgun.

The `origin/master` tip (`b6dc033`, "auto: terms.html") is behind `origin/main` by 19+ commits — the two have diverged.

**Fix:** Remove `master` from deploy.yml triggers once `master` is confirmed stale and safe to delete:

```yaml
# .github/workflows/deploy.yml — remove the master trigger:
on:
  push:
    branches:
      - main   # ← only this
  workflow_dispatch:
```

Then delete the remote branch (see P1-1 cleanup above).

---

## P2 — Fix This Sprint

### P2-1: BASE_PRICES Covers ~32% of Airports

`TP_MARKER = "710303"` is in client code as the Travelpayouts affiliate marker — this is the partner ID, not the secret API token. The secret token stays server-side. This is fine.

The gap: 100 of 146 venue airports lack a BASE_PRICES entry. The deal score (`getDealScore`) degrades to a flat `50` for any venue without a BASE_PRICES entry. That's 68% of venues showing non-meaningful deal scores, which undermines the headline feature.

**Top missing airports by venue count** (target backfill first):
CUN (Cancún — ~12 beach venues), BOB (Bora Bora), AUA (Aruba), STT/SXM (Caribbean), DPS (Bali), MLE (Maldives), NAN (Fiji), PPT (Tahiti), HNL (Honolulu).

**Fix:**

```js
// In app.jsx, add to BASE_PRICES object (approximate annual averages in USD round-trip from NYC):
CUN: 320,
BOB: 1200,
AUA: 480,
STT: 420,
SXM: 450,
DPS: 1100,
MLE: 1400,
NAN: 1300,
PPT: 1200,
HNL: 650,
HER: 900,  // Heraklion/Crete
RHO: 950,  // Rhodes
SPU: 800,  // Split
DBV: 850,  // Dubrovnik
```

**Est. time:** 30 min to research real numbers + paste. Look up current Skyscanner annual averages for accuracy before pasting.

---

### P2-2: Supabase Anon Key in Client Code

`SUPABASE_ANON_KEY` is hardcoded in app.jsx at line 26. This is **intentional and documented** — the anon key is public-safe with RLS gating per CLAUDE.md. Flagging for the record per the security audit checklist. No action required unless RLS policies are misconfigured.

Verify RLS is active:
```sql
-- Run in Supabase SQL editor:
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All tables should show rowsecurity = true
```

---

### P2-3: 9 lazy-loaded images — verify full coverage

`loading="lazy"` found on 9 img tags. This covers the main listing cards (ListingCard, FeaturedCard, CompactCard) and the detail sheet hero. Adequate for current load. At scale (100K MAU), consider adding `fetchpriority="high"` to the first above-the-fold hero card to improve LCP.

---

## Infrastructure Cost Estimate

| MAU | Infra Cost/mo | Breakdown |
|-----|--------------|-----------|
| Current (<100) | $6 | DO droplet $6 |
| 1K MAU | $6 | DO droplet $6, Open-Meteo free tier (no cost — ~200 unique venue coords, well under rate ceiling with VPS cache) |
| 10K MAU | $18 | DO droplet $12 (needs upgrade if wx cache misses spike) + $6 Supabase Pro if DB exceeds free tier |
| 100K MAU | $60–$120 | DO droplet $24 (2GB RAM) + Supabase Pro $25 + CDN edge cache $10–$50 |

**Cost optimization opportunities:**
1. The VPS disk cache (committed, undeployed) eliminates cold-start weather spikes for free. Deploy it.
2. GitHub Pages CDN is free and handles static asset load — no cost pressure there until 100K+.
3. Supabase free tier handles ~500 MAU active sync users before hitting the 500MB DB limit.

---

## Security Audit Summary

| Check | Status |
|-------|--------|
| Travelpayouts API token in client | ✅ **CLEAN** — only `TP_MARKER` (affiliate ID) in client, token is server-side only |
| Supabase anon key in client | ⚠️ **Present** — intentional, RLS-gated (CLAUDE.md documented) |
| `.env` / `*.pem` / `*.p8` in .gitignore | ✅ **CLEAN** |
| Sentry DSN in index.html | ✅ **Present** (line 77) |
| Plausible analytics | ✅ **Present and uncommented** (index.html line 32) |
| CDN deps pinned to exact versions | ✅ React 18.3.1, Babel 7.24.7 |
| Flight proxy on HTTPS | ✅ `peakly-api.duckdns.org` (HTTPS) |
| Stale git branches with potential secrets | ⚠️ **21 branches** — none appear to contain secrets, but each `claude/*` worktree should be audited before deletion |

---

## JavaScript Bundle Analysis

| File | Size |
|------|------|
| `app.jsx` (source) | 14,256 lines / 760 KB |
| `dist/app.min.js` (CI-built, not in repo) | ~439 KB (last measured 2026-06-20) — estimate ~500 KB now given 14.2K lines |
| React 18.3.1 UMD | ~130 KB gzipped |
| Babel Standalone (dev only, stripped in prod) | ~1.5 MB (dev) / **0** (prod) |
| Supabase JS (lazy-loaded) | ~80 KB gzipped — only loads if signed in |

**Single largest performance bottleneck:** `app.jsx` at 760 KB source / ~500 KB minified means the initial JS parse + eval on mobile is 300–600ms on mid-range Android. This is a known constraint of the single-file architecture. Mitigation: the CI build (esbuild via `build-web.mjs`) is already deployed and strips Babel, reducing the 3–5s mobile wall to ~600ms. No action required at current MAU.

---

## What Breaks First at Scale

**Open-Meteo rate ceiling** breaks first. At ~66+ concurrent DAU hitting the same venue set without the VPS cache, Open-Meteo's free tier (10K req/day, 10K req/min burst) gets breached. The committed VPS code has in-memory + disk cache with 2h TTL and in-flight deduplication — 1 upstream call per (lat, lon) coordinate regardless of concurrent users. This is the right architecture. It is not deployed. A single Reddit post at >100 DAU without the VPS redeploy = API throttling = blank weather cards = users bounce. **The VPS redeploy (P0-1) is the only blocker between the current state and a Reddit-safe launch.**

---

## Action Summary

| Priority | Item | Owner | Time |
|----------|------|-------|------|
| **P0** | VPS redeploy (`scp proxy.js` + `pm2 restart`) | Jack (SSH) | 10 min |
| **P0** | Cache stamp bump (`20261106a`) | Jack | 2 min |
| **P0** | Close/delete `fix-appjsx-final` on GitHub | Jack | 1 min |
| **P1** | Delete 19 stale branches | Jack | 5 min |
| **P1** | Remove `master` from deploy.yml triggers | Agent | 15 min |
| **P2** | BASE_PRICES backfill (~14 airports) | Agent | 30 min |
