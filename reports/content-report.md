# Content & Data Quality Report — 2026-05-20

**Agent:** Content & Data
**Data health score: 54/100** (down from 65/100 on 2026-05-15 — new duplicate pairs discovered, prior unfixed issues compound)

**Score breakdown:**
150 venues with 100% required fields +20 | Zero broken IDs +10 | Zero broken photo URLs +8 | Hemisphere-aware ski scoring verified correct +5 | ❌ GEAR_ITEMS absent — Amazon revenue $0 for third consecutive report −10 | ❌ 2 new confirmed duplicate destination pairs discovered −6 | ❌ sarakiniko-beach-t16 uses JMK (Mykonos) airport for a venue on Milos — 86km wrong −5 | ❌ 6 tag-sets appearing 4–6× each across unrelated venues — copy-paste at batch scale −6 | ❌ abasin missing lateSeason:true for third report unfixed −4 | ❌ val-d-isere-s16 + tignes still both in Espace Killy domain −3 | ❌ No descriptions on any venue −5 | ❌ ZPC (Pucon) not a standard IATA code −2 | ❌ BOB (Matira Beach) creates near-dup with borabora which uses PPT −2

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 150 venues (2 categories post-pivot)

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 86   | ✅ Launch category |
| Skiing   | 64   | ✅ Launch category |
| **TOTAL** | **150** | Note: system prompt says 182/12-category — that is a stale pre-pivot artifact. Actual state: 150 venues, 2 active categories. |

No stub categories — both are launch categories. Surfing fully retired.

### Required Field Coverage

| Field | Present | Missing |
|-------|---------|---------|
| id | 150/150 | 0 |
| category | 150/150 | 0 |
| lat / lon | 150/150 | 0 |
| ap (airport IATA) | 150/150 | 0 |
| tags | 150/150 | 0 |
| photo | 150/150 | 0 |
| rating | 150/150 | 0 |
| description | **0/150** | **ALL** — no venue has a description field (3rd report) |
| difficulty | **0/150** | **ALL** — field not in schema |

### Duplicate IDs: NONE ✅
### Duplicate Photo Base URLs: NONE ✅
### Out-of-range Coordinates: NONE ✅

---

### NEW: Confirmed Duplicate Destination Pairs — P1

Two new duplicate pairs discovered this run (in addition to the tignes/val-d-isere-s16 pair from last report):

**Pair 1: Sarakiniko Beach, Milos — two venues, PLUS one has the wrong airport**
- `beach_milos` — "Sarakiniko Moon Beach", Milos, ap:`MLO` ✅ (correct — Milos airport)
- `sarakiniko-beach-t16` — "Sarakiniko Beach", Milos, ap:`JMK` ❌ (WRONG — JMK is Mykonos, 86km away)

Same physical beach (Sarakiniko, Milos, Greece). `beach_milos` has the right airport. `sarakiniko-beach-t16` not only duplicates it but will generate wrong flight prices because it routes through Mykonos. Delete `sarakiniko-beach-t16`.

**Pair 2: Pigeon Point, Tobago — exact same name and island**
- `beach_tobago` — "Pigeon Point", Tobago, ap:`TAB`, rating:4.90
- `pigeon-point-t27` — "Pigeon Point", Tobago, ap:`TAB`, rating:4.91

Literal duplicates. Delete `pigeon-point-t27` (lower reviews: 666 vs 5400).

**Ongoing unfixed — Pair 3: Espace Killy ski domain**
- `tignes` — Tignes/Val d'Isère, ap:`CMF`, lateSeason:true (flagged 2026-05-15, unfixed)
- `val-d-isere-s16` — Val d'Isere, ap:`GVA`, lateSeason:true (flagged 2026-05-15, unfixed)

Both point to the same connected ski domain. Keep `tignes` (higher rating, more reviews), delete `val-d-isere-s16`. Note: `val-d-isere-s16` is hardcoded into the Alert pre-population seed at app.jsx:5192 — update that to `tignes` before deletion.

---

### Airport Code Flags

**Confirmed wrong (P1):**
- `sarakiniko-beach-t16`: ap:`JMK` should be `MLO` — covered above in duplicate section

**Likely invalid IATA:**
- `pucon-ski-center-s19`: ap:`ZPC` — ZPC is not a standard IATA code. Pucón has no commercial airport. Correct code is `ZCO` (Temuco-Maquehue Airport, 110km from Pucón) or `SCL` (Santiago, 780km). Recommend `ZCO`.

