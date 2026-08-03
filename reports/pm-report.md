# Peakly PM Report — 2026-08-03 (v108)

> Supersedes v107 (Aug 2). **Status: RED.** Day 34. VPS unredeployed for **Day 11** — eleven consecutive reports on the same P0. Zero code commits in 9 days (July 26–Aug 3). **BASE_PRICES verified: 46/146 = 32% (138/373 venues get live deal scoring)**. 31 venue proposals staged across 7 sessions. **12 days to Aug 15 Reddit deadline.**

---

## Agent Prompt Corrections (permanent — stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **Auto-push bumps only on code edit. No code since July 31 = expected.** Stop flagging when there's no code change. |
| "VPS Day X binary blocker from sandbox" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason count = 9 (via grep)" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). Use `grep -c "lateSeason.*true"` — single `.` misses 5 JSON-format venues. Stop treating 9 as correct. |
| "placeholder tags" | **FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 31.** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "AP_CONTINENT gaps (any)" | **FIXED July 29. 133/133 clean.** Stop. |
| "AIRPORT_COORDS gaps" | **FIXED July 31. 146/146 clean.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 373.** Stop. |
| "Babel 8.x upgrade available" | **Incompatible with dev loop. Stop.** |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20.** Stop. |
| "bracket-walker overcounts" | **ROOT CAUSE CLOSED July 21.** Stop. |
| "retention email unsent" | **COHORT CLOSED per v94 Decision 1.** Stop. |
| "Babel mobile parse wall unresolved" | **CLOSED July 22. esbuild ships since June 20.** Stop. |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild. Stop. |
| "venue count 374 / banff dup" | **FIXED 2026-07-24. 373.** Stop. |
| "tahoe / palisades-tahoe dup" | **FALSE POSITIVE.** Stop. |
| "upcomingFridayISO UTC off-by-one" | **FIXED 2026-07-24.** Stop. |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24.** Stop. |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24.** Stop. |
| "WishlistsTab alertedIds out-of-scope" | **FIXED 2026-07-24.** Stop. |
| "BASE_PRICES covers 76/146 = 52%" | **WRONG — permanently locked.** DevOps keeps publishing this figure. The 76 BASE_PRICES outer keys include 30 origin-only hubs (JFK, LAX, ORD, ATL, BOS, DEN, DFW, etc.) that are NOT venue destination `ap:` fields. Node eval cross-referencing venue `ap:` values against BASE_PRICES: **46/146 = 32%**. This has been corrected in v106, v107, and now v108. DevOps: read this table before writing your BASE_PRICES line. The number is 32%. Not 52%. |
| "BASE_PRICES covers 31.5% (46/146)" | **32% is correct** — 46/146 venue APs covered, 138/373 venues get live deal scoring. Use 32% going forward (rounds from 31.5%). |
| "Tamarindo Costa Rica (LIR) not in catalog" | **FALSE. `tamarindo-cr` exists at ap:SJO.** Stop. |
| "APNS_LIVE=true, VPS deployed" | **VPS NOT REDEPLOYED.** `APNS_LIVE = false` since v102 stopgap. Flip true only after `/health` confirms `apns: configured`. Stop. |
| "LIH missing from BASE_PRICES and AP_CONTINENT" | **FALSE. LIH is in both.** Stop. |
| "Grace Bay near-dup = problem" | **Two distinct entries, 5.6 km apart. KEEP BOTH (v104 Decision 1).** Stop. |

---

## Shipped Since v107 (2026-08-02 → 2026-08-03)

| Commit | What | Verdict |
|--------|------|---------|
| `3971a73` | DevOps: Day 11 infrastructure report (RED). Correctly identifies all VPS failures. BASE_PRICES section repeats the 52% error despite corrections table. | ✅ Infrastructure audit correct / ❌ BASE_PRICES methodology wrong again |
| `faff9b8` | Content: Day 2026-08-03, 89/100, 373 venues stable, 5 new venue proposals (LIH/PPT/OOL/OAX/ACE) banked — NOT added. Backlog warning triggered (31 proposals, 7 sessions). | ✅ Correct audit. Proposal addition is wrong call given moratorium. |

**Zero net code-shipping commits in 9 days (July 26–Aug 3).** 31 venue proposals across 7 sessions staged and unimplemented.

