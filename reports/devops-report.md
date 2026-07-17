# Daily DevOps Report — 2026-07-17

**Status: GREEN** — no regressions, no new P0/P1s. Two persistent P2s + one new AP_CONTINENT gap finding.

---

## Quick Stats

| Metric | Value |
|--------|-------|
| app.jsx lines | 13,507 |
| app.jsx raw size | 676,312 bytes (~660KB raw / ~180KB gzipped est.) |
| Cache stamp | `20260714a` (3 days old — no code changes since, stable) |
| Venue count (node eval) | **375** (133 ski / 242 beach) |
| Venue baseline file | 375 ✓ |
| lateSeason venues | **14** (confirmed via grep) |
| AIRPORT_COORDS gaps | 0 (all venue ap codes present) |
| AP_CONTINENT gaps | **7 venues** (new finding — see P2 below) |

---

## P0 — Critical (blocks launch)

None.

---

## P1 — High (fix this week)

None.

---

## P2 — Medium (fix this sprint)

### 1. AP_CONTINENT Missing 7 Venue Airport Codes (NEW)

Seven venues reference airport codes not in `AP_CONTINENT`. This breaks continent-aware filtering and hemisphere-based season gating for those venues — the `isNorth` check will silently return `undefined` instead of `true`/`false`, meaning southern-hemisphere winter ski venues could be miscategorized.

```
KUL  → tioman-island-t11
SNA  → laguna-beach-t24
MCT  → muscat-beach-t26
MCT  → qantab-beach-oman
GIG  → ipanema-rio
TFS  → las-teresitas-tfe
CHQ  → elafonissi-beach-chq
```

**Fix — add to `AP_CONTINENT` near line 380:**
```js
// Southeast Asia / Middle East / South America / Macaronesia / US West
KUL:"as", SNA:"na", MCT:"as", GIG:"sa", TFS:"eu", CHQ:"eu",
```

**Verify after fix:**
```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('app.jsx', 'utf8');
const acMatch = code.match(/const AP_CONTINENT\s*=\s*\{([\s\S]*?)\};/);
const acKeys = new Set(acMatch[1].match(/\b([A-Z]{3}):/g).map(k => k.replace(':','')));
const vMatch = code.match(/const VENUES\s*=\s*(\[[\s\S]*?\n\];)/);
const venues = eval(vMatch[1]);
const missing = venues.filter(v => v.ap && !acKeys.has(v.ap));
console.log('Missing:', missing.length, missing.map(v => v.ap + '(' + v.id + ')').join(', '));
"
```
Expected: `Missing: 0`

Time to fix: 5 minutes.

---

### 2. No SRI on CDN Scripts (persistent — Day 3+)

`index.html` loads React, ReactDOM, and Babel Standalone from unpkg without `integrity=` hashes. A CDN compromise or malicious cache-poisoning injects arbitrary code silently.

```html
<!-- Current (no integrity) -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"></script>
```

**Fix — generate hashes and add `integrity=`:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```
Add `integrity="sha384-<HASH>"` to each tag. SRI alone (without a blocking CSP) still prevents CDN tampering.

Time to fix: 30 minutes (hash generation + smoke test).

---

### 3. No Content-Security-Policy (persistent — Day 3+)

No CSP meta tag. Low practical risk today (no user-supplied HTML rendered) but the attack surface grows with every new social/sharing feature.

Babel Standalone forces `unsafe-eval`; the style injection in app.jsx forces `unsafe-inline`. A meaningful policy that allowlists every external origin while blocking arbitrary framing:

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

Time to fix: 45 minutes (add + test all: map, Supabase auth, weather, flights, Leaflet lazy-load).

---

## Security Audit — Clean

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | ✅ Server-side only (VPS proxy) |
| `TP_MARKER = "710303"` in app.jsx | ✅ Public affiliate ID, not an API secret |
| `SUPABASE_ANON_KEY` in app.jsx | ✅ Intentional; RLS-gated per architecture docs |
| Sentry DSN | ✅ Live, configured (`9416b032…`) |
| `.gitignore` | ✅ Covers `.env`, `*.key`, `*.p8`, `*.pem`, PDFs, business docs |
| Recent git log (7 days) | ✅ No secrets — report-only commits since `747c35a` (July 14) |

---

## Live Site Health — Clean

| Check | Result |
|-------|--------|
| Plausible analytics | ✅ Present, uncommented (`script.hash.js`) |
| Cache stamp lockstep (app.jsx/sw.js/index.html) | ✅ All `20260714a` — in sync |
| Cache stamp age | ⚠️ 3 days — no code shipped since July 14 (reports only); not a bug |
| CDN scripts | ✅ HTTPS only, no HTTP |
| Lazy image loading | ✅ All 9 render sites use `loading="lazy"` |
| Leaflet | ✅ Lazy-loaded via `ensureLeaflet()` — absent from initial bundle |
| Sentry | ✅ Initialized with live DSN, `tracesSampleRate: 0.05` |

---

## Flight Proxy — Clean

| Check | Result |
|-------|--------|
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

**app.jsx growth:** 12,500 lines (June 9) → 13,507 (July 17) = +1,007 lines in 5 weeks. Parse time grows linearly. Not a crisis yet; watch for "feels slow" reports post-Reddit launch.

**Good:** Leaflet lazy-loads only on map view; Supabase JS lazy-loads only on auth trigger. These two together save ~230KB off the critical path.

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

**Open-Meteo free tier at ~66 req/s.** The VPS weather cache (in-memory, 2h TTL) collapses N concurrent users on the same venue into 1 upstream call — that's the protection. The problem: **the cache resets on every VPS restart or redeploy**. If a Reddit post drives a spike and someone restarts the proxy during the surge, all 375 venues fetch simultaneously, saturating Open-Meteo and triggering 429s across the board. Prevention before launch: add a `Cache-Control: public, max-age=7200` header on `/api/weather` responses (clients cache too) and persist the in-memory cache to disk on SIGTERM (`fs.writeFileSync`). Both are ~20 lines in `proxy.js` and require a VPS deploy, not a client change.

---

## Venue & Data Integrity

```
Total venues (node eval):  375  (authoritative)
  Skiing:                  133
  Beach:                   242
Baseline (.venue-baseline): 375 ✓
Duplicate IDs:             0 (boot-time IIFE validator)
lateSeason venues:         14
  whistler, chamonix, mammoth, abasin, tignes, cervinia,
  snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr,
  saas-fee-ch, st-moritz-ch, engelberg
AP_CONTINENT gaps:         7 venues — KUL, SNA, MCT, GIG, TFS, CHQ (see P2 #1)
AIRPORT_COORDS gaps:       0 ✓
```

> **On the "377 venues" claim in prior reports (July 15–16):** The bracket-walker in `status.sh` overcounts by 2 in edge cases. Node eval of the VENUES array gives **375** — this is the authoritative number. The baseline file is already at 375.

---

## Summary

GREEN. Only open items are three persistent P2s: the new AP_CONTINENT gap (7 venues, 5-minute fix), missing SRI hashes, and missing CSP. No code changes since July 14 — cache stamp age is expected. The VPS weather cache persistence gap is the most important pre-scale risk; flagged here but only becomes a P0 when the Reddit post fires and traffic spikes.
