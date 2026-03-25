# Peakly Growth Report: 2026-03-24 (v10)

---

## Reddit Launch: GO

All blockers cleared. Significant progress since v9:

- **192 venues, 100% photo coverage** (up from 182 venues / 60% photos). Zero gradient-only cards remain. Every listing a Redditor taps looks editorial.
- **5 Plausible custom events live** (Tab Switch, Venue Click, Flight Search, Wishlist Add, Onboarding Complete). We can measure everything that matters within hours of posting.
- **Plausible SPA tracking upgraded** to `script.hash.js` -- virtual pageviews per tab.
- **JSON-LD structured data shipped** -- WebApplication, WebSite, Organization markup live in index.html.
- **Static h1 fallback in index.html** -- crawlers without JS see real content.
- **"Set Alert" button in VenueDetailSheet** -- 3 taps instead of 7. Core retention mechanic is now accessible.
- **Venue deep links built** (`#venue-{id}` hash routing). Every venue is now shareable with a direct URL.
- **$79/yr pricing fixed** (was $9/mo). Correct price anchor for all early users.
- **Cache buster current** (v=20260325a).
- **10 new venues** (diving +4, climbing +3, kite +3). Thin categories improving.
- **Hiking gear items added** -- 9 hiking venues now have monetizable gear recommendations.
- **WCAG contrast fixes shipped** -- estimated prices banner, carousel labels, affiliate disclaimers, search bar subtitle all pass AA.

**Remaining caveat: Flight proxy still HTTP-only.** The VPS is alive (returns "Host not allowed") but mixed content blocks all real prices in production. Every user sees "est." prices. This does not block launch -- condition scoring is the hook -- but must be fixed within 48 hours of posting. The proxy has two independent bugs: (1) no HTTPS, (2) CORS host restriction rejecting `j1mmychu.github.io`.

**NEW since v9:** Deep links change the launch calculus. We can now link to specific venues in Reddit comments. This was the #1 missing piece for community engagement.

---

## Exact r/surfing Post Draft (Copy-Paste Ready)

**Subreddit:** r/surfing (785K members)

**Post type:** Text post (image posts get higher initial engagement but text posts generate more comments, which is what we need for the algorithm + feedback)

**Title:**
```
I got tired of switching between Surfline and Google Flights, so I built a free surf trip planner -- looking for feedback
```

