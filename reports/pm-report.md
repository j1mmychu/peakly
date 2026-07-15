# Peakly PM Report — 2026-07-15 (v89)

> Supersedes v88 (July 14). **Status: GREEN on code, RED on distribution.** Day 15 post-launch. Engelberg `lateSeason` fix confirmed shipped. DevOps reported a venue-baseline drift (+2) that turned out to be a bracket-walker miscount — actual count 375, baseline 375, no action needed. Plausible unread at Day 15: every distribution decision is a guess until Jack opens it.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **375 venues (133 ski / 242 beach).** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260714a` — 1 day old, bumped with Engelberg fix. Next deploy bumps it.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 25 / 19 / 13 venues" | **14. Engelberg added July 14 (`747c35a`).** Stop. |
| "lateSeason regression open" | **RESOLVED July 11 (`18b19b5`). Engelberg added July 14.** Stop. |
| "2 dup venues pending" | **FIXED July 8.** Stop. |
| "5 placeholder-tag venues" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags. PM v81 Decision 1.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES. 0 dup IDs.** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only, incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |
| "venue-baseline drift / 377 venues" | **FALSE. Category grep → 375. Baseline 375. Bracket-walker miscount. No action needed.** Stop. |

---

## Shipped Since v88 (2026-07-14 → 2026-07-15)

| Commit | What | Verdict |
|--------|------|---------|
| `747c35a` — PM v88 + Engelberg + cache | Engelberg `lateSeason: true` added · cache `20260713a`→`20260714a` · lateSeason count now 14 | ✅ Right call. 5-minute fix, zero risk, immediate scoring benefit for glacier ski traffic this summer |
| `40665ce` — DevOps July 15 (first run) | Clean audit · venue-baseline drift flagged as P2 (was bracket-walker miscount — false alarm) | ✅ GREEN infrastructure |
| `014ce69` — Merge | Rebase merge | — |
| `a48581e` — DevOps July 15 (second run) | Same GREEN status · drift now "+2" claim (still miscount — actual 375 = baseline) | ✅ Confirms no regressions |

**Code state July 15:**
- `app.jsx`: 13,506+ lines · cache `20260714a` · braces balanced ✅
- **375 venues** (133 ski / 242 beach) — confirmed via category grep
- GEAR_ITEMS: 0 · lateSeason: 14 · placeholder tags: 0 · Sentry: active · Plausible: scoped ✅
- **Staged venue queue: ~14 venues awaiting Jack photo approval** (queue capped per Decision 3, v88)

---

## Bug Triage — July 15

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | Day 15. Two weeks of real user data — bounce rate, filter usage, top referrer — sitting unread. Every product decision this sprint is a hypothesis until Jack opens plausible.io. Cannot defer another day. |
| **Retention email unsent** | **P1** | Day 9 overdue. v88 said "send today," it didn't happen. Day-7–10 window is fully closed. Send anyway — late re-engagement beats zero re-engagement. Each day further is permanent signal loss. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | Day 36. 2 minutes. Jack only. `server/sql/delete-account.sql` → Supabase SQL Editor. Required for iOS App Store 5.1.1(v). Not blocking web product. |
| **VPS health verify** | P1 | Last Jack-verified July 10 (5 days ago). `curl https://peakly-api.duckdns.org/health` — if `wx_cache_size == 0`, cache is cold. Do not push distribution with cold weather cache. |
| **14 staged venues awaiting photo verify** | P2 | HOLD per Decision 3 (v88). Queue capped at 14. No new staging. Unblock: Jack 15-min photo-verify pass. |
| **SRI hashes on CDN scripts** | P3 | Open #10 — persistent. DEFER post-launch. |
| **venue-baseline drift** | ✅ FALSE ALARM | DevOps bracket-walker returned 377; category grep returns 375 = baseline. No action. Stop flagging. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" outage framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate-commit pattern · cross-category photos · Plausible domain (code) · surf-legacy tags · cancun-beach dup · bigsky dup · placeholder tags · lateSeason regression (code) · GIG/AP_CONTINENT · lateSeason CLAUDE.md count (14)

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Plausible read** (Jack, plausible.io, 15 min) | Every product decision: second post angle, whether retention is working, what filter users touch most | Day 15 |
| **Retention email** (Jack, personal, 5 min) | First user research replies + re-engagement before cohort goes permanently cold | Day 9 overdue |
| **Jack: photo approval of 14 staged venues** | Catalog growth — queue capped until verify pass runs | Ongoing |
| **Supabase SQL paste** (Jack, 2 min) | iOS App Store Guideline 5.1.1(v) | Day 36 |
| **VPS health verify** (Jack, 1 min) | Confidence weather data is hot before any distribution push | Day 5 since last check |
| **LLC approval** | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 15

### Decision 1: Venue-baseline "drift" is a false alarm. No fix needed.

