# Content & Data Report: 2026-03-23 (v5)

**Author:** Content & Data Lead

---

## Data Health Score: 6.5 / 10

Photo coverage and BASE_PRICES gaps remain the two largest issues. Category balance is heavily skewed toward the big three (skiing, surfing, tanning) while 7 categories have only 1 venue each. The duplicate Pipeline venue is still present.

---

## Photo Coverage

| Metric | Count |
|--------|-------|
| Total venues | 171 |
| Venues with photo URLs | 98 |
| Venues WITHOUT photo URLs | 73 |
| **Photo coverage** | **57.3%** |

### Breakdown of missing photos
- **Surfing:** 32 venues missing photos (out of 53 total surfing venues)
- **Tanning:** 41 venues missing photos (out of 60 total tanning venues)
- All skiing (50), hiking (12), diving (1), climbing (1), kite (1), kayak (1), mtb (1), fishing (1), paraglide (1) venues have photos

The original 10 "hero" venues plus the first batch of skiing/surfing/tanning expansions have photos. The later expansion waves (v3/v4 surfing additions, most tanning beach expansions) shipped without photos.

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

**7 categories have fewer than 5 venues.** These categories show up in the UI but feel empty. Either expand them to 5+ venues or consider hiding them until content is ready.

---

## Remaining Issues

### 1. Duplicate Pipeline venue (HIGH)
- `id:"pipeline"` (line ~218) — "Pipeline, North Shore", Oahu, Hawaii
- `id:"banzai_pipeline"` (line ~356) — "Banzai Pipeline", Oahu, Hawaii
- Same wave, same airport (HNL), same photo URL, near-identical coordinates (21.6645 vs 21.6622)
- **Action:** Remove `pipeline` (the original hero entry) and keep `banzai_pipeline` which has richer data (6,420 reviews vs 1,203)

### 2. Missing BASE_PRICES entries (HIGH)
- **58 venue airports** have no entry in the `BASE_PRICES` object
- These venues fall back to the hardcoded $800 default, which produces inaccurate pricing for Caribbean ($300-500 range), domestic US ($150-400), and premium long-haul destinations ($1,500-2,200)
- Notable missing: CUN, HKT, DPS (already has entry), KEF, IBZ, MBJ, SXM, PLS, DBV, FAO, NCE, KOA, EYW, MYR, SRQ, TPA, VPS
- **Action:** Add BASE_PRICES for at least the 20 highest-traffic missing airports

### 3. Photo coverage gap (MEDIUM)
- 73 venues (42.7%) have no photo URL
- Cards render with gradient-only backgrounds — functional but visually weaker
- **Action:** Add Unsplash photo URLs for all 73 missing venues. Surfing (32 missing) and tanning/beach (41 missing) are priorities

### 4. Thin categories (MEDIUM)
- 7 categories with only 1 venue each appear in category pills but lead to single-result pages
- **Action:** Either add 4+ venues per thin category or gate them behind a "Coming Soon" label

### 5. Affiliate placeholder (LOW)
- Line ~3786: `AFFILIATE_ID` placeholders still present for REI and Backcountry links
- **Action:** Replace with real affiliate IDs once partnership is live

### 6. Sentry DSN still empty (LOW)
- Line 6: `SENTRY_DSN = ""` — error monitoring is not connected
- **Action:** Sign up for Sentry, add DSN

---

## Seasonal Picks — Late March 2026

Top 5 destinations with best conditions for the last week of March:

| # | Venue | Category | Why Now |
|---|-------|----------|---------|
| 1 | **Niseko, Japan** | Skiing | Late-season powder — March delivers 40-60cm fresh snow weeks. Spring temps, shorter lift lines. Season closes mid-April. |
| 2 | **Pipeline / North Shore** | Surfing | North Shore winter swell season wraps in late March. Last chance for overhead+ waves before summer flat spell. Water temp ~25C. |
| 3 | **Bora Bora** | Tanning | Shoulder season — fewer tourists than Feb peak, still 30C+ air, UV 10-11, calm lagoon. Rates drop before April rainy uptick. |
| 4 | **Taghazout, Morocco** | Surfing | March is prime season — consistent NW Atlantic swells, offshore winds, 18C water. Uncrowded compared to European summer. |
| 5 | **Whistler Blackcomb** | Skiing | Spring skiing at its best — long sunny days, soft snow, corn runs. Full snowpack (10m+ base typical). Après patios open. |

---

## Decision Made

**Priority for next sprint (v6):**
1. Remove the duplicate `pipeline` venue — keep `banzai_pipeline` only. This is a 1-line fix.
2. Add Unsplash photo URLs for the 32 missing surfing venues and 41 missing tanning venues (73 total). This is the single biggest visual quality improvement available.
3. Add BASE_PRICES for the top 20 missing airports (CUN, HKT, KEF, IBZ, MBJ, SXM, PLS, DBV, FAO, NCE, KOA, EYW, MYR, TPA, SRQ, VPS, STT, AUA, NAP, JMK) to fix flight price estimates.
4. Defer thin category expansion (diving, climbing, kite, etc.) to v7 — these need venue research, scoring logic validation, and photos all at once.
