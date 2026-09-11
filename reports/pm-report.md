# Peakly PM Report v147 — 2026-09-11

**Status: 🔴 RED — Venue search unbuilt. 3 days to Sep 14 hard deadline. Second day without an app.jsx commit. A new regression (lateSeason on 5 glacier resorts) is now compounding.**

---

## Shipped Since Last Report (v146 → v147)

| Commit | What | Right call? |
|--------|------|-------------|
| *(none)* | No code commits today — 3 report commits only | — |

**Zero code shipped today.** Three report commits only (DevOps, Content, this PM). The clock is now at 3 days. Two consecutive days without an app.jsx commit while the only P0 on the board is a 2-hour build.

---

## Addressing the Scheduled Prompt's Bug List

### Peakly Pro price ($9/mo vs $79/yr)
**Closed — permanently stale.** Pro UI removed April 2026. `grep -c GEAR_ITEMS app.jsx` → 0. No action needed, ever.

### Sentry DSN empty
**Closed — false alarm.** DSN `9416b032a46681d74645b056fcb08eb7` wired at `app.jsx:8` and `index.html:77`. Live.

### Cache buster stale
**Non-issue.** Stamp `20260910a` is correct — no app-touching commits today. Auto-push only bumps when `app.jsx`/`sw.js`/`index.html` change.

---

## Bug Triage

### P0 — Venue search (3 days to Sep 14 deadline)

**Day 2 of zero progress.** Spec is unchanged and locked:

```
<input> above category pills — "Search venues…"
Filter: toLowerCase() on venue.title + venue.location + venue.tags.join(' ')
Result count shown when active ("12 results")
Clear on category pill change
No server calls, no debounce — pure client-side
```

Filter logic already exists in `applyFilters` at line ~8732. This is wiring a `<input onChange>` to a `useState`, threading the value into the existing filter. The build is 2 hours. There are 3 days left.

**Sep 14 = last ship date before the Oct 11 Reddit window requires it.** Miss Sep 14 → launch shifts to Oct 18 → lost Sep/Oct ski pre-booking traffic peak.

### P1 (NEW) — lateSeason regression on 5 glacier resorts

**Content flagged today. Confirmed by code check.**

