# Peakly Revenue Report: 2026-03-24 (v6)

## Revenue Readiness: SOFT LAUNCH (unchanged)

Three affiliate streams remain live and earning-ready (Amazon, Booking.com, SafetyWing). No new revenue streams have been added since v5. Zero affiliate code changes detected. The app can earn money today if it receives traffic. LLC approval continues to block expansion into REI, Backcountry, GetYourGuide, and Peakly Pro.

---

## Streams Status

| # | Stream | Type | Status | Notes |
|---|--------|------|--------|-------|
| 1 | **Amazon Associates** | Gear affiliate (4%) | **WORKING** | 20 product URLs, all tagged `peakly-20`. Covers surf, tanning, diving, kite, fishing, paraglide categories. |
| 2 | **REI** | Gear affiliate (5%) | **NEEDS SIGNUP** | 18 product URLs in place. No affiliate tag appended. Links function as plain search URLs (zero tracking). Blocked by LLC. |
| 3 | **Backcountry** | Gear affiliate (8%) | **NEEDS SIGNUP** | 2 product URLs (MTB helmet + knee pads). No affiliate tag. Blocked by LLC. |
| 4 | **Booking.com** | Hotel affiliate | **WORKING** | `aid=2311236` attached to hotel search link in VenueDetailSheet. Dynamic per-venue location encoding. Commission ~25-40% of Booking's margin. |
| 5 | **SafetyWing** | Insurance referral | **WORKING** | 1 referral link with `referenceID=peakly`. Recurring commission on Nomad Insurance ($45/mo product). |
| 6 | **GetYourGuide** | Experiences affiliate | **NEEDS SIGNUP** | 1 dynamic link in VenueDetailSheet. No partner_id in URL -- currently organic links with zero tracking. Blocked by LLC. |
| 7 | **Google Flights** | Flight deep links | **NO REVENUE** | `buildFlightUrl()` called 3 times across ListingCard, FeaturedCard, VenueDetailSheet. No affiliate program exists -- pure user value. |
| 8 | **Peakly Pro** | Subscription ($79/year) | **NOT BUILT** | Upsell banner exists in VenueDetailSheet. Button triggers `alert("Peakly Pro coming soon!")`. No Stripe/Paddle integration. No pricing displayed in the UI. Blocked by LLC + Stripe setup. |

---

## Amazon Tag Verified: YES -- 20 of 20

Grep count of `tag=peakly-20` in app.jsx: **20 exact matches**. Every Amazon URL in GEAR_ITEMS contains the tag. Zero Amazon URLs missing tracking. No change from v5.

---

## Estimated RPM (per 1,000 MAU)

Assumptions unchanged: 10% view venue detail sheet, 3% click affiliate link, 2% convert on destination site.

| Stream | Status | Click-through | Avg Order | Commission | Est. RPM |
|--------|--------|--------------|-----------|------------|----------|
| Amazon gear | LIVE | 30 clicks/1K | $120 | 4% | **$2.88** |
| REI gear | NO TAG | 0 | -- | 5% | **$0.00** |
| Backcountry | NO TAG | 0 | -- | 8% | **$0.00** |
| Booking.com | LIVE | 20 clicks/1K | $300 (2 nights) | ~$15/booking | **$6.00** |
| SafetyWing | LIVE | 5 clicks/1K | $45/mo | ~10% | **$0.45** |
| GetYourGuide | NO ID | 0 | -- | 8% | **$0.00** |
| Google Flights | N/A | -- | -- | 0% | **$0.00** |
| Peakly Pro | NOT BUILT | -- | $79/yr | 100% | **$0.00** |
| **Total (live)** | | | | | **$9.33** |

With REI + Backcountry + GetYourGuide activated: estimated RPM ~$14-16.

---

## Top Revenue Blocker

**LLC approval.** This single dependency blocks four revenue streams (REI, Backcountry, GetYourGuide affiliate signups) and the highest-value stream (Peakly Pro via Stripe). The 18 REI gear links and 2 Backcountry links already exist in the codebase but generate zero commissions. Until the LLC clears, the revenue ceiling is $9.33/1K MAU from the three active streams. After LLC, the ceiling rises to $14-16/1K MAU on affiliates alone, plus unbounded upside from Peakly Pro subscriptions.