DevOps (both July 15 runs) flagged `.venue-baseline` at 375 vs "377 actual." The bracket-walker eval the DevOps agent uses returned 377, but direct category grep returns **133 ski + 242 beach = 375**. The baseline at 375 is correct.

**DO NOT update `.venue-baseline` to 377.** The DevOps agent's bracket-walker is miscounting (likely picks up a test object or a venue object outside the VENUES array). Updating the baseline to 377 would loosen the safety floor and mask a real deletion. The guard is working correctly at 375.

**Add this to the stop-reporting table in all future runs.** A new agent run that re-flags this same miscount is wasted output.

### Decision 2: No new code this week. Distribution is the only lever.

Eight days since last user-facing code change (photo-dedup July 6). The product is stable. The 90-day user target (5K–8K) won't move because of another feature — it moves because more people find the app and someone gives them a reason to come back.

**Until Plausible is read:** zero new feature work. Agents audit, stage venues, and flag regressions only.

**Once Plausible is read:** Jack makes a single call — second Reddit post (different angle, different subreddit) or hold until Week-3 data. That call requires actual numbers, not estimates.

### Decision 3: Retention email deadline is today (July 15). Final call.

v87 said "send today" (July 13). v88 said "send today" (July 14). It hasn't been sent. This is now Day 15.

At Day 21 the cohort is effectively cold — open rate drops below 10% and replies become noise. We have 6 days of meaningful signal-gathering left.

**The email doesn't need to be polished. Three sentences from Jack. Send by end of day July 15 or cut this tactic entirely.** A week of agents writing "send today" without it happening is its own data point — if this isn't the right tactic for Jack, cut it and route the re-engagement energy somewhere else (Reddit reply, Twitter/X post, DM to early users). But decide.

---

## This Week's Top 3 Priorities Only

**1. Jack: Open plausible.io. 15 minutes. Then decide everything else.**

Every priority below this one changes depending on what Plausible shows. Bounce rate tells you if the landing experience is broken. Filter usage tells you whether skiing or beach is the dominant use case. Top referrer tells you where Week-1 users came from and where the second distribution moment should go. This is the most leveraged 15 minutes available.

**2. Send the retention email or explicitly cut the tactic.**

v89 is the third consecutive PM report saying "send today." At this point the decision is binary: send it today, or close this tactic and note it in known-skipped.md. No more deferral. The 6-day window to meaningful replies closes around July 21.

**3. Jack: photo-verify pass on 14 staged venues. Opens the catalog pipeline.**

15 minutes. Each approved venue ships in the next DevOps run and adds a new search result, a new SEO entry, and a new weekend option for users. The staged queue is capped — until Jack runs this pass, Content agent work stops producing real output.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| Redis VPS persistence | **DEFER post-100 MAU.** Real value; zero traffic makes it moot. |
| Hotel integrations | **CUT for v1.** Scope creep. |
| JSON-LD / structured data | **DEFER.** SEO compounds on traffic. Post-100 DAU, post-Plausible-read. |
| Venue deep links | **DEFER.** Post-100 detail-sheet views/day in Plausible. |
| New venue categories | **CUT.** Ski + beach is the moat. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** P3. |
| Second Reddit post | **BLOCKED on Plausible read.** Jack's call, not agents'. Wrong angle tanks Day-2 karma. |
| Automated email digest | **DEFER.** Manual founder email first — and it still hasn't been sent. |
| LatAm beach expansion | **DEFER.** Queue at cap; verify existing staged venues first. |
| Any new scoring changes | **BLOCKED.** No algorithm changes without Plausible data showing scoring is the problem. |

---

## Success Criteria — 8K vs 5K

**The 90-day window closes October 15.** We are 15 days in with approximately 75 days remaining.

**For 8K not 5K, two things have to be true:**
1. A second distribution moment happens before August — a different subreddit, a tweet that hits, a Product Hunt day. The first Reddit post is the ceiling without it.
2. Week-2 retention is above 20%. If users who visited Week 1 aren't back in Week 2, no amount of new traffic compounds.

**Plausible shows both.** Until Jack reads it, we're flying without instruments.

**Week-3 call tree (by July 17):**
1. Uniques < 1K → second Reddit post required this week. Different subreddit + angle (glacier summer skiing, "where to go this weekend in Europe").
2. Uniques 1–2K → hold second post; email is the re-engagement lever. Week-4 return rate determines second post timing.
3. Uniques > 2K → feature work starts making sense. Email replies are the signal. Second post targets a specific hook from Plausible top-referrer data.

**One product risk nobody is talking about:** The seasonal window is working against us. Southern-hemisphere skiing is at peak (June–August), Mediterranean beach is at peak (July–August) — but the Northern-hemisphere skiing audience that first posted probably has no intention of booking a ski trip in July. If the Week-1 cohort was N-hemisphere ski-curious and they're seeing beach results, they bounced on category mismatch, not product quality. Plausible filter usage would show this immediately. If that's the pattern, the fix is a single seasonal copy change on first load, not a feature.

---
