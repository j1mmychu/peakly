# Peakly PM Report — 2026-05-07 (v34)

**Filed by:** Product Manager agent
**Date:** 2026-05-07
**Status:** RED on launch deadline. Ski+beach window closes May 20 — 13 days. Reddit post is still not live. Weather cache still unbuilt. Two quick-ship P1s (SEO tags, chamonix dupe) have been open for 3–4 days with zero blockers. Supabase cloud sync shipped without PM sign-off and with unverified security posture.

---

## Agent Coordination Problem — Addressed First

**Today's DevOps report incorrectly declared a P0: "May 3–4 sprint work never shipped."** The sprint DID ship. DevOps agent ran against a local copy 15+ commits behind origin/main. The live codebase (post `git pull`) has 0 surfing venues, 86 beach, 65 skiing, `scoreWeekend()`, `seasonalDefaultCat()`, gear gate open, 7 `lateSeason` venues. All confirmed.

**The May 5 and May 6 DevOps agents had the same problem.** The May 5 report said the pivot was fiction. The May 6 report said the gear gate was still `false &&` and "fixed it" — that fix had already shipped in commit a9aacf5. Today's agent bumped the cache from "20260502a" to "20260507a" — the cache was already at "20260506a" from yesterday.

Every agent needs `git pull origin main` as the first step before reading any file. Until that's enforced, treat any report that cites venue counts, line numbers, or commit hashes as potentially invalid. Cross-reference: `wc -l app.jsx` (currently 7,834 lines), venue counts (86 beach, 65 skiing, 0 surfing), `git log --oneline | head -5`.

This is structural. One-line fix to each agent run script. Jack's action before next agent run.

---

## Shipped Since Last PM Report (May 6 → May 7)

| Commit | What | Right call? |
|--------|------|-------------|
| `c15cdeb` (May 7, DevOps) | Cache bust 20260506a → 20260507a, sw.js bump | Functionally harmless. Redundant — cache was already at 20260506a. |
| `2c2e848`, `038e089`, `9f3fffd`, `7f650ae` (May 7, Content) | Read-only audits against stale codebase | ❌ Invalid. Content agent ran against pre-pivot data (78 surfing venues). Discard all findings. |

**Summary:** One cache bump (redundant), four invalid content reports. Nothing substantive shipped today. The P1s flagged on May 6 are still open.

---

## Permanent Bug Triage — Do Not Re-Flag

| Issue | Evidence |
|-------|----------|
| Peakly Pro $9/mo | No Pro UI in codebase. |
| Sentry DSN empty | Real DSN at app.jsx:7–8. |
| TP_MARKER unset | app.jsx:1593 = "710303". |
| JSON-LD missing | index.html:34 — WebSite + WebApplication + Organization schema. |
| Gear gate closed | app.jsx:6404 `GEAR_ITEMS[listing.category] &&` — open. |
| Surfing venues in code | 0. Confirmed. Stop flagging. |
| aruba-eagle-beach-t1 dupe | Deleted. |
| Open-Meteo weather cache unbuilt | **False.** `_wxCacheGet`, `_wxCacheSet`, `WX_CACHE_TTL` are live. The P0 is the server-side proxy cache (different thing — prevents quota burns when multiple users share a cold cache simultaneously). |

---

## Active Bug Triage — May 7

| Bug | Severity | Status | Days Open | Blocker? |
|-----|----------|--------|-----------|----------|
| **Open-Meteo server-side cache** | **P0 PRE-SPIKE** | ❌ Unbuilt | **Day 18** | Hard gate before Reddit. 151 venues × 1.5 calls = 226/cold session. ~44 concurrent cold users → quota gone → all scores return 50 → app breaks silently. |
| **index.html SEO: title + meta say "surf" + "adventure"** | **P1** | ❌ Open | **Day 4** | No. But Google is indexing Peakly as a surf app right now. |
| **chamonix-mont-blanc-s18 duplicate** | **P1** | ❌ Open | **Day 2** | No. One-line delete. Same coords as canonical `chamonix` (line 408), lower rating (4.66 vs 4.96), fewer reviews (1,477 vs 3,405). |
| **Reddit launch: no date set** | **P1 / Product gate** | ❌ Open | **Day 39** | This IS the blocker. Ski+beach window closes May 20. |
| **Supabase RLS unverified** | **P2** | ⚠️ Unknown | Day 3 | Blocks first user sign-in. Anon key is hardcoded in client and in git history. Supabase design intends this — but only if RLS is configured. If it isn't, any authenticated user can read all `user_data`. |
| **Email list fragmentation** | **P2** | ❌ Decision needed | Day 3 | waitlist.jsonl (VPS) and Supabase auth.users diverge from user #1. Compounds with every user. Needs a decision now. |
| **PEAKLY_BUILD mismatch** | **P3** | ❌ Open | Day 3 | app.jsx PEAKLY_BUILD = "20260504h", sw.js = "peakly-20260507". Sentry error tags show wrong version. 1-char fix. |
| **skiPass field on s-series ski venues** | **P3** | Deferred | Day 16 | Post-100 users. Scoring unaffected. |
| **Strike alerts: no background worker** | **P3** | Deferred | Day 40+ | Zero alert users. Post-500 MAU. |

