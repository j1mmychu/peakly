# DevOps Report — 2026-09-16 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 36, hard deadline Sep 20 in 4 days. No new P0s. No regressions. Stamp current (no code shipped since Sep 14 — correct). Braces balanced.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## What Changed Since Yesterday (Sep 15)

- **0 code commits today** — only daily reports (`b9a5435`, `c179056`, `76953c8`). No app.jsx/sw.js/index.html changes.
- **Cache stamp `20260914a`**: correct for zero code days. Stamp only needs updating when code ships. Not stale.
- **Braces**: 5682/5682 ✅
- **No new security findings.**
- **VPS deadline: 4 days out (Sep 20).** PM v151 set this as a hard gate. Flight fares are broken on the live app right now.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,237** |
| app.jsx bytes | **758,944** (~741 KB unminified) |
| Braces balanced | ✅ 5682/5682 |
| PEAKLY_BUILD | `20260914a` (no code shipped since — correct) |
| sw.js CACHE_NAME | `peakly-20260914a` ✅ |
| index.html ?v= | `20260914a` ✅ |
| Stamp lockstep | ✅ all three match |
| Plausible analytics | ✅ `index.html:32` — present, active |
| Sentry DSN | ✅ wired in both `index.html:77` and `app.jsx:8` |
| Venue count (eval) | **404** (134 skiing / 270 beach) |
| lateSeason venues | **15** (grep-confirmed) |
| BASE_PRICES entries | **182** — all venue airports covered (Open #22 CLOSED) |

---

## 2. Flight Proxy — ⚠️ P1 STILL OPEN

| Check | Result |
|-------|--------|
| FLIGHT_PROXY URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| TP token in client | ❌ none — server-side only ✅ |
| Timeout/fallback | ✅ AbortController present |
| VPS last confirmed healthy | 2026-08-11 post-redeploy |
| proxy.js undeployed days | **Day 36** |

### P1: Two proxy.js commits committed but NOT on VPS — deadline Sep 20 (4 days)

| Commit | Date | Fix |
|--------|------|-----|
| `3152c96` | Sep 9 | ±1-day fallback when no exact-Friday fare hit |
| `c760dfb` | Sep 10 | ±3-day / 2–7 night widening; client guard updated to match |

**Impact right now**: virtually zero LIVE fare badges on the app. Users see `~$X` estimates everywhere. The deal-score headline feature is dead until deployed.

**The exact deploy command Jack runs via SSH (same as every prior report):**

```bash
# From local machine — run these two lines:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && pm2 save"

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: uptime resets, apns:configured (or unconfigured — either is fine)
```

Note: VPS is NOT a git clone — `git pull` there fails. Manual scp every time.

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| forecast_days (weather) | **14** — full two-weekend window ✅ |
| forecast_days (marine) | **10** ✅ |
| Batch fetch cadence | 50/2s — within Open-Meteo free tier ✅ |
| Weather localStorage cache | 2hr TTL ✅ |
| Direct Open-Meteo fallback | ✅ — app degrades gracefully if proxy is down |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| TP auth token in client | ❌ none ✅ — server-side only |
| TP affiliate marker (710303) | ✅ in client — this is the public link marker, NOT the auth token |
| Supabase anon key in client | ✅ intentional — documented public-safe, RLS-gated |
| .gitignore | ✅ covers `.env`, `*.p8`, `*.key`, `*.pem`, `*.p12` |
| Recent commits for secrets | ✅ clean — only report files since Sep 10 |
| Sentry DSN | ✅ wired (`app.jsx:8`, `index.html:77`) |

**No security regressions. No new findings.**

Clarification for the record: `TP_MARKER = "710303"` at `app.jsx:6667` is the Travelpayouts *affiliate marker* — it appears in public Aviasales deeplinks by design and earns the $0.14/MAU commission. The Travelpayouts API *auth token* lives on the VPS in the server environment and has never appeared in any client file. This is correct.

---

## 5. Performance Analysis

| Component | Load size (est.) |
|-----------|-----------------|
| React 18.3.1 UMD (prod) | ~42 KB gzip |
| ReactDOM 18.3.1 UMD (prod) | ~130 KB gzip |
| Babel Standalone 7.24.7 | **~2.1 MB minified** (dev path only) |
| Plus Jakarta Sans (4 weights) | ~20 KB gzip |
| Sentry | ~28 KB gzip |
| app.jsx unminified | ~741 KB raw / ~190 KB gzip est. |
| Supabase JS (lazy) | ~80 KB gzip when needed |

**Production path is fine.** `deploy.yml` runs `node scripts/build-web.mjs` on every push → esbuild pre-compiles `app.jsx → dist/app.min.js` (~439 KB minified), Babel is stripped from the served bundle entirely. The 2.1 MB Babel hit only occurs when opening `index.html` directly for local dev.

**Biggest performance bottleneck**: the 406-venue × (weather + optional marine) fetch storm on first load. Each venue fires Open-Meteo requests batched at 50/2s. For 404 venues that's ~16 batches = ~32 seconds of sequential fetching. The VPS proxy's in-memory cache + in-flight deduplication fixes this for concurrent users (N users = 1 upstream call per unique coord) — but only once the proxy is deployed.

**Images**: `loading="lazy"` confirmed at all card render sites (`app.jsx:7682`, `7870`, `7953`, `10052`, etc.) ✅

**CDN versions (index.html)**:
- React 18.3.1 / ReactDOM 18.3.1 — current stable ✅
- Babel 7.24.7 — current stable ✅ (dev only)

---

## 6. Cost Estimate

| Scale | DigitalOcean 1GB | GitHub Pages | Open-Meteo | Total/mo |
|-------|------------------|--------------|------------|----------|
| Now (<100 MAU) | $6 | $0 | $0 | **$6** |
| 1K MAU | $6 | $0 | $0 | **$6** |
| 10K MAU | $12 (2GB) | $0 | ~$0* | **$12** |
| 100K MAU | $48 (4GB×2 + LB) | $0 | ~$20 | **~$68** |

*Open-Meteo free tier: 10K calls/day. At 100K MAU the VPS cache is doing all the work — cold-cache scenarios post-restart are the only real exposure.

**Single biggest cost risk at scale**: VPS in-memory weather cache (`_wxCache`) gets wiped on every `pm2 restart`. A traffic spike immediately post-restart (Reddit/HN post) hits Open-Meteo directly for all venues. Disk-persist the cache (Open #23, ~30-line fix in proxy.js, same SSH session as #19 deploy) to eliminate this.

---

## 7. What Breaks First at Scale

The bottleneck is the VPS. With the cache warm, it can handle thousands of concurrent weather requests by serving in-memory responses. But the VPS is $6/month with 1 GB RAM — a sustained 10K concurrent session surge won't kill it (most responses are cache hits), but a cache-cold restart into a Reddit spike will blow through Open-Meteo's free tier in under 90 seconds (404 venues × 1 call each = 404 cold calls; free tier is ~7 calls/second sustained = 404/7 ≈ 58 seconds to refill, then you're rate-limited). Add disk persistence (Open #23) before any public announcement.

---

## Open Issues (Priority Order)

### P1 — Fix before Sep 20

**VPS proxy.js undeployed (Day 36)**
- Two commits (`3152c96`, `c760dfb`) fix flight fare fallback logic
- Live app shows zero LIVE fares without this
- Jack SSH deploy: `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && ssh root@198.199.80.21 "pm2 restart peakly-proxy"`
- Bundle with Open #23 (disk cache) — same session, same restart, ~30 extra lines

### P2 — Cleanup

**dist/ files tracked in git (Day 7)**

`git ls-files dist/` returns 5 tracked files inside `dist/`: `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`, `sw.js`. The `.gitignore` says `dist/`, but files committed before that entry was added remain tracked. The build script regenerates them at deploy time, so this doesn't break anything — but it means stale dist/ copies live in git alongside updated root-level sources, and a `git status` that says "clean" masks any drift.

Fix (run once locally, commit):
```bash
git rm --cached dist/index.html dist/manifest.json dist/robots.txt dist/sitemap.xml dist/sw.js
git commit -m "chore: untrack dist/ files — generated by deploy.yml build step"
git push origin main
```
The deploy.yml build step regenerates all of these at publish time, so removing them from git tracking is safe.

---

## Closed Since Last Report

- **Cache stamp stale (P1 from Sep 14)** — CLOSED. Sep 14 commit `96def81` bumped it to `20260914a`. Zero code commits since → stamp is correct, not stale.
- **BASE_PRICES coverage (Open #22)** — CLOSED (confirmed Sep 14). 182 entries covering all 165+ unique venue airports.

---

## Items NOT Checked (sandbox egress limits)

- VPS `/health` live call — blocked by sandbox. Proxy health unverified; last known good: 2026-08-11.
- Live site smoke test — blocked. Check `/tmp/peakly-smoke.log` after next local session.
