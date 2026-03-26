# PM Report — 2026-03-26 (v15)

## Status: YELLOW — same as v14. Same P0. Same Jack action. Five cycles.

The app is in excellent technical shape. The TP_MARKER placeholder is not a technical problem — it is a 5-minute copy-paste. It has now appeared in five consecutive PM reports as a P0. Until it is resolved, every flight click earns $0 and there is zero attribution data in the Travelpayouts dashboard.

---

## Shipped Since v14

| Item | Type | Right call? |
|------|------|-------------|
| **Splash screen 1.8s minimum + network-first SW** — splash stays visible for min 1.8s, SW bumped to peakly-20260326b, index.html network-first | Polish / infra | **MARGINAL.** Fixed a real first-impression bug (splash disappearing in <200ms on fast connections). Network-first SW is correct. But 1.8s of forced wait on every cold load is dead time for returning users who want live conditions. Low opportunity cost, but watch it. |

**Confirmed live (not newly shipped, but resolved from v14 P1 blockers):**

| Item | Finding |
|------|---------|
| **Score validation thumbs** | **CONFIRMED LIVE.** Lines 7349–7353 of app.jsx. Up/down buttons render in VenueDetailSheet with green/red active states, `scoreVotes` persisted to `peakly_score_votes` localStorage, Plausible `Score Validation` event fires on vote. Previously listed as "unconfirmed UI" — it is live and working. Remove from blocker list. |
| **Kayaking water temp safety floor** | **CONFIRMED DONE.** Lines 3344–3352. The 120°F rule is implemented: if airC + waterTemp < 49°C, score drops 15 points and label reads "Cold Water Risk". Previously listed as a scoring gap. It shipped. Remove from gap list. |

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **TP_MARKER = "YOUR_TP_MARKER"** at line 3666. Every Aviasales flight click earns $0. Zero attribution data. Zero commission. | **P0** | Jack: tp.media → Dashboard → Markers → copy string → paste at line 3666 → push. 5 min. **Five cycles open.** |
| **Surfing wind direction (offshore vs. onshore)** — code comment at line 3164 explicitly notes this gap. windDir from Open-Meteo is land-level, not coastal-relative. To fix correctly requires a coastOrientation property on each surf venue. This is not a quick scoring tweak — it requires data. | **P2 → DEFER** | Not fixable pre-launch without adding orientation data to ~300 surf venues. Current surfing scoring is defensible on wave height + swell period + water temp. Defer to Phase 2. |
| **Splash screen 1.8s on every cold load** — returning users hit 1.8 seconds of forced waiting before seeing live scores. | **P3** | Monitor. Not urgent. |
| **REI 22 links earn $0** | **P2** | Jack: Avantlink signup, 30 min, no LLC needed. |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| TP_MARKER in app.jsx line 3666 | **Jack** — tp.media dashboard | **TODAY. This is cycle 5.** |
| REI Avantlink signup | **Jack** | This week. 30 min. No LLC needed. |
| LLC approval | External | Unblocks Stripe, GetYourGuide, Backcountry, peakly.app domain, ToS/Privacy |

---

## Priority Decisions — Top 3 This Sprint

**1. SHIP: Jack sets TP_MARKER (Jack, 5 min)**

Code is deployed. Commission is blocked only by one missing string. Jack: log into tp.media → Dashboard → Markers → copy the marker → replace "YOUR_TP_MARKER" at line 3666 → push. Five cycles open. If this is not done before the Reddit launch, we will drive traffic, generate flight clicks, earn $0, and have no attribution data.

**2. SHIP: Build onboarding flow (Dev, 3–4 hrs)**

New users land on Explore and have no idea what the score means, what "Epic" vs. "Firing" means, or why they should set a home airport. An onboarding sheet (3 screens: what Peakly does, set your home airport, pick your sports) converts confused visitors into retained users. This is the highest-impact remaining dev item before launch. Directly moves the 8K scenario.

**3. SHIP: Set Reddit launch date (Jack, 0 hrs dev)**

The launch-readiness checklist is 95% done. Score thumbs confirmed live. Kayaking water temp confirmed done. The growth lead set April 1 as a target two cycles ago — that date has not been confirmed or updated. A launch without a date is not a launch. **Pick April 1 or April 7. Commit.**

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Surfing wind direction (offshore/onshore) | **DEFER post-launch** | Requires adding coastOrientation data to ~300 surf venues. Not a quick fix. Current scoring is defensible on wave height + swell + water temp. |
| Hotel affiliate deep links per venue | **DEFER to post-1K** | Generic Booking.com link earns today. Per-venue deep links add complexity, not conversion. |
| Trips + Wishlists tabs | **DEFER to 1K users** | Core flow (Explore → Detail → Book) must prove conversion first. |
| Avalanche risk for ski | **DEFER to Phase 3** | No external API available. Post-launch research project. |
| Tide data for surf | **DEFER to Phase 3** | Score thumbs now live — get calibration signal first, then add data sources. |
| Expand venues beyond 2,226 | **CUT until post-launch** | Quality over volume. Venue expansion closed. |
| Dark mode | **CUT** | No signal it moves any retention or acquisition metric. |
| Offline support | **CUT** | Stale conditions data defeats the core value prop. |

---

## Success Criteria

**90-day target: 5K–8K users.** What separates 8K from 5K:

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| TP_MARKER | Unset. $0 flight revenue. No attribution. | Set before Reddit. Commission active. |
| Reddit launch date | Drifts to April 15+ with more polish cycles | Hard date set this week. April 1 or April 7. |
| Onboarding flow | None. 40%+ first-visit bounce. | 3-screen onboarding ships before launch. Bounce rate <25%. |
| Score thumbs | **CONFIRMED LIVE** | **CONFIRMED LIVE** |
| Scoring accuracy | Surfing deferred but defensible | Surfing deferred but defensible |
| Sentry | **DONE** | **DONE** |

**Trajectory: 6K if TP_MARKER set + Reddit date locked this week. 8K if onboarding ships before launch and no scoring callouts land.**

---

## One Product Risk Nobody Is Talking About

**We have been in pre-launch for 3+ weeks and shipping polish.** Each cycle adds a legitimate improvement — weather cache, photo stability, splash screen, SW fixes — and each is correct in isolation. The cumulative effect is a team optimizing an app nobody has used yet. The scoring thumbs were "unconfirmed" for three cycles and turned out to be live the whole time. The kayaking water temp fix was "pending" and was already shipped. We are losing visibility into what is actually done vs. what we think is done because nobody is running the app in a browser as a first-time user. **Before the Reddit post, someone needs to spend 30 minutes with the app as a new user, not as a developer.** First-time user experience testing is not on any checklist. It should be.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-26 | **Score validation thumbs → CONFIRMED LIVE.** Remove from blocker list. Lines 7349–7353. |
| 2026-03-26 | **Kayaking water temp → CONFIRMED DONE.** Remove from gap list. Lines 3344–3352. |
| 2026-03-26 | **Surfing wind direction → DEFER post-launch.** Requires venue orientation data (~300 surf venues). Not a pre-launch fix. |
| 2026-03-26 | **Onboarding flow → SHIP this sprint.** Highest-impact remaining dev item before launch. |
| 2026-03-26 | **Reddit launch date must be set this week.** April 1 or April 7. No more drift. |
| 2026-03-26 | **TP_MARKER → cycle 5. Jack action, today.** |
| 2026-03-26 | **Splash screen 1.8s minimum → monitor only.** Watch returning-user bounce post-launch. |

---

*Next report: 2026-03-27*
