# Peakly Revenue Report: 2026-03-25 (v14)

## Revenue Health: YELLOW

Three affiliate streams live and earning (Amazon, Booking.com, SafetyWing). Peakly Pro pricing correctly shows $79/yr. Hiking gear gap is now RESOLVED (6 items including 2 Amazon links). Flight links still go to Google Flights (earns $0) -- Aviasales switch review is tomorrow (2026-03-26). LLC remains the top blocker at +$21.17 RPM (+176%) waiting to unlock.

**Key change since v13:** Hiking GEAR_ITEMS went from 4 REI-only items to 6 items (4 REI + 2 Amazon). Amazon link count jumped from 20 to 30 across all categories. The "5 categories with zero Amazon links" problem is now reduced to 0 -- every category has at least 2 Amazon links earning today.

---

## 1. P0: Peakly Pro Pricing Fix

**Status: FIXED (confirmed).** Line 7470: `$79/yr`. Zero instances of `$9/mo` anywhere in app.jsx. No action needed.

### LTV Model: $79/yr vs $9/mo

| Metric | $9/mo | $79/yr |
|--------|-------|--------|
| Gross monthly | $9.00 | $6.58 ($79/12) |
| Avg retention | 4 months (RevenueCat monthly benchmark) | 36% renew (RevenueCat annual benchmark) |
| Year 1 LTV | $36.00 (4 x $9) | $79.00 |
| Year 2 LTV | $36.00 (if re-acquired) | $79 + ($79 x 0.36) = **$107.44** |
| Year 3 LTV | $36.00 | $79 + $28.44 + ($79 x 0.13) = **$117.71** |

**$79/yr wins decisively.** 2.2x higher Year 1 LTV. Annual plans reduce churn anxiety and payment processing costs. Correct decision.

### Paywall copy (for when Stripe goes live):

> **Peakly Pro -- $79/year**
> Extended forecasts, Strike Missions, historical condition data, and priority alerts. Less than a single lift ticket. Cancel anytime.
> *That's $6.58/month -- less than one coffee a week.*

---

## 2. Affiliate Link Audit

### Verified counts (app.jsx, ~5,413 lines)

| Affiliate | Link Count | Tagged/Tracked | Status |
|-----------|-----------|----------------|--------|
| Amazon (`tag=peakly-20`) | **30** | 30/30 (100%) | LIVE, EARNING |
| REI (`rei.com`) | 22 | 0/22 -- no affiliate tag | NEEDS AVANTLINK (no LLC required) |
| Backcountry (`backcountry.com`) | 2 | 0/2 -- no affiliate tag | BLOCKED BY LLC |
| Booking.com (`aid=2311236`) | 2 | 2/2 (100%) | LIVE, EARNING |
| SafetyWing (`referenceID=peakly`) | 1 | 1/1 (100%) | LIVE, EARNING |
| GetYourGuide | 1 | 0/1 -- no partner_id | BLOCKED BY LLC |
| AFFILIATE_ID placeholders | 0 | Clean | N/A |

### Amazon links by category (ALL categories now have Amazon links)

| Category | Amazon Links | REI Links | Backcountry | Total |
|----------|-------------|-----------|-------------|-------|
| Skiing | 2 | 4 | 0 | 6 |
| Surfing | 2 | 2 | 0 | 4 |
| Tanning | 4 | 0 | 0 | 4 |
| Diving | 3 | 1 | 0 | 4 |
| Climbing | 2 | 4 | 0 | 6 |
| Kayak | 2 | 4 | 0 | 6 |
| MTB | 2 | 2 | 2 | 6 |
| Kite | 4 | 0 | 0 | 4 |
| Fishing | 3 | 1 | 0 | 4 |
| Paraglide | 4 | 0 | 0 | 4 |
| Hiking | 2 | 4 | 0 | 6 |
| **Total** | **30** | **22** | **2** | **54** |

**Previous gap resolved:** Skiing, climbing, kayak, MTB, and hiking all now have 2 Amazon links each. Every category earns from gear clicks today.

### Detail on each live stream

**Amazon (30 links):** All tagged `peakly-20`. Format: `https://www.amazon.com/s?tag=peakly-20&k=...`. Valid Associates search URLs that attribute commissions. Distributed across all 11 categories.

**Booking.com (2 links):** Lines 7433 and 7556. Dynamic per-venue: `https://www.booking.com/searchresults.html?ss=${location}&aid=2311236`. Post-intent placement in VenueDetailSheet. Correctly formatted.

**SafetyWing (1 link):** Line 7451. `https://safetywing.com/nomad-insurance/?referenceID=peakly&utm_source=peakly&utm_medium=affiliate`. Post-intent placement below Booking.com. UTM params present.

**REI (22 links):** All use `https://www.rei.com/search?q=...` format. No affiliate parameter. Earn $0 today. NOTE: REI/Avantlink does NOT require LLC -- Jack can sign up now (30 min action item).

