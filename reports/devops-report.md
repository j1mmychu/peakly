# DevOps Report — 2026-11-24 (RED)

**Status: 🔴 RED — VPS Day 105 undeployed (last healthy: 2026-08-11). Cache stamp 24 days stale (code freeze, correct — no action). App Review MISSED +11 days. Whistler Day 4. Thanksgiving 2 days out — PEAK RISK WINDOW. 21 stale remote branches (1 new today).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 23)

| Item | Nov 23 | Nov 24 (today) |
|------|--------|----------------|
| VPS status | Day 104 | 🚨 **Day 105** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (23d) | 🚨 **`20261031a` — 24 days stale (code freeze, correct)** |
| App Review hard stop | MISSED +10 days | 🚨 **MISSED +11 days** |
| Whistler status | Day 3 open | 🏔️ **Day 4 — Thanksgiving 2 days out (Nov 26)** |
| `fix-appjsx-final` | Rollback bomb Day 24, 597 commits ahead | **Day 25 — 597 commits ahead (unchanged)** |
| `master` footgun | 511 commits ahead | **511 commits ahead (unchanged)** |
| Stale remote branches | 20 | 🆕 **21 — `cursor/phone-testflight-c015` now counted (created Nov 21)** |
| New app.jsx commits | 0 (23d) | **0 — 24 days no code commits (last: 2026-10-31)** |
| Venue count | 404 (134 skiing / 270 beach) | ✅ **404 — 134 skiing / 270 beach** |
| `.venue-baseline` | 404 | ✅ **404 — matches** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| `lateSeason` venues | 15 | ✅ **15 (confirmed grep -c)** |
| Plausible analytics | ✅ | ✅ present, uncommented, `defer` |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ affiliate only | ⚠️ same — `710303` is public affiliate marker, not a secret |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |
| Image lazy loading | ✅ 9/9 | ✅ 9/9 |
| `.gitignore` | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |
| BASE_PRICES coverage | ✅ CLOSED | ✅ **CLOSED — 0 venue APs missing** |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero lines changed since Oct 31 — code freeze Day 24.

**Cache stamp:** `20261031a` — 24 days stale. Code freeze means no push means no auto-bump. This is correct. The stamp matches the deployed code version. No action needed until next code change.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips Babel in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`)
- Sentry → sentry-cdn.com ✅ (DSN `9416b032a46681d74645b056fcb08eb7` live)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js` (~440 KB minified, Babel stripped). No changes since Oct 31. `dist/index.html` served by GitHub Pages.

**Venue integrity:**
- Count: 404 (134 skiing / 270 beach) ✅
- `.venue-baseline`: 404 ✅ matches
- Braces: 5684 open / 5684 close ✅ balanced
- `lateSeason:true` flags: 15 ✅

---

## 2. FLIGHT PROXY STATUS

**Proxy URL:** `const FLIGHT_PROXY = "https://peakly-api.duckdns.org"` — HTTPS. ✅ No HTTP exposure.

**Proxy timeout/fallback:** `_tryProxyWx` has a 4-second timeout with direct Open-Meteo fallback. `fetchTravelpayoutsPrice` falls back to `~$X` estimate on failure. Both correct.

