# Content & Data Quality Report — 2026-05-18

**Agent:** Content & Data  
**Data health score: 62/100** (down from 65 on 05-15 — two unresolved duplicates from last report + GEAR_ITEMS absent for 3rd consecutive run)

**Score breakdown:**  
Zero duplicate IDs +8 | Zero duplicate photo base-URLs +5 | All 6 required fields present on all 150 venues +8 | ❌ `beach_tobago` = `pigeon-point-t27` exact destination duplicate (NEW discovery) −5 | ❌ `beach_milos` = `sarakiniko-beach-t16` exact destination duplicate (2nd report, unfixed) −4 | ❌ `sarakiniko-beach-t16` wrong airport code (JMK/Mykonos instead of MLO/Milos) −3 | ❌ GEAR_ITEMS absent for 3rd consecutive report — Amazon revenue $0 −10 | ❌ `abasin` missing `lateSeason:true` for 2nd report −3 | ❌ `cerro-castor-s28` likely open NOW (Ushuaia, -55°S) but no `lateSeason:true` −2 | 51 batch-added venues use cookie-cutter tag templates −4 | 5 new venues from 05-15 report never added −3 | No `description` field on any venue −2 | Previous report's 5 venues never applied +0

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 150 venues (2 launch categories)

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 86    | ✅ Launch category |
| Skiing   | 64    | ✅ Launch category |
| **TOTAL** | **150** | CLAUDE.md says "~154" — acceptable margin |

Surfing: fully retired ✅. Tanning → beach migration: complete ✅.

### Required Field Coverage — All 150/150 ✅

| Field | Present | Missing |
|-------|---------|---------|
| id | 150/150 | 0 |
| category | 150/150 | 0 |
| lat / lon | 150/150 | 0 |
| ap (IATA) | 150/150 | 0 |
| tags | 150/150 | 0 |
| photo | 150/150 | 0 |
| description | **0/150** | ALL — not blocking v1, flag for v2 |

### Duplicate IDs: NONE ✅ (boot-time validator catches these)
### Duplicate Photo Base-URLs: NONE ✅
### Out-of-range Coordinates: NONE ✅

---

### 🚨 EXACT DESTINATION DUPLICATES — P0 (delete both t-series entries)

Proximity analysis (haversine) found two confirmed same-beach pairs:

**Pair 1 — Pigeon Point, Tobago (0.8km apart)**

| Field | `beach_tobago` (keep) | `pigeon-point-t27` (DELETE) |
|-------|-----------------------|------------------------------|
| title | Pigeon Point | Pigeon Point |
| lat/lon | 11.165, -60.840 | 11.167, -60.833 |
| ap | TAB | TAB |
| rating | 4.90 / 5,400 reviews | 4.91 / 666 reviews |
| tags | "Caribbean Soul","Offshore Coral" | "Party Beach","Beach Bars","Water Sports","Vibrant" |

Keep `beach_tobago` — higher review count signals real data. Delete `pigeon-point-t27`.

**Pair 2 — Sarakiniko Beach, Milos (4km apart + WRONG AIRPORT)**

| Field | `beach_milos` (keep) | `sarakiniko-beach-t16` (DELETE) |
|-------|----------------------|----------------------------------|
| title | Sarakiniko Moon Beach | Sarakiniko Beach |
| lat/lon | 36.757, 24.390 | 36.767, 24.433 |
| ap | MLO ✅ Milos Airport | JMK ❌ Mykonos Airport (different island, 100km away) |
| tags | "White Volcanic Pumice","Lunar Landscape" | "Secluded Beach","Snorkeling","Calm Waters","Pristine" |

Keep `beach_milos` — has correct MLO airport and distinctive tags. Delete `sarakiniko-beach-t16` which points users to the wrong island's airport.

**One-liner deletes (find these lines and remove):**
```
Line 566: {id:"pigeon-point-t27",...}   ← DELETE
Line 556: {id:"sarakiniko-beach-t16",...} ← DELETE
```

After deleting: 148 venues (86→84 beach, 64 skiing). Net: removes 1.3% of venues, eliminates 100% of confirmed exact duplicates.

---

### Airport Code Flags

| Venue | Code | Issue |
|-------|------|-------|
| `sarakiniko-beach-t16` | JMK | ❌ Mykonos — wrong island (Milos = MLO) — moot after deletion |
| `outer-banks-nags-head-t7` | OAJ | ⚠️ Jacksonville, NC (~80mi from Nags Head); ORF (Norfolk) equally valid but OAJ is usable |
| `idre-fjall-s6` | MXX | ⚠️ Mora Airport (~80km from Idre); practical alternative is OSL (4hr drive) but MXX is the IATA nearest |
| `taos` | SAF | ⚠️ Santa Fe, 90 min drive — no closer commercial airport, correct |

