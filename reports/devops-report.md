# DevOps Report — 2026-09-21 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 43. Sep 20 hard deadline PASSED YESTERDAY. Every day it stays undeployed is a broken commitment. Two-weekend scoring dead, iOS native blocked, alert deletion silently broken. No code regressions. Cache stamp `20260914a` correct (day 7 of code freeze). Braces balanced 5682/5682. VENUES 404 confirmed. 18 stale remote branches — deletion deadline also passed.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## What Changed Since Yesterday (Sep 20)

No code commits to `app.jsx`, `sw.js`, or `index.html`. Three report commits only (PM v156, Content Sep 20, DevOps Sep 20). Repository is identical to yesterday. VPS deadline was Sep 20 EOD — it passed without action.

---

## 1. Live Site Health — ✅ GREEN (code side only)

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI/dist/) | ~439 KB minified (esbuild, Babel stripped) | ✅ |
| Cache stamp | `20260914a` — 7 days old, CORRECT for code freeze | ✅ |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ |
| Brace balance | 5682 open / 5682 close — BALANCED | ✅ |
| VENUES | 404 (134 skiing / 270 beach) — confirmed via eval | ✅ |
| `lateSeason: true` | 15 venues — matches CLAUDE.md | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| React version | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Sentry DSN | Configured: `9416b032...` in app.jsx + `index.html` script tag | ✅ |
| Images lazy-loaded | Yes — `loading="lazy"` on all `<img>` render sites (9 instances) | ✅ |
| FLIGHT_PROXY | `https://peakly-api.duckdns.org` (HTTPS) | ✅ |

---

## 2. P0 — VPS Redeploy: DEADLINE PASSED YESTERDAY (Day 43)

The PM-set hard deadline was Sep 20 EOD. It is now Sep 21. The `server/proxy.js` fixes have been committed since Aug 11. Every feature below is broken in production right now, today, and has been for 43 days.

**What is broken until you SSH in:**

| Feature | Broken How |
|---------|-----------|
| Two-weekend scoring | VPS serves `forecast_days=7` → second weekend always "low confidence" |
| iOS native proxy | `capacitor://localhost` missing from CORS → 403 on every proxy call |
| Alert deletion | `DELETE` not in `Access-Control-Allow-Methods` → preflight blocked, `.catch(()=>{})` hides it |
| Weather cache persistence | In-memory only on running VPS — `pm2 restart` wipes it cold (disk fix committed but not deployed) |
| Rate limiter accuracy | `[0]` XFF instead of `.pop()` → forgeable by anyone, rate map manipulation |

**The committed `server/proxy.js` already has all five fixes.** You are one SSH session away from closing all of them.

**Exact commands:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# Backup running version
cp proxy.js proxy.js.bak-$(date +%Y%m%d)
# Copy new version (from your local machine)
# scp ~/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
# Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: apns:configured or apns:unconfigured, uptime <60s, wx_cache_size:0 (will refill)
```

**Verification checklist post-deploy:**
- `"uptime_seconds": < 120` — confirms restart landed
- `"wx_cache_size": 0` — confirms fresh start (ok, fills on traffic)
- Hit `/api/weather?lat=51.5&lon=-0.1` → should return 14 days of data
- From iOS simulator: verify CORS header present on preflight to `/api/alerts`

---

## 3. P1 — 18 Stale Remote Branches (Decision Deadline Also Passed)

PM v155 set Sep 20 as the branch-decision deadline. No action taken.

**18 stale remote branches:**
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
origin/fix-appjsx-final
origin/restore-appjsx
origin/test-small
```

All are exploratory agent branches, none merged to main. The decision was supposed to happen yesterday. Recommendation: delete all 18. None contain committed work that isn't superseded.

**One-liner to delete all 18:**
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

---

## 4. Security Audit — ✅ No New Issues

| Check | Result | Status |
|-------|--------|--------|
| Travelpayouts token (`TP_TOKEN`) | NOT in client code — server-side only in `proxy.js` | ✅ |
| Travelpayouts `TP_MARKER` (`710303`) | In `app.jsx` — this is the affiliate marker, not a secret; correct placement | ✅ |
| Supabase anon key | In `app.jsx` — intentional, RLS-gated, anon keys are public-safe per Supabase design | ✅ |
| APNS keys (`.p8`) | In `.gitignore` — `*.p8` covered | ✅ |
| `.env` files | `.gitignore` covers `.env`, `.env.*`, `*.env` | ✅ |
| Git history secrets scan | No tokens/keys in recent commits | ✅ |
| Sentry DSN in HTML | Present — this is intentional (client-side error monitoring DSN is public-safe) | ✅ |

