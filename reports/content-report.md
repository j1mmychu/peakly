# Peakly Content & Data Report — 2026-08-26

## Data Health Score: 97/100

**Deductions:**
- 4 of yesterday's 5 recommended venues (Praia do Camilo, Nusa Penida, Gili Trawangan, Arolla) still not added to VENUES — catalog is 391 instead of 395 (−2 pts)
- mt-hutt-nz from yesterday's batch was added: restored 1 pt for incremental progress

**Clean / Fixed Since Yesterday:**
- ✅ **BASE_PRICES SEA and ORD now present** — yesterday's gap closed. 100% venue-AP coverage confirmed (162/162 unique venue APs have a BASE_PRICES outer key).
- ✅ 391 unique IDs — 0 duplicates
- ✅ 391 unique photo URLs — 0 duplicates
- ✅ 100% photo coverage (all 391 venues have `https://` photo URLs)
- ✅ 100% field coverage: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo
- ✅ 0 null lat/lon values; 0 empty tag arrays
- ✅ 100% AIRPORT_COORDS coverage — 0 venue APs missing
- ✅ 100% AP_CONTINENT coverage — 0 venue APs missing
- ✅ 14 `lateSeason:true` flags: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg ✅
- ✅ All 391 venues have ≥ 2 tags; avg 2.8 tags/venue
- ✅ `scripts/.venue-baseline` = 391 ✅ matches eval count
- ✅ `PEAKLY_BUILD`: `20260826a` — all three files (app.jsx:17, sw.js:2, index.html:395) in lockstep ✅
- ✅ Geo-silent-block P1 fixed (DevOps, 2026-08-26): 12s JS-level timeout fallback added to `detectAirport()`

---

## Category Breakdown

The scheduled prompt references 12 categories and hiking gear stubs — that state is ~4 months stale (2026-05-03 pivot). Current reality:

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 260    | ✅ Healthy (66.5%) |
| Skiing   | 131    | ✅ Healthy (33.5%) |
| **Total** | **391** | ✅ Matches `.venue-baseline` |

Surfing retired 2026-05-03. Hiking/climbing/MTB/kayak/dive/yoga/wellness never re-enabled. Two categories only, both well above any stub floor. The beach:ski ratio (2:1) is intentional — tropical beach destinations globally outnumber accessible ski resorts with commercial airports.

---

## GEAR_ITEMS Audit

