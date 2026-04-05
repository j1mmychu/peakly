# Peakly DevOps Report — 2026-04-05

**Overall Status: YELLOW**

No outages. HTTPS proxy confirmed live. Sentry live and DSN matched. Five fixes shipped in this run: cache buster bumped to `v=20260405a`, SW version bumped to `peakly-20260405`, `app.jsx.bak` untracked from git (was 350KB served live on GitHub Pages), `peakly.app` added to proxy CORS whitelist, and in-memory rate limiting added to proxy. Two remaining P0 items require Jack action: TP_MARKER is still a placeholder (zero affiliate flight revenue since launch), and the VPS proxy needs `git pull` + restart to pick up the CORS/rate-limit changes.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ⚠️ YELLOW | 10,976 lines / 1.95 MB — Babel transpiles all of it on every cold load |
| Cache-buster | ✅ FIXED | Was `v=20260331a` (5 days stale). Bumped to `v=20260405a` this run. |
| Service worker version | ✅ FIXED | Was `peakly-20260330` (6 days stale). Bumped to `peakly-20260405`. |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` — no HTTP in client code |
| Proxy timeout/fallback | ✅ GREEN | 5s AbortController + semaphore=3 concurrent cap |
| Plausible analytics | ⚠️ YELLOW | Domain `j1mmychu.github.io` — must update to `peakly.app` before domain switch |
| Weather cache | ✅ GREEN | 30-min TTL, localStorage; only top 100 venues fetched on cold load |
| Sentry DSN | ✅ GREEN | Live — `9416b032` in both index.html (Loader Script) and app.jsx (init), matched |
| Secrets in client code | ✅ GREEN | No Travelpayouts token; TOKEN read from env var on VPS only |
| .gitignore coverage | ✅ GREEN | Covers .env, *.pem, *.key, *.bak, node_modules |
| app.jsx.bak in repo | ✅ FIXED | Was tracked and served live (350KB dead file). Untracked this run. |
| TP_MARKER placeholder | ❌ P0 | `"YOUR_TP_MARKER"` — earning $0 on ALL flight affiliate clicks. Jack must set this. |
| Proxy rate limiting | ✅ FIXED | No rate limit existed. Added in-memory 60 req/min limiter this run. |
| Proxy CORS for peakly.app | ✅ FIXED | `peakly.app` missing from CORS whitelist. Added this run. |
| Proxy alert store | ⚠️ P2 | `_alerts` is in-memory Map — lost on process restart |
| React CDN pinning | ⚠️ P2 | `react@18` floats to latest 18.x — minor supply chain risk |
| Babel transpile overhead | 🔴 PERF | 1.1MB Babel + 2MB app.jsx transpiled on every cold load — biggest perf bottleneck |

---

## P0 — Fix Today (blocks revenue or launch)

### P0-1: TP_MARKER is placeholder — zero affiliate flight revenue since launch

```javascript
// app.jsx line 5316 — current broken state:
const TP_MARKER = "YOUR_TP_MARKER";
```

Line 5344 has a guard: `if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER")` — so every flight click falls through to a bare Aviasales URL with no `marker=` attribution. Travelpayouts cannot attribute any commission. This has been earning $0 since launch.

**Jack action required:**
1. Log in to tp.media dashboard
2. Copy your marker ID (numeric, e.g. `623456`)
3. Run these two commands:

```bash
sed -i 's/const TP_MARKER = "YOUR_TP_MARKER"/const TP_MARKER = "623456"/' app.jsx
push "fix: set Travelpayouts affiliate marker — flight commission now active"
```

**Time to fix: 5 minutes. Revenue impact: immediate, retroactively lost for every click since launch.**

---

### P0-2: VPS proxy needs `git pull` + restart to pick up this session's fixes

This session shipped three changes to `server/proxy.js`:
1. Added `peakly.app` + `www.peakly.app` to CORS whitelist (flight API will 403 after domain switch without this)
2. Added in-memory rate limiter (60 req/min/IP) to block quota exhaustion attacks
3. Rate map cleanup to prevent memory leak on long-running process

**SSH and run:**

```bash
ssh root@198.199.80.21
cd /var/www/peakly-server   # adjust path if needed
git pull origin main
pm2 restart peakly-proxy
pm2 save
```

If not using pm2:
```bash
pkill -f "node proxy.js" && nohup node proxy.js &
```

**Time to fix: 3 minutes. Required before peakly.app domain switch — otherwise flight prices will 403 on the new domain.**

---

## P1 — Fix This Week

### P1-1: Plausible domain must update before peakly.app goes live

```html
<!-- index.html line 32 — current state: -->
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

When traffic moves to peakly.app, Plausible will receive events from the wrong domain and attribute them nowhere. All custom events (flight_click, venue_detail, set_alert, search, share) go dark.

**Fix — do this in the same commit as the domain switch:**

```html
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

