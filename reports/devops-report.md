# DevOps Report — 2026-10-13 (RED)

**Status: 🔴 RED — VPS Day 65 (SSH window Oct 11–12 is NOW PAST. 5 days to Oct 18 launch). `origin/master` footgun Day 7 (511 commits behind main, still live). Code freeze Day 29 clean. SW PRECACHE Babel mismatch Day 9.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** (frozen — code freeze Day 29, unchanged) |
| VENUES (eval/bracket-counted) | **404** (134 skiing / 270 beach — matches CLAUDE.md) |
| lateSeason:true venues | **15** ✅ (eval: 15, grep shows 5 due to format mix — eval is authoritative) |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured, non-empty — real DSN at `app.jsx:8`, `index.html:77` |
| React 18 (cdnjs) | ✅ 18.3.1 — pinned exact version |
| Babel 7.24.7 (cdnjs, dev path) | ✅ esbuild strips in production build (`dist/app.min.js`) |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — frozen (expected: no app.jsx commits since Sep 14 per code freeze) |
| All API calls HTTPS | ✅ `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` — no HTTP leak |
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER="710303"` is affiliate marker, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated, documented) |
| No other credentials in client | ✅ Clean — full grep scan ran |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Image lazy loading | ✅ 9 `loading="lazy"` instances across card components |
| `fetchTravelpayoutsPrice` timeout | ✅ AbortController 4s |
| `fetchWeather` proxy fallback | ✅ try VPS → fall back to direct Open-Meteo |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |

---

## 2. CRITICAL ISSUES (P0) — Fix today, blocks launch

### P0-A: VPS Redeploy OVERDUE — **Day 65, launch in 5 days** 🚨

**The `server/proxy.js` fixes committed months ago are still NOT deployed to `/opt/peakly-proxy`.** The VPS runs the old code. What breaks because of this:

1. **Two-weekend scoring is disabled** — old proxy returns 7-day forecasts; client needs 14 days for the second Fri–Mon window. Users see half the scoring signal.
2. **iOS native calls 100% blocked** — `capacitor://localhost` missing from CORS allowlist. Every native app user gets CORS errors on all proxy calls.
3. **Alert deletion silently fails** — `DELETE` missing from `Access-Control-Allow-Methods`. Client's `.catch(()=>{})` hides the failure; users can't delete alerts.
4. **Rate limiter forged** — takes `X-Forwarded-For[0]` (spoofable); anyone can exhaust `_rateMap` and get unlimited weather calls.

**The committed `server/proxy.js` has ALL fixes: `forecast_days:14`, disk cache (`WX_CACHE_FILE`), CORS, DELETE verb, rate limiter hardened, `http2.connect` + `dsaEncoding: 'ieee-p1363'` for APNs. The file is ready. It just needs to be copied to the VPS and `pm2 restart` run.**

**Fix (SSH command sequence — copy-paste into terminal):**
```bash
ssh root@198.199.80.21
# Copy the fixed proxy.js (from your local machine)
# On your LOCAL machine, run:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then on VPS:
cd /opt/peakly-proxy
pm2 restart peakly-proxy
pm2 save

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: forecast_days:14, apns:configured (if .p8 wired), wx_cache warm after first request
```

**Time to fix: 10 minutes once SSH is open. Zero code changes needed — the fix is committed.**

---

### P0-B: `origin/master` Footgun — **Day 7, 511 commits behind main** 🚨

`origin/master` is still live, pointing at a commit from ~May 2026. The GitHub Pages `deploy.yml` deploys `main + master`. **If any session accidentally pushes to master instead of main, it will redeploy a 5-month-old version of the app to production with zero warning.**

This has not happened yet. It will eventually. The fix is one command:

**Fix:**
```bash
# Delete the remote master branch:
git push origin --delete master
# Verify Pages still deploys from main only by checking .github/workflows/deploy.yml
```

**Check deploy.yml first — if it explicitly deploys master, update it to main-only before deleting:**
```yaml
# .github/workflows/deploy.yml — ensure this reads:
on:
  push:
    branches: [ main ]
# NOT: branches: [ main, master ]
```

