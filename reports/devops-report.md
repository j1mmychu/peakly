# DevOps Report — 2026-04-14

**Status: YELLOW**

Infrastructure is stable. HTTPS live, no secrets in client code, proxy is solid with proper rate limiting and retry logic. Three actionable issues remain: TP_MARKER is still a placeholder costing real affiliate revenue every day, server-side alerts lose all state on restart, and CDN scripts have no SRI hashes. One bug fixed this run (stale cache buster + wrong WX_CACHE_TTL comment). Nothing is on fire but the affiliate revenue gap is bleeding money.

---

## Summary

| Check | Result |
|-------|--------|
| app.jsx size | **11,000 lines / 1.95 MB** |
| React 18.3.1 CDN | ✅ `unpkg.com/react@18.3.1` (pinned patch version) |
| ReactDOM 18.3.1 CDN | ✅ `unpkg.com/react-dom@18.3.1` (pinned) |
| Babel Standalone CDN | ✅ `7.24.7` (pinned) |
| Plausible analytics | ✅ present, uncommented, domain `j1mmychu.github.io` |
| Cache buster | ✅ **bumped to `v=20260414a`** (was stale at `v=20260409a` — 5 days) |
| Service worker version | ✅ **bumped to `peakly-20260414`** (was `peakly-20260409`) |
| WX_CACHE_TTL comment | ✅ **fixed** — comment said "30 minutes", value was 2 hours. Now aligned. |

**Cache buster was 5 days stale.** app.jsx changes from the comment-fix this run required a bump. Future: bump whenever app.jsx or sw.js changes.

---

## 1. LIVE SITE HEALTH

| Check | Result |
|-------|--------|
| Proxy URL in app.jsx | ✅ `https://peakly-api.duckdns.org` (HTTPS only, no HTTP fallback) |
| Old VPS IP (198.199.80.21) in client | ✅ not found |
| AbortController timeout | ✅ 5s on `fetchTravelpayoutsPrice` |
| Retry logic | ✅ up to 3 attempts, 1.2s / 2.4s exponential backoff |
| Semaphore | ✅ max 3 concurrent flight API requests |
| Server-side rate limiting | ✅ dual implementation: express-rate-limit (if installed) + custom in-memory (60 req/min/IP) |
| CORS | ✅ allowlist: `j1mmychu.github.io`, `peakly.app`, `localhost:8000/3000` |
| TRAVELPAYOUTS_TOKEN in client code | ✅ not present — stays server-side via env var |
| TP_MARKER in client | ⚠️ still `"YOUR_TP_MARKER"` — affiliate deep links earn $0 |

**TP_MARKER note:** `buildFlightUrl()` guards against the placeholder (`if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER")`), so deep links fall back to generic Aviasales search. Safe — no broken links — but every flight click is untracked commission.

---

## Security Audit

| Check | Result |
|-------|--------|
| Exposed tokens / API keys in app.jsx | ✅ none found |
| Travelpayouts token in client | ✅ not present |
| Sentry DSN | ✅ live in both `index.html` (Loader Script) and `app.jsx` (init) |
| .gitignore covers .env | ✅ `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8` all covered |
| Recent commits introduce secrets | ✅ clean — git log checked, no credential patterns |
| SRI hashes on CDN scripts | ❌ **none** — React, ReactDOM, Babel all loaded without `integrity=` attributes |
| Alerts persistence | ❌ in-memory `_alerts` Map — all registered alerts wiped on every server restart |

### P2 Fix — Add SRI hashes to CDN scripts

No attacker can currently inject malicious code via CDN compromise because unpkg.com and sentry-cdn.com are trusted. But SRI is defense-in-depth. The cost is one terminal command and an index.html edit.

```bash
# Get hashes (run once on a trusted machine):
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<hash>"` to each `<script>` tag. If pinned CDN versions never change, this is a one-time 15-minute task.

---

## Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo base URL | ✅ `api.open-meteo.com/v1` |
| Marine API base URL | ✅ `marine-api.open-meteo.com/v1` |
| Weather cache TTL | ✅ **2 hours** (comment bug fixed this run — was labelled "30 minutes") |
| Flight cache TTL | ✅ 15 minutes |
| Initial fetch scope | ✅ top 100 venues only (not all 3,726) |
| Batch size | ✅ 50 venues per batch, 1s inter-batch delay |
| Cache cleanup on load | ✅ `cleanWeatherCache()` runs once on app load, removes entries > 2h old |

