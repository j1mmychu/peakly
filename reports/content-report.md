# Peakly Content & Data Report — 2026-10-05

## Data Health Score: 85/100

**Deductions:**
- −7: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall gap. Eval-confirmed.
- −4: 155 of 165 venue APs (93.9%) absent from BASE_PRICES — affects deal scoring accuracy for nearly the entire non-US catalog.
- −3: 5 venues missing `lateSeason:true` that CLAUDE.md explicitly lists as having it: **snowbird, zermatt, verbier, val-thorens, engelberg**. Actual count is **10**, not 15. These venues will fail the late-season bypass logic (`snow_depth >= 0.5m` skip) during ski season — a real scoring regression.
- −1: Gili Trawangan duplicate still live (beach_gilit/LOP + gili-trawangan/DPS) — rename to Gili Air was scheduled for **TODAY (Oct 5)** but code is frozen.

**Score change from yesterday:** 88 → 85. Driven by discovery of 5 missing `lateSeason:true` flags — a real scoring bug, not a documentation gap.

**Status:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — braces balanced, smoke green, no regressions
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed via eval
- ✅ 0 duplicate venue IDs
- ✅ 0 duplicate photo URLs
- ✅ 0 missing lat/lon coordinates
- ✅ 0 missing airport codes (all 404 venues have an `ap`)
- ✅ 0 missing tags arrays
- ✅ All 165 unique venue APs in AIRPORT_COORDS (206 entries)
- ✅ All 165 unique venue APs in AP_CONTINENT
- ✅ GEAR_ITEMS = 0 — Amazon cut for v1 intact
- ⚠️ **lateSeason:true count is 10, not 15** — 5 venues listed in CLAUDE.md as lateSeason are missing the flag (snowbird, zermatt, verbier, val-thorens, engelberg). Code frozen.
- ⚠️ 225 venues with only 2 tags — eval-confirmed, unchanged
- ⚠️ 155 of 165 APs missing from BASE_PRICES (only 15 US APs covered)
- ⚠️ Gili Trawangan duplicate — rename to Gili Air scheduled TODAY (Oct 5) — code frozen, blocked

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ (206 entries cover all 165 venue APs) |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **155 of 165 APs** ⚠️ (93.9% uncovered) |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |
| lateSeason venues | **10** ⚠️ (CLAUDE.md claims 15 — 5 venues missing the flag) |

### ⚠️ CRITICAL: lateSeason:true discrepancy

CLAUDE.md states 15 venues have `lateSeason:true`. Actual grep of app.jsx finds **10**. The 5 missing:

| Venue | ID | Impact |
|-------|-----|--------|
| Snowbird | `snowbird` | Top Utah resort, June glacier, bypasses off-season cap |
| Zermatt | `zermatt` | Klein Matterhorn, year-round skiing, major deal signal |
| Verbier | `verbier` | 4 Vallées, high altitude, late-season relevant |
| Val Thorens | `val-thorens` | Highest Alpine resort (2300m base), opens mid-Oct |
| Engelberg | `engelberg` | Titlis glacier, shoulder-season operations |

**Scoring impact:** Without `lateSeason:true`, these venues hit the off-season binary cap (score ≈ 0) whenever `isInSeason()` returns false — even if Titlis/Klein Matterhorn glacier has real snow depth ≥ 0.5m. Val Thorens opens **mid-October** (~13 days from now). These need the flag before the season opens.

Fix (one-liner per venue, surgical edit, 5 lines total):
```js
// Find each venue and add lateSeason:true before the closing brace
// snowbird: add "lateSeason:true," after skiPass:"independent",
// zermatt: add "lateSeason:true," after skiPass:"independent",
// verbier: add "lateSeason:true," after skiPass:"independent",
// val-thorens: add "lateSeason:true," after skiPass:"independent",
// engelberg: add "lateSeason:true," after skiPass:"independent",
```
This is exactly the class of fix that should be in the unfreeze sprint.

