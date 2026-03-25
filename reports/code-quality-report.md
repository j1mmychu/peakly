# PEAKLY DAILY BRIEFING — 2026-03-24

## STATUS: YELLOW

Significant code shipped (10 new venues, Plausible events, JSON-LD, Set Alert button, hiking gear, deep links, WCAG fixes, $79/yr pricing fix), but the flight proxy is still broken for every production user and the Reddit post has not gone out yet. The team is shipping well; distribution is the bottleneck.

---

## SHIPPED TODAY

- 10 new venues (diving +4, climbing +3, kite +3) -- 192 total, 100% photo coverage
- 5 Plausible custom events wired and firing (Tab Switch, Venue Click, Flight Search, Wishlist Add, Onboarding Complete)
- Plausible upgraded to `script.hash.js` for SPA hash tracking
- JSON-LD structured data live (WebSite + WebApplication + Organization)
- Static h1 fallback in index.html for crawlers
- "Set Alert" button in VenueDetailSheet -- 2 taps instead of 7
- Venue deep links shipped (`#venue-{id}` hash routing) -- every venue is now shareable
- Hiking GEAR_ITEMS added (4 items, 1 Amazon link earning immediately)
- $9/mo pricing bug fixed to $79/yr
- Cache buster updated to v=20260325a
- WCAG contrast improvements on SearchBar subtitle, carousel labels, affiliate text
- BottomNav touch targets fixed to 46px (passes 44px minimum)
- SEO score: 81% -> 92%. QA: 10/11 pass. Design score: 9.4/10.

---

## DECISIONS MADE

| Decision | Source |
|----------|--------|
| GA4 CUT -- Plausible is sufficient | PM |
| Offline/service worker CUT -- incompatible with live-data product | PM |
| Dark mode CUT -- no demand signal | PM |
| Trips + Wishlists tabs DEFERRED to 1K users -- 3-tab nav stays | PM |
| Reddit launch greenlit, gated on photo coverage (done) + detail sheet polish (not done) | PM |
| Launch Reddit despite proxy down -- conditions are the hook, not flights | Growth |

---

## BLOCKED

| What | Unblocked By | Specific Action |
|------|-------------|-----------------|
| Real flight prices for all users | Jack SSHs into VPS | `pm2 restart all` on 104.131.82.242, then Cloudflare Tunnel for HTTPS + add `j1mmychu.github.io` to CORS allowed origins |
| REI affiliate tags (21 links earning $0) | LLC approval | External -- no action available |
| Backcountry + GetYourGuide affiliate links | LLC approval | External -- no action available |
| Peakly Pro subscription wiring (Stripe) | LLC approval | External -- no action available |
| Production crash visibility | Jack signs up at sentry.io | 5 min, paste DSN into app.jsx line 6 |

---

## TOP 3 PRIORITIES THIS WEEK

1. **Post to r/surfing** -- The post is written, deep links are live, analytics are wired, 192 venues with 100% photo coverage. Every day without distribution is wasted compound growth. The only pre-flight check: verify the Reddit account has 50+ karma on r/surfing. Post Tuesday or Wednesday, 7-9am Pacific.

2. **Fix VPS flight proxy (HTTPS + CORS)** -- Two independent bugs: (a) HTTP-only causes mixed content blocking in every browser, (b) CORS rejects `j1mmychu.github.io`. Until both are fixed, every user sees estimated prices and Travelpayouts earns $0. This is 30-60 minutes of VPS work. DevOps agent wrote the exact commands.

3. **Venue Detail Sheet polish** -- This is the conversion surface. PM flagged it as #2 priority. Needed: full-width photo hero, sticky "Book Flights" CTA (flagged by UX for 2 consecutive reports), condition score breakdown on badge tap, similar venues row. This is where Booking.com and flight clicks happen.

---

## RISKS

1. **SurfTrips.ai is building in Peakly's space.** 500+ surf breaks with real-time flights and accommodations. If they add live wave scoring, they become a serious surf-vertical threat. KAYAK also launched AI Mode for vibe-based travel discovery at 50M+ user scale. The Window Score (Phase 2) is now a competitive necessity. This risk is new this cycle and has not been acted on.

2. **Open-Meteo rate limit will silently kill the app under viral traffic.** 342 API calls per user load = free tier exhausted after 29 concurrent users. Failure is invisible -- scores drop to 0, hero card shows garbage, no error banner. A localStorage weather cache with 30-min TTL must ship before Reddit. Nobody has started this work.

3. **4 category pills (kayak, MTB, fishing, paraglide) each show 1 venue.** A Reddit user who taps any of these sees a single dead-end result. Data Enrichment agent has 10 paste-ready venue objects for these exact categories. Either add them or hide the pills before launch.

---

## YOUR TO-DO LIST

1. **SSH into VPS and fix the flight proxy.** `pm2 restart all` on 104.131.82.242, then set up Cloudflare Tunnel for HTTPS (DevOps report has exact commands), then add `j1mmychu.github.io` to CORS allowed origins. 30-60 min total. This is the single highest-impact task across the entire business right now.

2. **Post the r/surfing thread.** Copy-paste-ready post is in Growth and Community reports. Verify your Reddit account has 50+ karma and 30+ days on r/surfing. Best window: Tuesday or Wednesday, 7-9am Pacific.

3. **Sign up for Sentry free tier and paste DSN into app.jsx line 6.** 5 minutes. Without this, if the Reddit post sends 500 surfers and 20% hit a crash, you will not know.

4. **Check LLC application status.** LLC blocks $20.79/1K MAU in additional RPM -- that is $329/month at 5K users sitting on the table. 21 REI links, 2 Backcountry links, 1 GetYourGuide link, and Peakly Pro all wait on this single gate.

5. **Open the live site on your phone before posting to Reddit.** If Babel transpile fails or the screen is blank, the launch is a hard NO-GO.

---

## ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID

Every agent is treating the Reddit launch as imminent, but across 11 reports there is a quiet pattern: the team keeps shipping polish and infrastructure (JSON-LD, WCAG contrast fixes, structured data, Plausible events) while the two things that actually determine whether the Reddit post converts -- the flight proxy and the Venue Detail Sheet -- remain untouched for multiple cycles. The proxy has been broken since the beginning. The Detail Sheet's sticky CTA has been flagged as a priority for two consecutive UX reports with no action. The risk is not that the Reddit post fails -- it is that the Reddit post succeeds, sends 500 surfers to a page where every flight price says "est." and the detail sheet lacks a sticky book button, and those 500 surfers leave with a "nice concept, half-baked execution" impression that cannot be undone. The question to ask: should the Reddit post wait 48 more hours while the proxy gets fixed and the Detail Sheet gets a sticky CTA -- or is shipping now with known gaps actually the right call?

---

*Generated 2026-03-24 by Chief of Staff agent. Sources: all 11 agent reports + git log.*
