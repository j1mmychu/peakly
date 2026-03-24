# Peakly Growth Report: 2026-03-24

## Dashboard

| Metric | Value |
|--------|-------|
| **Growth Stage** | Pre-launch: foundation incomplete |
| **Shareability Score** | 7/10 |
| **Launch Readiness** | Reddit: CONDITIONAL GO. Product Hunt: 4 blockers remain. |
| **This Week's Experiment** | Reddit condition cards — blocked until analytics is live |
| **Retention Score** | 4.5/10 |
| **Decision Made** | Do not post to Reddit until Plausible is live. Analytics-first, distribution-second. Every day without Plausible is a wasted day. |
| **90-Day Projection** | 3,500-5,500 users (Reddit + PH + organic, zero spend) |

---

## 1. OG Tag Verification (Live)

Fetched `https://j1mmychu.github.io/peakly/` on 2026-03-24. Live site HTML confirmed identical to local `index.html`.

| Tag | Value | Status |
|-----|-------|--------|
| `og:title` | "Peakly -- Adventure When Conditions Align" | LIVE |
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
| `apple-touch-icon` | **MISSING** | BLOCKING |
| `link rel="manifest"` | **MISSING** | BLOCKING |
| Plausible/GA4 analytics | **MISSING** | CRITICAL |

**What changed since yesterday:** Nothing. No push has occurred. The .nojekyll fix and any code changes are still local-only. The live site serves the same HTML as yesterday (cache-buster `?v=20260323b` unchanged).

**Shareability gaps (blocking 9+/10):**
- No venue-level OG tags (every share shows the same generic mountain image)
- No apple-touch-icon (iOS home screen bookmark shows blank white square)
- No PWA manifest (cannot "Add to Home Screen" on Android)

---

## 2. Share Mechanism Audit (app.jsx)

Two share paths exist in the codebase:

**1. Profile tab "Share Peakly" button (~line 3417)**
- Uses `navigator.share()` API with clipboard fallback
- Shares generic message + `https://j1mmychu.github.io/peakly` link
- Works, but sends every user to the same homepage -- no venue context

**2. Venue detail "Share & Invite" panel (~line 4201)**
- Copies venue-specific text card (title, location, score, flight price) to clipboard
- Also has a shareable text snippet with `j1mmychu.github.io/peakly`
- No deep link to the specific venue -- recipient lands on homepage and has to find it manually

**Verdict:** Share mechanisms exist but lack venue deep links. This kills the viral loop. A shared venue card with no way to open that venue directly is friction that prevents pass-along growth. Venue deep links remain the #1 feature priority for shareability.

---

## 3. PWA & Installability Audit

| Check | Status |
|-------|--------|
| `manifest.json` / `<link rel="manifest">` | NOT PRESENT |
| Service worker registration | NOT PRESENT |
| `apple-touch-icon` | NOT PRESENT |
| `apple-mobile-web-app-capable` | NOT PRESENT |
| `beforeinstallprompt` handling in app.jsx | NOT PRESENT |

**Impact:** The app cannot be installed to home screen on any platform. No PWA install prompt will ever fire. On iOS, bookmarking shows a blank icon. This matters because home screen apps get 3-4x the return visit rate of bookmarked URLs.

---

## 4. Retention Hook Audit

| Hook | Status | Impact |
|------|--------|--------|
| Push notifications | NOT IMPLEMENTED | Alerts tab is UI theater -- toggles do nothing |
| Email capture / digest | NOT IMPLEMENTED | No way to re-engage churned users |
| Streak / gamification | NOT IMPLEMENTED | No reason to open daily |
| PWA install prompt | NOT IMPLEMENTED | Can't get on home screen |
| Personalized home feed | PARTIAL | Onboarding captures prefs, explore tab uses them lightly |
| localStorage persistence | WORKING | Wishlists, alerts, trips, profile all persist across sessions |
| Auto-refresh weather | WORKING | 10-minute interval keeps data fresh within a session |
| Condition score changes | IMPLICIT | Scores change daily, creating natural curiosity pull -- but nothing prompts the return |

**Retention verdict:** The app has no outbound re-engagement mechanism. Once a user closes the tab, Peakly has zero ability to bring them back. The only return driver is the user remembering Peakly exists and manually navigating back. This is the single biggest growth bottleneck.

---

## 5. Launch Readiness

### Reddit Soft Launch: CONDITIONAL GO

The app is visually polished enough (109+ venue photos, clean OG cards, live scoring). But posting without analytics is flying blind.

| Requirement | Status |
|-------------|--------|
| App looks professional | YES -- photos, scoring, flight prices |
| OG tags render clean previews | YES -- verified live |
| Content angle exists | YES -- real-time condition data is genuinely useful |
| Analytics to measure results | **NO -- Plausible not added** |
| Ability to track Reddit referrals | **NO -- no UTM params, no analytics** |

**Decision: Do NOT post to Reddit until Plausible is live.** Yesterday's report recommended adding Plausible "today." It still hasn't been added. Until it is, any Reddit experiment is unmeasurable and therefore un-learnable.

### Product Hunt: NOT READY -- 4 Blockers

| Blocker | Impact | Effort |
|---------|--------|--------|
| No analytics | Can't measure PH spike or retention | 5 minutes |
| No PWA manifest / install prompt | PH expects installable apps | 2-3 hours |
| No push notifications | Alerts tab is theater, PH crowd will call it out | 1-2 days |
| No venue deep links | Can't go viral post-PH if users can't share spots | 4-6 hours |