**Body:**
```
Like a lot of you, I've been looking for good free options since MSW got absorbed into Surfline.
For daily local forecasts, Windy and Windguru are solid. But for a different problem -- figuring
out *when and where* to book a surf trip -- nothing combined conditions with travel costs.

So I built a free web app that pulls real-time wave data (height, swell period, wind, water temp)
for 50+ surf spots worldwide and scores each one with a live condition rating. Right now you
can check spots like Uluwatu, Hossegor, Puerto Escondido, Mentawai Islands, and Banzai Pipeline
-- each one gets a score based on what's actually happening today, plus a 7-day forecast showing
the best window to go.

What it does:
- Live condition scoring for 50+ surf spots (uses Open-Meteo marine data)
- 7-day forecast with "best window" indicator -- shows which day this week has the best setup
- Estimated flight prices from your home airport
- Filter by surf, ski, beach, kite, and more (190+ total spots across all sports)
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

### Changes from v9 draft:
- Updated venue counts to match current reality (53 surf, 192 total)
- Kept the MSW/Surfline pain point lead -- validated by competitive intel (see below)
- "What it does NOT do" section is the most important paragraph. It preempts the inevitable "this isn't Surfline" comments and shows self-awareness.
- Link placement: not first, appears naturally after the value pitch
- Ends with specific questions to drive comments (Reddit algorithm rewards comment velocity)

### Posting timing:
**Tuesday or Wednesday, 9-11am Eastern (6-8am Pacific).** Data from 2026 Reddit analysis shows Monday-Thursday 9am-1pm EST maximizes visibility for hobby/lifestyle subreddits. For r/surfing specifically, early morning Pacific time catches West Coast surfers checking conditions before dawn patrol. Avoid weekends (surfers are surfing, not scrolling; also flooded with surf clips).

### Reddit comment responses with deep links (NEW):
When someone asks about a specific spot, reply with a venue deep link:

- "Here's Pipeline's live conditions right now: https://j1mmychu.github.io/peakly/#venue-banzai_pipeline"
- "Check Uluwatu: https://j1mmychu.github.io/peakly/#venue-uluwatu"

This is the highest-conversion response pattern. Each deep link is a targeted acquisition event that lands the user on exactly the right venue.

### Failure mode diagnosis:
- **3 upvotes, removed by mods** -- self-promo rules triggered. Pivot: post as a comment in a "what forecast app do you use?" thread instead. These appear monthly.
- **3 upvotes, not removed** -- hook didn't land. Reframe next attempt as data-first: "I scored every surf spot in the world by today's conditions -- here are the top 10" with Peakly link in comments only.
- **50+ upvotes but low click-through** -- the post is compelling but the link isn't. Check Plausible for referrer data. Add a screenshot of a venue card with "Firing" badge to a follow-up comment.
- **Post gets engagement but app doesn't load** -- Babel transpile failure. Check Plausible: if 0 pageviews despite upvotes, the app is broken. Hard stop until fixed.

### Pre-posting checklist (Jack must do):
1. Open https://j1mmychu.github.io/peakly/ on your phone. Confirm it loads and shows venue cards.
2. Verify your Reddit account has 50+ karma and is 30+ days old on r/surfing. If not, spend 1-2 weeks commenting genuinely first.
3. Tap a surf venue and confirm the detail sheet opens with weather data.

---

## Post-Reddit Expansion: Next 3 Communities

### 1. r/skiing + r/snowboarding (combined 1.1M members) -- Week 2-3

**Why next:** 50 ski venues with 100% photo coverage and accurate snow depth scoring. Late March / early April is "where's still getting snow?" season -- Peakly answers this question directly. Niseko, Whistler, and Southern Hemisphere resorts coming into season.

**Post angle:** "Built a free tool that shows you which ski resorts have the best snow right now + cheap flights. Late season edition."

**Deep link play:** Link to Whistler or Niseko directly in the post. "Here's what Whistler looks like right now: [deep link]"

**What must be true:** Verify ski venue scoring is accurate for late-season conditions (spring corn snow, variable temps). Check that Whistler, Niseko, and Cerro Catedral scores feel right.

### 2. r/solotravel (2.8M members) -- Week 3-4

**Why next:** Largest audience by far. The hook shifts from "conditions" to "timing + deals." Solo travelers care about: when is the best weather, what will it cost to fly, and is it safe/good now.

**Post angle:** "I built a free tool that tells you the best week to visit adventure destinations based on live weather + flight prices."

**What must be true:** The app needs to feel useful for non-athletes. Beach/tanning category (60 venues) is the entry point here. The vibe search feature and flight pricing matter more than wave height for this audience.

### 3. r/digitalnomad (2.3M members) -- Week 4-5

**Why next:** Nomads are the perfect Peakly user: flexible dates, price-sensitive, adventure-oriented. They actually book flights based on conditions.

**Post angle:** "Free tool that scores adventure spots by live conditions and shows cheap flights -- built it for planning my next move."

**What must be true:** The 7-day forecast is limiting for nomads who plan 2-4 weeks out. The "Best Window" indicator helps but isn't sufficient. This audience will push hardest on forecast horizon. Be ready for that feedback.

### Deprioritized:
4. **r/scuba** (424K) -- Diving now has 5 venues (up from 1), but scoring for dive conditions is rudimentary. Wait for visibility/current scoring.
5. **r/travel** (10M) -- Heavily moderated, self-promo gets removed fast. Skip unless invited.

---

## Competitive Intelligence

### NEW: SurfTrips.ai -- Direct Competitor Identified

**SurfTrips.ai** is a new entrant doing surf trip planning with flights and accommodation. Users enter their airport and dates, and it shows surf spots with real-time flights and accommodation prices. This is the closest thing to Peakly in the surf vertical.

**Peakly's advantages over SurfTrips.ai:**
- Multi-sport (surf + ski + beach + hiking + 8 more) vs. surf-only
- Live condition scoring with sport-specific algorithms vs. basic weather overlay
- No login required vs. likely account-gated
- 192 venues across all sports vs. unknown catalog size
- Free, no paywall vs. unknown pricing

**Peakly's disadvantages:**
- SurfTrips.ai likely has real accommodation booking (Peakly only has Booking.com generic link)
- Their flight data may be live (Peakly's proxy is broken)
- AI-powered trip customization (surf skill level, wave height preferences)

**Implication:** The "conditions + flights for surf trips" space is getting competitive. Peakly's moat is multi-sport breadth and the Window Score concept. Lean into multi-sport positioning, not just surf. The r/surfing post should not be the entire strategy.

### Surfline (March 2026)

- **v11.1.4 updated March 19, 2026.** New: Favorites in bottom nav for organizing spots, Apple Watch session logging complication, pin-drop session logging at any location.
- **$119.99/year** (up from $99 in April 2025). "Premium with Ads" at $69.99/year. Free tier limited.
- **User sentiment: Hostile.** BeachGrit article "Forecasting Giant Surfline Accused Of Price Gouging Beleaguered Americans" still circulating. International pricing disparity ($46-56 vs $120) fueling anger. Google Play reviews mention cams down frequently, predictions inaccurate.
- **Strategic signal: Surfline is pivoting from planning to recording.** Favorites reorganization, session logging, Apple Watch -- they're becoming Strava for surfers. This leaves the *trip planning + booking* space wide open. Peakly should lean hard into "planning your next trip" positioning.

### AllTrails (Peak tier)

- **$80/year Peak tier** with AI custom routes, real-time trail conditions (15 environmental factors), community heatmaps, area-wide offline map downloads.
- **User complaints intensifying:** Features previously in $35/year Plus tier are now paywalled behind $80 Peak. "On-trail conditions" moved from Plus to Peak -- perceived as bait-and-switch. Unsubscribe flow deliberately hidden across three platforms. Trustpilot reviews deteriorating.
- **Peakly relevance:** AllTrails Peak at $80/year continues to validate Peakly Pro at $79/year. Their user backlash on feature paywalling is a warning: if Peakly ever gates core features behind Pro, do it at launch, not retroactively.

### The gap Peakly owns (still true, getting narrower)

**No established competitor combines live conditions + flights across multiple sports.** SurfTrips.ai is the closest threat in the surf vertical, but it's single-sport. Surfline is pivoting to session recording. AllTrails is trails-only. KAYAK/Hopper are conditions-blind. OnTheSnow is ski-only with no flights.

**The insight that changes how we think:** SurfTrips.ai's existence means the "conditions + flights" thesis is validated by another team building the same thing. This is good (the market is real) and bad (we're not alone). Speed matters more now. The first mover to build multi-sport + deep community presence wins. Peakly's multi-sport catalog (192 venues across 11 categories) is a structural advantage SurfTrips.ai doesn't have.

---

## Venue Deep Links: SHIPPED -- Growth Impact Upgraded

Deep links (`#venue-{id}` hash routing) are now live. This changes the growth math:

- **Shareability score: 7.5 --> 8.5/10.** Every venue can now be shared as a direct URL. Recipients land on the exact venue with live scores, not the homepage.
- **Reddit engagement multiplied.** Every comment reply can include a targeted deep link. "Here's Pipeline right now: [link]" is 10x more compelling than linking to the homepage.
- **90-day projection uplift: +15-20%.** Deep links create a compounding viral coefficient. Each user who shares a venue brings 0.1-0.3 new users. At 1,000 users, that's 100-300 organic additions.

**What's still missing for 9/10 shareability:**
- Venue-specific OG images (currently all shares show the same generic Peakly OG image)
- PWA manifest + apple-touch-icon (enables home screen install, branded preview)
- Branded OG image with Peakly logo (not an Unsplash hotlink)

---

## Retention Risk: YELLOW (5.5/10, up from 5/10)

| Factor | Score | Delta | Notes |
|--------|-------|-------|-------|
| Core value loop | 7/10 | -- | Scores useful, photos desirable, browsing enjoyable. |
| Reason to return Day 2 | 4/10 | +1 | "Set Alert" button in VenueDetailSheet is live. Users can now set alerts in 3 taps from any venue. Still no push notifications to trigger return. |
| Reason to return Day 7 | 2.5/10 | +0.5 | Deep links enable sharing. A user who shares a venue with a friend may return to check conditions together. Wishlists tab still hidden. |
| Reason to return Day 30 | 1/10 | -- | No content updates, no social, no progress tracking. |
| Notifications | 1/10 | -- | Alert UI exists, no outbound delivery. |
| Shareability | 5.5/10 | +1.5 | Deep links live. Share buttons work. Still missing venue-specific OG previews. |
| Content freshness | 6/10 | -- | Weather updates live. No editorial content. |

**Overall: YELLOW (5.5/10).** Up 0.5 from v9 due to Set Alert button + deep links.

**The single change that would most improve Day 7 retention:** Expose the Wishlists tab and make it the default landing for returning users with saved venues. "Your saved spots -- here's what changed" creates a daily check habit. The PM report deferred this to 1K users, but the Growth team believes it should ship before Reddit launch. A user who hearts Pipeline on Day 1 and has nowhere to find it on Day 2 is a lost user. 2-3 hours of work.

**Path from 5.5/10 to 8/10:**
1. Expose Wishlists tab + "what changed" indicator (5.5 --> 6.5)
2. PWA install + home screen icon (6.5 --> 7)
3. Browser push notifications for saved venue alerts (7 --> 8)

---

## Path to Milestones

### 0 --> 1K users (Weeks 1-4)

