# Peakly DevOps Report — 2026-04-23

**Overall Status: YELLOW**

Open-Meteo rate-limit time bomb has been P1 for 7 consecutive days (04-17 through 04-23) — weather proxy still not deployed to VPS. No new P0s. Sentry live, HTTPS confirmed, no secrets in client code. Infrastructure otherwise solid for current traffic but will buckle fast under any real load.

---

## Checks Run

| Area | Result |
|------|--------|
| Live site health | GREEN — files healthy, CDN deps pinned |
| app.jsx | 7,140 lines / 463KB |
| Cache busters | YELLOW — v=20260417a / peakly-20260417 (6 days stale, no code changes since) |
| Plausible analytics | GREEN — present, uncommented |
| Flight proxy (HTTPS) | GREEN — `https://peakly-api.duckdns.org`, 5s timeout + AbortController |
| Open-Meteo API usage | RED — ~150-200 calls/cold session, 10K/day limit = ~50-66 sessions before blackout |
| Weather proxy on VPS | RED — still not deployed (7 consecutive days flagged) |
| Security — exposed tokens | GREEN — no secrets in client code |
| Security — Travelpayouts token | GREEN — server-side only via env var, process exits if missing |
| Security — Sentry DSN | GREEN — live DSN, SDK loading via CDN script tag |
| Security — .gitignore | GREEN — covers .env, *.key, *.pem, *.p8, node_modules/, .claude/ |
| Security — SRI hashes | RED — zero integrity= attributes on React, Babel, Sentry CDN scripts |
| Security — CSP meta tag | RED — absent |
| Performance — cold JS load | RED — ~3.7MB raw (Babel Standalone alone = 1.7MB) |
| Performance — lazy images | GREEN — loading="lazy" on all img tags |
| CDN dependency versions | YELLOW — Babel 7.24.7 (latest ~7.27.x), React 18.3.1 (React 19 available, breaking) |
| Alerts polling worker | RED — /api/alerts stores registrations but no background poller fires pushes |
| CORS config | GREEN — allowlist: j1mmychu.github.io, peakly.app, localhost |
| Health endpoint | GREEN — /health returns uptime + alert count |

---

## P0 — Critical (Fix Today)

**None.**

---

## P1 — High (Fix This Week)

### 1. Open-Meteo Rate Limit — Will Explode on First Viral Post (DAY 7 UNFIXED)

**The math:**
- 100 venues fetched per cold session (`VENUES.slice(0, 100)`)
- ~1.5 avg API calls per venue (weather + marine for surf/tanning) = **~150 calls/cold session**
- Open-Meteo free tier: **10,000 calls/day**
- **Hard ceiling: ~66 simultaneous cold user sessions** before quota is gone
- Any r/surfing or r/skiing post sending 100 visitors/hour burns the quota in 40 minutes
- Every subsequent user for the rest of the day sees score 0 or "Swell data unavailable" — the entire value prop disappears silently

This fix has been recommended 7 days in a row. It hasn't shipped. It needs to ship today.

**Exact fix — add to `server/proxy.js` (before the health endpoint):**

```javascript
// ─── Weather proxy with 30-min server-side cache ────────────────────────────
const _wxCache = new Map(); // key: "lat,lon,type" → { data, ts }
const WX_TTL = 30 * 60 * 1000;

function evictWeatherCache() {
  const cutoff = Date.now() - WEATHER_TTL * 2;
  for (const [k, v] of weatherCache) if (v.ts < cutoff) weatherCache.delete(k);
}

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type, params } = req.query;
  const flat = parseFloat(lat), flon = parseFloat(lon);
  if (!lat || !lon || isNaN(flat) || isNaN(flon)) {
    return res.status(400).json({ error: 'lat and lon required' });
  }
  const cacheKey = `${flat.toFixed(3)},${flon.toFixed(3)},${type || 'wx'}`;
  const cached = _wxCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < WX_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached.data);
  }
  const base = type === 'marine'
    ? 'https://marine-api.open-meteo.com/v1/marine'
    : 'https://api.open-meteo.com/v1/forecast';
  const url = `${base}?latitude=${flat}&longitude=${flon}${params ? '&' + params : ''}`;
  try {
    const result = await fetchJson(url);
    if (result.status !== 200) return res.status(result.status).json(result.json);
    _wxCache.set(cacheKey, { data: result.json, ts: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    return res.json(result.json);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
});

// Clean stale weather cache entries every 30 min
setInterval(() => {
  const cutoff = Date.now() - WX_TTL;
  for (const [k, v] of _wxCache) if (v.ts < cutoff) _wxCache.delete(k);
}, WX_TTL);
```

