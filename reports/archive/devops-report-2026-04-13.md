# Peakly DevOps Report — 2026-04-13

**Overall Status: 🟡 YELLOW**

No P0 blockers. Four P1 issues that degrade reliability or will cause incidents at moderate scale. Flights proxy is HTTPS and secure. No exposed secrets. Sentry live.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| app.jsx size | 11,000 lines / 2.0MB raw / **352KB gzipped** |
| CDN dependencies | React 18.3.1 ✅ ReactDOM 18.3.1 ✅ Babel 7.24.7 ✅ (all pinned exact versions) |
| Plausible analytics | ✅ present, uncommented |
| Cache-buster | ⚠️ `v=20260409a` — **4 days stale** (last bumped Apr 9, today Apr 13) |
| Service worker version | ⚠️ `peakly-20260409` — matches cache-buster age mismatch |

**Cache-buster is stale.** Every deploy needs a version bump or users with cached `app.jsx?v=20260409a` in the SW's stale-while-revalidate store get old code indefinitely unless they hard-refresh. **Fixed below.**

---

## 2. Flight Proxy Status

| Check | Result |
|---|---|
| Proxy protocol | ✅ HTTPS — `https://peakly-api.duckdns.org` |
| IP hardcoded in client | ✅ No — `104.131.82.242` absent from app.jsx |
| 5s timeout + AbortController | ✅ Present in `fetchTravelpayoutsPrice()` |
| Semaphore (max 3 concurrent) | ✅ Present |
| Retry with exponential backoff | ✅ Up to 3 attempts with 1.2s/2.4s backoff |
| localStorage cache (15-min TTL) | ✅ Present |

Proxy is clean. Token server-side only. No issues.

---

## 3. Weather & External API

### P1: fetchWeather / fetchMarine have no timeout

`fetchTravelpayoutsPrice()` has a 5s `AbortController`. `fetchWeather()` and `fetchMarine()` do not. One hanging Open-Meteo response blocks the entire batch. With 3,726 venues in 75 batches, one stuck fetch = the app appears frozen to users for 30+ seconds.

**Fix — add AbortController to both fetch functions:**

```js
async function fetchWeather(lat, lon) {
  const cacheKey = _wxCacheKey("weather", lat, lon);
  const cached = _wxCacheGet(cacheKey);
  if (cached) return cached;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const url =
    `${METEO}/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,` +
    `snow_depth_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,` +
    `uv_index_max,weather_code,precipitation_probability_max,sunshine_duration,` +
    `rain_sum,showers_sum,relative_humidity_2m_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=auto`;
  try {
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) throw new Error("weather fetch failed");
    const data = await r.json();
    _wxCacheSet(cacheKey, data);
    return data;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function fetchMarine(lat, lon) {
  const cacheKey = _wxCacheKey("marine", lat, lon);
  const cached = _wxCacheGet(cacheKey);
  if (cached) return cached;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const url =
    `${MARINE}/marine?latitude=${lat}&longitude=${lon}` +
    `&daily=wave_height_max,wave_period_max,wave_direction_dominant,` +
    `swell_wave_height_max,swell_wave_period_max,swell_wave_direction_dominant,` +
    `wind_wave_height_max,wind_wave_period_max,ocean_temperature_max` +
    `&forecast_days=7&timezone=auto`;
  try {
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) return null;
    const data = await r.json();
    _wxCacheSet(cacheKey, data);
    return data;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
```

**Estimated fix time: 10 minutes**

### P2: WX_CACHE_TTL comment is wrong — and TTL equals MAX_AGE

```js
// app.jsx line 4451 — CURRENT (WRONG COMMENT):
const WX_CACHE_TTL    = 2 * 60 * 60 * 1000; // 30 minutes in ms  ← LIE — this is 2 HOURS
const WX_CACHE_MAX_AGE = 2 * 60 * 60 * 1000; // 2 hours — cleanup threshold
```

Two bugs:
1. Comment says "30 minutes" — actual value is 2 hours (7,200,000ms). Misleads anyone debugging cache behavior.
2. `WX_CACHE_TTL == WX_CACHE_MAX_AGE` (both 2 hours). The `_wxCacheCleanup()` function deletes entries older than `MAX_AGE`, but by definition those entries have already been evicted by the TTL check (`if (Date.now() - ts > WX_CACHE_TTL)`). The cleanup function is dead code — it never removes anything that hasn't already self-evicted.

