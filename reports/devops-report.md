# Peakly DevOps Report — 2026-06-14

**Status: 🟡 YELLOW**

Code is clean. No P0s. Cache stamp is 1 day old — correct behavior (auto-push only bumps on code edits, and the June 13 evening commits were minor). One undocumented scoring weight change spotted (`DEAL_WEIGHT` 0.5 → 0.25, no algorithm critique in git history). VPS can't be verified from this network-blocked sandbox — it's been 4 days since last confirmed-healthy check.

No fixes shipped this run — state is healthy enough that write-side risk outweighs marginal benefit.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | 13,129 lines / 659KB raw (~165KB gzip est.) |
| Cache stamp | `20260613n` — 1 day old. Lockstep: `app.jsx` / `sw.js` / `index.html` all match ✅ |
| Stamp logic | Correct — auto-push only bumps on app-bearing edits. June 13 had 14 suffixed builds (`a`→`n`); June 14 so far 0 new code changes |
| Plausible analytics | Present, uncommented, deferred ✅ |
| Sentry DSN | Configured in `index.html:77` (deferred) and `app.jsx:7` ✅ |
| GEAR_ITEMS | `grep -c GEAR_ITEMS app.jsx` → **0** — Amazon cut holds ✅ |
| Venues | **358** (161 compact-format + 197 pretty-format) — verified via dual-regex count ✅ |
| OG / JSON-LD venue count | `350+` — updated June 13 ✅ |
| Brace balance | 5,531 open / 5,531 close — balanced ✅ |
| Stale remote branches | None found (`git branch -r` shows only main) ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live ✅ |
| Image lazy loading | All `<img>` tags carry `loading="lazy"` ✅ |
| Leaflet | Lazy-loaded via `ensureLeaflet()` — removed from `index.html` eager scripts ✅ |
| Sentry in `index.html` | Deferred (`defer` attr) ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|---|---|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Proxy timeout | 5s `AbortController` per request ✅ |
| Retry logic | 3 attempts with 1.2s / 2.4s backoff on 429 / 5xx ✅ |
| Fallback | Returns `null` → venue shows `~$—` gracefully ✅ |
| Travelpayouts token | Server-side only — not in any client file ✅ |
| Live check | ❌ **Cannot verify from sandbox** (egress blocks duckdns) |

