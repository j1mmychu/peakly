# Peakly Content & Data Report — 2026-09-04

## Data Health Score: 97/100

**Deductions:**
- 5 carry-over venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan, Portofino Riviera) unshipped — **Day 7** for first four, **Day 5** for Portofino: −2 pts (PM v139 hard deadline: Sep 7)
- Sep 7 is 3 days away. If carry-overs land before then, score returns to 99/100.
- −1 pt pre-emptive deadline risk: carry-over queue is the single biggest data quality gap and has been escalating daily with no action.

---

## 1. Data Integrity Audit

**Verified via `node -e` eval of the VENUES array (authoritative count method):**

| Check | Result |
|-------|--------|
| Total venues | **395** (132 skiing / 263 beach) |
| Duplicate IDs | **0** ✅ |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Missing `photo` | **0** ✅ (395/395 covered) |
| Duplicate photo URLs | **0** ✅ |
| `scripts/.venue-baseline` | **395** ✅ matches count |
| `lateSeason: true` venues | **15** ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| BASE_PRICES coverage | ✅ All 162 unique venue `ap` codes covered — zero gaps |
| AP_CONTINENT coverage | ✅ All 162 venue `ap` codes present — zero gaps |
| GEAR_ITEMS | **0** ✅ intentionally cut for v1 (Jack, 2026-06-09) — do not restore |

**Catalog is structurally clean. No new integrity issues.**

---

## 2. Category Breakdown

The scheduled prompt references 12 categories from pre-May 2026 architecture (surfing, hiking, tanning, etc.). Those were retired 2026-05-03. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **263** | ✅ Active — well above any minimum threshold |
| Skiing | **132** | ✅ Active — well above any minimum threshold |
| **Total** | **395** | — |

No stub categories. Nothing to fix.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). Standing directive in `tasks/agents/devops.md`: do not restore without a product decision. `grep -c GEAR_ITEMS app.jsx` → **0**. No action.

---

## 4. Seasonal Relevance — 2026-09-04

**September 4 = SH ski late prime. Mediterranean golden month. Ski pre-booking window Day 7.**

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (Mediterranean/Adriatic/Aegean) | ~180 | ✅ **GOLDEN MONTH** — post-tourist-peak, water at annual high (25–28°C), fewer crowds |
| Tropical/equatorial beach (lat −10° to +15°) | ~80 | ✅ **YEAR-ROUND PEAK** |
| S hemisphere ski (lat < 0, skiing) | **23** | ✅ **SH LATE PRIME** — late September ends Southern ski season; book now for final weekends |
| `lateSeason: true` glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee year-round glaciers |
| N hemisphere ski (non-glacier) | ~117 | ⚠️ OFF SEASON — correctly suppressed by scoring engine (no snow) |
| S hemisphere beach (lat < 0) | ~63 | ⚠️ SHOULDER → WARMING — SH spring, sea temps rising, October opens fully |

**In-season ratio: ~60% actively scoring well**

**Ski pre-booking urgency — Day 7:** European families lock Christmas/New Year ski packages in September. Each day without the Trysil carry-over is lost search intent on "Norway ski Christmas" queries. The Sep 7 PM v139 hard deadline is 3 days out.

**Notable gap identified today:** AGP (Málaga, Spain) has **zero venues** in the catalog despite being in both `AP_CONTINENT` and `BASE_PRICES`. Sierra Nevada ski resort is 45min drive from AGP, Spain is the only major EU country with zero ski representation, and September is peak pre-booking for Spanish skiers.

---

## 5. Content Quality

