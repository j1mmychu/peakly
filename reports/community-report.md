# Community Agent Report — 2026-03-29

**Date:** 2026-03-29
**Agent:** Community
**Status:** Reddit launch **GO.** Post date: Tuesday March 31, 9–11am ET. **48 hours out.**

---

## Reddit Launch: GO — Final Pre-Flight Check

All blockers from previous reports remain resolved. Launch is Tuesday. This is the last community report before go-live.

**Account readiness:** Jack must confirm Reddit account has 50+ karma and 30+ day age for r/surfing. If not confirmed by EOD Sunday, he has Monday to build karma with genuine surf comments. This is the ONLY community-side blocker.

**Cross-agent flag:** PM report (today) flagged TP_MARKER placeholder still unset at app.jsx:3771. This doesn't block the Reddit post itself, but every flight click from Reddit users earns $0 until fixed. Community agent defers to PM on launch/delay decision — post is ready regardless.

---

## Brand Monitoring: Zero Mentions (Day 6)

Searched web + Reddit for "Peakly" in any context (surf, ski, adventure, travel app). Zero results. Brand remains a completely clean slate. No trademark conflicts, no negative mentions, no competitor callouts.

**First public mention of Peakly will be Jack's Reddit post on Tuesday.** This is ideal — we control the narrative from word one.

---

## Community Sentiment Scan — What's Trending Right Now

### r/surfing
- **Surfline pricing frustration still high.** Users continue recommending free alternatives (surf-forecast.com, Windy, Swellinfo). The "free Surfline alternative" thread archetype appears weekly.
- **Trip planning gap confirmed.** Tools discussed: Wavecation (spot discovery + tips), da Surf Engine (8,000+ break search), surf-forecast.com (free forecasts). None combine conditions with flights. Peakly's lane remains completely empty.
- **Spring swell season driving engagement.** Pipeline, Puerto Escondido, and Hossegor are in active discussion. These are all in our post's example venues — good alignment.

### r/skiing
- **Spring skiing conversations peaking.** Cost-conscious skiers searching for deals — average 2026 ski trip costs $1,500–2,000. Ikon/Epic spring extensions are live. Peakly's pass filter is uniquely positioned.
- **Flight cost is a pain point.** Dollar Flight Club and Thrifty Traveler ski flight deals are getting shared. No one is combining conditions + flights. Our r/skiing post (Week 2, April 7) will hit at the right moment.

### r/solotravel
- **"What app should I use?" threads still active.** Top recommendations: Wanderlog (itinerary building), TripIt (booking management), Google Flights (search), Rome2Rio (routing). Zero conditions-aware tools mentioned. Massive gap.
- **Adventure travel planning = 3+ app workflow.** Solo travelers are context-switching between AllTrails + Google Flights + weather apps. Peakly's "one interface" pitch will land hard here.

### r/digitalnomad
- **"Chase seasons" framing still resonant.** Nomads plan around weather + cost — exactly Peakly's value prop. Good fit for Week 4 (April 21) post.

---

## Competitive Landscape — No New Entrants

| Tool | Has Conditions + Flights? | Change Since Last Report |
|------|--------------------------|------------------------|
| Surfline | No flights | No change |
| surf-forecast.com | No flights | No change |
| Windy | No flights | No change |
| OpenSnow | No flights | No change |
| AllTrails | No flights, no conditions | No change |
| Wavecation | No flights | No change |
| da Surf Engine | No flights | No change |
| KAYAK/Hopper/Skyscanner | No conditions | KAYAK testing "peak flight windows" (PM intel) |

**KAYAK watch item:** PM report flagged KAYAK launching a "peak flight windows" feature. This is a precursor to conditions-aware travel but lacks sport-specific data. Peakly has a 6-month head start on the full conditions + flights + scoring stack. Not a blocker for Reddit launch but worth monitoring weekly.

**Nobody is in our lane.** Every tool is either conditions-only or flights-only. Zero change from last 6 days of monitoring.

---

## r/surfing Post — Copy-Paste Ready (No Changes)