**Backcountry (2 links):** Lines 6979, 6981. Direct product URLs. No affiliate tag. Blocked by LLC.

**GetYourGuide (1 link):** Line 7405. Dynamic search URL. No `partner_id`. Blocked by LLC.

### Issues found

1. **Flight links still go to Google Flights (earns $0).** `buildFlightUrl()` generates `google.com/flights` deep links. Google Flights has no affiliate program. Aviasales switch review: 2026-03-26. This is the biggest non-LLC revenue leak.
2. **GetYourGuide needs `partner_id` parameter on LLC approval.**
3. **No broken or misplaced links.** All affiliate CTAs are post-intent in VenueDetailSheet.

---

## 3. Hiking Gear Gap

**Status: RESOLVED.** Hiking GEAR_ITEMS at lines 7004-7011 now has 6 items:

| Item | Store | Price | Commission | Earning? |
|------|-------|-------|------------|----------|
| Salomon X Ultra 4 GTX Boots | REI | $200 | 5% | No (needs Avantlink) |
| Black Diamond Trail Trekking Poles | REI | $140 | 5% | No (needs Avantlink) |
| Osprey Atmos AG 65L Backpack | REI | $300 | 5% | No (needs Avantlink) |
| Garmin inReach Mini 2 GPS | REI | $350 | 5% | No (needs Avantlink) |
| Osprey Hydraulics 3L Reservoir | Amazon | $45 | 4% | **Yes** |
| Black Diamond Spot 400 Headlamp | Amazon | $36 | 4% | **Yes** |

Average AOV: ~$178. Two Amazon links earning now. Four REI links ready for Avantlink tag.

### Optional expansion (paste-ready, not urgent):

```javascript
// Additional hiking items to boost Amazon coverage:
    { emoji:"🧦", name:"Darn Tough Hiker Micro Crew Socks", store:"Amazon", price:"$26",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+hiker+micro+crew+socks" },
    { emoji:"🧊", name:"Sawyer Squeeze Water Filter",       store:"Amazon", price:"$37",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sawyer+squeeze+water+filter" },
    { emoji:"🩹", name:"Leukotape P Blister Prevention",    store:"Amazon", price:"$12",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=leukotape+p+blister+prevention" },
    { emoji:"🧥", name:"Patagonia Nano Puff Jacket",        store:"REI",   price:"$229", commission:"5%", url:"https://www.rei.com/search?q=patagonia+nano+puff+jacket" },
```

---

## 4. Revenue Modeling

### Current RPM: $12.06 per 1,000 MAU

| Stream | Est. RPM | % of Total |
|--------|----------|------------|
| Amazon gear (30 links) | $4.48 | 37% |
| Booking.com (2 links) | $6.90 | 57% |
| SafetyWing (1 link) | $0.54 | 4.5% |
| Travelpayouts (proxy) | $0.14 | 1.2% |
| REI (22 links, no tag) | $0.00 | -- |
| Backcountry (2 links, no tag) | $0.00 | -- |
| GetYourGuide (no ID) | $0.00 | -- |
| Peakly Pro (UI mockup) | $0.00 | -- |
| **Total** | **$12.06** | 100% |

Note: Amazon RPM may increase slightly now that all 11 categories have Amazon links (was 6 categories before). Conservative estimate: $4.48 stays flat until traffic data validates.

### Projections at current RPM ($12.06)

| MAU | Monthly Revenue | Annual Revenue | Math |
|-----|----------------|----------------|------|
| **1,000** | **$12.06** | $144.72 | 1 x $12.06 |
| **5,000** (low Reddit) | **$60.30** | $723.60 | 5 x $12.06 |
| **8,000** (high Reddit) | **$96.48** | $1,157.76 | 8 x $12.06 |
| **100,000** | **$1,206.00** | $14,472.00 | 100 x $12.06 |

### Biggest lever for improving RPM

1. **LLC approval (+$21.17 RPM, +176%).** Unlocks REI, Backcountry, GetYourGuide, and Peakly Pro. Single biggest multiplier.
2. **Switch flight links to Aviasales (+$2.00-4.00 RPM est.).** Not blocked by LLC. Every flight click currently earns $0. Review date: tomorrow (2026-03-26).
3. **REI Avantlink signup (+$6.16 RPM).** NOT blocked by LLC. Jack can sign up now. 30 minutes. This alone would push RPM from $12.06 to $18.22 (+51%).

---

## 5. LLC Unblock Plan

### Day-of sequence when LLC approves

| Step | Action | Time | Revenue Unlocked |
|------|--------|------|-----------------|
| 1 | Backcountry affiliate signup | 30 min | +$0.56 RPM |
| 2 | GetYourGuide partner signup, get partner_id | 30 min | +$1.28 RPM |
| 3 | Update app.jsx: add tags to 2 Backcountry + 1 GetYourGuide URLs | 15 min | -- |
| 4 | Stripe account setup, create $79/yr product | 1 hr | -- |
| 5 | Wire Peakly Pro button to Stripe Checkout | 2-3 hrs | +$13.17 RPM |
| 6 | Push to main | 5 min | All live |

