# DevOps Report — 2026-09-19 (YELLOW → ORANGE)

**Status: 🟠 ORANGE — VPS proxy.js undeployed Day 41. Sep 20 hard deadline is TOMORROW. 18 stale remote branches detected (new finding — branch proliferation risk, same class as May 9). No code regressions. Cache stamp `20260914a` correct (code freeze, 5 days old). Braces balanced 5682/5682. BASE_PRICES 100% covered (0 gaps). VENUES 404 (134 ski / 270 beach).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## What Changed Since Yesterday (Sep 18)

No code commits to `app.jsx`, `sw.js`, or `index.html`. Three report commits only (PM v154, Content Sep 18, DevOps Sep 18).

**VPS countdown: 2 days → 1 day. Deadline is TOMORROW, Sep 20 EOD.**

**New finding this run**: `git fetch` pulled 18 remote branches that weren't in yesterday's refs — 15 `claude/` exploratory branches plus `fix-appjsx-final`, `restore-appjsx`, `test-small`. None merged to main. Code freeze holds. But this is the same branch-accumulation pattern that hit 86 worktrees on May 9. Worth pruning before they multiply.

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ Normal |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI) | ~439 KB minified via esbuild, Babel stripped | ✅ |
| Cache stamp | `20260914a` (Sep 14 — 5 days stale, CORRECT for code freeze) | ✅ CURRENT |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ LOCKED |
| Brace balance | 5682 open / 5682 close — BALANCED | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| React version | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs, dev only — stripped in prod build via esbuild) | ✅ |
| Sentry DSN | Wired — `9416b032...` in `app.jsx:8` and `index.html:77` | ✅ |
| Image lazy loading | `loading="lazy"` at all 9 `<img>` render sites | ✅ |
| VENUES count | 404 (134 ski + 270 beach) — matches CLAUDE.md | ✅ |
| `lateSeason:true` count | 15 venues (grep-combined: `lateSeason:true` + `lateSeason: true` + `"lateSeason": true`) | ✅ |
| BASE_PRICES coverage | 181 destination airports — **all 404 venue `ap` values covered (0 gaps)** | ✅ CLOSED |
| Remote branches | **18 unmerged** (`claude/*` × 15, `fix-appjsx-final`, `restore-appjsx`, `test-small`) | ⚠️ NEW |

---

## 2. Flight Proxy Status — 🔴 RED (Day 41, DEADLINE TOMORROW)

**Status**: `proxy.js` fixes committed (`059de43` / `0cdb711`) but **NOT deployed to VPS**. `/opt/peakly-proxy` is a hand-copied directory — `git pull` fails there. Manual SSH copy required.

**What's broken while undeployed** (unchanged since Day 1):

1. `forecast_days=7` on live VPS instead of `14` → two-weekend scoring silently disabled
2. `capacitor://localhost` missing from live CORS → iOS native build blocks all proxy calls
3. `DELETE` not in live `Access-Control-Allow-Methods` → alert deletion silently broken (preflight blocked, `.catch(()=>{})` hides it)
4. Weather cache (`_wxCache`) in-memory only on live VPS → a `pm2 restart` wipes it; cold-cache traffic spike can hit Open-Meteo free-tier ceiling

All four fixes are in the committed `server/proxy.js`. The APNs `http2.connect` + `dsaEncoding: 'ieee-p1363'` fix is also committed. `app.jsx` alert IDs use `crypto.randomUUID()` (committed). None of it is live until this copy command runs.

**Deploy command (Jack, ~5 min via SSH):**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected health output after deploy:
```json
{
  "status": "ok",
  "forecast_days": 14,
  "wx_cache_size": 0,
  "wx_cache_disk": "loaded",
  "apns": "configured"
}
```

---

## 3. Security Audit — ✅ GREEN

| Check | Result |
|-------|--------|
| Travelpayouts server token in client | ✅ NOT present — proxy-only (`TOKEN = process.env.TRAVELPAYOUTS_TOKEN`) |
| Supabase anon key in app.jsx | ✅ Intentional, public-safe, RLS-gated — documented in CLAUDE.md |
| `.gitignore` covers `.env`, `.p8`, `.pem`, `.key`, `.p12` | ✅ All present |
| Secrets in recent commits | ✅ None detected — report commits only |
| APNS `.p8` key path | ✅ `process.env.APNS_KEY_PATH` — env-only, never in source |
| Sentry DSN | ✅ Wired in app.jsx:8 and index.html:77 |

---

## 4. Weather & External API — ✅ GREEN

| Check | Result |
|-------|--------|
| Open-Meteo direct calls | ✅ Present with AbortController (8s timeout), 2hr localStorage cache |
| VPS proxy fallback | ✅ `_tryProxyWx()` with 4s timeout, falls back to direct on failure |
| Marine API batching | ✅ Beach-only (`needsMarine = category === "beach"`) |
| Weather batch rate | ✅ 50 venues / 2s batching in App useEffect — under Open-Meteo free tier |
| Rate limit risk | ✅ Low at current scale (<10 MAU). Redis/VPS cache is the Reddit-spike protection. |

---

## 5. Performance Analysis — ✅ GREEN (prod) / ⚠️ DEV

