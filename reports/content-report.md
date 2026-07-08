# Peakly Content & Data Report — 2026-07-08

**Data health score: 80/100** | Build: `20260707a` | Venues: **373** (133 ski / 240 beach) | Max photo repeat: 4×

**Executed this run:** Removed 2 confirmed duplicate venues (`bigsky`, `beach_miami`) · Fixed 5 placeholder-tag ski venues · Added 5 new July-relevant venues (2 beach, 3 ski glacier). Net: 370 → 373.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 venues, 2 categories only.** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 373 venues have ≥2 tags.** Multi-line JSON format miscounted. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop re-raising. |

---

## Changes Executed This Run

### Duplicate Venue Removal (370 → 368)

| Removed | Kept | Reason |
|---------|------|--------|
| `bigsky` (line 505, compact) — tags: ["Lone Peak","5,800 Acres"] | `big-sky-montana` — tags: ["Biggest Skiing USA","Lone Peak Aerial Tram","Low Crowds","IKON Pass"] | Same resort, nearly identical coords (45.2865 vs 45.2851). Compact entry had 2 generic tags vs JSON entry's 4 descriptive ones. |
| `beach_miami` (line 561, compact) — "South Beach Miami", 2 generic tags | `south-beach-miami` — "South Beach", 4 descriptive tags ["Art Deco Boardwalk","Atlantic Waves","Year-Round Sun","Nightlife District"] | Same lat/lon (25.7907, -80.1300), same AP (MIA). Batch entry has richer tag content. |

### Placeholder Tag Fixes (5 venues)

| Venue | Old Tags | New Tags | Gradient |
|-------|----------|----------|----------|
| `winter-park` | ["Powder Day","All Levels"] | ["Parsenn Bowl Terrain","Beginner-Friendly Runs","Front Range Access","Ikon Pass"] | Updated to steel blue |
| `copper-mountain` | ["Powder Day","All Levels"] | ["Natural Terrain Separation","Snowboard-Optimized Layout","Front Range Access","Ikon Pass"] | Updated to forest green |
| `palisades-tahoe` | ["Powder Day","All Levels"] | ["KT-22 Expert Chutes","Lake Tahoe Views","Olympic History","Ikon Pass"] | Updated to navy blue |
| `lake-louise` | ["Powder Day","All Levels"] | ["Glacial Lake Views","Lake Louise Village","Rocky Mountain Powder","Ikon Pass"] | Updated to teal |
| `brighton` | ["Powder Day","All Levels"] | ["Cottonwood Canyon Powder","Night Skiing","Family Mountain","Ikon Pass"] | Updated to midnight blue |

**Note:** `lateSeason:true` NOT removed from these venues — scoring flag change requires algorithm critique per CLAUDE.md. Flagged for PM below.

### 5 New Venues Added (368 → 373)

| ID | Category | Location | AP | July Status |
|----|----------|----------|----|-------------|
| `arugam-bay-sl` | beach | Eastern Province, Sri Lanka | CMB | ✅ East coast dry season peak |
| `essaouira-beach` | beach | Essaouira, Morocco | RAK | ✅ Atlantic windsurf/beach season |
| `les-deux-alpes-fr` | skiing | Isère, France | CMF | ✅ Active glacier skiing to August |
| `saas-fee-ch` | skiing | Valais, Switzerland | ZRH | ✅ Year-round glacier, Fee Glacier |
| `st-moritz-ch` | skiing | Graubünden, Switzerland | ZRH | ✅ Corvatsch summer glacier |

⚠️ **Photo URL verification required** — network egress blocked in this sandbox. Verify these 5 Unsplash IDs load correctly in browser before Reddit/App Store review:
- `1566452348683-af04c7f8b0e8` (Arugam Bay)
- `1548438294-1ad5d5f4f063` (Essaouira)
- `1583119022894-919a68a3d0e3` (Les Deux Alpes)
- `1551698618-1dfe5d97d256` (Saas-Fee)
- `1606787364406-a3cdf06c6d0c` (St. Moritz)

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Venues | In Season (Jul 8, N. Hemi Summer) |
|----------|--------|-------------------------------------------|
| **Beach** | 240 | **~185 N. hemi at PEAK** · ~55 S. hemi suppressed by <18°C cap |
| **Skiing** | 133 | **23 S. hemi at peak southern winter** · **28 `lateSeason:true` eligible** · **82 N. hemi off-season** |
| **TOTAL** | **373** | Verified via bracket-walk eval. Never use grep — it undercounts. |