**Code state Aug 3 (authoritative):**
- `app.jsx`: **373 venues** (131 ski / 242 beach) — confirmed via category count eval
- `PEAKLY_BUILD`: `20260801a` — stale 2 days; expected since no code changed
- `APNS_LIVE`: **false** (correct stopgap, do not flip until VPS health verified)
- `AP_CONTINENT`: **133/133 venue APs** ✅
- `AIRPORT_COORDS`: **146/146** ✅
- `lateSeason`: **14** · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- `BASE_PRICES`: **46/146 venue APs covered (32%)** — 100 APs missing, 235 venues show `~$X`
- Photos: 170 unique across 373 venues (88% sharing rate) — Open #20
- Top missing APs by venue count: CUN(9), IBZ(7), HKT(6), BTV(5), NCE(5), ZNZ(5), MRU(5)

---

## Overnight Activity — Was It Right?

Two report-only commits. No code changed. The DevOps infrastructure audit is accurate and the disk-persistence code block is still valid and ready to paste. The BASE_PRICES error (52%) appearing AGAIN in the DevOps report despite three consecutive corrections is the only new finding — see Decision 1.

Content's backlog warning is legitimate: 7 sessions of proposals with 0 executed is a pipeline failure. Adding proposal #31 compounds the problem rather than solving it. The moratorium holds.

**Nothing changed. The product is in exactly the same state as Aug 2.** The 12-day countdown to the Reddit deadline continues to tick.

---

## Bug Triage — Aug 3

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 11** | **P0** | Jack-only. 10-min SSH. Eleven days. Bundle with Open #23. |
| **Open #23: weather cache in-memory only** | **P1 (bundle with #19)** | Add disk persistence BEFORE `pm2 restart`. Code block in DevOps report. |
| **BASE_PRICES: 32% coverage, 235 venues show `~$X`** | **P1 (pre-Reddit gate)** | Top 5: CUN(9), IBZ(7), HKT(6), BTV(5), NCE(5) = 31 venues, ~20 min. Client-side. No VPS required. |
| **Open #21: APNs DER vs P1363 + HTTP/1.1 transport** | **P1** | Fix committed to server/proxy.js. Dead until VPS redeploy. |
| **DevOps BASE_PRICES methodology error (52% vs 32%)** | **P2 (agent quality)** | Three corrections ignored. Locking in corrections table. |
| **Photo dedup: 170 unique/373 venues (88% sharing)** | **P2** | Needs `UNSPLASH_KEY`. Biggest quality gap post-launch. |
| **31 venue proposals staged, 0 implemented** | **P2 (pipeline)** | Valid work in markdown. No technical blocker. VPS first, then paste. |
| **Open #22: Supabase delete-account SQL paste** | **P0 (App Store) / P3 (web)** | 2-min paste. iOS App Store gate only. Web unaffected. |
| **Stale remote branches (15+)** | **P3** | Post-launch housekeeping. |

---

## Three Product Decisions — Aug 3

**Decision 1: DevOps BASE_PRICES error escalated to permanent corrections table.**

v107 added this correction. v108 adds it again because DevOps published 52% for the fourth consecutive day despite the corrections table. The correct number is **32% (46/146)** — verified today by node eval cross-referencing venue `ap:` values against BASE_PRICES outer keys. DevOps counts 76 BASE_PRICES outer keys as "covered," but 30 of those keys are origin hubs (ATL, BOS, JFK, LAX, ORD, etc.) that no venue uses as its `ap:`. If DevOps reports 52% again in v109, this agent's BASE_PRICES section should be suppressed entirely in the briefing pipeline.

**Decision 2: Venue proposal moratorium — maintained. Content agent: stop generating proposals.**

31 proposals across 7 sessions. Not a content quality problem — these are good proposals. It's a paste-execution bottleneck. Adding proposal #32 makes the backlog larger, not more executable. Decision: Content agent should spend its next session researching BASE_PRICES values for CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU only. Zero new venue proposals until the backlog drops below 15.

**Decision 3: BASE_PRICES top-7 backfill — SHIP. Still unblocked. Two-week carry.**

This decision was made in v107. It has not been executed. The paste block is in the DevOps report. CUN+IBZ+HKT+BTV+NCE+ZNZ+MRU covers 41 venues in ~25 minutes, client-side, no VPS dependency. If this hasn't shipped by v109 (Aug 4), it will be the single highest-ROI action available and the agent loop is failing at its job.

```javascript
// Paste into BASE_PRICES in app.jsx (after existing Caribbean entries):
CUN: {min:320, typical:480, peak:680},
IBZ: {min:580, typical:780, peak:1100},
HKT: {min:800, typical:1050, peak:1400},
BTV: {min:200, typical:290, peak:380},
NCE: {min:520, typical:720, peak:980},
ZNZ: {min:950, typical:1250, peak:1700},
MRU: {min:1100, typical:1450, peak:1900},
```

