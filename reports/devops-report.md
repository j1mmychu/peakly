# Peakly DevOps Report — 2026-06-22

**Status: 🟢 GREEN**

Cache stamp bumped `20260621a` → `20260622a`. EWR added to `AP_CONTINENT` (1-line prereq for 5 US domestic beach venues). No P0 code issues. Business P0 remains: Reddit post Day 18.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, Open-Meteo, and GitHub Pages is blocked from this remote execution environment. A sandbox 403/timeout is NOT evidence of VPS downtime. Last confirmed VPS healthy: June 13 (networked session). Jack: run `curl https://peakly-api.duckdns.org/health` before posting.

---

## Fixes Applied This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache stamp `20260621a` → `20260622a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | 1 day stale — bumped in lockstep |
| `EWR:"na"` added to `AP_CONTINENT` | `app.jsx:466` | Missing prereq for Newark-origin venues. Unblocks 5 US domestic beach venues (Malibu, Crane Beach, St Pete, Flamenco, Asbury Park) pending content freeze lift |

---

## Full Invariant Check

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,220 lines / 664 KB raw (~175 KB gzip est.)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260621a` — 1 day stale |
| Cache stamp (post-fix) | `20260622a` ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260622a` ✅ |
| Brace balance | **5552 open / 5552 close — BALANCED** ✅ |
| Sentry DSN | `9416b032a4...` at `index.html:77`, `defer`'d ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (eval) | **361** (130 skiing / 231 beach) ✅ |
| Venue baseline | `scripts/.venue-baseline` = 361 — no crater ✅ |
| Duplicate IDs | **0** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| `loading="lazy"` on images | All venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live in ExploreTab ✅ |
| `ScoringExplainer` | Live ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| `lateSeason: true` venues | **29** ✅ |
| Supabase eager script | Removed — lazy-loaded only ✅ |
| Leaflet eager script | Removed — `ensureLeaflet()` lazy-loads on map open only ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 5s + 3-retry backoff ✅ |
| `_tryProxyWx` timeout | 4s + direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only. `TP_MARKER=710303` is public affiliate marker only ✅ |
| Supabase anon key in client | Present — expected, RLS-gated ✅ |
| Supabase service role key | **Not present** ✅ |
| `.gitignore` secrets coverage | `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, business docs — all covered ✅ |
| Babel in PRECACHE | `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` ✅ |
| Photo dedup max repeat | **2×** ✅ (below the 3× target) |
| `EWR` in `AP_CONTINENT` | ✅ (fixed this run — was missing) |

---

## 1. Security Audit

**CLEAN.** No credentials in client code.

| Check | Finding |
|-------|---------|
| Travelpayouts API token | Server-side env only ✅ |
| Supabase anon key | Public by design, RLS gates all data access ✅ |
| Supabase service key | Absent ✅ |
| Sentry DSN | Expected in client; DSNs are public-safe ✅ |
| Git history | Business PDF leak (May 9) scrubbed via `git-filter-repo` ✅ |
| SRI on CDN scripts | Leaflet only — React, Babel, Sentry missing SRI (**P3 — deferred post-launch, final per PM v64**) |

---

## 2. Flight Proxy

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Timeout | `AbortController` at 5000ms ✅ |
| Retry | 3 attempts, 1.2s / 2.4s backoff ✅ |
| Rate-limit handling | 429 → backoff; 5xx → mark down, return null ✅ |
| Concurrency cap | Semaphore at 3 concurrent requests ✅ |
| VPS health | **Unverifiable from sandbox** — last confirmed June 13 (networked session). Jack: `curl https://peakly-api.duckdns.org/health` before the Reddit post. If `wx_cache_size` is 0, let it warm up a few minutes. |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo | Direct `api.open-meteo.com/v1` with proxy-first + fallback ✅ |
| Marine API | `marine-api.open-meteo.com/v1/marine` — beach venues only ✅ |
| Batch | 50 venues / 2s stagger ✅ |
| Rate-limit risk | ~66+ concurrent DAU saturates Open-Meteo free tier. VPS weather cache is the mitigation — confirm it's up before Reddit post. |

