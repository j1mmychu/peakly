# Growth Lead Report — 2026-03-27 (v17)

**Growth Stage:** Pre-Launch (Final Sprint)
**Report Status:** YELLOW — 3 blockers remain before Reddit launch

---

## What Shipped Since Last Report

- **Pagination:** 30 venues per page + "Show more" button. Explore tab no longer dumps 2,226 cards on load. Faster first paint, less scroll fatigue, better perceived performance.
- **Stale venue counts fixed:** index.html and JSON-LD structured data now correctly say "2,200+" instead of the old "180+" figure. Reddit users who inspect source or see OG previews will see accurate numbers.
- **Cache buster bumped:** Service worker and CDN caches invalidated. All users get the latest code on next visit.

These are meaningful for launch. Pagination in particular matters because Reddit users on mobile would have hit severe scroll lag loading 2,226 cards at once. That is now solved.

---

## Reddit Launch: NO-GO (Conditional — 3 Blockers)

The app is structurally ready. The code is solid. But three issues will cause Reddit users to bounce or generate $0 revenue:

### Blocker 1: TP_MARKER still "YOUR_TP_MARKER"
- **Impact:** 100% of flight clicks earn $0 commission
- **Fix:** Jack replaces one string in tp.media dashboard. 5 minutes.
- **Days flagged:** 4

### Blocker 2: BASE_PRICES covers 9.8% of airports
- **Impact:** ~70% of venues show "$800 est." for domestic flights. A surfer checking Pipeline sees an $800 estimate from LAX. Looks broken. Erodes trust instantly.
- **Fix:** Expand BASE_PRICES lookup table to cover all 776 airport codes. Dev work, 2-3 hours.

### Blocker 3: No onboarding flow
- **Impact:** Reddit users land on Explore with zero context. They see numbers (scores, badges, "Firing", "Epic") with no explanation. The scoring system is Peakly's core value prop and it is completely unexplained.
- **Fix:** 3-screen onboarding sheet. Dev work, 2-3 hours.

**Once all three are resolved: GO within 24 hours.**

---

## Exact r/surfing Post Draft (Copy-Paste Ready)

**Subreddit:** r/surfing (785K members)
**Post type:** Text post
**Recommended timing:** Tuesday or Wednesday, 9-11am Eastern

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

**No changes from v16 draft.** The pagination improvement actually makes this post more credible -- users who click through will see a clean, paginated feed instead of a wall of 2,226 cards.

### Comment Strategy
When someone asks about a specific spot, reply with the venue deep link. With 2,226 venues, odds of having any requested spot are very high. If a spot is missing, add it and reply within 24 hours.

### Failure Modes
- **3 upvotes, removed by mods:** Self-promo rule triggered. Pivot to commenting in "what forecast app do you use?" threads. Never repost.
- **3 upvotes, not removed:** Hook did not land. Reframe next attempt as: "I scored every major surf spot by today's conditions -- here are the top 10 right now" with link in comments only.
- **50+ upvotes but low clicks:** Post is compelling but link is not converting. Add screenshot of a venue card showing "Firing" badge to a follow-up comment.
- **"Scoring is wrong at [spot]":** Respond with "thanks, adjusting now" and actually recalibrate. Expected and valuable signal.

---

## Next 3 Communities (Priority Order)

### 1. r/skiing + r/snowboarding (combined 1.1M members) — Week 2-3

**Why next:** 204 ski venues with Ikon/Epic/Independent filter is a genuine differentiator. Late March / early April is peak "where's still getting snow?" season. Post angle: "Built a free tool that scores 200+ ski resorts by real-time snow conditions + shows cheap flights. Filter by Ikon, Epic, or Independent."

**What must be true:** Ski scoring produces sensible late-season results. Spring corn snow should show moderate scores, not artificially high.

### 2. r/solotravel (2.8M members) — Week 3-4

**Why next:** Largest audience. Hook shifts from "conditions" to "timing + deals." Solo travelers care about best weather week + flight cost. 2,226 total venues makes Peakly sound like a real product, not a side project.

**What must be true:** Flight pricing must feel reliable. BASE_PRICES blocker must be resolved -- solo travelers will check flights immediately and "$800 est." for domestic routes kills credibility.

