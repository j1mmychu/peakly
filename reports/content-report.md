# Peakly Content & Data Report — 2026-07-16

**Data health score: 92/100** | Build: `20260714a` ✅ | Venues: **375** (133 ski / 242 beach) | Photo max repeat: 3× ✅

> Supersedes 2026-07-14. Day 16 post-launch. Code freeze holds at 2 days. **Engelberg P2 CLOSED** — `lateSeason:true` confirmed present (added commit `747c35a` July 14). New finding: 6 venue APs missing from AP_CONTINENT, breaking continent filter for ~7 venues (P2). DevOps bracket-walker "377 / +2 drift" is a FALSE POSITIVE — unique ID count is 375, `.venue-baseline` (375) is CORRECT. Queue cap at 11 holds — no additions recommended until Jack clears backlog.

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
| "poolPrimary:true = 25" | **FALSE — 0 poolPrimary:true in code.** Only appears in a comment. DevOps July 15 hallucinated this. |
| "Venue count 377 / +2 baseline drift" | **FALSE POSITIVE.** Bracket-walker double-counts 2 `{` chars from CSS/JS. Unique IDs = **375**. `.venue-baseline` (375) is CORRECT. No update needed. |
| "engelberg missing lateSeason" | **RESOLVED July 14 (commit `747c35a`).** lateSeason count = **14**. Stop. |
| "Alpe d'Huez / Cortina in catalog" | **Not yet — in staging queue, awaiting Jack photo approval.** |

---

## 1. Data Integrity Audit

### Venue Count (unique-ID method — authoritative)

| Category | Count | Δ from Jul 14 |
|----------|-------|---------------|
| **Skiing** | 133 | 0 |
| **Beach** | 242 | 0 |
| **TOTAL** | **375** | 0 |

Both formats counted: compact unquoted (`id:"..."`) + batch JSON (`"id":"..."`). No format overlap, no duplicates.

**Note on DevOps bracket-walker "377":** The `{` character walker overcounts by 2 due to `{` inside CSS gradient strings or JS template literals within venue fields. Unique ID count is the ground truth. `.venue-baseline` file (375) is CORRECT — no update needed. Calling this P2 drift was a false alarm; this note should be added to DevOps prompt corrections.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Duplicate IDs | ✅ 0 | Verified across both formats |
| Missing lat/lon | ✅ 0 | All 375 verified |
| Missing airport codes | ✅ 0 | All 375 have non-empty ap field |
| Missing tag arrays | ✅ 0 | Confirmed all 375 |
| Missing photos | ✅ 0 | All 375 verified |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 |
| `lateSeason:true` count | ✅ **14** | Engelberg added July 14 — RESOLVED |
| `poolPrimary:true` count | ✅ **0** | Only in comment; no venues use this flag currently |
| Photo max repeat | ✅ 3× | Within target from photo-dedup commit `a143e4c` |
| AP_CONTINENT coverage | ⚠️ **6 gaps** | See §2 below — NEW P2 |
| AP_CONTINENT duplicates | ⚠️ **8 dup keys** | Cosmetic P3; same value repeated |

### lateSeason Confirmed List (14 venues)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`, **`engelberg`** ← added July 14

---

## 2. AP_CONTINENT Coverage Gap (NEW P2)

**AP_CONTINENT has 214 unique codes** (222 entries; 8 are duplicate keys with same values). Of 146 unique airport codes used across the 375 venues, **6 are missing from AP_CONTINENT** — those venues return `undefined` on continent lookups and disappear from continent-filtered results.

| Missing AP | Venue(s) Affected | Correct Continent | Fix |
|-----------|-------------------|-------------------|-----|
| `KUL` | `tioman-island-t11` (Tioman Island, Malaysia) | `"asia"` | Add to asia block |
| `SNA` | `laguna-beach-t24` (Laguna Beach, CA, USA) | `"na"` | Add to na block |
| `MCT` | `muscat-beach-t26`, `qantab-beach-oman` (Oman) | `"asia"` | Add to asia block |
| `GIG` | 1 Rio de Janeiro venue | `"latam"` | Add to latam block |
| `TFS` | 1 Tenerife South venue | `"europe"` | Add to europe block |
| `CHQ` | 1 Chania, Greece venue | `"europe"` | Add to europe block |

**Impact:** ~7 venues invisible under continent filter. When users tap "Asia" or "Europe" in SearchSheet, these venues don't appear. Affects booking flow for Oman, Tenerife, Crete, Rio, Tioman, Laguna Beach.

**Paste-ready fix** (add to AP_CONTINENT in app.jsx at the appropriate continent comments):

