# Peakly DevOps Report — 2026-05-17

**Status: YELLOW**

No P0s. Two P1s, both requiring the VPS SSH session that has been overdue for 13 days. Three P2s are code-fixable in under 30 min total. One security note on Supabase anon key — flagged but low actual risk, explained below.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | **8,837 lines / 524,394 bytes (512 KB)** — up from ~6,984 lines pre-pivot. File is growing. Still parseable by Babel Standalone, but watch the 1MB ceiling. |
| CDN deps load | All 6 deps present (React 18.3.1, ReactDOM 18.3.1, Babel 7.24.7, Supabase 2.45.4, Leaflet 1.9.4, Google Fonts). No broken references. |
| Plausible analytics | Present and uncommented — `data-domain="j1mmychu.github.io"` on `script.hash.js`. Correct. |
| Cache-buster | `v=20260513j` in index.html, `CACHE_NAME = "peakly-20260513j"`, `PEAKLY_BUILD = "20260513j"`. All three match. **STALE — last bumped 2026-05-13, today is 2026-05-17.** No code changes require a bump today, so this is informational only. Bump when next change ships. |
| Sentry DSN | Active DSN wired at app.jsx:8 (`9416b032a46681d74645b056fcb08eb7`). Error boundary calls `Sentry.captureException`. Green. |

---

## 2. Flight Proxy Status

**Proxy URL:** `https://peakly-api.duckdns.org` (HTTPS via Caddy — confirmed, not HTTP)

FLIGHT_PROXY constant at app.jsx:1624:
```
const FLIGHT_PROXY = "https://peakly-api.duckdns.org";
```

No raw IP in client code. The old `198.199.80.21` references were cleaned in commit `4d16e3d`. Clean.

`fetchTravelpayoutsPrice` has:
- 4s timeout via `AbortController` on the proxy call
- Fallback to `flight.live = false` estimate when proxy is down
- In-flight deduplication semaphore (`_flightSem`, max 3 concurrent)

**P1 — VPS NOT REDEPLOYED (13 days overdue):** Commits from 2026-05-04 wired weekend-specific `depart_date`/`return_date` params in `proxy.js` AND added the `/api/weather` + `/api/marine` proxy endpoints with shared 2hr LRU cache. The client code is live. The VPS is still running the old proxy. This means:
- Every user hits Open-Meteo directly (no spike protection)
- Weekend-specific pricing falls back to month-cheapest silently
- `/api/weather` and `/api/marine` return 404

**Fix — one SSH session, ~5 min:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
git pull origin main
pm2 restart peakly-proxy
curl https://peakly-api.duckdns.org/health
```
Expected health response after restart:
```json
{"status":"ok","wx_cache_size":0,"wx_inflight":0,"poll":{"fires":0},"apns":"unconfigured"}
```

---

## 3. Weather & External API

- **Open-Meteo:** Called directly from client (proxy not deployed). Free tier = 10,000 calls/day per IP. With 154 venues, batched 50/load, fetching top 100 on init = ~100 upstream calls per unique user IP per cold load. At ~100 concurrent users from the same CDN egress or a Reddit spike, this hits 10K in under 2 minutes.
- **Client-side cache:** WX_CACHE_TTL = 2hr (localStorage, per-user). Prevents repeat calls from the same user. Does NOT help when 200 users simultaneously cold-load.
- **Fix is the VPS redeploy above** — proxy caches at the server layer across all users. Same lat/lon hit = 1 upstream call, not N.
- **Marine API:** Only called for beach venues (`v.category === "beach"`). Correct — no surf dead code leaking marine calls.
- **Batch throttling:** 1s delay between batch 1 and batch 2 of weather loads. Adequate for current traffic.

---

## 4. Security Audit

### PASS: Travelpayouts token not in client code
`TOKEN = process.env.TRAVELPAYOUTS_TOKEN` — server-side only in `proxy.js`. Client only uses `TP_MARKER = "710303"` (the public affiliate marker, not the secret API token). This is correct — the marker is meant to be public.

### PASS: No secrets in recent commits
`git log --oneline -15` shows only report commits and feature merges. No credentials introduced.

### PASS: `.gitignore` is comprehensive
Covers `.env*`, `*.pem`, `*.p8`, `*.key`, `*.pdf`, `*.pptx`, business docs, and `node_modules`.

### NOTE: Supabase anon key in `app.jsx`
```
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```
**This is not a security flaw — it is the designed behavior.** Supabase anon keys are intentionally public-safe and are protected by Row Level Security (RLS) policies on the database side. Anyone can see this key and it cannot be used to read other users' data if RLS is correctly configured. **Action required: verify RLS is enabled on `user_data` and `shared_lists` tables in Supabase dashboard.** If RLS is off, that is a P0. With RLS on, this is a non-issue.

### P2: Missing SRI on React, Babel, Supabase CDN scripts
Leaflet has SRI hashes. React, ReactDOM, Babel, and Supabase do not. If unpkg or jsdelivr are compromised, malicious JS runs with full app access.

Current (no SRI):
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
```

