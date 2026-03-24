# Peakly Revenue Report: 2026-03-23

**Revenue Readiness: SOFT LAUNCH**

No change from last report. All placeholder links are fixed, but zero affiliate programs have been formally signed up for (no affiliate IDs/tags on REI, Amazon, or Backcountry links). Revenue is leaking through untracked clicks.

---

## Fixes Verified

| Check | Status |
|-------|--------|
| `AFFILIATE_ID` placeholders in code | **ZERO found** — all cleaned up |
| Amazon `amzn.to` shortlinks | **ZERO found** — replaced with proper search URLs |
| GetYourGuide fake affiliate params | **FIXED** — links now use clean search URLs |
| Booking.com `aid=2311236` | **Present** — still unverified if this is a real/approved affiliate ID |
| SafetyWing referral link | **Working** — `referenceID=peakly` parameter present |
| REI/Backcountry links | **Fixed** — proper search/product URLs, but NO affiliate tags attached |

All fixes from last report confirmed intact.

---

## Active Revenue Streams

### 1. Google Flights deep links
- **Status: WORKING (no commission)**
- Links on: ListingCard, FeaturedCard, VenueDetailSheet (3 touchpoints)
- Uses `buildFlightUrl()` to Google Flights with dates
- Google Flights has no affiliate program — this drives zero revenue
- **Revenue: $0**

### 2. Booking.com hotel links
- **Status: NEEDS VERIFICATION**
- `aid=2311236` appended to all hotel search links
- Shows on every VenueDetailSheet (1 touchpoint per venue view)
- Commission: ~25-40% of Booking.com's margin (typically $4-12 per booking)
- **IF the aid is valid: this is the highest-value stream**
- **Action needed: Log into Booking.com affiliate dashboard and verify aid=2311236 is active and tracking**

### 3. SafetyWing travel insurance
- **Status: WORKING**
- `referenceID=peakly` tracks referrals
- Shows on every VenueDetailSheet (1 touchpoint per venue view)
- Commission: ~10% recurring ($4.50/month per conversion, ~$54/year)
- Low conversion rate expected (~0.5-1% of venue viewers)
- **Revenue: Active and trackable**

### 4. GetYourGuide experiences
- **Status: NOT EARNING (no affiliate ID)**
- 10 categories x 3 experiences = 30 experience cards
- Links use clean `getyourguide.com/s/?q=` search URLs
- No affiliate/partner ID attached — clicks are untracked
- Commission would be 8% if signed up
- **Action needed: Apply at partner.getyourguide.com**

### 5. Amazon gear links (20 items)
- **Status: NOT EARNING (no Associates tag)**
- 20 gear items across 10 categories link to Amazon search pages
- No `tag=` parameter — clicks generate zero commission
- Commission would be 4% (outdoor/sports category)
- **Action needed: Sign up for Amazon Associates, append `&tag=peakly-20` to all URLs**

### 6. REI gear links (18 items)
- **Status: NOT EARNING (no affiliate tag)**
- 18 gear items link to REI search pages
- REI affiliate program via Avantlink or CJ — not signed up
- Commission would be 5%
- **Action needed: Apply at REI affiliate program**

### 7. Backcountry gear links (2 items)
- **Status: NOT EARNING (no affiliate tag)**
- 2 direct product links (Troy Lee helmet, Fox knee pads)
- No affiliate tracking
- Commission would be ~8%
- **Action needed: Apply at Backcountry affiliate program (Avantlink)**

### 8. Peakly Pro ($9/mo subscription)
- **Status: UI MOCKUP ONLY**
- Beautiful upsell card on every VenueDetailSheet
- Button triggers `alert("Peakly Pro coming soon!")` — no payment flow
- Features listed: condition alerts, 90-day graphs, crowd calendar, price drop alerts
- **Revenue: $0 — needs Stripe integration**

---

## Monetization Touchpoints Per Venue View

When a user taps into a VenueDetailSheet, they see this revenue funnel (top to bottom):

1. **Flight CTA** — Google Flights (no commission)
2. **Gear section** — 4 affiliate product links (no tracking)
3. **Experiences** — 3 GetYourGuide cards (no tracking)
4. **Booking.com hotel CTA** — possibly tracked (unverified aid)
5. **SafetyWing insurance CTA** — tracked and working
6. **Peakly Pro upsell** — alert() only

