# DevOps Report — 2026-09-04 (YELLOW)

**Status: 🟡 YELLOW — No new P0s. No code changes since 09-02. Open #19/#21/#23 VPS/APNS P1 items Day 42. PM escalated Open-Meteo to RED — same math, new framing. 17 zombie branches (stable).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification. GitHub Pages and Plausible unverifiable from sandbox for same reason.

---

## What Changed Since Yesterday

- **No app.jsx code changes.** Last 3 commits (PM v139 + Content 09-03 + DevOps 09-03) were report files only. Venue count, scoring, and feature code unchanged.
- **PM v139 escalated to RED on Open-Meteo** — the same 9,480 req/day vs 10,000 free-tier math from DevOps reports. No new technical development; PM is applying pressure. The fix still requires Jack to SSH and deploy Open #19 + #23.
- **PM moved VPS SSH to "pre-Reddit gate"** — officially blocking the Reddit/HN post until Open #19 is deployed. Good framing.
- **Sep 7 hard deadline on 5 venue pastes** — not a DevOps concern, flagged for completeness.
- **Zombie branches:** 15 `claude/*` branches confirmed (same 15 as yesterday), plus `fix-appjsx-final` + `restore-appjsx` = **17 total** (was 18 — `test-small` appears merged/deleted or miscounted yesterday).

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,064 lines / 751,971 bytes raw** (~734 KB raw) |
| Production bundle `dist/app.min.js` | **495 KB** — CI rebuilds on each main push; local artifact is Aug 28 pre-fix, live version is 09-02 build ✅ |
| Cache stamp `PEAKLY_BUILD` | **`20260902a`** at `app.jsx:17` ✅ — correct, last code change was 09-02 |
| SW `CACHE_NAME` | **`peakly-20260902a`** at `sw.js:2` ✅ in lockstep |
| `index.html` query param | **`?v=20260902a`** at `index.html:395` ✅ in lockstep |
| Plausible analytics | ✅ `script.js` (correct variant) at `index.html:32`, data-domain correct |
| Sentry | ✅ DSN populated: `9416b032a46681d74645b056fcb08eb7` |
| React + ReactDOM CDN | ✅ **cdnjs.cloudflare.com 18.3.1** (fixed 09-02, holding) |
| Babel CDN | ✅ **cdnjs 7.24.7** (dev-only; stripped in production build) |
| Supabase JS | ✅ Lazy-loaded — only fetches when session or user taps Sign in |
| Venue count | **395** (132 skiing / 263 beach) per `.venue-baseline` |
| Images lazy-loaded | ✅ 9/9 `<img>` tags carry `loading="lazy"` |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` at `app.jsx:6249` — **HTTPS** ✅ |
| Legacy IP `104.131.82.242` | ✅ Not present |
| `fetchTravelpayoutsPrice` timeout | ✅ **4s AbortController** at `app.jsx:6297-6298` |
| Fallback on proxy failure | ✅ `~$X` estimate shown when proxy fails |
| Travelpayouts server token | ✅ Not in client. `TP_MARKER=710303` is the public affiliate marker — expected |
| VPS `forecast_days` | ⚠️ VPS still serves 7-day payload (committed fix has `14`) — Open #19, Day 42 |
| Alert deletion CORS | ⚠️ `DELETE` method missing from VPS `Access-Control-Allow-Methods` — Open #19 |
| iOS native CORS | ⚠️ `capacitor://localhost` not in VPS allowed origins — Open #19 |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo usage | ✅ Proxy-first, direct fallback. Batched (50/2s). 2hr localStorage TTL. |
| Client `forecast_days` | ✅ `forecast_days=14` at `app.jsx:5463` (weather), `forecast_days=10` at `app.jsx:5507` (marine) |
| VPS weather cache | ⚠️ **In-memory only** — wipes on `pm2 restart`. Open #23, Day 42. |
| Marine API | ✅ Beach-only (`needsMarine` check in batch loader) |

**Open-Meteo capacity — now PM-escalated to P0:**
395 venues × 2 calls (weather + marine for beach) × 12 cold refreshes/day = **9,480 requests/day** vs **10,000 free limit**.

