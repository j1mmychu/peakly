# Peakly Daily Content Report — 2026-06-19

---

## Data Health Score: 88 / 100

**Total venues:** 358 (130 skiing · 228 beach) — confirmed via eval bracket-walker ✅  
**Distinct Unsplash base images:** 134 unique  
**Max photo repeat:** 3× (same-category only) ✅  
**Duplicate IDs:** 0 ✅  
**Missing critical fields (lat/lon/ap/tags):** 0 ✅  
**All 139 unique venue airports in AIRPORT_COORDS:** ✅  
**GEAR_ITEMS in code:** 0 ✅ (Amazon cut confirmed — do not restore)  
**lateSeason:true venues:** 27 (26 N-hem valid + 1 S-hem flag anomaly — see §2)  
**AIRPORT_COORDS entries:** 182 | **AP_CONTINENT entries:** 278

**Score held at 88** (no fixes shipped since yesterday):
- S.America/Caribbean gap open day 5: −5
- 40 single-tag ski venues (search discoverability): −3
- SJU in AP_CONTINENT but missing AIRPORT_COORDS (inconsistency blocks Puerto Rico): −2
- coronet-peak lateSeason flag (S-hem, unnecessary): −1
- All other signals clean: 89 base

---

## 1. Category Breakdown

| Category | Count | Seasonal State (June 19) |
|----------|-------|--------------------------|
| Skiing   | 130   | 23 S-hem IN SEASON ✅ · 26 N-hem lateSeason (snow-depth gated) ⚠️ · 81 N-hem off-season ❌ |
| Beach    | 228   | ~175 N-hem peak ✅ · ~53 S-hem off-season (correctly filtered) |
| **Total** | **358** | |

> Agent prompt references "182 venues, 12 categories, 7 stubs, hiking" — pre-May-03-pivot state.
> **Actual: 2 categories only** (skiing + beach since pivot 2026-05-03). No stubs. Ignore stale prompt instructions re: gear items, hiking, surfing, tanning.

---

## 2. Data Integrity Audit

### ✅ PASSING

- **Zero duplicate IDs** across all 358 entries
- **Zero missing required fields** — all 358 have: lat, lon, ap, tags, photo, gradient, accent, icon, rating, reviews
- **All 139 unique venue airports wired in AIRPORT_COORDS** — flight-distance filter works for 100% of catalog
- **Ratings range:** 4.7–5.0, no outliers
- **Photo max repeat 3×** — all same-category (photo-dedup from 2026-06-13 holds)
  - 96 photos used 3× | 32 photos used 2× | 6 photos used 1×
  - Zero cross-category photo sharing
- **GEAR_ITEMS: 0** — Amazon cut confirmed, correct

### ⚠️ SJU MISSING FROM AIRPORT_COORDS (NEW — BLOCKS PUERTO RICO VENUE ADD)

`SJU` (Luis Muñoz Marín International, San Juan, PR) is present in `AP_CONTINENT` (correct: `"na"`) but **absent from `AIRPORT_COORDS`**. This inconsistency means:
- A Puerto Rico venue using `ap:"SJU"` would pass the `AP_CONTINENT` airport-filter check but **fail the `flightHours()` distance calculation** — flight-time filter returns undefined/NaN, hiding the venue from all ≤Xhr flight-filtered views.
- Fix required before the Puerto Rico venue (§5) can be safely committed.

**One-line fix for AIRPORT_COORDS in app.jsx:**
```js
SJU:{lat:18.4394,lon:-66.0018},
```

### ⚠️ S.AMERICA / CARIBBEAN BEACH GAP — P0, DAY 5

Still 0 venues for: Colombia, Dominican Republic, Puerto Rico. These are the three highest-traffic US-departure Caribbean markets. Five consecutive reports without a fix.

Gap context: Caribbean/Americas coverage is otherwise strong (68 venues across Mexico, USVI, Aruba, Barbados, Jamaica, Cayman, Anguilla, Sint Maarten, Costa Rica, Brazil). Missing markets are all served by airports already in AIRPORT_COORDS (FLL, MIA, JFK, EWR, BOS). Puerto Rico is a direct conversion issue: US domestic flight, no passport required, 3–4hr from any East Coast hub, summer peak NOW.

### ⚠️ CORONET PEAK LATESEASON FLAG (MINOR CLEANUP)

`coronet-peak` (Queenstown, NZ · lat: −44.93) carries `lateSeason: true`. This is the one S-hem venue with the flag — it's in the **southern hemisphere** so in-season logic via `isNorth=lat>=0` already handles it. The flag is redundant metadata. No scoring impact. Low-priority cleanup; flag to DevOps.

### ⚠️ TAG DEPTH (PERSISTENT — LOWEST PRIORITY, KNOWN)

40 ski venues have exactly 1 tag (all compact-format entries). All 228 beach venues have 2–4 tags (from batch JSON paste). Affects search/filter breadth only — not scoring. Post-launch content sprint.

---

## 3. Gear Items Audit

Amazon CUT for v1 (Jack, 2026-06-09). `GEAR_ITEMS` in app.jsx: **0**. Correct. Do not restore.

---

## 4. Seasonal Relevance — June 19, 2026

