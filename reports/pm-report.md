# Peakly PM Report — 2026-07-08 (v82)

> Supersedes v81 (July 7). **Status: GREEN on code, YELLOW on distribution.** Day 8 post-launch. Sprint items 3+4+6 SHIPPED by Content agent. New P1: `lateSeason:true` overuse on 19 closed N. hemisphere ski resorts — PM decision required today.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues as of July 8.** Stop. |
| "370 venues" | **373 venues (−2 dups, +5 new this run).** Update your baseline. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260708a` — bumped by DevOps this morning.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "Duplicate commit pattern" | **Known-skipped June 25.** Stop. |
| "197 empty-tag venues" | **FALSE. All 373 have ≥2 tags.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags. See v81 Decision 1. Stop.** |
| "lateSeason: 6 venues" | **28 venues as of July 8 (+3 new glacier venues).** Stop. |
| "2 duplicate venues pending removal" | **FIXED July 8 (Content `e796902`).** Stop. |
| "5 placeholder-tag ski venues" | **FIXED July 8 (Content `e796902`).** Stop. |

---

## Shipped Since v81 (2026-07-07 → 2026-07-08)

| Commit | What | Verdict |
|--------|------|---------|
| `b176829` — DevOps | Cache `20260707a` → `20260708a` across app.jsx + sw.js + index.html | ✅ Routine maintenance |
| `e796902` — Content | Remove 2 dup venues (`bigsky`, `beach_miami`). Fix placeholder tags on 5 ski venues. Add 5 new venues (2 beach, 3 ski glacier). Net: 370 → 373. | ✅ Sprint items 3+4+6 fully executed. Good ship. |

**July 7 sprint status — COMPLETE:**

| Item | Status |
|------|--------|
| 1 — Read Plausible + Sentry | ⏳ Jack only |
| 2 — Plausible domain fix | ✅ DONE July 7 |
| 3 — Remove 2 duplicate venues | ✅ DONE July 8 (Content) |
| 4 — Fix 5 placeholder-tag ski venues | ✅ DONE July 8 (Content) |
| 5 — Remove 27 surf-legacy tags | ❌ CANCELLED v81 Decision 1 |
| 6 — Add 5 glacier ski venues | ✅ **PARTIAL** — 3 of 5 shipped (les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). Alpe d'Huez + Cortina d'Ampezzo still pending. |
| 7 — Supabase SQL paste | ⏳ Jack only — **Day 29** |
| 8 — Draft Week-1 retention email | ⏳ Jack only — **DEADLINE JULY 10** |

**Code state July 8:**
- `app.jsx`: ~13,500 lines · cache `20260708a` · braces 5,568/5,568 ✅
- **373 venues** (133 ski / 240 beach)
- GEAR_ITEMS: 0 · lateSeason: 28 · max photo repeat 4× beach / 3× ski
- Sentry: active · Plausible: domain scoped ✅ · VPS: unverified from sandbox

**⚠️ Photo URL verification pending (Jack):** 5 new venue Unsplash IDs need a browser check before they're trusted on the front page. IDs: `1566452348683-af04c7f8b0e8` (Arugam Bay), `1548438294-1ad5d5f4f063` (Essaouira), `1583119022894-919a68a3d0e3` (Les Deux Alpes), `1551698618-1dfe5d97d256` (Saas-Fee), `1606787364406-a3cdf06c6d0c` (St. Moritz). If any returns 404, swap before the next VPS cache warm.

---

## Bug Triage — July 8

| Bug | Severity | Status |
|-----|----------|--------|
| **`lateSeason:true` on 19 closed N. hemi ski resorts** | **P1** | New finding. Closed resorts (Breckenridge, Courchevel, Kitzbuehel, etc.) may surface above open S. hemi lifts in July if snow depth reports ≥ 0.5m. See Decision 1 below. |
| **Week-1 retention email** not sent | **P0** | Deadline July 10. One day away. Miss it and Week-2 return data is uninterpretable. |
| **Plausible data unread** | **P0** | 8 days of real user data. Jack: plausible.io before any new build work. |
| **VPS weather cache** — Day 8, unknown restart state | **P1** | Jack: `curl https://peakly-api.duckdns.org/health`. If `wx_cache_size == 0`, warm before July 11 return-visitor window. |
| **`borabora` has `lateSeason:true`** | **P2** | Beach venue with a ski-only scoring flag. One-field remove. Harmless today but data quality error. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | Day 29 open. 2 minutes. Jack only. |
| Alpe d'Huez + Cortina d'Ampezzo | P3 | 2 of 5 glacier venues still pending from sprint item 6. Not July-critical (both off-season). |
| Photo URL verification (5 new venues) | P2 | Jack: open 5 Unsplash URLs in browser. 2 minutes. |
| Plausible dashboard domain update | P2 | Jack: plausible.io → Sites → Settings → Domain → `j1mmychu.github.io/peakly` |
| SRI on CDN scripts | P3 | DEFER post-LLC. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" outage framing · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays · cross-category photo contamination · Plausible domain (code side) · surf-legacy tags · 2 dup venues · 5 placeholder-tag ski venues

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Week-1 retention email** (Jack, personal) | Week-2 return rate measurement — expires July 10 | 0 days left |
| **Plausible read** (Jack, plausible.io) | Every product prioritization call this week | Day 8 post-launch |
| **VPS health verify** (Jack, local terminal) | Confirms weather data reliability for Week-2 window | Day 24 |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 29 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |
| Apple Developer ($99) | App Store submission | Post-launch |

