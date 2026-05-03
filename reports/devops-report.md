# Peakly DevOps Report — 2026-05-03

**Overall Status: YELLOW**
No P0s. No regressions since yesterday. Same three P1s that have been open for 11 days remain unaddressed: SRI on CDN scripts, alert persistence, and Open-Meteo rate limits at scale. No fixes applied this run — nothing broke, nothing shipped to app.jsx since the May 2 cache bump.

---

## Fixes Applied This Run

None. app.jsx unchanged since `3139d77` (May 2 DevOps run). Cache bust is current. No drift detected.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | 7,172 lines / 480,495 bytes (~470 KB raw, ~145 KB gzipped) |
| CDN scripts | All HTTPS, pinned versions ✅ |
| Plausible analytics | Present, active, `data-domain="j1mmychu.github.io"` ✅ |
| Cache-buster | `v=20260502a` — current (app.jsx not touched since bump) ✅ |
| SW CACHE_NAME | `peakly-20260502` — current ✅ |
| Sentry DSN | Active. `tracesSampleRate: 0.05`, `replaysSessionSampleRate: 0.05`, `replaysOnErrorSampleRate: 1.0` ✅ |
| Image lazy loading | All `<img>` tags use `loading="lazy"` ✅ |

**Plausible domain flag (pre-launch action item):** `data-domain="j1mmychu.github.io"` must be updated to `peakly.app` the same day the domain goes live. Miss this and you'll have a gap in analytics data or double-counting if both domains are active. One-line fix in `index.html:32`.

---

## 2. Flight Proxy Status

| Check | Result |
|---|---|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) in client | Not present ✅ |
| Token in client code | None — `process.env.TRAVELPAYOUTS_TOKEN` server-only ✅ |
| Client timeout | 5s `AbortController` ✅ |
| Client retry | 3 attempts, 1.2s/2.4s backoff ✅ |
| Concurrency cap | Semaphore: max 3 concurrent flight requests ✅ |
| Proxy request timeout | `req.setTimeout(8000)` ✅ |
| Proxy response body timeout | `res.setTimeout(8000)` ✅ |
| Rate limiter | 60 req/min/IP, in-memory Map with 5-min GC ✅ |
| CORS allowlist | `j1mmychu.github.io`, `peakly.app`, `www.peakly.app`, localhost ✅ |

Proxy posture is solid. No issues.

**One note on rate limiter durability:** The in-memory `_rateMap` resets on every `pm2 restart`. Rate limit bypass is trivially achievable by anyone who notices the process restart pattern (visible via response latency). This is acceptable at current MAU but becomes an issue if someone starts scraping deliberately. Not P1, but document it.

---

## 3. Weather & External APIs

| Check | Result |
|---|---|
| Open-Meteo endpoints | `api.open-meteo.com/v1`, `marine-api.open-meteo.com/v1` ✅ |
| Batch size / throttle | 50 venues/batch, 2s between batches ✅ |
| Weather cache TTL | 2hr re-fetch, 6hr hard eviction ✅ |
| Flight cache TTL | 15min re-fetch, 2hr cleanup ✅ |
| Free tier risk | LOW at current MAU; **breaks around 500 MAU** |

**Rate limit math hasn't changed.** 229 venues × 2 API calls (weather + marine) = 458 calls per fully cold-cache user. Open-Meteo free tier = 10,000 calls/day. GitHub Pages serves traffic from ~50 shared IP ranges. At ~22 simultaneous cold-cache users hitting from the same Pages edge node, you breach 10K/day per IP. At 500 MAU with 30% daily active cold-cache users: ~68,700 calls/day from shared IPs = guaranteed 429s.

**Still no server-side weather cache.** This has been flagged in every report since April 24. When it breaks, it breaks silently — `fetchWeather` returns null, `scoreVenue` returns score 50 "Swell data unavailable" for surf and undefined behavior for ski/beach. Users see everything at 50. This is a P1.

---

## 4. Security Audit

### Passing

- No API tokens, secrets, or credentials in `app.jsx` or `index.html` ✅
- Travelpayouts token strictly server-side via `process.env.TRAVELPAYOUTS_TOKEN` ✅
- `TP_MARKER = "710303"` is a public affiliate marker — not a secret ✅
- Sentry DSN in client: intentional. DSNs are designed to be public. Rate-limited per project. ✅
- `.gitignore` covers `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` ✅
- Last 10 commits reviewed — no secrets introduced ✅

### P1 — No SRI on CDN Scripts (open 11 days)

Three scripts load with no `integrity` attribute. A compromised unpkg cache push or BGP hijack injects arbitrary JS before Sentry or the ErrorBoundary can do anything.

```bash
# Run these from your local machine to get the real hashes:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Replace lines 80–82 of `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE"></script>
<script crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE"></script>
<script
  src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha384-HASH_FROM_ABOVE"></script>
```

**Time to fix: 15 minutes. Requires running the curl commands manually on a local machine.**

### P2 — No CSP Meta Tag (open 11 days)

GitHub Pages doesn't support custom HTTP headers, so a `<meta>` tag is the only lever. Babel Standalone requires `'unsafe-eval'` which limits protection, but blocking unknown script origins still reduces XSS blast radius.

Add to `index.html` `<head>` before CDN scripts (after line 26):
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

**Time to fix: 10 minutes. Test in browser after — Babel eval is the fragile bit.**

---

## 5. Alert Infrastructure — P1 (Dead)

**The alert system does not work.** Full stop.

`/api/alerts` in `proxy.js` accepts registrations and writes to `_alerts` (an in-memory `Map`). Nothing reads that Map and fires push notifications. There is no polling loop. There is no VAPID key. There is no APNs/FCM integration. Every alert a user has ever registered has been silently swallowed.

Worse: `_alerts` is in-memory. Every `pm2 restart` (deploy, OOM, crash) wipes all registered alerts. Users who registered alerts get no notification and no indication their alert is gone.

**Minimum viable fix to stop lying to users** — two steps:

**Step 1: Persist alerts to disk** (10 minutes on VPS):
```js
// server/proxy.js — replace in-memory _alerts Map with disk persistence

