# Peakly Growth Report: 2026-03-24 (v11)

---

## Reddit Launch: GO

Three critical blockers from v10 are now resolved. Launch readiness is the strongest it has ever been.

**What changed since v10:**

- **VPS proxy fixed and HTTPS-enabled.** `FLIGHT_PROXY` now points to `https://peakly-api.duckdns.org` with Caddy + Let's Encrypt auto-renewing SSL. Mixed content blocking is eliminated. Real flight prices load in production. The "est." price fallback is now a true fallback, not the default experience. This was the #1 credibility risk for returning users.
- **GA4 removed, Plausible only.** Clean analytics stack. One script tag (`script.hash.js` with SPA hash routing support), no placeholder measurement IDs, no dead code. Plausible provides everything needed for launch: pageviews, referrers, custom events, bounce rate. No GDPR cookie banner required.
- **PWA manifest + service worker + apple-touch-icon shipped.** `manifest.json` with standalone display mode, `sw.js` with stale-while-revalidate caching, apple-mobile-web-app meta tags, and a branded SVG touch icon. Users can now install Peakly to their home screen on iOS and Android.
- **333 surf spots with break types.** Venue count exploded from ~53 surf spots to 333 surf-specific venues with `breakType` field (beach, point, reef). Total catalog: 472 venues across 11 categories. This is a 2.5x increase in overall venues and a 6.3x increase in surf coverage.
- **Deep scoring overhaul.** All 12 sport algorithms rewritten with expanded weather + marine API data. Scores are now meaningfully differentiated.

**What was already green (still green):**

- Plausible SPA tracking with custom events (Tab Switch, Venue Click, Flight Search, Wishlist Add, Onboarding Complete)
- JSON-LD structured data (WebApplication, WebSite, Organization)
- Static h1 fallback for crawlers
- Venue deep links (`#venue-{id}` hash routing)
- "Set Alert" button in VenueDetailSheet (3-tap path)
- WCAG contrast fixes
- OG meta tags + Twitter Cards

**No remaining blockers for Reddit launch.**

---

## Exact r/surfing Post Draft (Copy-Paste Ready)

**Subreddit:** r/surfing (785K members)

**Post type:** Text post

**Title:**
```
I got tired of switching between Surfline and Google Flights, so I built a free surf trip planner with 333 spots — looking for feedback
```

**Body:**
```
Like a lot of you, I've been looking for good free options since MSW got absorbed into Surfline.
For daily local forecasts, Windy and Windguru are solid. But for a different problem -- figuring
out *when and where* to book a surf trip -- nothing combined conditions with travel costs.

So I built a free web app that pulls real-time wave data (height, swell period, wind, water temp)
for 333 surf spots worldwide and scores each one with a live condition rating. Every spot has a
break type (beach, point, reef) and you can check spots like Uluwatu, Hossegor, Puerto Escondido,
Mentawai Islands, Banzai Pipeline -- each gets scored based on what's actually happening today,
plus a 7-day forecast showing the best window to go.

What it does:
- Live condition scoring for 333 surf spots (uses Open-Meteo marine data — swell period, wave
  height, wind direction, water temp)
- Break type on every spot (beach, point, reef)
- 7-day forecast with "best window" indicator — shows which day this week has the best setup
- Real flight prices from your home airport
- Filter by surf, ski, beach, kite, and more (470+ total spots across all sports)
- No login, no paywall, works on any phone browser. Add to home screen like an app.

What it does NOT do:
- HD cams or break-by-break forecasts (use Surfline/Windy for that)
- This is for trip *planning*, not dawn patrol decisions

Would love honest feedback from people who actually surf:
- Does the condition scoring feel right when you check a spot you know well?
- What spots should I add?
- Would alerts be useful — like "Pipeline is firing and flights from LAX are under $300"?

https://j1mmychu.github.io/peakly/

Built this for myself but figured others might get use out of it. Still early — lots to improve.
```

