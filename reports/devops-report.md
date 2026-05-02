# Peakly DevOps Report — 2026-05-02

**Overall Status: 🟡 YELLOW**
No P0s. Three issues carried from the April 24 report remain unaddressed (SRI, CSP, alert persistence). Three quick wins applied this run: cache bust, Sentry sample rate, proxy response body timeout. Ship posture is acceptable but the alert infrastructure is dead weight that erodes user trust at launch.

---

## Fixes Applied This Run

| Fix | File | Impact |
|---|---|---|
| Cache buster bumped `20260422a` → `20260502a` | `index.html`, `sw.js` | P1 resolved — app.jsx changed Apr 23 (4 venues + Tioman fix), users were served 10-day-old cached code |
| `tracesSampleRate: 1.0` → `0.05`, `replaysSessionSampleRate: 0.1` → `0.05` | `app.jsx` | P2 resolved — was burning Sentry free tier at ~667 MAU |
| Added `res.setTimeout(8000)` to `fetchJson()` | `server/proxy.js` | P2 resolved — slow-drip Travelpayouts response could hang connection indefinitely |

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | 7,150 lines / 467 KB (+10 lines / +4 KB vs Apr 24) |
| CDN scripts | All HTTPS ✅ |
| Plausible analytics | Present, uncommented, correct domain (`j1mmychu.github.io`) ✅ |
| Cache-buster before this run | `v=20260422a` — STALE (app.jsx changed Apr 23) ❌ |
| Cache-buster after this run | `v=20260502a` ✅ |
| Service worker cache before | `peakly-20260422` — STALE ❌ |
| Service worker cache after | `peakly-20260502` ✅ |

**Cache staleness was real.** Commit `969e24a` (Apr 23) added 4 venues and fixed Tioman airport after the last cache bust on Apr 22. Any returning user never saw those changes. Fixed.

---

## 2. Flight Proxy Status

| Check | Result |
|---|---|
| Proxy URL in app.jsx | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) in client code | Not present ✅ |
| Token in client code | No — `process.env.TRAVELPAYOUTS_TOKEN` server-only ✅ |
| TP_MARKER in client | `"710303"` — public affiliate marker, not a secret ✅ |
| Client timeout | 5s AbortController + 3 retries at 1.2s/2.4s backoff ✅ |
| Proxy request timeout | `req.setTimeout(8000)` ✅ |
| Proxy response body timeout | Added `res.setTimeout(8000)` this run ✅ |
| Concurrency cap | Semaphore: max 3 concurrent flight requests ✅ |
| CORS allowlist | `j1mmychu.github.io`, `peakly.app`, `www.peakly.app`, localhost ✅ |
| Rate limiter | 60 req/min/IP, in-memory Map with 5-min GC ✅ |

Proxy posture is solid. No fires.

---

## 3. Weather & External APIs

| Check | Result |
|---|---|
| Open-Meteo endpoints | `api.open-meteo.com/v1`, `marine-api.open-meteo.com/v1` ✅ |
| Batch size / throttle | 50 venues/batch, 2s between batches ✅ |
| Weather cache TTL | 2hr re-fetch, 6hr hard eviction ✅ |
| Flight cache TTL | 15min re-fetch, 2hr cleanup ✅ |
| Free tier risk (10K calls/day) | 229 venues × 2 API types = 458 max calls per cold user |

At current near-zero MAU: no issue. At 1K simultaneous cold-cache users: 458K calls. Open-Meteo free tier is 10K/day. **One viral tweet = instant account suspension.** Mitigation is the server-side weather proxy documented below. Not yet built — still the highest-leverage pre-launch infrastructure work.

---

## 4. Security Audit

### Passing

- No API tokens, secrets, or credentials in `app.jsx` or `index.html`
- Travelpayouts token strictly server-side via `process.env.TRAVELPAYOUTS_TOKEN`
- Sentry DSN in client code — intentional, DSNs are designed to be public
- `.gitignore` covers `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision`
- Last 15 commits reviewed — no secrets introduced
- TP_MARKER `"710303"` is a public affiliate marker, not a credential

### P1 — No SRI on CDN Scripts (open 8 days)

Three CDN scripts load without `integrity` attributes. A compromised unpkg push silently injects arbitrary JS into every Peakly session. This is a real supply-chain attack vector.

```bash
# Generate SRI hashes (run from any machine with curl + openssl):
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Replace the three CDN `<script>` tags in `index.html`:
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha384-HASH_FROM_ABOVE" crossorigin="anonymous"></script>
```

**Time to fix: 15 minutes.**

### P2 — No CSP Meta Tag (open 8 days)

No `Content-Security-Policy`. GitHub Pages doesn't support custom HTTP headers so a meta tag is the only option. Babel Standalone requires `'unsafe-eval'` which limits effectiveness, but blocking unknown script origins is still worth doing.

Add to `index.html` `<head>` before CDN scripts:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://unpkg.com https://js.sentry-cdn.com https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' https://images.unsplash.com data: blob:;
  connect-src 'self' https://peakly-api.duckdns.org https://api.open-meteo.com https://marine-api.open-meteo.com https://plausible.io https://o4511108649058304.ingest.us.sentry.io;
  frame-ancestors 'none';
