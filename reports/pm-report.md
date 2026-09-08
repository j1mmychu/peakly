# Peakly PM Report v144 — 2026-09-08

**Status: 🟡 YELLOW — Two false alarms from agent reports corrected below. Real issues unchanged: venue search unbuilt (6 days to Sep 14 deadline), VPS Day 46. No code changes since Sep 7.**

---

## Shipped Since Last Report (v143 → v144)

| Commit | What | Right call? |
|--------|------|-------------|
| `61733b2` | DevOps: YELLOW, VPS Day 46, BASE_PRICES 91% gap reported | ⚠️ The 91% gap finding is stale — BASE_PRICES was fully backfilled 2026-08-24 (PM v129). Content confirmed 165/165 coverage. DevOps is reporting a closed issue. |
| `85f896d` | Content: 93/100, lateSeason regression flagged on 5 venues | ⚠️ False alarm — see below. All 5 venues already have `lateSeason: true`. Actual count is 15. Content agent's regex only matched compact-format entries. |

**Net code change this cycle: 0.** No app.jsx commits since AGP/AKL/GRU fix on Sep 7.

---

## Corrections to Agent Reports

### Correction 1: lateSeason "regression" is a FALSE ALARM

Content report deducted 3 points (95→93) and flagged 5 venues as missing `lateSeason: true`: snowbird, zermatt, engelberg, verbier, val-thorens. **Verified manually — all 5 already have the flag.** Actual count: 15 (verified via `grep -E '"lateSeason"[[:space:]]*:[[:space:]]*true|lateSeason[[:space:]]*:[[:space:]]*true' app.jsx` → 15).

Root cause: Content agent used regex `lateSeason[: ]*true` which fails to match JSON-format entries like `"lateSeason": true` (the `"` after the key name is not in `[: ]*`). 10 compact-format entries matched; 5 JSON-format entries did not. Same dual-format counting bug CLAUDE.md warns about repeatedly.

**Action:** Update `tasks/agents/content-data.md` to use the reliable `grep -cE '"lateSeason"[[:space:]]*:[[:space:]]*true|lateSeason[[:space:]]*:[[:space:]]*true'` pattern. True score is **95/100**, not 93. No app.jsx fix needed.

### Correction 2: BASE_PRICES "91% gap" is stale

DevOps flagged "BASE_PRICES 91% gap quantified, only 15 of 165 airports covered." This was true before PM v129 (Aug 24). The 2026-08-24 commit added the 100% backfill batch. Content confirmed 165/165 coverage today. DevOps is filing an already-closed bug.

**Action:** DevOps `tasks/agents/devops.md` prompt should be updated to check for the batch comment `BASE_PRICES 100% backfill — 2026-08-24` before flagging coverage gaps.

---

## Bug Triage

### Venue text search — P1 (6 days to Sep 14 deadline)

Still unbuilt. Sep 14 is the hard gate for Oct 11 Reddit launch.

Spec is locked — unchanged from v140:
```
- <input> above category pills, placeholder "Search venues…"
- toLowerCase() filter on venue.title + venue.location + venue.tags.join(' ')
- Count shown when active ("12 results")  
- Clears on category pill change
- No server calls, no debounce — pure client-side
```

Note: `applyFilters` already has a `search.destination` text filter (lines 8731–8737), but it's buried behind SearchSheet UX (tap SearchBar → sheet → type → apply → close). The ask is a persistent inline input, always visible above the pills, no sheet interaction. Two hours of work. Six days left.

**If not shipped by Sep 14, PM v145 will be RED and Reddit launch shifts to Oct 18.**

### VPS Redeploy (Open #19/#21/#23) — P0 (Day 46)

Jack's hands required. SSH, copy `server/proxy.js` to `/opt/peakly-proxy`, `pm2 restart peakly-proxy`, verify `/health`. 30 minutes. Still the only pre-Reddit gate that can't be automated.

Every day undeployed: two-weekend scoring off, iOS native CORS blocked, alert deletion silently failing.

### DevOps/Content report signal degradation — P2

Two consecutive days of false alarms from agent reports. The agents are filing closed bugs and counting incorrectly due to regex failures on the dual-format catalog. This is engineering waste and creates noise in the PM feed. Both prompts need a regex fix. Not a production blocker but erodes confidence in the daily signal.

---

## Three Product Decisions — Sep 8

### Decision 1: Venue search — SHIP THIS WEEK (final warning)

