# DevOps Report — 2026-09-22 (RED)

**Status: 🔴 RED — VPS proxy.js undeployed Day 44. Oct 18 launch is 26 days away. Two-weekend scoring dead, iOS native blocked, alert deletion silently broken. No code regressions. Cache stamp `20260914a` correct (day 8 of code freeze). Braces balanced 5682/5682. VENUES 404 confirmed (134 skiing / 270 beach). 19 stale remote branches (one new: `origin/master` added since yesterday). BASE_PRICES gap remains at 155/165 missing airports (93.9%).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health is unverified from this environment — do not infer status from this report.

---

## What Changed Since Yesterday (Sep 21)

Zero code commits to `app.jsx`, `sw.js`, or `index.html`. Three report commits only (PM v157, Content Sep 21, DevOps Sep 21). Repository is structurally identical to yesterday. VPS deadline passed Sep 20. Branch cleanup deadline passed Sep 20. Oct 18 launch confirmed by PM v157.

---

## 1. Live Site Health — ✅ GREEN (code side only)

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI/dist/) | ~439 KB minified (esbuild, Babel stripped per deploy.yml) | ✅ |
| Cache stamp | `20260914a` — 8 days old, CORRECT for code freeze | ✅ |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ |
| Brace balance | 5682 open / 5682 close — BALANCED | ✅ |
| VENUES | 404 (134 skiing / 270 beach) — confirmed via bracket eval | ✅ |
| `lateSeason: true` | 15 venues — matches CLAUDE.md | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| React version | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Sentry DSN | Configured: `9416b032...` in app.jsx + `index.html` script tag | ✅ |
| Images lazy-loaded | Yes — `loading="lazy"` on all `<img>` render sites | ✅ |
| FLIGHT_PROXY | `https://peakly-api.duckdns.org` (HTTPS) | ✅ |

**index.html cache-buster consistency:** `app.jsx?v=20260914a` — matches `PEAKLY_BUILD`. On code freeze this is intentional. Auto-push.sh will bump it on the next code change.

---

## 2. P0 — VPS Redeploy: Day 44, Launch 26 Days Out

The Sep 20 PM-set hard deadline passed 4 days ago. This is now a launch blocker with a hard date. Oct 18 is 26 days away. The VPS has not been touched since Aug 11.

**Every feature below has been broken since Aug 11:**

| Feature | Broken How | User Impact |
|---------|-----------|-------------|
| Two-weekend scoring | `forecast_days=7` → second Fri-Mon window always "low confidence", filtered off front page | Users only see 1 weekend instead of 2 |
| iOS native proxy | `capacitor://localhost` absent from CORS → 403 on every proxy call | iOS app completely unable to fetch pricing/weather via proxy |
| Alert deletion | `DELETE` blocked by CORS preflight, `.catch(()=>{})` hides it | Users cannot delete alerts — they stack forever |
| Weather cache persistence | In-memory only → `pm2 restart` wipes it | Post-redeploy cold start hits Open-Meteo directly for all 404 venues at once |
| Rate limiter accuracy | XFF `[0]` instead of `.pop()` → forgeble by anyone | Rate map manipulation, potential Open-Meteo ban during a traffic spike |

**The fix is ONE SSH session. Everything is committed in `server/proxy.js`.**

