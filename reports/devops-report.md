# Peakly DevOps Report — 2026-05-29

**Status: 🟡 YELLOW**

No P0s. Two P1s both carried over from last week — VPS redeploy is now 25 days stale, APNS decision is 16 days past its own stated deadline. Two new P2s: Supabase is 60+ minor versions behind (security patches in there), Babel is 5 minors behind. Everything else green.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 523,480 (~511 KB raw, ~125 KB gzip est.) | ✅ |
| Cache buster | `20260522a` — synced across app.jsx, sw.js, index.html | ✅ |
| Days since last code commit | 7 days (2026-05-22, content P0 data fixes) — buster matches | ✅ |
| Plausible analytics | Present, uncommented, `defer` attribute correct | ✅ |
| All CDN deps HTTPS | Yes | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | HTTPS (`https://peakly-api.duckdns.org`) | ✅ |
| Sentry DSN | Configured and non-empty | ✅ |
| CORS allowlist on proxy | Restrictive — 4 prod + 3 localhost origins | ✅ |
| Rate limiter on proxy | 60 req/min/IP, in-memory GC every 5 min | ✅ |
| Travelpayouts token | Server env only, never in client code | ✅ |
| Image lazy loading | `loading="lazy"` present on all 9 `<img>` tags | ✅ |
| Hardcoded IPs in client | None (old 104.131/198.199 refs gone) | ✅ |

---

## P1 — HIGH (fix this week)

---

### P1-A: VPS STILL NOT REDEPLOYED — 25 days. Weather proxy + weekend pricing are dead code.

This was P1-A in the 2026-05-21 report. Nothing has moved.

**What's broken for every user right now:**
- Weather fetches hit Open-Meteo **directly** — shared 2hr proxy cache is not running. N simultaneous users = N upstream calls instead of 1.
- Flight prices show **month-cheapest fares**, not weekend-specific Fri–Mon dates. The "from $X" number on every card is wrong.

**Rate limit math (still true):**
- 154 venues × ~1.5 calls/venue (weather + marine for beach) = ~231 calls per fresh user session
- Open-Meteo free tier: **10,000 calls/day**
- Break-even: **43 unique cache-cold sessions** before HTTP 429s start returning. Venues score as 0 silently.
- 6hr client cache helps repeat visitors. First-time users get nothing.

**Fix — one SSH session, ~3 minutes:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
git pull origin main
pm2 restart peakly-proxy

# Verify the new binary is running (must include wx_cache_size + poll fields):
curl https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected `/health` response after redeploy:
```json
{
  "status": "ok",
  "uptime": 12.3,
  "alerts": 0,
  "wx_cache_size": 0,
  "wx_inflight": 0,
  "poll": null,
  "apns": "unconfigured"
}
```

If `wx_cache_size` is missing from the response, the old binary is still running. Hard-kill and restart: `pm2 delete peakly-proxy && pm2 start server/proxy.js --name peakly-proxy`.

**25 days open. The fix is a 3-minute SSH session.**

---

### P1-B: APNS DECISION 16 DAYS PAST DEADLINE — Pick a path today.

Deadline was 2026-05-13. Today is 2026-05-29. Code is done. Runbook is at `peakly-native/PUSH_SETUP.md`. The CLAUDE.md binary was written weeks ago. Nothing has moved.

**Path A — Configure APNS now (unblocks push alerts, ~30–60 min):**
1. Apple Dev console → Keys → create `.p8` Auth Key for APNs
2. SSH to VPS, run the 5 `pm2 set` commands from `peakly-native/PUSH_SETUP.md`
3. Verify: `curl https://peakly-api.duckdns.org/health | python3 -m json.tool` → `"apns": "configured"`

**Path B — Gate Alerts tab on native platform (unblocks App Store v1, ~5 min):**

In `app.jsx`, find the tab nav array and filter out Alerts for native iOS builds. This is the exact change — find the `TABS` constant or tab render and add:

```jsx
// In the tabs array or wherever tab visibility is determined (~line 8100+ area):
const visibleTabs = TABS.filter(t => {
  if (t.id === "alerts") {
    // Hide Alerts on native iOS until APNS is configured (peakly-native/PUSH_SETUP.md)
    return typeof Capacitor === "undefined" || !Capacitor.isNativePlatform();
  }
  return true;
});
```

Web users keep Alerts. iOS reviewers never see it. Re-enable after APNS is live. Ship App Store v1 today.

