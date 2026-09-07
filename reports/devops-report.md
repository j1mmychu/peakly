# DevOps Report — 2026-09-07 (YELLOW)

**Status: 🟡 YELLOW — AGP/AKL/GRU AIRPORT_COORDS gap FIXED in this commit. VPS debt (Open #19/#21/#23) is Day 45 — still the pre-Reddit launch blocker. Open-Meteo rate-limit risk unchanged.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treated as healthy per prior verification.

---

## What Changed Since Yesterday

- **AGP/AKL/GRU AIRPORT_COORDS gap FIXED** — confirmed missing from `const AIRPORT_COORDS` at line 6937 despite being present in `AP_CONTINENT`, `AIRPORTS` UI list, and `BASE_PRICES`. 3 coord entries added (Malaga Airport, Auckland International, São Paulo Guarulhos). Distance filter (`flightHours()`) was returning `null` for any venue with `ap: "AGP"|"AKL"|"GRU"`, which means the ≤Xhr flight cap was silently bypassed (the function returns null → passes filter, not blocked). Impact: users weren't being filtered out, but deal-score distance weighting was also broken for these routes. **Fixed. Cache stamp bumped to `20260907a` in lockstep (app.jsx / sw.js / index.html).**
- **Venue count discrepancy persists**: eval gives **407**; `scripts/.venue-baseline` still reads **405**. The 2-venue gap pre-dates this commit — no venues added today. Content's "405" claim appears to reflect a prior count that didn't fully account for the Sept 4 PM v140 commit. The baseline needs a one-line update to 407 (`echo 407 > scripts/.venue-baseline`) once the count is agreed — flagged below as P2.
- **Zombie branches**: 18 total (15 `claude/` + `fix-appjsx-final` + `restore-appjsx` + `test-small`). Unchanged. No new branches spawned overnight.
- **VPS Open #19/#21/#23**: Day 45. Code committed, not deployed. Unchanged.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,151** (+3 for AGP/AKL/GRU coords) |
| app.jsx bytes | **757,280** (~740 KB unminified; ~495 KB minified at deploy) |
| Cache buster | `20260907a` — ✅ bumped this commit |
| Plausible analytics | ✅ Present and active (`j1mmychu.github.io/peakly`, `index.html:32`) |
| Sentry DSN | ✅ Active (`9416b032a46681d74645b056fcb08eb7`, `app.jsx:8`) |
| React CDN | ✅ 18.3.1 from `cdnjs.cloudflare.com` (pinned, current LTS) |
| Babel CDN | ✅ 7.24.7 from `cdnjs.cloudflare.com` (dev only — esbuild strips from prod) |
| Production build | ✅ `deploy.yml` pre-compiles `app.jsx → dist/app.min.js` via esbuild |
| Lazy loading | ✅ 9/9 `<img>` tags include `loading="lazy"` |
| Venue count (eval) | **407** (eval-verified) — 2-above `.venue-baseline` (see P2 below) |
| BASE_PRICES coverage | ✅ **181 destination airports** — full coverage achieved (PM v129 backfill + PM v140 batch) |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old IP ref (104.131.82.242) | ✅ Absent from client code |
| Timeout | ✅ 4s `AbortController` on all fetch calls |
| Fallback | ✅ Null return → `~$X` estimate from `BASE_PRICES`, never blank |
| Concurrency semaphore | ✅ 8 concurrent max |

**Deployed proxy state (Open #19): unverified from sandbox. Last confirmed healthy 2026-08-11.** The `forecast_days:14`, disk cache, CORS fix, and rate-limiter fixes committed to `server/proxy.js` are still not running on the VPS. Day 45.

---

## 3. Security Audit — CLEAN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Absent. `TP_MARKER=710303` is a public affiliate marker, not a secret |
| Supabase anon key in client | ✅ Expected. Public-safe JWT; RLS policies gate all data access |
| Sentry DSN in client | ✅ Expected. Public by design |
| `.gitignore` coverage | ✅ Covers `.env*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision`, `*.p12` |
| No `.env` files in repo | ✅ Confirmed |
| Recent commit scan | ✅ Last 10 commits are report files + today's AIRPORT_COORDS fix. No secrets |

---

## 4. Open-Meteo Rate Limit — P0 (Day 45, Unchanged)

**This is the single most dangerous unfixed item. The math hasn't changed:**

- 407 venues × ~1.65 avg calls (weather always + marine for beach ~65%) = **~671 cold calls per session**
- Free tier: **10,000 calls/day**
- Break-even: **~14.9 concurrent cold sessions**
- 500 first-time Reddit visitors in an hour = **335,500 upstream calls in 60 minutes** → rate-limited ~90 seconds after the post lands

**The fix (Open #19 VPS redeploy) is written and committed.** With 4,000-entry LRU cache on the proxy, N simultaneous users hitting the same venue = 1 upstream call. This turns a 90-second ceiling into a 10,000-session buffer.

**Jack: 30 minutes of SSH work. Day 45. This blocks the Reddit post.**

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# Copy updated server/proxy.js from repo (it is NOT a git clone)
# scp from your local machine:
# scp /path/to/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: forecast_days:14, apns field present, uptime resets
```

---

## 5. Fixed This Commit — AGP/AKL/GRU AIRPORT_COORDS (Was P1 Day 3)

**Root cause confirmed**: `const AIRPORT_COORDS` at `app.jsx:6937` was missing entries for AGP (Malaga), AKL (Auckland), and GRU (São Paulo), even though all three were correctly listed in `AP_CONTINENT`, the `AIRPORTS` UI array, and `BASE_PRICES`. The `flightHours()` function at `app.jsx:7042` returns `null` when either airport has no coords → the distance filter *passes* the venue rather than blocking it, so users weren't being filtered out. But the deal-score distance weighting also uses these coords, so deals from these airports were being scored without flight-time context.

**Fix applied** (3 lines added at `app.jsx:7034–7037`):
```js
AGP:{lat:36.6749,lon:-4.4993},   // Malaga Airport (Spain)
AKL:{lat:-37.0082,lon:174.7850}, // Auckland International (New Zealand)
GRU:{lat:-23.4356,lon:-46.4731}, // São Paulo Guarulhos (Brazil)
```

Sources: ICAO/OpenStreetMap official terminal coordinates. Cache stamp bumped to `20260907a`.

---

## 6. Open Items — Priority Order

### P0 — Open-Meteo rate limit (Day 45, pre-Reddit gate)
See §4 above. Fix = VPS redeploy (SSH, `scp proxy.js`, `pm2 restart`). 30 minutes.

### P1 — VPS Open #19 (Day 45): `forecast_days:14` + disk cache + CORS/rate-limiter
Same SSH session as Open-Meteo fix. Also unblocks:
- Two-weekend scoring (currently uses 7-day payload, silently disabling week-2 scores)
- Alert deletion (CORS preflight blocks `DELETE` — client's `.catch(()=>{})` hides it)
- iOS native proxy access (capacitor:// not in CORS allowlist)

### P1 — VPS Open #23 (Day 45): Weather cache disk persistence
`_wxCache` is in-memory. A `pm2 restart` (required for the redeploy) wipes it. Bundle this ~30-line change with the redeploy to prevent cold-cache spike immediately post-restart. The fix is already in the committed `server/proxy.js`.

### P1 — APNS Open #21 (Day 45): DER vs P1363 JWT + HTTP/2
Do not wire push until fixed. The committed `server/proxy.js` includes the HTTP/2 transport fix (`http2.connect` + `dsaEncoding: 'ieee-p1363'`). Needs to deploy with the VPS redeploy.

### P2 — `.venue-baseline` count drift
`scripts/.venue-baseline` reads **405**; eval count is **407**. The auto-push guard compares against this baseline and would log a warning (or refuse, depending on the margin check). Fix:
```bash
echo 407 > scripts/.venue-baseline
```
Hold until Content and PM align on the authoritative count. If Content's 05-09 report adds 2 venues and those land in app.jsx, recount before updating.

### P2 — 18 zombie branches (unchanged)
```bash
# Delete all stale claude/ branches and cleanup branches in one shot:
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
15 minutes. `master` (kept as deploy alias) and `main` are the only branches that should exist.

---

## 7. Performance & Cost

| Metric | Value |
|--------|-------|
| JS bundle (prod, minified) | ~495 KB (`dist/app.min.js` via esbuild — Babel eliminated) |
| JS bundle (dev, Babel inline) | ~757 KB raw JSX + ~900 KB Babel Standalone = **~1.65 MB** (dev only) |
| Biggest perf bottleneck | **407 × 1.65 API calls on cold session = ~671 upstream requests** — this, not JS bundle size |
| CDN dependency versions | React 18.3.1, Babel 7.24.7 — both current, no updates needed |

### Infrastructure cost at scale

| MAU | Monthly cost | Notes |
|-----|-------------|-------|
| Current (<100) | **$6/mo** | DO 1GB droplet + GitHub Pages (free) |
| 1K MAU | **$6/mo** | DO absorbs it; Pages stays free |
| 10K MAU | **$12–18/mo** | DO upgrade to 2GB ($12); Pages still free; Open-Meteo may need paid tier ($29/mo) if cold sessions spike |
| 100K MAU | **$75–150/mo** | DO 4GB ($24) + Open-Meteo paid ($29) + Cloudflare CDN cache ($0–20) + Supabase free tier edge (scale to $25/mo at 50K rows) |

**Optimization opportunity**: Cloudflare free plan in front of GitHub Pages would absorb 80%+ of static asset load and provide a CDN edge for the API proxy. Zero cost. 30 minutes to set up.

---

## 8. What Breaks First at Scale

**Open-Meteo hits the ceiling at ~15 concurrent cold sessions.** That is the entire risk surface. No amount of CDN tuning, bundle optimization, or DO upsizing matters if the weather API throws 429s for every user who hasn't cached a session in the last 2 hours. The proxy cache (Open #19) turns this from "breaks at 15 concurrent users" to "handles thousands." Everything else — Supabase RLS performance, Capacitor native bridge latency, the Babel parse wall on dev — is a rounding error compared to this. The VPS redeploy is the entire pre-launch infrastructure checklist. It's 30 minutes of SSH work that has been deferred for 45 days.

**Second failure mode**: If `peakly-api.duckdns.org` goes down (DO droplet crash, pm2 death, DuckDNS propagation failure), the client silently falls back to direct Open-Meteo — which immediately re-exposes the rate limit problem without the proxy buffer. There is no alerting. Monitoring recommendation: add a Cronitor or Uptime Robot ping to `https://peakly-api.duckdns.org/health` — free tier, 1-minute checks, pings Jack's phone when it returns non-200. 5 minutes to set up.
