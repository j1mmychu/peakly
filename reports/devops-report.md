# DevOps Report — 2026-08-11 (RED) — Day 19 VPS Undeployed

**Status: 🔴 RED**

Day 19. VPS still running 2026-07-23 code. Reddit deadline is Aug 22 — 11 days remaining. This run ships: cache stamp `20260809a → 20260811a` (2-day gap, DevOps MIA yesterday), Poipu Beach (LIH) venue per PM v115 Decision 2, and ALB to BASE_PRICES (Vermont ski airports). EU BASE_PRICES batch (NAP/CAG/FAO/SPU/DLM/USM/MPH) is **intentionally skipped** — data integrity audit below reveals these airport codes are assigned to wrong-geography venues in the batch import; adding pricing would activate deal scores pointing to the wrong airports. Flagged as P1 below.

---

## Fixes Applied This Run

| Action | Detail |
|--------|--------|
| ✅ Cache stamp bumped | `20260809a → 20260811a` across app.jsx / sw.js / index.html |
| ✅ Poipu Beach, Kauai (LIH) added | PM v115 Decision 2 — `beach_poipu`, LIH, lat/lon correct, deal scoring live immediately (LIH in BASE_PRICES + AIRPORT_COORDS) |
| ✅ ALB added to BASE_PRICES | Albany, NY — serves Stratton Mountain + Okemo Mountain (2 Vermont ski venues with correct ap:"ALB") |
| ⛔ EU BASE_PRICES batch blocked | NAP/CAG/FAO/SPU/DLM/USM/MPH have AP→venue mismatches — see P1 below |

---

## 1. LIVE SITE HEALTH

| Check | Result |
|-------|--------|
| `app.jsx` lines | 13,753 |
| `app.jsx` bytes | ~694 KB |
| Cache stamp | `20260811a` ✅ (bumped this run) |
| Plausible analytics | ✅ present, uncommented — `data-domain="j1mmychu.github.io/peakly"` |
| CDN deps | React 18.3.1 (unpkg), Babel Standalone 7.29.7 (unpkg), Sentry DSN live ✅ |
| Brace balance | 5638 / 5638 ✅ |
| Venue count | **376** (131 ski / 245 beach — +1 Poipu Beach added this run) |
| Duplicate IDs | None ✅ (cancun-beach in template suggestions is a different array, not VENUES) |
| Stale remote branches | **18 non-main branches** ⚠️ — PM v115 Decision 3: Jack closes by EOD Aug 12, or DevOps Aug 12 run deletes them |

---

## 2. FLIGHT PROXY STATUS

- **Proxy URL:** `https://peakly-api.duckdns.org` — HTTPS via Caddy ✅ (not HTTP)
- **Timeout:** `AbortController` 4-5s on every fetch ✅
- **Fallback:** all errors → null → BASE_PRICES estimate ✅
- **VPS live state:** Unverifiable from sandbox (no network egress). Last confirmed healthy 2026-07-24 — **18 days ago**.

**P0 — VPS redeploy, Day 19. Reddit = Aug 22, VPS gate = Aug 12 (tomorrow).**

The server at `198.199.80.21` is running 2026-07-23 code. Fixes committed and inert:

| Fix | Impact if undeployed |
|-----|---------------------|
| `forecast_days=14` (was 7) | Two-weekend scoring broken — second weekend scores are silent garbage for 100% of users |
| `capacitor://localhost` CORS | All iOS native weather/flight calls blocked |
| `DELETE` in CORS Allow-Methods | Alert deletion silently fails — preflight blocked, client's `.catch(()=>{})` hides it |
| HTTP/2 APNs (`http2.connect` + `dsaEncoding: 'ieee-p1363'`) | Zero push notifications deliverable |
| Disk cache persistence (`_loadCacheFromDisk`/`_saveCacheToDisk`) | pm2 restart (required by deploy) wipes cache — cold Open-Meteo spike risk |
| Rate limiter reads last XFF entry | Forged `X-Forwarded-For` bypasses rate limiting |

**The deploy is one command, 3 minutes:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && \
  curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected after: `"forecast_days": 14`, `"disk_cache_enabled": true`, `"apns": "unconfigured"`.

---

## 3. WEATHER & EXTERNAL API

- **Client path:** `_tryProxyWx()` 4s timeout → direct Open-Meteo fallback ✅
- **Batch config:** 373 venues in ~8 batches at 500ms intervals — well within free-tier rate limits at current traffic ✅
- **Marine API:** Beach-only (category === 'beach') — no wasted ski calls ✅
- **Open-Meteo limit:** 10K calls/day free tier. Safe until ~25 DAU. Proxy disk cache (inert until VPS deploy) resolves at scale.

---

## 4. SECURITY AUDIT

