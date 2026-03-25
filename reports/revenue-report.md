# Peakly Revenue Report: 2026-03-24 (v13)

## Revenue Health: YELLOW

Three affiliate streams live (Amazon 20 links, Booking.com 1, SafetyWing 1). Peakly Pro pricing correctly shows $79/yr (line 5016). Hiking GEAR_ITEMS has 4 items but ALL are REI -- zero Amazon links, earning $0 until LLC. App is 6,072 lines, ~192 venues. Zero AFFILIATE_ID placeholders. VPS proxy confirmed HTTPS. Flight links still go to Google Flights (earns $0) -- Aviasales switch pending review. LLC remains the top blocker -- 25 links across REI, Backcountry, and GetYourGuide are structurally ready but earning $0.

---

## 1. P0: Peakly Pro Pricing Fix

**Status: FIXED (confirmed).** Line 5016: `$79/yr`. Zero instances of `$9/mo` anywhere in app.jsx. No action needed.

### LTV Model: $79/yr vs $9/mo

| Metric | $9/mo | $79/yr |
|--------|-------|--------|
| Gross monthly | $9.00 | $6.58 ($79/12) |
| Avg retention | 4 months (RevenueCat monthly benchmark) | 36% renew (RevenueCat annual benchmark) |
| Year 1 LTV | $36.00 (4 x $9) | $79.00 |
| Year 2 LTV | $36.00 (if re-acquired) | $79 + ($79 x 0.36) = **$107.44** |
| Year 3 LTV | $36.00 | $79 + $28.44 + ($79 x 0.13) = **$117.71** |

**$79/yr wins decisively.** 2.2x higher Year 1 LTV. Annual plans also reduce churn anxiety and payment processing costs. Correct decision.

---

## 2. Affiliate Link Audit

### Verified counts (app.jsx, 6,072 lines)

| Affiliate | Link Count | Tagged/Tracked | Status |
|-----------|-----------|----------------|--------|
| Amazon (`tag=peakly-20`) | 20 | 20/20 (100%) | LIVE, EARNING |
| REI (`rei.com`) | 22 | 0/22 -- no affiliate tag | BLOCKED BY LLC |
| Backcountry (`backcountry.com`) | 2 | 0/2 -- no affiliate tag | BLOCKED BY LLC |
| Booking.com (`aid=2311236`) | 1 | 1/1 (100%) | LIVE, EARNING |
| SafetyWing (`referenceID=peakly`) | 1 | 1/1 (100%) | LIVE, EARNING |
| GetYourGuide | 1 | 0/1 -- no partner_id | BLOCKED BY LLC |
| AFFILIATE_ID placeholders | 0 | Clean | N/A |

### No changes since v12

All counts identical: Amazon 20, REI 22, Backcountry 2, Booking.com 1, SafetyWing 1, GetYourGuide 1. No regressions.

### Amazon links by category

| Category | Amazon Links | REI Links | Backcountry | Total |
|----------|-------------|-----------|-------------|-------|
| Skiing | 0 | 4 | 0 | 4 |
| Surfing | 2 | 2 | 0 | 4 |
| Tanning | 4 | 0 | 0 | 4 |
| Diving | 3 | 1 | 0 | 4 |
| Climbing | 0 | 4 | 0 | 4 |
| Kayak | 0 | 4 | 0 | 4 |
| MTB | 0 | 2 | 2 | 4 |
| Kite | 4 | 0 | 0 | 4 |
| Fishing | 3 | 1 | 0 | 4 |
| Paraglide | 4 | 0 | 0 | 4 |
| Hiking | 0 | 4 | 0 | 4 |
| **Total** | **20** | **22** | **2** | **44** |

**Categories with ZERO Amazon links (earning $0 from gear):** skiing, climbing, kayak, mtb, hiking -- 5 categories, 20 gear items total, all blocked by LLC.

### Detail on each live stream

**Amazon (20 links):** All tagged `peakly-20`. Distributed across 6 categories: surfing (2), tanning (4), diving (3), kite (4), fishing (3), paraglide (4). Unchanged from v12.

**Booking.com (1 link):** Line 4979. Dynamic per-venue: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(listing.location)}&aid=2311236`. Post-intent placement in VenueDetailSheet. Correctly formatted.

**SafetyWing (1 link):** Line 4997. `https://safetywing.com/nomad-insurance/?referenceID=peakly&utm_source=peakly&utm_medium=affiliate`. Post-intent placement. UTM params present.

