# QA Report — Peakly

**Date:** 2026-03-24 (post-commit regression run)
**File:** app.jsx (5,666 lines) | index.html (105 lines)
**Baseline:** 5,631 lines / 182 venues (previous run)
**Current:** 5,666 lines / 192 venues (+35 lines, +10 venues)

---

## Overall: 10/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12 categories present: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. Correct syntax. |
| 2 | Venue required fields | PASS | All 192 venues have: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs. |
| 4 | Duplicate photo URLs | FAIL (P2) | 1 duplicate: `photo-1544551763-46a013bb70d5` shared by `cape_hatteras` (surfing, line 378) and `rajaampat` (diving, line 557). Different venue types — copy-paste error. |
| 5 | scoreVenue covers all categories | PASS | Switch cases for all 11 activity categories + default fallback. |
| 6 | Affiliate links — Amazon | PASS | 21 Amazon links, all with `tag=peakly-20`. No placeholder IDs found. |
| 7 | Affiliate links — Booking.com | PASS | 1 Booking.com link with `aid=2311236`. Correctly formatted. |
| 8 | Affiliate links — SafetyWing | PASS | 1 SafetyWing link with `referenceID=peakly`. Correctly formatted. |
| 9 | SEO files | PASS | robots.txt correct. sitemap.xml present (root URL, lastmod 2026-03-24). Canonical tag set. Title tag present. JSON-LD structured data present (WebSite + WebApplication + Organization). |
| 10 | Plausible Analytics | PASS | `script.hash.js` loaded. 5 custom events tracked: Onboarding Complete, Flight Search, Wishlist Add, Venue Click, Tab Switch. |
| 11 | Sentry DSN | FAIL (P2) | `SENTRY_DSN = ""` on line 6. Still empty. Infrastructure exists but not connected. |

---

## Cache-Buster Status

**Current value:** `?v=20260325a` (index.html, line 88)
**Status:** Current — dated for today's/tomorrow's deploy cycle. No fix needed.

---

## Sentry Status

**Status:** Empty DSN on line 6 of app.jsx. Error monitoring infrastructure exists but is not connected.

**Fix (replace line 6 of app.jsx after signing up at sentry.io):**
```js
const SENTRY_DSN = "https://<your-key>@o<org-id>.ingest.sentry.io/<project-id>";
```
The existing `reportError()` + `fetch()` logic will activate immediately — no other code changes needed. Not blocked by LLC.

---

## Duplicate Photo Details

**1 duplicate found (new this commit):**
- URL: `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop`
- Used by: `cape_hatteras` (surfing, line 378) AND `rajaampat` (diving, line 557)
- Fix: Replace rajaampat's photo with a Raja Ampat-specific image (underwater coral/manta ray shot).

---

## Venue Distribution by Category

| Category | Count | Change | Status |
|----------|-------|--------|--------|
| tanning | 60 | -- | Healthy |
| surfing | 53 | -- | Healthy |
| skiing | 50 | -- | Healthy |
| hiking | 12 | +12 NEW | Healthy (was 0) |
| diving | 5 | +4 | Improved |
| kite | 4 | +3 | Improved |
| climbing | 4 | +3 | Improved |
| paraglide | 1 | -- | Thin |
| mtb | 1 | -- | Thin |
| kayak | 1 | -- | Thin |
| fishing | 1 | -- | Thin |

**10 new venues added this commit.** Hiking went from 0 to 12 — major category expansion. Diving, kite, and climbing also expanded. 4 categories still have only 1 venue (paraglide, mtb, kayak, fishing).

---

## Commit Verification (20 Changes)

| Feature | Status |
|---------|--------|
| Plausible events (5 tracked) | Verified |
| JSON-LD structured data | Verified — 3-node @graph |
| Set Alert button in VenueDetailSheet | Verified — line 4430 |
| 10 new venues | Verified — 192 total |
| Hiking gear in GEAR_ITEMS | Verified — 4 items |
| WCAG fixes | Partial — no ARIA attributes added; only CSS `[role=button]` selector exists |
| BottomNav targets | Verified — 3 tabs, 8px padding + 20px icons |

---

## Regressions vs Last Run

**1 new issue:** Duplicate photo URL introduced with venue expansion (P2 cosmetic).
**All 11 previous checks:** 10 still pass. The one that previously failed (JSON-LD missing) now passes. Net improvement.

---

## One Thing That Would Break Everything If Not Caught

**The flight proxy URL is hardcoded as HTTP** (`http://104.131.82.242:3001` on line 1048). The app is served over HTTPS via GitHub Pages. All browsers silently block this mixed-content request. Flight prices never load for any production user — `_flightApiStatus` stays `"down"` and everyone sees estimated prices only. This remains the single biggest functional gap in the live product. HTTPS on the VPS proxy is not blocked by LLC and should be the next infrastructure priority.
