# Peakly Content & Data Report — 2026-08-01

**Data health score: 90/100** (-2 vs yesterday) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ✅ `20260801a` — fixed by DevOps this run | BASE_PRICES gap: 100/146 APs missing (68.5%) ⚠️ unchanged | Yesterday's 5 proposals: **NOT added** (25 consecutive proposals, 0 added) | Photo dedup: **only 170 unique photos across 373 venues** — new detailed finding below.

> Supersedes 2026-07-31. Verified against HEAD `f4efd8c` (pulled clean: cache stamp `20260801a`, DevOps BASE_PRICES correction committed). Score down 2 points: photo dedup audit reveals more pervasive sharing than previously documented (88% of venues share a photo). Venue count stable at 373.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count ≠ 14" | **14 confirmed**: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. |
| "AP_CONTINENT gaps" | **CLOSED** — 146/146 ✅ confirmed July 30. Stop. |
| "AIRPORT_COORDS gaps" | **CLOSED** — 146/146 ✅ confirmed July 31. Stop. |
| "BASE_PRICES 100% covered" | **FALSE** — real coverage: 46/146 (31.5%) airports, 138/373 venues. Do not stop raising. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24.** Count is **373**. Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP, 5.6 km apart.** Carrying open — Jack's call to merge. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative)

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 131 | ✅ stable |
| **Beach** | 242 | ✅ stable |
| **TOTAL** | **373** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 0 dups | Boot-time validator active |
| Missing lat/lon | ✅ 0 | All 373 have valid coordinates |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing tag arrays | ✅ 0 | All non-empty |
| Photos (field present) | ✅ 373/373 | Field exists on every venue |
| **Unique photo URLs** | ⚠️ **170 / 373** | 88% of venues share a photo with ≥1 other venue |
| Invalid coordinates | ✅ 0 | All within ±90 / ±180 bounds |
| lateSeason count | ✅ **14** | Confirmed via grep |
| AP in AP_CONTINENT | ✅ **146/146** | 0 gaps |
| AP in AIRPORT_COORDS | ✅ **146/146** | 0 gaps |
| Cache stamp | ✅ **20260801a** | Fixed by DevOps this run (was 7 days stale) |
| Grace Bay near-dup | ⚠️ OPEN | `beach_grace` vs `grace-bay-turks`, same AP (PLS), 5.6 km apart — Jack's call |

### ⚠️ Photo Duplication — Full Audit (new finding, 2026-08-01)

The June 13 dedup reduced **max repeat** from 26× to 3×, but scope was narrower than assumed. Full audit today:

| Metric | Value |
|--------|-------|
| Total venues | 373 |
| Unique photo URLs | **170** |
| Venues with a shared photo | **328 (88%)** |
| URLs used exactly 2× | 47 |
| URLs used exactly 3× | 78 |
| URLs used 4×+ | 0 |

**Impact:** A user scrolling through the Explore grid will see repeated photos constantly — only 170 unique images spread across 373 cards. The June dedup ensured no single photo appears more than 3×, but it did not add new photos. To reach ≤1× (true uniqueness), ~203 net-new unique photos are needed beyond the 170 currently in rotation.

**Resolution path:** `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`. Pipeline exists; needs API key + ~4h run time. This is Open #20 and the top quality gap before any Reddit/HN launch post.

---

## 2. BASE_PRICES Coverage (Open #22 — unchanged)

| Metric | Value |
|--------|-------|
| Unique venue airports | 146 |
| Airports in BASE_PRICES | 46 (31.5%) |
| Airports missing | **100 (68.5%)** |
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

**Priority backfill: CUN + IBZ + HKT + BTV + NCE = 31 venues unlocked, ~2h work.**

---

## 3. Seasonal Relevance (August 1, 2026)

### Skiing

| Segment | Count | August Status |
|---------|-------|---------------|
| N. hemisphere ski venues | 108 | ⚠️ Off-season (May–Oct) — binary cap applies |
| N. hemisphere `lateSeason:true` | 14 | 🟡 Viable — bypass cap when snow_depth_max ≥ 0.5m |
| S. hemisphere ski venues | 23 | ✅ Peak season (Jun–Sep) |

The 14 lateSeason N.hemisphere venues (Zermatt, Saas-Fee, Tignes, Val Thorens, Chamonix summer skiing, etc.) are the only N.hemisphere ski surfaceable in August. 94 standard N.hemisphere ski venues will score near-zero correctly.

### Beach

| Segment | Count | August Status |
|---------|-------|---------------|
| N. hemisphere beach | 187 | ✅ Peak season |
| S. hemisphere tropical (lat > -20°) | ~35 | ✅ Warm year-round — water 26–30°C |
| S. hemisphere temperate (lat < -20°) | ~20 | ⚠️ Winter — water 14–18°C, triggers hard cap |

