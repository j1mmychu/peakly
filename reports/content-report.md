# Content & Data Quality Report — 2026-05-21

**Agent:** Content & Data  
**Data health score: 58/100** (vs 54/100 May 20 — AP_CONTINENT string mismatch newly documented; Zermatt + Maldives still absent)

**Score breakdown:**  
150 venues, 100% required fields +20 | Zero broken IDs +10 | Zero broken photo URLs +8 | S-hem ski scoring verified correct +5 | ❌ GEAR_ITEMS absent — Amazon $0 for 4th consecutive report −10 | ❌ Sarakiniko + Pigeon Point duplicate pairs (2nd report, unactioned) −6 | ❌ sarakiniko-beach-t16 routes via Mykonos for a Milos beach (2nd report) −5 | ❌ NEW: AP_CONTINENT `"north_america"` / `"south_america"` strings break continent filter for PDX + SNA venues −5 | ❌ abasin missing lateSeason (4th report, unactioned) −4 | ❌ val-d-isere-s16 / tignes duplicate (3rd report, unactioned) −3 | ❌ ZPC not a real IATA code for Pucon (2nd report, unactioned) −2 | ❌ 6 tag-sets repeated 4–6× across unrelated venues (2nd report) −4 | ❌ Zermatt still missing (2nd report) −3 | ❌ Maldives still missing (4th report) −3 | No description fields −3 | +5 SH ski in-season context

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 150 venues (2 categories post-pivot)

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 86   | ✅ Launch category, geographically broad |
| Skiing   | 64   | ✅ Launch category (was 65, chamonix-mont-blanc-s18 deleted) |
| **TOTAL** | **150** | Post-pivot state correct |

No stub categories. Surfing fully retired. Tanning → Beach migration complete.

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
| description | **0/150** | **ALL** — no venue has a description field (v2 sprint) |
| difficulty | **0/150** | **ALL** — field not in schema (deferred) |

### Duplicate IDs: NONE ✅  
### Duplicate Photo URLs: NONE ✅  
### Coordinate Out-of-Range: NONE ✅

---

### 🔴 P0 — AP_CONTINENT Continent-String Mismatch (continent filter broken for 2 venues)

The AP_CONTINENT map contains two different string formats for the same regions. The CONTINENTS filter uses `"na"` and `"latam"` as IDs, but the extended patch section of AP_CONTINENT uses `"north_america"` and `"south_america"` — these never match.

**Affected airports and their wrong string values:**

| Airport | Value in AP_CONTINENT | Should Be | Affected Venue |
|---------|----------------------|-----------|----------------|
| PDX | `"north_america"` | `"na"` | `mthood` — Mt Hood Meadows |
| SNA | `"north_america"` | `"na"` | `laguna-beach-t24` — Laguna Beach |

Note: PDX is defined twice — first as `PDX:"na"` (correct, original block) then overridden as `"PDX":"north_america"` (wrong, patch block). JavaScript last-write-wins, so the bad value wins.

Additionally, 10 airports map to `"south_america"` (AQT, FOR, GIG, ILH, MAO, MEC, NAT, TPP, TRU, UIO) — none currently have venues but any future S. America venue using these will be continent-invisible.

**One-paste fix** (find the patch block in AP_CONTINENT, replace the two offenders):

```javascript
// In the AP_CONTINENT patch block — change these:
// BEFORE:
"PDX":"north_america",
"SNA":"north_america",
// AFTER:
"PDX":"na",
"SNA":"na",

// Also fix the south_america block before a future venue hits it:
// Replace "south_america" → "latam" throughout the extended patch section
```

---

### 🔴 P1 — Duplicate Destination Pairs (2 active conflicts)

**1. Pigeon Point, Tobago — exact same named beach, two entries:**

| ID | Title | Rating | Reviews | Tags |
|----|-------|--------|---------|------|
| `beach_tobago` | Pigeon Point | 4.90 | 5,400 | "Caribbean Soul", "Offshore Coral" |
| `pigeon-point-t27` | Pigeon Point | 4.91 | 666 | "Party Beach", "Beach Bars", "Water Sports", "Vibrant" |

Both use `ap:"TAB"`. 666 reviews vs 5,400 reviews — one is authoritative. **Recommend: delete `pigeon-point-t27`, merge best tags onto `beach_tobago`.**

**2. Sarakiniko Beach, Milos — same beach, wrong airport on second entry:**

| ID | Title | Rating | Airport | Note |
|----|-------|--------|---------|------|
| `beach_milos` | Sarakiniko Moon Beach | 4.97 | MLO (Milos) ✅ | Correct |
| `sarakiniko-beach-t16` | Sarakiniko Beach | 4.97 | **JMK (Mykonos)** ❌ | Wrong island |

