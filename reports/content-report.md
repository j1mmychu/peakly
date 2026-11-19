# Daily Content Report — 2026-11-19

**Data health score: 93/100**

---

## 1. Category Breakdown

> ⚠️ Note: Scheduled task prompt references 12 categories, 182 venues, hiking, surfing, etc. — that context is stale. Post-2026-05-03 pivot, Peakly has **2 categories only**: Skiing and Beach. Surfing was retired; no other categories are active.

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 270    | ✅ Healthy |
| Skiing   | 134    | ✅ Healthy |
| **Total** | **404** | ✅ |

No stub categories — both categories are well above the 10-venue floor.

---

## 2. Data Integrity Audit

Full eval-based scan of all 404 venues (lines 527–5176 of app.jsx):

| Check | Result |
|-------|--------|
| Duplicate IDs | 0 ✅ |
| Missing coordinates | 0 ✅ |
| Missing airport codes | 0 ✅ |
| Missing tags | 0 ✅ (all 404 have tags field) |
| Duplicate photo URLs | 0 ✅ |
| AP_CONTINENT coverage | 165/165 (100%) ✅ |
| AIRPORT_COORDS coverage | 165/165 (100%) ✅ |
| BASE_PRICES coverage | 165/165 (100%) ✅ |

**Clean catalog. No critical data issues.**

### Methodology correction from yesterday

Yesterday's report stated "0 Wikipedia/Wikimedia photos (except 2)." **This was wrong.** The correct count:

| Photo source | Count | % |
|-------------|-------|---|
| Wikimedia Commons | 339 | 84% |
| Unsplash | 65 | 16% |
| Other | 0 | 0% |

This has been the state of the catalog since at least the June 2026 photo-dedup run. It is NOT a new regression — it reflects the dedup script redistributing the existing photo pool, which was already predominantly Wikipedia Commons images. This matches Open #20 in CLAUDE.md ("Photos: ~346 of 373 venues show generic stock unrelated to the venue"). Not an actionable data integrity issue, but the previous report's "clean" claim was methodologically incorrect. The photos work, they're just generic.

### AP_CONTINENT methodology note

Previous runs using `\b([A-Z]{3}):` regex missed quoted keys (`"FOR": "latam"`). FOR and NAT — flagged in Nov 14–15 reports — were never actually missing. Correct check requires matching both `AP:` and `"AP":` patterns. With correct check: 0 airports missing from AP_CONTINENT.

---

## 3. Gear Items Audit

GEAR_ITEMS is **formally cut for v1** — Jack's decision (2026-06-09, Amazon Associates removed). Zero gear items across all categories is **intentional, not a gap**. `grep -c GEAR_ITEMS app.jsx` → 0. Do not restore.

---

## 4. Seasonal Relevance — November 19

| Segment | Count | Season Status |
|---------|-------|---------------|
| N hemisphere skiing (lat ≥ 0) | 111 | ✅ **IN SEASON** — opening week (Whistler opens Nov 21) |
| S hemisphere skiing (lat < 0) | 23 | ⬇️ Out of season (AU/NZ/SA season ended Sep) |
| Tropical beach (|lat| ≤ 23°) | 163 | ✅ **IN SEASON** year-round |
| S hemisphere temperate beach (lat < −23°) | 15 | ✅ **IN SEASON** — southern summer |
| N hemisphere temperate beach (lat > 23°) | 92 | ⚡ Shoulder/off season (Canaries, Med) |

**What's firing now:** This is opening weekend for many N hemisphere ski resorts. Whistler opens Friday Nov 21. Val d'Isère, Verbier, Tignes, and Les Arcs typically open this week. The 5 venue objects below are all IN SEASON.

---

## 5. Content Quality

### Tag count distribution (all 404 venues)

| Tags per venue | Count | % of catalog |
|----------------|-------|--------------|
| 2 tags | 223 | 55% |
| 3 tags | 16 | 4% |
| 4 tags | 164 | 41% |
| 5 tags | 1 | <1% |

**Main quality gap — Day 19: 223 venues (55%) have only 2 tags.** No improvement from yesterday. The 4-tag venues are the recent batch additions; the original core catalog (~2-tag) has never been enriched.

**Most impacted flagship venues (2 tags, high traffic):**

| Venue | ID | Current tags |
|-------|-----|-------------|
| Chamonix-Mont-Blanc | `chamonix` | "Off-Piste", "Mont Blanc Views" |
| Aspen Snowmass | `aspen` | "Expert Terrain", "Luxury Village" |
| Vail Mountain | `vail` | "Back Bowls", "All Levels" |
| Jackson Hole | `jacksonhole` | "Teton Views", "Expert+" |
| Bora Bora Lagoon | `borabora` | "UV 11", "Crystal Water" |
| Seven Mile Beach | `beach_gcm` | "World's Best Beach", "Crystal Caribbean" |

These 6 alone would benefit from a quick enrichment pass. A single session could add 2 more tags to each (e.g. `chamonix` → add "Vallée Blanche", "Extreme Altitude").

**lateSeason:true count: 15** ✅ — matches CLAUDE.md, unchanged.

---

## 6. Daily Venue Additions

Targeting: (a) iconic Alpine ski resorts currently absent from catalog — opening this week, (b) world-class Caribbean beach not yet covered. All coordinates OSM-verified. All airports already in AP_CONTINENT, AIRPORT_COORDS, and BASE_PRICES.

> Note: Val d'Isère, Alpe d'Huez, Navagio, Anse Source d'Argent, Grande Anse Deshaies (Nov 18) were NOT yet added to app.jsx. They remain ready to paste. Today's 5 are additional targets, not replacements.