### 3. r/digitalnomad (2.3M members) — Week 4-5

**Why next:** Nomads are the ideal Peakly user -- flexible dates, price-sensitive, adventure-oriented. They actually book flights based on conditions + price alignment.

**What must be true:** 7-day forecast is limiting for nomads planning 2-4 weeks out. Expect feedback pushing toward "Forecast Horizon" feature (Phase 3 roadmap).

### Deprioritized
- **r/scuba** (424K) — Dive scoring still rudimentary. Revisit after scoring accuracy audit.
- **r/travel** (10M) — Heavily moderated, self-promo removed within hours. Skip unless organically invited.

---

## Retention Risk: YELLOW (6/10)

Retention dropped from 6.5 to 6.0 this cycle. Pagination is a UX improvement but does not create a reason to return. No retention-driving features have shipped in the past 48 hours.

| Factor | Score | Notes |
|--------|-------|-------|
| Core value loop | 8/10 | 2,226 venues + pagination = genuine browse/discovery behavior |
| Reason to return Day 2 | 6/10 | "Did conditions change?" + flight price curiosity |
| Reason to return Day 7 | 3/10 | Wishlists tab still hidden. No push notifications. Deep links help sharing. |
| Reason to return Day 30 | 1/10 | No content updates, no social, no progress tracking |
| Push notifications | 0/10 | Alert UI exists but no outbound delivery mechanism |
| Email re-engagement | 0/10 | Email capture exists but no digest or re-engagement system |
| Shareability | 7.5/10 | Web Share API + paginated feed + polished detail sheet. Pagination slightly improves shareability -- shared links load faster. |
| Content freshness | 6.5/10 | Weather updates daily. No editorial picks or "daily vibe match." |

**The single change that would most improve Day 7 retention:** Expose the Wishlists tab. The component is built and hidden. A user who hearts 5 venues on Day 1 and cannot find them on Day 2 is a lost user. This is the highest-ROI dev task for retention -- zero new code, just wire it into BottomNav.

**What would push shareability from 7.5 to 9/10:**
1. "Share this score" button generating a screenshot-ready card image (client-side, ~4 hrs dev)
2. Venue-specific OG images (requires server-side rendering -- out of scope)
3. Social proof: "142 people watching Pipeline" (requires backend -- future)

---

## Competitive Intelligence

### The Insight That Changes Strategy

**AllTrails just shipped "Trail Conditions" -- a 15-factor hourly weather + ground conditions + bug activity + snowpack layer.** This is the closest any competitor has come to Peakly's multi-factor scoring model. AllTrails has 5M+ downloads and the resources to do this well. The difference: AllTrails is hiking-only and domestic-focused. Peakly covers 11 sports and international destinations with flights.

But the signal is clear: **the market is moving toward conditions intelligence.** AllTrails validated the concept with millions of users. Surfline has always done it for surf. OpenSnow just acquired StormNet for AI-powered snow predictions. The window for Peakly to establish "multi-sport conditions + flights" as its category is narrowing.

**Action item:** Ship the Window Score (Phase 2) within 60 days. This is the proprietary metric that none of these competitors have -- a single number combining conditions + flight price + timing. Without it, Peakly is just another conditions aggregator. With it, Peakly owns a category.

### Surfline's Paywall Remains the Launch Weapon

App Store reviews are still 1-2 stars citing paywall frustration. "No login, no paywall" in the Reddit post is a political statement to displaced MSW users, not just a feature list.

### SurfTrips.ai

Closest direct competitor for surf trip planning. No live scoring, no multi-sport, no condition alerts. At 2,226 venues vs their ~500 breaks, Peakly has 4x catalog breadth. Not a threat at current scale.

---

## Path to Milestones

### 0 to 1K Users (Weeks 1-4)

| Week | Action | Target |
|------|--------|--------|
| Week 0 (NOW) | Fix 3 blockers: TP_MARKER, BASE_PRICES, onboarding | Launch-ready |
| Week 1 | r/surfing post (Tue/Wed 9-11am ET). Reply to every comment. | 200-500 visitors |
| Week 2 | r/skiing + r/snowboarding with ski pass filter angle | +200-400 visitors |
| Week 3 | r/solotravel. Beach venues + "2,200+ spots" as hook | +300-600 visitors |
| Week 4 | r/digitalnomad. Analyze Plausible. Double down on best channel. | Total: 800-1,800 |

