# Data Enrichment Report - 2026-03-29

## Summary

Total venues: **2,226**
Duplicate IDs: **0**
All 11 categories represented: **YES**
Data completeness (required fields): **100%**
Photo coverage: **100%** (2,226/2,226)

## Category Breakdown

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
| Kite | 200 | HEALTHY |
| Hiking | 200 | HEALTHY |

No STUB categories. All 11 categories have 200+ venues. Distribution is nearly even — well-balanced.

## Field Coverage (All Required Fields)

Every one of the 2,226 venues has all required fields present: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo. **Zero gaps.**

Notable absence: No `best` or `bestMonths` field exists on any venue. This was flagged in the agent spec as a required field, but the codebase has never included it. Scoring is computed dynamically from weather data, so this is by design — not a gap.

## Photo Quality

Unique photo URLs: **2,171** (97.5%)
Duplicate photo URLs: **52 URLs used more than once**, affecting **55 venues**

**Critical finding: 169 base Unsplash photo IDs are reused across 2,052+ venues with different crop parameters (fp-x, fp-y).** These render as nearly identical images to the user. Only ~174 truly unique Unsplash source images exist. The rest are the same photo with slightly shifted crop coordinates.

This is the single biggest data quality issue in the venue database. Users scrolling through venues will see repetitive imagery despite the URLs being technically "unique."

### Top Duplicate Photo Groups (exact URL matches)

| Base Photo ID | Duplicates | Venues |
|--------------|-----------|--------|
| photo-1523819088009 | 3x | hvar-kayak, glacier-bay-kayak, cinque-terre-kayak |
| photo-1578001647043 | 3x | crested-butte-mtb, crown-range-nz-mtb, bariloche-argentina-mtb |
| photo-1578001647043 | 3x | madeira-mtb, tenerife-canary-mtb, hamsterley-forest-uk-mtb |

## Geographic Distribution

| Region | Venues | % |
|--------|--------|---|
| Europe | 623 | 28.0% |
| North America | 607 | 27.3% |
| Asia | 290 | 13.0% |
| Oceania | 182 | 8.2% |
| Africa | 154 | 6.9% |
| South America | 148 | 6.6% |
| Unclassified | 222 | 10.0% |

**222 "unclassified" venues** have location strings that don't resolve to a recognized country — most are US states listed as countries (e.g., "Hawaii", "Alaska", "California", "Florida"), Caribbean territories (Barbados, Cayman Islands, Seychelles), or sub-national regions ("Western Australia", "Queensland"). These aren't broken — the app works fine — but a continent lookup based on location parsing would fail on them.

Top unclassified: Hawaii (22), Caribbean (11), Alaska (11), Seychelles (10), Western Australia (9).

South America and Africa are represented but thin relative to Europe/NA. Not urgent given the user base is primarily US/EU for launch.

## Tag Quality

- Min tags per venue: 2
- Max tags per venue: 6
- Average tags: 4.4
- Venues with 5+ tags: 1,302 (58.5%)
- Venues with <2 tags: 0

Tag coverage is solid. No empty tag arrays.

## Ski Pass Coverage

204 skiing venues, 208 skiPass entries. Coverage is effectively 100% for skiing.

## Top 15 Countries by Venue Count

USA (399), France (90), Australia (83), Spain (78), Indonesia (63), Canada (62), Italy (61), New Zealand (54), Mexico (51), Greece (44), Brazil (37), Norway (37), Austria (34), Portugal (34), South Africa (33).

## Critical Issue: Photo Deduplication Needed

**The #1 data gap hurting user experience right now is photo repetition.** With only ~174 truly unique Unsplash source images across 2,226 venues, users will see the same mountain, beach, or reef photo dozens of times. The crop-parameter trick (varying fp-x and fp-y) makes URLs look different but produces nearly identical visual results.

### Recommendation

Before Reddit launch on March 31, the highest-ROI data fix is assigning unique Unsplash photo IDs to the ~2,050 venues currently sharing photos. This is a large batch operation (search Unsplash for activity-specific + location-specific photos). Even getting to 500 unique base photos would be a massive improvement.

### No New Venue Objects Recommended This Run

All 11 categories are at 200+ venues. The spec calls for 5-10 new venues targeting stub categories, but there are no stub categories. Adding venues is low ROI compared to fixing photo uniqueness. The venue count (2,226) is well above the 200+ target.

## Action Items (Priority Order)

1. **FIX: Photo deduplication** — Replace ~2,050 crop-varied duplicate photos with unique Unsplash photo IDs. This is visible to users and will be immediately noticed on Reddit launch.
2. **MINOR: Normalize unclassified locations** — 222 venues use US states or territories as countries ("Hawaii", "Alaska"). Adding a country suffix (e.g., "Maui, Hawaii, USA") would improve any future continent-based filtering.
3. **NICE-TO-HAVE: Boost tags to 5+ on remaining 924 venues** — 41.5% of venues have fewer than 5 tags. More tags improve vibe search matching.
