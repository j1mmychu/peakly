# DevOps Report — 2026-08-09 (RED) — Day 17 VPS Undeployed

**Status: 🔴 RED**

Day 17. VPS still running 2026-07-23 code. Zero days left before the Aug 10 go/no-go gate. Two fixes shipped this run: cache stamp bumped `20260808a → 20260809a` (lockstep across app.jsx/sw.js/index.html), and BASE_PRICES S-hemi ski + Caribbean batch applied (PM v113 Decision 1 — CHC/BRC/MDZ/CPC/NQN/PLS/AXA/SXM — 17 venues unlocked for deal score). No new P0s. The VPS deploy is the only thing that matters — tomorrow the S-hemi ski window is 23 days from closing.

---

## 1. LIVE SITE HEALTH

| Check | Result |
|-------|--------|
| `app.jsx` lines | 13,742 |
| `app.jsx` bytes | ~693 KB |
| Cache stamp | `20260809a` ✅ (bumped this run) |
| Plausible analytics | ✅ present, uncommented, correct domain (`j1mmychu.github.io/peakly`) |
| CDN deps | React 18.3.1, Babel Standalone 7.29.7 — no SRI ⚠️ P2 |
| Sentry DSN | ✅ live — `9416b032...` wired in index.html + app.jsx |
| `loading="lazy"` on images | ✅ all `<img>` tags confirmed |
| Venue count | 373 (131 ski / 242 beach) ✅ stable |
| Brace balance | 5636/5636 ✅ |
| Stale remote branches | 19 non-main branches on origin ⚠️ P1 (PM v113 Decision 2 — Jack review required) |

---

## 2. FLIGHT PROXY STATUS

- **Proxy URL:** `https://peakly-api.duckdns.org` (HTTPS via Caddy) — ✅ not HTTP
- **Timeout:** 5s `AbortController` on every Travelpayouts fetch — ✅
- **Retry logic:** 3 attempts with 429/5xx backoff — ✅
- **Fallback:** catches all errors → returns `null` → scoring falls back to BASE_PRICES estimates — ✅
- **VPS live state:** Unknown — no network egress in this sandbox. Last verified healthy 2026-07-24 (16 days ago).

**P0 — VPS redeploy, Day 17. Aug 10 gate is TODAY.**

The server at `198.199.80.21` is running 17-day-old code. Every fix below is committed to `main` and inert on the VPS:

| Fix | Impact if undeployed |
|-----|---------------------|
| `forecast_days=14` (was 7 at both call sites) | Two-weekend scoring broken — second weekend scores are silent garbage |
| `capacitor://localhost` in CORS | Every iOS native weather/flight call blocked outright |
| `DELETE` in CORS Allow-Methods | Alert deletion has silently returned 200 OK (OPTIONS blocked) since launch |
| HTTP/2 APNs (`http2.connect` + `dsaEncoding: 'ieee-p1363'`) | Zero push notifications deliverable |
| Disk cache persistence (`_loadCacheFromDisk`/`_saveCacheToDisk`) | pm2 restart wipes wx cache — cold spike after redeploy could hit Open-Meteo free tier ceiling |
| Rate limiter reads last XFF entry | Anyone can forge X-Forwarded-For to bypass rate limiting |

**The deploy is 3 minutes:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected after deploy: `"forecast_days": 14`, `"disk_cache_enabled": true`, `"apns": "unconfigured"`.

This single command closes Open #19, #21 (APNs code path), and #23 (disk cache) simultaneously.

---

## 3. WEATHER & EXTERNAL API

- **Client path:** `_tryProxyWx()` (4s timeout) → direct Open-Meteo fallback — ✅ resilient
- **Batch config:** BATCH_SIZE=100, THROTTLE_MS=500 — 373 venues = 4 batches — ✅ manageable
- **Open-Meteo rate limit:** Free tier 10K calls/day. Safe until ~25 DAU. Proxy cache makes this a non-issue once VPS is redeployed.
- **Marine API:** Beach-only (`v.category === 'beach'`) — ✅ no wasted calls on ski venues
- **Disk cache (proxy.js):** `_saveCacheToDisk()` every 5 min on startup. **Inert until VPS deploy.**

---

## 4. SECURITY AUDIT

| Check | Status |
|-------|--------|
| Travelpayouts token | ✅ Server-side only — `process.env.TRAVELPAYOUTS_TOKEN` |
| `TP_MARKER` in client | ✅ Public affiliate marker (710303) — expected, not a secret |
| Supabase anon key | ✅ Public-safe, RLS-gated — normal for client-side Supabase |
| Sentry DSN | ✅ In client — normal, public-safe |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| Alert IDs | ✅ `crypto.randomUUID()` with fallback — committed |
| Git log scan (last 10 commits) | ✅ No credentials — daily reports + cache stamp bumps + BASE_PRICES only |
| SRI on CDN scripts | ⚠️ P2 — React, ReactDOM, Babel loaded from unpkg with no integrity hash |

**19 stale remote branches — security-adjacent concern.** The `claude/improve-scoring-system-XYGY6` branch contains unreviewed scoring rewrites (variance penalty + cap changes). If someone merges that without the documented algorithm critique, it violates CLAUDE.md explicitly. The `restore-appjsx` / `fix-appjsx-final` branches look like failed recovery attempts and should be confirmed-dead before any production incident.

