# DevOps Report — 2026-09-20 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 42. Sep 20 hard deadline is TODAY — not tomorrow, today. Every hour it stays undeployed is a violated commitment. Two-weekend scoring is dead, iOS native proxying is blocked, alert deletion silently fails. No code regressions. Cache stamp `20260914a` correct (code freeze, 6 days old). Braces balanced 5682/5682. VENUES 404 (134 ski / 270 beach). 18 stale remote branches — decision deadline also TODAY per PM v155.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block, 403 from agent proxy). Proxy analysis from committed source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## What Changed Since Yesterday (Sep 19)

No code commits to `app.jsx`, `sw.js`, or `index.html`. Three report commits only (PM v155, Content Sep 19, DevOps Sep 19). `git fetch` pulled 15 new stale remote branches (all `claude/` exploratory + `fix-appjsx-final`, `restore-appjsx`, `test-small`) — same discovery as yesterday, no action taken.

**VPS deadline: TODAY. The Sep 20 EOD commitment from PM v154/v155 expires in hours, not days.**

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI/dist/) | ~439 KB minified (esbuild, Babel stripped) | ✅ |
| Cache stamp | `20260914a` — 6 days old, CORRECT for code freeze | ✅ |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ |
| Brace balance | 5682 open / 5682 close — BALANCED | ✅ |
| VENUES | 404 (134 skiing / 270 beach) — confirmed via id: count | ✅ |
| `lateSeason: true` | 15 venues | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| React version | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Sentry DSN | Set — `9416b032...` in app.jsx (intentional, client-side monitoring) | ✅ |
| Images lazy-loaded | Yes — all `<img>` carry `loading="lazy"` | ✅ |

---

## 2. P0 — VPS Redeploy: TODAY IS THE DEADLINE

**This is Day 42 undeployed. PM v154 set Sep 20 EOD as the hard deadline. That is today.**

**What's broken until you SSH in:**
- `forecast_days=7` on VPS → two-weekend scoring silently disabled (client scores second weekend as "low confidence / beyond forecast window" because VPS hands it 7-day data)
- `capacitor://localhost` missing from CORS → iOS native app gets 403 on every proxy call
- `DELETE` missing from `Access-Control-Allow-Methods` → alert deletion preflight blocked, client `.catch(()=>{})` hides it, users can't delete alerts
- `_wxCache` was in-memory only — **this is now fixed in committed `proxy.js`** (disk persistence via `WX_CACHE_FILE` + `loadDiskCache`/`saveDiskCache`) — but only on the running VPS after redeploy
- Rate limiter XFF fixed in committed code (`.pop()` not `[0]`) — also inert until deploy

**Exact commands. Copy-paste. Run now:**

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# NOT a git clone — copy the file manually:
exit
```

From your local machine (or any machine with the repo):
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health"
```

**Verify after (expected output):**
```json
{
  "status": "ok",
  "uptime_s": < 30,
  "wx_cache_size": 0,
  "wx_cache_file": "...",
  "apns": "configured",
  "forecast_days_weather": 14,
  "forecast_days_marine": 10
}
```

If `wx_cache_size` is 0 after a few minutes of traffic, the disk load is working. If `apns` shows `unconfigured`, that's Open #21 — separate from this redeploy.

**Estimated time to fix: 5 minutes of SSH + copy.** There is no code to write.

---

## 3. P1 — Stale Remote Branches: 18 Branches, Decision TODAY

**New since Sep 19 fetch** — 18 unmerged remote branches sitting on origin:

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

This is the same pattern that hit 86 worktrees on May 9 — abandoned exploratory branches rotting on origin. PM v155 mandated a decision today (merge or delete). My recommendation: **delete all 18 unmerged**. They're exploratory, none touched main. The three non-claude branches (`fix-appjsx-final`, `restore-appjsx`, `test-small`) suggest a previous hotfix attempt — check them briefly but they predate the current code freeze and are almost certainly stale.

**Delete command (run from your local machine):**
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
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

If you want to review any of them first:
```bash
git log --oneline origin/fix-appjsx-final ^main | head -5
git log --oneline origin/restore-appjsx ^main | head -5
```

**Estimated time: 2 minutes.**

---

## 4. P2 — Minor Inconsistency: Waitlist XFF Logging

Rate limiter at `server/proxy.js:59` correctly uses `.pop().trim()` (last XFF entry — forge-resistant). But the waitlist endpoint at `proxy.js:921` logs the first XFF entry (`[0]`) for record-keeping. Not a rate-limit vector, but if you ever cross-reference IPs it'll be wrong behind a load balancer.