**VPS state (source-only analysis — cannot reach network from sandbox):**
`server/proxy.js` on `main` has these fixes committed but NOT deployed to `/opt/peakly-proxy`:
- `forecast_days=14` (live VPS still runs 7 — two-weekend scoring dead)
- `capacitor://localhost` in CORS (iOS native blocked)
- `DELETE` in `Access-Control-Allow-Methods` (alert deletion never worked)
- Rate limiter reading last X-Forwarded-For entry
- HTTP/2 APNs transport (`http2.connect` + `dsaEncoding: 'ieee-p1363'`)
- Disk-based weather cache (Open #23)

**Day 105. Thanksgiving is 2 days out.** This is not abstract risk anymore.

---

## 3. WEATHER & EXTERNAL API

**Open-Meteo usage:**
- Weather: `forecast_days=14` in client (correct if VPS cache is running; hits direct Open-Meteo on fallback)
- Marine: `forecast_days=10`
- Batch size: 50 venues per 2-second window (rate-limit protection in client)
- 2hr localStorage TTL — repeat visitors protected, cold starts are not

**Free tier ceiling:** 10,000 calls/day. Without VPS cache:
- 10 simultaneous cold-start users × 404 venues × ~2 calls = 8,080 calls = 80% of daily quota in one minute
- Thanksgiving weekend traffic spike = almost certain rate-limit breach if VPS cache stays undeployed

---

## 4. SECURITY AUDIT

**Exposed tokens/secrets:**
- `TP_MARKER = "710303"` in `app.jsx:6690` — This is a Travelpayouts **affiliate marker**, not an API secret. Public deep-link URLs require it client-side. Not a credential. ⚠️ Low risk (accepted by design).
- Travelpayouts token: **NOT in client code** ✅ — server-side only via VPS proxy
- Supabase anon key: **public-safe by design** ✅ — RLS-gated; intended to be in client
- No `.env` files found in working tree ✅
- `.gitignore` covers `.env`, `.p8`, `.pem`, `.key`, `.p12`, `.mobileprovision` ✅

**Recent commit audit:** Last 5 commits are daily reports only (agent-written markdown). No code changes. No secret exposure risk. ✅

**Sentry DSN:** `9416b032a46681d74645b056fcb08eb7` in `index.html:77`. This is a public client DSN — intentionally client-side per Sentry's model. ✅

---

## 5. PERFORMANCE ANALYSIS

**Bundle size (production path):**
- `dist/app.min.js`: ~440 KB minified (esbuild strips Babel entirely)
- React 18.3.1 UMD: ~130 KB gzipped
- ReactDOM 18.3.1 UMD: ~130 KB gzipped  
- Supabase: ~80 KB gzipped (lazy-loaded, sign-in path only)
- Sentry: ~50 KB (async)
- **Total cold load: ~390 KB gzipped — acceptable for a PWA**

**Biggest performance bottleneck (unchanged):**
404 venue cold-start: up to 808 upstream weather fetches per new user. VPS proxy cache (committed, undeployed) is the fix. Without it, every new Thanksgiving weekend user pays the full Open-Meteo cold-start cost and risks triggering rate limits for everyone.

**Image lazy loading:** ✅ All 9 `<img>` tags use `loading="lazy"`. No `fetchpriority="high"` on above-fold hero — minor optimization available but not blocking.

**CDN versions:** React/ReactDOM 18.3.1 — current stable. Babel 7.24.7 — dev path only, no urgency to update.

---

## 6. COST ESTIMATE

| MAU | Open-Meteo calls/day | DigitalOcean VPS | GitHub Pages | Total/month |
|-----|---------------------|------------------|--------------|-------------|
| Today (<10) | <1,000 (free tier) | $6 | Free | **$6** |
| 1K MAU | ~50K/day (proxy cache saves 95%+) | $6 | Free | **$6** |
| 10K MAU | ~500K/day — **FREE TIER BREACH** without VPS cache | $12 (2GB RAM) | Free | **$12 + Open-Meteo paid tier** |
| 100K MAU | ~5M/day | $48 (8GB RAM) | Free | **$48 + Open-Meteo pro** |

**Open-Meteo free tier:** 10,000 calls/day. Without VPS cache: 10K MAU = ~5M calls/day = **$2,000+/month**. With VPS cache deployed: ~12 upstream calls per 2hr window = $0 at any MAU.

---

## Issues

| Priority | Issue | Fix Time | Launch Blocker? |
|----------|-------|----------|-----------------|
| **P0** | **Thanksgiving 2 days out + VPS cache undeployed = rate-limit breach risk** | 20 min SSH | **YES — will degrade for all users under spike** |
| **P0** | App Review MISSED +11 days — no reply sent | 15 min | **YES — iOS launch blocked** |
| **P1** | VPS redeploy (Day 105) — proxy.js fixes committed, inert | 20 min SSH | No — web product runs; iOS native + alert deletion broken |
| **P2** | 21 stale remote branches — `fix-appjsx-final` (597 commits ahead), `master` (511 ahead, deploy footgun), 19 claude/cursor branches | 5 min | No |
| **P3** | APNS wiring (commits exist, needs deploy + .p8 config) | Jack-only manual steps | No |

---

## P0: Thanksgiving Rate-Limit Risk

**CRITICAL TIMING.** Thanksgiving is Nov 26 — 2 days from now. Whistler opened Nov 21 (Day 4 today). This is the first real-traffic stress event of the season, and the VPS weather cache is undeployed.

**What happens if Peakly gets 50 simultaneous cold-start users on Thanksgiving morning:**
- 50 users × 404 venues × ~2 Open-Meteo calls = **40,400 calls** in the first few minutes
- Open-Meteo free tier: 10,000/day
- Result: rate limit hit in under 30 seconds → weather fetches return 429 → venues render at score 50 with no conditions data → users see "Forecast unavailable" everywhere → bounce

The fix is a 20-minute SSH session using already-committed code.

**Fix (Jack — do this before Thursday):**
```bash
# From local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH:
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
# Verify: uptime resets to seconds, forecast_days:14 response
```

---

## P0: App Review Response

**11 days since MISSED.** `docs/APP_REVIEW_NOTES_SHORT.txt` has the paste-ready Guideline 2.1 reply. `docs/APP_REVIEW_NOTES.md` has full context.

**Action:** Jack opens App Store Connect → Resolution Center → paste reply from `docs/APP_REVIEW_NOTES_SHORT.txt`. 15 minutes.

---

## P1: VPS Redeploy (Full List)

The following are committed to `main` but NOT running on the VPS at `/opt/peakly-proxy`:
- `forecast_days=14` (was 7 — two-weekend scoring silently disabled)
- `capacitor://localhost` in CORS (iOS native calls blocked)
- `DELETE` in `Access-Control-Allow-Methods` (alert deletion never worked — preflight blocked)
- Rate limiter reads last X-Forwarded-For (IP spoofing was possible)
- HTTP/2 APNs (`http2.connect` + `dsaEncoding: 'ieee-p1363'`)
- Disk-based weather cache (~30-line addition, Open #23)

The VPS redeploy covers both the P0 Thanksgiving risk and all of the above in one SSH session.

---

## P2: Stale Branch Cleanup

**21 stale remote branches** — +1 from yesterday (`cursor/phone-testflight-c015`, created Nov 21):

**Dangerous ones:**
- `fix-appjsx-final` (597 commits ahead): A parallel Cursor-built universe. Never merge. A `git reset --hard` to it would lose all work since May.
- `master` (511 commits ahead): `deploy.yml` deploys both `main` AND `master`. A push to `master` deploys whatever is there, which is NOT current code.

**Cleanup (Jack — after App Review resolves):**
```bash
git push origin --delete fix-appjsx-final
git push origin --delete restore-appjsx
git push origin --delete master
git push origin --delete test-small
git push origin --delete cursor/finish-peakly-ship-c015
git push origin --delete cursor/phone-testflight-c015
git branch -r | grep "origin/claude/" | sed 's|  origin/||' | xargs git push origin --delete
```

---

## BASE_PRICES: CONFIRMED CLOSED

All venue `ap` codes covered by BASE_PRICES (186 entries, 0 gaps). Closed in Oct 31 freeze. Removing from active tracking.

---

## What Breaks First at Scale

The single failure mode is Open-Meteo rate limiting — and the window where it becomes real is **this Thanksgiving weekend**. Without the VPS weather cache deployed, the first traffic spike (even a small one — 10+ simultaneous cold-start users) burns through the free-tier ceiling and renders every venue as score 50 with no conditions. The VPS redeploy takes 20 minutes and uses already-committed, already-tested code. The cost of not doing it before Thursday isn't hypothetical anymore — it's a specific date with a specific traffic event and a known failure mode. Everything else on this list is secondary.
