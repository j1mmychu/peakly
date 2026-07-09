# Peakly Content & Data Report — 2026-07-09

**Data health score: 84/100** | Build: `20260708a` | Venues: **375** (133 ski / 242 beach) | Photo max repeat: ✅ **3× beach / 2× ski** (fixed)

> Supersedes 2026-07-07. This run: lateSeason:true removed from chamonix (PM v82 Decision 1 complete), photo 4× regression fixed (3 venues reassigned), TFS+CHQ airport constants added, 2 new beach venues added (Las Teresitas/Elafonissi — PM v82 Decision 2 complete). Carry-forward open: 5 placeholder tags (3d), 5 glacier ski venues (3d).

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **375 venues, 2 categories only.** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 375 venues have non-empty tags.** |
| "Cross-category photo contamination" | **FIXED Jul 6.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags. See PM v81 Decision 1.** Stop. |
| "Jul 7 staged venues need adding (Cable Beach, Diani, Arugam Bay, Essaouira)" | **All present.** Cable Beach (`beach_cable`/BME) ✅, Diani (`beach_diani`/MBA) ✅, Sri Lanka CMB ✅ 3 venues, Essaouira (`essaouira-beach`) ✅ added Jul 8. |
| "2 logical duplicate pairs still open (bigsky/big-sky-montana, south-beach-miami/beach_miami)" | **FIXED Jul 8** — duplicates removed (see Jul 8 content log). Stop. |
| "Photo 4× regression (photo-1507525428034 on south-beach-miami)" | **FIXED this run** — south-beach-miami reassigned, ski photo-1551698618 dropped to 2×. Stop. |

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jul 9) |
|----------|-------|-------------------|
| **Beach** | 242 | ~184 N. hemi at peak (Mediterranean/Caribbean/SE Asia/Hawaii) · ~58 S. hemi suppressed by <18°C cap |
| **Skiing** | 133 | 23 S. hemi in peak winter (NZ/Chile/Aus/Argentina) · 9 `lateSeason:true` eligible (snow_depth ≥0.5m) · 101 N. hemi off-season capped |
| **TOTAL** | **375** | Bracket-walk id-count (node). Never grep. |

### Structural Integrity

| Check | Result | Δ from Jul 7 |
|-------|--------|--------------|
| Valid venue objects | ✅ 375 | +5 (2 new this run, 3 from Jul 8) |
| Duplicate IDs in VENUES | ✅ 0 | Fixed Jul 8 |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| `lateSeason:true` venues | ✅ 9 | Fixed this run (removed from chamonix — 20→9 complete) |
| GEAR_ITEMS refs | ✅ 0 (Amazon cut for v1) | — |
| **Photo max repeat** | ✅ beach ≤3× / ski ≤2× | Fixed this run |
| **Logical duplicate pairs** | ✅ 0 | Fixed Jul 8 |
| **Placeholder tags (5 ski venues)** | ⚠️ 5 open (3d) | unchanged |
| **5 glacier ski venues** | ⚠️ Pending (3d) | unchanged |

### lateSeason:true — PM v82 Decision 1 — COMPLETE

All 9 correct KEEPs remain: `whistler`, `zermatt`, `val-thorens`, `snowbird`, `verbier`, `cervinia`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`. All 20 removals shipped (19 batch + chamonix compact fixed this run).

### Photo Fix Summary (this run)

| Venue | Old Photo | New Photo | Reason |
|-------|-----------|-----------|--------|
| south-beach-miami | photo-1507525428034 (was 4th beach use) | photo-1516690561799 (now 2×) | Jul 6 regression fixed |
| zakopane | photo-1551698618 (was 3rd ski use) | photo-1504439904031 (now 2×) | ski cap ≤2× |
| portillo-s4 | photo-1551698618 (was 4th ski use) | photo-1606787364406 (now 2×) | ski cap ≤2× |

---

## 2. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx → 0` — Amazon cut for v1. Confirmed. **Do not restore.**

---

## 3. Seasonal Relevance (Jul 9, 2026 — N. Hemisphere Mid-Summer)

**Beach — Peak Season.** Mediterranean firing: NCE, CAG, SPU, NAP, DBV, JTR, JMK, RHO, TPS all at maximum summer scoring. Caribbean slightly off-peak (rainy season) but still warm. SE Asia (HKT, DPS, USM, KBV, DLM) in shoulder. Hawaii (HNL) peak. New this run: TFS (Tenerife, Las Teresitas) and CHQ (Crete, Elafonissi) now in catalog.

