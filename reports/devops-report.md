# DevOps Report — 2026-09-18 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 39. Sep 20 hard deadline is NOW 2 DAYS AWAY. No new P0s. No regressions. Cache stamp `20260914a` is 4 days old but CORRECT — no code shipped since Sep 14. Braces balanced 5682/5682. BASE_PRICES 100% confirmed (165/165 venue airports covered). VENUES count 404 (134 ski / 270 beach).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## What Changed Since Yesterday (Sep 17)

No code commits to `app.jsx`, `sw.js`, or `index.html`. Three report commits only (PM v153, Content Sep 17, DevOps Sep 17).

**VPS countdown ticked: 3 days → 2 days.** Sep 20 EOD is the last chance before the Reddit Oct 11 launch window closes. PM v153 formally documented the consequences: slip to Sep 20 → Reddit slides to Oct 18, one opening ski weekend gone.

Nothing new broke. Nothing new shipped. The code is frozen as intended.

---

## 1. Live Site Health — ✅ GREEN

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 14,237 | ✅ Normal |
| `app.jsx` size | 758,944 bytes (741 KB source) | ✅ |
| Built bundle (CI) | ~439 KB minified (app.min.js, CI-built from esbuild) | ✅ |
| Cache stamp | `20260914a` (Sep 14, no code since — CORRECT) | ✅ CURRENT |
| SW CACHE_NAME | `peakly-20260914a` — matches app.jsx | ✅ LOCKED |
| Brace balance | 5682 open / 5682 close — BALANCED | ✅ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io/peakly"` | ✅ |
| React version | 18.3.1 (cdnjs) | ✅ |
| Babel Standalone | 7.24.7 (cdnjs, dev only — stripped in prod build) | ✅ |
| Sentry DSN | Wired — `9416b032...` in app.jsx:8 and index.html:77 | ✅ |
| Image lazy loading | `loading="lazy"` at 9 card render sites | ✅ |
| VENUES count | 404 (134 ski + 270 beach) — matches CLAUDE.md | ✅ |
| `lateSeason:true` count | 15 venues | ✅ |
| BASE_PRICES coverage | 181 entries, 165 unique venue `ap` values — **100% covered** | ✅ CLOSED |

**Note on cache stamp age**: 4 days without a code push is CORRECT and expected. The code is deliberately frozen while Jack handles the VPS deploy. The stamp only needs to bump when code ships.

---

## 2. Flight Proxy Status — 🔴 RED (Day 39, 2 days to deadline)

**Status**: `proxy.js` changes committed (`059de43` / `0cdb711`) but **NOT deployed to VPS**. `/opt/peakly-proxy` is a hand-copied directory — `git pull` fails there. Manual SSH copy required.

**What's broken while undeployed** (unchanged from Day 1 of this finding):

