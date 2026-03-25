# Peakly DevOps Report — 2026-03-25

**Status: YELLOW** — No secrets exposed, site loads, but the flight proxy is HTTP-only (active mixed-content failure in every browser), analytics are completely absent, and the cache buster is stale. Nothing catastrophic, but two issues are actively blocking revenue and measurement.

---

## 1. Live Site Health

| Check | Result | Status |
|-------|--------|--------|
| app.jsx size | 5,446 lines / 364,885 bytes raw | OK |
| CDN dependencies | React 18, ReactDOM 18, Babel 7.24.7 via unpkg | OK |
| Plausible / GA4 analytics | **ABSENT — not in index.html or app.jsx** | ❌ P1 |
| Cache buster | `v=20260323b` — 2 days stale (last updated 2026-03-23) | ⚠️ P2 |

**No analytics whatsoever.** Every user session is invisible. You cannot measure bounce rate, venue clicks, flight clicks, or affiliate conversions. Plausible is free for low traffic and is a 2-line addition to index.html.

**Cache buster:** `v=20260323b` is 2 days old. app.jsx has changed since then. Users on warm browser caches may be running 2-day-old code. This must be bumped on every deploy.

---

## 2. Flight Proxy Status

| Check | Result | Status |
|-------|--------|--------|
| Proxy URL | `http://104.131.82.242:3001` | ❌ P0 |
| Proxy alive | YES — returns "Host not allowed" | Partial |
| Protocol | **HTTP — no TLS** | ❌ P0 |
| Timeout | 3 seconds + AbortController | OK |
| Fallback | Falls back to BASE_PRICES if null | OK |

**P0: The HTTP proxy causes mixed content blocking in every modern browser.** GitHub Pages serves over HTTPS. The proxy is HTTP. Chrome, Safari, and Firefox silently block HTTP fetches from HTTPS pages with zero error shown to the user. This means `fetchTravelpayoutsPrice()` **never succeeds in production** — users always see estimated fallback prices, and Travelpayouts earns $0. This is not theoretical. It is happening right now to every user.

The proxy process is alive (responding with "Host not allowed"), which suggests the Node.js server is running but has a CORS/origin check rejecting the GitHub Pages domain. **Two bugs to fix: no HTTPS, and a host restriction blocking `j1mmychu.github.io`.**

**Fix option A — nginx + Let's Encrypt (requires DNS subdomain, ~30 min):**

```bash
# On the VPS (104.131.82.242) as root:
apt update && apt install nginx certbot python3-certbot-nginx -y

cat > /etc/nginx/sites-available/peakly-proxy << 'EOF'
server {
    listen 80;
    server_name proxy.peakly.app;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin "https://j1mmychu.github.io";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
    }
}
EOF

ln -s /etc/nginx/sites-available/peakly-proxy /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d proxy.peakly.app
```

**Fix option B — Cloudflare Tunnel (zero DNS propagation wait, ~10 min):**

```bash
curl -L --output cloudflared.deb \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared.deb
cloudflared tunnel login
cloudflared tunnel create peakly-proxy
cloudflared tunnel route dns peakly-proxy proxy.peakly.app
cloudflared service install
cloudflared tunnel run --url http://localhost:3001 peakly-proxy
```

**Then update app.jsx line 1000:**
```js
// BEFORE:
const FLIGHT_PROXY = "http://104.131.82.242:3001";

// AFTER:
const FLIGHT_PROXY = "https://proxy.peakly.app";
```

**Also fix the Node.js proxy CORS config** — add `j1mmychu.github.io` to the allowed origins list. The "Host not allowed" response is a second independent bug killing the proxy even when called from HTTP.

---

## 3. Weather & External APIs

| Check | Result | Status |
|-------|--------|--------|
| Open-Meteo endpoint | `https://api.open-meteo.com/v1` | OK |
| Marine endpoint | `https://marine-api.open-meteo.com/v1` | OK |
| Auth required | None — public free tier | OK |
| Free tier limit | 10,000 requests/day | ⚠️ Risk |

**Rate limit math at scale:**
- 171 venues × 2 calls each (weather + marine) = 342 API calls per user on load
- 10K/day free tier ÷ 342 calls = exhausted after **29 full user loads per day**
- With 10-minute auto-refresh active: even faster

This will not matter at 100 users. It will matter at 500. The failure mode is silent — scores drop to 0, hero card shows garbage, users churn thinking the app is broken.

**Fix when approaching 100 MAU:** Cache weather responses in localStorage with a 30-minute TTL keyed by `${lat}_${lon}_${date}`. Only fetch when cache is cold or expired.

---

## 4. Security Audit

| Check | Result | Status |
|-------|--------|--------|
| Travelpayouts token in client code | Not found ✓ | OK |
| Other API keys / tokens in app.jsx | Not found ✓ | OK |
| .gitignore exists | **MISSING** | ⚠️ P1 |
| Sentry DSN configured | **Empty string — line 6** | ⚠️ P2 |
| Recent commits introducing secrets | None detected | OK |
| Affiliate IDs (REI, Backcountry) | Direct search URLs, no affiliate ID params | ⚠️ Noted |

**No .gitignore is a latent risk.** If a `.env` file is ever created locally, it will be committed and pushed. 30-second fix:

```bash
cat > /home/user/peakly/.gitignore << 'EOF'
.env
.env.local
.env.*
*.pem
*.key
node_modules/
.DS_Store
*.log
EOF
```

**Sentry DSN is empty — zero production error visibility.** When users hit bugs you find out via Reddit, not an alert at 3am. Free Sentry tier handles 5K errors/month, sufficient through launch.