**Caveat:** Adding SRI to Babel breaks client-side JSX transpilation because Babel Standalone uses `eval()` internally, which CSP `strict-dynamic` would block. Do NOT add a CSP `script-src` header that restricts eval until app.jsx is pre-compiled. For now, add SRI on React and Supabase only (safe), skip Babel SRI (Babel uses `new Function()` which is eval-equivalent and breaks under strict CSP).

SRI hashes to add:
```bash
# Run these to get current hashes:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```
Then add `integrity="sha384-<hash>"` to each script tag.

### P2: Proxy has no per-route rate limiting on `/api/alerts`
The global rate limiter (60 req/min/IP) applies to all routes, but `/api/alerts` POST accepts arbitrary push token + lat/lon from any origin. No authentication. A bot could register 59 fake alert subscriptions per minute per IP and fill `_alerts` (in-memory Map) until the proxy runs out of RAM.

**Fix (add to proxy.js after the global rateLimiter):**
```javascript
// Stricter limiter for write endpoints
const _alertsRateMap = new Map();
function alertsRateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const now = Date.now();
  const entry = _alertsRateMap.get(ip);
  if (!entry || now - entry.start > 60000) {
    _alertsRateMap.set(ip, { start: now, count: 1 });
    return next();
  }
  if (entry.count >= 5) { // 5 alert registrations per minute per IP
    return res.status(429).json({ success: false, error: 'Too many alert registrations' });
  }
  entry.count++;
  return next();
}
// Apply before alert routes:
app.post('/api/alerts', alertsRateLimiter, (req, res) => { ... });
```

---

## 5. Performance Analysis

### JavaScript bundle (what the browser loads cold):

| Resource | Gzipped estimate |
|---|---|
| Babel Standalone 7.24.7 | ~940 KB |
| ReactDOM 18.3.1 | ~130 KB |
| app.jsx (not pre-compiled) | ~130 KB (gzipped) |
| React 18.3.1 | ~42 KB |
| Supabase 2.45.4 | ~80 KB |
| Leaflet 1.9.4 | ~44 KB |
| Google Fonts | ~12 KB |
| **Total** | **~1.38 MB gzipped** |

**Single largest bottleneck: Babel Standalone at ~940 KB gzipped / ~2.8 MB raw.** This is the cost of the no-build-step architecture. Babel must download AND execute before `app.jsx` can parse. On a 4G connection (10 Mbps) this is ~750ms just for Babel transfer, plus ~300-500ms parse/compile time = 1+ second before any React renders. Mitigated somewhat by the splash screen animation that fires from inline CSS before JS runs.

The `<link rel="preload">` on Babel in index.html helps pipeline the download. Keep it.

**Images:** All `<img>` tags use `loading="lazy"`. Green. Unsplash images use `w=800&h=600&fit=crop` params — no `auto=format&q=75` or `fm=webp`. This means ~200-400 KB JPEG per image instead of ~40-80 KB WebP. With 154 venue images lazy-loaded on scroll, a full Explore scroll transfers ~7 MB in images. Add `&auto=format&q=75` to all Unsplash URLs (sed one-liner, ready-to-ship candidate).

**CDN version staleness:**
- Babel 7.24.7 → latest 7.27.x. No critical security patches in this range, but minifier improvements exist.
- Supabase 2.45.4 → latest ~2.64.x. Several patch releases. Worth bumping for bug fixes.
- React 18.3.1 → current stable. Green.
- Leaflet 1.9.4 → current stable. Green.

---

## 6. Cost Estimate

### Current infrastructure:
- **DigitalOcean droplet:** $6/month (1GB RAM, Ubuntu 24)
- **GitHub Pages:** $0
- **Supabase:** $0 (free tier — 500MB DB, 2GB bandwidth, 50K MAU auth)
- **Open-Meteo:** $0 (free tier)
- **Plausible Analytics:** ~$9/month (or self-hosted free)
- **Sentry:** Free tier (5K errors/month)
- **Total today:** ~$15/month

