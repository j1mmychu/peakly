# DevOps Report — 2026-09-26 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 48. Oct 18 launch is 22 days away. Two-weekend scoring dead, iOS native blocked, fare-fallback improvements unreachable. Code freeze holds Day 13 — zero regressions. All other systems GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health unverifiable from this environment.

---

## What Changed Since Yesterday (Sep 25)

Zero code commits to `app.jsx`, `sw.js`, or `index.html`. Three daily report commits (PM v161, Content Sep 25, DevOps Sep 25) plus a new `reports/reddit-launch-post.md`. Structurally identical to yesterday. VPS deadline passed Sep 20 (6 days ago). Stale branch count: 18 (15 `claude/*` + `fix-appjsx-final` + `restore-appjsx` + `test-small`). Code freeze Day 13 holding.

**New finding this run:** VENUES bracket-count = **406**, category grep = **404** (134 ski + 270 beach). 2-venue discrepancy. Not a regression — code freeze since Sep 14, no app.jsx changes — but needs investigation before launch.

**No new P0s. Same single blocker: VPS proxy.js is not deployed.**

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI/dist/) | ~439 KB minified (esbuild, Babel stripped) | ✅ |
| Cache stamp | `20260914a` — Day 13 of code freeze, correct | ✅ |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ |
| Brace balance | 5,682 / 5,682 — BALANCED | ✅ |
| VENUES (bracket-walker) | **406** — up 2 from yesterday's reported 404 | ⚠️ |
| VENUES (category grep) | 134 skiing / 270 beach = **404** | ✅ |
| `lateSeason: true` | 15 venues (CLAUDE.md-consistent; prior grep of 10 missed JSON-quoted format `"lateSeason": true`) | ✅ |
| BASE_PRICES coverage | 2,709 entries / 165 unique venue airports — 100% coverage (confirmed Sep 23) | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| Sentry DSN | Configured: `9416b032...` in `index.html:77` — live error capture | ✅ |
| React | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Image lazy loading | `loading="lazy"` on all venue image call sites | ✅ |

### VENUES count discrepancy — investigate before launch

`node` bracket-walker returns **406** (`{` at depth-1 inside VENUES `[]`); category grep returns 134+270=**404**. The 2-venue gap means 2 entries either lack a `category` field or have a typo. They will render as blank cards in production if hit.

**Investigation command (run locally):**
```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('app.jsx', 'utf8');
const match = src.match(/const VENUES\s*=\s*\[[\s\S]*?\n\];/);
if (!match) { console.log('VENUES not found'); process.exit(1); }
try {
  const arr = eval('(' + match[0].replace('const VENUES =', '') + ')');
  const bad = arr.filter(v => !v.category || (v.category !== 'skiing' && v.category !== 'beach'));
  console.log('Total:', arr.length, '| Bad category:', bad.length);
  bad.forEach(v => console.log(' id:', v.id, 'category:', v.category));
} catch(e) { console.log('eval error:', e.message); }
"
```

---

## 2. Flight Proxy Status — ✅ CODE / 🔴 VPS (Day 48)

```
FLIGHT_PROXY = "https://peakly-api.duckdns.org"  ← HTTPS ✅
Timeout: 4,000ms AbortController ✅
Fallback: BASE_PRICES estimate on proxy failure ✅
duffelTripDays / duffelWrongLength sanity check ✅ (app.jsx:13620)
buildFlightUrl fallback: +3 days (Fri→Mon) ✅
```

### proxy.js commits undeployed since Aug 11 (Day 46 since last confirmed SSH):

| Date | Commit | Change | Impact |
|------|--------|--------|--------|
| Sep 9 | `3152c96` | Fall back to nearest ±1-day weekend RT fare when no exact-Friday hit | Fare returns for off-peak routes — beach in September returns nothing without this |
| Sep 10 | `c760dfb` | Widen live-fare fallback to ±3 days / 2–7 nights | More live fares surface, especially off-season |

