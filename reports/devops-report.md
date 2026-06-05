# Peakly DevOps Report — 2026-06-05

**Status: 🟡 YELLOW**

Cache buster bumped `20260604a` → `20260605a` this run. No new P0s. The two chronic P1s (VPS redeploy at Day 32, APNS at Day 23 past deadline) remain unresolved. The Open-Meteo rate ceiling is still sitting at 67 DAU with zero headroom above it and zero action taken. The auto-bump fix has now been proposed for 10+ consecutive reports. That's not a DevOps problem — it's a decision problem.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache buster `20260604a` → `20260605a` | `app.jsx:17` | 1 day stale |
| SW CACHE_NAME `peakly-20260604a` → `peakly-20260605a` | `sw.js:2` | Evicts stale cached assets |
| Query string `?v=20260604a` → `?v=20260605a` | `index.html:400` | Forces browser reload |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **9,006 lines / 535 KB raw / ~152 KB gzip est.** |
| CDN scripts | All HTTPS, pinned to exact versions ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster | `v=20260605a` — **bumped this run** ✅ |
| SW CACHE_NAME | `peakly-20260605a` — **bumped this run** ✅ |
| PEAKLY_BUILD | `20260605a` — **bumped this run** ✅ |
| Sentry DSN | Active in `index.html` (`9416b032a...`) and initialized in `app.jsx:7` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — safe on CDN failure ✅ |

### CDN Dependency Versions

| Library | Pinned | Status | Notes |
|---------|--------|--------|-------|
| React | 18.3.1 | ✅ Stable | React 19 exists but is a major-version migration — not a drop-in |
| ReactDOM | 18.3.1 | ✅ Stable | Same |
| Babel Standalone | 7.29.7 | ✅ Current | Latest 7.x as of last check |
| Supabase JS | 2.106.2 | ✅ Recent | |
| Leaflet | 1.9.4 | ✅ Stable | 1.9.x is maintained LTS |
| Sentry Loader | CDN-managed | ✅ Managed by Sentry | Intentionally unversioned |

### Structural: Cache Buster Still Manually Bumped (Day 10+)

This line has appeared in every report since 2026-05-26. The fix is 5 lines of shell. Here it is for the 10th time:

```bash
# Add to scripts/auto-push.sh, BEFORE the git add block:
TODAY=$(date +%Y%m%d)
CURRENT=$(grep -o 'PEAKLY_BUILD = "[0-9a-z]*"' app.jsx | grep -o '"[^"]*"' | tr -d '"')
if [[ "$CURRENT" < "${TODAY}a" ]]; then
  sed -i "s/PEAKLY_BUILD = \"[^\"]*\"/PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
  sed -i "s/CACHE_NAME = \"peakly-[^\"]*\"/CACHE_NAME = \"peakly-${TODAY}a\"/" sw.js
  sed -i "s/app\.jsx?v=[0-9a-z]*/app.jsx?v=${TODAY}a/" index.html
  echo "[auto-push] cache buster bumped to ${TODAY}a"
fi
```

Stops burning 3 minutes of every DevOps run. **Graduating this to P1-C today** since it's been P2 long enough.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in client | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Raw IP in client code | None ✅ |
| Travelpayouts token | Server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) ✅ |
| TP_MARKER in client | `"710303"` — public affiliate marker, correct ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s `AbortController` ✅ |
| Flight request semaphore | Max 3 concurrent (`_flightSem`) ✅ |
| Proxy retries | 3 attempts, exponential backoff ✅ |
| `/health` reachability | Cannot verify — audit sandbox has no outbound access |

### P1-A — VPS Redeploy: Day 32 (CHRONIC)

Code for weekend-specific pricing, shared weather cache, marine cache, and strike alerts polling has been sitting in `proxy.js` undeployed since **2026-05-04**. 32 days. Every user hitting the live site is getting month-cheapest prices instead of weekend-specific fares. Every page load fires raw Open-Meteo calls that share nothing across users. The weather cache that collapses 10K calls/day to ~400 is written, tested, and waiting on one SSH session.

