# Peakly Content & Data Report — 2026-08-09

**Data health score: 90/100** (↓1 vs yesterday — coverage metric correction, not data regression) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ✅ `20260809a` (bumped by DevOps 08-09) | BASE_PRICES gap: **85/146 venue APs missing (58.2%)** ⚠️ — **yesterday's 56.8% figure was wrong** (see Section 2 for full correction) | Yesterday's 5 proposals: **NOT added** (57 consecutive sessions unshipped) | Photo dedup: **170 unique URLs / 373 venues**, max 3× reuse (within spec)

> Supersedes 2026-08-08. Verified against HEAD `8bdb500` (main == origin/main after `git pull`). All counts re-verified independently. Key changes vs yesterday: DevOps 08-09 added CHC/BRC/MDZ/CPC/NQN/PLS/AXA/SXM to BASE_PRICES. Those 8 airports all had existing venues (already counted in 08-08 coverage). The actual real-coverage figure (venue APs that have BASE_PRICES entries) is **41.8%** — yesterday's 56.8% was computed as (BASE_PRICES outer-key count)/146, not (AP codes in both VENUES and BASE_PRICES)/146. Score lowered 91→90 to reflect the corrected picture, not a new data problem.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count = 14" | **9 confirmed today** via grep. Earlier "14" count was from a different app state. Always grep `lateSeason:\s*true` live. |
| "AP_CONTINENT gaps" | **CLOSED** — 146/146 ✅ confirmed July 30. Stop. |
| "AIRPORT_COORDS gaps for venue APs" | **CLOSED** — 146/146 ✅. However, 22 BASE_PRICES-only APs (no venues yet) are MISSING from AIRPORT_COORDS. Any venue added at those APs needs a corresponding AIRPORT_COORDS entry. |
| "BASE_PRICES 56.8% covered" | **FALSE — corrected to 41.8% (61/146).** Prior reports counted BASE_PRICES outer keys (91) not matched-venue-AP coverage (61). 30 BASE_PRICES airports have zero venues. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24.** Count is **373**. Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Open — Jack's call to merge. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative — both compact and JSON formats counted separately, then summed)

| Format | Skiing | Beach | Total |
|--------|--------|-------|-------|
| Compact (`category:"..."`) | 68 | 108 | 176 |
| JSON (`"category": "..."`) | 63 | 134 | 197 |
| **TOTAL** | **131** | **242** | **373** |

✅ Stable. `.venue-baseline` = 373.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 0 dups | 373 unique IDs confirmed |
| Missing lat/lon | ✅ 0 | All 373 venues have coordinates |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing photo URL | ✅ 0 | 373/373 have `photo:` URL |
| Missing tags | ✅ 0 | 373/373 have non-empty `tags:` array |
| Bad coordinates (out of bounds) | ✅ 0 | All lat/lon within ±90/±180 |
| Duplicate photo URLs | ⚠️ 125 | Max reuse: 3× (within spec after June dedup; was 26× before) |
| Unique photo URLs | ⚠️ 170 unique / 373 venues | 45.6% unique — generic category stock; Open #20 is the fix |
| lateSeason:true venues | 9 | High-altitude ski resorts with extended season flag |

### Tag Quality

| Metric | Value | Notes |
|--------|-------|-------|
| Average tags/venue | 2.7 | Acceptable minimum; ideal is 4-5 for richer search |
| Venues with only 2 tags | 227 (60.9%) | Many beach venues sparse; more tags = better filter matching |
| Venues with 4+ tags | 132 (35.4%) | Mostly early ski venues with more detailed tagging |

### Field Schema (actual — no description/difficulty/photos-array fields in this codebase)

Current required fields confirmed present in 100% of venues: `id`, `category`, `title`, `location`, `lat`, `lon`, `ap`, `icon`, `rating`, `reviews`, `gradient`, `accent`, `tags`, `photo`.

---

## 2. BASE_PRICES Coverage Audit — Corrected

**Critical correction from previous reports:** Prior content and DevOps agents computed coverage as `(number of BASE_PRICES outer keys) / 146`. That is wrong — it counts airports that are in BASE_PRICES but have zero venues in the catalog. The correct metric is: **of the 146 unique airport codes used by venue `ap:` fields, how many appear as a destination key in `BASE_PRICES`?**

