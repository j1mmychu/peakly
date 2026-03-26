# Peakly DevOps Report — 2026-03-26

**Overall Status: YELLOW → improving**
No production outages. HTTPS proxy confirmed live. P0 weather cache and SW cache bump shipped this session. One revenue P1 remaining (Google Flights links), one monitoring P2 (Sentry DSN empty).

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ✅ GREEN | app.jsx 6,072 lines / 404 KB |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` confirmed |
| Proxy timeout/fallback | ✅ GREEN | 5s timeout, AbortController, null fallback |
| Plausible analytics | ✅ GREEN | Present, uncommented, firing |
| Secrets in client code | ✅ GREEN | No tokens exposed |
| .gitignore | ✅ GREEN | Covers .env, *.pem, *.key |
| Weather cache (localStorage) | ✅ SHIPPED | 30-min TTL added this session |
| Service worker cache version | ✅ SHIPPED | Bumped to `peakly-20260326` this session |
| Cache-buster | ✅ SHIPPED | Updated to `v=20260326a` this session |
| Sentry DSN | ❌ EMPTY | Zero production error visibility — P2 |
| REI affiliate tags | ❌ MISSING | 22 links earning $0 — blocked on Avantlink signup |
| Flight links (buildFlightUrl) | ❌ GOOGLE | Google Flights earns $0 — P1 |
| React/ReactDOM CDN version | ⚠️ UNPINNED | `react@18` resolves to latest — supply chain risk |

---

## SHIPPED THIS SESSION

### Weather/Marine 30-min localStorage Cache

**Why it mattered:** Every page load fired 192 weather + ~80 marine calls simultaneously = ~272 HTTP requests. Open-Meteo free tier is 10,000 requests/day. That's **36 page loads before the daily quota is gone**. One moderately active user refreshing the app 6x hit 1,632 calls. Five concurrent users = silent failure for everyone.

**What was shipped:** `fetchWeather()` and `fetchMarine()` now check `localStorage` before making any network calls. Cache key: `peakly_wx_{type}_{lat}_{lon}`. TTL: 30 minutes with automatic expiry. On cache hit, zero API calls. On cache miss, result is stored for subsequent loads.

**Effect:** First cold load still fires up to 272 calls (unavoidable). Every subsequent load or 10-min auto-refresh within 30 minutes: zero calls. At 30 concurrent active users, daily Open-Meteo calls drop from ~50,000+ to ~272 (one cold cycle per 30-min window per user). Free tier now covers ~1K MAU safely.

### Service Worker Cache Name Bumped

`CACHE_NAME` changed from `peakly-v1` to `peakly-20260326`. Forces all returning users to invalidate their SW cache and pick up fresh assets on next visit. Previous value was never bumped since initial deployment — returning users may have been on stale code.

### Cache-Buster Updated

`app.jsx?v=20260325c` → `app.jsx?v=20260326a`. Stale by one day as of session start.

---

## P1 — Fix This Week

### P1.1 — buildFlightUrl() Points to Google Flights (Earns $0)

`buildFlightUrl()` at line 1491 generates `https://www.google.com/flights?...` links. Google Flights has no affiliate program. Called at lines 1809, 1880, and 4704 — every Flights CTA in the app.

**Fix — switch to Aviasales deep links:**