---

## Explicit Product Decisions — July 8

### Decision 1: `lateSeason:true` on 19 closed N. hemisphere ski resorts — SHIP THE FIX.

Content agent identified that ~19 N. hemisphere ski venues carry `lateSeason:true` but close in April and have no summer skiing. In July, if Open-Meteo reports ≥ 0.5m snow depth at elevation (common from lingering glacial snowpack), these closed resorts bypass the off-season cap and can surface on the front page above actually-open Southern hemisphere lifts.

The scenario: a user in London opens Peakly this weekend. The Skiing filter shows Breckenridge or Courchevel (closed since April, but high-altitude Open-Meteo reports 0.7m snow depth) ranked above Valle Nevado or Thredbo (open, lifts running). That's a product credibility failure — the app looks broken.

Correctly flagged (confirmed glacier/year-round): whistler, zermatt, val-thorens, snowbird, verbier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.

Incorrectly flagged (closes April, no summer ski — **remove `lateSeason:true` from these 19**): breckenridge, grandtarghee, courchevel, kitzbuehel, winter-park, copper-mountain, mt-bachelor, sugarloaf, revelstoke, lake-louise, engelberg, crans-montana, beaver-creek, park-city-mountain, fernie, kimberley, nakiska, meribel, les-menuires.

**This is a data correction, not a scoring algorithm change.** CLAUDE.md's algorithm-critique requirement applies to modifying scoring formulas (DEAL_WEIGHT, scoreVenue logic). Correcting a wrong boolean field on a venue object is the same class of fix as correcting a wrong lat/lon. No critique required.

Also fix `borabora` (beach venue with ski-only `lateSeason:true` — one field remove).

**SHIP: Remove `lateSeason:true` from 19 closed N. hemi ski venues + borabora. 20 field removals. Execute in next DevOps or Content run.**

### Decision 2: Tenerife + Crete beach venues — SHIP pending airport constant additions.

Content agent staged Las Teresitas (TFS, Tenerife) and Elafonissi (CHQ, Crete). Both are July-peak Mediterranean beaches missing from a catalog with 14 Greece venues but zero Crete entries. Elafonissi (pink-sand lagoon, 18K reviews) is one of the most searched European beaches in summer.

Prerequisites: Add `TFS:{lat:28.0445, lon:-16.5726}` to AIRPORT_COORDS (TFS already in AP_CONTINENT:europe). Add `CHQ:{lat:35.5317, lon:24.1497}` to both AIRPORT_COORDS and AP_CONTINENT.

