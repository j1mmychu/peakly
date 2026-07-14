# Peakly PM Report — 2026-07-14 (v88)

> Supersedes v87 (July 13). **Status: GREEN on code, RED on distribution.** Day 14 post-launch. Week-2 email window closed July 13 — send it today anyway, late beats never. Staged venue queue now at 14 and growing. Engelberg `lateSeason` fix is a 5-minute ship. Plausible still unread at Day 14.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **375 venues (133 ski / 242 beach).** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260713a` — 1 day old, not stale. Next deploy bumps it.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: 25 / 19 venues" | **13. CLAUDE.md corrected July 13.** Full list in Content report. Stop. |
| "lateSeason regression open" | **RESOLVED July 11 (`18b19b5`).** Stop. |
| "2 dup venues pending" | **FIXED July 8.** Stop. |
| "5 placeholder-tag venues" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags. PM v81 Decision 1.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES. 0 dup IDs.** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only, incompatible with no-bundler arch. Stay on 7.29.7.** Stop. |

---

## Shipped Since v87 (2026-07-13 → 2026-07-14)

| Commit | What | Verdict |
|--------|------|---------|
| `fce77da` — DevOps July 14 | Clean audit, no code changes · Week-2 email window closed noted · Supabase SQL Day 35 | ✅ GREEN infrastructure, no surprises |
| `8da5c2f` — Content July 14 | 5 new venues staged (VA Beach, Miyako-jima, Rincón PR, Amed Bali, Tofo Mozambique) · Engelberg lateSeason P2 found · queue cap recommendation | ✅ Data audit current |

**Code state July 14:**
- `app.jsx`: 13,506 lines · cache `20260713a` · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach) — unchanged
- GEAR_ITEMS: 0 · lateSeason: 13 · placeholder tags: 0 · Sentry: active · Plausible: scoped ✅
- **Staged venue queue: ~14 venues awaiting Jack photo approval** (9 from Jul 11–12 + 5 new Jul 14)

---

## Bug Triage — July 14

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | Day 14 post-launch. 2 weeks of behavior data sitting idle. Every product call this week is a hypothesis. Jack: 15 min at plausible.io. |
| **Retention email unsent** | **P0 → P1** | Window closed July 13. Sending today still reaches the cohort — open rate ~30% lower but beats never. See Decision 1. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | Day 35. 2 minutes. Jack only. `server/sql/delete-account.sql` → Supabase SQL Editor. |
| **Engelberg missing `lateSeason: true`** | P2 | New finding (Content July 14). Engelberg runs glacier to 3050m year-round. 1-field add. 5 minutes. SHIP — see Decision 2. |
| **VPS weather cache** | P1 | Last verified by Jack July 10 (4 days ago). `curl https://peakly-api.duckdns.org/health`. If `wx_cache_size == 0`, cache is cold — warn before any distribution push. |
| **14 staged venues awaiting photo verify** | P2 | HOLD until Jack approves. Queue growing faster than verify cadence. See Decision 3 — CAP at 14. |
| **CLAUDE.md lateSeason count** | ✅ CLOSED | Corrected to 13 in PM v87 (July 13). Stop flagging. |
| Redis persistence on VPS | P2 | DEFER post-100 MAU. Real improvement, wrong time. |
| SRI hashes on CDN scripts | P3 | DEFER post-LLC. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" outage framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate-commit pattern · cross-category photos · Plausible domain (code) · surf-legacy tags · cancun-beach dup · bigsky dup · placeholder tags · lateSeason regression (code) · GIG/AP_CONTINENT · lateSeason CLAUDE.md count

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Plausible read** (Jack, plausible.io) | Every product decision: second post, next sprint scope, whether retention is working | Day 14 |
| **Retention email send** (Jack, personal) | First user research + late re-engagement before cohort goes fully cold | Day 8 overdue |
| **Jack: photo approval of 14 staged venues** | Catalog growth — queue capped until pass runs | Ongoing |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 35 |
| VPS health verify | Confidence weather data is hot before distribution push | Day 4 since last Jack check |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 14

### Decision 1: Send the email today. Late beats never.

The optimal Day-7–10 re-engagement window closed July 13. A Day-14 email still reaches the same list with the same value: it drives a return visit, generates user research replies, and is the only way to turn one-time visitors into weekly users before they fully forget the app existed.

The copy doesn't change. From Jack, personal, 3 sentences:

> "Hey — I built Peakly and you visited a couple of weeks ago. Conditions just updated for this weekend (July 17–20) — beach in the Mediterranean looks strong, and Southern Hemisphere ski is at peak winter right now. One question: what would make you check it every week?"

That last line is the only one that matters for 100K downloads. Send it. Every day it stays unsent is permanent signal loss.

**SEND TODAY. Stop deferring.**

### Decision 2: SHIP Engelberg `lateSeason: true`. 5 minutes, zero risk.

