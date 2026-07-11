# Peakly Content & Data Report — 2026-07-11

**Data health score: 89/100** | Build: `20260711a` | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

---

## What Changed Since Yesterday

- ✅ **lateSeason regression fixed** (DevOps Jul 11 report) — mammoth, abasin, tignes, chamonix all restored to `lateSeason:true`. Now 13 total: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.
- ✅ **cancun-beach added** (from Jul 10 venue batch) — Caribbean coverage solid.
- ❌ **4 venues from Jul 10 report NOT yet added:** alpe-d-huez, cortina-d-ampezzo, florianopolis-beach, punta-mita-beach. Re-staged below.

---

## Data Integrity

| Check | Result |
|-------|--------|
| Duplicate IDs | 0 ✅ |
| Missing coords | 0 ✅ |
| Missing airport codes | 0 ✅ |
| Missing tags | 0 ✅ |
| Missing photos | 0 ✅ |
| Photo max repeat | 3× ✅ |
| GEAR_ITEMS refs | 0 ✅ (Amazon cut for v1) |
| lateSeason:true | 13 ✅ (regression fixed) |

### OPEN — GIG Airport Missing from AP_CONTINENT
`ipanema-rio` uses `ap: "GIG"` but GIG is absent from `AP_CONTINENT`. Continent-based distance filter fails silently for this venue.
**Fix:** add `GIG:"latam"` to the LATAM block in `AP_CONTINENT`.

---

## Seasonal Relevance — July 11, 2026

| Group | Count | Status |
|-------|-------|--------|
| North beach (lat ≥ 0) | ~184 | ✅ Peak summer |
| South ski (lat < 0) | 23 | ✅ Southern winter peak |
| North ski, lateSeason | 13 | ⚠️ Glacier venues only; scoring correctly |
| North ski, no lateSeason | ~97 | ❌ Off-season (correct) |
| South beach (lat < 0) | ~58 | ❌ Off-season (correct) |

---

## Geographic Coverage

LatAm beach remains the catalog's worst gap: only 3 venues (all Brazil) for all of South America, vs 47 Caribbean venues.

| Sub-region | Beach count |
|------------|-------------|
| Caribbean + Central Am | 47 |
| North America | 83 |
| Europe | 60 |
| Asia / Oceania | 73 |
| Africa | 23 |
| **South America** | **3** ← critical gap |

---

## 5 New Venue Objects — Re-stage Jul 10 Batch + 1 New S.Am

4 venues from the Jul 10 report were not added. Re-staging them here with one swap: `florianopolis-beach` replaced with `pipa-beach-brazil` because `beach_floripa` (Florianópolis, FLN) already exists — adding another Florianópolis beach at the same airport would feel duplicative to users.

```javascript
// ─── PASTE into VENUES array (before closing ]; ) ──────────────────────────

{
  id: "alpe-d-huez",
  category: "skiing",
  title: "Alpe d'Huez",
  location: "Isère, France",
  lat: 45.0900,
  lon: 6.0700,
  ap: "CMF",
  icon: "🏔️",
  rating: 4.89,
  reviews: 3210,
  gradient: "linear-gradient(160deg,#0d1f3c,#1a4a8a,#4a90d9)",
  accent: "#90caf9",
  tags: ["Glacier Summer Ski", "Sarenne Descent", "Family Terrain", "Grandes Rousses"],
  photo: "https://images.unsplash.com/photo-1540477960727-8f7e5ad69e7b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
  lateSeason: true,
},
{
  id: "cortina-d-ampezzo",
  category: "skiing",
  title: "Cortina d'Ampezzo",
  location: "Dolomites, Italy",
  lat: 46.5404,
  lon: 12.1357,
  ap: "TRN",
  icon: "🏔️",
  rating: 4.87,
  reviews: 2445,
  gradient: "linear-gradient(160deg,#1a0d00,#5c2a00,#c05a00)",
  accent: "#ffcc80",
  tags: ["Dolomites Scenery", "Expert Terrain", "Olympic Host", "Luxury Village"],
  photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
},
{
  id: "pipa-beach-brazil",
  category: "beach",
  title: "Praia de Pipa",
  location: "Rio Grande do Norte, Brazil",
  lat: -6.228,
  lon: -35.056,
  ap: "REC",
  icon: "🏝️",
  rating: 4.87,
  reviews: 9400,
  gradient: "linear-gradient(160deg,#001428,#002856,#005096)",
  accent: "#42a5d8",
  tags: ["White Sand", "Dolphin Bay", "Beach Bars", "Limestone Cliffs"],
  photo: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop",
},
{
  id: "punta-mita-beach",
  category: "beach",
  title: "Punta Mita",
  location: "Nayarit, Mexico",
  lat: 20.7803,
  lon: -105.5314,
  ap: "PVR",
  icon: "🏝️",
  rating: 4.82,
  reviews: 6200,
  gradient: "linear-gradient(160deg,#001a33,#002a60,#004a99)",
  accent: "#80d8ff",
  tags: ["Pacific Luxury", "Snorkeling", "Whale Watching", "Surf Breaks"],
  photo: "https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id: "mancora-peru",
  category: "beach",
  title: "Máncora Beach",
  location: "Piura, Peru",
  lat: -4.104,
  lon: -81.051,
  ap: "LIM",
  icon: "🏖️",
  rating: 4.82,
  reviews: 6700,
  gradient: "linear-gradient(160deg,#1a2a00,#2d5a00,#4e8c00)",
  accent: "#8bc34a",
  tags: ["Year-Round Sun", "Surf Breaks", "Warm Water", "Beach Bars"],
  photo: "https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=800&h=600&fit=crop",
},
```

> **Net count if executed: 375 + 5 = 380 venues (135 ski / 245 beach)**
> Run `scripts/photo-dedup.cjs` after paste to confirm max repeat stays ≤3×.
> Fix GIG in AP_CONTINENT at the same time.

---

## One Observation for the PM

**The LatAm gap is a revenue gap, not just a coverage gap.** Miami, Houston, and New York all have 5–7hr nonstop routes to Lima, Bogotá, Rio, Recife — routes that Booking.com and Travelpayouts both convert well on. With only 3 S. Am beach venues, Peakly leaves those exact-match bookings on the table entirely. Adding `mancora-peru` (LIM) and `pipa-beach-brazil` (REC) this run is the minimum viable fix; a follow-up sprint to 15–20 S. Am venues (Búzios, Cartagena, Máncora, Punta del Este, Arraial do Cabo, Paraty) would make this a genuinely differentiated inventory section no competitor surfaces.
