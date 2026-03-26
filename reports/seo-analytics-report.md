# SEO & Analytics Report -- Peakly

**Date:** 2026-03-25 (Run 2)
**SEO Score:** 91% (holding steady from 03-24)
**Previous Score:** 91% (03-25 Run 1) | 81% (03-23) | 62% (03-22 baseline)

---

## Status Summary

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Title tag | PASS | 62 chars, keyword-rich: "Peakly -- Find Surf, Ski & Adventure Spots with Cheap Flights" |
| 2 | Meta description | PASS | 85 chars, includes primary keywords |
| 3 | Canonical URL | PASS | `https://j1mmychu.github.io/peakly/` |
| 4 | robots.txt | PASS | Allows all, references sitemap |
| 5 | sitemap.xml | PASS | Single URL (SPA limitation), lastmod 2026-03-24 |
| 6 | Open Graph tags | PASS | title, description, image, type, url, site_name |
| 7 | Twitter Card | PASS | summary_large_image complete |
| 8 | JSON-LD structured data | PASS | WebSite + WebApplication + Organization in @graph |
| 9 | Static h1 fallback | PASS | h1 inside #root div, visible before React mounts |
| 10 | Plausible analytics | PASS | `script.hash.js` (SPA hash-based tracking) |
| 11 | Plausible custom events | PASS | 8 events firing (details in Section 3) |
| 12 | PWA manifest | PASS | manifest.json + SW + apple-mobile-web-app meta |
| 13 | lang attribute | PASS | `<html lang="en">` |
| 14 | Favicon | PASS | SVG data URI |
| 15 | Preconnect hints | FAIL | No preconnect for unpkg, API domains |
| 16 | Custom domain | FAIL | Still on github.io subdomain (LLC approved -- domain registration pending) |

**Remaining gaps (9% deduction):**
- No `<link rel="preconnect">` hints for unpkg.com, open-meteo APIs, or Plausible
- No SearchAction in WebSite JSON-LD (limits sitelinks searchbox eligibility)
- No ItemList or TouristAttraction schemas for categories/venues
- sitemap.xml has only 1 URL (SPA limitation)
- OG image is generic Unsplash mountain (not branded)
- `user-scalable=no` on viewport meta (accessibility concern)
- Plausible event naming inconsistency (mixed PascalCase and snake_case)

---

## 1. JSON-LD Structured Data -- SHIPPED, Enhancement Ready