Sep 14 is non-negotiable. Oct 11 vs Oct 18 Reddit launch window is worth 3 weeks of organic traffic, and Sep/Oct is peak ski pre-booking intent. The build is 2 hours. This is the decision. Not a recommendation.

**Spec locked. No additions. No debounce. No fuzzy matching. Text filter on title + location + tags. Inline input. Done.**

### Decision 2: Agent prompt regex fixes — SHIP THIS WEEK (5 minutes)

Both the Content and DevOps agent prompts have regex bugs causing false alarms. Fix the lateSeason count regex in `tasks/agents/content-data.md` and add a BASE_PRICES batch-comment check to `tasks/agents/devops.md`. This is 10 minutes of prompt editing, not code. High signal/noise value. Do it.

### Decision 3: Zombie branches — SCHEDULE CLEANUP FOR POST-REDDIT

18 stale branches (`claude/` prefixed + 3 others). Zero production impact. Jack or any agent session can run a one-liner cleanup. Officially scheduling for the week after Oct 11 Reddit launch: `git push origin --delete <branch>` × 18. Not before. Not a blocker. Done — decision made, stop re-raising it.

---

## This Week's Top 3 (Sep 8–14)

**#1: Build venue search.** 2-hour build. Sep 14 deadline. Non-negotiable. Spec above.

**#2: Jack: VPS redeploy.** 30-minute SSH task. Day 46. Pre-Reddit gate.

**#3: Fix agent prompt regexes.** 10 minutes. Prevents next week's false alarms. `tasks/agents/content-data.md` + `tasks/agents/devops.md`.

---

## Features Rejected This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| 5 new venue proposals (Famara, Anthony Quinn Bay, etc.) | ❌ DEFERRED | Standing call since v141 — don't add venues to an unsearchable catalog. Wait for search to ship. |
| Photo pipeline (346 generic stock photos) | ❌ DEFERRED | Requires Unsplash key + manual review. Not blocking Oct 11. Post-Reddit. |
| App Store submission | ❌ DEFERRED | LLC pending, VPS undeployed, Xcode signing not done. Three blockers, none of which are buildable this week. |
| iOS widget Xcode wiring | ❌ DEFERRED | Code-complete. Not blocking Reddit. Post-Oct-11. |
| Mid-week empty grid "next forecast available" state | ❌ DEFERRED | Real UX gap (PM v143 risk item), but not worth delaying search. Add to the Oct 11 post-launch queue. |
| Fuzzy/ranked venue search | ❌ CUT | Scope creep on the search spec. Plain substring match is sufficient for 405 venues. |

---

## Success Criteria

**90-day projection: 5K–8K users.** What has to be true for 8K, not 5K:

1. Reddit launch lands Oct 11 — requires venue search by Sep 14.
2. VPS redeployed before the post. Open-Meteo rate ceiling is an existential risk at spike traffic.
3. Photo quality improves. Generic stock is the first thing Reddit will roast.
4. S-hemisphere ski subreddit timing. Andes resorts close late September — 2-week window to target r/skiing NZ and r/skiing Argentina while their venues score well. No code needed; just timing.

**The delta between 5K and 8K is execution on items 1 and 2.** Items 3 and 4 are multipliers, not gates.

---

## One Product Risk Nobody Is Talking About

**The SearchSheet UX creates a shadow search that nobody uses.**

There's already a functional venue text filter — `search.destination` in `applyFilters` (line 8732) filters by title + location. But it's hidden behind a SearchBar that looks like a booking widget (it says "Anywhere · This weekend"), not a venue filter. Real users won't find it. They'll look at 405 unsorted venues and bounce.

The PM spec for an inline search input isn't adding a feature — it's surfacing an existing one. When it ships, the SearchBar's destination field arguably becomes redundant for text filtering. That's fine. The SearchBar serves a different mental model (trip planning) vs. the inline filter (venue browsing). They can coexist. But the underlying filter logic is already there; the build is wiring a `<input>` to a state variable and a filter call. There's literally no algorithmic work left. The only remaining task is to ship the input. 6 days.

---

## Blocked

| Item | Blocker | Owner |
|------|---------|-------|
| VPS redeploy | SSH access required | Jack |
| REI affiliate | LLC pending | Jack |
| Backcountry affiliate | LLC pending | Jack |
| GetYourGuide affiliate | LLC pending | Jack |
| App Store submission | LLC + VPS + Xcode signing | Jack |
| Supabase delete-account SQL | One-time paste into Supabase editor | Jack |

All agent-buildable items are on the critical path this week: venue search (code) and prompt fixes (prompts). Both can land without Jack.
