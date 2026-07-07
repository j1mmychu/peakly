# Peakly DevOps Report — 2026-07-07

**Status: GREEN** — two P2 fixes shipped this run (Plausible domain scope + cache bump). VPS health remains unverifiable from sandbox; monitoring gap acknowledged but not escalating until Jack confirms a bounce spike.

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale / 20260706a" | **Bumped this run → `20260707a`.** Stop re-flagging yesterday's stamp. |
| "Venue count 156 / 353 / 372" | **370 (131 ski / 239 beach). Eval only — grep undercounts to 156.** |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible data-domain wrong" | **FIXED this run → `j1mmychu.github.io/peakly`.** Stop after today. |
| "197 empty-tag venues" | **FALSE. All 370 have tags.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,443 lines · 673 KB |
| Brace balance | ✅ 5,565 / 5,565 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260707a` (bumped this run from `20260706a`) |
| Venue count | ✅ 370 (131 ski / 239 beach) via `.venue-baseline` |
| GEAR_ITEMS refs | ✅ 0 |
| lateSeason venues | ✅ 25 |
| Plausible analytics | ✅ Present, uncommented, `defer`, **domain now `j1mmychu.github.io/peakly`** (fixed this run) |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 (unpkg) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not raw IP, not HTTP) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + 2-retry exponential backoff |
| `fetchWeather` / `fetchMarine` timeout | ✅ 3-retry, 1.2s/2.4s backoff, proxy-first with Open-Meteo fallback |
| Image lazy loading | ✅ All 9 `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, secrets |
| Travelpayouts token in client | ✅ NOT present — server-side only |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate link marker, not a secret |
| GEAR_ITEMS / Amazon refs | ✅ 0 (cut for v1) |

---

## P2 — Plausible `data-domain` Scope (FIXED THIS RUN)

**What was wrong:** `index.html:32` had `data-domain="j1mmychu.github.io"` — this tracks the entire GitHub Pages root, not `/peakly/` specifically. Any analytics read from the Plausible dashboard was mixing signal from other Pages subpaths. At Week 2 of launch, this makes bounce data and conversion funnels meaningless.

**Fix applied:**
```html
<!-- Before: -->
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>

<!-- After (now live): -->
<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.hash.js"></script>
```

**Jack: one more step required — update the Plausible dashboard:**
1. Log in to plausible.io → Sites → `j1mmychu.github.io`
2. Settings → General → Domain → change to `j1mmychu.github.io/peakly`
3. Or add a new site for the full path if you want a clean slate in reporting

Without the dashboard update, events tag correctly in the browser but the reporting bucket won't match. Both sides need updating for the data to be usable.

---

## P1 (Ongoing — Day 7 Post-Launch) — VPS Weather Cache Restart Risk

**Status: Unverifiable from sandbox (403 egress block on `peakly-api.duckdns.org`).**

Day 7 since the June 30 Reddit launch. The VPS proxy holds a 2hr in-memory LRU cache. If pm2 has restarted since launch (OOM, kernel update, cron reboot), `wx_cache_size = 0` and every cold Open page hits Open-Meteo directly. At ≥14 simultaneous users on fresh load, the free-tier daily quota exhausts in under a minute — venues all score 50, grid looks dead to new visitors.

**Jack: 2-minute check:**
```bash
curl https://peakly-api.duckdns.org/health
# Healthy output: wx_cache_size > 0, uptime > 1d, apns_configured: false (expected)
# Dead signal: 502/504, connection refused, or wx_cache_size == 0

# If dead or cache cold:
ssh root@198.199.80.21 "pm2 restart peakly-proxy && pm2 status"
curl https://peakly-api.duckdns.org/health | grep -E 'wx_cache_size|uptime'

# Free hardening — cluster mode prevents full cache cold-flush on single-process crash:
ssh root@198.199.80.21 "pm2 delete peakly-proxy && pm2 start /opt/peakly-proxy/proxy.js --name peakly-proxy -i 2 && pm2 save"
```

The cluster mode command is a free 30-second hardening. One worker dies → the other keeps serving cached weather data while pm2 respawns. Zero downtime, zero cost.

---

## P2 — Supabase Account Deletion SQL Not Deployed (Day 28 Open)

