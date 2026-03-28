# Peakly Data Enrichment Report -- 2026-03-27 (Updated)

## Summary

- **Total venues:** 2,226 (target 200+ -- EXCEEDED)
- **Categories:** 11, all SATURATED (200+ each)
- **Photo coverage:** 100% of venues have a photo URL
- **Unique base Unsplash photos:** ~176 (CRITICAL -- see below)
- **Duplicate full photo URLs:** 55 exact URL duplicates
- **Data completeness score:** 62% (10 of 16 spec'd fields present)
- **Unique countries/regions:** ~180

---

## 1. Category Health

| Category | Count | Status |
|----------|-------|--------|
| Tanning (Beach) | 205 | SATURATED |
| Diving | 205 | SATURATED |
| Skiing | 204 | SATURATED |
| Climbing | 204 | SATURATED |
| Surfing | 203 | SATURATED |
| Fishing | 202 | SATURATED |
| Paraglide | 201 | SATURATED |
| MTB | 201 | SATURATED |
| Kayak | 201 | SATURATED |
| Kite | 200 | SATURATED |
| Hiking | 200 | SATURATED |

All 11 categories are well above the 10-venue HEALTHY threshold. Distribution is remarkably even (200-205 per category). No STUB categories remain. No new venue additions recommended.

---

## 2. Photo Coverage

- **Venues with photo URL:** 2,226 / 2,226 = 100%
- **Unique full URLs (including crop params):** 2,171 (55 exact duplicates)
- **Unique base Unsplash photo IDs:** ~176

### CRITICAL: Massive Photo Reuse

While CLAUDE.md claims "0% photo duplication across all 2,226 venues," this is only true at the full-URL level. Different `fp-x`/`fp-y` crop coordinates on the same base photo create technically unique URLs. In reality, only **~176 distinct photographs** are used across 2,226 venues -- an average of **12.6 venues per unique photo**.

Top offenders (same base photo reused hundreds of times):

| Base Photo ID | Times Used | Likely Category |
|---------------|-----------|-----------------|
| `photo-1529961482160` | 203 | Fishing |
| `photo-1523819088009` | 202 | Kayak |
| `photo-1578001647043` | 110 | MTB/Climbing |
| `photo-1512541405516` | 92 | General |
| `photo-1559288804-29a8e7e43108` | 77 | Kite |
| `photo-1544551763-77932f2f4648` | 75 | General |
| `photo-1519904981063` | 73 | Climbing |
| `photo-1578508461229` | 72 | Climbing |
| `photo-1559291001-693fb9166cba` | 69 | Diving |
| `photo-1621288546818` | 65 | General |

**User impact:** Browsing any single category (200+ venues) means seeing the same ~16 photos with slightly different crops. This makes the app feel auto-generated and undermines the "Steve Jobs-level quality" goal.

---

## 3. Geographic Diversity

| Region | Approx. Venues | Share | Status |
|--------|---------------|-------|--------|
| North America (USA, Canada, Mexico, Caribbean) | ~550 | ~25% | HEAVY |
| Europe (France, Spain, Italy, UK, Norway, etc.) | ~550 | ~25% | HEAVY |
| Asia-Pacific (Indonesia, Thailand, Philippines, Japan, etc.) | ~350 | ~16% | HEALTHY |
| Oceania (Australia, New Zealand, Fiji, etc.) | ~180 | ~8% | HEALTHY |
| South America (Brazil, Chile, Peru, Argentina, etc.) | ~150 | ~7% | HEALTHY |
| Africa (South Africa, Egypt, Kenya, Morocco, etc.) | ~150 | ~7% | HEALTHY |
| Middle East (Turkey, UAE, Oman, Jordan) | ~50 | ~2% | THIN |
| Central Asia (Kazakhstan, Kyrgyzstan, etc.) | ~20 | ~1% | THIN |

No continent has zero representation. North America and Europe dominate at ~50% combined, which tracks with the target user base. South America and Africa are present with decent counts.

**Location formatting inconsistencies:**
- Some venues use US state names without "USA" (e.g., `"California"`, `"Hawaii"`, `"Alaska"`, `"Florida"`, `"Oregon"`)
- Some have `"NSW"` instead of `"New South Wales, Australia"`
- Duplicate country spellings: `"St Lucia"` vs `"St. Lucia"`, `"Turks & Caicos"` vs `"Turks and Caicos"`, `"Trinidad & Tobago"` vs `"Trinidad and Tobago"`

---

## 4. Data Completeness Score

### Fields Present on All Venues (10/16 = 62%)

| Field | Coverage | Notes |
|-------|----------|-------|
| id | 100% | No venue-level duplicates |
| category | 100% | |
| title | 100% | |
| location | 100% | Formatting inconsistent (see above) |
| lat | 100% | |
| lon | 100% | |
| ap (airport code) | 100% | |
| icon | 100% | |
| rating | 100% | |
| reviews | 100% | |
| tags | 100% | All have 2+ tags |
| photo | 100% | But only ~176 unique base photos |
| gradient | 100% | |
| accent | 100% | |

### Fields Missing Entirely (0% coverage)

| Field | Coverage | Impact |
|-------|----------|--------|
| **continent** | 0% | App uses AP_CONTINENT lookup instead -- no functional impact |
| **description** | 0% | VenueDetailSheet has no venue-specific description. Hurts UX and vibe search. |
| **difficulty** | 0% | Cannot filter by skill level from profile prefs |
| **bestMonths** | 0% | Cannot show "best time to visit" -- core to "Know when to go" positioning |

### Partial Coverage

| Field | Coverage | Notes |
|-------|----------|-------|
| skiPass | ~50% of skiing venues | Ikon/Epic/Independent -- used for ski pass filter pills |
| tags (5+) | ~82% | ~400 venues (original 192 set) have only 2 tags |

---

## 5. Duplicate IDs

No venue-level ID collisions in the VENUES array. IDs like `"all"`, `"score"`, `"skiing"` appear in grep results but belong to CATEGORIES and filter constants, not venues.

---

## 6. New Venue Additions

**Not recommended this cycle.** All 11 categories are SATURATED at 200+. Adding more venues worsens the photo diversity problem and increases API load. Focus should be on enriching existing data quality.

---

## 7. One Data Gap Hurting UX Right Now

**Photo diversity is the #1 data quality problem.** Only ~176 unique Unsplash photographs serve 2,226 venues. Users browsing any single category see the same ~16 photos with slightly different crops. This is the single most damaging quality issue -- it makes an otherwise polished app feel mass-produced.

The previous report flagged "52 duplicate photo URLs" but this understated the problem by an order of magnitude. The true duplication is at the base photo ID level: 2,226 venues sharing 176 photos.

---

## Action Items (Priority Order)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| **P0** | Source 500+ new unique Unsplash photo IDs; assign 1 unique photo per venue for at least top 500 venues | High (scripted) | Eliminates the auto-generated feel |
| **P1** | Enrich ~400 venues from 2 tags to 5+ tags | Medium (scripted) | Improves search, filtering, vibe matching |
| **P1** | Add `description` field (40-80 words) to at least top 100 venues | Medium | Improves VenueDetailSheet and vibe search |
| **P2** | Normalize location formatting (state-only -> state + country, spelling consistency) | Low | Cleaner data, better continent mapping |
| **P2** | Add `bestMonths` field to all venues | Medium | Enables seasonal recommendations -- core to value prop |
| **P3** | Add `difficulty` field | Low-Medium | Enables skill-based filtering from profile |

---

*Report generated 2026-03-27. Next run should verify photo deduplication progress.*
