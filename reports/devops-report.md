# Peakly DevOps Report — 2026-04-24

**Overall Status: 🟡 YELLOW**
No P0 fires. Two P1s that will bite post-launch. App is deployable but has known debt.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| app.jsx size | 7,140 lines / 463 KB |
| CDN scripts | All HTTPS ✅ |
| Plausible analytics | Present, uncommented ✅ |
| Cache-buster (index.html) | `v=20260417a` |
| Cache-buster (sw.js) | `peakly-20260417` |
| Both match last deploy? | ✅ — last commit was 2026-04-17. No stale issue. |

Cache-buster is 7 days old but matches the last deploy. If any deploy lands today, bump both before pushing.

---

## 2. Flight Proxy Status

| Check | Result |
|---|---|
| Proxy URL in app.jsx | `https://peakly-api.duckdns.org` ✅ HTTPS |
| Token in client code? | No — server-side `process.env.TRAVELPAYOUTS_TOKEN` only ✅ |
| TP_MARKER in client | `"710303"` — public affiliate marker, not a secret ✅ |
| Timeout | 5s AbortController ✅ |
| Retry logic | 3 attempts, 1.2s/2.4s backoff ✅ |
| Concurrency cap | Semaphore: max 3 concurrent requests ✅ |

Proxy is solid. CORS allowlist correctly gates to `j1mmychu.github.io`, `peakly.app`, and localhost. Rate limiter at 60 req/min/IP is appropriate.

**One hole in proxy.js:** `fetchJson()` has an 8s timeout on the HTTPS request, but there's no timeout on the response body streaming. A slow-drip server could hang the connection indefinitely.

Fix in `server/proxy.js`:
```js
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      res.setTimeout(8000, () => { req.destroy(); reject(new Error('Response body timeout')); }); // ADD
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(body) }); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    });
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
  });
}
```

**Time to fix: 5 minutes.**

---

## 3. Weather & External APIs

| Check | Result |
|---|---|
| Open-Meteo endpoints | `api.open-meteo.com/v1`, `marine-api.open-meteo.com/v1` ✅ |
| Batch size | 50 venues / batch, 2s between batches ✅ |
| Weather cache TTL | 2hr re-fetch / 6hr hard eviction ✅ |
| Flight cache TTL | 15min re-fetch / 2hr cleanup ✅ |
| Free tier risk (10K calls/day) | Low at current MAU — 229 venues × 2 APIs = 458 calls max per cold user |

At 1K concurrent cold-cache users, worst case is 458K calls/day. **That blows the Open-Meteo free tier the moment traffic spikes.** Open-Meteo charges $0 up to 10K/day, then requires a commercial plan (~$200/month). Mitigation: server-side weather cache (see Scaling section below).

---

## 4. Security Audit

### ✅ Passing

- No API tokens, secrets, or credentials in `app.jsx` or `index.html`
- Travelpayouts token strictly server-side via `process.env.TRAVELPAYOUTS_TOKEN`
- `.gitignore` covers `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`
- Sentry DSN in `app.jsx` (line 8) — intentional; Sentry DSNs are designed to be public
- No secrets in last 10 commits (reviewed)

### ❌ P1 — No SRI on CDN Scripts

None of the three CDN scripts have `integrity` attributes. A compromised unpkg CDN push could inject arbitrary JS into every Peakly session.

```html
<!-- Current (vulnerable) -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
```

Generate hashes:
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then in `index.html`:
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_HERE" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-HASH_HERE" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha384-HASH_HERE" crossorigin="anonymous"></script>
```

**Time to fix: 15 minutes.**

### ❌ P2 — No CSP

No `Content-Security-Policy` meta tag. GitHub Pages doesn't support custom HTTP headers, so a meta tag is the only option. Babel Standalone requires `'unsafe-eval'`, which limits CSP effectiveness, but blocking unknown script origins is still worth doing.

Add to `index.html` `<head>`:
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

### ❌ P2 — Sentry tracesSampleRate: 1.0

```js
// Current (app.jsx line 9) — samples 100% of transactions
tracesSampleRate: 1.0,
```

Sentry free tier: 10K performance units/month. At 1K MAU × 5 sessions × 3 transactions = 15K/month. **You hit the wall at ~667 MAU.**

Fix in `app.jsx`:
```js
Sentry.init({
  dsn: "https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/4511108673765376",
  tracesSampleRate: 0.05,         // was 1.0
  replaysSessionSampleRate: 0.05, // was 0.1
  replaysOnErrorSampleRate: 1.0,  // keep — errors always replayed
});
```

**Time to fix: 2 minutes.**

---

## 5. Performance Analysis

| Metric | Value |
|---|---|
| app.jsx | 463 KB (~140 KB gzipped) |
| Babel Standalone 7.24.7 | ~1.5 MB (~550 KB gzipped) |
| React 18.3.1 + ReactDOM | ~175 KB (~55 KB gzipped) |
| **Total JS payload** | **~2.1 MB uncompressed / ~745 KB gzipped** |
| Images lazy-loaded | ✅ All 8 `<img>` tags use `loading="lazy"` |
| CDN React version | 18.3.1 — current ✅ |
| CDN Babel version | 7.24.7 — 7.26.x available, minor delta, not urgent |

**Biggest single bottleneck: Babel Standalone.**

The app ships 1.5MB of a JavaScript compiler that runs 7,140 lines of JSX transpilation on the main thread on every cold load. On a mid-range Android over 4G: 600–900ms blocked. There is no fix without adding a build step, which violates project constraints. Accepted debt.

**Second bottleneck: 229-venue weather fetch on open.** Cold cache = up to 458 HTTP requests in batches. Even with 50-per-batch / 2s throttling, full score population takes ~20 seconds. Acceptable now; painful above 10K MAU.

---

## 6. Critical Bug: Alerts Are Ephemeral — P1

`proxy.js` stores alert registrations in a JavaScript `Map` in process memory:

```js
const _alerts = new Map(); // in-memory store (replace with DB later)
```

A droplet reboot, `pm2 restart`, or any deploy wipes every registered alert with zero notification to users. Additionally, there is **no polling worker** — `CLAUDE.md` documents this gap. Alerts are registered but never evaluated or fired.

**Minimum viable fix — persist to disk:**

Add to `server/proxy.js`:
```js
const ALERTS_PERSIST_PATH = process.env.ALERTS_PATH
  || path.join(__dirname, 'data', 'alerts.json');

