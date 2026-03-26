# SEO & Analytics Report -- Peakly

**Date:** 2026-03-25
**SEO Score:** 91% (holding steady -- no SEO-impacting deploys since 03-24)

---

## Status Summary

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Title tag | PASS | 62 chars, keyword-rich |
| 2 | Meta description | PASS | 85 chars, includes primary keywords |
| 3 | Canonical URL | PASS | `https://j1mmychu.github.io/peakly/` |
| 4 | robots.txt | PASS | Allows all, references sitemap |
| 5 | sitemap.xml | PASS | Single URL (SPA limitation), lastmod 2026-03-24 |
| 6 | Open Graph tags | PASS | title, description, image, type, url, site_name |
| 7 | Twitter Card | PASS | summary_large_image complete |
| 8 | JSON-LD structured data | PASS | WebSite + WebApplication + Organization in @graph |
| 9 | Static h1 fallback | PASS | h1 inside #root, visible before React mounts |
| 10 | Plausible analytics | PASS | `script.hash.js` (SPA hash-based tracking) |
| 11 | Plausible custom events | PASS | 6 events confirmed (details below) |
| 12 | PWA manifest | PASS | manifest.json + SW + apple-mobile-web-app meta |
| 13 | lang attribute | PASS | `<html lang="en">` |
| 14 | Favicon | PASS | SVG data URI |
| 15 | Preconnect hints | FAIL | No preconnect for unpkg, API domains |
| 16 | Custom domain | FAIL | Still on github.io subdomain (blocked by LLC) |

**Remaining gaps (9% deduction):**
- No `<link rel="preconnect">` hints for unpkg.com, open-meteo APIs, or Plausible
- No SearchAction in WebSite JSON-LD (limits sitelinks searchbox eligibility)
- No ItemList or TouristAttraction schemas for categories/venues
- sitemap.xml has only 1 URL
- OG image is generic Unsplash mountain (not branded)
- `user-scalable=no` on viewport meta (accessibility flag)
- Plausible event naming inconsistency (mixed PascalCase and snake_case)

---

## 1. JSON-LD Structured Data -- SHIPPED, Enhancement Ready

Current JSON-LD has WebSite, WebApplication, Organization. Missing two high-value schemas.

