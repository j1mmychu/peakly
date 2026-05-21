# Peakly DevOps Report — 2026-05-21

**Status: 🟡 YELLOW**
No P0s. Two P1s — one is a 90-second SSH command that has been pending 17 days, the other is an 8-day-overdue APNS decision that has a clear binary path. Four P2s (SRI, CSP, rate limit math, Babel version). Everything else is green.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 524,394 (~512 KB raw, ~125 KB gzip est.) | ✅ |
| Cache buster | `20260513j` — synced across app.jsx, sw.js, index.html | ✅ |
| Days since last code commit | 8 days (2026-05-13) — buster is correct | ✅ |
| Plausible analytics | Present, uncommented | ✅ |
| All CDN deps HTTPS | Yes | ✅ |
| Proxy URL (`FLIGHT_PROXY`) | HTTPS (`https://peakly-api.duckdns.org`) | ✅ |
| Sentry DSN | Configured and non-empty | ✅ |
| CORS allowlist | Restrictive (4 production + 3 localhost origins) | ✅ |
| Rate limiter | In-memory, 60 req/min/IP with GC interval | ✅ |
| Travelpayouts token | Server-side env only, never in client | ✅ |
| Image lazy loading | `loading="lazy"` on all img tags | ✅ |

---

## P1 — HIGH (fix this week)

---

### P1-A: VPS NOT REDEPLOYED — Weather proxy + weekend pricing are dead code

**This is the most expensive open item on the board. It has been sitting for 17 days.**

Per CLAUDE.md, `proxy.js` was updated 2026-05-04 to add:
1. `/api/weather` and `/api/marine` endpoints with shared in-memory 2hr cache + in-flight dedupe
2. Weekend-specific flight pricing (`depart_date`/`return_date` params)

The VPS (`198.199.80.21`) has never been redeployed. Every user right now is:
- Hitting Open-Meteo **directly** instead of through the proxy cache (Reddit-spike protection = not active)
- Getting **month-cheapest prices** instead of weekend-specific prices (the "from $X" numbers are wrong)

**Rate limit math without the proxy cache:**
- Venue count: ~154 (81 skiing + ~73 beach)
- Per user full load: ~154 weather calls + ~77 marine calls (beach only) = ~231 calls
- Open-Meteo free tier: **10,000 calls/day**
- Break-even: **43 unique daily active users** exceed the free-tier ceiling
- Every call beyond 10K/day returns HTTP 429 and venues score as 0.

**Fix — one SSH session:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
git pull origin main
pm2 restart peakly-proxy
# Verify:
curl https://peakly-api.duckdns.org/health | jq .
```

Expected `/health` response after redeploy includes `weather_cache`, `poll_stats`, and `apns_configured` fields. If any of those are missing, the old binary is still running.

**Estimated fix time: 3 minutes.** This has been open 17 days.

---

### P1-B: APNS 8 days past deadline — make the call today

Deadline was 2026-05-13. Today is 2026-05-21. The code is done. The runbook is at `peakly-native/PUSH_SETUP.md`. Nothing has moved.

Per CLAUDE.md's own contingency: **ship App Store v1 without push by gating the Alerts tab behind `Capacitor.isNativePlatform()`.**

There are two valid paths. Pick one today:

**Path A — Ship APNS (30–60 min, blocks App Store v1 until done):**
Complete the runbook in `peakly-native/PUSH_SETUP.md`:
1. Apple Dev console → Certificates → create `.p8` key
2. SSH to VPS, run 5 `pm2 set` commands
3. `curl https://peakly-api.duckdns.org/health` → confirm `apns_configured: true`

**Path B — Gate Alerts on native platform (5 min, unblocks App Store v1 now):**

In the bottom nav tab array in `app.jsx`, add a platform check to hide the Alerts tab on iOS:

```jsx
// Wrap the tabs array or the tab render — hide Alerts on native iOS until APNS is live
tabs.filter(t => {
  if (t.id === "alerts") {
    return typeof Capacitor === "undefined" || !Capacitor.isNativePlatform();
  }
  return true;
})
```