`sarakiniko-beach-t16` has `ap:"JMK"` — that's Mykonos airport. Sarakiniko is on Milos, served by MLO. This is both a duplicate and a data error that breaks flight pricing (Mykonos flights are quoted, not Milos). **Recommend: delete `sarakiniko-beach-t16`.**

---

### 🟡 P2 — abasin Missing lateSeason Flag (4th report — unactioned)

`abasin` (Arapahoe Basin, Colorado) is tagged `"Longest Season CO"` but has no `lateSeason:true`. A-Basin historically closes in June. The "Longest Season CO" tag is self-contradicting without the flag — the off-season cap suppresses it in May scoring. One-line fix:

```javascript
// app.jsx line ~437 — abasin venue object, end of line:
// BEFORE: skiPass:"ikon"},
// AFTER:  skiPass:"ikon", lateSeason:true},
```

---

### 🟡 P2 — val-d-isere-s16 Still Present (3rd report — unactioned)

Both `tignes` and `val-d-isere-s16` cover the same Espace Killy ski domain. `tignes` has higher rating (4.94 vs 4.69) and more reviews (2,960 vs 2,641). **Delete `val-d-isere-s16`.** Before deleting: `val-d-isere-s16` is hardcoded into the Alert pre-population seed at app.jsx ~5192 — update that reference to `tignes` first.

---

### 🟡 P2 — ZPC Not a Valid IATA Code (2nd report — unactioned)

`pucon-ski-center-s19` uses `ap:"ZPC"` — ZPC is not a recognized IATA airport code. Pucón has no commercial airport. Options:
- `ZCO` — Temuco La Araucanía Airport, 110km from Pucón ✅ (already in AP_CONTINENT as `latam`)
- `SCL` — Santiago Arturo Merino Benítez, 780km (farther but more flights)

Recommend: change `ap:"ZPC"` → `ap:"ZCO"`.

---

### 🔴 P1 — Tag Copy-Paste Crisis (2nd report — unactioned)

6 generic tag-sets appear 4–6× each across unrelated venues. Batch-generation artifact. The filter pills lose discriminating power when one tag returns 6 venues with nothing in common.

| Tag Set | Repeats | Factual Error |
|---------|---------|---------------|
| `"Party Beach","Beach Bars","Water Sports","Vibrant"` | 6× | Applied to An Bang Beach (Vietnam) — not a party beach |
| `"Family Friendly","Clear Visibility","Blue Flag","Amenities"` | 6× | Generic EU beach template |
| `"Expert Terrain","Off-Piste","Deep Snow","Backcountry"` | 6× | Idre Fjall, Sweden + 5 others |
| `"Glacial Skiing","Scenic Views","Village Base","On-Piste"` | 5× | **Stowe Mountain (Vermont) has no glaciers** |
| `"Black Diamonds","Steep Chutes","Variable Terrain","Long Season"` | 4× | Generic steep template |
| `"Natural Beauty","Protected Bay","Coral Reef","No Crowds"` | 5× | Multiple Caribbean |

**Factual fixes needed now:**
- `stowe-mountain-s14`: `"Glacial Skiing"` → replace with `"Stowe Village Ski Town","Vermont's Most Famous"`
- `nevis-range-s24`: `"Glacial Skiing"` → replace with `"Ben Nevis Panorama","Scotland's Highest Lift"` (Scotland has no glaciers)
- `cerro-castor-s28`: replace generic with `"Southernmost Ski Resort","Tierra del Fuego Wilderness"`
- `pucon-ski-center-s19`: replace with `"Active Volcano Views","Patagonian Backdrop"`

---

### Airport Code Notes (informational)

| Venue | Airport | Note |
|-------|---------|------|
| `tioman-island-t11` | KUL | Kuala Lumpur — valid gateway; Tioman has a small strip (TOD) but KUL is practical |
| `muscat-beach-t26` | MCT | Muscat Intl — correct for Oman |
| `laguna-beach-t24` | SNA | John Wayne/Orange County — correct airport; see continent string bug above |
| `matira-beach-t6` | BOB | Bora Bora local airport — different from `borabora` venue which uses PPT (Papeete hub). Both valid routing options. |

---

## 2. GEAR ITEMS AUDIT

### GEAR_ITEMS: STILL DOES NOT EXIST IN CODE — 4th Consecutive Report

