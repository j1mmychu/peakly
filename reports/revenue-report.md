# Peakly Revenue Report: 2026-03-24 (v7)

## Revenue Readiness: SOFT LAUNCH (unchanged)

Three affiliate streams remain live and earning-ready (Amazon, Booking.com, SafetyWing). Zero affiliate code changes since v6. The Phase 1 UI polish (enlarged Book CTA, improved touch targets, typography refinements) is expected to lift click-through rates on the Google Flights "Book" button and, by proximity, on the Booking.com hotel CTA in VenueDetailSheet. No new revenue streams added. LLC approval continues to block REI, Backcountry, GetYourGuide, and Peakly Pro.

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
| 7 | **Google Flights** | Flight deep links | **NO REVENUE** | `buildFlightUrl()` powers Book CTAs on ListingCard, FeaturedCard, and VenueDetailSheet. No affiliate program exists -- pure user value. However, the enlarged CTA pulls users deeper into the venue funnel where revenue CTAs (Booking.com, SafetyWing, gear) live. |
| 8 | **Peakly Pro** | Subscription ($79/year) | **NOT BUILT** | Upsell banner in VenueDetailSheet still shows **$9/mo** (stale copy -- should read $79/year per pricing decision 2026-03-23). Button triggers `alert("Peakly Pro coming soon!")`. No Stripe/Paddle integration. Blocked by LLC + Stripe setup. |

---

## Amazon Tag Verified: YES -- 20 of 20

Grep count of `tag=peakly-20` in app.jsx: **20 exact matches**. Every Amazon URL in GEAR_ITEMS contains the tag. Zero Amazon URLs missing tracking. No change from v6.

---

## Estimated RPM (per 1,000 MAU)

Assumptions updated for v7: the enlarged Book CTA (padding increased to 14px 16px, font bumped to 14px/fontWeight 900, added box-shadow with 0.38 opacity, emoji scaled to 20px) and improved touch targets are expected to increase VenueDetailSheet engagement. Estimated click-through on affiliate CTAs revised upward from 3% to 3.5% based on industry benchmarks for larger, higher-contrast mobile CTAs (+15-20% lift on tap rate).

| Stream | Status | Click-through | Avg Order | Commission | Est. RPM |
|--------|--------|--------------|-----------|------------|----------|
| Amazon gear | LIVE | 30 clicks/1K | $120 | 4% | **$2.88** |
| REI gear | NO TAG | 0 | -- | 5% | **$0.00** |
| Backcountry | NO TAG | 0 | -- | 8% | **$0.00** |
| Booking.com | LIVE | 23 clicks/1K (+15%) | $300 (2 nights) | ~$15/booking | **$6.90** |
| SafetyWing | LIVE | 6 clicks/1K (+15%) | $45/mo | ~10% | **$0.54** |
| GetYourGuide | NO ID | 0 | -- | 8% | **$0.00** |
| Google Flights | N/A | -- | -- | 0% | **$0.00** |
| Peakly Pro | NOT BUILT | -- | $79/yr | 100% | **$0.00** |
| **Total (live)** | | | | | **$10.32** |

Previous v6 total: $9.33. The CTA enlargement is projected to add ~$0.99/1K MAU (+10.6%) through improved Booking.com and SafetyWing click-through. Amazon gear links are deeper in the funnel (gear tab) and less affected by the Book CTA change.

With REI + Backcountry + GetYourGuide activated: estimated RPM ~$15-17.

---

## Top Revenue Blocker

**LLC approval.** Unchanged from v6. This single dependency blocks four revenue streams (REI, Backcountry, GetYourGuide affiliate signups) and the highest-value stream (Peakly Pro via Stripe). The 18 REI gear links and 2 Backcountry links already exist in the codebase but generate zero commissions. Until the LLC clears, the revenue ceiling is ~$10.32/1K MAU from the three active streams. After LLC, the ceiling rises to $15-17/1K MAU on affiliates alone, plus unbounded upside from Peakly Pro subscriptions.

Secondary blocker: **No analytics.** Without GA4 or Plausible, the projected CTA lift cannot be measured. The 15% click-through improvement is an estimate -- actual impact is unknown. Installing analytics is a zero-dependency task that should not wait for the LLC.

Tertiary issue: **Peakly Pro pricing mismatch.** The upsell UI in app.jsx (line 4562) still shows `$9/mo` while the agreed pricing is `$79/year`. This should be corrected before Pro launches to avoid confusion, but is non-blocking since Pro is not yet functional.

