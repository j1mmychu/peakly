# Peakly Content & Data Report — 2026-07-31

**Data health score: 92/100** (+1 vs yesterday) | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Cache stamp: ⚠️ `20260725d` — **6 days stale** | BASE_PRICES gap: 100/146 APs missing (68.5%) ⚠️ | Today's DevOps commit (84ed91b) landed 2 code fixes: LIH added to AIRPORT_COORDS, cancun-beach cross-cat photo resolved. One DevOps finding (BASE_PRICES) incorrectly marked closed — corrected below.

> Supersedes 2026-07-30. Verified against current HEAD `84ed91b` (fetched clean). Venue count stable at 373. Venue backlog now **20 proposals across 4 consecutive sessions — zero added**. 5 new proposals below target 5 fresh BASE_PRICES-covered airports with 0 current venues.

---

## ⚠️ DevOps Error Correction (BASE_PRICES)

Today's DevOps commit (84ed91b) claims: *"node eval confirms 146/146 venue APs = 100% BASE_PRICES coverage."* **This is wrong — it confused AIRPORT_COORDS coverage with BASE_PRICES coverage.**

| Metric | AIRPORT_COORDS | AP_CONTINENT | BASE_PRICES |
|---|---|---|---|
| Venue APs covered | **146/146 ✅** (100%) | **146/146 ✅** (100%) | **46/146 ⚠️** (31.5%) |

AIRPORT_COORDS and AP_CONTINENT are both fully covered — those are data routing fields. BASE_PRICES is the deal-scoring table. It has only 76 destination rows covering 46 of the 146 unique venue airports. The remaining 100 airports (235 venues = 63% of catalog) show `~$X` estimated prices only. This finding was never resolved and should not be marked closed.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count ≠ 14" | **14 confirmed**: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Use `grep lateSeason app.jsx`. |
| "AP_CONTINENT gaps" | **CLOSED** — 146/146 ✅ confirmed July 30. Stop. |
| "AIRPORT_COORDS gaps" | **CLOSED** — 146/146 ✅ confirmed today (LIH fix in 84ed91b). Stop. |
| "cancun-beach cross-cat photo" | **FIXED in 84ed91b** — cancun-beach now has correct beach photo. Stop. |
| "BASE_PRICES 100% covered" | **FALSE** — DevOps July 31 error. Real coverage: 46/146 (31.5%) airports, 138/373 venues. Do not stop raising. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24.** Count is **373**. Stop. |

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
| Unique IDs | ✅ 373 | `cancun-beach` appears twice — second occurrence is in PRESETS, not VENUES. Not a real dup. |
| Missing lat/lon | ✅ 0 | All present |
| Missing airport codes (`ap`) | ✅ 0 | 373/373 have `ap:` field |
| Missing tag arrays | ✅ 0 | All non-empty |
| Photos (field present) | ✅ 373/373 | All have photo field |
| Duplicate IDs (in VENUES) | ✅ 0 | Boot-time validator active |
| lateSeason count | ✅ **14** | Confirmed by `grep lateSeason app.jsx` |
| AP in AP_CONTINENT | ✅ **146/146** | 0 gaps — closed July 30 |
| AP in AIRPORT_COORDS | ✅ **146/146** | 0 gaps — LIH fixed today in 84ed91b |
| Cache stamp | ⚠️ **20260725d** | 6 days stale — auto-push not bumping |

### ⚠️ Grace Bay Near-Dup (open — Jack's call)

Two venues for the same named beach, same `ap:"PLS"`, 5.6km apart along a continuous 12-mile strip:

| ID | Title | Lat | Lon |
|---|---|---|---|
| `beach_grace` | Grace Bay | 21.7918 | -72.2598 |
| `grace-bay-turks` | Grace Bay Beach | 21.8027 | -72.2033 |

No crash risk (IDs unique). Users see two nearly identical cards. Options: (a) keep both, add stronger tag differentiation (west end vs east end); (b) merge to one authoritative entry. Carrying forward until Jack decides.

---

## 2. Gear Items Audit

Not applicable. `grep -c GEAR_ITEMS app.jsx` → **0**. Amazon cut for v1. Stop raising permanently.

