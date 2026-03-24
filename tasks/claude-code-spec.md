# Peakly Improvement Spec — For Claude Code

You are Jarvis, building Peakly to be a 100K+ download adventure travel app. This spec was written by your Cowork counterpart after a full code audit and visual review of the live site. Execute these in order. Each task is self-contained. Do NOT skip verification — open index.html in a browser or run a local server after each major change and confirm it works.

**Ground rule:** Every change must be production-quality. No hacky fixes. No placeholder text. No "TODO" comments. Write code like a staff engineer shipping to 100K users.

---

## Phase 1: Critical Bugs & Polish (Do First)

### 1.1 — Fix mixed content (BLOCKING)

The flight proxy runs on `http://104.131.82.242:3001` but the site is served from `https://j1mmychu.github.io`. Browsers block mixed HTTP/HTTPS requests. This means **flight pricing is silently failing for most users**.

**Fix:** Set up HTTPS on the VPS. Until then, as an interim fix, add graceful fallback so the app doesn't break:

```javascript
const FLIGHT_PROXY = "https://104.131.82.242:3001"; // Switch to HTTPS when SSL is ready
// In fetchTravelpayoutsPrice, the existing catch block already returns null,
// which triggers BASE_PRICES fallback — verify this works.
```

The real fix is: get a domain (peakly.app or similar), point it at the VPS, set up Nginx + Let's Encrypt. Update FLIGHT_PROXY to `https://api.peakly.app`. This is the highest priority infrastructure task.

### 1.2 — Fix cards missing GO badges on some venues

Some compact cards in the "All experiences" grid show a GO badge but no condition score text. Others show a green border but the badge is cut off. Audit every card variant (CompactCard, ListingCard, FeaturedCard) and make sure:
- GO/MAYBE/WAIT badge is always fully visible (not clipped by overflow:hidden)
- Condition score number is always shown
- Price is always shown
- No text truncation cuts off important info

### 1.3 — Fix "All experiences" count showing "176 windows available"

The number 176 seems inflated — the VENUES array has ~80 entries but some might be duplicated by the scoring/filtering logic. Audit the `gridListings` computation in ExploreTab and make sure the count accurately reflects unique venues shown.

### 1.4 — Category pills: "Hiking" shouldn't be in default visible set

The default pills show All, Skiing, Surfing, Hiking. Hiking was added by a previous Claude Code session. The original default set was All, Skiing, Surfing, Beach & Tan. Fix the default visible categories to include the most popular/appealing ones: All, Skiing, Surfing, Beach & Tan. Hiking should appear after tapping "+ More".

### 1.5 — Search bar says "Anywhere · Any time · JFK"

The "JFK" home airport should read as a real city name, not an airport code. Map common airport codes to city names: JFK → "New York", LAX → "Los Angeles", SFO → "San Francisco", ORD → "Chicago", etc. Show "Anywhere · Any time · from New York" or similar.

---

## Phase 2: UX Improvements (High Impact)

### 2.1 — Add real venue images via Unsplash

The gradient cards look decent but can't compete with real photos. For each venue, add a `photo` field to the VENUES array using Unsplash source URLs:

```javascript
photo: "https://images.unsplash.com/photo-XXXXX?w=400&h=300&fit=crop"
```

Use Unsplash's free hotlinking (no API key needed for source URLs). Find relevant photos for at least the top 20 venues (the ones most likely to appear in hero card and "Best Right Now"). Fall back to the existing gradient for venues without photos.

Update ListingCard, CompactCard, FeaturedCard, and the hero card to show the photo as a background image with the gradient as a fallback:

```javascript
background: venue.photo
  ? `linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7)), url(${venue.photo})`
  : venue.gradient,
backgroundSize: "cover",
backgroundPosition: "center",
```

### 2.2 — Improve the "Best Right Now" carousel

Currently shows cards with gradient backgrounds only. With photos added, this becomes much more compelling. Also:
- Add a "See all" link that filters the main grid to only show GO venues
- Add a subtle auto-scroll hint (slight peek animation on first load)
- Show the venue's key weather stat (e.g., "Fresh 8in snow" for skiing, "6ft swell" for surfing)

### 2.3 — Venue Detail Sheet improvements

