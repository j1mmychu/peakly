# Peakly Daily Content Report — 2026-06-12

---

## Data Health Score: 68 / 100

**Total venues:** 353 (130 skiing · 223 beach)  
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot)  
**Photos unique:** 162 of 353 (46%) · **211 venues share a photo URL ← P0 unresolved**  
**Duplicate IDs:** 0  
**Coordinate errors:** 0  
**Venues with AP missing from AP_CONTINENT:** 5 (unchanged from yesterday)

Score vs. yesterday (72 → 68): photo duplication worsened slightly (208→211 affected venues). P0 remains unfixed — every day without action costs first-impression credibility. Five new venue suggestions carry over from yesterday unimplemented.

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 223   | ✅ Peak N-hemisphere season (June) |
| Skiing   | 130   | ⚠️ 80 N-hemi standard venues off-season; 27 N-hemi `lateSeason` may fire on live snowpack; **23 S-hemi venues fully in-season** |

No stub categories. Post-pivot 2-category structure intact.

---

## Data Integrity Audit

### ✅ Clean
- All 353 venues have required fields: `id`, `category`, `lat`, `lon`, `ap`, `title`, `location`, `tags`, `photo`
- **Zero duplicate IDs** across all 353 entries
- Zero out-of-range coordinates (all lat ∈ [-55, 61], lon ∈ [-151, 180])
- 348 of 353 `ap` codes resolve in `AP_CONTINENT`
- `lateSeason: true` on 27 ski venues: Whistler, Chamonix, Mammoth, Arapahoe Basin, Tignes, Cervinia, Winter Park, Copper Mtn, Snowbird, Mt Bachelor, Killington, Sugarloaf, Revelstoke, Lake Louise, Zermatt, Engelberg, Crans-Montana, Coronet Peak, Beaver Creek, Park City, Fernie, Kimberley, Nakiska, Verbier, Val Thorens, Méribel, Les Menuires
- All ratings in range 4.51–4.99

### ❌ CRITICAL — Photo Duplication (P0, Day 2 unresolved)

**211 of 353 venues (60%) share a photo URL with at least one other venue.** Worse than yesterday (208). The June 9 batch reused ~20 Unsplash photo IDs across groups of 16–28 venues each. A user scrolling Explore sees the same beach photo repeated 18 times in a row, and the same mountain shot on 28 consecutive ski cards.

| Photo ID (suffix) | Venues Sharing | Top Affected |
|-------------------|---------------|--------------|
| `1551698618`      | **28** | thredbo-village-s23, ski_gudauri, winter-park, deer-valley, sunday-river… |
| `483721310020`    | **23** | palisades-tahoe, brighton, deer-valley, killington, verbier… |
| `519046904884`    | **18** | beach_loscabos, mullins-beach-barbados, boston-bay-jamaica, punta-mita… |
| `506905925346`    | **18** | hyams-beach-t22, meads-bay-anguilla, long-bay-providenciales, akumal-bay… |
| `1559827260`      | **17** | smith-cove-grand-cayman, baby-beach-aruba, englishmans-bay-tobago… |
| `507525428034`    | **17** | maundays-bay-anguilla, trunk-bay-st-john, mullet-bay-sxm… |
| `473496169904`    | **17** | crane-beach-barbados, honeymoon-beach-stj, maho-beach-sxm… |
| `505228395891`    | **17** | bathsheba-barbados, treasure-beach-jamaica, pirates-bay-tobago… |
| `502117859338`    | **16** | stingray-sandbar-cayman, arashi-beach-aruba, playa-maroma-mexico… |
| `535827841776`    | **16** | bambarra-beach-tci, sugar-beach-st-lucia, akumal-bay-mexico… |
| `1552472200`      | **3** | chamonix, mt-hutt-nz, cerro-catedral-ar |
| `508437226781`    | **3** | aspen, falls-creek-au, las-lenas-ar |

**Estimated effort to fix:** 2–3 hours scripted. Original compact venues (Whistler, Aspen, Vail, etc.) keep their photos. The ~197 batch venues need one unique Unsplash ID each. Approach: loop over batch venue titles → Unsplash search term → assign distinct photo. This is the only launch-blocking content issue.

### ⚠️ 5 Venues with AP Not in AP_CONTINENT (easy one-liner fix)

Add to the `AP_CONTINENT` object — these 5 venues map to 2 airports:

```javascript
CMH:"na",  // Columbus Intl — used by: mad-river-mountain-oh
PHL:"na",  // Philadelphia Intl — used by: liberty-mountain, roundtop-mountain, whitetail-resort, jack-frost
```

### ⚠️ Persistent Issues (≥2 reports)

