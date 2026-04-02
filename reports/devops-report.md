<<<<<<< HEAD
# Peakly DevOps Report — 2026-03-31

**Overall Status: YELLOW**
No site-down issues. One critical revenue bleed (P0), two scaling time bombs (P1), and a growing bundle problem that will eventually catch up with you.
=======
# Peakly DevOps Report — 2026-04-01

**Status: YELLOW**
No P0 blockers. Three P1 issues that need to ship this week, two of which will bite on or immediately after launch. One silent bug in sw.js will break push notification icons for every single user who opts into alerts.
>>>>>>> origin/main

---

## 1. LIVE SITE HEALTH

<<<<<<< HEAD
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
=======
| Metric | Value | Assessment |
|--------|-------|------------|
| app.jsx lines | 10,968 | OK |
| app.jsx raw size | 1.95 MB | Watch — approaching 2MB wall |
| Cache buster | `v=20260329v1` | **STALE — P1** |
| Plausible | Active, `data-domain="j1mmychu.github.io"` | OK for now, see P2 |
| CDN deps | React 18, ReactDOM 18, Babel 7.24.7 | All present |
| GitHub Actions deploy.yml | Present, triggers on main+master | GOOD |
>>>>>>> origin/main

**Cache buster is stale.** Four commits landed on 2026-04-01 (splash screen upgrade, flight URL fix, flight caching, airport modal). The cache buster was not bumped. Users who hit the site between March 29 and today who have the service worker installed will receive stale-while-revalidate responses — meaning they get the March 29 build until the network fetch completes and the next reload. The new splash screen and flight fix are dark for existing users until they hard-refresh or the SW updates on second load.

<<<<<<< HEAD
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

=======
**Fix (2 lines):**
In `index.html`, line ~163:
>>>>>>> origin/main
```html
<!-- Before -->
<script type="text/babel" src="./app.jsx?v=20260329v1" data-presets="react"></script>

<!-- After -->
<script type="text/babel" src="./app.jsx?v=20260401a" data-presets="react"></script>
```

In `sw.js`, line 2:
```js
// Before
const CACHE_NAME = "peakly-v14";

// After
const CACHE_NAME = "peakly-v15";
```

**Estimated fix time: 2 minutes.**

---

<<<<<<< HEAD
## P3 — FUTURE: Plausible domain needs update at launch

**Location:** `index.html:31`

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

When `peakly.app` goes live, update `data-domain="peakly.app"` and add a new site in Plausible. Historical data on the GitHub Pages domain does not transfer automatically.
=======
## 2. FLIGHT PROXY STATUS

| Check | Result |
|-------|--------|
| Protocol | **HTTPS** ✓ (`https://peakly-api.duckdns.org`) |
| Timeout | **5s** with AbortController ✓ |
| Concurrency limit | **Max 3** simultaneous requests ✓ |
| Token in client code | **NOT PRESENT** ✓ — server-side only via `process.env.TRAVELPAYOUTS_TOKEN` |
| Fallback on failure | Yes — BASE_PRICES region fallback ✓ |

Proxy health is solid. The HTTPS migration is done, token never hits client code, timeout is set correctly, and the semaphore prevents hammering the proxy. No issues here.
>>>>>>> origin/main

---

## 3. WEATHER & EXTERNAL API

<<<<<<< HEAD
| Asset | Approx size (compressed) | Notes |
|---|---|---|
| Babel Standalone 7.24.7 | ~840 KB gz | Largest single asset — blocks first paint |
| app.jsx (1.25 MB raw) | ~350 KB gz | Unminified, transpiled at runtime |
| ReactDOM 18 UMD prod | ~130 KB gz | |
| React 18 UMD prod | ~42 KB gz | |
| **Total first-load JS** | **~1.36 MB gz** | On device, ~3.6 MB uncompressed to parse |

**Biggest bottleneck:** Babel Standalone transpiles 1.25 MB of raw JSX synchronously on the main thread at first load. On a mid-range Android on LTE this is 3–6 seconds before anything renders. The splash screen masks this, but Lighthouse/CWV scores are objectively bad. Not fixable without a build step — accepted architectural trade-off. When app.jsx hits 12,000 lines, revisit this.

app.jsx is currently 8,695 lines and growing fast (was ~5,413 per CLAUDE.md six days ago — +60% in a week). At this growth rate it hits 12,000 lines within two weeks.
=======
| Check | Result |
|-------|--------|
| Open-Meteo free tier | 10,000 calls/day |
| Venue count | 3,726 |
| Calls per full cold-start | ~7,452 (weather + marine per venue) |
| Batch size | 50 venues, 2s delay between batches |
| Weather cache TTL | 30 min (localStorage) |
| Cache cleanup | 2-hour max age |

