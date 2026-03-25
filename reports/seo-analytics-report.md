# SEO & Analytics Report: 2026-03-24 (v3)

**Agent:** SEO & Analytics
**Site:** https://j1mmychu.github.io/peakly/
**Previous report:** 2026-03-24 (v2) -- score 81%

---

## SEO Health Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `<title>` tag | PASS | "Peakly -- Find Surf, Ski & Adventure Spots with Cheap Flights" -- 58 chars, keyword-rich. |
| 2 | Meta description | PASS | 82 chars. Recommend extending to ~150 chars (see action items). |
| 3 | Viewport meta | PASS | Correctly set with `user-scalable=no`. |
| 4 | `lang` attribute | PASS | `<html lang="en">` present. |
| 5 | Theme color | PASS | `#0284c7`. |
| 6 | Favicon | PASS (weak) | Inline SVG data URI. No apple-touch-icon or 192x192 PNG. |
| 7 | Open Graph tags | PASS | All six required properties present. OG image is Unsplash hotlink (fragile). |
| 8 | Twitter Card tags | PASS | `summary_large_image` with title, description, image. |
| 9 | Canonical URL | PASS | Points to `https://j1mmychu.github.io/peakly/`. |
| 10 | robots.txt | PASS | `Allow: /` with Sitemap directive. |
| 11 | sitemap.xml | PASS | Valid XML, `lastmod` 2026-03-24, `changefreq` daily. |
| 12 | Structured data (JSON-LD) | FAIL | No schema.org markup. Full implementation provided below. |
| 13 | Image alt attributes | PASS | Venue images use `alt={venue.title}`. |
| 14 | HTTPS | PASS | GitHub Pages enforces HTTPS. |
| 15 | h1 tag in static HTML | FAIL | No `<h1>` in index.html. Fix provided below. |
| 16 | Analytics installed | PASS | Plausible active but needs SPA upgrade (see below). |

**Score: 13/16 passing (81%)** -- unchanged from v2. Two remaining fails have paste-ready fixes below.

---

## 1. JSON-LD Structured Data Implementation (P1)

Add the following immediately before `</head>` in `index.html` (after line 27, before the `<style>` block):

```html
<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://j1mmychu.github.io/peakly/#website",
      "url": "https://j1mmychu.github.io/peakly/",
      "name": "Peakly",
      "description": "Find surf, ski and adventure spots when conditions and cheap flights align. Real-time weather scoring for 170+ venues worldwide.",
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
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Adventure travel app combining live weather conditions, real-time flight prices, and AI-powered vibe search across surf, ski, hiking, diving, and 8 more outdoor sports.",
      "screenshot": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&crop=center",
      "featureList": "Real-time condition scoring, Flight price tracking, 170+ adventure venues, Vibe-based search, Trip planning, Condition alerts"
    },
    {
      "@type": "ItemList",
      "@id": "https://j1mmychu.github.io/peakly/#venue-list",
      "name": "Adventure Destinations on Peakly",
      "description": "Curated surf, ski, hiking, diving, and adventure spots worldwide with live condition scoring",
      "numberOfItems": 170,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "TouristAttraction",
            "name": "Whistler Blackcomb",
            "description": "World-class skiing in British Columbia, Canada. Live snow conditions and flight deals.",
            "geo": { "@type": "GeoCoordinates", "latitude": 50.1163, "longitude": -122.9574 },
            "url": "https://j1mmychu.github.io/peakly/#venue-whistler",
            "touristType": "Skiing"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "TouristAttraction",
            "name": "Pipeline, North Shore",
            "description": "Legendary surf break in Oahu, Hawaii. Live wave and swell conditions with flight tracking.",
            "geo": { "@type": "GeoCoordinates", "latitude": 21.6645, "longitude": -158.0453 },
            "url": "https://j1mmychu.github.io/peakly/#venue-pipeline",
            "touristType": "Surfing"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "TouristAttraction",
            "name": "Bora Bora Lagoon",
            "description": "Crystal-clear lagoon in French Polynesia. UV index and beach conditions with flight deals.",
            "geo": { "@type": "GeoCoordinates", "latitude": -16.5004, "longitude": -151.7415 },
            "url": "https://j1mmychu.github.io/peakly/#venue-borabora",
            "touristType": "Beach"
          }
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://j1mmychu.github.io/peakly/#org",
      "name": "Peakly",
      "url": "https://j1mmychu.github.io/peakly/",
      "logo": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>P</text></svg>"
    }
  ]
}
</script>
```

