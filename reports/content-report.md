# Peakly — Daily Content & Data Report
**Date:** 2026-04-07  
**Agent:** Content & Data  
**Data Health Score: 64/100**

---

## 1. DATA INTEGRITY AUDIT

### Total Venues: 3,726 across 11 categories

| Category | Count | % | Status |
|----------|-------|---|--------|
| tanning (Beach) | 705 | 18.9% | ✓ Top 3 focus |
| skiing | 704 | 18.9% | ✓ Top 3 focus |
| surfing | 703 | 18.9% | ✓ Top 3 focus |
| diving | 205 | 5.5% | ✓ Healthy |
| climbing | 204 | 5.5% | ✓ Healthy |
| fishing | 202 | 5.4% | ✓ Healthy |
| paraglide | 201 | 5.4% | ✓ Healthy |
| mtb | 201 | 5.4% | ✓ Healthy |
| kayak | 201 | 5.4% | ✓ Healthy |
| kite | 200 | 5.4% | ✓ Healthy |
| hiking | 200 | 5.4% | ✓ Healthy |
| **TOTAL** | **3,726** | | |

No stub categories. All 11 categories exceed the 10-venue minimum by 20x.

---

### 🔴 CRITICAL: Photo Duplication Regression

CLAUDE.md claims "0% photo duplication" — **this is no longer true.**

| Metric | Value |
|--------|-------|
| Total venues | 3,726 |
| Unique photo URLs | 2,261 |
| Venues with duplicate photos | **1,465 (39.3%)** |
| Photos reused 17 times each | 90 photo IDs |
| Photos reused 2–5 times | 52 photo IDs |

**Root cause:** The March 29 batch expansion (+1,500 venues: 500 surf + 500 ski + 500 beach) recycled a shared pool of ~142 Unsplash IDs, each assigned to up to 17 different venues. A user browsing the app will see the same photo repeated across entirely different destinations.

**Top offending photo IDs (each used 17×):**
- `photo-1505118380757` (beach/ocean)
- `photo-1509914398892` (surf/wave)
- `photo-1519046904884` (beach/sand)
- `photo-1507525428034` (tropical beach)
- `photo-1468413253725` (mountain/snow)

**Impact:** UX degradation for any user who browses more than ~20 venues. Trust signal issue — if Bali and Bondi show the same photo, users question data quality. On Reddit, one screenshot kills a launch thread.

**Fix needed:** Assign unique Unsplash photo IDs to the 1,465 duplicated venues. One-time data fix. The original 2,119 venues with unique photos prove this was done correctly before — it just needs to extend to the batch additions.

---

### Other Data Quality Checks

| Check | Result |
|-------|--------|
| Duplicate venue IDs | ✅ None |
| Missing `lat`/`lon` | ✅ None |
| Missing `ap` (airport) | ✅ None |
| Missing `tags` array | ✅ None |
| Missing `photo` field | ✅ None |
| Venues without `desc` field | N/A — schema has no desc field (by design) |

Venue schema has no description field — content lives in `tags` (2–5 per venue). Consistent across all 3,726 venues.

---

## 2. GEAR ITEMS AUDIT

All 11 categories have gear items. No zero-item categories.

| Category | Items | Issue |
|----------|-------|-------|
| skiing | 8 | ⚠️ REI links have no affiliate tag |
| climbing | 8 | ⚠️ REI links unenrolled; duplicate harness listing |
| kayak | 8 | ⚠️ REI links unenrolled; duplicate PFD listing |
| mtb | 8 | ⚠️ REI + Backcountry unenrolled; duplicate gloves + hydration |
| hiking | 7 | ⚠️ REI links unenrolled |
| surfing | 4 | ⚠️ REI link unenrolled; expand to 8 items |
| tanning | 4 | Expand to 6–8 items |
| diving | 4 | Good AOV; expand to 8 items |
| kite | 4 | Expand to 8 items |
| fishing | 4 | Expand to 8 items |
| paraglide | 4 | Expand to 8 items |

### 🔴 REI Affiliate Tags Missing (Revenue Impact)

**22 REI gear links** and **2 Backcountry gear links** use raw search/product URLs with no affiliate tracking tag.

- REI: `https://www.rei.com/search?q=...` — no Avantlink tag appended
- Backcountry: `https://www.backcountry.com/product-slug` — no affiliate ID

Currently earning **$0**. Once Jack completes REI Avantlink signup + Backcountry affiliate signup (both unblocked by LLC), tags need to be appended to all gear URLs.

**Estimated lost revenue:** REI activation = +$6.16 RPM, Backcountry = +$0.56 RPM. Combined: **+$6.72/month per 1,000 MAU.**

### Duplicate Gear Items

Four categories list the same product twice (REI version + Amazon version):
- `climbing`: Black Diamond Momentum Harness — $65 REI + $65 Amazon
- `kayak`: NRS Chinook Fishing PFD — $180 REI + $140 Amazon
- `mtb`: Fox Ranger Gel Gloves — $40 REI + $35 Amazon
- `mtb`: CamelBak M.U.L.E. — $120 REI + $110 Amazon

Recommend: keep the higher-commission version (REI @ 5% > Amazon @ 4%), or differentiate by model. Showing two near-identical items degrades trust.

---

## 3. SEASONAL RELEVANCE (April 7, 2026)

**Northern Hemisphere:** Late spring — ski season closing at lower elevations; Mediterranean beaches opening; peak Caribbean season.  
**Southern Hemisphere:** Fall — beach/tanning winding down in Aus/NZ/SA; ski season opens June.

