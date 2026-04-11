# Peakly SEO & Analytics Report

**Date:** 2026-04-10
**Agent:** SEO & Analytics
**Current SEO score:** ~95% (stable). Prior runs: 90% (04-09), 92% (04-08), 95% (04-07), 91% (03-27), 81% (03-23).
**Context:** Day 6 of zero commits. ProductHunt 5 days out (April 15). Every item below is paste-ready.

---

## Executive Summary

Peakly's on-page SEO fundamentals are in place — title, canonical, meta description, OG/Twitter, robots.txt, sitemap, JSON-LD graph, Plausible on `script.hash.js`, static h1 fallback in `#root`. The single biggest organic-growth lever remaining is **not another meta tag** — it's **per-venue indexable landing pages**. GitHub Pages is a static host; hash-routed SPA venues aren't crawled as distinct URLs. A `/v/{slug}.html` static shell per venue would unlock thousands of long-tail queries and capture Reddit-referral traffic that currently hits the homepage and dies.

Two items from the agent brief are stale: `script.hash.js` upgrade is already shipped (line 32 of index.html), and a static h1 already renders pre-hydration (lines 337–339). This report re-prioritizes accordingly.

---

## 1. What's Already Shipped (Verified in index.html, 2026-04-10)

- `<title>` keyword-rich phrasing (line 23)
- `<link rel="canonical">` (line 24)
- Meta description, OG tags (title/description/image/url/site_name), Twitter summary_large_image
- JSON-LD `@graph` with WebSite, WebApplication, Organization (lines 35–64)
- robots.txt + sitemap.xml present in repo root
- Plausible **already on script.hash.js** (line 32) — agent brief is stale on this
- Static h1 fallback inside `#root` (line 337) — agent brief is stale on this too
- PWA manifest, theme-color, apple-touch-icon
- Preconnect to Google Fonts (lines 27–28)
- Sentry loader for error monitoring

---

## 2. Stale Content to Fix (5-minute change)

Venue count is now 3,726 but the page still advertises old numbers:

- **Line 11** — OG description says "180+ venues worldwide". Should read "3,700+ venues worldwide".
- **Line 340** — Static `<p>` says "170+ adventure destinations worldwide". Should read "3,700+ adventure destinations worldwide".
- **Line 54** — JSON-LD featureList says "180+ adventure venues". Should read "3,700+ adventure venues".

These are pre-render crawler-visible strings. Updating them takes five minutes and the count is already 20x the advertised number.

---

## 3. Expanded JSON-LD (Paste-Ready)

Current graph has WebSite + WebApplication + Organization. Missing: **SearchAction** on WebSite and **ItemList** for categories. Replace the existing JSON-LD block (lines 35–64) with this:

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
          "urlTemplate": "https://j1mmychu.github.io/peakly/?q={search_term_string}"
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
      "featureList": "Real-time condition scoring, Flight price tracking, 3700+ adventure venues, Vibe-based search, Trip planning, Condition alerts"
    },
    {
      "@type": "ItemList",
      "@id": "https://j1mmychu.github.io/peakly/#categories",
      "name": "Peakly Adventure Categories",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Surfing",   "url": "https://j1mmychu.github.io/peakly/#surfing"  },
        { "@type": "ListItem", "position": 2, "name": "Ski/Board", "url": "https://j1mmychu.github.io/peakly/#skiing"   },
        { "@type": "ListItem", "position": 3, "name": "Beach",     "url": "https://j1mmychu.github.io/peakly/#beach"    },
        { "@type": "ListItem", "position": 4, "name": "Climbing",  "url": "https://j1mmychu.github.io/peakly/#climbing" },
        { "@type": "ListItem", "position": 5, "name": "Hiking",    "url": "https://j1mmychu.github.io/peakly/#hiking"   },
        { "@type": "ListItem", "position": 6, "name": "Diving",    "url": "https://j1mmychu.github.io/peakly/#diving"   }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://j1mmychu.github.io/peakly/#org",
      "name": "Peakly",
      "url": "https://j1mmychu.github.io/peakly/",
      "slogan": "Know when to go"
    }
  ]
}
</script>
```

**Do not add `aggregateRating`** unless there's a real review mechanism — Google penalizes fabricated ratings.

**Do not embed 3,726 TouristAttraction objects** in this head block. TouristAttraction schema only helps when each venue has its own indexable URL. That's the job of Section 7.

---

## 4. Plausible Custom Events (Paste-Ready)

Current script tag (line 32) is already on `script.hash.js`:

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

For custom events + outbound links, upgrade to the combined variant:

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.outbound-links.tagged-events.js"></script>
<script>window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }</script>
```

