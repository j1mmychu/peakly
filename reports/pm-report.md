# Peakly PM Report — 2026-03-28 (v18, Late Day)

**Reddit launch target: Tuesday March 31, 9–11am ET. 3 days out.**

---

## Shipped Since Last Report

| Item | Verdict | Notes |
|------|---------|-------|
| **BASE_PRICES regional fallback** (commit 16ce46d) | **RIGHT CALL** | Covers all 776 airport codes with region-based pricing instead of a flat fallback. This was a P1 — broken flight pricing for 70% of venues was a silent conversion killer. Shipped correctly and surgically. |
| **Cache buster → v=20260328a, SW → peakly-v12** | Right. | Standard hygiene. No concerns. |
| **Pagination (30 + Show more)** | Right. | Prevents scroll-lag on mobile with 2,226 venues. Reddit users won't see a 2,226-card wall. |
| **Competitor report filed** | Signal noted below. | |
| **Content report filed** | Photo diversity risk quantified. See risk section. |

**Opportunity cost assessment:** BASE_PRICES was the right thing to build. No wasted cycles here. TP_MARKER is now the single highest-ROI unblocked action remaining — and it's Jack's, not dev's.

---

## Blocked

| Blocker | Owner | Status | Days Stalled |
|---------|-------|--------|-------------|
| **TP_MARKER placeholder** | Jack — tp.media dashboard | ❌ NOT DONE | **Day 5** |
| **venue.facing swell revert** | Dev | ❌ NOT DONE | Day 2 |
| **Photo diversity — top 15 base IDs** | Dev/Content | ❌ NOT DONE | Day 1 |
| **Email capture → server-side list** | Dev | ❌ NOT DONE | Day 1 |
| **React pin to @18.3.1** | Dev | ❌ NOT DONE | Day 2 |
| **LLC approval** | External | Pending | — |

**TP_MARKER is now at Day 5. This is the only revenue blocker and it is a 5-minute action for Jack. Every Reddit user who clicks a flight link between now and when Jack fixes this is an unattributed, unmonetized conversion.**

---

## This Week's Top 3 Priorities

### 1. JACK: Fix TP_MARKER. 5 minutes. Do it now.

This is not a PM recommendation. It is a math problem. Reddit post goes live in 72 hours. Average CTR on flight links in adventure travel apps: 8–12%. At 500 Reddit visitors, that is 40–60 flight clicks that earn $0 and have zero attribution if TP_MARKER stays broken. This has been flagged for 5 consecutive days. It is the highest-ROI action in the entire backlog and it takes 5 minutes on the tp.media dashboard. **Do it before anything else.**

**Decision: TP_MARKER must be set before Reddit. No exceptions.**

### 2. DEV: venue.facing revert + React pin. 35 minutes total.

**venue.facing (30 min):** Delete the `spotFacing`/`swellAlignment` scoring block in `scoreVenue()`. The `venue.facing ?? 270` default is wrong for roughly half of global surf breaks. East-facing breaks (J-Bay, Brazilian coast) are being penalized against a west-facing default. The surfing community on Reddit has the domain expertise to notice wrong scores. This will be called out in the thread. Revert to scoring swell by height + period only. Option A (delete the block entirely) is the right call. No new data model required.

**React pin (2 min):** Change `@18` → `@18.3.1` in both CDN script tags in `index.html`. Eliminates the risk of React shipping a breaking change to the CDN that takes the app down during the Reddit launch window.

**Decision: Both ship before March 31. 35 minutes total. Non-negotiable.**

### 3. DEV: Email capture POST to server-side list. 30 minutes.

The onboarding sheet collects `profile.email` into localStorage only. When 500 people try the app after the Reddit post, zero of their emails are captured anywhere retrievable. The fix: `fetch()` POST on onboarding complete to a Mailchimp or Loops.so webhook. The VPS is already running and can proxy this. A Loops.so free tier handles 2,500 contacts with no LLC required and takes 10 minutes to set up.

**This is not a nice-to-have.** Every user who types their email and never hears from Peakly is a failed re-engagement. Condition windows close and reopen — email is the re-engagement vector. Without it, the Reddit spike decays to zero with no retained list.

**Decision: Email capture POST ships before Reddit. If it slips past March 30, Reddit still goes — but it costs us the list.**

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| **Photo diversity pass (all 2,226 venues)** | **DEFER to post-Reddit, but top 15 offenders NOW** | Replacing all 2,226 photos is a multi-day content job. Replacing the top 15 base IDs (covering ~1,700 venues) is a 2-hour find-replace. Do the 80/20 version before March 31. Full pass is Phase 2. |
| **Wishlists tab expose** | **DEFER to post-Reddit, day 2** | Code is built. Wire it 48 hours after the Reddit post, when we have real users to observe. Not a launch blocker. |
| **Window Score (Phase 2 feature)** | **DEFER to post-Reddit** | This is the moat feature. Build at 500 users with calibration data, not before. |
| **Google Play Store via PWABuilder** | **DEFER to 500 users** | Amplifies an existing user base — it doesn't create one. |
| **Trips + Wishlists full feature** | **DEFER to 1K users** | Standing decision. Core flow converts first. |
| **Open-Meteo 429 handler** | **SHIP — 10 min, not a feature** | Crash prevention. Rate limiting during the Reddit spike breaks Explore silently. Add `if (r.status === 429) return null;` before the `!r.ok` throw. |
| **More scoring algorithm refinements** | **FROZEN** | Standing decision. venue.facing revert is the one exception (bug fix). No new scoring commits until post-Reddit calibration data. |
| **Stripe / Peakly Pro** | **DEFER to 1K users** | LLC approved but acquisition before monetization. |

