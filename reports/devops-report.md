# DevOps Report — 2026-08-08 (RED) — Day 16 VPS Undeployed

**Status: 🔴 RED**

Day 16. VPS still running 2026-07-23 code. Two actionable changes shipped in this run: cache stamp bumped `20260807a → 20260808a` (lockstep across app.jsx/sw.js/index.html), and BASE_PRICES top-7 destination airports applied (PM v112 Decision 1 — CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU). Both are live on main and will deploy via GitHub Actions. Zero new P0s found. The VPS redeploy remains the only thing that actually matters.

---

## 1. LIVE SITE HEALTH

| Check | Result |
|-------|--------|
| `app.jsx` lines | 13,732 |
| `app.jsx` bytes | ~691 KB |
| Cache stamp | `20260808a` ✅ (bumped this run) |
| Plausible analytics | ✅ present, uncommented, correct domain |
| CDN deps | React 18.3.1, Babel Standalone 7.29.7 — no SRI ⚠️ |
| Sentry DSN | ✅ live — `9416b032...` wired in index.html + app.jsx |
| `loading="lazy"` on images | ✅ all `<img>` tags confirmed |
| Venue count | 373 (131 ski / 242 beach) ✅ stable |
| Brace balance | 5628/5628 ✅ |
| Stale remote branches | ✅ **0** — only `origin/main` exists (resolved since last report) |

---

## 2. FLIGHT PROXY STATUS

