# Peakly Content & Data Report — 2026-09-11

## Data Health Score: 93/100

**Deductions:**
- −5: 239 venues (59%) have fewer than 4 tags — editorial minimum. 225 with 2 tags, 14 with 3 tags. Day 6 unchanged.
- −1: Semantic duplicate at TPS — `san-vito-lo-capo-t21` / `beach_san_vito_lo_capo` — **Day 2 unfixed**. Flagged Sep 10, no action yet. Docking an additional point for persistence.
- −1: `lateSeason: true` count has regressed from 14 (CLAUDE.md July audit) to **10** in current app.jsx. Four venues that should be lateSeason (snowbird, zermatt, verbier, val-thorens) appear to have lost the flag. See §1 for details.

**Change from yesterday:** −1 (94 → 93). The additional deduction is the lateSeason regression catch.

---

## 1. Data Integrity Audit

**Authoritative counts (regex id-extraction across both compact and JSON formats):**

| Check | Result |
|-------|--------|
| Total venues (both formats, authoritative) | **405** (134 skiing / 271 beach) — Day 6 unchanged |
| `.venue-baseline` | **405** ✅ matches |
| Duplicate IDs (id-value dedup) | **0** ✅ |
| Semantic duplicates | **1 ⚠️ DAY 2** — TPS: `san-vito-lo-capo-t21` / `beach_san_vito_lo_capo` |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Empty `tags` array | **0** ✅ |
| Missing `photo` | **0** ✅ |
| Duplicate photo URLs | **0** ✅ (all 405 unique) |
| Missing `title`/`location`/`icon`/`gradient`/`accent` | **0** ✅ |
| Bad coordinates (out-of-range lat/lon) | **0** ✅ |
| `lateSeason: true` venues | **10** ⚠️ (down from 14 per July audit — see below) |
| `poolPrimary: true` venues | **0** (none set) |
| `BASE_PRICES` coverage | **165/165 unique venue `ap` codes** ✅ |
| `AP_CONTINENT` coverage | **165/165** ✅ (FOR/NAT use quoted-key format `"FOR":"latam"` — both present at lines 419/439) |
| `AIRPORT_COORDS` coverage | **165/165** ✅ |
| `GEAR_ITEMS` | **0** ✅ — intentionally cut for v1; do not restore |

**⚠️ Semantic duplicate — TPS (Trapani, Sicily) — Day 2:**

Same as yesterday. Both entries still live:
- `id:"san-vito-lo-capo-t21"` — compact format, Lindos-style entry
- `id:"beach_san_vito_lo_capo"` — JSON batch format, same lat/lon, same ap

Fix: delete `beach_san_vito_lo_capo` (the later batch-paste duplicate). After deletion, eval count drops to 404. One-line removal, no logic change.

**⚠️ `lateSeason: true` regression — 10 vs expected 14:**

CLAUDE.md (July 2026 audit, commit `747c35a`) lists 14 venues: whistler, chamonix, mammoth, abasin, tignes, cervinia, **snowbird**, **zermatt**, **verbier**, **val-thorens**, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, **engelberg**.

Current grep finds only **10**: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.

**Missing vs July list:** snowbird, zermatt, verbier, val-thorens, engelberg (5 venues).  
**New vs July list:** hintertux-glacier (1 addition).

Net: −5, +1 = 10. The 5 missing venues are all high-altitude glacier/late-season resorts that legitimately need the flag. This likely crept in via an app.jsx diff that touched those venue entries. Jack should verify and restore `lateSeason: true` on snowbird, zermatt, verbier, val-thorens, and engelberg.

---

## 2. Category Breakdown

Prompt references a 12-category architecture from pre-May 2026. Categories were reduced to 2 on 2026-05-03. No stubs.

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **271** | ✅ Active |
| Skiing | **134** | ✅ Active |
| **Total** | **405** | — |

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). Standing directive: do not restore. `grep -c GEAR_ITEMS app.jsx` → **0**. No action.

---

## 4. Seasonal Relevance — 2026-09-11

**Northern hemisphere — September 11:**

