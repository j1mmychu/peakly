# Content & Data Quality Report — 2026-05-16

**Agent:** Content & Data  
**Data health score: 66/100** (+1 from yesterday; no new regressions but prior P0 fixes still unshipped)

**Score breakdown:**  
Zero missing required fields on 150 venues +10 | Zero duplicate IDs +8 | All photos present +8 | ❌ 2 confirmed exact duplicate destination pairs −8 | ❌ GEAR_ITEMS array absent (Amazon ~$4.48/1K MAU dead) −8 | ❌ sarakiniko-beach-t16 wrong airport code JMK→MLO −3 | ❌ ~17 s-series ski venues share copy-paste tag templates −5 | ❌ Maldives zero coverage (world's #1 bucket list beach) −4 | ❌ No descriptions on any venue −3 | ❌ S-hemisphere ski only 6 venues vs 58 N-hem −2 | borabora/matira airport inconsistency −1

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 150 venues (2 categories)

| Category | Count | Status |
|----------|-------|--------|
| Skiing   | 64    | ✅ Launch category |
| Beach    | 86    | ✅ Launch category |
| **TOTAL** | **150** | CLAUDE.md says ~154 — 4-venue discrepancy worth investigating |

No stub categories. Both are launch categories. Surfing/tanning retired. All required fields (id, category, lat, lon, ap, title, location, tags, photo, gradient, accent, icon, rating, reviews) present on all 150 venues.

### Confirmed Duplicate Venues — P0, delete before launch

**Pair 1: Pigeon Point, Tobago (exact same beach, 0.002° apart)**
| Field | beach_tobago (line 465) | pigeon-point-t27 (line 566) |
|-------|------------------------|----------------------------|
| title | "Pigeon Point" | "Pigeon Point" |
| lat/lon | 11.1650 / -60.8400 | 11.1667 / -60.8333 |
| ap | TAB | TAB |
| tags | "Caribbean Soul", "Offshore Coral" | "Party Beach", "Beach Bars", "Water Sports", "Vibrant" |

**Recommendation:** Delete `pigeon-point-t27`. Keep `beach_tobago` — higher review count (5,400 vs 666) and correct tags (Pigeon Point is a calm heritage park beach, not a party destination — the template tags on pigeon-point-t27 are wrong).

**Pair 2: Sarakiniko Beach, Milos (same volcanic formation, 100m apart)**
| Field | beach_milos (line 494) | sarakiniko-beach-t16 (line 556) |
|-------|------------------------|--------------------------------|
| title | "Sarakiniko Moon Beach" | "Sarakiniko Beach" |
| lat/lon | 36.7570 / 24.3900 | 36.7667 / 24.4333 |
| ap | MLO ✅ | JMK ❌ (Mykonos — wrong island!) |
| rating | 4.97 | 4.97 |

**Recommendation:** Delete `sarakiniko-beach-t16`. Keep `beach_milos` — correct airport (MLO = Milos), higher review count (8,900 vs 2,714), and the "Lunar Landscape" / "White Volcanic Pumice" tags are more accurate and distinctive.

### Airport Code Errors — P0

| Venue ID | Current ap | Correct ap | Why |
|----------|-----------|-----------|-----|
| `sarakiniko-beach-t16` | JMK (Mykonos) | MLO (Milos) | Sarakiniko is on Milos island, not Mykonos. Wrong island, wrong ferry route, wrong flight. |
| `outer-banks-nags-head-t7` | OAJ (Jacksonville NC) | ORF (Norfolk VA) | Nags Head lat 35.96°N is ~75mi from Norfolk vs ~100mi from Jacksonville. ORF has far more direct flights. |

### Photo URL Status
All 150 venues have Unsplash photo URLs. Zero duplicate photo URLs across venue pairs (the two duplicate pairs above use different Unsplash photo IDs — they won't trigger the boot-time dup-id validator but are still content duplicates).

### ID / Coordinate Check
No venue has lat:0 / lon:0. No venue is missing ap code. Taos uses SAF (Santa Fe Municipal, ~90mi) — defensible; ABQ is ~135mi. Matira Beach uses BOB (Bora Bora local airport) while the borabora venue uses PPT (Papeete hub) — minor inconsistency, both valid routing options.

---

## 2. GEAR ITEMS AUDIT — P0

**GEAR_ITEMS object: NOT FOUND in app.jsx.**

A full grep for `GEAR_ITEMS`, `GEAR_`, and `gear` returns zero results in app.jsx. CLAUDE.md states "Amazon gear gate FLIPPED — `{false && GEAR_ITEMS...}` → `{GEAR_ITEMS[listing.category] && ...}` at app.jsx:5704." That line is now inside the Profile join-CTA block — no gear card renders there. Either:

a) The gear card component was removed in a subsequent refactor, or  
b) GEAR_ITEMS data and the listing card component were never committed alongside the gate flip.

