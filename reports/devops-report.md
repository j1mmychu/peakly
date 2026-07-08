# Peakly DevOps Report — 2026-07-08

**Status: GREEN** — No P0s. Cache stamp bumped `20260707a` → `20260708a` this run. All structural invariants pass. VPS unverifiable from sandbox (Day 8 same story). Week-2 window opens July 11 per PM — VPS health check before then is P1.

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Venue count 156 / 353 / 358 / 372" | **370 (131 ski / 239 beach). Eval only — grep undercounts.** |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "Cross-category photo contamination" | **FIXED 2026-07-06 (`73db399`).** Stop. |
| "Plausible data-domain wrong" | **FIXED 2026-07-07 → `j1mmychu.github.io/peakly`.** Stop. |
| "197 empty-tag venues" | **FALSE. All 370 have tags.** Stop. |
| "Cache buster stale / 20260707a" | **Bumped this run → `20260708a`.** Stop re-flagging yesterday's stamp. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,443 lines · 673 KB |
| Brace balance | ✅ 5,565 / 5,565 BALANCED |
| Cache stamp (`app.jsx` / `sw.js` / `index.html`) | ✅ `20260708a` (bumped this run) |
| Venue count | ✅ 370 (131 ski / 239 beach) via eval bracket-walk |
| `.venue-baseline` | ✅ 370 |
| GEAR_ITEMS refs | ✅ 0 |
| Plausible analytics | ✅ Present, `defer`, `data-domain="j1mmychu.github.io/peakly"` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 (unpkg) |
| Supabase JS | ✅ 2.106.2 (lazy-loaded, jsdelivr) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not raw IP, not HTTP) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + fallback |
| `fetchWeather` / `fetchMarine` | ✅ 3-retry, 1.2s/2.4s backoff, proxy-first w/ Open-Meteo fallback |
| Image lazy loading | ✅ All 9 `<img>` tags have `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, secrets |
| Travelpayouts token in client | ✅ NOT present — server-side only |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate link marker, not a secret |
| HTTP (non-HTTPS) URLs in app.jsx | ✅ None |

---

## Fix Applied This Run — Cache Stamp

**What:** `20260707a` was yesterday's stamp. Today is 2026-07-08. All three files (`app.jsx`, `sw.js`, `index.html`) needed updating for SW to invalidate correctly on returning users.

**Applied:**
```bash
perl -pi -e 's/20260707a/20260708a/g' app.jsx sw.js index.html
```

All three files now in lockstep at `20260708a`. Brace balance unchanged.

---

## P1 (Ongoing — Day 8 Post-Launch) — VPS Weather Cache Health

**Status: Unverifiable from sandbox.** Same as yesterday — 403 egress block on `peakly-api.duckdns.org` from this container.

**Why it matters today specifically:** The PM's Week-2 KPI window opens **July 11** (three days). Return-rate and bounce data from that window feed every sprint decision for the next month. If the VPS cache is cold or pm2 has silently restarted (OOM, anything), weather scores have been defaulting to 50 for 8 days. A user who saw blank scores during Week 1 already churned — can't fix that. Catching it now, before the Week-2 measurement window opens, protects the return-rate KPI.

**Jack: 90-second check before July 11:**
```bash
curl https://peakly-api.duckdns.org/health
# Healthy: wx_cache_size > 0, uptime > 24h, poll_fires > 0
# Sick (wx_cache_size == 0 → cache cold):
ssh root@198.199.80.21 "pm2 restart peakly-proxy"