Engelberg (Switzerland, airport BRN) runs glacier skiing on Titlis to 3028m year-round — it is textbook `lateSeason`. The flag is already defined. The scoring exception is already wired. This is a 1-field add in app.jsx. Content identified it; DevOps can apply it.

The patch:
```
// In the engelberg venue object, add:
lateSeason: true,
```
Cache stamp needs a bump alongside this: current `20260713a` → `20260714a`.

**SHIP: Engelberg `lateSeason: true` + cache bump this run.**

### Decision 3: CAP the staged venue queue at 14. No new staging until Jack approves.

Content has been staging venues at 4–5/day. As of today, 14 are awaiting Jack's photo approval. The growth rate will exceed the approval rate indefinitely if there's no policy.

The risk: agents keep staging, the queue grows to 30+, Content reports "X new venues staged" as progress, but the actual catalog stays at 375 because no one can verify photos. The false-work loop makes reports feel productive while the real product stays unchanged.

**DECISION: Content agent stages NO new venues once the queue exceeds 14. The unblock is Jack running a photo-verify pass.** Recommended: 15 minutes, open each Unsplash URL, check that the photo matches the venue category. If Jack approves this week, 14 venues ship. If not, the queue holds.

---

## This Week's Top 3 Priorities Only

**1. Jack: Read Plausible. 15 minutes. Everything else waits.**

14 days of real user data is sitting in the dashboard. Beach vs. ski filter split. Bounce rate. Top referrer. Time on page. These numbers determine whether Week 3 is a feature sprint, a distribution sprint, or both. Without them, we're optimizing blind.

**2. Ship Engelberg + send the email. Both are <30 minutes total.**

Engelberg lateSeason is a 5-minute code fix with zero risk — agents handle it. The email is 3 sentences Jack sends once. These are the only two actions that move the needle today without reading Plausible first.

**3. Jack: photo-verify pass on 14 staged venues. Opens the catalog pipeline.**

15 minutes. Open each Unsplash URL, confirm it matches the venue type. Approve → venues ship in next DevOps run. Reject → venue drops from queue. Until this pass happens, the staging pipeline is bottlenecked and agents are spinning on report noise instead of real catalog improvement.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| Redis VPS persistence | **DEFER post-100 MAU.** Real value; wrong timing. Zero traffic makes this moot. |
| Hotel integrations | **CUT for v1.** Scope creep. |
| JSON-LD / structured data | **DEFER.** SEO compounds on traffic you don't have yet. Post-100 DAU. |
| Venue deep links | **DEFER.** Post-100 detail-sheet views/day per venue in Plausible. |
| Photo dedup ≤2× | **DEFER.** Needs ~100 new verified Unsplash IDs. No API key. |
| New venue categories (climbing, surf, hiking) | **CUT.** Ski + beach is the moat. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** P3. |
| Automated email digest | **DEFER.** Manual founder email first. |
| Second Reddit post | **DEFER.** Requires Plausible read + specific hook (glacier summer ski? Mediterranean beach heat?). Jack's call, not agents'. |
| LatAm beach expansion (beyond Rincón, Pipa) | **DEFER.** Queue at cap; verify existing staged venues first. |

---

## Success Criteria — 8K vs 5K

**Week-2 retention data is now available in Plausible but unread.** The observation window is closed — the data is frozen, not decaying. Jack reads it once and knows.

**Week-3 call tree (by July 17):**
1. Uniques < 1K → second Reddit post required this week. Different subreddit, different angle. Glacier summer skiing or "this weekend in Europe" hook.
2. Uniques 1–2K → hold second post; email is the re-engagement lever. Week-4 return rate determines second post timing.
3. Uniques > 2K → organic retention data is the signal. Email replies > second post. Feature work starts making sense.

**For 8K not 5K:** A second distribution moment happens before August. Feature work compounds on users who exist. At <2K launch uniques, there's no base to compound.

---

## One Product Risk Nobody Is Talking About

**The staged venue queue is a false-work trap.**

The pipeline looks productive: DevOps is GREEN, Content stages 5 venues/day, the queue grows. Agents report progress. But the catalog is stuck at 375 because no agent can verify photos and Jack hasn't run the approval pass.

The risk compounds: by July 21, the queue will hit 35+ venues. Content reports will show "35 venues staged, awaiting approval." This sounds like a backlog — but it's actually an illusion of work. No user sees a staged venue. The approval pass is the only unblock, and only Jack can run it.

The corrective policy is in Decision 3. If the queue still grows after the cap is set, it means the Content agent is staging without checking queue depth. That's a prompt issue to fix next cycle.

---

*PM agent — 2026-07-14 (v88). v89 expected July 15. If Engelberg ships this run, that's Decision 2 closed. If Jack shares Plausible data, v89 becomes data-driven for the first time since launch.*
