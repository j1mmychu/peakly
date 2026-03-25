# PEAKLY DAILY BRIEFING -- 2026-03-25

## STATUS: YELLOW

Three P0 blockers from last briefing are resolved (HTTPS proxy, $79/yr pricing, cache buster). But the 280-venue expansion introduced severe data quality problems -- 252 surf venues sharing 3 stock photos -- that now block the Reddit launch it was supposed to support.

---

## SHIPPED TODAY:

- **HTTPS proxy live** -- peakly-api.duckdns.org via Caddy + Let's Encrypt. Real flight prices loading in production. Mixed content blocking eliminated. This was the #1 credibility killer and it's fixed.
- **280 new surf venues** -- 333 total surf spots with breakType field (beach, point, reef). 472 venues total.
- **Deep scoring overhaul** -- all 12 sport algorithms rewritten with expanded weather + marine API data. This is Peakly's moat.
- **PWA manifest + service worker** -- installable to home screen on iOS and Android.
- **JSON-LD structured data** added to index.html.
- **Set Alert button** live in VenueDetailSheet (2 taps to trigger alert).
- **5 Plausible custom events** confirmed wired and firing.
- **GA4 added then correctly reverted** -- Plausible is the sole analytics platform. No cookie banner needed.
- **$79/yr pricing confirmed correct.** Zero instances of $9/mo.
- **Cache buster current** at v=20260325b.
- **SEO score: 91% (up from 81%).** QA: 9/11 pass. UX: 9.4/10. Revenue RPM: $12.18.

---

## DECISIONS MADE:

| Decision | Source |
|----------|--------|
| Venue expansion FROZEN at 472. No more until detail sheet converts. | PM |
| GA4 CUT -- Plausible sufficient | PM |
| Offline/service worker CUT -- incompatible with live-data product | PM |
| Dark mode CUT -- no demand signal | PM |
| Trips + Wishlists tabs DEFERRED to 1K users | PM |
| Reddit launch gated on: photo audit + detail sheet polish + Sentry DSN | PM |
| 280-venue expansion CONTESTED -- right data, wrong timing | PM |

---

## BLOCKED:

| What | Unblocked By | Specific Action |
|------|-------------|-----------------|
| 252 surf venues have duplicate photos | Content/data agent assigns unique Unsplash URLs | Multi-hour task. Must complete before Reddit post. |
| 66 airport codes missing from AP_CONTINENT | Dev work | Paste-ready list exists in data enrichment report. 189 venues (40%) have broken continent mapping. |
| REI affiliate tags (21 links earning $0) | LLC approval OR Avantlink signup (no LLC needed per Revenue agent) | Jack: sign up at avantlink.com. 30 min. |
| Backcountry + GetYourGuide affiliate links | LLC approval | External -- no action available |
| Peakly Pro Stripe integration | LLC approval | External -- no action available |
| Production crash visibility | Jack signs up at sentry.io | 5 min, paste DSN into app.jsx line 6 |

---

## TOP 3 PRIORITIES THIS WEEK:

1. **Fix photo duplication on 252 surf venues** -- Reddit surfers will scroll cards and see the same image 150 times. This single issue will undermine the "333 surf spots" marketing hook that the Growth agent built the entire post title around. Must be done before Reddit launch. Nothing else matters until this is fixed.

2. **Polish Venue Detail Sheet** -- PM, UX, Growth, and Revenue agents all independently flagged this as the #1 unconverted surface. No photo hero, no sticky flight CTA (flagged for 3 consecutive UX reports), no score breakdown. Every card tap lands here. This is where Booking.com clicks and Travelpayouts revenue live. 4-6 hours dev work.

3. **Reddit launch** -- post is drafted, copy-paste ready, all technical blockers cleared. Best window: Tuesday/Wednesday 7-9am Pacific. But do NOT post until photos are fixed and detail sheet has at minimum a sticky flight CTA.

---

## RISKS:

1. **Photo duplication will tank the Reddit launch.** 152 venues share a single Unsplash image. This was created by the 280-venue expansion that PM explicitly recommended against. An r/surfing commenter saying "why do all spots have the same picture?" kills the thread. This risk is new since last briefing and is the most urgent issue across the entire project.

2. **Pipeline venue has a double-comma syntax bug (line 300)** that Babel tolerates today but could white-screen the entire app on a CDN upgrade. Pipeline is the flagship venue you'll deep-link in Reddit comments. One-character fix. QA flagged it. Still not fixed.

3. **Open-Meteo rate limit at ~30 concurrent users.** 342 API calls per user = free tier exhausted after 29 full loads. If Reddit drives 50+ simultaneous visitors, all scores drop to 0, hero card shows garbage, no error banner, no fallback UI. **Persisted from last briefing with no action taken.**

---

## YOUR TO-DO LIST:

1. **Sign up for Sentry free tier and paste DSN into app.jsx line 6.** 5 minutes. You are launching to the public with zero crash visibility on a 6,354-line single-file app with a scoring overhaul just shipped. Do this today.

2. **Sign up for REI affiliate via Avantlink.com.** 30 minutes. Revenue agent confirmed this does NOT require LLC. 21 gear links across 8 categories currently earning $0. Estimated +$5.78 RPM.

3. **Verify your Reddit account** has 50+ karma and 30+ days age on r/surfing. If not, spend 1-2 weeks commenting genuinely first. This is the #1 launch failure mode and only you can check it.

4. **Open the live site on your phone** and confirm: real flight prices appear (not "est."), venue detail sheet loads with weather data, surf venue photos look good. 2 minutes.

5. **Post to Reddit** when photo duplication is resolved. Copy-paste ready draft in Growth and Community reports. Best window: Tuesday or Wednesday, 7-9am Pacific.

---

## ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID:

The 280-venue expansion went against the PM's explicit recommendation ("Geographic expansion before nailing UX for existing 182 venues is wrong order") and introduced three new problems: 252 venues with duplicate photos, 66 broken airport continent mappings, and a dataset so surf-heavy (71% of all venues) that 7 of 11 category pills feel abandoned. The expansion made the venue count impressive for the Reddit post title but created a quality problem that now blocks the very launch it was supposed to support.

The deeper pattern across all 11 reports: four agents (PM, UX, Growth, Revenue) independently identified the Venue Detail Sheet as the single highest-priority item for 3 consecutive reporting cycles. It has not been touched. Meanwhile, the team shipped JSON-LD schemas, WCAG contrast fixes, structured data, PWA manifests, 280 new venues, and 12 scoring algorithms. All good work. None of it matters if the user who taps one card sees a detail sheet with no photo, no sticky book button, and no score breakdown, then bounces.

The question you should be asking: why has the one surface where revenue happens been deprioritized for 3 cycles in a row while everything around it gets polished?

---

*Generated 2026-03-25 by Chief of Staff agent. Sources: all 11 agent reports + git log (15 commits reviewed).*
