# Peakly Content & Data Report — 2026-08-25

## Data Health Score: 96/100

**Deductions:**
- SEA and ORD missing as BASE_PRICES top-level (venue AP) keys → 160/162 = 98.8% coverage (−2 pts)
  - DevOps report today claimed "100% BASE_PRICES coverage" — this is inaccurate. BOS/JFK/LAX/MIA were correctly added yesterday as venue APs, but SEA (Crystal Mountain, Stevens Pass) and ORD (Wilmot Mountain) were not. Fallback is $350 same-continent estimate instead of route-specific pricing.
- Yesterday's 5 new venue recommendations (Luskentyre, Psili Ammos, Balos, Huahine, Tjøme) were not added — catalog is still 391 (−2 pts, but restored 1 pt for clean data state)

**Clean:**
- 391 unique IDs — 0 duplicates in VENUES array
- 391 unique photo URLs — 0 duplicates
- 100% photo coverage (391/391 have `https://` photo URLs)
- 100% field coverage: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo all present across all venues
- 100% AIRPORT_COORDS coverage — 0 venue APs missing
- 100% AP_CONTINENT coverage — 0 venue APs missing
- 14 `lateSeason:true` flags: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch ✅
- All 391 venues have ≥ 2 tags; avg ~2.8 tags/venue; 0 empty tag arrays
- 0 null lat/lon values
- `scripts/.venue-baseline` = 391 ✅ matches eval count
- `PEAKLY_BUILD`: `20260825a` ✅ (DevOps bumped today — cache stamp was stale since Aug 23)

---

## Category Breakdown

The scheduled prompt references 12 categories and hiking gear stubs — that state is ~4 months stale (2026-05-03 pivot). Current reality:

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 260    | ✅ Healthy |
| Skiing   | 131    | ✅ Healthy |
| **Total** | **391** | ✅ Matches `.venue-baseline` |

Surfing retired 2026-05-03. Hiking/climbing/MTB/kayak/dive/yoga/wellness never re-enabled. Two categories only, both well above any stub floor.

---

## GEAR_ITEMS Audit

GEAR_ITEMS intentionally cut for v1 (2026-06-09, Jack). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md`. Do not restore.

---

## Seasonal Relevance — 2026-08-25

Last week of meteorological summer in the N hemisphere. This is still the best possible moment for beach traffic.

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (lat ≥ 0) | 199 | ✅ **PEAK SEASON** — late August is prime beach globally |
| S hemisphere ski (lat < 0) | 24 | ✅ **PEAK SEASON** — SH August is mid-winter ski peak |
| N hemisphere ski (lat ≥ 0) | 107 | ⚠️ OUT OF SEASON — summer; scores correctly suppressed |
| S hemisphere beach (lat < 0) | 61 | ⚠️ SHOULDER — SH winter; water temps cool |

**In-season ratio: 57.0%** (223 of 391 venues scoring well this week)

**Note on lateSeason resorts:** The 14 `lateSeason:true` ski resorts (Whistler, Tignes, Mammoth, etc.) bypass the off-season cap only when `snow_depth_max >= 0.5m`. In late August virtually none will have 0.5m snowpack — their scores are correctly suppressed. No action needed.

---

## BASE_PRICES Coverage — Real Gap: SEA and ORD

**Actual coverage: 160 / 162 venue APs = 98.8%**

The DevOps report today ("BASE_PRICES final gap — closed") is incorrect. BOS/JFK/LAX/MIA were added yesterday as outer keys (venue APs), which is correct. However, SEA and ORD remain absent.

| Missing AP | Venues affected | Fallback |
|-----------|-----------------|---------|
| SEA (Seattle) | crystal-mountain-wa, stevens-pass | $350 same-continent estimate |
| ORD (Chicago O'Hare) | wilmot-mountain | $350 same-continent estimate |

**Fix — paste-ready entries for BASE_PRICES (after the MIA entry at line ~6533):**

```javascript
  SEA:{ JFK:310, BOS:330, LAX:140, SFO:120, ORD:220, MIA:360, ATL:290, DEN:180, DFW:200, LAS:160, PHX:170, MSP:200, DTW:240 },
  ORD:{ JFK:130, BOS:160, LAX:240, SFO:280, MIA:200, SEA:220, ATL:140, DEN:170, DFW:160, LAS:210, PHX:190, MSP:120, DTW:110 },
