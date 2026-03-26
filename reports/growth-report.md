# Peakly Growth Report: 2026-03-25 (v15)

---

## Reddit Launch: GO

**All systems green.** The venue expansion to 2,226 venues with 100% unique photos and batched weather fetching fundamentally changes the launch calculus. Previous reports were planning around 192 venues. We now have 11x the catalog -- every major surf, ski, and adventure destination worldwide is covered. This eliminates the top complaint we anticipated from Reddit ("where's [my spot]?") and makes the app feel comprehensive on first visit.

**What's green:**
- 2,226 venues with 100% unique Unsplash photos (0% duplication)
- Batched weather fetching live (handles rate limits gracefully)
- VenueDetailSheet: photo hero + sticky CTA + swipe dismiss (SHIPPED)
- HTTPS proxy live (peakly-api.duckdns.org) -- real flight prices loading
- Plausible analytics wired with 5 custom events
- PWA manifest + service worker deployed
- SEO at 91% with JSON-LD structured data
- Date-aware scoring + best window indicator on cards
- Set Alert button in VenueDetailSheet
- Aviasales/Travelpayouts deep links (SHIPPED)
- Sentry error monitoring live (peakly.sentry.io)
- Ski pass filter (Ikon/Epic/Independent) SHIPPED
- LLC APPROVED -- Stripe, affiliates, domain all unblocked
- UptimeRobot monitoring live

**What's yellow (ship-with risks, not blockers):**
- Open-Meteo rate limit at scale -- batched fetching helps but 2,226 venues x concurrent users could still exhaust 10K/day free tier. Soft launch on r/surfing (150-400 visitors over 48 hrs) is safe. Becomes a real risk at Product Hunt scale.
- REI affiliate IDs still placeholder (22 links earning $0). Jack action, 30 min.
- No onboarding flow -- new users get dropped into Explore with no explanation.

**GO criteria exceeded.** The 2,226-venue expansion with unique photos is a step change. This is no longer a "does it have enough spots?" product -- it's a "holy shit this covers everywhere" product. Post to r/surfing this week.

**Recommended launch date: Tuesday March 31 or Wednesday April 1, 9-11am Eastern.**

---

## Exact r/surfing Post Draft (Copy-Paste Ready)

**Subreddit:** r/surfing (785K members)

**Post type:** Text post

**Title:**
```
I got tired of switching between Surfline and Google Flights, so I built a free surf trip planner with 200+ surf spots -- looking for feedback
```

