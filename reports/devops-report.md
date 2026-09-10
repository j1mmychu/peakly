# DevOps Report — 2026-09-10 (YELLOW)

**Status: 🟡 YELLOW — dist/ directory is polluted with the iOS build artifact (P1). GitHub Actions corrects it on deploy but the committed state is wrong. VPS Open #19/#21/#23 remains at Day 30 post-Aug-11 redeploy (server is live, but proxy.js fixes are NOT on the VPS yet). No new P0s. VENUES now at 407.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treated as live per that prior verification. All proxy analysis is from committed source only.

---

## What Changed Since Yesterday (Sep 9)

- **3 new commits today**: `c760dfb` (fix flights ±3-day fallback, build `20260910a`), `d7c3830` (iOS ITSAppUsesNonExemptEncryption=false), `af25afb` (iOS rebundle)
- **app.jsx**: 14,152 → **14,198** lines (+46). 757,322 bytes.
- **VENUES count**: 405 → **407** (+2 new venues per bracket-walk eval)
- **Cache stamp**: `20260907a` (Day 3) → **`20260910a`** (today — fresh ✅)
- **dist/ corrupted**: iOS build artifacts now in dist/. No app.min.js. No vendor/. index.html references local vendor paths that don't exist. GitHub Actions fixes on deploy.
- **PM v145 confirmed**: venue search "5 days to deadline," flight fallback improvements live.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,198** |
| app.jsx bytes | **757,322** (~740 KB unminified) |
| dist/app.min.js | ⚠️ **MISSING from repo** — GitHub Actions builds it on deploy via `build-web.mjs`; live site likely fine but committed dist/ is wrong |
| Cache buster | ✅ `20260910a` — bumped today, in lockstep (app.jsx:17, sw.js, dist/sw.js) |
| Plausible analytics | ✅ Active — `index.html:32` (deferred, not blocking render) |
| Sentry DSN | ✅ Active — `9416b032a46681d74645b056fcb08eb7` wired `app.jsx:8` + `index.html:77` (deferred) |
| React CDN | ✅ 18.3.1 — `cdnjs.cloudflare.com` (SLA-backed, pinned) |
| Babel CDN | ✅ 7.24.7 — `cdnjs.cloudflare.com` (dev-only — esbuild strips in prod) |
| OG image | ⚠️ `content=""` — empty! Social preview is blank on Reddit/HN/Twitter |
| VENUES | **407** (confirmed via bracket-walk; CLAUDE.md says 395 — stale, update it) |

---

## 2. P1 — dist/ Build Collision: iOS Build Overwrites Web Build

**What happened**: `build-ios.mjs` and `build-web.mjs` both write to `const DIST = path.join(ROOT, "dist")`. Running the iOS build last clobbers the web build. The current committed dist/index.html references `./vendor/react.production.min.js` and `./app.js` (iOS vendored layout) — neither file exists in dist/. The web build's `app.min.js` is also gone.

**Why it matters**: GitHub Actions `deploy.yml` runs `build-web.mjs` first, which nukes dist/ with `fs.rmSync` then rebuilds correctly. So the LIVE GitHub Pages site is almost certainly fine. But:
- Anyone who manually runs `build-ios.mjs` then tries to serve dist/ locally sees a broken site
- The committed dist/index.html is a lie — it will serve a white screen if not rebuilt
- If someone ever adds a `git diff dist/` check to deploy.yml, this will confuse it

**Fix** (10 minutes, surgical):

In `scripts/build-ios.mjs` line 16, change the output directory from `dist` to `ios/App/App/public`:

```javascript
// BEFORE (line 16):
const DIST = path.join(ROOT, "dist");

// AFTER:
const DIST = path.join(ROOT, "ios/App/App/public");
```

Then delete the stale iOS artifacts from dist/ so the committed state is clean:

```bash
# Remove iOS artifacts from web dist
rm -f dist/sw.js  # will be rebuilt by build-web.mjs from sw.js
# Don't manually add app.min.js — let GH Actions build it
# Commit just the build-ios.mjs change; GH Actions handles dist/ on next push
git add scripts/build-ios.mjs
git commit -m "fix(build): separate iOS output dir from web dist to stop build collision"
git push origin main
```

This also unblocks a cleaner local dev flow — running `build-ios.mjs` no longer nukes the web build.

---

## 3. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | ✅ `https://peakly-api.duckdns.org` (HTTPS) — no HTTP leak |
| `FLIGHT_PROXY` constant | `app.jsx:6333` — correct |
| Timeout | ✅ 4s AbortController signal on all proxy fetches (`app.jsx:5519`) |
| Fallback | ✅ direct Open-Meteo on proxy failure |
| Latest fix | ✅ ±3-day / 2–7-night fallback shipped in `c760dfb` |

