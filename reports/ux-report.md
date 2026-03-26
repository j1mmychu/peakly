# UX Designer Report — 2026-03-25

**UX Score: 7.2/10**

The app has strong bones — the Explore tab, hero card, and VenueDetailSheet are well-structured. But undersized touch targets, a critical performance issue with 2,226 venues rendering at once, contrast failures, and inconsistent Plausible event naming hold it back from Airbnb-level polish.

---

## 1. Core Flow Audit — Tap Counts

### Flow A: Fresh visit to first venue with conditions + flight price visible

1. App loads, splash dismisses automatically
2. Onboarding appears (if `!profile.hasAccount`): "Get Started" (tap 1)
3. Airport selection (tap 2), "Continue" (tap 3)
4. Sports selection, "Show me what's firing" (tap 4)
5. Hero card visible with conditions score + flight price — 0 additional taps

**Result: 4 taps through onboarding, then 0 taps.** After onboarding completes, it is 0 taps to conditions + price on the hero card. Airbnb benchmark is 3 taps — Peakly matches or beats this for returning users.

**Issue:** The `showOnboarding` state (line 8585) starts as `false`. It only triggers if `!profile.hasAccount` is checked somewhere in App. Confirmed: line 8585 `useState(false)` — new users must manually trigger onboarding from Profile tab. The onboarding should auto-trigger for first-time visitors.

### Flow B: Set an alert for a specific venue

1. Tap venue card (tap 1) — VenueDetailSheet opens
2. Scroll to "Alert me when conditions peak" button (tap 2)
3. Redirected to AlertsTab — but alert form is NOT pre-filled

The `onAlert` callback (line 8934) sets `setDetailVenue(null)` and `setActiveTab("alerts")` but does NOT pass the venue's sport or location to AlertsTab. The user must:
4. Tap "Create Alert" on AlertsTab (tap 3)
5. Pick sport manually (tap 4)
6. Pick condition (tap 5)
7. Save alert (tap 6)

**Result: 6 taps minimum.** The venue context is discarded at step 3. Pre-filling sport and location from the triggering venue would save 2 taps.

### Flow C: Share a venue with a friend

1. Tap venue card (tap 1)
2. Tap "Share & Invite" in hero (tap 2)
3. Tap "Copy link" — native Web Share API fires on mobile (tap 3)

**Result: 3 taps.** Clean. Web Share API integration is excellent.

---

## 2. Plausible Event Wiring

Plausible loaded via `script.hash.js` with `data-domain="j1mmychu.github.io"` (line 32 of index.html).

| Event | Status | Location | Notes |
|-------|--------|----------|-------|
| Tab Switch | WIRED | Line 8942 | `window.plausible('Tab Switch', {props: {tab}})` |
| Venue Click | WIRED (different name) | Line 8802 | `logEvent('venue_open', ...)` — fires through `logEvent()` which calls `window.plausible()`. Event name is `venue_open` not `Venue Click` |
| Flight Search | PARTIALLY WIRED | Line 7878 (detail CTA) | `logEvent('flight_click', ...)` fires on sticky CTA. ListingCard Book button (line 4086) fires `plausible('book_click', ...)` — different event name |
| Wishlist Add | WIRED | Line 8789 | `window.plausible('Wishlist Add', {props: {venue: ...}})` |
| Onboarding Complete | WIRED | Line 6985 | `window.plausible('Onboarding Complete', {props: {airport: ...}})` |

### Issues

**1. Flight event naming is split across two event names.** The sticky CTA in VenueDetailSheet sends `flight_click` (line 7878). The ListingCard Book button sends `book_click` (line 4086). These should be unified so Plausible shows one metric for all flight clicks.

FILE: app.jsx
LINE: 4086
ISSUE: ListingCard Book button fires `book_click` while VenueDetailSheet sticky CTA fires `flight_click`. Split data in Plausible dashboard.
FIX:
```jsx
// Line 4086, change:
if (window.plausible) plausible('book_click', {props: {venue: listing.title, category: listing.category}});
// To:
logEvent('flight_click', {venue: listing.title, category: listing.category, price: listing.flight.price, source: 'listing_card'});
```

**2. No `search` event fires when user applies search filters.**