---

## Supabase Assessment

Cloud sync shipped in commits `ab692d3` → `b92f653` → `011b8dc` (early May). Not in the roadmap. Not PM-approved. What shipped:

- Magic-link auth via Supabase
- Cloud sync of wishlists, alerts, trips, profile keys to Supabase `user_data` table
- Hardcoded anon key in client (`CLOUD_SYNC_CONFIGURED = true` — feature is ACTIVE)
- Lazy-loaded Supabase JS (~80 KB) to avoid first-paint cost
- New email list (auth.users) diverging from waitlist.jsonl

**Was this the right product call?** No. The timing is wrong. At 0 MAU, user auth is not a retention lever — it's a complexity tax. Magic-link friction at the top of the funnel will cost trial signups. Worse: the security posture is unverified (RLS) and the feature creates email list debt from user #1.

**What to do:** Keep the code — don't rip it out mid-sprint. But freeze scope at current state. Verify RLS before the Reddit post. Ship Option A for email sync (see below). No new Supabase features until 50 confirmed active users.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo server-side cache** | Jack (SSH to 198.199.80.21) | Gates Reddit. Schedule this week. |
| **Reddit launch date** | Jack | 13 days to May 20 window close. Name it today. |
| **Supabase RLS verification** | Jack (Supabase dashboard) | Before first user signs in. 15 minutes. |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide. Not gating launch. |

---

## This Week's Top 3 Priorities Only

**1. Ship the 3-line cleanup: SEO copy + chamonix dupe + PEAKLY_BUILD stamp. One commit. Today.**

index.html title: "Peakly — Find Surf, Ski & Adventure Spots with Cheap Flights" → "Peakly — Find Ski & Beach Weekends with Cheap Flights"
meta description / og:description / twitter:description / JSON-LD: swap "surf, ski & adventure" → "ski & beach" everywhere (4 edits).
chamonix-mont-blanc-s18: delete line 525 in app.jsx (canonical `chamonix` at line 408 already has `lateSeason:true`).
PEAKLY_BUILD: bump "20260504h" → "20260507a" to match sw.js.

This has been open 4 days. Zero technical debt. Zero risk. Stop deferring it.

**2. Jack: VPS session this week. Open-Meteo proxy cache. Non-negotiable.**

May 13 is 6 days away. The VPS session is 2–4 hours. Without it, the Reddit post breaks the app on first spike. The spec is in devops-report.md (two Express routes, ~40 lines). SSH to 198.199.80.21. This is the only launch blocker that requires Jack personally. Everything else can ship via agent.

**3. Jack: Name the Reddit launch date. Today.**

Recommendation: **May 13**. That gives 6 days for the VPS session + any post-prep. May 20 is the hard backstop (ski+beach seasonal overlap closes). Anything after May 20 is a beach-only launch — weaker hook, half the subreddit audience, lower D1 intent.

If May 13 is not realistic, say so explicitly and commit to May 20. "We'll see" is not a date.

---

## Explicit Product Decisions — May 7

**1. index.html SEO copy + chamonix-mont-blanc-s18 + PEAKLY_BUILD: SHIP TODAY.**
Bundled. One commit. 15 minutes. No more deferring.

**2. Reddit launch date: MAY 13. Ship date locked.**
If the VPS session doesn't happen by May 12, slip to May 20 and accept the reduced ski audience. Either date must be picked today. "TBD" is not a date.

**3. Supabase scope: FROZEN. Zero new features until 50 active users.**
Cloud sync code stays. No new auth features, no subscription UI, no sync expansion. Verify RLS before the Reddit post goes live. This is not optional — it's the security gate.