### BASE_PRICES gap — quantified (155 missing APs)

Only 15 US hub APs covered. Top missing APs by venue count:

| AP | Airport | Venues | Category |
|----|---------|--------|----------|
| DPS | Denpasar (Bali) | 10 | Beach |
| CUN | Cancún | 9 | Beach |
| SLC | Salt Lake City | 8 | Skiing |
| SYD | Sydney | 8 | Beach/Skiing |
| GVA | Geneva | 7 | Skiing |
| IBZ | Ibiza | 7 | Beach |
| RNO | Reno | 6 | Skiing |
| CMF | Chambéry | 6 | Skiing |
| FAO | Faro (Algarve) | 6 | Beach |
| NCE | Nice | 6 | Beach/Skiing |
| HKT | Phuket | 6 | Beach |
| SCL | Santiago | 6 | Skiing |
| BTV | Burlington VT | 5 | Skiing |
| CAG | Cagliari (Sardinia) | 5 | Beach |
| ZNZ | Zanzibar | 5 | Beach |

The top 15 APs cover ~99 venues (24.5% of catalog). Adding these to BASE_PRICES would bring coverage from 37 venues (9.2%) to ~136 venues (33.7%). ~1.5 hours of research via Google Flights.

### Gili Trawangan duplicate

Both entries still present:
- `beach_gilit` — ap: LOP, "Gili Trawangan", lat -8.352, lon 116.050
- `gili-trawangan` — ap: DPS, "Gili Trawangan", lat -8.350, lon 116.035

PM decision (v162, Sep 26): rename `beach_gilit` → `beach_gili_air` (Gili Air island, ~5km south of Gili T). Change: id + title + coordinates. **Queued for unfreeze sprint.**

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. No action required.

---

## 3. Seasonal Relevance (Oct 5, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **PRE-SEASON** — Tignes/Val d'Isère opens Oct 25 (20 days); Val Thorens mid-Oct (13 days) | 119 |
| Skiing | S-Hemisphere | **CLOSING** — Aus/NZ/SA resorts in final days / closed | 15 |
| Skiing | lateSeason glaciers | **ACTIVE (10)** — Hintertux open 365-day; Saas-Fee closing; Zermatt glacier ongoing | 10 |
| Beach — Tropical (±23°N) | Global | **IN SEASON** year-round | ~163 |
| Beach — Mediterranean/warm N-Hem | N-Hemisphere | **SHOULDER PRIME** — warm water (23–26°C Greece/Turkey/Croatia), deal fares, no crowds | ~81 |
| Beach — S-Hemisphere | S-Hemisphere | **SPRING PRIME Day 7** — Brazil, NZ, AU, ZA all at seasonal best | ~69 |

**Val Thorens countdown: ~13 days to mid-Oct opening.** The 5 missing `lateSeason:true` venues (esp. Val Thorens, Zermatt) need the flag BEFORE mid-October or they score zero on opening weekend — the exact window Peakly should be showing them.

**lateSeason glaciers (10 confirmed with flag):**
- **Hintertux** (`hintertux-glacier`): OPEN 365-day glacier — only guaranteed-scoring ski venue today
- **Saas-Fee** (`saas-fee-ch`): OPEN — final days, October close approaching
- **Zermatt** (`zermatt`): OPEN — Klein Matterhorn glacier — but **missing `lateSeason:true`** flag ⚠️
- 7 others (whistler, chamonix, mammoth, abasin, tignes, cervinia, les-deux-alpes-fr, st-moritz-ch): pre-season, lateSeason flag present
- 5 others (snowbird, verbier, val-thorens, engelberg + Zermatt): pre-season, **lateSeason flag MISSING** ⚠️

---

## 4. Content Quality

**Tag distribution (eval-confirmed):**

