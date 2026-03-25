# Peakly DevOps Report — 2026-03-25

**Overall Status: 🟡 YELLOW**
Site is live and serving. No catastrophic failures. But HTTPS is still broken on the proxy (day 1 problem), analytics are 100% absent, and the app is loading a 1.5MB transpiler in the browser on every page load. At current traffic these are survivable. At launch they are not.

---

## Critical Issues (P0) — Fix Before Launch

### P0-1: Flight Proxy is HTTP — Mixed Content Blocks Real Prices

**Status: STILL BROKEN.** Been flagged in previous reports. Still unfixed.

```
/home/user/peakly/app.jsx:1000
const FLIGHT_PROXY = "http://104.131.82.242:3001";
```

Every modern browser (Chrome, Safari, Firefox) blocks HTTP requests from an HTTPS page. GitHub Pages serves over HTTPS. The flight proxy is HTTP. Result: every user on a real browser sees estimated/fallback prices, never real flight data. The core revenue feature is broken for 100% of users.

**Fix — Option A: Cloudflare Tunnel (zero cert management, free)**

SSH into the VPS, then:

```bash
# On DigitalOcean VPS (104.131.82.242)
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
cloudflared tunnel login
cloudflared tunnel create peakly-proxy
cloudflared tunnel route dns peakly-proxy proxy.peakly.app
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: proxy.peakly.app
    service: http://localhost:3001
  - service: http_status:404
EOF
cloudflared service install
systemctl start cloudflared
```

Then in app.jsx line 1000:
```js
const FLIGHT_PROXY = "https://proxy.peakly.app";
```

**Fix — Option B: Let's Encrypt + nginx (if domain is already set up)**

```bash
# On VPS
sudo apt install nginx certbot python3-certbot-nginx -y
cat > /etc/nginx/sites-available/proxy << 'EOF'
server {
    listen 80;
    server_name proxy.peakly.app;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
ln -s /etc/nginx/sites-available/proxy /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d proxy.peakly.app --non-interactive --agree-tos -m jjciluzzi@gmail.com
```