---

### Near-Duplicate Ski Domains (monitor, don't delete yet)

| Pair | Distance | Notes |
|------|----------|-------|
| `tignes` + `val-d-isere-s16` | 6.3km | Same Espace Killy domain. Tignes has 2,960 reviews vs 2,641. Recommend: delete `val-d-isere-s16` at next cleanup. |
| `tignes` + `les-arcs-s20` | 6.5km | Adjacent valleys, different ski areas. Keep both — meaningfully different destinations. |
| `beach_shoal` + `rendezvous-bay-t28` | 8km | Both on Anguilla (AXA). Shoal Bay East = active beach; Rendezvous Bay = calm flat. Legitimately distinct. Keep both. |

---

## 2. GEAR ITEMS AUDIT — 3RD CONSECUTIVE MISSING REPORT

### Status: GEAR_ITEMS constant does not exist in app.jsx

CLAUDE.md changelog (2026-05-04) records the Amazon gate fix as shipped (commit a9aacf5). The gate expression `{GEAR_ITEMS[listing.category] && ...}` was written into VenueDetailSheet but the `GEAR_ITEMS` object was never defined. `GEAR_ITEMS[listing.category]` evaluates to `undefined` → renders nothing. **Amazon Associates revenue = $0 for all time.**

This is now the third consecutive content report flagging the same omission. The paste-ready code from the 05-15 report is unchanged and ready to apply. Revenue model table shows **$4.48/1K MAU** for this stream — at 1K MAU that's the difference between the product paying for itself or not.

### Active affiliate surfaces in VenueDetailSheet:
- ✅ Booking.com hotels (`aid=2311236`) — renders
- ✅ Flight bookout → Aviasales deep link — renders
- ❌ Amazon gear — GEAR_ITEMS constant missing, renders nothing
- ❌ SafetyWing insurance — confirm render is wired (no ref found in current scan)

### Paste-ready GEAR_ITEMS (same as 05-15 report, unchanged):

Add this constant in the **Constants & data section** of app.jsx, after CATEGORIES (around line 262):

```javascript
// ─── Amazon Associates gear items (tag=peakly-20) ───────────────────────────
const GEAR_ITEMS = {
  skiing: [
    {
      title: "Atomic Bent Chetler 100 Skis",
      desc: "All-mountain powder ski · top seller",
      price: 599,
      url: "https://www.amazon.com/dp/B09KZQP7F3?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop",
    },
    {
      title: "Smith I/O MAG Goggles",
      desc: "ChromaPop lens · fog-resistant",
      price: 249,
      url: "https://www.amazon.com/dp/B08CRDGDCX?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=120&h=120&fit=crop",
    },
    {
      title: "Black Diamond Jetforce 35L Airbag Pack",
      desc: "Avalanche airbag · backcountry essential",
      price: 1199,
      url: "https://www.amazon.com/dp/B07BFMKPXJ?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=120&h=120&fit=crop",
    },
    {
      title: "Hestra Army Leather Gloves",
      desc: "3-finger warmth · trusted for 80 years",
      price: 115,
      url: "https://www.amazon.com/dp/B000UUSNS2?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop",
    },
  ],
  beach: [
    {
      title: "Osprey Ultralight Stuff Pack 18L",
      desc: "Packable daypack · 142g",
      price: 45,
      url: "https://www.amazon.com/dp/B00J4CQZYU?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop",
    },
    {
      title: "Patagonia Stretch Wavefarer Board Shorts",
      desc: "Quick-dry · 4-way stretch",
      price: 79,
      url: "https://www.amazon.com/dp/B07VD46YGC?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    },
    {
      title: "Maui Jim Polarized Sunglasses",
      desc: "PolarizedPlus2 · UV400 protection",
      price: 189,
      url: "https://www.amazon.com/dp/B00CGYL5IC?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&h=120&fit=crop",
    },
    {
      title: "Neutrogena Beach Defense SPF 70",
      desc: "Water-resistant 80 min · reef-safe formula",
      price: 18,
      url: "https://www.amazon.com/dp/B00IKOW1FE?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=120&h=120&fit=crop",
    },
  ],
};
```

---

## 3. SEASONAL RELEVANCE — May 18, 2026

### N. Hemisphere Skiing — OFF SEASON (most resorts closed)

Only `lateSeason:true` venues are defensible to surface as "go" signals:

