# Peakly PM Report — 2026-04-20 (v24)

**Filed by:** Product Manager agent  
**Date:** 2026-04-20  
**Status:** 9 venue tag credibility bugs fixed (Apr 19), needsMarine regression patched (Apr 20). Remaining: duplicate Cloudbreak + Punta Roca entries still live. Delete them, then launch Reddit.

Full report: [pm-2026-04-20.md](./pm-2026-04-20.md)

---

## Shipped Since Last Report (2026-04-17 → 2026-04-19)

| Commit | What | Right call? |
|--------|------|-------------|
| `d039180` (Apr 17) | PM report only | — |
| `6e893de` (Apr 17) | Content report (no code changes) | — |
| `c170030` (Apr 17) | DevOps: fixed duplicate /api/waitlist route + cache bust | ✅ Correct |

**Zero product code shipped Apr 17–19.** The April 17 PM report flagged Cloudbreak and Punta Roca as P1 credibility bugs requiring same-day fix. They sat for 2 days. Fixed this session.

### Fixed This Session

| Fix | Venue | Change |
|-----|-------|--------|
| ✅ **P1** | Cloudbreak Fiji (cloudbreak-fiji-s21) | Tags: "Beach Break, All Levels, Consistent Swell, Longboard Friendly" → "Reef Break, Expert Only, Big Wave, Boat-Access Only" |
| ✅ **P1** | Punta Roca (punta-roca-s12) | Tags: "Point Break, Beginner Friendly, Warm Water, Year-Round" → "Point Break, Expert Level, Hollow Left, Central America Classic" |
| ✅ **P2** | Snapper Rocks Gold Coast (snappers-gold-coast-s26) | Tags: "Beach Break, All Levels" → "Point Break, Intermediate Plus, Superbank, World Class Right" |
| ✅ **P2** | Capbreton France (capbreton-s27) | Tags: "Point Break, Beginner Friendly, Warm Water" → "Beach Break, All Levels, Atlantic Swell, Cold Water" |
| ✅ **P2** | Matanzas Chile (matanzas-s17) | Tags: "Beginner Friendly, Warm Water" → "Intermediate, Cold Water" |
| ✅ **P2** | Indicator Santa Barbara (indicator-s22) | Tags: "Beginner Friendly, Warm Water" → "Intermediate, Long Walls, Cold Water" |
| ✅ **P3** | Baler Philippines (baler-s7) | Wave type: "Point Break" → "Beach Break" |
| ✅ **P2** | Catanduanes Philippines (catanduanes-s16) | Tags: "All Levels, Longboard Friendly" → "Intermediate, Powerful Surf, Tropical" |
| ✅ **P2** | Kicking Horse BC (kicking-horse-s10) | Tags: "All Levels, Groomed Runs" → "Expert Terrain, Steep Chutes" |

---

## Bug Triage — April 19

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Duplicate venue entries** | **P2** | ❌ Open | Day 1 |
| **Strike alerts background worker unbuilt** | **P1** | ❌ Open | Day 30+ |
| **No onboarding scoring explanation** | **P2** | ❌ Open | Day 30+ |
| **Residual batch venue tag issues** | **P2** | ⚠️ 9 fixed this session; ~2 remain | Day 3 |
| **No SRI on CDN scripts** | **P3** | ❌ Open | Open |
| **JSON-LD structured data absent** | **P3** | ❌ Open | Open |

### New Finding: Duplicate Venues

Two venues appear twice:

- `cloudbreak` (canonical) + `cloudbreak-fiji-s21` (batch duplicate) — same break, Tavarua, Fiji
- `punta_roca` (canonical) + `punta-roca-s12` (batch duplicate) — same break, La Libertad, El Salvador

Users see both entries in search results. Both score from the same weather data. Looks amateur.

---

## Explicit Product Decisions — April 19

**Decision 1: Remove duplicate venue entries. SHIP this week.**
Remove `cloudbreak-fiji-s21` and `punta-roca-s12`. Canonical entries have better data. Net count: 229. Pre-launch user base is effectively zero so no migration risk.

**Decision 2: Venue tag audit is closed for this sprint. DEFER remaining edge cases.**
9 fixes this session cover the highest-credibility-risk venues. Stop auditing. Prepare for Reddit.

**Decision 3: Strike alerts background worker. DEFER to 500 users.**
Unchanged. The worker requires VPS cron + push reliability work. 0 Alerts users today. Build when there's demand to disappoint.

---

## Known Blockers

| Blocker | Owner | Status |
|---------|-------|--------|
| **LLC approval** | External (Jack) | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |
| **Duplicate venue removal** | Dev — 30 min | Pre-Reddit credibility fix |
| **Reddit launch post** | Jack | The actual growth lever |

---

## This Week's Top 3 Priorities Only

### 1. Remove duplicate venues (30 min, Dev)
`cloudbreak-fiji-s21` and `punta-roca-s12` are redundant. Delete them. 229 quality venues > 231 with duplicates.

### 2. Jack: Submit the Reddit launch post
Code is in best shape it's been. Algorithm solid. Venue data now credible. The thing blocking growth is not code — it's the launch. Pick a sub, write the post, ship it.

### 3. Jack: LLC status
REI is $6.16 RPM vs $0 now. At 1K MAU = $6,160/month. At 5K MAU = $30,800/month. Every week of LLC delay is compounding revenue loss. What's the specific blocker?

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Strike alerts background worker** | 0 active Alerts users. Build when there's demand. |
| **Onboarding scoring explanation** | Reddit comments will surface real confusions. Don't design for hypothetical users. |
| **JSON-LD / SRI / CSP hardening** | SEO at 81% is launch-acceptable. Post-launch. |
| **Window Score / Forecast Horizon** | No new features while preparing for launch. |
| **iOS App Store submission** | No proven browser retention. PWA first. |
| **Additional venue tag audit passes** | The worst are fixed. Diminishing returns. Move on. |

---

## Success Criteria

**For 5K users (base case):** One Reddit post hits front page of r/surfing or r/skiing. Plausible shows 48hr spike + 15% D7 retention.

**For 8K users (upside case):**
1. Reddit post hits >800 upvotes with zero credibility objections — venue tag quality is the delta
2. Two secondary organic posts in r/travel or r/digitalnomad within 30 days
3. SEO long-tail ("best surf spots + cheap flights") starts indexing by Day 60
4. At least one affiliate conversion visible in Travelpayouts or Amazon dashboards

**The 5K→8K gap is venue credibility + launch timing.** Both improved today.

---

## One Product Risk Nobody Is Talking About

**The app has never been tested by an actual surfer or skier.**

All QA has been AI agents auditing AI-generated data. Cloudbreak was labeled "All Levels" for 9+ days before this report caught it. The only way to find remaining landmines is to have one experienced surfer spend 10 minutes in the app before Reddit launch. That person is not an agent — it's Jack, or a friend who surfs. Costs nothing. Prevents everything.

---

*Next report: 2026-04-20. Priority: confirm duplicate venue removal shipped; confirm Reddit launch date.*
