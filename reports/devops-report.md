# Peakly DevOps Report — 2026-04-21

**Overall Status: YELLOW**

Open-Meteo proxy still not shipped — same P1 as last 4 reports, same time bomb. Found one new regression: beach venues never get marine data on initial load despite the 04-12 fix, so beach scores on Explore are wrong every cold session. Cache busters are 4 days stale. Everything else is holding.

---

## Checks Run

| Area | Result |
|------|--------|
| Live site health | YELLOW — cache busters 4 days stale (20260417a vs today 20260421) |
| Flight proxy (HTTPS) | GREEN — `https://peakly-api.duckdns.org`, 5s timeout, semaphore(3), retry on 429 |
| Open-Meteo API usage | RED — ~135 calls/cold session; hard ceiling ~74 cold sessions/day; proxy still not shipped |
| Security audit | GREEN — no exposed tokens, Sentry DSN live, .gitignore correct |
| Beach marine regression | **NEW BUG** — initial batch uses `category === "surfing"` only; tanning venues never get marine on load |
| Performance | RED — ~3.1MB cold JS (Babel Standalone is the elephant) |
| Lazy image loading | GREEN — `loading="lazy"` on all `<img>` tags |
| CDN versions | GREEN — React 18.3.1, Babel 7.24.7, both pinned |
| Sentry | GREEN — DSN in index.html script tag + `Sentry.init()` in app.jsx |
| CORS | GREEN — allowlist covers `j1mmychu.github.io`, `peakly.app`, localhost |
| `.gitignore` | GREEN — covers `.env`, `*.key`, `*.pem`, `*.p8`, `node_modules/`, `.claude/` |
| Venue count | YELLOW — CLAUDE.md says 231, grep returns 229 |

---

## P0 — Critical (Fix Today)

**None.** Proxy is HTTPS, no tokens exposed, app loads.

---

## P1 — High (Fix This Week)

### 1. NEW: Beach Venues Missing Marine Data on Initial Load

**The 04-12 fix was incomplete.** The per-venue `fetchVenueWeather` (detail sheet) correctly fetches marine for tanning (`category === "surfing" || category === "tanning"`). But `fetchInitialWeather`, which populates the Explore tab for the first 100 venues, still has:

```javascript
// app.jsx line ~6755 — THIS IS WRONG
const needsMarine = v.category === "surfing";
```

Every cold-session beach card on Explore shows a score with zero water temperature data. Water temp is a scored component. Beach scores are quietly wrong on first load.

**Fix — one-line change in `fetchInitialWeather` in `app.jsx`:**

```javascript
// Before (line ~6755):
const needsMarine = v.category === "surfing";

// After:
const needsMarine = v.category === "surfing" || v.category === "tanning";
```

**Estimated time: 2 minutes.**

---

### 2. Open-Meteo Rate Limit: Will Explode on First Viral Post (Carried from 04-16, 04-17)

**Numbers (updated for actual code):**
- `fetchInitialWeather` loads first 100 venues per cold session
- ~35 of those are surfing → 35 marine calls. Plus 100 weather = **~135 calls/cold session**
- Open-Meteo free tier: 10,000 calls/day
- **Hard ceiling: ~74 cold sessions** before daily quota is gone
- A single r/surfing post driving 80 new users burns the quota in one hour
- Every subsequent user that day sees scoreless cards. The app's entire value prop disappears.

**Fix — server-side weather proxy on VPS. Add to `server/proxy.js`:**