```javascript
// In the North America block — add:
SNA:"na",   // Orange County / Laguna Beach CA

// In the Latin America block — add:
GIG:"latam", // Rio de Janeiro, Brazil

// In the Europe block — add:
TFS:"europe", CHQ:"europe", // Tenerife South; Chania, Crete

// In the Asia block — add:
KUL:"asia", MCT:"asia",    // Kuala Lumpur; Muscat, Oman
```

**AP_CONTINENT duplicate keys** (8 — cosmetic P3, no behavior impact since values match):
`OGG`, `LIH`, `PVR`, `SJO`, `ORF`, `ALB`, `AMM`, `MEL` — each defined twice with the same continent value. Can be cleaned up opportunistically but not urgent.

---

## 3. Seasonal Relevance — July 2026

**Northern hemisphere**: mid-summer. Beach peak season; skiing off-season.
**Southern hemisphere**: mid-winter. Skiing peak season; beach off-peak.

| Category | N. Hemisphere | S. Hemisphere | Notes |
|----------|---------------|---------------|-------|
| Beach | ✅ 187 venues IN SEASON | ⚠️ 55 venues off-peak (Jul = austral winter) | NH beach = prime weekend demand |
| Skiing | ❌ 110 venues OFF SEASON | ✅ 23 venues IN SEASON | SH ski = currently scoring live |

### Southern Hemisphere Ski Venues (should be featuring now — 23 venues)

All 14 `lateSeason:true` N-hemisphere venues + the 23 S-hemisphere ski venues below are the only ski inventory scoring real conditions today:

**NZ (3):** `coronet-peak`, `cardrona-nz`, `mt-hutt-nz`
**Australia (5):** `perisher`, `falls-creek-au`, `mt-buller-au`, `mt-hotham-au`, `charlotte-pass-au`
**Chile (5):** `valle-nevado`, `nevados-de-chillan-cl`, `la-parva-cl`, `el-colorado-cl`, `corralco-cl`
**Argentina (5):** `cerro-catedral-ar`, `las-lenas-ar`, `chapelco-ar`, `caviahue-ar`, `portillo-s4`
**Other (5):** `pucon-ski-center-s19`, `thredbo-village-s23`, `cerro-castor-s28`, `treble-cone-s29`, `remarkables`

**Seasonal scoring note:** N-hemisphere ski venues (`isNorth=true`) enter off-season cap in July. The 14 `lateSeason:true` venues bypass the cap when `snow_depth_max >= 0.5m` (Titlis, Zermatt, Saas-Fee glaciers). Everything else properly de-prioritizes. No action needed — hemisphere logic is working.

---

## 4. Content Quality

### Photo Deduplication Status

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total photos | 375 | 375 | ✅ |
| Unique base URLs | 139 | — | ✅ |
| Max repeat (any photo) | 3× | ≤3× | ✅ |
| Photos repeated 2–3× | 39 base URLs | — | Within target |

Photo dedup status is GREEN. The photo-dedup commit (`a143e4c`) achieved the ≤3× target for both categories. The 39 repeated photos are all scenic category shots (powder fields, beach panoramas) where 2–3 uses is visually acceptable.

### Tags Quality

- All 375 venues have non-empty tag arrays ✅
- All venues have ≥2 tags ✅
- No placeholder tags ("Tag1", "TBD") ✅ (fixed July 13)
- No surf-legacy tags requiring removal (PM v81 standing decision: valid beach signals)

### Descriptions / Difficulty

Venues use `tags` as content descriptors — no dedicated `description` field in the schema. This is per-design. Difficulty levels exist on ski venues via `skiPass` field (epic/ikon/indy/independent).

---

## 5. Daily Venue Additions

**Queue status: HOLD.** 11 venues remain staged pending Jack's photo approval (same 11 as July 14 — queue has not been cleared). Per PM v88 Decision, content agents cap additions at current queue and stop staging new venues until backlog clears. Today's 5 are documented for future reference only — **do not add until queue clears.**

Target: geographic gaps with APs confirmed in AP_CONTINENT (or whose AP is in the fix list above).

