# DevOps Report — 2026-10-19 (RED → LAUNCH DAY +1)

**Status: 🔴 RED — VPS Day 71. Launch was yesterday. r/travel post is gated on a VPS that still hasn't been redeployed. Two-weekend scoring, iOS CORS, alert deletion, and cache persistence all broken on live infra.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 35, unchanged since 2026-09-14 ✅ |
| VENUES (eval-counted) | **406** (note: CLAUDE.md says 404 — 2 venues added since last sync) ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — 35-day code freeze, expected ✅ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ in `index.html:88` |
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
| BASE_PRICES airport coverage | ✅ **186 airports defined, 152 distinct APs in VENUES — 100% coverage** — Open #22 CLOSED |
| proxy.js (committed) | ✅ `forecast_days=14`, disk cache, `capacitor://localhost` CORS, `DELETE` in Allow-Methods, `http2` APNs, `ieee-p1363` JWT. **NOT on VPS.** |
| Open-Meteo `forecast_days` (client) | ✅ 14 weather / 10 marine |

---

## 2. CRITICAL ISSUES (P0)

### P0-A: VPS Redeploy — Day 71 🚨

**The r/travel post is gated on this. Yesterday was the stated launch date. Every day of delay = wasted seasonal momentum. Val Thorens "opening weekend" hook has a shelf life measured in days, not weeks.**

Broken right now on the live VPS (still running the August 11 build):

| # | Broken feature | User impact |
|---|---------------|-------------|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. Front page shows only one Fri–Mon window. High-altitude venues show `confidence: "low"` and get filtered out. Core product promise broken. |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store launch = broken iOS. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails on every device. `.catch(()=>{})` in client hides it. Day-1 user retention hit. |
| 4 | `_wxCache` in-memory only (Open #23) | `pm2 restart` (required for the redeploy) wipes cache. r/travel spike + cold cache = Open-Meteo rate-throttled in ~5 minutes. Every arriving user sees "conditions unavailable." This is the apocalypse scenario. |

**The fix is on disk, committed, tested. It's a 3-command deploy:**

```bash
# SSH to VPS: ssh root@198.199.80.21
scp -r server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
# Then on VPS:
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected health output post-deploy: `"forecast_days": 14`, `"disk_cache": true`, `apns:configured` (if .p8 is present).

---

## 3. HIGH ISSUES (P1)

### P1-A: SW PRECACHE / CDN Mismatch — Day 15 🟡

`sw.js` caches **the wrong Babel binary**:

```javascript
// sw.js:3 — what the SW actually pre-caches:
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"  // ← unpkg, v7.29.7
];

// index.html:88 — what the page actually loads:
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js">
//                    ^^^ cdnjs, v7.24.7
```

Different CDN. Different version. The pre-cached asset is never loaded; the loaded asset is never cached. The SW wastes bandwidth pre-caching a Babel version that doesn't serve the page, and users get zero offline benefit for the largest dependency. Effective Babel cache hit rate: 0%.

**Fix: align PRECACHE to match index.html exactly (2-minute fix):**

```javascript
// sw.js — replace the PRECACHE block:
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

