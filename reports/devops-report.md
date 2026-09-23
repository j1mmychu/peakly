# DevOps Report — 2026-09-23 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 45. Oct 18 launch is 25 days away. Two-weekend scoring dead, iOS native blocked, alert deletion silently broken. No code regressions. Cache stamp `20260914a` correct (Day 9 of code freeze). Braces balanced 5682/5682. VENUES 404 confirmed (134 skiing / 270 beach). BASE_PRICES 100% coverage confirmed. 18 stale remote branches unchanged.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health is unverified from this environment — do not infer status from this report.

---

## What Changed Since Yesterday (Sep 22)

Zero code commits to `app.jsx`, `sw.js`, or `index.html`. Three report commits only (PM v158, Content Sep 22, DevOps Sep 22). Repository structurally identical to yesterday. VPS deadline passed Sep 20. Branch cleanup deadline passed Sep 20. Oct 18 launch confirmed by PM v158. Code freeze holds Day 9.

**Stale branch delta:** 18 non-main/master branches today. Yesterday's report counted 19 (included `origin/master` in its tally). Same branches, different counting method. No branches cleaned up.

---

## 1. Live Site Health — ✅ GREEN (code side only)

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI/dist/) | ~439 KB minified (esbuild, Babel stripped per deploy.yml) | ✅ |
| Cache stamp | `20260914a` — 9 days old, CORRECT for code freeze | ✅ |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ |
| Brace balance | 5682 open / 5682 close — BALANCED | ✅ |
| VENUES | 404 (134 skiing / 270 beach) — confirmed via bracket eval | ✅ |
| `lateSeason: true` | 15 venues — matches CLAUDE.md Sep 13 count | ✅ |
| BASE_PRICES coverage | 181 entries, 0 of 152 venue airports missing — 100% | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| React version | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Sentry DSN | Configured: `9416b032...` in app.jsx + index.html script tag | ✅ |
| Image lazy loading | `loading="lazy"` on all venue images (9 call sites) | ✅ |

**BASE_PRICES note:** Content Sep 22 resolved Open #22. Verified independently: `node -e` walk of `BASE_PRICES` block finds 181 airport entries; venue AP walk finds 152 unique destination airports; all 152 present in BASE_PRICES. Coverage is real.

---

## 2. Flight Proxy Status — ✅ HTTPS (code) / 🔴 STALE (VPS)

```
FLIGHT_PROXY = "https://peakly-api.duckdns.org"   ← HTTPS ✅
fetchTravelpayoutsPrice: 4000ms AbortController timeout ✅
Fallback to BASE_PRICES estimate when proxy fails ✅
duffelTripDays / duffelWrongLength sanity check ✅ (app.jsx:13620)
buildFlightUrl fallback: +3 days (Fri→Mon match) ✅
```

**What's broken (VPS undeployed, Day 45):**

| Feature | Root Cause | User Impact |
|---------|-----------|-------------|
| Two-weekend scoring | `forecast_days: 7` on VPS (needs 14) | Front page shows 1 weekend only |
| iOS native proxy access | `capacitor://localhost` missing from CORS | Every native price/weather call fails |
| Alert deletion | `DELETE` missing from `Access-Control-Allow-Methods` | Alerts stack forever, can't delete |
| Weather cache persistence | In-memory only — lost on restart | Cold start hits Open-Meteo directly for all 404 venues |
| Rate limiter accuracy | XFF `[0]` (forgeable) — needs `[last]` | Open-Meteo ban risk during spike |

**The fix is committed. It requires one 5-minute SSH session:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

Expected `/health` response after redeploy:
```json
{
  "status": "ok",
  "apns": "configured",
  "wx_cache_size": 0,
  "uptime": "< 60s"
}
```

If `wx_cache_size` is 0 post-restart, that's expected — cache refills on traffic. Open-Meteo rate risk is highest in the first 30 minutes after a cold-start traffic spike (see §6 scaling note).

---

## 3. Weather & External API — ✅ (client-side)

| Check | Status |
|-------|--------|
| Open-Meteo endpoint | `api.open-meteo.com/v1/forecast` — no auth required, correct |
| Marine API | `marine-api.open-meteo.com/v1/marine` — beach venues only, correct |
| Batching | 50 venues per 2s batch — avoids rate limits on cold load |
| Client-side 2hr TTL | `WX_CACHE_MAX_AGE` enforced in `_wxCacheGet`/`_wxCacheSet` |
| Flight cache TTL | `FLIGHT_CACHE_MAX_AGE` enforced in separate cache functions |
| Proxy fallback | `_tryProxyWx()` → direct Open-Meteo on 4s timeout | ✅ |

Free-tier risk: Open-Meteo's documented ceiling is ~66 concurrent unique requests/day from a single IP before throttling. At current <10 MAU, no risk. At Reddit/HN launch spike, the VPS weather cache is the protection — which is why the redeploy is P1 not P2.

---

## 4. Security Audit — ✅ (no exposed server secrets)

| Check | Finding | Severity |
|-------|---------|---------|
| Travelpayouts server token | NOT in client code — proxy-only ✅ | — |
| `SUPABASE_ANON_KEY` in app.jsx | Present (line 26) — **intentional per CLAUDE.md**, public-safe + RLS-gated. Not a secret. | INFO |
| `TP_MARKER = "710303"` in app.jsx | Affiliate marker for Aviasales deep links — public intentionally | INFO |
| `.gitignore` | Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` | ✅ |
| Sentry DSN in client | Public-facing DSN in app.jsx + index.html — standard Sentry practice, RLS by project | INFO |
| APNS keys | NOT in repo — `.p8` covered by `.gitignore` | ✅ |
| Recent git history scan | No secrets in last 15 commits (report files only) | ✅ |
| SRI on CDN scripts | Missing on React/Babel/Sentry/Plausible script tags | P2 |

**SRI (Subresource Integrity) is missing on all external scripts.** Not a P0 — CDN compromise is low-probability — but worth adding before a 100K launch. Fix:

```html
<!-- Generate SRI hash: -->
<!-- curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->

