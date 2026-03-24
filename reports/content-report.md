# Content & Data Report: 2026-03-24 (v6)

**Author:** Content & Data Lead
**Date:** Tuesday, March 24, 2026

---

## Data Health Score: 68 / 100

Affiliate placeholder IDs are fully cleared — no `AFFILIATE_ID` strings remain in the codebase. Venue count grew from 171 to 182 (+11 new venues). Photo coverage improved slightly. Core blockers remain: 73 venues still missing photos, 55 airports missing from BASE_PRICES, duplicate Pipeline entry still present, and 7 thin categories with only 1 venue each.

---

## Photo Coverage

| Metric | Count |
|--------|-------|
| Total venues | 182 |
| Venues WITH photo URLs | 109 |
| Venues WITHOUT photo URLs | 73 |
| **Photo coverage** | **59.9%** |

### Category breakdown (photos present vs total)
| Category | With Photo | Total | Missing |
|----------|-----------|-------|---------|
| Skiing | 50 | 50 | 0 ✅ |
| Hiking | 12 | 12 | 0 ✅ |
| Diving | 1 | 1 | 0 ✅ |
| Climbing | 1 | 1 | 0 ✅ |
| Kite | 1 | 1 | 0 ✅ |
| Kayak | 1 | 1 | 0 ✅ |
| Fishing | 1 | 1 | 0 ✅ |
| MTB | 1 | 1 | 0 ✅ |
| Paraglide | 1 | 1 | 0 ✅ |
| Surfing | 37 | 53 | **16** |
| Tanning | 49 | 60 | **11** |

All skiing, hiking, and thin-category venues are fully covered. The remaining 27 missing photos are concentrated in surfing (16) and tanning (11).

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

**Total: 182 venues across 11 categories.** Seven categories remain critically thin (single venue each).

---

## Remaining Issues

### 1. Duplicate Pipeline venue (HIGH — same as v5)
- `id:"pipeline"` (line 218) — "Pipeline, North Shore", Oahu, Hawaii
- `id:"banzai_pipeline"` (line 356) — "Banzai Pipeline", Oahu, Hawaii
- Same wave, same airport (HNL), near-identical coordinates
- **Action:** Remove `id:"pipeline"` (the older, lower-review entry). Keep `banzai_pipeline`.

### 2. Missing BASE_PRICES entries (HIGH)
- **55 venue airports** have no BASE_PRICES entry and fall back to $800 default
- Most impactful missing airports: CUN, HKT, KEF, IBZ, MBJ, SXM, PLS, DBV, FAO, NCE, KOA, EYW, MYR, TPA, SRQ, VPS, STT, AUA, NAP, JMK, ZTH, ZNZ, JRO, SPU, CAG, CUZ, GCM, CZM, TAB, SEZ, MRU
- **Action:** Add BASE_PRICES for the 20 highest-traffic missing airports

### 3. Photo coverage gap (MEDIUM)
- 73 venues (40.1%) have no photo URL — down from 73/171 last report (same absolute count, slightly better %)
- 27 missing across surfing (16) and tanning (11); these are the visual priority
- **Action:** Add Unsplash photo URLs for all 27 missing surfing + tanning venues

### 4. Thin categories (MEDIUM — unchanged)
- 7 categories with only 1 venue show up in category pills but lead to single-result screens
- **Action:** Add 4+ venues per thin category or add "Coming Soon" gating in UI

### 5. Affiliate placeholders — CLEARED ✅
- No `AFFILIATE_ID` strings found anywhere in `app.jsx`
- Previously flagged at line ~3786; now resolved
- Links for REI and Backcountry are either removed or updated

### 6. Sentry DSN still empty (LOW — unchanged)
- Line 6: `SENTRY_DSN = ""` — error monitoring not connected
- Not blocked by LLC; can sign up for free tier anytime
- **Action:** Sign up for free Sentry tier, paste DSN into line 6

---

## Seasonal Picks — Late March 2026

Peak season analysis for the last week of March:

| # | Venue | Category | Why Now |
|---|-------|----------|---------|
| 1 | **Niseko, Japan** | Skiing | Late-season powder — March still delivers 30–50cm fresh snow weeks on Hokkaido. Spring light, shorter queues as tourists taper. Season closes mid-April. Book now. |
| 2 | **Banzai Pipeline, North Shore** | Surfing | Final weeks of North Shore's winter swell season. Last chance for overhead+ waves before the summer flat spell hits. Water temp ~25°C, photo-perfect conditions. |
| 3 | **Taghazout, Morocco** | Surfing | Peak Atlantic swell season. Consistent NW swells, offshore winds, 18°C water. Far less crowded than European summer. Best budget adventure in the world right now. |
| 4 | **Bora Bora, French Polynesia** | Tanning | Shoulder season sweet spot — fewer tourists than February peak, still 30°C+ air temps, UV index 10–11, glassy lagoon. Rates drop before April rainy season uptick. |
| 5 | **Whistler Blackcomb** | Skiing | Spring skiing peak — long sunny days, 10m+ snowpack base, soft corn snow runs in the afternoon, all après patios open. Objectively the best skiing on the planet right now. |

---

## Decision Made

**Priority for next sprint (v7):**
1. Remove duplicate `pipeline` venue (keep `banzai_pipeline`). 1-line fix.
2. Add Unsplash photos for the 16 missing surfing venues and 11 missing tanning venues (27 total). Biggest remaining visual quality gap.
3. Add BASE_PRICES for top 20 missing airports to fix estimated flight pricing.
4. Sign up for Sentry free tier and add DSN to line 6 — unblocked, simple, valuable.
5. Continue deferring thin category expansion (diving, climbing, kite, etc.) until a batch of 5+ can be added together with photos and scoring validation.
