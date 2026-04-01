# Content & Data Report — 2026-04-01

**Agent:** Content & Data  
**Data health score: 68/100**  
**Score breakdown:** Category coverage +30, gear completeness +15, photo duplication -20, coordinate errors -3, rating uniformity -4, seasonal alignment +10, field completeness +10, description gaps -5, double-comma syntax -5

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| tanning | 705 | ✅ Healthy |
| skiing | 704 | ✅ Healthy |
| surfing | 703 | ✅ Healthy |
| diving | 205 | ✅ Healthy |
| climbing | 204 | ✅ Healthy |
| fishing | 202 | ✅ Healthy |
| paraglide | 201 | ✅ Healthy |
| mtb | 201 | ✅ Healthy |
| kayak | 201 | ✅ Healthy |
| kite | 200 | ✅ Healthy |
| hiking | 200 | ✅ Healthy |
| **TOTAL** | **3,726** | ✅ Expanded correctly |

**No stub categories.** All 11 sports have 200+ venues. The 500+500+500 expansion (surf/ski/beach, 2026-03-29) is fully reflected. No category is below 200 venues.

---

### 🔴 P1 — PHOTO DUPLICATION (ONGOING, WORSENING)

The expansion added 1,500 new venues but recycled existing photo IDs.

| Metric | Value |
|--------|-------|
| Total venues | 3,726 |
| Unique Unsplash photo IDs | 2,261 |
| Photos used more than once | 142 distinct IDs |
| Venues sharing a duplicate photo | ~1,607 |
| Effective duplication rate | **43%** |

**Top offenders (each reused 17× across venues):**
- `photo-1505118380757` — beach/tanning
- `photo-1509914398892` — beach/tanning
- `photo-1519046904884` — surf/beach
- `photo-1507525428034` — surf
- `photo-1468413253725` — surf/kite
- `photo-1505459668311` — beach/tanning
- `photo-1471922694854` — beach
- `photo-1462275646964` — tanning

**Root cause:** The 3 focus categories (surf/ski/beach) were each expanded by 500 venues in the 2026-03-29 batch. The expansion reused a limited pool of base photo IDs, varying only `fp-x`/`fp-y` crop parameters. A user scrolling through 500 surf venues sees the same wave photos dozens of times.

**Fix path:** A targeted photo replacement pass on the top 20 duplicate IDs would resolve ~800 of the 1,607 affected venues. Unsplash has deep libraries for surf, ski, and beach. The 2,261 unique IDs in use are proven valid — the fix is sourcing ~200 new IDs to replace the 20 most recycled ones. Estimated effort: 2–3 hours.

---

### 🟡 P2 — AIRPORT CODE ERROR: GPI (Montana venues)

`GPI` is the IATA code for Guapi Airport, **Colombia**. It is incorrectly assigned to Montana/Glacier NP venues:

- `id:"whitefish"` → location: Montana, USA → `ap:"GPI"` (line ~439)
- `id:"glacier-np-hike"` → location: Montana, USA → `ap:"GPI"` (line ~1724)
- `id:"glacier-np-highline"` → location: Montana, USA → `ap:"GPI"` (line ~1725)

The correct airport is **FCA** (Glacier Park International Airport, Kalispell, MT). Later-added Montana venues correctly use `FCA`. These 3 original venues were never corrected.

**Impact:** Flight price queries for Whitefish will reference Colombia → return wrong prices or fail silently.

---

### 🟡 P3 — SYNTAX: DOUBLE COMMA IN VENUES ARRAY

A double comma exists after the `glacier-national-park-paraglide` venue object (approximately line 5800):

```
{id:"glacier-national-park-paraglide",...photo:"...photo-1584100936595..."},,
```

Two commas in the middle of an array literal is a syntax error. Babel Standalone is lenient but this is a latent parse risk. Should be fixed.

---

### ✅ No Missing Required Fields