# Free 30-second hardening — cluster mode survives single-process crash:
ssh root@198.199.80.21 "pm2 delete peakly-proxy && pm2 start /opt/peakly-proxy/proxy.js --name peakly-proxy -i 2 && pm2 save"
```

Cluster mode means one worker dying no longer cold-flushes the entire in-memory weather cache. Zero cost.

---

## P2 (Day 29 Open) — Supabase Account Deletion SQL

`server/sql/delete-account.sql` has been committed since 2026-06-10. The client shows a graceful fallback message until deployed. Blocks iOS App Store Guideline 5.1.1(v) if a submission ever happens.

**Jack: 3-minute unblock:**
```bash
cat server/sql/delete-account.sql
# Copy output → https://supabase.com/dashboard/project/wsoqcfwkvvemtlddcgfc/sql/new
# Paste → Run
# Verify: Database → Functions → search "delete_user"
```

No code changes. Pure SQL paste.

---

## P2 (Content Sprint) — Duplicate Venues + Tag Placeholders

PM v81 identified these as July-7 sprint items still open:

- `bigsky` and `beach_miami` — suspected duplicate IDs. Verify with `node -e` eval count after removal.
- 5 ski venues with placeholder tags (`winter-park`, `copper-mountain`, `lake-louise`, `palisades-tahoe`, `brighton`) — content/PM scope to approve and fill, but the gap affects search corpus and filter-click accuracy.

These are content tasks. Flagging here because they affect venue-count integrity and the auto-push guard's baseline.

---

## P3 — No SRI on CDN Scripts (Open #10, Deferred Post-LLC)

Commands when ready:

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
| Travelpayouts server token | ✅ Server-side only in `proxy.js` env vars, never in client |
| Supabase anon key | ✅ In client intentionally (RLS-gated, public-safe) |
| TP_MARKER affiliate tag | ✅ Public affiliate link marker — not a secret |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| HTTP URLs in app.jsx | ✅ Zero |
| Recent commits (last 10) | ✅ All DevOps/PM/Content reports + cache fixes — no secrets |
| Sentry DSN in client | ✅ Public error reporting endpoint — intentional |
| API keys in working tree | ✅ None detected |

---

## Performance & Cost

**Cold-start JavaScript payload:**

| Resource | Size | Notes |
|---|---|---|
| Babel Standalone 7.29.7 | ~1.7 MB | Structural constraint — no-build architecture |
| ReactDOM 18.3.1 prod | ~1.1 MB | |
| React 18.3.1 prod | ~130 KB | |
| app.jsx (transpiled in-browser) | ~673 KB | |
| Sentry SDK (`defer`) | ~100 KB | Off critical path |
| Supabase JS 2.106.2 (`lazy`) | ~80 KB | Only loads on auth flow |
| **Total first-paint critical** | **~3.6 MB ungzipped** | GitHub Pages serves gzip; real transfer ~1.1 MB |

Babel is a structural constraint. Not touching without a full architecture decision. Costs ~1.2s on LTE, ~4s on 3G. Nothing actionable here until architecture changes.

**Infrastructure cost projection:**

| MAU | Monthly cost | Notes |
|---|---|---|
| Current (<100) | **$6/mo** | DigitalOcean droplet only |
| 1K MAU | **$6/mo** | Open-Meteo free tier holds; proxy cache absorbs |
| 10K MAU | **~$15/mo** | $12/mo 2GB droplet; Open-Meteo still free |
| 100K MAU | **~$60/mo** | $29/mo Open-Meteo paid + $24/mo 4GB droplet |

**Free wins available now:**
1. `pm2 start proxy.js -i 2` cluster mode (P1 above) — crash-resilient cache, 30 seconds, $0
2. Supabase delete-account SQL (P2 above) — App Store unblock, 3 minutes, $0
3. SRI hashes (P3) — security hardening, ~15 min when LLC is ready, $0

---

## What Breaks First at Scale

**Open-Meteo's free tier, within 2 minutes of a Reddit/HN spike.** The VPS proxy's 2hr in-memory LRU cache is the only wall between a traffic surge and rate-limit hell. Cache-cold + 14 simultaneous users on fresh load = daily free-tier quota exhausted before anyone sees a real score. After that, `fetchWeather` returns null, score defaults to 50 across all 370 venues, and the grid looks dead to every new visitor in that window. The VPS health check needed before July 11 is the same check that tells you whether this already happened during Week 1. At >5K MAU the math closes on the $29/mo Open-Meteo paid plan — buy it before you need it, not after the first 503 storm.

---

## Fixes Applied This Run

| Fix | Impact |
|---|---|
| Cache stamp `20260707a` → `20260708a` across `app.jsx` + `sw.js` + `index.html` | Returning users get SW refresh; three-file lockstep maintained |

---

*DevOps agent — 2026-07-08 UTC | Venues: 370 (131 ski / 239 beach) | Braces: 5,565/5,565 BALANCED | Cache: `20260708a` | VPS: unverifiable from sandbox — **Jack: check `/health` before July 11***
