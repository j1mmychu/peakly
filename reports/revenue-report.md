# Peakly Revenue Report: 2026-03-24 (v8)

## Revenue Readiness: MEASURABLE (upgraded from SOFT LAUNCH)

Plausible analytics is live (`data-domain="j1mmychu.github.io"` confirmed in index.html). For the first time, Peakly can measure real pageviews, outbound affiliate clicks, and conversion paths. This changes everything: revenue projections are no longer theoretical -- they can be validated within days. Three affiliate streams remain live (Amazon, Booking.com, SafetyWing). Five new categories shipped (diving, climbing, kayak, fishing, paraglide), each with 4 gear items and affiliate links, expanding the monetizable surface area. SEO improvements increase organic discoverability. LLC continues to block REI, Backcountry, GetYourGuide, and Peakly Pro.

---

## Streams Status

| # | Stream | Type | Status | Notes |
|---|--------|------|--------|-------|
| 1 | **Amazon Associates** | Gear affiliate (4%) | **WORKING** | 20 product URLs, all tagged `peakly-20`. Now spans 10 categories (was 5). New: diving, kite, fishing, paraglide gear. |
| 2 | **REI** | Gear affiliate (5%) | **NEEDS SIGNUP** | 18 product URLs. No affiliate tag. Spans skiing, surfing, diving, climbing, kayak, mtb, fishing. Blocked by LLC. |
| 3 | **Backcountry** | Gear affiliate (8%) | **NEEDS SIGNUP** | 2 product URLs (MTB helmet + knee pads). No affiliate tag. Blocked by LLC. |
| 4 | **Booking.com** | Hotel affiliate | **WORKING** | `aid=2311236` on hotel search link in VenueDetailSheet. Dynamic per-venue location. Commission ~25-40% of Booking's margin. |
| 5 | **SafetyWing** | Insurance referral | **WORKING** | 1 referral link with `referenceID=peakly`. Recurring commission on Nomad Insurance ($45/mo). |
| 6 | **GetYourGuide** | Experiences affiliate | **NEEDS SIGNUP** | 1 dynamic link in VenueDetailSheet. No partner_id -- zero tracking. Blocked by LLC. |
| 7 | **Google Flights** | Flight deep links | **NO REVENUE** | `buildFlightUrl()` powers Book CTAs. No affiliate program. Pure user value and funnel driver. |
| 8 | **Peakly Pro** | Subscription ($79/year) | **NOT BUILT** | UI still shows **$9/mo** (stale -- should be $79/year). Button triggers `alert()`. No Stripe. Blocked by LLC + Stripe setup. |

### Link Inventory (verified via grep)

| Affiliate | URL Count | Tagged/Tracked |
|-----------|-----------|----------------|
| Amazon (`tag=peakly-20`) | 20 | 20/20 (100%) |
| REI (`rei.com`) | 18 | 0/18 (0%) |
| Backcountry (`backcountry.com`) | 2 | 0/2 (0%) |
| Booking.com (`aid=2311236`) | 1 | 1/1 (100%) |
| SafetyWing (`referenceID=peakly`) | 1 | 1/1 (100%) |
| GetYourGuide | 1 | 0/1 (0%) |
| AFFILIATE_ID placeholders | 0 | Clean |

---

## Estimated RPM (per 1,000 MAU)

Key change in v8: with Plausible live, these estimates will be replaced by measured data within 7-14 days of meaningful traffic. The 5 new categories (diving, climbing, kayak, fishing, paraglide) expand the gear funnel -- more categories means more venue detail views where affiliate CTAs live. Estimated +20% increase in gear click surface area, though actual per-user conversion may not change.

| Stream | Status | Click-through | Avg Order | Commission | Est. RPM |
|--------|--------|--------------|-----------|------------|----------|
| Amazon gear | LIVE | 35 clicks/1K (+17% from expanded categories) | $165 (higher AOV from dive watches, kites, varios) | 4% | **$4.62** |
| REI gear | NO TAG | 0 | -- | 5% | **$0.00** |
| Backcountry | NO TAG | 0 | -- | 8% | **$0.00** |
| Booking.com | LIVE | 23 clicks/1K | $300 (2 nights) | ~$15/booking | **$6.90** |
| SafetyWing | LIVE | 6 clicks/1K | $45/mo | ~10% | **$0.54** |
| GetYourGuide | NO ID | 0 | -- | 8% | **$0.00** |
| Google Flights | N/A | -- | -- | 0% | **$0.00** |
| Peakly Pro | NOT BUILT | -- | $79/yr | 100% | **$0.00** |
| **Total (live)** | | | | | **$12.06** |

Previous v7 total: $10.32. The category expansion adds ~$1.74/1K MAU (+16.9%) primarily through higher Amazon AOV (premium gear in new categories: $590 vario GPS, $1,299 kites, $1,099 dive watches) and more entry points into the gear funnel.

With REI + Backcountry + GetYourGuide activated: estimated RPM ~$18-22 (revised up from $15-17 due to expanded category inventory).

---

## Top Revenue Blocker

**LLC approval.** Still the single blocker for four affiliate signups (REI, Backcountry, GetYourGuide) and Peakly Pro (Stripe). However, the severity has decreased slightly: the 5 new categories mean all 20 Amazon links and the Booking.com/SafetyWing links have a wider funnel to capture users from. The active streams now cover 10 sport categories instead of 5.

**Secondary blocker (RESOLVED): Analytics.** Plausible is live. This was the #2 blocker in v7 -- now cleared. Within 7-14 days of traffic, we will have real data on: pageviews, outbound click counts per affiliate, category popularity, and bounce rates. This data replaces every assumption in the RPM table above.

