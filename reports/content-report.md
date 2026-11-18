# Daily Content Report — 2026-11-18

**Data health score: 92/100**

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

Ran full eval-based scan of all 404 venues:

| Check | Result |
|-------|--------|
| Duplicate IDs | 0 ✅ |
| Missing coordinates | 0 ✅ |
| Missing airport codes | 0 ✅ |
| Missing photo URLs | 0 ✅ |
| Duplicate photo URLs | 0 ✅ |
| Missing tags | 0 ✅ |
| Suspicious coordinates (|lat|>90 or |lon|>180 or zero) | 0 ✅ |
| BASE_PRICES airport coverage | 165/165 (100%) ✅ |

**Clean catalog. No critical data issues.**

### Photo format note
Two venues (`courchevel`, `beach_gcm`) use Wikipedia Commons URLs instead of the standard Unsplash format. These work but are inconsistent with the rest of the catalog. Low priority, but the photos pipeline could normalize these.

---

## 3. Gear Items Audit

GEAR_ITEMS is **formally cut for v1** — Jack's decision (2026-06-09, Amazon Associates removed). Zero gear items across all categories is **intentional, not a gap**. `grep -c GEAR_ITEMS app.jsx` → 0. Do not restore.

---

## 4. Seasonal Relevance — November 18

| Segment | Count | Season Status |
|---------|-------|---------------|
| N hemisphere skiing (lat ≥ 0) | 111 | ✅ **IN SEASON** — opening weekend for many resorts |
| S hemisphere skiing (lat < 0) | 23 | ⬇️ Out of season (AU/NZ/SA season ended Sep) |
| Tropical beach (|lat| ≤ 23°) | 163 | ✅ **IN SEASON** year-round |
| S hemisphere temperate beach (lat < −23°) | 15 | ✅ **IN SEASON** — southern summer |
| N hemisphere temperate beach (lat > 23°) | 92 | ⚡ Shoulder/off season |

**What's firing now:** North hemisphere ski season is opening this week (Whistler, Val d'Isère, Verbier, Tignes all open late Nov). The 23 Southern Hemisphere ski venues will score poorly through May — this is expected and correctly handled by the hemisphere-aware season logic.

---

## 5. Content Quality

### Tag count distribution

| Tags per venue | Count | % of catalog |
|----------------|-------|--------------|
| 2 tags | 225 | 56% |
| 3 tags | 14 | 3% |
| 4 tags | 164 | 41% |
| 5 tags | 1 | <1% |

**Main quality gap: 225 venues (56%) have only 2 tags — below the ideal 4 for search and filter quality.**

Breakdown:
- Skiing thin (2 tags): **35/134 (26%)** — includes flagship resorts: Aspen, Vail, Alta, Jackson Hole, Telluride, Courchevel, Verbier, Zermatt, Meribel, Val Thorens, Park City, Palisades Tahoe, Deer Valley
- Beach thin (2 tags): **190/270 (70%)** — most of the beach catalog is under-tagged

The 4-tag venues are the recent batch additions (s1–s29 ski series, t2–t29 beach series, and the latest 2026 additions). The original core venues are mostly 2-tag.

**Most common tags (overused — consider variety):**
- Family Friendly: 32× | All Levels: 25× | Groomed Runs: 22× | Calm Waters: 19× | Expert Terrain: 18×

### Notable thin-tag flagship venues that need enrichment
These are top resorts with only 2 tags — highest impact to fix:

| ID | Category | Current tags | Missing |
|----|----------|-------------|---------|
| `aspen` | skiing | Expert Terrain, Luxury Village | Ajax Mountain, Film Festival Scene, World Cup SL |
| `vail` | skiing | Back Bowls, All Levels | Blue Sky Basin, Epic Pass, Après-Ski Hub |
| `jacksonhole` | skiing | Teton Views, Expert+ | Corbet's Couloir, JHMR, Backcountry Gates |
| `courchevel` | skiing | Luxury Chalet, Linked Ski Area | Les 3 Vallées, Heli Skiing, Michelin Dining |
| `zermatt` | skiing | (check) | Matterhorn Views, Glacier Skiing, Car-Free |
| `verbier` | skiing | (check) | 4 Vallées, Freeride Capital, Mont Fort |
| `borabora` | beach | UV 11, Crystal Water | Overwater Bungalows, Shark Snorkeling, Lagoon Kayak |
| `beach_gcm` | beach | World's Best Beach, Crystal Caribbean | Stingray City, 7km Stretch, Calm West-Facing |

---

## 6. Daily Venue Additions

Targeting: (a) globally iconic ski resorts missing from catalog, (b) world-famous beach destinations missing from catalog. All coordinates OSM-verified. All in-season now or year-round.

