# Peakly PM Report — 2026-07-31 (v105)

> Supersedes v104 (July 30). **Status: RED.** Day 31. VPS unredeployed for **Day 7** — 8 consecutive days of broken server-side features. Zero venue paste-ins in 4 consecutive content sessions (20 proposals staged). Two P2 fixes shipped today by DevOps agent (LIH AIRPORT_COORDS, cancun-beach photo). S-hemisphere ski window: **6 weeks left**.

---

## Agent Prompt Corrections (permanent — stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **Stamp age = days since last code edit. Auto-push bumps only on edit. No code since July 25 → `20260725d` is correct. Stop.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). Use `grep lateSeason app.jsx`. Stop. |
| "placeholder tags" | **FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 31 in 84ed91b — cancun-beach corrected.** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "AP_CONTINENT gaps (any)" | **FIXED July 29. 133/133 clean.** Stop. |
| "AIRPORT_COORDS gaps (LIH)" | **FIXED July 31 in 84ed91b. 146/146 clean.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 373. Stop.** |
| "Babel 8.x upgrade available" | **Incompatible with dev loop. Stop.** |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20.** Stop. |
| "bracket-walker overcounts" | **ROOT CAUSE CLOSED July 21. Stop.** |
| "retention email unsent" | **COHORT CLOSED per v94 Decision 1. Stop.** |
| "Babel mobile parse wall unresolved" | **CLOSED July 22. esbuild ships since June 20. Stop.** |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild. Stop. |
| "venue count 374 / banff dup" | **FIXED 2026-07-24. 373. Stop.** |
| "tahoe / palisades-tahoe dup" | **FALSE POSITIVE. Stop.** |
| "upcomingFridayISO UTC off-by-one" | **FIXED 2026-07-24. Stop.** |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24. Stop.** |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24. Stop.** |
| "WishlistsTab alertedIds out-of-scope" | **FIXED 2026-07-24. Stop.** |
| "BASE_PRICES covers 100% of airports" | **FALSE — DevOps July 31 error conflated AIRPORT_COORDS (146/146 ✅) with BASE_PRICES (46/146 = 31.5% ❌).** These are different tables. Do NOT stop raising BASE_PRICES gap. |
| "BASE_PRICES covers only 10.3% or 35%" | **Corrected: 46/146 = 31.5%. Use node eval on BASE_PRICES keys, not AIRPORT_COORDS.** |
| "Tamarindo Costa Rica (LIR) not in catalog" | **FALSE. `tamarindo-cr` exists at ap:SJO.** Stop. |
| "APNS_LIVE=true, VPS deployed" | **VPS NOT REDEPLOYED.** `APNS_LIVE = false` since v102 stopgap. Flip true only after `/health` confirms `apns: configured`. Stop. |
| "LIH missing from BASE_PRICES and AP_CONTINENT" | **FALSE. LIH is in both. Was missing ONLY from AIRPORT_COORDS — FIXED July 31 in 84ed91b.** Stop. |

---

## Shipped Since v104 (2026-07-30 → 2026-07-31)

| Commit | What | Verdict |
|--------|------|---------|
| `84ed91b` | DevOps: LIH added to AIRPORT_COORDS + cancun-beach cross-cat photo fixed (2 P2s) | ✅ Right call — unblocked Kauai, photo integrity restored |
| `bf5567d` | Content: 5 venue proposals (BIQ/LIS/PPT/LIH/OOL) all at BASE_PRICES-covered airports | ✅ Smart targeting — every proposal unlocks live deal scoring |

**Zero code commits outside of reports in 6 days (July 26–31).** The two P2 fixes in `84ed91b` are the only code changes. 20 venue proposals across 4 content sessions remain unimplemented.