```javascript
// ─── Weather proxy with 30-min coordinate-level cache ─────────────────────────
const weatherCache = new Map();
const WEATHER_TTL = 30 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type } = req.query;
  const latF = parseFloat(lat);
  const lonF = parseFloat(lon);
  if (!lat || !lon || isNaN(latF) || isNaN(lonF) || latF < -90 || latF > 90 || lonF < -180 || lonF > 180) {
    return res.status(400).json({ error: 'valid lat and lon required' });
  }
  if (!['forecast', 'marine'].includes(type)) {
    return res.status(400).json({ error: 'type must be forecast or marine' });
  }

  const cacheKey = `${latF.toFixed(3)},${lonF.toFixed(3)},${type}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < WEATHER_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached.data);
  }

  // Forward all remaining query params to Open-Meteo
  const passthrough = Object.entries(req.query)
    .filter(([k]) => !['lat', 'lon', 'type'].includes(k))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const base = type === 'marine'
    ? 'https://marine-api.open-meteo.com/v1/marine'
    : 'https://api.open-meteo.com/v1/forecast';
  const url = `${base}?latitude=${latF}&longitude=${lonF}&${passthrough}`;

  try {
    const { status, json } = await fetchJson(url);
    if (status !== 200) return res.status(status).json(json);
    weatherCache.set(cacheKey, { data: json, ts: Date.now() });
    // Evict stale entries when cache grows large
    if (weatherCache.size > 5000) {
      const cutoff = Date.now() - WEATHER_TTL * 2;
      for (const [k, v] of weatherCache) if (v.ts < cutoff) weatherCache.delete(k);
    }
    res.setHeader('X-Cache', 'MISS');
    return res.json(json);
  } catch (err) {
    return res.status(502).json({ error: 'upstream weather error', detail: err.message });
  }
});
```

**Then update `app.jsx` constants (lines 809–810):**

```javascript
// Before:
const METEO  = "https://api.open-meteo.com/v1";
const MARINE = "https://marine-api.open-meteo.com/v1";

// After:
const METEO  = "https://peakly-api.duckdns.org/api/weather?type=forecast";
const MARINE = "https://peakly-api.duckdns.org/api/weather?type=marine";
```

And update both `fetchWeather` and `fetchMarine` to swap the URL construction from `${METEO}/forecast?latitude=...` to `${METEO}&latitude=...` (change `?` to `&` after the base constant).

**Impact:** 229 venues × 2 types = 458 cache slots. After warm-up, Open-Meteo calls drop to near zero regardless of traffic. Scales to 100K MAU on existing VPS.

**Estimated time: 3 hours.**

---

## P2 — Medium (Fix This Sprint)

### 3. Cache Busters Are 4 Days Stale

`app.jsx?v=20260417a` in index.html and `CACHE_NAME = "peakly-20260417"` in sw.js. Today is 2026-04-21. Users who visited in the last 4 days may be running the April 17 build if SW is serving stale.

**Fix — bump both in the same commit:**

`index.html` line 346:
```html
<!-- Before -->
<script type="text/babel" src="./app.jsx?v=20260417a" data-presets="react"></script>

<!-- After -->
<script type="text/babel" src="./app.jsx?v=20260421a" data-presets="react"></script>
```

`sw.js` line 2:
```javascript
// Before:
const CACHE_NAME = "peakly-20260417";

// After:
const CACHE_NAME = "peakly-20260421";
```

**Estimated time: 2 minutes.**

---

### 4. No SRI on CDN Scripts (Carried from 04-16, 04-17)

React, ReactDOM, and Babel have `crossorigin` but no `integrity=` attribute. An unpkg CDN compromise serves malicious JS to every session.

**Generate and apply hashes:**

```bash
# Run on the VPS or any machine with curl + openssl
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Add `integrity="sha384-<output>"` to each corresponding `<script>` tag in `index.html`.

**Estimated time: 30 minutes.**

---

### 5. No CSP Meta Tag (Carried from 04-16, 04-17)

Zero Content Security Policy. XSS has unrestricted DOM access.

**Add to `<head>` in `index.html` (Babel requires `unsafe-eval`):**

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' 'unsafe-eval' 'unsafe-inline'
             https://unpkg.com
             https://js.sentry-cdn.com
             https://plausible.io;
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src https://fonts.gstatic.com;
           img-src 'self' data: https://images.unsplash.com https://*.unsplash.com;
           connect-src 'self'
             https://peakly-api.duckdns.org
             https://api.open-meteo.com
             https://marine-api.open-meteo.com
             https://plausible.io
             https://*.sentry.io;">