**The math at scale is dangerous.** A single user with cold cache (first visit or after 30 min) triggers up to 7,452 Open-Meteo calls to populate all 3,726 venues. The 30-min TTL cache handles repeat users effectively (~90% call reduction), but:

- At 100 DAU with 20% cold-start rate: 20 users × 7,452 calls = **149,040 calls/day** — 15× over the free tier.
- The free tier is 10K/day total across ALL users hitting your app.

This will break silently. Open-Meteo will return 429s, scores will go blank, and users will see an empty app. There is no alerting for this today.

**Mitigations already in place:** Batching + 2s delays slow the burst rate. The 30-min TTL means returning users don't re-trigger.

**What to watch for at launch:** If the Reddit post hits and 500 people open the app within an hour, you will exhaust the Open-Meteo free tier within minutes for that hour. Scores will go blank for latecomers. Monitor the Open-Meteo dashboard the day of Reddit launch.

**Short-term fix (P2):** Reduce initial fetch to the first visible page of 30 venues only. Defer remaining batches until "Show More" is tapped. This cuts cold-start API calls from 7,452 to ~60.

```js
// In App useEffect — change initial batch to only visible venues:
const initial = sorted.slice(0, 30); // only first page
```
>>>>>>> origin/main

---

## 4. SECURITY AUDIT

<<<<<<< HEAD
| Scale | Monthly cost | Notes |
|---|---|---|
| Current (beta) | $6 | VPS only, GitHub Pages free |
| 1K MAU | $6 | VPS handles it, Open-Meteo free tier fine with server-side cache |
| 10K MAU | $12–18 | Upgrade VPS to 2GB ($12), add Redis for weather cache |
| 100K MAU | $70–130 | HA setup needed, Open-Meteo commercial (~$29/mo), Cloudflare Pro |

**Cost optimization:** Server-side weather cache (P1 fix above) eliminates Open-Meteo paid tier requirement up to ~50K MAU.
=======
### ✅ Clean

| Check | Status |
|-------|--------|
| Travelpayouts token in client | **NOT PRESENT** ✓ |
| Any API keys/secrets in app.jsx | **None found** ✓ |
| .gitignore covers .env | **Yes** ✓ |
| Recent commits with secrets | **None** ✓ |
| server/proxy.js token handling | **Reads from env, never hardcoded** ✓ |
| Sentry DSN | **Live, real DSN** ✓ — `9416b032...` (client DSN, intentionally public per Sentry model) |

No security issues. The Sentry DSN in client code is expected and correct — it's the *public* ingest key, not the server-side auth token. Token discipline on Travelpayouts is solid.
>>>>>>> origin/main

---

## 5. PERFORMANCE ANALYSIS

<<<<<<< HEAD
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
=======
### JavaScript bundle at page load

| Asset | Size (gzipped est.) | Load strategy |
|-------|--------------------|--------------:|
| Babel Standalone 7.24.7 | ~840 KB | Blocking |
| ReactDOM 18 production | ~130 KB | Blocking |
| React 18 production | ~45 KB | Blocking |
| app.jsx (raw, no gzip) | 1,950 KB | Blocking (Babel parse) |
| **Total blocking JS** | **~2,965 KB** | — |

**The single largest performance bottleneck is Babel Standalone.** It is 840KB of transpiler that runs on the user's phone every single page load to convert 1.95MB of JSX into executable JavaScript. On a mid-tier Android (Galaxy A14, typical Reddit demographic), this parse+transpile step takes 1.5–4 seconds before a single pixel renders. The splash screen buys perceptual cover but TTI is genuinely slow.

This is a known architectural trade-off (no build step). At current scale it's acceptable. At 10K MAU it will start showing up in bounce rate. **Do not fix before Reddit launch — this requires a full build step migration.**

### Images
- `loading="lazy"` confirmed on all `<img>` tags ✓
- 3,741 Unsplash `?w=800&h=600` references — images are appropriately sized ✓
- `onError` fallback handlers present ✓

### P1 Bug — Service Worker push notification icon is broken

`sw.js` lines 63–64:
```js
icon: "/peakly/manifest.json",
badge: "/peakly/manifest.json",
```

**manifest.json is a JSON file, not a PNG.** Every push notification Peakly ever sends will show a broken icon. On Android, this either shows a blank where the icon should be or the notification rendering fails entirely.

**Fastest fix — remove the broken fields entirely (10 minutes):**