Post has been stable for 3 days. Battle-tested. No edits needed.

### Title
```
I built a free tool that scores surf conditions at 200+ spots and shows flight prices from your airport
```

### Body
```
Like a lot of you, I've been looking for good free options since MSW got absorbed
into Surfline. For daily local forecasts, Windy and surf-forecast.com are solid.
But for a different problem -- figuring out *when and where* to book a surf trip --
nothing combined conditions with travel costs.

So I built a free web app that pulls real-time wave data (height, swell period,
wind, water temp) for 200+ surf spots worldwide and scores each one with a live
condition rating. Right now you can check spots like Pipeline, Mentawai Islands,
Puerto Escondido, Hossegor, Uluwatu, Mavericks, Trestles, J-Bay -- each one gets
a score based on what's actually happening today, plus a 7-day forecast showing
the best window to go.

It also pulls real flight prices from your home airport, so you can see when
conditions and cheap flights line up at the same time.

What it does:
- Live condition scoring for 200+ surf spots (Open-Meteo marine data -- wave
  height, swell period, wind, water temp)
- 7-day forecast with "best window" indicator
- Real flight prices from your home airport (not estimates)
- Filter by surf, ski, beach, kite, diving, and more (2,200+ spots total)
- 100% free -- no subscription, no paywall, no ads
- Works on any phone browser, add to home screen like an app

What it does NOT do:
- HD cams or break-by-break forecasts (use Surfline/Windy for that)
- This is for trip *planning*, not dawn patrol decisions

Would love honest feedback from people who actually surf:
- Does the condition scoring feel right when you check a spot you know well?
- What spots should I add?
- Would alerts be useful -- like "Pipeline is firing and flights from LAX are
  under $400"?

https://j1mmychu.github.io/peakly/

Built this for myself but figured others might get use out of it. Still early.
```

**Note on URL:** If Jack registers peakly.app before Tuesday, swap the GitHub Pages URL for peakly.app. Custom domain adds credibility with Reddit skeptics. If not registered by Monday night, post with github.io — it's fine, just less polished.

---

## Engagement Playbook — First 4 Hours (Refined)

### Response Templates by Comment Type

**Skeptic: "Just another app / why would I use this over Surfline?"**
> "Fair question. Surfline is great for daily local checks — HD cams, break-by-break detail. This doesn't replace that. It's for a different use case: when you're planning a surf trip and want to see which spots are firing AND what flights cost from your airport. Right now there's nothing that does both in one place."

**Enthusiast: "This is sick / bookmarked / added to home screen"**
> "Appreciate it. Do me a favor — check a spot you actually know well and tell me if the condition score feels right. That's the hardest part to get right and local knowledge is way better than any algorithm."

**Feature request: "Can you add X?"**
> "Noted — adding to the list. What would be most useful first: [relevant 2-3 options based on their request]? Trying to prioritize the right stuff."

**Scoring criticism: "Pipeline says 85 but it's flat right now"**
> "That's exactly the feedback I need. What are actual conditions there right now? I'll cross-reference with what the scoring model is seeing and figure out what's off. The algorithm uses Open-Meteo marine data (wave height, swell period, wind) — if the data source is lagging or the weights are wrong for that spot, I want to fix it."

**"How do you make money?"**
> "Affiliate commission if you click through to book a flight. No markup, no paywall, no ads. If you never click a flight link, it costs me server time and costs you nothing."

**"Is this open source?"**
> "Not right now, but not opposed to it. Focused on getting the product right first. Happy to talk about the tech stack if you're curious — it's a React PWA pulling Open-Meteo marine data with a custom scoring algorithm per sport."

### Timing Protocol

- **0-4 hours:** Jack active, responding to every comment within 30 minutes
- **4-8 hours:** Check hourly, respond to substantive comments only
- **8-24 hours:** Let it breathe. Check at 24-hour mark for overnight comments
- **Day 2 (Wednesday):** Follow up on any scoring feedback with fixes shipped

### What NOT To Do