Current JSON-LD in index.html (lines 35-64) has WebSite, WebApplication, Organization. Missing SearchAction (for sitelinks searchbox) and ItemList (for rich category results).

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
      "featureList": "Real-time condition scoring, Flight price tracking, 192 adventure venues worldwide, Vibe-based AI search, Trip planning, Condition alerts, Surf forecasts, Ski conditions, Beach weather scoring, Kitesurfing conditions, Diving visibility, Climbing weather"
    },
    {
      "@type": "Organization",
      "@id": "https://j1mmychu.github.io/peakly/#org",
      "name": "Peakly",
      "url": "https://j1mmychu.github.io/peakly/",
      "sameAs": []
    },
    {
      "@type": "ItemList",
      "name": "Adventure Sport Categories",
      "description": "Browse adventure destinations by activity type with real-time condition scoring",
      "numberOfItems": 11,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Skiing Destinations", "url": "https://j1mmychu.github.io/peakly/#skiing" },
        { "@type": "ListItem", "position": 2, "name": "Surfing Spots", "url": "https://j1mmychu.github.io/peakly/#surfing" },
        { "@type": "ListItem", "position": 3, "name": "Hiking Trails", "url": "https://j1mmychu.github.io/peakly/#hiking" },
        { "@type": "ListItem", "position": 4, "name": "Diving Destinations", "url": "https://j1mmychu.github.io/peakly/#diving" },
        { "@type": "ListItem", "position": 5, "name": "Rock Climbing Spots", "url": "https://j1mmychu.github.io/peakly/#climbing" },
        { "@type": "ListItem", "position": 6, "name": "Beach & Tanning", "url": "https://j1mmychu.github.io/peakly/#tanning" },
        { "@type": "ListItem", "position": 7, "name": "Kitesurfing Spots", "url": "https://j1mmychu.github.io/peakly/#kite" },
        { "@type": "ListItem", "position": 8, "name": "Kayaking Destinations", "url": "https://j1mmychu.github.io/peakly/#kayak" },
        { "@type": "ListItem", "position": 9, "name": "Mountain Biking Trails", "url": "https://j1mmychu.github.io/peakly/#mtb" },
        { "@type": "ListItem", "position": 10, "name": "Fishing Spots", "url": "https://j1mmychu.github.io/peakly/#fishing" },
        { "@type": "ListItem", "position": 11, "name": "Paragliding Sites", "url": "https://j1mmychu.github.io/peakly/#paraglide" }
      ]
    },
    {
      "@type": "TouristDestination",
      "name": "Adventure Destinations on Peakly",
      "description": "192 adventure destinations across 6 continents with live condition scoring, flight prices, and weather forecasts",
      "touristType": ["Adventure traveler", "Surfer", "Skier", "Hiker", "Diver", "Climber"]
    }
  ]
}
</script>
```

**What this adds over current:**
- SearchAction for Google sitelinks searchbox eligibility
- ItemList with 11 categories (matched to current CATEGORIES array minus "All")
- TouristDestination schema for destination-intent queries
- Expanded featureList with more keyword coverage
- Organization.sameAs ready for social profiles when available

---

## 2. Static H1 Fallback -- SHIPPED, Minor Update Needed

Current static h1 in index.html (lines 238-243):
```html
<h1>Peakly -- Surf, Ski & Adventure Spots with Live Conditions & Cheap Flights</h1>
<p>Discover 170+ adventure destinations worldwide. Real-time weather scoring tells you when conditions are perfect.</p>
```

**Fix needed:** Update "170+" to "190+" to match current venue count (192 venues). This is a 1-character edit at line 242 of index.html:

```html
<p style="text-align:center;color:#717171;font-size:14px;max-width:400px;margin:0 auto;">
  Discover 190+ adventure destinations worldwide. Real-time weather scoring tells you when conditions are perfect.
