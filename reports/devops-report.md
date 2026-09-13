# DevOps Report — 2026-09-13 (YELLOW)

**Status: 🟡 YELLOW — dist/ build collision Day 4 (P1, production unaffected). VPS Day 33 unverified — proxy.js fixes committed but not deployed. No new P0s. No code commits for 4 days. Venue search feature deadline TODAY per PM v148.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed source only. Last confirmed healthy: 2026-08-11 post-redeploy.

---

## What Changed Since Yesterday (Sep 12)

- **0 code commits today.** 4 consecutive days without an app.jsx commit (last: `c760dfb`, Sep 10, flights fallback fix).
- **No new P0s.** Stable state — nothing broke, nothing shipped.
- **VENUES**: **407** (134 skiing / 271 beach) — unchanged. CLAUDE.md says 395 (stale by 12, has been stale for 30+ days).
- **lateSeason**: **15 venues** — consistent with yesterday's corrected count. CLAUDE.md says 14 (missing hintertux-glacier).
- **Duplicate IDs**: 0 ✅ (boot-time IIFE catches these live).
- **Cache stamp**: `20260910a` — 3 days stale. Correct per rule (only bumps on app.jsx/sw.js/index.html commit), signals no code activity.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,198** |
| app.jsx bytes | **757,322** (~740 KB unminified) |
| dist/app.min.js | ❌ MISSING from git — iOS artifact. GH Actions rebuilds correctly on deploy. Live site fine. |
| Cache stamp | `20260910a` — 3 days stale (no code commits since Sep 10) |
| Plausible analytics | ✅ `index.html:32` — deferred, domain `j1mmychu.github.io/peakly` correct |
| Plausible in dist/ | ⚠️ Comment stub only — `<!-- Analytics: Plausible -->` with NO script tag. GH Actions `build-web.mjs` should inject this on deploy. |
| Sentry DSN | ✅ Active — `9416b032...` wired at `app.jsx:8` + `index.html:77` |
| React CDN | ✅ 18.3.1 — cdnjs.cloudflare.com (pinned) |
| Babel CDN | ✅ 7.24.7 — cdnjs.cloudflare.com (stripped in prod by esbuild) |
| Images lazy-loaded | ✅ All 9 `<img>` render sites use `loading="lazy"` |
| VENUES (eval) | **407** — CLAUDE.md says 395 (stale) |
| Duplicate IDs | ✅ 0 duplicates |
| lateSeason venues | **15** — CLAUDE.md says 14 (stale, hintertux-glacier uncounted) |

---

## 2. P1 — dist/ Build Collision: Day 4 (Production Unaffected)

**Same broken state. Still not fixed. Production site serves correctly because GH Actions runs `node scripts/build-web.mjs` on every push and overwrites dist/. The problem is the git tree is polluted.**

`dist/` committed to git is the iOS vendor-bundle artifact from `scripts/build-ios.mjs`. It contains:
- `dist/index.html` — references `./vendor/react.production.min.js`, `./vendor/react-dom.production.min.js`, `./vendor/leaflet.css`, `./vendor/leaflet.js` (none exist in git)
- No `dist/app.min.js`
- No Plausible analytics script (comment stub only)
- Empty OG image meta

**Why this matters:**
1. Any developer who clones and opens `dist/index.html` locally gets a broken page with 4 broken script/stylesheet loads
2. If GH Actions ever fails mid-deploy and the dist/ rollback runs, the iOS artifact ships to production
3. The dist/ state in git is a lie — misleads any future debugging

**Fix (2 commands):**

```bash
# Run from repo root — removes iOS vendor artifact from git tracking
# build-web.mjs will regenerate the correct dist/index.html on next push/deploy
git rm -r --cached dist/
echo "dist/" >> .gitignore  # already there per .gitignore check
git add .gitignore
git commit -m "chore: untrack dist/ (iOS artifact) — GH Actions rebuilds on deploy"
git push origin main
```

