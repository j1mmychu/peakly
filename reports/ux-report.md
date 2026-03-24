# Peakly UX Audit — Report: 2026-03-23 (v5)

## Design Score: 8.1/10

Up from 7.2. The score-colored borders are gone, GoVerdictBadge has `border:"none"`, Best Right Now cards use a neutral `#f0f0f0` border, and BottomNav is correctly trimmed to 3 tabs (Explore, Alerts, Profile). The app now reads as a travel product, not a dashboard. Three issues remain before hitting 9.

---

## Fixes Verified

| Fix | Location | Status | Details |
|-----|----------|--------|---------|
| GoVerdictBadge `border:"none"` | Line 1204 | CONFIRMED | Clean badge, no stray border artifacts |
| Best Right Now card `border:"1.5px solid #f0f0f0"` | Line 2395 | CONFIRMED | Neutral border, no score-colored noise |
| BottomNav 3 tabs only | Lines 5082-5086 | CONFIRMED | Explore, Alerts, Profile — no Guides tab |
| Cache-busting on app.jsx | index.html | N/A (not re-checked this pass) | Previously verified |

All requested fixes are live and correct.

---

## Top 3 Remaining Issues

### 1. CompactCard heart button has a dangerously small touch target (Line 1440-1443)

The heart button on CompactCard uses `fontSize:13` with no explicit width/height and no padding. The actual tappable area is roughly 18x18px — well below Apple's 44x44pt minimum. On a 3-column grid where cards are small and packed together, users will frequently miss the heart and tap the card instead, or accidentally dismiss/open the wrong thing.

Compare: ListingCard heart is `fontSize:20` (line 1271) and FeaturedCard heart is `fontSize:18` (line 1369) — both still below 44pt but less problematic because those cards are larger and the button sits in more open space.

**Suggested fix:** Add explicit `width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center"` to all heart buttons. This creates a generous invisible tap zone around the emoji without changing visual size. On CompactCard specifically, bump fontSize from 13 to 15 so the heart is actually visible.

**Severity:** High — directly causes mis-taps and frustration on the most common card layout.

---

### 2. "Book" flight CTA on ListingCard is undersized at 30px tall (Lines 1337-1343)

The Book button uses `padding:"5px 10px"` with `fontSize:10`, resulting in an effective height of roughly 28-30px. For the primary revenue-generating action in the app, this button is too small and too subtle. It competes visually with the tags row above it, and on a quick scroll it doesn't read as a button at all — it looks like another tag/pill.

The hero card CTA ("View Details") at line 2349 gets it right: `padding:"10px 0"` with `fontSize:12` on a full-width button. The Book button should inherit that confidence.

**Suggested fix:** Increase to `padding:"8px 14px"`, bump `fontSize` to 11, and add `minHeight:36`. This makes the CTA feel intentional and tappable without overwhelming the card. The gradient background already differentiates it from tags — just give it room to breathe.

**Severity:** High — this is the money button. Every pixel of friction here costs conversions.

---

### 3. Section header typography is inconsistent across the Explore tab (Lines 2378, 2533, 2865)

Section headers use different sizes with no clear hierarchy:

| Section | fontSize | Location |
|---------|----------|----------|
| "Best Right Now" | 16 | Line 2378 |
| "Plan a trip" | 20 | Line 1597 |
| "Wishlists" | 22 | Line 2533 |
| "Alerts" (page title) | 24 | Line 2865 |
| "Build a Trip with AI" | 22 | Line 4696 |
| Wishlist list name | 18 | Line 2507 |

There's no type scale. Page titles vary between 22-24. Section headers within a page range from 16-20. This creates subtle visual confusion — the user can't tell at a glance what level of the hierarchy they're looking at.

**Suggested fix:** Establish a 3-level type scale and apply it consistently:
- **Page title** (top of each tab): `fontSize:24, fontWeight:900`
- **Section header** (within a page): `fontSize:18, fontWeight:900`
- **Subsection / card title**: `fontSize:14, fontWeight:700`

"Best Right Now" should be 18 (section within Explore), not 16. "Plan a trip" should be 18, not 20. This is a small change per line but creates coherence across the whole app.

**Severity:** Medium — polish issue that separates "good" from "premium" feel.

---

## Inspiration

**Steal from Flighty: the confidence hierarchy.** Flighty uses exactly 3 font sizes for its entire app — a page title, a section label, and body text. Every screen feels like the same product because the type scale is ruthlessly consistent. Peakly currently uses 12+ distinct fontSize values (9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24). Collapsing to 5-6 intentional sizes would make the app feel designed rather than assembled. Start with the section headers — that's where inconsistency is most visible during a scroll.

---

## Decision Made

**Touch targets are the priority.** The heart and Book buttons are the two most frequent interactions in Peakly. Both are undersized. Fixing these before any visual polish work is the correct order — usability before aesthetics. The type scale cleanup is real but lower urgency since it doesn't block any user action. Ship touch targets first, type scale second.
