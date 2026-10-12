# DevOps Report — 2026-10-12 (RED)

**Status: 🔴 RED — VPS Day 64 (SSH window was Oct 11–12, now PAST. 6 days to Oct 18 launch). `origin/master` footgun Day 6 (still live). Code freeze Day 28 clean. SW PRECACHE Babel mismatch Day 8.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** (frozen — code freeze Day 28, unchanged) |
| VENUES (eval-counted) | **404** (134 skiing / 270 beach — matches CLAUDE.md) |
| lateSeason:true venues | **15** ✅ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured, non-empty (`app.jsx:7-8`, `index.html:77`) |
| React 18 (cdnjs) | ✅ 18.3.1 |
| Babel 7.24.7 (cdnjs, dev-only path) | ✅ — esbuild strips in production build |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — frozen Day 28 (expected: no app.jsx commits since Sep 14) |
| All API calls HTTPS | ✅ `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` |
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER="710303"` is an affiliate marker, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated, documented) |
| No other credentials in client | ✅ Clean — full grep scan ran |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Image lazy loading | ✅ 9 `loading="lazy"` instances |
| fetchTravelpayoutsPrice timeout | ✅ AbortController 4s (`app.jsx:5518`) |
| fetchWeather proxy fallback | ✅ try VPS proxy → fall back to direct Open-Meteo |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| `origin/master` commits behind main | **511 commits** — still live, still a footgun |

**Zero app.jsx/sw.js/index.html commits in 28 days. Code freeze intact.**

---

## 2. 🔴 P0: VPS Redeploy — Day 64, 6 Days to Launch, SSH Window MISSED

The Oct 11–12 window has passed. Today is Oct 12 (end of that window at best). The VPS proxy code committed in August is still not deployed. The working facts have not changed — they've gotten worse because the window is now closed.

**If this doesn't happen in the next 24–48 hours, the redeploy happens on Oct 18 itself.** That means:
- Cold `_wxCache` on launch day (weather refill = hundreds of Open-Meteo requests in the first 5 minutes from real users)
- Val Thorens (`lateSeason:true`, opens Oct 18 exactly) needs `forecast_days:14` to score its second weekend — with 7-day forecast from the old proxy, it scores one weekend and is borderline for the front page
- Every iOS native API call CORS-blocked from day one of App Store availability
- Alert deletion permanently broken (no `DELETE` in Allow-Methods)

**What's deployed on VPS vs. what's committed:**

| Fix | Committed | Live on VPS |
|-----|-----------|-------------|
| `forecast_days:14` (weather endpoint, line 504) | ✅ | ❌ |
| `forecast_days:14` (alert poller, line 737) | ✅ | ❌ |
| `forecast_days:10` (marine, lines 506/1035) | ✅ | ❌ |
| `capacitor://localhost` CORS (line 31) | ✅ | ❌ |
| `DELETE` in Allow-Methods (line 41) | ✅ | ❌ |
| Rate limiter `.pop()` XFF fix (line 59) | ✅ | ❌ |
| Disk cache `wx-cache.json` (lines 427-444) | ✅ | ❌ |

**The one action:**

```bash
# From local machine
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# On VPS
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: "wx_cache_persist":true, "forecast_days":14, uptime near 0
```

There is no code to write. The file is committed. This is a copy and a restart.

---

## 3. 🔴 P1: `origin/master` Footgun — Day 6

511 commits behind main. Still live. `deploy.yml` fires on both `main` **and** `master` — a stale push to `master` deploys April code to `j1mmychu.github.io/peakly/` with zero warning. The 15 open `claude/` branches are noise but not dangerous. `master` is dangerous.

**The fix:**

```bash
git push origin --delete master
```

30 seconds. Do it before the VPS session ends so you have one open terminal. Zero risk — master has 511 commits of divergence, none of which should ever ship.

---

## 4. P3: SW PRECACHE Babel Mismatch — Day 8 (Post-Launch Only)

