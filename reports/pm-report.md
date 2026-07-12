# Peakly PM Report — 2026-07-12 (v86)

> Supersedes v85 (July 11). **Status: GREEN on code, YELLOW on distribution.** Day 12 post-launch. **Week-2 return window closes TOMORROW (July 13).** Retention email has been P0 for 6 consecutive reports. Code healthy. 3 placeholder-tag venues are today's highest-value agent fix. 5 new venue candidates unverified — held.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **375 venues (133 ski / 242 beach).** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260711a` — 1 day old, correct. No code change since July 11 = no bump needed.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8.** Stop. |
| "lateSeason regression open" | **FIXED July 11 (`18b19b5`). Count = 13.** Stop. |
| "lateSeason: 6 / 9 / 5 / 25 / 31 venues" | **13.** Full list: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags.** Stop. |
| "5 placeholder-tag ski venues" | **3 remaining** (whistler, beaver-creek, park-city-mountain). Stop saying 5. |
| "cancun-beach dup" | **FIXED July 8. 0 duplicate IDs.** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |

---

## Shipped Since v85 (2026-07-11 → 2026-07-12)

| Commit | What | Verdict |
|--------|------|---------|
| `6f4617e` — DevOps July 12 | Full audit GREEN, no changes, email deadline flagged | ✅ Pipeline current |
| `90da402` — Content July 12 | Data health 90/100, 3 placeholder-tag fixes staged, 5 new venues staged | ✅ Clean audit, actions staged |

**No app.jsx changes today — cache `20260711a` correct.**

**Code state July 12:**
- `app.jsx`: 13,502 lines · cache `20260711a` · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach)
- GEAR_ITEMS: 0 · lateSeason: 13 · Sentry: active · Plausible: scoped ✅

---

## Bug Triage — July 12

| Bug | Severity | Status |
|-----|----------|--------|
| **Week-2 retention email unsent** | **P0** | **DAY 6. WINDOW CLOSES TOMORROW.** After July 13, the 7–10 day re-engagement window for the July 1–7 cohort is over. This is the last day to generate Week-2 return data. Jack only. |
| **Plausible data unread** | **P0** | Day 12. 375 venues, 12 days of user behavior, zero signal. Every product decision this week is a hypothesis. Jack: plausible.io, 15 min. |
| **3 placeholder-tag ski venues** | **P1 (pre-Reddit)** | whistler ("All Levels"), beaver-creek ("Family Friendly"), park-city-mountain ("All Levels") — dilutes the Powder Day filter. Content July 12 has exact replacement tags. Agent-executable. Ship before any more distribution. |
| **VPS weather cache** | P1 | Unverifiable from sandbox. Jack: `curl https://peakly-api.duckdns.org/health`. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 33. 2 min. Jack only. |
| **4 staged venues unverified** (Jul 11 batch) | P2 | alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil, punta-mita-beach — gate: `validate-venues.mjs` + photo visual check. Hold. |
| **5 staged venues unverified** (Jul 12 batch) | P2 | essaouira, sunny-beach-bg, sango-sands, tropea-beach-it, porter-heights-nz — same gate. Hold. |
| Babel 8.x upgrade | P2 | DEFER post-500 MAU. |
| LatAm beach gap | P3 | DEFER until Plausible confirms demand. |
| SRI hashes on CDN scripts | P3 | DEFER post-LLC. |
| Plausible dashboard domain update (Settings UI) | P2 | Jack only. plausible.io → Sites → Settings → Domain → `j1mmychu.github.io/peakly`. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate-commit pattern · cross-category photos · Plausible domain (code side) · surf-legacy tags · cancun-beach dup (July 8) · lateSeason regression (July 11) · GIG/AP_CONTINENT (July 11)

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Week-2 email** (Jack — TODAY, closes July 13) | First real user research + return-visitor measurement | Day 6 |
| **Plausible read** (Jack, plausible.io) | All product prioritization — **12 days blind** | Day 12 |
| **VPS health check** (Jack, local terminal) | Weather reliability confidence for first 12 user-days | Day 28 |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 33 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 12

### Decision 1: SHIP the 3 placeholder-tag fixes. Agent-executable. Do it this run.

Whistler, Beaver Creek, and Park City Mountain are three of the most searched ski destinations in the catalog. They currently have tags like "All Levels" and "Family Friendly" — strings that describe roughly 40% of the ski catalog and contribute nothing to filter discrimination.

Content July 12 has the exact replacement arrays:
- `whistler`: `["Deep Powder", "Blackcomb Glacier", "Village Nightlife", "World Cup Racing"]`
- `beaver-creek`: `["Groomed Perfection", "Birds of Prey Downhill", "Ski-in/Ski-out", "Uncrowded Runs"]`
- `park-city-mountain`: `["Largest US Resort", "Rock Legends Gondola", "Park City Historic District", "Olympic Legacy"]`

This is a 6-string change. The Powder Day filter result set improves. The detail sheets for three of the catalog's headline venues improve. No regression risk.

