# Peakly DevOps Report — 2026-06-02

**Status: 🟡 YELLOW**

No P0s. No new P2 fixes this run — CDN deps were last bumped 2026-05-28 and remain current. The two P1s are aging: VPS redeploy is now **Day 29**, APNS decision is **20 days past the 2026-05-13 self-imposed deadline**. Zero new findings. Zero new excuses. Same two commands, still not run.

---

## 1. LIVE SITE HEALTH

| Check | Value | Status |
|-------|-------|--------|
| `app.jsx` lines | 8,996 | ✅ |
| `app.jsx` bytes | 534,448 (~522 KB raw, ~127 KB gzip est.) | ✅ |
| Cache buster | `20260528a` — synced across app.jsx / sw.js / index.html | ✅ Correct — no code changes since 2026-05-28 |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` | ✅ |
| All CDN deps HTTPS | Yes | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | `https://peakly-api.duckdns.org` | ✅ |
| Sentry DSN | Configured and non-empty (`9416b032...`) | ✅ |
| CORS allowlist (proxy) | `j1mmychu.github.io`, `peakly.app`, 3 localhost — restrictive | ✅ |
| Rate limiter (proxy) | 60 req/min/IP, in-memory Map with GC | ✅ |
| Travelpayouts token | Server-side `process.env` only — never in client | ✅ |
| Image lazy loading | All `<img>` tags confirmed `loading="lazy"` | ✅ |
| PRECACHE in sw.js | `[]` — no SW regression | ✅ |
| Venue count | 157 (CLAUDE.md says ~154 — delta is 3 content adds from 2026-05-27) | ✅ |

---

## CDN VERSION AUDIT

| Package | Pinned | Notes |
|---------|--------|-------|
| React | 18.3.1 | ✅ Current LTS. React 19 UMD breakage is the documented skip reason. |
| ReactDOM | 18.3.1 | ✅ Same. |
| Supabase JS | 2.106.2 | ✅ Last bumped 2026-05-28. |
| Babel Standalone | 7.29.7 | ✅ Last bumped 2026-05-28. |
| Leaflet | 1.9.4 | ✅ Has SRI. Current. |

---

## P1 — HIGH (Jack must act — not deferrable)

---

### P1-A: VPS NEVER REDEPLOYED — Day 29 — Weather cache + weekend pricing dead

**First flagged: 2026-05-04. Every single report since. Day 25 at last report. Day 29 today.**

`proxy.js` in the repo has: shared in-memory weather cache with 2hr TTL, in-flight deduplication, and weekend-specific Fri–Mon flight pricing. The VPS at `198.199.80.21` has **never received a `git pull`**. Every user right now:

- Hits Open-Meteo **directly** — no caching, no deduplication
- Gets **month-cheapest prices** instead of weekend-specific fares
- Reddit/HN-spike protection is **not active**

**The breaking number:**
- ~157 venues × ~1.5 API calls each = ~236 upstream calls per cache-cold session
- Open-Meteo free tier: **10,000 calls/day**
- **42 cache-cold sessions** exhaust the quota → all venues score 0 → Explore grid empty
- This is not a 100K-MAU problem. It is a **42-user problem**.

**Fix — 3 minutes, copy-paste:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull origin main
pm2 restart peakly-proxy

# Confirm new binary:
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected `/health` response after deploy:
```json
{
  "status": "ok",
  "uptime": 4.1,
  "alerts": 0,
  "wx_cache_size": 0,
  "wx_inflight": 0,
  "poll": null,
  "apns": "unconfigured"
}
```

If `wx_cache_size` is absent → old binary still running. Kill it:
```bash
pm2 delete peakly-proxy
pm2 start server/proxy.js --name peakly-proxy --max-memory-restart 768M
pm2 save
```

---

### P1-B: APNS DECISION — Day 20 Past Self-Imposed Deadline

CLAUDE.md contingency was written 2026-05-13. Today is 2026-06-02. Code is complete. Runbook is at `peakly-native/PUSH_SETUP.md`. Nothing has moved.

Pick one:

**Path A — Enable APNS (~30–60 min):**
```bash
# On Apple Dev Portal: create APNs key → download AuthKey_XXXXXXXXXX.p8
scp AuthKey_XXXXXXXXXX.p8 root@198.199.80.21:/opt/peakly-proxy/

ssh root@198.199.80.21
pm2 set peakly-proxy:APNS_KEY_ID     XXXXXXXXXX
pm2 set peakly-proxy:APNS_TEAM_ID    YYYYYYYYYY
pm2 set peakly-proxy:APNS_BUNDLE_ID  com.peakly.app
pm2 set peakly-proxy:APNS_KEY_PATH   /opt/peakly-proxy/AuthKey_XXXXXXXXXX.p8
pm2 set peakly-proxy:APNS_PROD       true
pm2 restart peakly-proxy
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
# → "apns": "configured"
```

**Path B — Gate Alerts tab on iOS, ship App Store v1 today (~5 min):**

In `app.jsx`, find the tab array containing `id: "alerts"` (around line 8018) and add the native gate:

```jsx
// In the tabs array or wherever the nav tabs are filtered:
const visibleTabs = ALL_TABS.filter(t => {
  if (t.id === "alerts") {
    return !(typeof Capacitor !== "undefined" && Capacitor.isNativePlatform());
  }
  return true;
});
```

Web users keep Alerts. App Store reviewers never see it. Re-enable after APNS is live.

