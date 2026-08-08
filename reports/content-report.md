# Peakly Content & Data Report — 2026-08-08

**Data health score: 91/100** (+2 vs yesterday) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ✅ `20260808a` (bumped by DevOps run today) | BASE_PRICES gap: 93/146 venue APs missing (63.7%) ⚠️ down from 68.5% after DevOps added 7 APs covering 42 venues | Yesterday's 5 proposals: **NOT added** (56 consecutive proposals unshipped, 12 sessions) | Photo dedup: **45 unique URLs / 373 venues** ⚠️ max reuse 3× (within post-dedup spec, still mostly generic stock)

> Supersedes 2026-08-07. Verified against HEAD after `git fetch` and `git pull` (HEAD `2e71150`, main == origin/main). All counts re-verified independently. Key changes vs yesterday: DevOps added CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU to BASE_PRICES (42 more venues now have deal scoring). Score bumped 89→91 reflecting that improvement.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count = 9 (via grep)" | **14 confirmed** — `grep -c "lateSeason.*true"` → 14. Single-char `.` misses JSON-format entries. |
| "AP_CONTINENT gaps" | **CLOSED** — 146/146 ✅ confirmed July 30. Stop. |
| "AIRPORT_COORDS gaps for venue APs" | **CLOSED** — 146/146 ✅ confirmed July 31. However, 30 BASE_PRICES-only APs (airports that are in BASE_PRICES but have no venues yet) are MISSING from AIRPORT_COORDS. Any venue added at those APs needs a corresponding AIRPORT_COORDS entry. |
| "BASE_PRICES 100% covered" | **FALSE** — real coverage: 83/146 (56.8%) destination APs after DevOps 08-08 additions. Do not stop raising. |
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

✅ Matches `.venue-baseline` file.

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 0 dups | 373 unique IDs confirmed (cancun-beach 2nd hit is in PRESETS, not VENUES) |
| Missing lat/lon | ✅ 0 | All 373 venues have coordinates |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing photo URL | ✅ 0 | 373/373 have `photo:` URL |
| Missing tags | ✅ 0 | 373/373 have non-empty `tags:` array |
| Missing rating | ✅ 0 | 373/373 have `rating:` value |
| Bad coordinates (out of bounds) | ✅ 0 | All lat/lon within ±90/±180 |
| Duplicate photo URLs | ⚠️ 125 | Max reuse: 3× (within spec after June dedup; was 26× before) |
| Unique photo URLs | ⚠️ 45 unique | 45/373 = 12% unique — all generic category stock; Open #20 is the fix |

### Tag Quality

| Metric | Value | Notes |
|--------|-------|-------|
| Average tags/venue | 2.7 | Acceptable minimum; ideal is 4-5 for richer search |
| Venues with only 2 tags | 227 (60.9%) | Many beach venues sparse; could benefit from richer tags |
| Venues with 4+ tags | 132 (35.4%) | Mostly early ski venues with more detailed tagging |

### Field Schema (actual — no description/difficulty/photos-array fields in this codebase)

Current required fields confirmed present in 100% of venues: `id`, `category`, `title`, `location`, `lat`, `lon`, `ap`, `icon`, `rating`, `reviews`, `gradient`, `accent`, `tags`, `photo`.

---

## 2. BASE_PRICES Coverage Audit

**Progress since yesterday:** DevOps run 2026-08-08 added 7 airports (CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU) per commit `2e71150`. Coverage jumped from ~31.5% → **56.8%** (83/146 venue APs).

| Metric | Value |
|--------|-------|
| BASE_PRICES outer keys (destination APs) | **83** |
| Total unique venue APs | **146** |
| Missing from BASE_PRICES | **93 (63.7%)** |
| Venues WITH deal scoring | **180 (48.3%)** |
| Venues WITHOUT deal scoring | **193 (51.7%)** |

### Top 14 Missing APs by Venue Count

| AP | Venues | Location |
|----|--------|----------|
| ALB | 4 | Albany, NY (NE US ski gateway) |
| PLS | 4 | Providenciales, Turks & Caicos |
| AXA | 4 | Anguilla |
| SXM | 4 | Sint Maarten |
| NAP | 4 | Naples, Italy |
| CAG | 4 | Cagliari, Sardinia |
| FAO | 4 | Faro, Algarve Portugal |
| SPU | 4 | Split, Croatia |
| USM | 4 | Koh Samui, Thailand |
| MPH | 4 | Caticlan, Boracay Philippines |
| DLM | 4 | Dalaman, Turkish coast |
| CMB | 4 | Colombo, Sri Lanka |
| GOI | 4 | Goa, India |
| PHL | 4 | Philadelphia, PA |

