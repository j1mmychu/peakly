# Peakly DevOps Report — 2026-04-17

**Overall Status: YELLOW**
One live P1 bug fixed this run (duplicate `/api/waitlist` route — second, better implementation was dead code for all signups since the route was first registered). Cache busters bumped. Open-Meteo rate-limit time bomb still unresolved — only fix is server-side weather caching; same recommendation as yesterday, still not shipped.

---

## Checks Run

| Area | Result |
|------|--------|
| Live site health | GREEN — cache busters bumped to 20260417a this run |
| Flight proxy (HTTPS) | GREEN — `https://peakly-api.duckdns.org`, timeout + retry + semaphore correct |
| Open-Meteo API usage | YELLOW — 100 venues × ~2 calls = ~200 calls/cold session; 10K/day limit = ~50 cold sessions before quota burns |
| Security audit | GREEN — no exposed tokens, Sentry DSN live, `.gitignore` correct |
| Duplicate route bug | **FIXED this run** — dead `/api/waitlist` stub removed from proxy.js |
| Performance | RED — ~3.1MB cold JS load (Babel Standalone dominates) |
| CDN dependency versions | GREEN — React 18.3.1 pinned, Babel 7.24.7 pinned |
| Lazy image loading | GREEN — `loading="lazy"` on all `<img>` tags |
| `.gitignore` | GREEN — covers `.env`, `*.key`, `*.pem`, `*.p8`, `node_modules/`, `.claude/` |
| Sentry | GREEN — DSN populated and SDK loaded via CDN script tag |
| CORS | GREEN — allowlist covers `j1mmychu.github.io`, `peakly.app`, localhost |

---

## P0 — Critical (Fix Today)

**None.**

---

## P1 — High (Fix This Week)

### 1. Open-Meteo Rate Limit: Will Explode on First Viral Post (Unresolved from 04-16)

**Numbers:**
- `VENUES.slice(0, 100)` = 100 venues fetched per cold session
- ~1.5 avg API calls per venue (weather + marine for surf/tanning) = ~150 calls/session
- Open-Meteo free tier: 10,000 calls/day
- **Hard ceiling: ~66 simultaneous cold sessions** before the daily quota is gone
- Any r/surfing or r/skiing post driving 100 visitors in an hour burns the quota in minutes
- All subsequent users for the rest of the day see empty/0 condition scores — the app's core value proposition disappears

**Fix — add `/api/weather` endpoint to proxy.js with 30-min in-memory cache. Clients call proxy instead of Open-Meteo directly. All 231 venues share the same server-side cache.**

Deploy this to `server/proxy.js` on the VPS, then update `fetchWeather()` and `fetchMarine()` in `app.jsx` to call `https://peakly-api.duckdns.org/api/weather?...` instead of `api.open-meteo.com` directly.

```javascript
// Add to server/proxy.js after the rate limiter section

// ─── Weather proxy with coordinate-level 30-min cache ─────────────────────────
const weatherCache = new Map(); // "lat,lon,type" → { data, ts }
const WEATHER_TTL = 30 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type, params } = req.query;
  if (!lat || !lon || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
    return res.status(400).json({ error: 'lat and lon required' });
  }
  const cacheKey = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)},${type || 'forecast'}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < WEATHER_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached.data);
  }
  const base = type === 'marine'
    ? 'https://marine-api.open-meteo.com/v1/marine'
    : 'https://api.open-meteo.com/v1/forecast';
  const url = `${base}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}${params ? '&' + params : ''}`;
  try {
    const upstream = await fetchJson(url);
    if (upstream.status !== 200) return res.status(upstream.status).json(upstream.json);
    weatherCache.set(cacheKey, { data: upstream.json, ts: Date.now() });
    if (weatherCache.size > 5000) {
      const cutoff = Date.now() - WEATHER_TTL * 2;
      for (const [k, v] of weatherCache) if (v.ts < cutoff) weatherCache.delete(k);
    }
    res.setHeader('X-Cache', 'MISS');
    return res.json(upstream.json);
  } catch (err) {
    return res.status(502).json({ error: 'upstream weather error', detail: err.message });
  }
});
```

Then in `app.jsx`, change the two base URL constants:
```javascript
// Before:
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";

// After:
const METEO  = "https://peakly-api.duckdns.org/api/weather?type=forecast";
const MARINE = "https://peakly-api.duckdns.org/api/weather?type=marine";
```

Update `fetchWeather` and `fetchMarine` to append their specific param strings via `&params=...` encoding instead of `?` chaining.

**Impact:** Reduces Open-Meteo calls from ~150/cold-session to ~0 for returning visitors and subsequent users. 231 venues × 2 call types = 462 unique cache slots. After warm-up: essentially $0 API cost regardless of traffic spike.

**Estimated time: 2-3 hours.**

---

## P2 — Medium (Fix This Sprint)

