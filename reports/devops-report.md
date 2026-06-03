# Peakly DevOps Report — 2026-06-03

**Status: 🟡 YELLOW**

Two P1s unchanged for 5+ weeks. VPS proxy unreachable from audit environment (network-restricted sandbox — not confirmed production outage, but Jack needs to verify manually today). SRI gap on 4 of 6 CDN scripts is the highest-probability supply chain risk in the stack. Everything else is holding.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 8,996 | ✅ |
| `app.jsx` size (raw) | 534 KB | ✅ |
| `app.jsx` gzip estimate | ~150 KB | ✅ |
| Cache buster | `20260528a` (6 days old) | ⚠️ |
| SW CACHE_NAME | `peakly-20260528a` | ⚠️ |
| PEAKLY_BUILD | `20260528a` | ⚠️ |
| Plausible script | Present, uncommented | ✅ |
| CDN scripts loading | 6 scripts (React, ReactDOM, Babel, Supabase, Leaflet ×2) | ✅ |

**Cache buster age:** `20260528a` — last bumped May 28 when app.jsx was last touched. No app.jsx changes since, so technically correct. But 6 days of reports have landed in the repo with no buster bump. If any content agent silently edits `app.jsx` without triggering the auto-push hook, users will get stale code with no recovery path. **Action: bump buster whenever app.jsx, sw.js, or index.html changes, even by 1 byte.**

---

## 2. FLIGHT PROXY STATUS

| Check | Result |
|-------|--------|
| Proxy URL in client | `https://peakly-api.duckdns.org` (HTTPS) | ✅ |
| HTTP/plaintext in client | None found | ✅ |
| `TRAVELPAYOUTS_TOKEN` in client | **Not present** — server-side only | ✅ |
| `TP_MARKER` (710303) in client | Present — affiliate marker, public-safe by design | ✅ |
| `fetchTravelpayoutsPrice` timeout | 5s + fallback to estimate | ✅ |
| `/health` endpoint response | **TIMED OUT (8s)** | ❌ |

**P0 CANDIDATE — VPS Proxy unreachable from audit environment.** `curl https://peakly-api.duckdns.org/health` timed out in 8 seconds with no response. This sandbox has outbound network policy restrictions (GitHub Pages also returned 403 from here), so this may be a false positive. **Jack must verify manually right now:**

```bash
# On your local machine or by SSHing to the VPS:
curl -s https://peakly-api.duckdns.org/health
ssh root@198.199.80.21 "pm2 status && pm2 logs peakly-proxy --lines 20"
```

If the proxy is actually down:

```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy
pm2 save
```

**What breaks if proxy is down:**
- `fetchTravelpayoutsPrice` → falls back to estimate prices (labeled `~$X`) — UX degraded but not broken
- `fetchWeather` / `fetchMarine` → falls back to direct Open-Meteo — burns free tier, no shared cache
- Push alerts → POST to `/api/alerts` silently fails — registrations lost
- At 44 simultaneous users with direct Open-Meteo calls, you hit the 10K/day free tier ceiling

**If the proxy has been down since the last VPS redeploy was deferred (Day 25+):** every user session has been hammering Open-Meteo directly. Check if you've received any rate-limit emails from them.

---

## 3. WEATHER & EXTERNAL API

| Check | Status |
|-------|--------|
| Open-Meteo used as fallback | ✅ correct |
| Batch size | 50 venues/batch, 2 batches = 100 venues total | ✅ |
| Inter-batch delay | 1,000 ms | ✅ |
| Beach venues fetch marine | ✅ (checks `category === "beach"`) | ✅ |
| Cache TTL | 2hr in localStorage | ✅ |
| Proxy-first with fallback | ✅ `_tryProxyWx()` with 4s timeout | ✅ |

**Rate limit math at scale (proxy DOWN scenario):**
- 100 venues × (1 weather + 0.5 marine avg) = ~150 calls/user session
- Open-Meteo free tier: 10,000 calls/day
- **Safe ceiling without proxy: ~66 unique daily active user sessions**
- At 200 DAU with proxy down: ~30,000 calls/day → 3× the free tier → rate limit errors, venues show no score

**Free tier protection if proxy stays down:**
```javascript
// In fetchWeather / fetchMarine, add this before direct Open-Meteo call:
// Already handled by 2hr localStorage cache — the real protection is the proxy.
// Get the proxy back online. This math doesn't improve without it.
```

---

## 4. SECURITY AUDIT

### 4a. Client-side secrets inventory

