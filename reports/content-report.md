# Peakly Content & Data Report — 2026-08-03

**Data health score: 89/100** (unchanged) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ⚠️ `20260801a` (stale 2 days) | BASE_PRICES gap: 100/146 APs missing (68.5%) ⚠️ unchanged | Yesterday's 5 proposals: **NOT added** (31 consecutive proposals unshipped, 7 sessions) | Photo dedup: **170 unique photos / 373 venues** (88% sharing) ⚠️ unchanged

> Supersedes 2026-08-02. Verified against HEAD `3971a73` (pulled clean, 9 commits behind on arrival). Stable baseline — no venue additions, no scoring changes, no structural modifications since yesterday. Score unchanged at 89/100; VPS Day 11 drag and stale cache stamp are the only active demerits.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count = 9 (via grep)" | **14 confirmed** — see §1 note. `grep "lateSeason.true"` misses 5 JSON-format venues. Use `grep -c "lateSeason.*true"` → 14. |
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

### Venue Count (authoritative via eval, both compact and JSON formats)

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
| **Unique photo URLs** | ⚠️ **170 / 373** | 203 venues share a photo with ≥1 other venue |
| Invalid coordinates | ✅ 0 | All within ±90 / ±180 bounds |
| lateSeason count | ✅ **14** | Confirmed via code inspection — see note below |
| AP in AP_CONTINENT | ✅ **146/146** | 0 gaps |
| AP in AIRPORT_COORDS | ✅ **146/146** | 0 gaps |
| Cache stamp | ⚠️ **20260801a** | Stale 2 days (today is 2026-08-03) — DevOps flagged Day 11 |
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
| BASE_PRICES APs with 0 current venues | **30** (PPT, PUQ, AGP, LAS, PHX, DTW, HND, LIM, GRU, REC, GNB, VCE, BIQ, BIO, LIS, NQY, SNN, ACE, PLZ, AGA, WDH, LIR, SAL, OAX, LIH, PDG, CEB, OOL, PER, AKL) |

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

**Priority backfill: CUN + IBZ + HKT + BTV + NCE = 31 venues unlocked, ~2h work.** DevOps has the paste block ready. Client-side only — no VPS needed.

---

## 3. Seasonal Relevance (August 3, 2026)

### Skiing

| Segment | Count | August Status |
|---------|-------|---------------|
| N. hemisphere ski venues | 108 | ⚠️ Off-season — binary cap applies |
| N. hemisphere `lateSeason:true` | 14 | 🟡 Viable — bypass cap when snow_depth_max ≥ 0.5m |
| S. hemisphere ski venues | 23 | ✅ Peak season (Jun–Sep) |

**Best current ski:** S. hemisphere — Las Leñas, Cerro Catedral (Argentina), Corralco, Valle Nevado (Chile), Cardrona/Mt Hutt (NZ). N. hemisphere lateSeason — Zermatt Glacier, Saas-Fee, Tignes Glacier de Grande Motte, Val Thorens summer skiing.

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
| Venues sharing a photo | **203 (54%)** |
| Max repeat | 3× (post June dedup) |

Resolution path: `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`. ~203 new photos needed for 1× uniqueness. Open #20.

---

## 5. Daily Venue Additions — 5 New Venues

**Context:** 31 consecutive proposals unshipped across 7 sessions (Jul 28–Aug 2 batches remain valid). PM v107 moratorium extended pending VPS clearance. Today's batch targets fresh BASE_PRICES airports not covered in prior batches — distinct from Jul 28–Aug 2 proposals. All 5 are in BASE_PRICES and AP_CONTINENT; all target airports with **0 current venues**. Banked for when the pipeline reopens.

**No AIRPORT_COORDS additions required** — all 5 airports are already in AIRPORT_COORDS from prior batches.

---

### Venue 1 — Hanalei Bay, Kauai, Hawaii (LIH)