### Changes from v10 draft:
- **333 surf spots** replaces "50+ surf spots" -- this is a genuinely impressive number that differentiates from any competitor. It belongs in the title.
- **Break type** added as a feature bullet. Surfers care about reef vs. beach vs. point break. This signals the app understands surfing, not just weather.
- **"Real flight prices"** replaces "Estimated flight prices" -- the proxy is fixed, this is no longer a lie.
- **"470+ total spots"** replaces "190+" -- accurate to current 472 venues.
- **"Add to home screen like an app"** -- PWA is live, mention it naturally.
- Everything else unchanged: MSW pain point lead, "What it does NOT do" section, specific question prompts for comments, link placement after the pitch.

### Posting timing:
**Tuesday or Wednesday, 9-11am Eastern (6-8am Pacific).** Unchanged. Catches West Coast surfers checking conditions before dawn patrol. Avoid weekends.

### Reddit comment responses with deep links:
When someone asks about a specific spot, reply with a venue deep link:

- "Here's Pipeline's live conditions right now: https://j1mmychu.github.io/peakly/#venue-banzai_pipeline"
- "Check Uluwatu: https://j1mmychu.github.io/peakly/#venue-uluwatu"
- "Here's what Hossegor looks like today: https://j1mmychu.github.io/peakly/#venue-hossegor"

With 333 surf spots, almost any spot someone asks about will be in the database. This is a massive advantage for comment engagement.

### Failure mode diagnosis:
- **3 upvotes, removed by mods** -- self-promo rules triggered. Pivot: comment in a "what forecast app do you use?" thread instead.
- **3 upvotes, not removed** -- hook didn't land. Reframe: "I scored 333 surf spots by today's conditions -- here are the top 10 right now" with Peakly link in comments only.
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

**Why next:** 50 ski venues with photo coverage and snow depth scoring. Late March / early April is "where's still getting snow?" season -- Peakly answers this directly. Southern Hemisphere resorts coming into season (June) gives a second post angle in 2 months.

**Post angle:** "Built a free tool that scores 50 ski resorts by real-time snow conditions + shows cheap flights. Late season edition -- where's still getting powder?"

**Deep link play:** Link to Whistler or Niseko directly. "Here's what Whistler looks like right now: [deep link]"

**What must be true:** Verify ski venue scoring is accurate for late-season conditions. Spring corn snow and variable temps should produce moderate scores, not artificially high ones.

### 2. r/solotravel (2.8M members) -- Week 3-4

**Why next:** Largest audience by far. The hook shifts from "conditions" to "timing + deals." Solo travelers care about: best weather week, flight cost, is it worth going now.

**Post angle:** "I built a free tool that tells you the best week to visit 470+ adventure destinations based on live weather + real flight prices."

**What must be true:** Beach/tanning category (60 venues) is the entry point. Vibe search and flight pricing matter more than wave height for this audience. The app needs to feel useful for non-athletes.

### 3. r/digitalnomad (2.3M members) -- Week 4-5

**Why next:** Nomads are the ideal Peakly user: flexible dates, price-sensitive, adventure-oriented. They actually book flights based on conditions.

**Post angle:** "Free tool that scores 470+ adventure spots by live conditions and shows cheap flights -- built it for planning my next move."

**What must be true:** 7-day forecast is limiting for nomads who plan 2-4 weeks out. Be ready for feedback pushing on forecast horizon. This audience will push hardest on the Phase 3 "Forecast Horizon" feature.

### Deprioritized:
4. **r/scuba** (424K) -- 5 dive venues, scoring is rudimentary. Wait for visibility/current data.
5. **r/travel** (10M) -- Heavily moderated, self-promo gets removed fast. Skip unless invited.

---

## Competitive Intelligence

### SurfTrips.ai -- Direct Competitor (Status Update)

Identified in v10. Still the closest competitor in the surf vertical. Peakly's structural advantage has widened significantly:

- **333 surf spots vs. unknown (likely <100).** 6x the surf catalog we had when SurfTrips.ai was first identified.
- **Break type metadata** (beach, point, reef) -- signals domain expertise that a generic trip planner lacks.
- **Multi-sport breadth** -- 472 total venues across 11 categories. SurfTrips.ai is surf-only.
- **Real flight prices now live** -- was a disadvantage in v10, now neutral.

**The gap is widening, not narrowing.** With 333 surf spots and break type data, Peakly is now arguably the most comprehensive free surf venue database with live conditions scoring. This changes the r/surfing pitch from "I built a trip planner" to "I scored every surf spot I could find."

### Surfline (March 2026)