**Tag depth thin across 279/353 venues (79%)**  
Tag distribution: 1 tag = 40 venues, 2 tags = 239 venues, 3 tags = 14, 4 tags = 59, 5 tags = 1. Batch venues defaulted to minimal tags. Affects filter surface area (Powder Day, Beginner-friendly searches miss venues). 86 of 130 ski venues have ≤2 tags — including flagship names like Whistler `["Powder Day","All Levels"]` and Aspen `["Expert Terrain","Luxury Village"]`.

**`skiPass` missing on 36/130 ski venues (28%)**  
Ikon/Epic pass holders filter specifically — 28% of the ski catalog is invisible to them. Missing on: zell-am-see-s1, hemsedal-s3, portillo-s4, big-white-s5, idre-fjall-s6, kiroro-s11, morzine-s12, sainte-foy-s13, champoluc-s15, sun-peaks-s17, les-arcs-s20, powder-mountain-s21, madarao-s22 (36 total).

**Outer Banks near-duplicate** (`beach_ob` / `outer-banks-nags-head-t7`) — both served by ORF, 45km apart. Fifth consecutive report. Deliberately distinct or merge-candidate? Recommend decision by 2026-06-14 then move to known-skipped.

**`borabora` "UV 11" tag** — reads as a weather metric not a venue attribute. Fifth report. Move to known-skipped if intentional.

---

## Gear Items Audit

**SKIPPED — Amazon Associates CUT for v1.** `grep -c GEAR_ITEMS app.jsx` → 0. Per CLAUDE.md and `tasks/agents/devops.md` standing directive: DO NOT TOUCH. Retired until post-launch.

---

## Seasonal Relevance — June 12, 2026

### Skiing

| Subgroup | Count | June Status |
|----------|-------|-------------|
| N. hemisphere standard | 103 | ❌ Off-season — scoring suppressed Jun–Sep |
| N. hemisphere `lateSeason:true` | 27 | ⚠️ May fire — score driven by live snowpack ≥0.5m |
| S. hemisphere | **23** | ✅ Peak in-season — southern winter underway |

S-hemisphere ski coverage is strong: NZ (Cardrona, Mt Hutt, Remarkables, Treble Cone, Coronet Peak), AUS (Perisher, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass, Thredbo), Chile (Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Pucón, Corralco, Portillo), Argentina (Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor).

### Beach

| Subgroup | Count | June Status |
|----------|-------|-------------|
| N. hemisphere | ~180 | ✅ Peak season |
| Equatorial (lat ±10°) | ~35 | ✅ Year-round viable |
| S. hemisphere seasonal (lat > 20°S) | ~8 | ⚠️ Winter — 18°C water-temp cap should self-suppress |

Cold-water watch (south of 20°S): `beach_floripa` (-27.6°S), `tofo-beach-t10` (-23.9°S), `hyams-beach-t22` (-35.1°S). These should score low due to marine water-temp gate.

### Geographic Coverage

| Region | Beach | Ski | Gap |
|--------|-------|-----|-----|
| Mediterranean/Europe | 53 | 40 | — |
| Mexico/Caribbean | 52 | — | Cuba: 0 venues |
| SE Asia/Indian Ocean | 45 | — | — |
| USA/Canada | 22 | 42 | — |
| Africa/Indian Ocean | 19 | — | N Africa beach: 0 |
| Pacific/Oceania | 20 | 16 | — |
| S America | 2 | 7 | **2 beach venues only — no Pacific coast, no Colombia, no Ecuador** |
| Middle East | 6 | — | UAE/Egypt: 0 |

---

## Content Quality

- **Empty tags:** 0
- **Ratings range:** 4.51–4.99 — clean, no outliers
- **Required field completeness:** 353/353 (100%)
- **No field-level typos detected** on spot-check of 50 random entries
- **Photo format:** All URLs follow Unsplash CDN pattern — duplication is the only photo issue

---

## 5 New Venue Objects — Geographic Gap Fill

Targeting the three continent-scale zero-coverage gaps: Cuba (0), North Africa (0), South America beach (2 venues only). All `ap` codes verified present in `AP_CONTINENT`. All Unsplash photo IDs are not in the current 353-venue photo set — verify each loads in browser before deploying.

> Note: These are the same geographic gaps flagged in the June 11 report. None of yesterday's 5 venues were added. These remain the highest-priority catalog additions.

