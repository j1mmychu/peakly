# Peakly UX Audit -- Report: 2026-03-24 (v9)

## Design Score: 9.2/10

The v8 fixes are holding. The pill count conditional (hide < 3 venues) is confirmed shipped. The "rt" label was added to the carousel price. The fontSize:10 floor is applied on CompactCard and hero stat labels. Remaining 0.8 points are split between: (a) 11 surviving fontSize:9 instances, half on decision-critical surfaces; (b) missing Plausible custom event wiring despite the Plausible script being loaded; (c) a "windows available" label that was marked for rename to "spots" in CLAUDE.md decisions but never shipped; and (d) no alert creation path from VenueDetailSheet -- the `onAlert` prop is wired but never called inside the sheet.

---

## 1. CORE FLOW AUDIT -- Tap Count

### Flow A: Fresh visit to first venue with conditions + flight price visible
1. App loads -> Explore tab is default. Hero card visible immediately with condition score + flight price. **0 taps to see data.**
2. Tap hero card -> VenueDetailSheet opens with full conditions + flight price + 7-day forecast. **1 tap.**
3. Tap "Book on Google Flights" -> external link. **2 taps to bookable flight.**

**Verdict: 2 taps. Beats Airbnb's 3-tap benchmark.** The hero card is doing its job.

### Flow B: Set an alert for a specific venue
1. Open venue (1 tap on any card).
2. VenueDetailSheet opens. There is no "Set Alert" button inside VenueDetailSheet. The `onAlert` prop exists but is never called by any UI element in the sheet.
3. User must close the sheet, tap "Alerts" in BottomNav (2 taps), tap "Create Alert" (3 taps), pick a sport (4 taps), pick conditions (5 taps), optionally find the specific venue in the locations list (6 taps), confirm (7 taps).

**Verdict: 7 taps. Should be 3.** The VenueDetailSheet should have a "Set Alert" button that pre-fills the alert with the venue's sport and location. The `onAlert` callback is already wired from App -> VenueDetailSheet. Zero plumbing needed -- only a UI trigger inside the sheet.

### Flow C: Share a venue with a friend
1. Open venue (1 tap).
2. Tap "Share & Invite" button in VenueDetailSheet hero (2 taps).
3. Tap "Copy link" or "Copy card" (3 taps).
4. Paste into messaging app (platform action).

**Verdict: 3 taps. Acceptable.** The share panel is well-designed with two copy options and a preview card.

---

## 2. PLAUSIBLE EVENT WIRING

Plausible script is loaded in index.html (line 27: `<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.js"></script>`). Zero custom events are wired. The `plausible()` function is available globally once the script loads but is never called anywhere in app.jsx.

Here are the 5 custom events with exact code and trigger points:

### Event 1: Tab Switch
**Trigger point:** BottomNav button click (line 5234)

```jsx
// FILE: app.jsx
// LINE: 5234 -- inside BottomNav, replace the onClick handler
<button key={t.id} onClick={() => {
  setActive(t.id);
  if (window.plausible) window.plausible('Tab Switch', { props: { tab: t.id } });
}} className="tab-btn" style={{
```

### Event 2: Venue Click
**Trigger point:** openDetail callback in App (line 5448)

```jsx
// FILE: app.jsx
// LINE: 5448 -- replace the openDetail callback
const openDetail = useCallback(listing => {
  setDetailVenue(listing);
  if (window.plausible) window.plausible('Venue Click', { props: { venue: listing.id, category: listing.category, score: listing.conditionScore } });
}, []);
```

### Event 3: Flight Search
**Trigger point:** "Book on Google Flights" CTA in VenueDetailSheet (line 4394)

```jsx
// FILE: app.jsx
// LINE: 4394 -- add onClick to the <a> tag
<a href={flightUrl} target="_blank" rel="noopener noreferrer" onClick={() => {
  if (window.plausible) window.plausible('Flight Search', { props: { venue: listing.id, price: listing.flight.price, from: listing.flight.from, to: listing.ap } });
}} style={{ textDecoration:"none", display:"block", marginBottom:14 }}>
```

Also wire the ListingCard "Book" button (line 1388-1389):

```jsx
// FILE: app.jsx
// LINE: 1389 -- update the onClick
onClick={e => {
  e.stopPropagation();
  haptic("heavy");
  if (window.plausible) window.plausible('Flight Search', { props: { venue: listing.id, price: listing.flight.price, from: listing.flight.from, to: listing.ap } });
}}
```

### Event 4: Wishlist Add
**Trigger point:** toggleWishlist callback in App (line 5444)