```bash
# List all non-main remote branches with age:
git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(refname:short) %(committerdate:short)' | grep -v 'origin/main'
```

**P2 — No SRI on CDN scripts.** Medium risk, don't block launch over it.

```bash
# Get hashes when ready:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

---

## 5. PERFORMANCE ANALYSIS

**Production build (what users on GitHub Pages get):**

| Asset | Size |
|-------|------|
| `dist/app.min.js` (esbuild, Babel-free) | ~461 KB (estimated +2KB from BASE_PRICES additions) |
| React 18.3.1 (CDN) | ~130 KB |
| ReactDOM 18.3.1 (CDN) | ~140 KB |
| Sentry SDK (deferred) | ~150 KB |
| Supabase JS (lazy) | ~80 KB gzipped |

**Total first-load blocking JS (production): ~730 KB.** Reasonable. Babel standalone (~1MB) is dev-mode only — production loads `dist/app.min.js`.

**Biggest bottleneck:** Weather fetch waterfall on cold load. 373 venues × 1 API call each = 373 Open-Meteo calls. Batched at 100/500ms = ~2s of network. Fixed by VPS proxy cache — not yet deployed.

**Images:** ✅ All `<img>` tags use `loading="lazy"`.

**CDN versions — current:**
- React 18.3.1 — current stable
- Babel Standalone 7.29.7 — current

---

## 6. BASE_PRICES — PATCHED THIS RUN

**Applied PM v113 Decision 1 (S-hemi ski + Caribbean batch).**

Before: 91 airport keys in BASE_PRICES (after yesterday's top-7 additions).
After: 99 airport keys.

8 airports added — 17 venues unlocked for deal scoring:

| AP | Venues unlocked | Example |
|----|----------------|---------|
| CHC | 1 | Mt. Hutt / Cardrona (S-hemi ski, IN SEASON) |
| BRC | 1 | Cerro Catedral / Bariloche (S-hemi ski, IN SEASON) |
| MDZ | 1 | Las Leñas / Chapelco (S-hemi ski, IN SEASON) |
| CPC | 1 | Caviahue / Copahue (S-hemi ski, IN SEASON) |
| NQN | 1 | Neuquén ski region (S-hemi ski, IN SEASON) |
| PLS | 4 | Grace Bay (Turks & Caicos) |
| AXA | 4 | Shoal Bay East / Rendezvous Bay (Anguilla) |
| SXM | 4 | Orient Bay (Sint Maarten) |

**Coverage: 67/146 venue APs (45.9%).** The S-hemi ski venues driving the Reddit launch hook now have deal scoring. 79 venue APs remain uncovered.

**Remaining high-value gaps by venue count:**

| AP | Estimated venues | Notes |
|----|-----------------|-------|
| AUA | 3+ | Aruba — high-traffic beach |
| BOB | 3+ | Bora Bora — premium tier |
| STT | 3+ | St. Thomas / USVI |
| JNX/JTR/JMK | 6+ | Greek islands cluster |
| KOA | 3+ | Kona, Hawaii (already have OGG/LIH — check if KOA covered) |
| MBJ | 3+ | Montego Bay, Jamaica |
| KUL | 2+ | Kuala Lumpur / Malaysia |
| CMB | 2+ | Colombo / Sri Lanka |

---

## 7. COST ESTIMATE

| Scale | Infrastructure cost/month |
|-------|--------------------------|
| Current (<10 MAU) | $6 DigitalOcean + $0 GitHub Pages = **$6** |
| 1K MAU | $6 VPS + $0 Pages = **$6** (proxy cache absorbs load) |
| 10K MAU | $12–18 VPS (resize to 2GB) + $0 Pages = **~$15** |
| 100K MAU | $48 VPS (4GB) + $0 Pages + Open-Meteo Pro ($100+) = **~$150** |

No optimization needed. VPS handles everything under 10K MAU once the proxy cache is live.

---

## 8. WHAT BREAKS FIRST AT SCALE

Still the Open-Meteo free tier ceiling on a cold cache restart. 373 venues × 2 calls/venue (weather + marine for beach) = 746 calls per full cache expiry. Cold-start during a traffic spike (e.g., right after a VPS redeploy without disk persistence) could trigger 18K+ calls in minutes at 50 concurrent users — 86% over the daily free tier in one burst. The disk persistence fix (`_saveCacheToDisk`/`_loadCacheFromDisk`) is committed to `server/proxy.js` and eliminates this cold-start risk entirely. It has been committed for 16 days. It is not deployed. The VPS redeploy fixes this in the same 3-minute window.

---

## Actions Taken This Run

| Action | Details |
|--------|---------|
| Cache stamp bumped | `20260808a → 20260809a` (app.jsx, sw.js, index.html) |
| BASE_PRICES S-hemi ski + Caribbean batch | CHC/BRC/MDZ/CPC/NQN/PLS/AXA/SXM — 8 APs, 17 venues unlocked |
| Brace balance verified | 5636/5636 ✅ |

---

## Outstanding (Jack Only)

1. **VPS redeploy — TODAY, Aug 10 gate** (3 min SSH) — closes Open #19, #21, #23 simultaneously
2. **19 stale remote branches — review and close within 48h** — PM v113 Decision 2 — scoring branch must NOT merge without documented algorithm critique
3. **Supabase delete-account SQL paste** — paste `server/sql/delete-account.sql` into Supabase SQL editor (App Store gate only)
