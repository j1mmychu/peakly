# Peakly DevOps Report — 2026-06-08

**Status: 🟡 YELLOW**

Cache buster was 1 day stale on arrival — bumped `20260607ae` → `20260608a` this run. VPS redeploy is **day 35** with no movement; weather proxy cache and weekend-specific pricing remain dead code until one SSH command runs. APNS is 26 days past its hard deadline. The 06-07 agent flagged localhost CORS origins in prod as P1-C — still present, fix below. No new P0s.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache buster `20260607ae` → `20260608a` | `app.jsx:17` | 1 day stale |
| SW CACHE_NAME `peakly-20260607ae` → `peakly-20260608a` | `sw.js:2` | Evicts stale cached assets |
| Query string `?v=20260607ae` → `?v=20260608a` | `index.html:400` | Forces browser reload |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **9,006 lines / 535 KB raw / ~149 KB gzip est.** |
| CDN scripts | All HTTPS, pinned to exact versions ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster | `v=20260608a` — **bumped this run** ✅ |
| SW CACHE_NAME | `peakly-20260608a` — **bumped this run** ✅ |
| PEAKLY_BUILD | `20260608a` — **bumped this run** ✅ |
| Sentry DSN | Active: `9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/...` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — safe on CDN failure ✅ |

### CDN Dependency Versions

| Library | Pinned Version | Status |
|---------|---------------|--------|
| React + ReactDOM | 18.3.1 | ✅ Current stable |
| Babel Standalone | 7.29.7 | ✅ Current |
| Supabase JS (eager `index.html`) | 2.106.2 | ✅ |
| Supabase JS (lazy `app.jsx` dynamic) | 2.106.2 | ✅ (06-07 agent upgraded from 2.45.4) |
| Leaflet | 1.9.4 | ✅ Stable |
| Sentry CDN | Loader SDK (project-keyed) | ✅ Managed by Sentry |

### SRI Coverage (P2)

| Script | SRI | Risk |
|--------|-----|------|
| Leaflet JS + CSS | ✅ sha256 | Protected |
| React 18 (unpkg) | ❌ None | Supply-chain injection possible |
| ReactDOM 18 (unpkg) | ❌ None | Supply-chain injection possible |
| **Babel Standalone (unpkg)** | ❌ None | **Highest risk — executes all JSX** |
| Supabase (jsDelivr) | ❌ None | Reads/writes auth tokens |

Babel without SRI is the highest-severity gap. A compromised unpkg payload has eval-level access to the full app and all localStorage. Fix script below under P2.

### Cache Buster — Manually Bumped for the 12th Consecutive Report

auto-push.sh correctly bumps on Mac but silently exits in every other environment (hardcoded path `/Users/haydenb/peakly`). See P1-C for the 5-line fix.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Raw IP in client | None ✅ |
| Travelpayouts token | Server-side env var only ✅ |
| TP_MARKER | `"710303"` at `app.jsx:1936` — public affiliate ID ✅ |
| Flight request timeout | 5s AbortController at line 1767 ✅ |
| Flight concurrency cap | `_flightSem` max 3 concurrent ✅ |
| Rate limiter | 60 req/min/IP in-memory ✅ |
| Proxy listens on | `127.0.0.1:3001` — localhost only, Caddy fronts ✅ |

### P1-A — VPS Redeploy: **Day 35** (Blocks Scale)

Three features are written and dead until pm2 restarts:

1. **Shared Open-Meteo weather cache** — 2hr LRU + in-flight dedupe. N concurrent users → 1 upstream call per coord pair.
2. **Marine proxy cache** — same.
3. **Weekend-specific flight pricing** — Fri/Mon date params, currently falling back to month-cheapest.

**Rate math (no proxy cache running):**

| DAU | Open-Meteo calls/day | Free tier (10K/day) |
|-----|----------------------|---------------------|
| 30  | ~4,500 | ✅ |
| 67  | ~10,050 | ❌ **Ceiling. Silent 429s. Empty grid.** |
| 334 | ~50,100 | ❌ 5× over |

With proxy cache: ~156 calls/2hr regardless of scale → free tier holds through 10K MAU.

**Fix:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull origin main
pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected:
```json
{ "status": "ok", "wx_cache_size": 0, "apns_configured": false, "poll_worker": "running" }
```

---

## 3. Weather & External APIs

| API | Auth | Timeout | Status |
|-----|------|---------|--------|
| Open-Meteo Weather `api.open-meteo.com` | None | 8s AbortController ✅ | ⚠️ Direct — no proxy cache yet |
| Open-Meteo Marine `marine-api.open-meteo.com` | None | 8s AbortController ✅ | ⚠️ Direct — no proxy cache yet |
| Travelpayouts via proxy | Server-side token | 5s AbortController ✅ | ✅ |