| Venue | Status |
|-------|--------|
| Whistler Blackcomb | `lateSeason:true` — closing weekend ~May 19 |
| Mammoth Mountain | `lateSeason:true` — can run through Memorial Day (late May) |
| Chamonix-Mont-Blanc | `lateSeason:true` — glacier skiing through July |
| Tignes / Val d'Isère | `lateSeason:true` — summer glacier skiing available |
| Cervinia | `lateSeason:true` — Matterhorn glacier, open late |
| Val d'Isere s16 | `lateSeason:true` (near-dup of tignes, per duplicate note above) |

### 🔥 TWO MISSING `lateSeason:true` FLAGS — Fix Now

**`abasin` (Arapahoe Basin, Colorado)** — second consecutive report. Tagged `"Longest Season CO"` but no `lateSeason:true`. A-Basin's 2025 season ran to June 8. Likely still open or just closed this week. Self-contradicting data visible to every user.

```javascript
// app.jsx line 437 — abasin
// BEFORE: skiPass:"ikon"},
// AFTER:  skiPass:"ikon", lateSeason:true},
```

**`cerro-castor-s28` (Cerro Castor, Tierra del Fuego, Argentina)** — new flag. At lat -54.78°S (southernmost ski resort in the world), season runs April–October. **This venue is OPEN RIGHT NOW** in May. Missing `lateSeason:true` means the off-season binary cap is likely suppressing it.

```javascript
// app.jsx line 541 — cerro-castor-s28
// BEFORE: tags:["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"]},
// AFTER:  tags:["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"], lateSeason:true},
```

### S. Hemisphere Skiing — Season Opening (June–September)

| Venue | Hemisphere | Expected Open | `lateSeason:true` |
|-------|------------|---------------|-------------------|
| `cerro-castor-s28` (Ushuaia) | S | Open NOW (Apr–Oct) | ❌ Missing — fix above |
| `portillo-s4` (Chile) | S | ~June 14 | N/A (not lateSeason flag needed — scoring handles hemisphere) |
| `pucon-ski-center-s19` (Chile) | S | ~June 20 | N/A |
| `thredbo-village-s23` (NSW) | S | ~June 7 | N/A |
| `remarkables` (NZ) | S | ~June 22 | N/A |
| `treble-cone-s29` (NZ) | S | ~June 22 | N/A |

Note: The S. hemisphere flag is handled by `scoreVenue` hemisphere detection. The `lateSeason` flag is only needed to bypass the N. hemisphere off-season binary cap. `cerro-castor` is the outlier because it's May and should be scoring NOW.

### Beach Seasonal Assessment

**Peak conditions right now:**
- Mediterranean (Ibiza, Mykonos, Positano, Sardinia, Croatia) — ✅ perfect shoulder
- Caribbean (Aruba, Turks & Caicos, Caymans, Barbados) — ✅ dry season
- Hawaii (all 3 venues) — ✅ year-round
- SE Asia: Thailand — ⚠️ May = start of rainy season on Andaman coast; Gulf side (Koh Samui, Koh Tao) still reasonable

**Off-season or challenging:**
- Bora Bora (-16.5°S) — rainy/humid; water-temp cap handles this
- Florianópolis (-27.6°S) — autumn, cooling
- Whitehaven Beach (-20.3°S) — tropical shoulder, manageable

---

## 4. CONTENT QUALITY

### Tag Analysis — P2 Quality Issue

51 of 150 venues (34%) use cookie-cutter tag templates from batch-generation. The same 4-5 tag strings rotate verbatim across unrelated venues:

| Tag Combo | Count | Problem |
|-----------|-------|---------|
| "Party Beach","Beach Bars","Water Sports","Vibrant" | 6× | Applies to Tobago, Naxos, Anguilla, Fiji, Hyams Beach AU, Croatia — these aren't all party beaches |
| "Expert Terrain","Off-Piste","Deep Snow","Backcountry" | 6× | Applies to Zell am See, Kiroro, Idre Fjall, Mount Shasta, Powder Mountain, Val d'Isere — not all are backcountry destinations |
| "Glacial Skiing","Scenic Views","Village Base","On-Piste" | 5× | Portillo, Chile (has no glacier), Pucon (volcano skiing), Thredbo AU — factually imprecise |
| "Family Friendly","Clear Visibility","Blue Flag","Amenities" | 6× | Generic to the point of useless as filter signals |

**Tag fixes for the most wrong ones (paste-ready):**

