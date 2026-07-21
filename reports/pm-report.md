# Peakly PM Report — 2026-07-21 (v95)

> Supersedes v94 (July 20). **Status: GREEN on code, YELLOW on distribution readiness.** Day 21 post-launch. Code freeze day 7 — no app.jsx changes today. DevOps and Content reports filed. Bracket-walker false-positive class **permanently closed** by DevOps (root cause: `{lat:...}` syntax in comment lines 4735/4746). Venue count: **374** (132 ski / 242 beach), baseline 374 — confirmed match. Three blockers still standing between now and second distribution post: pre-compile CI (P1), photo approval queue (10 staged), and ski photo dedup regression (P2).

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **374 venues (132 ski / 242 beach) as of July 20.** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **`20260720a` — auto-bumps on code changes. Age alone ≠ stale.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14. Use `grep -c "lateSeason.*true" app.jsx`.** Stop. |
| "lateSeason regression" | **RESOLVED July 11. Engelberg added July 14.** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES.** Stop. |
| "AP_CONTINENT gaps (any count)" | **PERMANENTLY CLOSED. 280 entries, all 146 venue `ap` codes present.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **FALSE POSITIVE. Root cause: `{lat:...}` in comment lines 4735/4746. Unique-ID count = 374. Baseline 374. PERMANENTLY CLOSED.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only — incompatible with no-bundler arch. Stay 7.29.7.** Stop. |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20 (commit `e2f02cd`). 375 → 374.** Stop. |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21 by DevOps. Comment lines 4735/4746 contain `{lat:...}` syntax that fools depth-counter. Use category grep. Stop permanently.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1 (July 20 deadline missed). Stop flagging.** |

---

## Shipped Since v94 (2026-07-20 → 2026-07-21)

| Commit | What | Verdict |
|--------|------|---------|
| `7d84435` — DevOps July 21 | GREEN · bracket-walker root cause finally closed · 374/374 match · SRI P2 only | ✅ Good hygiene |
| `ffd5057` — Content July 21 | Photo dedup regression (5 ski photos 3×) confirmed P2 · 5 new SH venues queued · 10-venue queue total | ✅ Useful signal |

**Code state July 21 (evening):**
- `app.jsx`: 13,499 lines · cache `20260720a` · braces 5,571/5,571 ✅
- **374 venues** (132 ski / 242 beach) — authoritative category grep count
- `.venue-baseline`: **374** — confirmed correct ✅
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: 280 entries, 0 gaps — permanently closed ✅
- Staged queue: **10 venues** (5 carried + 5 new SH ski from Content July 21)
- Photo dedup regression: **5 ski photos at 3× confirmed** (liberty-mountain, roundtop-mountain, whitetail-resort, jack-frost, madarao-mountain-s22)

**Seasonal state July 21:** 23 S-hemisphere ski venues in peak, 14 lateSeason glacier resorts active, 186 N-hemisphere beach venues at peak. ~37 ski venues effectively scoreable this weekend. Optimal for SH ski distribution angle.

---

## Bug Triage — July 21

