# Community Agent Report: 2026-03-24 (v4)

**Date:** 2026-03-24
**Agent:** Community
**Status:** Reddit launch GO -- with known risks documented and mitigations ready.

---

## Reddit Launch: GO

### Pre-Launch Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Account karma + age sufficient | UNKNOWN -- VERIFY BEFORE POSTING | Reddit auto-filters posts from new or low-karma accounts. The posting account must have 50+ karma and be 30+ days old on r/surfing. If using a fresh account, this is a hard blocker -- warm it up with 5-10 genuine comments over 2 weeks first. |
| Post follows r/surfing rules | LIKELY PASS | r/surfing allows tool sharing if the poster is an active community member and the post provides genuine value. Our draft leads with the MSW/Surfline pain point and invites feedback. Risk of "self-promotion" removal is mitigated by framing as a passion project. |
| Landing page fast + mobile | CONDITIONAL PASS | Site loads at j1mmychu.github.io/peakly. 170+ venues with photos, clean card UI. WebFetch health check showed the HTML structure loads but the React app depends on Babel JSX transpilation. **HARD REQUIREMENT: Open the live URL on a phone and confirm the app renders before posting. If it shows a Babel error or blank screen, this is a NO-GO.** |
| Clear CTA on landing | PASS | Hero card shows "Your Best Window Right Now" with View Details CTA. Category pills visible. Surfing venues surface immediately. No login required. Value visible within 3 seconds. |
| Analytics to measure | FAIL | DevOps report (2026-03-25) confirms analytics are ABSENT from both index.html and app.jsx. **Without analytics, the Reddit launch is flying blind -- no bounce rate, no referral tracking, no click data.** Plausible is a 2-line addition to index.html and should be added before posting. |
| Flight prices working | FAIL (degraded) | VPS proxy returns "Host not allowed" -- a CORS/origin bug blocking j1mmychu.github.io, plus HTTP-only mixed content failure. All flight prices show "est." labels. Every user sees estimated prices, never real ones. |

### Risk Assessment

Two material risks, neither launch-blocking:

1. **Flight proxy down (CORS + HTTP).** The app's pitch is "conditions + flights." Estimated flight prices with "est." labels are honest but weaken credibility. Mitigation: frame the Reddit post around conditions first, flights second. Be transparent when asked about pricing accuracy.

2. **No analytics.** Without Plausible or GA4, we cannot measure Reddit referral traffic, bounce rates, or engagement. We will not know if the post drove 50 visitors or 5,000. **Strong recommendation: add Plausible before posting.** It is a 10-minute task that makes the entire launch measurable.

**Despite these risks, launch anyway.** The condition scoring (wave height, swell period, wind, water temp scored across 170+ spots) is genuinely novel and useful. No other free tool does this. Waiting for the proxy fix costs more in lost distribution than the credibility risk of estimated prices.

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
1. **Leads with the MSW pain point** -- immediately resonates with the community that lost their free forecast tool when Surfline absorbed MagicSeaweed (May 2023)
2. **Names real spots** -- Uluwatu, Hossegor, Puerto Escondido, Mentawai Islands, Banzai Pipeline. Creates immediate "let me check my home break" curiosity.
3. **"What it does NOT do" section** -- preempts the "this isn't Surfline" objection. Shows self-awareness and honesty.
4. **Link is NOT the first thing** -- appears naturally after the value pitch and feedback questions
5. **Ends with 3 specific feedback questions** -- invites engagement, gives commenters something concrete to respond to
6. **"Built this for myself"** -- the frame that works on Reddit. Not "my startup" or "check out my product."
7. **Does not mention Surfline's pricing** -- avoids looking like an attack ad. The MSW mention is enough to signal the pain.

### Posting timing:
Tuesday or Wednesday, 7-9am Pacific. r/surfing activity peaks when West Coast surfers check conditions before dawn patrol. Early-week posts get more engagement than weekends (surfers are surfing, not scrolling).

### If image post is allowed:
Attach a screenshot of a surf venue card showing a "Firing" or "Epic" badge with the 7-day forecast visible. A venue card for Pipeline or Uluwatu with a real condition score is more compelling than a homepage screenshot.

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
> Honest answer: they're estimates right now based on historical route data. I'm working on getting a live flight data feed hooked up -- it's the next big thing to nail. The condition scores are real-time though, pulled from Open-Meteo marine data every 10 minutes.

**"Missing my local break"**
> Drop the name and I'll add it. If you know the nearest airport code that helps. I'm building out the spot database based on exactly this kind of feedback.

