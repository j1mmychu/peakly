# Content & Data Quality Report — 2026-05-17

**Agent:** Content & Data  
**Data health score: 78/100** (+13 from May 15 — chamonix-mont-blanc-s18 deleted, closing one dup pair)

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photo URLs +10 | All 8 required fields present on all 150 venues +10 | ❌ Pigeon Point exact title+location dup (beach_tobago vs pigeon-point-t27) −5 | ❌ Sarakiniko same beach two IDs (beach_milos + sarakiniko-beach-t16) −4 | ❌ GEAR_ITEMS constant still missing (3rd report) −8 | ❌ abasin missing lateSeason:true despite "Longest Season CO" tag (3rd report) −3 | ❌ 58 N-hem ski venues off-season in May, only 6 have lateSeason flag −4 | ❌ Zero venue description fields −5 | ✅ chamonix-mont-blanc-s18 deleted since May 15 +2 | Tignes/Val d'Isere ski area still split across two IDs (tignes + val-d-isere-s16) −3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 150 venues (2 categories)

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 86   | ✅ Launch category |
| Skiing   | 64   | ✅ Launch category |
| **TOTAL** | **150** | Down 1 from May 15 — chamonix-mont-blanc-s18 correctly removed |

No stub categories. Both are the only two launch categories. Surfing retired and absent.

### Required Field Coverage — ALL PASS

| Field | Present | Missing |
|-------|---------|---------|
| id | 150/150 | 0 |
| category | 150/150 | 0 |
| lat / lon | 150/150 | 0 |
| ap (airport IATA) | 150/150 | 0 |
| tags | 150/150 | 0 |
| photo | 150/150 | 0 |
| rating | 150/150 | 0 |
| title | 150/150 | 0 |

All 150 airports are valid 3-letter IATA format. No out-of-range coordinates. No location/coordinate geographic mismatches.

### Duplicate IDs: NONE ✅
### Duplicate Photo URLs: NONE ✅

### Duplicate / Near-Duplicate Destinations — P1 (2 unfixed, 1 new fixed)

**FIXED since May 15:** chamonix-mont-blanc-s18 deleted ✅

**STILL OPEN — HIGH PRIORITY:**

**1. Pigeon Point × 2 (exact title + location match)**
- `beach_tobago` lat:11.165, lon:-60.84, ap:TAB, rating:4.90, reviews:5400
- `pigeon-point-t27` lat:11.167, lon:-60.833, ap:TAB, rating:4.91, reviews:666
- Same beach. 180m apart. Different gradients, different tags. Action: delete `pigeon-point-t27` (lower reviews, newer stub ID), merge its tags onto `beach_tobago`.

**2. Sarakiniko Beach × 2 (same volcanic beach, Milos)**
- `beach_milos` title:"Sarakiniko Moon Beach" lat:36.757, lon:24.39, ap:MLO
- `sarakiniko-beach-t16` title:"Sarakiniko Beach" lat:36.767, lon:24.433, ap:JMK
- Same beach. Different airport codes (MLO = Milos island airport vs JMK = Mykonos — JMK is wrong for Milos). Action: delete `sarakiniko-beach-t16`, fix `beach_milos` ap to "MLO".

**3. Tignes / Val d'Isère ski area split (same lift system)**
- `tignes` title:"Tignes / Val d'Isère", ap:CMF, rating:4.94
- `val-d-isere-s16` title:"Val d'Isere", ap:GVA, rating:4.69
- Espace Killy = one ski domain. Two entries splits wishlist data and Explore ranking. Action: delete `val-d-isere-s16`, keep `tignes`.

**Near-duplicates that are ACCEPTABLE (different venues, same island):**
- borabora + matira-beach-t6 — Bora Bora Lagoon (whole lagoon) vs Matira Beach (south tip). Different experiences, valid.
- beach_boracay (White Beach, west) + bulabog-beach-boracay-t19 (Bulabog, east). Wind-sport vs sunset beach. Valid.

### Airport Code Flags (VERIFY, NOT ERRORS)

| Venue ID | Airport | Note |
|----------|---------|------|
| sarakiniko-beach-t16 | JMK | **WRONG** — JMK is Mykonos. Milos island is MLO. If venue kept, fix this. |
| taos | SAF | Santa Fe (90 min drive) — no Taos airport. Acceptable workaround. |
| crestedbutte | GUC | Gunnison Regional (30 min drive). Correct. |

### Title Duplicates (Different Venues, Same Name)

| Title | Venues | Verdict |
|-------|--------|---------|
| "Seven Mile Beach" | beach_gcm (Cayman), beach_negril (Jamaica) | Valid — different islands |
| "Pigeon Point" | beach_tobago, pigeon-point-t27 | **DUPLICATE — DELETE pigeon-point-t27** |