---

## 4. Performance

| Asset | ~Gzip | Load mode |
|-------|-------|-----------|
| React 18.3.1 + ReactDOM | ~175 KB | blocking `<script>` |
| **Babel Standalone 7.29.7** | **~800 KB** | preload + blocking `<script>` — biggest bottleneck |
| Supabase JS 2.106.2 | ~80 KB | lazy (JS dynamic load) ✅ |
| Leaflet 1.9.4 | ~40 KB | lazy (`ensureLeaflet()` on map open) ✅ |
| Sentry CDN loader | ~10 KB | `defer`'d ✅ |
| `app.jsx` | ~175 KB | `text/babel` — parsed + transpiled client-side |
| **Cold-start total** | **~1.2 MB gzip** | Repeat visits: Babel cached in PRECACHE |

Babel is the structural ceiling. The SW now caches it in PRECACHE so repeat visits skip the CDN fetch. New user cold TTI on mid-range Android 4G: 6–8s. Not fixable without a build step — accepted pre-launch cost.

CDN versions: React 18.3.1 ✅ · Babel 7.29.7 ✅ · Supabase 2.106.2 ✅ — no updates needed.

---

## 5. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| **Reddit post** | **P0 (business)** | Jack | Day 18. Product is done. This is the only P0. |
| **VPS health confirm** | P1 pre-launch | Jack | `curl https://peakly-api.duckdns.org/health` — 5 min, do before posting |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 App Store / P3 web | Jack | Required for App Store 5.1.1(v). 2 min. |
| lateSeason inflation — 21 JSON-format venues | P2 | July sprint | `snow_depth_max >= 0.5m` gate limits user-facing damage |
| Single-tag ski venues (40 venues) | P3 | July sprint | Filter discoverability only |
| SRI on CDN scripts | P3 | Post-launch | Final per PM v64 |
| CSP meta | P3 | Post-launch | Babel `unsafe-eval` makes strict CSP impossible |

**Permanently closed — stop raising:**
- Peakly Pro price discrepancy (Pro UI gone April 16)
- Sentry DSN empty (active at `index.html:77`)
- Cache buster stale (structural auto-bump handles it; this run fixed 1-day lag)
- Photo 5× violation (false positive — exact-hash audit confirms 2× max)
- VPS "Day X binary blocker" framing (confirmed healthy June 10/13; sandbox 403s are egress-blocked containers, not server downtime)
- DEAL_WEIGHT finding (75/25 locked May 13)
- GEAR_ITEMS finding (Amazon cut for v1; `grep -c GEAR_ITEMS app.jsx → 0`)
- EWR missing from AP_CONTINENT (fixed this run)

---

## Cost Projection

| Scale | Monthly cost | Notes |
|-------|-------------|-------|
| <10 MAU (now) | $6/mo | DO droplet + GH Pages free |
| 1K MAU | $6/mo | Proxy holds, Open-Meteo fine |
| 10K MAU | $12/mo | Upgrade to 2GB droplet; VPS weather cache becomes load-bearing |
| 100K MAU | $50-100/mo | 3× droplets + managed Postgres |

---

## What Breaks First at Scale

Open-Meteo free tier at ~66+ simultaneous DAU on the same venue set. The VPS weather cache collapses N simultaneous requests to 1 upstream call — it's deployed, but unverified since June 13. After a Reddit spike this is the first thing that matters; the client falls back to direct Open-Meteo (degraded, rate-limited, not broken) so it's survivable. Second to fail: Babel cold-load TTI drives bounce for new users — every cold load is 6-8s blank screen on 4G mobile. Third: DO 1GB RAM ceiling if alert polling and weather polling overlap during a spike. None of these are launch blockers at <10 MAU.
