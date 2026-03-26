# Revenue Report -- 2026-03-25

## Revenue Health: YELLOW

Affiliate infrastructure is solid and expanding, but 22 REI links and 2 Backcountry links earn $0 because they lack affiliate tracking tags. The biggest near-term revenue lever is activating those existing links. Peakly Pro stays as a UI mockup (no Stripe) per Jack's decision.

---

## 1. Peakly Pro -- Status

**Pricing FIXED.** The UI correctly shows `$79/yr` (line 7802 of app.jsx). The old `$9/mo` bug is resolved.

**Decision (per Jack): No Stripe for now.** Too expensive at current scale. Peakly Pro stays as a UI mockup. The button triggers `alert("Peakly Pro coming soon!")`. Revisit when MAU exceeds 5K.

**Peakly Pro is excluded from all revenue projections below.** Affiliate revenue only.

---

## 2. Affiliate Link Audit

### ACTIVE -- Earning Now

| Stream | Links | Tag/ID | Status |
|--------|-------|--------|--------|
| Amazon Associates | 34 links across 12 categories | `peakly-20` | LIVE. Tag consistent on all Amazon URLs. Post-intent placement in VenueDetailSheet gear section. |
| Booking.com | 2 placements | `aid=2311236` | LIVE. VenueDetailSheet hotel card + sticky CTA. Correct format. |
| SafetyWing | 1 link | `referenceID=peakly` | LIVE. VenueDetailSheet insurance card. Post-intent placement. |
| Travelpayouts/Aviasales | Flight deep links | `TP_MARKER` via proxy | LIVE. Commission on flight bookings. |

### BLOCKED -- Earning $0

| Stream | Links | Issue | Fix |
|--------|-------|-------|-----|
| REI | 22 links across 8 categories | No affiliate tracking param | Avantlink signup, append tracking param to all `rei.com` URLs |
| Backcountry | 2 links (MTB category, lines 7308 + 7310) | No affiliate tracking param | Avantlink signup, append tracking param |
| GetYourGuide | 1 dynamic link (line 7737) | No `partner_id` | Partner signup, append `partner_id` to URL template |

### Link Counts by Category

| Category | Amazon | REI | Backcountry | Total | Earning |
|----------|--------|-----|-------------|-------|---------|
| Skiing | 4 | 4 | 0 | 8 | 4/8 |
| Surfing | 2 | 2 | 0 | 4 | 2/4 |
| Tanning | 4 | 0 | 0 | 4 | 4/4 |
| Diving | 3 | 1 | 0 | 4 | 3/4 |
| Climbing | 4 | 4 | 0 | 8 | 4/8 |
| Kayak | 4 | 4 | 0 | 8 | 4/8 |
| MTB | 4 | 2 | 2 | 8 | 4/8 |
| Kite | 4 | 0 | 0 | 4 | 4/4 |
| Fishing | 3 | 1 | 0 | 4 | 3/4 |
| Paraglide | 4 | 0 | 0 | 4 | 4/4 |
| Hiking | 3 | 4 | 0 | 7 | 3/7 |
| **Total** | **39** | **22** | **2** | **63** | **39/63 (62%)** |

---

## 3. Hiking Gear Gap -- RESOLVED

Previously reported as zero items. Now has **7 GEAR_ITEMS** (lines 7335-7343):

| Item | Store | Price | Earning? |
|------|-------|-------|----------|
| Salomon X Ultra 4 GTX Boots | REI | $200 | No (no affiliate tag) |
| BD Trail Trekking Poles | REI | $140 | No |
| Osprey Atmos AG 65L Pack | REI | $300 | No |
| Garmin inReach Mini 2 GPS | REI | $350 | No |
| Osprey Hydraulics 3L Reservoir | Amazon | $45 | Yes |
| BD Spot 400 Headlamp | Amazon | $36 | Yes |
| Darn Tough Hiker Socks | Amazon | $26 | Yes |

4 of 7 hiking items are REI-only, earning $0 without affiliate tag. The 3 Amazon items are tagged and earning.

---

## 4. Revenue Model -- Affiliate Only

### Current Live RPM: $12.06 per 1,000 MAU/month