`_tryProxyWx()` tries proxy first (4s), falls back to direct. Good architecture. Fallback is the primary path since proxy cache isn't running.

**Batching:** 50 venues / 2s between batches — correct, prevents burst-rate violations. Do not change.

---

## 4. Security Audit

| Item | Status |
|------|--------|
| Travelpayouts token in client | Not present ✅ |
| Supabase anon key at `app.jsx:26` | Intentionally public, RLS-gated ✅ |
| `.gitignore` covers `.env`, `*.p8`, `*.pem`, `*.key`, business docs | ✅ |
| Sentry DSN in `index.html:77` | Intentionally public ✅ |
| APNS keys | Server-side env vars, never in client ✅ |
| Last 20 commits | No secrets found ✅ |

**Supabase RLS verification (5 min, do now):** The anon key is safe only if RLS is ON for `user_data` and `shared_lists`. Login to `wsoqcfwkvvemtlddcgfc.supabase.co` → Table Editor → confirm both tables show RLS enabled. An unprotected table is full data exposure via the public anon key.

### P1-C — Localhost Origins in Production CORS (Flagged 06-07, Still Open)

**Where:** `server/proxy.js:27–29`

```javascript
const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  'http://localhost:8000',   // ← any local process hits prod
  'http://localhost:3000',   // ← same
  'http://127.0.0.1:8000',  // ← same
];
```

Any page running on localhost:8000 or :3000 — a compromised npm dev server, VS Code Live Server — can make CORS-allowed requests to the production proxy and exhaust the rate limit or probe Travelpayouts. Blast radius is limited (token stays server-side), but there's zero reason to keep this open in production.

**Fix (bundle into P1-A SSH session):**
```javascript
const DEV_ORIGINS = process.env.NODE_ENV !== 'production'
  ? ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000']
  : [];

const ALLOWED_ORIGINS = [
  'https://j1mmychu.github.io',
  'https://peakly.app',
  'https://www.peakly.app',
  ...DEV_ORIGINS,
];
```

Set `NODE_ENV=production` in pm2: `pm2 set peakly-proxy:NODE_ENV production && pm2 restart peakly-proxy`.

### P2-A — Add SRI to React, ReactDOM, Babel, Supabase

```bash
# Generate hashes (run with network access):
for url in \
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js" \
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" \
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js" \
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js"; do
  hash=$(curl -s "$url" | openssl dgst -sha256 -binary | openssl base64 -A)
  echo "integrity=\"sha256-$hash\"  →  $url"
done
```

Add `integrity="sha256-<hash>" crossorigin="anonymous"` to each `<script>` in `index.html`. **Test in staging first** — Babel inline eval can conflict with strict SRI under some browser CSP configs.

---

## 5. Performance Analysis

### Cold Load Bundle

| Asset | Gzip est. |
|-------|-----------|
| Babel Standalone 7.29.7 | ~760 KB |
| ReactDOM 18.3.1 | ~130 KB |
| app.jsx (535 KB raw) | ~149 KB |
| Supabase JS 2.106.2 (eager) | ~80 KB |
| Leaflet 1.9.4 | ~40 KB |
| React 18.3.1 | ~42 KB |
| Plus Jakarta Sans (4 weights) | ~35 KB |
| **Total** | **~1,236 KB** |

**Babel Standalone is the bottleneck** — 760 KB download + CPU time to transpile 535 KB JSX before React mounts. Mid-range Android: 2–5s to first render. Architectural constraint; no fix without a build step.

**Images:** All `<img>` have `loading="lazy"` ✅

**Supabase eager load:** 80 KB for 100% of users, used by <5%. Lazy-load diff at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`. In `known-skipped.md`, re-flagging because cold-load TTI matters pre-launch.

### P1-B — Proxy-Down Open-Meteo Cascade (Flagged 06-07)

When the proxy goes down, all 156 venues hit Open-Meteo directly (the fallback path). 67 simultaneous cold-cache users × 150 calls = 10,050 calls = free tier gone in one burst.

**Fix — add 5-minute proxy cooldown in app.jsx (~line 1041):**

```javascript
let _proxyWxFailedAt = 0;
const PROXY_WX_COOLDOWN_MS = 5 * 60 * 1000;

