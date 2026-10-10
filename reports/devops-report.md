# DevOps Report — 2026-10-10 (ORANGE)

**Status: 🟠 ORANGE — VPS Day 62 (8 days to Oct 18 launch, P0, still undeployed). `origin/master` footgun Day 4 (still live). Code freeze Day 26 clean. SW PRECACHE Babel mismatch Day 6.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** (frozen — code freeze Day 26, unchanged from yesterday) |
| VENUES (bracket-walker) | **406** (bracket-walker artifact; CLAUDE.md + Content confirmed 404 — 134 skiing / 270 beach; comment-embedded coord false positives explained in Oct 6 report) |
| lateSeason:true venues | **15** ✅ (grep-confirmed; format variations make 10 a common false low) |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured and non-empty (`app.jsx:7-8`) |
| React 18 (cdnjs) | ✅ |
| Babel 7.24.7 (cdnjs, dev-only) | ✅ — esbuild strips Babel in production build |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — frozen Day 26 (expected: no app.jsx commits since Sep 14) |
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

**Zero app.jsx/sw.js/index.html commits in 26 days. Code freeze intact.**

---

## 2. 🔴 P0: VPS Redeploy — Day 62, 8 Days to Launch

Still undeployed. Still P0. The committed `server/proxy.js` is correct — disk cache, `forecast_days:14`, `capacitor://localhost` CORS, DELETE method, rate-limiter last-XFF fix — all verified in source today. None of it is live.

**Verified in proxy.js source today:**
- `forecast_days: 14` ✅ (both weather + alert poller call sites — `proxy.js:504`, `proxy.js:737`)
- `capacitor://localhost` in CORS allowlist ✅ (`proxy.js:31`)
- `DELETE` in `Access-Control-Allow-Methods` ✅ (`proxy.js:41`)
- Rate limiter reads `.pop()` (last XFF entry) ✅ (`proxy.js:59`)
- Disk cache: `WX_CACHE_FILE = wx-cache.json`, `writeFileSync` on set, `readFileSync` on init ✅ (`proxy.js:427-444`)

**The code is done. The VPS is not.**

What dies on launch day if this doesn't happen:
1. **Two-weekend scoring silently broken** — `forecast_days: 7` (VPS live version) makes day 6/7 confidence `"low"`, which drops Val Thorens' opening weekend off the front page. Val Thorens opens Oct 18 — the exact editorial hook PM is building the launch around. Broken at the worst possible moment.
2. **iOS native blocked outright** — `capacitor://localhost` not in live CORS. Any App Store submission test fails.
3. **Alert deletion silent-fails** — DELETE method blocked at preflight since day one. Users create alerts and can't delete them.
4. **Weather cache wipes on every restart** — cold cache on launch day under real traffic = blast of Open-Meteo requests = free tier blown in minutes = "conditions unavailable" for everyone.

**Fix — one SSH session, 10 minutes:**

```bash
# From local machine (not this sandbox)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# SSH in
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: apns: unconfigured (fine), wx_cache_size 0 (rebuilds on traffic), uptime_seconds small
```

**8 days. Oct 11–12 is the last weekend before launch. Do it this weekend.**

---

## 3. ⚠️ P1: `origin/master` Footgun — Day 4

`origin/master` is 561 commits behind `origin/main`. It is still configured as a trigger in `deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
      - master  # ← this will ship April-vintage code if anyone touches it
```

A panicked `git push origin master` during launch-week chaos deploys months-old code to GitHub Pages. At 8 days out, this is a loaded gun sitting on the floor.

**Fix — 2 minutes, Jack only (requires repo write access):**

```bash
git push origin --delete master
# Then verify it's gone:
git ls-remote --heads origin master
# Expected: (empty)
```

If GitHub Settings has `master` as the default branch, change it to `main` first (Settings → General → Default branch). Then delete.

---

## 4. ⚠️ P3 (post-launch): SW PRECACHE Babel Mismatch — Day 6

Unchanged from yesterday. `sw.js` PRECACHE still contains:
```js
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```

Three problems:
1. **Wrong CDN** — `index.html` loads Babel from `cdnjs.cloudflare.com`, SW precaches from `unpkg.com`. These are different URLs. Cache miss every time.
2. **Wrong version** — `index.html` loads `7.24.7`, PRECACHE has `7.29.7`.
3. **Dead in production** — esbuild strips Babel entirely from `dist/app.min.js`. Precaching it wastes ~1.1MB of SW cache storage for literally nothing.

**Fix — first commit after launch breaks the code freeze:**
```js
// sw.js line 3 — change to:
const PRECACHE = [];
```

