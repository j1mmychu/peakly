# Peakly PM Report v143 — 2026-09-07

**Status: 🟡 YELLOW — AGP/AKL/GRU fixed (Day 3 blocker closed). VPS Day 45 — pre-Reddit gate, Jack's hands required. Venue search: 7 days to Sep 14 deadline. Build it this week or Reddit slips to Oct 18.**

---

## Shipped Since Last Report (v142 → v143)

| Commit | What | Right call? |
|--------|------|-------------|
| `80e1721` | DevOps: AGP/AKL/GRU AIRPORT_COORDS fixed + cache bump `20260907a` | ✅ Long overdue. 3 coord pairs, Day 3, done. |
| `6e7a0a9` | Content: 95/100, AGP/AKL/GRU resolved confirmed, Sotavento fresh pick proposed | ✅ Audit useful. Venue not pasted (correct). |

**One real fix today.** The distance filter silent-lie for sierra-nevada-es, piha-beach-nz, and ilhabela-brazil is closed. 402 lines of reports finally resolved by 3 lines of code. The lesson isn't new but it still hurts to read.

**Nothing else shipped.** Venue search unbuilt. VPS undeployed. Both are on the critical path to Oct 11 Reddit launch.

---

## Bug Triage

### Venue text search — P1 (7 days to Sep 14 deadline)

Not started. 405 venues that users can't search is a dead catalog. The minimum spec hasn't changed since v140:

```
- <input> above category pills, placeholder "Search venues…"
- toLowerCase() filter on venue.title + venue.location + venue.tags.join(' ')
- Count shown when active ("12 results")
- Clears on category pill change
- No server calls, no debounce — pure client-side
```

Two hours of work. Sep 14 is the date before Reddit moves from Oct 11 to Oct 18. Oct 11 is the first weekend of October — peak ski pre-booking intent in North America, exactly when Peakly's ski product is most relevant. **Missing that window costs us the best organic moment of the year.**

If this isn't built by Sep 14, PM v144 will be RED.

### VPS Redeploy (Open #19/#21/#23) — P0 (Day 45)

The math hasn't changed. 405 venues × 1.65 Open-Meteo calls × 500 simultaneous Reddit users = 334,000 API calls against a 10K/day free tier. The proxy cache is written and committed. It's not running on the server.

**This is the only item on the critical path that requires Jack's hands.** SSH, `cd /opt/peakly-proxy`, copy files, `pm2 restart`. Verify with `/health`. 30 minutes.

It must be done before Oct 11. Recommend: bundle with the venue search build session — both happen in the same 3-hour block this week. The VPS SSH takes 30 minutes, the venue search build takes 2 hours.

### Venue count discrepancy — P2 (stable)

DevOps eval returned 407 on Sep 5–6; Content's eval returns 405; category counts (134 ski + 271 beach) consistently sum to 405. `.venue-baseline` = 405. The 407 figure from DevOps appears to be a counting artifact — CLAUDE.md warns repeatedly that two-format mixed catalogs trip up counting. **Treat 405 as authoritative until a reliable eval confirms otherwise.** No action this week.

### S-Hemisphere ski closing window — time-sensitive marketing flag

No code needed. Most Andes resorts (Valle Nevado, Portillo, Cerro Catedral) close the last week of September. Peakly's scoring handles this correctly — these venues will score high right now. This is a **3-week window to reach southern-hemisphere ski users before the whole category goes off-season**. If Reddit timing can be steered toward a southern-hemisphere ski subreddit (r/skiing NZ, r/skiing Argentina) during the next 2 weeks, the product shows its best foot without any code changes.

Not on the critical path. Flagging so it doesn't expire without a decision.

---

## Three Product Decisions — Sep 7

### Decision 1: Venue search — SHIP THIS WEEK

Deadline: Sep 14. That's 7 days. The spec is locked. This is not a 3-day feature. Build it in one session, push it, done.

### Decision 2: New venue proposals (5 pending from Content) — DEFER