**Target PH date: Late April / early May 2026** (unchanged from yesterday).

---

## 6. Retention Score: 4.5/10

| Factor | Score | Delta vs Yesterday | Notes |
|--------|-------|--------------------|-------|
| Core value loop | 6/10 | -- | Condition scores + photos make browsing engaging |
| Reason to return | 3/10 | -- | Conditions change daily but nothing triggers return |
| Notifications | 1/10 | -- | Alert toggles exist, fire nothing |
| Personalization | 4/10 | -- | Onboarding captures prefs, explore uses them lightly |
| Data lock-in | 4/10 | -- | localStorage persistence works but fragile (clear cache = gone) |
| Social / viral | 2/10 | -- | Share buttons exist but no deep links, no viral loop |
| Content freshness | 6/10 | -- | Weather + flights update live. 109 photos. |

**Overall: 4.5/10** (down from 5/10 yesterday -- adjusted because share audit revealed deep link gap is worse than assumed; share buttons exist but the lack of venue deep links makes them functionally broken for viral growth).

**Path to 7/10:** Push notifications (alerts actually fire) + email capture (weekly digest) + venue deep links (social pull-back loop) + PWA install (home screen presence).

---

## 7. This Week's Experiment: Reddit Condition Cards (ON HOLD)

### Status: BLOCKED by analytics

The experiment design from yesterday is sound. The execution is paused.

**Unblock sequence (in exact order):**
1. Add Plausible analytics script to `index.html` (5 minutes of code, requires push)
2. Verify Plausible dashboard shows pageviews (wait 1 hour)
3. Screenshot a venue showing "Epic" or "Firing" conditions
4. Post to r/surfing with conditions-first framing
5. Monitor Plausible for 72 hours

**Do not skip step 1.** Posting to Reddit without analytics is like running an A/B test without logging results.

---

## 8. Competitive Intel Update

No material changes from yesterday's competitive scan. Key dynamics remain:

- **MagicSeaweed vacuum** persists. Surfline's $99/yr paywall continues to generate complaints in r/surfing. This remains Peakly's best early adopter pool.
- **No new entrant** has combined conditions + flights + multi-sport in a single free tool.
- **Google Flights** still does not surface condition data alongside pricing. This gap is Peakly's window.

---

## 9. 90-Day Projection

| Timeframe | Milestone | Cumulative Users |
|-----------|-----------|-----------------|
| Week 1-2 | Plausible live + Reddit soft launch | 200-500 |
| Week 3-4 | Venue deep links + PWA shipped | 800-1,800 |
| Week 5-6 | Product Hunt launch (Top 10 target) | 2,500-4,000 |
| Week 7-8 | Second Reddit push + TikTok test | 3,200-5,000 |
| Week 9-12 | SEO content + email digest + affiliate rev | 3,500-5,500 |

**Realistic 90-day number: 3,500-5,500 users** with zero ad spend. Revised down slightly from yesterday's 4,000-6,000 because the analytics blocker has cost another day and the retention score is lower than estimated.

### Path to 100K

90 days will not hit 100K. The bridge requires:
1. **Native store presence** (Android TWA, iOS Safari PWA) -- unlocks ASO discovery
2. **SEO content engine** ("best surf in Bali March 2026" pages) -- compounds over months
3. **Working viral loop** (venue deep links + shareable condition cards) -- organic multiplier
4. **Push notifications** driving D7 retention above 15% (currently estimated ~3-5%)
5. **Affiliate revenue** reinvested into targeted acquisition

**Estimated timeline to 100K: 12-18 months** (zero funding) or **6-9 months** (with seed for native apps + paid channels).

---

## 10. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Do NOT launch Reddit experiment until Plausible is live | Unmeasured distribution is wasted distribution. This was recommended yesterday and still hasn't shipped. |
| 2026-03-24 | Retention score downgraded to 4.5/10 | Share audit reveals venue deep links are missing -- share buttons exist but lack utility without them. |
| 2026-03-24 | 90-day projection adjusted to 3,500-5,500 | Analytics delay + lower retention score = slightly lower ceiling. |
| 2026-03-23 | Reddit soft launch this week | App visually polished, OG tags live, conditions data is useful content. |
| 2026-03-23 | Target displaced MagicSeaweed users first | MSW dead + Surfline paywall = frustrated free-tier surf community. |
| 2026-03-23 | Venue share links = #1 feature priority post-analytics | Without shareable venues, growth ceiling is low regardless of channel. |
| 2026-03-23 | Product Hunt delayed to late April | PWA + push + venue links must ship first. |
| 2026-03-23 | Skip paid acquisition until D7 retention > 15% | Validate PMF organically first. Spend $0 until retention proves out. |

---

## Priority Stack (What To Ship, In Order)

1. **Plausible analytics** -- 5 minutes, one script tag, push to main. THIS IS DAY 2 OF ASKING.
2. **First Reddit post** -- r/surfing, conditions-first, within 24 hours of Plausible going live.
3. **Venue deep links** with hash routing -- 4-6 hours, unlocks viral sharing.
4. **PWA manifest + apple-touch-icon** -- 2-3 hours, unlocks installability.
5. **Push notification basics** (even browser Notification API) -- 1-2 days, makes alerts real.

---

*Next report: 2026-03-25*