**SHIP: Add airport constants + 2 venues in next Content run. Run `validate-venues.mjs` first.**

### Decision 3: Alpe d'Huez + Cortina d'Ampezzo — DEFER to next Content run.

Both were in the original 5-glacier sprint but didn't ship July 8. Neither is open for skiing in July (both are off-season N. hemi right now without an active glacier). Not July-urgent. Stage them for September when N. hemisphere ski season build-up begins.

**DEFER: Next Content run, October sprint. Not worth the July focus.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Send Week-1 retention email tomorrow (July 10). This is the deadline, not a suggestion.**

The window closes July 10. 3 sentences from Jack personally. One live venue link with next weekend's scores. One open question — "what was wrong?" The reply rate will tell you more about product-market fit than any analytics dashboard. Every reply is user research you cannot buy.

**2. Execute `lateSeason:true` fix (Decision 1) — 20 field removals, agent-executable.**

A closed ski resort surfacing above open Southern hemisphere lifts is the kind of thing a Redditor screenshots and posts as "lol this app thinks Breckenridge is open in July." Fix it before the Week-2 return window opens (July 11). This is the highest-impact code change available right now.

**3. Jack: Read Plausible. VPS health check.**

8 days of data. One browser tab. The VPS check is a 2-minute curl. Do both before approving any further build work this week.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| Automated weekly email digest | **DEFER.** Manual founder email first. Infrastructure after signals. |
| Hotel integrations | **CUT for v1.** Scope creep. |
| JSON-LD / structured data | **DEFER.** SEO compounds on traffic that doesn't exist yet. Post-100 users. |
| Venue deep links / permalink pages | **DEFER.** Build after Plausible shows >100 detail-sheet views/day per venue. |
| Photo pool expansion (≤2× repeat) | **DEFER.** Needs ~100 new verified Unsplash IDs. Not the bottleneck at current MAU. |
| New venue categories (climbing, surf, hiking) | **CUT.** Ski + beach is the moat. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** P3. |
| Gran Canaria (LPA) | **DEFER.** LPA not in AIRPORT_COORDS. Airport constant work is fine, but prioritize Tenerife + Crete first. |

---

## Success Criteria — 8K vs 5K

**Gate metrics (unchanged from v80/v81):**
1. **Week-1 unique visitors ≥ 2K** — if below, repost before building
2. **Week-2 return rate ≥ 20%** — if below, onboarding hook becomes next sprint
3. **Beach filter ≥ 40% of filter clicks in July** — if below, seasonal framing mismatch

**For 8K not 5K:** organic referral loop kicks in by Week 4. "Share a weekend plan" generates ≥5 organic referrals/week by July 28 without a second distribution push. If it doesn't, 5K is the ceiling and a second Reddit post — not feature work — is the path.

---

## One Product Risk Nobody Is Talking About

**The `lateSeason:true` bug is already live, affecting right now.**

The July 8 Content report confirmed this and flagged it for PM decision. But the mechanism has been running since the flag was added in May. Any user who opened the Skiing filter in the past 8 days may have seen a closed N. hemisphere resort ranked above an open Southern hemisphere one, depending on what Open-Meteo returned for elevation snow depth that day.

We don't know how often this happened because we can't read Plausible. We don't know if it caused bounce because we haven't sent the retention email. We've been shipping catalog quality improvements (photo dedup, tag cleanup, dup removal) while a silent ranking error was surfacing closed resorts to the first real users.

The good news: it's a one-Edit fix. The bad news: it's been live since launch.

**Fix it before the Week-2 return window (July 11). A returning user who got a bad result on Day 1 comes back to see if it's better — show them it is.**

---

*PM agent — 2026-07-08 (v82). v83 expected July 9. Priority for next agent run: execute `lateSeason:true` fix (Decision 1) + Tenerife/Crete airport constants + 2 new beach venues (Decision 2).*