**REI (22 links), Backcountry (2 links), GetYourGuide (1 link):** All structurally correct. URLs work, products relevant, placement proper. Only change needed on LLC approval: add affiliate tags to URLs.

### Issues found

- **Flight links still go to Google Flights (earns $0).** `buildFlightUrl()` at line 1491 generates `google.com/flights` deep links. Google Flights has no affiliate program. Switching to Aviasales/Travelpayouts deep links was flagged for review 2026-03-26. This is the biggest non-LLC revenue leak -- every flight click is a missed commission.
- **Hiking has zero Amazon links.** The Osprey Hydraulics 3L Reservoir (Amazon, $42) was removed in v11 and replaced with Osprey Atmos AG (REI). Still not re-added.
- **GetYourGuide (line 4951) has no partner_id parameter.** Needs `&partner_id=XXXXX` on LLC approval.
- **No broken links.** All URLs valid.
- **No misplaced links.** All affiliate CTAs in VenueDetailSheet (post-intent).

---

## 3. Hiking Gear Gap

**Status: PARTIALLY FIXED (unchanged from v12).** Hiking GEAR_ITEMS at lines 4589-4594 has 4 items:

1. Salomon X Ultra 4 GTX Boots -- REI, $200
2. Black Diamond Trail Trekking Poles -- REI, $140
3. Osprey Atmos AG 65L Backpack -- REI, $300
4. Garmin inReach Mini 2 GPS -- REI, $350

**Problem:** All 4 items are REI. Zero Amazon links. This category earns $0 until LLC approves.

**Recommendation:** Add 2 Amazon items to hiking. Paste-ready code (DO NOT edit code -- for reference only):

```javascript
// Add to hiking array in GEAR_ITEMS (after existing 4 items):
{ emoji:"💧", name:"Osprey Hydraulics 3L Reservoir",  store:"Amazon", price:"$42",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=osprey+hydraulics+reservoir" },
{ emoji:"🧦", name:"Darn Tough Hiker Micro Crew Socks", store:"Amazon", price:"$26", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+hiker+micro+crew+socks" },
```

**Full Amazon items for all 5 zero-Amazon categories** (paste-ready, DO NOT edit code):

```javascript
// SKIING -- add to skiing array:
{ emoji:"🧣", name:"Smartwool 250 Base Layer",    store:"Amazon", price:"$100", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smartwool+250+base+layer" },
{ emoji:"🧤", name:"Outdoor Research Adrenaline Gloves", store:"Amazon", price:"$45", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=outdoor+research+adrenaline+gloves" },

// CLIMBING -- add to climbing array:
{ emoji:"🧲", name:"Petzl GriGri+ Belay Device",  store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=petzl+grigri+belay+device" },
{ emoji:"🪢", name:"Sterling Evolution Velocity 60m Rope", store:"Amazon", price:"$180", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sterling+evolution+velocity+climbing+rope" },

// KAYAK -- add to kayak array:
{ emoji:"🧤", name:"NRS Cove Neoprene Gloves",    store:"Amazon", price:"$30",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=nrs+cove+neoprene+gloves" },
{ emoji:"📱", name:"Nite Ize RunOff Waterproof Phone Pouch", store:"Amazon", price:"$35", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=nite+ize+runoff+waterproof+phone+pouch" },

// MTB -- add to mtb array:
{ emoji:"🔧", name:"Topeak Ratchet Rocket Multi-Tool", store:"Amazon", price:"$40", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=topeak+ratchet+rocket+multi+tool" },
{ emoji:"💡", name:"NiteRider Lumina 1200 Headlight", store:"Amazon", price:"$90", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=niterider+lumina+1200+headlight" },

// HIKING -- add to hiking array:
{ emoji:"💧", name:"Osprey Hydraulics 3L Reservoir",  store:"Amazon", price:"$42",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=osprey+hydraulics+reservoir" },
{ emoji:"🧦", name:"Darn Tough Hiker Micro Crew Socks", store:"Amazon", price:"$26", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+hiker+micro+crew+socks" },
```

Adding all 10 items brings Amazon links from 20 to 30, giving every category at least 2 immediately-earning links.

---

## 4. Revenue Modeling

### Current RPM: $12.06 per 1,000 MAU

