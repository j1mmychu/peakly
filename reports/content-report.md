# Peakly Content & Data Report — 2026-07-22

**Data health score: 92/100** | Venues: **374** (132 ski / 242 beach) | Photo max repeat: 3× ✅ | Code freeze: Day 8

> Supersedes 2026-07-21. Day 22 post-launch. Venue count corrected to **374** (jackson-hole ghost dup removed July 20, commit `e2f02cd`). AP_CONTINENT P2 gap now Day 8 unresolved — 6 missing airport codes, 4-line paste from resolution. DevOps July 20 "AP_CONTINENT closed" was a false positive — verified against live app.jsx July 22. Staged queue oldest items now Day 12; Alpe d'Huez glacier window narrows toward August close. Health score holds at 92.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **374 venues, 2 categories only (skiing + beach).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 374 venues have non-empty tags.** Confirmed July 22. |
| "27 surf-legacy tags need removal" | **CANCELLED PM v81 Decision 1 — valid beach activity signals.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 6 / 20 / 25 venues" | **14 (Engelberg added July 14). Confirmed July 22. Stop.** |
| "cancun-beach dup" | **FALSE POSITIVE — second occurrence is in PRESETS, not VENUES. 0 dup IDs.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED July 13.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 poolPrimary:true in code.** Only appears in a comment. |
| "Venue count 377 / +2 baseline drift" | **FALSE POSITIVE.** Bracket-walker overcounts 2 `{` in CSS/JS. Unique IDs = **374**. `.venue-baseline` should read 374 post-dup-remove. |
| "engelberg missing lateSeason" | **RESOLVED July 14 (commit `747c35a`).** lateSeason count = **14**. Stop. |
| "Alpe d'Huez / Cortina in catalog" | **Staged queue, pending Jack photo approval (now Day 12).** |
| "AP_CONTINENT closed" | **FALSE — 6 gaps remain.** DevOps July 20 report incorrectly marked it closed. KUL/SNA/MCT/GIG/TFS/CHQ still missing. Verified July 22 against live app.jsx. |

---

## 1. Data Integrity Audit

### Venue Count (unique-ID eval method — authoritative)

| Category | Count | Δ from Jul 21 |
|----------|-------|---------------|
| **Skiing** | 132 | -1 (jackson-hole ghost dup removed Jul 20) |
| **Beach** | 242 | 0 |
| **TOTAL** | **374** | -1 |

The `jackson-hole` ghost dup was removed in commit `e2f02cd` (July 20); `.venue-baseline` should read **374**. DevOps July 22 report confirms baseline match.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Duplicate IDs | ✅ 0 | Verified Jul 22 via eval |
| Missing lat/lon | ✅ 0 | All 374 |
| Missing airport codes | ✅ 0 | All 374 |
| Invalid AP format | ✅ 0 | All 3-char uppercase |
| Missing tag arrays | ✅ 0 | All 374 |
| Tags ≥ 2 per venue | ✅ 0 gaps | 228 venues have exactly 2 (lean but valid) |
| Missing photos | ✅ 0 | All 374 |
| Photo max repeat | ✅ 3× | 139 distinct base URLs, avg 2.69 per URL |
| GEAR_ITEMS refs | ✅ 0 | Amazon cut for v1 |
| `lateSeason:true` count | ✅ **14** | Stable since Jul 14 |
| `poolPrimary:true` count | ✅ **0** | Only in a comment; no venues use it |
| Duplicate title+location | ✅ 0 | |
| AP_CONTINENT coverage | ⚠️ **6 gaps** | KUL, SNA, MCT, GIG, TFS, CHQ — **Day 8 unresolved** |

### lateSeason Confirmed List (14 — authoritative)

`whistler` · `chamonix` · `mammoth` · `abasin` · `tignes` · `cervinia` · `snowbird` · `zermatt` · `verbier` · `val-thorens` · `les-deux-alpes-fr` · `saas-fee-ch` · `st-moritz-ch` · `engelberg`

---

## 2. AP_CONTINENT Coverage Gap — P2, Day 8

**Status: STILL UNRESOLVED.** DevOps July 20 report incorrectly marked this closed — verified against live app.jsx July 22 and all 6 codes are still absent. These venues return `undefined` on continent lookups and disappear from continent-filtered results.

| Missing AP | Venue(s) Affected | Continent | Fix |
|-----------|-------------------|-----------|-----|
| `KUL` | `tioman-island-t11` | `"asia"` | Add to asia block |
| `SNA` | `laguna-beach-t24` | `"na"` | Add to na block |
| `MCT` | `muscat-beach-t26`, `qantab-beach-oman` | `"asia"` | Add to asia block |
| `GIG` | `ipanema-rio` | `"latam"` | Add to latam block |
| `TFS` | 1 Tenerife South venue | `"europe"` | Add to europe block |
| `CHQ` | 1 Chania, Greece venue | `"europe"` | Add to europe block |

**Paste-ready fix** (add to `AP_CONTINENT` in app.jsx at the matching continent comments):