| Bug | Severity | Status |
|-----|----------|--------|
| **Babel mobile parse wall** | **P1** | 3–5s white screen on first mobile load. Assigned to DevOps in v93 (Day 2). No update today. Must ship before second distribution post. |
| **Ski photo dedup regression** | **P2** | 5 ski photos at 3× (target ≤2×). Bundle with Jack's photo approval batch — don't ship standalone. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 42. Jack: `server/sql/delete-account.sql` → Supabase SQL Editor. 2 min. iOS 5.1.1(v). |
| **VPS health verify** | P2 | 12 days since Jack confirmed. `curl https://peakly-api.duckdns.org/health` before distribution push. |
| **Plausible data unread** | P2 | Day 21. Accepted as Jack-only blocker. No daily crisis framing. |
| **10 staged venues** | Hold | Photo approval needed. Whakapapa (NZ peak) + alpe-d-huez (glacier closes late Aug) are time-sensitive. |
| **SRI/CSP (Open #10)** | P2 | DEFER until pre-compile CI ships. |

**Permanently closed:** retention email cohort · jackson-hole ghost dup · bracket-walker overcount (root cause closed) · AP_CONTINENT · cross-category photos · Plausible domain · placeholder tags · DEAL_WEIGHT · GEAR_ITEMS · Pro price discrepancy

---

## Known Blockers

| Blocker | What It Unlocks | Days |
|---------|----------------|------|
| **DevOps: pre-compile CI** | Eliminates mobile white screen before second post | Assigned July 19 (Day 2) |
| **Jack: photo approval (10 staged)** | Whakapapa (NZ hook) · alpe-d-huez (Aug deadline) · catalog growth | Day 7–11 |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 42 |
| **Jack: VPS health check** | Confidence before distribution push | 12 days |
| **Jack: read Plausible** | Distribution angle confirmation | Day 21 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 21

### Decision 1: Pre-compile CI is the gate before second distribution post. Hard deadline July 24.

v93 Decision 1 assigned pre-compile CI to DevOps. Day 2 with no update today. The Babel mobile parse wall (3–5s white screen on first mobile load) is the single highest-impact conversion killer at second-post traffic volume.

A Reddit post sends 500–2,000 mobile visitors in 90 minutes. If 40% bounce in 3 seconds because Babel hasn't finished transpiling, the acquisition event is wasted. This is documented behavior of Babel Standalone on low-end Android.

**Hard deadline: pre-compile CI ships by July 24 or we build around it (pre-render static HTML fallback).** DevOps: 45 minutes of work. It's Day 2. Get it done.

### Decision 2: Photo approval is time-sensitive. Jack must act this week.

The 10-venue staged queue contains two hard deadlines:
- **Whakapapa / Ruapehu (NZ)** — NZ ski peak runs July–September. This is the NZ hook for the second post. Missing from catalog = missing from scoring = won't appear in "best ski weekend right now." Window closes in ~6 weeks.
- **Alpe d'Huez glacier** — Summer glacier skiing closes late August. Unique summer-ski hook expires in ~5 weeks.

**Jack: photo approval this week is not optional.** DevOps bundles the ski photo dedup fix when the batch ships.

### Decision 3: Second distribution post targets August 1–7 window.

Northern hemisphere beach is peaking. SH ski is in season. The August 1–7 window is the highest-intent acquisition moment of 2026 for this product. After that, beach fades toward mid-September and SH ski has two months left.

**Target: second post August 1–7.** Prerequisites: pre-compile CI (by July 24) + photo approval (this week) + 15 min Plausible read (this week). All three are under-an-hour tasks. The second post is 10 days away if Jack and DevOps move now.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Any new code changes (no P0 pending)** | Code is sound. Freeze is healthy. Ship nothing before the second post that isn't blocking it. |
| **New venue additions beyond 10 staged** | Queue cap holds at 14. Clear backlog first. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | CUT. Reopen only at 500+ MAU with Plausible signal. |
| **APNS push alerts** | Known-skipped. Gate live. Re-flag only at App Store queue time. |
| **JSON-LD structured data** | Can't evaluate ROI without Plausible baseline. DEFER. |
| **VPS Redis persistence** | Right fix, wrong time. DEFER post-100 MAU. |
| **Venue deep links** | After second distribution post. DEFER. |
| **SRI/CSP (Open #10)** | After pre-compile CI. DEFER. |

---

## This Week's Top 3 Priorities Only

1. **DevOps: Ship pre-compile CI.** (45 min) — P1. Gate before second distribution post. Hard deadline July 24.
2. **Jack: Photo-approve 10 staged venues.** (15 min) — Time-sensitive. Whakapapa + alpe-d-huez have hard seasonal deadlines.
3. **Jack: Read Plausible.** (15 min) — Confirms the second post angle. Required before posting.

Everything else is deferred or closed.

---

## Success Criteria

| Metric | 5K path | 8K path | Day 21 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ⚠️ Day 21 (P2, accepted) |
| Retention email | Day 7–10 | Day 7 | ❌ CLOSED — cohort declared lost |
| Second distribution | Week 2 | Week 2 | 🔴 Target Aug 1–7 · blocked on CI + photos |
| Catalog — NZ venues | Jul–Aug | Jul | 🔴 Whakapapa missing; blocked on approval |
| Pre-compile CI | Before 2nd post | Before 2nd post | 🔴 DevOps assigned; deadline July 24 |
| Revenue streams | 3 live | +LLC affiliates | ⚠️ 3 live ($7.58/1K MAU) |

**What separates 5K from 8K:** a second distribution post landing on a mobile-ready app with NZ ski in the catalog, confirmed by Plausible data. That's 3 tasks — CI, photos, Plausible — each under an hour. The 8K path is 10 days away if the work happens now.

---

## One Product Risk Nobody Is Talking About

**The distribution window is narrowing while we optimize the wrong variables.**

Day 21 post-launch. Beach season peaks in August and fades mid-September. SH ski season runs July–September. Both windows close in 8 weeks.

The code is green. The catalog is 374 venues. The scoring is honest. The install flow works. These are solved. The unsolved variable is timing.

A second Reddit post on August 1 lands during peak intent for both beach and ski. A post on September 1 catches the tail. A post on October 1 is off-season for beach and past SH ski peak.

The risk: August becomes another month of P2 bugs and agent hygiene while the acquisition window closes unnoticed. Then we launch into September to an audience whose moment has passed.

**Ship pre-compile CI. Get photo approval. Post in August.**

---

*Written 2026-07-21 · v95 · Day 21 post-launch · 374 venues · cache 20260720a · code freeze day 7*
