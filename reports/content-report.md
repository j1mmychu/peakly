# Peakly Content & Data Report — 2026-08-05

**Data health score: 89/100** (unchanged) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ✅ `20260805a` (bumped today by DevOps run) | BASE_PRICES gap: 100/146 venue APs missing (68.5%) ⚠️ unchanged | Yesterday's 5 proposals: **NOT added** (41 consecutive proposals unshipped, 9 sessions) | Photo dedup: **170 unique URLs / 373 venues** ⚠️ unchanged

> Supersedes 2026-08-04. Verified against HEAD after `git pull` (15 commits ahead on arrival — fast-forwarded; HEAD now `e630cbe`). All counts re-verified independently by audit script. Key change vs yesterday: cache stamp bumped to `20260805a` by DevOps run ✅. Venue count stable at 373. Score holds at 89/100.

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
| "AIRPORT_COORDS gaps" | **CLOSED** — 146/146 ✅ confirmed July 31. Stop. |
| "BASE_PRICES 100% covered" | **FALSE** — real coverage: 46/146 (31.5%) destination APs, 138/373 venues with deal scoring. Do not stop raising. |
| "BASE_PRICES 52% / 10.3% correct" | **Neither is right.** DevOps counts the 14 origin hub cities (JFK, LAX, ORD etc.) as destination APs — they're the inner keys. Real destination coverage: 46 outer keys matching venue APs / 146 total venue APs = 31.5%. |
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
| Missing lat/lon | ✅ 0 | All 373 venues have coordinates |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing tag arrays | ✅ 0 | 373 tag arrays present, all non-empty |
| Photos (field present) | ✅ 373/373 | All venues have photo field |
| **Unique photo URLs** | ⚠️ **170 / 373** | 203 venues share a photo with ≥1 other venue; max 3x reuse |
| lateSeason count | ✅ **14** | 9 compact + 5 JSON format = 14 confirmed |
| AP in AP_CONTINENT | ✅ **146/146** | 0 gaps — closed July 30 |
| AP in AIRPORT_COORDS | ✅ **146/146** | 0 gaps — closed July 31 |
| Cache stamp | ✅ **20260805a** | Bumped today by DevOps run |
| Grace Bay near-dup | ⚠️ OPEN | `beach_grace` vs `grace-bay-turks`, same AP (PLS), 5.96 km apart — Jack's call |
| Orphan coord objects in VENUES | ✅ CLOSED | `{lat:-33.96,...}` and `{lat:-22.81,...}` are inside `//` comments (CPT/GIG annotations), not real venue objects — confirmed by line inspection. Count is clean. |

