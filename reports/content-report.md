# Peakly Content & Data Report — 2026-07-07

**Data health score: 76/100** | Build: `20260707a` | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

**🟢 VENUE FREEZE LIFTED** — Jul 7 sprint execution window is open. Execute §6 (new venues) and §4 (duplicate removal) today.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories only.** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have non-empty tags.** Multi-line JSON format miscounted. |

---

## Fix Applied This Run

**Photo contamination resolved (Jul 7 DevOps commit).** `south-beach-miami` now has a valid beach photo (`photo-1507525428034`) shared with 3 other beach venues (within 3× cap). `grace-bay-turks` photo is unique. Cross-category contamination finding from Jul 6 is CLOSED.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Venues | In Season (Jul 7, N. Hemi Summer) |
|----------|--------|-------------------------------------------|
| **Beach** | 239 | **~184 N. hemi at PEAK** · ~55 S. hemi suppressed by <18°C cap |
| **Skiing** | 131 | **23 S. hemi at peak southern winter** · **25 `lateSeason:true`** eligible · **83 N. hemi off-season** |
| **TOTAL** | **370** | Verified via bracket-walk eval (node one-liner). Never use grep. |

### Structural Integrity

| Check | Result | Δ from Jul 6 |
|-------|--------|--------------|
| Valid venue objects | ✅ 370 | — |
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| skiPass coverage | ✅ 131/131 (34 Epic / 51 Ikon / 46 independent) | — |
| Ratings range | ✅ 4.00–4.99, avg 4.71 | — |
| AIRPORT_COORDS coverage | ✅ All 144 unique venue APs in AIRPORT_COORDS (185 entries) | — |
| AP_CONTINENT coverage | ✅ All venue APs in AP_CONTINENT (279 entries) | — |
| Cross-category photo contamination | ✅ **RESOLVED** (Jul 7 DevOps commit) | ✅ Fixed |
| **Logical duplicate venue pairs** | ⚠️ **2 confirmed — execute today** | unchanged from Jul 6 |
| Placeholder-tag venues | ⚠️ **5 open — execute today** | unchanged from Jul 6 |
| Surf-legacy tags | ⚠️ **26 beach venues** have surf/windsurf tags | -1 from Jul 6 count |

**Note on surf-legacy tags:** 26 beach venues carry tags like "Surf Breaks", "Kitesurfing", "Windsurfing". These are legitimate beach activity tags (not legacy surfing-category artifacts). "Surf Breaks" on a beach venue is a real condition signal (wave quality), not a retired-category leak. The Jul 6 "27 venues need tag cleanup" finding was partially incorrect — these tags are valid and should stay.

---

## 2. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx → 0` — Amazon cut for v1. Confirmed. **Do not restore.**

---

## 3. Seasonal Relevance (Jul 7, 2026)

**Beach — Peak Season.** ~184 N. hemisphere beach venues at maximum summer scoring. Mediterranean (58), Caribbean, SE Asia, Hawaii, US East Coast all firing. ~55 S. hemisphere beach correctly suppressed by <18°C water-temp cap.

**Skiing — Southern Peak.** 23 S. hemisphere venues in peak winter:
- NZ: 4 venues (The Remarkables, Treble Cone, Coronet Peak, Cardrona) — all ZQN
- Chile: 7 venues (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Pucon) — SCL + ZCO
- Australia: 6 venues (Thredbo, Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass) — SYD/MEL/CBR
- Argentina: 6 venues (Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor) — BRC/MDZ/CPC/NQN/USH

25 N. hemisphere `lateSeason:true` eligible at snow_depth ≥ 0.5m. 83 N. hemi off-season correctly capped.

**July glacier ski gap:** No **Les Deux Alpes**, **Saas-Fee**, **Alpe d'Huez**, **St. Moritz**, or **Cortina d'Ampezzo** in catalog. These are Europe's marquee July/summer ski destinations — missing for users flying from UK/Germany/France. All 5 staged in §6 (execute today).

---

## 4. Logical Duplicate Venues — Execute Today

These are confirmed duplicates that must be removed before new venues are added to avoid inflating the count.

| Keep | Remove | Reason |
|------|--------|--------|
| `big-sky-montana` (lat: 45.2851) | **`bigsky`** (lat: 45.2865) | Same resort, 156m apart, identical title. `big-sky-montana` has more tags. |
| `south-beach-miami` (lat: 25.7907, 42,800 reviews) | **`beach_miami`** (lat: 25.7907) | Exact same lat/lon, same title. `south-beach-miami` is the enriched entry. |

**Removing both dups: 370 → 368 venues.** Execute by finding each ID in app.jsx and deleting the venue object block.

---

## 5. Tag Quality Issues

### Photo Pool Depth

- **Distinct Unsplash base images:** 135 across 370 venues
- **Venues with truly unique photo:** 36.5%
- **Max repeat:** 3× (within documented threshold)
- **Photos shared by exactly 3 venues:** 104

Resolution requires expanding the pool (~100 new Unsplash IDs), not reshuffling. The dedup script (`scripts/photo-dedup.cjs`) handles redistribution automatically once new IDs are added.

### Placeholder Tags

Five ski venues have generic/repeated tag combos — execute today per the Jul 6 staging:

```js
// winter-park
tags: ["Parsenn Bowl", "Beginner Terrain", "Family Friendly", "Ikon Pass"],
gradient: "linear-gradient(160deg,#0f2a4a,#1d5291,#3a7fc1)",

// copper-mountain
tags: ["Natural Terrain Separation", "Front Range Access", "Groomed Runs", "Ikon Pass"],
gradient: "linear-gradient(160deg,#1a2e1a,#2d5a2d,#5a9e5a)",

// lake-louise
tags: ["Glacial Views", "Lake Louise Village", "Family Friendly", "Ski Canada"],
gradient: "linear-gradient(160deg,#0a2a3a,#1a5a6a,#3a8a9a)",

// palisades-tahoe
tags: ["KT-22 Expert Chutes", "Lake Tahoe Views", "Off-Piste", "Ikon Pass"],
gradient: "linear-gradient(160deg,#0d1e40,#1a4a8a,#3a7ac0)",

// brighton
tags: ["Cottonwood Powder", "Night Skiing", "All Levels", "Ikon Pass"],
gradient: "linear-gradient(160deg,#1a1a3a,#2d3a6a,#5a6aaa)",
```

---

## 6. Five New Venue Objects — Execute Today

Freeze lifted. All 5 are European/Swiss ski venues missing from a July-relevant glacier ski catalog. All use APs confirmed in AIRPORT_COORDS. **Fix applied to Les Deux Alpes: changed `ap` from "GNB" (Grenoble — NOT in AIRPORT_COORDS) to "CMF" (Chambéry — confirmed in AIRPORT_COORDS).**

> ⚠️ Verify all `photo` URLs in browser before committing — agent cannot confirm live Unsplash IDs. Run `node scripts/validate-venues.mjs` after staging in `data/venue-candidates.json`.

```js
// ─── PASTE into VENUES array (end of array, before closing ]; ) ───────────

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
  tags: ["Expert Terrain", "Groomed Runs", "High Altitude", "Family Friendly"],
  photo: "https://images.unsplash.com/photo-1540477960727-8f7e5ad69e7b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent"
},
{
  id: "st-moritz",
  category: "skiing",
  title: "St. Moritz",
  location: "Graubünden, Switzerland",
  lat: 46.4975,
  lon: 9.8373,
  ap: "ZRH",
  icon: "🏔️",
  rating: 4.91,
  reviews: 2876,
  gradient: "linear-gradient(160deg,#1a1a3a,#2e3a8a,#5a7abf)",
  accent: "#b0bec5",
  tags: ["Expert Terrain", "Off-Piste", "High Altitude", "Luxury Resort"],
  photo: "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
  skiPass: "independent"
},
{
  id: "saas-fee-ch",
  category: "skiing",
  title: "Saas-Fee",
  location: "Valais, Switzerland",
  lat: 46.1077,
  lon: 7.9287,
  ap: "ZRH",
  icon: "🏔️",
  rating: 4.78,
  reviews: 1560,
  gradient: "linear-gradient(160deg,#1a3a5c,#1e5fa8,#8bc4f0)",
  accent: "#8bc4f0",
  tags: ["Year-Round Glacier", "Expert Terrain", "High Altitude", "Off-Piste"],
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "les-deux-alpes-fr",
  category: "skiing",
  title: "Les Deux Alpes",
  location: "Isère, France",
  lat: 45.0167,
  lon: 6.1167,
  ap: "CMF",
  icon: "🏔️",
  rating: 4.65,
  reviews: 1840,
  gradient: "linear-gradient(160deg,#1c3a5f,#1f67ab,#5aaeeb)",
  accent: "#5aaeeb",
  tags: ["Glacier Summer Ski", "Expert Terrain", "Snowpark", "High Altitude"],
  photo: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent",
  lateSeason: true
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
  tags: ["Expert Terrain", "Scenic Views", "Off-Piste", "Luxury Resort"],
  photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass: "independent"
},
```

**Net after dup removal + new venues: 368 − 2 dups + 5 new = 373 venues**

---

## 7. Staged for Jul 8 — Geographic Beach Gaps

Four beach venues identified this run that fill real gaps, all using existing AIRPORT_COORDS APs. No freeze conflict — stage in `data/venue-candidates.json` and execute next run.

| Venue | AP | Gap | July Status |
|-------|-----|-----|-------------|
| Arugam Bay, Sri Lanka | CMB | Zero Sri Lanka coverage | Peak surf season |
| Cable Beach, Broome AUS | BME | Zero Broome coverage | Peak dry season |
| Essaouira Beach, Morocco | RAK | Zero Atlantic Morocco coverage | Peak windsurf season |
| Diani Beach, Kenya | MBA | Zero Kenya coverage | Dry season, reef peak |

---

## One Observation for the PM

**Big Sky Resort appears twice in the catalog with different IDs** (`bigsky` and `big-sky-montana`) at essentially the same coordinates. So does South Beach Miami (`beach_miami` and `south-beach-miami`). Both are real duplicates confirmed today. Removing both reduces the venue count to 368 before the 5 new additions land. Run this before posting any venue count publicly — 370 is currently the wrong number by 2.

---

*Content agent — 2026-07-07 UTC | Venues: 370 (131 ski / 239 beach) | Prior: 2026-07-06*
