# Peakly DevOps Report — 2026-05-30

**Status: 🟡 YELLOW**

No P0s. One P1 bleeding for 17 days (APNS decision, self-imposed deadline was 2026-05-13). One new P1 (Open-Meteo thundering herd on VPS restart — the cache protecting the free-tier limit is in-memory only and evaporates on every `pm2 restart`). Two P2s (SRI missing on React/Babel, CSP absent). Supabase (2.106.2) and Babel (7.29.7) are now current as of the 2026-05-28 commit. Everything else green.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 523,480 (~511 KB raw, ~125 KB gzip est.) | ✅ |
| Cache buster | `20260528a` — synced across app.jsx, sw.js, index.html | ✅ |
| Days since last code commit | 2 days (2026-05-28) | ✅ |
| Plausible analytics | Present, uncommented | ✅ |
| All CDN deps HTTPS | Yes | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | `https://peakly-api.duckdns.org` — HTTPS via Caddy | ✅ |
| Sentry DSN | Configured and non-empty | ✅ |
| CORS allowlist | Restrictive (4 prod origins + 3 localhost) | ✅ |
| Rate limiter | In-memory, 60 req/min/IP with 5-min GC | ✅ |
| Travelpayouts token | Server-side env only — never in client | ✅ |
| Image lazy loading | `loading="lazy"` on all 9 `<img>` tags | ✅ |
| PRECACHE | `[]` — no SW regression | ✅ |

---

## 2. FLIGHT PROXY STATUS

- **Proxy URL:** `https://peakly-api.duckdns.org` — HTTPS, TLS via Caddy + Let's Encrypt. ✅
- **Timeout:** `fetchTravelpayoutsPrice` has 5s AbortController timeout with silent fallback to null. ✅
- **Rate limit:** 60 req/min/IP, in-memory Map with 5-min GC. Works. Resets on restart — acceptable at current scale. ✅
- **CORS:** Only `j1mmychu.github.io`, `peakly.app`, and localhost variants are allowed. ✅

---

## 3. WEATHER & EXTERNAL API

- **Open-Meteo batching:** 154 venues → 4 batches of 50 weather calls + ~77 marine calls per cold page load = **~231 upstream calls per uncached user.**
- **Free tier:** 10K calls/day → **only ~43 simultaneous cold loads before hitting the daily limit.**
- **Protection:** In-memory proxy cache (2hr TTL, 4000-entry LRU). When warm, N users = 1 upstream call per coord. ✅
- **Risk:** Cache is RAM-only on a 1GB DigitalOcean droplet. A VPS restart flushes it. See **P1-B** — this is the app's most dangerous single-point failure ahead of any viral traffic.

---

## 4. SECURITY AUDIT

| Check | Result | Status |
|-------|--------|--------|
| Travelpayouts TOKEN | Server-side env only (`process.env.TRAVELPAYOUTS_TOKEN`) | ✅ |
| Supabase anon key | In client code — intentional, RLS-gated, public-safe | ✅ |
| Sentry DSN | In client code — intentional (public client DSN) | ✅ |
| TP_MARKER (710303) | Affiliate marker, not a secret token — acceptable | ✅ |
| `.gitignore` | Covers `.env`, `.p8`, `.pem`, `.pdf`, `.pptx`, business docs | ✅ |
| `.env` in repo | Not present | ✅ |
| Recent commits (last 15) | No secrets detected | ✅ |
| SRI on React / ReactDOM | **Missing** — no `integrity=` attribute | ⚠️ P2 |
| SRI on Babel standalone | **Missing** | ⚠️ P2 |
| SRI on Supabase (jsdelivr) | **Missing** | ⚠️ P2 |
| SRI on Leaflet | Present ✅ | ✅ |
| CSP meta tag | Absent | ⚠️ P2 |

---

## 5. PERFORMANCE ANALYSIS

### Estimated page-load bundle (cold, no cache)

| Asset | Est. Size |
|-------|-----------|
| React 18.3.1 (prod UMD) | ~140 KB |
| ReactDOM 18.3.1 (prod UMD) | ~419 KB |
| **Babel Standalone 7.29.7** | **~860 KB** ← #1 bottleneck |
| Supabase JS 2.106.2 (UMD) | ~80 KB |
| Leaflet 1.9.4 | ~143 KB |
| app.jsx (transpiled at runtime) | ~511 KB |
| Leaflet CSS | ~14 KB |
| Plus Jakarta Sans font | ~29 KB |
| **TOTAL** | **~2,196 KB (~2.1 MB)** |