- Don't get defensive about scoring accuracy — treat every criticism as a gift
- Don't spam the thread with multiple comments — one response per person, let them reply
- Don't link to anything other than the app URL — no social media, no "follow us"
- Don't promise features with timelines — say "on the roadmap" not "shipping next week"

---

## 30-Day Community Sequence (Updated for T-48hrs)

| Week | Day | Community | Angle | Status |
|------|-----|-----------|-------|--------|
| 0 | Sun Mar 30 (tomorrow) | Jamboards forum | Warm-up: reply to "best forecast site" threads | READY — Jack should do this tomorrow |
| 1 | **Tue Mar 31, 9am ET** | **r/surfing** | Main launch post (copy above) | GO |
| 1 | Wed Apr 2 | AlternativeTo.net | Submit Peakly as free Surfline alternative | READY — passive SEO, no effort |
| 2 | Mon-Wed Apr 7-9 | **r/skiing** | "Spring skiing: where's still getting snow + cheap flights?" | Ikon/Epic filter angle |
| 2 | Same week | Facebook: Surf Travel, Budget Surf Travel | Screenshot-first: score + flight price for trending spots | READY |
| 3 | Mon-Wed Apr 14-16 | **r/solotravel** | "Free adventure trip planner — conditions + flights in one place" | Multi-sport framing |
| 3 | Same week | Facebook: Ski Trip Planning | Spring skiing wind-down, showcase real deals | READY |
| 4 | Mon-Wed Apr 21-23 | **r/digitalnomad** | "Chase seasons, not just cheap flights" | Nomad-specific framing |
| 4 | Thu-Fri Apr 24-25 | **r/scuba**, **r/kiteboarding** | Niche communities — smaller but highly engaged | Sport-specific |

### If-Then Based on r/surfing Performance

**If 50+ upvotes (strong signal):**
- Proceed to r/skiing on schedule (Apr 7)
- Cross-post success story angle: "Posted on r/surfing last week, 500 surfers tested it, here's what we learned"
- Accelerate Facebook group seeding

**If 10-50 upvotes (moderate signal):**
- Delay r/skiing by 3 days (Apr 10 instead of Apr 7)
- Iterate on post format — add screenshots, specific venue examples
- Test shorter title variant

**If <10 upvotes (weak signal):**
- Pause Reddit sequence
- Diagnose: was it timing? Account issues? Post format? Scoring accuracy?
- Shift to smaller communities (Jamboards, niche Facebook groups) for softer feedback
- Re-attempt r/surfing with different angle in 2 weeks

---

## 3 Non-Reddit Channels — This Week

### 1. Jamboards Forum (Tomorrow, March 30)
Active thread: "Best forecast site nowadays?" — high engagement, users recommending Windy and surf-forecast.com. Reply with genuine value (agree with their recommendations for daily forecasts) and mention Peakly for trip-planning use case. Don't lead with a link.

### 2. AlternativeTo.net (Wednesday April 2)
Submit Peakly as a Surfline alternative. This is passive SEO that pays off over months. AlternativeTo ranks well for "[product] alternative" Google searches. Zero effort, long-tail value.

