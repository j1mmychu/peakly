# Community Agent Report: 2026-03-24 (v7)

**Date:** 2026-03-24
**Agent:** Community
**Status:** Reddit launch NO-GO. VenueDetailSheet photo hero + sticky CTA still unshipped. CLAUDE.md explicitly gates Reddit launch on this item.

---

## Reddit Launch: NO-GO

### Why NO-GO

CLAUDE.md (updated 2026-03-25) states:

> VenueDetailSheet needs photo hero + sticky CTA -- Primary conversion surface. Every card tap lands here. Zero Booking.com / Travelpayouts revenue until fixed. **Gates Reddit launch. Nothing else ships until this is done.**

The PM report (v11) confirms this is still unshipped after being flagged P1 for 4+ consecutive cycles. The pre-launch checklist item #18 remains unchecked. No code matching "photo hero" or "sticky CTA" exists in VenueDetailSheet.

Every Reddit visitor who taps a venue card will land on a detail sheet with no photo, no clear booking CTA, and no score breakdown. That is the conversion surface. Driving traffic to an incomplete conversion surface wastes the Reddit post -- you only get one shot at r/surfing.

### What Must Ship Before GO

1. **VenueDetailSheet photo hero** -- full-width venue photo at top of detail sheet (4-6 hrs dev)
2. **Sticky CTA** -- persistent "Book Flight" / "Check Prices" button at bottom of detail sheet
3. **Score breakdown** -- show what factors contribute to the condition score (builds trust with surfers who will scrutinize this)
4. **Score validation thumbs up/down** -- ships same sprint per CLAUDE.md decision

### Everything Else Is Still GO

| Requirement | Status |
|-------------|--------|
| 192 venues with unique photos | PASS |
| HTTPS proxy for flight prices | PASS |
| PWA installable | PASS |
| Plausible analytics | PASS |
| Landing page loads fast on mobile | PASS |
| Hero card with CTA | PASS |
| 53 surf spots with live scoring | PASS |
| Open-Meteo weather cache (rate limit protection) | NOT DONE -- P2, not launch-blocking for initial Reddit post volume |

**Once VenueDetailSheet ships, status flips to GO immediately. No other dev work blocks launch.**

---

## Complete r/surfing Post (Copy-Paste Ready)

No changes from v6. Post is ready. The app is not.

### Title:
```
I got tired of switching between Surfline and Google Flights, so I built a free surf trip planner -- looking for feedback
```

### Body:
```
Like a lot of you, I've been looking for good free options since MSW got absorbed into Surfline.
For daily local forecasts, Windy and Windguru are solid. But for a different problem -- figuring
out *when and where* to book a surf trip -- nothing combined conditions with travel costs.

So I built a free web app that pulls real-time wave data (height, swell period, wind, water temp)
for 50+ surf spots worldwide and scores each one with a live condition rating. Right now you
can check spots like Pipeline, Mentawai Islands, Puerto Escondido, Hossegor, and Uluwatu --
each one gets a score based on what's actually happening today, plus a 7-day forecast showing
the best window to go.

It also pulls real flight prices from your home airport, so you can see when conditions and
cheap flights line up at the same time.

What it does:
- Live condition scoring for 50+ surf spots (uses Open-Meteo marine data)
- 7-day forecast with "best window" indicator -- shows which day this week has the best setup
- Real flight prices from your home airport
- Filter by surf, ski, beach, kite, and more (190+ spots total across all sports)
- No login, no paywall, works on any phone browser
- Add it to your home screen like an app (PWA)

What it does NOT do:
- HD cams or break-by-break forecasts (use Surfline/Windy for that)
- This is for trip *planning*, not dawn patrol decisions

Would love honest feedback from people who actually surf:
- Does the condition scoring feel right when you check a spot you know well?
- What spots should I add?
- Would alerts be useful -- like "Pipeline is firing and flights from LAX are under $400"?

https://j1mmychu.github.io/peakly/

Built this for myself but figured others might get use out of it. Still early -- lots to improve.
```

### Posting timing:
Tuesday or Wednesday, 7-9am Pacific. Post when VenueDetailSheet is shipped, not before.

### If image post is allowed:
Attach a screenshot of the NEW VenueDetailSheet showing the photo hero, condition score badge, and flight price. The redesigned detail sheet IS the differentiator -- show it.