Also in the Plausible dashboard → Site Settings → Domains: add `peakly.app` as an additional domain. This lets both `j1mmychu.github.io` and `peakly.app` report to the same dashboard during DNS propagation.

**Time to fix: 2 minutes. Blocking before domain switch.**

---

### P1-2: Open-Meteo API exhaustion risk at 500–1K MAU

3,726 venues. Top 100 fetched on cold load = 100 weather + 100 marine = **200 API calls per cold session**. Open-Meteo free tier: 10,000 calls/day.

At **50 cold sessions/day** = 10,000 calls = ceiling. This happens at roughly 500–700 active daily users assuming ~10% are cold loads.

At **500 cold sessions/day** (post-Reddit at 5K MAU) = 100,000 calls/day = **10x the free tier limit**. When exhausted, Open-Meteo returns 429s silently. scoreVenue() returns 0 for every venue. The hero card disappears. Badges show nothing. Users see a blank Explore tab and think the app is broken.

**Fix Option A — reduce initial cold-load batch (free, 15 min):**

```javascript
// app.jsx line 10586 — change 100 → 30:
const initial = VENUES.slice(0, 30);
```

Reduces calls per cold load from 200 → 60. Buys runway to ~1,500 daily cold sessions before hitting the ceiling.

**Fix Option B — upgrade Open-Meteo at 500 MAU ($20/month):**
- Commercial tier: 10M calls/day vs 10K free
- Add API key param to both fetch URLs:

```javascript
// app.jsx ~line 4449 — add key constant:
const METEO_KEY = "YOUR_OPEN_METEO_KEY"; // from api.open-meteo.com/en/pricing
const METEO  = `https://api.open-meteo.com/v1`;
const MARINE = `https://marine-api.open-meteo.com/v1`;

// In fetchWeather() ~line 4455 — append to URL:
`${METEO}/forecast?latitude=${lat}&longitude=${lon}&...&apikey=${METEO_KEY}`
```

**Do Option A now. Plan Option B at 300 MAU.**

---

## P2 — Fix This Sprint

### P2-1: Alert persistence lost on proxy restart

```javascript
// server/proxy.js — all registered alerts live here only:
const _alerts = new Map();  // in-memory, wiped on restart
```

Every pm2 restart, deploy, or VPS reboot silently deletes all user alerts. No push notification will ever fire after a restart because there's nothing to poll against.

**Fix — persist to a JSON file (no new deps):**

```javascript
const ALERTS_FILE = '/var/www/peakly-server/alerts.json';
const fs = require('fs');