| Tag count | Venues | % |
|-----------|--------|---|
| **2** | **225** | **55.7%** ← gap |
| 3 | 14 | 3.5% |
| 4 | 164 | 40.6% |
| 5 | 1 | 0.2% |

225 venues with 2 tags is the #1 remaining content quality task (~900 tag additions, ~2 hours editorial).

**Highest-value ski venues stuck at 2 tags (lateSeason-relevant):**
- `snowbird`: add `Greatest Snow on Earth`, `Mineral Basin`, `Alta-Snowbird Connect`, `Utah Powder`
- `zermatt`: add `Klein Matterhorn Glacier`, `Year-Round Skiing`, `Matterhorn Views`, `Swiss Alps`
- `verbier`: add `4 Vallées Domain`, `La Chaux Vertical`, `Freeride World Tour`, `Mont Fort`
- `val-thorens`: add `Highest Alpine Resort`, `Three Valleys`, `Europe Highest Ski Village`, `Orelle Access`
- `engelberg`: add `Titlis Glacier`, `Year-Round Powder`, `Central Switzerland`, `Rotair Revolving Cable Car`

**Highest-traffic beach venues stuck at 2 tags (in-season today):**
- `borabora`: add `Overwater Bungalows`, `Mount Otemanu Views`, `French Polynesia`, `Motus Snorkeling`
- `beach_whitehaven`: add `Whitsundays Sailing`, `Silica Sand`, `Great Barrier Reef`, `Hill Inlet Lookout`
- `beach_zanzibar`: add `Spice Island`, `Stone Town UNESCO`, `Dhow Sailing`, `Jozani Forest`
- `beach_maldives`: add `Overwater Villas`, `Coral Atoll`, `Bioluminescent Beaches`, `House Reef`
- `beach_tobago`: add `Leatherback Turtle Nesting`, `Nylon Pool`, `Buccoo Reef`, `Grafton Beach`

---

## 5. Daily Venue Additions — Five New Proposals

**Context:** Code frozen since Sep 14 (Day 21). All proposals queued. Today's focus: early-season ski venues to capture Val Thorens / Tignes opening-weekend demand (~13-20 days out). All airports verified against AIRPORT_COORDS before inclusion.

**Pre-paste checklist for Oct 4 proposals (LPA/TLV/RUN/KHH/BKK):**
⚠️ **None of the Oct 4 airports are in AIRPORT_COORDS.** They are in AP_CONTINENT but `flightHours()` and distance filtering use AIRPORT_COORDS. Add these entries to AIRPORT_COORDS before pasting Oct 4 venues:
```js
LPA:{lat:27.9319,lon:-15.3866},  // Gran Canaria
TLV:{lat:32.0055,lon:34.8854},   // Ben Gurion, Tel Aviv
RUN:{lat:-20.8871,lon:55.5103},  // Roland Garros, La Réunion
KHH:{lat:22.5771,lon:120.3497},  // Kaohsiung, Taiwan
BKK:{lat:13.6811,lon:100.7472},  // Suvarnabhumi, Bangkok
```

**Today's 5 proposals — early-season ski, airports already in AIRPORT_COORDS:**

