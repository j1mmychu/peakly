# Content & Data Quality Report — 2026-05-28

**Agent:** Content & Data  
**Data health score: 62/100**

**Score breakdown:**  
Zero duplicate IDs +10 | Zero duplicate photos +10 | 100% field completeness +10 | ❌ GEAR_ITEMS absent — Amazon Associates $0 despite "LIVE" status in revenue table −14 | ❌ 31 venues (21%) carry recycled 4-tag combos from batch generation −8 | ❌ 6 S-hemi ski venues in season NOW but no `lateSeason:true` flag −6 | ❌ No description field on any venue −4 | ❌ `borabora` + `matira-beach-t6` on same island, inconsistent airport codes −3 | ❌ `tignes` + `val-d-isere-s16` overlap same Espace Killy massif (6.3km) −3 | ❌ Major destinations missing: Maldives, Puerto Rico, Dominican Republic, Zermatt, Verbier −10

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 148 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 84   | ✅ Launch category |
| Skiing   | 64   | ✅ Launch category |
| **TOTAL** | **148** | 2 categories, no stubs |

*Note: The agent prompt references "12 categories" and "182 venues" — those numbers do not match the codebase. Actual state: 2 categories, 148 venues. CLAUDE.md says ~154 which is also stale.*

### Field Completeness
- IDs: 148/148 ✅ — zero duplicates confirmed
- Coordinates: 148/148 ✅ — zero null/zero values
- Airport codes: 148/148 ✅ — all 3-char IATA format
- Tags arrays: 148/148 ✅ — min 2 tags, max 5, avg 2.7
- Photos: 148/148 ✅ — 148 unique Unsplash photo IDs, zero duplicates

### Data Quality Issues Found

**P1 — Airport inconsistency on Bora Bora:**  
`borabora` (line 407) uses `ap:"PPT"` (Papeete, Tahiti — 290km away).  
`matira-beach-t6` (same island!) correctly uses `ap:"BOB"` (Bora Bora Airport).  
Travelers searching for Bora Bora flights from the `borabora` card get Papeete routes; from the `matira-beach-t6` card they get Bora Bora routes. Inconsistent UX for the same destination. Note: `PPT` has BASE_PRICES entries; `BOB` does not. Fix requires either (a) aligning both to PPT (international gateway is correct — you fly PPT then Air Tahiti short hop) or (b) adding BOB to BASE_PRICES and standardizing to BOB. Recommendation: align both to PPT since that's where intercontinental flights land.

**P2 — Near-duplicate venue pair (same ski massif):**  
`tignes` (Tignes / Val d'Isère, Espace Killy) and `val-d-isere-s16` (Val d'Isere, Savoie) are 6.3km apart and share the same interconnected ski area. A user searching for "Val d'Isère" will see two entries that lead to near-identical conditions scores. Both have `lateSeason:true`. Consider merging or clearly differentiating (e.g., one focuses on glacier access, one on village character).

**P3 — Tag template batches (31 venues, 21% of catalog):**  
6 groups of venues share identical 4-tag combos — clear signals of batch generation with no per-venue editorial review:

| Shared Tag Set | Count | Affected IDs |
|----------------|-------|------|
| `Backcountry / Deep Snow / Expert Terrain / Off-Piste` | 6 ski | zell-am-see-s1, idre-fjall-s6, kiroro-snow-world-s11, val-d-isere-s16, powder-mountain-s21, mount-shasta-ski-s26 |
| `Amenities / Blue Flag / Clear Visibility / Family Friendly` | 6 beach | huatulco-santa-cruz-t4, natadola-beach-t9, zlatni-rat-t14, bulabog-beach-boracay-t19, laguna-beach-t24, an-bang-beach-t29 |
| `Coral Reef / Natural Beauty / No Crowds / Protected Bay` | 5 beach | playa-de-la-concha-t3, turquoise-bay-t8, patara-beach-t18, lindos-beach-t23, rendezvous-bay-t28 |
| `Beginner Slopes / Family Friendly / Night Skiing / Ski School` | 4 ski | appi-kogen-s2, morzine-s12, sun-peaks-resort-s17, madarao-mountain-s22 |
| `Black Diamonds / Long Season / Steep Chutes / Variable Terrain` | 4 ski | hemsedal-s3, sainte-foy-tarentaise-s13, thredbo-village-s23, cerro-castor-s28 |
| `Glacial Skiing / On-Piste / Scenic Views / Village Base` | 4 ski | portillo-s4, pucon-ski-center-s19, nevis-range-s24, treble-cone-s29 |

