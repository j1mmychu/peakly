# DevOps Report — 2026-10-03 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 55. Oct 4 deadline = TOMORROW. Oct 18 beach launch = 15 days. Zero code commits to app.jsx/sw.js/index.html (code freeze Day 19 = GOOD). `origin/master` footgun Day 11 still live. All application code GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** |
| VENUES (authoritative eval count) | **404 total — 134 skiing / 270 beach** ✅ |
| lateSeason:true venues | **15 confirmed** ✅ |
| Plausible analytics | ✅ present, uncommented (index.html:32) |
| React 18.3.1 (cdnjs) | ✅ current |
| Babel Standalone 7.24.7 (cdnjs) | ✅ dev-only; production CI drops it |
| Sentry DSN | ✅ configured (index.html:77 + app.jsx:7-8) |
| PEAKLY_BUILD / CACHE_NAME stamp | ⚠️ `"20260914a"` — Day 19 frozen. Expected during code freeze; auto-bumps on next app.jsx commit |
| All API calls HTTPS | ✅ no bare HTTP or hardcoded IPs in client |
| Secrets in client | ✅ no critical secrets (see §4) |
| Image lazy loading | ✅ all 9 `<img>` tags carry `loading="lazy"` |
| Fetch timeouts | ✅ AbortController + 4s timeout on proxy/Open-Meteo and flight calls |

**Zero code commits to app.jsx/sw.js/index.html in 19 days.** Code freeze clean. Last ship: 2026-09-14.

---

## 2. Flight Proxy Status — 🔴 RED (undeployed Day 55)

FLIGHT_PROXY points to `https://peakly-api.duckdns.org` (HTTPS ✅). The committed `server/proxy.js` fixes are correct and ready. **They have not been copied to `/opt/peakly-proxy` and pm2 has not been restarted.** This is Day 55 since the fix was committed (2026-08-11).

**What's broken right now:**
1. Two-weekend scoring (second-week forecast) — returns null for all venues, front page only shows week 1
2. iOS native CORS block — `capacitor://localhost` not in allowed origins
3. Alert deletion silently fails — `DELETE` missing from `Access-Control-Allow-Methods`
4. Rate limiter reads first X-Forwarded-For entry — trivially spoofable; anyone can balloon `_rateMap` and effectively DOS a user
5. Weather cache wiped on every pm2 restart (disk persistence not deployed)

**Oct 4 is tomorrow. The 4 deploy commands:**

