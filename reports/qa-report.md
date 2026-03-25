# QA Report — Peakly

**Date:** 2026-03-24 (regression check after VPS proxy fix, PWA addition, GA4 removal)
**File:** app.jsx (6,354 lines) | index.html (119 lines)
**Baseline:** 5,666 lines / 192 venues (previous run)
**Current:** 6,354 lines / 472 venues (+688 lines, +280 venues)

---

## Overall: 9/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12 categories: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. |
| 2 | Venue required fields | PASS | All 472 venues have: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs. |
| 4 | Duplicate photo URLs | FAIL (P2) | 3 venues share the same photo (see below). Was 2 last run — now 3. |
| 5 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches + default fallback. |
| 6 | Affiliate links — Amazon | PASS | 21 Amazon links, all with `tag=peakly-20`. No placeholder IDs. |
| 7 | Affiliate links — Booking.com | PASS | 1 Booking.com link with `aid=2311236`. Correctly formatted. |
| 8 | Affiliate links — SafetyWing | PASS | 1 SafetyWing link with `referenceID=peakly`. Correctly formatted. |
| 9 | SEO files | PASS | robots.txt, sitemap.xml, canonical tag, title tag, JSON-LD all present and correct. |
| 10 | Plausible analytics | PASS | `script.hash.js` loading correctly from plausible.io. |
| 11 | Sentry DSN | FAIL (P2) | `SENTRY_DSN = ""` on line 6. Still empty. |

---

## Cache-Buster Status

**Current value:** `?v=20260325b` (index.html, line 95)
**Status: Current.** Dated 2026-03-25 with "b" suffix indicating second deploy. No fix needed.

---

## Sentry Status

**Status:** Empty DSN on line 6 of app.jsx. Error monitoring infrastructure exists but is not connected.

**Fix (replace line 6 after signing up at sentry.io):**
```js
const SENTRY_DSN = "https://<your-key>@o<org-id>.ingest.sentry.io/<project-id>";
```
No other code changes needed — the existing `reportError()` + `fetch()` logic activates automatically. Not blocked by LLC.

---

## Duplicate Photo Details

**3 venues share the same photo (worsened from 2 last run):**
- URL: `photo-1544551763-46a013bb70d5` (generic surf shot)
- Used by:
  - `cape_hatteras` (surfing, line 445)
  - `salsa_brava` (surfing, line 540)
  - `rajaampat` (diving, line 906)
- Fix: Replace salsa_brava and rajaampat photos with venue-specific images.

---

## Syntax Concern (NEW — P2)

**Line 300:** The Pipeline venue object has a trailing comma on line 299 (`photo:"...",`) followed by `, breakType:"reef"}` on line 300. This creates a `, ,` pattern (consecutive commas) in an object literal. Babel Standalone tolerates this today, but strict parsers would reject it. A Babel CDN upgrade could cause a white-screen crash on the app's flagship surfing venue.

**Fix:** Remove the trailing comma on line 299 OR the leading comma on line 300.

---

## Venue Distribution by Category

| Category | Count | Change vs Last Run | Status |
|----------|-------|-------------------|--------|
| surfing | 333 | +280 | Massive expansion |
| tanning | 60 | -- | Healthy |
| skiing | 50 | -- | Healthy |
| hiking | 12 | -- | Healthy |
| diving | 5 | -- | Adequate |
| climbing | 4 | -- | Thin |
| kite | 4 | -- | Thin |
| paraglide | 1 | -- | Thin |
| mtb | 1 | -- | Thin |
| kayak | 1 | -- | Thin |
| fishing | 1 | -- | Thin |

**Note:** Surfing now dominates at 333/472 (71%). 5 categories still have only 1 venue each.

---

## Regression Check — Recent Changes

| Change | Status | Detail |
|--------|--------|--------|
| VPS proxy fix (HTTPS) | PASS | `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` on line 1624. No more mixed content. Previous critical finding (HTTP proxy blocked by browsers) is **RESOLVED**. |
| PWA manifest + SW | PASS | `manifest.json` present. `sw.js` present. `<link rel="manifest">` in index.html. Service worker registration script in index.html. Apple meta tags present. |
| GA4 placeholder removed | PASS (intentional) | No gtag.js in index.html. CLAUDE.md still references GA4 as "added" — documentation is stale but removal is intentional. |
| Plausible analytics | PASS | Still loading `script.hash.js`. Unaffected by GA4 removal. |
| All affiliate links | PASS | All 23 affiliate links intact with real IDs. |
| scoreVenue function | PASS | All 11 scoring branches intact and unchanged. |

### Regressions vs Last Run: NONE

Previous critical finding (HTTP flight proxy causing mixed content block) is now **FIXED** — proxy uses HTTPS via Caddy + Let's Encrypt.

Previous duplicate photo issue **WORSENED** from 2 to 3 venues sharing the same URL.

---

## One Thing That Would Break Everything If Not Caught

**Line 300 double-comma syntax in the Pipeline venue object.** Pipeline is Peakly's flagship surfing venue. The `, ,` pattern in its object literal is non-standard. If unpkg upgrades Babel Standalone to a stricter version, this single comma could cause a parse failure that white-screens the entire app for every user. It's a one-character fix that eliminates a catastrophic risk vector. Fix it before the next deploy.
