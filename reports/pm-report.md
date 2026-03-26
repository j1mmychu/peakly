# PM Report — 2026-03-26 (v13)

## Status: YELLOW — one P0 revenue gap, two Jack actions still pending

Weather cache is live (devops agent shipped it). 181 venues in master with no photo duplicates. The two hardest infrastructure items before launch are now resolved (HTTPS proxy, weather cache). What remains is the highest-leverage revenue action (Aviasales flight links) and the two Jack-only items (Sentry DSN, REI Avantlink) that have been pending for 3+ cycles.

---

## Shipped Since v12

| Item | Type | Right call? |
|------|------|-------------|
| **Open-Meteo weather cache (30-min TTL)** — `WX_CACHE_TTL`, localStorage keyed by lat/lon | Infrastructure | **YES.** Devops agent shipped it. Extends free API tier to ~10K MAU. Pre-Reddit prerequisite met. |
| **SW cache version bump + cache-buster** | Infrastructure | **YES.** Prevents stale code reaching users after deploys. |
| **Venue count stabilized at 181** — no photo duplication | Data quality | **YES.** The 2,226-venue expansion flagged in v12 did not land in master. We're still at the high-quality trimmed count. |

**Still not shipped:**
- `buildFlightUrl()` → google.com/flights — earns $0. Review date was 2026-03-26. This is today.
- Sentry DSN — empty for 4+ cycles. Jack action, 5 min.
- Score validation thumbs — decided in v11, not yet built.
- ListingCard "Book" Plausible event — flagged 4 consecutive cycles.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **buildFlightUrl() → google.com/flights** — earns $0 per click | **P0** — every flight click from Reddit launch earns nothing. Travelpayouts/Aviasales deep links earn 1.1–1.6% of ticket value on completed bookings. This is the single highest-ROI unshipped item. Review date was today. | UNBLOCKED. Dev, 2–3 hrs. |
| **Sentry DSN empty** | **P1** — zero production crash visibility for 4+ report cycles. Silent errors could be driving churn right now and we'd never know. | Jack: sentry.io free tier, 5 min. Not a dev task. |
| **Score validation thumbs — not built** | **P1** — scoring algorithm has never been validated by real users. No feedback loop before Reddit launch = no way to catch a miscalibrated score. | UNBLOCKED. Dev, 1 hr. |
| **ListingCard "Book" Plausible event missing** | **P2** — 4 consecutive misses. Blind to 30%+ of flight click volume. 5-line fix. | UNBLOCKED. Dev, 5 min. |
| **REI affiliate IDs — 22 links earn $0** | **P2** — Avantlink signup is unblocked (no LLC needed). Jack action, 30 min. | Blocked on Jack. |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| Aviasales/Travelpayouts flight link switch | Dev | **TODAY — deadline was today.** |
| Sentry DSN | Jack | Do today. 4 cycles overdue. |
| Score validation thumbs | Dev | This sprint. |
| REI Avantlink signup | Jack | This week. 30 min. No LLC needed. |
| LLC approval | External | Waiting. |

---

## Priority Decisions — Top 3 This Sprint Only

**1. SHIP: Switch buildFlightUrl() to Aviasales/Travelpayouts deep links** *(Dev, 2–3 hrs)*

This is the only remaining high-impact unshipped dev item. Google Flights has no affiliate program. Travelpayouts Aviasales links earn commission on bookings made through them — 1.1–1.6% per ticket, paid monthly. At 100 flight clicks per month after Reddit launch, with a $350 average ticket, that's $385–560/month in potential affiliate revenue vs. $0 today. Implementation: replace the `https://www.google.com/flights` URL in `buildFlightUrl()` at line 1523 with an Aviasales deep link format using the Travelpayouts marker. Jack must set the marker ID (from tp.media dashboard) in the code before any Reddit push — without it, links will go to Aviasales bare with no commission tracking.

**2. SHIP: Score validation thumbs on VenueDetailSheet** *(Dev, 1 hr)*

