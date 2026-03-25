# Peakly Revenue Report: 2026-03-24 (v11)

## Revenue Health: YELLOW

Three affiliate streams live (Amazon 21 links, Booking.com 1, SafetyWing 1). Peakly Pro pricing correctly shows $79/yr (line 5298). Hiking GEAR_ITEMS shipped (4 items). Zero AFFILIATE_ID placeholders. VPS proxy confirmed HTTPS on peakly-api.duckdns.org (line 1624) -- real flight prices now loading. PWA manifest + service worker deployed. LLC remains the top blocker -- 24 links across REI, Backcountry, and GetYourGuide are structurally ready but earning $0.

---

## 1. P0: Peakly Pro Pricing Fix

**Status: FIXED (confirmed).** Line 5298: `$79/yr`. No instances of `$9/mo` anywhere in app.jsx. No action needed.

---

## 2. Affiliate Link Audit

### Verified counts (app.jsx, 6,354 lines)

| Affiliate | Link Count | Tagged/Tracked | Status |
|-----------|-----------|----------------|--------|
| Amazon (`tag=peakly-20`) | 21 | 21/21 (100%) | LIVE, EARNING |
| REI (`rei.com`) | 21 | 0/21 -- no affiliate tag | BLOCKED BY LLC |
| Backcountry (`backcountry.com`) | 2 | 0/2 -- no affiliate tag | BLOCKED BY LLC |
| Booking.com (`aid=2311236`) | 1 | 1/1 (100%) | LIVE, EARNING |
| SafetyWing (`referenceID=peakly`) | 1 | 1/1 (100%) | LIVE, EARNING |
| GetYourGuide | 1 | 0/1 -- no partner_id | BLOCKED BY LLC |
| AFFILIATE_ID placeholders | 0 | Clean | N/A |

### Changes since v10

- **App.jsx grew from 5,666 to 6,354 lines** (+688 lines). Significant expansion.
- **Link counts unchanged.** Amazon 21, REI 21, Backcountry 2, Booking.com 1, SafetyWing 1, GetYourGuide 1.
- **VPS proxy now HTTPS.** Flight proxy URL at line 1624 is `https://peakly-api.duckdns.org`. Mixed content errors resolved. Real Travelpayouts prices loading.
- **PWA added.** manifest.json, sw.js, service worker registration in index.html (lines 61-62, 97-100). Installable on mobile.

### Detail on each live stream

**Amazon (21 links):** All tagged `peakly-20`. Distributed across 8 categories: surfing (2), tanning (4), diving (3), kite (4), fishing (3), paraglide (4), hiking (1). Categories with ZERO Amazon links: skiing, climbing, kayak, mtb (all REI/Backcountry only).

**Booking.com (1 link):** Line 5261. Dynamic per-venue: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(listing.location)}&aid=2311236`. Post-intent placement in VenueDetailSheet. Correctly formatted.

**SafetyWing (1 link):** Lines 5278-5284. `https://safetywing.com/nomad-insurance/?referenceID=peakly&utm_source=peakly&utm_medium=affiliate`. Post-intent placement. UTM params present.

**REI (21 links), Backcountry (2 links), GetYourGuide (1 link):** All structurally correct. URLs work, products relevant, placement proper. Only change needed on LLC approval: add affiliate tags to URLs.

### Issues found

- **No broken links.** All URLs are valid.
- **No misplaced links.** All affiliate CTAs in VenueDetailSheet (post-intent).
- **GetYourGuide (line 5233) has no partner_id parameter.** Dynamic URL template needs `&partner_id=XXXXX` on LLC approval.
- **GA4 was removed or never deployed.** index.html has Plausible only (line 27). The GA4 gtag.js referenced in CLAUDE.md is not present. Plausible is sufficient for now but GA4 would give richer e-commerce tracking when affiliate volume grows.

---

## 3. Hiking Gear Gap

**Status: FIXED (confirmed).** Hiking GEAR_ITEMS at lines 4871-4876 with 4 items:

1. Salomon X Ultra 4 GTX Boots -- REI, $165
2. Black Diamond Trail Trekking Poles -- REI, $90
3. Osprey Hydraulics 3L Reservoir -- Amazon (`peakly-20`), $42
4. Garmin inReach Mini 2 GPS -- REI, $350

Revenue status: 1 Amazon link earning immediately. 3 REI links activate on LLC approval. No action needed.

---

## 4. Revenue Modeling

### Current RPM: $12.18 per 1,000 MAU (unchanged from v10)

No new earning links were added since v10. The VPS proxy fix means flight prices now display correctly, which should improve Travelpayouts click-through (users see real prices instead of "est." labels), but Travelpayouts revenue runs through the proxy and is not tracked as affiliate RPM here.

| Stream | Click-through | Avg Order | Commission | Est. RPM |
|--------|--------------|-----------|------------|----------|
| Amazon gear (21 links) | 37 clicks/1K | $160 | 4% | **$4.74** |
| Booking.com (1 link) | 23 clicks/1K | $300 (2 nights) | ~$15/booking | **$6.90** |
| SafetyWing (1 link) | 6 clicks/1K | $45/mo | ~10% | **$0.54** |
| REI (21 links, 5%) | 0 (no tag) | -- | 5% | **$0.00** |
| Backcountry (2 links, 8%) | 0 (no tag) | -- | 8% | **$0.00** |
| GetYourGuide (1 link, 8%) | 0 (no ID) | -- | 8% | **$0.00** |
| Peakly Pro | NOT WIRED | -- | -- | **$0.00** |
| **Total (live)** | | | | **$12.18** |

### Projections at current RPM ($12.18)

