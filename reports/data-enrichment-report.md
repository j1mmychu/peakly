# Data Enrichment Report

**Date:** 2026-03-25 (v9 -- scheduled audit)
**Auditor:** Data Enrichment Agent
**Scope:** Venue data integrity, category health, photo coverage, geographic diversity, data completeness
**File:** `app.jsx` (VENUES array, line 289)
**Mode:** Audit only -- no files edited

---

## Executive Summary

**Total venues: 2,226** (target 200+ -- exceeded by 11x)

The VENUES array has expanded massively from 192 to 2,226 since the last quality trim. All 11 categories now have 200+ venues (no stubs remain), and all 6 continents are covered. However, this expansion introduced a **critical regression: 142 duplicate Unsplash photo URLs reused across 1,918+ venue instances.** One single photo appears on 83 different venues.

**What changed since last report:**
- +2,010 venues (216 -> 2,226), spread evenly across all 11 categories
- All 7 former stub categories resolved (each now has 200+ venues)
- Duplicate photos went from 14 -> 142 unique URLs reused (SEVERE regression)
- Geographic coverage improved: all 6 continents well-represented
- Tag depth unchanged (2 tags per venue standard)

**Key conflict with CLAUDE.md:** The decisions log states "192 venues is enough for launch. Quality > count." and "Venue expansion CUT until post-launch." The expansion to 2,226 contradicts these decisions and reintroduced the exact photo duplication problem that was deliberately solved in the 333->192 trim.

---

## 1. Category Health

| Category | Count | Status | vs. Last |
|----------|-------|--------|----------|
| climbing | 204 | SATURATED | was 4 (STUB) |
| diving | 205 | SATURATED | was 5 (STUB) |
| fishing | 202 | SATURATED | was 1 (STUB) |
| hiking | 200 | SATURATED | was 12 |
| kayak | 201 | SATURATED | was 1 (STUB) |
| kite | 200 | SATURATED | was 4 (STUB) |
| mtb | 201 | SATURATED | was 1 (STUB) |
| paraglide | 201 | SATURATED | was 1 (STUB) |
| skiing | 204 | SATURATED | was 74 |
| surfing | 203 | SATURATED | was 53 |
| tanning | 205 | SATURATED | was 60 |

**All 11 categories are SATURATED (>60 venues each).** Distribution is remarkably even (200-205 per category). No stubs remain. The previous 7 single-venue stub categories are fully resolved.

**3 weakest:** kite (200), hiking (200), kayak (201) -- all healthy, no action needed.

**Assessment:** Category gaps are no longer a concern. No new venues should target category fill.

---

## 2. Photo Coverage

- **Coverage: 100%** (2,226/2,226 venues have a `photo` URL)
- **CRITICAL: 142 duplicate photo URLs** reused across venues, totaling 1,918 extra instances

**Worst offenders:**

| Uses | Photo ID |
|------|----------|
| 83x | photo-1544551763-88c0c3a2efc0 |
| 79x | photo-1559827291-72ebf78e3545 |
| 65x | photo-1560881036-1f10fe2a5f3f |
| 62x | photo-1464822759023-fed0d8ca6c41 |
| 61x | photo-1483728642-a170930cf937 |
| 52x | photo-1516026672634-00b27e18f2f7 |
| 48x | photo-1519681393784-d1b22eac64d2 |
| 47x | photo-1478462665307-44aba6a46f43 |
| 45x | photo-1531722569936-825d4eec7dba |
| 42x | photo-1526139015560-85c10da68082 |

**Impact:** Users scrolling through venue cards will see the same photo dozens of times. This destroys credibility and makes the app look auto-generated. The previous trim from 333 to 192 achieved 100% unique photos -- the expansion back to 2,226 fully reversed that work.

**Recommendation:** Revert to the curated ~192-venue dataset (aligns with CLAUDE.md decisions), OR source ~2,000 unique Unsplash URLs before shipping the expanded set.

---

## 3. Geographic Diversity

| Continent | Venues | Share |
|-----------|--------|-------|
| Europe | 681 | 30.6% |
| North America | 675 | 30.3% |
| Asia | 297 | 13.3% |
| South America | 211 | 9.5% |
| Africa | 185 | 8.3% |
| Oceania | 174 | 7.8% |
| Unknown | 3 | 0.1% |

All 6 continents are well-represented. Europe and North America dominate (~61% combined), which reflects the target user base.

**3 unresolved venues** (continent not inferrable from location string):
- `cape-verde-kayak`: Cape Verde Sea Kayaking (Sao Vicente, Cape Verde) -- should be Africa
- `reunion-island-fishing`: Reunion Island (Saint-Denis, Reunion) -- should be Africa
- `cape-verde-paraglide`: Santo Antao Paragliding (Ribeira Grande, Cape Verde) -- should be Africa

### Continent-Category Matrix

