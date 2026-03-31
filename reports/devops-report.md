# Peakly DevOps Report — 2026-03-31

**Overall Status: YELLOW**
No site-down issues. One critical revenue bleed (P0), two scaling time bombs (P1), and a growing bundle problem that will eventually catch up with you.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ✅ GREEN | app.jsx 8,695 lines / 1.25 MB |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` confirmed |
| Proxy timeout/fallback | ✅ GREEN | 5s timeout, AbortController, semaphore(3) |
| Plausible analytics | ✅ GREEN | Present, uncommented, firing |
| Sentry DSN | ✅ GREEN | Live at peakly.sentry.io |
| Secrets in client code | ✅ GREEN | No tokens exposed |
| .gitignore | ✅ GREEN | Covers .env, *.pem, *.key |
| Weather cache (localStorage) | ✅ GREEN | 30-min TTL confirmed |
| Images lazy-loaded | ✅ GREEN | All `<img>` tags have `loading="lazy"` |
| TP_MARKER placeholder | ❌ P0 | All flight affiliate clicks earn $0 |
| Cache-buster | ⚠️ P1 | 5 days stale (`v=20260326a`, today is 2026-03-31) |
| Open-Meteo rate limit risk | ⚠️ P1 | 2,226 venues × ~2 calls = 3K calls/cold start |
| CDN SRI hashes | ⚠️ P2 | No integrity attributes — supply chain risk |
| GetYourGuide partner_id | ⚠️ P2 | Links present, no partner_id — earning $0 |
| Duplicate venue photos | ⚠️ P2 | Kayak category has 6+ duplicates |
| React CDN version | ⚠️ P2 | Floating `react@18` — pin to 18.3.1 |

---

## P0 — CRITICAL: TP_MARKER is a placeholder — all flight clicks earn $0

**Location:** `app.jsx:3666`

```js
const TP_MARKER = "YOUR_TP_MARKER";
```

`buildFlightUrl()` at line 3685 checks `if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER")` before wrapping with Travelpayouts tracking. Since this is still a placeholder, every single flight click goes to a bare Aviasales URL with no affiliate tracking. CLAUDE.md lists Travelpayouts as "ACTIVE, EARNING" at $0.14 RPM — that number is zero until this is fixed. Every day this ships is revenue lost.

**Fix (2 minutes after Jack provides the marker):**

```js
// app.jsx:3666 — replace with real marker from Travelpayouts dashboard
const TP_MARKER = "599123"; // example — Jack: Partners → Program info → Your marker
```

**Jack's action:** Log into Travelpayouts → Partners → Aviasales program → copy "Your marker" ID. Paste it here.

**Time to fix:** 30 seconds of code. Blocked on Jack providing the marker ID.

---

## P1 — HIGH: Cache buster is 5 days stale

**Location:** `index.html:247`

```html
<script type="text/babel" src="./app.jsx?v=20260326a" data-presets="react">
```

Today is 2026-03-31. The last push was tagged `v=20260326a`. Browsers and GitHub Pages CDN edge nodes that cached app.jsx with that query param may serve stale code to returning users. This is particularly bad given 2,226 venues were added and weather caching was shipped — users could be running months-old logic.

**Fix (30 seconds):**

```html
<!-- index.html:247 -->
<script type="text/babel" src="./app.jsx?v=20260331a" data-presets="react"></script>
```

Bump this on every meaningful push. Convention: `YYYYMMDD` + letter suffix.

---

## P1 — HIGH: Open-Meteo will rate-limit at any real traffic

**Location:** `app.jsx:8405–8413`

You have 2,226 venues. On a full cold-start refresh cycle (BATCH_SIZE=50):
- `fetchWeather()` × 2,226 = **2,226 calls** to `api.open-meteo.com`
- `fetchMarine()` for surf + kite + kayak + diving venues ≈ **~800 calls** to `marine-api.open-meteo.com`
- **Total per cold-start session: ~3,026 API calls**