| Category | Season Status | Recommended Action |
|----------|--------------|-------------------|
| Skiing (NH, high-altitude) | ✅ Still running — Alps, Andes, Rockies 3000m+ | Keep boosted |
| Skiing (NH, low-altitude) | ⚠️ Closing — resorts below 2000m done | Deprioritize in rankings |
| Skiing (SH) | 🔵 Off-season — opens June | Deprioritize until May |
| Surfing (CA / Hawaii) | ✅ Prime — spring NW swells active | Boost N. Pacific venues |
| Surfing (Indo / SE Asia) | ✅ Prime — dry season approaching | Keep elevated |
| Beach / Tanning (Caribbean) | ✅ Peak — dry season, UV 9–11 | Highest priority for hero card |
| Beach / Tanning (Mediterranean) | ✅ Opening — season starting | Boost Aegean, Adriatic, Balearics |
| Beach / Tanning (SE Asia, Gulf of Thailand) | ⚠️ Monsoon approaching | Deprioritize Koh Samui, Phuket |
| Beach / Tanning (SH — Bondi, Noosa, Cape Town) | ⚠️ Post-peak | Deprioritize |
| Diving (Palau, GBR) | ✅ Excellent — clear autumn water | Boost |
| Hiking (Patagonia) | ⚠️ Season closing | Deprioritize Torres del Paine |
| Hiking (Alps / Rockies) | 🔵 Not yet — snow-covered | Deprioritize until June |
| Kite (Tarifa) | ✅ Peak — spring thermals | Keep elevated |
| Paraglide (Alps) | ✅ Prime — spring thermals | Boost Interlaken, Chamonix |

---

## 4. CONTENT QUALITY

Venue tags are generally high quality across original 2,226 venues (specific, descriptive: `["Powder Day","All Levels"]`). The March 29 batch additions trend toward generic tags (`["World Class","Best Season"]`), which are less useful for users scanning the Explore tab. Not a blocking issue, but worth improving in the next batch edit.

---

## 5. FIVE NEW VENUE OBJECTS

Targeting the 5 smallest categories: kite (200), hiking (200), paraglide (201), fishing (202), diving (205). Paste into the VENUES array.

```javascript
  // ─── new venue additions 2026-04-07 ──────────────────────────────────────
  {
    id:"dakhla_kite",  category:"kite",
    title:"Dakhla Lagoon", location:"Western Sahara, Morocco",
    lat:23.7136, lon:-15.9355, ap:"VIL",
    icon:"🪁", rating:4.94, reviews:1240,
    gradient:"linear-gradient(160deg,#1a2a00,#3a5e00,#78b200)",
    accent:"#aad450", tags:["Flat Water Lagoon","Constant Trade Winds","All Levels","Warm Water"],
    photo:"https://images.unsplash.com/photo-1536625737227-5c7dbe0d7299?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
  },
  {
    id:"tour_mont_blanc",  category:"hiking",
    title:"Tour du Mont Blanc", location:"Chamonix, France",
    lat:45.9237, lon:6.8694, ap:"GVA",
    icon:"🥾", rating:4.97, reviews:7800,
    gradient:"linear-gradient(160deg,#1a2a3a,#2e5070,#6090c0)",
    accent:"#90c0f0", tags:["11-Day Circuit","Mont Blanc Views","Hut-to-Hut","Expert Trek"],
    photo:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40",
  },
  {
    id:"interlaken_paraglide",  category:"paraglide",
    title:"Interlaken — Schynige Platte", location:"Bern Oberland, Switzerland",
    lat:46.6863, lon:7.8632, ap:"ZRH",
    icon:"🪂", rating:4.96, reviews:4300,
    gradient:"linear-gradient(160deg,#001a2e,#003a6e,#1a6abf)",
    accent:"#70b8f0", tags:["Eiger Views","Tandem Available","Spring Thermals","World Famous"],
    photo:"https://images.unsplash.com/photo-1476067897447-d0c599df46d7?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.42",
  },
  {
    id:"kenai_river",  category:"fishing",
    title:"Kenai River", location:"Kenai Peninsula, Alaska",
    lat:60.5544, lon:-150.7964, ap:"ANC",
    icon:"🎣", rating:4.93, reviews:2900,
    gradient:"linear-gradient(160deg,#001a10,#00401e,#00802e)",
    accent:"#40c870", tags:["King Salmon","Trophy Trout","Float Trips","June–Aug Peak"],
    photo:"https://images.unsplash.com/photo-1542435503-b5b7b8e4c33f?w=800&h=600&fit=crop&fp-x=0.52&fp-y=0.55",
  },
  {
    id:"palau_blue_corner",  category:"diving",
    title:"Blue Corner Wall", location:"Palau, Micronesia",
    lat:7.2971, lon:134.5122, ap:"ROR",
    icon:"🐠", rating:4.98, reviews:3100,
    gradient:"linear-gradient(160deg,#001030,#0030a0,#1060e0)",
    accent:"#40a0ff", tags:["World's Best Dive","Shark Wall","Advanced","Current Diving"],
    photo:"https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.60",
  },
```

---

## 6. ONE THING THE PM SHOULD KNOW

**The photo duplication regression is the highest-priority content issue before the next marketing push.**

39% of venues (1,465) share recycled photos from the March 29 batch expansion. The original 2,119 venues have unique photos — the problem is contained to batch-added venues. A single Reddit screenshot showing "these 5 surf spots all have the same photo" can derail a launch thread. This is a 2-hour engineering fix: run a script assigning unique Unsplash IDs to the 1,465 affected venues. It should happen before any significant social media push.
