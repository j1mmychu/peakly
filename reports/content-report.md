# Peakly Content & Data Report — 2026-11-11

## Data Health Score: 88/100

**Deductions (Day 12 — unchanged):**
- −7: **225 venues have ≤2 tags** (Day 12 of finding) — tag enrichment remains the highest-leverage content improvement within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193+ directive, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified continuously): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All numbers below are from live app.jsx via Node.js eval (dual-format: unquoted + quoted keys).

> **⚠️ LATESEASON COUNT (Day 5 of correction):** DevOps gets 10 via single-pattern regex (`lateSeason:\s*true` only). Actual count is **15** — 10 unquoted-key venues + 5 JSON-quoted-key venues (`"lateSeason": true`). Both formats are valid in the mixed catalog. Authoritative count: **15**.

> **⚠️ CACHE STAMP:** `PEAKLY_BUILD = 20261031a` / `sw.js CACHE_NAME = peakly-20261031a` — **11 days stale** (today is 2026-11-11). This is a DevOps/deploy concern, not a content issue.

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

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS: CUT for v1 (Jack's decision, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.**

This is not a gap — deliberate revenue decision. Amazon Associates deferred post-launch. No action required. The task prompt's "hiking has ZERO gear items" is obsolete (hiking was never a Peakly category).

**Active revenue streams:** Booking.com (aid=2311236), SafetyWing (referenceID=peakly), Travelpayouts (TP_MARKER=710303). Live RPM: ~$7.58/1K MAU.

---

## 3. SEASONAL RELEVANCE — November 11, 2026

**Current season: Northern Hemisphere ski season OPEN (Day 2). Southern Hemisphere summer in full swing.**

| Segment | Count | Status |
|---------|-------|--------|
| N-hemi skiing (lat ≥ 0) | 111 | ✅ IN SEASON — full Nov–Apr window |
| S-hemi skiing (lat < 0) | 23 | ⚠️ OUT OF SEASON — returns May 2027 |
| N-hemi beach (lat ≥ 0) | 201 | Mixed — tropical (Caribbean, SE Asia, Maldives) year-round; temperate off-peak |
| S-hemi beach (lat < 0) | 69 | ✅ IN SEASON — Southern summer (Nov–Feb peak) |

**lateSeason:true venues (15)** — these high-altitude N-hemi resorts bypass off-season cap when `snow_depth ≥ 0.5m`. All 15 are in peak relevance window now:
> whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

**Thanksgiving window (Nov 21) opens in 10 days.** See PM observation below.

---

## 4. CONTENT QUALITY

| Check | Result |
|-------|--------|
| Venues with ≤2 tags | **225** ⚠️ Day 12 of finding |
| Venues with ≥3 tags | **179** ✅ |
| Venue descriptions | Not in schema — N/A |
| Difficulty levels | Tags-based for skiing; not applicable for beach |

**Tag quality:** Unchanged. 225 venues with 1–2 tags remain the single largest content gap. Frozen per PM v193+ directive; flag for first post-launch content sprint.

**Highest-value thin-tag ski venues now entering peak season:**
- `abasin` — add "Opening Day Leader", "High Alpine", "Denver Day-Trip"
- `hintertux-glacier` — add "Year-Round Glacier", "Advanced Terrain", "Austria"
- `snowbird` — add "Longest Season Utah", "Expert Runs", "Alta Adjacent"
- `verbier` — add "Freeride World Tour", "4 Vallées", "Expert Terrain"
- `val-thorens` — add "Highest Resort Europe", "Three Valleys", "Long Season"

---

## 5. VENUE ADDITIONS — FROZEN

**FROZEN per PM v193+ directive. Queue remains at 404 (134 skiing / 270 beach).**

Candidates documented for post-Reddit-gate sprint, priority-ordered by seasonal relevance (November = ski season opening):

**Skiing — Early Season Openers (highest priority now, Thanksgiving window):**
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
  score: 0
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
  score: 0
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
  score: 0
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
  score: 0
},
{
  id: "abel-tasman-nz",
  title: "Abel Tasman",
  location: "South Island, New Zealand",
  category: "beach",
  lat: -40.8575,
  lon: 172.9856,
  ap: "NSN",
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  tags: ["Golden Sand", "Kayaking", "National Park", "S-Hemi Summer"],
  score: 0
}
```
*(All 5 candidates are queued — not yet added to VENUES. NSN needs BASE_PRICES entry before addition.)*

---

## ONE OBSERVATION FOR THE PM

**Thanksgiving window opens in 10 days (Nov 21) — this remains the single highest-leverage launch timing available.** The lateSeason glaciers (Hintertux, Tignes, Saas-Fee) are already in-season and would likely show real scores right now. The scoring engine built for exactly this. If the Reddit post hasn't happened yet, the Thanksgiving window is the last natural deadline before Christmas (Dec 20) — both are peak weekend-ski search windows when spontaneous travelers are actively looking for "where to ski this weekend." The catalog is ready; App Review is the only gate. Miss Thanksgiving and the next comparable event is Christmas week.

**New today:** App Review hard stop is 5 days out per PM v207. If that deadline lands (Nov 16), Thanksgiving submission window is achievable if submission goes in by Nov 14–15.

---

*Report generated: 2026-11-11 15:14 UTC | 404 venues verified via Node.js eval (unquoted + quoted keys) | lateSeason via dual-pattern count | BASE_PRICES via bracket-walk (181 keys covering all 165 venue APs) | No integrity changes from yesterday*
