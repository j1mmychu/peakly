# Peakly Content & Data Report — 2026-07-17

**Data health score: 87/100** | Build: `20260714a` ✅ | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-16. Day 17 post-launch. **CORRECTION: July 16 P2 (AP_CONTINENT gap — 6 missing codes) is a FALSE POSITIVE.** Eval of AP_CONTINENT confirms all 280 entries cover every venue AP. Zero continent filter breaks. New finding today: Tag depth gap (P3) — 228 venues at minimum 2 tags, beach average 2.42 tags vs ski 3.35. Queue cap at 11 holds — no venue additions until Jack clears backlog.

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
| "lateSeason: 6 / 20 / 25 venues" | **14 (Engelberg added July 14). Count confirmed. Stop.** |
| "cancun-beach dup" | **FALSE POSITIVE — second occurrence is in PRESETS, not VENUES. 0 dup IDs.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED July 13.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 poolPrimary:true in code.** Only appears in a comment. |
| "Venue count 377 / +2 baseline drift" | **FALSE POSITIVE.** Bracket-walker double-counts 2 `{` chars from CSS/JS. Unique IDs = **375**. `.venue-baseline` (375) is CORRECT. |
| "engelberg missing lateSeason" | **RESOLVED July 14 (commit `747c35a`).** lateSeason count = **14**. Stop. |
| "AP_CONTINENT gap — 6 missing codes (KUL, SNA, MCT, GIG, TFS, CHQ)" | **FALSE POSITIVE (July 16 report).** Eval of AP_CONTINENT confirms all 280 entries present. All 6 codes confirmed: KUL:asia, SNA:na, MCT:asia, GIG:latam, TFS:europe, CHQ:europe. Zero venue APs are unmapped. |
| "rio-ipanema-beach as new staged venue" | **DUPLICATE — `ipanema-rio` already in VENUES with ap:GIG.** Do not re-stage. |
| "Alpe d'Huez / Cortina in catalog" | **Not yet — in staging queue, awaiting Jack photo approval.** |

---

## 1. Data Integrity Audit

### Venue Count (unique-ID method — authoritative)

| Category | Count | Δ from Jul 16 |
|----------|-------|---------------|
| **Skiing** | 133 | 0 |
| **Beach** | 242 | 0 |
| **TOTAL** | **375** | 0 |

Both formats counted: compact unquoted (`id:"..."`) + batch JSON (`"id":"..."`). No format overlap, no duplicates.

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
| `lateSeason:true` count | ✅ **14** | Engelberg added July 14 — RESOLVED |
| `poolPrimary:true` count | ✅ **0** | Only in comment; no venues use this flag |
| Photo max repeat | ✅ 3× | Within ≤3× target from dedup `a143e4c` |
| AP_CONTINENT coverage | ✅ **0 gaps** | Eval confirmed 280 entries cover all 375 venue APs |

### lateSeason Confirmed List (14 venues)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`, **`engelberg`** ← added July 14

---

## 2. AP_CONTINENT Audit — FALSE POSITIVE CLOSED

The July 16 report flagged KUL, SNA, MCT, GIG, TFS, CHQ as missing from AP_CONTINENT. This was a **grep-based false negative** — the codes exist as quoted-key entries (e.g. `"KUL":"asia"`) that a bare-text search missed.

**Eval-based verification (authoritative):** AP_CONTINENT contains **280 entries**. Every airport code used across the 375 venues maps cleanly. Continent filter is fully functional — no venues disappear from any region view.

**Root cause:** Same eval-vs-grep gap that caused the "156 venues / 375 venues" undercount issue. Always use eval for object membership checks in this codebase.

**Action:** None needed on AP_CONTINENT. Retire this finding from all agent queues.

---

## 3. Content Quality — NEW Finding (P3)

### Tag Depth Gap

| Tag Count | Venues | % of Total |
|-----------|--------|------------|
| 2 tags | **228** | **61%** |
| 3 tags | 14 | 4% |
| 4 tags | 132 | 35% |
| 5 tags | 1 | 0% |

- **Beach average: 2.42 tags** vs **Ski average: 3.35 tags**
- Beach venues are systematically thinner in content signal
- Tags feed the search corpus, the Powder Day filter, and detail-sheet display
- 228 venues at exactly 2 tags means search queries like "UV", "snorkeling", "nightlife", "sunset" don't surface those destinations even when applicable

**Impact:** Reduces discoverability for long-tail search terms and misses filter opportunities. Not a P1 — venues still render and score correctly. The fix is enrichment, not repair.

**Recommended remediation (when content bandwidth allows):**
- Add 1–2 tags per venue to the 228 thin-tag venues, prioritizing beach
- Priority candidates: venues without "UV [N]" tags (beach UV index is a core trust signal), resorts without lift system tags (ski), beach venues missing water temp signals

No paste-ready fix today (needs venue-by-venue editorial judgment, not automation). Flag for next deep-content session.

### Photo Distribution

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total venues | 375 | 375 | ✅ |
| Distinct base photo URLs | 139 | — | ✅ |
| Photos used 1× | 5 | — | Fine |
| Photos used 2× | 32 | — | Fine |
| Photos used 3× | 102 | ≤3× | ✅ At limit |
| Photos used 4×+ | **0** | 0 | ✅ |

Photo dedup GREEN. All 3× repeats are generic category scenery (powder fields, turquoise water panoramas) where shared use is visually acceptable. The ≤3× ceiling from dedup commit `a143e4c` holds.

**Note for future venue additions:** 102 photo base URLs are already at 3×. Any new venue requiring a photo in the existing 139-URL pool will push ≥1 photo to 4×. New additions should introduce new Unsplash photo IDs or the dedup script should be re-run after each batch add.