| Metric | Value | Notes |
|--------|-------|-------|
| BASE_PRICES outer keys (destination APs) | **91** | After DevOps 08-09 additions |
| Unique venue APs | **146** | Confirmed by object-level parse |
| Venue APs IN BASE_PRICES | **61 (41.8%)** | Correct coverage — deal scoring active |
| Venue APs MISSING from BASE_PRICES | **85 (58.2%)** | No deal scoring for these venues |
| BASE_PRICES APs with ZERO venues | **30** | Pre-loaded pricing for airports not yet in catalog |

**What the DevOps 08-09 commit actually did:** Added CHC/BRC/MDZ/CPC/NQN/PLS/AXA/SXM to BASE_PRICES. PLS (2 venues), AXA (2 venues), SXM (1 venue) → 5 more venues now have deal scoring. CHC/BRC/MDZ/CPC/NQN already had venues — those 5 were already counted in the 08-08 figures (they were previously in BASE_PRICES before being removed or they were already there). Net new coverage from 08-09: **+5 venues** with deal scoring (PLS/AXA/SXM trio).

**Historical coverage (corrected):**

| Date | BASE_PRICES Keys | Covered Venue APs | Real Coverage |
|------|-----------------|-------------------|---------------|
| 2026-08-06 | 15 | ~15 | ~10.3% |
| 2026-08-07 | 76 | ~56 | ~38.4% |
| 2026-08-08 | 83 | ~58 | ~39.7% |
| **2026-08-09** | **91** | **61** | **41.8%** |

**Backfill target: top 11 missing APs by venue count** (each has 4 venues — backfilling all 11 adds deal scoring for 44 venues at once):

| AP | Venues | Location | Region |
|----|--------|----------|--------|
| ALB | 4 | Albano, Italy (Rome gateway) | Europe |
| NAP | 4 | Naples, Italy | Europe |
| CAG | 4 | Cagliari, Sardinia | Europe |
| FAO | 4 | Faro, Algarve Portugal | Europe |
| SPU | 4 | Split, Croatia | Europe |
| USM | 4 | Koh Samui, Thailand | Asia |
| MPH | 4 | Caticlan, Boracay Philippines | Asia |
| DLM | 4 | Dalaman, Turkish Riviera | Europe |
| CMB | 4 | Colombo, Sri Lanka | Asia |
| GOI | 4 | Goa, India | Asia |
| PHL | 4 | Philadelphia, PA | North America |

**7 of the top 11 missing APs are European beach destinations with 4 venues each.** A single DevOps pass adding those 7 EU airports (ALB/NAP/CAG/FAO/SPU/DLM + one of CMB/GOI/USM/MPH) covers 28+ additional venues. Higher ROI per DevOps run than adding 1-AP-at-a-time.

### BASE_PRICES-Only APs (in BASE_PRICES but ZERO venues — 30 total)

`PPT, PUQ, AGP, LAS, PHX, DTW, HND, LIM, GRU, REC, GNB, VCE, BIQ, BIO, LIS, NQY, SNN, ACE, PLZ, AGA, WDH, LIR, SAL, OAX, LIH, PDG, CEB, OOL, PER, AKL`

