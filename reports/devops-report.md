# Peakly DevOps Report — 2026-07-03

**Status: 🟡 YELLOW**

Structurally clean. Reddit launch was scheduled for Monday June 30 — 3 days have elapsed with zero commits, meaning no agent activity and no code changes post-launch. Cache stamp was 4 days stale (`20260629a` → bumped to `20260703a` this run). Two persistent P1s remain open: SRI hashes (#10) and Plausible domain scope. VPS unverifiable from sandbox; 3 days post-Reddit launch, Jack must confirm `/health` is still warm.

---

## Fixes Shipped This Run

| Fix | File | Value |
|-----|------|-------|
| Cache buster `20260629a` → `20260703a` | `app.jsx:17` | 4 days stale → current |
| SW CACHE_NAME `peakly-20260629a` → `peakly-20260703a` | `sw.js:2` | Evicts stale cached assets on next visit |
| Query string `?v=20260629a` → `?v=20260703a` | `index.html:395` | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

**Network unreachable from sandbox** — outbound HTTPS to `j1mmychu.github.io` and `peakly-api.duckdns.org` times out. Per CLAUDE.md 2026-06-13: sandbox egress block, not a real outage. Jack must verify manually (see checklist below).

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 657 KB raw** |
| `PEAKLY_BUILD` stamp | `20260629a` → **bumped to `20260703a`** this run |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260703a` ✅ |
| Brace balance | **5,565 / 5,565 — BALANCED** ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Sentry DSN | `9416b032a4…@o4511108649058304.ingest.us.sentry.io`, `defer`'d, live ✅ |
| GEAR_ITEMS (Amazon) | `grep -c GEAR_ITEMS app.jsx` → **0** — v1 cut confirmed ✅ |
| Venue count | **370** (131 skiing / 239 beach) via eval ✅ |
| Eager Supabase `<script>` | Removed from index.html — lazy-load only ✅ |
| Days since last commit | **4 days** (last: 2026-06-29) ⚠️ |

**⚠️ 4 days no commits.** Reddit launched June 30. Zero agent activity or code changes since. Either the agents went dark post-launch, or nothing broke — both are possible. If Sentry shows new errors from June 30 onward, those 4 days of silence are a problem.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in client | `https://peakly-api.duckdns.org` — HTTPS only ✅ |
| HTTP bare-IP (104.131.82.242) | Not present in client code ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000 ms `AbortController` + 3 retries with 1.2s backoff ✅ |
| Weather proxy timeout | 4 s (`_tryProxyWx`) + direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only ✅ |
| Live VPS health | **UNVERIFIABLE FROM SANDBOX** — last confirmed healthy 2026-06-13 |

Jack: `curl https://peakly-api.duckdns.org/health` — confirm `wx_cache_size > 0` and no unexpected errors. If the VPS has been serving real traffic since June 30, check `pm2 logs peakly-proxy --lines 100` for any 500s or OOM restarts.

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| Batch strategy | 50 venues per batch, throttled at 2s intervals ✅ |
| Rate-limit protection | VPS weather cache (2hr LRU) shields direct Open-Meteo ✅ |
| Babel in PRECACHE | `sw.js` PRECACHE = `["https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"]` ✅ |

**Free-tier ceiling math:** 370 venues × ~2 weather calls = ~740 upstream requests per fresh-load user. Open-Meteo free tier cap is ~10,000 req/day → 13 simultaneous fresh-load users saturates it without the proxy cache. With VPS cache warm, 1,000 concurrent users on the same cached coords = 1 upstream call.

**Post-launch concern:** If the VPS restarted at any point since June 30 (OOM, apt-update reboot, anything), the in-memory weather cache reset to 0. Cold cache + Reddit traffic = direct Open-Meteo hammering. Check `pm2 describe peakly-proxy` → `uptime` field. If uptime < 3 days, the VPS restarted post-launch.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present — server-side env var only |
| Supabase anon key in client | ✅ Intentional — public anon key, RLS-gated, not a secret |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision`, PDFs |
| `proxy.js` token handling | ✅ `process.env.TRAVELPAYOUTS_TOKEN` only |
| TP_MARKER `710303` in client | ✅ Affiliate marker only — not a token |
| Recent commits for leaks | ✅ Last 20 commits clean — no env vars, no credentials |
| SRI on CDN scripts | ⚠️ **Open #10** — none on React, ReactDOM, Babel, Sentry |

---

## 5. Performance Analysis

| Asset | Est. Gzip | Notes |
|-------|-----------|-------|
| Babel Standalone 7.29.7 | ~1,800 KB raw / ~430 KB gzip | SW PRECACHE'd — cached after first visit ✅ |
| ReactDOM 18.3.1 | ~130 KB gzip | |
| app.jsx (raw) | 657 KB / ~161 KB gzip | |
| Sentry SDK | ~50 KB gzip | `defer`'d — off critical path ✅ |
| React 18.3.1 | ~11 KB gzip | |
| **First load total** | **~800 KB transferred** | Babel served from SW cache on repeat visits |

**Biggest bottleneck:** Babel Standalone — 1.8MB unzipped, parsed and run before a single React component renders. No mitigation inside the no-build constraint; SW PRECACHE is the only lever and it's already pulled. First-visit mobile performance is ~3–5 seconds on 3G; repeat visits are fast.

**CDN versions current:** React 18.3.1, Babel 7.29.7, Sentry via CDN ✅

---

## P1 — Open Issues

### P1.1 — No SRI on React, ReactDOM, Babel, Sentry (Open #10)

Still open. A CDN compromise on unpkg or sentry-cdn would inject arbitrary JS with no detection. Babel is the most dangerous target — it eval-executes 657KB of JSX with no sandboxing.

**⚠️ DO NOT add a `<meta>` CSP alongside SRI — Babel Standalone requires `unsafe-eval` to transpile JSX; a CSP would break the entire app.**

```bash
# Run from any networked machine to generate hashes:
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
```
This trades a ~400 KB cache entry for zero Babel download cost on every return visit. **Risk:** if the CDN URL ever changes (version bump), the old cached Babel gets served indefinitely until cache eviction. Pin the exact version (already done in the URL) and bump in lockstep with `CACHE_NAME`.

Then in `index.html`, update each script tag:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"
></script>
```

**Estimated fix time: 30 minutes.**

### P1.2 — Plausible `data-domain` captures entire GitHub Pages subdomain (Open)

```html
<!-- current — tracks all of j1mmychu.github.io, not just /peakly: -->
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>

<!-- fix — path-scoped: -->
<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.hash.js"></script>
```

With Reddit traffic from June 30, any other project under `j1mmychu.github.io` contaminates Peakly's Plausible dashboard. The fix is one attribute change + updating the site entry in Plausible's dashboard settings. **Estimated fix time: 2 minutes.**

---

## 6. Cost Estimate

| MAU | Monthly Cost | Bottleneck |
|-----|-------------|------------|
| 1K | **$6** | VPS only; Open-Meteo free; GitHub Pages free |
| 10K | **$12–18** | VPS upgrade (~2GB droplet) at ~5K MAU |
| 100K | **$50–120** | VPS $48 (4GB) + Open-Meteo commercial tier |

**Reddit launch cost impact:** A typical 500-upvote post drives 2,000–8,000 visits over 48 hours. That's ~$0 incremental cost — GitHub Pages + Open-Meteo free tier handles it if the VPS cache was warm. If Open-Meteo throttled and the direct fallback fired 5,000 times, still within their free tier. Net: **the launch should have cost $0 extra.**

**Next cost threshold:** ~5K MAU. At that point, 1GB VPS hits OOM risk from pm2 heap growth under sustained concurrent load. Upgrade to 2GB ($12/mo) before that point, not after.

---

## Post-Reddit-Launch Checklist (Jack — Manual)

3 days have elapsed since the June 30 launch. Verify before the next post/press mention:

- [ ] `curl https://peakly-api.duckdns.org/health` → `{"status":"ok", "wx_cache_size":N}` (N > 0 means cache is warm)
- [ ] `pm2 describe peakly-proxy` → check `uptime` field; if < 3 days, VPS restarted post-launch and cache was cold during traffic
- [ ] `pm2 logs peakly-proxy --lines 100` → scan for 500 errors, OOM kills, unhandled promise rejections
- [ ] Check Sentry dashboard for errors since June 30 — especially `ReferenceError`, `TypeError`, ErrorBoundary triggers
- [ ] Check Plausible for bounce rate — >80% mobile bounce means something is broken on first load
- [ ] `curl https://j1mmychu.github.io/peakly/` → HTTP 200 with `20260703a` in response body (after this push deploys)
- [ ] Check Supabase Auth → Users — any signups from the Reddit post? Magic-link conversion is the virality metric.

---

## Pre-Launch Checklist (Jack manual actions)

**VPS memory on a second traffic spike.** The 1GB droplet runs pm2 + Node + Caddy + in-memory LRU weather cache (4,000 entries at ~2KB each = ~8MB baseline) + flight cache + alert store. Under the current baseline, headroom is comfortable. Under a second spike — another Reddit post, HN front page, press — unique (lat,lon) pairs pile into the cache faster than TTLs evict them. At 5,000 unique venue coords in a 2-hour window, the 4,000-entry LRU ceiling causes aggressive eviction under load, which actually protects memory but increases upstream Open-Meteo calls at exactly the wrong moment. Simultaneously, pm2 heap expands under connection pressure and the 1GB wall approaches. **Prevention:** upgrade to the 2GB DigitalOcean droplet ($6 → $12/mo) before any second significant traffic event. That buys headroom for 10K MAU without touching the code. After 10K MAU, the real fix is Redis (shared cache that survives pm2 restarts) — but that's a v2 problem.
