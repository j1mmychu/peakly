# Peakly PM Report — 2026-07-16 (v89)

> Supersedes v88 (July 14). **Status: GREEN on code, RED on distribution.** Day 16 post-launch. Zero code changes in 3 days (healthy freeze). Plausible still unread at Day 16 — this is now a critical intelligence gap. Retention email still unsent — 10 days overdue, send it today or cut the cohort as lost. Two false-positive P2 items in the prompt agent corrected below.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **377 venues (133 ski / 244 beach).** DevOps July 15 confirmed via eval. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Zero Pro references in app.jsx. Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7` and `index.html:77`.** Stop. |
| "Cache buster stale" | **`20260714a` — 2 days old. Not stale; next code change auto-bumps it.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 25 / 19 / 13 venues" | **14 (Engelberg added July 14, commit `747c35a`).** Stop. |
| "lateSeason regression open" | **RESOLVED July 11 (`18b19b5`).** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — PRESETS array, not VENUES. 0 dup IDs.** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |

---

## Shipped Since v88 (2026-07-14 → 2026-07-16)

| Commit | What | Verdict |
|--------|------|---------|
| `40665ce` — DevOps July 15 (first run) | GREEN audit · venue-baseline drift P2 flagged · SRI/CSP persistent | ✅ No regressions |
| `a48581e` — DevOps July 15 (second run) | Same GREEN status · confirmed 377 venues · confirmed 2-behind baseline | ✅ Stable freeze |

**Code state July 16:**
- `app.jsx`: 13,506+ lines · cache `20260714a` (2 days, auto-bumps on next code change)
- **377 venues** (133 ski / 244 beach) — confirmed via DevOps eval July 15
- `.venue-baseline`: 375 — **2 behind actual (P2 — fixed this run, see Decision 2)**
- lateSeason: 14 · poolPrimary: 25 · GEAR_ITEMS: 0 · Sentry: active · Plausible: scoped ✅
- Staged venue queue: ~14 venues awaiting Jack photo approval (HOLD — no new additions until photo pass runs)

**3-day code freeze confirmed healthy.** No regressions. Product is stable.

---

## Bug Triage — July 16

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | Day 16. 2+ weeks of user behavior sitting idle. Every product call — second post timing, venue gaps, flow drops — is a hypothesis with no data. Jack: 15 minutes at plausible.io right now. |
| **Retention email unsent** | **P0** | 10 days overdue. Day-7–10 window is closed; Day-16 email still reaches the cohort with ~30% lower open rate. Sending late beats not sending. See Decision 1. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | Day 37. `server/sql/delete-account.sql` → Supabase SQL Editor. 2 minutes. Jack only. Blocks Guideline 5.1.1(v). |
| **`.venue-baseline` 2 behind actual** | P2 | 375 in file, 377 in catalog. Guard floor is stale — a 2-venue silent deletion would pass undetected. **Fixed this run.** |
| **VPS health not verified since July 10** | P2 | 6 days. Before any distribution push: `curl https://peakly-api.duckdns.org/health`. If `wx_cache_size == 0`, cache is cold — do NOT post to Reddit until it warms. |
| **SRI/CSP missing** | P2 | Open #10 — persistent. DEFER post-launch. 20-minute fix from a networked terminal. Not a launch gate. |
| **14 staged venues pending photo approval** | P2 | HOLD. Queue capped at 14 per PM v88 Decision 3. No new additions until Jack's photo verify pass. |

**Permanently closed (stop re-flagging):** Peakly Pro price · Sentry DSN · VPS "Day X" outage · cache buster logic · DEAL_WEIGHT · GEAR_ITEMS · duplicate venues · cross-category photos · Plausible domain (code) · surf-legacy tags · placeholder tags · lateSeason regression · Engelberg lateSeason · GIG/AP_CONTINENT · lateSeason count (14)

---

## Known Blockers

| Blocker | What It Unlocks | Days Overdue |
|---------|-----------------|-------------|
| **Jack: read Plausible data** | All product decisions — second post, next sprint, retention health | Day 16 |
| **Jack: send retention email** | User research + re-engagement before cohort goes cold | 10 days overdue |
| **Jack: photo approval (14 staged venues)** | Catalog growth resumes; Content agent has real work again | Ongoing |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) compliance | Day 37 |
| **Jack: VPS health check** | Confidence weather data is warm before distribution | 6 days since last check |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 16

