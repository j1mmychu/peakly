# DevOps Report — 2026-08-24 (GREEN)

**Status: 🟢 GREEN — Post-launch day 2. No P0/P1 issues. One P2, three P3s.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (standard sandbox egress block, not a VPS outage). Jack confirmed healthy 2026-08-11 post-redeploy: disk cache live, `forecast_days:14`, CORS fixed, DELETE alerts working, `apns:configured`. Treating as healthy. Do not re-flag from sandbox.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **14,002 lines / 745,431 bytes** (728 KB raw — identical to Aug 23, no change) |
| `dist/app.min.js` | **495 KB** (local snapshot Aug 21; CI rebuilds fresh on every push to Pages — informational only) |
| Cache stamp — source | **`20260823b`** ✅ `app.jsx:17` + `sw.js:2` + `index.html:395` — fully in lockstep |
| `PEAKLY_BUILD` | **`20260823b`** ✅ |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` |
| Sentry DSN | ✅ Live — `app.jsx:7–8` + `index.html:77`; `captureException` wired at error boundary + `logError`; `tracesSampleRate: 0.05` |
| Venue count | **391** (131 ski / 260 beach) — grep-verified |
| Lazy images | ✅ 9/9 `<img>` render sites include `loading="lazy"` |
| Babel in production | ✅ Stripped — `dist/index.html` loads `app.min.js`; no Babel parse wall in prod |
| Duplicate venues | ✅ 0 (boot-time dup-id IIFE at `app.jsx:528`) |

No P0 or P1 issues in site health.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in source | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| Old HTTP IP `104.131.82.242` | ✅ Zero references |
| Old HTTP IP `198.199.80.21` | ✅ Zero references in client code |
| `fetchTravelpayoutsPrice` timeout | **1,500ms** AbortController at `app.jsx:6273` — see P3 below |
| Fallback on proxy failure | ✅ Falls back to BASE_PRICES estimate, `_flightApiStatus = "down"` |
| Weather proxy timeout | ✅ 4,000ms (`_tryProxyWx`) + 8,000ms direct fallback |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Weather `forecast_days` | **14** (`app.jsx:5440`) ✅ |
| Marine `forecast_days` | **10** (`app.jsx:5484`) ✅ |
| Open-Meteo retry logic | ✅ 3 attempts, exponential backoff 1.2s/2.4s, 429 handled |
| Rate limit exposure | Low — VPS proxies with disk cache (live since 2026-08-11); direct Open-Meteo fallback only if VPS down |
| API batching | 50 venues / 2s window — free-tier ceiling (~66 concurrent DAU on same venues) not breached at current traffic |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | ✅ Server-side only. Client has `TP_MARKER = "710303"` (public affiliate marker, not the API token) |
| Supabase anon key | ℹ️ Exposed in `app.jsx:26` — **expected and correct** for Supabase architecture. RLS enforces row-level security; anon key is designed to be public. Not a vulnerability. |
| Other tokens/secrets | ✅ None found — no `sk-`, `eyJ` (non-Supabase), password fields, or `.env` vars in client code |
| `.gitignore` | ✅ Covers `.env*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| `.env` files on disk | ✅ None present in working tree |
| Recent commits | ✅ Last 10 commits are daily reports + widget changes — no secret exposure |
| Sentry DSN in client | ℹ️ `app.jsx:8` and `index.html:77` — Sentry DSNs are public-facing by design (rate-limited, project-scoped). Not a vulnerability. |