### Projected at scale:

| MAU | DO Droplet | Supabase | Sentry | Open-Meteo | Total |
|---|---|---|---|---|---|
| 1K | $6 | $0 (free) | $0 | $0 (proxy caches) | **~$15/mo** |
| 10K | $24 (2GB RAM) | $25 (Pro) | $26 | $0 | **~$75/mo** |
| 100K | $48 (4GB RAM) + $12 LB | $25 | $89 | ~$100 | **~$274/mo** |

At 100K MAU, revenue estimate is ~$1,200-1,400/mo (at $13.66 RPM × 100K). **Infrastructure is 20% of revenue at 100K — comfortable.**

### Cost optimization opportunities:
1. **Supabase free tier limit:** 50K MAU auth. At 50K+ signed-in users, upgrade to Pro ($25/mo) or self-host. Not a concern pre-1K.
2. **Open-Meteo rate limit:** Direct calls hit 10K/day/IP ceiling at ~100 concurrent cold loads. **VPS proxy redeploy solves this at $0 additional cost** (shared in-memory cache across all users).
3. **Unsplash bandwidth:** Not billed (Unsplash CDN), but WebP format saves ~75% of image bytes for users. Add `&auto=format&q=75` to all photo URLs.

---

## What Breaks First at Scale

**Open-Meteo rate limits are the first failure mode.** The VPS proxy is built and tested but undeployed. At ~100 simultaneous cold-loads (a modest Reddit spike), direct Open-Meteo calls from the client hit the 10K/day free tier ceiling within 2 minutes. The fallback is graceful (venues show without scores) but the core product value disappears. The fix is deployed to the repo and requires a single SSH session. This is a one-person, 5-minute task that has been sitting for 13 days. It must happen before any launch push to Reddit, HN, or Product Hunt. After that, the proxy's 4000-entry LRU cache + in-flight dedupe handles N simultaneous users triggering 1 upstream call, and you don't hit Open-Meteo limits until ~50K daily active users.

---

## Issue Summary

### P1 — Fix This Week

**[P1-A] VPS proxy not redeployed — weather proxy + weekend pricing not live**
- Impact: Open-Meteo rate limit exposure, weekend-specific prices falling back to month estimates
- Effort: 5 min SSH session
- Fix: `ssh root@198.199.80.21; cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy`

**[P1-B] APNS unconfigured — Strike Alerts dead on iOS (13 days overdue)**
- Impact: Alerts tab visible to iOS users but pushes never fire; App Store submission blocked
- Effort: ~30 min (Apple Dev console + 5 `pm2 set` commands)
- Fix: Follow `peakly-native/PUSH_SETUP.md` runbook exactly. Deadline: 2026-05-17 (today) per CLAUDE.md. After today: gate Alerts tab behind `Capacitor.isNativePlatform()` and ship App Store v1 without push.

### P2 — Fix This Sprint

**[P2-A] Unsplash images missing WebP/quality params**
- Impact: ~7 MB extra transfer on full Explore scroll vs ~1.5 MB with WebP
- Effort: 5 min (sed one-liner across 150 venue photo URLs)
- Fix: `sed -i 's/\?w=800&h=600&fit=crop/?w=800\&h=600\&fit=crop\&auto=format\&q=75/g' app.jsx`
  Then verify no double-params in venues that already have `fp-x`/`fp-y` params (use `&auto=format&q=75` append instead).

**[P2-B] No SRI on React, Babel, Supabase CDN scripts**
- Impact: CDN supply chain compromise would run arbitrary JS
- Effort: 15 min (generate hashes, add integrity attrs to 3 script tags — skip Babel)
- Fix: See Section 4 above for curl commands to generate hashes

**[P2-C] `/api/alerts` write endpoint has only global rate limiting**
- Impact: Bot can fill in-memory `_alerts` Map and OOM the 1GB VPS
- Effort: 10 min (add `alertsRateLimiter` middleware — code in Section 4 above)
- Deploy alongside P1-A VPS restart

### Known (not actioning)

- **Supabase anon key in client code** — by design, protected by RLS. Verify RLS is on in Supabase dashboard.
- **No CSP header** — blocked by Babel Standalone's eval requirement. Revisit if/when app.jsx is pre-compiled.
- **Babel 7.24.7 → 7.27.x** — not critical, no security patches. Defer until a full CDN version audit makes sense.
- **Supabase 2.45.4 → 2.64.x** — minor bug fixes only, no auth security patches. Defer.