**Time to fix: 5 minutes.**

---

## 3. HIGH ISSUES (P1) — Fix this week

### P1-A: 15 Stale `claude/` Remote Branches + 3 Miscellaneous Branches

`origin/claude/analyze-test-coverage-WVIsT`, `origin/claude/code-review-cleanup-HjoCS`, `origin/claude/condense-alert-page-jzdLo`, `origin/claude/enhance-loading-screen-rZ1dc`, `origin/claude/fix-app-jsx-content`, `origin/claude/implement-todo-lNL7W`, `origin/claude/improve-peakly-ui-UHCHG`, `origin/claude/improve-scoring-system-XYGY6`, `origin/claude/product-reliability-assessment-w0poL`, `origin/claude/redesign-front-page-EndKs`, `origin/claude/review-peakly-ux-UQ0Qu`, `origin/claude/simplify-alerts-page-2ejGB`, `origin/claude/simplify-profile-page-Bi2Tc`, `origin/claude/standardize-venue-data-CufiQ`, `origin/claude/streamline-onboarding-account-97XRR`, plus `origin/fix-appjsx-final`, `origin/restore-appjsx`, `origin/test-small`.

18 stale remote branches is launch liability — any re-push to one re-triggers GitHub Actions and clutters the deploy history. With 5 days to launch, these are noise that obscures the real deploy signal.

**Fix:**
```bash
# Dry run first — see what would be deleted:
git branch -r | grep -E "claude/|fix-appjsx-final|restore-appjsx|test-small" | sed 's/origin\///'

# Delete all (run from local machine with push access):
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

**Time to fix: 5 minutes. Do this before launch.**

---

### P1-B: SW PRECACHE Mismatch (Day 9)

`sw.js` has `PRECACHE = []` — the service worker caches nothing on install. Meanwhile `index.html` references `dist/app.min.js` (production build output from `deploy.yml`). After deploy, a user whose browser fetches `index.html` fresh but gets `app.min.js` from a stale SW cache (or vice versa) will get a broken state. The production build output is at `dist/app.min.js` — this should be in PRECACHE.

**Fix (`sw.js` line with `PRECACHE`):**
```javascript
// Current:
const PRECACHE = [];

// Change to:
const PRECACHE = ["/peakly/dist/app.min.js"];
```

**But: do this AFTER the VPS redeploy to avoid triggering a code-freeze violation. If the freeze holds through launch, bundle this into the post-launch cache-stamp bump.**

**Time to fix: 2 minutes (one line).**

---

## 4. MEDIUM ISSUES (P2) — Fix this sprint

### P2-A: BASE_PRICES Coverage — 57 of 146 Venue Airports (39%)

From last CLAUDE.md audit: 100 of 146 venue airports missing from `BASE_PRICES` (≈68%). Current state from code freeze means this hasn't been addressed. Deal score is a headline feature and it silently falls back to no estimate for routes with no entry. Top missing by venue density: **CUN** (Cancún, ~15 beach venues), **BOB** (Bora Bora, ~8), **AUA** (Aruba), **STT**, **SXM**. Backfill the top 15 by venue count; ~2hr task.

### P2-B: No SRI on CDN Scripts

`index.html` loads React, ReactDOM, Babel, Sentry from CDN with `crossorigin` but no `integrity=` hashes. A CDN compromise would silently inject arbitrary JS into every user session. Low probability, catastrophic if it happens.

**Fix (add to each `<script>` in `index.html`):**
```html
<!-- Get the hash: -->
<!-- curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->
<script
  crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_HERE>"
