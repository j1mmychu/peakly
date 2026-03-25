# Peakly Growth Report: 2026-03-24 (v13)

---

## Reddit Launch: NO-GO

**Reason: VenueDetailSheet still has no photo hero and no sticky CTA.**

This is the 5th consecutive cycle flagging this blocker. The detail sheet is the primary conversion surface -- every card tap lands here. Without a photo hero, the experience goes from polished card with beautiful Unsplash image to a plain text sheet. Without a sticky CTA, Booking.com and Travelpayouts earn $0 because the "Book" button scrolls out of view. Launching to r/surfing with 785K members while the detail sheet looks unfinished wastes the single best first impression we get with that community.

**What's green:**
- 192 venues with 100% unique Unsplash photos
- HTTPS proxy live (peakly-api.duckdns.org) -- real flight prices loading
- Plausible analytics wired with 5 custom events
- PWA manifest + service worker deployed
- SEO at 91% with JSON-LD structured data
- Deep links working for venue sharing
- Set Alert button in VenueDetailSheet
- Date-aware scoring + best window indicator on cards
- Swipe-down dismiss gesture

**What's red:**
- VenueDetailSheet: no photo hero, no sticky CTA, no score breakdown (gates launch)
- Open-Meteo weather cache not built (~30 concurrent users exhausts free tier)
- Sentry DSN still empty (zero crash visibility)
- ListingCard "Book" button still missing Plausible event (4th consecutive miss)

**GO criteria:** Ship VenueDetailSheet photo hero + sticky CTA + score validation thumbs. Then GO immediately. The Reddit post draft below is ready to paste.

---

## Exact r/surfing Post Draft (Copy-Paste Ready)

**Subreddit:** r/surfing (785K members)

**Post type:** Text post

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
for 50+ surf spots worldwide and scores each one with a live condition rating. You can check
spots like Uluwatu, Hossegor, Puerto Escondido, Pipeline -- each gets scored based on what's
actually happening today, plus a 7-day forecast showing the best window to go.

It also covers 190+ spots across skiing, beach/tanning, diving, kite, climbing, and hiking --
so if you're planning a multi-sport trip or traveling with non-surfers, it handles that too.

What it does:
- Live condition scoring for 50+ surf spots (Open-Meteo marine data -- swell period, wave
  height, wind direction, water temp)
- 7-day forecast with "best window" indicator -- which day this week has the best setup
- Real flight prices from your home airport
- Filter by surf, ski, beach, kite, and more (190+ total spots)
- No login, no paywall, works on any phone browser. Add to home screen like an app.

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

**No changes from v12 draft.** The post is problem-statement-led, accurate to current venue counts, and includes the "What it does NOT do" section to preempt criticism. Title hooks on the relatable pain point (multi-app juggling) rather than boasting numbers.

### Posting timing:
**Tuesday or Wednesday, 9-11am Eastern (6-8am Pacific).** Catches West Coast surfers checking conditions before dawn patrol. Avoid weekends -- lower engagement, mod response slower.

### Reddit comment strategy with deep links:
When someone asks about a specific spot, reply with a venue deep link:
- "Here's Pipeline's live conditions right now: https://j1mmychu.github.io/peakly/#venue-pipeline"
- "Check Uluwatu: https://j1mmychu.github.io/peakly/#venue-uluwatu"
- "Here's what Hossegor looks like today: https://j1mmychu.github.io/peakly/#venue-hossegor"

If a requested spot is missing, add it and reply with the link within 24 hours. That responsiveness builds trust and demonstrates active development.

### 3 r/surfing threads from the past 30 days where Peakly would have been genuinely helpful:

1. **"Planning first surf trip -- Bali vs Costa Rica vs Portugal?"** -- Peakly answers this with live condition scores + flight prices for all three, side by side. No other tool does this comparison.
2. **"Best time to go to Puerto Escondido?"** -- Peakly's 7-day forecast and best-window indicator gives a data-driven answer instead of "May-August bro."
3. **"Surfline alternatives since MSW died?"** -- Direct target. Peakly isn't a Surfline replacement for daily local checks, but for trip planning it fills the gap MSW left.

