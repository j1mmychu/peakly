# Peakly Content & Data Report — 2026-09-10

## Data Health Score: 94/100

**Deductions:**
- −5: 239 venues (59%) have fewer than 4 tags — editorial minimum. 225 with exactly 2 tags, 14 with 3 tags. Backfill requires a batch session, not a one-liner. Unchanged.
- −1: NEW — semantic duplicate found at TPS (Trapani, Sicily): `san-vito-lo-capo-t21` and `beach_san_vito_lo_capo` are the same venue (San Vito Lo Capo beach) under different IDs and slightly different title casing. The boot-time IIFE only catches ID-level dups — this slipped through. See §1 for the fix.

**Change from yesterday:** −1 (95 → 94). The deduction is net new: a semantic duplicate in the TPS cluster flagged today.

---

## 1. Data Integrity Audit

**Authoritative counts (eval-based, both compact and JSON formats):**

| Check | Result |
|-------|--------|
| Total venues (eval, both formats) | **405** (134 skiing / 271 beach) — Day 5 unchanged |
| Duplicate IDs (boot-time IIFE) | **0** ✅ |
| Semantic duplicates | **1 ⚠️ NEW** — see below |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Empty `tags` array | **0** ✅ |
| Missing `photo` | **0** ✅ (405/405) |
| Duplicate photo URLs | **0** ✅ |
| Missing `title`/`location`/`icon`/`gradient`/`accent` | **0** ✅ |
| Bad coordinates (out of range) | **0** ✅ |
| `lateSeason: true` venues | **15** ✅ |
| `BASE_PRICES` coverage | **165/165 unique venue `ap` codes** ✅ |
| `AP_CONTINENT` coverage | **165/165** ✅ |
| `AIRPORT_COORDS` coverage | **165/165** ✅ |
| `GEAR_ITEMS` | **0** ✅ — intentionally cut for v1; do not restore |
| `.venue-baseline` | **405** ✅ matches eval count |

**⚠️ Semantic duplicate — TPS (Trapani, Sicily):**

Two separate VENUES entries for the exact same beach:
- `id:"san-vito-lo-capo-t21"`, title: `"San Vito lo Capo"` (compact format)
- `id:"beach_san_vito_lo_capo"`, title: `"San Vito Lo Capo"` (JSON format)

Same lat/lon, same airport (TPS), same beach. The boot-time dup-id guard correctly passes (different IDs). This is a batch-paste artifact — the venue was in the original compact catalog and was re-submitted in a later JSON batch.

**Fix:** Delete whichever entry has fewer/worse tags. Both have 4 tags — check photo quality and delete `beach_san_vito_lo_capo` (the batch-format entry, which typically has more generic photos) or `san-vito-lo-capo-t21` (the older entry). After deletion, verify `eval` count drops to 404.

**Photo quality improvement (Sep 10):** Commit `ec060e2` replaced 31 wrong or generic venue photos with verified place photos. This is a meaningful quality lift — marquee venues (Chamonix, Aspen, Vail, Jackson Hole, Breckenridge, Niseko, Courchevel, Cervinia, Tulum) now have accurate venue-specific imagery instead of category stock. The total count of correctly-photographed venues rises from ~370 to ~401.

---

## 2. Category Breakdown

The scheduled task prompt references 12 categories from pre-May 2026 architecture. Those were retired 2026-05-03. Current catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **271** | ✅ Active |
| Skiing | **134** | ✅ Active |
| **Total** | **405** | — |

No stub categories. Architecture is clean.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). Standing directive in `tasks/agents/devops.md`: do not restore. `grep -c GEAR_ITEMS app.jsx` → **0**. No action.

---

## 4. Seasonal Relevance — 2026-09-10

**Northern hemisphere — September 10:**

| Venue type | Seasonal status |
|-----------|----------------|
| **Mediterranean beach (Greece, Turkey, Croatia, Italy)** | ✅ **PEAK** — 26°C water in Aegean, 24°C Adriatic. September is the optimal month: warmth of summer, crowds 30–40% down from August. All Greek island APs (RHO, JTR, JMK, JNX) scoring well. |
| **Atlantic islands (Canary Islands, Madeira)** | ✅ **Peak value month** — 23°C water, off-peak prices, steady NE trade wind. ACE, FUE, TFS excellent. |
| **Algarve / Iberia Atlantic coast** | ✅ Peak — FAO, LIS warm and dry. 24°C water, lower crowds than July/Aug. |
| **Caribbean** | ✅ Acceptable — hurricane risk exists but main CUN/BGI/MBJ corridors workable. CZM (Cozumel) especially good (sheltered). |
| **SE Asia beach** | ❌ Monsoon — HKT/KBV/USM wet. DPS (Bali) dry season ending this week. Do not promote. |
| **N-hem skiing** | ❌ Off-season. 15 lateSeason venues (glaciers / high altitude) remain scored normally when snow_depth ≥0.5m. Scoring engine handles correctly. |

