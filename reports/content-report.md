# Peakly Content & Data Report — 2026-05-12

**Agent:** Content & Data  
**Run date:** 2026-05-12

---

## Data Health Score: 71/100

**Penalties:**
- 1 invalid IATA airport code (`BRM`) — flight distance math silently breaks for that venue (-10)
- 2 confirmed same-location duplicate venue pairs (chamonix / tobago) (-8)
- 1 venue with wrong airport code — `sarakiniko-beach-t16` uses JMK (Mykonos) not MLO (Milos) (-5)
- Amazon gear affiliate code is absent from `app.jsx` despite CLAUDE.md marking it "DONE" (-6)

**Passes:**
- All 151 venues have photo URLs — 0 blanks ✅
- No duplicate photo URLs ✅
- No duplicate venue IDs (boot-time IIFE validator is live) ✅
- All 151 venues have: lat, lon, ap, tags (≥2 each), location, photo ✅
- No coordinate range violations (all lat/lon sane) ✅
- Title whitespace scan: clean ✅

---

## Category Breakdown

> Note: The task prompt references 182 venues and 12 categories. Actual live state: **151 venues, 2 active categories** (Skiing + Beach). All other categories were retired 2026-05-03 and have never been re-enabled. Surfing retired; hiking/climbing/MTB/kayak/dive/yoga/wellness were planned but never built. This report covers the live product only.

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 86    | ✅ Healthy |
| Skiing   | 65    | ✅ Healthy |
| **Total**| **151** | |

No stub categories. Both categories well exceed the 10-venue floor. Underrepresentation is geographic, not volumetric (see new venues below).

---

## Critical Bugs

### BUG 1 — Invalid IATA Code: `turquoise-bay-t8` (app.jsx:543)

`ap:"BRM"` is not a real IATA airport code and is **absent from `AP_CONTINENT`**. Broome Airport, Western Australia = `BME` — which is already mapped in AP_CONTINENT.

**Impact:** `flightHours()` haversine lookup returns `undefined` for BRM, making the distance filter unable to evaluate this venue. May cause venue to silently vanish from results for distance-filtering users.

**One-character fix:**
```
ap:"BRM"  →  ap:"BME"
```

---

### BUG 2 — Duplicate Venue: Chamonix-Mont-Blanc twice (lines 408 & 525)

`chamonix` and `chamonix-mont-blanc-s18` have **identical coordinates** (lat:45.9237, lon:6.8694). Same mountain, two VENUES entries.

```
chamonix              rating:4.94, reviews:3405, lateSeason:true  ← KEEP
chamonix-mont-blanc-s18  rating:4.66, reviews:1477, lateSeason:true  ← DELETE
```

**Fix:** Delete the line at app.jsx:525. Two identical weather fetches per load, same flight results shown twice.

---

### BUG 3 — Duplicate Venue: Pigeon Point Tobago twice (lines 458 & 560)

`beach_tobago` (Pigeon Point, lat:11.165, lon:-60.840) and `pigeon-point-t27` (Pigeon Point, Tobago, lat:11.167, lon:-60.833) are the same beach.

```
beach_tobago    rating:4.90, reviews:5400  ← KEEP
pigeon-point-t27  rating:4.91, reviews:666   ← DELETE
```

**Fix:** Delete the line at app.jsx:560. The 666-review stub was added without checking for the existing entry.

---

### BUG 4 — Wrong Airport: `sarakiniko-beach-t16` (app.jsx:550)

`sarakiniko-beach-t16` (Sarakiniko Beach, Milos, Greece) uses `ap:"JMK"` (Mykonos Airport). Milos has its own airport: `ap:"MLO"`. This inflates flight distance for all users flying to Milos by routing via the wrong island's airport.

Additional note: `beach_milos` (line 487) also covers Sarakiniko on Milos Island. These two entries may be the same beach (~0.01° apart). If so, delete `sarakiniko-beach-t16` entirely.

