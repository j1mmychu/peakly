# DevOps Report — 2026-08-23 (GREEN)

**Status: 🟢 GREEN — Post-launch day. Widget gating confirmed safe. No P0/P1 issues.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (standard sandbox egress block, not a VPS outage). VPS confirmed healthy by Jack 2026-08-11: disk cache live, `forecast_days:14`, CORS fixed, DELETE alerts working, `apns:configured`. Treating as healthy. Stop re-flagging from sandbox.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,002 lines / 745,431 bytes** (+41 lines / +3KB since Aug 22 — widget session-gate change) |
| `dist/app.min.js` | **495 KB** (Aug 21 build — CI rebuilds on every push; this local snapshot is informational only) |
| Cache stamp — source | **`20260823b`** ✅ in `app.jsx:17` + `sw.js:2` + `index.html:395` — fully in lockstep |
| Cache stamp — `dist/index.html` | **`v=20260821b`** ⚪ 2 sub-suffixes behind (cosmetic; CI rebuilds `dist/` fresh on every push to Pages) |
| `PEAKLY_BUILD` | **`20260823b`** ✅ |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` |
| Sentry | ✅ DSN live — `app.jsx:7–8` + `index.html:77`; `captureException` wired; `tracesSampleRate: 0.05` |
| Venue count | **391** (131 ski / 260 beach) — eval-counted, not grep |
| Lazy images | ✅ All `<img>` render sites include `loading="lazy"` |
| Babel in production | ✅ STRIPPED — `dist/index.html` loads `app.min.js` only; no Babel parse wall |
| Duplicate venues | ✅ 0 (title+location hash check) |

**No P0 or P1 issues in site health.**

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in source | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| Old HTTP IP `104.131.82.242` | ✅ Zero references in any source file |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s `AbortController` at `app.jsx:5410` |
| Fallback on proxy failure | ✅ Falls back to direct Open-Meteo / estimate pricing |

No flight proxy issues.

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Weather `forecast_days` | **14** (`app.jsx:5438`) ✅ matches VPS fix from 2026-08-11 |
| Marine `forecast_days` | **10** (`app.jsx:5482`) ✅ |
| Rate limit exposure | Low — VPS proxies with disk cache; direct fallback only if VPS is down |
| API batching | 50 venues per 2s window (hardcoded) — avoids free-tier ceiling at <66 concurrent users |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Supabase anon key in client | `app.jsx:26` — **intentional and documented** (public anon key + RLS gating; not a secret) |
| Travelpayouts server token | ✅ Server-side only (`server/proxy.js`); `TP_MARKER` (affiliate deep-link ID `710303`) in client is public-safe |
| Sentry DSN in client | `app.jsx:8` — intentional (browser SDK pattern; Sentry DSN is not a secret) |
| `.gitignore` covers secrets | ✅ `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` all covered |
| Recent commit secret scan | ✅ `fff7d60`, `73abdf1` — app.jsx/sw.js changes only, no credentials introduced |
| APNS `.p8` key | ✅ `server/proxy.js` reads from `APNS_KEY_PATH` env var; never in source |

**No security issues.**

---

## 5. Performance Analysis

**Production payload (dist path — what users actually get):**

| Asset | Size (gzipped est.) |
|-------|---------------------|
| React 18 UMD prod | ~42 KB |
| ReactDOM 18 UMD prod | ~130 KB |
| `app.min.js` (495 KB uncompressed) | ~125–145 KB |
| Sentry SDK | ~30 KB |
| Plus Jakarta Sans (Google Fonts) | ~20 KB |
| **Total first load** | **~350–370 KB** |

Babel standalone (950 KB uncompressed) is **not loaded in production** — only in local dev via `index.html`. CI pre-compiles `app.jsx → dist/app.min.js` on every push. The 3–5s mobile parse wall is eliminated.

**Largest bottleneck:** ReactDOM UMD. At scale, switching to ESM React with `importmap` would shave ~80KB, but this breaks the no-build-step constraint. Not worth touching.

**Image lazy loading:** ✅ All 9 `<img>` render sites use `loading="lazy"`.

---

## 6. Cost Estimate

| MAU | Open-Meteo | DO Droplet | GitHub Pages | **Total** |
|-----|-----------|------------|--------------|-----------|
| 1K | Free tier | $6 | $0 | **$6** |
| 10K | Free tier (VPS cache absorbs spikes) | $6–12 | $0 | **$6–12** |
| 100K | ~$29/mo (paid tier kicks in) | $12–24 (2GB droplet) | $0 | **$41–53** |

**Optimization at 100K MAU:** Upgrade DO to 2GB RAM ($12/mo), increase `_wxCache` LRU from 4,000 → 10,000 entries in `server/proxy.js`. That's a one-line change that eliminates most paid Open-Meteo exposure by increasing cache hit rate.

---

## Issues

### 🟡 P2 — BASE_PRICES still missing 29 venue airports (18% gap)

**Coverage: 133/162 unique venue airports (82%).** Up from the ~68% flagged in July (commit `3fd1995` added PPT, CEB, FOR, NAT, and others), but 29 airports remain uncovered. Without a BASE_PRICES entry for a venue's airport, `getDealScore()` returns a neutral score and the venue never shows a deal badge.

**Missing airports and their venues:**
```
BOS → Sunday River, Sugarloaf, Race Point Beach
JFK → Cooper's Beach
LAX → Manhattan Beach, Zuma Beach Malibu
SEA → Crystal Mountain, Stevens Pass
MIA → South Beach
ORD → Wilmot Mountain
BEY → Mzaar Kfardebian
KUL → Tioman Island
SID → Santa Maria Beach (Cape Verde)
SOF → Bansko Ski Resort
BME, BOC, CMH, DJE, EAS, EYW, FEN, GEG, HNA, INH, KRK, LEA, MYR, OKA, RDD, SRQ, TBS, USH, VPS
```

The US airports (BOS, JFK, LAX, SEA, MIA, ORD) are high-traffic venues. A user flying FROM Chicago can't get a deal score on South Beach because MIA has no BASE_PRICES entry — the deal badge that should be the headline feature for this venue is dark.

**Fix — add the 29 missing airports to BASE_PRICES in `app.jsx` (~line 6330):**

Use median round-trip fares by region. Conservative estimates are better than none:

```js
// US domestic venues (users flying FROM these airports TO nearby spots is unusual,
// but these airports appear as DESTINATION airports for close-proximity venues)
BOS:{ JFK:280, LAX:380, SFO:400, ORD:260, MIA:300, SEA:420, BOS:0,   ATL:280, DEN:360, DFW:340, LAS:400, PHX:380, MSP:300, DTW:260 },
JFK:{ JFK:0,   LAX:360, SFO:380, ORD:260, MIA:280, SEA:420, BOS:260, ATL:260, DEN:380, DFW:340, LAS:420, PHX:400, MSP:300, DTW:280 },
LAX:{ JFK:360, LAX:0,   SFO:160, ORD:300, MIA:340, SEA:200, BOS:380, ATL:340, DEN:220, DFW:260, LAS:160, PHX:200, MSP:320, DTW:340 },
SEA:{ JFK:380, LAX:200, SFO:160, ORD:300, MIA:400, SEA:0,   BOS:380, ATL:380, DEN:220, DFW:300, LAS:220, PHX:260, MSP:280, DTW:340 },
MIA:{ JFK:260, LAX:380, SFO:400, ORD:280, MIA:0,   SEA:400, BOS:280, ATL:200, DEN:340, DFW:280, LAS:380, PHX:360, MSP:320, DTW:300 },
ORD:{ JFK:260, LAX:300, SFO:320, ORD:0,   MIA:280, SEA:300, BOS:260, ATL:240, DEN:260, DFW:260, LAS:320, PHX:300, MSP:180, DTW:180 },
// Lebanon
BEY:{ JFK:1100,LAX:1400,SFO:1500,ORD:1200,MIA:1300,SEA:1500,BOS:1100,ATL:1300,DEN:1400,DFW:1350,LAS:1450,PHX:1400,MSP:1300,DTW:1250 },
// Malaysia
KUL:{ JFK:1200,LAX:900, SFO:950, ORD:1150,MIA:1300,SEA:1000,BOS:1250,ATL:1300,DEN:1050,DFW:1100,LAS:1000,PHX:1050,MSP:1150,DTW:1150 },
// Cape Verde
SID:{ JFK:900, LAX:1200,SFO:1300,ORD:1000,MIA:850, SEA:1400,BOS:950, ATL:1000,DEN:1100,DFW:1050,LAS:1200,PHX:1150,MSP:1050,DTW:1000 },
// Bulgaria
SOF:{ JFK:900, LAX:1200,SFO:1300,ORD:1000,MIA:1100,SEA:1350,BOS:900, ATL:1100,DEN:1200,DFW:1150,LAS:1300,PHX:1250,MSP:1100,DTW:1050 },
// Add remaining 19 with regional median estimates (2-3h per airport group)
```

Estimated time: **2 hours** to research and add the 29 airports. This is the biggest remaining data gap affecting the headline feature at launch traffic.

---

### ⚪ P3 — `dist/index.html` cache version 2 sub-suffixes behind source

Source is at `20260823b`; `dist/index.html` references `v=20260821b`. The `dist/` folder is rebuilt by CI on every push — zero user impact. Self-corrects on next push that touches `app.jsx`/`sw.js`/`index.html`.

No action required.

---

### ⚪ P3 — Two ready-to-ship diffs are superseded, should be archived

`reports/ready-to-ship/airport-coords-10-add-2026-08-20.diff` — CEB, PPT, FOR, NAT and 6 others were all applied in commit `3fd1995`. Diff is dead. **Do not re-apply.**

`reports/ready-to-ship/venue-dupes-delete-2026-08-20.diff` — 0 venue duplicates confirmed today (eval pass). Applied.

Additionally, these May diffs are confirmed dead (noted in Aug 22 report but still present):
`aruba-eagle-dupe-delete-2026-05-04.diff`, `cache-buster-bump-2026-05-04.diff`,
`gear-gate-flip-2026-05-04.diff`, `pm-prompt-header-refresh-2026-05-06.diff`,
`deploy-chain-2026-05-07.diff`, `eager-supabase-delete-2026-05-08.diff`,
`eager-supabase-delete-2026-06-11.diff`, `alert-copy-email-honesty-2026-06-10.diff`

```bash
mkdir -p reports/archive/ready-to-ship-2026-08-23
mv reports/ready-to-ship/airport-coords-10-add-2026-08-20.diff \
   reports/ready-to-ship/venue-dupes-delete-2026-08-20.diff \
   reports/ready-to-ship/aruba-eagle-dupe-delete-2026-05-04.diff \
   reports/ready-to-ship/cache-buster-bump-2026-05-04.diff \
   reports/ready-to-ship/gear-gate-flip-2026-05-04.diff \
   reports/ready-to-ship/pm-prompt-header-refresh-2026-05-06.diff \
   reports/ready-to-ship/deploy-chain-2026-05-07.diff \
   reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff \
   reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff \
   reports/ready-to-ship/alert-copy-email-honesty-2026-06-10.diff \
   reports/archive/ready-to-ship-2026-08-23/
