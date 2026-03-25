# Peakly Growth Report: 2026-03-24 (v12)

---

## Reddit Launch: GO

Launch readiness remains green. The venue trim from 472 to 192 changes the marketing narrative but does not change the GO decision.

**What changed since v11:**

- **Venues trimmed from 472 to 192 with 100% unique Unsplash photos.** The bulk surf expansion (333 surf spots) was reverted. Current breakdown: 60 tanning/beach, 53 surfing, 50 skiing, 12 hiking, 5 diving, 4 kite, 4 climbing, plus paraglide/mtb/kayak/fishing (1 each). Every venue now has a unique, high-quality photo. No duplicates, no placeholder images.
- **breakType metadata largely lost.** Only 3 surf venues retain breakType (beach/point/reef). The UI code still renders it when present, but 50 of 53 surf venues no longer have the field. This was collateral from the revert.
- **All other improvements retained.** HTTPS proxy, Plausible analytics, PWA manifest + service worker, deep links, swipe gestures, date-aware scoring, profile personalization, alert filters, flight error handling, expanded airports -- all still live and working.

**What this means for growth:**

The quality-over-quantity bet is correct. 192 venues with unique photos is a better first impression than 472 with duplicate or missing photos. Reddit users will click through, see polished venue cards, and trust the product. A venue with a beautiful photo and accurate scoring converts to a saved favorite. A venue with a recycled stock photo does not.

The trade-off: we lose the "333 surf spots" headline number. The new hook must be about quality and breadth, not raw count.

**No remaining blockers for Reddit launch.**

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

### Changes from v11 draft:
- **"50+ surf spots"** replaces "333 surf spots" -- accurate to current 53 surf venues. Rounded down because overclaiming erodes trust.
- **"190+ spots across skiing, beach/tanning, diving..."** replaces "470+ total spots" -- accurate to 192 venues. The multi-sport angle is still a differentiator, just frame it as breadth not volume.
- **Removed break type mention.** Only 3 venues have breakType data. Claiming this as a feature would disappoint users who check.
- **Title drops the number.** "333 spots" was the hook; without that number, the hook shifts to the problem statement: "tired of switching between Surfline and Google Flights." This is actually a stronger hook because it's relatable rather than boastful.
- **Multi-sport paragraph added.** With fewer surf venues, the breadth across 11 categories becomes a stronger selling point. Non-surfer travel companions is a real use case.
- Everything else unchanged: MSW pain point lead, "What it does NOT do" section, specific question prompts, link placement after the pitch.

### Posting timing:
**Tuesday or Wednesday, 9-11am Eastern (6-8am Pacific).** Catches West Coast surfers checking conditions before dawn patrol. Avoid weekends.

### Reddit comment responses with deep links:
When someone asks about a specific spot, reply with a venue deep link:

- "Here's Pipeline's live conditions right now: https://j1mmychu.github.io/peakly/#venue-pipeline"
- "Check Uluwatu: https://j1mmychu.github.io/peakly/#venue-uluwatu"
- "Here's what Hossegor looks like today: https://j1mmychu.github.io/peakly/#venue-hossegor"

53 surf spots is still enough to cover most spots someone would ask about. If a requested spot is missing, that's valuable product feedback -- add it and reply with the link.

### Failure mode diagnosis:
- **3 upvotes, removed by mods** -- self-promo rules triggered. Pivot: comment in a "what forecast app do you use?" thread instead.
- **3 upvotes, not removed** -- hook didn't land. Reframe: "I scored every major surf spot by today's conditions -- here are the top 10 right now" with Peakly link in comments only.
- **50+ upvotes but low click-through** -- post is compelling but link isn't. Add screenshot of a venue card with "Firing" badge to a follow-up comment.
- **Post gets engagement but app doesn't load** -- check Plausible. If 0 pageviews despite upvotes, Babel transpile failure.

### Pre-posting checklist (Jack must do):
1. Open https://j1mmychu.github.io/peakly/ on your phone. Confirm it loads and shows venue cards with photos.
2. Tap a surf venue -- confirm detail sheet opens with real weather data and a flight price (not "est.").
3. Verify your Reddit account has 50+ karma and is 30+ days old on r/surfing. If not, spend 1-2 weeks commenting genuinely first.
4. Check Plausible dashboard (plausible.io) -- confirm pageviews are recording.