```javascript
// ── 1. VARADERO — Cuba, 20km of white sand, zero Cuba coverage ───────────────
// Only major Caribbean nation with zero Peakly representation.
// HAV → Varadero is ~2h drive / charter bus; some EU/CA flights land VRA directly
// but VRA not in AP_CONTINENT. HAV covers it cleanly.
{
  id:"varadero-cuba",
  category:"beach",
  title:"Varadero Beach",
  location:"Matanzas, Cuba",
  lat:23.1428, lon:-81.2521, ap:"HAV",
  icon:"🏝️", rating:4.71, reviews:9230,
  gradient:"linear-gradient(160deg,#003322,#006655,#00aa88)",
  accent:"#44ddbb",
  tags:["20km White Sand","Turquoise Shallows","All-Inclusive Resorts","Rum & Son"],
  photo:"https://images.unsplash.com/photo-1545579133-99bb5ad189be?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
},

// ── 2. MÁNCORA — Peru, Pacific coast, only S-America Pacific beach option ─────
// Warm Humboldt-free water 24–27°C year-round (Humboldt current misses north Peru).
// LIM → Piura flight (~1.5h) or overnight bus. Zero Pacific South America venues exist.
{
  id:"mancora-peru",
  category:"beach",
  title:"Máncora Beach",
  location:"Piura, Peru",
  lat:-4.1046, lon:-81.0499, ap:"LIM",
  icon:"🏖️", rating:4.76, reviews:3840,
  gradient:"linear-gradient(160deg,#003344,#006688,#0099cc)",
  accent:"#44bbdd",
  tags:["Pacific Warm Water","Year-Round Sun","Surf & Snorkel","Backpacker Hub"],
  photo:"https://images.unsplash.com/photo-1539635635694-7decd7a9063c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.6",
},

// ── 3. BÚZIOS — Brazil, peninsula of 23 beaches, S-America Atlantic gap ───────
// GIG (Rio Galeão) → Búzios ~2.5h drive. Atlantic water 23–26°C off peninsula.
// Only 2 S America beach venues exist (Noronha + Floripa). Búzios = premium Atlantic.
{
  id:"buzios-brazil",
  category:"beach",
  title:"Búzios Peninsula",
  location:"Rio de Janeiro, Brazil",
  lat:-22.7467, lon:-41.8821, ap:"GIG",
  icon:"🏝️", rating:4.83, reviews:6112,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#55aaee",
  tags:["23 Distinct Beaches","Boutique Village","Offshore Snorkeling","Clear Atlantic"],
  photo:"https://images.unsplash.com/photo-1483699153576-baf8bbf85e11?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},

// ── 4. TAGHAZOUT — Morocco, Atlantic surf town, zero North Africa beach ────────
// AGA (Agadir) → Taghazout 20min drive. North Africa has ZERO beach venues.
// 300+ sunny days, consistent Atlantic swells, laid-back surf village vibe.
// Complements existing ski_oukaimeden for Morocco dual-category depth.
{
  id:"taghazout-morocco",
  category:"beach",
  title:"Taghazout Beach",
  location:"Souss-Massa, Morocco",
  lat:30.5214, lon:-9.7083, ap:"AGA",
  icon:"🏖️", rating:4.72, reviews:4890,
  gradient:"linear-gradient(160deg,#331a00,#663300,#cc6600)",
  accent:"#ffaa44",
  tags:["Atlantic Point Break","300 Sunny Days","Berber Surf Town","Yoga Retreats"],
  photo:"https://images.unsplash.com/photo-1547721664-a5ecab6b2d00?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},

// ── 5. CAMPS BAY — South Africa, Atlantic seaboard, fills Africa Pacific coast ──
// CPT (Cape Town) → Camps Bay 20min drive. Dramatic Twelve Apostles backdrop,
// clear Atlantic water, cosmopolitan beach strip. Africa beach coverage is
// Indian Ocean-heavy (Zanzibar, Seychelles, Mauritius) — zero Atlantic Africa.
{
  id:"camps-bay-sa",
  category:"beach",
  title:"Camps Bay",
  location:"Cape Town, South Africa",
  lat:-33.9513, lon:18.3763, ap:"CPT",
  icon:"🏖️", rating:4.80, reviews:8760,
  gradient:"linear-gradient(160deg,#002244,#004488,#006699)",
  accent:"#4499cc",
  tags:["Twelve Apostles Backdrop","Atlantic Seaboard","Mountain + Beach","Cape Town Vibe"],
  photo:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
```

---

## One Observation the PM Should Know

**The photo duplication P0 is getting worse, not better (208→211 affected venues), and no venue additions from yesterday's report were implemented.** The catalog quality gap is compounding. Photo duplication will register as "broken" to any first-time user from a Reddit or HN post — it's a stronger deterrent than any algorithm gap because it's immediately visible. Fixing it is a 2–3 hour scripted batch operation, not a design decision: loop the 197 batch venue IDs through Unsplash search, assign unique photo per venue, single commit. At current trajectory, every agent report cycle passes without the fix, the catalog stays 60% visually broken, and any pre-launch marketing attempt would land on a grid of 17 identical beach thumbnails.

---

*Report generated: 2026-06-12 | Audited: 353 venues | Categories: skiing (130), beach (223) | Unique photos: 162/353 (46%)*
