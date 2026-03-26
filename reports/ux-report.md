# UX Designer Report — 2026-03-25

**UX Score: 6.5/10**

Good bones. The core Explore > Detail > Book flow works and the visual hierarchy on cards is strong. But there are real gaps: missing Plausible events, touch target violations, color contrast failures, a Book button with no analytics, and an onboarding that most users will never see. Below is everything, with code fixes.

---

## 1. Core Flow Audit — Tap Counts

### Flow A: Fresh visit to first venue with conditions + flight price visible
1. App loads (Explore tab default) — **0 taps** — hero card is immediately visible with conditions score, flight price, and GO badge.

**Result: 0 taps.** This is excellent. Better than Airbnb's 3-tap benchmark.

### Flow B: Set an alert for a specific venue
1. Tap venue card (detail sheet opens) — 1 tap
2. Scroll down to "Set Alert for This Spot" section within VenueDetailSheet — needs scroll
3. Tap "Set Alert" button in detail sheet (if it exists) — 1 tap
4. OR: Tap Alerts tab — 1 tap
5. Tap "Create Alert" — 1 tap
6. Tap sport — 1 tap
7. Tap condition threshold — 1 tap
8. Scroll to bottom, tap "Create Alert" — 1 tap

**Result: 5-6 taps via Alerts tab.** The detail sheet has a "Set Alert" button (~line 7500s), which is 2 taps — that path is good. But the Alerts tab path has too many required fields before the CTA appears; the sport picker alone shows 12+ options with no default.

**Issue:** When creating an alert from the Alerts tab, the user must pick a sport before any other options appear. There is no "recommended" or pre-selected default. The draft starts as `{ sport:"" }` (line 5422), which blocks progress.

### Flow C: Share a venue with a friend
1. Tap venue card — 1 tap
2. Tap "Share & Invite" button on hero — 1 tap
3. Tap "Copy link" or "Copy card" — 1 tap

**Result: 3 taps.** Clean. The Web Share API fires on mobile for "Copy link" path, which is ideal.

**Alternative path from ListingCard:** The share button on the card itself is only 32x28px visible on the top-right corner — easy to miss, no label.

---

## 2. Plausible Event Wiring

The agent prompt requests 5 specific events. Current state:

| Event | Wired? | Location |
|-------|--------|----------|
| Tab Switch | YES | Line 8616 — `window.plausible('Tab Switch', {props: {tab}})` |
| Venue Click | PARTIAL | Line 8463 — `logEvent('venue_open', ...)` fires, but uses `venue_open` not `Venue Click` |
| Flight Search | PARTIAL | Line 7553 — `logEvent('flight_click', ...)` fires on sticky CTA, but NOT on ListingCard "Book" button (line 4027) |
| Wishlist Add | YES | Line 8453 — `window.plausible('Wishlist Add', {props: {venue: ...}})` |
| Onboarding Complete | YES | Line 6669 — `window.plausible('Onboarding Complete', {props: {airport: ...}})` |

### Missing event wiring — exact code fixes:

**FIX 1: ListingCard "Book" button missing flight_click event**

FILE: app.jsx
LINE: ~4027 (ListingCard, Book button onClick)
ISSUE: ListingCard "Book" button fires haptic("heavy") but no Plausible event. This is a revenue-critical action with zero tracking.
FIX:
```jsx
// Change line 4027 from:
onClick={e => { e.stopPropagation(); haptic("heavy"); }}
// To:
onClick={e => { e.stopPropagation(); haptic("heavy"); logEvent('Flight Search', {venue: listing.title, origin: listing.flight.from, price: listing.flight.price, source: 'listing_card'}); }}
```

**FIX 2: Standardize "venue_open" to "Venue Click" to match Plausible dashboard naming**

FILE: app.jsx
LINE: ~8463 (openDetail callback)
ISSUE: Event name is `venue_open` but Plausible dashboard expects `Venue Click` per the spec. Inconsistent naming.
FIX:
```jsx
// Change line 8463 from:
logEvent('venue_open', { venue: listing.title, category: listing.category });
// To:
logEvent('Venue Click', { venue: listing.title, category: listing.category, score: listing.conditionScore });
```

**FIX 3: Standardize "flight_click" to "Flight Search"**