**Touchpoints per venue view: 6**
**Touchpoints actually earning: 1 confirmed (SafetyWing), 1 unverified (Booking.com)**

Additionally, ListingCard and FeaturedCard have flight "Book" buttons (Google Flights, no commission).

---

## Estimated RPM (Revenue Per 1,000 Users)

Assumptions: 1,000 monthly users, avg 8 venue views each, 15% click-through on CTAs.

| Stream | Click Rate | Conv Rate | Avg Commission | Monthly Rev |
|--------|-----------|-----------|----------------|-------------|
| SafetyWing | 3% of venue views | 1% of clicks | $4.50/mo recurring | $1.08 |
| Booking.com (if verified) | 5% of venue views | 2% of clicks | $8 per booking | $6.40 |
| Amazon (if tagged) | 8% of venue views | 3% of clicks | $6 avg | $11.52 |
| REI (if tagged) | 4% of venue views | 2% of clicks | $15 avg | $9.60 |
| GetYourGuide (if tagged) | 4% of venue views | 1.5% of clicks | $10 avg | $4.80 |
| Peakly Pro (if built) | 2% of users | 3% trial-to-paid | $9/mo | $5.40 |

**Current RPM: ~$1-7 per 1,000 users** (SafetyWing + maybe Booking.com)
**Potential RPM with all affiliates active: ~$39 per 1,000 users**
**Potential RPM with Pro tier: ~$44 per 1,000 users**

---

## Top Revenue Blocker

**No affiliate tags on Amazon, REI, or GetYourGuide links.** These three programs represent ~65% of potential affiliate revenue. The links exist, users click them, but Peakly earns nothing because there are no tracking IDs. This is money literally walking out the door.

Signing up for Amazon Associates takes 10 minutes and can be done today. One code change (appending `&tag=peakly-20` to 20 URLs) turns on revenue immediately.

---

## Peakly Pro Recommendation

**Price:** $9/month or $69/year (current UI shows $9/mo — good price point)

**Features to actually build (ordered by effort):**

1. **Condition alerts** (easiest) — localStorage + notification API, 1-2 day build
2. **Price drop alerts** — needs Travelpayouts polling, 2-3 day build
3. **90-day historical graphs** — needs data collection over time, or source historical weather API
4. **Crowd calendar** — hard to source data, could fake with seasonal heuristics

**Payment integration:** Stripe Checkout or Lemon Squeezy. Since Peakly is a static SPA, use Stripe's client-only Checkout (redirect to Stripe-hosted page, return with session ID, store subscription status in localStorage + verify via webhook on VPS proxy).

**Timeline:** MVP Pro tier (alerts + Stripe) in 1 week. Full feature set in 3 weeks.

**Recommendation:** Do NOT build Pro yet. First, activate all affiliate streams (1-day effort). Pro requires payment infrastructure and ongoing feature maintenance. Affiliates are passive income from day one.

---

## Decision Made

**Immediate action: Sign up for Amazon Associates today.** It is the single highest-impact revenue action — 20 product links already in the app, 4% commission, and Amazon has the highest conversion rate of any affiliate program. One signup + one code change = revenue on.

Priority order after Amazon:
1. Amazon Associates signup + tag insertion (today)
2. Verify Booking.com aid=2311236 (today)
3. GetYourGuide partner signup (this week)
4. REI affiliate signup via Avantlink (this week)
5. Backcountry affiliate signup (this week)

---

## 30-Day Projection

| Monthly Users | Current Rev (SafetyWing only) | With All Affiliates | With Pro Tier |
|--------------|-------------------------------|--------------------|----|
| 1,000 | $1-7 | $39 | $44 |
| 10,000 | $10-70 | $390 | $930 |
| 100,000 | $100-700 | $3,900 | $14,400 |

The jump at 100K with Pro is significant because subscription revenue scales linearly while affiliate revenue has diminishing returns (not every user buys gear). At scale, Pro is the real business — affiliates are the bridge to get there.

---

## Summary

Peakly has excellent monetization architecture — 6 touchpoints per venue view, well-designed CTAs, and a compelling Pro upsell card. The problem is execution: only 1 of 6 revenue streams is confirmed working. The fix is not code — it is signing up for affiliate programs and adding tracking IDs. This is a 1-day effort that could 5-10x current revenue potential.

**Next report should show: Amazon Associates active, Booking.com verified, GetYourGuide application submitted.**