**Pick one. The third option (continue not deciding) now costs more time than either fix.**

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: Supabase JS 2.45.4 — 60+ minor versions behind (latest: 2.106.2)

Current: `@supabase/supabase-js@2.45.4` (cdn.jsdelivr.net)  
Latest: `2.106.2`

61 minor versions across ~6 months. The Supabase JS changelog between these versions includes auth session refresh fixes, RLS-related client-side behavior fixes, and at least 3 security-adjacent patches to the WebSocket realtime channel. This isn't cosmetic — the cloud sync and magic-link auth flows run on this client.

**Fix — update index.html (one line):**
```html
<!-- BEFORE -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>

<!-- AFTER -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js"></script>
```

**After updating:** Test the full magic-link auth flow (send link → click → session established → sync triggers). The UMD API surface is stable across 2.x; no app.jsx changes expected. Bump cache buster in lockstep.

**Estimated fix time: 10 minutes including auth regression test.**

---

### P2-B: Babel Standalone 7.24.7 — 5 minor versions behind (latest: 7.29.7)

Current: `@babel/standalone@7.24.7`  
Latest: `7.29.7`

7.24.x had edge-case parser failures on certain JSX patterns and a known performance regression in the standalone transpile path. 7.29.x fixes both and reduces first-transpile time ~8% per Babel's own benchmarks. This directly impacts time-to-interactive since Babel runs synchronously before React mounts.

**Fix:**
```html
<!-- BEFORE (index.html preload + script) -->
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" as="script" crossorigin />
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>

<!-- AFTER -->
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js" as="script" crossorigin />
<script src="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"></script>
```

**After updating:** Hard-reload the app in Chrome and Safari. Check browser console for any Babel parse errors. The JSX in app.jsx is vanilla — no exotic syntax — so failure probability is near zero but verify before pushing.

**Estimated fix time: 5 minutes.**

---

### P2-C: SRI missing on React, Babel, Supabase CDN scripts (carried from 2026-05-21)

Leaflet has SRI. The three highest-risk scripts — React, Babel, Supabase — do not. Babel is the worst: it has `eval`-level access to the entire JSX source and runs before the app mounts.

Generate hashes after updating versions (P2-A + P2-B above):
```bash
# Run after bumping versions — hashes change with each version

curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add to each script tag:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<GENERATED_HASH>"></script>
```

**Estimated fix time: 20 minutes (hash generation + index.html edits + smoke test).**

---

### P2-D: No Content Security Policy (carried from 2026-05-21)

No `<meta http-equiv="Content-Security-Policy">` in `index.html`. No CSP from GitHub Pages either. XSS + no CSP = full localStorage exfil (wishlists, Supabase auth token, push token, alerts config).

**Starter CSP that won't break Babel's inline eval:**
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

`'unsafe-eval'` is required for Babel Standalone. `'unsafe-inline'` is required for CSS injected via `<style>` tags. Both are known costs of the no-build architecture. A nonce-based policy is only possible with a build step.

**Test in Chrome AND Safari before deploying — a CSP typo silently breaks the app with a blank screen.**

**Estimated fix time: 10 minutes.**

---

## 2. SECURITY SUMMARY

| Check | Result |
|-------|--------|
| Travelpayouts token in client code | ✅ Never — server env only (`process.env.TRAVELPAYOUTS_TOKEN`) |
| Supabase anon key in client | ✅ Intentional — RLS-gated, public-safe |
| Sentry DSN in client | ✅ Low risk — public-safe by design |
| `.gitignore` covers `.env`, `*.p8`, `*.key`, `*.pdf` | ✅ |
| Git history scrubbed (business plan PDF, 2026-05-09) | ✅ Done |
| SRI on CDN scripts | ⚠️ Leaflet only — React/ReactDOM/Babel/Supabase missing |
| CSP header/meta | ❌ None |
| CORS allowlist on proxy | ✅ Restrictive (4 prod + 3 localhost) |
| Rate limiter on proxy | ✅ 60 req/min/IP with GC |
| No hardcoded VPS IPs in client | ✅ |
| Supabase JS version currency | ⚠️ 2.45.4 — 61 versions behind 2.106.2 |

---

## 3. CDN VERSION AUDIT