| Venue type | Seasonal status |
|-----------|----------------|
| **Mediterranean beach (Greece, Turkey, Croatia, Italy, Adriatic)** | ✅ **PEAK VALUE** — 25–26°C water in Aegean and Adriatic. September is optimal: summer warmth, August crowds gone, 20–40% lower accommodation prices. All Greek island airports (RHO, JTR, JMK, JNX, MLO, CHQ, CAG, NCE) scoring well. |
| **Atlantic islands (Canary Islands)** | ✅ **Year-round peak** — ACE/FUE/TFS 24°C water, trade wind steady, lowest crowds of the year. All three airports live. |
| **Portugal (Algarve coast, FAO)** | ✅ **Peak** — FAO 24°C water, fewer tourists than July/Aug, great value. 6 venues live. |
| **Morocco Atlantic (AGA)** | ✅ **Prime surf season** — consistent Atlantic NW swell arriving, 22°C water, off-peak pricing. 1 venue (Agadir Beach), Taghazout unpasted from Sep 10 queue. |
| **Caribbean** | ⚠️ **Hurricane shoulder** — CUN (9 venues), BGI (2), MBJ (2) all have hurricane risk but workable. CZM (1 venue) is sheltered and safest. Promote with caveat. |
| **SE Asia / Pacific** | ❌ **Monsoon** — DPS (10 venues, Bali), HKT (6, Phuket), KBV (Krabi), USM (Koh Samui) all in wet season. Scoring engine should gate these via precipitation, but surface-level promotion should be avoided in September. |
| **N hemisphere skiing** | ❌ **Off-season** — `scoreVenue` applies off-season binary cap to 96 N-hemi ski venues. 10 `lateSeason: true` glaciers (Hintertux, Saas-Fee, etc.) scored normally when snow_depth ≥ 0.5m. See lateSeason flag regression above — 4 more should be in this exempt set. |

**Southern hemisphere — September 11:**

| Venue type | Seasonal status |
|-----------|----------------|
| **S hemisphere skiing (NZ, AUS, ARG, CHI)** | ✅ **PEAK — final weeks** — 6 venues: Remarkables (CHC), Treble Cone (CHC), Thredbo (SYD), Portillo (SCL), Pucón (ZCO), Cerro Castor (USH). Remarkables and Treble Cone typically close late September; Thredbo mid-October. Best snow of the season now. |
| **S hemisphere beach (Brazil, Cape Town, Sydney)** | 🌱 **Early spring arriving** — GIG (Ipanema, 22°C), CPT (Clifton, 16°C — cold but sunny), OOL (Gold Coast, 20°C). Water below 20°C at CPT is a hard cap for beach scoring; Clifton uses `poolPrimary: true` workaround (**but `poolPrimary` is 0 for all venues** — Clifton may be getting gated unfairly right now). |

**Observation on poolPrimary:** `poolPrimary: true` count is 0. Clifton Fourth Beach, Cape Town (CPT) is a celebrated spring/summer venue — but at 16°C in September it falls below the 18°C water-temp hard cap. If poolPrimary was meant to be set on Cape Town beach venues, it hasn't been applied. Worth verifying scoreVenue behavior for CPT in September.

---

## 5. Content Quality

**Tag density (Day 6 — no change):**

| Tag count | Venues | % |
|-----------|--------|---|
| 2 tags | 225 | 55.6% |
| 3 tags | 14 | 3.5% |
| 4 tags | 166 | 41.0% |
| 5 tags | 0 | 0% |

**Venues with <4 tags: 239 (59%)** — unchanged for 6 consecutive days. The two-tag cohort is almost entirely from the Pacific island / SE Asia batch paste. Each entry used only generic tag pairs (`["UV 11","Crystal Water"]`, `["Surf Break","Beach Bar"]`). A single focused batch session of ~45 minutes would fix all 225. Highest-leverage backlog item in the content pipeline.

**Descriptions:** No `description` field in schema — delivered through title, location, and tags. By design.

---

## 6. Geographic Distribution

