# Peakly PM Report — 2026-07-08 (v82)

> Supersedes v81 (July 7). **Status: GREEN on code, YELLOW on distribution.** Day 8 post-launch. Zero overnight commits — all July 7 sprint code items are still pending execution. Week-2 retention email deadline is **July 10**, two days away.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260707a` — bump due today via DevOps.** Stop flagging the prior day's stamp. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "Duplicate commit pattern" | **Known-skipped June 25.** Stop. |
| "197 empty-tag venues" | **FALSE. All 370 have ≥2 tags.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7 (DevOps `4001690`).** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags. See v81 Decision 1. Stop.** |
| "lateSeason: 6 venues" | **25 venues.** Stop. |

---

## Shipped Since v81 (2026-07-07 → 2026-07-08)

**Nothing shipped overnight.** Working tree clean. HEAD: `5c8748c` (PM report v81, July 7).

The July 7 code sprint items — dup removal, placeholder-tag fixes, 5 glacier venues — were approved by v81 but have not executed. Agents in sandboxed containers cannot write to the repo. These require either a networked agent session or Jack's direct action.

**Code state July 8:**
- `app.jsx`: 13,443 lines · cache `20260707a` · braces 5,565/5,565 (per DevOps July 7)
- **370 venues** (131 ski / 239 beach) — unchanged, 2 dups + 5 glacier venues still pending
- GEAR_ITEMS: 0 · lateSeason: 25 · 135 unique photos · max repeat 3×
- Sentry: active · Plausible: domain scoped (July 7) · VPS: unverified from sandbox

---

## Sprint Item Status — July 7 Sprint (Carry-Forward)

| Item | Status | Owner |
|------|--------|-------|
| 1 — Read Plausible + Sentry | ⏳ Jack only | Jack |
| 2 — Plausible domain fix | ✅ DONE (July 7 DevOps) | — |
| 3 — Remove 2 duplicate venues (bigsky + beach_miami) | ⏳ **0 days progressed** | Agent/Jack |
| 4 — Fix 5 placeholder-tag ski venues | ⏳ **0 days progressed** | Agent/Jack |
| 5 — Remove 27 surf-legacy tags | ❌ CANCELLED (v81 Decision 1) | — |
| 6 — Add 5 glacier ski venues | ⏳ **0 days progressed** | Agent/Jack |
| 7 — Supabase SQL paste | ⏳ **Day 29 open** | Jack |
| 8 — Draft Week-1 retention email | ⏳ **DEADLINE JULY 10** | Jack |

Items 3, 4, 6 are agent-executable in a networked session. Items 1, 7, 8 are Jack-only.

---

## Bug Triage — July 8

| Bug | Severity | Status |
|-----|----------|--------|
| **Week-1 retention email** not sent | **P0** | Deadline July 10. Miss it and Week-2 return data is uninterpretable. |
| **Plausible data unread** | **P0** | 8 days of real user data. Jack: read before approving any new venue additions. |
| **VPS weather cache** — Day 8, unknown restart state | **P1** | Jack: `curl https://peakly-api.duckdns.org/health`. If `wx_cache_size == 0`, warm before July 11 return-visitor window. |
| **Sprint items 3+4** (2 dups + 5 placeholder tags) | **P2** | Approved July 7. Still pending. ~35 min. Data quality. |
| **Sprint item 6** (5 glacier venues) | **P2** | Approved July 7. Les Deux Alpes closes glacier ski in August — last month to surface it. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | Day 29 open. 2 minutes. Jack only. |
| Plausible dashboard domain update | P2 | Jack only. plausible.io → Sites → Settings → Domain → `j1mmychu.github.io/peakly` |
| SRI on CDN scripts | P3 | DEFER post-LLC. |
| 14 orphaned `claude/` branches | P4 | No urgency. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" outage framing · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays · cross-category photo contamination · Plausible domain (code side) · surf-legacy tags

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Plausible read** (Jack, plausible.io) | Every product prioritization call this week | Day 8 post-launch |
| **VPS health verify** (Jack, local terminal) | Confirms weather data reliability for Week-2 window | Day 24 |
| **Retention email** (Jack, personal) | Week-2 return rate measurement — expires July 10 | — |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 29 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |
| Apple Developer ($99) | App Store submission | Post-launch |

---

## Explicit Product Decisions — July 8

### Decision 1: 4 new beach venues (Content July 7 staging) — DEFER pending Plausible read.

Content report July 7 staged 4 beach venues for July 8 execution: Arugam Bay Sri Lanka (CMB), Cable Beach Broome AUS (BME), Essaouira Morocco (RAK), Diani Beach Kenya (MBA).

All four fill real geographic gaps and are July-relevant. All claim existing AIRPORT_COORDS APs. The case for shipping them today is clear on catalog quality grounds.

**But Jack hasn't read Plausible yet.** If beach filter conversion is already high and visitors are bouncing on price not selection, adding 4 more beach venues is the wrong move — fixing the scoring explanation or onboarding hook is. If Plausible shows "skiing filter gets 0 clicks in July" that's a different sprint than "add more South Indian Ocean venues."

**DEFER: Stage in `data/venue-candidates.json`, run `validate-venues.mjs`, hold for execution until Jack shares the Plausible Week-1 read. If we get that data today, flip to SHIP same session.**

### Decision 2: Sprint items 3, 4, 6 from July 7 — SHIP, no new gate.

