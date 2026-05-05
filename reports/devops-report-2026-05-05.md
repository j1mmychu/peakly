# Peakly DevOps Report — 2026-05-05

**Overall Status: 🔴 RED**

Three cache busters stale by 3 days. CLAUDE.md claiming 6+ shipped commits that don't exist in git. Live site is still serving 78 surfing venues that were "retired" two days ago. Gear gate still closed. This is not a vibe check — the ship has been writing its own log entries without leaving port.

---

## P0 — Fix Today, Blocks Launch

### P0-A: CLAUDE.md diverged from codebase by 2+ days of phantom commits

**Finding:** CLAUDE.md "Recently Fixed" sections for 2026-05-03 and 2026-05-04 reference 8+ commits (bb56aaf, dc92123, ce8e1db, 9d26e84, 6e964e9, 35e60c2, a9aacf5, 3bbe88e, 84f5e30, 47f12e1) that **do not exist in the git log**. The most recent commit touching app.jsx/sw.js/index.html is `3139d77` ("Daily DevOps report 2026-05-02 + 3 fixes"). Every "fix" claimed since then is a fiction.

**Proof:**
```bash
git log --oneline | head -5
# 52e2236 Daily Content report
# f1abcea Merge remote-tracking branch 'origin/main'
# 7a37b96 Daily Content report
# 3139d77 Daily DevOps report 2026-05-02 + 3 fixes  ← last real code change
# c9a384d fix: delete aspen-snowmass-s7 duplicate...
```

**What CLAUDE.md claims is done but isn't:**
| Claim | Reality |
|-------|---------|
| 77 surfing venues retired (pivot) | `grep -c 'category:"surfing"' app.jsx` → **78** |
| tanning renamed to beach | `grep -c 'category:"beach"' app.jsx` → **0** (89 "tanning" venues) |
| Gear gate flipped to `GEAR_ITEMS[...]` | Line 5763: still `{false && GEAR_ITEMS...}` |
| `lateSeason: true` on Cervinia + Val d'Isere | `grep -c 'lateSeason' app.jsx` → **0** |
| aruba-eagle-beach-t1 duplicate deleted | Line 539: still present |
| Cache bumped to peakly-20260504h | sw.js had `peakly-20260502` |
| scoreWeekend() pivot function added | Not in code |
| Estimate prices labeled with ~$ | Partially present |

**Impact:** The live site at j1mmychu.github.io/peakly is serving a product that doesn't match CLAUDE.md's product definition. Users see surfing venues. Gear revenue is blocked. The pivot never shipped.

**Fix — the 2026-05-03 pivot needs to actually be committed:**
This is not a 15-minute devops fix. This is a full product commit session. Jack needs to run a session against the actual codebase to apply everything CLAUDE.md describes. Start with:
```bash
git log --oneline -5   # confirm you're on 3139d77 state
# Then apply pivot changes: retire 78 surfing venues, rename tanning→beach,
# add scoreWeekend(), flip gear gate, add lateSeason flags
```

---

### P0-B: Cache busters stale by 3 days — users stuck on 2026-05-02 code

**Finding:** Two files had stale version strings that prevent users with cached service workers from receiving any updates made since May 2nd.

```
sw.js:      CACHE_NAME = "peakly-20260502"   ← was stale
index.html: app.jsx?v=20260502a              ← was stale
```

**Status: FIXED (this session).** Bumped both to 20260505:
```javascript
// sw.js — was "peakly-20260502"
const CACHE_NAME = "peakly-20260505";
```
```html
<!-- index.html — was ?v=20260502a -->
<script type="text/babel" src="./app.jsx?v=20260505a" data-presets="react">
```

**Estimated fix time:** Already done. ~2 min.

---

## P1 — Fix This Week

### P1-A: fetchMarine has zero retry logic

**Finding:** `fetchWeather` has 3 attempts with exponential backoff (1.2s, 2.4s). `fetchMarine` had a single try/catch — one Open-Meteo 429 or network blip and water temp data is permanently null for that session, meaning beach venue scores are computed without temperature data.

**Status: FIXED (this session).** `fetchMarine` now mirrors `fetchWeather`'s retry pattern (3 attempts, 1.2s/2.4s backoff, handles AbortError separately).