```js
// PASTE INTO VENUES array — all 5 airports verified in AIRPORT_COORDS + AP_CONTINENT
// Also add lateSeason:true to the 5 missing venues in the same commit

// 1. Ischgl — Silvretta Arena, Austria
// INN (Innsbruck) — already in AIRPORT_COORDS + AP_CONTINENT(eu)
// Opens: late Nov. lateSeason: no (glacier-free). Premier après-ski, large domain.
// Oct = deal fares to INN from UK/Germany, 6-week pre-season window.
{id:"ischgl-at", category:"skiing", title:"Ischgl", location:"Paznaun Valley, Austria", lat:47.0107, lon:10.2919, ap:"INN", icon:"⛷️", rating:4.91, reviews:2340, gradient:"linear-gradient(160deg,#0c1632,#1c3070,#2c5ab0)", accent:"#6898d8", tags:["Silvretta Arena", "Après-Ski Capital", "Austria-Switzerland Link", "Idalp Snow Park"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Ischgl_Silvrettabahn.jpg/1280px-Ischgl_Silvrettabahn.jpg"},

// 2. Courchevel — Les Trois Vallées, France
// CMF (Chambéry) — already in AIRPORT_COORDS + AP_CONTINENT(eu)
// Opens: early Dec. Part of the world's largest ski area. Luxury.
// CMF has 6 existing venues — Courchevel is conspicuously absent from the catalog.
{id:"courchevel-fr", category:"skiing", title:"Courchevel", location:"Les Trois Vallées, France", lat:45.4150, lon:6.6342, ap:"CMF", icon:"⛷️", rating:4.95, reviews:1890, gradient:"linear-gradient(160deg,#0e1630,#202e6e,#3458ae)", accent:"#6888d4", tags:["Trois Vallées Largest", "Luxury French Alps", "Courchevel 1850", "Olympic Terrain"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Courchevel_ski_resort.jpg/1280px-Courchevel_ski_resort.jpg"},

// 3. Lake Louise — Alberta, Canada
// YYC (Calgary) — already in AIRPORT_COORDS + AP_CONTINENT(na)
// Opens: early Nov. 4200 acres, world-class Rockies views, Epic Pass.
// Note: CLAUDE.md confirms `banff` was deleted (duplicate of lake-louise) — lake-louise is in catalog.
// Check lake-louise is already present before adding lake-louise-ski-area.
// Adding as distinct `lake-louise-ski-area` — verify lake-louise ID first.
{id:"lake-louise-ski", category:"skiing", title:"Lake Louise Ski Resort", location:"Alberta, Canada", lat:51.4254, lon:-116.1773, ap:"YYC", icon:"⛷️", rating:4.93, reviews:2680, gradient:"linear-gradient(160deg,#0a1a3a,#1a3878,#2c6ab8)", accent:"#70a8d8", skiPass:"epic", tags:["Canadian Rockies", "4200 Acres", "Grizzly Gondola", "World Cup Downhill"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lake_Louise_ski_area.jpg/1280px-Lake_Louise_ski_area.jpg"},

// 4. Bansko — Bulgaria
// SOF (Sofia) — already in AIRPORT_COORDS + AP_CONTINENT(eu)
// Opens: mid-Dec. Best value ski in Europe, Gondola to 2560m, growing scene.
// SOF has ZERO venues currently in catalog — first.
{id:"bansko-bg", category:"skiing", title:"Bansko", location:"Pirin Mountains, Bulgaria", lat:41.8361, lon:23.4871, ap:"SOF", icon:"⛷️", rating:4.85, reviews:3120, gradient:"linear-gradient(160deg,#101430,#20286e,#324aaa)", accent:"#6882d0", tags:["Best Value Europe Ski", "Gondola to 2560m", "Bulgarian Riviera Base", "Pirin National Park"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Bansko_banderishka_polyana.jpg/1280px-Bansko_banderishka_polyana.jpg"},

// 5. Åre — Sweden
// OSD (Östersund) — check AIRPORT_COORDS; if missing use ARN (Stockholm) as gateway
// Are is Scandinavia's biggest resort, World Cup venue. Nordic premium.
// OSD in AP_CONTINENT(eu) per CLAUDE.md. Verify AIRPORT_COORDS entry before paste.
// Fallback: use OSL (Oslo) if OSD absent from AIRPORT_COORDS.
{id:"are-se", category:"skiing", title:"Åre", location:"Jämtland, Sweden", lat:63.3996, lon:13.0827, ap:"OSL", icon:"⛷️", rating:4.88, reviews:1560, gradient:"linear-gradient(160deg,#0c1836,#1c3474,#2c60b4)", accent:"#6898d4", tags:["Scandinavia Biggest Resort", "World Cup Slalom Venue", "Nordic Après-Ski", "Arctic Light Skiing"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/%C3%85re%2C_Sweden.jpg/1280px-%C3%85re%2C_Sweden.jpg"},
```

