# Peakly DevOps Report — 2026-06-10

**Status: 🟡 YELLOW**

Cache buster was 6 days stale on arrival — bumped this run (`20260604a` → `20260610a`). No new P0s. The two chronic P1s have now aged another 6 days without movement: VPS redeploy is **Day 37** overdue, APNS deadline is **28 days** past the hard deadline Jack set himself. The auto-push cache buster automation fix has been in every report since 2026-05-26 with zero uptake — 11th occurrence, moving to a direct reminder section. At >67 DAU the Open-Meteo free tier ceiling hits; the proxy weather cache that fixes it has been undeployed for 37 days.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache buster `20260604a` → `20260610a` | `app.jsx:17` | 6 days stale |
| SW CACHE_NAME `peakly-20260604a` → `peakly-20260610a` | `sw.js:2` | Evicts stale cached assets on next visit |
| Query string `?v=20260604a` → `?v=20260610a` | `index.html:400` | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **9,006 lines / 522.5 KB raw / ~149 KB gzip est.** |
| CDN scripts | All HTTPS, pinned to exact versions ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster | `v=20260610a` — **bumped this run** |
| SW CACHE_NAME | `peakly-20260610a` — **bumped this run** |
| PEAKLY_BUILD | `20260610a` — **bumped this run** |
| Sentry DSN | Active: `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/4511108673765376` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — safe on CDN failure ✅ |
| PRECACHE | `[]` — correct, empty ✅ |

### CDN Dependency Versions

| Library | Pinned Version | SRI | Status |
|---------|---------------|-----|--------|
| React + ReactDOM | 18.3.1 (unpkg) | ❌ | Current |
| Babel Standalone | 7.29.7 (unpkg) | ❌ | Current |
| Supabase JS | 2.106.2 (jsdelivr) | ❌ | Recent — verify against npm |
| Leaflet | 1.9.4 (unpkg) | ✅ | Stable |
| Sentry Loader | Project key–pinned (sentry-cdn.com) | N/A | Managed by Sentry |

**SRI missing on 4 of 5 external scripts.** Supply-chain risk: a compromised unpkg or jsdelivr CDN could inject arbitrary JS silently. Leaflet has it because it was added in a past pass; the others don't. Known-skipped, but re-elevate immediately if any CDN compromise hits news.

### Persistent Structural Issue: Manual Cache Buster Bumps (11th Report)

This has appeared in every report since 2026-05-26. It takes 10 minutes to fix permanently. Pasting the exact code one more time — this is the last time it appears here; next occurrence goes to known-skipped.

```bash
# Add to scripts/auto-push.sh, BEFORE the git add section:
TODAY=$(date +%Y%m%d)
CURRENT=$(grep -o 'PEAKLY_BUILD = "[0-9a-z]*"' app.jsx | grep -o '"[0-9a-z]*"' | tr -d '"')
if [[ "$CURRENT" < "${TODAY}a" ]]; then
  sed -i "s/PEAKLY_BUILD = \"[^\"]*\"/PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
  sed -i "s/CACHE_NAME = \"peakly-[^\"]*\"/CACHE_NAME = \"peakly-${TODAY}a\"/" sw.js
  sed -i "s/app\.jsx?v=[0-9a-z]*/app.jsx?v=${TODAY}a/" index.html
  echo "[auto-push] cache buster bumped to ${TODAY}a"
fi
```

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in client | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Raw IP in client code | None ✅ |
| Travelpayouts token | Server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) ✅ |
| TP_MARKER affiliate ID | `"710303"` in `app.jsx:1936` — public marker, correct ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s `AbortController` ✅ |
| Concurrency cap | Semaphore: max 3 concurrent flight requests ✅ |
| Proxy `proxy.js` | 872 lines — weather cache, APNS sender, polling worker all present ✅ |
| VPS redeploy | ❌ **Day 37 — code complete since 2026-05-04, never deployed** |

### P1-A — VPS Redeploy: Day 37 (CHRONIC — FINAL WARNING)

Every day this stays undeployed: the shared weather cache doesn't run, the weekend-specific Travelpayouts pricing doesn't run, the APNS polling worker doesn't run. The code is done and has been done for over a month.

**Rate math (without proxy cache):**
- ~150 Open-Meteo calls per cold page load (100 weather + ~50 marine)
- Open-Meteo free tier: **10,000 calls/day**
- **Ceiling breached at 67 DAU** — venues score as zero, grid goes blank, no error shown to user