No new security issues. Same posture as yesterday.

---

## 5. Performance Analysis

| Metric | Value | Notes |
|--------|-------|-------|
| app.jsx source | 741 KB | Babel parses this in-browser on dev builds |
| Built bundle (dist/) | ~439 KB minified | esbuild strips Babel — production path |
| CDN scripts total | React 18.3.1 (~42KB gz) + ReactDOM (~130KB gz) + Babel 7.24.7 (~350KB gz, dev only) + Supabase (lazy ~80KB gz) | |
| Lazy-loaded images | ✅ 9 render sites | |
| CDN versions | React 18.3.1, Babel 7.24.7 — both current stable | ✅ |
| Open-Meteo batching | 50 venues/2s — correctly rate-limited | ✅ |

**Single largest performance bottleneck:** Babel Standalone 7.24.7 (~350KB gzipped) parsing 741KB of JSX on cold load. This only affects the `index.html` dev path — the production `dist/index.html` uses the esbuild bundle and bypasses it entirely. Confirmed: `deploy.yml` runs `node scripts/build-web.mjs` on every push to main. No action needed for production users.

**Second bottleneck:** 404 parallel weather fetches on first load, batched at 50/2s. At 100 concurrent users all loading simultaneously (Reddit spike), each user's browser fires its own 404 fetch-waves independently — the VPS proxy cache is what prevents this from blowing Open-Meteo's free tier. **This is why the VPS redeploy is a pre-traffic gate, not a nice-to-have.**

---

## 6. Cost Estimate

| Scale | DigitalOcean ($6/mo droplet) | Open-Meteo (free) | Notes |
|-------|------------------------------|-------------------|-------|
| Current (<100 MAU) | $6/mo | Free (well under 10K calls/day) | |
| 1K MAU | $6/mo | Free (proxy cache keeps unique lat/lon calls low) | |
| 10K MAU | $12/mo (upgrade to 2GB) | Free → $15/mo (if cache miss rate >5%) | |
| 100K MAU | $48/mo (4GB + load balancer) | $35-75/mo | Open-Meteo commercial or self-host |

**Cost optimization opportunities:**
1. The committed disk-cache fix in `proxy.js` (`WX_CACHE_FILE`) saves ~90% of upstream weather calls post-restart. Free until deployed.
2. At 10K MAU, Travelpayouts revenue (~$1.40/1K MAU) more than covers infra at any realistic scale.
3. No CDN cost — GitHub Pages serves static assets free up to 100GB/month bandwidth.

---

## 7. What Breaks First at Scale

Open-Meteo free tier is the cliff. The free API allows ~10,000 daily API calls. At 100 concurrent users all loading the Explore tab simultaneously (the Reddit/HN spike scenario), each user's browser makes ~8 direct Open-Meteo calls for their first 50 visible venues. That's 800 upstream calls per minute — the free tier blows in under 15 minutes. The VPS proxy cache (committed, not deployed) is the exact solution: 404 users hitting the same (lat, lon) share one upstream call. Without the VPS deploy, a successful Reddit post could trigger API rate limiting within minutes, degrading every user's experience to "conditions unavailable" exactly when they're trying the app for the first time. This is why PM v99 reclassified the VPS redeploy from P2 to P1 "pre-traffic gate." The fix is already written and committed. It just needs a 3-minute SSH session.

---

## Summary

| Priority | Issue | Time to Fix | Status |
|----------|-------|-------------|--------|
| P0 | VPS redeploy (Day 43, deadline yesterday) | 15 min SSH | ❌ UNRESOLVED |
| P1 | 18 stale remote branches (decision deadline yesterday) | 2 min git push | ❌ UNRESOLVED |
| ✅ | Live site code health | — | GREEN |
| ✅ | Security posture | — | GREEN |
| ✅ | Performance (production path) | — | GREEN |

**Nothing is broken in the code. Everything that's broken is on the VPS. One SSH session closes the P0.**
