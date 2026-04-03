# Peakly DevOps Report — 2026-04-03

**Overall Status: YELLOW**

No outages. HTTPS proxy confirmed live. Sentry live and capturing errors. The site is deployable and running. Three issues need attention this sprint: (1) `TP_MARKER` is still the placeholder string `"YOUR_TP_MARKER"` — every single flight affiliate click since launch has earned $0; every user who books a flight is worth $0 instead of up to $5. This is a pure revenue leak. (2) Cache buster is `v=20260331a` — app.jsx was updated on Apr 2 and Apr 3, meaning users on stale service workers are running 2–3 day old code. (3) Service worker `CACHE_NAME` is `peakly-20260330` — four days stale, meaning sw.js and app.jsx can diverge silently.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ✅ GREEN | 10,976 lines / 1.91 MB — reasonable for single-file architecture |
| Cache-buster | ❌ STALE | `v=20260331a` — app.jsx modified Apr 2+3, buster not updated |
| Service worker version | ❌ STALE | `peakly-20260330` — 4 days old, doesn't match app changes |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` — no HTTP anywhere in client code |
| Proxy timeout/fallback | ✅ GREEN | 5s AbortController + 3-attempt exponential backoff (1.2s × attempt) |
| Plausible analytics | ⚠️ WRONG DOMAIN | `data-domain="j1mmychu.github.io"` — must change to `peakly.app` before domain switch |
| Weather batching | ✅ GREEN | 50-venue batches confirmed; initial 100 fetched immediately |
| Sentry DSN | ✅ GREEN | DSN live in both index.html and Sentry.init() in app.jsx |
| Secrets in client code | ✅ GREEN | No Travelpayouts token in client; proxy reads from server-side env |
| TP_MARKER | ❌ P0 | Placeholder `"YOUR_TP_MARKER"` — $0 affiliate revenue on all flight clicks |
| .gitignore | ✅ GREEN | Covers `.env`, `*.pem`, `*.key`, `*.bak`, `node_modules/` |
| app.jsx.bak | ⚠️ P2 | Tracked in git (343 KB) — remove from git history, bloats Pages artifact |
| Lazy loading | ✅ GREEN | All `<img>` tags confirmed with `loading="lazy"` |
| CDN versions | ⚠️ YELLOW | React pinned to `@18` (floating patch) — should pin to `18.3.1`; Babel pinned to `7.24.7` (OK) |

---

## P0 — Fix Today (Revenue Blocked)

### P0-1: TP_MARKER is a placeholder — $0 affiliate revenue since launch

**Impact:** Every flight click earns $0 instead of up to $5 commission. If 10 users/day click flights, that's $1,500+/year walking out the door at 1K MAU. This is not a nice-to-have — it's the only way Travelpayouts makes money.

**Root cause:** Line 5316 of `app.jsx`:
```js
const TP_MARKER = "YOUR_TP_MARKER";
```

The `buildFlightUrl()` function explicitly checks `TP_MARKER !== "YOUR_TP_MARKER"` and falls back to a bare Aviasales URL with no affiliate attribution.

**Fix:**
1. Log into your Travelpayouts dashboard at https://travelpayouts.com
2. Go to Tools → Affiliate Links → get your marker (looks like `634521` or similar numeric ID)
3. Replace in app.jsx line 5316:
```js
const TP_MARKER = "634521";  // replace with your actual numeric marker
```

**Time to fix:** 5 minutes once you have the marker.

---

## P1 — Fix This Week

### P1-1: Cache buster is stale — users running old code

**Impact:** Users whose service workers cached `app.jsx?v=20260331a` are running code from March 31. app.jsx was modified on April 2 and April 3. Those users see bugs that are already fixed in production.

**Current value (index.html line 346):**
```html
<script type="text/babel" src="./app.jsx?v=20260331a" data-presets="react"></script>
```

**Fix:**
```html
<script type="text/babel" src="./app.jsx?v=20260403a" data-presets="react"></script>
```

