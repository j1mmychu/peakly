---
PEAKLY DAILY BRIEFING — 2026-03-25
STATUS: YELLOW

The 2,226-venue crisis is resolved (reverted to 192), Sentry is live, and the app is stable -- but Reddit launch is blocked by two dev tasks that have been flagged for 6+ consecutive cycles with zero action.

SHIPPED TODAY:
- Sentry error monitoring live (DSN populated, commit f1d42b3) -- production error visibility is no longer zero
- Scale Guardian agent deployed -- caught the 2,226-venue expansion that every other agent missed
- Venue revert pushed (commit d5f5615) -- app back to 192 curated venues, 6,571 lines, unique photos restored
- CLAUDE.md safeguard added: "NEVER bulk-add venues"

DECISIONS MADE:
- PM upgraded Open-Meteo weather cache from P2 to P1 -- correct, this blocks Reddit launch
- Growth set Reddit target date: April 1 (Tuesday morning Pacific)
- Community confirmed Reddit GO, wrote complete r/surfing post copy (ready to paste)
- Content agent pausing new tanning venues, prioritizing climbing/kayak/diving gaps -- correct call
- PM cutting GuidesTab from sprint scope -- it's dead code, correct to leave it

BLOCKED:
1. **VenueDetailSheet sticky CTA** -- the booking buttons scroll off screen. This is the #1 revenue surface. Every Reddit click lands here. If the CTA is invisible after scroll, every user leaks. PM has flagged this P1 for 4 consecutive cycles. **Unblock: 4-6 hours dev work.**
2. **Open-Meteo weather cache** -- 192 venues = ~272 API calls per page load. Free tier = 10,000/day. That's ~37 page loads before the API dies and every score shows zero. Any Reddit traffic kills it. **Unblock: 2 hours dev work.**
3. **TP_MARKER placeholder** -- line still reads `YOUR_TP_MARKER`. Every flight click earns $0. The flight CTA is the most prominent button in the app. **Unblock: Jack logs into tp.media, copies marker, pastes into app.jsx. 5 minutes.**

TOP 3 PRIORITIES THIS WEEK:
1. **Ship sticky CTA + weather cache** (6-8 hrs dev) -- these are the only two items between current state and Reddit launch. Everything else is noise until these ship.
2. **Fix TP_MARKER + sign up for REI Avantlink** (35 min Jack) -- turns $0 flight clicks into revenue and activates 22 dead REI links. Combined +$6.30 RPM. Money sitting on the table.
3. **Ship 11 WCAG contrast fixes as one batch commit** (10 min dev) -- 6 consecutive reports, zero fixed. All are single-value color swaps. The app fails accessibility on 11 elements. This is the difference between "professional" and "hobby project" when Reddit surfers load it.

RISKS:
1. **Reddit timing window is closing.** Surfline's paywall anger is at peak intensity NOW. Users are actively searching for alternatives. In 6 months they'll have adapted or churned. Every week of delay costs more than every week of shipping. This risk has persisted since the competitor report first flagged it -- no change in urgency.
2. **Agent echo chamber is a systemic vulnerability.** Scale Guardian proved that all 11 agents read CLAUDE.md and trust it -- none verify against actual code. A rogue Claude Code session expanded venues 10x and nobody caught it until Scale Guardian ran `grep -c`. Next time it could be a security issue, not venue count. The fix (agents must verify ground truth from code, not docs) is not yet implemented.
3. **ListingCard "Book" button has no analytics.** Flagged 6 consecutive reports. This is the other major flight click surface besides the sticky CTA. Without Plausible tracking here, half the conversion funnel is invisible. One-line fix, zero risk.

YOUR TO-DO LIST:
1. **Replace TP_MARKER** -- log into tp.media, copy your marker string, replace `"YOUR_TP_MARKER"` in app.jsx. 5 minutes. Every flight click currently earns $0.
2. **Sign up for REI Avantlink** -- avantlink.com, 30 min, no LLC needed. Activates 22 dead affiliate links worth +$6.16 RPM.
3. **Kick off a Claude Code session to ship: sticky CTA + weather cache + WCAG fixes + ListingCard Plausible event.** That is the entire Reddit launch sprint. One session, 6-8 hours, done.
4. **Verify Reddit account has 50+ karma and 30+ day age on r/surfing.** Auto-filter kills fresh accounts. Seed 2-3 genuine comments in r/surfing over the next 48 hours.
5. **Check LLC status.** Blocks Stripe (Peakly Pro), GetYourGuide, Backcountry, custom domain. +$21.17 RPM waiting behind it.

ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID:
The agents are producing excellent analysis and zero shipped code. Eleven reports exist. Six of them have flagged the same 11 WCAG contrast fixes -- single-value color changes, 10 minutes total, zero layout risk -- for six consecutive cycles. The ListingCard Plausible event is a one-line fix flagged six times. The weather cache has been recommended by every infrastructure-aware agent for four cycles. The reports are getting longer and more detailed. The codebase is not changing. The system is optimizing for documentation, not execution. The question is not "what should we build next?" -- the reports answer that clearly. The question is: "Why has nothing from these reports shipped in six cycles, and what needs to change so that the next Claude Code session ships the exact fixes the agents have already written?" The specs exist. The code diffs are written in the UX report. Someone needs to paste them into app.jsx and push.
---