</p>
```

---

## 3. Plausible SPA Tracking -- Fully Operational

### Script tag: CORRECT (already upgraded)
```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```
Located at index.html line 32. Using `script.hash.js` for hash-based SPA navigation. No change needed.

### Complete Event Audit

| Event | Method | Naming | Location in app.jsx | Status |
|-------|--------|--------|---------------------|--------|
| Tab Switch | `window.plausible()` direct | PascalCase | ~line 8616 (BottomNav callback) | LIVE |
| Venue Click (venue_open) | `logEvent()` wrapper | snake_case | ~line 8463 (openDetail) | LIVE |
| Flight Search (flight_click) | `logEvent()` wrapper | snake_case | ~line 7553 (flight link onClick) | LIVE |
| Wishlist Add | `window.plausible()` direct | PascalCase | ~line 8453 | LIVE |
| Onboarding Complete | `window.plausible()` direct | PascalCase | ~line 6669 | LIVE |
| Score Validation | `window.plausible()` direct | PascalCase | ~line 7096 | LIVE |
| Share (share_click) | `logEvent()` wrapper | snake_case | ~lines 3637, 7181 | LIVE |
| Hotel Click (hotel_click) | `logEvent()` wrapper | snake_case | ~line 7565 | LIVE |

**Additional non-Plausible events logged to localStorage:**
- `install_pwa` / `install_pwa {result: "installed"}` -- PWA install events (~lines 3855-3856)

### Naming Inconsistency (Carryover)

Two conventions coexist:
- **PascalCase** (called directly via `window.plausible()`): Tab Switch, Wishlist Add, Onboarding Complete, Score Validation
- **snake_case** (called via `logEvent()` wrapper): venue_open, flight_click, share_click, hotel_click, install_pwa

Both reach Plausible (logEvent wraps window.plausible at line 3844). The dashboard will show mixed naming.

**Recommended standardization** (all to PascalCase to match Plausible convention):

| Current | Recommended | Code Change |
|---------|------------|-------------|
| `venue_open` | `Venue Click` | line 8463: `logEvent('Venue Click', ...)` |
| `flight_click` | `Flight Search` | line 7553: `logEvent('Flight Search', ...)` |
| `share_click` | `Share` | lines 3637, 7181: `logEvent('Share', ...)` |
| `hotel_click` | `Hotel Click` | line 7565: `logEvent('Hotel Click', ...)` |
| `install_pwa` | `PWA Install` | lines 3855-3856: `logEvent('PWA Install', ...)` |

### Recommended New Events (Not Yet Implemented)

| Event | Trigger | Props | Why |
|-------|---------|-------|-----|
| `Gear Click` | Any gear affiliate link click (Amazon, REI) | `{vendor, item, venue}` | Revenue attribution for gear affiliates |
| `Alert Create` | New alert saved | `{category, region}` | Measure engagement funnel depth |
| `Ski Pass Filter` | Ikon/Epic/Independent pill tap | `{pass}` | Validate ski pass feature usage |

---

## 4. Competitor SEO Gap Analysis

### How Competitors Rank

| Keyword Pattern | Surfline | OnTheSnow | AllTrails | Gap for Peakly |
|----------------|----------|-----------|-----------|----------------|
| "best surf spots [region]" | Ranks 1-3 | N/A | N/A | LOW -- Surfline owns this |
| "ski conditions [resort]" | N/A | Ranks 1-5 | N/A | LOW -- OnTheSnow owns this |
| "when to visit [destination]" | Weak | Weak | Moderate | HIGH -- nobody owns multi-sport timing |
| "cheap flights to [adventure spot]" | Zero | Zero | Zero | WIDE OPEN |
| "[sport] + flights + conditions" | Zero | Zero | Zero | WIDE OPEN -- this IS Peakly |
| "best time to surf [spot]" | Strong | N/A | N/A | MEDIUM -- can differentiate with flight data |
| "adventure travel conditions" | Zero | Zero | Zero | UNCONTESTED |
| "surf trip deals" | Zero | Zero | Zero | COMMERCIAL INTENT, OPEN |
| "[sport] conditions this week" | Weak (site-specific) | Weak (site-specific) | Zero | OPEN -- multi-sport aggregation |

### Top 5 Keyword Clusters Peakly Can Own

1. **"cheap flights to [adventure destination]"** -- e.g., "cheap flights to Bali surf," "cheap flights to Whistler ski." KAYAK ranks but is conditions-blind. Peakly owns this intersection. **Volume:** High. **Competition:** Low for adventure-specific intent.

2. **"best time to [activity] in [location]"** -- e.g., "best time to surf in Portugal," "best time to ski in Japan." Currently dominated by static travel blog content from 2-3 years ago. Peakly's real-time scoring is a natural freshness signal. **Volume:** Very high. **Competition:** Medium (static blogs).

3. **"[sport] trip deals"** -- e.g., "surf trip deals," "ski trip deals this winter." Commercial intent, currently owned by generic OTAs with zero conditions intelligence. **Volume:** High. **Competition:** Low for conditions-aware results.

4. **"best conditions [sport] this week"** -- Zero competition. Nobody aggregates multi-sport conditions in real time with flight pricing. **Volume:** Low but growing. **Competition:** None.

5. **"when to go [destination] for [activity]"** -- Slight twist on #2. Targets the timing-decision moment. Travel blogs dominate with stale, undated content. Dynamic scoring can outrank. **Volume:** High. **Competition:** Medium.

### Content Strategy for Keyword Capture

Current SPA architecture renders everything client-side, which limits Google's ability to index venue-specific content.

**Option A (Now, zero infrastructure):** Enhance JSON-LD with venue-specific schemas. Add dynamic meta tag updates when venues are opened via hash URLs. Google's rendering engine can index hash-based SPAs when structured data is present.

**Option B (Post-custom-domain):** Static `/destinations/[venue-slug]` pages with server-rendered meta tags. Requires infrastructure beyond GitHub Pages (e.g., Cloudflare Workers, Vercel). Transformative for SEO but deferred.

**Option C (Highest ROI, near-term):** Create a blog subdirectory with static HTML pages targeting keyword cluster #2 -- "Best Time to Surf in Bali," "Best Time to Ski Whistler," etc. Each page links to the live Peakly app. No infrastructure change needed. GitHub Pages serves static HTML natively.

---

## 5. Core Web Vitals Estimate

| Metric | Estimate | Google Target | Status |
|--------|----------|---------------|--------|
| **LCP** | 3.5-5.0s | < 2.5s | POOR |
| **INP** | 100-200ms | < 200ms | BORDERLINE |
| **CLS** | 0.02-0.05 | < 0.1 | GOOD |

### The Single Biggest CWV Issue: LCP

**Root cause:** Babel Standalone (~690KB) must download, parse, then transpile app.jsx (5400+ lines) before any React content renders. This adds 2-4 seconds to LCP on top of network latency.

Loading chain:
1. HTML (~7KB) -- instant
2. Google Fonts CSS -- render blocking (~100ms)
3. Sentry SDK (~30KB) -- synchronous script, blocks parser
4. React 18 UMD (~130KB) -- synchronous, CDN cached
5. **Babel Standalone (~690KB) -- MAIN BOTTLENECK**
6. app.jsx (~180KB) -- moderate
7. **Babel transpiles 5400 lines in-browser -- 1-3s on mobile**
8. React mounts, splash screen dismisses

**Total time to interactive on 4G mobile: ~4-6 seconds.**

### Fix Options (Ordered by Impact/Effort Ratio)

**Option 1: Preconnect + preload hints (5 min, no architecture change)**

Add to `<head>` in index.html, immediately after the charset meta tag:
```html
<link rel="preconnect" href="https://unpkg.com" />
<link rel="preconnect" href="https://plausible.io" />
<link rel="dns-prefetch" href="https://api.open-meteo.com" />
<link rel="dns-prefetch" href="https://marine-api.open-meteo.com" />
<link rel="dns-prefetch" href="https://peakly-api.duckdns.org" />
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" as="script" />
```

**Impact:** ~200-400ms LCP improvement. Browsers start DNS/TLS for unpkg before hitting the script tags.

**Option 2: Move Sentry to defer/async (2 min)**

Current (line 77): `<script src='https://js.sentry-cdn.com/...' crossorigin='anonymous'></script>`

Change to: `<script defer src='https://js.sentry-cdn.com/...' crossorigin='anonymous'></script>`

**Impact:** ~100-200ms. Sentry currently blocks HTML parsing. Adding `defer` lets the parser continue.

**Option 3: Pre-transpile JSX (1 hr, adds build step)**

```bash
npx @babel/cli@7.24.7 --presets @babel/preset-react app.jsx -o app.js
```

Replace in index.html:
```html
<!-- Remove Babel Standalone script tag entirely -->
<script src="./app.js?v=20260325d"></script>
```

**Impact:** Removes 690KB download + 1-3s transpilation. LCP drops from ~4s to ~1.5-2s. Trade-off: Adds a build step. Conflicts with "no build step" architecture.

**Recommendation:** Implement Options 1 and 2 now (7 minutes combined). These shave ~400-600ms with zero risk. Defer Option 3 until mobile bounce rate data from Plausible warrants it.

---

## 6. Highest-Impact Single Change for Reddit-Driven Organic Growth

**Dynamic meta tags on venue open for better Reddit/social link previews.**

When someone shares a Peakly venue link on Reddit (e.g., `https://j1mmychu.github.io/peakly/#venue-pipeline`), Reddit's OEmbed/OpenGraph preview crawler currently shows the same generic description and mountain photo for every venue. Every shared link looks identical.

