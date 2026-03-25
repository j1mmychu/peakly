# Community Agent Report: 2026-03-24 (v3)

**Date:** 2026-03-24
**Agent:** Community
**Status:** Reddit soft launch CONDITIONAL GO. One critical risk identified.

---

## Reddit Launch: CONDITIONAL GO

### Pre-Launch Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Account karma + age sufficient | UNKNOWN -- VERIFY BEFORE POSTING | Reddit auto-filters posts from new or low-karma accounts. Jack's account must have 50+ karma and be 30+ days old on r/surfing. If using a fresh account, this is a hard blocker -- warm it up with 5-10 genuine comments first. |
| Post follows r/surfing rules | LIKELY PASS | r/surfing allows self-promotion if (a) the poster is an active community member, not a drive-by, and (b) the post provides value beyond "download my app." Our draft leads with value and invites feedback. The risk is "self-promotion" removal -- mitigated by framing as a passion project seeking feedback, not a launch announcement. |
| Landing page fast + mobile | PASS WITH RISK | Site loads at j1mmychu.github.io/peakly. 170+ venues with photos, clean card UI, tactile interactions. QA confirms HTTP 200. **RISK: DevOps report flags the site may show stale or error state if Babel transpile fails. Open the live URL on a phone and verify the app renders before posting.** |
| Clear CTA on landing | PASS | Hero card shows "Your Best Window Right Now" with View Details CTA. Category pills are visible. Surfing venues surface immediately. No login required. Value visible within 3 seconds for a surfer. |
| Analytics to measure | PASS | Plausible analytics confirmed live on production (Growth report v8). Can track Reddit referral traffic. |
| Flight prices working | FAIL (degraded) | VPS proxy has been ECONNREFUSED for 2+ days (DevOps report). All flight prices show "est." labels. Mixed content blocks real prices even if proxy comes back. **This is the biggest risk: a surfer clicks a venue, sees "est. $350" and asks "is this real?" -- and it's not.** |

### Risk Assessment

**The flight proxy being down is the single biggest credibility risk for the Reddit launch.** The app's unique value proposition is "conditions + flights." If flights are fake estimates, we're selling half the product. Surfers are a skeptical audience -- they'll call this out.

**Recommendation:** Post anyway. Here's why:
1. The condition scoring alone (wave height, swell period, wind, water temp) is genuinely novel and useful -- no other free tool does this across 170+ spots
2. The "est." label is honest -- we're not hiding it
3. Frame the post around conditions first, flights second
4. If someone asks about flight accuracy, be transparent: "Flight prices are estimates right now -- working on getting live data hooked up"
5. Every day of delay waiting for the proxy is wasted distribution (Growth report is right about this)

**Hard requirement before posting:** Open https://j1mmychu.github.io/peakly/ on a phone and verify the app actually renders. The WebFetch health check was ambiguous. If it shows "Peakly failed to load" -- DO NOT post.

---

## Complete r/surfing Post (Copy-Paste Ready)

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
for 170+ surf spots worldwide and scores each one with a live condition rating. Right now you
can check spots like Uluwatu, Hossegor, Puerto Escondido, Mentawai Islands, and Banzai Pipeline
-- each one gets a score based on what's actually happening today, plus a 7-day forecast showing
the best window to go.

What it does:
- Live condition scoring for 170+ surf spots (uses Open-Meteo marine data)
- 7-day forecast with "best window" indicator -- shows which day this week has the best setup
- Estimated flight prices from your home airport
- Filter by surf, ski, beach, kite, and more
- No login, no paywall, works on any phone browser

What it does NOT do:
- HD cams or break-by-break forecasts (use Surfline/Windy for that)
- This is for trip *planning*, not dawn patrol decisions

Would love honest feedback from people who actually surf:
- Does the condition scoring feel right when you check a spot you know well?
- What spots should I add?
- Would alerts be useful -- like "Pipeline is firing and flights from LAX are under $300"?

https://j1mmychu.github.io/peakly/

