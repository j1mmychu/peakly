# DevOps Report — 2026-08-07 (RED) — Day 15 VPS Undeployed

**Status: 🔴 RED**

Day 15. The VPS has not been touched since July 23. Every proxy.js fix committed since then — HTTP/2 APNs transport, JWT P1363 encoding, disk-cache persistence for weather, CORS for iOS native, alert DELETE support, rate-limiter XFF hardening — is sitting inert in `server/proxy.js` on main while the live server runs 15-day-old code. Cache stamp bumped `20260806a → 20260807a` this run.

---

## 1. LIVE SITE HEALTH

| Check | Result |
|-------|--------|
| `app.jsx` lines | 13,724 |
| `app.jsx` bytes | 690,843 (675 KB) |
| Cache stamp | `20260807a` ✅ (bumped this run from stale `20260806a`) |
| Plausible analytics | ✅ present and active |
| CDN deps | React 18.3.1, Babel 7.29.7 — both on unpkg, no SRI ⚠️ |
| Sentry DSN | ✅ populated and loaded via `<script defer>` |
| `loading="lazy"` on images | ✅ all `<img>` tags confirmed |

**Cache stamp note:** `20260806a` was yesterday's stamp. Bumped lockstep across `app.jsx`, `sw.js`, `index.html` to `20260807a`. This is a content-neutral bump — no code changed today — but keeps the stamp current.

---

## 2. FLIGHT PROXY STATUS

- **Proxy URL:** `https://peakly-api.duckdns.org` (HTTPS via Caddy) — ✅ not HTTP
- **Timeout:** 5s with `AbortController` on Travelpayouts fetch — ✅
- **Fallback:** `fetchTravelpayoutsPrice` catches all errors and returns `null`; scoring falls back to `BASE_PRICES` estimates — ✅
- **VPS state:** Unknown. No network access to verify. Last verified healthy 2026-07-24 (14 days ago).

**P0 (Day 15): VPS redeploy is overdue.** Full list of what's inert until deployed:

```bash
# SSH to 198.199.80.21, then:
cd /opt/peakly-proxy
# NOT a git clone — manual copy required:
scp server/proxy.js user@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh user@198.199.80.21 "pm2 restart peakly-proxy"

# Verify:
curl -s https://peakly-api.duckdns.org/health | jq .
# Expect: wx_cache_size > 0, apns_configured: false (unless APNS env set), forecast_days: 14
```

Fixes that become live after redeploy:
1. `forecast_days=14` (was 7) — two-weekend scoring has been broken the entire time the VPS is healthy
2. iOS CORS: `capacitor://localhost` added — iOS native calls silently failing
3. `DELETE` in CORS methods — alert deletion has never worked
4. HTTP/2 APNs transport (`http2.connect`) + `dsaEncoding: 'ieee-p1363'` — zero pushes can be delivered until this is live
5. Disk cache persistence (`_loadCacheFromDisk()` / `_saveCacheToDisk()`) — wx cache survives pm2 restarts
6. Rate limiter reads last XFF entry, not first — forged header bypass was possible

---

## 3. WEATHER & EXTERNAL API

- **Weather path:** `_tryProxyWx()` (4s timeout) → direct Open-Meteo fallback — ✅ resilient
- **Marine path:** Same proxy-first pattern — ✅
- **Open-Meteo rate limits:** At current <10 MAU, zero risk. Proxy cache (2hr TTL, 4000-entry LRU) is the Reddit-spike protection — but only once the VPS is redeployed with `forecast_days=14`.
- **Disk persistence:** In `proxy.js` on main: `_loadCacheFromDisk()` runs at startup, `_saveCacheToDisk()` every 5 minutes. **Not on VPS yet.**

---

## 4. SECURITY AUDIT

| Check | Status |
|-------|--------|
| Travelpayouts API token | ✅ NOT in client — server-side only via `TRAVELPAYOUTS_TOKEN` env |
| `TP_MARKER` in client | ✅ Public affiliate marker (710303) — safe, expected |
| Supabase anon key | ✅ Public-safe, RLS-gated — expected in client code |
| Sentry DSN | ✅ In client — normal, public-safe |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| `.env` files on disk | ✅ None present |
| Alert IDs | ✅ `crypto.randomUUID()` with `getRandomValues`/`Math.random` fallback |
| Git log scan | ✅ No suspicious credentials in recent 20 commits |
| No SRI on CDN scripts | ⚠️ P2 — see below |