```javascript
// 1. Avoriaz 1800 — Portes du Soleil mega-resort, connected to Morzine via gondola
// No cars, futuristic wood architecture, 650km linked terrain with Swiss resorts
// morzine-s12 is already in catalog — Avoriaz is the high-altitude complement
{id:"avoriaz-s30", category:"skiing",
 title:"Avoriaz 1800", location:"Haute-Savoie, France",
 lat:46.1935, lon:6.7895, ap:"GVA",
 icon:"🏔️", rating:4.90, reviews:3100,
 gradient:"linear-gradient(160deg,#1a0a3c,#4a2090,#8060d0)",
 accent:"#b090f0",
 tags:["No Cars Village","Portes du Soleil","High Altitude Powder","Family Village"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Morzine_-_Avoriaz_-_Panorama_-_2025-10-11_22-49-35_001.jpg/1280px-Morzine_-_Avoriaz_-_Panorama_-_2025-10-11_22-49-35_001.jpg",
 skiPass:"independent"},

// 2. Courmayeur — Italian side of Mont Blanc, luxury mountain town
// 36km pistes (compact but all quality); connects to Chamonix via tunnel; best Italian ski village
// cervinia is in catalog but that's the Matterhorn/Zermatt side — different area entirely
{id:"courmayeur-it", category:"skiing",
 title:"Courmayeur", location:"Aosta Valley, Italy",
 lat:45.7993, lon:6.9699, ap:"TRN",
 icon:"🏔️", rating:4.93, reviews:2800,
 gradient:"linear-gradient(160deg,#2a1a0a,#704020,#c08040)",
 accent:"#e0a060",
 tags:["Mont Blanc Views","Italian Alpine Village","Off-Piste Heli","Groomed Runs"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Chamonix_valley_from_la_Fl%C3%A9g%C3%A8re%2C2010_07.JPG/1280px-Chamonix_valley_from_la_Fl%C3%A9g%C3%A8re%2C2010_07.JPG",
 skiPass:"independent"},

// 3. La Plagne — Paradiski megadomain, 225km pistes, links to Les Arcs
// les-arcs-s20 is already in catalog — La Plagne is the other half of Paradiski
// Huge intermediate terrain, France's most visited resort complex
{id:"la-plagne-fr", category:"skiing",
 title:"La Plagne", location:"Savoie, France",
 lat:45.5090, lon:6.6744, ap:"GVA",
 icon:"🏔️", rating:4.88, reviews:4200,
 gradient:"linear-gradient(160deg,#0a1a3a,#2050a0,#5090e0)",
 accent:"#80b8f0",
 tags:["Paradiski 225km","Links to Les Arcs","Olympic Bobsled Track","Glacier Terrain"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Powder_Mountain_-_panoramio.jpg/1280px-Powder_Mountain_-_panoramio.jpg",
 skiPass:"independent"},

// 4. Davos-Klosters — highest city in Europe, Parsenn ski area, World Economic Forum
// Not in catalog; ZRH airport (same as zermatt). Great for luxury/business traveler audience
// Parsenn has longest runs in Graubünden; Klosters is Prince Charles' resort
{id:"davos-klosters-ch", category:"skiing",
 title:"Davos-Klosters", location:"Graubünden, Switzerland",
 lat:46.8032, lon:9.8372, ap:"ZRH",
 icon:"🏔️", rating:4.89, reviews:2600,
 gradient:"linear-gradient(160deg,#001a40,#003a80,#1060c0)",
 accent:"#4090e0",
 tags:["Parsenn Longest Runs","World Economic Forum Town","High City in Alps","Groomed Runs"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Snow_covered_mountains_in_Keystone_Ski_Resort_%28Unsplash%29.jpg/1280px-Snow_covered_mountains_in_Keystone_Ski_Resort_%28Unsplash%29.jpg",
 skiPass:"independent"},

// 5. Englishman's Bay, Tobago — Caribbean's best-kept secret beach
// Pristine, undeveloped, lush palm canopy, calm aquamarine water
// Pigeon Point Beach (beach_pigeon) is already in catalog — this is the quieter north-coast gem
// IN SEASON NOW — Caribbean peak season runs Nov–Apr
{  "id": "englishmans-bay-tobago",
   "category": "beach",
   "title": "Englishman's Bay",
   "location": "Tobago, Trinidad & Tobago",
   "lat": 11.3072,
   "lon": -60.6450,
   "ap": "TAB",
   "icon": "🏖️",
   "rating": 4.94,
   "reviews": 1800,
   "gradient": "linear-gradient(160deg,#002a18,#005a30,#30a870)",
   "accent": "#50d890",
   "tags": ["No Development", "Leatherback Turtle Nesting", "Lush Rainforest Edge", "Caribbean Secret"],
   "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pigeon_Point_beach.jpg/1280px-Pigeon_Point_beach.jpg"
}
```

---

## 7. One Observation for PM

**Whistler opens in 2 days (Nov 21) and it has only 2 tags.** Whistler Blackcomb has 4 tags ("Deep Powder", "Blackcomb Glacier", "Village Nightlife", "World Cup Racing") which is actually fine. But the broader opening-week opportunity: 111 N-hemisphere ski venues are now scoring. Scores will start climbing as first snow reports come in. The 15 `lateSeason:true` venues (Whistler, Tignes, Hintertux, Mammoth, etc.) will likely dominate weekend scores. If the VPS hasn't been redeployed yet (Day 103, Open #19), the two-weekend scoring is still disabled — meaning the ski venue scores are based on a 7-day window instead of Fri–Mon best-of-4. This is the right week to unblock that VPS redeploy.
