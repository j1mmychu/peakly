# QA Report — Peakly

**Date:** 2026-03-24
**File:** app.jsx (5,605 lines) | index.html (66 lines)
**Baseline:** 5,631 lines (last run) | Current: 5,605 lines (-26, minor delta — no concern)
**Venues:** 182 across 11 categories (stable from last run)

---

## Overall: 8/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12 categories present: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. Correct syntax. |
| 2 | Venue required fields | PARTIAL PASS | All 182 venues have: id, category, title, location, lat, lon, ap (airport), icon, rating, reviews, gradient, accent, tags, photo. **Missing from all venues:** `description`, `difficulty`, `bestMonths`. These fields were never part of the data model — the QA spec references them but they have never existed in the codebase. Not a regression. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs. (Duplicates like `id:"value"`, `id:"score"` are sort-option IDs, not venues — no conflict.) |
| 4 | Duplicate photo URLs | PASS | 0 duplicate photo URLs across all 182 venues. |
| 5 | scoreVenue covers all categories | PASS | Switch cases for: skiing, surfing, tanning, diving, climbing, kite, kayak, mtb, fishing, paraglide, hiking + default fallback. All 11 activity categories covered. |
| 6 | Affiliate links — Amazon | PASS | 20 Amazon links found, all using `tag=peakly-20`. No placeholder IDs (`AFFILIATE_ID`, `YOURID`) found anywhere in codebase. |
| 7 | Affiliate links — Booking.com | PASS | 1 Booking.com link with `aid=2311236`. Correctly formatted. |
| 8 | Affiliate links — SafetyWing | PASS | 1 SafetyWing link with `referenceID=peakly`. Correctly formatted. |
| 9 | SEO files | PARTIAL PASS | `robots.txt` present and correct. `sitemap.xml` present but only contains root URL — no category-specific URLs. Canonical tag set. Title tag present and descriptive. **JSON-LD structured data: MISSING.** |
| 10 | Cache-buster | FAIL (P2) | Current value: `?v=20260323b`. Dated 2026-03-23 — stale if any code was pushed today. |
| 11 | Sentry DSN | FAIL (P2) | `SENTRY_DSN = ""` on line 6. Still empty. No external error reporting. |

---

## Cache-Buster Status

**Current value:** `?v=20260323b` (index.html, line 49)
**Status:** Stale — dated 2026-03-23.

**Fix (one-line change in index.html, line 49):**
```html
<!-- FROM -->
<script type="text/babel" src="./app.jsx?v=20260323b" data-presets="react"></script>
<!-- TO -->
<script type="text/babel" src="./app.jsx?v=20260324a" data-presets="react"></script>
```

---

## Sentry Status

**Status:** Empty DSN on line 6 of app.jsx. Error monitoring infrastructure exists but is not connected.

**Fix (replace line 6 of app.jsx after signing up at sentry.io):**
```js
const SENTRY_DSN = "https://<your-key>@o<org-id>.ingest.sentry.io/<project-id>";
```
The existing `reportError()` + `fetch()` logic will activate immediately — no other code changes needed.

---

## Venue Distribution by Category

| Category | Count | Status |
|----------|-------|--------|
| tanning | 60 | Healthy |
| surfing | 53 | Healthy |
| skiing | 50 | Healthy |
| hiking | 12 | Healthy |
| diving | 1 | THIN |
| climbing | 1 | THIN |
| kite | 1 | THIN |
| kayak | 1 | THIN |
| mtb | 1 | THIN |
| fishing | 1 | THIN |
| paraglide | 1 | THIN |

**Non-blocking:** 7 of 11 activity categories have only 1 venue. These will feel empty to users. Recommend expanding to 5+ per category before marketing push.

---

## Plausible Analytics

Script loads `script.js` (not `script.hash.js`). The `script.hash.js` upgrade mentioned in the QA spec has not been performed. Current script is functional but does not support hash-based SPA tracking. **P3 — non-blocking.**

---

## Regressions vs Last Run

**NONE.** All previously passing checks still pass. Venue count stable at 182. Category count stable at 12. No new duplicate IDs or photos.

---

## One Thing That Would Break Everything If Not Caught

**The flight proxy URL is hardcoded as HTTP** (`http://104.131.82.242:3001` on line 1032 of app.jsx). The app is served over HTTPS via GitHub Pages, so all browsers silently block this mixed-content request. Flight prices never load for any production user — `_flightApiStatus` stays `"down"` and everyone sees estimated prices only. This is known and documented, but remains the single biggest functional gap in the live product.
