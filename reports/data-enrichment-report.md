# Peakly Data Enrichment Report — 2026-03-27

## Summary

- **Total venues:** 2,226 (target: 200+ — EXCEEDED)
- **Photo coverage:** 100% (2,226/2,226)
- **Duplicate IDs:** 0
- **Duplicate photos:** 52 photo URLs shared across 104+ venues
- **Data completeness (all required fields + ≥3 tags):** 82.0% (1,826/2,226)
- **Venues missing `best` field (best months):** 2,226/2,226 — no venue has this field

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| tanning | 205 | SATURATED |
| diving | 205 | SATURATED |
| skiing | 204 | SATURATED |
| climbing | 204 | SATURATED |
| surfing | 203 | SATURATED |
| fishing | 202 | SATURATED |
| kayak | 201 | SATURATED |
| mtb | 201 | SATURATED |
| paraglide | 201 | SATURATED |
| kite | 200 | SATURATED |
| hiking | 200 | SATURATED |

All 11 categories are well above the 10-venue HEALTHY threshold. No STUB categories remain. Distribution is remarkably even (~200 each). No new venue additions needed at this time.

---

## Geographic Diversity

| Continent | Venues | Share |
|-----------|--------|-------|
| North America | 675 | 30.3% |
| Europe | 661 | 29.7% |
| Asia | 301 | 13.5% |
| South America | 190 | 8.5% |
| Oceania | 183 | 8.2% |
| Africa | 181 | 8.1% |

All continents represented. North America and Europe dominate (~60% combined), which tracks with the target user base. South America, Oceania, and Africa are thin but present. No continent has zero representation.

---

## Data Quality Issues (Priority Order)

### 1. CRITICAL — 52 Duplicate Photo URLs

52 Unsplash photo URLs are reused across 104+ venues. Worst offenders by category:

- **Kayak:** 1 photo (`photo-1523819088009`) used across 14+ kayak venues
- **MTB:** 2 photos (`photo-1578001647043`, `photo-1512541405516`) each used 8-10 times
- **Fishing:** 1 photo (`photo-1529961482160`) used across 12+ fishing venues
- **Climbing:** 1 photo (`photo-1519904981063`) used across 4+ climbing venues

**Impact:** Users scrolling kayak, MTB, or fishing listings see the same hero image repeatedly. Kills credibility. This is the #1 data quality issue.

**Fix:** Replace duplicated photos with unique Unsplash IDs. Roughly 52 new unique photo URLs needed.

### 2. HIGH — 400 Venues Have Only 2 Tags

400 venues (18%) have only 2 tags. These are the original ~192 venues from the first data set that were never enriched when the expansion to 2,226 happened. Breakdown:

- skiing: 204 venues with <5 tags (entire category)
- climbing: 201 venues with <5 tags
- hiking: 200 venues with <5 tags
- kite: 197 venues with <5 tags
- tanning: 60 venues with <5 tags
- surfing: 53 venues with <5 tags

**Impact:** Tags power the search/filter UX. 2-tag venues have worse discoverability and feel incomplete on the detail sheet.

**Fix:** Enrich all 400 venues to 5 tags each. Estimated effort: scripted batch update.

### 3. MEDIUM — `best` Field Missing on ALL 2,226 Venues

The `best` field (best months to visit) is not present on any venue. The agent spec lists `bestMonths` as a required field, but the codebase doesn't currently use it.

**Impact:** Low for now — the app uses live weather scoring rather than static best-months data. But this field would be valuable for the Forecast Horizon feature (Phase 3 vision) and SEO content.

**Fix:** Defer until Forecast Horizon development begins. Not blocking any current feature.

---

## Data Completeness Score

**82.0%** of venues pass all required field checks (id, category, title, location, lat, lon, ap, photo, gradient, icon, rating, reviews, tags >= 3).

The 18% that fail are exclusively due to having only 2 tags. No venues are missing core fields like coordinates, airport codes, or photos.

---

## Recommendations (No New Venues Needed)

Since all categories are SATURATED (200+ each), the daily additions target is moot. Instead, enrichment priority is:

1. **De-duplicate 52 photo URLs** — swap in unique Unsplash IDs for kayak, MTB, fishing, and climbing venues
2. **Enrich 400 venues from 2 tags to 5 tags** — focus on skiing (204), climbing (201), hiking (200), kite (197) first
3. **No new venues until post-launch** — per CLAUDE.md decisions, 2,226 is sufficient

---

## One Data Gap Hurting UX Right Now

**Duplicate photos in kayak and MTB categories.** A user browsing kayak venues sees the same turquoise water kayak photo 14 times. It makes the expanded venue set feel auto-generated rather than curated. Fixing the 52 duplicate photos is the single highest-impact data quality improvement available today.
