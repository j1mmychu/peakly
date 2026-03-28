# SEO & Analytics Report -- Peakly

**Date:** 2026-03-27
**SEO Score:** 91% (unchanged since 03-24)
**Previous Scores:** 91% (03-25) | 91% (03-24) | 81% (03-23) | 62% (03-22 baseline)

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
| 11 | Plausible custom events | PASS | 10 events firing (details in Section 3) |
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
- Static h1 paragraph says "170+" but app now has 2,226 venues
- JSON-LD featureList says "180+ adventure venues" but should say "2,200+"

---

## 1. JSON-LD Structured Data -- SHIPPED, Enhancement Ready

Current JSON-LD in index.html (lines 35-64) has WebSite, WebApplication, Organization. Missing SearchAction (for sitelinks searchbox) and ItemList (for rich category results). Venue count is stale (says 180+, should be 2,200+).

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
      "featureList": "Real-time condition scoring, Flight price tracking, 2200+ adventure venues worldwide, Vibe-based AI search, Trip planning, Condition alerts, Surf forecasts, Ski conditions, Beach weather scoring, Kitesurfing conditions, Diving visibility, Climbing weather"
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
      "description": "2,226 adventure destinations across 6 continents with live condition scoring, flight prices, and weather forecasts",
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
- Expanded featureList with updated venue count (2,200+)
- Organization.sameAs ready for social profiles when available

---

## 2. Static H1 Fallback -- SHIPPED, Stale Venue Count

Current static content in index.html (lines 238-243):
```html
<h1>Peakly -- Surf, Ski & Adventure Spots with Live Conditions & Cheap Flights</h1>
<p>Discover 170+ adventure destinations worldwide. Real-time weather scoring tells you when conditions are perfect.</p>
```

The h1 is correct. The paragraph is stale -- says "170+" but app now has 2,226 venues.

**Fix needed (1-character edit at index.html line 242):**

```html
<p style="text-align:center;color:#717171;font-size:14px;max-width:400px;margin:0 auto;">
  Discover 2,200+ adventure destinations worldwide. Real-time weather scoring tells you when conditions are perfect.
</p>
```

---

## 3. Plausible SPA Tracking -- Fully Operational

### Script tag: CORRECT (already upgraded)
```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```
Located at index.html line 32. Using `script.hash.js` for hash-based SPA navigation. No change needed.

### Domain note
When peakly.app domain is registered, update `data-domain` to `peakly.app` and add it as a site in Plausible dashboard.

### Complete Event Audit (app.jsx)

| Event | Method | Naming | Location | Status |
|-------|--------|--------|----------|--------|
| Tab Switch | `window.plausible()` direct | PascalCase | Line ~8942 (BottomNav callback) | LIVE |
| venue_open | `logEvent()` wrapper | snake_case | Line ~8802 (openDetail) | LIVE |
| flight_click | `logEvent()` wrapper | snake_case | Line ~7878 (flight link onClick) | LIVE |
| book_click | `window.plausible()` direct | snake_case | Line ~4086 (ListingCard book button) | LIVE |
| Wishlist Add | `window.plausible()` direct | PascalCase | Line ~8789 | LIVE |
| Onboarding Complete | `window.plausible()` direct | PascalCase | Line ~6985 | LIVE |
| Score Validation | `window.plausible()` direct | PascalCase | Line ~7421 | LIVE |
| share_click | `logEvent()` wrapper | snake_case | Lines ~3696, ~7506 | LIVE |
| hotel_click | `logEvent()` wrapper | snake_case | Line ~7890 | LIVE |
| install_pwa | `logEvent()` wrapper | snake_case | Lines ~3914-3915 | LIVE |

**All 5 spec-required events are LIVE:**
- Tab Switch = Tab Switch (exact match)
- Venue Click = `venue_open` (name differs)
- Flight Search = `flight_click` (name differs)
- Wishlist Add = Wishlist Add (exact match)
- Onboarding Complete = Onboarding Complete (exact match)

### Naming Inconsistency (Carryover from Run 2)

Two conventions coexist:
- **PascalCase** (called directly via `window.plausible()`): Tab Switch, Wishlist Add, Onboarding Complete, Score Validation
- **snake_case** (called via `logEvent()` wrapper or direct): venue_open, flight_click, book_click, share_click, hotel_click, install_pwa

Both reach Plausible (logEvent wraps window.plausible at line ~3903). The Plausible dashboard shows mixed naming.

**Recommended standardization** (all to PascalCase to match Plausible convention):