**"The scoring is wrong for X spot"**
> This is the most valuable comment you can get. Reply: "Thanks -- what would you expect the score to look like for [spot] right now? Knowing what local surfers think vs. what the algorithm says is exactly how I calibrate this thing." Then log the feedback.

**Negative / hostile**
> Don't engage defensively. If constructive ("scoring is wrong for X"), thank them and ask for specifics. If just hostile, ignore completely. Never argue on Reddit.

### Timing Rules
- **Minutes 0-30:** Refresh every 5 minutes. Reply to every comment immediately. This is when Reddit's algorithm decides if the post lives or dies.
- **Minutes 30-120:** Reply within 15 minutes. Keep momentum going.
- **Hours 2-4:** Reply within 30 minutes. Let conversations develop organically.
- **After 4 hours:** Check every 1-2 hours. Reply to substantive comments only. Let it breathe.
- **Do NOT reply to every sub-comment** in a long thread. Let other users reply to each other -- that's a healthy post signal.

### What to Track During the First 4 Hours
1. Reddit post: upvote count, comment count, upvote ratio
2. If Plausible is installed: unique visitors, referral source = reddit.com, top pages visited
3. Comment sentiment: positive / neutral / negative ratio
4. Feature requests: log every single one -- this is free product research from your target user
5. Spot requests: log these for the venue database expansion

---

## 30-Day Community Sequence Based on Reddit Outcome

### Scenario A: r/surfing post gets 50+ upvotes

Strong product-market fit signal. Expand aggressively:

| Week | Action | Community |
|------|--------|-----------|
| Week 1, Day 2-3 | Post comment on Jamboards "best forecast" thread | Jamboards forum |
| Week 1, Day 3 | Submit Peakly to AlternativeTo.net as Surfline alternative | AlternativeTo |
| Week 2 | Post to r/skiing -- "spring skiing: where's still getting snow?" angle | r/skiing (964K members) |
| Week 2 | Post to r/snowboarding -- same angle, snowboard-specific tone | r/snowboarding (516K members) |
| Week 3 | Post data follow-up on r/surfing: "I tracked conditions at 50 spots for a week -- here's what I found" | r/surfing |
| Week 3 | Post to r/solotravel -- "adventure trip planner" frame | r/solotravel (2.8M members) |
| Week 4 | Post to r/digitalnomad -- "plan around conditions, not just cost" | r/digitalnomad (2.3M members) |
| Week 4 | Post to r/kiteboarding -- niche but high-intent | r/kiteboarding (31K members) |

**Critical:** Build venue deep links (hash routing) before the second Reddit wave. Every post after r/surfing should link to a specific venue, not the homepage.

### Scenario B: r/surfing post gets 10-50 upvotes

Moderate interest. Iterate before expanding.

| Week | Action |
|------|--------|
| Week 1-2 | Analyze every comment for patterns. What resonated? What fell flat? What did people click on? |
| Week 2 | Iterate the angle. Try a data-first approach: "I scored every surf spot in the world by today's conditions -- here are the top 10 right now" (no tool pitch, Peakly link in comments only) |
| Week 2-3 | Post to r/skiing with the revised angle |
| Week 3-4 | Try r/solotravel only if the skiing post performs well |

### Scenario C: r/surfing post gets <10 upvotes or removed

Diagnose before trying again.

| Possible Cause | Diagnosis | Fix |
|----------------|-----------|-----|
| Post removed by mods | Check if post appears in /new | Message mods politely. Ask what rule was violated. Reframe post. |
| Bad timing | Posted on a weekend or during a swell event | Repost Tuesday/Wednesday morning Pacific time |
| Wrong frame | "I built this" posts are saturated | Switch to pure data post: "Best surf conditions this week across 170 spots" with Peakly link in comments only |
| App didn't load for users | If analytics show 0 pageviews despite upvotes | Fix the app rendering issue first. Relaunch only after confirmed working on mobile. |
| Account filtered by automod | Low karma or new account | Spend 2 weeks being a genuine r/surfing contributor. Comment on clips, answer questions, build karma. Then try again. |

---

## 3 Non-Reddit Channels to Activate This Week

### Channel 1: Jamboards Forum -- Warm-Up Comment

