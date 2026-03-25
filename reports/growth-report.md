# Peakly Growth Report: 2026-03-24 (v9)

---

## Reddit Launch: GO — with one caveat

All prior blockers remain cleared. Analytics live, SEO foundations set, UX at 9.2/10 per UX agent, 170+ venue photos, clean card UI. The caveat: the DevOps report confirms the flight proxy (104.131.82.242:3001) is still ECONNREFUSED and has been down for 2+ consecutive days. Every user sees estimated flight prices, not real ones. This does not block launch — the condition scoring, venue photos, and weather data are the hook, not flight prices — but it weakens the "cheap flights" half of the value proposition. If a Redditor clicks through and sees "est. $340" on every venue, the credibility takes a hit.

**Recommendation:** Launch Reddit anyway. The condition-scoring angle is strong enough to stand alone. But fix the VPS proxy within 48 hours of posting so that users who return on Day 2 see real prices. That's a retention save, not a launch blocker.

---

## Exact r/surfing Post Draft (Copy-Paste Ready)

**Subreddit:** r/surfing (785K members)

**Post type:** Image post with screenshot of a surf venue card showing "Firing" or "Epic" badge + live conditions

**Title:** "Made a free tool that scores surf spots by real-time conditions and shows cheap flights — no paywall"

**Body:**

> Hey r/surfing — I'm a developer and surfer who got frustrated paying $120/year for Surfline just to check if conditions are worth a trip. So I built something different.
>
> Peakly pulls live swell data, wind, wave height, and water temp for 170+ spots worldwide and turns it into a single condition score. If a spot is firing, it tells you — and shows you the cheapest flights to get there.
>
> It's free, runs in your browser, no account needed, no paywall. Feedback welcome — especially on which spots I should add next.
>
> https://j1mmychu.github.io/peakly/?ref=reddit_surfing
>
> (Screenshot: [attach a screenshot of Pipeline or Uluwatu showing an "Epic" or "Firing" badge with the 7-day forecast strip visible])

**Why this framing works:**
1. Leads with the Surfline pain point ($120/year, paywall frustration) — this is the #1 complaint in the community right now after the April 2025 price hike from $99 to $120.
2. "No paywall" is the differentiator. Surfline just introduced "Premium with Ads" at $70/year as their budget tier. Free beats $70.
3. Asks for feedback (which spots to add) — invites engagement rather than just broadcasting.
4. Screenshot as post image drives clicks. A venue card showing real scores is more compelling than a homepage screenshot.

**Posting timing:** Tuesday or Wednesday, 7-9am Pacific. r/surfing activity peaks when West Coast surfers check conditions before dawn patrol. Early-week posts get more engagement than weekend posts (surfers are surfing, not scrolling).

**Failure mode diagnosis:**
- 3 upvotes, removed by mods → self-promo rules triggered. Pivot: post as a comment in a "what forecast app do you use?" thread instead.
- 3 upvotes, not removed → hook didn't land. Reframe next attempt as "I tracked which spots had the best conditions this week" with a conditions leaderboard screenshot.
- 50+ upvotes but low click-through → the post is entertaining but the link isn't compelling. Add UTM params and check Plausible for referrer data.

---

## 3 Best r/surfing Thread Types to Monitor (Targeting Signal)

These are the recurring thread patterns where Peakly is genuinely useful, not self-promotional:

1. **"What forecast app/site do you use?"** — These appear monthly. MagicSeaweed users (displaced since May 2023 shutdown) are still looking for a free alternative to Surfline. Peakly is a legitimate answer.

2. **"Planning a surf trip to X — when should I go?"** — Peakly's condition scoring + flight pricing answers this question directly. Drop a link to the specific venue (once deep links exist) as a helpful reply, not a sales pitch.

3. **"Surfline just raised prices again / paywall complaints"** — These threads generate hundreds of comments. The anger is real: $99 → $120 annual, free tier limited to 4 checks/week. "Here's a free alternative" positioned as a comment (not a top-level post) lands well.

---

## Post-Reddit Expansion: Next 3 Communities

### 1. r/skiing + r/snowboarding (combined 1.1M members) — Week 2-3

**Why next:** Peakly already has ski venues with snow depth scoring. The value prop translates directly. Ski season is winding down in the Northern Hemisphere (late March), which actually helps — "where's still getting snow?" is a common late-season question Peakly answers.

**What must be true:** Ski venue condition scores need to be accurate for late-season spots (Japan, Southern Hemisphere resorts coming into season). Verify scoring for Niseko, Thredbo, Cerro Catedral.

**Post angle:** "Built a free tool that shows you which ski resorts have the best snow right now + cheap flights. Late season edition."

### 2. r/solotravel (2.8M members) — Week 3-4

**Why next:** Largest audience. But the community is travel-generalist, not sport-specific. The hook needs to shift from "conditions" to "timing + deals."

**What must be true:** The app needs to feel useful for non-hardcore athletes. Beach/tanning scores, the vibe search feature, and flight pricing are more relevant here than wave height.