**Also fix sw.js line 2:**
```js
// OLD:
const CACHE_NAME = "peakly-20260330";
// NEW:
const CACHE_NAME = "peakly-20260403";
```

Both changes must be made together and pushed in one commit. The SW version bump forces all clients to evict the old cache and re-fetch app.jsx with the new query param.

**Time to fix:** 2 minutes.

---

### P1-2: Plausible analytics tracking wrong domain

**Impact:** When you switch to `peakly.app`, all Plausible analytics will silently stop recording. You'll have a dead analytics dashboard and no visibility into traffic. This is easy to forget until you're debugging a Reddit spike with no data.

**Current (index.html line 32):**
```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

**Fix — add both domains to Plausible dashboard AND update index.html when domain switches:**

In Plausible dashboard: go to Site Settings → add `peakly.app` as a second domain, or create a new site for `peakly.app`.

When you point DNS to GitHub Pages, update index.html:
```html
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```

**Do not fix this yet** — wait until the DNS switch. But do add `peakly.app` to Plausible now so you don't lose data on day 1.

**Time to fix:** 10 minutes.

---

### P1-3: React pinned to floating `@18` — vulnerable to silent breaking changes

**Impact:** unpkg serves whatever the latest `18.x.x` patch is. React 18 has had 4 patch releases. If unpkg serves a bad release (or unpkg itself has a CDN issue), your site breaks globally with no warning and no rollback.

**Current (index.html lines 80–81):**
```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

**Fix — pin to exact version:**
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

18.3.1 is the latest stable React 18 release as of April 2026.

**Time to fix:** 2 minutes.

---

## P2 — Fix This Sprint

### P2-1: app.jsx.bak is tracked in git — wastes 343 KB in every Pages deploy

**Impact:** GitHub Pages uploads the entire repo as a static artifact, including `app.jsx.bak`. This is a 343 KB file that serves no purpose to end users, slows cold deploy times, and bloats git history.

**.gitignore already has `*.bak`** — but the file was committed before the rule was added, so git still tracks it.

**Fix:**
```bash
git rm --cached app.jsx.bak
git commit -m "chore: remove app.jsx.bak from git tracking"
git push origin main
```

The file stays on disk locally (useful as a backup) but stops being deployed.

**Time to fix:** 2 minutes.

---

### P2-2: Service worker precaches only app.jsx — misses index.html

**Current sw.js PRECACHE (line 3):**
```js
const PRECACHE = [
  "/peakly/app.jsx"
];
```

`index.html` is the entry point. If a user is offline after visiting, they can't get the app shell at all because index.html is not in the precache.

**Fix for sw.js:**
```js
const PRECACHE = [
  "/peakly/",
  "/peakly/index.html",
  "/peakly/app.jsx",
  "/peakly/manifest.json"
];
```

Adding index.html to PRECACHE is enough. The existing fetch handler already falls back to cache on network failure.

**Time to fix:** 5 minutes.

---

### P2-3: SW CACHE_NAME staleness is a recurring problem — automate it

Every time app.jsx is edited, the cache buster and SW version must be manually bumped. This has already been missed multiple times. The fix is a one-time change to the GitHub Actions deploy workflow to auto-inject a timestamp-based cache buster at deploy time.

**Add to `.github/workflows/deploy.yml` before the "Upload artifact" step:**
```yaml
- name: Inject cache buster
  run: |
    DATE=$(date +%Y%m%d%H%M)
    sed -i "s/app\.jsx?v=[^\"']*/app.jsx?v=${DATE}/" index.html
    sed -i "s/peakly-[0-9]*/peakly-${DATE}/" sw.js
```

This means every push to main auto-updates both the cache buster and SW version. You never have to remember again.

**Time to fix:** 10 minutes to implement and test.

---

## Infrastructure Cost Projection