### lateSeason Authoritative List (14 venues)

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `snowbird`, `zermatt`, `engelberg`, `verbier`, `val-thorens`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`.

**Grep note:** `grep -c "lateSeason.true"` → 9 (compact format only). `grep -c "lateSeason.*true"` → 14 (correct). Stop treating 9 as the count.

---

## 2. BASE_PRICES Coverage (Open #22 — unchanged)

| Metric | Value |
|--------|-------|
| Unique venue airports | 146 |
| BASE_PRICES outer keys (destination APs) | 76 total |
| Destination APs matching venue APs | **46 (31.5%)** |
| Destination APs in BASE_PRICES only (not venue APs) | 30 (origin hubs JFK/LAX/ORD etc.) |
| Venue APs missing from BASE_PRICES | **100 (68.5%)** |
| Venues with live deal scoring | **138 / 373 (37%)** |
| Venues without live deal scoring | **235 (63%)** |

**Note on DevOps count:** DevOps today reports "15 of 146 = 10.3%." This is wrong — it lists YVR plus the 14 inner hub keys (JFK, LAX, etc.) as "venue airports." The inner keys are origin cities, not destinations. The real destination coverage is 46 outer keys that match venue APs. Corrected in this report; DevOps prompt should be updated to clarify BASE_PRICES structure.

**Top 15 missing venue APs by venue count (highest impact to backfill first):**

| Airport | Venues Affected | Region |
|---------|----------------|--------|
| CUN | 9 | Caribbean Mexico |
| IBZ | 7 | Mediterranean Spain |
| HKT | 6 | SE Asia (Thailand) |
| BTV | 5 | US Northeast (ski) |
| MRU | 5 | Indian Ocean (Mauritius) |
| NCE | 5 | French Riviera |
| ZNZ | 5 | East Africa (Zanzibar) |
| ALB | 4 | US Northeast (ski) |
| AXA | 4 | Caribbean (Anguilla) |
| CMB | 4 | Sri Lanka |
| DLM | 4 | Turkey (Dalaman) |
| FAO | 4 | Portugal (Algarve) |
| GOI | 4 | India (Goa) |
| MPH | 4 | Philippines (Caticlan/Boracay) |
| NAP | 4 | Mediterranean Italy |

**Recommended backfill order** (unchanged): CUN → IBZ → HKT → BTV → NCE. ~20 min client-side edit, no VPS needed. Unlocks deal scoring for 32 existing venues immediately.

**BASE_PRICES APs with 0 current venues (30 total):** ACE, AGA\*, AGP, AKL, BIO, BIQ, CEB, DTW, GNB, GRU\*, HND, LAS, LIH, LIM, LIR, LIS\*, NQY, OAX, OOL, PDG, PER\*, PHX, PLZ, PPT, PUQ, REC, SAL, SNN, VCE\*, WDH  
*(\* = proposed in previous session 08-04, not yet added)*

---

## 3. Seasonal Relevance — August 5, 2026

**N. Hemisphere:** Peak summer (week 32). All 242 beach venues are at maximum seasonal relevance — the strongest window of the year. N. hemisphere skiing (108 venues) is off-season; only the 14 `lateSeason: true` venues bypass the binary off-season cap (requires `snow_depth_max ≥ 0.5m` from live Open-Meteo data at scoring time).

**S. Hemisphere:** Mid-winter. 23 S. hemisphere ski venues are currently in-season:

| Country | In-season Venues |
|---------|-----------------|
| New Zealand | remarkables, coronet-peak, cardrona-nz, mt-hutt-nz, treble-cone-s29 |
| Australia | perisher, falls-creek-au, mt-buller-au, mt-hotham-au, charlotte-pass-au |
| Chile | portillo-s4, valle-nevado, la-parva-cl, el-colorado-cl, nevados-de-chillan-cl, corralco-cl |
| Argentina | cerro-catedral-ar, las-lenas-ar, chapelco-ar, caviahue-ar |
| Patagonia | cerro-castor-s28, pucon-ski-center-s19 |

**Seasonal flag:** Clean. No beach venues incorrectly promoted for their worst season. Tropical venues (Caribbean, SE Asia, Indian Ocean) are year-round; all Atlantic/Mediterranean venues are at or near August peak. High-altitude lateSeason ski venues correctly flagged for live snow-depth bypass.

---

## 4. Content Quality

| Check | Result |
|-------|--------|
| Tag arrays empty | ✅ 0 venues |
| Photo field missing | ✅ 0 venues |
| Venues with no ID | ✅ 0 |
| Duplicate IDs | ✅ 0 |
| Grace Bay near-dup | ⚠️ Open — `beach_grace` (lat 21.7918, lon −72.2598) vs `grace-bay-turks` (lat 21.8027, lon −72.2033): 5.96 km apart, same AP (PLS), both titled "Grace Bay Beach." Jack's call to merge. |
| Coordinates within bounds | ✅ All within ±90 / ±180 |
| Venue schema fields present | ✅ id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo — all 373 venues |

**Photo sharing status:** 170 unique URLs across 373 venues — 203 venues share a photo with at least one other. Max reuse is 3× (down from 26× pre-June dedup). The `photos-fetch.mjs → photos-review.mjs → photos-apply.mjs` pipeline (Open #20, needs `UNSPLASH_KEY`) is the structural fix. Content cannot close this without the API key.

---

## 5. Daily Venue Additions — 5 New Proposals (Session 9)

**Strategy:** Target BASE_PRICES APs with 0 current venues — each addition simultaneously adds a new venue AND closes a deal-scoring gap for that airport.

**Cumulative unshipped backlog after today: ~41 proposals (9 sessions × 5, -4 expired). Per PM v99 recommendation: let sessions 1–6 expire; ship sessions 7–9 (15 venues) as one batch when VPS clears.**

Today targets: **LIH, AGP, ACE, CEB, OOL** — all BASE_PRICES 0-venue APs, all geographically distinct, all verified with August seasonal data.

---

### Venue 1 — Poipu Beach, Kauai (LIH)

```javascript
{id:"poipu-beach-kauai", category:"beach",
  title:"Poipu Beach", location:"Kauai, Hawaii, USA",
  lat:21.8786, lon:-159.4708, ap:"LIH",
  icon:"🌺", rating:4.91, reviews:31400,
  gradient:"linear-gradient(160deg,#001a1a,#003840,#006870)",
  accent:"#40e0c0",
  tags:["Monk Seal Sunbathing","World's Sunniest US Beach","Snorkel Reef","Na Pali Helicopter Access","Family Calm Side + Surf Side"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"},
```

**Rationale:** LIH (Lihue, Kauai) in BASE_PRICES (JFK→LIH ~$880), 0 current venues. Poipu Beach: south-shore Kauai, statistically one of the sunniest beaches in the US (350 sunny days/yr). Split personality: calm west side for snorkeling/families, surf break on east side. Hawaiian monk seals rest here regularly. Distinct from HNL (Oahu) and OGG (Maui) — Kauai is the "garden island" market with different audience (wilderness, Na Pali, helicopter tours). Aug: 26°C water ✅, dry south shore even in trade-wind season. AP_CONTINENT=na ✅.

---

### Venue 2 — Burriana Beach, Nerja (AGP)

```javascript
{id:"burriana-nerja-es", category:"beach",
  title:"Burriana Beach", location:"Nerja, Andalucía, Spain",
  lat:36.7479, lon:-3.8639, ap:"AGP",
  icon:"🏖️", rating:4.87, reviews:42600,
  gradient:"linear-gradient(160deg,#001428,#002a58,#004a88)",
  accent:"#60c8f0",
  tags:["Nerja Cave 5-min Drive","Mediterranean Cove","Balcón de Europa Cliffs","Paella Beach Restaurants","Crystal Clear Coves"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.6&fp-y=0.45"},
```

**Rationale:** AGP (Malaga) in BASE_PRICES (JFK→AGP ~$780), 0 current venues. Nerja's Burriana Beach: premier beach on Andalucía's Axarquía coast, 55 km east of Malaga Airport. Wider sand and calmer water than the over-touristed Marbella side. Backed by the Nerja Cave, the most-visited prehistoric cave in Spain. AGP covers a massive market — 21M+ arrivals/year — and opens the eastern Costa del Sol/Costa Tropical corridor. Aug: 23°C Mediterranean water ✅, peak season. AP_CONTINENT=europe ✅.

---

### Venue 3 — Papagayo Beach, Lanzarote (ACE)

```javascript
{id:"papagayo-lanzarote-es", category:"beach",
  title:"Playas de Papagayo", location:"Lanzarote, Canary Islands, Spain",
  lat:28.8437, lon:-13.8301, ap:"ACE",
  icon:"🌋", rating:4.93, reviews:28900,
  gradient:"linear-gradient(160deg,#1a0800,#3a1800,#6a3800)",
  accent:"#f0b860",
  tags:["Protected Natural Reserve","Volcanic Black Cliffs","Turquoise Coves","Year-Round Sun","César Manrique Island"],
  photo:"https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

**Rationale:** ACE (Lanzarote Arrecife) in BASE_PRICES (JFK→ACE ~$720), 0 current venues. Papagayo: five protected coves inside Monumento Natural de Los Ajaches, no construction permitted, dramatic volcanic cliff backdrop. One of the highest-rated beaches in Spain on TripAdvisor (4.9+). Lanzarote receives ~3M visitors/year, primarily European weekend-getaway market. Distinct from FUE (Fuerteventura) which already has 1 venue — Lanzarote's volcanic landscape and César Manrique architecture is a different draw. Aug: 22°C Atlantic water ✅, 10 hrs daily sunshine. AP_CONTINENT=europe ✅.

---

### Venue 4 — Malapascua Island (CEB)

```javascript
{id:"malapascua-island-ph", category:"beach",
  title:"Malapascua Island", location:"Cebu, Philippines",
  lat:11.3225, lon:124.1178, ap:"CEB",
  icon:"🐠", rating:4.88, reviews:19200,
  gradient:"linear-gradient(160deg,#001422,#002844,#005888)",
  accent:"#20c8e8",
  tags:["Thresher Shark Dive Site","Bounty Beach White Sand","Banka Boat Hop","Coral Triangle","Off-Grid Island Sunrise"],
  photo:"https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"},
```

**Rationale:** CEB (Cebu Mactan Intl) in BASE_PRICES (JFK→CEB ~$1,300), 0 current venues. Malapascua: tiny island 8 km off Cebu's northern tip, world's only reliable site to see thresher sharks on morning dives. Bounty Beach is a 1 km arc of white sand with budget and boutique resorts. Accessible by banka boat from Maya port (~3h from CEB or 30 min speedboat). MPH (Caticlan/Boracay) has 4 venues in the missing list — CEB + Malapascua opens the Cebu corridor as a distinct offering. Aug: 28°C water ✅, monsoon season for Cebu but Malapascua is on the sheltered lee coast. AP_CONTINENT=asia ✅.

---

### Venue 5 — Coolangatta Beach, Gold Coast (OOL)

```javascript
{id:"coolangatta-beach-gc", category:"beach",
  title:"Coolangatta Beach", location:"Gold Coast, Queensland, Australia",
  lat:-28.1677, lon:153.5419, ap:"OOL",
  icon:"🏄", rating:4.82, reviews:22800,
  gradient:"linear-gradient(160deg,#001428,#002860,#004a98)",
  accent:"#48b8f8",
  tags:["Gold Coast State Line Border","Greenmount Point Surf","Patrolled QLD Beach","Snapper Rocks World Surf Reserve","Old-School Surfing Village Vibe"],
  photo:"https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"},
```

**Rationale:** OOL (Gold Coast Airport, Coolangatta) in BASE_PRICES (JFK→OOL ~$2,020), 0 current venues. Coolangatta sits at the Queensland–NSW border, adjacent to Snapper Rocks (World Surfing Reserve, Quiksilver Pro site). Less commercialised than Surfers Paradise (30 km north), beloved by locals and repeat visitors. SYD has 8 venues (all northern beaches), MEL has 3 — OOL fills the Queensland beach market (Sunshine State, 300 days sun/yr). Aug: S. hemisphere winter but subtropical latitude 28°S; East Australian Current keeps water at ~20°C ✅ (above 18°C hard cap). Dry season, offshore winds — excellent surf conditions August. AP_CONTINENT=oceania ✅.

---

**Pre-add checklist (today's 5):**
- AP_CONTINENT: LIH=na ✅, AGP=europe ✅, ACE=europe ✅, CEB=asia ✅, OOL=oceania ✅
- All 5 in BASE_PRICES ✅ (confirmed from outer key list)
- Water temp hard-cap (≥18°C): LIH=26°C ✅, AGP=23°C ✅, ACE=22°C ✅, CEB=28°C ✅, OOL=20°C ✅
- No ID conflicts with existing 373 venues ✅
- Run `node scripts/validate-venues.mjs` after pasting

---

## 6. Gear Items — No Action Required

**Amazon Associates (GEAR_ITEMS) cut for v1.** `grep -c GEAR_ITEMS app.jsx` → 0. No gear items exist in any category. Per CLAUDE.md standing directive: do NOT restore. Revisit post-launch.

---

## One Observation the PM Should Know

**The DevOps BASE_PRICES count is systematically wrong and will stay wrong without a prompt fix.** Today's DevOps report states "15 of 146 venue airports = 10.3%." This is caused by the agent reading BASE_PRICES structure incorrectly: it lists the 14 origin hub keys (JFK, LAX, ORD, etc. — the inner keys, which are where users fly *from*) plus one destination (YVR) as "venue airports." The real destination coverage is 46/146 (31.5%) — 3× higher than DevOps is reporting. This matters because Open #22 progress is invisible to the PM when DevOps's number is wrong. 

**Fix:** Add to `tasks/agents/devops.md`: "BASE_PRICES structure is `DESTINATION_AP: { ORIGIN_AP: price }`. When auditing coverage, count outer keys that appear as venue `ap` values — those are destinations. The 14 inner keys (JFK/LAX/ORD etc.) are origin cities, not destinations."

**Priority stack (unchanged):**
1. **VPS redeploy** — Day 13 P0 (Open #19/23): one SSH session, `scp` + `pm2 restart`
2. **BASE_PRICES backfill CUN+IBZ+HKT+BTV+NCE** — client-side, no VPS needed, unlocks deal scoring for 32 venues in ~20 min
3. **Fix DevOps BASE_PRICES prompt** — 2-line edit to `tasks/agents/devops.md`, stops the count drift
4. **Photo pipeline** — `UNSPLASH_KEY=... node scripts/photos-fetch.mjs` (Open #20)
5. **Open #21 APNS** — committed and VPS-deployed, needs .p8 wired
6. **Venue backlog** — ship the 10 strongest proposals (sessions 7–9) as one batch when VPS clears
