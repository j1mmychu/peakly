# DevOps Report — 2026-10-20 (RED → LAUNCH DAY +2)

**Status: 🔴 RED — VPS Day 72. You launched. The r/travel post hasn't gone up. The Val Thorens opening-weekend hook expires in 2 days (Oct 22–23). Every hour of delay is wasted momentum on a seasonal window that doesn't reopen.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 36, unchanged since 2026-09-14 ✅ |
| VENUES (eval-counted today) | **404** (134 skiing / 270 beach) — matches CLAUDE.md. Yesterday's report of 406 was wrong. ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — 36-day code freeze, expected ✅ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ `index.html:88` |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS confirmed |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 sites across card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController at app.jsx:6381 |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason:true` venues | ✅ **15** — matches CLAUDE.md |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES coverage | ✅ Open #22 CLOSED — 186 airports defined, full coverage |
| proxy.js (committed) | ✅ `forecast_days=14`, disk cache, `capacitor://localhost` CORS, `DELETE` in Allow-Methods, `http2` APNs, `ieee-p1363` JWT. **NOT on VPS.** |
| Open-Meteo `forecast_days` (client) | ✅ 14 weather / 10 marine |

---

## 2. CRITICAL ISSUES (P0)

### P0-A: VPS Redeploy — Day 72 🚨 CLOCK IS RUNNING OUT

**The Val Thorens opening-weekend hook expires Oct 22–23. That's 2 days. After that the r/travel post is generic, not a moment.**

Broken right now on the live VPS (still running the August 11 build):

| # | Broken feature | User impact |
|---|---------------|-------------|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. Front page shows only one Fri–Mon window. High-altitude venues filter out at `confidence: "low"`. Core product promise broken. |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store launch = broken iOS. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails on every device. `.catch(()=>{})` hides it. Day-1 retention hit. |
| 4 | `_wxCache` in-memory only (Open #23) | `pm2 restart` wipes cache. r/travel spike + cold cache = Open-Meteo rate-throttled in ~5 minutes. Every arriving user sees "conditions unavailable." Apocalypse scenario. |

**The fix is committed and on disk. 3 commands:**

```bash
# From your local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# SSH to VPS:
ssh root@198.199.80.21

# On VPS:
cd /opt/peakly-proxy && pm2 restart peakly-proxy

# Verify immediately after:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected health output post-deploy: `"forecast_days": 14`, `"disk_cache": true`. APNS will show `unconfigured` (known, not a blocker for the r/travel post).

**This is the only thing standing between you and the r/travel post.**
Estimated time: 5 minutes of actual work. Day 72 of delay.

---

## 3. HIGH ISSUES (P1)

### P1-A: SW PRECACHE / CDN Mismatch — Day 16 🟡

`sw.js` pre-caches a Babel binary that the page never loads:

```javascript
// sw.js:3-5 — what the SW actually pre-caches:
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"  // ← unpkg, v7.29.7
];

// index.html:88 — what the page actually loads:
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js">
//                    ^^^ cdnjs, v7.24.7
```

Wrong CDN. Wrong version. The 1.1 MB Babel binary is fetched fresh on every page load — the SW's pre-cache is completely wasted. Effective offline resilience for the largest dependency: 0%.

**Fix (2 minutes, queued for Oct 23+ post-freeze):**
```javascript
// sw.js — replace line 4:
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
```

Note: this only affects the dev-path `index.html`. Production `dist/index.html` (served by GitHub Pages) uses the pre-compiled esbuild output and loads zero Babel — so this is a dev-path correctness fix, not a production-breaking bug.

### P1-B: `origin/master` footgun — Day 14 🟡

`origin/master` is ~511 commits behind `origin/main` (pre-history-scrub state, May 2026). `deploy.yml` deploys **both** `main` and `master`. An accidental push to `master` right now would take the live site back to June 2026 code — missing 5 months of features, 150+ venues, and every security fix.

**Fix: delete it (cleanest option):**
```bash
git push origin --delete master
```

If `deploy.yml` must keep deploying master for some reason, force-update it instead:
```bash
git push origin main:master --force-with-lease
```

Recommend deleting. There is no reason deploy.yml needs master.

---

## 4. MEDIUM ISSUES (P2)

### P2-A: 18 Stale Remote Branches

Post-fetch today, 18 orphaned cloud-agent branches are visible on origin:
```
claude/analyze-test-coverage-WVIsT
claude/code-review-cleanup-HjoCS
claude/condense-alert-page-jzdLo
claude/enhance-loading-screen-rZ1dc
claude/fix-app-jsx-content
claude/implement-todo-lNL7W
claude/improve-peakly-ui-UHCHG
claude/improve-scoring-system-XYGY6
claude/product-reliability-assessment-w0poL
claude/redesign-front-page-EndKs
claude/review-peakly-ux-UQ0Qu
claude/simplify-alerts-page-2ejGB
claude/simplify-profile-page-Bi2Tc
claude/standardize-venue-data-CufiQ
claude/streamline-onboarding-account-97XRR
fix-appjsx-final
restore-appjsx
test-small
```

All are abandoned (code freeze has been in place 36 days). None are in active PRs. Cleanup:
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

### P2-B: VENUES Count Corrected

Today's eval: **404** (134 skiing / 270 beach). CLAUDE.md says 404. Yesterday's report of 406 was wrong — likely a stale eval in that session. This item is **closed**. CLAUDE.md is accurate.

---

## 5. Security Audit — CLEAN ✅

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | ✅ Not present. `TP_MARKER="710303"` is public affiliate marker |
| Supabase anon key | ✅ `SUPABASE_ANON_KEY` is the anon/public key — by Supabase design, client-safe; all access is RLS-gated |
| `.env` / secret files tracked | ✅ `.gitignore` covers `.env*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Sentry DSN | ✅ Real DSN wired in both `app.jsx:8` and `index.html:77` |
| Recent commits for secret leaks | ✅ Last 5 commits are daily report files only — no code changes |
| git history for sensitive data | ✅ History scrub was done 2026-05-09; pre-scrub orphan blobs are github-gc'd |
| APNS .p8 key | ✅ `.gitignore` covers `*.p8`; key is never in repo |

