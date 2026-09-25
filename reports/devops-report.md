# DevOps Report — 2026-09-25 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 47. Oct 18 launch is 23 days away. Two-weekend scoring dead, iOS native blocked, fare-fallback improvements unreachable. Code freeze holds Day 12 — zero regressions. All other systems GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health unverifiable from this environment.

---

## What Changed Since Yesterday (Sep 24)

Zero code commits to `app.jsx`, `sw.js`, or `index.html`. Three daily report commits (PM v160, Content Sep 24, DevOps Sep 24). Structurally identical to yesterday. VPS deadline passed Sep 20 (5 days ago). Stale branch count unchanged at 18. Code freeze Day 12 holding. BASE_PRICES confirmed 100% coverage (2,709 entries vs 165 unique venue airports — 0 missing).

**No new findings. Same P0 from Day 44: VPS proxy.js is not deployed.**

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI/dist/) | ~439 KB minified (esbuild, Babel stripped) | ✅ |
| Cache stamp | `20260914a` — Day 12 of code freeze, correct | ✅ |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ |
| Brace balance | 5682 / 5682 — BALANCED | ✅ |
| VENUES | 404 (134 skiing / 270 beach) — verified via eval | ✅ |
| `lateSeason: true` | 15 venues | ✅ |
| BASE_PRICES coverage | 2,709 entries / 165 unique venue airports — **100% coverage** | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| Sentry DSN | Configured: `9416b032...` in index.html:77 | ✅ |
| React | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Image lazy loading | `loading="lazy"` on all venue image call sites | ✅ |

---

## 2. Flight Proxy Status — ✅ CODE / 🔴 VPS (Day 47)

```
FLIGHT_PROXY = "https://peakly-api.duckdns.org"  ← HTTPS ✅
Timeout: 4000ms AbortController ✅
Fallback: BASE_PRICES estimate on proxy failure ✅
duffelTripDays / duffelWrongLength sanity check ✅ (app.jsx:13620)
buildFlightUrl fallback: +3 days (Fri→Mon) ✅
```

### proxy.js commits undeployed since Aug 11:

| Date | Commit | Change | Impact |
|------|--------|--------|--------|
| Sep 9 | `3152c96` | Fall back to nearest ±1-day weekend RT fare when no exact-Friday hit | **Fare returns for off-peak routes** |
| Sep 10 | `c760dfb` | Widen live-fare fallback to ±3 days / 2–7 nights | **More live fares surface** |

The live VPS still runs the Aug 11 binary. Both Sep fare-fallback fixes are dead. Off-peak routes return nothing.

### Fix — same SSH paste block as every prior report:

```bash
# SSH to VPS and redeploy
ssh root@198.199.80.21

# On VPS:
cd /opt/peakly-proxy
# /opt/peakly-proxy is NOT a git clone — copy files manually:
# From local machine, scp is the fastest path:
# scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health
# Expect: apns:configured, uptime ~seconds
```

**Time to fix: 5 minutes of SSH work.**

---

## 3. Weather & External APIs — ✅ GREEN

```
Open-Meteo weather: forecast_days=14 (app.jsx:5546) ✅
Open-Meteo marine: forecast_days=10 (app.jsx:5590) ✅
Proxy fallback: direct Open-Meteo on 4s timeout ✅
Batching: 50 venues / 2s (rate-limit safe) ✅
2hr localStorage TTL per (lat,lon) ✅
```

Open-Meteo free tier: 10,000 calls/day. At 404 venues, one full cold-cache load = 404 weather + ~270 marine calls = ~674 upstream hits. Safe up to ~14 concurrent cold-cache users per day before hitting ceiling. At Reddit-spike scale, the VPS weather cache (undeployed) is the only protection.

---

## 4. Security Audit — ✅ GREEN (one known P2)

**Travelpayouts token:** `server-side only` via `process.env.TRAVELPAYOUTS_TOKEN` in proxy.js. Not in app.jsx. ✅

**Supabase anon key:** `SUPABASE_ANON_KEY` is hardcoded in app.jsx:26. This is **intentional and safe** — it's a public RLS-gated anon key designed for client-side use. Not a secret. ✅

**TP_MARKER (710303):** In app.jsx:6667 as a public affiliate marker. Not a secret. ✅

**`.gitignore`:** Covers `.env`, `.env.*`, `*.key`, `*.p8`, `*.pem`, `*.p12`, `*.mobileprovision`. ✅

**Git log scan (last 10 commits):** All are daily reports. No credentials introduced. ✅

**P2 — `origin/master` footgun (Day 3):** `origin/master` exists and `deploy.yml` deploys both `main` and `master`. The master branch is at June 2026 state (40-day-old code). If anyone pushes to master, the old code goes live. The fix:

