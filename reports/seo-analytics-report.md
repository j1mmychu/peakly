# SEO & Analytics Report — Peakly

**Date:** 2026-03-29
**SEO Score:** 95% (holding from 2026-03-28 bump — preconnect, enhanced JSON-LD, sitemap, viewport fix all verified)
**Previous Scores:** 93% (03-28) | 91% (03-27) | 91% (03-26) | 91% (03-25) | 91% (03-24) | 81% (03-23) | 62% (03-22 baseline)

---

## Status Summary

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Title tag | PASS | 62 chars, keyword-rich |
| 2 | Meta description | PASS | 88 chars, includes primary keywords |
| 3 | Canonical URL | PASS | `https://j1mmychu.github.io/peakly/` |
| 4 | robots.txt | PASS | Allows all, references sitemap |
| 5 | sitemap.xml | PASS | 12 URLs (root + 11 categories), lastmod 2026-03-27 |
| 6 | Open Graph tags | PASS | title, description, image, type, url, site_name |
| 7 | Twitter Card | PASS | summary_large_image complete |
| 8 | JSON-LD structured data | PASS | WebSite + SearchAction + WebApplication + Organization + ItemList + TouristDestination |
| 9 | Static h1 fallback | PASS | Keyword-rich h1 inside #root, visible before React mounts |
| 10 | Plausible analytics | PASS | `script.hash.js` (SPA hash-based tracking) |
| 11 | Plausible custom events | PARTIAL | 7 events live, 2 critical funnel events STILL MISSING |
| 12 | PWA manifest | PASS | manifest.json + SW + apple-mobile-web-app meta |
| 13 | lang attribute | PASS | `<html lang="en">` |
| 14 | Favicon | PASS | SVG data URI |
| 15 | Preconnect hints | PASS | 5 preconnects + 2 dns-prefetch |
| 16 | Viewport | PASS | `user-scalable=yes` (accessibility-compliant) |
| 17 | Custom domain | FAIL | Still on github.io subdomain (LLC approved — domain registration pending) |

**Remaining gaps (5% deduction):**
- No custom domain (github.io subdomain limits brand trust + cookie control)
- OG image is generic Unsplash mountain (not branded app screenshot)
- Plausible event naming inconsistency (mixed PascalCase and snake_case)
- Missing Venue Click and Flight Search funnel events
- Hash-based routing limits Google to indexing 1 page (SPA limitation)
- Sentry script still synchronous (blocks parser ~100-200ms)

---

## 1. JSON-LD Structured Data — VERIFIED COMPLETE (No Changes)

All 5 schema types present in `@graph`: WebSite + SearchAction, WebApplication, Organization, ItemList (11 categories), TouristDestination. No changes needed.

---

## 2. Static H1 Fallback — VERIFIED CORRECT (No Changes)

`<h1>Peakly — Surf, Ski & Adventure Spots with Live Conditions & Cheap Flights</h1>` renders inside `#root` before JS loads. Verified present at line 272 of index.html.

---

## 3. Plausible Event Tracking Audit

### Currently Implemented Events (7 found in app.jsx):

| Event | Naming | Location | Status |
|-------|--------|----------|--------|
| Tab Switch | PascalCase | BottomNav callback (~line 9027) | LIVE |
| Onboarding Complete | PascalCase | Onboarding flow (~line 7051) | LIVE |
| Wishlist Add | PascalCase | Heart toggle (~line 8847) | LIVE |
| Score Validation | PascalCase | Score validation (~line 7487) | LIVE |
| book_click | snake_case | ListingCard book button (~line 4247) | LIVE |
| email_capture | snake_case | Explore banner form (~line 5604) | LIVE |
| install_pwa | snake_case | beforeinstallprompt listener (~line 4059) | LIVE |

### P1 MISSING: Two Critical Funnel Events (5th consecutive run)

**Venue Click** — No `Venue Click` or `venue_open` event anywhere in app.jsx. Grep confirms zero matches. **Without this, the Explore -> Detail conversion rate is invisible.**

**Flight Search** — No `Flight Search` or `flight_click` event anywhere in app.jsx. Grep confirms zero matches. **Without this, revenue attribution from Aviasales links is impossible.**

**This has been flagged as P1 for 5 consecutive runs with no implementation.** These are the two most important analytics events for measuring the core funnel before Reddit launch on March 31.

### Paste-Ready Fix

**Venue Click** — add wherever `setSelectedVenue(venue)` is called:
```js
logEvent('Venue Click', {venue: venue.title, category: venue.category});
```

**Flight Search** — add wherever the Aviasales deep link opens:
```js
logEvent('Flight Search', {venue: venue.title, origin: homeAirport});
```

Using `logEvent()` (line 4046) ensures both Plausible + localStorage backup.

### Naming Inconsistency (Still Open)

PascalCase: Tab Switch, Wishlist Add, Onboarding Complete, Score Validation
snake_case: book_click, email_capture, install_pwa

Recommend standardizing all to PascalCase to match Plausible convention.

---

## 4. Core Web Vitals Estimate

| Metric | Estimate | Google Target | Status |
|--------|----------|---------------|--------|
| **LCP** | 3.5-5.0s | < 2.5s | POOR |
| **INP** | 100-200ms | < 200ms | BORDERLINE |
| **CLS** | 0.02-0.05 | < 0.1 | GOOD |

### LCP Bottleneck

