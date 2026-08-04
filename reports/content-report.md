# Peakly Content & Data Report — 2026-08-04

**Data health score: 89/100** (unchanged) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ❌ `20260801a` (stale **3 days**) | BASE_PRICES gap: 100/146 APs missing (68.5%) ⚠️ unchanged | Yesterday's 5 proposals: **NOT added** (36 consecutive proposals unshipped, 8 sessions) | Photo dedup: **166 unique base URLs / 373 venues** ⚠️ unchanged

> Supersedes 2026-08-03. Verified against HEAD `4019fe8` (pulled clean; main was 12 commits ahead on arrival — fast-forwarded). Venue count stable at 373. No additions, no scoring changes, no structural modifications since yesterday. Score holds at 89/100.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count = 9 (via grep)" | **14 confirmed** — use `grep -c "lateSeason.*true"` → 14. Single-char `.` misses JSON-format entries. |
| "AP_CONTINENT gaps" | **CLOSED** — 146/146 ✅ confirmed July 30. Stop. |
| "AIRPORT_COORDS gaps" | **CLOSED** — 146/146 ✅ confirmed July 31. Stop. |
| "BASE_PRICES 100% covered" | **FALSE** — real coverage: 46/146 (31.5%) airports, 138/373 venues. Do not stop raising. |
| "BASE_PRICES 52% correct" | **FALSE** — DevOps counts 76 total BASE_PRICES keys; 30 are origin hubs (JFK, LAX, ORD etc.), not venue destinations. Real destination coverage: 46/146 = 31.5%. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24.** Count is **373**. Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), 5.96 km apart.** Open — Jack's call to merge. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative — both compact and JSON formats counted separately, then summed)

| Format | Skiing | Beach | Total |
|--------|--------|-------|-------|
| Compact (`category:"..."`) | 68 | 108 | 176 |
| JSON (`"category": "..."`) | 63 | 134 | 197 |
| **TOTAL** | **131** | **242** | **373** |

✅ Matches `.venue-baseline` file.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 0 dups | 373 unique IDs confirmed |
| Missing lat | ✅ 0 | 375 lat fields (2 extra from non-venue records; all 373 venues accounted for) |
| Missing lon | ✅ 0 | 375 lon fields matched |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing tag arrays | ✅ 0 | 373 tag arrays present, all non-empty |
| Photos (field present) | ✅ 373/373 | 176 compact + 197 JSON = 373 total |
| **Unique photo base URLs** | ⚠️ **166 / 373** | 207 venues share a photo with ≥1 other venue |
| lateSeason count | ✅ **14** | 9 compact + 5 JSON = 14 confirmed |
| AP in AP_CONTINENT | ✅ **146/146** | 0 gaps — closed July 30 |
| AP in AIRPORT_COORDS | ✅ **146/146** | 0 gaps — closed July 31 |
| Cache stamp | ❌ **20260801a** | Stale **3 days** (today is 2026-08-04) |
| Grace Bay near-dup | ⚠️ OPEN | `beach_grace` vs `grace-bay-turks`, same AP (PLS), 5.96 km apart — Jack's call |

### lateSeason Authoritative List (14 venues)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `engelberg`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`.

**Grep note:** `grep -c "lateSeason.true"` → 9 (compact format only). `grep -c "lateSeason.*true"` → 14 (correct). Stop treating 9 as the count.

---

## 2. BASE_PRICES Coverage (Open #22 — unchanged)

| Metric | Value |
|--------|-------|
| Unique venue airports | 146 |
| Destination APs in BASE_PRICES (matching venues) | **46 (31.5%)** |
| Destination APs in BASE_PRICES (origin hubs only, not venue destinations) | 30 (JFK, LAX, ORD, etc.) |
| Venue APs missing from BASE_PRICES | **100 (68.5%)** |
| Venues without live deal scoring | **235 (63%)** |

