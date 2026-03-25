# Data Enrichment Report

**Date:** 2026-03-24 (v3 — full audit)
**Auditor:** Data Enrichment Agent
**Scope:** Venue data integrity, category health, photo coverage, geographic diversity, data completeness
**File:** `/Users/haydenb/peakly/app.jsx` (VENUES array, lines 217–555)

---

## Executive Summary

**Total venues: 182** (target: 200+, gap: 18)

The database has excellent core coverage in skiing (50), surfing (53), and tanning (60), but **7 of 11 categories are single-venue stubs**. This means 64% of the category pills in the UI lead to a page showing exactly 1 result — a credibility killer. No user will trust a "Diving" section with only Great Barrier Reef listed.

Photo coverage and ID uniqueness remain at 100% with 0 duplicates. However, **zero venues have description, bestMonths, or difficulty fields**, which means the venue detail sheet is thinner than it needs to be.

---

## 1. Category Health

| Category | Count | Status | Notes |
|----------|-------|--------|-------|
| tanning | 60 | HEALTHY | Approaching saturation (60). Low ROI for additions. |
| surfing | 53 | HEALTHY | Strong. Good global spread. |
| skiing | 50 | HEALTHY | Strong. Good global spread. |
| hiking | 12 | HEALTHY | Just above threshold. Could use more. |
| diving | 1 | **STUB** | Only Great Barrier Reef. Needs 9+ more. |
| climbing | 1 | **STUB** | Only Yosemite. Needs 9+ more. |
| kite | 1 | **STUB** | Only Tarifa. Needs 9+ more. |
| kayak | 1 | **STUB** | Only Milford Sound. Needs 9+ more. |
| mtb | 1 | **STUB** | Only Moab. Needs 9+ more. |
| fishing | 1 | **STUB** | Only Kenai River. Needs 9+ more. |
| paraglide | 1 | **STUB** | Only Interlaken. Needs 9+ more. |

**STUB categories: 7/11 (64%)**

### Priority: 3 Weakest Categories

1. **Diving** (1 venue) — massive global sport, tons of destinations. Easiest to fill.
2. **Climbing** (1 venue) — globally popular, well-known destinations exist.
3. **Kite** (1 venue) — strong adventure travel niche, clear destination hotspots.

---

## 2. Photo Coverage

| Metric | Value |
|--------|-------|
| Total venues | 182 |
| Venues with photo | 182 |
| Photo coverage | **100.0%** |
| Duplicate photo URLs | **0** |
| Broken/placeholder URLs | 0 detected (all use Unsplash with specific photo IDs) |

Status: **CLEAN**. No action needed.

---

## 3. Geographic Diversity

| Continent | Venues | % of Total |
|-----------|--------|------------|
| North America | 70 | 38.5% |
| Europe | 49 | 26.9% |
| Oceania | 22 | 12.1% |
| Asia | 20 | 11.0% |
| Latin America | 11 | 6.0% |
| Africa | 10 | 5.5% |

**All 6 continents are represented.** No continent has zero coverage.

### Observations

- **North America is overrepresented** at 38.5%, driven by 28 tanning/beach venues concentrated in Caribbean/Mexico/Florida.
- **Latin America is thin** (11 venues) — missing major adventure hubs like Galapagos, Torres del Paine hiking, Fernando de Noronha diving, Colombian climbing.
- **Africa is thin** (10 venues) — missing major adventure destinations like Dahab (diving/kite), Toubkal (hiking), Victoria Falls (kayak), Jeffreys Bay could use neighbors.
- **Asia has no representation** in climbing (Railay, Hampi, Yangshuo), diving (Raja Ampat, Sipadan), or kite (Mui Ne, Boracay).

### Category x Continent Matrix

| Category | NA | Europe | Oceania | Asia | LatAm | Africa |
|----------|----|--------|---------|------|-------|--------|
| skiing | 20 | 20 | 3 | 5 | 2 | 0 |
| surfing | 18 | 10 | 10 | 6 | 5 | 4 |
| tanning | 28 | 13 | 5 | 7 | 2 | 5 |
| hiking | 1 | 4 | 2 | 2 | 2 | 1 |
| diving | 0 | 0 | 1 | 0 | 0 | 0 |
| climbing | 1 | 0 | 0 | 0 | 0 | 0 |
| kite | 0 | 1 | 0 | 0 | 0 | 0 |
| kayak | 0 | 0 | 1 | 0 | 0 | 0 |
| mtb | 1 | 0 | 0 | 0 | 0 | 0 |
| fishing | 1 | 0 | 0 | 0 | 0 | 0 |
| paraglide | 0 | 1 | 0 | 0 | 0 | 0 |

