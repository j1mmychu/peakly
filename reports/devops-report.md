# DevOps Report — 2026-04-19

## System Status: YELLOW

No P0 blockers. Two recurring P2 items still open after multiple reports. One P1 identified: alerts are silently dropped on every proxy restart, meaning the Alerts tab is functionally broken for any user who registered between deploys. Everything else is stable.

---

## Metrics Snapshot

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 7,140 | ✅ |
| `app.jsx` raw size | 463 KB | ✅ |
| Cache buster (`index.html`) | `v=20260417a` | ✅ current |
| Cache buster (`sw.js`) | `peakly-20260417` | ✅ current |
| Plausible analytics | Present, uncommented | ✅ |
| `<img loading="lazy">` coverage | 8 / 8 | ✅ |
| CDN scripts with SRI | 0 / 4 | ⚠️ P2 |
| CSP meta tag | None | ⚠️ P2 |
| Travelpayouts token in client | Not found | ✅ |
| Proxy HTTPS | `peakly-api.duckdns.org` (HTTPS) | ✅ |
| Fetch timeout on proxy | 5,000ms + AbortController | ✅ |
| 429 retry logic (weather) | Implemented | ✅ |
| 429 retry logic (proxy) | Implemented | ✅ |
| Duplicate `require` in proxy.js | Fixed (was flagged 3×) | ✅ |
| Sentry DSN in client | Expected — Sentry client SDK | ✅ |
| `.gitignore` covers `.env`/keys | Yes | ✅ |

---

## P0 — Critical (Fix Today, Blocks Launch)

**None.** Site is live, proxy is HTTPS, no secrets in client code.

---

## P1 — High (Fix This Week)

### 1. Alerts silently wiped on every proxy restart

**The bug:** `_alerts` is an in-memory `Map` in `server/proxy.js` (line 233). Every time the proxy restarts — deploy, crash, OOM, reboot — every registered alert is gone. Users who tapped "Alert me when this hits 80" see the alert persisted in `peakly_alerts` localStorage, but the server has no record of it. The backend will never fire a push. It also never tells the user it forgot — GET `/api/alerts/:alertId` just returns 404, silently.

**Blast radius:** 100% of alerts registered before the most recent restart are dead. This happens on every single deploy. The Alerts tab is functionally broken.

**Fix:** Mirror the `waitlist.jsonl` pattern already in the codebase. Persist to disk on write, hydrate at startup.

In `server/proxy.js`, replace:
```javascript
const _alerts = new Map(); // in-memory store (replace with DB later)
```

With:
```javascript
const ALERTS_PATH = process.env.ALERTS_PATH || path.join(__dirname, 'data', 'alerts.json');

function _loadAlerts() {
  try {
    fs.mkdirSync(path.dirname(ALERTS_PATH), { recursive: true });
    const raw = fs.readFileSync(ALERTS_PATH, 'utf8');
    return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    return new Map();
  }
}

function _persistAlerts() {
  try {
    fs.writeFileSync(ALERTS_PATH, JSON.stringify(Object.fromEntries(_alerts)));
  } catch (e) {
    console.error('[alerts] persist failed:', e.message);
  }
}

const _alerts = _loadAlerts();
```

Then add `_persistAlerts()` calls after every `_alerts.set(...)` (line ~269) and every `_alerts.delete(...)` (line ~308).

**Estimated fix time:** 20 minutes.

---

## P2 — Medium (Fix This Sprint)

### 2. No SRI on CDN scripts (fifth mention)

React, ReactDOM, Babel Standalone, and Sentry load without `integrity=` hashes. If unpkg or sentry-cdn is compromised, malicious JS runs in every session with full DOM access. React and ReactDOM are trivial — pinned versions, hashes are deterministic.

**Generate real hashes on a machine with internet access:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then update `index.html` lines 80–81 to:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE"
  crossorigin="anonymous"></script>
<script crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-HASH_FROM_ABOVE"
  crossorigin="anonymous"></script>