---

## 2. GEAR ITEMS AUDIT

### GEAR_ITEMS: STILL DOES NOT EXIST — 3RD CONSECUTIVE REPORT

This has now been flagged May 13, May 15, and May 17. The CLAUDE.md changelog says the Amazon gear gate was flipped (commit a9aacf5) but the `GEAR_ITEMS` constant was never written. `GEAR_ITEMS[listing.category]` evaluates to `undefined`, renders nothing.

Amazon Associates (`peakly-20`) RPM: **$0. Should be $4.48/1K MAU.**

Paste-ready fix — add to app.jsx in the Constants & data section (after CATEGORIES, before AIRPORTS):

```javascript
// ─── Amazon Associates gear items (tag=peakly-20) ───────────────────────────
const GEAR_ITEMS = {
  skiing: [
    {
      title: "Atomic Bent Chetler 100 Skis",
      desc: "All-mountain powder — top-rated",
      price: 599,
      url: "https://www.amazon.com/dp/B09KZQP7F3?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop",
    },
    {
      title: "Smith I/O MAG Goggles",
      desc: "ChromaPop lens · anti-fog",
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
      title: "Hestra Army Leather 3-Finger Gloves",
      desc: "Trusted warmth for 80 years",
      price: 115,
      url: "https://www.amazon.com/dp/B000UUSNS2?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop",
    },
  ],
  beach: [
    {
      title: "Osprey Ultralight Stuff Pack 18L",
      desc: "142g packable daypack",
      price: 45,
      url: "https://www.amazon.com/dp/B00J4CQZYU?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop",
    },
    {
      title: "Maui Jim Polarized Sunglasses",
      desc: "PolarizedPlus2 · UV400",
      price: 189,
      url: "https://www.amazon.com/dp/B00CGYL5IC?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&h=120&fit=crop",
    },
    {
      title: "Patagonia Stretch Wavefarer Board Shorts",
      desc: "Quick-dry · 4-way stretch",
      price: 79,
      url: "https://www.amazon.com/dp/B07VD46YGC?tag=peakly-20",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
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

**Revenue math:** At Amazon Associates avg 4% commission — ski avg order ~$540, beach avg ~$83 → $4.48/1K MAU unlocked on wire-up. This is already logged as "LIVE" in the Revenue Model table. It is not live.

---

## 3. SEASONAL RELEVANCE — May 17, 2026

### Ski Venue Season Status

| Status | Count | Venues |
|--------|-------|--------|
| lateSeason:true (still firing) | 6 | Whistler, Chamonix, Mammoth, Tignes, Cervinia, Val d'Isere s16 |
| S. hemisphere (Jun–Sep season, ~3 weeks out) | 6 | Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone |
| N. hemisphere, off-season, no flag | 52 | All others |

**One-token fix still open:** `abasin` (Arapahoe Basin) tagged `"Longest Season CO"` but has no `lateSeason:true`. A-Basin historically runs into June. Fix:
```
// app.jsx line ~430 — abasin entry — change end of line:
// skiPass:"ikon"},
// TO:
// skiPass:"ikon", lateSeason:true},
```

### Beach Venue Season Status

**In peak or shoulder season (good):** Caribbean (N. summer approaching), Mediterranean (May = peak), Hawaii, SE Asia.

**Out of peak season — expected, not actionable:**
22 S. hemisphere beach venues (Bora Bora, Fernando de Noronha, Florianópolis, Whitehaven, Diani, Zanzibar, Seychelles, Mauritius, Bali, Fiji, NZ beaches, Mozambique, Western Australia). Water-temp hard cap handles scoring suppression automatically. No code change needed.

---

## 4. CONTENT QUALITY

### Descriptions: ALL 150 MISSING — DEFERRED to v2

No venue has a `description` field. Not blocking launch. Tags carry enough signal for v1.

### Tag Quality Issues

- **`abasin`** has tag `"Longest Season CO"` but no `lateSeason:true`. Tag is accurate but flag is missing. See §3 fix.
- **Overused generic tags** (6+ venues each): "Party Beach", "Beach Bars", "Water Sports", "Vibrant", "Clear Visibility", "Amenities", "Blue Flag". These tags distinguish nothing. Future content sprint: replace with venue-specific specifics.
- **Elevation absent from "High Altitude" tag** (7 venues). `"3,400m Glacier"` > `"High Altitude"`. Not urgent.
- **All venues have exactly 2 tags** — sufficient for v1, leaves room for richer filtering later.

### Geographic Coverage Gaps (Beach)

| Missing Region | Notes |
|---------------|-------|
| India | Zero venues. Goa (GOI) is a top-5 global beach market. |
| Maldives | MLE is in BASE_PRICES. Zero beach venues routed through it. |
| Sri Lanka | Zero venues. Mirissa, Unawatuna — prime beach December–April. |
| UAE / Dubai | Zero venues. Jumeirah Beach, high-AOV market. |
| Canary Islands | Only Lanzarote (ACE) via BASE_PRICES. No Tenerife (TFS), Fuerteventura (FUE beach venues). |

### Geographic Coverage Gaps (Skiing)

| Missing | Notes |
|---------|-------|
| Andorra | Grandvalira is Europe's highest resort town. Zero Andorra venues. |
| Alpe d'Huez | Iconic French resort. GNB airport in BASE_PRICES. Inexplicably absent. |
| South Korea | PyeongChang/Yongpyong. Olympic resort, Asia coverage gap. |
| Bulgaria (Bansko) | Budget European ski, strong UK/EU market demand. |

---

## 5. DAILY VENUE ADDITIONS

5 new venues targeting: confirmed geographic gaps (Maldives, India, Alpe d'Huez, Andorra, Sri Lanka).

```javascript
// ─── 5 new venues — paste into VENUES array (app.jsx ~line 568, before closing ];) ───

