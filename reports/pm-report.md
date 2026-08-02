# Peakly PM Report — 2026-08-02 (v107)

> Supersedes v106 (Aug 1). **Status: RED.** Day 33. VPS unredeployed for **Day 10** — ten consecutive reports on the same P0. Zero code commits in 8 days (July 26–Aug 2). **BASE_PRICES corrected: 46/146 = 31.5% (138/373 venues get live deal scoring)**. 30 venue proposals staged across 6 sessions. **13 days to Aug 15 Reddit deadline.**

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
| "Cross-category photo contamination" | **FIXED July 31 in 84ed91b.** Stop. |
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
| "BASE_PRICES covers 76/146 = 52% (DevOps Aug 1)" | **WRONG. DevOps counted all 76 BASE_PRICES outer keys, including US origin hubs (ATL, BOS, DEN, DFW, etc.) that do NOT appear as venue `ap:` fields. Node eval cross-referencing venue APs against BASE_PRICES keys: 46/146 = 31.5%. This is the correct methodology. Stop using the 76-key count.** |
| "BASE_PRICES covers 31.5% (46/146)" | **CORRECT — verified Aug 2 via node eval. 138/373 venues get live deal scoring. 235 show `~$X`. Use this number.** |
| "Tamarindo Costa Rica (LIR) not in catalog" | **FALSE. `tamarindo-cr` exists at ap:SJO.** Stop. |
| "APNS_LIVE=true, VPS deployed" | **VPS NOT REDEPLOYED.** `APNS_LIVE = false` since v102 stopgap. Flip true only after `/health` confirms `apns: configured`. Stop. |
| "LIH missing from BASE_PRICES and AP_CONTINENT" | **FALSE. LIH is in both.** Stop. |
| "Grace Bay near-dup = problem" | **Two distinct entries, 5.6 km apart. KEEP BOTH (v104 Decision 1).** Stop. |

---

## Shipped Since v106 (2026-08-01 → 2026-08-02)

| Commit | What | Verdict |
|--------|------|---------|
| `f77d333` | DevOps: Day 9 infrastructure report (RED). Confirmed APNs fix in code, disk-persistence block included | ✅ Right call — confirms Open #21 is committed, not dangling |
| `9cbba9d` | Content: Day 2026-08-02, lateSeason grep fix (14 authoritative), 5 new venue proposals (GNB/LIR/SAL/CEB/PDG) | ✅ Correct audit; lateSeason fix is valuable; proposals banked |

**Zero net code-shipping commits in 8 days (July 26–Aug 2).** 30 venue proposals across 6 sessions staged and unimplemented.

**Code state Aug 2 (authoritative):**
- `app.jsx`: **373 venues** (131 ski / 242 beach)
- `PEAKLY_BUILD`: `20260801a` — no code change since Aug 1 = expected ✅
- `APNS_LIVE`: **false** (correct stopgap, do not flip until VPS health verified)
- `AP_CONTINENT`: **133/133 venue APs** ✅
- `AIRPORT_COORDS`: **146/146** ✅
- `lateSeason`: **14** · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- `BASE_PRICES`: **46/146 venue APs covered (31.5%)** — 100 APs missing, 235 venues show `~$X`
- Photos: 170 unique across 373 venues (88% sharing rate) — Open #20

---

## Overnight Activity — Was It Right?

Two report-only commits. No code changed. Correct — agents produced valid analysis and the lateSeason grep fix is a legitimate correction that stops agents from misreporting 9 vs 14. Content's BASE_PRICES methodology correction (46/146 = 31.5%) was right and PM v106 should not have accepted DevOps's 76/146 number. That's corrected in this report.

**The execution gap is now at 30 proposals.** Five more staged today. The same is true as yesterday: the pipeline is not broken, nothing is technically blocked on the venue paste, and the blocker is human execution. Suspend new proposals (Decision 2 below).

---

## Bug Triage — Aug 2

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 10** | **P0** | Jack-only. 10-min SSH. Ten days. Bundle with Open #23. |
| **Open #23: weather cache in-memory only** | **P1 (bundle with #19)** | Add disk persistence BEFORE `pm2 restart`. 30-line fix in DevOps report. |
| **BASE_PRICES: 31.5% coverage, 235 venues show `~$X`** | **P1 (pre-Reddit gate)** | Top 5: CUN(9), IBZ(7), HKT(6), BTV(5), NCE(5) = 31 venues in ~20 min. Client-side only. No VPS required. |
| **Open #21: APNs DER vs P1363 + HTTP/1.1 transport** | **P1** | Fix committed to server/proxy.js. Dead until VPS redeploy. |
| **Photo dedup: 170 unique/373 venues (88% sharing)** | **P2** | Needs `UNSPLASH_KEY`. Biggest quality gap post-launch. |
| **30 venue proposals staged, 0 implemented** | **P2 (pipeline)** | Valid work in markdown. No technical blocker. VPS first, then paste. |
| **Open #22: Supabase delete-account SQL paste** | **P0 (App Store) / P3 (web)** | 2-min paste. iOS App Store gate only. Web unaffected. |
| **Stale remote branches (15+)** | **P3** | Post-launch housekeeping. |

---

## Three Product Decisions — Aug 2

**Decision 1: BASE_PRICES methodology — accept 46/146 (31.5%), reject DevOps's 76/146 (52%). Lock the number.**

Node eval is authoritative: cross-reference venue `ap:` fields against BASE_PRICES outer keys. Result: 46 matches out of 146 venue airports = 31.5%. DevOps's 76 overcounts because BASE_PRICES has origin hubs (ATL, BOS, DEN, DFW, JFK, etc.) as outer keys that no venue uses as its `ap:`. PM v106 made a mistake accepting that number. 