**Open #19/#21/#23 — VPS proxy.js still not deployed (Day 30 since Aug 11 redeploy)**. Committed fixes in `server/proxy.js` are NOT live:
- `forecast_days: 14` → two-weekend scoring broken until deployed
- `DELETE` CORS method → alert deletion silently fails
- `capacitor://localhost` CORS origin → iOS native calls may fail
- Disk weather cache → every restart blows the in-memory cache
- APNs HTTP/2 + P1363 JWT → zero pushes delivered if wired today

The server IS running (confirmed live 2026-08-11). But it's on 6-week-old code.

**Deploy command** (SSH to VPS, 5 minutes):
```bash
# On 198.199.80.21
cd /opt/peakly-proxy
# /opt/peakly-proxy is NOT a git clone — scp the file:
# From local: scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
```

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token | ✅ Server-side only (`TRAVELPAYOUTS_TOKEN` env var in proxy.js) |
| `TP_MARKER = "710303"` | ✅ Public affiliate link marker — intentional, not a secret |
| Supabase anon key | ✅ Public-safe per design (RLS-gated, `CLOUD_SYNC_CONFIGURED` pattern) |
| Supabase URL | ✅ Public — `wsoqcfwkvvemtlddcgfc.supabase.co` |
| `.gitignore` | ✅ Covers `.env`, `.p8`, `.pem`, `.key`, `.p12`, `.mobileprovision` |
| Git history scan (recent 10 commits) | ✅ No secrets in commit messages or diff stats |
| APNS keys | ✅ Not committed — `.p8` in .gitignore |
| Sentry DSN | ✅ In-repo by design (client-side error reporting) |

**No exposed secrets. Clean.**

---

## 5. Performance Analysis

**JavaScript load breakdown (production, GitHub Pages):**

| Asset | Size | Source |
|-------|------|--------|
| React 18.3.1 | ~44 KB gzip | cdnjs (cached after first load) |
| ReactDOM 18.3.1 | ~130 KB gzip | cdnjs (cached) |
| app.min.js | ~484 KB minified (built by GH Actions) | self-hosted |
| Sentry SDK (deferred) | ~35 KB gzip | sentry-cdn (deferred, off critical path) |
| Supabase JS (lazy) | ~80 KB gzip | lazy-loaded only on sign-in |

**Biggest bottleneck**: First load on cold cache — app.min.js at ~484 KB uncompressed is large. Gzip brings it to ~120–140 KB but it's still a big parse + eval hit on mid-tier Android. GitHub Pages doesn't Brotli-compress by default; Cloudflare CDN in front would.

**Venue photo cold-load**: 407 venues × 1 photo = up to 407 img requests on first Explore scroll. All cards correctly use `loading="lazy"` ✅. No hero image is `fetchpriority="high"` — the first visible card photo is low-priority. **Minor P3**: add `fetchpriority="high"` to the first hero card img.

**Weather batch**: 407 venues batched 50/2s = ~16.3 seconds of sequential fetches for a cold cache full scan. This is the dominant UX latency — skeleton states help but it's real.

---

## 6. OG Image — P2 (Launch Blocker for Social Sharing)

```html
<!-- dist/index.html:14 and index.html -->
<meta property="og:image" content="" />
<meta name="twitter:image" content="" />
```

Empty string. Every Reddit/HN/Twitter share will show a blank preview card — no image, just the description text. This is a direct conversion killer for the social launch.

**Fix** (5 minutes — just needs a hosted image URL):

```html
<!-- Use one of the new App Store screenshots committed in af25afb: -->
<meta property="og:image" content="https://j1mmychu.github.io/peakly/og-image.jpg" />
<meta name="twitter:image" content="https://j1mmychu.github.io/peakly/og-image.jpg" />
```

Export `app-store/screenshots/01-home.png` as a 1200×630 JPEG, add it to the repo root as `og-image.jpg`, update both `index.html` and `dist/index.html` (build-web.mjs doesn't currently strip this meta tag so it'll carry through to the GitHub Pages build). **Do this before any Reddit post.**

---

## 7. BASE_PRICES Coverage

15 airports covered: YVR JFK LAX SFO ORD MIA SEA BOS ATL DEN DFW LAS PHX MSP DTW.

407 venues span significantly more airports. The yesterday report called this 100% — **that was wrong** (previous report confused "all 165 venue APs present in AIRPORT_COORDS" with "all in BASE_PRICES"). AIRPORT_COORDS and BASE_PRICES are separate lookups. Venues without a BASE_PRICES entry get `null` from `getTypicalPrice`, which means no `~$X` estimate on the card at all — they show nothing until a live fare arrives.