Secondary blocker: **No analytics.** Without GA4 or Plausible, there is no way to measure traffic, click-through rates, or conversion. Revenue estimates remain theoretical.

---

## Fastest Path to First Dollar

**Drive one user to click a Booking.com hotel link and complete a stay.**

- Booking.com is fully working (`aid=2311236` confirmed in code)
- Hotel bookings have the highest per-transaction value ($150-300+)
- Commission ~$15-40 per completed booking
- Every venue detail sheet shows the hotel CTA -- no extra UI work needed
- No LLC required -- Booking.com affiliate is already active

**Action:** Share a specific Peakly venue link (e.g., a trending surf or ski spot) in a relevant Reddit thread (r/solotravel, r/surfing, r/skiing) where someone is actively planning a trip. One hotel booking = first dollar.

---

## Decision Made

**LLC approval is the critical path.** Every day without the LLC is a day where 20 gear links (REI + Backcountry) and the entire Peakly Pro subscription tier earn zero. Prioritize LLC completion above all other revenue work. Once approved, the immediate action sequence is:

1. Sign up for REI Avantlink affiliate (30 min, unlocks 18 links)
2. Sign up for Backcountry affiliate (30 min, unlocks 2 links)
3. Sign up for GetYourGuide partner program (30 min, unlocks experience links)
4. Begin Stripe integration for Peakly Pro ($79/year)

In parallel (not blocked by LLC): add GA4 analytics to start measuring actual traffic and affiliate click-through.

---

## 30-Day Projection

**Current streams only (Amazon + Booking.com + SafetyWing):**

| MAU | Amazon | Booking.com | SafetyWing | **Total/mo** |
|-----|--------|-------------|------------|-------------|
| 1,000 | $2.88 | $6.00 | $0.45 | **$9.33** |
| 10,000 | $28.80 | $60.00 | $4.50 | **$93.30** |
| 100,000 | $288 | $600 | $45 | **$933** |

**With REI + Backcountry + GetYourGuide activated (post-LLC):**

| MAU | **Projected Total/mo** |
|-----|----------------------|
| 1,000 | $20-35 |
| 10,000 | $200-350 |
| 100,000 | $2,000-3,500 |

**With Peakly Pro at 2% conversion ($79/year = $6.58/mo):**

| MAU | Pro subs | Pro revenue | **Grand Total/mo** |
|-----|----------|-------------|-------------------|
| 1,000 | 20 | $132 | **$152-167** |
| 10,000 | 200 | $1,317 | **$1,517-1,667** |
| 100,000 | 2,000 | $13,167 | **$15,167-16,667** |

---

## v6 Delta (what changed since v5)

- **No new revenue streams added.** Affiliate code unchanged.
- **Amazon tag count:** 20 (unchanged).
- **REI links:** 18 (unchanged, still untagged).
- **Backcountry links:** 2 (unchanged, still untagged).
- **Booking.com:** 1 link with aid (unchanged).
- **SafetyWing:** 1 link with referenceID (unchanged).
- **GetYourGuide:** 1 dynamic link, no partner_id (unchanged).
- **AFFILIATE_ID placeholders:** 0 found (previous placeholders have been cleaned up or were never in current code).
- **Peakly Pro pricing updated in CLAUDE.md** from $9/mo to $79/year (decision made 2026-03-23). Pro upsell UI in app.jsx still shows no price -- just "Peakly Pro coming soon" alert. Projections updated to reflect $79/year pricing.
- **Top blocker shifted** from "REI affiliate signup" to "LLC approval" -- REI signup itself is a 30-minute task, but it requires the LLC to be in place first.

**Bottom line:** Revenue infrastructure is stable but capped at $9.33/1K MAU. The LLC is the single gate blocking 60%+ of potential affiliate revenue and 100% of subscription revenue. Get the LLC approved, then execute the four signups in sequence. In the meantime, drive any traffic at all to unlock the first Booking.com commission.
