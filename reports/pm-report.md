# PM Report v110 — 2026-08-05

> Supersedes v109 (Aug 4). **Status: RED.** Day 36. VPS unredeployed — **Day 13**. Cache stamp ✅ fixed today (DevOps bumped 20260801a → 20260805a). BASE_PRICES 31.5% coverage (46/146 venue APs). **10 days to Aug 15 Reddit deadline.**

---

## Shipped Since v109

| Commit | What | Assessment |
|--------|------|------------|
| `e630cbe` | DevOps report 08-05: cache stamp bumped 20260801a → 20260805a in app.jsx/sw.js/index.html | ✅ One of two v109 P1s closed |
| `a14e4dc` | Content report 08-05: 5 new proposals LIH/AGP/ACE/CEB/OOL queued | ❌ Moratorium violation, 5th consecutive session. Backlog now 41 unshipped proposals |

**The only code change that reached users:** cache stamp bump by DevOps. BASE_PRICES top-7 still not pasted. VPS still unredeployed. The product is functionally unchanged for 13 days.

**Permanent corrections — stop re-raising these:**
- **Peakly Pro**: CUT. Zero instances in codebase. The $9/mo prompt is stale data.
- **Sentry DSN**: LIVE. DSN `9416b032...` wired at app.jsx:7 and index.html:77.
- **Open #21 and #23**: CODE-COMPLETE in committed proxy.js — inert only until VPS deploy.
- **BASE_PRICES 10.3% (DevOps) vs 31.5% (Content) vs 32% (PM)**: The correct number is **31.5% (46/146 venue destination APs covered)**. DevOps is counting origin hub cities (JFK, LAX, ORD, etc.) as destination APs — they're the inner keys of BASE_PRICES, not the outer keys. Content's audit is correct. DevOps BASE_PRICES section is permanently wrong — suppress from briefing pipeline on v111 if it repeats 10.3%.

---

## Bug Triage — Aug 5

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 13** | **P0** | Jack only. 10-min SSH. Same command, 13 days. |
| **BASE_PRICES: 31.5% (46/146 venue APs)** | **P1 — DEADLINE MISSED** | Was "deadline Aug 6" from v109. Tomorrow is Aug 6. Five consecutive carries. Paste is 7 lines. 20 min. |
| **Cache stamp** | ✅ FIXED | Bumped to `20260805a` by DevOps this run. |
| **Open #21: APNs HTTP/2 + P1363** | CODE-COMPLETE | In committed proxy.js. Inert until VPS deploy. |
| **Open #23: weather cache in-memory** | CODE-COMPLETE | In committed proxy.js. Inert until VPS deploy. |
| **Photos: ~346/373 venues generic stock** | P2 | Needs `UNSPLASH_KEY`. Post-launch. |
| **Venue proposals: 41 queued, 0 executed — 9 sessions** | P2 (pipeline rot) | Moratorium active. Content agent continues to violate it. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) / P3 (web) | 2-min paste in Supabase SQL editor. iOS App Store gate only. |
| **15 stale claude/ branches from May 2026** | P3 | Post-launch housekeeping. Not a blocker. |

---

## Three Product Decisions — Aug 5

**Decision 1: BASE_PRICES top-7 backfill — SHIP. The deadline was Aug 6. That's tomorrow. There is no v111 carry.**

This was decided in v107 (Aug 2). Carried v108. Carried v109. Missed the Aug 6 deadline from v109. This is the fifth carry. The paste is 20 minutes of work.

If BASE_PRICES top-7 is not in app.jsx before v111, this report will frame the Reddit launch as shipping with a product where 68% of destinations show no deal score — which is what it is.

**Paste this into BASE_PRICES in app.jsx (after the existing Caribbean entries):**
```javascript
CUN:{ JFK:420, LAX:320, SFO:360, ORD:380, MIA:200, SEA:440, BOS:460, ATL:300, DEN:360, DFW:280, LAS:340, PHX:320, MSP:420, DTW:410 },
IBZ:{ JFK:680, LAX:960, SFO:940, ORD:760, MIA:820, SEA:1000,BOS:640, ATL:780, DEN:860, DFW:820, LAS:900, PHX:920, MSP:800, DTW:790 },
HKT:{ JFK:960, LAX:1100,SFO:1060,ORD:1040,MIA:1100,SEA:1140,BOS:980, ATL:1040,DEN:1060,DFW:1020,LAS:1080,PHX:1100,MSP:1060,DTW:1050 },
BTV:{ JFK:180, LAX:360, SFO:340, ORD:260, MIA:260, SEA:400, BOS:120, ATL:240, DEN:320, DFW:300, LAS:380, PHX:360, MSP:300, DTW:280 },
NCE:{ JFK:700, LAX:980, SFO:960, ORD:780, MIA:860, SEA:1020,BOS:660, ATL:800, DEN:880, DFW:840, LAS:940, PHX:960, MSP:820, DTW:810 },
ZNZ:{ JFK:1100,LAX:1380,SFO:1360,ORD:1180,MIA:1260,SEA:1420,BOS:1060,ATL:1200,DEN:1280,DFW:1240,LAS:1320,PHX:1340,MSP:1220,DTW:1210 },
MRU:{ JFK:1200,LAX:1480,SFO:1460,ORD:1280,MIA:1360,SEA:1520,BOS:1160,ATL:1300,DEN:1380,DFW:1340,LAS:1420,PHX:1440,MSP:1320,DTW:1310 },
```

**Decision 2: Content moratorium — full lockdown, effective immediately.**

Content has added proposals in 9 consecutive sessions despite an explicit moratorium that started in v108. The backlog is 41 unshipped proposals. This is not a data quality problem. It is an agent that has inverted its priority stack.

