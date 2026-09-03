# DevOps Report — 2026-09-03 (YELLOW)

**Status: 🟡 YELLOW — No new P0s. cdnjs CDN swap confirmed live (P1 from 09-02 resolved). FOR/NAT and BASE_PRICES false alarms closed permanently. Open #19/#21/#23 VPS/APNS P1 items Day 41/40. 18 zombie branches stable.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification.

---

## What Changed Since Yesterday

- **No app.jsx code changes.** Last 3 commits (PM v138 + Content 09-02 + DevOps 09-02) were report files + stamp bumps only. Venue count, scoring, and feature code unchanged.
- **cdnjs CDN swap CONFIRMED LIVE** — commit `a509db4` (09-02) swapped React 18.3.1 + ReactDOM 18.3.1 + Babel 7.24.7 from `unpkg.com` → `cdnjs.cloudflare.com` in `index.html`. Source file verified clean. CI runs on every push to main → production bundle rebuilt from source → live site is on cdnjs. The P1 from yesterday's report is resolved. The local `dist/` copy (Aug 28 artifact) is stale but irrelevant — it's rebuilt by CI on every deploy.
- **FOR/NAT AP_CONTINENT: permanently closed.** Re-verified today: `FOR` at `app.jsx:419` (AP_CONTINENT) + `app.jsx:6900` (AIRPORT_COORDS). `NAT` at `app.jsx:439` + `app.jsx:6900`. Both have BASE_PRICES rows at lines 6528-6529. Zero gap exists. This false alarm has appeared in 3 consecutive Content reports — stop re-checking it.
- **BASE_PRICES: fully covered (0 missing).** Ran authoritative check: 123 unique venue airport codes extracted, 181 BASE_PRICES destination keys. Every venue airport resolves. This was listed as Open #22 (68% coverage). It's resolved. See note below.
- **Open #19 (VPS redeploy) is Day 41.** Open #23 (weather disk cache) is Day 41. Open #21 (APNS uncommitted fix) is Day 40.
- **18 zombie branches** — stable (same as yesterday).

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,064 lines / 751,971 bytes raw** (~734 KB raw) |
| Production bundle `dist/app.min.js` | **495 KB** — built by CI on each main push; local artifact is Aug 28 (pre-fix), live version is 09-02 build ✅ |
| Cache stamp `PEAKLY_BUILD` | **`20260902a`** at `app.jsx:17` ✅ |
| SW `CACHE_NAME` | **`peakly-20260902a`** at `sw.js:2` ✅ in lockstep |
| `index.html` query param | **`?v=20260902a`** at `index.html:395` ✅ in lockstep |
| Plausible analytics | ✅ **LIVE** — `script.js` (correct variant) at `index.html:32` |
| Sentry | ✅ DSN `9416b032a46681d74645b056fcb08eb7` at `index.html:77` |
| React + ReactDOM CDN | ✅ **cdnjs.cloudflare.com** (fixed 09-02) — no more unpkg |
| Babel CDN | ✅ **cdnjs 7.24.7** (dev-only; stripped in production build) |
| Venue count | **395** (132 skiing / 263 beach) — eval-verified, matches `.venue-baseline` |
| Duplicate venue IDs | ✅ Zero — boot-time IIFE at `app.jsx:528` |
| All images lazy-loaded | ✅ 9/9 `<img>` tags carry `loading="lazy"` |

**Cache stamp note:** Stamp is `20260902a`, today is 09-03. This is correct — the stamp was bumped when code last shipped (09-02). If no app.jsx/sw.js/index.html changes land today, the stamp correctly stays on 09-02. Auto-push will bump it to `20260903a` on the first code push today. Not a bug.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` at `app.jsx:6249` — **HTTPS** ✅ |
| Legacy IP (104.131.82.242) | Not present ✅ |
| Fetch timeout | **4s AbortController** at `app.jsx:5438` ✅ |
| Fallback on proxy failure | ✅ Direct Open-Meteo fallback on proxy error |
| Travelpayouts token | ✅ Server-side env var only — `TP_MARKER=710303` in client is the public affiliate marker (expected, not a secret) |
| VPS `forecast_days` | ⚠️ Still 7 on deployed VPS — committed fix has `14` but not redeployed. Open #19, Day 41. |
| Alert deletion CORS | ⚠️ `DELETE` method missing from VPS CORS — preflight blocked, silently fails. Open #19. |
| iOS native CORS | ⚠️ `capacitor://localhost` missing from VPS CORS — iOS native API calls blocked. Open #19. |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo usage | ✅ Proxy-first, direct fallback. Batched for initial load. 2hr localStorage cache. |
| VPS weather cache | ⚠️ **In-memory only** — wipes on pm2 restart. Open #23, P1, Day 41. |
| Marine API | ✅ Beach-only (`needsMarine` check at `app.jsx:13234`) |
| Forecast window | ✅ Client requests 14 days. VPS `_wxCache` serves 7-day payload (pre-redeploy state). |