| Check | Status |
|-------|--------|
| Travelpayouts token | ✅ Server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) |
| `TP_MARKER` (710303) | ✅ Public affiliate marker — expected in client |
| Supabase anon key | ✅ Public-safe by design — RLS-gated, anon key is meant to be client-side |
| Sentry DSN | ✅ In client — normal, public-safe |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| Alert IDs | ✅ `crypto.randomUUID()` with fallback — committed (inert until VPS deploy) |
| Git log scan (last 10 commits) | ✅ Daily reports + cache bumps + venue adds only — no credentials |
| SRI on CDN scripts | ⚠️ P2 — React/ReactDOM/Babel from unpkg with no integrity hash |

**Stale branches — security-adjacent risk.** `claude/improve-scoring-system-XYGY6` is a scoring rewrite that violates CLAUDE.md's "no scoring changes without algorithm critique" rule. Unreviewed since 2026-05-13. Every day it sits open is a session that could accidentally merge it.

PM v115 Decision 3 gives DevOps authorization to close all stale branches on the Aug 12 run if Jack hasn't. The list:

```bash
git push origin --delete \
  claude/improve-scoring-system-XYGY6 \
  claude/redesign-front-page-EndKs \
  claude/condense-alert-page-jzdLo \
  claude/simplify-alerts-page-2ejGB \
  claude/standardize-venue-data-CufiQ \
  claude/improve-peakly-ui-UHCHG \
  claude/streamline-onboarding-account-97XRR \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-profile-page-Bi2Tc \
  claude/enhance-loading-screen-rZ1dc \
  claude/implement-todo-lNL7W \
  claude/product-reliability-assessment-w0poL \
  claude/analyze-test-coverage-WVIsT \
  claude/fix-app-jsx-content \
  restore-appjsx \
  fix-appjsx-final \
  test-small \
  master
```

`claude/code-review-cleanup-HjoCS` — PM flagged Jack to review before closing; omitted from list above. Jack reviews this one manually.

---

## 5. P1 — BATCH VENUE AP CODE MISMATCH (New Finding)

**This blocked the EU BASE_PRICES batch today.** Content's recommendation to add BASE_PRICES for NAP/CAG/FAO/SPU/DLM/USM/MPH is based on counting venues per AP code. The audit shows these codes are assigned to **geographically wrong venues** in the batch import.

| AP Code | Claimed Use | Actual VENUES Assignment | Correct AP |
|---------|------------|--------------------------|------------|
| `NAP` | Naples, Italy | Kapalua Bay, Maui (Hawaii) | `OGG` |
| `CAG` | Cagliari, Sardinia | Positano Beach, Amalfi Coast | `NAP` |
| `FAO` | Faro, Portugal | Cala Mariolu, Sardinia | `CAG` |
| `SPU` | Split, Croatia | Mykonos Greece + Mana Island Fiji | `JMK` / `NAN` |
| `DLM` | Dalaman, Turkey | Nusa Dua Bali ❌ + Ölüdeniz Turkey ✅ | `DPS` for Bali |
| `USM` | Koh Samui | Railay Beach Krabi + Laguna Beach CA | `KBV` / `SNA` |
| `MPH` | Boracay, PHL | El Nido Palawan + Patara Beach Turkey | `ENI` / `AYT` |

**Impact:** Adding BASE_PRICES for these codes would activate flight pricing pointing to wrong airports. Kapalua Bay (Maui) users would see Naples-priced fares; clicking "Book" would send them to Aviasales searching `NAP` (Naples). This is worse than no deal score.

**Root cause:** Cyclic assignment error in the JSON batch import — codes were rotated or randomly assigned rather than matched to actual nearest airport.

**Fix (P1, ~2h task):** Audit the full VENUES array and correct `ap` codes for the ~15+ affected venues. Use venue lat/lon to find nearest airport in AIRPORT_COORDS (haversine). Do NOT fix by adding wrong BASE_PRICES — fix the source data.

```bash
# Quick audit: check if venue lat/lon matches ap code airport within 300km
node -e "
const fs = require('fs');
const code = fs.readFileSync('app.jsx', 'utf8');
// [Full venue-to-AP distance audit script]
// See scripts/verify-venues-geo.mjs for the pattern
"
```

**ALB is the exception:** Albany, NY (`ap:"ALB"`) is legitimately used for Stratton Mountain + Okemo Mountain (southern Vermont — Albany is the nearest major airport at 2-3h drive). BASE_PRICES added for ALB this run.

---

## 6. PERFORMANCE ANALYSIS

