# PM Report: 2026-03-23 (v5)

## Status: YELLOW

Site is live, stable, and rendering correctly. Photos on cards, scoring functional, flight pricing falling back to estimates with "est." labels. Yellow because: (1) BottomNav intentionally reduced to 3 tabs per Jack's request -- Trips/Wishlists features are built but unreachable, (2) zero analytics means we're flying blind on usage, (3) no HTTPS on VPS so all flight prices are estimates.

---

## Shipped Today

- **GoVerdictBadge borders removed** -- GO/MAYBE/WAIT badges no longer have colored outlines, cleaner visual
- **Best Right Now card borders neutralized** -- removed score-colored borders from carousel cards for consistency
- **Cache-busting on index.html** -- `app.jsx?v=20260323b` ensures users get latest code on deploy
- **Fixed 19 venue entries with missing commas** -- Babel crash bug resolved (089dfc6)
- **Added .nojekyll file** -- fixes GitHub Pages deployment for files starting with underscores

Previously shipped (still live):
- 109 venue photos via Unsplash with lazy loading and gradient fallback
- All 4 card components rendering photos (ListingCard, FeaturedCard, CompactCard, VenueDetailSheet)
- Mixed content timeout + "est." fallback labels on flight prices
- City names in search bar (not airport codes)
- Category pills corrected (All, Skiing, Surfing, Beach & Tan default)
- Hero CTA + auto-refresh weather
- Amazon affiliate tags on gear links
- OG image for social sharing
- Tanning category with 20+ venues

---

## Spec Progress

| Phase | Description | Status | % Done |
|-------|-------------|--------|--------|
| **Phase 1** | Critical Bugs & Polish | **Complete** | **100%** |
| **Phase 2** | UX Improvements | In progress | **35%** |
| **Phase 3** | Performance & Reliability | In progress | **25%** |
| **Phase 4** | Content & Engagement | Not started | **0%** |

### Phase 1 (100% -- DONE)
- 1.1 Mixed content fallback: DONE
- 1.2 Card data/badge clipping: DONE
- 1.3 Venue count fix: DONE
- 1.4 Default category pills: DONE
- 1.5 Search bar city names: DONE

### Phase 2 (35%)
- 2.1 Venue photos: **DONE** (109 venues, all card types)
- 2.2 "Best Right Now" carousel improvements: PARTIAL (section always shows, photos added, but no "See all" link or key weather stat on cards)
- 2.3 Venue Detail Sheet polish (Airbnb-style): NOT DONE
- 2.4 Alerts tab improvements: NOT DONE
- 2.5 Profile tab improvements: NOT DONE
- 2.6 Haptic feedback everywhere: NOT DONE

### Phase 3 (25%)
- 3.1 Lazy load weather: NOT DONE
- 3.2 Image lazy loading: **DONE**
- 3.3 Error handling audit: PARTIAL (flight fallback works, weather errors incomplete)
- 3.4 Restore Trips tab in BottomNav: **CANCELED** -- Jack wants 3 tabs only (Explore, Alerts, Profile)

### Phase 4 (0%)
- 4.1-4.4 all pending

---

## Top 3 Priorities

### 1. Venue Detail Sheet polish -- Phase 2.3 (2-3 hrs)
This is the conversion point. When a user taps a card, the detail sheet needs to sell the trip. Full-width photo hero, sticky "Book Flights" CTA, 7-day weather inline, condition score breakdown, similar venues section. Photos are already in the data -- the detail view needs to match card quality. Highest impact on engagement and affiliate clicks.

### 2. Add Plausible analytics (30 min)
One `<script>` tag in index.html. Without analytics we cannot validate any experiment, measure retention, or know if anyone uses the app. Blocks every growth decision. Must ship before any marketing push.

### 3. Alerts tab improvements -- Phase 2.4 (1-2 hrs)
With only 3 tabs, Alerts is prime real estate. Current state is bare. Add preset templates (Powder Alert, Perfect Surf, Beach Week), show firing alerts with actual venue cards and "Book Now" CTA. Makes the tab worth visiting daily -- drives retention.

---

## Decision Made

**3-tab nav is final.** Jack confirmed Explore, Alerts, Profile. Trips/Wishlists remain accessible from within Explore (saved button, trip builder). Phase 2.3 (detail sheet) is the top priority -- it's the highest-leverage conversion surface. Spec item 3.4 (restore Trips tab) is canceled per Jack's direction.

---

## Blockers

| # | Blocker | Owner | Impact |
|---|---------|-------|--------|
| 1 | **Plausible analytics signup** -- need Jack to create account at plausible.io (free tier, no cookie banner) and share script tag or site ID | Jack | Blocks all growth measurement |
| 2 | **VPS HTTPS** -- flight proxy at 104.131.82.242:3001 needs domain + Let's Encrypt + nginx. All flight prices show "est." until this is resolved | Jack/DevOps | All prices are estimates, hurts conversion |
| 3 | **Sentry DSN** -- `SENTRY_DSN = ""` on line 6 of app.jsx. Need Jack to sign up at sentry.io and paste DSN | Jack | Blind to production crashes |