---

## Engagement Playbook: First 4 Hours

Unchanged from v6. Summary:

**Skeptic ("just another app"):**
> The difference is this is for the "I have a week off, where should I fly?" problem. It cross-references live conditions across 50+ surf spots with real flight prices. If you know a tool that does this, tell me -- I looked and couldn't find one.

**Enthusiast ("this is awesome"):**
> If you check a spot you know well, I'd love to hear if the condition score feels accurate. Real surfer feedback is worth more than any testing I can do.

**Feature request:**
> Great call. [Spot] is on the list. If you have the nearest airport code that helps me add it faster.

**"Are the flight prices real?":**
> Yeah, they pull from a live flight data feed. Condition scores are real-time from Open-Meteo marine data.

**"Scoring is wrong for X":**
> This is the most valuable feedback. What would you expect the score to be for [spot] right now?

**Hostile:**
> Don't engage. If constructive, thank and ask for specifics. If pure hostility, ignore.

### Timing Rules
- Minutes 0-30: Refresh every 5 minutes, reply instantly
- Minutes 30-120: Reply within 15 minutes
- Hours 2-4: Reply within 30 minutes
- After 4 hours: Check every 1-2 hours, substantive comments only

### Track During First 4 Hours
1. Upvote count, comment count, upvote ratio
2. Plausible: unique visitors, reddit.com referral, pages visited
3. Comment sentiment ratio
4. Feature requests (free product research)
5. Spot requests (venue database expansion)

---

## 30-Day Community Sequence Based on Reddit Outcome

### Scenario A: 50+ upvotes (strong signal)

| Week | Action | Community |
|------|--------|-----------|
| Week 1, Day 2-3 | Comment on Jamboards "best forecast" thread | Jamboards forum |
| Week 1, Day 3 | Submit to AlternativeTo.net as Surfline alternative | AlternativeTo |
| Week 2 | Post to r/skiing -- "spring skiing: where's still getting snow?" angle | r/skiing (964K members) |
| Week 2 | Post to r/snowboarding -- same angle, snowboard tone | r/snowboarding (516K members) |
| Week 3 | Data follow-up on r/surfing: "I tracked conditions at 50 surf spots for a week -- here's what I found" | r/surfing |
| Week 3 | Post to r/solotravel -- "adventure trip planner" frame | r/solotravel (2.8M members) |
| Week 4 | Post to r/digitalnomad -- "plan around conditions, not just cost" | r/digitalnomad (2.3M members) |
| Week 4 | Post to r/kiteboarding -- niche but high-intent | r/kiteboarding (31K members) |

**Critical prerequisite:** Build venue deep links (hash routing) before the second Reddit wave. Every post after r/surfing should link to a specific venue, not the homepage.

### Scenario B: 10-50 upvotes (moderate)

| Week | Action |
|------|--------|
| Week 1-2 | Analyze every comment. What resonated? What fell flat? |
| Week 2 | Iterate angle: data-first post ("I scored every surf spot by today's conditions -- top 10 right now") with Peakly link in comments only |
| Week 2-3 | Post to r/skiing with revised angle |
| Week 3-4 | Try r/solotravel only if skiing post performs |

### Scenario C: <10 upvotes or removed

| Cause | Diagnosis | Fix |
|-------|-----------|-----|
| Removed by mods | Check /new | Message mods, ask what rule was violated, reframe |
| Bad timing | Weekend or during swell event | Repost Tue/Wed morning Pacific |
| Wrong frame | "I built this" fatigue | Switch to pure data post, link in comments only |
| App didn't load | Analytics show 0 pageviews | Fix rendering, relaunch after confirmed working |
| Account filtered | Low karma / new account | Spend 2 weeks contributing genuinely, then retry |

---

## 3 Non-Reddit Channels to Activate This Week

### Channel 1: Jamboards Forum

**What:** Comment in "Best forecast site nowadays?" thread
**When:** 2-3 days before Reddit post
**Why:** Low-stakes environment, smaller community, the thread literally asks for what Peakly offers

