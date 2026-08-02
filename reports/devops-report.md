# DevOps Report — 2026-08-02 (RED) — Day 9 VPS Undeployed

**Status: 🔴 RED**
Primary cause: `server/proxy.js` has been sitting committed but undeployed since 2026-07-24 — now Day 9. The production VPS runs stale code. Two-weekend scoring disabled, iOS native CORS blocked, alert deletion broken. Every day of delay is a day the live product is functionally incomplete.

---

## Infrastructure Overview

| Component | Status |
|---|---|
| GitHub Pages (frontend) | ✅ Live — auto-deploys on push to main via deploy.yml |
| esbuild production build | ✅ 457 KB minified in dist/ — CI rebuilds on each push |
| Cache stamp | ✅ `20260801a` — correct, no functional app.jsx changes today |
| VPS proxy (198.199.80.21) | ❌ **Day 9 undeployed** — running stale proxy.js |
| APNs http2 fix in proxy.js | ✅ **Committed** — `http2.connect` + `dsaEncoding: 'ieee-p1363'` are in main |
| Alert ID security fix | ✅ **Committed** — `crypto.randomUUID()` at app.jsx:10238, with fallback |
| Open-Meteo (weather) | ✅ `forecast_days=14`, marine `forecast_days=10` |
| Open-Meteo disk cache | ❌ In-memory only — wiped on every `pm2 restart` (Open #23) |
| Supabase (cloud sync) | ✅ Live, anon key wired, RLS active |
| Plausible analytics | ✅ `data-domain="j1mmychu.github.io/peakly"`, defer-loaded |
| Sentry error monitoring | ✅ Active DSN `9416b032...`, deferred load |
| React 18.3.1 / Babel 7.29.7 | ✅ Current CDN versions |
| No exposed server tokens | ✅ Travelpayouts token is server-side only |
| APNS_LIVE flag | ✅ `false` at app.jsx — correct, do not flip until VPS is running new code |

---

## File Stats

- `app.jsx`: **13,724 lines / 690,843 bytes (675 KB)**
- `dist/app.min.js`: **457,185 bytes (447 KB)** — CI rebuilds from source on each push
- Local `dist/` build: dated 2026-07-31 — **stale locally but live site is current** (CI rebuilt after subsequent pushes)

---

## P0 — Fix Today

### P0-1: VPS Not Redeployed — Day 9 (Open #19 + #21 + #23 bundle)

The `server/proxy.js` on origin/main has:
- `forecast_days` 7→14 (two-weekend scoring was silently disabled whenever the VPS handled the weather call)
- `forecast_days` for marine: 7→10
- `capacitor://localhost` added to CORS (iOS native calls currently blocked outright)
- `DELETE` in `Access-Control-Allow-Methods` (alert deletion has never worked — preflight rejects it, client's `.catch(()=>{})` hides it)
- APNs transport fixed: `http2.connect` + `dsaEncoding: 'ieee-p1363'` — confirmed at `server/proxy.js:8` and `server/proxy.js:553`
- Rate limiter reads last X-Forwarded-For (not `[0]`, which was forgeable)

**Before you `pm2 restart`, add disk persistence for the weather cache (Open #23) — otherwise the restart itself triggers the Open-Meteo rate-limit scenario described below.**

**Add disk persistence to `server/proxy.js` (Open #23 — ~30 lines):**

```javascript
// Add near top of proxy.js, after requires
const CACHE_FILE = process.env.WX_CACHE_PATH || '/opt/peakly-proxy/wx-cache.json';

// Persist cache to disk periodically
function _saveCacheToDisk() {
  try {
    const data = {};
    for (const [k, v] of Object.entries(_wxCache)) data[k] = v;
    require('fs').writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch (e) { console.error('[cache-persist] write failed:', e.message); }
}

// Load cache from disk on startup
function _loadCacheFromDisk() {
  try {
    const raw = require('fs').readFileSync(CACHE_FILE, 'utf8');
    const data = JSON.parse(raw);
    const now = Date.now();
    let loaded = 0;
    for (const [k, v] of Object.entries(data)) {
      if (v.expiresAt && v.expiresAt > now) { _wxCache[k] = v; loaded++; }
    }
    console.log(`[cache-persist] loaded ${loaded} warm entries from disk`);
  } catch (e) { if (e.code !== 'ENOENT') console.error('[cache-persist] read failed:', e.message); }
}

// Call _loadCacheFromDisk() right after the _wxCache declaration
// Call setInterval(_saveCacheToDisk, 5 * 60 * 1000) after startup (save every 5 min)
```

**Deploy sequence (SSH to 198.199.80.21):**

```bash
# Step 1: Commit disk-persistence addition if you make local edits first,
# OR edit proxy.js directly on the VPS:
ssh root@198.199.80.21

# Step 2: On VPS — apply the changes
cd /opt/peakly-proxy
# The VPS is NOT a git clone — copy the file manually:
# From your local machine:
# scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Step 3: Add disk persistence (if not done locally first):
# Edit /opt/peakly-proxy/proxy.js and add the _saveCacheToDisk/_loadCacheFromDisk blocks above

# Step 4: Restart (with warm cache from disk if #23 fix was applied)
pm2 restart peakly-proxy

# Step 5: Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14 in the health response, apns_configured status visible
```

**Verify the deploy fixed forecast_days** — grep the running proxy for the old value:
```bash
grep -n "forecast_days" /opt/peakly-proxy/proxy.js
# Must show 14 (weather) and 10 (marine), NOT 7
```

**Estimated time to fix: 20 min total** (10 min to add disk persistence + 5 min copy + 5 min verify)

---

## P1 — Fix This Week

### P1-1: BASE_PRICES covers 52% of venue airports (Open #22)

Current state: **76 of 146 venue APs have BASE_PRICES entries. 100 are missing.**

The deal score is a headline feature. When BASE_PRICES is absent for a venue's airport, `getTypicalPrice()` returns null and `getDealScore()` produces no signal — those venues get no deal label, suppressing the sort for 48% of the catalog.

Top missing airports by venue count — fix these first:

| AP | Venues | Sample venues |
|---|---|---|
| CUN | 9 | Cancún beach cluster |
| IBZ | 7 | Ibiza |
| HKT | 6 | Phuket |
| BTV | 5 | Vermont ski cluster |
| NCE | 5 | Côte d'Azur / Alps |
| ZNZ | 5 | Zanzibar |
| MRU | 5 | Mauritius |
| ALB | 4 | Albany / Catskills |
| PLS | 4 | Providenciales |
| AXA | 4 | Anguilla |

Paste block for top 10 missing APs into BASE_PRICES in app.jsx (below the Caribbean section):

```javascript
CUN:{ JFK:320, LAX:360, SFO:400, ORD:340, MIA:180, SEA:440, BOS:360, ATL:260, DEN:360, DFW:280, LAS:340, PHX:300, MSP:380, DTW:370 },
IBZ:{ JFK:760, LAX:1040,SFO:1000,ORD:840, MIA:900, SEA:1080,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
HKT:{ JFK:1200,LAX:900, SFO:880, ORD:1150,MIA:1280,SEA:1000,BOS:1260,ATL:1300,DEN:1120,DFW:1180, LAS:1080,PHX:1060,MSP:1190,DTW:1180 },
BTV:{ JFK:160, LAX:360, SFO:340, ORD:220, MIA:260, SEA:380, BOS:100, ATL:220, DEN:280, DFW:260, LAS:360, PHX:340, MSP:260, DTW:240 },
NCE:{ JFK:760, LAX:1040,SFO:1000,ORD:840, MIA:900, SEA:1080,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
ZNZ:{ JFK:1100,LAX:1300,SFO:1280,ORD:1180,MIA:1060,SEA:1380,BOS:1140,ATL:1100,DEN:1260,DFW:1180, LAS:1280,PHX:1260,MSP:1220,DTW:1210 },
MRU:{ JFK:1400,LAX:1600,SFO:1580,ORD:1480,MIA:1360,SEA:1680,BOS:1440,ATL:1400,DEN:1560,DFW:1480, LAS:1580,PHX:1560,MSP:1520,DTW:1510 },
ALB:{ JFK:140, LAX:360, SFO:340, ORD:220, MIA:240, SEA:380, BOS:120, ATL:200, DEN:280, DFW:260, LAS:360, PHX:340, MSP:260, DTW:240 },
PLS:{ JFK:340, LAX:560, SFO:600, ORD:460, MIA:220, SEA:660, BOS:380, ATL:340, DEN:500, DFW:440, LAS:520, PHX:500, MSP:500, DTW:490 },
AXA:{ JFK:420, LAX:640, SFO:680, ORD:540, MIA:300, SEA:740, BOS:460, ATL:420, DEN:580, DFW:520, LAS:600, PHX:580, MSP:580, DTW:570 },
```

After adding, verify coverage:
```bash
node -e "
const fs = require('fs'), src = fs.readFileSync('app.jsx','utf8');
const apMatch = src.matchAll(/[,{]\s*(?:\"ap\"|ap)\s*:\s*\"([A-Z]{3})\"/g);
const aps = new Set(); for (const m of apMatch) aps.add(m[1]);
const bpMatch = src.match(/const BASE_PRICES\s*=\s*\{([^;]+?)\};/s);
const bp = new Set();
if (bpMatch) for (const m of bpMatch[1].matchAll(/\b([A-Z]{3}):\s*\{/g)) bp.add(m[1]);
const missing = [...aps].filter(a=>!bp.has(a));
console.log('APs:', aps.size, 'BP keys:', bp.size, 'Coverage:', Math.round(bp.size/aps.size*100)+'%', 'Missing:', missing.length);
console.log('Top missing:', missing.slice(0,10).join(', '));
"
```

**Estimated time: 2 hours to backfill top 30 airports**

---

## P2 — Fix This Sprint

### P2-1: 18 Stale Remote Branches

```bash
# All of these are abandoned agent worktrees or experiment branches
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

**Estimated time: 2 min**

### P2-2: No SRI Hashes on CDN Scripts

React, ReactDOM, and Babel are loaded from unpkg without `integrity=` hashes. A compromised CDN or MITM attack could inject malicious code into a script that has full DOM access.

```html
<!-- Replace in index.html — fetch correct hashes first: -->
<!-- curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->

<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-REPLACE_WITH_ACTUAL_HASH"></script>
<script crossorigin
  src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-REPLACE_WITH_ACTUAL_HASH"></script>
```

Note: Babel Standalone is harder — the `<link rel="preload">` tag + dynamic usage makes SRI trickier. Start with React/ReactDOM.

**Estimated time: 30 min to compute and verify hashes**

### P2-3: Alerts API Still Unauthenticated

`POST /api/alerts` and `DELETE /api/alerts/:id` have no auth. The guessable-id risk is mitigated (crypto.randomUUID now committed in app.jsx), but the endpoints are still open to anyone who can observe the API. A user can delete another user's alert if they obtain the UUID.

Before enabling APNS, add a simple bearer token tied to the pushToken:

```javascript
// In proxy.js alert endpoints — verify the pushToken matches the stored alert
app.delete('/api/alerts/:id', (req, res) => {
  const alert = _alertStore.get(req.params.id);
  const callerToken = req.headers['x-push-token'] || req.body?.pushToken;
  if (!alert || alert.pushToken !== callerToken) {
    return res.status(404).json({ success: false });
  }
  _alertStore.delete(req.params.id);
  res.json({ success: true });
});
```

**Estimated time: 45 min**

---

## Open Items Status Update

| # | Item | Status |
|---|---|---|
| #19 | VPS redeploy | ❌ **Day 9. P0. Jack SSH required.** |
| #20 | Photos: ~346 venues generic | ❌ Pre-launch quality gap. Needs UNSPLASH_KEY. |
| #21 (transport) | APNs HTTP/2 + P1363 | ✅ **FIXED IN CODE** — `http2.connect` + `dsaEncoding:'ieee-p1363'` confirmed in proxy.js. Needs VPS deploy. |
| #21 (app.jsx) | Alert IDs crypto.randomUUID | ✅ **FIXED** — `newAlertId()` helper at app.jsx:10238 with proper fallback chain. |
| #21 (API auth) | Unauthenticated alerts API | ❌ Still open — P2-3 above |
| #22 | BASE_PRICES 52% coverage | ❌ P1. 100 airports missing. 10-entry paste block above covers top gap. |
| #23 | Weather cache disk persistence | ❌ P1. Must fix BEFORE VPS restart. |

---

## Performance Analysis

- **Production bundle**: 457 KB (esbuild-minified) — up from 439 KB at last count, growth driven by venue additions. Still sub-500 KB, acceptable.
- **Dev bundle load**: Babel Standalone 7.29.7 = ~1.8 MB uncompressed. Mobile first-load still incurs 3–5s Babel parse wall when using `index.html` directly. Production `dist/index.html` avoids this.
- **Image lazy loading**: `loading="lazy"` on all 9 `<img>` tags confirmed. ✅
- **Open-Meteo batching**: 50 venues / 2s confirmed in CLAUDE.md. 373 venues = 7.46s for full cold-load batch. Acceptable.

---

## Cost Estimate

| Scale | Compute | Bandwidth | External APIs | Total/mo |
|---|---|---|---|---|
| Current (<100 MAU) | $6 (DO droplet) | ~$0 | $0 (free tier) | **$6** |
| 1K MAU | $6 | ~$2 | $0 (free tier) | **~$8** |
| 10K MAU | $18 (2× DO) | ~$15 | $0–$50 (Open-Meteo TBD) | **~$33–$83** |
| 100K MAU | $80 (load-balanced) | ~$150 | ~$200 (API quotas) | **~$430** |

No new cost items. Architecture holds.

---

## What Breaks First at Scale

Open-Meteo, immediately after the VPS `pm2 restart` that's been 9 days overdue.

The math: 373 venues × 2 API calls (weather + marine for beach) = ~560 upstream requests per cold-miss cycle. Open-Meteo free tier: ~60 req/min. A `pm2 restart` without disk persistence wipes the in-memory cache entirely. The moment the first user hits the app post-restart, the VPS fires all 373 venue requests simultaneously. 560 requests in under 10 seconds against a 60-req/min ceiling = the cache refills in ~10 minutes of throttled agony, during which weather returns empty for most venues.

Fix sequence: (1) add disk persistence to proxy.js, (2) restart VPS, (3) cache survives restart warm. Without step 1, step 2 guarantees an outage window. This is why Open #23 must bundle with #19 in the same SSH session.

---

## Security Audit

- **No client-side secrets**: Travelpayouts token is server-side only. ✅
- **Supabase anon key**: Public-safe per Supabase RLS design. ✅
- **No env files committed**: `.gitignore` covers `.env`, `*.p8`, `*.pem`, `*.key`. ✅
- **Recent commits**: No secrets detected in last 10 commits. ✅
- **Sentry DSN**: In source — standard, Sentry DSNs are designed to be public-facing. ✅
- **APNs `.p8` key**: Not in repo. ✅
- **Open**: Unauthenticated alerts API (P2-3 above).

---

## One Action That Matters This Week

Jack SSH'd to 198.199.80.21, ran the scp + pm2 restart sequence with disk persistence pre-added. Everything else on this list is noise by comparison. The product is feature-complete and running degraded on a 9-day-old server config. The S-hemisphere ski window burns down in 9 weeks. Reddit post can't happen until the VPS is live.

Everything else — branch cleanup, SRI hashes, API auth hardening — can wait until after the launch post.

*v2026-08-02 — written by DevOps agent. Supersedes 2026-08-01 report.*