---

## Post-Reddit Expansion: Next 3 Communities

### 1. r/skiing + r/snowboarding (combined 1.1M members) -- Week 2-3

**Why next:** 50 ski venues is the strongest category alongside surf. Late March / early April is "where's still getting snow?" season -- Peakly answers this directly. Southern Hemisphere resorts (June) give a second post angle in 2 months.

**Post angle:** "Built a free tool that scores 50 ski resorts by real-time snow conditions + shows cheap flights. Late season edition -- where's still getting powder?"

**Deep link play:** Link to Whistler or Niseko directly.

**What must be true:** Verify ski venue scoring is accurate for late-season conditions. Spring corn snow and variable temps should produce moderate scores, not artificially high ones.

### 2. r/solotravel (2.8M members) -- Week 3-4

**Why next:** Largest audience by far. The hook shifts from "conditions" to "timing + deals." Solo travelers care about: best weather week, flight cost, is it worth going now.

**Post angle:** "I built a free tool that tells you the best week to visit 190+ adventure destinations based on live weather + real flight prices."

**What must be true:** Beach/tanning category (60 venues) is the entry point. Flight pricing matters more than wave height for this audience. The app needs to feel useful for non-athletes. 60 beach venues is actually the largest category -- this is a strength for this community.

### 3. r/digitalnomad (2.3M members) -- Week 4-5

**Why next:** Nomads are the ideal Peakly user: flexible dates, price-sensitive, adventure-oriented. They actually book flights based on conditions.

**Post angle:** "Free tool that scores 190+ adventure spots by live conditions and shows cheap flights -- built it for planning my next move."

**What must be true:** 7-day forecast is limiting for nomads who plan 2-4 weeks out. Be ready for feedback pushing on forecast horizon. This audience will push hardest on the Phase 3 "Forecast Horizon" feature.

### Deprioritized:
4. **r/scuba** (424K) -- 5 dive venues, scoring is rudimentary. Wait for more dive content.
5. **r/travel** (10M) -- Heavily moderated, self-promo gets removed fast. Skip unless invited.

---

## Competitive Intelligence

### The venue trim reframes the competitive position

With 192 venues (down from 472), Peakly no longer wins on raw volume. The competitive advantage shifts:

**Before (v11):** "The world's largest free surf conditions database with flights" (333 surf spots).
**Now (v12):** "The only app combining live conditions + real flight prices across 11 adventure sports" (multi-sport breadth).

This is actually a more defensible position. Surfline will never add skiing. OnTheSnow will never add surfing. Neither will ever add flights. The multi-sport + flights combination is the moat, not venue count.

### SurfTrips.ai -- Direct Competitor

Still the closest competitor in the surf vertical. With 53 surf spots vs their unknown count, the gap has narrowed from "overwhelming" to "competitive." The differentiator is now multi-sport breadth and real flight prices, not surf catalog size.

### Surfline (March 2026)

- $119.99/year, price anger continuing. "Premium with Ads" at $69.99/year perceived as insulting.
- Pivoting to session recording (Apple Watch logging). **Trip planning space remains wide open.**
- International pricing disparity still fueling resentment.

### AllTrails Peak ($80/year)

- Feature paywalling backlash continues. Validates $79/year for Peakly Pro.
- Their mistake: retroactive gating. Peakly Pro must launch with premium features from day one.

### The insight that changes how we think about the product

**192 curated venues with unique photos is a better product than 472 venues with duplicate photos, but it requires a different growth narrative.** The v11 strategy was "the number IS the marketing." That's gone. The v12 strategy must be "the quality IS the marketing." Users who tap a venue and see a beautiful photo, accurate conditions, and a real flight price will trust the app. Users who see three venues with the same stock photo will not. The trim was the right call for product quality -- now the marketing must catch up. Lead with the experience, not the count. Screenshots of polished venue cards in Reddit comments will do more than any number in a title.

---

## Venue Deep Links + PWA: Shareability Score

