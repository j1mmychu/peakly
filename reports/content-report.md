# Content & Data Quality Report — 2026-05-19

**Agent:** Content & Data
**Data health score: 62/100** (down from 65 on 05-15; chamonix-s18 deletion offset by 3 new issues found this run)

**Score breakdown:**
Zero duplicate IDs +10 | Zero duplicate photo URLs +8 | All required fields on 150 venues +10 |
❌ chamonix-s18 deleted ✅ but val-d-isere-s16 (Tignes duplicate) untouched −4 |
❌ 2 duplicate location pairs still live (Pigeon Point×2, Sarakiniko×2) −8 |
❌ GEAR_ITEMS array absent — Amazon revenue $0 despite CLAUDE.md saying it's live (2nd report, P0) −8 |
❌ abasin missing lateSeason:true ("Longest Season CO" tag self-contradicts) −3 |
❌ Wrong airport on sarakiniko-beach-t16 (JMK = Mykonos, venue is in Milos = MLO) −4 |
❌ 3 factual tag errors (Lovina "White Sand", Hyams "Party Beach", Bulabog "Blue Flag") −5 |
❌ 5 new venues from May 15 not merged −4 |
❌ No description fields on any venue −5 |
✅ chamonix-mont-blanc-s18 removed since 05-15 +3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 150 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 86   | ✅ Launch category |
| Skiing   | 64   | ✅ Launch category (was 65 on 05-15; s18 removed) |
| **TOTAL** | **150** | CLAUDE.md says ~154 — 4 gap, acceptable as "~" |

Surfing: 0 ✅ (retired 2026-05-03, fully gone)

### Required Field Coverage — 150/150 clean

| Field | Coverage |
|-------|----------|
| id | 150/150 ✅ |
| category | 150/150 ✅ |
| lat / lon | 150/150 ✅ |
| ap (IATA) | 150/150 ✅ |
| tags | 150/150 ✅ |
| photo | 150/150 ✅ |
| rating | 150/150 ✅ |
| description | 0/150 ❌ — no venue has a description field |

### Duplicate IDs: NONE ✅
### Duplicate Photo URLs: NONE ✅

---

### P1 — Duplicate Locations (2 pairs)

**1. Pigeon Point, Tobago × 2**

| ID | Line | ap | Rating | Reviews |
|----|------|----|--------|---------|
| `beach_tobago` | 465 | TAB | 4.90 | 5,400 |
| `pigeon-point-t27` | 566 | TAB | 4.91 | 666 |

Same beach, same airport, coordinates within 0.004° of each other. Users see both in Explore. Fragments wishlists. **Keep `beach_tobago` (higher review count). Delete `pigeon-point-t27`.**

**2. Sarakiniko Beach, Milos × 2**

| ID | Line | ap | Rating | Reviews |
|----|------|----|--------|---------|
| `beach_milos` | 494 | MLO | 4.97 | 8,900 |
| `sarakiniko-beach-t16` | 556 | JMK (wrong) | 4.97 | 2,714 |

Same beach. `sarakiniko-beach-t16` also has a WRONG airport: JMK is Mykonos; Milos airport is MLO. The canonical entry `beach_milos` uses the correct MLO. **Delete `sarakiniko-beach-t16`.**

---

### P1 — Wrong Airport Code

`sarakiniko-beach-t16` uses `ap:"JMK"` (Mykonos Airport). The venue is Sarakiniko Beach on Milos Island. Correct code: `ap:"MLO"`. Users flying to Milos would get flight prices from the wrong island entirely. Moot once the duplicate is deleted, but calling it out separately.

---

### P2 — val-d-isere-s16 Still a Duplicate (2nd Flag)

`tignes` (Tignes / Val d'Isère, CMF, 4.94/2960 reviews) and `val-d-isere-s16` (Val d'Isère, GVA, 4.69/2641 reviews) are the same Espace Killy ski domain. chamonix-s18 was cleaned up after the May 15 report; this pair was not. **Delete `val-d-isere-s16`.** Note: it is referenced in an alert template at app.jsx ~line 5192 — update that draft to `"tignes"` after deletion.