**Last confirmed healthy:** 2026-06-10 evening (Jack SSH'd in post-reboot per CLAUDE.md).

**4 days unverified.** If the VPS went down overnight, all venue cards show `~$—` for prices and weather cache is cold. Run this now:

```bash
ssh root@198.199.80.21 'pm2 status && curl -s http://localhost:3001/health | python3 -m json.tool'
```

If `pm2` shows `peakly-proxy` stopped:

```bash
ssh root@198.199.80.21 'cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save'
```

Time: 5 minutes. Zero cost.

---

## 3. Weather & External API

| Check | Result |
|---|---|
| Open-Meteo client | `fetchWeather` / `fetchMarine` — try VPS proxy first (4s timeout), fall back to direct ✅ |
| Rate limit exposure | Direct Open-Meteo throttles at ~66 concurrent DAU on same venue set |
| localStorage cache | 2hr TTL; marine only fetched for beach venues ✅ |
| Batch rate-limiting | 50 fetches / 2s; 358 venues takes ~15s on cold cache ✅ |

---

## 4. Security Audit

**No hard credentials in client code.**

| Check | Result |
|---|---|
| Travelpayouts token | ✅ Server-side only |
| Supabase ANON_KEY | ⚠️ `app.jsx:26` — by design. Supabase anon keys are public-safe and RLS-gated. Correct pattern. |
| `.gitignore` | ✅ Covers `.env`, `.pem`, `.p8`, `.key`, `*.pdf`, business docs |
| Git history secrets scan | ✅ No secret files committed |
| SRI on React / ReactDOM | ❌ Missing — supply chain risk (see P2 below) |
| SRI on Supabase JS | ❌ Missing |
| SRI on Babel Standalone | ❌ Missing — moot (Babel's `eval()` negates SRI protection anyway) |
| Leaflet | ✅ Has SRI hashes |
| CSP | ❌ None — Babel's `unsafe-eval` makes a strict policy impossible |

---

## 5. Undocumented Scoring Change — Flag for Review

**`DEAL_WEIGHT` is 0.25 in code. CLAUDE.md documents it as 0.5.**

Current code (`app.jsx:5587`):
```js
const DEAL_WEIGHT = 0.25;
const fuse = (cond) => Math.round(clamp(cond * (1 - DEAL_WEIGHT) + priceNorm * DEAL_WEIGHT, 0, 100) * confMult);
```

This weights: `conditions × 0.75 + price × 0.25`. The June 13 `n` commit updated the `ScoreBreakdown` comment from "0.5 + 0.5" to "0.75 + 0.25" to match the code — but the CLAUDE.md system docs still describe the 50/50 split as the documented decision (2026-05-04 shipping note: *"`DEAL_WEIGHT = 0.5` constant — future profile slider can wire to it"*).

**No algorithm critique was written** (CLAUDE.md: *"Do NOT modify scoring without an algorithm critique"*). The weight change slipped in via auto-push with no paper trail.

**Effect:** 0.25 price weight means flight pricing barely moves the needle. A venue with great conditions + expensive flights vs great conditions + cheap flights differs by ~25pts maximum instead of ~50pts. The cheap-flight advantage that was intentionally added on 2026-05-04 is now halved.

**Fix — Jack decides, then document:**
```js
// Option A: restore 50/50 (documented decision)
const DEAL_WEIGHT = 0.50;

// Option B: keep 75/25 (current code) — document in CLAUDE.md and update scoreWeekendDeal comment
```

Either way, update CLAUDE.md's scoring section to match the code and commit a note in `CHANGELOG.md`.

---

## 6. CDN Dependency Versions

| Library | Pinned | SRI |
|---------|--------|-----|
| React 18.3.1 | ✅ Current | ❌ |
| ReactDOM 18.3.1 | ✅ Current | ❌ |
| Supabase JS 2.106.2 | ✅ Current | ❌ |
| Babel Standalone 7.29.7 | ✅ Current | ❌ (moot) |
| Leaflet 1.9.4 | ✅ Current | ✅ |

---

## 7. Performance Analysis

**Estimated cold-load payload:**

| Asset | Raw | Gzipped est. |
|-------|-----|-------------|
| app.jsx | 659KB | ~165KB |
| Babel Standalone 7.29.7 | ~420KB | ~220KB |
| ReactDOM 18.3.1 | ~176KB | ~130KB |
| React 18.3.1 | ~46KB | ~45KB |
| Supabase JS 2.106.2 | ~80KB | ~80KB |
| Fonts (Plus Jakarta Sans 4 weights) | — | ~30KB |
| **Total** | **~1.4MB raw** | **~670KB gzip** |

Leaflet (~45KB) is now off the critical path — lazy-loaded only when the map opens. That's a meaningful win from the June 13 refactor.

**Primary bottleneck:** Babel Standalone parsing 659KB JSX at runtime. Uncached load: ~200ms CPU modern desktop, ~800–1500ms mid-tier Android. No fix without a build step. Acceptable for v1.

**Secondary bottleneck:** 358 cold-cache weather fetches (50/2s batched). First-time user waits ~15s for the grid to fully populate. VPS weather cache cuts this to <1s for hot venues — which is why verifying pm2 is running matters.

---

## 8. Cost Estimate

| Scale | Monthly | Notes |
|-------|---------|-------|
| <1K MAU | **$6** | DigitalOcean 1GB only. All other tiers free. |
| 10K MAU | **$32** | DO ($6) + Open-Meteo starter (~$25/mo) — free tier caps around 66 concurrent DAU |
| 100K MAU | **$243** | DO 2GB ($12) + Open-Meteo pro (~$200) + Supabase Pro ($25) |

**Biggest cost lever:** VPS weather cache. One 2hr-cached response per venue vs N×358 direct Open-Meteo calls. Delays commercial-tier entry by 10-50×. Already deployed — just needs to stay running.

---

## Open Items

| Priority | Item | Owner | Status |
|---|---|---|---|
| **P1** | Verify VPS — `ssh root@198.199.80.21 'pm2 status'` | **Jack** | ⚠️ Open **4 days** |
| **P1** | Document `DEAL_WEIGHT` decision (0.25 vs 0.50) in CLAUDE.md | **Jack** | New finding |
| P2 | Add SRI hashes to React, ReactDOM, Supabase CDN tags | DevOps | ~20 min |
| P2 | Paste `server/sql/delete-account.sql` into Supabase SQL editor | **Jack** | Pre-App Store |
| Parked | CSP (Babel `unsafe-eval` makes strict policy impossible) | — | Post-launch |
| ✅ | GEAR_ITEMS cut holds | — | Confirmed |
| ✅ | Leaflet lazy-loaded off critical path | — | Fixed June 13 |
| ✅ | Stale `claude/*` remote branches | — | Cleaned |
| ✅ | `150+` → `350+` venue count in OG/JSON-LD | — | Fixed June 13 |

---

## P2 Fix: SRI Hashes (~20 min on a machine with internet)

```bash
# Generate hashes
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<HASH>" crossorigin="anonymous"` to each `<script>` tag in `index.html`. Skip Babel — SRI on it is moot since Babel uses `eval()` internally which would fail the SRI check on content rewriting. Leaflet already has it working as a proof point.

---

## What Breaks First at Scale

The VPS Node.js process is the first domino. At a Reddit/HN spike, if pm2 is down, every user's `fetchWeather` falls through to direct Open-Meteo in parallel. At 67 concurrent unique-venue requests, the free tier 429s. The cascade: 429 → scores degrade to estimate → carousel collapses to fallback → degraded product exactly when the spike matters most.

**Prevention ladder:**
1. **Before any Reddit/HN post (now, 5 min, $0):** SSH in, verify pm2.
2. **At 1K MAU (2hr, $6/mo):** Add Redis to VPS — weather cache survives restarts.
3. **At 10K MAU (30 min, $0):** Cloudflare free tier in front of GitHub Pages — edge cache + DDoS shield.
4. **At 100K MAU ($243/mo):** Open-Meteo commercial, Supabase Pro, DO 2GB upgrade.
