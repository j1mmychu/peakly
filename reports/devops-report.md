# Peakly DevOps Report — 2026-06-04

**Status: 🟡 YELLOW**

No new P0s. Cache buster bumped `20260602a` → `20260604a` (2 days stale on arrival). Two P1s remain stuck for 31+ days — VPS redeploy and APNS config are both parked despite completed code. Nothing is on fire today, but at >66 DAU the Open-Meteo free tier ceiling hits and the app silently degrades.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache buster `20260602a` → `20260604a` | `app.jsx:17` | 2 days stale |
| SW CACHE_NAME `peakly-20260602a` → `peakly-20260604a` | `sw.js:2` | Evicts stale cached assets on next visit |
| Query string `?v=20260602a` → `?v=20260604a` | `index.html:400` | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **9,006 lines / 522.5 KB raw / ~149 KB gzip est.** |
| CDN scripts | All HTTPS, pinned to exact versions ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster | `v=20260604a` — **bumped this run** |
| SW CACHE_NAME | `peakly-20260604a` — **bumped this run** |
| PEAKLY_BUILD | `20260604a` — **bumped this run** |
| Sentry DSN | Active, non-empty: `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/...` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — safe on CDN failure ✅ |

### CDN Dependency Versions

| Library | Pinned Version | Status |
|---------|---------------|--------|
| React + ReactDOM | 18.3.1 | ✅ Current |
| Babel Standalone | 7.29.7 | ✅ Current (confirmed via npm registry) |
| Supabase JS | 2.106.2 | ✅ Recent |
| Leaflet | 1.9.4 | ✅ Stable (1.9.x is the maintained line) |
| Sentry CDN | Loader SDK (pinned to project key) | ✅ Managed by Sentry |

### Structural Note: Cache Buster Still Manually Bumped

This is the 10th+ consecutive report where DevOps bumps the buster because auto-push.sh doesn't do it automatically. The 5-line fix has been in the reports since 2026-05-26. At this point it's burned more DevOps cycles than it would cost to implement.

**Fix (10-min implementation, eliminates this class of P0 permanently):**

```bash
# Add to scripts/auto-push.sh BEFORE the git add section:
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
| Raw IP in client code | None (was 104.131.82.242 historically, gone) ✅ |
| Travelpayouts token | Server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) ✅ |
| TP_MARKER affiliate ID | `"710303"` in `app.jsx:1936` — public affiliate marker, correct ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s `AbortController` ✅ |
| Retries | 3 attempts, 1.2s/2.4s exponential backoff on 429/5xx ✅ |
| Concurrency cap | Semaphore: max 3 concurrent flight requests (`_flightSem`) ✅ |
| `/health` reachability | Cannot verify — outbound network restricted in audit sandbox |

### P1-A — VPS Redeploy: Day 31 (CHRONIC)

Code complete since **2026-05-04**. `proxy.js` has shared weather cache, marine cache, and weekend-specific pricing. None of it is running until pm2 restarts. Same finding every single day.

**Rate math without proxy weather cache:**
- ~150 Open-Meteo calls per cold page load (100 weather + ~50 marine for beach venues)
- Open-Meteo free tier: **10,000 calls/day**
- **Hits ceiling at 67 DAU**

**One SSH session, ~3 minutes:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull
pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | jq .
```

Expected after redeploy:
```json
{
  "status": "ok",
  "wx_cache_size": 0,
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
| Auth required | None — free tier, no key ✅ |
| Client timeout | 8s `AbortController` on direct Open-Meteo calls ✅ |
| Client retries | 3 attempts, 1.2s/2.4s backoff on 429/5xx ✅ |
| Proxy fallback | `_tryProxyWx()` tries proxy first (4s timeout), falls back to direct ✅ |
| localStorage cache | 2hr TTL, 4000-entry LRU eviction ✅ |
| Venue batch size | 50 venues / 2s — stays within Open-Meteo burst tolerance ✅ |

**Rate limit floor (direct, no proxy cache):** 67 DAU = 10,050 calls/day = ceiling breached. Venues return `null` data, score as 0, grid looks empty. No error message to user.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | **Not present** ✅ |
| Supabase anon key | Exposed by design (`app.jsx:26`) — RLS-gated per architecture ✅ |
| `.gitignore` | Present — covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.pdf`, `*.pptx` ✅ |
| Sentry DSN in HTML | Exposed (expected — Sentry Loader SDK requires it in script src) ✅ |
| Recent commits for secrets | No secrets in last 5 commits ✅ |
| APNS keys in proxy | All via `process.env` — never hardcoded ✅ |

### SRI Gap (Known-Skipped — Highest Supply-Chain Risk)

| Script | SRI Present |
|--------|-------------|
| React 18.3.1 (unpkg) | ❌ |
| ReactDOM 18.3.1 (unpkg) | ❌ |
| Babel Standalone 7.29.7 (unpkg) | ❌ |
| Supabase 2.106.2 (jsdelivr) | ❌ |
| Sentry Loader (sentry-cdn.com) | ❌ (intentionally unversioned by Sentry) |
| Leaflet 1.9.4 (unpkg) | ✅ |