The correct figures, locked until code changes: **46/146 venue APs covered, 138/373 venues get live deal scoring, 235 venues show `~$X`.** All agent running totals should use these. Do not run manual counts. Node eval only.

**Decision 2: Venue proposal moratorium — extended. No new proposals until one batch is pasted.**

30 proposals unimplemented. 6 sessions of valid work sitting in markdown. Adding proposal #31 does not help. The bottleneck is paste execution, not proposal quality. Next content session: research BASE_PRICES values for CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU only. No venue proposals.

**Decision 3: BASE_PRICES top-5 backfill — SHIP. This is unblocked today.**

CUN+IBZ+HKT+BTV+NCE: 31 venues, 20 minutes, client-side only, no VPS dependency. DevOps has the paste block. This is the single highest-ROI action available right now that does not require Jack's SSH. If Jack can open app.jsx and paste 5 lines into BASE_PRICES, 31 venues flip from `~$X` to live deal scoring before the Reddit post. SHIP.

```javascript
// Paste into BASE_PRICES in app.jsx:
CUN: {min:320, typical:480, peak:680},
IBZ: {min:580, typical:780, peak:1100},
HKT: {min:800, typical:1050, peak:1400},
BTV: {min:200, typical:290, peak:380},
NCE: {min:520, typical:720, peak:980},
```

---

## This Week's Top 3 Priorities (Aug 2–8)

**1. Jack: VPS redeploy + disk cache fix (10-min SSH — today, Day 10)**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 'pm2 restart peakly-proxy'
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, cors includes capacitor://localhost
```

After `/health` confirms the new code is running, flip `APNS_LIVE = true` in app.jsx (line where `const APNS_LIVE` is defined) and push.

**2. BASE_PRICES backfill — CUN + IBZ + HKT + BTV + NCE (20 min, no VPS, do it now)**

31 venues gain live deal scoring. Biggest per-minute ROI action this week. Data in Decision 3 above.

**3. Reddit post — Aug 15 deadline. 13 days left.**

VPS and BASE_PRICES are preconditions, not the destination. The launch post is the destination. S-hemisphere ski window (best pitch: "best ski weekend this August from your city") expires September. N-hemisphere beach is at peak. If the Reddit post goes out Aug 15 with VPS live and BASE_PRICES at ≥50% (74/146), the 90-day ceiling is 8K users. If it slips to September, the ski hook is gone and the pitch is weaker.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **New venue proposals beyond 30 queued** | Paste backlog is the bottleneck, not ideas |
| **Venue deep links / JSON-LD structured data** | Post-launch. SEO compounds after users confirm retention |
| **Google Play Store / PWABuilder** | LLC pending. Not our lane right now |
| **REI / Backcountry / GetYourGuide affiliate onboarding** | LLC pending |
| **Pro UI revival** | CUT for v1. Not until 1K MAU |
| **Photo pipeline** | P2, blocked on `UNSPLASH_KEY`. Post-launch |
| **Scoring regression harness merge** | Post-launch. Scoring is frozen |
| **Stale branch cleanup (15+ branches)** | Post-launch |
| **Tag enrichment (227 venues at 2-tag minimum)** | Content sprint for post-launch polish |

---

## Success Criteria

**North star:** 100K downloads of an app people use weekly.

**90-day projection: 5K–8K users. What must be true for 8K, not 5K:**

| Gate | Status | Urgency |
|------|--------|---------|
| Reddit/HN launch before Aug 15 | ❌ Not yet | **13 days.** S-hemi ski hook expires Sept. Peak US beach season now. |
| VPS deployed (14-day wx, real pricing, iOS CORS) | ❌ **Day 10** | Launch gate. |
| BASE_PRICES ≥50% coverage (74/146) | ⚠️ 31.5% today | 28 more APs after top-5 backfill = ~4hr total. |
| Photos: venue-specific on top 50 | ❌ ~27/373 real | Degrades first impression. Not blocking launch. |
| App Store live (iOS) | ❌ APNS + LLC + Xcode | Not the primary 90-day driver. Web/PWA first. |

The difference between 5K and 8K: post before Aug 15 with a product that doesn't look broken under scrutiny. That means VPS live and BASE_PRICES above 50%. Everything else is polish.

---

## One Product Risk Nobody Is Talking About

**Three agents have been arguing about BASE_PRICES coverage for three days. Nobody fixed it.**

DevOps (Aug 1) published 76/146 = 52%. Content (Aug 2) corrected it to 46/146 = 31.5%. PM v106 accepted the wrong number. This report fixes it. But the actual debate consumed PM analysis cycles, DevOps verification cycles, and Content correction cycles across three separate reports — and the bug is still there.

The BASE_PRICES backfill for CUN+IBZ+HKT+BTV+NCE is 5 lines of code. 20 minutes. It would have taken less time to fix it than it took any single agent to write their section about it.

This is a structural issue: the agent loop is very good at measuring and describing the gap, and has zero ability to close it. The larger risk is that between now and Aug 15, the 30 staged venue proposals, the BASE_PRICES gap, and the VPS redeploy all stay exactly where they are — perfectly documented, zero shipped. The agents will not run out of things to report. Jack will not run out of time to read reports. But the Reddit window will close.

The only thing that changes the trajectory: VPS SSH + BASE_PRICES paste + Reddit post. That's the list. Everything else is pre-work that's already done.

---

*v107 — written 2026-08-02 by PM agent. Supersedes v106. BASE_PRICES corrected from 52% to 31.5% — see Decision 1 and Agent Prompt Corrections.*