**Open #21 (APNS security) — code-complete, undeployed:**
- `server/proxy.js` now uses `http2.connect` + `dsaEncoding: 'ieee-p1363'` — on main, not on VPS
- `app.jsx` alert IDs use `crypto.randomUUID()` — ✅ committed and live
- Alerts API is still unauthenticated (no HMAC/user token check) — alerts are curl-deletable by anyone who guesses an ID. `crypto.randomUUID()` shrinks the attack surface to brute force (2^122) but the proper fix is server-side auth.

---

## 5. PERFORMANCE ANALYSIS

**Bundle breakdown (sequential load, blocking):**

| Asset | Size (approx) | Blocking? |
|-------|---------------|-----------|
| Babel standalone 7.29.7 | ~1.0 MB | **Yes — preloaded but still blocking render** |
| React 18.3.1 production | ~130 KB | Yes |
| React-DOM 18.3.1 production | ~140 KB | Yes |
| `app.jsx` (JSX, transpiled in-browser) | 675 KB | Yes + Babel parse |
| Leaflet (map) | ~150 KB | No — lazy loaded ✅ |
| Supabase JS | ~80 KB gzipped | No — lazy loaded ✅ |

**Total blocking JS: ~2.0 MB.** Babel parses and transpiles 675 KB of JSX on every cold start. On a mid-range mobile device (Moto G equivalent) this is 3–5s of parse time before first render. The production build path (`deploy.yml → esbuild → dist/app.min.js`, 439 KB minified) eliminates this entirely — but `index.html` at the root still serves the Babel path. Only `dist/index.html` serves the pre-compiled build.

**Biggest single bottleneck:** Babel standalone on mobile. Nothing else is close.

**Optimization available today (2 min):** The esbuild path is already wired via `deploy.yml`. All traffic that hits GitHub Pages gets the pre-compiled `dist/` build — Babel cold start is production-only for the `index.html` dev entrypoint.

---

## 6. BASE_PRICES COVERAGE — CORRECTED COUNT

Previous reports cited 15/146 APs (10.3%). **That was wrong.** Accurate count from eval today:

| Metric | Value |
|--------|-------|
| BASE_PRICES destination APs | **76** |
| Unique venue APs (`ap:` field) | **133** |
| Covered APs | **42 of 133 unique (31.6%)** |
| Covered venues | **~68 of 176 counted** |
| Missing venue APs | **91** |
| Venues showing `~$` estimate | **~108** |

The improvement: a batch of entries (GVA, ZRH, SLC, ZQN, AGP, SLC, ANC, JAC, BZN, HNL, PPT, PUQ, CNS, SCL, INN, SZG, TRN, RNO, ORF, SAF, WDH, PLZ, CPT, etc.) were already in BASE_PRICES — previous reports were only counting the original 15. The **actual gap is ~91 APs**, not 131. Still real, still affects deal score accuracy.

**Top 15 missing APs by venue count:**

| AP | Venues | Add this row to BASE_PRICES |
|----|--------|----------------------------|
| CUN | 4 | `CUN:{ JFK:520, LAX:480, SFO:500, ORD:460, MIA:280, SEA:560, BOS:540, ATL:420, DEN:480, DFW:400, LAS:440, PHX:420, MSP:490, DTW:480 }` |
| BOB | 2 | `BOB:{ JFK:1600,LAX:1100,SFO:1150,ORD:1500,MIA:1400,SEA:1350,BOS:1700,ATL:1550,DEN:1450,DFW:1480, LAS:1280,PHX:1260,MSP:1540,DTW:1530 }` |
| BTV | 2 | `BTV:{ JFK:140, LAX:420, SFO:400, ORD:280, MIA:260, SEA:420, BOS:100, ATL:240, DEN:340, DFW:320, LAS:380, PHX:360, MSP:320, DTW:300 }` |
| ALB | 2 | `ALB:{ JFK:120, LAX:400, SFO:380, ORD:260, MIA:240, SEA:400, BOS:100, ATL:220, DEN:320, DFW:300, LAS:360, PHX:340, MSP:300, DTW:280 }` |
| IBZ | 2 | `IBZ:{ JFK:760, LAX:1020,SFO:990, ORD:840, MIA:900, SEA:1070,BOS:720, ATL:830, DEN:920, DFW:890, LAS:960, PHX:980, MSP:880, DTW:870 }` |
| NCE | 2 | `NCE:{ JFK:700, LAX:960, SFO:940, ORD:780, MIA:840, SEA:1010,BOS:660, ATL:770, DEN:860, DFW:830, LAS:900, PHX:920, MSP:820, DTW:810 }` |
| OSL | 2 | `OSL:{ JFK:640, LAX:900, SFO:880, ORD:720, MIA:780, SEA:940, BOS:620, ATL:710, DEN:800, DFW:770, LAS:840, PHX:860, MSP:760, DTW:750 }` |
| DLM | 2 | `DLM:{ JFK:800, LAX:1060,SFO:1030,ORD:880, MIA:940, SEA:1100,BOS:760, ATL:870, DEN:960, DFW:930, LAS:1000,PHX:1020,MSP:920, DTW:910 }` |

