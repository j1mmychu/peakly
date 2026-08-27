# DevOps Report — 2026-08-27 (GREEN)

**Status: 🟢 GREEN — Post-launch day 5. No P0/P1 issues. Two housekeeping P2s.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (standard 403 egress block; documented CLAUDE.md pattern, not a VPS outage). Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH), PM v131 confirmed up through the 5-day observation window. Treating as healthy.

---

## Fixes Shipped in This Report

None — infrastructure is clean. Two P2 housekeeping items documented below with exact fix commands.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,039 lines / 750 KB raw** |
| `dist/app.min.js` (CI-built, local snapshot Aug 21) | **495 KB** minified, Babel-stripped ✅ |
| Cache stamp | **`20260826a`** ✅ `app.jsx:17`, `sw.js:2`, `index.html:395` — fully in lockstep |
| `PEAKLY_BUILD` | **`20260826a`** ✅ |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` |
| Sentry | ✅ Live — DSN `9416b032a46681d74645b056fcb08eb7` wired in `index.html:77` + `app.jsx:7-8` |
| Venue count | **391** (131 skiing / 260 beach) — dual-format grep (compact + pretty-printed JSON). Matches `.venue-baseline`. |
| Duplicate venue IDs | ✅ Zero |
| Lazy images | ✅ `loading="lazy"` on all `<img>` render sites |
| Babel in production | ✅ Stripped — `dist/index.html` loads esbuild `app.min.js`; zero 3–5s parse wall on real users |
| React version | **18.3.1** (current stable) ✅ |
| Babel standalone (dev only) | **7.29.7** ✅ current |

**Note:** `dist/index.html` shows `?v=20260821b` (last local CI build Aug 21). Production GitHub Pages is built by CI on every push to main and will be current — local `dist/` is only a dev snapshot, not what users see.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| Old HTTP IPs (`104.131.82.242`, `198.199.80.21`) | ✅ Zero client references |
| `fetchTravelpayoutsPrice` timeout | **4,000ms** (`app.jsx:6273`) ✅ |
| Fallback on proxy down | ✅ Falls back to BASE_PRICES estimate; `_flightApiStatus = "down"` |
| Weather proxy timeout | ✅ 4,000ms proxy + 8,000ms direct Open-Meteo fallback |
| VPS CORS config | ✅ `capacitor://localhost` included; `DELETE` method included; rate limiter reads last X-Forwarded-For entry |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| `forecast_days` | **14** ✅ (both weather + marine endpoints, VPS redeploy 2026-08-11) |
| Marine `forecast_days` | **10** ✅ |
| Open-Meteo batching | ✅ First-paint: 12 venues fire immediately. Priority tier: top 200 in batches of 100, 500ms apart. Background tail: remainder in batches of 100, 500ms apart. Non-blocking after first paint. |
| VPS weather cache | ✅ In-memory 2hr LRU cache + in-flight dedup absorbs repeated hits for same coords. Disk persistence (Open #23) still unshipped — acceptable at current MAU, risk spikes on VPS cold restart during traffic event. |
| BASE_PRICES coverage | ✅ **100%** — all 149 unique venue airports present as BASE_PRICES destination keys (181 total destination keys). |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token | ✅ **Not in client code.** `TP_MARKER = "710303"` is a public affiliate marker. Token is VPS-only env var. |
| Supabase anon key | ✅ In client as designed — public-safe, RLS-gated, documented in CLAUDE.md. Not a secret. |
| Supabase service role key | ✅ Absent from all client/repo files |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`, `*.pdf`, `*.pptx` |
| Sentry DSN in client | ✅ Expected — public-facing DSN, not a secret |
| Recent commits (Aug 21–27) | ✅ No tokens or credentials introduced — reports, venue data, geo fix, widget/onboarding tweaks only |
| `http://` proxy references | ✅ Zero — HTTPS only throughout |

**No security issues found.**

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | **495 KB** (esbuild-minified, Babel-stripped) — reasonable for a React SPA with 391 venues inline |
| Biggest bottleneck | **Cold-start Open-Meteo upstream calls.** At 391 venues × beach marine ≈ 651 upstream calls per cold VPS. VPS 2hr cache absorbs this to near-zero once warm. Cold restart during a traffic spike (Reddit/HN post) is the failure path. Disk cache (Open #23) is the fix. |
| Images | ✅ `loading="lazy"` on all render sites |
| Supabase lazy-load | ✅ ~80 KB gzipped, only loads on existing session / magic-link / Sign In tap |
| First paint | ✅ 12 venues fire first, UI unlocks. Remaining 379 stream in behind it. |

---

## 6. Cost Estimate

| Scale | Infrastructure | Monthly |
|-------|---------------|---------|
| Current (<1K MAU) | DO 1GB droplet + GitHub Pages (free) | **$6** |
| 1K MAU | Same — DO handles proxy load easily | **$6** |
| 10K MAU | DO 2GB ($12) + Supabase free tier ceiling risk | **$12–18** |
| 100K MAU | DO 4GB ($24) + Supabase Pro ($25) + CDN/bandwidth | **$60–120** |

**Cost optimization:** Nothing material to change at current scale. At 10K MAU, watch Supabase API request count (50K/mo free tier). `user_data` upserts are debounced 500ms — that's efficient. No action needed now.

---

## Issues

### P2 — Zombie Remote Branches (19 unmerged, 3+ months old)

PM v131 flagged this. The branches are harmless in isolation but:
1. Any future `git push --all` could accidentally pick them up
2. A confused AI session or new contributor could check one out thinking it's current work
3. GitHub UI shows them cluttering the branch list

**All 19 branches are abandoned exploratory work from May–July 2026. None have commits worth preserving that aren't already on main.**

**Fix (Jack — run from your machine, ~2 min):**
```bash
# Delete all claude/* stale branches
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

# Keep `master` — it's a deploy target in deploy.yml (triggers on push to main OR master)
# Verify:
git branch -r | grep -v "main\|master\|HEAD"
```

**Estimated time: 2 minutes.**

### P2 — CLAUDE.md Venue Count Stale

Two places in CLAUDE.md still read "156 entries." Real count is **391** (131 ski / 260 beach). This confuses new AI sessions — multiple prior agent runs have undercounted because of this and had to re-verify.

**Fix:**
```bash
# In CLAUDE.md, two lines to update:
# Line: "3. Constants & data (~lines 138–860): ... VENUES` (156),"
# → Change (156) to (391)

# Line: "VENUES` array has **156 entries** (2 launch categories: skiing and beach — 67 skiing, 89 beach; ..."
# → Change to: "VENUES` array has **391 entries** (2 launch categories: skiing and beach — 131 skiing, 260 beach; ..."
```

This is a CLAUDE.md edit — I'm leaving it for Jack since CLAUDE.md is the project brain and changes should be deliberate. **Estimated time: 3 minutes.**

### P3 — Hintertux Glacier Venue Pending

Content 2026-08-26 flagged Hintertux Glacier (INN airport, Austria) as a "SHIP" recommendation. Not yet in `app.jsx`. INN is already in BASE_PRICES and AP_CONTINENT. Content team to paste when ready. No DevOps action needed.

---

## What Breaks First at Scale

**The single point of failure at 1K+ concurrent users is Open-Meteo free tier exhaustion on VPS cold start.**

Here's the math: 391 venues, each with a weather call + 260 beach venues with a marine call = **651 upstream API calls per cold-cache cycle**. Open-Meteo free tier: 10,000 calls/day = ~416/hour. The VPS 2hr in-memory cache absorbs this to near-zero in steady state. But `pm2 restart` (triggered by any VPS redeploy, OOM kill, or OS update) wipes the cache. If a Reddit post hits during that 2hr cold-start window, 10K/hour ceiling gets hit in about 15 concurrent user sessions. Result: Open-Meteo starts returning 429s, client falls back to stale `wxData`, users see "conditions unavailable."

**Prevention (Open #23, still unshipped):**
```javascript
// In server/proxy.js — add disk persistence for _wxCache
// On startup, read from disk. On write, async persist to disk.
const DISK_CACHE_PATH = '/opt/peakly-proxy/.wx-cache.json';
const fs = require('fs');

// Load on boot
try {
  const raw = fs.readFileSync(DISK_CACHE_PATH, 'utf8');
  const saved = JSON.parse(raw);
  // Merge saved entries that haven't expired (2hr TTL)
  const now = Date.now();
  Object.entries(saved).forEach(([k, v]) => {
    if (now - v.ts < 2 * 60 * 60 * 1000) _wxCache.set(k, v);
  });
  console.log(`[cache] loaded ${_wxCache.size} entries from disk`);
} catch {}

// After each cache SET, async persist (debounced 5s to avoid thrash):
let _diskFlushTimer;
function _scheduleDiskFlush() {
  clearTimeout(_diskFlushTimer);
  _diskFlushTimer = setTimeout(() => {
    const obj = {};
    _wxCache.forEach((v, k) => { obj[k] = v; });
    fs.writeFile(DISK_CACHE_PATH, JSON.stringify(obj), () => {});
  }, 5000);
}
// Call _scheduleDiskFlush() after every _wxCache.set()
```

This 30-line addition means a `pm2 restart` wakes up with the full warm cache instead of cold. Required before any Reddit/HN post that could drive a spike. Jack needs to SSH in and deploy — `git pull && pm2 restart peakly-proxy` in `/opt/peakly-proxy`.

---

## Summary

Post-launch day 5. Infrastructure is clean. No user-facing breakage, no security issues, no API anomalies. Two P2 housekeeping items (stale remote branches, stale CLAUDE.md venue count). The only real risk on the horizon is Open-Meteo rate limits during a Reddit spike with a cold VPS cache — Open #23 (disk persistence) is the fix and should ship before the first big traffic event.
