# Peakly PM Report — 2026-05-04 (v26)

**Filed by:** Product Manager agent
**Date:** 2026-05-04
**Status:** YELLOW — P1 venue duplicates still live 11+ days, but core product is clean. Reddit launch remains the only non-technical constraint.

---

## Shipped Since Last Report (2026-05-01 → 2026-05-04)

| Commit | What | Right call? |
|--------|------|-------------|
| `c9a384d` (May 1) | Delete aspen-snowmass-s7 + fix lech-zurs tags + cache bump 20260501a | ✅ Correct. Closed 3 P1s |
| `3139d77` (May 2) | Cache bump 20260502a + Sentry sampling 1.0→0.05 + fetchJson body timeout | ✅ Correct. DevOps hygiene worth shipping |
| `f1abcea` (May 2) | Merge + content/devops/PM reports | Neutral |
| `7a37b96` (May 2) | Content report update | Neutral |
| `52e2236` (May 2) | Content report update | Neutral |
| **May 3** | **Nothing.** | — |

**Assessment:** Good discipline May 1–2 — closed the last explicit P1s from the prior report. One shipping day skipped (May 3). The agent cadence is producing reports but not converting them into commits fast enough. Five same-location duplicates flagged in every content report since Apr 23 still live. That's 11 days.

**Right call check on May 2 DevOps commit:** Yes. Sentry sampling at 1.0 was capturing 100% of traces, burning through the free tier before any real traffic exists. Dropping to 0.05 at this MAU level is correct. The fetchJson body timeout closes a real hang vector. Both worth doing.

---

## Bug Triage — May 4

| Bug | Severity | Status | Days Open | Notes |
|-----|----------|--------|-----------|-------|
| **4 same-location venue duplicates** | **P1** | ❌ LIVE | Day 11 | `siargao`/`cloud9`, `snappers-gold-coast-s26`/`snapper_rocks`, `banzai_pipeline`/`pipeline`, `fernando-de-noronha-s20`/`noronha_surf`. Double-listing in Explore, broken continent filter for some, credibility liability. |
| **Amazon gear gate `{false && ...}` at app.jsx:5763** | **P2** | ❌ LIVE | Day 24 | Intentionally blocked until LLC approved. Not changing this. |
| **Marine batch loader** | **CLOSED** | ✅ Fixed | — | `needsMarine` now checks both `surfing` and `tanning` (app.jsx:6761, 6783). CLAUDE.md is stale on this — not an open issue. |
| **Strike alerts background worker** | **P2** | DEFER | — | Zero alert users. Build post-500 MAU. |
| **Open-Meteo rate limit** | **P2** | Monitor | — | 240 venues × ~1.5 calls. Safe at current traffic. Build server-side weather cache pre-500 MAU. |
| **Peakly Pro $9/mo price** | **CLOSED** | N/A | — | No Pro UI exists. Removed 2026-03-26. Stop flagging. |
| **Sentry DSN** | **CLOSED** | ✅ Fixed | — | Real DSN in app.jsx:7-8. Stop flagging. |
| **Cache buster** | **CLOSED** | ✅ Fresh | — | v=20260502a shipped May 2. Current. |

**Total active P1s: 1.** One commit clears it.

### Clarification: Taghazout vs Anchor Point (Morocco)

Content report flags these as duplicates. They are **not**. Taghazout (30.56°N) is a surf village 3km north of Anchor Point (30.53°N) — different breaks, different experiences. Taghazout = surf camp hub with Hash Point and Killers. Anchor Point = standalone right-hand point break, best wave in Morocco. Both entries are legitimate. Do not delete either. Remove from duplicate watch list permanently.

**Revised active duplicate pairs: 4, not 5.**

---

## Explicit Product Decisions — May 4

**1. Delete 4 venue duplicates: SHIP TODAY.**

| Delete (worse entry) | Keep (canonical) | Reason |
|---------------------|-----------------|--------|
| `siargao` (IAO, 4.93, added Apr 23) | `cloud9` (CEB, 4.95) | 0.01° apart. Cloud 9 is the break's name. `cloud9` has better airport code, older canonical ID |
| `snappers-gold-coast-s26` (4.82, batch entry) | `snapper_rocks` (4.94) | 0.003° apart. Same Superbank. `snapper_rocks` has better rating, cleaner tags |
| `banzai_pipeline` (4.99, 6420 reviews) | `pipeline` (4.99, 1203 reviews) | 0.002° apart. Same wave. `pipeline` is the correct slug despite `banzai_pipeline` having more reviews — ID naming matters |
| `fernando-de-noronha-s20` (4.75, wrong tags) | `noronha_surf` (4.96) | 0.003° apart. `noronha_surf` correct tags and rating |

