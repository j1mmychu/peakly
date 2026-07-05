# Peakly DevOps Report — 2026-07-05

**Status: 🟡 YELLOW**

No new P0s. Structurally healthy. Cache buster was 1 day stale (`20260704a`) — bumped to `20260705a` this run in lockstep across `app.jsx`, `sw.js`, and `index.html`. All invariants hold: braces balanced, GEAR_ITEMS zero, Sentry active, no client-side secrets beyond documented public-safe values. It's now Day 5 post the scheduled June 30 Reddit launch. VPS health remains unverifiable from sandbox — confirm live manually. Plausible `data-domain` fix is planned for July 7 sprint (PM v78 confirmed).

---

## Fixes Shipped This Run

| Fix | File | Line | Detail |
|-----|------|------|--------|
| Cache buster `20260704a` → `20260705a` | `app.jsx:17` | 17 | 1 day stale → current |
| SW CACHE_NAME `peakly-20260704a` → `peakly-20260705a` | `sw.js:2` | 2 | Forces service worker swap on next visit |
| Query string `?v=20260704a` → `?v=20260705a` | `index.html:395` | 395 | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

**Network unreachable from sandbox** — `j1mmychu.github.io` and `peakly-api.duckdns.org` return HTTP 403 at the egress proxy. Per CLAUDE.md 2026-06-13: sandbox egress block, not a server outage. Do not restate as VPS down.

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 673 KB raw** |
| `PEAKLY_BUILD` stamp | `20260704a` → **bumped to `20260705a`** this run |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260705a` ✅ |
| Brace balance | **5,565 / 5,565 — BALANCED** ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Sentry DSN | Active (`9416b032a4…@o4511108649058304.ingest.us.sentry.io`), `defer`'d ✅ |
| Venue count | **370** (131 skiing / 239 beach — eval bracket-walk) ✅ |
| GEAR_ITEMS | **0 occurrences** — Amazon cut holds ✅ |
| Eager Supabase `<script>` | Not present — lazy-load contract intact ✅ |
| All `<img>` tags | `loading="lazy"` on all instances ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS only ✅ |
| HTTP bare-IP (`104.131.82.242`) | Not present in client ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000 ms `AbortController` + 3-retry with 1.2s×attempt backoff ✅ |
| `_tryProxyWx` timeout | 4 s, returns null and falls back to direct Open-Meteo ✅ |
| Travelpayouts token in client | **Not present** — server-side only via `process.env.TRAVELPAYOUTS_TOKEN` ✅ |
| Live VPS health | **UNVERIFIABLE FROM SANDBOX** — last confirmed healthy 2026-06-13 |

**Jack action (P1):** `curl https://peakly-api.duckdns.org/health` — confirm `wx_cache_size > 0` and check `pm2 describe peakly-proxy` uptime. If VPS rebooted since June 30, in-memory weather cache reset to zero; users have been hitting Open-Meteo directly. Restart: `pm2 restart peakly-proxy`.

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| Retry on 429/5xx | 3 attempts, 1.2s × attempt backoff ✅ |
| Client-side wx cache TTL | 2 hr localStorage with per-key timestamps ✅ |
| Flight price cache TTL | 15 min localStorage, 2 hr max-age cleanup ✅ |
| Marine API field | `sea_surface_temperature_max` (corrected 2026-06-07) ✅ |
| Babel in SW PRECACHE | `unpkg.com/@babel/standalone@7.29.7/babel.min.js` cached after first SW install ✅ |

**Rate limit math:** 370 venues × ~2 calls = ~740 calls per cold load per user. Open-Meteo free tier ≈ 10,000 calls/day. Direct path breaks at ~13 simultaneous fresh-load users. VPS proxy (2hr LRU, 4,000 entries) compresses that to ~1 upstream call per (lat,lon) per 2hr window — only when the cache is warm.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | **Not present** — server-side only via `process.env.TRAVELPAYOUTS_TOKEN` ✅ |
| Supabase anon key (`SUPABASE_ANON_KEY`) | Present in `app.jsx:26` — public-safe by design, RLS-gated. Not a secret ✅ |
| TP_MARKER `710303` | Affiliate marker, not auth token — expected in client ✅ |
| Sentry DSN in client | Intentional — Sentry DSNs are public-facing by design ✅ |
| `.gitignore` | Covers `.env*`, `*.pem`, `*.key`, `*.p8`, PDFs, business docs ✅ |
| HTTP URLs in client | Zero plain `http://` API calls ✅ |
| Recent commits for secrets | Last 15 commits: daily reports + cache bumps only — clean ✅ |
| SRI on CDN scripts | ⚠️ **None** — Open #10, deferred post-LLC (see P3 below) |

---

## 5. Performance Analysis

**Cold-load payload estimate:**