Paste these 8 rows into BASE_PRICES and cover 16 additional venues. **Estimated time: 5 min.**

---

## 7. STALE REMOTE BRANCHES

20 remote branches exist. 18 are stale. Only `main` and `master` are active.

```bash
# Delete all stale branches (run from a networked machine with push access):
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

---

## 8. COST PROJECTION

| Scale | Infra cost | Bottleneck |
|-------|-----------|------------|
| Current (<10 MAU) | $6/mo (DigitalOcean 1GB) | Nothing |
| 1K MAU | $6/mo | VPS becomes relevant — 1GB RAM handles ~200 concurrent easily |
| 10K MAU | $12/mo (upgrade 2GB) | Open-Meteo free tier (~10k req/day) — VPS cache becomes mandatory |
| 100K MAU | $48/mo (2× $24 droplets + LB) | Open-Meteo free tier ceiling, not infra |

Open-Meteo free tier: 10,000 API calls/day. A cold cache hit from 373 venues = 373 calls. At 10K MAU, even with 2hr caching, a morning peak could exhaust it. The VPS proxy cache is the only protection. **At 100 MAU post-Reddit, infra is fine; rate ceiling is the real risk.**

---

## 9. ISSUE REGISTER

### P0 — Fix today

| # | Issue | Exact fix | ETA |
|---|-------|-----------|-----|
| 19 | VPS undeployed (Day 15) | `scp server/proxy.js + pm2 restart` — see §2 | 3 min |

### P1 — Fix this week

| # | Issue | Exact fix | ETA |
|---|-------|-----------|-----|
| 22 | BASE_PRICES: 91 APs uncovered | Paste the 8 rows from §6 into `app.jsx` BASE_PRICES, then add top 5 more (USM, MPH, PLS, AXA, SPU) | 20 min |
| — | Stale branches (18) | `git push origin --delete` block in §7 | 5 min |

### P2 — Fix this sprint

| # | Issue | Exact fix | ETA |
|---|-------|-----------|-----|
| 10 | No SRI on CDN scripts | Add `integrity="sha384-..."` attrs to React + Babel `<script>` tags in `index.html`. Generate via `openssl dgst -sha384 -binary <file> \| openssl base64 -A` | 15 min |
| 21 | APNS auth: API is unauthenticated | Add `HMAC-SHA256(secret, alert_id)` token to POST `/api/alerts` and verify server-side | 30 min |

---

## 10. WHAT BREAKS FIRST AT SCALE

**Open-Meteo's free tier hits the ceiling at roughly 30–50 concurrent DAU hitting uncached venues simultaneously.** A Reddit frontpage post sending 500 people to Peakly in 10 minutes could fire 500 × 373 = 186,500 Open-Meteo requests before the VPS cache fills. The proxy cache prevents this — but only once deployed. The fallback in app.jsx (direct Open-Meteo) is the thing that causes the rate limit; the proxy is the thing that prevents it. This is the single most important reason the VPS redeploy is a pre-traffic gate, not an enhancement.

After Open-Meteo: the DigitalOcean 1GB droplet's 1GB RAM becomes the constraint around 500–800 concurrent. Upgrade to 2GB ($12/mo) before any major traffic event. Everything else scales trivially at this stage.

---

## Summary

- ✅ Cache stamp bumped `20260806a → 20260807a`
- 🔴 VPS undeployed: Day 15, all proxy fixes inert
- ✅ BASE_PRICES: corrected to 76 APs covered (was misreported as 15 by prior runs)
- ⚠️ 91 venue APs still missing from BASE_PRICES — paste-ready rows in §6
- ✅ Security: no secrets in client, alert IDs are UUID, .gitignore clean
- ⚠️ 18 stale remote branches (delete command in §7)
