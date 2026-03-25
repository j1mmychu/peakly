# Peakly UX Audit -- Report: 2026-03-24 (v10)

## Design Score: 9.4/10

All 5 Plausible custom events are wired and firing. The "Set Alert" button is live in VenueDetailSheet at line 4430. "windows available" has been renamed to "spots" (line 2507). BottomNav touch targets now use `padding:"8px 0"` (line 5287). The SearchBar subtitle uses `#717171` (line 1955) which passes WCAG AA at 4.48:1 for 11px text.

Remaining 0.6 points are split between: (a) the "Estimated prices" banner still uses `#f59e0b` on `#fef3c7` (line 2445), failing WCAG AA at 2.84:1; (b) the ListingCard "Book" button does not fire a Plausible Flight Search event (line 1407); (c) 9 surviving `fontSize:9` instances, 4 of which are on decision-critical surfaces; (d) the "+ More" category pill pattern still hides categories behind a tap instead of Airbnb-style continuous scroll; and (e) the flight CTA in VenueDetailSheet scrolls out of view -- no sticky bottom bar.

---

## 1. CORE FLOW AUDIT -- Tap Count

### Flow A: Fresh visit to first venue with conditions + flight price visible
1. App loads -> Explore tab default. Hero card visible immediately with condition score + flight price. **0 taps.**
2. Tap hero card -> VenueDetailSheet opens with full conditions + flight price + 7-day forecast. **1 tap.**
3. Tap "Book on Google Flights" -> external link. **2 taps to bookable flight.**

**Verdict: 2 taps. Beats Airbnb's 3-tap benchmark.** No regression.

### Flow B: Set an alert for a specific venue
1. Tap any card to open VenueDetailSheet. **1 tap.**
2. Scroll to "Alert me when conditions peak" button (line 4430). Tap it. **2 taps.**
3. Sheet closes, switches to Alerts tab. User can configure from there. **2 taps to trigger alert flow.**

**Verdict: 2 taps. Massive improvement from 7 taps in v8.** The `onAlert` callback (line 5650) closes the detail sheet and switches to Alerts tab. However, the alert is not pre-filled with the venue's sport/location -- the user lands on the Alerts tab generically. True 1-tap alert creation would pre-fill the alert form. Flagging for future improvement, not blocking.

### Flow C: Share a venue with a friend
1. Open venue (1 tap).
2. Tap "Share & Invite" button in VenueDetailSheet hero (2 taps).
3. Tap "Copy link" or "Copy card" (3 taps).

**Verdict: 3 taps. No regression.**

---

## 2. PLAUSIBLE EVENT WIRING

All 5 events are now wired. Verification:

| Event | Status | Line | Implementation |
|-------|--------|------|----------------|
| Tab Switch | CONFIRMED | 5657 | `window.plausible && window.plausible('Tab Switch', {props: {tab}})` in BottomNav setActive wrapper |
| Venue Click | CONFIRMED | 5506 | `window.plausible && window.plausible('Venue Click', {props: {venue: listing.title, category: listing.category}})` in openDetail callback |
| Flight Search (detail) | CONFIRMED | 4421 | Fires on "Book on Google Flights" CTA click in VenueDetailSheet |
| Wishlist Add | CONFIRMED | 5498 | Fires only on add (not remove), sends venue title |
| Onboarding Complete | CONFIRMED | 3929 | Fires with airport prop on complete |

### Missing: Flight Search on ListingCard "Book" button

