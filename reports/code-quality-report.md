---
PEAKLY DAILY BRIEFING -- 2026-03-27
STATUS: YELLOW

The app is launch-ready from a feature standpoint. What separates YELLOW from GREEN is a 5-minute Jack action (TP_MARKER) and one silent data bug (AP_CONTINENT naming) that nobody has fixed despite being found. Reddit is 4 days out.

SHIPPED TODAY:
- SEO jumped from 91% to ~95%: preconnect hints, enhanced JSON-LD (SearchAction + ItemList + TouristDestination), sitemap expanded to 12 URLs, viewport accessibility fixed. These were stuck for 7 consecutive cycles -- now landed.
- Region-based pricing fallback covers all 776 airports (was 10%). No venue shows a blank price.
- Pagination shipped (30 venues + Show More button). ExploreTab no longer renders 2,226 DOM nodes at once.
- Onboarding confirmed built and auto-triggering (was incorrectly flagged as missing for 3 cycles). OnboardingSheet at app.jsx:7015, 3-step flow, auto-shows for new users.
- Cache buster bumped to v=20260328a, service worker to peakly-v12.

DECISIONS MADE:
- PM: Reddit r/surfing launch hard-dated for Tuesday March 31, 9-11am ET. Non-negotiable.
- PM: Scoring algorithm FROZEN until post-Reddit calibration data exists. venue.facing revert is the one exception (bug fix, not feature).
- PM: Email capture must ship before Reddit -- localStorage-only email is retention theater.
- PM: venue.facing swell direction scoring to be reverted (Option A: delete the block entirely).
- Revenue: $79/yr Peakly Pro pricing confirmed correct. No Stripe until 1K users.
- Growth: Reddit GO confirmed by both Growth and Community agents. Post is copy-paste ready.

BLOCKED:
1. **TP_MARKER = "YOUR_TP_MARKER"** -- Every flight click earns $0. Cycle 8. Fix: Jack logs into tp.media, copies marker ID, pastes at app.jsx:3771, pushes. 5 minutes. This is the single highest-ROI action in the entire project and has been flagged for 8 consecutive agent cycles.
2. **AP_CONTINENT naming bug** -- 21 airports use "north_america"/"south_america" instead of "na"/"latam". Route keys like "north_america-europe" don't exist in the pricing matrix, so these airports show $800 flat. Fix: find-replace in app.jsx lines 235-300. 5 minutes of dev work. Scale Guardian found this; nobody has fixed it.
3. **venue.facing ?? 270 swell direction bug** -- All 200+ surf venues without explicit `facing` default to west-facing. East-facing breaks worldwide (J-Bay, Caribbean, Brazil) get wrong swell alignment scores. Fix: delete the spotFacing/swellAlignment block at app.jsx:3144. 30 minutes.
4. **Email capture is theater** -- Onboarding collects email into localStorage on one browser. ExploreTab footer shows "You're on the list!" but POSTs to nowhere. No Mailchimp, no webhook, no server-side list. When 500 Reddit users enter their email, those emails are unretrievable. Fix: one fetch() call to a /api/subscribe endpoint on the VPS. 30 minutes. PM and Scale Guardian both flagged this.
5. **LLC approval** -- External. Blocks GetYourGuide, Backcountry, and REI affiliate signups (~$8 RPM combined).

TOP 3 PRIORITIES THIS WEEK:
1. **TP_MARKER + AP_CONTINENT naming fix + venue.facing revert** -- These are the three code blockers before Reddit. Combined effort: 40 minutes of dev time + 5 minutes of Jack time. Everything else is ready. The difference between a successful Reddit launch and a wasted one is this 45-minute window.
2. **Server-side email capture before Reddit** -- The PM, Scale Guardian, and this briefing all converge on the same point: collecting emails into localStorage is retention suicide. 75 emails from Reddit will vanish when users clear cache. The VPS is already running. Wire a /api/subscribe endpoint. 2 hours.
3. **Photo diversity for top 3 offending base IDs** -- 3 Unsplash photo IDs cover 515 venues (23% of the app). Fishing (203 venues, 1 photo), Kayak (202 venues, 1 photo), MTB/Climbing (~110 venues, 1 photo). A Reddit user who opens 5 fishing spots and sees the same river will screenshot it. Replace the top 3 before Tuesday. 2-3 hours.

RISKS:
1. **Open-Meteo rate limit breaks at Reddit scale.** Free tier = 10K calls/day. Smart fetch loads top 100 venues (~130 calls per cold user). At 77+ new users/day, the limit hits. No 429 handler exists -- venues show "Checking conditions..." forever. The 10-minute fix (add 429 return null to fetchWeather/fetchMarine) hasn't shipped despite being flagged for 4 cycles.
2. **12 WCAG contrast failures persist for 8th consecutive day.** BottomNav inactive tabs, forecast temps, review counts, price strikethroughs -- all below 2:1 contrast ratio. Exact line numbers and replacement values have been provided in every UX report. Zero have been applied. An accessibility lawsuit or Reddit callout is a matter of time at scale.
3. **1.34 MB JSX parsed by Babel in-browser.** 5-15 second blank screen on mid-range Android phones. The preconnect hints shipped today help (~300ms), but this is architectural. No fix without a build step or externalizing the VENUES array. Acceptable for now, but LCP is rated POOR by Core Web Vitals.

YOUR TO-DO LIST:
1. **Replace TP_MARKER** -- tp.media dashboard, copy marker ID, paste at app.jsx:3771. 5 minutes. Cycle 8. Worth ~$40-55/week at launch traffic. Run: `push "Set TP_MARKER"`
2. **Verify Plausible domain** -- Dashboard may be registered as `j1mmychu.github.io/peakly` but tracking script uses `j1mmychu.github.io`. If mismatched, events are silently dropped. 2 minutes in the Plausible dashboard.
3. **Confirm Reddit account meets r/surfing thresholds** -- 50+ karma, 30+ day account age. If the account is new or low-karma, the post gets auto-removed silently. Check before Tuesday.
4. **Sign up for REI Avantlink** -- No LLC required. 22+ links already in the app earning $0. 30 minutes. +$6.16 RPM.

ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID:
The agents are building a machine that acquires users but cannot retain them. The alerts system is retention theater -- setting an alert stores it in localStorage with no push notifications, no email triggers, no server-side state. A user who sets an alert and closes the browser will never be notified. The email capture is the same: it creates the illusion of a list while capturing nothing. The Reddit launch will produce a spike -- maybe 500 users in 48 hours. By Day 3, the retention curve will crater because there is zero mechanism to bring anyone back. Plausible will show "set_alert" and "email_capture" events firing successfully, making it look like engagement features work when they don't. The 90-day projection of 6K-10K users assumes a retention curve that does not exist yet. The VPS is already running. A /api/subscribe endpoint that captures {email, name, airport, alerts} and writes to a flat JSON file is a 2-hour implementation. Ship it before Tuesday or accept that the Reddit launch is a one-shot event with no follow-through.
---

*Compiled from 11 agent reports (PM, DevOps, Growth, Community, Competitor Watch, Content, Revenue, QA, Scale Guardian, SEO/Analytics, UX, Data Enrichment) -- 2026-03-27*