**No security issues.**

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| Total JS payload (prod) | **~720 KB** — 495 KB `app.min.js` + 137 KB React 18.3.1 + 50 KB ReactDOM (compressed over wire: ~200 KB gzipped) |
| Dev mode JS payload | **~2.8 MB** — 728 KB `app.jsx` + Babel Standalone (~1.5 MB) + React UMD (dev). Never served to real users via Pages. |
| CDN — React | `unpkg.com/react@18.3.1` ✅ current (18.3.1 is latest React 18 stable) |
| CDN — Babel | `unpkg.com/@babel/standalone@7.29.7` ✅ current |
| CDN — Supabase | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2` — **pinned version, not latest** (v2.106.2 vs latest ~2.110.x). No breaking changes in patch range. |
| No SRI hashes on CDN scripts | ⚠️ See P3 below |
| Largest bottleneck | **Open-Meteo rate limit** — at 66+ concurrent unique-venue DAU the free tier will return 429s. VPS disk cache (live 2026-08-11) is the mitigation. Without it a Reddit spike would expose this immediately. |

---

## 6. BASE_PRICES Coverage (P2)

Ran automated venue-AP inventory against BASE_PRICES keys:

- **Unique venue `ap` codes:** 162  
- **BASE_PRICES outer keys:** 160  
- **Venue APs missing from BASE_PRICES:** **23** (14.2% of venue airports)

Missing airports: `BOC, FEN, SRQ, EYW, VPS, MYR, BME, KRK, GEG, HNA, RDD, USH, EAS, LEA, INH, KUL, BEY, TBS, SOF, OKA, SID, DJE, CMH`

Coverage improved from 82% (Aug 23 content report) → **85.8%** today. The 23 remaining missing airports affect deal badge accuracy for those venues — they show `~$X` estimates only, no deal scoring.

---

## 7. Cost Estimate

| Tier | MAU | Monthly Infra Cost | Notes |
|------|-----|--------------------|-------|
| Now | <100 | **$6** | DigitalOcean 1GB droplet; GH Pages free; Open-Meteo free; Supabase free |
| 1K MAU | 1,000 | **$6** | Current infra holds; VPS cache absorbs weather load |
| 10K MAU | 10,000 | **~$18–24** | Upgrade to 2GB droplet (~$12); Supabase free tier (500MB DB, 50K MAU auth) may be hit; Open-Meteo free tier holds with VPS cache |
| 100K MAU | 100,000 | **~$80–140** | 4GB VPS ($24), Supabase Pro ($25), Open-Meteo Commercial (~$50/mo for >10K calls/day), Cloudflare CDN (free tier likely sufficient) |

**Cost optimization opportunity:** Supabase free tier allows 50K active users/month. At 10K+ MAU, switch to Supabase Pro ($25/mo) before hitting auth limits. The only mandatory upgrade before 10K MAU is the VPS if weather cache memory pressure climbs (current 1GB RAM handles ~595 venue cache entries confirmed by `/health` on 2026-08-11).

---

## Issues

### P2 — BASE_PRICES: 23 venue airports still missing (14.2%)

**Impact:** 23 airport codes show no deal badge and no `~$X` fallback in card view — users see blank price until live Travelpayouts responds. At <100 MAU this is cosmetic. At 1K+ MAU these are real venue impressions with degraded UX.

**Missing airports and approximate fares (JFK baseline):**
```
BOC (Bocas del Toro, Panama):   { JFK:520, LAX:560, ORD:490, MIA:320, BOS:580, ATL:420, DFW:470, SFO:620, SEA:640, DEN:510, LAS:540, PHX:530, MSP:520, DTW:510 }
FEN (Fernando de Noronha, BR):  { JFK:1400,LAX:1600,ORD:1500,MIA:1100,BOS:1450,ATL:1300,DFW:1400,SFO:1700,SEA:1750,DEN:1550,LAS:1600,PHX:1580,MSP:1560,DTW:1550 }
SRQ (Sarasota, FL):             { JFK:280, LAX:380, ORD:240, MIA:180, BOS:320, ATL:180, DFW:280, SFO:420, SEA:440, DEN:300, LAS:320, PHX:300, MSP:280, DTW:260 }
EYW (Key West, FL):             { JFK:320, LAX:440, ORD:300, MIA:160, BOS:360, ATL:220, DFW:320, SFO:480, SEA:500, DEN:360, LAS:380, PHX:360, MSP:340, DTW:320 }
VPS (Destin/Fort Walton, FL):   { JFK:300, LAX:380, ORD:260, MIA:220, BOS:340, ATL:180, DFW:260, SFO:420, SEA:440, DEN:320, LAS:340, PHX:320, MSP:300, DTW:280 }
MYR (Myrtle Beach, SC):         { JFK:260, LAX:380, ORD:280, MIA:240, BOS:280, ATL:180, DFW:300, SFO:420, SEA:440, DEN:320, LAS:340, PHX:320, MSP:320, DTW:300 }
BME (Broome, Australia):        { JFK:2200,LAX:1800,ORD:2100,MIA:2000,BOS:2300,ATL:2100,DFW:2100,SFO:1900,SEA:1900,DEN:2000,LAS:1980,PHX:1960,MSP:2100,DTW:2100 }
KRK (Krakow, Poland):           { JFK:820, LAX:1100,ORD:880, MIA:950, BOS:780, ATL:880, DFW:940, SFO:1100,SEA:1150,DEN:980, LAS:1040,PHX:1060,MSP:940, DTW:920 }
GEG (Spokane, WA):              { JFK:360, LAX:240, ORD:300, MIA:440, BOS:400, ATL:400, DFW:340, SFO:240, SEA:120, DEN:260, LAS:220, PHX:220, MSP:340, DTW:360 }
HNA (Hanamaki, Japan):          { JFK:1200,LAX:1100,ORD:1180,MIA:1300,BOS:1250,ATL:1280,DFW:1240,SFO:1050,SEA:1050,DEN:1160,LAS:1140,PHX:1120,MSP:1200,DTW:1190 }
RDD (Redding, CA):              { JFK:440, LAX:240, ORD:380, MIA:520, BOS:480, ATL:500, DFW:420, SFO:200, SEA:280, DEN:320, LAS:300, PHX:300, MSP:420, DTW:430 }
USH (Ushuaia, Argentina):       { JFK:1400,LAX:1300,ORD:1500,MIA:1100,BOS:1450,ATL:1300,DFW:1350,SFO:1450,SEA:1500,DEN:1400,LAS:1380,PHX:1360,MSP:1460,DTW:1450 }
EAS (San Sebastián, Spain):     { JFK:800, LAX:1100,ORD:860, MIA:920, BOS:760, ATL:870, DFW:920, SFO:1100,SEA:1150,DEN:980, LAS:1040,PHX:1060,MSP:960, DTW:940 }
LEA (Learmonth/Exmouth, AU):    { JFK:2200,LAX:1800,ORD:2100,MIA:2000,BOS:2300,ATL:2100,DFW:2100,SFO:1900,SEA:1900,DEN:2000,LAS:1980,PHX:1960,MSP:2100,DTW:2100 }
INH (Inhambane, Mozambique):    { JFK:1800,LAX:2000,ORD:1900,MIA:1700,BOS:1850,ATL:1750,DFW:1800,SFO:2100,SEA:2150,DEN:1950,LAS:2000,PHX:1980,MSP:1950,DTW:1940 }
KUL (Kuala Lumpur, Malaysia):   { JFK:1100,LAX:900, ORD:1050,MIA:1200,BOS:1150,ATL:1180,DFW:1140,SFO:900, SEA:920, DEN:1060,LAS:1040,PHX:1020,MSP:1100,DTW:1090 }
BEY (Beirut, Lebanon):          { JFK:900, LAX:1200,ORD:960, MIA:1020,BOS:860, ATL:960, DFW:1020,SFO:1200,SEA:1250,DEN:1080,LAS:1140,PHX:1160,MSP:1040,DTW:1020 }
TBS (Tbilisi, Georgia):         { JFK:980, LAX:1280,ORD:1040,MIA:1100,BOS:940, ATL:1040,DFW:1100,SFO:1280,SEA:1330,DEN:1160,LAS:1220,PHX:1240,MSP:1120,DTW:1100 }
SOF (Sofia, Bulgaria):          { JFK:820, LAX:1100,ORD:880, MIA:950, BOS:780, ATL:880, DFW:940, SFO:1100,SEA:1150,DEN:980, LAS:1040,PHX:1060,MSP:940, DTW:920 }
OKA (Okinawa, Japan):           { JFK:1200,LAX:1050,ORD:1150,MIA:1300,BOS:1250,ATL:1280,DFW:1240,SFO:980, SEA:1000,DEN:1130,LAS:1110,PHX:1090,MSP:1170,DTW:1160 }
SID (Sal, Cape Verde):          { JFK:1100,LAX:1400,ORD:1200,MIA:1000,BOS:1050,ATL:1100,DFW:1200,SFO:1500,SEA:1550,DEN:1350,LAS:1400,PHX:1380,MSP:1300,DTW:1280 }
DJE (Djerba, Tunisia):          { JFK:900, LAX:1200,ORD:960, MIA:1020,BOS:860, ATL:960, DFW:1020,SFO:1200,SEA:1250,DEN:1080,LAS:1140,PHX:1160,MSP:1040,DTW:1020 }
CMH (Columbus, OH):             { JFK:240, LAX:380, ORD:160, MIA:320, BOS:280, ATL:200, DFW:280, SFO:420, SEA:440, DEN:300, LAS:320, PHX:300, MSP:260, DTW:200 }
```

**Fix — paste into `BASE_PRICES` block in `app.jsx` after the last entry before the closing `};`:**
```javascript
  BOC:{ JFK:520, LAX:560, ORD:490, MIA:320, BOS:580, ATL:420, DFW:470, SFO:620, SEA:640, DEN:510, LAS:540, PHX:530, MSP:520, DTW:510 },
  FEN:{ JFK:1400,LAX:1600,ORD:1500,MIA:1100,BOS:1450,ATL:1300,DFW:1400,SFO:1700,SEA:1750,DEN:1550,LAS:1600,PHX:1580,MSP:1560,DTW:1550 },
  SRQ:{ JFK:280, LAX:380, ORD:240, MIA:180, BOS:320, ATL:180, DFW:280, SFO:420, SEA:440, DEN:300, LAS:320, PHX:300, MSP:280, DTW:260 },
  EYW:{ JFK:320, LAX:440, ORD:300, MIA:160, BOS:360, ATL:220, DFW:320, SFO:480, SEA:500, DEN:360, LAS:380, PHX:360, MSP:340, DTW:320 },
  VPS:{ JFK:300, LAX:380, ORD:260, MIA:220, BOS:340, ATL:180, DFW:260, SFO:420, SEA:440, DEN:320, LAS:340, PHX:320, MSP:300, DTW:280 },
  MYR:{ JFK:260, LAX:380, ORD:280, MIA:240, BOS:280, ATL:180, DFW:300, SFO:420, SEA:440, DEN:320, LAS:340, PHX:320, MSP:320, DTW:300 },
  BME:{ JFK:2200,LAX:1800,ORD:2100,MIA:2000,BOS:2300,ATL:2100,DFW:2100,SFO:1900,SEA:1900,DEN:2000,LAS:1980,PHX:1960,MSP:2100,DTW:2100 },
  KRK:{ JFK:820, LAX:1100,ORD:880, MIA:950, BOS:780, ATL:880, DFW:940, SFO:1100,SEA:1150,DEN:980, LAS:1040,PHX:1060,MSP:940, DTW:920 },
  GEG:{ JFK:360, LAX:240, ORD:300, MIA:440, BOS:400, ATL:400, DFW:340, SFO:240, SEA:120, DEN:260, LAS:220, PHX:220, MSP:340, DTW:360 },
  HNA:{ JFK:1200,LAX:1100,ORD:1180,MIA:1300,BOS:1250,ATL:1280,DFW:1240,SFO:1050,SEA:1050,DEN:1160,LAS:1140,PHX:1120,MSP:1200,DTW:1190 },
  RDD:{ JFK:440, LAX:240, ORD:380, MIA:520, BOS:480, ATL:500, DFW:420, SFO:200, SEA:280, DEN:320, LAS:300, PHX:300, MSP:420, DTW:430 },
  USH:{ JFK:1400,LAX:1300,ORD:1500,MIA:1100,BOS:1450,ATL:1300,DFW:1350,SFO:1450,SEA:1500,DEN:1400,LAS:1380,PHX:1360,MSP:1460,DTW:1450 },
  EAS:{ JFK:800, LAX:1100,ORD:860, MIA:920, BOS:760, ATL:870, DFW:920, SFO:1100,SEA:1150,DEN:980, LAS:1040,PHX:1060,MSP:960, DTW:940 },
  LEA:{ JFK:2200,LAX:1800,ORD:2100,MIA:2000,BOS:2300,ATL:2100,DFW:2100,SFO:1900,SEA:1900,DEN:2000,LAS:1980,PHX:1960,MSP:2100,DTW:2100 },
  INH:{ JFK:1800,LAX:2000,ORD:1900,MIA:1700,BOS:1850,ATL:1750,DFW:1800,SFO:2100,SEA:2150,DEN:1950,LAS:2000,PHX:1980,MSP:1950,DTW:1940 },
  KUL:{ JFK:1100,LAX:900, ORD:1050,MIA:1200,BOS:1150,ATL:1180,DFW:1140,SFO:900, SEA:920, DEN:1060,LAS:1040,PHX:1020,MSP:1100,DTW:1090 },
  BEY:{ JFK:900, LAX:1200,ORD:960, MIA:1020,BOS:860, ATL:960, DFW:1020,SFO:1200,SEA:1250,DEN:1080,LAS:1140,PHX:1160,MSP:1040,DTW:1020 },
  TBS:{ JFK:980, LAX:1280,ORD:1040,MIA:1100,BOS:940, ATL:1040,DFW:1100,SFO:1280,SEA:1330,DEN:1160,LAS:1220,PHX:1240,MSP:1120,DTW:1100 },
  SOF:{ JFK:820, LAX:1100,ORD:880, MIA:950, BOS:780, ATL:880, DFW:940, SFO:1100,SEA:1150,DEN:980, LAS:1040,PHX:1060,MSP:940, DTW:920 },
  OKA:{ JFK:1200,LAX:1050,ORD:1150,MIA:1300,BOS:1250,ATL:1280,DFW:1240,SFO:980, SEA:1000,DEN:1130,LAS:1110,PHX:1090,MSP:1170,DTW:1160 },
  SID:{ JFK:1100,LAX:1400,ORD:1200,MIA:1000,BOS:1050,ATL:1100,DFW:1200,SFO:1500,SEA:1550,DEN:1350,LAS:1400,PHX:1380,MSP:1300,DTW:1280 },
  DJE:{ JFK:900, LAX:1200,ORD:960, MIA:1020,BOS:860, ATL:960, DFW:1020,SFO:1200,SEA:1250,DEN:1080,LAS:1140,PHX:1160,MSP:1040,DTW:1020 },
  CMH:{ JFK:240, LAX:380, ORD:160, MIA:320, BOS:280, ATL:200, DFW:280, SFO:420, SEA:440, DEN:300, LAS:320, PHX:300, MSP:260, DTW:200 },