```js
// sw.js — replace the options block starting at line 61
const options = {
  body: data.body || "Conditions are peaking — check your window now.",
  tag: data.venueId ? `venue-${data.venueId}` : "peakly-alert",
  renotify: true,
  data: {
    venueId: data.venueId || null,
    score: data.score || null,
    price: data.price || null,
    url: data.venueId
      ? `/peakly/?venue=${data.venueId}`
      : "/peakly/",
  },
};
```

This removes `icon` and `badge` — notifications will use the browser/OS default instead of a broken JSON file. Correct solution is to generate 192×192 and 96×96 PNG icons from the mountain SVG and add them to the repo, then reference them:

```js
icon: "https://j1mmychu.github.io/peakly/icons/icon-192.png",
badge: "https://j1mmychu.github.io/peakly/icons/icon-96.png",
```

**Estimated fix time: 10 minutes (remove fields). 45 minutes with proper PNG generation.**

---

## 6. SERVICE WORKER PRECACHE — SILENT WASTE

`sw.js` precaches `/peakly/app.jsx` (no query param). The HTML loads `./app.jsx?v=20260329v1` (with query param). The stale-while-revalidate handler DOES correctly cache the versioned URL on first network response (correct behavior), but the install-time `PRECACHE` entry for the bare path is never matched — it's a different URL. It wastes bandwidth on every SW install for zero benefit.

```js
// sw.js line 3-5 — remove the pointless precache
const PRECACHE = []; // app.jsx is handled by stale-while-revalidate; no precache needed
```

Low priority. Clean it up when bumping SW version for the P1 fixes above.

---

## 7. PLAUSIBLE DOMAIN MISMATCH (P2)

Plausible is tracking `data-domain="j1mmychu.github.io"` — not `peakly.app`. When the peakly.app domain is registered (unblocked by LLC), Plausible will need a new site entry and this line updated. Analytics will break silently on domain migration.

```html
<!-- When peakly.app is live, update index.html line 37: -->
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

Add this to the domain migration checklist. No action needed today.

---

## 8. COST PROJECTIONS

| Scale | Open-Meteo | GitHub Pages | VPS Proxy | Total/mo |
|-------|-----------|-------------|-----------|---------|
| Today (< 100 MAU) | Free | Free | $6 | **$6** |
| 1K MAU | Free (cache saves you) | Free | $6 | **$6** |
| 10K MAU | **Risk zone** — monitor 429s | Free | $12 (upgrade to 2GB) | **$12** |
| 100K MAU | **Must upgrade** to Open-Meteo Business (~$50/mo) | Free | $48 (load balanced) | **$98** |

**Open-Meteo is the cost cliff, not the VPS.** The proxy can handle 100K MAU on a $24 droplet. Open-Meteo is where you'll pay or break.

**Cost optimization at 10K+ MAU:** Move weather fetching server-side. The VPS fetches Open-Meteo once per venue per 30 minutes and serves cached results to all clients. Reduces Open-Meteo calls from `MAU × venues` to `venues × 48/day` = 3,726 × 48 = ~178,848 calls/day. That fits comfortably in the $20/mo API tier and takes the client-side API exhaustion risk entirely off the table.

---

## 9. WHAT BREAKS FIRST AT SCALE

**Open-Meteo rate limits will be the first failure at scale, and it will be invisible until it happens.** The exact failure mode: Reddit launch hits, 300 concurrent new users open the app, each triggers a batch weather fetch for 3,726 venues. Open-Meteo starts returning 429s on batch 2 of 75. Scores for 97% of venues quietly show as 0 or blank. The leaderboard surfaces the wrong venues. Users see a broken app with no explanation. There is no error UI for partial weather failures today — venues silently lose their scores.

**Prevention before Reddit launch:** (1) Change the initial weather fetch to cover only the first 30 visible venues. Defer the rest until "Show More" is tapped. This reduces cold-start calls from 7,452 to ~60 — buying 124× more headroom. (2) Add a Sentry capture on HTTP 429 from Open-Meteo so you're alerted when it happens. (3) Add a visible "Scores loading..." state that degrades gracefully instead of going blank.

---

## Issues Summary

| Priority | Issue | Fix Time |
|----------|-------|---------|
| P1 | Cache buster stale (`v=20260329v1`) — April 1 changes invisible to cached users | 2 min |
| P1 | SW push notification icon points to `manifest.json` (JSON ≠ PNG) — all alerts show broken icon | 10–45 min |
| P2 | Open-Meteo 429 risk at Reddit launch — no graceful degradation, no alerting | 1–2 hrs |
| P2 | SW PRECACHE for app.jsx is a no-op — wastes install bandwidth | 2 min |
| P2 | Plausible domain will break on peakly.app migration — add to migration checklist | 5 min (when domain is live) |

---

*DevOps Agent — Peakly | 2026-04-01*
>>>>>>> origin/main
