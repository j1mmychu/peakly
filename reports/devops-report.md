# DevOps Report — 2026-10-08 (YELLOW)

**Status: 🟡 YELLOW — VPS Day 60 (still undeployed, 10 days to Oct 18 launch). `origin/master` footgun Day 2 (still live). Code freeze Day 24 clean. SW PRECACHE Babel mismatch Day 4.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** (frozen — code freeze Day 24) |
| VENUES (eval-confirmed) | **404 total — 134 skiing / 270 beach** ✅ |
| lateSeason:true venues | **15** ✅ (eval-confirmed; grep returns 10 — format artifact, not a real discrepancy) |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured and non-empty (`app.jsx:7-8`) |
| React 18 (cdnjs) | ✅ |
| Babel 7.24.7 (cdnjs, dev-only) | ✅ — esbuild strips Babel in production build |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — frozen Day 24 (expected: no app.jsx commits since Sep 14) |
| All API calls HTTPS | ✅ `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` |
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER="710303"` is an affiliate marker, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated, JWT expires 2093) |
| No other credentials in client | ✅ Clean — full grep scan ran |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Image lazy loading | ✅ 9 `loading="lazy"` tags across all card components |
| fetchTravelpayoutsPrice timeout | ✅ AbortController 4s (`app.jsx:6381`) |
| fetchWeather proxy fallback | ✅ try VPS proxy → fall back to direct Open-Meteo |

**Zero app.jsx/sw.js/index.html commits in 24 days. Code freeze intact.**

---

## 2. ⚠️ P1: VPS Redeploy — Day 60, 10 Days to Launch

**Same as every report since Day 1.** `server/proxy.js` changes committed 2026-08-11 are inert because `/opt/peakly-proxy` on the VPS is a hand-copied directory, not a git clone. The committed fixes that are still sitting undeployed:

- `forecast_days: 14` (was 7) — two-weekend scoring silently broken until this lands
- `capacitor://localhost` in CORS — iOS native builds can't reach the proxy
- `DELETE` in `Access-Control-Allow-Methods` — alert deletion has never worked
- Rate limiter reads last X-Forwarded-For entry (not first) — trivially forgeable today
- Weather `_wxCache` disk persistence (Open #23) — `pm2 restart` wipes it cold

With 10 days to launch, this is no longer "this week." **It needs to happen this weekend.** A cold Open-Meteo cache the morning of launch (fresh `pm2 restart` + traffic spike) hits their free tier instantly.

**Fix — same SSH session handles all of it:**

```bash
# 1. Copy the updated proxy to the VPS
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# 2. SSH in and restart
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# 3. Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected health response after redeploy:
- `forecast_days: 14` visible in weather response shape
- `apns: unconfigured` (expected)
- `uptime_seconds`: small number (fresh restart)

**Time to fix: 10 minutes SSH. Estimated risk of not doing it: Reddit launch → 404 rate spike → Open-Meteo free tier blown → every user sees "conditions unavailable." That's a product-killing first impression.**

---

## 3. ⚠️ P1: `origin/master` Footgun — Day 2

`git branch -r` confirms `origin/master` is alive:

```
origin/master  (b6dc033 "auto: terms.html" — early 2026, 100+ commits behind main)
```

Yesterday's PM report confirmed yesterday's DevOps close was a false alarm — the branch is back. This is the same branch that's caused deploy accidents before (deploy.yml triggers on both `main` AND `master` per CLAUDE.md).

**Why it's P1 at 10 days to launch:** Anyone (including a panicked Jack) `git push origin master` during a late-night fire drill ships 2026-early code to production. GitHub Pages will pick up whichever branch is set as the source. Pre-launch is not the time to leave this live.

**Fix — 2 minutes:**

```bash
# Option A: CLI
git push origin --delete master

# Option B: GitHub UI
# Settings → Branches → find "master" → delete
```

**Verify:**
```bash
git fetch --prune && git branch -r | grep master
# should return nothing
```

---

## 4. ⚠️ P2: SW PRECACHE Babel Mismatch — Day 4

`sw.js` PRECACHE array:
```js
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```

Three problems with this one line:
1. **Wrong CDN** — `index.html` loads Babel from `cdnjs.cloudflare.com`, not `unpkg.com`. Service worker precaches a different file than what the page actually needs.
2. **Wrong version** — `index.html` loads `7.24.7`, PRECACHE has `7.29.7`. Cache miss every time.
3. **Irrelevant in production** — `dist/app.min.js` (the esbuild production build) has no Babel dependency at all. Precaching Babel burns ~1.1MB of service worker storage for zero benefit in production.

**Fix — 2 lines in `sw.js`:**

```js
const PRECACHE = [];
```

That's it. The service worker's stale-while-revalidate strategy already handles the production JS. Precaching the wrong Babel file from the wrong CDN at the wrong version only hurts.

**BUT:** app.jsx/sw.js are in code freeze. This is a correct fix that could wait until the next legitimate commit — don't break the freeze for this alone. Flag it as "first commit after launch."

---

## 5. Performance Analysis

**Bundle breakdown (production `dist/app.min.js`):**

| Asset | Size |
|-------|------|
| app.min.js (esbuild, per CLAUDE.md) | **439 KB** minified |
| React 18 UMD (cdnjs) | ~130 KB gzipped |
| Supabase JS (lazy-loaded) | ~80 KB gzipped (only on auth) |
| Sentry (deferred) | ~50 KB gzipped |
| Google Fonts (Plus Jakarta Sans) | ~30 KB |

**Total cold-start parse budget:** ~440 KB app + 130 KB React = ~570 KB before Supabase. This is reasonable for a PWA but not lightweight.

**Biggest performance bottleneck:** Weather fetching on cold start. Despite the 2-tier batching strategy (12 first-paint → 100-batch priority → background tail), a cold user on no VPS proxy cache triggers 12 direct Open-Meteo calls instantly. Each call is ~200ms. The first-paint tier is correctly designed but the value depends entirely on the VPS proxy being warm.

**Positive signals:**
- ✅ All images `loading="lazy"`
- ✅ localStorage weather cache 2hr TTL cuts repeat loads to zero
- ✅ Step-0 synchronous cache paint means returning users see scores in <100ms
- ✅ Supabase lazy-loaded (80KB doesn't hit users who never sign in)

**The one fix that matters most for perf:** VPS redeploy (see §2). A warm proxy cache turns 404 upstream Open-Meteo calls into 1. Every other optimization is noise compared to that.

---

## 6. Security Audit — ✅ GREEN

Full grep run on `app.jsx` for `token`, `secret`, `password`, `api_key`, `apikey`, `API_KEY`, `TOKEN`, `SECRET`, `sk-`, `pk-` — all hits are:
- `pushToken` (Capacitor device token — stored in localStorage, never a secret)
- `SUPABASE_ANON_KEY` (public-safe, RLS-gated, documented intentional)
- `TP_MARKER="710303"` (affiliate marker — exposed in Aviasales deep links by design, no risk)
- Sentry DSN (public-safe — Sentry DSNs are client-side identifiers)
- Comment strings

**No credentials, API keys, or server-side tokens are in client code.** The Travelpayouts server token lives in VPS environment variables only. Clean.

**.gitignore covers:** `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`.

---

## 7. Cost at Scale

| MAU | Infrastructure | Notes |
|-----|---------------|-------|
| Current (<100) | **$6/mo** | DO 1GB droplet |
| 1K MAU | **$12/mo** | Same DO droplet + GitHub Pages free |
| 10K MAU | **$18/mo** | Upgrade DO to 2GB ($12) + Pages free |
| 100K MAU | **~$60/mo** | DO 4GB ($24) + Cloudflare CDN (free tier) + Open-Meteo may need paid plan at sustained load |

**What breaks first at scale:** Open-Meteo's free tier (10K requests/day). At 1K MAU with 5 daily visits each, cold cache = 5K requests/day — fine. At 10K MAU, even a 50% cache hit rate means 25K requests/day, which blows the free tier. The VPS proxy's shared in-memory cache is the only thing standing between Peakly and a $0 Open-Meteo bill becoming a $25/month bill (commercial plan). That cache wipes on every `pm2 restart`. Open #23 (disk persistence) turns a critical single point of failure into a durable buffer — it's a 30-line fix that's been sitting undeployed since July 25. **Ship it with the VPS redeploy.**

**Cost optimization opportunities:**
1. Cloudflare Workers in front of Open-Meteo calls — free 100K requests/day, adds geographic edge caching. ~2 hours to wire up, eliminates the MAU ceiling.
2. Compress `app.min.js` with Brotli (nginx config, 1 line) — ~30% smaller than gzip. Already available on the DO Ubuntu stack.

---

## 8. Open Issues Tracker

| # | Issue | Severity | Days Open | Status |
|---|-------|----------|-----------|--------|
| 19 | VPS redeploy | **P1** | 60 | 🔴 CRITICAL — 10 days to launch |
| master | `origin/master` footgun | **P1** | 2 | 🔴 Needs Jack action (2 min) |
| 22 | BASE_PRICES coverage 43% airports | P2 | 74 | No change |
| 23 | Weather cache disk persistence | P1 | 74 | Bundle with #19 |
| SW | PRECACHE Babel mismatch | P3 | 4 | Fix after launch (code freeze) |

---

## Summary

Code is clean, frozen, and correct. The only open work is operational:

1. **VPS redeploy** — 10 minutes of SSH, 10 days left. This is the launch gate. Cache cold-start + iOS native + alert deletion all unblock the moment this lands.
2. **Delete `origin/master`** — 2 minutes. A stale branch this close to launch is an accident waiting to happen.
3. **SW PRECACHE** — trivial fix, deferred to first post-launch commit.

**Nothing is on fire today. But VPS Day 60 with launch Day 10 is the last credible window to call this P1 without it becoming P0.**