| Item | Location | Risk |
|------|----------|------|
| `SUPABASE_ANON_KEY` (JWT) | `app.jsx:26` | **Low** — public-safe by design, RLS-gated |
| `SUPABASE_URL` | `app.jsx:25` | Low — project reference only |
| `TP_MARKER` (710303) | `app.jsx:1937` | Low — public affiliate marker |
| `TRAVELPAYOUTS_TOKEN` | `server/proxy.js` only, env-var | ✅ **Never in client** |
| Sentry DSN | `app.jsx:8` + `index.html:77` | Low — expected client-side |
| APNS keys | env vars only in proxy.js | ✅ |

No secrets are exposed that shouldn't be. **The Supabase anon key is intentionally public** — this is the standard Supabase pattern. RLS policies are the gate; verify they're configured correctly at the Supabase dashboard if you haven't recently.

### 4b. ⚠️ P1 — Missing SRI on 4 of 6 CDN scripts

Only Leaflet has `integrity=` hashes. React, ReactDOM, Babel Standalone, and Supabase JS load without subresource integrity. If unpkg or jsDelivr is compromised, or a BGP hijack redirects CDN traffic, arbitrary JavaScript executes in your app with full DOM + localStorage access (user wishlists, profile data, auth tokens).

**Scripts missing SRI:**
```html
<!-- These 4 lines in index.html have no integrity= attribute: -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"></script>
```

**Fix — generate SRI hashes (run this locally, requires curl + openssl):**
```bash
# Generate all 4 hashes in one pass
for url in \
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js" \
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" \
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js" \
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"; do
  hash=$(curl -s "$url" | openssl dgst -sha384 -binary | openssl base64 -A)
  echo "sha384-${hash}  ← ${url##*/}"
done
```

Then add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag. Time: ~20 min.

**⚠️ Caveat:** unpkg may serve slightly different content based on Accept-Encoding headers. Hash the exact bytes the browser will receive. Test with a hard refresh after adding.

### 4c. P2 — No Content-Security-Policy

No CSP meta tag or header. Any XSS vector (e.g., in venue titles or photo URLs) allows arbitrary script execution.

**Partial fix (worth doing — blocks the easy stuff):**
```html
<!-- Add to index.html <head>, after <meta charset>: -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://unpkg.com https://cdn.jsdelivr.net
    https://js.sentry-cdn.com https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com https://source.unsplash.com;
  connect-src 'self'
    https://peakly-api.duckdns.org
    https://wsoqcfwkvvemtlddcgfc.supabase.co
    https://api.open-meteo.com https://marine-api.open-meteo.com
    https://plausible.io https://*.sentry.io;
  frame-ancestors 'none';
">
```

**Known limitation:** Babel Standalone requires `unsafe-eval` to transpile JSX in-browser, which guts the CSP's script injection protection. This CSP still provides meaningful protection against data exfiltration (`connect-src`) and framing (`frame-ancestors`). Not a silver bullet, but better than nothing. Time: 15 min.

### 4d. .gitignore coverage

```
✅ .env, .env.*, *.env
✅ *.pem, *.key, *.p8, *.mobileprovision  
✅ *.pdf, *.pptx, *.docx (after 2026-05-09 business-plan leak)
✅ node_modules/, .claude/
```

Coverage is solid. No gaps.

### 4e. Recent commit history — no secrets detected

Last 10 commits are all report files (`.md`). No app.jsx changes since May 28. No secrets visible in recent commit messages. Clean.

---

## 5. PERFORMANCE ANALYSIS

### Bundle breakdown (estimated gzip)

| Asset | Gzip size | Notes |
|-------|-----------|-------|
| React 18.3.1 | ~42 KB | ✅ Pinned, SRI missing |
| ReactDOM 18.3.1 | ~130 KB | ✅ Pinned, SRI missing |
| **Babel Standalone 7.29.7** | **~400 KB** | ⚠️ **Biggest bottleneck** |
| Supabase JS 2.106.2 | ~80 KB | Eagerly loaded (known-skipped) |
| Leaflet 1.9.4 | ~40 KB | SRI present ✅ |
| Leaflet CSS | ~5 KB | SRI present ✅ |
| app.jsx (raw → gzip) | ~150 KB | Plus Babel parse time |
| **Total cold load** | **~847 KB gzip** | |

**Plus runtime Babel transpile:** At cold load, Babel parses and transforms 534 KB of JSX. On a mid-range Android on 4G this adds 1.5–3 seconds before first render. This is the architectural trade-off baked into the no-build-step design — not fixable without a bundler. Acceptable for MVP; revisit at 10K MAU if bounce rates show a problem.

### Performance bottleneck ranking

1. **Babel runtime transpile** — 1.5–3s added latency on slow devices. Architectural, no quick fix.
2. **Supabase JS eager load** — 80 KB loaded before it's needed. Known-skipped; re-flag when TTI data exists.
3. **Weather batch (100 venues, 2 HTTP batches)** — 150+ API calls on load. Mitigated by proxy cache + localStorage TTL. Acceptable.