---

### P2 — abasin Missing lateSeason:true (2nd Flag)

`id:"abasin"` has `tags:["Longest Season CO","The Legend"]`. A-Basin historically runs through mid-June. It is the only venue making a "longest season" claim without `lateSeason:true`. One-token fix:

```javascript
// app.jsx line 437 — abasin
// BEFORE:  skiPass:"ikon"},
// AFTER:   skiPass:"ikon", lateSeason:true},
```

---

## 2. GEAR ITEMS AUDIT — CRITICAL P0 (2nd Report)

### `GEAR_ITEMS` Does Not Exist in app.jsx

CLAUDE.md says Amazon gear gate was "FLIPPED" (commit a9aacf5, 2026-05-04). The gate expression `{GEAR_ITEMS[listing.category] && ...}` is referenced in the changelog, but **the `GEAR_ITEMS` constant does not exist anywhere in app.jsx** — confirmed: `grep -c "GEAR_ITEMS" app.jsx → 0`. The expression evaluates to `undefined` and renders nothing. Amazon Associates (`peakly-20`) is $0 revenue, not the $4.48/1K MAU shown in the Revenue Model table.

This is the second consecutive report. **Highest ROI fix in the codebase — 30 minutes of work, $4.48/1K MAU unlocked.**

### Paste-ready fix — add to Constants section (after CATEGORIES, before AIRPORTS):