**Three minutes of work:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull
pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | jq .
```

Expected `/health` response after redeploy:
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
| Open-Meteo URL | `https://api.open-meteo.com/v1` — HTTPS ✅ |
| Marine API URL | `https://marine-api.open-meteo.com/v1` — HTTPS ✅ |
| Auth required | None — free tier ✅ |
| Client timeout | 8s `AbortController` on direct calls ✅ |
| Client retries | 3 attempts, 1.2s/2.4s backoff ✅ |
| Proxy fallback | `_tryProxyWx()` → proxy first (4s timeout) → falls back to direct ✅ |
| localStorage cache | 2hr TTL, LRU eviction ✅ |
| Batch size | 50 venues, 1s sleep between batches ✅ |

**Rate limit math (direct, no proxy cache deployed):**
- 156 venues × ~1.0 weather requests per venue per page load = **~156 calls/cold load**
- Open-Meteo free tier: 10,000 calls/day
- Hard ceiling: **64 DAU**
- Above 64 DAU: 429s start, venues score null, grid looks empty, no error shown to user

**With proxy weather cache deployed:** ~1–5 upstream calls per hour per (lat,lon) pair shared across all concurrent users. Free tier holds through ~10K MAU.

### Venue Count

VENUES array: **156 entries** (grep count). CLAUDE.md says ~154. 2-venue discrepancy — minor, within rounding. No action needed.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | **Not present** ✅ |
| Supabase anon key in client | Present (`app.jsx:26`) — by design, RLS-gated ✅ |
| `.gitignore` | Covers `.env`, `*.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.pdf`, `*.pptx`, `*.docx` ✅ |
| Sentry DSN in `index.html` | Exposed (required by Sentry Loader pattern) ✅ |
| Recent commits for secrets | Clean — last 7 days log shows no credential leaks ✅ |
| APNS keys in proxy | All env vars (`process.env.APNS_*`) — never hardcoded ✅ |
| CORS on proxy | `ALLOWED_ORIGINS` whitelist: `j1mmychu.github.io`, `peakly.app`, `www.peakly.app`, `localhost:8000/3000`, `127.0.0.1:8000` ✅ |

### SRI Coverage (Supply-Chain Risk — Known-Skipped)

| Script | SRI | Risk |
|--------|-----|------|
| React 18.3.1 (unpkg) | ❌ | HIGH — unpkg has no uptime SLA |
| ReactDOM 18.3.1 (unpkg) | ❌ | HIGH |
| Babel Standalone 7.29.7 (unpkg) | ❌ | HIGH |
| Supabase 2.106.2 (jsdelivr) | ❌ | MEDIUM — jsdelivr more stable than unpkg |
| Leaflet 1.9.4 (unpkg) | ✅ | Low |
| Sentry Loader | ❌ | Low — intentionally unversioned |

