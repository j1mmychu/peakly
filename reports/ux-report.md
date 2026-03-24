# Peakly UX Audit — Report: 2026-03-24 (v7)

## Design Score: 9.0/10

All three v6 issues are shipped and verified. Heart touch targets, Book CTA sizing, and typography scale are all correct. The app now has a coherent interaction layer and a clean type hierarchy. Moving from 8.1 to 9.0 in one pass. The remaining 0.5 points are polish — the kind of details that separate a good product from one that feels inevitable.

---

## Fixes Verified

| Fix | Location | Status | Details |
|-----|----------|--------|---------|
| ListingCard heart 36x36 touch target | Line 1309 | CONFIRMED | `width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center"`, fontSize:20 |
| FeaturedCard heart 36x36 touch target | Line 1415 | CONFIRMED | Same pattern, fontSize:18 |
| CompactCard heart 36x36 + fontSize bump | Lines 1488-1489 | CONFIRMED | fontSize:15 (was 13), 36x36 flexbox centering |
| Best Right Now heart 36x36 touch target | Line 2465 | CONFIRMED | fontSize:14, 36x36 flexbox centering |
| ListingCard Book CTA padding + minHeight | Line 1384 | CONFIRMED | `padding:"8px 14px", minHeight:36`, fontSize:11 on both emoji and text |
| FeaturedCard Book CTA padding + minHeight | Line 1452 | CONFIRMED | `padding:"8px 14px", minHeight:36`, fontSize:11 on both emoji and text |
| "Wishlists" page title fontSize | Line 2595 | CONFIRMED | fontSize:24, fontWeight:900 (was 22) |
| "Create Alert" page title fontSize | Line 2759 | CONFIRMED | fontSize:24, fontWeight:900 (was 22) |
| "Plan a trip" sheet title fontSize | Line 1649 | CONFIRMED | fontSize:22, fontWeight:900 (was 20) |
| "Best Right Now" section header fontSize | Line 2439 | CONFIRMED | fontSize:18, fontWeight:800 (was 16) |

All 10 property changes from v6 are live and correct. No regressions on earlier fixes (GoVerdictBadge border, Best Right Now neutral border, 3-tab BottomNav, photo rendering, card radii, animations).

---

## Top 3 NEW Issues

### 1. Saved venues inline heart button missed the touch target fix (Line 2352)

The "Saved venues" inline strip (visible when the heart-count pill is tapped on ExploreTab) renders mini venue cards at 140px wide with a heart button at `fontSize:12` and no explicit width/height. This is the only heart button in the app that did not receive the v6 touch target fix. At ~16x16px effective tap area, it is the smallest interactive element in the entire app.

This strip appears inside the ExploreTab at line 2351-2353 — a different context from the four card types, which is why it was missed.

**Suggested fix:** On line 2352, add `width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center"` to the heart button style. Use 28px instead of 36px because the card is only 140px wide and 70px tall — a 36px target would visually dominate. 28px is still a major improvement (3x the current area) and fits the compact context. Also bump fontSize from 12 to 13 for visibility.

Specific line to edit:
- Line 2352: change `position:"absolute", top:4, right:4, background:"none", border:"none", fontSize:12` to `position:"absolute", top:2, right:2, background:"none", border:"none", fontSize:13, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center"`

**Severity:** Medium — this strip only appears on user action, but when it does appear, mis-taps are guaranteed.

---

### 2. CompactCard body text is too small for comfortable reading (Lines 1503, 1512, 1516, 1521, 1531)

The CompactCard (used in the 3-column "All experiences" grid) has the tightest typographic constraints in the app. Several text elements fall below the 11px floor that makes text comfortably legible on mobile:

| Element | Current fontSize | Line | Issue |
|---------|-----------------|------|-------|
| Condition label | 9 | 1503 | Barely readable over photo gradient |
| Title | 11 | 1512 | Acceptable |
| Location | 10 | 1516 | Slightly tight |
| Peak window | 8 | 1521 | Illegible on most screens |
| LIVE badge | 8 | 1531 | Too small to convey trust |

The "Peak: Thu" line at fontSize:8 is the worst offender — it carries high-value information (the best day to go) but is rendered at a size most users will not even attempt to read. The LIVE badge at fontSize:8 has the same problem; it needs to communicate credibility and is rendered too small to do so.