**The contingency plan has been sitting in CLAUDE.md for 3 weeks.**

---

## P2 — MEDIUM (fix this sprint)

Carried unchanged from known-skipped. No escalation.

### P2-A: SRI Missing on React, ReactDOM, Babel, Supabase

Leaflet has SRI. The other four don't. Babel is highest risk — it `eval()`s the entire JSX source.

Generate hashes for current pinned versions:
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

Then add `integrity="sha384-<HASH>"` to each `<script>` tag. **Test Chrome + Safari before merging — SRI failure = blank screen.**

**Est. 20 min.**

### P2-B: No Content Security Policy

No CSP on GitHub Pages, no `<meta>` CSP in `index.html`. XSS + no CSP = full localStorage exfil (Supabase auth token, wishlists, push token).

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline'
    https://unpkg.com
    https://cdn.jsdelivr.net
    https://js.sentry-cdn.com
    https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://api.open-meteo.com
    https://marine-api.open-meteo.com
    https://*.supabase.co
    https://plausible.io
    https://o4511108649058304.ingest.us.sentry.io;
  worker-src 'self';
">
```

`'unsafe-eval'` is a required cost of the no-build architecture. **Test Chrome + Safari. A CSP typo = blank screen.**

**Est. 10 min.**

### P2-C: Proxy Missing Security Response Headers

`proxy.js` sets CORS and `Retry-After` only. No `X-Content-Type-Options`, `X-Frame-Options`, or `Strict-Transport-Security`. Low risk for a pure API server behind Caddy + HTTPS, but costs 4 lines:

```js
// Add after the CORS middleware (line ~65 in proxy.js):
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  next();
});
```

Deploy with the P1-A VPS redeploy — free ride.

**Est. 5 min.**

---

## 2. SECURITY SUMMARY

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Server env only |
| Supabase anon key in client | ✅ Intentional — RLS-gated |
| Sentry DSN in client | ✅ Public-safe by design |
| `.gitignore` covers `.env`, `*.p8`, `*.pdf`, `*.key` | ✅ |
| Git history scrubbed (business plan PDF) | ✅ Done 2026-05-09 |
| SRI on CDN scripts | ⚠️ Leaflet only — React/Babel/Supabase/ReactDOM missing |
| CSP header/meta | ❌ None |
| Security headers on proxy | ❌ X-Content-Type, X-Frame, HSTS missing (P2-C) |
| CORS allowlist on proxy | ✅ Restrictive |
| Rate limiter on proxy | ✅ 60 req/min/IP |
| No hardcoded VPS IPs in client | ✅ |

---

## 3. BUNDLE SIZE (first load, no cache)

| Asset | Gzip est. | Notes |
|-------|-----------|-------|
| Babel Standalone 7.29.7 | ~374 KB | Synchronous eval before React mounts |
| ReactDOM 18.3.1 | ~130 KB | |
| Supabase JS 2.106.2 | ~80 KB | Eager-loaded; lazy-load diff in known-skipped |
| app.jsx (transpiled) | ~127 KB | Raw 522 KB → ~127 KB gzip |
| Leaflet 1.9.4 | ~40 KB | |
| Plus Jakarta Sans | ~20 KB | |
| React 18.3.1 | ~11 KB | |
| **Total first load** | **~782 KB gzip** | No-build Babel toll: accepted. |

---

## 4. COST PROJECTION

| Scale | Infra Cost/mo | Notes |
|-------|--------------|-------|
| Today (<100 MAU) | **$6** | DO 1GB + GitHub Pages free + Supabase free |
| 1K MAU | $6 | Within all free tiers |
| 10K MAU | $25–43 | DO 2GB ($18) + Supabase Pro ($25) |
| 100K MAU | $100–650 | DO 4GB+ + Supabase Pro/Team + Open-Meteo commercial |

RPM live: ~$11.98/1K MAU. Break-even at ~501 MAU vs $6/mo infra. Stack is solvent.

---

## 5. WHAT BREAKS FIRST AT SCALE

Still the same answer it has been for 29 days: **the undeployed proxy cache**.

Without the VPS redeploy, the app is running without its only scale protection. The in-repo `proxy.js` has in-flight deduplication that collapses N simultaneous users hitting the same venue coordinate into 1 upstream Open-Meteo call. Without it, 42 cache-cold sessions eat the entire free-tier quota for the day. At that point:

1. Open-Meteo returns 429s
2. All venues score 0 — no conditions data
3. Explore renders an empty grid
4. Users see a broken app and leave
5. No Sentry alert (it's upstream, not a JS error)
6. Plausible records a bounce — misread as product failure

The fix is a 3-minute SSH session that has been sitting since 2026-05-04.

---

## 6. ACTION SUMMARY

| Priority | Action | Owner | Est. Time | Days Open |
|----------|--------|-------|-----------|-----------|
| **P1-A** | SSH → `git pull && pm2 restart peakly-proxy` | Jack | 3 min | **29 days** |
| **P1-B** | Run APNS runbook OR gate Alerts behind `isNativePlatform()` | Jack | 5–60 min | **20 days past deadline** |
| P2-A | Generate + add SRI hashes for React/Babel/Supabase/ReactDOM | AI | 20 min | Carried |
| P2-B | Add starter CSP meta tag, test Chrome + Safari | AI | 10 min | Carried |
| P2-C | Add 3 security headers to proxy.js, ship with P1-A redeploy | AI | 5 min | New |