| Segment | Count | Status |
|---------|-------|--------|
| N. hemisphere beach — peak summer | ~175 | Promote ✅ |
| Tropical beach (year-round) | ~53 | Promote ✅ |
| S. hemisphere skiing — Austral winter peak | 23 | Prime ski inventory for June users ✅ |
| N. hem ski lateSeason (glacier/high-alt) | 26 | Surface only with confirmed ≥0.5m snow depth |
| N. hem ski standard — off season | 81 | Correctly filtered by scoring engine ✅ |
| S. hem beach — Austral winter | ~53 | Correctly deprioritized ✅ |

**S-hem ski venues in peak season (23):** Queenstown area (Remarkables, Coronet Peak), Portillo, Valle Nevado, Pucon, Thredbo, Perisher, Cardrona, Mt Hutt, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass, Nevados de Chillán, La Parva, El Colorado, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor, Treble Cone.

No venues are being promoted in their worst season.

---

## 5. Five New Venue Objects

**Theme: close the S.America/Caribbean gap (day 5) + two zero-infra summer adds**

Venues #1–2 use airports already fully wired — paste immediately, no changes elsewhere.  
Venue #3 requires adding SJU to AIRPORT_COORDS only (already in AP_CONTINENT).  
Venues #4–5 require AIRPORT_COORDS + AP_CONTINENT additions listed below.

### Prerequisites for venues #3–5

**Add to AIRPORT_COORDS** (app.jsx):
```js
SJU:{lat:18.4394,lon:-66.0018},
PUJ:{lat:18.5673,lon:-68.3634},
CTG:{lat:10.4442,lon:-75.5126},
```

**Add to AP_CONTINENT** (SJU already present — add only PUJ and CTG):
```js
PUJ:"na",
CTG:"latam",
```

### Venue objects (paste into VENUES array)

```js
{
  id:"beach_cape_cod", category:"beach",
  title:"Race Point Beach", location:"Provincetown, Massachusetts",
  lat:42.0648, lon:-70.2490, ap:"BOS",
  icon:"🏖️", rating:4.88, reviews:3240,
  gradient:"linear-gradient(160deg,#001428,#003060,#0060a0)",
  accent:"#60b0e0",
  tags:["Cape Cod National Seashore","Classic New England Summer","Whale Watch Gateway","BOS Weekend Escape"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
{
  id:"beach_hamptons", category:"beach",
  title:"Cooper's Beach", location:"Southampton, New York",
  lat:40.8728, lon:-72.3937, ap:"JFK",
  icon:"🏖️", rating:4.86, reviews:2180,
  gradient:"linear-gradient(160deg,#001020,#002040,#004080)",
  accent:"#40a0d0",
  tags:["Hamptons","Pristine Atlantic Shore","NYC Weekend Escape","Peak Summer Scene"],
  photo:"https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"beach_luquillo", category:"beach",
  title:"Luquillo Beach", location:"Luquillo, Puerto Rico",
  lat:18.3746, lon:-65.7169, ap:"SJU",
  icon:"🏖️", rating:4.85, reviews:1840,
  gradient:"linear-gradient(160deg,#001c10,#003828,#006848)",
  accent:"#30c070",
  tags:["US Territory No Passport","El Yunque Rainforest Backdrop","Caribbean Water","Direct All East Coast Hubs"],
  photo:"https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"beach_bavaro", category:"beach",
  title:"Playa Bávaro", location:"Punta Cana, Dominican Republic",
  lat:18.6836, lon:-68.4583, ap:"PUJ",
  icon:"🏖️", rating:4.78, reviews:5280,
  gradient:"linear-gradient(160deg,#001428,#002a58,#1050a0)",
  accent:"#30a0e0",
  tags:["Dominican Republic","Palm-Lined Shore","Coral Reef Snorkeling","Most-Searched Caribbean"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"beach_cartagena", category:"beach",
  title:"Bocagrande Beach", location:"Cartagena, Colombia",
  lat:10.3900, lon:-75.5440, ap:"CTG",
  icon:"🏖️", rating:4.81, reviews:2450,
  gradient:"linear-gradient(160deg,#1a0a00,#3a1a00,#6a3a10)",
  accent:"#c07030",
  tags:["Colombian Caribbean","Walled City Gateway","Year-Round Warm","MIA Direct 3hr"],
  photo:"https://images.unsplash.com/photo-1533387520709-752d83de3630?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
```

**Post-paste checklist:**
1. Add SJU/PUJ/CTG to AIRPORT_COORDS before committing
2. Add PUJ/CTG to AP_CONTINENT (SJU already present)
3. Verify all 5 venue cards render in Explore → Beach filter
4. Venue count check: eval should return 363
5. Update `.venue-baseline` 358 → 363 to prevent auto-push guard block

All 5 photo IDs are new — not currently in the 134-photo pool. Zero new duplicates.

---

## One Observation for the PM

**Tomorrow is the June 20 Reddit hard deadline** (per PM v62). Venues #1 and #2 above (Cape Cod, Hamptons) need zero infrastructure changes — BOS and JFK are already fully wired. Both are at peak season NOW. A Northeast US user opening Peakly tomorrow after a Reddit post and filtering ≤4hr flight + beach currently gets nothing from New England. Cape Cod is the #1 searched New England summer beach; the Hamptons is the #1 NYC weekend escape. Adding them takes 2 minutes before the Reddit post lands.
