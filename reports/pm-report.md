# Peakly PM Report — 2026-07-13 (v87)

> Supersedes v86 (July 12). **Status: GREEN on code, RED on distribution.** Day 13 post-launch. Code pipeline healthy — DevOps shipped 3 placeholder-tag fixes + cache bump today. **Week-2 retention window closes today.** Retention email P0 for 7 consecutive reports. Plausible still unread at Day 13.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **375 venues (133 ski / 242 beach).** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260713a` — bumped today by DevOps.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8.** Stop. |
| "5 placeholder-tag venues" | **0 remaining — FIXED today (DevOps July 13).** Stop. |
| "lateSeason: 25 venues" | **13 (confirmed DevOps July 11 + today). CLAUDE.md count stale.** Stop saying 25. |
| "lateSeason regression open" | **RESOLVED July 11 (`18b19b5`). Count = 13.** Content data health score issue — not a code bug. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags. PM v81 Decision 1.** Stop. |
| "cancun-beach dup" | **FIXED July 8. 0 duplicate IDs.** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "Alpe d'Huez / Cortina in catalog" | **Not yet — staged, unverified. See Bug Triage.** |

---

## Shipped Since v86 (2026-07-12 → 2026-07-13)

| Commit | What | Verdict |
|--------|------|---------|
| `054b717` — DevOps July 13 | 3 placeholder-tag fixes (whistler / beaver-creek / park-city-mountain) + cache `20260711a`→`20260713a` | ✅ P1 closed. Powder Day filter clean. |
| `05bc61e` — Content July 13 | 375 venues confirmed, lateSeason 13 confirmed, 9 staged venues flagged as unverified-hold | ✅ Audit current. |

**Code state July 13:**
- `app.jsx`: 13,502 lines · cache `20260713a` · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach)
- GEAR_ITEMS: 0 · lateSeason: 13 · 0 placeholder-tag venues · Sentry: active · Plausible: scoped ✅

---

## Bug Triage — July 13

| Bug | Severity | Status |
|-----|----------|--------|
| **Week-2 retention email** — window closes today | **P0 — LAST CALL** | 7 consecutive reports. The July 1–7 cohort's Day-7–13 return window expires tonight. Jack: 3-sentence email, personal, today. Details in Decision 1. |
| **Plausible data unread** | **P0** | Day 13 post-launch. 13 days of user behavior unread. Every product decision this month is a hypothesis. Jack: plausible.io, 15 min. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 34. 2 minutes. Jack only. `server/sql/delete-account.sql`. |
| **VPS weather cache** | P1 | Unverifiable from sandbox. Day 29. Jack: `curl https://peakly-api.duckdns.org/health`. If `wx_cache_size == 0`, warm it before any distribution push. |
| **9 staged venues unverified** | P2 | Jul 11 batch (alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil, punta-mita-beach) + Jul 12 batch (essaouira, sunny-beach-bg, sango-sands, tropea-beach-it, porter-heights-nz). Gate: `validate-venues.mjs` + photo visual check. Hold until Jack verifies photos. |
| **CLAUDE.md lateSeason count stale** | P3 | Says 25, code has 13. DevOps confirmed 13 is correct. CLAUDE.md needs a one-line correction. Agent-fixable. |
| Babel 8.x upgrade | P2 | DEFER post-500 MAU. |
| LatAm beach gap | P3 | DEFER until Plausible confirms demand. |
| SRI hashes on CDN scripts | P3 | DEFER post-LLC. |
| Plausible dashboard domain (Settings UI) | P2 | Jack only. plausible.io → Sites → Settings → Domain → `j1mmychu.github.io/peakly`. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" outage framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate-commit pattern · cross-category photos · Plausible domain (code) · surf-legacy tags · cancun-beach dup · bigsky dup · placeholder tags · lateSeason regression (code, July 11) · GIG/AP_CONTINENT

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Week-2 email** (Jack — TODAY is the last day) | Last re-engagement chance for launch cohort + first user research | Day 7 |
| **Plausible read** (Jack, plausible.io) | All product prioritization — 13 days blind | Day 13 |
| **VPS health check** (Jack, local terminal) | Weather data quality confidence before any distribution push | Day 29 |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 34 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 13

### Decision 1: Send the retention email today. Modified framing accepted.

The Day-7–10 return-rate KPI is no longer measurable — that window is gone. What the email can still do:

1. Drive a Day-13 return visit from lapsed users
2. Generate the first real user replies (user research)
3. Surface whether anyone is using Peakly as a weekly habit vs a one-time visit

**What to send (Jack, 3 sentences, personal):**

> "Hey — I built Peakly and you visited a couple weeks ago. Scores just updated for this weekend (July 14–17) — beach conditions in the Mediterranean look strong and Southern Hemisphere ski is at peak winter. Reply and tell me: what was one thing missing that would make you check it every week?"