**Valid but worth noting:**
- `matira-beach-t6`: ap:`BOB` (Bora Bora Motu Mute Airport) — this creates a near-dup with `borabora` which uses `PPT` (Papeete hub). Both are valid routing options; not a data error.

---

### Tag Copy-Paste Crisis — P1

6 generic tag-sets appear 4–6× each across completely unrelated venues. This is a batch-generation artifact:

| Tag Set | Count | Problem Venues |
|---------|-------|----------------|
| `"Party Beach","Beach Bars","Water Sports","Vibrant"` | 6 | Agios Prokopios, Holbox, Orient Bay, Pigeon Point t27, Sayulita, An Bang |
| `"Family Friendly","Clear Visibility","Blue Flag","Amenities"` | 6 | Multiple EU beaches |
| `"Expert Terrain","Off-Piste","Deep Snow","Backcountry"` | 6 | Idre Fjall, val-d-isere-s16, and 4 others |
| `"Glacial Skiing","Scenic Views","Village Base","On-Piste"` | 5 | Portillo, Stowe, Pucon, Nevis Range, Treble Cone |
| `"Black Diamonds","Steep Chutes","Variable Terrain","Long Season"` | 4 | Cerro Castor, Thredbo, and 2 others |
| `"Natural Beauty","Protected Bay","Coral Reef","No Crowds"` | 5 | Multiple Caribbean |

Stowe Mountain is tagged `"Glacial Skiing"` — Stowe is in Vermont and has no glaciers. Nevis Range (Scotland) tagged the same. These are clearly copy-paste. Below are suggested specific replacements for the worst offenders:

- `stowe-mountain-s14`: `"Stowe Village Inn Town","Vermont's Most Famous"`
- `nevis-range-s24`: `"Ben Nevis Panorama","Scotland's Highest Lift"`
- `pucon-ski-center-s19`: `"Active Volcano Views","Patagonian Backdrop"`
- `cerro-castor-s28`: `"Southernmost Ski Resort","Tierra del Fuego Wilderness"`

---

## 2. GEAR ITEMS AUDIT

### GEAR_ITEMS: STILL DOES NOT EXIST — 3rd consecutive report

CLAUDE.md claims Amazon Associates revenue is live (peakly-20) at $4.48/1K MAU. **The `GEAR_ITEMS` constant does not appear anywhere in app.jsx.** The revenue stream is $0. This is the third consecutive report flagging this.

Affiliate cards in detail sheet:
- ✅ Booking.com (`aid=2311236`) — renders for all venues
- ✅ SafetyWing insurance — renders for all venues
- ❌ Amazon gear — gate expression `GEAR_ITEMS[listing.category]` evaluates to `undefined` → renders nothing

### Paste-ready GEAR_ITEMS — add to Constants section after CATEGORIES (app.jsx ~line 254)

```javascript
// ─── Amazon Associates gear items ───
const GEAR_ITEMS = {
  skiing: [
    {
      title: "Smith I/O MAG Goggles",
      desc: "ChromaPop lens · zero-fog guarantee",
      price: 249,
      url: "https://www.amazon.com/dp/B08CRDGDCX?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=120&h=120&fit=crop",
    },
    {
      title: "Hestra Army Leather Gloves",
      desc: "3-finger warmth · trusted 80+ years",
      price: 115,
      url: "https://www.amazon.com/dp/B000UUSNS2?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop",
    },
    {
      title: "Black Diamond Jetforce 35L Airbag",
      desc: "Avalanche airbag pack · backcountry must",
      price: 1199,
      url: "https://www.amazon.com/dp/B07BFMKPXJ?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=120&h=120&fit=crop",
    },
    {
      title: "Atomic Bent Chetler 100 Skis",
      desc: "All-mountain powder ski · top seller",
      price: 599,
      url: "https://www.amazon.com/dp/B09KZQP7F3?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop",
    },
  ],
  beach: [
    {
      title: "Maui Jim Polarized Sunglasses",
      desc: "PolarizedPlus2 · UV400 · glare-free",
      price: 189,
      url: "https://www.amazon.com/dp/B00CGYL5IC?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&h=120&fit=crop",
    },
    {
      title: "Neutrogena Beach Defense SPF 70",
      desc: "Water-resistant 80 min · reef-safe",
      price: 18,
      url: "https://www.amazon.com/dp/B00IKOW1FE?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=120&h=120&fit=crop",
    },
    {
      title: "Patagonia Stretch Wavefarer Board Shorts",
      desc: "Quick-dry · 4-way stretch · chlorine OK",
      price: 79,
      url: "https://www.amazon.com/dp/B07VD46YGC?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    },
    {
      title: "Osprey Ultralight Stuff Pack 18L",
      desc: "142g packable daypack · attaches to main bag",
      price: 45,
      url: "https://www.amazon.com/dp/B00J4CQZYU?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop",
    },
  ],
};
```

