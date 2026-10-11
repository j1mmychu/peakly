# DevOps Report — 2026-10-11 (ORANGE)

**Status: 🟠 ORANGE — VPS Day 63 (7 days to Oct 18 launch, P0, SSH window is TODAY). `origin/master` footgun Day 5 (still live). Code freeze Day 27 clean. SW PRECACHE Babel mismatch Day 7.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** (frozen — code freeze Day 27, unchanged) |
| VENUES (bracket-walker) | **406** (bracket-walker artifact; CLAUDE.md + Content confirmed 404 — 134 skiing / 270 beach) |
| lateSeason:true venues | **15** ✅ (grep-confirmed) |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured, non-empty (`app.jsx:7-8`, `index.html:77`) |
| React 18 (cdnjs) | ✅ 18.3.1 |
| Babel 7.24.7 (cdnjs, dev-only path) | ✅ — esbuild strips in production build |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — frozen Day 27 (expected: no app.jsx commits since Sep 14) |
| All API calls HTTPS | ✅ `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` |
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER="710303"` is an affiliate marker, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated, documented) |
| No other credentials in client | ✅ Clean — full grep scan ran |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Image lazy loading | ✅ 9 `loading="lazy"` instances |
| fetchTravelpayoutsPrice timeout | ✅ AbortController 4s (`app.jsx:5518`) |
| fetchWeather proxy fallback | ✅ try VPS proxy → fall back to direct Open-Meteo |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| `origin/master` commits behind main | **561 commits** — still live, still a footgun |

**Zero app.jsx/sw.js/index.html commits in 27 days. Code freeze intact.**

---

## 2. 🔴 P0: VPS Redeploy — Day 63, 7 Days to Launch, SSH Window Is NOW

This is the Oct 11–12 weekend yesterday's report flagged as the last viable window before launch day. It's Sunday Oct 11. If this doesn't happen today or tomorrow, the redeploy happens on Oct 18 itself — cold cache, Val Thorens blocked from the front page, iOS CORS broken — during the highest-stakes traffic of the year.

The committed `server/proxy.js` is still correct. Nothing in it changed. Everything below is live in source, nothing is live on the VPS.

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
# SSH to VPS
ssh root@198.199.80.21

# Copy proxy source (NOT a git clone — cp only)
cp server/proxy.js /opt/peakly-proxy/proxy.js
# OR from local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# On VPS — restart and verify
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: "wx_cache_persist":true, "forecast_days":14, uptime near 0
```

**What breaks on launch day without this:**

1. `forecast_days:7` in memory → two-weekend lookahead broken → Val Thorens (lateSeason venue, `Opens Oct 18 exactly`) can't score its second weekend → disappears from front page on launch day
2. `capacitor://localhost` missing from CORS → every iOS native API call blocked with a CORS error
3. Alert deletion silently fails (DELETE blocked by preflight)
4. VPS rate limiter forgeable by spoofing `X-Forwarded-For[0]`
5. Cold cache at launch (without disk persist, every pm2 restart wipes weather data)

---

## 3. 🔴 P1: `origin/master` Footgun — Day 5

Still live. 561 commits behind main. If `git push origin master` is the default push command in any shell alias or hook (and `scripts/auto-push.sh` has historically used variants of this), a stray push during launch-day chaos ships April code to production.

**The fix, 30 seconds:**

```bash
git push origin --delete master
```

That's it. No code change. No risk. The branch has zero unique commits. The `deploy.yml` workflow fires on both `main` and `master` — verified in `.github/workflows/deploy.yml`. After deletion, only `main` triggers deploys.

**Jack: this is 30 seconds. Do it when you open the SSH session for the VPS.**

---

## 4. P3: SW PRECACHE Babel Mismatch — Day 7 (Post-Launch)

`sw.js` PRECACHE caches `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js`. `index.html` loads `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js`. Two mismatches: CDN (unpkg vs cdnjs) AND version (7.29.7 vs 7.24.7). The SW is caching a URL that no page request ever fires, so the cached asset is never served.