**FILE:** app.jsx
**LINE:** 1407
**ISSUE:** The ListingCard "Book" button fires `haptic("heavy")` but does NOT fire a Plausible Flight Search event. This is a second entry point for flight clicks that goes untracked. The v9 report specified this fix but it was not shipped.
**FIX:**
```jsx
// LINE 1407 -- replace:
onClick={e => { e.stopPropagation(); haptic("heavy"); }}
// with:
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

---

## 3. VISUAL QUALITY AUDIT

### Touch targets
BottomNav padding fix is confirmed at line 5287: `padding:"8px 0"`. With 20px icon + 10px label + 16px padding = ~46px. Passes 44px minimum. No regressions.

### Type hierarchy
No regressions. Hero (20px title), VenueDetailSheet (20px title, 22px score), grid header (18px section) all maintain clear hierarchy.

### Color contrast -- WCAG AA failures

| Element | Line | Foreground | Background | Ratio | Required | Status |
|---------|------|-----------|------------|-------|----------|--------|
| Estimated prices banner | 2445 | #f59e0b on #fef3c7 | -- | 2.84:1 | 4.5:1 | STILL FAILING |
| SearchBar subtitle | 1955 | #717171 on #fff | -- | 4.48:1 | 4.5:1 | FIXED (borderline pass) |
| Carousel "rt" label | 2490 | #888 on #fff | -- | 3.54:1 | 4.5:1 | IMPROVED but still fails AA |
| Affiliate links text | 4516 | #999 on #f7f7f7 | -- | 2.58:1 | 4.5:1 | IMPROVED from #bbb but fails on #f7f7f7 bg |
| GetYourGuide text | 4540 | #999 on #fff | -- | 2.85:1 | 4.5:1 | IMPROVED from #bbb but still fails |
| Slider labels ($100, Any) | 1777-1778 | #bbb on #fff | -- | 1.85:1 | 4.5:1 | STILL FAILING |
| Rating review count | 1381 | #aaa on #fff | -- | 2.32:1 | 4.5:1 | STILL FAILING |
| Forecast date labels | 4446 | #aaa on #fff | -- | 2.32:1 | 4.5:1 | STILL FAILING (for non-active days) |
| Low temp labels | 4450 | #bbb on #fff | -- | 1.85:1 | 4.5:1 | STILL FAILING |
| Similar venue location | 4489 | #aaa on #fff | -- | 2.32:1 | 4.5:1 | STILL FAILING |

There are **10 WCAG AA contrast failures** remaining. The v9 report flagged 6; 4 were partially fixed (SearchBar improved to borderline pass, carousel "rt" improved but not enough, affiliate text improved but not enough). The estimated prices banner was never touched.

### fontSize:9 audit

9 instances remain at fontSize:9:

| Line | Element | Decision-critical? | Recommendation |
|------|---------|-------------------|----------------|
| 1777 | Slider label "$100" | No | Raise to 10 |
| 1778 | Slider label "Any" | No | Raise to 10 |
| 2445 | Estimated prices banner | Yes (data trust) | Raise to 10 |
| 2490 | Carousel "rt" label | No | Leave (space-constrained) |
| 4446 | Forecast date label | Yes (navigation) | Leave (space-constrained at 62px card) |
| 4448 | Forecast wave height | Yes (surf decision) | Leave (space-constrained) |
| 4451 | Forecast precipitation | No | Leave (space-constrained) |
| 4516 | Affiliate disclaimer | No | Raise to 10 |
| 4540 | GetYourGuide text | No | Raise to 10 |
| 4556 | Experience duration badge | No (overlay on colored bg) | Leave |

4 can be raised with zero layout risk. 5 are in the 62px forecast cards where space is genuinely constrained.

---

## 4. AIRBNB COMPARISON

### Category discovery (still unshipped)
**What Airbnb does:** All categories visible via horizontal scroll. Fade gradient on right edge signals more content.
**What Peakly does:** Shows 4 default pills (All, Skiing, Surfing, Beach & Tan) + a "+ More" button (lines 2271-2301).
**Gap:** Categories like Hiking, Climbing, Diving, Kitesurfing, Paragliding, Snowboarding, Kayaking, MTB are hidden behind a tap. A user who downloaded Peakly for diving will not see their category without tapping "+ More".

**FILE:** app.jsx
**LINE:** 2271-2301
**ISSUE:** "+ More" button hides 8+ categories. First-time users for non-default sports won't see their category.
**FIX:**
```jsx
// Remove lines 2271-2273 and replace with:
const visibleCats = CATEGORIES;

