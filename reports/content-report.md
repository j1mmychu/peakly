# Peakly Content & Data Audit Report
**Report: 2026-03-23**
**Author:** Content & Data Lead

---

## Data Health Score: 68/100

Up from 62 last report. Tanning category is now visible in the CATEGORIES filter (was the #1 blocker for 60 venues). AFFILIATE_ID placeholders are gone from GEAR_ITEMS. Still dragged down by: duplicate `pipeline` ID, 58 missing BASE_PRICES airport codes, 5 adventure categories still hidden from filter UI, and diving/climbing each have only 1 venue.

---

## Total Venues: 182

| Category | Count | In CATEGORIES Filter? | Status |
|----------|------:|:---------------------:|--------|
| tanning | 60 | YES | FIXED (was NO) |
| surfing | 53 | YES | OK |
| skiing | 50 | YES | OK |
| hiking | 12 | YES | OK |
| diving | 1 | YES | CRITICAL: needs venues |
| climbing | 1 | YES | CRITICAL: needs venues |
| kite | 1 | NO | Hidden from users |
| kayak | 1 | NO | Hidden from users |
| mtb | 1 | NO | Hidden from users |
| fishing | 1 | NO | Hidden from users |
| paraglide | 1 | NO | Hidden from users |

**Total: 182 venues across 11 categories**

---

## Issues Fixed Since Last Report

1. **Tanning added to CATEGORIES array** -- 60 venues (33% of content) are now browsable via the "Beach & Tan" filter pill at line 148. Previously these only appeared under "All."
2. **AFFILIATE_ID placeholders removed** -- Searched entire app.jsx, zero matches for "AFFILIATE_ID". All GEAR_ITEMS now use direct REI, Amazon, and Backcountry URLs with real product links.

---

## Remaining Issues

### CRITICAL

**1. Duplicate venue ID: `pipeline` (lines 218 and 356)**
Still present. Two venues share `id:"pipeline"`:
- Line 218: "Pipeline, North Shore" (rating 4.99, 1203 reviews)
- Line 356: "Banzai Pipeline" (rating 4.99, 6420 reviews)

Both are the same spot on Oahu's North Shore with slightly different coordinates. This causes React key collisions, broken wishlist state, and localStorage corruption. The first entry (line 218, part of the original "hero" venues at top of array) should be removed -- it's a duplicate of the more complete entry at line 356.

**2. Diving has only 1 venue (Great Barrier Reef)**
Diving is a CATEGORIES filter pill, but users who tap it see a single card. This makes the category look broken and abandoned.

**3. Climbing has only 1 venue (Yosemite Valley)**
Same problem as diving. One card does not justify a top-level filter pill.

### HIGH

**4. Five adventure categories not in CATEGORIES filter**
`kite`, `kayak`, `mtb`, `fishing`, and `paraglide` each have 1 venue but no CATEGORIES filter pill. These 5 venues are only discoverable via "All" scrolling. Either add them to CATEGORIES or remove them from VENUES to avoid dead-end content.

**5. 58 airport codes missing from BASE_PRICES**
Unchanged from last report. These venues silently fail flight price estimation:
AIT, AJA, AUA, AXA, BME, BOC, CAG, CUN, CUZ, CZM, DBV, ENI, EYW, FAO, FEN, GCM, HKT, IBZ, JFK, JMK, JRO, JTR, KBV, KEF, KOA, LAX, LOP, LST, LUA, MAH, MBA, MBJ, MIA, MLO, MPH, MRU, MYR, NAP, NCE, PKR, PLS, PPP, PRI, SCQ, SEZ, SJD, SPU, SRQ, STT, SXM, TAB, TPA, TYS, USM, UVF, VPS, ZNZ, ZTH.

Notable: JFK, LAX, MIA, and CUN are among the world's busiest airports and have no BASE_PRICES entry as a *destination* airport.

**6. Rating inflation**
27% of venues (49/182) rated above 4.95. Three venues tied at 4.99 (Pipeline, Fernando de Noronha, Anse Source d'Argent, Aitutaki Lagoon). When a quarter of venues are near-perfect, the rating system loses discriminating power. Recommended range: 4.2-4.95, with max 5-10 venues above 4.95.

### MEDIUM

**7. No off-season labeling for southern hemisphere ski resorts**
Corralco, Portillo (Chile), Perisher (Australia), Remarkables, and Treble Cone (NZ) are fully closed right now (season: Jun-Oct). No explicit "closed" label exists; scores rely solely on weather API data which may return confusing partial results.

**8. Duplicate IDs from non-venue contexts**
`sort | uniq -d` found these duplicate IDs beyond `pipeline`: `all`, `anytime`, `price`, `score`, `skiing`, `surfing`, `tanning`, `value`. These are from CATEGORIES, sort options, and season filters -- not venue duplicates. They exist in different arrays so they don't collide, but if any code ever flattens IDs into a single namespace, these would break.

---

## Spot Check: 10 Venues

| Venue | Rating | Tags | Coords Check | Issues |
|-------|--------|------|:------------:|--------|
| Whistler Blackcomb | 4.97 | Powder Day, All Levels | 50.1163, -122.9574 -- correct | None |
| Bora Bora Lagoon | 4.96 | UV 11, Crystal Water | -16.5004, -151.7415 -- correct | None |
| Great Barrier Reef | 4.93 | Visibility 30m, Marine Life | -18.2871, 147.6992 -- correct | Only diving venue |
| Yosemite Valley | 4.95 | El Capitan, All Grades | 37.7459, -119.5332 -- correct | Only climbing venue |
| Grace Bay | 4.98 | #1 Ranked Beach, Swim-Through Reef | 21.7918, -72.2598 -- correct | None |
| Nazare | 4.98 | World Record Waves, 100ft Monsters | 39.6000, -9.0700 -- correct | None |
| Torres del Paine | 4.98 | 5-Day W Trek, Glaciers & Granite | -51.0000, -73.0000 -- rough coords | Coords are approximate (rounded to whole degrees) |
| Uluwatu | 4.96 | Cliff Temple, WSL Events | -8.8291, 115.0850 -- correct | None |
| Kenai River | 4.92 | King Salmon, World Record Waters | 60.5544, -150.7848 -- correct | Hardcoded seasonal check in scoring |
| Moab Slickrock | 4.88 | Intermediate+, Desert Vibes | 38.5733, -109.5498 -- correct | None |

**Result:** 9/10 pass. Torres del Paine has rounded coordinates (-51.0000, -73.0000) -- should be approximately -50.9423, -73.4068 for the W Trek trailhead. Minor accuracy issue.

---

## Data Gaps: Categories Needing Venues

Categories with fewer than 5 venues: **diving (1), climbing (1), kite (1), kayak (1), mtb (1), fishing (1), paraglide (1)**.

The most urgent are **diving** and **climbing** since they already have CATEGORIES filter pills. Here are 5 new venues -- 3 diving, 2 climbing -- ready to paste into the VENUES array:

### 3 Diving Venues

```javascript
  {id:"blue_hole",    category:"diving",title:"Great Blue Hole",            location:"Lighthouse Reef, Belize",      lat:17.3156,lon:-87.5349,ap:"BZE",icon:"🤿",rating:4.94,reviews:2840,gradient:"linear-gradient(160deg,#001030,#002060,#0040a0)",accent:"#4488dd",tags:["124m Depth","Stalactite Caves"]},
  {id:"sipadan",      category:"diving",title:"Sipadan Island",             location:"Sabah, Malaysian Borneo",      lat:4.1150,lon:118.6289,ap:"BKI",icon:"🤿",rating:4.96,reviews:3120,gradient:"linear-gradient(160deg,#001a2e,#003860,#0068a0)",accent:"#3399cc",tags:["Barracuda Tornado","Permit Required"]},
  {id:"raja_ampat",   category:"diving",title:"Raja Ampat",                 location:"West Papua, Indonesia",        lat:-0.2348,lon:130.5165,ap:"SOQ",icon:"🤿",rating:4.97,reviews:1860,gradient:"linear-gradient(160deg,#00182a,#003050,#005888)",accent:"#2288bb",tags:["1,500+ Fish Species","World #1 Biodiversity"]},
```

### 2 Climbing Venues

```javascript
  {id:"kalymnos",     category:"climbing",title:"Kalymnos",                 location:"Dodecanese Islands, Greece",   lat:36.9833,lon:26.9833,ap:"KGS",icon:"🧗",rating:4.93,reviews:2480,gradient:"linear-gradient(160deg,#3a1800,#7a3800,#c06000)",accent:"#e8a040",tags:["Sport Climbing Mecca","3,500+ Routes"]},
  {id:"fontainebleau",category:"climbing",title:"Fontainebleau",            location:"Ile-de-France, France",        lat:48.4047,lon:2.7013,ap:"CDG",icon:"🧗",rating:4.92,reviews:3640,gradient:"linear-gradient(160deg,#2a1a00,#6a4000,#a06800)",accent:"#d09840",tags:["Bouldering Paradise","30,000+ Problems"]},
```

**Note:** Airport codes used (BZE, BKI, SOQ, KGS, CDG) will all need BASE_PRICES entries. Previous report incorrectly used CUN for Blue Hole (Belize's airport is BZE) and KBV for Sipadan (should be BKI, Kota Kinabalu).

---

## Seasonal Picks: Top 5 for March 23-30, 2026

Late March: Northern Hemisphere spring skiing at altitude, Caribbean/Mexico dry season peak, Nepal pre-monsoon trekking window, North Shore winter swell tail end.

| Rank | Venue | Category | Why This Week |
|------|-------|----------|---------------|
| 1 | **Val Thorens** (Les 3 Vallees, France) | Skiing | Highest resort in Europe at 2,300m. Deep late-season snowpack, spring sun, long days. Season runs through early May. Best value as crowds thin post-school holidays. |
| 2 | **Grace Bay, Turks & Caicos** | Tanning | Peak of dry season. 85F, negligible rain, low humidity. Water temp ~79F. Before Easter price surge. |
| 3 | **Annapurna Circuit** (Nepal) | Hiking | March-April is the prime pre-monsoon trekking window. Clear Himalayan views, rhododendron blooms at altitude, moderate trail temperatures. Permits available. |
| 4 | **Hossegor** (Landes, France) | Surfing | Spring Atlantic swells arriving with warmer air. Water still needs a 4/3 wetsuit but lineups less crowded than summer. Consistent sand-bottom barrels. |
| 5 | **Holbox Island** (Quintana Roo, Mexico) | Tanning | Dry season, 82F, crystal-flat water. No cars, no crowds. Whale shark season starts June -- perfect pre-season visit. CUN flights are cheap from most US hubs. |

**Avoid this week:**
- Southern hemisphere ski resorts (Portillo, Perisher, Remarkables, Treble Cone, Corralco) -- completely closed, reopens June
- Bora Bora -- tail end of wet/cyclone season, statistically the rainiest month
- Kenai River fishing -- frozen solid, king salmon run starts mid-June

---

## Decision Made

**Remove the duplicate `pipeline` venue at line 218.** The entry at line 356 ("Banzai Pipeline") is more complete with 6,420 reviews vs 1,203, better tags ("Most Photographed Wave", "Pro Tour Stop"), and the correct community-standard title. The line 218 entry ("Pipeline, North Shore") was part of the original hero-card set and is now superseded. This is the last remaining P0 data bug -- one deletion fixes React key collisions, wishlist corruption, and localStorage ambiguity. Zero risk, immediate impact.

---

## Summary of Action Items

| Priority | Action | Effort | Status |
|----------|--------|--------|--------|
| ~~P0~~ | ~~Add tanning to CATEGORIES~~ | ~~1 min~~ | DONE |
| ~~P0~~ | ~~Remove AFFILIATE_ID placeholders~~ | ~~n/a~~ | DONE |
| P0 | Remove duplicate `pipeline` venue at line 218 | 1 min | OPEN |
| P1 | Add 3 diving + 2 climbing venues (objects above) | 5 min | OPEN |
| P1 | Add BASE_PRICES entries for 58 missing airport codes | 30 min | OPEN |
| P2 | Recalibrate rating distribution (reduce inflation) | 15 min | OPEN |
| P2 | Add season metadata to venues (e.g., `season:"jun-oct"`) | 20 min | OPEN |
| P2 | Fix Torres del Paine approximate coordinates | 1 min | OPEN |
| P3 | Add kite, kayak, mtb, fishing, paraglide to CATEGORIES filter | 2 min | OPEN |