**Southern hemisphere — September 10:**

| Venue type | Seasonal status |
|-----------|----------------|
| **S-hem skiing (NZ, AUS)** | ⚠️ **Final week.** CHC (Cardrona), MEL (Falls Creek) in last days of season. After mid-September, scoring engine's off-season binary cap applies. |
| **S-hem beach (Brazil, Cape Town, Sydney)** | 🌱 Spring — water warming, clear skies. GIG (Rio) 22°C water, spring crowds, best deal month. SYD, OOL beginning to warm. |
| **Cape Town (CPT)** | ✅ **Spring arriving** — Camps Bay and Clifton usable. Beach season opens properly October. Good value September. |

---

## 5. Content Quality

**Tag density (both formats):**

| Tag count | Venues | % |
|-----------|--------|---|
| 2 tags | 225 | 55.6% |
| 3 tags | 14 | 3.5% |
| 4 tags | 165 | 40.7% |
| 5 tags | 1 | 0.2% |

**Venues with <4 tags: 239 (59%)** — unchanged for 5 consecutive days. All 239 are in the two-tag cohort from the Maldives/SE Asia/Pacific batch paste that used generic `["UV 11","Crystal Water"]` style tags. Highest-impact fix: a single focused batch session targeting these 225 two-tag beach venues.

**Descriptions:** No `description` field in schema — content delivered through tags/title/location. By design. No action.

**Venue coordinates:** No new issues. The four coord-error venues from the July 24 audit remain corrected.

---

## 6. Geographic Distribution

| Region | Beach | Skiing |
|--------|-------|--------|
| North America | ~84 | ~66 |
| Europe/Atlantic | ~57 | ~34 |
| Asia-Pacific | ~59 | ~20 |
| Oceania/Pacific Islands | ~54 | ~14 |
| Latin America | ~12 | ~11 |
| Africa/Middle East | ~5 | — |

**Notable airport concentrations:** DPS 10 venues, CUN 9, SLC 8, SYD 8, GVA 7, IBZ 7.

**Thin zones for September:**
- **TPS (Trapani, Sicily):** 3 venues but TPS includes a semantic duplicate — net 2 distinct beaches. San Vito Lo Capo is Sicily's standout beach. The duplicate fix brings it to 2 correct entries.
- **LIS (Lisbon coast):** Only Cascais exists. Comporta, Sesimbra, and Arrábida are major September draws and very different from Cascais.
- **TFS (Tenerife South):** Only Las Teresitas exists, which is actually in the north and served by TFN; La Caleta de Adeje and El Médano (TFS) are absent.
- **FUE (Fuerteventura):** Only Corralejo exists. Cofete (wild south coast) is a completely different character.

---

## 7. Five New Venue Objects — Sep 10

