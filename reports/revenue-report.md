# Peakly Revenue Report: 2026-03-23 (v5)

## Revenue Readiness: SOFT LAUNCH (unchanged)

Three affiliate streams are live and earning-ready. No code changes since v4 -- recent work focused on photos and UX polish, which improves trust signals and affiliate click-through but adds no new revenue streams. The app can earn money today with traffic.

---

## Streams Status

| # | Stream | Type | Status | Notes |
|---|--------|------|--------|-------|
| 1 | **Amazon Associates** | Gear affiliate (4%) | **WORKING** | 20 product URLs, all tagged `peakly-20`. Covers surf, tanning, diving, kite, fishing, paraglide categories. |
| 2 | **REI** | Gear affiliate (5%) | **NEEDS SIGNUP** | 18 product URLs in place. No affiliate tag appended -- REI requires Avantlink approval first. Links function as plain search URLs (zero tracking). |
| 3 | **Backcountry** | Gear affiliate (8%) | **NEEDS SIGNUP** | 2 product URLs (MTB helmet + knee pads). No affiliate tag. Highest commission rate of any gear partner. |
| 4 | **Booking.com** | Hotel affiliate | **WORKING** | `aid=2311236` attached to hotel search link in VenueDetailSheet. Dynamic per-venue location encoding. Commission ~25-40% of Booking's margin. |
| 5 | **SafetyWing** | Insurance referral | **WORKING** | 1 referral link with `referenceID=peakly`. Recurring commission on Nomad Insurance ($45/mo product). |
| 6 | **GetYourGuide** | Experiences affiliate | **NEEDS SIGNUP** | 2 references in codebase. No partner_id in URLs -- currently organic links with zero tracking. |
| 7 | **Google Flights** | Flight deep links | **NO REVENUE** | Deep links with pre-filled routes/dates via `buildFlightUrl()`. No affiliate program exists -- pure user value. |
| 8 | **Peakly Pro** | Subscription ($9/mo) | **NOT BUILT** | Upsell UI exists. Button triggers "coming soon" alert. No Stripe or payment integration. |

---

## Amazon Tag Verified: YES -- 20 of 20

Grep count of `tag=peakly-20` in app.jsx: **20 exact matches**. Every Amazon URL in GEAR_ITEMS contains the tag. Zero Amazon URLs missing tracking. No change from v3/v4.

---

## Estimated RPM (per 1,000 MAU)

Assumptions: 10% view venue detail sheet, 3% click affiliate link, 2% convert on destination site. Photo improvements estimated to lift click-through 25-35% vs. no-photo baseline (not yet reflected in RPM -- insufficient data).

| Stream | Status | Click-through | Avg Order | Commission | Est. RPM |
|--------|--------|--------------|-----------|------------|----------|
| Amazon gear | LIVE | 30 clicks/1K | $120 | 4% | **$2.88** |
| REI gear | NO TAG | 0 | -- | 5% | **$0.00** |
| Backcountry | NO TAG | 0 | -- | 8% | **$0.00** |
| Booking.com | LIVE | 20 clicks/1K | $300 (2 nights) | ~$15/booking | **$6.00** |
| SafetyWing | LIVE | 5 clicks/1K | $45/mo | ~10% | **$0.45** |
| GetYourGuide | NO ID | 0 | -- | 8% | **$0.00** |
| Google Flights | N/A | -- | -- | 0% | **$0.00** |
| Peakly Pro | NOT BUILT | -- | $9/mo | 100% | **$0.00** |
| **Total (live)** | | | | | **$9.33** |

With REI + GetYourGuide activated: estimated RPM ~$14-16.

---

## Top Revenue Blocker

**REI affiliate signup.** 18 gear items linking to REI (skis, wetsuits, harnesses, GPS units, dry suits -- the highest-value outdoor equipment) generate zero commission. At 5% on avg $250 items, this is ~$4-5/1K users left on the table. REI's Avantlink affiliate program has straightforward approval for outdoor content sites. This is a 30-minute signup task that unlocks revenue on code already shipped.

---

## Fastest Path to First Dollar

**Drive one user to click a Booking.com hotel link and complete a stay.**

- Booking.com is fully working (aid=2311236 confirmed in code)
- Hotel bookings have the highest per-transaction value ($150-300+)
- Commission ~$15-40 per completed booking
- Every venue detail sheet shows the hotel CTA -- no extra UI work needed
- Photos + UX polish (v5 improvements) increase trust and time-on-page, making hotel click-through more likely

**Action:** Share a single Peakly venue link targeting travelers actively planning a trip (Reddit r/travel, surf/ski forums, social). One hotel booking = first dollar.

---

## Decision Made

**No change from v4 -- REI affiliate signup remains the top priority.** It unlocks revenue on 18 high-value product links already built and displayed to users. Zero code changes required -- just append the affiliate tag parameter to existing REI URLs after approval. This is the highest-leverage 30-minute task available. Secondary: apply for GetYourGuide partner program.

---

## 30-Day Projection

**Current streams only (Amazon + Booking.com + SafetyWing):**

| MAU | Amazon | Booking.com | SafetyWing | **Total/mo** |
|-----|--------|-------------|------------|-------------|
| 1,000 | $2.88 | $6.00 | $0.45 | **$9.33** |
| 10,000 | $28.80 | $60.00 | $4.50 | **$93.30** |
| 100,000 | $288 | $600 | $45 | **$933** |

**With REI + Backcountry + GetYourGuide activated:**

| MAU | **Projected Total/mo** |
|-----|----------------------|
| 1,000 | $20-35 |
| 10,000 | $200-350 |
| 100,000 | $2,000-3,500 |

**With Peakly Pro at 2% conversion ($9/mo):**

| MAU | Pro subs | Pro revenue | **Grand Total/mo** |
|-----|----------|-------------|-------------------|
| 1,000 | 20 | $180 | **$200-215** |
| 10,000 | 200 | $1,800 | **$2,000-2,150** |
| 100,000 | 2,000 | $18,000 | **$20,000-21,500** |

---

## v5 Delta (what changed since v4)

- **No new revenue streams added.** Code unchanged on affiliate front.
- **Photo + UX polish impact:** Real venue photos and improved UI increase trust signals, time-on-page, and affiliate click-through potential. Estimated 25-35% uplift in conversion vs. no-photo baseline, but this is not yet measurable without traffic analytics.
- **Amazon tag count:** 20 (unchanged).
- **REI links:** 18 (unchanged, still untagged).
- **Booking.com:** 1 link with aid (unchanged).
- **SafetyWing:** 1 link with referenceID (unchanged).

**Bottom line:** Revenue infrastructure is stable. The app needs traffic, not more affiliate plumbing. Ship REI signup, then focus on distribution.