```bash
# SSH to VPS
ssh root@198.199.80.21

# Copy updated proxy (NOT a git clone — direct copy required)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# On the VPS:
cd /opt/peakly-proxy && npm install  # only if package.json changed; it didn't
pm2 restart peakly-proxy

# Verify (from anywhere with network):
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected `/health` response after deploy:
```json
{
  "status": "ok",
  "uptime": 0,
  "wx_cache_size": 0,
  "wx_disk_cache_loaded": true,
  "apns": "unconfigured",
  "forecast_days": 14
}
```

**If `forecast_days` is 14 and `wx_disk_cache_loaded` is true — deploy succeeded.** If pm2 fails to start, check `pm2 logs peakly-proxy --lines 50`.

**Weather cache warm-up risk (flagged by PM v168):** After deploy, `_wxCache` is cold. If the first traffic spike hits before the cache refills (each venue takes ~1–2s to fill), Open-Meteo free-tier rate ceiling (~66 concurrent requests to the same cold endpoint) is in reach. The disk cache in the new proxy.js mitigates a restart, but the initial cold state after deploy is real. **Mitigation:** run the warm-up manually 30 minutes before any planned traffic event:

```bash
# From VPS — force-prefetch the top 20 venues by lat/lon
# (paste venue coords from app.jsx VENUES array)
curl -s "https://peakly-api.duckdns.org/api/weather?lat=50.116&lon=122.949&days=14" > /dev/null
# Repeat for top ski + beach venues in parallel
# Or: hit the /api/alerts endpoint which triggers a full scoring pass
```

**Time to fix: 10 minutes on the next SSH session. This is the only P0.**

---

## 3. Weather & External API — ✅ GREEN

- Open-Meteo: free tier limit is ~10,000 req/day. At 404 venues × 2 calls (weather + marine beach-only) = ~808 cold-cache requests per full sweep. With 2hr localStorage TTL per-client and VPS shared cache (once deployed), effective upstream calls scale sub-linearly. **No rate-limit risk below ~12 MAU with VPS deployed.**
- Marine API: only called for beach venues (`needsMarine = category === "beach"`) — 270 calls max per cold sweep. Correct.
- All fetches have AbortController timeouts. Fallback to `score=50` on weather failure. Cold-start reviewer-proof (confirmed via previous smoke test).

---

## 4. Security Audit — ✅ GREEN (one accepted-risk item)

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present. `TP_MARKER="710303"` is the public affiliate marker (not a secret). Token is server-side only. |
| Supabase ANON_KEY in client | ⚠️ **Accepted risk.** `eyJhbGc...` key at app.jsx:26 is the public anon key, intentional per Supabase architecture (RLS-gated). Not a secret. |
| `.env` files committed | ✅ None found. `.gitignore` covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`. |
| Sentry DSN in client | ✅ Expected — public DSN, Sentry's architecture. |
| APNS `.p8` key | ✅ Not committed. `.gitignore` covers `*.p8`. |
| Recent commits for secret leaks | ✅ Last 20 commits are report files only. No code changes since 09-14. |
| `GEAR_ITEMS` | ✅ 0 occurrences. Amazon correctly cut. |
| No SRI on CDN scripts | ⚠️ P3 — Babel 7.24.7, React 18.3.1 loaded without `integrity=` hashes. Low risk (cdnjs is trusted, CDN hijack would require MITM), but easy to add post-launch. |

**No P0 security issues.** The Supabase anon key in client code is the only standing concern and it's intentional by design (RLS gates all data access; the key is meaningless without a valid auth session for write ops).

---

## 5. Performance Analysis — 🟡 YELLOW

| Metric | Value |
|--------|-------|
| app.jsx raw | 759 KB |
| Babel parse wall (dev mode) | ~3–5s on mobile (production build eliminates this) |
| Production bundle (dist/app.min.js) | Not built locally; CI builds via esbuild on every push to main/master |
| React 18.3.1 UMD | ~150 KB gzipped |
| Babel Standalone (dev only) | ~900 KB — stripped in production |
| Total production JS estimate | ~430 KB minified (759 KB raw × ~0.57 esbuild minification ratio) |
| Image lazy loading | ✅ all `<img>` tags |
| Largest bottleneck | **759 KB single-file JSX + 404 hardcoded VENUES** — parsing cost scales linearly with venues |

**Single largest bottleneck:** The VENUES array is now 404 entries. At the current growth rate (avg ~18 venues/batch), 500+ venues is 3–4 months away. The esbuild production build handles this fine. The dev-mode Babel parse wall scales with file size; it's already ~3–5s on mobile — acceptable for dev, irrelevant for users (prod build is used on GitHub Pages).

**CDN dependency versions:**
- React 18.3.1 → latest stable is 18.3.1 ✅
- Babel Standalone 7.24.7 → current is 7.25.x. Dev-only, not critical. Update if Babel parse errors appear.

---

## 6. Cost Estimate

| Scale | Infra cost/month | Notes |
|-------|------------------|-------|
| 0–1K MAU | **$6** | DO droplet only. Open-Meteo free tier covers this. |
| 1K–10K MAU | **$6–$12** | VPS upgrade to 2GB RAM ($12) if wx cache grows beyond 4K entries. GitHub Pages free. |
| 10K–100K MAU | **$30–$80** | Add $24/mo DO managed DB (if alerts/sync moves off Supabase free), $6–12 for VPS. Supabase free tier (50K MAU) covers 10K easily. |
| 100K MAU | **$80–$200** | Supabase Pro ($25/mo), VPS upgrade, CDN caching may be needed. |

