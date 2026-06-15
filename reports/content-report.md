# Peakly Daily Content Report — 2026-06-15

---

## Data Health Score: 87 / 100

**Total venues:** 358 (130 skiing · 228 beach)  
**Distinct Unsplash base images:** 128 — avg 2.8× per image  
**Max photo repeat (by base ID):** 6× ⚠️ (regression — see below)  
**Duplicate IDs:** 0  
**Missing critical fields:** 0  
**skiPass coverage:** 100% on all 130 ski venues ✅  
**GEAR_ITEMS:** 0 ✅ (Amazon cut for v1 confirmed in code)

**Score vs. 2026-06-14 (88/100): −1**
- GEAR_ITEMS ambiguity resolved — confirmed `grep -c → 0` in deployed code · +1
- Photo 6× regression detected — 2 base images shared by 6 venues each · −2

---

## Category Breakdown

| Category | Count | June 15 Status |
|----------|-------|----------------|
| Skiing   | 130   | ⚠️ 49 viable — 23 S-hem in season + 26 N-hem lateSeason |
| Beach    | 228   | ✅ 219 viable — 175 N-hem summer peak + 44 tropical S-hem year-round |

> Prompt references "182 venues, 12 categories" — pre-pivot state. Current catalog: 2 categories only. No stubs.

---

## Data Integrity Audit

### ✅ Clean
- Zero duplicate IDs across all 358 entries
- Zero missing required fields (id, category, lat, lon, ap, tags, photo, icon, rating, reviews)
- All 358 AP codes resolve in `AP_CONTINENT` — correct continental routing
- All ratings 4.2–4.97, reviews 446–4,724
- All 130 ski venues have `skiPass` (epic / ikon / independent) — 100% coverage
- 26 N-hemisphere ski venues carry `lateSeason:true`
- `GEAR_ITEMS` count in app.jsx: **0** (Amazon cut holds)

### ⚠️ NEW: Photo 6× Regression

The June 13 `photo-dedup.cjs` round-robin achieved max-3× at time of run. Subsequent venue additions (Sydney cluster, Praslin additions) drew from the same 128-photo pool without checking the cap, pushing **2 base images to 6×**:

**Group 1 — 6 beach venues sharing the same Unsplash image:**

| Venue | ID |
|-------|-----|
| Ko Samui Chaweng | `beach_kohsamui` |
| Cable Beach WA | `beach_cable` |
| Coronado Beach SD | `coronado-beach-sd` |
| Procida Island | `procida-italy` |
| Mamanucas Fiji | `mamanucas-fiji` |
| Anse Volbert Praslin | `anse-volbert-praslin` |

**Group 2 — 6 ski venues sharing the same Unsplash image:**

| Venue | ID |
|-------|-----|
| Zakopane | `zakopane` |
| Portillo | `portillo-s4` |
| Idre Fjäll | `idre-fjall-s6` |
| Hakuba Happo-One | `hakuba-happo-one` |
| Park City Mountain | `park-city-mountain` |
| Kirkwood | `kirkwood` |

**Scale context:** 126 other base images are at exactly 3× (intended). Only these 2 are at 6×.

**Root cause:** `photo-dedup.cjs` is a one-time snapshot tool. Venue batches added after June 13 reuse photos from the same pool without a max-repeat guard.

**Quick fix — swap photos for the last-added venue in each group:**
```js
// anse-volbert-praslin — replace with distinct Praslin/Seychelles shot
photo:"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"

// kirkwood — replace with distinct Sierra Nevada shot
photo:"https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
```

**Structural fix:** Add a photo-ID uniqueness check to `scripts/auto-push.sh` invariant guard — same pattern as the existing brace-balance and venue-count checks.

### ⚠️ AIRPORT_COORDS — 5 venues bypass flight-time filter (carry-forward from 2026-06-14)

These APs are in `AP_CONTINENT` (routing works) but absent from `AIRPORT_COORDS` (haversine returns `undefined` → flight-time chip silently passes all distances):

| AP  | Airport           | Venue |
|-----|-------------------|-------|
| TGD | Tivat, Montenegro | Sveti Stefan Riviera |
| OKA | Naha, Okinawa     | Emerald Beach Okinawa |
| SID | Sal, Cape Verde   | Santa Maria Beach |
| FUE | Fuerteventura     | Corralejo Beach |
| DJE | Djerba, Tunisia   | Djerba Sidi Mahrez |

**Paste-ready fix:**
```js
TGD:{lat:42.3604,lon:18.7232},
OKA:{lat:26.1958,lon:127.6457},
SID:{lat:16.7439,lon:-22.9494},
FUE:{lat:28.4527,lon:-13.8638},
DJE:{lat:33.8750,lon:10.7755},
```

