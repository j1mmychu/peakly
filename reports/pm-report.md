# Peakly PM Report v145 — 2026-09-09

**Status: 🔴 RED — Venue search still unbuilt. 5 days to Sep 14 hard deadline. Third consecutive day of zero code commits. Reddit launch (Oct 11) is now at risk.**

---

## Shipped Since Last Report (v144 → v145)

| Commit | What | Right call? |
|--------|------|-------------|
| `510a0e5` | Content: 95/100, lateSeason false-alarm corrected (15 confirmed), 405 venues Day 4 | ✅ Correct. False alarms resolved. Signal clean. |
| `5d1d68b` | DevOps: YELLOW, BASE_PRICES 100% confirmed, VPS Day 47 | ✅ Correct. Two prior false alarms acknowledged. |

**Net code change this cycle: 0.** No app.jsx commits in 3 days (last: Sep 7, AGP/AKL/GRU fix).

---

## Addressing the Scheduled Prompt's Bug List

### Peakly Pro price ($9/mo vs $79/yr)
**Not applicable.** Peakly Pro UI was removed in April 2026. `grep -c GEAR_ITEMS app.jsx` → 0. No Pro pricing anywhere in code. The scheduled prompt was written when Pro still existed. This is a stale finding — no action needed, no bug to fix.

### Sentry DSN empty
**Not applicable.** DevOps confirms Sentry DSN is active and wired at `app.jsx:8` and `index.html:77`. The live site has error monitoring. No action needed.

### Cache buster stale
**Not a bug.** Cache stamp `20260907a` is Day 3 with no app.jsx changes. Per auto-push policy, the stamp only bumps when source files change. No edits → no bump. This is correct behavior. DevOps confirmed. Not a blocker.

---

## Bug Triage

### Venue text search — P0 (5 days to Sep 14 deadline)

**Reclassified from P1 to P0.** With 5 days until the Sep 14 gate and 3 consecutive days of no progress, this is now existential for the Oct 11 Reddit launch window.

The inline search input does not exist. Confirmed via code grep: `search.destination` filter exists in `applyFilters` at line 8732 (functional logic), but it's exposed only through SearchSheet UX (tap the "Anywhere · This weekend" bar → sheet opens → type → apply → close). The spec calls for an always-visible `<input>` above the category pills. Not built.

**The spec is locked. It is not changing:**
- `<input>` above category pills, placeholder "Search venues…"
- `toLowerCase()` filter on `venue.title + venue.location + venue.tags.join(' ')`
- Result count shown when active ("12 results")
- Clears on category pill change
- No server calls, no debounce — pure client-side

Estimated build: 2 hours. `applyFilters` already has the filter logic at line 8732. This is literally wiring a `<input onChange>` to a `useState` and threading the value into the existing filter. There is no algorithmic work remaining.

**Sep 14 = last day to ship before the Oct 11 Reddit window gates.** Miss it and launch shifts to Oct 18 — losing the peak Sep/Oct ski pre-booking traffic window.

### VPS Redeploy (Open #19/#21/#23) — P1 (Day 47)

Jack's hands required. 5-minute SSH task. Deploy command is in the DevOps report verbatim. Every day without it: two-weekend scoring broken, iOS CORS blocked, alert deletion silently failing.

This is not growing — it doesn't get worse day 47 vs day 40. But it must be done before any Reddit traffic arrives. Standing P1 until resolved.

---

## Three Product Decisions — Sep 9

### Decision 1: Venue search — SHIP TODAY, NOT "THIS WEEK"

"This week" was v144's framing. That framing is now wrong. 5 days × "we'll get to it" = missed deadline. The build is 2 hours. This session or the next code session needs to build it. No more deferrals, no more scheduling. The spec is pinned above. Go.

### Decision 2: Peakly Pro pricing — CLOSED (stale finding)

The scheduled prompt's "$9/mo vs $79/yr" discrepancy: Peakly Pro UI was removed in April 2026. No Pro pricing exists in the code. The scheduled task prompt was written against an older codebase. This finding is permanently closed — stop checking for it.

### Decision 3: S-hemisphere ski subreddit timing — ACT THIS WEEK OR MISS THE WINDOW

NZ and Australia ski seasons close late September. r/skiing NZ and r/skiing Argentina/Chile are active now. We have venues scoring well: Cardrona (CHC), Falls Creek/Mt Buller (MEL), Cerro Catedral (BRC), Las Leñas (MDZ). This is a no-code marketing opportunity — targeted posts in ski subreddits before their season closes. No build required. Two-week window. Someone needs to pull the trigger.

