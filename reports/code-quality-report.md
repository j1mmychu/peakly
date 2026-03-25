# PEAKLY DAILY BRIEFING — 2026-03-25

## STATUS: YELLOW

Two fixes shipped today ($9/mo pricing + cache buster), but the flight proxy remains down for 3+ days and zero user-facing features have shipped since the UX 9.5 polish. Reddit launch is ready but every day without it is wasted distribution.

---

## SHIPPED TODAY

- **$9/mo -> $79/yr pricing fix** (PM agent, P1) -- prevents price anchoring damage before any real user sees it
- **Cache buster updated to v=20260325a** -- users now get fresh code
- **DevOps report v8** -- confirmed proxy is alive but rejecting requests (two bugs: HTTP-only + host restriction)

---

## DECISIONS MADE

| Decision | Source |
|----------|--------|
| GA4 CUT -- Plausible is sufficient, no second analytics tool | PM v8 |
| Offline/service worker CUT -- incompatible with live-data product | PM v8 |
| Dark mode CUT -- no signal it moves the needle | PM v8 |
| Trips + Wishlists tabs DEFERRED to 1K users -- 3-tab nav stays | PM v8 |
| Launch Reddit despite proxy down -- conditions are the hook, not flights | Growth v9 |

---

## BLOCKED

| What | Unblocked By | Specific Action |
|------|-------------|-----------------|
| Real flight prices for all users | Jack SSHs into VPS | `pm2 restart all` on 104.131.82.242, then set up HTTPS (Cloudflare tunnel, 10 min) |
| REI affiliate links (18 links earning $0) | LLC approval | External -- no action available |
| Backcountry, GetYourGuide affiliate links | LLC approval | External -- no action available |
| Peakly Pro subscription revenue | LLC + Stripe setup | External -- no action available |
| Production error visibility | Jack signs up at sentry.io | 5 min, paste DSN into line 6 of app.jsx |

---

## TOP 3 PRIORITIES THIS WEEK

1. **Post to r/surfing** -- Every day without distribution is a day the 11-agent infrastructure generates reports nobody reads. The post is written, analytics are live, the app renders. Ship it.

2. **Fix VPS proxy (SSH + HTTPS)** -- The flight proxy has been down 3+ days. Mixed content blocks real prices even when the Node process is running. Two bugs: (a) `pm2 restart all` to fix ECONNREFUSED, (b) Cloudflare tunnel for HTTPS. This is 30-45 minutes of Jack's time and it unlocks the "cheap flights" half of the value proposition for every user who comes from Reddit.

3. **Venue Detail Sheet polish (Phase 2.3)** -- This is the conversion surface. When a Reddit surfer taps a venue card, the detail sheet must sell the trip. Needed: sticky flight CTA at bottom, "Set Alert" button (code is written, 0 new state/props), score breakdown on badge tap. UX agent has all the code ready.

---

## RISKS

1. **Flight proxy down for 3+ days with no action taken.** This was flagged in 3 consecutive reports. The proxy Node process is alive but misconfigured (host restriction + no HTTPS). Every user sees "est." prices. If the Reddit post goes live and a commenter asks "are these prices real?" -- they're not. Be ready with a transparent answer and fix it within 48 hours of posting.

2. **Open-Meteo rate limit will silently kill the app during a Reddit traffic spike.** 342 API calls per user load = free tier exhausted after 29 concurrent users. No error banner, no fallback UI -- scores just drop to 0. A localStorage weather cache with 30-min TTL extends this to ~10K MAU. Build this before any post that could go viral.

3. **7 stub categories (1 venue each) are a credibility trap.** A Reddit surfer who taps "Diving" sees exactly 1 result. Data Enrichment agent has 10 paste-ready venues for diving, climbing, and kite. Adding them takes the total from 182 to 192 and makes those categories look intentional rather than abandoned.

---

## YOUR TO-DO LIST

1. **Post the r/surfing draft** -- Community agent wrote the complete post and 4-hour engagement playbook. Tuesday or Wednesday, 7-9am Pacific. Verify your Reddit account has 50+ karma on r/surfing first.

2. **SSH into 104.131.82.242 and run `pm2 restart all`** -- fixes ECONNREFUSED. Then set up Cloudflare tunnel for HTTPS (DevOps agent wrote the exact commands). Total: 30-45 min. This is the single highest-impact technical task.

3. **Sign up at sentry.io, paste DSN into app.jsx line 6** -- 5 minutes. Gives crash visibility before Reddit traffic arrives.

4. **Sign up for REI affiliate via Avantlink** -- 30 min, does NOT require LLC. 18 gear links currently earn $0. Estimated +$4.95 RPM.

5. **Verify the live app loads on your phone** -- open https://j1mmychu.github.io/peakly/ on mobile before posting to Reddit. If it errors, the launch is a no-go.

---

## ONE THING NOBODY IS SAYING THAT NEEDS TO BE SAID

Eleven agents are now producing senior-level reports, but the ratio of reports-to-shipped-code has inverted. The last 2 days produced 24 agent reports and 2 code changes (a pricing label fix and a cache buster bump). The agent infrastructure is built -- it works. But the reports are piling up with paste-ready code that nobody is executing: 5 Plausible events (UX + SEO agents, both wrote the exact same code), 10 new venues (Data Enrichment), hiking gear items (Revenue), JSON-LD structured data (SEO), a "Set Alert" button (UX, zero new state required), and 6 WCAG contrast fixes. That is roughly 90 minutes of copy-paste work that would move QA from 8/11 to 10/11, SEO from 81% to 94%, add a retention mechanic, and start generating real product analytics. The bottleneck is not analysis. The bottleneck is someone sitting down and applying the diffs. Either Jack does a 90-minute code session, or the next Claude Code run should be given a concrete list of paste-ready changes and told to execute them -- not analyze them again.

---

*Generated 2026-03-25 by Chief of Staff agent. Sources: all 11 agent reports + git log.*