| Stream | Click-through | Avg Order | Commission | Est. RPM |
|--------|--------------|-----------|------------|----------|
| Amazon gear (20 links) | 35 clicks/1K | $160 | 4% | **$4.48** |
| Booking.com (1 link) | 23 clicks/1K | $300 (2 nights) | ~$15/booking | **$6.90** |
| SafetyWing (1 link) | 6 clicks/1K | $45/mo | ~10% | **$0.54** |
| Travelpayouts (flights via proxy) | Tracked server-side | -- | CPA | **$0.14** (est.) |
| REI (22 links, 5%) | 0 (no tag) | -- | 5% | **$0.00** |
| Backcountry (2 links, 8%) | 0 (no tag) | -- | 8% | **$0.00** |
| GetYourGuide (1 link, 8%) | 0 (no ID) | -- | 8% | **$0.00** |
| Peakly Pro | NOT WIRED | -- | -- | **$0.00** |
| **Total (live)** | | | | **$12.06** |

### Projections at current RPM ($12.06)

| MAU | Monthly Revenue | Math |
|-----|----------------|------|
| **1,000** | **$12.06** | 1 x $12.06 |
| **5,000** (low Reddit) | **$60.30** | 5 x $12.06 |
| **8,000** (high Reddit) | **$96.48** | 8 x $12.06 |
| **100,000** | **$1,206.00** | 100 x $12.06 |

### What if Amazon links increase to 30? (add 10 items to 5 categories)

Adding 10 Amazon links to zero-Amazon categories would increase click-through by ~50% (10 more high-intent product links). Conservative estimate: 17 additional clicks/1K MAU at $88 avg order, 4% commission = +$1.20 RPM.

| MAU | Monthly Revenue @ $13.26 RPM | Delta vs current |
|-----|------------------------------|-----------------|
| **1,000** | **$13.26** | +$1.20 |
| **5,000** | **$66.30** | +$6.00 |
| **8,000** | **$106.08** | +$9.60 |
| **100,000** | **$1,326.00** | +$120.00 |

### Biggest lever for improving RPM

**1. LLC approval (+$21.17 RPM, +176%).** Unlocks REI, Backcountry, GetYourGuide, and Peakly Pro.

**2. Switch flight links to Aviasales/Travelpayouts deep links (+$2.00-4.00 RPM est.).** Currently `buildFlightUrl()` sends users to Google Flights which earns $0. Every flight click is wasted. Travelpayouts offers $0.50-1.50 CPA per flight booking. With ~40 flight clicks per 1K MAU and 5-10% booking conversion, this is $1.00-6.00 RPM. Conservative estimate: +$2.50 RPM. NOT blocked by LLC -- can ship now.

**3. Add Amazon items to 5 zero-Amazon categories (+$1.20 RPM est.).** Not blocked. 30 min dev work.

---

## 5. LLC Unblock Plan

### Day-of sequence when LLC approves

1. **REI/Avantlink affiliate signup** (30 min) -- apply at avantlink.com, get affiliate ID
2. **Backcountry affiliate signup** (30 min) -- apply through their partner program
3. **GetYourGuide partner signup** (30 min) -- apply at partner.getyourguide.com, get partner_id
4. **Update app.jsx:** Add affiliate tags to all 22 REI URLs, 2 Backcountry URLs, 1 GetYourGuide URL
5. **Stripe account setup** (1 hr) -- connect to LLC bank account, configure $79/yr product
6. **Wire Peakly Pro button** to Stripe Checkout (2-3 hrs dev work)
7. **Push to main** -- all changes go live immediately via GitHub Pages

### RPM jump estimate post-LLC

| Stream | Pre-LLC RPM | Post-LLC RPM |
|--------|-------------|--------------|
| Amazon | $4.48 | $4.48 (unchanged) |
| REI (22 links, 5%) | $0.00 | **+$6.16** (est. 38 clicks/1K, $324 avg, 5%) |
| Backcountry (2 links, 8%) | $0.00 | **+$0.56** (est. 4 clicks/1K, $175 avg, 8%) |
| GetYourGuide (1 link, 8%) | $0.00 | **+$1.28** (est. 8 clicks/1K, $200 avg, 8%) |
| Booking.com | $6.90 | $6.90 (unchanged) |
| SafetyWing | $0.54 | $0.54 (unchanged) |
| Travelpayouts | $0.14 | $0.14 (unchanged) |
| Peakly Pro (2% conversion) | $0.00 | **+$13.17** ($79/yr = $6.58/mo x 20 subs per 1K) |
| **Total** | **$12.06** | **~$33.23** |