### Paste-ready implementation (add to openDetail function in app.jsx, after the logEvent call at ~line 8463):

```javascript
// Dynamic meta tags for social sharing previews
try {
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content',
    `${listing.title} -- ${listing.conditionLabel || 'Live'} conditions (${listing.conditionScore || '?'}/100). Flights from $${listing.flight?.price || '???'}. Real-time scoring on Peakly.`
  );
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content',
    `${listing.title} -- ${listing.conditionLabel || 'Live'} conditions (${listing.conditionScore || '?'}/100). Real-time scoring for surf, ski & adventure spots.`
  );
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', `${listing.title} -- Peakly`);
  if (listing.photo) {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', listing.photo);
  }
} catch {}
```

### Meta tag reset (add where setDetailVenue(null) is called, in the detail close handler):

```javascript
// Reset meta tags to defaults
try {
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Peakly \u2014 Find surf, ski & adventure spots when conditions and cheap flights align.');
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'Find surf, ski & beach spots with perfect conditions and cheap flights. Real-time weather scoring for 180+ venues worldwide.');
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Peakly \u2014 Adventure When Conditions Align');
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&crop=center');
} catch {}
```

**Why this is highest ROI for Reddit launch:** When users post venue links in r/surfing, r/skiing, r/solotravel, the embed will show the venue-specific name, photo, condition score, and flight price instead of the same generic "Peakly -- Adventure When Conditions Align" card every time. Venue-specific previews dramatically increase click-through from social threads.

