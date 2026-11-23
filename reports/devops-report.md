# DevOps Report — 2026-11-23 (RED)

**Status: 🔴 RED — VPS Day 104 undeployed (anchor: 2026-08-11 confirmed healthy). Cache stamp 23 days stale (code freeze, correct — no action). App Review MISSED +10 days. Whistler open Day 3 — peak Thanksgiving ski season. `fix-appjsx-final` rollback bomb Day 24. 20 stale remote branches. BASE_PRICES: CLOSED (186 airports, 0 venue APs missing — full coverage confirmed).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 22)

| Item | Nov 22 | Nov 23 (today) |
|------|--------|----------------|
| VPS status | Day 103 | 🚨 **Day 104** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (22d) | 🚨 **`20261031a` — 23 days stale (code freeze, correct)** |
| App Review hard stop | MISSED +9 days | 🚨 **MISSED +10 days** |
| Whistler status | Day 2 open | 🏔️ **Day 3 open — Thanksgiving 3 days out (Nov 26)** |
| `fix-appjsx-final` | Rollback bomb Day 23, 647 commits ahead | **Day 24 — 597 commits ahead** |
| `master` footgun | 561 commits ahead | **511 commits ahead** |
| New app.jsx commits | 0 (22d) | **0 — 23 days no code commits (last: 2026-10-31)** |
| Venue count | 404 (134 skiing / 270 beach) | ✅ **404 — 134 skiing / 270 beach (both formats counted)** |
| `.venue-baseline` | 404 | ✅ **404 — matches** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| `lateSeason` venues | 15 | ✅ **15 (confirmed grep)** |
| Remote branches (stale) | 20 | **20 stale — no change** |
| Plausible analytics | ✅ | ✅ present, uncommented, `defer` |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ affiliate only | ⚠️ same — `710303` is public affiliate marker, not secret |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |
| Image lazy loading | ✅ | ✅ 9+ `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |
| **BASE_PRICES coverage** | ⚠️ 100 airports missing (PM v99 2026-07-25) | ✅ **CLOSED — 186 airports, 0 venue APs missing. Full coverage.** |
| APNS (server/proxy.js) | ✅ HTTP/2 + P1363 committed | ✅ http2 module + dsaEncoding ieee-p1363 confirmed in proxy.js |
| Alert IDs | ✅ randomUUID | ✅ crypto.randomUUID() with fallback live in app.jsx |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero lines changed since Oct 31 — code freeze Day 23.

**Cache stamp:** `20261031a` — 23 days stale. Code freeze means no push means no auto-bump. This is correct. The stamp matches the deployed code version. No action needed.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips Babel in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`)
- Sentry → sentry-cdn.com ✅ (DSN `9416b032a46681d74645b056fcb08eb7` live)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js` (~440 KB minified, Babel stripped). No changes since Oct 31. `dist/index.html` served by GitHub Pages — no Babel in production path.

**Image lazy loading:** ✅ All venue images use `loading="lazy"` — ListingCard, FeaturedCard, CompactCard, detail sheet.

---

## 2. FLIGHT PROXY STATUS

**Proxy URL:** `https://peakly-api.duckdns.org` — HTTPS. No HTTP exposure in client code. ✅

**TP_MARKER `710303`** is an affiliate marker visible in the client — this is acceptable. The actual Travelpayouts token lives server-side only, confirmed by comment at app.jsx:6354. ✅

**Proxy timeout/fallback:** `fetchTravelpayoutsPrice` correctly has fallback to BASE_PRICES estimates. ✅

**VPS status:** Cannot verify from sandbox (network egress blocked). Last confirmed healthy 2026-08-11 post-redeploy. No new reports of outages. 104 days since the last server-side change to proxy.js was deployed.

---

## 3. WEATHER & EXTERNAL API