Built this for myself but figured others might get use out of it. Still early -- lots to improve.
```

### Why this draft works:
1. **Leads with the MSW pain point** -- immediately resonates with the 785K r/surfing members who lost their free forecast tool
2. **Names real spots** -- Uluwatu, Hossegor, Puerto Escondido, Mentawai Islands, Banzai Pipeline are spots surfers actually care about. Creates immediate "let me check my home break" curiosity.
3. **"What it does NOT do" section** -- preempts the "this isn't Surfline" objection. Shows self-awareness.
4. **Link is NOT the first thing** -- appears naturally after the value pitch
5. **Ends with specific feedback questions** -- invites engagement, not just upvotes
6. **"Built this for myself"** -- the frame that works on Reddit. Not "my startup" or "check out my product."

---

## Engagement Playbook: First 4 Hours

### Response Templates by Comment Type

**Skeptic: "Just another app / this already exists"**
> Fair question. The difference is that tools like Surfline and Windguru are great for daily local checks -- this is specifically for the "I have a week off, where should I fly?" problem. It cross-references live conditions across 170 spots with flight prices so you can find when things align. If you know a tool that already does this, genuinely tell me -- I looked and couldn't find one.

**Enthusiast: "This is awesome / bookmarked"**
> Appreciate it. If you check a spot you know well, I'd love to hear if the condition score feels accurate. That's the part I'm most unsure about -- the scoring algorithm weights swell period, wave height, wind, and water temp differently by spot type. Real surfer feedback is worth more than any amount of testing I can do alone.

**Feature request: "Can you add X spot / X feature?"**
> Great call. [Spot name] is on the list -- I'll bump it up. If you have the rough location or nearest airport code that helps me add it faster. [For feature requests:] That's on the roadmap -- right now I'm focused on getting the condition scoring dialed in, but [feature] is exactly the direction this is heading.

**"Are the flight prices real?"**
> Honest answer: they're estimates right now. I'm working on getting a live flight data feed hooked up -- it's the next big thing to nail. The condition scores are real-time though, pulled from Open-Meteo marine data.

**"Missing my local break"**
> Drop the name and I'll add it. If you know the nearest airport code that helps. I'm building out the spot database based on exactly this kind of feedback.

**Negative / hostile**
> Don't engage defensively. If it's constructive ("scoring is wrong for X"), thank them and ask for specifics. If it's just hostile, ignore it. Never argue.

### Timing Rules
- **Minutes 0-30:** Refresh every 5 minutes. Reply to every comment immediately. This is when Reddit's algorithm decides if the post lives or dies.
- **Minutes 30-120:** Reply within 15 minutes. Keep momentum going.
- **Hours 2-4:** Reply within 30 minutes. Let conversations develop organically.
- **After 4 hours:** Check every 1-2 hours. Reply to substantive comments only. Let it breathe.
- **Do NOT reply to every single sub-comment** in a long thread. Let other users reply to each other -- that's the sign of a healthy post.

### What to Track During the First 4 Hours
1. Plausible dashboard: unique visitors, referral source = reddit.com
2. Reddit post: upvote count, comment count, upvote ratio
3. Comment sentiment: positive / neutral / negative ratio
4. Feature requests: log every one -- this is free product research

---

## 30-Day Community Sequence Based on Reddit Outcome

### Scenario A: r/surfing post gets 50+ upvotes

This signals strong product-market fit with surfers. Execute:

| Week | Action | Community |
|------|--------|-----------|
| Week 1, Day 3 | Comment on Jamboards "Best forecast" thread | Jamboards |
| Week 1, Day 5 | Submit Peakly to AlternativeTo.net as Surfline alternative | AlternativeTo |
| Week 2 | Post to r/skiing -- spring skiing angle | r/skiing (964K members) |
| Week 2 | Post to r/snowboarding -- same angle, different tone | r/snowboarding (516K members) |
| Week 3 | Post to r/solotravel -- "adventure trip planner" frame | r/solotravel (2.8M members) |
| Week 3 | Post follow-up data post on r/surfing: "I tracked conditions at 50 spots for a week -- here's what I found" | r/surfing |
| Week 4 | Post to r/digitalnomad -- "plan trips around conditions" | r/digitalnomad (2.3M members) |
| Week 4 | Post to r/kiteboarding | r/kiteboarding (31K members) |

### Scenario B: r/surfing post gets 10-50 upvotes

Moderate interest. Learn and iterate before expanding.

| Week | Action |
|------|--------|
| Week 1-2 | Analyze every comment for patterns. What resonated? What fell flat? |
| Week 2 | Iterate the post angle. Try a different frame: "I scored every surf spot in the world by today's conditions -- here are the top 10" (data-first, not tool-first) |
| Week 2-3 | Post to r/skiing with the revised angle |
| Week 3-4 | Try r/solotravel only if skiing post performs |

### Scenario C: r/surfing post gets <10 upvotes or removed

Something is broken. Diagnose before trying again.

| Possible Cause | Diagnosis | Fix |
|----------------|-----------|-----|
| Post removed by mods | Check if post appears in /new | Message mods politely, ask what rule was violated |
| Bad timing | Posted on a weekend or during a major surf event | Repost Tuesday/Wednesday morning US Pacific time |
| Wrong frame | "I built this" posts are saturated | Switch to pure data post: "Best surf conditions this week across 170 spots" with Peakly link in comments only |
| App didn't load for users | Check Plausible -- if 0 pageviews despite upvotes, app is broken | Fix the app first, relaunch |
| Account filtered | Low karma or new account | Spend 2 weeks being a genuine r/surfing contributor first, then try again |

---

## 3 Non-Reddit Channels to Activate This Week

### Channel 1: Jamboards Forum -- Warm-Up Comment

**Thread:** "Best forecast site nowadays?" (https://jamboards.com/threads/best-forecast-site-nowadays.20348/)
**Why:** Smaller community (thousands, not hundreds of thousands), higher signal-to-noise, the thread literally asks for what Peakly offers. Tests messaging in a low-stakes environment before Reddit.
**Timing:** Post 2-3 days before the Reddit launch.

**Exact comment:**
```
Late to this thread, but for a slightly different angle on the problem -- I've been working on
a free web app for planning surf trips (not daily checks). It scores conditions at 170+ spots
worldwide using Open-Meteo marine data and cross-references with estimated flight prices from
your home airport. Won't replace Windy for the morning check, but for "where should I fly
next week?" it's been really useful for me.

