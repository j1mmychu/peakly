# Peakly Growth Report: 2026-03-24 (v8)

---

## Growth Stage

**Pre-launch: Measurement layer live. Reddit soft launch is unblocked.**

Three infrastructure items shipped since v7: Plausible analytics is live and verified on the production site (script tag with `data-domain="j1mmychu.github.io"` confirmed in both local index.html and the fetched live page at j1mmychu.github.io/peakly). SEO foundations are in place -- title tag is keyword-rich ("Find Surf, Ski & Adventure Spots with Cheap Flights"), canonical URL is set, robots.txt allows all crawlers and points to the sitemap, and sitemap.xml exists with a lastmod of 2026-03-24. Five missing categories were added to the app.

The app is now a polished, measurable, crawlable product. The blocker that held up distribution for three consecutive reports is resolved. The binding constraint has shifted from "can we measure" (yes) to "are we distributing" (not yet).

---

## Shareability Score: 7.5/10 (up from 7/10)

| Factor | Score | Delta vs v7 | Notes |
|--------|-------|-------------|-------|
| OG tags (live site) | 9/10 | -- | All OG + Twitter Card tags verified live. Clean preview on share. |
| OG image quality | 7/10 | -- | Generic Unsplash mountain. No Peakly branding. Functional but not distinctive. |
| SEO (title, canonical, robots, sitemap) | 8/10 | NEW | Title tag is keyword-optimized. Canonical set. robots.txt + sitemap.xml live and valid. Google can now discover and index the site. |
| Share mechanism (Profile) | 6/10 | -- | navigator.share() with clipboard fallback. Generic URL. |
| Share mechanism (Venue) | 4/10 | -- | Clipboard text card. No deep link. Recipient lands on homepage. |
| Venue deep links | 0/10 | -- | Still not implemented. The viral loop remains broken. |
| apple-touch-icon | 0/10 | -- | Missing. iOS home screen shows blank square. |
| PWA manifest | 0/10 | -- | Missing. No "Add to Home Screen" on Android. |

**What moved the score:** SEO presence is new and meaningful. Search engines can now index the site, which creates a passive acquisition channel over time. The Plausible script does not directly improve shareability, but it enables measuring which shares convert -- making future shareability improvements data-driven rather than guesswork.

**Blocking 9+/10:** Venue deep links (highest leverage -- every share should open the specific venue), branded OG image, apple-touch-icon.

---

## Launch Readiness

### Reddit Soft Launch: GO

| Requirement | Status |
|-------------|--------|
| App looks professional | YES -- 170+ venue photos, clean cards, enforced typography, tactile touch targets |
| OG tags render clean previews | YES -- verified live |
| UX polished to 9/10 | YES -- heart buttons, Book CTA, typography hierarchy |
| Content angle exists | YES -- real-time condition scoring is genuinely novel |
| Analytics to measure results | **YES -- Plausible live on production** |
| SEO basics for organic discovery | YES -- title, canonical, robots.txt, sitemap all live |
| Ability to track Reddit referrals | YES -- Plausible tracks referrer by default. Can add UTM params to posted links for granularity |

**Decision: GREEN LIGHT for Reddit soft launch.** Post within 48 hours. The three-day analytics blocker is cleared. Every day of delay is now wasted distribution.

### Product Hunt: NOT READY -- 2 firm blockers remain

| Blocker | Status | Effort |
|---------|--------|--------|
| No PWA manifest / install prompt | Still missing | 2-3 hours |
| No venue deep links | Still missing | 4-6 hours |

Analytics is no longer a PH blocker. SEO is not a PH requirement but helps with post-launch organic tail. The remaining two blockers (PWA + deep links) are what separate "interesting demo" from "product worth upvoting."

**Target PH date: Late April 2026** (unchanged).

---

## This Week's Experiment: Reddit Condition Cards

### Status: UNBLOCKED -- Execute now

Analytics is live. The experiment can proceed immediately.

**Execution plan (48-hour window):**

1. Open Plausible dashboard and confirm pageview tracking is registering (visit the live site, check dashboard after 5 minutes).
2. Screenshot a venue card showing "Epic" or "Firing" conditions with the polished UI. Pick a surf spot with high scores -- Pipeline, Uluwatu, or Hossegor depending on current conditions.
3. Post to r/surfing (785K members). Title: "I built a free tool that scores surf spots by live conditions and shows you flights." Link to https://j1mmychu.github.io/peakly/?ref=reddit. Include the screenshot as the post image.
4. Cross-post or adapt for r/solotravel (2.8M members) within 24 hours if r/surfing gets traction.
5. Monitor Plausible for 72 hours. Key metrics: unique visitors, referral source breakdown, bounce rate, time on site, top pages.

**Success criteria:**
- 200+ unique visitors from Reddit in 72 hours = promising signal
- 50+ visitors = weak but learn from comments
- <50 = rethink the hook/framing, not the channel

**Fallback:** If r/surfing post gets removed (self-promo rules), pivot to r/digitalnomad or r/travel with a "weekend trip planning" angle instead.

---

## Retention Score: 5/10 (unchanged)

| Factor | Score | Notes |
|--------|-------|-------|
| Core value loop | 7/10 | Browsing is enjoyable. Condition scores are genuinely useful. Photos make venues desirable. |
| Reason to return | 3/10 | Conditions change daily but nothing triggers the return. No push, no email, no SMS. |
| Notifications | 1/10 | Alert toggles in UI fire nothing. Zero outbound re-engagement. |
| Personalization | 4/10 | Onboarding captures prefs, explore uses them lightly for hero personalization. |
| Data lock-in | 4/10 | localStorage wishlists/alerts/trips. Clear cache = gone. No account sync. |
| Social / viral | 2/10 | Share buttons exist but no deep links kills the loop. |
| Content freshness | 6/10 | Weather + flights update live. 170+ venue photos. 5 new categories added. |
| UX quality / delight | 7/10 | Tactile feedback, clean typography, polished CTAs. |
| Analytics feedback loop | NEW | Plausible now enables measuring what retains users. Not a retention mechanism itself, but makes improving retention possible. |