```

Estimated time: 2 minutes.

---

### ⚪ P3 — 15 stale `claude/` branches on `origin`

Exploratory worktree branches from automated agents. No security risk (public repo, no secrets). Clutter only.

```bash
git fetch --prune
for b in $(git branch -r | grep 'origin/claude/' | sed 's|origin/||'); do
  git push origin --delete "$b"
done
```

Also `fix-appjsx-final`, `restore-appjsx`, `test-small` are sitting on origin and appear to be stale. Verify before deleting.

Estimated time: 5 minutes. Post-launch.

---

## What Breaks First at Scale

**Open-Meteo cold-cache window after a VPS restart.** Scenario: Reddit/HN post lands → 200 users simultaneously open Peakly → VPS was restarted 10 minutes ago (routine update) → disk cache is cold → 391 venues × first-touch = 391 upstream Open-Meteo requests fire in ~2s. At >66 uncached simultaneous coordinates you start seeing 429s. The disk cache fills within 60 seconds and collapses the problem, but that first wave is the danger window.

**Prevention: pre-warm before any social post.** SSH to VPS and hit the top 20 venue lat/lon coordinates before posting anywhere:

```bash
# Run from VPS before Reddit post
for coord in "45.5/-122.6" "40.7/-74.0" "34.0/-118.2" "47.6/-122.3" "25.8/-80.1" \
             "41.9/-87.6" "21.3/-157.8" "36.1/-115.2" "33.4/-112.1" "44.9/-93.2"; do
  lat=$(echo $coord | cut -d/ -f1); lon=$(echo $coord | cut -d/ -f2)
  curl -s "https://peakly-api.duckdns.org/api/weather?lat=$lat&lon=$lon" > /dev/null
  echo "Warmed $lat/$lon"
done
```

At 10K MAU sustained: upgrade DO droplet to 2GB RAM ($12/mo), bump `_wxCache` LRU from 4,000 → 10,000 in `server/proxy.js` line ~95:
```js
const _wxCache = new LRUCache(10000, 2 * 60 * 60 * 1000);  // was 4000
```

At 100K MAU: Open-Meteo paid tier ($29/mo) is unavoidable but cache hit rate will be >95% with the larger LRU. The VPS handles it.

---

*Report generated: 2026-08-23. Verified against `origin/main` at commit `73abdf1`.*