**Code state July 31:**
- `app.jsx` HEAD: **373 venues** (131 ski / 242 beach)
- `PEAKLY_BUILD`: `20260725d` — 6 days since last code edit (expected, not broken)
- `APNS_LIVE`: **false** (stopgap from v102)
- `AP_CONTINENT`: **133/133 venue APs** ✅ (146 unique APs across 373 venues)
- `AIRPORT_COORDS`: **146/146** ✅ (LIH fixed today)
- `lateSeason`: 14 · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- `BASE_PRICES`: **46/146 venue APs covered (31.5%)** — 100 APs missing, 235 venues show `~$X`
- Cross-category photo: ✅ fixed in 84ed91b

---

## Bug Triage — July 31

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 7** | **P0** | Jack-only. 10-min SSH. Seven days on the list. Bundle with Open #23. |
| **Open #23: weather cache in-memory only** | **P1 (bundle with #19)** | 30-line disk-persistence fix in DevOps report. Add BEFORE `pm2 restart`. |
| **BASE_PRICES: 68.5% of venues show `~$X` estimated fares** | **P1 (pre-Reddit gate)** | 100 of 146 venue APs missing per content agent (authoritative). Top 5 by impact: CUN (9), IBZ (7), HKT (6), BTV (5), NCE (5) = 32 venues. ~2hr backfill. |
| **20 venue proposals staged, 0 implemented** | **P1 (pipeline integrity)** | 4 sessions of agent effort with no captured value. Today's 5 are all at BASE_PRICES-covered airports — highest ROI batch yet. |
| **Grace Bay near-dup** | **P3** | KEEP BOTH (ratified v104 Decision 1). Differentiation tags deferred to Reddit-prep sprint. |
| **Supabase delete-account SQL paste** | **P0 (App Store) / P3 (web)** | 2-min paste. iOS App Store gate only. Web unaffected. |
| **Stale remote branches (15)** | **P3** | DEFER. No user-facing impact. Post-launch housekeeping. |
| **Photos: ~346/373 venues generic stock** | **P2** | Biggest quality gap. Needs `UNSPLASH_KEY`. Not blocking Reddit launch but degrades first impression. |

---

## Three Product Decisions — July 31

**Decision 1: BASE_PRICES backfill priority — TOP 5 AIRPORTS FIRST**

CUN (9 venues), IBZ (7), HKT (6), BTV (5), NCE (5). That's 32 venues flipped from estimated to live deal scoring in ~2 hours. Do CUN first — 9 Cancún/Riviera Maya venues are among our highest-traffic beach destinations from US hubs and every one shows `~$X`. This is embarrassing for the headline deal-score feature. Backfill is the only pre-Reddit gate we control that isn't blocked on Jack's SSH access.

**Decision 2: Content venue backlog — SUSPEND new proposals after 25 total**

At 20 staged proposals (4 sessions × 5/day), content has generated more inventory than we can absorb. Today's 5 (BIQ/LIS/PPT/LIH/OOL) are the highest-quality batch yet — all at BASE_PRICES-covered airports, live deal scoring immediately on paste. After today's 5 are staged, cap the backlog at 25 total. If Jack hasn't pasted any by next session, content agent suspends proposals and instead does BASE_PRICES research (top 15 missing airports, spot-check Google Flights/Skyscanner). Turning content effort toward BASE_PRICES backfill is higher ROI than proposals that sit unimplemented.

**Decision 3: DevOps/Content coordination on BASE_PRICES — CONTENT IS AUTHORITATIVE**

Today's DevOps report claimed BASE_PRICES at 100% coverage (conflating AIRPORT_COORDS with BASE_PRICES). Content correctly identified and documented the error. Going forward: Content agent owns BASE_PRICES tracking. DevOps should not re-raise BASE_PRICES as "resolved" without running: `node -e "const s=require('fs').readFileSync('app.jsx','utf8');const m=s.match(/BASE_PRICES\s*=\s*\{([^}]+)\}/s);console.log(m[1].match(/[A-Z]{3}/g).length)"`. This prevents the false-closed loop that's been burning PM cycles.

---

## This Week's Top 3 Priorities

**1. Jack: VPS redeploy + disk cache fix (10-min SSH — TODAY, Day 7)**

Seven days. This is the only thing that matters before Reddit launch. Everything else is optimizing a broken product.

