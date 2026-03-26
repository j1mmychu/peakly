# PM Report — 2026-03-26 (v14)

## Status: YELLOW — one Jack action blocks all flight revenue

The app is in the best shape it has ever been. Sentry is live with a real DSN. 2,226 venues with stable photos. Smart weather fetching (top 100 on load, lazy-fetch on detail open) prevents API exhaustion at any scale. Aviasales deep links are coded and correct. The only thing standing between $0 and commission revenue on every flight click is Jack pasting a TP marker. That is a 5-minute action. It has been pending for 4 cycles.

---

## Shipped Since v13

| Item | Type | Right call? |
|------|------|-------------|
| **Smart weather fetching** — top 100 venues on load, lazy individual fetch on detail open | Infrastructure | **YES.** Surgical fix. 272 API calls → ~100 on load. Scales to 10K+ MAU without hitting Open-Meteo limits. |
| **2,226 venues with stable photo IDs** — all 2,050 source.unsplash.com URLs replaced | Data quality | **YES.** Zero duplicates. First-impression polish win for Reddit launch. |
| **Sentry DSN live** — real DSN at line 8 (`9416b032...`) | Monitoring | **YES.** Four cycles of blind production errors are over. Crash visibility active. |
| **Score validation thumbs** — `peakly_score_votes` localStorage + vote state in VenueDetailSheet | UX | **PARTIAL.** Vote persistence wired at line 7151. UI visibility in detail sheet not browser-confirmed. |
| **ListingCard "Book" Plausible event** — `book_click` event on `onClick` at line 4086 | Analytics | **YES.** Fixed. Four-cycle miss finally resolved. `{venue, category}` props fire on click. |
| **Aviasales deep links coded** — `buildFlightUrl()` builds Aviasales/Travelpayouts URLs correctly | Revenue | **YES — code correct.** Blocked only by `TP_MARKER = "YOUR_TP_MARKER"` placeholder. Jack action needed. |

**Still blocked / unconfirmed:**
- `TP_MARKER = "YOUR_TP_MARKER"` at line 3666 — every flight click earns $0 until Jack replaces this.
- REI Avantlink signup — Jack action, 30 min. 22 links earn $0.
- Score validation thumbs UI — not browser-confirmed. Needs a visual check before Reddit post.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **TP_MARKER placeholder** — `"YOUR_TP_MARKER"` at line 3666. Code deployed and correct. Every Aviasales click earns $0 until marker is set. | **P0** — Jack: tp.media → Dashboard → Markers → copy string → paste at line 3666 → push. 5 min. | Blocked on Jack. |
| **Score validation thumbs — UI unconfirmed** | **P1** — `scoreVotes` localStorage wired. UI visibility not confirmed. If hidden, zero scoring feedback before Reddit launch. | Dev: open app, open any venue detail, verify thumbs render. 15 min to confirm or fix. |
| **REI affiliate links — 22 links earn $0** | **P2** — Avantlink signup unblocked (no LLC needed). ~$4–6 RPM waiting. | Blocked on Jack. |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| TP_MARKER in app.jsx line 3666 | Jack — tp.media dashboard | **TODAY. Revenue blocked until this is done.** |
| REI Avantlink signup | Jack | This week. 30 min. No LLC needed. |
| LLC approval | External | Unblocks Stripe, GetYourGuide, Backcountry, peakly.app domain |

---

## Priority Decisions — Top 3 This Sprint

**1. SHIP: Jack sets TP_MARKER today** *(Jack, 5 min)*

The Aviasales code is deployed and correct. `buildFlightUrl()` at line 3685 checks: if `TP_MARKER !== "YOUR_TP_MARKER"`, it wraps the Aviasales search in a `tp.media/r?marker=` redirect that earns commission. Without the marker, users still reach Aviasales but Peakly earns $0 and gets no attribution data in the Travelpayouts dashboard. Jack: log into tp.media → Dashboard → Markers → copy the marker string → replace `"YOUR_TP_MARKER"` at line 3666 → `push "Set TP_MARKER for Travelpayouts affiliate tracking"`. This is the highest-ROI 5-minute action remaining before launch.

**2. VERIFY: Score validation thumbs render in VenueDetailSheet** *(Dev, 15 min)*

`scoreVotes` is wired in localStorage and vote state is in the component at line 7151. What is not confirmed: do the thumbs visually render in the detail sheet? Open the app in a browser, tap any venue, check the detail sheet. If they render, done. If not, this is a silent failure — fix before the Reddit post. A miscalibrated score called out on Reddit without a feedback mechanism = no recovery path.