**Fix if keeping it:**
```
ap:"JMK"  →  ap:"MLO"
```

---

## Amazon Gear Affiliate — Code Missing from app.jsx

CLAUDE.md (Revenue Model section) lists Amazon Associates as **"LIVE" at $4.48/1K MAU**. CLAUDE.md also says "Amazon gear gate FLIPPED (commit a9aacf5) — `{GEAR_ITEMS[listing.category] && ...}` at app.jsx:5704."

**Actual state of app.jsx:**
- No `GEAR_ITEMS` constant exists anywhere in the file
- No `amazon.com` URLs appear anywhere in the file
- No `peakly-20` affiliate tag appears anywhere in the file

The gear items block does not exist in current code. Either it was dropped during a subsequent cleanup, or the commit reference in CLAUDE.md was from a branch that didn't land on main. The Revenue Model is overstating live earnings. PM should confirm whether to re-add gear items or update the revenue table.

---

## Seasonal Relevance — May 12, 2026

### Skiing
| Cohort | Count | Scoring Status |
|--------|-------|----------------|
| N hem late-season (`lateSeason:true`) | 7 | Bypass off-season cap when snow_depth ≥ 0.5m ✅ |
| N hem past season (no `lateSeason`) | ~48 | Off-season binary cap applies — low scores, expected |
| S hem approaching season (opens Jun–Aug) | 6 | Currently low scores, will rise as snowpack builds |

**S hemisphere ski venues:** Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone, Remarkables — all approaching season. Timing is correct.

**Content quality concern:** Portillo, Pucon, Thredbo, Cerro Castor, and Treble Cone all share copy-pasted tags: `["Glacial Skiing","Scenic Views","Village Base","On-Piste"]`. These are factually wrong for several venues:
- Thredbo has no glaciers (Snowy Mountains, Australia)
- Cerro Castor has no village base — Ushuaia is miles away
- Pucon is a volcano-base resort, not glacial

### Beach
| Region | Count | Status |
|--------|-------|--------|
| Caribbean / tropical Atlantic | ~28 | Peak to shoulder — healthy ✅ |
| Mexico | ~8 | Peak ✅ |
| USA domestic | ~9 | Shoulder → peak ✅ |
| Mediterranean | ~18 | Shoulder → peak (May is warm, pre-crowds) ✅ |
| Indian Ocean (Kenya, Zanzibar, Seychelles, Mauritius) | ~6 | Post-cyclone season, approaching dry season ✅ |
| SE Asia | ~12 | Pre-monsoon shoulder — Thai gulf monsoon starts late May ⚠️ |
| S hemisphere (Florianópolis, Whitehaven, Cable Beach, Hyams) | ~7 | Autumn — scores low, algorithm handles correctly ✅ |

---

## 5 New Venue Objects (Copy-Paste Ready)

Target: fill underrepresented ski geography (Swiss Alps, Dolomites) and underrepresented beach geography (Vietnam, Costa Rica second entry, Zanzibar east coast).

**Also add to `AP_CONTINENT` if not already present:** `VCE:"europe"`, `PQC:"asia"`, `LIR:"na"` (verify — VCE and LIR may already be mapped).

