# Peakly DevOps Report — 2026-05-08

**Overall Status: 🟡 YELLOW**

A P0 was found and self-resolved during this audit: 6 days of local commits (2026-05-03 through 2026-05-07) were pushed to `origin/main` partway through the session. Main is now current. The residual work is VPS redeploy — the proxy has never been updated with the new server-side code. Until that deploy runs, weather proxy caching, weekend-specific flight pricing, and APNS push alerts remain dead letters.

---

## Fixes Applied This Run

None to code — the P0 resolved via an external push during audit. See VPS redeploy checklist below.

---

## P0 (RESOLVED DURING SESSION): Repo Divergence

At audit start, `origin/main` was at `52e2236` (2026-05-02). `git fsck --lost-found` surfaced a dangling commit chain (`d19a7549` tip) containing everything CLAUDE.md listed as "Recently Fixed" since 2026-05-03. During the audit, origin/main was pushed forward to `d19a7549`, incorporating all 50+ commits. Local merge is now required to absorb the pull conflict.

**Current main now contains (confirmed in code):**
- Surf→beach pivot ✅ (only 5 surfing refs remain, all in migration code or comments)
- WHEN_OPTIONS stripped to 3 options (weekend / next 7 days / anytime) ✅
- `lateSeason: true` on 7 ski venues ✅
- `scoreWeekend` / `scoreWeekendDeal` unified ✅
- `ScoreBreakdown` "Why this score?" component ✅
- `seasonalDefaultCat()` helper ✅
- `useCloudSync` / Supabase magic-link auth ✅
- Default `maxFlightHrs: 6` ✅
- Cache bust at `peakly-20260507e` / `v=20260507e` ✅
- app.jsx: 8,465 lines / ~490 KB

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | 8,465 lines |
| CDN scripts | All HTTPS ✅ |
| Plausible analytics | Present, uncommented, `domain=j1mmychu.github.io` ✅ |
| Cache-buster (`index.html`) | `v=20260507e` ✅ |
| SW cache name | `peakly-20260507e` ✅ |
| Sentry DSN | Wired (`9416b032...`), `tracesSampleRate: 0.05` ✅ |
| WHEN_OPTIONS (honest forecast window) | 3 options — weekend / next 7 days / anytime ✅ |
| Surfing venues | Retired — 5 remaining refs are migration/comment only ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| No raw IP in client | Correct ✅ |
| Travelpayouts token in client | Not present ✅ |
| Fetch timeout | 5s AbortController ✅ |
| Retry logic | 3 attempts, 1.2s / 2.4s backoff ✅ |
| Weekend-specific `depart_date` param | **Code present, VPS not redeployed** ❌ |
| `/api/weather` + `/api/marine` proxy endpoints | **Code present in server/proxy.js, VPS not redeployed** ❌ |
| APNS push alert worker | **Code present in server/proxy.js, VPS not redeployed** ❌ |

**The committed `server/proxy.js` now has all the new endpoints. The VPS is still running the old binary. One command fixes this:**

```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"
```

**Verify after:**
```bash
curl https://peakly-api.duckdns.org/health
# Expect: {"status":"ok","alerts":0,"pollStats":{...},"apns":{...}}
```

If `/health` returns the new schema, the deploy succeeded. If it 404s, the old binary is still running.

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo client calls | Direct client→Open-Meteo. **No server-side cache yet** (awaiting VPS redeploy) ❌ |
| Client-side cache | 2hr TTL, 6hr hard evict ✅ |
| Retry on 429/5xx | 3 attempts, exponential backoff ✅ |
| Marine fetch gating | Checks `category === "beach"` correctly ✅ |
| Rate-limit exposure | 154 venues × N users simultaneous = N×154 uncached upstream calls ❌ |

Once VPS redeploy runs, `fetchWeather` / `fetchMarine` fall through to the server-side 2hr LRU cache with in-flight dedup. Until then, a spike of 500+ simultaneous users hitting cold cache will fire 77K+ Open-Meteo requests in one batch. At current scale (pre-launch) this is acceptable risk.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | Not present ✅ |
| Supabase anon key in client | **Present** — intentional, public-safe by design ⚠️ |
| Sentry DSN in client | Present — acceptable (restrict ingest origins in Sentry dashboard) ✅ |
| `.gitignore` | Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12` ✅ |
| Recent commits — no secrets | Clean ✅ |
| SRI hashes on CDN scripts | **Missing** ❌ |
| CSP meta tag | **Missing** ❌ |

**Supabase anon key (P2):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` is in app.jsx line 26. This is intentional design for Supabase — anon keys are public-facing JWTs and RLS policies are the actual gate. However, verify RLS is locked on the `user_data` and `shared_lists` tables before launch. If RLS isn't enforced, anyone with the key can read all users' synced data.

**Quick RLS verification:**
```sql
-- Run in Supabase SQL editor
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('user_data', 'shared_lists');
-- Both should show rowsecurity = true
```

**SRI gap (P2):** CDN supply-chain attack on unpkg.com → silent arbitrary JS execution. Low probability, high impact.

```bash
# Generate SRI hashes (run once, pin the results in index.html)
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" | openssl dgst -sha384 -binary | openssl base64 -A
```

