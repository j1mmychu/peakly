# DevOps & Reliability Report — 2026-03-24

**Overall Status: RED**
Two of three external services are unconfirmed or degraded. One P0 security gap (no root `.gitignore`) was found and fixed this session. The Babel-in-browser architecture is a performance time bomb that will detonate at real user load.

---

## 1. LIVE SITE HEALTH — YELLOW (unverifiable)

GitHub Pages returned HTTP 403 to external health checks. This is consistent with GitHub Pages bot-blocking behavior rather than a true site outage — the page was confirmed loading in prior sessions and the `.nojekyll` file is committed and pushed. However, **we cannot confirm the app renders without console errors** from this environment.

**Known risk:** `index.html` loads `app.jsx?v=20260323b`. The cache-bust version string is from March 23. No code changed today so this is correct, but the version must be manually bumped on every deploy. If someone pushes app.jsx without bumping the version, users will be served stale cached JS indefinitely.

**Fix (apply on every deploy):**
```bash
# In index.html line 45, update version before pushing:
# src="./app.jsx?v=20260324"
# Better long-term: use git SHA
VERSION=$(git rev-parse --short HEAD)
sed -i "s/app\.jsx?v=[^\"']*/app.jsx?v=$VERSION/" index.html
```

---

## 2. FLIGHT PROXY HEALTH — RED

**The proxy at `http://104.131.82.242:3001` has been ECONNREFUSED for at least 2 consecutive days.** This means every user is getting estimated (fake) flight prices with an "est." label instead of real Travelpayouts data. The app degrades gracefully, but the core value proposition — real-time flights — is broken.

**Additional P0 issue:** The proxy runs plain HTTP. `index.html` is served over HTTPS via GitHub Pages. This is a **mixed content violation** — every modern browser will silently block the `http://` fetch call from an `https://` page. The proxy is not just down, it's architecturally broken for the production environment.

Confirm this is the issue by checking the browser console — you'll see:
```
Mixed Content: The page at 'https://j1mmychu.github.io/peakly/' was loaded over HTTPS,
but requested an insecure resource 'http://104.131.82.242:3001/api/flights?...'.
This request has been blocked; the content must be served over HTTPS.
```

**Fix — Option A (30 min): Cloudflare Tunnel (recommended, free)**
```bash
# On the VPS:
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
dpkg -i cloudflared.deb
cloudflared tunnel login
cloudflared tunnel create peakly-proxy
cloudflared tunnel route dns peakly-proxy proxy.peakly.app
# Edit ~/.cloudflared/config.yml:
cat > ~/.cloudflared/config.yml <<EOF
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: proxy.peakly.app
    service: http://localhost:3001
  - service: http_status:404
EOF
cloudflared service install
systemctl enable --now cloudflared
```
Then update `app.jsx` line 1000:
```js
const FLIGHT_PROXY = "https://proxy.peakly.app";
```

**Fix — Option B (1 hr): nginx + Let's Encrypt**
```bash
# On VPS:
apt install -y nginx certbot python3-certbot-nginx
# Point a DNS A record for proxy.peakly.app → 104.131.82.242 first, then:
certbot --nginx -d proxy.peakly.app --non-interactive --agree-tos -m jack@peakly.app

cat > /etc/nginx/sites-available/proxy.peakly.app <<'EOF'
server {
    listen 80;
    server_name proxy.peakly.app;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name proxy.peakly.app;
    ssl_certificate /etc/letsencrypt/live/proxy.peakly.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/proxy.peakly.app/privkey.pem;
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
ln -s /etc/nginx/sites-available/proxy.peakly.app /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

**Fix — Restart the dead proxy process:**
```bash
# SSH to VPS first:
ssh root@104.131.82.242

# Check if process is running:
ps aux | grep node
pm2 list

# If dead, restart:
cd /path/to/proxy
pm2 start server.js --name peakly-proxy
pm2 save
pm2 startup   # auto-restart on reboot