Fix at line 6 in app.jsx after creating free account at sentry.io:
```js
// BEFORE:
const SENTRY_DSN = ""; // TODO: Add Sentry DSN after signup

// AFTER:
const SENTRY_DSN = "https://YOUR_PUBLIC_KEY@oXXXXXX.ingest.sentry.io/PROJECT_ID";
```

**REI/Backcountry links are plain search URLs with no affiliate tracking.** All gear recommendation clicks earn $0. Blocked by LLC approval per CLAUDE.md — noted here for when that unblocks.

---

## 5. Performance Analysis

| Metric | Value | Status |
|--------|-------|--------|
| app.jsx raw | 364,885 bytes (~356KB) | Acceptable |
| app.jsx estimated gzip | ~80–90KB | OK |
| React 18 prod (gzip) | ~42KB | OK |
| ReactDOM 18 prod (gzip) | ~130KB | OK |
| **Babel Standalone 7.24.7 (gzip)** | **~230KB** | ❌ P1 |
| **Total estimated first-load gzip** | **~480–500KB** | ❌ Heavy |
| Images with `loading="lazy"` | All 7 img tags ✓ | OK |
| React CDN version pin | `@18` floating — will auto-upgrade | ⚠️ P2 |
| PWA manifest | **Missing** | ⚠️ P1 |

**Largest single bottleneck: Babel Standalone at ~230KB gzip.** It transpiles JSX at runtime on every cold load. On a mid-range Android on 4G, this adds 1–2 seconds to Time to Interactive before any app code runs. This is a known constraint of the no-build-step architecture. Noted as a future migration target.

**Unpinned React version is a silent breaking-change risk:**
```html
<!-- CURRENT (floating — dangerous): -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>

<!-- SAFE (pinned to latest stable): -->
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```
If React 18.x ships a breaking UMD change, `@18` will silently break every user simultaneously with no warning.

**Missing PWA manifest blocks home screen installs.** Mobile users who install to home screen have dramatically higher retention. 20-minute fix.

Add to `index.html` `<head>`:
```html
<link rel="manifest" href="/peakly/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Peakly" />
```

Create `manifest.json` in repo root:
```json
{
  "name": "Peakly",
  "short_name": "Peakly",
  "description": "Adventure when conditions and cheap flights align",
  "start_url": "/peakly/",
  "scope": "/peakly/",
  "display": "standalone",
  "background_color": "#f5f5f5",
  "theme_color": "#0284c7",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

(Requires creating 192×192 and 512×512 PNG icon files — use a free favicon generator.)

**Add Plausible analytics — 2 lines in index.html before `</head>`:**
```html
<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.js"></script>
```

Add custom events in app.jsx for the 5 most important actions:
```js
window.plausible && window.plausible('VenueOpen', { props: { venue: v.name, category: v.cat[0] } });
window.plausible && window.plausible('FlightClick', { props: { venue: v.name, airport: homeAirport } });
window.plausible && window.plausible('AlertCreated', { props: { category: alertCategory } });
window.plausible && window.plausible('WishlistAdd', { props: { venue: v.name } });
window.plausible && window.plausible('OnboardingComplete', { props: { sport: profile.sports[0] } });
```

---

## 6. Cost Projections

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|-------------|
| Current (< 500 MAU) | DO $6 droplet + GitHub Pages free | $6/mo |
| 1K MAU | Same | $6/mo |
| 10K MAU | DO $12 droplet (2GB RAM) + Cloudflare free | ~$12/mo |
| 100K MAU | DO $24 droplet + Cloudflare Pro $20 + DO bandwidth overage | ~$60–80/mo |

Infrastructure is not the cost concern. The cost concern is **Unsplash at scale**: venue photos are served from Unsplash CDN with no caching layer. At 100K MAU, Unsplash's demo API rate limit (5K requests/hour) becomes a hard wall. Mitigation: route images through Cloudflare (free caching) or migrate to Cloudinary free tier (25GB bandwidth/month).

---

## What Breaks First at Scale

**The Open-Meteo weather API will be the first thing that silently kills the app under a growth push.** At ~30 concurrent users doing a full venue load, the 342 API calls per user will exhaust the 10K/day free tier in under an hour. The failure is completely silent — fetchWeather() returns null, all 171 venue scores reset to 0, the hero card shows "Best Right Now" with a 0-score venue, and users assume the app is broken. There's no error banner, no fallback UI, no alert. Implement a localStorage weather cache with 30-minute TTL before any Reddit or TikTok launch push. That single change extends the free tier to approximately 10K MAU without a single dollar of infrastructure spend.

---

## Priority Summary

| Priority | Issue | Estimated Fix Time |
|----------|-------|--------------------|
| **P0** | Flight proxy HTTP-only — mixed content blocks all real prices in every browser | 30 min (Cloudflare Tunnel) |
| **P1** | Zero analytics — cannot measure users, clicks, or conversions | 10 min |
| **P1** | No PWA manifest — cannot install to home screen | 20 min |
| **P1** | Unpinned `react@18` CDN tag — silent breaking change risk | 2 min |
| **P1** | No .gitignore — risk of accidental secret commit | 2 min |
| **P2** | Sentry DSN empty — no production error visibility | 5 min after signup |
| **P2** | Cache buster `v=20260323b` is 2 days stale | 1 min |
| **P2** | Open-Meteo rate limit risk at ~30 concurrent users | 2 hours (localStorage weather cache) |
| **P2** | REI affiliate links earn $0 — no tracking IDs | 30 min (blocked by LLC) |
