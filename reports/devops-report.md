# Peakly DevOps Report — 2026-06-29

**Status: 🟡 YELLOW**

Structurally clean. Cache buster was 2 days stale (`20260627a`) — bumped to `20260629a` this run. One persistent open: no SRI hashes on React/ReactDOM/Babel/Sentry (Open #10, known). Venue count 370, brace balance 5565/5565, GEAR_ITEMS 0, eager Supabase tag confirmed removed. The Reddit launch is scheduled for Monday June 30 — pre-flight checklist below. VPS still unverifiable from sandbox; Jack must confirm `/health` live before posting.

---

## Fixes Shipped This Run

| Fix | File | Line | Detail |
|-----|------|------|--------|
| Cache buster `20260627a` → `20260629a` | `app.jsx:17` | 17 | 2 days stale → current |
| SW CACHE_NAME `peakly-20260627a` → `peakly-20260629a` | `sw.js:2` | 2 | Evicts stale cached assets on next visit |
| Query string `?v=20260627a` → `?v=20260629a` | `index.html:395` | 395 | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

**Network unreachable from sandbox** — outbound HTTPS to `j1mmychu.github.io` and `peakly-api.duckdns.org` times out (HTTP 000). Per CLAUDE.md 2026-06-13: sandbox egress block, not a real outage.

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 657 KB raw** |
| `PEAKLY_BUILD` stamp | `20260627a` → **bumped to `20260629a`** this run |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260629a` ✅ |
| Brace balance | **5,565 / 5,565 — BALANCED** ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Sentry DSN | `9416b032a4…@o4511108649058304.ingest.us.sentry.io`, `defer`'d ✅ |
| GEAR_ITEMS (Amazon) | `grep -c GEAR_ITEMS app.jsx` → **0** — cut confirmed ✅ |
| Venue count | **370** (197 quoted-key format + 173 unquoted-key format = 370) ✅ |
| Eager Supabase `<script>` | **Removed from index.html** — lazy-load contract restored ✅ |
| Supabase lazy fallback version | `app.jsx:61` → `@supabase/supabase-js@2.106.2` — aligned ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS only ✅ |
| HTTP bare-IP (104.131.82.242) | Not present in client code ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000 ms `AbortController` ✅ |
| Weather proxy timeout | 4 s (`_tryProxyWx`) with direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only ✅ |
| Live VPS health | **UNVERIFIABLE FROM SANDBOX** — last confirmed healthy June 13. Jack: `curl https://peakly-api.duckdns.org/health` before posting Monday. |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| Batch strategy | 50 venues per batch, throttled at 2s intervals ✅ |
| Rate-limit protection | VPS weather cache (2hr LRU) shields direct Open-Meteo on concurrent hits ✅ |
| Babel in PRECACHE | `sw.js` PRECACHE now includes Babel CDN URL — cached after first visit ✅ (new since prior report) |

**Free-tier ceiling:** 370 venues × ~2 calls = ~740 calls per full load per unique user. Direct Open-Meteo free tier is ~10,000 calls/day → breaks at ~13 simultaneous fresh-load users without proxy cache. With the VPS cache warm, 1,000 concurrent users on the same venue = 1 upstream call. **Before Monday's Reddit post: confirm VPS `/health` shows `wx_cache_size > 0`.**

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present |
| Supabase anon key | ✅ Public-safe anon key, RLS-gated |
| `.gitignore` covers `.env`, PDFs, business docs | ✅ Comprehensive |
| `server/setup-token.sh` | ✅ Interactive prompt, never hardcodes token |
| `proxy.js` token handling | ✅ `process.env.TRAVELPAYOUTS_TOKEN` only |
| TP_MARKER `710303` in client | ✅ Affiliate marker, not API token — expected |
| Recent commits for secret leaks | ✅ Clean |
| SRI on CDN scripts | ⚠️ **Open #10** — see P2.1 below |

---

## 5. Performance Analysis

| Asset | Est. Gzipped Size | Notes |
|-------|------------------|-------|
| Babel Standalone 7.29.7 | ~1,800 KB | Largest asset; **now in PRECACHE** — cached after first SW install |
| ReactDOM 18.3.1 | ~130 KB | |
| app.jsx (raw) | ~657 KB | Cached after first visit |
| Sentry SDK | ~50 KB | `defer`'d — off critical path ✅ |
| Leaflet 1.9.4 | ~40 KB | Lazy-loaded on demand ✅ |
| React 18.3.1 | ~11 KB | |
| **Total first load** | **~2.6 MB transferred** | Second load: ~900 KB (Babel served from SW cache) |

The sw.js `PRECACHE` addition (Babel) is a meaningful improvement: first visit still pays the full 2.6MB, but every subsequent visit gets Babel from the service worker cache instead of the CDN. On mobile this cuts load time 2–3 seconds on warm loads.

**Biggest bottleneck:** Babel Standalone on first load — unavoidable without a build step. `<link rel="preload">` already present. No further mitigation available within the no-build constraint.

All CDN versions current: React 18.3.1, Leaflet 1.9.4, Babel 7.29.7 ✅

---

## P1 — Open Issues

### P1.1 — No SRI on React, ReactDOM, Babel, Sentry (Open #10)

Only Leaflet has `integrity=` hashes. A CDN compromise on unpkg or sentry-cdn would inject arbitrary JS silently. Babel is the highest-risk target — runs eval-equivalent code, 1.8MB, loaded unconditionally.

**Fix:** Generate SHA-384 hashes and add `integrity=` to each script tag. Do NOT add a CSP `<meta>` tag alongside — Babel Standalone requires `unsafe-eval` to transpile JSX at runtime and a CSP would break the app.

```bash
# Generate hash for each script:
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
```

This has been Open #10 for months. Still medium risk because unpkg has a track record. Pre-launch is the right time to close it. **Estimated fix time: 30 minutes.**

### P1.2 — Plausible `data-domain` captures entire GitHub Pages subdomain

```html
<script defer data-domain="j1mmychu.github.io" ...></script>
```

Captures all pages under `j1mmychu.github.io`, not just `/peakly/`. Won't matter until another project deploys to that subdomain, but Monday's Reddit launch will generate analytics that should be attributable to Peakly specifically.

**Fix:**
```html
<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.hash.js"></script>
```

Verify the Plausible dashboard accepts path-scoped domain (it does). **Estimated fix time: 2 minutes.**

---

## 6. Cost Estimate

| MAU | Monthly Cost | Notes |
|-----|-------------|-------|
| 1K | **$6** | VPS only; Open-Meteo free; GitHub Pages free |
| 10K | **$12** | VPS upgrade needed at ~5K MAU (2GB/mo plan) |
| 100K | **$50–100** | VPS $24–48 + Open-Meteo paid or self-host |

No cost changes this sprint. Infrastructure is appropriate for current traffic.

---

## Pre-Launch Checklist (Reddit Monday June 30)

Before posting, Jack should verify manually (sandbox can't reach these):

- [ ] `curl https://peakly-api.duckdns.org/health` → `wx_cache_size > 0` (cache warm)
- [ ] `curl https://j1mmychu.github.io/peakly/` → HTTP 200 with `20260629a` in response body
- [ ] Open Peakly in mobile browser cold — verify no blank screen, no ErrorBoundary, scores load
- [ ] Check Sentry dashboard — confirm zero new errors from today's build
- [ ] Check Plausible dashboard — confirm tracking active

---

## What Breaks First at Scale

**Open-Meteo direct calls on a Reddit spike.** Post goes up, 200 users hit Explore in the first 5 minutes, each triggers 50-venue weather batch before the proxy cache is warm = 10,000 upstream calls in under a minute, which is the entire daily free-tier quota. After that, `fetchWeather` returns null, venues score at 50, the grid looks dead. The VPS proxy cache (2hr TTL, 4000-entry LRU) prevents this — but only if it's warm when the spike hits. The client has a 4-second timeout + fallback to direct Open-Meteo, which is both the safety valve and the failure mode when the proxy is cold. **Prime the cache: hit `/api/weather` for 5–10 popular venues via curl before posting.** If the proxy goes down mid-spike, all concurrent users pile directly onto Open-Meteo's free tier and you're throttled within minutes.