">
```

**Time to fix: 20 minutes.**

---

## 5. Performance Analysis

| Metric | Value |
|---|---|
| `app.jsx` | 467 KB (~141 KB gzipped est.) |
| Babel Standalone 7.24.7 | ~1.5 MB (~550 KB gzipped) |
| React 18.3.1 + ReactDOM | ~175 KB (~55 KB gzipped) |
| **Total JS payload** | **~2.1 MB uncompressed / ~746 KB gzipped est.** |
| All `<img>` tags lazy-loaded | Yes — 9 confirmed instances ✅ |
| React CDN version | 18.3.1 — current ✅ |
| Babel CDN version | 7.24.7 — 7.26.x available, minor delta, not urgent |

**Largest bottleneck: Babel Standalone.** 1.5 MB JS compiler executing 7,150 lines of JSX on the main thread on every cold load. Mid-range Android over 4G: 600–900ms of blocked rendering before any app pixel appears. No fix without a build step. Accepted architectural debt.

**Second bottleneck: 229-venue weather fetch.** Cold cache = up to 458 HTTP requests batched at 50/2s. Full score population takes ~20 seconds. Tolerable today, painful above 1K MAU.

---

## 6. Alerts Infrastructure: Still Dead (P1)

`proxy.js` stores alert registrations in a JavaScript `Map` in process memory. A droplet reboot, crash, or `pm2 restart` wipes every registered alert with zero user notification. No polling worker exists. Alerts are registered and forgotten.

```js
const _alerts = new Map(); // erased on every restart
```

**Minimum viable persistence fix — add to `server/proxy.js`:**

```js
const ALERTS_FILE = process.env.ALERTS_PATH
  || path.join(__dirname, 'data', 'alerts.json');

function _loadAlerts() {
  try {
    const entries = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
    for (const [k, v] of entries) _alerts.set(k, v);
    console.log(`[alerts] loaded ${_alerts.size} alerts from disk`);
  } catch {}
}

function _saveAlerts() {
  try {
    fs.mkdirSync(path.dirname(ALERTS_FILE), { recursive: true });
    fs.writeFileSync(ALERTS_FILE, JSON.stringify([..._alerts.entries()]));
  } catch (e) { console.error('[alerts] save failed:', e.message); }
}

_loadAlerts(); // call once at bottom of file, before app.listen
```

Then add `_saveAlerts()` after every `_alerts.set()` and `_alerts.delete()` call.

**Persistence fix: 30 minutes. Polling worker (actually firing alerts): 4–8 hours.**

---

## 7. Cost Projection

| Scale | Open-Meteo | VPS (DigitalOcean) | GitHub Pages | Monthly Total |
|---|---|---|---|---|
| Today (~0 MAU) | Free | $6 | Free | **$6** |
| 1K MAU | Free* | $6 | Free | **$6** |
| 10K MAU | Free* | $12 (upgrade to 2GB) | Free | **$12** |
| 100K MAU | $200+ | $48 (2× $24 + LB) | Free | **$250+** |

*Free tier survives only if localStorage cache absorbs repeat visits. One viral day with 5K simultaneous cold-cache users = 2.3M Open-Meteo calls. Instant suspension.

**Current burn: $6/month. No optimization available at this scale.**

---

## 8. What Breaks First at Scale

**The client-side Open-Meteo fetch model is the structural failure.** A viral surge sends thousands of cold-cache users through GitHub Pages CDN edge nodes (shared IPs). Open-Meteo rate-limits the shared IP. Venue scores stop loading app-wide, silently, with no alerting and no fallback. Users see spinners indefinitely. There is no circuit breaker.

**Prevention — server-side weather proxy in `server/proxy.js` before 5K MAU:**

```js
const _wxCache = new Map();
const WX_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

app.get('/api/weather', async (req, res) => {
  const { lat, lon, type, params } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
  const key = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)},${type || 'wx'}`;
  const hit = _wxCache.get(key);
  if (hit && Date.now() - hit.ts < WX_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(hit.data);
  }
  const base = type === 'marine'
    ? 'https://marine-api.open-meteo.com/v1/marine'
    : 'https://api.open-meteo.com/v1/forecast';
  const url = `${base}?latitude=${parseFloat(lat)}&longitude=${parseFloat(lon)}${params ? '&' + params : ''}`;
  try {
    const { status, json } = await fetchJson(url);
    if (status !== 200) return res.status(status).json(json);
    _wxCache.set(key, { data: json, ts: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    return res.json(json);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
});

setInterval(() => {
  const cutoff = Date.now() - WX_TTL_MS;
  for (const [k, v] of _wxCache) if (v.ts < cutoff) _wxCache.delete(k);
}, WX_TTL_MS);
```

This collapses 5K browser-direct Open-Meteo calls into 229 proxy-cached requests per 2-hour window. Zero additional cost. Keeps Open-Meteo free tier alive through ~100K MAU. Update `fetchWeather`/`fetchMarine` in `app.jsx` to point at `${FLIGHT_PROXY}/api/weather`. Estimated implementation: 4 hours.

**Second failure: 1GB droplet OOM under load.** Rate-limit Map + alert Map + weather cache Map + Node.js heap approach the ceiling under concurrent sessions. Watch `pm2 monit` daily. Upgrade to $12/2GB before you see OOM kills in logs.

---

## Open Action List

| Priority | Issue | Est. Time | Status |
|---|---|---|---|
| **P1** | Cache buster stale (10 days, app.jsx changed) | 2 min | **FIXED this run** |
| **P1** | Alert registrations lost on server restart | 30 min | Open |
| **P1** | No SRI on React/Babel CDN scripts | 15 min | Open — 8 days |
| **P2** | Sentry `tracesSampleRate: 1.0` hits free tier at 667 MAU | 2 min | **FIXED this run** |
| **P2** | `fetchJson()` missing response body timeout | 5 min | **FIXED this run** |
| **P2** | No CSP meta tag | 20 min | Open — 8 days |
| **Pre-5K MAU** | Server-side Open-Meteo weather cache proxy | 4 hrs | Not started |
| **Pre-10K MAU** | Upgrade DO droplet to 2GB ($12/mo) | 5 min | Not started |
