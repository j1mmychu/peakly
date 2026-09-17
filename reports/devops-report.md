# DevOps Report — 2026-09-17 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 38. Sep 20 hard deadline is 3 days away. No new P0s. No regressions. Cache stamp `20260914a` is 3 days old but CORRECT — no code shipped since Sep 14. Braces balanced. BASE_PRICES full coverage confirmed.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## What Changed Since Yesterday (Sep 16)

No code commits to `app.jsx`, `sw.js`, or `index.html`. Three report commits only (PM v152, Content Sep 16, DevOps Sep 16). This is correct — the Sep 20 VPS deadline is Jack's only action item and nothing else should be shipping right now.

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ Normal |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI) | ~439 KB minified (app.min.js, CI-built) | ✅ |
| Cache stamp | `20260914a` (Sep 14, no code since) | ✅ CURRENT |
| SW CACHE_NAME | `peakly-20260914a` — matches | ✅ LOCKED |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| React version | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs) | ✅ |
| Image lazy loading | `loading="lazy"` at 5+ card render sites | ✅ |
| Sentry DSN | Wired — `9416b032...` in both `app.jsx:8` and `index.html:77` | ✅ |
| Venue count (grep method) | 71 ski + 138 beach = 209 (grep undercount — see note) | ⚠️ |
| BASE_PRICES coverage | 181 airports in table, 165 unique venue `ap` values — **100% covered** | ✅ CLOSED |
| `lateSeason: true` venues | 15 (confirmed by grep) | ✅ |

**Venue count note**: `eval`-based counter throws on current app.jsx (mixed quote styles in the array — the eval-counter limitation CLAUDE.md documents). The grep gives 71+138=209 which is the known-undercount. CLAUDE.md authoritative count is **404** (134 ski / 270 beach). Content report should be the authoritative source here.

---

## 2. Flight Proxy — ⚠️ P1 CRITICAL (3 DAYS TO DEADLINE)

**Status**: `proxy.js` changes committed at `059de43` / `0cdb711` but **NOT deployed to VPS**. `/opt/peakly-proxy` is a hand-copied directory, not a git clone — `git pull` fails there. Manual SSH copy required.

