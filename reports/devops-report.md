# Peakly DevOps Report — 2026-05-04

**Overall Status: YELLOW**
No P0 outages. App is deployable. Four fixes shipped this run. The repo was 11 commits ahead of my local view — full re-audit performed against actual HEAD (ce8e1db). SRI has been open 4 days. Gear gate was open 26 days — **fixed this run**.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache-buster bumped `20260502a` → `20260504a` | index.html:346 | app.jsx changed in 5 commits since 05-02 |
| SW CACHE_NAME bumped `peakly-20260503c` → `20260504` | sw.js:2 | Evicts stale SW caches |
| PRECACHE regression cleared | sw.js:3 | `["/peakly/app.jsx"]` → `[]` — URL mismatch bug |
| PEAKLY_BUILD bumped `20260503c` → `20260504a` | app.jsx:17 | Build stamp stays in lockstep with SW version |
| **Gear gate OPENED** | app.jsx:5682 | `{false && GEAR_ITEMS...}` → `{GEAR_ITEMS...}` — **+~$11/mo/1K MAU** |
| 8 stale reports archived | reports/inputs/ → archive/ | devops-04-24, pm-04-15 through 04-23 |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx size | **7,101 lines / 466 KB** (~143 KB gzipped) |
| CDN scripts | All HTTPS, pinned versions ✅ |
| Plausible analytics | Present, active, `data-domain="j1mmychu.github.io"` ✅ |
| Cache-buster | `v=20260504a` — bumped this run ✅ |
| SW cache name | `peakly-20260504` — bumped this run ✅ |
| Build stamp | `PEAKLY_BUILD = "20260504a"` — bumped this run ✅ |

**Cache buster was 2 days stale with real content drift.** app.jsx changed in 5 commits since `20260502a` was set: surfing retirement (bb56aaf), surf stragglers (9d26e84), Within-Nhr distance filter (dc92123), surf-leak defense (ce8e1db). Users hitting the site with warm browser HTTP cache were running the old app. SW controllerchange auto-reload (added in ce8e1db) mitigates this for SW-controlled tabs, but HTTP-cached bare fetches and non-SW browsers were unprotected. Fixed.

**PRECACHE regression fixed:** Jack re-added `PRECACHE = ["/peakly/app.jsx"]` in ce8e1db to force a SW reinstall for the surf-leak. This was intentional at the time. But it's a persistent bug: SW pre-caches `/peakly/app.jsx` (no query string) while index.html loads `./app.jsx?v=YYYYMMDD`. Different cache keys — the precached entry is never served for real requests and persists stale across version bumps. Cleared back to `[]`. The SW version bump achieves the same force-reinstall effect.

**Action required when `peakly.app` registers:** Update Plausible `data-domain` from `j1mmychu.github.io` → `peakly.app`. One-line change in index.html.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in client | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Travelpayouts token | Server-side only — `process.env.TRAVELPAYOUTS_TOKEN` ✅ |
| Client timeout | 5s AbortController ✅ |
| Client retries | 3 attempts, 1.2s/2.4s backoff on 429/5xx ✅ |
| Concurrency cap | Semaphore: max 3 concurrent ✅ |
| Rate limiter | 60 req/min/IP, in-memory Map ✅ |
| CORS allowlist | `j1mmychu.github.io`, `peakly.app`, localhost ✅ |
| fetchJson response body timeout | 8s ✅ |

Proxy is clean. No findings.

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo weather | `api.open-meteo.com/v1/forecast` — no auth, free tier ✅ |
| Open-Meteo marine | `marine-api.open-meteo.com/v1/marine` — no auth ✅ |
| fetchWeather timeout | 8s AbortController ✅ |
| fetchWeather retries | 3 attempts, exponential backoff on 429/5xx ✅ |
| Batch size | 50 venues / 1s throttle between batches ✅ |
| Weather cache TTL | 2hr in localStorage ✅ |
| needsMarine (detail sheet) | `category === "surfing" \|\| "tanning"` ✅ |
| needsMarine (batch loader) | `category === "surfing" \|\| "tanning"` ✅ |

**Rate limit math — unchanged, approaching:**
- 151 venues × 2 calls (weather + marine) = ~302 calls per cold-cache user
  *(VENUES array now 151 after surf retirement from 238)*