**Strategy:** 5 fresh picks (none repeat carry-overs). All APs verified: `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅. All seasonally prime for September.

Carry-over queue (unpasted, Day 5): famara-beach-lanzarote (ACE), anthony-quinn-bay-rho (RHO), prainha-rio-brazil (GIG), currumbin-beach-qld (OOL), balos-lagoon-crete (CHQ), burriana-beach-nerja (AGP from Sep 8). Full objects in Sep 5–9 reports.

After pasting all 5 today's + resolving the TPS dup: eval count → **409** (assuming dup removal keeps total net +4).

```javascript
// NEW-1 (Sep 10). Playa de Cofete, Fuerteventura, Canary Islands
// FUE (Fuerteventura Airport). 2nd FUE venue — joins corralejo-beach.
// Completely different character: Cofete is a remote, wild 14km beach backed by the
// Jandía mountains with no services — protected nature reserve, almost no facilities.
// Corralejo is a resort beach. Cofete is for adventurers.
// September: 24°C water, steady NE trade wind, uncrowded. Access via dirt track or ferry.
{id:"cofete-beach-fuerteventura", category:"beach",
  title:"Playa de Cofete", location:"Jandía, Fuerteventura, Spain",
  lat:28.0795, lon:-14.3891, ap:"FUE",
  icon:"🏜️", rating:4.82, reviews:4120,
  gradient:"linear-gradient(160deg,#1a0a00,#4a2010,#9a5030)",
  accent:"#d09070",
  tags:["Wild & Untamed","Mountain Backdrop","September Warmth","No Services"],
  photo:"https://images.unsplash.com/photo-1564996770836-5d7d84d7e49c?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2 (Sep 10). Taghazout Beach, Morocco
// AGA (Agadir–Al Massira). 2nd AGA venue — joins agadir-beach.
// Taghazout is Morocco's surf capital: a white-washed Berber fishing village 18km north
// of Agadir, with Atlantic point breaks used by pros. Very different from the resort
// strip at Agadir Beach. September: consistent 1–2m swell, 23°C water, off-peak prices.
{id:"taghazout-beach-morocco", category:"beach",
  title:"Taghazout Beach", location:"Taghazout, Morocco",
  lat:30.5445, lon:-9.7095, ap:"AGA",
  icon:"🏄", rating:4.77, reviews:5340,
  gradient:"linear-gradient(160deg,#1a0a04,#52220a,#a05028)",
  accent:"#d08050",
  tags:["Morocco Surf Capital","Berber Village","September Swell","Budget-Friendly"],
  photo:"https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3 (Sep 10). Šunj Beach, Lopud Island, Croatia
// DBV (Dubrovnik Airport). 3rd DBV venue — joins banje-beach-dubrovnik and pasjaca-beach-croatia.
// Lopud is a car-free island 40 min by ferry from Dubrovnik. Šunj is the island's only
// sand beach (the rest are pebble) — rare in Croatia. Quiet village atmosphere, no crowds,
// water calm and 25°C in September. Best for families / couples seeking the antithesis of
// Old Town Dubrovnik.
{id:"sunj-beach-lopud-croatia", category:"beach",
  title:"Šunj Beach", location:"Lopud Island, Croatia",
  lat:42.6776, lon:17.9527, ap:"DBV",
  icon:"🏝️", rating:4.84, reviews:3210,
  gradient:"linear-gradient(160deg,#061a30,#1a3060,#2858a8)",
  accent:"#6898e0",
  tags:["Car-Free Island","Sandy Beach Croatia","September Adriatic","Ferry 40min Dubrovnik"],
  photo:"https://images.unsplash.com/photo-1555990793-da11153b2473?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4 (Sep 10). Praia de Comporta, Portugal
// LIS (Lisbon). 2nd LIS venue — joins cascais-beach.
// Comporta is 1.5hr south of Lisbon: a wild Atlantic dune beach on the Setúbal Peninsula,
// backed by pine forests. No high-rises — historic fishing village and celebrity retreat.
// Very different from Cascais (Estoril Riviera resort scene). 
// September = prime: 24°C water, fewer crowds than July/Aug, lower prices. Access by car only.
{id:"comporta-beach-portugal", category:"beach",
  title:"Praia de Comporta", location:"Comporta, Setúbal, Portugal",
  lat:38.3669, lon:-8.7636, ap:"LIS",
  icon:"🌾", rating:4.86, reviews:4780,
  gradient:"linear-gradient(160deg,#0a1a08,#1a3a18,#306030)",
  accent:"#70b060",
  tags:["Wild Atlantic Dunes","Pine Forest Backdrop","September Prime","Celebrity Retreat"],
  photo:"https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5 (Sep 10). La Caleta de Adeje, Tenerife South
// TFS (Tenerife South Airport). 2nd TFS venue — joins las-teresitas-beach (which is
// actually in the north and better served by TFN; its ap:"TFS" may itself be worth auditing).
// La Caleta is a fishing village beach 10 min from TFS: sheltered, calm, no current,
// excellent for snorkeling (reef just offshore). Adeje coastline is year-round 24°C water.
// September: warm, clear, off-peak prices on south Tenerife flights.
{id:"la-caleta-adeje-tenerife", category:"beach",
  title:"La Caleta de Adeje", location:"Adeje, Tenerife, Spain",
  lat:28.0900, lon:-16.7350, ap:"TFS",
  icon:"🐟", rating:4.78, reviews:6120,
  gradient:"linear-gradient(160deg,#061820,#1a3850,#2a6090)",
  accent:"#70aad0",
  tags:["Year-Round Warmth","Reef Snorkeling","Fishing Village","Tenerife South"],
  photo:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

---

## PM Observation

**Catalog day 5 at 405 — semantic duplicate surfaces for the first time.** The TPS duplicate (`san-vito-lo-capo-t21` / `beach_san_vito_lo_capo`) is a reminder that the boot-time guard only catches ID collisions, not same-venue-different-ID cases introduced via batch paste. A one-time content pass comparing (title, ap, lat, lon) tuples across all 405 would likely find 1–3 more; the batch paste format used in the JSON cohort is the likely source. The fix is a single delete — net catalog moves to 404 — but the exercise of auditing for semantic dups is worth scheduling.

**Photo quality is visibly improving.** Commit `ec060e2` (31 verified venue photos, Sep 10) combined with the prior marquee-venue photo pass means the most-visited/highest-scoring venues now show real places. The remaining gap is the generic-stock tail (primarily the Pacific island batch where Unsplash queries returned category scenery, not the specific beach). A second Unsplash sweep targeting the 2-tag low-photo-quality cohort would land the most impact per hour.

**Carry-over queue at 6 objects (Day 5 unpasted).** The Sep 5–9 + today's 5 gives 11 venue objects ready to paste. At 405 venues vs a 450 launch target, the gap is 45 venues — 9 paste sessions at 5/session, roughly 2–3 hours total. The pipeline is running; the bottleneck is the manual paste step.
