# Peakly PM Report — 2026-07-30 (v104)

> Supersedes v103 (July 29). **Status: RED.** Day 30. VPS unredeployed for **Day 6** — zero code commits since July 25. 15 venue proposals in backlog, zero implemented across 3 sessions. The product is stalled while the S-hemisphere ski window shrinks.

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
| "Cross-category photo contamination (all cleared)" | **FALSE. `cancun-beach` shares Unsplash photo with `big-white-ski-s5`.** New finding July 30. Fix is a one-line URL swap. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "AP_CONTINENT gaps (any)" | **FIXED July 29. 133/133 clean.** Stop. |
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
| "BASE_PRICES covers only 10.3% or 31.5%" | **FALSE. Current node eval: 46/133 venue APs = 35%. Use node, not grep.** |
| "Tamarindo Costa Rica (LIR) not in catalog" | **FALSE. `tamarindo-cr` exists at ap:SJO.** Stop. |
| "APNS_LIVE=true, VPS deployed" | **VPS NOT REDEPLOYED.** `APNS_LIVE = false` since v102 stopgap. Flip true only after `/health` confirms `apns: configured`. Stop. |
| "LIH missing from BASE_PRICES and AP_CONTINENT" | **FALSE. LIH IS in BASE_PRICES and AP_CONTINENT.** Missing ONLY from AIRPORT_COORDS. One-line fix. |

---

## Shipped Since v103 (2026-07-29 → 2026-07-30)

| Commit | What | Verdict |
|--------|------|---------|
| `764b94b` | DevOps daily report 2026-07-30 (RED) | ✅ Routine |
| `5404841` | Content daily report 2026-07-30 — 5 venue proposals (GIG/CHC/BRC/TPA/KOA) | ✅ Routine |

**Zero code commits in 5 days (July 26–30).** The last code changes were all on July 25: iOS widget wiring, APNS fix, paint-from-cache optimization. Since then: only daily reports. 15 venue proposals staged and unimplemented. VPS undeployed for 6 consecutive days.

**Code state July 30:**
- `app.jsx` HEAD: **373 venues** (131 ski / 242 beach)
- `PEAKLY_BUILD`: `20260725d` — 5 days since last code edit (expected, not broken)
- `APNS_LIVE`: **false** (stopgap from v102)
- `AP_CONTINENT`: **133/133 venue APs** ✅
- `AIRPORT_COORDS`: **LIH missing** — one-line fix
- `lateSeason`: 14 · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- `BASE_PRICES`: **46/133 venue APs covered (35%)** — 87 APs missing
- `cancun-beach`: cross-category photo shared with `big-white-ski-s5` ❌

---

## Bug Triage — July 30

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 6** | **P0** | Jack-only. 10-min SSH. Six days on the list. Bundle with Open #23. |
| **Open #23: weather cache in-memory only** | **P1 (bundle with #19)** | DevOps report has the 30-line disk-persistence fix. Same SSH session. Do NOT restart pm2 until disk persistence is added first. |
| **BASE_PRICES: 65% of venues show `~$X` estimated fares** | **P1 (pre-Reddit gate)** | 87 of 133 venue APs missing. Top by venue count: CUN (4), BOB/BTV/ALB/PLS/AXA/SPU/IBZ/NCE/USM/MPH/OSL/DLM/CMB/RAK (2 each). ~2hr research. Deal scoring is a headline feature — estimated prices on most venues undermine the pitch. |
| **cancun-beach cross-category photo** | **P2** | Ski photo on a beach card. One URL swap in app.jsx. Content report has the replacement. 30 seconds. |
| **LIH missing from AIRPORT_COORDS** | **P2** | Blocks Kauai venues. Add `LIH:{lat:21.9759,lon:-159.3380}` alongside HNL/OGG/KOA. One line. |
| **15 venue proposals unimplemented** | **P2** | 3 content sessions, 0 paste-ins. Today's 5 are paste-ready (see content report). |
| **Grace Bay near-dup** | **P3** | `beach_grace` + `grace-bay-turks`: distinct ends of a 12-mile strip, 5.6km apart. Not a crash. Decision made below. |
| **Supabase delete-account SQL paste** | **P0 (App Store) / P3 (web)** | 2-min paste. iOS App Store gate only. |
| **15 stale remote branches** | **P3** | Jack-optional. Not blocking launch. |
| **Photos: ~346/373 venues generic stock** | **P2** | Biggest quality gap. Needs `UNSPLASH_KEY`. |

---

## Three Product Decisions — July 30

**Decision 1: Grace Bay near-dup — KEEP BOTH, add differentiation**

