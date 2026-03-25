# Peakly Revenue Report: 2026-03-24 (v12)

## Revenue Health: YELLOW

Three affiliate streams live (Amazon 20 links, Booking.com 1, SafetyWing 1). Peakly Pro pricing correctly shows $79/yr (line 5016). Hiking GEAR_ITEMS has 4 items but ALL are REI -- zero Amazon links, so hiking earns $0 until LLC. App trimmed from 6,354 to 6,072 lines (282 fewer). Venues trimmed to ~192. Zero AFFILIATE_ID placeholders. VPS proxy confirmed HTTPS. LLC remains the top blocker -- 24 links across REI, Backcountry, and GetYourGuide are structurally ready but earning $0.

---

## 1. P0: Peakly Pro Pricing Fix

**Status: FIXED (confirmed).** Line 5016: `$79/yr`. No instances of `$9/mo` anywhere in app.jsx. No action needed.

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

### Changes since v11

- **App.jsx shrank from 6,354 to 6,072 lines** (-282 lines). Venue trimming to 192.
- **Amazon links dropped from 21 to 20.** The hiking Osprey Hydraulics Amazon link was replaced by an Osprey Atmos AG REI link. Net loss: 1 immediately-earning link.
- **REI links increased from 21 to 22.** Hiking now has 4 REI items (was 3 REI + 1 Amazon in v11).
- **All other link counts unchanged.** Booking.com 1, SafetyWing 1, GetYourGuide 1, Backcountry 2.

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

**Amazon (20 links):** All tagged `peakly-20`. Distributed across 6 categories: surfing (2), tanning (4), diving (3), kite (4), fishing (3), paraglide (4). Down 1 from v11 (hiking Amazon link removed).

**Booking.com (1 link):** Line 4979. Dynamic per-venue: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(listing.location)}&aid=2311236`. Post-intent placement in VenueDetailSheet. Correctly formatted.

**SafetyWing (1 link):** Line 4997. `https://safetywing.com/nomad-insurance/?referenceID=peakly&utm_source=peakly&utm_medium=affiliate`. Post-intent placement. UTM params present.

**REI (22 links), Backcountry (2 links), GetYourGuide (1 link):** All structurally correct. URLs work, products relevant, placement proper. Only change needed on LLC approval: add affiliate tags to URLs.

### Issues found

- **Hiking lost its only Amazon link.** The Osprey Hydraulics 3L Reservoir (Amazon, $42) was replaced by Osprey Atmos AG 65L Backpack (REI, $300). Higher AOV but earns $0 until LLC. Recommend adding back an Amazon item to hiking.
- **No broken links.** All URLs valid.
- **No misplaced links.** All affiliate CTAs in VenueDetailSheet (post-intent).
- **GetYourGuide (line 4951) has no partner_id parameter.** Needs `&partner_id=XXXXX` on LLC approval.
- **GA4 still not present.** index.html has Plausible only (line 27). No gtag.js.

---

## 3. Hiking Gear Gap

**Status: PARTIALLY FIXED.** Hiking GEAR_ITEMS at lines 4589-4594 now has 4 items:

1. Salomon X Ultra 4 GTX Boots -- REI, $200
2. Black Diamond Trail Trekking Poles -- REI, $140
3. Osprey Atmos AG 65L Backpack -- REI, $300
4. Garmin inReach Mini 2 GPS -- REI, $350

**Problem:** All 4 items are REI. Zero Amazon links. This category earns $0 until LLC approves. v11 had 1 Amazon link (Osprey Hydraulics $42) which was removed.

**Recommendation:** Add 1-2 Amazon items to hiking. Paste-ready code (DO NOT edit code -- for reference only):

```javascript
// Add to hiking array in GEAR_ITEMS (after existing 4 items or replacing one):
{ emoji:"💧", name:"Osprey Hydraulics 3L Reservoir",  store:"Amazon", price:"$42",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=osprey+hydraulics+reservoir" },
{ emoji:"🧦", name:"Darn Tough Hiker Micro Crew Socks", store:"Amazon", price:"$26", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+hiker+micro+crew+socks" },
```

---

## 4. Revenue Modeling

### Current RPM: $12.06 per 1,000 MAU (down from $12.18)

The loss of 1 Amazon link (hiking) marginally reduces RPM. Recalculated below.

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
| **100,000** | **$1,206** | 100 x $12.06 |

### Biggest lever for improving RPM

**Activate REI affiliate links.** 22 links across 8 categories (skiing, surfing, diving, climbing, kayak, mtb, fishing, hiking) with 5% commission on high-AOV gear ($40-$1,200). Estimated RPM boost: +$6.00-$7.50. Blocked by LLC.

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

**Get LLC approved.** Every remaining RPM gain of significance is gated by LLC:

- REI: +$6.16 RPM (22 links ready)
- Backcountry: +$0.56 RPM (2 links ready)
- GetYourGuide: +$1.28 RPM (1 link ready)
- Peakly Pro: +$13.17 RPM (UI done, needs Stripe)
- **Total blocked: +$21.17 RPM = +176% improvement**

