# Data Enrichment Report

**Date:** 2026-04-10
**Run type:** Scheduled (automated, unattended)
**Source:** `app.jsx` VENUES array (lines 306–4197)
**Total venues parsed:** 3,726

---

## Headline

Field hygiene is clean. The scale of the data is now the problem: 3,726 venues, but only **61% of photos are unique**, **507 venues share duplicate titles**, and **100% of venues are missing the spec-required `best` (best months) field**. The top 3 launch categories (surfing, skiing, tanning/beach) are the worst photo-recyclers at 33% uniqueness each. ProductHunt is 5 days out.

---

## 1. Required-Field Validation

Checked against spec fields: `id, title, location, category, lat, lon, ap, photo, gradient, icon, rating, reviews, tags, best`.

| Field | Missing / Invalid | Notes |
|---|---|---|
| id | 0 | All unique. No duplicate IDs. |
| title | 0 | |
| location | 0 | |
| category | 0 | Values match 11-category taxonomy. |
| lat | 0 | All numeric, in valid range. |
| lon | 0 | All numeric, in valid range. |
| ap | 0 | All 3-letter IATA codes (813 distinct). |
| photo | 0 | 100% coverage, all Unsplash URLs. |
| gradient | 0 | |
| icon | 0 | |
| rating | 0 | |
| reviews | 0 | |
| tags | 0 | Min 2, max 6 per venue (see distribution below). |
| **best** | **3,726 (100%)** | **Spec field completely missing — not implemented in schema.** |

**Tag length distribution:** 2 tags: 400 venues · 4 tags: 2,024 · 5 tags: 904 · 6 tags: 398.

**Completeness score (spec-strict, counting `best`):** 0%.
**Completeness score (excluding the unimplemented `best` field):** 100%.

> `best` is in the validation spec but the schema never defined it. Either add it, or remove it from the spec. Recommendation is below.

---

## 2. Category Health

Spec: STUB <10, SATURATED >60.

| Category | Count | Flag |
|---|---|---|
| tanning | 705 | SATURATED |
| skiing | 704 | SATURATED |
| surfing | 703 | SATURATED |
| diving | 205 | SATURATED |
| climbing | 204 | SATURATED |
| fishing | 202 | SATURATED |
| kayak | 201 | SATURATED |
| mtb | 201 | SATURATED |
| paraglide | 201 | SATURATED |
| kite | 200 | SATURATED |
| hiking | 200 | SATURATED |

No stubs. Every category is past the spec saturation threshold. Adding more venues is **not** the leverage point. Quality over quantity is now the mandate.

---

## 3. Photo Coverage & Uniqueness

- Total photos present: 3,726 / 3,726 (100% coverage)
- Unique photo URLs: **2,261 / 3,726 (60.7% unique)**
- Photos reused >1x: 142 distinct URLs, covering 1,607 venues
- Most-reused photo appears **17 times**

### Uniqueness by category (worst first)

| Category | Unique / Total | % |
|---|---|---|
| skiing | 234 / 704 | 33% |
| surfing | 233 / 703 | 33% |
| tanning | 233 / 705 | 33% |
| mtb | 186 / 201 | 93% |
| kayak | 188 / 201 | 94% |
| fishing | 189 / 202 | 94% |
| climbing | 199 / 204 | 98% |
| hiking | 197 / 200 | 99% |
| diving | 203 / 205 | 99% |
| kite | 199 / 200 | 100% |
| paraglide | 201 / 201 | 100% |

**The top 3 launch categories are the worst offenders.** Every surf, ski, and beach category has a "hero" photo used 17 times. Users swiping Explore will see the same mountain / wave / beach shot over and over. This is the single biggest visual-polish gap before ProductHunt.

---

## 4. Duplicate Titles

- **242 distinct titles collide**, affecting **507 venues**.
- Concentrated almost entirely in expansion batches (IDs ending with `-s###`, `-surf`, etc.).
- Top offenders by category: surfing (161), skiing (154), kite (62), tanning (53), climbing (44).
- Concrete examples: `Whistler Blackcomb` (whistler + whistler-blackcomb-s105), `Aspen Snowmass` (aspen + aspen-snowmass-s7), `Vail Mountain` (vail + vail-mountain-s68), `Pipeline` and `Cloudbreak` variants.

This is P1 in CLAUDE.md ("Venue duplicates — dangerous mis-tags"). Confirmed at 507 venues today, worse than the 265 figure in CLAUDE.md.

---

## 5. Geographic Diversity

Approximated from lat/lon bounding boxes:

| Continent | Venues |
|---|---|
| North America | 1,041 |
| Europe | 1,000 |
| Asia | 629 |
| South America | 301 |
| Oceania | 295 |
| Africa | 282 |
| Uncategorized | 178 |

Africa and South America are **not** thin (unlike the old note in the agent prompt). Every continent is well represented.

---

## 6. Fixes Applied This Run

None. I deliberately did not edit `app.jsx` on this run because:

1. The agent prompt asks for a report; the real wins (dedupe, unique photos) are destructive and need human review to pick which venue survives each collision.
2. Adding a `best` field to 3,726 venues in one autonomous pass would create a massive diff without domain review of seasonality per venue, and could stomp on future human edits.
3. CLAUDE.md explicitly says "do NOT change the scoring algorithm" and "each fix should be surgical".

Recommended fixes are below; each is a discrete, reviewable PR.

---

## 7. Recommended Actions (ordered)

### P0 — Before ProductHunt (April 15)

1. **Dedupe 507 duplicate-title venues.** Script that groups by normalized title, keeps the richest record (most tags, best rating, original seed ID), drops the `-s###` clones. This also fixes the Teahupo'o / Cloudbreak mis-tagging flagged in CLAUDE.md issue #12.
2. **Unique photos for surfing / skiing / tanning.** Each of the three launch categories needs ~470 additional unique Unsplash IDs. Batch via a curated list; reject any photo ID that already appears in the VENUES array.

### P1 — First week post-launch

3. **Add `best` (best months) field to all venues.** Define a category-level default table, override per venue where seasonality is extreme. Schema:
   ```js
   best: ["Dec","Jan","Feb","Mar"]     // skiing default (N. hemisphere)
   ```
4. **Remove `best` from the validation spec** if the decision is not to ship it, so this report stops flagging it at 100% missing.
5. **Tag normalization.** 400 venues still only have 2 tags. Target: every venue ≥4 tags.

---

## 8. New Venue Objects

I am intentionally not providing new venue objects this run. Every category is already past the saturation threshold. Adding more venues makes dedupe harder, photo uniqueness worse, and the Explore tab slower. If a future run wants new venues, the agent prompt should be updated to target gaps in *geography* or *season* rather than raw counts.

---

## 9. The One Data Gap Hurting UX Right Now

**Photo recycling on the three flagship categories.** A new user lands, taps Surfing, and scrolls through a list where the same teal-wave hero shot appears every 6th card. Same thing on Ski. Same on Beach. It instantly signals "this is a placeholder app" and directly contradicts the "Steve Jobs level quality. Every pixel matters" standard in CLAUDE.md. Fix this before ProductHunt or ProductHunt will fix it for us.

---

*Generated by the Peakly Data Enrichment Agent, 2026-04-10.*
