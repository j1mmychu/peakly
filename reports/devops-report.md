# DevOps Report — 2026-09-24 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 46. Oct 18 launch is 24 days away. Two-weekend scoring dead, iOS native blocked, fare-fallback improvements unreachable. Code freeze holds Day 11 — zero regressions. All other systems GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health unverifiable from this environment.

---

## What Changed Since Yesterday (Sep 23)

Zero code commits to `app.jsx`, `sw.js`, or `index.html`. Three daily report commits (PM v159, Content Sep 23, DevOps Sep 23). Structurally identical to yesterday. VPS deadline passed Sep 20 (4 days ago). Stale branch count unchanged at 18. Code freeze Day 11 holding.

**New finding this run: proxy.js fare-fallback improvements are also undeployed.** The Sep 9 commit `3152c96` (`fix(proxy): fall back to nearest ±1-day weekend RT fare when no exact-Friday hit`) and the Sep 10 `c760dfb` (`fix(flights): widen live-fare fallback to ±3 days / 2–7 nights`) both touch `server/proxy.js`. Neither is live. These aren't cosmetic — they determine whether any fare gets returned at all when Travelpayouts has no exact-Friday data. Without them, the live VPS returns nothing for off-peak routes.

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI/dist/) | ~439 KB minified (esbuild, Babel stripped) | ✅ |
| Cache stamp | `20260914a` — Day 11 of code freeze, correct | ✅ |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ |
| Brace balance | 5682 / 5682 — BALANCED | ✅ |
| VENUES | 404 (134 skiing / 270 beach) — confirmed | ✅ |
| `lateSeason: true` | 15 venues — confirmed via grep -n (CLAUDE.md correct; grep -c returns 10 due to space variant `"lateSeason": true` in JSON entries — cosmetic grep artifact, not a code bug) | ✅ |
| BASE_PRICES coverage | 183 unique airports in BASE_PRICES — 100% venue coverage | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| Sentry DSN | Configured: `9416b032...` in app.jsx:7 + index.html:77 | ✅ |
| React | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Image lazy loading | `loading="lazy"` on all 9 venue image call sites | ✅ |

---

## 2. Flight Proxy Status — ✅ CODE / 🔴 VPS (Day 46)

```
FLIGHT_PROXY = "https://peakly-api.duckdns.org"  ← HTTPS ✅
Timeout: 4000ms AbortController ✅
Fallback: BASE_PRICES estimate on proxy failure ✅
duffelTripDays / duffelWrongLength sanity check ✅ (app.jsx:13620)
buildFlightUrl fallback: +3 days (Fri→Mon) ✅
```

### proxy.js commits undeployed since Aug 11:

| Date | Commit | Change | Impact |
|------|--------|--------|--------|
| Sep 9 | `3152c96` | Fall back to nearest ±1-day weekend RT fare when no exact-Friday hit | **Fare returns for off-peak routes** |
| Sep 10 | `c760dfb` | Widen live-fare fallback to ±3 days / 2–7 nights | **More live fares surface** |
| Aug 11 | (already deployed) | forecast_days=14, disk cache, CORS+DELETE, rate-limiter | Already live |

The live VPS is running code from Aug 10. Any route where Travelpayouts has no exact-Friday fare **returns nothing** instead of the fallback. That's a large fraction of the catalog — particularly beach venues outside US hubs.

---

## 3. Security Audit — ✅ CLEAN

| Check | Result |
|-------|--------|
| Travelpayouts server-side token | **Not in client code** — `TP_MARKER = "710303"` is the public affiliate marker (deep-link only), not the API token ✅ |
| Supabase anon key | Present in app.jsx:26 — `eyJhbGci...`. This is correct and intentional: anon key is public-safe per design, gated by Supabase RLS. Documented in CLAUDE.md. ✅ |
| `.gitignore` | Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision`, business docs, logs ✅ |
| Sentry DSN | In code — expected, DSNs are public-safe by design ✅ |
| No secrets in recent commits | `git log --oneline -15` clean ✅ |
| APNS `.p8` key | Gitignored (`*.p8`) ✅ |

**Known open (P2 — unchanged from prior reports):**
- No SRI hashes on CDN `<script>` tags (React, Babel, Sentry — supply-chain risk if CDN is compromised). Low urgency pre-launch.

---

## 4. Performance — ✅ GREEN

| Metric | Value |
|--------|-------|
| Source size | 741 KB (`app.jsx`) |
| Minified bundle (CI) | ~439 KB (esbuild, Babel stripped) |
| Gzipped estimate | ~110–120 KB over wire |
| Images | `loading="lazy"` everywhere ✅ |
| Fonts | Google Fonts CDN, `preconnect` set ✅ |
| Babel in-browser | Dev path only — production loads `dist/app.min.js` ✅ |

**Largest bottleneck:** First paint on mobile still blocked by synchronous Babel parse (~3–5s) for anyone who hits the non-dist fallback path (`index.html` directly, not via GitHub Pages `dist/`). This is the expected dev path — not a regression.

**CDN versions current:** React 18.3.1 (latest 18.x), Babel 7.24.7 (latest 7.x stable). No updates needed.

---

## 5. Cost Estimate

| Scale | Infra | Notes |
|-------|-------|-------|
| Current / <1K MAU | $6/month (DO 1GB) | Open-Meteo free tier covers all weather requests |
| 1K MAU | $6/month | Open-Meteo ~2–3K requests/day, well within free tier |
| 10K MAU | $12/month | Upgrade to DO 2GB ($12); Open-Meteo still free at ~20K req/day |
| 100K MAU | $80–100/month | DO 4GB ($24) + load balancer ($12) + Supabase Pro ($25) + CDN egress |

Open-Meteo free tier limit: ~10K requests/day. At 10K DAU hitting 2 new venues each, you're at 20K/day — upgrade to paid tier ($50/month) or the VPS cache absorbs it (2hr TTL means repeat requests are free). VPS cache is already live.

---

## Critical Issues (P0) — Fix Before Launch

### P0-1: VPS proxy.js undeployed — Day 46, 24 days to launch
**Broken:** Two-weekend scoring, iOS native proxy access, ±1-day fare fallback, 2–7 night fare matching. The Sep 9 + Sep 10 proxy commits mean live fares are dead for any route without exact-Friday Travelpayouts data.

**Fix:** SSH to `198.199.80.21`. One command sequence:

```bash
# SSH in
ssh root@198.199.80.21

