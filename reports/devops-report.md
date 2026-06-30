# Peakly DevOps Report — 2026-06-30

**Status: 🟢 GREEN — LAUNCH DAY**

Today is Monday June 30 — the Reddit launch window PM v72 called out. Code is structurally clean: 370 venues, braces 5,565/5,565, GEAR_ITEMS 0, Sentry active, Plausible wired, proxy HTTPS-only. Cache stamp is `20260629a` (1 day lag — normal, auto-bumps on next code touch). No new regressions since yesterday. One manual action blocks the post: **Jack must confirm VPS health from a networked machine before posting to Reddit** — the sandbox can't reach `peakly-api.duckdns.org`, so this run can't verify the proxy is up.

---

## Fixes Shipped This Run

None — verification pass only. No regressions found. Cache stamp lag is normal and will self-correct on next `app.jsx` edit.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 657 KB raw** |
| `PEAKLY_BUILD` stamp | `20260629a` — 1 day lag (expected; auto-bumps on next code edit) |
| Three-file lockstep | `app.jsx:17` / `sw.js:2` / `index.html:395` — all `20260629a` ✅ |
| Brace balance | **5,565 / 5,565 — BALANCED** ✅ |
| Plausible analytics | Line 32: `defer data-domain="j1mmychu.github.io"` — present ✅ |
| Sentry DSN | `app.jsx:7-8` — active DSN (`9416b032a4…@o4511108649058304.ingest.us.sentry.io`) ✅ |
| GEAR_ITEMS refs | `grep -c GEAR_ITEMS app.jsx` → **0** — Amazon cut holds ✅ |
| Venue count | **370** (173 compact + 197 quoted-key format; eval-counted) ✅ |
| Supabase in index.html | **Not present** — lazy-load contract intact (`app.jsx:56-75` `ensureSupabase()`) ✅ |
| Babel PRECACHE | `sw.js:3-5` — Babel CDN URL in PRECACHE → cached after first visit ✅ |

**Cache stamp lag note:** `20260629a` was written yesterday. The auto-push script (`scripts/auto-push.sh:45-86`) only bumps the stamp when `app.jsx`, `sw.js`, or `index.html` changes. Report-only runs leave it untouched. First code edit today will advance it to `20260630a` automatically. No user-facing impact — assets are already cached with `20260629a` keys; the lag doesn't cause stale loads.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL (`app.jsx:5929`) | `https://peakly-api.duckdns.org` — HTTPS only ✅ |
| Bare HTTP IP (104.131.82.242) | Not present in client code ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000 ms `AbortController` (`app.jsx:5963-5973`) ✅ |
| Weather proxy timeout | 4 s `AbortController` in `_tryProxyWx` (`app.jsx:5167-5182`) with direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | `TP_MARKER = "710303"` — tracking affiliate marker only, NOT the API token; token is server-side only ✅ |
| Live VPS health | **UNVERIFIABLE FROM SANDBOX** — container egress blocks duckdns. Last confirmed healthy: June 13 (uptime 3.2d at that check, since rebooted June 10). |

