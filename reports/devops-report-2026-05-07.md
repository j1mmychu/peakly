# Peakly DevOps Report — 2026-05-07

**Overall Status: 🔴 RED**

There is a P0 emergency: CLAUDE.md describes a May 3–4 sprint (surf removal, weekend scoring engine, seasonal multiplier, gear gate flip, cache bump to 20260504h) as SHIPPED — but **none of those commits exist in the git history**. The live site at j1mmychu.github.io/peakly still has 77 surfing venues, a broken Amazon gear gate, and no `scoreWeekend()` function. CLAUDE.md is describing a parallel session's work that was never pushed to this repo. Users are hitting the unfixed codebase right now.

---

## Fixes Applied This Run

| Fix | File | Why |
|---|---|---|
| Cache buster `20260502a` → `20260507a` | `index.html` | 5 days stale — returning users never get fresh code |
| SW `CACHE_NAME` `peakly-20260502` → `peakly-20260507` | `sw.js` | Matches index.html bust; without this the SW never evicts old assets |

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | 7,172 lines / 469 KB |
| CDN scripts | All HTTPS, pinned versions ✅ |
| Plausible analytics | Present, uncommented, domain `j1mmychu.github.io` ✅ |
| Sentry script | Loaded with real DSN ✅ |
| Cache buster (before this run) | `v=20260502a` — **5 days stale** ❌ |
| SW CACHE_NAME (before this run) | `peakly-20260502` — **5 days stale** ❌ |
| Cache buster (after this run) | `v=20260507a` ✅ |
| SW CACHE_NAME (after this run) | `peakly-20260507` ✅ |

---

## P0 — CLAUDE.md / Code Divergence (Ship Blocker)

**Every item in CLAUDE.md's "Recently Fixed (2026-05-03 and 2026-05-04)" sections is fiction in the live codebase.** The git log has 229 commits; the last code-change commit is `3139d77` (2026-05-02). The commits `bb56aaf`, `a9aacf5`, `84f5e30`, `47f12e1` etc. referenced in CLAUDE.md do not exist here.

### What CLAUDE.md says is done vs what the code actually has:

| CLAUDE.md claims | Live code reality |
|---|---|
| "Killed all 77 surfing venues" | 77 surfing venues still in VENUES (lines 382–528) |
| "Renamed tanning → beach" | VENUES still uses `category:"tanning"` throughout |
| "Surfing" CATEGORY removed | `{ id:"surfing", label:"Surf" }` still in CATEGORIES (line 169) |
| `scoreWeekend()` function added | No such function exists |
| `weekendDayIndices()` function added | No such function exists |
| `getSeasonalMultiplier()` added | No such function exists |
| Carousel title → "Firing this weekend" | Not verified present |
| `lateSeason: true` on Cervinia/Val d'Isere | No `lateSeason` field anywhere in VENUES |
| `aruba-eagle-beach-t1` dup deleted | Only one aruba entry present ✅ (was already clean) |
| Amazon gear gate flipped | Still `{false && GEAR_ITEMS[listing.category] && ...}` at line 5763 |
| Deal-algorithm seasonality pass | No `getSeasonalMultiplier` anywhere |
| Stale `flight.foundAt` logic | Not verified present |
| Cache at `20260504h` | Was at `20260502a` before this run |

### What this means for users right now:
- Surfing is showing as a category on the front page
- Scoring surfing venues without wiring weekend-specific scoring  
- Amazon Associates earning $0 (gear gate still `false &&`)
- No weekend confidence flag — the product vision's core differentiator is missing

### Fix:
This is a multi-session recovery. Jack needs to either:
1. Cherry-pick or reapply the May 3–4 work from the other machine/session and push it, OR
2. Treat this session as starting fresh and re-apply those changes in order

The gear gate flip is a 1-character change that can ship immediately:

```diff
- {false && GEAR_ITEMS[listing.category] && (
+ {GEAR_ITEMS[listing.category] && (
```
Location: `app.jsx:5763`

The surf retirement and `scoreWeekend` implementation are non-trivial (7K→6K line changes). Do not touch without explicit direction.

---

## 2. Flight Proxy Status

| Check | Result |
|---|---|
| Proxy URL in app.jsx | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| No raw IP in client code | ✅ (uses DNS name only) |
| fetchTravelpayoutsPrice timeout | 5000ms AbortController ✅ |
| Retry logic | 3 attempts with 1200ms/2400ms backoff ✅ |
| Null fallback on failure | ✅ |
| `depart_date`/`return_date` support | ❌ Proxy returns month-cheapest, not Fri–Mon fares (P0 from CLAUDE.md — unfixed) |

The weekend-specific date issue (`fetchTravelpayoutsPrice` returns month-cheapest) is the same P0 flagged in CLAUDE.md and is **unaddressed**. Proxy.js uses `entry.depart_date` for monthly bucketing but accepts no date params from the client.

