# Peakly PM Report — 2026-07-10 (v84)

> Supersedes v83 (July 9). **Status: YELLOW → P1 lateSeason regression live, Week-2 window opens tomorrow, email deadline TODAY.** Day 10 post-launch. Content July 10 identifies lateSeason regression (4 venues lost flag after July 9 trim), 3 generic-tag venues remain, LatAm beach gap confirmed. Fix the regression before the return window opens.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **375 venues (133 ski / 242 beach).** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260708a` — last code change July 8. Auto-bumps on next code edit.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8.** Stop. |
| "lateSeason: 6 / 25 / 28 venues" | **5 active, 4 need flag restored (regression). Fix this run. See Decision 1.** |
| "lateSeason: 9" | **Target is 9. Current is 5 (4 over-trimmed July 9). Fix restores to 9.** |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags.** Stop. |
| "5 placeholder-tag ski venues" | **3 remaining** (whistler, beaver-creek, park-city-mountain). The other 2 were already fixed. Stop saying 5. |

---

## Shipped Since v83 (2026-07-09 → 2026-07-10)

| Commit | What | Verdict |
|--------|------|---------|
| `43f826f` — DevOps July 10 | Infrastructure GREEN: 375 venues, braces 5572/5572, Babel 8.x P2 flagged, working tree clean | ✅ Clean |
| `01e448a` — Content July 10 | lateSeason regression P1 identified (4 venues over-trimmed July 9), 3 generic-tag venues remaining, 5 venue JSONs staged (2 glacier ski + 3 LatAm beach) | ⚠️ Finding run — fix outstanding |

**Code state July 10:**
- `app.jsx`: 13,502 lines · cache `20260708a` · braces 5,572/5,572
- **375 venues** (133 ski / 242 beach)
- GEAR_ITEMS: 0 · lateSeason: **5 active** (4 need flag restored before July 11)
- Photos: beach ≤3×, ski ≤2× · Sentry: active · Plausible: ✅ scoped · VPS: unverifiable from sandbox

**Open sprint items:**

| Item | Status | Age |
|------|--------|-----|
| **lateSeason regression fix** (chamonix/mammoth/abasin/tignes) | ⚠️ **P1 — this run** | Day 1 (Jul 10) |
| 3 generic-tag ski venues (whistler/beaver-creek/park-city-mountain) | P2 — next Content run | Day 1 (Jul 10) |
| Week-2 retention email | **P0 — TODAY** | Day 4 (since Jul 7) |
| Supabase SQL paste | P0 (App Store) / P3 (web) | Day 31 |
| alpe-d-huez + cortina-d-ampezzo (photo-verify gate) | P2 — DEFER until verify | Day 4 |
| LatAm beach venues staged | P3 — DEFER until Plausible | New Jul 10 |
| Plausible read | P0 — Jack only | Day 10 |
| VPS health check | P1 — Jack only | Day 26 |

---

## Bug Triage — July 10

| Bug | Severity | Status |
|-----|----------|--------|
| **lateSeason regression** — chamonix, mammoth, abasin, tignes lost `lateSeason:true` | **P1** | 4-line fix. Tignes scores 8/100 "Off-season closed" with tag "Summer Glacier" — engine only checks the flag. Fix before Week-2 window. |
| **Week-1 retention email unsent** | **P0** | TODAY deadline. 4 consecutive P0 flags. Jack only. |
| **Plausible data unread** | **P0** | 10 days of user data. Jack: plausible.io. 15 min. Every code decision is a guess. |
| **VPS weather cache** | **P1** | Day 10 post-launch. Jack: `curl https://peakly-api.duckdns.org/health` before July 11. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 31. 2 min. Jack only. |
| **3 generic-tag ski venues** | P2 | Next Content run. |
| **alpe-d-huez + cortina-d-ampezzo** staged, unverified photos | P2 | Run `validate-venues.mjs` first. |
| Babel 8.x upgrade (7.29.7 → 8.0.4) | P2 | Post-500 MAU. Test in branch. |
| LatAm beach gap (3/242 in region) | P3 | DEFER until Plausible confirms LatAm intent. |
| SRI hashes on CDN scripts | P3 | DEFER post-LLC. |
| Plausible dashboard domain update | P2 | Jack only. plausible.io → Settings → Domain. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate-commit pattern · cross-category photos · Plausible domain (code side) · surf-legacy tags · 2 venue dups · lateSeason overuse (28→5+4 regression fix in progress)

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Week-2 email** (Jack — TODAY) | Return-visitor signal + first user research conversations | 4 days past flag |
| **Plausible read** (Jack, plausible.io) | All product prioritization — 10 days blind | Day 10 |
| **VPS health check** (Jack, local terminal) | Return-visitor weather reliability before July 11 | Day 26 |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 31 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 10

### Decision 1: SHIP the lateSeason regression fix this run. P1, agent-executable, no decision needed.

The July 9 Content run over-trimmed `lateSeason:true` from 28 venues to 5, when the correct count is 9. Four venues lost the flag that genuinely need it:

- **chamonix** — Vallée Blanche, August glacier skiing
- **mammoth** — tag "Late Season", July operations at 11,000 ft
- **abasin** — tag "Longest Season CO", summer weekend operations
- **tignes** — tag "Summer Glacier", Grande Motte July–August