FILE: app.jsx
LINE: 8898 (onApply in SearchSheet)
ISSUE: SearchSheet apply callback does not fire a Plausible event. Cannot measure search engagement.
FIX:
```jsx
// Line 8898, inside onApply:
onApply={(s) => {
  logEvent('search', { activities: (s.activities || []).join(','), destination: s.destination || '', continent: s.continent || '' });
  if (s.activities?.length === 1) setActiveCat(s.activities[0]);
  else setActiveCat("all");
  setProfile(p => ({ ...p, homeAirport: s.fromAirport }));
}}
```

---

## 3. Visual Quality Audit

### Touch Targets (44x44px minimum per Apple HIG)

| Element | Actual Size | Passes? | Line |
|---------|-------------|---------|------|
| ListingCard share button | 32x32px | FAIL | 4003 |
| ListingCard heart button | 36x36px | FAIL | 4010 |
| CompactCard heart button | 36x36px | FAIL | 4196 |
| VenueDetailSheet close button | 34x34px | FAIL | 7552 |
| Score vote thumbs up/down | 30x30px | FAIL | 7605, 7608 |
| BottomNav tab buttons | ~42px tall | BORDERLINE | 8510 |
| Category pills | ~30px tall (`padding: 7px 14px`) | FAIL | 5276 |
| FilterChip close "x" | No explicit size | FAIL | 5102 |

FIX: Increase all interactive element sizes to minimum 44x44px:
```
Line 4003: width:32,height:32 -> width:44,height:44
Line 4010: width:36,height:36 -> width:44,height:44
Line 4196: width:36,height:36 -> width:44,height:44
Line 7552: width:34,height:34 -> width:44,height:44
Line 7605,7608: width:30,height:30 -> width:40,height:40
```

### Type Hierarchy

Generally strong. Hero card: label (11px/700) -> title (20px/900) -> location (12px) -> stats -> CTA. Clear hierarchy.

**Issue:** CompactCard title is 11px (line 4220). In the 3-column grid at 430px container width, each card is ~127px. At 11px, venue names are truncated and barely legible. Should be 12px minimum.

### Color Contrast — WCAG AA Failures

| Element | FG | BG | Ratio | Line |
|---------|----|----|-------|------|
| "Updated Xm ago" | #bbb | #fff | ~2.8:1 | 5479 |
| "est." label | #888 | #fff | ~3.5:1 | 4243 |
| Inactive BottomNav tab | #b0b0b0 | #fff | ~3.2:1 | 8513 |
| "Skip for now" | #bbb | #fff | ~2.8:1 | 7182, 7214 |
| Review count "(123)" | #aaa | #fff | ~2.9:1 | 4057 |
| "rt" label | #aaa | #fff | ~2.9:1 | 5524 |
| Strike-through price | #b0b0b0 | #fff | ~3.2:1 | 4083 |

All need 4.5:1 minimum for small text. FIX: Replace:
- `#bbb` -> `#888` (5.0:1)
- `#aaa` -> `#767676` (4.5:1 — exact AA threshold)
- `#b0b0b0` -> `#888` (5.0:1)

### Icon Quality — Emoji in UI Chrome

Per the decision "Remove emoji from UI chrome" (CLAUDE.md line 270), several emoji remain in chrome positions:

| Location | Emoji | Line |
|----------|-------|------|
| Sticky CTA flight button | plane emoji | 7884 |
| Sticky CTA hotel button | hotel emoji | 7896 |
| "Insider Tips" header | target emoji | 7692 |
| "Gear for this trip" header | shopping bag emoji | 7707 |
| "You'd also like" header | lightbulb emoji | 7665 |
| "Save to list" header | folder emoji | 7822 |
| ListingCard flight badge | plane emoji | 4026 |

The sticky CTA is the highest-conversion element. Replace its plane emoji with SVG:
```jsx
// Line 7884, replace emoji with:
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1L11 12l-2 3H6l-1 1 3 2 2 3 1-1v-3l3-2 3.8 7.3c.2.4.7.5 1.1.3l.5-.3c.4-.2.5-.7.4-1.1z"/></svg>
```

### Spacing Consistency

- Hero card uses `margin:"12px 14px 0"` (14px sides)
- "Best Right Now" carousel uses `padding:"0 24px"` (24px sides)
- Grid header uses `padding:"4px 24px 14px"` (24px sides)
- 3-column grid uses `padding:"0 14px 24px"` (14px sides)

The alternating 14px/24px side margins create visual misalignment. The grid at 14px is fine for density but doesn't align with the 24px section header above it.

