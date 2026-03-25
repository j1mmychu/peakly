# Data Enrichment Report

**Date:** 2026-03-24 (v6 -- post-revert audit, current state)
**Auditor:** Data Enrichment Agent
**Scope:** Venue data integrity, category health, photo coverage, geographic diversity, data completeness
**File:** `/Users/haydenb/peakly/app.jsx` (VENUES array, line 284)
**Mode:** Audit only -- no files edited

---

## Executive Summary

**Total venues: 192** (target: 200+, 8 short)

The bulk surf expansion (472 venues) was reverted. The database is back to a clean state: 0 duplicate IDs, 100% photo coverage, only 1 duplicate photo URL. However, the core structural problems remain:

- **7 of 11 categories are stubs** (under 10 venues) -- 4 have exactly 1 venue
- **182 venues have only 2 tags** instead of the minimum 5, dropping completeness to 5.2%
- **Tanning is saturated at 60** while kayak, MTB, fishing, and paraglide each have 1

The venue count itself is close to target (192 vs 200). The real problem is distribution, not volume.

---

## 1. Category Health

| Category | Count | Status | Notes |
|----------|-------|--------|-------|
| tanning | 60 | SATURATED | Lower ROI for additions |
| surfing | 53 | HEALTHY | Well-distributed globally |
| skiing | 50 | HEALTHY | Strong US/Europe/Japan/NZ coverage |
| hiking | 12 | HEALTHY | Just above threshold |
| diving | 5 | STUB | Needs 5+ more |
| climbing | 4 | STUB | Needs 6+ more |
| kite | 4 | STUB | Needs 6+ more |
| kayak | 1 | STUB | Needs 9+ more |
| mtb | 1 | STUB | Needs 9+ more |
| fishing | 1 | STUB | Needs 9+ more |
| paraglide | 1 | STUB | Needs 9+ more |

**7 stubs, 1 saturated, 3 healthy.** To reach credibility (10+ per category), ~60 new venues are needed across the 7 stub categories.

### Priority Targets (3 weakest)

1. **kayak** -- 1 venue (Milford Sound)
2. **mtb** -- 1 venue (Moab Slickrock Trail)
3. **fishing** -- 1 venue (Kenai River)

Also critically thin: paraglide (1), climbing (4), kite (4), diving (5).

---

## 2. Photo Coverage

- **Coverage:** 192/192 (100.0%)
- **Unique photo URLs:** 191/192 (99.5%)
- **Duplicate found:** 1 pair
  - `rajaampat` (diving) and `sipadan` (diving) share: `photo-1682687220742-aba13b6e50ba`
  - **Fix:** Replace sipadan's photo with a unique image (e.g., `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop`)

No broken, placeholder, or generic photo URLs detected. All are specific Unsplash URLs with dimension parameters.

---

## 3. Geographic Diversity

| Region | Venues | Share |
|--------|--------|-------|
| Europe | 50 | 26.0% |
| North America | 28 | 14.6% |
| South America / Central America | 26 | 13.5% |
| Asia | 26 | 13.5% |
| Oceania | 21 | 10.9% |
| Africa | 10 | 5.2% |
| Caribbean | 7 | 3.6% |
| US states / territories (mapped at runtime) | 24 | 12.5% |

**All 6 defined continents have representation.** No continent has zero venues. Africa is thinnest at 10 but not critically so. The 24 "unclassified" venues are US states (California, Florida, etc.), Hawaii, and Australian states -- these map correctly at runtime via `AP_CONTINENT`.

### Top 15 Countries

| Country | Count |
|---------|-------|
| USA (incl. states) | ~37 |
| France | 9 |
| Mexico | 9 |
| Hawaii | 8 |
| Switzerland | 8 |
| Spain | 7 |
| Indonesia | 7 |
| Japan | 6 |
| New Zealand | 5 |
| Austria | 5 |
| Italy | 5 |
| Greece | 5 |
| Canada | 4 |
| Chile | 4 |
| Australia (mainland) | ~4 |

Good geographic spread. No single country dominates beyond reason.

---

## 4. Data Completeness

**Overall score: 5.2%** (10/192 venues are fully complete)

### What's present on ALL venues (100%):
- id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, photo

### The problem -- tags:
- **182 venues have exactly 2 tags** (minimum should be 5)
- **10 venues have 5+ tags** (the original "expanded format" venues)
- This is the sole reason completeness is at 5.2% instead of ~100%

### Fields absent from the schema:
- `desc` (description) -- 0/192 venues
- `difficulty` -- 0/192 venues
- `bestMonths` -- 0/192 venues