function _loadAlerts() {
  try {
    const entries = JSON.parse(fs.readFileSync(ALERTS_PERSIST_PATH, 'utf8'));
    for (const [k, v] of entries) _alerts.set(k, v);
    console.log(`[alerts] loaded ${_alerts.size} alerts`);
  } catch {}
}

function _saveAlerts() {
  try {
    fs.mkdirSync(path.dirname(ALERTS_PERSIST_PATH), { recursive: true });
    fs.writeFileSync(ALERTS_PERSIST_PATH, JSON.stringify([..._alerts.entries()]));
  } catch (e) { console.error('[alerts] save failed:', e.message); }
}

_loadAlerts(); // call at module load
```

Then in `POST /api/alerts`, after `_alerts.set(alertId, record)`:
```js
_alerts.set(alertId, record);
_saveAlerts(); // ADD THIS
```

And in `DELETE /api/alerts/:alertId`, after `_alerts.delete(alertId)`:
```js
_alerts.delete(alertId);
_saveAlerts(); // ADD THIS
```

**Time to fix: 30 minutes.** Polling worker is a separate effort (4–8 hours).

---

## 7. Cost Projection

| Scale | Open-Meteo | VPS | GitHub Pages | Monthly Total |
|---|---|---|---|---|
| Today (~0 MAU) | Free | $6 | Free | **$6** |
| 1K MAU | Free | $6 | Free | **$6** |
| 10K MAU | Free* | $12 (2GB upgrade) | Free | **$12** |
| 100K MAU | $200+ | $48 (2× $24 + LB) | Free | **$250+** |

*Free tier survives at 10K MAU only if localStorage caches absorb repeat visits. A single viral day with 5K simultaneous cold-cache users = 2.3M API calls. Instant account suspension from Open-Meteo.

---

## 8. What Breaks First at Scale

**The client-side weather fetch model is the structural failure at 5K MAU.** A surge of cold-cache users simultaneously hammers Open-Meteo through GitHub Pages CDN edge nodes (shared IPs). Open-Meteo rate-limits the shared IP. Scores stop loading app-wide, silently. Users see spinners forever. No alerting fires because the failure is entirely client-side.

**Prevention — add server-side weather cache before 5K MAU:**

```js
// New endpoint in server/proxy.js
const wx_cache = new Map(); // { key: { data, ts } }
const WX_TTL = 2 * 60 * 60 * 1000; // 2hr

app.get('/api/weather', async (req, res) => {
  const { lat, lon, days = 7 } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
  const key = `${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)}`;
  const cached = wx_cache.get(key);
  if (cached && Date.now() - cached.ts < WX_TTL) return res.json(cached.data);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant`
    + `&forecast_days=${days}&timezone=auto`;
  try {
    const { json } = await fetchJson(url);
    wx_cache.set(key, { data: json, ts: Date.now() });
    res.json(json);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});
```

This collapses 5K individual browser requests to Open-Meteo into 229 cached proxy requests. Zero additional cost. Estimated implementation: 4 hours.

**Second failure: 1GB droplet OOM at 10K MAU.** The in-memory rate limit Map, alert Map, and Node.js overhead will approach the 1GB ceiling under concurrent load. Watch `pm2 monit` — upgrade to $12/2GB plan before seeing OOM kills in logs.

---

## Summary Action List

| Priority | Issue | Time |
|---|---|---|
| **P1** | Alert registrations lost on server restart | 30 min |
| **P1** | No SRI hashes on React/Babel CDN scripts | 15 min |
| **P2** | Sentry `tracesSampleRate: 1.0` — hits free tier at 667 MAU | 2 min |
| **P2** | No CSP meta tag | 20 min |
| **P2** | `fetchJson()` missing response body timeout | 5 min |
| **Pre-5K MAU** | Server-side Open-Meteo weather cache in proxy | 4 hrs |
| **Pre-10K MAU** | Upgrade droplet to 2GB ($12/mo) | 5 min |