Free, no login: https://j1mmychu.github.io/peakly/

Would love feedback on whether the condition scoring feels right -- especially from people
who know specific breaks well.
```

### Channel 2: AlternativeTo.net -- Surfline Alternative Listing

**URL:** https://alternativeto.net/software/surfline/ (Surfline currently has 5 listed alternatives)
**Why:** People searching "Surfline alternatives" land here. Passive, long-tail discovery. Zero ongoing effort after submission.
**Timing:** Same week as Reddit launch.
**Action:** Submit Peakly as a free, web-based alternative to Surfline. Description should emphasize: multi-sport, free, no login, conditions + flights combined. Tag it as: Free, Web-Based, Surf Forecast, Trip Planning.

### Channel 3: Facebook Group -- "Surf Travel" or "Surf Trip Planning"

**Target groups (ranked by size and activity):**
1. **"Surf Travel"** -- search Facebook for this group. Typically 10K-50K members, focused on exactly our use case: planning surf trips.
2. **"Surfers Travel Group"** -- similar size and focus.
3. **"Budget Surf Travel"** -- smaller but highly relevant. These users care about flight prices + conditions alignment.

**Why Facebook:** Different audience than Reddit. Older demographic (30-50), more likely to be trip planners rather than daily surfers. More likely to share with friends.
**Timing:** 3-5 days after Reddit post, once we have some Plausible data to validate the app works at scale.
**Frame:** Similar to Reddit post but shorter. Lead with a screenshot of a surf venue showing an "Epic" or "Firing" badge + flight price. Facebook is visual-first.

**Draft Facebook post:**
```
Built a free tool for planning surf trips -- it scores live conditions at 170+ spots worldwide
and shows estimated flight prices from your airport. No app download, no login, works on
your phone.

Check if your favorite break is firing right now: https://j1mmychu.github.io/peakly/

Looking for feedback from actual surfers -- does the scoring feel right?
```

---

## Known Risks and Blockers Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| App may not render (Babel error) | P0 -- MUST verify before posting | Open live URL on phone, confirm app loads |
| Flight prices are estimates (proxy down) | P1 -- credibility risk | Be transparent when asked. Lead with conditions, not flights. |
| Reddit account may lack karma | P0 if using new account | Check account age + karma. If insufficient, warm up for 2 weeks first. |
| Post removed for self-promotion | Medium | Frame as passion project. Be active in comments. Don't post-and-run. |
| 72 venues missing photos (Content report) | Low for Reddit | Surf venues all have photos. Risk is if user browses to a hiking/skiing venue with no photo. |

---

## Decisions for Jack

1. **Which Reddit account will post?** Verify it has sufficient karma and history on r/surfing. If the account is new or has no r/surfing activity, spend 1-2 weeks commenting genuinely before the launch post.
2. **Is the app loading on mobile right now?** Open https://j1mmychu.github.io/peakly/ on your phone before posting. If it shows an error screen, the launch is a NO-GO until fixed.
3. **Timing:** Best days for r/surfing posts are Tuesday-Wednesday morning US Pacific time. Avoid weekends (flooded with surf clips) and Monday (low engagement).

---

*Report generated 2026-03-24. Next report: 2026-03-25.*