The last question is the only question that matters for 100K downloads. Every reply is a product insight you can't get any other way. Send from Jack's personal email, not a tool. Do not automate.

**Decision: SEND TODAY. The launch cohort is permanently uncontacted after tonight.**

### Decision 2: HOLD all 9 staged venues until Jack verifies photos visually.

Content has staged 9 venues across two batches (Jul 11 + Jul 12). The `validate-venues.mjs` gate checks structural fields — it does not verify that Unsplash photo URLs are correctly themed (no ski-photo-on-beach errors). The July 6 photo contamination incident was exactly this failure mode.

The 9 venues include beach venues like `sango-sands` (northern Scotland), `sunny-beach-bg` (Bulgaria), `pipa-beach-brazil`. Adding them with unverified photos risks another contamination incident 7 days after the last fix.

**Decision: HOLD. No agent pastes any staged venue until Jack confirms photo URLs visually. `validate-venues.mjs` is a necessary but not sufficient gate.**

### Decision 3: Fix CLAUDE.md lateSeason count from 25 → 13 this run.

CLAUDE.md says "25 venues" carry `lateSeason: true`. DevOps has confirmed code has 13. The content agent data health penalty for this "regression" is causing cascading confusion across reports. v86 declared it an "ongoing regression" when it was resolved in code on July 11.

The correct 13: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.

**Decision: UPDATE CLAUDE.md `lateSeason` count from 25 → 13 this run. Include the full list. End the false regression flag.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Send the email today.**

Every day it goes unsent is a day the launch cohort drifts further from the product. 3 sentences. Personal. Ask the question that matters for 100K.

**2. Jack: Read Plausible before the Week-3 sprint.**

Week-3 starts July 14. The next distribution push (if needed) should happen July 15–18. Without reading Plausible, we don't know if a second push is needed (uniques < 1K), premature (> 2K with good retention), or misdirected (wrong audience). Read the dashboard before writing any code this week.

**3. CLAUDE.md lateSeason correction (agent-executable this run) + venue pipeline decision.**

Fix CLAUDE.md (this run). Then Jack makes the photo-verify call on 9 staged venues — if he can do a visual pass this week, 4–9 of them ship immediately. If not, the backlog accumulates and agents count unverified staged items as "pending" indefinitely.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| Hotel integrations | **CUT for v1.** Scope creep. |
| JSON-LD / structured data | **DEFER.** SEO compounds on traffic that doesn't exist yet. Post-100 DAU. |
| Venue deep links / permalink pages | **DEFER.** Build after Plausible shows >100 detail-sheet views/day per venue. |
| Photo dedup ≤2× | **DEFER.** Needs ~100 new verified Unsplash IDs. No API key in repo. |
| New venue categories (climbing, surf, hiking) | **CUT.** Ski + beach focus is the moat. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** P3. |
| Automated weekly email digest | **DEFER.** Manual founder email first. |
| Second Reddit post (automated) | **DEFER pending Plausible read.** Jack calls this, not agents. |
| Tag enrichment beyond current floor | **DEFER.** Wait for filter-click data from Plausible. |
| Babel 8.x upgrade | **DEFER post-500 MAU.** No breaking changes in current version. |

---

## Success Criteria — 8K vs 5K

**The Week-2 return rate KPI is no longer measurable** — the observation window closes today.

**Week-3 gate metrics (by July 20):**
1. Jack reads Plausible and reports unique visitors from the launch post
2. If uniques < 1K → second Reddit post required July 15–18 (different subreddit: r/skiing, r/travel, or r/weekendtravel)
3. If uniques 1–2K → send email + hold on second post; Week-4 return rate is the next signal
4. If uniques > 2K → organic retention data is the priority; email replies > second post

**For 8K not 5K:** The path is a second distribution moment. Feature work compounds on traffic that already exists. At < 2K launch uniques, there is no base to compound. The email going out today + Jack reading Plausible this week are the only actions that move the needle.

---

## One Product Risk Nobody Is Talking About

**The agent pipeline is providing false comfort while the distribution problem goes unaddressed.**

Every day: DevOps verifies infrastructure, Content audits venues, PM lists priorities. Code is healthy. Venue count grows. Tags are clean. Cache is current.

We have no idea how many people are using the product because the agent team cannot read Plausible.

The risk is that clean daily reports feel like progress. But the only metric that matters right now — are real users returning? — is completely invisible. A product with 375 venues, correct cache stamps, and zero placeholder tags is still a failed launch if 200 people visited once and never came back.

The email goes out today. Jack reads Plausible. Those two actions determine whether this is a launch or a prototype.

---

*PM agent — 2026-07-13 (v87). v88 expected July 14. If Jack shares Plausible data in session, v88 becomes data-driven. If not, v88 flags the gap again — but at Day 14 the signal is 2 weeks old.*