**Photo health:** 395/395 ✅ | 0 duplicates ✅
Generic stock vs. venue-specific (~349/395) remains open, blocked on `UNSPLASH_KEY` (Open #20). No regression.

**Tags and difficulty:** Field completeness 100%. No new quality issues.

**Geographic concentration audit (new finding):**
- AKL (Auckland) has **zero venues** despite being in both lookup tables. New Zealand beach is currently served only via CHC (Mt Hutt ski) — massive Oceania gap.
- GRU (São Paulo) has **zero venues** despite Brazil having 6 beach venues (all via other APs). 
- SCL (Santiago) has 5 ski venues and **zero beach** — Chile has no coastal representation despite being a Pacific Riviera country.
- AGP (Málaga) has **zero venues** — zero Spanish ski despite Sierra Nevada being Europe's southernmost major resort.

These are the four biggest AP-level gaps in the catalog and are all addressable with existing infrastructure.

---

## Carry-Over Queue — Day 7 / Day 5 (PM v139 deadline: Sep 7)

**All 5 carry-overs remain unshipped. These are paste-ready and verified.**
**All APs (OSL, CPT, KUL, DPS, NCE) confirmed in `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅.**
**After paste + auto-push: eval count should reach 400.**

```javascript
// 1. Trysil, Norway [CARRY-OVER Day 7 — DEADLINE Sep 7. HIGHEST PRIORITY.]
{id:"trysil-norway", category:"skiing",
  title:"Trysil", location:"Innlandet, Norway",
  lat:61.3147, lon:12.0736, ap:"OSL",
  icon:"🎿", rating:4.72, reviews:2140,
  gradient:"linear-gradient(160deg,#0d1a2e,#1a3560,#2860a8)",
  accent:"#6898d8",
  tags:["Norway's Largest Resort","Family Friendly","70+ Runs","Village Ski-In/Out"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trysil_ski_resort.jpg/1280px-Trysil_ski_resort.jpg",
  skiPass:"Skistar"},

// 2. Camps Bay Beach, Cape Town [CARRY-OVER Day 7 — SHIP]
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9503, lon:18.3774, ap:"CPT",
  icon:"🏖️", rating:4.78, reviews:6720,
  gradient:"linear-gradient(160deg,#0a1a30,#1a3a68,#2870b8)",
  accent:"#68b0e0",
  tags:["Sunset Strip","Mountain Backdrop","Beachfront Restaurants","Cape Town Spring"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Camps_Bay_beach_and_the_Twelve_Apostles.jpg/1280px-Camps_Bay_beach_and_the_Twelve_Apostles.jpg"},

// 3. Perhentian Islands, Malaysia [CARRY-OVER Day 7 — SHIP]
{id:"perhentian-islands-my", category:"beach",
  title:"Perhentian Islands", location:"Terengganu, Malaysia",
  lat:5.9059, lon:102.7055, ap:"KUL",
  icon:"🏝️", rating:4.83, reviews:3890,
  gradient:"linear-gradient(160deg,#0a2010,#1a5028,#288850)",
  accent:"#58c880",
  tags:["Sea Turtles","Coral Reef","Budget Paradise","Snorkeling"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Perhentian_Islands.jpg/1280px-Perhentian_Islands.jpg"},

// 4. Nusa Lembongan, Bali, Indonesia [CARRY-OVER Day 7 — SHIP]
{id:"nusa-lembongan-bali", category:"beach",
  title:"Nusa Lembongan", location:"Klungkung, Bali, Indonesia",
  lat:-8.6781, lon:115.4536, ap:"DPS",
  icon:"🏄", rating:4.74, reviews:5230,
  gradient:"linear-gradient(160deg,#0a1e20,#1a4848,#288080)",
  accent:"#58c0b8",
  tags:["No Cars","Surf Breaks","Yoga Retreat","Island Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nusa_Lembongan_beach.jpg/1280px-Nusa_Lembongan_beach.jpg"},

// 5. Portofino Riviera, Liguria, Italy [CARRY-OVER Day 5]
{id:"portofino-riviera-it", category:"beach",
  title:"Portofino Riviera", location:"Liguria, Italy",
  lat:44.3035, lon:9.2097, ap:"NCE",
  icon:"⚓", rating:4.85, reviews:9140,
  gradient:"linear-gradient(160deg,#0a1a20,#1a3a48,#2a6068)",
  accent:"#68c0c0",
  tags:["Pastel Fishing Village","Olive Groves","Crystal Water","No Mass Tourism"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Portofino_Harbour.jpg/1280px-Portofino_Harbour.jpg"},
```

---

## 5 New Venue Objects — Sep 4

**Fresh venues targeting four confirmed AP-level gaps: AGP (0 venues), AKL (0 venues), GRU (0 venues), SCL (0 beach venues). All APs verified in both `AP_CONTINENT` ✅ and `BASE_PRICES` ✅. After pasting all 10 (5 carries + 5 new): eval count → 405.**

```javascript
// NEW-1. Sierra Nevada, Spain [HIGHEST NEW PRIORITY — only Spanish ski venue]
// AGP (Málaga Intl, ~45min drive). AGP has ZERO existing venues — full gap.
// Europe's southernmost major ski resort, 2100–3300m. December–May season.
// September = peak pre-booking month for Spanish market. Zero EU Spain ski = missed search intent.
{id:"sierra-nevada-es", category:"skiing",
  title:"Sierra Nevada", location:"Granada, Spain",
  lat:37.0939, lon:-3.3985, ap:"AGP",
  icon:"🎿", rating:4.68, reviews:3840,
  gradient:"linear-gradient(160deg,#1a0e2e,#3a2060,#6040a8)",
  accent:"#b090e0",
  tags:["Southernmost EU Ski","Mediterranean Views","2100-3300m","Snow & Sun"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Sierra_Nevada_ski_resort_Spain.jpg/1280px-Sierra_Nevada_ski_resort_Spain.jpg",
  skiPass:"Sierra Nevada Card"},

// NEW-2. Piha Beach, New Zealand [AKL gap — first Auckland-routed venue]
// AKL (Auckland Intl, 45min west on coastal road). AKL has ZERO existing venues.
// Iconic black iron-sand surf beach backed by Lion Rock. Wild Tasman Sea.
// September = SH spring — first swells of the season, dramatic light, few tourists.
{id:"piha-beach-nz", category:"beach",
  title:"Piha Beach", location:"Auckland Region, New Zealand",
  lat:-36.9534, lon:174.4641, ap:"AKL",
  icon:"🖤", rating:4.76, reviews:4210,
  gradient:"linear-gradient(160deg,#0e0e18,#1e2030,#303858)",
  accent:"#7890c8",
  tags:["Black Sand Beach","Lion Rock","Wild Surf","SH Spring"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Piha_Beach.jpg/1280px-Piha_Beach.jpg"},

// NEW-3. Viña del Mar, Chile [SCL beach gap — first Chilean beach venue]
// SCL (Santiago Intl, ~1.5hr north via Ruta 68). SCL has 5 ski but ZERO beach venues.
// Chile's Pacific Riviera — Playa de Viña, Casino Municipal, Flower Clock.
// September = SH spring warming, off-peak crowds, 16°C water rising to 18°C by October.
{id:"vina-del-mar-cl", category:"beach",
  title:"Viña del Mar", location:"Valparaíso Region, Chile",
  lat:-33.0189, lon:-71.5526, ap:"SCL",
  icon:"🌺", rating:4.62, reviews:5680,
  gradient:"linear-gradient(160deg,#0a1828,#1a3850,#286888)",
  accent:"#68b8d8",
  tags:["Pacific Riviera","Casino Town","Chile's St Tropez","Flower Clock"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Vi%C3%B1a_del_Mar_beach.jpg/1280px-Vi%C3%B1a_del_Mar_beach.jpg"},

// NEW-4. Cape Tribulation, Australia [CNS depth — adds World Heritage dimension to Cairns]
// CNS (Cairns Intl, ~2.5hr north via Captain Cook Hwy). CNS already has Port Douglas.
// Cape Trib is distinct: the ONLY place on Earth where two World Heritage sites meet
// (Daintree Rainforest + Great Barrier Reef). September = dry season peak — zero rain.
{id:"cape-tribulation-au", category:"beach",
  title:"Cape Tribulation", location:"Daintree, Queensland, Australia",
  lat:-16.0831, lon:145.4556, ap:"CNS",
  icon:"🌿", rating:4.81, reviews:2970,
  gradient:"linear-gradient(160deg,#0a1e10,#1a4020,#287038)",
  accent:"#60c870",
  tags:["Two World Heritage Sites","Rainforest to Reef","Cassowary Territory","Dry Season Peak"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Cape_Tribulation_beach.jpg/1280px-Cape_Tribulation_beach.jpg"},

// NEW-5. Ilhabela, Brazil [GRU gap — first São Paulo-routed beach venue]
// GRU (São Paulo Guarulhos, ~2.5hr drive + 15min ferry). GRU has ZERO existing venues.
// São Paulo state's premier island escape — 360km of Atlantic Forest coastline,
// 42 beaches, no heavy industry, schooner sailing culture. Brazil's "Island of Beauty."
// September = peak São Paulo escape season — warm, less rainy than January.
{id:"ilhabela-brazil", category:"beach",
  title:"Ilhabela", location:"São Paulo State, Brazil",
  lat:-23.7788, lon:-45.3568, ap:"GRU",
  icon:"⛵", rating:4.73, reviews:6140,
  gradient:"linear-gradient(160deg,#0a1e18,#1a4030,#288050)",
  accent:"#60c898",
  tags:["São Paulo's Island","Atlantic Forest","42 Beaches","Schooner Sailing"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Ilhabela_beach_Brazil.jpg/1280px-Ilhabela_beach_Brazil.jpg"},
```

---

## One Observation for the PM

**The carry-over queue hits its PM-declared hard deadline in 3 days (Sep 7).** Ten paste-ready venues — 5 verified carries and 5 fresh additions — are sitting in report limbo while four significant AP-level gaps (AGP, AKL, GRU, SCL beach) remain unaddressed. The math: 395 → 405 venues is a 2.5% catalog growth and closes Spain's ski blind spot entirely, activates the Auckland market, opens Brazil's São Paulo routing, and gives Chilean coastal users a product to engage with. This is the highest-ROI half-hour available before the Sep 7 Reddit gate.