**Decision: Jack should consider a pre-Reddit S-hemisphere ski post this week.** If Oct 11 is the main event, nothing stops a S-hemisphere soft-launch now. Two benefits: real user signal before the big post, and access to a subreddit audience that's actively planning end-of-season trips. Not on the critical path — but the window closes by Sep 20.

---

## This Week's Top 3 (Sep 9–14)

**#1: Build venue search.** 2-hour build. 5 days left. The only thing standing between current state and Reddit launch. Spec pinned above. No more delay.

**#2: Jack: VPS redeploy.** 5-minute SSH task. Day 47. Pre-Reddit gate. Deploy command is in the DevOps report.

**#3: Consider S-hemisphere ski subreddit post.** No code. Real user signal. Window closes ~Sep 20.

---

## Features Rejected This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Fuzzy/ranked search | ❌ CUT | Scope creep on the locked spec. Substring match is sufficient for 405 venues. |
| 5 pending venue proposals | ❌ DEFERRED | Catalog is unsearchable until search ships. Adding to an unsearchable list is waste. |
| Photo pipeline | ❌ DEFERRED | Requires Unsplash key + manual review. Not blocking Oct 11. Post-Reddit. |
| App Store submission | ❌ DEFERRED | LLC + VPS + Xcode signing. Three blockers, none agent-buildable this week. |
| iOS widget Xcode wiring | ❌ DEFERRED | Code-complete. Not blocking Reddit. Post-Oct-11. |
| Tag density backfill (239 venues <4 tags) | ❌ DEFERRED | Real gap (costs 5/100 on content score), but a bulk editing session, not a this-week task. |
| Mid-week "no results" state polish | ❌ DEFERRED | Real UX gap, not worth delaying search. Queue for post-launch. |
| S-hem ski venue additions | ❌ DEFERRED | Don't add to unsearchable catalog. Post-search. |

---

## Success Criteria

**90-day projection: 5K–8K users.** What separates 8K from 5K:

1. **Oct 11 Reddit launch hits** — requires venue search by Sep 14. This is the gate.
2. **VPS redeployed before the post** — Open-Meteo rate ceiling at spike traffic is existential. A 10K-impression Reddit post with 66+ concurrent DAU saturates the free tier and serves weather errors to everyone who shows up.
3. **Photo quality improves** — generic stock is the first thing Reddit will call out in comments. Even 20–30 verified photos on high-traffic venues (Whistler, Chamonix, Bora Bora, Santorini) would materially reduce roasting.
4. **S-hem ski timing** — Andes + NZ active right now. Pre-launch post optional but high-upside this month.

**The delta between 5K and 8K is items 1 and 2.** Both executable this week. Both blocked on execution, not tech.

---

## One Product Risk Nobody Is Talking About

**The content score deduction for tag density (239 venues, <4 tags) is not cosmetic — it's a search quality problem.**

When venue search ships, users searching for "surfing" (yes, some will try), "reef", "powder", "family", "beginners" will get empty results or partial results because these concepts live in tags that aren't there. 59% of venues have 2 tags. The search spec filters on `venue.tags.join(' ')`. A search for "powder" returns nothing if the venue's 2 tags are "Skiing" and "Europe."

The tag gap isn't a data quality metric — it's a product defect that will make search feel broken at launch. The fix is a batch session: add 2–3 editorial tags per venue (conditions-based, terrain-type, vibe words). 239 venues × 3 tags = 717 additions. This is a 4-hour content task, not an engineering task. It should be scheduled for the week after search ships, before the Reddit post.

**If search ships Sep 14 and tag backfill doesn't happen by Oct 8, the launch experience for the "find me a powder day in the Alps" user is a broken empty result.**

---

## Blocked

| Item | Blocker | Owner |
|------|---------|-------|
| VPS redeploy | SSH access | Jack |
| Venue search | Build time | Agent / Jack code session |
| REI / Backcountry / GetYourGuide affiliates | LLC pending | Jack |
| App Store submission | LLC + VPS + Xcode signing | Jack |
| Supabase delete-account SQL | One-time Supabase editor paste | Jack |
| Tag density backfill | Batch content session (~4hr) | Agent (post-search) |
| S-hem ski subreddit post | Timing decision | Jack |

---

## Overnight Activity Summary

No new code. Three daily reports (DevOps, Content, PM) committed. Signal is clean — two prior false alarms (lateSeason, BASE_PRICES) fully corrected. The agent pipeline is running correctly now that regex patterns are accurate.

The site is healthy. The product is feature-complete for Reddit. The only gap is venue search. That's the job.