**Then update `app.jsx` lines 809-810:**

```javascript
// Before:
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";

// After:
const METEO  = "https://peakly-api.duckdns.org/api/weather";
const MARINE = "https://peakly-api.duckdns.org/api/weather";
```

Then in `fetchWeather`, add `&type=forecast` to the URL. In `fetchMarine`, add `&type=marine`. The params string becomes the `params=` query arg.

**VPS deploy:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull origin main && pm2 restart proxy
```

**Estimated time:** 45 minutes. **Impact if skipped:** app goes dark on first viral day.

---

## P2 — Medium (Fix This Sprint)

### 2. Cache Busters Stale — 6 Days Since Last Bump

Last bump: April 17. Today: April 23. No code changes shipped between then and now, so users aren't missing anything — but the next time app.jsx changes, both files must be bumped in the same commit or returning users won't see the update.

**Standing rule:** every app.jsx change requires bumping both in the same commit:

```html
<!-- index.html -->
<script type="text/babel" src="./app.jsx?v=20260423a" data-presets="react"></script>
```

```javascript
// sw.js line 2
const CACHE_NAME = "peakly-20260423";
```

**Estimated time:** 2 minutes. Do it on the next app.jsx change.

---

### 3. SRI Hashes Missing on All CDN Scripts

React 18.3.1, ReactDOM 18.3.1, Babel Standalone 7.24.7, and the Sentry CDN script all load with zero `integrity=` verification. If unpkg.com is compromised or cache-poisoned, users get arbitrary JS execution with full access to their localStorage data (alerts, profile, wishlists, trips).

**Generate the correct hashes:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add to `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"
  crossorigin="anonymous"></script>
```

**Known caveat:** SRI conflicts with strict CSP + Babel inline eval. Add SRI first, CSP second, test in between.

**Estimated time:** 30 minutes.

---

### 4. CSP Meta Tag — Absent

No Content-Security-Policy. XSS from any injected script has full run of the page including all localStorage keys. Blocked on SRI (#3) first.

**Add to `<head>` in `index.html` after SRI is done:**

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://unpkg.com https://js.sentry-cdn.com https://plausible.io;
  connect-src 'self'
    https://api.open-meteo.com https://marine-api.open-meteo.com
    https://peakly-api.duckdns.org https://plausible.io
    https://*.sentry.io;
  img-src 'self' https://images.unsplash.com data:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  frame-src 'none';
">
```

`'unsafe-inline'` and `'unsafe-eval'` are required for Babel Standalone — known tradeoff. Still better than nothing.

**Estimated time:** 20 minutes (after SRI).

---

### 5. Alerts Polling Worker — Dead Code

`/api/alerts` accepts and stores registrations in `_alerts` (in-memory Map). There is no background worker. Every alert registration is a silent promise that will never fire.

Additional problem: `_alerts` is in-memory only. Every PM2 restart wipes all registered alerts with zero notification to users.

**Minimum viable polling stub to add to `server/proxy.js`:**

```javascript
// ─── Alert polling stub ───────────────────────────────────────────────────────
// Checks registered alerts every 15 min. Wire push notifications when web-push
// library is added. Requires weather proxy endpoint (P1 above) to be live first.
async function checkAlerts() {
  if (_alerts.size === 0) return;
  for (const [alertId, alert] of _alerts) {
    try {
      const result = await fetchJson(
        `http://127.0.0.1:${PORT}/api/weather?lat=${alert.lat}&lon=${alert.lon}&type=forecast`
      );
      if (result.status !== 200) continue;
      const maxTemp = result.json?.daily?.temperature_2m_max?.[0];
      if (maxTemp != null && maxTemp >= (alert.targetScore || 70)) {
        // TODO: send web-push here via web-push npm package
        console.log(`[alerts] ${alertId} threshold met (temp=${maxTemp}) — push not yet wired`);
      }
    } catch (err) {
      console.error(`[alerts] poll error ${alertId}:`, err.message);
    }
  }
}
setInterval(checkAlerts, 15 * 60 * 1000);
```

Full scoring parity (extracting `scoreVenue` to a shared module) is a 4-hour job. Do the stub first.

**Estimated time:** 30 minutes for stub, 4 hours for real scoring.

---

### 6. Plausible Analytics Domain — Will Break at peakly.app Launch

`index.html` line 32: `data-domain="j1mmychu.github.io"`. When traffic moves to `peakly.app`, analytics breaks silently. No dashboard alert will fire.

**Fix when peakly.app is live:**
```html
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