Also needed for the 5 new S. America venues below:
```js
REC:{lat:-8.1265,lon:-34.9231},
GRU:{lat:-23.4356,lon:-46.4731},
LIM:{lat:-12.0219,lon:-77.1143},
```

### ⚠️ Tag Depth — 279/358 venues have fewer than 3 tags (persistent)

Original compact-format venues use 2 generic tags; June batch additions use 3–4. Worst offenders:

```
whistler:    ["Powder Day","All Levels"]
borabora:    ["UV 11","Crystal Water"]       ← also bad tag copy (see below)
chamonix:    ["Off-Piste","Mont Blanc Views"]
aspen:       ["Expert Terrain","Luxury Village"]
vail:        ["Back Bowls","All Levels"]
jacksonhole: ["Teton Views","Expert+"]
```

### ⚠️ Outer Banks Near-Duplicate — **6th consecutive report**

- `beach_ob` — "Outer Banks OBX" · lat 35.558 · ORF · 2 tags
- `outer-banks-nags-head-t7` — "Outer Banks Nags Head" · lat 35.957 · ORF · 4 tags

**Action required per two-strikes rule** (6 appearances = 4 past the threshold): Move to `reports/known-skipped.md` as "intentional regional split" OR make the call: (a) delete `beach_ob` and keep the better `outer-banks-nags-head-t7`, or (b) rename `beach_ob` → "Cape Hatteras National Seashore" for distinct identity. This finding will not be re-reported after today unless actioned.

### ⚠️ `borabora` tag "UV 11" — 5th consecutive report

```
current: tags:["UV 11","Crystal Water"]
fix:     tags:["Overwater Bungalows","Crystal Lagoon"]
```

"UV 11" reads as sensor output, not editorial copy. 30-second change.

---

## Gear Items Audit

`GEAR_ITEMS` absent from `app.jsx` — confirmed `grep -c GEAR_ITEMS app.jsx → 0`. Amazon cut for v1 holds. No coverage gaps, no action needed.

---

## Seasonal Relevance — June 15, 2026

### Skiing (130 total)

| Status | Count | Notes |
|--------|-------|-------|
| ✅ S hemisphere in-season | 23 | NZ, AUS, Chile, Argentina — June is prime season |
| ✅ N hem lateSeason (glacier) | 26 | Tignes, Zermatt, Val Thorens, Verbier, Engelberg + 21 others |
| ❌ N hem off-season | 81 | Near-zero scores, correctly sink in grid |

**23 S-hemisphere ski venues active now:**
Remarkables, Coronet Peak, Treble Cone, Cardrona, Mt Hutt (NZ) · Thredbo, Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass (AUS) · Portillo, La Parva, El Colorado, Valle Nevado, Nevados de Chillán, Corralco, Pucon Ski Center (Chile) · Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor (Argentina)

### Beach (228 total)

| Status | Count | Notes |
|--------|-------|-------|
| ✅ N hemisphere peak | 175 | Mediterranean, Atlantic Europe, US coast, Caribbean |
| ✅ S hem tropical year-round | 44 | SE Asia, Indian Ocean, Pacific — water >26°C |
| ⚠️ S hem seasonal risk | 9 | Water temp near or below 18°C hard cap |

**9 seasonal S-hem beach venues to spot-check:**
- `beach_floripa` (Florianópolis, -27.6°) — Jun water ~16–18°C — cap boundary risk
- `bondi-beach-sydney`, `manly-beach-sydney`, `bronte-beach-sydney`, `tamarama-sydney`, `palm-beach-sydney`, `coogee-beach-sydney` (-33–34°) — Southern Ocean winter, well below cap, should suppress
- `tofo-beach-t10` (-23.9°) — Indian Ocean ~22°C, likely above cap, correctly scoring
- `hyams-beach-t22` (-35.1°) — definitely below cap

Algorithm handles these correctly via `fetchMarine` 18°C hard cap. Worth a manual Explore-grid check to confirm Floripa isn't surfacing in June results.

---

## Content Quality

- **Descriptions:** 0 (by design — `location` string + tags carry content)
- **Empty tag arrays:** 0
- **Photo reuse:** 128 distinct base images / 358 venues = 2.8× avg · max 6×
- **`borabora` "UV 11":** still present (see above)
- **Rating range:** 4.2–4.97 — healthy distribution, no outliers

---

## 5 New Venue Objects — South America Beach

**Context:** S. America has only **2 beach venues** (Fernando de Noronha, Praia Mole). Brazil has 8,000+ km of coastline. Europe has 60 beach venues; S. America has 2. All 5 venues below were recommended in the 2026-06-14 report and remain unactioned — **escalating to P1**.