### 5 event wire-ups in app.jsx

All five are one-liners wrapped in `window.plausible && ...` so they no-op if Plausible is blocked:

```js
// 1) Tab Switch — in BottomNav onClick handler
const handleTabClick = (tabName) => {
  setActiveTab(tabName);
  window.plausible && window.plausible('Tab Switch', { props: { tab: tabName } });
};

// 2) Venue Click — in ListingCard / CompactCard / FeaturedCard onClick
const handleVenueClick = (venue) => {
  setSelectedVenue(venue);
  window.plausible && window.plausible('Venue Click', {
    props: { venue: venue.name, category: venue.category }
  });
};

// 3) Flight Search — in VenueDetailSheet "Find Flights" button onClick
const handleFlightClick = (venue, origin) => {
  window.plausible && window.plausible('Flight Search', {
    props: { venue: venue.name, origin: origin || 'JFK' }
  });
  window.open(buildFlightUrl(origin, venue.airport, /* dates */), '_blank');
};

// 4) Wishlist Add — in heart button onClick
const handleHeartClick = (venue) => {
  toggleWishlist(venue.id);
  window.plausible && window.plausible('Wishlist Add', { props: { venue: venue.name } });
};

// 5) Onboarding Complete — in OnboardingSheet submit handler
const handleOnboardingSubmit = (profile) => {
  saveProfile(profile);
  window.plausible && window.plausible('Onboarding Complete', {
    props: { airport: profile.homeAirport || 'unknown' }
  });
};
```

**Plausible dashboard:** create goals named exactly "Tab Switch", "Venue Click", "Flight Search", "Wishlist Add", "Onboarding Complete". Verify the existing `flight_click` event (CLAUDE.md notes it live) is firing — if so, rename to the new capitalized name for consistency.

---

## 5. Static h1 — Already Live

Lines 337–339 of index.html already render a keyword-rich h1 inside `#root` before React hydrates. Crawlers see it. **This item in the agent brief is done.** The only fix is the stale venue count in the accompanying `<p>` (Section 2).

---

## 6. Competitor SEO Gap Analysis

Based on competitor positioning documented in CLAUDE.md and public knowledge at cutoff. Live SERP scraping is outside tool scope for this run.

| Query pattern | Who owns it | Peakly's angle |
|---|---|---|
| `"best surf spots [region]"` | Surfline, Magicseaweed, Stormrider | Surfline is forecast-dense, not trip-oriented. Peakly owns **"best surf spots with cheap flights from [US city]"** — pure long-tail, zero competition |
| `"ski conditions [resort]"` | OnTheSnow, OpenSnow, resort .coms | Conditions-only. Peakly owns **"when to ski [resort] on a budget"** + **"cheapest time to fly to [resort]"** |
| `"when to visit [destination]"` | TripAdvisor, Lonely Planet, travel blogs | Generic seasonality, no live data. Peakly owns **"when are conditions best at [venue]"** with dynamic answers |
| `"powder alerts [resort]"` | OpenSnow Pro ($99/yr) | Peakly owns **free multi-sport strike alerts** |
| `"[sport] window this week from [airport]"` | Nobody | This is the literal Window Score positioning — zero SERP competition |

### Keyword gaps Peakly can own (zero direct competition)

1. `cheap flights to [ski resort] this weekend`
2. `surf forecast + flights [destination]`
3. `when to go [destination] for [activity]` — matches the "Know when to go" tagline
4. `[sport] window this week from [home airport]`
5. `adventure calendar from [home airport]`

All five are multi-word, low-volume individually, but the long tail is large and the semantic intent lines up with what Peakly uniquely provides.

---

## 7. Core Web Vitals Estimate

| Metric | Estimate (mobile 4G) | Biggest contributor |
|---|---|---|
| **LCP** | 3.5–5.5s (poor) | Babel Standalone parses ~10.5K-line app.jsx **in the browser** before first meaningful paint |
| **FID / INP** | <100ms (good) | React interactions are light |
| **CLS** | ~0.05 (good) | Splash screen + fixed layout prevents shift |

**The single biggest Core Web Vitals issue is LCP. The cause is Babel Standalone. The fix is precompilation.**

### LCP fix, ranked by ROI

