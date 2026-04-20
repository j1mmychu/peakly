# Peakly DevOps Report — 2026-04-20

**Overall Status: YELLOW**

One confirmed code regression fixed inline. No P0 blockers. Two P1s need attention this week. Infrastructure is lean and healthy at current scale.

---

## What Was Checked

- app.jsx size, CDN deps, analytics, cache busters
- Flight proxy URL, HTTPS, timeout/fallback
- Open-Meteo usage and rate limits
- Security: secrets scan, Travelpayouts exposure, .gitignore, Sentry
- Performance: JS bundle, lazy loading, CDN versions
- Cost: current + projections at 1K / 10K / 100K MAU

---

## Status: GREEN Items (No Action Needed)

| Check | Result |
|---|---|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS confirmed, no bare IP |
| TP token in client code | Not present. Server-side only via `process.env.TRAVELPAYOUTS_TOKEN` |
| fetchTravelpayoutsPrice | 5s AbortController timeout, 3 retries with 1.2s/2.4s backoff, returns null on failure |
| fetchWeather | 8s AbortController timeout, 3 retries, 6hr cache TTL, returns null on failure |
| Plausible analytics | `<script defer data-domain="j1mmychu.github.io" ...>` — present, uncommented |
| Sentry DSN | Populated in both index.html CDN loader and app.jsx init. Monitoring active. |
| .gitignore | Covers `.env`, `*.env`, `*.pem`, `*.key`, `node_modules/` |
| Image lazy loading | 8/8 img tags have `loading="lazy"` — 100% |
| Cache buster sync | index.html `v=20260417a` matches sw.js `CACHE_NAME: peakly-20260417` |
| No secrets in git | Last 10 commits clean. No tokens, passwords, or API keys in any client file. |
| CORS on proxy | Locked to `j1mmychu.github.io`, `peakly.app`, localhost only |
| Proxy rate limiting | 60 req/min per IP enforced in-memory |
| IATA validation | `/^[A-Z]{3}$/` on proxy before hitting Travelpayouts |

---

## P1 — Fix This Week

### P1-A: `needsMarine` Regression in Batch Load (FIXED inline this run)

**File:** `app.jsx:6751`
**Impact:** All beach/tanning venues in the initial Explore batch load had no marine data fetched. Water temperature scoring was dead during the main browse experience — only triggered when opening the detail sheet. Introduced April 12 when the beach marine fix was applied to the detail view (`app.jsx:6729`) but not to the batch fetcher.

**Was (broken):**
```js
const needsMarine = v.category === "surfing";
```

**Now (fixed):**
```js
const needsMarine = v.category === "surfing" || v.category === "tanning";
```

**Fix status:** Applied. Cache bust needed on next deploy — bump `v=20260417a` → `v=20260420a`.

---

### P1-B: No SRI on CDN Scripts

**Impact:** If unpkg.com, js.sentry-cdn.com, or plausible.io is compromised, every Peakly user loads and executes the attacker's JS. No integrity check. This is RCE on your entire user base.

**Current (vulnerable):**
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
```

**Fix:** Compute SRI hashes and add `integrity` attributes. Run this once:

```bash
# Compute sha384 for each CDN asset
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
# → copy output as integrity="sha384-<hash>"

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then update `index.html`:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"
  crossorigin="anonymous"></script>
```

**Caveat:** Babel Standalone 7.24.7 uses `eval()` internally for JSX transpilation. Adding a strict `script-src` CSP would break it. SRI on the script tag itself is safe and completely independent from CSP — do SRI first, CSP later after the build step is added.

**Time to fix:** 15 minutes.

---

## P2 — Fix This Sprint

### P2-A: Alert Registrations Lost on Server Restart

**File:** `server/proxy.js`
**Impact:** `_alerts` is an in-memory `Map`. Any server crash, deploy, or restart silently wipes every registered alert. Users receive `"Alert registered. Conditions checked every 30 minutes."` — a lie on both counts (no polling worker exists yet, and their alert disappears on next restart).

At current scale this is acceptable. At 1K MAU with users depending on strike alerts, it's a trust-killer.

**Fix:** Persist alerts to disk the same way waitlist does. Drop-in, zero new deps:

```js
// server/proxy.js — add after WAITLIST_PATH definition
const ALERTS_PATH = process.env.ALERTS_PATH || path.join(__dirname, 'data', 'alerts.jsonl');
try { fs.mkdirSync(path.dirname(ALERTS_PATH), { recursive: true }); } catch {}

function _persistAlert(record) {
  try { fs.appendFileSync(ALERTS_PATH, JSON.stringify(record) + '\n'); } catch {}
}