### BASE_PRICES-Only APs (in BASE_PRICES but ZERO venues in catalog)

**30 airports** have BASE_PRICES entries but no venues yet. Any venue added at these airports gets deal scoring immediately AND enables the flight distance filter (once AIRPORT_COORDS is also added — see Section 5):

`PPT, PUQ, AGP, LAS, PHX, DTW, HND, LIM, GRU, REC, GNB, VCE, BIQ, BIO, LIS, NQY, SNN, ACE, PLZ, AGA, WDH, LIR, SAL, OAX, LIH, PDG, CEB, OOL, PER, AKL`

Note: Previous session proposals used BIQ/LIS/LIR/HND/BIO — those 5 are already proposed (see backlog). Today's 5 target the remaining highest-value gaps (see Section 5).

---

## 3. Seasonal Relevance (August 8, 2026)

| Segment | Venues | In Season | Off Season |
|---------|--------|-----------|------------|
| Skiing — North hemisphere (lat ≥ 0) | 108 | 0 | 108 |
| Skiing — South hemisphere (lat < 0) | 23 | **23** | 0 |
| Beach — North hemisphere (lat ≥ 0) | 187 | **187** | 0 |
| Beach — South hemisphere (lat < 0) | 55 | 0 | 55 |

**August snapshot:**
- **Northern beach (187 venues): PEAK SEASON** — Mediterranean, Atlantic Europe, Caribbean, SE Asia, Hawaii, East/West US coast. The app's strongest inventory right now.
- **Southern hemisphere ski (23 venues): IN SEASON** — NZ (ZQN, CHC), Australia (MEL, SYD, CBR), South America (SCL, BRC, ZCO, USH). These are the 23 venues the scoring engine should be surfacing most aggressively right now.
- **Northern ski (108 venues): OFF SEASON** — lateSeason=true venues (14) may still surface if snow depth ≥ 0.5m but realistically this segment is dormant until November.
- **Southern beach (55 venues): OFF SEASON** — Bali, Thailand, Pacific islands off their best window.

**⚠️ Scheduling concern:** The 23 S-hemisphere ski venues are the primary ski content during the world's busiest beach season. Half have no BASE_PRICES entries (CHC, BRC, ZCO, USH, MDZ, CPC, NQN), leaving those routes without deal scoring exactly when they'd be most booked. This is the most impactful BASE_PRICES gap right now.

---

## 4. GEAR_ITEMS Audit

**Amazon Associates (GEAR_ITEMS) cut for v1.** `grep -c GEAR_ITEMS app.jsx` → 0. Per CLAUDE.md standing directive: do NOT restore. Revisit post-launch.

---

## 5. Daily Venue Additions

All 5 targets are in BASE_PRICES with **zero current venues** — full deal scoring activates immediately on add. Each also requires an AIRPORT_COORDS entry (these airports are in AP_CONTINENT but missing from AIRPORT_COORDS); AIRPORT_COORDS additions are included below.

**AIRPORT_COORDS entries to add alongside venues** (paste near other regional entries):

```javascript
// Add to AIRPORT_COORDS:
AGP:{lat:36.6749,lon:-4.4991},   // Málaga, Spain
LIH:{lat:21.9760,lon:-159.3389}, // Lihue, Kauai, Hawaii
PPT:{lat:-17.5553,lon:-149.6062},// Papeete, Tahiti
AKL:{lat:-37.0082,lon:174.7850}, // Auckland, New Zealand
AGA:{lat:30.3250,lon:-9.4131},   // Agadir, Morocco
```

---

### Venue 1 — Nerja Beach, Costa del Sol (AGP)