1. `forecast_days=7` on VPS instead of `14` → two-weekend scoring silently disabled
2. `capacitor://localhost` missing from CORS → iOS native build blocks all proxy calls
3. `DELETE` not in `Access-Control-Allow-Methods` → alert deletion silently broken (preflight blocked, `.catch(()=>{})` hides it)
4. Rate limiter reads `X-Forwarded-For[0]` (forgeable) instead of last entry
5. Weather cache in-memory only → `pm2 restart` wipes it (Open #23)

**Committed proxy.js already has all fixes**: `forecast_days=14`, `capacitor://localhost` in CORS, `DELETE` in allowed methods, rate limiter fixed, `http2` + `dsaEncoding: 'ieee-p1363'` for APNS. Bundle with disk-cache addition (30 lines, below) before copying.

**Jack's exact deploy command** (5 minutes from a machine with SSH access):

```bash
# Step 1: Add disk cache to proxy.js locally (see §7 for the 30-line addition)
# Step 2: Copy and restart
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health | python3 -m json.tool"
```

**Verify**: `curl -s https://peakly-api.duckdns.org/health` should return `forecast_days:14`, `apns:configured` (or `unconfigured`), and fresh uptime seconds.

---

## 3. Weather & External APIs — ✅ GREEN (client-side)

Open-Meteo integration in `app.jsx` is unchanged and correct:
- Weather: `forecast_days=7` from client direct-calls (the proxy uses 14 when deployed)
- Marine: `forecast_days=10` — correct
- Batch fetch: 50 venues per 2-second interval — within free tier (rate limit: ~600 req/min)
- Cache: 2-hour TTL in localStorage — correct
- Fallback path: direct Open-Meteo if proxy unreachable — verified still present

No rate limit concerns at current <10 MAU. Reddit launch spike is the risk (see §7).

---

## 4. Security Audit — ✅ GREEN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ❌ NOT FOUND — only `TP_MARKER = "710303"` (public affiliate marker, not a secret) | ✅ |
| Supabase anon key in client | Present (`eyJhbGci...`) — expected, public-safe per RLS design | ✅ |
| `.env` in .gitignore | ✅ — `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8` all gitignored | ✅ |
| Recent commits with secrets | No secrets found in last 10 commits (report + cache stamp only) | ✅ |
| Sentry DSN | Wired and active | ✅ |
| `server/proxy.js` TOKEN | Server-only `process.env.TRAVELPAYOUTS_TOKEN` — never touches client | ✅ |

**Supabase anon key note**: The JWT in `SUPABASE_ANON_KEY` is intentionally public (it's the Supabase "anon" role, restricted by Row Level Security). This is standard Supabase architecture, not a leak. Per CLAUDE.md: "public-safe, RLS-gated."

---

## 5. Performance Analysis — 🟡 YELLOW (Babel in dev only)

| Layer | Size | Notes |
|-------|------|-------|
| app.min.js (prod) | ~439 KB minified | CI-built via esbuild, no Babel |
| app.jsx (dev) | 741 KB source | Babel-transpiled in-browser (dev only) |
| React 18.3.1 UMD | ~133 KB gzipped | Cached by CDN |
| ReactDOM 18.3.1 UMD | ~45 KB gzipped | Cached by CDN |
| Babel Standalone 7.24.7 | ~900 KB | DEV only — stripped in `dist/` via build-web.mjs |
| Supabase JS | ~80 KB gzipped | Lazy-loaded (only on auth) |

**Biggest performance bottleneck**: Still the prod load sequence — React UMD + Sentry SDK + app.min.js is ~617 KB of blocking JS before first render. On a mid-tier Android at 4G that's ~2-3s TTI. This is acceptable for launch; the Babel wall (3-5s) was the real problem and it's fixed.

**Image loading**: `loading="lazy"` at 9 render sites — correct.

**CDN versions**: React 18.3.1 is not the absolute latest (18.3.x series is latest stable) — no security vulnerabilities known, no action needed.

---

## 6. Cost Estimate

| Scale | Infra cost | Notes |
|-------|-----------|-------|
| Current (<10 MAU) | $6/month | DigitalOcean 1GB VPS + GitHub Pages (free) |
| 1K MAU | $6/month | Pages handles static; VPS handles proxy — no scaling needed |
| 10K MAU | $12-18/month | Upgrade to 2GB VPS; Pages still free |
| 100K MAU | $48-72/month | 4-8GB VPS or small cluster behind LB; consider Cloudflare Workers for proxy |

**Optimization opportunity**: Disk-persist the weather cache (Open #23). At 10K MAU a cold restart costs ~$0 in infra but every user sees the "conditions unavailable" banner for 60s — the UX cost is real. 30 lines of code, same deploy as #19.

---

## 7. What Breaks First at Scale

**The VPS in-memory weather cache.** Once deployed, the proxy handles thousands of weather requests via shared cache. But 1GB RAM + in-memory-only storage means: one `pm2 restart` (for maintenance, OS updates, or an OOM kill) wipes 595 cache entries. At a Reddit spike, that's hundreds of simultaneous cold misses → 400+ upstream Open-Meteo calls → 58s to re-warm at the free-tier rate of 7 req/sec → every user sees "conditions unavailable" for almost a minute.

**Prevention**: Open #23 (disk cache persistence). Bundle it with the Sep 20 VPS deploy. 30-line addition to `proxy.js`:

```js
// Add near top of proxy.js, after _wxCache declaration:
const CACHE_PERSIST_PATH = path.join(__dirname, '_wx_cache_disk.json');

// Load from disk on startup
try {
  if (fs.existsSync(CACHE_PERSIST_PATH)) {
    const saved = JSON.parse(fs.readFileSync(CACHE_PERSIST_PATH, 'utf8'));
    const now = Date.now();
    for (const [k, v] of Object.entries(saved)) {
      if (v.ts && (now - v.ts) < 2 * 60 * 60 * 1000) _wxCache[k] = v;
    }
    console.log(`[cache] Restored ${Object.keys(_wxCache).length} warm entries from disk`);
  }
} catch(e) { console.warn('[cache] Disk restore failed:', e.message); }

// Periodic flush helper — call after every _wxCache write:
let _cacheDirtyTimer = null;
function _scheduleFlush() {
  if (_cacheDirtyTimer) return;
  _cacheDirtyTimer = setTimeout(() => {
    _cacheDirtyTimer = null;
    try { fs.writeFileSync(CACHE_PERSIST_PATH, JSON.stringify(_wxCache)); }
    catch(e) { console.warn('[cache] Disk flush failed:', e.message); }
  }, 30_000); // flush 30s after last write
}
```

Then call `_scheduleFlush()` wherever `_wxCache[key] = ...` is set.

---

## Open Issues (Priority Order)

### P1 — VPS Deploy (Day 39, **HARD DEADLINE SEP 20 — 2 DAYS FROM NOW**)

**⛔ BLOCKS LAUNCH.** Two-weekend scoring off. iOS native broken. Alert deletion broken. Rate limiter exploitable. Cache will cold-wipe on next restart.

This is the same P1 for the 6th consecutive daily report. Sep 20 EOD is the line. Miss it → Reddit slides to Oct 18.

**Jack's action** (5 minutes):
```bash
# Before copying: add Open #23 disk cache (30 lines above) to server/proxy.js locally
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health"
```
Expected health output: `forecast_days:14`, `apns:unconfigured` (or `configured` if APNS keys were set), uptime in seconds.

### P1 — APNS (Open #21 — ships automatically with VPS redeploy)

DER-vs-P1363 JWT + HTTP/1.1 `fetch` against HTTP/2-only APNs. The committed `proxy.js` carries the fix (`http2.connect` + `dsaEncoding: 'ieee-p1363'`). Not a launch gate for web, but iOS push is dead until this deploys. It ships automatically with the #19 deploy — no extra action.

### P2 — dist/ files tracked in git (Day 9, carry)

`git ls-files dist/` returns 5 tracked files (`index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`, `sw.js`). CI regenerates all of these — the tracked copies are stale noise. Not a bug, but it means 5 files in the git tree that nobody should be editing.

**Fix** (2 minutes, defer until after VPS deploy):
```bash
git rm --cached dist/index.html dist/manifest.json dist/robots.txt dist/sitemap.xml dist/sw.js
git commit -m "chore: untrack dist/ files — CI-regenerated, not hand-edited"
git push origin main
```

---

## Closed Since Last Report

- **Open #22 (BASE_PRICES coverage)** — CONFIRMED CLOSED again. 181 airport entries in BASE_PRICES, 165 unique venue `ap` values, 0 missing. 100% coverage. Done.
- **Cache stamp `20260914a`** — Not stale. Last code commit was `96def81` Sep 14. Code freeze is correct given the VPS deadline focus.
- **Brace balance** — 5682/5682, balanced. No JSX parse risk.
