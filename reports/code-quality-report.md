---
PEAKLY DAILY BRIEFING — 2026-03-25
STATUS: YELLOW

A lot shipped. The app is materially better than 48 hours ago. But the 2,226-venue expansion created a new class of problems that the shipped fixes don't fully solve, and your 12 agents are reporting on 5 different versions of reality.

SHIPPED TODAY:
- Weather cache with 30-min TTL (localStorage, keyed by lat/lon) -- the #1 infrastructure ask for 4+ cycles. Done.
- Batched weather fetching (50/batch, 2s delay) -- prevents API thundering herd on load.
- All 2,050 unstable source.unsplash.com URLs replaced with stable images.unsplash.com photo IDs -- the deprecated-photo crisis is resolved. 0 unstable remaining.
- Duplicate photos fixed across all 2,226 venues -- 0% duplication.
- Sentry error monitoring live at peakly.sentry.io -- production crash visibility exists for the first time.
- Aviasales/Travelpayouts deep links shipped -- flight clicks now route through affiliate tracking.
- UptimeRobot monitoring live.
- Ski pass filter (Ikon/Epic/Independent) shipped.
- LLC approved -- Stripe, GetYourGuide, Backcountry, custom domain all unblocked.

DECISIONS MADE:
- PM: Freeze venue count. No expansion before Reddit. Weather cache P2 -> P1, now shipped.
- Growth: Reddit launch GO. Target Tuesday March 31 or Wednesday April 1, 7-9am Pacific.
- Community: Full r/surfing post written, engagement playbook for first 4 hours, 30-day rollout sequence ready.
- Revenue: $79/yr Peakly Pro confirmed. LLC approval unblocks Stripe wiring.
- UX: Remove emoji from VenueDetailSheet section headers (15+ instances violate "clean text + SVG only" decision).

BLOCKED:
1. **localStorage will hit 5MB quota before caching all 2,226 venues' weather (~8.7MB needed).** Cache silently fails for venues beyond ~1,200. The `catch {}` at line 2956 swallows the QuotaExceededError. Half the venues will permanently show "Checking conditions..." with no error surfaced to users or Sentry. **Fix: fetch weather only for the active category (~200 venues), not all 2,226. Or switch to IndexedDB.**
2. **Cold-start API exhaustion is still fatal.** Each new visitor triggers ~2,773 Open-Meteo calls. Free tier is 10K/day. Cache only helps returning users within 30 min. A Reddit post driving 50 new visitors in one hour = 138,000 API calls against a 10,000 limit. All scores go to zero. **Fix: lazy-load weather for filtered category only.**
3. **REI Avantlink signup -- 22 links earning $0.** No LLC needed. Jack action, 30 min. Flagged 5+ consecutive cycles.

TOP 3 PRIORITIES THIS WEEK:
1. **Change fetchAllWeather() to only load the active category filter (~200 venues), not all 2,226** -- This is the single change that makes every other shipped fix actually work at scale. The cache fits in localStorage. Cold-start API calls drop from 2,773 to ~250. Babel parse time doesn't change, but weather load time drops from 88 seconds to 8 seconds. Without this, the Reddit launch breaks the app for every user after the first 3-4 visitors.
2. **Wire Stripe to Peakly Pro or hide the button** -- LLC is approved. The $79/yr button fires `alert("coming soon")`. Redditors will find it and publicly roast a fake paywall. Either ship real payments (Revenue agent has the code diff) or remove the button before posting. This is a brand risk, not a feature priority.
3. **Post to r/surfing** -- Copy is written. Playbook is ready. Jack needs: (a) 50+ karma + 30-day account age verified, (b) 2-3 genuine comments seeded in r/surfing 48 hours before, (c) app verified working on phone, (d) VenueDetailSheet screenshot prepared.

RISKS:
1. **Your agents disagree on what the app contains.** PM says 181 venues / 6,134 lines. Content says 216. UX says 205. Scale Guardian and QA say 2,226 / 8,625 lines. CLAUDE.md says "192" in 6 places and "2,226" in 1 place. The code says 2,226. This means every agent's API call estimates, RPM projections, category gap analysis, and photo audit results are wrong -- they're computing against the wrong baseline. No agent output can be trusted until CLAUDE.md is reconciled to one truth.
2. **1.2MB JSX parsed by Babel at runtime = 5-12s blank screen on mobile 4G.** At 192 venues / 5K lines, Babel parse was 200-400ms. At 2,226 venues / 8,625 lines / 1.2MB, it dominates LCP. Reddit users on phones will bounce before the splash screen dismisses. The splash screen masks the delay but doesn't fix it.
3. **11 WCAG contrast failures and ListingCard Plausible event have been flagged for 6 consecutive agent cycles with zero fixes applied.** The UX report has the exact code diffs. They are single-value color swaps. 10 minutes total. Zero layout risk. The system is producing excellent analysis and zero shipped code on these items.

YOUR TO-DO LIST:
1. **Sign up for REI Avantlink** -- avantlink.com, 30 min, no LLC needed. Unlocks $6.16 RPM on 22 links currently earning $0. This has been on your list for 5+ cycles.
2. **Verify TP_MARKER in app.jsx is your real Travelpayouts marker** -- Revenue report flagged `"YOUR_TP_MARKER"` as placeholder. Growth report says "Aviasales links shipped." Both cannot be true. Open app.jsx, search for TP_MARKER. If it still says `"YOUR_TP_MARKER"`, log into tp.media, grab your marker, replace it. 5 minutes. Every flight click earns $0 without it.
3. **Decide: Stripe or hide Peakly Pro button** -- LLC is approved. Wire Stripe ($79/yr annual) or hide the upsell card before Reddit. Non-functional paywall on launch day is a brand-destroying moment.
4. **Seed 2-3 genuine comments in r/surfing starting today** -- 48-hour warm-up window before posting. Verify account has 50+ karma and 30+ day age.
5. **Open the live URL on your phone, tap a venue, confirm: photo loads, condition score shows a number (not "Checking..."), sticky CTA bar visible, flight price is real (not "est.").** This is the exact flow Reddit users will hit.

ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID:
The 2,226-venue expansion was never a recorded decision. It contradicts the explicit "192 is enough for launch" decision in CLAUDE.md. It was done by an autonomous Claude Code session, merged without review, and then partially patched with batching and caching that don't solve the actual problem at that scale. Now some agents think it's 181 venues and others think it's 2,226. Some think Sentry is still empty and others know it's live. Some think the photos are on a deprecated API and others think they're fixed. The gap between what the team believes is true and what is actually true is the widest it has ever been.

The founder needs to make one decision before any launch: **ship with 2,226 venues or revert to ~200 curated?** At ~200, every system works as designed -- cache fits in localStorage, cold-start costs 250 API calls not 2,773, Babel parses 400KB not 1.2MB, every venue has a curated photo. At 2,226, the weather cache silently breaks at 60% of venues, cold-start exhausts the API in 4 visits, and mobile users stare at a blank screen for 8+ seconds. The answer is probably "200 curated" -- but nobody has forced the decision because nobody agrees on what the number currently is. Reconcile CLAUDE.md. Pick a number. Tell the agents. Then launch.
---
