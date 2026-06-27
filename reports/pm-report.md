# Peakly PM Report — 2026-06-27 (v71)

> Supersedes v70 (June 26). **Status: RED on distribution, GREEN on code.** Everything that can be built has been built. 370 venues. All tags clean. 23 days since launch readiness. The only variable that changes the trajectory now is Jack posting to Reddit.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Stale from pre-May pivot. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Nothing to fix. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** |
| "Cache buster stale" | **Auto-bumped daily by DevOps.** Today: `20260627a`. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13. Sandbox 403s = container egress blocks, not VPS outages. Stop.** |
| "197 venues with empty tag arrays" | **FALSE.** Multi-line regex error. 0 empty-tag venues confirmed June 27. |
| "40 ski venues had 1 tag" | **FIXED June 26.** All 370 venues: ≥2 tags. CLOSED. |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop reporting. |
| "GEAR_ITEMS" | **Count = 0. Amazon cut for v1. Final.** |
| "Duplicate commit pattern" | **Known-skipped June 25 (second strike).** Stop reporting. |

---

## Shipped Since v70 (2026-06-26 → 2026-06-27)

| What | Verdict |
|------|---------|
| **Cache `20260626a` → `20260627a`** (DevOps, `3a65e80`) | ✅ Standard daily bump. |
| **Content audit June 27** (`0059054`) — 370/370 venues verified ≥2 tags; photo 3× ceiling confirmed; seasonal relevance audit; venue freeze held. | ✅ Clean confirm. |

**Zero app.jsx changes overnight.** VENUE FREEZE holding. No regressions.

**Code state June 27:**
- `app.jsx`: 13,323 lines · cache `20260627a` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- Tag coverage: 0 empty, 0 single-tag, min 2 tags across all 370
- Photo max repeat: 3× (135 unique photos)

---

## Bug Triage — June 27

| Bug | Severity | Status |
|-----|----------|--------|
| **Reddit post: Day 23** | **P0 (business)** | Jack only. Not a code bug. See below. |
| **VPS SSH verify before posting** | **P1 pre-post** | Jack: `curl https://peakly-api.duckdns.org/health` from local terminal. 5 min. Unverifiable from sandbox. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store) / P3 (web launch) | Jack: 2 min in Supabase SQL editor. Graceful fallback active until then. |
| SRI on CDN scripts | P3 | DEFER post-launch. Final. |
| CSP meta | P3 | DEFER. Babel `unsafe-eval` makes strict CSP incompatible with the no-build architecture. |

**Permanently closed — stop raising:** Peakly Pro price · Sentry DSN · Cache buster · VPS "Day X blocker" · DEAL_WEIGHT · GEAR_ITEMS · coronet-peak lateSeason · Killington lateSeason · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays (counting bug)

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **23** |
| **VPS SSH verify** | Confident pricing + spike absorption | 5 min | 14 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 17 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | ~2h + Apple review | Post-launch |

---

## Explicit Product Decisions — June 27

### Decision 1: The venue catalog is FROZEN through the first Reddit post and 72h after it.

370 venues. 131 ski. 239 beach. 23 Southern-hemisphere ski venues at peak season right now. Every venue has tags. Every venue has photos. The catalog is complete for v1.

Adding more venues before Reddit launch is feature anxiety. Adding more venues in the 72h after launch is chaos — that's when Sentry and Plausible will be surfacing actual data, and thrashing the catalog during that window contaminates the signal. The Content agent is on freeze. **No new venues until Plausible shows which categories or geographies users actually care about.**

**DEFER: All venue additions. Resume: 72h post-Reddit.**

---

### Decision 2: Build nothing new before the Reddit post. The pre-launch backlog is empty.

The five open code items from prior reports are either Jack-only actions (VPS health check, Supabase SQL paste) or post-launch enhancements (venue deep links, Unsplash optimization, eager Supabase deletion). There is no engineering task that would meaningfully improve the Reddit launch outcome. The app is done.

The opportunity cost of building right now is delay. Every hour spent on "one more thing" is an hour without Plausible data, without Sentry signal, without knowing which venue gets clicked first or which search filter gets used. Build decisions made without users are guesses. Build decisions made with data are leverage.

**CUT: Any new feature or enhancement before Reddit post. No exceptions.**

**SHIP: Nothing. The product is already shipped.**

---

### Decision 3: The week-2 retention problem is real and needs one action now, not after launch.

This report's "one product risk nobody is talking about" (see below) is also a decision point. The app has no pull mechanism — no push notifications (APNS undeployed), no email re-engagement, no weekly digest. The 90-day path to 8K vs. 5K hinges substantially on whether Week-1 users come back in Week 2.

The lowest-cost retention hook that already exists in the codebase is email capture via Supabase magic-link. When a user signs in and saves a wishlist or alert, they've given us an email. **We have no post-launch email strategy.**

**Decision:** After the Reddit post lands, Jack drafts one manual "This weekend's top spots" email to any users who signed up in Week 1 and sends it via Supabase's email tools. This is not a product feature — it's a founder move. 20 early users who get a personal "Hey, this weekend Cardrona is at 89/100, flights from AKL at $140" email will each tell one more person. That compounds. Code cannot replicate this.

**No new code required. Action item for Week 2: manual email to Week-1 Supabase signups.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Post to Reddit. Today. June 27. Not Monday.**