| Asset | Size (gzipped est.) |
|-------|---------------------|
| Babel Standalone 7.29.7 | ~280 KB |
| ReactDOM 18.3.1 | ~40 KB |
| React 18.3.1 | ~11 KB |
| app.jsx (673 KB raw → browser-transpiled) | ~180 KB |
| Sentry CDN bundle | ~70 KB (`defer`'d — off critical path) |
| **Total first cold load** | **~580 KB gzipped** |

Return visits: Babel served from service worker cache → ~300 KB total.

**Single largest bottleneck:** Babel Standalone — 280 KB gzipped compiler that runs in the browser on every cold load just to handle JSX. Not removable without a build step (documented hard constraint). `<link rel="preload">` on `index.html:87` is in place. No further mitigation available.

**CDN versions:**

| Dep | Version | Status |
|-----|---------|--------|
| React | 18.3.1 | Current stable 18.x ✅ |
| ReactDOM | 18.3.1 | Current stable 18.x ✅ |
| Babel Standalone | 7.29.7 | Recent ✅ |
| Leaflet | 1.9.4 | Latest 1.x, lazy-loaded ✅ |
| Supabase JS | 2.106.2 | Recent, lazy-loaded ✅ |

---

## 6. Cost Estimate

**Current:** $6/month (DigitalOcean 1GB droplet + GitHub Pages free).

| MAU | Est. upstream calls/day | Monthly cost |
|-----|------------------------|-------------|
| 1K | ~700 (proxy absorbs) | **$6** |
| 10K | ~4,400 upstream (proxy hot) | **$6** |
| 100K | Proxy absorbs; need 2GB RAM + PM2 cluster | **$12–18** |

No cost changes. Infrastructure appropriate for current traffic. Next trigger: upgrade $6 → $12 droplet (2GB RAM, PM2 cluster mode) when MAU crosses ~5K.

---

## Open Issues

### P1 — VPS cache restart risk (post-launch)

The Reddit launch was scheduled June 30. If the VPS rebooted between then and now, `wx_cache_size` reset to zero and every cold-load user since has been hitting Open-Meteo directly. At >13 simultaneous users that exhausts the free-tier daily quota and the grid renders as a flat 50-score list — looks like a broken app to new visitors.

**Fix (2 min):**
```bash
curl https://peakly-api.duckdns.org/health
# If wx_cache_size == 0 or request fails:
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
# Confirm warm:
curl https://peakly-api.duckdns.org/health | grep wx_cache_size
```

### P2 — Plausible `data-domain` scope (July 7 sprint)

PM v78 confirmed this goes in the July 7 sprint. Two-minute fix. **Do not re-flag after July 7.**

```html
<!-- index.html:32 — change: -->
<script defer data-domain="j1mmychu.github.io" ...></script>
<!-- To: -->
<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.hash.js"></script>
```

Also update the domain string in the Plausible dashboard (Site Settings → General → Domain).

### P2 — Supabase account-deletion SQL not deployed (App Store gate)

`server/sql/delete-account.sql` committed but never pasted into the Supabase SQL editor. Client already shows a graceful fallback. Blocks iOS App Store submission (Guideline 5.1.1(v)). Has been open since 2026-06-10.

**Jack: paste `server/sql/delete-account.sql` into the Supabase SQL editor. Takes 2 minutes.**

### P3 — No SRI hashes on CDN scripts (Open #10, deferred post-LLC)

Deferred per PM v78 (post-LLC scope). Not re-flagging until LLC is registered.

**Fix when ready (30 min, run from a network-connected terminal):**
```bash
curl -sL https://unpkg.com/react@18.3.1/umd/react.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -sL https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -sL https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
```

Add `integrity="sha384-<HASH>"` to each `<script>` in `index.html`. SRI works without a CSP — doesn't break Babel's `eval()` usage.

---

## What Breaks First at Scale

**Open-Meteo's free tier under a traffic spike.** The VPS proxy's 2hr shared weather cache is the only thing between a Reddit/HN spike and a rate-limit wall. With the cache cold and 14 simultaneous fresh-loading users, the entire daily free-tier quota (~10,000 calls) is gone in under a minute. After that, `fetchWeather` returns null, all venues score 50, and the grid looks dead to every new visitor. New users see a broken product, not a rate-limited one.

**The defense is one SSH command.** Keep a terminal window open on the VPS when any traffic campaign is active. `pm2 describe peakly-proxy` shows uptime and cache size in real time. If the proxy ever goes down, `pm2 restart peakly-proxy` brings it back in under 5 seconds. At >5K MAU: upgrade to the $12 2GB DigitalOcean plan and run `pm2 start proxy.js -i 2` (cluster mode) so a process crash doesn't cold-flush the LRU.

---

*Report generated by DevOps agent — 2026-07-05. VPS health unverifiable from sandbox (403 egress block on `peakly-api.duckdns.org`); all checks run against local repo. Cache bumped `20260704a` → `20260705a` this run.*