```bash
# Delete origin/master (confirm master HEAD is safe to abandon):
git push origin --delete master
# Or: make master an alias for main via branch protection rules in GitHub settings
```

**Time to fix: 1 minute.** Jack needs to do this — it requires push access to the remote.

---

## 5. Performance Analysis — ✅ GREEN

| Load | Size | Notes |
|------|------|-------|
| React 18.3.1 (prod) | ~42 KB gzipped | cdnjs ✅ |
| ReactDOM 18.3.1 (prod) | ~130 KB gzipped | cdnjs ✅ |
| Babel Standalone 7.24.7 | ~400 KB gzipped | ⚠️ Eliminated in prod build |
| Plus Jakarta Sans | ~15 KB gzipped | Google Fonts ✅ |
| app.jsx (source) | 741 KB → 439 KB minified | Babel stripped in prod ✅ |

**Production load (dist/index.html):** React + ReactDOM + app.min.js ≈ ~611 KB total gzipped. Babel is gone in production — `deploy.yml` runs `build-web.mjs` on every push. The Babel parse wall (3–5s on mobile) is dev-only.

**Single largest bottleneck:** The batched weather fetch on cold-cache load — 404 venues hitting Open-Meteo in 50/2s batches = ~16 seconds total fetch time before all cards score. This is by design; the UI renders with estimate prices immediately. No actionable fix before launch.

---

## 6. Cost Estimate

| MAU | Open-Meteo | DigitalOcean VPS | GitHub Pages | Total/mo |
|-----|------------|------------------|--------------|----------|
| Current (~5) | Free | $6 | Free | **$6** |
| 1K | Free | $6 | Free | **$6** |
| 10K | Free (~14K API calls/day, may need paid) | $6–$12 | Free | **$12–$18** |
| 100K | Paid plan (~$20–50/mo) | $24+ (need caching/CDN) | Free or CDN | **$44–74** |

Open-Meteo free tier is 10K calls/day. At 10K MAU with 20% DAU (2K daily active), each cold-cache user triggers ~674 API calls — that's 1.3M/day, **100× the free limit**. The VPS weather cache (undeployed) drops this to ~2–5 calls/day (shared cache). **This is the pre-traffic gate, and it's not deployed.**

---

## P0 / P1 / P2 Priority List

### P0-1: VPS proxy.js undeployed — Day 47, 23 days to launch

**Broken:** Two-weekend scoring, iOS native proxy access, ±1-day fare fallback, 2–7 night fare matching. The Sep 9 + Sep 10 proxy commits mean live fares dead for any route without exact-Friday Travelpayouts data.

**Impact if not fixed before launch:** Every fare shown is a `~$X` estimate (BASE_PRICES). The "LIVE" badge never fires. The deal score's price component always uses static estimates. Two-weekend scoring is off — the front page only surfaces confidence-level weather for the current weekend.

**Fix:** Copy `server/proxy.js` to VPS + `pm2 restart`. 5 minutes. Jack must SSH.

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

---

### P1-1: Stale branches — 18 remote branches (non-master)

18 `claude/*` + a few experiment branches on `origin`. `deploy.yml` deploys `main` AND `master` — any accidental push to a `claude/` branch that gets merged to master would go live.

```bash
# Preview what would be deleted:
git branch -r | grep -v "HEAD\|origin/main\|origin/master" | sed 's/origin\///'

# Delete all of them:
git branch -r | grep -v "HEAD\|origin/main\|origin/master" | sed 's/origin\///' | xargs -I{} git push origin --delete {}
```

**Time to fix: 2 minutes.**

---

### P2-1: `origin/master` footgun — deploy.yml targets both main + master

`origin/master` is at June 2026 state. `deploy.yml` deploys from both. If master ever gets a push (accidentally or otherwise), 40-day-old code goes live.

```bash
git push origin --delete master
```

**Time to fix: 30 seconds.** Requires Jack's SSH access to GitHub.

---

## Scale Failure Mode

**What breaks first:** The moment Peakly hits Reddit or HN and gets 500 simultaneous users, Open-Meteo will start rate-limiting within minutes. The VPS weather cache is the only thing standing between a viral post and a completely broken app (every card shows "conditions unavailable"). That cache is committed to `server/proxy.js` but has been sitting undeployed since August 11th. At 500 concurrent users, each triggering even one uncached venue fetch, you're at 500 × ~674 = 337,000 Open-Meteo calls in the first minute — **3,370% over the free-tier daily limit in 60 seconds.** The client falls back gracefully (scores estimate, banner shows), so the app doesn't crash, but all conditions data goes dark. Fix: deploy the VPS. That's it. The cache + rate limiting + in-flight dedupe are already coded and tested. They just need to be running.

---

*Report generated: 2026-09-25 | Branch: main | HEAD: e843c21 | Code freeze day 12*
