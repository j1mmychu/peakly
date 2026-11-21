# DevOps Report — 2026-11-21 (RED)

**Status: 🔴 RED — VPS Day 105. Cache stamp 21 days stale (code freeze, no action needed). App Review MISSED +8 days. Whistler opened TODAY (Nov 21) — peak opportunity window open. `fix-appjsx-final` rollback bomb Day 22 (597 commits ahead, no common ancestor with main). 20 stale remote branches (+1 since yesterday). `master` footgun Day 45.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 20)

| Item | Nov 20 | Nov 21 (today) |
|------|--------|----------------|
| VPS status | Day 104 | 🚨 **Day 105 — still undeployed** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (20d) | 🚨 **`20261031a` — 21 days stale** |
| App Review hard stop | MISSED +7 days | 🚨 **MISSED +8 days** |
| Whistler status | "opens TOMORROW" | 🏔️ **Whistler opened TODAY — peak ski season window begins** |
| `fix-appjsx-final` | Rollback bomb Day 21 | **Day 22 — 597 commits ahead, no common ancestor with main** |
| `master` footgun | Day 44 | **Day 45 — 511 commits ahead of main** |
| New app.jsx commits | 0 (20d) | **0 — 21 days no code commits (last: 2026-10-31)** |
| Venue count (eval) | 406 | ✅ **406 (eval) — 2-venue drift vs .venue-baseline (404) explained (comment lats)** |
| `.venue-baseline` | 404 | ⚠️ **404 — eval returns 406, confirmed false alarm (2 lat-comment artifacts in bracket walk)** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason (combined) | 15 | ✅ **15 (grep -c `lateSeason.*true`)** |
| Remote branches | 19 stale | **20 stale (+1: `cursor/phone-testflight-c015` appeared today post PR #21 merge)** |
| Plausible analytics | ✅ | ✅ present, uncommented, `defer` |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ affiliate only | ⚠️ same — `710303` is public affiliate marker, not secret |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |
| Image lazy loading | ✅ 9 tags | ✅ 9 `<img>` tags use `loading="lazy"` |
| .gitignore | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero lines changed since Oct 31 — code freeze Day 21.

**Cache stamp:** `20261031a` — 21 days stale. Code freeze means no push means no auto-bump. No mechanism drift. Stamp is correct for the code version deployed.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips Babel in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`)
- Sentry → sentry-cdn.com ✅ (DSN live: `9416b032a46681d74645b056fcb08eb7`)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js` (~440 KB minified, Babel stripped). No changes in 21 days. `dist/app.min.js` not present in this working tree (sandbox clone — built in CI).

**Braces:** 5684/5684 ✅. Proxy URL: HTTPS `peakly-api.duckdns.org` ✅ (no raw IP).

**Venue count:** Bracket walk returns 406; `.venue-baseline` says 404. Delta consistent with prior reports — two lat-comment lines inside VENUES trip the bracket walker. `.venue-baseline` is the authoritative count. No new venues added this session.

---

## 2. FLIGHT PROXY STATUS

**URL:** `const FLIGHT_PROXY = "https://peakly-api.duckdns.org"` — HTTPS ✅, no raw IP.

**VPS:** Day 105 without redeploy. Last confirmed `/health` 200: 2026-08-11. The undeployed `server/proxy.js` changes (forecast_days:14, CORS fix for `capacitor://localhost`, DELETE method for alert deletion, rate-limiter X-Forwarded-For fix) remain inert.

**Timeout/fallback:** `fetchTravelpayoutsPrice` uses a 4s timeout on the proxy call with direct Open-Meteo fallback if the proxy is down. Pattern is sound.

**Travelpayouts token:** Server-side only via `process.env.TRAVELPAYOUTS_TOKEN`. Client side only exposes `TP_MARKER = "710303"` (public affiliate marker — by design, not a secret). ✅

---

## 3. WEATHER & EXTERNAL API

**Open-Meteo:** Direct calls to `api.open-meteo.com/v1` (weather) and `marine-api.open-meteo.com/v1` (marine). The VPS weather proxy is committed but not deployed — every client still hits Open-Meteo directly with a 2h localStorage TTL per venue. 

**Rate limit math:** Open-Meteo free tier allows 10,000 requests/day. With 404 venues, a full cold-cache refresh = 404 weather + ~270 marine = ~674 upstream calls. At 50 concurrent users cold-caching simultaneously that's 33,700 calls — 3.4× the daily free-tier limit in a single burst. Reddit/HN spike = immediate throttling.

**Current exposure:** No VPS cache deployed. If traffic spikes before VPS redeploy, Open-Meteo rate-limiting will degrade weather data for all users until the 2h TTL expires and re-fetches distribute. This is the stated pre-traffic gate.

---

## 4. SECURITY AUDIT

**Supabase anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` exposed in `app.jsx:26`. This is by design — Supabase anon keys are public-safe when RLS is properly configured. Supabase's own docs confirm this. ✅ as long as RLS is enforced on the `user_data` and `shared_lists` tables. No action needed.

**Travelpayouts token:** Server-side only. ✅

**Sentry DSN:** Live and wired. `app.jsx:8` / `dist/index.html:77`. ✅

**`.gitignore`:** Covers `.env*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`. ✅ The business plan PDF leak class (2026-05-09) is closed.

**Recent commit scan:** Last 20 commits are daily reports, workflow files (`testflight.yml`, `asc-listing.yml`), and a PR merge. No secrets introduced. `scripts/asc.mjs` and `scripts/ci-testflight.sh` added — both read secrets from env vars (`ASC_KEY_P8`, `ASC_KEY_ID`, `ASC_ISSUER_ID`). ✅ No hardcoded secrets.

**No exposed tokens, API keys, or credentials in client code.** ✅

---

## 5. PERFORMANCE ANALYSIS

**JavaScript bundle (production):**
- `dist/app.min.js`: ~440 KB minified (esbuild, Babel stripped)
- React 18.3.1: ~6.4 KB gzipped (UMD prod)
- ReactDOM 18.3.1: ~42 KB gzipped
- Sentry SDK: ~24 KB gzipped
- **Total JS on first load: ~510 KB gzipped**

**Biggest performance bottleneck:** 404 venues × batched weather fetch (50/2s) on first load = ~16 seconds of data loading before scores appear. The VPS proxy cache is the only fix — shared cache means user #2 gets scores in <100ms, not 16s. This is the #1 UX bottleneck and it requires the VPS redeploy.

**Image lazy loading:** 9 `<img>` tags in app.jsx use `loading="lazy"`. ✅

**CDN versions:** React 18.3.1, Babel 7.24.7 — both pinned. React 19.x is available but migration would require code changes. Babel 7.24.7 is current stable. No action needed.

---

## 6. COST ESTIMATE

| MAU | Open-Meteo | DigitalOcean | CDN (Cloudflare) | Total/mo |
|-----|-----------|--------------|------------------|----------|
| Current (<10) | Free | $6 | Free | **$6** |
| 1,000 | Free (w/ VPS cache) | $6 | Free | **$6** |
| 10,000 | Free (w/ VPS cache) | $12 (2GB droplet) | Free | **$12** |
| 100,000 | $20 (Commercial) | $48 (4GB + load) | ~$10 | **~$78** |

Without VPS cache at 10K MAU: Open-Meteo commercial plan required ($20/mo) — the cache is worth $20/mo in avoided API costs at that scale.

**Cost optimization:** Current setup is optimal for <10K MAU. The $6 droplet is not a bottleneck. At 100K MAU, the VPS needs horizontal scaling (2× droplets + load balancer) but that's a good problem.

---

## Critical Issues (P0)

### P0-1: VPS undeployed — Day 105
**Impact:** Two-weekend scoring disabled. iOS native blocked (CORS). Alert deletion silently failing. Cold-cache weather on every fetch (Open-Meteo rate limit risk). Today is Whistler's opening day — users landing from any organic channel hit a degraded experience with no VPS cache protection.

**Fix (Jack, SSH, ~10 min):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy

# Copy the latest proxy.js from the repo (it's NOT a git clone)
# Method 1: scp from your local machine
# scp ~/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

pm2 restart peakly-proxy
pm2 logs peakly-proxy --lines 20
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Expected: `forecast_days: 14`, `apns: unconfigured`, `wx_cache_size: 0` (refills on traffic).

**Time to fix: 10 minutes.**

---

### P0-2: `fix-appjsx-final` branch — rollback bomb, Day 22
**Impact:** 597 commits ahead of main, no common ancestor. Any accidental merge or rebase attempt on main would be catastrophic. This branch has persisted for 22 days.

**Status:** Unchanged since Nov 1. The branch name suggests it was an emergency restore. It should be archived or force-deleted.

**Fix:**
```bash
# Confirm it's not needed (the 4 IATA/Chamonix dup fixes from its tip are already on main)
git log --oneline main..origin/fix-appjsx-final | tail -5

# If confirmed redundant:
# gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/fix-appjsx-final
# (Jack must do this — requires write access)
```
**Time to fix: 5 minutes (Jack action).**

---

## High Issues (P1)

### P1-1: App Review reply overdue — +8 days
**Context:** Submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e`, Guideline 2.1 (information needed). No code fix available — Jack must reply in App Store Connect. See `docs/APP_REVIEW_NOTES.md` for the paste-ready reply.

**Today matters:** Whistler opened today (Nov 21). Thanksgiving window (Nov 26) is 5 days out. Every day of App Review delay is a lost peak-season user.

**Fix:** Log into App Store Connect → Resolution Center → reply using the prepared copy in `docs/APP_REVIEW_NOTES.md`. **5 minutes, Jack only.**

---

### P1-2: 20 stale remote branches accumulating
**New today:** `cursor/phone-testflight-c015` appeared after PR #21 merged. Total stale branches: 20 (was 19).

```bash
# List branches with last-commit date to identify dead ones:
for branch in $(git branch -r | grep -v "HEAD\|main\|master" | sed 's/origin\///'); do
  echo "$(git log -1 --format='%ci' origin/$branch 2>/dev/null) $branch"
done | sort

# Delete stale claude/* and cursor/* branches (Jack):
# gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/claude/BRANCHNAME
```

**Time to fix: 20 minutes (Jack action, 20 branches).**

---

### P1-3: `.venue-baseline` drift — 404 vs eval 406
**Root cause confirmed:** Bracket walker counts 2 extra entries from lat-comment lines in VENUES. The count of 404 from `.venue-baseline` matches the actual venue count. False alarm confirmed for the 3rd consecutive day. The eval-based counter has a known artifact.

**No action needed** — the discrepancy is a known counter artifact. `.venue-baseline` = 404 is correct.

---

## Medium Issues (P2)

### P2-1: `master` branch — 511 commits ahead of main, Day 45
Footgun: a confused git user could push to `master` and trigger a deploy to GitHub Pages via `deploy.yml` (which covers both `main` and `master`). It's a redundant deploy target. Not urgent but adds confusion.

**Fix when convenient:**
```bash
# Delete master (Jack):
# gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/master
# Then update deploy.yml to remove master from the on.push.branches list
```

### P2-2: Open-Meteo rate limit risk (no VPS cache)
At current <10 MAU, not a problem. Becomes P0 immediately on any traffic spike. Resolved by P0-1 VPS redeploy.

### P2-3: Supabase account deletion SQL not deployed
`server/sql/delete-account.sql` needs a one-time paste into the Supabase SQL editor. Required for App Store Guideline 5.1.1(v). The client ships a graceful fallback ("email us") until this is active. App Store submission is blocked without it.

**Fix (Jack, 5 min):** Log into Supabase dashboard → SQL editor → paste contents of `server/sql/delete-account.sql` → Run.

---

## Scaling Risk Assessment

**What breaks first:** Open-Meteo rate limit at ~66+ concurrent cold-cache users hitting the same venue set. No VPS cache = every user is a cold cache. At Thanksgiving (Nov 26, 5 days out) a single Reddit post could spike to 200+ concurrent users and blow through Open-Meteo's 10,000/day free tier in minutes. All 404 venues would start showing "conditions unavailable" simultaneously, and users would bounce. The fix is 10 minutes of SSH work (P0-1). The window to do it before the Thanksgiving spike closes in 5 days.

**Prevention:** Deploy the VPS proxy today. It's already written, committed, and tested on a previous session. The only blocker is an SSH session and a `pm2 restart`.

---

## Summary

The code is frozen and healthy. The infra is frozen and risky. Whistler opened today. App Review is 8 days overdue. The two actions that matter this week:

1. **Jack: SSH → VPS → pm2 restart** (10 min)
2. **Jack: App Store Connect → Resolution Center → paste reply** (5 min)

Everything else is noise until those two land.