**Why this matters:** JSON-LD gives Google structured signals about what Peakly is (a travel web app), what it contains (170+ adventure venues), and enables rich results (site search box in SERPs, app info panels). The `TouristAttraction` entries for top venues can rank in Google's "Things to do" and knowledge panels. Only 3 representative venues are included in the static markup to keep the payload small -- Google doesn't need all 170.

---

## 2. Static H1 Fallback (P1)

Replace the current empty `<div id="root"></div>` on line 46 of `index.html` with:

```html
<div id="root">
  <h1 style="font-family:system-ui;text-align:center;padding:40px 20px;color:#222;font-size:24px;">
    Peakly — Surf, Ski &amp; Adventure Spots with Live Conditions &amp; Cheap Flights
  </h1>
  <p style="text-align:center;color:#717171;font-size:14px;max-width:400px;margin:0 auto;">
    Discover 170+ adventure destinations worldwide. Real-time weather scoring tells you when conditions are perfect.
  </p>
</div>
```

**How it works:** React's `createRoot().render()` completely replaces the children of `#root` when the app hydrates. Crawlers that don't execute JavaScript (Googlebot usually does, but Bing, social scrapers, and older bots don't) will see the static h1 and description. Once React loads, this content vanishes and the full SPA renders. Zero impact on user experience.

---

## 3. Plausible SPA Tracking Upgrade

### 3a. Switch to script.hash.js

Change line 27 of `index.html` from:

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.js"></script>
```

To:

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

**What this does:** The `script.hash.js` variant automatically tracks hash changes as virtual pageviews. When a user navigates between tabs (which could use `#explore`, `#alerts`, `#profile`), Plausible logs each as a separate pageview. Without this, every session looks like a single-page bounce regardless of engagement depth.

### 3b. Five Custom Event Implementations

All five events use `window.plausible && window.plausible(...)` to safely no-op if Plausible hasn't loaded.

#### Event 1: Tab Switch

**File:** `app.jsx`, line ~5596 (BottomNav render in App component)
**Current code:**
```jsx
<BottomNav active={activeTab} setActive={setActiveTab} alertCount={firingCount} />
```
**Replace with:**
```jsx
<BottomNav active={activeTab} setActive={(tab) => { setActiveTab(tab); window.plausible && window.plausible('Tab Switch', {props: {tab}}); }} alertCount={firingCount} />
```

#### Event 2: Venue Click

**File:** `app.jsx`, line ~5448 (openDetail callback in App component)
**Current code:**
```jsx
const openDetail = useCallback(listing => setDetailVenue(listing), []);
```
**Replace with:**
```jsx
const openDetail = useCallback(listing => {
  setDetailVenue(listing);
  window.plausible && window.plausible('Venue Click', {props: {venue: listing.title, category: listing.category}});
}, []);
```

#### Event 3: Flight Search

**File:** `app.jsx`, line ~4394 (VenueDetailSheet flight CTA)
**Current code:**
```jsx
<a href={flightUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
```
**Replace with:**
```jsx
<a href={flightUrl} target="_blank" rel="noopener noreferrer" onClick={() => { window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }} style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
```

Also add to the ListingCard flight button (line ~1389) and FeaturedCard flight button (line ~1460) -- same pattern:
```jsx
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

#### Event 4: Wishlist Add

**File:** `app.jsx`, line ~5444 (toggleWishlist callback in App component)
**Current code:**
```jsx
const toggleWishlist = useCallback(id => {
  setWishlists(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
}, [setWishlists]);
```
**Replace with:**
```jsx
const toggleWishlist = useCallback(id => {
  setWishlists(p => {
    const isAdding = !p.includes(id);
    if (isAdding) {
      const venue = VENUES.find(v => v.id === id);
      window.plausible && window.plausible('Wishlist Add', {props: {venue: venue?.title || id}});
    }
    return p.includes(id) ? p.filter(x => x !== id) : [...p, id];
  });
}, [setWishlists]);
```

#### Event 5: Onboarding Complete

**File:** `app.jsx`, line ~3909 (OnboardingSheet `complete` function)
**Current code:**
```jsx
const complete = () => {
  setProfile(p => ({ ...p, name, email, sports, homeAirport: airport, hasAccount:true }));
  onClose();
};
```
**Replace with:**
```jsx
const complete = () => {
  setProfile(p => ({ ...p, name, email, sports, homeAirport: airport, hasAccount:true }));
  window.plausible && window.plausible('Onboarding Complete', {props: {airport: airport || 'none'}});
  onClose();
};
```

---

## 4. Competitor SEO Gap Analysis

### How competitors rank today

| Competitor | Strongest SEO terms | Monthly organic traffic (est.) |
|------------|--------------------|---------------------------------|
| Surfline | "surf report [beach]", "wave forecast [location]", "best surf spots" | 3M+ |
| AllTrails | "best hikes near me", "hiking trails [city]", "easy hikes [region]" | 8M+ |
| OnTheSnow | "snow report [resort]", "ski conditions [resort]", "[resort] snow depth" | 1.5M+ |

### Keyword gaps Peakly can own

These are terms with search volume that NO competitor currently dominates:

| Keyword cluster | Monthly search volume (est.) | Competition | Why Peakly wins |
|-----------------|------------------------------|-------------|-----------------|
| "cheap flights to surf" / "surf trip cheap flights" | 1K-3K | Low | Nobody combines conditions + flights. Peakly is literally this product. |
| "best time to visit [adventure destination]" | 5K-20K per destination | Medium | Surfline/OnTheSnow answer "what are conditions now" but not "when should I go." Peakly's scoring + forecast window = the answer. |
| "ski trip deals from [city]" | 2K-5K per city | Medium | KAYAK shows flights, OnTheSnow shows conditions. Nobody merges them. |
| "adventure travel planner" / "outdoor trip planner" | 3K-8K | Low | AllTrails is trails-only. No multi-sport trip planner exists. |
| "surf and ski trip" / "multi-sport adventure travel" | 500-2K | Very low | Zero competition. Peakly is the only product that spans multiple outdoor sports + travel. |
| "when to surf [destination]" / "best month to ski [resort]" | 2K-10K per destination | Medium | Blog content opportunity. Each venue page could rank for "[venue] best time to visit." |

### Strategic recommendation

The highest-leverage SEO play is **programmatic venue pages**. Right now Peakly has 170+ venues but they all live behind JavaScript on a single URL. If each venue had a crawlable URL (e.g., `#venue-whistler` with proper hash routing + static fallbacks, or eventually `/venues/whistler`), each one becomes a landing page that can rank for "when to visit [destination]" and "cheap flights to [destination]" queries. This is how AllTrails built its 8M monthly organic traffic -- one page per trail.

---

## 5. Core Web Vitals Estimate

### Current stack analysis

| Metric | Estimated value | Rating | Root cause |
|--------|----------------|--------|-----------|
| **LCP** (Largest Contentful Paint) | ~3.5-5.0s | POOR | Babel Standalone (346KB gzipped) must download AND parse before any React content renders. The transpilation step adds 1-2s on mobile. |
| **FID** (First Input Delay) / **INP** | ~100-200ms | NEEDS IMPROVEMENT | Babel transpilation blocks the main thread. Once React hydrates, interactions are fine. |
| **CLS** (Cumulative Layout Shift) | ~0.02-0.05 | GOOD | Minimal layout shift since the SPA renders into a fixed container. Google Fonts load could cause a small FOIT shift. |

### Single biggest Core Web Vitals issue

**LCP is poor because of Babel Standalone.** The browser must:
1. Download `babel.min.js` (346KB gzipped, ~1.2MB uncompressed)
2. Download `app.jsx` (~180KB)
3. Babel parses and transpiles all 5,400+ lines of JSX
4. React renders the component tree

Steps 1-3 happen sequentially and block first paint entirely. On a 4G mobile connection, this adds 3-4 seconds of white screen.

### The fix (no build step required)

**Pre-transpile app.jsx to app.js and serve it directly.** This eliminates Babel Standalone from the production load:

```bash
# One-time setup (run locally or in a GitHub Action):
npx babel --presets=react app.jsx -o app.js

# Then in index.html, replace:
#   <script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
#   <script type="text/babel" src="./app.jsx?v=20260323b" data-presets="react"></script>
# With:
#   <script src="./app.js?v=20260324"></script>
```

**Impact:** Removes 346KB of Babel download + all transpilation time. Estimated LCP improvement: 1.5-2.5 seconds. FID drops to <50ms. This is the single highest-impact performance change possible without a full architecture rewrite.

**Note:** This introduces a "build step" (running one npx command before deploy). To keep the current zero-build workflow for development, keep both files: use `app.jsx` + Babel for local dev, serve `app.js` in production. The `push` alias could run the transpile automatically.

---

## Summary & Priority Actions

| Priority | Action | Effort | Impact | Status |
|----------|--------|--------|--------|--------|
| **P1** | Add JSON-LD structured data (paste-ready code above) | 5 min | High -- enables rich results, app panels, site search box in SERPs | Code ready |
| **P1** | Add static h1 fallback in index.html (paste-ready code above) | 2 min | Medium -- ensures crawlers without JS see content | Code ready |
| **P1** | Switch Plausible to `script.hash.js` | 1 min | High -- unlocks per-tab pageview tracking | Code ready |
| **P2** | Wire 5 Plausible custom events (paste-ready code above) | 20 min | High -- product analytics: venue popularity, flight conversion, retention signals | Code ready |
| **P2** | Pre-transpile app.jsx to eliminate Babel from production | 15 min | Very high -- cuts LCP by 1.5-2.5 seconds on mobile | Requires workflow change |
| **P3** | Create programmatic venue pages for long-tail SEO | Days | Very high long-term -- 170+ landing pages for organic search | Architecture decision needed |

### SEO Score Trajectory

| Date | Score | Key changes |
|------|-------|-------------|
| 2026-03-24 (v1) | 62% | Baseline audit |
| 2026-03-24 (v2) | 81% | Title, canonical, robots.txt, sitemap, Plausible |
| 2026-03-24 (v3) | 81% | No code shipped this cycle -- paste-ready fixes for remaining 2 fails |
| Target (v4) | **94%** | JSON-LD + static h1 = 15/16 passing. Only remaining gap: self-hosted OG image. |

### One SEO change with biggest Reddit-driven organic growth impact

**Add hash-based venue URLs that render static fallback content.** When someone shares a Peakly venue link on Reddit (e.g., `https://j1mmychu.github.io/peakly/#venue-whistler`), the link preview currently shows generic Peakly metadata. If the static h1 fallback included venue-specific content and OG tags were dynamically set per venue, every Reddit share becomes a targeted landing page. The JSON-LD `TouristAttraction` entries already point to these hash URLs -- making them work with meaningful previews closes the loop between structured data, social sharing, and organic discovery.

Short-term workaround: Since GitHub Pages can't do server-side rendering, add the top 10 venues as separate static HTML pages (e.g., `/venues/whistler.html`) that redirect to the SPA after loading. Each gets its own title, meta description, OG tags, and JSON-LD. This is how Notion, Figma, and other SPAs handle shareable link previews without SSR.