**Shareability: 9/10.** Unchanged from v11.

| Factor | v11 | v12 | Change |
|--------|-----|-----|--------|
| Deep links | Yes | Yes | -- |
| Share button | Yes | Yes | -- |
| PWA install | Yes | Yes | -- |
| Home screen icon | Yes | Yes | -- |
| 100% unique photos | No (duplicates) | Yes | Quality up |
| Venue-specific OG image | No | No | Still missing |

**What's still missing for 10/10:**
- Venue-specific OG images. When someone shares a Pipeline deep link on iMessage or Slack, the preview still shows the generic OG image, not Pipeline. Server-side rendering or a dynamic OG image service would fix it but is out of scope for the current architecture.

**New consideration:** With 100% unique photos, venue-specific OG images would actually look good now. Before, sharing a venue with a duplicate stock photo was embarrassing. Now every venue has a distinct, beautiful photo. If a lightweight OG image solution becomes available, the payoff is higher than it was in v11.

---

## Retention Risk: YELLOW (5.5/10, down from 6/10)

| Factor | Score | Delta | Notes |
|--------|-------|-------|-------|
| Core value loop | 7/10 | -1 | 192 venues is still browseable but less "endless scroll" feeling. Users hit the bottom of a category faster. |
| Reason to return Day 2 | 4.5/10 | -- | Real flight prices create a "check back for deals" habit. Set Alert button live. |
| Reason to return Day 7 | 2.5/10 | -- | Deep links enable sharing. Wishlists tab still hidden. No push notifications. |
| Reason to return Day 30 | 1/10 | -- | No content updates, no social, no progress tracking. |
| Notifications | 1/10 | -- | Alert UI exists, no outbound delivery. |
| Shareability | 6/10 | -- | Deep links + PWA install. Missing venue-specific OG previews. |
| Content freshness | 5.5/10 | -1.5 | 192 venues is solid but less discovery surface. Weather updates keep it dynamic. |
| PWA stickiness | 3/10 | -- | Home screen install available. No push notifications yet. |

**Overall: YELLOW (5.5/10).** Down 0.5 from v11. The trim reduces discovery surface and "endless scroll" engagement, but the quality improvement partially compensates.

**The single change that would most improve Day 7 retention:** Unchanged: expose the Wishlists tab. A user who hearts Pipeline on Day 1 and has nowhere to find it on Day 2 is a lost user. This is the highest-impact retention fix available.

**Second most impactful:** Add breakType back to the 53 surf venues. This is small metadata work (beach/point/reef for each surf spot) that makes the surf experience feel authoritative. A surfer who sees "reef break" on Uluwatu trusts the app more than one who doesn't.

**Path from 5.5/10 to 8/10:**
1. Expose Wishlists tab + "what changed" indicator (5.5 --> 6.5)
2. Browser push notifications for saved venue alerts (6.5 --> 7.5)
3. Expand back to 250+ venues with unique photos (7.5 --> 8)

---

## Path to Milestones

### 0 --> 1K users (Weeks 1-4)

| Week | Action | Target |
|------|--------|--------|
| Week 1 | r/surfing post. Problem-statement hook, not number hook. Monitor Plausible for 72 hours. Reply to every comment with deep links + screenshots. | 150-400 visitors |
| Week 1 | Submit to AlternativeTo as Surfline alternative + Hacker News "Show HN" if Reddit goes well | +50-150 passive visitors |
| Week 2 | r/skiing post with "where's still getting snow?" angle. Deep-linked venue in post. | +150-350 visitors |
| Week 3 | r/solotravel post with "best week to visit 190+ destinations" angle. Beach venues as entry point. | +200-500 visitors |
| Week 4 | r/digitalnomad. Analyze Plausible data: which community converted best. Double down on winner. | Total: 600-1,400 users |

### 1K --> 10K users (Months 2-3)

- Product Hunt launch (late April). PWA installable, deep links proven, Plausible data to cite.
- FOMO content: "Pipeline had a 95/100 week and flights were $189. Most people missed it." Image cards on Instagram/TikTok.
- Expand venue count back toward 300+ with unique photos. Target surf and ski first.
- Email capture (simple modal after 3rd visit).
- Target: 4,000-8,000 by day 90.