Famara ACE, Anthony Quinn Bay RHO, Prainha GIG, Currumbin OOL, Temae PPT. All clean per Content's audit. **None ship until venue search is live.** Adding venues to an unsearchable catalog widens the discoverability hole. The standing call from v141 holds.

### Decision 3: Zombie branches (18) — CUT (post-Reddit cleanup)

18 stale branches (15 `claude/`, 3 miscellaneous). No production risk. No user impact. Cleaning them before Oct 11 Reddit launch is pure distraction. Schedule a one-liner cleanup for the week after Reddit: `git push origin --delete <branch>` for each. Not before.

---

## This Week's Top 3 (Sep 7–14)

**#1: Build venue search.** 2-hour build. Deadline Sep 14. No debate.

**#2: Jack: VPS redeploy.** 30-minute SSH task. Day 45. Pre-Reddit gate. Must happen before Oct 11. Earliest slot this week.

**#3: Nothing else.** Seriously. Every other item — venue adds, photo pipeline, App Store, zombie branches, UI polish — is noise until the critical path is clear. The product is launch-ready except for these two items.

---

## Features Rejected This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Paste 5 new venue proposals | ❌ DEFERRED | 405 unsearchable venues is worse than 410. Build search first. |
| Photo pipeline (346 generic venues) | ❌ DEFERRED | Real quality gap but requires Unsplash key and manual review. Post-launch. |
| App Store submission | ❌ DEFERRED | LLC still pending, VPS not deployed. Two blockers. |
| iOS widget Xcode wiring | ❌ DEFERRED | Code-complete, not blocking Reddit launch. Post-Oct-11. |
| Zombie branch cleanup | ❌ DEFERRED | Zero production impact. Post-Reddit. |

---

## Success Criteria

**90-day projection: 5K–8K users.** What has to be true for 8K, not 5K:

1. Reddit launch lands Oct 11 (not Oct 18). That's the first ski-weekend of October. The difference between these dates is whether venue search is built by Sep 14.
2. VPS cache is running before the Reddit post goes up. A 500-user spike with no cache means the app is dead within 90 seconds. That's the review window. That's where first impressions form.
3. At least one southern-hemisphere ski subreddit post happens in September while Andes venues score high. Word-of-mouth from a different timezone at a different seasonal peak doubles the organic ceiling.
4. Photos improve. 346 generic stock images is the most visible quality gap the product has. Every user who opens a venue card and sees a random powder shot on a beach resort bounces. Post-launch priority #1.

**The floor scenario (5K):** Reddit launches Oct 18 with VPS cache live, venue search works, photos still generic. Users find it useful but don't share it — the product does what it says, nothing more.

**The ceiling scenario (8K+):** Reddit lands Oct 11, VPS survives the spike, southern-hemisphere users share it in September, photos start improving in October. Two organic waves instead of one.

---

## One Product Risk Nobody Is Talking About

**The confidence filter creates a thin grid for mid-week planners.**

`scoreWeekend` returns `confidence: "low"` for any weekend beyond day 6 of the forecast, and low-confidence weekends never reach the front page. This is the right call for honesty — the CLAUDE.md rationale is sound.

But: if a user opens Peakly on a Tuesday planning for a weekend 10 days out, the front page is empty. Nothing fires. The product feels broken on a perfectly normal use-case.

This will hurt Reddit conversion. A first-time visitor who opens on a Tuesday mid-month sees either (a) this weekend's venues (correct, but they wanted next weekend), or (b) an empty grid if this weekend is already past and next weekend is outside the 7-day window.

**The fix isn't to lower the confidence bar — that would sell lies.** The fix is a clear "Next forecast available [date]" state with an alert CTA instead of a blank grid. This is a 1-hour build. It's not on any roadmap. It should be.

Not flagging as a blocker. Flagging because it'll be the first thing mentioned in the Reddit comments.

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

All unblocked items are buildable by the agent team. The critical-path items above (venue search, VPS) are both in-scope this week.
