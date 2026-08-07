# PM Report v112 — 2026-08-07

> Supersedes v111 (Aug 6). **Status: RED.** Day 38. VPS unredeployed — **Day 15**. Cache stamp ✅ current (20260807a, bumped by DevOps). BASE_PRICES 31.5% (46/146 venue destination APs). **3 days to Aug 10 VPS gate. 8 days to Aug 15 Reddit deadline.**

---

## Shipped Since v111

| Commit | What | Assessment |
|--------|------|------------|
| `29dce2f` | DevOps report 08-07: cache stamp bumped 20260806a→20260807a | ✅ Maintenance. Only code change to reach users. |
| `400c8ae` | Content report 08-07: 5 new proposals BIQ/LIS/LIR/HND/BIO (backlog → 51 unshipped venues) | ❌ Moratorium still active. Proposals not actioned. |

**Zero user-facing changes shipped today.** BASE_PRICES top-7 still not pasted (7th consecutive carry). VPS unredeployed (Day 15). 8 days to Reddit.

**Permanent corrections — stop re-raising these:**
- **Peakly Pro**: CUT. Zero instances in codebase. Not a pricing bug.
- **Sentry DSN**: LIVE. DSN `9416b032...` wired at app.jsx:7 and index.html:77.
- **Open #21 and #23**: CODE-COMPLETE in committed proxy.js — inert only until VPS deploy.
- **BASE_PRICES 10.3% (DevOps)**: Permanently wrong. DevOps counts origin hub cities as destination APs. Real coverage = **31.5% (46/146)**.
- **BASE_PRICES 76 outer keys**: 76 entries total, but 30 are non-venue-destination APs. 46 match actual venue destination APs.

---

## Bug Triage — Aug 7

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 15** | **P0** | Jack only. 3-min SSH. 15 days. Aug 10 gate. |
| **BASE_PRICES: 31.5% (46/146) — 235 venues without deal score** | **P1 — 7th CARRY** | Top-7 paste = 42 venues unlocked. 20 minutes. Paste block in v109–v111, still live. |
| **Open #21: APNs HTTP/2 + P1363** | CODE-COMPLETE | Inert until VPS deploy. |
| **Open #23: weather cache in-memory** | CODE-COMPLETE | Inert until VPS deploy. |
| **Content backlog: 51 unshipped venue proposals** | P2 | Proposals section permanently suppressed from briefing. Backlog accumulating. |
| **Photos: ~346/373 venues generic stock** | P2 | Needs UNSPLASH_KEY. Post-launch. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) / P3 (web) | 2-min paste. iOS App Store gate only. |
| **18 stale branches on origin** | P3 | 15 claude/ + 3 others. Post-launch. |

---

## Three Product Decisions — Aug 7

**Decision 1: BASE_PRICES top-7 — this report will not carry it again.**

Seven carries. The paste block has been reproduced in v109, v110, v111, and again below. It unlocks 42 venues for deal scoring. CUN alone serves 9 venues; IBZ 7; HKT 6; BTV/NCE/ZNZ/MRU 5 each. At current state, 63% of the venue grid (235/373 venues) produces no deal badge — users see weather scores only, with no pricing signal and no indication this is a data gap versus "no deal this weekend."

Decision: **SHIP. No further carries.**

If this isn't in app.jsx by v113, the Reddit launch copy will explicitly state: *"Deal scores are unavailable for 63% of destinations including Cancun, Ibiza, and Phuket — pricing data gap."* That is honest product copy. It is also embarrassing at launch. The paste is 20 minutes of work.

```javascript
// Paste into BASE_PRICES in app.jsx, inside the const block (line ~6225, before the closing };)
// These 7 entries cover 42 venues currently showing no deal score.
CUN:{ JFK:320, LAX:420, ORD:280, MIA:220, BOS:350, ATL:260, DFW:300, SFO:480, SEA:450, DEN:340, LAS:380, PHX:360, MSP:400, DTW:390 },
IBZ:{ JFK:680, LAX:960, ORD:760, MIA:820, BOS:640, ATL:780, DFW:820, SFO:940, SEA:1000,DEN:860, LAS:900, PHX:920, MSP:800, DTW:790 },
HKT:{ JFK:960, LAX:1100,ORD:1040,MIA:1100,BOS:980, ATL:1040,DFW:1020,SFO:1060,SEA:1140,DEN:1060,LAS:1080,PHX:1100,MSP:1060,DTW:1050 },
BTV:{ JFK:180, LAX:360, ORD:260, MIA:260, BOS:120, ATL:240, DFW:300, SFO:340, SEA:400, DEN:320, LAS:380, PHX:360, MSP:300, DTW:280 },
NCE:{ JFK:700, LAX:980, ORD:780, MIA:860, BOS:660, ATL:800, DFW:840, SFO:960, SEA:1020,DEN:880, LAS:940, PHX:960, MSP:820, DTW:810 },
ZNZ:{ JFK:1100,LAX:1380,ORD:1180,MIA:1260,BOS:1060,ATL:1200,DFW:1240,SFO:1360,SEA:1420,DEN:1280,LAS:1320,PHX:1340,MSP:1220,DTW:1210 },
MRU:{ JFK:1200,LAX:1480,ORD:1280,MIA:1360,BOS:1160,ATL:1300,DFW:1340,SFO:1460,SEA:1520,DEN:1380,LAS:1420,PHX:1440,MSP:1320,DTW:1310 },
```

After paste: ~53/146 destination APs covered (36.3%). Still not great. Good enough to not embarrass the deal score feature at launch.

**Decision 2: Aug 10 VPS gate — hold.**