**Babel Standalone is the single largest bottleneck** — 860KB to parse 511KB JSX at runtime. This is the architecture tax. No fix without a build step (intentionally off the table). CDN serves it with far-future cache headers so repeat visitors pay zero. Accept and move on.

**Supabase is still loaded eagerly in `<script>` tag (index.html line 85)** despite CLAUDE.md's claim that it's lazy-loaded. It loads unconditionally for every anon visitor. ~80KB wasted per new user who never signs in. Low urgency until MAU > 1K, but the CLAUDE.md description is factually wrong.

### CDN dependency currency

| Dep | In Use | Latest | Status |
|-----|--------|--------|--------|
| React / ReactDOM | 18.3.1 | 19.2.6 | ⚠️ Major version behind — intentional (React 19 UMD not validated) |
| Babel Standalone | 7.29.7 | 7.29.7 | ✅ Current |
| Supabase JS | 2.106.2 | 2.106.2 | ✅ Current |
| Leaflet | 1.9.4 | 1.9.4 | ✅ Current |

React 18→19 requires regression testing. Not urgent — 18.x receives security patches. Revisit post-1K-MAU.

---

## 6. COST ESTIMATE

| MAU | DigitalOcean | Supabase | Open-Meteo | GitHub Pages | Monthly Total |
|-----|-------------|----------|------------|--------------|---------------|
| Current (~0) | $6 | Free | Free | Free | **$6** |
| 1K MAU | $6 | Free | Free (proxy cache) | Free | **$6** |
| 10K MAU | $12–24 (scaled droplet) | $25 Pro (if DB > 500MB) | Free | Free | **$37–49** |
| 100K MAU | $48–96 (multi-droplet + LB) | $25 Pro | Free | Free | **$73–121** |

**Optimization notes:**
- 1GB droplet ($6/mo) sufficient through ~10K MAU. Don't touch it.
- Open-Meteo proxy cache is the free-tier shield. Costs nothing. Only need paid plan ($39/mo) at >10K cold loads/day.
- Supabase free tier (500MB DB, 1GB bandwidth) won't be exceeded before 10K users at current data footprint.

---

## P1 — HIGH (needs action today)

---

### P1-A: APNS decision 17 days overdue — iOS alert users are being silently ghosted

**Deadline was 2026-05-13. Today is 2026-05-30.**

Alerts tab is fully visible to iOS native users. They can add alerts. Push tokens register to the server. Polling worker fires every 30 minutes. Zero pushes ever deliver because APNS credentials are not configured (`/health` → `"apns":"unconfigured"`). Users have zero indication anything is wrong.

**Pick one — both are under 60 minutes:**

**Option A — Configure APNS now:**
```bash
# On your Mac:
# 1. developer.apple.com → Certificates, IDs & Profiles → Keys
# 2. New key → enable "Apple Push Notifications service" → Download .p8
# 3. Note your Key ID (10 chars) and Team ID (10 chars)

# Copy .p8 to VPS:
scp AuthKey_XXXXXXXXXX.p8 root@198.199.80.21:/opt/peakly-proxy/

# SSH to VPS and set env vars:
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 set peakly-proxy:APNS_KEY_ID    "XXXXXXXXXX"
pm2 set peakly-proxy:APNS_TEAM_ID   "XXXXXXXXXX"
pm2 set peakly-proxy:APNS_BUNDLE_ID "com.peakly.app"
pm2 set peakly-proxy:APNS_KEY_PATH  "/opt/peakly-proxy/AuthKey_XXXXXXXXXX.p8"
pm2 set peakly-proxy:APNS_PROD      "true"
pm2 restart peakly-proxy

# Verify:
curl https://peakly-api.duckdns.org/health | python3 -m json.tool | grep apns
# Expected: "apns": "configured"
```

**Option B — Gate the Alerts tab on iOS until APNS is live (30 min):**

In `app.jsx`, find the tab navigation array (search for `id: "alerts"`) and wrap the alerts entry with a platform check:

```jsx
// In the nav tab definitions array:
...(!(typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform())
  ? [{ id: "alerts", label: "Alerts", icon: "🔔" }]
  : []
),
```

Web product and Android unaffected. Ship App Store v1 without push; re-enable after Option A.

---

### P1-B: Open-Meteo thundering herd on VPS restart — 20-minute fix, zero cost

**The in-memory weather cache is the only thing keeping Open-Meteo calls within the free tier.** It lives in `_wxCache` (a `Map` in RAM). Every `pm2 restart`, `pm2 reload`, OOM kill, or VPS reboot resets it to empty. On a 1GB droplet under any real traffic, OOM kills happen.