**Three commands. Three minutes:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | jq .
```

Expected `/health` output after deploy:
```json
{
  "status": "ok",
  "wx_cache_size": 0,
  "marine_cache_size": 0,
  "apns_configured": false,
  "poll_worker": "running"
}
```

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo base URL | `https://api.open-meteo.com/v1` — HTTPS ✅ |
| Marine API URL | `https://marine-api.open-meteo.com/v1` — HTTPS ✅ |
| Auth required | None — free tier ✅ |
| Client timeout | 8s `AbortController` on direct calls ✅ |
| Client retries | 3 attempts, 1.2s/2.4s backoff on 429/5xx ✅ |
| Proxy fallback | `_tryProxyWx()` tries proxy first (4s timeout), falls back to direct ✅ |
| localStorage cache | 2hr TTL, 4000-entry LRU eviction ✅ |
| Venue batch size | 50 venues / 2s — within Open-Meteo burst tolerance ✅ |

**Free-tier cliff:** 67 DAU = 10,050 direct API calls/day. Deploying the proxy cache collapses this to ~400 upstream calls/day — a 25× reduction. See P1-A.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | **Not present** ✅ |
| Supabase anon key exposed | `app.jsx:26` — by design, RLS-gated ✅ |
| `.gitignore` | Present — covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.pdf`, `*.pptx` ✅ |
| Sentry DSN in HTML | Exposed — expected (Sentry Loader SDK requires it in script src) ✅ |
| APNS keys in proxy | All via `process.env` — never hardcoded ✅ |
| Secrets in last 10 commits | None detected ✅ |
| Business plan leak | Scrubbed 2026-05-09; `.gitignore` now covers all office formats ✅ |
| CSP meta tag | ❌ **Not present** — medium risk |

### CSP Absence

No `Content-Security-Policy` meta tag in index.html. Babel Standalone's runtime eval means a strict `script-src 'self'` would block it, but a permissive policy that at minimum pins `script-src` to known CDN origins reduces XSS blast radius.

**Permissive CSP that won't break Babel (P2 — test in browser before shipping):**
```html
<!-- Add inside <head> in index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://unpkg.com https://cdn.jsdelivr.net
    https://js.sentry-cdn.com https://plausible.io
    https://browser.sentry-cdn.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com https://plausible.io;
  connect-src 'self'
    https://api.open-meteo.com https://marine-api.open-meteo.com
    https://peakly-api.duckdns.org
    https://wsoqcfwkvvemtlddcgfc.supabase.co
    https://o4511108649058304.ingest.us.sentry.io
    https://plausible.io;
  worker-src 'self';
">
```

Note: `'unsafe-eval'` is required by Babel Standalone. Without a build step this cannot be removed. A build step (Vite/esbuild) would allow removing both `'unsafe-eval'` and `'unsafe-inline'`.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` raw | 522.5 KB |
| `app.jsx` gzip est. | ~149 KB |
| Babel Standalone | ~900 KB minified — transforms JSX at runtime |
| React + ReactDOM | ~141 KB minified |
| Supabase JS (gzip) | ~80 KB |
| Leaflet JS (gzip) | ~40 KB |
| **Total JS cold load** | ~1.3 MB raw / ~410 KB gzip est. |

**Primary bottleneck: Babel Standalone.** 900 KB download + runtime JSX parse on 522 KB source before React mounts. Not fixable without adding a build step — architectural constraint. Mid-range Android: 2–4s CPU-bound before first render.

**Images:** `loading="lazy"` on all venue `<img>` tags ✅.

**Supabase eager load:** ~80 KB gzip hits every anonymous pageload. The `git apply`-clean lazy-load diff (`reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`) is still available. Still known-skipped — re-flag if LCP becomes a measurable bounce driver post-launch.

---

## 6. Cost Estimate

| Tier | MAU | Est. DAU | Open-Meteo calls/day | DigitalOcean | Supabase | Total/mo |
|------|-----|----------|---------------------|--------------|----------|----------|
| Current | <20 | ~7 | ~1,050 direct | $6 | Free | **$6** |
| 1K MAU | ~33 avg DAU | ~33 | ~4,950/day — under limit | $6 | Free | **$6** |
| 10K MAU | ~333 DAU | ~333 | **49,950/day — FREE TIER BLOWN** | $12–$18 | Free–$25 | **$25–$43** |
| 10K MAU + proxy | ~333 DAU | ~333 | ~400/day (proxy cache) ✅ | $12 | $25 | **$37** |
| 100K MAU + proxy | ~3,300 DAU | ~3,300 | ~400/day (LRU saturated) | $24–$48 | $25 | **$50–$73** |