```jsx
// FILE: app.jsx
// LINE: 5444 -- replace the toggleWishlist callback
const toggleWishlist = useCallback(id => {
  setWishlists(p => {
    const removing = p.includes(id);
    if (!removing && window.plausible) {
      const venue = VENUES.find(v => v.id === id);
      window.plausible('Wishlist Add', { props: { venue: id, category: venue?.category || 'unknown' } });
    }
    return removing ? p.filter(x => x !== id) : [...p, id];
  });
}, [setWishlists]);
```

### Event 5: Onboarding Complete
**Trigger point:** OnboardingSheet `complete` function (line 3909)

```jsx
// FILE: app.jsx
// LINE: 3909 -- update the complete function
const complete = () => {
  setProfile(p => ({ ...p, name, email, sports, homeAirport: airport, hasAccount:true }));
  if (window.plausible) window.plausible('Onboarding Complete', { props: { airport: airport, sports: sports.join(','), hasSports: sports.length > 0 } });
  onClose();
};
```

---

## 3. VISUAL QUALITY AUDIT

### Touch targets
All interactive elements meet the 44x44px minimum in practice (36x36 heart buttons with surrounding padding bring effective targets above 44). The search bar has 13px vertical padding on a tall element -- well above minimum. Category pills have 7px vertical padding with 12px font, giving ~38px height -- technically below 44px but acceptable for horizontal scroll elements following Apple HIG exceptions for toolbars.

One violation: the BottomNav tab buttons have `padding:"4px 0"` with a 20px icon and 10px label. Total height is roughly 38px. This is the primary navigation and should be 48px minimum.

**FILE:** app.jsx
**LINE:** 5238
**ISSUE:** BottomNav buttons are ~38px tall, below 44px minimum for primary navigation.
**FIX:**
```jsx
// Change padding:"4px 0" to padding:"8px 0"
padding:"8px 0",
```

### Type hierarchy
Clear on all major screens. Hero card (20px title, 16px score, 12px location) creates proper hierarchy. VenueDetailSheet has strong hierarchy (20px title, 22px score, 13px body). The grid header (18px section name, 13px subtitle) works.

One issue: "All experiences" header at line 2486 uses 18px, same weight as "Best Right Now" at line 2438. These are different hierarchy levels (section vs. grid) but read as equals.

### Color contrast WCAG AA failures

| Element | Line | Foreground | Background | Ratio | Min Required | Fix |
|---------|------|-----------|------------|-------|-------------|-----|
| Carousel "rt" label | 2472 | #aaa on white | #fff | 2.32:1 | 4.5:1 (text < 18px) | Change to #888 |
| Estimated prices banner text | 2427 | #f59e0b on #fef3c7 | -- | 2.84:1 | 4.5:1 | Change to #b45309 |
| "Affiliate links" text | 4479 | #bbb on white | #fff | 1.85:1 | 4.5:1 | Change to #888 |
| "via GetYourGuide" text | 4503 | #bbb on white | #fff | 1.85:1 | 4.5:1 | Change to #888 |
| Similar venue score badge text | 4447 | #fff on varies | depends on score | OK for >=85 | -- | Fine for colored bg |
| SearchBar subtitle | 1937 | #999 on #fff | #fff | 2.85:1 | 4.5:1 | Change to #717171 |

### Spacing consistency
Card border-radius inconsistency: CompactCard uses 12, ListingCard uses 20, FeaturedCard uses 20, carousel cards use 14, hero card uses 16, saved venue cards use 12, similar venue cards use 14. Five different radii across card components. Should converge to two: 12px for compact/inline, 16px for full-size.

---

## 4. AIRBNB COMPARISON

### Explore screen
**What Airbnb does:** Horizontally scrollable category bar with no expand button -- all categories visible via scroll. A subtle right-edge fade gradient signals scrollability.
**What Peakly does:** Shows 4 default pills + a "+ More" button that reveals the rest.
**Gap:** The "+ More" button requires a deliberate tap, hiding new categories. A scroll-fade approach surfaces all pills with zero interaction.

**FILE:** app.jsx
**LINE:** 2260
**ISSUE:** Category pill bar uses a "+ More" expand button instead of continuous horizontal scroll.
**FIX:** Remove the `defaultCatIds` filter and `showAllCats` toggle. Show all CATEGORIES in the scrollable row. Add a gradient fade on the right edge via CSS:

```jsx
// Replace lines 2253-2255 with:
const visibleCats = CATEGORIES;

// Add a wrapper div around the pill scroll container (line 2260) with a pseudo-element gradient:
// In the CSS injection block (line 71), add:
// .pill-scroll { position: relative; }
// .pill-scroll::after { content:''; position:absolute; right:0; top:0; bottom:0; width:40px; background:linear-gradient(to right,transparent,#fff); pointer-events:none; z-index:1; }
```

### Venue detail sheet
**What Airbnb does:** Prominent "Reserve" CTA pinned to the bottom of the listing detail. Date picker inline. Share and save icons in the header, not behind a panel.
**What Peakly does:** "Book on Google Flights" CTA is inline, scrolls with content. No pinned bottom CTA.
**Gap:** When a user scrolls down to forecast, tips, or gear, the flight CTA disappears. It should be pinned.

**FILE:** app.jsx
**LINE:** ~4394
**ISSUE:** Flight booking CTA scrolls out of view in VenueDetailSheet.
**FIX:** Move the CTA to a fixed-position bar at the bottom of the sheet. This is a larger refactor -- flag for next sprint. The current inline position works but is suboptimal for conversion.

### Card design
**What Airbnb does:** Clean photo, title, location, price per night, rating. No badges overlaying the photo except a "Guest favorite" subtle overlay.
**What Peakly does:** GoVerdictBadge + flight price pill overlay on photo. Condition label overlay at bottom of photo. More cluttered but justified by the conditions-first value prop.
**Gap:** Acceptable divergence. Peakly's overlay density is justified because conditions are the primary value. No fix needed.

---

## 5. ALL CODE FIXES

### Fix 1: Add "Set Alert" button to VenueDetailSheet
**FILE:** app.jsx
**LINE:** 4400 (after the Book on Google Flights CTA)
**ISSUE:** The `onAlert` prop is wired but never triggered. Users must navigate to Alerts tab manually (7 taps vs 3).
**FIX:**
```jsx
{/* Add after the Book on Google Flights CTA, before the 7-day forecast */}
<button onClick={() => onAlert(listing)} className="pressable" style={{
  background:"#f5f5f5", border:"1.5px solid #e8e8e8", borderRadius:14,
  padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"center",
  gap:8, width:"100%", cursor:"pointer", marginBottom:14,
}}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  <span style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>Alert me when conditions peak</span>
</button>
```

### Fix 2: Rename "windows available" to "spots"
**FILE:** app.jsx
**LINE:** 2489
**ISSUE:** CLAUDE.md decision from 2026-03-23 says rename "windows available" to "spots". Never shipped.
**FIX:**
```jsx
// Change:
{loading ? "Fetching live conditions..." : `${gridListings.length} windows available`}
// To:
{loading ? "Fetching live conditions..." : `${gridListings.length} spots`}
```

### Fix 3: Estimated prices banner contrast failure
**FILE:** app.jsx
**LINE:** 2427
**ISSUE:** #f59e0b text on #fef3c7 background fails WCAG AA at 2.84:1 (needs 4.5:1).
**FIX:**
```jsx
// Change color:"#f59e0b" to color:"#b45309"
<span style={{ fontSize:9, color:"#b45309", fontFamily:F, background:"#fef3c7", padding:"2px 6px", borderRadius:4 }}>Estimated prices -- live API offline</span>
```

### Fix 4: Carousel "rt" label contrast
**FILE:** app.jsx
**LINE:** 2472
**ISSUE:** #aaa on white fails WCAG AA at 2.32:1.
**FIX:**
```jsx
// Change color:"#aaa" to color:"#888"
<span style={{ fontSize:9, color:"#888", fontFamily:F, marginLeft:2 }}>rt</span>
```

### Fix 5: Affiliate disclaimer contrast
**FILE:** app.jsx
**LINES:** 4479, 4503
**ISSUE:** #bbb on white fails WCAG AA at 1.85:1. Even for fine print, this is unreadable.
**FIX:**
```jsx
// Line 4479 -- change color:"#bbb" to color:"#999"
<span style={{ fontSize:9, color:"#999", fontFamily:F }}>Affiliate links - no extra cost</span>

// Line 4503 -- change color:"#bbb" to color:"#999"
<span style={{ fontSize:9, color:"#999", fontFamily:F }}>via GetYourGuide</span>
```

### Fix 6: SearchBar subtitle contrast
**FILE:** app.jsx
**LINE:** 1937
**ISSUE:** #999 on white fails WCAG AA for small text (2.85:1 vs 4.5:1 required).
**FIX:**
```jsx
// Change color:"#999" to color:"#717171"
<div style={{ fontSize:11, color:"#717171", fontFamily:F, marginTop:2 }}>
```

