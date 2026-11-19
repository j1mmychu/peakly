# DevOps Report — 2026-11-19 (RED)

**Status: 🔴 RED — VPS Day 103. Cache stamp 19 days stale (no code change). App Review MISSED +6 days. Whistler opens in 2 DAYS (Nov 21) — the window that triggered the App Review push is now here. `master` footgun Day 43. `fix-appjsx-final` rollback bomb Day 20 (597 commits ahead of main). 19 stale remote branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 18)

| Item | Nov 18 | Nov 19 (today) |
|------|--------|----------------|
| VPS status | Day 102 | 🚨 **Day 103 — still undeployed** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (18d) | 🚨 **`20261031a` — 19 days stale** |
| App Review hard stop | MISSED +4 days | 🚨 **MISSED +6 days — Whistler opens in 2 days (Nov 21)** |
| `fix-appjsx-final` | Rollback bomb Day 19 | **Day 20 — 597 commits ahead of main** |
| `master` footgun | Day 42 | **Day 43** |
| New app.jsx commits | 0 (28d) | **0 — 19 days no code commits (last: 2026-10-31)** |
| Venue count (combined grep) | 404 ✅ | ✅ **404 (195 quoted + 209 unquoted)** |
| `.venue-baseline` | 404 | ✅ **404** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason (grep) | 15 | ✅ **15 (5 unquoted + 10 JSON-quoted)** |
| Remote branches | 19 stale | **19 stale — no change** |
| Plausible analytics | ✅ | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ in app.jsx | ⚠️ same — `710303` affiliate marker only, not a secret |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |
| Image lazy loading | ✅ 9/9 | ✅ 9/9 `<img>` tags use `loading="lazy"` |
| .gitignore | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |

**New this run:** 15 `claude/*` branches + 1 `cursor/*` branch appeared in git fetch — these are old worktrees (May–June 2026 by their commit timestamps), not new work. Confirmed stale. Count stays at 19 non-main/master branches.

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). +0 lines since Oct 31 — code freeze holding. No app.jsx commits in 19 days.

**Cache stamp:** `20261031a` — **19 days stale.** No action needed unless a push lands. Auto-push.sh will auto-bump when Jack pushes anything. No drift in the mechanism.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — CI strips it in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`)
- Sentry → sentry-cdn.com ✅ (DSN live)

**Production build:** `deploy.yml` calls `node scripts/build-web.mjs` → esbuild compiles `app.jsx → dist/app.min.js` (~440 KB minified, Babel stripped). Braces balanced 5684/5684 ✅. Venue count 404 ✅.

---

## 2. FLIGHT PROXY STATUS

**Proxy URL:** `https://peakly-api.duckdns.org` — HTTPS ✅. No old HTTP IP in app.jsx ✅.

**VPS deploy status: 🚨 DAY 103 UNDEPLOYED.**
- Last confirmed healthy: 2026-08-11 (103 days ago, Jack SSH post-redeploy)
- `server/proxy.js` changes committed but NOT on VPS
- Impact while undeployed: two-weekend scoring off, iOS native blocked (CORS), alert deletion broken, rate limiter forgeable

**Fix (Jack, SSH, ~10 min):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
# verify: forecast_days:14, uptime <60s
```

**fetchTravelpayoutsPrice:** 8s timeout with fallback ✅. Trip-length sanity check (`duffelTripDays` 2–7 days) active ✅.

---

## 3. WEATHER & EXTERNAL API

**Open-Meteo usage:** Direct from client (proxy undeployed). Each venue fetches `api.open-meteo.com/v1/forecast` individually, batched 50 per 2s. 404 venues = ~8–9 batches = ~16–18 seconds total to load full grid. Rate limit: Open-Meteo free tier allows ~600 req/min. 404 venues batched at 25/s = well within ceiling for single-user, but 24+ concurrent users hitting uncached routes simultaneously could approach the limit. **This is the proxy deploy's whole point — still undeployed at Day 103.**

**Marine API:** Fetched for beach venues only (270 venues). `marine-api.open-meteo.com/v1/marine`. Same batching logic.

---

## 4. SECURITY AUDIT

**Exposed secrets: NONE.** All clear.

| Item | Status |
|------|--------|
| Travelpayouts API token | ✅ server-side only (`server/proxy.js`), not in `app.jsx` |
| Supabase anon key | ✅ in `app.jsx` per design — public-safe, RLS-gated, JWT expiry 2093-05-10 |
| TP_MARKER `710303` | ⚠️ in `app.jsx` (affiliate marker ID only, not a secret — acceptable) |
| Sentry DSN | ✅ live, in `app.jsx` per design (public client key) |
| .env files | ✅ `.gitignore` covers `.env`, `.env.*`, `.p8`, `.pem`, `.key`, `.p12` |
| Recent commit scan | ✅ last 10 commits: report files only, no code/secrets |
| APNS `.p8` key | ✅ gitignored, never committed |

---

## 5. PERFORMANCE ANALYSIS

**JavaScript payload (production):**
| Asset | Size |
|-------|------|
| `dist/app.min.js` (esbuild, Babel stripped) | ~440 KB |
| React 18.3.1 (cdnjs) | ~149 KB gzipped |
| ReactDOM 18.3.1 (cdnjs) | ~43 KB gzipped |
| Supabase JS (lazy-loaded) | ~80 KB gzipped |
| **Total initial load** | **~632 KB** |

**Babel Standalone (dev only):** ~380 KB — stripped in production build ✅.

**Largest bottleneck:** 404-venue batch weather fetch on first load (16–18s to fill the grid). Users see skeleton cards immediately (React renders with estimate prices), but conditions/scores don't appear until batches resolve. VPS weather proxy would cache-deduplicate this to ~1 upstream call per venue per 2 hours.

**Image lazy loading:** 9/9 `<img>` tags use `loading="lazy"` ✅.

**CDN dependency versions:** React 18.3.1, ReactDOM 18.3.1, Babel 7.24.7 — these are the same versions used since the production build landed in June 2026. React 18.3.1 is current in the 18.x line. No upgrade needed.

---

## 6. COST ESTIMATE

| MAU | Infrastructure | Monthly |
|-----|---------------|---------|
| Current (<100) | DO $6/mo + GitHub Pages $0 | **$6/mo** |
| 1K MAU | Same (Open-Meteo free tier handles it) | **$6/mo** |
| 10K MAU | Upgrade DO to $12/mo droplet (2GB RAM), Open-Meteo paid if >600 req/min peaks | **$18–30/mo** |
| 100K MAU | DO $24/mo (4GB) + Open-Meteo paid plan ~$79/mo + CDN ($5–10/mo) | **$108–113/mo** |

**Cost optimization available now:** VPS weather proxy deploy (Day 103 pending) would collapse Open-Meteo calls from N×venues per active user to ~1 per venue per 2 hours. At 1K MAU this is the difference between hitting rate limits and never approaching them.

---

## P0 — Fix Today

### P0-A: Whistler Opens in 2 Days (Nov 21) — App Review Window Is NOW
**App Review was MISSED +6 days.** The entire CLAUDE.md launch context (App Review submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e`, Guideline 2.1) is now 6 days past when PM flagged it as critical. If the goal was to have the app live in the App Store for Whistler's opening, the window closes Friday. This is not a DevOps fix — this is Jack submitting the response to Apple's Guideline 2.1 information request. See `docs/APP_REVIEW_NOTES.md`. **Nothing DevOps does unblocks this.**