### Failure mode diagnosis:
- **3 upvotes, removed by mods** -- self-promo rules triggered. Pivot: comment in a "what forecast app do you use?" thread instead. Never repost.
- **3 upvotes, not removed** -- hook didn't land. Reframe as: "I scored every major surf spot by today's conditions -- here are the top 10 right now" with Peakly link in comments only.
- **50+ upvotes but low click-through** -- post is compelling but link isn't converting. Add screenshot of a venue card showing "Firing" badge to a follow-up comment.
- **Post gets engagement but app doesn't load** -- check Plausible. If 0 pageviews despite upvotes, it's a Babel transpile failure or CDN issue.
- **Users complain scoring is wrong** -- this is expected. Respond with "thanks, adjusting that now" and actually recalibrate. Score validation thumbs up/down (shipping with detail sheet) will systematize this.

### Pre-posting checklist (Jack must do):
1. Open https://j1mmychu.github.io/peakly/ on your phone. Confirm it loads and shows venue cards with photos.
2. Tap a surf venue -- confirm detail sheet opens with photo hero, real weather data, and a flight price (not "est.").
3. Verify your Reddit account has 50+ karma and is 30+ days old on r/surfing. If not, spend 1-2 weeks commenting genuinely first.
4. Check Plausible dashboard -- confirm pageviews are recording.

---

## Post-Reddit Expansion: Next 3 Communities

### 1. r/skiing + r/snowboarding (combined 1.1M members) -- Week 2-3

**Why next:** 50 ski venues is the second-strongest category. Late March / early April is peak "where's still getting snow?" season. Peakly answers this directly with live snow depth + condition scoring + flights. Southern Hemisphere resorts (June-September) give a second post angle in 2 months.

**Post angle:** "Built a free tool that scores 50 ski resorts by real-time snow conditions + shows cheap flights. Late season edition -- where's still getting powder?"

**What must be true:** Verify ski venue scoring produces sensible results for late-season conditions. Spring corn snow and variable temps should produce moderate scores, not artificially high or low.

### 2. r/solotravel (2.8M members) -- Week 3-4

**Why next:** Largest audience by far. The hook shifts from "conditions" to "timing + deals." Solo travelers care about: best weather week, flight cost, is it worth going now. The 60 beach/tanning venues (largest category) are the entry point.

**Post angle:** "I built a free tool that tells you the best week to visit 190+ adventure destinations based on live weather + real flight prices."

**What must be true:** Flight pricing must feel reliable, not "est." everywhere. Beach venue scoring should produce clear good/bad signals that a non-athlete can interpret.

### 3. r/digitalnomad (2.3M members) -- Week 4-5

**Why next:** Nomads are the ideal Peakly user: flexible dates, price-sensitive, adventure-oriented. They actually book flights based on conditions + price alignment.

**Post angle:** "Free tool that scores 190+ adventure spots by live conditions and shows cheap flights -- built it for planning my next move."

**What must be true:** 7-day forecast is limiting for nomads who plan 2-4 weeks out. Be ready for feedback pushing on forecast horizon. This audience will push hardest toward the Phase 3 "Forecast Horizon" feature.

### Deprioritized:
4. **r/scuba** (424K) -- Only 5 dive venues. Scoring is rudimentary. Wait for 15+ dive venues.
5. **r/travel** (10M) -- Heavily moderated, self-promo gets removed within hours. Skip unless organically invited.

---

## Competitive Intelligence

### Surfline's AI pivot creates a wider gap for trip planning

Surfline's March 2026 update doubled down on **session recording and cam AI** (Smart Cams, wave detection, auto-clipped replays, Apple Watch logging). This is the opposite direction from trip planning. They're investing in "what happened during your session" while Peakly owns "when should you go." Every dollar Surfline puts into session replay is a dollar not spent on the trip planning space Peakly occupies.

**Premium+ at $149.99/yr (3 accounts, shareable)** suggests they're squeezing existing power users rather than expanding to casual trip planners. The $120/yr price anger is accelerating -- BeachGrit ran a "price gouging" headline, App Store 1-star reviews cite the crippled free tier (3-5 checks/week), and "surfline alternative" search volume is spiking.

### SurfTrips.ai remains the closest direct competitor

Surf-only, 500+ breaks, flight comparison + accommodation. No live scoring, no alerts, no multi-sport. With 53 surf venues vs their 500+, Peakly loses on catalog size in the surf vertical alone. The differentiator must be: (a) live condition scoring they don't have, (b) multi-sport breadth they can't match, (c) alerts for condition + price alignment.

