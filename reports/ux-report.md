# Peakly UX Audit -- Report: 2026-03-24 (v11)

## UX Score: 9.4/10

The VPS proxy is fixed (HTTPS via Caddy), PWA manifest is added, and GA4 has been removed. All 5 Plausible custom events remain wired and firing. The Set Alert button is live in VenueDetailSheet (line 5118). BottomNav touch targets pass 44px minimum (line 5975: `padding:"8px 0"`).

The remaining 0.6 points break down as: (a) 10 WCAG AA contrast failures persist -- none were fixed since v10; (b) ListingCard "Book" button still does not fire a Plausible Flight Search event (line 2092); (c) 9 surviving `fontSize:9` instances, 4 on non-space-constrained surfaces; (d) "+ More" button still gates 8 categories behind a tap (line 2982); (e) flight CTA in VenueDetailSheet still scrolls out of view -- no sticky bottom bar.

No regressions from the VPS proxy fix, PWA manifest addition, or GA4 removal. Score holds at 9.4.

---

## 1. CORE FLOW AUDIT -- Tap Count

### Flow A: Fresh visit to first venue with conditions + flight price visible
1. App loads -> Explore tab default. Hero card visible with condition score + flight price. **0 taps.**
2. Tap hero card -> VenueDetailSheet opens with full conditions + flight price + 7-day forecast. **1 tap.**
3. Tap "Book on Google Flights" -> external link. **2 taps to bookable flight.**

**Verdict: 2 taps. Beats Airbnb's 3-tap benchmark.** No regression.

### Flow B: Set an alert for a specific venue
1. Tap any card to open VenueDetailSheet. **1 tap.**
2. Scroll to "Alert me when conditions peak" button (line 5118). Tap it. **2 taps.**
3. Sheet closes, switches to Alerts tab. **2 taps to trigger alert flow.**

**Verdict: 2 taps. No regression.** Still not pre-filling the alert with venue sport/location -- flagged for future improvement.

### Flow C: Share a venue with a friend
1. Open venue (1 tap).
2. Tap "Share & Invite" button in VenueDetailSheet hero (2 taps) -- line 5053.
3. Tap "Copy link" or "Copy card" (3 taps) -- line 5073.

**Verdict: 3 taps. No regression.**

---

## 2. PLAUSIBLE EVENT WIRING

All 5 events confirmed wired. GA4 gtag.js has been removed (per recent changes). Plausible is the sole analytics platform.

| Event | Status | Line | Implementation |
|-------|--------|------|----------------|
| Tab Switch | CONFIRMED | 6345 | `window.plausible && window.plausible('Tab Switch', {props: {tab}})` in BottomNav setActive wrapper |
| Venue Click | CONFIRMED | 6194 | `window.plausible && window.plausible('Venue Click', {props: {venue: listing.title, category: listing.category}})` in openDetail callback |
| Flight Search (detail) | CONFIRMED | 5109 | Fires on "Book on Google Flights" CTA click in VenueDetailSheet |
| Wishlist Add | CONFIRMED | 6186 | Fires only on add (not remove), sends venue title |
| Onboarding Complete | CONFIRMED | 4614 | Fires with airport prop on complete |

### Missing: Flight Search on ListingCard "Book" button (REPEAT -- 3rd consecutive report)

