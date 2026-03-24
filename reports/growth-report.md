# Peakly Growth Report: 2026-03-23 (v5)

## Dashboard

| Metric | Value |
|--------|-------|
| **Growth Stage** | Reddit launch-ready |
| **Shareability Score** | 7.5/10 |
| **Launch Readiness** | Reddit: GO. Product Hunt: 3 blockers remain. |
| **This Week's Experiment** | Reddit condition cards — r/surfing and r/skiing first |
| **Retention Score** | 5/10 |
| **Decision Made** | Add Plausible analytics TODAY, then post first Reddit condition card within 48 hours. |
| **90-Day Projection** | 4,000-6,000 users (Reddit + PH + organic, zero spend) |

---

## 1. OG Tag Verification (Live)

Fetched `https://j1mmychu.github.io/peakly/` on 2026-03-23. All tags confirmed present and rendering:

| Tag | Value | Status |
|-----|-------|--------|
| `og:title` | "Peakly — Adventure When Conditions Align" | LIVE |
| `og:description` | "Find surf, ski & beach spots with perfect conditions and cheap flights. Real-time weather scoring for 180+ venues worldwide." | LIVE |
| `og:image` | Unsplash mountain photo (1200x630) | LIVE |
| `og:type` | website | LIVE |
| `og:url` | https://j1mmychu.github.io/peakly/ | LIVE |
| `og:site_name` | Peakly | LIVE |
| `twitter:card` | summary_large_image | LIVE |
| `twitter:title` | Matches og:title | LIVE |
| `twitter:description` | Matches og:description | LIVE |
| `twitter:image` | Matches og:image | LIVE |
| `meta description` | Present, matches brand | LIVE |
| `theme-color` | #0284c7 | LIVE |
| Favicon | SVG "P" inline data URI | LIVE |

**Assessment:** Social cards render correctly on Twitter/X, iMessage, Slack, Discord, LinkedIn. The Unsplash mountain hero image is high-quality and on-brand. Cache-busting param on app.jsx (`?v=20260323b`) ensures users see latest code.

**Remaining shareability gaps (blocking 9+/10):**
- No venue-level OG tags (every share shows same generic image)
- No apple-touch-icon (iOS home screen shows blank)
- No PWA manifest

---

## 2. Launch Readiness

### Reddit: GREEN LIGHT

Everything needed for Reddit soft launch is in place:
- 109+ venue photos (app looks professional, not a prototype)
- OG tags render clean link previews
- Live weather scoring provides genuinely useful content
- Flight price estimates are a unique hook
- Cache-busting ensures fresh loads
- Share URLs point to correct deployment

### Product Hunt: NOT READY — 3 Blockers

| Blocker | Impact | Effort |
|---------|--------|--------|
| No PWA manifest / install prompt | PH expects "try it" UX, not a raw URL | 2-3 hours |
| No push notifications | Alerts tab is theater — PH crowd will call it out | 1-2 days |
| No venue deep links | Can't go viral post-PH if users can't share specific spots | 4-6 hours |

**Target PH date: Late April / early May 2026** (after blockers ship).

---

## 3. Competitive Intel (March 2026)

### Market Scan

| Competitor | Focus | What's New | Peakly's Angle |
|-----------|-------|-----------|----------------|
| **Surfline** | Surf forecasts, $99/yr | Absorbed MagicSeaweed, killed the free tier. Community frustrated. | Free alternative with flights + multi-sport. Target displaced MSW users. |
| **DropIn Surf** | Surf travel + community | Growing social features, group trip planning. | Peakly adds ski + beach + real-time scoring. DropIn is surf-only. |
| **OpenSnow** | Ski weather, $50-100/yr | Expanding forecaster network. Still ski-only. | Peakly covers all sports + flights. OpenSnow is single-sport. |
| **OnX Backcountry** | GPS maps for backcountry | Adding 3D route planning (FATMAP-style). | Peakly wraps conditions + flights. OnX is navigation-first. |
| **Stormrider** | Surf guide + spot discovery | New personalized skill/travel matching. | Similar discovery angle, but no flights, no real-time scoring. |
| **Slopes** | Ski tracking | Logging + social. No trip planning. | Different use case entirely — Peakly is pre-trip, Slopes is on-mountain. |
| **Hilton AI Trip Planner** | Hotel-first AI planning | Big brand entering AI trip planning. | Peakly has real-time conditions — Hilton doesn't know if it's firing. |

### Key Opportunity

MagicSeaweed's death left a vacuum. Surfline's $100/yr paywall frustrates the budget surf travel community. Peakly is free, shows conditions AND flights, and covers multiple sports. r/surfing frequently has threads complaining about Surfline pricing — those threads are our distribution channel.

### Vulnerability Watch

No direct competitor combines conditions + flights + multi-sport discovery. The nearest threat is Google adding condition scores to Flights (they have the data). Peakly's moat is curated venue data, the scoring algorithm, and cross-sport UX.

---

## 4. Single Most Impactful Thing Before Launch

**Add Plausible analytics. One `<script>` tag. Do it now.**

Without analytics, the Reddit experiment is a shot in the dark:
- Can't measure visitors from Reddit posts
- Can't see which subreddit converts best
- Can't track wishlists created or venues explored
- Can't calculate retention or return visits
- Can't report results to iterate

