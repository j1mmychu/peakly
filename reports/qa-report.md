# QA Report -- Peakly

**Date:** 2026-03-25 (Run 3 -- post smart weather fetch + stable photos)
**File:** app.jsx (8,951 lines) | index.html (247+ lines)
**Baseline:** 5,631 lines (original) / 8,625 lines (Run 2)
**Current:** 8,951 lines / 2,226 venues across 11 sport categories

---

## Overall: 8/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. Correct syntax. |
| 2 | Venue required fields | PASS | All 2,226 venues have: id, category, title, location, lat, lon, ap, tags, photo. No missing fields. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs across 2,226 entries. |
| 4 | Duplicate photo URLs (full URL) | PASS | 0 duplicate full photo URLs (with crop params). 2,171 unique full URLs. |
| 4b | Duplicate photo base images | **FAIL (P1)** | Only **176 unique Unsplash photo IDs** for 2,226 venues. The worst offender (`photo-1529961482160`) appears **203 times** with different `fp-x`/`fp-y` crops. Same image, different crop window. Users will notice. |
| 5 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches at lines: skiing (3072), surfing (3125), tanning (3189), diving (3235), climbing (3267), kite (3300), kayak (3327), mtb (3361), fishing (3388), paraglide (3417), hiking (3443). |
| 6 | Affiliate links -- Amazon | PASS | 40 Amazon links, all with `tag=peakly-20`. No placeholder IDs. |
| 7 | Affiliate links -- Booking.com | PASS | 2 Booking.com links with `aid=2311236`. Correctly formatted. |
| 8 | Affiliate links -- SafetyWing | PASS | 1 SafetyWing link with `referenceID=peakly`. Correctly formatted. |
| 9 | SEO files | **FAIL (P2)** | robots.txt correct. sitemap.xml present but only contains root URL -- missing category URLs. JSON-LD `featureList` says "180+ adventure venues" (should be 2,200+). OG description also says "180+ venues". |
| 10 | Plausible analytics | PASS | `script.hash.js` loading with `data-domain="j1mmychu.github.io"`. |
| 11 | Sentry DSN | PASS | Sentry Loader Script in index.html + `Sentry.init()` at lines 6-13 with valid DSN. |

---

## Smart Weather Fetch Verification (NEW)

The "top 100 + lazy" optimization is correctly implemented:

- **Initial load:** Fetches weather for `VENUES.slice(0, 100)` in 2 batches of 50 (lines 8659-8690)
- **Lazy fetch:** `fetchVenueWeather()` loads individual venue weather when detail sheet opens (line 8799)
- **Dedup guard:** `wxRef.current[venue.id]` check prevents re-fetching (line 8643)
- **Auto-refresh:** 10-minute interval refreshes top 100 (line 8694)
- **API calls:** ~150/load (100 weather + ~50 marine for water-sport venues) vs ~4,452 before

**PASS** -- API usage reduced ~97%. Fits Open-Meteo free tier for moderate traffic.

**Risk:** VENUES[0..99] are position-dependent. If someone reorders the array, the "best" venues won't get weather on initial load. Consider sorting by rating or using a curated priority list.

---

## Stable Photos Verification (NEW)

- 0 instances of unstable `source.unsplash.com` URLs -- **PASS**
- All 2,226 venues use stable `images.unsplash.com/photo-{id}` format -- **PASS**
- URLs are deterministic and won't rotate -- **PASS**
- But only 176 unique base images for 2,226 venues -- **FAIL** (see check 4b above)

---

## Cache-Buster Status

**Current value:** `?v=20260326a` (index.html, line 247)
**Status:** Value is dated 2026-03-26. If recent smart-weather-fetch and photo changes were deployed in the 03-26 session, this is current. If changes landed after, it's stale.

**Fix if stale (one line, index.html line 247):**
```html
<script type="text/babel" src="./app.jsx?v=20260326b" data-presets="react"></script>
```

---

## Sentry Status

**Status: LIVE (PASS)**

- Loader Script: line 77 of index.html
- `Sentry.init()`: lines 6-13 of app.jsx with valid DSN
- Dashboard: peakly.sentry.io

No action needed.

---

## Affiliate Link Summary

| Type | Count | Earning? |
|------|-------|----------|
| Amazon (`tag=peakly-20`) | 40 | Yes |
| Booking.com (`aid=2311236`) | 2 | Yes |
| SafetyWing (`referenceID=peakly`) | 1 | Yes |
| REI (no affiliate tag) | 22 | **No -- $0** |
| Placeholder IDs found | 0 | N/A |

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

## Regression Check vs Run 2

| Check | Run 2 | Run 3 | Delta |
|-------|-------|-------|-------|
| Categories | PASS (12) | PASS (12) | -- |
| Venue fields | PASS (2,226) | PASS (2,226) | -- |
| Duplicate IDs | PASS (0) | PASS (0) | -- |
| Duplicate photos (full URL) | PASS (0) | PASS (0) | -- |
| Duplicate photos (base image) | Not checked | **FAIL (176 unique for 2,226)** | NEW CHECK |
| scoreVenue | PASS (11) | PASS (11) | -- |
| Amazon affiliates | PASS (30) | PASS (40) | +10 links |
| Booking.com | PASS (2) | PASS (2) | -- |
| SafetyWing | PASS (1) | PASS (1) | -- |
| SEO files | FAIL (sitemap thin) | FAIL (sitemap thin + stale counts) | Same issue, plus stale venue count in JSON-LD/OG |
| Plausible | PASS | PASS | -- |
| Sentry | PASS (live) | PASS (live) | -- |
| Line count | 8,625 | 8,951 | +326 lines (smart weather fetch logic) |

**Regressions vs Run 2: NONE**
**New finding: 1** (photo base image duplication, P1)

---

## P1 Findings (Fix before launch)

1. **Photo base image duplication is extreme.** 176 unique Unsplash photo IDs serve 2,226 venues. Top offenders:
   - `photo-1529961482160` (fishing lake): 203 venues
   - `photo-1523819088009` (kayak fjord): 202 venues
   - `photo-1578001647043` (MTB desert): 110 venues
   - `photo-1512541405516` (beach/tan): 92 venues

   Users scrolling through any category will see the same hero image repeated. This undermines the "Steve Jobs-level quality" standard. Need ~2,050 additional unique Unsplash photo IDs.

## P2 Findings (Fix soon)

2. **Sitemap only has root URL.** Should include category deep-link URLs.
3. **JSON-LD featureList says "180+ adventure venues"** -- should say "2,200+".
4. **OG meta description says "180+ venues"** -- should say "2,200+".
5. **Cache buster** -- verify `v=20260326a` matches last deploy.

---

## One Thing That Would Break Everything If Not Caught

**The smart weather fetch fixed the API rate limit problem, but it made the VENUES array order critical.** `VENUES.slice(0, 100)` fetches weather only for the first 100 venues in the array. These happen to be the flagship venues (Whistler, Pipeline, Bora Bora, etc.) because that's how the array was originally built. But if any future expansion or sort reorders VENUES, the initial load will fetch weather for random venues instead of the most-viewed ones, and popular venues will show "Checking conditions..." until a user taps into their detail sheet. The fix is trivial: sort or tag priority venues explicitly rather than relying on array position.