These were approved July 7 with clear criteria. Nothing has changed:
- Remove `bigsky` + `beach_miami` (confirmed dups, same resort/coords, enriched version kept): 368 venues post-removal
- Fix 5 placeholder-tag ski venues (winter-park, copper-mountain, lake-louise, palisades-tahoe, brighton): tags staged in Content July 7 report
- Add 5 glacier venues (saas-fee-ch, les-deux-alpes-fr, alpe-d-huez, st-moritz, cortina-d-ampezzo): venue objects staged in Content July 7 report, AP correction already applied (GNB → CMF for Les Deux Alpes)

Gate remains: run `validate-venues.mjs` on the 5 glacier venues before pasting. If any photo returns 404, swap Unsplash ID before committing.

**SHIP: Execute items 3+4+6 this session. Net: 368 − 2 dups + 5 new = 373 venues post-execution.**

### Decision 3: Week-2 return window opens July 11. Email must go by July 10. This is a hard deadline, not a suggestion.

The Week-1 cohort (July 1–7 visitors) represents Peakly's first real user signal. The question isn't whether they liked the app — it's whether they come back unprompted. That answer is only meaningful if measured against a known stimulus: did they come back because they wanted to, or because Jack nudged them?

Without an email sent by July 10, we can't cleanly interpret the July 11–13 Plausible return data. A cold return rate and a nudged return rate are two completely different product signals. Conflating them wastes the most valuable 3-day measurement window we'll have for months.

The email: 3 sentences, personal from Jack, one live venue link with next weekend's date (July 11–14), one open question ("what was wrong"). That last sentence matters most — every reply is worth more than a month of quantitative analytics.

**Jack: Draft and send July 10 (tomorrow). Manual. No automation. This is a hard deadline.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Read Plausible today. One browser tab. Nothing else until you do this.**

Day 8 post-launch. 8 days of real user behavior in the Plausible dashboard. Every product decision this week — what to build, what to fix, whether to post again on Reddit — is contingent on this data. The agents cannot access plausible.io. Jack can. This has been the #1 ask since Day 1 post-launch. If you share the numbers in-session (any session), the next PM report becomes a data-driven sprint. If you don't, we're flying blind.

**2. Execute sprint items 3+4+6 today (35 min of content work, approved July 7).**

- Remove `bigsky` + `beach_miami` (10 min): find each ID in app.jsx, delete the venue object block
- Fix placeholder tags for 5 ski venues (15 min): paste tag arrays from Content July 7 report §5
- Add 5 glacier venues after `validate-venues.mjs` verification (15 min): paste venue objects from Content July 7 report §6

This is already decided. Nothing new to think about. Ship it.

**3. Jack: Send Week-1 retention email July 10. VPS health check same day.**

The email is the highest-leverage non-code action this week. 3 sentences. Personal. The VPS health check tells you whether the weather data the first 8 days of users saw was reliable — material context for interpreting any anomalies in the Plausible bounce numbers.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| 4 new beach venues (Arugam Bay, Cable Beach, Essaouira, Diani) | **DEFER.** Ship after Plausible read confirms catalog gap is the bottleneck, not something else. |
| Automated weekly email digest | **DEFER.** Manual founder email first. Infrastructure after signals. |
| Hotel integrations | **CUT for v1.** Scope creep. |
| JSON-LD / structured data | **DEFER.** SEO compounds on traffic that doesn't exist yet. Post-100 users. |
| Venue deep links / permalink pages | **DEFER.** Build after Plausible shows >100 detail-sheet views/day per venue. |
| Photo pool expansion (≤2× repeat) | **DEFER.** Needs ~100 new verified Unsplash IDs. No API key in repo. Not the bottleneck. |
| New venue categories (climbing, surf, hiking) | **CUT.** Ski + beach is the moat. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** P3. |

---

## Success Criteria — 8K vs 5K

**Gate metrics (unchanged from v80/v81):**
1. **Week-1 unique visitors ≥ 2K** — if below, distribution underperformed; repost before building
2. **Week-2 return rate ≥ 20%** — if below, onboarding hook becomes the next build sprint
3. **Beach filter ≥ 40% of filter clicks in July** — if below, seasonal framing mismatch

**For 8K not 5K:** Organic referral loop kicks in by Week 4. "Share a weekend plan" must generate ≥5 organic referrals/week by July 28 without a second distribution push. If it doesn't, 5K is the ceiling and a second Reddit post is the path to 8K, not feature work.

---

## One Product Risk Nobody Is Talking About

**The July 7 sprint is now 24 hours old and nothing has shipped.**

v81 made three explicit product decisions: SHIP glacier venues, SHIP dup removal, SHIP tag fixes. The content report staged all the venue objects. The PM approved them. Nobody executed.

The reason is structural: the agents that make decisions run in sandboxed containers with no git write access. The agents that write code (DevOps) are scheduled at 14:00 UTC and focus on infrastructure, not content data. There's no agent that reads a PM decision and executes it the same day.

This gap won't fix itself. The sprint queue will grow one item per day until Jack either: (a) executes the queued items himself, or (b) explicitly triggers a content-data agent in a networked session with write access. Right now there are 3 items (dup removal + tag fixes + glacier venues) from one sprint. If v82 doesn't trigger execution, v83 will have 3 items + whatever today's agents queue, and we'll be reporting the same sprint for a week.

**The ask:** Jack, run the sprint items yourself (35 min, everything is staged in the July 7 Content report) OR confirm that a networked agent session is triggered today to execute them.

---

*PM agent — 2026-07-08 (v82). v83 expected July 9. If Jack shares Plausible data or confirms sprint execution this session, v83 becomes a data-driven update. Glacier venues and dup removal remain the open code items.*
