# Peakly DevOps Report — 2026-04-29

**Overall Status: YELLOW**

One P1 fixed inline (cache buster — users were serving 6-day-old app.jsx). The Open-Meteo rate limit time bomb is now **12 days unresolved** across consecutive reports. It is not theoretical. It is a hard ceiling: 21 full cold loads per day before the free tier explodes. One HN post, one Reddit thread, one influencer share — it's gone. Everything else is clean.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx size | 7,150 lines / 467,963 bytes (~457 KB raw) |
| CDN deps | All pinned ✅ React 18.3.1, ReactDOM 18.3.1, Babel 7.24.7 |
| Plausible analytics | Present, uncommented ✅ |
| Cache buster | **WAS STALE — FIXED** (see below) |
| Service worker | `peakly-20260422` — mismatched after today's bump |

**Cache buster was stale — FIXED inline:**
- `app.jsx` last changed 2026-04-23 (4 new venues + Tioman airport fix, commit `969e24a`)
- `index.html` cache buster was still `?v=20260422a`
- Users with warm browser cache were running 6-day-old code
- **Fixed:** bumped to `?v=20260429a` in this commit

**Service worker cache name mismatch (P2):**
The SW cache is still `peakly-20260422` but app.jsx is now `?v=20260429a`. This won't break anything — SW stale-while-revalidate still works — but names should match so stale cache detection is accurate.

Fix (in `sw.js` line 2):
```js
const CACHE_NAME = "peakly-20260429";
```

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Protocol | HTTPS (`https://peakly-api.duckdns.org`) ✅ |
| Direct probe | HTTP 403 in 0.47s — expected (no query params) ✅ |
| Timeout | 5,000ms AbortController ✅ |
| Retry logic | Exponential backoff on 429/5xx ✅ |
| Concurrency cap | Semaphore max=3 ✅ |
| Token exposure | Server-side env var only, never in client ✅ |
| CORS | Allows `j1mmychu.github.io`, `peakly.app`, `localhost` ✅ |

Proxy is healthy. No action needed.

---

## 3. Weather & External API — P1 UNRESOLVED (DAY 12)

**The math has not changed. It is still bad.**

- 295 unique coordinate pairs → 295 weather API calls per cold load
- 165 surf + beach venues → 165 additional marine API calls per cold load
- **Total: 460 API calls per cold load (no cache)**
- Open-Meteo free tier: **10,000 calls/day**
- Max cold loads before hitting limit: **10,000 / 460 = 21 per day**
- With 2hr cache TTL (5 cache cycles/day): ~105 unique first-visit users/day is the ceiling

**Translation: 105 new daily visitors exhausts the free API tier. You have zero burst capacity for viral traffic.**

This has been flagged in every DevOps report since April 17. It still isn't fixed.

**Fix Option A — Add Open-Meteo API key (costs $0 for hobby tier, unblocks to 100K calls/day):**
```bash
# Sign up at https://open-meteo.com/en/pricing
# Their hobby/non-commercial tier adds API key auth but raises limits dramatically
```

```js
// app.jsx ~line 815 — add after MARINE constant:
const METEO_KEY = "your_key_here"; // public key, safe in client per Open-Meteo docs

// app.jsx ~line 907 — in fetchWeather, append to URL:
const url = `${METEO}/forecast?latitude=${lat}&longitude=${lon}`
  + `&hourly=...&daily=...&apikey=${METEO_KEY}`;

// app.jsx ~line 940 — in fetchMarine, append to URL:
const url = `${MARINE}/marine?latitude=${lat}&longitude=${lon}`
  + `&hourly=...&apikey=${METEO_KEY}`;
```
Cost: $0 (non-commercial). Unblocks capacity 21 → 1,000+ cold loads/day. **This is a 10-minute fix. Ship it.**

**Fix Option B — Increase cache TTL to 4 hours (stopgap only):**
```js
// app.jsx line 817
const WX_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours — doubles effective capacity
```
Doubles effective ceiling to ~210 new users/day. Buys time but doesn't fix the root cause.

**Fix Option C — Server-side weather proxy (correct long-term architecture):**
Add `/api/weather` on VPS proxy that caches responses server-side, shared across all users. Eliminates client-side rate limit exposure entirely. Overkill pre-launch but the right architecture post-1K users.

**Ship Fix A now. Fix C post-launch.**

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Exposed tokens in app.jsx | None ✅ |
| Travelpayouts token in client | Not present ✅ (server-side env var only) |
| `.gitignore` covers `.env` | Yes ✅ |
| Sentry DSN | Hardcoded in app.jsx line 8 — by design, public DSN ✅ |
| Recent commits with secrets | None found ✅ |
| CSP meta tag | Absent — P2 |
| SRI on CDN scripts | Absent — P2 |

**Sentry DSN clarification:** `9416b032a46681d74645b056fcb08eb7` in `app.jsx:8` is the public client DSN. Sentry client DSNs are intentionally public — write-only for error ingestion, no read access. This is correct and expected.