**Overall: 5/10.** No change in the score because no new retention mechanisms shipped. What changed is our ability to *measure* retention behavior, which is the prerequisite to improving it. After the Reddit launch, Plausible data will reveal: do users come back? How many sessions per user? What's the return visit rate after day 1?

**Path to 7/10:** Push notifications + email capture + venue deep links + PWA install. The order matters: deep links first (unlocks viral re-engagement from shared links), then PWA (unlocks home screen presence), then push notifications (unlocks direct re-engagement).

---

## Decision Made

**Launch Reddit distribution this week. No more infrastructure gatekeeping.**

Rationale: The measurement layer is live. SEO foundations are set. The app is at 9/10 design quality. Every previous report identified analytics as the singular blocker to distribution. That blocker is now resolved. Continuing to build infrastructure (deep links, PWA, push) before any real users see the product is a classic pre-launch trap. Ship distribution now, learn from real traffic, then prioritize the next infrastructure piece based on data.

The priority stack shifts from "build before you launch" to "launch, then iterate":

1. **Reddit soft launch** -- r/surfing within 48 hours. This is the single highest-priority action.
2. **Venue deep links** -- hash routing (#venue/pipeline). 4-6 hours. Build this the moment after the Reddit post, while traffic is arriving. Users who want to share a specific venue will try and fail -- deep links become urgent, not theoretical.
3. **PWA manifest + apple-touch-icon** -- 2-3 hours. Build after deep links. Enables "Add to Home Screen" for users who want to keep Peakly.
4. **Analyze Plausible data** -- 72 hours post-Reddit. Use real user behavior to decide what to build next instead of guessing.
5. **Push notification basics** -- browser Notification API. Build only if Plausible shows return visits are happening (users want to come back but forget). If no return visits, push won't help -- the problem is value, not reminder.

---

## 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1 (Now) | Reddit r/surfing launch + monitor Plausible | 150-400 |
| Week 2-3 | Venue deep links + PWA + second Reddit push (r/solotravel, r/skiing) | 600-1,800 |
| Week 4-5 | Product Hunt launch (Top 15 target) | 2,500-5,000 |
| Week 6-8 | TikTok test + email capture + push notifications | 3,500-6,500 |
| Week 9-12 | SEO content pages ranking + affiliate revenue live + iterate on retention | 5,000-8,000 |

**Realistic 90-day number: 5,000-8,000 users** with zero ad spend. Revised up from 4,000-7,000 in v7 because two compounding factors are now in play: (a) SEO foundations mean organic search traffic begins accruing from week 1, and (b) Plausible data will enable optimizing conversion at each funnel stage rather than guessing.

### Path to 100K

90 days will not reach 100K. The bridge requires:

1. **Working viral loop** -- venue deep links + shareable condition cards. Each share must open the specific venue. Highest-leverage feature remaining. Build this week.
2. **SEO content engine** -- programmatic pages ("best surf in Bali March 2026") that rank and compound. Each page is a permanent acquisition channel. The sitemap and robots.txt are now in place to support this.
3. **Native store presence** -- Android TWA wrapping the PWA, iOS Safari PWA with proper icons. Unlocks ASO discovery.
4. **Push notifications** -- driving D7 retention above 15%. Currently estimated at 3-5% with no outbound re-engagement.
5. **Affiliate revenue** reinvested into targeted paid acquisition once organic PMF is proven.

**Estimated timeline to 100K: 12-18 months** (bootstrapped) or **6-9 months** (with seed funding for native apps + paid channels).

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 (v8) | GREEN LIGHT Reddit launch within 48 hours | Analytics blocker resolved. Three days of gatekeeping is enough. Real users > more infrastructure. |
| 2026-03-24 (v8) | 90-day projection raised to 5,000-8,000 | SEO foundations + analytics-driven optimization compound across all channels. |
| 2026-03-24 (v8) | Shareability score raised to 7.5/10 | SEO presence (robots.txt, sitemap, canonical, title tag) adds a passive discovery channel. |
| 2026-03-24 (v8) | Build deep links immediately after Reddit post, not before | Real user friction > theoretical friction. Let traffic reveal the pain point urgently. |
| 2026-03-24 (v7) | Shift all effort from UX to distribution/retention infrastructure | UX at 9/10. Diminishing returns. |
| 2026-03-24 (v6) | Do NOT launch Reddit until Plausible is live | Unmeasured distribution is wasted distribution. (NOW RESOLVED) |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated free-tier surf community. |
| 2026-03-23 | Venue share links = #1 feature priority post-analytics | Without shareable venues, growth ceiling is low. |
| 2026-03-23 | Product Hunt delayed to late April | PWA + venue links must ship first. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. |

---

## Priority Stack

1. **Reddit r/surfing post** -- within 48 hours. No more delays. This is job #1.
2. **Venue deep links** -- hash routing (#venue/pipeline). Build immediately after posting. 4-6 hours.
3. **PWA manifest + apple-touch-icon** -- 2-3 hours. Enables installability.
4. **Analyze Plausible data** -- 72 hours post-Reddit. First real user data. Inform all subsequent priorities.
5. **Push notification basics** -- browser Notification API. Build only if data shows return intent.
6. **Second Reddit wave** -- r/solotravel, r/skiing, r/snowboarding. Adapt messaging per community.
7. **Product Hunt prep** -- branded OG image, deep links working, PWA installable. Target late April.

---

*Next report: 2026-03-25*