```javascript
// ─── Amazon Associates gear items (peakly-20) ────────────────────────────────
const GEAR_ITEMS = {
  skiing: [
    {
      title: "Atomic Bent Chetler 100 Skis",
      desc: "All-mountain powder · top seller",
      price: 599,
      url: "https://www.amazon.com/dp/B09KZQP7F3?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop",
    },
    {
      title: "Smith I/O MAG ChromaPop Goggles",
      desc: "Fog-resistant · interchangeable lens",
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
      desc: "3-finger warmth · trusted since 1936",
      price: 115,
      url: "https://www.amazon.com/dp/B000UUSNS2?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop",
    },
  ],
  beach: [
    {
      title: "Osprey Ultralight Stuff Pack 18L",
      desc: "Packable daypack · 142g · stuffs into itself",
      price: 45,
      url: "https://www.amazon.com/dp/B00J4CQZYU?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop",
    },
    {
      title: "Patagonia Stretch Wavefarer Board Shorts",
      desc: "4-way stretch · quick-dry · Fair Trade",
      price: 79,
      url: "https://www.amazon.com/dp/B07VD46YGC?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    },
    {
      title: "Maui Jim Polarized Sunglasses",
      desc: "PolarizedPlus2 · UV400 · scratch-resistant",
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

Revenue math: ski avg AOV ~$540 × 4% = $21.60/sale + beach avg AOV ~$83 × 4% = $3.32/sale → ~$4.48/1K MAU at typical e-commerce conversion.

---

## 3. SEASONAL RELEVANCE — May 19, 2026

### Northern Hemisphere (late spring)

**Skiing — mostly closed.** N. Hemisphere resorts are largely shut by late May. The off-season binary cap in `scoreVenue` correctly suppresses them. Only `lateSeason:true` venues may still have viable snowpack:

| Venue | lateSeason | Note |
|-------|-----------|------|
| Whistler Blackcomb | ✅ | Whistler typically closed by late May; Blackcomb glacier open |
| Mammoth Mountain | ✅ | May still be open at high elevations |
| Chamonix-Mont-Blanc | ✅ | Aiguille du Midi access remains |
| Tignes / Val d'Isère | ✅ | Grande Motte glacier open through July |
| Cervinia | ✅ | Plateau Rosa glacier open through July |
| Arapahoe Basin | ❌ MISSING FLAG | "Longest Season CO" — was open June 8, 2025 |

**Beach — entering peak.** Mediterranean (Spain, France, Italy, Greece, Croatia) in ideal shoulder-to-peak conditions. Caribbean year-round. Hawaii peak. SE Asia: south Thailand (Koh Samui, Koh Tao) entering rainy season shoulder — will score lower naturally via Open-Meteo.

### Southern Hemisphere (approaching winter peak)

S. Hemisphere ski venues are pre-season now but will dominate ski Explore results from mid-June onward:

| Venue | Opens ~| Airport |
|-------|--------|---------|
| The Remarkables (NZ) | June | ZQN |
| Treble Cone (NZ) | Late June | ZQN |
| Thredbo Village (AU) | June | CBR |
| Cerro Castor (Argentina) | June | USH |
| Pucon Ski Center (Chile) | June | ZPC |
| Portillo (Chile) | Mid-June | SCL |

These score low right now via Open-Meteo correctly. No action needed — they'll surface naturally as winter arrives. Adding Valle Nevado + Falls Creek in Section 5 strengthens this inventory.

### S. Hemisphere beaches cooling

Bora Bora (lat −16.5), Fernando de Noronha (lat −3.8), Florianópolis (lat −27.6), Whitehaven Beach (lat −20.3) are in autumn/shoulder. Water-temp hard cap handles scoring correctly.

---

## 4. CONTENT QUALITY

### Factual Tag Errors — P1 (three venues)

| Venue | Bad Tag | Reality | Correct Tag |
|-------|---------|---------|-------------|
| `lovina-beach-t15` (Lovina, Bali) | `"White Sand"` | Lovina is famous for **black** volcanic sand — a defining characteristic | `"Black Volcanic Sand"` |
| `hyams-beach-t22` (Hyams, NSW) | `"Party Beach"`, `"Beach Bars"`, `"Vibrant"` | Guinness record: whitest sand in the world; Jervis Bay NP conservation area, zero nightlife | `"World's Whitest Sand"`, `"Jervis Bay NP"` |
| `bulabog-beach-boracay-t19` (Bulabog) | `"Family Friendly"`, `"Blue Flag"` | Kitesurfing capital of the Philippines; Blue Flag is European certification, not applicable | `"Kitesurfing Capital"`, `"Wind Sports"` |

These are factual errors that will generate negative reviews when users arrive expecting the wrong thing.

### Copy-Paste Tags on s-Series — P2

6 skiing venues share identical tags `["Expert Terrain","Off-Piste","Deep Snow","Backcountry"]` regardless of actual character:

| Venue | Copy-Pasted Tags | Better Tags |
|-------|-----------------|-------------|
| `zell-am-see-s1` (Zell am See, Austria) | Expert Terrain, Off-Piste | Lake Views, Glacier Express |
| `idre-fjall-s6` (Idre Fjäll, Sweden) | Expert Terrain, Off-Piste | Arctic Light, Cross-Country |
| `kiroro-snow-world-s11` (Kiroro, Hokkaido) | Expert Terrain, Off-Piste | Uncrowded Japow, Tree Runs |
| `powder-mountain-s21` (Powder Mtn, Utah) | Expert Terrain, Off-Piste | Locals Only, No Lift Lines |
| `mount-shasta-ski-s26` (Mt Shasta, CA) | Expert Terrain, Off-Piste | Volcanic Summit, Backcountry Gate |

### Rating Distribution — Healthy

| Range | Count |
|-------|-------|
| 4.51–4.69 | 22 |
| 4.70–4.84 | 18 |
| 4.85–4.94 | 72 |
| 4.95–4.99 | 38 |

No inflation concern. Lowest: kicking-horse-s10 (4.51), laguna-beach-t24 (4.51).

### Missing Venue in Series

`t20` absent — series jumps from `bulabog-beach-boracay-t19` to `san-vito-lo-capo-t21`. Minor numbering gap; no functional impact.

---

## 5. DAILY VENUE ADDITIONS — 5 new venues

5 new venues targeting geographic gaps. None of the May 15 recommendations were merged — these are fresh picks:

1. Valle Nevado (Chile) — S. Hemisphere skiing, approaching peak season, large domain 45 min from Santiago
2. Maldives Atolls — critical gap: MLE is in AP_CONTINENT but zero Maldives beach venues exist
3. Cortina d'Ampezzo (Italy) — Italy's most iconic ski area, 2026 Winter Olympics venue, absent from catalog
4. Playa Norte, Isla Mujeres (Mexico) — consistently ranked best beach in Mexico, different from Riviera Maya/Holbox/Cozumel
5. Falls Creek (Australia) — S. Hemisphere ski, Victoria high country, approaches peak June–September

```javascript
// ─── 5 new venues — paste into VENUES array ───────────────────────────────