**4. Email fragmentation: Option A. Ship with the VPS session.**
On Supabase auth sign-in success (`onAuthStateChange`), also POST to `/api/waitlist` so both lists stay in sync. ~10 lines in the Profile auth handler. Prevents a split email list from compounding forever. Spec it in the VPS session.

**5. Content agent: DISCARD all reports until agent pulls origin/main.**
The May 4 and May 7 content reports are based on a pre-pivot codebase (240 venues, 78 surfing). Do not action venue deletions, photo swaps, or tag changes from those reports. Add `git pull origin main` as step 1 to `tasks/agents/content-data.md` before the next scheduled run.

**6. New venue proposals (Revelstoke, Maspalomas, Ipanema, Nusa Lembongan): DEFER post-Reddit.**
Pre-launch catalog freeze. 151 venues is enough. After Reddit: prioritize Ipanema (zero Rio coverage) and Maspalomas (zero Gran Canaria coverage).

**7. GetYourGuide partner_id: SHIP WEEK OF MAY 12.**
One-line change. +$1.68 RPM. Bundle with any post-VPS commit. Too small to touch now, too easy to leave indefinitely.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| More Supabase auth features | **CUT this phase** | 0 MAU. Wrong time for auth complexity. Freeze at current state. |
| New venue batches pre-Reddit | **DEFER** | Pre-launch catalog freeze. |
| Climbing/MTB/kayak categories | **PERMANENT CUT** | Launch scope is ski + beach. Full product call required to revisit. |
| SRI/CSP hardening | **DEFER** | Babel eval incompatibility. Post-launch security pass. |
| Venue deep links | **DEFER** | Explicit pre-launch decision. Post-Reddit. |
| Push notification worker | **CUT to post-500 MAU** | Zero active alert users. |
| Weekend Travelpayouts pricing (Phase 4) | **DEFER post-launch** | Roadmap Phase 4. Needs VPS change anyway — bundle with cache session. |
| skiPass field backfill | **DEFER to post-100 users** | P3. Scoring unaffected. |
| agent run-script git pull fix | **SHIP IMMEDIATELY** | Structural: one line per agent prompt. Cost: 10 minutes. Value: stops agents from generating invalid reports forever. |

---

## Success Criteria

**For 8K, not 5K, at 90 days:**

1. **Weather cache live before Reddit.** The single variable that accounts for a 3K MAU swing. Without it: one spike breaks the app for 20 hours. With it: a front-page r/skiing thread sends 200 visitors who all see accurate scores and some convert.

2. **Reddit post before May 20.** The ski+beach angle reaches r/surfing AND r/skiing simultaneously. After May 20, alpine resorts hit off-season and the grid reads as a beach app. That's a ~40% smaller opening audience.

3. **D1 retention > 40%.** We have no telemetry on this. Plausible doesn't report D1. Supabase return-session tracking is possible but unbuilt. Add Plausible `pageview` on second session open before Reddit so the data exists from day one. 10 minutes, high leverage.

4. **50 email captures pre-Reddit.** Check `server/data/waitlist.jsonl` for current count. With 0 pre-existing subscribers, launch is one spike. With 50, there's a second wave on follow-up email.

**90-day math:** Cache + May 13 Reddit + ski window = 7K–8K. June Reddit + any quota hit = 4K plateau, no recovery.

---

## One Product Risk Nobody Is Talking About

**The agent pipeline is producing actionable-sounding reports against stale data, and those reports are accumulating in the repo as if they're accurate.**

Today's DevOps report declared a P0 emergency (pivot not shipped). The May 5 and May 6 DevOps reports said the same thing. All three are wrong — the pivot shipped on May 3. But they're sitting in `reports/` with headers that say "P0 — SHIP BLOCKER" and specific fix instructions. If anyone reads those reports without checking the current codebase, they will attempt to re-retire 86 beach venues, re-remove surfing scoring code that's already gone, and double-bump cache busters that are already current.

The content agent produced four reports today, all based on 240 venues (78 surfing). Those reports recommend deleting venues that were already deleted in May 3. If actioned, they cause venue loss.

The fix is structural and cheap: add `git pull origin main` as step 1 in each agent run script (`tasks/agents/devops.md`, `tasks/agents/content-data.md`, etc.). One line per file. 10 minutes total. Without it, every agent that runs on a stale local checkout generates a report that is more dangerous than useful.

This is the only risk where acting on the recommended fix makes things worse.
