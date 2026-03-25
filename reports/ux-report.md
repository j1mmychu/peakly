# Peakly UX Audit -- Report: 2026-03-24 (v13)

## UX Score: 9.4/10

No code changes since v12. All issues from the previous report persist. 192 venues across 12 categories (60 Beach & Tan, 53 Surfing, 50 Skiing, 12 Hiking, 5 Diving, 4 Climbing, 4 Kitesurf, 1 each for Kayak, MTB, Fishing, Paraglide). BottomNav remains 3 tabs (Explore, Alerts, Profile). All 5 Plausible events confirmed wired and firing. File is 6,072 lines.

The remaining 0.6 points break down as: (a) 11 WCAG AA contrast failures persist -- none fixed since v10; (b) ListingCard "Book" button still does not fire a Plausible Flight Search event (line 1810); (c) 10 surviving `fontSize:9` instances, 4 on non-space-constrained surfaces; (d) "+ More" button still gates 8 categories behind a tap (line 2700); (e) flight CTA in VenueDetailSheet still scrolls out of view -- no sticky bottom bar.

---

## 1. CORE FLOW AUDIT -- Tap Count

### Flow A: Fresh visit to first venue with conditions + flight price visible
1. App loads -> Explore tab default. Hero card visible with condition score + flight price. **0 taps.**
2. Tap hero card -> VenueDetailSheet opens with full conditions + flight price + 7-day forecast. **1 tap.**
3. Tap "Book on Google Flights" -> external link. **2 taps to bookable flight.**

**Verdict: 2 taps. Beats Airbnb's 3-tap benchmark.** No regression.

### Flow B: Set an alert for a specific venue
1. Tap any card to open VenueDetailSheet. **1 tap.**
2. Scroll to "Alert me when conditions peak" button (line 4836). Tap it. **2 taps.**
3. Sheet closes, switches to Alerts tab. **2 taps to trigger alert flow.**

**Verdict: 2 taps. No regression.** Still not pre-filling the alert with venue sport/location -- flagged for future improvement.

### Flow C: Share a venue with a friend
1. Open venue (1 tap).
2. Tap "Share & Invite" button in VenueDetailSheet hero (2 taps).
3. Tap "Copy link" or "Copy card" (3 taps).

**Verdict: 3 taps. No regression.**

---

## 2. PLAUSIBLE EVENT WIRING

All 5 events confirmed wired. Plausible is the sole analytics platform.

| Event | Status | Line | Implementation |
|-------|--------|------|----------------|
| Tab Switch | CONFIRMED | 6063 | `window.plausible && window.plausible('Tab Switch', {props: {tab}})` in BottomNav setActive wrapper |
| Venue Click | CONFIRMED | 5912 | `window.plausible && window.plausible('Venue Click', {props: {venue: listing.title, category: listing.category}})` in openDetail callback |
| Flight Search (detail) | CONFIRMED | 4827 | Fires on "Book on Google Flights" CTA click in VenueDetailSheet |
| Wishlist Add | CONFIRMED | 5904 | Fires only on add (not remove), sends venue title |
| Onboarding Complete | CONFIRMED | 4332 | Fires with airport prop on complete |

### Missing: Flight Search on ListingCard "Book" button (REPEAT -- 5th consecutive report)

