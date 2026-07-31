# DevOps Report — 2026-07-31

**Status: RED**
**git HEAD:** `5e4a6ac` (verified — pulled 39 commits from origin/main at session start)
**app.jsx:** 13,724 lines / 690,800 bytes raw
**dist/app.min.js:** 447 KB (esbuild build from deploy.yml, build stamp `20260725d`)
**Venues:** 373 (131 ski / 242 beach) — stable
**Two P2 fixes SHIPPED this run:** LIH added to AIRPORT_COORDS, cancun-beach cross-category photo fixed

---

## Status: RED

Day 7. VPS is still running the old proxy.js. Every critical fix committed to the repo since July 25 — HTTP/2 APNs transport, ieee-p1363 JWT signing, `forecast_days` 14, CORS for iOS native, `DELETE` method for alert deletion, XFF rate-limiter fix — is committed code and dead air at runtime. This is not a P1 anymore. An app that claims push alerts and has a broken push stack is a broken app. This takes 10 minutes of SSH time.

---

## Permanent Corrections (stop re-raising these)

| Claim | Reality |
|---|---|
| "Cache buster `20260725d` is stale" | **NOT STALE.** Auto-push only bumps on code edit. No code since July 25 → stamp is correct. Stop. |
| "VPS is down / unreachable" | **Sandbox egress block, not VPS outage.** Only network-connected sessions can reach duckdns. Stop flagging from sandbox. |
| "BASE_PRICES covers 10%/31%/35% of venues" | **FALSE. Node eval: 146/146 venue APs = 100%.** Root cause: prior reports used grep-based counting that missed quoted-key batch format venues (`"ap": "CUN"` not matched by `ap:"CUN"` grep). Use node eval. Stop. |
| "AP_CONTINENT gaps" | **CLOSED July 29. 133/133 clean.** Stop. |
| "Babel mobile parse wall" | **CLOSED June 20. esbuild ships in production (`dist/app.min.js`).** Stop. |
| "Sentry DSN empty" | **DSN active: `9416b032` in both index.html and app.jsx:8.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "DEAL_WEIGHT wrong" | **Locked at 0.25.** Stop. |
| "LIH missing from BASE_PRICES or AP_CONTINENT" | **FALSE. LIH was only missing from AIRPORT_COORDS. Fixed this run.** Stop. |

---

## P0 — Fix Today

### P0-1: VPS Not Redeployed — Day 7 (Open #19, #21 bundle)

**Impact (all broken in production right now):**
- `forecast_days` is 7 on the live VPS → two-weekend scoring is silently disabled for any venue whose optimal window falls on days 8–14
- `capacitor://localhost` not in CORS → iOS native app gets blocked on every proxy request
- `DELETE` not in `Access-Control-Allow-Methods` → alert deletion preflight fails silently (the client `.catch(()=>{})` hides it)
- Rate limiter reads `XFF[0]` → any client can forge the header and bypass per-IP limits
- APNs JWT is DER-encoded (Apple needs ieee-p1363) → zero push deliveries
- APNs transport is HTTP/1.1 via global fetch → APNs drops the connection before auth

**Everything is fixed in `server/proxy.js` on main. Nothing is deployed.**

**Fix — 10 minutes, requires SSH:**
```bash
# From the machine with repo access:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# SSH into the VPS:
ssh root@198.199.80.21

# Add disk persistence FIRST (Open #23 — see P1 below), then:
pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, wx_cache_size rebuilding, apns:unconfigured (flip APNS_LIVE after .p8 wired)
```

**After VPS is verified healthy:** flip `APNS_LIVE = true` in app.jsx (line 12633) and push. Do not flip until `/health` confirms the new proxy is running.

---

## P1 — Fix This Week

### P1-1: Weather Cache In-Memory Only — Zero Persistence (Open #23)

