# PM Report v109 — 2026-08-04

> Supersedes v108 (Aug 3). **Status: RED.** Day 35. VPS unredeployed — **Day 12**. Cache stamp 3 days stale. BASE_PRICES 32% (42/133 venue APs). **11 days to Aug 15 Reddit deadline.** Open #21/#23 are CODE-COMPLETE in committed code — the only remaining gate is the VPS deploy.

---

## Shipped Since v108

Only agent reports landed overnight — no product changes:

| Commit | What | Assessment |
|--------|------|------------|
| `4019fe8` | DevOps report 08-04 — flags cache stamp stale, VPS Day 12 | ✅ Correct diagnosis |
| `6198106` | Content report 08-04 — 5 new proposals (VCE/LIS/GRU/PER/AGA), total 36 banked | ❌ Violated moratorium from v108 |

**Nothing shipped to users.** Product is in exactly the same state as Aug 3.

**Corrections to standing errors:**
- **Peakly Pro**: CUT. Zero instances in app.jsx (`grep -c "Pro\b" app.jsx` → 0). The $9/mo prompt is stale. Not an issue.
- **Sentry DSN**: LIVE. DSN `9416b032...` wired in `app.jsx:7` and `index.html:77`. Not flying blind.
- **Open #21 (APNs HTTP/2 + P1363)**: COMMITTED in `3165c1e` (Jul 25). Code-complete. Not an open implementation item — an undeployed one.
- **Open #23 (disk cache)**: COMMITTED. `WX_CACHE_FILE` + `_loadCacheFromDisk()` are in proxy.js. Code-complete. Needs VPS restart to take effect.

Both #21 and #23 are resolved in code. One SSH session closes four open items (#19, #21, #23, two-weekend scoring).

---

## Bug Triage — Aug 4

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 12** | **P0** | Jack-only. 10-min SSH. Twelve days. |
| **Cache stamp stale: `20260801a` (3 days)** | **P1** | Hook doesn't fire in remote sandbox. Jack bumps locally in 3 min. SW-cached returning users aren't getting this week's fixes. |
| **BASE_PRICES: 32% coverage (42/133 venue APs)** | **P1** | 91 destination airports uncovered. Top-7 paste = ~40 venues fixed, 20 min, no VPS. Four consecutive carries. |
| **Open #21: APNs** | **CODE-COMPLETE, awaiting deploy** | HTTP/2 + P1363 committed `3165c1e`. |
| **Open #23: weather cache in-memory** | **CODE-COMPLETE, awaiting deploy** | Disk persistence committed `4019fe8`. |
| **Photos: ~346/373 venues generic stock** | **P2** | Needs `UNSPLASH_KEY`. Post-launch. |
| **36 venue proposals staged, 0 executed** | **P2 (pipeline)** | Moratorium in effect. Content ignored it — added 5 more today. |
| **Open #22: Supabase delete-account SQL** | **P0 (App Store) / P3 (web)** | 2-min paste in Supabase SQL editor. iOS App Store gate only. |
| **17 stale remote branches** | **P3** | Post-launch housekeeping. |

**DevOps BASE_PRICES error — permanent correction (5th day):**

DevOps reports 52% (76/146) again. The correct number is **32% (42/133)**. 76 BASE_PRICES outer keys exist, but 34 of them are origin hubs (ATL, BOS, JFK, LAX, ORD, etc.) that no venue uses as its `ap:`. Verified via node eval: `42 of 133 unique venue ap: values match BASE_PRICES keys`. If DevOps reports 52% in v110, suppress its BASE_PRICES section from the briefing pipeline.

---

## Three Product Decisions — Aug 4

**Decision 1: BASE_PRICES top-7 backfill — SHIP. This is the fourth carry. It ends here.**

Decided in v107 (Aug 2). Carried v108. Carried v109. Not executed. The paste is 7 lines. Twenty minutes. No VPS.

**Paste this into BASE_PRICES in app.jsx (after existing Caribbean entries):**
```javascript
CUN:{ JFK:420, LAX:320, SFO:360, ORD:380, MIA:200, SEA:440, BOS:460, ATL:300, DEN:360, DFW:280, LAS:340, PHX:320, MSP:420, DTW:410 },
IBZ:{ JFK:680, LAX:960, SFO:940, ORD:760, MIA:820, SEA:1000,BOS:640, ATL:780, DEN:860, DFW:820, LAS:900, PHX:920, MSP:800, DTW:790 },
HKT:{ JFK:960, LAX:1100,SFO:1060,ORD:1040,MIA:1100,SEA:1140,BOS:980, ATL:1040,DEN:1060,DFW:1020,LAS:1080,PHX:1100,MSP:1060,DTW:1050 },
BTV:{ JFK:180, LAX:360, SFO:340, ORD:260, MIA:260, SEA:400, BOS:120, ATL:240, DEN:320, DFW:300, LAS:380, PHX:360, MSP:300, DTW:280 },
NCE:{ JFK:700, LAX:980, SFO:960, ORD:780, MIA:860, SEA:1020,BOS:660, ATL:800, DEN:880, DFW:840, LAS:940, PHX:960, MSP:820, DTW:810 },
ZNZ:{ JFK:1100,LAX:1380,SFO:1360,ORD:1180,MIA:1260,SEA:1420,BOS:1060,ATL:1200,DEN:1280,DFW:1240,LAS:1320,PHX:1340,MSP:1220,DTW:1210 },
MRU:{ JFK:1200,LAX:1480,SFO:1460,ORD:1280,MIA:1360,SEA:1520,BOS:1160,ATL:1300,DEN:1380,DFW:1340,LAS:1420,PHX:1440,MSP:1320,DTW:1310 },
```

