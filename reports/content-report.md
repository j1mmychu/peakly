# Content & Data Report: 2026-03-24 (v6)

**Author:** Content & Data Lead
**Date:** Tuesday, March 24, 2026

---

## Data Health Score: 6.0 / 10

Photo coverage is the dominant drag on quality — 73 of 182 venues (40%) have no photo, with surfing and tanning in the worst shape. BASE_PRICES gaps affect accurate flight pricing for 55 airport codes. No duplicate IDs found this session. AFFILIATE_ID placeholders have been fully cleared (confirmed 0 remaining). Thin categories (7 with only 1 venue) continue to be a UX liability.

---

## Photo Coverage

| Metric | Count |
|--------|-------|
| Total venues | 182 |
| Venues with photo URLs | 109 |
| Venues WITHOUT photo URLs | 73 |
| **Photo coverage** | **59.9%** |

### Breakdown by category

| Category | Total | With Photo | Missing | Coverage |
|----------|-------|-----------|---------|----------|
| Tanning | 60 | 20 | **40** | 33% |
| Surfing | 53 | 20 | **33** | 37% |
| Skiing | 50 | 50 | 0 | 100% |
| Hiking | 12 | 12 | 0 | 100% |
| Diving | 1 | 1 | 0 | 100% |
| Climbing | 1 | 1 | 0 | 100% |
| Kite | 1 | 1 | 0 | 100% |
| Kayak | 1 | 1 | 0 | 100% |
| MTB | 1 | 1 | 0 | 100% |
| Fishing | 1 | 1 | 0 | 100% |
| Paraglide | 1 | 1 | 0 | 100% |

Skiing and hiking are at 100%. Tanning (33%) and surfing (37%) are the critical gaps — together they account for all 73 missing venues. These are two of the three biggest categories, so every missing photo is customer-facing.

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

**Total: 182 venues.** 7 categories still have only 1 venue each — unchanged from v5. These categories appear in the category pill filter but clicking them returns a single result, which is a dead-end UX.

---

## Remaining Issues

### 1. Photo coverage — surfing and tanning (HIGH)
- 33 surfing venues and 40 tanning venues have no photo
- Cards for these venues render with gradient-only backgrounds
- All photos should be Unsplash URLs with `?w=800&h=600&fit=crop` params
- **Action:** Add Unsplash photos for all 73 missing venues. Priority: tanning (largest absolute gap at 40), then surfing (33).

### 2. BASE_PRICES coverage (HIGH)
- 55 venue airports are missing from BASE_PRICES
- These fall back to $800 default, causing inaccurate "est." prices
- Critical airports missing: CUN, HKT, CZM, KEF, IBZ, MBJ, SXM, STT, AUA, UVF, SEZ, ZNZ, MRU, JRO, MBA, DBV, NCE, JTR, JMK, SPU, ZTH, FAO, KOA, EYW, TPA, SRQ, MYR, VPS, TAB, GCM, PLS, BOC, CUZ, ENI, MPH, KBV, USM, LOP, LST, PKR, LUA, AIT, MLO, PRI, AXA, FEN, PPP, SCQ, MAH, CAG, TYS, NAP, BIO (check), CAG
- **Action:** Add BASE_PRICES for at least the 30 highest-traffic missing airports in the next sprint

### 3. Thin categories (MEDIUM)
- 7 categories with 1 venue each appear in category pills but produce dead-end single-result pages
- **Action (recommended):** Gate thin categories behind a "Coming Soon" label or hide them from the pill row until they have 5+ venues. Option is lower effort than content expansion and prevents a poor first impression.

### 4. AFFILIATE_ID placeholders — RESOLVED ✓
- Previous report flagged ~line 3786 with `AFFILIATE_ID` placeholders
- **Confirmed: 0 occurrences of AFFILIATE_ID in app.jsx** — fully resolved

### 5. Sentry DSN empty (LOW)
- Line 6: `const SENTRY_DSN = ""; // TODO: Add Sentry DSN after signup`
- Error monitoring not connected — production errors are invisible
- **Action:** Sign up for Sentry free tier, add DSN to enable error tracking

---

## Seasonal Picks — Late March 2026

Late March is the transition from Northern Hemisphere winter to spring. Southern Hemisphere autumn beginning. Narrow windows for specific destinations.

| # | Venue | Category | Why Now |
|---|-------|----------|---------|
| 1 | **Whistler Blackcomb** | Skiing | Peak spring skiing — long sunny days, base depth typically 400cm+, corn snow afternoons. Best après terraces open. Season runs to mid-April. |
| 2 | **Taghazout, Morocco** | Surfing | Prime season: consistent NW Atlantic groundswells, offshore winds, 18°C water. Still uncrowded vs. European summer. Hash Point and Anchor Point firing. |
| 3 | **Nusa Dua, Bali** | Tanning | Dry season beginning. UV 11-12, 30-32°C air, low humidity. Shoulder crowds before Easter peak. |
| 4 | **Niseko, Japan** | Skiing | Final powder weeks of the season. Late March can still deliver heavy snowfall. Season closes early April — last call. |
| 5 | **Arugam Bay, Sri Lanka** | Surfing | April swell season ramps up. Late March sees first consistent swells of the year. Air 33°C, flat rainy season done. |

---

## Decision Made

**Priority for next sprint (v7):**

1. **Add Unsplash photos for 73 missing venues** — this is the #1 visual quality issue. Tanning (40 missing) first, then surfing (33 missing). Template: `https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop`.

2. **Add BASE_PRICES for top 30 missing airports** — CUN, HKT, CZM, KEF, IBZ, MBJ, SXM, STT, AUA, UVF, SEZ, ZNZ, MRU, JRO, DBV, NCE, JTR, JMK, SPU, ZTH, FAO, KOA, EYW, TPA, SRQ, MYR, VPS, TAB, GCM, PLS. These are high-traffic vacation airports — the $800 default is wildly wrong for most of them.

3. **Gate thin categories** — Add "Coming Soon" label or hide the 7 single-venue categories from the category pill row until they have 5+ venues. Dead-end pages hurt retention.

4. **Defer thin category content expansion** to v8 — needs venue research, coordinates, scoring validation, and photos together.

**Pipeline duplicate still present (HIGH).** `id:"pipeline"` at line 218 and `id:"banzai_pipeline"` at line 356 both exist — same wave, same airport (HNL). Flagged in v5, still unresolved. Remove `id:"pipeline"`, keep `banzai_pipeline` (6,420 reviews vs 1,203).
