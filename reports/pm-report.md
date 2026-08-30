# Peakly PM Report v135 — 2026-08-30

**Status: 🟡 YELLOW — Day 8 post-launch. Meteorological autumn starts tomorrow. Ski pre-booking window opens with it. Two reports shipped overnight; zero venues shipped. 5 venue objects are copy-paste ready for a clean 400-venue milestone. Plausible dark 8 consecutive days. Reddit still unposted. Jack's to-do list is now 8 days identical.**

---

## Shipped Since Last Report (v134 → v135)

| Commit | What | Right call? |
|--------|------|-------------|
| `be8aa99` | DevOps report 2026-08-30 — YELLOW, Plausible dark Day 8, Open #23 VPS disk cache P1, 18 zombie branches P2 | ✅ Accurate infrastructure snapshot. Right housekeeping. |
| `9bcb364` | Content report 2026-08-30 — 94/100, 395 venues, Arolla Day 6 carry-over, 5 venues pending paste, gradient typo corrected | ✅ Right call. Gradient bug from Aug 29 is fixed in the code block. Safe to paste directly. |

**Jack shipped: nothing. Day 8.**

The agents are running reports on a codebase with no users and no analytics data. That's not sustainable. The only thing that breaks this loop is Jack taking 3 specific actions, all under 30 minutes combined. They're named below.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED
Pro was cut. Not in app.jsx. Non-issue.

### Sentry DSN — CLOSED
DSN `9416b032a46681d74645b056fcb08eb7` wired in both `index.html:77` and `app.jsx:7`. Live.

### Cache buster — CLOSED
`20260829a` is correct. No app.jsx edits today. No bump needed.

### Plausible Analytics — **P0 effective immediately**

8 days post-launch with zero analytics reviewed. The script is confirmed present (`index.html:32`, `defer`, correct domain `j1mmychu.github.io/peakly`). This is no longer a P1. Here's why it's a P0:

**If Plausible shows zero unique visitors in 8 days**, that means either (a) the script isn't firing, (b) GitHub Pages is serving stale content to some users, or (c) nobody has found the site yet — which means every roadmap decision made in v133/v134/v135 is speculation on top of a product that nobody is using.

**If Plausible shows >0 visitors**, then we have 8 days of user behavior data (bounce rate, airport set rate, top source) sitting unread that should be informing the Reddit post timing, venue prioritization, and onboarding completion rate.

Either scenario is a P0: one means broken instrumentation, the other means 8 days of ignored signal.

**One URL, 30 seconds: plausible.io → j1mmychu.github.io/peakly.**

### VPS Disk Cache — Open #23 (P1, pre-Reddit gate)
Unchanged. Still in-memory only. A `pm2 restart` during a traffic spike = cold cache = 429s from Open-Meteo = "conditions unavailable" for every new visitor. The 30-line patch is ready (`server/proxy.js`, DevOps Aug 27). Same SSH session as any other VPS work. Must land before the Reddit post.

### Arolla Ski Area — Day 6 Carry-Over, DEFER maintained
Still December season start. Still not pasteable until October. Content agent re-proposed it today. Same answer.

---

## Three Product Decisions — Aug 30

### Decision 1: 5 Venue Objects — Batch Call (Reaches 400-Venue Milestone)

All 5 objects are copy-paste ready in today's Content report (`9bcb364`). The Perhentian gradient typo is fixed. All 5 APs (GVA, OSL, CPT, KUL, DPS) verified in both `AIRPORT_COORDS` and `AP_CONTINENT`.

| Venue | Decision | Reason |
|-------|----------|--------|
| Arolla Ski Area (Day 6 carry-over) | **DEFER to October** | December season start. Dead inventory for 3 months if pasted now. Batch with other glacier ski adds in October. |
| Trysil, Norway | **SHIP NOW** | Norway's largest ski resort, zero Norwegian representation in 395-venue catalog. September 1 = ski pre-booking spike starts tomorrow. This is the single highest-ROI add available. Miss this window and it waits until next September to matter. |
| Camps Bay Beach, Cape Town | **SHIP NOW** | CPT spring starts September. Distinct from Clifton (already in catalog). Timing is correct. |
| Perhentian Islands, Malaysia | **SHIP NOW** | Gradient typo fixed in today's Content report. September dry season tail = correct timing. Copy directly from Content report, not Aug 29. |
| Nusa Lembongan, Bali | **SHIP NOW** | Third DPS venue, genuinely distinct. Correct September timing. |

**Net: 4 SHIP, 1 DEFER. 395 → 399 venues.** 399 is not 400. Do not defer Arolla to hit a round number — the milestone lands in October when Arolla ships. A forced round number is a product debt.

**The "400 milestone" narrative for Reddit should not be the hook.** The hook is conditions data. Venue count is a supporting credibility signal, not the headline.

### Decision 2: Reddit Post — October Is Now Locked

Today is Saturday August 30. The viable Saturday r/skiing window (8–10am ET) is past or closing. Tomorrow is September 1.

The September gap (Sep 1–15) is categorically wrong for a Reddit post:
- NH ski intent building but not live
- SH ski season ending
- Beach intent collapsing
- "Where should I ski this weekend?" is not a question anyone asks in meteorological autumn

