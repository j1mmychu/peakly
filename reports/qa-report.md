# QA Report — Peakly

**Date:** 2026-03-24
**File:** app.jsx (6,072 lines) | index.html (119 lines)
**Baseline:** 5,631 lines (original) / 6,072 lines (previous run)
**Current:** 6,072 lines / 192 venues across 11 sport categories

---

## Overall: 9/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. |
| 2 | Venue required fields | PASS | All 192 venues have: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo. `description`, `difficulty`, `bestMonths` not in schema — not referenced in code, no runtime impact. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs. |
| 4 | Duplicate photo URLs | FAIL (P3) | 1 duplicate: `photo-1682687220742-aba13b6e50ba` shared by `rajaampat` and `sipadan` (both diving). |
| 5 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches (lines 965-1331) plus default fallback. |
| 6 | Affiliate links — Amazon | PASS | 20 Amazon links, all with `tag=peakly-20`. No placeholder IDs. |
| 7 | Affiliate links — Booking.com | PASS | 1 Booking.com link with `aid=2311236`. Correctly formatted. |
| 8 | Affiliate links — SafetyWing | PASS | 1 SafetyWing link with `referenceID=peakly`. Correctly formatted. |
| 9 | SEO files | FAIL (P2) | robots.txt correct. sitemap.xml present but only root URL — no category pages. Canonical tag and title tag correct. JSON-LD structured data present. |
| 10 | Plausible analytics | PASS | `script.hash.js` loading correctly on line 27 of index.html. |
| 11 | Sentry DSN | FAIL (P2) | `SENTRY_DSN = ""` on line 6 of app.jsx. Still empty. |

---

## Cache-Buster Status

**Current value:** `?v=20260325c` (index.html, line 95)
**Status: STALE (P2).** Value was set 2026-03-25 but any subsequent deploys would not force cache refresh.

**Fix (one line, index.html line 95):**
```html
<script type="text/babel" src="./app.jsx?v=20260324a" data-presets="react"></script>
```
Bump on every deploy.

---

## Sentry Status

**Status:** Empty DSN on line 6 of app.jsx. Error monitoring logs to localStorage only. No remote reporting.

**Fix (replace line 6 after signing up at sentry.io):**
```js
const SENTRY_DSN = "https://<your-key>@o<org-id>.ingest.sentry.io/<project-id>";
```
No other code changes needed — existing `reportError()` + `fetch()` activates automatically. Not blocked by LLC. Jack action, 5 minutes.

---

## Duplicate Photo Details

**1 duplicate:**
- URL: `photo-1682687220742-aba13b6e50ba`
- Used by: `rajaampat` (diving) and `sipadan` (diving)
- Fix: Replace sipadan's photo with a unique Unsplash dive image.

---

## Affiliate Link Summary

| Type | Count | Earning? |
|------|-------|----------|
| Amazon (`tag=peakly-20`) | 20 | Yes |
| Booking.com (`aid=2311236`) | 1 | Yes |
| SafetyWing (`referenceID=peakly`) | 1 | Yes |
| REI/Backcountry (no affiliate tag) | 24 | No ($0) |
| Placeholder IDs found | 0 | N/A |

---

## Venue Distribution by Category

| Category | Count | Status |
|----------|-------|--------|
| tanning | 60 | Healthy |
| surfing | 53 | Healthy |
| skiing | 50 | Healthy |
| hiking | 12 | OK |
| diving | 5 | Adequate |
| kite | 4 | Thin |
| climbing | 4 | Thin |
| paraglide | 1 | Single venue |
| mtb | 1 | Single venue |
| kayak | 1 | Single venue |
| fishing | 1 | Single venue |

4 categories have only 1 venue each — these feel empty to users. Non-blocking for launch but worth expanding post-launch.

---

## Regression Check

| Check | Previous Run | This Run | Delta |
|-------|-------------|----------|-------|
| Categories | PASS (12) | PASS (12) | -- |
| Venue fields | PASS | PASS | -- |
| Duplicate IDs | PASS (0) | PASS (0) | -- |
| Duplicate photos | FAIL (1) | FAIL (1) | No change |
| scoreVenue | PASS (11) | PASS (11) | -- |
| Amazon affiliates | PASS (20) | PASS (20) | -- |
| Booking.com | PASS (1) | PASS (1) | -- |
| SafetyWing | PASS (1) | PASS (1) | -- |
| SEO files | FAIL | FAIL | Sitemap still thin |
| Plausible | PASS | PASS | -- |
| Sentry | FAIL | FAIL | Still empty |

**Regressions vs last run: NONE**

No previously passing check has regressed. The 1 duplicate photo and thin sitemap were already flagged.

---

## One Thing That Would Break Everything If Not Caught

**The stale cache buster combined with the service worker is the highest-risk item.** The previous SW outage (documented in CLAUDE.md) proved that a stale cache can serve a broken version indefinitely with no user recourse. If a syntax error is introduced in app.jsx and deployed without bumping `?v=`, the SW and browser cache will serve the broken version to all returning users. Bump `v=` on every single deploy — this is the one discipline that prevents catastrophic user-facing outages.