| Current | Recommended | File / Line |
|---------|------------|-------------|
| `venue_open` | `Venue Click` | app.jsx ~8802 |
| `flight_click` | `Flight Search` | app.jsx ~7878 |
| `book_click` | `Book Click` | app.jsx ~4086 |
| `share_click` | `Share` | app.jsx ~3696, ~7506 |
| `hotel_click` | `Hotel Click` | app.jsx ~7890 |
| `install_pwa` | `PWA Install` | app.jsx ~3914-3915 |

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

**Root cause:** Babel Standalone (~690KB gzipped ~180KB) must download, parse, then transpile app.jsx (~5,400 lines) before any React content renders. This adds 2-4 seconds to LCP on top of network latency.

Loading chain:
1. HTML (~7KB) -- instant
2. Google Fonts CSS -- render blocking (~100ms)
3. Sentry SDK (~30KB) -- synchronous script, blocks parser
4. React 18 UMD (~130KB) -- synchronous, CDN cached
5. **Babel Standalone (~690KB) -- MAIN BOTTLENECK**
6. app.jsx (~200KB+) -- moderate
7. **Babel transpiles 5,400 lines in-browser -- 1-3s on mobile**
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

**Option 2: Move Sentry to defer/async (1 min)**

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
<script src="./app.js?v=20260326a"></script>
```

**Impact:** Removes 690KB download + 1-3s transpilation. LCP drops from ~4s to ~1.5-2s. Trade-off: Adds a build step. Conflicts with "no build step" architecture decision.

**Recommendation:** Implement Options 1 and 2 now (6 minutes combined, ~400-600ms improvement). Defer Option 3 until mobile bounce rate data from Plausible justifies the architecture change.

---

## 6. Highest-Impact Single Change for Reddit-Driven Organic Growth

**Dynamic meta tags on venue open for better social link previews.**

When someone shares a Peakly venue link on Reddit (e.g., `https://j1mmychu.github.io/peakly/#venue-pipeline`), Reddit's OpenGraph crawler currently shows the same generic description and mountain photo for every venue. Every shared link looks identical.

### Paste-ready implementation (add to openDetail function in app.jsx, after the logEvent call at ~line 8802):

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
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Peakly -- Find surf, ski & adventure spots when conditions and cheap flights align.');
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'Find surf, ski & beach spots with perfect conditions and cheap flights. Real-time weather scoring for 2,200+ venues worldwide.');
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Peakly -- Adventure When Conditions Align');
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&crop=center');
} catch {}
```

**Important caveat:** Reddit and most social crawlers do NOT execute JavaScript. They read the initial HTML meta tags. This dynamic approach improves: browser tab titles per venue, any JS-executing crawler (Google, some Twitter/X crawlers), and future prerender service integration. For true social preview improvement on Reddit, a prerender service or SSR would be needed.

**Highest immediate ROI for Reddit launch:** Write subreddit-specific posts with keyword-rich titles. Peakly's strongest Reddit angles:
- r/surfing: "I built a free tool that shows cheapest flights to surf spots when conditions are actually good"
- r/skiing: "Made a site tracking live ski conditions + flight prices to 2,200+ spots worldwide"
- r/solotravel: "Free tool: find adventure destinations where conditions are perfect AND flights are cheap"

Each post links to a category-specific hash URL (e.g., `#surfing`, `#skiing`) tracked by Plausible.

---

## Action Items (Priority Order)

| # | Item | Effort | Impact | Status |
|---|------|--------|--------|--------|
| 1 | Add preconnect/dns-prefetch + preload hints to index.html | 5 min | ~300-400ms LCP | OPEN -- carryover x5 |
| 2 | Add `defer` to Sentry script tag | 1 min | ~100-200ms LCP | OPEN -- carryover x1 |
| 3 | Update static p tag: "170+" to "2,200+" | 1 min | Accuracy | OPEN -- carryover x4 |
| 4 | Add SearchAction + ItemList + TouristDestination to JSON-LD (paste-ready above) | 10 min | Rich SERP results | OPEN -- carryover x4 |
| 5 | Update JSON-LD featureList: "180+" to "2,200+" | 1 min | Accuracy | NEW |
| 6 | Standardize Plausible event names to PascalCase | 15 min | Clean analytics dashboard | OPEN -- carryover x3 |
| 7 | Dynamic meta tags on venue open (paste-ready above) | 15 min | Better link previews | OPEN -- carryover x3 |
| 8 | Add Gear Click + Alert Create + Ski Pass Filter Plausible events | 10 min | Revenue + engagement attribution | OPEN -- carryover x1 |
| 9 | Create branded OG image (not generic Unsplash) | 30 min | Social CTR | OPEN -- carryover x3 |
| 10 | Pre-transpile JSX to eliminate Babel runtime | 1 hr | ~2s LCP improvement | DEFERRED -- Phase 2 |

