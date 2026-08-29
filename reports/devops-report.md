# DevOps Report — 2026-08-29 (GREEN)

**Status: 🟢 GREEN — Day 7 post-launch. No P0/P1. Three carry-over venues shipped this run (Praia do Camilo, Nusa Penida, Gili Trawangan). Cache bumped to `20260829a`. One persistent P1 (VPS disk cache) remains Jack-only. 15 zombie branches still need a 30-second delete.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (documented sandbox egress block; not a VPS outage). Last confirmed healthy: 2026-08-11 post-redeploy. PM v133 treats it as healthy. Same assumption here.

---

## Fixes Shipped This Run

### ✅ 3 Carry-Over Beach Venues Pasted (Day 5 → DONE)

PM v133 called SHIP on these. Day 5 was the last viable day for peak-season relevance. Done.

**Praia do Camilo** (`praia-camilo-lagos`, FAO, Algarve, Portugal):
- Top-ranked sea-stack cove on the Western Algarve. Rating 4.89/5, 2340 reviews.
- FAO verified: AP_CONTINENT (europe ✅), BASE_PRICES ✅, AIRPORT_COORDS ✅

**Nusa Penida** (`nusa-penida-bali`, DPS, Indonesia):
- Kelingking Cliff / T-Rex Bay island. Distinct from existing `beach_nusapenida` (Kelingking Secret Beach — a specific beach on the island). Fills the island-destination angle.
- DPS verified: AP_CONTINENT (asia ✅), BASE_PRICES ✅, AIRPORT_COORDS ✅

**Gili Trawangan** (`gili-trawangan`, DPS, West Lombok):
- No-cars island with turtle snorkeling. Different vibe from the Bali cluster; fills the Lombok/party-island niche.
- DPS same verification above ✅

**Arolla deferred** — ski season starts December. PM call (v133): defer to next ski season paste batch. Correct.

### ✅ Cache Stamp Bumped `20260828a` → `20260829a`

Three-file lockstep:
- `app.jsx:17` — `const PEAKLY_BUILD = "20260829a"`
- `sw.js:2` — `const CACHE_NAME = "peakly-20260829a"`
- `index.html:395` — `src="./app.jsx?v=20260829a"`