**FILE:** app.jsx
**LINE:** 1810
**ISSUE:** The ListingCard "Book" button fires `haptic("heavy")` but does NOT fire a Plausible Flight Search event. This is a second entry point for flight clicks that goes completely untracked.
**FIX:**
```jsx
// LINE 1810 -- replace:
onClick={e => { e.stopPropagation(); haptic("heavy"); }}
// with:
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

---

## 3. VISUAL QUALITY AUDIT

### Touch targets
BottomNav padding confirmed at line 5693: `padding:"8px 0"`. With 20px icon + 10px label + 16px padding = ~46px. Passes 44px minimum. No regressions.

### Type hierarchy
No regressions. Hero (20px title), VenueDetailSheet (20px title, 22px score), grid header (18px section) all maintain clear hierarchy.

### Color contrast -- WCAG AA failures

**None of the 11 failures have been fixed.** This is now the 5th consecutive report flagging the original 10. Full inventory:

| # | Element | Line | Foreground | Background | Ratio | Required | Status |
|---|---------|------|-----------|------------|-------|----------|--------|
| 1 | Estimated prices banner text | 2848 | #f59e0b | #fef3c7 | 2.84:1 | 4.5:1 | FAILING (5 reports) |
| 2 | Search filter slider "$100" | 2180 | #bbb | #fff | 1.85:1 | 4.5:1 | FAILING (5 reports) |
| 3 | Search filter slider "Any" | 2181 | #bbb | #fff | 1.85:1 | 4.5:1 | FAILING (5 reports) |
| 4 | Rating review count (ListingCard) | 1781 | #aaa | #fff | 2.32:1 | 4.5:1 | FAILING (5 reports) |
| 5 | Carousel "rt" label | 2893 | #888 | #fff | 3.54:1 | 4.5:1 | FAILING |
| 6 | Affiliate disclaimer text | 4922 | #999 | #f7f7f7 | 2.58:1 | 4.5:1 | FAILING (5 reports) |
| 7 | GetYourGuide text | 4946 | #999 | #fff | 2.85:1 | 4.5:1 | FAILING (5 reports) |
| 8 | Forecast date labels (non-active) | 4852 | #aaa | #f7f7f7 | 2.06:1 | 4.5:1 | FAILING |
| 9 | Forecast low temp | 4856 | #bbb | #f7f7f7 | 1.64:1 | 4.5:1 | FAILING (5 reports) |
| 10 | Similar venue location | 4895 | #aaa | #fff | 2.32:1 | 4.5:1 | FAILING (5 reports) |
| 11 | "Updated" timestamp | 2850 | #bbb | #f5f5f5 | ~1.6:1 | 4.5:1 | FAILING (2 reports) |

### fontSize:9 audit

10 instances remain at fontSize:9. One new instance found at line 4962 (experience duration badge). No other changes from v12.

| Line | Element | Decision-critical? | Recommendation |
|------|---------|-------------------|----------------|
| 2180 | Slider label "$100" | No | Raise to 10, fix color |
| 2181 | Slider label "Any" | No | Raise to 10, fix color |
| 2848 | Estimated prices banner | Yes (data trust) | Raise to 10, fix color |
| 2893 | Carousel "rt" label | No | Leave (space-constrained) |
| 4852 | Forecast date label | Yes (navigation) | Leave (space-constrained at 62px card) |
| 4854 | Forecast wave height | Yes (surf decision) | Leave (space-constrained) |
| 4857 | Forecast precipitation | No | Leave (space-constrained) |
| 4922 | Affiliate disclaimer | No | Raise to 10, fix color |
| 4946 | GetYourGuide text | No | Raise to 10, fix color |
| 4962 | Experience duration badge | No | Leave (overlay badge, white on dark bg, legible) |

4 can be raised with zero layout risk. 6 are in space-constrained contexts or overlays where the current size is acceptable.

---

## 4. AIRBNB COMPARISON

### Category discovery (UNSHIPPED -- 5th consecutive report)
**What Airbnb does:** All categories visible via horizontal scroll. Fade gradient on right edge signals more content.
**What Peakly does:** Shows 4 default pills (All, Skiing, Surfing, Beach & Tan) + a "+ More" button (lines 2674-2704).
**Gap:** 8 categories hidden behind a tap. Users who downloaded Peakly for Diving (5 venues), Climbing (4), Kitesurf (4), or Hiking (12) will not see their sport without tapping "+ More". The pill bar already scrolls horizontally -- there is no layout reason to hide them.

### Sticky flight CTA (UNSHIPPED -- 5th consecutive report)
**What Airbnb does:** "Reserve" CTA pinned to bottom of listing detail. Never scrolls out of view.
**What Peakly does:** "Book on Google Flights" CTA is inline at line 4827. Scrolls away when user reads forecast, gear, experiences.
**Gap:** When a user scrolls to the bottom half of VenueDetailSheet (forecast, tips, gear, experiences), the flight CTA is invisible. This directly reduces flight click-through rate -- the single most important revenue action.

### BottomNav: 3 tabs vs 5 built
**What Airbnb does:** 5 bottom tabs (Explore, Wishlists, Trips, Inbox, Profile). Every major feature has a dedicated tab.
**What Peakly does:** 3 tabs (Explore, Alerts, Profile). Wishlists and Trips are fully built but hidden (line 5677: tabs array only contains explore, alerts, profile).
**Gap:** Users cannot discover Wishlists or Trips unless they stumble into them. Two fully built features are invisible. Note: CLAUDE.md states "Keep 3-tab bottom nav" as a design decision -- Trips + Wishlists deferred to 1K users. This is intentional, not a bug.

### Venue distribution imbalance (2nd report)
**What Airbnb does:** Each category has substantial depth. You don't open "Camping" and find 1 listing.
**What Peakly does:** 4 categories have exactly 1 venue (Kayak, MTB, Fishing, Paraglide). These feel like abandoned sections.
**Gap:** A user filtering to Paraglide or Fishing sees exactly 1 result. This damages trust. Either add more venues (minimum 5-8 each) or hide categories with fewer than 3 venues from the pill bar until they have enough content. Showing an empty-looking category is worse than not showing it.

---

## 5. ALL CODE FIXES

### Fix 1: Estimated prices banner contrast (REPEAT x5 -- never shipped)
**FILE:** app.jsx
**LINE:** 2848
**ISSUE:** `#f59e0b` text on `#fef3c7` background fails WCAG AA at 2.84:1 (needs 4.5:1). This is a data-trust surface.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#92400e", fontFamily:F, background:"#fef3c7", padding:"2px 6px", borderRadius:4 }}>Estimated prices — live API offline</span>
```
Changed to `#92400e` (amber-800) giving 7.25:1 contrast on `#fef3c7`. Bumped fontSize to 10.

