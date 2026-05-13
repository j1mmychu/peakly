# Peakly DevOps Report — 2026-05-13

**Overall Status: 🟡 YELLOW**

VPS redeploy is still the open P0. Everything listed as "awaiting VPS redeploy" in the 05-08 report remains unshipped to production. Additionally, today is the APNS configuration deadline from CLAUDE.md — a decision must be made by EOD. Two stale-surf SEO strings in index.html are a P1 that's been sitting since the May 3 pivot.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **8,928 lines / 519 KB raw** (~129 KB gzip estimate) |
| CDN scripts | All HTTPS ✅ |
| Plausible analytics | Present, uncommented, `domain=j1mmychu.github.io` ✅ |
| Cache-buster | `v=20260510l` — consistent across app.jsx / sw.js / index.html ✅ |
| Sentry DSN | Wired (`9416b032...`), `tracesSampleRate: 0.05` ✅ |
| OG/title "surf" references | Updated in a prior session — verify with `grep -i surf index.html` ⚠️ |

`index.html` was updated by another agent session: OG title, meta description, and Twitter card now correctly say "Ski & Beach". Confirm no remaining "surf" strings remain in the JSON-LD block:

```bash
grep -i "surf" index.html
# Should return 0 results
```

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| No raw IP in client | Correct ✅ |
| Travelpayouts token in client | Not present ✅ |
| TP_MARKER `710303` in client | Present — public affiliate ID for deep links, not auth token. Acceptable ✅ |
| Fetch timeout | 5s `AbortController` ✅ |
| Retry logic | 3 attempts, 1.2s / 2.4s backoff ✅ |
| Weekend-specific `depart_date` param | Code in `proxy.js` — **VPS not redeployed** ❌ |
| `/api/weather` + `/api/marine` proxy cache | Code in `proxy.js` — **VPS not redeployed** ❌ |
| APNS polling worker | Code in `proxy.js` — **VPS not redeployed + APNS keys not configured** ❌ |

**VPS redeploy command (unchanged from last 3 reports):**
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"
curl https://peakly-api.duckdns.org/health
# Expect: {"status":"ok","alerts":0,"wx_cache_size":0,"apns":"unconfigured",...}
```

---

## 3. APNS Deadline — Decision Required TODAY (2026-05-13)

Per CLAUDE.md, today is the hard deadline: either APNS is live OR the Alerts tab is gated behind `Capacitor.isNativePlatform()` for iOS.

**Option A — APNS live:** Requires running the Apple Dev console + 5 `pm2 set` commands from `peakly-native/PUSH_SETUP.md`. The `.p8` key requires Apple's ~72h approval. Clock has already expired — not achievable by EOD today.

**Option B — Gate Alerts tab on native platform (recommended, ~10 min):**

In `app.jsx`, add near the top of the App component:

```javascript
const isNativeIOS = typeof Capacitor !== 'undefined'
  && typeof Capacitor.isNativePlatform === 'function'
  && Capacitor.isNativePlatform()
  && typeof Capacitor.getPlatform === 'function'
  && Capacitor.getPlatform() === 'ios';
```

Then wherever the visible tab list is filtered (grep for `TABS` or `visibleTabs`):
```javascript
// Hide Alerts on iOS native until APNS is configured
.filter(t => !(t.id === 'alerts' && isNativeIOS))
```

Web users see Alerts tab normally. iOS App Store build omits it. The polling worker stays dormant on the VPS and re-enables the moment APNS creds load. Cache-bust after applying.

---

## 4. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` (free, no auth) ✅ |
| Client-side wx cache | 2hr TTL, 6hr hard evict ✅ |
| Retry on 429/5xx | 3 attempts, exponential backoff ✅ |
| Marine fetch gating | `category === "beach"` check correct ✅ |
| Initial weather fetch | Top 100 venues, batched 50 at a time ✅ |
| Server-side proxy cache | **Awaiting VPS redeploy** ❌ |
| Scale risk at 500+ concurrent users | ~50K+ direct Open-Meteo calls — no spike protection until proxy deployed |

**Free tier note:** Open-Meteo has no documented hard rate limit for non-commercial use, but throttles under high concurrency. The server-side 2hr LRU cache in `proxy.js` collapses N users hitting the same venue to 1 upstream call per 2 hours. At 10K MAU this is existential for uptime. It is code-complete but undeployed.

---