### Structural Integrity

| Check | Result | Δ from Jul 7 |
|-------|--------|--------------|
| Valid venue objects | ✅ 373 | +3 (net: −2 dups, +5 new) |
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| `lateSeason:true` venues | ✅ 28 (up from 25) | +3 new glacier venues |
| GEAR_ITEMS refs | ✅ 0 | — |
| skiPass coverage | ✅ 133/133 (34 Epic / 53 Ikon / 46 independent) | +2 independent (new ski) |
| Ratings range | ✅ 4.00–4.99, avg 4.71 | — |
| Brace balance | ✅ 5568/5568 | — |
| Logical duplicate venue pairs | ✅ **RESOLVED** (`bigsky` + `beach_miami` removed) | ✅ Fixed this run |
| Placeholder-tag venues | ✅ **RESOLVED** (5 venues updated) | ✅ Fixed this run |
| **Borabora lateSeason bug** | ⚠️ **Open** — beach venue has ski flag | New finding |
| **lateSeason:true overuse** | ⚠️ **Open** — ~19 ski venues incorrectly flagged | New finding |
| Photo max repeat | ⚠️ 4× (beach) / 3× (ski) | Unchanged from Jul 7 |

---

## 2. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx → 0` — Amazon cut for v1. **Do not restore.**

---

## 3. Seasonal Relevance (Jul 8, 2026)

**Beach — Peak Season.** 240 beach venues; ~185 N. hemisphere at maximum summer scoring. Mediterranean, Caribbean, SE Asia, Hawaii all firing. ~55 S. hemisphere beach suppressed by <18°C water-temp cap (correct behavior).

**Skiing — Southern Hemisphere Peak.** 23 S. hemisphere venues in peak winter:
- NZ: 4 venues (Remarkables, Treble Cone, Coronet Peak, Cardrona) — ZQN
- Chile: 7 venues (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Pucon) — SCL/ZCO
- Australia: 6 venues (Thredbo, Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass) — SYD/MEL/CBR
- Argentina: 6 venues (Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor) — BRC/MDZ/CPC/NQN/USH

**Glacier skiing (July-open, N. hemi):** 28 venues with `lateSeason:true` including newly-added Les Deux Alpes, Saas-Fee, St. Moritz. Confirmed open in July: Whistler (glacier), Zermatt (Klein Matterhorn), Val Thorens (Caron), Cervinia (plateau), Les Deux Alpes (3200m+), Saas-Fee (year-round), St. Moritz (Corvatsch).

---

## 4. New Findings — Scoring Flags (Requires PM Decision, No Fix Applied)

### 🔴 borabora has `lateSeason:true` — beach venue with ski flag

`borabora` (Bora Bora Lagoon, lat:-16.5, **beach** category) carries `lateSeason:true`. This flag is a ski-only construct that bypasses the off-season binary cap when `snow_depth_max >= 0.5m`. Harmless currently because `scoreVenue` only applies the snow-depth bypass in the skiing path, but it's a data quality error that should be cleaned up.

**Fix (one field change, no algorithm impact):** Remove `lateSeason:true` from the `borabora` venue object. This is a data correction, not a scoring change. Can be done without algorithm critique.

### 🟠 `lateSeason:true` Overuse on N. Hemisphere Ski Venues

~19 of the 28 `lateSeason:true` venues actually close in April and have no summer skiing. In July, if Open-Meteo reports residual snow depth ≥ 0.5m at elevation (common), these closed resorts incorrectly bypass the off-season cap and may surface on the front page over open Southern hemisphere resorts.

**Confirmed correctly flagged:** whistler, zermatt, val-thorens, snowbird, verbier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.

**Incorrectly flagged (close April, no summer ski):** breckenridge, grandtarghee, courchevel, kitzbuehel, winter-park, copper-mountain, mt-bachelor, sugarloaf, revelstoke, lake-louise, engelberg, crans-montana, beaver-creek, park-city-mountain, fernie, kimberley, nakiska, meribel, les-menuires.

**PM decision required:** Remove `lateSeason:true` from the 19 incorrectly flagged venues, or accept that closed Northern resorts may sporadically surface in July when snow depth reports are non-zero. This affects the accuracy of the Southern-hemisphere summer differentiator.