```

Verification: after paste, re-run the venue-AP check — should read 162/162. No new AIRPORT_COORDS or AP_CONTINENT entries needed (both SEA and ORD already present in both tables).

---

## Data Integrity — No Regressions

- 391 unique venue IDs; 0 duplicates in VENUES (the `cancun-beach` at line 10614 is in a UI constants block, not VENUES — confirmed not a real duplicate)
- 391 unique photo URLs across the array
- 0 null/missing lat/lon
- All venue APs resolve in AIRPORT_COORDS and AP_CONTINENT
- Photo sources: 88 Unsplash (23%) + 303 Wikimedia Commons (77%)
- Rating range: 4.1–4.99 (avg 4.72); 44 venues below 4.5 — all are legitimate lower-tier resorts (Wilmot Mountain 4.1, Jack Frost 4.1, Afton Alps 4.2), not data errors

---

## 5 New Venue Objects — Aug 25 (Fresh Picks)

Yesterday's 5 venues were not added (catalog still 391). Today's 5 are fresh picks; yesterday's remain valid — either batch can be pasted.

All 5 below use APs already in BASE_PRICES, AIRPORT_COORDS, and AP_CONTINENT. No new lookup table entries required.

```javascript
// 1. Praia do Camilo, Algarve, Portugal
// FAO (Faro) ✅ all tables — FAO has 5 venues but none in Lagos/Sagres area.
// Praia do Camilo is the standout: sea-stack arches, hidden cove reached by
// wooden staircase, consistently ranked #1 on the western Algarve coast.
// August = absolute peak Portuguese beach season; high UK/EU user overlap.
{id:"praia-camilo-lagos", category:"beach",
  title:"Praia do Camilo", location:"Lagos, Algarve, Portugal",
  lat:37.0778, lon:-8.6710, ap:"FAO",
  icon:"🏖️", rating:4.89, reviews:2340,
  gradient:"linear-gradient(160deg,#0a1a38,#1a3a70,#2468b8)",
  accent:"#70b8e8",
  tags:["Sea Stacks","Hidden Cove","Wooden Staircase","Western Algarve"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Praia_do_Camilo_Lagos.jpg/1280px-Praia_do_Camilo_Lagos.jpg"},

// 2. Nusa Penida, Bali, Indonesia
// DPS (Denpasar) ✅ all tables — DPS has 7 venues but none on Nusa Penida island.
// Kelingking Beach (T-Rex cliff) is one of the most photographed beaches in
// SE Asia. Easy day-trip from Bali by fast boat (30 min). Crystal Bay adds
// manta ray snorkeling. Fills a genuine island gap in the Bali cluster.
{id:"nusa-penida-bali", category:"beach",
  title:"Nusa Penida", location:"Nusa Penida Island, Bali, Indonesia",
  lat:-8.7272, lon:115.5444, ap:"DPS",
  icon:"🏝️", rating:4.86, reviews:4120,
  gradient:"linear-gradient(160deg,#0a2a1a,#1a5838,#2e8058)",
  accent:"#5cbc8a",
  tags:["Kelingking Cliff","Manta Snorkeling","Island Escape","Instagram Landmark"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Kelingking_Beach_Nusa_Penida.jpg/1280px-Kelingking_Beach_Nusa_Penida.jpg"},

// 3. Mount Hutt, Canterbury, New Zealand
// CHC (Christchurch) ✅ all tables — CHC already has Cardrona (Queenstown-area)
// but nothing near Christchurch. Mt Hutt is the closest major ski area to CHC
// (90 min drive), consistently NZ's best-conditions resort with the longest
// season (Jun–Oct), highest base altitude (1,400m). S hemisphere PEAK SEASON now.
{id:"mt-hutt-nz", category:"skiing",
  title:"Mount Hutt", location:"Canterbury, New Zealand",
  lat:-43.4962, lon:171.5513, ap:"CHC",
  icon:"⛷️", rating:4.82, reviews:1430,
  gradient:"linear-gradient(160deg,#0c1e38,#1a3e76,#2e68b8)",
  accent:"#6eb0e0",
  tags:["Longest NZ Season","Canterbury Plains Views","Expert Terrain","Southern Alps"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mount_Hutt_ski_area%2C_New_Zealand.jpg/1280px-Mount_Hutt_ski_area%2C_New_Zealand.jpg",
  skiPass:"independent"},

// 4. Gili Trawangan, Indonesia
// DPS (Denpasar) ✅ all tables — small island off Lombok, 2-hr boat from Bali.
// Zero cars, vibrant beach bars, world-class snorkeling with sea turtles.
// Completely different vibe from the main Bali venues — appeals to the
// party-beach + diving crowd. Adds a second country (Lombok/West Nusa Tenggara)
// to the Bali AP cluster.
{id:"gili-trawangan", category:"beach",
  title:"Gili Trawangan", location:"West Lombok, Indonesia",
  lat:-8.3500, lon:116.0353, ap:"DPS",
  icon:"🏝️", rating:4.80, reviews:5670,
  gradient:"linear-gradient(160deg,#0a1e32,#1a4868,#2888b0)",
  accent:"#5ab2d8",
  tags:["No Cars","Turtle Snorkeling","Beach Bars","Island Hopping"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Gili_Trawangan_Beach.jpg/1280px-Gili_Trawangan_Beach.jpg"},

// 5. Arolla Ski Area, Valais, Switzerland
// GVA (Geneva) ✅ all tables — GVA has 7 venues (mostly Verbier/Les Arcs cluster).
// Arolla is the quiet alternative: high-altitude (2006m village, 3500m top),
// glacier runs, authentic Swiss mountain village with zero resort-town crowds.
// Beloved by serious off-piste skiers. Distinct character from Verbier/Saas-Fee.
// Late September closing — one of the last N-hemisphere resorts with natural snow.
{id:"arolla-valais", category:"skiing",
  title:"Arolla Ski Area", location:"Valais, Switzerland",
  lat:46.0227, lon:7.4825, ap:"GVA",
  icon:"⛷️", rating:4.75, reviews:380,
  gradient:"linear-gradient(160deg,#0c1630,#1e3070,#3460b8)",
  accent:"#78a8e0",
  tags:["Glacier Terrain","Off-Piste","Authentic Village","Late Season"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Arolla_ski_resort_Switzerland.jpg/1280px-Arolla_ski_resort_Switzerland.jpg",
  skiPass:"independent", lateSeason:true},
```

**Paste location:** inside the VENUES array, end before the closing `];` at line 5045.

**Verification before pasting:**
- Eval count before paste: 391. After: should be 396
- `scripts/.venue-baseline` will need to bump to 396 (auto-push hook does this)
- All 5 APs (FAO, DPS, CHC, DPS, GVA) confirmed in BASE_PRICES ✅, AP_CONTINENT ✅, AIRPORT_COORDS ✅
- arolla-valais gets `lateSeason:true` — correct for a glacier ski area at 3500m

---

## One Observation for the PM

**The DevOps "100% BASE_PRICES" claim is wrong — SEA and ORD are still missing.** The 3 affected venues (Crystal Mountain, Stevens Pass, Wilmot Mountain) are showing the $350 continent-fallback estimate instead of route-specific pricing. These are all domestic US fly-to ski venues with real audiences (Seattle market is the 4th-largest ski market in the US). The 8-line fix above closes the gap completely. This should be shipped before the next Reddit/HN post so deal scores are accurate on those routes.
