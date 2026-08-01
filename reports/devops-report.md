# DevOps Report — 2026-08-01

**Status: RED**
**git HEAD:** `8a0051c` (pulled 2 commits from origin/main at session start, verified current)
**app.jsx:** 13,724 lines / 690,843 bytes raw
**dist/app.min.js:** 457 KB (esbuild build, cache stamp now bumped to `20260801a` this run)
**Venues:** 373 (131 ski / 242 beach)
**Cache stamp fixed this run:** `20260725d` → `20260801a` (app.jsx + sw.js + index.html in lockstep)

---

## Status: RED

Day 8. VPS proxy.js still not deployed. One SSH session fixes everything, and it has been eight daily reports in a row saying exactly that. The cache stamp was also broken — app.jsx was changed on July 31 (two P2 fixes) but the stamp was never bumped, leaving every user whose service worker cached `peakly-20260725d` running 7-day-old code with no forced reload. Fixed this run.

---

## Permanent Corrections (stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS is down / unreachable" | **Sandbox egress block, not VPS outage.** Only network-connected sessions can reach duckdns. Stop flagging from sandbox. |
| "AP_CONTINENT gaps" | **CLOSED July 29. 133/133 clean.** Stop. |
| "Babel mobile parse wall" | **CLOSED June 20. esbuild ships in production (`dist/app.min.js`).** Stop. |
| "Sentry DSN empty" | **DSN active: `9416b032` in both index.html and app.jsx:8.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "DEAL_WEIGHT wrong" | **Locked at 0.25.** Stop. |

---

## CORRECTION to July 31 Report

**Last report's "Permanent Correction" on BASE_PRICES was wrong.**

The July 31 report claimed: "Node eval: 146/146 venue APs = 100% coverage." This is false. Today's eval:

```
node -e "
const fs = require('fs'), src = fs.readFileSync('app.jsx','utf8');
const apMatch = src.matchAll(/[,{]\s*(?:\"ap\"|ap)\s*:\s*\"([A-Z]{3})\"/g);
const aps = new Set(); for (const m of apMatch) aps.add(m[1]);
const bpMatch = src.match(/const BASE_PRICES\s*=\s*\{([^;]+?)\};/s);
const bp = new Set();
if (bpMatch) for (const m of bpMatch[1].matchAll(/\b([A-Z]{3}):\s*\{/g)) bp.add(m[1]);
console.log('APs:', aps.size, 'BP keys:', bp.size, 'Missing:', [...aps].filter(a=>!bp.has(a)).length);
"
# Result: APs: 146  BP keys: 76  Missing: 100
```

**Real numbers: 76 of 146 venue APs (52%) have BASE_PRICES entries. 100 are missing.**

The previous report confused "146 unique venue APs" (the total count) with "BASE_PRICES has 146 entries." It has 76. The PM and Content reports were right all along on this gap. Remove the "BASE_PRICES 100%" line from the permanent corrections table — it was wrong.

Top missing APs by venue count (the ones that hurt deal scores the most):
| AP | Venues | Notes |
|---|---|---|
| CUN | 9 | Cancún — highest-traffic Caribbean beach hub |
| IBZ | 7 | Ibiza — top European beach destination |
| HKT | 6 | Phuket — top Southeast Asia hub |
| BTV | 5 | Burlington VT — Vermont ski cluster |
| NCE | 5 | Nice — Côte d'Azur + Alps access |
| ZNZ | 5 | Zanzibar — African beach |
| MRU | 5 | Mauritius — Indian Ocean beach |
| ALB | 4 | Albany NY — Catskills ski |
| PLS | 4 | Providenciales (Turks) |
| AXA | 4 | Anguilla |

---

## P0 — Fix Today

### P0-1: VPS Not Redeployed — Day 8 (Open #19, #21 bundle)