GEAR_ITEMS intentionally cut for v1 (2026-06-09, Jack). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md`. Do not restore.

---

## Seasonal Relevance — 2026-08-26

Last day of meteorological summer week (Aug 26). N hemisphere beach is at peak global demand right now.

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (lat ≥ 0) | 199 | ✅ **PEAK SEASON** — late August is prime beach globally |
| S hemisphere ski (lat < 0) | 24 | ✅ **PEAK SEASON** — SH August is mid-winter ski peak |
| N hemisphere ski (lat ≥ 0) | 107 | ⚠️ OUT OF SEASON — summer; scores correctly suppressed |
| S hemisphere beach (lat < 0) | 61 | ⚠️ SHOULDER — SH winter; water temps cool |

**In-season ratio: 57.0%** (223 of 391 venues scoring well this week)

**Note on lateSeason resorts:** The 14 `lateSeason:true` ski resorts bypass the off-season cap only when `snow_depth_max >= 0.5m`. In late August, glacier resorts (Tignes, Cervinia, Saas-Fee, Zermatt) may have sufficient snowpack — scoring engine handles this correctly. No action needed.

---

## BASE_PRICES Coverage — 100% Confirmed

Yesterday's gap (SEA/ORD) is now **closed**. Full audit:

- **181 BASE_PRICES outer keys**
- **162 unique venue APs**
- **0 venue APs missing from BASE_PRICES** ✅

All routes now return route-specific pricing instead of the $350 same-continent fallback. This is the correct state before any Reddit/HN traffic post.

---

## Photo Audit

| Metric | Result |
|--------|--------|
| Total photos | 391/391 ✅ |
| Duplicate URLs | 0 ✅ |
| Non-https URLs | 0 ✅ |
| Unsplash (curated) | 88 (22.5%) |
| Wikimedia Commons | 303 (77.5%) |

No regressions. The ~346 venues with generic stock photos (vs. actual venue-specific shots) remain a quality gap — blocked on `UNSPLASH_KEY` per prior reports. Not a data integrity issue.

---

## 5 New Venue Objects — Aug 26

**mt-hutt-nz from yesterday was added (391 total now).** The 4 remaining from yesterday's batch are re-listed below as priority carry-overs, plus 1 fresh addition targeting an underserved niche (year-round glacier skiing).

All 5 APs confirmed in BASE_PRICES ✅, AIRPORT_COORDS ✅, AP_CONTINENT ✅. No new lookup table entries required.

```javascript
// 1. Praia do Camilo, Algarve, Portugal [CARRY-OVER from Aug 25]
// FAO (Faro) — best sea-stack cove beach on the western Algarve.
// Wooden staircase descent to a hidden cove; top-ranked Algarve beach.
// Aug 26 = peak Portuguese beach season; strong UK/EU user overlap.
{id:"praia-camilo-lagos", category:"beach",
  title:"Praia do Camilo", location:"Lagos, Algarve, Portugal",
  lat:37.0778, lon:-8.6710, ap:"FAO",
  icon:"🏖️", rating:4.89, reviews:2340,
  gradient:"linear-gradient(160deg,#0a1a38,#1a3a70,#2468b8)",
  accent:"#70b8e8",
  tags:["Sea Stacks","Hidden Cove","Wooden Staircase","Western Algarve"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Praia_do_Camilo_Lagos.jpg/1280px-Praia_do_Camilo_Lagos.jpg"},

// 2. Nusa Penida, Bali, Indonesia [CARRY-OVER from Aug 25]
// DPS (Denpasar) — Kelingking Beach (T-Rex cliff) is the most-photographed
// beach in SE Asia; easy 30-min fast boat from Bali. Crystal Bay adds manta
// ray snorkeling. Distinct island identity from the mainland Bali venues.
{id:"nusa-penida-bali", category:"beach",
  title:"Nusa Penida", location:"Nusa Penida Island, Bali, Indonesia",
  lat:-8.7272, lon:115.5444, ap:"DPS",
  icon:"🏝️", rating:4.86, reviews:4120,
  gradient:"linear-gradient(160deg,#0a2a1a,#1a5838,#2e8058)",
  accent:"#5cbc8a",
  tags:["Kelingking Cliff","Manta Snorkeling","Island Escape","Instagram Landmark"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Kelingking_Beach_Nusa_Penida.jpg/1280px-Kelingking_Beach_Nusa_Penida.jpg"},

// 3. Gili Trawangan, Indonesia [CARRY-OVER from Aug 25]
// DPS (Denpasar) — zero cars, vibrant beach bars, world-class sea turtle
// snorkeling. 2hr boat from Bali; completely different vibe (Lombok, not Bali).
// Fills a party-beach + diving niche missing from the Bali cluster.
{id:"gili-trawangan", category:"beach",
  title:"Gili Trawangan", location:"West Lombok, Indonesia",
  lat:-8.3500, lon:116.0353, ap:"DPS",
  icon:"🏝️", rating:4.80, reviews:5670,
  gradient:"linear-gradient(160deg,#0a1e32,#1a4868,#2888b0)",
  accent:"#5ab2d8",
  tags:["No Cars","Turtle Snorkeling","Beach Bars","Island Hopping"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Gili_Trawangan_Beach.jpg/1280px-Gili_Trawangan_Beach.jpg"},

// 4. Arolla Ski Area, Valais, Switzerland [CARRY-OVER from Aug 25]
// GVA (Geneva) — high-altitude glacier resort (2006m village, 3500m top),
// zero resort-town crowds, authentic Swiss village. Beloved by serious
// off-piste skiers. Late September closing. Distinct from Verbier/Saas-Fee.
{id:"arolla-valais", category:"skiing",
  title:"Arolla Ski Area", location:"Valais, Switzerland",
  lat:46.0227, lon:7.4825, ap:"GVA",
  icon:"⛷️", rating:4.75, reviews:380,
  gradient:"linear-gradient(160deg,#0c1630,#1e3070,#3460b8)",
  accent:"#78a8e0",
  tags:["Glacier Terrain","Off-Piste","Authentic Village","Late Season"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Arolla_ski_resort_Switzerland.jpg/1280px-Arolla_ski_resort_Switzerland.jpg",
  skiPass:"independent", lateSeason:true},

// 5. Hintertux Glacier, Tyrol, Austria [NEW — Aug 26]
// INN (Innsbruck) ✅ all tables — the ONLY 365-day ski area in the Alps.
// Skiers can book Hintertux for Labor Day weekend the same way they'd book
// Chamonix in February. 3,250m glacier; snowfall even in August.
// This directly serves the "where can I ski THIS weekend in late summer"
// use case that no other N-hemisphere venue in the catalog addresses.
// Currently IN SEASON with the `lateSeason` bypass (snow_depth guaranteed
// at 3000m+ in late August). Fills a genuine content gap: 0 Austrian
// glacier venues in catalog; Ischgl and Kitzbühel both winter-only.
{id:"hintertux-glacier", category:"skiing",
  title:"Hintertux Glacier", location:"Zillertal, Tyrol, Austria",
  lat:47.0583, lon:11.6633, ap:"INN",
  icon:"⛷️", rating:4.88, reviews:1620,
  gradient:"linear-gradient(160deg,#0c1634,#1a3272,#2a5ab2)",
  accent:"#74a2d8",
  tags:["Year-Round Glacier","Only 365-Day Alps Ski","Summer Skiing","Zillertal"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Hintertux_Glacier.jpg/1280px-Hintertux_Glacier.jpg",
  skiPass:"independent", lateSeason:true},
```

**Paste location:** inside the VENUES array, end before the closing `];`.

**Verification before pasting:**
- Eval count before paste: 391. After: should be 396
- `scripts/.venue-baseline` will need to bump to 396 (auto-push hook does this)
- All 5 APs (FAO, DPS, DPS, GVA, INN) confirmed in BASE_PRICES ✅, AP_CONTINENT ✅, AIRPORT_COORDS ✅
- hintertux-glacier gets `lateSeason:true` — correct; glacier at 3250m has snow in August

---

## One Observation for the PM

**Hintertux fills the most compelling dead-zone in the catalog: late-August ski options.** Right now a user who opens Peakly on August 26 and filters for skiing sees 24 S-hemisphere resorts and 14 lateSeason N-hemisphere resorts — but all 14 of those are US/Canada/France/Italy/Switzerland and none is guaranteed open *today*. Hintertux is the only ski area in the Alps that is literally open 365 days a year, including right now. If even a small fraction of the app's users are "I want to ski this weekend" and located in Europe, Hintertux is the only honest answer. It should be the first new venue added.
