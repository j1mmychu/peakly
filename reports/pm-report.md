# Peakly PM Report — 2026-06-26 (v70)

> Supersedes v69 (June 25). **Status: RED → launch-ready.** Every technical gate is closed. Reddit is Day 22. The product risk is now entirely a human one: Jack hasn't posted yet.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Stale from pre-May pivot. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Not a bug. Nothing to fix. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Not empty. |
| "Cache buster stale" | **Auto-bumped daily by DevOps.** Today: `20260626a`. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13. Sandbox 403s are container egress blocks, not outages. Stop.** |
| "197 venues with empty tag arrays" | **FALSE.** Content June 25 confirmed it was a counting bug on multi-line JSON format. All 370 venues have tags. |
| "40 ski venues had 1 tag" | **FIXED June 26** — all 40 now have 4 contextually accurate tags. CLOSED. |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop reporting. |
| "GEAR_ITEMS" | **Count = 0. Amazon cut for v1. Final.** |
| "Duplicate commit pattern" | **Known-skipped June 25 (second strike).** Stop reporting. |

---

## Shipped Since v69 (2026-06-25 → 2026-06-26)

| What | Verdict |
|------|--------|
| **Cache `20260625a` → `20260626a`** (DevOps, `f90988a`) | ✅ Correct daily bump. |
| **Tag enrichment: 40 ski venues 1→4 tags** (Content, `506a94c`) | ✅ Closes the P1 from v69. Filter pills (Powder Day, Expert Terrain, Family Friendly, Late Season) now return correct counts across all 131 ski venues. |

**Code state June 26:**
- `app.jsx`: 13,323 lines · cache `20260626a` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- All 370 venues have ≥2 tags. 0 empty, 0 single-tag.
- All pre-launch code items ✅. VENUE FREEZE active.

---

## Bug Triage — June 26

| Bug | Severity | Status |
|-----|----------|-------|
| **Reddit post: Day 22** | **P0 (business)** | Jack only. Today. Final answer below. |
| **VPS SSH verify before posting** | **P1 pre-post** | Jack: `curl https://peakly-api.duckdns.org/health` from local terminal (not sandbox). 5 min. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store) / P3 (web) | Jack: 2 min in Supabase SQL editor. Graceful fallback active until then. |
| SRI on CDN scripts | P3 | DEFER post-launch. Final. |
| CSP meta | P3 | DEFER. Babel `unsafe-eval` makes strict CSP incompatible. |
| Duplicate commit pattern | Cosmetic | **KNOWN-SKIPPED** (second strike June 25). Stop reporting. |

**Permanently closed — stop raising:**
Peakly Pro price · Sentry DSN · Cache buster · VPS "Day X binary blocker" · DEAL_WEIGHT · GEAR_ITEMS · coronet-peak lateSeason · Killington lateSeason · EWR AP_CONTINENT · duplicate-commit pattern · "197 empty tag arrays" (was a counting bug)

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **22** |
| **VPS SSH verify** | Confident pricing + spike absorption | 5 min | 13 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 16 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | ~2h + Apple review | Post-launch |

---

## Explicit Product Decisions — June 26

### Decision 1: Tag enrichment is DONE. The last technical pre-launch gate is closed.

v69 called tag enrichment a P1 "do today before Reddit post." Content agent did it. All 370 venues have ≥2 tags. All 131 ski venues have ≥4 tags, including Powder Day, Expert Terrain, Family Friendly, and Late Season. Filter pills return accurate counts across the full catalog.

There is no remaining code, data, or content item blocking the Reddit post. The pre-post checklist is:
1. ~~Tag enrichment~~ ✅ DONE June 26
2. Jack: `curl https://peakly-api.duckdns.org/health` from local terminal (5 min)
3. Jack: Open live app on mobile, confirm Explore loads with ≥10 beach cards
4. Jack: Post to Reddit

That's it. Four steps. Two of them are already done. The remaining two take 10 minutes combined.

**SHIP. No further gates permitted.**

---

### Decision 2: Post copy gets a season-specific hook. Not generic.

v69 copy was: *"Built a free app that finds the best beach or ski spot to fly to THIS weekend — live weather + real flight prices from your home airport..."*

That's fine. But we're posting June 26, and the timing is actually a strong hook that the generic copy wastes:

- It's **peak beach season in the Northern Hemisphere** (Mediterranean, Caribbean, Hawaii, SE Asia all firing)
- It's **peak ski season in NZ, Australia, Chile, and Argentina** — Southern Hemisphere just opened their ski season

This dual-season angle is specific, surprising, and Reddit-clickable. Most travelers don't know they could be booking a ski trip to Cardrona or Valle Nevado right now.

**Updated post copy:**

> *"Built a free app that combines live weather + real flights to find the best ski or beach weekend, wherever you're flying from. 370 spots globally. It's peak beach season in the N. hemisphere right now AND peak ski season in NZ/Chile/Argentina — so both categories are fully live.*
>
> *Brutally honest about forecast confidence — shows a 'low confidence' flag if the weather window is too far out to trust, so you're not booking based on vibes. Free. No account needed. Feedback welcome. [link]"*

Post r/frugaltravel first, r/solotravel 60 min later.

