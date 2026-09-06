# DevOps Report — 2026-09-06 (YELLOW)

**Status: 🟡 YELLOW — Code is healthy. Same three VPS debt items (Open #19/#21/#23) are now Day 44. 18 zombie branches unchanged. No new code P0s.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block, 403 from proxy). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification; do not re-flag as down based on sandbox results.

---

## What Changed Since Yesterday

- **No app.jsx changes.** Last commit touching app.jsx: `9c2c198` (Sept 4 — PM v140, 10 venues, cache `20260904a`). Sept 5 commits were reports only (PM v141, Content, DevOps report files). Cache buster is **not stale** — it accurately reflects the last day code changed.
- **Venue count**: Yesterday's DevOps report said 407 by eval. Content 09-05 says "count discrepancy resolved (405)" and added 5 more venues (RHO/GIG/SCL/OOL/PPT) — but those were in Content's report file, not necessarily committed to app.jsx. Git log shows no app.jsx commit on Sept 5. Count stays at **~405** pending next eval-verified commit. Mixed-format VENUES array prevents reliable grep counting — always use eval or `scripts/status.sh`.
- **Zombie branches**: 18 total, unchanged. No new branches spawned overnight.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,148** |
| app.jsx bytes | **757,075** (~740 KB unminified; **495 KB minified** at deploy) |
| Cache buster | `20260904a` — ✅ current (no app.jsx changes since Sept 4) |
| Plausible analytics | ✅ Present and active (`j1mmychu.github.io/peakly`) |
| Sentry | ✅ DSN active (`9416b032a46681d74645b056fcb08eb7` — real project key, error monitoring live) |
| React CDN | ✅ 18.3.1 from `cdnjs.cloudflare.com` (latest LTS) |
| Babel CDN | ✅ 7.24.7 from `cdnjs.cloudflare.com` (dev only — stripped in prod by esbuild) |
| Production build | ✅ `deploy.yml` pre-compiles app.jsx → `dist/app.min.js` via esbuild, Babel eliminated from prod load path |
| Lazy loading | ✅ 9/9 `<img>` tags include `loading="lazy"` |

**Sentry was a P2 item in earlier reports. It's now configured and active — stop flagging it.**

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old IP ref (104.131.82.242) | ✅ Not present anywhere in client code |
| Timeout | ✅ 4s `AbortController` on all fetch calls |
| Fallback | ✅ Null return → client renders `~$X` estimate from `BASE_PRICES`, never blank |
| Concurrency semaphore | ✅ 8 concurrent max (raised from 3 on 2026-08-21) |

Proxy client code is clean. **Deployed proxy state: unverified from sandbox. Last confirmed healthy 2026-08-11.** The code fixes in `server/proxy.js` (Open #19: `forecast_days:14`, disk cache, CORS/rate-limiter fixes) are committed to the repo but not yet running on the VPS.

---

## 3. Security Audit — CLEAN

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | ✅ **Absent.** Token is server-side only (VPS). `TP_MARKER=710303` in client is the *affiliate marker* — designed to be public, earns commissions via deep links. Not a secret. |
| Supabase anon key in client | ✅ **Expected.** `SUPABASE_ANON_KEY` is a public-safe JWT designed to be in client code. RLS policies gate all data access. Standard Supabase architecture. |
| Sentry DSN in client | ✅ **Expected.** Public by design — Sentry DSNs are in every browser app. |
| `.gitignore` coverage | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision`, `*.p12` |
| Git log secret scan | ✅ No credentials introduced in recent commits. Last 10 commits are report files only. |
| `.env` files in repo | ✅ None present. |

**No security issues. This section is clean.**

---

## 4. Open-Meteo Rate Limit — P0 (Carry-Over, Day 44)

**Still the single most dangerous unfixed item. Math is unchanged:**

- ~405 venues × ~1.65 avg API calls (weather always + marine for beach ~65%) = **~668 cold calls per user session**
- Free tier: **10,000 calls/day**
- Break-even: **~14.9 concurrent cold sessions**
- 500 first-time Reddit visitors in an hour = **334,000 upstream calls in 60 minutes**. Peakly gets rate-limited ~90 seconds after the post lands.

**The fix is the VPS proxy shared cache (Open #19) — already written, committed, not deployed.** With 4,000-entry LRU, N simultaneous users on the same venue = 1 upstream call. This takes the Reddit-spike scenario from "fatal in 90 seconds" to "handled."

**Jack: this is 30 minutes of SSH work. It's been 44 days. This blocks the Reddit post.**

```bash
# On your machine with SSH access:
ssh root@198.199.80.21
cd /opt/peakly-proxy
# Copy the updated proxy.js (NOT a git repo — manual copy required)
# Then:
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health  # verify uptime resets, apns status shows
```

---

## 5. VPS Open Items — P1 (Carry-Over, Day 44)

Three committed-but-undeployed fixes in `server/proxy.js`. All require the same SSH session:

| Item | What's broken | Fix status |
|------|--------------|------------|
| Open #19 | `forecast_days:7` → two-weekend scoring disabled; iOS CORS blocked; alert DELETE preflight blocked; rate-limiter takes `X-Forwarded-For[0]` (forgeable) | **Code done, not deployed** |
| Open #21 | APNs: DER-vs-P1363 JWT + HTTP/1.1 `fetch` against HTTP/2-only API = zero pushes ever delivered. Alert IDs guessable (`Date.now()` — fixed in app.jsx via `crypto.randomUUID()`, needs corresponding VPS deploy) | **Code done, not deployed** |
| Open #23 | `_wxCache` in-memory only — a `pm2 restart` (required by #19 deploy) wipes it. Cold-cache + traffic spike = Open-Meteo rate-limit exposure in the deploy window | **Code done, not deployed** |

Bundle all three in a single SSH session. The order matters: copy proxy.js → `npm install` (if deps changed) → `pm2 restart` → verify `/health`.

---

## 6. Performance Analysis

| Metric | Value |
|--------|-------|
| Production JS bundle | **495 KB** (app.min.js — esbuild minified) |
| React + ReactDOM CDN | ~45 KB gzipped combined (cdnjs, cached by browser) |
| Babel (prod) | **0 KB** — eliminated by build pipeline ✅ |
| Total first-load JS (cold) | ~540 KB transferred — acceptable for a PWA |

**Largest bottleneck:** 405-venue weather fetch on cold load. Even with 50-concurrent batch logic and 2hr localStorage cache, a brand-new user triggers ~668 upstream HTTP calls. The fetch is fire-and-forget (UI renders immediately with estimates), but the API call volume is the exposure. VPS proxy cache (Open #19) is the fix.

**BASE_PRICES coverage: 181 airport entries** — this is a major improvement from the 100/146 missing baseline called out in July. Deal badges now show immediately for most venue routes. No action needed here beyond maintaining as new venues are added.

---

## 7. Zombie Branches — P2 (Day 12+)

18 stale remote branches. 15 are `claude/*` experiment branches, plus `fix-appjsx-final`, `restore-appjsx`, and `master`.

```bash
# Jack or a maintainer with push access runs this once — deletes all stale claude/ branches:
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
  restore-appjsx

# Do NOT delete 'master' — deploy.yml triggers on both main and master
```

5 minutes to clean this up. Every new `git fetch` pulls 18 stale refs. Not urgent, just noise.

---

## 8. Cost Estimate

| Tier | MAU | Infrastructure |
|------|-----|----------------|
| Current | <100 | $6/mo (DO droplet) + $0 GitHub Pages |
| 1K MAU | 1K | $6/mo DO + possible Open-Meteo upgrade |
| 10K MAU | 10K | $12/mo DO (bump to 2GB) + **$20/mo Open-Meteo API** (free tier exhausted above ~14 DAU cold) |
| 100K MAU | 100K | $48/mo DO (4GB + block storage) + $60/mo Open-Meteo + CDN costs |

**Biggest cost cliff:** Open-Meteo free tier breaks at ~15 concurrent cold DAU. At 1K MAU the free tier becomes a daily struggle without the VPS proxy cache. Budget $20/mo Open-Meteo at that scale — or deploy the cache and stay free longer.

**Supabase:** Free tier covers ~500 MAU (500MB DB, 2GB transfer/mo). At 1K MAU, plan for $25/mo Pro tier.

---

## 9. What Breaks First at Scale

**The first thing that dies when Peakly gets a Reddit post is Open-Meteo rate limiting, within 90 seconds of traffic landing.** 500 simultaneous cold users × 668 calls each = 334K calls against a 10K/day free tier. Every user after the first ~14 concurrent sessions gets a weather failure banner. The app still renders (venues show with score=50, estimate fares), but the headline feature — live conditions — is dead. This tanks conversion and makes the post look like a broken demo.

**Prevention:** Deploy Open #19's VPS proxy cache. One SSH session. 30 minutes. The shared in-memory LRU means 500 simultaneous users on the same venue = 1 upstream call instead of 500. The Reddit spike becomes survivable without any paid tier upgrade.

**Second to break:** Supabase sync collisions. Multiple users signing in simultaneously against a single `user_data` table row with last-writer-wins conflict resolution will produce data loss at scale. Not a launch blocker at <100 MAU but plan for it at 1K.

---

## Priority Summary

| # | Item | Priority | ETA |
|---|------|----------|-----|
| Open #19/#23 | VPS proxy.js deploy: shared wx cache + `forecast_days:14` + CORS + rate-limiter fix | **P0 — pre-Reddit gate** | 30 min, SSH |
| Open #21 | APNs HTTP/2 + JWT P1363 fix deploy | **P1** | Same SSH session |
| Zombie branches | Delete 17 stale `claude/*` + experiment branches | **P2** | 5 min |
| Supabase SQL | Paste `server/sql/delete-account.sql` into Supabase editor | **P2** | 2 min (App Store 5.1.1(v)) |
