# Peakly PM Report — 2026-07-16 (v90)

> Supersedes v89 (July 15). **Status: GREEN on code, RED on distribution.** Day 16 post-launch. Code freeze holding (2 days, healthy). Two false positives closed today: DevOps "377 venue count" is a bracket-walker overcount (true count = 375, baseline correct); Content "6 AP_CONTINENT gaps" are all present at app.jsx:401–435. CLAUDE.md lateSeason count corrected 13→14 this run. Plausible still unread Day 16. Retention email 10 days overdue.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **375 venues (133 ski / 242 beach).** Unique-ID count, authoritative. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** 0 refs in app.jsx. Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7` and `index.html:77`.** Stop. |
| "Cache buster stale" | **`20260714a` — auto-bumps on next code change. Age alone ≠ stale.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 13 venues" | **14. Engelberg added July 14 (`747c35a`). CLAUDE.md corrected this run.** Stop. |
| "lateSeason regression" | **RESOLVED July 11 (`18b19b5`). Engelberg added July 14.** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES. 0 dup IDs.** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "KUL/SNA/MCT/TFS/CHQ missing from AP_CONTINENT" | **FALSE. All confirmed present at `app.jsx:401–435`.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary. Only appears in a comment.** Stop. |
| "venue-baseline drift / 377 venues" | **FALSE POSITIVE. Bracket-walker overcounts `{` in CSS strings. Unique-ID count = 375. Baseline (375) is CORRECT.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |

---

## Shipped Since v89 (2026-07-15 → 2026-07-16)

| Commit | What | Verdict |
|--------|------|---------|
| `97a65c7` — DevOps July 16 | GREEN audit · lateSeason 13→14 flagged (prose stale) · baseline +2 claimed (false positive) | ✅ No regressions |
| `1b91a92` — Content July 16 | Closed: Engelberg lateSeason, poolPrimary hallucination, bracket-walker overcount · Flagged: 6 AP_CONTINENT gaps (since disproved) · Queue cap at 11 enforced | ✅ Good housekeeping |
| **This run** | CLAUDE.md lateSeason prose 13→14 · venue-baseline confirmed at 375 (no change) · PM v90 | ✅ Maintenance |

**Code state July 16 (evening):**
- `app.jsx`: 13,507 lines · cache `20260714a` · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach) — authoritative unique-ID count
- `.venue-baseline`: **375 — CORRECT** (DevOps "377" was bracket-walker false positive)
- lateSeason: **14** (CLAUDE.md corrected this run) · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: all 6 flagged codes confirmed present at lines 401–435
- Staged queue: ~11 venues awaiting Jack photo approval (HOLD)

**Code freeze day 2.** Healthy. Zero regressions.

---

## Bug Triage — July 16

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | Day 16. 2+ weeks of user behavior idle. Every product decision is a hypothesis. Jack: plausible.io, 15 minutes. |
| **Retention email unsent** | **P0** | 10 days overdue. Day-7–10 window closed. Sending at Day 16 still reaches the cohort. See Decision 1. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 37. `server/sql/delete-account.sql` → Supabase SQL Editor. 2 min. Jack only. iOS App Store 5.1.1(v). |
| **VPS health verify** | P2 | 6 days since Jack verified. Before any distribution push: `curl https://peakly-api.duckdns.org/health`. |
| **SRI/CSP (Open #10)** | P3 | DEFER post-launch. 20 min from networked terminal. Not a gate. |
| **11 staged venues** | Hold | Photo approval needed. Queue capped at 14 per v88. No new additions. |
| **DevOps "377" overcount** | ✅ CLOSED | Bracket-walker false positive. Unique-ID count = 375 = baseline. Added to stop-reporting table. |
| **Content AP_CONTINENT gaps** | ✅ CLOSED | All 6 codes confirmed present at app.jsx:401–435. Added to stop-reporting table. |
| **CLAUDE.md lateSeason prose** | ✅ FIXED this run | Corrected 13→14. Engelberg confirmed at commit `747c35a`. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate venues · cross-category photos · Plausible domain · surf-legacy tags · placeholder tags · lateSeason regression · GIG/AP_CONTINENT · lateSeason count (now 14) · poolPrimary: true count · venue-baseline drift · bracket-walker overcount · AP_CONTINENT gap false positive

---

## Known Blockers

| Blocker | What It Unlocks | Days |
|---------|----------------|------|
| **Jack: read Plausible** | All product decisions | Day 16 |
| **Jack: send retention email** | Re-engagement + user research | 10 days overdue |
| **Jack: photo approval (11 staged venues)** | Catalog growth resumes | Ongoing |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 37 |
| **Jack: VPS health check** | Confidence before distribution push | 6 days |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 16

### Decision 1: Send the retention email today. This is the last call.

Fifth PM report calling this out. Day-7–10 window is gone. Sending at Day 16 reaches the same list at lower open rate. The alternative is declaring the cohort permanently lost.

From Jack, personal, 3 sentences:
> "Hey — I built Peakly and you visited a couple weeks ago. Conditions for this weekend (July 18–21) just updated — Southern Hemisphere ski looks strong right now, and the Mediterranean is peak. One question: what would make you check it every week?"

**If this hasn't gone by tomorrow's PM report, cut the cohort as lost and remove this agenda item.**

### Decision 2: Agent findings require code verification before entering PM agenda.

Today produced two false-positive P2 items (venue count, AP_CONTINENT) that each required investigation to disprove. Both were raised without checking the actual code first.

**New rule: no structural finding (count drift, missing field, duplicate) enters the PM agenda unless the raising agent has grepped/read the source and confirmed it.** DevOps should verify count discrepancies against unique IDs, not bracket counts. Content should grep before flagging missing entries.

This stops phantom bugs from burning investigation time.

### Decision 3: No second distribution post until Plausible is read. Non-negotiable.

Day 16, no Plausible data consumed. We cannot know if the onboarding flow is working, which venues drive clicks, or whether the Fri–Mon scoring resonates. A second Reddit/HN post without this is amplifying a funnel we can't see.

**DEFER any second distribution post until after Plausible is read.** 15 minutes unlocks the entire next sprint.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **SRI/CSP (Open #10)** | Security hygiene, not user-facing. DEFER post-launch. |
| **New venue additions** | HOLD pending photo approval. Not rejected. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | Cut. Re-open only if Plausible shows ≥500 MAU. |
| **APNS push alerts** | Known-skipped. Gate in place. Re-flag only at App Store queue time. |
| **VPS Redis persistence** | Right fix, wrong time. DEFER post-100 MAU. |
| **JSON-LD structured data** | Unverifiable ROI without traffic data. DEFER until Plausible read. |

---

## This Week's Top 3 Priorities Only

1. **Jack: Read Plausible.** (15 min) — unlocks every decision
2. **Jack: Send retention email.** (10 min) — last window
3. **Jack: Photo approval on 11 staged venues.** (15 min) — unblocks catalog

Everything else is deferred or closed.

---

## Success Criteria

| Metric | 5K path | 8K path | Day 16 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ❌ Day 16 unread |
| Retention email | Day 7–10 | Day 7 | ❌ Day 16 unsent |
| Second distribution | Week 2 | Week 2 | ❌ Blocked on Plausible |
| Catalog | 375+ | 391+ | ⚠️ 375, 11 staged |
| Revenue | 3 live streams | +LLC affiliates | ⚠️ 3 live |

The 8K path requires re-engagement + second post + share-a-list loop. None of these can happen intelligently without Plausible. The 5K–8K projection is unverifiable at Day 16.

**Single most important unknown:** Day-1→Day-7 retention rate. Plausible answers this in 15 minutes.

---

## One Product Risk Nobody Is Talking About

**The agent team is generating more noise than signal.**

This run: two false-positive P2s (venue overcount, AP_CONTINENT gaps) each required code investigation to disprove. The correct signal from the agent team this week should be: "code is frozen, stable, no regressions — here are the 3 Jack actions still blocking distribution."

The biggest product risk isn't a missing airport code. It's that 16 days of real user data is sitting unread while the audience cools off. The agents should be surfacing that signal, not generating phantom structural bugs that consume investigation time.

---

*Written 2026-07-16 · v90 · Day 16 post-launch*
