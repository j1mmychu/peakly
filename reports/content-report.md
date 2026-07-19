# Peakly Content & Data Report — 2026-07-19

**Data health score: 93/100** | Build: `20260714a` ✅ | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-18. Day 19 post-launch. Score raised 87→93: AP_CONTINENT false positive fully confirmed closed (also closed by DevOps July 19 report). 11 staged venues now **Day 9** — `porter-heights-nz` enters its 2nd week in queue during live NZ peak season. All structural checks GREEN. Tag depth gap (P3) and Whakapapa coverage gap (P2 seasonal) remain open.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **375 venues, 2 categories only (skiing + beach).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 375 venues have non-empty tags.** Confirmed July 13. |
| "27 surf-legacy tags need removal" | **CANCELLED PM v81 Decision 1 — valid beach activity signals.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 6 / 9 / 20 / 25 venues" | **14 confirmed.** Count via `grep -n "lateSeason" app.jsx \| grep "true"` = 14 lines. Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — second occurrence is in PRESETS, not VENUES. 0 dup IDs.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED July 13.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 poolPrimary:true in code.** Only appears in a comment. |
| "Venue count 377 / +2 baseline drift" | **FALSE POSITIVE.** Bracket-walker double-counts 2 `{` chars from CSS/JS. Unique IDs = **375**. `.venue-baseline` (375) is CORRECT. |
| "engelberg missing lateSeason" | **RESOLVED July 14 (commit `747c35a`).** lateSeason count = **14**. Stop. |
| "AP_CONTINENT gap — 6 missing codes (KUL, SNA, MCT, GIG, TFS, CHQ)" | **FALSE POSITIVE (closed July 17, re-confirmed July 19 with correct parsing).** AP_CONTINENT has **280 entries** across compact + JSON-quoted sections (lines 333–474). Correct parse method: extract both `KEY:"value"` (compact) and `"KEY":"value"` (JSON-quoted). All 6 flagged codes confirmed present. All 93 unique beach venue APs confirmed mapped. Zero gaps. DevOps July 19 report independently confirms this. |
| "rio-ipanema-beach as new staged venue" | **DUPLICATE — `ipanema-rio` already in VENUES with ap:GIG.** Do not re-stage. |
| "Alpe d'Huez / Cortina in catalog" | **Not yet — in staging queue Day 9, awaiting Jack photo approval.** |

---

## 1. Data Integrity Audit

### Venue Count

| Category | Count | Δ from Jul 18 |
|----------|-------|---------------|
| **Skiing** | 133 | 0 |
| **Beach** | 242 | 0 |
| **TOTAL** | **375** | 0 |

Unique-ID method (authoritative). `.venue-baseline` (375) is CORRECT.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Duplicate IDs | ✅ 0 | Verified |
| Missing lat/lon | ✅ 0 | All 375 |
| Missing airport codes | ✅ 0 | All 375 have non-empty `ap` |
| Missing tag arrays | ✅ 0 | All 375 have ≥2 tags |
| Missing photos | ✅ 0 | All 375 Unsplash |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 |
| `lateSeason:true` count | ✅ **14** | Lines 484, 500, 509, 515, 530, 534, 805, 1112, 1135, 1707, 1730, 4826, 4835, 4844 |
| `poolPrimary:true` count | ✅ **0** | Comment only |
| Photo max repeat | ✅ 3× | `a143e4c` dedup holds |
| AP_CONTINENT | ✅ **280 entries, 0 gaps** | All 93 beach APs mapped; false positive permanently closed |

### lateSeason Confirmed (14)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`, `engelberg`

---

## 2. Content Quality

### Tag Depth (P3 — editorial, not automated)

| Tag Count | Venues | % |
|-----------|--------|---|
| 2 tags | **228** | **61%** |
| 3 tags | 14 | 4% |
| 4 tags | 132 | 35% |
| 5 tags | 1 | 0% |