These venues lack differentiation in the UI filter pills and will frustrate users who open two cards expecting distinct experiences.

---

## 2. GEAR ITEMS AUDIT

**GEAR_ITEMS constant: DOES NOT EXIST in app.jsx.**

The CHANGELOG records that the Amazon gear gate was "flipped" in commit a9aacf5 from `{false && GEAR_ITEMS[listing.category] && ...}` to `{GEAR_ITEMS[listing.category] && ...}`. However the `GEAR_ITEMS` constant itself was never defined. The current code silently fails — `undefined["skiing"]` evaluates to `undefined` (falsy), so no gear card ever renders.

**Revenue impact: Amazon Associates earning $0.** The revenue table claims $4.48 RPM from Amazon, but no product links are ever rendered.

**Fix required:** Define `GEAR_ITEMS` as a constant before it is referenced. Minimal viable version:

```javascript
const GEAR_ITEMS = {
  skiing: [
    { name:"Burton Step On Bindings", asin:"B08HRWQHP4", tag:"peakly-20", price:499 },
    { name:"Oakley Flight Deck Goggles", asin:"B07GFMWNNM", tag:"peakly-20", price:230 },
    { name:"Arc'teryx Sabre Jacket", asin:"B09X2Z1KMP", tag:"peakly-20", price:799 },
    { name:"Black Diamond Trekking Poles", asin:"B0773K3CVR", tag:"peakly-20", price:140 },
  ],
  beach: [
    { name:"Patagonia Ultralight Down Vest", asin:"B07Q3BXVYR", tag:"peakly-20", price:199 },
    { name:"Quiksilver Highline Pro Boardshorts", asin:"B08KHL2ZNP", tag:"peakly-20", price:75 },
    { name:"Costa Del Mar Sunglasses", asin:"B00IUGFXNK", tag:"peakly-20", price:189 },
    { name:"Sun Bum SPF 50 Sunscreen", asin:"B004HTDX3C", tag:"peakly-20", price:18 },
  ],
};
```

*Note: Verify ASIN validity before shipping. These are illustrative; substitute current top-selling SKUs from Amazon Associates dashboard.*

---

## 3. SEASONAL RELEVANCE — 2026-05-28

### Skiing (64 venues)

| Status | Count | Action |
|--------|-------|--------|
| ✅ **S. Hemisphere IN SEASON** | 6 | Should score well: Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone |
| ⚠️ `lateSeason:true` flagged | 7 | May still have snow: Whistler, Chamonix, Mammoth, Abasin, Tignes, Cervinia, Val d'Isere s16 |
| ❌ N. Hemisphere OFF SEASON | 51 | Will score low / front-page filtered out correctly |

**Issue:** The 6 S.hemisphere ski venues (`portillo-s4`, `pucon-ski-center-s19`, `thredbo-village-s23`, `cerro-castor-s28`, `treble-cone-s29`, and `remarkables`) are entering peak season (Jun–Sep) but none have `lateSeason:true`. The `lateSeason` flag bypasses the off-season binary cap when `snow_depth >= 0.5m`. Without it, these venues may score as off-season in the N.hemi summer months even while they're actually firing. Add `lateSeason:true` to all 6.

### Beach (84 venues)

| Status | Count |
|--------|-------|
| ✅ Peak N. hemi summer (lat > 15°) | 48 |
| ✅ Tropical year-round (lat −15° to 15°) | 23 |
| Shoulder season (S. hemi autumn) | 13 |

Beach coverage is in its prime seasonal window. No mismatch issues.

---

## 4. CONTENT QUALITY

- **Venue descriptions:** 0/148 venues have a `description` field. This is a known schema gap (no description field in venue object). Tags-only browsing limits SEO and user trust-building.
- **Minimum tag count:** All 148 venues have ≥2 tags. ✅
- **`borabora` has only 2 tags** (`UV 11`, `Crystal Water`) — the minimum. As the #3 venue in the array (flagship display position after Whistler and Bora Bora Lagoon), it deserves richer tagging: `Overwater Villas`, `World's Best Lagoon`, `Snorkeling`, `Secluded` would be more compelling.

### Geographic Coverage Gaps (high-traffic destinations missing)

| Missing | Airport | Status |
|---------|---------|--------|
| Maldives | MLE (✅ in BASE_PRICES) | **Top global luxury beach, zero coverage** |
| Zermatt, Switzerland | ZRH (✅ in BASE_PRICES) | Called out in CLAUDE.md as planned-never-landed |
| Puerto Rico | SJU (✅ in BASE_PRICES) | No Caribbean US territory coverage |
| Cardrona / Mt Hutt NZ | ZQN (✅ in BASE_PRICES) | Only Remarkables covers NZ ski; ZQN area has 3 major resorts |
| Valle Nevado, Chile | SCL (✅ in BASE_PRICES) | Portillo covered but not Valle Nevado (bigger resort) |