**The math:** ~231 Open-Meteo calls per cold user. Free tier: 10K calls/day. After a cold restart, 44 simultaneous users exhaust the daily quota. Open-Meteo returns 429s. All venue condition scores go blank for the rest of the day.

**Fix — add flat-file cache persistence to `server/proxy.js`:**

Locate where `_wxCache` is defined (a `new Map()`), then add the following immediately after:

```javascript
// ─── Persist weather cache to disk so restarts don't cold-start Open-Meteo ───
const _WX_PERSIST = require('path').join(__dirname, '.wx-cache.json');

// Restore on startup
(function _wxCacheRestore() {
  try {
    if (require('fs').existsSync(_WX_PERSIST)) {
      const raw = JSON.parse(require('fs').readFileSync(_WX_PERSIST, 'utf8'));
      const now = Date.now();
      let n = 0;
      for (const [k, v] of Object.entries(raw)) {
        if (v && v.ts && (now - v.ts < 2 * 60 * 60 * 1000)) { _wxCache.set(k, v); n++; }
      }
      if (n) console.log(`[proxy] wx cache: restored ${n} entries`);
    }
  } catch (_) {}
})();

// Flush to disk every 10 minutes
setInterval(() => {
  try {
    const out = {};
    for (const [k, v] of _wxCache) out[k] = v;
    require('fs').writeFileSync(_WX_PERSIST, JSON.stringify(out));
  } catch (_) {}
}, 10 * 60 * 1000);
```

Add to `.gitignore`:
```
server/.wx-cache.json
```

**Deploy:**
```bash
# Edit server/proxy.js locally, commit, then:
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy
```

**Est. fix time: 20 minutes including SSH.**

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: Missing SRI on React, ReactDOM, Babel, Supabase

Only Leaflet has `integrity=` attributes. A compromised CDN (unpkg or jsdelivr) could serve tampered JS with full app trust.

**Generate hashes (run locally):**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag. Leaflet is the pattern to copy.

**Est. fix time: 15 minutes.**

---

### P2-B: No CSP meta tag

Babel standalone requires `unsafe-eval`, preventing a fully strict CSP. A partial CSP still enforces `connect-src` to block data exfiltration:

```html
<!-- Add to index.html <head>: -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self' https:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://unpkg.com
    https://cdn.jsdelivr.net
    https://js.sentry-cdn.com
    https://plausible.io;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://wsoqcfwkvvemtlddcgfc.supabase.co
    https://plausible.io;
  img-src 'self' https: data:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
">
```

Test Leaflet tile loading and Babel transpilation after applying — both can trigger violations.

**Est. fix time: 30 minutes + browser testing.**

---

## SCALING RISK ASSESSMENT

**What breaks first as this app scales:**

The Open-Meteo rate limit is the first wall, and the in-memory cache is the only shield. This is math, not speculation. 44 concurrent cold page loads exhaust the free tier daily quota. After a VPS restart (OOM kills are routine on a 1GB droplet under real load), the cache is empty. A Reddit post, Product Hunt feature, or any spike that drives 50+ simultaneous first-time visitors will hit 429s from Open-Meteo and blank all condition scores for every user for the rest of the day. P1-B is 20 lines of code and one SSH command. There is no valid excuse for it remaining open after today.

Secondary: Single-droplet VPS at `198.199.80.21` is a SPOF. No load balancer, no health check endpoint beyond `/health`, no auto-scale. Acceptable at < 1K MAU. At 5K MAU, migrate to DigitalOcean App Platform ($12/mo, zero-downtime deploys, built-in restart on crash).

Tertiary: Supabase free tier (500MB DB, 1GB bandwidth/month). Fine through ~10K users. Monitor the Supabase dashboard once MAU > 1K.

---

## SUMMARY

| ID | Issue | Severity | Est. Time | Days Open |
|----|-------|----------|-----------|-----------|
| P1-A | APNS decision pending — iOS alerts silent | HIGH | 30–60 min | 17 days |
| P1-B | In-memory wx cache lost on VPS restart → thundering herd | HIGH | 20 min | New today |
| P2-A | Missing SRI on React, ReactDOM, Babel, Supabase | MEDIUM | 15 min | Ongoing |
| P2-B | No CSP meta tag | MEDIUM | 30 min | Ongoing |

**P1-B today. P1-A decision today. Nothing else is on fire.**