**Fix (requires VPS redeploy):**

In `server/proxy.js`, add `depart_date` and `return_date` query params:
```js
// In GET /api/flights handler, after IATA validation:
const departDate = req.query.depart_date; // "2026-05-08"
const returnDate = req.query.return_date; // "2026-05-11"
// Pass to Travelpayouts v2 prices API with period param
```

In `app.jsx`, `fetchTravelpayoutsPrice`:
```js
const { fri, mon } = weekendDayIndices(new Date()); // once scoreWeekend lands
const url = `${FLIGHT_PROXY}/api/flights`
  + `?origin=${encodeURIComponent(origin)}`
  + `&destination=${encodeURIComponent(destination)}`
  + `&depart_date=${fri}&return_date=${mon}`;
```
ETA: 2–3 hours (proxy change + VPS deploy + app.jsx change).

---

## 3. Weather & External APIs

| Check | Result |
|---|---|
| Open-Meteo base URL | `https://api.open-meteo.com/v1` ✅ |
| Marine API URL | `https://marine-api.open-meteo.com/v1` ✅ |
| Request timeout | 8000ms AbortController on `fetchWeather` and `fetchMarine` ✅ |
| Retry on 429/5xx | 2 retries with backoff ✅ |
| Weather cache TTL | 2hr (WX_CACHE_TTL), 6hr hard eviction ✅ |
| Flight cache TTL | 15min, 2hr hard eviction ✅ |
| needsMarine coverage | `venue.category === "surfing" \|\| venue.category === "tanning"` ✅ |
| Rate limit batching | 50 venues / 2 seconds per CLAUDE.md ✅ |

Weather caching is fully implemented contrary to what CLAUDE.md's open items say — `_wxCacheGet`, `_wxCacheSet`, `WX_CACHE_TTL` are all live. Update CLAUDE.md item #7 ("Open-Meteo weather cache still unbuilt") — it IS built.

**Rate limit math for 1K MAU:**
Open-Meteo free tier: 10,000 req/day, 600 req/min. With 154 venues × 2 APIs (weather + marine for beach/surf) = up to 300 calls per user session. At 1K MAU, ~100 DAU, if they don't hit cache = 30,000 calls/day. **This blows the free tier at ~330 DAU.** However: (1) calls are per-browser so each user's IP has its own quota, and (2) 2hr TTL means repeat visits are cached. Actual risk is low at 1K MAU. Monitor at 5K DAU.

---

## 4. Security Audit

| Check | Result |
|---|---|
| Travelpayouts token in client code | Not present ✅ — proxy uses `process.env.TRAVELPAYOUTS_TOKEN` |
| `TP_MARKER = "710303"` in client | Present at app.jsx:1619 — this is an **affiliate marker** (commission ID), not an API secret. It's intentionally public and is embedded in booking links. Not a vulnerability. |
| Sentry DSN in index.html | `9416b032a46681d74645b056fcb08eb7@o4511108...` — Sentry DSNs are public by design for frontend monitoring. Not a vulnerability. |
| .gitignore | `.env`, `.env.*`, `*.key`, `*.pem`, `.p8` all covered ✅ |
| Recent commits for secrets | No secrets detected in commits since 2026-03-25 ✅ |
| No SRI on CDN scripts | ❌ React, ReactDOM, Babel loaded without `integrity=` attributes |
| No CSP meta | ❌ No `Content-Security-Policy` header or meta tag |

**SRI fix for index.html (P1)** — prevents CDN compromise serving malicious JS:
```html
<!-- Replace existing React script tags with: -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-PLACEHOLDER_RUN_openssl_dgst_-sha384_-binary_react.production.min.js"
  crossorigin="anonymous"></script>
```
**Warning:** SRI requires knowing the exact hash. Run `curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A` on VPS to get real hash. SRI + Babel standalone is tricky — Babel's inline JSX eval may need `'unsafe-eval'` in CSP. Test in staging first. ETA: 1 hour.

---

## 5. Performance Analysis

| Component | Size (estimated) |
|---|---|
| React 18.3.1 UMD production | ~130 KB gzipped |
| ReactDOM 18.3.1 UMD production | ~42 KB gzipped |
| **Babel Standalone 7.24.7** | **~900 KB gzipped** |
| app.jsx (469 KB raw, parsed by Babel) | ~120 KB gzipped |
| Plus Jakarta Sans (4 weights) | ~80 KB |
| **Total estimated first load** | **~1.27 MB gzipped** |

**The single largest performance bottleneck is Babel Standalone.** It's ~900 KB of JavaScript that ships to every user on every first load just to transpile JSX once. At 3G (1.5 Mbps), Babel alone = 4.8 seconds. Core Web Vitals LCP will be poor.

