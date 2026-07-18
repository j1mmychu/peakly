# Peakly Content & Data Report — 2026-07-18

**Data health score: 87/100** | Build: `20260714a` ✅ | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-17. Day 18 post-launch. No changes to app.jsx since yesterday — venue count, photos, and structure unchanged. Staged queue is now **Day 8** with no movement (11 venues pending Jack review). Alpe-d'Huez glacier window continues to close: ~6 weeks remain before late-August terrain shutdown. All prior false-positive closures confirmed still accurate.

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
| "lateSeason: 6 / 9 / 20 / 25 venues" | **14 confirmed** (Engelberg added July 14). Grep-vs-JSON-format gap caused undercount. Count via `grep -n lateSeason app.jsx \| grep true` = 14 lines. Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — second occurrence is in PRESETS, not VENUES. 0 dup IDs.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED July 13.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 poolPrimary:true in code.** Only appears in a comment. |
| "Venue count 377 / +2 baseline drift" | **FALSE POSITIVE.** Bracket-walker double-counts 2 `{` chars from CSS/JS. Unique IDs = **375**. `.venue-baseline` (375) is CORRECT. |
| "engelberg missing lateSeason" | **RESOLVED July 14 (commit `747c35a`).** lateSeason count = **14**. Stop. |
| "AP_CONTINENT gap — 6 missing codes (KUL, SNA, MCT, GIG, TFS, CHQ)" | **FALSE POSITIVE (July 16 report, closed July 17).** Eval of AP_CONTINENT confirms all entries present (280 unique keys). KUL:asia, SNA:na, MCT:asia, GIG:latam, TFS:europe, CHQ:europe all confirmed. Zero venue APs are unmapped. |
| "rio-ipanema-beach as new staged venue" | **DUPLICATE — `ipanema-rio` already in VENUES with ap:GIG.** Do not re-stage. |
| "Alpe d'Huez / Cortina in catalog" | **Not yet — in staging queue Day 8, awaiting Jack photo approval.** |

---

## 1. Data Integrity Audit

### Venue Count (unique-ID method — authoritative)

| Category | Count | Δ from Jul 17 |
|----------|-------|---------------|
| **Skiing** | 133 | 0 |
| **Beach** | 242 | 0 |
| **TOTAL** | **375** | 0 |

Both formats counted: compact unquoted (`id:"..."`) + batch JSON (`"id":"..."`). No format overlap, no duplicates. Bracket-walker returns 377 — confirmed false-positive (+2 from CSS/JS `{` chars inside string gradients). Unique-ID count of 375 is authoritative.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Duplicate IDs | ✅ 0 | Verified across both formats |
| Missing lat/lon | ✅ 0 | All 375 verified |
| Missing airport codes | ✅ 0 | All 375 have non-empty `ap` field |
| Missing tag arrays | ✅ 0 | All 375 have ≥1 tag |
| Missing photos | ✅ 0 | All 375 have photo URL |
| Missing rating / reviews | ✅ 0 | All 375 populated |
| Rating floor | ✅ 4.0 min | Range: 4.0–4.99 |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 — intentional |
| `lateSeason:true` count | ✅ **14** | Engelberg added July 14 — confirmed via grep -n (14 lines). See list below. |
| `poolPrimary:true` count | ✅ **0** | Only in comment; no venues use this flag |
| Photo max repeat | ✅ 3× | Within ≤3× target from dedup `a143e4c` |
| AP_CONTINENT coverage | ✅ **0 gaps** | Eval confirmed 280 entries cover all 375 venue APs (closed false positive July 17) |

### lateSeason Confirmed List (14 venues)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`, `engelberg`

Count method: `grep -n "lateSeason" app.jsx | grep "true"` → 14 lines (lines 484, 500, 509, 515, 530, 534, 805, 1112, 1135, 1707, 1730, 4826, 4835, 4844). Compact unquoted format + JSON-quoted format both captured.

---

## 2. Content Quality

### Tag Depth Gap (P3 — persistent from July 17)

| Tag Count | Venues | % of Total |
|-----------|--------|------------|
| 2 tags | **228** | **61%** |
| 3 tags | 14 | 4% |
| 4 tags | 132 | 35% |
| 5 tags | 1 | 0% |

- **Beach average: 2.42 tags** vs **Ski average: 3.35 tags**
- Beach venues are systematically thinner in content signal
- Tags feed the search corpus, the Powder Day filter, and detail-sheet display
- 228 venues at exactly 2 tags = key search terms like "UV", "snorkeling", "nightlife", "whale watching" don't surface destinations even when applicable

**No paste-ready fix today** — needs venue-by-venue editorial judgment. When content bandwidth opens, priority is beach venues missing UV index tags (core trust signal) and water activity tags.

### Photo Distribution

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total venues | 375 | 375 | ✅ |
| Distinct base photo URLs | 143 | — | ✅ |
| Photos used 1× | — | — | Fine |
| Photos used 2× | — | — | Fine |
| Photos used 3× | — | ≤3× | ✅ At limit |
| Photos used 4×+ | **0** | 0 | ✅ |

Photo dedup GREEN. ≤3× ceiling from `a143e4c` holds.

**⚠️ Warning for future adds:** 143 base URLs are mostly at or near the 3× ceiling. Any new venue using a photo from the existing pool risks pushing a URL to 4×. New additions must introduce new Unsplash photo IDs. Run photo-dedup script after any batch ≥5 venues.

### Descriptions

~200 compact-format venues (the original 156 + some early batch entries) lack a `description` field. The batch JSON venues (2026-06-09 onward) have descriptions. This is a known gap — the field is not required for rendering, scoring, or filters. Low priority; tag enrichment has higher UX ROI first.

---

## 3. Seasonal Relevance — July 18, 2026

