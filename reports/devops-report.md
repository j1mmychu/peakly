# DevOps Report — 2026-11-22 (RED)

**Status: 🔴 RED — VPS Day 103 undeployed (counter resets from confirmed 2026-08-11 health check). Cache stamp 22 days stale (code freeze, correct — no action). App Review MISSED +9 days. Whistler open Day 2 — peak ski season active. `fix-appjsx-final` rollback bomb Day 23. 20 stale remote branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 21)

| Item | Nov 21 | Nov 22 (today) |
|------|--------|----------------|
| VPS status | Day 105 | 🚨 **Day 103 (re-anchored from 2026-08-11 confirmed healthy)** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (21d) | 🚨 **`20261031a` — 22 days stale (code freeze, correct)** |
| App Review hard stop | MISSED +8 days | 🚨 **MISSED +9 days** |
| Whistler status | Opened Nov 21 | 🏔️ **Day 2 open — Thanksgiving 4 days out** |
| `fix-appjsx-final` | Rollback bomb Day 22 | **Day 23 — 647 commits ahead of main** |
| `master` footgun | Day 45 | **Day 46 — 561 commits ahead of main** |
| New app.jsx commits | 0 (21d) | **0 — 22 days no code commits (last: 2026-10-31)** |
| Venue count (ID regex) | 404 | ✅ **404 unique IDs (134 skiing / 270 beach)** |
| `.venue-baseline` | 404 | ✅ **404 — matches** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| `lateSeason` venues | 15 | ✅ **15** |
| Remote branches (stale) | 20 | **20 stale — no change** |
| Plausible analytics | ✅ | ✅ present, uncommented, `defer` |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ affiliate only | ⚠️ same — `710303` is public affiliate marker, not secret |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |
| Image lazy loading | ✅ 9 tags | ✅ 9 `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |
| PR #21 | merged | ✅ **phone-only TestFlight + listing workflow live** |
| `docs/APP_REVIEW_NOTES_SHORT.txt` | new | ✅ **paste-ready reply exists, barrier to respond = zero** |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero lines changed since Oct 31 — code freeze Day 22.

**Cache stamp:** `20261031a` — 22 days stale. Code freeze means no push means no auto-bump. This is correct. The stamp matches the deployed code version. No action.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips Babel in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`)
- Sentry → sentry-cdn.com ✅ (DSN live)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js` (~440 KB minified, Babel stripped). No changes since Oct 31. `dist/index.html` served by GitHub Pages.

**Venue count:** 404 unique IDs (regex-verified), matches `.venue-baseline`. 134 skiing / 270 beach. Braces 5684/5684 ✅. 15 `lateSeason: true` ✅.

---

## 2. FLIGHT PROXY STATUS

**URL:** `const FLIGHT_PROXY = "https://peakly-api.duckdns.org"` — HTTPS ✅, no raw IP.

**VPS:** Day 103 without redeploy. Last confirmed healthy: 2026-08-11. The committed `server/proxy.js` changes are correct and complete — they're just sitting in git, not on disk at `/opt/peakly-proxy`. The 4 live breakages:

1. `forecast_days:14` — VPS currently serves 7-day data to the two-weekend scorer, silently disabling the second weekend pick
2. `capacitor://localhost` CORS missing — iOS native GET requests blocked outright
3. `DELETE` method missing from CORS allow-methods — alert deletion silently fails
4. Rate-limiter reads `xff.split(',')[0]` on live server vs the committed fix (`xff.split(',').pop()`) — forgeable, _rateMap balloon risk

**All 4 are fixed in committed `server/proxy.js`. Deploy = `cp` + `pm2 restart`.**