**SHIP: DevOps or Content executes this one-time tag replacement. No new logic, no new venues. App.jsx edit only. Cache bump required on commit.**

### Decision 2: HOLD all 9 unverified staged venues (Jul 11 batch of 4 + Jul 12 batch of 5).

Both batches carry Unsplash photo URLs that have not been run through `validate-venues.mjs`. The Jul 12 batch (essaouira, sunny-beach-bg, sango-sands, tropea, porter-heights) looks well-constructed — good AP coverage, real geographic gaps addressed — but the photo gate exists for a reason. A 404 image is a worse first impression than a missing venue.

Before any of these 9 ship: `node scripts/validate-venues.mjs` returns all PASS. Jack or a networked agent verifies. Until then, catalog stays at 375.

**HOLD: All 9 staged venues. Gate: validate-venues.mjs pass + photo visual check.**

### Decision 3: The LatAm beach gap is a P3, not a sprint item.

Content correctly identifies that South America has only 3 venues (all Brazil). This is a real gap. It is not, however, the reason a US-based user will bounce. The distribution channel (Reddit/HN) skews heavily North American. LatAm expansion matters at >5K users when we've confirmed international demand from Plausible.

**DEFER: LatAm beach expansion. Add this to the post-500-MAU queue. Spend the time on placeholder-tag fix and retention email instead.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Send the retention email TODAY. The window closes tomorrow.**

This is the 6th consecutive P0 flag and the last time it can be P0. By July 14, the optimal window is gone and this becomes a reengagement ask, not a return measurement. The email is 3 sentences. The reply is user research you can't buy any other way.

Draft (same as v85):
> Subject: Peakly updated for next weekend
>
> Hey — I built Peakly and you visited last week. Scores for the July 18–20 weekend just updated — [link]. Hit reply and tell me one thing that felt off or one place you tried to find that wasn't there.

Send from jjciluzzi@gmail.com. Manual.

**2. Fix 3 placeholder-tag venues (agent-executable this run).**

Six tag strings. Three headline ski venues. Improves filter quality immediately. Zero regression risk. Before any more distribution.

**3. Jack: Read Plausible. One dashboard view determines the next 30 days.**

The numbers that change everything: unique visitors Week 1, return rate Week 2, filter distribution. If Week-1 uniques are <500, a second Reddit post happens before July 18. If Beach filter is <40% in July, the landing copy has a framing mismatch. Nothing in the agent queue matters more than these 3 numbers.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| 9 staged venues (unverified) | **HOLD — photo URL gate not cleared.** |
| LatAm beach expansion (Mancora, Pipa) | **DEFER.** No demand signal at current MAU. Post-500. |
| Automated email digest | **DEFER.** Founder email first. Prove pull before automating. |
| JSON-LD / structured data | **DEFER.** SEO compounds on traffic. Post-1K users. |
| Venue deep links / permalink pages | **DEFER.** No data showing >100 detail-sheet views/day per venue. |
| Hotel integrations | **CUT for v1.** |
| New categories | **CUT.** Ski + beach is the moat. |
| Babel 8.x upgrade | **DEFER.** P2. Post-500 MAU, test in branch. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** |

---

## Success Criteria — 8K vs 5K

**Today's measurement gate (closes July 13):**
- Send the email. Measure replies and return rate July 13–17.
- If organic return rate (ex-email) >15% → product has pull, hold and watch.
- If organic return rate <15% → onboarding fix is Sprint 3, not more venues.

**The fork that determines 8K vs 5K:**
- Week-1 unique visitors <500 → second Reddit post by July 18 before building anything.
- Week-1 uniques >2K + Week-2 return >20% → Share-a-List is the growth loop, accelerate.
- Week-1 uniques 500–2K + return <20% → fix onboarding first, then second post.

Jack reads Plausible. Numbers land in a session comment. v87 becomes the data-driven sprint plan.

---

## One Product Risk Nobody Is Talking About

**We've added 5 venues this sprint and fixed zero user-facing flows.**

July 8–12: 375→375 on the venue count (dups removed, a few added, net flat). But the catalog additions are catalog work. The return window opened July 11 and users coming back to Peakly are landing in the same onboarding, the same filter experience, the same scoring explanation they saw in Week 1. If Week-2 data shows a <15% return rate, the correct diagnosis is "the product didn't give them a reason to come back" — not "we needed more venues."

The pattern to avoid: adding venues as the default response to stagnant growth. Venue count is a catalog metric, not a user metric. The retention email and Plausible read are the two actions that tell us whether the *product* is sticky. Until we have that data, catalog additions are noise, not signal.

The question nobody has answered yet: what did users *do* in Session 1? Did they open a venue detail sheet? Did they tap a filter? Did they try to book? Plausible has this. Jack has 15 minutes.

---

*PM agent — 2026-07-12 (v86). Recommended action this run: Content/DevOps executes the 3-venue placeholder-tag fix (Decision 1). All other opens are Jack-gated. v87 expected July 13 — if Jack shares Plausible data, v87 is the data-driven Week-2 sprint plan.*