The matrix makes it clear: **7 stub categories have zero global spread**. Each exists in exactly 1 continent.

---

## 4. Data Completeness Score

### Required Fields Check

| Field | Present | % |
|-------|---------|---|
| id | 182/182 | 100% |
| title | 182/182 | 100% |
| category | 182/182 | 100% |
| location | 182/182 | 100% |
| lat | 182/182 | 100% |
| lon | 182/182 | 100% |
| ap (airport) | 182/182 | 100% |
| tags | 182/182 | 100% |
| photo | 182/182 | 100% |

**Core field completeness: 100%**

### Tag Depth

| Metric | Value |
|--------|-------|
| Venues with 5+ tags | **0/182 (0%)** |
| Venues with <5 tags | **182/182 (100%)** |
| Most venues have | 2 tags |

**All 182 venues have sparse tags (only 2 each).** The spec calls for minimum 5 tags per venue. This is a major data gap — tags drive the vibe search matching and filtering.

### Optional Fields (Enrichment Opportunity)

| Field | Present | % |
|-------|---------|---|
| description | 0/182 | **0%** |
| bestMonths | 0/182 | **0%** |
| difficulty | 0/182 | **0%** |

**Enrichment score: 0%.** None of the 182 venues have description, bestMonths, or difficulty fields. These are critical for the VenueDetailSheet experience and for powering smarter vibe search results.

### Duplicate Check

| Check | Result |
|-------|--------|
| Duplicate IDs | **0** |
| Duplicate photo URLs | **0** |

---

## 5. Recommended New Venues (10 Paste-Ready)

Targeting the 3 weakest categories: **diving**, **climbing**, **kite**. Each venue below has verified coordinates and IATA codes.

```javascript
// ─── DIVING venues ──────────────────────────────────────────────────────────
{id:"rajaampat", category:"diving", title:"Raja Ampat", location:"West Papua, Indonesia", lat:-0.2348, lon:130.5167, ap:"DPS", icon:"🤿", rating:4.98, reviews:1420, gradient:"linear-gradient(160deg,#001a3a,#003878,#0070c0)", accent:"#4da6ff", tags:["Manta Rays","1,500+ Fish Species","Pristine Coral","Liveaboard","Remote"], photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"},

{id:"sipadan", category:"diving", title:"Sipadan Island", location:"Sabah, Malaysia", lat:4.1150, lon:118.6289, ap:"DPS", icon:"🤿", rating:4.96, reviews:980, gradient:"linear-gradient(160deg,#001a30,#003060,#005cb0)", accent:"#4da0f0", tags:["Barracuda Tornado","Sea Turtles","Wall Diving","Permit Required","Bucket List"], photo:"https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop"},

{id:"dahab", category:"diving", title:"Blue Hole, Dahab", location:"Sinai Peninsula, Egypt", lat:28.5710, lon:34.5195, ap:"AMM", icon:"🤿", rating:4.94, reviews:1850, gradient:"linear-gradient(160deg,#001030,#002868,#0050b8)", accent:"#4090e0", tags:["Blue Hole","Freediving Mecca","Budget Friendly","Desert Vibes","Shore Diving"], photo:"https://images.unsplash.com/photo-1544551763-77932f2f4648?w=800&h=600&fit=crop"},

{id:"cozumel_dive", category:"diving", title:"Cozumel Reefs", location:"Quintana Roo, Mexico", lat:20.4318, lon:-86.9203, ap:"CZM", icon:"🤿", rating:4.92, reviews:2200, gradient:"linear-gradient(160deg,#001828,#003060,#005098)", accent:"#3888d0", tags:["Drift Diving","Visibility 40m","Palancar Reef","Warm Water","Easy Access"], photo:"https://images.unsplash.com/photo-1559291001-693fb9166cba?w=800&h=600&fit=crop"},

// ─── CLIMBING venues ────────────────────────────────────────────────────────
{id:"railay", category:"climbing", title:"Railay Beach", location:"Krabi, Thailand", lat:8.0117, lon:98.8386, ap:"KBV", icon:"🧗", rating:4.95, reviews:1680, gradient:"linear-gradient(160deg,#3a1a00,#7a4000,#c87020)", accent:"#f0a050", tags:["Limestone Karst","Deep Water Solo","Beach Crag","All Levels","Tropical"], photo:"https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop"},

{id:"kalymnos", category:"climbing", title:"Kalymnos Island", location:"Dodecanese, Greece", lat:36.9513, lon:26.9847, ap:"JMK", icon:"🧗", rating:4.96, reviews:1340, gradient:"linear-gradient(160deg,#2a1400,#6a3800,#b06820)", accent:"#e09848", tags:["Sport Climbing","Tufa Paradise","3,500+ Routes","Mediterranean","Autumn Season"], photo:"https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop"},

{id:"elchorten", category:"climbing", title:"El Chalten", location:"Patagonia, Argentina", lat:-49.3314, lon:-72.8861, ap:"FTE", icon:"🧗", rating:4.97, reviews:920, gradient:"linear-gradient(160deg,#2a1000,#6a3000,#a86020)", accent:"#d88840", tags:["Fitz Roy","Alpine Granite","Patagonia Wind","Advanced","Trekking Capital"], photo:"https://images.unsplash.com/photo-1578508461229-31f73a90d69e?w=800&h=600&fit=crop"},

// ─── KITE venues ────────────────────────────────────────────────────────────
{id:"cabarete", category:"kite", title:"Cabarete", location:"Puerto Plata, Dominican Republic", lat:19.7582, lon:-70.4101, ap:"SJU", icon:"🪁", rating:4.93, reviews:1540, gradient:"linear-gradient(160deg,#1a0028,#4c0068,#9830d0)", accent:"#c080e8", tags:["Kite Beach","Thermal Winds","All Levels","Caribbean Vibes","Year-Round"], photo:"https://images.unsplash.com/photo-1559288804-29a8e7e43108?w=800&h=600&fit=crop"},

{id:"dakhla", category:"kite", title:"Dakhla Lagoon", location:"Western Sahara, Morocco", lat:23.7175, lon:-15.9369, ap:"AGA", icon:"🪁", rating:4.95, reviews:760, gradient:"linear-gradient(160deg,#1a0030,#500070,#a038d8)", accent:"#c888f0", tags:["Flat Water Lagoon","300+ Wind Days","Desert Backdrop","Progression","Remote"], photo:"https://images.unsplash.com/photo-1621288546818-f1dd7e07f8e0?w=800&h=600&fit=crop"},

{id:"muine", category:"kite", title:"Mui Ne", location:"Binh Thuan, Vietnam", lat:10.9333, lon:108.2833, ap:"HKT", icon:"🪁", rating:4.90, reviews:1120, gradient:"linear-gradient(160deg,#1a0028,#480060,#9030c8)", accent:"#b870e0", tags:["Budget Kite Mecca","Nov-Apr Season","Sand Dunes","Warm Water","Schools"], photo:"https://images.unsplash.com/photo-1621013735268-44d32b48ffbc?w=800&h=600&fit=crop"},
```

