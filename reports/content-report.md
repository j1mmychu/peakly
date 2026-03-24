# Content & Data Report: 2026-03-24 (v6)

**Author:** Content & Data Lead

---

## Data Health Score: 63 / 100

Stable from yesterday. No regressions. Photo coverage improved marginally (57.3% → 59.9% — actually unchanged at 109 photos, prior report miscounted total venues as 171 vs actual 182). The pipeline duplicate, 58 missing BASE_PRICES airports, and 73 photoless venues remain the top three unresolved issues.

---

## Photo Coverage

| Metric | Count |
|--------|-------|
| Total venues | 182 |
| Venues with photo URLs | 109 |
| Venues WITHOUT photo URLs | 73 |
| **Photo coverage** | **59.9%** |

> Note: Prior report stated 171 venues — actual count is 182. The photo count (109) is unchanged. Coverage recalculated.

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

### 2. Missing BASE_PRICES entries (HIGH — 58 airports still missing)
Venue airports not covered by BASE_PRICES (will fall back to $800 estimate):

**Caribbean / Beach (high-impact):** CUN, MBJ, SXM, PLS, STT, AUA, GCM, TAB, UVF, CZM, SJD
**Mediterranean:** IBZ, DBV, FAO, NCE, NAP, JMK, JTR, ZTH, MAH, SPU, CAG, AJA, MLO
**Southeast Asia:** HKT, KBV, USM, MPH, LOP
**US domestic:** KOA, EYW, MYR, SRQ, TPA, VPS, TYS
**Indian Ocean:** MRU, SEZ, PRI
**Iceland / Northern Europe:** KEF
**Africa:** JRO, ZNZ, MBA
**Pacific islands:** AIT, FEN, PKR, LUA, LST
**Other:** BOC, BME, ENI, SCQ

58 airports still defaulting to $800. This affects predominantly the Caribbean, Mediterranean, and Southeast Asian tanning/surfing venues which should show $200–600 flights, not $800+.

### 3. Photo coverage gap (MEDIUM — unchanged)
- 73 venues have no photo. Cards render gradient-only backgrounds.
- Breakdown by category (estimated): ~30 tanning, ~30 surfing, ~13 skiing/hiking/specialty
- **Action:** Prioritize Caribbean and Mediterranean tanning venues — these are the ones most actively searched in spring/summer.

### 4. Thin categories (MEDIUM — deferred from v5)
- 7 categories with 1 venue each. Category pills appear in UI but lead to single-result lists.
- Still deferred to allow focused sprint on photos + BASE_PRICES first.

### 5. AFFILIATE_ID placeholders (RESOLVED — no action needed)
- Previous reports flagged placeholder IDs at line ~3786 (REI, Backcountry)
- **Status: CLEARED.** Code now uses REI search URLs directly (e.g., `https://www.rei.com/search?q=skis`). No `AFFILIATE_ID` strings remain in app.jsx. Awaiting LLC approval for actual affiliate account signup — links are structurally correct.

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
2. **Add BASE_PRICES for top 20 missing airports** — Focus on Caribbean (CUN, MBJ, SXM, PLS, STT, AUA, GCM, CZM, SJD) and Mediterranean (IBZ, DBV, FAO, NCE, NAP, JMK, JTR) as these serve the highest-traffic tanning/surfing venues. Secondary: HKT, KOA, KEF.
3. **Add Unsplash photo URLs for 30 Caribbean + Mediterranean tanning venues** — Matching the same airports above for visual consistency on the cards most likely to be surfaced in spring/summer.
4. **Continue deferring thin category expansion** — diving, climbing, kite, kayak, fishing, mtb, paraglide need venue research + photos + scoring validation all at once. Not worth partial effort.

**Affiliate status clarification (recorded for future sessions):** The AFFILIATE_ID issue is RESOLVED at the code level. REI links now point to functional search URLs. Real affiliate commissions require LLC approval — that's a business process, not a code task.