```bash
# From Jack's machine — entire VPS redeploy in one SSH session
ssh root@198.199.80.21 "
  cd /opt/peakly-proxy
  # Backup current
  cp proxy.js proxy.js.bak.$(date +%Y%m%d)
  # Copy the fixed file (run scp first from your machine)
"
# From your machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

**Travelpayouts token:** Server-side only via `process.env.TRAVELPAYOUTS_TOKEN`. Client-side only exposes `TP_MARKER = "710303"` (public affiliate marker — not a secret). ✅

**Timeout/fallback:** `fetchTravelpayoutsPrice` uses 4s timeout with direct Open-Meteo fallback. Sound.

---

## 3. WEATHER & EXTERNAL API

**Open-Meteo:** Direct calls to `api.open-meteo.com/v1` (weather) and `marine-api.open-meteo.com/v1` (marine). VPS proxy committed but not deployed — every client still hits Open-Meteo directly.

**Rate limit math at scale:**
- 404 venues × 1 weather call = 404 upstream requests per cold-cache cycle
- 270 beach venues × 1 marine call = 270 upstream requests
- Full cold-cache = 674 upstream calls
- Open-Meteo free tier: 10,000 requests/day
- **50 concurrent cold-caching users = 33,700 calls = 3.4× daily free-tier limit in one burst**
- Reddit/HN spike without VPS cache = rate-limiting within seconds, degraded weather for all users

**Current exposure:** No VPS cache deployed. This is the documented pre-traffic gate from Open #19/#23. Nothing changes today — the risk is known. Ship App Review → then VPS redeploy.

---

## 4. SECURITY AUDIT

**Supabase anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` exposed in `app.jsx:26`. By design — Supabase anon keys are public-safe with RLS. ✅ Acceptable.

**Travelpayouts:** `TP_MARKER = "710303"` is a public affiliate marker, not an auth token. The actual server-side auth token is `process.env.TRAVELPAYOUTS_TOKEN` in `server/proxy.js` and never touches client code. ✅

**Sentry DSN:** `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/4511108673765376` — live and wired. DSN exposure in client code is Sentry's standard practice (rate-limited + project-scoped). ✅

**Secret scan (`git log` last 5 commits):** Only report/doc/CI changes. No tokens or keys introduced. ✅