**Fix (1-line):**
```diff
- ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress,
+ ip: req.headers['x-forwarded-for']?.split(',').pop()?.trim() || req.socket.remoteAddress,
```
File: `server/proxy.js` line 921. Bundle with next VPS copy.

**Estimated time: 30 seconds.**

---

## 5. Security Audit — ✅ CLEAN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present — `TP_MARKER=710303` is a tracking marker (public), actual `TOKEN` is server-side env only |
| Supabase anon key in client | ✅ Intentional — public-safe per documented design, RLS-gated |
| Sentry DSN in client | ✅ Intentional — client-side error monitoring, standard practice |
| `.env` files tracked | ✅ `.gitignore` covers `.env`, `.env.*`, `.pem`, `.key`, `.p8`, `.p12` |
| Recent commits with secrets | ✅ Last 10 commits are report-only — no code changes |
| Proxy token server-side | ✅ `process.env.TRAVELPAYOUTS_TOKEN` — exits process if missing |

---

## 6. Performance Analysis

| Item | Value | Status |
|------|-------|--------|
| Source `app.jsx` | 759 KB | Expected for single-file SPA |
| Production bundle (`dist/app.min.js`) | ~439 KB minified (built by CI, esbuild) | ✅ Good |
| Babel Standalone load | Eliminated in production (esbuild pre-compiles) | ✅ |
| CDN deps | React 18.3.1 + ReactDOM 18.3.1 (cdnjs), Babel 7.24.7 (cdnjs) | ✅ Pinned |
| Image lazy loading | All `<img>` in cards use `loading="lazy"` | ✅ |
| Open-Meteo batching | 50 venues per 2s batch, 2hr localStorage cache | ✅ |

**Single largest performance bottleneck:** The 759 KB `app.jsx` source is compiled to ~439 KB by esbuild for production, which is acceptable. The real bottleneck is Open-Meteo: 404 venues × ~2 API calls (weather + marine for beach) = up to ~800 upstream calls on a cold cache. The VPS proxy's in-memory cache + in-flight dedupe handles this at scale, but **only after the proxy.js redeploy** (the disk persistence fix means a pm2 restart no longer cold-resets it).

---

## 7. Cost Projection

| MAU Tier | Monthly Cost | Breakdown |
|----------|-------------|-----------|
| Current (<100) | ~$6/mo | DigitalOcean 1GB droplet |
| 1K MAU | ~$6–12/mo | Same droplet; Open-Meteo free tier holds (needs monitoring) |
| 10K MAU | ~$30–50/mo | Droplet upgrade to 2GB ($12) + potential Open-Meteo commercial tier ($39/mo) |
| 100K MAU | ~$200–400/mo | 4GB droplet ($24) + Open-Meteo commercial ($39) + CDN ($50–100) + monitoring ($30+) |

**Optimization opportunities:**
- Open-Meteo free tier: 10K calls/day. At 10K MAU with ~2 venues/user cold-cached → approaches ceiling. VPS proxy cache is the prevention — redeploy it.
- GitHub Pages CDN: free forever. No action needed.
- DigitalOcean droplet: $6/mo is optimal for current load. Don't upgrade until MAU > 500.

---

## 8. What Breaks First at Scale

**Open-Meteo rate ceiling is the single failure mode that will take the app down.** At ~66 concurrent users on the same uncached venue set, direct Open-Meteo calls from clients will start returning 429s. The VPS proxy with in-memory cache + in-flight dedupe solves this — it already exists in committed `proxy.js` — but it's not deployed. A Reddit or HN spike at current state (VPS undeployed) means every user hits Open-Meteo directly, the cache fills zero times, and the app degrades to "conditions unavailable" banners across the board. The disk persistence fix (also in committed proxy.js) means even a pm2 restart post-spike won't reset the cache. **Deploy the proxy. Today.**

---

## Summary

| Priority | Issue | Time to Fix | Status |
|----------|-------|-------------|--------|
| 🔴 P0 | VPS proxy.js undeployed — Day 42, deadline TODAY | 5 min SSH + scp | **DO NOW** |
| 🟡 P1 | 18 stale remote branches — decision TODAY | 2 min | Delete |
| 🟢 P2 | Waitlist XFF logging uses `[0]` instead of `.pop()` | 30 sec | Bundle with VPS copy |
| ✅ — | All code health checks | — | Clean |