**Fix:**
```js
const WX_CACHE_TTL     = 2 * 60 * 60 * 1000; // 2 hours — re-fetch threshold
const WX_CACHE_MAX_AGE = 6 * 60 * 60 * 1000; // 6 hours — hard eviction (catches abandoned tabs)
```

**Estimated fix time: 2 minutes**

### Open-Meteo Rate Limit Projection

| MAU | Daily API Calls (estimated, 70% cache hit) | Status |
|---|---|---|
| 1K | ~840 calls/day | ✅ Safe (10K limit) |
| 5K | ~4,200 calls/day | ✅ Safe |
| 10K | ~8,400 calls/day | ⚠️ 84% of free tier — monitor |
| 20K | ~16,800 calls/day | 🔴 Exceeds free tier |

At 20K MAU the free tier breaks. Plan: at 10K MAU, switch to Open-Meteo commercial plan (~$20-99/month depending on tier) or implement server-side weather caching on the VPS to share cache across all users.

---

## 4. Security Audit

| Check | Result |
|---|---|
| Travelpayouts token in client code | ✅ None found |
| Any API key/token/secret in app.jsx | ✅ None found |
| Proxy URL is HTTPS | ✅ `https://peakly-api.duckdns.org` |
| `.gitignore` exists | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `.claude/` |
| Sentry DSN | ✅ Populated in both `app.jsx` line 8 and `index.html` line 77 |
| Git history scan for accidentally committed secrets | ✅ Clean — no `.env`, `.key`, `.pem` commits found |

**Security posture is good.** One note:

### P2: No SRI (Subresource Integrity) hashes on CDN scripts

React, ReactDOM, Babel Standalone, and Plausible load from external CDNs with no `integrity` attribute. If unpkg or plausible.io is compromised, attackers can inject arbitrary JS into every Peakly session.

**Fix — add integrity hashes (run once, add to index.html):**

```bash
# Generate SRI hash for each CDN script:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | base64
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | base64
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | base64
```

Then add `integrity="sha384-<hash>"` to each `<script>` tag. Low effort, eliminates supply chain risk.

**Estimated fix time: 15 minutes**

### P2: Proxy server has duplicate rate limiting

`server/proxy.js` registers two independent rate limiters:
1. `express-rate-limit` (tries to `require()` at startup — optional dep)
2. Custom in-memory `rateLimiter` (always runs, registered via `app.use(rateLimiter)`)

Both execute on every request. The custom one is correct and has no npm dependency. The `express-rate-limit` block is dead weight — if the package isn't installed, it logs a warning and does nothing; if it IS installed, you get double rate-limiting with different logic.

**Fix in `server/proxy.js` — delete lines 11-26:**
```js
// DELETE THIS ENTIRE BLOCK:
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
  app.use('/api/', rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    ...
  }));
} catch (e) {
  console.warn('[proxy] express-rate-limit not installed...');
}
```
The custom in-memory limiter below it handles everything. No behavior change.

**Estimated fix time: 5 minutes**

---

## 5. Performance Analysis

### JavaScript Bundle Breakdown

| Asset | Raw Size | Gzipped | Notes |
|---|---|---|---|
| `@babel/standalone@7.24.7` | ~920KB | ~330KB | Loaded synchronously. Biggest single asset. |
| `app.jsx` | 2,000KB | **352KB** | Includes 3,726 venue records hardcoded |
| `react@18.3.1` | ~140KB | ~45KB | Production build, fine |
| `react-dom@18.3.1` | ~45KB | ~14KB | Production build, fine |
| **Total initial JS** | **~3.1MB** | **~741KB** | ~3-8s parse+execute on mid-range Android |

**The Babel Standalone load is the #1 performance bottleneck.** It's ~920KB and must finish loading and parsing before any JSX is executed. The splash screen hides this well for users with normal connections, but:
- Android mid-range (Moto G, Pixel 6a) on 4G: ~4-6s before app renders
- Users on slow 3G: 8-15s

The Babel parse overhead is a known tradeoff of the no-build architecture. Not actionable without adding a build step. Just document it.

### P1: SW precaches wrong URL — wastes bandwidth on every install

