# DevOps Report — 2026-09-08 (YELLOW)

**Status: 🟡 YELLOW — No new P0s today. VPS debt (Open #19/#21/#23) is Day 46 — still the pre-Reddit gate. Open #22 BASE_PRICES now covers only 15 of 165 venue airports (91% gap). 18 zombie branches on remote. Venue count: 405 (matches baseline). All security checks clean.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treated as healthy per that prior verification. All proxy analysis is from committed source only.

---

## What Changed Since Yesterday

- **No app.jsx changes** since yesterday's AGP/AKL/GRU fix (commit `80e1721`). Venue count stable at **405** (134 ski / 271 beach) — matches `.venue-baseline`.
- **PM v143 report** confirms venue search deadline is Sep 14 (6 days from today). No build progress detected in any committed code.
- **18 zombie branches unchanged** — same list as Day 44, Day 45.
- **VPS Open #19/#21/#23**: Day 46. Code is committed. VPS has never been redeployed since 2026-08-11.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,152** (unchanged) |
| app.jsx bytes | **757,359** (~740 KB unminified; ~484 KB minified) |
| dist/app.min.js | **484 KB** (esbuild output, no Babel overhead in prod) |
| Cache buster | `20260907a` — ⚠️ Same value as yesterday (no app.jsx changes today, acceptable) |
| Plausible analytics | ✅ Active — `data-domain="j1mmychu.github.io/peakly"` in `index.html:32` |
| Sentry DSN | ✅ Active — `9416b032a46681d74645b056fcb08eb7` wired in `app.jsx:8` and `index.html:77` |
| React CDN | ✅ 18.3.1 from `cdnjs.cloudflare.com` (SLA-backed, pinned) |
| Babel CDN | ✅ 7.24.7 from `cdnjs.cloudflare.com` (dev-only — stripped by esbuild in prod) |
| Production build | ✅ `deploy.yml` runs `node scripts/build-web.mjs` on every push |
| Lazy loading | ✅ 9/9 `<img>` tags include `loading="lazy"` |
| VENUES count | ✅ **405** eval-confirmed (134 ski / 271 beach) — matches `.venue-baseline` |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | ✅ HTTPS — `https://peakly-api.duckdns.org` (`app.jsx:6333`) |
| Travelpayouts token | ✅ Server-side only — `process.env.TRAVELPAYOUTS_TOKEN` (`proxy.js:13`), never in client |
| CORS | ✅ `capacitor://localhost` included for iOS native |
| DELETE method | ✅ In `Access-Control-Allow-Methods` — alert deletion unblocked |
| Rate limiter XFF | ✅ Uses `.pop()` (last entry) — forge bypass closed |
| Rate limit | ✅ 600 req/min per IP with 1-minute window |
| `forecast_days` | ✅ 14 for weather, 10 for marine (both endpoints) |
| APNs HTTP/2 | ✅ `http2.connect()` — not `fetch()` |
| APNs JWT signing | ✅ `dsaEncoding: 'ieee-p1363'` — Apple's required R‖S format |
| Weather disk cache | ✅ `wx-cache.json` written every 5 minutes via `setInterval(_saveCacheToDisk, 5*60*1000)` |

**⚠️ VPS REDEPLOY STILL PENDING (Day 46)** — all the above fixes are committed to `server/proxy.js` but `/opt/peakly-proxy` on the VPS is a hand-copied directory, not a git clone. The live server is still running the August 11 build, which has none of these fixes. Every day this stays undeployed is another day of:
- Two-weekend scoring disabled (client needs `forecast_days:14` from the server cache)
- iOS native calls blocked (no `capacitor://localhost` CORS on old build)
- Alert deletion silently failing (no `DELETE` in old CORS header)

---

## 3. Security Audit

| Check | Result |
|-------|--------|
| Exposed API keys/tokens | ✅ Clean — no secrets in `app.jsx` |
| Supabase anon key | ℹ️ `app.jsx:26` — this is the public-safe anon key by design (RLS-gated). Not a vulnerability. |
| Travelpayouts token | ✅ Server-side only |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Alert IDs | ✅ `crypto.randomUUID()` with `getRandomValues`/`Math.random` fallback (`app.jsx:10824`) |
| Recent commits for secrets | ✅ Clean — last 8 commits are reports only |

---

## 4. Open-Meteo Rate Limit Risk

405 venues × 2 calls each (weather + marine for beach venues) = up to **810 upstream requests** on a cold-cache load. Batched at 50 venues per 2 seconds = ~32 seconds to load all venues. At current <10 MAU, zero risk. At 1K MAU, the proxy cache (4000-entry LRU, 2hr TTL) absorbs repeated same-coord calls — **this is the entire reason the VPS proxy was built.**

**P0 if Reddit post lands before VPS redeploy:** A Reddit/HN spike hitting the live site will bypass the proxy cache (because it's the stale build) and hammer Open-Meteo directly. Open-Meteo's free tier is approximately 10,000 calls/day. At 1,000 users browsing simultaneously, that ceiling hits in seconds.

---

## 5. BASE_PRICES Coverage — QUANTIFIED P1

```
Total venue airports: 165
BASE_PRICES entries:  15
Coverage gap:         150 of 165 airports (91%) missing
```

The 15 airports currently in BASE_PRICES: YVR, JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, IAH, PHL, LAS, PHX, MSP

Missing airports include: BOB, GVA, ASE, EGE, SLC, JAC, MTJ, RNO, HDN, SUN, SAF, BTV, ALB, GUC, FCA, PDX, ANC, CTS, NRT, ZQN — and 130 more.

**Impact:** For 91% of venue airports, `getTypicalPrice()` falls through to a hardcoded global fallback. Deal scores are meaningless for non-US-hub routes. "LIVE from $X" badges against stale estimates are showing wrong savings percentages for the majority of the catalog.

**Fix** (PM's top-15 recommendation — ~2hr task):

```javascript
// Add to BASE_PRICES in app.jsx after existing entries:
SLC: { skiing: 280, beach: 350 },  // Salt Lake City — gateway to Alta/Snowbird/Park City
ZRH: { skiing: 650, beach: 750 },  // Zurich — gateway to Zermatt/St. Moritz/Verbier/Engelberg
GVA: { skiing: 620, beach: 720 },  // Geneva — gateway to Chamonix/Tignes/Val Thorens
NRT: { skiing: 900, beach: 700 },  // Tokyo — gateway to Niseko/Hokkaido
ZQN: { skiing: 1200, beach: 800 }, // Queenstown — NZ ski venues
MEL: { skiing: 900, beach: 600 },  // Melbourne — AUS ski venues
SCL: { skiing: 800, beach: 500 },  // Santiago — Chile ski venues
BOB: { skiing: 9999, beach: 1400 },// Bora Bora (no ski; beach flagship)
CDG: { skiing: 550, beach: 650 },  // Paris — gateway to French Alps
VIE: { skiing: 500, beach: 600 },  // Vienna — gateway to Austrian Alps
MUC: { skiing: 480, beach: 580 },  // Munich — Austrian/Bavarian Alps
PDX: { skiing: 260, beach: 320 },  // Portland — Mt. Hood
RNO: { skiing: 220, beach: 300 },  // Reno — Lake Tahoe/Mammoth
ASE: { skiing: 350, beach: 9999 }, // Aspen (no beach; ski flagship)
ANC: { skiing: 450, beach: 600 },  // Anchorage — AK venues
```

---

## 6. Zombie Branch Cleanup — P2

18 stale remote branches, unchanged for at least 3 days:

```
15 × claude/*   — abandoned exploratory cloud-agent PRs, none merged to main
fix-appjsx-final
restore-appjsx
test-small
```

**Fix — Jack runs these commands:**
```bash
# Delete all 18 zombie branches from remote
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
  claude/review-peakly-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small

# Prune local tracking refs
git remote prune origin
```

Estimated time: 2 minutes.

---

## 7. Performance Analysis

| Metric | Value |
|--------|-------|
| Production JS bundle | `484 KB` (`dist/app.min.js`, esbuild) |
| Dev JS load (Babel) | ~740 KB raw + 700 KB Babel standalone = **~1.4 MB** |
| CDN deps (React + ReactDOM) | ~150 KB combined (gzipped) |
| Supabase SDK (lazy-loaded) | ~80 KB gzipped, only on auth flow |
| Largest bottleneck | **405-venue weather batch**: 810 upstream API calls on cold cache, 32s completion |

The `loading="lazy"` check passes on all 9 img tags. The real performance story is the weather fetch: until the VPS proxy cache is deployed and warm, every user effectively runs their own cold-start Open-Meteo fetch. At Reddit scale, this is the primary failure mode.

---

## 8. Cost Projection

| Scale | Infra cost | Notes |
|-------|-----------|-------|
| Today (<10 MAU) | **$6/mo** | DigitalOcean 1GB droplet |
| 1K MAU | **$6/mo** | Droplet handles it; VPS proxy cache absorbs Open-Meteo load |
| 10K MAU | **$18-36/mo** | Upgrade to 2-4 GB droplet; GitHub Pages CDN handles static |
| 100K MAU | **$100-200/mo** | Droplet cluster or move proxy to App Platform; CDN offloads static |

GitHub Pages is free and CDN-backed globally. The VPS proxy at $6/mo is the only paid infra. **Cost optimization opportunity:** at 10K+ MAU, adding a Redis instance ($7/mo on DigitalOcean) would let the VPS proxy scale horizontally without cache inconsistency.

---

## Priority Summary

### P0 — Fix Today (Launch Blocker)
**None today.** The last P0 (AGP/AKL/GRU AIRPORT_COORDS) was fixed yesterday in commit `80e1721`.

### P1 — Fix This Week
1. **VPS Redeploy (Open #19/#21/#23, Day 46)** — `forecast_days:14`, disk cache, CORS/DELETE/iOS all inert until Jack SSH-deploys. Pre-Reddit gate. **The Oct 11 Reddit launch date depends on this being live before the venue search build session, which has a Sep 14 deadline.** Time: 30 minutes SSH session.

   ```bash
   # Jack runs on 198.199.80.21:
   cd /opt/peakly-proxy
   # NOT a git clone — copy manually:
   # scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
   pm2 restart peakly-proxy
   curl -s https://peakly-api.duckdns.org/health
   # Verify: forecast_days:14, wx_cache on disk, apns status
   ```

2. **BASE_PRICES top-15 backfill (Open #22)** — 91% gap. See fix above. Time: ~2 hours.

### P2 — Fix This Sprint
1. **Zombie branch cleanup** — 18 stale remote branches polluting the repo. Commands above. Time: 2 minutes.
2. **Venue text search** — PM deadline Sep 14 (6 days). Not DevOps scope, but if it misses deadline the Oct 11 Reddit post slips to Oct 18. Flagging as awareness item.

---

## What Will Break First at Scale

**Open-Meteo rate limit ceiling — and it will break hard with no warning.**

The architecture assumes the VPS proxy cache absorbs all repeat weather fetches. That cache currently isn't running the deployed fixes (no `forecast_days:14`, no disk persistence). A Reddit spike hitting the current live VPS gets the stale build, which means: (a) two-weekend scoring returns wrong results because it's querying 7-day data, and (b) the in-memory cache resets on every `pm2 restart`. At ~70 concurrent DAU hitting the same popular venues (Whistler, Chamonix, Tulum), Open-Meteo's free tier of 10,000 daily API calls exhausts in minutes. Once rate-limited, the client falls back to direct Open-Meteo calls — which means 70 users each firing 405 venue requests, blowing through the ceiling even faster.

**Prevention:** Redeploy the VPS before any public traffic. One 30-minute SSH session. That's it. The code is already written and committed.