FIX (line 5551): Change 3-column grid padding to `"0 24px 24px"` and reduce gap to 8px to compensate.

---

## 4. Airbnb Comparison

### Explore Tab vs. Airbnb Home

| Airbnb Does | Peakly Status | Gap |
|-------------|---------------|-----|
| Horizontal category icons (icon above, label below) | Emoji + text pills | Minor — pills work fine |
| Map toggle FAB | No map | Not needed for conditions-first app |
| Infinite scroll with windowed rendering | All 2,226 venues rendered at once | CRITICAL — see below |
| Professional photography | Unsplash photos with lazy load | Acceptable |
| Guest favorites badge | GO/MAYBE/WAIT badge | Peakly's is more actionable |
| Skeleton loading | Shimmer placeholders | Matched |

**Critical gap: No pagination.** With 2,226 venues, the grid renders all filtered venues at once. On lower-end phones this causes significant scroll jank and high memory usage. Airbnb uses virtualized lists. Peakly needs at minimum a "Show more" button.

### VenueDetailSheet vs. Airbnb Listing

| Airbnb Does | Peakly Status | Gap |
|-------------|---------------|-----|
| 5+ photo carousel | Single hero photo | Missing carousel |
| Written reviews | Rating + count only | Expected for MVP |
| Sticky "Reserve" CTA | Sticky "Flights + Hotels" CTA | Matched |
| Native share sheet | Web Share API + custom panel | Matched |
| Save to list | Heart + list picker | Matched |

---

## 5. All Issues — Priority Ordered

| # | Severity | Issue | Component | Line |
|---|----------|-------|-----------|------|
| 1 | CRITICAL | All 2,226 venues rendered at once — no pagination | ExploreTab | 5553 |
| 2 | HIGH | onAlert discards venue context — alert form starts blank | App | 8934 |
| 3 | HIGH | Flight event split: `book_click` vs `flight_click` | ListingCard | 4086 |
| 4 | HIGH | Onboarding does not auto-trigger for new users | App | 8585 |
| 5 | MEDIUM | 8 touch targets below 44x44px minimum | Multiple | Multiple |
| 6 | MEDIUM | 7 WCAG AA contrast failures (#aaa/#bbb on white) | Multiple | Multiple |
| 7 | MEDIUM | No search event fires on filter apply | App | 8898 |
| 8 | MEDIUM | CompactCard title at 11px is too small | CompactCard | 4220 |
| 9 | LOW | Emoji in UI chrome (sticky CTA, section headers) | VenueDetailSheet | 7884 |
| 10 | LOW | Grid/header side padding misalignment (14px vs 24px) | ExploreTab | 5551 |

---

## 6. The One Thing

The single highest-impact UX change this week is **adding pagination to the venue grid** because rendering 2,226 cards at once causes scroll jank on mobile devices, directly degrading the core browse experience for every single user. No amount of visual polish matters if the app stutters when scrolling.

Here is the complete code:

```jsx
// In ExploreTab function, after existing state declarations (around line 5161), add:
const [visibleCount, setVisibleCount] = useState(30);

// Reset visible count when category or filters change (add after line 5205):
useEffect(() => { setVisibleCount(30); }, [activeCat, filters.sort, filters.maxPrice, search.skiPass]);

// Before the grid JSX (around line 5553), add:
const visibleGrid = gridListings.slice(0, visibleCount);

// In the grid (lines 5556-5559), replace gridListings with visibleGrid:
// Change: gridListings.map(l => ...)
// To:     visibleGrid.map(l => ...)

// After the grid closing </div> tag (after line 5560), add:
{!loading && visibleCount < gridListings.length && (
  <div style={{ padding:"8px 24px 24px", gridColumn:"1 / -1" }}>
    <button onClick={() => setVisibleCount(c => c + 30)} className="pressable" style={{
      width:"100%", background:"#f5f5f5", border:"1.5px solid #e8e8e8",
      borderRadius:14, padding:"14px", fontSize:13, fontWeight:700, color:"#555",
      fontFamily:F, cursor:"pointer",
    }}>
      Show more ({gridListings.length - visibleCount} remaining)
    </button>
  </div>
)}
```

This takes the grid from rendering 2,226 DOM nodes to 30, with progressive loading. Initial paint drops dramatically, scroll becomes smooth, and the pattern is standard across every major app. Ship today.