**Impact:** Zero in production. The CI esbuild build strips Babel entirely — `dist/app.min.js` has no Babel at runtime. The mismatch only affects local dev (which doesn't use the SW) and users who somehow loaded the dev `index.html` path. P3. Fix after launch.

**Post-launch fix (one line in sw.js):**

```diff
- "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
+ "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
```

But do not touch during code freeze.

---

## 5. Security Audit — ✅ GREEN

Full grep scan on `app.jsx` today — all credential-adjacent hits are expected and safe:
- `SUPABASE_ANON_KEY` — public-safe, RLS-gated, documented intentional (Supabase anon keys are safe to expose)
- `TP_MARKER="710303"` — affiliate marker, exposed in deep links by design
- Sentry DSN — client-side public identifier, standard practice
- `pushToken` refs — device token in localStorage, not a server secret

No server-side credentials in client code. Travelpayouts server token is VPS env-only. `.gitignore` covers `.env`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`. Clean.

Git log — last 3 commits are daily reports only, no code changes.

---

## 6. Performance Analysis

**Production bundle (CI esbuild — Babel stripped):**

| Asset | Size |
|-------|------|
| `app.min.js` (esbuild CI output) | ~439 KB minified (per CLAUDE.md) |
| React 18 UMD (cdnjs) | ~130 KB gzipped |
| Supabase JS (lazy-loaded, auth flow only) | ~80 KB gzipped |
| Sentry SDK (deferred) | ~50 KB gzipped |
| Google Fonts (Plus Jakarta Sans) | ~30 KB |

**Biggest bottleneck is the VPS cold cache** — same as yesterday. Without the disk-persist fix (committed, undeployed), a `pm2 restart` on launch day resets `_wxCache` to empty. At modest launch traffic (50 concurrent users, each browsing 10 venues), that's 500 Open-Meteo requests in the first minute. Free tier ceiling: 10K requests/day = blown in 20 minutes of real launch traffic.

After the VPS redeploy with disk cache: `wx-cache.json` survives restarts. Cache refills on first hit per venue, not per user.

9 `loading="lazy"` images. 2hr localStorage weather TTL. Batching correct (50 venues/2s). No performance regressions introduced during code freeze.

---

## 7. Cost at Scale

| MAU | Infrastructure | Notes |
|-----|---------------|-------|
| Current (<100) | **$6/mo** | DO 1GB droplet + GitHub Pages free |
| 1K MAU | **$12/mo** | Same DO droplet sufficient |
| 10K MAU | **$18/mo** | Upgrade to DO 2GB ($12) + Pages free |
| 100K MAU | **~$60/mo** | DO 4GB ($24) + Cloudflare CDN (free tier) + Open-Meteo paid ($20/mo) |

**What breaks first at scale:** Open-Meteo free tier (10K req/day). At 10K MAU with 50% cache-hit rate = ~25K direct Open-Meteo calls/day. The VPS disk-persist cache is the mitigation. At 100K MAU, move to Open-Meteo commercial ($20/mo). Supabase free tier (500MB database, 2GB bandwidth) is not a concern at this scale.

---

## 8. Open Issues Tracker

| # | Issue | Severity | Days Open | Status |
|---|-------|----------|-----------|--------|
| 19/23 | VPS redeploy + disk cache | **P0** | **63** | 🔴 SSH window is TODAY (Oct 11–12) |
| master | `origin/master` footgun | **P1** | **5** | 🔴 30 seconds, `git push origin --delete master` |
| SW PRECACHE | Babel CDN/version mismatch | P3 | **7** | 🟡 Post-launch (code freeze) |

---

## Summary

**7 days to launch. Same two items. Oct 11 is the day.**

Yesterday's report said "Oct 11–12 is the last weekend before launch." That's today. The VPS proxy code has been correct and sitting committed for 63 days. The disk-persist cache, two-weekend scoring, iOS CORS, and alert deletion are all a single SSH session away from being live.

`git push origin --delete master` is 30 seconds while you have the terminal open.

After those two actions: infrastructure is launch-ready. Everything else — BASE_PRICES, photos, SW PRECACHE — is post-launch.