### 10K --> 100K users (Months 4-12)

- Native app wrapper (Android TWA, iOS Safari PWA).
- Peakly Pro launches ($79/year) once LLC clears.
- Window Score (Phase 2) becomes the shareable metric.
- Partnership outreach: surf schools, ski resorts, adventure travel bloggers.
- Timeline: 12-18 months bootstrapped.

---

## 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 | Reddit r/surfing (problem-statement hook) + AlternativeTo | 150-450 |
| Week 2-3 | r/skiing + r/solotravel with deep links | 500-1,800 |
| Week 4-5 | Product Hunt (Top 15 target) + r/digitalnomad | 1,800-4,500 |
| Week 6-8 | TikTok FOMO content + email capture + Facebook surf groups | 3,000-6,500 |
| Week 9-12 | SEO + venue expansion to 300+ + repeat Reddit engagement | 4,500-8,000 |

**Realistic 90-day number: 4,500-8,000 users.** Down from 6,000-10,000 in v11. The downward revision reflects: (1) 53 surf spots vs 333 reduces the curiosity-click factor in the Reddit title, (2) 192 total venues means less discovery surface for retention, (3) the quality improvement is real but harder to convey in a headline than a number. The upside scenario (8K) assumes venue expansion back to 300+ happens in months 2-3 and re-engagement posts drive return traffic.

---

## Priority Stack

1. **Reddit r/surfing post** -- Execute this week. Tuesday or Wednesday morning. The product is ready. Quality over quantity is the right bet.
2. **Expose Wishlists tab** -- Wire into BottomNav before or within 48 hours of Reddit post. Biggest retention uplift for smallest effort.
3. **Add breakType back to all 53 surf venues** -- Small data entry task that makes surf cards look authoritative. Beach/point/reef for each spot. Can be done in one session.
4. **Monitor Plausible 72 hours post-Reddit** -- First real data: which venues get clicked, bounce rate, referrer quality, flight search clicks, PWA install rate.
5. **Second Reddit wave** -- r/skiing (Week 2), r/solotravel (Week 3), r/digitalnomad (Week 4). Use venue deep links in every post and comment.
6. **Venue expansion plan** -- Target 300 venues with unique photos by end of month 2. Prioritize surf and ski. Each batch must maintain 100% unique photos.
7. **Onboarding flow** -- New users still get dumped into Explore with no explanation. After Reddit brings traffic, this becomes urgent.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 (v12) | 90-day projection revised to 4.5K-8K (from 6K-10K) | 192 venues vs 472 reduces headline hook strength and discovery surface. Quality improvement is real but harder to market. |
| 2026-03-24 (v12) | Reddit title shifts from number hook to problem-statement hook | "50+ surf spots" isn't impressive enough to lead with. "Tired of switching between Surfline and Google Flights" is universally relatable. |
| 2026-03-24 (v12) | Competitive moat reframed from venue count to multi-sport breadth | With 192 venues, raw volume is not a differentiator. 11 categories + flights is. No competitor covers multiple sports with real-time conditions AND flights. |
| 2026-03-24 (v12) | breakType restoration prioritized | Only 3 of 53 surf venues have breakType. Adding it back is low effort, high trust signal for surfers. |
| 2026-03-24 (v12) | Venue expansion to 300+ is Month 2-3 priority | Quality bar is now set: every venue needs a unique photo. Expansion must maintain this standard. |
| 2026-03-24 (v11) | Shareability upgraded to 9/10 | PWA manifest + apple-touch-icon + service worker enable home screen install. |
| 2026-03-24 (v11) | VPS proxy no longer a launch caveat | HTTPS via Caddy + Let's Encrypt on peakly-api.duckdns.org. |
| 2026-03-24 (v10) | Deep links change Reddit comment strategy | Every comment reply includes a targeted venue link. |
| 2026-03-24 (v10) | SurfTrips.ai identified as direct competitor | Validates the conditions+flights thesis. Multi-sport is Peakly's structural moat. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated community. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. |

---

*Next report: 2026-03-25*