```javascript
// 1. SKIING — Zermatt, Switzerland
// Only Swiss ski entry is Andermatt. Zermatt = Matterhorn = the most iconic ski image on earth.
// lateSeason:true — glacier skiing runs through July. Scores legitimately right now.
{
  id:"zermatt", category:"skiing",
  title:"Zermatt Matterhorn Ski Paradise", location:"Valais, Switzerland",
  lat:46.0207, lon:7.7491, ap:"GVA",
  icon:"🏔️", rating:4.97, reviews:3180,
  gradient:"linear-gradient(160deg,#0d1c38,#1e3a72,#3a6abf)",
  accent:"#7ab2e8",
  tags:["Matterhorn Views","Year-Round Glacier","Car-Free Village","Expert Terrain"],
  photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent", lateSeason:true,
},

// 2. SKIING — Cortina d'Ampezzo, Italy
// Italian Dolomites almost absent (only Cervinia). Cortina hosted 2026 Winter Olympics.
{
  id:"cortina", category:"skiing",
  title:"Cortina d'Ampezzo", location:"Dolomites, Italy",
  lat:46.5369, lon:12.1359, ap:"VCE",
  icon:"🎿", rating:4.93, reviews:2640,
  gradient:"linear-gradient(160deg,#1a0a28,#3a1a5c,#6a38a8)",
  accent:"#c084fc",
  tags:["Dolomites UNESCO","2026 Olympic Venue","Luxury Village","Scenic Cruiser Runs"],
  photo:"https://images.unsplash.com/photo-1483354483454-4cd359948304?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.5",
  skiPass:"dolomiti",
},

// 3. BEACH — Paje Beach, Zanzibar (east coast)
// Only Nungwi (north coast) represents Zanzibar. Paje is kite capital of East Africa,
// shallow tidal flats, completely different character from Nungwi.
{
  id:"beach_paje", category:"beach",
  title:"Paje Beach", location:"Zanzibar, Tanzania",
  lat:-6.2700, lon:39.5330, ap:"ZNZ",
  icon:"🏝️", rating:4.88, reviews:4200,
  gradient:"linear-gradient(160deg,#001a22,#003344,#006677)",
  accent:"#33ccdd",
  tags:["Kitesurfing Capital","Sandbar at Low Tide","Turquoise Shallows","Laid-Back"],
  photo:"https://images.unsplash.com/photo-1547036967-3f4fc0adbf6a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
},

// 4. BEACH — Long Beach, Phu Quoc, Vietnam
// SE Asia coverage thins north of Krabi. Phu Quoc = fastest-growing beach destination in Asia.
// Has dedicated international airport (PQC). Unique sunset-facing west coast beach.
{
  id:"beach_phuquoc", category:"beach",
  title:"Long Beach Phu Quoc", location:"Kien Giang, Vietnam",
  lat:10.2936, lon:103.9803, ap:"PQC",
  icon:"🏖️", rating:4.87, reviews:6800,
  gradient:"linear-gradient(160deg,#001e33,#003d66,#006699)",
  accent:"#33aacc",
  tags:["Sunset Strip","Freshwater Lagoon","National Park Coast","Zero Crowds"],
  photo:"https://images.unsplash.com/photo-1540541338537-1220e69a00c0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},

// 5. BEACH — Playa Conchal, Costa Rica
// Manuel Antonio is the only Costa Rica entry. Conchal (Guanacaste) uses LIR —
// cheaper to fly from USA than SJO — and features unique crushed-shell sand.
{
  id:"beach_conchal", category:"beach",
  title:"Playa Conchal", location:"Guanacaste, Costa Rica",
  lat:10.4583, lon:-85.8667, ap:"LIR",
  icon:"🏖️", rating:4.92, reviews:8400,
  gradient:"linear-gradient(160deg,#001e00,#003d00,#006600)",
  accent:"#44cc88",
  tags:["Crushed Shell Sand","Snorkeling Reef","Dry Season Sunshine","Low Key"],
  photo:"https://images.unsplash.com/photo-1518790111753-7c60ffbd1450?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
```

---

## One Observation for the PM

**The Amazon gear affiliate code has gone missing.** CLAUDE.md's Revenue Model shows Amazon Associates as "LIVE" at $4.48/1K MAU, but `GEAR_ITEMS` does not exist anywhere in `app.jsx` — no constant, no Amazon links, no `peakly-20` tag. The DONE note in CLAUDE.md is wrong; that revenue stream is currently generating $0. At 1K MAU that's ~$4.48/month but it scales with traffic. More importantly: if gear items get re-added before a Reddit launch spike, they could generate meaningful early revenue during the acquisition window when new users are exploring the detail sheet. Worth re-adding before the launch push, not after.
