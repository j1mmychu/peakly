# App Review notes — Peakly 1.0 (build 3)

Rejected submission: **468d466e-ab22-4db5-bc51-d897a9bcfb8e** (Guideline **2.1**, Information Needed).

Paste the block under **“Paste this”** into both places:

1. The reply on the App Review page for that submission.
2. App Store Connect → the version → **App Review Information → Notes**.

Attach the screen recording from the shot list below to that same reply. Do not submit a new binary until build 3 is the selected build and the recording is attached.

Support URL: `https://j1mmychu.github.io/peakly/support.html`
Privacy Policy URL: `https://j1mmychu.github.io/peakly/privacy.html`

This build’s iOS deployment target is **15.0** (ITMS-90068 on builds 1 and 2). `CFBundleVersion` is **3**. The app is iPhone-only.

---

## Paste this

```
Guideline 2.1 — information for Peakly 1.0 (build 3), submission 468d466e-ab22-4db5-bc51-d897a9bcfb8e.

A screen recording on a physical iPhone running the latest iOS is attached. It starts at a fresh launch and shows the normal path, including optional account creation, the magic-link sign-in, and in-app account deletion.

PURPOSE
Peakly answers one question: which ski resort or beach is worth flying to this weekend? It scores the upcoming Friday–Monday window from a live weather forecast and pairs that score with a round-trip flight price from the traveler’s home airport. The audience is adults planning a short spontaneous trip, not a season-long forecast product. The value is the combination: conditions and a fare you can actually book, plus an explicit confidence flag when the forecast is too far out to trust. The app is free. There is no subscription and no in-app purchase.

HOW TO USE IT
No account is required. Every browsing feature works signed out.

On first launch the app asks for location once, only to suggest the nearest home airport. Declining is supported: pick an airport from the grid (for example JFK) and tap Get Started.

Then:
• Explore — ranked list for this weekend. Skiing and Beach filters are at the top.
• Tap a card — weekend score, why the score looks like that, a short forecast, and a flight price. Book opens the airline or hotel site in the browser. Peakly does not take payment.
• Heart — saves the place on this device.
• Profile — optional account, saved places, and Delete account.
• Alerts — optional. A saved alert fires a push only if notification permission is granted. The rest of the app does not depend on it.
• Home-screen widget (WidgetKit, small and medium) — the current top weekend pick. It is included in this binary. Adding it is optional and is not required to use the app.

DEMO LOGIN
There is no password and no shared demo account. Sign-in is a one-time email link sent by our auth provider (Supabase). To try it, enter any email inbox you can open on the device, then tap the link in that inbox. The attached recording shows this with a real inbox, then shows account deletion.

Account deletion is in the app, not on the web: Profile → Delete account → type DELETE. That calls a server function which deletes the signed-in user’s cloud rows and auth identity. Local caches that were never uploaded stay on the device until the app is deleted.

USER CONTENT
There is no user-generated content other people can see. Saved venues and lists are private to the signed-in account. The public “share a list” feature is compiled off and is not in the UI. The share button on a venue only opens the system share sheet with a link to that catalog page. There is nothing to report or block. There is no paid content and no StoreKit product.

EXTERNAL SERVICES (core functionality)
• Open-Meteo Forecast API (api.open-meteo.com) — 7–14 day weather. No API key. Data license CC BY 4.0.
• Open-Meteo Marine API (marine-api.open-meteo.com) — water temperature for beach venues only. No API key. Same license.
• Peakly flight proxy (https://peakly-api.duckdns.org) — our own server. It requests cached round-trip fares from the Travelpayouts Data API. The Travelpayouts token stays on the server. The app only sends origin airport, destination airport, and dates.
• Aviasales / Travelpayouts (tp.media, marker 710303) — outbound flight-booking links. Affiliate. We do not process the booking.
• Booking.com (aid 2311236) — outbound hotel-search links. Affiliate. We do not process the booking.
• SafetyWing (referenceID=peakly) — outbound travel-insurance link. Affiliate. We do not process the purchase.
• Supabase (wsoqcfwkvvemtlddcgfc.supabase.co) — optional magic-link sign-in and sync of wishlists, named lists, alerts, trips, and profile. The anon key in the app is the public client key; database access is limited by row-level security.
• Apple Push Notification service — optional condition alerts, only after the user allows notifications.
• Apple Core Location — one-shot home-airport suggestion. Not used in the background.
• Map tiles — OpenStreetMap data. The iOS build requests tiles from tile.openstreetmap.org. The website uses CARTO’s light basemap of the same data. The map library (Leaflet) is bundled inside the iOS app and is not loaded from a CDN there.
• Venue photographs — Unsplash, hotlinked, under the Unsplash License (https://unsplash.com/license). They are not official resort photos.

Not used for core functionality on iOS: no payment processor, no AI or LLM API (the “vibe” search is on-device keyword matching over the built-in catalog), no third-party ad SDK. The website build loads Plausible (privacy analytics, no cookies) and Sentry (crash reports). Those scripts are stripped from the iOS bundle.

REGIONS
One binary, English UI, same behavior in every App Store region. The catalog is global. Prices are shown in US dollars. Choosing a home airport changes which fares and flight times you see; it does not unlock or hide a region. No feature is geo-restricted.

LICENSING
• Weather and marine data: Open-Meteo, CC BY 4.0. Attribution is in the app under Profile. Peakly is not affiliated with any resort, ski area, or national weather service, and it does not redistribute a paid snow product.
• Maps: © OpenStreetMap contributors, ODbL. CARTO basemap on the website only.
• Photographs: Unsplash License. Resort and beach names are used nominatively to identify places.
• Flight prices and booking pages: Travelpayouts affiliate partnership. We do not claim the fares or the airline content as ours.
• No regulated activity (no gambling, health, finance, or kids’ product) and no third-party trademark license is required for this use.

The app is free. There are no in-app purchases to submit with it.
```

