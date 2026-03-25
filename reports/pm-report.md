# PM Report — 2026-03-25 (v11)

## Status: YELLOW → improving

192 venues, 100% unique photos, HTTPS proxy live, SEO at 91%, PWA deployed, Plausible fully wired. The overnight trim from 333 → 192 venues was the right call. The app is tighter and more trustworthy. The one thing blocking launch confidence: VenueDetailSheet still has no sticky CTA and no photo hero. Every other agent has now flagged this at least twice. It ships this sprint or nothing else does.

---

## Shipped Since Last Report (v10)

| Item | Type | Right call? |
|------|------|-------------|
| **Trim to 192 venues with 100% unique photos** — reverted bulk surf expansion | Data quality | **YES.** Previous report flagged photo duplication as a credibility risk. This is the correct resolution. Quality over count. |
| **Chief of Staff briefing v11 + all 11 agent reports** | Operations | **YES.** Useful context for this session. |
| **HTTPS proxy (peakly-api.duckdns.org)** | Infrastructure | **YES — P0 resolved.** Real flight prices loading in production. |
| **PWA manifest + sw.js** | Infrastructure | **YES.** Installability shipped. |
| **JSON-LD structured data** | SEO | **YES.** SEO now 91% (up from 81%). |
| **Plausible custom events** (all 5 wired) | Analytics | **YES.** Measurability before launch. |
| **$79/yr pricing fix** | Bug | **YES — required.** |
| **Set Alert button in VenueDetailSheet** | UX | **YES.** Alert adoption requires this. |

**What was NOT shipped that should have been:**
- VenueDetailSheet photo hero + sticky CTA — flagged P1 in v9, v10. Still untouched.
- ListingCard "Book" button Plausible event — flagged in v9, v10, v11 UX report. 3 consecutive misses.

These are not new items. They are repeat misses. This report escalates both to blocking-launch status.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **VenueDetailSheet — no photo hero, no sticky CTA, no score breakdown** | **P1** — primary conversion surface. Every card tap lands here. Zero Booking.com / Travelpayouts revenue until fixed. | UNBLOCKED. Dev work 4–6 hrs. |
| **Sentry DSN empty** — zero production error visibility | **P1** — 192 venues + scoring overhaul, blind to crashes | Jack: 5 min at sentry.io free tier |
| **ListingCard "Book" button missing Plausible event** | **P2** — secondary flight click entry point goes untracked | One-line fix, app.jsx line ~2092 |
| **REI affiliate IDs still placeholder** — 21 live links earn $0 | **P2** — unblocked by Avantlink (no LLC required) | Jack: 30 min, avantlink.com |
| **Open-Meteo rate limit risk** | **P2** — silently kills scores at ~30 concurrent users | Dev: localStorage weather cache, 2 hrs |
| **Photo quality** | **RESOLVED** — trimmed to 192, all unique | Done |
| **HTTPS proxy** | **RESOLVED** | Done |
| **$79/yr pricing** | **RESOLVED** | Done |
| **Cache buster** | **RESOLVED** | Done |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| VenueDetailSheet polish | Dev | **THIS SPRINT — gates Reddit launch** |
| Sentry DSN | Jack | Do today (5 min) |
| REI affiliate via Avantlink | Jack | This week (30 min, unblocked) |
| LLC approval | External | No action available |

---

## Priority Decisions — Top 3 This Sprint Only

**1. VenueDetailSheet — ship photo hero + sticky CTA** *(Dev, 4–6 hrs)*

This is the only thing that moves revenue. Booking.com and Travelpayouts earn $0 from a detail sheet users scroll past. Required elements: full-width photo header (venue.photo already exists on every entry), sticky bottom bar with "Book Flights →" (Travelpayouts deep link) and "Find Hotels →" (Booking.com dynamic link already built at line 5261), tappable score badge that expands to a 3-line breakdown ("Wave: 8ft ideal. Wind: offshore. Swell: 14s"). Nothing else ships until this is done.

**2. Sentry DSN + REI Avantlink signup** *(Jack, 35 min total — unblocked today)*

