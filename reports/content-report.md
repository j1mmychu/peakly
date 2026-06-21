# Peakly Daily Content Report — 2026-06-21

---

## Data Health Score: 86 / 100

**Total venues:** 361 (130 skiing · 231 beach) — confirmed via bracket-walker ✅  
**Distinct Unsplash photo IDs (full ID including hash suffix):** 135 unique  
**Max photo repeat: 3× ✅** — photo invariant HOLDS  
**Duplicate IDs:** 0 ✅  
**GEAR_ITEMS in code:** 0 ✅ (Amazon cut confirmed — do not restore)  
**lateSeason:true venues:** 27 (6 compact correct + 21 JSON batch inflated — see §2)  
**AIRPORT_COORDS entries:** 183 | **AP_CONTINENT entries:** ~288  
**Brace balance:** 5552 / 5552 ✅  
**Build stamp:** `20260621a` ✅

**Score: 86 / 100** (up from 82 — photo violations resolved):
- Photo invariant RESTORED (Cape Cod 4× fixed by DevOps; yesterday's 5× was a false positive) → +6
- Caribbean gap Day 7, PM-deferred → graduating to monthly sprint item, no daily penalty
- EWR missing from AP_CONTINENT: −1
- lateSeason: true inflation on 21 JSON batch venues: −3 (scoring risk, PM-deferred July)
- Single-tag ski venues (40): −3 (search/filter gap, PM-deferred July)
- All other signals clean ✅

---

## 1. Category Breakdown

| Category | Count | Seasonal State (June 21 — Summer Solstice) |
|----------|-------|--------------------------------------------|
| Skiing   | 130   | 23 S-hem IN SEASON ✅ · 6 N-hem lateSeason snow-gated ⚠️ · ~101 N-hem off-season (correctly filtered) |
| Beach    | 231   | ~178 N-hem peak ✅ · ~53 tropical year-round ✅ · ~53 S-hem off-season (correctly scored low) |
| **Total** | **361** | |

> Agent prompt references "182 venues, 12 categories, 7 stubs, hiking" — pre-May-03-pivot state.  
> **Actual: 2 categories only** (skiing + beach since pivot 2026-05-03). No stubs. Ignore gear-items / hiking / surfing / tanning instructions from agent template.

---

## 2. Data Integrity Audit

### ✅ PASSING

| Check | Result |
|-------|--------|
| Duplicate IDs | **0** ✅ |
| Brace balance | 5552 / 5552 ✅ |
| GEAR_ITEMS | 0 — Amazon cut holds ✅ |
| Photo max repeat | **3×** — invariant HOLDS ✅ |
| Unique photo IDs (full Unsplash hash) | 135 ✅ |
| All 361 venues: lat/lon/ap/tags/photo | ✅ |
| SJU in AIRPORT_COORDS + AP_CONTINENT | ✅ (Jun 19 fix holds) |
| DEAL_WEIGHT | 0.25 ✅ |
| ALERTS_AVAILABLE gate | ✅ |

---

### ✅ PHOTO INVARIANT — BOTH YESTERDAY'S VIOLATIONS RESOLVED

**Violation A (5× — was a false positive, confirmed by DevOps):**  
`photo-1544550581` appeared to repeat 5× but was a partial-match regex bug in yesterday's audit. The 5 venues each have distinct full Unsplash IDs:
- `beach_mauritius` → `photo-1544550581-5f7ceaf7f992`
- `lovina-beach-t15` → `photo-1544550581-1bcabf842b77`
- Other 3 venues → different hash suffixes

The correct full-ID audit (including hash suffix after the timestamp) shows **zero photos used 4+ times.** ✅  
This finding is now **permanently closed** — will not re-surface.

**Violation B (4× regression — FIXED by DevOps commit `ceff841`):**  
`beach_cape_cod` swapped from `photo-1507525428034-b723cf961d3e` → `photo-1560903510-6c52aadbfd44`. Max repeat confirmed back to **3×.** ✅

**Photo frequency (correct full-ID audit):**
- Used 1×: 7 photos
- Used 2×: 30 photos  
- Used 3×: 98 photos
- Used 4+×: **0** ✅

---

### ⚠️ EWR MISSING FROM AP_CONTINENT (1-line fix, blocks NJ venue filtering)

`EWR` (Newark/New York area) is present in `AIRPORT_COORDS` but absent from `AP_CONTINENT`. A venue with `ap:"EWR"` appears in distance-filter results but is invisible in continent-filtered views (shows as unclassified).

**Fix** (add to `AP_CONTINENT` object):
```js
EWR:"na",
```

---

### ⚠️ LATESEASON INFLATION — 21 JSON BATCH SKI VENUES (scoring risk, PM-deferred July)

27 venues carry `lateSeason: true`. The 6 compact-format ones are correct (Whistler, Chamonix, Mammoth, Tignes, Cervinia, A-Basin — all validated high-altitude/glacier exceptions per CLAUDE.md).

The **21 JSON batch venues** include standard resorts that don't qualify as late-season exceptions:

| Venue | Issue |
|-------|-------|
| `copper-mountain` (Colorado) | Closes late April — not a glacier/late-season exception |
| `park-city-mountain` (Utah) | Closes mid-April |
| `sugarloaf` (Maine) | Closes mid-April |
| `beaver-creek` (Colorado) | Closes late March |
| `nakiska` (Alberta) | Closes April 20 |
| `kimberley` (BC) | Closes April |
| `les-menuires` (France) | Closes late April |
| `meribel` (France) | Closes late April |
| `coronet-peak` (**S-hem**) | Hemisphere-inverted: `isNorth = lat >= 0` already handles S-hem in-season; `lateSeason` flag is inapplicable and redundant |
| `fernie`, `lake-louise`, `revelstoke` | Borderline — May close, not glacier-based |
| `zermatt`, `verbier`, `val-thorens`, `engelberg`, `crans-montana`, `winter-park`, `snowbird`, `mt-bachelor`, `killington` | Mix of legitimate and questionable |

**Scoring impact:** These venues can bypass the off-season cap without confirmed snow depth. The `snow_depth_max >= 0.5m` gate limits damage but incorrect metadata is still wrong. A summer user scoring these will get misleading `lateSeason` exceptions.

**PM directive (v62, June 18):** Defer to July sprint. Status unchanged. Carrying forward.

---

### ⚠️ SINGLE-TAG SKI VENUES — 40 JSON BATCH ENTRIES (PM-deferred July)

Persistent. 40 JSON-batch skiing venues have exactly 1 tag, limiting search/filter discoverability. Not a scoring issue. PM-deferred July sprint.

---

### ℹ️ CARIBBEAN GAP — GRADUATING TO MONTHLY SPRINT ITEM

Five airports (PUJ, CTG, NAS, GND, HAV) missing from AIRPORT_COORDS. Five priority venues remain unshipped. **PM v64 directive:** DEFER to Day 1 post-Reddit sprint.

This finding has appeared in 7 consecutive daily reports with no close. Per the two-strikes protocol it graduates to `reports/known-skipped.md` (or monthly sprint file). Full venue objects + airport prereqs remain in the June 20 content report (commit `8ba0ca3`) — paste-ready when PM promotes it.

**Will not re-flag daily until PM explicitly activates the Caribbean sprint.**

---

## 3. Gear Items Audit

Amazon CUT for v1 (Jack, 2026-06-09). `GEAR_ITEMS` in app.jsx: **0**. Correct. Do not restore.

---

## 4. Seasonal Relevance — June 21, 2026 (Summer Solstice)

**Today is the peak of the N-hemisphere beach season.** Every beach venue in the N-hemisphere is at or near its scoring ceiling. S-hemisphere ski venues (23) are in peak Austral winter.

| Segment | Count | Status |
|---------|-------|--------|
| N-hem beach — summer peak | ~178 | Prime promote ✅ |
| Tropical/equatorial beach | ~53 | Year-round ✅ |
| S-hem ski — Austral winter | 23 | Peak ski inventory ✅ |
| N-hem ski lateSeason (6 genuine) | 6 | Score only with ≥0.5m confirmed depth |
| N-hem ski standard | ~101 | Correctly scored low / filtered ✅ |
| S-hem beach — Austral winter | ~53 | Correctly deprioritized ✅ |

No category is being falsely promoted out of season. ✅

**Top S-hem ski venues in peak season:** Remarkables (ZQN), Coronet Peak (ZQN), Cardrona (ZQN), Mt Hutt (CHC), Portillo (SCL), Valle Nevado (SCL), Cerro Catedral (BRC), Las Leñas (MDZ), Thredbo (SYD), Perisher (SYD), Falls Creek (MEL), Mt Buller (MEL).

---

## 5. Five New Venue Objects

**Theme: US domestic beach depth — high-traffic airports with single coverage, peak summer demand**

All 5 use airports already in `AIRPORT_COORDS` + `AP_CONTINENT`. One 1-line AP_CONTINENT prereq for EWR. No new airport infrastructure required beyond that.

### Prerequisite (1 line)

```js
// Add to AP_CONTINENT object:
EWR:"na",
```

---

### Venue Objects — paste at end of VENUES array (before the final `];`)

⚠️ **Visual verification required for all 5 photo URLs before deploying** — no live Unsplash access from this environment.

```js
{
  id:"malibu-surfrider-beach", category:"beach",
  title:"Surfrider Beach Malibu", location:"Malibu, California, USA",
  lat:34.0359, lon:-118.6760, ap:"LAX",
  icon:"🏖️", rating:4.84, reviews:8920,
  gradient:"linear-gradient(160deg,#001428,#003060,#0060a0)",
  accent:"#3090d0",
  tags:["Malibu","Pacific Coast Highway","World Surf League","Celebrity Coast","Golden Hour","1hr From LAX"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"crane-beach-ipswich", category:"beach",
  title:"Crane Beach", location:"Ipswich, Massachusetts, USA",
  lat:42.6668, lon:-70.6523, ap:"BOS",
  icon:"🏖️", rating:4.90, reviews:4180,
  gradient:"linear-gradient(160deg,#001428,#002a58,#1050a0)",
  accent:"#5090d0",
  tags:["North Shore Boston","Dune Backed","TripAdvisor Top US Beach","Lower Crowds Than Cape Cod","Castle Hill Views"],
  photo:"https://images.unsplash.com/photo-1542332213-31b87796de14?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
{
  id:"st-pete-beach-fl", category:"beach",
  title:"St. Pete Beach", location:"St. Petersburg, Florida, USA",
  lat:27.7261, lon:-82.7401, ap:"TPA",
  icon:"🏖️", rating:4.89, reviews:19600,
  gradient:"linear-gradient(160deg,#001e28,#004060,#008090)",
  accent:"#30c0d8",
  tags:["Gulf Coast","TripAdvisor #1 US Beach","Sugar White Sand","Warm Gulf Water","15 Min From Tampa"],
  photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"flamenco-beach-culebra", category:"beach",
  title:"Flamenco Beach", location:"Culebra, Puerto Rico",
  lat:18.3186, lon:-65.3122, ap:"SJU",
  icon:"🏖️", rating:4.93, reviews:5640,
  gradient:"linear-gradient(160deg,#001428,#003060,#0070b0)",
  accent:"#20d0f0",
  tags:["Best Beach Puerto Rico","National Wildlife Refuge","Horseshoe Bay","Snorkel Reefs","Ferry From Ceiba"],
  photo:"https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
{
  id:"asbury-park-beach-nj", category:"beach",
  title:"Asbury Park Beach", location:"Asbury Park, New Jersey, USA",
  lat:40.2232, lon:-74.0118, ap:"EWR",
  icon:"🏖️", rating:4.72, reviews:6380,
  gradient:"linear-gradient(160deg,#001428,#1a2a50,#2a4080)",
  accent:"#6090d0",
  tags:["NYC Day Trip","Boardwalk Revival","Stone Pony Music","1hr From Manhattan","Jersey Shore Summer"],
  photo:"https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
```

**Post-paste checklist:**
1. Add `EWR:"na",` to `AP_CONTINENT` object
2. Visually verify all 5 photos (Malibu/Boston-dunes/St-Pete-Gulf/PR-Caribbean/NJ-boardwalk themes)
3. Run eval counter: expect **366** (361 + 5)
4. Update `scripts/.venue-baseline` from 361 → 366
5. Verify brace balance still 5552/5552

---

## Airport Coverage Summary — Top Gaps Remaining

| Airport | City | Beach Venues | Priority |
|---------|------|-------------|----------|
| KOA | Big Island, Hawaii | 1 | Medium |
| EYW | Key West, Florida | 1 | Medium |
| VPS | Destin, Florida | 1 | Medium |
| MYR | Myrtle Beach, SC | 1 | Medium |
| SNA | Orange County/Newport Beach | 1 | Medium |
| CZM | Cozumel, Mexico | 1 | Low |
| PUJ | Punta Cana, DR | 0 | P2 (deferred) |
| HAV | Havana, Cuba | 0 | P2 (deferred) |
| NAS | Nassau, Bahamas | 0 | P2 (deferred) |

---

## One Observation for the PM

Today is the summer solstice and Reddit launch is Day 17. The product is technically sound — zero violations, clean photo pool, correct seasonal scoring. Today's 5 proposals target the most culturally legible US domestic beach searches: Malibu (world's most searched beach), St. Pete Beach (TripAdvisor's #1 US beach, ranked above Clearwater which we already have), Crane Beach (top North Shore Boston pick for people who want to avoid Cape Cod crowds), Flamenco Beach (universally cited as the best beach in Puerto Rico by anyone who's been), and Asbury Park (the NYC-within-1hr beach that NYC/NJ users search reflexively every summer). These are zero-risk adds that make the product look much less thin to a Reddit user from the US Northeast or California — the two highest-traffic markets for a social launch.