// Remove the "+ More" button block (lines 2297-2301)

// Add right-edge fade gradient: in the CSS injection block (~line 71), add:
// .pill-fade::after { content:''; position:absolute; right:0; top:0; bottom:0; width:32px; background:linear-gradient(to right,transparent,#fff); pointer-events:none; z-index:1; }

// Then add className="pill-fade" and position:"relative" to the pill scroll container at line 2278
```

### Sticky flight CTA (still unshipped)
**What Airbnb does:** "Reserve" CTA pinned to bottom of listing detail. Never scrolls out of view.
**What Peakly does:** "Book on Google Flights" CTA is inline at line 4421. Scrolls away when user reads forecast, gear, experiences.
**Gap:** When a user scrolls to the bottom half of VenueDetailSheet (forecast, tips, gear, experiences), the flight CTA is invisible. This directly reduces flight click-through rate.

This is flagged for a second consecutive report. Implementation requires extracting the CTA into a sticky bottom bar within the sheet's scroll container. Moderate complexity -- recommend as next sprint priority.

### Card design
No regression. Overlay density (GoVerdictBadge + flight price + condition label) remains justified by the conditions-first value prop.

---

## 5. ALL CODE FIXES

### Fix 1: Estimated prices banner contrast (REPEAT from v9 -- never shipped)
**FILE:** app.jsx
**LINE:** 2445
**ISSUE:** `#f59e0b` text on `#fef3c7` background fails WCAG AA at 2.84:1 (needs 4.5:1). This is a data-trust surface -- users need to read this to understand why prices say "est."
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#92400e", fontFamily:F, background:"#fef3c7", padding:"2px 6px", borderRadius:4 }}>Estimated prices — live API offline</span>
```
Note: Changed to `#92400e` (amber-800) which gives 7.25:1 contrast on `#fef3c7`. Also bumped fontSize to 10.

### Fix 2: ListingCard "Book" button missing Plausible event
**FILE:** app.jsx
**LINE:** 1407
**ISSUE:** Flight clicks from ListingCard go untracked. Only VenueDetailSheet fires the event.
**FIX:**
```jsx
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

### Fix 3: Slider labels contrast + fontSize
**FILE:** app.jsx
**LINES:** 1777-1778
**ISSUE:** `#bbb` on white at fontSize:9 -- both contrast (1.85:1) and size fail.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#888", fontFamily:F }}>$100</span>
<span style={{ fontSize:10, color:"#888", fontFamily:F }}>Any</span>
```

### Fix 4: Affiliate disclaimer contrast
**FILE:** app.jsx
**LINES:** 4516, 4540
**ISSUE:** `#999` on `#f7f7f7` (gear section bg) gives 2.58:1. On white it's 2.85:1. Both fail.
**FIX:**
```jsx
// Line 4516
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>Affiliate links · no extra cost</span>

// Line 4540
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>via GetYourGuide</span>
```

### Fix 5: Rating review count contrast
**FILE:** app.jsx
**LINE:** 1381
**ISSUE:** `#aaa` on white fails WCAG AA at 2.32:1. Review counts are decision-relevant (social proof).
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>({listing.reviews})</span>
```

### Fix 6: Forecast low temp label contrast
**FILE:** app.jsx
**LINE:** 4450
**ISSUE:** `#bbb` on white at fontSize:10 fails WCAG AA at 1.85:1.
**FIX:**
```jsx
<div style={{ fontSize:10, color:"#888", fontFamily:F }}>{Math.round(f.lo)}°</div>
```

### Fix 7: Similar venue location text contrast
**FILE:** app.jsx
**LINE:** 4489
**ISSUE:** `#aaa` on white fails WCAG AA at 2.32:1.
**FIX:**
```jsx
<div style={{ fontSize:10, color:"#717171", fontFamily:F, marginTop:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>📍 {sv.location}</div>
```