---

## Screen recording (item 1)

Do this on a **physical iPhone** on the **latest iOS**, using the **TestFlight build of 1.0 (3)** — not the website, and not an old build. One continuous recording. Start from the home screen with Peakly **deleted** so the launch is a first launch.

Before you press record:

1. In the Supabase SQL editor, run `server/sql/delete-account.sql` once. Until that function exists, Delete account tells the user to email you, and the recording will not satisfy “account deletion is required.”
2. Archive in Xcode from this repo (deployment target 15.0, build 3), upload, install that build from TestFlight.
3. Have Mail on the phone able to open the address you will type. The magic link has to be tapped on that phone.

Shot list, in order:

1. Tap the Peakly icon. Let the first screen finish appearing.
2. Location: either tap Allow, or tap Don’t Allow and then pick an airport (JFK is fine). Tap **Get Started**.
3. On Explore, scroll the list. Tap **Skiing**, then **Beach**, then open one card.
4. On the venue: show the weekend score, open the score explanation if it is on screen, and show the flight price. Tap the book button far enough to show it leaves Peakly (or shows the confirm sheet), then come back. Do not buy anything.
5. Tap the heart to save the place.
6. Open **Profile**. Create an account with the email you can open. Switch to Mail, tap the sign-in link, and show that Profile now says you are signed in.
7. Still on Profile: **Delete account**, type `DELETE`, confirm. Show the success line and that you are signed out.
8. Optional, if it fits: Alerts → save one alert. Optional: add the home-screen widget and tap it. Neither is required for 2.1. Do not let either step crash; if the widget is not signed (App Group), skip it rather than showing a failure.

Stop the recording on Explore.

If the app crashes, do not send that take. Note the message on the error screen and fix it before uploading.

## Screenshot checklist

Apple’s completeness note says screenshots must be the real app in use, and that a new developer account gets a closer look.

- Capture from build 3 (device or a simulator of that same binary). Do not upload marketing mockups or an older set.
- iPhone only. The Xcode target is iPhone (`TARGETED_DEVICE_FAMILY = 1`), so an iPad screenshot set is not required. Do not add iPad screenshots of a phone layout.
- Required size is the 6.9-inch iPhone set (6.5-inch can be scaled from it). Three to ten shots.
- Show the real UI: the weekend list with scores, a venue detail with the score and a price, and Profile. Status bar should look like a normal device.
- Do not show a paywall, a “Pro” plan, surfing, or a push notification you cannot actually send. There is no in-app purchase to configure.
- The files in `app-store/screenshots/` were generated with stubbed weather. Recapture before you upload, so the listing matches the build under review.
- Listing copy that matches this catalog (404 venues: 134 ski, 270 beach) is in `app-store/LISTING-COPY.md`. Point Support URL at `https://j1mmychu.github.io/peakly/support.html`.

## What only you can do

- Paste `server/sql/delete-account.sql` into Supabase before the recording.
- Archive, upload build 3, install it from TestFlight, record on the phone, and attach the video.
- Paste the block above into the review reply and into Notes.
- Select build 3 and resubmit yourself. This change set does not submit the app.