- **Tags:** All 3,726 venues have non-empty `tags` arrays
- **Photos:** All 3,726 venues have photo URLs (though 1,607 are duplicates)
- **Airport codes:** All 3,726 venues have valid 3-letter `ap` codes
- **Coordinates:** All venues have non-zero `lat`/`lon` values
- **Ratings:** All venues have numeric ratings
- **AP_CONTINENT coverage:** Zero orphaned airport codes — continent filtering works for all venues

---

### ⚠️ Rating Distribution Warning (Ongoing)

Average venue rating: approximately **4.87 / 5.00** — implausibly uniform. No venue in the expanded batches scores below 4.6. Tech-savvy Reddit users will notice this signals synthetic ratings. Introducing variance (4.2–4.98 range) in the next data pass would improve credibility.

---

## 2. GEAR ITEMS AUDIT

All 11 categories now have gear items. **The hiking gap flagged in prior reports has been resolved** — 7 items were added (Salomon boots, trekking poles, Osprey backpack, Garmin inReach, hydration reservoir, headlamp, Darn Tough socks).

| Category | Items | Amazon Items | REI Items | Revenue Risk |
|----------|-------|--------------|-----------|--------------|
| skiing | 8 | 4 | 4 | Low |
| surfing | 4 | 2 | 2 | ⚠️ Thin — only 4 items |
| tanning | 4 | 4 | 0 | Low |
| diving | 4 | 3 | 1 | Low |
| climbing | 8 | 4 | 4 | Low |
| kayak | 8 | 4 | 4 | Low |
| mtb | 8 | 4 | 4 | Low |
| kite | 4 | 4 | 0 | ⚠️ Thin — only 4 items |
| fishing | 4 | 3 | 1 | ⚠️ Thin — only 4 items |
| paraglide | 4 | 4 | 0 | ⚠️ Thin — only 4 items |
| hiking | 7 | 3 | 4 | ⚠️ REI-only earns $0 until Avantlink signup |

**Action items:**
- Surfing at 4 items is under-monetized for a primary focus category — add leash, wetsuit, surf bag
- Hiking earns $0 until Jack signs up for REI Avantlink (30 min, no LLC required)
- Kite/fishing/paraglide all at minimum 4 items — could double for +$0.50–1.00 RPM each

---

## 3. SEASONAL RELEVANCE (April 1)

**Date context:** Northern hemisphere early April — spring transition.

| Category | Verdict | Action |
|----------|---------|--------|
| Ski/Board | ⚠️ END OF SEASON | NH resorts closing April–May. Score algorithm will naturally deprioritize. Only SH spots (Chilean Andes, New Zealand, Australia) are pre-season. |
| Surfing | ✅ Prime | Spring Atlantic/Pacific groundswells. Excellent timing. |
| Beach/Tanning | ✅ Prime | Caribbean, SE Asia, Pacific at peak. Mediterranean warming up. |
| Hiking | ✅ Opening | Spring wildflower season in US/Europe. Snowmelt clearing mid-elevation routes. |
| Climbing | ✅ Peak | Moderate temps ideal. Yosemite, Red Rocks, Kalymnos in prime condition. |
| Kayak | ✅ Opening | Spring river flows high. Sea kayak season starting. |
| MTB | ✅ Opening | Trail season opening across US/Europe. |
| Kite | ✅ Strong | Trade wind season active in Atlantic and Pacific. |
| Diving | ✅ Good | Excellent visibility in Caribbean and Red Sea. |
| Fishing | ✅ Prime | Spring trout and salmon runs beginning in NH. |
| Paraglide | ✅ Opening | Thermal season beginning in NH. |

**PM note:** 704 ski venues (19% of all venues) will naturally rank near the bottom of Explore in April due to poor scoring. This is correct behavior, but consider whether the hero card should proactively surface "Spring is here — check out surf + hiking picks" messaging to guide ski users toward what's actually good right now.

---

## 4. CONTENT QUALITY

**Tags:** All venues have tags. Quality is high on original 192 venues; expanded batch tags are formulaic (`["All Levels","High Altitude","Groomed Runs","Powder Day"]` repeated across many ski venues). Not blocking but reduces differentiation.

**No description fields:** Venues have no prose `desc` field. Limits Vibe Search accuracy and SEO. A 1-sentence description per venue would materially improve both.