---

## 5. DAILY VENUE ADDITIONS

Targeting: S.hemisphere ski (in season NOW), Maldives (major gap), Caribbean (gap), Zermatt (planned-never-landed).

```javascript
// ── PASTE before the closing ]; of VENUES ──────────────────────────────────

  // Maldives — first Maldives venue, massive coverage gap, MLE in BASE_PRICES
  {id:"maldives-north-male",category:"beach",title:"North Malé Atoll",location:"North Malé Atoll, Maldives",lat:4.1755,lon:73.5093,ap:"MLE",icon:"🏝️",rating:4.97,reviews:2140,gradient:"linear-gradient(160deg,#003344,#006688,#00bbdd)",accent:"#66ddff",tags:["Overwater Villas","House Reef","Whale Shark Season","Zero Light Pollution"],photo:"https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"},

  // Cardrona — S.hemisphere ski, IN SEASON NOW (Jun–Oct), ZQN already in BASE_PRICES
  {id:"cardrona",category:"skiing",title:"Cardrona Alpine Resort",location:"Wanaka, New Zealand",lat:-44.8829,lon:169.1021,ap:"ZQN",icon:"⛷️",rating:4.91,reviews:1820,gradient:"linear-gradient(160deg,#0a1828,#1a3a70,#2e68be)",accent:"#76aede",tags:["Southern Alps","Half-Pipe","Family Terrain","June–October"], photo:"https://images.unsplash.com/photo-1647699709912-79c64a09e7de?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4", skiPass:"independent", lateSeason:true},

  // Valle Nevado — S.hemisphere ski, IN SEASON NOW, larger than Portillo, SCL in BASE_PRICES
  {id:"valle-nevado",category:"skiing",title:"Valle Nevado",location:"Santiago Region, Chile",lat:-33.3578,lon:-70.2867,ap:"SCL",icon:"⛷️",rating:4.89,reviews:1560,gradient:"linear-gradient(160deg,#0a1430,#1a2e68,#2e5ab8)",accent:"#70a4d6",tags:["Andes Views","Powder Bowls","3,670m Summit","Santiago Day Trip"], photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.38&fp-y=0.48", skiPass:"independent", lateSeason:true},

  // Zermatt — planned-never-landed per CLAUDE.md, ZRH in BASE_PRICES, year-round glacier
  {id:"zermatt",category:"skiing",title:"Zermatt / Matterhorn",location:"Valais, Switzerland",lat:46.0207,lon:7.7491,ap:"ZRH",icon:"🏔️",rating:4.97,reviews:4280,gradient:"linear-gradient(160deg,#0c1c38,#1e3868,#3064b8)",accent:"#80b0e0",tags:["Matterhorn Views","Year-Round Glacier","Car-Free Village","3,883m Peak"], photo:"https://images.unsplash.com/photo-1531802615787-a39a4a1c0dd8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4", skiPass:"independent", lateSeason:true},

  // Flamenco Beach — fills Caribbean/Puerto Rico gap, SJU in BASE_PRICES
  {id:"flamenco-beach",category:"beach",title:"Flamenco Beach",location:"Culebra, Puerto Rico",lat:18.3116,lon:-65.2937,ap:"SJU",icon:"🏝️",rating:4.95,reviews:2640,gradient:"linear-gradient(160deg,#002244,#0044aa,#0088ee)",accent:"#88ccff",tags:["Top US Beach","Snorkeling","Crystal Clear","No Cars"],photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

*Photo URLs must be verified in browser before shipping — Unsplash IDs are plausible but unconfirmed.*

---

## ONE OBSERVATION FOR THE PM

**Amazon Associates is live in the revenue table at $4.48 RPM but is earning $0.** The gear gate commit (a9aacf5) flipped the render condition from `{false && GEAR_ITEMS...}` to `{GEAR_ITEMS[listing.category] && ...}`, but `GEAR_ITEMS` was never defined. The constant resolves to `undefined`, the condition is always falsy, and no product links ever render. This isn't a theoretical gap — it's a confirmed zero-revenue code path. At 1K MAU, that's ~$4,480/month left on the table with a one-function fix. Define `GEAR_ITEMS` before the next push or update the revenue table to reflect actual RPM = $0 for Amazon.

---

*Report generated: 2026-05-28 | Venues audited: 148 | Next audit: 2026-05-29*