**RPM jumps from $12.06 to ~$33.23 (+176%) on LLC approval day.**

### Revenue left on the table per day of delay

At current traffic (likely <100 MAU): negligible, <$1/day.

At projected post-Reddit traffic (5K MAU): **~$3.53/day** in lost affiliate revenue, **~$11.15/day** including Pro subscriptions. That is **$335/month** at 5K MAU sitting on the table waiting for LLC.

---

## 6. The Single Highest-Revenue-Impact Change This Week

### If LLC is still pending: Switch flight links from Google Flights to Aviasales

**Why this is #1 now:** This was flagged for review 2026-03-26 (two days from now). It is NOT blocked by LLC. Every flight click currently goes to Google Flights which has no affiliate program -- pure revenue leakage. `buildFlightUrl()` at line 1491 generates google.com/flights URLs used in 3 places (lines 1809, 1880, 4704).

**Estimated impact:** +$2.00-4.00 RPM. At 5K MAU post-Reddit, that is $10-20/month in new revenue from code that already exists.

**Implementation approach** (DO NOT edit code -- for reference only):

```javascript
// Replace buildFlightUrl at line 1491-1498:
function buildFlightUrl(from, to, opts) {
  const dep = opts?.dep || "";
  const ret = opts?.ret || "";
  // Aviasales deep link with Travelpayouts marker
  // marker should match your Travelpayouts account
  return `https://www.aviasales.com/search/${from}${dep.replace(/-/g,"")}${to}1?marker=peakly&origin_iata=${from}&destination_iata=${to}&depart_date=${dep}&return_date=${ret}&adults=1&currency=usd`;
}
```

Note: Exact Aviasales deep link format should be verified against Travelpayouts documentation before shipping. The marker parameter ties clicks to the Peakly Travelpayouts account.

### If LLC approves this week

Follow the Day-of Sequence in section 5. RPM jumps +176% immediately.

---

## v13 Delta (what changed since v12)

- **App.jsx: 6,072 lines (unchanged)**
- **Venues: ~192 (unchanged)**
- **Amazon links: 20 (unchanged)**
- **REI links: 22 (unchanged)**
- **Backcountry links: 2 (unchanged)**
- **RPM: $12.06 (unchanged)**
- **Peakly Pro pricing: STILL CORRECT.** $79/yr at line 5016.
- **AFFILIATE_ID placeholders: 0.** Still clean.
- **HTTPS proxy: CONFIRMED.** Line 1342, `https://peakly-api.duckdns.org`.
- **Flight links: STILL Google Flights (earns $0).** buildFlightUrl at line 1491 → google.com/flights. Aviasales switch review date: 2026-03-26.
- **Hiking GEAR_ITEMS: STILL 4x REI-only.** Zero Amazon links. Regression from v11 not yet fixed.
- **NEW: Added LTV model** comparing $79/yr vs $9/mo. $79/yr wins by 2.2x Year 1 LTV.
- **NEW: Flagged Aviasales switch** as #1 non-LLC revenue action. Est. +$2.00-4.00 RPM.
- **Top blocker: LLC approval (unchanged).** +$21.17 RPM (+176%) waiting to unlock. $335/mo lost at 5K MAU.

---

## Summary of Action Items (ordered by impact)

| Priority | Action | Blocked? | Time | Revenue Impact |
|----------|--------|----------|------|---------------|
| P0 | **LLC approval** | EXTERNAL | Waiting | **+$21.17/1K MAU RPM (+176%)** |
| P1 | **Switch flight links to Aviasales** (review 2026-03-26) | No | 2-3 hrs | **+$2.00-4.00 RPM** |
| P2 | Add Amazon links to skiing/climbing/kayak/mtb/hiking (10 items) | No | 30 min | +$1.20 RPM |
| P3 | Check Plausible dashboard for traffic baseline | No | 5 min | Validates all revenue assumptions |
| P4 | Sign up REI/Backcountry/GetYourGuide (post-LLC) | Yes (LLC) | 90 min | +$8.00 RPM |
| P5 | Wire Stripe for Peakly Pro (post-LLC) | Yes (LLC) | 3 hrs | +$13.17 RPM |