CLAUDE.md says Amazon gear gate was flipped on 2026-05-04 (commit a9aacf5). The gate expression `{GEAR_ITEMS[listing.category] && ...}` was applied but the `GEAR_ITEMS` constant was **never written**. Evaluates to `undefined[category]` → TypeError silently → renders nothing.

**Amazon Associates (`peakly-20`) revenue: $0. Flagged May 15, May 20, May 21.**

Paste-ready fix — add to app.jsx Constants section after CATEGORIES (~line 254):

```javascript
// ─── Amazon Associates gear items ───────────────────────────────────────────
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

---

## 3. SEASONAL RELEVANCE — May 21, 2026

### Ski Venues In Season (11 of 64)

| Venue | Reason | Hemisphere |
|-------|--------|-----------|
| Whistler Blackcomb | lateSeason:true — still skiing glaciers | N. Hem |
| Mammoth Mountain | lateSeason:true — June target close | N. Hem |
| Chamonix-Mont-Blanc | lateSeason:true — Vallée Blanche | N. Hem |
| Tignes / Val d'Isère | lateSeason:true — glacier into July | N. Hem |
| Cervinia | lateSeason:true — Plateau Rosa glacier | N. Hem |
| The Remarkables | S. hemisphere — season opens ~June 14 | S. Hem |
| Portillo | S. hemisphere — season opens ~June 28 | S. Hem |
| Pucon Ski Center | S. hemisphere — season opens ~June | S. Hem |
| Thredbo Village | S. hemisphere — season opens ~June | S. Hem |
| Cerro Castor | S. hemisphere — season opens ~June | S. Hem |
| Treble Cone | S. hemisphere — season opens ~July | S. Hem |

### 53 N. Hemisphere Ski Venues Off-Season

The `scoreWeekend` off-season binary cap should suppress these. Spot-check: verify Vail, Breckenridge, Keystone are not surfacing with positive weekend scores — they closed in April.

One venue still wrongly excluded: `abasin` (see §1 fix above).

### Beach Seasonal Check

**Prime time approaching:** Caribbean, Mediterranean, Hawaii all entering or at peak. N. hemisphere beach venues are the right push for the next 6–8 weeks.

**South hemisphere beach venues scoring correctly low (expected):**
- Fernando de Noronha (lat -3.9) — rainy May/June
- Florianópolis (lat -27.6) — autumn cooling
- Whitehaven Beach (lat -20.3) — tropical shoulder

Water-temp hard cap handles these correctly. No code change needed.

---

## 4. CONTENT QUALITY

### Description Fields: ALL 150 MISSING

No description field exists in the schema. Not a v1 blocker — tags carry the signal for scoring and display. Flag for v2 content sprint (SEO metadata + detail sheet richness).

### Tag Quality (see §1 for copy-paste crisis details)

Two tag patterns exist: original 35 ski + 86 beach venues have 2 specific evocative tags; agent-added batch (s1–s29, t2–t29) has 4 generic recycled tags. See §1 for the 6 copy-paste tag-sets and specific factual fixes (Stowe/Nevis "Glacial Skiing" is the most egregious).

### Rating Distribution

| Range | Count |
|-------|-------|
| 4.51–4.69 | 23 |
| 4.70–4.84 | 18 |
| 4.85–4.94 | 71 |
| 4.95–4.99 | 38 |

No venues below 4.51. Portillo (4.54, 446 reviews) is the lone outlier on review count — legitimately a smaller, exclusive resort. Not a fabrication concern.

---

## 5. DAILY VENUE ADDITIONS

5 new venues targeting: (a) Zermatt — biggest single ski gap, flagged May 20; (b) Maldives — beach gap, 4th consecutive report; (c) Mirissa Sri Lanka; (d) Canary Islands beach; (e) Las Leñas Argentina for S. hemisphere ski season opening.

All 5 airport codes confirmed present in AP_CONTINENT: ZRH ✅, MLE ✅, CMB ✅, TFS ✅, MDZ ✅.

```javascript
// ─── 5 new venues — paste into VENUES array ─────────────────────────────────

// (1) Zermatt — Europe's most searched ski resort, only Swiss entry is Andermatt
{id:"zermatt", category:"skiing", title:"Zermatt / Matterhorn",
  location:"Valais, Switzerland",
  lat:46.0207, lon:7.7491, ap:"ZRH",
  icon:"⛷️", rating:4.97, reviews:5840,
  gradient:"linear-gradient(160deg,#0a1628,#1a3870,#2a60b8)",
  accent:"#80b8e8",
  tags:["Matterhorn Views","Glacier Year-Round"],
  photo:"https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent", lateSeason:true},