Not touching during code freeze. Bundle with first post-launch commit.

---

## 5. proxy.js Source Audit — ✅ GREEN (awaiting deployment)

Full review of committed `server/proxy.js` confirms all Aug 11 fixes are correctly implemented in source:

| Fix | Status |
|-----|--------|
| `forecast_days:14` (weather endpoint) | ✅ line 504 |
| `forecast_days:14` (alert poller) | ✅ line 737 |
| `forecast_days:10` (marine) | ✅ lines 506, 1035 |
| `capacitor://localhost` CORS | ✅ line 31 |
| DELETE in Allow-Methods | ✅ line 41 |
| Rate limiter `.pop()` XFF | ✅ line 59 |
| Disk cache `wx-cache.json` | ✅ lines 427-444 |

The proxy code is correct. The only remaining action is SSH deployment.

---

## 6. Security Audit — ✅ GREEN

Full grep scan on `app.jsx` for credentials, tokens, keys — all hits are expected and safe:
- `SUPABASE_ANON_KEY` — public-safe, RLS-gated, documented intentional
- `TP_MARKER="710303"` — affiliate marker, exposed in deep links by design
- Sentry DSN — client-side identifier, public-safe
- `pushToken` refs — device token in localStorage, not a secret

No server-side credentials in client code. Travelpayouts server token is VPS env-only. Clean.

`.gitignore` covers: `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`.

Git log clean — last 3 commits are all daily reports, no code changes.

---

## 7. Performance Analysis

**Production bundle (CI esbuild):**

| Asset | Size |
|-------|------|
| app.min.js (esbuild output) | ~439 KB minified (per CLAUDE.md; built on CI) |
| React 18 UMD (cdnjs) | ~130 KB gzipped |
| Supabase JS (lazy-loaded) | ~80 KB gzipped (auth flow only) |
| Sentry (deferred) | ~50 KB gzipped |
| Google Fonts | ~30 KB |

**Biggest bottleneck is still the VPS cold cache.** At launch under real traffic, a fresh `pm2 restart` wipes `_wxCache`. The committed proxy now disk-persists `wx-cache.json`, which survives restarts — but that only works after the VPS redeploy. Before that: each of 50 concurrent users triggers independent Open-Meteo calls for every venue they browse. Free tier at 10K requests/day is blown in under 3 minutes at modest launch traffic.

Everything else is fine. 9 `loading="lazy"` instances, localStorage 2hr weather TTL, batching correct (50/2s).

---

## 8. Cost at Scale

| MAU | Infrastructure | Notes |
|-----|---------------|-------|
| Current (<100) | **$6/mo** | DO 1GB droplet |
| 1K MAU | **$12/mo** | Same DO droplet + GitHub Pages free |
| 10K MAU | **$18/mo** | Upgrade DO to 2GB ($12) + Pages free |
| 100K MAU | **~$60/mo** | DO 4GB ($24) + Cloudflare CDN (free) + Open-Meteo paid plan (~$20) |

**What breaks first at scale:** Open-Meteo free tier (10K requests/day). At 10K MAU with 50% cache-hit rate = 25K requests/day. The VPS disk-persist cache (Open #23, committed, undeployed) is the prevention. At 100K MAU, move to Open-Meteo's $20/mo commercial plan.

---

## 9. Open Issues Tracker

| # | Issue | Severity | Days Open | Status |
|---|-------|----------|-----------|--------|
| 19/23 | VPS redeploy + disk cache | **P0** | 62 | 🔴 MUST DO before Oct 18 — code ready, SSH pending |
| master | `origin/master` footgun | **P1** | 4 | 🔴 Jack action, 2 min, delete the branch |
| SW | PRECACHE Babel mismatch | P3 | 6 | Post-launch (code freeze) |
| 22 | BASE_PRICES coverage | **CLOSED** | — | ✅ PM v174 confirmed 100% |

---

## Summary

**8 days to launch. Same two items as yesterday. Nothing changed overnight.**

The proxy code is correct — disk cache, forecast_days:14, CORS, rate limiter, all verified in source today. It just isn't running on the VPS. Oct 11–12 is the last weekend before launch. If the SSH session doesn't happen this weekend, the redeploy happens on launch day itself — cold cache, Val Thorens blocked from front page, iOS CORS broken — on the exact day that matters most.

Delete `origin/master` while you're at it. 2 minutes. 561 commits behind. A `git push origin master` during launch chaos ships April code to production.

**Oct 11–12. SSH. Both done. Then launch clean.**
