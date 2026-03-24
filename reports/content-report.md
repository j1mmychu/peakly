# Content & Data Report: 2026-03-24 (v6)

**Author:** Content & Data Lead

---

## Data Health Score: 63 / 100

Stable from yesterday. No regressions. AFFILIATE_ID placeholders confirmed fully cleared (zero occurrences in app.jsx). Photo coverage holds at 59.9% (182 venues, 109 with photos — prior 57.3% was based on miscounted 171 venues). The pipeline duplicate, 55 missing BASE_PRICES airports, and 73 photo-less venues remain the top three unresolved issues.

---

## Photo Coverage

| Metric | Count |
|--------|-------|
| Total venues | 182 |
| Venues with photo URLs | 109 |
| Venues WITHOUT photo URLs | 73 |
| **Photo coverage** | **59.9%** |

> Note: Prior report stated 171 venues — actual count is 182. The photo count (109) is unchanged. Coverage recalculated.

### Photo breakdown by category

| Category | Total | With Photo | Without Photo | Coverage |
|----------|-------|------------|---------------|----------|
| Tanning | 60 | 20 | **40** | 33% |
| Surfing | 53 | 20 | **33** | 38% |
| Skiing | 50 | 50 | 0 | 100% ✓ |
| Hiking | 12 | 12 | 0 | 100% ✓ |
| Kite/MTB/Fishing/Climbing/Diving/Paraglide/Kayak | 7 | 7 | 0 | 100% ✓ |

Skiing and hiking are fully covered. Tanning (33%) and surfing (38%) are the critical gaps — these are the two most-browsed categories.

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

**Total: 182 venues across 11 categories. 7 categories have only 1 venue each.**

---

## Remaining Issues

### 1. Duplicate Pipeline venue (HIGH — still not fixed)
- `id:"pipeline"` (line 218) — "Pipeline, North Shore", HNL, 1,203 reviews, coordinates 21.6645 / -158.0453
- `id:"banzai_pipeline"` (line 356) — "Banzai Pipeline", HNL, 6,420 reviews, coordinates 21.6622 / -158.0543
- Same wave, same airport, same Unsplash photo URL
- **Action:** Remove the `pipeline` entry (line 218). Keep `banzai_pipeline` — richer data, higher review count.
- This was flagged yesterday and still not done. It's a 10-line delete.

### 2. Missing BASE_PRICES entries (HIGH — 55 airports confirmed missing)
Venue airports not covered by BASE_PRICES (confirmed via code audit of all 126 unique venue `ap:` codes):

**Caribbean / Beach (high-impact):** CUN, MBJ, SXM, PLS, STT, AUA, GCM, TAB, UVF, CZM, SJD
**Mediterranean:** IBZ, DBV, FAO, NCE, NAP, JMK, JTR, ZTH, MAH, SPU, CAG, AJA, MLO, SCQ
**Southeast Asia:** HKT, KBV, USM, MPH, LOP
**US domestic:** KOA, EYW, MYR, SRQ, TPA, VPS, TYS
**Indian Ocean:** MRU, SEZ, PRI
**Iceland / Northern Europe:** KEF
**Africa:** JRO, ZNZ, MBA
**Pacific islands:** AIT, FEN, PKR, LUA, LST, ENI
**Other:** BOC, BME, AXA

55 airports still defaulting to $800. This affects predominantly Caribbean, Mediterranean, and SE Asian venues that should show $200–600 flights, not $800+.

### 3. Photo coverage gap (HIGH — upgraded priority)
- 73 venues have no photo. Cards render gradient-only backgrounds.
- Exact breakdown: 40 tanning, 33 surfing — all other categories are at 100%.
- **Action:** Add Unsplash photo URLs for Caribbean and Mediterranean tanning venues first (most actively searched in spring/summer), then surfing.

### 4. Thin categories (MEDIUM — deferred from v5)
- 7 categories with 1 venue each. Category pills appear in UI but lead to single-result lists.
- Still deferred to allow focused sprint on photos + BASE_PRICES first.

### 5. AFFILIATE_ID placeholders — RESOLVED ✓
- **Status: CLEARED.** Zero occurrences of "AFFILIATE_ID" remain in app.jsx (confirmed by grep audit).
- Code uses REI search URLs directly. Real commissions await LLC approval — this is a business process, not a code task.

### 6. Sentry DSN empty (LOW — unchanged)
- Line 6: `SENTRY_DSN = ""` — error monitoring not connected.
- Logger infrastructure is in place; just needs a DSN value.

---

## Seasonal Picks — Late March 2026

Northern hemisphere end-of-winter / spring transition. Southern hemisphere late summer.

| # | Venue | Category | Why Now |
|---|-------|----------|---------|
| 1 | **Niseko, Japan** | Skiing | Final weeks of the best powder season in years. Spring corn snow arriving. Season closes mid-April — last chance. Flights from US West Coast ~$740-960. |
| 2 | **Whistler Blackcomb** | Skiing | Deep base (10m+ typical), long spring days, patio après-ski. Top 3 weeks for corn skiing. YVR flights competitive from all US hubs. |
| 3 | **Taghazout, Morocco** | Surfing | Peak season. Consistent NW Atlantic groundswells, light offshore winds, 18°C water. Uncrowded and affordable. AGA flights from EU hubs under €200 round-trip. |
| 4 | **Bora Bora, French Polynesia** | Tanning | Shoulder season begins — crowds down, prices softening, still 30°C+ and UV 10–11. Book April before wet season uptick. PPT from LAX ~$1,200. |
| 5 | **Plettenberg Bay, South Africa** | Surfing | Southern hemisphere late-summer surf season peaking. Indian Ocean swells, 20°C water, low crowds vs. Cape Town. PLZ from JFK ~$1,220. |

---

## Decision Made

**Priority order for next sprint (v7):**

1. **Delete duplicate `pipeline` venue (line 218)** — 10-line fix, eliminates a data integrity bug, has been pending for 2 reports.
2. **Add BASE_PRICES for top 20 missing airports** — Caribbean (CUN, MBJ, SXM, PLS, STT, AUA, GCM, CZM, SJD) and Mediterranean (IBZ, DBV, FAO, NCE, NAP, JMK, JTR) first. Secondary: HKT, KOA, KEF. Full confirmed-missing list: 55 airports.
3. **Add Unsplash photo URLs for 40 missing tanning venues** — Caribbean + Mediterranean priority. Exact count confirmed: 40 tanning, 33 surfing need photos.
4. **Add Unsplash photo URLs for 33 missing surfing venues** — follow tanning batch.
5. **Continue deferring thin category expansion** — diving, climbing, kite, kayak, fishing, mtb, paraglide need venue research + photos + scoring validation all at once. Not worth partial effort.

**Affiliate status (recorded for future sessions):** AFFILIATE_ID issue is RESOLVED at the code level. Real commissions require LLC approval — do not re-open as a code task.