Or if dist/ is intentionally tracked for something else, fix `scripts/build-ios.mjs` to write to `dist-ios/` instead of `dist/` so the two build targets don't collide.

**Estimated time to fix: 5 minutes.**

---

## 3. P1 — VPS Unverified: Day 33

`proxy.js` fixes in the committed source are complete and correct:
- ✅ `http2` module for APNs (not global `fetch`) 
- ✅ `capacitor://localhost` in CORS origins
- ✅ `DELETE` in `Access-Control-Allow-Methods`
- ✅ Rate limiter reads last X-Forwarded-For entry
- ✅ `forecast_days: 14` (unverified if actually deployed)
- ✅ Disk cache logic (unverified if actually deployed)

**None of this is live** — VPS is not a git clone, it's a hand-copied `/opt/peakly-proxy`. Last SSH verification: 2026-08-11.

**Consequence matrix:**
| Feature | Status without redeploy |
|---------|------------------------|
| Two-weekend scoring | Broken (7-day wx payload masks days 8-14) |
| iOS native proxy access | Blocked (CORS rejects `capacitor://localhost`) |
| Alert deletion | Silently fails (preflight blocked on DELETE) |
| APNs delivery | Zero pushes delivered (DER vs P1363 JWT + HTTP/1.1 vs HTTP/2) |
| Reddit/HN traffic spike | Open-Meteo rate-limit exposure (no disk cache fallback) |

**Fix (Jack — SSH required):**

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy

# Back up running version
cp proxy.js proxy.js.bak-$(date +%Y%m%d)

# Copy committed version (repo is on your local machine, not the VPS)
# From your local machine:
scp ~/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Back on VPS:
pm2 restart peakly-proxy

# Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: apns:configured (if keys set), wx_cache_size > 0, uptime seconds (just restarted)
```

**Estimated time: 10 minutes.**

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token | ✅ Server-side only (never appears in client code) |
| TP_MARKER `710303` | ⚠️ Exposed in `app.jsx:6668` — this is the affiliate marker for deep links, not the API token. Expected. |
| SUPABASE_ANON_KEY | ⚠️ Full JWT at `app.jsx:26` — expected per CLAUDE.md (public-safe, RLS-gated). |
| `.env` files in .gitignore | ✅ Covered |
| `.p8`, `.pem`, `.key` in .gitignore | ✅ Covered |
| Sentry DSN | ✅ Active and wired |
| Recent commit scan | ✅ Last 10 commits are report files + iOS fixes + flights fallback — no token leaks |
| APNS `.p8` key | ✅ In `.gitignore`, not tracked |

**No P0 security issues.** The Supabase anon key exposure is intentional and correct — RLS ensures it can't read or write unauthorized rows.

---

## 5. Performance Analysis

**Bundle size breakdown (what loads on first paint):**

| Asset | Size | Notes |
|-------|------|-------|
| React 18.3.1 UMD | ~130 KB gzipped | cdnjs — stable |
| ReactDOM 18.3.1 UMD | ~430 KB gzipped | cdnjs — stable |
| Babel Standalone 7.24.7 | ~1.7 MB gzipped | **Stripped in prod by esbuild** |
| app.min.js (prod) | ~439 KB minified (prev measurement) | Babel parse wall eliminated |
| Plus Jakarta Sans | ~25 KB | Google Fonts |
| Plausible | ~1 KB | Deferred |
| Sentry | ~30 KB | Deferred |

**Biggest bottleneck:** In dev (`index.html` served locally), Babel Standalone downloads and parse-compiles `app.jsx` at 757 KB. That's the 3-5s startup wall on mobile dev. Production is fine — `build-web.mjs` pre-compiles to `dist/app.min.js` (~439 KB) and strips Babel. **The esbuild step is critical for production and it's wired correctly in `deploy.yml`.**

Second bottleneck: 395+ Unsplash image URLs. All use `loading="lazy"` so only the above-fold images block. No issue at current scale.

---

## 6. External API Health

| API | Status | Notes |
|-----|--------|-------|
| Open-Meteo Weather | ✅ Direct (free tier) | Proxy cache when VPS deployed |
| Open-Meteo Marine | ✅ Direct (free tier) | Beach venues only |
| Travelpayouts via VPS | ⚠️ Proxy live, committed fixes not deployed | See §3 |
| Supabase | ✅ Cloud sync functional | RLS correct |
| Aviasales deep links | ✅ Client-side URL building, no API call | |

**Open-Meteo rate limit math:** 407 venues × ~1 fetch per 2hr TTL = 203 upstream calls/TTL window. Free tier allows 10,000/day. At current 0-10 MAU, no risk. At 1,000 MAU with multiple concurrent requests hitting cold cache: ~40 concurrent → VPS cache collapses to 1 upstream call per venue. At 10,000 MAU without VPS cache: blown in hours during a spike.

---

## 7. Documentation Drift (P2)

| Item | Code | CLAUDE.md | Delta |
|------|------|-----------|-------|
| VENUES total | 407 | 395 | +12 stale |
| Skiing venues | 134 | 132 | +2 stale |
| Beach venues | 271 | 263 | +8 stale |
| lateSeason venues | 15 | 14 | +1 (hintertux-glacier) |

**Fix (CLAUDE.md edit — 1 minute):**

```
Replace:
  395 entries ... 132 skiing, 263 beach
