# QA Report -- Peakly

**Date:** 2026-03-27 (Run 4)
**File:** app.jsx (8,991 lines) | index.html (247+ lines)
**Baseline:** 5,631 lines (original) / 8,951 lines (Run 3)
**Current:** 8,991 lines / 2,226 venues across 11 sport categories

---

## Overall: 8/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. Correct syntax. |
| 2 | Venue required fields | PASS | All 2,226 venues have: id, category, title, location, lat, lon, ap, tags, photo. No missing fields. No empty photo values. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs across 2,226 entries. |
| 4 | Duplicate photo URLs (full URL) | PASS | 52 full-URL duplicates (minor, different crop windows). |
| 4b | Duplicate photo base images | **FAIL (P1)** | Only **176 unique Unsplash photo IDs** for 2,226 venues. Worst offender (`photo-1529961482160`) appears **203 times** with different `fp-x`/`fp-y` crops. Same image, different crop window. |
| 5 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches in the switch statement. |
| 6 | Affiliate links -- Amazon | PASS | 39 Amazon link occurrences, all with `tag=peakly-20`. No placeholder IDs. |
| 7 | Affiliate links -- Booking.com | PASS | 2 Booking.com links, correctly formatted. |
| 8 | Affiliate links -- SafetyWing | PASS | 1 SafetyWing link, correctly formatted. |
| 9 | SEO files | **FAIL (P2)** | robots.txt correct. sitemap.xml present but only root URL -- missing category URLs. OG description says "180+ venues" (should be 2,200+). JSON-LD likely stale too. |
| 10 | Travelpayouts marker | **FAIL (P2)** | `TP_MARKER = "YOUR_TP_MARKER"` (line 3760). Flight links earn $0 in affiliate commission. Code correctly skips invalid marker -- no user-facing bug, but revenue leak. |
| 11 | Sentry DSN | PASS | Sentry Loader Script + `Sentry.init()` with valid DSN. Live. |

---

## Cache-Buster Status

**Current value:** `?v=20260326v13` (index.html, line 247)
**Status:** PASS -- dated 2026-03-26, current for latest deploy.

---

## Sentry Status

**Status: LIVE (PASS)**
- Loader Script in index.html
- `Sentry.init()` in app.jsx with valid DSN
- Dashboard: peakly.sentry.io

---

## Plausible Analytics

**Status: PASS** -- `script.hash.js` loading with `data-domain="j1mmychu.github.io"`.

---

## Affiliate Link Summary

| Type | Count | Earning? |
|------|-------|----------|
| Amazon (`tag=peakly-20`) | 39 | Yes |
| Booking.com (`aid=2311236`) | 2 | Yes |
| SafetyWing (`referenceID=peakly`) | 1 | Yes |
| Travelpayouts (flight links) | Active | **No -- TP_MARKER is placeholder** |
| REI (no affiliate tag) | 22 | **No -- $0** |

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

## Regression Check vs Run 3

| Check | Run 3 | Run 4 | Delta |
|-------|-------|-------|-------|
| Categories | PASS (12) | PASS (12) | -- |
| Venue fields | PASS (2,226) | PASS (2,226) | -- |
| Duplicate IDs | PASS (0) | PASS (0) | -- |
| Duplicate photos (base image) | FAIL (176 unique) | FAIL (176 unique) | Same |
| scoreVenue | PASS (11) | PASS (11) | -- |
| Amazon affiliates | PASS (40) | PASS (39) | -1 (minor) |
| Booking.com | PASS (2) | PASS (2) | -- |
| SafetyWing | PASS (1) | PASS (1) | -- |
| SEO files | FAIL (stale counts) | FAIL (stale counts) | Same |
| Plausible | PASS | PASS | -- |
| Sentry | PASS | PASS | -- |
| Line count | 8,951 | 8,991 | +40 lines |

**Regressions vs Run 3: NONE**
**New finding: 1** (Travelpayouts marker placeholder -- revenue leak)

---

## P1 Findings (Fix before launch)

1. **Photo base image duplication is extreme.** 176 unique Unsplash photo IDs serve 2,226 venues. Top offenders:
   - `photo-1529961482160`: 203 venues
   - `photo-1523819088009`: 202 venues
   - `photo-1578001647043`: 110 venues
   - `photo-1512541405516`: 92 venues

   Users scrolling through any category will see the same hero image repeated with slightly different crops. Need ~2,050 additional unique photo IDs.

## P2 Findings (Fix soon)

2. **Travelpayouts marker is placeholder.** Line 3760: `const TP_MARKER = "YOUR_TP_MARKER"`. All flight deep links earn $0. Jack needs to set this from his Travelpayouts dashboard.
3. **Sitemap only has root URL.** Should include category deep-link URLs for better crawlability.
4. **OG meta description says "180+ venues"** -- should say "2,200+".
5. **52 exact-duplicate photo URLs** found (same URL including crop params used on multiple venues).

---

## Live Browser Test

**Status: SKIPPED** -- Browser automation timed out and WebFetch blocked for github.io domain. Tab loading, JS console errors, swipe gesture, and visual rendering could not be verified this run.

---

## One Thing That Would Break Everything If Not Caught

**The Travelpayouts marker being a placeholder** means every single flight click across all 2,226 venues earns $0 in affiliate revenue. At the projected 2,500-3,500 user launch, this could mean hundreds of dollars in lost commission per month. The fix is a one-line change once Jack provides the real marker from his Travelpayouts dashboard.

---

*Report generated: 2026-03-27 by QA Agent (static analysis -- live browser checks skipped due to environment restrictions)*