### P0-B: VPS Day 103 — Deploy server/proxy.js
Same fix as every day for 103 days. See Section 2 above. 10 minutes of SSH work. The two-weekend scoring feature has been dark for 103 days.

```bash
# From local machine (not sandbox — sandbox has no git egress):
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq '{uptime:.uptime,forecast_days:.forecast_days,apns:.apns}'
```

---

## P1 — Fix This Week

### P1-A: `fix-appjsx-final` Branch — 597 Commits Ahead of Main, Day 20
This branch contains 597 commits that main does NOT have. It's a diverged rollback target. If Jack or any agent accidentally checks this out and pushes to main, it clobbers 50 commits of work. 

```bash
# Confirm it's safe to delete (verify last commit doesn't have anything useful):
git log --oneline origin/fix-appjsx-final | head -5
# If it's safe (old worktree artifact), delete it:
git push origin --delete fix-appjsx-final
```

### P1-B: `master` Branch — Day 43 Footgun
`master` branch exists on origin. Any push to `master` triggers `deploy.yml` (it's in the `on.push.branches` list), deploying whatever's on `master` to GitHub Pages. If `master` diverges from `main`, the wrong build goes live silently.

```bash
# Option A: Delete master (safest if main is canonical):
git push origin --delete master
# Then remove it from deploy.yml branches list too.

# Option B: Keep in sync with main via deploy.yml (already triggers on both):
# Just make sure master == main at all times.
```

### P1-C: 19 Stale Remote Branches — Cleanup
15 `claude/*` + `cursor/*` + `restore-appjsx` + `test-small`. All confirmed stale (oldest: May 2026). No unmerged work.

```bash
# Mass delete (verify list first):
git branch -r | grep -E "origin/(claude/|cursor/|restore-|test-small)" | sed 's|origin/||' | xargs -I{} git push origin --delete {}
```

---

## P2 — Fix This Sprint

### P2-A: Supabase Delete-Account SQL Still Pending
`server/sql/delete-account.sql` has never been pasted into Supabase SQL editor. App Store Guideline 5.1.1(v) requires account deletion. The client shows a graceful fallback message until this runs. **Jack manual action** — open Supabase dashboard, SQL editor, paste + run.

### P2-B: BASE_PRICES Coverage 43% — Deal Score Degraded
100 of 146 venue airports missing from `BASE_PRICES`. Venues without a base price show `~$X` estimates derived from fallback averages. The deal score headline feature is weakest where venue inventory is highest (beach resorts: CUN, BOB, AUA, STT, SXM all missing).

---

## What Breaks First at Scale

**Open-Meteo rate limiting.** At ~25 concurrent users all loading the Explore grid simultaneously (a Reddit/HN spike), the app fires 404 × 2 (weather + marine) = 808 upstream API calls within seconds. Open-Meteo's free tier ceiling is ~600 req/min. That's a throttle at ~15 simultaneous users, manifesting as a 20–40% of users seeing "conditions unavailable" on the first meaningful spike. The VPS weather proxy (committed to `server/proxy.js` on 2026-05-04, undeployed for 103 days) collapses that to 1 upstream call per venue per 2 hours regardless of how many users hit it. Without the proxy deploy, every Reddit post is a timed race between traffic arrival and Open-Meteo throttle. The fix is 10 minutes of SSH work that has been deferred for 103 days.