`sw.js` precaches `/peakly/app.jsx` (no query params).
`index.html` loads `./app.jsx?v=20260409a` (with version param).

These are different cache keys. Result:
1. SW downloads `/peakly/app.jsx` on install — cached but never served
2. Browser fetches `app.jsx?v=20260409a` from network (misses SW cache)
3. SW's stale-while-revalidate also caches `app.jsx?v=20260409a` separately

Every SW install downloads app.jsx twice (2MB × 2 = 4MB wasted bandwidth per new user). With PWA installs at scale this adds up.

**Fix — update `sw.js` PRECACHE to match the versioned URL, or remove the precache entirely and rely on stale-while-revalidate:**

```js
// OPTION A: Remove precache, let stale-while-revalidate handle caching naturally
const PRECACHE = [];

// OPTION B: Match the exact versioned URL (must update every deploy — error-prone)
const PRECACHE = ["/peakly/app.jsx?v=20260413a"];
```

Recommend Option A. The `fetch` handler's stale-while-revalidate already caches `app.jsx?v=...` after first load. Precaching adds nothing except wasted bandwidth.

**Estimated fix time: 5 minutes**

### Image Lazy Loading

✅ All `<img>` tags in `ListingCard`, `FeaturedCard`, `CompactCard`, `VenueDetailSheet`, and `GuidesTab` use `loading="lazy"`. Good.

---

## 6. Cost Projections

| MAU | Infrastructure | Notes |
|---|---|---|
| Current (~50) | $6/month | DO 1GB droplet + free GitHub Pages |
| 1K MAU | $6/month | Proxy handles load easily. No changes needed. |
| 10K MAU | $12/month | Upgrade DO to 2GB ($12) for proxy headroom. Monitor Open-Meteo. |
| 100K MAU | ~$170/month | DO 4GB ($24) + Open-Meteo commercial ($99) + CDN for static ($10-20) |

**Cost optimization opportunities:**
1. Move static files (app.jsx) to GitHub Pages CDN (already done). No action needed.
2. At 10K MAU: add server-side weather cache on VPS (Redis or flat file) so all users share one weather fetch per venue per 2 hours instead of per-user. Cuts Open-Meteo calls by 95%.
3. Consider Cloudflare free tier in front of the DigitalOcean proxy — adds DDoS protection, caches `/api/flights/latest` responses at edge, and gives you SSL without Caddy dependency.

---

## Fixes Applied This Run

### ✅ Fixed: Cache-buster bumped to `v=20260413a` and SW to `peakly-20260413`

Updated `index.html` line 346: `app.jsx?v=20260413a`
Updated `sw.js` line 2: `CACHE_NAME = "peakly-20260413"`

---

## What Will Break First at Scale

**Open-Meteo free tier at ~20K MAU.** The 2-hour client-side weather cache is the only thing keeping API calls under 10K/day. It works per-user (browser localStorage), not globally. Each new user who hasn't cached data yet triggers a full weather fetch cycle — potentially 150 API calls on first visit (3,726 venues ÷ 50 per batch × ~2 calls each, but only fetching visible/first-batch initially). At 20K MAU with any meaningful churn, you hit the wall. 

**Prevention:** Before 10K MAU, deploy a server-side weather cache endpoint on the VPS. Single endpoint `GET /api/weather?lat=X&lon=Y` that returns cached data from the server (refreshed every 2 hours by a cron job). All users share one cached copy. This reduces Open-Meteo calls from O(MAU) to O(unique venues × 12/day) — roughly 44,700 calls/day at full venue coverage, handled by a $20/month Open-Meteo commercial plan. The client change is 2 lines in `fetchWeather()`.

---

## Summary

| Priority | Issue | Fix Time |
|---|---|---|
| P1 | Cache-buster stale (4 days) | **Fixed this run** |
| P1 | fetchWeather/fetchMarine no timeout | 10 min |
| P1 | SW precaches wrong URL (wastes 2MB/user) | 5 min |
| P2 | WX_CACHE_TTL comment wrong + TTL==MAX_AGE | 2 min |
| P2 | No SRI hashes on CDN scripts | 15 min |
| P2 | Proxy.js duplicate rate limiters | 5 min |
| P2 | Plausible domain needs update when peakly.app goes live | 2 min when domain registered |

Total remaining fix time (post this run): ~37 minutes.