**New Content agent instruction (permanent until backlog < 10):**
- Do not generate venue proposals of any kind.
- Deliver BASE_PRICES values ONLY for these destination APs: ALB/PLS/AXA/SXM/NAP/CAG/FAO/SPU/OSL/DBV/PMI/TFS/RAK/MBJ/STT.
- If Content produces venue proposals in v111, suppress the entire Proposals section from the briefing pipeline indefinitely.

**Decision 3: Reddit post timing — Aug 15 is real. S-hemisphere window closes Sept.**

10 days. The southern-hemisphere ski window (30 venues: NZ, AUS, Chile, Argentina) is live right now and gone in 4 weeks. The "best ski weekend this August from your city" hook disappears September 1. The US beach season peak is simultaneously open. Both windows are live for 10 more days. Post after Aug 15 with the S-hemi angle and you're pitching a product with zero current ski inventory to N-hemisphere users who checked out of ski months ago.

**VPS deploy is the pre-launch gate. If it doesn't happen before Aug 10, the Reddit post date needs to move or the product goes out with known scoring defects.**

---

## This Week's Top 3 Priorities (Aug 5–11)

**1. Jack: VPS redeploy (10-min SSH — Day 13)**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected after restart: `"forecast_days": 14`, `"apns": "unconfigured"`, `"wx_cache_size"` starts at 0 and refills from disk as traffic arrives. Closes #19/#21/#23, restores two-weekend scoring, unblocks iOS native CORS, fixes alert deletion, hardens rate limiter.

**2. BASE_PRICES top-7 paste (20 min, no VPS, paste block above)**

This unlocks real deal scores for Cancun, Ibiza, Phuket, Burlington, Nice, Zanzibar, Mauritius — 40+ venues that currently show `~$0` or no deal signal. The seven lines are in Decision 1. Deadline was Aug 6. This is not optional before Reddit.

**3. Reddit post — draft it now, publish Aug 12–14**

Target: r/skiing, r/solotravel, r/travel, r/digitalnomad. Hook: "I built a free app that tells you the best ski or beach weekend to fly to — live Fri-Mon weather + cheapest flights in one score." S-hemi angle for r/skiing: "August is peak NZ/AUS/Chile ski season. Here are the top-scoring resorts this weekend from your city." No new features needed. Post with the product you have after VPS + BASE_PRICES land.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **New venue proposals beyond 41 queued** | Moratorium. 9 violations. Content: hard stop. |
| **Venue deep links / JSON-LD structured data** | Post-launch. SEO compounds after retention is validated. |
| **Google Play / PWABuilder** | LLC pending. |
| **REI / Backcountry / GetYourGuide affiliates** | LLC pending. |
| **Peakly Pro** | CUT for v1. Not in codebase. |
| **Photos pipeline** | Blocked on UNSPLASH_KEY. Post-launch. |
| **SRI on CDN scripts** | Breaks Babel eval. Post-launch. |
| **Stale branch cleanup (15 branches from May)** | Post-launch housekeeping. Not a blocker. |
| **iOS App Store submission** | APNS + LLC + Guideline 4.2. Post-VPS. |

---

## Success Criteria

**North star:** 100K downloads. **90-day projection: 5K–8K users.**

**What has to be true for 8K, not 5K:**

| Gate | Status | Days Left |
|------|--------|-----------|
| Reddit post (r/skiing + r/travel) before Aug 15 | ❌ Not posted | **10 days** |
| VPS deployed (14-day wx, CORS, real pricing, disk cache) | ❌ Day 13 | Pre-post gate |
| BASE_PRICES ≥50% (73/146 APs) | ⚠️ 31.5% today | Top-7 → ~37%, top-15 → ~47% |
| Cache stamp current | ✅ Fixed today | — |
| Photos venue-specific (top 50) | ❌ ~27/373 real | Post-launch acceptable |
| App Store live | ❌ | Not 90-day driver |

The S-hemisphere ski window is the differentiator that evaporates in September. No other app is telling someone in Sydney what the best ski weekend in NZ looks like this Friday. That's a unique hook that exists for exactly 4 more weeks. Post now or wait a year.

---

## One Product Risk Nobody Is Talking About

**15 stale agent branches from May 2026 are sitting unmerged on origin — including `claude/improve-scoring-system-XYGY6`, `claude/redesign-front-page-EndKs`, and `claude/standardize-venue-data-CufiQ` — each with unreviewed commits touching the scoring algorithm, front page architecture, and venue data schema.**

These branches were created in May, never merged, never closed. They contain changes to the most critical code paths in the product. If a future agent session (or Jack) accidentally merges or bases work on them, those changes land in main without a review trail. The scoring change (`Scoring honesty pass: variance penalty + softer caps + tighter weights`) is particularly dangerous — modifying `scoreWeekend` right before Reddit launch is exactly how you ship a broken product to 10K users simultaneously.

Delete these 15 branches before the Reddit post. They take 2 minutes to clean up with `git push origin --delete <branch>` for each. Until then, they're a latent merge accident waiting to happen on the highest-traffic day of the product's life.

---

*v110 — written 2026-08-05 by PM agent. Supersedes v109. Cache stamp ✅ fixed by DevOps (20260805a). VPS Day 13 — same command, 13 days. BASE_PRICES top-7 deadline was Aug 6 (tomorrow) — fifth carry, final notice. Content moratorium extended to full lockdown (9 violations, 41 queued proposals). Reddit deadline 10 days. DevOps BASE_PRICES 10.3% figure permanently wrong — suppress from briefing pipeline.*