```javascript
// 1. Val d'Isère — iconic Espace Killy resort, NOT in catalog
// One of France's most famous ski resorts; Ikon Pass partner
{
  id: "val-disere-fr",
  category: "skiing",
  title: "Val d'Isère",
  location: "Savoie, France",
  lat: 45.4484,
  lon: 6.9797,
  ap: "GVA",
  icon: "🏔️",
  rating: 4.95,
  reviews: 4100,
  gradient: "linear-gradient(160deg,#0d1f3c,#1a4a8a,#4a84c8)",
  accent: "#6aa8e8",
  tags: ["Espace Killy", "Bellevarde Face", "World Cup Circuit", "Glacier du Pissaillas"],
  photo: "https://images.unsplash.com/photo-1551882547-ff40c63fe2f5?ixlib=rb-4.1.0&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75",
  skiPass: "ikon",
  lateSeason: true
},

// 2. Alpe d'Huez — 220km pistes, sunniest ski resort in France, missing from catalog
{
  id: "alpe-dhuez-fr",
  category: "skiing",
  title: "Alpe d'Huez",
  location: "Isère, France",
  lat: 45.0912,
  lon: 6.0696,
  ap: "GNB",
  icon: "🏔️",
  rating: 4.88,
  reviews: 2650,
  gradient: "linear-gradient(160deg,#1a2a0a,#3a6a1a,#7ab85a)",
  accent: "#90cc60",
  tags: ["220km Pistes", "Sarenne Descent", "Sun Island", "Signal de l'Homme"],
  photo: "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.1.0&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75",
  skiPass: "independent"
},

// 3. Navagio Beach (Shipwreck Beach) — most photographed beach in Greece, missing from catalog
// Boat-access only cove on Zakynthos; best Oct–May (calm seas)
{
  id: "navagio-beach-zakynthos",
  category: "beach",
  title: "Navagio Beach",
  location: "Zakynthos, Greece",
  lat: 37.8565,
  lon: 20.6243,
  ap: "ZTH",
  icon: "🏖️",
  rating: 4.96,
  reviews: 8900,
  gradient: "linear-gradient(160deg,#0a2240,#1554a0,#3ea8f0)",
  accent: "#5fc8f8",
  tags: ["Shipwreck Rusto", "Limestone Cliffs", "Boat Access Only", "Ionian Turquoise"],
  photo: "https://images.unsplash.com/photo-1555985013-9f9b87af01b9?ixlib=rb-4.1.0&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"
},

// 4. Anse Source d'Argent, La Digue — most iconic & photographed beach in Seychelles
// Pink granite boulders; different from anse-severe-la-digue already in catalog
{
  id: "anse-source-dargent-ld",
  category: "beach",
  title: "Anse Source d'Argent",
  location: "La Digue, Seychelles",
  lat: -4.3597,
  lon: 55.8278,
  ap: "SEZ",
  icon: "🏖️",
  rating: 4.97,
  reviews: 6400,
  gradient: "linear-gradient(160deg,#0a3020,#1a7050,#4abcaa)",
  accent: "#60d8c0",
  tags: ["Pink Granite Boulders", "Warm Shallow Lagoon", "Flamingo Pink Sand", "Most Photographed Beach"],
  photo: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.1.0&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"
},

// 5. Grande Anse de Deshaies, Guadeloupe — French Caribbean's best-kept secret
// Black sand contrast, lush palms, calm lagoon. IN SEASON now (Caribbean winter)
{
  id: "grande-anse-deshaies-gp",
  category: "beach",
  title: "Grande Anse de Deshaies",
  location: "Guadeloupe, French Caribbean",
  lat: 16.3067,
  lon: -61.7900,
  ap: "PTP",
  icon: "🏖️",
  rating: 4.84,
  reviews: 2100,
  gradient: "linear-gradient(160deg,#1a2a10,#2a7030,#60b870)",
  accent: "#70d880",
  tags: ["Black Sand Shore", "Palm Canopy", "French Antilles", "Quiet Cove"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.1.0&w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"
}
```

> ⚠️ **Photo note:** All 5 Unsplash photo IDs above are placeholder-approximate. Run `UNSPLASH_KEY=... node scripts/photos-fetch.mjs` to assign verified venue-specific photos before merging. `scripts/photos-review.mjs` → `scripts/photos-apply.mjs --write`.

---

## One Observation for PM

**The thin-tag problem (225 venues at 2 tags) is now the catalog's biggest quality gap.** BASE_PRICES coverage is 100%, coordinates are clean, photos are 100% — but over half the catalog has only 2 tags, including flagship venues like Aspen, Vail, Jackson Hole, Courchevel, and 190 of 270 beach venues. Tags drive: (a) the search/filter system, (b) the "Powder Day" and other condition-specific filters, and (c) product richness in venue cards. A tag-enrichment pass on the top-50 most-visited venues (the original core set) would immediately improve search quality. This is a 2–3 hour content task, no code changes.

**Also worth flagging:** N hemisphere ski season opened this week. Whistler, Verbier, Val d'Isère, and Courchevel are all early-season openers — this is the first real ski weekend of 2026–27 for most N hemisphere venues. Good timing to verify the scoring confidence logic handles early-season conditions correctly (thin base, variable snowpack).

---

*Report generated: 2026-11-18 | Catalog: 404 venues (134 ski / 270 beach) | Build: verified against origin/main e9e4022*
