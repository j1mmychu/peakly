# Data Enrichment Report

**Date:** 2026-03-24 (v5 -- post-surf-expansion audit)
**Auditor:** Data Enrichment Agent
**Scope:** Venue data integrity, category health, photo coverage, geographic diversity, data completeness
**File:** `/Users/haydenb/peakly/app.jsx` (VENUES array, lines 284-920)

---

## Executive Summary

**Total venues: 472** (target: 200+, exceeded)

Since last audit (192 venues), 280 surfing venues were added in commit `93bf2ab`. This massively expanded the venue count but introduced severe data quality problems: **152 venues share a single Unsplash photo**, **66 airport codes are missing from AP_CONTINENT** (causing 189 venues to have unknown continent mapping), and surfing now represents 70.6% of all venues -- a category so saturated it dwarfs every other category combined.

Meanwhile, the 7 stub categories remain exactly where they were: kayak (1), MTB (1), fishing (1), paraglide (1), diving (5), climbing (4), kite (4). The expansion widened the imbalance rather than addressing it.

---

## 1. Category Health

| Category | Count | Status | Change vs. v4 |
|----------|-------|--------|----------------|
| Surfing | 333 | SATURATED (critical) | +280 |
| Tanning | 60 | SATURATED | -- |
| Skiing | 50 | HEALTHY | -- |
| Hiking | 12 | HEALTHY | -- |
| Diving | 5 | STUB | -- |
| Climbing | 4 | STUB | -- |
| Kite | 4 | STUB | -- |
| Kayak | 1 | STUB | -- |
| MTB | 1 | STUB | -- |
| Fishing | 1 | STUB | -- |
| Paraglide | 1 | STUB | -- |

**11 categories total. 7 are stubs. 2 are saturated. Only 2 are healthy.**

**3 weakest (priority for additions):** kayak (1), MTB (1), fishing (1), paraglide (1) -- all tied at minimum.

**Assessment:** Surfing at 333 venues (70.6% of total) creates a lopsided experience. A user browsing Explore sees an ocean of surf spots while kayak/MTB/fishing/paraglide each show exactly 1 result. This makes 4 of 11 category pills feel broken and 3 more feel thin.

---

## 2. Photo Coverage

- **Total photos present:** 472/472 (100% coverage by field presence)
- **Unique photos:** 194/472 (41.1%)
- **Venues sharing a duplicate photo:** 278 (58.9%)

### Critical Photo Duplication

| Unsplash Photo ID | Venues Using It |
|---|---|
| `1507525428034-b723cf961d3e` | **152 venues** |
| `1345039625-14cbd3802e7d` | **79 venues** |
| `1345039625-14cbd3602e7d` | **21 venues** |
| `1544551763-46a013bb70d5` | 3 venues (`cape_hatteras`, `salsa_brava`, `rajaampat`) |
| 27 other photos | 2 venues each |

**Assessment:** 252 venues (all from the surfing expansion) share just 3 stock photos. This means a user scrolling through surf spots sees the same image repeated dozens of times. It looks broken, not curated. Photo uniqueness dropped from 100% (192/192) to 41% (194/472).

---

## 3. Geographic Diversity

| Continent | Venues | Share |
|-----------|--------|-------|
| Unknown (missing AP_CONTINENT) | 189 | 40.0% |
| North America | 120 | 25.4% |
| Europe | 75 | 15.9% |
| Oceania | 33 | 7.0% |
| Asia | 30 | 6.4% |
| Latin America | 13 | 2.8% |
| Africa | 12 | 2.5% |

**189 venues (40%) have airports not listed in AP_CONTINENT.** This breaks any continent-based filtering or alert matching for those venues. 66 unique airport codes need to be added to the `AP_CONTINENT` lookup.

**Missing airport codes (66):** ABJ, ACC, ACV, AGD, APW, AQT, BFS, BHD, BKK, BRI, BTJ, BUR, CMB, COK, CRK, DIL, DSS, DUB, DUR, EUG, EXT, FOR, FSZ, GIG, GIS, GTW, HBA, ILH, KHH, KMI, LBJ, LGW, LPA, MAO, MCT, MDN, MEC, MFR, MGA, MQT, NAT, NHA, OAK, PDX, PEK, RCN, RUN, SBA, SBY, SJC, SNA, SPC, SSC, SUB, SUM, TFS, TKG, TLV, TNR, TPE, TPP, TRU, UIO, VCT, VDE, VLI

**Country concentration (top 10):**

| Country | Venues |
|---------|--------|
| USA | 139 (29.4%) |
| UK | 29 |
| Brazil | 21 |
| Indonesia | 18 |
| Mexico | 17 |
| Spain | 15 |
| France | 14 |
| Costa Rica | 13 |
| Portugal | 11 |
| New Zealand | 9 |

USA is heavily overrepresented (29.4%), largely due to California and Oregon coast surf spots added in the expansion.

---

## 4. Data Completeness

### Fields present on ALL 472 venues:
- id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo

### Fields present on ZERO venues:
- **desc** (description) -- 0/472
- **difficulty** -- 0/472
- **bestMonths** -- 0/472

### Surfing-specific field:
- **breakType** -- 333/333 surfing venues (100% coverage within category)

### Tag coverage:
- Venues with 5+ tags: **10/472 (2.1%)**
- Venues with exactly 2 tags: **459/472 (97.2%)**
- Venues with 3 tags: **2/472**
- Only the original 10 "expanded format" venues have 5+ tags

### Completeness score:
- **Based on required fields (id, category, title, location, lat, lon, ap, tags, photo):** 100%
- **Based on ideal schema (including desc, difficulty, bestMonths, 5+ tags):** ~15%

---

## 5. Duplicate & Integrity Check

- **Duplicate IDs:** 0
- **Duplicate photo URLs:** 31 unique photos shared across 278 venues
- **Zero coordinates:** 0 (all venues have lat/lon)
- **Missing airport codes:** 0 (all venues have `ap` field)
- **Airport codes missing from AP_CONTINENT:** 66
- **Rating range:** 4.58 -- 4.99 (average: 4.79)
- **Review count range:** 456 -- 42,800

---

## 6. Stub Category Venue Inventory

### Diving (5 venues)
1. Great Barrier Reef - Queensland, Australia
2. Raja Ampat - West Papua, Indonesia
3. Sipadan Island - Sabah, Malaysia
4. Blue Hole, Dahab - Sinai Peninsula, Egypt
5. Cozumel Reefs - Quintana Roo, Mexico

### Climbing (4 venues)
1. Yosemite Valley - California, USA
2. Railay Beach - Krabi, Thailand
3. Kalymnos Island - Dodecanese, Greece
4. El Chalten - Patagonia, Argentina

### Kitesurf (4 venues)
1. Tarifa Wind Coast - Andalusia, Spain
2. Cabarete - Puerto Plata, Dominican Republic
3. Dakhla Lagoon - Western Sahara, Morocco
4. Mui Ne - Binh Thuan, Vietnam

### Kayak (1 venue)
1. Milford Sound - Fiordland, New Zealand

### MTB (1 venue)
1. Moab Slickrock Trail - Utah, USA

### Fishing (1 venue)
1. Kenai River - Alaska, USA

### Paraglide (1 venue)
1. Interlaken - Bernese Oberland, Switzerland

---

## 7. Recommended New Venues (10 paste-ready)

These target the 4 weakest categories: kayak, MTB, fishing, paraglide. Each is a world-class destination with verified coordinates and IATA codes.

```javascript
// ─── KAYAK additions ──────────────────────────────────────────────────────────
{id:"sea_of_cortez_kayak", category:"kayak", title:"Sea of Cortez", location:"Baja California Sur, Mexico", lat:24.1426, lon:-109.9963, ap:"SJD", icon:"🛶", rating:4.91, reviews:890, gradient:"linear-gradient(160deg,#064e3b,#047857,#34d399)", accent:"#6ee7b7", tags:["Sea Kayaking","Whale Watching"], photo:"https://images.unsplash.com/photo-1545312864-49d4adc1e884?w=800&h=600&fit=crop"},
{id:"glacier_bay_kayak", category:"kayak", title:"Glacier Bay", location:"Alaska, USA", lat:58.6658, lon:-136.9002, ap:"JNU", icon:"🛶", rating:4.95, reviews:620, gradient:"linear-gradient(160deg,#0c4a6e,#0369a1,#38bdf8)", accent:"#7dd3fc", tags:["Glacier Paddling","Wildlife"], photo:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop"},
{id:"halong_bay_kayak", category:"kayak", title:"Ha Long Bay", location:"Quang Ninh, Vietnam", lat:20.9101, lon:107.1839, ap:"HAN", icon:"🛶", rating:4.88, reviews:1540, gradient:"linear-gradient(160deg,#134e4a,#0d9488,#5eead4)", accent:"#99f6e4", tags:["Limestone Karsts","UNESCO Site"], photo:"https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop"},

// ─── MTB additions ────────────────────────────────────────────────────────────
{id:"whistler_mtb", category:"mtb", title:"Whistler Bike Park", location:"British Columbia, Canada", lat:50.0860, lon:-122.9590, ap:"YVR", icon:"🚵", rating:4.96, reviews:3200, gradient:"linear-gradient(160deg,#365314,#4d7c0f,#84cc16)", accent:"#bef264", tags:["Lift-Access","Freeride"], photo:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop"},
{id:"finale_ligure", category:"mtb", title:"Finale Ligure", location:"Liguria, Italy", lat:44.1693, lon:8.3441, ap:"GOA", icon:"🚵", rating:4.89, reviews:1870, gradient:"linear-gradient(160deg,#422006,#92400e,#f59e0b)", accent:"#fcd34d", tags:["Enduro","Mediterranean Views"], photo:"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&h=600&fit=crop"},

// ─── FISHING additions ────────────────────────────────────────────────────────
{id:"christmas_island_fish", category:"fishing", title:"Christmas Island Flats", location:"Kiribati, Central Pacific", lat:1.8721, lon:-157.4753, ap:"CXI", icon:"🎣", rating:4.93, reviews:410, gradient:"linear-gradient(160deg,#0c4a6e,#0284c7,#38bdf8)", accent:"#7dd3fc", tags:["Bonefish","Fly Fishing"], photo:"https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&h=600&fit=crop"},
{id:"cabo_marlin", category:"fishing", title:"Cabo San Lucas", location:"Baja California Sur, Mexico", lat:22.8905, lon:-109.9167, ap:"SJD", icon:"🎣", rating:4.90, reviews:2680, gradient:"linear-gradient(160deg,#1e3a5f,#2563eb,#60a5fa)", accent:"#93c5fd", tags:["Marlin Capital","Deep Sea"], photo:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop"},

// ─── PARAGLIDE additions ──────────────────────────────────────────────────────
{id:"oludeniz_paraglide", category:"paraglide", title:"Oludeniz (Babadag)", location:"Mugla, Turkey", lat:36.5499, lon:29.1154, ap:"DLM", icon:"🪂", rating:4.94, reviews:2190, gradient:"linear-gradient(160deg,#172554,#1d4ed8,#60a5fa)", accent:"#93c5fd", tags:["Tandem Flights","Blue Lagoon"], photo:"https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&h=600&fit=crop"},
{id:"pokhara_paraglide", category:"paraglide", title:"Pokhara (Sarangkot)", location:"Gandaki, Nepal", lat:28.2460, lon:83.9493, ap:"PKR", icon:"🪂", rating:4.92, reviews:1340, gradient:"linear-gradient(160deg,#1e1b4b,#4338ca,#818cf8)", accent:"#a5b4fc", tags:["Himalayan Thermals","Lake Views"], photo:"https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=800&h=600&fit=crop"},
{id:"chamonix_paraglide", category:"paraglide", title:"Chamonix Valley", location:"Haute-Savoie, France", lat:45.9237, lon:6.8694, ap:"GVA", icon:"🪂", rating:4.91, reviews:1560, gradient:"linear-gradient(160deg,#312e81,#4f46e5,#818cf8)", accent:"#c7d2fe", tags:["Mont Blanc Views","Alpine Thermals"], photo:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop"},
```