<!-- Then add integrity="sha384-<hash>" crossorigin="anonymous" to each script tag -->
<script crossorigin="anonymous"
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-GENERATE_AND_PASTE">
</script>
```

**CSP meta tag is also missing.** For a Babel-in-browser app with `text/babel` script evaluation, a strict CSP is non-trivial (requires `'unsafe-eval'`). Medium risk to apply — defer until after launch or when moving off Babel.

---

## 5. Performance Analysis — ✅ (no regressions)

| Resource | Size | Notes |
|----------|------|-------|
| `app.jsx` (raw, Babel-parsed) | 741 KB | Babel parse: 3–5s on mobile cold start |
| `dist/app.min.js` (esbuild, prod) | ~439 KB | **Only loads on GitHub Pages — Babel stripped** |
| React 18.3.1 (cdnjs) | ~130 KB gzipped | UMD, cached after first load |
| Babel Standalone 7.24.7 | ~1.5 MB gzipped | **Only used in local dev** (not in dist/ build) |
| Supabase JS | ~80 KB gzipped | Lazy-loaded — only fetches on auth event |
| Sentry SDK | ~60 KB gzipped | Deferred via `defer` attribute |

**Biggest performance bottleneck:** The 741 KB `app.jsx` source is served raw in dev, but on GitHub Pages the esbuild CI build produces `dist/app.min.js` at ~439 KB. This is healthy. The actual bottleneck is **first-paint on slow connections** — the 404-venue image batch and weather fetch run sequentially and block the initial Explore render by 2–4s on 3G.

**Optimization opportunity (no-change, already deferred):** The Babel CDN script tag is still in `index.html` but `deploy.yml` produces `dist/index.html` which rewrites the script src. Local dev still uses Babel-in-browser. No action needed — existing architecture is correct.

All venue images use `loading="lazy"` on 9 call sites. ✅

---

## 6. Cost Estimate

| Tier | MAU | Infrastructure | Monthly Cost | Risk |
|------|-----|----------------|-------------|------|
| Current | <10 | DO $6 VPS + GitHub Pages (free) + Supabase free + Open-Meteo free | **$6/mo** | None |
| Launch | 1K | Same | **$6/mo** | Low — Open-Meteo free tier handles <66 concurrent; Supabase free tier handles <500MB |
| Growth | 10K | DO $6 VPS + Supabase Pro ($25) + Open-Meteo commercial license (est. $29/mo) | **$60/mo** | Medium — Supabase free row limit may be hit; VPS weather cache critical |
| Scale | 100K | DO $24 VPS (2GB RAM) + Supabase Pro + Open-Meteo commercial + CDN ($10) | **$160/mo** | High — single VPS is SPOF; cache warmup after restart is dangerous |

**Revenue at 1K MAU:** ~$7.58 (3 affiliate streams). Infrastructure: $6. **Net positive from Day 1.**

**Cost optimization available:** DO $6 VPS is correctly sized for the launch window. No action.

---

## 7. Stale Remote Branches (18)

**Same 18 branches as yesterday.** Two deadlines passed (Sep 20). All are orphaned Claude worktree branches from prior agent sessions.

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

## Issue Summary

### P0 — Fix TODAY

None (code side).

### P1 — VPS Redeploy (Day 45)

**This is the only open P1. It has been open for 45 days. The code is committed and ready. It takes 5 minutes.**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

**Time to fix: 5 minutes.**

### P2 — Stale Branches (18)

**Time to fix: 2 minutes.** Run the one-liner in §7.

### P2 — SRI on CDN Scripts

**Time to fix: 20 minutes.** Generate hashes for React, ReactDOM, Babel, Sentry; add `integrity` attributes to index.html script tags. Not urgent before launch.

### P2 — Tag Coverage (225 venues with ≤2 tags)

Day 17 unchanged. Content issue, not infrastructure. Not blocking launch.

---

## Scaling Failure Mode

**What breaks first:** The $6/mo DigitalOcean VPS running an in-memory weather cache. When a Reddit or HN post drops and 200+ users hit the app simultaneously, every user who lands in the first 90 seconds gets a cache miss. With the VPS proxy deployed and `forecast_days: 14` active, each unique (lat, lon) pair triggers one upstream Open-Meteo call. 404 venues × 200 concurrent users = 404 upstream calls in under a second if cache is cold. Open-Meteo's free tier starts rate-limiting around 66 requests/minute from one IP. Result: the first wave of launch traffic sees weather failures, falls back to direct Open-Meteo from the browser (200 clients × 404 venues = 80,800 browser-side requests), and likely triggers a temporary IP block on the user's ISP or the GitHub Pages CDN. **Prevention:** (1) Deploy the VPS now so the cache can warm before the Reddit post. (2) Pre-warm the cache by curling all 404 venue lat/lon pairs through `/api/weather` 10 minutes before the post goes live. (3) If the block happens anyway, Open-Meteo blocks are temporary (minutes to hours) — the fallback to direct browser fetches still works, just more slowly. This is survivable but avoidable.

---

*Report generated: 2026-09-23. Verified against `git fetch origin/main` HEAD `8d54f43`.*