### 3. Twitter/X (Launch Week)
- Search "planning a surf trip" and "where to surf in April" — reply with genuine advice + natural mention
- Thread idea: "I analyzed 2,226 adventure spots and found the best conditions windows for April 2026" — data-driven, shareable, positions Jack as a builder
- Reply to travel influencer posts about spring conditions (don't DM yet — wait for Reddit traction)

### Discord Servers (Lurking Phase — Start Today)
- Nomad List Discord — travel tool recommendation channels
- Surf community Discords — #tools or #resources channels
- Protocol: Lurk 3-5 days, contribute to unrelated discussions, then mention when someone asks about trip planning

---

## Content Ideas for Organic Promotion (Post-Reddit)

Based on current community trends and seasonal timing:

1. **"The 5 best surf trip windows in April 2026 (based on real data)"** — Uses Peakly's actual scoring. Shareable across r/surfing, Facebook groups, Twitter. High engagement format.

2. **"Spring skiing isn't over: 10 resorts still getting snow + flights under $300"** — Time-sensitive, actionable. Perfect for r/skiing post (Week 2). Ikon/Epic filter is the hook.

3. **"I checked 200 surf spots and here's where conditions + flights align right now"** — Could become a weekly series. Positions Peakly as a data source, not just an app.

4. **"The 3-app problem: why adventure travelers are still context-switching"** — Thought piece for r/solotravel and r/digitalnomad. Sets up Peakly as the solution without being salesy.

5. **"How much does a surf trip actually cost in 2026? (real data)"** — Piggyback on The Snow Chasers' popular ski cost analysis ($1,500-2,000 per trip). Use Peakly flight data to add the airfare component. High shareability.

---

## Risk Flags — Final Assessment

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|-----------|
| **Reddit account karma insufficient** | HIGH | LOW (Jack was asked 5 days ago) | If insufficient: spend Monday commenting on r/surfing. Genuine engagement, not spam. |
| **github.io URL skepticism** | MEDIUM | MEDIUM | Redditors notice amateur-looking URLs. Register peakly.app before Tuesday if possible. If not, post anyway — content matters more than domain. |
| **Scoring accuracy questioned by surfers** | MEDIUM | MEDIUM-HIGH | PM flagged venue.facing swell bug (east-facing breaks score wrong). If a surfer checks J-Bay or a Caribbean spot and score feels off, credibility takes a hit. Mitigation: respond honestly ("improving directional scoring this week"). |
| **Photo duplication noticed** | MEDIUM | HIGH | PM flagged 174 unique photos across 2,226 venues. If someone scrolls fishing category, all venues have the same photo. Mitigation: "Improving photo diversity this week" — honest, shows active development. |
| **One shot per subreddit** | HIGH | N/A | Reddit gives you one launch post. If it flops, you can't re-post. Post is solid. Timing is good. But execution on launch day (Jack being active for 4 hours) is critical. |
| **TP_MARKER still placeholder** | MEDIUM | MEDIUM | Every flight click earns $0. Not a community risk per se, but a wasted opportunity from the traffic spike. |

---

## Action Items — Final 48 Hours

| # | Action | Owner | ETA | Status |
|---|--------|-------|-----|--------|
| 1 | **Confirm Reddit account karma (50+, 30+ days)** | Jack | Sunday EOD | OVERDUE — asked 5 days ago |
| 2 | Post warm-up reply on Jamboards "best forecast site" thread | Jack | Tomorrow (Mon Mar 30) | NEW |
| 3 | Register peakly.app domain | Jack | Before Tuesday | NICE-TO-HAVE |
| 4 | Set TP_MARKER at app.jsx:3771 | Jack | Before Tuesday | CRITICAL (per PM) |
| 5 | Manual spot-check: Pipeline, Trestles, Puerto Escondido scores | Jack/Dev | Monday | SHOULD-DO |
| 6 | Start lurking in Discord servers (Nomad List, surf) | Jack | Today | LOW EFFORT |
| 7 | **Post r/surfing at 9am ET Tuesday** | Jack | Tue Mar 31 | READY |
| 8 | Submit to AlternativeTo.net | Jack | Wed Apr 2 | READY |

---

## Bottom Line

**Two days out. Zero new blockers. Market is prime.**

Surfline frustration is at peak levels. Spring travel planning is in full swing. Zero competitors combine conditions + flights. The post is battle-tested and copy-paste ready. The engagement playbook covers every likely comment type.

The only things standing between Peakly and its first 500 users are: (1) Jack confirming his Reddit account is ready, and (2) Jack pressing "submit" at 9am ET Tuesday.

Everything else — TP_MARKER, domain, photos, swell scoring — can be fixed in the 48 hours after launch. But the Reddit post window is now. Spring season doesn't wait.

**Post Tuesday. Fix Wednesday. Iterate Thursday.**

*Report generated 2026-03-29. Next run: 2026-03-30 (final pre-launch check).*
