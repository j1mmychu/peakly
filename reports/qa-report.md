# QA Report -- Peakly

**Date:** 2026-03-25
**File:** app.jsx (8,601 lines) | index.html (268 lines)
**Baseline:** 5,631 lines (original) / 6,072 lines (previous run)
**Current:** 8,601 lines / 2,226 venues across 11 sport categories

---

## Overall: 8/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. |
| 2 | Venue required fields | PASS | All 2,226 venues have: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs across all 2,226 entries. |
| 4 | Duplicate photo URLs | FAIL (P1) | 142 photo URLs reused across multiple venues. Worst: single photo used 83 times. Only 308 unique photos for 2,226 venues. |
| 5 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches plus default fallback. |
| 6 | Affiliate links -- Amazon | PASS | 30 Amazon links, all with `tag=peakly-20`. No placeholder IDs. |
| 7 | Affiliate links -- Booking.com | PASS | 2 Booking.com links with `aid=2311236`. Correctly formatted. |
| 8 | Affiliate links -- SafetyWing | PASS | 1 SafetyWing link with `referenceID=peakly`. Correctly formatted. |
| 9 | SEO files | PASS | robots.txt correct. sitemap.xml present with root URL. Canonical tag and title tag correct. JSON-LD structured data present. |
| 10 | Plausible analytics | PASS | `script.hash.js` loading correctly in index.html. |
| 11 | Sentry DSN | FAIL (P2) | `SENTRY_DSN = ""` on line 6 of app.jsx. Still empty. |

---

## Cache-Buster Status

**Current value:** `?v=20260325c` (index.html, line 244)
**Status: STALE (P2).** Value was set 2026-03-25 but any subsequent deploys since then would not force cache refresh.

**Fix (one line, index.html line 244):**
```html
<script type="text/babel" src="./app.jsx?v=20260325d" data-presets="react"></script>
```
Bump on every deploy.

---

## Sentry Status

**Status:** Empty DSN on line 6 of app.jsx. Error monitoring logs to localStorage only. No remote reporting.

**Fix (replace line 6 after signing up at sentry.io):**
```js
const SENTRY_DSN = "https://<your-key>@o<org-id>.ingest.sentry.io/<project-id>";
```
No other code changes needed -- existing `reportError()` + `fetch()` activates automatically. Not blocked by LLC. Jack action, 5 minutes.

---

## Duplicate Photo Details (REGRESSION)

**Previous run:** 1 duplicate photo URL.
**This run:** 142 duplicate photo URLs. Only 308 unique photos shared across 2,226 venues.

**Top offenders:**
| Photo ID | Times Used |
|----------|-----------|
| `photo-1544551763-88c0c3a2efc0` | 83 |
| `photo-1559827291-72ebf78e3545` | 79 |
| `photo-1560881036-1f10fe2b3f3f` | 65 |
| `photo-1464822759023-fed0d8ca6c41` | 62 |
| `photo-1483728642-a170930cf937` | 61 |

This is a direct result of expanding from ~192 venues to 2,226 without sourcing unique photos. Users browsing venues within a category will see the same photos repeatedly.

---

## Affiliate Link Summary

| Type | Count | Earning? |
|------|-------|----------|
| Amazon (`tag=peakly-20`) | 30 | Yes |
| Booking.com (`aid=2311236`) | 2 | Yes |
| SafetyWing (`referenceID=peakly`) | 1 | Yes |
| Placeholder IDs found | 0 | N/A |

---

## Venue Distribution by Category

| Category | Count | Status |
|----------|-------|--------|
| tanning | 205 | Healthy |
| diving | 205 | Healthy |
| skiing | 204 | Healthy |
| climbing | 204 | Healthy |
| surfing | 203 | Healthy |
| fishing | 202 | Healthy |
| paraglide | 201 | Healthy |
| mtb | 201 | Healthy |
| kayak | 201 | Healthy |
| kite | 200 | Healthy |
| hiking | 200 | Healthy |

All categories are well-populated (~200 each). No thin categories. This is a massive improvement from the previous run where 4 categories had only 1 venue.

---

## Regression Check

| Check | Previous Run | This Run | Delta |
|-------|-------------|----------|-------|
| Categories | PASS (12) | PASS (12) | -- |
| Venue fields | PASS (192) | PASS (2,226) | +2,034 venues |
| Duplicate IDs | PASS (0) | PASS (0) | -- |
| Duplicate photos | FAIL (1) | FAIL (142) | **REGRESSION: +141** |
| scoreVenue | PASS (11) | PASS (11) | -- |
| Amazon affiliates | PASS (20) | PASS (30) | +10 links |
| Booking.com | PASS (1) | PASS (2) | +1 link |
| SafetyWing | PASS (1) | PASS (1) | -- |
| SEO files | FAIL (thin sitemap) | PASS | Improved |
| Plausible | PASS | PASS | -- |
| Sentry | FAIL | FAIL | Still empty |

**Regressions found: 1**
- Duplicate photos: 1 --> 142. Venue expansion reused a small photo pool across 2,226 venues.

---

## CLAUDE.md is Stale

CLAUDE.md documents ~192 venues, 5,413 lines. Actual state: 2,226 venues, 8,601 lines. This needs updating to avoid confusion across agent sessions.

---

## One Thing That Would Break Everything If Not Caught

**The Open-Meteo API rate limit is now a critical failure point.** With 2,226 venues (up from 192), each page load or category switch that fetches weather data will generate thousands of API calls. The free tier allows 10,000 calls/day. A single user browsing 5 categories could trigger 11,130+ calls, exceeding the daily limit. Without the weather cache (pre-launch checklist item #21 -- localStorage with 30-min TTL), the app will silently break for all users after minimal traffic. This was a nice-to-have at 192 venues; at 2,226 venues it is a launch blocker.
