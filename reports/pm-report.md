# PM Report: 2026-03-23 (v3)

## Status: YELLOW

## Live Site Health: working

Site loads, cards render with real photos, scoring works, navigation functional. Flight pricing falls back to estimates correctly (mixed content handled gracefully). No critical runtime errors. Yellow because Trips tab is still hidden from nav and we have zero analytics -- flying blind on usage.

---

## Shipped Today

- **109 venue photos** -- real Unsplash images on all venue cards with lazy loading and gradient fallback
- **All 4 card components updated** -- ListingCard, FeaturedCard, CompactCard, VenueDetailSheet all render `listing.photo` with `<img loading="lazy">`
- **Duplicate pipeline ID fixed**
- **Amazon affiliate tags added** -- real IDs replacing placeholders
- **OG image fixed** -- uses Unsplash URL for social sharing previews

Previously shipped (still live):
- Tanning category added with 20+ venues
- Share URLs fixed (j1mmychu.github.io/peakly)
- Mixed content timeout + "est." fallback labels on flight prices
- City names in search bar (not airport codes)
- Category pills corrected (All, Skiing, Surfing, Beach & Tan default)
- Hero CTA + auto-refresh weather

---

## Spec Progress

| Phase | Description | Status | % Done |
|-------|-------------|--------|--------|
| **Phase 1** | Critical Bugs & Polish | **Complete** | **100%** |
| **Phase 2** | UX Improvements | In progress | **35%** |
| **Phase 3** | Performance & Reliability | In progress | **25%** |
| **Phase 4** | Content & Engagement | Not started | **0%** |

### Phase 1 breakdown (100%)
- 1.1 Mixed content fallback: DONE (3s timeout + "est." labels on fallback prices)
- 1.2 Card data/badge clipping: DONE (cards audited during photo update)
- 1.3 Venue count fix: DONE
- 1.4 Default category pills: DONE (All, Skiing, Surfing, Beach & Tan)
- 1.5 Search bar city names: DONE

### Phase 2 breakdown (35%)
- 2.1 Venue photos: **DONE** (109 venues with Unsplash photos, all 4 card types updated)
- 2.2 "Best Right Now" carousel improvements: NOT DONE
- 2.3 Venue Detail Sheet polish (Airbnb-style): NOT DONE
- 2.4 Alerts tab improvements: NOT DONE
- 2.5 Profile tab improvements: NOT DONE
- 2.6 Haptic feedback everywhere: NOT DONE

### Phase 3 breakdown (25%)
- 3.1 Lazy load weather: NOT DONE
- 3.2 Image lazy loading: **DONE** (loading="lazy" on all img tags)
- 3.3 Error handling audit: PARTIAL (flight fallback works, weather error handling incomplete)
- 3.4 Restore Trips tab in BottomNav: **NOT DONE** (TripsTab exists but nav shows only 3 tabs)

### Phase 4 breakdown (0%)
- 4.1-4.4 all pending

---

## Bugs & Issues (Current)

| Priority | Issue | Impact |
|----------|-------|--------|
| P1 | **Trips tab hidden** -- BottomNav has 3 tabs (Explore, Alerts, Profile). TripsTab + WishlistsTab fully built but unreachable. | Two major features invisible to users |
| P1 | **No analytics** -- Zero traffic/usage data | Can't measure anything, blocks all growth work |
| P2 | **No PWA manifest** -- Can't install to home screen | Blocks mobile distribution |
| P2 | **HTTPS not on VPS** -- Mixed content = no live flight prices | All prices show as estimates |
| P3 | **Sentry DSN empty** -- No production error monitoring | Blind to crashes |
| P3 | **Peakly Pro mockup** -- $79/year button does nothing | No revenue path |

---

## Top 3 Priorities (Ship Next)

### 1. Restore Trips tab in BottomNav (30 min)
TripsTab and WishlistsTab are fully built but users can't reach them. Add Trips to the BottomNav tabs array (4 tabs: Explore, Trips, Alerts, Profile). Wishlists accessible within Explore. This is literally adding one object to an array -- unlocks two entire features.

### 2. Add Plausible analytics (30 min)
One `<script>` tag in index.html. Free tier. Without analytics we cannot validate any growth experiment, measure retention, or know if the app is being used. This blocks every growth initiative. Must ship before any marketing push.

### 3. Venue Detail Sheet polish -- Phase 2.3 (2-3 hrs)
The conversion point where users decide to book. Full-width photo hero, sticky "Book Flights" CTA, 7-day weather inline, condition score breakdown, similar venues. Photos are already there -- the detail view needs to match the quality of the cards.

---

## Decision Made

**Ship Trips tab + analytics before any more feature work.** We have two fully-built features users can't access and zero data on usage. Both are 30-minute fixes. No point building more things nobody can find or we can't measure. Phase 2.3 (detail sheet) is the first real feature work after these two ship.

---

## Blockers for Jack

1. **Plausible analytics** -- Jack needs to sign up at plausible.io (free tier, no cookie banner needed) and share the script tag or site ID. Or approve self-hosted alternative. 30-second signup.
2. **VPS HTTPS** -- Flight proxy at 104.131.82.242:3001 needs HTTPS (domain + Let's Encrypt + nginx, or Cloudflare). Until then, all flight prices are estimates. DevOps task, not code.