The September 15 window that's been listed as an option in v133/v134 is rejected. There is no viable September window.

**October is the call.** First powder dusting at Mammoth/Snowbird/A-Basin typically hits mid-October. The editorial hook — "what if you could see actual forecast data for this weekend, not just historical averages" — is genuinely strong in that context. r/skiing goes from anticipation to active weekend planning in October.

**Locked: Reddit post fires in October. Targeting the first Saturday after a NH resort opens lifts or reports first snow. Pre-post gates (device test geo-block, VPS disk cache, one good screenshot) must land the week before.**

No more "we'll see." October is the decision. v136 will name the specific week.

### Decision 3: Venue Search — File It Now, Build It Before Reddit

v134 named venue search ("users think in named mountains, not algorithm scores") as the pre-post risk nobody was talking about. With Reddit locked to October, there are 4–6 weeks to address it. Filing it now as a P1 pre-Reddit gate, not a future roadmap item.

**The minimum viable fix:** a client-side text filter on the Explore grid that fuzzy-matches `venue.title + venue.location + venue.tags`. No new API, no new component. Wire it to the existing search bar (or a new input above the category pills). The SearchSheet is region/filter discovery — don't touch it. This is a grid-level text filter only.

**This goes on the build list for September.** A user arriving from Reddit who searches "Mammoth" and finds nothing is a product-ending first review. We have the time to prevent it.

---

## This Week's Top 3 Priorities

**1. Jack: read Plausible. One URL, 30 seconds.**

plausible.io → j1mmychu.github.io/peakly. Report back: total unique visitors Aug 22–30, bounce rate, top traffic source, airport set rate if visible. Every other decision in this report is calibrated against that number. If it's zero, that's a P0 bug we fix immediately. If it's >0, we have 8 days of user data to act on.

**2. Paste 4 venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan).**

Copy directly from today's Content report (`9bcb364`). Gradient typo is fixed there. Auto-push handles the commit. This takes 5 minutes. Trysil specifically is time-sensitive — ski pre-booking search peaks starting September 1, tomorrow.

**3. Lock October Reddit post timing: name the specific week by v136.**

The decision is October. v136 (tomorrow) should name the specific Saturday target — first Saturday after a confirmed NH resort opening or first snow report. This unblocks the pre-post gate checklist (device test, VPS cache, screenshot) which needs to start 7 days before the post.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Arolla Ski Area (paste now) | **DEFER** | December season; 3 months of dead inventory |
| September 15 Reddit post | **REJECTED** | Dead zone between beach and ski intent; wrong audience window |
| JSON-LD structured data | **DEFER** | Still no analytics to validate if SEO gap is a real traffic driver; low urgency pre-first-traffic |
| Static h1 fallback | **DEFER** | Same as JSON-LD |
| Score calibration display | **DEFER** | Blocked on Plausible bounce rate data; can't validate the hypothesis without it |
| 400-venue milestone post | **REJECTED as a hook** | Venue count is a credibility signal, not a headline. "We have 399 venues" is not a Reddit hook. Conditions + flight data is. |

---

## Success Criteria Check

**90-day projection: 5K–8K users. What separates 8K from 5K?**

| Factor | 8K path | 5K path |
|--------|---------|---------|
| Reddit timing | October post with first-powder hook, r/skiing in active planning mode | September post in the trough, poor velocity, algorithm downranked |
| Onboarding completion | >40% airport set rate from Reddit cohort (geo-block fix worked) | <25% airport set rate, users see globally unsorted venues, bounce |
| Venue search | Text filter live before Reddit post | No search, "it doesn't have Mammoth" kills the thread |
| Plausible data | Read week 1, iterated on by week 4 | Still dark at week 4, flying blind on every call |
| VPS disk cache | Deployed before Reddit post, handles spike gracefully | Cold cache hit during spike, conditions unavailable for first 30min of traffic |

All five factors are controllable. None require external dependencies. The 8K path is the October-post path with the pre-post gates done. The 5K ceiling is what happens if any of the five aren't in place.

---

## One Product Risk Nobody Is Talking About

**We are optimizing a product for an audience we have never observed.**

395 venues. Scoring engine. Onboarding flow. Price shimmer. All built, all deployed, all untouched by analytics for 8 days. The teams (agents + Jack) have been making product decisions based on hypotheses about what a Reddit user will do when they land on Peakly. We have tested none of them.

The specific hypothesis at risk: the scoring engine surfaces the right venues for the right user. The front page shows "Firing this weekend" venues sorted by weekend score. But we don't know if users scroll past the hero card. We don't know if the category pills are the first thing they tap. We don't know if "Weekend Score 87" means anything to someone who arrived from a ski subreddit expecting powder depth numbers.

**If users are landing, reading the score, and bouncing without tapping a venue**, the entire scoring display is wrong — not broken, wrong. That's a different class of problem than a bug. It requires a different class of fix (copy, not code).

8 days of Plausible data would answer this. The data exists. It hasn't been read.

---

*v135 — written 2026-08-30. Next report due 2026-08-31.*
