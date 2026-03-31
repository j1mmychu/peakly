# QA Report — Peakly

**Date:** 2026-03-29 (Run 7 — Full regression check)
**File:** app.jsx (9,036 lines) | index.html
**Current:** 9,036 lines / 2,226 venues across 11 sport categories
**Reddit launch in 2 days (March 31)**

---

## Overall: 9/11 PASS

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | CATEGORIES syntax (12 present) | PASS | All 12: all, skiing, surfing, hiking, diving, climbing, tanning, kite, kayak, mtb, fishing, paraglide. Correct syntax. |
| 2 | Venue required fields | PASS | All 2,226 venues have: id, category, title, location, lat, lon, ap, photo. 0 duplicate IDs. |
| 3 | Duplicate venue IDs | PASS | 0 duplicate venue IDs across 2,226 entries. |
| 4 | scoreVenue covers all categories | PASS | All 11 sport categories have scoring branches in switch statement + default fallback. |
| 5 | Affiliate links — Amazon | PASS | ~40 Amazon links, all with `tag=peakly-20`. 0 missing tags. |
| 6 | Affiliate links — Booking.com | PASS | 2 links with `aid=2311236`. |
| 7 | Affiliate links — SafetyWing | PASS | 1 link with `referenceID=peakly`. |
| 8 | SEO files | PASS | robots.txt correct, sitemap.xml present with 12 URLs (root + 11 categories), JSON-LD @graph with WebSite/WebApp/Org/ItemList/TouristDestination, Plausible `script.hash.js` loading, preconnect hints for 5 domains. |
| 9 | Sentry DSN | PASS | Sentry Loader Script + `Sentry.init()` with valid DSN. tracesSampleRate: 1.0, replaysOnErrorSampleRate: 1.0. Live. |
| 10 | Photo duplication | **WARN (P3)** | ~52 Unsplash photo base IDs reused across venues with different crop params (fp-x/fp-y). Visual appearance differs but base photos not 100% unique. Stable since Run 6. |
| 11 | Travelpayouts marker | **FAIL (P1)** | `TP_MARKER = "YOUR_TP_MARKER"` (line 3771). Flight links earn $0. **Flagged 3 consecutive runs. Jack action needed BEFORE March 31 Reddit launch.** |

---

## Cache-Buster Status

**Current value:** `?v=20260328a` (index.html line 281)
**Status: PASS** — fresh from yesterday's deploy. Bump on next code change.

---

## Sentry Status

**Status: LIVE (PASS)**
- Loader Script in index.html (`9416b032a46681d74645b056fcb08eb7.min.js`)
- `Sentry.init()` in app.jsx with valid DSN
- Replay sampling at 10% session / 100% error
- No empty DSN found

---

## PWA Status

| File | Status |
|------|--------|
| manifest.json | PASS — present in repo root |
| sw.js | PASS — CACHE_NAME = "peakly-v12", network-first for index.html, stale-while-revalidate for assets |
| SW registration | PASS — in index.html |
| apple-mobile-web-app meta | PASS — capable, black-translucent status bar |

---

## Regression Check vs Run 6

| Check | Run 6 | Run 7 | Delta |
|-------|-------|-------|-------|
| Categories | PASS (12) | PASS (12) | — |
| Venue fields | PASS (2,226) | PASS (2,226) | — |
| Duplicate IDs | PASS (0) | PASS (0) | — |
| Duplicate photos | WARN (55 URLs) | WARN (~52 base IDs) | Stable |
| scoreVenue | PASS (11) | PASS (11) | — |
| Amazon affiliates | PASS (39) | PASS (~40) | — |
| Booking.com | PASS (2) | PASS (2) | — |
| SafetyWing | PASS (1) | PASS (1) | — |
| SEO files | PASS | PASS | — |
| Sentry | PASS | PASS | — |
| Cache buster | PASS (v=20260328a) | PASS (v=20260328a) | — |
| TP_MARKER | FAIL | FAIL | **Still placeholder — 3rd consecutive run** |
| Line count | 9,036 | 9,036 | No change |

**Regressions vs Run 6: NONE**

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

All categories well-populated (~200 each).

---

## Affiliate Link Summary

| Type | Count | Earning? |
|------|-------|----------|
| Amazon (`tag=peakly-20`) | ~40 | Yes |
| Booking.com (`aid=2311236`) | 2 | Yes |
| SafetyWing (`referenceID=peakly`) | 1 | Yes |
| Travelpayouts (flight links) | Active | **No — TP_MARKER is placeholder** |
| REI (no affiliate tag) | 22 | **No — $0, needs Avantlink signup** |
| Backcountry (no affiliate tag) | 2 | **No — $0, needs affiliate signup** |
| GetYourGuide (no partner_id) | 1 | **No — $0, needs partner signup** |

---

## Open Findings by Priority

### P1 — Fix before Reddit launch (March 31)

1. **Travelpayouts marker is placeholder.** Line 3771: `const TP_MARKER = "YOUR_TP_MARKER"`. Every flight click across 2,226 venues earns $0 in commission. The code correctly guards against the placeholder (line 3790 checks `TP_MARKER !== "YOUR_TP_MARKER"`), so flight links work but aren't tracked. **One-line fix once Jack provides the real marker from tp.media dashboard.** This is the single highest-impact revenue fix — flight clicks are the most common user action.

### P3 — Non-blocking

2. **~52 duplicate Unsplash base photo IDs.** Reused with different crop params. Visual impact is low. CLAUDE.md "0% duplication" claim is technically inaccurate.
3. **sitemap.xml lastmod dates** still say 2026-03-27. Should bump on next deploy.

---

## Browser Testing

Browser automation tools timed out and egress proxy blocked direct fetch this run. Static code analysis only. **Code review confirms:**
- Splash screen HTML is well-formed with animations
- React 18 + ReactDOM + Babel Standalone 7.24.7 script chain intact
- BottomNav renders Explore, Alerts, Profile tabs
- CompactCard, ListingCard, FeaturedCard all have photo rendering with `onError` fallbacks
- VenueDetailSheet has touch drag > 120px dismissal logic
- ErrorBoundary wraps app root with fallback UI
- Babel parse error handler in index.html catches syntax failures

**Recommend manual browser check before March 31 launch.**

---

## One Thing That Would Break Everything If Not Caught

**Service worker serving stale broken code.** SW uses stale-while-revalidate for app.jsx. If a breaking syntax error ships, returning users get cached broken code until `CACHE_NAME` is bumped in sw.js (currently "peakly-v12"). The cache buster (`v=20260328a`) helps for fresh fetches but SW-cached responses may ignore query params. **On any breaking deploy: bump sw.js CACHE_NAME to "peakly-v13" immediately.** This has caused extended outages before.

---

*Report generated: 2026-03-29 by QA Agent (Run 7 — static analysis only, browser unavailable)*