### 2. No SRI on CDN Scripts

Three unpkg.com script tags (React, ReactDOM, Babel) have no `integrity=` attribute. An unpkg CDN compromise or cache poisoning injects arbitrary code into every session.

**Exact fix — generate hashes and add to `index.html`:**
```bash
# Run these and paste the output as integrity="sha384-<hash>"
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

**Estimated time: 30 minutes.**

### 3. No CSP Meta Tag

Zero Content Security Policy. Any XSS has full DOM access.

**Add to `<head>` in index.html (Babel-compatible — requires `unsafe-eval`):**
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://js.sentry-cdn.com https://plausible.io;
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src https://fonts.gstatic.com;
           img-src 'self' data: https://images.unsplash.com;
           connect-src 'self' https://peakly-api.duckdns.org https://api.open-meteo.com https://marine-api.open-meteo.com https://plausible.io https://*.sentry.io;">
```

`'unsafe-eval'` required for Babel Standalone transpilation. Tighten after moving to a build step.

**Estimated time: 20 minutes.**

### 4. Venue Count Drift — CLAUDE.md Says 231, Codebase Has 227

CLAUDE.md states 231 venues. `grep -c "^  {id:" app.jsx` returns **227**. Either 4 venues were removed without updating the doc, or some entries are multi-line and the grep misses them.

**Fix:**
```bash
grep -c "{id:" app.jsx  # authoritative count
# then update CLAUDE.md line: "VENUES (231)" → actual number
```

**Estimated time: 5 minutes.**

---

## Fixed This Run

### FIXED: Duplicate `/api/waitlist` Route in proxy.js (was P1)

`proxy.js` had two `app.post('/api/waitlist', ...)` handlers at lines 228 and 337. Express first-match routing meant the second handler — the better one — was **completely unreachable dead code.**

**The first (winning) handler's deficiencies:**
- Weak email validation: `email.includes('@')` instead of a real regex
- No `source` field captured (lost attribution data on every signup)
- No IP logging
- `fs.mkdirSync` called inside the request handler on every POST
- Used hardcoded `WAITLIST_FILE` constant, not the env-variable-overridable `WAITLIST_PATH`

**The second (dead) handler was correct:** proper `EMAIL_RE` regex, `source` field, IP capture, env-variable path, `mkdirSync` called once at startup.

**Fix applied:** Removed the stub (old lines 228–251). The correct implementation now handles all `/api/waitlist` POSTs. No data loss — both handlers wrote to the same `data/waitlist.jsonl` path.

**Cache busters:** Bumped `index.html` to `?v=20260417a` and `sw.js` CACHE_NAME to `peakly-20260417`.

---

## Cost Estimate

| Scale | Infrastructure Cost | Notes |
|-------|-------------------|-------|
| Current (pre-launch) | $6/month | DigitalOcean 1GB droplet + GitHub Pages (free) |
| 1K MAU | $6/month | Droplet handles load. Open-Meteo free tier needs weather proxy by this point. |
| 10K MAU | $12/month | Upgrade to 2GB droplet ($12). Weather proxy on same box reduces API calls to near zero. |
| 100K MAU | $48–72/month | 4GB droplet ($24) + CDN ($12-24). Travelpayouts commissions cover infra many times over at this scale. |

**Biggest cost risk:** Open-Meteo doesn't publish commercial tier pricing. Without server-side caching, 100K cold sessions = ~15M calls/day — firmly in paid territory. With caching: 231 slots × 48 refreshes/day = ~11K calls/day. This is the difference between $0 and unknown commercial cost.

---

## Performance Bottleneck

**Babel Standalone is the single largest bottleneck: ~2.5MB raw / ~800KB gzip loaded on every page visit.**

Cold load breakdown (gzip estimates):
- `@babel/standalone@7.24.7`: ~800KB gzip
- `app.jsx` raw: ~464KB (not gzip-compressed as served by GitHub Pages for JSX type)
- `react-dom@18.3.1`: ~130KB gzip
- `react@18.3.1`: ~45KB gzip
- Fonts: ~50KB
- **Total cold: ~1.5MB gzip / ~3.5MB raw**

Post-launch fix: pre-build `app.jsx` with `@babel/cli` in a GitHub Actions step. Serve compiled JS. Remove Babel Standalone from the page. Saves 800KB gzip on every cold visit — highest ROI perf improvement available short of a full rewrite.

---

## What Breaks First at Scale

**Open-Meteo quota, not the VPS.** The $6 droplet can handle 10K+ daily requests without issue — it's doing simple JSON proxying. The breaking point is the 10,000 call/day Open-Meteo free tier. A single viral post sending 300 new visitors in 6 hours burns the entire daily quota in ~2 hours (300 users × 150 calls = 45,000 calls). Every subsequent user that day sees a blank, scoreless app. This is the #1 existential launch risk. **Ship the weather proxy before any public Reddit post.**