---

## Fastest Path to First Dollar

**Drive one user to click a Booking.com hotel link and complete a stay.** (Unchanged from v6.)

- Booking.com is fully working (`aid=2311236` confirmed in code)
- Hotel bookings have the highest per-transaction value ($150-300+)
- Commission ~$15-40 per completed booking
- The enlarged Book flight CTA now pulls more users into VenueDetailSheet where the Booking.com hotel CTA sits directly below
- No LLC required -- Booking.com affiliate is already active

**Action:** Share a specific Peakly venue link (e.g., a trending surf or ski spot) in a relevant Reddit thread (r/solotravel, r/surfing, r/skiing) where someone is actively planning a trip. One hotel booking = first dollar.

---

## Decision Made

**LLC approval remains the critical path.** The UI polish work (enlarged CTAs, touch targets, typography) is expected to lift conversion on existing streams by ~10%, but the absolute dollar impact is small without traffic. Every day without the LLC is a day where 20 gear links (REI + Backcountry) and the entire Peakly Pro subscription tier earn zero.

Immediate non-LLC actions worth taking now:
1. **Add GA4 or Plausible analytics** (1 hour) -- measure real traffic and validate CTA lift assumptions
2. **Fix Pro pricing copy** from $9/mo to $79/year in app.jsx line 4562 (5 min)

Post-LLC action sequence (unchanged):
1. Sign up for REI Avantlink affiliate (30 min, unlocks 18 links)
2. Sign up for Backcountry affiliate (30 min, unlocks 2 links)
3. Sign up for GetYourGuide partner program (30 min, unlocks experience links)
4. Begin Stripe integration for Peakly Pro ($79/year)

---

## 30-Day Projection

**Current streams only (Amazon + Booking.com + SafetyWing), with CTA lift applied:**

| MAU | Amazon | Booking.com | SafetyWing | **Total/mo** |
|-----|--------|-------------|------------|-------------|
| 1,000 | $2.88 | $6.90 | $0.54 | **$10.32** |
| 10,000 | $28.80 | $69.00 | $5.40 | **$103.20** |
| 100,000 | $288 | $690 | $54 | **$1,032** |

**With REI + Backcountry + GetYourGuide activated (post-LLC):**

| MAU | **Projected Total/mo** |
|-----|----------------------|
| 1,000 | $22-38 |
| 10,000 | $220-380 |
| 100,000 | $2,200-3,800 |

**With Peakly Pro at 2% conversion ($79/year = $6.58/mo):**

| MAU | Pro subs | Pro revenue | **Grand Total/mo** |
|-----|----------|-------------|-------------------|
| 1,000 | 20 | $132 | **$154-170** |
| 10,000 | 200 | $1,317 | **$1,537-1,697** |
| 100,000 | 2,000 | $13,167 | **$15,367-16,967** |

---

## v7 Delta (what changed since v6)

- **No new revenue streams added.** Affiliate code unchanged.
- **UI polish shipped:** Enlarged Book CTA in VenueDetailSheet (padding 14px 16px, fontSize 14, fontWeight 900, emoji 20px, stronger box-shadow). Improved touch targets across cards. Typography polish throughout.
- **Conversion impact:** Estimated +15% click-through lift on VenueDetailSheet affiliate CTAs (Booking.com, SafetyWing) due to larger, more prominent Book CTA pulling users deeper into the venue funnel. RPM revised from $9.33 to $10.32 (+$0.99, +10.6%).
- **Amazon tag count:** 20 (unchanged).
- **REI links:** 18 (unchanged, still untagged).
- **Backcountry links:** 2 (unchanged, still untagged).
- **Booking.com:** 1 link with aid (unchanged).
- **SafetyWing:** 1 link with referenceID (unchanged).
- **GetYourGuide:** 1 dynamic link, no partner_id (unchanged).
- **AFFILIATE_ID placeholders:** 0 found (clean).
- **Peakly Pro pricing mismatch flagged:** UI shows $9/mo, agreed pricing is $79/year. Non-blocking but should be fixed before launch.
- **Top blocker:** LLC approval (unchanged).

**Bottom line:** The enlarged Book CTA is a modest but meaningful conversion improvement, lifting projected live RPM from $9.33 to $10.32. However, without traffic and without the LLC unblocking four additional streams + Peakly Pro, the absolute revenue impact remains theoretical. The two highest-leverage actions right now are (1) get the LLC approved and (2) add analytics to start measuring real numbers.