### Paste-ready enhanced JSON-LD (replace entire existing `<script type="application/ld+json">` block in index.html):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://j1mmychu.github.io/peakly/#website",
      "url": "https://j1mmychu.github.io/peakly/",
      "name": "Peakly",
      "description": "Find surf, ski and adventure spots when conditions and cheap flights align.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://j1mmychu.github.io/peakly/#search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebApplication",
      "@id": "https://j1mmychu.github.io/peakly/#app",
      "name": "Peakly",
      "url": "https://j1mmychu.github.io/peakly/",
      "applicationCategory": "TravelApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "featureList": "Real-time condition scoring, Flight price tracking, 192 adventure venues, Vibe-based AI search, Trip planning, Condition alerts, Surf forecasts, Ski conditions, Beach weather"
    },
    {
      "@type": "Organization",
      "@id": "https://j1mmychu.github.io/peakly/#org",
      "name": "Peakly",
      "url": "https://j1mmychu.github.io/peakly/"
    },
    {
      "@type": "ItemList",
      "name": "Adventure Categories",
      "description": "Browse adventure destinations by activity type",
      "numberOfItems": 12,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Skiing", "url": "https://j1mmychu.github.io/peakly/#skiing" },
        { "@type": "ListItem", "position": 2, "name": "Surfing", "url": "https://j1mmychu.github.io/peakly/#surfing" },
        { "@type": "ListItem", "position": 3, "name": "Tanning & Beach", "url": "https://j1mmychu.github.io/peakly/#tanning" },
        { "@type": "ListItem", "position": 4, "name": "Diving", "url": "https://j1mmychu.github.io/peakly/#diving" },
        { "@type": "ListItem", "position": 5, "name": "Climbing", "url": "https://j1mmychu.github.io/peakly/#climbing" },
        { "@type": "ListItem", "position": 6, "name": "Kayaking", "url": "https://j1mmychu.github.io/peakly/#kayak" },
        { "@type": "ListItem", "position": 7, "name": "Mountain Biking", "url": "https://j1mmychu.github.io/peakly/#mtb" },
        { "@type": "ListItem", "position": 8, "name": "Fishing", "url": "https://j1mmychu.github.io/peakly/#fishing" },
        { "@type": "ListItem", "position": 9, "name": "Hiking", "url": "https://j1mmychu.github.io/peakly/#hiking" },
        { "@type": "ListItem", "position": 10, "name": "Sailing", "url": "https://j1mmychu.github.io/peakly/#sailing" },
        { "@type": "ListItem", "position": 11, "name": "Paragliding", "url": "https://j1mmychu.github.io/peakly/#paragliding" },
        { "@type": "ListItem", "position": 12, "name": "Snowboarding", "url": "https://j1mmychu.github.io/peakly/#snowboard" }
      ]
    }
  ]
}
</script>
```

**What this adds:** SearchAction for Google sitelinks searchbox eligibility. ItemList for rich category results in SERPs. Updated featureList with more keywords (192 venues, surf forecasts, ski conditions, beach weather).

---

## 2. Static H1 Fallback -- SHIPPED, Minor Fix Needed

Current static h1 in index.html (lines 235-241):
```html
<h1>Peakly -- Surf, Ski & Adventure Spots with Live Conditions & Cheap Flights</h1>
<p>Discover 170+ adventure destinations worldwide. Real-time weather scoring tells you when conditions are perfect.</p>
```

This is correct for crawlers. React replaces it on mount.

**Fix needed:** Update "170+" to "190+" to match current venue count (192 venues).

---

## 3. Plausible SPA Tracking -- Fully Operational

### Script tag: CORRECT
```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```
Already using `script.hash.js` for hash-based SPA navigation. No change needed.

### Custom Events Audit

| Required Event | Status | Implementation | Line |
|----------------|--------|----------------|------|
| Tab Switch | LIVE | `plausible('Tab Switch', {props: {tab}})` via BottomNav callback | ~8592 |
| Venue Click | LIVE | `logEvent('venue_open', {venue, category})` in openDetail() | ~8439 |
| Flight Search | LIVE | `logEvent('flight_click', {venue, origin})` on flight link click | ~7546 |
| Wishlist Add | LIVE | `plausible('Wishlist Add', {props: {venue}})` | ~8429 |
| Onboarding Complete | LIVE | `plausible('Onboarding Complete', {props: {airport}})` | ~6662 |
| Score Validation | LIVE | `plausible('Score Validation', {venue, score, category, vote})` | ~7089 |

**Additional events already firing:**
- `share_click` -- share button taps (lines 3630, 7174)
- `install_pwa` -- PWA install prompt/completion (lines 3848-3849)

### Naming Inconsistency (Low Priority)

Two conventions coexist in the codebase:
- **PascalCase** (called directly via `window.plausible()`): Tab Switch, Wishlist Add, Onboarding Complete, Score Validation
- **snake_case** (called via `logEvent()` wrapper): venue_open, flight_click, share_click, install_pwa

Both reach Plausible (logEvent wraps window.plausible). But the dashboard shows mixed naming. Standardize to PascalCase to match Plausible's default convention:

| Current | Recommended |
|---------|------------|
| `venue_open` | `Venue Click` |
| `flight_click` | `Flight Search` |
| `share_click` | `Share` |
| `install_pwa` | `PWA Install` |

### Recommended New Events (Not Yet Implemented)

- `Hotel Click` -- track Booking.com affiliate clicks for revenue attribution (2 link locations in VenueDetailSheet)
- `Gear Click` -- track gear affiliate link clicks (Amazon, REI, Backcountry)

---

## 4. Competitor SEO Gap Analysis

### How Competitors Rank

| Keyword Pattern | Surfline | OnTheSnow | AllTrails | Gap for Peakly |
|----------------|----------|-----------|-----------|----------------|
| "best surf spots [region]" | Ranks 1-3 | N/A | N/A | LOW -- Surfline dominates |
| "ski conditions [resort]" | N/A | Ranks 1-5 | N/A | LOW -- OnTheSnow dominates |
| "when to visit [destination]" | Weak | Weak | Moderate | HIGH -- nobody owns multi-sport |
| "cheap flights to [adventure spot]" | Zero | Zero | Zero | WIDE OPEN |
| "[sport] + flights + conditions" | Zero | Zero | Zero | WIDE OPEN -- this IS Peakly |
| "best time to surf [spot]" | Strong | N/A | N/A | MEDIUM -- can differentiate with flight data |
| "adventure travel conditions" | Zero | Zero | Zero | UNCONTESTED |

### Keyword Clusters Peakly Can Own

1. **"cheap flights to [adventure destination]"** -- e.g., "cheap flights to Bali surf," "cheap flights to Whistler ski." KAYAK ranks but has zero conditions awareness. Peakly owns this intersection.

2. **"best time to [activity] in [location]"** -- e.g., "best time to surf in Portugal," "best time to ski in Japan." Travel blogs rank with static content. Peakly's real-time scoring is a natural authority signal.

3. **"surf trip deals" / "ski trip deals"** -- Commercial intent, currently owned by OTAs with no conditions intelligence.

4. **"best conditions [sport] this week"** -- Zero competition. Nobody aggregates multi-sport conditions in real time.

5. **"when to go [destination] for [activity]"** -- Travel blogs dominate with static, outdated content. Peakly's dynamic scoring can outrank with structured data + freshness.

### Content Strategy (No Code Changes Needed Today)

To rank for these keywords, Peakly needs indexable content per venue. Current SPA renders everything client-side. Two paths:

**Option A (Now):** Dynamic meta tag updates when venues are opened via deep links (see Section 6 below).

**Option B (Post-custom-domain):** Server-side rendered `/destinations/[venue-slug]` paths with unique meta tags. Transformative for SEO but requires infrastructure beyond GitHub Pages.

---

## 5. Core Web Vitals Estimate

| Metric | Estimate | Google Target | Status |
|--------|----------|---------------|--------|
| **LCP** | 3.5-5.0s | < 2.5s | POOR |
| **INP** | 100-200ms | < 200ms | BORDERLINE |
| **CLS** | 0.02-0.05 | < 0.1 | GOOD |

### The Single Biggest CWV Issue: LCP

**Root cause:** Babel Standalone (~690KB) must download, parse, then transpile app.jsx (5400+ lines) before any React content renders. This adds 2-4 seconds to LCP that a pre-built app would not have.

Loading chain:
1. HTML (~2KB) -- instant
2. React 18 UMD (~130KB) -- fast, CDN cached
3. **Babel Standalone (~690KB) -- SLOW bottleneck**
4. app.jsx (~180KB) -- moderate
5. **Babel transpiles 5400 lines in-browser -- 1-3s on mobile**
6. React renders -- fast after transpilation

### Fix Options

**Option 1: Pre-transpile (highest impact, adds build step)**

```bash
npx @babel/cli@7.24.7 --presets @babel/preset-react app.jsx -o app.js
```

Replace in index.html:
```html
<!-- Remove Babel Standalone script tag entirely -->
<!-- Change: -->
<script type="text/babel" src="./app.jsx?v=20260325c" data-presets="react"></script>
<!-- To: -->
<script src="./app.js?v=20260325d"></script>
```

Impact: Removes 690KB download + 1-3s transpilation. LCP drops from ~4s to ~1.5-2s.
Trade-off: Adds a build step. Conflicts with "no build step" architecture decision.

**Option 2: Preconnect hints (small impact, no architecture change)**

Add to `<head>` in index.html, before the Google Fonts link:
```html
<link rel="preconnect" href="https://unpkg.com" />
<link rel="preconnect" href="https://plausible.io" />
<link rel="dns-prefetch" href="https://api.open-meteo.com" />
<link rel="dns-prefetch" href="https://marine-api.open-meteo.com" />
<link rel="dns-prefetch" href="https://peakly-api.duckdns.org" />
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" as="script" />
```

Impact: ~200-400ms LCP improvement. Zero architecture change.

**Recommendation for Reddit launch:** Implement Option 2 now (5 minutes). Defer Option 1 until post-launch if mobile bounce rates are high.

---

## 6. Highest-Impact Single Change for Reddit-Driven Organic Growth

**Dynamic meta tags on venue open for better Reddit/social link previews.**

When someone shares a Peakly venue link on Reddit (e.g., `https://j1mmychu.github.io/peakly/#venue-pipeline`), Reddit's preview crawler currently shows the same generic description for every venue. Every shared link looks identical.