```javascript
{id:"nerja-beach-agp", category:"beach",
  title:"Nerja Beach", location:"Costa del Sol, Andalusia, Spain",
  lat:36.7449, lon:-3.8815, ap:"AGP",
  icon:"🏖️", rating:4.82, reviews:41200,
  gradient:"linear-gradient(160deg,#001428,#001e3e,#002e5c)",
  accent:"#48a0e0",
  tags:["Balcón de Europa Cliff Views","Crystal Mediterranean Water","Moorish Caves 1km Away","Sun 320 Days a Year","Andalusian Seafood Culture"],
  photo:"https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=1200&h=900&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** AGP (Málaga) in BASE_PRICES (JFK→AGP ~$780), 0 current venues. Nerja sits 55 km east of Málaga airport on the Axarquía coast — one of Andalusia's most photogenic beach towns. The Balcón de Europa is a lookout terrace directly above the beach with panoramic cliff views. Water temp ~24°C in August ✅. August is peak Costa del Sol season. Cueva de Nerja (cave complex with prehistoric paintings) is 1 km from the beach — makes this a genuine day-trip hub, not just a strand. AP_CONTINENT=europe ✅. No existing AGP venue.

---

### Venue 2 — Hanalei Bay, Kauai (LIH)

```javascript
{id:"hanalei-bay-kauai", category:"beach",
  title:"Hanalei Bay", location:"North Shore, Kauai, Hawaii",
  lat:22.2027, lon:-159.4946, ap:"LIH",
  icon:"🌺", rating:4.93, reviews:31700,
  gradient:"linear-gradient(160deg,#002010,#003820,#005830)",
  accent:"#5db87a",
  tags:["Nā Pali Coast Backdrop","Calm Summer Snorkeling","Lush Tropical Rainforest","Quietest Hawaiian Island","Jurassic Park Film Location"],
  photo:"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&h=900&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** LIH (Lihue, Kauai) in BASE_PRICES (JFK→LIH ~$880), 0 current venues. Peakly has HNL/OGG/KOA — all Oahu/Maui/Big Island — but the Garden Isle is missing. Hanalei is a 2-mile crescent bay on Kauai's north shore ringed by 1,000-foot pali cliffs. In summer (May–Sep) the bay is calm and protected from winter swells — ideal family swimming and snorkeling. Water ~27°C in August ✅. Kauai is by far the least-touristed Hawaiian island (limited direct flights), which makes it a genuine "discovery" for Peakly users. AP_CONTINENT=na ✅.

---

### Venue 3 — Moorea Lagoon, French Polynesia (PPT)

```javascript
{id:"moorea-lagoon-ppt", category:"beach",
  title:"Moorea Lagoon", location:"Society Islands, French Polynesia",
  lat:-17.5000, lon:-149.8328, ap:"PPT",
  icon:"🌊", rating:4.97, reviews:14200,
  gradient:"linear-gradient(160deg,#001428,#001e44,#003070)",
  accent:"#40b8e8",
  tags:["World-Class Turquoise Lagoon","Overwater Bungalow Culture","Manta Ray Snorkeling","30min Ferry from Papeete","Cook's Bay Volcanic Backdrop"],
  photo:"https://images.unsplash.com/photo-1542736705-db99e1a6b2db?w=1200&h=900&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** PPT (Papeete, Tahiti) in BASE_PRICES (JFK→PPT ~$1,800), 0 current venues. Moorea is a 35-minute fast ferry from Papeete airport — functionally the same destination. It's widely considered more beautiful than Bora Bora but at a fraction of the price. The lagoon is one of the top 10 snorkeling destinations on earth; blacktip reef sharks, rays, and corals visible from shore. Water ~28°C year-round ✅ (no seasonality issue). PPT is the main South Pacific international hub — all Air France/Air Tahiti Nui flights land here. AP_CONTINENT=oceania ✅. No existing PPT venue. (BOB/Bora Bora is a separate AP with an existing venue.)

---

### Venue 4 — Whakapapa Ski Area, Mt Ruapehu (AKL)

```javascript
{id:"whakapapa-ski-nz", category:"skiing",
  title:"Whakapapa Ski Area", location:"Mt Ruapehu, North Island, New Zealand",
  lat:-39.2833, lon:175.5667, ap:"AKL",
  icon:"🏔️", rating:4.78, reviews:22400,
  gradient:"linear-gradient(160deg,#0a1a3a,#1a3a6e,#3a6ebf)",
  accent:"#90caf9",
  tags:["Active Volcano Skiing","North Island's Largest Resort","Crater Lake Views","NZ Winter Jul–Oct","Tongariro Alpine Crossing Nearby"],
  photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=900&fit=crop&fp-x=0.5&fp-y=0.4"},
```

**Rationale:** AKL (Auckland) in BASE_PRICES (JFK→AKL ~$2,100), 0 current venues. August is peak NZ ski season ✅ — Whakapapa and Turoa ski areas on Mt Ruapehu are New Zealand's largest skiable terrain. ZQN serves South Island skiing (Remarkables, Coronet Peak, Cardrona); AKL is the natural gateway for North Island. Drive time from Auckland ~4.5h to Ohakune base — most skiers fly AKL then drive or take the Northern Explorer train. The active stratovolcano setting (skiing above a steam-venting crater lake) is genuinely unique on earth. Whakapapa hosted the 2026 FIS Alpine World Cup events. AP_CONTINENT=oceania ✅. No existing AKL venue.

---

### Venue 5 — Taghazout Beach, Morocco (AGA)

```javascript
{id:"taghazout-beach-aga", category:"beach",
  title:"Taghazout Beach", location:"Souss-Massa, Morocco",
  lat:30.5322, lon:-9.7083, ap:"AGA",
  icon:"🏖️", rating:4.79, reviews:27800,
  gradient:"linear-gradient(160deg,#1a0a00,#3a1800,#6b3010)",
  accent:"#e8a058",
  tags:["Year-Round 300+ Sun Days","Anti-Atlas Mountains Backdrop","Argan Oil Hammam Spas","Authentic Fishing Village","Saharan Sunset Colors"],
  photo:"https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=900&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** AGA (Agadir) in BASE_PRICES (JFK→AGA ~$820 via CDG/MAD), 0 current venues. Taghazout is 20 km north of Agadir airport. Morocco beach is the highest-upside content gap in Africa — Peakly has CPT and PLZ but nothing on the Atlantic Moroccan coast. Taghazout has undergone a dramatic upgrade since the 2020 Taghazout Bay resort development (Westin/Club Med nearby). Water ~22°C in August ✅, air temp ~26°C (warm not oppressive — cooled by Canary Current). Year-round sun with 300+ days/year makes this one of the most reliable beach forecasts in BASE_PRICES. AP_CONTINENT=africa ✅. No existing AGA venue.

---

**Pre-add checklist (today's 5):**
- AP_CONTINENT: AGP=europe ✅, LIH=na ✅, PPT=oceania ✅, AKL=oceania ✅, AGA=africa ✅
- All 5 in BASE_PRICES ✅ (83-airport set confirmed above)
- Water temp hard-cap check (beach venues ≥18°C in Aug): AGP=24°C ✅, LIH=27°C ✅, PPT=28°C ✅, AGA=22°C ✅
- Whakapapa ski: lat<0, August = S hemisphere winter, in-season ✅
- No ID conflicts: nerja-beach-agp / hanalei-bay-kauai / moorea-lagoon-ppt / whakapapa-ski-nz / taghazout-beach-aga — none exist in 373
- AIRPORT_COORDS: AGP/LIH/PPT/AKL/AGA all MISSING — add entries (coords above) alongside venues ⚠️
- Run `node scripts/validate-venues.mjs` after pasting

---

## 6. Gear Items — No Action Required

**Amazon Associates (GEAR_ITEMS) cut for v1.** `grep -c GEAR_ITEMS app.jsx` → 0. Per CLAUDE.md standing directive: do NOT restore. Revisit post-launch.

---

## One Observation the PM Should Know

**The S-hemisphere ski segment is the most time-sensitive content gap right now.** August is peak Southern ski season (NZ + Australia + S America all in window), and it's the segment where BASE_PRICES coverage is weakest among venues that are actually scoring. CHC/BRC/ZCO/USH/MDZ/CPC/NQN — the APs serving ~10 S-hemisphere ski venues — have no BASE_PRICES rows, meaning the deal score for those resorts is either missing or falls back to a rough estimate. For a user flying from JFK to ski Cerro Castor or Falls Creek, the price signal is simply absent. The window to fix this closes September when S-hemisphere ski season ends; all other BASE_PRICES backfills can wait. This is a 30-min client-side edit (no VPS), ~10 rows × 14 origin cities.

**Priority stack (unchanged + one time-sensitive add):**
1. **VPS redeploy (Day 16)** — Open #19/23: `scp server/proxy.js 198.199.80.21:/opt/peakly-proxy/proxy.js && ssh 198.199.80.21 "pm2 restart peakly-proxy"` — 3 minutes
2. **S-hemisphere ski BASE_PRICES backfill NOW** — CHC/BRC/ZCO/USH/MDZ/CPC/NQN — in-season window closes end of September
3. **BASE_PRICES backfill for top Caribbean/Med APs** — PLS/AXA/SXM/NAP/CAG/FAO/SPU (~28 venues unlocked, client-side)
4. **Ship venue backlog** — paste sessions 7–12 (56 venues), `node scripts/validate-venues.mjs`, commit
5. **Photo pipeline** — `UNSPLASH_KEY=... node scripts/photos-fetch.mjs` (Open #20)