# The VPS has NO git repo — it's a hand-copied dir
# Copy the new proxy.js from the repo (from your local machine, not VPS)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then on the VPS:
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: uptime resets, forecast_days:14, wx_cache_size:0 (refills on traffic)
```

**Time to fix: 5 minutes.** The only thing stopping this is Jack's SSH session.

**Verify deployed changes:**
```bash
# Check fare fallback is live (should return a fare, not null, for a weekend query)
curl -s "https://peakly-api.duckdns.org/api/flights?origin=JFK&destination=LAX&depart_date=2026-10-02&return_date=2026-10-05" | python3 -m json.tool
```

---

## High Issues (P1)

### P1-1: 18 stale remote branches — 5 days past Sep 20 deadline

**Branches to delete (all `claude/*` + test branches, none merged into product):**

```bash
# From local machine with SSH push access:
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

**Time to fix: 2 minutes.** Harmless to skip pre-launch but PM flagged `origin/master` specifically as a `deploy.yml` footgun risk — that's not in this list (it's a real branch), but the 18 listed above are safe to delete.

---

## Medium Issues (P2)

### P2-1: No SRI hashes on CDN scripts
React, Babel, Sentry loaded without `integrity=` hashes. CDN compromise = code execution.

```html
<!-- Example fix for React (get hash with: curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A) -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_HERE">
</script>
```

Deferred pre-launch (low attack probability, Babel `eval` would break SRI anyway without CSP tuning). Flag for v1.1.

### P2-2: APNS still broken (known, unchanged)
DER-vs-P1363 JWT + HTTP/1.1 `fetch` against HTTP/2-only API. Alerts tab gated off iOS. Not a launch blocker. Fix documented in CLAUDE.md Open #21.

---

## What Breaks First at Scale

**The VPS is the single point of failure.** At current $6/month, it's a 1GB droplet with no redundancy, no health check restarts beyond pm2, and no persistent disk cache across restarts. A Reddit/HN traffic spike hitting 500+ concurrent users within the first hour would: (1) blow Open-Meteo's free-tier ceiling (~66 concurrent new-venue requests), (2) exhaust node's single-thread event loop under simultaneous Travelpayouts proxy calls, (3) pm2 auto-restart wipes the in-memory wx cache, causing a second cold-start spike. The disk cache in the Sep 9 proxy.js (`WX_CACHE_FILE`, `writeFileSync`) survives restarts — but **it's not deployed**. Fix P0-1 and you mitigate the worst of this. The VPS upgrade from $6 to $12 (2GB) doubles headroom and costs $6/month. Do it simultaneously with the redeploy.

---

## Summary Scorecard

| Area | Status | Blocking Launch |
|------|--------|----------------|
| Live site (app.jsx/sw.js/HTML) | ✅ GREEN | No |
| Cache stamp / SW lockstep | ✅ GREEN | No |
| Brace balance | ✅ GREEN | No |
| VENUES count (404) | ✅ GREEN | No |
| BASE_PRICES coverage (100%) | ✅ GREEN | No |
| Security / secrets | ✅ GREEN | No |
| CDN dependencies | ✅ GREEN | No |
| Sentry error monitoring | ✅ GREEN | No |
| Image lazy loading | ✅ GREEN | No |
| VPS proxy.js deployment | 🔴 RED Day 46 | **YES** |
| Stale branches (18) | 🟡 YELLOW | No |
| SRI hashes on CDN | 🟡 YELLOW | No |
| APNS (iOS push) | ⚪ PARKED | No (gated off) |
