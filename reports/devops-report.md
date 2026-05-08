# Peakly DevOps Report — 2026-05-08

**Overall Status: 🔴 RED**

One P0 that should have been caught days ago: 6 days of shipped work (50+ commits) is stranded in unreachable dangling objects — not on `main`, not deployed, not on any branch. The live site is running 2026-05-02 code while CLAUDE.md confidently marks a dozen features as "DONE."

---

## Fixes Applied This Run

None. The P0 is a git recovery operation that requires Jack to confirm before execution — wrong direction, and we trash a week of work. Commands are below, ready to copy-paste.

---

## P0: REPO DIVERGENCE — 6 Days of Work Not Deployed

**Discovery:** `git log --all --format="%H %ai %s" | grep "2026-05-0[3-9]"` returns nothing on any branch. `git fsck --lost-found` surfaces dangling commits. The chain rooted at `d19a7549` contains every feature CLAUDE.md marks as shipped since 2026-05-03.

**What origin/main (live site) is missing:**

| Feature | Dangling commit | Impact |
|---------|----------------|--------|
| Surf→beach pivot (kill 77 surfing venues) | `bb56aaf` | Live site still has surfing venues — brand contradiction |
| WHEN_OPTIONS stripped to 3 options | in chain | "In 2 weeks" / "Next month" still render — dishonest scoring |
| lateSeason flags on 7 ski venues | in chain | Late-season ski resorts wrongly capped |
| scoreWeekend / scoreWeekendDeal unified | in chain | Front-page deal score broken on live |
| Travelpayouts weekend-specific pricing | in chain | Prices are month-cheapest, not Fri–Mon |
| Open-Meteo server-side proxy cache | in chain | No Reddit-spike protection |
| Cloud sync (Supabase magic-link) | `ab692d3` | Sync UI shown in CLAUDE.md, not in live code |
| Share-a-list viral loop | `d8560a1` | Not live |
| ScoreBreakdown "Why this score?" | in chain | Not live |
| Default ≤6hr flight filter | `d9cfb2e` | Not live |
| Filter-aware empty state | in chain | Not live |
| Push alert APNS wiring (server) | in chain | Not live |
| Cache bust peakly-20260507e | in chain | sw.js still `peakly-20260502` (6 days stale) |

**Confirmed:** `git show bb56aaf --stat` executes cleanly — the commits exist in the object store. They just have no branch reference. The tip is `d19a7549` (`auto: CLAUDE.md`, 2026-05-07 20:04 PDT).

The merge commit `8002131b` ("Merge branch 'main' of github.com:j1mmychu/peakly", 2026-05-07) already incorporated `origin/main` into the dangling branch. No conflict expected.

**Recovery commands — copy-paste in order:**

```bash
# 1. Confirm current state
git log --oneline -3

# 2. Create recovery branch from dangling tip
git checkout -b recover-work d19a7549

# 3. Review what's different (should be ~50 commits)
git log --oneline main..recover-work | head -30

# 4. If it looks right, merge to main
git checkout main
git merge recover-work --no-ff -m "recover: merge 6 days of dangling work (2026-05-03 through 2026-05-07)"

# 5. Push
git push -u origin main

# 6. Clean up
git branch -d recover-work
```

**Time to fix: 10 minutes (5 if the merge is clean).**

Do not skip step 3. Inspect the log before merging. If conflicts appear on `app.jsx`, take the `recover-work` version — that's the more advanced code.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | 7,172 lines / 480,495 bytes |
| CDN scripts | All HTTPS ✅ |
| Plausible analytics | Present, uncommented, correct domain (`j1mmychu.github.io`) ✅ |
| Cache-buster (`index.html`) | `v=20260502a` — **6 days stale** ❌ |
| SW cache name | `peakly-20260502` — **6 days stale** ❌ |
| Sentry DSN | Wired (`9416b032...`), `tracesSampleRate: 0.05` ✅ |

Cache staleness resolves automatically once the P0 recovery lands — the dangling chain bumps to `peakly-20260507e`.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in app.jsx | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| No raw IP exposed in client | Correct ✅ |
| Travelpayouts token in client | Not present ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s AbortController ✅ |
| Retry logic | 3 attempts, 1.2s / 2.4s backoff ✅ |
| Weekend-specific `depart_date` | **Missing in committed code** — month-cheapest only ❌ |
| Proxy weather/marine endpoints | **Missing in committed proxy.js** — no `/api/weather` or `/api/marine` ❌ |

The committed `server/proxy.js` is 349 lines. The CLAUDE.md version (in dangling commits) is significantly larger with weather caching, APNS push, alert polling, and weekend date filtering. None of that is deployed to the VPS.

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo calls | Direct client→Open-Meteo. No server-side cache. ❌ |
| Retry on 429/5xx | Present in `fetchWeather` (3 attempts, exponential) ✅ |
| Client-side cache TTL | 2hr local, 6hr hard evict ✅ |
| Marine fetch gating | `needsMarine` checks `category === "beach"` ✅ |
| Rate limit exposure | 154 venues × N users = N×154 simultaneous upstream calls, no server dedup ❌ |