Everything else — PWA, push, venue links — matters less than being able to measure what happens when real humans hit the app. Plausible is privacy-friendly (no cookie banner needed), free tier covers early traffic, and it's literally a single script tag in `index.html`.

**Action:** Add `<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.js"></script>` to `index.html` head. Push to main. Done.

After analytics, the priority stack is:
1. Plausible analytics (today, 5 minutes)
2. First Reddit post to r/surfing when conditions are firing (within 48 hours)
3. Venue deep links with per-venue OG images (this week, 4-6 hours)
4. PWA manifest + install prompt (next week, 2-3 hours)
5. Push notifications (week after, 1-2 days)

---

## 5. This Week's Experiment: Reddit Condition Cards

### Hypothesis
Posting venue condition screenshots to niche subreddits drives 200+ visits and reveals which sport vertical pulls hardest.

### Execution Plan

**r/surfing (210K members) — First target:**
- Post when a real venue shows "Epic" or "Firing" conditions
- Format: screenshot of venue card + conditions, link in comments
- Angle: "Conditions at [Pipeline/Hossegor/etc] right now" — useful info first, Peakly second

**r/skiing (490K members) — Second target:**
- "Late season powder still going at [venue]" — timely as season winds down
- Same format: genuinely useful conditions data, app link in comments

**r/digitalnomad (2.2M members) — Third target:**
- "Built a free tool that shows when conditions align with cheap flights"
- This community appreciates and shares tools openly

### Success Metrics (requires Plausible)
- 200+ unique visitors in 72 hours
- 20+ wishlists created
- Identify highest-converting subreddit
- Zero mod removals (content-first approach)

---

## 6. Retention Score: 5/10

| Factor | Score | Notes |
|--------|-------|-------|
| Core value loop | 6/10 | Live condition scores + photos make browsing genuinely engaging |
| Reason to return | 3/10 | Conditions change daily (natural pull) but nothing prompts the return |
| Notifications | 1/10 | Alert toggles exist, do nothing. Pure theater. |
| Personalization | 4/10 | Onboarding captures prefs, but experience doesn't reshape enough |
| Data lock-in | 4/10 | Wishlists, trips, alerts persist in localStorage. Fragile. |
| Social | 1/10 | Solo experience, no sharing loop |
| Content freshness | 6/10 | Weather + flights update per visit. 109+ real photos. |

**Path to 7/10:** Push notifications (alerts fire for real) + email capture (weekly digest) + venue share links (social pull-back loop).

---

## 7. 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1-2 | Plausible + Reddit soft launch | 300-600 |
| Week 3-4 | Venue deep links + PWA shipped | 1,000-2,000 |
| Week 5-6 | Product Hunt launch (Top 5 target) | 3,000-4,500 |
| Week 7-8 | Second Reddit push + TikTok test | 4,000-5,500 |
| Week 9-12 | SEO content + email digest + affiliate rev | 4,000-6,000 |

**Realistic 90-day number: 4,000-6,000 users** with zero ad spend. Up from 3,500-5,000 in v3 due to improved app quality and clearer launch sequence.

### Path to 100K

90 days won't hit 100K. The bridge requires:
1. **Native store presence** (Android TWA, iOS Safari PWA) — unlocks ASO discovery
2. **SEO content engine** ("best surf in Bali March 2026" pages) — compounds
3. **Working viral loop** (share venue card + score, deep link back) — organic multiplier
4. **Affiliate revenue** reinvested into targeted acquisition
5. **D7 retention above 20%** (currently estimated ~5%) — push is the lever

**Estimated timeline to 100K: 12-18 months** (zero funding) or **6-9 months** (with seed for native apps + paid channels).

---

## 8. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-23 | Add Plausible analytics before any distribution | Can't measure = can't improve. Reddit posts without analytics are wasted shots. |
| 2026-03-23 | Reddit soft launch this week | App is visually polished, OG tags live, conditions data is genuinely useful content. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline $100/yr paywall = frustrated free-tier surf community. Our ideal early adopters. |
| 2026-03-23 | Venue share links = #1 feature priority post-analytics | Without shareable venues, growth ceiling is low regardless of channel. |
| 2026-03-23 | Product Hunt delayed to late April | PWA + push + venue links must ship first. PH crowd will roast incomplete features. |
| 2026-03-23 | Skip paid acquisition | Validate PMF organically first. Photos enable visual channels. Spend $0 until retention > 15% D7. |

---

## Sources

- [DropIn Surf](https://dropinsurf.app/) — surf travel app competitor
- [OnTheSnow: Best Backcountry Apps](https://www.onthesnow.com/news/best-apps-backcountry-skiers/) — ski app landscape
- [Travala: 10 Best Travel Planning Apps 2026](https://www.travala.com/blog/the-10-best-travel-planning-apps-to-organize-your-2026-adventures/) — travel app market
- [Hilton AI Trip Planning](https://www.phocuswire.com/news/technology/hilton-launches-ai-trip-planning-tool) — big brand entering AI travel
- [Saily: 30 Best Travel Apps 2026](https://saily.com/blog/best-travel-apps/) — market overview
- [Stormrider Surf](https://www.stormrider.surf/) — surf discovery competitor

---

*Next report: 2026-03-30*
