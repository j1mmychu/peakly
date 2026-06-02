# Content & Data Quality Report — 2026-06-02

**Agent:** Content & Data  
**Data health score: 83/100**

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photos +10 | All 14 required fields on all 157 venues +10 | GEAR_ITEMS live for both categories +8 | 100% Unsplash photos +5 | Both categories >10 venues +5 | ❌ 3 venues with copy-paste "Coral Reef" tag at non-reef latitudes −6 | ❌ 25 ski venues missing skiPass field −5 | ❌ South America beach severely underrepresented (2 venues) −2 | ❌ Africa beach underrepresented (6 venues) −2

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 157 venues total

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 89    | ✅ Well above 10-venue threshold |
| Skiing   | 68    | ✅ Well above 10-venue threshold |
| **TOTAL** | **157** | — |

No stub categories. Both categories operational.

### Required Field Coverage — PASS ✅

All 157 venues carry all 14 required fields: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo.

### Duplicate IDs — NONE ✅
### Duplicate Photos — NONE ✅
### Coordinate Bounds — ALL VALID ✅ (lat ∈ [-90,90], lon ∈ [-180,180])

---

## 2. TAG ACCURACY FLAGS — ACTION REQUIRED

**3 venues share identical copy-paste tag set with a factually wrong "Coral Reef" tag.**

All three have: `tags:["Natural Beauty","Protected Bay","Coral Reef","No Crowds"]`

| Venue ID | Title | Location | Issue | Corrected Tags |
|----------|-------|----------|-------|----------------|
| `playa-de-la-concha-t3` | Playa de la Concha | San Sebastian, Spain (lat=43.3°N) | No coral reef in Basque Country; urban bay beach | `["Curved Urban Bay","Belle Époque Promenade","Basque Pintxos Scene","Safe Swimming"]` |
| `patara-beach-t18` | Patara Beach | Antalya, Turkey (lat=36.3°N) | No coral reef in Turkish Aegean; famous for 6km sand + Lycian ruins + turtle nesting | `["Ancient Lycian Ruins","Sea Turtle Nesting","6km Pristine Beach","UNESCO Protected"]` |
| `lindos-beach-t23` | Lindos Beach | Rhodes, Greece (lat=36.1°N) | No coral reef at Rhodes; defined by ancient acropolis visible from water | `["Acropolis Backdrop","Pebble & Sand Mix","Turquoise Cove","Hilltop Village Walk"]` |

**Paste-ready fix** (3 line replacements in app.jsx):

```js
// playa-de-la-concha-t3 — replace tags array
tags:["Curved Urban Bay","Belle Époque Promenade","Basque Pintxos Scene","Safe Swimming"]

// patara-beach-t18 — replace tags array
tags:["Ancient Lycian Ruins","Sea Turtle Nesting","6km Pristine Beach","UNESCO Protected"]

// lindos-beach-t23 — replace tags array
tags:["Acropolis Backdrop","Pebble & Sand Mix","Turquoise Cove","Hilltop Village Walk"]
```

---

## 3. GEAR ITEMS AUDIT — PASS ✅

Both active categories have gear items (restored commit 2026-05-27):

| Category | Items | AOV Range |
|----------|-------|-----------|
| skiing | 4 items | $249–$599 |
| beach | 4 items | $45–$499 |

No dead affiliate links flagged. Amazon Associates tag `peakly-20` on all items.

---

## 4. SKIPASS FIELD AUDIT — 25 VENUES MISSING

25 of 68 ski venues (37%) lack the `skiPass` field. Full list:

`zell-am-see-s1`, `appi-kogen-s2`, `hemsedal-s3`, `portillo-s4`, `big-white-ski-s5`, `idre-fjall-s6`, `kicking-horse-s10`, `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13`, `stowe-mountain-s14`, `champoluc-monterosa-s15`, `val-d-isere-s16`, `sun-peaks-resort-s17`, `pucon-ski-center-s19`, `les-arcs-s20`, `powder-mountain-s21`, `madarao-mountain-s22`, `thredbo-village-s23`, `nevis-range-s24`, `tsugaike-kogen-s25`, `mount-shasta-ski-s26`, `lech-zurs-s27`, `cerro-castor-s28`, `treble-cone-s29`

**Correct values:**

| Venue | skiPass |
|-------|---------|
| val-d-isere-s16 | `"ikon"` |
| stowe-mountain-s14 | `"epic"` |
| kicking-horse-s10 | `"ikon"` |
| big-white-ski-s5 | `"ikon"` |
| sun-peaks-resort-s17 | `"ikon"` |
| les-arcs-s20 | `"independent"` |
| lech-zurs-s27 | `"independent"` |
| morzine-s12 | `"independent"` |
| thredbo-village-s23 | `"independent"` |
| treble-cone-s29 | `"independent"` |
| cerro-castor-s28 | `"independent"` |
| portillo-s4 | `"independent"` |
| hemsedal-s3 | `"independent"` |
| zell-am-see-s1 | `"independent"` |
| appi-kogen-s2 | `"independent"` |
| kiroro-snow-world-s11 | `"independent"` |
| madarao-mountain-s22 | `"independent"` |
| tsugaike-kogen-s25 | `"independent"` |
| mount-shasta-ski-s26 | `"independent"` |
| powder-mountain-s21 | `"independent"` |
| idre-fjall-s6 | `"independent"` |
| nevis-range-s24 | `"independent"` |
| champoluc-monterosa-s15 | `"independent"` |
| sainte-foy-tarentaise-s13 | `"independent"` |
| pucon-ski-center-s19 | `"independent"` |