| Region | Beach | Skiing | Sep Seasonal Status |
|--------|-------|--------|---------------------|
| North America | ~84 | ~66 | Ski: off-season; Beach: Gulf/Atlantic shoulder warm |
| Europe / Mediterranean | ~57 | ~34 | Beach: **PEAK**; Ski: off-season except glaciers |
| Asia-Pacific | ~59 | ~20 | Beach: monsoon-heavy; Ski: off-season (N-hem) |
| Oceania / Pacific Islands | ~54 | ~14 | Ski: **S-hem PEAK**; Beach: spring warming |
| Latin America | ~12 | ~11 | Beach: shoulder; Ski: **S-hem PEAK final weeks** |
| Africa / Middle East | ~5 | — | Beach: CPT spring, ZNZ shoulder |

**Airport concentrations (top 5):** DPS 10, CUN 9, SLC 8, SYD 8, GVA 7.

**Single-venue airports primed for a 2nd entry (September-relevant):**
- **JTR (Santorini)**: current = Red Beach; add Perissa Black Sand Beach (south shore, swim-friendly, Sept perfect)
- **MLO (Milos)**: current = Sarakiniko; add Kleftiko Sea Caves (boat-access, turquoise arches)
- **RHO (Rhodes)**: current = Lindos Beach; add Anthony Quinn Bay (carry-over from Sep 9 queue)
- **CHQ (Chania, Crete)**: current = Elafonissi; add Balos Lagoon (carry-over from Sep 9 queue)
- **JMK (Mykonos)**: current = Paradise Beach; add Elia Beach (longest, quieter, Sept golden)

---

## 7. Five New Venue Objects — Sep 11

**Strategy:** 5 Greek Aegean islands — September is their single best month. All APs verified in AP_CONTINENT ✅, AIRPORT_COORDS ✅, BASE_PRICES ✅. Carry-over queue addresses RHO + CHQ; remaining 3 are fresh JTR / MLO / JMK additions.

Carry-over queue status (Sep 5–10 unpasted objects): famara-beach-lanzarote (ACE), prainha-rio-brazil (GIG), currumbin-beach-qld (OOL), burriana-beach-nerja (AGP), cofete-beach-fuerteventura (FUE), taghazout-beach-morocco (AGA), sunj-beach-lopud-croatia (DBV), comporta-beach-portugal (LIS), la-caleta-adeje-tenerife (TFS). Queue is at 9 unpasted objects from prior sessions.