1. **Pre-compile JSX at build time via GitHub Actions.** Add a workflow step that runs `npx babel app.jsx -o app.js --presets=@babel/preset-react` on push and change the script tag to `<script src="./app.js?v=...">`. Removes Babel Standalone (~500KB parse) and eliminates in-browser JSX transform. Expected LCP improvement: **1.5–2.5s**. CLAUDE.md says "no build step" — but a single GH Action transpile doesn't touch Jack's dev workflow. `app.jsx` stays as source of truth. **This is the highest-ROI SEO change available to Peakly.**

2. **Lazy-load the VENUES array.** 3,726 entries with photos is ~1.5MB of JS blocking first paint. Move to `venues.json` fetched after mount, render a loading state for the list. Expected LCP improvement: **800ms–1.2s**.

3. **Self-host React + Babel** on GitHub Pages instead of unpkg. Unpkg has variable latency. Expected improvement: **200–300ms**.

4. **Preload critical CDN scripts** with `<link rel="preload" as="script">`. Marginal: **~150ms**.

---

## 8. The One Change with the Biggest Reddit-Launch Impact

**Static per-venue HTML shells at `/v/{slug}.html` — before ProductHunt April 15.**

When Peakly hits Reddit and ProductHunt, people will share specific venue links ("check out Teahupo'o on Peakly"). Those links currently go to a query-param or hash route that Google sees as the same homepage. **Zero organic capture** from the traffic spike. Every referred visitor who doesn't convert on arrival is lost for SEO.

### The fix

1. Write a one-shot script (`scripts/build-venue-pages.js`) that reads the VENUES array and generates 3,726 static HTML files under `/v/{venue-slug}.html`.
2. Each file is a minimal shell with:
   - `<title>` = `"{Venue} {Category} Conditions & Flights — Peakly"`
   - Meta description with venue location + best season
   - OG image pointing at the venue's Unsplash URL
   - **Per-venue TouristAttraction JSON-LD** (this is where that schema type belongs)
   - Same `<script src="/peakly/app.jsx?v=...">` that hydrates the full SPA
3. Add all 3,726 URLs to `sitemap.xml`.
4. Configure the SPA to deep-link into the venue detail sheet based on the URL path on mount.

**Template:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Teahupo'o Surf Conditions &amp; Flights from JFK — Peakly</title>
  <meta name="description" content="Live surf conditions, wave forecast, and flights to Teahupo'o, Tahiti. Know when to go with Peakly's real-time window score." />
  <link rel="canonical" href="https://j1mmychu.github.io/peakly/v/teahupoo.html" />
  <meta property="og:title" content="Teahupo'o — Conditions &amp; Flights | Peakly" />
  <meta property="og:image" content="{venue.photo}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": "Teahupo'o",
    "description": "Heavy reef break on Tahiti's south coast, home of WSL Championship Tour events.",
    "geo": { "@type": "GeoCoordinates", "latitude": -17.85, "longitude": -149.27 },
    "touristType": ["Surfing"],
    "isAccessibleForFree": true
  }
  </script>
</head>
<body>
  <h1>Teahupo'o — Live Conditions &amp; Flights</h1>
  <p>Heavy reef break on Tahiti's south coast. Best season: May–September. Flights from JFK from $850.</p>
  <script type="text/babel" src="/peakly/app.jsx?v=20260410" data-presets="react"></script>
</body>
</html>
```

**Effort:** 2–3 hours for one developer. **Impact:** converts every Reddit/PH venue-specific link into an indexable landing page and opens thousands of long-tail queries. **Timing:** ship before April 15.

---

## 9. Priority Action List

| # | Action | Effort | Owner | ROI |
|---|---|---|---|---|
| 1 | Bump stale venue counts (180+ → 3,700+) in lines 11, 54, 340 of index.html | 5 min | dev | Low but trivial |
| 2 | Expand JSON-LD with SearchAction + ItemList (Section 3) | 10 min | dev | Medium |
| 3 | Wire 5 Plausible events in app.jsx + create dashboard goals (Section 4) | 30 min | dev | Medium |
| 4 | **Static per-venue HTML shells for ProductHunt April 15** (Section 8) | 2–3 hrs | dev | **Highest** |
| 5 | GitHub Actions precompile Babel → app.js (Section 7) | 1 hr | dev | **Highest** |
| 6 | Bump cache buster (current `v=20260331a` is 10 days stale) | 30 sec | dev | Critical for any of the above to take effect |

---

## Bottom Line

On-page SEO is 95% done. The next 10x move is two things: **give every venue its own crawlable URL before Reddit traffic hits**, and **kill Babel Standalone so LCP drops below 2.5s**. Everything else in this report is polish. But the six-day code freeze means none of these ship until Jack or Claude Code picks them up — Section 8 is the one to prioritize if only one lands before April 15.
