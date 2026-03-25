---
PEAKLY DAILY BRIEFING -- 2026-03-24 (v13)
STATUS: RED

VenueDetailSheet photo hero + sticky CTA has been P1 for 5 consecutive cycles with zero lines of code shipped. Both Growth and Community agents independently flipped Reddit launch from GO to NO-GO. Every other launch prerequisite is green. This single item is the bottleneck for the entire company.

---

## SHIPPED SINCE LAST BRIEFING:

- Trimmed from 472 to 192 venues with 100% unique Unsplash photos (correct call)
- HTTPS proxy live at peakly-api.duckdns.org -- P0 mixed content resolved, real flight prices in production
- PWA manifest + service worker deployed -- home screen installable
- JSON-LD structured data -- SEO 81% to 91%
- All 5 Plausible custom events wired and confirmed firing
- $79/yr Peakly Pro pricing fix confirmed
- Set Alert button added to VenueDetailSheet
- .gitignore added, cache buster bumped

Good velocity on infrastructure. Zero velocity on the one thing that gates launch.

---

## DECISIONS MADE:

| Decision | Source |
|----------|--------|
| VenueDetailSheet photo hero + sticky CTA gates Reddit launch | PM v11, Growth v13, Community v7 -- unanimous across 3 agents |
| 192 venues frozen -- no expansion until post-launch | PM v11 |
| Score validation thumbs up/down ships with detail sheet | PM v11 |
| Trips + Wishlists tabs DEFERRED to 1K users | PM v11 |
| Dark mode CUT, offline support CUT, static landing pages DEFERRED | PM v11 |
| Reddit hook: problem statement over venue count | Growth v12 |
| Aviasales flight link switch review date: 2026-03-26 | Revenue v13 |

---

## BLOCKED:

| Blocked Item | What Unblocks It |
|-------------|-----------------|
| **Reddit launch** | VenueDetailSheet photo hero + sticky CTA. 4-6 hours dev work. Zero external dependencies. Pure execution. |
| **REI/Backcountry/GetYourGuide affiliate revenue (+$8 RPM)** | LLC approval (external, no action). Exception: REI via Avantlink does NOT require LLC -- Jack action, 30 min. |
| **Peakly Pro subscriptions (+$13 RPM)** | LLC approval + Stripe setup |
| **Production error visibility** | Sentry DSN signup. Jack action, 5 minutes at sentry.io. |

---

## TOP 3 PRIORITIES THIS WEEK:

1. **Ship VenueDetailSheet photo hero + sticky CTA + score breakdown** -- This is the only thing that moves the company forward. 11 out of 11 agents have flagged it. Reddit post, Booking.com revenue, Travelpayouts revenue, user trust, and shareability all depend on this single component. The spec is clear: full-width photo header (venue.photo exists on every entry), sticky bottom bar with "Book Flights" and "Find Hotels" CTAs (Booking.com dynamic link already built at line 5261), tappable score badge expanding to 3-line breakdown. 4-6 hours dev. Zero external dependencies.

2. **Open-Meteo weather cache (localStorage, 30-min TTL)** -- A successful Reddit post exhausts the free API tier at ~30 concurrent users. Silent failure: all scores drop to 0, hero shows garbage, users churn thinking the app is broken. No error banner, no fallback UI, no alert. Must ship before the Reddit post goes live. 2 hours dev.

3. **Sentry DSN + REI Avantlink signup** -- Both Jack-only, 35 minutes total. Sentry (sentry.io free tier, 5 min) gives crash visibility before Reddit traffic. Avantlink (avantlink.com, 30 min, no LLC required) flips 22 REI links from $0 to earning at ~$6 RPM. Do both before posting.

---

## RISKS:

1. **VenueDetailSheet is now a 5-cycle stall with zero progress.** This is not a prioritization dispute -- every agent agrees. The risk is a 6th miss, at which point the Reddit window (late March Surfline price revolt + spring-ski interest) closes. If this does not ship within 48 hours, rescheduling to the weaker r/skiing April angle becomes necessary.

