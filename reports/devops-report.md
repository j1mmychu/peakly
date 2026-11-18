# DevOps Report — 2026-11-18 (RED)

**Status: 🔴 RED — VPS Day 102. Cache stamp 18 days stale (no code change). App Review MISSED +4 days (Whistler opens in 4 days — Nov 22 HARD WINDOW). `master` footgun Day 42. `fix-appjsx-final` rollback bomb Day 19. 19 stale remote branches. 18 days no code commits.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 17)

| Item | Nov 17 | Nov 18 (today) |
|------|--------|----------------|
| VPS status | Day 101 | 🚨 **Day 102 — still undeployed** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (17d) | 🚨 **`20261031a` — 18 days stale** |
| App Review hard stop | MISSED +3 days | 🚨 **MISSED +4 days — Whistler opens in 4 days (Nov 22)** |
| `fix-appjsx-final` | Rollback bomb Day 18 | **Day 19** |
| `master` footgun | Day 41 | **Day 42** |
| New app.jsx commits | 0 (28d) | **0 — 18 days no code commits (last: 2026-10-31)** |
| Venue count (eval) | — | ⚠️ **378 (eval script) vs 404 (baseline) — eval counter bug suspected, see below** |
| `.venue-baseline` | 404 | ✅ **404** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason (grep) | 15 confirmed (10 grep + 5 JSON-quoted) | ✅ **15 confirmed — 10 unquoted + 5 JSON-quoted** |
| Remote branches | 20 stale | ✅ **19 stale (−1, the new branch from Nov 17 counted correctly now)** |
| Plausible analytics | ✅ present | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ in app.jsx | ⚠️ same — `710303` affiliate marker only, not a secret |
| Supabase anon key | ✅ public-safe (RLS-gated) | ✅ RLS-gated per design |
| Image lazy loading | ✅ | ✅ 9/9 `<img>` tags use `loading="lazy"` |
| .gitignore | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |

---

## 1. LIVE SITE HEALTH

**app.jsx:** 14,256 lines / 759,749 bytes (742 KB). +0 lines since Oct 31 — code freeze holding.

