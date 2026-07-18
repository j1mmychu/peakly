# Daily DevOps Report — 2026-07-18

**Status: GREEN** — No P0 or P1 issues. Code freeze day 4 (no commits since July 14). Cache `20260714a` stable and correct. Brace balance clean. AP_CONTINENT gap (flagged July 17) **confirmed false positive** — all 6 codes present in quoted-key format at `app.jsx:401–435`. No new security, infra, or performance regressions.

---

## Permanent Stop-Reporting Table

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. |
| "Sentry DSN empty" | **Active at `app.jsx:7` and `index.html:77`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon CUT for v1.** Stop. |
| "Travelpayouts token in client" | **Server-side only. `TP_MARKER` is a public affiliate link suffix, not a secret.** Stop. |
| "Supabase anon key exposed" | **Expected. RLS-gated. Public-safe by design.** Stop. |
| "Cache buster stale" | **`20260714a` — accurate to last code change (July 14). Age alone ≠ stale. Auto-bumps on next code change via auto-push.sh.** Stop. |
| "Venue count 156 / 353 / 370 / 372 / 375 / 377" | **375 via unique-ID count. Bracket-walker overcounts `{` in CSS/JS strings — false positive. 375 is authoritative.** |
| "lateSeason: 6 / 13 venues" | **14 (Engelberg added July 14). Grep-confirmed.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |
| "AP_CONTINENT gap — KUL/SNA/MCT/GIG/TFS/CHQ missing" | **FALSE POSITIVE.** All 6 confirmed at `app.jsx:401–435` (quoted-key format). KUL:asia, SNA:na, MCT:asia, GIG:latam, TFS:europe, CHQ:europe. DevOps July-17 regex only matched unquoted keys and missed them. Zero venues are unmapped. **Stop permanently.** |
| "venue-baseline drift / 377 venues" | **FALSE POSITIVE. Bracket-walker overcounts. Unique-ID count = 375. Baseline (375) CORRECT.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary in code. Appears in a comment only.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` lines | 13,507 |
| `app.jsx` raw size | 676,312 bytes (~660KB raw / ~180KB gzipped est.) |
| Brace balance | **5,572 / 5,572** ✅ |
| PEAKLY_BUILD | `20260714a` |
| sw.js CACHE_NAME | `peakly-20260714a` |
| index.html `?v=` param | `20260714a` |
| All 3 stamps in lockstep | ✅ |
| Code freeze | Day 4 (no commits since July 14 — report-only runs) |
| Venue count (unique-ID) | **375** (133 ski / 242 beach) |
| Venue baseline file | **375** ✅ matches |
| lateSeason venues | **14** (grep confirmed) |
| AP_CONTINENT coverage | ✅ All venue `ap` codes present — July 17 gap finding was false positive |
| Plausible analytics | ✅ Present, uncommented (`script.hash.js`), correct domain |
| Sentry DSN | ✅ Active (`9416b032…` at `app.jsx:7`, `index.html:77`) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` |
| Travelpayouts token in client | ✅ None — server-side only |
| GEAR_ITEMS refs | ✅ 0 |
| Images lazy | ✅ All 9 `<img>` render sites use `loading="lazy"` |
| `.gitignore` covers secrets | ✅ `.env`, `*.pem`, `*.p8`, `*.key`, `*.p12`, PDFs all covered |
| React CDN | 18.3.1 ✅ (current 18.x) |
| Babel CDN | 7.29.7 ✅ (8.x ESM-only, incompatible — don't upgrade) |
| Flight proxy timeout | 5,000ms + AbortController ✅ |
| Weather proxy timeout | 4,000ms + AbortController ✅ |

---

## P0 — Critical (blocks launch)

None.

---

## P1 — High (fix this week)

None.

---

## P2 — Medium (fix this sprint)

### 1. No SRI on CDN Scripts (persistent — Day 4+)

`index.html` loads React, ReactDOM, and Babel Standalone from unpkg without `integrity=` hashes. A CDN compromise or cache-poisoning attack injects arbitrary code silently.

**Fix — generate hashes and add `integrity=`:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then update `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<REACT_HASH>"></script>
<script crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-<REACTDOM_HASH>"></script>
<script
  src="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
  integrity="sha384-<BABEL_HASH>" crossorigin></script>
```

Time to fix: 30 minutes (hash generation + smoke test).

---

### 2. No Content-Security-Policy (persistent — Day 4+)

No CSP meta tag. Low practical risk today (no user-generated HTML rendered) but the attack surface grows with every sharing feature. Babel forces `unsafe-eval`; CSS injection forces `unsafe-inline`. This CSP blocks arbitrary framing and external exfiltration while allowlisting every origin the app touches:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
    script-src 'self' 'unsafe-eval' https://unpkg.com https://plausible.io https://js.sentry-cdn.com https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
    font-src https://fonts.gstatic.com;
    img-src 'self' data: https://images.unsplash.com;
    connect-src 'self' https://peakly-api.duckdns.org https://api.open-meteo.com https://marine-api.open-meteo.com https://wsoqcfwkvvemtlddcgfc.supabase.co https://plausible.io https://o4511108649058304.ingest.us.sentry.io;
    frame-ancestors 'none';">
```

Time to fix: 45 minutes (add + smoke test map, Supabase auth, weather, flights, Leaflet lazy-load).

---

## Security Audit — Clean

| Check | Result |
|---|---|
| Travelpayouts API token in client | ✅ Server-side only (`process.env.TRAVELPAYOUTS_TOKEN` in `proxy.js:12`) |
| `TP_MARKER = "710303"` in `app.jsx` | ✅ Public affiliate ID — not a secret |
| `SUPABASE_ANON_KEY` in `app.jsx` | ✅ Intentional; RLS-gated per architecture docs |
| Sentry DSN | ✅ Live, configured |
| `.gitignore` | ✅ Covers `.env`, `*.key`, `*.p8`, `*.pem`, PDFs, business docs |
| Recent git log | ✅ No secrets — report-only commits since `747c35a` (July 14) |
| GEAR_ITEMS | ✅ 0 refs — Amazon cut for v1 |

---

## Live Site Health — Clean

| Check | Result |
|---|---|
| Plausible analytics | ✅ Present, uncommented (`script.hash.js`) |
| Cache stamp lockstep | ✅ All `20260714a` — in sync |
| Cache stamp age | 4 days — no code shipped since July 14; accurate, not stale |
| CDN scripts | ✅ HTTPS only |
| Lazy image loading | ✅ All 9 render sites use `loading="lazy"` |
| Leaflet | ✅ Lazy-loaded via `ensureLeaflet()` |
| Sentry | ✅ Initialized, `tracesSampleRate: 0.05` |

---

## Flight Proxy — Clean

| Check | Result |
|---|---|
| Proxy URL | ✅ HTTPS (`https://peakly-api.duckdns.org`) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s `AbortController` per attempt |
| Retry logic | ✅ 3 attempts, 1.2s/2.4s backoff on 429/5xx |
| Fallback on proxy down | ✅ Returns `null` → estimate price shown |
| `_tryProxyWx` timeout | ✅ 4s `AbortController` |
| Weather fallback | ✅ Falls through to direct Open-Meteo on proxy fail |

---

## Performance

**Estimated initial payload (gzipped):**

| Resource | ~Size gzipped |
|----------|--------------|
| React 18 UMD prod | ~44KB |
| ReactDOM 18 UMD prod | ~130KB |
| Babel Standalone 7.29.7 | ~250KB |
| Sentry SDK | ~30KB |
| app.jsx (Babel parses at runtime) | ~180KB |
| **Total cold start** | **~634KB** |

**Biggest bottleneck:** Babel Standalone at ~250KB gzipped, parsed and executed before React renders anything. First Contentful Paint blocked 300–800ms on mid-tier mobile. Structural constraint of the no-build architecture — not fixable without a build step.

**app.jsx growth:** 12,500 lines (June 9) → 13,507 (July 18) = +1,007 lines in 5.5 weeks. Parse time grows linearly. Not a crisis yet.

**Good:** Leaflet lazy-loads only on map view; Supabase JS lazy-loads only on auth trigger. ~230KB saved off the critical path.

---

## Cost Projections

Current: **$6/month** (DigitalOcean 1GB droplet). GitHub Pages free. Open-Meteo free tier.

| MAU | Monthly cost | Bottleneck |
|-----|-------------|------------|
| 1K | $6 | Comfortable — DO droplet idle |
| 10K | $12–18 | VPS weather cache earns its keep; memory usage climbs |
| 100K | $50–100 | Upgrade to $24/mo DO (2GB/2vCPU) + Redis ($7/mo) for cache persistence |

---

## What Breaks First at Scale

**Open-Meteo free tier at ~66 req/s.** The VPS weather cache (in-memory, 2h TTL) collapses N concurrent users on the same venue into 1 upstream call. The risk: **the cache resets on every VPS restart or redeploy**. A Reddit spike + proxy restart during the surge = all 375 venues fetch simultaneously → 429s across the board. Prevention before distribution push: (1) add `Cache-Control: public, max-age=7200` on `/api/weather` responses so browsers cache too, and (2) persist the in-memory cache to disk on `SIGTERM` (`fs.writeFileSync`). Both are ~20 lines in `server/proxy.js`. Requires VPS deploy, not a client change.

---

## Venue & Data Integrity

| Check | Result |
|---|---|
| Venue count (unique-ID) | **375** (133 ski / 242 beach) |
| `.venue-baseline` | **375** ✅ matches |
| Duplicate IDs | ✅ 0 |
| lateSeason venues | **14** (Engelberg added July 14 — `747c35a`) |
| AP_CONTINENT coverage | ✅ All 375 venue `ap` codes present — including KUL/SNA/MCT/GIG/TFS/CHQ confirmed at `app.jsx:401–435` |
| GEAR_ITEMS refs | ✅ 0 |
| poolPrimary refs in VENUES | ✅ 0 (only appears in a comment) |