**FILE:** app.jsx
**LINE:** 2092
**ISSUE:** The ListingCard "Book" button fires `haptic("heavy")` but does NOT fire a Plausible Flight Search event. This is a second entry point for flight clicks that goes completely untracked.
**FIX:**
```jsx
// LINE 2092 -- replace:
onClick={e => { e.stopPropagation(); haptic("heavy"); }}
// with:
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

---

## 3. VISUAL QUALITY AUDIT

### Touch targets
BottomNav padding confirmed at line 5975: `padding:"8px 0"`. With 20px icon + 10px label + 16px padding = ~46px. Passes 44px minimum. No regressions.

### Type hierarchy
No regressions. Hero (20px title), VenueDetailSheet (20px title, 22px score), grid header (18px section) all maintain clear hierarchy.

### Color contrast -- WCAG AA failures

**None of the 10 failures from v10 have been fixed.** Full inventory:

| # | Element | Line | Foreground | Background | Ratio | Required | Status |
|---|---------|------|-----------|------------|-------|----------|--------|
| 1 | Estimated prices banner text | 3130 | #f59e0b | #fef3c7 | 2.84:1 | 4.5:1 | FAILING (3 reports) |
| 2 | Search filter slider "$100" | 2462 | #bbb | #fff | 1.85:1 | 4.5:1 | FAILING (3 reports) |
| 3 | Search filter slider "Any" | 2463 | #bbb | #fff | 1.85:1 | 4.5:1 | FAILING (3 reports) |
| 4 | Rating review count (ListingCard) | 2063 | #aaa | #fff | 2.32:1 | 4.5:1 | FAILING (3 reports) |
| 5 | Carousel "rt" label | 3175 | #888 | #fff | 3.54:1 | 4.5:1 | FAILING |
| 6 | Affiliate disclaimer text | 5204 | #999 | #f7f7f7 | 2.58:1 | 4.5:1 | FAILING (3 reports) |
| 7 | GetYourGuide text | 5228 | #999 | #fff | 2.85:1 | 4.5:1 | FAILING (3 reports) |
| 8 | Forecast date labels (non-active) | 5134 | #aaa | #f7f7f7 | 2.06:1 | 4.5:1 | FAILING |
| 9 | Forecast low temp | 5138 | #bbb | #f7f7f7 | 1.64:1 | 4.5:1 | FAILING (3 reports) |
| 10 | Similar venue location | 5177 | #aaa | #fff | 2.32:1 | 4.5:1 | FAILING (3 reports) |

### fontSize:9 audit

9 instances remain at fontSize:9. No change from v10.

| Line | Element | Decision-critical? | Recommendation |
|------|---------|-------------------|----------------|
| 2462 | Slider label "$100" | No | Raise to 10, fix color |
| 2463 | Slider label "Any" | No | Raise to 10, fix color |
| 3130 | Estimated prices banner | Yes (data trust) | Raise to 10, fix color |
| 3175 | Carousel "rt" label | No | Leave (space-constrained) |
| 5134 | Forecast date label | Yes (navigation) | Leave (space-constrained at 62px card) |
| 5136 | Forecast wave height | Yes (surf decision) | Leave (space-constrained) |
| 5139 | Forecast precipitation | No | Leave (space-constrained) |
| 5204 | Affiliate disclaimer | No | Raise to 10, fix color |
| 5228 | GetYourGuide text | No | Raise to 10, fix color |

4 can be raised with zero layout risk. 5 are in the 62px forecast cards where space is genuinely constrained.

---

## 4. AIRBNB COMPARISON

### Category discovery (UNSHIPPED -- 3rd consecutive report)
**What Airbnb does:** All categories visible via horizontal scroll. Fade gradient on right edge signals more content.
**What Peakly does:** Shows 4 default pills (All, Skiing, Surfing, Beach & Tan) + a "+ More" button (lines 2956-2986).
**Gap:** Categories like Hiking, Climbing, Diving, Kitesurfing, Paragliding, Snowboarding, Kayaking, MTB are hidden behind a tap. A user who downloaded Peakly for diving will not see their category without tapping "+ More".

### Sticky flight CTA (UNSHIPPED -- 3rd consecutive report)
**What Airbnb does:** "Reserve" CTA pinned to bottom of listing detail. Never scrolls out of view.
**What Peakly does:** "Book on Google Flights" CTA is inline at line 5109. Scrolls away when user reads forecast, gear, experiences.
**Gap:** When a user scrolls to the bottom half of VenueDetailSheet (forecast, tips, gear, experiences), the flight CTA is invisible. This directly reduces flight click-through rate -- the single most important revenue action.

### BottomNav: 3 tabs vs 5 built
**What Airbnb does:** 5 bottom tabs (Explore, Wishlists, Trips, Inbox, Profile). Every major feature has a dedicated tab.
**What Peakly does:** 3 tabs (Explore, Alerts, Profile). Wishlists and Trips are fully built but hidden. The Guides tab was added and then apparently removed.
**Gap:** Users cannot discover Wishlists or Trips unless they stumble into them. Two fully built features are invisible. CLAUDE.md flags this: "ACTION NEEDED: Trips and Wishlists tabs exist in the code but are not wired into BottomNav. Expose them."

---

## 5. ALL CODE FIXES

### Fix 1: Estimated prices banner contrast (REPEAT x3 -- never shipped)
**FILE:** app.jsx
**LINE:** 3130
**ISSUE:** `#f59e0b` text on `#fef3c7` background fails WCAG AA at 2.84:1 (needs 4.5:1). This is a data-trust surface.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#92400e", fontFamily:F, background:"#fef3c7", padding:"2px 6px", borderRadius:4 }}>Estimated prices — live API offline</span>
```
Changed to `#92400e` (amber-800) giving 7.25:1 contrast on `#fef3c7`. Bumped fontSize to 10.

### Fix 2: ListingCard "Book" button missing Plausible event (REPEAT x3)
**FILE:** app.jsx
**LINE:** 2092
**ISSUE:** Flight clicks from ListingCard go untracked. Only VenueDetailSheet fires the event.
**FIX:**
```jsx
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

### Fix 3: Slider labels contrast + fontSize
**FILE:** app.jsx
**LINES:** 2462-2463
**ISSUE:** `#bbb` on white at fontSize:9 -- both contrast (1.85:1) and size fail.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#888", fontFamily:F }}>$100</span>
<span style={{ fontSize:10, color:"#888", fontFamily:F }}>Any</span>
```

### Fix 4: Rating review count contrast
**FILE:** app.jsx
**LINE:** 2063
**ISSUE:** `#aaa` on white fails WCAG AA at 2.32:1. Review counts are social proof.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>({listing.reviews})</span>
```

### Fix 5: Affiliate disclaimer contrast + fontSize
**FILE:** app.jsx
**LINES:** 5204, 5228
**ISSUE:** `#999` on `#f7f7f7` gives 2.58:1. On white it's 2.85:1. Both fail.
**FIX:**
```jsx
// Line 5204
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>Affiliate links · no extra cost</span>

// Line 5228
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>via GetYourGuide</span>
```