Open-Meteo free tier: **10,000 calls/day.**

Three concurrent users with cold caches = 9,078 calls = daily quota gone. At 100 DAU you hit the limit by 9am. The 30-min localStorage TTL helps for returning users on the *same device*, but does nothing across users or devices.

**Fix — server-side weather cache on the VPS (4 hours):**

Add a weather proxy endpoint to the existing VPS Node.js server that caches by lat/lon and is shared across all users:

```js
// On VPS: server.js — add alongside existing /api/flights handler
const weatherCache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'missing lat/lon' });
  const key = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return res.json(cached.data);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_sum,snowfall_sum,uv_index_max,snow_depth&current_weather=true&timezone=auto`;
    const r = await fetch(url);
    const data = await r.json();
    weatherCache.set(key, { data, ts: Date.now() });
    res.json(data);
  } catch(e) { res.status(502).json({ error: 'upstream failed' }); }
});
```

Then in `app.jsx:2939`, change the METEO constant to proxy through your VPS:

```js
const METEO = "https://peakly-api.duckdns.org/api/weather"; // was api.open-meteo.com
```

This changes 3,026 cold-start API calls to ~0 (server cache is warm for all users after the first pass). Without this change you will exhaust Open-Meteo free tier at ~3 concurrent users.

**Time to fix:** 4 hours (VPS code + deploy + test). Do this before any Reddit/TikTok growth push.

---

## P2 — MEDIUM: No Subresource Integrity on CDN scripts

**Location:** `index.html:80–84`

```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
```

No `integrity` hashes. If unpkg.com serves a poisoned response, your users execute arbitrary JS in their browser. This is not hypothetical — npm/CDN supply chain attacks happen.

**Fix — generate SRI hashes and pin versions:**

```bash
# Run this once to get hashes:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then apply to index.html:

```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"
  crossorigin="anonymous"></script>
```

Also: pin `react@18` to `react@18.3.1` (exact version) or the hash will never match if unpkg resolves a newer minor.

**Time to fix:** 30 minutes.

---

## P2 — MEDIUM: GetYourGuide links have no partner_id — earning $0

**Location:** `app.jsx:7481`

```js
let u = exp.url || `https://www.getyourguide.com/s/?q=${encodeURIComponent(exp.name + ' ' + listing.location)}`;
```

No `partner_id` parameter. CLAUDE.md lists GetYourGuide as "BLOCKED BY LLC" — but LLC was approved 2026-03-25. Sign up at partners.getyourguide.com, get your `partner_id`, then:

```js
const GYG_PARTNER_ID = "YOUR_PARTNER_ID"; // add near top with other affiliate constants
// ...in the link builder:
let u = exp.url || `https://www.getyourguide.com/s/?q=${encodeURIComponent(exp.name + ' ' + listing.location)}&partner_id=${GYG_PARTNER_ID}`;
```

**Time to fix:** 5 minutes of code + ~30 minutes of GetYourGuide partner signup.

---

## P2 — MEDIUM: Duplicate venue photos in kayak (and likely other) categories

CLAUDE.md claims "0% photo duplication across all 2,226 venues." That is wrong. At minimum 6 kayak venues share photo ID `photo-1523819088009-c3ecf1e34000`:
- Florida Keys Kayak (`app.jsx:1911`)
- Ölüdeniz Blue Lagoon Kayak (`app.jsx:1928`)
- Tortuguero Canals Kayak (`app.jsx:1953`)
- Borneo River Kayaking (`app.jsx:2029`)
- Venice Secret Canals Kayak (`app.jsx:2037`)
- Cat Ba Island Kayaking (`app.jsx:2077`)

Similarly, the fishing category uses `photo-1529961482160-d7916734da85` for 5 Alaska venues. Spot-check diving and paragliding similarly.

**Fix:**

```bash
# Find all duplicated photo IDs:
grep -o 'photo-[a-z0-9]*' app.jsx | sort | uniq -d
```

Replace duplicates with unique Unsplash photo IDs appropriate to the venue.

**Time to fix:** 30–45 minutes.

---

## P2 — LOW: React CDN version is floating

**Location:** `index.html:80–81`

`react@18` resolves to whatever latest 18.x unpkg serves. A breaking patch auto-applies silently with no warning.

**Fix (2 minutes):**

```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