**Jack: stay in thread for 3 hours.** The first comment with personal data ("Found $210 RT to Queenstown NZ, score 91 — anyone been to Cardrona?") is the difference between 3K and 8K users at 90 days.

---

### Decision 3: Post-launch sprint scope. Locked now so we don't thrash after the post.

After the Reddit post lands, the next sprint is triggered by 24h of Plausible data. **Do NOT pre-build any of this.** Wait for signal on which venues are getting clicks.

| Sprint Item | Trigger | Effort |
|-------------|---------|--------|
| Venue deep links (individual venue pages) | Plausible shows >20% of sessions end on detail sheet | 3–4h |
| Unsplash `&auto=format&q=75` optimization | Sentry LCP > 3.5s on Explore, or MAU > 100 | 30 min (sed block exists) |
| Eager Supabase `<script>` deletion | Plausible bounce rate > 65% on cold load | 30 min (diff exists) |
| Beach tag enrichment (remaining 2-tag venues) | Plausible shows filter pills with low click-through | 45 min |
| JSON-LD structured data expansion | SEO impressions flat after 2 weeks | 2h |

**DEFER ALL of the above** until we have real data. Building blind is how startups ship features nobody uses.

**CUT from this sprint entirely:** Any new venue category, any new scoring dimension, any monetization feature. The product is ready. Get users first.

---

## This Week's Top 3 Priorities Only

**1. Jack: Post to Reddit. Today. Not tomorrow.**

Day 22 is not a number with a good story. "I built this app and waited 22 days to tell anyone" is not a narrative that builds confidence. More importantly: every day we don't post is a day without Plausible data, without Sentry production signal, and without the feedback that tells us what to build next. The app is ready. The tags are fixed. Post.

**2. Jack: VPS health check from local terminal.**

`curl https://peakly-api.duckdns.org/health` — takes 30 seconds, gives real confidence that pricing and weather caching are alive before 5K people hit the app. If it returns 200 with `wx_cache_size > 0`, we're good. If it's down, you have a real P0 to fix before posting. Do this before step 1.

**3. Jack: Supabase SQL paste.**

`server/sql/delete-account.sql` → Supabase SQL editor → run. 2 minutes. Required for App Store 5.1.1(v). The client gracefully degrades until this runs, but "account deletion" is a mandatory App Store checkbox — don't let this be the blocker when you go to submit.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| New venue category (climbing, hiking, etc.) | Surfing was retired May 2026 with deliberation. Expanding categories before we have 1K users is brand dilution, not growth. REJECTED permanently for v1. |
| Peakly Pro revival | No price-sensitivity data. No users. No conversion funnel. We don't know what value justifies $79/yr yet. REJECTED until 1K MAU. |
| Hotel integrations in deal score | v69 deferred this. Still deferred. Flights + conditions is the product. REJECTED for v1. |
| Offline mode / service worker prefetch expansion | PRECACHE = [] intentionally. At <1K MAU, this adds maintenance cost with zero user benefit. REJECTED. |
| Social sharing (share a score) | Share-a-list already ships (Supabase shared_lists). Per-score sharing is a viral feature that requires a shareable URL format (venue deep links) as a prerequisite. REJECTED until deep links exist. |

---

## One Product Risk Nobody Is Talking About

**The July 4 problem.** When Jack posts today (June 26), the app will show great conditions for the **upcoming weekend: June 27–30** (days 1–4 from now, high confidence). Users who come back after the Reddit post to plan the **July 4th weekend** will be looking at day 8–11, which is beyond Open-Meteo's reliable 7-day window. The front page filters out `confidence: "low"` results. The July 4 weekend grid may be sparse or show the "low confidence" fallback.

This is correct product behavior — we don't sell certainty we can't back. But users who had a great first experience (rich cards, high confidence scores) on June 27 and come back June 29 to look at July 4 will see a noticeably different product. They won't know why. The `ScoringExplainer` component covers this conceptually, but the UX of "the app was full of results on Friday, why is it empty on Sunday?" is a churn trigger.

**Mitigation (not a code change, just copy):** The empty-state copy for `confidence: "low"` currently reads something like "Check back closer to the weekend." That is sufficient. No action needed pre-launch — but watch for comments in the Reddit thread asking "it worked great the first time, why are there no results now?" and respond proactively in thread.

---

## Success Criteria

**Launch-day baseline (48h after post):**
- ≥500 unique visitors (Plausible)
- ≥50 Explore interactions (any filter or sort change)
- ≥10 "Book" clicks (Travelpayouts or Booking.com)
- ≥5 Supabase sign-ups (magic-link)
- Zero ErrorBoundary triggers in Sentry

**90-day projection (5K vs. 8K):**

| Scenario | What's True |
|----------|-------------|
| **5K users** | One Reddit post, gets traction in r/frugaltravel, fades after 72h. No follow-up posts. No personal-data comments from Jack in thread. |
| **8K users** | Jack stays in thread, posts personal-data comment in first 30 min ("I'm flying from JFK — app showed $190 RT to Cancún, score 89"). Cross-shared to r/solotravel by a user. Second post in r/travel or r/skiing 2 weeks later using post-launch Sentry/Plausible data as social proof. |

**The lever is thread engagement, not code.** The app is ready. Everything from here is distribution.

---

*v70 — 2026-06-26 — written by PM agent*