**Production bundle (CI-built via esbuild, what GitHub Pages serves):**
- `app.min.js`: ~247 KB gzipped (esbuild minified from 741 KB source)
- React 18.3.1 UMD: ~150 KB gzipped
- ReactDOM 18.3.1 UMD: ~100 KB gzipped
- **Total first-load**: ~497 KB gzipped — acceptable for a content-heavy app
- **Babel Standalone (7.24.7, ~900 KB unminified)**: stripped entirely in prod build ✅

**Dev (open `index.html` locally):**
- Babel parse wall: 3–5s desktop, 8–12s Android — expected and documented
- Not a user-facing concern; dev experience only

**Largest bottleneck at scale**: Open-Meteo direct fallback. At 100+ concurrent DAU hitting the same venue set, cold cache requests fan out N:1 to Open-Meteo. The VPS proxy cache (once deployed) drops this to 1 upstream call per (lat,lon) per 2hr window regardless of concurrency. **This is exactly what the VPS redeploy fixes.** Deploy it before Reddit post.

**CDN dependency versions:**

| Library | Version | Latest | Status |
|---------|---------|--------|--------|
| React | 18.3.1 | 18.3.1 | ✅ Current |
| ReactDOM | 18.3.1 | 18.3.1 | ✅ Current |
| Babel Standalone | 7.24.7 | 7.25.x | ⚠️ Minor behind (dev-only, not urgent) |
| Supabase JS | 2.106.2 (lazy CDN) | 2.x | ✅ Recent |

---

## 6. Cost Estimate

| Scale | Infrastructure | Notes |
|-------|---------------|-------|
| Current (<10 MAU) | $6/mo (DO droplet) + $0 GitHub Pages | GitHub Pages free tier |
| 1K MAU | $6/mo | DO 1GB droplet handles it; Open-Meteo stays within free tier with proxy cache |
| 10K MAU | $18/mo | Upgrade to DO 2GB ($12) + Caddy/Nginx tuning; Open-Meteo may need business tier ($0–$20/mo) |
| 100K MAU | $80–150/mo | DO 4GB CPU-optimized + Redis cache ($15), CDN (Cloudflare free tier for static), possible Open-Meteo API key |

**Cost optimization opportunities:**
1. **Cloudflare CDN (free tier)** — zero cost, removes GitHub Pages bandwidth, adds edge caching for static assets. 30 min setup.
2. **VPS disk cache** (already committed) — extends weather TTL across restarts, reduces upstream Open-Meteo calls by ~80% after warm-up. No cost.
3. **Lazy Supabase CDN load** (already implemented) — only loads ~80KB when needed. No change needed.

---

## 7. Branch Proliferation — ⚠️ NEW P2

**18 unmerged remote branches** appeared in this run's `git fetch`:

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

**Risk**: Exactly the May 9 pattern that ended at 86 worktrees. Most are exploratory Claude sessions that never merged. None threaten main right now, but `fix-appjsx-final`, `restore-appjsx`, and `test-small` suggest someone tried to fix app.jsx outside the normal flow — possibly during the week before code freeze.

**Fix (Jack, ~2 min after reviewing):**

```bash
# Dry run — see what gets deleted:
git branch -r | grep -E "origin/(claude/|fix-appjsx|restore-appjsx|test-small)" | sed 's|origin/||'

# Delete them (confirm each name is safe first):
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

Do NOT delete without glancing at the three non-claude branches (`fix-appjsx-final`, `restore-appjsx`, `test-small`) — they may contain a real fix that was never merged to main. Diff them first:

```bash
git log --oneline main..origin/fix-appjsx-final
git log --oneline main..origin/restore-appjsx
git log --oneline main..origin/test-small
```

---

## 8. Open Issues Priority Order

| # | Issue | Days | Status | Action |
|---|-------|------|--------|--------|
| **P0** | **VPS proxy.js undeployed — deadline TOMORROW Sep 20** | 41 | 🔴 RED | Jack SSH — 5 min |
| **P2** | 18 stale remote branches | NEW | ⚠️ New | Jack: diff + delete batch |
| **P2** | dist/ 5 files tracked in git (CI-regenerated) | 10 | Carry | `git rm --cached dist/{index,manifest,robots,sitemap,sw}.*` |
| **P2** | No SRI on CDN scripts (React 18, Babel) + no CSP meta | Ongoing | Carry | Apply after Reddit post — CSP breaks Babel eval in dev |

---

## 9. What Breaks First at Scale

**The VPS weather cache is the single choke point.** Without it live, every concurrent user who opens Peakly cold fires a direct Open-Meteo request. Open-Meteo's free tier allows 10,000 calls/day and has a soft 100/min ceiling. 404 venues × N daily active users × 1 refresh = at 25 DAU, you hit the daily limit in a single morning browse session. The proxy cache is the fix. It's committed. It runs on a $6/month server that's already paid for and running. It's been deployed-but-not-configured for 41 days. Deploy it before the Reddit post or the first traffic spike kills the product's only data dependency.

---

## Status Summary

| Component | Status |
|-----------|--------|
| Live site | ✅ GREEN |
| Cache stamp | ✅ GREEN (correct for freeze) |
| Security | ✅ GREEN |
| Performance | ✅ GREEN (prod) |
| Weather / APIs | ✅ GREEN |
| Flight proxy (live VPS) | 🔴 RED — Day 41, DEPLOY TOMORROW |
| Branch hygiene | ⚠️ 18 stale branches, new finding |
| dist/ git tracking | ⚠️ P2 carry |

**VPS redeploy is the only thing that matters before Sep 20 EOD. The deploy command is 3 lines. The window is today.**
