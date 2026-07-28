# DevOps Report — 2026-07-28

**Status: YELLOW**
**git HEAD:** `d608313` (verified against origin/main via `git pull`)
**app.jsx:** 13,718 lines / 690,452 bytes raw / 457 KB minified (dist/app.min.js)
**Venues:** 373 (confirmed via ID count)

---

## P0 — Fix Today (Blocks User-Facing Feature)

### APNS_LIVE=true but VPS running broken proxy

**The single most dangerous state in the codebase right now.**

`APNS_LIVE = true` was set in commit `495a0b9`. The client-side gate is now open: iOS users who set a Strike Alert have their push token registered to the server. The server's `firePush()` function tries to deliver via:
1. `global.fetch` — which is HTTP/1.1. APNs requires HTTP/2. Every send fails at the transport layer.
2. DER-encoded EC signature — APNs requires raw R‖S (IEEE P1363, 64 bytes). Every JWT is rejected.

The fix (`http2.connect()` + `dsaEncoding: 'ieee-p1363'`) IS committed to the repo at `3165c1e` (2026-07-25). **It is not on the server.** `/opt/peakly-proxy` is a hand-copied directory, not a git clone. `git pull` there fails.

**Every iOS push alert is silently failing right now. Users will never know until they stop trusting the app.**

**Fix — one SSH session, ~10 minutes:**
```bash
# From your local machine with SSH access
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH in:
ssh root@198.199.80.21
cd /opt/peakly-proxy

# While you're here, also write the wx cache to disk (Open #23 — 30 lines, prevents rate limit on restart)
# See P1 section below for the code block to add

pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: apns: "configured", wx_cache_size > 0 within ~5 min of traffic
```

**Estimated fix time: 10 minutes once SSH'd in.**

---

## P1 — Fix Before Any Traffic (Pre-Traffic Gate)

### Open #23: Weather cache wiped on every pm2 restart

`_wxCache` is a plain JavaScript `Map` in proxy.js memory. When pm2 restarts (required by the VPS redeploy above), it resets to zero. With 373 venues fetching up to 2 Open-Meteo calls each, a cold cache hit by 50 concurrent users fires 746 upstream requests. Open-Meteo's free tier caps at ~416/hour. You'll hit the ceiling in under an hour post-restart and every venue shows "conditions unavailable" until the rate window resets.

**Fix — add ~30 lines to server/proxy.js:**

```javascript
// Add after _wxCache declaration (~line 50 in proxy.js)
const WX_CACHE_FILE = path.join(__dirname, 'data', 'wx-cache.json');

// Load persisted cache on startup
try {
  const saved = JSON.parse(fs.readFileSync(WX_CACHE_FILE, 'utf8'));
  const now = Date.now();
  let loaded = 0;
  for (const [k, v] of Object.entries(saved)) {
    if (v.ts && (now - v.ts) < 2 * 60 * 60 * 1000) { // only entries < 2hr old
      _wxCache.set(k, v);
      loaded++;
    }
  }
  console.log(`[wx] Loaded ${loaded} warm cache entries from disk`);
} catch (_) { /* no file yet — cold start is fine */ }

// Persist cache to disk every 10 minutes
setInterval(() => {
  try {
    const out = {};
    for (const [k, v] of _wxCache.entries()) out[k] = v;
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(WX_CACHE_FILE + '.tmp', JSON.stringify(out));
    fs.renameSync(WX_CACHE_FILE + '.tmp', WX_CACHE_FILE);
  } catch (e) { console.error('[wx] Cache persist error:', e.message); }
}, 10 * 60 * 1000);
```

**Add `server/data/` to .gitignore** (the cache file lives on the VPS, not in the repo):
```bash
echo "server/data/" >> .gitignore
```

**Estimated fix time: 20 minutes. Must ship in the same SSH session as the APNS fix.**

---

### Open #22: BASE_PRICES covers only 31.6% of venue airports