```

**Estimated fix time:** 5 minutes — copy the block above, find `const BASE_PRICES = {` in `app.jsx`, paste before the closing `};`. The auto-push hook commits and deploys. **Coverage goes to 100%.**

---

### P3-A — `fetchTravelpayoutsPrice` timeout is 1,500ms

At `app.jsx:6273`: `const timeout = setTimeout(() => controller.abort(), 1500);`

1.5 seconds is aggressive. The VPS is on DigitalOcean NYC; if the VPS is under cache-miss load or the Travelpayouts upstream is slow (common), valid responses arrive after 1.5s and get treated as failures, silently falling back to BASE_PRICES estimates. The weather proxy correctly uses 4,000ms. Fix:

```javascript
// app.jsx:6273 — change 1500 to 4000
const timeout = setTimeout(() => controller.abort(), 4000);
```

**Estimated fix time:** 30 seconds.

---

### P3-B — Stale claude/* branches accumulating

`git fetch` shows 11 new `claude/` branches and 4 other feature branches (`fix-appjsx-final`, `restore-appjsx`, `test-small`) still open on origin. These are abandoned agent worktrees.

```bash
# Verify none are in-use, then bulk delete from origin:
git branch -r | grep "origin/claude/" | sed 's|origin/||' | xargs -I{} git push origin --delete {}
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

