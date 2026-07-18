# Peakly PM Report — 2026-07-18 (v92)

> Supersedes v91 (July 17). **Status: GREEN on code, RED on distribution.** Day 18 post-launch. Code freeze day 4 — healthy. One new DevOps + Content report landed today (no regressions, AP_CONTINENT gap from v91 confirmed closed as false positive). Plausible unread Day 18. Retention email 12 days overdue. v91 called this a closing window. v92 closes it.

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
| "lateSeason: 6 / 13 venues" | **14. Engelberg added July 14 (`747c35a`). Stop.** |
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
| "AP_CONTINENT gaps (7 venues)" | **FALSE POSITIVE — confirmed closed by Content July 18. All codes present at app.jsx:401–435.** Stop. |

---

## Shipped Since v91 (2026-07-17 → 2026-07-18)

| Commit | What | Verdict |
|--------|------|---------|
| `3a41f26` — DevOps July 17 | GREEN audit · AP_CONTINENT gap flagged (since disproved) · SRI/CSP P2 persistent | ✅ No regressions |
| `d8d7207` — Content July 17 | AP_CONTINENT gap closed (false positive) · tag-depth P3 new · 5 staged venues noted | ✅ Housekeeping |
| `141e680` — PM v91 July 17 | Day 17 report: retention email deadline, Plausible final call | ✅ Report only |
| `a748d0b` — DevOps July 18 | GREEN · AP_CONTINENT false positive confirmed · 375 venues · cache 20260714a stable day 4 | ✅ No regressions |
| `94f986f` — Content July 18 | 375 venues stable · 11 staged pending Jack · S-hemi ski window compounding | ✅ Housekeeping |

**Code state July 18 (evening):**
- `app.jsx`: 13,507 lines · cache `20260714a` (4 days stable, no code changes) · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach) — authoritative unique-ID count
- `.venue-baseline`: **375 — CORRECT**
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: all codes confirmed present — the v91 "7 venue gap" was a false positive
- Staged queue: ~11 venues awaiting Jack photo approval (HOLD)

**Code freeze day 4.** Nothing broken. No agent action needed on code.

---