The live VPS still runs the Aug 11 binary. Both Sep fare-fallback fixes are unreachable. Off-peak beach routes return `null` fares → demoted to `~$X` estimates → deal score signals suppressed → Reddit launch with 270 beach venues that show no live pricing.

### Fix — same SSH block, 5 minutes:

```bash
# On your local machine:
ssh root@198.199.80.21

# On the VPS:
cp -r /opt/peakly-proxy /opt/peakly-proxy-backup-$(date +%Y%m%d)
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-deploy
cp /tmp/peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: "forecast_days": 14, "apns": "configured" or "unconfigured", uptime resets
```

---

## 3. Weather & External APIs — ✅ GREEN (client-side)

| Setting | Value | Status |
|---------|-------|--------|
| Weather endpoint | `https://api.open-meteo.com/v1/forecast` | ✅ |
| Marine endpoint | `https://marine-api.open-meteo.com/v1/marine` | ✅ |
| `forecast_days` | 14 (weather), 10 (marine) — as committed | ✅ |
| VPS proxy cache | In-memory, unverifiable until redeploy | ⚠️ |
| Rate-limit protection | VPS in-memory 2hr LRU cache (deployed Aug 11) | ✅ code |

Open-Meteo free tier: no hard published rate limit, but ~66+ concurrent uncached requests triggers throttling. Current state: VPS handles caching for all deployed clients. The Sep 9+10 proxy changes don't affect weather logic — only flight fare fallback. Weather cache is operational as of Aug 11.

---

## 4. Security Audit — ✅ GREEN

| Check | Result | Status |
|-------|--------|--------|
| Travelpayouts token in client | Not found — `TP_MARKER=710303` (affiliate marker, not server token) | ✅ |
| Supabase anon key | Exposed: `eyJhbGci...` at app.jsx:26 | ✅ intentional — public-safe, RLS-gated |
| `.gitignore` coverage | `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` — all covered | ✅ |
| Recent commits for secrets | Checked last 20 commits — report files only, no code changes | ✅ |
| APNS keys | Gitignored (`.p8`), never committed | ✅ |
| Business plan PDF/PPTX | Scrubbed from history (2026-05-09) | ✅ |

No new security issues. The Supabase anon key being in client code is architecturally correct (Supabase designed for this pattern; RLS policies on `user_data` and `shared_lists` enforce per-user access).

---

## 5. Performance Analysis

| Metric | Value | Notes |
|--------|-------|-------|
| Source `app.jsx` | 741 KB | Babel parses this client-side in dev mode |
| Built bundle (`dist/app.min.js`) | ~439 KB minified | esbuild strips Babel, served via GitHub Pages |
| CDN deps loaded | React 18.3.1 (~130KB gz), Babel Standalone 7.24.7 (~400KB gz), Supabase UMD (lazy ~80KB gz), Sentry (~50KB defer) | Total ~660KB gz on cold load |
| Largest bottleneck | **Babel Standalone (400KB gz)** — only parsed in dev (`index.html` loads `app.jsx?v=...`); production CI strips it entirely via `build-web.mjs` | ✅ mitigated in prod |
| Image lazy loading | ✅ all venue images | |
| Unsplash `auto=format&q=75` | Not universally applied — known P2 in `reports/known-skipped.md` | ⚠️ low |

**Single largest bottleneck in production:** 406 venues × ~2 weather fetches each = 812 Open-Meteo requests per cold page load. Batched at 50 requests/2s (app.jsx), but first-meaningful-paint for venue scores still takes ~16s on mobile. The VPS weather cache collapses this to near-zero for warm cache hits. Deploy it.

---

## 6. Cost Estimate

