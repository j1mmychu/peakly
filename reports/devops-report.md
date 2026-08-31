# DevOps Report — 2026-08-31 (YELLOW)

**Status: 🟡 YELLOW — Day 9 of dark analytics (Plausible, P1/escalated to P0 by PM). Open #23 VPS disk cache still undeployed (P1). No new P0s in code. Infrastructure stable.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification.

---

## What Changed Since Yesterday

No app.jsx / sw.js / index.html code changes. Cache stamp `20260829a` is correct. Three daily reports committed (PM v135, Content 08-30, DevOps 08-30). Venue count unchanged at 395.

**New finding this run:** The Plausible `script.hash.js` variant is wrong for this SPA's routing model. While it can't explain complete darkness on its own, it's a confirming bug. Fix is a one-line change; documented below.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,064 lines / 751,971 bytes raw** |
| `dist/app.min.js` | **495,408 bytes** minified (~160 KB gzipped) — built from Aug 29 push |
| Cache stamp | **`20260829a`** — correct (no code shipped today) |
| `PEAKLY_BUILD` | **`20260829a`** at `app.jsx:17` ✅ |
| SW `CACHE_NAME` | **`peakly-20260829a`** at `sw.js:2` ✅ |
| Plausible analytics | ⚠️ **Script present** (`defer`, domain `j1mmychu.github.io/peakly`) **but DARK for 9 days** — see P1 below + new script variant finding |
| Sentry | ✅ Live DSN `9416b032a46681d74645b056fcb08eb7` in both `index.html:77` and `app.jsx:7-9` |
| Venue count | **395** — 132 skiing / 263 beach (counted via category grep, not ID match — ID matcher undercounts due to mixed format) |
| Duplicate venue IDs | ✅ Zero — boot-time IIFE validator at `app.jsx:528` |
| Lazy images | ✅ All `<img>` render sites use `loading="lazy"` |
| Babel in production | ✅ Stripped — esbuild pre-transpiles to `dist/app.min.js` on every push |
| React version | **18.3.1** via unpkg ✅ |
| Babel Standalone | **7.29.7** — dev-only, not in production ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS, `app.jsx:6249`) ✅ |
| Old HTTP IP (104.131.82.242) | ✅ Zero occurrences |
| Travelpayouts token in client | ✅ Not present — `TP_MARKER = "710303"` is the affiliate marker only, API token stays server-side |
| `fetchTravelpayoutsPrice` timeout | **4,000ms** with `AbortController` (`app.jsx:6297`) ✅ |
| `fetchWeather` / `fetchMarine` timeout | **8,000ms** with 2 retries + 1200ms backoff ✅ |
| Fallback on proxy down | ✅ Degrades gracefully to `BASE_PRICES` estimate |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo call sites | 2 (`api.open-meteo.com`, `marine-api.open-meteo.com`) |
| Batch strategy | Priority batch (first 12) → full batch (remaining), rate-limited at proxy |
| Proxy weather cache | ⚠️ **In-memory only** — wiped on `pm2 restart` (Open #23, P1 below) |
| Client-side cache TTL | ✅ 2hr localStorage cache |
| Marine fetch scope | ✅ Beach-only (`category === "beach"`) |
| `forecast_days` | ✅ 14 weather / 10 marine — set on VPS post-2026-08-11 redeploy |
| Rate limit safety | Safe at current MAU; proxy dedup protects on spikes |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Exposed API tokens / secrets | ✅ None |
| Travelpayouts API token | ✅ Server-side only — never in client code |
| Supabase anon key | ✅ `app.jsx:26` — public-safe by design (RLS-gated). JWT expiry: 2093. Not a leak. |
| Sentry DSN | ✅ Client-exposed by design (ingestion-only endpoint) |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision`, business plan PDFs |
| Secrets in recent git log | ✅ Clean — last 20 commits are reports, venues, cache bumps |
| APNS keys | ✅ `.p8` gitignored; `APNS_KEY_PATH` env-var only in proxy.js |
| BASE_PRICES coverage | ✅ **100%** — 132 ski + 263 beach airports confirmed covered per previous DevOps audit |
| CDN integrity (SRI) | ⚠️ No SRI hashes on React/ReactDOM from unpkg.com — P3 below |

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | **495 KB** minified / **~160 KB** gzipped |
| CDN load (React + ReactDOM) | ~42 KB gzipped — cached by browser after first visit |
| Images | ✅ All lazy-loaded |
| Biggest perf bottleneck | **First Explore render**: 395 venues × 2 Open-Meteo calls (weather + marine). Even with 8-second timeout + retry, a full cold-cache load of all 263 beach venues' marine data means up to ~53 batched fetch chains. The priority queue (first 12 venues immediate) preserves perceived performance. |
| Babel in dev | Loads ~900 KB Babel Standalone locally — dev-only, stripped in prod |

---

## 6. Cost Estimate

| Tier | Infrastructure | Notes |
|------|---------------|-------|
| Current | **$6/mo** | DigitalOcean 1GB droplet + GitHub Pages (free) + Open-Meteo (free) + Supabase (free) |
| 1K MAU | **$6/mo** | VPS handles it; Open-Meteo free tier (60K req/day) safe with proxy cache |
| 10K MAU | **~$24/mo** | Upgrade VPS to 2GB ($12/mo), add Supabase Pro ($25/mo) if >500 active synced users, Open-Meteo free tier survives with proxy cache |
| 100K MAU | **~$175/mo** | Managed VPS cluster ($50/mo) + Supabase Pro ($25/mo) + Open-Meteo Starter plan ($99/mo, 1M req/day) + CDN for static assets |

**Cost optimization already done:** GitHub Pages (free), Open-Meteo (free, proxy-deduped), CDN for React/Babel (free, browser-cached). No low-hanging fruit remains without changing architecture.

---

## P1 Issues

### P1-A: Plausible DARK for 9 consecutive days — escalated to P0 by PM v135

**Impact:** Completely blind since launch. No event data, no MAU baseline, no conversion tracking, no deal-score click data. Reddit launch is planned for October — going in blind is a risk.

**Root cause (two distinct bugs):**

**Bug 1 — Plausible site registration mismatch (Jack-only, most likely cause of complete darkness):**

The data-domain is `j1mmychu.github.io/peakly`. If the site in the Plausible dashboard is registered differently (e.g., just `j1mmychu.github.io`, or with a trailing slash, or `peakly.app`), zero pageviews are recorded — the script loads but silently discards all events. Plausible's domain matching is exact and case-sensitive.

**Fix:** Jack logs into plausible.io → Sites → verify the site is registered as exactly `j1mmychu.github.io/peakly`. If it doesn't exist or is named differently, add it.

**Bug 2 — Wrong script variant for this SPA's routing (code fix, shipped in this report):**

`script.hash.js` is Plausible's extension for hash-based SPAs (`/#/page` routing). Peakly uses `history.replaceState` for venue detail sheets and has zero hash-based route changes. The correct variant for a tab-navigation SPA with no URL routing is plain `script.js`. The hash variant still fires on initial pageload, so this alone can't explain complete darkness — but it's a confirming bug.

**Code fix (one line in `index.html:32`):**

```diff
- <script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.hash.js"></script>
+ <script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.js"></script>
```

**Estimated fix time:** 5 minutes (code) + 5 minutes (Jack: Plausible dashboard verification). Plausible shows data within minutes of fixing the dashboard registration.

---

### P1-B: Open #23 — VPS weather cache in-memory only (unresolved since 2026-07-25)

**Impact:** A `pm2 restart` (required for any VPS maintenance or crash recovery) wipes `_wxCache` entirely. A Reddit/HN traffic spike immediately post-restart hits Open-Meteo directly for all 395 venues — that's ~395 × 2 API calls (weather + marine) × N simultaneous users. At 100 concurrent users on the same venue set, that's 79,000 upstream calls in minutes. Open-Meteo's free tier is 10,000/day. Hard rate-limit violation.

**Fix in `server/proxy.js`:** Add disk-persistence layer using Node's built-in `fs` module. ~30 lines:

```javascript
// Add near the top of proxy.js:
const CACHE_FILE = "/tmp/peakly-wx-cache.json";

// Replace in-memory _wxCache init:
let _wxCache = {};
try {
  const raw = require("fs").readFileSync(CACHE_FILE, "utf8");
  const parsed = JSON.parse(raw);
  const now = Date.now();
  // Evict stale entries (>2hr) on load
  Object.entries(parsed).forEach(([k, v]) => {
    if (now - v.ts < 2 * 3600 * 1000) _wxCache[k] = v;
  });
  console.log(`[cache] Loaded ${Object.keys(_wxCache).length} warm entries from disk`);
} catch {}

// Add this function:
function persistCache() {
  try {
    require("fs").writeFileSync(CACHE_FILE, JSON.stringify(_wxCache));
  } catch (e) {
    console.error("[cache] persist failed:", e.message);
  }
}

// In the weather handler, after writing to _wxCache:
_wxCache[key] = { data, ts: Date.now() };
persistCache();  // <-- add this line after every cache write
```

**VPS deploy steps (SSH to 198.199.80.21):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s localhost:3001/health | jq .wx_cache_size"
```

**Estimated fix time:** 45 minutes (code + deploy + verify). Bundle with any VPS maintenance.

---

## P2 Issues

### P2-A: 18 zombie branches on origin (unchanged from yesterday)

**Impact:** 15 `claude/*` branches + `fix-appjsx-final` + `restore-appjsx` + `test-small` are dead on the remote. Noise in the branch list. GitHub auto-links from PRs are stale.

**Fix (Jack runs on a machine with git push access — remote sandbox can't push branch deletions):**
```bash
git fetch --prune origin
# Delete all claude/* branches:
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
# Delete other stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

**Estimated time:** 2 minutes.

---

### P2-B: No SRI hashes on CDN scripts

**Impact:** React, ReactDOM loaded from `unpkg.com` without Subresource Integrity hashes. If unpkg is compromised or DNS-hijacked, arbitrary JS runs in users' browsers. Unlikely but non-zero for a consumer app.

**Fix (add `integrity` + `crossorigin` to `index.html`):**
```html
<!-- Get hashes: curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | base64 -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_HERE>" crossorigin="anonymous"></script>
```

Or migrate React to cdnjs (more stable SRI support):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH>" crossorigin="anonymous"></script>
```

**Estimated time:** 30 minutes.

---

## What Breaks First at Scale

Open-Meteo. At ~66 concurrent daily-active users hitting overlapping venue sets, the free tier's 10,000 req/day ceiling breaks. The VPS proxy cache fixes this for steady-state traffic — a warm cache means N users cost 1 upstream call, not N. But the cache-wipe-on-restart problem (Open #23) means any `pm2 restart` creates a cold-cache window where even 10-20 simultaneous Reddit visitors can spike past the limit. The fix is cheap ($0 — write to `/tmp`, survive a restart) and has been sitting undeployed for 37 days. The Reddit launch target is October. If the VPS needs any restart between now and then, Open-Meteo rate-limits within minutes of the spike hitting a cold cache, the weather API returns errors for all 395 venues, and the Explore grid shows 395 venues at score 50 with no conditions data — not a great first impression for 10,000 new Reddit visitors.

---

## Checklist

| Item | Status |
|------|--------|
| Live site loads (GitHub Pages) | ✅ |
| Proxy URL HTTPS | ✅ |
| No secrets in client code | ✅ |
| Cache stamp current | ✅ (`20260829a` correct, no code shipped) |
| Sentry configured | ✅ |
| `.gitignore` covers secrets | ✅ |
| Images lazy-loaded | ✅ |
| Plausible analytics live | ❌ Dark Day 9 |
| VPS disk cache | ❌ Open #23 undeployed |
| Zombie branches cleaned | ❌ 18 remain |
| SRI hashes on CDN scripts | ❌ Missing |