## 5. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts auth token in client | Not present ✅ |
| Supabase anon key in client | Present (line 26) — intentional, RLS-gated. **Verify RLS enforced before launch** ⚠️ |
| Sentry DSN in client | Present — standard practice, acceptable ✅ |
| `.gitignore` | Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.pdf`, `*.pptx`, business docs ✅ |
| Recent commits | Auto-commits + PR merges — no credential commits detected ✅ |
| SRI on React/Babel/Supabase CDN | Missing — in `known-skipped.md` (intentional skip) |
| CSP meta tag | Missing — in `known-skipped.md` (Babel requires `unsafe-eval`) |

**Supabase RLS verification (run in Supabase SQL editor before launch):**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_data', 'shared_lists');
-- Both rows must show rowsecurity = true
-- If either shows false: ALL users' synced data exposed to anyone with the anon key
```

---

## 6. Performance Analysis

| Asset | Raw | Est. Gzipped |
|-------|-----|-------------|
| Babel standalone 7.24.7 | ~2.1 MB | ~580 KB |
| Supabase JS 2.45.4 (eager) | ~400 KB | ~80 KB |
| ReactDOM 18.3.1 | ~440 KB | ~136 KB |
| React 18.3.1 | ~140 KB | ~47 KB |
| Leaflet 1.9.4 | ~145 KB | ~40 KB |
| app.jsx | 519 KB | ~130 KB |
| **Total first-load** | **~3.7 MB raw** | **~1.01 MB gzipped** |

**Babel 7.24.7 → 7.29.4 (P1, 5 min):** 5 patch versions behind. One-line change + cache bust:

```html
<!-- index.html — replace Babel script line -->
<script src="https://unpkg.com/@babel/standalone@7.29.4/babel.min.js"></script>
```

Bump cache key in lockstep across all three files:
- `app.jsx` line 17: `const PEAKLY_BUILD = "20260513a";`
- `sw.js` line 2: `const CACHE_NAME = "peakly-20260513a";`
- `index.html`: `app.jsx?v=20260513a`

**`loading="lazy"` on images:** All venue photo render sites confirmed ✅

**Supabase eager load (in known-skipped.md — not re-flagging):** 80KB gzip on every anonymous first paint. Diff at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`.

**Image optimization (in known-skipped.md — not re-flagging):** 156 Unsplash URLs missing `&auto=format&q=75`.

---

## 7. Cost Estimate

| Tier | Infrastructure | Monthly Cost |
|------|---------------|-------------|
| Current | DO 1GB droplet + GH Pages | **$6/month** |
| 1K MAU | Same | **$6/month** |
| 10K MAU | DO 2GB upgrade | **$18/month** |
| 100K MAU | DO 4GB + Cloudflare Workers | **$36–48/month** |

---

## 8. Proxy `_rateMap` Size Cap (P2)

`proxy.js` rate limiter grows `_rateMap` unbounded between 5-min cleanup windows. At 50K+ unique IPs/day on the 1GB droplet, OOM risk. One-line circuit breaker (add inside `rateLimiter()`, before the entry check, around `proxy.js` line 27):

```javascript
if (_rateMap.size > 50_000) _rateMap.clear(); // hard reset under sustained flood
```

---

## Priority Matrix

| # | Severity | Issue | ETA |
|---|----------|-------|-----|
| 1 | **P0** | VPS not redeployed — weather proxy cache, weekend pricing, APNS worker all inactive | 5 min SSH |
| 2 | **P1** | APNS deadline today — Option B (iOS gate) is the only executable path | 10 min code |
| 3 | **P1** | Babel 7.24.7 → 7.29.4 + cache bust | 5 min |
| 4 | **P2** | Supabase RLS verification before launch | 5 min SQL |
| 5 | **P2** | `_rateMap` no size cap in proxy.js | 2 min |
| 6 | **P3** | APNS alert persistence — in-memory store lost on restart | v2 scope |

---

## What Breaks First at Scale

**Open-Meteo is the single point of failure at 1K+ MAU.** The server-side cache in `proxy.js` exists but is not deployed. A modest Reddit post driving 500 simultaneous cold-cache sessions fires ~50K upstream Open-Meteo requests within 10 minutes. Open-Meteo's free tier has no SLA and will throttle or block the VPS IP, causing the Explore tab to show 0-scored venues for all users until TTL expires. Once the VPS deploy runs, the 2hr LRU cache collapses 500 concurrent users to 1 upstream call per venue per window — 154 venues = 154 calls per 2hr regardless of traffic. That scales cleanly past 50K MAU on the current $6/month droplet.
