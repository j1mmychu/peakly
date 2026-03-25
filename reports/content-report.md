# Peakly — Content & Data Report
**Date:** 2026-03-25
**Agent:** Content & Data
**Total Venues (after today's additions):** 187

---

## Data Health Score: 74/100

**Breakdown:**
- Category distribution: 48/60 — 6 of 10 sport categories are still single-venue stubs
- Gear coverage: 60/60 after today's fix (hiking gear added)
- Photo coverage: 60/100 — 73 venues missing photos
- Data integrity: 100/100 — zero missing coordinates, airport codes, or IDs
- Description quality: 100/100 — all venues have adequate tags/text
- Duplicate IDs: 1 confirmed (see below)
- Duplicate photos: 1 confirmed (see below)

---

## Category Breakdown

| Category   | Venues | Status     | Notes                                    |
|------------|--------|------------|------------------------------------------|
| Tanning    | 60     | ✅ Healthy  | Dominant. Consider capping at 60.        |
| Surfing    | 53     | ✅ Healthy  |                                          |
| Skiing     | 50     | ✅ Healthy  |                                          |
| Hiking     | 12     | ✅ OK       | Meets 10-venue threshold. Gear now fixed.|
| Diving     | 2      | ⚠️ STUB     | Was 1 — added Tulamben today             |
| Climbing   | 2      | ⚠️ STUB     | Was 1 — added Railay Beach today         |
| Kayak      | 2      | ⚠️ STUB     | Was 1 — added Na Pali Coast today        |
| MTB        | 2      | ⚠️ STUB     | Was 1 — added Whistler Bike Park today   |
| Paraglide  | 2      | ⚠️ STUB     | Was 1 — added Chamonix today             |
| Fishing    | 1      | 🔴 STUB     | Only Kenai River. No addition today.     |
| Kite       | 1      | 🔴 STUB     | Only Tarifa. Not in CATEGORIES array, deprioritized. |

**Stub categories needing 10+ venues each:** Diving, Climbing, Kayak, MTB, Paraglide, Fishing.

---

## Gear Items Audit

### Fixed Today
- ✅ **Hiking** — `GEAR_ITEMS.hiking` was undefined. Added 4 high-AOV items (remote version merged):
  - Salomon X Ultra 4 GTX Boots (REI, $200, 5%)
  - Osprey Atmos AG 65L Backpack (REI, $300, 5%)
  - Arc'teryx Beta AR Rain Jacket (REI, $350, 5%)
  - Garmin inReach Mini 2 GPS Communicator (REI, $350, 5%)
  - **Estimated AOV per conversion event: ~$1,200**

### Remaining Issues
- ⚠️ **REI affiliate links** — all REI URLs are generic search pages (`/search?q=...`). No affiliate tag is appended. These links track zero commission revenue. Needs REI affiliate approval (blocked by LLC).
- ⚠️ **Amazon tag `peakly-20`** — correctly applied throughout. Needs Amazon Associates approval (also blocked by LLC).

---

## Data Integrity Issues

### Duplicate Photo (confirmed)
**`camino` and `appalachian`** both reference the same Unsplash photo ID:
```
https://images.unsplash.com/photo-1551176808-bb328dac763a
```
These are distinct trails on different continents. Recommend replacing the Camino image:
```
https://images.unsplash.com/photo-1598952437672-de39e4ff4bc7?w=800&h=600&fit=crop
```

### Duplicate Venue (carried forward from previous audit)
- `id:"pipeline"` and `id:"banzai_pipeline"` — same wave, same airport HNL, near-identical coordinates.
- **Fix:** Remove `id:"pipeline"` (1,203 reviews), keep `banzai_pipeline` (6,420 reviews). 1-line delete.

---

## Seasonal Relevance (2026-03-25 — Late March)

### Currently IN SEASON — should be surfaced
- **Surfing:** Pacific Mexico (PVR, ZIH, MZT), Central America (SJO, LIR), Morocco (AGA), Canaries (ACE, FUE)
- **Tanning:** Caribbean (SJU, BGI, GCM), Canaries, SE Asia (HKT, KBV, DPS) — peak season
- **Hiking:** Annapurna Circuit, Everest Base Camp Trek — **pre-monsoon window is open NOW (March–May is peak)**. Actively promote these.
- **Skiing:** Late season in N. Hemisphere. Alps and Rockies have 3–6 weeks left. Final-push moment.

### OUT OF SEASON / Deprioritize
- **Southern Hemisphere skiing** (Queenstown, Portillo) — not open until June/July
- **Torres del Paine** — entering Southern Hemisphere autumn; conditions deteriorating
- **Laugavegur (Iceland)** — trail closed under snow until late June. Scoring system uses Reykjavik weather proxy and may score this incorrectly. Users booking now would arrive to a closed trail. Consider adding a `peakMonths` guard.
- **Overland Track** (Tasmania) — acceptable but not peak

---

## Content Quality Flags

### Tag accuracy
- `railay_climb` tagged "Beginner Friendly" — the intro sport climbing is accurate, but Deep Water Solo routes are intermediate/expert. Could improve to "Multi-Level" in a future pass.
- `whistler_mtb` tagged "Pro Level Available" — accurate. A-Line is intermediate; upper trails are expert.

### Airport code validity (new venues)
| Code | Location | Valid | In AP_CONTINENT |
|------|----------|-------|-----------------|
| DPS  | Denpasar, Bali | ✅ | ✅ asia |
| KBV  | Krabi, Thailand | ✅ | ✅ asia |
| LIH  | Lihue, Kauai | ✅ | ✅ na |
| YVR  | Vancouver, Canada | ✅ | ✅ na |
| GVA  | Geneva, Switzerland | ✅ | ✅ europe |

---

## 5 New Venues Added Today

Appended to VENUES array before closing `];`. All IDs are unique.

1. **`tulamben`** — Tulamben Liberty Wreck, Bali, Indonesia (`diving`) — WWII shipwreck, shore-accessible, world-famous
2. **`railay_climb`** — Railay Beach Limestone, Krabi, Thailand (`climbing`) — limestone sport climbing + Deep Water Solo
3. **`napali_kayak`** — Na Pali Coast Sea Kayak, Kauai, Hawaii (`kayak`) — sea caves, 17-mile coastline, summer swells
4. **`whistler_mtb`** — Whistler Mountain Bike Park, BC, Canada (`mtb`) — world's best lift-accessed bike park, A-Line
5. **`chamonix_para`** — Chamonix Valley Paragliding, France (`paraglide`) — tandem + solo, Mont Blanc backdrop

---

## One Observation for the PM

**The stub sport categories (diving, climbing, kayak, mtb, paraglide) do not appear in the CATEGORIES array** — they cannot be filtered in the Explore tab. Users who are divers or MTB riders see "All" and get a feed dominated by tanning and surfing venues. This is a silent retention problem.

Two paths:
1. **Expand CATEGORIES** from 7 to 10–12 entries now, so the filter pill infrastructure is ready as venue counts grow.
2. **Keep 7 categories** but surface stub venues through VibeSearch and the AI trip builder — position them as "hidden gems."

This is a product call, not a data call. Either path works — needs a decision before stub venues reach 5+ each.

---

## Next Session Priorities (Ordered)

1. Remove duplicate venue `id:"pipeline"` (1-line delete)
2. Fix duplicate photo on `camino` venue (1-line fix)
3. Add 4+ more diving venues (Palau, Maldives Ari Atoll, Silfra Iceland, Red Sea Dahab)
4. Add 4+ more climbing venues (Red Rock Canyon NV, El Chorro Spain, Kalymnos Greece, Fontainebleau France)
5. Add 4+ more fishing venues (Missouri River MT, Florida Keys, NZ South Island, Patagonia)
6. PM decision: expand CATEGORIES array or keep at 7
7. Add missing photos for 73 venues (tanning/beach category is worst offender)