**Comment:**
```
Late to this thread, but for a slightly different angle -- I've been working on a free web app
for planning surf trips (not daily checks). It scores conditions at 50+ surf spots worldwide
using Open-Meteo marine data and cross-references with real flight prices from your home airport.
Won't replace Windy for the morning check, but for "where should I fly next week?" it's been
useful for me.

Free, no login: https://j1mmychu.github.io/peakly/

Would love feedback on whether the condition scoring feels right.
```

### Channel 2: AlternativeTo.net

**What:** Submit Peakly as a free alternative to Surfline
**When:** Same week as Reddit launch
**Why:** Passive long-tail discovery. People searching "Surfline alternatives" land here. Surfline has only 5 listed alternatives.
**Tags:** Free, Web-Based, Surf Forecast, Trip Planning, Multi-Sport
**Effort:** One-time 10-minute submission, zero ongoing maintenance

### Channel 3: Facebook Groups -- Surf Travel Communities

**Target groups (ranked):**
1. "Surf Travel" (10K-50K members)
2. "Surfers Travel Group" (similar size)
3. "Budget Surf Travel" (smaller but highest intent -- these users care about flight prices)

**When:** 3-5 days after Reddit post (validate app handles traffic first)
**Format:** Screenshot of venue card with "Firing" badge + flight price. Visual-first platform.

**Post:**
```
Built a free tool for planning surf trips -- it scores live conditions at 50+ surf spots worldwide
and shows real flight prices from your airport. No app download, no login, works on your phone.

Check if your favorite break is firing right now: https://j1mmychu.github.io/peakly/

Looking for feedback from actual surfers -- does the scoring feel right?
```

---

## Bonus: Discord Servers Worth Monitoring

These are not immediate-action channels but worth joining now for future seeding:

1. **The Surf Network** (Discord) -- active surf travel discussion
2. **Stoke Report** (Discord) -- surf conditions + trip planning
3. **Digital Nomads World** (Discord, 50K+ members) -- travel tool sharing is well-received

Join now, lurk for 1-2 weeks, contribute genuinely, then share Peakly when contextually relevant. Discord communities punish drive-by promotion harder than Reddit.

---

## Pre-Post Checklist (Updated)

All must be true before the Reddit post goes live:

1. [ ] **VenueDetailSheet photo hero + sticky CTA shipped** -- THE GATE. Nothing else matters until this is done.
2. [ ] **Score validation thumbs up/down shipped** -- same sprint as above
3. [ ] Verify app renders on mobile (open https://j1mmychu.github.io/peakly/ on a phone)
4. [ ] Verify flight prices loading (not "est.")
5. [ ] Verify posting Reddit account has 50+ karma and 30+ days age on r/surfing
6. [ ] Confirm Plausible is tracking (GA4 optional -- Plausible alone is sufficient)
7. [ ] Prepare screenshot of NEW VenueDetailSheet with photo hero, score badge, flight price
8. [ ] Bookmark engagement playbook

---

## Decisions for Jack

1. **VenueDetailSheet must ship before posting.** This is the #1 priority per CLAUDE.md and every agent report. Estimated 4-6 hours of dev work. Once shipped, Reddit launch is GO.
2. **Which Reddit account will post?** Verify karma and r/surfing activity. This is the #1 non-dev failure mode.
3. **Timing:** Post on the first Tuesday or Wednesday morning (7-9am Pacific) after VenueDetailSheet ships. Do not post before it ships.

---

## What Changed Since v6

| Item | v6 Status | v7 Status |
|------|-----------|-----------|
| Reddit launch status | GO | **NO-GO** -- CLAUDE.md now explicitly gates launch on VenueDetailSheet. PM report confirms unshipped after 4+ P1 flags. |
| VenueDetailSheet | Not mentioned as blocker | **THE blocker.** No photo hero, no sticky CTA, no score breakdown in production code. |
| Post copy | Ready | Ready (unchanged) |
| Engagement playbook | Ready | Ready (unchanged) |
| 30-day sequence | Ready | Ready (unchanged) |
| Non-Reddit channels | 3 identified | 3 identified + Discord servers added as bonus |

**Bottom line: The post is ready. The engagement playbook is ready. The sequence is ready. The app is NOT ready. Ship VenueDetailSheet, then launch immediately.**

---

*Report generated 2026-03-24 (v7). Next report: after VenueDetailSheet ships, to flip status to GO and confirm launch timing.*