### Paste-ready fix (add to `openDetail` function in app.jsx, after the existing `logEvent` call at ~line 8439):

```javascript
// Dynamic meta tags for social sharing
try {
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content',
    `${listing.title} — ${listing.conditionLabel} conditions (${listing.conditionScore}/100). Flights from $${listing.flight?.price || '???'}. Live scoring on Peakly.`
  );
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content',
    `${listing.title} — ${listing.conditionLabel} (${listing.conditionScore}/100). Real-time scoring for surf, ski & adventure spots.`
  );
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', `${listing.title} — Peakly`);
  if (listing.photo) {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', listing.photo);
  }
} catch {}
```

**Why this matters for Reddit:** When users post "check out this surf spot" with a Peakly link, the embed will show the venue name, photo, condition score, and flight price instead of generic copy. Dramatically increases click-through from Reddit threads.

**Also add a reset** in the detail close handler (where `setDetailVenue(null)` is called) to restore the original meta tags.

---

## Action Items (Priority Order)

| # | Item | Effort | Impact | Status |
|---|------|--------|--------|--------|
| 1 | Add preconnect/dns-prefetch + preload hints to index.html | 5 min | ~300ms LCP | OPEN -- carryover x3 |
| 2 | Update static p tag: "170+" to "190+" | 1 min | Accuracy | OPEN -- carryover x2 |
| 3 | Add SearchAction + ItemList to JSON-LD (paste-ready above) | 10 min | Rich SERP results | OPEN -- carryover x2 |
| 4 | Standardize Plausible event names to PascalCase | 15 min | Clean analytics | NEW |
| 5 | Dynamic meta tags on venue open (paste-ready above) | 15 min | Reddit link preview CTR | NEW -- highest ROI for launch |
| 6 | Add Hotel Click + Gear Click Plausible events | 10 min | Revenue attribution | NEW |
| 7 | Create branded OG image (not generic Unsplash) | 30 min | Social CTR | OPEN -- carryover |
| 8 | Pre-transpile JSX to eliminate Babel runtime | 1 hr | ~2s LCP improvement | OPEN -- Phase 2 |

**Editorial note:** Items 1-3 are under 20 minutes combined and have been open for 3 consecutive cycles. They should be batched into one commit. Item 5 is the highest-ROI new item before Reddit launch.

---

## Week-over-Week SEO Score Tracking

| Date | Score | Changes |
|------|-------|---------|
| 2026-03-22 | 62% | Baseline |
| 2026-03-23 | 81% | Title, canonical, robots.txt, sitemap, Plausible, OG tags |
| 2026-03-24 | 91% | JSON-LD, static h1, script.hash.js, 5 custom events, PWA manifest |
| 2026-03-25 | 91% | No SEO-impacting changes. 6th event (Score Validation) added. |
| Target | 95%+ | Needs: preconnect hints, enhanced JSON-LD, dynamic meta tags, branded OG image |

---

*Next run: Check if preconnect hints (item #1) and JSON-LD enhancement (item #3) have been implemented. If Reddit launch date is confirmed, prioritize item #5 (dynamic meta tags) above all else.*