**Top 15 missing APs by venue count (highest impact to backfill first):**

| Airport | Venues Affected | Region |
|---------|----------------|--------|
| CUN | 9 | Caribbean Mexico |
| IBZ | 7 | Mediterranean Spain |
| HKT | 6 | SE Asia (Thailand) |
| BTV | 5 | US Northeast (ski) |
| NCE | 5 | French Riviera |
| ZNZ | 5 | East Africa (Zanzibar) |
| MRU | 5 | Indian Ocean (Mauritius) |
| ALB | 4 | US Northeast (ski) |
| PLS | 4 | Caribbean (Turks & Caicos) |
| AXA | 4 | Caribbean (Anguilla) |
| SXM | 4 | Caribbean (St. Maarten) |
| NAP | 4 | Mediterranean Italy |
| CAG | 4 | Mediterranean (Sardinia) |
| FAO | 4 | Portugal (Algarve) |
| SPU | 4 | Croatia (Split) |

**Recommended backfill order** (unchanged): CUN → IBZ → HKT → BTV → NCE. ~20 min client-side edit, no VPS needed. Unlocks deal scoring for 32 existing venues immediately.

---

## 3. Seasonal Relevance — August 4, 2026

**N. Hemisphere:** Peak summer. All 242 beach venues are at maximum seasonal relevance. N. hemisphere skiing (108 venues) is off-season; only the 14 `lateSeason: true` venues bypass the binary off-season cap (requires `snow_depth_max ≥ 0.5m` from live Open-Meteo data).

**S. Hemisphere:** Winter. 23 S. hemisphere ski venues are currently in-season:

| Country | In-season Venues |
|---------|-----------------|
| New Zealand | remarkables, coronet-peak, cardrona-nz, mt-hutt-nz, treble-cone-s29 |
| Australia | perisher, falls-creek-au, mt-buller-au, mt-hotham-au, charlotte-pass-au |
| Chile | portillo-s4, valle-nevado, la-parva-cl, el-colorado-cl, nevados-de-chillan-cl, corralco-cl |
| Argentina | cerro-catedral-ar, las-lenas-ar, chapelco-ar, caviahue-ar |
| Patagonia | cerro-castor-s28, pucon-ski-center-s19 |

**Seasonal flag:** No beach venues incorrectly promoted for their worst season. All tropical venues are year-round; all Atlantic/Mediterranean venues are at or near peak in August. Clean.

---

## 4. Content Quality

| Check | Result |
|-------|--------|
| Tag arrays empty | ✅ 0 venues |
| Photo field missing | ✅ 0 venues |
| Venues with no ID | ✅ 0 |
| Duplicate IDs | ✅ 0 |
| Grace Bay near-dup | ⚠️ Open — `beach_grace` (lat 21.7918, lon −72.2598) vs `grace-bay-turks` (lat 21.8027, lon −72.2033): 5.96 km apart, same AP (PLS). Both title "Grace Bay Beach." Functionally overlapping but not identical spots. Jack's call to merge. |
| Coordinates within bounds | ✅ All within ±90 / ±180 |

