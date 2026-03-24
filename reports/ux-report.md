# Peakly UX Audit — Report: 2026-03-24 (v8)

## Design Score: 9.2/10

All three v7 issues are shipped and verified. The saved venues heart button now has a proper touch target, CompactCard text respects a 10px floor, and the hero stat labels pass WCAG contrast. Five new category pills (Kitesurf, Kayak, MTB, Fishing, Paraglide) are live with correct scoring functions and venue data. The pill bar's progressive disclosure ("+ More" button) keeps the default view clean while surfacing all 12 categories on demand. The remaining 0.3 points to reach 9.5 are about consistency sweep and information density — eliminating the last fontSize:9 holdouts and giving the new categories room to breathe with more than one venue each.

---

## Fixes Verified

| Fix | Location | Status | Details |
|-----|----------|--------|---------|
| Saved venues heart 28x28 touch target | Line 2357-2359 | CONFIRMED | `width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center"`, fontSize:12, position absolute top:2 right:2 |
| CompactCard condition label floor | Line 1508 | CONFIRMED | fontSize:10 (was 9) |
| CompactCard peak window floor | Line 1526 | CONFIRMED | fontSize:10 (was 8) |
| CompactCard LIVE badge floor | Line 1536 | CONFIRMED | fontSize:10 (was 8) |
| Hero stat "Conditions" label contrast | Line 2415 | CONFIRMED | fontSize:10, color:"#666" (was fontSize:9, color:"#888") |
| Hero stat "Flights from" label contrast | Line 2420 | CONFIRMED | fontSize:10, color:"#666" (was fontSize:9, color:"#888") |
| New category: Kitesurf | Lines 148-149, 255-261, 948-958 | CONFIRMED | Pill, venue (Tarifa), and scoreVenue case all present |
| New category: Kayak | Lines 149, 271-277, 960-972 | CONFIRMED | Pill, venue (Milford Sound), and scoreVenue case with rain bonus |
| New category: MTB | Lines 150, 279-285, 974-983 | CONFIRMED | Pill, venue (Moab Slickrock), and scoreVenue case present |
| New category: Fishing | Lines 151, 287-293, 985-993 | CONFIRMED | Pill, venue (Kenai River), and scoreVenue case with salmon run seasonality |
| New category: Paraglide | Lines 152, 295-301, 995-1005 | CONFIRMED | Pill, venue (Interlaken), and scoreVenue case with thermal logic |
| Pill bar progressive disclosure | Lines 2279-2309 | CONFIRMED | Default shows All/Skiing/Surfing/Beach, "+ More" expands to all 12. Clean pattern. |

All 12 items verified. No regressions on earlier fixes (GoVerdictBadge border, Best Right Now neutral border, 3-tab BottomNav, photo rendering, card radii, heart targets on ListingCard/FeaturedCard/CompactCard/Best Right Now carousel).

---

## Top 3 NEW Issues

### 1. fontSize:9 holdouts create an inconsistent legibility floor across the app (13 instances remaining)

The v7 CompactCard fix established 10px as the minimum readable text size. But 13 other instances of fontSize:9 remain scattered across the app, creating an inconsistent floor. The worst offenders carry meaningful information users need to parse:

| Element | Line | Current | Problem |
|---------|------|---------|---------|
| CompactCard "est." price label | 1540 | fontSize:9, color:"#aaa" | Price credibility signal rendered illegibly; also fails WCAG at 2.32:1 contrast on white |
| FeaturedCard LIVE badge | 1430 | fontSize:9 | Inconsistent with CompactCard LIVE badge (now 10px) |
| Hero "est." label | 2423 | fontSize:9, color:"#aaa" | Same contrast failure as CompactCard "est." — on the hero card, no less |
| Best Right Now carousel score | 2499 | fontSize:9, color:"#717171" | The score/100 is the card's only data density element and it is the smallest text on it |
| Pill count badges | 2299 | fontSize:9, opacity:0.7 | Category counts appear as noise rather than useful data |
| Saved venues card price | 2360 | fontSize:9, color:"#717171" | Price — the #1 decision-making data point — rendered at minimum legibility |

The remaining 7 instances (date picker labels, forecast mini-text, affiliate disclaimers, experience badge durations) are in secondary contexts where fontSize:9 is defensible. But the 6 listed above are on primary surfaces where users make decisions.

**Suggested fix:** Sweep all 6 primary-surface instances to fontSize:10. For the two "est." labels (lines 1540 and 2423), also change color from #aaa to #888 to reach WCAG AA. For the pill count badge (line 2299), change fontSize:9 to fontSize:10 and opacity:0.7 to opacity:0.8. Six lines, one principle: no decision-critical text below 10px.

**Severity:** Medium — individually small, collectively they undermine the polish established by v7 fixes. A user who notices the improved CompactCard text will also notice that the "est." label next to the price is still squinting-small.

---

### 2. New category pills show "1" count each — the pill bar reads as empty shelves (Line 2298-2301)

When a user taps "+ More" and sees Kitesurf (1), Kayak (1), MTB (1), Fishing (1), Paraglide (1), the immediate reaction is: "This app doesn't actually have content for these sports." One venue per category makes the feature feel aspirational rather than useful. The count badge — which exists to signal abundance — is doing the opposite. It is broadcasting scarcity.

