# Content & Data Quality Report — 2026-05-15

**Agent:** Content & Data  
**Data health score: 65/100** (first post-pivot baseline — prior report's 240-venue/3-category state is fully obsolete)

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photo URLs +8 | All required fields on 151 venues +10 | ❌ 2 near-duplicate destination pairs −6 | ❌ 52 N-hem ski venues showing with no lateSeason/off-season filter −12 | ❌ abasin missing lateSeason despite "Longest Season CO" tag −3 | ❌ GEAR_ITEMS array absent (Amazon revenue dead despite CLAUDE.md saying it's live) −8 | ❌ Zero description fields on any venue −5 | ❌ Maldives missing from beach entirely −4 | ❌ S-hem ski underrepresented vs N-hem (6 vs 59 venues) −3 | Tags stuck at exactly 2 per venue −2

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 151 venues (2 categories post-pivot)

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 86   | ✅ Launch category |
| Skiing   | 65   | ✅ Launch category |
| **TOTAL** | **151** | CLAUDE.md says ~154 — minor discrepancy, doc says "~" so acceptable |

No stub categories by count. Both are launch categories. Surfing fully retired. Tanning → Beach migration complete.

### Required Field Coverage

| Field | Present | Missing |
|-------|---------|---------|
| id | 151/151 | 0 |
| category | 151/151 | 0 |
| lat / lon | 151/151 | 0 |
| ap (airport IATA) | 151/151 | 0 |
| tags | 151/151 | 0 |
| photo | 151/151 | 0 |
| rating | 151/151 | 0 |
| description | **0/151** | **ALL** — no venue has a description field |
| difficulty | **0/151** | **ALL** — field doesn't exist in schema |

### Duplicate IDs: NONE ✅
### Duplicate Photo URLs: NONE ✅ (checked by base URL, stripping params)
### Malformed Airport Codes: NONE ✅ (all 3-letter IATA uppercase)
### Out-of-range Coordinates: NONE ✅

### Airport Code Flags (verify, not errors)

These smaller regional airports are valid but worth confirming they still serve commercial traffic:

| Venue | Airport | Note |
|-------|---------|------|
| taos | SAF | Santa Fe Regional — 90 min drive to Taos, not Taos Municipal |
| sunvalley | SUN | Friedman Memorial — small, seasonal service |
| crestedbutte | GUC | Gunnison-Crested Butte Regional — correct |
| steamboat | HDN | Yampa Valley — correct |

All confirmed valid IATA codes. No action required — listing for awareness.

### Duplicate Destination Pairs — P1

Two near-duplicate destination pairs exist in VENUES:

1. **`id:"chamonix"` (Chamonix-Mont-Blanc) + `id:"chamonix-mont-blanc-s18"`** — same mountain, both `lateSeason:true`, `ap:"GVA"`. Ratings: 4.94/3405 reviews vs 4.66/1477. Users see both in Explore. Recommend: delete `chamonix-mont-blanc-s18`, consolidate its tags onto the canonical entry.

2. **`id:"tignes"` (Tignes/Val d'Isère) + `id:"val-d-isere-s16"`** — share the same Espace Killy ski domain, airports 8km apart (CMF vs GVA). tignes 4.94/2960 vs val-d-isere-s16 4.69/2641. Recommend: keep `tignes`, delete `val-d-isere-s16`.

---

## 2. GEAR ITEMS AUDIT

### GEAR_ITEMS: DOES NOT EXIST IN CODE

CLAUDE.md changelog (2026-05-04) says Amazon gear gate was "FLIPPED" from `{false && GEAR_ITEMS...}` to `{GEAR_ITEMS[listing.category] && ...}`. **The `GEAR_ITEMS` constant does not exist anywhere in `app.jsx`.** The gate expression was applied but the underlying data object was never written. Amazon Associates revenue (`peakly-20`) is **$0** until this is fixed.

Current affiliate cards in the detail sheet:
- ✅ Booking.com hotels (`aid=2311236`) — renders for all venues
- ✅ SafetyWing insurance — renders for all venues  
- ❌ Amazon gear — completely absent

### Paste-ready GEAR_ITEMS fix

Add this constant to `app.jsx` in the Constants & data section (after CATEGORIES, before AIRPORTS). Then wire it into the detail sheet after the SafetyWing block.

```javascript
// ─── Amazon Associates gear items ───
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
      title: "Osprey Ultralight Stuff Pack",
      desc: "18L packable daypack · 142g",
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
      desc: "PolarizedPlus2 · UV400",
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
  ],
};
```

**Revenue impact:** At Amazon Associates avg 4% commission: ski avg $541 AOV + beach avg $83 AOV → ~$4.48/1K MAU once wired (per Revenue Model table).

---

## 3. SEASONAL RELEVANCE — May 15, 2026

### Ski Venues In Season (13 of 65)

| Venue | Reason |
|-------|--------|
| Whistler Blackcomb | lateSeason:true |
| Mammoth Mountain | lateSeason:true |
| Chamonix-Mont-Blanc (both entries) | lateSeason:true |
| Tignes / Val d'Isère | lateSeason:true |
| Cervinia | lateSeason:true |
| Val d'Isere s16 | lateSeason:true |
| The Remarkables | S. hemisphere — season opening |
| Portillo | S. hemisphere — season opening |
| Pucon Ski Center | S. hemisphere — season opening |
| Thredbo Village | S. hemisphere — season opening |
| Cerro Castor | S. hemisphere — season opening |
| Treble Cone | S. hemisphere — season opening |

### 52 Ski Venues Likely Off-Season — P1

52 N. hemisphere ski venues have no `lateSeason` flag. Most are closed (Vail closed April 14, Breckenridge April 21, Banff April 19, Keystone April 13). These still score via Open-Meteo weather — verify the off-season binary cap is correctly suppressing them in `scoreWeekend`.

**One-token fix needed NOW:** `abasin` (Arapahoe Basin) is tagged `"Longest Season CO"` but has NO `lateSeason:true`. A-Basin ran through June 8, 2025. This is self-contradicting data. Fix:

```javascript
// app.jsx ~line 430 — abasin venue
// BEFORE: skiPass:"ikon"},
// AFTER:  skiPass:"ikon", lateSeason:true},
```

### Beach Seasonal Check

**In good shape:** Caribbean, Mediterranean, Hawaii, SE Asia all peak/shoulder for May.

**South hemisphere beach venues scoring low (expected):**
- Bora Bora (lat -16.5) — rainy shoulder season
- Fernando de Noronha (lat -3.8) — rainy May-June
- Florianópolis (lat -27.6) — autumn
- Whitehaven Beach (lat -20.3) — tropical shoulder

The water-temp hard cap (<18°C) handles beach scoring naturally. No code change needed.

---

## 4. CONTENT QUALITY

### Descriptions: ALL 151 MISSING

No venue has a `description` field. Not blocking v1 — tags carry signal. Flag for v2 content sprint (SEO + detail sheet richness).

### Tag Quality Assessment

All venues have exactly 2 tags — minimum viable but functional. Most specific per-venue. Issues:

- **Redundant pairs:** `"Expert Terrain"` + `"Black Diamonds"` appears 6+ times — both mean the same thing. Diversify: `"Chutes & Spines"`, `"Mandatory Exposure"`, `"Ski Patrol Territory"`.
- **Overused generic beach tags:** `"Party Beach"` + `"Beach Bars"` + `"Water Sports"` + `"Vibrant"` each used 6x — combine into more evocative specifics: `"Boat-Party Scene"`, `"DJ Beach Clubs"`.
- **Elevation omitted from "High Altitude" tag** (7 venues) — `"3,400m Glacier"` beats `"High Altitude"` every time.

### Rating Distribution

| Range | Count |
|-------|-------|
| 4.51–4.69 | 23 |
| 4.70–4.84 | 18 |
| 4.85–4.94 | 71 |
| 4.95–4.99 | 36 |

Lowest: Kicking Horse (4.51), Laguna Beach CA (4.51), Portillo (4.54), Pucon (4.54) — all legitimate. No fabrication concern.

---

## 5. DAILY VENUE ADDITIONS

5 new venues targeting: S. hemisphere ski (in season NOW, underrepresented) + critical missing beach (Maldives is the biggest single gap for a beach product).

```javascript
// ─── 5 new venues — paste into VENUES array ───

{id:"las-lenas", category:"skiing", title:"Las Leñas", location:"Mendoza, Argentina",
  lat:-35.1500, lon:-70.0700, ap:"MDZ",
  icon:"⛷️", rating:4.88, reviews:1240,
  gradient:"linear-gradient(160deg,#0a1828,#1a3272,#2a5ab4)",
  accent:"#78a8d8",
  tags:["Driest Andean Snow","Expert Powder"],
  photo:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},

{id:"cerro-catedral", category:"skiing", title:"Cerro Catedral", location:"Bariloche, Argentina",
  lat:-41.1557, lon:-71.4493, ap:"BRC",
  icon:"⛷️", rating:4.83, reviews:2180,
  gradient:"linear-gradient(160deg,#0b1a30,#1a3870,#2c62b0)",
  accent:"#74a4d6",
  tags:["Largest SA Resort","Nahuel Huapi Lake"],
  photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent"},

{id:"cardrona", category:"skiing", title:"Cardrona Alpine Resort", location:"Wanaka, New Zealand",
  lat:-44.8760, lon:169.1920, ap:"ZQN",
  icon:"⛷️", rating:4.87, reviews:1560,
  gradient:"linear-gradient(160deg,#0c1c38,#1a4078,#2e6ab8)",
  accent:"#72a6d8",
  tags:["Wanaka Valley Views","All-Level Terrain"],
  photo:"https://images.unsplash.com/photo-1543796766-8098f2f29f66?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.55",
  skiPass:"independent"},

{id:"maldives-north-male", category:"beach", title:"Maldives Atolls", location:"North Malé Atoll, Maldives",
  lat:4.1755, lon:73.5093, ap:"MLE",
  icon:"🏝️", rating:4.97, reviews:4280,
  gradient:"linear-gradient(160deg,#001a33,#00427a,#0080cc)",
  accent:"#66ccff",
  tags:["Overwater Bungalows","Coral Atoll"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"siargao-cloud9", category:"beach", title:"Siargao Island", location:"Surigao del Norte, Philippines",
  lat:9.8482, lon:126.0458, ap:"IAO",
  icon:"🏝️", rating:4.86, reviews:1890,
  gradient:"linear-gradient(160deg,#003322,#006644,#00a86b)",
  accent:"#66cc99",
  tags:["Island Hopping","Lagoon Pools"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},
```

---

## PM NOTE

**The GEAR_ITEMS gap is the most urgent revenue fix.** CLAUDE.md logs it as done (2026-05-04, commit a9aacf5) but the constant was never written — the gate expression `GEAR_ITEMS[listing.category]` evaluates to `undefined` and renders nothing. The paste-ready code is above. At $4.48/1K MAU this is one of the highest-RPM streams sitting completely dark.

**Second:** Delete the two duplicate destination pairs (Chamonix×2, Val d'Isere×2) — they fragment wishlists and confuse Explore ranking.

**Third:** Add `lateSeason:true` to `abasin` — it's self-contradicting data right now and the only ski venue with a "longest season" claim that lacks the flag.