# If pm2 not installed:
npm install -g pm2
pm2 start server.js --name peakly-proxy
pm2 save && pm2 startup
```

---

## 3. WEATHER API HEALTH — YELLOW (unverifiable)

Open-Meteo returned 403 to health checks, likely due to bot detection on the health-check IP, not a real outage. The API is free, has no key, and has been reliable. However, the free tier enforces **10,000 API calls/day**.

**Rate limit math:**
- At 500 MAU: ~500 sessions/day × ~8 weather calls/session = 4,000 calls/day — safe
- At 1,000 MAU: ~8,000 calls/day — approaching limit
- At 1,500 MAU: Hits 10K/day limit — **rate limited, all venues show no weather data**

**Fix (before hitting 1K MAU) — server-side weather cache on VPS:**
```js
// Add to VPS proxy server.js
const weatherCache = new Map(); // { key: { data, timestamp } }
const CACHE_TTL = 30 * 60 * 1000; // 30 min

app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  const key = `${lat},${lon}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  const upstreamUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=...`;
  const data = await fetch(upstreamUrl).then(r => r.json());
  weatherCache.set(key, { data, timestamp: Date.now() });
  res.json(data);
});
```
This would collapse 170 venues × N users to 170 unique calls/30min max — about 8,160/day ceiling regardless of MAU.

---

## 4. SECURITY AUDIT

### Findings

| Check | Result | Severity |
|-------|--------|----------|
| Travelpayouts token in client | CLEAN | — |
| API keys / Bearer tokens | CLEAN | — |
| Root `.gitignore` missing | **FIXED this session** | was P0 |
| SENTRY_DSN empty | No monitoring | P1 |
| HTTP proxy URL in client code | `http://104.131.82.242:3001` exposed | P1 |
| Amazon Associates tag `peakly-20` | Active in URLs, unverified approval | P2 |
| Booking.com AID `2311236` | Looks like a real ID | OK |
| SafetyWing `referenceID=peakly` | Looks like a real ID | OK |
| `.env` files in repo | None found | CLEAN |
| `peakly-native` secrets | CLEAN | — |

**`.gitignore` was missing at the repo root.** This meant that if a `.env` file or `*.pem` file was ever created locally, nothing would stop it from being accidentally committed and pushed to the public GitHub repo. **This has been fixed** — `.gitignore` was created and committed this session.

**SENTRY_DSN is empty (line 6 of app.jsx):** The error handler is wired up but the DSN is `""`, so errors are logged to `localStorage` only and never surfaced to a developer. If the app crashes for a user, you will never know. Sentry's free tier supports 5,000 errors/month.

```js
// Line 6 of app.jsx — update this once Sentry account is created:
const SENTRY_DSN = "https://YOUR_KEY@oXXXXXX.ingest.sentry.io/XXXXXXX";
```

**Amazon Associates tag `peakly-20`:** This tag is live in production URLs across ~30+ gear items. If the Associates account is not yet approved, Amazon will not pay commission on any of these clicks and may disable the account if it detects unapproved use. Verify account status at associates.amazon.com.

---

## 5. PERFORMANCE ANALYSIS

### Bundle breakdown (first load, no cache)

| Asset | Raw size | Gzipped | Notes |
|-------|----------|---------|-------|
| `react.production.min.js` | ~130 KB | ~42 KB | Pinned to v18 ✓ |
| `react-dom.production.min.js` | ~1,100 KB | ~130 KB | Pinned to v18 ✓ |
| `babel.min.js` (standalone 7.24.7) | **~1,500 KB** | **~340 KB** | **THE PROBLEM** |
| `app.jsx` | 365 KB | **81 KB** (measured) | Grows with every venue |
| Google Fonts (Plus Jakarta Sans) | ~30 KB | ~10 KB | — |
| **Total first load** | **~3,125 KB** | **~603 KB** | — |

**Babel Standalone is a 340 KB gzipped download that exists solely to compile JSX code at runtime — on every page load, on every device.** On a modern desktop with a fast connection this costs ~200–400ms. On a mid-range phone (Moto G, Galaxy A-series) this costs 1–3 seconds of CPU time just for transpilation, after the file is downloaded. On a budget Android device in Southeast Asia or South America (exactly the growth markets in the product roadmap), you're looking at 5–10 seconds where the screen is blank.

