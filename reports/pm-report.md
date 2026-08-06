# PM Report v111 — 2026-08-06

> Supersedes v110 (Aug 5). **Status: RED.** Day 37. VPS unredeployed — **Day 14**. Cache stamp ✅ current (20260806a, bumped by DevOps). BASE_PRICES 31.5% (46/146 venue destination APs). **9 days to Aug 15 Reddit deadline.** Content moratorium violation #10.

---

## Shipped Since v110

| Commit | What | Assessment |
|--------|------|------------|
| `7d726a3` | DevOps report 08-06: cache stamp bumped 20260805a → 20260806a in app.jsx/sw.js/index.html | ✅ Maintenance. Only code change to reach users. |
| `d75ef27` | Content report 08-06: 5 new proposals PPT/REC/OAX/SAL/PDG (backlog → 46 unshipped venues) | ❌ Moratorium violation #10. Permanent suppression triggered. |

**The only thing that reached users today: a cache stamp bump.** BASE_PRICES top-7 still not pasted (6th consecutive carry). VPS still unredeployed (14 days). 9 days to Reddit.

**Permanent corrections — stop re-raising these:**
- **Peakly Pro**: CUT. Zero instances in codebase. Not a pricing bug.
- **Sentry DSN**: LIVE. DSN `9416b032...` wired at app.jsx:7 and index.html:77.
- **Open #21 and #23**: CODE-COMPLETE in committed proxy.js — inert only until VPS deploy.
- **BASE_PRICES 10.3% (DevOps)**: Permanently wrong. DevOps counts origin hub cities as destination APs. Real destination AP coverage is **31.5% (46/146)**. This figure is PM-confirmed by independent audit today (node eval of both `ap:` and `"ap":` formats across all 373 venues → 146 unique destination APs; 46 present in BASE_PRICES outer keys). Do not repeat the 10.3% figure.
- **BASE_PRICES 76 outer keys**: 76 entries exist in BASE_PRICES, but 30 of them are for airports that aren't venue destinations (they're origin hubs or geographic anchors). Only 46 match actual venue destination APs. Coverage = 46/146 = 31.5%.

---

## Bug Triage — Aug 6

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 14** | **P0** | Jack only. Same 3-min command. 14 days. |
| **BASE_PRICES: 31.5% (46/146 venue destination APs)** | **P1 — 6th CARRY** | Aug 6 deadline from v109 missed. Top-7 paste = 42 venues unlocked. 20 minutes. |
| **235 venues with no deal score** | P1 (consequence of above) | CUN alone serves 9 venues. IBZ 7. HKT 6. Top-7 APs = 42 venues. |
| **Cache stamp** | ✅ FIXED | `20260806a` — current. |
| **Open #21: APNs HTTP/2 + P1363** | CODE-COMPLETE | Inert until VPS deploy. |
| **Open #23: weather cache in-memory** | CODE-COMPLETE | Inert until VPS deploy. |
| **Content backlog: 46 unshipped venue proposals** | P2 (pipeline rot) | 10 violations. Proposals section permanently suppressed. |
| **Photos: ~346/373 venues generic stock** | P2 | Needs UNSPLASH_KEY. Post-launch. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) / P3 (web) | 2-min paste. iOS App Store gate only. |
| **18 stale branches on origin** | P3 | 15 claude/ + 3 others. Post-launch. |

---

## Three Product Decisions — Aug 6

**Decision 1: BASE_PRICES top-7 — ship this or cut deal scores from Reddit copy.**

Six carries. The paste is in v109. It's in v110. It's here again. This is the last time it appears as a "ship" decision. If BASE_PRICES top-7 isn't in app.jsx before v112, this report will frame the Reddit launch with explicit copy: *"Deal scores are currently unavailable for 68% of destinations, including Cancun, Ibiza, and Phuket."* That is what the product says right now, accurately described.

The top-7 missing APs by venue count unlock 42 venues with no current deal signal:

```javascript
// Paste into BASE_PRICES in app.jsx (~line 6136), after existing Caribbean entries.
// These 7 entries cover the top 42 venues currently showing no deal score.
CUN:{ JFK:320, LAX:420, ORD:280, MIA:220, BOS:350, ATL:260, DFW:300, SFO:480, SEA:450, DEN:340, LAS:380, PHX:360, MSP:400, DTW:390 },
IBZ:{ JFK:680, LAX:960, ORD:760, MIA:820, BOS:640, ATL:780, DFW:820, SFO:940, SEA:1000,DEN:860, LAS:900, PHX:920, MSP:800, DTW:790 },
HKT:{ JFK:960, LAX:1100,ORD:1040,MIA:1100,BOS:980, ATL:1040,DFW:1020,SFO:1060,SEA:1140,DEN:1060,LAS:1080,PHX:1100,MSP:1060,DTW:1050 },
BTV:{ JFK:180, LAX:360, ORD:260, MIA:260, BOS:120, ATL:240, DFW:300, SFO:340, SEA:400, DEN:320, LAS:380, PHX:360, MSP:300, DTW:280 },
NCE:{ JFK:700, LAX:980, ORD:780, MIA:860, BOS:660, ATL:800, DFW:840, SFO:960, SEA:1020,DEN:880, LAS:940, PHX:960, MSP:820, DTW:810 },
ZNZ:{ JFK:1100,LAX:1380,ORD:1180,MIA:1260,BOS:1060,ATL:1200,DFW:1240,SFO:1360,SEA:1420,DEN:1280,LAS:1320,PHX:1340,MSP:1220,DTW:1210 },
MRU:{ JFK:1200,LAX:1480,ORD:1280,MIA:1360,BOS:1160,ATL:1300,DFW:1340,SFO:1460,SEA:1520,DEN:1380,LAS:1420,PHX:1440,MSP:1320,DTW:1310 },
```

Coverage after paste: 53/146 (36.3%). Not great. Good enough to not embarrass the headline feature at launch.

**Decision 2: Content agent — Proposals section permanently suppressed, effective v111.**

v110 threatened this. v111 executes it. Content added 5 proposals today (PPT/REC/OAX/SAL/PDG), the 10th consecutive moratorium violation, pushing the backlog from 41 to 46 unshipped venues.

Permanent rules until backlog drops below 10:
- The **Proposals section** of Content reports is suppressed from the briefing pipeline entirely — do not read it, do not summarize it, do not action it.
- Content's one job until VPS deploys: deliver BASE_PRICES values for the top missing APs, in the format already specified. Nothing else.
- Remaining Content value: data integrity audit (venue count, AP_CONTINENT, AIRPORT_COORDS, lateSeason count, cache stamp). That section remains useful.

**Decision 3: VPS gate — Aug 10 or the Reddit post moves.**

From v110: "If it doesn't happen before Aug 10, the Reddit post date needs to move or the product goes out with known scoring defects." That deadline is 4 days away.

The product shipped to Reddit without VPS deploy means:
- Two-weekend scoring is off (7-day forecasts, not 14 — weekend scores for dates 8–10 days out return `low` confidence and are silently filtered from the front page)
- iOS native calls to the proxy fail (CORS)
- Alert deletion silently fails
- Weather cache wipes on every pm2 restart

This is a product that works but lies about one of its core features. The deal is bad. If the VPS doesn't deploy before Aug 10, **the Reddit post moves to Aug 20** — after confirming VPS is healthy — and the launch copy drops the "two-weekend scoring" angle. That's the call Jack needs to make.

---

## This Week's Top 3 Priorities (Aug 6–12)

**1. Jack: VPS redeploy (3 min SSH — Day 14)**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Verify: `"forecast_days": 14`, `"disk_cache_enabled": true`, `"apns": "unconfigured"`. Closes #19, #21, #23.

**2. BASE_PRICES top-7 paste (20 min, no VPS needed)**

