# Peakly PM Report v134 — 2026-08-29

**Status: 🟡 YELLOW — Day 7 post-launch. Last summer Saturday. Three carry-overs shipped overnight by the DevOps agent. 5 new venue proposals queued. Reddit window closing fast — today's r/skiing slot is the last viable summer Saturday, and it's already past prime. Plausible: still dark at day 7. Jack's to-do list is identical to v133.**

---

## Shipped Since Last Report (v133 → v134)

| Commit | What | Right call? |
|--------|------|-------------|
| `9297230` | 3 carry-over beach venues (Praia do Camilo, Nusa Penida, Gili Trawangan) + cache `20260829a` + DevOps report | ✅ Right call. These were SHIP or lose-until-2027 and the DevOps agent executed the v133 call correctly. Count: 392 → 395. |
| `2e7534a` | Content report Aug 29 — 96/100, 395 venues, Arolla Day 5 carry-over, 5 new proposals | ✅ Good quality report. 5 well-researched proposals. One gradient typo flagged inline (Perhentian Islands: `#2888508` → `#288850`) — needs fix before paste. |

**Jack shipped: nothing. Reddit: not posted. Plausible: not checked. VPS disk cache: not deployed. 7 days in a row.**

The agents are running the product. That's not a compliment — it means the human decisions blocking growth (post, analytics, infra) are 7 days overdue.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED
Pro cut. Not in app.jsx. Done.

### Sentry DSN — CLOSED
Live, wired.

### Cache buster — CLOSED
`20260829a` in lockstep.

### VPS Disk Cache — Open #23 (P1, P0 the moment Reddit fires)
Unchanged for 7 days. The 30-line patch is in `server/proxy.js` (DevOps Aug 27). It takes one SSH session. Today's Reddit window — if Jack chooses to post — makes this a pre-condition, not an enhancement. A traffic spike without disk cache = `pm2 restart` during the spike window = cold cache = 429s from Open-Meteo = every new visitor sees "conditions unavailable." That is a product-ending first impression.

### Arolla Ski Area — Day 5 Carry-Over, Scheduled DEFER
Correctly deferred by PM v133. Ski season starts December. Content agent re-proposed it today. Still defer. Will include in the October batch when pre-booking intent is actually live.

### Zombie Branches — P2
15+ `claude/*` branches on origin. This note has now appeared in 4 consecutive reports with no action. Removing from the open-issues block after today. It's documented. If it matters, it'll get fixed. If it doesn't get fixed, it wasn't actually P2.

---

## Three Product Decisions — Aug 29

### Decision 1: 5 New Venue Proposals — Batch Ruling

Content agent delivered 5 proposals (1 carry-over + 4 new). Here's the call on each:

| Venue | Decision | Reason |
|-------|----------|--------|
| Arolla Ski Area (carry-over) | **DEFER to October** | Ski season starts December. Posting in the sorted venue grid in August is dead screen real estate for 3 months. Same call as v133. |
| Trysil, Norway | **SHIP** | Norway's largest ski resort, zero catalog representation until now. September is the pre-booking window for European ski — this exact venue is what r/skiing users search in September. Paste it. |
| Camps Bay Beach, Cape Town | **SHIP** | Cape Town spring starts September. CPT is a real travel hub. Distinct vibe from Clifton (already in catalog). Scoring engine will surface it at the right moment. |
| Perhentian Islands, Malaysia | **SHIP — fix gradient first** | September dry season tail makes this timely. **However: the code object has a gradient typo: `#2888508` (7-digit invalid hex) → must be `#288850` before paste.** Content agent flagged this but left the typo in the code block. Fix inline before pasting. |
| Nusa Lembongan, Bali | **SHIP** | Third DPS venue but genuinely distinct: surf culture + no-cars island vs. Penida (cliffs) vs. Gili T (party island). The DPS cluster is the right depth — Bali is the world's most searched island destination. |

**Net: 4 SHIP, 1 DEFER. Eval count goes 395 → 399.** Jack pastes 4 venues. Auto-push handles the rest.

**Note on the 400-venue milestone:** 395 + Arolla (deferred) = 400 exactly. But shipping 4 today gets to 399, not 400. Don't hold the deferred venue just to hit a round number — the milestone is a marketing asset, not a product constraint. When Arolla ships in October, that's the 400 callout moment.

### Decision 2: Reddit Post — Today's Window is Closing. Name the Date or Commit to October.

**Today's status (Sat Aug 29, late morning):** The Saturday r/skiing window (8–10am ET) from v133's analysis is now past or closing depending on time zone. This is the last summer Saturday with any plausible "ski this weekend" hook. After today:

- **Sep 1–14:** Dead zone. Meteorological autumn but no ski season. r/skiing is full of "season opener" anticipation content — a Peakly post about "where to ski this weekend" lands in that feed as irrelevant noise. Beach search intent collapses. This is the worst possible fortnight to post.
- **Sep 15:** Content agent floated this. Still risky — NH ski intent is building but not live. SH ski season is ending. The only editorial hook that works in mid-September is "plan your opening weekend now" and Peakly doesn't have a planning mode, it has a "this weekend" mode.
- **Oct 10–31:** The correct Reddit window for ski. First NH lifts spinning (Mammoth, Snowbird, Arapahoe Basin), r/skiing goes from anticipation to active planning. "What if you could see which resorts have the best conditions THIS weekend?" is a genuinely strong hook in that context, backed by real forecast data.