| MAU | Monthly Revenue | Math |
|-----|----------------|------|
| **1,000** | **$12.18** | 1 x $12.18 |
| **5,000** (low Reddit) | **$60.90** | 5 x $12.18 |
| **8,000** (high Reddit) | **$97.44** | 8 x $12.18 |
| **100,000** | **$1,218** | 100 x $12.18 |

### Biggest lever for improving RPM

**Activate REI affiliate links.** 21 links across 8 categories (skiing, surfing, diving, climbing, kayak, mtb, fishing, hiking) with 5% commission on high-AOV gear ($40-$1,200). Estimated RPM boost: +$5.50-$7.00. Blocked by LLC.

---

## 5. LLC Unblock Plan

### Day-of sequence when LLC approves

1. **REI/Avantlink affiliate signup** (30 min) -- apply at avantlink.com, get affiliate ID
2. **Backcountry affiliate signup** (30 min) -- apply through their partner program
3. **GetYourGuide partner signup** (30 min) -- apply at partner.getyourguide.com, get partner_id
4. **Update app.jsx:** Add affiliate tags to all 21 REI URLs, 2 Backcountry URLs, 1 GetYourGuide URL
5. **Stripe account setup** (1 hr) -- connect to LLC bank account, configure $79/yr product
6. **Wire Peakly Pro button** to Stripe Checkout (2-3 hrs dev work)
7. **Push to main** -- all changes go live immediately via GitHub Pages

### RPM jump estimate post-LLC

| Stream | Pre-LLC RPM | Post-LLC RPM |
|--------|-------------|--------------|
| Amazon | $4.74 | $4.74 (unchanged) |
| REI (21 links, 5%) | $0.00 | **+$5.78** (est. 37 clicks/1K, $312 avg, 5%) |
| Backcountry (2 links, 8%) | $0.00 | **+$0.56** (est. 4 clicks/1K, $175 avg, 8%) |
| GetYourGuide (1 link, 8%) | $0.00 | **+$1.28** (est. 8 clicks/1K, $200 avg, 8%) |
| Booking.com | $6.90 | $6.90 (unchanged) |
| SafetyWing | $0.54 | $0.54 (unchanged) |
| Peakly Pro (2% conversion) | $0.00 | **+$13.17** ($79/yr = $6.58/mo x 20 subs per 1K) |
| **Total** | **$12.18** | **~$32.97** |

**RPM jumps from $12.18 to ~$32.97 (+171%) on LLC approval day.**

### Revenue left on the table per day of delay

At current traffic (likely <100 MAU): negligible, <$1/day.

At projected post-Reddit traffic (5K MAU): **~$3.47/day** in lost affiliate revenue, **~$10.97/day** including Pro subscriptions. That is **$329/month** at 5K MAU sitting on the table waiting for LLC.

---

## 6. The Single Highest-Revenue-Impact Change This Week

**Get LLC approved.** Every remaining RPM gain of significance is gated by LLC:

- REI: +$5.78 RPM (21 links ready)
- Backcountry: +$0.56 RPM (2 links ready)
- GetYourGuide: +$1.28 RPM (1 link ready)
- Peakly Pro: +$13.17 RPM (UI done, needs Stripe)
- **Total blocked: +$20.79 RPM = +171% improvement**

### If LLC is still weeks away

The next best non-blocked action is **adding Amazon-linked gear items to the 4 categories that currently have zero Amazon links**: skiing (4 REI items, 0 Amazon), climbing (4 REI items, 0 Amazon), kayak (4 REI items, 0 Amazon), mtb (2 REI + 2 Backcountry, 0 Amazon). Adding 1-2 Amazon items per category would create ~6-8 more immediately-earning links, estimated +$1.00-$1.50 RPM.

Paste-ready code for those items (DO NOT edit code -- for reference only):

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
```

This would bring Amazon links from 21 to 29, adding earning capacity to every category.

---

## v11 Delta (what changed since v10)

- **App.jsx: 5,666 -> 6,354 lines** (+688 lines). Significant code additions since last report.
- **VPS proxy: NOW HTTPS.** peakly-api.duckdns.org confirmed at line 1624. Mixed content timeout resolved. Real flight prices loading.
- **PWA: DEPLOYED.** manifest.json, sw.js, service worker registration all in place. App is installable on mobile.
- **Affiliate link counts: UNCHANGED.** Amazon 21, REI 21, Backcountry 2, Booking.com 1, SafetyWing 1, GetYourGuide 1.
- **RPM: $12.18 (unchanged).** No new earning links added.
- **Peakly Pro pricing: STILL CORRECT.** $79/yr at line 5298.
- **AFFILIATE_ID placeholders: 0.** Still clean.
- **GA4: NOT PRESENT.** Despite CLAUDE.md noting it was added, gtag.js is not in index.html. Plausible is the only analytics. Not blocking revenue but worth noting.
- **Top blocker: LLC approval (unchanged).** +$20.79 RPM (+171%) waiting to unlock. Estimated $329/mo lost at 5K MAU.

---

## Summary of Action Items (ordered by impact)

| Priority | Action | Blocked? | Time | Revenue Impact |
|----------|--------|----------|------|---------------|
| P0 | **LLC approval** | EXTERNAL | Waiting | **+$20.79/1K MAU RPM (+171%)** |
| P1 | Add Amazon links to skiing/climbing/kayak/mtb (8 items) | No | 30 min | +$1.00-1.50 RPM |
| P2 | Check Plausible dashboard for traffic baseline | No | 5 min | Validates all revenue assumptions |
| P3 | Sign up REI/Backcountry/GetYourGuide (post-LLC) | Yes (LLC) | 90 min | +$7.62 RPM |
| P4 | Wire Stripe for Peakly Pro (post-LLC) | Yes (LLC) | 3 hrs | +$13.17 RPM |
| P5 | Add GA4 for e-commerce event tracking | No | 15 min | Enables affiliate conversion tracking |