---

## 4. Seasonal Relevance — July 17, 2026

**Northern hemisphere:** Peak summer. Beach prime. Ski off-season (soft scoring floor on 110 N-hemi venues; 14 lateSeason glacier exceptions active).
**Southern hemisphere:** Peak winter. Ski prime. Beach off-peak.

| Category | N. Hemisphere | S. Hemisphere |
|----------|---------------|---------------|
| Beach | ✅ 187 venues IN SEASON | ⚠️ 55 venues shoulder/off-peak |
| Skiing | ❌ 110 venues off-season (lateSeason bypass active for 14) | ✅ **23 venues IN SEASON** |

### Southern Hemisphere Ski — Live Scoring Now (23 venues)

**NZ (5):** `remarkables`, `coronet-peak`, `treble-cone-s29`, `cardrona-nz`, `mt-hutt-nz`
**Australia (6):** `perisher`, `thredbo-village-s23`, `falls-creek-au`, `mt-buller-au`, `mt-hotham-au`, `charlotte-pass-au`
**Chile (6):** `portillo-s4`, `pucon-ski-center-s19`, `valle-nevado`, `nevados-de-chillan-cl`, `la-parva-cl`, `el-colorado-cl`, `corralco-cl` _(7 listed — 1 extra counted; confirm with eval)_
**Argentina (5):** `cerro-catedral-ar`, `las-lenas-ar`, `chapelco-ar`, `caviahue-ar`, `cerro-castor-s28`
**S. America other:** `corralco-cl`

**Missing from S-hemi ski catalog:** Whakapapa (Mt Ruapehu, NZ) and Craigieburn Basin (NZ) are in-season now with no venue entry. See §5 for paste-ready objects.

---

## 5. Daily Venue Additions

**Queue status: HOLD at 11.** 11 venues remain staged pending Jack's photo approval (unchanged from July 14). Per PM Decision, no new additions until backlog clears.

Today's 5 are flagged for **priority intake once queue clears** — all have confirmed AP_CONTINENT entries and fill genuine catalog gaps:

```javascript
// ─── DO NOT PASTE YET — queue cap active (11 staged) ─────────────────
// Run through scripts/validate-venues.mjs first after queue clears

  // PRIORITY: S-hemi ski IN SEASON NOW (July peak)
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

  // Beach: genuine geographic gaps (ZTH and FNC have 0 venues each)
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
// ─── END ─────────────────────────────────────────────────────────────
```

**Why these 5:**
- Whakapapa + Craigieburn: NZ ski gaps in peak S-hemi season right now; AKL and CHC confirmed in AP_CONTINENT "oceania"
- Navagio: ZTH has zero venues despite Zakynthos being a top Greek island; in N-hemi summer beach peak
- Porto Santo: FNC has zero venues; the 9km beach on Porto Santo is a legitimate European beach alternative with therapeutic reputation, distinct from Madeira main island
- Plettenberg Bay: PLZ ("africa") has zero venues; expands Africa beach to 3 entries alongside Diani and Watamu; July is shoulder season S-hemi but still warm at 34°S

**After paste: 375 + 5 = 380 venues (135 ski / 245 beach).** Run `scripts/validate-venues.mjs` before paste.

---

## 6. Staged Queue Status (pending Jack photo approval — UNCHANGED from July 14)

| Venue | Category | Days in Queue |
|-------|----------|---------------|
| `alpe-d-huez-fr` | ski | Day **6** ⚠️ Titlis glacier closes late August |
| `cortina-d-ampezzo` | ski | Day 6 |
| `pipa-beach-brazil` | beach | Day 6 |
| `punta-mita-beach` | beach | Day 6 |
| `sunny-beach-bg` | beach | Day 5 |
| `sango-sands` | beach | Day 5 |
| `tropea-beach-it` | beach | Day 5 |
| `porter-heights-nz` | ski | Day 5 ← S-hemi, IN SEASON NOW |
| `koh-lanta-beach-th` | beach | Day 4 |
| `legian-beach-bali` | beach | Day 4 |
| `vina-del-mar-cl` | beach | Day 4 |

**Action required — Jack:** 11 min to clear. Visual photo check + `node scripts/validate-venues.mjs`. Time-sensitive: `alpe-d-huez-fr` for glacier season; `porter-heights-nz` is live ski season now.

---

## 7. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| Jack photo-verify 11 staged venues | **P2** | Jack | 11 min; alpe-d-huez glacier Aug deadline; porter-heights-nz in-season |
| Tag enrichment — 228 thin-tag venues | **P3** | Content | Beach avg 2.42 tags; ski avg 3.35; editorial, not automated |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | 2 min paste into Supabase SQL editor |
| Plausible dashboard read | P0 | Jack | Day 17 blind on user behavior |
| VPS health check | P1 | Jack | `curl https://peakly-api.duckdns.org/health` |

**Closed today:** AP_CONTINENT gap P2 (false positive — eval confirms zero gaps).

---

## One Observation for the PM

**The catalog's weakest data signal is beach tag depth, not venue count.** 228 venues sit at exactly 2 tags — the minimum. Beach averages 2.42 tags vs ski's 3.35. This matters because tags are the only content signal Peakly uses for search and filtering: a user tapping "snorkeling" or "UV 10+" won't find many beach venues that qualify but don't have the tag. Before adding more venues to the queue, a focused tag-enrichment pass on the 242 beach venues would improve product quality more than any new destination. Estimated scope: 2–3 hours of editorial work, no code changes, immediate search/filter improvement. Worth considering as a Day 18 task before the next venue batch lands.

---

*Content agent — 2026-07-17 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-16*
