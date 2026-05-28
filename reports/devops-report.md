# Peakly DevOps Report — 2026-05-28

**Status: 🟡 YELLOW**

No P0s this run. Three P2 fixes applied in this session (Supabase 2.106.0→2.106.2, Babel 7.29.4→7.29.7, cache buster 20260527a→20260528a). The two P1s from every prior report remain unchanged: VPS never redeployed (day 24) and APNS decision still unmade (15 days past self-imposed deadline). GEAR_ITEMS confirmed live from yesterday's content commit.

---

## Fixes Applied This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache buster `20260527a` → `20260528a` | app.jsx:17, sw.js:2, index.html | New day = new buster. Carrying yesterday's stamp into 05-28 means stale SW cache on first visit. |
| Supabase `2.106.0` → `2.106.2` | index.html:85 | Latest stable — 2-patch bump over what yesterday's run shipped. |
| Babel `7.29.4` → `7.29.7` | index.html:92–93 | Latest stable — 3-patch bump with JSX parse correctness fixes. |

---

## 1. LIVE SITE HEALTH

| Check | Value | Status |
|-------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 523,480 (~511 KB raw, ~125 KB gzip est.) | ✅ |
| Cache buster | `20260528a` — synced across app.jsx / sw.js / index.html | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` | ✅ |
| All CDN deps HTTPS | Yes | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | `https://peakly-api.duckdns.org` | ✅ |
| Sentry DSN | Configured, `tracesSampleRate: 0.05` | ✅ |
| CORS allowlist (proxy) | `j1mmychu.github.io`, `peakly.app`, 3 localhost — restrictive | ✅ |
| Rate limiter (proxy) | 60 req/min/IP, in-memory Map with GC | ✅ |
| Travelpayouts token | Server-side `process.env` only | ✅ |
| Image lazy loading | All 9 `<img>` tags use `loading="lazy"` | ✅ |
| PRECACHE | `[]` — no regression | ✅ |
| GEAR_ITEMS | Live — 8 items across skiing + beach, `tag=peakly-20` | ✅ |

---

## P1 — HIGH (Jack must act — not deferrable)

---

### P1-A: VPS NEVER REDEPLOYED — Day 24 — Weather cache + weekend pricing dead

**First flagged: 2026-05-04. In every report since. 3-minute fix. 0 movement.**

`proxy.js` was updated 2026-05-04 to add:
- `/api/weather` + `/api/marine` — shared 2hr in-memory cache, in-flight dedupe
- Weekend-specific Travelpayouts pricing via `depart_date`/`return_date`

The VPS at `198.199.80.21` has never received a `git pull`. Right now:
- Every user's browser hits **Open-Meteo directly** — no caching, no deduplication
- All "from $X" prices are **month-cheapest**, not Fri–Mon weekend-specific
- Reddit-spike protection is **not running**

**Break-even without the proxy cache:**
- ~154 venues, ~1.5 API calls each = ~231 calls per full user load
- Open-Meteo free tier: 10,000 calls/day
- At **44 DAU**, the daily quota is exhausted. Venue scores return 0. Explore is an empty grid.
- 44 users. Not 44,000. **44.**

