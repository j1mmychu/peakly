# Peakly DevOps Report — 2026-05-29

**Status: 🟡 YELLOW**

No P0s. No P2 fixes needed today — Supabase (2.106.2) and Babel (7.29.7) are current as of yesterday's run. The two P1s have not moved: VPS redeploy is now **day 25**, APNS decision is **16 days past the self-imposed 2026-05-13 deadline**. Everything else is green. The app will silently break at 44 DAU without the proxy cache. That number has not changed since the last 10 reports.

---

## 1. LIVE SITE HEALTH

| Check | Value | Status |
|-------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 523,480 (~511 KB raw, ~125 KB gzip est.) | ✅ |
| Cache buster | `20260528a` — synced across app.jsx / sw.js / index.html | ✅ |
| No code changes today | Last code commit 2026-05-28 — buster is correct | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` | ✅ |
| All CDN deps HTTPS | Yes | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | `https://peakly-api.duckdns.org` | ✅ |
| Sentry DSN | Configured, non-empty | ✅ |
| CORS allowlist (proxy) | `j1mmychu.github.io`, `peakly.app`, 3 localhost — restrictive | ✅ |
| Rate limiter (proxy) | 60 req/min/IP, in-memory Map with GC | ✅ |
| Travelpayouts token | Server-side `process.env` only — never in client | ✅ |
| Image lazy loading | All 9 `<img>` tags use `loading="lazy"` | ✅ |
| PRECACHE | `[]` — no SW regression | ✅ |

---

## CDN VERSION AUDIT

| Package | Pinned | Latest | Status |
|---------|--------|--------|--------|
| React | 18.3.1 | 19.2.6 | ⚠️ Major version skip — intentional. React 19 breaks UMD import pattern. |
| ReactDOM | 18.3.1 | 19.2.6 | ⚠️ Same as above — intentional skip. |
| Supabase JS | 2.106.2 | 2.106.2 | ✅ Current (bumped 2026-05-28) |
| Babel Standalone | 7.29.7 | 7.29.7 | ✅ Current (bumped 2026-05-28) |
| Leaflet | 1.9.4 | 1.9.4 | ✅ Current |

---

## P1 — HIGH (Jack must act — not deferrable)

---

### P1-A: VPS NEVER REDEPLOYED — Day 25 — Weather cache + weekend pricing dead

**First flagged: 2026-05-04. Every single report since. 3-minute fix. 0 movement.**

`proxy.js` was updated 2026-05-04 to add shared weather cache, in-flight deduplication, and weekend-specific flight pricing. The VPS at `198.199.80.21` has **never received a `git pull`**. Every user right now:

- Hits Open-Meteo **directly** — no caching, no in-flight deduplication
- Gets **month-cheapest prices** instead of weekend-specific Fri–Mon fares
- Reddit-spike protection is **not running**

**The number that matters:**
- ~154 venues × ~1.5 API calls each = ~231 calls per fresh session
- Open-Meteo free tier: **10,000 calls/day**
- Break-even: **44 cache-cold sessions** → free tier exhausted → venue scores return 0 → Explore grid empty
- **44 users, not 44,000.**

**Fix (copy-paste, ~3 minutes):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull origin main
pm2 restart peakly-proxy

# Verify new binary is running — must include wx_cache_size and poll fields:
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected `/health` after redeploy:
```json
{
  "status": "ok",
  "uptime": 5.2,
  "alerts": 0,
  "wx_cache_size": 0,
  "wx_inflight": 0,
  "poll": null,
  "apns": "unconfigured"
}
```

If `wx_cache_size` is absent, the old binary is still active. Kill it: `pm2 delete peakly-proxy && pm2 start server/proxy.js --name peakly-proxy`.

**Also add memory restart guard while you're in there:**
```bash
pm2 delete peakly-proxy
pm2 start server/proxy.js --name peakly-proxy --max-memory-restart 768M
pm2 save
```

**This is day 25. The command is 4 lines. It takes 3 minutes.**

---

### P1-B: APNS DECISION — 16 Days Past Self-Imposed Deadline

Deadline was 2026-05-13 (written in CLAUDE.md). Today is 2026-05-29. Code is complete. Runbook is at `peakly-native/PUSH_SETUP.md`. Nothing has moved.