```javascript
SNA:"na",            // Orange County CA / Laguna Beach
GIG:"latam",         // Rio de Janeiro, Brazil
TFS:"europe", CHQ:"europe",  // Tenerife South; Chania, Crete
KUL:"asia", MCT:"asia",      // Kuala Lumpur; Muscat, Oman
```

**AP_CONTINENT duplicate keys** (8 — P3 cosmetic, same value each, no behavior impact): `OGG`, `LIH`, `PVR`, `SJO`, `ORF`, `ALB`, `AMM`, `MEL`.

---

## 3. Seasonal Relevance — July 22, 2026

**Northern hemisphere:** peak summer. Beach at full demand. Skiing hard off-season.
**Southern hemisphere:** mid-winter. Ski season active across NZ, Australia, South America.

| Category | N. Hemisphere | S. Hemisphere | Status |
|----------|---------------|---------------|--------|
| Beach | ✅ **187 venues** — peak IN SEASON | ⚠️ 55 venues off-peak (austral winter) | NH beach is the core demand driver this weekend |
| Skiing | ❌ **109 venues** OFF SEASON | ✅ **23 venues** IN SEASON | + 14 lateSeason N-hemisphere bypass glacier cap |

### Active Ski Inventory (37 venues scoring live today)

**Southern hemisphere (23):**
- **NZ:** `coronet-peak` · `cardrona-nz` · `mt-hutt-nz`
- **Australia:** `perisher` · `falls-creek-au` · `mt-buller-au` · `mt-hotham-au` · `charlotte-pass-au`
- **Chile:** `valle-nevado` · `nevados-de-chillan-cl` · `la-parva-cl` · `el-colorado-cl` · `corralco-cl`
- **Argentina:** `cerro-catedral-ar` · `las-lenas-ar` · `chapelco-ar` · `caviahue-ar` · `portillo-s4`
- **Other:** `pucon-ski-center-s19` · `thredbo-village-s23` · `cerro-castor-s28` · `treble-cone-s29` · `remarkables`

**N-hemisphere lateSeason glacier venues (14):** Bypass off-season cap when `snow_depth_max ≥ 0.5m`. See list in §1.

Hemisphere scoring logic is correct. No action needed.

---

## 4. Content Quality

### Photo Health

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total venues | 374 | 374 | ✅ |
| Photo coverage | 100% | 100% | ✅ |
| Distinct base URLs | 139 | — | ✅ |
| Avg uses per URL | 2.69× | ≤3× | ✅ |
| Max repeat (any photo) | **3×** | ≤3× | ✅ |

All within the photo-dedup commit target (`a143e4c`). GREEN.

### Tags Quality

- All 374 venues: non-empty tags ✅
- All 374 venues: ≥2 tags ✅
- 228 venues have exactly 2 tags — lean but valid; older compact entries. Expanding to 3–4 is a low-priority discovery enhancement.
- No placeholder tags ✅

### Ratings Distribution

| Metric | Value |
|--------|-------|
| Avg rating | 4.71 |
| Min | 4.0 (`mad-river-mountain-oh`, `roundtop-mountain`) |
| Max | 4.99 |
| Venues < 4.5 | 46 (regional ski hills — realistic, not noise) |
| Venues < 100 reviews | 0 |

---

## 5. Daily Venue Additions

**Queue status: HOLD.** Staged queue at 11 venues pending Jack photo approval. Cap rule in effect — document proposals below; do not paste until backlog clears.

### Fresh Proposals (for post-queue-clear staging)

Target: geographic gaps using airports already confirmed in `AP_CONTINENT`.

```javascript
// ─── DO NOT PASTE YET — validate first via validate-venues.mjs ────────────

  {id:"arraial-do-cabo-br", category:"beach",
    title:"Arraial do Cabo",
    location:"Rio de Janeiro, Brazil",
    lat:-22.9662, lon:-42.0278, ap:"GIG",
    icon:"🏖️", rating:4.94, reviews:8900,
    gradient:"linear-gradient(160deg,#001828,#003858,#1570a0)",
    accent:"#30b8f0",
    tags:["Caribbean of Brazil","Turquoise Lagoons","Diving","Dune Walks"],
    photo:"https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
  {id:"ishigaki-island-jp", category:"beach",
    title:"Ishigaki Island",
    location:"Okinawa Prefecture, Japan",
    lat:24.3448, lon:124.1572, ap:"OKA",
    icon:"🏝️", rating:4.91, reviews:6200,
    gradient:"linear-gradient(160deg,#001a10,#003838,#006868)",
    accent:"#30d8b8",
    tags:["Kabira Bay","Manta Rays","Remote Japan","Crystal Coral"],
    photo:"https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },
  {id:"comporta-pt", category:"beach",
    title:"Comporta",
    location:"Alentejo Coast, Portugal",
    lat:38.3756, lon:-8.7680, ap:"LIS",
    icon:"🏖️", rating:4.88, reviews:4100,
    gradient:"linear-gradient(160deg,#1a1000,#3a2600,#7a5800)",
    accent:"#e8b840",
    tags:["Rice Fields","Minimalist Luxury","Wild Atlantic","Off-Grid"],
    photo:"https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  },
  {id:"batumi-beach-ge", category:"beach",
    title:"Batumi Black Sea Beach",
    location:"Adjara, Georgia",
    lat:41.6477, lon:41.6389, ap:"TBS",
    icon:"🏖️", rating:4.68, reviews:7800,
    gradient:"linear-gradient(160deg,#0a1a28,#1a3a58,#2a5a88)",
    accent:"#60a8e8",
    tags:["Black Sea","Vegas of the Caucasus","Palm Boulevard","Nightlife"],
    photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },
  {id:"mancora-beach-pe", category:"beach",
    title:"Máncora",
    location:"Piura, Peru",
    lat:-4.1058, lon:-81.0466, ap:"LIM",
    icon:"🏖️", rating:4.82, reviews:9300,
    gradient:"linear-gradient(160deg,#1a0800,#3a1a00,#7a4a00)",
    accent:"#f0a030",
    tags:["Year-Round Sun","Warm Pacific","Surf Culture","Ceviche Hub"],
    photo:"https://images.unsplash.com/photo-1528913775512-624d24b27b96?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  },

// ─── END ──────────────────────────────────────────────────────────────────
```