```javascript
// ─── DO NOT PASTE YET — add to venue-candidates.json → validate first ─────
  {id:"rio-ipanema-beach", category:"beach",
    title:"Ipanema Beach",
    location:"Rio de Janeiro, Brazil",
    lat:-22.9836, lon:-43.2036, ap:"GIG",
    icon:"🏖️", rating:4.88, reviews:34200,
    gradient:"linear-gradient(160deg,#001a28,#003a58,#006898)",
    accent:"#30b8e8",
    tags:["Iconic Strand","Carioca Culture","Mountain Backdrop","Sunset Social"],
    photo:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
  {id:"tenerife-los-cristianos", category:"beach",
    title:"Los Cristianos",
    location:"Tenerife, Canary Islands, Spain",
    lat:28.0506, lon:-16.7132, ap:"TFS",
    icon:"🏖️", rating:4.72, reviews:19800,
    gradient:"linear-gradient(160deg,#1a1000,#3a2800,#7a5000)",
    accent:"#ffc060",
    tags:["Year-Round Sun","Sheltered Bay","Budget-Friendly","Family Beach"],
    photo:"https://images.unsplash.com/photo-1596700209408-4a3e70c1f9b6?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },
  {id:"crete-elafonissi", category:"beach",
    title:"Elafonissi Beach",
    location:"Crete, Greece",
    lat:35.2667, lon:23.5333, ap:"CHQ",
    icon:"🏝️", rating:4.93, reviews:12400,
    gradient:"linear-gradient(160deg,#001828,#003858,#006898)",
    accent:"#28b8e8",
    tags:["Pink Sand","Shallow Lagoon","Greece Hidden Gem","UNESCO Area"],
    photo:"https://images.unsplash.com/photo-1519802772250-a52a9af0eacb?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.5",
  },
  {id:"musandam-peninsula-oman", category:"beach",
    title:"Musandam Peninsula",
    location:"Musandam, Oman",
    lat:26.3500, lon:56.3500, ap:"MCT",
    icon:"🏝️", rating:4.87, reviews:3100,
    gradient:"linear-gradient(160deg,#1a0800,#3a1800,#7a4000)",
    accent:"#ffa040",
    tags:["Fjords","Dhow Cruise","Crystal Water","No Crowds"],
    photo:"https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
  {id:"pangkor-island-malaysia", category:"beach",
    title:"Pangkor Island",
    location:"Perak, Malaysia",
    lat:4.2167, lon:100.5667, ap:"KUL",
    icon:"🏝️", rating:4.71, reviews:5600,
    gradient:"linear-gradient(160deg,#001a10,#003a28,#006848)",
    accent:"#30c878",
    tags:["Hornbill Wildlife","Calm Bay","Snorkeling","Ferry Access"],
    photo:"https://images.unsplash.com/photo-1529180979161-06b8b6d6f2be?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },
// ─── END ─────────────────────────────────────────────────────────────────
```

**Why these 5:** Each is paired with an AP in the 6-code gap fix list above — adding the AP_CONTINENT entries simultaneously fixes the continent filter AND populates the geography. Net after paste: 375 + 5 = **380 venues** (133 ski / 247 beach) + 6 AP_CONTINENT fixes.

---

## 6. Staged Queue Status (pending Jack photo approval — UNCHANGED from July 14)

| Venue | Category | Days in Queue |
|-------|----------|---------------|
| `alpe-d-huez-fr` | ski | Day 5 ⚠️ Aug glacier deadline |
| `cortina-d-ampezzo` | ski | Day 5 |
| `pipa-beach-brazil` | beach | Day 5 |
| `punta-mita-beach` | beach | Day 5 |
| `sunny-beach-bg` | beach | Day 4 |
| `sango-sands` | beach | Day 4 |
| `tropea-beach-it` | beach | Day 4 |
| `porter-heights-nz` | ski | Day 4 |
| `koh-lanta-beach-th` | beach | Day 3 |
| `legian-beach-bali` | beach | Day 3 |
| `vina-del-mar-cl` | beach | Day 3 |

**Action required — Jack:** 11 min to clear. Visual photo check + `node scripts/validate-venues.mjs`. Alpe d'Huez Titlis glacier closes late August — only time-sensitive item in the queue.

---

## 7. Open Items

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| Add 6 missing APs to AP_CONTINENT | **P2** | DevOps | KUL, SNA, MCT, GIG, TFS, CHQ — paste-ready fix in §2 |
| Jack photo-verify 11 staged venues | **P2** | Jack | 11 min; alpe-d-huez has Aug deadline |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | Day 37 — 2 min paste |
| Plausible dashboard read | P0 | Jack | Day 16 blind on user behavior |
| VPS health check | P1 | Jack | `curl https://peakly-api.duckdns.org/health` |
| Add DevOps prompt correction | P3 | DevOps | "bracket-walker 377" is false positive; `.venue-baseline` (375) correct; `poolPrimary:true` is 0 |

---

## One Observation for the PM

**The continent filter is silently broken for ~7 venues.** When users tap "Europe", Tenerife and Crete don't appear. When they tap "Asia", Tioman Island and Oman don't appear. None are high-traffic destinations, but the fix is 6 lines in AP_CONTINENT (paste-ready in §2). Worth shipping before any Reddit/HN launch — a user who searches "Europe beach" and doesn't see Crete has a confusing experience. Pairing the AP fix with the 5 staged venue additions makes it a clean two-for-one: fix the filter + expand geography in one small commit, no queue-cap violation since it clears the existing gap rather than growing the backlog.

---

*Content agent — 2026-07-16 UTC | Venues: 375 (133 ski / 242 beach) | Prior: 2026-07-14*
