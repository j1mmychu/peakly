# Peakly DevOps Report — 2026-06-06

**Status: 🟡 YELLOW**

No new P0s. Cache buster was 1 day stale — bumped this run (`20260605a` → `20260606a`). Two P1s remain chronic: VPS redeploy is now **Day 33** overdue; in-memory alerts store has no persistence. A new P2 surfaced today: **Supabase version mismatch** between the eager `<script>` in index.html (2.106.2) and the lazy-load fallback in app.jsx (2.45.4 — 61 minor versions older) — **fixed this run**. Open-Meteo ceiling math: **40 DAU** is all you get before silent degradation without the proxy weather cache running.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache buster `20260605a` → `20260606a` | `app.jsx:17` | 1 day stale → current |
| SW CACHE_NAME `peakly-20260605a` → `peakly-20260606a` | `sw.js:2` | Evicts stale cached assets on next visit |
| Query string `?v=20260605a` → `?v=20260606a` | `index.html:400` | Forces browser reload of updated app.jsx |
| Supabase lazy-load `2.45.4` → `2.106.2` | `app.jsx:61` | P2-A — aligns fallback with eager script in index.html |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines | **9,006** |
| `app.jsx` raw bytes | **~535 KB** (~149 KB estimated gzip) |
| CDN scripts | All HTTPS, pinned to exact semver ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` ✅ |
| Cache buster | `v=20260606a` — **bumped this run** |
| SW CACHE_NAME | `peakly-20260606a` — **bumped this run** |
| PEAKLY_BUILD | `20260606a` — **bumped this run** |
| Sentry DSN | Active: `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/4511108673765376` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — survives CDN failure ✅ |

### CDN Dependency Versions

| Library | Pinned Version | SRI | Status |
|---------|---------------|-----|--------|
| React | 18.3.1 | ❌ None | Current |
| ReactDOM | 18.3.1 | ❌ None | Current |
| Babel Standalone | 7.29.7 | ❌ None | Current |
| Supabase JS (eager, index.html:85) | **2.106.2** | ❌ None | Current |
| Supabase JS (lazy fallback, app.jsx:61) | **2.106.2** | ❌ None | ✅ Fixed this run (was 2.45.4) |
| Leaflet JS | 1.9.4 | ✅ sha256 | Stable |
| Leaflet CSS | 1.9.4 | ✅ sha256 | Stable |
| Sentry Loader | Project-pinned | n/a | Managed by Sentry |

### Structural Note: Cache Buster Still Manually Bumped (Day 11+)

Every report since 2026-05-26. The fix is 6 lines of shell. Here it is again:

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

10 minutes to implement. Eliminates this entire class of bug permanently.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in client | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Raw IP in client | None — historical 104.131.82.242 gone ✅ |
| Travelpayouts server token | `process.env.TRAVELPAYOUTS_TOKEN` — server-side only ✅ |
| TP_MARKER affiliate ID | `"710303"` at `app.jsx:1936` — public affiliate marker, correct ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s `AbortController` ✅ |
| Retry logic | 3 attempts, 1.2s/2.4s exponential backoff on 429/5xx ✅ |
| Concurrency cap | Semaphore: max 3 concurrent requests (`_flightSem`) ✅ |
| VPS redeploy status | ❌ **Day 33 overdue** — code shipped 2026-05-04, never restarted |

### P1-A — VPS Redeploy: Day 33 (CHRONIC, BLOCKING SCALE)

Every feature deployed since 2026-05-04 is dead in production:
- Shared Open-Meteo weather cache (the **40-DAU ceiling fix**)
- Weekend-specific Travelpayouts pricing (users get month-cheapest, not Fri–Mon fares)
- Strike alerts polling worker

**Two commands, ~3 minutes:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && pm2 save
curl https://peakly-api.duckdns.org/health | jq .
```

Expected `/health` after redeploy:
```json
{
  "status": "ok",
  "wx_cache_size": 0,
  "wx_inflight_count": 0,
  "apns_configured": false,
  "poll_worker": "running"
}
```

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo base URL | `https://api.open-meteo.com/v1` ✅ |
| Marine API base URL | `https://marine-api.open-meteo.com/v1` ✅ |
| Venue count | 156 (67 skiing + 89 beach) |
| Weather calls per cold load | **156** (one per venue) |
| Marine calls per cold load | **89** (beach venues only — `needsMarine` checks `category === "beach"` ✅) |
| **Total Open-Meteo calls per cold page load** | **245** |
| Open-Meteo free tier | 10,000 calls/day |
| **DAU ceiling before silent degradation** | **⚠️ 40 DAU** |
| Batch size | 50 venues, 1s delay between batches ✅ |
| Fetch timeout | 8s `AbortController` ✅ |
| 429/5xx handling | Returns null, falls back to "Checking conditions…" ✅ |
| 2hr localStorage TTL | Present — repeat visitors within 2h cost 0 calls ✅ |