**The call:** If the v133 pre-post gates (device test geo-block, VPS disk cache, one good screenshot) haven't happened by end of today, the decision is **October, not September 15.** September 15 is a trap — it's the trough between beach intent and ski intent and a weak post in that window is worse than no post (subreddit downvotes train the algorithm against Peakly before the real audience shows up).

**Jack's action:** Pick today or October. "We'll see" is now 7 days old and it's not a decision.

### Decision 3: Plausible Data — This Is Now P1, Not a Reminder

7 days post-launch, zero analytics data reviewed. This has been in every report since Aug 22 as "Priority 1." It's being treated as a reminder. It's not a reminder. **Plausible's free plan shows unique visitors, pageviews, bounce rate, and top sources in a public dashboard that takes 30 seconds to read.** If the number is zero unique visitors in 7 days, that's a P0 bug — either the script isn't firing or GitHub Pages deployment broke something. If it's >0, every product decision from here forward (venue focus, Reddit timing, photo investment) should be made against that number.

**Decision: Plausible data is now the highest-priority input to every call in this report. Until it's reviewed, every other roadmap decision is speculation.**

---

## This Week's Top 3 Priorities

**1. Jack: read Plausible dashboard for Aug 22–29. Report total sessions, bounce rate, airport set rate, top traffic source.**

Not a suggestion. Every roadmap call in this report is blocked behind this number. 30 seconds at plausible.io.

**2. Paste 4 venues into app.jsx (Trysil, Camps Bay, Perhentian Islands [fix gradient], Nusa Lembongan).**

September transition = ski pre-booking + tropical beach. These 4 are timed correctly. Perhentian Islands: fix `#2888508` → `#288850` in the gradient string before pasting.

**3. Name the Reddit post date. Today or October — pick one.**

The September 15 option from v133 is off the table. If today's pre-post gates (device test + VPS cache + screenshot) aren't done, October is the correct call and it's a better hook. "We'll see" doesn't get to v136.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Arolla Ski Area (paste now) | DEFER to October | Ski season December start; August paste is dead inventory for 3 months |
| September 15 Reddit post | REJECTED as an option | Dead zone between beach intent and ski intent; subreddit downvotes during trough train algorithm against Peakly before real audience shows up |
| JSON-LD structured data | DEFER | No analytics data to validate whether SEO gap is a real traffic driver; accrues over months, not weeks |
| Static h1 fallback | DEFER | Same as JSON-LD |
| Score calibration anchors ("only 12% of venues score above 80") | DEFER until Plausible shows bounce rate | Strong idea (v133 risk section). Can't validate if score trust is the bounce cause without data. |
| Zombie branch cleanup | REMOVED FROM REPORT | Has been P2 in 4 consecutive reports, no action taken. Jack knows. |

---

## Success Criteria Check

**90-day projection: 5K–8K users. What has to be true for 8K, not 5K?**

Same framework as v133, updated for today's reality:

1. **Reddit post in October, not September.** A September post in the trough window could actively hurt — a bad initial velocity signal trains subreddit algorithms against the post before the ski audience is watching. October post with a genuine "first powder weekend" hook is the 8K path; a September post that goes 0.1K is the 5K ceiling.

2. **Plausible shows >30% airport set rate from the Reddit cohort.** Users who set an airport get personalized pricing and geo-sorted venues. Users who don't see a globally unsorted list with no pricing. The onboarding completion rate is the funnel bottleneck. If the geo-silent-block fix (shipped Aug 26) worked, location detection completes within 12s and onboarding converts. If it didn't, the entire Reddit-driven cohort bounces with no venue relevance signal.

3. **Score trust problem stays theoretical.** v133 identified score calibration as a product risk. If Plausible shows >65% bounce rate on Reddit traffic, that's the hypothesis to test. If bounce is <55%, the product lands and score trust isn't the issue. Right now it's a hypothesis, not a confirmed problem.

**None of these can be confirmed until Plausible data exists.** 7 days post-launch.

---

## One Product Risk Nobody Is Talking About

**We have 395 venues and no search.**

Every venue discovery path is scoring, filtering, and sorting. There is no text search. A user who arrives from a Reddit post about "ski this weekend" and types "Mammoth" into any input box gets... nothing, or a filter they don't understand. The venue is in the catalog but inaccessible by name.

This matters at the moment Reddit traffic arrives. Reddit users are specific — they think in named mountains and beaches, not algorithm scores. A Mammoth local who reads the post and searches "Mammoth Mountain" and can't find it will post "it doesn't even have Mammoth" in the comment thread. One comment like that tanks upvote velocity.

The fix isn't complex — a simple name-match filter on the Explore grid (or an autosuggest on the search bar) with fuzzy matching against `venue.title + venue.location + venue.tags`. But it's not trivial either — the SearchSheet is designed around region/filter discovery, not named search.

**This isn't a P0 today because the live site has no Reddit traffic.** The moment the post goes up, it becomes a first-session product problem. Filing it as the pre-post risk to evaluate before the October post, not a roadmap item yet.

---

*v134 — written 2026-08-29. Next report due 2026-08-30.*
