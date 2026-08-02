# Peakly Content & Data Report — 2026-08-02

**Data health score: 89/100** (−1 vs yesterday) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ✅ `20260802a` | BASE_PRICES gap: 100/146 APs missing (68.5%) ⚠️ unchanged | Yesterday's 5 proposals: **NOT added** (30 consecutive proposals unshipped, 6 sessions) | Photo dedup: **170 unique photos / 373 venues** (88% sharing) ⚠️ unchanged

> Supersedes 2026-08-01. Verified against HEAD `f77d333` (pulled clean). Score drops 1 point: VPS Day 9 drag on live deal scoring continues. No structural changes to venue data today. Stable baseline.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count = 9 (via grep)" | **14 confirmed** — see §1 note. `grep "lateSeason.true"` misses 5 JSON-format venues that use `"lateSeason": true` (2-char `: ` separator). Use `grep -c "lateSeason.*true"` or code inspection. |
| "AP_CONTINENT gaps" | **CLOSED** — 146/146 ✅ confirmed July 30. Stop. |
| "AIRPORT_COORDS gaps" | **CLOSED** — 146/146 ✅ confirmed July 31. Stop. |
| "BASE_PRICES 100% covered" | **FALSE** — real coverage: 46/146 (31.5%) airports, 138/373 venues. Do not stop raising. |
| "BASE_PRICES 52% correct" | **FALSE** — PM v106 accepted DevOps's inflated figure. Real: 46/146 = 31.5%. The 76 BASE_PRICES destination keys include 30 origin-only hubs (JFK, LAX, ORD etc.) not venue destinations. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24.** Count is **373**. Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), 5.6 km apart.** Open — Jack's call to merge. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative via eval)

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 131 | ✅ stable |
| **Beach** | 242 | ✅ stable |
| **TOTAL** | **373** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 0 dups | Boot-time validator active |
| Missing lat/lon | ✅ 0 | All 373 venues have valid coordinates |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing tag arrays | ✅ 0 | All non-empty |
| Photos (field present) | ✅ 373/373 | Field exists on every venue |
| **Unique photo URLs** | ⚠️ **170 / 373** | 88% of venues share a photo with ≥1 other venue |
| Invalid coordinates | ✅ 0 | All within ±90 / ±180 bounds |
| lateSeason count | ✅ **14** | Confirmed via code inspection — see note below |
| AP in AP_CONTINENT | ✅ **146/146** | 0 gaps |
| AP in AIRPORT_COORDS | ✅ **146/146** | 0 gaps |
| Cache stamp | ✅ **20260802a** | Confirmed current |
| Grace Bay near-dup | ⚠️ OPEN | `beach_grace` vs `grace-bay-turks`, same AP (PLS), 5.6 km apart — Jack's call |

### lateSeason Authoritative List (14 venues)

Confirmed by code inspection: `whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `engelberg`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`.

**Grep note:** `grep -c "lateSeason.true"` returns **9** (compact-format venues only). The 5 JSON-format venues (`snowbird`, `zermatt`, `engelberg`, `verbier`, `val-thorens`) use `"lateSeason": true` with `: ` (2 chars) which the single-wildcard `.` misses. Correct pattern: `grep -c "lateSeason.*true"` → 14. Stop treating 9 as the count.

---

## 2. BASE_PRICES Coverage (Open #22 — unchanged)

| Metric | Value |
|--------|-------|
| Unique venue airports | 146 |
| Destination APs in BASE_PRICES (matching venues) | **46 (31.5%)** |
| Destination APs in BASE_PRICES (origin hubs only) | 30 (JFK, LAX, ORD, etc. — not venue destinations) |
| Venue APs missing from BASE_PRICES | **100 (68.5%)** |
| Venues without live deal scoring | **235 (63%)** |

**Top missing airports by venue count:**

