# Peakly UX Audit — 2026-03-27

## UX Score: 7.2/10

Recent additions (pagination with "Show more" at 30 venues, region-based pricing fallback) are solid infrastructure decisions. They solve real scaling pain from 2,226 venues without degrading the core flow. But the same persistent UX debt from prior reports remains unaddressed: WCAG contrast failures, emoji in UI chrome, category pill gating, and ListingCard "Book" button color. Score ticks down 0.1 because the new features expose new issues (see below) while old ones compound.

---

## 1. PAGINATION ("Show more" at 30)

### What's Good

- `visibleCount` state at line 5145 with default of 30 is the right number. Airbnb shows ~20 on mobile; 30 for a conditions app where browsing is the point is reasonable.
- Increments by 30 (`setVisibleCount(v => v + 30)`) at line 5591 — clean, consistent batches.
- Resets to 30 on category change (line 5250: `setVisibleCount(30)`) — correct behavior, no stale state.
- "Show more (X remaining)" label at line 5596 gives users context on how much more there is.
- Button placed outside the scroll area but inside the main container — no layout jumps.

### Issues

**Issue 1: No scroll-to-top on category switch.**
When a user switches categories, `visibleCount` resets to 30 but the scroll position stays wherever they were. If they scrolled 200 venues into surfing and tap "Skiing," they land in the middle of a new list.

FILE: app.jsx
LINE: ~5250 (pill onClick)
ISSUE: Category switch resets count but not scroll position.
FIX: Add `scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })` inside the pill onClick handler alongside `setVisibleCount(30)`.

**Issue 2: "Show more" button has no loading state.**
With 2,226 venues, rendering 30 more cards causes a noticeable jank on mid-range phones. The button should show a brief spinner or skeleton state while React reconciles.

FILE: app.jsx
LINE: 5591
ISSUE: Instant render of 30 new cards causes scroll jank on slower devices.
FIX: Consider wrapping the `setVisibleCount` call in `startTransition()` (React 18) to keep the UI responsive during the batch render.

**Issue 3: No "Back to top" affordance.**
After tapping "Show more" 3-4 times (90-120 venues visible), there's no way to quickly return to the hero card or filters. Long lists need a floating "back to top" button that appears after scrolling past ~2 screen heights.

FILE: app.jsx
LINE: After 5599
ISSUE: No way to return to top after deep scrolling through paginated results.

**Issue 4: Total count not shown upfront.**
Users don't know if there are 50 or 500 venues in a category until they start tapping "Show more." A simple count in the section header ("142 spots" or "Showing 30 of 142") sets expectations.

FILE: app.jsx
LINE: ~5540 (grid section header area)
ISSUE: No total venue count visible before the grid.

---

## 2. REGION-BASED PRICING

### What's Good

- Fallback logic at lines 3820-3834 is well-structured. Checks `BASE_PRICES[ap][homeAirport]` first, then falls back to continent-pair estimates.
- Route pricing matrix covers all 6 continent pairs (na, europe, asia, oceania, latam, africa) — 30 routes plus same-continent pricing.
- Same-continent pricing differentiates NA ($350) from other continents ($450) — correct, NA domestic flights are cheaper.
- The `isEstimate` flag at line 3839 properly flows through to UI ("est." label on CompactCard at line 4408).
- Seed-based deterministic pricing (line 3836-3838) means the same venue always shows the same estimated price — no flickering between page loads.

### Issues

**Issue 5: Region estimates skew too low after discount calculation.**
The seed-based discount (28-75% off at line 3837) applies on top of already-conservative region estimates. Example: Asia from NA base is $1,100 but after a 60% "discount," users see ~$440 — far below any real trans-Pacific round-trip. The "est." label helps, but showing obviously wrong prices erodes trust.

FILE: app.jsx
LINE: 3837-3838
ISSUE: Discount percentage range (28-75%) is too wide for region-based estimates, producing unrealistically low prices.
FIX: For region-based fallbacks (where `!exact`), cap the discount range narrower (e.g., 15-35%) so estimates stay plausible. The wide discount range was designed for exact `BASE_PRICES` entries which are already above-market.

**Issue 6: "est." label on CompactCard is subtle — not visible on ListingCard.**
CompactCard (line 4402-4409) shows a green "LIVE" badge or gray "est." text. But ListingCard (line 4242-4245) shows price and strikethrough with no estimate indicator at all. Users can't tell which prices are real vs. guessed on the primary card type.

FILE: app.jsx
LINE: ~4242 (ListingCard price section)
ISSUE: ListingCard doesn't indicate when prices are estimates. Only CompactCard has the "est." label.
FIX: Add the same `listing.flight.live` / "est." indicator to ListingCard's price area.

**Issue 7: Region fallback doesn't account for non-US home airports.**
The route matrix (lines 3826-3832) works for any continent pair, but the same-continent logic at line 3824 only differentiates NA ($350) vs. everything else ($450). A European user flying within Europe should see ~$200 (Ryanair/easyJet reality), not $450. Asian intra-continent is also cheaper (~$300).