- **Proxy URL:** `https://peakly-api.duckdns.org` (HTTPS via Caddy + Let's Encrypt) — ✅ not HTTP
- **Timeout:** 5s `AbortController` on every Travelpayouts fetch — ✅
- **Retry logic:** 3 attempts with 429/5xx backoff — ✅
- **Fallback:** catches all errors → returns `null` → scoring falls back to BASE_PRICES estimates — ✅
- **VPS live state:** Unknown — no network egress in this sandbox. Last verified healthy 2026-07-24 (15 days ago).

**P0 — VPS redeploy, Day 16.** The server at `198.199.80.21` is running a 16-day-old snapshot of `server/proxy.js`. Every fix committed since 2026-07-23 is inert. This is the entire list:

| Fix | Impact if undeployed |
|-----|---------------------|
| `forecast_days=14` (was 7 at both call sites) | Two-weekend scoring broken — client requests 14 days, server returns 7, second weekend scores are silent garbage |
| `capacitor://localhost` in CORS | Every iOS native weather/flight call is blocked with no error surface |
| `DELETE` in CORS Allow-Methods | Alert deletion has silently returned 200 OK (OPTIONS blocked) since launch |
| HTTP/2 APNs (`http2.connect` + `dsaEncoding: 'ieee-p1363'`) | Zero push notifications deliverable until deployed |
| Disk cache persistence (`_loadCacheFromDisk`/`_saveCacheToDisk`) | pm2 restart wipes wx cache — cold spike after redeploy could hit Open-Meteo free tier |
| Rate limiter reads last XFF entry | Anyone could forge X-Forwarded-For to bypass rate limiting |

**The deploy is 3 minutes:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected response after redeploy: `"forecast_days": 14`, `"disk_cache_enabled": true`, `"apns": "unconfigured"`.

---

## 3. WEATHER & EXTERNAL API

- **Client path:** `_tryProxyWx()` (4s timeout) → direct Open-Meteo fallback — ✅ resilient
- **Batch config:** BATCH_SIZE=100, THROTTLE_MS=500 — 373 venues = 4 batches — ✅ manageable
- **Open-Meteo rate limit:** At <10 MAU, ~373 weather calls per user session. Free tier is 10K calls/day — safe until ~25 DAU. Proxy cache makes this irrelevant once VPS is redeployed.
- **Marine API:** Beach-only (`v.category === 'beach'`) — ✅ not wasting calls on ski venues
- **Disk cache (proxy.js):** `_saveCacheToDisk()` every 5 minutes on main, `_loadCacheFromDisk()` on startup. **Inert until VPS deploy.**

---

## 4. SECURITY AUDIT

| Check | Status |
|-------|--------|
| Travelpayouts token | ✅ Server-side only — `process.env.TRAVELPAYOUTS_TOKEN` |
| `TP_MARKER` in client | ✅ Public affiliate marker (710303) — expected, not a secret |
| Supabase anon key | ✅ Public-safe, RLS-gated — normal for client-side Supabase |
| Sentry DSN | ✅ In client — normal, public-safe |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| Alert IDs | ✅ `crypto.randomUUID()` with `getRandomValues`/`Math.random()` fallback — committed |
| Git log scan (last 10 commits) | ✅ No credentials — daily reports + cache stamp bumps only |
| SRI on CDN scripts | ⚠️ P2 — React, ReactDOM, Babel loaded from unpkg with no integrity hash |

**Open #21 (APNs security) — code-complete on main, undeployed:**
- `server/proxy.js` uses `http2.connect` + `dsaEncoding: 'ieee-p1363'` — committed, inert
- Alert IDs: `crypto.randomUUID()` — ✅ committed and live in app.jsx
- Alerts API auth: still unauthenticated server-side. UUIDs shrink the brute-force surface to 2^122 but proper fix requires HMAC or user-token check on DELETE. Deferred — app isn't in production and APNS isn't live.

**P2 — No SRI on CDN scripts.** If unpkg is compromised or CDN-hijacked, users get arbitrary JS. Fix requires hashing the exact versions being loaded and adding `integrity=` attributes. Low probability, medium impact. Don't block launch over this.

```html
<!-- Example fix when ready — run this to get hashes: -->
<!-- curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<hash-here>">
</script>
```

---

## 5. PERFORMANCE ANALYSIS

**Production build (dist/) — what users on GitHub Pages actually get:**

| Asset | Size |
|-------|------|
| `dist/app.min.js` (esbuild, Babel-free) | 457 KB |
| React 18.3.1 (CDN) | ~130 KB |
| ReactDOM 18.3.1 (CDN) | ~140 KB |
| Sentry SDK (deferred) | ~150 KB |
| Supabase JS (lazy) | ~80 KB gzipped |

**Total first-load blocking JS (production path): ~730 KB.** This is reasonable. The Babel standalone (~1MB) is only hit when loading `index.html` directly in dev mode — `dist/index.html` loads the pre-compiled `app.min.js` instead. Production users are fine.

**Biggest performance bottleneck today:** Weather fetch waterfall. 373 venues × 1 API call each = 373 Open-Meteo calls per cold session. Even with batching (100/batch, 500ms throttle), a cold load with no proxy cache takes ~2s of network just for weather. This is solved by the VPS proxy cache, which is not yet deployed.

**Images:** ✅ All `<img>` tags use `loading="lazy"`.

**CDN versions — no action needed:**
- React 18.3.1 — current stable
- Babel Standalone 7.29.7 — current (7.29.x series)

---

## 6. BASE_PRICES — PATCHED THIS RUN

**This run applied PM v112 Decision 1 (no further carries).**

Before: 76 destination entries in BASE_PRICES, 46 matching actual venue destination APs (31.5% of 146).
After: 83 destination entries, **49 matching actual venue destination APs** (37.6% of 133 directly counted).

7 airports added:

| AP | Venue count | Example venues |
|----|------------|----------------|
| CUN | 9 | Cancun Beach, Tulum, Playa del Carmen |
| IBZ | 7 | Ibiza, Formentera, Santa Eulalia |
| HKT | 6 | Phuket, Karon Beach, Kata |
| BTV | 5 | Stowe, Smugglers' Notch, Sugarbush, Bolton Valley |
| NCE | 5 | Nice Riviera, Cannes, Monaco Beach |
| ZNZ | 5 | Zanzibar, Nungwi, Paje |
| MRU | 5 | Mauritius (multiple beaches) |

**42 venues unlocked for deal score.** Brace balance verified: 5628/5628.

**Remaining gap: ~84 venue destination APs still without BASE_PRICES entries.** Coverage is ~37% of the universe. Still a visible product gap — users flying to those destinations see weather scores only, no deal badge. Top next targets by venue count (per prior analysis): `AUA`, `STT`, `SXM`, `BOB`, `JNX/JTR/JMK` (Greek islands), `KOA/OGG` (already covered), `PLS`, `MBJ`.

---

## 7. COST ESTIMATE

| Scale | Infrastructure cost/month |
|-------|--------------------------|
| Current (<10 MAU) | $6 DigitalOcean + $0 GitHub Pages = **$6** |
| 1K MAU | $6 VPS + $0 Pages = **$6** (proxy cache absorbs load) |
| 10K MAU | $12–18 VPS (resize to 2GB) + $0 Pages = **~$15** |
| 100K MAU | $48 VPS (4GB) + $0 Pages + possible Open-Meteo Pro ($100+) = **~$150** |

**No optimization needed today.** The $6/month VPS handles everything under 10K MAU with proxy caching in place. Open-Meteo free tier (10K calls/day) is the first thing that breaks at scale — proxy cache prevents this for identical-coord venues, but at 100K DAU with diverse home airports the call count scales. Upgrade to Open-Meteo Pro (~$100/month) at that point.

---

## 8. WHAT BREAKS FIRST AT SCALE

The Open-Meteo free tier. At 10K MAU with ~25 DAU hitting the app simultaneously, the 2hr proxy cache means each unique (lat,lon) pair generates ~12 upstream calls/day. With 373 venues, that's ~4,476 calls/day — safely under 10K. But at 100K MAU with diverse user geographies, the 14-day forecast × 2 calls/venue (weather + marine for beach) = 746 calls per full cache expiry. If the cache cold-starts mid-traffic-spike (i.e., right after a VPS redeploy without disk persistence), 50 concurrent users could each trigger 373 calls = 18,650 calls in minutes — 86% over the daily free tier in one burst. **The disk persistence fix in proxy.js eliminates this entirely and takes 3 minutes to deploy.** It's already committed. The only thing preventing it from being live is the missing VPS redeploy.

---

## Actions Taken This Run

| Action | Details |
|--------|---------|
| Cache stamp bumped | `20260807a → 20260808a` (app.jsx, sw.js, index.html) |
| BASE_PRICES top-7 applied | CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU — 42 venues unlocked for deal score |
| Brace balance verified | 5628/5628 ✅ |

## Outstanding (Jack Only)

1. **VPS redeploy** (3 min, SSH) — closes Open #19, #21, #23 simultaneously
2. **Supabase delete-account SQL paste** — paste `server/sql/delete-account.sql` into Supabase SQL editor (App Store gate)