**40 DAU is the hard ceiling without the proxy weather cache.** With proxy cache running (same (lat, lon) within 2hr = 1 upstream call shared across all users), that ceiling moves to thousands of DAU. The code is deployed. The service has not been restarted in 33 days.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts server token | ✅ Server-side only — not in any client file |
| Supabase anon key | Exposed in `app.jsx:26` — intentional, public-safe (RLS-gated) ✅ |
| Sentry DSN | In `index.html` + `app.jsx` — public DSN acceptable; anyone can submit fake events (low risk, Sentry filters) |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.pdf`, `*.pptx` |
| Recent commits | No secrets in last 10 commits ✅ |
| SRI on React/Babel/Supabase | ❌ Missing — Leaflet has it, the rest don't |
| CSP meta tag | ❌ Missing |
| APNS .p8 key | Not in repo (gitignored via `*.p8`) ✅ |

### P2-A — Supabase Version Mismatch — FIXED THIS RUN

`app.jsx:61` lazy-load fallback was `@2.45.4` (61 minor versions behind `index.html`'s `@2.106.2`). Under normal conditions the fallback was never hit (eager script resolves first), but CDN failure would have pinned users on ancient Supabase. **Fixed to `@2.106.2` this run.**

### P2-B — No SRI on React, ReactDOM, Babel, Supabase

Leaflet has SRI hashes. React, ReactDOM, Babel Standalone, and Supabase do not. Supply-chain attack on unpkg/jsdelivr executes silently in every user's browser.

**To compute hashes:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Add `integrity="sha384-<hash>"` to each `<script>` tag. Do NOT add CSP simultaneously — Babel requires `unsafe-eval` and those two interact. Add SRI first, test, then CSP.

---

## 5. Performance Analysis

### JS Load Sizes (Estimated)

| Asset | Raw | Gzip est. | Notes |
|-------|-----|-----------|-------|
| Babel Standalone 7.29.7 | ~8 MB | ~1.4 MB | **Architectural constraint — cannot remove without a build step** |
| ReactDOM 18.3.1 | ~500 KB | ~130 KB | UMD prod — expected |
| app.jsx | ~535 KB | ~149 KB | 9,006 lines, all logic in one file |
| Supabase JS | ~280 KB | ~80 KB | Eager-loaded unconditionally |
| React 18.3.1 | ~42 KB | ~11 KB | Fine |
| Leaflet | ~40 KB | ~40 KB | CSS + JS |
| **Total cold load** | **~9.4 MB raw** | **~1.8 MB gzip** | — |

**Biggest bottleneck: Babel Standalone (~1.4 MB gzip).** Unavoidable without a build step. On avg 4G (~20 Mbps): ~560ms for Babel alone before JSX begins transpiling. Accepted architectural trade-off.

**Second bottleneck: Supabase eager-load (~80 KB gzip)** fires unconditionally for all visitors. Graduated to `known-skipped.md` — re-flag when TTI drives measurable bounce.

### Image Loading

All 11 `<img>` tags in app.jsx use `loading="lazy"` ✅

---

## 6. Cost Estimate

| MAU | Stack | Monthly Cost | First Bottleneck |
|-----|-------|-------------|-----------------|
| <100 (current) | DO $6 + GitHub Pages free | **$6/mo** | Nothing |
| 1K | Same | **$6/mo** | Supabase free tier sufficient |
| 10K | DO $12 (2GB RAM) + Supabase Pro $25 | **~$37/mo** | In-memory alert store OOM; Supabase DB bandwidth |
| 100K | DO $48 (4GB) + Supabase Pro $25 + CDN $20 | **~$93/mo** | Open-Meteo proxy cache mandatory; alerts Supabase migration mandatory |

**Cost optimizations (no-brainers):**
1. Deploy proxy weather cache (already built, $0) — reduces Open-Meteo calls ~98%
2. Migrate alert store to Supabase (same free tier) — eliminates OOM data loss
3. At 100K MAU: Cloudflare Images (~$5/mo) proxies Unsplash to reduce Supabase egress

---

## What Breaks First at Scale

**Open-Meteo silent degradation at 40 DAU.** When the free tier (10,000 calls/day) exhausts, every venue card shows "Checking conditions…" with no error in Sentry and no visible user-facing alert. Users see a blank score app and leave. The fix has been committed for 33 days and costs one SSH session. After that, the next failure is in-memory alert OOM: at ~500 alert-registered users, the 1GB VPS OOMs, pm2 restarts, and every subscription is wiped. Fix is a Supabase write path in proxy.js (~4h). Do both before the Reddit post.

---

## Issue Register

### P0 — Critical
_None this run._

### P1 — High (fix this week)

| ID | Issue | Days Open | Action |
|----|-------|-----------|--------|
| P1-A | VPS redeploy — proxy weather cache dead, weekend pricing dead, alerts worker dead | **Day 33** | `ssh root@198.199.80.21; cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy` — 3 min |
| P1-B | Alert persistence in-memory only — OOM restart wipes all subscriptions | Day 30 | Supabase write path in proxy.js — ~4h |
| P1-C | APNS not configured — Alerts tab hidden on iOS | Day 24 | Apple Dev console + `pm2 set` × 5 per `peakly-native/PUSH_SETUP.md` |

### P2 — Medium (fix this sprint)

| ID | Issue | Status | Fix | Time |
|----|-------|--------|-----|------|
| P2-A | Supabase lazy-load fallback `2.45.4` vs eager `2.106.2` | ✅ **Fixed this run** | `app.jsx:61` updated | — |
| P2-B | No SRI on React, ReactDOM, Babel, Supabase | Open | Compute hashes + add `integrity=` attrs (see §4) | 20 min |
| P2-C | Cache buster still manually bumped — auto-push.sh missing auto-bump | Open | 6-line shell block in `scripts/auto-push.sh` (see §1) | 10 min |
| P2-D | No CSP meta tag | Open | Add after SRI stable — Babel needs `unsafe-eval` exemption | 30 min |