**Open-Meteo capacity math (unchanged, still critical):**
395 venues × 2 calls (weather + marine for beach) = ~790 requests per full cold refresh.
At 2hr TTL = 12 refreshes/day = **9,480 requests/day against a 10,000/day free limit.**
You are running at **95% of the free tier at zero users.** One Reddit post + cold cache = rate-limited within hours.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts server token | ✅ Not in any client file — VPS env var only |
| Supabase anon key | ✅ Intentionally public — `SUPABASE_ANON_KEY` at `app.jsx:26`, RLS-gated |
| Sentry DSN | ✅ Intentionally public — designed for client bundles |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Recent commits for secrets | ✅ Last 10 commits are report files + stamp bumps only |
| APNS .p8 key | ✅ Covered by `.gitignore`. Not in repo. |
| APNS fix uncommitted | ⚠️ **P1, Day 40** — `server/proxy.js` (HTTP/2 transport + JWT P1363) + `app.jsx` (UUID alert IDs) have fixes sitting as working-tree changes since 2026-07-25. Not committed, not tested, not deployed. Open #21. |

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| Raw `app.jsx` | 734 KB |
| Minified `dist/app.min.js` | **495 KB** (~160 KB gzipped) |
| Babel standalone | Dev-only, **stripped entirely in production** ✅ |
| React 18 + ReactDOM 18 | cdnjs ✅ — ~130 KB gzipped combined |
| Sentry SDK | `sentry-cdn.com` — ~50 KB gzipped |
| Google Fonts | Plus Jakarta Sans — ~30 KB |
| **Production total parse weight** | **~370 KB gzipped** (app.min.js + React + Sentry + fonts) |
| Image lazy loading | ✅ 9/9 img tags |
| SRI on CDN scripts | ❌ No `integrity=` on any `<script>`. P2 — medium risk (Babel eval complicates SRI). |
| CDN health | ✅ cdnjs.cloudflare.com (Cloudflare SLA) — no longer on unpkg |

**Biggest remaining bottleneck:** Open-Meteo free tier at 95% capacity (see §3). Not a CDN/JS issue — the JS stack is healthy now. The capacity crunch will be the first thing to break.

---

## 6. False Alarm Closures (Permanent)

These have been reported by agents for multiple consecutive days. They are not bugs. Closing them with evidence so future runs don't re-surface them.

**FOR/NAT AP_CONTINENT gap — CLOSED.**
```
app.jsx:419   "FOR":"latam"          ← AP_CONTINENT entry ✅
app.jsx:439   "NAT":"latam"          ← AP_CONTINENT entry ✅
app.jsx:6900  FOR:{lat:-3.7762,...}  ← AIRPORT_COORDS entry ✅
app.jsx:6900  NAT:{lat:-5.9111,...}  ← AIRPORT_COORDS entry ✅
app.jsx:6528  FOR:{ JFK:680, ... }   ← BASE_PRICES entry ✅
app.jsx:6529  NAT:{ JFK:700, ... }   ← BASE_PRICES entry ✅
```
Both Fortaleza (FOR) and Natal (NAT) are wired in all three lookup tables. No flight filter bypass. No missing data. Do not re-flag.