Count of airports actually in BASE_PRICES: **15**. This is a real gap.

**Top missing airports to add** (check VENUES for frequency):
- CUN (Cancun — many beach venues)
- BOB (Bora Bora)  
- AUA (Aruba)
- STT (St Thomas)
- SXM (St Maarten)
- GRU (São Paulo — South American ski venues)
- ZRH (Zurich — Alps venues)
- GVA (Geneva — Alps venues)

Adding these 8 covers the highest-frequency missing destinations. Estimated time: 30 minutes to research median round-trip prices and paste into `BASE_PRICES`.

---

## 8. Zombie Branches — Unchanged (Day 120+)

18 stale remote branches, all unmerged and inactive since May 2026:

```
claude/analyze-test-coverage-WVIsT    (2026-05-13)
claude/code-review-cleanup-HjoCS      (2026-05-13)
claude/condense-alert-page-jzdLo      (2026-05-13)
claude/enhance-loading-screen-rZ1dc   (2026-05-13)
claude/fix-app-jsx-content            (2026-06-23)
claude/implement-todo-lNL7W           (2026-05-13)
claude/improve-peakly-ui-UHCHG        (2026-05-13)
claude/improve-scoring-system-XYGY6   (2026-05-13)
claude/product-reliability-assessment-w0poL (2026-07-23)
claude/redesign-front-page-EndKs      (2026-05-13)
claude/review-peakly-ux-UQ0Qu         (2026-05-13)
claude/simplify-alerts-page-2ejGB     (2026-05-13)
claude/simplify-profile-page-Bi2Tc    (2026-05-13)
claude/standardize-venue-data-CufiQ   (2026-05-13)
claude/streamline-onboarding-account-97XRR (2026-05-13)
fix-appjsx-final                      (2026-05-13)
restore-appjsx                        (2026-05-13)
test-small                            (2026-05-13)
```

These are noise on every `git fetch`. Jack only: 2-minute cleanup:
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

## 9. Cost Estimate

| Tier | Monthly Cost | Bottleneck |
|------|-------------|-----------|
| Current (<10 MAU) | **$6/month** | DO 1GB droplet + GH Pages + Supabase free |
| 1K MAU | **$6/month** | GH Pages handles static; proxy handles weather cache |
| 10K MAU | **$24–43/month** | DO 2GB ($12) + Supabase Pro ($25) if DB >500MB or bandwidth >5GB |
| 100K MAU | **$65–130/month** | DO 4GB ($24) + Supabase Pro ($25) + potential Cloudflare Workers |

No cost changes since last report. Open-Meteo free tier (10K calls/day) is the risk at scale — VPS proxy cache is the mitigation (deployed in code, NOT yet on VPS until #19 redeploy).

---

## Priority Queue

| Priority | Item | Time | Blocker? |
|----------|------|------|---------|
| P1 | **Fix build-ios.mjs output dir** — separate iOS from web dist | 10 min | Confuses local dev |
| P1 | **VPS redeploy (#19/#21/#23)** — 6-week-old proxy.js live | 5 min SSH | Two-weekend scoring, iOS native, alert deletion |
| P2 | **OG image** — empty meta tag kills social sharing | 5 min | Direct Reddit launch blocker |
| P2 | **BASE_PRICES backfill** — 8 high-freq airports missing | 30 min | Deal score completeness |
| P2 | **CLAUDE.md VENUES count** — says 395, actual is 407 | 1 min | Agent false alarms |
| P3 | **Zombie branch cleanup** (18 branches) | 2 min | Cosmetic |
| P3 | **fetchpriority="high"** on hero card first img | 5 min | LCP micro-improvement |

---

## What Breaks First at Scale

The VPS proxy's **in-memory weather cache** is still the primary failure mode at traffic spikes. A single `pm2 restart` (or OOM crash on the 1GB droplet) wipes `_wxCache` and exposes all simultaneous users to direct Open-Meteo calls. At 100 concurrent users on a Reddit spike, that's ~40K+ Open-Meteo calls/hour against a 10K/day free-tier ceiling — the ceiling blows in under 15 minutes. The disk cache fix (`wx-cache.json`) is committed in `server/proxy.js` and survives restarts — but it's NOT on the live VPS (still running the Aug 11 build). VPS redeploy = disk cache live = this failure mode closed. Every day #19 waits is another day one `pm2 restart` can take down weather data for every user simultaneously.

Second thing to break: `dist/` state. If `build-ios.mjs` is run locally before a push, it poisons dist/ with iOS artifacts. GitHub Actions overwrites it, but the window between `git push` and Actions completing serves garbage. Fix is the build-ios.mjs output dir change above.