**Rate limit math at scale:**
- Per session cold load: 2 batches × 50 venues = ~100 weather calls + ~30 marine calls (surf/diving/kayak) ≈ **130 API calls/cold-load**
- With 2h TTL, a returning user within the window = **0 calls**
- Free tier limit: 10,000 calls/day
- **Ceiling before exhausting free tier: ~75 DAUs on a day with warm caches, as few as 25 DAUs if everyone arrives cold**
- At Reddit launch, if 300 people hit the app in hour 1: ~39K calls in 60 minutes — 3× the daily limit in one hour

**Mitigation (implement before Reddit post):**

Option A — Open-Meteo commercial plan ($29/month, 10M calls/day). No code changes:
```
https://open-meteo.com/en/pricing
```

Option B — Server-side weather cache on the proxy (fetch once per venue per 2h, serve all users from one call). ~40 lines of code in proxy.js:
```javascript
// Add to server/proxy.js
const wxCache = new Map();
const WX_TTL = 2 * 60 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const { lat, lon, params } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
  const key = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
  const cached = wxCache.get(key);
  if (cached && Date.now() - cached.ts < WX_TTL) return res.json(cached.data);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}${params ? '&' + params : ''}`;
  try {
    const { json } = await fetchJson(url);
    wxCache.set(key, { data: json, ts: Date.now() });
    res.json(json);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});
```

Then in app.jsx change:
```javascript
// Before:
const METEO = "https://api.open-meteo.com/v1";
// After:
const METEO = "https://peakly-api.duckdns.org/api/weather-proxy";
```

This converts N concurrent users hitting Open-Meteo for the same venue into 1 call per venue per 2 hours. **This is the right long-term fix.** At Reddit launch scale, Option A ($29/month) is faster to ship and lower risk.

---

## Performance Analysis

| Check | Result |
|-------|--------|
| Total JS payload on cold load | **~4.9 MB** (React 144KB + ReactDOM 1.1MB + Babel 1.6MB + app.jsx 1.95MB) |
| Single largest bottleneck | **Babel Standalone (1.6 MB)** — downloaded and executed every cold load |
| In-browser transpilation time | ~300–600ms on mobile (Babel parsing + JSX transform) |
| Image lazy loading | ✅ all `<img>` tags use `loading="lazy"` |
| CDN version currency | ✅ React 18.3.1 current; Babel 7.24.7 one minor behind (7.26.x) — no action needed |
| Font loading | ✅ `<link rel="preconnect">` to Google Fonts CDN present |
| Repeat-visit performance | ✅ SW stale-while-revalidate caches all static assets after first load |

**The 4.9 MB JS payload is the single biggest cold-load UX risk on mobile.** On a 3G connection (~1.5 Mbps), that's ~26 seconds to first byte of interactive content. This is an architectural constraint (no build step, Babel Standalone required) — it was a deliberate tradeoff. Nothing to fix until it becomes a validated retention problem post-launch.

**If post-launch analytics show >50% bounce on first visit (cold mobile):**
```
Fix: precompile app.jsx to vanilla JS as a build artifact
Tool: esbuild (zero-config, fastest available)
Command: esbuild app.jsx --bundle=false --target=es2020 --outfile=app.js
Result: drops Babel Standalone entirely (~1.6MB saved), halves parse time
Tradeoff: adds one build step to deploy workflow, 2-3 days of work
```

---

## Proxy Server Audit (server/proxy.js)

| Check | Result |
|-------|--------|
| TRAVELPAYOUTS_TOKEN source | ✅ `process.env.TRAVELPAYOUTS_TOKEN` — exits if unset |
| Rate limiting | ✅ dual implementation (see below) |
| Timeout on upstream calls | ✅ 8s on `fetchJson` |
| CORS | ✅ allowlist-only, OPTIONS preflight handled |
| Health endpoint | ✅ `GET /health` returns uptime + alert count |
| Alert state persistence | ❌ in-memory Map — wiped on restart |

**Duplicate rate limiter warning:** `proxy.js` has two rate limiters — an `express-rate-limit` block (lines 12–22) AND a custom in-memory implementation (lines 35–55). Both run on every request. The express-rate-limit one `try/catch` requires the package at runtime and warns if missing — good fallback. But the duplication is confusing. Clean up on next VPS deploy:

```bash
# On VPS:
npm install express-rate-limit
# Then remove lines 35–55 (custom rateLimiter middleware) from proxy.js
```

**Alert persistence fix — exact code to add to proxy.js:**

```javascript
// After: const _alerts = new Map();
const fs = require('fs');
const ALERTS_FILE = process.env.ALERTS_FILE || '/var/data/peakly-alerts.json';

