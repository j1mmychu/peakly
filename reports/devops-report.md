# DevOps Report — 2026-08-03 (RED) — Day 11 VPS Undeployed

**Status: 🔴 RED**
Primary blocker: `server/proxy.js` (with APNs HTTP/2 fix, two-weekend scoring fix, CORS fix, alert deletion fix, and rate limiter fix) has been committed to main for **11 days** and has not been copied to the VPS. The disk-persistence fix (Open #23) is also still missing from `server/proxy.js`. Two blockers, one SSH session. Until this ships, the live product is materially broken in at least 4 ways.

---

## Infrastructure Overview

| Component | Status |
|---|---|
| GitHub Pages (frontend) | ✅ Live — auto-deploys on push to main via deploy.yml |
| esbuild production build | ✅ `dist/app.min.js` 457 KB — CI rebuilds on each push |
| Cache stamp | ⚠️ `20260801a` — **stale by 2 days** (today is 2026-08-03, stamp says 2026-08-01) |
| VPS proxy (198.199.80.21) | ❌ **Day 11 undeployed** — running stale proxy.js |
| APNs http2 fix in proxy.js | ✅ Committed to main (`http2.connect` + `dsaEncoding: 'ieee-p1363'`) |
| Alert ID security fix | ✅ Committed to main (`crypto.randomUUID()` at app.jsx:10238) |
| Disk cache persistence (Open #23) | ❌ **Not in proxy.js** — must be added before VPS redeploy |
| Open-Meteo `forecast_days` | ✅ `14` for weather, `10` for marine — correct in committed code |
| Supabase cloud sync | ✅ Live, anon key wired, RLS active |
| Plausible analytics | ✅ `data-domain="j1mmychu.github.io/peakly"`, defer-loaded |
| Sentry error monitoring | ✅ Active DSN `9416b032...`, deferred load |
| React 18.3.1 / Babel 7.29.7 | ✅ Current CDN versions on unpkg |
| No exposed server tokens | ✅ Travelpayouts token is server-side only |
| APNS_LIVE flag | ✅ `false` (correct — VPS still running stale code) |
| Stale claude/ branches | ⚠️ 15 branches on origin — accumulating |

---

## File Stats

- `app.jsx`: **13,724 lines / 675 KB**
- `dist/app.min.js`: **457 KB** (CI-built, current)
- `BASE_PRICES` coverage: **76 of 146 venue airports (52%)** — 100 APs missing, 235 venues affected

---

## P0 — Fix Today

### P0-1: VPS Not Redeployed — Day 11 (Open #19 + #21 bundle)

**What's broken on the live VPS right now:**
1. `forecast_days=7` instead of 14 → two-weekend scoring disabled whenever VPS weather cache is warm
2. `forecast_days=7` for marine → beach water-temp data truncated
3. `capacitor://localhost` missing from CORS → iOS native API calls fail outright
4. `DELETE` absent from `Access-Control-Allow-Methods` → alert deletion silently fails (client's `.catch(()=>{})` hides it)
5. APNs transport: DER JWT + HTTP/1.1 fetch → zero pushes delivered even if keys are configured
6. Rate limiter reads `X-Forwarded-For[0]` → trivially forgeable by any proxy

**Add Open #23 disk persistence first (P0-2 below), then:**

```bash
# From local machine with VPS access
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Verify health response shows `"apns": "unconfigured"` (expected) and no error. **Estimated: 10 minutes.**

---

### P0-2: Add Disk Persistence to proxy.js Before Deploying (Open #23)

`_wxCache` is pure in-memory. A `pm2 restart` wipes it. The restart required by P0-1 will trigger a cold cache. If a traffic spike hits within the ~2hr refill window, the VPS fans out direct Open-Meteo calls. At 373 venues × 2 (weather + marine) = 746 cold calls per user group — 14 simultaneous cache-miss groups hits Open-Meteo's 10K/day free-tier ceiling. Result: the Explore tab shows "conditions unavailable" to every new user for the rest of the day.

**Exact edits to make in `server/proxy.js` before `scp`:**

```javascript
// 1. Add near top of file, after existing require() calls:
const path = require('path');
const WX_CACHE_FILE = process.env.WX_CACHE_PATH || path.join(__dirname, 'wx-cache.json');

function _saveCacheToDisk() {
  try {
    const obj = {};
    for (const [k, v] of _wxCache.entries()) obj[k] = v;
    require('fs').writeFileSync(WX_CACHE_FILE, JSON.stringify(obj), 'utf8');
  } catch (e) { console.error('[wx-cache] save failed:', e.message); }
}

function _loadCacheFromDisk() {
  try {
    const raw = require('fs').readFileSync(WX_CACHE_FILE, 'utf8');
    const data = JSON.parse(raw);
    const now = Date.now();
    let loaded = 0;
    for (const [k, v] of Object.entries(data)) {
      if (v && v.ts && (now - v.ts) < WX_TTL_MS) { _wxCache.set(k, v); loaded++; }
    }
    console.log(`[wx-cache] loaded ${loaded} warm entries from disk`);
  } catch (e) { if (e.code !== 'ENOENT') console.error('[wx-cache] load failed:', e.message); }
}

// 2. After line: const _wxCache = new Map();  (currently line ~382)
//    Add immediately below it:
_loadCacheFromDisk();

// 3. After app.listen(...) call near bottom of file, add:
setInterval(_saveCacheToDisk, 5 * 60 * 1000); // persist every 5 minutes
```

**Estimated: 15 minutes.**

---

## P1 — Fix This Week

### P1-1: Cache Stamp Stale by 2 Days

`PEAKLY_BUILD = "20260801a"` in app.jsx, `CACHE_NAME = "peakly-20260801a"` in sw.js, `?v=20260801a` in index.html. Today is 2026-08-03. The stamp is 2 days old. The auto-push hook bumps it only on content changes — the last few commits were report-only. Stamp drifts whenever only reports land.

```bash
perl -pi -e 's/20260801a/20260803a/g' app.jsx sw.js index.html
```

Verify all three changed before committing. **Estimated: 2 minutes.**

### P1-2: BASE_PRICES Gap — 100 of 146 Airports Missing (Open #22)

52% of venue airports have no BASE_PRICES entry. That's **235 venues** showing blank or estimate-labeled pricing on the deal score — the headline feature. PM v107 authorizes top-5 backfill as a SHIP decision. Top missing airports by venue count:

| Airport | Venues | Notes |
|---------|--------|-------|
| CUN | 9 | Cancun — biggest Caribbean beach hub |
| IBZ | 7 | Ibiza — top European beach |
| HKT | 6 | Phuket — top SE Asia beach |
| BTV | 5 | Burlington VT — Stowe, Sugarbush, Jay Peak |
| NCE | 5 | Nice — French Riviera + Alps gateway |
| ZNZ | 5 | Zanzibar |
| MRU | 5 | Mauritius |

**Paste directly after the Caribbean section in `BASE_PRICES` (after the `BGI` line, before the closing `}`  of that section):**

```javascript
  // Top missing airports — backfill 2026-08-03
  CUN:{ JFK:320, LAX:380, SFO:420, ORD:360, MIA:180, SEA:460, BOS:340, ATL:280, DEN:380, DFW:300, LAS:340, PHX:300, MSP:400, DTW:390 },
  IBZ:{ JFK:720, LAX:1020,SFO:1000,ORD:800, MIA:880, SEA:1060,BOS:680, ATL:820, DEN:900, DFW:860, LAS:960, PHX:980, MSP:840, DTW:830 },
  HKT:{ JFK:1100,LAX:900, SFO:880, ORD:1050,MIA:1180,SEA:980, BOS:1160,ATL:1200,DEN:1020,DFW:1080, LAS:980, PHX:960, MSP:1090,DTW:1080 },
  BTV:{ JFK:200, LAX:380, SFO:360, ORD:280, MIA:300, SEA:400, BOS:160, ATL:280, DEN:340, DFW:320, LAS:360, PHX:340, MSP:300, DTW:280 },
  NCE:{ JFK:760, LAX:1040,SFO:1000,ORD:840, MIA:920, SEA:1080,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
  ZNZ:{ JFK:1200,LAX:1300,SFO:1280,ORD:1250,MIA:1300,SEA:1350,BOS:1240,ATL:1280,DEN:1320,DFW:1300, LAS:1340,PHX:1360,MSP:1300,DTW:1290 },
  MRU:{ JFK:1400,LAX:1500,SFO:1480,ORD:1450,MIA:1480,SEA:1540,BOS:1440,ATL:1460,DEN:1490,DFW:1480, LAS:1520,PHX:1540,MSP:1490,DTW:1480 },
```

**Estimated: 15 minutes per batch of 7.**

---

## P2 — Fix This Sprint

### P2-1: 15 Stale `claude/` Branches on Origin

15 agent worktree branches are sitting on origin. Unreviewed, unmerged. They accumulate every time a Claude Code session creates a branch and doesn't clean up. None should touch main without deliberate review. Last mass cleanup was 2026-05-09.

```bash
# Preview what you're deleting
git branch -r | grep "origin/claude/"

# Delete all 15
git branch -r | grep "origin/claude/" | sed 's|  origin/||' | \
  xargs -I{} git push origin --delete {}
```

**Estimated: 5 minutes.**

### P2-2: Leftover Non-Standard Branches

4 extra branches beyond `main` and `master`:
- `fix-appjsx-final` — emergency hotfix artifact
- `restore-appjsx` — recovery artifact
- `test-small` — test artifact
- `master` — **keep this** (deploy.yml pushes to both main and master)

```bash
git log origin/fix-appjsx-final --oneline -3
git log origin/restore-appjsx --oneline -3
git log origin/test-small --oneline -3
# After confirming nothing unmerged:
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

### P2-3: Supabase Anon Key Visible in Source (Known, Acceptable)

`SUPABASE_ANON_KEY` at app.jsx:26 is a JWT visible to anyone who views source. This is Supabase's documented pattern for public clients — RLS is the security gate, not key secrecy. No action unless RLS is audited and found broken. Documented here for completeness.

### P2-4: No SRI on CDN Scripts (Open #10)

React 18.3.1, ReactDOM, and Babel 7.29.7 load from unpkg with no integrity hashes. A CDN compromise delivers arbitrary JS to all users.

```bash
# Generate hashes locally
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
# Repeat for react-dom and babel, then add integrity= attributes to index.html
```

Caveat: Babel's inline `eval` for JSX transpilation will likely conflict with a `script-src` CSP. Hash the files before tightening the policy.

---

## Cost Estimate

| Scale | Monthly Cost | Primary Driver |
|-------|-------------|----------------|
| Current (<100 MAU) | ~$6/mo | DO droplet |
| 1K MAU | ~$6–12/mo | Same droplet — wx cache stays in-memory easily |
| 10K MAU | ~$30–60/mo | Upgrade to 4GB RAM droplet + possible DO Spaces for backup |
| 100K MAU | ~$200–400/mo | Multiple droplets behind LB, Postgres for alerts persistence, CDN |

No changes needed to cost structure until 1K MAU. The current $6/mo droplet handles it.

---

## What Breaks First at Scale

The VPS weather cache is the single highest-risk failure path. A `pm2 restart` (which happens on every code deploy) wipes it. At 373 venues × 2 API calls each, a cold cache under traffic hits Open-Meteo's 10K/day free tier within 14 simultaneous user-group loads. The result is a total Explore outage — every venue shows "conditions unavailable" and the app looks broken to every new user for the rest of the day. The disk persistence fix (P0-2) eliminates this scenario by preserving warm cache across restarts. After that, the next bottleneck is BASE_PRICES coverage: 235 venues with no pricing data means the deal-score headline feature is blank for 63% of the catalog at launch. That's a conversion problem, not infrastructure — but it's the second-highest quality gap after photos.

---

## Action Checklist

- [ ] **P0 (15 min)**: Add disk persistence to `server/proxy.js` (Open #23) — see exact code block above
- [ ] **P0 (10 min)**: `scp server/proxy.js` to VPS + `pm2 restart` + verify `/health` (Open #19 + #21)
- [ ] **P1 (2 min)**: Bump cache stamp `20260801a` → `20260803a` in app.jsx / sw.js / index.html
- [ ] **P1 (15 min)**: Paste top-7 BASE_PRICES entries (CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU) into app.jsx
- [ ] **P2 (5 min)**: Delete 15 stale `claude/` branches on origin
- [ ] **P2 (5 min)**: Audit + delete `fix-appjsx-final` / `restore-appjsx` / `test-small` branches