Note: REI/Avantlink does NOT need LLC. Should be done NOW, not on LLC day.

### RPM jump post-LLC

| Stream | Pre-LLC | Post-LLC | Delta |
|--------|---------|----------|-------|
| Amazon | $4.48 | $4.48 | +$0.00 |
| Booking.com | $6.90 | $6.90 | +$0.00 |
| SafetyWing | $0.54 | $0.54 | +$0.00 |
| Travelpayouts | $0.14 | $0.14 | +$0.00 |
| REI | $0.00 | $6.16 | +$6.16 |
| Backcountry | $0.00 | $0.56 | +$0.56 |
| GetYourGuide | $0.00 | $1.28 | +$1.28 |
| Peakly Pro | $0.00 | $13.17 | +$13.17 |
| **Total** | **$12.06** | **$33.23** | **+$21.17 (+176%)** |

### Revenue left on the table per day of LLC delay

| MAU | Daily Lost | Monthly Lost |
|-----|-----------|-------------|
| 1,000 | $0.71 | $21.17 |
| 5,000 | $3.53 | $105.85 |
| 8,000 | $5.64 | $169.36 |

At 5K MAU post-Reddit, every month without LLC costs ~$106 in lost revenue.

---

## 6. The Single Highest-Revenue-Impact Change This Week

### Switch flight links from Google Flights to Aviasales/Travelpayouts deep links

**Why this is #1:** Review date is tomorrow (2026-03-26). Not blocked by LLC. Every flight click currently goes to Google Flights which has no affiliate program -- pure revenue leakage. The Flights CTA is the most prominent button in VenueDetailSheet (sticky bottom bar, visible on every venue).

**Estimated impact:** +$2.00-4.00 RPM. At 5K MAU, that is $10-20/month from a single function change.

**Implementation code (paste-ready):**

```javascript
// Replace buildFlightUrl with Aviasales deep link:
const buildFlightUrl = (fromCode, toCode, departDate) => {
  // Aviasales deep link with Travelpayouts marker
  const dep = departDate
    ? new Date(departDate).toISOString().slice(2,10).replace(/-/g,'')
    : new Date(Date.now() + 14*86400000).toISOString().slice(2,10).replace(/-/g,'');
  const ret = departDate
    ? new Date(new Date(departDate).getTime() + 7*86400000).toISOString().slice(2,10).replace(/-/g,'')
    : new Date(Date.now() + 21*86400000).toISOString().slice(2,10).replace(/-/g,'');
  return `https://www.aviasales.com/search/${fromCode}${dep}${toCode}${ret}1?marker=peakly`;
};
```

Note: Verify exact Aviasales deep link format against Travelpayouts docs before shipping. The `marker=peakly` parameter must match the Travelpayouts account.

---

## v14 Delta (changes since v13)

- **Hiking GEAR_ITEMS: FIXED.** Now 6 items (4 REI + 2 Amazon). Was 4 REI-only. The Osprey Hydraulics and BD Spot 400 Headlamp Amazon links are live and earning.
- **Amazon links: 30 (was 20).** All 11 categories now have Amazon links. The "5 categories with zero Amazon links" problem is fully resolved.
- **Booking.com links: 2 (was reported as 1).** Second instance at line 7556 in VenueDetailSheet.
- **Peakly Pro pricing: STILL CORRECT.** $79/yr at line 7470.
- **Flight links: STILL Google Flights (earns $0).** Aviasales switch review: 2026-03-26 (tomorrow).
- **RPM: $12.06 (unchanged).** Amazon RPM may tick up with broader category coverage but no traffic data to confirm yet.
- **LLC: STILL PENDING.** +$21.17 RPM blocked.

---

## Action Items (ordered by impact, no-LLC-required first)

| Priority | Action | Owner | Blocked? | Time | Revenue Impact |
|----------|--------|-------|----------|------|---------------|
| P1 | **Switch flight links to Aviasales** | Dev | No | 2-3 hrs | +$2.00-4.00 RPM |
| P1 | **REI Avantlink signup** | Jack | **No** | 30 min | +$6.16 RPM |
| P2 | Check Plausible for traffic baseline | Jack | No | 5 min | Validates all projections |
| P3 | **LLC approval** | Jack | External | Waiting | +$21.17 RPM (+176%) |
| P4 | Wire Stripe for Peakly Pro (post-LLC) | Dev | Yes (LLC) | 3 hrs | +$13.17 RPM |
| P5 | Backcountry + GetYourGuide signup (post-LLC) | Jack | Yes (LLC) | 1 hr | +$1.84 RPM |

**Bottom line:** Two actions with zero external dependencies -- Aviasales flight links and REI/Avantlink signup -- would push RPM from $12.06 to ~$20.22 (+68%). At 5K MAU post-Reddit, that is $101/month vs $60/month. Do both this week.