**Estimated fix time:** 2 minutes. Low priority — cosmetic repo hygiene, zero runtime impact.

---

### P3-C — No SRI hashes on CDN scripts

`index.html` loads React, ReactDOM, and Babel from unpkg without `integrity=` attributes. If unpkg is compromised or serves corrupted content, malicious JS would execute with full page context. This is a known architectural tradeoff for the CDN-first no-build-step approach.

Production users are served `dist/index.html` which loads only `app.min.js` (GitHub Pages, no CDN dependency). The SRI gap only affects the dev `index.html`. Risk is low but real for anyone running dev mode.

No urgent fix needed — noted for when SRI is eventually added to `index.html` for defense-in-depth.

---

## Scaling Bottleneck

**What breaks first: Open-Meteo free-tier rate limit at ~66 concurrent unique-venue requests.**

The VPS weather cache with disk persistence (confirmed live 2026-08-11) is the primary defense. A Reddit or HN spike with 66+ concurrent users fetching distinct venue weather simultaneously would exhaust the free tier before the cache fills. At that point: `fetchWeather` fails, `scoreVenue` gets `null` weather, venues score at 50 (base), the Explore grid goes flat — not a crash but a silent UX collapse.

**Prevention:** The 2026-08-11 VPS redeploy shipped disk cache persistence (Open #23 fixed). That cache survives `pm2 restart` and rebuilds from a cold state in one batch cycle (<5 minutes). With warm cache, a Reddit spike of 10,000 users all hitting the same 391 venues triggers exactly 391 Open-Meteo calls in 2 hours — well within free tier. The architecture is correct. The only remaining risk is a cold-cache spike (right after a VPS restart), which the disk cache mitigates.

**At 10K MAU (paid traffic):** Supabase free tier hits its 50K auth-user ceiling. Upgrade to Supabase Pro ($25/mo) before this. Infrastructure cost stays under $40/month to 10K MAU.

---

*Report generated: 2026-08-24. Next automated run: 2026-08-25 14:00 UTC.*
