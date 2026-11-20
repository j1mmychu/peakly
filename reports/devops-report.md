# DevOps Report — 2026-11-20 (RED)

**Status: 🔴 RED — VPS Day 104. Cache stamp 20 days stale (no code change). App Review MISSED +7 days. Whistler opens TOMORROW (Nov 21) — the moment the team built toward has arrived. `master` footgun Day 44. `fix-appjsx-final` rollback bomb Day 21 (597 commits, no common base with main). 19 stale remote branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 19)

| Item | Nov 19 | Nov 20 (today) |
|------|--------|----------------|
| VPS status | Day 103 | 🚨 **Day 104 — still undeployed** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (19d) | 🚨 **`20261031a` — 20 days stale** |
| App Review hard stop | MISSED +6 days | 🚨 **MISSED +7 days — Whistler opens TOMORROW Nov 21** |
| `fix-appjsx-final` | Rollback bomb Day 20 | **Day 21 — 597 commits, no common ancestor with main** |
| `master` footgun | Day 43 | **Day 44 — 511 commits ahead of main** |
| New app.jsx commits | 0 (19d) | **0 — 20 days no code commits (last: 2026-10-31)** |
| Venue count (eval) | 404 ✅ | ✅ **406 (eval) / 404 (.venue-baseline) — 2-venue drift explained below** |
| `.venue-baseline` | 404 | ⚠️ **404 (eval says 406 — see below)** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason (combined) | 15 | ✅ **15 confirmed (10 grep + 5 JSON-quoted)** |
| Remote branches | 19 stale | **19 stale — no change** |
| Plausible analytics | ✅ | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ affiliate only | ⚠️ same — `710303` is public affiliate marker, not secret |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |
| Image lazy loading | ✅ 9/9 | ✅ 9/9 `<img>` tags use `loading="lazy"` |
| .gitignore | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero lines changed since Oct 31 — code freeze holding for 20 days.

**Cache stamp:** `20261031a` — **20 days stale.** No action needed absent a code push. `auto-push.sh` auto-bumps when Jack pushes. No mechanism drift.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`)
- Sentry → sentry-cdn.com ✅ (DSN live: `9416b032a46681d74645b056fcb08eb7`)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js` (~440 KB minified, Babel stripped). No changes in 20 days.

**Braces:** 5684/5684 ✅. Proxy URL: HTTPS `peakly-api.duckdns.org` ✅ (no raw IP).

---

## 2. VENUE COUNT DRIFT — ⚠️ FALSE ALARM (explained)

**Eval counter says 406; `.venue-baseline` says 404.** Prior reports (Nov 16) already flagged this and cleared it: the eval bracket-walker counts 2 JS comment lines containing `{` near the VENUES block, inflating the count by 2. Real venue count is **404**. The `.venue-baseline` of 404 is correct. Content report (Nov 19) independently confirmed 404 via their own method. **Stop re-investigating.**

---

## 3. FLIGHT PROXY STATUS

**Proxy URL:** `https://peakly-api.duckdns.org` — HTTPS ✅. No raw IP (`104.131.82.242`) in app.jsx. `fetchTravelpayoutsPrice` has 8s timeout via `AbortController` ✅. Direct Open-Meteo fallback present ✅.