**If SurfTrips.ai adds live scoring, threat goes from MODERATE-HIGH to HIGH.** Monitor monthly.

### AllTrails Peak ($79.99/yr) validates Peakly Pro pricing

AllTrails Peak launched AI custom route creation + outdoor lens (plant/insect ID) + community heatmaps at $79.99/yr. Users see it as genuinely useful, not a cash grab. This validates Peakly Pro at $79/yr. Key lesson: **Pro features must feel like magic, not paywalled basics.** AllTrails is getting praise because Peak features (AI routes, outdoor lens) are things the free tier never had. Peakly Pro must follow this pattern -- extended forecasts, strike missions, historical data are all genuinely new capabilities, not gated versions of existing ones.

### The insight that changes how we think about the product

**Surfline's crippled free tier (3-5 condition checks per week) is creating a generation of surfers who resent paying for weather data.** Peakly's unlimited free tier with no login is not just a feature -- it's a political position. The Reddit post should lean into this harder. "No login, no paywall" isn't just convenience -- it's a direct counter to the Surfline model that surfers are actively rebelling against. Every frustrated Surfline user who discovers Peakly's free, unlimited condition checks becomes an evangelist. The free tier IS the growth engine.

---

## Retention Risk: YELLOW (5.5/10, unchanged from v12)

| Factor | Score | Notes |
|--------|-------|-------|
| Core value loop | 7/10 | 192 venues browseable, condition scoring creates "check back" behavior |
| Reason to return Day 2 | 4.5/10 | Real flight prices + Set Alert button. "Did conditions change?" is a natural return trigger |
| Reason to return Day 7 | 2.5/10 | Deep links enable sharing. Wishlists tab still hidden. No push notifications |
| Reason to return Day 30 | 1/10 | No content updates, no social, no progress tracking |
| Notifications | 1/10 | Alert UI exists but no outbound delivery mechanism |
| Shareability | 6/10 | Deep links + PWA install. Missing venue-specific OG previews |
| Content freshness | 5.5/10 | Weather updates keep it dynamic. 192 venues limits discovery surface |
| PWA stickiness | 3/10 | Home screen install available. No push notifications |

**Overall: YELLOW (5.5/10).** Unchanged from v12. No retention-impacting features shipped since last report.

**What brings a user back:**
- **Day 2:** "I wonder if conditions changed at that spot." Flight price curiosity. This works only if the detail sheet was compelling enough on Day 1 to create a bookmark-worthy impression.
- **Day 7:** A friend asks "where should we go?" and the user remembers Peakly. Deep link sharing makes this possible. Only works if they saved the venue (Wishlists tab still hidden).
- **Day 30:** Nothing. There is no Day 30 retention mechanism today. Alerts exist but don't push. No email, no notification, no content.

**Is shareability at 7.5/10 good enough?** Revised down to 6/10 in this report. The missing venue-specific OG images are more costly than previously estimated. When a user shares a Pipeline deep link in iMessage, the preview shows a generic Peakly image, not Pipeline. That generic preview gets ignored. A Pipeline-specific preview with wave photo + condition score would get tapped. This is the difference between viral sharing and dead links.

**What would make shareability 9/10:**
1. Venue-specific OG images (requires server-side rendering or dynamic image service -- out of scope for current architecture)
2. "Share this score" button that generates a screenshot-ready card image client-side (feasible with canvas API, ~4 hrs dev work)

**The single change that would most improve Day 7 retention:** Expose the Wishlists tab. A user who hearts Pipeline on Day 1 and has nowhere to find it on Day 2 is a lost user. This is a wiring change, not new code. The component exists.

---

## Path to Milestones

### 0 to 1K users (Weeks 1-4)

| Week | Action | Target |
|------|--------|--------|
| Week 0 (NOW) | Ship VenueDetailSheet photo hero + sticky CTA + score validation. Ship Open-Meteo weather cache. Jack: Sentry DSN (5 min). | Prerequisites cleared |
| Week 1 | r/surfing post (Tuesday/Wednesday 9-11am ET). Reply to every comment with deep links + screenshots. Submit to AlternativeTo as Surfline alternative. | 150-400 visitors |
| Week 2 | r/skiing post with "where's still getting snow?" angle. Monitor Plausible: which venues get clicked, bounce rate, referrer quality. | +150-350 visitors |
| Week 3 | r/solotravel post. Beach venues as entry point. | +200-500 visitors |
| Week 4 | r/digitalnomad. Analyze Plausible data across all 4 launches. Double down on the community that converted best. | Total: 600-1,400 users |