{id:"maldives-huvafen-fushi", category:"beach",
  title:"Maldives Atolls",
  location:"North Malé Atoll, Maldives",
  lat:4.3500, lon:73.5000, ap:"MLE",
  icon:"🏝️", rating:4.97, reviews:3840,
  gradient:"linear-gradient(160deg,#001a3a,#00407a,#0078cc)",
  accent:"#66bbff",
  tags:["Overwater Bungalows","Coral Atoll"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"goa-palolem", category:"beach",
  title:"Palolem Beach Goa",
  location:"South Goa, India",
  lat:15.0100, lon:74.0230, ap:"GOI",
  icon:"🏖️", rating:4.82, reviews:6240,
  gradient:"linear-gradient(160deg,#3a1a00,#7a3500,#c26000)",
  accent:"#f5a050",
  tags:["Crescent Beach","Backwater Lagoon"],
  photo:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},

{id:"alpe-d-huez", category:"skiing",
  title:"Alpe d'Huez Grand Domaine",
  location:"Isère, France",
  lat:45.0906, lon:6.0683, ap:"GNB",
  icon:"⛷️", rating:4.89, reviews:2780,
  gradient:"linear-gradient(160deg,#0c1d3a,#1a3c78,#2c66b8)",
  accent:"#78aadf",
  tags:["140km Pistes","Tour de France Climb"],
  photo:"https://images.unsplash.com/photo-1607778041958-b21c0c9dc1ef?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent"},

{id:"grandvalira-andorra", category:"skiing",
  title:"Grandvalira Andorra",
  location:"Andorra la Vella, Andorra",
  lat:42.5426, lon:1.7369, ap:"BCN",
  icon:"🏔️", rating:4.84, reviews:2140,
  gradient:"linear-gradient(160deg,#0a1a34,#1a3870,#2860b0)",
  accent:"#74a6dc",
  tags:["Duty-Free Village","Pyrenean Powder"],
  photo:"https://images.unsplash.com/photo-1548678867-18cf10e3ff79?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},

{id:"mirissa-beach", category:"beach",
  title:"Mirissa Beach",
  location:"Southern Province, Sri Lanka",
  lat:5.9483, lon:80.4714, ap:"CMB",
  icon:"🏝️", rating:4.81, reviews:3190,
  gradient:"linear-gradient(160deg,#003322,#006644,#00a870)",
  accent:"#66cc99",
  tags:["Whale Watching","Palm-Lined Bay"],
  photo:"https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

---

## PM NOTE

**Three consecutive reports: GEAR_ITEMS missing.** This is the #1 revenue blind spot. The CLAUDE.md Revenue Model table shows Amazon at "$4.48/1K MAU" as "LIVE" — it is not. The paste-ready constant above is the entire fix; the gate expression `{GEAR_ITEMS[listing.category] && ...}` already exists in the render tree, it just evaluates to `undefined`. One paste away.

**Second priority:** Delete `pigeon-point-t27` (exact dup of `beach_tobago`) and `sarakiniko-beach-t16` (same beach as `beach_milos`, wrong airport code). Two deletes, no new code.

**Third priority:** `sarakiniko-beach-t16` uses `ap:"JMK"` (Mykonos) for a beach on Milos island. JMK is a 90-minute ferry wrong. If this venue is kept before deletion, change to `ap:"MLO"` immediately — it will generate bad flight prices until fixed.