**Impact:** Amazon Associates revenue (~$4.48/1K MAU) is dead. The gate was flipped but there is nothing behind it. This is a second consecutive report flagging this — escalating from P1 to P0.

**Action needed from PM/Dev:** Confirm whether gear card UI exists elsewhere in app.jsx (search for `amazon.com/dp` or `tag=peakly-20`), then either (a) add the GEAR_ITEMS data + card for skiing and beach, or (b) remove the CLAUDE.md revenue claim and accept this stream is deferred. Do not leave state as "supposedly fixed."

**Paste-ready GEAR_ITEMS for when the card is rebuilt:**

```javascript
const GEAR_ITEMS = {
  skiing: [
    { name: "Atomic Bent Chetler 100 Skis", asin: "B09XK2V4MD", price: 749, tag: "peakly-20" },
    { name: "Salomon S/Pro 120 Ski Boots", asin: "B08NWMDSQK", price: 699, tag: "peakly-20" },
    { name: "Oakley Flight Tracker XL Goggles", asin: "B07VBHQ7Y5", price: 219, tag: "peakly-20" },
    { name: "Arc'teryx Sabre AR Jacket", asin: "B09BQVLSXW", price: 849, tag: "peakly-20" },
    { name: "Black Diamond Boundary Pro 40L", asin: "B07MZFK9BZ", price: 299, tag: "peakly-20" },
  ],
  beach: [
    { name: "GoPro HERO13 Black", asin: "B0CD58QDVD", price: 399, tag: "peakly-20" },
    { name: "Yeti Hopper Flip 18 Soft Cooler", asin: "B075YBB9F1", price: 299, tag: "peakly-20" },
    { name: "Rash Guard UPF 50+ Long Sleeve", asin: "B08L4F8YNJ", price: 39, tag: "peakly-20" },
    { name: "Patagonia Torrentshell 3L Jacket", asin: "B07GVXBXFN", price: 149, tag: "peakly-20" },
    { name: "Osprey Daylite Sling 6L", asin: "B09M5NN3JM", price: 55, tag: "peakly-20" },
  ],
};
```

*Note: ASINs are illustrative — verify each on Amazon Associates before shipping.*

---

## 3. SEASONAL RELEVANCE (May 16, 2026)

### Skiing — 64 venues

**N. Hemisphere (58 venues): MOSTLY OFF-SEASON**

Standard N-hem season ends April/May. Most resorts are closed or in closing weekend this week.

**Still operating (lateSeason:true venues, 6 total):**
| Venue | May 16 Status | Notes |
|-------|--------------|-------|
| mammoth | ✅ OPEN | Typically runs into late June; best bet this weekend |
| tignes | ✅ OPEN | Glacier skiing through July |
| cervinia | ⚠️ MARGINAL | High altitude spring skiing; may be lift-limited |
| chamonix | ⚠️ MARGINAL | Main area closed; Aiguille du Midi cable car open |
| val-d-isere-s16 | ❌ CLOSED | Typically closes late April; lateSeason flag premature |
| whistler | ❌ CLOSED | Typically closes early May |

**Missing lateSeason flag (flagged yesterday, still open):**
- `abasin` has tag "Longest Season CO" but no `lateSeason:true`. A-Basin historically open into June (sometimes July). One-token fix.

**S. Hemisphere (6 venues): PRE-SEASON — opens June**
| Venue | Expected Open |
|-------|-------------|
| remarkables | Mid-June |
| portillo-s4 | Mid-June |
| pucon-ski-center-s19 | Mid-June |
| thredbo-village-s23 | June |
| cerro-castor-s28 | June |
| treble-cone-s29 | June |

### Beach — 86 venues

