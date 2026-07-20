# Peakly PM Report — 2026-07-20 (v94)

> Supersedes v93 (July 19). **Status: GREEN on code, RED on distribution.** Day 20 post-launch. Code freeze broken — P1 fix shipped this run: `jackson-hole` ghost duplicate removed (same resort as `jacksonhole`, 44m apart, bypassed ID guard). Venue count 375 → **374** (132 ski / 242 beach). Cache **`20260720a`**. Retention email deadline was today per v92 Decision 2; no evidence it was sent — cohort permanently closed per decision. Three product decisions below.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **374 venues (132 ski / 242 beach) as of July 20.** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs in app.jsx.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7` and `index.html:77`.** Stop. |
| "Cache buster stale" | **`20260720a` as of today. Auto-bumps on code changes.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14. Use `grep -c "lateSeason.*true" app.jsx`.** Stop. |
| "lateSeason regression" | **RESOLVED July 11. Engelberg added July 14.** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES.** Stop. |
| "AP_CONTINENT gaps (any count)" | **PERMANENTLY CLOSED. 280 entries, all 146 venue `ap` codes present. Confirmed July 17–20.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 377 venues" | **FALSE POSITIVE. Baseline now 374 (updated this run).** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only — incompatible with no-bundler arch. Stay 7.29.7.** Stop. |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **FIXED this run. `jackson-hole` removed. 375 → 374 venues.** Stop. |

---

## Shipped Since v93 (2026-07-19 → 2026-07-20)

| Commit | What | Verdict |
|--------|------|---------|
| `2680d1e` — DevOps July 20 | GREEN · day 6 freeze · 375/baseline match · SRI P2 persistent | ✅ No regressions |
| `8ce373d` — Content July 20 | **P1 jackson-hole ghost dup flagged** · ski photo dedup regression P2 · 5 SH venues proposed | ✅ Real finding, actionable |
| **This run** | `jackson-hole` removed (P1 fixed) · cache 20260714a→**20260720a** · baseline 375→**374** · PM v94 | ✅ P1 closed |

**Code state July 20 (evening):**
- `app.jsx` · cache **`20260720a`** · braces 5,571/5,571 ✅
- **374 venues** (132 ski / 242 beach) — `jackson-hole` ghost dup removed ✅
- `.venue-baseline`: **374** — updated this run
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: 280 entries, 0 gaps — permanently closed ✅
- Staged queue: 11 venues awaiting Jack photo approval (day 6–10)
- Ski photo dedup: **regression open** — 4 ski photos at 3× (target ≤2×)

---

## Bug Triage — July 20

| Bug | Severity | Status |
|-----|----------|--------|
| **jackson-hole ghost dup** | ~~P1~~ | ✅ FIXED this run |
| **Babel mobile parse wall** | **P1** | DevOps task from v93 Decision 1. Build pre-compile CI before second distribution post. 45 min. |
| **Ski photo dedup regression** | **P2** | 4 photos at 3× (liberty-mountain, roundtop-mountain, whitetail-resort, jack-frost, madarao-mountain-s22). Ship with next content batch. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 42. Jack: paste `server/sql/delete-account.sql` into Supabase SQL Editor. 2 min. |
| **VPS health verify** | P2 | 11 days since Jack confirmed. `curl https://peakly-api.duckdns.org/health` before any distribution push. |
| **Plausible data unread** | P2 | Day 20. Downgraded per v92 Decision 1. Stays on blockers, no daily crisis framing. |
| **11 staged venues** | Hold | Photo approval. `alpe-d-huez-fr` has August glacier deadline. |
| **SRI/CSP (Open #10)** | P2 | DEFER until pre-compile CI lands. |

---

## Known Blockers

| Blocker | What It Unlocks | Days |
|---------|----------------|------|
| **DevOps: pre-compile CI** | Mobile white screen eliminated before second post | Assigned v93 |
| **Jack: photo approval (11 staged)** | Catalog growth · Whakapapa · alpe-d-huez deadline | Day 6–10 |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 42 |
| **Jack: VPS health check** | Confidence before distribution push | 11 days |
| **Jack: read Plausible** | Distribution decisions (P2, accepted) | Day 20 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 20

### Decision 1: Retention email cohort permanently closed.

Per v92 Decision 2: "if not sent by July 20, close permanently." Today is July 20. No evidence it was sent. The early cohort is declared permanently churned. This agenda item is done — it does not return.

The second Reddit/HN post is now the primary acquisition mechanism. It reaches new users, not the lost cohort.

### Decision 2: Fix ski photo dedup regression in the next content batch.

Content July 20 flagged 4 ski photos at 3× (target ≤2× per June 13 dedup). Happened because batch adds after June 13 didn't check photo collisions. Affected venues are tail-end small-market resorts (PA area, one Japan). Fix: fresh Unsplash photos for liberty-mountain, roundtop-mountain, whitetail-resort, jack-frost, madarao-mountain-s22.

**Bundle with photo approvals when Jack clears staged queue. Don't ship standalone.** Must be resolved before second distribution post — arriving users on the ski tab shouldn't see photo repeats.

### Decision 3: Whakapapa must be in catalog before the second Reddit post. Hard gate.

v93 Decision 3 established NZ peak season as the second post's hook. Whakapapa (largest NZ resort by skier-visits, not yet in catalog) is missing. The staged queue blocks it until Jack approves the 11 pending photos. The window closes by mid-September.

**Jack must clear photo backlog this week.** If Whakapapa is not live when the second post drops, the NZ/SH ski angle is undersold. The alpe-d-huez glacier closes late August — also time-sensitive. This is the highest-leverage Jack action remaining.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **SRI/CSP (Open #10)** | Depends on pre-compile CI. DEFER. |
| **New venue additions beyond 11 staged** | Queue cap holds. Clear backlog first. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | Cut. Reopen only with Plausible ≥500 MAU signal. |
| **APNS push alerts** | Known-skipped. Gate live. |
| **JSON-LD structured data** | SEO ROI unverifiable without traffic baseline. DEFER. |
| **VPS Redis persistence** | Right fix, wrong time. DEFER post-100 MAU. |
| **Venue deep links** | After second distribution post. DEFER. |

---

## This Week's Top 3 Priorities Only

1. **DevOps: Build pre-compile CI.** (45 min) — P1. Eliminates 3–5s mobile white screen before second post.
2. **Jack: Photo-approve 11 staged venues.** (15 min) — Unblocks Whakapapa, NZ hook, alpe-d-huez glacier deadline.
3. **Jack: VPS health check.** (2 min) — `curl https://peakly-api.duckdns.org/health`. Gate before any distribution push.

---

## Success Criteria

| Metric | 5K path | 8K path | Day 20 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ⚠️ Day 20 (P2, accepted) |
| Retention email | Day 7–10 | Day 7 | ❌ CLOSED — cohort declared lost |
| Second distribution | Week 2 | Week 2 | 🔴 Blocked on pre-compile CI + Whakapapa |
| Catalog — NZ venues | Jul–Aug | Jul | 🔴 Whakapapa missing; blocked on photo approval |
| Pre-compile CI | Before 2nd post | Before 2nd post | 🔴 DevOps assigned |
| Revenue streams | 3 live | +LLC affiliates | ⚠️ 3 live |

---

## One Product Risk Nobody Is Talking About

**We're framing the second post around SH ski without knowing which venues drive engagement from the first.**

Plausible has 20 days of click data. We don't know if users actually tap Cardrona or Portillo when they open the ski tab, or if they're mostly NH-summer users browsing beach venues with ski as an afterthought. If the first post's SH ski venues had near-zero taps, the "best ski app for the Southern Hemisphere" hook is landing on a feature nobody used.

The pre-compile CI is still right — mobile bounce is real regardless. But the second post's angle should be data-confirmed, not assumed. 15 minutes on plausible.io could flip the second post from "SH ski" to "beach this weekend in the Med" — or confirm SH ski is working exactly as hoped.

This is a $0 unlock sitting idle at Day 20.

---

*Written 2026-07-20 · v94 · Day 20 post-launch · jackson-hole ghost dup fixed · 374 venues · cache 20260720a*