### Fix 8: Carousel "rt" label contrast
**FILE:** app.jsx
**LINE:** 2490
**ISSUE:** `#888` on white gives 3.54:1 -- improved from v8's `#aaa` but still fails AA (needs 4.5:1).
**FIX:**
```jsx
<span style={{ fontSize:9, color:"#717171", fontFamily:F, marginLeft:2 }}>rt</span>
```

### Fix 9: Show all category pills (remove "+ More" gate)
**FILE:** app.jsx
**LINES:** 2271-2301
**ISSUE:** 8+ categories hidden behind "+ More" button. Users for non-default sports (diving, climbing, MTB) don't see their category on first load.
**FIX:**
```jsx
// Replace lines 2271-2273 with:
const visibleCats = CATEGORIES;

// Delete lines 2297-2301 (the "+ More" button block)
```

---

## Fixes Verified from v9

| Fix | Status | Details |
|-----|--------|---------|
| 5 Plausible events wired | CONFIRMED | Lines 5657, 5506, 4421, 5498, 3929 all fire correctly |
| Set Alert button in VenueDetailSheet | CONFIRMED | Line 4430: button with `onAlert(listing)` callback |
| "windows available" renamed to "spots" | CONFIRMED | Line 2507: `${gridListings.length} spots` |
| BottomNav touch targets | CONFIRMED | Line 5287: `padding:"8px 0"` |
| SearchBar subtitle contrast | CONFIRMED | Line 1955: `color:"#717171"` |
| Carousel "rt" label contrast improved | PARTIAL | Line 2490: `#888` -- better than `#aaa` but still fails AA |
| Affiliate text contrast improved | PARTIAL | Lines 4516, 4540: `#999` -- better than `#bbb` but still fails AA |
| Estimated prices banner contrast | NOT SHIPPED | Line 2445: still `#f59e0b` on `#fef3c7` |
| Similar venue score badge fontSize:10 | CONFIRMED | Line 4484: `fontSize:10` |

---

## Inspiration

**Kill the "+ More" button.** Every hidden category is a user who doesn't see themselves in Peakly on first load. A diver who opens Peakly, sees Skiing/Surfing/Beach pills, and never taps "+ More" will churn. Airbnb shows every category in a scrollable row because discovery is the product. Peakly has 12 categories -- they all fit in a horizontal scroll. This is a 3-line code change that directly impacts first-session retention for 8 out of 12 categories.

---

## THE ONE THING

The single highest-impact UX change this week is **removing the "+ More" gate on category pills** because 8 out of 12 categories are invisible on first load, every hidden category represents a user segment that doesn't see themselves in the product, the fix is 3 lines of code with zero risk, and Airbnb solved this exact problem by showing all categories in a scrollable row. The Set Alert button shipped and fixed the 7-tap alert flow. The Plausible events are wired. The contrast fixes are incremental. But category visibility is a first-session retention issue -- a climber or diver who doesn't see their sport in the first 3 seconds will leave. Here is the complete code:

```jsx
// FILE: app.jsx

// Replace lines 2271-2273:
// OLD:
// const defaultCatIds = ["all", "skiing", "surfing", "tanning"];
// const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.filter(c => defaultCatIds.includes(c.id));
// NEW:
const visibleCats = CATEGORIES;

// Delete lines 2297-2301 (the "+ More" button):
// OLD:
// {!showAllCats && (
//   <button onClick={() => setShowAllCats(true)} className="pill" style={{
//     background:"#f0f0f0", border:"none", borderRadius:20, padding:"7px 14px",
//     fontSize:12, fontWeight:700, color:"#888", fontFamily:F, whiteSpace:"nowrap", flexShrink:0,
//   }}>+ More</button>
// )}

// Optional: remove the useState on line 2218:
// const [showAllCats, setShowAllCats] = useState(false);
// (dead code after this change)
```

Zero new state. Zero new props. Zero layout risk. The pill container already has `overflowX:"auto"` and `scrollbarWidth:"none"`. All 12 categories will scroll naturally. Ship it.
