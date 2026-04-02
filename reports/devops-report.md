# Peakly DevOps Report — 2026-04-02

**Overall Status: YELLOW**

No outages. HTTPS proxy live. Sentry live. Three P0 issues: (1) app.jsx.bak is committed to git and served as a live 350KB file on GitHub Pages despite `.gitignore` having `*.bak` — it was committed before the ignore rule. (2) TP_MARKER is still a placeholder string — all flight affiliate clicks earning $0. (3) Cache buster `v=20260329v1` is 4 days stale while app.jsx was modified today (Apr 2). Users may be stuck on stale cached code.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ⚠️ YELLOW | 10,968 lines / 1.95 MB — 56% growth since last report |
| Cache-buster | ❌ STALE | `v=20260329v1` — app.jsx modified Apr 2, buster not updated |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` confirmed, no HTTP in client code |
| Proxy timeout/fallback | ✅ GREEN | 5s AbortController, 3-attempt retry with 1.2s backoff, semaphore=3 |
| Plausible analytics | ⚠️ WRONG DOMAIN | `data-domain="j1mmychu.github.io"` — must update to `peakly.app` before domain switch |
| Weather cache | ✅ GREEN | 30-min TTL confirmed; initial fetch correctly limited to top 100 venues |
| Sentry DSN | ✅ GREEN | Live — DSN in index.html + Sentry.init() in app.jsx |
| Secrets in client code | ✅ GREEN | No Travelpayouts token in client; proxy correctly reads from env var |
| .gitignore coverage | ⚠️ TRACKING BUG | `*.bak` in .gitignore but `app.jsx.bak` is already tracked — ignore rule doesn't apply retroactively |
| TP_MARKER | ❌ PLACEHOLDER | `"YOUR_TP_MARKER"` — earning $0 on all flight affiliate clicks |
| app.jsx.bak in repo | ❌ P0 | 350KB dead file committed and served live by GitHub Pages |
| React CDN | ⚠️ UNPINNED | `react@18` floats to latest 18.x — minor supply chain risk |
| Proxy rate limiting | ❌ NONE | No express-rate-limit middleware — open to quota exhaustion attacks |
| Alert store | ❌ IN-MEMORY | `_alerts = new Map()` — all registered alerts lost on server restart |

---

## P0 — Fix Today

### P0.1 — app.jsx.bak Is Committed and Served Live (350KB Dead Weight)

**The problem:** `app.jsx.bak` appears in `git ls-files` — it was committed to the repo before `.gitignore` was updated with `*.bak`. Git's ignore rules do not apply to already-tracked files. GitHub Pages is currently serving this 350KB file as a publicly accessible URL. It contains source code and may contain older versions of logic. It bloats the repo and every Pages deploy.

**Fix (2 minutes):**
```bash
git rm app.jsx.bak
git commit -m "chore: remove tracked backup file from repo"
git push origin main
```

After this, `.gitignore`'s `*.bak` rule will prevent it from ever being re-added.

---

### P0.2 — Cache Buster Is 4 Days Stale

**The problem:** `index.html` line 380 has `app.jsx?v=20260329v1`. The file `app.jsx` was last modified 2026-04-02 (today). Any user whose service worker or CDN cached the previous `app.jsx` will not receive the updated file because the query param hasn't changed. The service worker's stale-while-revalidate strategy means some users are guaranteed to be on old code.

**Fix — bump the cache buster in index.html (1 minute):**

In `index.html` line 380, change:
```html
<script type="text/babel" src="./app.jsx?v=20260329v1" data-presets="react"></script>
```
to:
```html
<script type="text/babel" src="./app.jsx?v=20260402a" data-presets="react"></script>
```

Also bump the service worker cache name in `sw.js` line 2:
```javascript
const CACHE_NAME = "peakly-v15";
```

---

### P0.3 — TP_MARKER Is Still a Placeholder (All Flight Revenue = $0)

**The problem:** `app.jsx` line 5316: `const TP_MARKER = "YOUR_TP_MARKER";`

`buildFlightUrl()` correctly falls back to a direct Aviasales link when this is unset, so flights aren't broken — but Peakly is earning $0 commission on every booking. With 3,726 venue detail pages generating flight clicks, this is meaningful lost revenue.

**Fix (5 minutes, Jack only):**
1. Log into dashboard.travelpayouts.com
2. Programs → Aviasales → copy your marker ID (numeric string, e.g. `"597254"`)
3. In `app.jsx` line 5316, replace:
```javascript
const TP_MARKER = "YOUR_TP_MARKER";
```
with:
```javascript
const TP_MARKER = "597254"; // your actual marker ID
```

No other code changes needed. The conditional at line 5342 handles the redirect automatically.

---

## P1 — Fix This Week

### P1.1 — Proxy Has No Rate Limiting (Open to Quota Exhaustion)

**The problem:** `server/proxy.js` has zero request-level rate limiting. The proxy directly forwards to Travelpayouts, which has its own rate limits. A single malicious actor (or a viral Reddit post causing a traffic spike) can exhaust the Travelpayouts API quota for all users by hammering `peakly-api.duckdns.org/api/flights/latest`. The VPS is a 1GB droplet — a trivial flood can OOM it. The proxy only handles upstream 429s; it does not protect itself.

**Fix — add express-rate-limit to server/proxy.js:**

```bash
# On VPS:
cd ~/peakly/server && npm install express-rate-limit
```

Add to `server/proxy.js` after the CORS middleware block (after line ~36):
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 30,                    // max 30 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — slow down.' },
});

app.use('/api/', limiter);
```

