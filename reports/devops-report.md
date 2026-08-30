# DevOps Report — 2026-08-30 (YELLOW)

**Status: 🟡 YELLOW — Day 8 post-launch. No P0. Two P1s both Jack-only: Plausible dark for 8 consecutive days (no analytics data since launch), and Open #23 VPS disk cache still undeployed. Infrastructure otherwise healthy. 18 stale remote branches remain (P2, 30-second fix).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block; not a VPS outage). Last confirmed healthy: 2026-08-11 post-redeploy. Treating as healthy per prior verification.

---

## What Changed Since Yesterday

No app.jsx / sw.js / index.html changes — no venues shipped, no cache bump needed. Cache stamp `20260829a` is correct: it reflects the last build, not the calendar date.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,064 lines / ~752 KB raw** — unchanged from yesterday |
| `dist/app.min.js` | **495 KB** minified (~160 KB gzipped) — built from Aug 29 push |
| Cache stamp | **`20260829a`** — correct, no files changed today |
| `PEAKLY_BUILD` | **`20260829a`** at `app.jsx:17` ✅ |
| SW `CACHE_NAME` | **`peakly-20260829a`** at `sw.js:2` ✅ |
| Plausible analytics | ⚠️ **Script present** (`index.html:32`, `defer`, domain `j1mmychu.github.io/peakly`) **but dark for 8 days** — see P1 below |
| Sentry | ✅ Live DSN `9416b032a46681d74645b056fcb08eb7` in both `index.html:77` and `app.jsx:7` |
| Venue count (authoritative) | **395** — 132 skiing / 263 beach. Category-aware counter confirms. `.venue-baseline` accurate. |
| Bracket-walker count | 397 — overcounts by 2 (2 nested `{}` objects inside some venue property values confuse the walker). **Category-aware count 395 is ground truth.** |
| Duplicate venue IDs | ✅ Zero — boot-time IIFE validator at `app.jsx:528` |
| Lazy images | ✅ All 9 `<img>` render sites use `loading="lazy"` |
| Babel in production | ✅ Stripped — esbuild pre-transpiles to `dist/app.min.js` on every push |
| React | **18.3.1** ✅ |
| Babel Standalone | **7.29.7** — dev-only, not in production ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS, `app.jsx:6249`) ✅ |
| Old HTTP IPs | ✅ Zero — `grep 104.131.82.242` → no results |
| Travelpayouts token in client | ✅ **Not present** — `TP_MARKER = "710303"` is only the affiliate marker, never the API token |
| `fetchTravelpayoutsPrice` timeout | **4,000ms** with `AbortController` ✅ |
| Fallback on proxy down | ✅ Degrades gracefully to `BASE_PRICES` estimate |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo call sites | 2 (`api.open-meteo.com`, `marine-api.open-meteo.com`) |
| Batch strategy | First-paint 12 venues → priority 200 → remaining, batched 100/500ms |
| Proxy cache (VPS) | ⚠️ **In-memory only** — Open #23, P1 below |
| Rate limit safety | ✅ Proxy dedup + 2hr client cache — safe at current MAU |
| Marine fetch scope | ✅ Beach-only (`needsMarine = category === "beach"`) |
| `forecast_days` | ✅ 14 (weather), 10 (marine) — configured on VPS post-2026-08-11 |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Exposed API tokens | ✅ None found |
| Travelpayouts API token | ✅ Server-side only |
| Supabase anon key | ✅ `app.jsx:26` — public-safe by design, RLS-gated. Not a leak. |
| Sentry DSN | ✅ Client-exposed by design (ingestion endpoint, not auth token) |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| Secrets in recent git history | ✅ Clean — last 20 commits are reports, venue additions, cache bumps |
| APNS keys | ✅ `.p8` in `.gitignore`, `APNS_KEY_PATH` env-var only in proxy.js |
| BASE_PRICES coverage | ✅ **100% covered** — 181 unique dest airports in BASE_PRICES, 162 unique venue APs, 0 missing |

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | **495 KB** minified / **~160 KB** gzipped — healthy for a content-heavy PWA |
| Dev bundle (unpkg Babel) | **~900 KB** — dev-only, not loaded from `dist/` |
| React + ReactDOM | ~130 KB gzipped, pinned 18.3.1 ✅ |
| Biggest perf bottleneck | 752 KB single-file `app.jsx` in dev; 495 KB minified in prod. Acceptable. |
| Image lazy loading | ✅ All 9 card `<img>` sites use `loading="lazy"` |
| CDN source | unpkg.com — functional but less reliable than cdnjs under load (P3) |
| SRI on CDN scripts | ❌ No Subresource Integrity (Open #10, known, P3) |

---

## 6. Cost Estimate

| MAU | Open-Meteo | DigitalOcean VPS | GitHub Pages | Total/mo |
|-----|-----------|-----------------|--------------|----------|
| Current (<50) | Free | $6 | Free | **~$6** |
| 1K MAU | Free | $6 | Free | **~$6** |
| 10K MAU | ⚠️ Risk zone — proxy cache mitigates burst | $6–12 | Free | **~$12–18** |
| 100K MAU | 🔴 Need paid Open-Meteo (~$20/mo) | $24+ | CDN upgrade | **~$50–100** |

---

## Issues by Priority

### P1 — Fix Before Reddit Post (Both Jack-Only)

---

**PLAUSIBLE DARK — Day 8 (First P1 to resolve)**

Script is correctly installed and uncommented:
```html
<!-- index.html:32 -->
<script defer data-domain="j1mmychu.github.io/peakly"
  src="https://plausible.io/js/script.hash.js"></script>
```

8 days of launch traffic and zero events recorded in the dashboard is a misconfiguration, not a script failure. Two most likely causes:

**Cause A (most likely): Domain not added to Plausible account.**
Fix:
1. Log into [plausible.io](https://plausible.io) → Sites
2. Check if `j1mmychu.github.io/peakly` is listed
3. If not: Add Site → enter `j1mmychu.github.io/peakly`
4. Verify the script snippet in your dashboard matches `index.html:32` exactly

**Cause B: Domain registered as `j1mmychu.github.io` (no subdirectory) but `data-domain` says `j1mmychu.github.io/peakly`.**
These must match exactly. If your Plausible account has `j1mmychu.github.io`, update `index.html:32`:
```html
<!-- Change this: -->
data-domain="j1mmychu.github.io/peakly"
<!-- To this (matches the Plausible site entry): -->
data-domain="j1mmychu.github.io"
```
Then bump cache stamp and push. The `script.hash.js` variant correctly handles SPA hash routing either way.

**Impact of staying dark:** Every user who has visited since launch day (Aug 22) is invisible. No bounce rate data, no conversion funnel, no airport distribution, no book_click or onboarding events. This makes the Reddit post a blind shot — you won't know if it worked until you look at GitHub Pages traffic, which shows requests not behavior. **Time to fix: 5 minutes.**

---

**Open #23: VPS Weather Cache In-Memory Only**

Unchanged from 2026-08-24. If VPS restarts for any reason (update, OOM, anything), `_wxCache` wipes to zero. A Reddit spike into a cold cache = 395 simultaneous Open-Meteo calls = 429 wall = every new visitor sees "conditions unavailable" = post buried.

Exact patch (add to `server/proxy.js` after the `_wxCache` declaration):

```javascript
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '.wx-cache.json');

function loadCacheFromDisk() {
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const saved = JSON.parse(raw);
    const now = Date.now();
    let loaded = 0;
    for (const [key, val] of Object.entries(saved)) {
      if (val.ts && now - val.ts < 2 * 3600 * 1000) {
        _wxCache.set(key, val);
        loaded++;
      }
    }
    console.log(`[cache] Loaded ${loaded} warm entries from disk`);
  } catch (_) { /* cold start — no file yet */ }
}

function saveCacheToDisk() {
  const obj = {};
  for (const [k, v] of _wxCache.entries()) obj[k] = v;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), 'utf8');
}

loadCacheFromDisk();
setInterval(saveCacheToDisk, 5 * 60 * 1000); // flush every 5 min
```

Deploy command:
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# paste the block above after the _wxCache = new LRU(...) line
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
# wx_cache_size: 0 on first start; check again after a few traffic hits
```

**Time to fix: 15 min.** Blocks Reddit post from triggering an outage.

---

### P2 — Fix This Week (Jack-Only)

**18 Zombie Remote Branches**

15 `claude/*` branches + 3 named branches (`fix-appjsx-final`, `restore-appjsx`, `test-small`). Same as yesterday.

⚠️ **The 3 named branches are ahead of main with May 2026 commits** — they contain data-quality fixes (IATA codes, Chamonix dup) from before the full venue audit was completed. These changes were superseded months ago. Risk: an accidental merge would overwrite ~3 months of venue additions (392 → 132 ski venues). Delete them.

```bash
# Delete all 15 claude/* branches:
git fetch --prune
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | \
  xargs -I{} git push origin --delete {}

# Delete the 3 named stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

**Time: 2 min.**

---

### P3 — Nice to Have

**CDN: Move React/ReactDOM from unpkg to cdnjs**

unpkg has had availability incidents. cdnjs.cloudflare.com is more reliable under Reddit-spike load.

```html
<!-- Replace in index.html: -->
<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
```

Babel Standalone stays on unpkg (dev-only, not in production dist — zero user impact). **Time: 5 min.**

**SRI Hashes on CDN Scripts (React/ReactDOM only)**

No Subresource Integrity on CDN loads. Apply to React + ReactDOM only — NOT Babel Standalone (SRI blocks Babel's inline `type="text/babel"` eval).

```bash
# Generate hashes:
curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | base64
curl -s https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | base64
# Then add integrity="sha384-<hash>" crossorigin="anonymous" to each script tag
```

**Time: 20 min.**

---

## Scale Failure Analysis

**What breaks first at a Reddit spike:**

GitHub Pages (static CDN) handles arbitrary concurrent load — it's not the constraint. The VPS weather proxy is. Failure chain at a 200-500 concurrent user spike: if `_wxCache` is cold (fresh `pm2 restart`), every user triggers parallel Open-Meteo calls for their visible venues. At 66+ concurrent DAU hitting the same uncached coordinate set, Open-Meteo's free tier rate-limits (429). Every new visitor gets "conditions unavailable." The post gets downvoted as "app doesn't work." Open #23's disk persistence patch breaks this chain entirely — a warm cache survives restarts. At 10K MAU, disk cache + normal VPS uptime is sufficient with no infra changes. At 100K MAU, upgrade to Open-Meteo paid tier (~$20/mo) and Redis instead of the in-memory LRU. The 15-minute patch today buys all runway between 0 and 10K MAU.

---

## Venue Count Summary

| Category | Count | Verified |
|----------|-------|---------|
| Skiing | 132 | ✅ |
| Beach | 263 | ✅ |
| **Total** | **395** | **category-aware counter** |

Bracket-walker (397) overcounts by 2 due to nested `{}` in venue property values — known artifact, not new venues. Category-aware count is ground truth. `.venue-baseline` (395) is accurate.