`sw.js` PRECACHE caches `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js`. `index.html:88` loads `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js`. Two mismatches: CDN (unpkg vs cdnjs) and version (7.29.7 vs 7.24.7). The SW caches a URL no page request ever fires.

**Impact:** Zero in production. esbuild CI strips Babel entirely. Post-launch fix (code freeze is still active — do not touch):

```diff
- "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
+ "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
```

---

## 5. Security Audit — ✅ GREEN

Full grep scan on `app.jsx` today:
- `SUPABASE_ANON_KEY` — public-safe, RLS-gated, documented intentional
- `TP_MARKER="710303"` — affiliate marker, exposed in deep links by design
- Sentry DSN — client-side public identifier, standard practice
- `pushToken` refs — device token in localStorage, not a server secret

No server-side credentials in client code. Travelpayouts server token is VPS env-only. `.gitignore` covers `.env`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`. Clean.

Git log — last 18 commits are daily reports only (PM + Content + DevOps). No code changes. No secret introductions.

---

## 6. Performance Analysis

**Production bundle (CI esbuild — Babel stripped):**

| Asset | Size |
|-------|------|
| `app.min.js` (esbuild CI output) | ~439 KB minified |
| React 18 UMD (cdnjs) | ~130 KB gzipped |
| Supabase JS (lazy-loaded, auth flow only) | ~80 KB gzipped |
| Sentry SDK (deferred) | ~50 KB gzipped |
| Google Fonts (Plus Jakarta Sans) | ~30 KB |

**Single biggest bottleneck:** VPS cold cache at launch. Without disk-persist (committed, not deployed), any `pm2 restart` resets `_wxCache`. At 50 concurrent launch users browsing 10 venues each: 500 Open-Meteo requests in minute one. Free tier ceiling: 10K/day. A modest Reddit/HN spike clears that in under 20 minutes.

After redeploy: `wx-cache.json` survives restarts. 2hr TTL localStorage client-side, 4000-entry LRU server-side. Rate limits not a concern below 10K MAU.

9 `loading="lazy"` images confirmed. Batching correct (50 venues/2s). No regressions during code freeze.

---

## 7. Cost at Scale

| MAU | Infrastructure | Notes |
|-----|---------------|-------|
| Current (<100) | **$6/mo** | DO 1GB droplet + GitHub Pages free |
| 1K MAU | **$12/mo** | Same DO droplet sufficient |
| 10K MAU | **$18/mo** | Upgrade to DO 2GB ($12) + Pages free |
| 100K MAU | **~$60/mo** | DO 4GB ($24) + Cloudflare CDN (free) + Open-Meteo paid ($20/mo) |

**What breaks first at scale:** Open-Meteo free tier (10K req/day). At 10K MAU, 50% cache-hit rate = ~25K direct calls/day. The VPS disk-persist cache is the mitigation. At 100K MAU, move to Open-Meteo commercial ($20/mo).

---

## 8. Open Issues Tracker

| # | Issue | Severity | Days Open | Status |
|---|-------|----------|-----------|--------|
| 19/23 | VPS redeploy + disk cache | **P0** | **64** | 🔴 Window was Oct 11–12 — act in next 24–48h or it's launch day |
| master | `origin/master` footgun | **P1** | **6** | 🔴 `git push origin --delete master` — 30 seconds |
| SW PRECACHE | Babel CDN/version mismatch | P3 | **8** | 🟡 Post-launch (code freeze active) |

---

## Summary

**6 days to launch. The Oct 11–12 window has passed or is ending today. There is no comfortable pre-launch window left.**

The next viable time to redeploy the VPS is now, in the next 24 hours, or on Oct 18 itself — which means cold cache, broken iOS CORS, broken alert deletion, and a Val Thorens scoring gap all landing simultaneously with the first real users.

The code is correct. The proxy.js is committed. This is an `scp` and a `pm2 restart`. Then `git push origin --delete master`. Both together take under 5 minutes.

After those two actions: infrastructure is launch-ready. SW PRECACHE fix waits until after launch. Everything else is content or App Store work.