Four line deletions. Under 10 minutes. 11 days open.

**2. Update CLAUDE.md: Marine batch loader is FIXED — SHIP TODAY.**
CLAUDE.md item #3 in "What's Broken" still lists "Marine batch loader — needsMarine only checks surfing." Code at app.jsx:6761+6783 now checks both. Remove it from the open bugs section so agents stop investigating a closed issue.

**3. Server-side weather cache in proxy.js: DEFER to pre-500 MAU.**
DevOps report calls this the highest-ROI infrastructure change. True at scale. Not true now. Zero sustained traffic means zero rate-limit risk. The correct trigger is: 3 consecutive days with 50+ DAU. Build it then, not before.

**4. Content venue additions (Skeleton Bay, Lagundri Bay, Elafonissi, Exuma Cays, La Grave): DEFER.**
Content agent has a paste-ready block for 5 new venues. Rule: delete duplicates before adding new ones. This is how the siargao/cloud9 problem happened — added without checking existing catalog. After the delete commit ships, these 5 are sound choices on merit.

**5. Peakly Pro: CUT from all reporting until 1K MAU.**
No UI exists. No pricing research done. No payment processor. Discussing it in reports wastes context and creates false urgency. Off the table until 1K MAU is confirmed.

---

## This Week's Top 3 Priorities Only

**1. Delete 4 venue duplicates + update CLAUDE.md** — one commit, 15 minutes. Closes the last P1. Raises data health score from 78 to ~88. Ships clean venue data before the Reddit post.

**2. Jack: Reddit post before May 15.** It's May 4. 11 days left in the peak-season window. Structure: 3 screenshots of currently-scoring beach venues + "built this to find the right weekend to book" + link. r/travel first (low hostility, 50M members). Don't wait for native app, venue deep links, or onboarding flow. The product is ready.

**3. Jack: Check `server/data/waitlist.jsonl` line count before posting.** If under 20: mention in post that you're looking for early feedback. If 50+: lead with "50 people already signed up." This is a 30-second check that shapes the entire post framing.

Everything else is deferred until after the Reddit post is live and D1 retention data exists.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Server-side weather cache | **DEFER** | Pre-500 MAU trigger; no traffic to protect against |
| Venue additions (5 new) | **DEFER** | Delete duplicates first; always |
| Peakly Pro | **CUT (from reporting)** | Wrong phase; stop discussing until 1K MAU |
| Window Score display | **DEFER** | Post-Reddit; need user signal first |
| SRI / CSP hardening | **DEFER** | Risk of breaking Babel eval; post-launch |
| "Season Opening Soon" badge (SH ski) | **DEFER** | Not the constraint right now |
| Strike alerts background worker | **DEFER** | Zero alert users |
| Trips / Wishlists tab | **DEFER** | 1K users minimum |
| iOS App Store | **DEFER** | PWA first |
| VPS upgrade to 2GB | **DEFER** | Pre-launch-spike trigger, not pre-post |

---

## Success Criteria

**5K vs 8K users by day 90:**

1. **Reddit happens before May 15.** A June launch means NH ski is dead and the surf seasonal narrative weakens. This one decision is worth ~2K users on its own.
2. **D1 retention > 40%.** No Plausible session-depth data yet — this is currently unmeasurable. The Weekend Score is only a moat if users return after seeing it work once.
3. **Email capture: 100+ in first 72 hours.** Without it, the Reddit spike is one-and-done. The second wave is the email list.
4. **Zero credibility screenshots before post.** `banzai_pipeline` + `pipeline` side-by-side in Explore will get screenshotted on r/surfing. That thread is worse than no launch at all.

**90-day math:**
- May launch + clean venues + email + 40% D1 = 7K–8K
- June launch + credibility incident + no email = 4K plateau

---

## The One Risk Nobody Is Talking About

**We have no signal on what the May Explore feed actually looks like to a real user.**

73 ski venues score 8 ("Off-season"). 89 beach venues are in season. Of those 89, an unknown percentage pass the Weekend Score confidence gate (high/medium only — low confidence is filtered on the front page). Nobody knows what % of beach venues show a meaningful score this weekend versus a grey "conditions unclear" state.

Jack should open the app right now, set home airport to ORD or JFK, and report what he sees. If 30+ venues show above-70 scores with readable weekend windows, the Reddit post writes itself. If the Explore feed looks flat — same score across all beaches, no obvious winner — the Weekend Score isn't differentiating enough and the post will land flat.

This is a 60-second audit. It's the most important product signal available before the launch post goes out. No agent can do it.