### Decision 1: Send the retention email TODAY. This is the last call.

Day 16. This cohort has had 16 days to forget Peakly exists. The Day-7–10 window is gone. A Day-16 email still reaches the same list — open rate is lower but it's the only option left.

From Jack, personal, 3 sentences:

> "Hey — I built Peakly and you visited a couple weeks ago. Conditions for this weekend (July 18–21) just updated — Southern Hemisphere ski looks strong right now, and the Mediterranean is peak. One question: what would make you check it every week?"

That last question is the only one that matters for the path to 100K. The replies are user research you can't buy.

**SEND TODAY. This is the fourth report calling this out. After today, cut the cohort as lost and move on.**

### Decision 2: SHIP `.venue-baseline` fix → 377.

`.venue-baseline` reads 375; actual catalog is 377. The invariant guard's floor is wrong by 2 — a silent deletion of 2 venues would pass undetected.

**Fixed this run** via `echo "377" > scripts/.venue-baseline` and committed with this report.

### Decision 3: No second distribution post until Plausible is read.

Day 16, zero Plausible data consumed. We have no visibility into:
- Post-launch user count
- Explore → detail → book conversion
- Which venues are driving clicks
- Mobile vs desktop split
- Whether the Fri–Mon scoring logic is resonating

A second Reddit/HN post without this data is spray-and-pray. If the onboarding flow has a drop-off we haven't caught, we're paying to amplify a broken funnel.

**DEFER any second distribution post until after Plausible is read.** This is a 15-minute unblock.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **SRI/CSP (Open #10)** | Security hygiene, not user-facing. DEFER post-launch. |
| **New venue additions** | HOLD pending photo approval — not rejected, just blocked. |
| **Hotels in deal score** | Deferred to v2. No user demand signal yet. |
| **Peakly Pro** | Cut April 16. Do not re-open without Plausible showing ≥500 MAU. |
| **APNS push alerts** | Known-skipped. Gated on `isNativePlatform()`. Re-flag only when App Store submission is actually queued. |
| **VPS Redis persistence** | P2 enhancement. DEFER post-100 MAU — right improvement, wrong time. |

---

## This Week's Top 3 Priorities Only

1. **Jack: Read Plausible. Today.** (15 min) — unlocks every product decision
2. **Jack: Send retention email.** (10 min) — last window before this cohort is gone
3. **Jack: Photo approval pass on 14 staged venues.** (15 min) — unblocks catalog growth and resets Content agent to useful work

Everything else is maintenance or deferred.

---

## Success Criteria

**What 8K users (not 5K) requires:**

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Distribution | One Reddit post | Reddit + retention email re-engagement + share-a-list viral loop |
| Retention | Day-1 visits only | >20% Week-2 return rate |
| Catalog | 377 venues (current) | 391+ venues (14 staged → photo approval) |
| Revenue | $7.58/1K MAU | +GYG after LLC → $8.78/1K MAU |

The 8K path requires retention email AND a second post AND the share-a-list loop firing. None of those can happen intelligently until Plausible is read. The 90-day 5K–8K projection is speculative in both directions without Day-16 data.

**The single most important unknown:** Day-1 → Day-7 retention rate. That number tells us whether Peakly compounds or flatlines. Plausible will tell us in 15 minutes.

---

## One Product Risk Nobody Is Talking About

**The staged venue queue is theater.**

The Content agent adds 5 venues per run to the "staged" queue. The queue is 14+ entries. With no photo-approval pass from Jack, those venues never ship. But reports keep counting the queue as "progress" — Content outputs look productive while the actual catalog is frozen at 377.

The catalog has not changed since July 14. If Jack's photo-approval pass doesn't happen this week, the right call is to **pause the Content agent's venue-staging work entirely** until the queue clears. Burning agent-runs to grow a queue nobody is draining is pure overhead.

One photo-approval session (15 min, check 14 Unsplash URLs in content-report.md) clears the queue, ships 14 real improvements, and resets the Content agent to useful output.

---

*Written 2026-07-16 · v89 · Day 16 post-launch*
