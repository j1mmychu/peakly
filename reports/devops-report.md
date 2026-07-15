# Peakly DevOps Report — 2026-07-15

**Status: GREEN** — No P0 or P1 issues. Core health solid. Two P2 items persisting (SRI + venue-baseline drift). Eight days without an app.jsx commit — product is in post-launch stabilization mode, cache stamp is accurate.

---

## Permanent Stop-Reporting Table

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. |
| "Sentry DSN empty" | **Active at `app.jsx:7` and `index.html:77`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon CUT for v1.** Stop. |
| "Travelpayouts token in client" | **Server-side only. `TP_MARKER` is a public affiliate link suffix, not a secret.** Stop. |
| "Cache buster stale / 20260707a" | **Accurate — zero app.jsx/sw.js/index.html commits since July 7. Stamp correct.** |
| "Venue count 156 / 353 / 370" | **372 via bracket-walker eval. Grep to category: undercounts to ~156.** |
| "lateSeason: 6 venues" | **20 venues. Stop.** |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7 (`4001690`).** Stop. |
| "Supabase anon key exposed" | **Expected. RLS-gated. Public-safe by design.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,443 lines · 673 KB (gzipped to ~100–130 KB on GH Pages) |
| Cache stamp (`app.jsx` / `sw.js` / `index.html`) | ✅ `20260707a` (accurate — no app file changes in 8 days) |
| Days since last `app.jsx` commit | **8 days** (last: glacier venue add, July 7) |
| Venue count (bracket-walker eval) | ✅ **372** (131 ski / 239 beach) |
| `.venue-baseline` | ⚠️ **370** — 2 behind actual count (see P2 below) |
| `lateSeason: true` venues | ✅ 20 |
| `poolPrimary: true` venues | ✅ 25 |
| `GEAR_ITEMS` refs | ✅ 0 |
| Plausible analytics | ✅ Present, uncommented, `defer`, domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 (unpkg, preloaded) |
| Supabase JS | ✅ 2.106.2 (lazy-loaded via jsdelivr — off critical path) |
| Leaflet | ✅ 1.9.4 (lazy-loaded via unpkg — off critical path) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not raw IP, not HTTP) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + 2-retry exponential backoff |
| `fetchWeather` / `fetchMarine` timeout | ✅ 8s AbortController, 3 retries at 1.2s/2.4s, proxy-first with direct fallback |
| `PRECACHE` | ✅ `[]` (no static precaching — service worker is cache-on-demand only) |
| Image lazy loading | ✅ All 9 `<img>` sites use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, secrets, business docs |
| Travelpayouts token in client | ✅ ABSENT — server-side only |
| SRI on CDN scripts | ❌ MISSING on 5 scripts (see P2 below) |
| CSP meta tag | ❌ ABSENT (Open #10 — see P2 below) |

---

## Issues

### P2 — `.venue-baseline` Stale (+2 behind actual count)

**Reality:** bracket-walker returns 372; `.venue-baseline` holds 370. The guard auto-updates the baseline on any increase, so 2 venues were committed via a path that bypassed `auto-push.sh` (direct `git commit` without the PostToolUse hook, or the hook ran in a session where node eval returned empty and the grep fallback counted 370).

**Risk:** Low. The guard only blocks on a drop of >5, so this is a false-floor issue, not a live block. But the guard is watching for drops from 370 rather than 372 — a silent 2-venue deletion would pass.

**Fix (30 seconds, Jack only):**

```bash
echo "372" > ~/peakly/scripts/.venue-baseline
cd ~/peakly && git add scripts/.venue-baseline && git commit -m "fix: venue-baseline 370→372"
```

---

### P2 — No SRI on CDN Scripts (Open #10 — persistent)

**Reality:** 5 external scripts load without `integrity=` hashes. If unpkg, sentry-cdn.com, or plausible.io serves compromised JS (CDN compromise, BGP hijack), it runs with full DOM access.

**Scripts missing SRI:**

```
https://unpkg.com/react@18.3.1/umd/react.production.min.js
https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js
https://unpkg.com/@babel/standalone@7.29.7/babel.min.js
https://js.sentry-cdn.com/9416b032a46681d74645b056fcb08eb7.min.js
https://plausible.io/js/script.hash.js
```

**Fix:** Generate hashes and add `integrity=` + `crossorigin="anonymous"` to `index.html`:

```bash
# Run once from a networked terminal to get hashes:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js" | openssl dgst -sha384 -binary | openssl base64 -A
```

Then in `index.html`:

```html
<script crossorigin="anonymous"
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-PASTE_HASH_HERE"></script>
```

**Blocker caveat:** Adding SRI to `@babel/standalone` is risky — Babel uses `eval()` internally and some browsers block eval under SRI + strict CSP. Add SRI to React + ReactDOM first (safe); Babel SRI requires a browser smoke test before deploying. Sentry and Plausible load with `defer` and don't block render — safe to add SRI to both.

**Estimated time:** 20 minutes. Defer until post-launch unless App Store reviewer flags it.

---

### P2 — No Content Security Policy (Open #10 — persistent)

CSP mitigates XSS; absence means any injected script runs unconstrained.

**Fix:** Add to `index.html` `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://unpkg.com
    https://cdn.jsdelivr.net
    https://plausible.io
    https://js.sentry-cdn.com;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://wsoqcfwkvvemtlddcgfc.supabase.co
    https://fonts.googleapis.com
    https://fonts.gstatic.com
    https://plausible.io
    https://o4511108649058304.ingest.us.sentry.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com;
  frame-ancestors 'none';
">
```

**Note:** `'unsafe-eval'` is required because Babel Standalone uses `eval()`. This CSP is still meaningful: it blocks external script loads and restricts `connect-src` to known hosts. Test before deploy — Supabase magic-link auth embeds `access_token` in `window.location.hash`; add `wss://` to `connect-src` only if Supabase Realtime is ever enabled (currently off).

**Estimated time:** 30 minutes including smoke test. Defer until post-launch.

---

## Performance Analysis

**Single largest bottleneck: Babel Standalone (~1 MB raw, ~400 KB gzip, ~200–400ms parse on mid-range mobile)**

Every cold start downloads and executes Babel to transpile 673 KB of JSX in-browser. Can't eliminate without a build step (violates architecture constraint). It's already preloaded via `<link rel="preload">` — that's the best available mitigation. If TTI becomes a measurable bounce driver post-Reddit: measure with Lighthouse, then evaluate a CI-only `babel --presets react app.jsx -o app.js` step (GitHub Actions, zero local tooling required).

Everything else is correctly optimized:
- Supabase JS: lazy-loaded, only injected on sign-in. ✅
- Leaflet: lazy-loaded, only injected on map open. ✅
- All images: `loading="lazy"`. ✅
- app.jsx on wire: ~130 KB gzipped — not a concern.

---

## VPS Health (Sandbox — Not Verifiable)

This run is in a network-blocked sandbox. `peakly-api.duckdns.org` cannot be reached. **Sandbox 403 = egress block, NOT VPS outage.** Last verified healthy: June 13 (networked session — `wx_cache_size` populated, poll worker running, uptime 3.2d, VPS patched to kernel 6.8.0-124 June 10). Jack: run `curl https://peakly-api.duckdns.org/health` from a terminal with outbound HTTPS if any doubt.

---

## Security Summary

| Item | Status |
|---|---|
| Travelpayouts server token in client | ✅ ABSENT |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe |
| Sentry DSN in client | ✅ Expected — client-side SDK pattern |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate link suffix |
| `.gitignore` coverage | ✅ `.env`, `*.pem`, `*.p8`, `*.key`, business docs |
| SRI on CDN scripts | ❌ Missing (P2, Open #10) |
| CSP | ❌ Absent (P2, Open #10) |
| Sensitive secrets in recent git log | ✅ None in last 15 commits |

---

## Cost Estimate

| Tier | MAU | Monthly Cost | Notes |
|---|---|---|---|
| Today | <500 | ~$15–25 | DO droplet $6 + Plausible ~$9. GH Pages + Supabase free. |
| 1K MAU | 1,000 | ~$25–35 | Same $6 droplet. Open-Meteo free tier (~10K calls/day) is the ceiling risk — VPS cache is protection. |
| 10K MAU | 10,000 | ~$65–90 | Upgrade VPS to 2GB ($12). Supabase Pro ($25). Plausible Growth (~$19). Open-Meteo must stay behind VPS cache or buy commercial plan ($50–200/mo). |
| 100K MAU | 100,000 | ~$250–500 | 2–3 VPS nodes or load balancer. Open-Meteo commercial mandatory. CDN for app.jsx (Cloudflare free tier). |

**Zero-cost optimization available now:** Cloudflare free tier in front of GitHub Pages — eliminates Babel re-download on repeat visits via edge cache, adds DDoS protection, zero cost. Not urgent at <500 MAU but trivial to add.

---

## What Breaks First at Scale

**Open-Meteo free tier under concurrent load, compounded by in-memory VPS cache wipe on restart.**

At 67+ simultaneous users hitting overlapping uncached venue coordinates, Open-Meteo's free tier (~10K calls/day, ~115/min) throttles. The VPS in-memory cache (2hr TTL, 4000 entries) collapses N concurrent users to 1 upstream call per coord pair. But the cache is in-memory: a VPS restart or OOM event wipes it clean. One Reddit post → ~500 simultaneous cold users → 744 Open-Meteo calls in under 60 seconds → hard throttle → "conditions unavailable" banner for everyone simultaneously.

**Prevention, in order of ROI:**
1. **Persist VPS weather cache to disk** — write the in-memory `_wxCache` map to a JSON file every 10 minutes; reload on startup. Survives restarts. ~30 lines in `proxy.js`, $0 cost.
2. **Open-Meteo commercial plan** at 1K+ MAU — $50–200/mo buys unlimited calls + SLA. Cheaper than VPS scaling.
3. **Stagger client-side fetches** — already batched (50 venues/2s per architecture), which limits burst to ~15 upstream calls per 2s window per cold user.

---

## Actions This Run

Report written. No code changes required — no P0 or P1 issues found.

**Jack-only action (2 min):**

```bash
echo "372" > ~/peakly/scripts/.venue-baseline
cd ~/peakly && git add scripts/.venue-baseline && git commit -m "fix: venue-baseline 370→372"
```