**3. SHIP: Scoring accuracy audit — surfing + kayaking** *(Dev, 2–3 hrs)*

With 2,226 venues, the scoring algorithm is the most visible product surface. Two gaps are highest-risk given Reddit audiences: (1) Surfing ignores wind direction — offshore = good, onshore = bad, current algo doesn't distinguish. (2) Kayaking has no water temperature safety floor — below 15°C is cold shock risk, current algo doesn't cap score. Fix both before the Reddit post.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Expand venues beyond 2,226 | **CUT** | Data quality > volume. Venue expansion closed until post-launch. |
| Hotel affiliate deep links per venue | **DEFER** | Generic Booking.com link earns today. Per-venue deep links are a post-1K monetization refinement. |
| Expose Trips + Wishlists tabs | **DEFER to 1K users** | Core flow (Explore → Detail → Book) converts first. More tabs = more confusion. |
| Trip insurance CTA (World Nomads) | **DEFER** | SafetyWing CTA exists. One insurance CTA is enough pre-launch. |
| Add airports LAS/PHX/MSP/DTW | **ALREADY DONE** | BASE_PRICES already has them per CLAUDE.md. Do not re-add. |
| Fuzzy search / search history | **DEFER** | Retention feature. Ships after 500 users give signal on what they're searching for. |
| Avalanche risk for ski | **DEFER to Phase 3** | No external API. Post-launch research item. |
| Tide data for surf | **DEFER to Phase 3** | Current scoring not yet validated. Add data after thumbs give calibration signal. |
| Dark mode | **CUT** | No signal it moves any metric. Not in next 6 months. |
| Offline support | **CUT** | Stale conditions data defeats the core value prop. |

---

## Success Criteria

**90-day target: 5K–8K users.** What separates 8K from 5K:

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| TP_MARKER | Still placeholder, $0 revenue, no reinvestment loop | Set before Reddit, commission flowing, attribution data active |
| Score accuracy | r/surfing calls out wind direction bug, thread turns negative | Surfing + kayaking fixed, scores defensible to knowledgeable users |
| Score thumbs | Zero feedback, miscalibration uncatchable | 50 votes within 48 hrs of Reddit post, calibration data in hand |
| Sentry | **DONE** — real DSN live, crash visibility active | **DONE** |
| Weather scaling | **DONE** — smart fetch, top 100 on load | **DONE** |

**Trajectory: 6K if TP_MARKER set + score thumbs confirmed before Reddit post. 8K if scoring accuracy audit ships and no algorithm callouts land.**

---

## One Product Risk Nobody Is Talking About

**The 2,226-venue expansion creates a scoring credibility problem that hasn't been stress-tested.** At 192 curated venues, scores were calibrated against real, well-known spots. At 2,226, hundreds of venues are algorithmically populated with no human review. A Reddit user in r/surfing who opens a venue in their home region and sees a wildly wrong score will post about it. That thread will define Peakly's reputation before it has 100 users. Mitigation: before the Reddit post, spot-check 10–15 venues in r/surfing, r/skiing, and r/kayaking home regions for obvious scoring errors. One afternoon of review prevents a reputation-defining moment.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-26 | **TP_MARKER → JACK ACTION TODAY.** Code is deployed. Revenue blocked only by missing marker string. |
| 2026-03-26 | **Scoring accuracy audit — SHIP before Reddit post.** Surfing wind direction + kayaking water temp are highest-risk gaps. |
| 2026-03-26 | **Score thumbs — confirm render before any Reddit post.** Logic wired; UI visibility unconfirmed. |
| 2026-03-26 | **Smart weather fetch = DONE.** Top 100 on load + lazy detail fetch solves API scaling to 10K+ MAU. |
| 2026-03-26 | **Sentry = DONE.** Real DSN at line 8. Production crash visibility active. |
| 2026-03-26 | **ListingCard Plausible event = DONE.** `book_click` fires at line 4086. |
| 2026-03-26 | **Venue expansion closed.** 2,226 is the count. No further expansion until post-launch. |
| 2026-03-25 | **Trips + Wishlists DEFERRED to 1K users.** Core flow first. |
| 2026-03-25 | **Dark mode CUT. Offline support CUT.** |

---

*Next report: 2026-03-27*