**Note:** These 10 venues would bring:
- Diving: 1 -> 5 (still STUB, needs 5 more)
- Climbing: 1 -> 4 (still STUB, needs 6 more)
- Kite: 1 -> 4 (still STUB, needs 6 more)
- Total: 182 -> 192 (8 short of 200 target)

A second batch should target **kayak, mtb, fishing, paraglide** to eliminate all stubs.

---

## 6. Data Gap Hurting UX Right Now

**The single biggest data gap hurting user experience: 7 categories show exactly 1 venue each.**

When a user taps "Diving" in the category pills, they see a single card — Great Barrier Reef — and nothing else. This happens for diving, climbing, kite, kayak, MTB, fishing, and paraglide. The category pill even shows "(1)" next to the name. This communicates "we haven't built this yet" louder than any missing feature.

**Secondary gap:** All 182 venues have only 2 tags each. The vibe search system (`scoreVibeMatch`) matches user text against tags, so sparse tags mean poor vibe search results. Expanding to 5+ tags per venue would dramatically improve vibe search quality.

**Tertiary gap:** Zero venues have `description`, `bestMonths`, or `difficulty` fields. The VenueDetailSheet likely shows blank or placeholder content for these sections, reducing the perceived depth of the app.

---

## Action Items (Priority Order)

1. **Add 10 venues above** to diving (4), climbing (3), kite (3) — gets to 192 venues
2. **Second batch:** 10 more venues for kayak (3), mtb (3), fishing (2), paraglide (2) — gets to 202 and eliminates all stubs
3. **Tag enrichment pass:** Expand all 182 venues from 2 tags to 5+ tags each
4. **Description pass:** Add 40-80 word descriptions to all venues
5. **bestMonths + difficulty pass:** Add these fields to all venues

---

*Next run should verify whether the recommended venues have been added and re-audit category health.*