Web users keep Alerts. iOS App Store reviewers never see it. Unblocks submission today. Re-enable after APNS is live.

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: Missing SRI on React, Babel, Supabase CDN scripts

Leaflet has SRI hashes. The three highest-risk scripts do not.

```
unpkg.com/react@18.3.1               — NO integrity=""
unpkg.com/react-dom@18.3.1           — NO integrity=""
unpkg.com/@babel/standalone@7.24.7   — NO integrity=""
cdn.jsdelivr.net/@supabase/supabase-js@2.45.4 — NO integrity=""
```

If unpkg or jsdelivr serve a poisoned script (or a CDN edge node is compromised), users get arbitrary JS with full access to localStorage, Supabase sessions, and push tokens. Babel is the most dangerous: it has eval-level access to the entire JSX source.

**Generate hashes and add them. Run once per library version:**

```bash
# React
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A

# ReactDOM
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A

# Babel
curl -s https://unpkg.com/@babel/standalone@7.24.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A

# Supabase
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then update `index.html` for each script:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH>"></script>
```

**Caveat:** Babel Standalone uses `eval()` to transpile JSX. Some browsers block `eval()` under a strict CSP. Adding SRI alone (no CSP yet) is safe. Test before combining SRI + CSP in the same deploy.

**Estimated fix time: 15 minutes.**

---

### P2-B: No Content Security Policy

No `<meta http-equiv="Content-Security-Policy">` exists in `index.html`. GitHub Pages injects nothing.

XSS + no CSP = full session takeover. Any injected script can read localStorage (wishlists, alerts, profile, Supabase auth token), call the proxy, and silently exfil.

**Cautious starter CSP that won't break Babel's inline eval:**

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

`'unsafe-eval'` is required for Babel Standalone. `'unsafe-inline'` is required for the injected `<style>` tags. Both are known costs of the no-build architecture. Tighten to a nonce-based policy if you ever add a build step.

**Estimated fix time: 10 minutes. Test in Chrome + Safari before deploying — a CSP typo breaks the app silently.**

---

### P2-C: Babel Standalone 7.24.7 is ~6 months stale

Current in `index.html`: `@babel/standalone@7.24.7`

Babel 7.24.x had known parsing edge cases. The 7.26.x line includes performance fixes to the standalone transpile path, which directly affects time-to-interactive on first load.

**Fix:**
```bash
# Get latest version
curl -s https://registry.npmjs.org/@babel/standalone/latest | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])"
```

Update `index.html`, regenerate SRI hash (P2-A), test that app.jsx still parses correctly in both Chrome and Safari.

**Estimated fix time: 5 minutes + SRI regen.**

---

### P2-D: Supabase JS loaded eagerly — 80 KB gzip blocking React mount

`index.html` loads `@supabase/supabase-js@2.45.4` unconditionally on every page view. This is documented in `known-skipped.md` (two-strikes rule) but the real cost is now quantifiable: it sits between Sentry and Babel in the blocking script chain, adding ~80KB gzip to cold-load for the ~80% of sessions that never sign in.

**Fix:** Delete the `<script>` tag from `index.html`. The `_getSupabase()` lazy loader already exists in `app.jsx` and dynamically injects the script tag on first use. The ready-to-apply diff is at `reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`.

```bash
cd /home/user/peakly
git apply reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff
# Test: sign-in flow, magic-link callback, and anon visitor load
```

After applying: verify `_getSupabase()` correctly awaits the dynamic script load before calling `supabase.createClient()`. The `supabase` global won't exist at parse time anymore.

**Estimated fix time: 20 minutes including magic-link regression test.**

---