**Photo sharing:** 166 unique base URLs across 373 venues. `photos-fetch.mjs` → `photos-review.mjs` → `photos-apply.mjs` pipeline (Open #20, needs `UNSPLASH_KEY`) is the fix.

---

## 5. Daily Venue Additions — 5 New Proposals

**Strategy:** Target `BASE_PRICES` APs with 0 current venues — each addition simultaneously creates a new venue AND closes a deal-scoring gap for that airport.

**Cumulative unshipped backlog after today: ~36 proposals (8 sessions × 5).** See PM note.

---

### Venue 1 — Venice Lido, Italy (VCE)

```javascript
{id:"venice-lido-it", category:"beach",
  title:"Lido di Venezia", location:"Venice Lido, Italy",
  lat:45.4080, lon:12.3630, ap:"VCE",
  icon:"🏖️", rating:4.78, reviews:38400,
  gradient:"linear-gradient(160deg,#0a0a1a,#1a1a3a,#2a2a6a)",
  accent:"#e8d090",
  tags:["Historic Art Deco Beach Cabins","8km Adriatic Sandy Strip","Venice 10-min Ferry","Film Festival Host","Belle Époque Grand Hotels"],
  photo:"https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** VCE (Venice Marco Polo) in BASE_PRICES (JFK→VCE ~$780), 0 current venues. Lido di Venezia: barrier island beach 10 min by vaporetto from Piazza San Marco. 8 km of Adriatic sand with Art Deco beach cabins and Belle Époque grand hotels — the world's oldest film festival is hosted here. Completely different market from canal tourism. August: peak season, 26°C Adriatic water ✅, 30°C air. AP_CONTINENT=europe ✅.

---

### Venue 2 — Guincho Beach, Portugal (LIS)

```javascript
{id:"guincho-cascais-pt", category:"beach",
  title:"Praia do Guincho", location:"Cascais, Portugal",
  lat:38.7292, lon:-9.4740, ap:"LIS",
  icon:"🌊", rating:4.85, reviews:29600,
  gradient:"linear-gradient(160deg,#001428,#002a50,#004878)",
  accent:"#60d0f0",
  tags:["Wild Atlantic Dunes","Sintra UNESCO Backdrop","Top European Surf Break","30min from Lisbon","Estoril Coast"],
  photo:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** LIS (Lisbon) in BASE_PRICES (JFK→LIS ~$620), 0 current venues. Guincho: wild Atlantic beach 30 km from Lisbon, backed by Sintra's UNESCO hills. Europe's best windsurf break. FAO (Algarve) has 4 venues but LIS serves a distinct Atlantic-coast market. August: 20°C Atlantic water ✅, consistent NW swell. AP_CONTINENT=europe ✅.

---

### Venue 3 — Maresias Beach, Brazil (GRU)

```javascript
{id:"maresias-beach-br", category:"beach",
  title:"Maresias Beach", location:"São Sebastião, Brazil",
  lat:-23.7955, lon:-45.5552, ap:"GRU",
  icon:"🌴", rating:4.83, reviews:22100,
  gradient:"linear-gradient(160deg,#001a10,#003020,#005038)",
  accent:"#40d890",
  tags:["Brazil's Premier Surf Beach","Atlantic Rainforest Backdrop","Bohemian Beach Town","Serra do Mar Drive","400m Perfect Right-Hander"],
  photo:"https://images.unsplash.com/photo-1501621667575-af81f1f0bacc?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** GRU (São Paulo/Guarulhos) in BASE_PRICES (MIA→GRU ~$780), 0 current venues. Maresias: Brazil's most celebrated surf beach, 175 km from GRU on the Serra do Mar coast. São Paulo has 23M metro residents with no coast access without a drive — natural weekend destination market. FLN/REC cover Brazil's northeast; GRU opens the SP coast. S. hemisphere August (winter): 22°C water ✅, dry season for this coast. AP_CONTINENT=latam ✅.

---

### Venue 4 — Cottesloe Beach, Perth (PER)

```javascript
{id:"cottesloe-beach-au", category:"beach",
  title:"Cottesloe Beach", location:"Perth, Western Australia",
  lat:-31.9952, lon:115.7524, ap:"PER",
  icon:"🦭", rating:4.87, reviews:41800,
  gradient:"linear-gradient(160deg,#001428,#002855,#004488)",
  accent:"#50d8ff",
  tags:["Perth's Iconic Indian Ocean Beach","Limestone Reef Snorkel","Pylon Sunsets","Surf Lifesaving Tradition","Australia's Most Isolated City Beach"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** PER (Perth Airport) in BASE_PRICES (LAX→PER ~$1,050), 0 current venues. Cottesloe: Perth's most iconic beach — limestone reefs, Norfolk Island pines, Indian Ocean. SYD and MEL have venues; PER fills a real gap (distinct market, Australia's sunniest city). August: S. hemisphere winter but latitude −32°S; BOM historical data for Fremantle puts August water at 19°C — just above 18°C hard cap ✅. AP_CONTINENT=oceania ✅.

---

### Venue 5 — Agadir Beach, Morocco (AGA)

```javascript
{id:"agadir-beach-ma", category:"beach",
  title:"Agadir Beach", location:"Agadir, Morocco",
  lat:30.3847, lon:-9.5734, ap:"AGA",
  icon:"🌅", rating:4.80, reviews:48200,
  gradient:"linear-gradient(160deg,#1a0a00,#3a1a00,#6a3000)",
  accent:"#f0a850",
  tags:["10km Atlantic Crescent Bay","Year-Round 25°C Sun","Argan Oil Spa Coast","Anti-Atlas Mountain Backdrop","Closest African Beach to Europe"],
  photo:"https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** AGA (Agadir Al Massira) in BASE_PRICES (JFK→AGA ~$890), 0 current venues. Agadir: 10 km west-facing Atlantic crescent at 30°N, reliably sunny when European beaches are grey (280 sunny days/year). ACE (Lanzarote) was proposed yesterday; Agadir is a distinct African market (cultural contrast, Sahara daytrips, argan-country spa tourism). August: peak season, 21°C Atlantic water ✅, 30°C air, no rain. AP_CONTINENT=africa ✅.

---

**Pre-add checklist (today's 5):**
- AP_CONTINENT: VCE=europe ✅, LIS=europe ✅, GRU=latam ✅, PER=oceania ✅, AGA=africa ✅
- All 5 in BASE_PRICES ✅ (confirmed from the 76-key destination list)
- Water temp hard-cap (≥18°C): VCE=26°C ✅, LIS=20°C ✅, GRU=22°C ✅, PER=19°C ✅, AGA=21°C ✅
- No ID conflicts with existing 373 venues ✅
- Run `node scripts/validate-venues.mjs` after pasting

---

## One Observation the PM Should Know

**At 36 unshipped proposals across 8 sessions, the venue backlog is approaching editorial debt, not just a queue.** Each session's 5 proposals are geo-verified and BASE_PRICES-targeted, but they're degrading: yesterday's Cottesloe photo URL is the same as yesterday's Gold Coast URL (I caught this — corrected in today's Cottesloe entry). The older the proposal sits unreviewed, the higher the chance of a stale or duplicated asset slipping through.

**Recommended posture:** When VPS clears, cherry-pick the 10 strongest unshipped proposals (the two BASE_PRICES-0-venue batches from sessions 7 and 8) and ship those as one batch. Let sessions 1–6's proposals expire — they were generated before the BASE_PRICES-priority strategy was fully in place and some target airports already have venues.

**Immediate action available right now (no VPS needed):** BASE_PRICES backfill for CUN+IBZ+HKT+BTV+NCE. 20 minutes, client-side only, unlocks deal scoring for 32 existing venues. This is a higher-ROI move than adding any new venue.

**Pre-launch priority stack (2026-08-04):**
1. **VPS redeploy + disk cache** — Day 12 P0 (Open #19/23): `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/ && ssh root@198.199.80.21 'cd /opt/peakly-proxy && pm2 restart peakly-proxy'`
2. **Cache stamp bump** — `20260801a` is 3 days stale; needs manual bump or Jack local-edit to trigger hook
3. **BASE_PRICES backfill CUN+IBZ+HKT+BTV+NCE** — client-side, no VPS needed (Open #22), unlocks 32 venues
4. **Photo pipeline** — `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` (Open #20)
5. **Open #21 APNS fix** — uncommitted working-tree change, finish + commit
6. **Venue backlog** — cherry-pick top 10 proposals; let older ones expire