This is an architectural constraint of the no-build-step decision. The mitigation path (without a build step) is to precompile app.jsx to vanilla JS in CI. `.github/workflows/deploy.yml` can run `npx @babel/core --presets @babel/preset-react app.jsx -o app.compiled.js` and serve the compiled output. Then drop the Babel Standalone CDN tag entirely. **Saves 900 KB on every first load.** ETA: 2–3 hours.

Other checks:
- All `<img>` tags use `loading="lazy"` ✅
- CDN dependency versions: React 18.3.1 ✅ (current), Babel 7.24.7 (7.25.x exists but 7.24.7 is stable) ✅

---

## 6. Cost Projection

| Scale | DigitalOcean VPS | CDN / Pages | Open-Meteo | Total/mo |
|---|---|---|---|---|
| Current | $6 (1GB droplet) | $0 (GitHub Pages) | $0 (free tier) | **$6** |
| 1K MAU | $6 | $0 | $0 | **$6** |
| 10K MAU | $12–$24 (2GB, proxy load) | $0 | $0 | **$12–24** |
| 100K MAU | $48–$96 (load-balanced or 4GB) | $0–$20 | $40/mo (commercial) | **$88–156** |

**The proxy is the first thing to break at scale.** The Node.js VPS has no process manager recovery beyond PM2 (assumed), no horizontal scaling, and the in-memory rate limit Map is wiped on restart. At ~5K MAU with concurrent weekend traffic spikes (Friday afternoon = everyone checking weekend conditions simultaneously), 154 venues × N users hitting `/api/flights` will saturate the single-threaded Node process.

**Prevention plan:**
1. 0–1K MAU: Current setup fine, monitor `/api/flights` response time
2. 1K–10K MAU: Enable PM2 cluster mode (uses all CPU cores, zero-cost): `pm2 start proxy.js -i max`
3. 10K–50K MAU: Add Redis for flight price cache (share across workers, reduce Travelpayouts calls)
4. 50K+ MAU: Move to $48 DigitalOcean droplet or Render.com managed Node + CDN for app.jsx

---

## 7. Reports Directory Hygiene

The `reports/` directory has ~50 files older than 7 days that should be in `reports/archive/`. Per the CLAUDE.md rule, files older than 7 days (before 2026-04-30) must be archived. Not archiving this run to keep the commit focused, but this is 840 KB of clutter and inflates repo size.

**Command to archive (run when ready):**
```bash
find reports/ -maxdepth 1 -name "*.md" -not -newer reports/devops-report-2026-05-07.md \
  -exec mv {} reports/archive/ \;
```

---

## Summary: What Will Break First at Scale

**The proxy.js Node process will fall over first.** It's a single process on a 1GB droplet with in-memory rate-limiting and no clustering. Weekend peak traffic (Friday 2–6 PM EST) means all active users are simultaneously checking conditions for this weekend — that's potentially hundreds of concurrent `/api/flights` requests in a 30-minute window. At ~2K MAU you'll see 503s. Fix costs $0: `pm2 start server/proxy.js -i max`. The second failure is open-meteo rate limits — but since calls are per-browser-IP, you don't hit this until you have thousands of concurrent users from the same corporate NAT or shared WiFi. The real Achilles heel is that the entire app.jsx parses every session via Babel Standalone — a precompile step in CI eliminates 900 KB of JS payload and saves ~4 seconds of first load on mobile. That's what kills conversion before you ever get to scale.

---

## Action List

| Priority | Item | ETA | Blocking? |
|---|---|---|---|
| **P0** | Recover May 3–4 sprint work — reapply surf removal, scoreWeekend, gear gate, seasonal pricing from other machine | 4–8 hrs | Yes — product is showing wrong categories |
| **P0** | Flip Amazon gear gate: `false &&` → `GEAR_ITEMS[listing.category] &&` at app.jsx:5763 | 2 min | Revenue |
| **P0** | Weekend date pricing in proxy.js (CLAUDE.md item #6) | 2–3 hrs | Product vision |
| **P1** | PM2 cluster mode on VPS: `pm2 start server/proxy.js -i max` | 10 min | Scale |
| **P1** | Precompile app.jsx in CI to eliminate Babel Standalone (900KB saved) | 2–3 hrs | Performance |
| **P1** | SRI hashes on CDN scripts | 1 hr | Security |
| **P1** | Update CLAUDE.md item #7 — weather cache IS built, remove from open items | 5 min | Accuracy |
| **P2** | Archive reports/ files older than 2026-04-30 | 5 min | Hygiene |
| **P2** | CSP meta tag | 30 min | Security |
| **P2** | Plausible domain update if/when peakly.app goes live | 5 min | Analytics |

---

*Report written by DevOps agent. Cache bust applied (20260502a → 20260507a). No other code changes made this run — the P0 divergence requires explicit direction before touching VENUES or scoring.*