2. **Open-Meteo rate limit will silently kill the app under any traffic spike.** 342 API calls per user load x 10K/day free tier = dead at 29 concurrent full loads. This has been flagged for 3+ cycles with no action. Persisted risk, zero mitigation.

3. **Flight links go to Google Flights (earns $0).** Every flight click is wasted. Aviasales switch is not LLC-blocked, estimated +$2-4 RPM. Review date 2026-03-26. Do not let this slip a second time.

---

## YOUR TO-DO LIST:

1. **Build VenueDetailSheet photo hero + sticky CTA.** Tell Claude Code to do it. Spec: full-width venue photo at top (venue.photo field), sticky bottom bar with "Book Flights" (Travelpayouts deep link) + "Find Hotels" (Booking.com dynamic link at line 5261), tappable score badge with 3-line breakdown, thumbs up/down for score validation. 4-6 hours. This is the Reddit launch gate and the revenue gate. Nothing else ships first.

2. **Sign up for Sentry free tier** -- sentry.io, 5 min. Paste DSN into app.jsx line 6. Gives crash visibility before public traffic.

3. **Sign up for REI affiliate via Avantlink** -- avantlink.com, 30 min, no LLC required. 22 links earning $0 flip to ~$6 RPM.

4. **After VenueDetailSheet ships:** `push "VenueDetailSheet photo hero + sticky CTA"` then post to r/surfing on the next Tuesday/Wednesday 7-9am Pacific. Post copy is ready in Community report v7. Screenshot the new detail sheet for the post.

5. **Fix duplicate photo** -- rajaampat and sipadan share the same Unsplash URL. 1-minute fix. Tell Claude Code.

---

## ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID:

The system is producing 11 reports per cycle and zero lines of code on the #1 priority.

The VenueDetailSheet has been analyzed, specced, estimated, flagged, escalated, and re-escalated across PM, UX, Growth, Community, Revenue, and DevOps reports for 5 consecutive cycles. The spec is unambiguous. The data exists (every venue has a photo URL, flight links work, scores are computed, Booking.com dynamic link is already built). There is no design decision left to make. There is no dependency to resolve. There is no blocker except someone opening app.jsx and writing the component.

Meanwhile, the team shipped JSON-LD schemas, scoring overhauls, PWA manifests, 280 venues (then reverted), structured data, and 55 pages of agent analysis. All useful infrastructure. None of it generates a single dollar or a single Reddit upvote until the primary conversion surface works.

The pattern across all 11 reports is this: every agent independently identified VenueDetailSheet as #1, wrote detailed specs and paste-ready code, then moved on to analyzing secondary items. The analysis is done. The spec is done. The only remaining action is execution.

If this stalls for one more cycle, stop running agent reports and redirect all compute toward building the feature. Reports without execution is overhead, not progress.

---

## Cross-Report Summary

| Area | Key Number | Trend |
|------|-----------|-------|
| Venues | 192 (100% unique photos) | Stable (frozen) |
| Revenue RPM (live) | $12.06/1K MAU | Flat |
| RPM post-LLC | ~$33.23/1K MAU (+176%) | Blocked by LLC |
| SEO score | 91% | Up from 81% |
| QA | 9/11 pass | Sentry DSN + thin sitemap still failing |
| UX score | 9.4/10 | 11 WCAG contrast failures unfixed for 5 cycles |
| Data completeness | 52.1% | Unchanged |
| Retention risk | YELLOW (5.5/10) | Flat |
| Reddit readiness | **NO-GO** (was GO) | Downgraded -- detail sheet blocks |
| 90-day user projection | 4,500-8,000 | Unchanged |
| Reddit launch post | Ready, copy-paste | Unchanged since v6 |
| Competitive position | Only multi-sport conditions + flights app | Surfline AI pivot widens Peakly's trip-planning gap |

---

*Generated 2026-03-24 (v13) by Chief of Staff agent. Sources: all 11 agent reports + git log (15 commits reviewed).*