Day 23 is now longer than most successful apps wait between building and telling anyone. The June-27/30 weekend is showing now — high confidence, peak beach season, NZ/AUS ski opening week. This is the best launch window the app will have until fall. The July 4 weekend will be day 7–10 out from a Monday post, which means low-confidence filtering will thin the grid. Post this weekend, not next.

**Suggested post copy (updated for June 27):**

> *"Built a free tool that combines live weather + real flights to find the best ski or beach weekend from your home airport. 370 spots globally — it's peak beach season in the N. hemisphere right now AND peak ski season in New Zealand, Australia, and the Andes. Built-in honesty flag: if the forecast window is too far out to trust, it shows 'low confidence' instead of making up a score. Free. No account needed.*
>
> *Posting because feedback from people who actually travel matters more than another week of solo dev. Be brutal."*

Post r/frugaltravel first. r/solotravel 60 min later. Jack: post your own comment with real flight data from your home airport within 30 minutes of posting. That comment is worth 2,000 users.

**2. Jack: VPS health check from local terminal before posting.**

One command: `curl https://peakly-api.duckdns.org/health` — if it returns `wx_cache_size > 0`, the weather proxy cache is alive and the app can absorb a Reddit spike. If it's down, fixing it before 5K people hit the app is a 5-minute SSH session, not a crisis.

**3. Jack: Supabase SQL paste after the post.**

`server/sql/delete-account.sql` → Supabase SQL editor → run. The client shows a graceful fallback now, so this doesn't block the web launch. It does block App Store 5.1.1(v). Do it the evening of or day after the post so the App Store submission can follow immediately.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| New venue category (climbing, hiking, surf) | No users to validate demand. Expanding categories before 1K MAU dilutes the ski+beach brand. REJECTED for v1. |
| Peakly Pro / subscription tier | No price-sensitivity data, no conversion funnel, no users. Premature. REJECTED until 1K MAU. |
| Hotel integrations in deal score | Still deferred from v63. Flights + conditions is the product. REJECTED for v1. |
| Social share-a-score (per-venue permalink) | Requires venue deep links as prerequisite, which requires Plausible to show demand. Don't build infrastructure for a feature before validating the demand. REJECTED until deep links exist and Plausible shows >20% sessions ending on detail sheet. |
| Weekly email digest (automated) | Valid retention lever, but building automated email infra before knowing whether anyone signs up is premature. Manual founder email in Week 2 costs 20 minutes and teaches 10x more. REJECTED as code; accepted as founder action. |

---

## One Product Risk Nobody Is Talking About

**The retention cliff at Day 8.**

Users who discover Peakly via Reddit this weekend will have a perfect first experience: peak beach season, high confidence scores, real flight prices, 370 venues. They open the app Friday June 27 and see a rich grid with cards like "Santorini: 91/100, $340 RT from JFK."

Then they close the app.

The app has no mechanism to bring them back. APNS isn't deployed. There's no email re-engagement. No weekly digest. No personalized alert that fires on Tuesday when Queenstown's snowpack hits the threshold they set. The Alerts tab exists but does nothing on web and nothing on iOS without APNS. The magic-link email capture captures addresses but sends zero follow-up messages.

Day 8 is next Saturday (July 5). A user who had a great experience on June 27 and hasn't thought about the app since is not coming back organically. There's no trigger. Reddit's "I found this cool thing" post lives for 72 hours. After that, the only way users return is if they remembered to bookmark the PWA, saved it to their home screen, or set an alert that actually fires.

**The gap between 5K and 8K at 90 days is likely this problem, not a code problem.**

The low-cost mitigations that already exist: PWA install nudge (fires after 2 wishlists saved), Alert bell on venue cards (registers with server but currently requires APNS to deliver). The install nudge is the only one that actually works on web today — it's the single highest-ROI interaction to get right in the first 72 hours after launch.

**One ask of Jack:** In the Reddit thread, explicitly mention "you can install it as an app from your phone browser (no App Store needed)." That converts a web session into a home screen icon, which is the closest thing to a retention hook the app has right now. The `<InstallNudge>` component handles the prompt. The Reddit comment handles the awareness.

---

## Success Criteria

**Launch-day baseline (48h after Reddit post):**
- ≥500 unique visitors (Plausible)
- ≥50 Explore interactions (filter or sort change)
- ≥10 "Book" clicks (Travelpayouts or Booking.com)
- ≥5 Supabase sign-ups
- Zero ErrorBoundary triggers in Sentry
- ≥3 Reddit comments with personal flight data ("found $X RT to [venue]")

**90-day projection (5K vs. 8K):**

| Scenario | What's True |
|----------|-------------|
| **5K users** | One Reddit post, gets 50–100 upvotes, 72h traction, fades. No personal data comment. No follow-up post. No Week-2 email. |
| **8K users** | Jack posts personal data comment in first 30 min. Cross-post to r/solotravel lands. Jack sends manual email to Week-1 signups with weekend conditions. Second Reddit post in Week 3 using real user stats ("someone booked Cardrona from AKL at $140, score was 93"). PWA install nudge fires for 15%+ of users who saved 2+ venues. |

**The lever is distribution and founder presence, not code.** The product is ready. Everything from here is Jack in the thread.

---

*v71 — 2026-06-27 — written by PM agent*