---

## 3. Seasonal Relevance (2026-07-31)

| Segment | Count | Season Status | Notes |
|---|---|---|---|
| Northern beach (lat ≥ 0) | 187 | ✅ **PEAK SEASON** | Late July = peak northern summer. |
| Southern ski (lat < 0) | 23 | ✅ **IN SEASON** | July = Southern hemisphere peak ski. ZQN/SCL/MEL/SYD/ZCO/BRC/MDZ/NQN/CPC/USH/CHC/CBR. |
| Southern beach (lat < 0) | 55 | ⚠️ Off-peak | S-hemi winter. Tropical venues (PQC, HKT, DPS) stay warm >26°C. |
| Northern ski (lat ≥ 0) | 108 | ❌ Off-season | 14 `lateSeason:true` venues viable (Tignes, Cervinia, Zermatt, Saas-Fee summer glaciers). |

**S-hemi ski is Peakly's unique summer edge** — 23 venues in season while OpenSnow/OnTheSnow go dark. Single-venue S-hemi ski airports ripe for expansion: USH (1), CHC (1), CBR (1), CPC (1), NQN (1), MDZ (1), BRC (1).

---

## 4. Content Quality

| Check | Result | Notes |
|-------|--------|-------|
| Venue descriptions | N/A | No description field in schema — by design. |
| Tags coverage | ✅ 0 empty | All 373 have ≥1 tag. |
| Photo field present | ✅ 373/373 | All filled. |
| Duplicate IDs (VENUES) | ✅ 0 | Boot-time validator active. |

### Photo Distribution (designed state)

| Uniqueness | Photo URLs | Venue slots |
|---|---|---|
| Used once (unique) | 45 | 45 |
| Used 2× | 47 | 94 |
| Used 3× | 78 | 234 |
| Used 4×+ | **0** | **0** — max at 3× |
| **Total** | **170 unique** | **373** |