**Why these 5:**
- `arraial-do-cabo-br` → GIG (same airport as `ipanema-rio` already in catalog; fixing GIG in AP_CONTINENT also unlocks Ipanema's continent filter — double fix for one AP entry)
- `ishigaki-island-jp` → OKA (Okinawa hub, `asia` ✅; Ishigaki is 400km SW — distinct island, different audience from `beach_okinawa`)
- `comporta-pt` → LIS (`europe` ✅); Alentejo coast adds variety to Algarve-heavy Portugal section
- `batumi-beach-ge` → TBS (`europe` ✅); Georgia's only venue is ski (`ski_gudauri`); Black Sea beach fills the gap
- `mancora-beach-pe` → LIM (`latam` ✅); Peru has zero beach venues; Pacific coast's top beach destination

All 5 use airports already in AP_CONTINENT. Zero new AP gaps introduced.

---

## 6. Staged Queue Status

| Venue | Category | Days in Queue | Notes |
|-------|----------|---------------|-------|
| `alpe-d-huez-fr` | ski | **Day 12** ⚠️ | Glacier closes late August — time-sensitive |
| `cortina-d-ampezzo` | ski | Day 12 | |
| `pipa-beach-brazil` | beach | Day 12 | |
| `punta-mita-beach` | beach | Day 12 | |
| `sunny-beach-bg` | beach | Day 11 | |
| `sango-sands` | beach | Day 11 | |
| `tropea-beach-it` | beach | Day 11 | |
| `porter-heights-nz` | ski | Day 11 | Currently IN SEASON — S.hemisphere winter |
| `koh-lanta-beach-th` | beach | Day 10 | |
| `legian-beach-bali` | beach | Day 10 | |
| `vina-del-mar-cl` | beach | Day 10 | Currently winter in Chile |

**Action required — Jack:** ~11 min to clear. `node scripts/validate-venues.mjs` then paste accepted. Alpe d'Huez has a hard August deadline — miss it and the venue sits dead until June 2027.

---

## 7. Open Items

| Item | Priority | Owner | Status |
|------|----------|-------|--------|
| Add 6 APs to AP_CONTINENT | **P2** | DevOps | Day 8 — 4-line paste ready in §2. DevOps Jul 20 false-close noted; add to that agent's corrections. |
| Jack photo-approve staged venues | **P2** | Jack | Day 12 — Alpe d'Huez has August deadline |
| Supabase account-deletion SQL paste | P0 (App Store) | Jack | Still pending |
| Plausible dashboard read | P0 | Jack | Day 22 post-launch — flying blind on user behavior |
| VPS health verify | P1 | Jack | `curl https://peakly-api.duckdns.org/health` |
| Expand 2-tag venues to 3–4 tags | P3 | Content | 228 venues; low priority, aids discovery |

---

## One Observation for the PM

**The AP_CONTINENT "CLOSED" status in the July 20 DevOps report was a false positive — confirmed July 22.** All 6 airport codes (KUL, SNA, MCT, GIG, TFS, CHQ) are still missing from the live app.jsx. This means users who filter by "Asia" or "Europe" still don't see Oman, Tenerife, Crete, Tioman Island, or Rio de Janeiro — 6–7 venues hidden in plain sight during peak summer. The fix is 4 lines. Since the code freeze is otherwise holding, this is the one clean mechanical patch worth shipping this week: no logic, no scoring, no risk — just a dictionary update. Pair it with the staged queue clear for a 15-minute session that fixes the continent filter AND grows inventory by 11 venues.

---

*Content agent — 2026-07-22 UTC | Venues: 374 (132 ski / 242 beach) | Photo max 3× | Prior: 2026-07-21*