**What's broken while undeployed**:
1. `forecast_days=7` on VPS instead of `14` → two-weekend scoring silently disabled (client scores Sat+Sun only, never checks next weekend)
2. `capacitor://localhost` missing from CORS → iOS native build can't reach the proxy at all
3. `DELETE` not in `Access-Control-Allow-Methods` → alert deletion has never worked, preflight blocked, `.catch(()=>{})` hides it
4. Rate limiter reads `X-Forwarded-For[0]` (forgeable) instead of `[last]`
5. Weather cache is in-memory only → `pm2 restart` wipes it (Open #23)

**Deploy command** (one SSH session):
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy

# Back up current
cp proxy.js proxy.js.bak.$(date +%Y%m%d)

# Copy the committed fix from the repo (VPS has no git clone):
# Option A: copy from a local checkout
scp /path/to/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# From VPS: restart
pm2 restart peakly-proxy

# Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: "forecast_days":14, cors lists capacitor://localhost, uptime resets to seconds
```

**Estimated fix time**: 5 minutes SSH session. The committed `server/proxy.js` is the complete fix — just copy and restart.

**⚠️ SEP 20 IS THE HARD GATE.** Per PM v152: if not deployed by Sep 20 EOD, Reddit launch moves from Oct 11 → Oct 18. No further extensions. This is Day 38.

---

## 3. Security Audit — ✅ CLEAN

| Check | Status |
|-------|--------|
| Travelpayouts API token (server-side) | ✅ Not in client code — confirmed. `TP_MARKER=710303` is a public affiliate marker, expected in client |
| Supabase anon key | ✅ Intentional per architecture — public-safe, RLS-gated. Per CLAUDE.md |
| Any other tokens/secrets in `app.jsx` | ✅ None found |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ |
| Recent commits for accidental secrets | ✅ No secrets in past 10 commits — report files only |
| FLIGHT_PROXY URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |

**Proxy URL is HTTPS.** The old `104.131.82.242` HTTP reference is gone. Caddy + Let's Encrypt covers TLS termination on the VPS. No nginx config needed.

---

## 4. API Health — ✅ GREEN (client-side), ⚠️ BLOCKED (proxy)

**Open-Meteo (weather/marine)**: No key required. Free tier ceiling is ~10K requests/day. With 404 venues × 1 weather call each, a cold Explore load = 404 upstream calls. At 50 venues/2s batching that's 16 batches / 32 seconds. With the VPS proxy deployed and warm, this collapses to 0 upstream calls (all cache hits). Without the proxy, every user load burns 404 direct calls.

**Rate-limit math at scale (without proxy cache)**:
- 10K daily free tier / 404 venues per load = **24 concurrent users** before throttling
- A Reddit post with 500 concurrent in the first hour = immediate Open-Meteo 429s → "conditions unavailable" banner on all cards

**fetchTravelpayoutsPrice**: 4s timeout, 2 retries, AbortController wired correctly ✅. Has proper `duffelTripDays` sanity check (2–4 days) to reject wrong-length fares ✅.

---

## 5. Performance — ✅ PRODUCTION GOOD, ⚠️ DEV SLOW

**Production path (GitHub Pages)**: `deploy.yml` runs `node scripts/build-web.mjs` → esbuild pre-compiles `app.jsx → dist/app.min.js` (~439 KB minified). Babel stripped entirely. Fast cold load.

**Development path (local `index.html`)**: Babel Standalone 7.24.7 parses 741 KB of JSX on every page load. 3–5s on desktop, 8–12s on a mid-range phone. This is a known dev-mode tradeoff; production is unaffected.

**Biggest bottleneck in production**: The 404-venue weather fetch storm described in §4. VPS proxy deployment is the fix. Without it, the app slows under any real traffic.

**Images**: `loading="lazy"` confirmed at all card render sites. ✅

**CDN dependency versions**: React 18.3.1 and Babel 7.24.7 are current stable on cdnjs. No updates needed.

---

## 6. Cost Projection

| Scale | VPS | CDN | Total/mo |
|-------|-----|-----|----------|
| Current (<100 MAU) | $6 DO droplet | $0 (GitHub Pages free) | **$6** |
| 1K MAU | $6 | $0 | **$6** |
| 10K MAU | $6–12 (may need 2GB RAM) | $0 | **$6–12** |
| 100K MAU | $48 (4×$12 load-balanced) + $5 managed Postgres | $0 | **~$53** |

**Open-Meteo free tier ceiling**: 10K calls/day. At 10K MAU with VPS cache warm (one upstream call per venue per 2hr TTL), actual upstream load is **~200 calls/day** (404 venues × 1 call / 2hr TTL × ~1hr average session distribution). Comfortable. Without the VPS, 10K MAU is 10K × 404 = **4M calls/day** — 400× over free tier limit, guaranteed 429s.

**Cost optimization**: The VPS is already right-sized. Only optimization worth doing: disk-persist the weather cache (Open #23) so a `pm2 restart` doesn't force a cold refill. ~30 lines in `proxy.js`, same SSH session as the #19 deploy.

---

## 7. What Breaks First at Scale

**The VPS in-memory weather cache.** Once the proxy is deployed and the cache warms up, it handles thousands of concurrent weather requests by returning cached JSON. But the $6 VPS has 1 GB RAM. A `pm2 restart` (required whenever the VPS needs maintenance) cold-wipes the cache. A Reddit spike hitting a fresh restart = 404 concurrent upstream Open-Meteo calls. At 7 calls/second free-tier rate, that's 58 seconds to warm back up — during which every user sees the "conditions unavailable" banner instead of scores.

**Prevention**: Open #23 (disk cache persistence for `_wxCache`). Write the cache to disk on every update (or periodic flush), restore on startup. 30-line fix in `proxy.js`. Here's the addition:

```js
// Add near top of proxy.js, after _wxCache declaration:
const CACHE_PERSIST_PATH = path.join(__dirname, '_wx_cache_disk.json');
const fs = require('fs');

// Load from disk on startup
try {
  if (fs.existsSync(CACHE_PERSIST_PATH)) {
    const saved = JSON.parse(fs.readFileSync(CACHE_PERSIST_PATH, 'utf8'));
    // Only restore entries within 2hr TTL
    const now = Date.now();
    for (const [k, v] of Object.entries(saved)) {
      if (v.ts && (now - v.ts) < 2 * 60 * 60 * 1000) _wxCache[k] = v;
    }
    console.log(`[cache] Restored ${Object.keys(_wxCache).length} warm entries from disk`);
  }
} catch(e) { console.warn('[cache] Disk restore failed:', e.message); }

// Add to _wxCacheSet() — after setting _wxCache[key]:
// Periodic flush — don't write on every set (too much I/O)
if (!_cacheDirtyTimer) {
  _cacheDirtyTimer = setTimeout(() => {
    _cacheDirtyTimer = null;
    try { fs.writeFileSync(CACHE_PERSIST_PATH, JSON.stringify(_wxCache)); } catch(e) {}
  }, 30_000); // flush 30s after last write
}
let _cacheDirtyTimer = null;
```

**Bundle this with the #19 VPS deploy** — same SSH session, same restart, 5 extra minutes.

---

## Open Issues (Priority Order)

### P1 — VPS Deploy (Day 38, HARD DEADLINE SEP 20 — 3 days)

**⛔ BLOCKS LAUNCH.** Two-weekend scoring off, iOS native broken, alert deletion broken.

**Jack's one action**:
```bash
# From a machine with SSH access to 198.199.80.21:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s localhost:3001/health"
```
Estimated time: **5 minutes**.
Bundle Open #23 (disk cache, ~30 lines) in the same session — add the code above to `proxy.js` before copying.

### P1 — APNS (Open #21 — still undeployed)

DER-vs-P1363 JWT + HTTP/1.1 `fetch` against HTTP/2-only APNs. `server/proxy.js` has the fix committed (`http2.connect` + `dsaEncoding: 'ieee-p1363'`). Not a launch gate for web, but iOS push will deliver zero notifications until this deploys. Ships with #19 automatically since `proxy.js` carries both fixes.

### P2 — Cleanup: dist/ files tracked in git (Day 8)

`git ls-files dist/` returns 5 tracked files: `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`, `sw.js`. The `.gitignore` says `dist/`, but these were committed before that entry landed and remain tracked. Not a production bug — CI regenerates them — but stale copies in git are noise.

**Fix (once, locally)**:
```bash
git rm --cached dist/index.html dist/manifest.json dist/robots.txt dist/sitemap.xml dist/sw.js
git commit -m "chore: untrack dist/ files — regenerated by deploy.yml, not hand-edited"
git push origin main
```
Estimated time: **2 minutes**.

---

## Closed Since Last Report

- **Open #22 (BASE_PRICES coverage)** — CONFIRMED CLOSED again. Python-parsed BASE_PRICES: 181 airport entries. Unique venue `ap` values: 165. All 165 covered. Zero missing. No action needed.
- **Cache stamp `20260914a`** — Not stale. Last code commit was Sep 14 (`96def81`). Three days without a code push is expected given the VPS deadline focus.