Both are Jack actions, not dev work. Sentry: sentry.io free tier, 5 min, gives crash visibility before any public launch. REI via Avantlink: avantlink.com, 30 min, no LLC required — 21 live links currently earning $0 flip to ~$4–5/1K RPM uplift. Do these before any Reddit post goes out.

**3. Open-Meteo weather cache** *(Dev, 2 hrs)*

At the traffic spike from a Reddit post landing, ~30 concurrent user loads will exhaust the 10K/day free API tier in under an hour. Silent failure mode: all venue scores drop to 0, hero shows garbage, users assume the app is broken and churn. One localStorage cache keyed by `${lat}_${lon}_${date}` with 30-minute TTL eliminates this risk entirely through ~10K MAU. Prerequisite for any growth push.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Expand to 400 ski towns | **CUT** | 192 venues is enough for launch. Expansion before Reddit launch is backwards. |
| Expose Trips + Wishlists tabs | **DEFER to 1K users** | Core flow (Explore → Detail → Book) converts first. More tabs = more confusion for new users. |
| Hotel affiliate deep links per venue | **DEFER** | Generic Booking.com dynamic link (already built) is good enough. Per-venue research is post-launch work. |
| Tide data for surf spots | **DEFER to Phase 3** | Scoring overhaul just shipped. Let it prove itself before stacking more data inputs. |
| Avalanche risk for ski | **DEFER to Phase 3** | Same rationale. |
| Fuzzy search / search history | **DEFER** | Detail sheet conversion comes first. Search is a retention feature, not an acquisition feature. |
| Dark mode | **CUT** | No signal this moves retention or acquisition. Not in next 6 months. |
| Offline support | **CUT** | Stale conditions data defeats the entire value prop. Incompatible. |
| Static landing pages for SEO | **DEFER** | SEO at 91% is sufficient for Phase 1. Client-rendered SPA is acceptable pre-100K. |
| Add 50+ venues (South America, Africa, SE Asia) | **CUT until post-launch** | 192 quality venues beats 400 mediocre ones. Expansion after detail sheet converts. |

---

## Success Criteria

**90-day target: 5K–8K users.** What separates 8K from 5K:

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| Reddit launch quality | Text post, modest engagement | Viral screenshot — live condition alert firing, real venue score visible |
| Detail sheet | Users tap, bounce back (no sticky CTA) | Photo hero + sticky CTA drives Booking.com + flight clicks, screenshot-worthy |
| Alert adoption | <5% set an alert | Set Alert button + VenueDetailSheet prompt drives 10%+ adoption → daily active users |
| Score transparency | Users see number, don't trust it | Tappable breakdown builds trust, gets shared |
| Crash rate | Silent errors drive unexplained churn | Sentry live, P0 crashes caught within hours not Reddit complaints |

**Current trajectory: 5K if we launch today. 8K requires detail sheet + Sentry live first.**

---

## One Product Risk Nobody Is Talking About

**The scoring algorithm is now the app's primary trust signal — and it has never been validated by real users.** The deep overhaul shipped 12 rewritten algorithms without any user feedback loop. If a surfer opens Puerto Escondido on a 12-foot day and the app shows "Poor — 34/100," they will close the tab and never return. There is no mechanism to collect user corrections, no way to know if scores feel right, and no A/B test running. The fix is cheap: add a single thumbs up/thumbs down on the score badge in VenueDetailSheet. One tap sends a Plausible event with venue name + score + category. After 200 responses, you'll know if the algorithms need recalibration. Ship this in the same sprint as the detail sheet redesign.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-25 | **VenueDetailSheet gating Reddit launch** — nothing ships until sticky CTA and photo hero are done. |
| 2026-03-25 | **192 venues is correct** — freeze expansion. Quality over count. |
| 2026-03-25 | **Score validation thumbs** — add thumbs up/down to score badge in detail sheet, same sprint. |
| 2026-03-25 | **Trips + Wishlists DEFERRED** — revisit at 1K users. |
| 2026-03-25 | **Offline/service worker CUT** — incompatible with live-data use case. |
| 2026-03-25 | **Dark mode CUT** — no signal. |
| 2026-03-25 | **Static landing pages DEFERRED** — 91% SEO is sufficient for Phase 1. |

---

*Next report: 2026-03-26*