At 1K concurrent users hitting the explore page cold, that's up to 154K Open-Meteo requests per session batch. Open-Meteo throttles aggressively above ~1K req/min from a single origin. The server-side weather proxy with in-flight dedup exists in the dangling commits — it's already written, just not deployed.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client code | Not present ✅ |
| Supabase anon key in client code | Not present (cloud sync not in committed code) ✅ |
| Sentry DSN in app.jsx | Present — acceptable (DSN is public by design; restrict ingest origins in Sentry dashboard) ✅ |
| `.gitignore` covers `.env` / keys | Yes — `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12` all covered ✅ |
| Recent commits — no secrets | Checked last 30 commits — clean ✅ |
| SRI hashes on CDN scripts | **Missing** — React, ReactDOM, Babel, Sentry loaded without integrity checks ❌ |
| CSP meta tag | **Missing** ❌ |

**SRI gap (P2):** A CDN supply-chain compromise on unpkg.com would silently execute arbitrary JS in every user's browser. Low probability, high impact.

Generate fresh hashes after confirming CDN content:

```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<HASH>"` to each `<script>` tag in index.html.

**CSP note:** Babel standalone requires `unsafe-eval` to transpile JSX. A CSP blocking `unsafe-eval` breaks the app. Set `script-src 'unsafe-eval' 'self' https://unpkg.com https://js.sentry-cdn.com https://plausible.io` at minimum — limits blast radius without breaking Babel.

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Images `loading="lazy"` | All 8 img render sites use it ✅ |
| React version | 18.3.1 (latest major: 19.2.6 — skip, breaking changes) ✅ |
| Babel standalone version | **7.24.7 — outdated** (latest: 7.29.4, 5 patch versions behind) ❌ |

**Estimated JS payload on first load:**

| Asset | Raw | Gzipped (est.) |
|-------|-----|----------------|
| Babel standalone 7.24.7 | ~2.1 MB | ~600 KB |
| ReactDOM 18.3.1 prod | ~440 KB | ~130 KB |
| React 18.3.1 prod | ~140 KB | ~42 KB |
| app.jsx | ~480 KB | ~141 KB |
| **Total** | **~3.2 MB** | **~913 KB** |

**The single largest performance bottleneck is Babel standalone** — 66% of gzipped payload, runs synchronously before React mounts, adds ~300–800ms on a mid-range Android device. Architectural constraint (no build step) prevents removing it. Mitigated by the splash screen but median TTI on 4G mobile is estimated 3–5 seconds.

**Babel upgrade fix (P1):**

```html
<!-- index.html: line ~84 -->
<!-- Before -->
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<!-- After -->
<script src="https://unpkg.com/@babel/standalone@7.29.4/babel.min.js"></script>
```

Also bump `app.jsx?v=20260508a` and `sw.js CACHE_NAME = "peakly-20260508"` when making this change. Do this after the P0 recovery (the dangling chain may already update Babel or the cache key — check before applying).

---

## 6. Cost Estimate

| Tier | Infrastructure | Monthly Cost |
|------|---------------|-------------|
| Current (pre-launch) | DO 1GB + GH Pages | **$6/month** |
| 1K MAU | Same — proxy handles it | **$6/month** |
| 10K MAU | DO 2GB upgrade recommended | **$18/month** |
| 100K MAU | DO 4GB + Cloudflare free tier | **$36/month** |

GitHub Pages is free with no practical MAU cap for a static SPA — not a cost variable.

**What breaks first at scale:**

Open-Meteo direct calls, then proxy in-memory OOM. At 100K MAU, simultaneous cold-cache sessions could fire 15M+ Open-Meteo requests per day. The server-side weather proxy with LRU cache (in dangling commits, not deployed) is the fix.

The rate map in proxy.js (`_rateMap`) has no size cap — it grows unbounded with unique IPs. At 50K+ unique IPs it will OOM the 1GB droplet. Add this circuit breaker to proxy.js:

```javascript
// In rateLimiter(), before setInterval cleanup:
if (_rateMap.size > 50000) _rateMap.clear(); // hard reset instead of OOM
```

**Time to fix: 2 minutes.**

---

## Priority Matrix

| # | Severity | Issue | ETA |
|---|----------|-------|-----|
| 1 | **P0** | 6 days of work in dangling commits — live site is 2026-05-02 code | 10 min |
| 2 | **P1** | Babel 7.24.7 → 7.29.4 + cache bust (after P0) | 5 min |
| 3 | **P1** | Proxy weather/marine endpoints not deployed — no Open-Meteo spike protection | VPS redeploy after P0 |
| 4 | **P1** | Weekend-specific flight pricing not deployed | VPS redeploy after P0 |
| 5 | **P2** | `_rateMap` no size cap in proxy.js — OOM at 50K+ unique IPs | 2 min |
| 6 | **P2** | SRI hashes missing on CDN scripts | 20 min |
| 7 | **P2** | APNS push worker not deployed — Alerts tab promises push, doesn't deliver | VPS redeploy + Apple .p8 |

**VPS redeploy path (for P1 items 3 + 4 + 7 — run after git recovery lands on main):**

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy
```

---

## Bottom Line

The app hasn't deployed anything since May 2. CLAUDE.md's "Recently Fixed" section is a roadmap of undeployed work. Recover the dangling chain first — everything else is downstream of that. Estimated total remediation time after P0 recovery: 30 minutes.