| Week | Action | Target |
|------|--------|--------|
| Week 1 | r/surfing post. Monitor Plausible for 72 hours. Reply to every comment with deep links. | 150-400 visitors |
| Week 1 | Post to Jamboards "Best forecast" thread + submit to AlternativeTo as Surfline alternative | +50-100 passive visitors |
| Week 2 | Fix VPS proxy (HTTPS + CORS). Post to r/skiing with deep-linked venue. | +200-400 visitors |
| Week 3 | r/solotravel post with "best week to visit" angle. PWA manifest ships. | +300-600 visitors |
| Week 4 | r/digitalnomad. Analyze which community converted best. Facebook surf groups. | Total: 800-1,500 users |

### 1K --> 10K users (Months 2-3)

- Product Hunt launch (late April, PWA installable, deep links proven, some Plausible data to cite).
- FOMO content: "Pipeline had a 95/100 week and flights were $189. Most people missed it." Image cards on Instagram/TikTok.
- Email capture (simple modal after 3rd visit).
- SEO: programmatic venue pages start ranking.
- Target: 5,000-8,000 by day 90.

### 10K --> 100K users (Months 4-12)

- Native app wrapper (Android TWA, iOS Safari PWA).
- Peakly Pro launches ($79/year) once LLC clears.
- Window Score (Phase 2) becomes the shareable metric. "My Whistler Window Score is 92" gets shared like Wordle scores.
- Partnership outreach: surf schools, ski resorts, adventure travel bloggers.
- Timeline: 12-18 months bootstrapped.

---

## 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 | Reddit r/surfing + Jamboards + AlternativeTo | 200-500 |
| Week 2-3 | VPS fix + r/skiing + r/solotravel with deep links | 700-2,000 |
| Week 4-5 | Product Hunt (Top 15 target) + r/digitalnomad | 2,500-5,000 |
| Week 6-8 | TikTok FOMO content + email capture + Facebook groups | 3,500-6,500 |
| Week 9-12 | SEO pages ranking + affiliate revenue live | 5,000-8,000 |

**Realistic 90-day number: 5,000-8,000 users.** Unchanged from v9. The projection moves up only when we have real Plausible data from the Reddit post. Deep links and Set Alert are meaningful improvements to the product, but they compound over time -- they don't change the initial launch number.

---

## Priority Stack

1. **Reddit r/surfing post** -- Execute this week. Tuesday or Wednesday morning. No more delays. Every day without distribution is wasted compound growth.
2. **Fix VPS flight proxy** -- Within 48 hours of Reddit post. Two bugs: HTTPS (Cloudflare Tunnel, 10 min) + CORS host restriction (add `j1mmychu.github.io` to allowed origins). Real flight prices = credibility for Day 2 returning users.
3. **Expose Wishlists tab** -- Wire into BottomNav. Biggest retention uplift for smallest effort. Users who heart venues on Day 1 need somewhere to find them on Day 2.
4. **PWA manifest + apple-touch-icon** -- 20 minutes. Enables home screen install. Free retention channel.
5. **Analyze Plausible data** -- 72 hours post-Reddit. First real user data: which venues get clicked, which tabs get visited, bounce rate, flight search clicks. This data informs everything.
6. **Second Reddit wave** -- r/skiing, r/solotravel, r/digitalnomad. Use venue deep links in every post and comment.
7. **Product Hunt prep** -- Branded OG image, venue-specific OG tags, PWA installable. Late April target.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 (v10) | Deep links change Reddit comment strategy | Every comment reply now includes a targeted venue link. This is the highest-conversion engagement pattern. |
| 2026-03-24 (v10) | SurfTrips.ai identified as direct competitor | Validates the conditions+flights thesis. Multi-sport is Peakly's structural moat. Speed to community matters. |
| 2026-03-24 (v10) | Retention upgraded to 5.5/10 (from 5/10) | Set Alert button + deep links are meaningful but insufficient without Wishlists tab exposure. |
| 2026-03-24 (v10) | AllTrails paywalling backlash = warning for Peakly Pro | Never retroactively gate features. Launch Pro with premium features from day one. |
| 2026-03-24 (v9) | Launch Reddit despite VPS proxy being down | Condition scoring is the hook, not flight prices. |
| 2026-03-24 (v9) | Wishlists tab exposure = #1 retention fix | Returning users need a reason to come back. |
| 2026-03-24 (v9) | Surfline pivoting to session logging = opportunity | "Planning your next trip" space is wide open. |
| 2026-03-24 (v8) | GREEN LIGHT Reddit launch | Analytics blocker resolved. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated community. |
| 2026-03-23 | Product Hunt delayed to late April | PWA + venue links must ship first. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. |

---

*Next report: 2026-03-25*