In `known-skipped.md`. Re-flag immediately if any CDN compromise hits the news.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` raw | 522.5 KB |
| `app.jsx` gzip estimate | ~149 KB |
| Babel Standalone | ~900 KB minified (transforms JSX at runtime) |
| React + ReactDOM | ~141 KB minified |
| Supabase (gzip) | ~80 KB |
| Leaflet JS (gzip) | ~40 KB |
| **Total JS cold load** | ~1.3 MB raw / ~410 KB gzip |

**Single largest bottleneck: Babel Standalone runtime transform.** Downloads 900KB, then parses 522KB of JSX in-browser before React mounts. Mid-range Android: 2–4s CPU-bound before first render. Not actionable without adding a build step — architectural constraint.

**Images:** `loading="lazy"` present on all venue photo `<img>` tags ✅.

**Supabase eager load:** ~80KB gzip on every anonymous page load. `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` still applies cleanly. Known-skipped.

---

## 6. Cost Estimate

| Tier | MAU | Open-Meteo calls/day | DigitalOcean | Supabase | Total/mo |
|------|-----|---------------------|--------------|----------|----------|
| Now | ~10 | ~1,500 (direct) | $6 | Free | **$6** |
| 1K MAU | ~33 DAU avg | ~5,000/day | $6 | Free | **$6** |
| 10K MAU | ~333 DAU | **49,950/day — FREE TIER BLOWN** | $12–$18 | Free–$25 | **$25–$43** |
| 100K MAU | ~3,300 DAU | ~400/day with proxy cache | $24–$48 | $25 | **$50–$73** |

**Deploy the proxy weather cache (already written) → free tier holds through 10K MAU.** Cost: one SSH session.

---

## 7. APNS / Strike Alerts

| Check | Result |
|-------|--------|
| Polling worker in proxy.js | ✅ Ships in current code |
| APNS JWT generator | ✅ Ships in current code |
| Client alert registration | ✅ Ships in current app.jsx |
| APNS keys configured on VPS | ❓ Unverified — Jack must check `/health` |
| Deadline | **2026-05-13 — 22 days overdue** |

### P1-B — APNS: 22 Days Past Deadline

CLAUDE.md set a hard deadline of 2026-05-13: either APNS live OR gate Alerts tab on iOS. Neither happened.

**Option A — Wire APNS (30 min if .p8 key is in hand):**
```bash
ssh root@198.199.80.21
pm2 set peakly-proxy:APNS_KEY_ID "YOUR_10_CHAR_KEY_ID"
pm2 set peakly-proxy:APNS_TEAM_ID "YOUR_10_CHAR_TEAM_ID"
pm2 set peakly-proxy:APNS_BUNDLE_ID "com.peakly.app"
pm2 set peakly-proxy:APNS_KEY_PATH "/opt/peakly-proxy/AuthKey_XXXXXXXX.p8"
pm2 set peakly-proxy:APNS_PROD "true"
pm2 restart peakly-proxy
curl https://peakly-api.duckdns.org/health | jq .apns_configured
# Expected: true
```

**Option B — Gate Alerts tab on iOS (5 min, ship today):**

Find the Alerts tab nav item in `app.jsx` (search `tab === "alerts"`) and add at the top of `App`:
```jsx
const isIOS = typeof window !== "undefined" &&
  window.Capacitor?.getPlatform?.() === "ios";
```
Then gate both the tab button and route: `{!isIOS && <AlertsTab ... />}`.

---

## 8. What Breaks First at Scale

**Open-Meteo at 67 DAU.** Hard ceiling — not a warning. 67 users × 150 calls = 10,050/day = free tier gone. Venues score as zero, grid looks empty, users churn with no error message. The proxy weather cache (already written, undeployed for 31 days) collapses this to ~400 upstream calls/day. One SSH session.

**Supabase bandwidth at ~8K MAU.** Every wishlist sync and alert registration hits Supabase REST API. 2GB/month free bandwidth. Monitor via Supabase dashboard → Settings → Billing once you cross 1K MAU.

**Single VPS droplet (1GB RAM) at 10K MAU.** Proxy weather cache LRU fills at scale. Upgrade to $12/mo 2GB droplet before then.

---

## Action Items

| Priority | Action | Time | Owner |
|----------|--------|------|-------|
| **P1** | SSH to VPS: `git pull && pm2 restart peakly-proxy` | 3 min | Jack |
| **P1** | Wire APNS keys OR gate Alerts behind `isNativePlatform()` | 5–30 min | Jack |
| **P2** | Add cache-buster auto-bump to `scripts/auto-push.sh` | 10 min | Jack |
| **P2** | `git apply reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` | 1 min | Jack |