This is a content problem, not a code problem. But there is a design mitigation.

**Suggested fix (design-side):** Hide the count badge when a category has fewer than 3 venues. Change line 2298-2301: wrap the count `<span>` in a conditional that only renders when `listings.filter(l => l.category === c.id).length >= 3`. This removes the "1" badges from new categories without affecting established ones (Skiing shows 15+, Surfing 20+, etc.). The pills still work — tapping them still filters — they just don't advertise their thinness.

Longer term, each new category needs 5-8 venues minimum to feel real. Kitesurf: Cabarete (DOM), Dakhla (Morocco), Cape Town (ZA), Boracay (PHL). Kayak: Ha Long Bay (VN), Glacier Bay (AK), Dubrovnik (HR). MTB: Whistler (BC), Rotorua (NZ), Finale Ligure (IT). Fishing: Cabo San Lucas, Islamorada (FL), Queenstown (NZ). Paraglide: Oludeniz (TR), Pokhara (NPL), Chamonix (FR).

**Severity:** Medium-High — new categories are a major feature addition. If they look barren on first impression, users will mentally classify them as "not ready" and never revisit. First impressions are irreversible.

---

### 3. Best Right Now carousel cards lack a price label context clue — "$312" without "from" or "flights" (Line 2498)

The Best Right Now carousel cards (170px wide, line 2477-2502) show a bold `$312` and a faint `78/100` on the bottom row. There is no label indicating what the dollar figure represents. On ListingCard there is "from JFK" next to the price. On FeaturedCard there is a "Book" CTA that contextualizes the price. On the hero card, there is a "Flights from New York" header above the number.

But on the carousel card, the price floats unlabeled. A user scanning quickly could read it as a hotel price, a package price, or a daily rate. The ambiguity is small but it erodes the "everything is a flight deal" mental model that makes Peakly click.

**Suggested fix:** Add a subtle "flights" or "rt" (round-trip) label after the price. On line 2498, change:

`<span style={{ fontSize:12, fontWeight:900, color:"#0284c7", fontFamily:F }}>${l.flight.price}</span>`

to include a trailing label:

`<span style={{ fontSize:12, fontWeight:900, color:"#0284c7", fontFamily:F }}>${l.flight.price}</span><span style={{ fontSize:9, color:"#aaa", fontFamily:F, marginLeft:2 }}>rt</span>`

At 170px card width, "rt" (two characters) fits easily. It costs 14px of horizontal space and buys complete clarity. Alternatively, use the flight emoji: `✈️` at fontSize:9 as a prefix to the price instead of text.

Also on line 2499: the score `{l.conditionScore}/100` at fontSize:9 would benefit from the same floor treatment as issue #1 (bump to 10, color to #666).

**Severity:** Medium — only affects the secondary carousel (the hero card above handles this correctly). But the carousel is the primary discovery surface for venues #2-5, so price clarity there matters.

---

## Suggested Code Fixes (descriptions only, no code changes made)

1. **fontSize:9 sweep (6 primary instances):** Bump to fontSize:10 on lines 1430, 1540, 2299, 2360, 2423, 2499. Change color from #aaa to #888 on lines 1540 and 2423. Change opacity from 0.7 to 0.8 on line 2299. Eight property changes total.

2. **Hide pill count when < 3 venues:** On lines 2298-2301, wrap the count span in `{listings.filter(l => l.category === c.id).length >= 3 && (...)}` so new single-venue categories don't advertise scarcity. One conditional addition.

3. **Carousel price context:** On line 2498, append a `<span>` with "rt" (fontSize:9, color:"#aaa", marginLeft:2) after the price. One element addition.

Total lines to touch: ~10. No structural changes. No new components. All changes are CSS-in-JS property tweaks and one conditional wrapper.

---

## Inspiration

**Steal from Airbnb's category bar scroll behavior.** Airbnb faces the exact same 12+ category problem. Their solution: the pill bar is always horizontally scrollable with a subtle fade-out gradient on the right edge, signaling "there's more." No "+ More" button needed. The gradient (a 40px linear-gradient from white to transparent overlaid on the scroll container's right edge) is a zero-interaction affordance — users instinctively swipe. Peakly's "+ More" button works, but it requires a deliberate tap to discover new categories. A scroll-fade hybrid would make all 12 pills discoverable without hiding any behind a button. The implementation is ~8 lines: a pseudo-element or an absolutely-positioned gradient div on the right side of the pill scroll container. This also future-proofs for when the venue count grows and categories multiply.

---

## Decision Made

**Ship issue #1 (fontSize:9 sweep) and issue #3 (carousel price label) as one commit: "Establish 10px floor app-wide, add price context to carousel cards."** These are pure property changes — zero risk, immediate polish. Issue #2 (hide pill counts < 3) ships alongside or immediately after, but is lower priority because the "+ More" gate already reduces exposure to the thin categories. After these land, the app is at 9.3-9.4 and the path to 9.5 shifts to content (more venues per new category) and interaction refinement (scroll-fade pill bar, scroll position memory). The bones are right. Now it is about filling the shelves.