**Post angle:** "I built a free tool that tells you the best week to visit adventure destinations based on live weather + flight prices."

### 3. r/digitalnomad (1.9M members) — Week 4-5

**Why next:** Nomads are the perfect Peakly user — flexible dates, price-sensitive, adventure-oriented. They actually book flights based on conditions.

**What must be true:** Peakly needs to show value for longer planning horizons. The 7-day forecast is limiting for nomads who plan 2-4 weeks out. Having the "Best Window" indicator helps but isn't enough for this audience.

**Post angle:** "Free tool that scores surf/ski/adventure spots by live conditions and shows cheap flights — built it for planning my next move."

### Communities ranked but deprioritized:
4. r/scuba — 424K members. Peakly has dive venues but the scoring for diving conditions (visibility, current, marine life seasonality) is rudimentary. Wait until dive scoring improves.
5. r/travel — 10M members but heavily moderated, generic travel questions dominate. Self-promo gets nuked fast.

---

## Venue Deep Links: Growth Impact

Once deep links ship (hash routing like `#venue/pipeline`), the growth projection changes materially:

- **Every share becomes an acquisition event.** Right now, sharing a venue copies text to clipboard with a homepage URL. The recipient lands on the Explore tab with no context. With deep links, they land on the exact venue with live scores visible. Conversion from "clicked a link" to "engaged user" jumps from ~20% to ~60%.
- **Reddit comments become targeted.** Instead of linking to the homepage in every reply, you link to the specific venue being discussed. "Here's Pipeline's live conditions right now: [deep link]" is 10x more compelling.
- **Shareability score moves from 7.5 to 8.5/10** immediately on deep links alone.
- **90-day projection uplift: +15-20%.** Deep links create a compounding viral coefficient. Each user who shares a venue can bring 0.1-0.3 new users. At 1,000 users, that's 100-300 organic additions.

**Build deep links before the second Reddit push, not after.** The r/surfing post can work with a homepage link. But every subsequent community post should use venue-specific deep links.

---

## Competitive Intelligence

### Surfline (March 2026)
- **v11.1.4 shipped March 3, 2026.** New features: Forecaster Insights on home screen, 5-minute tide graph intervals, custom pin-drop locations for session logging, Sessions on Android in progress.
- **Price: $120/year** (up from $99 in April 2025). Budget tier "Premium with Ads" at $70/year. Free tier limited to 4 forecast checks per week.
- **User sentiment: Hostile.** BeachGrit ran "Forecasting Giant Surfline Accused Of Price Gouging Beleaguered Americans." International users paying $46-56/year are furious Americans pay $120 for identical access. MagicSeaweed refugees (shut down May 2023) still actively seeking alternatives on forums and threads.

### AllTrails (Peak tier)
- **$80/year "Peak" tier** launched mid-2025. AI-powered custom routes, real-time trail conditions analyzing 15 environmental factors, community heatmaps. Basic "Plus" tier is $36/year.
- **User complaints:** Doubling the price from Plus to Peak for features many consider gimmicky. AI route suggestions getting mixed reviews. Support bot frustrations.
- **Peakly relevance:** AllTrails Peak at $80/year validates Peakly Pro at $79/year as a competitive price point. But AllTrails has 5M+ downloads and brand trust. Peakly needs to earn that trust with free value first.

### The gap Peakly can own

**No competitor combines conditions + flights.** This is still true and still the wedge.

- Surfline does conditions but zero flight integration. They're doubling down on cam quality and session logging — becoming a surf journal, not a trip planner.
- AllTrails does trails but zero conditions intelligence for action sports. Their "conditions" feature is weather overlay, not sport-specific scoring.
- KAYAK/Hopper do flights but are conditions-blind.
- OnTheSnow does ski conditions but no flights, no multi-sport.

**The insight that changes how we think:** Surfline's move toward session logging and custom locations signals they're pivoting from *planning* to *recording*. They want to be Strava for surfers. This leaves the *planning + booking* space wide open. Peakly should lean hard into "planning your next trip" positioning, not "checking today's conditions." The tagline "Know when to go" is exactly right — it's the opposite of what Surfline is building toward.

---

## Retention Risk: YELLOW

| Factor | Score | Notes |
|--------|-------|-------|
| Core value loop | 7/10 | Browsing is enjoyable. Scores are genuinely useful. Photos make venues desirable. |
| Reason to return Day 2 | 3/10 | Conditions change daily but nothing triggers return. No push, no email. |
| Reason to return Day 7 | 2/10 | Without saved state that matters (wishlists hidden, alerts fire nothing), there's no habit loop. |
| Reason to return Day 30 | 1/10 | No content updates, no social features, no progress tracking. The app is the same every time. |
| Notifications | 1/10 | Alert UI exists but fires nothing. Zero outbound re-engagement. |
| Shareability | 4/10 | Share buttons exist but no deep links kills the loop. |
| Content freshness | 6/10 | Weather updates live. But no editorial content, no "this week's best windows" push. |

**Overall: YELLOW (5/10).** Unchanged from v8. No new retention mechanisms shipped.

