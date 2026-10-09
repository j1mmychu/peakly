# DevOps Report — 2026-10-09 (YELLOW → ORANGE)

**Status: 🟠 ORANGE — VPS Day 61 (9 days to Oct 18 launch, still undeployed, window is closing). `origin/master` footgun Day 3 (still live). Code freeze Day 25 clean. SW PRECACHE Babel mismatch Day 5.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** (frozen — code freeze Day 25) |
| VENUES (bracket-walker) | **406** (bracket-walker artifact; CLAUDE.md + Content confirmed 404 — 134 skiing / 270 beach; prior report explains comment-embedded coord false positives) |
| lateSeason:true venues | **15** ✅ (eval-confirmed; grep returns 10 — format artifact, explained Oct 6) |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured and non-empty (`app.jsx:7-8`) |
| React 18 (cdnjs) | ✅ |
| Babel 7.24.7 (cdnjs, dev-only) | ✅ — esbuild strips Babel in production build |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — frozen Day 25 (expected: no app.jsx commits since Sep 14) |
| All API calls HTTPS | ✅ `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` |
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER="710303"` is an affiliate marker, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated, JWT expires 2093) |
| No other credentials in client | ✅ Clean — full grep scan ran |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Image lazy loading | ✅ 9 `loading="lazy"` instances in app.jsx |
| fetchTravelpayoutsPrice timeout | ✅ AbortController 4s (`app.jsx:5518`) |
| fetchWeather proxy fallback | ✅ try VPS proxy → fall back to direct Open-Meteo |

**Zero app.jsx/sw.js/index.html commits in 25 days. Code freeze intact.**

---

## 2. 🔴 P0 (as of today): VPS Redeploy — Day 61, 9 Days to Launch

Upgrading from P1 to P0. 10 days was the last credible "this week" window. At 9 days, **there is no longer a buffer.** If the VPS is not redeployed before Oct 18, the launch goes live with every one of these broken:

- **Two-weekend scoring silently off** — `forecast_days: 7` on the proxy means `scoreWeekend`'s Fri+Mon picks are getting 7-day forecasts, which makes day 6/7 confidence `"low"` and drops them off the front page. The fix (`forecast_days: 14`) has been in `server/proxy.js` since Aug 11.
- **iOS native app can't reach the proxy** — `capacitor://localhost` missing from CORS. Any App Store submission fires requests that get blocked outright.
- **Alert deletion has never worked** — `DELETE` missing from `Access-Control-Allow-Methods`; preflight dies silently.
- **Rate limiter trivially forgeable** — reading `X-Forwarded-For[0]` instead of last entry lets any client balloon `_rateMap` and exceed limits for other users.
- **Weather cache wipes on every restart** — Open #23, in-memory only. A `pm2 restart` on launch day under traffic = cold Open-Meteo blast = free-tier blown = "conditions unavailable" for every user = product-killing first impression.

**Fix — 10 minutes SSH, handles all of it:**

```bash
# Copy updated proxy to VPS
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# SSH in and restart
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# Verify — key things to confirm:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: uptime_seconds small, apns: unconfigured (fine), wx_cache_size 0 (rebuilds on traffic)
```

**This must happen before Oct 18. No exceptions.**

---

## 3. ⚠️ P1: `origin/master` Footgun — Day 3

`origin/master` is still live. From `git log --oneline -3 origin/master`: last commit `b6dc033` ("auto: terms.html") — 100+ commits behind main, early 2026 vintage.

`deploy.yml` triggers on both `main` AND `master`. A panicked `git push origin master` during a launch-week fire drill ships months-old code to GitHub Pages production. At 9 days to launch this is actively dangerous.

**Fix — 2 minutes, Jack only (requires repo write access):**

```bash
# Delete the remote master branch
git push origin --delete master

# Verify it's gone
git ls-remote --heads origin master
# Expected: (empty)
```

If GitHub repo settings have `master` set as the default branch, change it to `main` first in Settings → General → Default branch.

---

## 4. ⚠️ P3 (post-launch): SW PRECACHE Babel Mismatch — Day 5

`sw.js` PRECACHE still contains:
```js
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```