### Images
`loading="lazy"` is correctly applied at all 10 image sites checked. ✅

### CDN versions — current as of 2026-06-03

| Dep | Used | Latest stable | Status |
|-----|------|---------------|--------|
| React | 18.3.1 | 18.3.1 | ✅ |
| ReactDOM | 18.3.1 | 18.3.1 | ✅ |
| Babel Standalone | 7.29.7 | ~7.29.x | ✅ (bumped 2026-05-28) |
| Supabase JS | 2.106.2 | ~2.106.x | ✅ (bumped 2026-05-28) |
| Leaflet | 1.9.4 | 1.9.4 | ✅ |

No dep upgrades needed today.

---

## 6. COST PROJECTION

**Current:** $6/mo DigitalOcean 1GB droplet + GitHub Pages (free) = **$6/mo**

| MAU | GitHub Pages | VPS (proxy) | Supabase | **Total** |
|-----|-------------|-------------|----------|-----------|
| 1K | Free (well under 100GB bw) | $6/mo (current droplet fine) | Free tier | **$6/mo** |
| 10K | Free (est. ~15GB/mo) | $12/mo (2GB droplet under sustained load) | Free tier | **$18/mo** |
| 100K | ~$50/mo (CDN bandwidth overage risk) | $24-48/mo (4GB droplet + possible Redis for alerts) | $25/mo (Pro for RLS perf) | **$100-125/mo** |

**Optimization opportunities:**

1. **Remove eager Supabase UMD load** (known-skipped): saves 80 KB on every page load for non-auth users → measurable bounce rate improvement at scale, $0 cost change.
2. **Babel is 47% of the total bundle** — if the no-build-step constraint is ever lifted, swapping Babel Standalone for a pre-compiled bundle would cut load time by 30–40%. Flag for v2 consideration.
3. **GitHub Pages bandwidth ceiling:** At 100K MAU with ~847 KB per session, monthly bandwidth is ~847 GB. GitHub Pages limit is 100 GB/month. At ~85K MAU you'll hit the wall. Mitigation: add a Cloudflare free plan in front of GitHub Pages (cache at edge, absorbs the bandwidth, free tier supports unlimited bandwidth). Set up now — takes 30 minutes and it's free.

**Cloudflare setup (do this before 10K MAU):**
```
1. Add site to Cloudflare free plan → point j1mmychu.github.io behind CF
2. Set Cache-Control: public, max-age=86400 in Cloudflare Page Rules for /peakly/*.jsx
3. Enable Auto Minify for JS/CSS/HTML
4. Enable Brotli compression
Cost: $0. Payoff: absorbs 80%+ of bandwidth at no infra change.
```

---

## 7. WHAT BREAKS FIRST AT SCALE

**The Open-Meteo free tier will be the first wall you hit.** At 66 concurrent daily active user sessions with the proxy DOWN, you hit 10K calls/day. With the proxy UP and shared caching working, you can handle ~10,000 DAU comfortably (same 150 venues → 1 upstream call per venue per 2 hours = ~75 calls/hour max regardless of user count). The proxy cache is the entire defense. If it goes down and stays down for a weekend spike, every user gets "Score unavailable" on every venue. The fix isn't more servers — it's keeping `pm2 restart peakly-proxy` in the deployment runbook and adding a `/health` uptime monitor (UptimeRobot free tier: 5-minute checks, SMS alerts, $0).

**Set up UptimeRobot now (5 minutes, $0):**
```
URL: https://peakly-api.duckdns.org/health
Interval: 5 minutes
Alert: email jjciluzzi@gmail.com when down for >10 min
```

This is the highest-leverage 5 minutes you can spend on infrastructure before launch.

---

## OPEN ITEMS TRACKER

| # | Issue | Priority | Days Open | Action |
|---|-------|----------|-----------|--------|
| 1 | VPS redeploy (weather proxy + weekend flight dates) | **P0** | **26** | SSH + `pm2 restart` — 10 min |
| 2 | APNS configuration (push alerts) | **P1** | **21 past deadline** | Apple Dev console + 5 `pm2 set` calls |
| 3 | SRI on React/ReactDOM/Babel/Supabase | **P1** | New | Hash 4 scripts + update index.html |
| 4 | UptimeRobot for proxy /health | **P1** | New | 5 min, $0 |
| 5 | Cloudflare in front of GitHub Pages | **P2** | New | 30 min, $0 — do before 10K MAU |
| 6 | CSP meta tag | **P2** | 25+ | Partial fix possible — see §4c |
| 7 | Supabase eager load | **P2** | Known-skipped | Re-evaluate at launch |
| 8 | Onboarding / score explanation | **P2** | 25+ | Product call |

---

*Audit run: 2026-06-03 by DevOps agent. Next run: 2026-06-04.*