**VPS redeploy (Open #19):** Still undeployed — Day 104. `server/proxy.js` changes (forecast_days:14, disk cache, CORS, APNS H/2 fix) remain committed but NOT live. The VPS is a hand-copied directory; `git pull` doesn't work there. This was classified P1 pre-traffic gate by PM v99 (Jul 25). The two-weekend scoring, iOS CORS, and disk cache are all blocked until Jack SSHs in.

**Fix (unchanged from prior reports — still needs to be executed):**
```bash
# From your local machine with VPS SSH access:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
# Verify:
curl -s https://peakly-api.duckdns.org/health
```

---

## 4. SECURITY AUDIT

**No secrets exposed.** Full scan results:

| Item | Status |
|------|--------|
| Travelpayouts server token | ✅ NOT in client code — VPS only |
| TP_MARKER `710303` | ⚠️ in app.jsx line 6690 — public affiliate marker only, not a credential |
| Supabase anon key | ✅ Public-safe by design (RLS-gated, anon role) |
| `.env` files | ✅ None present in repo |
| `.gitignore` | ✅ Covers `.env*`, `*.p8`, `*.pem`, `*.key`, `*.p12`, `*.mobileprovision` |
| Recent commits | ✅ No secrets in last 20 commits (reports + CLAUDE.md only) |
| APNS keys | ✅ Not in repo (held offline per runbook) |

**TP_MARKER note:** `710303` is a public-facing affiliate marker (appears in deep-link URLs users share). Not a credential. No action needed.

---

## 5. PERFORMANCE ANALYSIS

**Bundle breakdown (dev path / what browsers load):**

| Resource | Size | Notes |
|----------|------|-------|
| Babel Standalone (dev) | ~1.5 MB | ❌ Strips in prod `dist/` via deploy.yml |
| React 18.3.1 UMD | ~130 KB gzip | ✅ |
| ReactDOM 18.3.1 UMD | ~130 KB gzip | ✅ |
| app.jsx (dev) | 742 KB | Babel parses in-browser — 3-5s mobile wall |
| app.min.js (prod) | ~440 KB | ✅ Served from `dist/` on GitHub Pages |
| Sentry SDK | ~50 KB gzip | `defer` ✅ |
| Plus Jakarta Sans | ~20 KB | Google Fonts CDN |

**Production (github.io) is clean:** Babel stripped, esbuild output ~440 KB. No local `index.html` loading issue affects deployed users.

**Biggest bottleneck:** The 406-venue weather batch fetch. 406 venues at 50 calls/2s = ~16 seconds of batched Open-Meteo calls on cold load. This is by design (rate limit compliance) but is the dominant UX lag. **Fix:** VPS redeploy with shared cache means N simultaneous users share 1 upstream call per coord — that's the existing mitigation, still blocked by Open #19.

**Images:** 9/9 `<img>` tags in app.jsx use `loading="lazy"` ✅.

---

## 6. BRANCH HYGIENE — ⚠️ ACTIVE RISK

**19 non-main/master remote branches**, all stale:

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
origin/fix-appjsx-final    ← 597 commits, NO common base with main
origin/restore-appjsx
origin/test-small
```

**`fix-appjsx-final` is an active rollback bomb.** 597 commits ahead of `main` with no merge base — meaning it started from a completely different root commit. Any accidental `git checkout fix-appjsx-final` or GitHub branch-merge UI click would wholesale replace the entire codebase. This branch's HEAD commit is "Restore app.jsx — fix 4 data-quality bugs (IATA codes + Chamonix dup)" — it may contain legitimate fixes, but as a 597-commit orphan it's unauditable without a full diff.

**`master`:** 511 commits ahead of `main`. Same deploy target (deploy.yml covers both). This is the footgun flagged since Day 1 — a push to `master` deploys an outdated codebase over the live site.

**Cleanup command (Jack to run after App Review clears):**
```bash
# Delete all stale claude/* and cursor/* branches
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

# Then fix master — force it to track main:
git push origin main:master --force-with-lease
```

---

## 7. COST ESTIMATE

| MAU | Infra cost | Notes |
|-----|-----------|-------|
| Current (<100) | $6/mo | DigitalOcean 1GB droplet (VPS only; GitHub Pages free) |
| 1K MAU | $6/mo | Pages free, VPS handles weather cache easily |
| 10K MAU | ~$18/mo | Upgrade VPS to 2GB ($12) + Pages still free |
| 100K MAU | ~$54/mo | 4GB VPS ($24) + Supabase Pro tier ($25) + CDN cache |

**Cost optimization:** At current scale, nothing to optimize. The VPS disk cache (Open #19) is the one upgrade that matters — prevents Open-Meteo rate limits from turning a Reddit spike into a 429 storm that blanks every venue card.

---

## 8. OPEN ISSUES PRIORITY ORDER

### P0 (blocks App Store submission)
None new. App Review resubmission is blocked on Jack replying to Apple's Guideline 2.1 information request — not a code issue.

### P1 (pre-traffic gate — fix before Reddit/HN post)
**#19 — VPS redeploy** (Day 104):
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s localhost:3001/health"
```
Unlocks: two-weekend scoring, iOS native proxy access, alert deletion, disk weather cache (Open #23).
Estimated time: 10 minutes.

**Branch cleanup** (after App Review clears):
Run the `git push origin --delete ...` block in §6 above.
Estimated time: 2 minutes.

### P2 (pre-launch quality)
**#20 — Photos:** ~346 of 406 venues show generic stock. Run `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait`.
**#22 — BASE_PRICES:** 68% of venue airports missing typical price (100/146). Backfill top 15 by venue count.
**#21 — APNS:** DER→P1363 JWT + HTTP/2 transport fix committed but unverified.

---

## 9. SCALE FAILURE PREDICTION

**What breaks first at scale:** Open-Meteo rate limits. The app batches 406 venue weather calls at 50/2s (~16s per full refresh). At 66+ concurrent DAU all hitting cold cache simultaneously, the calls fan out to raw Open-Meteo — each user spawns 406/50 = 9 seconds of requests, and Open-Meteo's free tier (10K calls/day) blows in under 25 concurrent users per day. The VPS shared cache (Open #19) is the one-line prevention: once deployed, N users sharing the same venue coord trigger 1 upstream call, not N. That redeploy is day-104 overdue. Without it, the first Reddit post that lands 200+ viewers in a morning sends 400× the daily free-tier budget and Open-Meteo starts 429ing. Every venue card shows "conditions unavailable." The weatherDown banner fires but users see a broken app, not a maintenance page. **Fix: deploy the VPS. 10 minutes of SSH.**

---

*Report generated: 2026-11-20 14:10 UTC | app.jsx: 14,256 lines / 742 KB | Venues: 404 | Build: 20261031a (20d stale) | VPS: Day 104 undeployed*