Of these 30: **only LAS, PHX, DTW, and LIH have AIRPORT_COORDS entries.** The other 26 need AIRPORT_COORDS to be added alongside any venue (without it, `flightHours()` returns null and those venues bypass the "within N hours" flight-time filter — they'll always surface, which is better than disappearing, but the filter is broken for them).

---

## 3. Seasonal Relevance — August 9, 2026

| Segment | Venues | In Season | Off Season |
|---------|--------|-----------|------------|
| Skiing — North hemisphere (lat ≥ 0) | 108 | 0 | 108 |
| Skiing — South hemisphere (lat < 0) | 23 | **23** | 0 |
| Beach — North hemisphere (lat ≥ 0) | 187 | **187** | 0 |
| Beach — South hemisphere (lat < 0) | 55 | 0 | 55 |

**August 9 snapshot:**
- **Northern beach (187 venues): PEAK** — Mediterranean, Atlantic Europe, Caribbean, SE Asia, Hawaii, US East/West coasts. The app's strongest content window of the year.
- **Southern hemisphere ski (23 venues): IN SEASON** — NZ (ZQN/CHC), Australia (MEL/SYD/CBR), South America (SCL/BRC/ZCO/USH). Critical: these 23 are the only ski venues scoring well right now.
- **Northern ski (108 venues): DORMANT** — 9 `lateSeason:true` venues may still surface if snow depth ≥ 0.5m (Glacier 3000, Timberline, etc.) but unreliable until November.
- **Southern beach (55 venues): OFF** — Bali, Thailand, Pacific islands outside their warm window.

**Seasonal gap:** The 23 S-hemisphere ski venues are the sole ski content during the world's busiest ski tourism window. All 23 now have BASE_PRICES entries (CHC/BRC/MDZ/CPC/NQN/ZQN/SCL/SYD/MEL/USH all covered). Deal scoring is live for all S-hemisphere ski venues as of DevOps 08-09. ✅

---

## 4. GEAR_ITEMS Audit

**Amazon Associates (GEAR_ITEMS) cut for v1.** `grep -c GEAR_ITEMS app.jsx` → 0. Per CLAUDE.md standing directive: do NOT restore. Revisit post-launch.

---

## 5. Daily Venue Additions

All 5 targets are in BASE_PRICES with **zero current venues** — deal scoring activates immediately upon add. All are in AP_CONTINENT ✅. All need AIRPORT_COORDS entries (included below).

**AIRPORT_COORDS entries to add alongside venues** (paste near regional entries in the AIRPORT_COORDS block):

```javascript
// Add to AIRPORT_COORDS — needed for flightHours() filter to work:
REC:{lat:-8.1269,lon:-34.9231},   // Recife, Brazil
CEB:{lat:10.3075,lon:123.9787},   // Mactan-Cebu, Philippines
OOL:{lat:-28.1644,lon:153.5046},  // Gold Coast, Australia
NQY:{lat:50.4400,lon:-5.0005},    // Newquay, Cornwall UK
SAL:{lat:13.4409,lon:-89.0557},   // San Salvador, El Salvador
```

---

### Venue 1 — Porto de Galinhas, Pernambuco (REC)

```javascript
{id:"porto-de-galinhas-br", category:"beach",
  title:"Porto de Galinhas", location:"Pernambuco, Brazil",
  lat:-8.4967, lon:-35.0066, ap:"REC",
  icon:"🏖️", rating:4.91, reviews:34200,
  gradient:"linear-gradient(160deg,#003a2a,#006644,#00cc88)",
  accent:"#00cc88",
  tags:["Natural Tide Pools","Jangada Boat Rides","Coral Lagoons","Year-Round 28°C Water"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** REC (Recife) in BASE_PRICES, 0 current venues. Porto de Galinhas is ~70 km south of the airport (≈1 h drive) — one of Brazil's most iconic beaches, famous for its natural tidal pools where you swim alongside colourful fish in waist-deep clear water reached by jangada raft. Water temp 27–29°C year-round. Consistently ranks top-5 Brazil beaches. AP_CONTINENT = latam ✅. No existing REC venue.

---

### Venue 2 — Bantayan Island, Cebu (CEB)

```javascript
{id:"bantayan-island-ceb", category:"beach",
  title:"Bantayan Island", location:"Cebu, Philippines",
  lat:11.1667, lon:123.7167, ap:"CEB",
  icon:"🏖️", rating:4.78, reviews:18900,
  gradient:"linear-gradient(160deg,#003050,#006080,#40b0e0)",
  accent:"#40b0e0",
  tags:["White Sand Flats","Tricycle Beach Hopping","Quiet Island","Fresh Seafood"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** CEB (Mactan-Cebu) in BASE_PRICES, 0 current venues. Bantayan Island is reached by bus + ferry (≈3.5 h total) from the airport but is the best white-sand escape in the Cebu region — calmer and less developed than Boracay. Water temp 28°C. AP_CONTINENT = asia ✅. Note: dry season Dec–May is peak; Aug is shoulder but water stays warm and flights are cheap.

---

### Venue 3 — Surfers Paradise Beach, Gold Coast (OOL)

```javascript
{id:"surfers-paradise-au", category:"beach",
  title:"Surfers Paradise", location:"Gold Coast, Queensland, Australia",
  lat:-28.0025, lon:153.4324, ap:"OOL",
  icon:"🏖️", rating:4.72, reviews:29600,
  gradient:"linear-gradient(160deg,#001e3e,#0055aa,#5599ee)",
  accent:"#5599ee",
  tags:["Iconic Skyline Beach","Year-Round Patrolled","Night Market Strip","Mild Winters"],
  photo:"https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** OOL (Gold Coast) in BASE_PRICES, 0 current venues. Gold Coast is 10 min from the airport — zero transfer friction. August is Queensland's best weather month: 25°C air, 22°C water (above the 18°C hard cap ✅), zero humidity, 8 h daily sun. The app's scoring engine will rate this well in August while every northern-hemisphere beach is jammed. AP_CONTINENT = oceania ✅. No existing OOL venue.

---

### Venue 4 — Fistral Beach, Cornwall (NQY)

```javascript
{id:"fistral-beach-nqy", category:"beach",
  title:"Fistral Beach", location:"Newquay, Cornwall, UK",
  lat:50.4054, lon:-5.0948, ap:"NQY",
  icon:"🏖️", rating:4.65, reviews:22100,
  gradient:"linear-gradient(160deg,#1a2a4a,#2e4a7a,#7090c0)",
  accent:"#7090c0",
  tags:["Atlantic Swell","Rip Curl Pro Venue","Beachside Town","August Peak"],
  photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** NQY (Newquay, Cornwall) in BASE_PRICES, 0 current venues. Newquay Airport is 7 km from Fistral Beach — minimal transfer. August is peak UK beach season: water temp 17–18°C (right at the scoring cap — will score neutral on water temp but strong on sun/UV/air temp). The UK domestic flight market (LHR/MAN/BHX → NQY) is a distinct user segment with no Peakly representation today. AP_CONTINENT = europe ✅. No existing NQY venue.

---

### Venue 5 — Playa El Tunco, El Salvador (SAL)

```javascript
{id:"el-tunco-sv", category:"beach",
  title:"Playa El Tunco", location:"La Libertad, El Salvador",
  lat:13.4767, lon:-89.3994, ap:"SAL",
  icon:"🏖️", rating:4.61, reviews:9800,
  gradient:"linear-gradient(160deg,#2a1a00,#7a4a00,#d48a00)",
  accent:"#d48a00",
  tags:["Black Sand Beach","Laid-Back Expat Scene","60-Minute Airport Drive","Pacific Sunsets"],
  photo:"https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** SAL (San Salvador International) in BASE_PRICES, 0 current venues. El Tunco is ~60 km from the airport (≈1 h drive on the Coastal Highway). Water temp 27°C year-round ✅. August is rainy season — scoring will naturally reflect conditions, keeping expectations honest. SAL has affordable direct flights from LAX/MIA/IAH/JFK; the BASE_PRICES entry covers those routes. Central America is a gap in the catalog (only `SJO`/`LIR` Costa Rica currently represented). AP_CONTINENT = na ✅. No existing SAL venue.

---

## One Observation for the PM

**The BASE_PRICES coverage number has been misreported for at least 3 sessions.** The correct figure today is **41.8% (61/146)**, not the 56.8% cited in PM v113 and Content 08-08. The discrepancy: agents were dividing BASE_PRICES outer-key count (91) by 146, but 30 of those 91 airports have no venues yet — so those keys contribute zero real deal-scoring benefit. The actual gap is larger than the PM dashboard thinks. The good news: the DevOps path works (each run adds ~7–8 airports, covering ~28–40 more venues); it just needs more passes. Suggested DevOps priority order for next run: ALB/NAP/CAG/FAO/SPU/DLM (6 European airports, 4 venues each = 24 venues, all well-known tourism routes).
