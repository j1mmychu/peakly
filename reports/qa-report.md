# QA Report — Peakly

**Date:** 2026-03-27 (Run 5 — Regression check for region-based pricing fallback + pagination)
**File:** app.jsx (9,036 lines) | index.html (247 lines)
**Baseline:** 5,631 lines (original) / 8,991 lines (Run 4)
**Current:** 9,036 lines / 2,226 venues across 11 sport categories

---

## Overall: 9/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. Correct syntax. |
| 2 | Venue required fields | PASS | All 2,226 venues have: id, category, title, location, lat, lon, ap, tags, photo. No missing fields. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs across 2,226 entries. |
| 4 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches in the switch statement (lines 3083-3522). |
| 5 | Affiliate links — Amazon | PASS | 39 Amazon links, all with `tag=peakly-20`. 0 missing tags. |
| 6 | Affiliate links — Booking.com | PASS | Present with `aid=2311236`. |
| 7 | Affiliate links — SafetyWing | PASS | Present with `referenceID=peakly`. |
| 8 | SEO files | PASS | robots.txt correct, sitemap.xml present, canonical tag set, JSON-LD structured data live, Plausible `script.hash.js` loading. |
| 9 | Sentry DSN | PASS | Sentry Loader Script + `Sentry.init()` with valid DSN (line 8). Live at peakly.sentry.io. |
| 10 | Photo base image duplication | **FAIL (P3)** | 52 shared Unsplash photo IDs with different crop params. Known issue from Run 4, unchanged. |
| 11 | Travelpayouts marker | **FAIL (P1)** | `TP_MARKER = "YOUR_TP_MARKER"` (line 3771). Flight links earn $0. Jack action needed. |

---

## Cache-Buster Status

**Current value:** `?v=20260328a` (index.html line 247)
**SW version:** `peakly-v12` (sw.js line 2)
**Status: PASS** — bumped by DevOps agent on 2026-03-28, current for latest deploy.

---

## Sentry Status

**Status: LIVE (PASS)**
- Loader Script in index.html (line 77)
- `Sentry.init()` in app.jsx (line 6-13) with valid DSN
- No empty `SENTRY_DSN = ""` found — previously flagged issue is fully resolved

---

## Regression Check: Region-Based Pricing Fallback — PASS

**Location:** `getFlightDeal()` at line 3817

The region-based pricing fallback is correctly implemented with a three-tier strategy:

1. **Exact match:** `BASE_PRICES[ap][homeAirport]` — 90+ airport pairs with prices for 14 major US origin airports each (lines 3658-3748).
2. **Region estimate:** Uses `AP_CONTINENT` mapping to look up a full 6x6 continent route matrix covering all combinations of na, europe, asia, oceania, latam, africa (lines 3821-3833). Same-continent domestic routes default to $350 (NA) or $450 (other).
3. **Ultimate fallback:** $800 if neither continent is mapped (line 3833).

Additional checks:
- Price randomization uses deterministic seed from airport code pair (lines 3836-3838), producing consistent results per route.
- `isEstimate: true` flag is set on all fallback prices (line 3839).
- "Estimated prices — live API offline" banner displays when flight API is down (line 5477).
- `fetchTravelpayoutsPrice()` (line 3605) has retry with exponential backoff and 5s timeout.
- Price cap of $1,000 referenced in CLAUDE.md is applied elsewhere in the pipeline.

**Verdict: No regressions. Logic is sound and well-structured.**

---

## Regression Check: Pagination (Show More) — PASS

**Location:** `ExploreTab` at line 5140

Pagination via `visibleCount` state is correctly implemented:

- **Initial state:** `useState(30)` — shows 30 venues on first load (line 5145).
- **Rendering:** `gridListings.slice(0, visibleCount)` limits DOM nodes (line 5557).
- **Load more:** Button increments by 30: `setVisibleCount(v => v + 30)` (line 5591).
- **Remaining count:** Button shows `({gridListings.length - visibleCount} remaining)` (line 5596).
- **Category reset:** `setVisibleCount(30)` fires on category pill click (line 5250). Critical — prevents stale pagination state.
- **Conditional render:** Button only shows when `gridListings.length > visibleCount` (line 5589).

**Verdict: No regressions. Pagination is clean with proper reset behavior.**

---

## Regression Check vs Run 4

| Check | Run 4 | Run 5 | Delta |
|-------|-------|-------|-------|
| Categories | PASS (12) | PASS (12) | — |
| Venue fields | PASS (2,226) | PASS (2,226) | — |
| Duplicate IDs | PASS (0) | PASS (0) | — |
| Duplicate photos | FAIL (52) | FAIL (52) | Same |
| scoreVenue | PASS (11) | PASS (11) | — |
| Amazon affiliates | PASS (39) | PASS (39) | — |
| Booking.com | PASS | PASS | — |
| SafetyWing | PASS | PASS | — |
| SEO files | FAIL (stale counts) | PASS (updated) | Improved |
| Plausible | PASS | PASS | — |
| Sentry | PASS | PASS | — |
| Cache buster | PASS (v=20260326v13) | PASS (v=20260328a) | Updated |
| Line count | 8,991 | 9,036 | +45 lines (BASE_PRICES expansion) |

**Regressions vs Run 4: NONE**
**Improvements:** Cache buster freshened, SEO check upgraded to PASS (JSON-LD + structured data confirmed present).

---

## Venue Distribution by Category

| Category | Count |
|----------|-------|
| tanning | 205 |
| diving | 205 |
| skiing | 204 |
| climbing | 204 |
| surfing | 203 |
| fishing | 202 |
| paraglide | 201 |
| mtb | 201 |
| kayak | 201 |
| kite | 200 |
| hiking | 200 |
| **Total** | **2,226** |

All categories well-populated (~200 each). No thin categories.

---

## Affiliate Link Summary

| Type | Count | Earning? |
|------|-------|----------|
| Amazon (`tag=peakly-20`) | 39 | Yes |
| Booking.com (`aid=2311236`) | 2 | Yes |
| SafetyWing (`referenceID=peakly`) | 1 | Yes |
| Travelpayouts (flight links) | Active | **No — TP_MARKER is placeholder** |
| REI (no affiliate tag) | 22 | **No — $0** |

---

## Open Findings by Priority

### P1 — Fix before launch

1. **Travelpayouts marker is placeholder.** Line 3771: `const TP_MARKER = "YOUR_TP_MARKER"`. Every flight click across 2,226 venues earns $0 in commission. One-line fix once Jack provides the real marker from tp.media dashboard.

### P3 — Non-blocking

2. **52 duplicate photo base images** (same Unsplash photo ID, different crop params). Users may notice similar-looking hero images when scrolling. Low visual impact since crops differ.

---

## One Thing That Would Break Everything If Not Caught

The `visibleCount` reset on category change (line 5250) is load-bearing. If that reset were removed, users switching from a category with 200+ venues loaded (after multiple "Show more" clicks) to another category would attempt to render hundreds of DOM nodes immediately, causing jank on mobile. The reset to 30 on every category switch keeps initial render fast. Currently working correctly.

---

*Report generated: 2026-03-27 by QA Agent (Run 5 — static analysis, regression check for region pricing + pagination)*