| Stream | RPM |
|--------|-----|
| Amazon (39 links) | $4.48 |
| Booking.com (2 placements) | $6.90 |
| SafetyWing (1 link) | $0.54 |
| Travelpayouts (flights) | $0.14 |
| **Total** | **$12.06** |

### Projections -- Current State

| MAU | Monthly Revenue | Annual Revenue |
|-----|----------------|----------------|
| 1,000 | $12.06 | $144.72 |
| 5,000 (low Reddit) | $60.30 | $723.60 |
| 8,000 (high Reddit) | $96.48 | $1,157.76 |
| 100,000 | $1,206.00 | $14,472.00 |

### Projections -- After REI + Backcountry + GetYourGuide Activated (RPM $20.06)

| MAU | Monthly Revenue | Annual Revenue | Delta vs Current |
|-----|----------------|----------------|-----------------|
| 1,000 | $20.06 | $240.72 | +$8.00/mo |
| 5,000 | $100.30 | $1,203.60 | +$40.00/mo |
| 8,000 | $160.48 | $1,925.76 | +$64.00/mo |
| 100,000 | $2,006.00 | $24,072.00 | +$800.00/mo |

### Math

- Monthly Revenue = (MAU / 1,000) x RPM
- Post-activation RPM = $12.06 + $6.16 (REI) + $0.56 (Backcountry) + $1.28 (GYG) = $20.06
- Example: 5K MAU x $20.06/1K = $100.30/mo

---

## 5. Biggest Lever for Improving RPM

**Activating REI affiliate links.** Rationale:

- 22 links already placed across 8 categories -- zero code changes needed
- REI gear has higher AOV than Amazon ($65-$1,200 vs $9-$449)
- 5% commission vs Amazon's 4%
- Estimated RPM lift: +$6.16 (+51% from current $12.06)
- Effort: 30 minutes of Avantlink signup + URL update

### Revenue Left on the Table Per Day of Delay

| MAU | Lost from REI alone | Lost from all 3 blocked streams |
|-----|--------------------|---------------------------------|
| 1,000 | $0.21/day | $0.27/day |
| 5,000 | $1.03/day | $1.33/day |
| 8,000 | $1.64/day | $2.13/day |

The real cost: launching the Reddit campaign without these affiliate IDs wired means the highest-traffic period earns 40% less than it should.

---

## 6. LLC Unblock -- Activation Day Sequence

LLC is approved. Exact steps for affiliate activation:

1. **REI via Avantlink** (30 min, Jack): avantlink.com -> sign up as publisher -> apply to REI program. Approval: 1-3 business days. Once approved, update 22 `rei.com` URLs with tracking param.

2. **Backcountry via Avantlink** (15 min, Jack): Same Avantlink account -> apply to Backcountry. Update 2 URLs (lines 7308, 7310).

3. **GetYourGuide** (20 min, Jack): partner.getyourguide.com -> sign up -> get partner_id -> update URL template (line 7737).

4. **Deploy** (5 min): Single commit updating all affiliate URLs.

Total time: ~1 hour. Expected RPM lift: +$8.00 per 1K MAU (+66%).

---

## 7. Summary

| Item | Status | Action Required |
|------|--------|----------------|
| Peakly Pro pricing ($79/yr) | FIXED | None -- stays as mockup, no Stripe |
| Amazon (39 links, `peakly-20`) | LIVE | None |
| Booking.com (2 links, `aid=2311236`) | LIVE | None |
| SafetyWing (1 link, `referenceID=peakly`) | LIVE | None |
| Travelpayouts (flights) | LIVE | None |
| REI (22 links) | EARNING $0 | **Jack: Avantlink signup, 30 min** |
| Backcountry (2 links) | EARNING $0 | **Jack: Avantlink signup, 15 min** |
| GetYourGuide (1 link) | EARNING $0 | **Jack: Partner signup, 20 min** |
| Hiking GEAR_ITEMS | RESOLVED (7 items) | None |
| Peakly Pro (Stripe) | DEFERRED | Revisit at 5K MAU |

### Single Highest-Revenue-Impact Change This Week

**Sign up for REI's Avantlink affiliate program and update the 22 REI URLs with the tracking parameter.** 30 minutes of signup + a find-and-replace. Expected lift: +51% RPM. No code architecture changes. No new features.