`beach_grace` and `grace-bay-turks` are genuinely different ends of a 12-mile strip (5.6km apart). Merging loses a legitimate indexable location. Keep both. Before Reddit launch: update tags to differentiate — `beach_grace` gets "Calmer West End Waters, Sunset Views"; `grace-bay-turks` gets "Snorkeling East End, Reef Access." That's the call. Do not merge.

**Decision 2: Venue proposal backlog — IMPLEMENT OR PAUSE THE PIPELINE**

Content has staged 15 validated proposals across 3 consecutive sessions with zero implementations. Today's 5 (Copacabana/Porter Heights/Cerro Bayo/Fort De Soto/Kua Bay) pass all guard checks, 2 are southern ski venues in peak season **right now**. Decision: Jack pastes these 5 within 48 hours (15 minutes) or content agent suspends new proposals until the backlog clears. A growing staging queue is wasted agent effort.

**Decision 3: Stale branch cleanup — DEFER until after Reddit launch**

15 stale remote `claude/*` branches. No user-facing impact. DEFER until post-launch cleanup session. Don't interrupt the pre-launch push for housekeeping.

---

## This Week's Top 3 Priorities

**1. Jack: VPS redeploy + disk cache fix (10-min SSH — TODAY, Day 6)**

Six consecutive days of broken server-side features. One session:
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21
# Add disk persistence from DevOps report BEFORE restarting pm2
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: forecast_days:14, CORS includes capacitor://localhost
```
After `/health` confirms VPS: flip `APNS_LIVE = true` in app.jsx, push. Closes Open #19, #21, #23 in one session.

**2. BASE_PRICES backfill — top 15 APs (~2hr, required before Reddit/HN post)**

65% of venues show estimated fares. The deal score is a core differentiator. Backfill CUN/BOB/BTV/ALB/PLS/AXA/SPU/IBZ/NCE/USM/MPH/OSL/DLM/CMB/RAK — covers 34 venues, flips them from `~$X` to live deal scoring. ~2hr research from Google Flights / Skyscanner spot-check. Pre-Reddit launch gate.

**3. Quick wins batch (45 minutes total, not blocked on VPS)**

Three staged fixes with zero dependencies:
- **cancun-beach photo**: swap one Unsplash URL (ski photo on beach card) — content report has the fix
- **LIH AIRPORT_COORDS**: `LIH:{lat:21.9759,lon:-159.3380}` — one line, unblocks Kauai
- **5 venue paste-in**: Copacabana/Porter Heights/Cerro Bayo/Fort De Soto/Kua Bay — JS objects ready in content report, all guard checks pass

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **Venue deep links / JSON-LD structured data** | Deferred per prior decision — build after Reddit launch |
| **Stale branch cleanup** | No user-facing impact. Not now. |
| **Google Play Store / PWABuilder** | Needs LLC first. Not our bottleneck. |
| **REI / Backcountry / GetYourGuide affiliate onboarding** | LLC pending — their gate, not ours. |
| **Pro UI revival** | CUT for v1. Do not revisit until 1K MAU. |

---

## Success Criteria

**North star:** 100K downloads of an app people use weekly.

**90-day projection: 5K–8K users. What must be true for 8K, not 5K:**

| Gate | Status | Impact |
|------|--------|--------|
| Reddit/HN launch before Aug 15 | ❌ Not yet | Primary acquisition driver. S-hemisphere ski hook expires Sept 1. |
| VPS deployed (real pricing + two-weekend scores + iOS CORS) | ❌ Day 6 | Users seeing `~$X` + flat scores bounce. Not a soft risk. |
| BASE_PRICES ≥80% coverage | ❌ 35% today | Deal scoring is the differentiation. Can't post on Reddit with 65% estimated. |
| Photos: venue-specific on top 50 | ❌ ~27/373 real | First impressions compound at launch. |
| App Store live (iOS) | ❌ APNS + LLC blocked | Not the primary 90-day driver — web/PWA is. |

**Path to 8K over 5K:** Reddit lands before Aug 15 with VPS + BASE_PRICES already fixed so the product doesn't embarrass itself under traffic. Without those two: 5K ceiling is generous.

---

## One Product Risk Nobody Is Talking About

**The southern hemisphere ski window closes in 6 weeks.**

Peakly's unique summer proposition is 23 S-hemisphere ski venues — the ones OpenSnow goes dark on in July. Peak season: July–September. The hook for a Reddit launch post is "where to ski *this weekend* when North America is off-season" — a hook that only works while those venues are actually in season.

After September 1, the angle becomes "where to ski next winter." That's a much weaker spontaneous-weekend pitch.

This is the real deadline. Not App Store review timelines. Not LLC processing. The S-hemisphere ski window is on the clock. A Reddit/HN post that lands after September loses this differentiator for a full year.

---

*v104 — written 2026-07-30 by PM agent. Supersedes v103.*
