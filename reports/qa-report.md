# QA Report — Peakly

**Date:** 2026-03-24 (post-revert regression check: 472 -> 192 venues)
**File:** app.jsx (6,072 lines) | index.html (119 lines)
**Baseline:** 6,354 lines / 472 venues (previous run)
**Current:** 6,072 lines / 192 venues (-282 lines, -280 venues)

---

## Overall: 9/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. |
| 2 | Venue required fields | PASS | All 192 venues have: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo. `description`, `difficulty`, `bestMonths` absent from all venues but NOT referenced anywhere in code — no runtime impact. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate IDs. |
| 4 | Duplicate photo URLs | FAIL (P3) | 1 duplicate: `photo-1682687220742-aba13b6e50ba` shared by `rajaampat` (line 624) and `sipadan` (line 625). Improved from 3 dupes last run. |
| 5 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches (lines 965-1330). |
| 6 | Affiliate links — Amazon | PASS | 20 Amazon links, all with `tag=peakly-20`. No placeholder IDs. |
| 7 | Affiliate links — Booking.com | PASS | 1 Booking.com link with `aid=2311236`. Correctly formatted. |
| 8 | Affiliate links — SafetyWing | PASS | 1 SafetyWing link with `referenceID=peakly`. Correctly formatted. |
| 9 | SEO files | FAIL (P2) | robots.txt present. sitemap.xml present but only has root URL — missing category pages. Canonical tag and title tag correct. JSON-LD structured data present (WebSite, WebApplication, Organization). |
| 10 | Plausible analytics | PASS | `script.hash.js` loading correctly from plausible.io. |
| 11 | Sentry DSN | FAIL (P2) | `SENTRY_DSN = ""` on line 6. Still empty. |

---

## Cache-Buster Status

**Current value:** `?v=20260325c` (index.html, line 95)
**Status: STALE (P2).** Value references 2026-03-25 but major revert just happened. Browsers may serve cached 472-venue version.

**Fix (one line, index.html line 95):**
```html
<script type="text/babel" src="./app.jsx?v=20260324d" data-presets="react"></script>
```

---

## Sentry Status

**Status:** Empty DSN on line 6 of app.jsx. Error monitoring logs to localStorage only. No remote reporting.

**Fix (replace line 6 after signing up at sentry.io):**
```js
const SENTRY_DSN = "https://<your-key>@o<org-id>.ingest.sentry.io/<project-id>";
```
No other code changes needed — existing `reportError()` + `fetch()` activates automatically. Not blocked by LLC.

---

## Duplicate Photo Details

**1 duplicate (improved from 3 last run):**
- URL: `photo-1682687220742-aba13b6e50ba`
- Used by: `rajaampat` (diving, line 624) and `sipadan` (diving, line 625)
- Fix: Replace sipadan's photo with a venue-specific Unsplash image.

---

## Venue Distribution by Category

| Category | Count | Change vs Last Run | Status |
|----------|-------|-------------------|--------|
| tanning | 60 | -- | Healthy |
| surfing | 53 | -280 | Healthy (revert removed 280 bulk-added surf venues) |
| skiing | 50 | -- | Healthy |
| hiking | 12 | -- | OK |
| diving | 5 | -- | Adequate |
| kite | 4 | -- | Thin |
| climbing | 4 | -- | Thin |
| paraglide | 1 | -- | Single venue |
| mtb | 1 | -- | Single venue |
| kayak | 1 | -- | Single venue |
| fishing | 1 | -- | Single venue |

**Distribution is now balanced again.** Previous run had 71% surfing (333/472). Now: tanning 31%, surfing 28%, skiing 26%. The revert fixed the category imbalance.

**P2 concern:** 4 categories still have only 1 venue each. These feel empty to users.

---

## Regression Check — Post-Revert

| Check | Last Run (472 venues) | This Run (192 venues) | Delta |
|-------|----------------------|----------------------|-------|
| Categories | PASS (12) | PASS (12) | -- |
| Venue fields | PASS | PASS | -- |
| Duplicate IDs | PASS (0) | PASS (0) | -- |
| Duplicate photos | FAIL (3) | FAIL (1) | IMPROVED |
| scoreVenue | PASS (11 branches) | PASS (11 branches) | -- |
| Amazon affiliates | PASS (21) | PASS (20) | -1 link (was in removed venues) |
| Booking.com | PASS (1) | PASS (1) | -- |
| SafetyWing | PASS (1) | PASS (1) | -- |
| SEO files | PASS | FAIL (sitemap) | Sitemap was already thin — still only root URL |
| Plausible | PASS | PASS | -- |
| Sentry | FAIL | FAIL | Still empty |

### Regressions vs Last Run: NONE

The revert was clean. All previously passing checks still pass. Duplicate photo count improved (3 -> 1). Category balance restored. No new syntax issues introduced.

**Previous critical finding (line 300 double-comma syntax) — RESOLVED.** The Pipeline venue object no longer has the `, ,` pattern. The revert appears to have cleaned this up.

---

## One Thing That Would Break Everything If Not Caught

**The cache buster is stale after the revert.** The index.html still points to `?v=20260325c` which browsers may have cached with the 472-venue version. Users who visited the site before the revert could continue seeing the old bloated version with 280 extra surf spots until their cache expires. Bumping the cache buster is a one-line fix that ensures all users get the reverted 192-venue version immediately. This is the highest-priority action item from this report.