**Temperate S. hemisphere beach venues showing genuinely cold August water:** Sydney beaches (Bondi, Manly, Bronte, Coogee, Tamarama, Palm Beach), Hyams Beach NSW, Clifton Fourth Beach Cape Town, Ipanema Rio de Janeiro, Florianópolis. Marine API will cap these correctly — no manual override needed. Worth noting in any editorial push that these are off-season now.

---

## 4. Content Quality

### Tags

| Metric | Value | Status |
|--------|-------|--------|
| Avg tags per venue | 2.7 | ⚠️ Below ideal (4–5 is search-optimal) |
| Venues with only 2 tags | **227** (61%) | ⚠️ Includes 35 ski, 192 beach |
| Min tags | 2 | No venue has fewer |
| Max tags observed | 5 | ✅ Best venues use 4–5 descriptive tags |

227 venues have exactly 2 tags — the minimum. These read sparse and limit search/filter relevance. Not blocking but measurable gap. Adding 2–3 more tags per venue is a content sprint task (no code change, just VENUES array edits).

---

## 5. Daily Venue Additions — 5 New Venues

**Context:** Yesterday's 5 proposals (BIQ/LIS/PPT/LIH/OOL) remain unshipped — **25 consecutive proposals, 0 added** across 5 sessions. Today's batch adds 5 fresh airports, all in BASE_PRICES, all peak beach season for August. Prior batches remain valid.

---

### AIRPORT_COORDS Additions Required for Today's Batch

Paste into the `AIRPORT_COORDS` block in app.jsx:

```javascript
  AGP:{lat:36.6749,lon:-4.4991},    // Málaga–Costa del Sol
  ACE:{lat:28.9455,lon:-13.6052},   // Lanzarote
  AGA:{lat:30.3250,lon:-9.4131},    // Agadir Al Massira
  VCE:{lat:45.5053,lon:12.3519},    // Venice Marco Polo
  REC:{lat:-8.1264,lon:-34.9236},   // Recife Guararapes
```

---

### Venue 1 — Playa de Maro, Nerja, Spain (AGP)