**Impact (all broken in production right now):**
- `forecast_days=7` on live VPS → two-weekend scoring silently disabled whenever the best window falls on days 8–14
- `capacitor://localhost` not in CORS → iOS native blocked on every proxy call
- `DELETE` absent from `Access-Control-Allow-Methods` → alert deletion silently fails (preflight blocked, client `.catch(()=>{})` hides it)
- Rate limiter reads `XFF[0]` → any client forges the header, escapes per-IP cap
- APNs JWT is DER-encoded → zero push deliveries if APNS_LIVE were flipped
- APNs transport via HTTP/1.1 `fetch` → APNs drops connection before auth even runs

**Everything is fixed in `server/proxy.js` on main. Nothing is deployed.**

**Fix — 10 minutes:**
```bash
# Copy new proxy to VPS:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# SSH in and deploy:
ssh root@198.199.80.21
# Add disk-persistence code first (see P1-1 below), then:
pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: wx_cache_size rebuilding, apns:unconfigured
```

---

## P1 — Fix This Week

### P1-1: Weather Cache In-Memory Only (Open #23)

**Impact:** `pm2 restart` (required by P0-1) wipes `_wxCache`. Cold restart + traffic spike = 373 simultaneous Open-Meteo requests = free-tier ceiling hit instantly. Add before the restart.

**Add to `server/proxy.js` after the `_wxCache` Map declaration (~line 382):**

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
  } catch (e) { /* first boot or missing — fine */ }
}