Three problems, same as Day 1:
1. **Wrong CDN** — `index.html` loads from `cdnjs.cloudflare.com`, SW precaches from `unpkg.com`. Cache miss every time.
2. **Wrong version** — index.html loads `7.24.7`, PRECACHE has `7.29.7`.
3. **Irrelevant in production** — esbuild strips Babel entirely from `dist/app.min.js`. Precaching it burns ~1.1MB of SW storage for zero benefit.

**Fix — first commit after launch breaks the code freeze:**
```js
// sw.js line 3
const PRECACHE = [];
```

Not touching this during freeze. First commit post-launch, bundle it with whatever else changes.

---

## 5. Performance Analysis

**Bundle in production (built by `deploy.yml` → esbuild):**

| Asset | Size |
|-------|------|
| app.min.js (esbuild) | **439 KB** minified (per CLAUDE.md; dist/ not in working tree, built on CI) |
| React 18 UMD (cdnjs) | ~130 KB gzipped |
| Supabase JS (lazy) | ~80 KB gzipped (auth users only) |
| Sentry (deferred) | ~50 KB gzipped |
| Google Fonts | ~30 KB |

**Biggest bottleneck:** Cold VPS cache on launch day. A `pm2 restart` during final prep wipes `_wxCache`. First 404 concurrent users each trigger independent Open-Meteo calls per venue — at 50+ concurrent DAU that blows the free tier in minutes. The VPS redeploy (§2) + Open #23 disk persistence is the only prevention.

**Everything else is fine.** 9 `loading="lazy"` instances, localStorage 2hr weather TTL, correct batching (50/2s). No action needed beyond the VPS.

---

## 6. Security Audit — ✅ GREEN

Full grep on `app.jsx` for credentials, tokens, keys — all hits are expected and safe:
- `SUPABASE_ANON_KEY` — public-safe, RLS-gated, documented intentional
- `TP_MARKER="710303"` — affiliate marker, exposed in deep links by design
- Sentry DSN — client-side identifier, public-safe
- `pushToken` refs — device token in localStorage, not a secret

**No server-side credentials in client code.** Travelpayouts server token is VPS env-only. Clean.

`.gitignore` covers: `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`.

Git log: no suspicious commits in recent history. Last 3 commits are daily reports only.

---

## 7. Cost at Scale

| MAU | Infrastructure | Notes |
|-----|---------------|-------|
| Current (<100) | **$6/mo** | DO 1GB droplet |
| 1K MAU | **$12/mo** | Same DO droplet + GitHub Pages free |
| 10K MAU | **$18/mo** | Upgrade DO to 2GB ($12) + Pages free |
| 100K MAU | **~$60/mo** | DO 4GB ($24) + Cloudflare CDN (free) + Open-Meteo paid plan |

**What breaks first at scale:** Open-Meteo free tier (10K requests/day). At 10K MAU with 50% cache hit rate = 25K requests/day, free tier blown. The VPS proxy shared cache is the only buffer — and it wipes on restart (Open #23). Fix: disk-persist `_wxCache` (30-line change, bundle with VPS redeploy).

---

## 8. Open Issues Tracker

| # | Issue | Severity | Days Open | Status |
|---|-------|----------|-----------|--------|
| 19/23 | VPS redeploy + disk cache | **P0** | 61 | 🔴 MUST DO before Oct 18 |
| master | `origin/master` footgun | **P1** | 3 | 🔴 Jack action, 2 min |
| SW | PRECACHE Babel mismatch | P3 | 5 | Post-launch (code freeze) |
| 22 | BASE_PRICES coverage | **CLOSED** | — | ✅ PM v174 confirmed 100% |

---

## Summary

**9 days to launch. Two items left:**

1. **VPS redeploy** — was P1, is now P0. 10 minutes of SSH. Two-weekend scoring, iOS native, alert deletion, and rate limiter correctness all depend on it. A cold cache on launch day is the single most likely way this product dies on first contact with real traffic.

2. **Delete `origin/master`** — 2 minutes, Jack only. Leaves a loaded gun on the table during the most stressful week.

Everything else is frozen clean. The code is correct. The infrastructure just needs to catch up.