**Estimated fix time:** Already done. ~5 min.

---

### P1-B: needsMarine category checks use retired category names (latent bug)

**Finding:** Lines 6761 and 6783 check `venue.category === "surfing" || venue.category === "tanning"` to decide whether to fetch marine data. This is correct for the current codebase state (surfing + tanning still exist). But CLAUDE.md describes a state where venues use `category: "beach"`. When the tanning→beach rename actually ships, marine data will stop fetching for ALL beach venues the moment it deploys — the check will never match. The score for every beach venue will be computed without water temp.

**Fix (apply when pivot commits ship):**
```javascript
// Line 6761 — fetchVenueWeather
const needsMarine = venue.category === "beach";  // was: === "surfing" || === "tanning"

// Line 6783 — fetchInitialWeather batch
const needsMarine = v.category === "beach";  // was: === "surfing" || === "tanning"
```

**Do NOT apply this fix before the tanning→beach rename is committed** — doing so will break beach marine fetching in the current codebase.

---

### P1-C: Multiple stale "surf" references in index.html — live SEO damage

**Finding:** Surfing was supposedly retired 2026-05-03. These lines still advertise it to Google, social scrapers, and screen readers:

```
Line  7: <meta name="description" content="Peakly — Find surf, ski & adventure spots...">
Line 11: <meta property="og:description" content="Find surf, ski & beach spots...">
Line 20: <meta name="twitter:description" content="Find surf, ski & beach spots...">
Line 23: <title>Peakly — Find Surf, Ski & Adventure Spots with Cheap Flights</title>
Line 44: JSON-LD description: "Find surf, ski and adventure spots..."
Line 338: noscript fallback: "Peakly — Surf, Ski & Adventure Spots..."
```

**Fix (apply when pivot ships):**
```html
<meta name="description" content="Peakly — Find the best ski or beach weekend. Live conditions + cheap flights for 150+ venues worldwide." />
<meta property="og:description" content="Find ski resorts and beach destinations when conditions and cheap flights align. Real-time weekend scoring for 150+ venues." />
<meta name="twitter:description" content="Find ski and beach weekends with perfect conditions and cheap flights." />
<title>Peakly — Best Ski &amp; Beach Weekend Finder with Live Conditions</title>
```

**Estimated fix time:** 5 min (batch find/replace in index.html, gate on pivot shipping).

---

### P1-D: Stale category ID references throughout app.jsx

**Finding:** Multiple components filter/match on the old category IDs. After the pivot these will silently show wrong tabs, wrong filtering, wrong vibe matches:

```javascript
// Line 2607 — filter
CATEGORIES.filter(c => ["skiing", "surfing", "tanning"].includes(c.id))

// Line 2904 — vibe scoring
if (f.beach && l.category === "tanning") s += 44;

// Line 2908
const isWarm = l.category === "tanning" || l.category === "surfing";

// Line 3105 — ACTIVE_CATS set
const ACTIVE_CATS = new Set(["skiing", "surfing", "tanning"]);

// Line 3161 — VISIBLE_CAT_IDS
const VISIBLE_CAT_IDS = ["all", "skiing", "surfing", "tanning"];

// Line 6409 — help text
tanning: "UV index intel, hidden beaches & sun safety",
```

These all need updating to `"beach"` when the pivot ships. Flag them in CLAUDE.md so the pivot commit doesn't forget them.

---

## P2 — Fix This Sprint

### P2-A: No SRI hashes on CDN scripts

Three scripts load without Subresource Integrity:
- React 18.3.1 (unpkg)
- ReactDOM 18.3.1 (unpkg)
- Babel Standalone 7.24.7 (unpkg)

If unpkg is compromised, malicious JS runs in user browsers. Sentry already has `crossorigin='anonymous'`. React and ReactDOM have `crossorigin` but no `integrity`.

**Fix — get SRI hashes:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<hash>"` to each script tag. Note: Babel Standalone requires `eval()` for JSX transpilation, so a `script-src` CSP would need `'unsafe-eval'` — acceptable tradeoff given this is a client-side-only SPA.

**Estimated fix time:** 15 min.

---

### P2-B: Open-Meteo rate limit exposure at >500 DAU

