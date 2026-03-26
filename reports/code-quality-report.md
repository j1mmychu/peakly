---
PEAKLY DAILY BRIEFING — 2026-03-25 (v2)
STATUS: YELLOW

The two critical scaling blockers from the last briefing are resolved. Smart weather fetch shipped (top 100 on load, lazy on detail). Stable photos shipped (zero deprecated URLs). The app went from "breaks at 4 visitors/day" to "handles 77+ cold loads/day." But the most-clicked button still earns $0, and 176 photos serve 2,226 venues.

SHIPPED TODAY:
- Smart weather fetch: top 100 on load, lazy-fetch on detail open. API calls dropped 95% (2,773 to ~130 per cold load). Free tier now supports ~77 unique visitors/day before needing the 30-min cache to absorb repeats.
- All 2,050 source.unsplash.com URLs replaced with stable images.unsplash.com photo IDs. Zero deprecated URLs remain. Photo loading is reliable.
- Sentry error monitoring live with valid DSN (was empty for 3+ cycles).
- CLAUDE.md venue count reconciled to 2,226 (was saying 192 in 6 places).
- Cache-buster bumped to v=20260326a.

DECISIONS MADE:
- PM: Weather cache P2 upgraded to P1, now shipped. GuidesTab cut from sprint (dead code stays).
- Growth: Reddit launch GO. Target Tuesday March 31 or Wednesday April 1, 7-9am Pacific.
- Community: Full r/surfing post written, 4-hour engagement playbook ready, 30-day multi-subreddit rollout sequence planned.
- Revenue: $79/yr Peakly Pro pricing confirmed. LLC approved -- Stripe unblocked.
- UX: Remove emoji from VenueDetailSheet section headers. Not yet executed.
- Content: Pause new venues. All 11 categories at 200+. Prioritize data quality over quantity.
- Scale Guardian: Downgraded from RED to YELLOW. localStorage quota risk effectively eliminated by smart fetch.

BLOCKED:
- **TP_MARKER = "YOUR_TP_MARKER" at line 3666.** Every flight click earns $0. Flagged for 5+ agent cycles. Fix: Jack logs into tp.media, copies marker, replaces one line. 5 minutes. This is the single biggest revenue leak in the product.
- **176 unique Unsplash photo IDs serve 2,226 venues.** Crop variants make full URLs unique, but users see the same image repeated. Worst offender: one photo appears 203 times. Need ~2,050 additional unique photo IDs. Not a launch blocker but visible within 30 seconds of scrolling.
- **CLAUDE.md line counts still stale.** Says ~5,413 lines; actual is 8,951. Section ranges (app root at ~4900) are wrong (actual ~8900+). index.html says "170+ venues" and JSON-LD says "180+"; actual is 2,226.

TOP 3 PRIORITIES THIS WEEK:
1. **Replace TP_MARKER (Jack, 5 min)** — Highest ROI action in the entire project. 6 agents flag it. Zero action taken. If Reddit drives 400 flight clicks at $0 instead of $560-840, that is real money left on the table permanently. Do this before anything else.
2. **Pagination for Explore tab (Dev, 3-4 hrs)** — 2,226 venues render at once. DOM is enormous. Mobile scroll performance degrades. UX score is 7.2/10 partly because of this. Paginate to 20-50 with infinite scroll or "Load more." This directly improves first impression for Reddit visitors.
3. **Ship 11 WCAG contrast fixes + ListingCard Plausible event as one commit (Dev, 15 min)** — 6 consecutive reports. Zero fixes. All are single-value color swaps. UX agent has paste-ready code for every one. The ListingCard "Book" button is the other major flight click surface and it is invisible to analytics. One line of code.

RISKS:
1. **TP_MARKER placeholder — $0 on every flight click.** 5+ cycles unfixed. If this is still a placeholder when the Reddit post goes live, every flight click from launch earns nothing. The Growth and Community agents both believe flight links are earning commission. They are wrong. The code explicitly checks for the placeholder and falls back to bare Aviasales URLs with no tracking.
2. **1.3MB app.jsx parsed by Babel Standalone — 6-15s blank screen on mobile 4G.** Splash screen masks it. Core Web Vitals LCP is POOR. Scale Guardian recommends externalizing VENUES to a separate JSON file (2-hour refactor, reduces parse to <1s). Not a launch blocker but Reddit users on phones will test patience.
3. **Photo repetition undermines quality perception.** 176 base images across 2,226 venues. Crop variants create URL uniqueness but visual sameness. Scrolling any single category shows repeated heroes. This contradicts the "Steve Jobs-level quality" standard and will be noticed by discerning Reddit users.

YOUR TO-DO LIST:
1. **Replace TP_MARKER** — tp.media, copy marker, paste at line 3666 of app.jsx. 5 minutes. Oldest open blocker in the project.
2. **REI Avantlink signup** — avantlink.com, 30 min, no LLC needed. 22 links earning $0, could earn $6.16 RPM. Flagged 5+ cycles.
3. **Decide: Wire Stripe to Peakly Pro or hide the button** — LLC is approved. Button fires `alert("coming soon")`. Redditors will find it and publicly roast a non-functional paywall. Ship real payments or remove the card before posting.
4. **Seed 2-3 genuine comments in r/surfing** — 48-hour warm-up before posting. Verify account has 50+ karma and 30+ day age.
5. **Open peakly on your phone, tap a venue, confirm:** photo loads, score shows a number (not "Checking..."), sticky CTA bar visible, flight price is a real number (not all "est.").

ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID:
The agent system has become excellent at identifying problems and structurally incapable of getting them fixed. Six agents have flagged TP_MARKER for 5+ cycles. Six agents have flagged WCAG contrast fixes for 6+ cycles. Every report ends with "Jack action item, 5 minutes" or "Dev, 10 minutes." The items sit. New reports get written. The same items appear again. The system generates 12 beautifully formatted daily reports analyzing the same unfixed problems.

This is not an analysis gap. It is an execution gap. The 15-minute contrast fixes and the 5-minute TP_MARKER replacement have been documented, code-diffed, line-numbered, and prioritized across dozens of pages of agent output. The total fix time for both is 20 minutes. They have been open for over a week. Either do them today or explicitly decide they do not matter and stop every agent from flagging them. The worst outcome -- which is the current outcome -- is a system that identifies problems daily, documents them beautifully, and never resolves them.
---

*Compiled from 12 agent reports by Chief of Staff. 2026-03-25.*