This is the **designed state** from the June 13 photo dedup (round-robin, max 3×, no URL used 4+ times). Not a defect — reflects the limited pool of verified on-theme Unsplash photos. To improve: `UNSPLASH_KEY=... node scripts/photos-fetch.mjs` (Open #20, ~346 venues still generic). Cross-category conflict (cancun-beach / big-white-ski-s5) **confirmed fixed today** in 84ed91b.

### BASE_PRICES Gap (open — not resolved by today's DevOps commit)

**46/146 unique venue airports covered (31.5%).** 235 venues (63%) show `~$X` estimates only.

Top 15 missing airports by venues affected:

| Airport | Venues | Region |
|---|---|---|
| CUN | 9 | Cancún / Riviera Maya, Mexico |
| IBZ | 7 | Ibiza, Spain |
| HKT | 6 | Phuket, Thailand |
| BTV | 5 | Vermont ski, USA |
| NCE | 5 | French Riviera, France |
| ZNZ | 5 | Zanzibar, Tanzania |
| MRU | 5 | Mauritius |
| SPU | 4 | Split, Croatia |
| USM | 4 | Koh Samui, Thailand |
| MPH | 4 | Boracay, Philippines |
| DLM | 4 | Dalaman/Fethiye, Turkey |
| CMB | 4 | Colombo, Sri Lanka |
| GOI | 4 | Goa, India |
| NAP | 4 | Naples, Italy |
| CAG | 4 | Sardinia, Italy |

**Priority backfill: CUN + IBZ + HKT + BTV + NCE = 31 venues unlocked, ~2h work.**

---

## 5. Daily Venue Additions (5 new — 5 BASE_PRICES airports with 0 current venues)

**Strategy today:** All 5 venues are at airports already in BASE_PRICES with zero current venues. Adding each unlocks live deal scoring for that airport. All are in peak season for July 31. **BIQ, LIS, PPT, OOL must have AIRPORT_COORDS entries added alongside or before the venues** — provided below. LIH is already in AIRPORT_COORDS ✅.

---

### AIRPORT_COORDS Additions Required

Paste into the AIRPORT_COORDS block (alongside existing entries):

```javascript
  BIQ:{lat:43.4693,lon:-1.5231},    // Biarritz Pays Basque
  LIS:{lat:38.7742,lon:-9.1342},    // Lisbon Humberto Delgado
  OOL:{lat:-28.1644,lon:153.5053},  // Gold Coast
  PPT:{lat:-17.5534,lon:-149.6068}, // Papeete, Tahiti
```

---

### Venue 1 — La Grande Plage, Biarritz, France (BIQ)

```javascript
{id:"biarritz-grande-plage", category:"beach",
  title:"La Grande Plage", location:"Biarritz, Basque Country, France",
  lat:43.4935, lon:-1.5586, ap:"BIQ",
  icon:"🌊", rating:4.72, reviews:18400,
  gradient:"linear-gradient(160deg,#001428,#002a5a,#004890)",
  accent:"#4ab8f0",
  tags:["Belle Époque Grand Casino","Basque Coast Glamour","Atlantic Beach Promenade","Seafood Markets","Art Deco Architecture"],
  photo:"https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** BIQ in BASE_PRICES (JFK→BIQ ~$760), 0 current venues. La Grande Plage is the original French beach resort (1900s), flanked by the Hôtel du Palais and Grand Casino. July = peak Basque summer, 22°C Atlantic water, packed with Parisian and Spanish visitors. Tags avoid "surfing" (retired) — lean into beach culture, architecture, and food. AP_CONTINENT=europe ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add.

---

### Venue 2 — Praia de Comporta, Portugal (LIS)

```javascript
{id:"comporta-beach-pt", category:"beach",
  title:"Praia de Comporta", location:"Alentejo Coast, Portugal",
  lat:38.3841, lon:-8.7722, ap:"LIS",
  icon:"🏖️", rating:4.88, reviews:9600,
  gradient:"linear-gradient(160deg,#001428,#002850,#004888)",
  accent:"#3ac0f0",
  tags:["Europe's Secret Riviera","Pine Forest Dunes","No Highrise Development","Rice Field Backdrop","Designer Crowd"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"},
```

**Rationale:** LIS in BASE_PRICES (JFK→LIS ~$680), 0 current venues. Comporta (90min south of Lisbon) is Europe's hottest luxury beach discovery — untouched Atlantic dunes, no hotels taller than pine trees, rice paddies behind the sand. July = peak season (23°C water, low humidity). "No Highrise Development" differentiates from overcrowded Algarve. AP_CONTINENT=europe ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add.

---

### Venue 3 — Temae Beach, Moorea, French Polynesia (PPT)

```javascript
{id:"temae-beach-moorea", category:"beach",
  title:"Temae Beach", location:"Moorea, French Polynesia",
  lat:-17.4856, lon:-149.7728, ap:"PPT",
  icon:"🐠", rating:4.94, reviews:7200,
  gradient:"linear-gradient(160deg,#001030,#002060,#003890)",
  accent:"#00d8f8",
  tags:["Lagoon Snorkeling","Volcanic Peaks Backdrop","Stingray Territory","Blue Lagoon Color","Honeymoon Classic"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** PPT in BASE_PRICES ($1200–$1900 from US hubs), 0 venues — most premium uncovered geography. Moorea's Temae is the highest-rated public beach in French Polynesia; sharks, rays, volcanic ridgeline framing. July = dry season (26°C water, best visibility). Deal scoring matters here — a $600 fare spread is worth surfacing. Moorea is 25min ferry from PPT. AP_CONTINENT=oceania ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add.

---

### Venue 4 — Poipu Beach, Kauai, Hawaii (LIH)

✅ LIH already in AIRPORT_COORDS (added today in 84ed91b). No pre-add required.

```javascript
{id:"poipu-beach-kauai", category:"beach",
  title:"Poipu Beach", location:"Kauai, Hawaii, USA",
  lat:21.8690, lon:-159.4691, ap:"LIH",
  icon:"🐢", rating:4.87, reviews:14200,
  gradient:"linear-gradient(160deg,#001428,#002a50,#004878)",
  accent:"#3cc8f8",
  tags:["Hawaiian Monk Seal Haul-Out","Sunniest Spot on Kauai","Protected Snorkel Cove","Bodysurf Break","Year-Round Warm Water"],
  photo:"https://images.unsplash.com/photo-1530866069532-a60e0df8c6e0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

**Rationale:** LIH is the only Hawaiian airport in BASE_PRICES (JFK→LIH ~$880) with 0 venues. Kauai is the most coveted Hawaiian island — Na Pali Coast, no high-rises, fewer crowds than Maui/Oahu. Poipu is its signature beach: sheltered south-shore cove, 26°C July water, Hawaiian monk seals resting on the sand (roped-off recovery zone = rare wildlife moment). AP_CONTINENT=na ✅, BASE_PRICES ✅, AIRPORT_COORDS ✅.

---

### Venue 5 — Main Beach, Surfers Paradise, Gold Coast (OOL)

```javascript
{id:"surfers-paradise-gold-coast", category:"beach",
  title:"Main Beach", location:"Surfers Paradise, Gold Coast, Australia",
  lat:-27.9990, lon:153.4305, ap:"OOL",
  icon:"🌊", rating:4.58, reviews:31000,
  gradient:"linear-gradient(160deg,#001828,#003050,#005480)",
  accent:"#30b8d8",
  tags:["Australia's Playground Beach","Skyline Beachfront","July Clear Water","Year-Round Warm Currents","Patrolled Surf Break"],
  photo:"https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},
```

**Rationale:** OOL in BASE_PRICES (JFK→OOL ~$2020), 0 venues. Gold Coast is Australia's #1 domestic beach destination — 57km of patrolled beaches. July = Gold Coast "winter" (22°C air, 21°C ocean, minimal humidity and rain, clear water — counterintuitively one of the better months). SYD already has 2 venues; Gold Coast is warmer in winter, more dedicated beach infrastructure. AP_CONTINENT=oceania ✅, BASE_PRICES ✅, AIRPORT_COORDS=needs add.

---

**Pre-add checklist for today's 5:**
- All 5 APs in AP_CONTINENT ✅
- LIH in AIRPORT_COORDS ✅ | BIQ, LIS, PPT, OOL AIRPORT_COORDS entries provided above ⚠️
- All 5 in BASE_PRICES ✅ — live deal scoring unlocked immediately on add
- No ID conflicts ✅ — none of these IDs exist in app.jsx
- Run `node scripts/validate-venues.mjs` after adding

---

## One Observation the PM Should Know

**DevOps today incorrectly closed BASE_PRICES as "100% covered."** The DevOps agent's node eval correctly found AIRPORT_COORDS at 146/146 (its own fix), then mislabeled it as BASE_PRICES coverage in the commit message and report. PM v104 and every content report through today correctly track BASE_PRICES at 46/146 (31.5%) — Open #22. The DevOps commit message does not resolve it and should not be treated as authority here. BASE_PRICES backfill is still Open #22, still a pre-launch P1, still 100 APs short.

**Venue backlog is 20 proposals across 4 sessions with zero added.** Today's 5 are the cleanest batch yet: all at BASE_PRICES-covered airports with 0 current venues, all pre-validated. The 5-AIRPORT_COORDS-line + 5-venue paste takes under 5 minutes. If not happening, content agent suspends new proposals next session until prior batch ships.

**Pre-launch priority stack (2026-07-31):**
1. **VPS redeploy** (Open #19 — Day 7, P1). SSH: `cp -r server/* /opt/peakly-proxy/ && cd /opt/peakly-proxy && pm2 restart peakly-proxy`. Bundles Open #23.
2. **Cache stamp** — `20260725d` is 6 days stale. Quick fix: `perl -pi -e 's/20260725d/20260731a/g' app.jsx sw.js index.html`.
3. **BASE_PRICES backfill** — CUN + IBZ + HKT + BTV + NCE = 31 venues, ~2h (Open #22).
4. **Venue backlog** — 20 proposals ready to paste (today's 5 plus prior 15).
5. **Open #21 APNS** — uncommitted working-tree fix exists in server/proxy.js + app.jsx; finish, commit, test.