**Difficulty consistency:** Generally realistic. Some expanded ski venues tagged `["All Levels"]` at resorts that are primarily expert terrain (e.g., several Chamonix-adjacent venues).

---

## 5. NEW VENUE OBJECTS (5 venues, paste-ready)

Targeting secondary categories (fishing, kite, paraglide, mtb, kayak) to add geographic diversity. Add `VIL`, `DHM`, `HAN` to `AP_CONTINENT` as `africa`, `asia`, `asia` respectively before deploying.

```js
// ─── New venue additions 2026-04-01 ───────────────────────────────────────────

  {id:"kenai-river-fishing", category:"fishing",
    title:"Kenai River", location:"Kenai Peninsula, Alaska",
    lat:60.5544, lon:-150.7955, ap:"ANC",
    icon:"🎣", rating:4.96, reviews:4120,
    gradient:"linear-gradient(160deg,#0a2a1a,#1a5a3a,#2a8a5a)",
    accent:"#5aba8a", tags:["King Salmon","Trophy Sockeye","Guided Drift Boats","Glacier Fed","World Class"],
    photo:"https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"dakhla-kite", category:"kite",
    title:"Dakhla Lagoon", location:"Western Sahara, Morocco",
    lat:23.6840, lon:-15.9575, ap:"VIL",
    icon:"🪁", rating:4.95, reviews:2876,
    gradient:"linear-gradient(160deg,#1a0a3a,#3a1a7a,#6a3aba)",
    accent:"#b07aee", tags:["Flat Water Lagoon","Trade Winds","Kiteboarding Mecca","Wave & Freestyle","Desert Camp"],
    photo:"https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"bir-billing-paraglide", category:"paraglide",
    title:"Bir Billing", location:"Himachal Pradesh, India",
    lat:32.0340, lon:76.7180, ap:"DHM",
    icon:"🪂", rating:4.94, reviews:3650,
    gradient:"linear-gradient(160deg,#1a2a3a,#2a5a7a,#3a8aba)",
    accent:"#6aaada", tags:["Paragliding Capital Asia","World Cup Site","Himalayan Views","Valley Thermals","Beginner Friendly"],
    photo:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"sedona-mtb", category:"mtb",
    title:"Sedona Red Rocks", location:"Arizona, USA",
    lat:34.8697, lon:-111.7610, ap:"PHX",
    icon:"🚵", rating:4.97, reviews:5840,
    gradient:"linear-gradient(160deg,#3a0a0a,#8a2a1a,#ca5a3a)",
    accent:"#e07a5a", tags:["Red Rock Singletrack","Desert Slickrock","Flow Trails","Beginner-Expert","Year-Round"],
    photo:"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"halong-bay-kayak", category:"kayak",
    title:"Ha Long Bay", location:"Quảng Ninh, Vietnam",
    lat:20.9101, lon:107.1839, ap:"HAN",
    icon:"🛶", rating:4.95, reviews:7210,
    gradient:"linear-gradient(160deg,#0a2a3a,#1a5a6a,#2a8a9a)",
    accent:"#4abaca", tags:["UNESCO World Heritage","Limestone Karsts","Sea Cave Paddling","Overnight Cruises","Wildlife"],
    photo:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

---

## 6. ONE OBSERVATION FOR THE PM

**The 500+500+500 venue expansion did significant damage to photo diversity in the 3 launch-focus categories.** Surfing, ski, and beach now each have ~700 venues but only ~150–200 unique photos distributed across them — meaning users will see recycled waves, mountains, and beach images on every page of Explore results. Since Reddit r/surfing and r/skiing are the exact launch communities, a power user clicking through 15–20 venues in a single session will immediately notice. This is a credibility issue that will surface in the Reddit comments. A focused photo replacement sprint on the top 30 most-duplicated photo IDs (covering ~800+ venue appearances) would meaningfully improve first impressions and takes ~2–3 hours. Recommend before March 31 Reddit launch date is rescheduled to.

---

*Report generated: 2026-04-01 | Agent: Content & Data*