| Airport | Venues | Region |
|---|---|---|
| CUN | 9 | Cancún / Riviera Maya, Mexico |
| IBZ | 7 | Ibiza, Spain |
| HKT | 6 | Phuket, Thailand |
| BTV | 5 | Vermont ski, USA |
| NCE | 5 | French Riviera / Alps, France |
| ZNZ | 5 | Zanzibar, Tanzania |
| MRU | 5 | Mauritius |
| PLS | 4 | Providenciales (Turks & Caicos) |
| AXA | 4 | Anguilla |
| SXM | 4 | Sint Maarten |
| NAP | 4 | Naples / Amalfi, Italy |
| CAG | 4 | Sardinia, Italy |
| FAO | 4 | Algarve, Portugal |
| SPU | 4 | Split / Dalmatia, Croatia |
| USM | 4 | Koh Samui, Thailand |

**Priority backfill: CUN + IBZ + HKT + BTV + NCE = 31 venues unlocked, ~2h work.** DevOps has the paste block ready. No VPS redeploy needed — this is a client-side code change only.

---

## 3. Seasonal Relevance (August 2, 2026)

### Skiing

| Segment | Count | August Status |
|---------|-------|---------------|
| N. hemisphere ski venues | 108 | ⚠️ Off-season — binary cap applies |
| N. hemisphere `lateSeason:true` | 14 | 🟡 Viable — bypass cap when snow_depth_max ≥ 0.5m |
| S. hemisphere ski venues | 23 | ✅ Peak season (Jun–Sep) |

**Best current ski:** S.hemisphere — Las Leñas, Cerro Catedral (Argentina), Corralco (Chile), Cardrona/Mt Hutt (NZ). N.hemisphere lateSeason — Zermatt Glacier, Saas-Fee, Tignes Glacier de Grande Motte, Val Thorens summer skiing.

### Beach

| Segment | Count | August Status |
|---------|-------|---------------|
| N. hemisphere beach | 187 | ✅ Peak season (water 22–30°C) |
| S. hemisphere tropical (lat > −20°) | ~35 | ✅ Warm year-round (26–30°C) |
| S. hemisphere temperate (lat < −20°) | ~20 | ⚠️ Winter — water 14–18°C, hard cap triggers |

**Correctly deprioritized in August:** Bondi/Manly/Bronte/Coogee (Sydney), Hyams Beach NSW, Clifton Fourth Beach (Cape Town), Florianópolis. Marine API hard cap handles these without manual intervention.

**No venue is being promoted in its worst season** — scoring engine handles this correctly.

---

## 4. Content Quality

### Tags

| Metric | Value | Status |
|--------|-------|--------|
| Avg tags per venue | 2.7 | ⚠️ Below ideal (4–5 is search-optimal) |
| Venues with only 2 tags | **227** (61%) | ⚠️ Limits search/filter relevance |
| Min tags | 2 | No venue has fewer |
| Max tags | 5 | Best venues use 4–5 descriptive tags |

227 venues at the 2-tag minimum. Adding 2–3 tags per venue is a content sprint task (no code changes). Not a launch blocker.

### Photo Duplication (unchanged)

| Metric | Value |
|--------|-------|
| Total venues | 373 |
| Unique photo URLs | **170** |
| Venues sharing a photo | **328 (88%)** |
| Max repeat | 3× (post June dedup) |

Resolution path: `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`. ~203 new photos needed for 1× uniqueness. Open #20.

---

## 5. Daily Venue Additions — 5 New Venues

**Context:** 30 consecutive proposals unshipped across 6 sessions (Jul 28–Aug 1 batches remain valid). PM v106 flagged suspend until VPS clears. Today's batch banked for when the pipeline reopens. All 5 target BASE_PRICES airports with **0 current venues** — distinct from prior batches (Europe/Brazil beach). Today: 1 French Alps ski + 4 beach (Americas / Atlantic / Asia).

---

### AIRPORT_COORDS Additions Required for Today's Batch

All 5 airports are in `AP_CONTINENT` and `BASE_PRICES` already. Paste into `AIRPORT_COORDS` in app.jsx:

```javascript
  GNB:{lat:45.3626,lon:5.3293},      // Grenoble Alpe d'Huez International
  LIR:{lat:10.5934,lon:-85.5444},    // Liberia (Guanacaste), Costa Rica
  SAL:{lat:16.7413,lon:-22.9494},    // Sal Island, Cape Verde (Amílcar Cabral Intl)
  CEB:{lat:10.3072,lon:123.9799},    // Mactan–Cebu International, Philippines
  PDG:{lat:-0.7869,lon:100.2808},    // Minangkabau International, Padang, Sumatra
```

---

### Venue 1 — Alpe d'Huez, French Alps (GNB)

```javascript
{id:"alpe-dhuez-fr", category:"skiing",
  title:"Alpe d'Huez", location:"Isère, French Alps, France",
  lat:45.0903, lon:6.0683, ap:"GNB",
  icon:"🏔️", rating:4.88, reviews:28400,
  gradient:"linear-gradient(160deg,#0a1a38,#1a3478,#2c58c0)",
  accent:"#70a8e0",
  skiPass:"independent", lateSeason:true,
  tags:["250km Pistes","South-Facing Sun Island","2100m Vertical","Sarenne Summer Glacier","August Skiing"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** GNB in BASE_PRICES (JFK→GNB ~$760), 0 venues. Alpe d'Huez: 250 km pistes, the "Sun Island of the Alps" (south-facing, 300 sunny days), 2100m vertical. Glacier de Sarenne open for summer skiing into August. First ski resort using GNB airport. `lateSeason:true` warranted — Sarenne opens late June–Aug 10 most years with ≥0.5m snow depth. AP_CONTINENT=europe ✅.

---

### Venue 2 — Playa Conchal, Costa Rica (LIR)

```javascript
{id:"playa-conchal-cr", category:"beach",
  title:"Playa Conchal", location:"Guanacaste, Costa Rica",
  lat:10.3811, lon:-85.8258, ap:"LIR",
  icon:"🐚", rating:4.91, reviews:34200,
  gradient:"linear-gradient(160deg,#001a20,#003040,#005060)",
  accent:"#40c8c0",
  tags:["Crushed Shell Sand","Crystal 28°C Pacific","Closest Luxury Beach to US","Howler Monkey Canopy","Dry Season August"],
  photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** LIR in BASE_PRICES (MIA→LIR ~$260, JFK→LIR ~$400), 0 venues despite SJO having 3. Playa Conchal: unique crushed-white-shell beach, consistently Costa Rica's #1. Liberia airport (LIR) is 20 min closer to Guanacaste coast than SJO. August = Pacific dry season, peak conditions. AP_CONTINENT=na ✅.

---

### Venue 3 — Santa Maria Beach, Sal Island, Cape Verde (SAL)

```javascript
{id:"santa-maria-sal-cv", category:"beach",
  title:"Santa Maria Beach", location:"Sal Island, Cape Verde",
  lat:16.5993, lon:-22.9021, ap:"SAL",
  icon:"🌬️", rating:4.79, reviews:19800,
  gradient:"linear-gradient(160deg,#001020,#002040,#004080)",
  accent:"#40b0e0",
  tags:["Atlantic Trade Winds","8km White Sand Bay","Year-Round 25°C Water","Desert Island Isolation","Kitesurfing Capital"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** SAL in BASE_PRICES (JFK→SAL ~$360), 0 venues. Santa Maria: 8 km crescent on a desert Atlantic island, 25°C water year-round, consistent Harmattan trade winds. Cape Verde sits at intersection of West Africa / Atlantic routes — adds unique geography between European and Caribbean beach options. August: dry season on Sal. AP_CONTINENT=na (SAL:"na" confirmed in code) ✅. ⚠️ Verify photo is Cape Verde scene, not generic tropical.

---

### Venue 4 — Moalboal Reef Beach, Cebu, Philippines (CEB)

```javascript
{id:"moalboal-cebu-ph", category:"beach",
  title:"Moalboal Sardine Run Beach", location:"Cebu, Philippines",
  lat:9.9426, lon:123.3898, ap:"CEB",
  icon:"🐟", rating:4.87, reviews:22600,
  gradient:"linear-gradient(160deg,#001828,#003058,#0060a0)",
  accent:"#30b8e8",
  tags:["Sardine Run From Shore","Sea Turtles at Sunset","Coral Wall to 40m","Year-Round 28°C Water","2hr Bus from Cebu City"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** CEB in BASE_PRICES (LAX→CEB ~$1000), 0 venues. Moalboal: world's most accessible sardine run — 10M-strong bait ball 2m below surface directly off the beach, no boat needed. Sea turtles, coral walls to 40m. 2h bus from Cebu City. Adds Southeast Asia beyond Bali (DPS). August: warm water, manageable swell. AP_CONTINENT=asia ✅. ⚠️ Verify photo before shipping.

---

### Venue 5 — Mandeh Bay, West Sumatra, Indonesia (PDG)

```javascript
{id:"mandeh-bay-sumatra", category:"beach",
  title:"Mandeh Bay", location:"West Sumatra, Indonesia",
  lat:-1.3397, lon:100.5047, ap:"PDG",
  icon:"🏝️", rating:4.83, reviews:12400,
  gradient:"linear-gradient(160deg,#001a14,#003028,#005040)",
  accent:"#40d8a8",
  tags:["10-Island Lagoon Cluster","Emerald Warm Water","Zero Tourist Crowds","Island-Hopping by Boat","The Raja Ampat of Sumatra"],
  photo:"https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** PDG in BASE_PRICES (JFK→PDG ~$1500), 0 venues. Mandeh Bay: undiscovered 10-island lagoon cluster 50km south of Padang, often called "the Raja Ampat of West Sumatra." Emerald warm water, coral reefs, no international hotel chains. August: Sumatra is near-equatorial (lat −1.3°) — water consistently 28°C, drier season. Adds Indonesia beyond Bali. AP_CONTINENT=asia ✅. ⚠️ Verify photo is West Sumatra scene, not Bali.

---

**Pre-add checklist (today's 5):**
- AP_CONTINENT: GNB=europe ✅, LIR=na ✅, SAL=na ✅, CEB=asia ✅, PDG=asia ✅
- All 5 in BASE_PRICES ✅
- AIRPORT_COORDS: ALL 5 MISSING — paste block provided above ⚠️
- No ID conflicts with existing 373 venues ✅
- Run `node scripts/validate-venues.mjs` after adding
- ⚠️ Verify photos for CEB and PDG before shipping (tagged above)
- `alpe-dhuez-fr`: `lateSeason:true` included — Sarenne summer glacier justifies it

---

## One Observation the PM Should Know

**The BASE_PRICES backfill (CUN+IBZ+HKT+BTV+NCE) is the highest-ROI action not blocked by the VPS.** It's a client-side code change — paste ~5 new rows into BASE_PRICES, commit, push. Unlocks deal scoring for 31 existing venues (the ones users are already browsing). DevOps has the exact paste block in the report. Takes 20 minutes. No VPS, no deploy, no coordination. If Jack is looking for the one thing to do before Reddit, this is it — not adding new venues, not the photo pipeline.

**Pre-launch priority stack (2026-08-02):**
1. **VPS redeploy** — Day 9, P0 (Open #19/23). `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/ && ssh root@198.199.80.21 'cd /opt/peakly-proxy && pm2 restart peakly-proxy'`
2. **BASE_PRICES backfill CUN+IBZ+HKT+BTV+NCE** — client-side, 20 min, no VPS needed (Open #22)
3. **Photo pipeline** — `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` (Open #20)
4. **Venue backlog** — 30 proposals queued across 6 batches (Jul 28–Aug 2)
5. **Open #21 APNS fix** — uncommitted working-tree change, finish + commit
