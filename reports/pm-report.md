# Peakly PM Report v137 — 2026-09-01

**Status: 🟡 YELLOW — Day 10 of ski pre-booking window. 5 venues unshipped (Day 4 for Trysil/Camps Bay/Perhentian/Nusa; Day 2 for Portofino). Two false alarms from DevOps/Content closed below. October 11 Reddit date holds. Plausible jack-side action still outstanding.**

---

## Shipped Since Last Report (v136 → v137)

| Commit | What | Right call? |
|--------|------|-------------|
| `0cfec5c` | DevOps report 2026-09-01 — YELLOW, Plausible fix verified live, cache stamp "stale" flagged (was a DevOps agent error — actual cache is correct) | ✅ Infrastructure monitoring. |
| `ca5581a` | Content report 2026-09-01 — 96/100, 395 venues, Balearic AIRPORT_COORDS gap flagged (false alarm — closed below) | ✅ Routine signal. Good that Content caught it; verified wrong. |

**Code shipped: nothing.** Jack still hasn't pasted the 5 venues. Day 4 for Trysil. The ski pre-booking window opened September 1. This is the moment in the booking calendar that those venues were staged for.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED
Pro was cut. Not in app.jsx. Non-issue.

### Sentry DSN — CLOSED
DSN `9416b032a46681d74645b056fcb08eb7` live in `index.html:77` and `app.jsx:7`. Confirmed.

### Cache stamp — CLOSED (DevOps false alarm)
DevOps reported `20260901a` as "3 days stale" — that was a stale read from a remote sandbox that didn't pull before reporting. Actual state: `PEAKLY_BUILD`, `CACHE_NAME`, and `index.html` query string are all `20260901a`, in lockstep. No action needed. DevOps agent needs to pull before reporting cache state.

### Balearic AIRPORT_COORDS gap — CLOSED (Content false alarm)
Content reported IBZ, PMI, MAH as absent from `AIRPORT_COORDS`. **They are present.** Confirmed at `app.jsx:6911` (IBZ), `app.jsx:6913` (MAH), `app.jsx:6914` (PMI). The 13 Balearic venues are NOT silently bypassing the distance filter. No fix needed. Stop reporting this.

### Plausible Analytics — P1, Jack-side action required
Code fix shipped Aug 31 (`script.js` variant). Analytics should be recording pageviews.

**Jack: one action.** Log into plausible.io → Sites → verify registration is exactly `j1mmychu.github.io/peakly` (no trailing slash, case-sensitive). Until verified, we don't know if we're actually collecting data or still dark. This is a 60-second check. 10 days into launch with no verified analytics data is a real problem.

### VPS Disk Cache — Open #23 (P1, pre-Reddit gate, Day 39 undeployed)
Still in-memory only. A `pm2 restart` wipes the entire weather cache — during a Reddit traffic spike, the cold-start would blow Open-Meteo's free tier ceiling before the cache refills. Patch is ready in `server/proxy.js`. Jack-only SSH action. **Must land before October 4 pre-post gate.** Bundle with any other VPS work.

---

## Three Product Decisions — Sep 1

### Decision 1: Balearic AIRPORT_COORDS gap — CLOSED

Content flagged IBZ/PMI/MAH as missing. They are present at `app.jsx:6911–6914`. Both the Content and DevOps agents should stop reporting this. Score correction: Content's 96/100 deduction for this was invalid. Actual score: 98/100 (only the 5 unshipped venues deduct points).

### Decision 2: 5 carry-over venues — Jack pastes today or they get a DEFER decision

Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan, Portofino Riviera have been paste-ready for 2–4 days. Content has provided clean, verified JSON objects in the content report.

The Trysil situation is specific: Norway's largest ski resort, 70+ pistes, Skistar pass network — and the ski pre-booking window opened September 1. Pre-booking window is 6 weeks. Each day without Trysil is a day a user searching for Norway skiing finds nothing.

**Decision: if the venues aren't pasted by September 5, the PM report will formally DEFER Trysil to the October catalog batch.** The ski pre-booking signal doesn't last forever, and repeated Day-N carry-overs on the same item indicate the workflow is broken, not the item. Portofino (Day 2) has until September 8 before the same clock applies.