FILE: app.jsx
LINE: ~7553 and the new ListingCard event
ISSUE: Event name is `flight_click` but spec says `Flight Search`.
FIX:
```jsx
// Line 7553 change:
logEvent('flight_click', {venue: listing.title, origin: listing.flight.from});
// To:
logEvent('Flight Search', {venue: listing.title, origin: listing.flight.from, price: listing.flight.price, source: 'detail_cta'});
```

---

## 3. Visual Quality Audit

### Touch Targets

| Element | Size | Pass? | Location |
|---------|------|-------|----------|
| BottomNav buttons | ~44px tall (padding 8px + icon + label + dot) | BORDERLINE | Line 8185 |
| ListingCard share button | 32x32px | FAIL | Line 3944 |
| CompactCard heart button | 36x36px | FAIL | Line 4136 |
| Hero close button (detail sheet) | 34x34px | FAIL | Line 7227 |
| Category pills | ~34px tall | FAIL | Line 4961 |
| Alert "Back" button | No min-height set | FAIL | Line 5491 |

**FIX 4: Share button on ListingCard too small**

FILE: app.jsx
LINE: ~3944
ISSUE: Share button is 32x32px, below 44x44px minimum for touch targets.
FIX:
```jsx
// Change width:32, height:32 to:
width:44, height:44
```

**FIX 5: CompactCard heart button too small**

FILE: app.jsx
LINE: ~4136
ISSUE: Heart button is 36x36px, below 44x44px minimum.
FIX:
```jsx
// Change width:36, height:36 to:
width:44, height:44
// And adjust top/right positioning to compensate:
top:-2, right:-2
```

**FIX 6: Detail sheet close button too small**

FILE: app.jsx
LINE: ~7227
ISSUE: Close button is 34x34px.
FIX:
```jsx
// Change width:34, height:34 to:
width:44, height:44
```

### Type Hierarchy

Generally strong. The hierarchy is clear:
- Hero card title: 20px/900 weight
- Section headers: 18px/800 weight
- Card titles: 14px/700 weight (ListingCard), 12px/800 (Best Right Now), 11px/700 (CompactCard)
- Body text: 13px
- Metadata: 10-11px

**Issue:** CompactCard title at 11px/700 is too small for a 3-column grid. On a 430px container, each card is ~127px wide. 11px text at that width is barely legible.

### Color Contrast (WCAG AA Failures)

| Element | FG | BG | Ratio | Pass? |
|---------|----|----|-------|-------|
| "Updated Xm ago" | #bbb on #fff | - | 2.8:1 | FAIL (needs 4.5:1) |
| "est." label | #888 on #fff | - | 3.5:1 | FAIL |
| Review count | #aaa on #fff | - | 2.9:1 | FAIL |
| "rt" label | #aaa on #fff | - | 2.9:1 | FAIL |
| "Clear all" filter link | #aaa on #fff | - | 2.9:1 | FAIL |
| Flight price strike-through | #b0b0b0 on #fff | - | 3.2:1 | FAIL |

**FIX 7: Multiple WCAG AA contrast failures**

FILE: app.jsx
ISSUE: Six elements use #aaa or #bbb on white, which fails WCAG AA (4.5:1 minimum for small text).
FIX: Replace all instances of light gray metadata text:
```
#bbb -> #888 (contrast ratio 5.0:1) — for "Updated" timestamp
#aaa -> #767676 (contrast ratio 4.5:1) — for review counts, "rt" labels, "Clear all"
#b0b0b0 -> #888 (5.0:1) — for strike-through prices
```

### Icon Quality

| Emoji | Context | Issue |
|-------|---------|-------|
| star (line 3996) | Rating star | Renders differently on Android vs iOS |
| x (line 7227) | Close button | Text character, not icon. Inconsistent rendering. |
| share arrow (line 3948) | Share on card | Raw arrow character, not an icon |

**FIX 8: Close button should be SVG**

FILE: app.jsx
LINE: ~7227
ISSUE: Close button uses text character which renders inconsistently.
FIX:
```jsx
// Replace the text content with:
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
```

### Spacing Consistency

- **Issue:** "Best Right Now" carousel uses `padding:"0 24px"` but the hero card above uses `margin:"12px 14px 0"` — side margins of 24px vs 14px creates visual misalignment.

---

## 4. Airbnb Comparison

### Explore Tab vs Airbnb Search

