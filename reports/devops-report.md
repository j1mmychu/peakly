# DevOps Report — 2026-09-01 (YELLOW)

**Status: 🟡 YELLOW — Plausible fix shipped Aug 31 (Day 10 dark, now recovering). Open #23 VPS disk cache undeployed (P1, Day 38). Cache stamp stale by 3 days (P2, auto-push lockstep bypassed). No new P0s. Infrastructure stable.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification.

---

## What Changed Since Yesterday

- **Plausible script variant fix SHIPPED** (commit `20c8e82`, 2026-08-31 16:08 UTC) — `script.hash.js` → `script.js` in `index.html`. Network-first SW strategy means all visitors get the correct variant immediately. Analytics should be live as of Aug 31.
- **10 new commits pulled** since last devops run — 3 daily reports (PM v136, Content 08-31, DevOps 08-31) + venue commits. No code shipped to app.jsx or sw.js today.
- **19 zombie branches** — up from 18 (15 `claude/*` + `fix-appjsx-final` + `restore-appjsx` + `test-small` + `master`). One new branch added.
- **Cache stamp `20260829a`** — 3 days old, correct for no-code-shipped days but the Aug 31 index.html change should have bumped it (auto-push lockstep guard bypassed by remote agent commit).

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,064 lines / 751,971 bytes raw** (unchanged) |
| `dist/app.min.js` | **~495 KB** minified / ~160 KB gzipped — built from Aug 29 push |
| Cache stamp | **`20260829a`** — 3 days stale; index.html was modified Aug 31 without a bump (P2) |
| `PEAKLY_BUILD` | **`20260829a`** at `app.jsx:17` |
| SW `CACHE_NAME` | **`peakly-20260829a`** at `sw.js:2` |
| Plausible analytics | ⚠️ **Fix SHIPPED Aug 31** — `script.js` (correct variant, `index.html:32`). Was `script.hash.js` (wrong variant) for 9 days. Plausible should now record pageviews. Still need Jack to verify domain registration in Plausible dashboard matches exactly `j1mmychu.github.io/peakly`. |
| Sentry | ✅ Live DSN `9416b032a46681d74645b056fcb08eb7` in `index.html` and `app.jsx:7-9` |
| Venue count | **395** ✅ — 132 skiing / 263 beach (eval-counted, not grep) |
| Duplicate venue IDs | ✅ Zero — boot-time IIFE validator at `app.jsx:528` |
| Lazy images | ✅ All card/sheet image render sites use `loading="lazy"` |
| Babel in production | ✅ Stripped — esbuild pre-transpiles to `dist/app.min.js` on every push via `deploy.yml` |
| React version | **18.3.1** via unpkg ✅ |
| Babel Standalone | **7.29.7** — dev-only, not in production ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS, `app.jsx:6249`) ✅ |
| Old HTTP IP (104.131.82.242) | ✅ Zero occurrences |
| Travelpayouts token in client | ✅ Not present — `TP_MARKER = "710303"` is affiliate marker only; API token stays server-side in `server/setup-token.sh` |
| `fetchTravelpayoutsPrice` timeout | **4,000ms** with `AbortController` (`app.jsx:6297`) ✅ |
| `fetchWeather` / `fetchMarine` timeout | **8,000ms** with 2 retries + 1200ms backoff ✅ |
| Fallback on proxy down | ✅ Degrades gracefully to `BASE_PRICES` estimate |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo call sites | 2 (`api.open-meteo.com/v1`, `marine-api.open-meteo.com/v1`) |
| Batch strategy | Priority batch (first 12 venues) → full batch remaining, rate-limited |
| Proxy weather cache | ⚠️ **In-memory only** — wiped on `pm2 restart` (Open #23, P1 below) |
| Client-side cache TTL | ✅ 2hr localStorage cache per venue coord |
| Marine fetch scope | ✅ Beach-only (`category === "beach"`) |
| `forecast_days` | ✅ 14 weather / 10 marine — set on VPS post-2026-08-11 redeploy |
| Rate limit safety | Safe at current MAU; proxy dedup protects during spikes on a warm cache |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Exposed API tokens / secrets | ✅ None |
| Travelpayouts API token | ✅ Server-side only — never in client code |
| Supabase anon key | ✅ `app.jsx:26` — public-safe by design (RLS-gated, ingestion-only scope). JWT expiry: 2093. |
| Sentry DSN | ✅ Client-exposed by design (error ingestion endpoint only) |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision`, business plan PDFs |
| Secrets in recent git log | ✅ Clean — 10 newest commits are reports, venue data, cache bumps |
| APNS keys | ✅ `.p8` gitignored; `APNS_KEY_PATH` env-var only in `proxy.js` |
| CDN integrity (SRI) | ⚠️ No SRI on React/ReactDOM from unpkg.com — P3 below |

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | **~495 KB** minified / **~160 KB** gzipped |
| CDN load (React + ReactDOM) | ~42 KB gzipped — cached by browser after first visit |
| Images | ✅ All lazy-loaded |
| Biggest perf bottleneck | **First Explore render cold cache**: 395 venues × 2 Open-Meteo calls. Priority queue (first 12 immediate) preserves perceived performance. Real risk is post-restart VPS cold cache — see P1-A. |
| Babel in dev | Loads ~900 KB locally — dev-only, stripped in prod |

---

## 6. Cost Estimate

| Tier | Infrastructure | Notes |
|------|---------------|-------|
| Current | **$6/mo** | DigitalOcean 1GB droplet + GitHub Pages (free) + Open-Meteo (free) + Supabase (free) |
| 1K MAU | **$6/mo** | VPS handles it; Open-Meteo free tier (10K req/day) safe with warm proxy cache |
| 10K MAU | **~$24/mo** | Upgrade VPS to 2GB ($12/mo), Supabase Pro ($25/mo) if >500 active synced users |
| 100K MAU | **~$175/mo** | Managed VPS cluster ($50/mo) + Supabase Pro ($25/mo) + Open-Meteo Starter ($99/mo, 1M req/day) |

---

## P1 Issues

### P1-A: Open #23 — VPS weather cache in-memory only (Day 38 unresolved)

**Impact:** Any `pm2 restart` wipes `_wxCache`. A cold-cache Reddit spike (October target) triggers up to 395 × 2 = 790 Open-Meteo upstream calls times N simultaneous users. Free tier cap is 10,000/day. 13 concurrent users on different venues blows through it in under a minute. The fix has been documented and ready for 38 days. The Reddit launch date is locked (October 11). Deploy this before then.

**Fix (add to `server/proxy.js`):**

```javascript
// Near top of proxy.js — disk persistence for _wxCache
const CACHE_FILE = "/tmp/peakly-wx-cache.json";

// Replace: let _wxCache = {};
let _wxCache = {};
try {
  const raw = require("fs").readFileSync(CACHE_FILE, "utf8");
  const parsed = JSON.parse(raw);
  const now = Date.now();
  Object.entries(parsed).forEach(([k, v]) => {
    if (now - v.ts < 2 * 3600 * 1000) _wxCache[k] = v;
  });
  console.log(`[cache] Loaded ${Object.keys(_wxCache).length} warm entries from disk`);
} catch {}

function persistCache() {
  try {
    require("fs").writeFileSync(CACHE_FILE, JSON.stringify(_wxCache));
  } catch (e) { console.error("[cache] persist failed:", e.message); }
}

// After every _wxCache write: call persistCache()
// e.g.: _wxCache[key] = { data, ts: Date.now() }; persistCache();
```

**Deploy (SSH to 198.199.80.21):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health | jq .wx_cache_size"
```

**Estimated time:** 45 minutes (code + deploy + verify).

---

### P1-B: Plausible dashboard verification still needed (Jack action)

**What shipped (Aug 31):** The wrong script variant (`script.hash.js`) was replaced with `script.js`. Network-first SW strategy means all users get the fix immediately — no forced hard refresh needed.

**What's still needed:** Jack must log into `plausible.io` and confirm the site is registered as **exactly** `j1mmychu.github.io/peakly` (case-sensitive, no trailing slash). If the domain is mismatched or the site doesn't exist, pageviews are silently discarded regardless of which script variant is loaded. This is the most likely cause of the 9-day dark period.

**Estimated time:** 5 minutes.

---

## P2 Issues

### P2-A: Cache stamp stale — index.html modified without lockstep bump

**What happened:** Commit `20c8e82` (Aug 31 PM agent) changed `index.html` (Plausible variant fix) without bumping `PEAKLY_BUILD` / `CACHE_NAME` / `app.jsx?v=` query string. The auto-push lockstep guard was bypassed because this commit came from a remote agent session that doesn't run the local hook.

**Real-world impact: LOW** — index.html is served network-first by the SW, so users get the updated HTML regardless. `app.jsx` wasn't changed so the stale `?v=` param isn't wrong.

**But the invariant is broken.** The lockstep guard exists so diffs stay auditable and cache invalidation is predictable. Next time this matters, someone will spend an hour debugging "why isn't my change live?"

**Fix — bump the stamp today since code IS changing (this report commit):**

The invariant says: any commit touching `app.jsx`, `sw.js`, or `index.html` must bump all three stamps in lockstep. The Plausible commit violated this. Fix it now to restore the invariant. Bump to `20260901a`.

**Changes needed:**
1. `app.jsx:17`: `const PEAKLY_BUILD = "20260901a";`
2. `sw.js:2`: `const CACHE_NAME = "peakly-20260901a";`
3. `index.html`: `<script type="text/babel" src="./app.jsx?v=20260901a" data-presets="react"></script>`

Estimated time: 2 minutes.

---

### P2-B: 19 zombie branches on origin (up from 18)

A new branch appeared (`master` — old default branch). 15 `claude/*` + 4 others (`fix-appjsx-final`, `restore-appjsx`, `test-small`, `master`) are dead weight.

**Fix (run from a machine with push access — remote sandbox can't delete remote branches):**
```bash
# Delete all claude/* branches
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
# Delete other stale branches
git push origin --delete fix-appjsx-final restore-appjsx test-small master
```

**Note on `master`:** Before deleting, confirm `master` doesn't have divergent commits vs `main`:
```bash
git log origin/master..origin/main --oneline | wc -l
git log origin/main..origin/master --oneline | wc -l
```
If both are 0, safe to delete.

**Estimated time:** 5 minutes.

---

### P2-C: No SRI hashes on CDN scripts (unchanged from prior reports)

React 18.3.1 and ReactDOM loaded from `unpkg.com` without Subresource Integrity. Low probability, non-zero impact if CDN is compromised.

**Fix:** Generate hashes and add `integrity` attributes, or migrate to cdnjs:
```bash
# Get hashes for React and ReactDOM
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```
Then add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag.

**Estimated time:** 30 minutes.

---

## Checklist

| Item | Status |
|------|--------|
| Live site loads (GitHub Pages) | ✅ |
| Proxy URL HTTPS | ✅ |
| No secrets in client code | ✅ |
| Sentry configured | ✅ Live DSN in both index.html and app.jsx |
| `.gitignore` covers secrets | ✅ |
| Images lazy-loaded | ✅ |
| Plausible script variant | ✅ Fixed Aug 31 (`script.js`) |
| Plausible dashboard registration | ❓ Jack must verify in plausible.io |
| Cache stamp lockstep | ⚠️ Stamp `20260829a` stale — index.html changed Aug 31 without bump |
| VPS disk cache (Open #23) | ❌ Undeployed — Day 38 |
| Zombie branches | ❌ 19 on origin |
| SRI hashes on CDN scripts | ❌ Missing |

---

## What Breaks First at Scale

Same answer as last 38 days: **Open-Meteo on a cold VPS cache**. At ~13 concurrent users hitting different uncached venues post-`pm2 restart`, the free tier's 10,000 req/day ceiling breaks within minutes. This is not a hypothetical — any VPS restart (crash, maintenance, OS update) triggers it. October 11 Reddit launch is 40 days away. The fix is ~30 lines of Node.js `fs.writeFileSync`. It has been documented and ready since 2026-07-25. If this fires on Reddit launch day, 10,000+ visitors see a grid of 395 venues with no weather data, score 50, and no conditions — exactly what the "conditions unavailable" banner covers but it's not a great first impression for a product whose pitch is "live weekend conditions." Deploy it.
