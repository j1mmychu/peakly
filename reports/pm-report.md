# Peakly PM Report — 2026-07-19 (v93)

> Supersedes v92 (July 18). **Status: GREEN on code, RED on distribution.** Day 19 post-launch. Code freeze day 5 — healthy. Two new reports today (DevOps + Content July 19). AP_CONTINENT false positive permanently closed — both agents confirmed correct parsing (280 entries, all 146 venue `ap` codes present). New P1: Babel client-side parse wall documented by DevOps — 3–5s white screen on mobile before Reddit spike is a distribution risk. Plausible downgraded to P2 per v92 Decision 1 (was P0 for 8+ reports; nagging not working). Retention email: last call per v92 Decision 2 (July 20 deadline).

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
| "lateSeason: any count other than 14" | **14. Engelberg added July 14. Use `grep -c "lateSeason.*true" app.jsx` (covers both formats).** Stop. |
| "lateSeason regression" | **RESOLVED July 11. Engelberg added July 14.** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES. 0 dup IDs.** Stop. |
| "AP_CONTINENT gaps (any count)" | **PERMANENTLY CLOSED as false positive. AP_CONTINENT has 280 entries (compact + JSON-quoted). All 146 venue `ap` codes present. Correct parse: match both `KEY:"value"` AND `"KEY":"value"` formats. Lazy-regex that stops at first `}` sees only 68 entries and gives spurious gaps. Confirmed July 17, 18, 19 by Content + DevOps. Stop forever.** |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary. Only appears in a comment.** Stop. |
| "venue-baseline drift / 377 venues" | **FALSE POSITIVE. Bracket-walker overcounts. Unique-ID count = 375. Baseline (375) CORRECT.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |

---

## Shipped Since v92 (2026-07-18 → 2026-07-19)

| Commit | What | Verdict |
|--------|------|---------|
| `c5442b2` — DevOps July 19 | GREEN audit · AP_CONTINENT permanently closed (280 entries, correct parsing) · Babel parse-time scaling wall documented (new finding) | ✅ No regressions, 1 new actionable finding |
| `3d37ece` — Content July 19 | Score 87→93 · AP_CONTINENT confirmed closed · Whakapapa gap flagged (P2 seasonal) · porter-heights-nz Day 9 in queue | ✅ Housekeeping + seasonal flag |

**Code state July 19 (evening):**
- `app.jsx`: 13,507 lines · cache `20260714a` (day 5 freeze) · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach) — authoritative unique-ID count, baseline 375 correct
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: **280 entries, 0 gaps — permanently closed**
- Staged queue: 11 venues, Day 9, cap 14 (porter-heights-nz entering 2nd week during NZ peak)
- Data health score: **93/100**

**Code freeze day 5.** Nothing broken. No structural issues.

---

## Bug Triage — July 19