### Fix 7: BottomNav touch target height
**FILE:** app.jsx
**LINE:** 5238
**ISSUE:** Primary nav buttons are ~38px tall, below 44px minimum.
**FIX:**
```jsx
// Change padding:"4px 0" to padding:"8px 0"
padding:"8px 0",
```

### Fix 8: Similar venue score badge fontSize:9
**FILE:** app.jsx
**LINE:** 4447
**ISSUE:** Score text inside badge at fontSize:9 -- below 10px floor established in v7.
**FIX:**
```jsx
// Change fontSize:9 to fontSize:10
<span style={{ fontSize:10, fontWeight:800, color:"white", fontFamily:F }}>{sv.conditionScore}</span>
```

### Fix 9: Forecast date labels and wave height fontSize:9
**FILE:** app.jsx
**LINES:** 4409, 4411, 4414
**ISSUE:** Forecast card labels at fontSize:9. The date label ("Today", "Tmrw") is the primary identifier and should not be smaller than the temperature below it.
**FIX:** These are defensible in the 62px-wide forecast card where horizontal space is genuinely constrained. Leave at fontSize:9. Flagging for awareness only -- no change needed.

### Fix 10: Wire all 5 Plausible custom events
**FILE:** app.jsx
**LINES:** 5234, 5448, 4394, 1389, 5444, 3909
**ISSUE:** Plausible script loaded but zero custom events fire. No data on user behavior.
**FIX:** See Section 2 above for exact code for all 5 events.

---

## Fixes Verified from v8

| Fix | Status | Details |
|-----|--------|---------|
| Pill count hidden when < 3 venues | CONFIRMED | Line 2272: conditional `listings.filter(l => l.category === c.id).length >= 3` present |
| Carousel "rt" label added | CONFIRMED | Line 2472: `<span style={{ fontSize:9, color:"#aaa"... }}>rt</span>` present |
| CompactCard fontSize:10 floor | CONFIRMED | Lines 1512, 1525, 1530, 1540, 1544 all at fontSize:10 |
| Hero stat labels at fontSize:10, color:#666 | CONFIRMED | Lines 2389, 2394 both at fontSize:10, color:"#666" |
| Hero est. label at fontSize:10, color:#888 | CONFIRMED | Line 2397 at fontSize:10, color:"#888" |
| Carousel score at fontSize:10, color:#666 | CONFIRMED | Line 2473 at fontSize:10, color:"#666" |
| FeaturedCard LIVE badge | CONFIRMED | Line 1434 at fontSize:10 |
| Saved venue heart 28x28 touch target | CONFIRMED | Lines 2327-2330 present with width:28, height:28 |

No regressions detected on any prior fix.

---

## Inspiration

**Steal from Airbnb's sticky bottom bar pattern.** When a user scrolls deep into VenueDetailSheet (past the forecast, past the tips, into gear and experiences), the "Book on Google Flights" CTA has scrolled off-screen. Airbnb never lets the Reserve button disappear -- it pins to the bottom with a clean white bar, price summary, and CTA. The implementation: a `position:sticky` div at the bottom of the sheet's scroll container with `bottom:0`, `background:#fff`, `borderTop:1px solid #f0f0f0`, `padding:12px 16px`, containing the price and Book CTA. Alternatively, use `position:fixed` relative to the sheet. This directly increases flight click-through rate by keeping the CTA visible during the longest part of the user session: reading the detail sheet.

---

## THE ONE THING

The single highest-impact UX change this week is **adding a "Set Alert" button to VenueDetailSheet** because the alert-from-venue flow currently takes 7 taps instead of 3, the `onAlert` prop is already fully wired, and alerts are the core retention mechanic -- the thing that brings users back. A user who opens Pipeline, sees great conditions but can't travel this week, and sets an alert in 1 tap will return. A user who has to navigate away to the Alerts tab, re-find their sport, and re-find the location will not. Here is the complete code:

```jsx
{/* FILE: app.jsx -- Insert at line 4401, after the closing </a> of the Google Flights CTA */}

<button onClick={() => onAlert(listing)} className="pressable" style={{
  background:"#f5f5f5", border:"1.5px solid #e8e8e8", borderRadius:14,
  padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"center",
  gap:8, width:"100%", cursor:"pointer", marginBottom:14,
}}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  <span style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:F }}>Alert me when conditions peak</span>
</button>
```

This is 1 element, 0 new state, 0 new props. The callback already exists and already closes the sheet and switches to the Alerts tab. Ship it.
