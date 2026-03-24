# Peakly — Task Backlog

> Prioritized list of improvements. Each session should pick the next unchecked item.

## High Priority

- [ ] Add hotel affiliate links (Booking.com deep links per venue)
- [ ] Expand venue data — add 50+ new venues across underrepresented regions (South America, Africa, Southeast Asia)
- [ ] Add trip insurance CTA (World Nomads affiliate)
- [ ] Replace `AFFILIATE_ID` placeholders with real affiliate IDs (REI, Backcountry) — see line ~3786
- [ ] Add Sentry DSN for error monitoring — see line 6
- [ ] Improve scoring algorithm — add tide data for surf spots, avalanche risk for ski

## Medium Priority

- [ ] Add offline support — service worker for cached venue browsing
- [ ] Improve search — fuzzy matching, recent searches, search history
- [ ] Add venue photos/thumbnails (use free image CDN or placeholder service)
- [ ] Add "nearby venues" feature using geolocation
- [ ] Improve alert system — better notification UX, alert grouping
- [ ] Add sharing — generate shareable links for trips/wishlists
- [ ] Dark mode toggle in Profile settings

## Low Priority / Polish

- [ ] Accessibility audit — ARIA labels, keyboard navigation, screen reader support
- [ ] Performance optimization — lazy render offscreen tabs, virtualize long venue lists
- [ ] Add loading skeletons instead of spinners
- [ ] Micro-animations for state transitions (wishlist add/remove, tab switch)
- [ ] Add onboarding tooltips for first-time users
- [ ] Refactor CSS — consolidate inline styles into injected stylesheet

## Data Expansion

- [ ] Add 4 new airports to AIRPORTS array (LAS, PHX, MSP, DTW) with full metadata
- [ ] Expand LOCAL_TIPS for all 235+ venues
- [ ] Add seasonal ratings per venue (best month indicators)
- [ ] Add gear recommendations per venue category
- [ ] Expand PACKING lists per activity type

## Completed

- [x] Add LAS, PHX, MSP, DTW to BASE_PRICES for all destinations