| Bug | Severity | Status |
|-----|----------|--------|
| **Babel mobile parse wall** | **P1** | NEW this run. 13,507 lines of JSX runtime-parsed by Babel Standalone on cold load: 3–5s white screen on mid-range Android. Before a Reddit/HN spike, this is a bounce machine for the highest-propensity-to-bounce segment. See Decision 1. |
| **Retention email — July 20 hard deadline** | **P0 (last call)** | v92 Decision 2: "if not sent by July 20, close permanently." Tomorrow. From Jack, personal, 3 sentences: *"Hey — I built Peakly and you visited a couple weeks ago. Conditions for this weekend just updated — Southern Hemisphere ski looks strong right now. What would make you check it every week?"* |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 41. `server/sql/delete-account.sql` → Supabase SQL Editor. 2 min. Jack only. |
| **VPS health verify** | P2 | 10 days since Jack confirmed. Before distribution push: `curl https://peakly-api.duckdns.org/health`. |
| **Plausible data unread** | ~~P0~~ **P2** | **Downgraded per v92 Decision 1.** Day 19 unread. Cost of unread cohort data accepted. Stays on blockers table; exits daily P0 crisis framing. Agent team stops nagging. See Decision 2. |
| **Whakapapa coverage gap** | P2 seasonal | Top NZ resort by skier-visits not in catalog. Live peak season (Jul–Aug). Queue cap (11 staged) is the gate. Jack photo approval unblocks. |
| **SRI/CSP (Open #10)** | P2 | Persistent. DEFER (note: partially incompatible with Babel Standalone until pre-compile CI lands). |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate venues · cross-category photos · Plausible domain · surf-legacy tags · placeholder tags · lateSeason regression · AP_CONTINENT gaps (all iterations) · poolPrimary count · venue-baseline/bracket-walker drift

---

## Known Blockers

| Blocker | What It Unlocks | Days Waiting |
|---------|----------------|------|
| **Jack: send retention email** | Re-engagement cohort | **July 20 deadline — final** |
| **Jack: photo approval (11 staged venues)** | Catalog growth, Whakapapa, NZ peak season | Day 9 |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 41 |
| **Jack: VPS health check** | Confidence before distribution push | 10 days |
| **Jack: read Plausible** | Distribution decisions (downgraded to P2) | Day 19 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 19

### Decision 1: Babel mobile parse wall is P1 before the second distribution post. Evaluate the pre-compile CI fix.

DevOps July 19 documents this for the first time: Babel Standalone downloads ~400KB (gzip) then runtime-parses 676KB of JSX on every cold load. On a 2023 mid-range Android: **3–5 second white screen**. On M2 MacBook: ~200ms. The day a Reddit/HN post drops, the majority of new visitors arrive on mobile and will see the blank screen. This is a meaningful bounce driver.

The proposed fix (DevOps July 19): GitHub Actions pre-compile step. Add `.github/workflows/compile.yml` to run `@babel/core` on push to `app.jsx`, output `dist/app.js`, and have `index.html` serve the compiled file in production. Dev workflow unchanged — still edit `app.jsx` directly; the hook commits the source, CI compiles it.

**Trade-off:** This technically adds a build step (GitHub Actions, not local). `index.html` would need a switch between dev (Babel CDN + app.jsx) and prod (compiled app.js). The "no build step" CLAUDE.md rule was written for the local dev workflow, not CI/CD. This is consistent with the spirit of the rule.

**Decision: SHIP the pre-compile CI before the second distribution post.** DevOps: build the GitHub Actions workflow and test it on a staging branch. If it compiles clean and doesn't break any of the 4 CDN script dependencies, merge before the next Reddit/HN post. Do NOT ship this without first confirming the compiled output renders identically. Time estimate: 45 minutes.

**If Plausible later shows mobile bounce rate is acceptable (<30%), treat this as optional. But we can't wait to find out — the second post comes first.**

### Decision 2: Plausible downgraded to P2. Per v92 Decision 1. Final.

Eight consecutive PM reports called Plausible unread a P0. Nagging has not worked. v92 Decision 1 set the condition: "if Plausible is not read before the next PM report, downgrade to P2."

**Effective immediately: Plausible is P2.** It stays in the blockers table because it's genuinely important. But the agent team stops treating it as a daily crisis. Jack will read it when Jack is ready. The agent team cannot fix this; continuing to escalate it is noise that dilutes the signal on real technical issues.

What Plausible unlocks (when Jack reads it): second distribution post framing, top-exit page identification, onboarding funnel data, mobile/desktop split. None of these expire — the data is still there. The launch cohort's behavior is in the aggregate; the only thing that expired was the Day-1 cohort's re-engagement window (retention email).

### Decision 3: NZ peak season photo approval is now a time-sensitive product call.

porter-heights-nz has been in the staged queue for 9 days. New Zealand's peak ski season runs July–August — 6 weeks. The product has 3 NZ venues (Cardrona, Mt Hutt, plus one in staging). Whakapapa (largest NZ resort by skier-visits) isn't even in queue yet — the staged cap must clear first.

**Decision: SHIP all NZ ski venues before August 1.** This is a rare calendar constraint. This means Jack approves staged photos this week, the agent team ships the 2 NZ staged venues (porter-heights-nz + one other) within 24h of approval, and Whakapapa enters the queue immediately after. Missing the July–August NZ window means waiting until 2027.

The Southern Hemisphere ski angle is the best hook for a second Reddit post (unique, in-season, global). Whakapapa missing the catalog when the post drops would be a content gap at exactly the wrong moment.

---

## This Week's Top 3 Priorities Only

1. **Jack: Send retention email.** (5 min) — July 20 hard deadline. After that, cohort is permanently closed.
2. **Jack: Photo-approve 11 staged venues.** (15 min) — NZ peak season, Whakapapa gap, S-hemi second-post angle all depend on this.
3. **DevOps: Build pre-compile CI.** (45 min) — P1 before second distribution post. Ship to a staging branch for review.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **SRI/CSP (Open #10)** | Depends on pre-compile CI landing first. DEFER until that ships. |
| **New venue additions beyond 11 staged** | Queue cap 14 holds. No new venues until Jack clears the staged backlog. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | Cut. Re-open only if Plausible shows ≥500 MAU. |
| **APNS push alerts** | Known-skipped. Gate is live. |
| **JSON-LD structured data** | SEO impact unverifiable without traffic baseline. DEFER. |
| **Static h1 SEO fallback** | Same. DEFER. |
| **Venue deep links** | Build after second distribution post. DEFER. |
| **VPS Redis persistence** | Right fix, wrong time. DEFER post-100 MAU. |

---

## Success Criteria

| Metric | 5K path | 8K path | Day 19 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ⚠️ Day 19 (P2 — accepted) |
| Retention email | Day 7–10 | Day 7 | 🔴 July 20 deadline (final) |
| Second distribution | Week 2 | Week 2 | 🔴 Blocked on Plausible + pre-compile CI |
| Catalog | 375+ | 391+ | ⚠️ 375 live, 11 staged (NZ peak urgency) |
| Pre-compile CI | — | — | 🔴 NEW gate before second post |
| Revenue streams | 3 live | +LLC affiliates | ⚠️ 3 live |

**Day 19 update:** Babel mobile parse wall is the new critical-path item before the second post. Code freeze otherwise healthy. NZ seasonal window creates urgency on photo approval.

---

## One Product Risk Nobody Is Talking About

**We're about to post to Reddit with a 3–5 second white screen on mobile.**

The mobile bounce rate for a 3-second white screen is roughly 50–60% (industry data). Reddit traffic skews mobile. If the second post brings 1,000 visitors and half of them bounce before the first card renders, we convert 500 users instead of 1,000 — and the "Peakly is a hot app" narrative doesn't build.

The pre-compile CI fix is 45 minutes of DevOps work. It eliminates the white screen entirely for production users while keeping the dev workflow identical. The second distribution post is the most important marketing event left in 2026 for Peakly. Shipping it with a 3–5 second blank screen would be a self-inflicted wound.

This is fixable. Ship it before the post.

---

*Written 2026-07-19 · v93 · Day 19 post-launch*