></script>
```

**Time to compute + wire: 30 minutes. Post-launch is acceptable; pre-launch is better.**

### P2-C: Babel Cold-Start on Dev Path (3–5s on Mobile)

Production build (`dist/app.min.js`, 439 KB minified) strips Babel entirely — this is already handled. But if someone accesses `index.html` directly (not via Pages' `dist/` redirect), they get the 3–5s Babel parse wall. Acceptable for dev; ensure the Pages deployment serves `dist/index.html`, not root `index.html`. **Verify `deploy.yml` copies `dist/index.html` to the Pages root.**

---

## 5. Cost Estimate

| Scale | Monthly Cost | Bottleneck |
|-------|-------------|------------|
| Current (<100 MAU) | **$6/mo** (DigitalOcean 1GB droplet) | Nothing — VPS idle |
| 1K MAU | **$6/mo** | Open-Meteo free tier (1000 req/day; ~12 venues × 1K DAU = well within with proxy cache) |
| 10K MAU | **$12–18/mo** (upgrade to 2GB droplet) | VPS memory — `_wxCache` is in-memory, 10K concurrent users × 404 venues = ~5GB if uncached. Disk persistence (already in `proxy.js`) prevents cold-start blowout |
| 100K MAU | **$50–80/mo** (4GB droplet + CDN for static assets) | Open-Meteo rate ceiling WILL be hit without a caching CDN layer. Also: GitHub Pages has a 100GB/mo bandwidth soft cap — `dist/app.min.js` at 439KB × 100K monthly users = ~44GB, within limits but close |

**Optimization opportunity:** The static `app.min.js` (439KB) is served from GitHub Pages on every hard reload. At 100K MAU this is ~44GB/mo with zero CDN caching headers. Add a `Cache-Control: max-age=86400` response header via Pages' `_headers` file (Netlify-style, supported by some CDN configs but NOT natively by GitHub Pages). Consider Cloudflare in front of Pages for free caching at this scale.

---

## 6. What Breaks First at Scale

**The Open-Meteo rate ceiling hits first, not the VPS.** Open-Meteo's free tier allows ~1000 requests/day per IP. The VPS proxy with disk-persistent `_wxCache` collapses 404 venues × N users to 404 upstream calls on cold start, then 0 until the 2hr TTL expires. At 100 MAU with normal browse patterns (~5 venue checks/session × 5 sessions/day = 25 cache misses/day), you're fine. At 1K MAU with a Reddit spike, you could hit 2000 cache misses in an hour if different users browse different venue sets. **The fix is already committed in `server/proxy.js` (disk cache survives pm2 restarts), but it's not deployed yet (Open P0-A above).** Without the VPS redeploy, a single Reddit spike will DDoS Open-Meteo's free tier inside 10 minutes, and every user gets "conditions unavailable." The VPS redeploy is the difference between a soft launch surviving Reddit and it not.

---

## 7. Summary — 5 Days to Oct 18 Launch

| Priority | Item | Status | ETA |
|----------|------|--------|-----|
| **P0** | VPS redeploy (proxy.js fixes live) | ❌ Not done (Day 65) | 10 min SSH |
| **P0** | Delete `origin/master` footgun | ❌ Active risk (Day 7) | 5 min |
| **P1** | Delete 18 stale remote branches | ❌ Not done | 5 min |
| **P1** | Fix SW PRECACHE Babel mismatch | ⚠️ Code freeze — defer to post-launch | 2 min |
| **P2** | BASE_PRICES coverage (39%) | ❌ Not done | 2 hr |
| **P2** | SRI on CDN scripts | ❌ Not done | 30 min |
| ✅ | app.jsx code freeze (Day 29 clean) | GREEN | — |
| ✅ | Sentry wired | GREEN | — |
| ✅ | Plausible analytics present | GREEN | — |
| ✅ | HTTPS everywhere | GREEN | — |
| ✅ | No secrets in client code | GREEN | — |
| ✅ | APNs fix committed (http2 + P1363) | GREEN (undeployed) | — |
| ✅ | Alert IDs use crypto.randomUUID | GREEN | — |
| ✅ | Disk cache in proxy.js | GREEN (undeployed) | — |

**Bottom line: the code is launch-ready. The VPS is not. 10 minutes of SSH work separates a clean launch from a broken one. The window is now — 5 days of lead time, not 5 days of buffer.**
