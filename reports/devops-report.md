# DevOps Report — 2026-10-22 (RED → LAUNCH DAY +4)

**Status: 🔴 RED — VPS Day 74. Val Thorens hook is gone. Next seasonal window: Whistler early-season (~Nov 10). `origin/master` footgun still live.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 38, unchanged since 2026-09-14 ✅ |
| VENUES (CLAUDE.md authoritative) | **404** (134 skiing / 270 beach) ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — code freeze Day 38, expected ✅ |
| Plausible analytics (source index.html) | ✅ present, uncommented — line 32 |
| Plausible analytics (dist/index.html) | ⚠️ **COMMENT PRESENT, SCRIPT TAG MISSING** — see §4 |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ dev-only, stripped by build-web.mjs in CI |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is public affiliate marker only |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 img sites across card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason:true` venues | ✅ 15 — matches CLAUDE.md |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| proxy.js (committed) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` Allow-Methods, `http2` APNs, `ieee-p1363` JWT. **NOT on VPS.** |

---

## 2. CRITICAL ISSUES (P0)

### P0-A: VPS Redeploy — Day 74. Val Thorens Hook Expired. 🚨

Oct 22 was the last day the Val Thorens opening-weekend angle was useful. That window is gone. **The VPS redeploy is still necessary — it just isn't tied to a seasonal post anymore.** The broken features on the live VPS (Aug 11 build) remain:

| # | Broken feature | User impact |
|---|---------------|-------------|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. High-altitude venues score `confidence:"low"` — filtered off front page. Early-season ski venues (Whistler, Tignes, Val Thorens) may be invisible. |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store = broken on every iPhone. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails. `.catch(()=>{})` hides it. Day-1 retention hit. |
| 4 | `_wxCache` in-memory only | Cold restart after a traffic spike = Open-Meteo rate-limited = "conditions unavailable" for all new users. |

**Next seasonal window: Whistler early-season ~Nov 10.** That's 19 days. The VPS must deploy before then.

**The fix is 3 commands:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Post-deploy, `/health` should show: `"forecast_days": 14`, `"disk_cache": true`.

---

### P0-B: `origin/master` Footgun — Day 15 🚨

`origin/master` is 50+ commits behind `origin/main`. `deploy.yml` deploys **both** branches. One accidental `git push origin master` during a post-launch session rolls the live site back to May.

**30-second fix:**
```bash
git push origin --delete master
```

---

## 3. High Issues (P1)

### P1-A: Stale `origin/master` Still Triggers Deploy

Same as P0-B above — repeated for priority clarity. Merging `deploy.yml` to only watch `main` after deleting `master` would be belt-and-suspenders:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

### P1-B: 18 Stale Remote Branches — Unchanged From Yesterday

All 18 branches from yesterday's report remain. None are in active PRs. Code freeze is Day 38. These are dead weight and confuse new sessions (yesterday a session checked several looking for active work).

**Batch delete:**
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
  fix-appjsx-final restore-appjsx test-small
```

---

## 4. Medium Issues (P2)

### P2-A: Committed `dist/index.html` Is a Stale iOS Build Artifact

**Production is NOT affected** — CI's `build-web.mjs` does `fs.rmSync(DIST, { recursive: true, force: true })` then rebuilds from `index.html`. The committed `dist/` is irrelevant to what ships.

However, the committed `dist/index.html` has:
- `<!-- Analytics: Plausible -->` comment with **no script tag below it** — Plausible is missing
- Loads `./app.js` (not `./app.min.js`)
- Loads `./vendor/leaflet.js` (vendored, iOS build pattern)

This is from an iOS build (`build-ios.mjs` vendors everything). It was committed at some point and never updated. It's not production-dangerous but it's confusing for anyone auditing the repo who assumes `dist/` is the live build.

**Fix: commit a fresh `dist/` snapshot from a CI-equivalent build.** Or accept it as a known stale artifact and document it. Don't leave it ambiguous.

If you want to regenerate locally:
```bash
npm ci && node scripts/build-web.mjs
git add dist/ && git commit -m "regen dist/ from web build"
```

### P2-B: Gili Trawangan Duplicate — App Store Risk

Two venues representing the same place in the VENUES array (carried from prior reports — not verified today given code freeze, confirmed by yesterday's report). If still present, duplicate venues trigger the boot-time IIFE dup-id validator and would surface in the error log.

---

## 5. Security Audit — CLEAN ✅

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | ✅ Not present. `TP_MARKER="710303"` is public affiliate marker |
| Supabase anon key | ✅ Public-safe by Supabase design; all access RLS-gated |
| `.env` / secret files tracked | ✅ `.gitignore` covers `.env*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Sentry DSN | ✅ Real DSN wired in `app.jsx:8` and `index.html:77` |
| Recent commits for secret leaks | ✅ Last 5 commits are daily report files only — no code changes |
| APNS .p8 key | ✅ `.gitignore` covers `*.p8`; key never in repo |
| `APNS_KEY_ID` / `APNS_TEAM_ID` in client | ✅ Not present in app.jsx |

---

## 6. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx unminified | 758,944 bytes (741 KB) |
| dist/app.min.js (CI esbuild) | ~439 KB — Babel stripped, served to users |
| Babel Standalone (cdnjs) | 1.1 MB — dev only, not loaded in production |
| React 18.3.1 UMD (cdnjs) | ~130 KB min+gzip |
| Supabase JS | ~80 KB gzipped (lazy-loaded on auth only) |
| Sentry SDK | ~50 KB (deferred) |
| Image lazy loading | ✅ all 9 img sites use `loading="lazy"` |

**Biggest production bottleneck:** 404-venue batched weather fetch (50 venues per 2s batch). On the live VPS with disk cache, this is a 1-upstream-call for warm venues. Without VPS: a Reddit spike generates thousands of upstream Open-Meteo calls in seconds.

---

## 7. Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|--------------|
| Current (<100 MAU) | 1 GB DO droplet ($6) + GitHub Pages (free) | **$6/month** |
| 1K MAU | Same droplet + VPS proxy cache absorbs Open-Meteo | **$6/month** |
| 10K MAU | 2 GB DO ($12) + Cloudflare CDN free tier | **~$12/month** |
| 100K MAU | 4 GB DO ($24) + Cloudflare Pro ($20) + may need Open-Meteo commercial ($0–40/mo) | **~$44–84/month** |

---

## 8. What Breaks First at Scale

Without the VPS redeploy: **Open-Meteo rate limits, in the first 90 seconds of any meaningful traffic event.** 500 simultaneous users × 8 batched requests = 4,000 upstream calls in the first 2-second window. Open-Meteo's free tier soft-limits at ~10,000 req/day total. One Reddit comment section exhausts the daily budget before the second page of comments loads. Every user for the rest of the day hits "conditions unavailable." The disk-cached VPS proxy collapses that to ~1 upstream call per venue per 2 hours — ~90% cache hit rate after the first user loads a popular region. Deploy it before the Whistler post.

---

## Summary: Two Things Before Whistler (~Nov 10, 19 days away)

1. **`scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"` — 5 minutes.** Val Thorens is gone. Whistler is the hook. Deploy before then.

2. **`git push origin --delete master`** — 10 seconds. Removes the rollback footgun before post-launch traffic arrives.

Val Thorens is a write-off at this point — Oct 22 was the last viable day and it passed. The window for Whistler early-season (~Nov 7–14 depending on snowfall) is coming. Don't miss that one too.