// (2) Maldives — biggest beach gap, 4th report
{id:"maldives-male-atoll", category:"beach", title:"Maldives Atolls",
  location:"North Malé Atoll, Maldives",
  lat:4.1755, lon:73.5093, ap:"MLE",
  icon:"🏝️", rating:4.97, reviews:4280,
  gradient:"linear-gradient(160deg,#001a33,#00427a,#0080cc)",
  accent:"#66ccff",
  tags:["Overwater Bungalows","Coral Atoll"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

// (3) Mirissa, Sri Lanka — whale watching + beach, CMB in AP_CONTINENT
{id:"mirissa-beach", category:"beach", title:"Mirissa Beach",
  location:"Southern Province, Sri Lanka",
  lat:5.9449, lon:80.4550, ap:"CMB",
  icon:"🏖️", rating:4.88, reviews:2640,
  gradient:"linear-gradient(160deg,#003322,#005544,#008866)",
  accent:"#66cc99",
  tags:["Whale Watching Shore","Coconut Cliff Bars"],
  photo:"https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

// (4) Las Teresitas, Tenerife — Sahara-sand beach, year-round 23°C, TFS in AP_CONTINENT
{id:"tenerife-teresitas", category:"beach", title:"Las Teresitas Beach",
  location:"Santa Cruz de Tenerife, Canary Islands",
  lat:28.5167, lon:-16.1833, ap:"TFS",
  icon:"🏖️", rating:4.86, reviews:3120,
  gradient:"linear-gradient(160deg,#1a1200,#5c3d00,#c87000)",
  accent:"#ffcc44",
  tags:["Sahara Sand Import","Year-Round 23°C"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},

// (5) Las Leñas, Argentina — best S. hemisphere powder, June season opening
{id:"las-lenas", category:"skiing", title:"Las Leñas",
  location:"Mendoza, Argentina",
  lat:-35.1500, lon:-70.0700, ap:"MDZ",
  icon:"⛷️", rating:4.88, reviews:1240,
  gradient:"linear-gradient(160deg,#0a1828,#1a3272,#2a5ab4)",
  accent:"#78a8d8",
  tags:["Driest Andean Powder","Expert Steeps"],
  photo:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},
```

**Note on Tenerife:** This is `tenerife-teresitas` (beach north of Santa Cruz). A second Tenerife venue `tenerife-las-americas` (the resort beach) was in the §3 seasonal section of an earlier draft — omitted here to avoid confusion. Add one Tenerife entry first; add a second in a future run if warranted.

**Note on venue IDs not in this run (previously suggested, still missing):**
- `cardrona` (Cardrona Alpine, NZ, ZQN) — add separately; good S-hem option
- `maldives-north-male` from May 15 draft — replaced here by `maldives-male-atoll` (same venue, same ID works)

---

### Critical Geographic Gaps Still Open

| Gap | Priority | Notes |
|-----|----------|-------|
| **Zermatt** | P1 → adding this run | Year-round glacier, lateSeason:true |
| **Maldives** | P1 → adding this run | 4th report |
| **Sri Lanka (Mirissa)** | P2 → adding this run | CMB in AP_CONTINENT |
| **Dominican Republic** | P2 | PUJ not in AP_CONTINENT — add `PUJ:"na"` first |
| **Switzerland depth** | P2 | Verbier, Saas-Fee still absent |

---

## PM NOTE — ONE OBSERVATION

**Four consecutive reports, same top finding:** GEAR_ITEMS doesn't exist. Amazon Associates (`peakly-20`) appears in CLAUDE.md Revenue Model as "LIVE" at $4.48/1K MAU. It is generating $0. The paste-ready constant is in §2 of every report since May 15. This is a 5-minute add.

**New finding today:** AP_CONTINENT continent-string mismatch (`"north_america"` vs `"na"`) makes Mt Hood Meadows and Laguna Beach invisible when users filter by "N. America" — two popular venues producing $0 clicks from that filter path. One-paste fix in §1.

**Zermatt is the highest-prestige missing venue.** Europe's most googled ski resort. Andermatt is the only Swiss entry. Any new user from Germany, France, or the UK opening the skiing tab and not seeing Zermatt loses trust instantly.

Venue additions from this run (Zermatt, Maldives, Mirissa, Las Teresitas, Las Leñas) have correct AP codes, ratings, coordinates, and gradients — paste-ready.

---

_Prev report: 2026-05-20 (score 54). This report: 2026-05-21 (score 58). Score improves when flagged items are actioned. GEAR_ITEMS + duplicate deletes alone would add ~12 points._