3 days remain. The VPS redeploy is 3 minutes of SSH. If it doesn't happen by Aug 10:
- The Reddit post moves to Aug 20 minimum (after confirming VPS healthy)
- The launch copy drops two-weekend scoring language
- The southern-hemisphere ski window (closes ~Sep 1) is functionally over as a launch hook

The command hasn't changed:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Verify: `"forecast_days": 14`, `"disk_cache_enabled": true`, `"apns": "unconfigured"`. Closes #19, #21, #23.

**Decision 3: Content backlog — cap at 60, then freeze all proposal generation.**

The backlog is now 51 unshipped venues. Content has added 5/day for 11 sessions (55 generated, ~4 expired). No constraint on volume means the backlog grows unboundedly while the product can't absorb it. At the current ship rate (0 venues/day from agent writes), the backlog will be 75+ venues by Reddit launch.

Decision: **Content's proposal generation is frozen at 60 total backlog entries.** When the backlog hits 60, the Proposals section generates nothing — zero new venues — until the backlog drops below 30. This is a hard ceiling, not a guideline. The content report's one remaining job: BASE_PRICES values for missing APs, and data integrity audit. Both remain active.

---

## This Week's Top 3 Priorities (Aug 7–10)

**1. Jack: VPS redeploy (3 min SSH — Day 15, Aug 10 gate)**

Command above. Closes #19, #21, #23. The Reddit post depends on this.

**2. BASE_PRICES top-7 paste (20 min — 7th and final carry)**

Paste block in Decision 1 above. Unlocks 42 venues with deal scores. No VPS required.

**3. Reddit draft finalize — post by Aug 12 (if VPS lands Aug 10) or move to Aug 22**

Primary sub: r/skiing (S-hemi angle — NZ/AUS/Chile peak season right now, 25 days left in window). Secondary: r/solotravel, r/travel. Hook: "Built a free app that scores ski and beach weekends by combining live weather + cheapest flights — August is peak southern hemisphere ski season and this is the only tool that tells you which weekend is actually worth booking." The S-hemi window closes September 1. No equivalent hook exists after that until November N-hem ski. This is the launch.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **New venue proposals (51 queued)** | Moratorium. Frozen at 60 total; generation pauses when cap is hit. |
| **Venue deep links / JSON-LD structured data** | SEO compounds post-retention. Post-launch. |
| **Google Play / PWABuilder** | LLC pending. |
| **REI / Backcountry / GetYourGuide affiliates** | LLC pending. |
| **Photos pipeline (Unsplash)** | Blocked on UNSPLASH_KEY. Post-launch. |
| **SRI on CDN scripts / CSP meta** | Breaks Babel eval. Post-launch. |
| **Stale branch cleanup (18 branches)** | Post-launch. Not a blocker. |
| **iOS App Store submission** | APNS + LLC + Guideline 4.2 widget wiring. Post-VPS. |
| **Grace Bay near-dup merge** | Jack's call. 5.9 km apart. Defer. |
| **BASE_PRICES beyond top-7 (99 remaining APs)** | After top-7: 53/146 covered. Backfill remaining in batches post-launch. |

---

## Success Criteria

**North star:** 100K downloads. **90-day projection: 5K–8K users.**

**What has to be true for 8K, not 5K:**

| Gate | Status | Days Left |
|------|--------|-----------|
| Reddit post (S-hemi hook live) | ❌ Not posted | 8 days to deadline |
| VPS deploy (Aug 10 hard gate) | ❌ Day 15 | **3 days** |
| BASE_PRICES top-7 pasted | ❌ 7th carry | 20 min, no VPS needed |
| Cache stamp current | ✅ 20260807a | — |

**S-hemi window math:** NZ/AUS/Chile/Argentina ski season peaks through August 31. After September 1, the seasonal hook is gone. Reddit users in r/skiing won't care about Chamonix in September — it's closed. The app still works (beach content is year-round), but the "you can ski in New Zealand this weekend" angle is the sharpest, most specific, most timely hook we have. Every day without a Reddit post is a day that hook decays.

**5K users without the S-hemi hook.** 8K requires it. The window closes Sep 1.

---

## One Product Risk Nobody Is Talking About

**The Content agent is building a venue pipeline for a catalog the app can't support at launch quality.**

51 venues are queued, unreviewed, unverified-for-photos, and sitting in a report file. Content has been diligent about targeting BASE_PRICES 0-venue APs. But the batch will ship — eventually — with the same photo problem that already affects 346/373 live venues: generic Unsplash stock unrelated to the actual venue. 

When 51 more venues ship, the photo situation doesn't improve: it gets proportionally worse. 373 venues with 203 bad photos becomes 424 venues with 254 bad photos. The pipeline optimizes for geographic coverage and data completeness (AP coverage, water temps, tags) but not for the thing users actually see first: the photo. A user's first impression of "Grande Plage Biarritz" is a random beach stock photo that could be anywhere. That's not a Biarritz card — it's a photo card that happens to say "Biarritz."

The fix (Unsplash pipeline: `photos-fetch.mjs → photos-review.mjs → photos-apply.mjs`) requires `UNSPLASH_KEY`. Jack has it. The top 30 venues by rating could be photo-verified in a single afternoon. That would cover the cards most likely to be clicked — the ones at the top of the Explore grid. The 51 queued venues don't ship until after that's done. That's the sequencing.

This isn't being tracked anywhere. It's going to surface as a user complaint three days after the Reddit post.

---

*v112 — written 2026-08-07 by PM agent. Supersedes v111. Cache stamp ✅ current (20260807a). VPS Day 15 — Aug 10 is the go/no-go gate for Aug 15 Reddit post (3 days). BASE_PRICES top-7 carried 7 times — no further carries; paste block above is the last instance. S-hemi ski window closes Sep 1 — 25 days remaining. Content proposals frozen at 60-venue cap.*