- $119.99/year, price anger continuing. "Premium with Ads" at $69.99/year perceived as insulting.
- Pivoting to session recording (Favorites in bottom nav, Apple Watch logging). **The trip planning space remains wide open.**
- International pricing disparity still fueling resentment -- $46-56 in some countries vs $120 in US.

### AllTrails Peak ($80/year)

- Feature paywalling backlash continues on Trustpilot. "On-trail conditions" moved from Plus to Peak tier.
- Validates $79/year price point for Peakly Pro. Their mistake: retroactive gating. Peakly Pro must launch with premium features from day one.

### The insight that changes how we think about the product

**333 surf spots changes Peakly's positioning from "trip planner with conditions" to "the world's largest free surf conditions database with flights."** No free tool has 333 scored surf spots with break types. This is defensible content, not just a feature. The Reddit post title should lead with the number. When r/surfing users see "333 spots" they will check if their local break is included -- that's the curiosity hook that drives clicks. The venue count IS the marketing.

---

## Venue Deep Links + PWA: Shareability Score Update

**Shareability: 8.5 --> 9/10.** Up from v10 due to PWA manifest + apple-touch-icon.

| Factor | v10 | v11 | Change |
|--------|-----|-----|--------|
| Deep links | Yes | Yes | -- |
| Share button | Yes | Yes | -- |
| PWA install | No | Yes | +0.5 |
| Home screen icon | No | Yes (SVG) | -- (bundled with PWA) |
| Venue-specific OG image | No | No | Still missing |

**What's still missing for 10/10:**
- Venue-specific OG images. When someone shares a Pipeline deep link on iMessage or Slack, the preview still shows the generic mountain OG image, not Pipeline. This is the last shareability gap. Server-side rendering or a dynamic OG image service would fix it but is out of scope for the current architecture.

---

## Retention Risk: YELLOW (6/10, up from 5.5/10)

| Factor | Score | Delta | Notes |
|--------|-------|-------|-------|
| Core value loop | 8/10 | +1 | 472 venues with photos, real flight prices, deep scoring. Browsing is genuinely useful and enjoyable now. |
| Reason to return Day 2 | 4.5/10 | +0.5 | Real flight prices create a "check back for deals" habit that estimated prices never could. Set Alert button live. |
| Reason to return Day 7 | 2.5/10 | -- | Deep links enable sharing. Wishlists tab still hidden. No push notifications. |
| Reason to return Day 30 | 1/10 | -- | No content updates, no social, no progress tracking. |
| Notifications | 1/10 | -- | Alert UI exists, no outbound delivery. |
| Shareability | 6/10 | +0.5 | Deep links + PWA install. Missing venue-specific OG previews. |
| Content freshness | 7/10 | +1 | 472 venues means more to browse. Weather updates live. Break types add discovery value. |
| PWA stickiness | 3/10 | NEW | Home screen install is available. Service worker caches core assets. But no push notifications yet. |

**Overall: YELLOW (6/10).** Up 0.5 from v10. Real flight prices and PWA install are meaningful but insufficient without Wishlists exposure and push notifications.

**The single change that would most improve Day 7 retention:** Unchanged from v10: expose the Wishlists tab. A user who hearts Pipeline on Day 1 and has nowhere to find it on Day 2 is a lost user. This is 2-3 hours of work and the highest-impact retention fix available.

**Path from 6/10 to 8/10:**
1. Expose Wishlists tab + "what changed" indicator (6 --> 7)
2. Browser push notifications for saved venue alerts (7 --> 8)

---

## Path to Milestones

### 0 --> 1K users (Weeks 1-4)

| Week | Action | Target |
|------|--------|--------|
| Week 1 | r/surfing post. "333 surf spots" in the title. Monitor Plausible for 72 hours. Reply to every comment with deep links. | 200-500 visitors |
| Week 1 | Submit to AlternativeTo as Surfline alternative + Hacker News "Show HN" if Reddit goes well | +50-150 passive visitors |
| Week 2 | r/skiing post with "where's still getting snow?" angle. Deep-linked venue in post. | +200-400 visitors |
| Week 3 | r/solotravel post with "best week to visit 470+ destinations" angle. | +300-600 visitors |
| Week 4 | r/digitalnomad. Analyze Plausible data: which community converted best. Double down on winner. | Total: 800-1,600 users |

