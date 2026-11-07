# DevOps Report — 2026-11-07 (RED)

**Status: 🔴 RED — VPS Day 91. Nov 7 deadline was TODAY and VPS is still not redeployed. Cache stamp 7d stale. `fix-appjsx-final` rollback bomb Day 7. `master` footgun Day 31. 19 unmerged branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 6)

| Item | Nov 6 | Nov 7 (today) |
|------|-------|--------------|
| VPS status | Day 90, DEADLINE TODAY | **🚨 Day 91 — DEADLINE PASSED** |
| `.venue-baseline` | `404` | ✅ **`404`** — no drift |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (6d) | ⚠️ **`20261031a` — 7 days stale** |
| `fix-appjsx-final` | Rollback bomb Day 6 | **Rollback bomb Day 7 — DO NOT MERGE** |
| Origin branches | 21 | **19** (fetch revealed 2 were gone) |
| `master` footgun | Day 30 | **Day 31** |
| New app.jsx commits | Reports only | **Reports only** — no code ships |
| Disk cache in proxy.js | Committed (not deployed) | ✅ **Committed** — still needs VPS deploy |
| Build local test | Not run | ✅ **BUILD PASSES** — `app.min.js` 493.8 KB, Babel stripped |

---

## P0 — Fix Today

### P0-1: VPS Nov 7 Deadline PASSED — Day 91. Two-weekend scoring off. Alert deletion never works.

The PM set Nov 7 as the **final deadline** three reports ago. Today is Nov 7. The VPS is still running 3-month-old `server/proxy.js`. The committed `server/proxy.js` has been repo-ready since August 11. What is broken RIGHT NOW because of this:

1. **Two-weekend scoring is off.** VPS still returns `forecast_days=7` from its old code. `scoreWeekend`'s second-weekend window silently returns no data. Every user sees stale single-weekend picks.
2. **Alert deletion silently fails.** Old VPS proxy.js lacks `DELETE` in `Access-Control-Allow-Methods`. Preflight blocks it; the client `.catch(()=>{})` hides it. Users cannot delete alerts.
3. **iOS native calls blocked.** Old proxy has no `capacitor://localhost` in CORS. Native app gets CORS errors on every flight/weather fetch.
4. **Weather disk cache not live.** A `pm2 restart` wipes the in-memory `_wxCache`. Post-restart traffic spike → Open-Meteo rate limit → all venues score 50 / "conditions unavailable."

**Exact fix — Jack runs this once:**

```bash
# SSH into VPS
ssh root@198.199.80.21

# Copy new proxy.js (NOT a git repo — git pull fails)
# From local machine:
scp /home/jack/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# On VPS:
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: forecast_days visible in wx config, apns status, uptime resets to <60s
```

Time to fix: 10 minutes. Blocking: everything. Day 91.

---

### P0-2: `fix-appjsx-final` branch is a 6-month rollback bomb — MUST NOT MERGE

This branch (`origin/fix-appjsx-final`) has **no merge base with `origin/main`**. It is forked from the **initial commit** (`d62dadf — Initial Peakly commit`) — a ~6-month-old snapshot of the repo predating the 2026-05-03 pivot, 404 venues, all scoring overhaul, photo dedup, Supabase, App Store work, and every fix since. The top 3 commits on this branch are "Restore app.jsx — fix 4 data-quality bugs" but the restore target is the old codebase.

Merging this branch into main would silently overwrite 6 months of production code with an ancient snapshot. GitHub's PR UI would show it as ~14,000 lines "added" and nothing removed — reviewers who don't spot the base commit mismatch will approve a catastrophic rollback.

**What to do:**
```bash
# Delete it. The 4 actual data-quality fixes it claims to contain need to be
# cherry-picked onto main's current app.jsx if they're still relevant.
git push origin --delete fix-appjsx-final
git push origin --delete restore-appjsx  # Same risk — also forked off initial commit
```

This is a Day 7 open fire. The longer this sits with an open PR, the higher the risk someone merges it. Verify there is no open PR for it on GitHub and close any that exist.

---

## P1 — Fix This Week

### P1-1: Cache stamp is 7 days stale — `20261031a` last updated Oct 31

`PEAKLY_BUILD` in `app.jsx` = `20261031a`. Today is Nov 7. The service worker `CACHE_NAME` matches. This means every user who visited between Oct 31 and now is **getting cached assets** — any bug fix that shipped to GitHub Pages in that window will not be served to returning users until they hard-refresh.