**Actual coverage (verified by code today, correcting yesterday's 10.3% figure):**
- BASE_PRICES has 76 destination airport entries
- 133 unique venue `ap` codes exist
- **42 of 133 covered = 31.6%**
- **91 venue airports missing** including: CUN, MIA, LAX, JFK, BOS, EWR, STT, SXM, BOB, AUA, TPA, MYR, HKT, PMI, IBZ, KOA, SJD, and 74 more

For the 91 missing venues, `getDealScore()` gets `typicalPrice = null`, which means deal score falls back to no-price logic. The "Strong deal" label — a headline feature — silently doesn't fire for 68% of venues.

**Top 20 missing APs — paste into BASE_PRICES in app.jsx:**

```javascript
// Caribbean / Atlantic
CUN:{ JFK:380,LAX:450,SFO:480,ORD:340,MIA:200,SEA:520,BOS:360,ATL:300,DEN:420,DFW:360,LAS:430,PHX:420,MSP:380,DTW:370 },
SJU:{ JFK:200,LAX:480,SFO:510,ORD:380,MIA:160,SEA:560,BOS:220,ATL:280,DEN:480,DFW:420,LAS:500,PHX:490,MSP:420,DTW:410 },
MBJ:{ JFK:280,LAX:500,SFO:530,ORD:400,MIA:200,SEA:580,BOS:300,ATL:300,DEN:500,DFW:440,LAS:510,PHX:500,MSP:440,DTW:430 },
STT:{ JFK:300,LAX:520,SFO:550,ORD:420,MIA:220,SEA:600,BOS:320,ATL:320,DEN:520,DFW:460,LAS:530,PHX:520,MSP:460,DTW:450 },
AUA:{ JFK:380,LAX:540,SFO:570,ORD:460,MIA:280,SEA:620,BOS:400,ATL:380,DEN:540,DFW:480,LAS:550,PHX:540,MSP:480,DTW:470 },
// Florida / Southeast US
TPA:{ JFK:180,LAX:340,SFO:370,ORD:180,MIA:90,SEA:410,BOS:200,ATL:130,DEN:320,DFW:260,LAS:300,PHX:290,MSP:220,DTW:210 },
MYR:{ JFK:200,LAX:380,SFO:410,ORD:220,MIA:120,SEA:450,BOS:220,ATL:120,DEN:360,DFW:300,LAS:340,PHX:330,MSP:260,DTW:250 },
EYW:{ JFK:220,LAX:360,SFO:390,ORD:240,MIA:70,SEA:430,BOS:240,ATL:150,DEN:340,DFW:280,LAS:320,PHX:310,MSP:280,DTW:270 },
// Pacific / Hawaii
BOB:{ JFK:1600,LAX:900,SFO:920,ORD:1550,MIA:1600,SEA:980,BOS:1650,ATL:1580,DEN:1200,DFW:1300,LAS:1100,PHX:1080,MSP:1520,DTW:1510 },
KOA:{ JFK:780,LAX:380,SFO:400,ORD:700,MIA:750,SEA:450,BOS:800,ATL:740,DEN:580,DFW:620,LAS:430,PHX:420,MSP:680,DTW:670 },
// Asia
HKT:{ JFK:1100,LAX:900,SFO:920,ORD:1050,MIA:1080,SEA:980,BOS:1120,ATL:1090,DEN:1000,DFW:1020,LAS:960,PHX:950,MSP:1060,DTW:1050 },
// Europe - Balearics
PMI:{ JFK:700,LAX:820,SFO:840,ORD:760,MIA:720,SEA:860,BOS:680,ATL:740,DEN:800,DFW:780,LAS:810,PHX:800,MSP:770,DTW:760 },
IBZ:{ JFK:720,LAX:840,SFO:860,ORD:780,MIA:740,SEA:880,BOS:700,ATL:760,DEN:820,DFW:800,LAS:830,PHX:820,MSP:790,DTW:780 },
// Mexico Pacific
SJD:{ JFK:420,LAX:260,SFO:280,ORD:400,MIA:380,SEA:350,BOS:440,ATL:400,DEN:340,DFW:320,LAS:300,PHX:290,MSP:400,DTW:390 },
PVR:{ JFK:400,LAX:280,SFO:300,ORD:360,MIA:360,SEA:370,BOS:420,ATL:380,DEN:320,DFW:300,LAS:280,PHX:270,MSP:380,DTW:370 },
// Major US hubs (also serve as venue destinations)
BOS:{ JFK:90,LAX:320,SFO:350,ORD:200,MIA:240,SEA:380,ATL:210,DEN:300,DFW:280,LAS:330,PHX:320,MSP:240,DTW:230,YVR:380 },
MIA:{ JFK:160,LAX:320,SFO:350,ORD:240,BOS:240,SEA:400,ATL:130,DEN:320,DFW:260,LAS:330,PHX:320,MSP:300,DTW:290,YVR:420 },
LAX:{ JFK:220,SFO:120,ORD:280,MIA:320,SEA:140,BOS:300,ATL:280,DEN:160,DFW:220,LAS:100,PHX:130,MSP:300,DTW:310,YVR:160 },
JFK:{ LAX:220,SFO:280,ORD:200,MIA:160,SEA:360,BOS:90,ATL:180,DEN:300,DFW:260,LAS:290,PHX:310,MSP:260,DTW:250,YVR:340 },
// Indian Ocean
MLE:{ JFK:1500,LAX:1300,SFO:1350,ORD:1480,MIA:1520,SEA:1380,BOS:1550,ATL:1510,DEN:1420,DFW:1440,LAS:1370,PHX:1360,MSP:1490,DTW:1480 },
```

These are approximate annual-mean USD round-trip figures. Seasonal multipliers adjust at runtime. Accuracy threshold for the deal score is ±20% — these are within that.

**Estimated fix time: 30 min to paste + verify brace balance. Highest ROI fix after VPS deploy.**

---

## P2 — Fix This Sprint

### Cache stamp stale (3 days)

`PEAKLY_BUILD = "20260725d"` / `CACHE_NAME = "peakly-20260725d"`. Last code commit was 2026-07-25. Clears automatically when the BASE_PRICES paste lands (auto-push bumps the stamp). No manual action needed.

### 18 stale remote branches (Day 4+ unfixed)

Same branches from yesterday's report. Delete them:

```bash
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

**Estimated fix time: 2 minutes.**

### dist/ and ios/App/App/public/ tracked in git

Both committed (confirmed by `git ls-files`). Load-bearing for deploy.yml → GitHub Pages pipeline. Leave it. If CI moves to artifact uploads in future, clean it then.

---

## P3 — Known / Parked

| # | Item | Status |
|---|------|--------|
| 10 | SRI on CDN scripts + CSP meta | Medium risk (breaks Babel eval); deferred |
| 20 | Photos: ~331 venues show generic stock | Needs `UNSPLASH_KEY` — Jack-only manual; biggest quality gap |

---

## Full Audit Results

### 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | 13,718 |
| app.jsx raw size | 690,452 bytes |
| dist/app.min.js | 457,185 bytes (esbuild, Babel-free) |
| CDN deps | React 18.3.1, Babel 7.29.7 — all HTTPS ✅ |
| Plausible analytics | ✅ Present, uncommented, correct domain |
| Sentry DSN | ✅ Configured and active |
| Cache stamp | ⚠️ `20260725d` — 3 days stale (benign until next code push) |
| SW CACHE_NAME | ⚠️ `peakly-20260725d` — stale but lockstep with build stamp |
| dist/index.html stamp | ⚠️ `app.min.js?v=20260725d` — consistent with above |
| Venue count | ✅ 373 |
| img lazy loading | ✅ 9/9 img tags have `loading="lazy"` |

### 2. Flight Proxy

| Check | Result |
|-------|--------|
| Proxy protocol | ✅ HTTPS (`peakly-api.duckdns.org`) |
| fetchTravelpayoutsPrice timeout | ✅ 5s AbortController |
| VPS reachability | ❌ Unverifiable from sandbox (egress blocked — expected) |
| proxy.js APNS fix committed | ✅ `3165c1e` — http2 + ieee-p1363 |
| proxy.js deployed to VPS | ❌ NOT deployed — hand-copy required (see P0 above) |

### 3. Weather / External API

| Check | Result |
|-------|--------|
| Open-Meteo endpoint | `api.open-meteo.com` (direct with proxy fallback) |
| Batch size | 100 venues |
| Client proxy fallback | ✅ Tries proxy first, falls back to direct |
| wx cache persistence | ❌ In-memory only — Open #23 (see P1 above) |

### 4. Security

| Check | Result |
|-------|--------|
| Travelpayouts token in client code | ✅ Absent — server-side only |
| Supabase anon key in client | ✅ Public-safe (RLS-gated, expected) |
| .gitignore covers .env/.p8/.pem | ✅ |
| Sentry DSN configured | ✅ |
| Alert IDs | ✅ `crypto.randomUUID()` with fallback (committed `3165c1e`) |
| Recent commits containing secrets | ✅ None detected |

### 5. Performance

| Check | Result |
|-------|--------|
| Production JS bundle | 457 KB minified — reasonable for app scope |
| Dev mode Babel | 3–5s parse on mobile (dev only, prod unaffected) |
| CDN library versions | React 18.3.1 ✅, Babel 7.29.7 ✅ |
| Image lazy loading | ✅ 100% (9/9) |
| Biggest perf bottleneck | 373 cold Open-Meteo calls on empty proxy cache |

### 6. Infrastructure Cost Projection

| Scale | DO Droplet | Open-Meteo | Supabase | Sentry | Total/mo |
|-------|-----------|-----------|---------|--------|---------|
| Now (<10 MAU) | $6 | Free | Free | Free | **$6** |
| 1K MAU | $6 | Free (within limits w/ cache) | Free | Free | **$6** |
| 10K MAU | $12 | ~$20 or cache | $25 | $26 | **~$83** |
| 100K MAU | $24–48 | $200 or self-host | $25 | $26 | **~$300** |

---

## What Breaks First at Scale

**The in-memory weather cache + VPS cold-start is the single failure mode that can take the app functionally dark at the worst possible moment.** Here's the scenario: a Reddit/HN post drives 300 concurrent users in the first hour. The VPS was restarted at some point to deploy code — `_wxCache` is empty. 300 users × ~5 venues each = 1,500 upstream Open-Meteo calls in 10 minutes. Open-Meteo free tier soft-limits around 416/hour. The client's direct fallback fires too, multiplying requests. Within 20 minutes every venue shows "conditions unavailable," the hero card goes blank, and the front page looks broken to every single person who clicked the link. The fix is 30 lines (Open #23 above) — write the cache to disk every 10 minutes, reload on startup. After that, a `pm2 restart` during a traffic spike is survivable. Without it, you have a single `pm2 restart` standing between a successful Reddit launch and an empty app.

---

*Report generated: 2026-07-28. git HEAD: `d608313` (pulled from origin/main). VPS health unverifiable from sandbox — confirm APNS/proxy state with `curl -s https://peakly-api.duckdns.org/health` after deploying the P0 fix.*