Also add to `server/package.json` dependencies:
```json
"express-rate-limit": "^7.2.0"
```

---

### P1.2 — Plausible Analytics Domain Is Wrong

**The problem:** `index.html` line 37: `data-domain="j1mmychu.github.io"`. When (not if) you register `peakly.app` and redirect the domain, Plausible will stop tracking all events. Every custom event (flight_click, venue_detail, set_alert, search, share) will silently fail. All analytics data will stop — right at the moment of maximum growth.

**Fix (2 minutes):**

In `index.html` line 37, change:
```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```
to:
```html
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

Also add `j1mmychu.github.io` as an additional domain alias in the Plausible dashboard so historical data rolls up correctly.

---

### P1.3 — Open-Meteo Free Tier Breaks at ~80 New Users/Day

**The math:** Each new browser visiting Peakly triggers `fetchInitialWeather()` which fetches weather for top 100 venues. Marine categories require 2 calls (weather + marine) — approximately 130 API calls per cold load. Open-Meteo free tier is **10,000 calls/day shared across all users**. At 80 new visitors/day: `80 × 130 = 10,400` — over the limit. The Reddit launch targets 200–500 users on day 1. That's 26,000–65,000 API calls. The app will return 429 errors, weather scores will fail, and the core value proposition breaks.

**The cache only helps returning users on the same device.** Every new device, incognito window, or mobile visitor is a cold load.

**Fix Option A (Free, immediate — do this now):** Reduce initial fetch from 100 to 30 venues.

In `app.jsx` around line 10578, change:
```javascript
const initial = VENUES.slice(0, 100);
```
to:
```javascript
const initial = VENUES.slice(0, 30);
```

Cuts cold load API calls from ~130 to ~40. Breaks even at 250 new users/day on the free tier. The first page of Explore shows 30 venues anyway — no UX impact.

**Fix Option B (Paid, required at 200+ DAU):** Sign up for Open-Meteo API commercial at open-meteo.com/en/pricing — $0/month for up to 10K calls/day on a dedicated non-shared quota. At 10K DAU you'll need their paid tier ($10–50/month).

---

### P1.4 — React CDN Is Unpinned (Supply Chain Risk)

**The problem:** `index.html` loads `react@18` and `react-dom@18` — unpkg resolves these to the latest 18.x release. If React ships a breaking patch, or if unpkg CDN is compromised and serves malicious content under a 18.x tag, users get it immediately with zero review.

**Fix (2 minutes):**

In `index.html`, pin to the current stable release:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

Update manually when upgrading React intentionally.

---

## P2 — Fix This Sprint

### P2.1 — Alert Store Is In-Memory (All Registered Alerts Lost on Server Restart)

**The problem:** `server/proxy.js` uses `const _alerts = new Map()`. Every time the Node.js process restarts — deploy, crash, OOM, VPS reboot — all registered alerts are wiped. Users who set alerts see them in the app UI (localStorage) but the server has forgotten them. Push notifications will never fire after a restart.

**Fix — add SQLite persistence (30 minutes on VPS):**

```bash
npm install better-sqlite3
```

Replace the in-memory Map in proxy.js:
```javascript
const Database = require('better-sqlite3');
const db = new Database('/var/data/peakly-alerts.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS alerts (
    alertId TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    registeredAt TEXT NOT NULL,
    lastChecked TEXT,
    fired INTEGER DEFAULT 0
  )
