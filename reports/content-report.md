# Content & Data Report: 2026-03-24 (v6)

**Author:** Content & Data Lead

---

## Data Health Score: 6.2 / 10

No regression from v5. Core data issues persist: 72 venues still lack photos, 58 venue airports have no BASE_PRICES entry, 7 thin categories remain at 1 venue each, and the duplicate Pipeline venue was not removed last sprint. AFFILIATE_ID placeholders are fully resolved (0 remaining) — confirmed clean.

---

## Photo Coverage

| Metric | Count |
|--------|-------|
| Total venues | 171 |
| Venues with photo URLs | 99 |
| Venues WITHOUT photo URLs | 72 |
| **Photo coverage** | **57.9%** |

### Breakdown of missing photos
- **Surfing:** 33 venues missing photos
- **Tanning:** 39 venues missing photos
- All skiing (50), hiking (12), diving (1), climbing (1), kite (1), kayak (1), mtb (1), fishing (1), paraglide (1) venues have photos

---

## Total Venues by Category

| Category | Count | Status |
|----------|-------|--------|
| Tanning | 60 | OK |
| Surfing | 53 | OK |
| Skiing | 50 | OK |
| Hiking | 12 | OK |
| Diving | 1 | CRITICAL — needs 4+ more |
| Climbing | 1 | CRITICAL — needs 4+ more |
| Kite | 1 | CRITICAL — needs 4+ more |
| Kayak | 1 | CRITICAL — needs 4+ more |
| Fishing | 1 | CRITICAL — needs 4+ more |
| MTB | 1 | CRITICAL — needs 4+ more |
| Paraglide | 1 | CRITICAL — needs 4+ more |

**7 categories have only 1 venue.** These appear in category pills but deliver a single-result experience. Either expand to 5+ venues or hide behind "Coming Soon" label.

---

## Remaining Issues

### 1. Duplicate Pipeline venue (HIGH) — UNRESOLVED from v5
- `id:"pipeline"` (line 218) — "Pipeline, North Shore", 1,203 reviews
- `id:"banzai_pipeline"` (line 356) — "Banzai Pipeline", 6,420 reviews, richer data
- Same wave, same airport (HNL), near-identical coordinates
- **Action:** Remove `id:"pipeline"` entry (line 218). Keep `banzai_pipeline` only.

### 2. Missing BASE_PRICES entries (HIGH)
- **58 venue airports** have no BASE_PRICES entry — these fall back to $800 default
- Missing airports: AIT, AJA, AUA, AXA, BME, BOC, CAG, CUN, CUZ, CZM, DBV, ENI, EYW, FAO, FEN, GCM, HKT, IBZ, JFK, JMK, JRO, JTR, KBV, KEF, KOA, LAX, LOP, LST, LUA, MAH, MBA, MBJ, MIA, MLO, MPH, MRU, MYR, NAP, NCE, PKR, PLS, PPP, PRI, SCQ, SEZ, SJD, SPU, SRQ, STT, SXM, TAB, TPA, TYS, USM, UVF, VPS, ZNZ, ZTH
- Note: JFK, LAX, MIA are home airports that appear as destinations too — need self-referential rows
- **High-impact missing:** CUN, HKT, IBZ, KEF, KOA, MBJ, SXM, DBV, NCE, TPA, ZNZ, ZTH (popular leisure destinations giving wrong $800 estimates)
- **Action:** Add BASE_PRICES rows for top 20 high-traffic missing airports

### 3. Photo coverage gap (MEDIUM)
- 72 venues (42.1%) have no photo field at all
- Missing photos by category: surfing (33), tanning (39)
- Notable missing surfing: Taghazout, Anchor Point, Cloud 9, Padang Padang, Keramas, Chicama, Newquay, Montauk, Rincon Point
- Notable missing tanning: Riviera Maya, Maldives Gilis, Bali beaches, Key West, Clearwater, Myrtle Beach, Siesta Key, Seven Mile Beach, Negril
- **Action:** Add Unsplash URLs for all 72 missing venues. Surfing and tanning priority.

### 4. Thin categories (MEDIUM)
- 7 categories with 1 venue each are in the category pills
- Users tapping "Diving" or "Climbing" see exactly 1 result — poor experience
- **Action:** Expand each to 5+ venues, or gate with "Coming Soon" label until content is ready

### 5. Sentry DSN still empty (LOW)
- Line 6: `SENTRY_DSN = ""` — error monitoring not connected
- **Action:** Sign up for Sentry free tier, paste DSN

---

## Seasonal Picks — Late March 2026

Top 5 destinations with optimal conditions for the final week of March and early April:

| # | Venue | Category | Why Now |
|---|-------|----------|---------|
| 1 | **Niseko, Japan** | Skiing | Late-season closing window — March still delivering 40–60cm snowfall weeks. Spring shoulder season means shorter lift lines, softer corn runs. Season ends mid-April. Book now. |
| 2 | **Taghazout, Morocco** | Surfing | Peak season through end of March. Consistent NW Atlantic groundswell, offshore winds, 18°C water, uncrowded lineups. Dramatically cheaper than European surf destinations. |
| 3 | **Maldives** | Tanning | Dry season through April — UV 10–11, 30°C air, 28°C water, flat calm lagoons. Best visibility for snorkeling (30m+). Crowds thin post-February peak. |
| 4 | **Whistler Blackcomb** | Skiing | Spring skiing peak — full snowpack (10m+ base typical), long sunny days, soft morning snow, Whistler Village patios open. Best value of the ski season. |
| 5 | **Tavarua / Cloudbreak, Fiji** | Surfing | Southern Hemisphere cyclone season wrapping — March/April delivers residual SW swells to Cloudbreak and Restaurants. Water 28°C, offshore trades. Highly seasonal window. |

---

## Affiliate Placeholder Status

| Affiliate | Status |
|-----------|--------|
| REI links | CLEAN — 0 AFFILIATE_ID placeholders found |
| Backcountry links | CLEAN — 0 AFFILIATE_ID placeholders found |
| Booking.com | ACTIVE |
| SafetyWing | ACTIVE |
| Travelpayouts | ACTIVE (via VPS proxy) |

---

## Decision Made

**Priority for next sprint (v7):**
1. **Remove duplicate `id:"pipeline"` (line 218)** — 1-line fix, should have been done in v5. No excuse.
2. **Add Unsplash photos for 72 missing venues** — surfing (33) and tanning (39) are the full list. Photo coverage goes from 57.9% → 100%, every card looks polished.
3. **Add BASE_PRICES for top 20 missing airports** — CUN, HKT, IBZ, KEF, KOA, MBJ, SXM, DBV, NCE, TPA, ZNZ, ZTH, CUZ, JMK, UVF, TAB, MRU, SEZ, GCM, EYW. Fix the $800 default on popular Caribbean, Mediterranean, and Indian Ocean destinations.
4. **Defer thin category expansion** — needs venue research + scoring validation + photos all at once. Not a quick fix.
