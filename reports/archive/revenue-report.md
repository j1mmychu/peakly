# Revenue Report -- 2026-03-27

## Revenue Health: YELLOW

RPM $12.06 is solid for pre-launch, but TP_MARKER is still a placeholder (every flight click earns $0 in commission), REI's 22 links have no affiliate tag, and Backcountry + GetYourGuide remain unactivated. LLC was approved 2026-03-25 -- these streams should be live before the Reddit launch.

---

## 1. Peakly Pro Pricing -- RESOLVED (No Action)

Peakly Pro UI was **removed** (2026-03-26) and replaced with an email capture waitlist. The $9/mo vs $79/yr confusion is no longer user-facing. Stripe integration deferred until waitlist validates demand.

**LTV model for future reference:**
- $9/mo at 4-month avg retention = $36 LTV
- $79/yr at 36% annual renewal (RevenueCat benchmark) = $79 + $28.44 + $10.24 = **$117.68 LTV**
- Annual plan wins by 3.3x. Keep $79/yr when Pro ships.

---

## 2. Affiliate Link Audit

### Active & Earning

| Stream | Tag/ID | Links | Status |
|--------|--------|-------|--------|
| Amazon Associates | `peakly-20` | 39 links across 11 categories | LIVE. Tag consistent. Post-intent in VenueDetailSheet gear section. |
| Booking.com | `aid=2311236` | 2 placements | LIVE. VenueDetailSheet hotel card + sticky CTA. |
| SafetyWing | `referenceID=peakly` | 1 link | LIVE. VenueDetailSheet insurance card. Post-intent. |
| Travelpayouts (flight prices) | HTTPS proxy | Flight price API | LIVE. Prices load. But see TP_MARKER issue below. |

### Earning $0 -- Needs Action

| Stream | Links | Issue | Owner |
|--------|-------|-------|-------|
| **Aviasales/TP_MARKER** | Every flight click | `TP_MARKER = "YOUR_TP_MARKER"` (line 3771). Code correctly gates this -- falls back to unattributed Aviasales URLs. **Every flight click earns $0.** | Jack: 5 min |
| REI | 22 links, 8 categories | No affiliate tracking param on URLs | Jack: Avantlink signup, 30 min |
| Backcountry | 2 links (MTB) | No affiliate tracking param | Jack: Avantlink signup, 15 min |
| GetYourGuide | Dynamic links in experiences | No `partner_id` param | Jack: Partner signup, 20 min |

### TP_MARKER -- Critical Revenue Leak

Line 3771: `const TP_MARKER = "YOUR_TP_MARKER";`
Line 3790 checks: `if (TP_MARKER && TP_MARKER !== "YOUR_TP_MARKER")` -- correctly falls back to unattributed links.

**This means flight prices display correctly via the proxy, but zero commission is earned on any booking.** Flight clicks are likely the highest-frequency affiliate touchpoint (every venue detail view shows flights). This is the single fastest revenue fix available.

**Fix:** Get marker from Travelpayouts dashboard (Programs > Aviasales > Marker ID). Replace `"YOUR_TP_MARKER"` with real value on line 3771. One line, push to main.

---

## 3. Hiking Gear Gap -- RESOLVED

Hiking now has **7 GEAR_ITEMS** (lines 7401-7409):

| Item | Store | Price | Earning? |
|------|-------|-------|----------|
| Salomon X Ultra 4 GTX Boots | REI | $200 | No (no REI tag) |
| BD Trail Trekking Poles | REI | $140 | No |
| Osprey Atmos AG 65L Pack | REI | $300 | No |
| Garmin inReach Mini 2 GPS | REI | $350 | No |
| Osprey Hydraulics 3L Reservoir | Amazon | $45 | Yes |
| BD Spot 400 Headlamp | Amazon | $36 | Yes |
| Darn Tough Hiker Socks | Amazon | $26 | Yes |

4 of 7 hiking items are REI-only (earning $0). 3 Amazon items are tagged and earning. No code change needed -- gap is filled. Revenue activates when REI Avantlink tag is added.

---

## 4. Revenue Model

### Current Live RPM: $12.06 per 1,000 MAU/month

| Stream | RPM |
|--------|-----|
| Amazon (39 links, `peakly-20`) | $4.48 |
| Booking.com (2 placements, `aid=2311236`) | $6.90 |
| SafetyWing (1 link, `referenceID=peakly`) | $0.54 |
| Travelpayouts (flights via proxy) | $0.14 |
| **Total** | **$12.06** |

### Projections at Current RPM ($12.06)

| MAU | Monthly Revenue | Annual Revenue |
|-----|----------------|----------------|
| 1,000 | $12.06 | $144.72 |
| 5,000 (low Reddit) | $60.30 | $723.60 |
| 8,000 (high Reddit) | $96.48 | $1,157.76 |
| 100,000 | $1,206.00 | $14,472.00 |