Status: Known-skipped per `reports/known-skipped.md`. Re-flag immediately if unpkg or jsdelivr is in the news for compromise.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` raw | 535 KB |
| `app.jsx` gzip estimate | ~152 KB |
| Babel Standalone 7.29.7 | ~900 KB minified (runtime JSX transform) |
| React + ReactDOM | ~141 KB minified |
| Supabase JS (gzip) | ~80 KB **eager load** |
| Leaflet JS (gzip) | ~40 KB |
| Sentry (gzip) | ~30 KB |
| **Total cold JS** | ~1.32 MB raw / ~420 KB gzip |

**Bottleneck 1 — Babel Standalone (architectural):** 900 KB download + in-browser JSX parse of 535 KB before first render. On a mid-range Android: 2–4s CPU-bound blank screen. Not fixable without a build step. Accepted constraint.

**Bottleneck 2 — Supabase eager load (fixable):** 80 KB gzip loads on every anonymous page load. ~95%+ of sessions are anonymous and will never touch Supabase until they sign in. The `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` removes this script tag and lazy-loads via dynamic import instead. Known-skipped, but it's real LCP overhead.

**Images:** `loading="lazy"` present on all venue `<img>` tags ✅.

**Unsplash params:** `w=800&h=600&fit=crop` (venue cards) — no `auto=format&q=75` applied. ~7MB savings per full Explore scroll available. Known-skipped.

---

## 6. Cost Estimate

| Tier | MAU | Approx DAU | Open-Meteo calls/day | DigitalOcean | Supabase | Total/mo |
|------|-----|------------|---------------------|-------------|----------|----------|
| Now | ~10 | ~1 | ~156 (direct) | $6 | Free | **$6** |
| 1K MAU | ~33 avg DAU | ~33 | ~5,100/day | $6 | Free | **$6** |
| 10K MAU | ~333 DAU | ~333 | **51,900/day — FREE TIER GONE** | $12 | $0–$25 | **$12–$37** |
| 100K MAU | ~3,300 DAU | ~3,300 | ~400/day **with proxy cache** | $24–$48 | $25 | **$49–$73** |

**Without deploying the proxy cache:** hits Open-Meteo ceiling at **64 DAU**, not 10K MAU. That's 64 people, not 64,000.

**With proxy cache:** free tier holds through ~10K MAU. Single redeploy. Has been in this table for 32 days.

---

## 7. APNS / Strike Alerts

| Check | Result |
|-------|--------|
| Polling worker code | ✅ In proxy.js |
| APNS JWT sender code | ✅ In proxy.js |
| Client alert registration | ✅ In app.jsx |
| APNS env vars on VPS | ❓ Unverifiable from sandbox |
| Hard deadline set | 2026-05-13 — **23 days overdue** |

### P1-B — APNS: 23 Days Past Deadline

CLAUDE.md made the call: by 2026-05-13, either APNS is live OR gate the Alerts tab behind `Capacitor.isNativePlatform()` for iOS. 23 days later, neither has happened. The Alerts tab is visible on iOS, push never fires, and App Store review is blocked.

**Option A — Wire APNS (30 min if .p8 key is in hand):**
```bash
ssh root@198.199.80.21
# copy AuthKey_XXXXXXXX.p8 first via scp
pm2 set peakly-proxy:APNS_KEY_ID    "YOUR_10_CHAR_KEY_ID"
pm2 set peakly-proxy:APNS_TEAM_ID   "YOUR_10_CHAR_TEAM_ID"
pm2 set peakly-proxy:APNS_BUNDLE_ID "com.peakly.app"
pm2 set peakly-proxy:APNS_KEY_PATH  "/opt/peakly-proxy/AuthKey_XXXXXXXX.p8"
pm2 set peakly-proxy:APNS_PROD      "true"
pm2 restart peakly-proxy
curl https://peakly-api.duckdns.org/health | jq .apns_configured
# Expected: true
```

**Option B — Gate on iOS (5 min, ship today, unblocks App Store):**

In `app.jsx`, add near the top of the `App` component:
```jsx
const isIOS = typeof window !== "undefined" &&
  (window.Capacitor?.getPlatform?.() === "ios" ||
   /iPad|iPhone|iPod/.test(navigator.userAgent));
```

Then in the tab nav, wrap the Alerts tab button:
```jsx
{!isIOS && (
  <button onClick={() => setTab("alerts")} ...>
    {/* alerts icon + label */}
  </button>
)}
```

And in the tab router, similarly guard the `tab === "alerts"` render branch. Web users and Android unaffected.

---

## 8. Plausible Analytics Configuration Note

`data-domain="j1mmychu.github.io"` — correct for GitHub Pages. When `peakly.app` domain is live, add it as an additional domain in the Plausible dashboard (Settings → Domains) and update this tag to `data-domain="peakly.app"`. Otherwise analytics traffic will split across two domains.

---

## 9. What Breaks First at Scale

**Open-Meteo at 64 DAU.** Not 64K. 64 individual users. Each cold page load fires ~156 direct API calls against a free tier with a 10,000/day ceiling. At 64 DAU the ceiling is breached, calls 429, venues return null data, scoring falls back to 0, the Explore grid looks empty, users churn. No error message is shown. The proxy weather cache — already written, sitting in proxy.js undeployed for 32 days — collapses this to ~400 upstream calls/day. One SSH session separates "breaks at 64 users" from "holds through 10K MAU." Everything else on this list is downstream of that decision.

---

## Action Items (Ranked)

| Priority | Action | Time | Owner |
|----------|--------|------|-------|
| **P1-A** (Day 32) | `ssh root@198.199.80.21; cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy` | 3 min | Jack |
| **P1-B** (Day 23) | Wire APNS keys OR gate Alerts tab behind `isIOS` check | 5–30 min | Jack |
| **P1-C** (Day 10) | Add cache-buster auto-bump block to `scripts/auto-push.sh` | 10 min | Jack/DevOps |
| **P2** | `git apply reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff` — removes 80KB eager load | 1 min | Jack |
| **P2** | Add `auto=format&q=75` to Unsplash venue photo URLs — ~7MB/scroll savings | 15 min | DevOps |
| **P2** | Update Plausible `data-domain` to `peakly.app` when domain goes live | 2 min | Jack |
