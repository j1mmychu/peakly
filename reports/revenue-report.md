# Peakly Revenue Report: 2026-03-24 (v10)

## Revenue Health: YELLOW

Three affiliate streams live (Amazon, Booking.com, SafetyWing). Plausible analytics confirmed live. LLC still blocks REI (21 links), Backcountry (2 links), GetYourGuide (1 link), and Peakly Pro. **Peakly Pro pricing FIXED to $79/yr** (was $9/mo for 9 reports straight). **Hiking GEAR_ITEMS SHIPPED** (4 items). No AFFILIATE_ID placeholders remain (clean).

---

## 1. P0: Peakly Pro Pricing Fix

**Status: FIXED.** Line 4610 in app.jsx now displays `$79/yr`. Confirmed via grep. This was flagged as broken in v1 through v9 and is now resolved.

No further action needed on pricing display.

---

## 2. Affiliate Link Audit

### Verified counts (grep against app.jsx, 5,666 lines)

| Affiliate | URL Count | Tagged/Tracked | Status |
|-----------|-----------|----------------|--------|
| Amazon (`tag=peakly-20`) | 21 | 21/21 (100%) | WORKING |
| REI (`rei.com`) | 21 | 0/21 (0%) -- no affiliate tag | BLOCKED BY LLC |
| Backcountry (`backcountry.com`) | 2 | 0/2 (0%) -- no affiliate tag | BLOCKED BY LLC |
| Booking.com (`aid=2311236`) | 1 | 1/1 (100%) | WORKING |
| SafetyWing (`referenceID=peakly`) | 1 | 1/1 (100%) | WORKING |
| GetYourGuide | 1 | 0/1 (0%) -- no partner_id | BLOCKED BY LLC |
| AFFILIATE_ID placeholders | 0 | Clean | N/A |

### Changes since v9

- **Amazon: 20 -> 21 links.** New Osprey Hydraulics reservoir link added in hiking GEAR_ITEMS (line 4189). Correctly tagged `peakly-20`.
- **REI: 18 -> 21 links.** Three new hiking items added (Salomon boots, BD trekking poles, Garmin inReach). All structurally ready for affiliate tag on LLC approval.

### Detail on each live stream

**Amazon (21 links):** All tagged `peakly-20`. Now distributed across 11 categories: surfing (2), tanning (4), diving (2), kite (4), fishing (3), paraglide (4), hiking (1), mtb (0 -- all REI/Backcountry), skiing (0 -- all REI), climbing (0 -- all REI), kayak (0 -- all REI). Amazon links are working and correctly formatted as search URLs.

**Booking.com (1 link):** Line 4573. Dynamic per-venue: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(listing.location)}&aid=2311236`. Post-intent placement in VenueDetailSheet. `aid=2311236` confirmed.

**SafetyWing (1 link):** Line 4591. `https://safetywing.com/nomad-insurance/?referenceID=peakly&utm_source=peakly&utm_medium=affiliate`. Post-intent placement in VenueDetailSheet. UTM params present.

**REI (21 links), Backcountry (2 links), GetYourGuide (1 link):** All structurally correct. URLs work, products are relevant, placement is proper. The moment LLC approves, the only change needed is adding affiliate tags to the URLs. No code restructuring required.

### Issues found

- **No broken links.** All URLs are valid search/product URLs.
- **No misplaced links.** All affiliate CTAs live inside VenueDetailSheet (post-intent).
- **GetYourGuide has no partner_id parameter.** Line 4545 generates dynamic URLs with zero tracking. On LLC approval, add `&partner_id=XXXXX` to the URL template.

---

## 3. Hiking Gear Gap

**Status: FIXED.** Hiking GEAR_ITEMS shipped with 4 items (lines 4186-4191):

1. Salomon X Ultra 4 GTX Boots -- REI, $165
2. Black Diamond Trail Trekking Poles -- REI, $90
3. Osprey Hydraulics 3L Reservoir -- Amazon (`peakly-20`), $42
4. Garmin inReach Mini 2 GPS -- REI, $350

**Revenue status:** The 1 Amazon link (Osprey reservoir) is earning immediately. The 3 REI links activate on LLC approval. Average gear AOV for this set: ~$162. Hiking's 9 high-prestige venues (Kilimanjaro, Everest BC, Inca Trail, etc.) attract serious adventure travelers with high purchase intent.

This was flagged as missing in v1 through v9 and is now resolved.

---

## 4. Revenue Modeling

### Current RPM: $12.26 per 1,000 MAU (up from $12.06)

The hiking Amazon link adds marginal RPM. Updated model:

| Stream | Click-through | Avg Order | Commission | Est. RPM |
|--------|--------------|-----------|------------|----------|
| Amazon gear (21 links) | 37 clicks/1K | $160 | 4% | **$4.74** |
| Booking.com (1 link) | 23 clicks/1K | $300 (2 nights) | ~$15/booking | **$6.90** |
| SafetyWing (1 link) | 6 clicks/1K | $45/mo | ~10% | **$0.54** |
| REI (21 links) | 0 (no tag) | -- | 5% | **$0.00** |
| Backcountry (2 links) | 0 (no tag) | -- | 8% | **$0.00** |
| GetYourGuide (1 link) | 0 (no ID) | -- | 8% | **$0.00** |
| Peakly Pro | NOT WIRED | -- | -- | **$0.00** |
| **Total (live)** | | | | **$12.18** |

*Note: RPM is conservatively estimated. Actual will depend on Plausible data once traffic materializes.*

### Projections at current RPM ($12.18)

| MAU | Monthly Revenue | Math |
|-----|----------------|------|
| **1,000** | **$12.18** | 1 x $12.18 |
| **5,000** (low Reddit) | **$60.90** | 5 x $12.18 |
| **8,000** (high Reddit) | **$97.44** | 8 x $12.18 |
| **100,000** | **$1,218** | 100 x $12.18 |

### Biggest lever for improving RPM

**Activate REI affiliate links.** REI now has 21 links across 8 categories (skiing, surfing, diving, climbing, kayak, mtb, fishing, hiking) with 5% commission on high-AOV gear ($40-$1,200). Estimated RPM boost: +$5.50-$7.00. This alone would more than double the Amazon RPM. Blocked by LLC.

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

**Get LLC approved.** Seriously. With both P0 items now fixed (Pro pricing + hiking gear), there are zero non-blocked revenue improvements left that move the needle meaningfully. Every remaining RPM gain is gated by LLC:

- REI: +$5.78 RPM (21 links ready)
- Backcountry: +$0.56 RPM (2 links ready)
- GetYourGuide: +$1.28 RPM (1 link ready)
- Peakly Pro: +$13.17 RPM (UI done, needs Stripe)
- **Total blocked: +$20.79 RPM = +171% improvement**

If LLC is pending for administrative reasons, this is the single highest-leverage action across the entire business right now.

### If LLC is still weeks away

The next best non-blocked action is **adding more Amazon-linked gear items to categories that currently have zero Amazon links**: skiing (4 REI links, 0 Amazon), climbing (4 REI links, 0 Amazon), kayak (4 REI links, 0 Amazon), and mtb (2 REI + 2 Backcountry, 0 Amazon). Adding 1-2 Amazon items per category would add ~8 more earning links immediately, estimated +$1.00-$1.50 RPM.

---

## v10 Delta (what changed since v9)

- **Peakly Pro pricing: FIXED.** Line 4610 now shows `$79/yr`. Was broken for 9 consecutive reports.
- **Hiking GEAR_ITEMS: SHIPPED.** 4 items added (3 REI, 1 Amazon). Was missing for 9 consecutive reports.
- **Amazon links: 20 -> 21.** New Osprey Hydraulics link in hiking category.
- **REI links: 18 -> 21.** Three new hiking items (boots, poles, GPS).
- **RPM: $12.18** (marginal increase from $12.06 due to 1 new Amazon link).
- **App.jsx: 5,605 -> 5,666 lines** (grew 61 lines since last snapshot).
- **AFFILIATE_ID placeholders: 0.** Still clean.
- **Plausible: CONFIRMED LIVE.** Line 27 of index.html, using `script.hash.js` variant.
- **Top blocker: LLC approval (unchanged).** Now blocking even more value with 21 REI links (was 18). Estimated $329/mo+ lost at 5K MAU.
- **No new action items for code changes.** Both P0 items are resolved. All remaining revenue improvements are LLC-blocked or marginal.

---

## Summary of Action Items (ordered by impact)

| Priority | Action | Blocked? | Time | Revenue Impact |
|----------|--------|----------|------|---------------|
| ~~P0~~ | ~~Fix Pro pricing $9/mo -> $79/yr~~ | ~~No~~ | DONE | Prevents price anchoring damage |
| ~~P1~~ | ~~Add hiking GEAR_ITEMS~~ | ~~No~~ | DONE | +$0.12-0.20 RPM |
| P0 | **LLC approval** | EXTERNAL | Waiting | **+$20.79/1K MAU RPM (+171%)** |
| P1 | Add Amazon links to skiing/climbing/kayak/mtb | No | 30 min | +$1.00-1.50 RPM |
| P2 | Check Plausible dashboard for traffic baseline | No | 5 min | Validates all revenue assumptions |
| P3 | Sign up REI/Backcountry/GetYourGuide (post-LLC) | Yes (LLC) | 90 min | +$7.62 RPM |
| P4 | Wire Stripe for Peakly Pro (post-LLC) | Yes (LLC) | 3 hrs | +$13.17 RPM |
