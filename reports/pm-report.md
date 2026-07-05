# Peakly PM Report — 2026-07-05 (v79)

> Supersedes v78 (July 4). **Status: YELLOW — code green, July 7 sprint T-2 days.** One new content finding (cross-category photo contamination) gets added to the sprint list. Everything else is a countdown and data-read.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Pivot May 2026. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price appears. Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260705a` — bumped by DevOps this run.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403s = egress block. Not VPS outage. Stop.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25).** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "Duplicate commit pattern" | **Known-skipped June 25.** Stop. |
| "197 empty-tag venues" | **FALSE. All 370 have tags.** Stop. |
| "40 ski venues had 1 tag" | **FIXED June 26.** Stop. |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "Venue count 372" | **370 is correct.** Stop. |
| "Venue freeze expires July 3" | **Extended through July 7 per v76.** Sprint opens tomorrow. |

---

## Shipped Since v78 (2026-07-04 → 2026-07-05)

| What | Verdict |
|------|---------|
| **DevOps July 5** (`bf5936e`) — YELLOW. Cache `20260704a`→`20260705a` in lockstep. Braces 5565/5565. All invariants hold. VPS unverifiable (sandbox egress). | ✅ Clean. Cache current. |
| **Content July 5** (`43d2e96`) — 72/100 (unchanged open issues). New finding: **2 beach venues rendering ski/mountain photos** — cross-category contamination. All July 7 fixes confirmed staged. Freeze holds. | ⚠️ New P1. See below. |

**Code state July 5:**
- `app.jsx`: 13,443 lines · cache `20260705a` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- 138 unique photos · max repeat 3× · 0 empty-tag venues · 131/131 skiPass
- Sentry DSN: active · Plausible: wired (`j1mmychu.github.io`, fix in July 7 sprint)

---

## Bug Triage — July 5

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** (if June 30 launch happened) | **P0** | Day 5 of real user data. Jack: open plausible.io dashboard now. |
| **Reddit post not yet verified** | **P0 (if not done)** | Cannot confirm from sandbox. If not posted — post this weekend before the July 4 momentum fully dissipates. |
| **VPS cache restart risk** | **P1** | In-memory weather cache = 0 if VPS rebooted since June 30. Jack: `curl https://peakly-api.duckdns.org/health` + `pm2 describe peakly-proxy` uptime. If uptime < 5d, restart happened. |
| **Cross-category photo contamination** | **P1** | 2 beach venues rendering ski/mountain photos — visible user-facing error. Beach user sees a mountain card; trust erodes. Fix staged in content report. **Add to July 7 sprint, position 0.** |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | `server/sql/delete-account.sql` → Supabase SQL editor. 2 min. Jack-only. Day 27 open. |
| **Plausible `data-domain` scope** | P2 | `j1mmychu.github.io` captures all subdomain pages. 2-min fix. July 7 sprint. |
| 5 placeholder-tag ski venues | P2 | 3 are lateSeason — can appear in ski grid. Fix-ready. July 7. |
| 3 logical venue duplicates | P2 | Invisible to users. July 7. |
| 27 surf-legacy tags | P2 | Detail-sheet only. July 7. |
| SRI on CDN scripts (Open #10) | P3 | DEFER post-LLC. |
| 14 orphaned `claude/` branches | P4 | Not blocking. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Plausible read** | Week 1 data drives all July 7 decisions | Day 5 |
| **Reddit post** (if not done) | Users | Day 31 |
| **VPS health verify** | Weather proxy confidence | Day 22 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 27 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |
| Apple Developer ($99) | App Store submission | Post-launch |

---

## Explicit Product Decisions — July 5

### Decision 1: Cross-category photo contamination is P1. Fix it first in the July 7 sprint.

Two beach venues are rendering ski/mountain photos. A first-time user on the beach filter in July clicking a venue card and seeing a mountain is a visible product error — not a code error, not a data footnote, but a real user-facing trust failure. Content report has the fix staged. This goes to **position 0** in the July 7 sprint, before placeholder tags, before Plausible domain, before anything else.

**SHIP: Fix the 2 contaminated beach venue photos on July 7, first thing.**

---

### Decision 2: July 7 sprint order — updated with photo fix at top.

| Order | Task | Time |
|-------|------|------|
| **0** | **Fix 2 beach venues with ski photos** | 10 min |
| 1 | **Read Plausible + Sentry** (before touching any code) | 30 min |
| 2 | **Fix Plausible domain scope** (`j1mmychu.github.io` → `j1mmychu.github.io/peakly`) | 2 min |
| 3 | **Fix placeholder tags on 3 lateSeason ski venues** | 15 min |
| 4 | **Remove 3 logical venue duplicates** | 10 min |
| 5 | **Remove 27 surf-legacy tags** | 20 min |
| 6 | **Supabase SQL paste** | 2 min |
| 7 | **Personal email draft** — Jack to signups, send July 10 | 20 min |

Photo fix (item 0) before Plausible read (item 1) is the one exception to "read data first" — it's a visible content error not a design decision. Fix it unconditionally.

Items deferred past July 7: photo dedup ≤2× (needs 50 new verified photos — not a sprint task), SRI hashes, JSON-LD, venue deep links, new venues.

**DEFER: Anything not in the table above.**

---

### Decision 3: The July 8-14 window is the first real retention measurement.

v78 established Week-2 return rate as the primary post-launch KPI. Here's the measurement contract:

- **Baseline:** unique visitors July 4-7 (however many came from the post)
- **Return gate:** did those same users return July 11-14 (the following weekend)?
- **Plausible measurement:** look at returning vs. new visitor split on July 12-13 — returning visitors represent the retention cohort
- **Target:** ≥20% Day-7 return rate means the product has pull without email nudging

The personal email from Jack on July 10 is a nudge but shouldn't be the only mechanism. If Day-7 return without email is <10%, the onboarding needs a hook — either a "save for next weekend" prompt or the ScoringExplainer card timing is wrong.

**SHIP: Measure July 12-13 returning visitor % as the Week-2 KPI. Report in v80.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Open Plausible. Read it for 30 minutes before the July 7 sprint starts.**

This is the hard rule. The photo fix (item 0) can go first. Everything else — which venue tags to prioritize, whether to add US beach venues, what the July 10 email says — depends on what the data shows. If 80% of visitors filtered for Beach, that changes the content sprint. If 40% filtered for Skiing, that's a surprise that changes the August narrative.

**2. Jack: Fix the VPS before the July 7 sprint re-opens the app to edits.**

`curl https://peakly-api.duckdns.org/health` then check pm2 uptime. If the cache was cold during the July 4 peak, users saw degraded weather scores. Knowing whether the VPS was warm vs. cold explains any Plausible bounce anomaly and tells you whether the Week-1 data is clean signal or noisy.

**3. Jack: Write the Week-1 retention email tonight, send July 10.**

"Hey — I built Peakly and you signed up last week. What did you actually search for?" Three sentences. One question. This email is worth more than any feature built this sprint — a 15-30% response rate from Week-1 users gives you direct product feedback before you touch the code.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| New venue categories | CUT. Zero users validated demand. 2-category focus is the moat. |
| New venues (pre-Plausible-read) | DEFER until Plausible confirms a geography gap. Building content for hypothetical demand is waste. |
| Peakly Pro / subscription | DEFER to 500 users. No price-sensitivity data. |
| Hotel integrations in deal score | CUT for v1. Scope creep. |
| JSON-LD structured data | DEFER. SEO pays off on traffic, not absence of it. Post-first-100-users. |
| Venue deep links | DEFER. Build after >100 detail-sheet opens/day confirmed in Plausible. |
| Automated email digest | DEFER code. Manual founder email first — infrastructure for an empty list. |
| SRI hashes on CDN | P3, post-LLC. DEFER. |

---

## Success Criteria — 8K vs 5K

Three gate metrics (unchanged from v78):

1. **Week-1 unique visitors ≥ 2K** — distribution signal. Below 2K = repost in a different subreddit.
2. **Week-2 return rate ≥ 20%** — retention gate. Below 20% = onboarding and email need work.
3. **Beach filter ≥ 40% of filter clicks in July** — seasonal narrative check. Below 40% = copy mismatch.

For 8K (not 5K): organic referral loop kicks in by Week 4. If "share a weekend plan" isn't driving 5+ referrals/week by July 28, the ceiling is 5K and Labor Day requires a second post.

---

## One Product Risk Nobody Is Talking About

**The seasonal identity problem: the app Plausible users know in July will look like a different app in October.**

Right now, 184 of 239 beach venues are in-season. The Explore grid for a US user in July is overwhelmingly beach. The product feels like a beach weekend app with a ski bonus for Southern Hemisphere travelers.

In October, that flips: US ski resorts open (Vail, Breckenridge, Whistler), N. hemisphere beach cools, and the front page becomes ski-dominant for US users. The algorithm is correct. But a user who discovered Peakly in July as "that app that finds good beach weekends" and returns in October will see a ski-dominant grid and wonder if the product changed.

This isn't a bug. It's the product working as designed — the seasonal default logic is correct. **But the July Reddit post copy will anchor users to a mental model of "beach app."** If the copy doesn't equally frame the ski identity ("Skiing in winter, beach in summer — Peakly tracks conditions for both"), October retention will drop artificially because the product looks different, not because it got worse.

**The fix is in the post copy, not the algorithm.** The July post should explicitly say "Skiing + beach. Ski resorts in winter, beaches in summer, Southern Hemisphere ski right now." Three phrases. That framing sets up October re-engagement instead of confusing it.

This is a distribution copy problem, not a code problem. And it's the one thing that could cost 2–3 percentage points of October retention for free.

---

*Report v79 — PM agent, July 5 2026. July 7 sprint opens in 2 days. v80 expected July 7 after the sprint closes — first Plausible data read and photo fix confirmed.*
