# Peakly DevOps Report — 2026-04-06

**Overall Status: YELLOW**

Infrastructure is stable. No outages. All Apr 5 fixes confirmed in place: cache buster is `v=20260405a`, SW is `peakly-20260405`, `app.jsx.bak` removed from git, rate limiting live on proxy, `peakly.app` in CORS whitelist, React pinned to `18.3.1`. One P0 remains and has persisted since launch: `TP_MARKER = "YOUR_TP_MARKER"` — every flight click earns $0. This is the only thing blocking revenue from the flight affiliate channel. No new regressions detected.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| app.jsx size | ⚠️ YELLOW | 10,976 lines / 1.95 MB — Babel transpiles the full file on every cold load |
| Cache buster | ✅ GREEN | `v=20260405a` — current |
| Service worker | ✅ GREEN | `peakly-20260405` — current |
| app.jsx.bak | ✅ REMOVED | No longer tracked by git, no longer served by GitHub Pages |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` — no HTTP fallback in client code |
| Proxy timeout | ✅ GREEN | 5s AbortController + semaphore=3 concurrent cap at line 5153 |
| Proxy rate limiting | ✅ GREEN | In-memory 60 req/min/IP limiter live in `server/proxy.js` |
| Proxy CORS | ✅ GREEN | `peakly.app` + `www.peakly.app` in CORS whitelist |
| Plausible analytics | ⚠️ YELLOW | Domain `j1mmychu.github.io` — correct now, must update when `peakly.app` goes live |
| Weather cache TTL | ✅ GREEN | 30-min TTL confirmed; 10-min auto-refresh |
| Sentry DSN | ✅ GREEN | Live DSN in index.html (loader) and app.jsx line 8 `Sentry.init()` |
| Secrets in client code | ✅ GREEN | No Travelpayouts token in client; proxy reads `process.env.TRAVELPAYOUTS_TOKEN` |
| .gitignore coverage | ✅ GREEN | `.env`, `*.pem`, `*.key`, `*.bak`, `node_modules/` covered |
| Image lazy loading | ✅ GREEN | All `<img>` tags confirmed `loading="lazy"` |
| React CDN pinning | ✅ GREEN | Pinned to `react@18.3.1` and `react-dom@18.3.1` |
| **TP_MARKER placeholder** | ❌ **P0** | `"YOUR_TP_MARKER"` at line 5316 — $0 earned on ALL flight clicks since launch |
| Alert store persistence | ⚠️ P2 | `_alerts = new Map()` in proxy.js — wiped on server restart |
| VPS proxy restart pending | ⚠️ P1 | Rate limit + CORS changes pushed to repo; VPS still needs `git pull` + `pm2 restart` |
| Open-Meteo rate limit risk | ⚠️ P1 | Free tier: 10K calls/day; ~200 calls per cold session; ceiling hit at ~500 cold sessions/day |

---

## P0 — Fix Today

### TP_MARKER is a placeholder — $0 flight affiliate revenue since launch

**File:** `app.jsx` line 5316  
**Impact:** Every flight "Book" click generates $0 commission. The guard at line 5366 explicitly checks `TP_MARKER !== "YOUR_TP_MARKER"` and falls back to a bare Aviasales URL with no `marker=` parameter. Travelpayouts cannot attribute any commission without the marker. This has earned $0 since the Reddit launch.

```javascript
// CURRENT (line 5316) — broken:
const TP_MARKER = "YOUR_TP_MARKER";

// FIX — replace with your actual Travelpayouts marker (numeric ID):
const TP_MARKER = "623456";   // ← replace with real number from tp.media dashboard
```

**Jack action:**
1. Log into tp.media → "My programs" → copy the marker ID (a 6–7 digit number)
2. Run: `sed -i 's/const TP_MARKER = "YOUR_TP_MARKER"/const TP_MARKER = "YOUR_REAL_ID"/' app.jsx`
3. Run: `push "fix: activate Travelpayouts affiliate marker — flight commission live"`

**Time to fix: 5 minutes. Revenue impact: immediate.**

---

## P1 — Fix This Week

### P1-1: VPS proxy needs `git pull` + restart

The Apr 5 report added rate limiting and `peakly.app` to the CORS whitelist in `server/proxy.js`. These changes are in the repo but the live VPS is still running the old code until restarted.

```bash
ssh root@198.199.80.21
cd /path/to/peakly-server     # wherever proxy.js lives on disk
git pull origin main
pm2 restart peakly-proxy && pm2 save
```

Without this: flight prices will 403 when the peakly.app domain goes live, and the proxy is unprotected against rate-limit abuse.

**Time to fix: 3 minutes.**

---

### P1-2: Open-Meteo rate limit is the scaling wall before Reddit launch

**Math:** Free tier = 10,000 calls/day. Each cold session fetches weather for top 100 venues = ~200 API calls (weather + marine). Ceiling = **50 cold sessions/day** before exhaustion.

At 500 daily active users with 10% cold load rate = 50 cold sessions = ceiling breached. At post-Reddit 2,000 DAU = 400 cold sessions/day = **8× the free tier limit**. When exhausted: venues return 0 scores, hero card disappears, Explore tab looks empty. Users think the app is broken.

**Fix A — reduce initial fetch batch (free, 10 min, buys 3–5× headroom):**

```javascript
// app.jsx line 10586 — change 100 → 30:
const initial = VENUES.slice(0, 30);
```

This cuts cold-load calls from 200 → 60, raising the ceiling to ~165 cold sessions/day (~1,650 DAU at 10% cold rate).

**Fix B — server-side weather cache (correct long-term fix, ~2 hours):**

Add a cron job on the VPS that fetches weather for the top 200 venues every 30 minutes and caches the JSON. Clients hit the proxy cache instead of Open-Meteo directly. This collapses N-user API calls to 1 cron call per 30 minutes.

```javascript
// server/proxy.js — add weather cache endpoint:
let _weatherCache = { data: null, ts: 0 };
const WX_TTL = 30 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type } = req.query;
  const cacheKey = `${type}_${lat}_${lon}`;
  // ... serve cached response or fetch + cache from Open-Meteo
});
```

**Recommendation:** Ship Fix A before Reddit launch (10 min). Plan Fix B for the week after.

---

## P2 — Fix This Sprint

### P2-1: Alert store lost on VPS restart

**File:** `server/proxy.js` line 196  
**Problem:** `const _alerts = new Map()` is wiped on every `pm2 restart` or crash. Users who set alerts lose them silently.

```javascript
// Replace the Map with file-backed persistence:
const fs = require('fs');
const ALERTS_PATH = '/var/lib/peakly/alerts.json';