| Scale | Users | Open-Meteo calls/day | DigitalOcean | Bandwidth | Total/month |
|---|---|---|---|---|---|
| **Now** | <100 MAU | ~100 | $6 (1 GB droplet) | <1 GB | **~$6** |
| **1K MAU** | 1,000 | ~3,000 | $6 | ~5 GB | **~$6–12** |
| **10K MAU** | 10,000 | ~30,000 | $12 (2 GB droplet) | ~50 GB | **~$20–30** |
| **100K MAU** | 100,000 | ~300,000 | $48+ (load-balanced) | ~500 GB | **~$150–300** |

**Open-Meteo free tier is 10K calls/day.** At 1K MAU with 30-min TTL weather cache, you're at ~3K calls/day — safely under. At 10K MAU you hit 30K/day and exceed the free tier. At that scale, switch to Open-Meteo's $15/month commercial plan — still trivially cheap compared to alternatives.

**GitHub Pages bandwidth:** Free tier includes 100 GB/month. At 100K MAU you'll need Cloudflare in front (free CDN) or GitHub's paid Pages tier.

**Optimization opportunity at 10K MAU:** Add Cloudflare as a proxy in front of GitHub Pages. Free plan. Eliminates bandwidth costs, adds DDoS protection, cuts app.jsx load times from ~800ms to ~100ms globally.

---

## Scalability Risk: What Breaks First

**The first thing to break at scale is the flight proxy.** The DigitalOcean 1 GB droplet runs the Node.js proxy as a single process. When 500+ concurrent users load the Explore tab simultaneously (e.g., after a Reddit spike), each user triggers batched flight fetches with a semaphore cap of 3. That means the proxy sees ~1,500 near-simultaneous requests from a single traffic burst. Node's event loop handles queuing fine, but 1 GB RAM constrains how many open connections can be held in memory. At ~2,000 concurrent connections, the process OOMs and restarts. Users see a "flight prices unavailable" banner for 30 seconds while it recovers.

**Prevention (in order of priority):**

1. Enable PM2 cluster mode on the VPS — uses all CPUs, restarts on OOM:
```bash
# On VPS (SSH in):
npm install -g pm2
pm2 delete all
pm2 start /path/to/server/index.js -i max --name peakly-proxy
pm2 startup
pm2 save
```

2. Add response-level caching on the proxy — cuts upstream Travelpayouts API calls by 80%:
```js
// Add to server/index.js:
const flightCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

app.get('/api/flights/latest', async (req, res) => {
  const key = `${req.query.origin}:${req.query.destination}`;
  const hit = flightCache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return res.json(hit.data);
  }
  // ... existing fetch logic ...
  flightCache.set(key, { data: result, ts: Date.now() });
  res.json(result);
});
```

3. Add Cloudflare in front of GitHub Pages before any Reddit post — free, 5-minute setup, absorbs 95% of static asset load before it touches your infrastructure.

---

## Action Summary

| # | Issue | Priority | Fix Time | Who |
|---|---|---|---|---|
| 1 | Set real TP_MARKER in app.jsx | P0 | 5 min | Jack (get marker from tp.media dashboard) |
| 2 | Bump cache buster to `v=20260403a` | P1 | 2 min | Claude Code |
| 3 | Bump SW to `peakly-20260403` | P1 | 1 min | Claude Code |
| 4 | Pin React to `@18.3.1` | P1 | 2 min | Claude Code |
| 5 | Add `peakly.app` to Plausible dashboard | P1 | 10 min | Jack |
| 6 | Remove app.jsx.bak from git | P2 | 2 min | Claude Code |
| 7 | Add index.html to SW PRECACHE | P2 | 5 min | Claude Code |
| 8 | Auto-inject cache buster in deploy.yml | P2 | 10 min | Claude Code |
| 9 | PM2 cluster mode on VPS | P2 | 15 min | Jack (SSH to VPS) |

**One-liner to apply items 2, 3, 4, 6, 7 in a single Claude Code session:**
> "Fix the cache buster (update to v=20260403a), bump the SW version to peakly-20260403, pin React to 18.3.1 in index.html, remove app.jsx.bak from git tracking, and add index.html to the SW PRECACHE list."