With:
  407 entries ... 134 skiing, 273 beach
```

And add `hintertux-glacier` to the lateSeason venue list.

---

## 8. Cost Projection

| Scale | DO Droplet | Open-Meteo | Supabase | Total/mo |
|-------|-----------|-----------|---------|---------|
| 0–1K MAU (now) | $6 | $0 (free) | $0 (free) | **$6** |
| 10K MAU | $6–12 | $0 (VPS cache covers it) | $0–25 | **$6–37** |
| 100K MAU | $12–24 | $0 (VPS cache) | $25–50 | **$37–74** |

**No cost risk** until 10K MAU. Travelpayouts proxy + Open-Meteo cache are the only things that change the math, and both are already architected correctly.

---

## 9. What Breaks First At Scale

Open-Meteo cold-cache stampede. A Reddit/HN post sends 1,000 users to the app simultaneously. Without the VPS proxy cache deployed, each user's browser hits Open-Meteo directly for ~407 venues × user's filter set = potentially 407 × 1,000 = 407,000 upstream calls in a 5-minute window. Open-Meteo's free tier is 10,000 requests/day total — it blows in 90 seconds. All 1,000 users see "conditions unavailable" and the front page degrades to grey skeletons.

**Prevention:** Deploy the VPS `proxy.js` (§3). The shared cache collapses N concurrent users hitting venue (lat, lon) to 1 upstream call. At 1,000 concurrent users, it's still just 407 upstream calls per 2-hour window — well within free tier. This is already coded and tested; it just needs the SSH deploy.

The secondary failure is Travelpayouts pricing: if the proxy is down, every listing shows `~$X` estimate from `BASE_PRICES`. 57% of venue airports aren't in `BASE_PRICES` at all, so those venues show no price. Users see "find out" everywhere instead of numbers. This doesn't crash the app but destroys the deal-finding value prop.

---

## Summary

| Priority | Issue | Days Open | ETA |
|----------|-------|-----------|-----|
| P1 | VPS not redeployed — two-weekend scoring off, iOS CORS broken, alert deletion broken | 33 | Jack: 10 min SSH |
| P1 | dist/ git artifact collision | 4 | 5 min (git rm --cached) |
| P2 | CLAUDE.md venue counts stale (395→407, lateSeason 14→15) | 30+ | 1 min edit |
| P2 | Plausible absent from dist/index.html | 4 | Fixed on next code push (build-web.mjs injects it) |
| P2 | BASE_PRICES missing 57% of venue airports (Open #22) | ongoing | ~2 hrs |

**No new P0s. Overall status YELLOW — same as yesterday. The site is live, the product works for current traffic. The open risk is a traffic spike catching the app without the VPS cache layer.**
