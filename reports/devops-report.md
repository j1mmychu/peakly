# Peakly DevOps Report — 2026-07-15

**Status: GREEN** — No P0 or P1 issues. Cache stamp `20260714a` is 1 day old and accurate. Two P2 items: venue-baseline is 2 behind actual count (+2), and Open #10 (SRI/CSP) persists. No app.jsx logic regressions detected.

---

## Permanent Stop-Reporting Table

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. |
| "Sentry DSN empty" | **Active at `app.jsx:7` and `index.html:77`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon CUT for v1.** Stop. |
| "Travelpayouts token in client" | **Server-side only. `TP_MARKER` is a public affiliate link suffix, not a secret.** Stop. |
| "Cache buster stale" | **`20260714a` — 1 day old, bumped July 14 alongside Engelberg + new venues commit.** |
| "Venue count 156 / 353 / 370 / 372" | **377 via bracket-walker eval. Grep undercounts to ~156. Stop using grep.** |
| "lateSeason: 6 / 20 / 25 venues" | **14 (Engelberg added July 14).** |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7 → `j1mmychu.github.io/peakly`.** Stop. |
| "Supabase anon key exposed" | **Expected. RLS-gated. Public-safe by design.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |
| "lateSeason regression" | **FIXED July 11 + Engelberg added July 14. Count is 14.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,506+ lines · 676+ KB (gzipped ~130 KB on GH Pages) |
| Cache stamp (`app.jsx` / `sw.js` / `index.html`) | ✅ `20260714a` — 1 day old, correct |
| Venue count (bracket-walker eval) | ⚠️ **377** (133 ski / 242 beach) |
| `.venue-baseline` | ⚠️ **375** — 2 behind actual count (see P2 below) |
| `lateSeason: true` venues | ✅ 14 (Engelberg added July 14 per PM v88) |
| `poolPrimary: true` venues | ✅ 25 |
| `GEAR_ITEMS` refs | ✅ 0 |
| Plausible analytics | ✅ Present, uncommented, `defer`, domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 (unpkg, preloaded) — stay on 7.x (8.x ESM-only) |
| Supabase JS | ✅ 2.106.2 (lazy-loaded via jsdelivr — off critical path) |
| Leaflet | ✅ 1.9.4 (lazy-loaded via unpkg — off critical path) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not raw IP, not HTTP) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + retry with exponential backoff |
| `fetchWeather` / `fetchMarine` timeout | ✅ 8s AbortController, proxy-first with Open-Meteo fallback |
| `PRECACHE` | ✅ `[]` (no static precaching — cache-on-demand only) |
| Image lazy loading | ✅ All `<img>` sites use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, secrets, business docs |
| Travelpayouts token in client | ✅ ABSENT — server-side only |
| SRI on CDN scripts | ❌ MISSING on 5 scripts (P2, Open #10) |
| CSP meta tag | ❌ ABSENT (P2, Open #10) |
| Secrets in last 15 commits | ✅ None — reports + venue data only |

---

## Issues

### P2 — `.venue-baseline` 2 Behind Actual Count

**Reality:** bracket-walker eval returns 377; `.venue-baseline` holds 375. The guard auto-increments on increases, so 2 venues were committed via a path that bypassed `auto-push.sh` (direct `git commit` without the PostToolUse hook, or node eval returned empty during that commit and the grep fallback saw 375).

The Content report (July 14) staged 5 new venues (VA Beach, Miyako-jima, Rincón PR, Amed Bali, Tofo Mozambique) with a PM "HOLD" recommendation. These 2 extra venues may be 2 of those 5 that landed via the merge. Worth verifying: are these venues intentionally in the catalog, or did the merge pull in staged-but-held content?

**Risk:** The guard floor is 375 rather than 377 — a 2-venue silent deletion would pass. Not a live blocker.

**Fix (30 seconds):**

```bash
echo "377" > ~/peakly/scripts/.venue-baseline
cd ~/peakly && git add scripts/.venue-baseline && git commit -m "fix: venue-baseline 375→377"
```

If any of those 2 extra venues should NOT be in the catalog, remove them first, then update the baseline to the correct final count.

---

### P2 — No SRI on CDN Scripts (Open #10 — persistent)

5 external scripts load without `integrity=` hashes. A CDN compromise would run injected JS with full DOM access.

**Scripts missing SRI:**

```
https://unpkg.com/react@18.3.1/umd/react.production.min.js
https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js
https://unpkg.com/@babel/standalone@7.29.7/babel.min.js
https://js.sentry-cdn.com/9416b032a46681d74645b056fcb08eb7.min.js
https://plausible.io/js/script.hash.js
```

**Fix:** Generate hashes from a networked terminal:

```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js" | openssl dgst -sha384 -binary | openssl base64 -A
```

Add `integrity="sha384-HASH" crossorigin="anonymous"` to each `<script>` tag in `index.html`. Add SRI to React + ReactDOM first (safe). Babel SRI requires a smoke test before deploy — some browsers block eval under SRI + strict CSP. **20 minutes. Defer until post-launch.**

---

### P2 — No CSP (Open #10 — persistent)

**Fix:** Add to `index.html` `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://unpkg.com https://cdn.jsdelivr.net
    https://plausible.io https://js.sentry-cdn.com;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com https://marine-api.open-meteo.com
    https://wsoqcfwkvvemtlddcgfc.supabase.co
    https://fonts.googleapis.com https://fonts.gstatic.com
    https://plausible.io
    https://o4511108649058304.ingest.us.sentry.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com;
  frame-ancestors 'none';
">
```

`'unsafe-eval'` is required while Babel Standalone runs in-browser. This CSP still meaningfully restricts `connect-src` and blocks unexpected script sources. **30 minutes including smoke test. Defer until post-launch.**

---

## Persistent P0s (Jack-Only)

**Supabase Account Deletion SQL (App Store 5.1.1(v)):** `server/sql/delete-account.sql` committed June 10. Client shows graceful fallback. Paste into Supabase SQL editor → 2 minutes → App Store blocker closed.

```bash
cat ~/peakly/server/sql/delete-account.sql
# Paste → supabase.com/dashboard → SQL Editor → Run
```

**VPS Health Verification:** Last Jack-verified July 10 (5 days ago). From a networked terminal:
```bash
curl https://peakly-api.duckdns.org/health
# Healthy: wx_cache_size > 0, poll_errors == 0
```

---

## Performance

**Biggest bottleneck: Babel Standalone (~1 MB raw, ~400 KB gzip, ~200–400ms parse on mid-range mobile)**

Can't eliminate without a build step (architecture constraint). Already preloaded via `<link rel="preload">`. If TTI drives measurable bounce post-Reddit: measure with Lighthouse first, then evaluate a CI-only `babel --presets react app.jsx -o app.js` step (GitHub Actions, zero local tooling).

Everything else correctly optimized: Supabase JS lazy-loaded, Leaflet lazy-loaded, all images `loading="lazy"`, app.jsx ~130 KB gzipped. ✅

---

## Cost Estimate

| Tier | MAU | Monthly | Notes |
|---|---|---|---|
| Today | <500 | ~$15–25 | DO $6 + Plausible ~$9. GH Pages + Supabase free. |
| 1K MAU | 1,000 | ~$25–35 | Same droplet. Open-Meteo free tier is the ceiling risk. |
| 10K MAU | 10,000 | ~$65–90 | Upgrade VPS to 2GB ($12). Supabase Pro ($25). Open-Meteo commercial ($50–200). |
| 100K MAU | 100,000 | ~$250–500 | 2–3 DO nodes + LB. Open-Meteo commercial mandatory. Cloudflare CDN (free). |

---

## What Breaks First at Scale

**Open-Meteo free-tier exhaustion on VPS cache wipe.** After any `pm2 restart`, the in-memory weather cache clears. At >67 simultaneous cold users, 377 venues × 2 API calls = 754 Open-Meteo requests in <60 seconds → free tier hits daily limit → all venue scores drop to 50 → grid looks dead.

**Prevention in ROI order:**
1. **Persist weather cache to disk** — write `_wxCache` to JSON every 10 minutes, reload on startup. ~30 lines in `proxy.js`, $0 cost.
2. **Open-Meteo commercial plan** at 1K+ MAU — $50–200/mo, unlimited calls.
3. **Client-side batching** already in place (50 venues/2s) — limits per-user burst but doesn't protect server-side warmup.

---

## Actions This Run

Report written for July 15. Venue count discrepancy flagged (+2 vs baseline). No code changes made.

**Jack action (2 min) — verify 2 extra venues are intentional, then:**
```bash
echo "377" > ~/peakly/scripts/.venue-baseline
cd ~/peakly && git add scripts/.venue-baseline && git commit -m "fix: venue-baseline 375→377"
```