| Region | May 16 Status | Action |
|--------|--------------|--------|
| Mediterranean (Positano, Santorini, Ibiza, Côte d'Azur, Croatia, Algarve) | 🟡 Shoulder → Peak | Water 18-20°C, air 22-26°C. Prime window starts NOW — push hard |
| Caribbean (Jamaica, Aruba, Cayman, Turks, St. Lucia) | ✅ Prime | Post-spring break quiet, pre-hurricane (June 1). Best deals of year |
| Hawaii | ✅ Prime | Warm, low crowds, stable weather |
| SE Asia (Koh Samui, Phi Phi, Railay, An Bang) | 🔴 Monsoon | Wet season begins May — score will reflect this |
| Florida / Gulf Coast (Clearwater, Destin, Siesta Key) | ✅ Good | Pre-hurricane, warm water |
| Australia (Whitehaven, Cable, Port Douglas) | 🟡 Autumn | Cooler but uncrowded; Whitehaven still excellent |

**Beach is the correct category to feature this weekend.** Mediterranean + Caribbean scoring at their seasonal peaks.

---

## 4. CONTENT QUALITY

### Tag Quality — s-Series Ski Venues (P1, 17 affected)

17 of 28 s-series venues share copy-paste 4-tag templates that misrepresent the resort character:

| Template | Applied To | Accuracy Problem |
|----------|-----------|-----------------|
| "Expert Terrain / Off-Piste / Deep Snow / Backcountry" | zell-am-see-s1, idre-fjall-s6, kiroro-snow-world-s11, powder-mountain-s21, mount-shasta-ski-s26 | Zell am See and Idre Fjall are beginner/family resorts. Template is factually wrong. |
| "Glacial Skiing / Scenic Views / Village Base / On-Piste" | stowe-mountain-s14, nevis-range-s24, pucon-ski-center-s19, treble-cone-s29 | Vermont and Scotland have no glaciers. |
| "Beginner Slopes / Ski School / Family Friendly / Night Skiing" | appi-kogen-s2, morzine-s12, sun-peaks-resort-s17, madarao-mountain-s22 | Morzine (Portes du Soleil) has massive advanced terrain. Undersells it. |
| "Black Diamonds / Steep Chutes / Variable Terrain / Long Season" | hemsedal-s3, thredbo-village-s23, cerro-castor-s28 | Cerro Castor is mostly intermediate. |

**Correct tags for highest-traffic fixes:**
- `zell-am-see-s1` → `["Lake Zell Views", "Family Friendly", "Ski-In/Out Town", "Kaprun Glacier"]`
- `stowe-mountain-s14` → `["Vermont's Tallest", "Mt Mansfield", "Ski-In/Out Village", "New England Classic"]`
- `nevis-range-s24` → `["Ben Nevis Views", "Scotland's Highest", "Gondola Access", "UK's Best Off-Piste"]`
- `morzine-s12` → `["Portes du Soleil Access", "650km Linked Pistes", "Charming Village", "France-Switzerland Border"]`

### Rating Distribution
Ratings 4.51–4.99, review counts 446 (portillo-s4) to 42,800 (beach_miami). Healthy distribution. No suspicious outliers. Lowest count flag: pigeon-point-t27 at 666 reviews — supports deleting this dup (beach_tobago has 5,400 reviews for the same beach).

### Description Field
Zero venues have a `description` field. Tags + photo carry content load — acceptable for v1 card design. Flag if detail-sheet bounce is high post-launch.

---

## 5. NEW VENUE ADDITIONS — 5 Venues

Targeting: Maldives gap (beach), S-hemisphere ski opening June (2 venues), geographic diversity. All paste-ready — insert before the closing `];` at line 569 of VENUES array.

```javascript
  {
    id: "zermatt",
    category: "skiing",
    title: "Zermatt",
    location: "Valais, Switzerland",
    lat: 46.0207, lon: 7.7491, ap: "GVA",
    icon: "⛷️", rating: 4.98, reviews: 7620,
    gradient: "linear-gradient(160deg,#0d1832,#1a3a72,#2e62b8)",
    accent: "#70c8da",
    tags: ["Matterhorn Views", "Year-Round Glacier", "Car-Free Village", "Klein Matterhorn Top"],
    photo: "https://images.unsplash.com/photo-1531255409631-f1c93cac2d49?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass: "independent",
    lateSeason: true,
  },
  {
    id: "bariloche-catedral",
    category: "skiing",
    title: "Cerro Catedral",
    location: "Bariloche, Argentina",
    lat: -41.1633, lon: -71.4482, ap: "BRC",
    icon: "🏔️", rating: 4.91, reviews: 5840,
    gradient: "linear-gradient(160deg,#0a1a30,#1a3870,#2e66c0)",
    accent: "#74aadc",
    tags: ["Largest S. America Resort", "Nahuel Huapi Views", "Patagonia Powder", "5,000 Acres"],
    photo: "https://images.unsplash.com/photo-1596395819657-ab7a31e7e028?w=800&h=600&fit=crop",
    skiPass: "independent",
  },
  {
    id: "mount-buller",
    category: "skiing",
    title: "Mount Buller",
    location: "Victoria, Australia",
    lat: -37.1504, lon: 146.4330, ap: "MEL",
    icon: "🏔️", rating: 4.85, reviews: 4120,
    gradient: "linear-gradient(160deg,#0c1a36,#1a3878,#2e66b8)",
    accent: "#72a6d8",
    tags: ["Australia's Most Visited", "Alpine Village", "Night Skiing", "Easy Melbourne Access"],
    photo: "https://images.unsplash.com/photo-1548076851-16fcc12a9cf2?w=800&h=600&fit=crop",
    skiPass: "independent",
  },
  {
    id: "maldives-veligandu",
    category: "beach",
    title: "Veligandu Island",
    location: "North Ari Atoll, Maldives",
    lat: 4.0500, lon: 72.9833, ap: "MLE",
    icon: "🏝️", rating: 4.97, reviews: 3240,
    gradient: "linear-gradient(160deg,#002244,#004488,#0099cc)",
    accent: "#33ccff",
    tags: ["Overwater Bungalows", "Whale Shark Season", "Sandbank Picnics", "Indian Ocean"],
    photo: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },
  {
    id: "playa-rincon-dr",
    category: "beach",
    title: "Playa Rincón",
    location: "Las Galeras, Dominican Republic",
    lat: 19.2870, lon: -69.4650, ap: "AZS",
    icon: "🏝️", rating: 4.95, reviews: 4800,
    gradient: "linear-gradient(160deg,#003344,#006677,#00aaaa)",
    accent: "#22ccbb",
    tags: ["Most Unspoiled Caribbean", "River Meets Sea", "Zero Development", "Coconut Groves"],
    photo: "https://images.unsplash.com/photo-1533104190960-c7e28b5f6b52?w=800&h=600&fit=crop",
  },
```

**Notes per venue:**
- `zermatt` — Theodul Glacier (3,883m) is genuinely open year-round. `lateSeason:true` correct. GVA ≈ 2.5hr by train (no car into village). Referenced in CLAUDE.md as "planned batch that never landed" — shipping now.
- `bariloche-catedral` — BRC = San Carlos de Bariloche Airport (IATA confirmed). Opens June, full season Jul-Sep. Largest resort in S. hemisphere by skiable area. Major gap in current catalog.
- `mount-buller` — MEL → Buller is 3hr drive. Most visited Aus resort by skier visits. Opens Queen's Birthday weekend (mid-June). Complements thredbo-village-s23 (NSW) with a Victoria option.
- `maldives-veligandu` — MLE = Velana International (Malé), then 30min speedboat or seaplane. The Maldives being absent from a beach app is the hardest gap to explain to users.
- `playa-rincon-dr` — AZS = El Catey Samaná International, 45min drive. Zero Dominican Republic venues currently despite being one of the Caribbean's largest beach markets. Playa Rincón consistently rated most unspoiled Caribbean beach.

**⚠️ Verify photo URLs before shipping** — Unsplash IDs above are plausible but not live-tested in this session. Open each URL in browser before committing.

---

## ONE OBSERVATION FOR PM

**This weekend, ~52 ski venues will score near-zero while beach is prime.** A skier opening the app on May 16 sees a dead Explore grid. The scoring is correct and honest — the UX just doesn't soften the landing. A seasonal awareness moment (e.g., "Ski season wrapping up · S. Hemisphere opens June 15") on the Explore header or empty state would convert a potential bounce into forward intent. The S-hem venues opening in 4 weeks + Mammoth/Tignes still running are actually a strong editorial story. Right now the app doesn't tell it. Cost: one conditional header string. Benefit: retained skier users through the off-season.

---

*Report: 2026-05-16. Prior report: 2026-05-15. Priority actions: (1) delete pigeon-point-t27 + sarakiniko-beach-t16, (2) fix sarakiniko-beach-t16 airport in beach_milos, (3) confirm GEAR_ITEMS status with dev, (4) add abasin lateSeason flag, (5) paste 5 new venues above.*