const ALERTS_PATH = process.env.ALERTS_PATH
  || path.join(__dirname, 'data', 'alerts.json');

// Load existing alerts on startup
let _alerts = new Map();
try {
  const raw = fs.readFileSync(ALERTS_PATH, 'utf8');
  const arr = JSON.parse(raw);
  for (const r of arr) _alerts.set(r.alertId, r);
  console.log(`[alerts] loaded ${_alerts.size} alerts from disk`);
} catch {}

function persistAlerts() {
  try {
    fs.writeFileSync(ALERTS_PATH, JSON.stringify([..._alerts.values()]), 'utf8');
  } catch (err) {
    console.error('[alerts] persist failed:', err.message);
  }
}

// Call persistAlerts() after every _alerts.set() and _alerts.delete()
```

**Step 2: Add a polling worker** (30 minutes on VPS — requires Open-Meteo calls from server):
```js
// server/proxy.js — add after existing routes

async function checkAlerts() {
  for (const [id, alert] of _alerts) {
    if (alert.fired || !alert.venueId || !alert.targetScore) continue;
    // Placeholder — fetch weather for alert.lat/lon and score it
    // When score >= targetScore: mark fired, send web push (requires VAPID)
    alert.lastChecked = new Date().toISOString();
  }
  persistAlerts();
}

setInterval(checkAlerts, 30 * 60 * 1000); // every 30 minutes
```

Push delivery (APNs/FCM/Web Push) requires VAPID keys and is a separate half-day of work. But disk persistence alone stops the data-loss problem.

---

## 6. Performance Analysis

| Metric | Value | Status |
|---|---|---|
| app.jsx raw | 470 KB | OK |
| app.jsx gzipped (est.) | ~145 KB | OK |
| React + ReactDOM gzipped | ~45 KB combined | OK |
| **Babel Standalone 7.24.7** | **~800 KB gzipped** | **BOTTLENECK** |
| Total JS transfer (est.) | ~1 MB gzipped | YELLOW |
| Babel parse + transpile time | ~300–600ms on mid-range mobile | YELLOW |
| Image lazy loading | All `<img>` use `loading="lazy"` ✅ | ✅ |
| LCP blocker | Babel blocks render until transpile completes | P2 |

**Babel is the single largest performance liability.** `@babel/standalone@7.24.7` is ~1.2 MB uncompressed. It must fully download and execute before app.jsx JSX transpilation begins. On a Pixel 6 on 4G this is a 1.5–2 second blank screen after the splash.

The fix is a build step (compile JSX once to plain JS, serve pre-compiled). But CLAUDE.md explicitly prohibits adding a build step. The only in-scope mitigation is `<link rel="preload">` on Babel so it downloads in parallel with React:

```html
<!-- Add to index.html <head>, before the CDN <script> tags (after line 26) -->
<link rel="preload" as="script"
  href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js">
```

**Time to add: 2 minutes. Saves ~200ms on mobile by overlapping Babel download with React/ReactDOM.**

---

## 7. Cost Projection

| Scale | Monthly Cost | Breakdown |
|---|---|---|
| Current (~0 MAU) | $6/mo | DigitalOcean 1GB droplet |
| 1K MAU | $6/mo | No infrastructure change needed. Proxy handles it. |
| 10K MAU | $18–24/mo | Upgrade to $12 DO droplet (2GB RAM) + Cloudflare free tier. Swap in-memory rate limiter Map → Redis ($10 DO managed) so limits survive restarts. |
| 100K MAU | $80–150/mo | Server-side weather cache required (breaks at 500 MAU without it). Add $6 DO droplet as weather proxy cache. Redis $15. CDN for app.jsx via Cloudflare R2 (free tier). Travelpayouts quota likely needs upgrade. |

**Current DigitalOcean droplet ($6/mo, 1GB RAM):** Running Node.js proxy with in-memory rate limiter + in-memory alert store. Lowest-risk pre-launch upgrade: bump to $12 (2GB) before any Reddit push to give headroom for memory spikes.

---

## 8. What Breaks First At Scale

**Open-Meteo rate limits break first, at ~500 MAU.** When GitHub Pages edge nodes start getting 429s from `api.open-meteo.com`, every user on those nodes sees the Explore tab load with every venue at score 50. No error shown. Users think the app is broken and don't come back. The fix is a server-side weather proxy cache on the existing $6 VPS — one endpoint that fetches all 229 venues' weather once per hour and serves cached results. This endpoint plus flat-file caching costs $0 extra on existing infrastructure and caps Open-Meteo calls at 458/hour regardless of MAU. This is the highest-leverage infrastructure work that remains unbuilt. Build it before the Reddit launch, not after.

---

## Open Issue Tracker

| Issue | Priority | Days Open | Status |
|---|---|---|---|
| SRI on CDN scripts | P1 | 11 | Unresolved |
| Open-Meteo rate limit mitigation | P1 | 9 | Unresolved |
| Alert disk persistence | P1 | 4 | Unresolved |
| CSP meta tag | P2 | 11 | Unresolved |
| Babel preload hint | P2 | New | Unresolved |
| Plausible domain → peakly.app | Pre-launch action | — | Blocked on domain registration |