### If LLC is still weeks away

The next best non-blocked actions, in order:

**1. Add Amazon links to the 5 categories with zero Amazon items** (skiing, climbing, kayak, mtb, hiking). Adding 1-2 Amazon items per category would create 5-10 new immediately-earning links, estimated +$1.00-$2.00 RPM. Paste-ready code below.

**2. Re-add the hiking Amazon link that was removed.** The Osprey Hydraulics Reservoir was earning-ready and was swapped for a REI-only item. Quick fix, +$0.10-0.15 RPM.

Paste-ready code for Amazon items in zero-Amazon categories (DO NOT edit code -- for reference only):

```javascript
// Add to skiing array in GEAR_ITEMS:
{ emoji:"🧣", name:"Smartwool 250 Base Layer",    store:"Amazon", price:"$100", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smartwool+250+base+layer" },
{ emoji:"🧤", name:"Outdoor Research Adrenaline Gloves", store:"Amazon", price:"$45", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=outdoor+research+adrenaline+gloves" },

// Add to climbing array in GEAR_ITEMS:
{ emoji:"🧲", name:"Petzl GriGri+ Belay Device",  store:"Amazon", price:"$120", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=petzl+grigri+belay+device" },
{ emoji:"🪢", name:"Sterling Evolution Velocity 60m Rope", store:"Amazon", price:"$180", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=sterling+evolution+velocity+climbing+rope" },

// Add to kayak array in GEAR_ITEMS:
{ emoji:"🧤", name:"NRS Cove Neoprene Gloves",    store:"Amazon", price:"$30",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=nrs+cove+neoprene+gloves" },
{ emoji:"📱", name:"Nite Ize RunOff Waterproof Phone Pouch", store:"Amazon", price:"$35", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=nite+ize+runoff+waterproof+phone+pouch" },

// Add to mtb array in GEAR_ITEMS:
{ emoji:"🔧", name:"Topeak Ratchet Rocket Multi-Tool", store:"Amazon", price:"$40", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=topeak+ratchet+rocket+multi+tool" },
{ emoji:"💡", name:"NiteRider Lumina 1200 Headlight", store:"Amazon", price:"$90", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=niterider+lumina+1200+headlight" },

// Add to hiking array in GEAR_ITEMS:
{ emoji:"💧", name:"Osprey Hydraulics 3L Reservoir",  store:"Amazon", price:"$42",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=osprey+hydraulics+reservoir" },
{ emoji:"🧦", name:"Darn Tough Hiker Micro Crew Socks", store:"Amazon", price:"$26", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+hiker+micro+crew+socks" },
```

This would bring Amazon links from 20 to 30, adding earning capacity to every category. Estimated RPM boost: +$1.50-$2.00 (to ~$13.56-$14.06).

---

## v12 Delta (what changed since v11)

- **App.jsx: 6,354 -> 6,072 lines** (-282 lines). Venue trimming as noted.
- **Venues: ~192** (trimmed from previous count, as instructed).
- **Amazon links: 21 -> 20.** Hiking lost its only Amazon item (Osprey Hydraulics replaced by Osprey Atmos REI).
- **REI links: 21 -> 22.** Hiking gained 1 more REI item.
- **RPM: $12.18 -> $12.06** (marginal drop from lost Amazon link).
- **Peakly Pro pricing: STILL CORRECT.** $79/yr at line 5016.
- **AFFILIATE_ID placeholders: 0.** Still clean.
- **HTTPS proxy: CONFIRMED.** Line 1342, `https://peakly-api.duckdns.org`.
- **GA4: STILL NOT PRESENT.** Plausible only.
- **Hiking GEAR_ITEMS: REGRESSION.** Had 1 Amazon link in v11, now has 0. All 4 items are REI-only.
- **Top blocker: LLC approval (unchanged).** +$21.17 RPM (+176%) waiting to unlock. Estimated $335/mo lost at 5K MAU.

---

## Summary of Action Items (ordered by impact)

| Priority | Action | Blocked? | Time | Revenue Impact |
|----------|--------|----------|------|---------------|
| P0 | **LLC approval** | EXTERNAL | Waiting | **+$21.17/1K MAU RPM (+176%)** |
| P1 | Add Amazon links to skiing/climbing/kayak/mtb/hiking (10 items) | No | 30 min | +$1.50-2.00 RPM |
| P2 | Re-add hiking Amazon link (Osprey Hydraulics removed in trim) | No | 5 min | +$0.10-0.15 RPM |
| P3 | Check Plausible dashboard for traffic baseline | No | 5 min | Validates all revenue assumptions |
| P4 | Sign up REI/Backcountry/GetYourGuide (post-LLC) | Yes (LLC) | 90 min | +$8.00 RPM |
| P5 | Wire Stripe for Peakly Pro (post-LLC) | Yes (LLC) | 3 hrs | +$13.17 RPM |
| P6 | Add GA4 for e-commerce event tracking | No | 15 min | Enables affiliate conversion tracking |
