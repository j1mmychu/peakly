# Peakly DevOps Report — 2026-04-01

**Status: YELLOW**
No P0 blockers. Three P1 issues that need to ship this week, two of which will bite on or immediately after launch. One silent bug in sw.js will break push notification icons for every single user who opts into alerts.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Assessment |
|--------|-------|------------|
| app.jsx lines | 10,968 | OK |
| app.jsx raw size | 1.95 MB | Watch — approaching 2MB wall |
| Cache buster | `v=20260329v1` | **STALE — P1** |
| Plausible | Active, `data-domain="j1mmychu.github.io"` | OK for now, see P2 |
| CDN deps | React 18, ReactDOM 18, Babel 7.24.7 | All present |
| GitHub Actions deploy.yml | Present, triggers on main+master | GOOD |

**Cache buster is stale.** Four commits landed on 2026-04-01 (splash screen upgrade, flight URL fix, flight caching, airport modal). The cache buster was not bumped. Users who hit the site between March 29 and today who have the service worker installed will receive stale-while-revalidate responses — meaning they get the March 29 build until the network fetch completes and the next reload. The new splash screen and flight fix are dark for existing users until they hard-refresh or the SW updates on second load.

**Fix (2 lines):**
In `index.html`, line ~163:
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

## 2. FLIGHT PROXY STATUS

| Check | Result |
|-------|--------|
| Protocol | **HTTPS** ✓ (`https://peakly-api.duckdns.org`) |
| Timeout | **5s** with AbortController ✓ |
| Concurrency limit | **Max 3** simultaneous requests ✓ |
| Token in client code | **NOT PRESENT** ✓ — server-side only via `process.env.TRAVELPAYOUTS_TOKEN` |
| Fallback on failure | Yes — BASE_PRICES region fallback ✓ |

Proxy health is solid. The HTTPS migration is done, token never hits client code, timeout is set correctly, and the semaphore prevents hammering the proxy. No issues here.

---

## 3. WEATHER & EXTERNAL API

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

---

## 4. SECURITY AUDIT

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

---

## 5. PERFORMANCE ANALYSIS

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