### Fix 6: Forecast low temp label contrast
**FILE:** app.jsx
**LINE:** 5138
**ISSUE:** `#bbb` on `#f7f7f7` at fontSize:10 fails WCAG AA at 1.64:1.
**FIX:**
```jsx
<div style={{ fontSize:10, color:"#888", fontFamily:F }}>{Math.round(f.lo)}°</div>
```

### Fix 7: Similar venue location text contrast
**FILE:** app.jsx
**LINE:** 5177
**ISSUE:** `#aaa` on white fails WCAG AA at 2.32:1.
**FIX:**
```jsx
<div style={{ fontSize:10, color:"#717171", fontFamily:F, marginTop:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>📍 {sv.location}</div>
```

### Fix 8: Carousel "rt" label contrast
**FILE:** app.jsx
**LINE:** 3175
**ISSUE:** `#888` on white gives 3.54:1 -- still fails AA (needs 4.5:1).
**FIX:**
```jsx
<span style={{ fontSize:9, color:"#717171", fontFamily:F, marginLeft:2 }}>rt</span>
```

### Fix 9: Forecast date label contrast (non-active days)
**FILE:** app.jsx
**LINE:** 5134
**ISSUE:** `#aaa` on `#f7f7f7` gives 2.06:1. Users need to read dates to select forecast days.
**FIX:**
```jsx
<div style={{ fontSize:9, fontWeight:700, color: i===0?"#0284c7":"#717171", fontFamily:F, marginBottom:3, textTransform:"uppercase" }}>{fmtDate(f.date, i)}</div>
```

### Fix 10: Show all category pills (remove "+ More" gate)
**FILE:** app.jsx
**LINES:** 2956-2986
**ISSUE:** 8+ categories hidden behind "+ More" button. Users for non-default sports don't see their category on first load.
**FIX:**
```jsx
// Replace lines 2956-2958:
// OLD:
// const defaultCatIds = ["all", "skiing", "surfing", "tanning"];
// const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.filter(c => defaultCatIds.includes(c.id));
// NEW:
const visibleCats = CATEGORIES;

// Delete lines 2982-2986 (the "+ More" button):
// OLD:
// {!showAllCats && (
//   <button onClick={() => setShowAllCats(true)} ...>+ More</button>
// )}

// Optional: remove dead state on line 2903:
// const [showAllCats, setShowAllCats] = useState(false);
```

---

## 6. Fixes Verified Since v10

| Fix | Status | Details |
|-----|--------|---------|
| VPS proxy HTTPS | CONFIRMED | peakly-api.duckdns.org via Caddy + Let's Encrypt |
| PWA manifest added | CONFIRMED | manifest.json + sw.js + apple-mobile-web-app meta |
| GA4 removed | CONFIRMED | No gtag.js references found in codebase |
| 5 Plausible events wired | CONFIRMED | Lines 6345, 6194, 5109, 6186, 4614 |
| Set Alert button in VenueDetailSheet | CONFIRMED | Line 5118 |
| BottomNav touch targets | CONFIRMED | Line 5975: `padding:"8px 0"` |
| Estimated prices banner contrast | NOT SHIPPED (3 reports) | Line 3130: still `#f59e0b` on `#fef3c7` |
| ListingCard Flight Search event | NOT SHIPPED (3 reports) | Line 2092: still no plausible call |
| Category pills "+ More" removal | NOT SHIPPED (3 reports) | Line 2982: still gated |
| Sticky flight CTA | NOT SHIPPED (3 reports) | Line 5109: still inline, scrolls away |

---

## Inspiration

**Ship the contrast fixes in one batch.** Ten WCAG AA failures is a lot for an app targeting 100K users. It takes about 10 minutes to update 10 color values. Each one is a single-line change. None carry layout risk. Accessible apps rank better in app stores, convert better with older users (who spend more on adventure travel), and avoid potential legal issues under ADA/EAA. This is not a design opinion -- it is measurable, standards-based, and overdue.

---

## THE ONE THING

The single highest-impact UX change this week is **adding the Plausible Flight Search event to the ListingCard "Book" button** because flight clicks are Peakly's primary revenue action (Travelpayouts affiliate), the ListingCard Book button is the most prominent flight CTA in the app (visible on every card in the grid without opening a detail sheet), and without tracking this click you are flying blind on your most important conversion metric. Every other flight-related decision -- pricing display, CTA color, button copy, card layout -- depends on knowing how many users tap this button vs the detail sheet CTA. You cannot optimize what you cannot measure. Here is the complete code:

```jsx
// FILE: app.jsx
// LINE: 2092

// REPLACE:
onClick={e => { e.stopPropagation(); haptic("heavy"); }}

// WITH:
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

One line. Zero risk. Immediately starts collecting data on your highest-value user action. Ship it.