---

## Success Criteria

**90-day target: 8K–10K users.** What separates 10K from 8K:

| Lever | 8K scenario | 10K scenario |
|-------|-------------|--------------|
| TP_MARKER | Set before Reddit. Flight clicks attributed and monetized from day 1. | Same — this is table stakes. |
| Reddit post quality | FOMO headline: "Tavarua is firing next week. Flights from LAX $220." Real window, real price. | Same headline + author active in thread for 4 hours post-launch, answering questions. |
| Email list | Server-side capture live. 100+ emails from Reddit spike become re-engagement asset. | 200+ emails captured. First re-engagement email within 7 days. |
| Photo diversity | Top 15 offenders replaced. No screenshot callout on Reddit. | Top 15 replaced + content agent running weekly audits. |
| Retention signal | 10% of Reddit visitors return in week 2 (condition window changed). | 20% return rate because email re-engagement fires at week 1. |

**Verdict:** Getting to 10K (vs 8K) is not a features question. It is a retention question. The app's value proposition — conditions change, you should know when — is only delivered via re-engagement. Email capture is the mechanism. Build it before Reddit.

---

## One Product Risk Nobody Is Talking About

**The content agent's "0% photo duplication" claim in CLAUDE.md is false, and it is documented as shipped.**

CLAUDE.md currently states: "All 2,226 venue photos fixed — stable Unsplash photo IDs" and "0% photo duplication across all 2,226 venues." The content agent's report today contradicts this directly: only ~176 unique photos exist for 2,226 venues. Average venue shares its photo with 12 others. Fishing venues share ~1 photo. Kayak venues share ~1 photo.

The risk is not that this looks bad — though it does. The risk is that **CLAUDE.md, the shared brain for all AI agents, contains a false completed status.** Every agent reading CLAUDE.md this week will treat photo diversity as solved and deprioritize it. This is how the issue has gone 5+ days without a fix.

**Corrective action:**
1. Update CLAUDE.md: mark "0% photo duplication" as INACCURATE — replace with "176 unique photos across 2,226 venues. Diversity pass required before Reddit."
2. Add "Photo diversity pass (top 15 base IDs)" to Pre-Launch Checklist as unchecked P1.
3. Ship the 80/20 version (top 15 offenders, ~2 hrs) before Reddit.

If a Reddit commenter posts a screenshot of the same fishing photo on 20 Alaska venues, that thread will define the brand for 500+ potential users before any response is possible.

---

## Decisions Made This Report

| Date | Decision |
|------|----------|
| 2026-03-28 | **TP_MARKER: Day 5 is unacceptable. Must be set before Reddit. Jack action item.** |
| 2026-03-28 | **venue.facing revert: SHIP before March 31. Option A — delete the block entirely.** |
| 2026-03-28 | **Email capture POST: SHIP before March 31 or Reddit is a spike with no list.** |
| 2026-03-28 | **Open-Meteo 429 handler: SHIP — crash prevention, 10 min.** |
| 2026-03-28 | **Photo diversity top-15 pass: SHIP before March 31. Full pass is Phase 2.** |
| 2026-03-28 | **CLAUDE.md "0% duplication" status: INACCURATE. Must be corrected immediately.** |
| 2026-03-28 | **Reddit r/surfing launch: Tuesday March 31, 9–11am ET. Hard date holds.** |
| 2026-03-28 | **Scoring algorithm: FROZEN. No new commits until post-Reddit calibration.** |

---

## Pre-Reddit Checklist (3 days out)

**Must-have (blocks launch quality):**
- [ ] Jack: Set TP_MARKER in tp.media dashboard (5 min)
- [ ] Dev: Revert venue.facing swell direction block in scoreVenue() (30 min)
- [ ] Dev: Pin React to @18.3.1 in index.html (2 min)

**Should-have (costs us retention if skipped):**
- [ ] Dev: Email capture POST to Loops.so or Mailchimp on onboarding complete (30 min)
- [ ] Dev: Open-Meteo 429 handler (10 min)
- [ ] Dev/Content: Top-15 most-duplicated photo base IDs replaced (2 hrs)

**Nice-to-have:**
- [ ] Jack: REI Avantlink signup (30 min — $0 → $6.16 RPM)
- [ ] Write Reddit post draft (FOMO headline: specific venue, real window, real price)

---

*Next report: 2026-03-29 | Filed by PM agent (v18)*