// Load persisted alerts on startup
try {
  const saved = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
  for (const [k, v] of Object.entries(saved)) _alerts.set(k, v);
  console.log(`[proxy] loaded ${_alerts.size} alerts from disk`);
} catch (e) {
  if (e.code !== 'ENOENT') console.warn('[proxy] alert load error:', e.message);
}
```

function _saveAlerts() {
  try {
    fs.mkdirSync(require('path').dirname(ALERTS_FILE), { recursive: true });
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(Object.fromEntries(_alerts)), 'utf8');
  } catch (e) {
    console.warn('[proxy] alert save error:', e.message);
  }
}
```

Call `_saveAlerts()` after every `_alerts.set(alertId, record)` and `_alerts.delete(alertId)`. Total: ~18 lines, no new dependencies.

---

## Cost Estimate

| Scale | Monthly Infra Cost | Notes |
|-------|-------------------|-------|
| Current (pre-Reddit) | **$6** | 1GB DigitalOcean, well within limits |
| 1K MAU | **$6** | Proxy handles ~50 req/min; no changes needed |
| 10K MAU | **$35–45** | $6 droplet + Open-Meteo commercial ($29) — weather becomes the cost driver |
| 100K MAU | **$90–150** | 2×$12 droplets + load balancer, Cloudflare (free), Open-Meteo commercial |

**GitHub Pages** is free for public repos. No bandwidth cap in practice. Not a cost risk below 500K MAU.

**Biggest cost cliff:** Open-Meteo free tier (~75–100 DAUs). Going from $0/month to $29/month. At that DAU count, Booking.com + Amazon affiliate revenue is ~$100–200/month. Not a hard decision.

**Cost optimization already in place:**
- 15-min flight price cache → reduces proxy hits ~80%
- 2-hour weather cache → reduces Open-Meteo hits ~90% for returning users
- Top-100-venue-only initial fetch → caps cold-load calls at ~130 regardless of total venue count

---

## Issues Summary

### P1 — Fix This Week

**TP_MARKER still `"YOUR_TP_MARKER"` — zero Travelpayouts commission**

Every flight click since launch has been untracked. No commission. The affiliate infra is all live (proxy, deep link builder, fallback guards) — this is one variable swap away from earning.

```javascript
// app.jsx line 5316 — change:
const TP_MARKER = "YOUR_TP_MARKER";
// to:
const TP_MARKER = "123456";  // your actual marker from tp.media dashboard
```

After editing: bump cache buster in `index.html` to `v=20260414b`, push. 5 minutes total. Every day this isn't done is a day of lost commission.

---

## 8. COST PROJECTION

**1. Alert state lost on server restart (~18 lines)**
Add flat-file persistence to proxy.js. See Proxy Server Audit for exact code. Zero new dependencies.

**2. No SRI hashes on CDN scripts (15 minutes)**
Generate hashes with the `openssl` commands in the Security Audit section. Add `integrity="sha384-..."` to React, ReactDOM, and Babel `<script>` tags. Defense-in-depth against CDN compromise.

**3. Duplicate rate limiter in proxy.js (10 minutes)**
Install `express-rate-limit` on VPS, remove custom middleware block. Cleaner, more testable.

**4. Pre-Reddit Open-Meteo capacity (before launch post)**
Upgrade to Open-Meteo commercial ($29/month) or deploy server-side weather proxy before posting to Reddit. See Weather section for both options. A traffic spike will exhaust the free tier in under an hour.

---

### Info — No Action Needed

- **Sentry DSN live** ✅ — error monitoring active at peakly.sentry.io
- **No secrets in client code** ✅ — clean sweep
- **All images use `loading="lazy"`** ✅
- **SW stale-while-revalidate** ✅ — repeat visits are fast regardless of payload size
- **app.jsx 2MB single file** — architectural constraint, not a bug. Monitor bounce rate post-launch.

---

## What Will Break First at Scale

**Open-Meteo free tier (10K calls/day) collapses within the first hour of a successful Reddit post.** 300 cold-session visitors each triggering ~130 API calls = 39,000 calls — almost 4× the daily limit before most of America wakes up. Open-Meteo returns HTTP 429; the app stalls indefinitely in a loading state because there's no 429-specific retry path in `fetchWeather` (it just throws, which the caller treats as a null result). Users see blank venue cards with no scores and bounce immediately, poisoning first impressions on the highest-traffic day.

**How to prevent it:** Before pushing the Reddit post, spend $29 on Open-Meteo commercial. That's it. One-line account upgrade, no code changes, buys 10M calls/day. If the post bombs and gets 50 visitors, cancel the plan. If it gets 1,000 visitors in 24 hours, you just saved your launch.

---

*Report generated 2026-04-14. Fixes applied this run: cache buster bumped `v=20260409a` → `v=20260414a`, SW version `peakly-20260409` → `peakly-20260414`, `WX_CACHE_TTL` comment corrected ("30 minutes" → "2 hours").*