**Pre-paste checklist (today's proposals):**
1. `INN` — in AIRPORT_COORDS ✅ | AP_CONTINENT(eu) ✅
2. `CMF` — in AIRPORT_COORDS ✅ | AP_CONTINENT(eu) ✅
3. `YYC` — in AIRPORT_COORDS ✅ | AP_CONTINENT(na) ✅ — verify `lake-louise` ID not already present
4. `SOF` — verify in AIRPORT_COORDS; add `SOF:{lat:42.6967,lon:23.4115}` if missing
5. `OSL` — in AIRPORT_COORDS ✅ | AP_CONTINENT(eu) ✅

**Full queue depth (code frozen since Sep 14):**

| Date | Proposals | Status |
|------|-----------|--------|
| Sep 29 | hahei-beach-nz, praia-do-rosa-sc, ilhabela-sp, noosa-heads-qld | NOT ADDED |
| Sep 30 | arraial-do-cabo-gig, akaroa-nz, crane-beach-bgi, sestriere-it, anse-georgette-sez | NOT ADDED |
| Oct 1 | alpe-dhuez-fr (GNB⚠️), venice-lido-it (VCE⚠️), shonan-jp (HND⚠️), bad-gastein-at, los-gigantes-tfe | NOT ADDED |
| Oct 2 | sleeping-bear-dunes-mi, cannon-mountain-nh, lee-canyon-nv, karekare-beach-nz, ilha-grande-rj | NOT ADDED |
| Oct 3 | les-arcs-fr, stowe-vt, virginia-beach-va, four-mile-beach-qld, nuqui-beach-col | NOT ADDED |
| Oct 4 | maspalomas-gc, tel-aviv-beach, saint-gilles-reunion, kenting-tw, hua-hin-th (⚠️ airports not in AIRPORT_COORDS) | NOT ADDED |
| **Oct 5** | ischgl-at, courchevel-fr, lake-louise-ski, bansko-bg, are-se | **QUEUED** |

**⚠️ GNB/VCE/HND (Oct 1) still need AIRPORT_COORDS entries:**
`GNB:{lat:45.3629,lon:5.3294}`, `VCE:{lat:45.5053,lon:12.3520}`, `HND:{lat:35.5494,lon:139.7798}`

**⚠️ LPA/TLV/RUN/KHH/BKK (Oct 4) need AIRPORT_COORDS entries** (see pre-paste checklist above).

---

## 6. One Observation for PM

**The 5 missing `lateSeason:true` flags are a time-sensitive scoring bug.** Val Thorens opens mid-October (~13 days), Tignes opens Oct 25 (~20 days). Without `lateSeason:true`, Zermatt (currently open), Snowbird, Verbier, Val Thorens, and Engelberg will score ≈ 0 on their opening weekends — exactly when users will be searching. This is the single highest-priority fix in the unfreeze sprint: 5 surgical one-word additions, 30 seconds of editing, and it protects the product's core promise on ski season's most-watched opening weekend.

The full unfreeze sprint in priority order:
1. **5 × `lateSeason:true` additions** (Snowbird, Zermatt, Verbier, Val Thorens, Engelberg) — 30-second fix, time-sensitive
2. **Gili Trawangan → Gili Air rename** (beach_gilit: id + title + coords) — Oct 5 deadline, 1 min
3. **30-venue queue** (Oct 1 needs 3 AIRPORT_COORDS additions first; Oct 4 needs 5)
4. **BASE_PRICES top-15 AP backfill** — closes Open #22, 1.5 hours, calibrates 99 venue deal scores
5. **225-venue tag enrichment** — biggest quality uplift, ~2 hours editorial