|  | climb | dive | fish | hike | kayak | kite | mtb | paraglide | ski | surf | tan |
|--|-------|------|------|------|-------|------|-----|-----------|-----|------|-----|
| Africa | 8 | 32 | 18 | 15 | 13 | 38 | 5 | 13 | 1 | 22 | 20 |
| Asia | 10 | 69 | 24 | 26 | 31 | 16 | 5 | 36 | 8 | 38 | 34 |
| Europe | 79 | 28 | 37 | 79 | 60 | 66 | 69 | 93 | 88 | 37 | 45 |
| N. America | 73 | 42 | 77 | 52 | 54 | 47 | 96 | 29 | 93 | 52 | 60 |
| Oceania | 27 | 21 | 12 | 14 | 19 | 14 | 14 | 8 | 7 | 23 | 15 |
| S. America | 7 | 13 | 33 | 14 | 23 | 19 | 12 | 21 | 7 | 31 | 31 |

**Notable sparse cells:**
- Africa skiing: 1 venue
- Africa MTB: 5 venues
- Asia climbing: 10 venues
- Asia MTB: 5 venues
- S. America climbing: 7 venues
- S. America skiing: 7 venues
- Oceania paragliding: 8 venues
- Oceania skiing: 7 venues

These are not urgent given overall category health, but represent improvement opportunities for geographic depth.

---

## 4. Data Completeness Score

### Core Fields (present on all venues)

| Field | Coverage |
|-------|----------|
| id | 2,226/2,226 (100%) |
| category | 2,226/2,226 (100%) |
| title | 2,226/2,226 (100%) |
| location | 2,226/2,226 (100%) |
| lat/lon | 2,226/2,226 (100%) |
| ap (airport) | 2,226/2,226 (100%) |
| photo | 2,226/2,226 (100%) |
| tags (2+) | 2,226/2,226 (100%) |
| rating | 2,226/2,226 (100%) |
| reviews | 2,226/2,226 (100%) |

**Structural completeness: 100%** -- all venues will render without errors.

### Schema Note

The current venue schema uses a compact format: `title` (not `name`), `location` (not separate `country`/`continent`), `lat`/`lon` (not `coordinates` object), `ap` (not `nearestAirport`), single `photo` (not `photos` array). The agent prompt's expected fields (`description`, `difficulty`, `bestMonths`) are **not present on the expanded venues.** If VenueDetailSheet relies on these fields, expanded venues will show blank content.

### Tag Depth

All venues have exactly 2 tags. The agent prompt targets 5+ tags per venue. At 2 tags, vibe search and filtering are limited. This is unchanged from the last report.

**Overall completeness score: 52%** (core fields 100%, optional fields 0%, tag depth below target).

---

## 5. Daily Additions -- NOT RECOMMENDED

The agent prompt asks for 5-10 new venues targeting stub categories. Since:
- All 11 categories have 200+ venues (no stubs)
- CLAUDE.md states "192 venues is enough for launch" and "Venue expansion CUT until post-launch"
- Photo duplication is already severe

**No new venues should be added.** The priority is quality remediation, not further expansion.

---

## 6. Critical Data Gap Hurting UX Right Now

**Photo duplication is the #1 data quality issue.** 142 Unsplash URLs are reused across 1,918+ venue instances. Users scrolling any category will see the same stock photo on dozens of different venues. This directly undermines the app's credibility and conflicts with the explicit decision "Photos before features. A polished app with fewer features beats a feature-rich app that looks unfinished."

**The fix is one of:**
1. **Revert to ~192 curated venues** with unique photos (aligns with documented decisions)
2. **Source ~2,000 unique Unsplash URLs** and assign one per venue (labor-intensive but preserves expanded dataset)
3. **Trim to ~300-400 venues** as a middle ground, ensuring each has a unique photo

**Secondary issue:** 0% of venues have `description`, `difficulty`, or `bestMonths` fields. VenueDetailSheet likely shows empty content for the 2,000+ expanded venues.

---

## Recommendations (Priority Order)

1. **Resolve the 192-vs-2226 venue count question.** The codebase contradicts the CLAUDE.md decisions. Someone expanded venues after the deliberate trim. Decision needed: keep 2,226 or revert to curated set?
2. **Fix photo duplication** -- either by trimming or sourcing unique URLs. This is a launch blocker for credibility.
3. **Add description/difficulty/bestMonths** to whatever venue set survives the trim decision. Without these, VenueDetailSheet is hollow.
4. **Enrich tags to 5+ per venue** -- improves vibe search, filtering, and matching quality.
5. **Fix 3 unresolved continent assignments** (Cape Verde x2, Reunion Island).

---

## Summary Table

| Metric | Last Cycle (v8) | Current (v9) | Target | Status |
|--------|----------------|--------------|--------|--------|
| Total venues | 216 | 2,226 | 200+ | PASS (but conflicts with decisions) |
| Categories 10+ venues | 4/11 | 11/11 | 11/11 | PASS |
| Photo coverage | 100% | 100% | 100% | PASS |
| Duplicate photos | 14 | 142 | 0 | SEVERE REGRESSION |
| Duplicate IDs | 0 | 0 | 0 | PASS |
| Required field completeness | 100% | 100% | 100% | PASS |
| Venues with 5+ tags | 0% | 0% | 100% | FAIL |
| Overall completeness | 52% | 52% | 90%+ | FAIL |
| Continents represented | 6/6 | 6/6 | 6/6 | PASS |