```bash
# On Jack's machine — copy the committed fix to VPS:
scp ~/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH in:
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# Verify (run from VPS or your local machine):
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

**Expected /health after redeploy:**
```json
{
  "status": "ok",
  "uptime_seconds": < 120,
  "wx_cache_size": 0,
  "apns": "unconfigured"
}
```

**Post-deploy smoke checklist:**
- `uptime_seconds` < 120 → restart landed
- `wx_cache_size` = 0 → fresh start (will refill on traffic, that's correct)
- `curl "https://peakly-api.duckdns.org/api/weather?lat=51.5&lon=-0.1"` → returns 14-day forecast, not 7
- iOS: preflight to `/api/alerts` → 204 (no body), CORS headers present

---

## 3. P1 — 19 Stale Remote Branches (4 Days Past Deadline)

PM v155 set Sep 20 as the branch cleanup deadline. It passed. We now have **19 stale branches** — one more than yesterday (`origin/master` is now visible, which is the legacy push target alongside `origin/main`; `deploy.yml` handles both, so master itself isn't an outage risk, but it's noise).

**All 19 stale branches:**
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
origin/fix-appjsx-final
origin/master        ← legacy push target, not a bug but adds noise
origin/restore-appjsx
origin/test-small
```

These are not a production risk but they're dead weight in the repo and every new DevOps run has to list them. Confirm none are unmerged work you need, then:

```bash
# Delete all 15 claude/* branches + 3 one-offs in one shot:
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
# Leave origin/master — deploy.yml depends on it, deleting is not zero-risk
```

Time: 2 minutes. Do it once before Oct 18.

---

## 4. Security Audit — ✅ GREEN (expected public values only)

| Item | Finding | Status |
|------|---------|--------|
| Travelpayouts server token | NOT in any client file — proxy-only | ✅ |
| `TP_MARKER = "710303"` | **Public affiliate marker** — goes into booking deep-link URLs visible to the browser. This is expected and by design; it's not a secret. | ✅ |
| `SUPABASE_ANON_KEY` | Public-safe by design — RLS-gated, documented in CLAUDE.md. Row access requires `auth.uid()` match. | ✅ |
| `SUPABASE_URL` | Public, expected | ✅ |
| `.env` files | None in repo, `.gitignore` covers `*.env`, `.env.*`, `*.pem`, `*.p8`, `*.key` | ✅ |
| Sentry DSN | Present in `index.html` script CDN URL (public CDN load, acceptable) and `app.jsx` init — standard pattern | ✅ |
| Recent commits | Last 10 commits are report-only — no code, no secret risk | ✅ |
| APNS `.p8` key | Not committed (`.gitignore` covers `*.p8`) | ✅ |

No security regressions. Clean.

---

## 5. Performance Analysis

**Bundle sizes (production path, via deploy.yml esbuild):**

| Asset | Size | Notes |
|-------|------|-------|
| `app.min.js` | ~439 KB minified | Pre-compiled by CI, Babel stripped |
| React 18.3.1 (cdnjs) | ~42 KB gzipped | Cached after first load |
| ReactDOM 18.3.1 (cdnjs) | ~130 KB gzipped | Cached after first load |
| Babel Standalone 7.24.7 | **0 KB** (stripped in prod) | Dev-only |
| Supabase JS | ~80 KB gzipped | Lazy-loaded only when needed |

**Total cold-load payload (production):** ~439 KB JS + ~172 KB React CDN = ~611 KB. Reasonable.

**Biggest performance bottleneck: weather fetch fan-out on cold start.**

404 venues × 2 API calls each (weather + marine for beach) = up to 808 Open-Meteo calls per cold session. The proxy cache absorbs most of this when the VPS is warm, but:

1. **VPS is undeployed** → clients are hitting Open-Meteo directly right now
2. `BATCH_SIZE = 100` with `THROTTLE_MS = 500` means 4 batches of 100 parallel fetches each, 500ms apart
3. 100 simultaneous Open-Meteo requests per batch is aggressive. Open-Meteo free tier is 10K/day — a single user on a cold cache consumes ~808 calls; 13 concurrent cold-cache users exhaust the daily quota

After VPS redeploy, the shared 2hr cache means the actual upstream cost drops to near zero for warm traffic. **This is only dangerous during the VPS-down period**, which is right now.

**Image lazy-loading:** 100% — `loading="lazy"` confirmed on all `<img>` render sites. No regression.

**CDN versions:**
- React 18.3.1 — current stable ✅
- Babel 7.24.7 — dev-only (stripped in prod) — acceptably current ✅