---

## 5. Photo Audit

| Category | Venues | Unique Photos | Max Repeat | Target |
|----------|--------|---------------|------------|--------|
| Skiing | 133 | ~54 | 3× | ≤2× |
| Beach | 240 | ~87 | 4× | ≤3× |

Photo dedup (June 2026) targets degraded as batch venues were added. Re-running `scripts/photo-dedup.cjs` requires sourcing ~30+ new verified beach photos and ~20 ski photos. Deferred until Unsplash API key is available or a curated pool is assembled. **Not a user-facing issue at current MAU** — revisit when photo scroll becomes a reported complaint.

---

## 6. Content Quality

- **All 373 venue tags now differentiated** — the 5 placeholder-tag ski venues fixed this run.
- **Surf-legacy tags** (26 beach venues with "Surf Breaks", "Windsurfing", etc.) — **VALID, do not remove.** These are legitimate beach activity signals per PM Decision 1 (Jul 7).
- **Tenerife gap:** TFS (Tenerife South) is in AP_CONTINENT but not AIRPORT_COORDS. No Tenerife venue exists. If added, requires: `TFS:{lat:28.0445, lon:-16.5726}` in AIRPORT_COORDS.
- **Crete gap:** HER/CHQ not in AIRPORT_COORDS or AP_CONTINENT. Greece has 14 venues, none on Crete (Elafonissi, Balos — world-class July beaches). Would require adding CHQ/HER to both constants.
- **Gran Canaria gap:** LPA in AP_CONTINENT but not AIRPORT_COORDS. Would require: `LPA:{lat:27.9319, lon:-15.3866}`.

---

## 7. Staged for Next Run — Tenerife + Crete

Two high-value July beach venues to add in the next content run. Require airport constants first.

### Required airport additions:
```javascript
// AIRPORT_COORDS
TFS:{lat:28.0445, lon:-16.5726},  // Tenerife South (already in AP_CONTINENT:"europe")
CHQ:{lat:35.5317, lon:24.1497},   // Chania, Crete

// AP_CONTINENT
CHQ:"europe",  // Crete (Chania) — not yet present
```

### Staged venues:
```javascript
{id:"las-teresitas-tenerife", category:"beach",
  title:"Las Teresitas Beach", location:"Tenerife, Canary Islands",
  lat:28.5168, lon:-16.1791, ap:"TFS",
  icon:"🏖️", rating:4.82, reviews:11200,
  gradient:"linear-gradient(160deg,#1a0d00,#4d2200,#994400)",
  accent:"#ffcc66",
  tags:["Golden Saharan Sand","Teide Volcano Views","Calm Family Bay","Year-Round Sun"],
  photo:"https://images.unsplash.com/photo-1524476312956-b7f7f7b95065?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.55"},

{id:"elafonissi-crete", category:"beach",
  title:"Elafonissi Beach", location:"Crete, Greece",
  lat:35.2717, lon:23.5378, ap:"CHQ",
  icon:"🏝️", rating:4.92, reviews:18400,
  gradient:"linear-gradient(160deg,#001a33,#003366,#0066b3)",
  accent:"#66b3ff",
  tags:["Pink-Tinted Sand","Shallow Lagoon","SW Crete Wild Coast","July Peak Season"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40"},
```

---

## One Observation for the PM

**The `lateSeason:true` overuse is the highest-impact unfixed bug for July.** 19 Northern ski resorts that are closed right now carry this flag. Any that happen to report ≥ 0.5m snow depth at elevation (from lingering glacier snowpack reported by Open-Meteo) will bypass the off-season cap and surface on the front-page above currently-open New Zealand and Argentina lifts. A user in Chicago opening the app this weekend could see Breckenridge (closed since April) ranked over Valle Nevado or Cardrona (open right now). This is the biggest credibility risk at current traffic. Fix requires removing `lateSeason:true` from 19 entries — one Edit call, no algorithm change — but flagged here per CLAUDE.md ("do not modify scoring without algorithm critique"). PM call: approve the fix or document the accepted tradeoff.

---

*Content agent — 2026-07-08 UTC | Venues: 373 (133 ski / 240 beach) · +3 net (−2 dups, +5 new) | Prior: 2026-07-07 (370)*