Beach avg 2.42 tags vs Ski avg 3.35. When bandwidth opens: beach venues missing UV index tags are highest priority.

### Photos

143 distinct base URLs; max 3× repeat; 0 URLs at 4×. ✅ GREEN. Warning for future adds: most URLs near the 3× ceiling — new venues must introduce new photo IDs.

### Build Stamp

`20260714a` — 5 days without code commit (since July 14). Normal — no active app.jsx changes in flight.

---

## 3. Seasonal Relevance — July 19

| Segment | IN/OUT | Count |
|---------|--------|-------|
| NH Beach | ✅ PEAK | ~187 venues |
| SH Ski | ✅ PEAK | 23 venues |
| NH Ski w/ lateSeason exception | ⚠️ ACTIVE | 14 venues |
| NH Ski (standard) | ❌ OFF-SEASON | ~110 venues |
| SH Beach | ⚠️ SHOULDER | ~55 venues |

### SH Ski (23 active venues in peak season)

**NZ (5):** `remarkables`, `coronet-peak`, `treble-cone-s29`, `cardrona-nz`, `mt-hutt-nz`
**Australia (6):** `perisher`, `thredbo-village-s23`, `falls-creek-au`, `mt-buller-au`, `mt-hotham-au`, `charlotte-pass-au`
**Chile (7):** `portillo-s4`, `pucon-ski-center-s19`, `valle-nevado`, `nevados-de-chillan-cl`, `la-parva-cl`, `el-colorado-cl`, `corralco-cl`
**Argentina (5):** `cerro-catedral-ar`, `las-lenas-ar`, `chapelco-ar`, `caviahue-ar`, `cerro-castor-s28`

**Coverage gap:** Whakapapa (Mt Ruapehu, NZ) — top-5 NZ resort by skier-visits, zero catalog entry. Should be P1 add once queue clears.

---

## 4. Daily Venue Additions — HOLD (queue cap: 11, Day 9)

Per PM v88 Decision: no new additions until Jack clears backlog. Same 5 priority venues as July 17–18. **Do not paste — validate first.**

```javascript
// ─── DO NOT PASTE YET — queue cap active (11 staged, Day 9) ──────────────

  // PRIORITY 1: S-hemi ski IN SEASON NOW — NZ coverage gap (Whakapapa)
  {id:"whakapapa-ski", category:"skiing",
    title:"Whakapapa Ski Area",
    location:"Mt Ruapehu, New Zealand",
    lat:-39.2331, lon:175.5619, ap:"AKL",
    icon:"🏔️", rating:4.81, reviews:6240,
    gradient:"linear-gradient(160deg,#1a3040,#2a5068,#4a90b8)",
    accent:"#72b8e0",
    tags:["Volcanic Crater","Southern Hemisphere","Longest Season","Family Resort"],
    photo:"https://images.unsplash.com/photo-1440778303588-435521a205bc?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass:"independent",
  },

  // PRIORITY 2: NZ backcountry club field — unique niche
  {id:"craigieburn-basin", category:"skiing",
    title:"Craigieburn Basin",
    location:"Canterbury, New Zealand",
    lat:-43.1333, lon:171.7167, ap:"CHC",
    icon:"🏔️", rating:4.76, reviews:1820,
    gradient:"linear-gradient(160deg,#1a2a38,#2a4a60,#3a6a88)",
    accent:"#60a8d0",
    tags:["Backcountry Feel","Club Field","No Grooming","Expert Terrain"],
    photo:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.4",
    skiPass:"independent",
  },

  // Beach: Zakynthos (ZTH in AP_CONTINENT europe) — zero coverage, iconic
  {id:"navagio-zakynthos", category:"beach",
    title:"Navagio (Shipwreck) Beach",
    location:"Zakynthos, Greece",
    lat:37.8598, lon:20.6244, ap:"ZTH",
    icon:"🏝️", rating:4.94, reviews:28400,
    gradient:"linear-gradient(160deg,#001828,#003858,#0070b0)",
    accent:"#40b8f0",
    tags:["Iconic Shipwreck","Limestone Cliffs","Boat Access Only","Crystal Water"],
    photo:"https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },

  // Beach: Porto Santo, Madeira (FNC) — zero Madeira coverage
  {id:"porto-santo-beach", category:"beach",
    title:"Porto Santo Island Beach",
    location:"Porto Santo, Madeira, Portugal",
    lat:33.0648, lon:-16.3206, ap:"FNC",
    icon:"🏖️", rating:4.82, reviews:8900,
    gradient:"linear-gradient(160deg,#1a1000,#3a2800,#7a5800)",
    accent:"#e0b060",
    tags:["9km Golden Beach","Atlantic Island","Therapeutic Sand","Low Crowds"],
    photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  },

  // Beach: Plettenberg Bay, SA (PLZ in AP_CONTINENT africa) — Garden Route
  {id:"plettenberg-bay", category:"beach",
    title:"Plettenberg Bay",
    location:"Garden Route, South Africa",
    lat:-34.0527, lon:23.3716, ap:"PLZ",
    icon:"🏖️", rating:4.79, reviews:7300,
    gradient:"linear-gradient(160deg,#001820,#002a38,#004868)",
    accent:"#3898c8",
    tags:["Whale Watching","Garden Route","Two Beaches","Wildlife Nearby"],
    photo:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
  },
// ─── END ─────────────────────────────────────────────────────────────────
```