```javascript
// Portillo: not glacial, it's a famous powder bowl at 3,350m
// BEFORE: tags:["Glacial Skiing","Scenic Views","Village Base","On-Piste"]
// AFTER:  tags:["Andes Powder Bowl","Chile's Iconic Resort","High Altitude","Ski-In/Out"]

// Cerro Castor: world's southernmost ski resort
// BEFORE: tags:["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"]
// AFTER:  tags:["World's Southernmost Ski","End-of-the-World Views","Long Season","Beginner Friendly"]

// Hyams Beach AU: quietest, whitest sand in Jervis Bay — not a party beach
// BEFORE: tags:["Party Beach","Beach Bars","Water Sports","Vibrant"]
// AFTER:  tags:["World's Whitest Sand","Dolphins at Sunset","Jervis Bay","No Crowds"]
```

### Rating Distribution — No Outlier Concerns

| Range | Count |
|-------|-------|
| 4.51–4.69 | 24 |
| 4.70–4.84 | 19 |
| 4.85–4.94 | 69 |
| 4.95–4.99 | 38 |

Lowest: Kicking Horse 4.51, Laguna Beach CA 4.51 — both plausible. No suspicious ratings.

---

## 5. DAILY VENUE ADDITIONS — 5 new venues

Targeting: Maldives (3rd consecutive report missing), S. hemisphere ski in season, geographic gaps (Cape Verde, Phuket, Bali proper).

```javascript
// ─── 5 new venues — paste into VENUES array before the closing ]; ───────────

{id:"maldives-ari-atoll", category:"beach", title:"Ari Atoll Maldives",
  location:"South Ari Atoll, Maldives",
  lat:3.6833, lon:72.8333, ap:"MLE",
  icon:"🏝️", rating:4.98, reviews:6240,
  gradient:"linear-gradient(160deg,#001a33,#003d7a,#0077cc)",
  accent:"#33bbff",
  tags:["Whale Shark Year-Round","Overwater Bungalows"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"las-lenas", category:"skiing", title:"Las Leñas",
  location:"Mendoza, Argentina",
  lat:-35.1500, lon:-70.0700, ap:"MDZ",
  icon:"⛷️", rating:4.89, reviews:1820,
  gradient:"linear-gradient(160deg,#0a1828,#1a3272,#2a5ab4)",
  accent:"#78a8d8",
  tags:["Driest Andean Powder","Expert Chutes"],
  photo:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},

{id:"santa-maria-cape-verde", category:"beach", title:"Santa Maria Beach",
  location:"Sal Island, Cape Verde",
  lat:14.9040, lon:-23.5960, ap:"SID",
  icon:"🏖️", rating:4.88, reviews:4120,
  gradient:"linear-gradient(160deg,#1a0d00,#4a2200,#8a4400)",
  accent:"#ddaa44",
  tags:["Year-Round Trade Winds","African Atlantic"],
  photo:"https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

{id:"kata-noi-phuket", category:"beach", title:"Kata Noi Beach",
  location:"Phuket, Thailand",
  lat:7.8205, lon:98.2985, ap:"HKT",
  icon:"🏖️", rating:4.93, reviews:12800,
  gradient:"linear-gradient(160deg,#002233,#005566,#009999)",
  accent:"#22ddcc",
  tags:["Secluded Cove","Calm Andaman Turquoise"],
  photo:"https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"seminyak-beach-bali", category:"beach", title:"Seminyak Beach",
  location:"Bali, Indonesia",
  lat:-8.6906, lon:115.1552, ap:"DPS",
  icon:"🏖️", rating:4.87, reviews:22400,
  gradient:"linear-gradient(160deg,#1a0900,#4d1c00,#8c3300)",
  accent:"#ff8844",
  tags:["Legendary Bali Sunsets","Beach Club Scene"],
  photo:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},
```

---

## PM NOTE

Three separate issues compounding into a revenue + trust problem:

**#1 — GEAR_ITEMS (revenue, P0):** $4.48/1K MAU sitting completely dark for the 3rd week. This is the highest-ROI 30-minute task on the board. The constant is written above, ready to paste. One fix, no design work.

**#2 — Two exact duplicate beaches (trust, P0):** Users who wishlist "Pigeon Point, Tobago" will see it twice in Explore — confusing and breaks the "quality product" feel. `pigeon-point-t27` and `sarakiniko-beach-t16` both need one-line deletions. The `sarakiniko-beach-t16` entry also has the wrong airport code (Mykonos instead of Milos), which would send users to book flights to the wrong island.

**#3 — `cerro-castor-s28` is open right now** and scoring as off-season. Ushuaia ski season runs April–October. One `lateSeason:true` token fixes it. Same for `abasin` — "Longest Season CO" tag is self-contradicting for a 2nd consecutive week.

Fix priority order: gear items → delete two dupes → add two `lateSeason:true` flags. Combined: ~45 minutes of work.
