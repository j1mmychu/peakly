# SEO & Analytics Report: 2026-03-24 (v2)

**Agent:** SEO & Analytics
**Site:** https://j1mmychu.github.io/peakly/
**Previous report:** 2026-03-24 (v1) -- score 62%

---

## SEO Health Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `<title>` tag | PASS | "Peakly -- Find Surf, Ski & Adventure Spots with Cheap Flights" -- 58 chars, within ideal 50-60 range. Includes primary keyword and value prop. Fixed from v1. |
| 2 | Meta description | PASS | 82 chars. Clear, keyword-rich. Could extend to 150 chars to fill SERP snippet space, but not urgent. |
| 3 | Viewport meta | PASS | Correctly set. |
| 4 | `lang` attribute | PASS | `<html lang="en">` present. |
| 5 | Theme color | PASS | `#0284c7` set. |
| 6 | Favicon | PASS (weak) | Inline SVG data URI. Works for browser tabs. No apple-touch-icon or 192x192 PNG for home screen bookmarks. |
| 7 | Open Graph tags | PASS | All six required properties present (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`). OG image is still an Unsplash hotlink -- should eventually self-host a branded image. |
| 8 | Twitter Card tags | PASS | `summary_large_image` with title, description, image. |
| 9 | Canonical URL | PASS | `<link rel="canonical" href="https://j1mmychu.github.io/peakly/" />` present. Fixed from v1. |
| 10 | robots.txt | PASS | Exists at `/robots.txt`. `User-agent: *`, `Allow: /`, `Sitemap:` directive pointing to sitemap.xml. Fixed from v1. |
| 11 | sitemap.xml | PASS | Valid XML sitemap with main URL, `lastmod` of 2026-03-24, `changefreq` daily, `priority` 1.0. Fixed from v1. |
| 12 | Structured data (JSON-LD) | FAIL | No schema.org markup. Should add `WebApplication` or `SoftwareApplication` structured data for rich results. |
| 13 | Image alt attributes | PASS | Venue images use `alt={venue.title}`. |
| 14 | HTTPS | PASS | GitHub Pages enforces HTTPS. |
| 15 | h1 tag in static HTML | FAIL | No `<h1>` in `index.html`. The SPA renders headings via JSX at runtime, invisible to crawlers that skip JS execution. Adding a static `<h1>` inside `<div id="root">` (React will replace it on hydration) would help. |
| 16 | Analytics installed | PASS | Plausible script active (see below). Fixed from v1. |

**Score: 13/16 passing (81%)** -- up from 62% in v1.

---

## Analytics Status

| Tool | Status | Details |
|------|--------|---------|
| Plausible Analytics | ACTIVE | `<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.js"></script>` -- live on line 27 of index.html, not commented out, loads before React scripts. |
| Google Analytics (GA4) | Not installed | Not needed if Plausible covers requirements. |

### Plausible Configuration Notes

- **Script variant:** Standard `script.js`. This tracks pageviews automatically but does NOT track hash changes as virtual pageviews. Since Peakly is a single-page app with tab navigation, consider upgrading to `script.hash.js` to capture tab switches (Explore, Wishlists, Alerts, Trips, Profile) as separate pageviews in Plausible.
- **Data domain:** `j1mmychu.github.io` -- this is the full domain, which means Plausible will track all traffic under that domain. If other GitHub Pages projects exist under the same domain, consider using `data-domain="j1mmychu.github.io/peakly"` with Plausible's page-specific filtering, or switching to a custom domain.
- **No `script.tagged-events.js`:** Custom event tracking requires either the Tagged Events extension script or manual `plausible()` function calls (see recommendations below).

---

## Recommended Plausible Custom Events

These events would give actionable product and growth data. Implement by calling `window.plausible('EventName', {props: {...}})` in app.jsx at the relevant interaction points.

### High Priority (implement first)

| Event Name | Trigger | Props | Why It Matters |
|------------|---------|-------|----------------|
| `Tab Switch` | User taps a bottom nav tab | `{tab: "Explore"}` | Understand which features get used. If 90% of sessions stay on Explore, the other tabs need work. |
| `Venue Click` | User opens a venue detail sheet | `{venue: "Pipeline", category: "Surfing"}` | Top venues by click volume = content/partnership priorities. |
| `Flight Search` | User taps "Search Flights" or any flight CTA | `{venue: "Chamonix", origin: "LAX"}` | Direct revenue signal. Measures how often conditions scoring converts to travel intent. |
| `Wishlist Add` | User saves a venue to wishlist | `{venue: "Hossegor"}` | Retention signal. Users who wishlist are more engaged. |
| `Onboarding Complete` | User finishes the onboarding sheet | `{home_airport: "SFO", sports: "Surfing,Skiing"}` | Funnel metric. If onboarding completion is low, the flow needs simplifying. |

### Medium Priority

| Event Name | Trigger | Props | Why It Matters |
|------------|---------|-------|----------------|
| `Filter Applied` | User applies a category/continent filter | `{category: "Skiing", continent: "Europe"}` | Shows what users are searching for -- guides venue data expansion. |
| `Vibe Search` | User submits a vibe search query | `{query: "mellow beach beginner"}` | Reveals demand for venue types that may be underrepresented. |
| `Trip Built` | User completes a trip in Trip Builder | `{destination: "Bali", duration: "7 days"}` | Measures engagement with the trip planning feature. |
| `Alert Created` | User sets up a condition alert | `{venue: "Teahupo'o", condition: "wave_height"}` | Shows intent to return. High alert creation = strong retention signal. |
| `Share Tap` | User taps any share button | `{venue: "Verbier"}` | Organic growth potential. Tracks viral loops. |

### Low Priority (nice to have)

| Event Name | Trigger | Props | Why It Matters |
|------------|---------|-------|----------------|
| `Score Badge Seen` | A venue displays an "Epic" / "Firing" badge | `{badge: "Epic", venue: "J-Bay"}` | Validates that the scoring algorithm is producing exciting results often enough. |
| `Affiliate Click` | User clicks a gear/affiliate link | `{retailer: "REI", item: "wetsuit"}` | Revenue attribution for affiliate program. |
| `Error Shown` | ErrorBoundary catches a crash | `{error: "..."}` | Complements Sentry. Tracks user-facing failures. |

### Implementation Note

To use custom events with the standard Plausible script, no script change is needed -- just call `window.plausible()` from app.jsx. Example:

```javascript
// In any click handler:
if (window.plausible) window.plausible('Venue Click', {props: {venue: v.title, category: v.category}})
```

If you want to use the `script.tagged-events.js` variant (which allows HTML `class="plausible-event-name=X"` attributes), swap the script src accordingly. For a JSX-heavy app, the JS API (`window.plausible()`) is the better fit.

---

## What Improved Since v1

| Item | Before (v1) | After (v2) |
|------|-------------|------------|
| Title tag | 6 chars ("Peakly") -- FAIL | 58 chars with keywords -- PASS |
| Canonical URL | Missing -- FAIL | Present and correct -- PASS |
| robots.txt | Missing (404) -- FAIL | Created with sitemap directive -- PASS |
| sitemap.xml | Missing -- FAIL | Valid XML with main URL -- PASS |
| Analytics | Zero instrumentation -- FAIL | Plausible active -- PASS |
| **SEO score** | **62%** | **81%** |

---

## Remaining Priority Actions

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 1 | **Upgrade Plausible to `script.hash.js`** to track tab switches as virtual pageviews | 1 min (swap script src) | High -- without this, Plausible only sees one "pageview" per session regardless of navigation |
| 2 | **Add Plausible custom events** (High Priority table above) | 30 min | High -- unlocks product analytics: which venues get clicked, flight search conversion, feature adoption |
| 3 | **Add JSON-LD structured data** (`WebApplication` schema with name, description, category, screenshot, offers) | 15 min | Medium -- enables rich search results with app info |
| 4 | **Add static `<h1>` fallback** inside `<div id="root">` in index.html (e.g., `<h1>Peakly -- Surf, Ski & Adventure Spots</h1>`) | 2 min | Medium -- gives crawlers a heading even without JS execution |
| 5 | **Self-host OG image** instead of hotlinking Unsplash | 10 min | Medium -- Unsplash hotlinks can break or rate-limit, killing social previews |
| 6 | **Extend meta description** to 140-155 chars for maximum SERP real estate | 2 min | Low-medium |
| 7 | **Add apple-touch-icon and PWA manifest** | 15 min | Low -- improves home screen bookmark appearance |
| 8 | **Submit sitemap to Google Search Console** (requires verification) | 10 min | Medium -- accelerates indexing beyond waiting for Googlebot to discover robots.txt |
| 9 | **Consider prerendering** (e.g., `react-snap` or a static HTML shell) for full SEO content visibility | High effort | High long-term -- fundamental SPA limitation |

---

## Summary

The four quick wins from v1 are all shipped: title tag expanded, canonical URL added, robots.txt and sitemap.xml created, and Plausible analytics activated. SEO health jumped from 62% to 81%. The two remaining FAIL items are JSON-LD structured data and a static h1 fallback -- both are straightforward fixes.

The immediate next move is upgrading the Plausible script to `script.hash.js` (1-minute change) so tab navigation registers as pageviews, then wiring up the five high-priority custom events to get real product analytics flowing. Without custom events, Plausible only shows aggregate pageview counts -- with them, you get venue popularity, flight search conversion rates, and feature adoption metrics that directly inform product and growth decisions.