### Fix 2: ListingCard "Book" button missing Plausible event (REPEAT x5)
**FILE:** app.jsx
**LINE:** 1810
**ISSUE:** Flight clicks from ListingCard go untracked. Only VenueDetailSheet fires the event.
**FIX:**
```jsx
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

### Fix 3: Slider labels contrast + fontSize
**FILE:** app.jsx
**LINES:** 2180-2181
**ISSUE:** `#bbb` on white at fontSize:9 -- both contrast (1.85:1) and size fail.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#888", fontFamily:F }}>$100</span>
<span style={{ fontSize:10, color:"#888", fontFamily:F }}>Any</span>
```

### Fix 4: Rating review count contrast
**FILE:** app.jsx
**LINE:** 1781
**ISSUE:** `#aaa` on white fails WCAG AA at 2.32:1. Review counts are social proof.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>({listing.reviews})</span>
```

### Fix 5: Affiliate disclaimer contrast + fontSize
**FILE:** app.jsx
**LINES:** 4922, 4946
**ISSUE:** `#999` on `#f7f7f7` gives 2.58:1. On white it's 2.85:1. Both fail.
**FIX:**
```jsx
// Line 4922
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>Affiliate links · no extra cost</span>

// Line 4946
<span style={{ fontSize:10, color:"#717171", fontFamily:F }}>via GetYourGuide</span>
```

### Fix 6: Forecast low temp label contrast
**FILE:** app.jsx
**LINE:** 4856
**ISSUE:** `#bbb` on `#f7f7f7` at fontSize:10 fails WCAG AA at 1.64:1.
**FIX:**
```jsx
<div style={{ fontSize:10, color:"#888", fontFamily:F }}>{Math.round(f.lo)}°</div>
```

### Fix 7: Similar venue location text contrast
**FILE:** app.jsx
**LINE:** 4895
**ISSUE:** `#aaa` on white fails WCAG AA at 2.32:1.
**FIX:**
```jsx
<div style={{ fontSize:10, color:"#717171", fontFamily:F, marginTop:2, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>📍 {sv.location}</div>
```

### Fix 8: Carousel "rt" label contrast
**FILE:** app.jsx
**LINE:** 2893
**ISSUE:** `#888` on white gives 3.54:1 -- still fails AA (needs 4.5:1).
**FIX:**
```jsx
<span style={{ fontSize:9, color:"#717171", fontFamily:F, marginLeft:2 }}>rt</span>
```