---

## 6. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx unminified | 758,944 bytes (741 KB) |
| dist/app.min.js (esbuild) | ~439 KB — Babel stripped, served in production |
| Babel Standalone (cdnjs) | 1.1 MB — **single largest dependency** |
| React 18.3.1 UMD | ~130 KB min+gzip |
| Supabase JS | ~80 KB gzipped (lazy-loaded only on auth) |
| Sentry SDK | ~50 KB (deferred) |
| Image lazy loading | ✅ all 9 card image sites use `loading="lazy"` |

**Biggest bottleneck:** Babel Standalone at 1.1 MB — but this only affects the `index.html` local dev path. Production (`dist/index.html` via GitHub Pages) uses esbuild-pre-compiled output and ships zero Babel. Users on the live site: fast. Local dev: slow first parse. No action needed for production.

---

## 7. Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|--------------|
| Current (<100 MAU) | 1 GB DO droplet ($6) + GitHub Pages (free) | **$6/month** |
| 1K MAU | Same droplet + Open-Meteo free tier sufficient (VPS cache absorbs spikes) | **$6/month** |
| 10K MAU | 2 GB DO ($12) + Cloudflare CDN free tier + Open-Meteo still free with proxy cache | **~$12/month** |
| 100K MAU | 4 GB DO ($24) + Cloudflare Pro ($20) + Open-Meteo may need commercial tier | **~$44/month** |

No cost optimization gaps at current scale. The in-memory + disk cache on the VPS (once deployed) makes the 10K MAU scenario viable at $12/month.

---

## 8. What Breaks First at Scale

Without the VPS redeploy: **Open-Meteo, immediately**. The free tier has no published hard limit, but Peakly's pattern (404 venues × 50-venue batches per session) means ~8,000 API calls per hour at 1K concurrent sessions. With the VPS proxy's shared in-memory + disk cache that collapses to near-zero upstream calls for warm venues. Without it, a r/travel post with 500 simultaneous new users sends 500 × 50 = 25,000 Open-Meteo requests in the first minute. That's instant rate-throttling and "conditions unavailable" for every arriving user — the worst possible first impression. The fix is committed and on disk. Deploy it.

**The other thing that breaks at scale: the launch window.** Val Thorens "opening weekend" hook expires Oct 22–23. That's 2 days. After that you're posting in a crowded November ski-season thread with no specific hook. The window is closing at the same rate as the VPS redeploy is not happening.

---

## Summary: The Two Things That Need to Happen Today

1. **`scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && ssh root@198.199.80.21 "pm2 restart peakly-proxy"`** — 5 minutes. Unblocks r/travel post, fixes two-weekend scoring, iOS CORS, alert deletion, and Open-Meteo cache.
2. **Post r/travel.** Tonight if VPS ships today. Tomorrow morning if it slips. After Oct 22: no hook.

Everything else is queued for post-freeze (Oct 23+): PRECACHE fix, stale branch cleanup, CLAUDE.md sync.