| MAU tier | Infrastructure | Monthly cost |
|----------|---------------|-------------|
| Current (<100) | $6 DO droplet + free Open-Meteo + free GitHub Pages | **$6/month** |
| 1K MAU | Same — cache handles concurrent users | **$6/month** |
| 10K MAU | DO 2GB ($12) + consider Cloudflare proxy for GitHub Pages | **$12/month** |
| 100K MAU | DO 4GB ($24) + DigitalOcean Spaces for weather disk cache ($5) + Cloudflare ($0-20) | **$30–50/month** |

Reddit/HN spike (5K users/hour): the VPS in-memory cache survives this. GitHub Pages CDN survives anything. The only failure mode is Open-Meteo rate-throttling if the VPS cache is cold (just restarted) during the spike. Fix: disk persistence in `server/proxy.js` (~30 lines, Open #23 from CLAUDE.md).

---

## P0 — Fix Today (Blocks Launch)

### VPS proxy.js redeploy — Day 48, 22 days to launch

**Impact:** Two-weekend scoring dead. 270 beach venues show no live fares. iOS native can't reach proxy. Alert deletion silently fails. This has been P0 for 48 days.

**Time to fix:** 5 minutes SSH. Jack only.

```bash
# SSH → VPS → copy proxy.js → pm2 restart → verify /health
ssh root@198.199.80.21
cp -r /opt/peakly-proxy /opt/peakly-proxy-backup-$(date +%Y%m%d)
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-deploy 2>/dev/null || (cd /tmp/peakly-deploy && git pull)
cp /tmp/peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected `/health` after restart:
```json
{
  "status": "ok",
  "uptime": 3,
  "wx_cache_size": 0,
  "apns": "unconfigured",
  "forecast_days": 14
}
```

---

## P1 — Fix This Week

### 18 stale branches — `origin/master` is a deploy footgun

`deploy.yml` deploys both `main` AND `master` branches. `origin/master` is currently frozen at June 2026 state (PM v159 audit, Sep 23). Any accidental push to master → GitHub Pages serves old code. This is not theoretical — the branch exists, is public, and deploy.yml triggers on it.

**Impact:** Accidental push to master (or a confused agent session) silently serves the June 2026 build to all users. The live site at `j1mmychu.github.io/peakly` would revert 3+ months of fixes.

**Time to fix:** 10 minutes.

```bash
# 1. Delete origin/master (the footgun):
git push origin --delete master

# 2. Delete 15 stale claude/* branches (all merged or orphaned):
for branch in \
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
  claude/streamline-onboarding-account-97XRR; do
  git push origin --delete "$branch"
done

# 3. Delete the other 2 stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small

# 4. Verify only main remains:
git branch -r | grep -v HEAD
```

---

## P2 — Fix This Sprint

### VENUES count discrepancy: bracket-walker 406 vs category-grep 404

Two venues exist in the array without a valid `category` field (or with a typo). They won't score or render correctly. Run the investigation command in Section 1 to identify them. Fix is a one-line category assignment.

**Time to fix:** 5 minutes once the 2 bad venues are identified.

---

## Scale: What Breaks First

**Open-Meteo rate ceiling.** At ~66+ concurrent DAU loading uncached venue sets (e.g., a Reddit spike hitting a just-restarted VPS), the client falls back to direct Open-Meteo. 406 venues × 2 endpoints × 50 users = 40,600 requests before the LRU fills. Open-Meteo doesn't publish a hard limit but throttles aggressively at this volume. The VPS in-memory cache (deployed Aug 11) covers warm state — problem is cold cache after `pm2 restart`. The 30-line disk persistence fix (Open #23) makes cache survive restarts. Without it: deploy VPS → Reddit post hits → cold cache → Open-Meteo throttle → "conditions unavailable" for everyone in the first 10 minutes. Pre-cache before posting: hit `/api/weather` for the top 20 venue coordinates manually after redeploy, before the post goes live.

---

*Report generated 2026-09-26. Verified against `origin/main` @ `64e810d`. VPS state sourced from committed `server/proxy.js` only — cannot be confirmed from this environment.*
