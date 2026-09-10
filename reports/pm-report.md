# Peakly PM Report v146 — 2026-09-10

**Status: 🔴 RED — Venue search still unbuilt. 4 days to Sep 14 hard deadline. The Oct 11 Reddit launch is in jeopardy.**

---

## Shipped Since Last Report (v145 → v146)

| Commit | What | Right call? |
|--------|------|-------------|
| `c760dfb` | fix(flights): widen live-fare fallback to ±3 days / 2–7 nights | ✅ Yes. Accurate prices are a trust signal. |
| `d7c3830` | iOS: declare ITSAppUsesNonExemptEncryption=false | ✅ Yes. Removes App Store review friction. |
| `af25afb` | build: iOS rebundle (photo + carousel + copy fixes) | ✅ Yes. Necessary followup to iOS fixes. |
| `a4e7d47` | fix(detail): stop saying "live price loading" forever | ✅ Yes. Trust-eroding UX bug. |
| `ec060e2` | fix(venues): replace 31 wrong/generic venue photos | ✅ Yes. Progress on the #20 quality gap. |
| `30a4f5a` | fix: bring front-page carousels back | ✅ Critical. This was a regression — carousels are the first thing a new user sees. |
| `3152c96` | fix(proxy): fallback to ±1-day weekend RT fare | ✅ Yes. Accuracy fix, fewer blank prices. |
| `0036ab7` | fix(build-ios): vendor React/Babel locally | ✅ Yes. Build reliability. |
| `e0f7713` | fix blank widget: conditions was an object | ✅ Yes. Widget was broken at decode. |

**9 commits. All quality/polish/regression fixes. Zero progress on venue search.** The pattern is clear: polishing a product that lacks its most-requested feature. The question isn't whether these fixes were correct — they were — but whether they were the right *allocation* while Sep 14 ticks down.

---

## Addressing the Scheduled Prompt's Bug List

### Peakly Pro price ($9/mo vs $79/yr)
**Closed — stale finding.** Peakly Pro UI was removed April 2026. `grep -c GEAR_ITEMS app.jsx` → 0. No Pro pricing in code. Permanently closed.

### Sentry DSN empty
**Closed — false alarm.** Sentry DSN active at `app.jsx:8` and `index.html:77`. Monitoring is live.

### Cache buster stale
**Non-issue.** Cache stamp `20260910a` bumped today in lockstep with flight fix commit. Correct behavior.

---

## Bug Triage

### P0 — Venue search (4 days to Sep 14 deadline)

Status unchanged from v145. The spec is locked:

```
<input> above category pills — "Search venues…"
Filter: toLowerCase() on venue.title + venue.location + venue.tags.join(' ')
Result count shown when active ("12 results")
Clear on category pill change
No server calls, no debounce — pure client-side
```

Filter logic exists in `applyFilters` at line 8732. The wiring (`<input onChange>` → `useState` → existing filter) is a 2-hour build.

**Sep 14 is the last day to ship before the Oct 11 Reddit window gates.** Miss it and launch shifts to Oct 18 — losing the peak Sep/Oct ski pre-booking traffic window.

### P1 — Semantic duplicate venue

Content flagged today: `san-vito-lo-capo-t21` (line 663) and `beach_san_vito_lo_capo` (line 4973) are the same beach (San Vito Lo Capo, Sicily, TPS airport). Two entries, same lat/lon, different IDs. The boot-time IIFE misses this because it's ID-dedup-only.

**Fix: delete one.** `beach_san_vito_lo_capo` (line 4973) has better data — higher rating (4.96 vs 4.68), more reviews (24,600 vs 4,719), better tags. Delete `san-vito-lo-capo-t21`. 5-minute fix.

Net venues after fix: **404**.

### P1 — dist/ build collision (DevOps)