When you tap a venue card, the detail sheet should feel like an Airbnb listing page:
- Full-width photo at top (if available) with gradient overlay for text legibility
- Prominent GO/MAYBE/WAIT badge
- "Book Flights" button should be the primary CTA (sticky at bottom)
- Weather section: show a 7-day mini forecast (the data is already fetched from Open-Meteo)
- Show the condition score breakdown (what's contributing to the score)
- "Similar venues" section at bottom (same category, similar score)
- Share button should be more prominent

### 2.4 — Improve the Alerts tab

The alerts creation flow is functional but not intuitive. Improve it:
- Add preset alert templates: "Powder Alert", "Perfect Surf", "Beach Week", "Cheap Flights"
- Show currently firing alerts at the top with the actual venue cards (not just a count)
- Add a "smart alert" option: "Tell me when ANY venue hits 90+ conditions under $400"
- When an alert is firing, show the matching venues inline with a "Book Now" CTA

### 2.5 — Profile tab needs work

The profile tab should feel useful, not just a settings dump:
- Show user stats: "12 venues explored, 3 trips planned, 2 alerts active"
- Show a "Your top categories" breakdown based on wishlist/viewing behavior
- Move the onboarding edit (change name, airport, sports) into a clean settings section
- Add a "Share Peakly" button that generates a referral link (even if it's just the site URL for now)
- Add app version number at the bottom

### 2.6 — Add haptic feedback throughout

The `haptic()` helper exists but is only used in a few places. Add it to:
- Every tab switch
- Every card tap
- Every wishlist toggle
- Every alert creation/deletion
- Search sheet open/close
- Every button press

---

## Phase 3: Performance & Reliability

### 3.1 — Lazy load venue weather data

Currently ALL venues fetch weather on app load (~80+ API calls). This is slow and wasteful. Instead:
- Fetch weather only for the top 20 "featured" venues on initial load
- Lazy-fetch remaining venues as the user scrolls them into view
- Cache weather data in localStorage with a 10-minute TTL
- Show skeleton cards for venues still loading

### 3.2 — Image lazy loading

When photos are added (2.1), they need lazy loading:
- Use `loading="lazy"` on img tags or IntersectionObserver
- Show the gradient as placeholder while the image loads
- Fade in the image on load with a CSS transition

### 3.3 — Error handling for all API calls

Audit every `fetch()` call and make sure:
- Network errors show a user-friendly message (not a blank screen)
- Timeouts are set (5 second max for weather, 3 second for flight pricing)
- Failed weather fetches fall back to "conditions unavailable" (not score 0)
- Failed flight pricing falls back to BASE_PRICES estimate with an "est." label
- Add a "Retry" button when weather fetch fails completely

### 3.4 — Fix the BottomNav — add Trips tab back

The nav was reduced to 3 tabs (Explore, Alerts, Profile) but TripsTab and WishlistsTab components still exist in the code. The trip builder is a key feature. Restore a 4-tab layout:

Explore | Trips | Alerts | Profile

Move the wishlists functionality into the Explore tab (it's already partially there with the heart/saved button). The Trips tab should show saved trips and the trip builder.

---

## Phase 4: Content & Engagement

### 4.1 — Improve venue data quality

Some venues have generic or missing data. For each venue, ensure:
- `tags` array has 2-3 genuinely useful tags (not generic filler)
- `rating` and `reviews` are realistic for the destination size
- Airport codes are correct (spot-check the top 20)
- Coordinates are accurate (spot-check with a quick mental model — is Whistler really in BC?)

### 4.2 — Add seasonal intelligence

Add a `bestMonths` field to each venue:

```javascript
bestMonths: [12, 1, 2, 3] // December through March for ski resorts
```

Use this to:
- Show "Peak season" or "Off season" badges on cards
- Improve the condition scoring (boost score during best months)
- Add "Best time to visit: Dec-Mar" to the detail sheet
- Power a "What's in season" section on the Explore tab

### 4.3 — Add a "Trending" section

Track which venues get the most taps/wishlists (in localStorage for now) and show a "Trending on Peakly" carousel. Even with fake/seeded data, this social proof makes the app feel alive.

### 4.4 — Onboarding improvements

The onboarding flow should:
- Ask fewer questions (just name, home airport, top 2 sports)
- Show a personalized welcome: "Hey Jack, here's what's firing near New York"
- Auto-show onboarding on first visit (check if profile.name is empty)
- Add a skip option that still works with sensible defaults

---

## Verification Checklist (Run After Each Phase)

After completing each phase, verify:
- [ ] Open `index.html` in Chrome — no console errors
- [ ] Babel compiles without parse errors
- [ ] All 3 tabs load and display content
- [ ] Hero card shows with real data (not undefined/NaN)
- [ ] Tapping a venue card opens the detail sheet
- [ ] Wishlist toggle works (heart changes state)
- [ ] Search sheet opens and closes cleanly
- [ ] Category pills filter the grid correctly
- [ ] Bottom nav switches tabs without errors
- [ ] App works on mobile viewport (375px width)

---

## Do NOT Do

- Do NOT split app.jsx into multiple files (unless I specifically ask)
- Do NOT add a build step, bundler, or package.json for the web app
- Do NOT use ES module imports (Babel Standalone doesn't support them)
- Do NOT expose the Travelpayouts API token in client code
- Do NOT remove or rename existing localStorage keys (breaks existing users)
- Do NOT change the 3-column compact grid layout — it works well
- Do NOT add any npm dependencies to the web app