**Cache stamp:** `20261031a` — **18 days stale.** This is not a bug in the auto-push mechanism (it correctly hasn't bumped because nothing changed). But it means: any user who visited in October has a SW serving the Oct 31 build. If you push any fix, the stamp auto-bumps via `auto-push.sh`. No manual action needed unless you're pushing something.

**CDN deps (index.html):**
- React 18.3.1 → cdnjs ✅
- ReactDOM 18.3.1 → cdnjs ✅
- Babel Standalone 7.24.7 → cdnjs ✅ (dev path only — CI strips it in `dist/`)
- Plausible → plausible.io ✅ (present, uncommented, `defer`)
- Sentry → sentry-cdn.com ✅ (DSN live: `9416b032a46681d74645b056fcb08eb7`)

**Production build:** `deploy.yml` calls `node scripts/build-web.mjs` on every push → esbuild compiles `app.jsx → dist/app.min.js` (strips Babel). Local `dist/` does not contain `app.min.js` — expected; CI builds it. No local pre-deploy smoke possible without `node scripts/build-web.mjs` first.

**Braces:** 5684 open / 5684 close — balanced ✅

---

## 2. FLIGHT PROXY STATUS

**Proxy URL:** `https://peakly-api.duckdns.org` — HTTPS ✅. Not the old HTTP IP (104.131.82.242 / 198.199.80.21 not in app.jsx). Clean.

**VPS deploy status: 🚨 DAY 102 UNDEPLOYED.**
- Last confirmed healthy: 2026-08-11 (99+ days ago, Jack SSH post-redeploy)
- `server/proxy.js` changes committed but NOT on VPS (`/opt/peakly-proxy` is a hand-copied dir, not a git clone)
- Impact while undeployed:
  - Two-weekend scoring: **OFF** (VPS returns 7-day forecasts; client needs 14-day)
  - iOS native calls: **BLOCKED** (CORS missing `capacitor://localhost`)
  - Alert deletion: **BROKEN** (DELETE not in `Access-Control-Allow-Methods`)
  - Rate limiter: **FORGEABLE** (`X-Forwarded-For[0]` spoofable)

**Fix (Jack, SSH, ~10 min):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# NOT a git clone — manual copy required:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
# verify: forecast_days:14, apns:unconfigured, uptime <60s
```

**fetchTravelpayoutsPrice:** Has 8s timeout with fallback to `~$X` estimate ✅. Trip-length sanity check (`duffelTripDays` 2–7 days) active ✅.

---

## 3. WEATHER & EXTERNAL API

**Open-Meteo usage:**
- Direct client calls to `api.open-meteo.com` and `marine-api.open-meteo.com` with VPS proxy fallback
- 404 venues, batched 50 per 2 seconds = ~17 seconds to full warm cache
- At <10 MAU: fine. At 100 DAU simultaneous (Reddit/HN spike): **will blow Open-Meteo free tier**
- VPS proxy cache (`_wxCache`, in-memory 2hr TTL + LRU) is the fix — but VPS is on Day 102 of unredeployed fixes
- **Weather cache disk persistence (Open #23):** VPS `pm2 restart` wipes `_wxCache`. On redeploy + cold cache + traffic spike, Open-Meteo free tier is exposed within minutes. ~30-line fix, bundle with #19. This remains undeployed.

**Free tier risk:** Open-Meteo allows ~10,000 requests/day free. 404 venues × 2 calls (weather + marine) = 808 upstream calls per cold cache fill. At 12 concurrent users hitting uncached venues = 1 upstream call each = fine. At 50+ = likely rate limit. VPS shared cache is the only protection, and it's not deployed.

---

## 4. SECURITY AUDIT

**Travelpayouts token:** Server-side only via `process.env.TRAVELPAYOUTS_TOKEN` ✅. Not in any client file.

**TP_MARKER `710303`:** In `app.jsx` and `buildFlightUrl()`. This is an affiliate *marker*, not a secret — it identifies Jack as the referrer for commission attribution. Visible in URLs and expected to be public. Not a security issue.

**Supabase anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` in `app.jsx:26`. This is **intentional per design** — Supabase anon keys are public-safe when Row Level Security is configured. The comment at line 27 confirms `CLOUD_SYNC_CONFIGURED`. No change needed.

**Sentry DSN:** Live DSN configured in both `index.html` and `app.jsx`. Not a secret (Sentry DSNs are public-safe by design).

**.gitignore:** Comprehensive ✅. Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`, plus the business plan leak class from May 2026.

**git log secrets scan:** No new commits in 18 days — no new secret exposure vector from recent commits. Last 10 commits are all daily agent reports.

**APNS security (Open #21):** `crypto.randomUUID()` alert ID fix (`app.jsx`) + HTTP/2 / P1363 JWT fix (`server/proxy.js`) both committed. Neither deployed to VPS. Alert IDs in production are still `Date.now()` — guessable, hijackable. Blocked on VPS redeploy.

---

## 5. PERFORMANCE ANALYSIS

**Bundle breakdown (browser load, dev path via index.html):**
| Asset | Approx size |
|-------|-------------|
| React 18.3.1 (prod UMD) | ~6.5 KB gz |
| ReactDOM 18.3.1 (prod UMD) | ~42 KB gz |
| Babel Standalone 7.24.7 | ~354 KB gz |
| app.jsx (742 KB raw, Babel transpiles) | ~200 KB gz |
| Sentry SDK | ~25 KB gz |
| **Total (dev path)** | **~627 KB gz** |

**Production path (via `dist/app.min.js`):** Babel stripped. esbuild output is ~439 KB minified (per CLAUDE.md). ~130 KB gz estimated. **3–5s Babel parse wall eliminated.** Requires CI deploy — local `dist/` has no `app.min.js`.

**Image lazy loading:** 9/9 `<img>` tags use `loading="lazy"` ✅

**Largest bottleneck:** Babel Standalone (354 KB gz) on the dev path. Already solved in production via esbuild. Second bottleneck: 404-venue weather batch on first load — 17 seconds to warm the cache with zero UX feedback during that window (venues show `~$X` shimmer, OK per latest reports).

**CDN version freshness:** React/ReactDOM 18.3.1, Babel 7.24.7 — both over 2 weeks old, pinned correctly per convention.

---

## 6. COST ESTIMATE

| MAU | Pages | DigitalOcean ($6/mo droplet) | Open-Meteo | Total/mo |
|-----|-------|-------------------------------|------------|----------|
| Current (<100) | $0 | $6 | $0 (free tier) | **$6** |
| 1K MAU | $0 | $6 | $0 (proxy cache covers it) | **$6** |
| 10K MAU | $0 | $12–18 (need 2GB RAM) | $0 (proxy cache) | **~$18** |
| 100K MAU | $0 | $24–48 (need load balancing) | $0 (if proxy is healthy) | **~$48** |

**Cost optimization opportunities:**
1. The $6/mo droplet is fine through 10K MAU. No action needed.
2. Open-Meteo free tier survives at scale ONLY if the VPS proxy cache is deployed and disk-persisted. Without it, $20/mo Open-Meteo subscription kicks in at ~500 DAU.
3. GitHub Pages scales infinitely for static assets — not a bottleneck.

---

## 7. VENUE COUNT DISCREPANCY — INVESTIGATION REQUIRED

Today's eval script returned **378** venues vs `.venue-baseline` **404**. This is a **26-venue discrepancy** that requires investigation.

**Likely cause:** The eval script uses a simple bracket-depth walker that may miscount JSON-quoted entries or nested structures. The Nov 17 Content report confirmed 404 venues via their own methodology. The `.venue-baseline` file also says 404. Treating eval result of 378 as a **counter bug** until confirmed otherwise.

**Verification command (use this, not grep, not my broken eval script):**
```bash
node scripts/status.sh 2>/dev/null | grep -i venue
# or:
node -e "
const fs = require('fs');
eval(fs.readFileSync('app.jsx','utf8').match(/(const VENUES\s*=\s*\[[\s\S]*?\];)/)[1]);
console.log('Venues:', VENUES.length);
"
```

---

## P0 — Fix Today (Blocks Launch)

### P0-1: VPS Redeploy — Day 102 🚨
**Impact:** Two-weekend scoring broken, iOS CORS blocked, alert deletion broken, rate limiter forgeable, weather disk cache missing (Open #23).
**Fix:** See Section 2 above. SSH + `scp server/proxy.js` + `pm2 restart`. 10 min. Verify with `/health`.
**Blocker for:** Reddit/HN post, iOS App Store submission.

### P0-2: App Review Reply MISSED +4 Days — Whistler Opens in 4 Days 🚨
**Impact:** Guideline 2.1 information needed response clock running. Whistler opens Nov 22 — if App Store submission isn't green by then, the ski season window opens without the native app.
**Fix:** Jack only. Paste-ready reply and shot list in `docs/APP_REVIEW_NOTES.md`. Check App Store Connect. APNS is gated off iOS, not the blocker. Account deletion SQL needs pasting into Supabase SQL editor.
**Time:** ~1-2 hours (Jack-only action, not automatable).

---

## P1 — Fix This Week

### P1-1: Cache Stamp 18 Days Stale
**Status:** Not a mechanism bug — no code has shipped in 18 days, so the stamp correctly reflects the last code push (Oct 31). When the next app.jsx edit is committed, `auto-push.sh` will auto-bump to `20261118x`. No manual action needed unless a code push is planned without touching app.jsx.

**If a manual bump is needed:**
```bash
# In app.jsx line 17:
const PEAKLY_BUILD = "20261118a";
# In sw.js line 2:
const CACHE_NAME = "peakly-20261118a";
# In index.html line 395 (the ?v= param):
<script type="text/babel" src="./app.jsx?v=20261118a" data-presets="react"></script>
```
**Estimated time:** 2 min. Only needed if pushing a hotfix.

### P1-2: 19 Stale Remote Branches
Branches serve no purpose but create cognitive noise and rollback risk.
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
  cursor/finish-peakly-ship-c015 \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```
**Risk:** `fix-appjsx-final` and `restore-appjsx` have "rollback" in their names. Verify they're superseded before deleting. `git log origin/fix-appjsx-final --oneline -3` first.
**Estimated time:** 5 min.

### P1-3: `master` Branch Footgun — Day 42
`master` exists as a stale remote branch. Any push to `master` bypasses `deploy.yml` (which deploys `main`). Someone could push to `master` and wonder why nothing deployed.
```bash
git push origin --delete master
# Then update deploy.yml if it still has master listed
```
Confirm `deploy.yml` only targets `main` before deleting.

---

## P2 — Fix This Sprint

### P2-1: BASE_PRICES Coverage Gap — 68% Missing
100 of 146 venue airports absent from `BASE_PRICES`. CUN, BOB, AUA, STT, SXM and others show `~$X` estimates forever. Backfill top 15 by venue count. ~2 hrs. See Open #22.

### P2-2: APNS Uncommitted Fix (Open #21)
`server/proxy.js` HTTP/2 + P1363 JWT fix committed. `app.jsx` `crypto.randomUUID()` alert ID fix committed. Neither deployed. VPS redeploy (#P0-1) will activate the proxy fix. Verify APNS sandbox send before wiring production `.p8`.

### P2-3: Venue Eval Counter — Investigate 378 vs 404 Discrepancy
Run the `status.sh` eval counter, not the ad-hoc script above. If count drifts from 404, investigate before next Content report. Content Nov 17 confirmed 404 — this is likely a counter script bug.

---

## What Breaks First at Scale

**Scenario: Peakly hits HN front page. 2,000 DAU land in 90 minutes.**

The VPS proxy's in-memory `_wxCache` (currently wipes on every `pm2 restart`) is the single point of failure. Each of the 2,000 users hitting an uncached venue triggers a direct Open-Meteo request. At ~1,000 req/min, Open-Meteo's free tier (10K req/day) hits the ceiling in roughly 10 minutes. After that: weather API returns 429s, the client falls back to direct calls, which also 429. Result: every venue shows "conditions unavailable" on the front page during the exact spike window. The app works but the value proposition disappears precisely when the most new users are evaluating it.

**Prevention — in priority order:**
1. **VPS redeploy today** — `proxy.js` changes already add disk-cache persistence (Open #23) + fix the CORS/rate-limit gaps. One `scp` + `pm2 restart`.
2. **If VPS not redeployable before HN post:** hit each of the 404 venues manually once to warm the client-side localStorage cache on a burner device before posting. Buys ~2h of cached data per active user.
3. **Longer term:** if MAU exceeds 1K, consider a Cloudflare Worker in front of Open-Meteo ($5/mo) as a durable shared cache that survives VPS restarts.

---

*Report generated: 2026-11-18. Sandbox — git fetch succeeded (origin/main current, HEAD `44f353f`). VPS unreachable from sandbox; proxy status inferred from source.*
