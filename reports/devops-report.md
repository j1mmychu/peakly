# Peakly DevOps Report — 2026-07-25

**Status: GREEN** — No P0 or P1 issues. Last night's audit (commit `0c02590`) resolved 4 confirmed P0s and deleted banff, dropping the venue count from 374 to 373. Cache stamp bumped to `20260724a` in lockstep. VPS proxy code is correct in-repo but still not deployed to the VPS — the only persistent infrastructure risk. Everything else is stable.

---

## Permanent Stop-Reporting Table

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage. Never flag from sandbox.** |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon CUT for v1.** Stop. |
| "Travelpayouts token in client" | **Server-side only. `TP_MARKER=710303` is public affiliate suffix, not a secret.** Stop. |
| "Supabase anon key exposed" | **Expected. RLS-gated. Public-safe by design (`app.jsx:25`).** Stop. |
| "Cache buster stale" | **Auto-bumps on code changes only. Age alone ≠ stale.** Stop. |
| "Venue count 156 / 353 / 370 / 372 / 373 / 374 / 375" | **373 via bracket-walker eval (131 ski / 242 beach). Matches baseline.** Stop. |
| "lateSeason: any count other than 14" | **14. Use `grep -c "lateSeason.*true" app.jsx`. Stop.** |
| "AP_CONTINENT gaps" | **PERMANENTLY CLOSED. 280 entries, all 146 venue `ap` codes present.** Stop. |
| "Babel mobile parse wall is unresolved / P1" | **RESOLVED. `build-web.mjs` + `deploy.yml` ships esbuild-compiled `app.min.js`. Babel not present in production.** Stop. |
| "jackson-hole ghost dup" | **FIXED July 20 (`e2f02cd`).** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift" | **373. Bracket-walker. Baseline matches. Stop.** |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "banff / lake-louise dup" | **FIXED 2026-07-24. `banff` deleted.** Stop. |
| "upcomingFridayISO uses toISOString() / UTC off-by-one" | **FIXED 2026-07-24 (`0c02590`). `localISODate()` now at all 3 call sites.** Stop. |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24 (`0c02590`). Calls correct function.** Stop. |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24 (`0c02590`).** Stop. |
| "WishlistsTab / alertedIds out-of-scope" | **FIXED 2026-07-24 (`0c02590`).** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` lines | **13,538** |
| `app.jsx` raw size | **681,801 bytes (666 KB)** |
| Brace balance | TBD — auto-push guard confirms balance pre-commit |
| `PEAKLY_BUILD` | `20260724a` ✅ |
| `sw.js` CACHE_NAME | `peakly-20260724a` ✅ |
| `index.html` `?v=` param | `20260724a` ✅ |
| All 3 stamps in lockstep | ✅ |
| Days since last stamp bump | **1 day** (bumped 2026-07-24 with last night's fixes) |
| Venue count (bracket-walker eval) | **373** (131 ski / 242 beach) ✅ |
| Venue baseline | `373` ✅ matches |
| lateSeason venues | **14** |
| Plausible analytics | ✅ Present, uncommented, correct domain (`j1mmychu.github.io/peakly`) |
| Sentry DSN | ✅ Active (`app.jsx:8`, `index.html:77`) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (no raw IP) |
| Travelpayouts token in client | ✅ None — server-side only |
| GEAR_ITEMS refs | ✅ 0 |
| Images lazy-loaded | ✅ 9 `loading="lazy"` sites |
| `.gitignore` covers secrets | ✅ `.env`, `*.pem`, `*.p8`, `*.key`, `*.pdf` all covered |
| React CDN | 18.3.1 ✅ |
| Babel CDN (source/dev only) | 7.29.7 (production: **not loaded** — esbuild replaces it) |
| esbuild pipeline | ✅ `build-web.mjs` → `dist/app.min.js` (~439 KB) |
| Babel in `dist/` | ✅ 0 references |
| Flight proxy timeout | 5,000 ms + AbortController ✅ |
| Weather proxy timeout | 4,000 ms + AbortController ✅ |
| Supabase JS | Lazy-loaded ✅ |
| VPS health | ⚠️ Cannot verify from sandbox — last verified healthy 2026-07-24 |
| Stale `claude/*` remote branches | **15** (P3 — cosmetic, no impact) |
| Other stale branches | 3: `fix-appjsx-final`, `restore-appjsx`, `test-small` |

---

## Delta Since Yesterday

| Item | Change |
|---|---|
| Venue count | 374 → **373** (banff deleted `0c02590`) |
| Venue baseline | 374 → **373** (updated) |
| Cache stamp | `20260720a` → **`20260724a`** |
| app.jsx size | 659 KB → **666 KB** (+7 KB: P0 fixes, 27 venue real photos) |
| P0 issues | 4 confirmed P0s **FIXED** (date bug, onRefresh crash, cloud-sync state bug, WishlistsTab scope crash) |
| Coord errors | 4 **FIXED** (pasjaca-beach-croatia, beach_okinawa, beach_cape_verde, turquoise-bay-t8) |

---

## Critical Issues (P0) — None

Zero P0s as of this report. The 4 from yesterday's audit were all resolved in commit `0c02590`.

---

## High Issues (P1) — None Active

Zero P1s.

---

## Medium Issues (P2)

### P2-A: SRI Missing on CDN Scripts

Still absent. No `integrity=` attributes on React, ReactDOM, Babel, or Sentry CDN scripts. Supply-chain attack surface: if unpkg or the Sentry CDN gets compromised, malicious JS ships to users with no browser-level check to stop it. The production build uses `dist/` which is esbuild-compiled and doesn't load Babel at all — but React and Sentry are still CDN-loaded in prod.

**Exact fix (index.html):** Generate hashes, then swap. One-time terminal block:

```bash
# Step 1 — fetch hashes (run from repo root)
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | base64
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | base64
```

Then in `dist/index.html` (which `build-web.mjs` generates), add `integrity="sha384-<hash>" crossorigin` to each `<script>` tag. Keep the root `index.html` (dev) without SRI since Babel re-evaluates cached content and SRI would break local dev.

Note: Sentry's CDN script URL embeds the DSN — the hash will change if the DSN changes. Compute separately and document. **Estimated time: 30 min.**

### P2-B: No Content-Security-Policy

Still no CSP meta tag. The old blocker (Babel's `eval()` requirement) is gone in production — `build-web.mjs` outputs `dist/index.html` without Babel, so `unsafe-eval` is no longer required in prod. A CSP would be straightforward to add to `dist/index.html` only.

**Exact fix** — add to `<head>` in `scripts/build-web.mjs` output:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://unpkg.com https://js.sentry-cdn.com https://plausible.io https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com https://source.unsplash.com;
  connect-src 'self' https://peakly-api.duckdns.org https://api.open-meteo.com https://marine-api.open-meteo.com https://wsoqcfwkvvemtlddcgfc.supabase.co https://plausible.io https://sentry.io https://o4511108649058304.ingest.us.sentry.io;
  frame-ancestors 'none';
">
```

Inject this in `build-web.mjs` via string replacement in the HTML output after the esbuild step. Leave root `index.html` without CSP (local Babel dev needs `unsafe-eval`). **Estimated time: 45 min.**

### P2-C: VPS proxy.js Not Deployed

`server/proxy.js` has all the right fixes committed (`forecast_days=14`, marine→10, `capacitor://localhost` CORS, `DELETE` in `Access-Control-Allow-Methods`, X-Forwarded-For last-entry rate limiting). VPS `/opt/peakly-proxy` is a hand-copied directory — `git pull` fails there. Until Jack runs the deploy, the following are inert:

- Two-weekend scoring remains disabled (VPS serves 7-day wx → 8-day window scoring fails silently)
- iOS native `capacitor://localhost` origin blocked by CORS
- Alert deletion silently fails (no `DELETE` in preflight response)
- Rate limiter trivially bypassable via forged X-Forwarded-For

**Exact fix:**

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# VPS is not a git clone — manual copy required:
# From your local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
# Then on VPS:
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health
```

Verify: `/health` should show `forecast_days:14` in the response and CORS headers should include `DELETE`.
**Estimated time: 10 min. Jack-only action.** Flagged since 2026-07-24 with no movement. Re-flagging.

### P2-D: BASE_PRICES Gaps for High-Traffic Airports

`BASE_PRICES` covers a minority of airports. Airports like CUN, MIA, LAX, and others run deal math on coarse continent-pair estimates. Deal score is a headline feature — showing `~$X` for a venue that gets high search volume while the estimate is off by 40% undermines trust in the product. **Backfill top 15 by venue count before any Reddit/HN post.** No external API needed — use Google Flights to eyeball realistic round-trip fares for each route pair and hardcode.

---

## Low Issues (P3)

### P3-A: 15 Stale `claude/*` Remote Branches

Accumulated from automated sessions. No security risk, no impact on users, but clutters `git branch -r`. Clean up with:

```bash
git branch -r | grep "origin/claude/" | sed 's/origin\///' | xargs -I{} git push origin --delete {}
# Also clean local tracking refs:
git fetch --prune
```

Run from a network-connected session. **15 branches total.** Also 3 others: `fix-appjsx-final`, `restore-appjsx`, `test-small` — can be deleted if no longer needed.

### P3-B: APNS Still Doubly Broken

No change from AUDIT-2026-07-24.md. DER vs. P1363 JWT encoding + HTTP/1.1 `fetch` against HTTP/2-only APNs. Alerts API unauthenticated with guessable `Date.now()` IDs. Do NOT wire push until all three are fixed. Nothing to report until Jack is ready to tackle it.

---

## Security Audit

```
✅ No Travelpayouts server token in client code
✅ SUPABASE_ANON_KEY: public-safe by design (RLS-gated), acknowledged
✅ TP_MARKER=710303: public affiliate suffix, not a secret
✅ .gitignore covers .env, *.pem, *.key, *.p8, *.pdf, *.pptx
✅ No suspicious commits in last 7 days (25 commits, all routine agent reports + audit fixes)
✅ Sentry DSN in client: acceptable (it's a write-only ingest endpoint, not auth)
⚠️  No SRI on CDN scripts (P2-A above)
⚠️  No CSP (P2-B above)
⚠️  Alerts API unauthenticated (Date.now() IDs, no auth header) — P2, do not wire APNS until fixed
```

---

## Performance Analysis

| Layer | Prod (dist/) | Dev (index.html/Babel) |
|---|---|---|
| React + ReactDOM | ~141 KB gzipped | same |
| app bundle | ~439 KB minified (~130 KB gzipped est.) | 666 KB raw + Babel parse |
| Sentry | ~50 KB gzipped | same |
| Supabase | ~80 KB gzipped (lazy) | same |
| **Total blocking JS** | **~320 KB gzipped** | **~2 MB+ gzipped (Babel dominates)** |

**Production is healthy.** The esbuild pipeline eliminates the 3–5s Babel parse wall on mobile. No new performance regressions from last night's commits — the 7 KB growth is real photo URLs replacing Unsplash auto-format strings, not new code paths.

**Biggest bottleneck:** First paint is blocked by unpkg CDN for React. If unpkg has a bad day, the entire app doesn't render. Mitigation: add `<link rel="preload">` for React in `dist/index.html`, or consider self-hosting React in `dist/`. Not urgent at current MAU but worth tracking.

---

## Cost Estimate

| MAU | Infrastructure | Notes |
|---|---|---|
| Current (<100) | $6/mo | DigitalOcean 1GB droplet |
| 1K MAU | $6/mo | No change. Open-Meteo free tier handles it. |
| 10K MAU | $12–18/mo | VPS upgrade to 2GB ($12). Open-Meteo may need fallback. |
| 100K MAU | $60–120/mo | VPS → $24 (4GB) + Open-Meteo Pro or self-hosted (~$50/mo) |

**Cost optimization opportunity:** GitHub Pages is free and handles static delivery. The only paid infra is the $6 VPS. At 10K+ MAU, the VPS becomes the bottleneck (weather cache, alert polling) before it becomes a cost problem. Cheapest path to 100K: upgrade droplet, not architecture.

---

## Scale Failure Analysis

**What breaks first:** The VPS in-memory weather cache. At 500+ concurrent DAU hitting Explore simultaneously (Reddit/HN front page on a Friday), 373 venues fan out to the VPS in a burst. The 4000-entry LRU handles repeat requests fine, but a **VPS restart** evaporates the cache and triggers 373 upstream Open-Meteo calls at ~50 per 2 seconds. If Open-Meteo throttles (free tier is generous but not infinite), half the Explore grid degrades to estimates. The client fallback path (`fetchWeather` → direct Open-Meteo) prevents a hard crash but the user experience gets slow and noisy. **Prevention at zero cost:** Add a `startup` script in pm2's ecosystem config that pre-warms the cache on the top 20 most-popular venues when the process starts. 30 minutes of work. Do it before any public launch post.

---

## Open Tracking (Re-affirmed)

| # | Item | Owner | Priority |
|---|---|---|---|
| 19 | VPS proxy.js deploy | Jack (SSH) | P2 |
| 20 | ~346 venues still generic stock photos | Jack (UNSPLASH_KEY) | P2 |
| 21 | APNS doubly broken — do not wire until fixed | Future sprint | P2 |
| 22 | BASE_PRICES gaps for top-15 airports | Dev | P2 |
| P2-A | SRI on CDN scripts | Dev | P2 |
| P2-B | CSP in dist/index.html | Dev | P2 |