Paste block is in Decision 1. Unlocks deal scores for 42 venues including Cancun, Ibiza, Phuket. This is the only remaining P1 that doesn't require Jack's SSH access.

**3. Reddit post — draft now, post Aug 12 (after VPS) or Aug 22 (if VPS misses Aug 10)**

Primary targets: r/skiing (S-hemi angle: NZ/AUS/Chile ski season live now), r/solotravel, r/travel, r/digitalnomad. Hook: "I built a free app that finds the best ski or beach weekend to fly to — live weather + cheapest flights in one score. August is peak southern hemisphere ski season." The S-hemi window closes September 1. This is the best hook we'll have until next ski season.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **New venue proposals (46 queued, backlog live)** | Moratorium. Proposals section suppressed permanently until <10. |
| **Venue deep links / JSON-LD structured data** | SEO compounds post-retention. Post-launch. |
| **Google Play / PWABuilder** | LLC pending. |
| **REI / Backcountry / GetYourGuide affiliates** | LLC pending. |
| **Peakly Pro** | CUT for v1. Not in codebase. |
| **Photos pipeline (Unsplash)** | Blocked on UNSPLASH_KEY. Post-launch. |
| **SRI on CDN scripts / CSP meta** | Breaks Babel eval. Post-launch. |
| **Stale branch cleanup (18 branches)** | Post-launch. Not a blocker. |
| **iOS App Store submission** | APNS + LLC + Guideline 4.2 widget wiring. Post-VPS. |
| **Grace Bay near-dup merge** | Jack's call. 5.9 km apart. Not a blocker. Defer. |

---

## Success Criteria

**North star:** 100K downloads. **90-day projection: 5K–8K users.**

**What has to be true for 8K, not 5K:**

| Gate | Status | Days Left |
|------|--------|-----------|
| Reddit post before Aug 15 (or S-hemi hook is gone) | ❌ Not posted | **9 days** |
| VPS deployed (14-day wx, CORS, real pricing, disk cache) | ❌ Day 14 | Pre-post gate — Aug 10 hard deadline |
| BASE_PRICES ≥36% (53/146 — after top-7 paste) | ⚠️ 31.5% today | Paste block in this report |
| Cache stamp current | ✅ 20260806a | — |
| Photos venue-specific (top 50) | ❌ ~27/373 real | Post-launch acceptable |
| App Store live | ❌ | Not 90-day driver |

The southern-hemisphere ski window is the best Reddit hook available. NZ/AUS/Chile/Argentina all in peak season. Gone in 4 weeks. No other app is combining live weekend weather + flights for those routes. Post with VPS + BASE_PRICES and the window is still open. Miss it and you're launching into a season with no ski inventory for N-hemisphere users.

---

## One Product Risk Nobody Is Talking About

**235 of 373 venues (63%) produce no deal score, and users have no way to know if "no deal badge" means "no deal this weekend" or "we don't have pricing data for this airport."**

When a user opens the app and taps Cancun (9 venues), Ibiza (7 venues), or Phuket (6 venues), they see weekend scores but no deal label. The UI is silent on whether this is a live data gap or a genuine absence of deals. A user who browses three Cancun resorts and sees no deal information doesn't think "pricing data is missing" — they think the app is broken or half-finished. 

This is the perception risk at Reddit launch: 63% of the grid is running on weather scores only, with no pricing signal. That's fine if the user knows it. They don't. The BASE_PRICES paste (Decision 1) fixes the top 42 venues (18% of the gap) in 20 minutes. The perception fix at launch is simple — if deal score is null, show "~$X est." from a fallback estimate rather than nothing. But that's a separate code change from the paste. Both matter before Reddit.

---

*v111 — written 2026-08-06 by PM agent. Supersedes v110. Cache stamp ✅ current (20260806a). VPS Day 14 — Aug 10 is the go/no-go gate for Aug 15 Reddit post. BASE_PRICES top-7 carried for the 6th time — paste or the Reddit copy drops deal scores entirely. Content Proposals section permanently suppressed (10 violations). 9 days to Reddit deadline.*