**Cost optimization opportunities:**
1. Supabase free tier (50K MAU) covers the entire pre-monetization phase. No action needed.
2. Open-Meteo free tier caps at ~10K req/day — VPS shared cache (once deployed) defers this cliff to ~100+ MAU.
3. GitHub Pages hosts the frontend for free indefinitely. No change needed.
4. DigitalOcean $6 droplet is correctly sized for current load.

---

## 7. Stale Remote Branches — ⚠️ P2 (Day 11)

**15 `origin/claude/*` branches** are accumulating in the remote. These are unmerged exploratory agent branches, none of which have been merged to main:

```
origin/claude/analyze-test-coverage-WVIsT
origin/claude/code-review-cleanup-HjoCS
origin/claude/condense-alert-page-jzdLo
origin/claude/enhance-loading-screen-rZ1dc
origin/claude/fix-app-jsx-content
origin/claude/implement-todo-lNL7W
origin/claude/improve-peakly-ui-UHCHG
origin/claude/improve-scoring-system-XYGY6
origin/claude/product-reliability-assessment-w0poL
origin/claude/redesign-front-page-EndKs
origin/claude/review-peakly-ux-UQ0Qu
origin/claude/simplify-alerts-page-2ejGB
origin/claude/simplify-profile-page-Bi2Tc
origin/claude/standardize-venue-data-CufiQ
origin/claude/streamline-onboarding-account-97XRR
```

Plus `origin/fix-appjsx-final`, `origin/restore-appjsx`, `origin/test-small` — likely stale experiments.

**To delete all stale claude/* branches (run locally after reviewing each):**
```bash
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

Low priority during code freeze. Do after Oct 4 deploy.

---

## 8. `origin/master` Footgun — 🔴 RED (Day 11)

`origin/master` is **511 commits behind `origin/main`** (frozen at June 2026). `deploy.yml` deploys on push to BOTH `main` AND `master`. A mistaken `git push origin master` will deploy the June build — stripping 3.5 months of changes including the 46-venue expansion (404 vs ~358), all scoring improvements, and the onboarding overhaul — to production, silently.

**Fix (2 minutes):**
```bash
# Option A: Delete master remote branch (recommended — main is canonical)
git push origin --delete master

# Option B: Keep master but remove it from deploy.yml triggers (edit line 6-7)
# on:
#   push:
#     branches:
#       - main
#       # master removed
```

**This is a footgun that resets the live site to June if triggered.** No urgency during code freeze, but do this in the same SSH session as the Oct 4 VPS deploy.

---

## What Breaks First at Scale

**Open-Meteo is the rate-limit cliff.** The current architecture makes one upstream call per (venue, coordinate) pair on cold cache. With 404 venues, a full cold sweep is ~540 upstream calls (404 weather + 270 marine × partial overlap). Open-Meteo's free tier allows ~10,000 req/day, which means ~18 full cold sweeps per day. At 100 MAU with different home airports (cache misses distributed across venues), you hit this ceiling in under 3 hours. **The VPS shared cache (once deployed) drops this to ~1 upstream call per coordinate per 2 hours regardless of concurrent users — that's the fix, and it's already written.** If the Reddit/HN post lands before the VPS deploy, 500 simultaneous users will each independently cold-call Open-Meteo, exhaust the free tier within 10 minutes, and every user will see "conditions unavailable." The prevention is one SSH session and 10 minutes.

---

## Issue Summary

| # | Severity | Issue | Days Open | Fix Time |
|---|----------|-------|-----------|----------|
| P0 | 🔴 | VPS proxy.js not deployed | 55 | 10 min SSH |
| P1 | 🟡 | `origin/master` footgun (deploys stale June build) | 11 | 2 min |
| P2 | 🟡 | 15+ stale `claude/*` remote branches | 11 | 5 min cleanup |
| P3 | ⚪ | No SRI on CDN script tags | ongoing | 30 min post-launch |
| ✅ | - | Code freeze clean (Day 19) | — | — |
| ✅ | - | All secrets properly handled | — | — |
| ✅ | - | 404 venues correct (134 ski / 270 beach) | — | — |