**Finding:** App fetches weather for top 100 venues per session in two batches of 50 with a 1-second gap between batches (lines 6778–6806). With 2hr localStorage TTL, each unique device-day generates up to 100 API calls. Free tier limit is 10,000 requests/day.

**Math:**
- 100 concurrent users cold-loading = 10,000 requests/day → hits the ceiling exactly
- At 500 DAU with cold caches: 50,000 requests/day → 429s start

**Fix — cache sharing via server (pre-launch prep, not today):**
The VPS proxy already exists. Add a weather cache endpoint:
```javascript
// proxy.js — add weather passthrough cache
app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  const key = `wx_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
  if (cache.has(key)) return res.json(cache.get(key));
  const upstream = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&...`);
  const data = await upstream.json();
  cache.set(key, data);  // use node-cache with 2hr TTL
  res.json(data);
});
```
This collapses 500 users cold-loading the same 100 venues down to 100 Open-Meteo calls total. Without it, Reddit launch (May 10/15) risks rate limiting at peak traffic.

**Estimated fix time:** 2–4 hrs (VPS redeploy required).

---

## Infrastructure Cost Projections

| Scale | DO Droplet | Open-Meteo | Proxy bandwidth | Monthly total |
|-------|-----------|------------|-----------------|---------------|
| Current | $6 (1GB) | Free | <$1 | **$6/mo** |
| 1K MAU | $6 | Free | <$1 | **$6/mo** |
| 10K MAU | $12 (2GB) | Free (tight) | ~$2 | **$14/mo** |
| 100K MAU | $48 (4GB) | $20–200 commercial | ~$20 | **$90–270/mo** |

**What breaks first:** Open-Meteo free tier at ~500 DAU with cold caches (no server-side weather cache). The $6 DigitalOcean droplet survives to ~10K MAU before RAM becomes a concern (Node.js proxy + Express + in-memory cache). The Babel Standalone runtime transpilation (~1.1MB script + transpiling 469KB JSX on every cold load) will be felt on low-end Android devices — median parse+compile time is ~3–5 seconds. This is the worst UX bottleneck before any infra problem surfaces.

---

## Performance Summary

| Asset | Size | Notes |
|-------|------|-------|
| Babel Standalone | ~1.1MB | Largest bottleneck. Runtime JSX transpile. Architectural constraint. |
| app.jsx | ~469KB | 7,172 lines, unminified |
| ReactDOM 18.3.1 | ~130KB | Pinned ✅ |
| React 18.3.1 | ~40KB | Pinned ✅ |
| Sentry SDK | ~100KB | |
| **Total cold load** | **~1.84MB JS** | Before fonts + images |

Images: All 8 `<img>` render sites use `loading="lazy"` ✅.

---

## Security Summary

| Check | Status |
|-------|--------|
| Travelpayouts token in client code | ✅ Clean — server-side only |
| Sentry DSN in client code | ✅ Expected — client DSNs are public by design |
| .gitignore covers .env, *.pem, *.key | ✅ Good |
| Secrets in recent commits | ✅ None found |
| SRI on CDN scripts | ⚠️ Missing (P2-A) |
| CSP meta tag | ⚠️ Missing — medium risk; `unsafe-eval` required for Babel |

---

## Fixes Applied This Session

| Fix | File | Status |
|-----|------|--------|
| sw.js CACHE_NAME → peakly-20260505 | sw.js | ✅ Done |
| index.html cache buster → ?v=20260505a | index.html | ✅ Done |
| fetchMarine 3-attempt retry with backoff | app.jsx | ✅ Done |

---

## Action Required from Jack

1. **Run a full pivot commit session** — apply the 2026-05-03/04 changes that CLAUDE.md describes but were never committed. 78 surfing venues need retiring, tanning→beach rename, scoreWeekend(), gear gate flip, lateSeason flags. This is the single highest-leverage action.
2. **Build server-side weather cache** before the Reddit launch spike (May 10/15 deadline in CLAUDE.md). Without it, any traffic spike will blow through the Open-Meteo free tier in hours.
3. After pivot ships: update needsMarine to check `"beach"`, update ACTIVE_CATS/VISIBLE_CAT_IDS, update index.html meta tags.