**Skiing — Southern Peak.** 23 S. hemisphere venues in peak winter:
- NZ (ZQN): Remarkables, Treble Cone, Coronet Peak, Cardrona, Mt Hutt
- Chile (SCL/ZCO): Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Pucon
- Australia (SYD/MEL/CBR): Thredbo, Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass
- Argentina (BRC/MDZ/CPC/NQN/USH): Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor

**July glacier gap (3d open):** Saas-Fee, Les Deux Alpes, Alpe d'Huez, St. Moritz, Cortina d'Ampezzo all absent. Europe's top summer ski destinations. UK/German/French users opening Skiing filter this week find nothing European in peak July operation. Saas-Fee, Les Deux Alpes, St. Moritz are now in VENUES with `lateSeason:true`; Alpe d'Huez and Cortina deferred to October sprint (PM v82 Decision 3).

---

## 4. Content Quality — Placeholder Tags (Still Open, Day 3)

Five ski venues share identical generic tags `["Powder Day", "All Levels"]` with no differentiation. The quality bar is set by solitude (`["All Levels", "Deep Powder", "Tree Skiing", "Low Crowds"]`) and deer-valley (`["Family Friendly", "Groomed Runs", "Ski Only", "Luxury"]`).

```js
// Find each "id": "X" in app.jsx and update tags + gradient:

// winter-park
"tags": ["Parsenn Bowl", "Beginner Terrain", "Family Friendly", "Ikon Pass"],
"gradient": "linear-gradient(160deg,#0f2a4a,#1d5291,#3a7fc1)",

// copper-mountain
"tags": ["Natural Terrain Separation", "Front Range Access", "Groomed Runs", "Ikon Pass"],
"gradient": "linear-gradient(160deg,#1a2e1a,#2d5a2d,#5a9e5a)",

// lake-louise
"tags": ["Glacial Views", "Lake Louise Village", "Family Friendly", "Ski Canada"],
"gradient": "linear-gradient(160deg,#0a2a3a,#1a5a6a,#3a8a9a)",

// palisades-tahoe
"tags": ["KT-22 Expert Chutes", "Lake Tahoe Views", "Off-Piste", "Ikon Pass"],
"gradient": "linear-gradient(160deg,#0d1e40,#1a4a8a,#3a7ac0)",

// brighton
"tags": ["Cottonwood Powder", "Night Skiing", "All Levels", "Ikon Pass"],
"gradient": "linear-gradient(160deg,#1a1a3a,#2d3a6a,#5a6aaa)",
```

---

## 5. Carry-Forward: 5 Glacier Ski Venues (Jul 7 §6 — Day 3 Open)

Saas-Fee, Les Deux Alpes, St. Moritz now IN CATALOG (added Jul 8, `lateSeason:true`). Alpe d'Huez and Cortina d'Ampezzo deferred to October sprint per PM v82 Decision 3.

| Venue | Status |
|-------|--------|
| Saas-Fee (`saas-fee-ch`) | ✅ In catalog, lateSeason:true |
| Les Deux Alpes (`les-deux-alpes-fr`) | ✅ In catalog, lateSeason:true |
| St. Moritz (`st-moritz-ch`) | ✅ In catalog, lateSeason:true |
| Alpe d'Huez | ⏳ October sprint (PM v82 Decision 3) |
| Cortina d'Ampezzo | ⏳ October sprint (PM v82 Decision 3) |

---

## 6. This Run — PM v82 Decisions Executed

**Decision 1 (lateSeason cleanup):** Complete. 20 removals done across 2 runs (19 batch Jul 8 + chamonix compact Jul 9). 9 KEEPs confirmed.

**Decision 2 (TFS + CHQ venues):** Complete. Added:
- TFS airport constant: `{lat:28.0445,lon:-16.5726}` in AIRPORT_COORDS (was already in AP_CONTINENT:europe)
- CHQ airport constant: `{lat:35.5317,lon:24.1497}` in AIRPORT_COORDS + `"CHQ":"europe"` in AP_CONTINENT
- `las-teresitas-tfe` (TFS): Saharan sand beach, yr-round sun, 11,400 reviews
- `elafonissi-beach-chq` (CHQ): Pink-sand lagoon, most-searched Greek beach, 18,200 reviews

**Decision 3 (Alpe d'Huez + Cortina):** Deferred to October sprint — do not execute.

**Net count: 375 venues (133 ski / 242 beach)**

---

*Content agent — 2026-07-09 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-07*