**What:** Post a helpful comment in the "Best forecast site nowadays?" thread (https://jamboards.com/threads/best-forecast-site-nowadays.20348/)
**Why:** Smaller community (thousands, not hundreds of thousands). Higher signal-to-noise. The thread literally asks for what Peakly offers. Tests messaging in a low-stakes environment before the Reddit push.
**When:** 2-3 days before the Reddit launch.

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

**What:** Submit Peakly as a free, web-based alternative to Surfline on AlternativeTo.net
**Why:** People searching "Surfline alternatives" land here. Passive, long-tail discovery. Zero ongoing effort after submission. Surfline currently has only 5 listed alternatives -- low competition for visibility.
**When:** Same week as Reddit launch.
**Action:** Submit with tags: Free, Web-Based, Surf Forecast, Trip Planning, Multi-Sport. Description should emphasize: free (no paywall), no login required, 170+ spots, conditions + flights combined, works on any phone browser.

### Channel 3: Facebook Groups -- Surf Travel Communities

**Target groups (ranked by relevance):**
1. **"Surf Travel"** -- typically 10K-50K members, focused on exactly the trip-planning use case
2. **"Surfers Travel Group"** -- similar size and focus
3. **"Budget Surf Travel"** -- smaller but highest intent. These users actively care about flight prices + conditions alignment.

**Why Facebook:** Different audience than Reddit. Older demographic (30-50), more likely to be trip planners than daily dawn patrol surfers. More likely to share with friends. Visual-first platform -- screenshot of a venue card performs better than a text post.
**When:** 3-5 days after the Reddit post. Lets you validate that the app works under real traffic before pushing more users to it.

**Draft Facebook post:**
```
Built a free tool for planning surf trips -- it scores live conditions at 170+ spots worldwide
and shows estimated flight prices from your airport. No app download, no login, works on
your phone.

Check if your favorite break is firing right now: https://j1mmychu.github.io/peakly/

Looking for feedback from actual surfers -- does the scoring feel right?
```

Attach a screenshot of a venue card showing a surf spot with a "Firing" or "Epic" badge.

---

## Actions Before Posting (Pre-Flight Checklist)

These must all be true before the Reddit post goes live:

1. **Verify the app renders on mobile.** Open https://j1mmychu.github.io/peakly/ on a phone. If it shows a Babel error, blank screen, or "Peakly failed to load" -- DO NOT post.
2. **Verify the posting Reddit account.** Must have 50+ karma and 30+ days of age. Must have some recent activity on r/surfing (even a few comments). New accounts get auto-filtered.
3. **Add Plausible analytics.** Without analytics, the Reddit launch generates zero measurable data. This is a 10-minute fix (2 lines in index.html). Do it before posting.
4. **Prepare the screenshot.** Open a surf venue (Pipeline, Uluwatu, or Puerto Escondido) on the app. Take a mobile screenshot showing the venue card with its condition score badge and 7-day forecast. This is the image to attach to the Reddit post (if posting as an image post).
5. **Bookmark the engagement playbook above.** The first 30 minutes of comment responses determine whether the post lives or dies in Reddit's algorithm.

---

## Known Risks Summary

| Risk | Severity | Mitigation |
|------|----------|------------|
| App may not render (Babel transpile error) | P0 -- hard blocker | Verify on mobile before posting. If broken, fix first. |
| Reddit account lacks karma / age | P0 if new account | Check account stats. If insufficient, warm up 2 weeks with genuine comments first. |
| Flight prices are estimates (proxy down) | P1 -- credibility risk | Be transparent. Lead with conditions, not flights. Have the honest answer ready. |
| No analytics to measure results | P1 -- flying blind | Add Plausible before posting. 10-minute fix. |
| Post removed for self-promotion | Medium | Frame as passion project. Be active in comments. Don't post-and-run. |
| Open-Meteo rate limit at scale | Low (only if post goes very viral) | Silent failure at ~30 concurrent users. Unlikely for first Reddit post. |

---

## Decisions for Jack

1. **Which Reddit account will post?** Verify it has sufficient karma and r/surfing activity. This is the single most common reason Reddit launch posts fail silently.
2. **Is the app loading on mobile right now?** Open the live URL on your phone before posting. If it shows an error, the launch is NO-GO until fixed.
3. **Add Plausible before launching?** Strongly recommended. Without it, you will not know if the Reddit post drove 50 visitors or 5,000.
4. **Timing:** Best window is Tuesday or Wednesday, 7-9am Pacific. Next best window: 2026-03-25 (Tuesday) or 2026-03-26 (Wednesday).

---

*Report generated 2026-03-24 (v4). Next report: 2026-03-25.*