Estimated time: 2 minutes. Can ship after the code freeze lifts (don't break the freeze for this alone).

### P1-B: `origin/master` footgun — Day 13 🟡

`origin/master` is 511 commits behind `origin/main` (pre-history-scrub state from May 2026). The `deploy.yml` deploys **both** `main` **and** `master`. A push to `master` right now would deploy June 2026 code to the live site — missing 5 months of features, fixes, and the entire venue catalog expansion.

**Fix: delete the branch, or force-update it to match main:**

```bash
# Option A — delete master (cleanest):
git push origin --delete master

# Option B — update master to match main (if deploy.yml needs both):
git push origin main:master --force-with-lease
```

Option A is correct unless there's a specific reason deploy.yml needs master. Recommend deleting.

---

## 4. MEDIUM ISSUES (P2)

### P2-A: 15+ Stale `claude/*` Branches on Origin

Observed since the last fetch:
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
+ fix-appjsx-final, restore-appjsx, test-small
```

These are orphaned cloud-agent worktrees. None are likely current — the code freeze has been in place for 35 days. They bloat the remote ref namespace and create confusion.

**Fix:**
```bash
git fetch --prune  # marks deleted remotes locally
# Then review which are safe to delete (all of the above appear abandoned):
git push origin --delete claude/analyze-test-coverage-WVIsT claude/code-review-cleanup-HjoCS claude/condense-alert-page-jzdLo claude/enhance-loading-screen-rZ1dc claude/fix-app-jsx-content claude/implement-todo-lNL7W claude/improve-peakly-ui-UHCHG claude/improve-scoring-system-XYGY6 claude/product-reliability-assessment-w0poL claude/redesign-front-page-EndKs claude/review-peakly-ux-UQ0Qu claude/simplify-alerts-page-2ejGB claude/simplify-profile-page-Bi2Tc claude/standardize-venue-data-CufiQ claude/streamline-onboarding-account-97XRR fix-appjsx-final restore-appjsx test-small
```

### P2-B: VENUES Count Discrepancy (CLAUDE.md vs. Eval)

Node eval of VENUES array: **406**. CLAUDE.md states 404. Two venues were added after the last CLAUDE.md sync. Not a product bug — just a stale doc count. Update CLAUDE.md after the code freeze lifts.

---

## 5. Security Audit — CLEAN ✅

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | ✅ Not present. `TP_MARKER="710303"` is public affiliate marker, expected |
| Supabase anon key | ✅ `SUPABASE_ANON_KEY` in app.jsx is the anon/public key — by Supabase design, this is client-safe. All data access is RLS-gated. This is not a leak. |
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
| dist/app.min.js (esbuild) | ~439 KB (per CLAUDE.md) — Babel stripped, served from GitHub Pages |
| Babel Standalone (cdnjs) | 1.1 MB minified — **single largest dependency** |
| React 18.3.1 UMD | ~130 KB min+gzip |
| Supabase JS | ~80 KB gzipped (lazy-loaded only on auth) |
| Sentry SDK | ~50 KB (deferred) |
| Image lazy loading | ✅ all 9 card image sites use `loading="lazy"` |

**Biggest performance bottleneck:** Babel Standalone at 1.1 MB. On mobile networks this alone adds 600ms-2s parse time on first load. **This only affects the dev `index.html` path** — the production `dist/index.html` (served by GitHub Pages via `deploy.yml`) uses the pre-compiled esbuild output and loads zero Babel. For reviewers hitting the GitHub Pages URL: fast. For anyone opening `index.html` locally: slow. No action needed unless local dev speed is a priority.

---

## 7. Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|--------------|
| Current (<100 MAU) | 1 GB DO droplet ($6) + GitHub Pages (free) | **$6/month** |
| 1K MAU | Same droplet + Open-Meteo free tier sufficient | **$6/month** |
| 10K MAU | Upgrade to 2 GB DO ($12) + Cloudflare CDN (free tier) + Open-Meteo still free (~16 rps peak, well under 10K/min free limit with VPS cache) | **~$12/month** |
| 100K MAU | 4 GB DO ($24) + Cloudflare Pro ($20) + consider Open-Meteo commercial if cache misses spike | **~$44/month** |

No cost optimization gaps at current scale. The in-memory + disk cache on the VPS (once deployed) makes the 10K MAU case viable at $12/month.

---

## 8. What Breaks First at Scale

**Without the VPS redeploy, the answer is Open-Meteo.** The free tier has no documented hard limit but Peakly's usage pattern (404 venues × batch of 50 every 2 hours from each user session) means ~8,000 API calls per hour at 1K concurrent sessions. With the VPS proxy's shared in-memory cache, that collapses to effectively 0 upstream calls for warm venues. Without it, a single r/travel post with 500 simultaneous clicks sends 500 × 50 = 25,000 Open-Meteo requests in the first minute. That's instant rate-throttling and "conditions unavailable" for every arriving user. The fix is already committed and sitting on disk — it just needs to be on the VPS. Deploy it. Today.

---

## Summary Action List

| Priority | Item | Who | Time |
|----------|------|-----|------|
| **P0** | VPS redeploy (`scp proxy.js` + `pm2 restart`) | Jack (SSH) | 5 min |
| **P1** | Delete `origin/master` | Jack | 1 min |
| **P1** | Fix SW PRECACHE CDN/version mismatch | After code freeze lifts | 2 min |
| **P2** | Delete 18 stale `claude/*` / `fix-*` / `test-*` branches | Jack | 2 min |
| **P2** | Update CLAUDE.md venue count 404→406 | Next session | 1 min |