**Open-Meteo usage:**
- `forecast_days=14` for weather, `forecast_days=10` for marine — both correct (committed in proxy.js, awaiting VPS redeploy to take effect)
- Batch size 100, throttle 500ms, first-paint tier of 12 venues
- 2hr localStorage cache per coord; proxy adds shared server-side cache
- VPS proxy cache is in-memory — a pm2 restart wipes it (Open #23, still unresolved per CLAUDE.md)

**Rate limit math at scale:**
- 404 venues, 404 unique weather coords (approx), batched 100 at a time with 500ms between
- Cold browser: 404 direct Open-Meteo calls if proxy is down
- With VPS cache: ~12 cold upstream calls per 2hr window per coord set
- Open-Meteo free tier: 10,000 calls/day = 416/hr headroom
- **Risk threshold:** ~3 simultaneous users with cold caches = 1,212 calls = rate limit hit in <2 hours
- VPS cache disk persistence (Open #23) is the fix. Still undeployed.

---

## 4. SECURITY AUDIT

**Secrets scan:**
- No Travelpayouts token in client code ✅
- Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` — this is the **anon key**, public-safe by design, RLS-gated. Acceptable per architecture decision. ✅
- TP_MARKER `710303` is public affiliate ID, not a secret ✅
- No .p8, .pem, .key files in repo (.gitignore covers them) ✅
- No .env files committed ✅

**Git log — no secret commits in recent history.** All 23 days of recent commits are daily agent reports only (DevOps/PM/Content). ✅

**Sentry DSN:** Live and present in index.html. ✅

**APNS security:**
- HTTP/2 transport: ✅ `const http2 = require('http2')` committed in proxy.js
- JWT encoding: ✅ `dsaEncoding: 'ieee-p1363'` committed in proxy.js
- Alert IDs: ✅ `crypto.randomUUID()` with fallback live in app.jsx
- **These fixes are committed but NOT deployed** (VPS is not a git clone; proxy.js must be manually copied to `/opt/peakly-proxy`). They will not protect until Jack does the deploy.

---

## 5. PERFORMANCE ANALYSIS

**JavaScript bundle (production):**
- `dist/app.min.js`: ~440 KB (esbuild output — Babel stripped)
- React 18.3.1 UMD (cdnjs): ~135 KB gzipped
- ReactDOM 18.3.1 UMD (cdnjs): ~40 KB gzipped
- **Total JS on first load: ~615 KB gzipped, ~1.2 MB uncompressed**
- Supabase library: lazy-loaded ~80 KB gzipped (only on sign-in path)

**Biggest performance bottleneck:**
Weather fetching. 404 venues × 2 API calls each (weather + marine for beach) = up to 808 concurrent fetch calls on a cold start, even with the batching. The 2hr localStorage cache saves repeat visitors, but every new user pays this cold-start cost. The VPS proxy cache (Open #19/23) is the structural fix — one upstream call per coord serves all users. Until deployed, every new user is a direct Open-Meteo customer.

**Images:** All venue images are remote URLs (Unsplash CDN + Wikipedia). No `fetchpriority="high"` on above-fold hero images. Minor improvement opportunity: add `fetchpriority="high"` to the first 2–3 hero card images.

---

## 6. COST ESTIMATE

| MAU | Open-Meteo calls/day | DigitalOcean VPS | GitHub Pages | Total/month |
|-----|---------------------|------------------|--------------|-------------|
| Today (<10) | <1,000 (free tier) | $6 | Free | **$6** |
| 1K MAU | ~50K/day (proxy cache saves 95%+) | $6 | Free | **$6** |
| 10K MAU | ~500K/day — **FREE TIER BREACH** | $12 (2GB RAM) | Free | **$12 + Open-Meteo paid tier** |
| 100K MAU | ~5M/day | $48 (8GB RAM) | Free (CDN limit TBD) | **$48 + Open-Meteo pro** |

**Open-Meteo free tier:** 10,000 calls/day. Without VPS cache deployed, 10K MAU = ~5M calls/day = **$2,000+/month** on paid tier. With VPS cache deployed: ~12 upstream calls per 2hr window = well within free tier at any MAU.

**Cost optimization opportunities:**
1. Deploy the VPS cache (Open #19/#23) — single biggest lever, turns $2K/mo into $0 for weather
2. GitHub Actions minutes: ~20 per deploy, well within free tier
3. Supabase free tier (500MB, 50K monthly active users) — sufficient through 10K MAU

---

## Issues

| Priority | Issue | Fix Time | Launch Blocker? |
|----------|-------|----------|-----------------|
| **P0** | App Review MISSED +10 days — no reply sent | 15 min | **YES** |
| **P1** | VPS redeploy (Day 104) — proxy.js fixes committed but inert | 20 min SSH | No — web product runs; iOS native + alert deletion broken |
| **P1** | VPS weather cache disk persistence (Open #23) — in-memory cache wiped on restart | 30 min SSH | No — degrades at scale |
| **P2** | 20 stale remote branches — `fix-appjsx-final` (597 commits ahead), `master` (511 ahead), 18 claude/cursor branches | 5 min | No |
| **P3** | APNS wiring (commits exist, needs deploy + .p8 config) | Jack-only manual steps | No — web unaffected |

---

## P0: App Review Response

**Still unresponded — 10 days since MISSED status.** `docs/APP_REVIEW_NOTES_SHORT.txt` has the paste-ready reply. `docs/APP_REVIEW_NOTES.md` has full context.

**Action:** Jack opens App Store Connect → Resolution Center → paste the reply from `docs/APP_REVIEW_NOTES_SHORT.txt`. 15 minutes max.

---

## P1: VPS Redeploy

**Day 104 since fixes were committed.** The following are live in `server/proxy.js` on main but NOT running on the VPS at `/opt/peakly-proxy`:
- `forecast_days=14` (was 7 — two-weekend scoring was silently disabled)
- `capacitor://localhost` in CORS (iOS native calls were blocked outright)
- `DELETE` in `Access-Control-Allow-Methods` (alert deletion never worked — preflight blocked)
- Rate limiter reads last X-Forwarded-For entry (IP spoofing was possible)
- HTTP/2 APNs transport (`http2.connect`)
- JWT `dsaEncoding: 'ieee-p1363'`
- Disk cache persistence for weather (Open #23)

**Fix (Jack — 20 min SSH):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# NOT a git clone — manual copy required
# From your local machine:
# scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
# Verify: forecast_days:14 response, apns:configured, uptime resets to seconds
```

---

## P2: Stale Branch Cleanup

**`fix-appjsx-final` (597 commits ahead):** A parallel universe built by an external tool. If `main` is ever reset to it, Peakly loses all commits since ~June. No clean merge path.

**`master` (511 commits ahead):** `deploy.yml` deploys both `main` AND `master`. A push to `master` deploys whatever is there, which is NOT current code. This is a live deploy footgun.

**Fix (Jack — 5 min, after App Review resolves):**
```bash
git push origin --delete fix-appjsx-final
git push origin --delete restore-appjsx
git push origin --delete master
git push origin --delete test-small
git branch -r | grep "origin/claude/\|origin/cursor/" | sed 's|  origin/||' | xargs git push origin --delete
```

---

## BASE_PRICES: CLOSED

**Previous finding (PM v99, 2026-07-25): "100 of 146 venue airports missing."**

**Today's audit result: 0 missing.** All 152 unique venue `ap` codes are covered by BASE_PRICES (186 entries total). The gap was filled in one of the app.jsx commits before the Oct 31 freeze. This finding should be removed from the Open issues list.

---

## What Breaks First at Scale

The single failure mode that kills Peakly at Reddit-launch scale is not the VPS or the GitHub Pages CDN — it's Open-Meteo rate limiting. Without the VPS weather cache deployed, every new unique user triggers 404–808 direct API calls against Open-Meteo's free tier (10K calls/day). Ten simultaneous new users on a cold cache = 8,080 calls = you've burned 80% of the daily quota in one minute. After that, weather fetches fail silently, venues render with score 50 and no conditions data, and users bounce. The fix is a 20-minute SSH session to deploy what's already committed. The window to do it is right now, before the Thanksgiving spike (3 days out) and before an App Store approval sends a burst of organic iOS users. Every day this sits undeployed is a day the Reddit launch is one unlucky traffic spike away from a dead Explore tab.