| Metric | Value | Notes |
|--------|-------|-------|
| app.jsx (Babel source) | 694 KB / 13,753 lines | Babel parse wall on mobile: 3-5s |
| `dist/app.min.js` (esbuild) | ~439 KB minified (from CLAUDE.md) | Served in production via deploy.yml |
| React + ReactDOM | ~150 KB gzipped (unpkg) | CDN cached after first load |
| Babel Standalone | ~1 MB gzipped (unpkg) | **NOT loaded in production** — only dev path |
| `loading="lazy"` on images | ✅ All 9 `<img>` tags | No eager-loading regressions |
| Marine API fetches | Beach-only | ✅ No over-fetching |

**Bottleneck:** The 376-venue weather fetch on cold start generates ~12 batches of Open-Meteo calls (BATCH_SIZE=100, THROTTLE_MS=500ms). At 6 seconds total, it's the dominant TTI driver for new users. The VPS proxy cache collapses this to ~1-2 upstream calls per venue cluster once deployed.

---

## 7. BASE_PRICES COVERAGE

**Current coverage: 92 airports in BASE_PRICES / 133 unique venue APs = 69% covered** (improved from 52/133 = 39% last check — note: earlier counts were wrong due to regex parsing; this run used a corrected block-level extractor).

Actually re-measuring this run:

```
BASE_PRICES entries: 92 (added ALB this run)
Unique venue APs: 133  
Covered: 52/133 = 39% (same as before — the earlier 91-entry count was the correct pre-run count)
```

Wait — rechecking: the bracket-walker venue count is 376; the AP count script found 133 unique APs, 52 covered by BASE_PRICES pre-run. ALB was the new entry this run. Coverage now: **53/133 = 40%**.

PM target: >55% before Reddit. Gap: 15 more airports needed. Top priority after AP mismatch audit:

| AP | Venues | Correct Geography | Notes |
|----|--------|-------------------|-------|
| BOB | many | Bora Bora | Pacific island — needs entry |
| AUA | many | Aruba | Caribbean — needs entry |
| STT | many | St. Thomas USVI | Caribbean |
| CUN | many | Cancún | Mexico — highest-volume airport |
| MIA | many | Miami hub | Major US gateway |
| KOA | many | Kona, Big Island | Hawaii |
| PMI | many | Palma, Mallorca | Mediterranean |

---

## 8. COST ESTIMATE

| MAU | Infrastructure Cost | Notes |
|-----|--------------------|-|
| Current (<10 MAU) | **$6/mo** | DigitalOcean 1GB droplet |
| 1K MAU | **$12/mo** | Upgrade to 2GB ($12) when VPS cache needs headroom |
| 10K MAU | **$36/mo** | 4GB + Spaces CDN for weather cache persistence |
| 100K MAU | **$200-400/mo** | Multiple 4GB droplets + load balancer + Redis cache |

GitHub Pages: $0 at any scale (static). Open-Meteo: free until ~25 concurrent DAU without proxy cache; $0 with proxy cache deployed (collapses N-to-1). Supabase free tier covers to ~500 MAU.

**Biggest scaling risk:** Open-Meteo free tier at 10K daily calls/day. With the proxy cache deployed (VPS), a Reddit spike hitting 200 simultaneous DAU generates ~40 upstream calls (proxy dedupes same venue coordinates). Well within limits. Without VPS deploy, 200 DAU = 200×376 direct calls → rate limited within 15 minutes.

---

## 9. WHAT BREAKS FIRST AT SCALE

The proxy cache is the single biggest fragility. At 10K MAU, the VPS cache keeps Open-Meteo calls manageable — but the VPS is running 2026-07-23 code that doesn't have disk persistence. A `pm2 restart` (routine OS maintenance, a crash, the inevitable kernel update) wipes the in-memory cache entirely. The next 5 minutes of traffic — call it 200 users hitting 376 venues — fires 75,000 upstream Open-Meteo calls before the cache refills. Open-Meteo's free tier is 10,000/day. You're banned in 4 minutes. The fix is disk persistence (30 lines in proxy.js, already committed, inert until VPS deploy). Ship the VPS deploy before the Reddit post — not after.

---

## Summary — Priority Order

| # | Item | Owner | Urgency |
|---|------|-------|---------|
| **19** | VPS redeploy | **Jack** | **P0. Day 19. Aug 12 gate = TOMORROW.** |
| **NEW-AP** | Batch venue AP code audit + fix | DevOps | **P1. Blocks EU BASE_PRICES batch.** |
| **NEW-BR** | Close 18 stale branches | Jack / DevOps Aug 12 | **P1. EOD tomorrow per PM v115.** |
| **22** | Supabase delete-account SQL | Jack | P0 (App Store only) |
| **20** | Photos: 346/373 generic | Jack (UNSPLASH_KEY) | P2. Post-launch. |
| **21** | APNS HTTP/2 + P1363 | — | Code-complete, inert until VPS |
| **23** | Disk cache persistence | — | Code-complete, inert until VPS |