Decided in v11, not shipped in v11, not shipped now. This is the only feedback mechanism that tells us if the scoring algorithm works before a Reddit post surfaces it to 500 strangers. If a surfer opens Mavericks on a firing day and sees 34/100, they close the tab. One thumbs-up/thumbs-down on the score badge sends a Plausible `score_feedback` event with `{ venue, score, category, vote }`. Fifty responses tells you if the model is calibrated. This is a crash sensor disguised as a UX feature.

**3. FIX: ListingCard "Book" button — add Plausible event** *(Dev, 5 min)*

Four consecutive misses on a 5-line fix. `window.plausible && window.plausible('FlightClick', { props: { venue: listing.title, airport: listing.ap, source: 'listing_card' } })` on the onClick of the Book anchor at app.jsx line ~1835 and ~1906. Without this, we are blind to a significant portion of flight click volume.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Expand to 400+ venues | **CUT** | 181 quality venues beats 400 with duplicates. Expansion is post-Reddit. |
| Hotel affiliate deep links per venue | **DEFER** | Generic Booking.com dynamic link is good enough pre-launch. |
| Expose Trips + Wishlists tabs | **DEFER to 1K users** | Core flow first. More tabs = more confusion. |
| Tide data for surf spots | **DEFER to Phase 3** | No user validation on current scoring yet. |
| Avalanche risk for ski | **DEFER to Phase 3** | Same rationale. |
| Fuzzy search | **DEFER** | Retention feature. Comes after first 500 users. |
| Dark mode | **CUT** | No signal it moves any metric. Not in next 6 months. |
| Offline support | **CUT** | Stale conditions data defeats the value prop. |
| Onboarding flow | **DEFER** | Below top 3. Ships after Aviasales and score thumbs. |
| Add 4 airports (LAS, PHX, MSP, DTW) | **ALREADY DONE** — BASE_PRICES already has them. Do not re-add. |

---

## Success Criteria

**90-day target: 5K–8K users.** What separates 8K from 5K:

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| Flight links | Google Flights, $0 revenue, no loop | Aviasales + marker set, commission on bookings |
| Weather cache | **DONE** — rate limit risk resolved | **DONE** |
| Score validation | Algorithm misfires on Reddit, users never return | Thumbs live, miscalibration caught within 48 hrs |
| Sentry | Crashes go undetected for days | P0 caught same day, hotfix same day |
| REI affiliate | 22 links earn $0 | Avantlink live, ~$4–5/1K RPM uplift |

**Trajectory: 6K users if we launch now with Aviasales links + Sentry. 8K if score thumbs + REI Avantlink also land before the Reddit post.**

---

## One Product Risk Nobody Is Talking About

**The app has no rate limiting or abuse protection on the Travelpayouts flight proxy.** The VPS proxy at peakly-api.duckdns.org forwards flight pricing requests with the server-side API token. There is no authentication, no per-IP rate limit, and no request budget enforcement. A single malicious actor who discovers the endpoint URL could exhaust the Travelpayouts monthly API quota in minutes, silently breaking flight prices for all real users. This is not a theoretical risk — the endpoint is exposed to anyone who opens DevTools on the site. Mitigation: add a `Referer` header check on the proxy (only accept requests from `j1mmychu.github.io`) and a simple in-memory per-IP rate limiter (10 requests/minute). Both are 20-minute changes on the VPS Node.js server.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-26 | **buildFlightUrl() → Aviasales — SHIP TODAY.** Review date is today per CLAUDE.md. Four cycles of Google Flights links earning $0. |
| 2026-03-26 | **Score validation thumbs — SHIP THIS SPRINT.** Three cycles overdue. Not deferrable. |
| 2026-03-26 | **ListingCard Plausible event — 5 min fix, no more deferral.** |
| 2026-03-26 | **Weather cache = DONE.** Devops agent shipped it. Pre-Reddit prerequisite met. |
| 2026-03-25 | **192 venues frozen.** Still correct at 181 — no expansion before Reddit. |
| 2026-03-25 | **Trips + Wishlists DEFERRED to 1K users.** |
| 2026-03-25 | **Dark mode CUT. Offline support CUT.** |

---

*Next report: 2026-03-27*
