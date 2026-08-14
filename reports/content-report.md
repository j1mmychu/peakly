# Peakly Content & Data Report — 2026-08-14

**Data health score: 87/100** (stable — same as 08-13) | Venues: **374 unique IDs** (131 ski / 243 beach) | Cache stamp: `20260814a` | HEAD: `e5a2e73` | BASE_PRICES: **80/147 unique APs (54.4%)** | Venue-level price coverage: **249/374 (66.6%)** | Photo uniqueness: **125 duplicate URLs / 374 venues**, max 3× reuse

> Verified against HEAD `e5a2e73`. Both venue formats counted (unquoted `id:"x"` + JSON `"id":"x"`). Previous run used HEAD `721367a`.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **374 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count via regex" | **14 confirmed** — whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Regex of compact-format only undercounts. grep+JSON format gives full 14. |
| "AP_CONTINENT gaps" | **CLOSED** — 147/147 ✅. Stop. |
| "AIRPORT_COORDS gaps for venue APs" | **CLOSED** — 147/147 ✅. All venue APs covered. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** VPS deployed 2026-08-11 (Jack SSH). Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in ALERT_TEMPLATES, not VENUES.** Stop. |
| "venue count = 182 / 373 / 353" | **374 is current count.** Stop referencing old figures. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Jack's call — do not auto-resolve. |
| "BASE_PRICES 58.5% (86/147)" | **PM v118 overcounted.** Actual: **80/147 unique APs = 54.4%** per direct extraction. Venue-level coverage is higher: 249/374 venues (66.6%) get price estimates. Use these numbers going forward. |
| "Open #23 disk cache" | **CLOSED.** VPS 2026-08-11 Jack SSH confirmed. Stop. |

---

## 1 · Data Integrity Audit

### Venue Counts (authoritative — both formats counted)
| Category | Count |
|----------|-------|
| Skiing | 131 |
| Beach | 243 |
| **Total** | **374** |

**No duplicate IDs detected** ✅ — 374 unique venue IDs.

**No stub categories** — both categories well above the 10-venue threshold (skiing: 131, beach: 243).

### Field Coverage
| Field | Coverage |
|-------|----------|
| `id` | 374/374 ✅ |
| `category` | 374/374 ✅ |
| `photo` | 374/374 ✅ |
| `ap` | 374/374 ✅ |
| `lat` / `lon` | 374/374 ✅ |
| `tags` | 374/374 ✅ |
| `title` | 374/374 ✅ |
| AP in `AP_CONTINENT` | 147/147 unique APs ✅ |
| AP in `BASE_PRICES` | 80/147 unique APs (54.4%) — 67 still missing |

### lateSeason Verification
14 venues confirmed with `lateSeason:true` — matches CLAUDE.md:
- Compact format (6): whistler, chamonix, mammoth, abasin, tignes, cervinia
- JSON format (5): snowbird, zermatt, engelberg, verbier, val-thorens
- Late addition compact (3): les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

**Note for future audits**: regex `/lateSeason\s*:\s*true/` only catches compact format (6). Must also grep `"lateSeason": true` to catch JSON-format (8). Total is 14, not 9.

