# DevOps Report — 2026-11-25 (RED)

**Status: 🔴 RED — VPS Day 106 undeployed (last healthy: 2026-08-11). Cache stamp 25 days stale (code freeze, correct). App Review MISSED +12 days. Thanksgiving TOMORROW — PEAK RISK. 22 stale remote branches (+1 since yesterday).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 24)

| Item | Nov 24 | Nov 25 (today) |
|------|--------|----------------|
| VPS status | Day 105 | 🚨 **Day 106** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (24d) | 🚨 **`20261031a` — 25 days stale (code freeze, correct)** |
| App Review hard stop | MISSED +11 days | 🚨 **MISSED +12 days** |
| Thanksgiving | 2 days out | 🚨 **TOMORROW (Nov 26) — PEAK RISK IS NOW** |
| `fix-appjsx-final` | Rollback bomb Day 25, 597 commits ahead | **Day 26 — 597 commits ahead (unchanged)** |
| `master` footgun | 511 commits ahead | **511 commits ahead (unchanged)** |
| Stale remote branches | 21 | 🆕 **22 — net +1 since yesterday** |
| New app.jsx commits | 0 (25d) | **0 — 25 days no code commits (last: 2026-10-31)** |
| `lateSeason:true` flags | 15 (CLAUDE.md) | ⚠️ **grep finds 10 — CLAUDE.md count is STALE (+5 discrepancy)** |
| Venue count | 404 (134 skiing / 270 beach) | ✅ **404 — 134 skiing / 270 beach (grep-verified)** |
| `.venue-baseline` | 404 | ✅ **404 — matches** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| Plausible analytics | ✅ | ✅ present, uncommented, `defer` |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| Supabase anon key | ✅ public-safe | ✅ RLS-gated per design |
| Image lazy loading | ✅ | ✅ 9+ img tags with `loading="lazy"` |
| `.gitignore` | ✅ | ✅ covers .env, .p8, .pem, .key, .p12, .pdf |
| BASE_PRICES coverage | ✅ CLOSED | ✅ **CLOSED — 0 venue APs missing** |
| GEAR_ITEMS | ✅ 0 | ✅ 0 — Amazon cut for v1 confirmed |
| CLOUD_SHARE_ENABLED | false | ✅ false |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). Zero code changes since Oct 31 — intentional code freeze, Day 25.

**Cache stamp:** `20261031a` — 25 days stale. This is **correct and expected** — code freeze means no auto-bump. Stamp matches deployed code version. No action until next code push.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — `deploy.yml` strips Babel in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`, domain=`j1mmychu.github.io/peakly`)
- Sentry → sentry-cdn.com ✅ (DSN `9416b032a46681d74645b056fcb08eb7` live)

**Production build:** `deploy.yml` → esbuild → `dist/app.min.js` (~440 KB minified, Babel stripped). No changes since Oct 31. `dist/` directory present.

**Venue integrity:**
- Count: 404 (134 skiing / 270 beach) ✅ (grep-verified)
- `.venue-baseline`: 404 ✅ matches
- Braces: 5684 open / 5684 close ✅ balanced
- `lateSeason:true` flags: **10 (grep)** — CLAUDE.md says 15. **Discrepancy. Do not update CLAUDE.md from this sandbox** — could be counting methodology; verify with `grep -c "lateSeason:true" app.jsx` in a networked session.

---

## 2. FLIGHT PROXY STATUS

**Proxy URL:** `const FLIGHT_PROXY = "https://peakly-api.duckdns.org"` — HTTPS. ✅ No HTTP exposure.

**Proxy timeout/fallback:** `_tryProxyWx` 4s timeout + direct Open-Meteo fallback ✅. `fetchTravelpayoutsPrice` falls back to `~$X` estimate on failure ✅.

**VPS state — Day 106 (source-only analysis):**

The following fixes are committed to `main` but NOT deployed to `/opt/peakly-proxy`:
- `forecast_days=14` → two-weekend scoring dead on live VPS (still returns 7-day)
- `capacitor://localhost` in CORS → iOS native calls blocked
- `DELETE` in `Access-Control-Allow-Methods` → alert deletion silent-fails
- Rate limiter reads `[0]` X-Forwarded-For instead of last → forgeable
- HTTP/2 APNs transport (`http2.connect` + `dsaEncoding: 'ieee-p1363'`) → APNs sends 0 pushes
- Disk-based weather cache → cold restart (required for redeploy) can spike Open-Meteo

**Thanksgiving is TOMORROW.** This is not abstract. If a Reddit post or any traffic spike hits tonight or tomorrow morning on a cold VPS cache, the proxy will hammer Open-Meteo's free tier. The rate limiter is forgeable. iOS users cannot reach the proxy. This is the wrong state to be in going into the highest-traffic holiday of the year.