Without the flag, each scores 8/100 "Off-season — resort closed" in July. A London user searching for a July ski trip sees Tignes closed. The venue's own tag says "Summer Glacier" — the engine ignores tags, it only checks `lateSeason:true`.

Fix: add `lateSeason:true,` to each of the 4 venue blocks. 4 lines. After fix: lateSeason = 9 (matches DevOps July 10 projection).

**SHIP: This run, by the Content or DevOps agent. Week-2 window opens July 11 — this must be live before then.**

### Decision 2: DEFER LatAm beach venues until Plausible confirms demand.

Content July 10 has 5 LatAm beach venues staged (cancun-beach, florianopolis-beach, punta-mita-beach, +2). The identified gap: only 3/242 beach venues serve Mexico/Caribbean/Brazil.

Do not ship yet. Reasons:
1. No Plausible data to confirm LatAm was in demand from Week-1 users.
2. Photo URLs in the staged entries are unverified — run `validate-venues.mjs` first.
3. 375 venues is a strong catalog. A LatAm gap matters only if users are looking for it.

**DEFER: LatAm beach venues. Gate is (a) Plausible shows LatAm intent OR (b) validate-venues.mjs passes clean. Not before.**

### Decision 3: Week-2 floor is 15% organic return, not 20%.

v81–v83 used 20% as the return rate floor. Revised to 15% because:
- Week-1 cohort size is unknown (no Plausible data)
- The email Jack sends today acts as a confound — need to separate email-driven from organic return
- 15% is still a meaningful bar for a new product with no notification loop

| Return rate (organic, ex-email) | Read |
|----------------------------------|------|
| <15% | First-visit problem. Onboarding sprint before any new features. |
| 15–30% | Expected. Hold course, ship quality. |
| >30% | Product has pull. Accelerate distribution. |

**DECISION: 15% organic return rate floor for Week-2. Email sends today as a separate signal to track.**

---

## This Week's Top 3 Priorities Only

**1. Fix the lateSeason regression this run (agent task).**

4 lines. Chamonix, Mammoth, Arapahoe Basin, Tignes. These venues are actively open in July and currently scoring closed. The Week-2 return window opens tomorrow. This is the highest-leverage code change available today.

**2. Jack: Send the retention email today.**

3 sentences. Personal. From jjciluzzi@gmail.com. Subject: "Peakly updated for next weekend." One live link. One open question. The replies are user research. This has been P0 for 4 consecutive reports. It ends today.

**3. Jack: Read Plausible + VPS health check (15 min total, before July 11).**

10 days of user data. One browser tab. The VPS check tells you whether return visitors get accurate scores. The Plausible data tells you whether you have 200 or 2,000 returning users. Both change what we build in Week 3.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| LatAm beach venues (5 staged) | **DEFER.** No Plausible confirmation of LatAm demand. Photo URLs unverified. |
| alpe-d-huez + cortina-d-ampezzo | **DEFER.** Run `validate-venues.mjs` first. Don't paste unverified. |
| Automated email digest | **DEFER.** Manual founder email first. Automation after PMF signal. |
| Hotel integrations | **CUT for v1.** |
| JSON-LD / structured data | **DEFER.** Post-1K users. |
| Venue deep links / permalink pages | **DEFER.** Post-100 detail-sheet views/day. |
| Babel 8.x upgrade | **DEFER.** Post-500 MAU. Test in branch. |
| SRI hashes | **DEFER post-LLC.** |
| New venue categories | **CUT.** Ski + beach is the moat. |
| Lesotho (Afriski) ski venue | **DEFER.** No demand signal for Africa skiing at current MAU. |

---

## Success Criteria — 8K vs 5K

**Week-2 gate (July 11–17):**
- <15% organic return → onboarding problem → fix first-run before any new features
- 15–30% organic return → expected → hold strategy, ship quality
- >30% organic return → product has pull → accelerate distribution (second Reddit/Twitter)

**The one-number question:** How many unique visitors July 1–7? If <500 → repost. If 500–2K → hold and watch. If >2K → double down on quality. Jack reads Plausible today.

**For 8K not 5K:** organic sharing loop kicks in by Week 4 (July 22+). If Share-a-List generates ≥5 organic inbound visits/week by July 28, the loop is working. If not, a second Reddit post is the path to 8K.

---

## One Product Risk Nobody Is Talking About

**The lateSeason regression has been live for 24 hours — all July 10 visitors saw Tignes, Mammoth, Arapahoe Basin, and Chamonix closed.**

These are not obscure venues. Tignes is the most Googled European summer ski resort. Mammoth is the most Googled California summer ski mountain. If any Week-1 visitor came back today specifically to check one of these — because they're planning a trip — they saw "Off-season — resort closed" and bounced.

We don't know how many. We can't check Plausible. We can fix it in 4 lines before tomorrow's return window.

The risk is real. The fix is known. The only question is whether it ships before the July 11 return window or after.

---

*PM agent — 2026-07-10 (v84). v85 expected July 11. Priority for next agent run: lateSeason regression fix (Decision 1) — execute immediately. If Plausible data arrives in session, v85 will be a data-driven Week-2 sprint.*