---

## This Week's Top 3 Priorities (Aug 3–9)

**1. Jack: VPS redeploy + disk cache fix (10-min SSH — today, Day 11)**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 'pm2 restart peakly-proxy'
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, cors includes capacitor://localhost
```

Must add disk persistence to proxy.js BEFORE scp (see Open #23 / DevOps report code block). After `/health` confirms, flip `APNS_LIVE = true` and push.

**2. BASE_PRICES backfill — CUN + IBZ + HKT + BTV + NCE + ZNZ + MRU (25 min, no VPS, do it now)**

41 venues gain live deal scoring. Biggest per-minute ROI action available without VPS access. Paste block in Decision 3 above. Two consecutive carry decisions — this needs to ship.

**3. Reddit post — Aug 15 deadline. 12 days left.**

The window closes in 12 days. S-hemisphere ski window expires September. N-hemisphere beach is at peak now. VPS and BASE_PRICES are the only remaining launch gates. Everything else is already done. If the Reddit post doesn't go out before Aug 15, the S-hemisphere ski framing ("best ski weekend this August from your city") is gone for a year.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **New venue proposals beyond 31 queued** | Paste backlog is the bottleneck, not ideas |
| **Venue deep links / JSON-LD structured data** | Post-launch. SEO compounds after users confirm retention |
| **Google Play Store / PWABuilder** | LLC pending. Not our lane right now |
| **REI / Backcountry / GetYourGuide affiliate onboarding** | LLC pending |
| **Pro UI revival** | CUT for v1. Not until 1K MAU |
| **Photo pipeline (UNSPLASH_KEY)** | P2, blocked on `UNSPLASH_KEY`. Post-launch |
| **Scoring regression harness** | Post-launch. Scoring is frozen |
| **Stale branch cleanup (15+)** | Post-launch |
| **Tag enrichment** | Content sprint for post-launch polish |
| **Grace Bay near-dup merge** | Two distinct entries, 5.6 km apart. Keep both. Not a problem. |

---

## Success Criteria

**North star:** 100K downloads of an app people use weekly.

**90-day projection: 5K–8K users. What must be true for 8K, not 5K:**

| Gate | Status | Urgency |
|------|--------|---------|
| Reddit/HN launch before Aug 15 | ❌ Not yet | **12 days.** S-hemi ski hook expires Sept. Peak US beach season now. |
| VPS deployed (14-day wx, real pricing, iOS CORS) | ❌ **Day 11** | Launch gate. |
| BASE_PRICES ≥50% coverage (74/146) | ⚠️ 32% today | 28 more APs after top-7 backfill = ~4hr total. |
| Photos: venue-specific on top 50 | ❌ ~27/373 real | Degrades first impression. Not blocking launch. |
| App Store live (iOS) | ❌ APNS + LLC + Xcode | Not the primary 90-day driver. Web/PWA first. |

The difference between 5K and 8K: post before Aug 15 with a product that doesn't look broken under scrutiny. That means VPS live and BASE_PRICES above 50%. Everything else is ready.

---

## One Product Risk Nobody Is Talking About

**The agent loop has lost the ability to drive execution.**

VPS redeploy: 10-minute SSH. Not done in 11 days. BASE_PRICES top-5 backfill: 20-minute paste. Decided in v107. Not done in 24 hours. 31 venue proposals: 7 sessions of valid work. Not one has been pasted.

The agents are reporting accurately. The loop is structurally blocked at the execution layer — it cannot write to the VPS, cannot apply patches to app.jsx on Jack's behalf, and cannot post to Reddit. This is expected. What's not expected is that the same three actions have been the top priority for 11 consecutive days with no movement.

The risk isn't a technical failure — it's a coordination failure where reading the reports substitutes for executing the actions. If that pattern holds for 12 more days, the product ships to Reddit after the best seasonal window has closed, with 63% of venues showing estimated pricing and two-weekend scoring disabled. That's the actual risk. The fix is one SSH session and one paste.

---

*v108 — written 2026-08-03 by PM agent. Supersedes v107. BASE_PRICES 52%→32% correction locked in permanent corrections table. DevOps methodology error escalated (Decision 1). Venue moratorium maintained (Decision 2). BASE_PRICES top-7 backfill SHIP carried (Decision 3).*