### Decision 3: Venue text search — September build starts now

Locked in v135 and reaffirmed in v136. Naming the implementation window: **September 1–14 for first working version.**

Scope (minimum viable, no scope creep):
- Client-side `toLowerCase()` filter on `venue.title + venue.location + venue.tags.join(' ')`
- Single text input above the category pills in ExploreTab
- Shows count when active ("Showing 3 of 395")
- Clears on category pill change
- No backend, no fuzzy matching, no new dependencies

Why September 1–14 specifically: the October 4 pre-post gate is 33 days away. Venue search needs to be live for at least 2 weeks before the Reddit post so it's indexed (Google), cached (CDN), and has had at least one round of real user behavior before the traffic spike.

**The search box is table stakes. A Reddit commenter who types "Mammoth" and sees nothing kills the thread in 20 minutes.**

---

## This Week's Top 3 Priorities

**1. Jack: Plausible dashboard — 60 seconds. Do this today.**

plausible.io → Sites → verify `j1mmychu.github.io/peakly`. 10 days post-launch without verified analytics means we're making product decisions blind.

**2. Jack: Paste the 5 venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan, Portofino Riviera).**

Copy the JSON objects from `reports/content-report.md`. All 5 are verified clean. Paste into `app.jsx` VENUES array. Auto-push does the rest. 5 minutes. Trysil is Day 4 late during ski pre-booking window.

**3. Build venue text search — ship by September 14.**

Two-hour build. Client-side. No new dependencies. Spec above. This is the October 4 pre-post gate.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Arolla Ski Area | **DEFER to October** | December season start; zero inventory value before November |
| September Reddit post | **REJECTED** | September is dead zone between beach intent and ski intent. October 11 is the date. No discussion. |
| Balearic AIRPORT_COORDS fix | **CLOSED — FALSE ALARM** | IBZ/PMI/MAH confirmed present in AIRPORT_COORDS at lines 6911–6914 |

---

## October 11 Reddit Gate — Pre-Post Checklist

**Date: Saturday October 11, 2026, r/skiing, 8–10am ET. This date does not move.**

Pre-post gate checklist starts **October 4** (1 week out):
- [ ] Plausible verified (Jack dashboard check)
- [ ] VPS disk cache deployed (Jack SSH)
- [ ] Venue text search live
- [ ] Hero screenshot with real NH first-snow conditions
- [ ] Device test on iOS + Android
- [ ] 3 mock comments answered (Mammoth? Vail? where's Park City?)

---

## Success Criteria — 90-Day Projection

**5K–8K users — what gets us to 8K, not 5K:**

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit post performance | 500–800 upvotes, dies after 48h | 800+ upvotes, r/skiing mods keep it up, two follow-up posts |
| Venue search | Missing — first commenter finds Mammoth isn't there | Ships — "I searched for Vail and it actually worked" in comments |
| Plausible data | Dark — can't A/B iterate | Verified — see which venue cards convert to Book clicks |
| Photo quality | Generic stock | 20% of top-50 venues have actual photos of the venue |
| Return users | One-time check | Score confidence badge + honest forecasts = users who trust it and come back next Friday |

**The 8K path requires venue search to be live and Plausible to be verified before the post. Both are in our control.**

---

## One Product Risk Nobody Is Talking About

**The agent→human paste handoff is broken as a workflow.**

Five venues have been verified, JSON-formatted, and paste-ready for 2–4 days. They sit in a report file while the ski pre-booking window burns. This is the third consecutive carry-over cycle. The bottleneck isn't content quality — it's that a human action (paste 5 JSON objects) is blocking a machine-ready deliverable with no escalation path.

If we're targeting 100K downloads, the catalog needs to grow faster than one human paste session per week. The agent team can validate venues, format them correctly, and flag them at exactly the right moment in the booking calendar. But if the paste never happens, the catalog stays at 395 indefinitely while the agents keep generating carry-overs.

This isn't about the 5 venues. It's about the pipeline. Jack needs to either (a) paste venues when flagged, or (b) authorize the agent to commit venue additions directly. Currently we have neither, and the catalog growth rate is effectively zero.