`);

function saveAlert(alertId, record) {
  db.prepare(`
    INSERT OR REPLACE INTO alerts (alertId, data, registeredAt, lastChecked, fired)
    VALUES (?, ?, ?, ?, ?)
  `).run(alertId, JSON.stringify(record), record.registeredAt, record.lastChecked, record.fired ? 1 : 0);
}

function getAlert(alertId) {
  const row = db.prepare('SELECT * FROM alerts WHERE alertId = ?').get(alertId);
  if (!row) return null;
  return { ...JSON.parse(row.data), lastChecked: row.lastChecked, fired: !!row.fired };
}
```

---

### P2.2 — Proxy Has No Process Management (Silent Crash = Silent Outage)

**The problem:** The proxy runs as a bare `node proxy.js` process. No PM2, no systemd unit, no auto-restart. If the process crashes at 3am, flight prices go dark for all users until someone manually restarts it. UptimeRobot checks HTTP but doesn't restart the process.

**Fix (15 minutes on VPS):**

```bash
npm install -g pm2
cd ~/peakly/server
pm2 start proxy.js --name peakly-proxy --restart-delay=3000 --max-restarts=10
pm2 save
pm2 startup
```

---

### P2.3 — Babel Transpilation Is the #1 Performance Bottleneck (Known Tech Debt)

**The numbers:** Babel Standalone 7.24.7 ≈ 800KB gzipped. app.jsx = 1.95MB raw, served uncompressed by GitHub Pages. On first load a browser must: (1) download ~3MB of JS total, (2) parse and execute 800KB of Babel, (3) Babel transpiles 10,968 lines of JSX on the main thread. On a mid-range Android phone this takes 2–4 seconds before React renders anything. The splash screen hides latency but it's real and measurable.

This cannot be fixed without a build step (Vite, esbuild, Parcel). Deferred per architecture decisions. Document as known tech debt for Phase 2 migration.

---

## Cost Projection

| Scale | Monthly Cost | Bottleneck |
|---|---|---|
| Current (0–100 MAU) | **$6/month** | None — within all limits |
| 1K MAU | **$6/month** | Open-Meteo free tier breaks at ~80 new users/day |
| 10K MAU | **$28–52/month** | VPS upgrade to 2GB ($12/mo) + Open-Meteo commercial ($10–40/mo) |
| 100K MAU | **$200–400/month** | CDN for app.jsx, VPS 4GB ($24/mo), Open-Meteo ($200/mo), Cloudflare Workers |

**All P0 and P1 fixes cost $0.** Rate limiter is a free npm package. Plausible domain is a 2-minute config change. Open-Meteo Option A is a one-line code change. React pinning is copy-paste.

---

## What Will Break First at Scale

**Open-Meteo is the single biggest launch risk, and it requires a one-line fix.** A Reddit post sending 200 new users in one day fires 26,000 API calls against a 10,000/day free tier limit. Weather scores fail. The app shows no conditions data. The entire value proposition collapses. The fix is changing `VENUES.slice(0, 100)` to `VENUES.slice(0, 30)` — a 2-minute change that triples the free tier headroom to 250 new users/day. Do this before the Reddit launch. The proxy rate limiting (P1.1) is second priority — without it, a single scraper can exhaust the Travelpayouts quota for all users in minutes.