**The fix (copy-paste):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy && git pull origin main
pm2 restart peakly-proxy
curl https://peakly-api.duckdns.org/health | jq .
```

After restart, `/health` must include `weather_cache`, `poll_stats`, and `apns_configured` keys. If those are missing, the old binary is still active — check with `pm2 list`.

**Estimated time: 3 minutes. This is day 24.**

---

### P1-B: APNS Decision — 15 Days Past Deadline — Binary choice, no more deferral

Per CLAUDE.md own contingency (written 2026-05-09): *"by end-of-day Wednesday 2026-05-13, either APNS is live OR add `Capacitor.isNativePlatform()` gate."* That was 15 days ago.

**Path A — Configure APNS (30–60 min total):**
1. Apple Dev Portal → Keys → + → Apple Push Notifications service (APNs) → generate `.p8`
2. Upload `.p8` to VPS:
   ```bash
   scp AuthKey_XXXXXXXXXX.p8 root@198.199.80.21:/opt/peakly-proxy/
   ```
3. Set env vars:
   ```bash
   ssh root@198.199.80.21
   pm2 set peakly-proxy:APNS_KEY_ID     XXXXXXXXXX
   pm2 set peakly-proxy:APNS_TEAM_ID    YYYYYYYYYY
   pm2 set peakly-proxy:APNS_BUNDLE_ID  com.peakly.app
   pm2 set peakly-proxy:APNS_KEY_PATH   /opt/peakly-proxy/AuthKey_XXXXXXXXXX.p8
   pm2 set peakly-proxy:APNS_PROD       true
   pm2 restart peakly-proxy
   curl https://peakly-api.duckdns.org/health | jq .apns_configured
   ```
4. Should return `true`. Test with `POST /api/alerts/:id/test` (needs `ALERTS_TEST_ENABLED=true`).

**Path B — Gate Alerts behind `isNativePlatform()` (5 min — unblocks App Store v1 today):**

Find the bottom nav tab list in `app.jsx` and filter out Alerts on iOS native:

```jsx
const visibleTabs = tabs.filter(t => {
  if (t.id === "alerts") {
    return typeof Capacitor === "undefined" || !Capacitor.isNativePlatform();
  }
  return true;
});
```

Web users keep Alerts. iOS reviewers never see it. App Store v1 submits today. Remove the filter after APNS is live.

**Pick one. Not picking is Path C — ship nothing.**

---

## P2 — MEDIUM (can be done in an AI session)

---

### P2-A: Missing SRI on React, ReactDOM, Babel, Supabase

Leaflet has SRI. The four largest scripts do not.

```
unpkg.com/react@18.3.1              — no integrity=""
unpkg.com/react-dom@18.3.1          — no integrity=""
unpkg.com/@babel/standalone@7.29.7  — no integrity=""
cdn.jsdelivr.net/@supabase/supabase-js@2.106.2 — no integrity=""
```

Babel is the highest-risk: it has `eval()`-equivalent access to the entire JSX source. A compromised CDN edge = full app takeover.

**Generate hashes (run once per version):**
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

Then add `integrity="sha384-<HASH>" crossorigin` to each `<script>` tag in `index.html`. **Do not combine with CSP in the same deploy — test SRI alone first.**

**Estimated fix time: 15 minutes.**

---

### P2-B: No Content Security Policy

No `<meta http-equiv="Content-Security-Policy">` in `index.html`. XSS + no CSP = full localStorage exfil: wishlists, alerts, profile, Supabase session token.

**Starter CSP compatible with Babel's `eval()`:**
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

`'unsafe-eval'` and `'unsafe-inline'` are required costs of the no-build architecture. A typo in `connect-src` silently breaks weather or flight pricing. Test in Chrome DevTools → Security tab before deploying.

**Estimated fix time: 10 minutes.**

---

### P2-C: Recurring cache buster drift — 3rd consecutive report

Pattern: DevOps or Content agent bumps buster → a later agent edits `app.jsx` without bumping → next devops run detects drift. Happened 05-13, 05-22, 05-27.

**Permanent fix — add to `scripts/auto-push.sh`** after the `git diff --cached` check, before the commit:

```bash
# Auto-bump buster when app.jsx is staged
if git diff --cached --name-only | grep -q "app.jsx"; then
  OLD=$(grep -oP '(?<=PEAKLY_BUILD = ")[^"]+' app.jsx)
  TODAY=$(date +%Y%m%d)
  if [[ "$OLD" == "${TODAY}"* ]]; then
    SUFFIX=${OLD#$TODAY}
    NEXT=$(echo "$SUFFIX" | tr 'a-y' 'b-z')
    NEW="${TODAY}${NEXT}"
  else
    NEW="${TODAY}a"
  fi
  sed -i "s/PEAKLY_BUILD = \"${OLD}\"/PEAKLY_BUILD = \"${NEW}\"/" app.jsx
  sed -i "s/CACHE_NAME = \"peakly-${OLD}\"/CACHE_NAME = \"peakly-${NEW}\"/" sw.js
  sed -i "s/app\.jsx?v=${OLD}/app.jsx?v=${NEW}/" index.html
  git add app.jsx sw.js index.html
fi
```

Eliminates this finding permanently. **Estimated time: 10 minutes to wire and test.**

---

## 2. SECURITY SUMMARY

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Never — server env only |
| Supabase anon key in client | ✅ Intentional — RLS-gated, documented |
| Sentry DSN in client | ✅ Low risk — public-safe by design |
| `.gitignore` covers `.env`, `*.p8`, `*.key`, `*.pdf` | ✅ |
| Git history scrubbed (business plan PDF, 2026-05-09) | ✅ Done |
| No hardcoded IP addresses in client code | ✅ |
| SRI on CDN scripts | ⚠️ Leaflet only — React/Babel/Supabase/ReactDOM missing (P2-A) |
| Content Security Policy | ❌ None (P2-B) |
| CORS allowlist on proxy | ✅ Restrictive — 4 prod + 3 localhost origins |
| Rate limiter on proxy | ✅ 60 req/min/IP with GC |

---

## 3. CDN BUNDLE BREAKDOWN

| Asset | Gzip est. | Version | Status |
|-------|-----------|---------|--------|
| Babel Standalone | ~374 KB | 7.29.7 | ✅ Current |
| ReactDOM | ~130 KB | 18.3.1 | ✅ Current |
| Supabase JS | ~82 KB | 2.106.2 | ✅ Current |
| app.jsx (transpiled) | ~125 KB | 20260528a | Raw 511 KB → ~125 KB gzip |
| Leaflet | ~40 KB | 1.9.4 | ✅ Current |
| Plus Jakarta Sans | ~20 KB | — | |
| React | ~11 KB | 18.3.1 | ✅ Current |
| **Total cold load** | **~782 KB gzip** | | Babel 374 KB is the no-build tax |

---

## 4. COST PROJECTION

| Scale | Infra Cost/mo | Notes |
|-------|--------------|-------|
| Today (< 100 MAU) | $6 | DO 1GB + GitHub Pages free + Supabase free tier |
| 1K MAU | $6 | Same stack — within all free tiers |
| 10K MAU | $25–43 | DO 2GB ($18) + Supabase Pro ($25) |
| 100K MAU | $100–650 | DO 4GB+ + Supabase Pro/Team + likely Open-Meteo commercial |

**Current burn: $6/month.** Infra is fully covered at 1K MAU with projected $11.98 RPM.

---

## 5. WHAT BREAKS FIRST AT SCALE

The proxy not being deployed means the app is **already broken at 44 DAU**. That's not a scale problem.

After the proxy is deployed, the cold-start failure mode is the next concern:

**50 concurrent users hitting a just-restarted proxy:**
- 50 × 231 Open-Meteo calls = 11,550 requests in < 60 seconds
- Free tier exhausted in one burst — venues score 0 until cache warms
- No error message shown, just an empty Explore grid

**Hardening (do after P1-A is resolved):**
```bash
ssh root@198.199.80.21
pm2 start ecosystem.config.js --max-memory-restart 768M

# Pre-warm top venue clusters after any restart:
curl -s "https://peakly-api.duckdns.org/api/weather?lat=46.82&lon=6.87" &   # Alps
curl -s "https://peakly-api.duckdns.org/api/weather?lat=21.28&lon=-157.84" & # Hawaii
curl -s "https://peakly-api.duckdns.org/api/weather?lat=36.47&lon=138.47" &  # Japan
wait && echo "cache pre-warmed"
```

---

## 6. ACTION SUMMARY

| Priority | Action | Owner | Est. Time | Age |
|----------|--------|-------|-----------|-----|
| **P1-A** | `ssh root@198.199.80.21` → `git pull && pm2 restart peakly-proxy` | Jack | 3 min | **24 days** |
| **P1-B** | Configure APNS (Path A) OR gate Alerts behind `isNativePlatform()` (Path B) | Jack | 5–60 min | **15 days past deadline** |
| P2-A | Generate SRI hashes, add `integrity=` to React/Babel/Supabase/ReactDOM | AI session | 15 min | Ongoing |
| P2-B | Add starter CSP meta tag to index.html | AI session | 10 min | Ongoing |
| P2-C | Wire buster auto-bump into `scripts/auto-push.sh` | AI session | 10 min | 3rd report |