FILE: app.jsx
LINE: 3824
ISSUE: Same-continent fallback overestimates non-NA intra-continental flights.
FIX: Expand the same-continent map: `{ na: 350, europe: 250, asia: 350, oceania: 400, latam: 400, africa: 500 }`.

---

## 3. PLAUSIBLE EVENT WIRING

Current state of the 5 required custom events:

| Event | Status | Location |
|-------|--------|----------|
| Tab Switch | WIRED | Line 9027 — fires on BottomNav `setActive` with `{tab}` prop |
| Venue Click | PARTIALLY WIRED | `venue_detail` logged via `logEvent` but not consistently with `plausible()` on card open |
| Flight Search | WIRED | Line 7919 — `flight_click` fires on VenueDetailSheet CTA. Line 4247 — `book_click` fires on ListingCard Book button |
| Wishlist Add | WIRED | Line 8847 — `Wishlist Add` fires with venue title |
| Onboarding Complete | WIRED | Line 7051 — fires with airport prop |

Missing: A dedicated `venue_detail` Plausible event when `onOpenDetail` is called. The `logEvent` helper (line 4046) calls `plausible()` internally, but the venue click event name used is inconsistent between the ListingCard `book_click` and the detail sheet open. Consider standardizing to `Venue Click` at the point where `onOpenDetail(listing)` is invoked in the App component.

---

## 4. VISUAL QUALITY AUDIT (Persisting Issues)

### WCAG AA Contrast Failures (Still Unfixed)

These have been reported in 8+ consecutive audits:

| Element | Line | Fg | Bg | Ratio | Fix |
|---------|------|----|----|-------|-----|
| Review count (#aaa on #fff) | 4218 | #aaa | #fff | 2.32:1 | Change to #767676 (4.54:1) |
| "Conditions now" label | 7665 | #aaa | #f0f9ff | ~2.1:1 | Change to #6b7280 |
| Forecast low temp (#bbb on #f7f7f7) | ~7664 | #bbb | #f7f7f7 | 1.64:1 | Change to #6b7280 |
| Similar venue location (#aaa on #fff) | ~7703 | #aaa | #fff | 2.32:1 | Change to #767676 |

### Touch Targets

- Category pills: `padding: 5px 6px` (line 5255). On narrow phones with 4 pills + "More" + heart, each pill can render at ~60px wide but only ~28px tall. Below the 44px minimum. Increase vertical padding to `8px 6px`.
- "Clear all" filter button (line 5321): `padding: 3px 4px` — well below 44px in both dimensions. Increase to `10px 12px`.
- Heart button on saved venue mini-cards (line 5358): `width:28, height:28` — below 44px minimum.

### Emoji in UI Chrome

Still present in VenueDetailSheet headers, category pills, and various badges. Decision from 2026-03-23 was "Remove emoji from UI chrome" but this hasn't been executed.

---

## 5. AIRBNB COMPARISON

### Pagination

Airbnb uses infinite scroll with a "Show X homes" button on mobile map view. Peakly's "Show more" button approach is actually cleaner for a conditions app where users want to compare specific venues, not endlessly scroll. No change needed here — the explicit button is the right call.

### Price Display

Airbnb never shows estimated prices. Every price on Airbnb is real and bookable. Peakly shows "est." prices for venues where the flight API hasn't returned data. The "est." label is appropriate, but it needs to appear on ALL card types (currently missing from ListingCard — see Issue 6).

### Empty States

When Airbnb has no results for a search, it suggests broadening criteria and shows a map of nearby options. Peakly's empty state (lines 5563-5583) is decent — it mentions the hero pick and suggests setting an alert. But it doesn't suggest removing active filters, which is the #1 reason users see empty results after applying a price cap or date range.

FILE: app.jsx
LINE: ~5563
ISSUE: Empty state doesn't suggest removing active filters.
FIX: When `hasActiveFilters` is true, show a "Try removing your filters" CTA alongside the existing options.

---

## 6. THE ONE THING

**The single highest-impact UX change this week is adding scroll-to-top on category switch and a venue count header above the grid.**

Reason: With 2,226 venues and pagination live, category switching is the #1 navigation action. Users who switch from Surfing (with 200+ results scrolled deep) to Skiing land in a disorienting mid-page position. Adding scroll-to-top fixes the most common pagination UX break, and showing "142 spots" above the grid sets expectations so users know whether to browse or filter.

These are two surgical changes:

1. **Scroll reset on category switch** — one line in the pill onClick handler
2. **Venue count above grid** — one line showing `{gridListings.length} spots` in the grid header area

Both are under 5 lines of code, zero risk, and immediately noticeable to every user who switches categories.

---

## Summary

| Area | Verdict |
|------|---------|
| Pagination (30 + Show more) | Solid implementation. Missing scroll-to-top on category switch and venue count display. |
| Region-based pricing | Good fallback architecture. Discount range too wide for estimates. ListingCard missing "est." indicator. |
| WCAG contrast | 4+ failures persist across 8 reports. |
| Touch targets | Category pills and filter clear button below 44px minimum. |
| Plausible events | 4 of 5 wired. Venue Click needs standardization. |
| Core flow | 2 taps to book. No regression. |
