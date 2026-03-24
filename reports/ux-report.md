# Peakly UX Audit — Report: 2026-03-24 (v6)

## Design Score: 8.1/10

Holding at 8.1. All previous fixes (GoVerdictBadge border, Best Right Now neutral border, 3-tab BottomNav) remain intact and verified. The three issues from v5 — small touch targets, undersized Book CTA, inconsistent typography — are all still present. No regressions, no new issues, but no progress on the punch list either. Fixing the three items below gets this to 9.

---

## Fixes Verified

| Fix | Location | Status | Details |
|-----|----------|--------|---------|
| GoVerdictBadge `border:"none"` | Line 1204 | CONFIRMED | Clean badge, no stray border artifacts |
| Best Right Now card `border:"1.5px solid #f0f0f0"` | Line 2395 | CONFIRMED | Neutral border, no score-colored noise |
| BottomNav 3 tabs only | Lines 5082-5086 | CONFIRMED | Explore, Alerts, Profile — clean SVG icons |
| Photo rendering (objectFit:"cover") | Lines 1256, 1362, 1427, 2399 | CONFIRMED | All card types use absolute positioning + cover fill — no stretching or letterboxing |
| Card border-radius consistency | Lines 1252, 1355, 1423 | CONFIRMED | ListingCard 16, FeaturedCard 20, CompactCard 12 — proportional to card size, reads well |
| Animation quality | Lines 101-126 | CONFIRMED | bounceIn 0.22s, fadeIn 0.2s, sheetUp, pillPop all use ease-out — snappy, no jank |

All previously shipped fixes remain live and correct.

---

## Top 3 Remaining Issues

### 1. CompactCard and Best Right Now heart buttons have dangerously small touch targets (Lines 1440-1443, 2402-2405)

CompactCard heart: `fontSize:13`, no explicit width/height, no padding. Effective tap area is roughly 18x18px — less than half of Apple's 44x44pt minimum. Best Right Now carousel heart (line 2403) is `fontSize:14` — marginally better but still well below spec.

ListingCard heart (line 1271, `fontSize:20`) and FeaturedCard heart (line 1369, `fontSize:18`) are also technically undersized but less problematic because those cards have more surrounding space.

**Suggested fix:** On all four heart buttons, add `width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center"` to create an invisible hit zone. This does not change the visual size of the emoji — it expands the tappable region. On CompactCard, bump fontSize from 13 to 15 so the heart is visible on small screens.

Specific lines to edit:
- Line 1270-1271 (ListingCard): add `width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center"`
- Line 1369 (FeaturedCard): same
- Line 1440-1442 (CompactCard): same, plus change `fontSize:13` to `fontSize:15`
- Line 2402-2404 (Best Right Now): same

**Severity:** High — causes mis-taps on the most common interaction in the app.

---

### 2. "Book" flight CTA is undersized on ListingCard and FeaturedCard (Lines 1337-1343, 1406)

ListingCard Book button: `padding:"5px 10px"`, `fontSize:10`. Effective height ~28-30px. FeaturedCard Book button: `padding:"5px 12px"`, `fontSize:11`. Both are too small for the primary revenue action. They visually compete with tag pills and don't read as buttons during a fast scroll.

**Suggested fix:** On both cards, increase to `padding:"8px 14px"`, set `fontSize:11` (ListingCard) or keep `fontSize:11` (FeaturedCard), and add `minHeight:36`. This makes the CTA feel intentional and meets minimum touch target guidance without overwhelming the card layout. The gradient background already differentiates it from pills — just give it room.

Specific lines to edit:
- Line 1339: change `padding:"5px 10px"` to `padding:"8px 14px"`, add `minHeight:36`
- Line 1341-1342: change `fontSize:10` to `fontSize:11` (both the emoji and "Book" text)
- Line 1406: change `padding:"5px 12px"` to `padding:"8px 14px"`, add `minHeight:36`

**Severity:** High — this is the money button. Undersized CTA directly costs conversions.

---

### 3. Section header typography has no consistent scale (Multiple lines)

Current state — still unchanged from v5:

| Section | fontSize | fontWeight | Location | Should Be |
|---------|----------|------------|----------|-----------|
| "Alerts" (page title) | 24 | 900 | Line 2865 | 24 (correct) |
| "Create Alert" (page title) | 22 | 900 | Line 2688 | 24 |
| "Wishlists" (page title) | 22 | 900 | Line 2533 | 24 |
| "Build a Trip with AI" (sheet title) | 22 | 900 | Line 4696 | 22 (correct) |
| "Plan a trip" (sheet title) | 20 | 900 | Line 1597 | 22 |
| "All experiences" (section header) | 18 | 800 | Line 2424 | 18 (correct) |
| "Best Right Now" (section header) | 16 | 900 | Line 2378 | 18 |

Proposed 3-level type scale:
- **Page title** (top of each tab): `fontSize:24, fontWeight:900`
- **Sheet title** (top of overlays): `fontSize:22, fontWeight:900`
- **Section header** (within a page): `fontSize:18, fontWeight:800`

Four lines need changing:
- Line 2688: `fontSize:22` to `fontSize:24` ("Create Alert" is a page title)
- Line 2533: `fontSize:22` to `fontSize:24` ("Wishlists" is a page title)
- Line 1597: `fontSize:20` to `fontSize:22` ("Plan a trip" is a sheet title)
- Line 2378: `fontSize:16` to `fontSize:18` ("Best Right Now" is a section header)

**Severity:** Medium — polish issue. Fixing this creates hierarchy coherence across the entire app and is the difference between "good" and "premium."

---

## Suggested Code Fixes (descriptions only, no code changes made)

1. **Touch targets:** Add explicit width/height 36px with flexbox centering to all heart buttons across 4 locations. Bump CompactCard heart fontSize from 13 to 15.
2. **Book CTA:** Increase padding to `8px 14px` and add `minHeight:36` on both ListingCard and FeaturedCard Book buttons. Normalize both to `fontSize:11`.
3. **Type scale:** Change 4 fontSize values to enforce a 24/22/18 hierarchy across page titles, sheet titles, and section headers.

Total lines to touch: ~12. No structural changes. No new components. Pure CSS-in-JS property tweaks.

---

## Inspiration

**Steal from Airbnb's card hierarchy.** Airbnb uses exactly 3 card sizes (full-width hero, medium horizontal scroll, compact grid) — identical to Peakly's ListingCard/FeaturedCard/CompactCard architecture. The key difference: Airbnb makes the primary action (heart, price) a minimum 44pt touch target on every card size, including their smallest format. They achieve this with invisible padding expansion, not by making the icon bigger. Peakly should do the same — the visual design is already strong, but the interaction design is leaving usability on the table.

---

## Decision Made

**Ship touch targets and Book CTA together as one commit.** These are both "interaction sizing" fixes that affect the same components, touch the same lines, and solve the same class of problem (undersized tap zones). The type scale fix is a separate concern and can ship independently. Priority order: (1) touch targets + Book CTA, (2) type scale. All three issues are well-defined with exact line numbers — no ambiguity, no design decisions needed, just execution.