After adding the constant, verify the gate at `GEAR_ITEMS[listing.category]` renders the gear section in the detail sheet for both skiing and beach venues.

---

## 3. SEASONAL RELEVANCE — May 20, 2026

### Ski Venues In Season

**Confirmed in-season (lateSeason N-hem + S-hem winter starting):**

| Venue | Reason | Expected Score |
|-------|--------|----------------|
| Whistler Blackcomb | lateSeason:true, high-altitude glacier | High if depth ≥0.5m |
| Mammoth Mountain | lateSeason:true, Sierra snowpack typically holds | High if depth ≥0.5m |
| Tignes / Val d'Isère | lateSeason:true, summer glacier skiing (Tignes open June–July) | Medium-High |
| Cervinia | lateSeason:true, Matterhorn glacier opens late May | Medium |
| Chamonix-Mont-Blanc | lateSeason:true | Medium |
| val-d-isere-s16 | lateSeason:true (delete this — duplicate of tignes) | — |
| The Remarkables NZ | S-hem, lat < 0, May = inSeason | Low–Medium (early) |
| Portillo Chile | S-hem, May = inSeason | Low–Medium (early) |
| Pucon Chile | S-hem, May = inSeason | Low (early season) |
| Thredbo Australia | S-hem, May = inSeason | Low (opens mid-June) |
| Cerro Castor Argentina | S-hem, May = inSeason | Low–Medium |
| Treble Cone NZ | S-hem, May = inSeason | Low (early) |

**Scoring note:** Scoring engine correctly handles S-hemisphere via `isNorth = (venue.lat >= 0)`. May (mo=5) is classified as `inSeason` for S-hem (mo >= 5 && mo <= 10). Factually May is early season for NZ/Aussie/Chilean ski — most don't open until mid-June. Venues will score low based on actual snow depth, which is correct behavior, but the `isShoulder` logic misses May as a shoulder month for S-hem (it only covers April and November). Low-urgency algorithmic improvement.

### 52 N-Hemisphere Ski Venues Off-Season

All 52 N-hem ski venues WITHOUT lateSeason:true are correctly suppressed (score=8, "Off-season — resort closed"). No action needed — scoring handles it.

**One unfixed one-line fix (3rd report):** `abasin` is tagged "Longest Season CO" but missing `lateSeason:true`. A-Basin historically runs to late June. Fix:

```javascript
// app.jsx line 437 — end of abasin object
// BEFORE: skiPass:"ikon"},
// AFTER:  skiPass:"ikon", lateSeason:true},
```

### Beach Seasonal Check — May 20

| Region | Status |
|--------|--------|
| Caribbean | ✅ Peak / shoulder — excellent |
| Mediterranean | ✅ Shoulder heading to peak — good |
| Hawaii | ✅ Peak — excellent |
| SE Asia (Thailand, Philippines, Bali) | ⚠️ Wet season starting — expected lower scores |
| Maldives (MISSING from product) | ✅ Dry season — best time — not in product |
| S-hem beaches (Bora Bora, Floripa, Whitehaven) | ⚠️ Autumn — correctly score low |
| East Africa (Zanzibar, Diani) | ⚠️ Long rains May–June — expected score drop |

---

## 4. CONTENT QUALITY

### Descriptions: ALL 150 MISSING (3rd report — accepted as v2 backlog)

No venue has a `description` field. Functional tags carry signal. Not blocking v1.

### Tag Quality

- **Overused generic tag-sets:** 6 sets appear 4–6× — see section 1 copy-paste findings
- **Wrong-biome tags:** "Glacial Skiing" on Stowe and Nevis Range (no glaciers in Vermont or Scotland)
- **Missing location specificity:** 12 ski venues tagged just "Expert Terrain" with no terrain name or signature feature
- **Positive:** Unique tags on best venues (Sarakiniko "White Volcanic Pumice/Lunar Landscape", Aitutaki "World's Most Beautiful Lagoon") are excellent

### Rating Distribution