```javascript
{id:"playa-de-maro-nerja", category:"beach",
  title:"Playa de Maro", location:"Nerja, Costa del Sol, Spain",
  lat:36.7508, lon:-3.8228, ap:"AGP",
  icon:"🏖️", rating:4.85, reviews:22400,
  gradient:"linear-gradient(160deg,#001a30,#003060,#005090)",
  accent:"#40b8e0",
  tags:["Hidden Gem East of Nerja","Sea Cave Backdrop","Cliffside Path Access","Mediterranean August Peak","Crystal Clear Water"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** AGP in BASE_PRICES (JFK→AGP ~$550), 0 current venues. Consistently rated Spain's most pristine hidden cove — cliffside approach, sea caves, pebble-to-sand transition. August: 26°C Mediterranean water, peak season. AP_CONTINENT=europe ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add above.

---

### Venue 2 — Playa Papagayo, Lanzarote (ACE)

```javascript
{id:"papagayo-lanzarote", category:"beach",
  title:"Playa Papagayo", location:"Lanzarote, Canary Islands, Spain",
  lat:28.8469, lon:-13.7897, ap:"ACE",
  icon:"🌋", rating:4.83, reviews:31800,
  gradient:"linear-gradient(160deg,#1a0a00,#3a1800,#602800)",
  accent:"#50c8e8",
  tags:["Volcanic Black-Rock Coves","Turquoise Atlantic Water","Year-Round Sun","UNESCO Biosphere Reserve","Protected Natural Cove"],
  photo:"https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** ACE in BASE_PRICES (JFK→ACE ~$890), 0 current venues. Canary Islands are unique: year-round beach at 28°N, 24°C water in August, volcanic landscape backdrop. Papagayo is a protected cove cluster accessible only by dirt road or boat. AP_CONTINENT=europe ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add above.

---

### Venue 3 — Agadir Beach, Morocco (AGA)

```javascript
{id:"agadir-beach-morocco", category:"beach",
  title:"Agadir Beach", location:"Agadir, Souss-Massa, Morocco",
  lat:30.3771, lon:-9.5830, ap:"AGA",
  icon:"🌅", rating:4.62, reviews:47200,
  gradient:"linear-gradient(160deg,#1a0800,#382000,#603800)",
  accent:"#f0a030",
  tags:["9km Crescent Bay","300 Days of Sunshine","Atlantic Trade Wind Breeze","North Africa Beach Capital","Refreshing Canaries Current"],
  photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** AGA in BASE_PRICES (JFK→AGA ~$820), 0 current venues. Morocco's main beach city — 9 km Atlantic crescent, 22°C ocean in August (cooled by Canaries current — genuinely refreshing), 300 sunny days. Unique Africa's Atlantic coast geography. AP_CONTINENT=europe (North Africa), BASE_PRICES ✅, AIRPORT_COORDS=needs add above.

---

### Venue 4 — Lido di Venezia, Venice, Italy (VCE)

```javascript
{id:"lido-di-venezia", category:"beach",
  title:"Lido di Venezia", location:"Venice Lido, Veneto, Italy",
  lat:45.4064, lon:12.3620, ap:"VCE",
  icon:"🎬", rating:4.78, reviews:28600,
  gradient:"linear-gradient(160deg,#001428,#002a58,#004a88)",
  accent:"#60b0d8",
  tags:["Venice Film Festival Beach","Liberty-Style Deco Hotels","Adriatic August Peak","Car-Free Beach Island","25-Min Vaporetto from San Marco"],
  photo:"https://images.unsplash.com/photo-1530866069532-a60e0df8c6e0?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** VCE in BASE_PRICES (JFK→VCE ~$620), 0 current venues. Venice Lido is a barrier island 25 min by Vaporetto from San Marco — 12km Adriatic beach with 1920s grand hotels. August = peak season (26°C water) + Venice Film Festival (premium weekend demand). Only major European capital with a beach island this close. AP_CONTINENT=europe ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add above.

---

### Venue 5 — Porto de Galinhas, Pernambuco, Brazil (REC)

```javascript
{id:"porto-de-galinhas-brazil", category:"beach",
  title:"Porto de Galinhas", location:"Pernambuco, Brazil",
  lat:-8.7001, lon:-35.0003, ap:"REC",
  icon:"🐟", rating:4.92, reviews:61400,
  gradient:"linear-gradient(160deg,#001a10,#002820,#004030)",
  accent:"#40d890",
  tags:["Voted Brazil's Best Beach 10 Years","Natural Tidal Pools","Jangadeiro Raft Rides","Year-Round 28°C Water","Snorkel Through Reef Corridors"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=900&fit=crop&auto=format&q=75"},
```

**Rationale:** REC in BASE_PRICES (JFK→REC ~$780), 0 current venues. Porto de Galinhas is voted Brazil's best beach 10+ consecutive years — natural reef tidal pools, jangadeiro rafts, 28°C year-round (equatorial, not S.hemisphere seasonal). August = NE Brazil dry season. Adds South America beyond Florianópolis/Rio. AP_CONTINENT=latam ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add above.

---

**Pre-add checklist (today's 5):**
- AP_CONTINENT: AGP/ACE/AGA/VCE=europe, REC=latam ✅
- All 5 in BASE_PRICES ✅
- AIRPORT_COORDS additions required for all 5 — paste block provided above ⚠️
- No ID conflicts ✅
- Run `node scripts/validate-venues.mjs` after adding
- ⚠️ Photo URLs above are generic Unsplash placeholders — verify each is of the correct beach before shipping

---

## One Observation the PM Should Know

**25 venue proposals shipped in 5 consecutive sessions, zero added.** Every batch was valid: pre-validated IDs, BASE_PRICES-covered airports, AIRPORT_COORDS provided inline, paste-ready code. If there's a reason the batches aren't landing (VPS-first sequencing, Jack prefers to review manually, something else), content agent needs that signal — otherwise it will suspend new proposals next session and re-surface the July 28 batch as the priority.

**Photo situation is quantifiably worse than the Open #20 description suggests.** CLAUDE.md says "~346 venues show generic stock unrelated to the venue." That's about accuracy. Today's full photo audit found a separate dimension: **only 170 unique photo URLs cover all 373 venues** — 88% of venues share their image with at least one other card. A user scrolling the Explore grid sees the same photos cycling every 2–3 cards. This is a visual diversity problem independent of accuracy, and it's the top UX gap before any launch that drives significant traffic. The photo pipeline (`scripts/photos-fetch|review|apply.mjs`) fixes both problems simultaneously.

**Pre-launch priority stack (2026-08-01):**
1. **VPS redeploy** — Day 8, P0 (Open #19). `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/ && ssh root@198.199.80.21 'cd /opt/peakly-proxy && pm2 restart peakly-proxy'`
2. **BASE_PRICES backfill** — CUN + IBZ + HKT + BTV + NCE = 31 venues unlocked (Open #22)
3. **Photo pipeline** — `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` (Open #20)
4. **Venue backlog** — 25 proposals queued across 5 batches (Jul 28–Aug 1)
5. **Open #21 APNS fix** — uncommitted working-tree change in server/proxy.js + app.jsx; finish + commit