Add `integrity="sha384-<HASH>"` to each `<script>` tag in index.html.

**CSP note:** Babel requires `unsafe-eval` to transpile JSX at runtime. CSP with `unsafe-eval` blocked = broken app. Minimum viable CSP:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://js.sentry-cdn.com https://plausible.io;
  connect-src 'self' https://peakly-api.duckdns.org https://wsoqcfwkvvemtlddcgfc.supabase.co https://api.open-meteo.com https://marine-api.open-meteo.com https://plausible.io https://*.sentry.io;
  img-src 'self' https://images.unsplash.com data:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
">
```

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Images `loading="lazy"` | All img render sites ✅ |
| React 18.3.1 | Latest stable 18.x ✅ (React 19 is a major version — skip) |
| Babel standalone 7.24.7 | **Outdated** — latest 7.29.4, 5 patch versions behind ❌ |
| Supabase JS 2.45.4 (new in index.html) | Latest 2.x — check for 2.49+ ⚠️ |

**Estimated JS payload on first load:**

| Asset | Raw | Gzipped (est.) |
|-------|-----|----------------|
| Babel standalone 7.24.7 | ~2.1 MB | ~600 KB |
| Supabase JS 2.45.4 | ~400 KB | ~120 KB |
| ReactDOM 18.3.1 | ~440 KB | ~130 KB |
| React 18.3.1 | ~140 KB | ~42 KB |
| app.jsx | ~490 KB | ~145 KB |
| **Total** | **~3.6 MB** | **~1.04 MB** |

Supabase JS added 120KB gzip to the payload compared to last audit. The original plan was to lazy-load it (only when signed in / magic-link callback). Check `index.html:85` — it's now a blocking `<script>` tag, not lazy-loaded. This means every anonymous user on first paint is downloading an extra 120KB.

**Babel standalone remains the #1 bottleneck** — 58% of gzip payload, synchronous parse before any React mounts. Architectural constraint. The splash screen covers the delay but median TTI on 4G mobile is ~3–5s.

**Babel upgrade (P1):**
```html
<!-- index.html line ~88 -->
<script src="https://unpkg.com/@babel/standalone@7.29.4/babel.min.js"></script>
```
Also bump `app.jsx?v=20260508a` and `CACHE_NAME = "peakly-20260508"` when applying.

---

## 6. Cost Estimate

| Tier | Infrastructure | Monthly Cost |
|------|---------------|-------------|
| Current (pre-launch) | DO 1GB + GH Pages | **$6/month** |
| 1K MAU | Same | **$6/month** |
| 10K MAU | DO 2GB upgrade | **$18/month** |
| 100K MAU | DO 4GB + Cloudflare free | **$36/month** |

GitHub Pages: free, no practical cap for a static SPA.

**What breaks first at scale:**

1. **Open-Meteo direct calls** — at 10K+ MAU with cold cache, simultaneous explore page loads can fire 1.5M+ upstream calls/day. Server-side weather cache (in proxy.js, waiting for VPS redeploy) is the fix.

2. **`_rateMap` OOM at 50K+ unique IPs** — proxy.js rate map grows unbounded. At 50K unique daily IPs the 1GB droplet OOMs. One-line fix:

```javascript
// Add inside rateLimiter(), before the normal entry.count check:
if (_rateMap.size > 50_000) _rateMap.clear(); // hard circuit breaker
```

3. **APNS in-memory alert store** — push alert registrations are in-memory only. Server restart = all alert subscriptions lost. Supabase migration for alert persistence is in the plan (v2 scope per CLAUDE.md) but will need to ship before the App Store review cycle or push alert quality will be erratic.

---

## Priority Matrix

| # | Severity | Issue | ETA |
|---|----------|-------|-----|
| 1 | **P1** | VPS not redeployed — weather cache, weekend pricing, APNS push all inactive | 5 min SSH |
| 2 | **P1** | Supabase JS loaded as blocking script — adds 120KB gzip to anonymous first paint | 15 min |
| 3 | **P1** | Babel 7.24.7 → 7.29.4 + cache bust | 5 min |
| 4 | **P2** | `_rateMap` no size cap in proxy.js — OOM risk at scale | 2 min |
| 5 | **P2** | Verify Supabase RLS is active on `user_data` + `shared_lists` | 5 min |
| 6 | **P2** | SRI hashes on CDN scripts | 20 min |
| 7 | **P2** | CSP meta tag | 10 min |
| 8 | **P3** | APNS alert persistence — in-memory store lost on restart | v2 scope |

**VPS redeploy (resolves P1 item 1):**
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"
curl https://peakly-api.duckdns.org/health
```

**Supabase lazy-load fix (P1 item 2):** Remove the `<script>` tag for Supabase from index.html. Add it dynamically in `useCloudSync` only when needed:
```javascript
// In useCloudSync, before createClient:
await new Promise((res, rej) => {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
  s.onload = res; s.onerror = rej;
  document.head.appendChild(s);
});
```

---

## Bottom Line

Main is current. VPS is not. One SSH command ships everything that's been waiting since May 4. Do that first. Then fix the Supabase blocking script — every anonymous user is paying 120KB gzip for a feature they may never use.