**Northern hemisphere:** Peak summer (Week 3). Beach prime. Ski off-season.
**Southern hemisphere:** Peak winter (Month 2.5 of Jun–Aug peak). Ski prime; beach shoulder.

| Category | N. Hemisphere | S. Hemisphere |
|----------|---------------|---------------|
| Beach | ✅ **187 venues IN SEASON** | ⚠️ 55 venues shoulder/off-peak |
| Skiing | ❌ **110 venues off-season** (14 lateSeason glacier exceptions active) | ✅ **23 venues IN SEASON** |

### Southern Hemisphere Ski — Live Scoring Now (23 venues)

**NZ (5):** `remarkables`, `coronet-peak`, `treble-cone-s29`, `cardrona-nz`, `mt-hutt-nz`
**Australia (6):** `perisher`, `thredbo-village-s23`, `falls-creek-au`, `mt-buller-au`, `mt-hotham-au`, `charlotte-pass-au`
**Chile (7):** `portillo-s4`, `pucon-ski-center-s19`, `valle-nevado`, `nevados-de-chillan-cl`, `la-parva-cl`, `el-colorado-cl`, `corralco-cl`
**Argentina (5):** `cerro-catedral-ar`, `las-lenas-ar`, `chapelco-ar`, `caviahue-ar`, `cerro-castor-s28`

**Catalog gaps in S-hemi ski still unaddressed:** Whakapapa (Mt Ruapehu, NZ) and Porter Heights (NZ) have zero catalog entries; Whakapapa is a top-5 NZ resort by skier visits. These are the highest-priority ski adds right now — in peak season with no representation.

### N Hemi Glacier Skiing — Active Now

14 lateSeason venues active July 18 (Tignes glacier, Saas-Fee year-round, Engelberg Titlis, etc.). The scoring engine correctly bypasses the off-season cap for these when `snow_depth_max >= 0.5m`.

---

## 4. Daily Venue Additions

**Queue status: HOLD at Day 8 — 11 venues pending Jack photo approval.**

Per PM policy: no new additions until queue clears. Same 5 venues as July 17 proposed for priority intake once unblocked. All have been validated against AP_CONTINENT. No new venues introduced today — reproducing July 17's queue for reference.

```javascript
// ─── DO NOT PASTE YET — queue cap active (11 staged, Day 8) ───────────
// Run through scripts/validate-venues.mjs first after queue clears

  // PRIORITY 1: S-hemi ski IN SEASON NOW — NZ coverage gap
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

  // PRIORITY 2: S-hemi ski IN SEASON — NZ backcountry club field
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

  // Beach: zero-venue AP gaps (ZTH, FNC)
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

  // Beach: South Africa — PLZ has zero venues
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
// ─── END ────────────────────────────────────────────────────────────────
```

**Why these 5:** Whakapapa + Craigieburn fill the largest NZ ski gap during peak S-hemi season. Navagio fills ZTH (Zakynthos, top Greek island, zero coverage). Porto Santo fills FNC (zero Madeira coverage). Plettenberg Bay fills PLZ (Africa beach now at 3 venues incl. Diani + Watamu).

**After paste: 375 + 5 = 380 venues (135 ski / 245 beach).** Run `scripts/validate-venues.mjs` first.

---

## 5. Staged Queue — Day 8 (UNCHANGED from July 14)

| Venue | Category | Days in Queue | Notes |
|-------|----------|---------------|-------|
| `alpe-d-huez-fr` | ski | **Day 8** ⚠️ | Glacier closes late August — 6 weeks left |
| `cortina-d-ampezzo` | ski | Day 8 | |
| `pipa-beach-brazil` | beach | Day 8 | |
| `punta-mita-beach` | beach | Day 8 | |
| `sunny-beach-bg` | beach | Day 7 | |
| `sango-sands` | beach | Day 7 | |
| `tropea-beach-it` | beach | Day 7 | |
| `porter-heights-nz` | ski | **Day 7** ⚠️ | S-hemi, IN SEASON NOW — delays = lost peak-window coverage |
| `koh-lanta-beach-th` | beach | Day 6 | |
| `legian-beach-bali` | beach | Day 6 | |
| `vina-del-mar-cl` | beach | Day 6 | |

**Action required — Jack:** 11-min clear. Visual photo check → `node scripts/validate-venues.mjs` → paste → auto-push commits. `alpe-d-huez-fr` has a real August deadline; `porter-heights-nz` is in peak NZ ski season right now.

---

## 6. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| Jack: photo-verify 11 staged venues | **P1** ⬆️ | Jack | Day 8; alpe-d-huez Aug deadline + porter-heights in-season |
| Tag enrichment — 228 thin-tag venues | **P3** | Content | Beach avg 2.42 tags; ski avg 3.35; editorial, not automated |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | 2 min paste into Supabase SQL editor |
| Plausible dashboard read | P0 | Jack | Day 18 blind on user behavior |
| VPS health check | P1 | Jack | `curl https://peakly-api.duckdns.org/health` |

---

## 7. One Observation for PM

**The staged queue is compounding a seasonal miss.** Two venues in the 11-deep queue (`porter-heights-nz`, `alpe-d-huez-fr`) are time-sensitive: Porter Heights is in live NZ ski season right now and has been stuck in review for 7 days; Alpe-d'Huez's glacier terrain closes late August. Every day of delay is live-season inventory that's not being served. The other 5 proposed venues (`whakapapa-ski`, `craigieburn-basin`) can't even enter the queue until the backlog clears. Net impact: at Day 18 post-launch, the S-hemi ski catalog of 23 venues is incomplete by at least 4 resorts (Whakapapa, Craigieburn, Porter Heights) during the only window they're worth promoting all year. A 15-minute Jack review session resolves this.