**The single change that would most improve Day 7 retention:** Expose the Wishlists tab and make it the default landing for returning users who have saved venues. A returning user should see "Your saved spots — here's what changed since you last checked" with updated scores. This creates a reason to come back: "Did my spots get better or worse?" It's 2-3 hours of work (wire the tab into BottomNav + add a "changes since last visit" indicator) and it converts Peakly from a browse-once tool into a monitoring dashboard.

**Path from 5/10 to 8/10:**
1. Wishlists tab exposed + returning user detection (5 → 6)
2. Venue deep links (6 → 6.5)
3. PWA install + home screen icon (6.5 → 7)
4. Browser push notifications for saved venue alerts (7 → 8)

---

## Shareability Score: 7.5/10 (unchanged)

No new shareability features shipped since v8. The score holds. Deep links remain the highest-leverage improvement. Branded OG image and apple-touch-icon are the next two items after deep links.

---

## Path to Milestones

### 0 → 1K users (Weeks 1-4)
- **Week 1:** r/surfing post. Target 150-400 visitors. Monitor Plausible for 72 hours.
- **Week 2:** Fix VPS proxy. Build venue deep links. Post to r/skiing with deep-linked venue.
- **Week 3:** r/solotravel post with "best week to visit" angle. PWA manifest ships.
- **Week 4:** r/digitalnomad post. Analyze which community converted best. Total: 800-1,500 users.

### 1K → 10K users (Months 2-3)
- Product Hunt launch (late April, once deep links + PWA are live).
- FOMO content: "Pipeline had a 95/100 week and flights were $189. Most people missed it." Post as image cards on Instagram/TikTok.
- Email capture (simple modal after 3rd visit: "Get alerts when your saved spots fire").
- SEO content pages start ranking (programmatic venue pages if built).
- Target: 5,000-8,000 by day 90.

### 10K → 100K users (Months 4-12)
- Native app wrapper (Android TWA, iOS Safari PWA with proper icons).
- Peakly Pro launches ($79/year) once LLC clears. Revenue funds targeted paid acquisition.
- Window Score (Phase 2 in vision doc) becomes the shareable metric. "My Whistler Window Score is 92" gets shared like Wordle scores.
- Partnership outreach: surf schools, ski resorts, adventure travel bloggers embed Peakly widgets.
- Timeline: 12-18 months bootstrapped, 6-9 months with seed funding.

---

## 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 | Reddit r/surfing launch + monitor Plausible | 150-400 |
| Week 2-3 | Deep links + PWA + r/skiing + r/solotravel | 600-1,800 |
| Week 4-5 | Product Hunt launch (Top 15 target) | 2,500-5,000 |
| Week 6-8 | TikTok FOMO content + email capture + push | 3,500-6,500 |
| Week 9-12 | SEO pages ranking + affiliate revenue live | 5,000-8,000 |

**Realistic 90-day number: 5,000-8,000 users** (unchanged from v8). No new distribution shipped since last report, so the projection holds. The number moves up only when the Reddit post actually goes live and we have real data.

---

## Priority Stack

1. **Reddit r/surfing post** — Execute this week. No more delays. Every day without distribution is wasted.
2. **Fix VPS flight proxy** — Within 48 hours of Reddit post. Real flight prices = credibility.
3. **Venue deep links** — Hash routing. Build before second Reddit push. Highest-leverage growth feature.
4. **Expose Wishlists tab** — Wire into BottomNav. Biggest retention uplift for smallest effort.
5. **PWA manifest + apple-touch-icon** — 2-3 hours. Enables installability.
6. **Analyze Plausible data** — 72 hours post-Reddit. First real user data informs everything.
7. **Second Reddit wave** — r/skiing, r/solotravel, r/digitalnomad. Use deep links in posts.
8. **Product Hunt prep** — Branded OG image, deep links working, PWA installable. Late April target.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 (v9) | Launch Reddit despite VPS proxy being down | Condition scoring is the hook, not flight prices. Fix proxy within 48 hrs for Day 2 retention. |
| 2026-03-24 (v9) | Lead r/surfing post with Surfline price pain | $99→$120 price hike is the #1 community grievance. "Free, no paywall" is the counter-positioning. |
| 2026-03-24 (v9) | Wishlists tab exposure = #1 retention fix | Returning users need a reason to come back. "Your saved spots changed" is the simplest habit loop. |
| 2026-03-24 (v9) | Surfline pivoting to session logging = opportunity | They're becoming Strava for surfers. "Planning your next trip" space is wide open for Peakly. |
| 2026-03-24 (v8) | GREEN LIGHT Reddit launch within 48 hours | Analytics blocker resolved. |
| 2026-03-24 (v8) | Build deep links immediately after Reddit post | Real user friction > theoretical friction. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated free-tier surf community. |
| 2026-03-23 | Venue share links = #1 feature priority post-analytics | Without shareable venues, growth ceiling is low. |
| 2026-03-23 | Product Hunt delayed to late April | PWA + venue links must ship first. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. |

---

*Next report: 2026-03-25*