**⚠️ LAUNCH-DAY ACTION — Jack before posting:**
```bash
curl https://peakly-api.duckdns.org/health
# Must return: {"status":"ok","wx_cache_size":N,...}  (N > 0 = cache warm)
# If wx_cache_size: 0 — normal after reboot, traffic warms it; proceed.
# If 000 / 502 / timeout — VPS is down. SSH to 198.199.80.21, run: pm2 restart peakly-proxy
```

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` — correct ✅ |
| Proxy-first with fallback | `_tryProxyWx()` tries proxy (4s timeout), falls back to direct Open-Meteo ✅ |
| Batch strategy | 50 venues per batch, 2s throttle between batches ✅ |
| Free-tier ceiling | 370 venues × ~2 calls = ~740 upstream calls per cold-load user. Direct free tier ≈ 10,000 calls/day → **breaks at ~13 simultaneous fresh-load users without proxy cache warm.** Reddit spike = instant breach. VPS weather cache (2hr LRU, shared across all users) collapses this to 1 upstream call per venue per 2 hours. |
| lazy-loaded images | 9 `loading="lazy"` attributes in `app.jsx` — venue cards and detail-sheet images covered ✅ |

**Reddit spike math:** If Reddit/HN sends 500 users in the first hour, all hitting the same 370 venues, the VPS cache means ≤370 upstream Open-Meteo calls (not 185,000). Cache warm = survived. Cache cold (first hit per venue per 2hr window) = still fine, Open-Meteo gets ~370 calls, well under 10K/day. The risk is only if the VPS itself is down and all 500 users hit Open-Meteo direct simultaneously — that's the scenario that kills the free tier in ~7 minutes.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token | **Not in client code.** `TP_MARKER = "710303"` is the affiliate tracking tag only ✅ |
| Supabase anon key | Present (`app.jsx:26`) — expected. Anon key is public-safe by design; all access is RLS-gated on the Supabase side. This is not a leak ✅ |
| Sentry DSN | Present (`app.jsx:8`) — expected. DSN is a write-only ingest endpoint; not a secret ✅ |
| Other secrets/tokens | `grep -n "sk_\|secret\|password\|api_key"` → no plaintext secrets found ✅ |
| `.gitignore` | Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `.mobileprovision`, PDF/PPTX business docs ✅ |
| Recent commits for leaks | `git log -5 -p -- app.jsx \| grep "^\+" \| grep -i "token\|secret"` → nothing sensitive ✅ |
| SRI on CDN scripts | **Still absent** — React, ReactDOM, Babel, Sentry have no `integrity=` hash. Open #10. Known, in `reports/known-skipped.md`. Not re-flagging. |
| CSP meta | **Still absent.** Open #10. Not re-flagging. |

---

## 5. Performance Analysis

**Critical-path bundle (wire bytes, gzipped estimates):**

| Asset | Size (gzipped est.) | Blocking? |
|-------|---------------------|-----------|
| Sentry SDK | ~20 KB | `defer` — non-blocking ✅ |
| React 18.3.1 | ~11 KB | `crossorigin` inline — blocking |
| ReactDOM 18.3.1 | ~42 KB | `crossorigin` inline — blocking |
| **Babel standalone 7.29.7** | **~282 KB** | **Blocking — preloaded but still parses before app renders** |
| app.jsx (Babel-transpiled) | ~180–200 KB | Deferred but parsed by Babel |
| Supabase JS UMD 2.106.2 | ~80 KB | Lazy (on-demand only) ✅ |
| **Total critical path** | **~535 KB** | |

**Single largest performance bottleneck: Babel standalone (~282 KB gzipped).** The entire JSX-in-browser transpilation model means every user downloads and runs the compiler before a single React component renders. On a 4G connection (10 Mbps): ~450ms just to transfer Babel, plus parse time (~200ms on mid-range mobile). The PRECACHE in `sw.js` now caches the Babel CDN URL, so **repeat visitors pay 0ms** — this is the correct mitigation given the no-build constraint. First-time visitors on slow connections will feel a 600-800ms delay before first meaningful paint.

**No action required for launch.** PRECACHE is the right structural fix for a no-build SPA. First-load Babel latency is an inherent constraint of the architecture, not a bug.

CDN versions:
- React: 18.3.1 — current stable ✅
- Babel standalone: 7.29.7 — current ✅ (was 7.24.7 per original CLAUDE.md; already upgraded)

---

## 6. Cost Estimate

| Scale | GitHub Pages | DigitalOcean VPS | Open-Meteo | **Total/month** |
|-------|-------------|------------------|------------|-----------------|
| Today (<10 MAU) | $0 | $6 | $0 (free) | **$6** |
| 1K MAU | $0 | $6 | $0 (free, VPS cache shields) | **$6** |
| 10K MAU | $0 | $6–12 (RAM pressure, consider 2GB) | $0 (VPS cache still holds) | **$6–12** |
| 100K MAU | $0 | $24–48 (multiple droplets or $24/4GB) | $0–50 (Open-Meteo may require paid plan) | **$24–100** |

**Optimization opportunities:**
- **Nothing to do at <1K MAU.** $6/month is irreducible for the current architecture.
- **At 10K MAU:** Upgrade DO droplet from 1GB → 2GB ($12/mo) before VPS OOM-kills the pm2 process under concurrent weather cache load.
- **At 100K MAU:** Open-Meteo's free tier (10K calls/day) will be breached if cache TTL expires during a traffic surge. Option A: Open-Meteo Plus plan (~$40/mo at commercial tier). Option B: Add a Redis-backed persistent cache to the VPS so the 2hr LRU survives restarts and is shared across multiple DO droplets.

---

## 7. What Breaks First at Scale

**The first thing that breaks is the Open-Meteo direct-fallback path during a VPS outage at Reddit-spike load.** Here's the failure chain: (1) VPS goes down for any reason during peak traffic. (2) Client `_tryProxyWx()` times out after 4 seconds and falls back to direct Open-Meteo. (3) 500 simultaneous users each hit Open-Meteo directly for 370 venues = 185,000 API calls in under a minute. (4) Open-Meteo rate-limits or bans the IP. (5) Every user's Explore tab silently shows `weatherDown` banners and venues score 50 across the board. (6) Bounce rate spikes.

**Prevention (post-Reddit, pre-HN):**
1. Set up UptimeRobot (free) on `https://peakly-api.duckdns.org/health` — alerts Jack via SMS in <2 minutes if VPS dies. Single manual action, ~5 minutes. In `reports/known-skipped.md` but critical before any major traffic event.
2. Point a second DO droplet at the same proxy code as cold-standby (requires work — defer to 1K MAU).
3. Consider caching venue weather in Supabase (KV or jsonb) as a 6-hour backup source that survives VPS loss — architectural change, defer to v2.