| Feature | Airbnb | Peakly | Gap |
|---------|--------|--------|-----|
| Search bar | Full-width, prominent, always visible | Present but secondary to category pills | Minor |
| Category filter | Horizontal scroll with icons | Horizontal scroll with emoji + text | Similar |
| Price display | Per night, prominent | Flight price with deal %, prominent | Good |
| Photo quality | Professional, full-bleed | Unsplash, lazy-loaded, fade-in | Acceptable |
| Map toggle | Bottom-left FAB | Not present | Not needed for conditions-first app |
| Empty state | "Try adjusting" with illustration | "Nothing great this weekend" with emoji | Weaker |
| Skeleton loading | Animated placeholders | Shimmer placeholders | Good |

**Biggest gap:** Airbnb's card has a clear visual hierarchy: photo > price > title > rating. Peakly's ListingCard packs too much into the 220px hero: GO badge + flight price badge + condition label, all competing for attention.

### Detail Sheet vs Airbnb Listing

| Feature | Airbnb | Peakly | Gap |
|---------|--------|--------|-----|
| Photo hero | Carousel with 5+ photos | Single photo | Missing carousel |
| Sticky CTA | "Reserve" button | "Flights" + "Hotels" buttons | Good |
| Reviews | Stars + written reviews | Rating + count only | Expected for MVP |
| Share | Native share sheet | Custom panel + Web Share API | Good |
| Save to list | Heart + list picker | Heart + list picker | Matched |

**Biggest gap:** Single photo in detail sheet. Even 2-3 photos would increase conversion.

---

## 5. All Code Fixes Summary

| # | Severity | Issue | Line |
|---|----------|-------|------|
| 1 | CRITICAL | ListingCard "Book" button has no Plausible event | ~4027 |
| 2 | HIGH | Onboarding never auto-triggers for new users | ~8260 |
| 3 | HIGH | Event name mismatch: venue_open vs Venue Click | ~8463 |
| 4 | HIGH | Event name mismatch: flight_click vs Flight Search | ~7553 |
| 5 | MEDIUM | ListingCard share button 32x32 (needs 44x44) | ~3944 |
| 6 | MEDIUM | CompactCard heart button 36x36 (needs 44x44) | ~4136 |
| 7 | MEDIUM | Detail sheet close button 34x34 (needs 44x44) | ~7227 |
| 8 | MEDIUM | 6 WCAG AA contrast failures (#aaa/#bbb on white) | Multiple |
| 9 | LOW | Close button should be SVG not text character | ~7227 |
| 10 | LOW | Best Right Now vs hero side margin misalignment | ~5084/5180 |

### CRITICAL: Auto-trigger onboarding for first-time users

FILE: app.jsx
LINE: ~8260
ISSUE: `showOnboarding` starts as `false`. New users land on Explore with no prompt to set home airport.
FIX:
```jsx
// Change line 8260 from:
const [showOnboarding, setShowOnboarding] = useState(false);
// To:
const [showOnboarding, setShowOnboarding] = useState(() => {
  try {
    const p = JSON.parse(localStorage.getItem("peakly_profile") || "{}");
    return !p.hasAccount;
  } catch { return true; }
});
```

---

## 6. The One Thing

**The single highest-impact UX change this week is adding the missing `Flight Search` Plausible event to the ListingCard "Book" button, because this is a revenue-critical click that currently has zero tracking.** You cannot optimize conversion on a button you cannot measure. Every ListingCard in the grid has a "Book" button that opens an Aviasales affiliate link. Without tracking, you have no idea how many users click it, which venues convert, or whether card position affects revenue.

Here is the complete code:

```jsx
// In ListingCard (~line 4026-4027), change:
<a href={buildFlightUrl(listing.flight.from, listing.ap)} target="_blank" rel="noopener noreferrer"
  onClick={e => { e.stopPropagation(); haptic("heavy"); }}
  style={{ textDecoration:"none" }}>

// To:
<a href={buildFlightUrl(listing.flight.from, listing.ap)} target="_blank" rel="noopener noreferrer"
  onClick={e => { e.stopPropagation(); haptic("heavy"); logEvent('Flight Search', {venue: listing.title, origin: listing.flight.from, price: listing.flight.price, source: 'listing_card'}); }}
  style={{ textDecoration:"none" }}>
```

This is a one-line change that immediately unlocks flight conversion data across all 2,226 venues in the grid. Ship today.
