# Peakly DevOps Report — 2026-06-23

**Status: 🟢 GREEN**

Cache stamp bumped `20260622a` → `20260623a`. Coronet Peak `lateSeason: true` removed (P2 S-hem correctness bug, 1 line). All invariants pass. Business P0 remains: Reddit post Day 19.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, Open-Meteo, and GitHub Pages is blocked in this remote execution environment. A sandbox 403/timeout is NOT evidence of VPS downtime. Last confirmed VPS healthy: June 13 (networked session). Jack: run `curl https://peakly-api.duckdns.org/health` before posting to Reddit.

---

## Fixes Applied This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache stamp `20260622a` → `20260623a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | 1 day stale — bumped in lockstep |
| Removed `lateSeason: true` from `coronet-peak` | `app.jsx:1212` | S-hem venue (lat −44.93°, Queenstown NZ). The `lateSeason` flag is a N-hem-only bypass for the off-season binary cap when `snow_depth_max >= 0.5m`. For S-hem venues, the in-season gate (`mo >= 5 && mo <= 10`) already handles seasonality — `lateSeason` is irrelevant here and could incorrectly inflate scores in NZ off-months. lateSeason count: 27 → 26. |

---

## Full Invariant Check

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,220 lines / 664 KB raw (~175 KB gzip est.)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260622a` — 1 day stale |
| Cache stamp (post-fix) | `20260623a` ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260623a` ✅ |
| Brace balance | **5552 open / 5552 close — BALANCED** ✅ |
| Sentry DSN | `9416b032a4...` at `index.html:77`, `defer`'d ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (bracket-walker eval) | **361** (130 skiing / 231 beach) ✅ |
| Venue baseline (`scripts/.venue-baseline`) | **361** — no crater ✅ |
| Duplicate IDs | **0** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| `loading="lazy"` on images | All venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live in ExploreTab ✅ |
| `ScoringExplainer` | Live ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| `lateSeason: true` venues | **26** (was 27; coronet-peak fixed this run) ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 5s + 3-retry backoff ✅ |
| `_tryProxyWx` timeout | 4s + direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only. `TP_MARKER=710303` is public affiliate marker only ✅ |
| Supabase anon key in client | Present — expected, RLS-gated ✅ |
| Supabase service role key | **Not present** ✅ |
| `.gitignore` secrets coverage | `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, business docs — covered ✅ |
| Babel in PRECACHE | `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` ✅ |
| Photo max repeat | **3×** (content agent confirmed) ✅ |
| `coronet-peak` S-hem lateSeason | **FIXED this run** ✅ |

---

## 1. Security Audit

**CLEAN.** No credentials in client code.

| Check | Finding |
|-------|---------|
| Travelpayouts API token | Server-side env only ✅ |
| Supabase anon key | Public by design, RLS gates all data access ✅ |
| Supabase service key | Absent ✅ |
| Sentry DSN | Expected in client; Sentry DSNs are public-safe ✅ |
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
| VPS health | **Unverifiable from sandbox** — last confirmed June 13 (networked session). Jack: run `curl https://peakly-api.duckdns.org/health` before the Reddit post. If `wx_cache_size` is 0, let it warm a few minutes. |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo | Direct `api.open-meteo.com/v1` with proxy-first + fallback ✅ |
| Marine API | `marine-api.open-meteo.com/v1/marine` — beach venues only ✅ |
| Batch stagger | 50 venues / 2s ✅ |
| Rate-limit risk | ~66+ concurrent DAU saturates Open-Meteo free tier. VPS weather cache is the mitigation. Confirm up before Reddit post. |

---

## 4. Performance

| Asset | ~Gzip | Load mode |
|-------|-------|-----------|
| React 18.3.1 + ReactDOM | ~175 KB | blocking `<script>` |
| **Babel Standalone 7.29.7** | **~800 KB** | preload + blocking — biggest single bottleneck |
| Supabase JS 2.106.2 | ~80 KB | lazy (JS dynamic load) ✅ |
| Leaflet 1.9.4 | ~40 KB | lazy (`ensureLeaflet()` on map open) ✅ |
| Sentry CDN loader | ~10 KB | `defer`'d ✅ |
| `app.jsx` | ~175 KB | `text/babel` — parsed + transpiled client-side |
| **Cold-start total** | **~1.2 MB gzip** | Repeat visits: Babel cached in PRECACHE |

Babel is the structural ceiling. New-user cold TTI on mid-range Android 4G: 6–8s blank screen. Not fixable without a build step. PRECACHE mitigates repeat visits.

CDN versions: React 18.3.1 ✅ · Babel 7.29.7 ✅ · Supabase 2.106.2 ✅ — no updates needed.

---

## 5. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| **Reddit post** | **P0 (business)** | Jack | Day 19. Product is done. This is the only real P0. |
| **VPS health confirm** | P1 pre-launch | Jack | `curl https://peakly-api.duckdns.org/health` — 5 min. Do it before posting. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 App Store / P3 web | Jack | Required for App Store 5.1.1(v). 2 min. Web product unaffected until then. |
| lateSeason inflation — 21 batch ski venues (Killington worst) | P2 | July sprint | Snow-depth gate suppresses most; Killington priority within sprint. |
| 40 single-tag ski venues | P3 | July sprint | Filter discoverability gap only. |
| SRI on CDN scripts | P3 | Post-launch | Final per PM v64. |
| CSP meta | P3 | Post-launch | Babel `unsafe-eval` makes strict CSP structurally impossible. |

**Permanently closed — stop raising:**
- Peakly Pro price (Pro UI gone April 16)
- Sentry DSN empty (active at `index.html:77`)
- Cache buster stale (auto-bumped daily; this run fixed 1-day lag)
- VPS "Day X binary blocker" framing (confirmed healthy June 13; sandbox 403s are container egress blocks, not server downtime)
- DEAL_WEIGHT finding (75/25 locked May 13)
- GEAR_ITEMS finding (Amazon cut v1; count = 0)
- `coronet-peak` lateSeason flag (fixed this run)
- EWR missing from AP_CONTINENT (fixed June 22)

---

## Cost Projection

| Scale | Monthly cost | Notes |
|-------|-------------|-------|
| <10 MAU (now) | $6/mo | DO droplet + GH Pages free |
| 1K MAU | $6/mo | Proxy holds fine |
| 10K MAU | $12/mo | 2GB droplet; weather cache becomes load-bearing at this tier |
| 100K MAU | $50–100/mo | 3× droplets + managed Postgres |

---

## What Breaks First at Scale

Open-Meteo free tier saturates at ~66+ simultaneous DAU hitting the same venue set. The VPS weather cache collapses N parallel requests to 1 upstream call — deployed, but unverified since June 13. After a Reddit spike, that's the first thing to watch; the client falls back to direct Open-Meteo (degraded, rate-limited, survivable). Second to fail: Babel cold-load TTI (6–8s on 4G mobile) drives new-user bounce — structural, not fixable without a build step. Third: DO 1GB RAM ceiling if alert polling and weather polling overlap during a spike. None are launch blockers at <10 MAU. Confirm VPS up before the Reddit post — that's the only actionable pre-launch infrastructure item.