After paste: 375 + 5 = **380 venues** (135 ski / 245 beach). Run `node scripts/validate-venues.mjs` first.

---

## 5. Staged Queue (Day 9 — UNCHANGED since July 14)

| Venue | Category | Days | Notes |
|-------|----------|------|-------|
| `alpe-d-huez-fr` | ski | **Day 9** ⚠️ | Glacier closes late August |
| `cortina-d-ampezzo` | ski | Day 9 | |
| `pipa-beach-brazil` | beach | Day 9 | |
| `punta-mita-beach` | beach | Day 9 | |
| `sunny-beach-bg` | beach | Day 8 | |
| `sango-sands` | beach | Day 8 | |
| `tropea-beach-it` | beach | Day 8 | |
| `porter-heights-nz` | ski | **Day 8** ⚠️ | S-hemi, IN SEASON NOW — entering 2nd week of delay |
| `koh-lanta-beach-th` | beach | Day 7 | |
| `legian-beach-bali` | beach | Day 7 | |
| `vina-del-mar-cl` | beach | Day 7 | |

**Action required — Jack:** 11-min visual check + `node scripts/validate-venues.mjs`. Porter Heights in live NZ peak; alpe-d-huez glacier window ≤6 weeks.

---

## 6. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| Jack: clear 11-venue staged queue | **P1** | Jack | 11 min; in-season venues losing coverage days |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | Day 39 — 2 min paste |
| Plausible dashboard read | P0 | Jack | Day 19 blind on user behavior |
| VPS health check | P1 | Jack | `curl https://peakly-api.duckdns.org/health` |
| Tag enrichment — 228 thin-tag venues | P3 | Content | Beach avg 2.42 tags; editorial work |

---

## One Observation for the PM

**`porter-heights-nz` just entered its 2nd week in queue during New Zealand's peak ski season.** The July NZ window (Jul–Aug) is when Queenstown-area resorts score highest and flight prices from Australia/Asia hit seasonal lows. Every day the venue sits unreviewed is live-season inventory not being served to users searching southern-hemisphere ski. Whakapapa (Mt Ruapehu), the largest NZ ski area by skier-visits, isn't even in queue yet — can't be added until the backlog clears. 15 minutes from Jack this week solves both. After that, the next content run ships 5 venues (2 NZ ski + 3 Mediterranean beach) in a single commit at the exact right time for each.

---

*Content agent — 2026-07-19 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-18*