### 1K to 10K Users (Months 2-3)

- Product Hunt launch (mid-April). "2,200+ adventure spots scored live" headline. Needs screenshots + demo GIF.
- FOMO content: "Pipeline had a 95/100 week and flights were $189. Most people missed it." Image cards on Instagram/TikTok.
- Hacker News "Show HN" -- technical audience will appreciate single-file, no-build-step architecture with 2,226 venues.
- Google Play Store listing via PWABuilder/TWA ($25, no code changes).
- Target: 5,000-10,000 by day 90.

### 10K to 100K Users (Months 4-12)

- Peakly Pro launches ($79/year) via Stripe
- Window Score (Phase 2) becomes the shareable metric
- Partnership outreach: surf schools, ski resorts, adventure travel bloggers
- iOS native wrapper only if demand justifies it
- Timeline: 12-18 months bootstrapped

---

## 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 | Reddit r/surfing + AlternativeTo | 200-500 |
| Week 2-3 | r/skiing + r/solotravel | 700-2,200 |
| Week 4-5 | Product Hunt (Top 15 target) + r/digitalnomad | 2,500-5,500 |
| Week 6-8 | TikTok FOMO content + email capture + Facebook surf groups | 4,000-8,000 |
| Week 9-12 | SEO + repeat Reddit engagement + organic word of mouth | 6,000-10,000 |

**Realistic 90-day number: 6,000-10,000 users.**
**Revenue at 8,000 MAU:** $96-144/month (current affiliate stack). Post-LLC with all affiliate IDs + Stripe: $265-400/month.

**Risk:** Every day the 3 blockers remain unfixed delays the launch by a day. The late-March ski season window closes in 2-3 weeks -- if r/skiing post misses that window, we lose the seasonal hook.

---

## Cross-Agent Notes

**From PM report (today):** Launch readiness at 85%. TP_MARKER is Day 4 P0. 20 commits shipped yesterday. Onboarding promoted from P2 to P1.

**From Content & Data report (today):** BASE_PRICES covers only 9.8% of airports. AP_CONTINENT covers 20.6%. These are launch-blocking data quality issues.

**From UX report (today):** Design score dropped to 7.3/10. 12 WCAG contrast failures unfixed for 8 consecutive reports. Category pills still gated behind "+ More". These are not launch blockers but they hurt first impressions on Reddit.

**From DevOps report (today):** Photo duplication is significant (~174 unique photos for 2,226 venues). Not a launch blocker -- users browsing 30 venues at a time via pagination are unlikely to notice duplicates on first visit.

---

## Priority Stack (Updated)

1. **Jack: TP_MARKER** -- Replace "YOUR_TP_MARKER" in tp.media. 5 min. Day 4 of this being flagged.
2. **Dev: BASE_PRICES expansion** -- Cover all 776 airport codes. 2-3 hours. Without this, 70% of venues show broken pricing.
3. **Dev: Onboarding flow** -- 3-screen sheet explaining scoring + setting home airport + picking sports. 2-3 hours.
4. **Reddit r/surfing post** -- Execute Tuesday/Wednesday 9-11am ET once blockers 1-3 are resolved.
5. **Expose Wishlists tab** -- Wire into BottomNav within 48 hours of Reddit post. Biggest retention uplift for smallest effort.
6. **Jack: REI Avantlink signup** -- 22 links earning $0. 30 min.
7. **Second Reddit wave** -- r/skiing (Week 2), r/solotravel (Week 3), r/digitalnomad (Week 4).

---

## Decision Made

**DECISION: Pagination makes Reddit launch safer but does not change the NO-GO status.**

Pagination solved the performance risk (2,226 cards loading at once would have caused scroll lag and high bounce on mobile). That blocker is removed. But the three remaining blockers -- TP_MARKER ($0 revenue), BASE_PRICES (broken pricing for 70% of venues), and onboarding (no context for new users) -- still make Reddit launch a waste of our one shot with r/surfing.

**Targeting: Blockers resolved by March 30. Reddit post April 1 or 2, 9-11am ET.**

---

*Report filed by Growth Lead agent -- 2026-03-27*
*Next report: 2026-03-28*