## 2. SECURITY SUMMARY

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Never — server env only |
| Supabase anon key in client | ✅ Intentional — RLS-gated, documented |
| Sentry DSN in client | ✅ Low risk — public-safe by design |
| `.gitignore` covers `.env`, `*.p8`, `*.key` | ✅ |
| Git history scrubbed (business plan PDF leak) | ✅ Done 2026-05-09 |
| SRI on CDN scripts | ⚠️ Leaflet only — React/Babel/Supabase missing |
| CSP header/meta | ❌ None |
| CORS allowlist on proxy | ✅ Restrictive — 4 prod origins |
| Rate limiter on proxy | ✅ 60 req/min/IP with GC |
| No hardcoded IPs in client | ✅ (old 104.131/198.199 references gone) |

---

## 3. CDN BUNDLE BREAKDOWN

| Asset | Gzip est. | Notes |
|-------|-----------|-------|
| Babel Standalone 7.24.7 | ~374 KB | Largest asset. Required for no-build JSX. |
| ReactDOM 18.3.1 | ~130 KB | |
| Supabase JS 2.45.4 | ~80 KB | Eager-loaded — see P2-D |
| app.jsx (transpiled) | ~125 KB | Raw 512 KB → gzip ~125 KB |
| Leaflet 1.9.4 | ~40 KB | |
| Plus Jakarta Sans | ~20 KB | |
| React 18.3.1 | ~11 KB | |
| **Total first load** | **~780 KB gzip** | |

The no-build architecture pays Babel's 374 KB toll on every cold visit. Known and accepted per project constraints. Don't add more CDN deps without accounting for this cost.

---

## 4. COST PROJECTION

| Scale | Infra Cost/mo | Notes |
|-------|--------------|-------|
| Today (< 100 MAU) | $6 | DO 1GB + GitHub Pages free + Supabase free |
| 1K MAU | $6 | Same stack, within all free tiers |
| 10K MAU | $25–43 | DO 2GB ($18) + Supabase Pro ($25) |
| 100K MAU | $100–650 | DO 4GB+ ($24+) + Supabase Pro/Team ($25–$599) + possible Open-Meteo commercial |

**Current monthly burn: $6.** At $11.98 RPM with 1K MAU → ~$12/month revenue. Infrastructure is covered at launch scale.

---

## 5. WHAT BREAKS FIRST AT SCALE

**The in-memory weather cache in `proxy.js` is the single point of failure.**

The $6/month 1GB DigitalOcean droplet runs everything: rate limiter state, weather cache (up to 4,000 entries, 2hr TTL), alert registrations, and the alerts polling worker. When that process crashes or the droplet reboots, the entire cache cold-starts simultaneously.

**Cold-start math with 50 concurrent users hitting a just-restarted proxy:**
- 50 users × 231 Open-Meteo calls = **11,550 calls in under 60 seconds**
- Open-Meteo free tier: **10,000 calls/day**
- Result: 429s before the cache warms. Every venue scores 0. Explore appears broken.

This failure mode is completely silent to users — they just see no recommendations.

**Prevention steps before any public traffic push:**
1. Deploy the VPS proxy now (P1-A above) — N simultaneous users on a cache hit = 1 upstream call
2. Add `pm2 --max-memory-restart 768M` so the process self-heals before OOM kills it silently
3. If you expect a traffic spike (Reddit, Product Hunt), pre-warm the cache: `curl https://peakly-api.duckdns.org/api/weather?lat=<lat>&lon=<lon>` for each venue lat/lon before posting

Without step 1, steps 2 and 3 have no effect — the cache isn't running at all.

---

## 6. ACTION SUMMARY

| Priority | Action | Owner | Time |
|----------|--------|-------|------|
| **P1-A** | SSH to VPS, `git pull && pm2 restart peakly-proxy` | Jack | 3 min — TODAY |
| **P1-B** | Decide APNS path or gate Alerts behind `isNativePlatform()` | Jack | 5–60 min — TODAY |
| P2-A | Add SRI hashes to React/Babel/Supabase in index.html | AI session | 15 min |
| P2-B | Add starter CSP meta tag to index.html | AI session | 10 min |
| P2-C | Bump Babel to 7.26.x | AI session | 5 min |
| P2-D | Apply eager-supabase-delete diff, test magic-link flow | AI session | 20 min |