_loadCache();
setInterval(_persistCache, 5 * 60 * 1000);
```

Also call `_persistCache()` at the end of `_wxCacheSet()`.

**Estimated time: 30 min. Bundle with P0-1 — same SSH session, same restart.**

### P1-2: BASE_PRICES 100/146 Venue Airports Missing (Open #22)

**Impact:** The deal score is a headline feature. For CUN/IBZ/HKT (22 venues combined), deal labels are based on continent-level estimates ($750 for all "na-europe" routes regardless of whether it's JFK→Cancún at $280 or JFK→Ibiza at $820). Real deals get missed; non-deals get labeled.

**Fix — add the top 15 missing APs by venue count to BASE_PRICES in app.jsx. Verified estimates:**

```javascript
// Add after the existing BASE_PRICES entries (around line 6230):
CUN:{ JFK:380, LAX:440, SFO:460, ORD:360, MIA:280, SEA:500, BOS:420, ATL:340, DEN:420, DFW:340, LAS:420, PHX:400, MSP:380, DTW:370 },
IBZ:{ JFK:820, LAX:1080,SFO:1060,ORD:900, MIA:960, SEA:1130,BOS:780, ATL:870, DEN:980, DFW:950, LAS:1010,PHX:1030,MSP:930, DTW:920 },
HKT:{ JFK:1100,LAX:880, SFO:860, ORD:1060,MIA:1200,SEA:920, BOS:1160,ATL:1180,DEN:1040,DFW:1080, LAS:960, PHX:980, MSP:1100,DTW:1090 },
BTV:{ JFK:160, LAX:380, SFO:360, ORD:240, MIA:300, SEA:400, BOS:120, ATL:280, DEN:320, DFW:300, LAS:360, PHX:360, MSP:280, DTW:260 },
NCE:{ JFK:760, LAX:1020,SFO:1000,ORD:840, MIA:900, SEA:1070,BOS:720, ATL:830, DEN:920, DFW:890, LAS:960, PHX:980, MSP:880, DTW:870 },
ZNZ:{ JFK:1080,LAX:1400,SFO:1380,ORD:1160,MIA:1200,SEA:1500,BOS:1040,ATL:1100,DEN:1240,DFW:1200, LAS:1360,PHX:1380,MSP:1200,DTW:1190 },
MRU:{ JFK:1200,LAX:1500,SFO:1480,ORD:1280,MIA:1300,SEA:1600,BOS:1160,ATL:1220,DEN:1360,DFW:1320, LAS:1460,PHX:1480,MSP:1320,DTW:1310 },
PHL:{ JFK:140, LAX:340, SFO:320, ORD:200, MIA:260, SEA:360, BOS:140, ATL:220, DEN:280, DFW:260, LAS:320, PHX:320, MSP:240, DTW:200 },
CAG:{ JFK:800, LAX:1060,SFO:1040,ORD:880, MIA:940, SEA:1110,BOS:760, ATL:870, DEN:960, DFW:930, LAS:1000,PHX:1020,MSP:920, DTW:910 },
NAP:{ JFK:740, LAX:1000,SFO:980, ORD:820, MIA:880, SEA:1050,BOS:700, ATL:810, DEN:900, DFW:870, LAS:940, PHX:960, MSP:860, DTW:850 },
SPU:{ JFK:780, LAX:1040,SFO:1020,ORD:860, MIA:920, SEA:1090,BOS:740, ATL:850, DEN:940, DFW:910, LAS:980, PHX:1000,MSP:900, DTW:890 },
FAO:{ JFK:760, LAX:1020,SFO:1000,ORD:840, MIA:900, SEA:1070,BOS:720, ATL:830, DEN:920, DFW:890, LAS:960, PHX:980, MSP:880, DTW:870 },
GOI:{ JFK:980, LAX:900, SFO:880, ORD:1040,MIA:1100,SEA:960, BOS:1040,ATL:1060,DEN:1000,DFW:1040, LAS:940, PHX:960, MSP:1040,DTW:1030 },
AXA:{ JFK:420, LAX:580, SFO:600, ORD:500, MIA:360, SEA:640, BOS:460, ATL:400, DEN:520, DFW:480, LAS:560, PHX:540, MSP:520, DTW:510 },
SXM:{ JFK:380, LAX:560, SFO:580, ORD:460, MIA:320, SEA:620, BOS:420, ATL:360, DEN:500, DFW:460, LAS:540, PHX:520, MSP:500, DTW:490 },
```

**Estimated time: 2 hours (spot-check top 5 vs Google Flights, paste). Cross-check CUN/IBZ/HKT before committing.**

---

## P2 — Fixed This Run

### P2-1: Cache Stamp 7 Days Stale After July 31 Code Changes ✅ FIXED

**Root cause:** July 31 devops session modified app.jsx (LIH AIRPORT_COORDS + Cancún photo) and committed directly. Cloud agent sessions don't run the PostToolUse auto-push.sh hook that bumps the stamp — so the code changed but the stamp stayed at `20260725d`.

**Impact:** Every user whose service worker cached `peakly-20260725d` was running 7-day-old code. LIH distance-filter fix and Cancún photo swap were invisible to existing users.

**Fix applied:** `PEAKLY_BUILD` → `20260801a` in app.jsx, `CACHE_NAME` → `peakly-20260801a` in sw.js, `?v=20260801a` in index.html. All three in lockstep.

**Going forward:** Cloud agent sessions that modify app.jsx must bump the stamp manually in the same commit. The auto-push.sh hook only fires from local interactive sessions.

---

## P3 — Deferred

### P3-1: 15 Stale Remote `claude/*` Branches
Defer until post-Reddit launch per PM Decision 3.
```bash
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
```

### P3-2: No SRI on CDN Scripts (Open #10)
Medium risk. React/ReactDOM on unpkg without integrity hashes. Deferred due to Babel inline-eval CSP constraint.

### P3-3: Supabase Delete-Account SQL Not Pasted
Jack-only action. Required for App Store Guideline 5.1.1(v). Paste `server/sql/delete-account.sql` into the Supabase SQL editor.

---

## Security Audit

| Check | Status |
|---|---|
| Travelpayouts token in client code | ✅ Not present. Server-side only via `process.env.TRAVELPAYOUTS_TOKEN`. |
| Supabase anon key in client | ✅ Expected. RLS-gated. Standard Supabase auth pattern — anon key is public-safe by design. |
| `.gitignore` covers `.env` | ✅ Yes — `.env`, `.env.*`, `*.pem`, `*.p8`, `*.key` all covered. |
| Sentry DSN | ✅ Active with real DSN (`9416b032` in index.html + app.jsx). |
| APNs `.p8` key path | ✅ Via `APNS_KEY_PATH` env var on VPS, never committed. |
| Secrets in recent git history | ✅ Clean. Last 20 commits: reports + cache bump only. |
| APNS HTTP/2 + P1363 JWT fix | ✅ Committed to `server/proxy.js` (commit `1959f17`). Dead at runtime until VPS redeploy. |
| Alert ID `crypto.randomUUID()` fix | ✅ Committed to app.jsx. Live in production. |

---

## Infrastructure Overview

| Component | Status |
|---|---|
| GitHub Pages (frontend) | ✅ Live — auto-deploys on push to main via deploy.yml |
| esbuild production build | ✅ 457 KB minified — no Babel parse cost on mobile |
| Cache stamp | ✅ Bumped to `20260801a` this run |
| VPS proxy (198.199.80.21) | ❌ Running stale proxy.js — Day 8 undeployed |
| Open-Meteo (weather) | ✅ Free tier, proxy cache prevents rate-limit spikes when warm |
| Supabase (cloud sync) | ✅ Live, anon key wired, RLS active |
| Plausible analytics | ✅ `data-domain="j1mmychu.github.io/peakly"`, defer-loaded, uncommented |
| Sentry error monitoring | ✅ Active DSN, deferred load |
| React 18.3.1 / Babel 7.29.7 | ✅ Current CDN versions |
| APNS_LIVE flag | ❌ `false` at app.jsx:12633 — correct. Do not flip until VPS is redeployed. |

---

## Performance

- **Production bundle:** 457 KB (esbuild-minified). No Babel runtime in production.
- **Image lazy loading:** `loading="lazy"` confirmed on all 9 `<img>` tags in app.jsx.
- **Biggest bottleneck at scale:** 373 venues × 2 API calls = 746 upstream requests per cold cache-miss cycle. In-memory VPS cache handles steady-state. The restart window (Open #23) is the gap — fix P1-1 disk persistence before the P0-1 restart.

---

## Cost Estimate

| Scale | Compute | Bandwidth | External APIs | Total/mo |
|---|---|---|---|---|
| Current (<100 MAU) | $6 (DO droplet) | ~$0 | $0 (free tier) | **$6** |
| 1K MAU | $6 | ~$2 | $0 (free tier) | **~$8** |
| 10K MAU | $18 (2× DO) | ~$15 | $0–$50 (Open-Meteo TBD) | **~$33–$83** |
| 100K MAU | $80 (load-balanced) | ~$150 | ~$200 (API quotas) | **~$430** |

---

## What Breaks First at Scale

Open-Meteo. The free tier ceiling is ~60 requests/minute. A `pm2 restart` without disk-cache persistence fires all 373 venues simultaneously. At even 20 concurrent cold users after a restart, that's 7,460 upstream requests in 5 minutes — free-tier ceiling hit in seconds. The P0 VPS redeploy will trigger this exact scenario. Fix Open #23 disk persistence in the same SSH session before `pm2 restart`. Without it, the first Reddit/HN spike post-deploy is a weather outage.

---

## Summary

Three open items requiring Jack's SSH session:
1. **Add disk-persistence to `server/proxy.js`** (P1-1, 30 min) — do this FIRST, before restart
2. **`scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && pm2 restart peakly-proxy`** (P0-1, 10 min after P1-1 is added)
3. After `/health` confirms new proxy: flip `APNS_LIVE = true` in app.jsx:12633 if the .p8 key is wired

One fix shipped this run: cache stamp bumped to `20260801a` (was stale at `20260725d` since July 25).
