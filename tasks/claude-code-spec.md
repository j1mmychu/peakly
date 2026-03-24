# Peakly Improvement Spec — For Claude Code

You are Jarvis, building Peakly to be a 100K+ download adventure travel app. This spec was written by your Cowork counterpart after a full code audit and visual review of the live site. Execute these in order. Each task is self-contained. Do NOT skip verification — open index.html in a browser or run a local server after each major change and confirm it works.

**Ground rule:** Every change must be production-quality. No hacky fixes. No placeholder text. No "TODO" comments. Write code like a staff engineer shipping to 100K users.

---

## Phase 1: Critical Bugs & Polish (Do First)

### 1.1 — Fix mixed content (BLOCKING)
The flight proxy runs on http://104.131.82.242:3001 but the site is served from https://j1mmychu.github.io. Browsers block mixed HTTP/HTTPS requests. Flight pricing is silently failing for most users.

**Fix:** In app.jsx, make sure fetchTravelpayoutsPrice gracefully falls back to BASE_PRICES when the proxy fails. Add a timeout of 3 seconds. Show "est." next to fallback prices so users know it's an estimate. The real fix is HTTPS on the VPS (domain + Nginx + Let's Encrypt) — but the app must not break in the meantime.

### 1.2 — Fix cards missing data
Some compact cards in the "All experiences" grid show GO badges but are missing condition score text, or show green borders with clipped badges. Audit CompactCard, ListingCard, and FeaturedCard — make sure GO/MAYBE/WAIT badges never clip, condition scores always show, prices always show, no text truncation cuts off important info.

### 1.3 — Fix venue count ("176 windows available")
The VENUES array has ~80 entries but the count shows 176. Audit the gridListings computation in ExploreTab. The count must reflect unique visible venues, not duplicated entries.

### 1.4 — Fix default category pills
Default visible pills should be: All, Skiing, Surfing, Beach & Tan. Hiking goes behind "+ More". Check the visibleCats logic in ExploreTab.

### 1.5 — Fix search bar text
"Anywhere · Any time · JFK" — show city names not airport codes. Create a lookup: JFK→"New York", LAX→"Los Angeles", SFO→"San Francisco", ORD→"Chicago", MIA→"Miami", etc. Display as "Anywhere · Any time · from New York".

---

## Phase 2: UX Improvements (High Impact)

### 2.1 — Add real venue photos via Unsplash
Add a `photo` field to the top 30 VENUES entries using Unsplash source URLs (no API key needed):
photo: "https://images.unsplash.com/photo-XXXXX?w=400&h=300&fit=crop"

Update all card variants to show the photo as background with gradient overlay for text legibility. Fall back to existing gradient for venues without photos.

### 2.2 — Improve "Best Right Now" carousel
Add a "See all" link that filters to GO-only venues. Show the venue's key weather stat on each card (e.g., "Fresh 8in snow" for skiing, "6ft swell" for surfing). Add subtle visual differentiation from the main grid.

### 2.3 — Venue Detail Sheet polish
Make it feel like an Airbnb listing page:
- Full-width photo at top with gradient overlay
- Prominent GO/MAYBE/WAIT badge
- Sticky "Book Flights" CTA at bottom
- 7-day mini weather forecast (data already fetched)
- Condition score breakdown (what's contributing)
- "Similar venues" section at bottom (same category, similar score)
- More prominent share button

### 2.4 — Improve Alerts tab
- Add preset templates: "Powder Alert", "Perfect Surf", "Beach Week", "Cheap Flights"
- Show firing alerts at top with actual venue cards, not just counts
- When an alert fires, show matching venues inline with "Book Now" CTA

### 2.5 — Profile tab improvements
- Show user stats: venues explored, trips planned, alerts active
- "Your top categories" based on wishlist behavior
- Clean settings section for editing name/airport/sports
- "Share Peakly" button
- App version at bottom

### 2.6 — Add haptic feedback everywhere
The haptic() helper exists but is underused. Add it to: every tab switch, every card tap, every wishlist toggle, every alert action, search sheet open/close, every button press.

---

## Phase 3: Performance & Reliability

### 3.1 — Lazy load weather data
Fetch weather for top 20 venues on initial load. Lazy-fetch the rest as user scrolls. Cache in localStorage with 10-minute TTL. Show skeleton cards for loading venues.

### 3.2 — Image lazy loading
Use loading="lazy" on img tags. Show gradient as placeholder while image loads. Fade in on load with CSS transition.

### 3.3 — Error handling audit
Every fetch() call needs: 5s timeout for weather, 3s for flights. Network errors show user-friendly message. Failed weather = "conditions unavailable" not score 0. Failed flights = BASE_PRICES with "est." label. Add "Retry" button on total failure.

### 3.4 — Restore Trips tab in bottom nav
Nav was reduced to 3 tabs but TripsTab still exists. Restore 4-tab layout: Explore | Trips | Alerts | Profile. Keep wishlists in Explore (already partially there with saved button).

---

## Phase 4: Content & Engagement

### 4.1 — Venue data quality pass
Ensure every venue has: 2-3 genuine tags, realistic rating/reviews, correct airport code, accurate coordinates. Spot-check top 20.

### 4.2 — Add seasonal intelligence
Add bestMonths field to each venue (e.g., bestMonths: [12,1,2,3] for ski resorts). Show "Peak season"/"Off season" badges. Boost condition score during best months. Show "Best time to visit" in detail sheet.

### 4.3 — Add "Trending" section
Track taps/wishlists in localStorage. Show "Trending on Peakly" carousel on Explore tab. Seed with reasonable defaults.

### 4.4 — Onboarding improvements
Ask fewer questions (name, home airport, top 2 sports). Auto-show on first visit. Add skip option with sensible defaults. Personalized welcome message.

---

## Verification Checklist (After Each Phase)
- [ ] No console errors
- [ ] Babel compiles without parse errors
- [ ] All tabs load and display content
- [ ] Hero card shows real data (not undefined/NaN)
- [ ] Venue cards open detail sheet
- [ ] Wishlist toggle works
- [ ] Search sheet opens/closes
- [ ] Category pills filter correctly
- [ ] Bottom nav works
- [ ] Works on mobile viewport (375px width)

## Do NOT Do
- Do NOT split app.jsx into multiple files
- Do NOT add a build step or bundler
- Do NOT use ES module imports
- Do NOT expose the Travelpayouts API token in client code
- Do NOT remove or rename existing localStorage keys
- Do NOT add npm dependencies to the web app