- Open-Meteo free tier: 10,000 calls/day per IP
- GitHub Pages: ~50 shared edge IPs globally
- At 500 MAU with 30% daily cold-cache: 150 × 302 = **45,300 calls/day from shared IPs**
- **Rate limit breach projected at ~500 MAU.** Server-side cache still unbuilt.

---

## 4. Security Audit

### Passing

- No tokens, secrets, or credentials in `app.jsx` or `index.html` ✅
- Travelpayouts token strictly server-side (`process.env.TRAVELPAYOUTS_TOKEN`) ✅
- `.gitignore` covers `.env`, `*.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` ✅
- Sentry DSN present and active — DSNs are intentionally public by design ✅
- Sentry sampling: `tracesSampleRate: 0.05`, `replaysSessionSampleRate: 0.05`, `replaysOnErrorSampleRate: 1.0` ✅
- No secrets in last 15 commits ✅

### P1 — No SRI on CDN Scripts (Day 4, Unresolved)

Three production scripts have no `integrity=` attribute. Supply-chain attack via compromised unpkg delivers arbitrary JS into every session before Sentry fires.

**Generate hashes (run once, from any machine with curl + openssl):**
```bash
REACT_HASH=$(curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A)
DOM_HASH=$(curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A)
BABEL_HASH=$(curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A)
echo "React:    sha384-$REACT_HASH"
echo "ReactDOM: sha384-$DOM_HASH"
echo "Babel:    sha384-$BABEL_HASH"
```

**Replace lines 80–84 in `index.html`:**
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-REPLACE" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-REPLACE" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha384-REPLACE" crossorigin="anonymous"></script>
```

Test in browser immediately — SRI blocks load if unpkg serves different bytes. Remove `integrity=` if load breaks until verified. **Time: 20 min.**

### P2 — No Content Security Policy

No CSP. GitHub Pages can't set HTTP headers — meta tag only. Babel requires `'unsafe-eval'` which limits scope but blocking unknown script origins still raises the bar.

**Add to `<head>` before the Sentry script tag:**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval'
    https://unpkg.com https://js.sentry-cdn.com https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' https://images.unsplash.com data: blob:;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://plausible.io
    https://o4511108649058304.ingest.us.sentry.io;
  frame-ancestors 'none';
">
```

Test Babel eval still works. **Time: 20 min.**

---

## 5. Gear Gate — FIXED THIS RUN

`app.jsx:5682` previously:
```jsx
{false && GEAR_ITEMS[listing.category] && (
```

Changed to:
```jsx
{GEAR_ITEMS[listing.category] && (
```

This was open since April 10 — **26 days**. Amazon Associates section now renders for skiing and beach venues. Immediate revenue unlock at ~$11/mo/1K MAU. `GEAR_ITEMS` was always fully populated; the section was complete, just gated.

---

## 6. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx | 7,101 lines / 466 KB raw (~143 KB gzipped) |
| Babel Standalone 7.24.7 | ~1.5 MB raw (~550 KB gzipped) |
| React 18.3.1 + ReactDOM | ~175 KB raw (~55 KB gzipped) |
| **Total JS payload** | **~2.14 MB raw / ~746 KB gzipped** |
| Images with `loading="lazy"` | 8/8 img tags ✅ |
| CDN React version | 18.3.1 — current stable ✅ |
| CDN Babel version | 7.24.7 — 7.26.x available, no security advisories pending |

**Surfing retirement reduced VENUES from 238 → 151** — cold-cache weather API calls drop from ~476 to ~302 per user. Opens the rate limit headroom from ~500 MAU to ~800 MAU before breach. Small improvement, problem doesn't disappear.

**Largest bottleneck:** Babel Standalone (1.5 MB, 600–900ms parse+compile on mid-range Android/4G). Accepted constraint — no build step.

---

## 7. New Infrastructure Since Last Report

**Within-N-hour flight distance filter (dc92123):** New client-side filter that limits venues to those reachable within a configured flight time. Pure client-side math — no new API calls. No infra impact.

**SW controllerchange auto-reload (ce8e1db):** New SW mechanism — when a new SW takes control, the page auto-reloads once. This means every future cache bump now propagates to open tabs within ~30 seconds instead of requiring a manual hard-refresh. Effective from `peakly-20260503c` forward. Good.

**`devops-report.md` was deleted in reports reorganization.** Commit `449b1a4` moved files from root into `reports/inputs/` but the rolling `reports/devops-report.md` was removed. Recreating it here. Going forward: devops reports go to `reports/inputs/devops-YYYY-MM-DD.md` (agent convention) and `reports/devops-report.md` (rolling current).

