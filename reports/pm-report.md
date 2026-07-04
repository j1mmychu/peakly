# Peakly PM Report — 2026-07-04 (v78)

> Supersedes v77 (July 3). **Status: YELLOW — code green, distribution unconfirmed from sandbox.** Today is July 4. If the June 30 Reddit post happened, we're in Day 4 post-launch with real Plausible data sitting unread. If it didn't, the July 4 hook is live right now — people are planning beach weekends today, the app is peak-seasonal, and this is the last good window until Labor Day. Either way: act today, not Monday.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Pivot May 2026. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260704a` — bumped by DevOps this run.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403s = egress block. Not VPS outage. Stop.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25).** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "Duplicate commit pattern" | **Known-skipped June 25.** Stop. |
| "197 empty-tag venues" | **FALSE. All 370 have tags.** Stop. |
| "40 ski venues had 1 tag" | **FIXED June 26.** Stop. |
| "Plausible data-domain scoped wrong" | **Known. Fix is in July 7 sprint.** Stop. |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "Venue count 372" | **370 is correct.** Stop. |
| "Venue freeze expires July 3" | **Extended through July 7 per v76.** Stop. |

---

## Shipped Since v77 (2026-07-03 → 2026-07-04)

| What | Verdict |
|------|---------|
| **DevOps July 4** (`613832b`) — GREEN. Cache bumped `20260703a→20260704a` in lockstep. Braces 5565/5565. GEAR_ITEMS 0. Sentry active. No regressions. | ✅ Clean ship. |
| **Content July 4** (`643d2a9`) — 74/100 (unchanged). 370 venues, 5 placeholder-tag venues, 3 dups, 27 surf-legacy tags all held to July 7. One new code hygiene flag (Plausible domain scope — already known P2). Venue freeze confirmed. | ✅ No changes. Freeze holding. |

**Code state July 4:**
- `app.jsx`: 13,443 lines · cache `20260704a` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- 138 unique photos · max repeat 3× · 0 empty-tag venues · 131/131 skiPass
- Sentry DSN: active · Plausible: wired · Supabase lazy-load: confirmed

---

## Bug Triage — July 4

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread (if launched June 30)** | **P0** | 4 days of real user data sitting in the dashboard. Jack: open Plausible NOW. Pageviews, top venues, filter clicks, bounce rate. This data drives every July 7 decision. |
| **Reddit post not yet verified** | **P0 (if not done)** | Cannot confirm from sandbox. If not done — post today, July 4 holiday, beach-planning traffic is live right now. |
| **VPS cache restart risk** | **P1** | v77 flagged: if VPS rebooted since June 30, in-memory weather cache reset to zero. Users hitting the app since then got direct Open-Meteo → free tier exhausts at 13 concurrent users → venues score at 50. Jack: `curl https://peakly-api.duckdns.org/health` + check `pm2 describe peakly-proxy` uptime field. If uptime < 4 days, restart happened; `pm2 restart peakly-proxy` to reprime. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | `server/sql/delete-account.sql` → Supabase SQL editor. Graceful fallback on web. Jack-only. Still not done after 26 days. |
| **Plausible `data-domain` scope** | P2 | `j1mmychu.github.io` captures all pages on that subdomain. If another project shares the subdomain, Week 1 pageview data is polluted. 2-minute fix. Goes in July 7 sprint. |
| 5 placeholder-tag ski venues | P2 | 3 are lateSeason — can surface in July Ski grid. Fix staged in content report. July 7. |
| `beach_miami` exact dup | P2 | Invisible to users (different IDs). July 7. |
| 27 surf-legacy tags | P2 | Detail-sheet only. July 7. |
| Photo reuse 2.7× avg | P2 | Post-freeze sprint. Needs 50 new photos — not a quick fix. |
| SRI on CDN scripts (Open #10) | P3 | DEFER post-LLC. |
| 14 orphaned `claude/` branches | P4 | Not blocking. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Plausible read** (if June 30 launch) | Week 1 data drives all decisions | Day 4 |
| **Reddit post** (if not done) | Users. The July 4 hook expires tonight. | Day 30 |
| **VPS health verify** | Weather proxy confirmed live | Day 20 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 26 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |
| Apple Developer ($99) | App Store submission | Post-launch |

---

## Explicit Product Decisions — July 4

### Decision 1: The mode shift — from "launch" to "read and respond."

v73 through v77 have been launch-pressure reports. Every one ended with "post today or lose the window." That loop ends here regardless of what happened June 30.

**If the June 30 Reddit post happened:** We are in post-launch mode. The July 4 holiday traffic is a second wave — people who didn't see the Reddit post but are actively searching for beach weekend ideas today. The job is not to post again; it's to read what Plausible shows about the first 4 days and respond:
- Highest-viewed venues → prioritize their detail sheet quality
- Most-clicked filter → lead the sprint with that category's content gaps
- Bounce rate > 80% → investigate the copy-to-product gap
- Signups → write the personal retention email for July 10

**If the June 30 post didn't happen:** Post today, July 4, before noon ET. Then enter the same post-launch read mode above. The July 4 holiday is a legitimate launch hook — not a consolation prize. Beach-weekend intent traffic is genuinely elevated today.

**SHIP: Whichever path applies — act, then read. No further escalation in v79+.**

---

### Decision 2: The July 7 sprint is locked. Execute in this order.

The freeze lifts July 7. This is the sprint:

| Order | Task | Why This Order |
|-------|------|----------------|
| 1 | **Read Plausible + Sentry** (if not done by July 5) | All other decisions depend on Week 1 signal. Don't touch code until data is read. |
| 2 | **Personal email to signups** — Jack, from jjciluzzi@gmail.com | Week 1 retention cohort. Send Thursday July 10. Write draft now. |
| 3 | **Fix Plausible domain scope** (`j1mmychu.github.io` → `j1mmychu.github.io/peakly`) | 2 min. Makes all future data trustworthy. Do this before July 10 so the personal email arrives inside a clean measurement window. |
| 4 | **Placeholder tags on 3 lateSeason ski venues** (Winter Park, Copper Mountain, Lake Louise) | These can appear on the July ski grid. Bad copy = trust erosion on a venue a user might book. Fix-ready code in content report. 15 min. |
| 5 | **Remove `beach_miami` exact dup** | 5 min. Keeps venue count honest. |
| 6 | **Remove 27 surf-legacy tags** | 20 min. Detail-sheet only but wrong category metadata is a minor trust hit if a user notices. |
| 7 | **Supabase SQL paste** | 2 min. Activates App Store compliance. |

Items deferred past July 7:
- Photo dedup ≤2× (needs 50 new photos, not a sprint task)
- SRI hashes on CDN (post-LLC, P3)
- JSON-LD structured data (wait for Plausible to show search traffic exists)
- Venue deep links (wait for >100 detail views/day on specific venues)
- New venues (post-July 7, only if Plausible shows demand for a geography or category gap)

**DEFER: Anything not in the table above. The July 7 sprint is hygiene, not features.**

---

### Decision 3: The 90-day plan enters Week 2. The KPI framework changes.

Pre-launch KPI: "has the post gone up?"
Week 1 KPI (July 1–7): "how many people came, how many stayed?"
**Week 2 KPI (July 8–14):** "how many Week-1 users came back for the July 11-14 weekend?"

The Day-8 return rate is the retention number that determines whether Peakly is a product or a one-time curiosity. Open-Meteo gives 7-day forecasts — users who came July 4 have a reason to return July 11 (the next weekend). The personal email from Jack on July 10 is the nudge.

**SHIP: Measure Week-2 return rate as the primary KPI from July 8 forward. Secondary: filter click distribution (Beach vs. Skiing tells you which category needs the most content work).**

---

## This Week's Top 3 Priorities Only

**1. Jack: Open Plausible today. 30 minutes. Read the Week-1 signal.**

If the post went up June 30, there are 4 days of data. Look for: pageviews (distribution volume), filter usage (which pill gets clicked most), bounce rate, and venue detail opens. These four numbers determine the July 7 sprint priorities. Don't build anything until you've read them.

**2. Jack: VPS health check — `curl https://peakly-api.duckdns.org/health`.**

Check the `uptime` in `pm2 describe peakly-proxy`. If the VPS rebooted since June 30, users during the Reddit spike saw degraded scores (venue score 50, no weather data). Knowing this matters for interpreting any anomaly in the Plausible bounce rate — a bad-score first impression is different from a product-narrative mismatch.

**3. Jack: Draft the personal Week-1 retention email today, send July 10.**

Subject: "Hey — how'd Peakly do for you?"
Body: 3 sentences. (1) I built this, (2) you signed up last week, (3) what did you actually search for? Ask one question. The response rate to a founder-to-user email in Week 1 is 15–30%. That's product gold. This is worth more than any feature built this week.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| New venue categories (climbing, surf, hiking) | Zero users have validated demand. CUT for v1. |
| Any new venues this week | Freeze holds until post-July 7 data read confirms demand gap. CUT. |
| Peakly Pro / subscription | No price-sensitivity signal at unknown MAU. DEFER to 1K. |
| Hotel integrations in deal score | Scope creep. CUT for v1. |
| JSON-LD structured data | SEO investment before traffic confirmation is premature. DEFER post Week-1 read. |
| Venue deep links / permalink pages | Build after Plausible shows >100 detail-sheet opens/day. DEFER. |
| Automated email digest | No email list confirmed yet. Manual founder email first. DEFER code. |
| SRI hashes on CDN scripts | P3 security hardening. Post-LLC. DEFER. |

---

## Success Criteria — What Has to Be True for 8K, Not 5K?

The 90-day window runs through October. Three gate metrics:

1. **Week-1 traffic ≥ 2K unique visitors** — the minimum viable distribution signal. Below 2K means the Reddit post copy didn't land, or the subreddit wasn't right, or both. Below 2K = repost with different copy in a different subreddit before August.

2. **Week-2 return rate ≥ 20%** — the retention gate. If fewer than 1 in 5 Week-1 users comes back for the next weekend, the product doesn't have enough pull on its own. Below 20% = the personal email and the onboarding experience both need work before the October re-launch for ski season.

3. **Beach filter click rate ≥ 40% of filter interactions** — beach dominates the summer catalog (239 of 370 venues, 184 in-season). If users are clicking Skiing more than Beach in July, there's a seasonal narrative mismatch that needs a copy fix before Labor Day.

For 8K specifically: the organic growth loop needs to kick in by Week 4. If the "share a weekend plan" social mechanism isn't driving 5+ referrals/week by July 28, the 8K ceiling requires a second Reddit post in August + early October ski-season launch. Both are in scope.

---

## One Product Risk Nobody Is Talking About

**The July 4 data will be misleading if treated as baseline.**

Today is a US federal holiday. Beach search intent is atypically high — people are actively planning weekend getaways, families are looking for summer travel ideas, and the "July 4 weekend" is already underway. If Peakly got meaningful traffic today (from the Reddit post or organic), the pageview number for July 4 will be elevated above any normal Saturday by 2–4×.

The risk: if Jack reads the Plausible dashboard on July 5 and sees "500 pageviews" on July 4 and "120 pageviews" on July 5 as a drop, and interprets that as a bounce signal — he'd be reading the holiday effect as user attrition. The correct comparison for retention is:
- July 4 (holiday) vs. July 11 (next Saturday, same intent)
- July 5 (Saturday) vs. July 12 (the following Saturday)

Don't measure "did users come back the day after July 4" — measure "did users who came on July 4 come back the next weekend." The 7-day window is the product; the retention measurement should be 7-day, not 24-hour.

**This is a Plausible reading error, not a product error. Know it before you open the dashboard.**

---

*Report written by PM agent — 2026-07-04 (v78). Status: YELLOW → shifting to post-launch read mode. The launch pressure loop ends here. Next is data.*