**Estimated fix time: 30 minutes (Cloudflare Tunnel), 45 minutes (nginx + Let's Encrypt)**

---

## High Issues (P1) — Fix This Week

### P1-1: Zero Analytics — Flying Completely Blind

**Status: No Plausible, no GA4, no nothing.** The analytics script is absent from index.html. There is no analytics code anywhere in app.jsx. Peakly has been live with zero measurement capability. You cannot answer: how many users visited today, what venues they clicked, whether they completed onboarding, or whether the flight price banner works.

**Fix — Add Plausible (privacy-friendly, 2 lines in index.html):**

After signing up at plausible.io and adding the site, add before `</head>` in index.html:

```html
<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.js"></script>
```

**Fix — Add custom event tracking in app.jsx** for the 5 most important user actions:

```js
// Venue detail opened
window.plausible && window.plausible('VenueOpen', { props: { venue: v.name, category: v.cat[0] } });

// Flight link clicked
window.plausible && window.plausible('FlightClick', { props: { venue: v.name, airport: homeAirport } });

// Alert created
window.plausible && window.plausible('AlertCreated', { props: { category: alertCategory } });

// Wishlist add
window.plausible && window.plausible('WishlistAdd', { props: { venue: v.name } });

// Onboarding completed
window.plausible && window.plausible('OnboardingComplete', { props: { sport: profile.sports[0] } });
```

**Estimated fix time: 20 minutes**

---

### P1-2: No PWA Manifest — Cannot Be Installed to Home Screen

There is no `manifest.json` and no `<link rel="manifest">` in index.html. On mobile, users cannot add Peakly to their home screen as a PWA. This kills the "feels native" experience and retention.

**Fix — Create `/home/user/peakly/manifest.json`:**

```json
{
  "name": "Peakly",
  "short_name": "Peakly",
  "description": "Find surf, ski & adventure spots when conditions and cheap flights align.",
  "start_url": "/peakly/",
  "display": "standalone",
  "background_color": "#f5f5f5",
  "theme_color": "#0284c7",
  "orientation": "portrait",
  "icons": [
    {
      "src": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=192&h=192&fit=crop",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Fix — Add to `<head>` in index.html:**

```html
<link rel="manifest" href="./manifest.json" />
<link rel="apple-touch-icon" href="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=180&h=180&fit=crop" />
```

**Estimated fix time: 15 minutes**

---

### P1-3: Stale Cache-Buster

```
index.html:45
<script type="text/babel" src="./app.jsx?v=20260323b" ...>
```

Today is 2026-03-25. Cache-buster is 2 days old. There have been commits since (`fb8970b`, `da6ba3d`). Users with a cached version may not see the latest code.

**Fix — Update now:**

```html
<script type="text/babel" src="./app.jsx?v=20260325a" data-presets="react"></script>
```

**Long-term fix — automate it in the push alias:**
```bash
sed -i "s/v=[0-9]\{8\}[a-z]*/v=$(date +%Y%m%d)a/" index.html
```

**Estimated fix time: 2 minutes**

---

## Medium Issues (P2) — Fix This Sprint

### P2-1: No .gitignore — Risk of Accidentally Committing Secrets

No `.gitignore` file exists in the repository. If a session creates a `.env` file, node_modules, or macOS `.DS_Store` files, they get committed. A future session adding Stripe keys has no protection against accidental exposure.

**Fix — Create `/home/user/peakly/.gitignore`:**

```gitignore
# Environment & secrets
.env
.env.*
*.pem
*.key
*.p12

# macOS
.DS_Store
.AppleDouble

# Node (future-proofing)
node_modules/
npm-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# Build artifacts
dist/
build/

# Backup files
*.bak
app.jsx.bak
```

**Estimated fix time: 5 minutes**

---

### P2-2: Sentry DSN Is Empty — Error Monitoring Disabled

```
app.jsx:6
const SENTRY_DSN = ""; // TODO: Add Sentry DSN after signup
```

The error boundary catches React crashes and the Sentry-lite logger is wired up, but with an empty DSN nothing gets reported remotely. Production crashes are invisible.

**Fix — Sign up at sentry.io (free tier: 5K errors/month), then:**

```js
// app.jsx line 6
const SENTRY_DSN = "https://YOUR_KEY@oXXXXXX.ingest.sentry.io/XXXXXXX";
```

One line. Everything else is already wired.

**Estimated fix time: 10 minutes**

---

### P2-3: REI Affiliate Links Have No Tracking IDs

```
app.jsx:3998+
url: "https://www.rei.com/search?q=skis"
```

Every gear link in `GEAR_ITEMS` points to plain REI search URLs with no affiliate parameters. These generate zero commission. The gear section renders on every venue detail sheet — high-impression, zero-revenue.

**Fix — Once LLC is approved and REI Associates account is active** (REI uses Impact Radius):

```js
// Replace base URLs with Impact Radius deeplinks
// Format: https://www.rei.com/search?q=skis&cm_mmc=aff_AL-_-[IMPACT_PUBLISHER_ID]-_-[CAMPAIGN]
```

**Estimated fix time: 30 minutes once affiliate ID obtained. Blocked by LLC.**

---

## Performance Analysis

### Bundle Size — What Every User Downloads on First Load

| Asset | Uncompressed | Gzipped (est.) |
|-------|-------------|----------------|
| Babel Standalone 7.24.7 | ~1,500 KB | ~450 KB |
| ReactDOM 18 (production) | ~400 KB | ~120 KB |
| React 18 (production) | ~130 KB | ~42 KB |
| app.jsx | 364 KB | ~90 KB |
| **Total** | **~2,394 KB** | **~702 KB** |

**Biggest bottleneck: Babel Standalone at 1.5MB.** It loads synchronously, blocks the main thread, and compiles app.jsx before any pixel renders. On 4G (10 Mbps): ~1.2 seconds of blank screen for Babel alone. On 3G (~1.5 Mbps): 8 seconds. This is the single largest performance liability in the codebase.

**Image lazy loading: PASSING.** All 7 `<img>` tags have `loading="lazy"`. Good.

**CDN versions:**
- `react@18`: floating tag — acceptable (auto-receives patch updates)
- `@babel/standalone@7.24.7`: pinned, 2 minor versions behind (7.26.x current) — low priority

**Mitigation for Babel (no build step required):**
Switch to jsDelivr for better caching and add SRI hash:
```html
<script
  src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"
  integrity="sha256-[SRI_HASH_FROM_JSDELIVR]"
  crossorigin="anonymous">
</script>
```

---

## Cost Projections

| Scale | Monthly Cost | Notes |
|-------|-------------|-------|
| Current | $6/mo | DigitalOcean VPS only. GitHub Pages is free. |
| 1K MAU | $6/mo | VPS handles ~10 req/min flight proxy easily |
| 10K MAU | $12–18/mo | Upgrade VPS to 2GB RAM ($12/mo) |
| 100K MAU | $40–80/mo | 2× $24 droplets + Cloudflare LB. Or: migrate proxy to Cloudflare Workers ($5/mo flat, 100K req/day free). |

**Best cost move at scale:** Replace DigitalOcean VPS with Cloudflare Workers for the flight proxy. Workers handle 100K req/day on the free tier, have built-in HTTPS, and eliminate the $72/year VPS cost for what is essentially a 50-line Node.js proxy.

---

## What Breaks First at Scale

The Babel Standalone architecture is the grenade with the pin already pulled. Every user downloads 1.5MB of JavaScript compiler and transpiles the entire app in their browser before seeing a single pixel. At zero traffic this is invisible. At launch — when a Reddit post hits r/skiing and 500 people open the app simultaneously on mobile — the first experience will be a blank white screen for 3–8 seconds. Most will close it before anything renders. The fix is mechanical and requires no build tooling: run `npx babel app.jsx --presets react -o app.js` once per deploy, update index.html to load `app.js` instead of `app.jsx`, and remove the Babel `<script>` tag. Bundle drops from 2.4MB to ~900KB. First render moves from 3–8 seconds to under 1 second on mobile. This is one new line in the deploy process and zero changes to app architecture.

---

## Action Summary

| Priority | Issue | Time | Blocked? |
|----------|-------|------|----------|
| P0 | HTTPS on flight proxy | 30–45 min | No |
| P1 | Add Plausible analytics | 20 min | No |
| P1 | Add PWA manifest | 15 min | No |
| P1 | Update cache-buster | 2 min | No |
| P2 | Create .gitignore | 5 min | No |
| P2 | Add Sentry DSN | 10 min | No |
| P2 | REI affiliate tracking | 30 min | Yes (LLC) |

**Total unblocked work: ~82 minutes to resolve all P0–P2 issues.**