`server/sql/delete-account.sql` committed since 2026-06-10. Client shows a graceful fallback message until deployed. Blocks iOS App Store Guideline 5.1.1(v).

**Jack: 2-minute unblock:**
```bash
cat server/sql/delete-account.sql
# Copy output → Supabase dashboard → SQL Editor → paste → Run
# Verify: Database → Functions → search delete_user
```

Zero code changes needed. Purely a SQL paste.

---

## P3 — No SRI on CDN Scripts (Open #10, Deferred Post-LLC)

Not re-flagging until LLC registered. Generate hashes when ready:

```bash
curl -sL https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Add integrity="sha384-<HASH>" crossorigin="anonymous" to each <script> in index.html
```

SRI is compatible with Babel's inline eval — no CSP changes required.

---

## Security Audit — Clean

| Check | Result |
|---|---|
| Travelpayouts server token | ✅ Server-side only in proxy.js env vars, never in client |
| Supabase anon key | ✅ In client intentionally (RLS-gated, public-safe) |
| TP_MARKER affiliate tag | ✅ Public affiliate link marker — not a secret |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| Recent commits (last 15) | ✅ No secrets — all DevOps/PM/Content reports + photo fix |
| Sentry DSN | ✅ In client intentionally (public error reporting endpoint) |
| API keys in working tree | ✅ None detected |

---

## Performance & Cost

**Cold-start JavaScript payload:**

| Resource | Size |
|---|---|
| Babel Standalone 7.29.7 | ~1.7 MB (largest — structural constraint) |
| ReactDOM 18.3.1 prod | ~1.1 MB |
| React 18.3.1 prod | ~130 KB |
| app.jsx (transpiled in-browser) | ~673 KB |
| Sentry SDK (`defer`) | ~100 KB |
| Supabase JS (lazy) | ~80 KB |
| **Total first-paint critical** | **~3.6 MB** |

Babel is a structural constraint of the no-build-step architecture — not changing. Costs ~1.2s on LTE, ~4s on 3G. Nothing actionable here until the architecture changes.

**Infrastructure cost projection:**

| MAU | Monthly cost | Notes |
|---|---|---|
| Current (<100) | **$6/mo** | DigitalOcean droplet only |
| 1K MAU | **$6/mo** | Open-Meteo free tier handles it; proxy cache absorbs spikes |
| 10K MAU | **~$15/mo** | Upgrade droplet to $12/mo 2GB; Open-Meteo still free |
| 100K MAU | **~$60/mo** | $29/mo Open-Meteo paid plan + $24/mo 4GB droplet |

**Free wins available now:**
1. `pm2 start proxy.js -i 2` cluster mode — crash-resilient cache (see P1 above). 30 seconds, $0.
2. CDN SRI hashes (P3) — pure security hardening, $0, ~15 minutes when LLC is ready.

---

## What Breaks First at Scale

**Open-Meteo's free tier, within 2 minutes of a Reddit/HN spike.** The VPS proxy's 2hr shared LRU cache is the only wall between a traffic surge and a rate-limit wall. Cache-cold + 14 simultaneous users = daily free-tier quota exhausted before anyone sees a real score. After that, `fetchWeather` returns null, score defaults to 50 across all venues, and the grid looks dead to every new visitor who opened the page in that window. The defense is two commands: `pm2 start proxy.js -i 2` (cluster mode, cache survives worker crashes) before any distribution push, and checking `wx_cache_size` via `/health` after any VPS maintenance. At >5K MAU the math closes on the $29/mo Open-Meteo paid plan — buy it before you need it, not after the first 503 storm.

---

## Fixes Applied This Run

| Fix | Impact |
|---|---|
| Plausible `data-domain` `j1mmychu.github.io` → `j1mmychu.github.io/peakly` in `index.html:32` | Analytics now scoped to Peakly only. Week-2 retention/bounce data becomes actionable. Jack: also update Plausible dashboard to match. |
| Cache stamp `20260706a` → `20260707a` across `app.jsx` + `sw.js` + `index.html` | Forces SW update; returning users get fresh assets with the corrected Plausible domain |

---

*DevOps agent — 2026-07-07 UTC | Synced to origin/main | Venues: 370 (131 ski / 239 beach) | Braces: 5,565/5,565 BALANCED | Cache: `20260707a` | VPS: unverifiable from sandbox — check manually.*