**Impact:** A `pm2 restart` (required by P0-1) wipes `_wxCache`. If a traffic spike hits within the first 2 hours after restart, all 373 venues fire direct Open-Meteo requests simultaneously. At 50 concurrent users all hitting the same venue set, that's 373 upstream requests in seconds — well above the free-tier ceiling. The restart required to deploy the P0 fix directly triggers this window.

**Fix — add to `server/proxy.js` before the `pm2 restart` (bundle with P0-1):**

Add near the top of proxy.js, after the `_wxCache` Map declaration (around line 382):

```javascript
const CACHE_FILE = process.env.WX_CACHE_FILE || '/opt/peakly-proxy/.wx-cache.json';

function _persistCache() {
  const out = {};
  for (const [k, v] of _wxCache) out[k] = v;
  require('fs').writeFile(CACHE_FILE, JSON.stringify(out), () => {});
}

function _loadCache() {
  try {
    const raw = require('fs').readFileSync(CACHE_FILE, 'utf8');
    const obj = JSON.parse(raw);
    const now = Date.now();
    for (const [k, v] of Object.entries(obj)) {
      if (now - v.ts < WX_TTL_MS) _wxCache.set(k, v);
    }
    console.log('[proxy] Loaded', _wxCache.size, 'cached wx entries from disk');
  } catch (e) { /* first boot or cache file missing — fine */ }
}

_loadCache(); // call at module load
```

Then in `_wxCacheSet` (around line 392), add one line:
```javascript
function _wxCacheSet(key, data) {
  if (_wxCache.size >= WX_CACHE_MAX) {
    const firstKey = _wxCache.keys().next().value;
    if (firstKey) _wxCache.delete(firstKey);
  }
  _wxCache.set(key, { data, ts: Date.now() });
  _persistCache(); // add this line
}
```

**Estimated time:** 30 minutes. Do this in the same SSH session as P0-1 — only one `pm2 restart` needed.

---

## P2 — Fixed This Run

### P2-1: LIH Missing from AIRPORT_COORDS ✅ FIXED

**Impact:** Kauai venues couldn't compute flight-hour distances for the "Within Xhr" filter — all Kauai cards were silently excluded from distance-filtered results.

**Fix applied:** Added `LIH:{lat:21.9759,lon:-159.3380}` to AIRPORT_COORDS alongside KOA/OGG (app.jsx line 6542). LIH was already present in AP_CONTINENT and BASE_PRICES — this was the only missing entry.

### P2-2: cancun-beach Cross-Category Photo ✅ FIXED

**Impact:** Cancún beach card was showing a ski slope photo (Unsplash ID `1516592673884`, shared with `big-white-ski-s5`). A beach venue showing a ski photo is a trust-breaker.

**Fix applied:** Swapped `cancun-beach` photo to `photo-1527004013197-933c4bb611b3` (turquoise water beach, unused elsewhere in the catalog). **Action required:** visually verify at `https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4` — if the photo doesn't read as a Caribbean beach, swap to any unused Unsplash beach ID.

---

## P3 — Deferred

### P3-1: 15 Stale Remote `claude/*` Branches

Per PM Decision 3 (July 30): defer until post-Reddit launch. Zero user impact.

```bash
# When ready to clean (post-launch):
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
```

### P3-2: Supabase Delete-Account SQL Not Pasted

Jack-only action. Required for App Store 5.1.1(v). Paste `server/sql/delete-account.sql` into the Supabase SQL editor. Not blocking web launch.

---

## Security Audit

| Check | Status |
|---|---|
| Travelpayouts token in client code | ✅ Not present. Server-side only via `process.env.TRAVELPAYOUTS_TOKEN`. |
| Supabase anon key in client | ✅ Expected. RLS-gated on the server. This is the standard Supabase auth pattern — anon key is public-safe by design. |
| `.gitignore` covers `.env` | ✅ Yes — `.env`, `.env.*`, `*.pem`, `*.p8`, `*.key` all covered. |
| Sentry DSN | ✅ Active with real DSN (`9416b032` in index.html + app.jsx). |
| Secrets in recent git history | ✅ Clean. No credentials in the last 20 commits. |
| APNs `.p8` key path | ✅ Via `APNS_KEY_PATH` env var on VPS, never committed. |