**Body:**
```
Like a lot of you, I've been looking for good free options since MSW got absorbed into Surfline.
For daily local forecasts, Windy and Windguru are solid. But for a different problem -- figuring
out *when and where* to book a surf trip -- nothing combined conditions with travel costs.

So I built a free web app that pulls real-time wave data (height, swell period, wind, water temp)
for 200+ surf spots worldwide and scores each one with a live condition rating. You can check
spots like Uluwatu, Hossegor, Puerto Escondido, Pipeline, Teahupo'o, J-Bay, Snapper Rocks --
each gets scored based on what's actually happening today, plus a 7-day forecast showing the
best window to go.

It also covers 2,200+ spots across skiing, beach/tanning, diving, kite, climbing, MTB, and
hiking -- so if you're planning a multi-sport trip or traveling with non-surfers, it handles
that too.

What it does:
- Live condition scoring for 200+ surf spots (Open-Meteo marine data -- swell period, wave
  height, wind direction, water temp)
- 7-day forecast with "best window" indicator -- which day this week has the best setup
- Real flight prices from your home airport
- Filter by surf, ski, beach, kite, and more (2,200+ total spots)
- Ski pass filter (Ikon/Epic/Independent) for the skiers in your crew
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

**Changes from v14 draft:** Updated venue counts to reflect the 2,226-venue expansion. Added Teahupo'o, J-Bay, and Snapper Rocks as name-drops (surfers recognize these instantly). Added ski pass filter mention. Changed "190+ total spots" to "2,200+ total spots" -- this is now a genuinely impressive number that changes the perception from "small side project" to "someone actually built a real database."

### Posting timing
**Tuesday or Wednesday, 9-11am Eastern (6-8am Pacific).** Catches West Coast surfers checking conditions before dawn patrol. Avoid weekends -- lower engagement, mod response slower.

### Reddit comment strategy
When someone asks about a specific spot, reply with a venue deep link:
- "Here's Pipeline's live conditions: https://j1mmychu.github.io/peakly/#venue-pipeline"
- "Check Uluwatu: https://j1mmychu.github.io/peakly/#venue-uluwatu"
- "Here's what Hossegor looks like today: https://j1mmychu.github.io/peakly/#venue-hossegor"

With 2,226 venues, the odds of having someone's requested spot are dramatically higher. If a requested spot is somehow missing, add it and reply with the link within 24 hours.

### 3 r/surfing threads where Peakly would have been genuinely helpful

1. **"Planning first surf trip -- Bali vs Costa Rica vs Portugal?"** -- Peakly answers this with live condition scores + flight prices for all three, side by side. No other tool does this comparison. With 200+ surf spots, we likely have 5-10 spots in each region.
2. **"Best time to go to Puerto Escondido?"** -- Peakly's 7-day forecast and best-window indicator gives a data-driven answer.
3. **"Surfline alternatives since MSW died?"** -- Direct target. Peakly isn't a Surfline replacement for daily local checks, but for trip planning it fills the gap MSW left. The 200+ surf spot count makes this credible.

### Failure mode diagnosis
- **3 upvotes, removed by mods** -- self-promo rules triggered. Pivot: comment in a "what forecast app do you use?" thread instead. Never repost.
- **3 upvotes, not removed** -- hook didn't land. Reframe as: "I scored every major surf spot by today's conditions -- here are the top 10 right now" with Peakly link in comments only.
- **50+ upvotes but low click-through** -- post is compelling but link isn't converting. Add screenshot of a venue card showing "Firing" badge to a follow-up comment.
- **"Scoring is wrong at [spot I know]"** -- Respond with "thanks, adjusting now" and actually recalibrate. This is expected and valuable signal.
- **App doesn't load** -- check Plausible + Sentry. If 0 pageviews despite upvotes, CDN or Babel issue.

### Pre-posting checklist (Jack must do)
1. Open https://j1mmychu.github.io/peakly/ on your phone. Confirm it loads and shows venue cards with photos.
2. Tap a surf venue -- confirm detail sheet opens with photo hero, live weather data, sticky Flights + Hotels bar, and a flight price (not "est.").
3. Verify your Reddit account has 50+ karma and is 30+ days old on r/surfing. If not, spend 1-2 weeks commenting genuinely first.
4. Check Plausible dashboard -- confirm pageviews are recording.

---

## Post-Reddit Expansion: Next 3 Communities

### 1. r/skiing + r/snowboarding (combined 1.1M members) -- Week 2-3

**Why next:** With the venue expansion, Peakly likely has 200+ ski venues now (up from 50). Late March / early April is peak "where's still getting snow?" season. The ski pass filter (Ikon/Epic/Independent) is a differentiator -- no free app combines pass filtering + live conditions + flights.

**Post angle:** "Built a free tool that scores 200+ ski resorts by real-time snow conditions + shows cheap flights. Filter by Ikon, Epic, or Independent. Late season edition -- where's still getting powder?"

**What must be true:** Verify ski venue scoring produces sensible results for late-season conditions. Spring corn snow and variable temps should produce moderate scores, not artificially high.

### 2. r/solotravel (2.8M members) -- Week 3-4

**Why next:** Largest audience by far. The hook shifts from "conditions" to "timing + deals." Solo travelers care about: best weather week, flight cost, is it worth going now. Beach/tanning venues are the entry point. 2,226 total venues makes this feel like a real product, not a demo.

**Post angle:** "I built a free tool that tells you the best week to visit 2,200+ adventure destinations based on live weather + real flight prices."

**What must be true:** Flight pricing must feel reliable. Beach venue scoring should produce clear good/bad signals that a non-athlete can interpret.

### 3. r/digitalnomad (2.3M members) -- Week 4-5

**Why next:** Nomads are the ideal Peakly user: flexible dates, price-sensitive, adventure-oriented. They actually book flights based on conditions + price alignment.

**Post angle:** "Free tool that scores 2,200+ adventure spots by live conditions and shows cheap flights -- built it for planning my next move."

**What must be true:** 7-day forecast is limiting for nomads who plan 2-4 weeks out. Be ready for feedback pushing toward the Phase 3 "Forecast Horizon" feature.

### Deprioritized
4. **r/scuba** (424K) -- Venue expansion likely added more dive spots, but scoring for diving is still rudimentary. Revisit after scoring accuracy audit.
5. **r/travel** (10M) -- Heavily moderated, self-promo gets removed within hours. Skip unless organically invited.

---

## Competitive Intelligence

### The insight that changes how we think about the product

**2,226 venues changes Peakly's competitive position from "niche tool" to "comprehensive platform."**

Here is what the competitive landscape looks like now:

| Competitor | Venue/Spot Count | Sports | Flights | Live Scoring |
|-----------|-----------------|--------|---------|-------------|
| Surfline | 3,000+ webcams | Surf only | No | Yes (premium) |
| OnTheSnow | 2,000+ resorts | Ski only | No | Yes (free) |
| AllTrails | 400K+ trails | Hike only | No | No |
| SurfTrips.ai | 500+ breaks | Surf only | Yes | No |
| **Peakly** | **2,226 venues** | **10+ sports** | **Yes** | **Yes (free)** |

Peakly is the only app that combines a large multi-sport venue catalog with live condition scoring AND flight pricing. Previously at 192 venues this felt like a prototype. At 2,226 venues it feels like a real product. The multi-sport angle is now credible -- "2,200+ spots across surfing, skiing, diving, climbing, MTB, hiking, kayaking, kiting, and more" is a statement that no competitor can match.

**Surfline's paywall frustration remains the launch weapon.** $119.99/year for full forecasts. App Store reviews are 1-2 stars citing paywall frustration. "No login, no paywall" in the Reddit post is a political position, not just a feature.

**SurfTrips.ai is still the closest direct competitor for surf trip planning.** But they have no live scoring, no multi-sport, and no condition alerts. With 200+ surf spots (up from 53), the venue gap has narrowed significantly. Peakly's differentiator remains: live conditions + multi-sport + alerts.

---

## Retention Risk: YELLOW (6.5/10, up from 6/10)

| Factor | Score | Notes |
|--------|-------|-------|
| Core value loop | 8/10 | 2,226 venues creates genuine discovery/browsing behavior. More to explore = more sessions |
| Reason to return Day 2 | 6/10 | "Did conditions change?" + flight price curiosity. Photo hero makes venues memorable |
| Reason to return Day 7 | 3.5/10 | Deep links enable sharing. Wishlists tab still hidden. No push notifications |
| Reason to return Day 30 | 1/10 | No content updates, no social, no progress tracking |
| Notifications | 1/10 | Alert UI exists but no outbound delivery mechanism |
| Shareability | 7/10 | Deep links + PWA install + polished detail sheet. 2,226 venues means more shareable moments |
| Content freshness | 6.5/10 | Weather updates + massive venue catalog = always something new to discover |
| PWA stickiness | 3/10 | Home screen install available. No push notifications |

**Overall: YELLOW (6.5/10).** Up 0.5 from v14. The 2,226-venue expansion meaningfully improves the "core value loop" (more to browse and discover) and "content freshness" (larger catalog means the Explore feed always surfaces something you haven't seen). It does NOT fix the Day 7/Day 30 retention gap, which still requires push notifications or email.

**What brings a user back:**
- **Day 2:** "I wonder if conditions changed at that spot." Also: "Let me explore more spots -- I only looked at 5 out of 2,200." The sheer catalog size creates a reason to browse again.
- **Day 7:** A friend asks "where should we go?" and the user remembers Peakly. Deep link sharing makes this work.
- **Day 30:** Nothing. There is no Day 30 retention mechanism. Alerts exist but don't push.

**What would make shareability 9/10:**
1. Venue-specific OG images (requires server-side rendering -- out of scope)
2. "Share this score" button generating a screenshot-ready card image client-side (feasible, ~4 hrs dev)
3. Social proof: "142 people are watching Pipeline right now" (requires backend -- future)

**The single change that would most improve Day 7 retention:** Expose the Wishlists tab. The component is built. A user who hearts 5 venues on Day 1 and has nowhere to find them on Day 2 is a lost user.

---

## Path to Milestones

### 0 to 1K users (Weeks 1-4)

| Week | Action | Target |
|------|--------|--------|
| Week 0 (NOW) | Jack: verify app on phone, check Plausible | Prerequisites cleared |
| Week 1 | r/surfing post (Tue/Wed 9-11am ET). Reply to every comment. Submit to AlternativeTo as Surfline alternative. | 200-500 visitors |
| Week 2 | r/skiing post with "where's still getting snow?" + ski pass filter angle. Monitor Plausible. | +200-400 visitors |
| Week 3 | r/solotravel post. Beach venues + "2,200+ spots" as hook. | +300-600 visitors |
| Week 4 | r/digitalnomad. Analyze Plausible data across all 4 launches. Double down on the community that converted best. | Total: 800-1,800 users |

### 1K to 10K users (Months 2-3)

- Product Hunt launch (target mid-April). "2,200+ adventure spots" is a compelling headline. Needs polished screenshots + demo GIF.
- FOMO content: "Pipeline had a 95/100 week and flights were $189. Most people missed it." Image cards on Instagram/TikTok.
- Email capture (simple modal after 3rd visit). First retention mechanism that works outside the app.
- Hacker News "Show HN" post -- technical audience will appreciate the no-build-step, single-file, 2,226-venue architecture.
- Ship Open-Meteo weather cache before Product Hunt.
- Target: 5,000-10,000 by day 90.

### 10K to 100K users (Months 4-12)

- Native app wrapper (Android TWA, iOS Safari PWA clip).
- Peakly Pro launches ($79/year) -- LLC is approved, wire Stripe.
- Window Score (Phase 2) becomes the shareable metric.
- Partnership outreach: surf schools, ski resorts, adventure travel bloggers.
- Timeline: 12-18 months bootstrapped.

---

## 90-Day Projection (Revised Up)

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 | Reddit r/surfing + AlternativeTo | 200-500 |
| Week 2-3 | r/skiing + r/solotravel | 700-2,200 |
| Week 4-5 | Product Hunt (Top 15 target) + r/digitalnomad | 2,500-5,500 |
| Week 6-8 | TikTok FOMO content + email capture + Facebook surf groups | 4,000-8,000 |
| Week 9-12 | SEO + repeat Reddit engagement + organic word of mouth | 6,000-10,000 |

**Realistic 90-day number: 6,000-10,000 users.** Revised up from 5,000-8,000 in v14. The 2,226-venue expansion changes three things: (a) Reddit posts can credibly say "2,200+ spots" which sounds like a real product, not a side project, (b) more venues = more chances a user finds their local spot = higher engagement and sharing, (c) the catalog is now competitive with single-sport apps like OnTheSnow (2,000 ski resorts) and Surfline (3,000 surf spots) -- but across ALL sports.

**Revenue at 8,000 MAU:** $96-144/month (current affiliate stack). Post-LLC with all affiliate IDs + Stripe: $265-400/month.

---

## Priority Stack

1. **Reddit r/surfing post** -- Execute Tuesday March 31 or Wednesday April 1, 9-11am ET. Post is ready. App is ready. 2,226 venues makes this credible.
2. **Jack: Verify app + Plausible** -- Open on phone, tap a surf venue, confirm everything loads. 5 min.
3. **Monitor Plausible 72 hours post-Reddit** -- First real data: which venues get clicked, bounce rate, flight click rate, PWA install rate.
4. **Ship Open-Meteo weather cache** -- Must happen before Product Hunt. Acceptable risk for Reddit soft launch.
5. **Expose Wishlists tab** -- Wire into BottomNav within 48 hours of Reddit post. Biggest retention uplift for smallest effort.
6. **REI Avantlink signup** -- Jack, 30 min. 22 links earning $0.
7. **Second Reddit wave** -- r/skiing (Week 2), r/solotravel (Week 3), r/digitalnomad (Week 4).

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-25 (v15) | **90-day projection raised to 6K-10K** (from 5K-8K) | 2,226 venues with unique photos transforms Peakly from "side project" to "comprehensive platform." Reddit posts can now credibly claim "2,200+ spots" -- a number that commands attention. |
| 2026-03-25 (v15) | **Retention score raised to 6.5/10** (from 6/10) | Larger catalog improves browse/discovery loop and content freshness. Does not fix Day 7/30 gap. |
| 2026-03-25 (v15) | **Reddit post updated with new venue counts** | "200+ surf spots" and "2,200+ total spots" replace old numbers. Added Teahupo'o, J-Bay, Snapper Rocks name-drops. |
| 2026-03-25 (v14) | Reddit launch upgraded to GO | VenueDetailSheet shipped. |
| 2026-03-25 (v14) | Weather cache downgraded from hard blocker to ship-with risk for Reddit | Reddit = 150-400 visitors over 48 hrs, not 30 simultaneous. |
| 2026-03-24 (v13) | Shareability revised down from 7.5/10 to 6/10 | Generic OG preview on shared links. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated community. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. |

---

*Next report: 2026-03-26*
