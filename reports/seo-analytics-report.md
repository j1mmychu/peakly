# SEO & Analytics Report -- Peakly

**Date:** 2026-03-24
**Agent:** SEO & Analytics
**Site:** https://j1mmychu.github.io/peakly/

---

## SEO Health Checklist

| Item | Status | Notes |
|------|--------|-------|
| `<title>` tag | FAIL | Present but only 6 chars ("Peakly"). Ideal is 50-60 chars. Should be e.g. "Peakly -- Find Surf, Ski & Adventure Spots With Perfect Conditions" |
| Meta description | PASS | 82 chars. Within recommended 120-160 range, could be slightly longer for max SERP real estate. |
| Viewport meta | PASS | Correctly set with `width=device-width, initial-scale=1.0` |
| `lang` attribute | PASS | `<html lang="en">` present |
| Theme color | PASS | `#0284c7` set |
| Favicon | PASS (weak) | Inline SVG data URI favicon. Works but no apple-touch-icon or 192x192 PNG for PWA/bookmarks. |
| Open Graph tags | PASS | `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name` all present. OG image is an Unsplash hotlink -- should be a self-hosted branded image for reliability. |
| Twitter Card tags | PASS | `summary_large_image` card with title, description, image. |
| Canonical URL | FAIL | No `<link rel="canonical">` tag. Must add: `<link rel="canonical" href="https://j1mmychu.github.io/peakly/" />` |
| robots.txt | FAIL | File does not exist. Crawlers get a 404. Need to create `/robots.txt` allowing all crawlers and pointing to sitemap. |
| sitemap.xml | FAIL | File does not exist. Single-page apps still benefit from a sitemap for the main URL and any defined routes/anchors. |
| Structured data (JSON-LD) | FAIL | No schema.org markup. Should add `WebApplication` or `SoftwareApplication` structured data for rich results. |
| Image alt attributes | PASS | All 7 `<img>` tags in app.jsx use `alt={listing.title}` or `alt={venue.title}`. Good. |
| HTTPS | PASS | GitHub Pages serves over HTTPS by default. |
| h1 tag | UNCLEAR | SPA renders headings via JSX at runtime -- not visible to crawlers that don't execute JS. This is a fundamental SEO limitation of the client-rendered architecture. |

**Score: 8/13 passing (62%)**

---

## Analytics Status

| Tool | Status |
|------|--------|
| Google Analytics (GA4) | NOT INSTALLED |
| Plausible Analytics | NOT INSTALLED |
| Any analytics | NOT INSTALLED |

**There is zero analytics instrumentation.** No pageview tracking, no event tracking, no conversion measurement.

### Recommended: Plausible Analytics Snippet

Plausible is privacy-friendly, lightweight (< 1KB), requires no cookie banner, and is ideal for a single-page app. Paste this into `index.html` inside `<head>`, before the React scripts:

```html
<!-- Plausible Analytics -->
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.js"></script>
```

For tracking SPA tab navigation as virtual pageviews, use the hash-based extension:

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

This requires a Plausible account (free for 30 days, then $9/mo for up to 10K monthly pageviews, or self-host for free).

**Alternative (free, zero-cost):** If budget is a concern, use Plausible Community Edition self-hosted on the existing DigitalOcean VPS, or use the free tier of Google Analytics:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with the actual GA4 measurement ID after creating a property in Google Analytics.

---

## Content Opportunities

### 5 Long-Tail Keywords Peakly Could Rank For

1. **"best surf spots with cheap flights right now"** -- High intent, low competition. Matches Peakly's core value prop of conditions + flight prices.
2. **"real time ski conditions and flight deals"** -- Combines live weather scoring with travel affordability.
3. **"when to surf bali cheap flights from [city]"** -- Destination + timing + price intent. Peakly can serve this with venue-specific pages or content.
4. **"adventure travel app weather conditions scoring"** -- Product-category keyword for app discovery.
5. **"cheap flights to beach destinations with good weather this week"** -- Long-tail commercial intent matching the Explore tab's exact functionality.

### 5 Blog Post Topics

1. **"The 10 Best Surf Breaks You Can Fly to for Under $300 Right Now"** -- Leverage real Travelpayouts pricing data to create a dynamic, regularly updated post. Link back to Peakly for live conditions.
2. **"How We Score Ski Conditions: The Algorithm Behind Peakly's 'Epic' Rating"** -- Technical transparency post. Explains snow depth, wind, temperature weighting. Builds trust and attracts the data-savvy adventure crowd.
3. **"Shoulder Season Guide: Why April and October Are the Cheapest Months for Surf Trips"** -- Evergreen SEO content targeting budget-conscious surfers. Peakly data can back up the claims.
4. **"Remote Work + Adventure: 15 Destinations Where You Can Surf Before Standup"** -- Targets the digital nomad segment. Each destination links to its Peakly venue detail.
5. **"Beach vs. Mountain: How Weather Data Can Pick Your Next Vacation"** -- Accessible explainer that introduces Peakly's scoring to a general travel audience.

---

## Priority Actions (Ranked)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 1 | **Install analytics** (Plausible or GA4) | 5 min | Critical -- currently flying blind with zero data on traffic, usage, or retention |
| 2 | **Expand title tag** to 50-60 chars | 1 min | High -- title tag is the single most important on-page SEO signal |
| 3 | **Add canonical URL** `<link rel="canonical">` | 1 min | High -- prevents duplicate content issues with trailing slash variants |
| 4 | **Create robots.txt** (`User-agent: * Allow: / Sitemap: ...`) | 2 min | Medium -- signals crawl permissions and sitemap location |
| 5 | **Create sitemap.xml** with the main URL | 5 min | Medium -- helps Google discover and index the page faster |
| 6 | **Add JSON-LD structured data** (WebApplication schema) | 15 min | Medium -- enables rich results in search (app name, rating, category) |
| 7 | **Self-host OG image** instead of hotlinking Unsplash | 10 min | Low-medium -- Unsplash hotlinks can break or rate-limit, hurting social sharing previews |
| 8 | **Add apple-touch-icon and PWA icons** | 10 min | Low -- improves bookmark/home screen appearance on iOS and Android |
| 9 | **Consider server-side rendering or prerendering** for SEO | High effort | High long-term -- SPA content is invisible to crawlers that don't execute JS. A prerendered index or meta tags in the static HTML would help. |

---

## Summary

Peakly has decent social sharing tags (OG + Twitter) but is missing foundational SEO infrastructure: no analytics, no canonical URL, no robots.txt, no sitemap, no structured data, and a too-short title tag. The single biggest gap is **zero analytics** -- without it, there's no way to measure any growth effort. Installing Plausible or GA4 should happen today. The remaining SEO fixes are all quick wins (under 30 minutes total) that will meaningfully improve discoverability.