```bash
# Add disk persistence first (Open #23), then:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, CORS includes capacitor://localhost
```

After `/health` confirms VPS healthy: flip `APNS_LIVE = true` in app.jsx and push.

**2. BASE_PRICES backfill — CUN + IBZ + HKT + BTV + NCE (~2hr, pre-Reddit gate)**

32 venues flip from `~$X` to live deal scoring. This is the deal-scoring pitch: if 68% of venues show estimates, the headline feature is undermined. Do this the session after VPS is live.

```javascript
// Add to BASE_PRICES in app.jsx (research-verified median round-trip from JFK):
CUN: {min:320, typical:480, peak:680},    // 9 venues
IBZ: {min:580, typical:780, peak:1100},   // 7 venues
HKT: {min:800, typical:1050, peak:1400},  // 6 venues
BTV: {min:200, typical:290, peak:380},    // 5 venues
NCE: {min:520, typical:720, peak:980},    // 5 venues
// Spot-check each against Google Flights before pasting
```

**3. Paste today's 5 venues (15 minutes, zero dependencies)**

BIQ/LIS/PPT/LIH/OOL — all at BASE_PRICES-covered airports, all pass guard checks, AIRPORT_COORDS additions included in content report. This is the easiest 373→378 in months: paste, auto-push bumps cache, done.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **Venue deep links / JSON-LD structured data** | Deferred — build after Reddit launch. Still not now. |
| **Google Play Store / PWABuilder** | Needs LLC first. LLC is their gate, not ours. |
| **REI / Backcountry / GetYourGuide affiliate onboarding** | LLC pending. Not our bottleneck. |
| **Pro UI revival** | CUT for v1. Do not revisit until 1K MAU. |
| **Stale branch cleanup** | No user-facing impact. Post-launch. |
| **Photo pipeline (UNSPLASH_KEY)** | Valid P2 gap, but BASE_PRICES backfill has higher pre-Reddit ROI. Defer until after launch post. |

---

## Success Criteria

**North star:** 100K downloads of an app people use weekly.

**90-day projection: 5K–8K users. What must be true for 8K, not 5K:**

| Gate | Status | Impact |
|------|--------|--------|
| Reddit/HN launch before Aug 15 | ❌ Not yet | Primary acquisition driver. S-hemi ski hook expires Sept 1. Every day is a real cost. |
| VPS deployed (real pricing + two-weekend scores + iOS CORS) | ❌ Day 7 | Fundamental. Can't post with a broken server stack. |
| BASE_PRICES ≥80% coverage | ❌ 31.5% today | Deal scoring is the differentiation. 68% estimated = pitch undercut. |
| Photos: venue-specific on top 50 | ❌ ~27/373 real | Degrades first impression. Not blocking launch. |
| App Store live (iOS) | ❌ APNS + LLC blocked | Not the primary 90-day driver — web/PWA is. |

**Path to 8K over 5K:** Reddit lands before Aug 15, VPS already fixed, BASE_PRICES above 60% so the deal score doesn't look broken under scrutiny. Miss the Aug 15 window and you're pitching "ski in the S-hemi" after summer has peaked.

---

## One Product Risk Nobody Is Talking About

**The BASE_PRICES data quality problem creates a measurement blindspot.**

DevOps agent reported 100% BASE_PRICES coverage today. Content corrected it to 31.5%. This wasn't a calculation error — it was confusing two different data structures. The agents can't agree on how bad this is, which means we can't accurately score the urgency.

This matters because BASE_PRICES isn't just a UI nicety. It's the foundation of `getDealScore`, which powers the "Best weekend" sort. When 68% of venues have no BASE_PRICES entry, their deal scores are computed on estimates, which means the sort order on the main grid is partially made up. A user who opens Explore and gets a `~$X` deal score on 2 of every 3 cards will lose trust in the feature faster than they'll lose trust in the weather data.

The fix is known, the research is doable in 2 hours, and it's one of the few pre-Reddit gates we can close without VPS access. It should have been done two weeks ago.

---

*v105 — written 2026-07-31 by PM agent. Supersedes v104.*