```

Note: `'unsafe-eval'` is unavoidable with Babel Standalone. Remove it when/if you add a build step.

**Estimated time: 20 minutes.**

---

### 6. Venue Count Mismatch in CLAUDE.md

CLAUDE.md line says "VENUES (231)". `grep -c '{id:"' app.jsx` returns **229**. Two venues unaccounted for.

**Fix:**

```bash
grep -c '{id:"' app.jsx  # confirm 229
# then update CLAUDE.md:
# "VENUES (231)" → "VENUES (229)"
```

**Estimated time: 2 minutes.**

---

### 7. Strike Alerts Worker Still Dead (Known, Carried)

`/api/alerts` stores registrations in an in-memory `Map()` on the VPS. Two problems:
1. Every server restart wipes all registered alerts — zero persistence.
2. No background polling worker exists. `proxy.js` has the `_alerts` Map but nothing ever reads it, calls Open-Meteo, or fires a push notification. The feature is a complete stub.

**Minimum viable fix (without a DB):** Write alerts to `data/alerts.jsonl` on disk (same pattern as waitlist). Add a `setInterval` that runs every 30 minutes, reads the file, fetches conditions for each venue, and fires push if threshold is met. Web push requires VAPID keys — generate and store in env vars.

This is a 1-day build. Not blocking launch since it's a secondary feature, but the UI promises it and it does nothing.

**Estimated time: 1 day to build a working stub.**

---

## Cost Estimate

| Scale | Infrastructure | Notes |
|-------|---------------|-------|
| Current (pre-launch) | $6/month | DO 1GB droplet + GitHub Pages free |
| 1K MAU | $6/month | Weather proxy eliminates Open-Meteo risk. Droplet handles load easily. |
| 10K MAU | $12/month | Upgrade to 2GB droplet ($12). Travelpayouts commissions cover infra 10x over. |
| 100K MAU | $48–72/month | 4GB droplet ($24) + Cloudflare CDN ($0 free tier) + possible DO managed DB ($15) for alerts. |

**Biggest cost risk:** Without the weather proxy, 1K MAU with 3 sessions/month = 3K sessions × 135 calls = 405K calls/month vs. 300K free tier. Overage kicks in around 700 MAU. The proxy fix turns 400K calls into ~450 cache slots refreshed 48x/day = ~21K calls/month. Night and day.

---

## Performance Bottleneck

**Babel Standalone 7.24.7 — ~800KB gzip, loaded on every cold visit.**

Cold load breakdown (gzip estimates):
| Asset | Gzip Size |
|-------|-----------|
| `@babel/standalone@7.24.7` | ~800KB |
| `app.jsx` (JSX, not pre-compiled) | ~140KB |
| `react-dom@18.3.1` | ~130KB |
| `react@18.3.1` | ~45KB |
| Fonts (Plus Jakarta Sans 4 weights) | ~50KB |
| **Total** | **~1.16MB gzip / ~3.2MB raw** |

Every user pays a ~1s compile tax for Babel to parse and transpile `app.jsx` in the browser. The fix is a GitHub Actions pre-build step: run `@babel/cli` on `app.jsx` → serve compiled `app.js`. Removes Babel Standalone from the page entirely. Saves 800KB gzip on every cold visit. Highest-ROI perf improvement available.

---

## What Breaks First at Scale

**Open-Meteo quota, then VPS memory.** At 74 cold sessions the daily quota is gone and every subsequent user sees a scoreless app for the rest of the day. The $6 VPS handles thousands of proxied requests without issue — it's I/O-bound JSON passthrough. The Open-Meteo ceiling is the launch kill switch. A single Reddit post with 200 upvotes drives enough cold sessions to burn it in under 2 hours. Ship the `/api/weather` proxy before any public post. That's the only P1 that actually matters.