Also add `peakly.app` as a site in the Plausible dashboard. Set a calendar reminder for domain registration day.

**Estimated time:** 5 minutes.

---

### 7. Babel Standalone 7.24.7 Is 3+ Versions Behind

Babel Standalone 7.27.x has been available since early 2026. No known critical CVEs in 7.24.7, but missing 3 minor releases of parser fixes and patches. React 19 is also out but UMD migration has breaking changes — stay on 18.3.1 pre-launch.

**After launch:** upgrade Babel to 7.27.x, smoke-test in browser, bump cache busters.

**Estimated time:** 30 minutes post-launch.

---

## Cost Projection

| Scale | Monthly Infra Cost | Constraint |
|-------|-------------------|-----------|
| Current / <1K MAU | **$6/mo** | DigitalOcean 1GB + GitHub Pages (free) |
| 1K MAU | **$6/mo** | Fine — Open-Meteo proxy cache handles load |
| 10K MAU | **$12/mo** | Upgrade to 2GB droplet; weather cache makes API cost ~$0 |
| 100K MAU | **$30-60/mo** | 4GB droplet ($24) + Cloudflare CDN (~$20); Travelpayouts commissions cover it |

**Cost optimization:** The $6 droplet is efficient. The hidden cost risk is Open-Meteo: without the server-side cache, 100K cold sessions = ~15M API calls/day — well into commercial tier pricing (unknown rate). With caching: 231 venue slots × 48 refreshes/day = ~11K calls/day. Forever free.

---

## Performance Analysis

| Asset | Size (raw) | Source |
|-------|-----------|--------|
| Babel Standalone 7.24.7 | ~1.70MB | unpkg.com |
| ReactDOM 18.3.1 UMD | ~1.07MB | unpkg.com |
| app.jsx | 463KB / 7,140 lines | GitHub Pages |
| React 18.3.1 UMD | ~143KB | unpkg.com |
| Sentry SDK | ~200KB | sentry-cdn.com |
| Plus Jakarta Sans | ~80KB | Google Fonts |
| **Total cold load** | **~3.7MB raw** | — |

**Single largest bottleneck:** Babel Standalone (1.7MB) transpiles JSX in the browser on every cold visit. This is an architectural constraint of the no-build-step design — no fix without adding a build step (off the table per CLAUDE.md). Post-launch opportunity: pre-build app.jsx via `@babel/cli` in GitHub Actions, serve compiled JS, remove Babel from the page. Saves ~800KB gzip on every cold visit.

All `<img>` tags use `loading="lazy"` — GREEN.

---

## Security Summary

| Check | Status | Notes |
|-------|--------|-------|
| Travelpayouts token | CLEAN | Server-side env var only; proxy exits if missing |
| Client-side secrets | CLEAN | TP_MARKER (710303) is a public affiliate marker, not a secret |
| Sentry DSN | LIVE | DSNs are intentionally public per Sentry design |
| .gitignore | SOLID | .env, *.key, *.pem, *.p8, node_modules/, .claude/ all covered |
| Recent commits (last 20) | CLEAN | No secrets detected |
| SRI hashes | MISSING | P2 — supply chain risk on unpkg.com |
| CSP | MISSING | P2 — blocked on SRI first |
| CORS | CORRECT | Tight allowlist: j1mmychu.github.io, peakly.app, localhost |

---

## What Breaks First at Scale

**Open-Meteo rate limits. Not the VPS. Not GitHub Pages.**

The $6 droplet handles 10K+ daily requests without breaking a sweat — it's doing simple JSON proxying. The breaking point is the 10,000 call/day Open-Meteo free tier. A single viral post sending 300 new visitors in 6 hours burns the entire daily quota in ~2 hours (300 users × 150 calls = 45,000 calls). Every subsequent user that day sees a blank, scoreless app. Users churn. They don't file bug reports — they just leave.

The fix is one route in `proxy.js` and two constant changes in `app.jsx`. ~45 minutes of work. This was first flagged on 2026-04-17. It is now 2026-04-23. **Ship it before any public post anywhere.**