---

## P-Ranked Issues

### P0 — Launch Blockers
*None.* Code is clean. Architecture is sound.

### P1 — This Week (Post-Reddit)
**Manual pre-post action (Jack, ~2 min):**
```bash
# From your local machine or phone hotspot — NOT the sandbox:
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
# Confirm: "status":"ok", wx_cache_size is any integer
```
If this returns 502/timeout, the VPS is down. Before posting:
```bash
ssh root@198.199.80.21
pm2 status          # check peakly-proxy is "online"
pm2 restart peakly-proxy   # if not
```

**UptimeRobot monitor (Jack, ~5 min):**
Sign up at uptimerobot.com → New Monitor → HTTP → `https://peakly-api.duckdns.org/health` → Alert contact: SMS/email. Free tier checks every 5 minutes. This is the difference between knowing the VPS died in 5 minutes vs. finding out from a Reddit comment 4 hours later.

### P2 — This Sprint
- **Open-Meteo paid plan research:** At 10K+ MAU, understand the commercial terms. Don't get rate-banned without a migration path.
- **Supabase `delete_user()` SQL paste:** `server/sql/delete-account.sql` still needs to be pasted into the Supabase SQL editor once for App Store 5.1.1(v) compliance (App Store submit path only — web launch unaffected).

### P3 — Known / Won't Fix Before Launch
- SRI on CDN scripts: in `known-skipped.md`. Architecture constraint.
- CSP meta: in `known-skipped.md`. Babel `unsafe-eval` makes strict CSP break the app.
- APNS: gated out on iOS, in `known-skipped.md`.
- Triple-commit noise: cosmetic, in `known-skipped.md`.
- Unsplash `&auto=format&q=75`: in `known-skipped.md`.

---

## Baseline (for tomorrow's diff)

| Metric | Value |
|--------|-------|
| `app.jsx` lines | 13,443 |
| `app.jsx` bytes | 673,126 |
| PEAKLY_BUILD | `20260629a` |
| Brace balance | 5,565 / 5,565 |
| Venue count | 370 (173 compact + 197 quoted-key) |
| GEAR_ITEMS refs | 0 |
| lateSeason venues | 25 |
| Lazy-loaded images | 9 |
| CDN: React | 18.3.1 |
| CDN: Babel | 7.29.7 |
| CDN: Supabase | 2.106.2 (lazy) |
| Sentry | Active |
| Plausible | Active |