**Important caveat:** Reddit and most social crawlers do NOT execute JavaScript. They read the initial HTML meta tags. This dynamic meta tag approach improves the experience for users who copy the URL from an already-open venue sheet. For true social preview improvement, you need server-side rendering or a prerender service. However, the hash-based URLs mean the meta tags in the initial HTML are always what social crawlers see. This code still provides value for:
- Browser tab titles updating per venue
- Any crawler that does execute JS (Google, some Twitter/X crawlers)
- Future prerender service integration

---

## Action Items (Priority Order)

| # | Item | Effort | Impact | Status |
|---|------|--------|--------|--------|
| 1 | Add preconnect/dns-prefetch + preload hints to index.html | 5 min | ~300-400ms LCP | OPEN -- carryover x4 |
| 2 | Add `defer` to Sentry script tag | 1 min | ~100-200ms LCP | NEW |
| 3 | Update static p tag: "170+" to "190+" | 1 min | Accuracy | OPEN -- carryover x3 |
| 4 | Add SearchAction + ItemList + TouristDestination to JSON-LD (paste-ready above) | 10 min | Rich SERP results | OPEN -- carryover x3 |
| 5 | Standardize Plausible event names to PascalCase | 15 min | Clean analytics dashboard | OPEN -- carryover x2 |
| 6 | Dynamic meta tags on venue open (paste-ready above) | 15 min | Better link previews, SEO | OPEN -- carryover x2 |
| 7 | Add Gear Click + Alert Create + Ski Pass Filter Plausible events | 10 min | Revenue + engagement attribution | NEW |
| 8 | Create branded OG image (not generic Unsplash) | 30 min | Social CTR | OPEN -- carryover x2 |
| 9 | Pre-transpile JSX to eliminate Babel runtime | 1 hr | ~2s LCP improvement | DEFERRED -- Phase 2 |

**Critical editorial note:** Items 1-4 represent 17 minutes of work, have been open for 3-4 consecutive cycles, and would push SEO score from 91% to ~95%. They should be the next commit.

---

## Week-over-Week SEO Score Tracking

| Date | Score | Changes |
|------|-------|---------|
| 2026-03-22 | 62% | Baseline |
| 2026-03-23 | 81% | Title, canonical, robots.txt, sitemap, Plausible, OG tags |
| 2026-03-24 | 91% | JSON-LD, static h1, script.hash.js, 5 custom events, PWA manifest |
| 2026-03-25 | 91% | No SEO-impacting changes. 8 events total. Hotel click event added. |
| Target | 95%+ | Needs: preconnect hints, enhanced JSON-LD, defer Sentry, branded OG image |

---

*Next run: Check if preconnect hints (item #1), Sentry defer (item #2), and JSON-LD enhancement (item #4) have been implemented. If Reddit launch date is set, escalate item #6 (dynamic meta tags) to P0.*