### Fix 9: Forecast date label contrast (non-active days)
**FILE:** app.jsx
**LINE:** 4852
**ISSUE:** `#aaa` on `#f7f7f7` gives 2.06:1. Users need to read dates to select forecast days.
**FIX:**
```jsx
<div style={{ fontSize:9, fontWeight:700, color: i===0?"#0284c7":"#717171", fontFamily:F, marginBottom:3, textTransform:"uppercase" }}>{fmtDate(f.date, i)}</div>
```

### Fix 10: "Updated" timestamp contrast
**FILE:** app.jsx
**LINE:** 2850
**ISSUE:** `#bbb` on `#f5f5f5` gives approximately 1.6:1 contrast ratio. Nearly invisible on some screens.
**FIX:**
```jsx
<span style={{ fontSize:10, color:"#888", fontFamily:F }}>Updated {timeAgo}</span>
```

### Fix 11: Show all category pills (remove "+ More" gate)
**FILE:** app.jsx
**LINES:** 2674-2704
**ISSUE:** 8+ categories hidden behind "+ More" button. Users for non-default sports don't see their category on first load.
**FIX:**
```jsx
// Replace lines 2674-2676:
// OLD:
// const defaultCatIds = ["all", "skiing", "surfing", "tanning"];
// const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.filter(c => defaultCatIds.includes(c.id));
// NEW:
const visibleCats = CATEGORIES;

// Delete lines 2700-2704 (the "+ More" button):
// OLD:
// {!showAllCats && (
//   <button onClick={() => setShowAllCats(true)} className="pill" style={{...}}>+ More</button>
// )}

// Optional: remove dead state on line 2621:
// const [showAllCats, setShowAllCats] = useState(false);
```

---

## 6. Fixes Verified Since v12

| Fix | Status | Details |
|-----|--------|---------|
| VPS proxy HTTPS | CONFIRMED | peakly-api.duckdns.org via Caddy + Let's Encrypt |
| PWA manifest added | CONFIRMED | manifest.json + sw.js + apple-mobile-web-app meta |
| 5 Plausible events wired | CONFIRMED | Lines 6063, 5912, 4827, 5904, 4332 |
| Set Alert button in VenueDetailSheet | CONFIRMED | Line 4836 |
| BottomNav touch targets | CONFIRMED | Line 5693: `padding:"8px 0"` |
| Venue trim to 192 with unique photos | CONFIRMED | All venues have `photo:` field with Unsplash URLs |
| Estimated prices banner contrast | NOT SHIPPED (5 reports) | Line 2848: still `#f59e0b` on `#fef3c7` |
| ListingCard Flight Search event | NOT SHIPPED (5 reports) | Line 1810: still no plausible call |
| Category pills "+ More" removal | NOT SHIPPED (5 reports) | Line 2700: still gated |
| Sticky flight CTA | NOT SHIPPED (5 reports) | Line 4827: still inline, scrolls away |
| WCAG contrast fixes (11 items) | NOT SHIPPED | Zero contrast fixes applied across 5 report cycles |

---

## Escalation Notice

11 contrast failures, 1 missing analytics event, and 1 category discoverability fix have now been flagged for **5 consecutive audit cycles** with zero action. These are all single-line color value changes. Combined implementation time: under 15 minutes. None carry layout risk. None require design review. If these are intentionally deprioritized, this report will stop flagging them. Otherwise, they should be batched and shipped in one commit.

---

## THE ONE THING

The single highest-impact UX change this week is **adding the Plausible Flight Search event to the ListingCard "Book" button** because flight clicks are Peakly's primary revenue action (Travelpayouts affiliate), the ListingCard Book button is the most prominent flight CTA in the app (visible on every card in the grid without opening a detail sheet), and without tracking this click you are flying blind on your most important conversion metric. Every other flight-related decision -- pricing display, CTA color, button copy, card layout -- depends on knowing how many users tap this button vs the detail sheet CTA. You cannot optimize what you cannot measure. Here is the complete code:

```jsx
// FILE: app.jsx
// LINE: 1810

// REPLACE:
onClick={e => { e.stopPropagation(); haptic("heavy"); }}

// WITH:
onClick={e => { e.stopPropagation(); haptic("heavy"); window.plausible && window.plausible('Flight Search', {props: {venue: listing.title, origin: listing.flight.from}}); }}
```

One line. Zero risk. Immediately starts collecting data on your highest-value user action. Ship it.
