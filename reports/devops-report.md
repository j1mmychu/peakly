# DevOps Report — 2026-09-14 (YELLOW → improving)

**Status: 🟡 YELLOW — dist/ build collision persists (Day 5, same state as yesterday). VPS Day 34 still undeployed. New code commit TODAY (`bb3ebc8`) — venue search shipped, semantic dup deleted. BASE_PRICES coverage gap (Open #22) is now CLOSED — full 152/152 venue airports covered.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## What Changed Since Yesterday (Sep 13)

- **1 code commit today: `bb3ebc8`** — inline venue search shipped above category pills in ExploreTab. Semantic dup `san-vito-lo-capo-t21` deleted. CLAUDE.md venue count corrected (395→404). Braces: 5682/5682 ✅
- **Venue count**: **404** (134 skiing / 270 beach) — confirmed via direct line-range grep, matches commit message.
- **lateSeason**: **15 venues** — confirmed via grep. CLAUDE.md now current.
- **Cache stamp**: `20260910a` — now 4 days stale. The `bb3ebc8` commit touched `app.jsx` (new feature) but did NOT bump `PEAKLY_BUILD`. This means users cached on `20260910a` will NOT get the inline search feature served from SW cache. **This is a P1 — see below.**
- **BASE_PRICES**: **ALL 152 venue airports now covered** (181 entries total, 29 extra for non-venue airports). Open #22 is CLOSED. This is a meaningful improvement from the 57% coverage cited 3 weeks ago.
- **App Store screenshots**: 3 new screenshots committed (`01-home.png`, `02-detail.png`, `03-grid.png`). Total: 7 screenshots in `app-store/screenshots/`. Sizes 744KB–1.5MB — acceptable for App Store submission.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,237** |
| app.jsx bytes | **758,944** (~741 KB unminified) |
| Braces balanced | ✅ 5682/5682 |
| dist/app.min.js | ❌ MISSING from git (Day 5 iOS artifact collision — see P1 below) |
| Cache stamp | `20260910a` — **4 days stale** after today's app.jsx feature commit |
| Cache stamp lockstep | ❌ `app.jsx` was modified without bumping PEAKLY_BUILD/sw.js |
| Plausible analytics | ✅ `index.html:32` — `<script defer>` present, domain `j1mmychu.github.io/peakly` |
| Plausible in dist/ | ⚠️ Comment stub only, no script tag (iOS artifact collision) |
| Sentry DSN | ✅ Active — `9416b032...` at `app.jsx:8` + `index.html:77` |
| React CDN | ✅ 18.3.1 via cdnjs.cloudflare.com (pinned) |
| Babel CDN | ✅ 7.24.7 — stripped in prod by build-web.mjs |
| SRI on CDN scripts | ⚠️ None — `crossorigin` present but no `integrity=` hashes (Open #10, medium risk) |
| Images lazy-loaded | ✅ All 9 `<img>` sites use `loading="lazy"` |
| VENUES | ✅ **404** (134 ski / 270 beach) |
| Duplicate IDs | ✅ 0 (boot-time IIFE validator active) |
| lateSeason venues | ✅ **15** |
| BASE_PRICES coverage | ✅ **152/152 venue airports** — Open #22 CLOSED |

---

## 2. P1 — Cache Stamp Not Bumped After Feature Commit (NEW TODAY)

**This is a new issue created by today's `bb3ebc8` commit.**

`bb3ebc8` added inline venue search to `app.jsx` — a visible feature change — but `PEAKLY_BUILD` in `app.jsx` and `CACHE_NAME` in `sw.js` were NOT bumped. Both still read `20260910a` (4 days old).

**Impact:** Any user whose browser has the app cached from the last service worker install will NOT see the new inline search feature until their SW naturally expires (can take days). The service worker serves the old `app.jsx` from cache. The fix is a one-line bump to both files — the `auto-push.sh` hook was supposed to catch this but the feature commit bypassed or didn't trigger it.

**Fix (exact commands):**
```bash
cd ~/peakly

# Bump PEAKLY_BUILD in app.jsx
TODAY=$(date +%Y%m%d)
perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx

# Bump CACHE_NAME in sw.js in lockstep
perl -pi -e "s/const CACHE_NAME = \"peakly-[^\"]+\"/const CACHE_NAME = \"peakly-${TODAY}a\"/" sw.js

# Also bump the ?v= query param in index.html
perl -pi -e "s/app\.jsx\?v=[^\"]+/app.jsx?v=${TODAY}a/" index.html

# Commit and push
git add app.jsx sw.js index.html
git commit -m "build: bump cache stamp to ${TODAY}a after venue-search feature"
git push origin main
```
Estimated time: **2 minutes**.

---

## 3. P1 — dist/ Build Collision: Day 5 (Production Unaffected, but Polluted)

**Unchanged since Sep 10 — now Day 5.** Same analysis as yesterday.

`dist/` committed to git is the iOS vendor-bundle artifact from `scripts/build-ios.mjs`:
- `dist/index.html` references `./vendor/react.production.min.js`, `./vendor/react-dom.production.min.js`, `./vendor/leaflet.js` — none exist in git
- `dist/index.html` loads `./app.js` (line 382) — does not exist in git
- No `dist/app.min.js`
- No Plausible analytics script in dist/

**Production is fine**: GH Actions runs `node scripts/build-web.mjs` on every push and overwrites dist/ correctly before deploying. But the committed dist/ is wrong and is a time bomb.

**Why it still matters:**
1. A developer who clones + opens `dist/index.html` locally gets 4 broken loads and a blank page
2. If the GH Actions build fails mid-deploy and Pages rolls back to a previous commit, the iOS artifact could ship to prod
3. Misleads all tooling (Dependabot, security scanners) that inspects dist/

**Fix (2 commands):**
```bash
# Remove iOS vendor artifacts from git tracking entirely
# build-web.mjs regenerates correct dist/ on every GH Actions deploy
git rm -r --cached dist/
echo "dist/" >> .gitignore  # ensure .gitignore covers it (currently has "dist/" but files are tracked — force)
git add .gitignore
git commit -m "fix(build): remove iOS vendor dist/ artifact from git; GH Actions regenerates on deploy"
git push origin main
```
Estimated time: **5 minutes**.

---

## 4. Flight Proxy (VPS) — Day 34 Undeployed

**Status: Committed but not deployed. Production proxy.js on VPS is still the Aug 11 version.**

Current `server/proxy.js` in git (last code change: `c760dfb`, Sep 10) contains:
- ✅ `forecast_days=14` at both call sites
- ✅ `capacitor://localhost` in CORS allowlist (iOS native calls)
- ✅ `DELETE` in `Access-Control-Allow-Methods` (alert deletion now works)
- ✅ Rate limiter reads last X-Forwarded-For entry
- ✅ Disk cache for `_wxCache` (Open #23 CLOSED in code) — persists across pm2 restarts, saves every 5 minutes
- ✅ APNS HTTP/2 transport (`http2.connect`) + `dsaEncoding: 'ieee-p1363'` (Open #21 FIXED in code)
- ✅ Alert IDs use `crypto.randomUUID()` in `app.jsx` (Open #21 client-side fix also in)

**Still blocked on a single SSH session to copy proxy.js to VPS.** The VPS is NOT a git clone — `git pull` there fails. Manual copy required:
```bash
# From a machine with SSH access to 198.199.80.21
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Expected after: `/health` shows `apns: configured` (if APNS env vars set) or `unconfigured`, disk cache path, `forecast_days: 14`.

Estimated time: **15 minutes** (SSH session).

---

## 5. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not in client code — proxy-side only via `TRAVELPAYOUTS_TOKEN` env |
| Supabase anon key in client | ⚠️ Present at `app.jsx:26` — **this is correct behavior** for Supabase (anon key is public-safe, RLS-gated). Not a secret. |
| APNS .p8 key in client | ✅ Not present — server-side env only |
| .gitignore covers .env/.pem/.key/.p8 | ✅ All covered |
| Sentry DSN in client | ⚠️ Present at `app.jsx:8` — **this is correct** for Sentry client-side SDK (public DSN is designed to be client-visible) |
| TP_MARKER affiliate marker | ⚠️ Present at `app.jsx:6667` as `"710303"` — **this is correct**, affiliate markers are public deep-link params, not secrets |
| Recent commits with secrets | ✅ Clean — last 10 commits are reports, content, and the search feature |
| API keys / passwords | ✅ None found in app.jsx or index.html |

**No security P0s.** The Supabase anon key, Sentry DSN, and TP_MARKER are all intentionally client-visible by their respective platforms' design.

---

## 6. Performance Analysis

**JavaScript bundle breakdown (prod, loaded on first visit):**

| Asset | Size (est.) |
|-------|-------------|
| React 18.3.1 (cdnjs, cached) | ~130 KB gzipped |
| ReactDOM 18.3.1 (cdnjs, cached) | ~40 KB gzipped |
| Sentry SDK (deferred) | ~60 KB gzipped |
| app.min.js (esbuild'd, built by GH Actions) | ~200–250 KB gzipped |
| **Total first load (CDN cold)** | **~480 KB gzipped** |
| **Repeat visits (CDN warm)** | **~200–250 KB** |

Babel is eliminated in production — the 3–5s transpile wall is gone since `8ba0ca3` (June 2026). esbuild compiles `app.jsx` (~741 KB raw) → `app.min.js` on every GH Actions deploy.

**Biggest performance bottleneck:** Weather fetching — 404 venues batched in groups of 50, 2s delay between batches. At full load: ~17 fetch waves = ~32 seconds wall-clock before all venues are scored. This is by design (Open-Meteo rate limit compliance) and mitigated by the VPS weather proxy cache (when deployed). The inline search feature added today does not worsen this — it operates on already-loaded `filtered` array.

**Images:** All 9 `<img>` tags use `loading="lazy"` ✅. Venue photos are Unsplash/Wikimedia external URLs — not self-hosted, no CDN control. ~346 venues still have generic stock photos (Open #20 unchanged).

---

## 7. Cost Estimate

| Scale | Monthly Cost |
|-------|-------------|
| Current (<100 MAU) | $6/mo (DigitalOcean 1GB droplet) + $0 GitHub Pages |
| 1K MAU | $6/mo — well within 1GB RAM, Open-Meteo free tier |
| 10K MAU | $12–18/mo — DigitalOcean upgrade to 2GB recommended; Open-Meteo rate limits become real (proxy cache prevents worst case) |
| 100K MAU | $50–80/mo — multiple droplets or managed service; Open-Meteo Pro tier ($50/mo) required |

**Cost optimization opportunity (zero-cost):** The VPS weather cache (currently not deployed) eliminates ~95% of Open-Meteo calls at moderate traffic. Deploy it before any marketing push.

---

## 8. What Breaks First at Scale

At 500+ concurrent users, Open-Meteo's free tier ceiling (~200 req/min per IP) is the first thing that buckles. Without the VPS proxy cache deployed, every user hitting the app on a Reddit/HN spike fires independent weather fetches — at 404 venues × 500 users = ~200K requests in the first minute, well above the rate limit. The symptom is weather fetches returning 429s, venues scoring 50 (neutral), and the Explore grid showing flat/identical scores. The fix is already coded and committed — the VPS proxy cache with 2-hour TTL and in-flight deduplication reduces 500 users hitting the same venue to 1 upstream call. One SSH session to deploy `server/proxy.js` prevents this entire failure class.

---

## Open Items Status

| # | Item | Status |
|---|------|--------|
| 19 | VPS redeploy | ⚠️ Day 34 — code ready, needs SSH |
| 20 | ~346 venues with generic photos | Open — Jack manual task |
| 21 | APNS HTTP/2 + P1363 fix | ✅ FIXED IN CODE (both proxy.js and app.jsx) — needs VPS deploy |
| 22 | BASE_PRICES coverage | ✅ **CLOSED — 152/152 venue airports covered** |
| 23 | Weather cache disk persistence | ✅ **CLOSED IN CODE** — `_saveCacheToDisk` runs every 5 min, loads on startup — needs VPS deploy |
| — | Cache stamp stale after today's feature commit | ⚠️ **NEW P1 — needs immediate bump** |
| — | dist/ iOS artifact in git | ⚠️ P1 Day 5 — same state |

---

## Summary

| Priority | Issue | Days Open | Est. Fix Time |
|----------|-------|-----------|---------------|
| P1 | Cache stamp not bumped after venue-search commit | 0 (NEW TODAY) | 2 min |
| P1 | dist/ iOS artifact in git (production unaffected) | 5 | 5 min |
| P1 | VPS redeploy — proxy.js fixes staged 34 days | 34 | 15 min (SSH) |
| P2 | SRI hashes missing on CDN scripts | ongoing | ~1 hr |
| ✅ CLOSED | BASE_PRICES coverage gap (Open #22) | — | done |
| ✅ CLOSED (needs deploy) | APNS fix (Open #21) | — | deploy only |
| ✅ CLOSED (needs deploy) | Weather disk cache (Open #23) | — | deploy only |

**The three VPS-deployed fixes (disk cache, APNS P1363, iOS CORS, DELETE header) are all committed and waiting. One SSH session closes 4 open issues simultaneously. That's the single highest-leverage action remaining before any public launch or marketing push.**