### 1K --> 10K users (Months 2-3)

- Product Hunt launch (late April). PWA installable, deep links proven, Plausible data to cite. "333 surf spots scored in real-time" is a Product Hunt-ready headline.
- FOMO content: "Pipeline had a 95/100 week and flights were $189. Most people missed it." Image cards on Instagram/TikTok.
- Email capture (simple modal after 3rd visit).
- SEO: venue count (472) creates long-tail keyword surface area if programmatic pages are ever built.
- Target: 5,000-10,000 by day 90.

### 10K --> 100K users (Months 4-12)

- Native app wrapper (Android TWA, iOS Safari PWA). Note: `peakly-native` Expo/React Native project exists in the repo -- could accelerate this.
- Peakly Pro launches ($79/year) once LLC clears.
- Window Score (Phase 2) becomes the shareable metric.
- Partnership outreach: surf schools, ski resorts, adventure travel bloggers.
- Timeline: 12-18 months bootstrapped.

---

## 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 | Reddit r/surfing (333 spots hook) + AlternativeTo | 200-600 |
| Week 2-3 | r/skiing + r/solotravel with deep links | 700-2,500 |
| Week 4-5 | Product Hunt (Top 15 target) + r/digitalnomad | 2,500-6,000 |
| Week 6-8 | TikTok FOMO content + email capture + Facebook surf groups | 4,000-8,000 |
| Week 9-12 | SEO + affiliate revenue live + repeat Reddit engagement | 6,000-10,000 |

**Realistic 90-day number: 6,000-10,000 users.** Up from 5,000-8,000 in v10. The upward revision is driven by three factors: (1) 333 surf spots is a genuinely differentiated number that will drive curiosity clicks, (2) real flight prices create a stronger first impression and Day 2 return reason, (3) PWA install creates a sticky channel that didn't exist before. These compound -- a user who installs the PWA, saves a venue, and sees real prices is far more likely to become a weekly user.

---

## Priority Stack

1. **Reddit r/surfing post** -- Execute this week. Tuesday or Wednesday morning. The product is ready. Every day without distribution is wasted.
2. **Expose Wishlists tab** -- Wire into BottomNav before or within 48 hours of Reddit post. Biggest retention uplift for smallest effort. Users who heart venues on Day 1 need somewhere to find them.
3. **Monitor Plausible 72 hours post-Reddit** -- First real data: which venues get clicked, bounce rate, referrer quality, flight search clicks, PWA install rate.
4. **Second Reddit wave** -- r/skiing (Week 2), r/solotravel (Week 3), r/digitalnomad (Week 4). Use venue deep links in every post and comment.
5. **Product Hunt prep** -- Branded OG image (not Unsplash hotlink), venue-specific OG tags if feasible. Late April target.
6. **Onboarding flow** -- New users still get dumped into Explore with no explanation. After Reddit brings traffic, this becomes urgent.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 (v11) | 90-day projection raised to 6K-10K (from 5K-8K) | 333 surf spots + real flight prices + PWA install compound into stronger acquisition and retention. |
| 2026-03-24 (v11) | "333 spots" belongs in the Reddit post title | The venue count IS the marketing. It's the curiosity hook that drives clicks. |
| 2026-03-24 (v11) | Shareability upgraded to 9/10 (from 8.5) | PWA manifest + apple-touch-icon + service worker enable home screen install. Only missing: venue-specific OG images. |
| 2026-03-24 (v11) | VPS proxy no longer a launch caveat | HTTPS via Caddy + Let's Encrypt on peakly-api.duckdns.org. Mixed content blocking eliminated. |
| 2026-03-24 (v11) | GA4 removal was correct | Plausible with SPA hash tracking is sufficient. One analytics tool, no dead code, no cookie banner. |
| 2026-03-24 (v10) | Deep links change Reddit comment strategy | Every comment reply includes a targeted venue link. |
| 2026-03-24 (v10) | SurfTrips.ai identified as direct competitor | Validates the conditions+flights thesis. Multi-sport is Peakly's structural moat. |
| 2026-03-24 (v9) | Launch Reddit despite VPS proxy being down | No longer relevant -- proxy is fixed. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated community. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. |

---

*Next report: 2026-03-25*