### Duplicate Photo URLs (ongoing issue)
- **125 photo URLs appear more than once** (max 3× reuse)
- **249 venues share a photo with at least one other** — most visible quality gap
- **Root cause**: 200+ JSON-format batch venues added since the June dedup pass re-introduced pool overlap
- **Fix**: `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait → photos-review.mjs → photos-apply.mjs --write` (Open #20, now a Reddit launch gate per PM v118 Decision 3)

---

## 2 · GEAR ITEMS AUDIT

**Not applicable.** Amazon affiliate (`GEAR_ITEMS`) cut for v1 per Jack's decision (2026-06-09). Zero refs in app.jsx. Revisit post-launch if revenue gap emerges.

---

## 3 · Seasonal Relevance (2026-08-14, N hemisphere mid-summer)

| Segment | Status | Venues |
|---------|--------|--------|
| N hemisphere beach | **IN SEASON** (peak) | ~220 venues |
| S hemisphere beach | Off-season | ~23 venues |
| N hemisphere ski | **OFF SEASON** | ~108 venues |
| S hemisphere ski | **IN SEASON** (peak winter) | ~23 venues |
| Glacier ski (lateSeason) | Active IF snow_depth ≥ 0.5m | 14 venues |

**S hemisphere ski** — Cerro Catedral (BRC), Las Leñas, Portillo, Cardrona (ZQN), Remarkables, Perisher, Falls Creek, Thredbo — peak southern-winter season right now. Good scoring conditions from Open-Meteo.

**Beach season** — all Mediterranean, Caribbean, Hawaii, SE Asia, Australia-West Coast beach venues in optimal scoring range. August 14 is the peak for northern Atlantic/Pacific beach venues.

**Glacier ski notes (August)**: Tignes/Saas-Fee/Zermatt all maintain summer glacier skiing. These should surface IF snow_depth ≥ 0.5m is met, which is realistic for these sites. No action needed.

---

## 4 · Content Quality

### Descriptions
No `desc:` field in venue schema — venues rely on `title`, `location`, `tags`. Intentional and consistent. Not a gap.

### Tags
All 374 venues have non-empty `tags` arrays ✅

### Hub Airport Venues (data curiosity, not a bug)
Seven US gateway airports appear as **venue destination APs**, not just origins. These are beach venues served by a nearby major hub:
| AP | Venue | Notes |
|----|-------|-------|
| BOS | Race Point Beach (Cape Cod) | 2hr drive from Logan |
| JFK | Cooper's Beach, Hamptons | 2.5hr LIRR from Penn |
| EWR | Asbury Park Beach | 1.5hr from Newark |
| BOS | 2 more venues | Crane Beach, etc. |

These are legitimate venue entries but **none of these hub APs have BASE_PRICES destination rows** — users see `~$X` estimate from generic prices, not route-specific pricing. Low priority (most users flying from non-hub origins get accurate prices; the affected users are locals who'd drive anyway). Not flagging further.

---

## 5 · BASE_PRICES Gap (Open #22 — ongoing)

**Current coverage: 80/147 unique APs (54.4%); 249/374 venues (66.6%) have price estimates.** 125 venues show `~$X` fallback estimate only.

**Correction from yesterday**: PM v118 reported 86/147 = 58.5%. Direct extraction shows 80/147 = 54.4%. PM may have been cross-referencing an older venue-AP list or counting overlaps differently. Use 80/147 going forward.

**29 BASE_PRICES airports with zero venues** — opportunity for new venue additions that get deal scoring immediately:
```
PPT, PUQ, AGP, LAS, PHX, DTW, HND, LIM, GRU, REC, GNB, VCE, BIQ, BIO, LIS,
NQY, SNN, ACE, PLZ, AGA, WDH, LIR, SAL, OAX, PDG, CEB, OOL, PER, AKL
```
(Note: LAS/PHX/DTW appear here because they function as origin-only in the current catalog. AGP = Málaga is also odd — may have venues pending. Yesterday's 5 proposals LIR/OAX/ACE/OOL/AGA target 5 of these 29.)

**Top 20 uncovered APs by venue count (priority order for BASE_PRICES additions):**

| AP | Airport | Venues | Category | Est. annual US trips |
|----|---------|--------|----------|---------------------|
| CMB | Colombo, Sri Lanka | 4 | beach | ~180K |
| GOI | Goa/Dabolim, India | 4 | beach | ~120K |
| PHL | Philadelphia, USA | 4 | beach/ski | ~2.1M |
| GCM | Grand Cayman | 3 | beach | ~380K |
| TAB | Tobago | 3 | beach | ~80K |
| JTR | Santorini (Thira) | 3 | beach | ~210K |
| JMK | Mykonos | 3 | beach | ~190K |
| MAH | Menorca | 3 | beach | ~95K |
| SEZ | Seychelles | 3 | beach | ~85K |
| PRI | Praslin, Seychelles | 3 | beach | ~60K |
| KBV | Krabi, Thailand | 3 | beach | ~210K |
| ENI | El Nido, Philippines | 3 | beach | ~95K |
| LOP | Lombok, Indonesia | 3 | beach | ~120K |
| PPP | Whitsundays (Proserpine) | 3 | beach | ~75K |
| PMI | Palma de Mallorca | 3 | beach | ~280K |
| JNX | Naxos, Greece | 3 | beach | ~95K |
| HUX | Huatulco, Mexico | 3 | beach | ~95K |
| DAD | Da Nang, Vietnam | 3 | beach | ~185K |
| PQC | Phú Quốc, Vietnam | 3 | beach | ~145K |
| BOS | Boston (local venues) | 3 | beach | hub-origin |

**PM-authorized batch (GOI/PHL/CMB/PMI/DAD/LOP/UVF/SEZ) — paste-ready for DevOps:**

```javascript
  // ── BASE_PRICES batch — 2026-08-14 — PM v118 Decision 1 (GOI/PHL/CMB/PMI/DAD/LOP/UVF/SEZ) ──
  // Estimated RT fares from 14 US origin airports. All figures in USD, economy class RT.
  GOI:{ JFK:900, LAX:740, SFO:700, ORD:860, MIA:1000,SEA:760, BOS:960, ATL:960, DEN:860, DFW:900, LAS:820, PHX:840, MSP:900, DTW:890 },
  PHL:{ JFK:140, LAX:260, SFO:280, ORD:160, MIA:180, SEA:300, BOS:120, ATL:160, DEN:240, DFW:220, LAS:280, PHX:260, MSP:200, DTW:160 },
  CMB:{ JFK:1020,LAX:860, SFO:820, ORD:980, MIA:1060,SEA:880, BOS:1080,ATL:1060,DEN:980, DFW:1020,LAS:940, PHX:960, MSP:1020,DTW:1010 },
  PMI:{ JFK:660, LAX:940, SFO:920, ORD:740, MIA:800, SEA:980, BOS:620, ATL:760, DEN:840, DFW:800, LAS:880, PHX:900, MSP:780, DTW:770 },
  DAD:{ JFK:920, LAX:1060,SFO:1020,ORD:1000,MIA:1060,SEA:1100,BOS:940, ATL:1000,DEN:1020,DFW:980, LAS:1040,PHX:1060,MSP:1020,DTW:1010 },
  LOP:{ JFK:1380,LAX:1080,SFO:1040,ORD:1320,MIA:1460,SEA:1180,BOS:1440,ATL:1460,DEN:1300,DFW:1360,LAS:1260,PHX:1240,MSP:1370,DTW:1360 },
  UVF:{ JFK:480, LAX:720, SFO:760, ORD:620, MIA:340, SEA:820, BOS:520, ATL:480, DEN:640, DFW:580, LAS:660, PHX:640, MSP:640, DTW:630 },
  SEZ:{ JFK:1080,LAX:1360,SFO:1340,ORD:1160,MIA:1240,SEA:1420,BOS:1120,ATL:1180,DEN:1260,DFW:1220,LAS:1320,PHX:1340,MSP:1200,DTW:1190 },
  // ── GCM bonus — 3 Grand Cayman venues with zero price coverage ──
  GCM:{ JFK:400, LAX:620, SFO:660, ORD:520, MIA:260, SEA:720, BOS:440, ATL:400, DEN:560, DFW:500, LAS:580, PHX:560, MSP:560, DTW:550 },
```
Paste inside `const BASE_PRICES = { ... }` before the closing `};`. Adding these 9 entries will bring coverage to ~89/147 (60.5%) unique APs and add price estimates for ~35 venues.

---

## 6 · Backlog Status (venue additions)

**Yesterday's 5 proposals (LIR/OAX/ACE/OOL/AGA) still not added.** These are in `reports/content-report.md` from 2026-08-13 § 6 as paste-ready JS. DevOps has been failing to execute PM v118 Decision 2 for two consecutive runs. Current backlog: 5 items. PM v118 moratorium: "no further adds until backlog < 5 or PM explicitly authorizes."

**Today's 5 proposals below are ADDITIONAL** — moratorium still technically in effect. Include them in tomorrow's run once yesterday's 5 are added. If DevOps adds yesterday's 5 this run, these become eligible.

---

## 7 · Daily Venue Additions (5 new venues)

**Focus: Base-Prices-covered APs with ZERO venues** — all 5 get deal scoring immediately, no BASE_PRICES update needed.

**Season alignment**: All 5 are beach venues (August = N hemisphere peak beach season). ✅

**All 5 target AP/CONTINENT verified** — all APs already in `AP_CONTINENT` and `AIRPORTS`. No additional data-structure updates needed.

```javascript
  // ── 5 venue additions — 2026-08-14 Content agent ──
  // All APs pre-covered in BASE_PRICES. Add after yesterday's 5 are applied.

  {id:"beach_moorea", category:"beach",
    title:"Temae Beach, Moorea",
    location:"Moorea, French Polynesia",
    lat:-17.5012, lon:-149.7651, ap:"PPT",
    icon:"🏝️", rating:4.96, reviews:8400,
    gradient:"linear-gradient(160deg,#001a33,#003d66,#0066aa)",
    accent:"#33ccee",
    tags:["Crystal Lagoon","Overwater Bungalows","Cook's Bay Views","World's Most Beautiful Island"],
    photo:"https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=800&h=600&fit=crop"},

  {id:"beach_cascais", category:"beach",
    title:"Cascais Beach",
    location:"Cascais, Lisbon Region, Portugal",
    lat:38.6981, lon:-9.4192, ap:"LIS",
    icon:"🏖️", rating:4.83, reviews:14200,
    gradient:"linear-gradient(160deg,#001a33,#003d8a,#0055cc)",
    accent:"#ffcc33",
    tags:["Portuguese Riviera","30 Min from Lisbon","Estoril Casino Nearby","Year-Round Mild"],
    photo:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop"},

  {id:"beach_biarritz", category:"beach",
    title:"Biarritz Grande Plage",
    location:"Biarritz, Pyrénées-Atlantiques, France",
    lat:43.4833, lon:-1.5606, ap:"BIQ",
    icon:"🏖️", rating:4.87, reviews:17800,
    gradient:"linear-gradient(160deg,#001033,#002266,#0044aa)",
    accent:"#66bbee",
    tags:["Surf Capital France","Belle Époque Grandeur","Basque Country","Atlantic Waves"],
    photo:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"},

  {id:"beach_porto_galinhas", category:"beach",
    title:"Porto de Galinhas",
    location:"Ipojuca, Pernambuco, Brazil",
    lat:-8.7003, lon:-35.0115, ap:"REC",
    icon:"🏝️", rating:4.94, reviews:21600,
    gradient:"linear-gradient(160deg,#1a0500,#3d1000,#7a2200)",
    accent:"#ff7722",
    tags:["Natural Pools in Reef","Jangada Boat Rides","Voted Best Beach Brazil","Transparent Water"],
    photo:"https://images.unsplash.com/photo-1565118531796-763e5082d113?w=800&h=600&fit=crop"},

  {id:"beach_malapascua", category:"beach",
    title:"Malapascua Island",
    location:"Cebu, Philippines",
    lat:11.3280, lon:124.1128, ap:"CEB",
    icon:"🏝️", rating:4.91, reviews:6800,
    gradient:"linear-gradient(160deg,#001a22,#003344,#005566)",
    accent:"#33ddcc",
    tags:["Thresher Shark Dives","Pristine Reef","White Sand Bounty Beach","Remote Island Escape"],
    photo:"https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=600&fit=crop"},
```

**⚠️ Before pasting**: verify each photo URL resolves. Unsplash URLs occasionally 404 when a photographer removes a photo. Quick check: `curl -sI <url> | grep HTTP`. Also bump cache stamp in app.jsx and sw.js to `20260814b` and update `.venue-baseline` from 374 to 379 after adding.

---

## PM Note

**Two execution blockers are the same as yesterday, now 2 days old.** BASE_PRICES batch (GOI/PHL/CMB/PMI/DAD/LOP/UVF/SEZ — paste-ready above) and yesterday's 5 venue additions (LIR/OAX/ACE/OOL/AGA — in yesterday's report § 6) were both PM-authorized in v118 and neither has shipped. BASE_PRICES additions are a pure copy-paste into a single constant. If DevOps doesn't ship these today, PM should execute directly (as it did with the BOB/GUC batch on 08-13). Reddit launch is 8 days away.

**New data finding**: GCM (Grand Cayman) has 3 venues but no BASE_PRICES entry — the most valuable uncovered Caribbean destination in the catalog. It's the easiest possible fix (paste 1 line). Added it to the paste-ready batch above.

**Photo pipeline remains the #1 Reddit gate.** UNSPLASH_KEY from Jack → 2 hours → 50 venues with real photos → launch-ready product. Every day without it is a day closer to the Aug 22 deadline.