function loadAlerts() {
  try { return new Map(JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'))); }
  catch { return new Map(); }
}
function saveAlerts(map) {
  try { fs.writeFileSync(ALERTS_FILE, JSON.stringify([...map]), 'utf8'); }
  catch (e) { console.error('[alerts] save failed:', e.message); }
}
const _alerts = loadAlerts();
// After any _alerts.set() or _alerts.delete(): saveAlerts(_alerts);
```

**Time to fix: 30 minutes. Required before push notifications launch.**

---

### P2-2: React@18 floats to latest minor on unpkg

```html
<!-- index.html lines 80-81: -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

A breaking React 18.x minor or an unpkg CDN incident would silently break the entire app with no control to roll back. Risk is low but consequence is total.

**Fix — pin to exact version (React 18.3.1, latest stable):**

```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

**Time to fix: 2 minutes.**

---

### P2-3: Babel Standalone not on latest stable

Current: `7.24.7`. Latest 7.x stable: `7.26.x`. Minor security patches and perf improvements missed.

```html
<!-- index.html line 84: -->
<script src="https://unpkg.com/@babel/standalone@7.26.10/babel.min.js"></script>
```

Verify exact version at unpkg.com/@babel/standalone before updating. Test in browser after — Babel major.minor changes can affect JSX edge cases.

**Time to fix: 10 minutes including browser test.**

---

## Performance Analysis

### Single Largest Bottleneck: In-browser Babel transpilation of a 2MB file

Every cold page load:

1. Download `app.jsx` — 1.95 MB raw, ~740 KB gzipped
2. Download Babel Standalone — 1.1 MB, ~320 KB gzipped  
3. Babel parses and transpiles 10,976 lines of JSX — **2–5 seconds on mid-range mobile**
4. React initializes and mounts
5. 200 Open-Meteo calls fire (batched, 50/batch with 2s delay)
6. User sees content

Steps 1–3 are blocking. No content renders until they complete. There is no workaround within the no-build constraint — this is the architectural cost of Babel Standalone.

Lighthouse Mobile Performance score estimate: **35–55**. LCP will be red.

**Full CDN payload on cold load:**

| Asset | Raw size | Gzipped est. |
|---|---|---|
| Babel Standalone 7.24.7 | ~1,100 KB | ~320 KB |
| ReactDOM 18 | ~130 KB | ~42 KB |
| React 18 | ~42 KB | ~11 KB |
| app.jsx (raw JSX, transpiled in-browser) | ~1,950 KB | ~740 KB |
| Plus Jakarta Sans (WOFF2) | ~30 KB | ~30 KB |
| **Total cold load** | **~3,252 KB** | **~1,143 KB** |

**Image lazy loading: ✅ All venue `<img>` tags confirmed `loading="lazy"`.**

**Mitigation at post-1K scale — pre-transpile during GitHub Actions deploy:**

```yaml
# Add to .github/workflows/deploy.yml before "Upload artifact":
- name: Pre-transpile JSX
  run: |
    npm install -g @babel/core @babel/preset-react
    npx babel app.jsx --presets @babel/preset-react --out-file app.js
```

Then in `index.html`, swap:
```html
<!-- Remove this: -->
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<!-- Change this: -->
<script type="text/babel" src="./app.jsx?v=20260405a" data-presets="react">
<!-- To this: -->
<script src="./app.js?v=20260405a">
```

Saves 1.1 MB + 2–5s transpile time. Drops Lighthouse from ~50 → ~75. **Defer until after 1K users — validate product first, optimize second.**

---

## Cost Projection

| Scale | Open-Meteo | VPS (DO) | Sentry | Total/month |
|---|---|---|---|---|
| **Current (<100 MAU)** | $0 (free) | $6 (1GB droplet) | $0 (free) | **$6** |
| **500 MAU** | $0 (edge of limit) | $6 | $0 | **$6** |
| **1K MAU** | **$20 (upgrade required)** | $6 | $0 | **$26** |
| **10K MAU** | $20 | $12 (2GB droplet) | $0 | **$32** |
| **100K MAU** | $20 | $48 (4GB + LB) | $26 (Team) | **$94** |

**Cost optimization opportunities:**
1. **Now:** Reduce initial weather fetch to 30 venues (free, 15 min). Delays Open-Meteo upgrade by 6+ months.
2. **At 5K MAU:** Server-side weather cache (VPS Redis or flat JSON). One fetch per venue per 30 min shared across all users. Cuts Open-Meteo calls by ~90% — keeps cost at $20/month to 100K MAU.
3. **VPS:** $6/month is correct through 50K MAU on the current proxy load. Only upgrade if response time degrades.

---

## Scaling Failure Prediction

**What breaks first: Open-Meteo rate limiting at ~500 daily active users.**

The current architecture makes 200 API calls per cold-load session (100 weather + 100 marine for the first 100 venues). The free tier is 10,000 calls/day. At 500 daily active users with a 10% cold-load rate = 10,000 calls/day — exactly at the limit. Any spike, crawl, or load-test will push it over.

When Open-Meteo 429s start, `fetchWeather()` silently returns null, `scoreVenue()` returns 0 for every venue, and the entire Explore tab renders blank. No error message shown. Users see an app with no scores, no hero, no badges. It looks completely broken, not "loading." Churn is immediate.

**Prevention:** Reduce initial fetch batch from 100 → 30 venues today (15 min effort). Upgrade Open-Meteo commercial tier at 300 MAU ($20/month). Implement a shared server-side weather cache at 5K MAU.

---

## Fixes Shipped This Run

| Fix | File | Status |
|---|---|---|
| Cache buster `v=20260331a` → `v=20260405a` | `index.html` | ✅ Committed |
| SW cache version `peakly-20260330` → `peakly-20260405` | `sw.js` | ✅ Committed |
| `app.jsx.bak` untracked from git (was 350KB served live) | `git rm --cached` | ✅ Committed |
| Added `peakly.app` + `www.peakly.app` to CORS whitelist | `server/proxy.js` | ✅ Committed (VPS needs restart) |
| Added in-memory rate limiter (60 req/min/IP) to proxy | `server/proxy.js` | ✅ Committed (VPS needs restart) |

---

## Jack's Action Items

| # | Action | Time | Impact |
|---|---|---|---|
| 1 | Set `TP_MARKER` with actual Travelpayouts marker ID | 5 min | **Flight affiliate revenue starts immediately** |
| 2 | SSH into VPS: `git pull origin main && pm2 restart peakly-proxy` | 3 min | CORS + rate limit active; required before domain switch |
| 3 | Update Plausible `data-domain` to `peakly.app` at domain switch time | 2 min | Prevents analytics blackout |
| 4 | Reduce `VENUES.slice(0, 100)` → `VENUES.slice(0, 30)` in app.jsx | 15 min | Prevents Open-Meteo exhaustion at 500+ MAU |
| 5 | Pin React to `@18.3.1` in index.html | 2 min | Eliminates CDN float risk |
