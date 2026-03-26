# Data Enrichment Report

**Date:** 2026-03-25 (v10 -- scheduled audit)
**Auditor:** Data Enrichment Agent
**Scope:** Venue data integrity, category health, photo coverage, geographic diversity, data completeness
**File:** `app.jsx` (VENUES array, line 296)
**Mode:** Audit only -- no files edited

---

## Executive Summary

**Total venues: 2,226** (target 200+ -- exceeded by 11x)

All 11 categories have 200+ venues. Photo duplication has been fully resolved -- 0 duplicate photo URLs across the entire dataset. Geographic coverage spans 214 countries across all 6 continents. No duplicate IDs.

**The critical issue this cycle is photo URL stability.** 92.1% of venues (2,050) use `source.unsplash.com` keyword-search URLs, which are deprecated by Unsplash. These serve random images per page load rather than stable, venue-specific photos. The remaining 176 venues use correct `images.unsplash.com/photo-{ID}` direct links.

**Secondary issue:** 41.5% of venues have fewer than 5 tags. No venues have `description`, `difficulty`, or `bestMonths` fields (these fields are not in the current schema).

---

## 1. Category Health

| Category | Count | Status |
|----------|-------|--------|
| Tanning | 205 | SATURATED |
| Diving | 205 | SATURATED |
| Skiing | 204 | SATURATED |
| Climbing | 204 | SATURATED |
| Surfing | 203 | SATURATED |
| Fishing | 202 | SATURATED |
| Kayak | 201 | SATURATED |
| MTB | 201 | SATURATED |
| Paraglide | 201 | SATURATED |
| Kite | 200 | SATURATED |
| Hiking | 200 | SATURATED |

**No STUB categories.** All 11 categories are at 200+. Distribution is remarkably even (200-205 each). The previous 7 single-venue stub categories are fully resolved.

**3 weakest:** hiking (200), kite (200), paraglide (201) -- gap is negligible, no action needed.

---

## 2. Photo Coverage

- **Coverage:** 100% (2,226/2,226 venues have a `photo` URL)
- **Duplicate photo URLs:** 0 (fully resolved from previous 142-duplicate regression)
- **Duplicate `sig` values:** 3 out of 2,050 (trivial)

### CRITICAL: source.unsplash.com Deprecation

| URL Type | Count | % | Status |
|----------|-------|---|--------|
| `source.unsplash.com` | 2,050 | 92.1% | DEPRECATED -- keyword search, non-deterministic |
| `images.unsplash.com` | 176 | 7.9% | STABLE -- direct photo links |

**`source.unsplash.com` is deprecated by Unsplash.** These URLs (e.g., `source.unsplash.com/800x600/?skiing+snow+mountain&sig=450983`) serve a random image matching the search keywords on each request. Consequences:

1. **Non-deterministic:** User sees a different photo for the same venue on every page load.
2. **Not venue-specific:** A ski resort in Japan and one in Colorado both get random "skiing+snow+mountain" stock images.
3. **Reliability risk:** Unsplash may fully retire this endpoint at any time, breaking 92% of venue photos.

The 176 `images.unsplash.com` URLs (e.g., `images.unsplash.com/photo-1495450778732-202f7f632c4b?w=800&h=600&fit=crop`) are stable, direct links to specific photos. These are the correct format.

**Recommendation:** Migrate all 2,050 `source.unsplash.com` URLs to `images.unsplash.com/photo-{ID}` format. This is the single biggest data quality issue in the dataset.

---

## 3. Geographic Diversity

### By Continent (estimated from coordinates)

| Continent | Venues | % |
|-----------|--------|---|
| North America | 642 | 28.8% |
| Europe | 614 | 27.6% |
| Asia | 311 | 14.0% |
| South America | 216 | 9.7% |
| Africa | 154 | 6.9% |
| Oceania | 130 | 5.8% |
| Middle East | 58 | 2.6% |
| Other | 101 | 4.5% |

All 6 continents are represented. No major adventure destination regions are missing.

### Top 10 Countries (214 total)

| Country | Venues | % |
|---------|--------|---|
| USA | 399 | 17.9% |
| France | 90 | 4.0% |
| Australia | 83 | 3.7% |
| Spain | 78 | 3.5% |
| Indonesia | 63 | 2.8% |
| Canada | 62 | 2.8% |
| Italy | 61 | 2.7% |
| New Zealand | 54 | 2.4% |
| Mexico | 51 | 2.3% |
| Greece | 44 | 2.0% |

US at 17.9% is reasonable. Africa and South America are thinner but still well-covered given realistic venue density.

### US Venues by Category