**Tertiary issue: Peakly Pro pricing mismatch.** Line 4591 in app.jsx still shows `$9/mo`. Agreed pricing is `$79/year`. Non-blocking since Pro is not functional, but should be fixed before launch.

**New gap: Hiking has no gear items.** Hiking is a category in `CATEGORIES` but has no entry in `GEAR_ITEMS`. This is the only category (besides "all") with zero monetization through gear. Should be added -- hiking gear (boots, poles, packs, headlamps) is high-AOV and REI/Amazon friendly.

---

## Fastest Path to First Dollar

**Unchanged: drive one user to click a Booking.com hotel link and complete a stay.**

- Booking.com `aid=2311236` confirmed working in code
- Commission ~$15-40 per completed booking
- No LLC required

**New advantage with Plausible:** We can now confirm whether Booking.com outbound clicks are actually happening. Set up a Plausible custom event or check outbound link tracking in the dashboard. If clicks are already occurring from organic/direct traffic and no revenue has appeared, the issue is downstream conversion (user doesn't book), not click-through. This diagnosis was impossible before analytics.

**Immediate action:** Check Plausible dashboard for any existing traffic. Even a handful of sessions with outbound clicks to booking.com validates the entire funnel.

---

## Decision Made

**Plausible changes the game from "guess and build" to "measure and optimize."** The revenue strategy shifts from theoretical RPM modeling to data-driven iteration:

1. **Week 1 (now):** Check Plausible for baseline traffic numbers. Any traffic at all? Which categories get views? Are outbound clicks happening?
2. **Week 2:** If traffic exists, identify the highest-traffic category and optimize its gear/affiliate placement first. If no traffic, the blocker is distribution, not monetization.
3. **Week 3-4:** With LLC (if approved), sign up REI/Backcountry/GetYourGuide and immediately measure incremental RPM vs. baseline.

This is the first report where we can say: "we'll know the real numbers soon" instead of "we estimate."

**Non-LLC actions for this week:**
1. Check Plausible dashboard for current traffic baseline (5 min)
2. Set up Plausible outbound link tracking if not auto-enabled (15 min)
3. Add hiking gear items to `GEAR_ITEMS` -- only category with zero gear monetization (30 min)
4. Fix Pro pricing copy from $9/mo to $79/year at line 4591 (5 min)

**Post-LLC action sequence (unchanged):**
1. REI Avantlink affiliate signup (30 min, unlocks 18 links)
2. Backcountry affiliate signup (30 min, unlocks 2 links)
3. GetYourGuide partner program (30 min, unlocks experience links)
4. Stripe integration for Peakly Pro ($79/year)

---

## 30-Day Projection

**Current streams only (Amazon + Booking.com + SafetyWing), with expanded categories:**

| MAU | Amazon | Booking.com | SafetyWing | **Total/mo** |
|-----|--------|-------------|------------|-------------|
| 1,000 | $4.62 | $6.90 | $0.54 | **$12.06** |
| 10,000 | $46.20 | $69.00 | $5.40 | **$120.60** |
| 100,000 | $462 | $690 | $54 | **$1,206** |

**With REI + Backcountry + GetYourGuide activated (post-LLC):**

| MAU | **Projected Total/mo** |
|-----|----------------------|
| 1,000 | $28-44 |
| 10,000 | $280-440 |
| 100,000 | $2,800-4,400 |

**With Peakly Pro at 2% conversion ($79/year = $6.58/mo):**

| MAU | Pro subs | Pro revenue | **Grand Total/mo** |
|-----|----------|-------------|-------------------|
| 1,000 | 20 | $132 | **$160-176** |
| 10,000 | 200 | $1,317 | **$1,597-1,757** |
| 100,000 | 2,000 | $13,167 | **$15,967-17,567** |

---

## v8 Delta (what changed since v7)

- **Plausible analytics live.** `<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.js">` confirmed in index.html. Revenue projections can now be validated with real data. Secondary blocker from v7 is resolved.
- **5 new categories shipped:** diving, climbing, kayak, fishing, paraglide. Each has 4 gear items in `GEAR_ITEMS` with affiliate links. Expands monetizable surface area by ~100% (from 5 to 10 gear categories).
- **Amazon tag count:** 20 (unchanged count, but now distributed across 10 categories instead of 5 -- wider funnel).
- **REI links:** 18 (unchanged, still untagged). Now spans 7 categories (added diving, climbing, kayak, fishing).
- **Backcountry links:** 2 (unchanged, still untagged).
- **Booking.com:** 1 link with aid (unchanged).
- **SafetyWing:** 1 link with referenceID (unchanged).
- **GetYourGuide:** 1 dynamic link, no partner_id (unchanged).
- **AFFILIATE_ID placeholders:** 0 found (clean).
- **SEO improvements shipped.** Increases organic discoverability -- the prerequisite for any affiliate revenue at scale.
- **Hiking gear gap identified.** Only category (besides "all") with no `GEAR_ITEMS` entry.
- **Peakly Pro pricing mismatch persists:** Line 4591 shows $9/mo, should be $79/year.
- **RPM revised:** $10.32 -> $12.06 (+$1.74, +16.9%) from higher Amazon AOV in new categories.
- **Top blocker:** LLC approval (unchanged, but analytics blocker now cleared).

**Bottom line:** The analytics gap is closed. For the first time, Peakly can measure what's actually happening. The 5 new categories with gear links expand the monetizable funnel significantly, and SEO improvements increase the chance of organic traffic reaching those funnels. The immediate priority is checking Plausible for any existing traffic -- if users are already visiting, revenue may be closer than projected. If traffic is zero, the focus shifts entirely to distribution (SEO payoff timeline, content marketing, community seeding) because the monetization infrastructure is as complete as it can be without the LLC.