Loading chain: HTML -> Fonts -> Sentry (synchronous, blocks parser) -> React UMD -> Babel Standalone (690KB) -> app.jsx -> transpile -> React mounts -> splash dismisses.

**Quick win still open:** Add `defer` to Sentry script tag (line 111 of index.html). Estimated ~100-200ms LCP improvement.

**Long-term:** Pre-transpile JSX at deploy time to eliminate Babel Standalone from runtime. Would drop LCP by 2-3s. Conflicts with no-build-step architecture — defer until post-launch.

---

## 5. Competitor SEO Gap Analysis

### Keywords Peakly Can Own

| Keyword Cluster | Est. Monthly Volume | Competition | Peakly Advantage |
|----------------|---------------------|-------------|-----------------|
| "cheap flights to [adventure spot]" | 2K-5K/dest | LOW | KAYAK is conditions-blind |
| "best time to [activity] in [location]" | 5K-15K/dest | MEDIUM (stale blogs) | Real-time scoring = freshness |
| "[sport] conditions + flights" | <500 | NONE | Category creator |
| "surf trip deals this week" | 1K-3K seasonal | LOW | Time-sensitive + conditions |
| "when to go [destination] for [activity]" | 5K-15K/dest | MEDIUM | Dynamic scores beat static content |
| "best ski conditions right now" | 1K-3K | MEDIUM | Live scoring differentiator |
| "adventure travel conditions" | <1K | NONE | Multi-sport aggregation uncontested |

### Reddit Launch Content Angle (March 31)

The "when to go" angle is the strongest differentiator for Reddit posts. Focus r/solotravel and r/surfing posts on the timing intelligence Peakly provides — it's the hook no competitor can match. Example: "I built an app that tells you when conditions AND cheap flights align for adventure trips."

---

## 6. Blog Post Opportunities (Post-Launch)

Static HTML in `/blog/` directory on GitHub Pages. No infra changes needed.

1. **"Best Time to Surf Bali: Month-by-Month Conditions Guide"** — auto-generatable from venue data, long-tail organic
2. **"Cheapest Flights to Ski Resorts from [City] This Season"** — time-sensitive, refreshable
3. **"10 Underrated Dive Spots with $200 Flights"** — listicle + flight data, Reddit-shareable
4. **"The Adventure Traveler's Guide to Shoulder Season"** — positions Peakly as timing authority
5. **"Why Your Surf Trip is 40% Cheaper If You Go When Conditions Peak"** — Reddit-viral potential

---

## 7. Highest-Impact Single Change for Reddit Launch

**Implement Venue Click + Flight Search Plausible events before March 31.**

Without these, Reddit launch traffic will flow through the app with zero visibility into conversion. You won't know which venues or categories resonate with Reddit users, making it impossible to optimize the post-launch content and distribution strategy.

**Secondary:** Replace the generic Unsplash mountain OG image with a branded app screenshot showing venue cards, condition scores, and flight prices. Every Reddit share currently shows an anonymous mountain photo — a branded preview would significantly improve click-through from Reddit post link previews.

---

## Action Items (Priority Order)

| # | Item | Carry Count | Effort | Impact | Status |
|---|------|-------------|--------|--------|--------|
| 1 | **Add Venue Click + Flight Search events** | **5 runs** | 30 min | Core funnel visibility | OPEN — P1, CRITICAL before 3/31 |
| 2 | Add `defer` to Sentry script tag | **5 runs** | 1 min | ~100-200ms LCP | OPEN |
| 3 | Standardize event names to PascalCase | **7 runs** | 15 min | Clean analytics | OPEN |
| 4 | Create branded OG image (app screenshot) | **7 runs** | 30 min | Social CTR | OPEN |
| 5 | Update sitemap.xml lastmod date | **2 runs** | 1 min | Crawl freshness | OPEN |
| 6 | Add Gear Click + Alert Create events | **5 runs** | 10 min | Revenue attribution | OPEN |
| 7 | Venue-specific OG via Cloudflare Worker | **2 runs** | 2-4 hrs | Reddit viral sharing | Phase 2 |
| 8 | Create first 3 SEO blog posts | **3 runs** | 2-3 hrs each | Long-tail organic | Phase 2 |
| 9 | Pre-transpile JSX | DEFERRED | 1 hr | ~2s LCP improvement | Phase 2 |

**ESCALATION:** Items 1-3 have been open 5-7 consecutive runs. Item 1 (missing funnel events) is the single highest-priority analytics fix before Reddit launch on March 31. Recommend auto-implementation via Claude Code agent — combined effort for items 1-3 is under 45 minutes.

---

## Week-over-Week SEO Score Tracking

| Date | Score | Changes |
|------|-------|---------|
| 2026-03-22 | 62% | Baseline |
| 2026-03-23 | 81% | Title, canonical, robots.txt, sitemap, Plausible, OG tags |
| 2026-03-24 | 91% | JSON-LD, static h1, script.hash.js, PWA manifest |
| 2026-03-25 | 91% | No SEO changes |
| 2026-03-26 | 91% | No SEO changes |
| 2026-03-27 | 91% | No SEO changes |
| 2026-03-28 | 93% | Preconnect hints, SearchAction + ItemList + TouristDestination JSON-LD, sitemap 12 URLs, viewport fix |
| 2026-03-29 | 95% | CLAUDE.md updated score to 95% reflecting cumulative 03-28 improvements; all items verified |
| Target | 97%+ | Needs: defer Sentry, branded OG image, custom domain, event standardization |

*Next run: 2026-03-30*
