# Peakly DevOps Report — 2026-06-27

**Status: 🟢 GREEN**

Cache stamp bumped `20260626a` → `20260627a` (1 day stale, fixed this run). All invariants pass. Zero security issues. Venue count 370 confirmed. No regressions vs. yesterday's GREEN. Standard morning fix only.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, Open-Meteo, and GitHub Pages is blocked in this remote execution environment. Sandbox 403/timeout ≠ VPS downtime. Last confirmed VPS healthy: June 13 (networked session). Jack: run `curl https://peakly-api.duckdns.org/health` before Reddit post to get a current reading.

---

## Fixes Applied This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache stamp `20260626a` → `20260627a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | 1 day stale — bumped in lockstep |

---

## Full Invariant Check

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 657 KB raw (~163 KB gzip est.)** |
| CDN scripts (index.html) | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260626a` — 1 day stale |
| Cache stamp (post-fix) | `20260627a` ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260627a` ✅ |
| Brace balance | **5565 open / 5565 close — BALANCED** ✅ |
| Sentry DSN | `9416b032a4…@o4511108649058304.ingest.us.sentry.io` in `index.html`, `defer`'d ✅ |
| Venue count (grep, both formats) | **370** (131 ski + 239 beach — compact + JSON-format combined) — matches `.venue-baseline` 370 ✅ |
| Venue baseline (`scripts/.venue-baseline`) | **370** — floor holds ✅ |
| Duplicate IDs (VENUES array) | Boot-time IIFE validator live; 0 runtime errors ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| `lateSeason: true` venues | **25** ✅ |
| `loading="lazy"` on images | All venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | `getPlatform() === "ios" ? APNS_LIVE : true` — live ✅ |
| `APNS_LIVE` | `false` — expected; iOS push deferred ✅ |
| `deleteAccount()` | Wired in `useCloudSync`, graceful fallback if SQL not deployed ✅ |
| `weatherDown` banner | Live in ExploreTab ✅ |
| `ScoringExplainer` | Live ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s `AbortController` + semaphore cap at 3 concurrent ✅ |
| `_tryProxyWx` timeout | 4s + direct Open-Meteo fallback ✅ |
| Travelpayouts token client-side | **Not present** — only public `TP_MARKER = "710303"` affiliate marker ✅ |
| Supabase anon key | Present — expected, RLS-gated ✅ |
| Supabase service role key | **Not present** ✅ |
| `.gitignore` | `.env*`, `*.env`, `*.pdf`, `*.pptx`, `*.p8`, `*.pem` all covered ✅ |
| Recent commit secret scan (since Jun 25) | Zero real hits ✅ |

---

## Issues

### P1 — Fixed This Run

**Cache stamp was 1 day stale** (`20260626a`, today is 2026-06-27).

Users on a stale Service Worker get the cached `app.jsx` indefinitely until the SW sees a new `CACHE_NAME`. Fixed in lockstep across all three files. Standard morning pattern — fires daily when no agent edit runs after midnight UTC. The auto-push hook bumps on any file edit; no edit yesterday = no bump.

---

## Security Audit

Clean across all vectors:

- **No Travelpayouts server token** in any client file — server-side only via VPS env ✅
- **No Supabase service role key** — only the RLS-gated anon key (public-safe by design) ✅
- **Sentry DSN** is public-safe (DSN is meant to be client-exposed; data-gated at Sentry project level) ✅
- **No other secrets, tokens, or API keys** in `app.jsx`, `index.html`, or recent commits ✅
- **`.gitignore`** covers `.env*`, `*.pem`, `*.p8`, `*.key`, `*.pdf`, `*.pptx` ✅

Items in `known-skipped.md` — not re-flagged:
- SRI on CDN scripts (React, Babel — Leaflet already has SRI)
- CSP meta tag (Babel `unsafe-eval` blocks any meaningful policy)

---

## Performance

| Metric | Value |
|--------|-------|
| **Critical render path** | ~384 KB gzip (React 45 + ReactDOM 130 + Babel 246 + app.jsx ~163) |
| **Lazy loaded** | ~125 KB gzip (Supabase ~80 + Leaflet ~45) |
| **Biggest bottleneck** | Babel Standalone at ~246 KB gzip — transpiles 657 KB JSX in-browser on every cold load. 200–600ms parse+compile on mid-range mobile. Structural cost of no-build-step. Acceptable at <1K MAU; revisit if Sentry shows LCP > 4s. |
| `loading="lazy"` on venue images | ✅ |
| Unsplash `auto=format&q=75` | Still missing — in `known-skipped.md`. Re-flags at MAU > 100 or Sentry LCP regression. |

---

## CDN Dependency Currency

| Library | Pinned version | Status |
|---------|---------------|--------|
| React | 18.3.1 | Current stable 18.x ✅ |
| ReactDOM | 18.3.1 | ✅ |
| Babel Standalone | 7.29.7 | Current ✅ |
| Supabase JS | 2.106.2 | Recent; check for 2.x patch monthly |
| Leaflet | 1.9.4 | Current stable, SRI present ✅ |

---

## Cost Model

| MAU | DigitalOcean | GitHub Pages | Open-Meteo | Total/mo |
|-----|-------------|--------------|-----------|---------|
| 1K | $6 | $0 | $0 (free tier fine) | **$6** |
| 10K | $6 | $0 | Monitor — 66+ concurrent DAU converges on rate ceiling | **$6–12** |
| 100K | $12–18 (2GB) | $0 | $0 if weather proxy deployed; hard throttle risk otherwise | **$50–100** |

**Cost optimization opportunities:**
1. Deploy the already-coded `/api/weather` proxy cache before Reddit post. Collapses 370 per-venue calls to 1 upstream call per coord per 2h. Zero additional infra cost. One SSH session + `pm2 restart`. (Parked in `known-skipped.md` — re-flags at MAU > 100.)
2. At 100K MAU: Cloudflare free tier in front of GitHub Pages for DDoS + edge cache on `index.html`.
3. At 100K MAU: persist in-memory `_alerts` Map to file or Redis to survive VPS restarts.

---

## What Will Break First at Scale

**Open-Meteo rate limiting, same answer as yesterday.** The app makes up to 370 individual `fetchWeather` calls per full load (batched 50/2s = 7.4s wall-clock). At 66+ concurrent DAU on the same venue set, upstream calls converge, Open-Meteo 429s, `fetchWeather` returns null, cards degrade to estimate scores, the front-page carousel empties. The fix is already written — `/api/weather` proxy in `proxy.js` with a 2hr shared in-memory cache and in-flight dedup — sitting undeployed. One `pm2 restart` separates green from red the instant a Reddit post lands. After that, the next bottleneck is the Travelpayouts 3-semaphore queue depth at ~10K MAU — v2 territory.

---

*Report by DevOps agent — 2026-06-27. Sandbox environment — VPS liveness unverifiable from here. Verify manually before Reddit post: `curl https://peakly-api.duckdns.org/health`*