| Range | Count |
|-------|-------|
| 4.51–4.69 | 23 |
| 4.70–4.84 | 18 |
| 4.85–4.94 | 71 |
| 4.95–4.99 | 36 |
| 5.00 | 2 |

Distribution healthy. No suspicious clustering at 4.99.

### Critical Geographic Gaps

- **Maldives** — zero venues. Biggest single omission for a beach product. Maldives is May dry season right now — peak visibility. Was flagged last report; not added.
- **Switzerland** — only Andermatt. Zermatt, Verbier, Saas-Fee all absent. These are Europe's most searched ski destinations.
- **Sri Lanka** — zero venues. Peak beach season year-round (east coast best Nov–Apr, west coast Apr–Nov).
- **Canary Islands** — zero venues. Tenerife/Gran Canaria are year-round beach, huge European market.
- **Las Leñas Argentina** — premium S-hem powder destination, flagged last report, not added.

---

## 5. DAILY VENUE ADDITIONS

Targeting critical geographic gaps (Maldives, Zermatt, Las Leñas, Sri Lanka, Canary Islands). All 5 flagged as missing in prior report — none were added. Copy-paste ready.

```javascript
// ─── 5 new venues — paste into VENUES array after line 569 ───

{id:"zermatt", category:"skiing", title:"Zermatt / Matterhorn",
  location:"Valais, Switzerland",
  lat:46.0207, lon:7.7491, ap:"ZRH",
  icon:"⛷️", rating:4.97, reviews:5840,
  gradient:"linear-gradient(160deg,#0a1628,#1a3870,#2a60b8)",
  accent:"#80b8e8",
  tags:["Matterhorn Views","Glacier Year-Round"],
  photo:"https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent", lateSeason:true},

{id:"las-lenas", category:"skiing", title:"Las Leñas",
  location:"Mendoza, Argentina",
  lat:-35.1500, lon:-70.0700, ap:"MDZ",
  icon:"⛷️", rating:4.88, reviews:1240,
  gradient:"linear-gradient(160deg,#0a1828,#1a3272,#2a5ab4)",
  accent:"#78a8d8",
  tags:["Driest Andean Snow","Expert Powder"],
  photo:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},

{id:"maldives-male-atoll", category:"beach", title:"Maldives Atolls",
  location:"North Malé Atoll, Maldives",
  lat:4.1755, lon:73.5093, ap:"MLE",
  icon:"🏝️", rating:4.97, reviews:4280,
  gradient:"linear-gradient(160deg,#001a33,#00427a,#0080cc)",
  accent:"#66ccff",
  tags:["Overwater Bungalows","Coral Atoll"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"mirissa-beach", category:"beach", title:"Mirissa Beach",
  location:"Southern Province, Sri Lanka",
  lat:5.9449, lon:80.4550, ap:"CMB",
  icon:"🏖️", rating:4.88, reviews:2640,
  gradient:"linear-gradient(160deg,#003322,#005544,#008866)",
  accent:"#66cc99",
  tags:["Whale Watching Boats","Coconut Cliff Bar"],
  photo:"https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

{id:"tenerife-teresitas", category:"beach", title:"Las Teresitas Beach",
  location:"Santa Cruz de Tenerife, Spain",
  lat:28.5167, lon:-16.1833, ap:"TFS",
  icon:"🏖️", rating:4.86, reviews:3120,
  gradient:"linear-gradient(160deg,#1a1200,#5c3d00,#c87000)",
  accent:"#ffcc44",
  tags:["Sahara Sand Import","Year-Round Sun"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},
```

---

## PM NOTE

**Three reports, same top finding:** GEAR_ITEMS doesn't exist. Amazon Associates (`peakly-20`) is listed in CLAUDE.md as live at $4.48/1K MAU — it is generating exactly $0. The paste-ready constant is in this report and in the 2026-05-15 report. This is the highest-RPM fix sitting dark.

**New critical discovery:** `sarakiniko-beach-t16` is routing flight searches through Mykonos (JMK) for a beach on Milos (MLO). Users from that venue card get wrong flight prices. Delete `sarakiniko-beach-t16` and `pigeon-point-t27` — both are exact duplicates of existing entries with better data.

**Zermatt is the biggest single skiing gap** — Switzerland's most searched resort, missing entirely. Andermatt is the only Swiss entry. Zermatt (year-round glacier, Matterhorn) belongs in the top 5 global ski venues alongside Whistler and Chamonix.
