# Peakly — App Store listing copy

Paste-ready. Character counts verified against Apple's limits. Everything here is factually true of the shipped build — no claims about features that are gated off (push alerts) or venues that don't exist.

---

## App Name — 28/30 ✅

```
Peakly: Ski & Beach Weekends
```

*(“Peakly” alone is taken. The name under the icon on the home screen is set separately in Xcode and stays just “Peakly”.)*

---

## Subtitle — 24/30 ✅

```
Where to go this weekend
```

Alternates if you want a different angle:
- `Ski & beach trips, scored` (25)
- `Great conditions, cheap flights` (30)

---

## Keywords — 95/100 ✅

Comma-separated, no spaces (spaces waste characters). Don't repeat words already in the name or subtitle — Apple indexes those automatically.

```
ski,snowboard,powder,resort,beach,travel,flight,cheap,deals,forecast,snow,trip,vacation,getaway
```

*Deliberately omits “surf” — surfing was retired in the 2026-05-03 pivot and there are no surf venues to back it up.*

---

## Promotional Text — 158/170 ✅

*(Editable any time without a new build — good for seasonal swaps.)*

```
Southern-hemisphere ski season is firing right now. Peakly scores every Fri–Mon window across 373 spots and shows you the ones you can actually fly to.
```

Winter-season swap, for later:
```
Powder season is here. Peakly scores every Fri–Mon window across 373 ski and beach spots and shows you which ones are worth the flight this weekend.
```

---

## Description — ~1,850/4,000 ✅

```
Every weekend, somewhere is perfect. Peakly tells you where.

Most travel apps show you flights. Weather apps show you forecasts. Neither tells you the thing you actually want to know: is this weekend worth booking?

Peakly scores 373 ski resorts and beaches worldwide for the upcoming Friday–Monday window — combining live conditions with real round-trip flight prices from your home airport — and ranks them so the best trip you can actually take is at the top.

THE WEEKEND SCORE
Every venue gets a 0–100 score for the specific weekend ahead, not a generic rating. We analyze the best two consecutive days in the window, so a washed-out Saturday doesn't sink a perfect Sunday–Monday. Snowfall, base depth, temperature, wind, and sun all factor in — weighted differently for powder days than for beach days.

CONDITIONS + FLIGHTS, TOGETHER
A powder day you can't reach isn't useful. Peakly pairs each score with live round-trip fares and flags genuine deals — fares meaningfully below what that route typically costs for that time of year. Tap through to book.

HONEST WHEN IT CAN'T PROMISE
Forecasts get unreliable past a week. When the window falls outside what the data can honestly support, Peakly says so instead of guessing — low-confidence weekends never reach the front page. Every score can be opened up to show exactly how it was calculated.

BUILT FOR SPONTANEITY
Filter by flight time so you're only seeing places you can reach in an afternoon. Sort by best conditions or best deal. Save spots you're watching. No account required — open the app and everything works.

HOME SCREEN WIDGET
Add the Peakly widget to see your best weekend pick at a glance: the venue, its score, and the current fare. Tap to open it.

373 VENUES, TWO CATEGORIES DONE PROPERLY
131 ski resorts and 242 beaches, each with verified coordinates so the forecast you see is genuinely for that mountain or that stretch of sand. From Whistler and Chamonix to Bora Bora and Santorini, plus Southern-hemisphere resorts for northern summers.

FREE
No subscription, no paywall, no ads. Peakly earns through optional booking partners when you book — never by charging you.

Weather data from Open-Meteo. Flight pricing via Travelpayouts. Peakly is not affiliated with any resort or airline.
```

---

## What's New (v1.0)

```
First release. Peakly scores 373 ski resorts and beaches for the weekend ahead, pairs each with live flight prices, and tells you which trip is actually worth taking — including a home screen widget for your top pick.
```

---

## URLs

| Field | Value |
|---|---|
| Support URL | `https://j1mmychu.github.io/peakly/` *(swap to peakly.app once registered)* |
| Marketing URL | *(optional — leave blank)* |
| Privacy Policy URL | `https://j1mmychu.github.io/peakly/privacy.html` |

## Categories

- Primary: **Travel**
- Secondary: **Weather**

---

# App Review Notes

Paste into App Store Connect → your build → **Notes for Review**. This is written to pre-empt the two things most likely to get a v1 wrapper app rejected.

```
WHAT PEAKLY DOES
Peakly scores 373 ski resorts and beaches for the upcoming Friday–Monday window by combining live weather forecasts with real round-trip flight prices, so a user can see at a glance which weekend trip is worth booking.

NO ACCOUNT NEEDED — NO DEMO CREDENTIALS REQUIRED
Every feature is fully usable without signing in. Please browse, filter, open venue details, view score breakdowns, and use the widget without creating an account. Sign-in is entirely optional and only adds cloud sync of saved venues across devices. It uses a passwordless email magic link, so there is no username/password pair to provide — but none is needed to review the app. If you would like to test the signed-in path, entering any email you control on the Profile tab will send a working sign-in link.

ACCOUNT DELETION
Signed-in users can delete their account and all associated cloud data in-app: Profile > Delete account. It requires typing DELETE to confirm and removes the user record and all synced data immediately.

LOCATION
Location is requested once, optionally, solely to detect the nearest home airport so flight times and prices are relevant. Declining is fully supported — the user can pick an airport manually and every feature continues to work.

NOTIFICATIONS
Condition alerts are intentionally disabled on iOS in this release. The push infrastructure is not yet live, so rather than show a promise the app can't keep, all alert-related UI and copy are hidden on iOS. You will not find a broken or non-functional notification feature.

NATIVE FUNCTIONALITY
Peakly is not a website wrapper. Specifically:
• Home screen widget built with WidgetKit (small and medium), showing the current top weekend pick and deep-linking into the app
• The entire app bundle ships inside the binary and functions with no network connection — please feel free to test in Airplane Mode; venues render with a clear "conditions unavailable" state rather than failing
• Native CoreLocation for home-airport detection
• Native haptic feedback on key interactions
• Native safe-area layout for notched devices

OFFLINE / FIRST LAUNCH
On first launch with no network, the app renders its full venue catalog with a banner explaining conditions are unavailable, and offers pull-to-refresh. It does not show a blank screen or an error state.

THIRD-PARTY DATA
Weather from Open-Meteo (free, no key). Flight pricing from Travelpayouts via our own server. Booking links open in the browser to partner sites. Peakly is not affiliated with any resort or airline and does not claim to be.
```

---

## Notes on choices made here

- **The description leads with the problem, not the feature list.** "Most travel apps show you flights. Weather apps show you forecasts." — that framing is your actual moat and it's the first thing a browsing user should read.
- **Every number is real** — 373 venues, 131/242 split, all verified by eval against the catalog on 2026-07-24. If the count changes, update it; Apple doesn't check, but a user who counts will.
- **No push/notification language anywhere in the listing**, matching the in-app copy gating. A reviewer comparing listing promises to app behavior finds no gap.
- **The review notes answer the demo-credentials question before it's asked.** Magic-link auth is a known review friction point; leading with "no account needed" converts it from a blocker into a non-issue.
- **The 4.2 defense is specific and checkable**, not a plea. Each claim is something a reviewer can verify in under a minute — especially Airplane Mode, which is unusually strong evidence for a Capacitor app.