If this isn't shipped by Aug 6, it becomes a launch defect, not a priority decision.

**Decision 2: Venue moratorium — maintained and escalated. Content agent: stand down.**

Content added 5 new proposals today despite the explicit moratorium from v108: "Zero new venue proposals until the backlog drops below 15." The backlog is now 36. The proposals are technically valid. That's not the point.

**New instruction for Content agent (next two sessions):** Research and deliver BASE_PRICES values ONLY for: ALB/PLS/AXA/SXM/NAP/CAG/FAO/SPU/OSL/DBV/PMI/TFS/RAK/MBJ/STT. No venue proposals. No other deliverables. If Content produces venue proposals in either of the next two sessions, suppress its Proposals section from the briefing pipeline for one week.

**Decision 3: Open #21 and #23 — reclassify from OPEN to CODE-COMPLETE, AWAITING DEPLOY.**

Both are fully implemented in committed code (`3165c1e` and `4019fe8`). Listing them as "open" misrepresents the state. The only remaining action is VPS deploy. Updating status accordingly.

---

## This Week's Top 3 Priorities (Aug 4–10)

**1. Jack: VPS redeploy (10-min SSH — today, Day 12)**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 'pm2 restart peakly-proxy'
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

After restart: expect `forecast_days:14`, CORS includes `capacitor://localhost`, `wx_cache_size` recovers quickly from disk (not stuck at 0). Closes Open #19/#21/#23, enables two-weekend scoring, unblocks iOS native.

**2. Jack: Cache stamp bump (3 min, before next push)**

Run locally so the auto-push hook fires. Any local edit to app.jsx triggers it. Or manually:
```bash
TODAY=20260804
perl -pi -e "s/peakly-\d{8}[a-z]+/peakly-${TODAY}a/g" sw.js app.jsx
perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
git add sw.js app.jsx index.html && git commit -m "chore: bump cache stamp ${TODAY}a" && git push origin main
```

Returning users are on the Aug 1 cache. They won't see the VPS fix until this bumps.

**3. BASE_PRICES top-7 backfill (20 min, client-side, paste block in Decision 1)**

40 venues gain real deal scores. 11 days to Reddit. Highest-ROI unblocked action. Four carries. Do it this week.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **New venue proposals beyond 36 queued** | Moratorium. Backlog is the bottleneck. Content: stop. |
| **Venue deep links / JSON-LD** | Post-launch. SEO compounds after users validate retention. |
| **Google Play Store / PWABuilder** | LLC pending. |
| **REI / Backcountry / GetYourGuide affiliates** | LLC pending. |
| **Peakly Pro revival** | CUT for v1. No instances in codebase. No action. |
| **Photo pipeline** | Blocked on `UNSPLASH_KEY`. Post-launch. |
| **Stale branch cleanup (17 branches)** | Post-launch housekeeping. |
| **SRI on CDN scripts (Open #10)** | Breaks Babel eval. Post-launch. |
| **iOS App Store submission** | Guideline 4.2 + LLC + APNS. Post-VPS. |

---

## Success Criteria

**North star:** 100K downloads. **90-day projection: 5K–8K users.**

**What has to be true for 8K, not 5K:**

| Gate | Status | Urgency |
|------|--------|---------|
| Reddit/HN post before Aug 15 | ❌ Not posted | **11 days. S-hemi ski window expires Sept.** |
| VPS deployed (14-day wx, iOS CORS, real pricing) | ❌ Day 12 | Launch gate. Blocks everything. |
| BASE_PRICES ≥50% (67/133 APs) | ⚠️ 32% today | Top-7 → 37%, top-15 → ~47% (~2hr total) |
| Cache stamp current | ⚠️ 3d stale | 3 min, Jack local |
| Photos venue-specific (top 50) | ❌ ~27/373 real | Post-launch acceptable |
| App Store live | ❌ | Not the primary 90-day driver |

The difference between 5K and 8K: post before Aug 15 with a product that doesn't look broken under scrutiny. 32% deal score coverage is scrutiny-failing. VPS and BASE_PRICES are the only remaining gates.

**S-hemisphere ski window closes in September.** 30 southern venues (NZ, AUS, Chile, Argentina) are in peak season right now. The "best ski weekend this August from your city" hook for these users disappears in 4 weeks. Post in the next 11 days or lose this angle for a year. Peak US beach season is simultaneously open. Both windows are live. For 11 more days.

---

## One Product Risk Nobody Is Talking About

**The cache stamp being 3 days stale means Reddit's first wave of traffic lands on a partially broken experience — and you won't know it because the error log reflects what users hit, not what you shipped.**

Here's the sequence if VPS redeploys today without a cache stamp bump: new users get the live proxy (forecast_days:14, real pricing). Returning users who visited Aug 1–3 get the Aug 1 SW cache with old client code — which was written against the old proxy API. If any response shape changed in the proxy update, those users silently get broken data with no error thrown. The SW auto-update detection runs on cache name mismatch (`CACHE_NAME` in sw.js), so it won't trigger until the stamp changes.

The stamp fix is 3 minutes. If it doesn't happen before the Reddit post, your returning users — including anyone who found the app through early SEO — get the worst possible first-impression recovery path: a broken experience they can't fix without a hard reload they don't know to do.

Fix the stamp before the Reddit post. Not after.

---

*v109 — written 2026-08-04 by PM agent. Supersedes v108. Open #21/#23 reclassified CODE-COMPLETE (committed, awaiting deploy). Content moratorium escalated — moratorium violated in today's session, new instruction delivered. BASE_PRICES 32% locked (Decision 1 is the 4th carry — deadline Aug 6). DevOps 52% error correction day 5. 11 days to Reddit deadline.*
