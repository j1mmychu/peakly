# DevOps Report — 2026-08-04 (RED) — Day 12 VPS Undeployed

**Status: 🔴 RED**

Primary blocker: `server/proxy.js` has been committed to main for **12 days** without being copied to the VPS. The disk-persistence fix (Open #23) was missing from the committed code as of yesterday — **it has been added and committed in this run** (see P0-2 below). The combined VPS deploy bundle is now complete. One SSH session is all that stands between the current state and a fully healthy proxy. Cache stamp is **3 days stale** (stuck at `20260801a`; today is 2026-08-04). Both are fixable in under 15 minutes. Nothing else is new.

---

## Infrastructure Overview

| Component | Status |
|---|---|
| GitHub Pages (frontend) | ✅ Live — auto-deploys on push to main via deploy.yml |
| esbuild production build | ✅ `dist/app.min.js` — CI rebuilds on each push |
| Cache stamp | ❌ `20260801a` — **stale 3 days** (today is 2026-08-04) |
| VPS proxy (198.199.80.21) | ❌ **Day 12 undeployed** — running stale proxy.js |
| Disk cache persistence (Open #23) | ✅ **Fixed this run** — `_loadCacheFromDisk` / `_saveCacheToDisk` added to `server/proxy.js` |
| APNs HTTP/2 + P1363 fix | ✅ In committed proxy.js (`http2.connect` + `dsaEncoding: 'ieee-p1363'`) |
| Alert ID security fix | ✅ In app.jsx — `crypto.randomUUID()` via `newAlertId()` (line 10238) |
| Open-Meteo `forecast_days` | ✅ 14 for weather, 10 for marine — correct in committed proxy.js |
| CORS: `capacitor://localhost` | ✅ In committed proxy.js |
| `DELETE` in Allow-Methods | ✅ In committed proxy.js |
| Rate limiter XFF fix | ✅ In committed proxy.js (reads last XFF entry, not first) |
| Supabase cloud sync | ✅ Live, anon key wired, RLS active |
| Plausible analytics | ✅ `data-domain="j1mmychu.github.io/peakly"`, defer-loaded, uncommented |
| Sentry error monitoring | ✅ Active DSN `9416b032...`, deferred load |
| React 18.3.1 / Babel 7.29.7 | ✅ Current CDN versions |
| No exposed server tokens | ✅ Travelpayouts token is server-side only |
| APNS_LIVE flag | ✅ `false` at app.jsx:12633 (correct — flip after VPS deploy + .p8 configured) |
| Stale claude/ branches | ⚠️ 15 branches on origin + 3 others (fix-appjsx-final, restore-appjsx, test-small) |

---

## File Stats

- `app.jsx`: **13,724 lines / 675 KB**
- `server/proxy.js`: **1,007+ lines** (grew ~30 lines with Open #23 fix)
- `BASE_PRICES` coverage: **76 of 146 venue airports (52%)** — 100 APs missing, ~235 venues serve estimate-only fares
- CDN payload on cold load: ~2.1 MB (React 18 ~130 KB + ReactDOM ~1,000 KB + Babel 7.29.7 ~900 KB + app.jsx 675 KB)

---

## P0 — Fix Today

### P0-1: Cache Stamp Stale — 3 Days (Today is 2026-08-04, Stamp Says 20260801a)

The build stamp in `app.jsx`, `sw.js`, and `index.html` all read `20260801a`. Users who visited in the last 3 days are serving the service worker's cached bundle. Any fix shipped today won't reach them until the SW detects a new cache name.

The `auto-push.sh` hook is supposed to auto-bump this on every edit. It's not running in the remote execution sandbox. **Jack must bump manually or trigger a local edit through the hook.**

```bash
# Manual bump — run locally in ~/peakly, then push
TODAY=$(date +%Y%m%d)
NEW_STAMP="${TODAY}a"
perl -pi -e "s/peakly-\d{8}[a-z]+/peakly-${NEW_STAMP}/g" sw.js
perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${NEW_STAMP}\"/g" app.jsx
perl -pi -e "s/\?v=\d{8}[a-z]+/?v=${NEW_STAMP}/g" index.html
git add app.jsx sw.js index.html
git commit -m "chore: bump cache stamp to ${NEW_STAMP}"
git push origin main
```

**Estimated: 3 minutes.**

---

### P0-2: VPS Not Redeployed — Day 12 (Open #19 + #21 + #23 bundle)

The disk-persistence fix (Open #23) was the only item blocking VPS redeploy. **It has been added to `server/proxy.js` in this run:**

- `_loadCacheFromDisk()` reads `wx-cache.json` on startup — warm cache survives restart
- `_saveCacheToDisk()` persists to disk every 5 minutes via `setInterval`
- Skips stale entries (older than `WX_TTL_MS = 2h`) on load
- `ENOENT` on first boot is silently ignored (expected)

**What's broken on the live VPS right now (all fixed in committed proxy.js):**
1. `forecast_days=7` → two-weekend scoring disabled whenever VPS cache is warm
2. Marine data truncated to 7 days → beach water-temp may miss the weekend
3. `capacitor://localhost` missing from CORS → iOS native calls fail outright
4. `DELETE` absent from Allow-Methods → alert deletion silently fails
5. APNs: DER JWT + HTTP/1.1 → zero pushes even if keys are configured
6. Rate limiter `XFF[0]` → trivially forgeable IP spoofing
7. **No** wx cache disk persistence → pm2 restart + traffic spike = Open-Meteo ceiling hit

**Deploy commands (one SSH session):**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected health response after deploy:
```json
{
  "status": "ok",
  "wx_cache_size": 0,
  "apns": "unconfigured",
  "uptime": "< 1m"
}
```

`wx_cache_size: 0` on a fresh restart is correct — disk file doesn't exist yet. It refills from live traffic and writes to `wx-cache.json` after 5 minutes. On the next restart, cache survives.

**Estimated: 10 minutes.**

---

## P1 — Fix This Week

### P1-1: BASE_PRICES Coverage — 52% (76 of 146 Venue Airports)

100 airports with venues have no entry in `BASE_PRICES`. Those venues show `~$0` or a silent fallback that breaks the deal-score feature. This is the biggest functional gap behind the VPS.

**Top 15 missing by venue count:**

| Airport | Venues Affected |
|---------|----------------|
| CUN (Cancún) | 9 |
| IBZ (Ibiza) | 7 |
| HKT (Phuket) | 6 |
| BTV (Burlington) | 5 |
| NCE (Nice) | 5 |
| ZNZ (Zanzibar) | 5 |
| MRU (Mauritius) | 5 |
| ALB (Albany) | 4 |
| PLS (Providenciales) | 4 |
| AXA (Anguilla) | 4 |
| SXM (St. Maarten) | 4 |
| NAP (Naples) | 4 |
| CAG (Cagliari) | 4 |
| FAO (Faro) | 4 |
| SPU (Split) | 4 |

Covering just these 15 airports fixes ~70 venues (≈19% of catalog). The data is public knowledge — round-trip fares from major US hubs. Add them to `BASE_PRICES` in `app.jsx` following the existing format. ~2 hours of work.

**Example block to add:**
```javascript
// Caribbean / Tropics
CUN:{ JFK:380, LAX:480, SFO:520, ORD:420, MIA:240, SEA:580, BOS:420, ATL:360, DEN:460, DFW:380, LAS:440, PHX:400, MSP:480, DTW:470 },
SXM:{ JFK:420, LAX:620, SFO:660, ORD:520, MIA:280, SEA:720, BOS:460, ATL:400, DEN:560, DFW:480, LAS:580, PHX:540, MSP:560, DTW:550 },
PLS:{ JFK:400, LAX:600, SFO:640, ORD:500, MIA:260, SEA:700, BOS:440, ATL:380, DEN:540, DFW:460, LAS:560, PHX:520, MSP:540, DTW:530 },
AXA:{ JFK:440, LAX:640, SFO:680, ORD:540, MIA:300, SEA:740, BOS:480, ATL:420, DEN:580, DFW:500, LAS:600, PHX:560, MSP:580, DTW:570 },
// Europe beach
IBZ:{ JFK:760, LAX:1060,SFO:1020,ORD:840, MIA:900, SEA:1100,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP:880, DTW:870 },
NCE:{ JFK:740, LAX:1020,SFO:980, ORD:820, MIA:880, SEA:1080,BOS:700, ATL:840, DEN:920, DFW:880, LAS:960, PHX:980, MSP:860, DTW:850 },
NAP:{ JFK:720, LAX:1000,SFO:960, ORD:800, MIA:860, SEA:1060,BOS:680, ATL:820, DEN:900, DFW:860, LAS:940, PHX:960, MSP:840, DTW:830 },
CAG:{ JFK:740, LAX:1020,SFO:980, ORD:820, MIA:880, SEA:1080,BOS:700, ATL:840, DEN:920, DFW:880, LAS:960, PHX:980, MSP:860, DTW:850 },
SPU:{ JFK:760, LAX:1040,SFO:1000,ORD:840, MIA:900, SEA:1100,BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000,MSP=880, DTW:870 },
FAO:{ JFK:700, LAX:1000,SFO:960, ORD:780, MIA:840, SEA:1040,BOS:660, ATL:800, DEN:880, DFW:840, LAS:920, PHX:940, MSP:820, DTW:810 },
// Asia
HKT:{ JFK:1280,LAX:1100,SFO:1080,ORD:1250,MIA:1380,SEA:1200,BOS:1340,ATL:1350,DEN:1220,DFW:1260, LAS:1180,PHX:1160,MSP:1290,DTW:1280 },
// Africa / Indian Ocean
ZNZ:{ JFK:1380,LAX:1560,SFO:1540,ORD:1460,MIA:1340,SEA:1640,BOS:1420,ATL:1380,DEN:1540,DFW:1460, LAS:1560,PHX:1540,MSP:1500,DTW:1490 },
MRU:{ JFK:1440,LAX:1600,SFO:1580,ORD:1520,MIA:1400,SEA:1700,BOS:1480,ATL:1440,DEN:1600,DFW:1520, LAS:1600,PHX:1580,MSP:1560,DTW:1550 },
// US East ski
BTV:{ JFK:180, LAX:400, SFO:380, ORD:260, MIA:280, SEA:440, BOS:120, ATL:260, DEN:360, DFW:320, LAS:380, PHX:360, MSP:300, DTW:280 },
ALB:{ JFK:160, LAX:380, SFO:360, ORD:240, MIA:260, SEA:420, BOS:140, ATL:240, DEN:340, DFW:300, LAS:360, PHX:340, MSP:280, DTW:260 },
```

---

### P1-2: Stale Branch Cleanup — 18 Dead Branches on Origin

15 `claude/` branches + 3 others (`fix-appjsx-final`, `restore-appjsx`, `test-small`) are sitting on origin. These are all unmerged exploratory agent attempts. They accumulate noise in `git branch -r` and slow down fetch.

```bash
# Review first, then delete
git branch -r | grep "claude/\|fix-appjsx-final\|restore-appjsx\|test-small"
# Delete all (Jack must run — destructive)
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

**Estimated: 5 minutes.**

---

## P2 — Fix This Sprint

### P2-1: No SRI on CDN Scripts (Open #10)

`index.html` loads React, ReactDOM, and Babel from unpkg with `crossorigin` but no `integrity` attribute. A compromised unpkg CDN could inject arbitrary JavaScript.

Risk is medium — unpkg has historically been reliable, and adding SRI breaks whenever CDN updates a minor version. Mitigating factor: the production build (`dist/app.min.js`) is already pre-transpiled by esbuild so Babel only runs in dev. Production users get SRI protection if we add it to the esbuild output.

**Minimum viable fix for the 3 highest-value tags:**
```html
<!-- Generate hashes once: curl https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_HERE"></script>
```

**Estimated: 30 minutes to generate and wire up hashes.**

### P2-2: Auto-Push Hook Not Running in Remote Sandbox

The `auto-push.sh` PostToolUse hook fires locally after every `Edit`/`Write` tool call and bumps the cache stamp in lockstep. In the remote execution environment (Cowork sandbox, scheduled tasks), the hook doesn't fire. Result: cache stamp goes stale after any remote-only edit session, as seen now (3 days stale after this week's agent report commits).

**Fix:** Add a cache-stamp bump to the report commit itself when running as a scheduled task. Or Jack runs the bump manually after each scheduled-agent session that touches `app.jsx`.

No code change needed — this is an operational constraint. Just don't let it go more than 24h stale.

---

## Cost Analysis

| Tier | MAU | Infra Cost | Breakdown |
|------|-----|-----------|-----------|
| Current | <10 | $6/mo | DigitalOcean 1GB droplet |
| Launch | 1K | $6/mo | Same droplet handles it comfortably |
| Growth | 10K | $18–24/mo | Upgrade to 2GB ($12) + CDN egress |
| Scale | 100K | $100–200/mo | 3× droplet + CDN + DB upgrade |

GitHub Pages is free and handles unlimited static traffic — that's not the bottleneck.

**Open-Meteo is the cost cliff at scale.** Free tier: 10K req/day. At 100K MAU with 373 venues, a single cold-cache VPS restart fans out 746 upstream calls per unique user group. 14 cold-miss groups = ceiling hit for the day. The disk-persistence fix added this run (Open #23) cuts cold-restart exposure dramatically — warm entries survive the restart and no refill is needed. Still: at 100K MAU with distributed caches, the proxy becomes mandatory infrastructure, not optional enhancement.

**What breaks first:** Open-Meteo rate ceiling, not the droplet. Before Reddit/HN post: verify `/health` shows `wx_cache_size` > 100 within 30 minutes of deploy.

---

## Summary — What's Left Before Reddit

1. **Jack: SSH + scp proxy.js** (10 min) — 12 days overdue, everything else depends on it
2. **Jack: bump cache stamp** (3 min) — stale 3 days, SW caches are stale for existing users
3. **Jack or agent: BASE_PRICES top-15** (2hr) — 70+ venues with broken deal scores
4. **Jack: delete 18 stale branches** (5 min) — cosmetic but accumulating
5. Photos (#20) — 346/373 venues still generic stock

Items 1–2 are under 15 minutes total. They've been under 15 minutes for 12 days.