## Bug Triage — July 18

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | **Day 18.** Launch cohort data expires in value daily. This is the last report that will call it a "window." See Decision 1. |
| **Retention email unsent** | **P0** | **12 days overdue.** The Day-7–10 window has closed. Sending at Day 18 still reaches the list — but this report is the last to call it actionable. See Decision 2. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | `server/sql/delete-account.sql` → Supabase SQL Editor. 2 min. Jack only. iOS 5.1.1(v). |
| **VPS health verify** | P2 | 8 days since Jack confirmed. Before any distribution push: `curl https://peakly-api.duckdns.org/health`. |
| **11 staged venues** | Hold | Photo approval needed. Queue capped at 14. No additions. |
| **SRI/CSP (Open #10)** | P3 | DEFER. Not a gate. |
| **AP_CONTINENT 7-venue gap** | ✅ CLOSED | False positive. All codes present at app.jsx:401–435. Added to stop-reporting table. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate venues · cross-category photos · Plausible domain · surf-legacy tags · placeholder tags · lateSeason regression · GIG/AP_CONTINENT gaps · poolPrimary count · venue-baseline/bracket-walker drift · AP_CONTINENT July 17/18 false positive

---

## Known Blockers

| Blocker | What It Unlocks | Days Pending |
|---------|----------------|------|
| **Jack: read Plausible** | All product decisions | **Day 18 — critical** |
| **Jack: send retention email** | Re-engagement + user research | **12 days overdue** |
| **Jack: photo approval (11 staged venues)** | Catalog growth resumes | Ongoing |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | ~5 weeks |
| **Jack: VPS health check** | Confidence before distribution push | 8 days |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 18

### Decision 1: Plausible — read it or stop calling it a P0.

Seven PM reports have called Plausible unread a P0. At Day 18, this is the last report to frame it as urgent. The launch-cohort behavior data (Day 1–7 visitors) is still in Plausible now. By Day 25, new user traffic will have diluted the signal enough that the cohort is unrecoverable.

**If Plausible is not read before the next PM report: downgrade to P2 and remove it from the top-3 priority list.** It will remain on the blockers table, but we stop treating it as a daily crisis. The cost of the cohort data being unread will be accepted and folded into "operating blind."

**If read: update CLAUDE.md with the headline numbers (DAU, bounce rate, top clicked venues, mobile/desktop split) and that unlocks the second distribution post.**

### Decision 2: Retention email — send or formally cut the cohort.

Twelve days overdue. The Day-7–10 re-engagement window is gone. Sending at Day 18 still reaches the list with non-zero open rate (estimate: 15–20% vs 35–40% at Day 7). The email draft from v90 is still valid.

**Decision: if not sent by July 20, close this item permanently and accept that the launch cohort is gone.** It moves to known-skipped. This is not a threat — it's an honest accounting of diminishing returns. A Day-25 cold email is sender-reputation risk, not a product win.

### Decision 3: S-hemisphere ski window is now — it won't wait.

Content's July 18 report flags that the Southern Hemisphere ski window (Cardrona, Mt Hutt, Falls Creek, Catedral, Las Leñas, etc.) is in-season now and compounding weekly. These 14 venues are scoring well. This is a product moment: a "Best Southern Hemisphere Ski Weekends" framing could anchor a second distribution post.

**SHIP: draft the second post framing around the S-hemi window.** Specific ski conditions beat generic "we added new destinations." Conditional on Decision 1 (Plausible read) — we need the first post's traffic data before running a second.

**If Plausible is read before July 20: agent team drafts the second post. If not: defer the second post indefinitely.**

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **SRI/CSP (Open #10)** | Security hygiene, not user-facing. DEFER post-growth. |
| **New venue additions** | HOLD pending photo approval. Queue capped at 14. |
| **Hotels in deal score** | No demand signal. v2 only. |
| **Peakly Pro revival** | CUT. Re-open only if Plausible shows ≥500 MAU. |
| **APNS push alerts** | Known-skipped. Gate is live. Re-flag only at App Store queue time. |
| **VPS Redis persistence** | Right fix, wrong time. DEFER post-100 MAU. |
| **JSON-LD structured data** | Unverifiable ROI without traffic data. DEFER until Plausible is read. |
| **Static h1 fallback** | Same. DEFER. |

---

## This Week's Top 3 Priorities Only

1. **Jack: Read Plausible** (15 min) — launches every other decision
2. **Jack: Send retention email** (5 min) — last call before cohort is cut
3. **Jack: Photo-approve 11 staged venues** (15 min) — unblocks catalog + gives second post a hook

---

## Success Criteria

| Metric | 5K path | 8K path | Day 18 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ❌ Day 18 unread |
| Retention email | Day 7–10 | Day 7 | ❌ Day 18 unsent |
| Second distribution | Week 2 | Week 2 | ❌ Blocked on Plausible |
| Catalog | 375+ | 391+ | ⚠️ 375 (+11 staged) |
| Revenue | 3 live streams | +LLC affiliates | ⚠️ 3 live |

The 8K path requires the second post to land before the S-hemi ski window closes (roughly October). That's 10 weeks. The window is still open. But a second post without Plausible data is a shot in the dark, and the first post was already launched without reading the data afterward. We can't afford to repeat that.

**Single most important unknown:** Day-1→Day-7 retention rate. Plausible answers this in 15 minutes.

---

## One Product Risk Nobody Is Talking About

**Southern Hemisphere ski season peaks in August. If the second post doesn't land by August 10, the S-hemi angle is gone for 2026.**

The product has 14 S-hemisphere ski venues scoring well right now: New Zealand (Cardrona, Mt Hutt), Australia (Falls Creek, Buller, Hotham, Charlotte Pass), Chile (Nevados de Chillán, La Parva, El Colorado, Corralco), Argentina (Cerro Catedral, Las Leñas, Chapelco, Caviahue). These are real, in-season scores. NZ and AUS are at peak right now. This is a genuine seasonal hook that no competing product is covering.

The window: ~6 weeks. The unlock: Plausible read (15 min) + second post draft (30 min). Total: 45 minutes of Jack's time.

The risk: another 6 weeks of code-freeze-healthy / distribution-zero, and the S-hemi window closes unused. At that point the next seasonal hook is Northern Hemisphere ski in November — 4 months away.

---

*Written 2026-07-18 · v92 · Day 18 post-launch*