### 1K to 10K users (Months 2-3)

- Product Hunt launch (target late April). Needs: polished screenshots, a demo GIF, Plausible data to cite in the description.
- FOMO content: "Pipeline had a 95/100 week and flights were $189. Most people missed it." Image cards on Instagram/TikTok.
- Expand venue count back toward 300+ with unique photos. Surf and ski first.
- Email capture (simple modal after 3rd visit). First retention mechanism that works outside the app.
- Hacker News "Show HN" post -- technical audience will appreciate the no-build-step, single-file architecture.
- Target: 4,000-8,000 by day 90.

### 10K to 100K users (Months 4-12)

- Native app wrapper (Android TWA, iOS Safari PWA clip).
- Peakly Pro launches ($79/year) once LLC clears.
- Window Score (Phase 2) becomes the shareable metric. "Pipeline is at 92 right now" -- that's the quote users share.
- Partnership outreach: surf schools, ski resorts, adventure travel bloggers. Each partnership = a deep link in their content pointing to Peakly.
- Timeline: 12-18 months bootstrapped.

---

## 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 | Reddit r/surfing + AlternativeTo | 150-450 |
| Week 2-3 | r/skiing + r/solotravel with deep links | 500-1,800 |
| Week 4-5 | Product Hunt (Top 15 target) + r/digitalnomad | 1,800-4,500 |
| Week 6-8 | TikTok FOMO content + email capture + Facebook surf groups | 3,000-6,500 |
| Week 9-12 | SEO + venue expansion to 300+ + repeat Reddit engagement | 4,500-8,000 |

**Realistic 90-day number: 4,500-8,000 users.** Unchanged from v12. No product changes have shipped that would revise the projection in either direction. The upside scenario (8K) assumes: (a) VenueDetailSheet ships this week, (b) venue expansion to 300+ in months 2-3, (c) at least one Reddit post goes viral (100+ upvotes).

---

## Priority Stack

1. **Ship VenueDetailSheet photo hero + sticky CTA + score validation thumbs** -- This is the launch gate. 5th consecutive report flagging it. Nothing else matters until this ships.
2. **Open-Meteo weather cache** -- localStorage, 30-min TTL. Without this, a successful Reddit post kills the app at ~30 concurrent users. Must ship before Reddit post.
3. **Sentry DSN** -- Jack, 5 minutes. Do it today. When Reddit users find bugs, you need to see them before the complaints hit the thread.
4. **Expose Wishlists tab** -- Biggest retention uplift for smallest effort. Wire into BottomNav within 48 hours of Reddit post.
5. **Reddit r/surfing post** -- Execute the morning after items 1-3 are confirmed live.
6. **Monitor Plausible 72 hours post-Reddit** -- First real data on which venues get clicked, bounce rate, flight click rate, PWA install rate.
7. **Second Reddit wave** -- r/skiing (Week 2), r/solotravel (Week 3), r/digitalnomad (Week 4).

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 (v13) | Reddit launch downgraded to NO-GO until detail sheet ships | 5th consecutive cycle. Launching with a plain-text detail sheet after showing polished photo cards wastes the first impression on 785K surfers. |
| 2026-03-24 (v13) | Shareability revised down from 7.5/10 to 6/10 | Generic OG preview on shared links is worse than previously assessed. Venue-specific previews needed for viral sharing. |
| 2026-03-24 (v13) | Surfline's crippled free tier reframed as Peakly's political advantage | "No login, no paywall" should be marketed as a stance, not just a feature. |
| 2026-03-24 (v12) | 90-day projection: 4.5K-8K (from 6K-10K in v11) | 192 venues vs 472 reduces headline hook and discovery surface. |
| 2026-03-24 (v12) | Reddit title: problem-statement hook over number hook | "Tired of switching between Surfline and Google Flights" > "50+ surf spots" |
| 2026-03-24 (v12) | Competitive moat: multi-sport breadth over venue count | 11 categories + flights is the differentiator. No competitor covers this. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated community. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. |

---

*Next report: 2026-03-25*
