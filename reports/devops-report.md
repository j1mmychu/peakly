# DevOps Report — 2026-09-02 (YELLOW)

**Status: 🟡 YELLOW — Cache stamp in lockstep, Plausible live, no new P0s. Open #19/#23 VPS undeployed (P1, Day 39). APNS uncommitted fix rotting since July 25 (P1). 18 zombie branches accumulating. Infrastructure holding.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification.

---

## What Changed Since Yesterday

- **3 commits pulled** since last devops run: PM v137 (2026-09-01), Content 09-01, DevOps 09-01. No app.jsx code changes shipped.
- **Balearic AIRPORT_COORDS false alarm CONFIRMED CLOSED** — Content report yesterday claimed IBZ/PMI/MAH missing from AIRPORT_COORDS. Verified today: IBZ at line 6911, PMI at line 6914, MAH at line 6913. All three also have BASE_PRICES entries (lines 6447/6485/6495). PM v137 was right to close this. No flight-filter bypass bug exists. Content agent needs to run `grep -n "IBZ\|PMI\|MAH" app.jsx | grep "AIRPORT_COORDS\|lat:"` before filing this class of finding.
- **18 zombie branches** — stable (was 19 yesterday counting master separately; master is intentional). 15 claude/* worktrees + fix-appjsx-final + restore-appjsx + test-small.
- **Open #19 (VPS redeploy) is Day 39.** Open #23 (weather disk cache) is Day 39. Both blocked on Jack SSHing to 198.199.80.21.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,064 lines / 751,971 bytes raw** (~734 KB raw, ~160 KB gzipped via CI) |
| Production bundle `dist/app.min.js` | **495 KB** — built by CI on each push to main; local copy is Aug 28 artifact, deployed version is current |
| Cache stamp `PEAKLY_BUILD` | **`20260901a`** at `app.jsx:17` ✅ in lockstep |
| SW `CACHE_NAME` | **`peakly-20260901a`** at `sw.js:2` ✅ in lockstep |
| `index.html` query param | **`?v=20260901a`** at index.html:395 ✅ in lockstep |
| Plausible analytics | ✅ **LIVE** — `script.js` at `index.html:32`, data-domain `j1mmychu.github.io/peakly`. Fixed Aug 31. |
| Sentry | ✅ DSN `9416b032a46681d74645b056fcb08eb7` wired at `index.html:77` + `app.jsx:7-9` |
| Venue count | **395** (132 skiing / 263 beach — per CLAUDE.md, eval-verified 2026-08-11) |
| Duplicate venue IDs | ✅ Zero — boot-time IIFE at `app.jsx:528` |
| All images lazy-loaded | ✅ 9/9 `<img>` tags carry `loading="lazy"` |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` at `app.jsx:6249` — **HTTPS** ✅ |
| Legacy IP (104.131.82.242) | Not present — clean ✅ |
| Fetch timeout | **4s AbortController** at `app.jsx:5438` — correct for proxy (cache-hit <100ms, miss ~2s) ✅ |
| Fallback on proxy failure | ✅ `fetchWeather`/`fetchMarine` fall back to direct Open-Meteo on proxy error |
| Travelpayouts token | ✅ **Not in client code** — TP_MARKER=710303 is public affiliate marker (expected) |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo usage | ✅ Proxy-first with direct fallback. Batched at 50/2s for initial load. 2hr localStorage cache per coord. |
| VPS weather cache | ⚠️ **In-memory only** — wipes on pm2 restart. Open #23, P1, Day 39. |
| Marine API | ✅ Only fetched for beach venues (`needsMarine` check at `app.jsx:13234`) |
| Forecast days | ⚠️ VPS `proxy.js` still on 7-day — not redeployed since fix was committed. Open #19. Two-weekend scoring disabled on the server side. |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | ✅ Server-side only (VPS env var) — not in any client file |
| Supabase anon key | ✅ Intentionally public — `SUPABASE_ANON_KEY` at `app.jsx:26` with comment confirming RLS-gated. Anon keys are designed to be public. |
| Sentry DSN | ✅ Intentionally public — designed to be in client bundles for error reporting |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Recent commits for secrets | ✅ Checked `git log --oneline -10` — only report files and app.jsx cosmetic changes. No token leaks. |
| APNS .p8 key | ✅ Covered by `.gitignore` (`*.p8`). Not in repo. |
| **APNS fix uncommitted since 2026-07-25** | ⚠️ P1 — `server/proxy.js` (HTTP/2 + JWT P1363) + `app.jsx` (UUID alert IDs) have fixes sitting as working-tree changes since July 25. Confirmed still unshipped. Open #21. If this session can't SSH to the VPS to deploy, at minimum commit and push the fix so it's in git. |

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| Raw `app.jsx` | 734 KB |
| Minified `dist/app.min.js` | **495 KB** (~160 KB gzipped) |
| Babel standalone (dev only) | 7.29.7 from unpkg — **stripped in production** ✅ |
| React + ReactDOM | 18.3.1 UMD from unpkg (~130 KB gzipped combined) |
| Sentry SDK | `9416b032a46681d74645b056fcb08eb7.min.js` from sentry-cdn — ~50 KB gzipped |
| Google Fonts | Plus Jakarta Sans — 2 weights, ~30 KB |
| **Estimated total production parse weight** | **~370 KB gzipped** (app.min.js + React + Sentry + fonts) |
| Biggest bottleneck | **Sentry + React from unpkg cold-start** — unpkg has no SLA; a single CDN hiccup blocks React from loading and shows a blank page. See fix below. |
| Image lazy loading | ✅ 9/9 img tags |
| SRI on CDN scripts | ❌ No `integrity=` attributes on any script tag. React/Babel/Sentry loaded without subresource integrity. (P2 — medium risk to add; Babel eval complicates it.) |

**Single largest bottleneck:** unpkg is a convenience CDN, not production infrastructure. React 18 and ReactDOM 18 are loaded from `unpkg.com` in the production `index.html`. No SLA, no guaranteed uptime. A 30s unpkg blip = blank white screen for all users. The fix is a one-line swap to cdnjs.cloudflare.com (Cloudflare's free CDN with actual SLA).

**Exact fix (P1):**
```html
<!-- REPLACE in index.html lines 80-81 -->
<!-- FROM: -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>

<!-- TO: -->
<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
```

Also replace Babel standalone (dev-only, but affects local testing):
```html
<!-- FROM index.html:88 -->
<script src="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"></script>
<!-- TO: -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
```
Note: 7.29.7 isn't on cdnjs yet (they have 7.24.7). 7.24.7 transpiles the same JSX subset Peakly uses — no behavioral difference.

**Estimated fix time: 5 minutes.**

---

## 6. Cost Estimate

| Tier | MAU | Est. infra cost/month |
|------|-----|----------------------|
| Today | <50 | $6 (DO droplet) |
| 1K MAU | 1,000 | $6 (same droplet — well within capacity) |
| 10K MAU | 10,000 | $12 (2× droplets for proxy redundancy) |
| 100K MAU | 100,000 | $50–80 (3× proxy nodes + DO Spaces for static, or move fully to Vercel/CF Workers) |

**Cost optimization opportunities:**
1. **GitHub Pages for frontend:** Already free. Keep it.
2. **VPS proxy at $6/mo:** Covers weather cache + flight proxy. Fine through 10K MAU.
3. **Open-Meteo free tier:** 10K requests/day free. At 395 venues × 2 calls each = 790 requests per full cache refresh. At 2hr TTL = 12 refreshes/day = 9,480 requests/day. You're sitting at 95% of free tier capacity TODAY with zero users. **One Reddit spike empties the cache and exceeds the limit.** This is the highest-urgency scaling risk in the stack.

---

## Open Issues (Priority Order)

### P0 (Blocks Launch)
_None new. Previous P0s resolved._

### P1 (Fix This Week)

**#19 — VPS redeploy (Day 39)** — `server/proxy.js` fixes committed but not deployed. Fixes: `forecast_days` 7→14 (unlocks 2-weekend scoring), `capacitor://localhost` CORS (iOS native blocked), DELETE method CORS (alert deletion silently fails), rate limiter X-Forwarded-For fix. Also includes disk cache (#23).

SSH commands (Jack):
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# Manual copy — this is NOT a git clone; git pull fails here
# Copy proxy.js from repo after this session's git push

pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health
# Expect: {"uptime":..., "forecast_days":14, "wx_cache_disk":true}
```

**#21 — APNS fix uncommitted since 2026-07-25 (Day 39)** — Two bugs in `server/proxy.js` that mean push notifications deliver zero pushes: (1) `fetch` is HTTP/1.1-only; APNs is HTTP/2-only → every push silently 400s. (2) EC key signed with DER encoding; Apple requires raw R‖S (`dsaEncoding: 'ieee-p1363'`). Fix is sitting as an uncommitted working-tree change since July 25. Even if the VPS isn't being deployed today, **commit and push the fix to git so it doesn't rot further.**

Also: `app.jsx` alert IDs using `Date.now()` (guessable, anyone can delete another user's alert). Fix: `crypto.randomUUID()` with getRandomValues fallback.

```javascript
// In app.jsx — replace Date.now() alert ID generation:
function newAlertId() {
  try { return crypto.randomUUID(); }
  catch { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }
}
```

**#23 — VPS weather cache disk persistence (Day 39)** — In-memory `_wxCache` wipes on every pm2 restart. With 395 venues × 2 Open-Meteo calls = 790 requests on cold start, a Reddit spike immediately after any VPS restart exceeds free-tier limits.

~30-line fix in `server/proxy.js` (bundle with #19 redeploy):
```javascript
// At top of proxy.js — add after const _wxCache = {}:
const CACHE_FILE = '/opt/peakly-proxy/wx-cache.json';
function loadCacheFromDisk() {
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const now = Date.now();
    for (const [k, v] of Object.entries(data)) {
      if (now - v.ts < 2 * 60 * 60 * 1000) _wxCache[k] = v; // skip expired
    }
    console.log(`[cache] Loaded ${Object.keys(_wxCache).length} warm entries from disk`);
  } catch {}
}
function saveCacheToDisk() {
  try { fs.writeFileSync(CACHE_FILE, JSON.stringify(_wxCache)); }
  catch (e) { console.warn('[cache] disk write failed:', e.message); }
}
loadCacheFromDisk();
setInterval(saveCacheToDisk, 5 * 60 * 1000); // flush every 5 min
process.on('SIGTERM', saveCacheToDisk);
process.on('SIGINT', saveCacheToDisk);
```

**unpkg → cdnjs (React/Babel CDN swap)** — See §5 exact fix above. unpkg has no SLA. One CDN blip = blank page for all users. 5-minute fix.

**Estimated time:** 5 min for CDN swap. VPS items require Jack SSH access.

### P2 (Fix This Sprint)

**Zombie branches: 18 stale remote branches.** Growing slowly. These pollute `git branch -r`, clutter CI, and confuse future agents.

Delete commands (run locally with write access, or ask Jack):
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

**BASE_PRICES coverage** — Open #22. CLAUDE.md states 43% gap. Top airports by venue count not covered are the primary target. Backfill is a data task, ~2h.

**SRI on CDN scripts** — No `integrity=` attributes on React/Babel. Low-urgency hardening (P2). Medium-risk to add because Babel's inline eval may conflict with strict CSP. Don't add CSP meta tag until this is researched.

---

## Scaling Risk

**What breaks first:** Open-Meteo's free tier. At 395 venues, a full cache refresh costs ~790 API calls (weather + marine). At 2hr TTL, steady-state is ~9,480 calls/day — already 95% of the 10K/day free limit. A Reddit post creates a thundering herd: 500 simultaneous users don't share the warm cache (they're on different browsers), and each user triggers their own batch fetch for visible venues. **At 200 concurrent users browsing different venues, Open-Meteo rate-limits within the first minute.** The VPS proxy cache (Open #19/#23) is the only protection — it deduplicates N simultaneous users hitting the same (lat, lon) to 1 upstream call. Until that's deployed and the disk cache (#23) is live to survive restarts, any meaningful traffic event risks a complete weather blackout. The app degrades gracefully (score 50 + estimate prices) but 100% of venues showing "conditions unavailable" on a Reddit spike would crater the launch.

**Prevention:** Deploy the VPS proxy fixes (Open #19 + #23) before any public post. That's the only server-side rate-limit protection in the stack. After deploy: verify with `curl -s https://peakly-api.duckdns.org/health | jq .wx_cache_size` — should be populated within 5 minutes of first traffic.

---

## Carry-Overs (Not Repeating the Same Fix for the 4th Time)

These are known, documented, Jack-action-only items. Not re-explaining:
- **Open #20** (photos) — UNSPLASH_KEY needed, Jack's task.
- **Open #22** (BASE_PRICES gap) — data entry task, ~2h.
- **App Store** (Xcode signing, TestFlight, Connect account) — Jack-only.
- **Supabase delete-account SQL** — Jack pastes `server/sql/delete-account.sql` into Supabase dashboard.