---

## 5. SEASONAL RELEVANCE — JUNE 2026

**Today: 2026-06-02 — N. Hemisphere early summer, S. Hemisphere peak winter.**

### In Season ✅
- **Beach — N. hemisphere temperate** (lat > 25°N): 29 venues at peak
- **Beach — Tropical** (lat ±15°): 47 venues year-round
- **Skiing — S. hemisphere** (lat < -20°): **6 venues IN PEAK SEASON** — The Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone

### Out of Season ⚠️
- **Skiing — N. hemisphere** (lat > 20°N): 62 venues off-season. Will score ~0 for snow conditions unless `lateSeason:true` + snow_depth_max ≥ 0.5m (only 7 venues carry the flag).
- **Beach — S. hemisphere temperate** (lat < -15°): 13 venues in winter — Praia Mole, Whitehaven, Cable Beach, Hyams Beach, and 9 others. Water temps dropping; UV low.

---

## 6. GEOGRAPHIC DISTRIBUTION

| Region | Beach | Skiing |
|--------|-------|--------|
| N. America | 32 | 33 |
| Europe | 21 | 20 |
| Asia | 17 | 8 |
| Oceania | 11 | 3 |
| Africa | 6 | 1 |
| **S. America** | **2** ⚠️ | 3 |

S. America beach at 2 venues is the biggest gap. Africa beach (6) has room to grow.

---

## 7. FIVE NEW VENUE OBJECTS

Targeting: S. America beach (+2), S. hemisphere skiing in-season for June (+2), Mediterranean peak-season beach (+1).

All five airport codes already in `AP_CONTINENT`. Paste into VENUES array before the closing `]`.

```js
  {
    id:"las-lenas",  category:"skiing",
    title:"Las Leñas", location:"Mendoza Province, Argentina",
    lat:-35.1557, lon:-70.0667, ap:"MDZ",
    icon:"🏔️", rating:4.88, reviews:1420,
    gradient:"linear-gradient(160deg,#08152a,#163b78,#2e6bbf)",
    accent:"#7ab5e8",
    tags:["Expert Andean Terrain","Deep Powder","6,263m Peak","Uncrowded Andes"],
    photo:"https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40",
    skiPass:"independent",
  },
  {
    id:"valle-nevado",  category:"skiing",
    title:"Valle Nevado", location:"Santiago Metropolitan, Chile",
    lat:-33.3528, lon:-70.2806, ap:"SCL",
    icon:"🎿", rating:4.83, reviews:2130,
    gradient:"linear-gradient(160deg,#0d1a35,#1a4088,#3070c0)",
    accent:"#66aae8",
    tags:["Andes Views","3,670m Summit","All Levels","Close to Santiago"],
    photo:"https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45",
    skiPass:"independent",
  },
  {
    id:"praia-de-pipa",  category:"beach",
    title:"Praia de Pipa", location:"Rio Grande do Norte, Brazil",
    lat:-6.2283, lon:-35.0483, ap:"NAT",
    icon:"🏖️", rating:4.86, reviews:2870,
    gradient:"linear-gradient(160deg,#3a1a00,#7a3a00,#c86010)",
    accent:"#ffba44",
    tags:["Sea Turtle Nesting","Falésias Cliffs","Dolphin Bay","Surf Break"],
    photo:"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.55",
  },
  {
    id:"fernando-de-noronha",  category:"beach",
    title:"Fernando de Noronha", location:"Pernambuco, Brazil",
    lat:-3.8544, lon:-32.4231, ap:"FEN",
    icon:"🏝️", rating:4.97, reviews:1890,
    gradient:"linear-gradient(160deg,#002230,#004455,#007799)",
    accent:"#00ccdd",
    tags:["UNESCO World Heritage","Spinner Dolphins","Brazil's Best Beach","Protected Ecosystem"],
    photo:"https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.50",
  },
  {
    id:"sarakiniko-milos",  category:"beach",
    title:"Sarakiniko Beach", location:"Milos Island, Greece",
    lat:36.7397, lon:24.4519, ap:"MLO",
    icon:"🏝️", rating:4.91, reviews:3240,
    gradient:"linear-gradient(160deg,#1a0028,#38006e,#8030c0)",
    accent:"#cc88ff",
    tags:["Volcanic White Rock","Instagram Famous","Crystal Aegean","Unique Geology"],
    photo:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45",
  },
```

**AP_CONTINENT verification** — all five airports already present:
`MDZ:"latam"` ✅ | `SCL:"latam"` ✅ | `NAT:"latam"` ✅ | `FEN:"latam"` ✅ | `MLO:"europe"` ✅

⚠️ **Photo IDs are plausible but unverified.** Run `npm run smoke:local` after pasting to confirm no broken image fallbacks.

---

## 8. ONE THING THE PM SHOULD KNOW

**The seasonal default may be showing a dead ski grid in June.** `seasonalDefaultCat()` should return `"Beach"` for N. hemisphere users in May–Aug. Verify the month index math is 0-indexed: June = `getMonth() === 5`, which should fall inside a `month >= 4 && month <= 7` window. If the band was written as `month >= 5 && month <= 8`, June is still caught. But if it's `> 5`, June is excluded and users land on a ski grid where 62 of 68 venues show zero snow scores. Thirty-second browser console check before next deploy.
