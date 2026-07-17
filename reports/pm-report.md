# Peakly PM Report — 2026-07-17 (v91)

> Supersedes v90 (July 16). **Status: GREEN on code, RED on distribution.** Day 17 post-launch. Code freeze day 3 — healthy. No commits since July 14. Zero new regressions. Retention email now 11 days overdue. Plausible unread Day 17. The product is fine; the distribution gap is widening.

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
| "lateSeason: 6 / 13 venues" | **14. Engelberg added July 14 (`747c35a`). Verified today: `grep -c "lateSeason.*true" = 14`.** Stop. |
| "lateSeason regression" | **RESOLVED July 11. Engelberg added July 14.** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES. 0 dup IDs.** Stop. |
| "GIG / KUL / SNA / MCT / TFS / CHQ missing from AP_CONTINENT" | **FALSE. All confirmed present at `app.jsx:401–435`.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary. Only appears in a comment.** Stop. |
| "venue-baseline drift / 377 venues" | **FALSE POSITIVE. Bracket-walker overcounts `{` in CSS strings. Unique-ID count = 375. Baseline (375) CORRECT.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |

---

## Shipped Since v90 (2026-07-16 → 2026-07-17)

**Nothing.** Code freeze day 3. Zero commits today.

**Code state July 17:**
- `app.jsx`: 13,507 lines · cache `20260714a` · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach) — unique-ID count, verified
- `.venue-baseline`: **375 — CORRECT**
- lateSeason: **14** (grep-confirmed today: `grep -c "lateSeason.*true" = 14`) · poolPrimary: 0 · GEAR_ITEMS: 0 ✅

---

## Bug Triage — July 17

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | Day 17. 2+ weeks of real user behavior sitting idle. Every product decision this week is a guess. Jack: plausible.io → Goals → Events. 15 minutes. |
| **Retention email unsent** | **P0** | 11 days overdue. Day-7 cohort is Day 17 now. Still worth sending — re-engagement window hasn't closed, but it's closing. **Send today or declare it skipped.** |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 38. Paste `server/sql/delete-account.sql` into Supabase SQL Editor. 2 minutes. Blocks iOS App Store 5.1.1(v). Web product unaffected. |
| **VPS health verify** | P2 | 7 days since last confirmed check. Before any distribution push: `curl https://peakly-api.duckdns.org/health`. |
| **11 staged venues** | Hold | Photo approval needed. Queue capped at 14. No additions until Jack clears backlog. |
| **SRI/CSP (Open #10)** | P3 | DEFER post-growth. No active exploit. |

---

## Known Blockers

| Blocker | What It Unlocks | Days Waiting |
|---------|----------------|--------------|
| **Jack: read Plausible** | All product decisions become data-driven | Day 17 |
| **Jack: send retention email** | Re-engagement, early user research | 11 days overdue |
| **Jack: Supabase SQL paste** | iOS App Store compliance (5.1.1(v)) | Day 38 |
| **Jack: photo approval (11 staged)** | Catalog growth resumes | Ongoing |
| **Jack: VPS health check** | Confidence before any distribution push | 7 days |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## This Week's Top 3 Priorities

### 1. SHIP — Retention email (Jack, today)
The Day-7 window is closed but Day-17 is not. A single plain-text email to anyone who signed in or saved a venue is still valuable: (a) re-engagement signal, (b) direct user research ("what would make you open it again?"), (c) early funnel data. Template: "Peakly's been live for 2 weeks. Your saved spots are still there. What would you change?" No design. No template. Send it.

**Decision 1 (FINAL): Send the retention email today or formally declare it skipped.** "Next week" = skipped. Pick one.

### 2. SHIP — Read Plausible (Jack, today)
17 days of real data. We don't know: which venues get opened, whether anyone hits the detail sheet, where they drop off, whether the scoring explainer gets dismissed or read. Without this, every content addition and roadmap decision is a guess.

**Decision 2 (FINAL): Read Plausible before making any product decision this week.** If total sessions <200, the job is acquisition, not optimization — and the priorities below change entirely.

### 3. SHIP — Supabase SQL paste (Jack, 2 min)
Day 38. This is a 2-minute terminal task. It's the only App Store blocker remaining on the client side. Without it, account deletion is cosmetic (shows the graceful fallback) and Apple rejects the iOS build under Guideline 5.1.1(v).

**Decision 3 (FINAL): Paste `server/sql/delete-account.sql` into Supabase SQL Editor this week.** Not next week.

---

## Features REJECTED This Week

| Feature | Verdict | Reasoning |
|---------|---------|-----------|
| New venue additions (11 staged) | HOLD | Queue at 11. Photo approval is the bottleneck, not content ideas. More in = more backlog. |
| JSON-LD structured data | DEFER | SEO gap, but distribution hasn't started. Optimize search indexing the day before the Reddit post, not before. |
| Static h1 SEO fallback | DEFER | Same reasoning. Premature. |
| SRI / CSP hardening | DEFER | Medium complexity, Babel eval risk. Post-1K. |
| Hotels in deal score | CUT (v2) | Formally deferred. Flights + conditions first. |
| APNS setup | DEFER | Gated on iOS native. Re-flag when App Store submission actually queues. |
| VPS weekend pricing redeploy | DEFER | Known-skipped. Still <100 MAU. |

---

## Success Criteria

**90-day projection: 5K–8K users.**

For 8K, not 5K:
1. **Reddit/HN post in next 3 weeks** — at least 50 upvotes. This is the only top-of-funnel that moves the needle at this stage.
2. **Week-2 retention ≥ 15%** — users return the following weekend. The Fri–Mon value prop is the moat. If they don't return, the product isn't landing.
3. **LLC approved + REI/GYG wired by Day 45** — RPM goes from $7.58 → $15+/1K MAU. At 8K MAU that's $120/mo.

The 5K scenario: no distribution push, SEO-only organic. Real, but leaves 100K on a 2+ year timeline.

---

## One Product Risk Nobody Is Talking About

**The user base is too small to learn from.** If total Plausible sessions are <200, a "15% retention" reading is 30 people. That's not signal — it's 3 friends and 27 bots. The risk: Jack misreads sparse early data as validation ("people love it") or invalidation ("nobody's coming back") when the sample is statistically meaningless. Before iterating on anything — onboarding, venue sort, scoring — know the n. If n < 200, the only correct move is acquisition. Reddit/HN/personal network. Everything else is premature optimization of a product that doesn't have enough users to measure yet.

---

*Written 2026-07-17. v91 supersedes v90. Next PM run: 2026-07-18.*