function _loadAlerts() {
  try {
    fs.mkdirSync('/var/lib/peakly', { recursive: true });
    return new Map(JSON.parse(fs.readFileSync(ALERTS_PATH, 'utf8')));
  } catch { return new Map(); }
}
function _saveAlerts(m) {
  try { fs.writeFileSync(ALERTS_PATH, JSON.stringify([...m])); } catch {}
}
const _alerts = _loadAlerts();
// Add _saveAlerts(_alerts); after every .set() and .delete()
```

**Time to fix:** 20 minutes. No new dependencies.

---

### P2-2: Plausible domain must update before peakly.app migration

**File:** `index.html` line 32  
**Current:** `data-domain="j1mmychu.github.io"` — correct today  
**Risk:** When peakly.app DNS goes live, Plausible silently drops all events. All 5 custom events (flight_click, venue_detail, set_alert, search, share) go dark.

```html
<!-- Change in same commit as domain switch: -->
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

Also add `peakly.app` in Plausible dashboard → Sites → add domain.

**Not urgent today. Flag before domain migration.**

---

### P2-3: No SRI hashes on CDN scripts

React, ReactDOM, Babel, and Sentry loader are all loaded without Subresource Integrity. A CDN compromise delivers arbitrary JS to every user with no warning.

```bash
# Generate hash for a script:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_HERE">
</script>
```

React is now pinned to 18.3.1 (fixed Apr 5), so SRI hashes will be stable. Generate hashes for all 3 unpkg scripts and add `integrity=` attributes.

**Time to fix:** 30 minutes.

---

## Cost Projection

| MAU | VPS ($) | GitHub Pages | Open-Meteo | Total/month |
|-----|---------|--------------|------------|-------------|
| Current (~200) | $6 | Free | Free | **$6** |
| 1,000 | $6 | Free | Free (with Fix A) | **$6** |
| 5,000 | $6–12 | Free | $0–40 | **$6–52** |
| 10,000 | $12 | Free | $40 (commercial) | **$52** |
| 100,000 | $48 + LB | Free | $150+ | **$200+** |

---

## What Breaks First at Scale

Open-Meteo is the hard ceiling before any other infrastructure concerns. The free tier at 10K calls/day is not a soft limit — it returns 429s that cause every venue to score 0. The math puts the breach point at 50 concurrent cold sessions per day, which is trivially easy to hit with a single Reddit post going viral. Reducing the initial batch from 100 → 30 venues (Fix A above) buys 3× headroom at zero cost. The permanent fix is a server-side weather proxy cache — one cron job on the existing $6 droplet — but that takes 2 hours to build. Do Fix A this week; schedule Fix B before any major traffic push.

---

## Actions Required

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 1 | Get Travelpayouts marker ID → update `TP_MARKER` in app.jsx | **Jack** | **TODAY** |
| 2 | SSH to VPS: `git pull origin main && pm2 restart peakly-proxy` | Jack | **This week** |
| 3 | Reduce initial weather fetch batch 100 → 30 (app.jsx line 10586) | Dev | **Before Reddit launch** |
| 4 | Persist alert store to disk in `server/proxy.js` | Dev | This sprint |
| 5 | Add SRI hashes to 3 CDN scripts in index.html | Dev | This sprint |
| 6 | Update Plausible `data-domain` before `peakly.app` migration | Dev/Jack | Before domain switch |
| 7 | Server-side weather cache endpoint on VPS | Dev | Post-Reddit |