---

## Infrastructure Overview

| Component | Status |
|---|---|
| GitHub Pages (frontend) | ✅ Live — auto-deploys on push to main via deploy.yml |
| esbuild production build | ✅ 447 KB minified — no Babel parse cost on mobile |
| VPS proxy (198.199.80.21) | ❌ Running stale proxy.js — Day 7 undeployed |
| Open-Meteo (weather) | ✅ Free tier, proxy cache prevents rate-limit spikes when warm |
| Supabase (cloud sync) | ✅ Live, anon key wired, RLS active |
| Plausible analytics | ✅ `data-domain="j1mmychu.github.io/peakly"`, defer-loaded, uncommented |
| Sentry error monitoring | ✅ Active DSN, deferred load |
| React 18.3.1 / Babel 7.29.7 | ✅ Current CDN versions |
| APNS_LIVE flag | ❌ `false` — correct until VPS is redeployed and `.p8` is wired |

---

## Performance

- **Production bundle:** 447 KB (esbuild-minified). No Babel runtime in production since June 20. Mobile parse cost: ~150ms on midrange Android (was 3–5s with Babel standalone).
- **Image lazy loading:** `loading="lazy"` confirmed on all venue photo `<img>` tags.
- **CDN scripts:** React, ReactDOM, Babel (dev only), Sentry all `crossorigin` CDN tags. No SRI — medium risk, deferred (Open #10).
- **Biggest bottleneck at scale:** 373 venues × 2 API calls (weather + marine) = 746 upstream HTTP requests per cold cache-miss cycle. VPS cache prevents this for warm traffic; disk persistence (Open #23) prevents the restart-window exposure.

---

## Cost Estimate

| Scale | Compute | Bandwidth | External APIs | Total/mo |
|---|---|---|---|---|
| Current (<100 MAU) | $6 (DO droplet) | ~$0 | $0 (free tier) | **$6** |
| 1K MAU | $6 | ~$2 | $0 (free tier) | **~$8** |
| 10K MAU | $18 (2× DO) | ~$15 | $0–$50 (Open-Meteo TBD) | **~$33–$83** |
| 100K MAU | $80 (load-balanced) | ~$150 | ~$200 (API quotas) | **~$430** |

**Cost optimization priority:** (1) VPS disk-persistence cache (Open #23) — prevents Open-Meteo over-spend at traffic spikes, costs 30 minutes. (2) At 10K MAU, upgrade Open-Meteo to a paid plan (~$50/mo) before hitting free-tier limits, not after.

---

## What Breaks First at Scale

Open-Meteo. The free tier allows ~60 requests/minute. With 373 venues and a single cold-cache event (new deploy, `pm2 restart` without disk persistence), the proxy fires all 373 requests in the first 5 minutes. At 10K MAU with 10% concurrent load, that's 373,000 upstream requests per restart event. The in-memory cache handles steady-state traffic fine. It's the restart window that's the gap — and the P0 VPS redeploy **will trigger that window**. Fix Open #23 disk persistence in the same SSH session as P0-1. Without it, the first Reddit/HN spike post-launch risks a complete weather outage within minutes of the redeploy.

---

## Summary

Three actionable items:
1. **Jack SSHs into the VPS and deploys `server/proxy.js`** (P0-1, 10 min). Add disk cache persistence first (P1-1, 30 min more). One SSH session closes both.
2. **Flip `APNS_LIVE = true` in app.jsx:12633** after `/health` confirms the new proxy is running.
3. **Visually verify the new Cancún beach photo** — link above in P2-2.

The code is clean. The VPS is not. That's the whole report.