**Babel is not a CDN dependency issue — it is a load-time tax paid by every user, every session.** The right fix is a build step that pre-compiles JSX to plain JavaScript. This is not urgent now at 0 users. It is P0 at 10K users. Plan the migration before launch.

**Quick win today — Unsplash images are served as JPEG. Add WebP:**
```js
// Current (app.jsx, all photo URLs):
photo: "https://images.unsplash.com/photo-XXXXX?w=800&h=600&fit=crop"

// Fix — add &auto=format&fm=webp (30–50% smaller):
photo: "https://images.unsplash.com/photo-XXXXX?w=800&h=600&fit=crop&auto=format&fm=webp"
```
With 109 photos at average 200KB JPEG vs 100KB WebP, this saves ~11MB per full scroll of the venue list. On mobile this is meaningful. Use `sed` to batch-update all 109 URLs.

**Card images at 800×600 are oversized for mobile.** A card thumbnail needs 400×300 maximum. Use `?w=400&h=300` on card views and reserve 800×600 for the detail sheet.

---

## 6. COST PROJECTIONS

| MAU | GitHub Pages | VPS (proxy) | Open-Meteo | Total/month |
|-----|-------------|-------------|------------|-------------|
| Current (< 100) | Free | $6 | Free | **$6** |
| 1,000 | Free | $6 | Free (near limit) | **$6** |
| 5,000 | Free | $12 (upgrade) | **$0 → risk** | **$12–20** |
| 10,000 | Free | $24 (2× droplet) | $50 (commercial) | **$74** |
| 100,000 | Free | $100 (load balanced) | $200 (commercial) | **$300** |

**Open-Meteo commercial license** kicks in at sustained API usage above free tier. Plan to add the VPS weather cache (described in section 3) before 1K MAU to stay free longer.

**At 100K MAU the infrastructure is still <$400/month** against an estimated $71–128 RPM. Margins are excellent — the cost structure scales well. The Babel compilation issue is the only architectural change needed before scale.

---

## 7. WHAT BREAKS FIRST AT SCALE

**Open-Meteo rate limits at ~1,500 MAU, Babel kills Time to Interactive at ~5,000 MAU, and the single DigitalOcean droplet falls over at ~10,000 concurrent proxy requests.** The fix order is: (1) add the VPS weather cache now — it's 30 lines of code and buys you 10× runway before Open-Meteo fees; (2) plan the Babel → pre-compiled build migration before launch, not after; (3) put the flight proxy behind Cloudflare (free plan) which gives you a CDN, DDoS protection, and automatic HTTPS — killing three problems at once. The single biggest technical risk is not a server going down, it's a user on a slow phone in a target market opening the app, watching a blank white screen for 8 seconds while Babel compiles, and closing it forever.

---

## Actions Taken This Session

| Action | File | Status |
|--------|------|--------|
| Created root `.gitignore` | `/.gitignore` | **DONE** |

## P0 Actions Required (block on these)

| Issue | Fix | Time |
|-------|-----|------|
| Flight proxy DOWN + HTTP mixed-content | SSH to VPS, restart pm2, add Cloudflare tunnel | 1 hr |

## P1 Actions Required (this week)

| Issue | Fix | Time |
|-------|-----|------|
| SENTRY_DSN empty | Sign up for Sentry free, paste DSN into app.jsx line 6 | 15 min |
| Unsplash images not WebP | Add `&auto=format&fm=webp` to all 109 photo URLs | 20 min |
| Open-Meteo cache missing | Add 30-line cache to VPS proxy | 1 hr |

## P2 Actions (this sprint)

| Issue | Fix | Time |
|-------|-----|------|
| Cache-bust version manual | Automate with git SHA in deploy script | 30 min |
| Image sizes oversized | Use `w=400&h=300` on card thumbnails | 20 min |
| Babel → build step | Migrate to Vite or esbuild pre-compile | 2–4 hrs |

---

*Report generated 2026-03-24. Fixes applied: root `.gitignore` created.*