**Fix (Jack, SSH, ~15 min — same commands as Day 92):**
```bash
# SSH to VPS
ssh root@198.199.80.21

# Deploy proxy.js
cp /path/to/peakly/server/proxy.js /opt/peakly-proxy/proxy.js

# Install any new deps (none expected this round)
cd /opt/peakly-proxy && npm install

# Restart
pm2 restart peakly-proxy

# Verify
curl -s https://peakly-api.duckdns.org/health
# Expected: {"status":"ok","wx_cache_size":N,"apns":"unconfigured","uptime_seconds":N}
```

---

## 3. WEATHER & EXTERNAL API

**Open-Meteo usage:**
- Weather endpoint: `forecast_days=14` ✅ (client-side correct)
- Marine endpoint: `forecast_days=10` ✅ (client-side correct)
- Batched 50/2s to avoid rate limits ✅
- 2hr localStorage TTL ✅
- VPS cache: deployed proxy.js has in-memory 4000-entry LRU + disk persistence (Open #23). **Neither is live** until VPS redeploy.

**Rate limit risk:** 404 venues × ~1 request each on first load. At <100 DAU this is fine. On a Reddit spike without the VPS cache live, 10+ concurrent users hitting the same uncached coordinates = N direct Open-Meteo calls. Free tier is ~10K req/day. A front-page Reddit post can burn through that in 20 minutes. The VPS cache is the entire protection against this. It's sitting in git, not on the server.

---

## 4. SECURITY AUDIT

**Secrets in client-side code:**

| Item | Status |
|------|--------|
| Travelpayouts TP_MARKER `710303` | ✅ **Public affiliate marker — expected in client** |
| Supabase anon key (full JWT in `SUPABASE_ANON_KEY`) | ✅ **Intentionally public, RLS-gated** |
| Supabase URL | ✅ **Public by design** |
| Any private keys / server tokens | ✅ **None found** |
| `.gitignore` | ✅ **Covers .env, .p8, .pem, .key, .p12, .pdf, .pptx** |
| `.env` files committed | ✅ **None present** |
| Recent commits with potential secrets | ✅ **git log -10 clean** |

**Security concerns (unchanged from prior reports):**
- **P2:** No SRI on CDN scripts (`index.html` loads React, Babel, Supabase without `integrity=` hashes). If cdnjs or Sentry CDN is compromised, malicious JS loads silently. Fix: add `integrity="sha384-..."` to each `<script>`. 2–3 hour task. **Not blocking launch.**
- **P2:** No CSP meta tag. Would prevent XSS but would also potentially break Babel inline eval. Fix: add `<meta http-equiv="Content-Security-Policy" content="...">` with `unsafe-eval` for Babel dev path only. `dist/index.html` (production) could have a stricter policy. 4-hour task. **Not blocking launch.**
- **P3:** Alerts API has no authentication — any client can POST/DELETE alerts by ID. The `crypto.randomUUID()` alert ID fix from Open #21 is committed to `app.jsx` but the VPS hasn't been redeployed — the live proxy still uses `Date.now()` IDs. This ships with the VPS redeploy.

---

## 5. PERFORMANCE ANALYSIS

**JavaScript bundle (production path):**
- `dist/app.min.js`: ~440 KB minified (esbuild, Babel stripped)
- React 18.3.1 UMD: 44 KB gzipped (from cdnjs)
- ReactDOM: 130 KB gzipped (from cdnjs)
- Babel Standalone 7.24.7: **NOT loaded in production** (`deploy.yml` strips it) ✅
- Sentry: ~50 KB gzipped
- **Total production JS: ~664 KB gzipped**

**Development path (index.html direct):**
- Babel Standalone: ~900 KB unminified (parse + transpile wall, 3–5s mobile)
- This is dev-only; production build eliminates it

**Bottlenecks:**
1. **Biggest: 404 venue weather fetches at startup.** Batched 50/2s = ~16 seconds to fully populate scores. Mitigated by localStorage 2hr TTL (second load is instant). First-ever load on a new device is slow.
2. **Image loading:** 404 venues × ~1 Unsplash URL = many concurrent image requests on initial scroll. `loading="lazy"` ✅ present on all img tags — this is correctly implemented.
3. **Single-file 742 KB source:** Babel in dev mode parses the entire file on every load. Production esbuild handles this correctly.

**Lazy loading audit:** 9+ `<img>` tags confirmed with `loading="lazy"` ✅

---

## 6. COST ESTIMATE

| MAU | Open-Meteo | DigitalOcean ($6/mo droplet) | GitHub Pages | Supabase | Total |
|-----|------------|------------------------------|--------------|----------|-------|
| 1K | Free | $6/mo | Free | Free (500MB) | **~$6/mo** |
| 10K | Free* | $6–12/mo | Free | Free–$25/mo | **~$12–37/mo** |
| 100K | $20–99/mo | $24–48/mo (scale up) | Free | $25–$100/mo | **~$70–250/mo** |

*At 10K MAU without VPS cache: Open-Meteo free tier (10K req/day) burns in <1 day. **VPS weather cache is mandatory at 10K MAU.** It costs $0 extra (runs on the existing droplet).

**Cost optimization opportunities:**
1. **VPS cache (Open #23) is a $0 fix that prevents needing a $20/mo Open-Meteo paid plan until 100K MAU.** It's written. It's not deployed.
2. GitHub Pages hosting is free indefinitely for public repos ✅
3. The $6/mo DigitalOcean droplet handles 10K MAU easily. Next upgrade (~$12/mo 2GB RAM) is only needed at 50K+ concurrent users.

---

## 7. STALE BRANCH BOMB ⚠️

**22 remote branches exist. 20 are trash. 2 are actively dangerous.**

| Branch | Ahead of main | Risk |
|--------|---------------|------|
| `origin/fix-appjsx-final` | **597 commits** | 🔴 DAY 26 rollback bomb — if anything auto-merges this, 597 Cursor commits overwrite main |
| `origin/master` | **511 commits** | 🔴 Shadow main with divergent history |
| `origin/restore-appjsx` | Unknown | ⚠️ Name implies destructive intent |
| 15× `origin/claude/*` | Unknown | Abandoned agent worktrees |
| 2× `origin/cursor/*` | Unknown | Abandoned Cursor worktrees |
| `origin/test-small` | Unknown | Test artifact |

**These branches do nothing while they sit there, until they do something catastrophic.** Every day this sits unfixed is another day a confused agent, CI script, or accidental click creates a merge/PR. `fix-appjsx-final` with 597 commits is the one that keeps me up at night.

**Fix (5 minutes, Jack only — destructive action requires human):**
```bash
# Delete all stale claude/* and cursor/* branches
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
  cursor/finish-peakly-ship-c015 \
  cursor/phone-testflight-c015 \
  fix-appjsx-final \
  restore-appjsx \
  test-small

# master needs investigation before deletion — it's 511 commits ahead.
# Either it's the original development branch (safe to delete after confirming
# deploy.yml handles main only) or it has intentional divergence.
# Check: git log --oneline origin/master ^origin/main | head -5
```

---

## 8. APP REVIEW STATUS

App Review has been in Apple's queue for **12 days** as of today (MISSED date was ~Nov 13–14). No resolution visible from this sandbox. Thanksgiving tomorrow means Apple reviewers are OOO until at least Nov 27. **Realistic earliest response: Monday Nov 30.**

The reply to Guideline 2.1 (information needed) is documented in `docs/APP_REVIEW_NOTES.md`. Nothing DevOps can do to unblock this — it's a human task (Jack replies to App Review thread).

---

## WHAT BREAKS FIRST AT SCALE

The VPS weather cache is the single-point failure that ends the app at scale. Right now, every unique (lat,lon) coordinate triggers a direct Open-Meteo API call from the client's browser. With 404 venues, 50+ concurrent users hitting Explore simultaneously generate 400+ Open-Meteo requests in 2 seconds. Open-Meteo's free tier limit is ~10K requests/day — a single front-page Reddit post drives 500–2000 concurrent users and burns the entire daily quota in 60 seconds. After that, every user gets "conditions unavailable" and the product is dead until midnight UTC. The VPS proxy with its 4000-entry LRU + disk cache turns N concurrent users on the same coordinate into exactly 1 upstream call. This cache is written, committed, and not deployed. It has been undeployed for **106 days**. The window to fix this before Thanksgiving traffic hits is closing in hours, not days.

---

## PRIORITY SUMMARY

| Priority | Issue | Time to fix | Owner |
|----------|-------|-------------|-------|
| 🔴 P0 | VPS Day 106 — not deployed, Thanksgiving tomorrow | 15 min SSH | Jack |
| 🔴 P0 | App Review reply (Guideline 2.1) | 30 min | Jack |
| 🟡 P1 | 22 stale remote branches (2 are rollback bombs) | 5 min | Jack |
| 🟡 P1 | CLAUDE.md `lateSeason` count says 15, grep finds 10 | Verify + update | Next agent |
| 🟠 P2 | No SRI on CDN scripts | 2–3 hrs | Any session |
| 🟠 P2 | No CSP meta tag | 4 hrs | Any session |
| 🟢 P3 | Alerts API unauthenticated IDs (ships with VPS redeploy) | Done w/ #P0 | Jack |