These fields are referenced in the agent spec as "required" but were never added to the venue objects. The VenueDetailSheet works without them but would benefit from descriptions especially.

### Integrity checks (all pass):
- Duplicate IDs: 0
- Missing coordinates: 0
- Missing airport codes: 0
- Rating range: reasonable (all 4.5-5.0 range)
- All venues have gradient + accent for card rendering

---

## 5. Stub Category Details

### Diving (5 venues)
1. Great Barrier Reef -- Queensland, Australia
2. Raja Ampat -- West Papua, Indonesia
3. Sipadan Island -- Sabah, Malaysia
4. Blue Hole, Dahab -- Sinai Peninsula, Egypt
5. Cozumel Reefs -- Quintana Roo, Mexico

### Climbing (4 venues)
1. Yosemite Valley -- California, USA
2. Railay Beach -- Krabi, Thailand
3. Kalymnos Island -- Dodecanese, Greece
4. El Chalten -- Patagonia, Argentina

### Kitesurf (4 venues)
1. Tarifa Wind Coast -- Andalusia, Spain
2. Cabarete -- Puerto Plata, Dominican Republic
3. Dakhla Lagoon -- Western Sahara, Morocco
4. Mui Ne -- Binh Thuan, Vietnam

### Kayak (1 venue)
1. Milford Sound -- Fiordland, New Zealand

### MTB (1 venue)
1. Moab Slickrock Trail -- Utah, USA

### Fishing (1 venue)
1. Kenai River -- Alaska, USA

### Paraglide (1 venue)
1. Interlaken -- Bernese Oberland, Switzerland

---

## 6. Suggested New Venues (10 paste-ready, targeting 3 weakest categories)

**NOTE: Audit-only run. These are NOT applied. Provided for future implementation.**

```javascript
// ─── KAYAK additions (currently 1 venue) ─────────────────────────────────────
{id:"kayak_doubtful",  category:"kayak",title:"Doubtful Sound",       location:"Fiordland, New Zealand",       lat:-45.3000,lon:167.0000,ap:"ZQN",icon:"\u{1F6F6}",rating:4.96,reviews:820,gradient:"linear-gradient(160deg,#002a1a,#005a3a,#00b374)",accent:"#40d090",tags:["Pristine Fiords","Dolphins","Overnight Paddle","Rainforest Shoreline","Remote"],photo:"https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=600&fit=crop"},
{id:"kayak_halong",    category:"kayak",title:"Ha Long Bay",          location:"Quang Ninh, Vietnam",          lat:20.9101,lon:107.1839,ap:"HAN",icon:"\u{1F6F6}",rating:4.94,reviews:2100,gradient:"linear-gradient(160deg,#001a2a,#004060,#0088c0)",accent:"#40b0e0",tags:["Limestone Karsts","UNESCO Heritage","Cave Exploration","Emerald Waters","Sunrise Paddle"],photo:"https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop"},
{id:"kayak_abel",      category:"kayak",title:"Abel Tasman Coast",    location:"Nelson, New Zealand",          lat:-40.9500,lon:173.0000,ap:"NSN",icon:"\u{1F6F6}",rating:4.92,reviews:1540,gradient:"linear-gradient(160deg,#0a2a1a,#1a5a3a,#30b070)",accent:"#50d090",tags:["Golden Beaches","Seal Colonies","Multi-Day Trip","Crystal Clear","Coastal Track"],photo:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop"},
{id:"kayak_glacier",   category:"kayak",title:"Glacier Bay",          location:"Alaska, USA",                  lat:58.6658,lon:-136.9002,ap:"JNU",icon:"\u{1F6F6}",rating:4.95,reviews:620,gradient:"linear-gradient(160deg,#0c4a6e,#0369a1,#38bdf8)",accent:"#7dd3fc",tags:["Glacier Paddling","Whale Watching","Calving Ice","Wilderness","Bear Country"],photo:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop"},

// ─── MTB additions (currently 1 venue) ───────────────────────────────────────
{id:"mtb_whistler",    category:"mtb",title:"Whistler Bike Park",     location:"British Columbia, Canada",     lat:50.1163,lon:-122.9574,ap:"YVR",icon:"\u{1F6B5}",rating:4.97,reviews:3200,gradient:"linear-gradient(160deg,#1a0a00,#5a2a00,#c06020)",accent:"#e08040",tags:["Bike Park Legend","Lift-Accessed","All Levels","Jump Lines","Alpine Singletrack"],photo:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop"},
{id:"mtb_finale",      category:"mtb",title:"Finale Ligure",          location:"Liguria, Italy",               lat:44.1694,lon:8.3403,ap:"GOA",icon:"\u{1F6B5}",rating:4.93,reviews:1800,gradient:"linear-gradient(160deg,#2a1000,#6a3000,#d06828)",accent:"#e89048",tags:["Mediterranean Trails","Year-Round Riding","Enduro Mecca","Sea Views","Trail Network"],photo:"https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop"},
{id:"mtb_rotorua",     category:"mtb",title:"Whakarewarewa Forest",   location:"Rotorua, New Zealand",         lat:-38.1368,lon:176.2497,ap:"ROT",icon:"\u{1F6B5}",rating:4.91,reviews:1400,gradient:"linear-gradient(160deg,#1a1000,#5a3010,#b06828)",accent:"#d08848",tags:["Redwood Forest","Volcanic Terrain","Night Riding","Flow Trails","Geothermal"],photo:"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&h=600&fit=crop"},

// ─── FISHING additions (currently 1 venue) ───────────────────────────────────
{id:"fish_bonefish",   category:"fishing",title:"Bonefish Flats",     location:"Andros Island, Bahamas",       lat:24.7000,lon:-77.7700,ap:"NAS",icon:"\u{1F3A3}",rating:4.95,reviews:960,gradient:"linear-gradient(160deg,#001828,#004870,#0090d0)",accent:"#40b8f0",tags:["Bonefishing Capital","Fly Fishing","Crystal Flats","World Record Waters","Guided Wading"],photo:"https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&h=600&fit=crop"},
{id:"fish_patagonia",  category:"fishing",title:"Rio Gallegos",        location:"Santa Cruz, Argentina",        lat:-51.6230,lon:-69.2168,ap:"RGL",icon:"\u{1F3A3}",rating:4.93,reviews:640,gradient:"linear-gradient(160deg,#001020,#003858,#0078b8)",accent:"#3098d0",tags:["Sea-Run Brown Trout","Patagonia Wilderness","Fly Fishing Paradise","Remote Rivers","Nov-Apr Season"],photo:"https://images.unsplash.com/photo-1531973819741-e27a5ae2cc7b?w=800&h=600&fit=crop"},
{id:"fish_christmas",  category:"fishing",title:"Christmas Island",    location:"Kiribati, Central Pacific",    lat:1.8721,lon:-157.4750,ap:"CXI",icon:"\u{1F3A3}",rating:4.94,reviews:380,gradient:"linear-gradient(160deg,#002038,#005080,#00a0e0)",accent:"#48c8f8",tags:["Bonefish Paradise","Remote Atoll","Fly Fishing Mecca","Saltwater Flats","Pristine Reef"],photo:"https://images.unsplash.com/photo-1516962126636-27ad087061cc?w=800&h=600&fit=crop"},
```