**Path A — Configure APNS (~30–60 min, enables push alerts):**
1. Apple Dev Portal → Certificates, Identifiers & Profiles → Keys → + → APNs → download `.p8`
2. SCP to VPS: `scp AuthKey_XXXXXXXXXX.p8 root@198.199.80.21:/opt/peakly-proxy/`
3. Set env vars on VPS:
```bash
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

**Path B — Gate Alerts tab behind `isNativePlatform()` (~5 min, unblocks App Store v1 immediately):**

Find the bottom-nav tab array in `app.jsx` (search for `id: "alerts"`) and filter it for native builds:

```jsx
const visibleTabs = tabs.filter(t => {
  if (t.id === "alerts") {
    return typeof Capacitor === "undefined" || !Capacitor.isNativePlatform();
  }
  return true;
});
```

Web users keep Alerts. App Store reviewers never see it. Re-enable after APNS is live. App Store v1 ships today.

**Pick one path. The CLAUDE.md contingency was written 3 weeks ago. Deferring again costs another week.**

---

## P2 — MEDIUM (fix this sprint)

*No new P2s this run. Supabase and Babel were updated yesterday.*

*Carried items from known-skipped that have not escalated:*

---

### P2-A: SRI Missing on React, ReactDOM, Babel, Supabase (in known-skipped)

No `integrity=` attribute on any of the four highest-risk CDN scripts. Leaflet has SRI. Babel is the most dangerous — it runs `eval()` on the entire JSX source before React mounts.

Re-flagging because CDN versions were bumped yesterday — any previously documented hashes are stale. Generate fresh hashes for the current pinned versions:

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

Then add `integrity="sha384-<HASH>"` to each script tag. **Test in both Chrome and Safari before merging — an SRI failure renders a blank app with no fallback.**

**Estimated fix time: 20 minutes.**

---

### P2-B: No Content Security Policy (in known-skipped)

No CSP header from GitHub Pages, no `<meta http-equiv="Content-Security-Policy">` in `index.html`. XSS + no CSP = full localStorage exfil: wishlists, Supabase auth token, push token, alert config.

**Starter CSP that won't break Babel's `eval()`:**
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

`'unsafe-eval'` and `'unsafe-inline'` are required costs of the no-build architecture. **Test Chrome + Safari. A CSP typo = blank screen with no error message.**

**Estimated fix time: 10 minutes.**

---

## 2. SECURITY SUMMARY

| Check | Result |
|-------|--------|
| Travelpayouts token in client code | ✅ Never — server env only |
| Supabase anon key in client | ✅ Intentional — RLS-gated, public-safe |
| Sentry DSN in client | ✅ Low risk — public-safe by design |
| `.gitignore` covers `.env`, `*.p8`, `*.key`, `*.pdf` | ✅ |
| Git history scrubbed (business plan PDF, 2026-05-09) | ✅ Done |
| SRI on CDN scripts | ⚠️ Leaflet only — React/Babel/Supabase/ReactDOM missing |
| CSP header/meta | ❌ None |
| CORS allowlist on proxy | ✅ Restrictive (4 prod + 3 localhost) |
| Rate limiter on proxy | ✅ 60 req/min/IP with in-memory GC |
| No hardcoded VPS IPs in client | ✅ |

---

## 3. BUNDLE SIZE (first load, no cache)

| Asset | Gzip est. | Notes |
|-------|-----------|-------|
| Babel Standalone 7.29.7 | ~374 KB | Required for no-build JSX. Runs synchronously before React mounts. |
| ReactDOM 18.3.1 | ~130 KB | |
| Supabase JS 2.106.2 | ~80 KB | Eager-loaded. Hits every anon visitor. Diff to lazy-load in known-skipped. |
| app.jsx (transpiled) | ~125 KB | Raw 511 KB → ~125 KB gzip |
| Leaflet 1.9.4 | ~40 KB | |
| Plus Jakarta Sans | ~20 KB | |
| React 18.3.1 | ~11 KB | |
| **Total first load** | **~780 KB gzip** | No-build Babel toll: known and accepted. |

---

## 4. COST PROJECTION

| Scale | Infra Cost/mo | Notes |
|-------|--------------|-------|
| Today (<100 MAU) | **$6** | DO 1GB + GitHub Pages free + Supabase free |
| 1K MAU | $6 | Same stack, within all free tiers |
| 10K MAU | $25–43 | DO 2GB ($18) + Supabase Pro ($25) |
| 100K MAU | $100–650 | DO 4GB+ + Supabase Pro/Team + Open-Meteo commercial possible |

Current burn: $6/month. At 1K MAU × $11.98 RPM → ~$12/month revenue. Stack is solvent at launch scale.

---

## 5. WHAT BREAKS FIRST AT SCALE

**The same thing that's already breaking: the undeployed proxy cache.**

Without the VPS redeploy, the app is running without its only scale protection. The proxy cache collapses N simultaneous users hitting the same venue coordinates into a single upstream Open-Meteo call. Without it, 44 cache-cold sessions eat the entire free-tier quota for the day.

If a traffic event happens before the proxy is deployed:
1. Open-Meteo starts returning 429s (the 45th session triggers it)
2. All venues score as 0 — no conditions data
3. Explore renders an empty grid
4. Users see a broken product and leave
5. No error in Sentry (it's an upstream failure, not a JS exception)
6. Plausible shows high bounce rate — reads as "users don't like the product"

**The fix is a 3-minute SSH session that has been sitting for 25 days.**

---

## 6. ACTION SUMMARY

| Priority | Action | Owner | Est. Time | Status |
|----------|--------|-------|-----------|--------|
| **P1-A** | SSH to VPS → `git pull && pm2 restart peakly-proxy` | Jack | 3 min | **25 days open — TODAY** |
| **P1-B** | APNS: run runbook OR gate Alerts behind `isNativePlatform()` | Jack | 5–60 min | **16 days past deadline — TODAY** |
| P2-A | Generate + add SRI hashes for React/Babel/Supabase/ReactDOM | AI session | 20 min | Carried |
| P2-B | Add starter CSP meta tag, test Chrome + Safari | AI session | 10 min | Carried |