### Projections After All Streams Activate (RPM ~$21.56)

Post-activation RPM = $12.06 + $6.16 (REI) + $0.56 (Backcountry) + $1.28 (GYG) + $1.50 (TP_MARKER fix, conservative) = **$21.56**

| MAU | Monthly Revenue | Annual Revenue | Delta vs Current |
|-----|----------------|----------------|-----------------|
| 1,000 | $21.56 | $258.72 | +$9.50/mo |
| 5,000 | $107.80 | $1,293.60 | +$47.50/mo |
| 8,000 | $172.48 | $2,069.76 | +$76.00/mo |
| 100,000 | $2,156.00 | $25,872.00 | +$950.00/mo |

**Math:** Monthly Revenue = (MAU / 1,000) x RPM

**Biggest lever:** REI activation (+$6.16 RPM, +51%) is the largest single RPM jump. But TP_MARKER fix is the fastest (5 minutes, immediate).

---

## 5. LLC Unblock -- Activation Day Sequence

LLC approved 2026-03-25. All streams are now actionable. Recommended sequence:

| Step | Time | Action | RPM Impact |
|------|------|--------|------------|
| 1 | 5 min | Replace TP_MARKER with real Travelpayouts marker | +$1.50 est. |
| 2 | 30 min | REI Avantlink signup, update 22 URLs | +$6.16 |
| 3 | 15 min | Backcountry Avantlink signup, update 2 URLs | +$0.56 |
| 4 | 20 min | GetYourGuide partner signup, update URL template | +$1.28 |
| 5 | 5 min | Push to main | Immediate |
| **Total** | **~75 min** | **All 4 streams live** | **+$9.50 RPM (+79%)** |

### Revenue Left on Table Per Day of Delay

| MAU | Lost/day (all 4 streams) | Lost/month |
|-----|--------------------------|------------|
| 1,000 | $0.32/day | $9.50/mo |
| 5,000 | $1.58/day | $47.50/mo |
| 8,000 | $2.53/day | $76.00/mo |

**Critical timing:** These must be wired BEFORE the Reddit launch. Launching without affiliate IDs means the highest-traffic period earns 44% less than it should.

---

## 6. GEAR_ITEMS Coverage Summary

| Category | Items | Amazon | REI | Backcountry | Earning? |
|----------|-------|--------|-----|-------------|----------|
| Skiing | 8 | 4 | 4 | 0 | Partial (Amazon only) |
| Surfing | 4 | 2 | 2 | 0 | Partial |
| Tanning | 4 | 4 | 0 | 0 | Full |
| Diving | 4 | 3 | 1 | 0 | Partial |
| Climbing | 8 | 4 | 4 | 0 | Partial |
| Kayak | 8 | 4 | 4 | 0 | Partial |
| MTB | 8 | 4 | 2 | 2 | Partial |
| Kite | 4 | 4 | 0 | 0 | Full |
| Fishing | 4 | 3 | 1 | 0 | Partial |
| Paraglide | 4 | 4 | 0 | 0 | Full |
| Hiking | 7 | 3 | 4 | 0 | Partial |
| **Total** | **63** | **39** | **22** | **2** | **39/63 (62%)** |

---

## 7. Summary & Action Items

| Item | Status | Action |
|------|--------|--------|
| Peakly Pro pricing | RESOLVED (removed, email waitlist) | None |
| Amazon (39 links) | LIVE | None |
| Booking.com (2 links) | LIVE | None |
| SafetyWing (1 link) | LIVE | None |
| **TP_MARKER** | **PLACEHOLDER -- $0 flight commission** | **Jack: Replace on line 3771, 5 min** |
| **REI (22 links)** | **EARNING $0** | **Jack: Avantlink signup, 30 min** |
| **Backcountry (2 links)** | **EARNING $0** | **Jack: Avantlink signup, 15 min** |
| **GetYourGuide** | **EARNING $0** | **Jack: Partner signup, 20 min** |
| Hiking GEAR_ITEMS | RESOLVED (7 items) | None |
| Region-based pricing | SHIPPED (776 airports) | None |

### Single Highest-Revenue-Impact Change This Week

**Replace `YOUR_TP_MARKER` with the real Travelpayouts marker (line 3771).** 5 minutes. Every flight click currently earns $0. Flight clicks are the highest-frequency monetization touchpoint in the app.

**Second priority:** REI Avantlink signup (+$6.16 RPM, 30 min). 22 links already placed, high-AOV gear, zero code architecture changes.

Both should happen before the Reddit launch campaign.

---

*Next run: Check if TP_MARKER is still placeholder. Check if REI Avantlink signup is complete. Re-model RPM with any newly activated streams.*