**The VPS proxy cache is the cost moat.** Without it, the app runs out of free Open-Meteo quota at 67 DAU. With it deployed, the free tier holds through 10K MAU. A $6/month action gap.

**VPS upgrade trigger:** 1GB RAM droplet is fine through 10K MAU. At 50K+ MAU, monitor `pm2 logs` memory — upgrade to $12/mo 2GB if RSS approaches 800MB.

---

## 7. APNS / Strike Alerts

| Check | Result |
|-------|--------|
| Polling worker in `proxy.js` | ✅ Written, undeployed |
| APNS JWT generator | ✅ Written, undeployed |
| Client alert registration | ✅ In `app.jsx` |
| APNS keys configured on VPS | ❓ Unknown — check `/health` after VPS redeploy |
| Hard deadline set in CLAUDE.md | **2026-05-13 — 28 days overdue** |

### P1-B — APNS: 28 Days Past Deadline

This is not ambiguous — CLAUDE.md says "by end-of-day Wednesday 2026-05-13, either APNS is live OR add `Capacitor.isNativePlatform()` gate to hide the Alerts tab on iOS." Neither shipped.

**Option A — Wire APNS keys (30 min if .p8 key in hand):**
```bash
ssh root@198.199.80.21
pm2 set peakly-proxy:APNS_KEY_ID "YOUR_10_CHAR_KEY_ID"
pm2 set peakly-proxy:APNS_TEAM_ID "YOUR_10_CHAR_TEAM_ID"
pm2 set peakly-proxy:APNS_BUNDLE_ID "com.peakly.app"
pm2 set peakly-proxy:APNS_KEY_PATH "/opt/peakly-proxy/AuthKey_XXXXXXXX.p8"
pm2 set peakly-proxy:APNS_PROD "true"
pm2 restart peakly-proxy
curl https://peakly-api.duckdns.org/health | jq .apns_configured
# Expected output: true
```

**Option B — iOS gate (5 min, ship now, unblock App Store):**

In `app.jsx`, find the nav tab array (around line ~8100–8200, search `"alerts"` in tab config). Add at the App component root:

```jsx
const isNativeIOS = typeof window !== "undefined" &&
  typeof window.Capacitor !== "undefined" &&
  window.Capacitor.getPlatform?.() === "ios";
```

Then filter the Alerts tab out of the tab bar and route it when `isNativeIOS === true`:
```jsx
{!isNativeIOS && activeTab === "alerts" && <AlertsTab ... />}
// And in the tab bar nav items:
{!isNativeIOS && <button onClick={() => setActiveTab("alerts")}>Alerts</button>}
```

Option B takes 5 minutes and unblocks App Store submission today. Do Option B now; circle back on Option A when the .p8 key is in hand.

---

## 8. What Breaks First at Scale

**Open-Meteo at 67 DAU — hard cliff, not a curve.** The 10,000 call/day free tier is a binary cutoff. Hit it and venues return null weather data. `scoreVenue` returns `null`. The Explore grid goes empty. Users see "Nothing great this weekend" with no explanation. No retry, no user message, silent failure. The fix — deploying the proxy weather cache already written in `proxy.js` — takes 3 minutes on a terminal. It has been ready for 37 days.

After that: **Supabase free-tier bandwidth at ~8K MAU.** Every sync write hits the REST API. At 2GB/month free, monitor via Supabase dashboard → Settings → Billing when MAU crosses 1K. Upgrade path is clear and cheap ($25/mo).

After that: **Babel Standalone parse time on low-end Android.** 900KB JS download + runtime JSX compile is the ceiling of user-perceived load time. The only cure is a build step, which violates the single-file no-bundler constraint. Accept it until it shows up in bounce data.

---

## Action Items

| Priority | Action | Time | Owner | Days Blocked |
|----------|--------|------|-------|-------------|
| **P1** | `ssh root@198.199.80.21 && cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy` | 3 min | Jack | **37 days** |
| **P1** | Wire APNS keys OR add iOS Alerts gate (`Capacitor.getPlatform() === "ios"`) | 5–30 min | Jack | **28 days past deadline** |
| **P2** | Add cache-buster auto-bump to `scripts/auto-push.sh` (code above) | 10 min | Jack | 15 days |
| **P2** | Add permissive CSP meta tag to `index.html` — test in browser first | 20 min | DevOps | New |
| **P3** | `git apply reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` | 1 min | Jack | Known-skipped |
| **P3** | Add SRI hashes to React, ReactDOM, Babel, Supabase CDN scripts | 30 min | DevOps | Known-skipped |