**Critical editorial note:** Items 1-5 represent 18 minutes of work, have been open for multiple cycles, and would push SEO score from 91% to ~95%. They should be the next commit.

---

## Week-over-Week SEO Score Tracking

| Date | Score | Changes |
|------|-------|---------|
| 2026-03-22 | 62% | Baseline |
| 2026-03-23 | 81% | Title, canonical, robots.txt, sitemap, Plausible, OG tags |
| 2026-03-24 | 91% | JSON-LD, static h1, script.hash.js, 5 custom events, PWA manifest |
| 2026-03-25 | 91% | No SEO-impacting changes. 10 events total. Venues expanded to 2,226. Weather cache live. |
| Target | 95%+ | Needs: preconnect hints, enhanced JSON-LD, defer Sentry, fix stale venue counts, branded OG image |

---

---

## 2026-03-27 Run Notes

### Changes Since Last Run (03-25)
- Premium splash screen added (03-26)
- Pull-to-refresh + sport-ordered tabs added (03-26)
- Weather cache with localStorage + 30-min TTL shipped (03-26)
- Scale Guardian agent added as 8th agent (03-26)
- 2,226 venues confirmed stable with batched weather fetching

### What Has NOT Changed (Carryover Items Still Open)
All 10 action items from the 03-25 report remain open. None have been implemented. The score is stuck at 91%.

**Items 1-5 have been open for 5+ consecutive runs and represent 18 minutes of cumulative work.** This is the longest-standing set of unshipped SEO fixes.

### Updated Priority Assessment

| # | Item | Carry Count | Effort | Status |
|---|------|-------------|--------|--------|
| 1 | Add preconnect/dns-prefetch + preload hints | **6 runs** | 5 min | OPEN |
| 2 | Add `defer` to Sentry script tag | **2 runs** | 1 min | OPEN |
| 3 | Update static p tag: "170+" to "2,200+" | **5 runs** | 1 min | OPEN |
| 4 | Add SearchAction + ItemList to JSON-LD | **5 runs** | 10 min | OPEN |
| 5 | Update JSON-LD featureList: "180+" to "2,200+" | **2 runs** | 1 min | OPEN |
| 6 | Standardize Plausible event names to PascalCase | **4 runs** | 15 min | OPEN |
| 7 | Dynamic meta tags on venue open | **4 runs** | 15 min | OPEN |
| 8 | Add Gear Click + Alert Create + Ski Pass Filter events | **2 runs** | 10 min | OPEN |
| 9 | Create branded OG image | **4 runs** | 30 min | OPEN |
| 10 | Pre-transpile JSX to eliminate Babel runtime | DEFERRED | 1 hr | Phase 2 |

### New Finding: Missing Plausible Events (Verified)
Confirmed that `Venue Click` and `Flight Search` events (as named in the agent spec) are implemented under different names (`venue_open` and `flight_click` respectively). They ARE firing. The naming inconsistency is cosmetic, not a data gap.

### Recommendation for This Cycle
**Batch items 1-5 into a single commit.** Total effort: ~18 minutes. This would push SEO score from 91% to ~95% and fix all stale content references. The paste-ready code has been in this report for 5 runs.

### Week-over-Week SEO Score Tracking (Updated)

| Date | Score | Changes |
|------|-------|---------|
| 2026-03-22 | 62% | Baseline |
| 2026-03-23 | 81% | Title, canonical, robots.txt, sitemap, Plausible, OG tags |
| 2026-03-24 | 91% | JSON-LD, static h1, script.hash.js, 5 custom events, PWA manifest |
| 2026-03-25 | 91% | No SEO changes. Venues expanded to 2,226. Weather cache live. |
| 2026-03-26 | 91% | No SEO changes. Splash screen, pull-to-refresh, sport-ordered tabs. |
| 2026-03-27 | 91% | No SEO changes. All 10 action items still open. |
| Target | 95%+ | Needs: preconnect hints, enhanced JSON-LD, defer Sentry, fix stale venue counts, branded OG image |

*Next run: If items 1-5 remain unshipped, escalate to product-manager agent for prioritization decision. These are trivially small fixes with outsized SEO impact.*