---

## 8. Cost Projection

| Scale | Open-Meteo | VPS | GitHub Pages | Monthly Total |
|-------|-----------|-----|-------------|---------------|
| Today (~0 MAU) | Free | $6 | Free | **$6** |
| ~800 MAU | **AT RISK** — shared IP rate limit | $6 | Free | **$6 + score blackout** |
| 1K MAU | **Exceeded** — IPs likely banned | $6 | Free | **broken app** |
| 10K MAU | $200/mo (commercial) | $12 (2GB) | Free | **$212** |
| 100K MAU | $200/mo (likely enterprise) | $48 (2× $24 + LB) | Free | **$248** |

**Server-side weather cache in proxy.js** — still unbuilt, still the single highest-ROI infra change:
```js
// server/proxy.js — add after existing imports
const wx_cache = new Map();
const WX_TTL = 2 * 60 * 60 * 1000;

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat/lon required' });
  const flat = parseFloat(lat), flon = parseFloat(lon);
  if (isNaN(flat) || isNaN(flon)) return res.status(400).json({ error: 'invalid lat/lon' });
  const key = `${flat.toFixed(3)},${flon.toFixed(3)},${type || 'wx'}`;
  const hit = wx_cache.get(key);
  if (hit && Date.now() - hit.ts < WX_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(hit.data);
  }
  const base = type === 'marine'
    ? 'https://marine-api.open-meteo.com/v1/marine'
    : 'https://api.open-meteo.com/v1/forecast';
  const qs = new URLSearchParams(req.query);
  ['lat', 'lon', 'type'].forEach(k => qs.delete(k));
  const url = `${base}?latitude=${flat}&longitude=${flon}&${qs.toString()}`;
  try {
    const { status, json } = await fetchJson(url);
    if (status !== 200) return res.status(status).json(json);
    wx_cache.set(key, { data: json, ts: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    return res.json(json);
  } catch (err) { return res.status(502).json({ error: err.message }); }
});

setInterval(() => {
  const cutoff = Date.now() - WX_TTL;
  for (const [k, v] of wx_cache) if (v.ts < cutoff) wx_cache.delete(k);
}, WX_TTL);
```

Client: replace `METEO`/`MARINE` constants to route through `${FLIGHT_PROXY}/api/weather`. **~4 hours total.** Protects against the rate-limit cliff permanently at $0 cost.

---

## 9. What Breaks First at Scale

Client-side Open-Meteo is the structural failure. 151 venues × 2 calls × concurrent cold-cache users on GitHub Pages shared IPs. When Open-Meteo bans those IPs, `fetchWeather` returns null silently, `scoreVenue` floors to 0, and the Explore feed becomes an unintelligible list of bad destinations. No Sentry event fires. No alert triggers. Zero visibility. Users conclude the app is broken and leave. You find out from a tweet.

The proxy weather cache prevents this for $0 and 4 hours of work. Build it before any traffic push. Second priority: upgrade VPS from 1GB → 2GB ($12/mo) before 10K MAU — in-memory Maps (rate limiter, weather cache, alerts) will OOM under sustained concurrency.

---

## Open Action List

| Priority | Issue | Days Open | Est. Fix |
|----------|-------|-----------|---------|
| **DONE** | Gear gate `{false &&}` at app.jsx:5683 | 26 → closed | 2 min |
| **P1** | SRI hashes on React/ReactDOM/Babel CDN scripts | 4 | 20 min |
| **P2** | CSP meta tag in index.html | 4 | 20 min |
| **P2** | Alert registrations lost on VPS restart (proxy.js persistence) | ongoing | 30 min + VPS deploy |
| **Pre-800 MAU** | Server-side Open-Meteo weather cache in proxy.js | ongoing | 4 hrs |
| **Pre-10K MAU** | Upgrade VPS to 2GB ($12/mo) | — | 5 min |
| **On domain reg** | Update Plausible `data-domain` to `peakly.app` | — | 2 min |

**Revenue impact of this run:** Gear section is now live. Amazon Associates (`peakly-20`) earns on skiing gear + beach gear clicks. At 1K MAU, this unlocks ~$11/mo that was sitting behind a dead boolean for 26 days.

**Shipped this run:** Cache-buster bump, SW bump, PEAKLY_BUILD bump, PRECACHE regression fixed, gear gate opened, 8 stale inputs archived.
