# PEAKLY DAILY BRIEFING — 2026-03-24

## STATUS: YELLOW

The app is in the best shape it has ever been (192 venues, 100% unique photos, HTTPS proxy live, PWA deployed, Plausible wired, SEO at 91%). But the VenueDetailSheet -- the only surface where revenue happens -- has been flagged P1 for 4 consecutive cycles and remains untouched. And the founder just discovered the site was down before any agent did, because none of them can actually load the page.

---

## SHIPPED TODAY:

- Trimmed from 472 to 192 venues with 100% unique Unsplash photos (correct call -- quality over count)
- HTTPS proxy live via Caddy + Let's Encrypt on peakly-api.duckdns.org -- P0 mixed content resolved, real flight prices in production
- PWA manifest + service worker -- home screen installable on iOS and Android
- JSON-LD structured data -- SEO from 81% to 91%
- All 5 Plausible custom events wired and confirmed
- $79/yr Peakly Pro pricing fix confirmed
- Set Alert button added to VenueDetailSheet
- .gitignore added
- Cache buster bumped

---

## DECISIONS MADE:

| Decision | Source |
|----------|--------|
| VenueDetailSheet photo hero + sticky CTA gates Reddit launch | PM v11 |
| 192 venues frozen -- no expansion until post-launch | PM v11 |
| Score validation thumbs up/down ships with detail sheet | PM v11 |
| Trips + Wishlists tabs DEFERRED to 1K users | PM v11 |
| Dark mode CUT, offline support CUT | PM v11 |
| Reddit hook shifts from venue count to problem statement | Growth v12 |

---

## BLOCKED:

| Blocked Item | What Unblocks It |
|-------------|-----------------|
| REI (22 links), Backcountry (2), GetYourGuide (1) -- all earning $0 | LLC approval (external, no action available). REI via Avantlink does NOT require LLC -- Jack action. |
| Peakly Pro subscriptions | LLC approval + Stripe setup |
| VenueDetailSheet redesign (photo hero, sticky CTA, score breakdown) | Dev time: 4-6 hours. Flagged P1 for 4 consecutive reports. Nobody is doing this work. |
| Reddit launch | VenueDetailSheet + Reddit account karma verification |

---

## TOP 3 PRIORITIES THIS WEEK:

1. **Ship VenueDetailSheet redesign (photo hero + sticky CTA + score breakdown)** -- This is the only surface that converts browsing into revenue. Booking.com and Travelpayouts earn $0 from a detail sheet users scroll past. Every agent has flagged this. It gates the Reddit launch. Nothing else matters until it ships.

2. **Sentry DSN + REI Avantlink signup** -- 5 minutes at sentry.io gives crash visibility before any public traffic. 30 minutes at avantlink.com activates REI affiliate revenue (no LLC required). Combined: 35 minutes of Jack's time, unblocked today.

3. **Open-Meteo weather cache (localStorage, 30-min TTL)** -- At ~30 concurrent users the 10K/day free API tier exhausts in under an hour. Failure is completely silent: all scores drop to 0, hero shows garbage, users assume the app is dead. Must ship before Reddit post. 2 hours of dev work.

---

## RISKS:

1. **No runtime verification exists anywhere in the pipeline.** The site was down and nobody knew. None of the 12 agents can render the page. They do static code analysis only. If Babel transpilation fails, if a CDN goes down, if a syntax error manifests at runtime -- zero agents detect it. This is not a one-time gap. It will happen again on every deploy until a real uptime check exists.

2. **VenueDetailSheet has been P1 for 4 consecutive report cycles with zero progress.** This is the primary revenue surface and the Reddit launch gate. PM, UX, Growth, and Revenue agents all independently identified it as the #1 priority. If it does not ship this week, the Reddit window (pre-Easter, late-season ski/surf interest) closes.

3. **Open-Meteo rate limit will silently kill the app under any traffic spike.** No error banner, no fallback UI, no alert. Persisted from last briefing with no action taken.

---

## YOUR TO-DO LIST:

1. **Open https://j1mmychu.github.io/peakly/ on your phone right now.** Confirm it loads, venue cards show photos, tapping a surf venue shows real weather data and a flight price (not "est."). If it is broken, everything else stops. Do this before reading any further.

2. **Set up a free uptime monitor.** UptimeRobot.com (free tier, 5-min checks) or Freshping. Point it at the live URL. Set it to text your phone on failure. 5 minutes. This is how you prevent "how did no one know the site was down?" from ever happening again.

3. **Sign up at sentry.io** (free tier, 5 min). Paste the DSN into app.jsx line 6. Gives crash visibility before any public traffic.

4. **Sign up at avantlink.com for REI affiliate** (30 min, no LLC required). 22 REI links across 8 categories currently earning $0. Estimated +$6 RPM.

5. **Verify your Reddit account** has 50+ karma and 30+ days activity on r/surfing. If not, start warming it up now. This is the #1 Reddit launch failure mode and only you can check it.

---

## ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID:

**You have 12 AI agents producing 12 polished reports, and not one of them can tell you whether the site is up.**

Every agent reads app.jsx, counts lines, checks syntax, audits links, writes paste-ready fixes, models revenue, drafts Reddit posts. None of them loads a browser. None of them fetches the live URL. None of them can distinguish between "the code looks correct" and "the site works." You discovered downtime yourself and asked "how did no one know?" The answer is architectural: static analysis is not monitoring.

The fix is two layers:

**Layer 1 (5 min, do today):** UptimeRobot free tier. Pings `https://j1mmychu.github.io/peakly/` every 5 minutes. Texts you when it returns non-200. Would have caught the outage within 5 minutes instead of however long it took.

**Layer 2 (30 min, do this week):** A nightly headless browser check -- 20 lines of Playwright that loads the page, waits for React to mount, asserts venue cards rendered, and fails loudly if they don't. This catches the Babel transpilation failure mode that no amount of static code review will ever detect.

Until these exist, every agent report carries an invisible asterisk: *"assuming the site actually loads."* That assumption has already been wrong at least once.

The deeper pattern: 4 agents have independently flagged the VenueDetailSheet as the #1 priority for 4 consecutive cycles. It has not been touched. Meanwhile, the team shipped JSON-LD schemas, scoring overhauls, PWA manifests, 280 venues (then reverted), structured data, and 11 reports analyzing the work. All useful. None of it matters if the primary conversion surface stays broken -- or if the site itself is down and nobody notices.

---

### Cross-Report Summary

| Area | Key Number | Trend |
|------|-----------|-------|
| Venues | 192 (100% unique photos) | Stable (frozen) |
| Revenue RPM (live) | $12.06/1K MAU | Down $0.12 (lost 1 Amazon link) |
| RPM post-LLC | ~$33.23/1K MAU (+176%) | Blocked by LLC |
| SEO score | 91% | Up from 81% |
| QA | 9/11 pass | Sentry DSN + sitemap still failing |
| UX score | 9.4/10 | 10 WCAG contrast failures unfixed for 4 reports |
| Data completeness | 5.2% (tags are 2/venue, need 5+) | Unchanged |
| Retention risk | YELLOW (5.5/10) | Down 0.5 from venue trim |
| Reddit readiness | GO (pending detail sheet + account check) | Unchanged |
| 90-day user projection | 4,500-8,000 | Down from 6,000-10,000 |

---

*Generated 2026-03-24 by Chief of Staff agent. Sources: all 11 agent reports + git log (15 commits reviewed).*