async function _tryProxyWx(kind, lat, lon) {
  if (Date.now() - _proxyWxFailedAt < PROXY_WX_COOLDOWN_MS) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const r = await fetch(`${FLIGHT_PROXY}/api/${kind}?lat=${lat}&lon=${lon}`,
      { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) { _proxyWxFailedAt = Date.now(); return null; }
    const json = await r.json();
    if (json?.success && json?.data) { _proxyWxFailedAt = 0; return json.data; }
    _proxyWxFailedAt = Date.now(); return null;
  } catch { _proxyWxFailedAt = Date.now(); return null; }
}
```

156 parallel probes become 1 probe per 5-minute window. **Estimated fix time: 15 min.**

---

## 6. Cost Estimate

| Scale | DAU | Open-Meteo calls/day | DigitalOcean | Supabase | **Total/mo** |
|-------|-----|----------------------|--------------|----------|-------------|
| Now (<10 MAU) | <10 | <1,500 | $6 | Free | **$6** |
| 1K MAU | ~33 | ~5K direct / ~156 w/proxy | $6 | Free | **$6** |
| 10K MAU | ~334 | **~50K/day (free tier × 5)** OR 156 w/proxy | $12 | ~$25 | **$37** |
| 100K MAU | ~3,334 | ~312/day w/proxy cache | $24 | $25 | **$49** |

**One SSH command activates the proxy cache → Open-Meteo free tier holds through 10K MAU.** Every day the VPS stays unredeployed is a day of free tier exposure at launch scale.

---

## 7. APNS / Strike Alerts

| Item | Status |
|------|--------|
| Polling worker | ✅ In proxy.js — `setInterval(checkAlerts, 30min)` |
| APNS JWT sender | ✅ Native `crypto` + HTTP/2, no deps |
| Client alert registration | ✅ `addAlert` in app.jsx POSTs to `/api/alerts` |
| APNS keys on VPS | ❓ Cannot verify without SSH access |
| Deadline | 2026-05-13 — **26 days overdue** |

**Option A — Wire APNS (30 min if .p8 key in hand):**
```bash
ssh root@198.199.80.21
pm2 set peakly-proxy:APNS_KEY_ID "XXXXXXXXXX"
pm2 set peakly-proxy:APNS_TEAM_ID "XXXXXXXXXX"
pm2 set peakly-proxy:APNS_BUNDLE_ID "com.peakly.app"
pm2 set peakly-proxy:APNS_KEY_PATH "/opt/peakly-proxy/AuthKey_XXXXXXXXXX.p8"
pm2 set peakly-proxy:APNS_PROD "true"
pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: "apns_configured": true
```

**Option B — Gate Alerts tab on iOS only (5 min, unblocks App Store v1):**

Near the top of the `App` component in app.jsx, add:
```jsx
const isNativeIOS = !!(window.Capacitor &&
  window.Capacitor.getPlatform &&
  window.Capacitor.getPlatform() === "ios");
```
Then gate the Alerts tab button and panel: `{!isNativeIOS && ...}`. Web users keep Alerts. App Store review proceeds without push entitlement.

---

## 8. What Breaks First at Scale

**Open-Meteo at 67 DAU.** Not a warning — a hard ceiling. 67 daily users × 150 calls = free tier gone. Venues score zero. The Explore grid empties silently. Users see a blank app and leave. The shared weather cache (written 35 days ago) reduces this to 156 calls/2hr regardless of how many users are active. One `pm2 restart` and this is permanently solved up to 10K MAU.

**Second:** Supabase free tier at ~8K MAU. 2GB/month bandwidth shared across sync operations. Monitor Supabase dashboard → Usage once past 1K MAU; upgrade to Pro ($25/mo) before the database auto-pauses.

**Third:** GitHub Pages 100GB/month soft limit at ~83K cold loads. At 1.2 MB/load that's roughly 28K MAU with 3 cold loads/month. Mitigate by lazy-loading Supabase (diff exists, 30-sec apply) and/or switching to Cloudflare Pages at that scale.

---

## Action Table

| Priority | Action | Command / Location | Time | Owner |
|----------|--------|--------------------|------|-------|
| **P1-A** | VPS redeploy — weather cache + pricing | `ssh root@198.199.80.21; cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && pm2 save` | 3 min | Jack |
| **P1-B** | Proxy-down cooldown guard | app.jsx ~line 1041 (see §5) | 15 min | Agent |
| **P1-C** | CORS: gate localhost origins behind `NODE_ENV !== 'production'` | server/proxy.js:27 (see §4) + `pm2 set` | 5 min (bundle w/ P1-A) | Jack |
| **P1-D** | APNS wire OR iOS gate | peakly-native/PUSH_SETUP.md OR app.jsx (see §7) | 5–30 min | Jack |
| **P1-E** | Fix auto-push.sh path (remove Mac-only REPO guard) | scripts/auto-push.sh lines 11–19 | 5 min | Jack |
| **P2-A** | Add SRI to React/ReactDOM/Babel/Supabase | index.html (see §4) | 20 min | Jack |
| **P2-B** | Verify Supabase RLS ON for `user_data` + `shared_lists` | Supabase dashboard | 5 min | Jack |
| **P2-C** | Lazy-load Supabase | `git apply reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` | 1 min | Agent |