**Suggested fix:** Establish an 10px floor for CompactCard text. Change:
- Line 1503: `fontSize:9` to `fontSize:10` (condition label)
- Line 1521: `fontSize:8` to `fontSize:10` (peak window — this is the most impactful change)
- Line 1531: `fontSize:8` to `fontSize:10` (LIVE badge)

Leave the title at 11 and location at 10 — those are fine. The 3-column layout can absorb these 1-2px increases without overflow because all three elements already have `overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"`.

**Severity:** Medium — affects the default "All" tab view, which is the first thing most users see. Small text erodes trust and makes the app feel like it is hiding information.

---

### 3. "Best window right now" hero card stat labels use fontSize:9 with color #888, failing WCAG contrast (Lines 2391, 2396)

The hero card at the top of ExploreTab — the single most important piece of real estate in the app — has stat section labels ("CONDITIONS", "FLIGHTS FROM JFK") rendered at `fontSize:9, color:"#888"` on a white (#fff) background. This combination:

1. **Fails WCAG AA** for small text. #888 on #fff = 3.54:1 contrast ratio. AA requires 4.5:1 for text under 18px.
2. **fontSize:9 is below the legibility floor** for uppercase text with letter-spacing. The combination of tiny size + reduced contrast makes these labels invisible to a significant percentage of users.

These labels are structural — they tell users what the numbers mean. "78" means nothing without the "CONDITIONS" label above it. "$312" means nothing without "FLIGHTS FROM JFK."

**Suggested fix:** Change both stat labels to `fontSize:10, color:"#666"`. This achieves a 5.74:1 contrast ratio (passes AA) and brings the text above the legibility threshold. The uppercase + letter-spacing + fontWeight:600 styling ensures they still read as subdued labels, not competing with the data.

Specific lines to edit:
- Line 2391: change `fontSize:9, color:"#888"` to `fontSize:10, color:"#666"`
- Line 2396: change `fontSize:9, color:"#888"` to `fontSize:10, color:"#666"`

Also worth auditing: lines 2392 (`fontSize:10, color:"#aaa"` for "/100" suffix) and 2399 (`fontSize:9, color:"#aaa"` for "est.") have the same contrast issue. Change both to `color:"#888"` minimum.

**Severity:** Medium-High — this is the hero unit. If users cannot parse the stats, the entire scoring system loses its persuasive power. Accessibility failure on the most prominent component is a bad look.

---

## Suggested Code Fixes (descriptions only, no code changes made)

1. **Saved venues heart:** Add `width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center"` and bump fontSize from 12 to 13 on the inline saved venues strip heart button (line 2352). One line change.

2. **CompactCard text floor:** Bump three fontSize values — condition label (9 to 10), peak window (8 to 10), LIVE badge (8 to 10) — on lines 1503, 1521, 1531. Three property changes, no layout impact due to existing ellipsis truncation.

3. **Hero card contrast:** Change stat labels from `fontSize:9, color:"#888"` to `fontSize:10, color:"#666"` on lines 2391 and 2396. Optionally improve "/100" suffix (line 2392) and "est." label (line 2399) from `color:"#aaa"` to `color:"#888"`. Four property changes total.

Total lines to touch: ~8. No structural changes. No new components. Pure CSS-in-JS property tweaks.

---

## Inspiration

**Steal from Weather.com's data density approach.** Weather.com faces the same challenge as Peakly's CompactCard and hero stats: conveying dense numerical data on small mobile screens. Their solution: never go below 10px for any data label, use #555-#666 range for secondary text (not #888-#aaa), and rely on weight differentiation (600 for labels, 900 for values) instead of size differentiation. The result is a dashboard that feels information-rich without feeling cramped. Peakly's hero card and CompactCards would benefit from the same discipline — let font-weight carry the hierarchy, not font-size and opacity.

---

## Decision Made

**Ship all three as one commit: "Fix remaining micro-typography and touch target gaps."** These are all sub-10-line changes in the same category (text legibility and interaction sizing). No design decisions are needed — the direction is clear from v6. Priority within the commit: (1) hero card contrast first (highest visibility), (2) CompactCard text floor (highest frequency), (3) saved venues heart (lowest frequency but completes the touch target sweep). After this lands, the app is at 9.0 and the remaining path to 9.5 shifts from fixing problems to adding delight — micro-interactions, scroll position memory, progressive disclosure polish.
