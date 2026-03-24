# QA Report: 2026-03-24 (v2)

**Agent:** QA Agent (Claude Opus 4.6)
**Date:** 2026-03-24
**Scope:** New categories (kite, kayak, mtb, fishing, paraglide), Plausible analytics, SEO files, general app.jsx integrity
**File under test:** `app.jsx` (5,631 lines)
**Deployed URL:** https://j1mmychu.github.io/peakly/

---

## Check Results

### 1. Live Site Load
**PASS** -- `https://j1mmychu.github.io/peakly/` returns HTTP 200. Site is reachable and serving content.

### 2. CATEGORIES Array (app.jsx lines 141-154)
**PASS** -- 12 entries confirmed:

| # | id | label |
|---|-----|-------|
| 1 | all | All |
| 2 | skiing | Skiing |
| 3 | surfing | Surfing |
| 4 | hiking | Hiking |
| 5 | diving | Diving |
| 6 | climbing | Climbing |
| 7 | tanning | Beach & Tan |
| 8 | kite | Kitesurf |
| 9 | kayak | Kayak |
| 10 | mtb | MTB |
| 11 | fishing | Fishing |
| 12 | paraglide | Paraglide |

All entries have id, label, and emoji fields. No syntax issues.

### 3. New Category Venues
**PASS** -- At least 1 venue per new category:

| Category | Venue | Photo | Fields Complete |
|----------|-------|-------|-----------------|
| kite | Tarifa Wind Coast | Yes | Yes |
| kayak | Milford Sound | Yes | Yes |
| mtb | Moab Slickrock Trail | Yes | Yes |
| fishing | Kenai River | Yes | Yes |
| paraglide | Interlaken | Yes | Yes |

All have: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo.

### 4. Scoring Logic for New Categories
**PASS** -- `scoreVenue` contains `case` branches for all 5 new categories:
- `case "kite"` (line 948)
- `case "kayak"` (line 960)
- `case "mtb"` (line 974)
- `case "fishing"` (line 985)
- `case "paraglide"` (line 995)

### 5. Syntax Integrity
**PASS**
- No duplicate `photo:` fields on any venue line (0 matches)
- No missing commas between venue objects (no `}\n{` without comma)
- 182 venues have photo URLs
- Total venue count: 182 (177 original categories + 5 new categories)

### 6. index.html -- Plausible Analytics
**PASS** -- Line 27: `<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.js"></script>`
- Correctly placed in `<head>` with `defer` attribute.

### 7. index.html -- Title Tag
**PASS** -- Line 23: `<title>Peakly — Find Surf, Ski &amp; Adventure Spots with Cheap Flights</title>`
- Descriptive, keyword-rich.

### 8. index.html -- Canonical URL
**PASS** -- Line 24: `<link rel="canonical" href="https://j1mmychu.github.io/peakly/" />`

### 9. robots.txt
**PASS** -- File exists. Contents:
```
User-agent: *
Allow: /
Sitemap: https://j1mmychu.github.io/peakly/sitemap.xml
```

### 10. sitemap.xml
**PASS** -- File exists. Valid XML with root URL, lastmod 2026-03-24, daily changefreq, priority 1.0.

---

## Summary Table

| Check | Result |
|-------|--------|
| Live site loads (HTTP 200) | PASS |
| CATEGORIES has 12 entries (all + 11 sports) | PASS |
| New category venues exist with complete fields | PASS |
| New category scoring logic exists | PASS |
| No duplicate photo fields | PASS |
| No missing commas / syntax issues | PASS |
| Plausible analytics script | PASS |
| Title tag (SEO) | PASS |
| Canonical URL | PASS |
| robots.txt exists and correct | PASS |
| sitemap.xml exists and valid | PASS |

**Overall: ALL 11 CHECKS PASS**

---

## Minor Issues (Non-Blocking)

1. **Thin venue coverage for new categories.** Each of the 5 new categories has only 1 venue. Users filtering by kite/kayak/mtb/fishing/paraglide will see a near-empty list. Recommend adding 5-10 venues per new category.

2. **CLAUDE.md docs drift.** The constants section still says "~170+ venues" and does not list the 5 new categories. Should be updated to reflect 182 venues and 12 category entries (all + 11 sports).

3. **Plausible data-domain.** Set to `j1mmychu.github.io` -- must be updated when migrating to `peakly.app`.

4. **Cache-busting param stale.** `app.jsx?v=20260323b` in index.html has not been bumped since last deploy. Should increment on each code push.

5. **Mixed content (known).** `FLIGHT_PROXY` uses HTTP. Flight prices fall back to estimates. Documented in CLAUDE.md; not a new issue.

---

## Recommended Fixes

| Priority | Fix |
|----------|-----|
| Medium | Add 5-10 venues per new category (kite, kayak, mtb, fishing, paraglide) |
| Low | Update CLAUDE.md constants section for 182 venues and new categories |
| Low | Bump cache-bust param `?v=20260324` in index.html on next deploy |