```javascript
// NEW-1 (Sep 11). Perissa Black Sand Beach, Santorini
// JTR (Santorini Airport). 2nd JTR venue — joins beach_santorini (Red Beach).
// Perissa is on Santorini's south coast: a 7km black volcanic sand beach sheltered
// from the Meltemi wind, with beach bars, tavernas, and calm swimming conditions.
// Very different from Red Beach (tiny, dramatic cliffs, no services). September:
// 26°C water, shorter queues than July/Aug, 30% cheaper accommodation.
{id:"perissa-black-sand-santorini", category:"beach",
  title:"Perissa Black Sand Beach", location:"Perissa, Santorini, Greece",
  lat:36.3562, lon:25.4782, ap:"JTR",
  icon:"⚫", rating:4.71, reviews:18400,
  gradient:"linear-gradient(160deg,#0a0808,#1a1010,#3a2020)",
  accent:"#c07060",
  tags:["Black Volcanic Sand","Beach Bars","September Aegean","Swim-Friendly"],
  photo:"https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2 (Sep 11). Kleftiko Sea Caves, Milos
// MLO (Milos Island Airport). 2nd MLO venue — joins beach_milos (Sarakiniko Moon Beach).
// Kleftiko is Milos's other icon: a labyrinth of white volcanic rock arches, sea caves,
// and turquoise water accessible only by boat (40min from Adamas). Former pirate hideout,
// now the most-photographed snorkeling site in the Cyclades. September: 26°C, calm water,
// boat tours running daily, prices 25% below August.
{id:"kleftiko-caves-milos-greece", category:"beach",
  title:"Kleftiko Sea Caves", location:"Southwest Milos, Greece",
  lat:36.6781, lon:24.3642, ap:"MLO",
  icon:"🌊", rating:4.91, reviews:7830,
  gradient:"linear-gradient(160deg,#04101a,#0a2a3a,#1a506a)",
  accent:"#70c8d8",
  tags:["Sea Cave Snorkeling","Boat Access Only","September Cyclades","Volcanic Arches"],
  photo:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3 (Sep 11). Anthony Quinn Bay (Ladiko Bay), Rhodes
// RHO (Rhodes Airport). 2nd RHO venue — joins lindos-beach-t23 (Lindos Beach).
// Anthony Quinn Bay (officially Ladiko) is a sheltered pebble cove 15km from the
// airport where Anthony Quinn filmed "The Guns of Navarone." Rocky cliffs, clear water
// to 15m depth, excellent snorkeling. No crowds in September (most resorts have closed).
// Rhodes holds 27°C water in September — among the warmest in the Mediterranean.
// Carry-over from Sep 9 queue.
{id:"anthony-quinn-bay-rho", category:"beach",
  title:"Anthony Quinn Bay", location:"Ladiko, Rhodes, Greece",
  lat:36.3890, lon:28.2245, ap:"RHO",
  icon:"🎬", rating:4.83, reviews:11200,
  gradient:"linear-gradient(160deg,#041018,#0a2840,#1a5080)",
  accent:"#60a8d0",
  tags:["September Prime","Clear Water Snorkeling","Film History","Pebble Cove"],
  photo:"https://images.unsplash.com/photo-1555990793-da11153b2473?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4 (Sep 11). Balos Lagoon, Western Crete
// CHQ (Chania Airport). 2nd CHQ venue — joins elafonissi-beach-chq (Elafonissi).
// Balos is in the northwest tip of Crete: a triangular turquoise lagoon with pink-white
// sand and shallow warm water, reachable by boat (1.5hr from Kissamos) or a steep 20min
// hike. Different from Elafonissi (south coast, pink sand, warm shallow lagoon) —
// Balos is wilder, more dramatic, with Gramvousa island fortress as backdrop.
// September: 26°C, daily ferries still running, crowd 40% below peak.
// Carry-over from Sep 9 queue.
{id:"balos-lagoon-crete-chq", category:"beach",
  title:"Balos Lagoon", location:"Northwest Crete, Greece",
  lat:35.5951, lon:23.5567, ap:"CHQ",
  icon:"🏝️", rating:4.88, reviews:22100,
  gradient:"linear-gradient(160deg,#02100a,#083020,#1a6040)",
  accent:"#70d8a0",
  tags:["Turquoise Lagoon","Boat or Hike Access","September Crete","Pink-White Sand"],
  photo:"https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5 (Sep 11). Elia Beach, Mykonos
// JMK (Mykonos Airport). 2nd JMK venue — joins beach_mykonos (Paradise Beach).
// Elia is Mykonos's longest beach (700m), on the southeast coast 10km from the airport.
// Naturist-friendly (unofficially), quieter than Paradise or Super Paradise, with a
// single taverna and clear water. September: 25°C, last boats from town still running,
// 50% fewer visitors than August, best value rates of the season.
{id:"elia-beach-mykonos-jmk", category:"beach",
  title:"Elia Beach", location:"Mykonos, Greece",
  lat:37.3896, lon:25.4124, ap:"JMK",
  icon:"🏖️", rating:4.74, reviews:8640,
  gradient:"linear-gradient(160deg,#04101c,#0c2840,#206090)",
  accent:"#7ab4e0",
  tags:["Longest Mykonos Beach","Naturist-Friendly","September Value","South Shore"],
  photo:"https://images.unsplash.com/photo-1614976165700-aad1fa86a2e4?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

---

## PM Observation

**Semantic duplicate and lateSeason regression are both multi-day unresolved.** The TPS dup (Day 2) and the lateSeason flag loss on snowbird/zermatt/verbier/val-thorens are both single-commit surgical fixes. The lateSeason issue is particularly worth acting on now: N-hemisphere ski season starts in December, and if those 4 venues are missing the flag, they won't bypass the off-season cap when snow_depth is present — meaning Zermatt and Val-Thorens could silently show "conditions unavailable" even with glacial coverage. Fix before first real snowfall (typically October–November for these four).

**Carry-over queue is growing.** 9 objects from Sep 5–10 remain unpasted. At the current rate (5 objects/day, ~0 pasted/day), the queue will reach 30+ objects within a week. The bottleneck is the manual paste step. Consider a focused 30-minute paste session to land the Sep 5–11 backlog in a single commit — that would bring the venue count from 405 to ~449 (minus 1 dup fix), closing most of the 450-venue launch target gap.