function _loadAlerts() {
  try {
    const lines = fs.readFileSync(ALERTS_PATH, 'utf8').trim().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const r = JSON.parse(line);
        if (r.alertId && !r.deleted) _alerts.set(r.alertId, r);
        else if (r.deleted) _alerts.delete(r.alertId);
      } catch {}
    }
    console.log(`[proxy] Loaded ${_alerts.size} persisted alerts`);
  } catch {} // file doesn't exist yet — fine
}
_loadAlerts(); // call at module startup
```

In POST `/api/alerts`, after `_alerts.set(alertId, record);`:
```js
_persistAlert(record);
```

In DELETE `/api/alerts/:alertId`, after `_alerts.delete(alertId);`:
```js
_persistAlert({ alertId, deleted: true, deletedAt: new Date().toISOString() });
```

**Time to fix:** 30 minutes.

---

### P2-B: Babel Standalone (~1.7MB) Is The Single Largest Perf Bottleneck

**Numbers:**
- Babel Standalone 7.24.7: ~1.72 MB uncompressed, ~600 KB gzipped
- app.jsx: ~463 KB uncompressed, ~95 KB gzipped
- React 18.3.1: ~42 KB gzipped
- ReactDOM 18.3.1: ~130 KB gzipped
- **Total cold load: ~870 KB gzipped**

On a 4G mobile connection (~10 Mbps), that's ~700ms network alone before a single pixel renders. The service worker precaches only `app.jsx` — Babel, React, ReactDOM hit unpkg cold every time the SW cache expires.

**Short-term fix (5 min):** Add CDN scripts to SW precache so repeat visits use the disk cache:

```js
// sw.js — update PRECACHE array
const PRECACHE = [
  "/peakly/app.jsx",
  "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js",
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
];
```

**Long-term fix (post-launch):** Pre-transpile `app.jsx` to vanilla JS as a build step. Babel Standalone would be eliminated entirely, cutting cold-load JS by ~70%. Deferred until post-1K users.

**Time to fix (short-term):** 5 minutes.

---

### P2-C: In-Memory Rate Limiter Resets on Proxy Restart

**File:** `server/proxy.js`
**Impact:** `_rateMap` is in-memory. Any restart resets all rate limit windows, allowing a burst of 60 req per IP immediately after a deploy or crash. At current scale this is fine. At 10K MAU, a motivated bad actor could trigger a Travelpayouts billing spike during the restart window.

**Action:** No fix needed now. Revisit at 5K MAU. Redis or a simple file-backed solution at that point.

---

### P2-D: Open-Meteo Free Tier Ceiling

**Free tier:** 10,000 API requests/day.

**Math at scale:**
- Each app load fetches weather for up to 100 venues in 2 batches of 50.
- Surf + beach venues fetch marine too: up to 175 unique requests per cold load.
- With 6hr client-side cache, a user who visits once gets billed once to Open-Meteo.

| Scale | Sessions/day | Est. API requests/day | Headroom |
|---|---|---|---|
| 1K MAU | ~100 | ~200 | SAFE |
| 10K MAU | ~1,000 | ~2,000 | SAFE |
| 50K MAU | ~5,000 | ~10,000 | AT LIMIT |
| 100K MAU | ~10,000 | ~20,000 | EXCEEDED |

**Fix at ~25K MAU:** Add a `/api/weather?lat=&lon=` endpoint to the VPS proxy that caches Open-Meteo responses by lat/lon in a flat JSON file (or Redis) with a 2hr TTL. All users pull from one shared cache instead of each browser hitting Open-Meteo independently. Estimated build time: 3 hours. Also makes cold page loads faster for all users.

**If budget allows before then:** Open-Meteo commercial tier is $29/month (unlimited requests). Worth it at 10K MAU to eliminate the risk entirely.

---

## Cost Projection

| Scale | GitHub Pages | VPS Proxy | Open-Meteo | Total/month |
|---|---|---|---|---|
| Current (<100 MAU) | Free | $6 (1GB droplet) | Free | **$6** |
| 1K MAU | Free | $6 | Free | **$6** |
| 10K MAU | Free | $12 (2GB, proxy load) | Free | **$12** |
| 100K MAU | Free* | $24 (4GB/2vCPU) | $29 commercial | **~$53** |

*GitHub Pages 100GB/month bandwidth limit. At 100K MAU × 3 sessions × ~150KB wire = 45 GB. Under limit. Over 200K MAU: migrate to Cloudflare Pages (free, no bandwidth cap) — 2 hours work.

**Cost optimization:** At 50K MAU, move app.jsx to Cloudflare R2 + Workers for edge delivery. Cuts app.jsx TTFB from ~200ms (GitHub Pages CDN) to ~20ms (edge). Cost delta: ~$5/month.

---

## What Breaks First at Scale

**Open-Meteo's 10K/day free tier ceiling hits at roughly 50K–80K MAU.** When it trips, `fetchWeather` returns null for all venues, `scoreVenue` returns 50 across the board, and the Explore page becomes useless noise. There is no alert when this happens — the app degrades silently with no admin notification.

Prevention: At 25K MAU, implement a server-side weather cache on the existing VPS proxy. Single `/api/weather` endpoint, 2hr TTL, deduplicates all user requests to the same ~175 lat/lon pairs. This converts 10K individual user API calls per day into ~175 unique upstream calls per day regardless of MAU — the free tier never gets touched again.

---

## App.jsx File Stats

| Metric | Value |
|---|---|
| Lines | 7,140 |
| Size (uncompressed) | 474,566 bytes (463 KB) |
| Size (estimated gzip) | ~95 KB |
| CDN deps | React 18.3.1, ReactDOM 18.3.1, Babel 7.24.7, Plausible, Sentry |
| Cache buster | `v=20260417a` — 3 days old, bump on next deploy |

---

## Action Checklist

| Priority | Item | Est. Time | Status |
|---|---|---|---|
| P1 | needsMarine fix for tanning batch load | Done | ✅ Fixed this run |
| P1 | Add SRI hashes to React + Babel CDN scripts in index.html | 15 min | Open |
| P2 | Persist alerts to disk in proxy.js | 30 min | Open |
| P2 | Add CDN scripts to SW precache | 5 min | Open |
| P2 | Bump cache buster to v=20260420a | 2 min | Open |
| P2 | Plan server-side weather cache (do before 25K MAU) | 3 hrs | Backlog |