Current `lateSeason: true` count: **10** (down from 14 per July CLAUDE.md, down from 15 per Content's Sep-09 report).

Missing venues: `snowbird`, `zermatt`, `verbier`, `val-thorens`, `engelberg` — all high-altitude resorts that legitimately need this flag. Without it, these venues get the off-season binary cap applied in `scoreVenue`, suppressing their scores even when snow depth qualifies them as exceptions.

New vs July: `hintertux-glacier` added (correct). Net: −5 dropped, +1 added = 10.

This is a scoring regression. **Snowbird, Zermatt, and Verbier are marquee venues.** If a user checks conditions at Zermatt in July and it scores 0 when it should score 85, that's a trust-destroying bug masquerading as a data flag.

**Fix: add `lateSeason: true` to the 5 missing venues.** Bundle with venue search commit — same app.jsx touch, zero additional deploy cost.

### P1 — dist/ build collision (Day 2)

Committed `dist/index.html` is the iOS artifact. References `./vendor/react.production.min.js` (doesn't exist in dist/). Live site unaffected — GH Actions rebuilds correctly. But committed dist/ is misleading and will cause confusion.

**Fix: change `build-ios.mjs` output path from `dist/` to `ios/App/App/public/`.** 10 minutes. Bundle with next app.jsx commit.

### P1 — Semantic duplicate (Day 3 unresolved)

`san-vito-lo-capo-t21` and `beach_san_vito_lo_capo` — same beach, same lat/lon, same ap (TPS). Content initially flagged deletion of `beach_san_vito_lo_capo`, but that's the higher-quality entry (4.96 rating, 24,600 reviews vs 4.68 / 4,719). **Delete `san-vito-lo-capo-t21` instead.** Net venues after fix: **404**.

This is a 1-line deletion. It should have shipped two days ago.

### P3 — VENUES count discrepancy

Authoritative eval count: **405** (134 skiing / 271 beach). Content confirmed. CLAUDE.md says 395 — 12 behind reality. Update CLAUDE.md on next app.jsx commit.

---

## Three Product Decisions — Sep 11

### Decision 1: Venue search — SHIP NOW. TODAY. NOT TOMORROW.

3 days left. Two days of no progress. The product team is polishing while the critical path sits idle. This is a mechanical 2-hour task with a known spec and existing filter logic.

**If a code session doesn't execute today or tomorrow morning, the Oct 11 Reddit launch gate closes.** Shifting to Oct 18 means entering the ski pre-booking window late, competing with the November buzz cycle instead of leading it.

**Decision: SHIP. Execute today. Sep 14 is not a soft deadline.**

### Decision 2: lateSeason regression — BUNDLE WITH VENUE SEARCH

Restoring `lateSeason: true` on 5 venues (snowbird, zermatt, verbier, val-thorens, engelberg) is a 5-line change. It corrects a scoring regression on marquee venues. It ships for free inside the venue search commit.

**Decision: SHIP as part of venue search commit. Not separately, not later.**

### Decision 3: Semantic duplicate — BUNDLE WITH VENUE SEARCH

Delete `san-vito-lo-capo-t21`. 1-line change. Day 3 with no excuse.

**Decision: BUNDLE with venue search commit. Ship all three together.**

---

## This Week's Top 3 (Sep 11–14)

**#1: Build and ship venue search.** 2 hours. 3 days. Spec pinned above. Bundle lateSeason restore + dup deletion + CLAUDE.md venue count update + dist/ build path fix in the same commit.

**#2: Jack: VPS redeploy (Open #19/#21/#23).** Day 31 post-Aug-11 partial redeploy. Still blocking: two-weekend scoring, iOS CORS, alert deletion. This is a pre-Reddit gate. Deploy command: `cd /opt/peakly-proxy && pm2 restart peakly-proxy` (copy files first — not a git clone).

**#3: Tag density backfill (week of Oct 5).** 239 venues with <4 tags. Search quality problem, not just a data metric. Schedule for the week before Oct 11 launch, after venue search ships. 4-hour batch content session.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Fuzzy / ranked search | ❌ CUT | 405 venues, substring match is sufficient. Don't ship algolia for a pre-launch. |
| 5 pending venue proposals | ❌ DEFERRED | Unsearchable catalog first. Adding to an unsearchable list is waste. |
| Photo pipeline (Unsplash API) | ❌ DEFERRED | Needs Unsplash key + manual review. Post-Reddit. |
| JSON-LD structured data | ❌ DEFERRED | SEO enhancement, not on Oct 11 critical path. |
| Static h1 fallback | ❌ DEFERRED | Same. Post-Reddit. |
| App Store submission | ❌ DEFERRED | LLC + VPS + Xcode signing — none agent-buildable this sprint. |
| iOS widget Xcode wiring | ❌ DEFERRED | Code-complete, not blocking Reddit. |
| S-hem ski subreddit | ❌ DEFERRED to Jack | Not a code task. Window closes ~Sep 20. Jack's call. |

---

## Success Criteria

**90-day projection: 5K–8K users.** What separates 8K from 5K:

1. **Oct 11 Reddit launch hits.** Requires venue search by Sep 14. Three days left.
2. **VPS redeployed before the post.** Reddit spike at 66+ concurrent DAU saturates Open-Meteo free tier. Cache layer must be live.
3. **Marquee venues score correctly.** Zermatt, Snowbird, Verbier with suppressed scores on a Reddit launch day is a credibility disaster. lateSeason fix is now part of the launch gate.
4. **Photo quality at marquee venues.** 31 venues now have real photos. Target 40 verified hero venues by Oct 11. Doable in one async photo session.
5. **Tag density.** Search quality at launch. Week of Oct 5 batch session.

---

## One Product Risk Nobody Is Talking About

**The lateSeason regression went undetected for weeks and no one knows when it happened.**

Content caught it today by auditing. DevOps didn't catch it. The smoke test doesn't catch it. The venue integrity guard (`auto-push.sh`) checks ID uniqueness, coordinate coverage, and airport coverage — but not `lateSeason` accuracy.

These 5 venues (Zermatt, Snowbird, Verbier, Val-Thorens, Engelberg) are in the top tier of the ski catalog. They're in September — the exact moment they're most relevant for ski pre-booking traffic. A user landing from the Oct 11 Reddit post, searching for late-season options in the Alps, sees Zermatt score near-zero. They assume the data is wrong (it is, but not in the way they think) and bounce.

**The fix takes 5 lines. The risk is real. It ships with venue search.**

---

## Blocked

| Item | Blocker | Owner |
|------|---------|-------|
| VPS redeploy (Open #19/#21/#23) | SSH access | Jack |
| Venue search | Build execution | Agent / Jack code session |
| REI / Backcountry / GetYourGuide affiliates | LLC pending | Jack |
| App Store submission | LLC + VPS + Xcode signing | Jack |
| Supabase delete-account SQL | One-time Supabase editor paste | Jack |
| Tag density backfill | Batch content session (~4hr) | Agent (week of Oct 5) |
| S-hem ski subreddit post | Timing decision | Jack |

---

## Overnight Activity Summary

**No code commits today.** Two days straight without an app.jsx commit. Three report commits only.

The product is 3 days from the Sep 14 gate and nothing shipped. Content surfaced a new scoring regression (lateSeason on 5 glacier resorts). The semantic duplicate is on Day 3 unfixed. The dist/ collision is on Day 2 unfixed.

All three open items (venue search, lateSeason restore, dup deletion) can ship in one commit. The window is closing.

---

*v147 — 2026-09-11 — PM Agent*