---

## 6. BASE_PRICES Coverage — Still 93.9% Missing (P2, Pre-Launch)

This has been P2 for months. With Oct 18 approaching it needs a deadline.

**Numbers:**
- Total unique venue destination airports: **165**
- BASE_PRICES covers: **15** (JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, DFW, LAS, PHX, MSP, DTW, YVR)
- Missing: **155 airports (93.9%)**

The 155 missing airports include high-volume destinations: CUN (Cancún), HNL (Honolulu), DPS (Bali), KOA (Kona), NRT (Tokyo), OGG (Maui), SJD (Los Cabos), PVR (Puerto Vallarta), ZRH (Zurich), GVA (Geneva), CDG/NCE (France ski), PPT (Tahiti), BOB (Bora Bora), LIH (Kauai).

For 93.9% of venue airports, `getDealScore()` has no typical-price baseline. The deal badge becomes meaningless for most non-US-origin venues.

**Fix target: top 15 missing airports by venue count.** ~2hr task. Needs flight price research (Google Flights roundtrip from JFK as the baseline, then scale by the distance ratios already in BASE_PRICES).

Top candidates by venue count in the missing set: `DPS`, `HNL`, `CUN`, `NRT`, `KOA`, `OGG`, `ZRH`, `GVA`, `NCE`, `SJD`, `MBJ`, `SJU`, `PVR`, `PPT`, `AKL`.

---

## 7. Cost Estimate

| Scale | Infrastructure | Notes |
|-------|---------------|-------|
| Current (~0 MAU) | $6/mo (DigitalOcean 1GB droplet) | VPS only; GitHub Pages is free |
| 1K MAU | ~$6/mo | VPS handles it; Open-Meteo free tier fine with proxy cache |
| 10K MAU | ~$12–18/mo | May need 2GB droplet ($12) + possible Open-Meteo paid tier if proxy cache has cold-start gaps |
| 100K MAU | ~$50–80/mo | 4GB droplet ($24) + Open-Meteo Commercial (~$29/mo) + possible CDN for app.min.js |

**Cost risk:** Open-Meteo free tier at 10K MAU without a warm VPS cache = guaranteed quota breach during any traffic spike (Reddit/HN post). **VPS redeploy is the only thing preventing a $0 → $29/mo forced upgrade on the first traffic spike.**

---

## 8. What Breaks First at Scale

The single most fragile point is the weather fetch fan-out hitting Open-Meteo directly while the VPS is undeployed. Right now, any traffic spike — a Reddit post, a Hacker News mention, a viral tweet — will burn through Open-Meteo's 10K/day free tier in under an hour at 13+ concurrent cold-cache users (404 venues × 2 calls = 808 per session). Once throttled, every user sees "conditions unavailable" and the weatherDown banner. The fix is deployed in `server/proxy.js` but inert. Second fragile point: after VPS redeploy, the weather cache is in-memory only. A `pm2 restart` wipes it, forcing a cold spike immediately post-deploy. The disk-persistence fix is also committed in `server/proxy.js` — same deploy closes both. One SSH session.

---

## Summary — Actions Required Before Oct 18

| Priority | Action | Owner | Deadline | ETA |
|----------|--------|-------|----------|-----|
| P0 | **VPS redeploy** (`scp proxy.js` + `pm2 restart`) | Jack (SSH) | Now (44 days overdue) | 15 min |
| P1 | Delete 18 stale remote branches | Jack | Before Oct 5 content run | 2 min |
| P2 | Backfill BASE_PRICES top 15 airports | Jack or agent | Before Oct 18 | 2 hr |
| P3 | Supabase delete-account SQL paste | Jack | Before App Store submit | 5 min |

No code regressions. No security issues. The codebase is healthy. The only things broken are infrastructure (P0) and data coverage (P2). Both have committed fixes waiting.