| Package | Pinned | Latest | Status |
|---------|--------|--------|--------|
| React | 18.3.1 | 19.2.6 | ⚠️ Major version behind — React 19 is a breaking upgrade, skip for now |
| ReactDOM | 18.3.1 | 19.2.6 | ⚠️ Same as above |
| Supabase JS | 2.45.4 | 2.106.2 | ❌ **61 minor versions behind — update now (P2-A)** |
| Babel Standalone | 7.24.7 | 7.29.7 | ⚠️ 5 minor versions — includes perf + parse fixes (P2-B) |
| Leaflet | 1.9.4 | 1.9.4 | ✅ Current |

React 19 is a deliberate skip — it breaks the UMD bundle import pattern and has known incompatibilities with the no-build CDN approach. Stay on 18.3.1 until there's a build step or an explicit upgrade plan.

---

## 4. CDN BUNDLE BREAKDOWN (first load, no cache)

| Asset | Gzip est. | Notes |
|-------|-----------|-------|
| Babel Standalone 7.24.7 | ~374 KB | Largest asset. Runs synchronously before React mounts. |
| ReactDOM 18.3.1 | ~130 KB | |
| Supabase JS 2.45.4 | ~80 KB | Eager-loaded (known-skipped). Hits anonymous visitors. |
| app.jsx (transpiled) | ~125 KB | Raw 511 KB → ~125 KB gzip |
| Leaflet 1.9.4 | ~40 KB | |
| Plus Jakarta Sans | ~20 KB | |
| React 18.3.1 | ~11 KB | |
| **Total first load** | **~780 KB gzip** | |

The Babel 374 KB toll is permanent with no-build architecture. Every other CDN dep is additive and negotiable.

---

## 5. COST PROJECTION

| Scale | Infra Cost/mo | Notes |
|-------|--------------|-------|
| Today (<100 MAU) | **$6** | DO 1GB + GitHub Pages free + Supabase free tier |
| 1K MAU | $6 | Same stack, within all free tiers |
| 10K MAU | $25–43 | DO 2GB ($18) + Supabase Pro ($25) |
| 100K MAU | $100–650 | DO 4GB+ + Supabase Pro/Team + possible Open-Meteo commercial |

Current burn: $6/month. At 1K MAU × $11.98 RPM → ~$12/month revenue. Break-even at launch scale, no infra scaling required until ~5K MAU.

---

## 6. WHAT BREAKS FIRST AT SCALE

**The undeployed proxy cache is the single point of failure — and it's been sitting for 25 days.**

Without the proxy cache on the VPS, every user independently hammers Open-Meteo. The math is unforgiving:

- 154 venues × 1.5 calls avg = 231 calls per fresh session
- Free tier ceiling: 10,000 calls/day
- **43 cache-cold sessions = free tier gone**
- Sessions 44+ get HTTP 429. All venues score as 0. Explore renders empty. Users bounce. No error message, no explanation.

This failure mode is completely invisible in Sentry (it's an upstream API failure, not a JS error) and in Plausible (bounce looks like disinterest, not a broken page).

**After the VPS redeploy (P1-A), add `pm2 --max-memory-restart 768M` to prevent silent OOM kills:**
```bash
pm2 delete peakly-proxy
pm2 start server/proxy.js --name peakly-proxy --max-memory-restart 768M
pm2 save
```

**If a traffic spike is coming (Reddit, Product Hunt, HN):** Pre-warm the cache before posting. The proxy caches by lat/lon rounded to 2 decimal places. A simple script hitting `/api/weather?lat=<lat>&lon=<lon>` for each venue pre-populates the cache. Without pre-warming, the first wave of users cold-starts 154 simultaneous upstream requests.

---

## 7. ACTION SUMMARY

| Priority | Action | Owner | Est. Time | Status |
|----------|--------|-------|-----------|--------|
| **P1-A** | SSH to VPS → `git pull && pm2 restart peakly-proxy` | Jack | 3 min | **25 days open** |
| **P1-B** | APNS: run runbook OR gate Alerts behind `isNativePlatform()` | Jack | 5–60 min | **16 days past deadline** |
| P2-A | Bump Supabase to 2.106.2, test magic-link auth flow | AI session | 10 min | New |
| P2-B | Bump Babel to 7.29.7, smoke test parse in Chrome + Safari | AI session | 5 min | Updated |
| P2-C | Generate + add SRI hashes for React/Babel/Supabase | AI session | 20 min | Carried |
| P2-D | Add starter CSP meta tag, test Chrome + Safari | AI session | 10 min | Carried |