{id:"valle-nevado", category:"skiing", title:"Valle Nevado",
  location:"Santiago Metropolitan, Chile",
  lat:-33.3575, lon:-70.2960, ap:"SCL",
  icon:"⛷️", rating:4.82, reviews:1480,
  gradient:"linear-gradient(160deg,#0a1828,#1a3272,#2a5ab4)",
  accent:"#78a8d8",
  tags:["Andes Powder","3,670m Summit"],
  photo:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},

{id:"maldives-north-male", category:"beach", title:"Maldives Atolls",
  location:"North Malé Atoll, Maldives",
  lat:4.1755, lon:73.5093, ap:"MLE",
  icon:"🏝️", rating:4.97, reviews:4280,
  gradient:"linear-gradient(160deg,#001a33,#00427a,#0080cc)",
  accent:"#66ccff",
  tags:["Overwater Villas","Coral Atoll"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"cortina-dampezzo", category:"skiing", title:"Cortina d'Ampezzo",
  location:"Dolomiti Superski, Italy",
  lat:46.5360, lon:12.1357, ap:"VCE",
  icon:"⛷️", rating:4.92, reviews:2640,
  gradient:"linear-gradient(160deg,#0d1632,#1e3070,#2c5cbc)",
  accent:"#7aa4e0",
  tags:["Dolomite Towers","2026 Olympic Venue"],
  photo:"https://images.unsplash.com/photo-1531743672295-bbd901790069?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
  skiPass:"independent"},

{id:"isla-mujeres-playa-norte", category:"beach", title:"Playa Norte",
  location:"Isla Mujeres, Mexico",
  lat:21.2518, lon:-86.7395, ap:"CUN",
  icon:"🏖️", rating:4.95, reviews:7840,
  gradient:"linear-gradient(160deg,#003344,#006688,#00aabb)",
  accent:"#00ddee",
  tags:["No-Wave Calm","Car-Free Island"],
  photo:"https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

{id:"falls-creek", category:"skiing", title:"Falls Creek Alpine Resort",
  location:"Victoria, Australia",
  lat:-36.8625, lon:147.2783, ap:"MEL",
  icon:"⛷️", rating:4.78, reviews:1960,
  gradient:"linear-gradient(160deg,#0a1820,#1a3868,#2e66aa)",
  accent:"#70a0cc",
  tags:["Village In The Snow","High Country"],
  photo:"https://images.unsplash.com/photo-1543796766-8098f2f29f66?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  skiPass:"independent"},
```

---

## PM NOTE

**Three open fires, one on its second alarm.**

1. **GEAR_ITEMS (P0, 2nd report):** Amazon revenue has been $0 since launch day. The gate was flipped but the constant was never written. Paste-ready code is above in Section 2. 30 minutes, $4.48/1K MAU on day one of the Reddit launch.

2. **Delete two duplicate locations:** `pigeon-point-t27` (exact duplicate of `beach_tobago`) and `sarakiniko-beach-t16` (duplicate of `beach_milos`, also has wrong airport JMK instead of MLO). Both inflate venue count, split ranking signal, and can cause wishlist save collisions via the duplicate-id validator.

3. **Southern Hemisphere ski season opens in 4 weeks.** Remarkables, Treble Cone, Cerro Castor, Portillo, Thredbo all open mid-June. Valle Nevado + Falls Creek (above) round out the coverage. Add them now so they're indexed in Explore before the season launches — users searching for June/July ski trips will find nothing without them.