That's with **zero users** and a cold cache. This math hasn't changed. What has changed: PM v139 is now blocking the Reddit post until Open #19 + #23 are deployed. The VPS shared cache absorbs concurrent load — without it, 50 concurrent cold users = 39,500 upstream calls in minutes. You hit the daily cap in under 2 minutes.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts server token | ✅ Not in client — VPS env var only |
| Supabase anon key | ✅ Intentionally public — `app.jsx:26`, RLS-gated by design |
| Sentry DSN | ✅ Intentionally public — standard for client bundles |
| `.gitignore` | ✅ Covers `.env*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Recent commits for secrets | ✅ Last 10 commits are report files only |
| APNS private key | ✅ Covered by `.gitignore` (`*.p8`) — not committed |
| SRI on CDN scripts | ⚠️ No `integrity=` on React, ReactDOM, Babel, Sentry scripts — persistent P2 |

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| JS served to users (production) | **484 KB** minified (`dist/app.min.js`) — Babel stripped by CI |
| JS loaded in dev (local) | **734 KB** raw + **Babel 7.24.7 (~320 KB gzipped)** = ~1MB dev only |
| Largest bottleneck | Babel Standalone parse wall — **eliminated in production** by esbuild build step |
| CDN dependency versions | React 18.3.1 / Babel 7.24.7 — current, not EOL |
| Image lazy loading | ✅ All 9 `<img>` lazy |
| Google Fonts | Preconnect to `fonts.gstatic.com` + `fonts.googleapis.com` ✅ |

---

## 6. Cost Estimate

| Scale | Infrastructure | Notes |
|-------|----------------|-------|
| **Today (~0 MAU)** | **$6/month** | DigitalOcean 1GB droplet |
| **1K MAU** | **$6/month** | VPS handles it; Open-Meteo free tier may hit ceiling |
| **10K MAU** | **~$21/month** | $6 VPS + $15 Open-Meteo paid tier (required before Reddit post) |
| **100K MAU** | **~$66/month** | $6 VPS → upgrade to $12 (2 CPU) + $15 Open-Meteo + $39 Supabase Pro |

**Immediate cost action:** Before any traffic push, budget $15/month for Open-Meteo's Starter tier (1M requests/month). At 10K MAU that's 33¢ per user per month — negligible against Booking.com RPM of $6.90/1K MAU.

---

## Issues

### P0 (Blocks Launch)

_None from DevOps. PM has reclassified Open-Meteo as pre-Reddit-gate P0 — see P1 #19 which unblocks it._

---

### P1 (Fix This Week / Pre-Reddit Gate)

**#19 — VPS redeploy (Day 42)** — now blocking the Reddit post per PM v139. Fixes committed to main since 2026-08-11, not deployed. One SSH session deploys everything.

```bash
ssh root@198.199.80.21
# /opt/peakly-proxy is NOT a git clone — scp the file
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, wx_cache_disk:true, cors includes capacitor://localhost
```

What deploys with this:
- `forecast_days` 7→14 (unblocks two-weekend scoring)
- `DELETE` added to CORS (alert deletion unblocked)
- `capacitor://localhost` in CORS (iOS native unblocked)
- Rate limiter reads last X-Forwarded-For (spoof protection)

**#23 — VPS weather disk cache (Day 42)** — bundle with #19. Prevents cold-cache Open-Meteo blowout on Reddit traffic spike.

```javascript
// Add to server/proxy.js AFTER `const _wxCache = {};`
const CACHE_FILE = '/opt/peakly-proxy/wx-cache.json';
(function loadCacheFromDisk() {
  try {
    const data = JSON.parse(require('fs').readFileSync(CACHE_FILE, 'utf8'));
    const now = Date.now(), ttl = 2 * 60 * 60 * 1000;
    let n = 0;
    for (const [k, v] of Object.entries(data)) {
      if (now - v.ts < ttl) { _wxCache[k] = v; n++; }
    }
    console.log(`[cache] Loaded ${n} warm entries from disk`);
  } catch {}
})();
function saveCacheToDisk() {
  try { require('fs').writeFileSync(CACHE_FILE, JSON.stringify(_wxCache)); }
  catch (e) { console.warn('[cache] disk write failed:', e.message); }
}
setInterval(saveCacheToDisk, 5 * 60 * 1000); // flush every 5 min
process.on('SIGTERM', saveCacheToDisk);
process.on('SIGINT',  saveCacheToDisk);
```

**#21 — APNS fix uncommitted (Day 42)** — two bugs mean push delivers zero pushes. Fix has been in the uncommitted working tree since 2026-07-25 (per CLAUDE.md). Even if APNS isn't being configured today, this code should be committed so it doesn't get lost.

From a local networked session:
```bash
cd ~/peakly
git status  # confirm server/proxy.js and app.jsx are dirty with the fix
git add server/proxy.js app.jsx
git commit -m "fix: APNS HTTP/2 transport + JWT dsaEncoding:ieee-p1363 + UUID alert IDs"
git push origin main
```

Bugs in the uncommitted fix:
1. `fetch` is HTTP/1.1-only; APNs is HTTP/2-only → every push silently fails
2. EC JWT signed with DER encoding; Apple requires raw R‖S (`dsaEncoding: 'ieee-p1363'`)
3. Alert IDs were `Date.now()` → guessable; fix uses `crypto.randomUUID()`

---

### P2 (Fix This Sprint)

**17 zombie branches** — 15 `claude/*` + `fix-appjsx-final` + `restore-appjsx`. Clutters `git branch -r`, confuses agents into thinking branches represent in-progress work.

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
  restore-appjsx
```

**SRI on CDN scripts** — React, ReactDOM, Babel, and Sentry scripts have no `integrity=` attributes. A CDN compromise could inject arbitrary JS into every session. Babel's inline eval complicates adding a strict CSP simultaneously — assess after launch. Low urgency at <10 MAU.

```html
<!-- Example fix for React (get hash from cdnjs page or sha384sum): -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-REPLACE_WITH_ACTUAL_HASH"></script>
```

---

## What Will Break First at Scale

**Open-Meteo free tier hits the wall before you see the first Booking.com referral.** At 395 venues × 2 calls × 12 refreshes/day = 9,480 requests against a 10,000 free-tier ceiling — that's baseline with zero users. The moment 50 concurrent first-time visitors hit a cold cache simultaneously, you push 39,500 upstream calls within minutes. Open-Meteo 429s silence weather data sitewide; the "conditions unavailable" banner shows for everyone; you look broken on launch day. **Prevention is two steps: (1) deploy Open #19 + #23 this week so the VPS cache is warm and disk-persisted, (2) budget $15/month Open-Meteo Starter before any public traffic push.** That's $180/year to prevent your launch from looking dead. Do it.

---

*Verified from git HEAD `efabca7` (2026-09-03), confirmed against `origin/main` via `git fetch`. VPS state unverifiable from sandbox — treating as healthy per 2026-08-11 confirmation.*