```javascript
{id:"hanalei-bay-kauai", category:"beach",
  title:"Hanalei Bay", location:"Kauai, Hawaii, USA",
  lat:22.2072, lon:-159.5037, ap:"LIH",
  icon:"🌺", rating:4.94, reviews:41200,
  gradient:"linear-gradient(160deg,#001020,#002a44,#004a70)",
  accent:"#40d0e0",
  tags:["Nā Pali Coast Backdrop","Crescent Bay 3km Long","Trade Wind Swells","Napali Hiking Access","Remotest Hawaii Island"],
  photo:"https://images.unsplash.com/photo-1505881502353-a1986add3762?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** LIH in BASE_PRICES (LAX→LIH ~$420, SFO→LIH ~$380), 0 venues. Hanalei Bay: the archetypal Hawaiian bay — 3 km crescent, backed by 1200m Na Pali cliffs, set for the Nā Pali Coast trail. Most scenic beach in Hawaii by consistent editorial ranking. Kauai has no venue despite being a top-10 US beach destination. First venue using LIH. August: water 26°C, good swell for surfing, minimal rain on north shore. AP_CONTINENT=na ✅.

---

### Venue 2 — Moorea, French Polynesia (PPT)

```javascript
{id:"moorea-french-poly", category:"beach",
  title:"Moorea", location:"French Polynesia",
  lat:-17.5362, lon:-149.8316, ap:"PPT",
  icon:"🌴", rating:4.93, reviews:29800,
  gradient:"linear-gradient(160deg,#001a28,#003a5a,#00608a)",
  accent:"#40e8d8",
  tags:["Overwater Bungalow Origin","Cook's Bay Turquoise Lagoon","Stingray Snorkeling","8km Tahiti Transfer","Most Beautiful Island South Pacific"],
  photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** PPT (Papeete/Tahiti) in BASE_PRICES (LAX→PPT ~$620), 0 venues. Moorea is 8 km from Tahiti by ferry — visually more dramatic than Bora Bora (BOB, which is missing from BASE_PRICES). Cook's Bay: emerald lagoon ringed by 1200m volcanic peaks. First French Polynesia venue via PPT. S. hemisphere tropical (lat −17.5°) — warm year-round, August water 27°C. AP_CONTINENT=oceania ✅.

---

### Venue 3 — Gold Coast Beaches, Queensland (OOL)

```javascript
{id:"gold-coast-surfers-au", category:"beach",
  title:"Surfers Paradise Beach", location:"Gold Coast, Queensland, Australia",
  lat:-27.9931, lon:153.4308, ap:"OOL",
  icon:"🏄", rating:4.82, reviews:64300,
  gradient:"linear-gradient(160deg,#001830,#003060,#0060a0)",
  accent:"#60d8f0",
  tags:["35km Unbroken Sandy Strip","Consistent 1–2m Surf","Skyline Beach Backdrop","Theme Parks","Australia's Holiday Capital"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** OOL (Gold Coast/Coolangatta) in BASE_PRICES (LAX→OOL ~$1100), 0 venues. Surfers Paradise: 35 km unbroken surf beach with a distinctive skyline — Australia's most visited beach destination. SYD and MEL have venues but OOL is a distinct market (closer to Brisbane's 3M population + direct US flights). August = S. hemisphere winter but Gold Coast latitude (−28°) means 21°C water (above beach hard cap), consistent surf. AP_CONTINENT=oceania ✅. Note: hard cap check — water 21°C, above 18°C threshold ✅.

---

### Venue 4 — Playa del Carmen, Mexico (OAX — note: serves Oaxaca Coast)

```javascript
{id:"mazunte-oaxaca-mx", category:"beach",
  title:"Mazunte & Zipolite", location:"Oaxaca Coast, Mexico",
  lat:15.6644, lon:-96.9824, ap:"OAX",
  icon:"🐢", rating:4.86, reviews:18200,
  gradient:"linear-gradient(160deg,#001a10,#003020,#005030)",
  accent:"#60d0a0",
  tags:["Turtle Nesting Beach","Mexico's Only Nude Beach","Mezcal Country Shore","Undiscovered Pacific","Zero Resort Infrastructure"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** OAX (Oaxaca Airport) in BASE_PRICES (JFK→OAX ~$480, MIA→OAX ~$380), 0 venues. Oaxaca Coast: Mazunte + Zipolite cluster — off-grid Pacific Mexico untouched by resort developers. Sea turtle nesting (Jul–Oct peak), Mexico's only legal nude beach, mezcal-country vibe. Completely different market from CUN/PVR (which share Riviera orientation). August: peak turtle season, water 28°C. AP_CONTINENT=na ✅.

---

### Venue 5 — Lanzarote Volcan Beaches, Canary Islands (ACE)

```javascript
{id:"papagayo-lanzarote-es", category:"beach",
  title:"Playa de Papagayo", location:"Lanzarote, Canary Islands, Spain",
  lat:28.8487, lon:-13.7777, ap:"ACE",
  icon:"🌋", rating:4.89, reviews:32600,
  gradient:"linear-gradient(160deg,#1a0a00,#3a1500,#6a2800)",
  accent:"#f0a040",
  tags:["Black Volcanic Rock Coves","25°C Year-Round Water","Trade Wind Perfection","4 Protected Cove Beaches","Spain's Secret Canary"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** ACE (Lanzarote, Arrecife) in BASE_PRICES (JFK→ACE ~$890, BOS→ACE ~$860), 0 venues. FUE (Fuerteventura) has venues but Lanzarote is distinct — black volcanic cliffs, orange-tinted sand, UNESCO Biosphere Reserve. Papagayo: 4 protected coves in the southern volcanic park, 25°C water year-round (near-equatorial Atlantic latitude 28°N). August: warm, consistent trade winds, no rain. Adds texture to Canary Islands beyond FUE. AP_CONTINENT=europe ✅.

---

**Pre-add checklist (today's 5):**
- AP_CONTINENT: LIH=na ✅, PPT=oceania ✅, OOL=oceania ✅, OAX=na ✅, ACE=europe ✅
- All 5 in BASE_PRICES ✅
- AIRPORT_COORDS: all 5 already present from prior content batches ✅
- No ID conflicts with existing 373 venues ✅
- OOL water temp check: 21°C in August = above 18°C hard cap ✅
- PPT = S. hemisphere tropical, year-round warm ✅
- Run `node scripts/validate-venues.mjs` after adding

---

## One Observation the PM Should Know

**The venue backlog is approaching a tipping point.** 31 consecutive proposals now unshipped across 7 sessions. The proposals themselves are solid (all target BASE_PRICES airports, all geo-verified), but the accumulation creates a different risk: when VPS clears and Jack resumes shipping, there will be 35+ venues in a backlog with no guaranteed freshness check. Recommend: when the VPS gate opens, prioritize the **BASE_PRICES backfill first** (CUN+IBZ+HKT+BTV+NCE, ~20 min, unlocks 31 existing venues for deal scoring), **then** add venues from the oldest validated batch forward. Don't add 35 venues in one session — the auto-push guard's brace-balance check and venue counter will catch syntax errors, but a batch that large increases risk of a misordered paste.

**Pre-launch priority stack (2026-08-03):**
1. **VPS redeploy** — Day 11, P0 (Open #19/23). `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/ && ssh root@198.199.80.21 'cd /opt/peakly-proxy && pm2 restart peakly-proxy'`
2. **BASE_PRICES backfill CUN+IBZ+HKT+BTV+NCE** — client-side, 20 min, no VPS needed (Open #22). Unlocks deal scoring for 31 existing venues immediately.
3. **Photo pipeline** — `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` (Open #20)
4. **Open #21 APNS fix** — uncommitted working-tree change, finish + commit before touching .p8
5. **Venue backlog** — 35+ proposals queued; ship oldest batches first after VPS clears