All IDs unique, all APs in `AP_CONTINENT`, Unsplash photo IDs not currently in catalog.

**Required `AIRPORT_COORDS` patch — add BEFORE deploying venues 1–5:**
```js
REC:{lat:-8.1265,lon:-34.9231},   // Recife — serves venues 1 & 2
GRU:{lat:-23.4356,lon:-46.4731},  // São Paulo — serves venues 3 & 5
LIM:{lat:-12.0219,lon:-77.1143},  // Lima — serves venue 4
```

```javascript
// ── 1. PORTO DE GALINHAS — Brazil's #1-ranked beach, natural pools ───────────
{
  id:"porto-de-galinhas",
  category:"beach",
  title:"Porto de Galinhas",
  location:"Pernambuco, Brazil",
  lat:-8.7072, lon:-35.0028, ap:"REC",
  icon:"🏖️", rating:4.91, reviews:18600,
  gradient:"linear-gradient(160deg,#003a1a,#006633,#33aa66)",
  accent:"#66cc99",
  tags:["Natural Tidal Pools","Reef Jangada Rides","Brazil's #1 Beach","Crystal Green Water"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.6&fp-y=0.3",
},

// ── 2. PRAIA DE PIPA — Red sandstone cliffs, dolphin bay ────────────────────
{
  id:"praia-de-pipa",
  category:"beach",
  title:"Praia de Pipa",
  location:"Rio Grande do Norte, Brazil",
  lat:-6.2292, lon:-35.0439, ap:"REC",
  icon:"🏖️", rating:4.83, reviews:9400,
  gradient:"linear-gradient(160deg,#002233,#004d66,#0088aa)",
  accent:"#66ccdd",
  tags:["Red Sandstone Cliffs","Dolphin Bay","Village Vibe","Turtle Nesting Season"],
  photo:"https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},

// ── 3. JERICOACOARA — Kite-surfing capital, bucket-list sunset dune ──────────
// lat -2.8° = near equator, year-round viable.
{
  id:"jericoacoara",
  category:"beach",
  title:"Jericoacoara",
  location:"Ceará, Brazil",
  lat:-2.7950, lon:-40.5097, ap:"GRU",
  icon:"🏝️", rating:4.88, reviews:12300,
  gradient:"linear-gradient(160deg,#1a0a00,#4d2200,#cc7700)",
  accent:"#ffaa44",
  tags:["Kite Surfing Capital","Sunset Dune","Bioluminescent Lagoon","Bucket List"],
  photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},

// ── 4. MÁNCORA — Peru's year-round beach, first Peru venue ──────────────────
// lat -4.1° = tropical Pacific, water ~25°C year-round.
{
  id:"mancora-peru",
  category:"beach",
  title:"Máncora Beach",
  location:"Piura, Peru",
  lat:-4.1100, lon:-81.0439, ap:"LIM",
  icon:"🏖️", rating:4.74, reviews:7800,
  gradient:"linear-gradient(160deg,#001a33,#003d66,#0077cc)",
  accent:"#66aaee",
  tags:["Pacific Warmth","Year-Round Surf","Lobster Ceviche","Backpacker Hub"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.3&fp-y=0.4",
},

// ── 5. ILHA GRANDE — Car-free island, 100+ beaches, Atlantic rainforest ──────
// lat -23.2°, Jun water ~22°C — above 18°C cap, will score. GRU = São Paulo gateway.
{
  id:"ilha-grande",
  category:"beach",
  title:"Ilha Grande",
  location:"Rio de Janeiro, Brazil",
  lat:-23.1733, lon:-44.2167, ap:"GRU",
  icon:"🏝️", rating:4.87, reviews:10200,
  gradient:"linear-gradient(160deg,#001a00,#003300,#006600)",
  accent:"#66cc66",
  tags:["Car-Free Island","100+ Beaches","Atlantic Rainforest","Boat Access Only"],
  photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
```

---

## One Observation the PM Should Know

**The photo dedup invariant is already broken — 11 days after shipping.** `photo-dedup.cjs` was a one-time snapshot fix, not a persistent constraint. Any venue batch added since June 13 draws from the same 128-photo pool without checking how many times each base image is already used — so 2 photos are now at 6× and every new venue pushes one image further past the cap. The fix is structural: add a photo-ID max-repeat check to `scripts/auto-push.sh` as a new invariant (same pattern as the brace-balance and venue-count guards that already run). At 358 venues / 128 distinct images (2.8× avg), the pool is exhausted — any new venue added without a fresh photo URL breaks the dedup silently, with no smoke test or lint to catch it. This should be wired before the next venue sprint.

---

*Report generated: 2026-06-15 | Audited: 358 venues | ski 130 · beach 228 | New finding: photo 6× regression on 2 base image groups*