---

## P3 — FUTURE: Plausible domain needs update at launch

**Location:** `index.html:31`

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

When `peakly.app` goes live, update `data-domain="peakly.app"` and add a new site in Plausible. Historical data on the GitHub Pages domain does not transfer automatically.

---

## Performance Analysis

| Asset | Approx size (compressed) | Notes |
|---|---|---|
| Babel Standalone 7.24.7 | ~840 KB gz | Largest single asset — blocks first paint |
| app.jsx (1.25 MB raw) | ~350 KB gz | Unminified, transpiled at runtime |
| ReactDOM 18 UMD prod | ~130 KB gz | |
| React 18 UMD prod | ~42 KB gz | |
| **Total first-load JS** | **~1.36 MB gz** | On device, ~3.6 MB uncompressed to parse |

**Biggest bottleneck:** Babel Standalone transpiles 1.25 MB of raw JSX synchronously on the main thread at first load. On a mid-range Android on LTE this is 3–6 seconds before anything renders. The splash screen masks this, but Lighthouse/CWV scores are objectively bad. Not fixable without a build step — accepted architectural trade-off. When app.jsx hits 12,000 lines, revisit this.

app.jsx is currently 8,695 lines and growing fast (was ~5,413 per CLAUDE.md six days ago — +60% in a week). At this growth rate it hits 12,000 lines within two weeks.

---

## Cost Projections

| Scale | Monthly cost | Notes |
|---|---|---|
| Current (beta) | $6 | VPS only, GitHub Pages free |
| 1K MAU | $6 | VPS handles it, Open-Meteo free tier fine with server-side cache |
| 10K MAU | $12–18 | Upgrade VPS to 2GB ($12), add Redis for weather cache |
| 100K MAU | $70–130 | HA setup needed, Open-Meteo commercial (~$29/mo), Cloudflare Pro |

**Cost optimization:** Server-side weather cache (P1 fix above) eliminates Open-Meteo paid tier requirement up to ~50K MAU.

---

## What Breaks First at Scale

**The VPS flight proxy is a single point of failure with no redundancy.** At a Reddit traffic spike — say 500 users over 30 minutes — each user triggers `fetchTravelpayoutsPrice()` calls capped at 3 concurrent per user via the semaphore. The Node.js process on a 1GB droplet will queue 1,500 concurrent requests. Caddy will hold the TCP connections but the Node process may OOM. Before any growth push: (1) add a `/api/health` endpoint and verify UptimeRobot is alerting on it, (2) add a simple in-memory LRU cache on the VPS for flight prices keyed by `${origin}-${destination}` with a 15-minute TTL. That single addition reduces VPS load by ~90% during a traffic spike since most users share the same home airports. Estimated time: 2 hours. Do this before Reddit launch.

---

## Action Summary

| Priority | Owner | Issue | Fix Time |
|---|---|---|---|
| P0 | Jack + Dev | TP_MARKER placeholder — $0 flight commissions | 2 min after Jack provides marker |
| P1 | Dev | Cache buster 5 days stale | 30 seconds |
| P1 | Dev | Open-Meteo server-side cache (VPS) | 4 hours |
| P2 | Dev | SRI hashes on CDN scripts | 30 min |
| P2 | Jack + Dev | GetYourGuide partner_id signup + code | 35 min |
| P2 | Dev | Fix duplicate venue photos (kayak + fishing) | 45 min |
| P2 | Dev | Pin React CDN to 18.3.1 | 2 min |
| P3 | Dev | Plausible domain update at launch | 5 min (post-domain-registration) |