```

**Estimated fix time:** 10 minutes.

### 3. No CSP meta tag (third mention)

Babel Standalone forces `'unsafe-eval'`, which prevents a strict CSP. But locking down `connect-src` still blocks the highest-impact XSS vector: data exfiltration to attacker-controlled domains.

Add to `index.html` inside `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://unpkg.com https://js.sentry-cdn.com https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://plausible.io
    https://o4511108649058304.ingest.us.sentry.io;
  worker-src 'self';
  manifest-src 'self';
">
```

**Warning:** Start with `Content-Security-Policy-Report-Only` to surface violations before going live. Babel may have edge cases.

**Estimated fix time:** 30 minutes (including testing).

### 4. No uptime monitoring on the proxy

If `peakly-api.duckdns.org` dies, no alert fires anywhere. Flight prices silently fail for every user. Sign up for UptimeRobot free tier (https://uptimerobot.com), add an HTTP monitor pointing at `https://peakly-api.duckdns.org/health`, set email/Slack notification. Free, 5-minute check interval.

**Estimated fix time:** 5 minutes.

---

## Performance Analysis

### Estimated bundle loaded at parse time

| Asset | Estimated Transfer (gzip) |
|-------|--------------------------|
| Babel Standalone 7.24.7 | ~230 KB |
| React 18.3.1 | ~130 KB |
| ReactDOM 18.3.1 | ~130 KB |
| Sentry SDK | ~50 KB |
| app.jsx (raw, no gzip on GH Pages) | ~463 KB |
| **Total** | **~1 MB** |

**Biggest bottleneck:** Babel Standalone transpiling 463 KB of JSX at runtime. Estimated first-paint: 3–5s on mid-range Android over 4G. This is architectural — removing Babel requires a build step, which the project explicitly forbids. Accepted trade-off. No action needed unless user complaints spike post-launch.

**CDN version check:**
- React 18.3.1: current stable ✅
- Babel 7.24.7: behind current (7.27.x), no known security CVEs in 7.24.7 — low urgency
- Sentry: loaded from magic CDN URL (always latest) — implicit auto-update, acceptable

---

## Cost Projection

| Scale | DO VPS | Plausible | **Total/mo** |
|-------|--------|-----------|-------------|
| Current | $6 | $9 | **$15** |
| 1K MAU | $6 | $9 | **$15** |
| 10K MAU | $12 (2GB droplet) | $9 | **$21** |
| 100K MAU | $48 (multiple droplets or LB) | $19 | **~$67** |

**Optimization available now:** Self-host Plausible on the existing $6 droplet via Docker — saves $9/month with ~15 minutes of setup. Only worth it if cash flow is tight; otherwise deprioritize until post-launch.

---

## What Breaks First at Scale

**The in-memory `_alerts` Map is the single biggest scale bomb.** It resets on every restart, silently killing all registered alerts. This is already broken — just not visible yet because no users have enough session continuity to notice. Fix before Reddit launch. The disk-persistence patch above costs 20 minutes.

Second: **Open-Meteo rate limits.** No published cap but community-managed infrastructure. At 1K MAU the math is ~231K API calls/day — you're fine. At 10K MAU that's 2.3M calls/day. At that scale, either email their team, stand up a server-side weather cache (a flat JSON file refreshed every 2 hours on the VPS), or move to their commercial tier. Budget $0–50/month depending on their response.

Third: **No health monitoring.** Add UptimeRobot before launch — 5 minutes, $0.

---

## Completed Since Last Report (2026-04-17)

- ✅ Duplicate `require('fs')` + `require('path')` in proxy.js — cleaned up (was flagged 3×)
- ✅ Duplicate `/api/waitlist` route — removed
- ✅ Cache buster bumped: index.html → `20260417a`, sw.js → `peakly-20260417`

---

## Action Items for Jack

| Priority | Item | Time |
|----------|------|------|
| **P1** | Patch `_alerts` in proxy.js with disk-persistence (code above, paste-ready) | 20 min |
| P2 | Add UptimeRobot free monitor on `/health` endpoint | 5 min |
| P2 | Generate SRI hashes for React/ReactDOM, add to index.html | 10 min |
| P2 | Add CSP meta tag (start Report-Only) | 30 min |