**AP_CONTINENT additions needed if these venues are added:**
```javascript
JNU:"na",     // Juneau, Alaska
HAN:"asia",   // Hanoi, Vietnam
NSN:"oceania",// Nelson, New Zealand
GOA:"europe", // Genoa, Italy
ROT:"oceania",// Rotorua, New Zealand
NAS:"na",     // Nassau, Bahamas
RGL:"latam",  // Rio Gallegos, Argentina
CXI:"oceania",// Christmas Island, Kiribati
```

---

## 7. One Data Gap Hurting User Experience Right Now

**Stub categories with visible UI pills.** When a user taps "Kayak", "MTB", "Fishing", or "Paraglide" in the category pill bar, they see exactly 1 venue. This signals an incomplete or abandoned product more than having no category at all.

**Immediate options:**
- **(A) Best:** Add 8-10 venues per stub category to reach credibility (~60 venues, gets to 200+ target too)
- **(B) Quick patch:** Hide categories with fewer than 5 venues from the pill bar until populated

---

## 8. Priority Actions (ordered)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | **Expand tags from 2 to 5+ on 182 venues** | Completeness jumps from 5% to ~100%. Vibe search accuracy improves dramatically. | Medium (bulk but mechanical) |
| 2 | **Add ~60 venues across 7 stub categories** | All categories become credible. Total hits 200+ target. | High (needs research per venue) |
| 3 | **Fix 1 duplicate photo** (rajaampat/sipadan) | Minor visual fix | Trivial |
| 4 | **Add `desc` field to venues** | Detail sheets get prose descriptions instead of just tags + conditions | High (192 descriptions to write) |
| 5 | **Add `bestMonths` and `difficulty` fields** | Enables seasonal filtering and skill-level matching | Medium |

---

*Next audit targets: all categories at 10+ venues, tag count at 5+ per venue (100% completeness), total venues at 200+.*