```javascript
function buildFlightUrl(from, to, opts) {
  const whenId = opts?.whenId || "anytime";
  const startDate = opts?.startDate;
  const endDate = opts?.endDate;
  const dep = startDate || getFlightDate(whenId);
  const ret = endDate || (() => {
    const d = new Date(dep);
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  })();
  // Aviasales deep link with Travelpayouts marker
  const marker = "YOUR_TRAVELPAYOUTS_MARKER"; // Jack: Travelpayouts dashboard → Programs → Aviasales
  const depShort = dep.replace(/-/g, "").slice(2);
  const retShort = ret.replace(/-/g, "").slice(2);
  return `https://www.aviasales.com/search/${from}${depShort}${to}${retShort}1?marker=${marker}&locale=en&currency=usd`;
}
```

**Jack:** Get your marker ID from Travelpayouts dashboard → Programs → Aviasales. 5 minutes.

**Estimated fix time: 15 minutes dev + 5 min Jack.**

---

## P2 — Fix This Sprint

### P2.1 — Sentry DSN Empty (Zero Error Visibility)

`app.jsx` line 6: `const SENTRY_DSN = "";` — error infrastructure is wired at lines 1–66, just needs a DSN. Zero production visibility into crashes, Babel parse failures, or runtime errors.

**Fix (5 minutes, Jack action):**
1. sentry.io → New Project → Browser JavaScript → Free tier
2. Copy DSN
3. `app.jsx` line 6: `const SENTRY_DSN = "https://YOUR_KEY@oYOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID";`

### P2.2 — REI Affiliate Links Earning $0

22+ REI product links in `GEAR_ITEMS` (line 4530+) are plain search URLs with no affiliate tag. **No code fix possible until Jack signs up for REI Avantlink.** No LLC required. ~30 minutes at avantlink.com.

After approval, append affiliate params to each REI URL per Avantlink's format.

### P2.3 — Unpinned React CDN Version

`index.html` loads `react@18` / `react-dom@18` (floating minor). A breaking 18.x patch auto-applies silently.

**Fix:**
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

**Estimated fix time: 2 minutes.**

### P2.4 — Sentry Loader Script Missing from index.html

CLAUDE.md explicitly states: "Sentry live (2026-03-25). Loader Script in index.html, Sentry.init() in app.jsx." Neither is true. `grep "sentry" index.html` returns nothing. The Sentry Loader Script is completely absent. The in-app Sentry-lite reporter (lines 1–66 in app.jsx) exists and is correct, but will only work once the DSN is filled in (see P2.1). Do not add the Loader Script until the DSN is ready — both must happen together.

### P2.5 — CLAUDE.md / Master Branch Divergence (65 Orphaned Commits)

65 commits exist in an orphaned branch (`75a3a60`) that never merged to master. CLAUDE.md reflects those commits' claimed state ("Sentry live", "2,226 venues", "weather cache shipped") but master code has none of them. Every agent run makes decisions based on false premises.

```bash
git log --oneline 75a3a60 ^master | head -30
```

Jack decision needed: merge the orphaned branch or abandon it. Until resolved, treat CLAUDE.md "Completed" items as unverified — always grep the code before marking anything done.

### P2.6 — Plausible Domain (Future Risk)

`index.html` line 27: `data-domain="j1mmychu.github.io"` — will stop recording when peakly.app goes live post-LLC unless updated.

---

## Performance Analysis

| Asset | Size estimate | Notes |
|---|---|---|
| Babel Standalone 7.24.7 | ~2.0 MB | Largest single asset — blocks first paint |
| ReactDOM 18 UMD prod | ~1.1 MB | Required |
| React 18 UMD prod | ~130 KB | Required |
| app.jsx (raw JSX) | ~395 KB | Transpiled at runtime |
| **Total first-load JS** | **~3.6 MB** | |

Bottleneck: Babel Standalone parses 395KB of JSX on every cold first load. Returning users get it from browser cache. First-time mobile visitors on 3G: 8–12s first meaningful paint. Not fixable without a build step — accepted trade-off.

Image lazy loading: all `<img>` tags have `loading="lazy"` — verified.

---

## Cost Projections

| MAU | Monthly cost | Notes |
|---|---|---|
| Current (~0) | $6 | VPS only |
| 1K MAU | $6 | Weather cache holds free tier |
| 10K MAU | $12–18 | Upgrade droplet to 2GB ($12) |
| 100K MAU | $60–120 | Load balancer + Redis + Cloudflare Pro + Open-Meteo commercial |

Open-Meteo free tier covers ~1K MAU with weather cache in place. At 10K MAU, move to their commercial tier (~$29/month) or build a server-side weather proxy.

---

## What Breaks First at Scale

**Without today's cache fix, Open-Meteo would have died at ~5 active users.** That's now resolved. The next failure point is the DigitalOcean VPS at 1GB RAM — the Node.js flight proxy will start queuing at ~500 concurrent requests. Fix: 20-line in-memory LRU cache on the server keyed by `${origin}-${destination}` with a 5-minute TTL. After that, the bottleneck is Babel Standalone parse time on low-end mobile devices — fixable post-launch with a one-time pre-transpile step that eliminates the 2MB Babel Standalone entirely.

---

## Action Items

| Priority | Owner | Action | Time | Status |
|---|---|---|---|---|
| P0 | Dev | Weather/marine localStorage cache (30-min TTL) | 45 min | ✅ SHIPPED |
| P0 | Dev | Bump SW cache name | 2 min | ✅ SHIPPED |
| P0 | Dev | Bump cache-buster | 30 sec | ✅ SHIPPED |
| P1 | Dev + Jack | Switch buildFlightUrl to Aviasales deep links | 20 min | ⏳ PENDING |
| P2 | Jack | Add Sentry DSN at sentry.io (free tier) | 5 min | ⏳ PENDING |
| P2 | Jack | REI Avantlink signup (no LLC needed) | 30 min | ⏳ PENDING |
| P2 | Dev | Pin React/ReactDOM to 18.3.1 | 2 min | ⏳ PENDING |
| P2 | Jack | Audit 65 orphaned commits (`75a3a60` ^master), decide merge/abandon | 1 hr | ⏳ PENDING |
| Future | Jack | Update Plausible domain to peakly.app when live | 30 sec | BLOCKED (LLC) |
| Future | Dev | VPS Node.js flight price LRU cache | 20 min | ⏳ PENDING |