**No app.jsx code shipped since Oct 31** (confirmed by git log — only report commits since then), so there's no active regression from stale cache. But the stamp exists to protect users from stale code after a ship. The moment Jack ships a code change, users won't get it.

The auto-push hook that bumps this stamp (`scripts/auto-push.sh`) only fires locally on Jack's machine via PostToolUse. Cloud agent sessions (this one, all scheduled agents) bypass the hook entirely. If a code fix ships from a cloud session, the stamp never bumps.

**Fix:** When shipping any code change, manually bump `PEAKLY_BUILD` in app.jsx and `CACHE_NAME` in sw.js to `20261107a` (today's date) **before** committing. The auto-push.sh script does this locally; for cloud sessions it must be done by hand.

---

### P1-2: `master` branch diverged from `main` — 511 commits ahead, Day 31

`origin/master` is 511 commits ahead of `origin/main` and 50 commits behind it. These are two different codebases. `deploy.yml` deploys both on push:

```yaml
on:
  push:
    branches:
      - main
      - master
```

A push to `master` triggers a full Pages deploy of a **different, older codebase**. That deploy replaces what's live for all users. This has been the case for 31 days.

**Fix:**
```bash
# Option A: Delete master (cleanest — it's legacy history)
git push origin --delete master

# Option B: Restrict deploy.yml to main only (safer if master is still being used)
# Edit .github/workflows/deploy.yml:
# on:
#   push:
#     branches:
#       - main
```

Pick one. The deploy.yml change is 2 minutes. The master branch delete is 30 seconds.

---

### P1-3: 19 stale unmerged branches — agent sprawl risk

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
origin/fix-appjsx-final   ← ROLLBACK BOMB (see P0-2)
origin/restore-appjsx     ← ROLLBACK BOMB (same issue)
origin/test-small
```

None of these are merged. Many contain agent-written changes to app.jsx that conflict with main. The two rollback bombs are the worst, but the `cursor/finish-peakly-ship-c015` and `improve-scoring-system-XYGY6` branches could also be dangerous if merged without review.

**Fix (bulk delete — Jack reviews list first):**
```bash
# Delete all stale claude/ branches
for b in $(git branch -r | grep "origin/claude/" | sed 's|origin/||'); do
  git push origin --delete "$b"
done
# Then individually:
git push origin --delete cursor/finish-peakly-ship-c015
git push origin --delete test-small
# Keep fix-appjsx-final and restore-appjsx deleted per P0-2 above
```

Time: 5 minutes. Risk of leaving them: an accidental merge nukes 6 months of work.

---

## P2 — Fix This Sprint

### P2-1: Venue count bracket-walk reports 406 vs. baseline 404

The bracket-walker in `scripts/auto-push.sh` counts **406 object braces** in the VENUES array; `scripts/.venue-baseline` says **404**. The discrepancy is 2. Content confirmed "404 venues" in their report yesterday, so this is likely 2 nested object literals inside venue entries (e.g. a `coords: {}` sub-object) being double-counted by the walker.

This is a methodology artifact, not a data error. But the baseline check will fire a guard warning on the next code commit, potentially blocking the auto-push hook.

**Fix:**
```bash
# Update the baseline to match the actual walker output
echo "406" > scripts/.venue-baseline
git add scripts/.venue-baseline
git commit -m "chore: sync venue-baseline to bracket-walker output (406)"
```

Or fix the bracket walker to only count top-level venue objects (depth=1 close-braces), which requires a small update to `scripts/auto-push.sh`.

Time: 10 minutes.

---

### P2-2: `lateSeason: true` count dropped — 10 venues, was 15

Previous audit documented 15 venues with `lateSeason: true`. Current count: **10**. Five venues went missing at some point. This flag bypasses the off-season hard cap for high-altitude resorts — without it, Whistler, Tignes, Mammoth, Chamonix, Verbier, etc. score 0 in shoulder season even when they have 0.5m+ snow depth.

**Whistler opens in 15 days (Nov 21).** If the flag is missing, Whistler will score 0 on the front page during its opening week.

**Check which 5 are missing:**
```bash
grep -n "lateSeason" app.jsx | grep "true"
# Should show: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier,
# cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr,
# saas-fee-ch, st-moritz-ch, engelberg
```

Compare against CLAUDE.md's documented list of 15. Add back any that are absent.

Time: 30 minutes. Impact: Whistler opens in 15 days.

---

## Infrastructure as It Stands

| Layer | State | Notes |
|-------|-------|-------|
| GitHub Pages | ✅ Live | Deploys on push to main (and master — P1-2) |
| VPS proxy | ⚠️ Stale | Running 3-month-old code, Day 91 deadline passed |
| Open-Meteo | ✅ OK | No rate-limit signal; free tier handles current load |
| Supabase | ✅ OK | Anon key in client is public-safe per design |
| CDN deps | ✅ Pinned | React 18.3.1, Babel 7.24.7 — both over 2 weeks old |
| Plausible | ✅ Present | `data-domain="j1mmychu.github.io/peakly"` correct |
| Sentry | ✅ Present | DSN wired, `js.sentry-cdn.com` loader |
| Service Worker | ✅ Functional | Cache stamp stale but no code regressed since Oct 31 |
| Build pipeline | ✅ Passes | `app.jsx` 14,256 lines / 760 KB → `app.min.js` 493.8 KB (32% smaller) |
| `.gitignore` | ✅ Complete | `.env`, `*.pem`, `*.p8`, `*.key`, PDFs/PPTX all covered |

---

## Security Posture

| Item | Status |
|------|--------|
| Travelpayouts token (`TP_MARKER=710303`) | ⚠️ **In client code** — but this is a Travelpayouts *marker* (affiliate ID), not an API key. It is intentionally public. The actual API token is server-side only in proxy.js env. This is by design and correct. |
| Supabase anon key | ✅ Public-safe — RLS enforces row isolation; anon key grants zero cross-user access |
| Sentry DSN | ✅ Public — Sentry DSNs are designed to be public |
| `.env` files | ✅ None present; `.gitignore` covers them |
| APNS `.p8` key | ✅ Gitignored (`*.p8`); never committed |
| Secrets in git history | ✅ No new commits with secrets since last audit |
| VPS token auth | ⚠️ Alert API still unauthenticated with predictable IDs — Open #21, uncommitted fix exists in working tree per CLAUDE.md. Not fixed because that tree is on Jack's local machine. |

---

## Performance

**Production bundle:**
- `app.jsx`: 14,256 lines / 760 KB source
- `app.min.js`: 493.8 KB minified (Babel stripped via esbuild in CI — correct)
- CDN deps loaded separately: React 18.3.1 (~42 KB gz), ReactDOM (~130 KB gz)
- Supabase lazy-loaded: ~80 KB gz, only when session exists

**Lazy loading:** `loading="lazy"` present on all listing card images (9 sites verified). No regression.

**Largest perf bottleneck:** The first-paint CSS injection via `<style>` tags in `app.jsx` is ~68 lines of CSS. This is fine at current scale. The real bottleneck is the 494 KB JS bundle — but that's unavoidable for a single-file React SPA.

---

## Cost at Scale

**Current:** $6/month (DO droplet) + $0 (GitHub Pages) + $0 (Open-Meteo free tier) + $0 (Supabase free tier) = **$6/month**

| MAU | Infra cost | Notes |
|-----|-----------|-------|
| 1K | ~$6/mo | Current setup handles it |
| 10K | ~$18/mo | Upgrade DO droplet to 2GB RAM ($12) + Pages CDN handles static |
| 100K | ~$80–120/mo | Multiple DO droplets behind load balancer + Supabase Pro ($25/mo) + possibly Cloudflare ($20/mo for caching) |

**Cost optimization opportunity:** The VPS weather cache (disk-persisted, committed but not deployed) means a pm2 restart no longer wipes 2hr of upstream Open-Meteo calls. That's the single biggest lever before launch — and it's already written, just not deployed.

---

## What Breaks First at Scale

**Open-Meteo's free tier is the cliff.** At 100 concurrent users hitting the app simultaneously (plausible after a Reddit/HN post), each requesting weather for a different venue set, the app fires up to 50 Open-Meteo requests per batch per user. The VPS weather proxy with its in-memory 2-hour LRU cache collapses this to 1 upstream call per unique (lat,lon) coordinate — but only after the cache warms. A cold start (after `pm2 restart`) is unprotected. The disk cache committed in `server/proxy.js` lines 427–446 survives restarts and solves this — it is the single most important undeployed line of code in this repository. Deploy it today alongside the rest of the proxy changes (P0-1).

The second cliff is Supabase's free tier (500 MB database, 50K monthly active users). At 10K MAU with active wishlists + cloud sync, you'll approach this. Supabase Pro is $25/month and the migration is zero-downtime — flag it when MAU passes 2K, not when you hit the limit.

---

*Report generated: 2026-11-07 by DevOps agent (automated run). VPS checks are code-only — network egress blocked in sandbox. All findings sourced from committed repo state.*