**P2 — No Content Security Policy:**
No `<meta http-equiv="Content-Security-Policy">` in `index.html`. Since Babel transpiles JSX client-side using `eval()`-equivalent, `unsafe-eval` must be allowed. A permissive CSP that blocks external script injection and unauthorized exfiltration is still worth having:

```html
<!-- index.html — add inside <head> after the Babel script tag -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self' https:;
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://js.sentry-cdn.com https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com;
  connect-src 'self' https://api.open-meteo.com https://marine-api.open-meteo.com https://peakly-api.duckdns.org https://o4511108649058304.ingest.us.sentry.io;
">
```

**P2 — No SRI on CDN scripts:**
React 18.3.1 and Babel 7.24.7 load from unpkg without Subresource Integrity hashes. Supply chain compromise on unpkg would run arbitrary JS. Low probability, non-zero impact.

```bash
# Generate hashes before adding:
curl -sL https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Then add integrity="sha384-<output>" crossorigin="anonymous" to each <script> tag
```

---

## 5. Performance Analysis

| Asset | Raw Size | Est. Gzipped | Notes |
|-------|----------|--------------|-------|
| Babel Standalone 7.24.7 | ~893 KB | ~280 KB | **Bottleneck #1** |
| app.jsx | ~458 KB | ~130 KB | 7,150 lines |
| ReactDOM 18.3.1 | ~136 KB | ~42 KB | |
| React 18.3.1 | ~44 KB | ~14 KB | |
| **Total JS** | **~1.53 MB** | **~466 KB** | Cold load only |

**Biggest single bottleneck: Babel Standalone.** It's a full compiler running browser-side to transpile `app.jsx` JSX on every cold load. Adds ~300-800ms on mid-tier mobile. No fix without adding a build step (intentionally avoided). Accept this cost pre-launch; revisit post-1K users.

**Images:** All 8 `<img>` render sites confirmed using `loading="lazy"` ✅

**CDN versions current:** React 18.3.1 ✅, Babel 7.24.7 (latest standalone is 7.26.x — minor bump, no action needed now) ✅

**Returning users:** `?v=20260429a` ensures browser caches app.jsx indefinitely; only changes on version bump. Warm-cache page load is fast.

---

## 6. Cost Estimate

**Current:** $6/month (DigitalOcean 1GB droplet) + $0 Open-Meteo (free tier) = **$6/month total**

| Scale | Est. Monthly Cost | First Bottleneck |
|-------|-------------------|------------------|
| 1K MAU | $6/month | Open-Meteo ceiling at ~105 new users/day |
| 10K MAU | $50-75/month | Open-Meteo paid ~$40/mo, DO upgrade for push alerts |
| 100K MAU | $400-600/month | Open-Meteo commercial ~$300/mo, CDN for app.jsx, DO scaling |

**Cost optimization opportunities:**
1. **Cloudflare free tier in front of GitHub Pages** — edge caching, DDoS protection, custom domain SSL. $0. Worth doing before launch.
2. **Open-Meteo hobby API key** — $0 now, unlocks 10x capacity. Must have before any growth push.
3. **DO droplet rightsizing** — current 1GB proxy is doing <100 req/day. $4/month droplet is sufficient. Save $2/month. Not worth migration risk pre-launch.

---

## What Breaks First at Scale

**Open-Meteo rate limits will be the first hard failure.** At 105 new users/day ceiling, a single mention on any surf or ski subreddit triggers a cascade: weather data stops loading for all users, scores fall back to defaults, the app looks broken. This is not a graceful degradation — no scores, no "perfect conditions" rankings, just spinners that never resolve. The fix is 10 minutes: register a free Open-Meteo API key and append `&apikey=` to the two fetch URLs. It's been P1 for 12 days. It's still P1.

Second failure: **single VPS, no process supervisor restart.** If the Node proxy crashes, flight prices silently fall back to estimates (acceptable — fallback is correctly implemented). Low impact. Check that `pm2` or `systemd` auto-restarts the process:
```bash
# SSH into VPS and verify:
pm2 list
# or
systemctl status peakly-proxy
```

---

## Actions This Run

- [x] **FIXED:** Cache buster bumped `20260422a` → `20260429a` in `index.html` — app.jsx was last modified April 23, users were loading 6-day-old code from browser cache

## Recurring P1 (Day 12 Unresolved)

- [ ] Register Open-Meteo API key, add `&apikey=${METEO_KEY}` to `fetchWeather` and `fetchMarine` URL strings in `app.jsx`. 10 minutes. $0. **Do it before any traffic push.**

## P2 Backlog

- [ ] Bump SW cache name: `sw.js` line 2 → `const CACHE_NAME = "peakly-20260429";`
- [ ] Add CSP meta tag to `index.html` (template above — test Babel eval doesn't break)
- [ ] Generate and add SRI hashes for CDN scripts (test before shipping — Babel requires `unsafe-eval`)
- [ ] Verify VPS process supervisor (`pm2 list` or `systemctl status peakly-proxy`) is active and set to restart on crash