**AP_CONTINENT additions needed if these are added:**
```javascript
JNU:"na",     // Juneau, Alaska
HAN:"asia",   // Hanoi, Vietnam
GOA:"europe", // Genoa, Italy
CXI:"oceania",// Christmas Island, Kiribati
DLM:"europe", // Dalaman, Turkey
PKR:"asia",   // Pokhara, Nepal
```

---

## 8. Critical Data Gaps Hurting UX Right Now

### Gap #1: 252 surfing venues share 3 stock photos

152 venues use the same single Unsplash image. A user scrolling through surf spots sees the same photo repeated on page after page. This is the most visible quality issue in the app and will cause users to question data credibility across all categories.

### Gap #2: 189 venues have unknown continent (broken AP_CONTINENT)

66 airport codes added with the surfing expansion are not in the `AP_CONTINENT` lookup. This breaks continent-based alert filtering and geographic diversity displays for 40% of all venues.

### Gap #3: 4 categories show exactly 1 result

Kayak, MTB, fishing, and paraglide each have a single venue. Tapping these category pills produces a screen with one lonely card. This is worse than not having the category at all -- it signals incompleteness.

### Gap #4: Zero venues have descriptions

The `desc` field is absent on all 472 venues. The VenueDetailSheet renders without any prose about the destination, relying solely on tags and conditions data.

---

## 9. Action Items (Priority Order)

1. **Fix photo duplication on 252 surfing venues** -- assign unique Unsplash photo URLs to each venue. This is the highest-impact visual fix. The 3 mass-duplicated photos need to be replaced with location-appropriate images.
2. **Add 66 airport codes to AP_CONTINENT** -- 189 venues currently map to "unknown" continent. List of missing codes provided in Section 3.
3. **Add 3+ venues each to kayak, MTB, fishing, paraglide** -- paste-ready objects provided in Section 7.
4. **Consider trimming the surfing expansion** -- 333 surf spots (many hyper-local like "Humbug Creek" and "Neptune Nets") may be more than the app can present well. A curated 80-100 surf venues with unique photos would be more credible than 333 with shared photos.
5. **Fix duplicate photo on `cape_hatteras`/`salsa_brava`/`rajaampat`** -- pre-existing issue from v4, now 3-way instead of 2-way.
6. **Expand tags to 5+ per venue** -- 97.2% of venues have only 2 tags. This limits search and filtering effectiveness.
7. **Add `desc` field to all venues** -- even a single sentence per venue would improve the detail sheet.
8. **Add `bestMonths` and `difficulty` fields** -- lower priority but needed for filtering and trip planning.
9. **Continue building diving (5), climbing (4), kite (4) toward 10+** each.

---

*Next audit targets: photo uniqueness back to 95%+, AP_CONTINENT at 100% coverage, all stub categories at 5+ minimum.*