### ✅ `.venue-baseline` Updated 392 → 395

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,065 lines / ~751 KB raw** (+25 lines for 3 venues) |
| `dist/app.min.js` | **495 KB** minified (CI rebuilds on this push) |
| Cache stamp | **`20260829a`** — bumped this run, lockstep ✅ |
| `PEAKLY_BUILD` | **`20260829a`** ✅ |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` — script present, uncommented |
| Sentry | ✅ Live DSN `9416b032a46681d74645b056fcb08eb7` in `index.html:77` + `app.jsx:7` |
| Venue count | **395** (132 skiing / 263 beach) — +3 beach venues this run ✅ |
| Venue eval (authoritative) | **395** — bracket-walker gives 398 (counts nested `{}`); eval() is the ground truth |
| Duplicate venue IDs | ✅ Zero — boot-time IIFE validator at `app.jsx:528` catches dups on every load |
| Lazy images | ✅ All 9 `<img>` render sites use `loading="lazy"` |
| Babel in production | ✅ Stripped — CI builds `dist/app.min.js` via esbuild on every push to main |
| React | **18.3.1** — current stable ✅ |
| Babel Standalone | **7.29.7** — dev-only (index.html), not loaded in production dist ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| Old HTTP IPs (`104.131.82.242`, `198.199.80.21`) | ✅ Zero client-side references |
| Travelpayouts token in client | ✅ **Not present** — `TP_MARKER = "710303"` is only the affiliate marker ID, not the API token. Token stays server-side only. |
| `fetchTravelpayoutsPrice` timeout | **4,000ms** with `AbortController` at `app.jsx:6273` ✅ |
| Fallback on proxy down | ✅ Degrades gracefully to `BASE_PRICES` estimate; `_flightApiStatus = "down"` |
| Weather proxy timeout | ✅ 4s proxy + 8s direct Open-Meteo fallback |
| VPS CORS (last confirmed config) | `capacitor://localhost` ✅, `DELETE` method ✅, correct X-Forwarded-For ✅ |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo direct fetch sites | **2** call sites in app.jsx (`api.open-meteo.com`, `marine-api.open-meteo.com`) |
| Rate limit exposure | Batched 50 venues per 2s via `fetchAllWeather`; proxy cache handles Reddit-spike deduplication |
| VPS in-memory cache | ⚠️ **Open #23 — in-memory only, wiped on `pm2 restart`** (see P1 below) |
| Marine fetch scope | ✅ Beach-only (`category === "beach"`) — confirmed in `needsMarine` logic |
| Weather cache TTL | ✅ 2hr localStorage TTL in client, 2hr server-side LRU |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Exposed API tokens | ✅ **None found** |
| Travelpayouts API token | ✅ Server-side only — `TP_MARKER = "710303"` is just the marker/affiliate tag |
| Supabase anon key | ✅ In `app.jsx:26` — documented as "public-safe, RLS-gated" per CLAUDE.md. Anon key is design-intentional for client-side Supabase (restricts to RLS-enforced read/write only). Not a leak. |
| Sentry DSN | ✅ In `app.jsx:8` + `index.html:77` — Sentry DSNs are always client-exposed by design (they're data-ingestion endpoints, not auth tokens) |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision`, `node_modules/`, `dist/` |
| Secrets in recent git history (7 days) | ✅ No secrets found — commits are report files and venue/cache updates only |
| APNS keys | ✅ `.p8` files in `.gitignore`; `APNS_KEY_PATH` is env-var only in proxy.js |

**One note on `nusa-penida-bali` and `beach_nusapenida` coexistence:** both use DPS and reference Nusa Penida but they're distinct listings — `beach_nusapenida` is "Kelingking Secret Beach" (a specific beach), `nusa-penida-bali` is the island as a destination. Boot-time dup-id validator clears these (different IDs). Intentional differentiation; not a dup.

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Production JS bundle | **495 KB** minified (`dist/app.min.js`) — est. ~160 KB gzipped over HTTPS |
| Dev bundle (unpkg Babel) | **7.29.7 Babel Standalone (~900 KB)** — dev-only, NOT loaded in `dist/index.html` |
| React + ReactDOM | ~130 KB gzipped — pinned 18.3.1 from unpkg |
| Biggest perf bottleneck | **750 KB single-file app.jsx** — Babel parse on cold dev load is 3–5s, eliminated in prod via esbuild pre-transpile. In production, the 495 KB minified bundle is the main cost. At 160 KB gzipped this is acceptable for a content-heavy PWA. |
| Image lazy loading | ✅ All card `<img>` tags use `loading="lazy"` |
| CDN source | unpkg.com for React + Babel — functional but `cdnjs.cloudflare.com` would be more reliable under load. P3. |
| SRI on CDN scripts | ❌ No Subresource Integrity hashes on CDN `<script>` tags (Open #10, known, medium risk) |

---

## 6. Cost Estimate

| MAU | Open-Meteo | DigitalOcean VPS | GitHub Pages | Total/mo |
|-----|-----------|-----------------|--------------|---------|
| Current (<50) | Free (well under 10K req/day limit) | $6 | Free | **~$6** |
| 1K MAU | Free (batched, cached — ~1K req/day at 50/2s) | $6 | Free | **~$6** |
| 10K MAU | ⚠️ Risk zone — 10K DAU hitting 392 venues = potential rate limit breach; proxy cache mitigates with deduplication | $6–12 (upgrade to 2GB droplet) | Free | **~$12–18** |
| 100K MAU | 🔴 Open-Meteo free tier breaks (~66+ concurrent DAU on same venue set) — need either a paid Open-Meteo plan (~$20/mo) or aggressive cache extension | $24+ (load-balanced 4GB droplets) | Possibly move to CDN | **~$50–100** |

**Cost optimization opportunities:**
1. No action needed at current MAU — $6/mo is the real number today.
2. Open-Meteo free tier is the scale cliff at ~10K MAU. Cache disk persistence (Open #23) buys time by preventing cold-start bursts.
3. At 100K MAU, upgrade to Open-Meteo paid tier ($20/mo) before adding infra.

---

## Issues by Priority

### P1 — Fix Before Reddit Post (Jack-Only, One SSH Session)

**Open #23: VPS Weather Cache is In-Memory Only**

Status: Unchanged since 2026-08-24. DevOps Aug 27 included the exact patch. Repeating it here because today is a plausible Reddit post day.

A `pm2 restart` wipes `_wxCache`. After a restart + a traffic spike, all 392 venue weather calls hit Open-Meteo directly, simultaneously. At 100+ concurrent users, that's a 429 wall. Every new visitor sees "conditions unavailable." This is the exact scenario a Reddit post creates.

**Exact fix — add to `server/proxy.js`:**

```javascript
// ── Disk-backed weather cache ──────────────────────────────────────────────
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
  } catch (_) { /* cold start */ }
}

function saveCacheToDisk() {
  const obj = {};
  for (const [k, v] of _wxCache.entries()) obj[k] = v;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), 'utf8');
}

// Load on startup, persist on interval
loadCacheFromDisk();
setInterval(saveCacheToDisk, 5 * 60 * 1000); // flush every 5 min
```

Add `const fs = require('fs'); const path = require('path');` at the top if not already present.

**Deploy command (from your SSH session):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# paste the additions above into proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq '.wx_cache_size'
# should start at 0 (no prior file) or populated count if .wx-cache.json existed
```

**Time to fix: 15 min.** Blocks Reddit post from becoming an outage.

---

### P2 — Fix This Week

**15 Zombie Remote Branches**

Same 15 `origin/claude/*` branches as yesterday. Risk: an unattended branch accidentally gets merged or a new Claude session bases work off a stale one. This is a 30-second fix.

```bash
git fetch --prune
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
# Also clean up non-claude stale branches:
# fix-appjsx-final, restore-appjsx, test-small
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

**Time to fix: 2 min.** Jack-only (requires push access). At 15 branches this is P2; at 30 it's P1.

---

### P3 — Nice to Have

**CDN: Move React/Babel from unpkg to cdnjs**

unpkg has had availability incidents; cdnjs.cloudflare.com is more reliable under load. Swap is cosmetic but meaningful at Reddit-post scale.

```html
<!-- Replace in index.html: -->
<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
```

Babel Standalone stays on unpkg (dev-only; not in the production dist bundle — zero user impact).

**Time: 5 min.**

**SRI Hashes on CDN Scripts**

No Subresource Integrity on React/ReactDOM/Babel CDN loads. A compromised CDN could inject arbitrary JS. Low-but-real risk for a PWA handling user wishlist data.

```html
<!-- Generate with: -->
curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | base64
<!-- Then add integrity="sha384-<hash>" crossorigin="anonymous" to each script tag -->
```

Note: SRI on Babel Standalone would break `type="text/babel"` inline JSX evaluation (the browser blocks the eval if the script fails SRI). Apply SRI only to React + ReactDOM, not Babel. **Time: 20 min.**

---

## Scale Failure Analysis

**What breaks first at scale, and how to prevent it:**

At a Reddit spike (200–500 concurrent users in hour 1), the failure chain is: (1) VPS `_wxCache` is cold if it restarted for any reason → 392 venues × N concurrent users = thousands of Open-Meteo calls → 429 rate limit → every new visitor gets "conditions unavailable" → bounce rate spikes → post buried. The GitHub Pages CDN is not the constraint — it handles arbitrary concurrent static loads. The VPS weather proxy is the single point of failure. Open #23 (disk cache persistence) is a 15-minute SSH session that fully eliminates this risk. At 10K MAU the same cache plus normal `pm2` uptime (VPS doesn't restart often) is sufficient. At 100K MAU you need a paid Open-Meteo plan and a Redis cache on the VPS instead of the in-memory LRU. The 5-minute fix buys all runway between 0 and 10K MAU with no additional infrastructure.

---

## Venue Count Summary

| Category | Yesterday | This Run | Change |
|----------|-----------|----------|--------|
| Skiing | 132 | 132 | — |
| Beach | 260 | **263** | +3 (Praia do Camilo, Nusa Penida, Gili Trawangan) |
| **Total** | **392** | **395** | **+3** |

`.venue-baseline` updated to 395. `PEAKLY_BUILD = "20260829a"`. Cache lockstep confirmed.