| Category | US Count | US % of Category |
|----------|---------|-----------------|
| Skiing | 79 | 38.7% |
| Climbing | 70 | 34.3% |
| MTB | 67 | 33.3% |
| Hiking | 46 | 23.0% |
| Fishing | 29 | 14.4% |
| Kayak | 25 | 12.4% |
| Surfing | 24 | 11.8% |
| Kite | 22 | 11.0% |
| Paraglide | 20 | 10.0% |
| Diving | 12 | 5.9% |
| Tanning | 5 | 2.4% |

---

## 4. Data Completeness Score

### Core Fields

| Field | Coverage | Status |
|-------|----------|--------|
| id | 2,226/2,226 | 100% -- 0 duplicates |
| title | 2,226/2,226 | 100% |
| category | 2,226/2,226 | 100% |
| location | 2,226/2,226 | 100% |
| lat | 2,226/2,226 | 100% |
| lon | 2,226/2,226 | 100% |
| ap (airport) | 2,226/2,226 | 100% |
| rating | 2,226/2,226 | 100% |
| photo | 2,226/2,226 | 100% |
| tags | 2,226/2,226 | 100% |

**Structural completeness: 100%** -- all venues will render without errors.

### Fields Not in Schema

| Field | Present | Note |
|-------|---------|------|
| description | 0/2,226 | Not in current venue schema |
| difficulty | 0/2,226 | Not in current venue schema |
| bestMonths | 0/2,226 | Not in current venue schema |

These fields are referenced in the agent spec but do not exist in the actual data model. The app does not currently use them.

### Tags Quality

- **Venues with tags:** 2,226/2,226 (100%)
- **Venues with fewer than 5 tags:** 924 (41.5%)
- **Unique tags:** 3,781
- **Inconsistency:** "Year-Round" (202 uses) vs "Year Round" (106 uses) -- same meaning, different format

**Top tags:** Year-Round (202), Remote (177), Intermediate (171), All Levels (140), Year Round (106), Summer (92), UV 10+ (80), Advanced (75), Beach Break (72), Snorkeling (72)

### Overall Completeness Score: ~58%

Core fields 100%, tags quality 58.5% (threshold: 5+ tags), optional fields 0%.

---

## 5. Daily Additions -- NOT RECOMMENDED

All 11 categories are at 200+ venues. No stubs remain. CLAUDE.md states "192 venues is enough for launch" and "Venue expansion CUT until post-launch." Further additions offer diminishing returns. Priority should be quality remediation on existing venues.

---

## 6. One Data Gap Hurting User Experience Right Now

### source.unsplash.com URLs Serve Random Photos

2,050 of 2,226 venues (92.1%) use `source.unsplash.com` keyword-search URLs. This means:

- **A user viewing "Whistler Blackcomb" sees a random skiing stock photo, not Whistler.**
- **The same venue shows a different photo every time the page loads.**
- **Unsplash has deprecated this endpoint -- it could break entirely at any time.**

This directly contradicts the documented decision: "Photos before features. A polished app with fewer features beats a feature-rich app that looks unfinished."

**Fix:** Replace all 2,050 `source.unsplash.com` URLs with `images.unsplash.com/photo-{ID}` direct links pointing to venue-specific or at minimum category-appropriate stable images.

---

## Summary Table

| Metric | Last Report (v9) | Current (v10) | Target | Status |
|--------|-----------------|---------------|--------|--------|
| Total venues | 2,226 | 2,226 | 200+ | PASS |
| Categories 10+ | 11/11 | 11/11 | 11/11 | PASS |
| Photo coverage | 100% | 100% | 100% | PASS |
| Duplicate photo URLs | 142 | 0 | 0 | PASS (fixed) |
| Duplicate IDs | 0 | 0 | 0 | PASS |
| Stable photo URLs | ~8% | 7.9% | 100% | FAIL (2,050 deprecated) |
| Venues with 5+ tags | 0% | 58.5% | 100% | IMPROVED, still failing |
| Continents represented | 6/6 | 6/6 | 6/6 | PASS |
| Countries | -- | 214 | -- | PASS |
| Overall completeness | 52% | ~58% | 90%+ | FAIL |

---

## Recommendations (Priority Order)

1. **Migrate 2,050 source.unsplash.com URLs to images.unsplash.com direct links.** This is the top data quality issue. Every venue should have a stable, venue-specific photo.
2. **Normalize duplicate tags** -- merge "Year-Round" / "Year Round" and similar inconsistencies.
3. **Enrich tags to 5+ per venue** on the remaining 924 venues below threshold. Improves vibe search and filtering.
4. **Evaluate whether description/difficulty/bestMonths fields should be added** to the venue schema. If VenueDetailSheet expects them, they need to exist.