`build-ios.mjs` and `build-web.mjs` both write to `dist/`. Running iOS build last clobbers the web build. Committed `dist/index.html` is an iOS artifact — references `./vendor/react.production.min.js` (doesn't exist in dist/).

**Live site is unaffected** — GitHub Actions runs `build-web.mjs` fresh on every push, producing a correct dist/ before deploying. But:
- Anyone running dist/ locally gets a white screen
- Committed dist/ is misleading

DevOps has the 10-minute fix: change `build-ios.mjs`'s output path from `dist` to `ios/App/App/public`. Then clean stale iOS artifacts from dist/. Safe to bundle with any commit.

### P2 — OG image in committed dist/ (DevOps flagged)

DevOps flagged `dist/index.html` OG image as `content=""`. This is the stale iOS-built dist/ artefact (same P1 above) — not the live deployed site. Source `index.html` has the correct Unsplash URL. GitHub Actions reads from source and builds correctly. **Live site has a valid OG image. Not a live bug — corollary to the P1 dist/ collision.**

### P3 — VENUES count discrepancy

My eval: 405 (confirmed, both compact and JSON format). DevOps reported 407. DevOps is overcounting. Content's 405 is correct. CLAUDE.md says 395 — stale, update on next app.jsx commit.

---

## Three Product Decisions — Sep 10

### Decision 1: Venue search — SHIP BEFORE SEP 14. NOT OPTIONAL.

4 days. No more deferrals. This is a 2-hour build. If a code session doesn't run today or tomorrow, the Oct 11 launch gate closes. The spec is pinned above. The filter logic exists. Wiring a `<input onChange>` to an existing `useState` and threading the value into the existing filter at line 8732 is mechanical work, not creative work.

**Decision: SHIP. Today or tomorrow. Sep 14 deadline is non-negotiable.**

### Decision 2: Semantic duplicate — CUT `san-vito-lo-capo-t21`

Two entries for the same beach is a content defect. `beach_san_vito_lo_capo` is the better entry. Delete the compact-format duplicate. Bundle with any upcoming app.jsx commit.

**Decision: CUT `san-vito-lo-capo-t21`.**

### Decision 3: dist/ build collision — FIX THIS WEEK

Not an emergency (live site is fine), but it will bite someone. The 10-minute fix is documented. It should go in the same commit as venue search or the next app.jsx touch.

**Decision: SHIP, bundle with next app.jsx commit.**

---

## This Week's Top 3 (Sep 10–14)

**#1: Build venue search.** 2-hour build. 4 days left. Every other priority is secondary. Spec pinned above.

**#2: Jack: VPS redeploy (Open #19/#21/#23).** Day 30 post-Aug-11 partial redeploy. Still blocking: two-weekend scoring, iOS CORS, alert deletion. Pre-Reddit gate. Deploy command in DevOps report.

**#3: Tag density backfill.** 239 venues with <4 tags is not a data quality metric — it's a search quality problem. When venue search ships, "powder," "beginners," "reef," "family" searches return empty or wrong results because the tags aren't there. Schedule this for the week after venue search ships, before Oct 11. 4-hour batch content session.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Fuzzy/ranked search | ❌ CUT | Scope creep. Substring match on 405 venues is sufficient. |
| 5 pending venue proposals | ❌ DEFERRED | Unsearchable catalog first. Adding venues to an unsearchable list is waste. |
| Photo pipeline (Unsplash API) | ❌ DEFERRED | Needs Unsplash key + manual review. Not blocking Oct 11. Post-Reddit. |
| App Store submission | ❌ DEFERRED | LLC + VPS + Xcode signing — none agent-buildable. |
| iOS widget Xcode wiring | ❌ DEFERRED | Code-complete, not blocking Reddit. Post-Oct-11. |
| S-hem ski subreddit posts | ❌ DEFERRED to Jack | Not a code task. Jack's call on timing. Window closes ~Sep 20. |
| JSON-LD structured data | ❌ DEFERRED | SEO enhancement. Not on the Oct 11 critical path. |
| Static h1 fallback | ❌ DEFERRED | Same. Post-Reddit. |

---

## Success Criteria

**90-day projection: 5K–8K users.** What separates 8K from 5K:

1. **Oct 11 Reddit launch hits** — requires venue search by Sep 14. This is the gate.
2. **VPS redeployed before the post** — Open-Meteo rate ceiling at spike traffic. 10K-impression Reddit post + 66+ concurrent DAU = free tier saturated = weather errors for everyone.
3. **Photo quality** — 31 venues now have real photos (progress). Reddit will call out generic stock. 20–30 verified hero venues (Whistler, Chamonix, Bora Bora, Santorini) are minimum. Roughly 25% there.
4. **Tag density** — search quality at launch. If "powder in the Alps" returns 0 results, that's a Reddit comment. Schedule backfill now, execute week of Oct 5.

---

## One Product Risk Nobody Is Talking About

**The front-page carousel has been broken and fixed twice in the last two weeks.** Commit `30a4f5a` re-introduced the carousels that a prior commit had dropped. This is the second regression on the most important piece of UI — the thing a new user sees before they scroll.

The carousel logic is entangled enough with the scoring pipeline that routine quality fixes keep breaking it. If it breaks on Oct 11 launch day (the highest-traffic moment this app will have ever seen), users arrive to an empty explore page and bounce.

No one is writing a regression test for this. The Playwright smoke test doesn't catch it (smoke tests check for crashes, not content). The fix for carousel fragility isn't a test — it's code ownership: whoever touches `scoreWeekend`/`scoreWeekendDeal`/`listings` memo next should audit the carousel's rendering conditions and document the invariants that must hold for it to appear. A 20-line comment block on the carousel condition logic would have prevented both regressions.

**If this breaks on launch day, we have no recovery path faster than a manual hotfix + push + GitHub Actions build + deploy cycle (~5 minutes). That's 5 minutes of a first impression we don't get back.**

---

## Blocked

| Item | Blocker | Owner |
|------|---------|-------|
| VPS redeploy (Open #19/#21/#23) | SSH access | Jack |
| Venue search | Build execution | Agent / Jack code session |
| REI / Backcountry / GetYourGuide affiliates | LLC pending | Jack |
| App Store submission | LLC + VPS + Xcode signing | Jack |
| Supabase delete-account SQL | One-time Supabase editor paste | Jack |
| Tag density backfill | Batch content session (~4hr) | Agent (post-search) |
| S-hem ski subreddit post | Timing decision | Jack |

---

## Overnight Activity Summary

9 code commits since v145 — all quality and polish: flight price accuracy, iOS App Store housekeeping, regression fixes (carousels, price loading spinner), 31 venue photos corrected, widget decoding bug fixed. All correct decisions individually.

Pattern: the product is being polished toward perfection while its most important missing feature remains unbuilt. The carousels look great. The prices are accurate. Search doesn't exist.

4 days to Sep 14.