**`.gitignore`:** Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`. ✅

**APNS status:** `server/proxy.js` wires APNS via HTTP/2 + `dsaEncoding: 'ieee-p1363'` (committed fix for the DER encoding bug). Still unconfigured — no `.p8` key installed. `app.jsx` uses `crypto.randomUUID()` for alert IDs. Neither fix deployed yet. Alert IDs are non-guessable client-side but the VPS still needs the redeploy before any of this matters.

**Clean. No exposed secrets.**

---

## 5. PERFORMANCE ANALYSIS

**JavaScript bundle (production `dist/index.html`):**
- `dist/app.min.js`: ~440 KB minified (Babel stripped via esbuild)
- React 18.3.1 UMD (cdnjs): ~130 KB gzipped
- ReactDOM 18.3.1 UMD (cdnjs): ~40 KB gzipped
- Supabase lazy-loaded: ~80 KB gzipped (only on auth flow)
- Leaflet lazy-loaded: ~40 KB gzipped (only on map view)
- **Total first-paint parse budget: ~170 KB gzipped (React + app bundle)**

**Biggest single bottleneck:** Babel Standalone (7.24.7, ~344 KB minified) loads in `index.html` for the **dev path only** — `deploy.yml` strips it from `dist/`. If anyone links directly to the `index.html` dev path (not `dist/`), they get a 3–5s parse wall on mobile. The deploy is correct; the risk is a misconfigured CDN cache accidentally serving `index.html` instead of `dist/index.html`. Not currently a problem.

**Image lazy loading:** 9 `<img>` tags use `loading="lazy"`. ✅

**CDN versions:**
- React 18.3.1: released March 2024 — not the absolute latest (18.3.1 is current stable as of Q3 2024, no breaking 18.x since). ✅
- Babel 7.24.7: released April 2024 — current in the 7.24 series. ✅

**No performance regressions since Oct 31.**

---

## 6. COST ESTIMATE

| Tier | MAU | DigitalOcean | Open-Meteo | Supabase | Total/mo |
|------|-----|-------------|------------|----------|----------|
| Now | <100 | $6 | Free | Free | **$6** |
| 1K MAU | 1,000 | $6 | Free (within limit) | Free | **$6** |
| 10K MAU | 10,000 | $12 (upgrade) | **$19/mo** | Free (500 MB) | **$31** |
| 100K MAU | 100,000 | $48 (2×$24) | **$149/mo** | $25/mo | **$222** |

**Cost optimization opportunities:**
1. VPS redeploy with disk-persistent weather cache (Open #23) — at 10K+ MAU this is the difference between $19/mo Open-Meteo and free. Same SSH session as the proxy fix.
2. At 100K MAU, the VPS becomes the bottleneck. Scale vertically first ($12 → $24 droplet) before adding horizontal nodes.
3. Supabase free tier handles 500 MB storage and 50K monthly active users. No action needed until 50K MAU.

---

## 7. STALE BRANCH BOMB STATUS

**`fix-appjsx-final` (Day 23):** 647 commits ahead of `main`, no clean merge path. This is a parallel universe built by an external tool. If `main` ever gets reset to it, Peakly loses 23 days of commits including the TestFlight CI pipeline (PR #21). The branch is not merged, not rebased, not referenced by any workflow. It's just sitting there being a footgun.

**`master` (Day 46):** 561 commits ahead of `main`. Same class of risk. `deploy.yml` deploys both `main` and `master` — a push to `master` deploys whatever is there, which is NOT current code.

**20 stale `claude/*` and `cursor/*` branches:** Abandoned exploratory branches. Zero merge risk since they were never merged. Pure noise.

**Fix (Jack — 5 minutes, not urgent but clean it up after App Review):**
```bash
# Delete the two dangerous branches remotely — confirm nothing depends on them first
git push origin --delete fix-appjsx-final
git push origin --delete restore-appjsx
git push origin --delete master
# Then bulk-delete stale claude/* and cursor/* branches
git branch -r | grep "origin/claude/\|origin/cursor/" | sed 's|origin/||' | xargs git push origin --delete
```

---

## 8. APP REVIEW BLOCKER (Day 9)

This is the only real P0 this session. The DevOps angle:

- `docs/APP_REVIEW_NOTES_SHORT.txt` exists — paste-ready reply under 4000 chars
- `.github/workflows/asc-listing.yml` exists — posts notes to App Store Connect without a Mac
- `docs/PHONE_ONLY_RELEASE.md` exists — step-by-step from a phone

**There is zero technical barrier.** The reply needs to be sent. Every day without it is a day without App Store distribution during Whistler's opening week and Thanksgiving travel planning (Nov 26, 4 days away).

---

## What Breaks First at Scale

**Open-Meteo rate ceiling kills weather for everyone on first Reddit post.** The free tier is 10,000 requests/day. With 404 venues, a single traffic spike of 15 cold-caching users simultaneously exhausts the daily quota. The VPS weather proxy with disk persistence (committed, not deployed) drops that to 1 upstream call per venue per 2 hours — a 50× reduction in upstream load. Without it, the app degrades gracefully (venues render with score 50 and estimated fares) but conditions data goes dark until the next day's quota resets. That's not a crash but it is exactly the wrong experience to deliver to the spike cohort that could become your first 1,000 users. VPS redeploy = $0 cost = 30-minute SSH session. This is the highest-ROI infrastructure action available.

---

## Priority Summary

| Priority | Item | Fix time | Blocker? |
|----------|------|----------|----------|
| **P0** | Reply to App Review (Guideline 2.1, Day 9) | 15 min | Yes — no App Store until done |
| **P1** | VPS redeploy (`scp proxy.js` + `pm2 restart`) | 30 min | Pre-traffic gate |
| **P1** | Disk weather cache on VPS (bundled with above) | 30 min | Pre-traffic gate |
| **P2** | Delete `fix-appjsx-final` + `master` + stale branches | 5 min | No — just hygiene |
| **P2** | BASE_PRICES gap (100 airports missing) | 2 hr | No — degrades deal scores only |
| **P3** | APNS wiring (HTTP/2 + P1363 fixes committed) | 2 hr | No — web product unaffected |