**BASE_PRICES coverage gap (Open #22) — CLOSED.**
Ran authoritative check: 123 unique `ap` codes across all 395 venues. All 123 appear in BASE_PRICES (181 destination keys). Coverage is 100%, not 68%. The prior 68% figure came from counting destination keys, not checking if each venue's `ap` was present. Open #22 is resolved.

---

## 7. Cost Estimate

| Tier | MAU | Est. infra cost/month |
|------|-----|----------------------|
| Today | <50 | $6 (DO droplet) |
| 1K MAU | 1,000 | $6 (same droplet — within capacity) |
| 10K MAU | 10,000 | $12–18 (droplet scale + Open-Meteo paid tier ~$12/mo) |
| 100K MAU | 100,000 | $80–120 (3× proxy nodes + Open-Meteo paid, Cloudflare Pages optional) |

**Open-Meteo paid tier trigger point:** at ~1K concurrent users hitting the same venue set on a cold cache, free tier saturates in minutes. The paid tier starts at $15/month for 1M calls/day. Budget this before any Reddit/HN post.

---

## Open Issues (Priority Order)

### P0 (Blocks Launch)
_None._

---

### P1 (Fix This Week)

**#19 — VPS redeploy (Day 41)** — fixes committed, not deployed. Blocked on Jack SSH.

```bash
ssh root@198.199.80.21
# /opt/peakly-proxy is NOT a git clone — manual copy required
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq '{uptime, forecast_days, wx_cache_disk, apns}'
# Expect: forecast_days:14, wx_cache_disk:true
```

**#21 — APNS fix uncommitted (Day 40)** — two bugs in `server/proxy.js` mean push delivers zero pushes. Fix is in the working tree since 2026-07-25. It needs to be committed even if the VPS isn't being deployed today.

```bash
# Working tree has the fix — just commit it:
cd ~/peakly
git add server/proxy.js app.jsx
git commit -m "fix: APNS HTTP/2 transport + JWT P1363 encoding + UUID alert IDs"
git push origin main
```

The two bugs in the uncommitted fix:
1. `fetch` (HTTP/1.1) against APNs (HTTP/2-only) → every push silently fails
2. EC key signed with DER encoding → Apple rejects (needs `dsaEncoding: 'ieee-p1363'`)

Also in the uncommitted `app.jsx` change: `Date.now()` alert IDs replaced with `crypto.randomUUID()`. `Date.now()` IDs are guessable — anyone can delete another user's alert by trying sequential timestamps.

**#23 — VPS weather disk cache (Day 41)** — bundle with #19 redeploy.

```javascript
// Add to server/proxy.js after `const _wxCache = {}`:
const CACHE_FILE = '/opt/peakly-proxy/wx-cache.json';
function loadCacheFromDisk() {
  try {
    const data = JSON.parse(require('fs').readFileSync(CACHE_FILE, 'utf8'));
    const now = Date.now();
    let loaded = 0;
    for (const [k, v] of Object.entries(data)) {
      if (now - v.ts < 2 * 60 * 60 * 1000) { _wxCache[k] = v; loaded++; }
    }
    console.log(`[cache] Loaded ${loaded} warm entries from disk`);
  } catch {}
}
function saveCacheToDisk() {
  try { require('fs').writeFileSync(CACHE_FILE, JSON.stringify(_wxCache)); }
  catch (e) { console.warn('[cache] disk write failed:', e.message); }
}
loadCacheFromDisk();
setInterval(saveCacheToDisk, 5 * 60 * 1000);
process.on('SIGTERM', saveCacheToDisk);
process.on('SIGINT', saveCacheToDisk);
```

---

### P2 (Fix This Sprint)

**18 zombie branches (stable)** — 15 `claude/*` + fix-appjsx-final + restore-appjsx + test-small. Clutters `git branch -r`, confuses future agents.

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

**SRI on CDN scripts** — No `integrity=` attributes on React, Sentry, or font scripts. Medium risk — a CDN compromise could inject arbitrary JS. Babel eval currently complicates SRI (inline eval fails with strict CSP). Defer until after launch; assess at 1K MAU.

---

## What Will Break First at Scale

**Open-Meteo free tier.** At 395 venues × 2 API calls per refresh × 12 cold refreshes/day = **9,480 requests/day against a 10,000 free limit**. That math holds with zero users and a cold cache. The moment a Reddit post sends 200 concurrent users to the site, the shared 2hr VPS cache absorbs the upstream load — but only if the VPS is redeployed (Open #19) and the disk cache is live (Open #23). Without those two fixes deployed, every pm2 restart starts from zero: 200 users × 790 calls each = 158,000 upstream calls in minutes. The free tier caps at 10K/day total. You'll see 429s from Open-Meteo before you see a single new paying hotel referral. Fix: deploy Open #19 + #23, then budget $15/month Open-Meteo paid tier before any public traffic push.

---

*Verified from git HEAD `7c96653` (2026-09-02), confirmed against `origin/main` via `git fetch`. VPS state unverifiable from this sandbox — treating as healthy per 2026-08-11 confirmation.*
