# Peakly Content & Data Report — 2026-11-13

## Data Health Score: 88/100

**Deductions (Day 14 — unchanged):**
- −7: **225 venues have ≤2 tags** (Day 14 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via Node.js eval (dual-format: unquoted + quoted keys).

> **⚠️ LATESEASON COUNT (Day 7 of correction):** DevOps gets 10 via single-pattern regex (`lateSeason:\s*true` only). Actual count is **15** — 10 unquoted-key venues + 5 JSON-quoted-key venues (`"lateSeason": true`). Both formats are valid in the mixed catalog. Authoritative count: **15**.

> **⚠️ CACHE STAMP:** `PEAKLY_BUILD = 20261031a` / `sw.js CACHE_NAME = peakly-20261031a` — **13 days stale** (today is 2026-11-13). DevOps concern, not content.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** ✅ |
| Skiing | **134** (111 N-hemi + 23 S-hemi) |
| Beach | **270** (201 N-hemi + 69 S-hemi) |
| Duplicate IDs | **0** ✅ |
| Duplicate photos | **0** ✅ (404 unique photo URLs) |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags array | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ (165 unique venue APs, all covered — Open #22 CLOSED) |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key) |
| GEAR_ITEMS occurrences | **0** ✅ (cut for v1 — deliberate) |

**No integrity issues found. Catalog is clean. No change from yesterday.**

> **DevOps bracket-walk count discrepancy (Day 2):** DevOps reports 406 via bracket-walking; eval of the full VENUES array returns 404. Bracket-walking can double-count closing brackets in nested objects. Authoritative count is **404 via eval**. `.venue-baseline` = 404, also confirmed correct.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: CUT for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.**

This is not a gap — deliberate revenue decision. Amazon Associates deferred post-launch. No action required. The task prompt's "hiking has ZERO gear items" is obsolete (hiking was never a Peakly category).

**Active revenue streams:** Booking.com (aid=2311236), SafetyWing (referenceID=peakly), Travelpayouts (TP_MARKER=710303). Live RPM: ~$7.58/1K MAU.

---

## 3. SEASONAL RELEVANCE — November 13, 2026

**Current season: Northern Hemisphere ski season OPEN (Day 4). Thanksgiving window opens in 8 days. Southern Hemisphere summer in full swing.**

| Segment | Count | Status |
|---------|-------|--------|
| N-hemi skiing (lat ≥ 0) | 111 | ✅ IN SEASON — full Nov–Apr window |
| S-hemi skiing (lat < 0) | 23 | ⚠️ OUT OF SEASON — returns May 2027 |
| N-hemi beach (lat ≥ 0) | 201 | Mixed — tropical (Caribbean, SE Asia, Maldives) year-round; temperate off-peak |
| S-hemi beach (lat < 0) | 69 | ✅ IN SEASON — Southern summer (Nov–Feb peak) |

**lateSeason:true venues (15)** — these high-altitude N-hemi resorts bypass off-season cap when `snow_depth ≥ 0.5m`. All 15 are in peak relevance window now:
> whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

**Thanksgiving window (Nov 21) opens in 8 days.** VPS redeploy (which re-enables two-weekend scoring + iOS native data) is P0 before that date. Without it, ski venues score `confidence:low` for the full Fri–Mon window and disappear from the front page exactly when Northern ski traffic peaks.

---

## 4. CONTENT QUALITY

| Check | Result |
|-------|--------|
| Venues with ≤2 tags | **225** ⚠️ Day 14 of finding |
| Venues with ≥3 tags | **179** ✅ |
| Venue descriptions | Not in schema — N/A |
| Avg tags per venue | **2.9** |

**Tag quality:** Unchanged. 225 venues with 1–2 tags remain the single largest content gap. Frozen per PM v193+ directive; flag for first post-launch content sprint.

**Highest-value thin-tag ski venues now fully in peak season:**
- `abasin` — add "Opening Day Leader", "High Alpine", "Denver Day-Trip"
- `hintertux-glacier` — add "Year-Round Glacier", "Advanced Terrain", "Austria"
- `snowbird` — add "Longest Season Utah", "Expert Runs", "Alta Adjacent"
- `verbier` — add "Freeride World Tour", "4 Vallées", "Expert Terrain"
- `val-thorens` — add "Highest Resort Europe", "Three Valleys", "Long Season"

---

## 5. VENUE ADDITIONS — FROZEN

**FROZEN per PM v193+ directive. Queue remains at 404 (134 skiing / 270 beach).**

Candidates documented for post-Reddit-gate sprint, priority-ordered by seasonal relevance (November = ski season opening + S-Hemi summer):

**Skiing — Early Season Openers:**
```js
{
  id: "breckenridge-co",
  title: "Breckenridge",
  location: "Colorado, USA",
  category: "skiing",
  lat: 39.4817,
  lon: -106.0384,
  ap: "DEN",
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
  tags: ["Epic Pass", "Five Peaks", "High Altitude", "Village Nightlife"],
  icon: "🏔️",
  rating: 4.7,
  reviews: 1840
},
{
  id: "keystone-co",
  title: "Keystone",
  location: "Colorado, USA",
  category: "skiing",
  lat: 39.6064,
  lon: -105.9430,
  ap: "DEN",
  photo: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?w=800",
  tags: ["Epic Pass", "Night Skiing", "Family Friendly", "DEN Day-Trip"],
  icon: "🏔️",
  rating: 4.5,
  reviews: 1230
},
{
  id: "courchevel-1850",
  title: "Courchevel 1850",
  location: "Savoie, France",
  category: "skiing",
  lat: 45.4152,
  lon: 6.6341,
  ap: "GVA",
  photo: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800",
  tags: ["Three Valleys", "Luxury", "World-Class Terrain", "Ski In/Out"],
  lateSeason: true,
  icon: "🏔️",
  rating: 4.9,
  reviews: 2100
}
```

**Beach — S-Hemi Summer (in season now):**
```js
{
  id: "noosa-heads-au",
  title: "Noosa Heads",
  location: "Queensland, Australia",
  category: "beach",
  lat: -26.3927,
  lon: 153.0906,
  ap: "BNE",
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  tags: ["National Park", "Surf", "Boutique Village", "Nov-Feb Peak"],
  icon: "🏝️",
  rating: 4.6,
  reviews: 890
},
{
  id: "abel-tasman-nz",
  title: "Abel Tasman Coast",
  location: "South Island, New Zealand",
  category: "beach",
  lat: -40.8575,
  lon: 172.9856,
  ap: "NSN",
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  tags: ["Golden Sand", "Sea Kayaking", "National Park", "S-Hemi Summer"],
  icon: "🏝️",
  rating: 4.7,
  reviews: 640
}
```
*(All 5 candidates are queued — not added to VENUES. `NSN` needs BASE_PRICES entry before addition. `BNE` already covered.)*

---

## ONE OBSERVATION FOR THE PM

**App Review hard stop is TOMORROW (Nov 14).** Today is the last day to submit and hit the Thanksgiving ski window (Nov 21 — 8 days). The catalog is spotless: 404 venues, 0 integrity issues, all 15 lateSeason glaciers in peak window, scoring engine solid. Content is not the gate and has not been the gate for weeks. The App Store reply (`docs/APP_REVIEW_NOTES.md`) + submission ID (`468d466e-ab22-4db5-bc51-d897a9bcfb8e`) are sitting ready. This is a Jack action. VPS redeploy (10 min SSH) should land same day or next so two-weekend scoring is live before Whistler opens Nov 21.

---

*Report generated: 2026-11-13 16:08 UTC | 404 venues verified via Node.js eval | lateSeason via dual-pattern count | No integrity changes from yesterday*
