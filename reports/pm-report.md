# Peakly PM Report — 2026-07-11 (v85)

> Supersedes v84 (July 10). **Status: GREEN on code, YELLOW on distribution.** Day 11 post-launch. **Week-2 return window is LIVE.** lateSeason regression fixed by DevOps this morning (9→13). Cache bumped `20260711a`. New P2: GIG missing from AP_CONTINENT. Retention email still unconfirmed — 5 consecutive P0 flags. Plausible still unread.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **375 venues (133 ski / 242 beach).** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale / 20260708a" | **Bumped to `20260711a` by DevOps this run.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8.** Stop. |
| "lateSeason regression open" | **FIXED July 11 (DevOps `18b19b5`).** Count = 13. Stop. |
| "lateSeason: 6 / 9 / 5 / 25 venues" | **13.** Full list: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — valid beach activity tags.** Stop. |
| "5 placeholder-tag ski venues" | **3 remaining** (whistler, beaver-creek, park-city-mountain). Stop saying 5. |
| "cancun-beach dup" | **FIXED July 8. 0 duplicate IDs.** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` present at app.jsx:401.** Content July 11 finding was a false positive. Stop. |

---

## Shipped Since v84 (2026-07-10 → 2026-07-11)

| Commit | What | Verdict |
|--------|------|---------|
| `18b19b5` — DevOps July 11 | lateSeason regression fixed (4 venues restored, 9→13); cache `20260708a`→`20260711a` | ✅ P1 CLOSED |
| `05f7787` — Content July 11 | 0 dups, all 375 tagged, 13 lateSeason confirmed; GIG/AP_CONTINENT gap flagged; 4 venues re-staged | ✅ Audit clean, 1 new P2 |

**Code state July 11 (post-DevOps fix):**
- `app.jsx`: 13,502 lines · cache `20260711a` ✅ · braces 5,572/5,572 ✅
- **375 venues** (133 ski / 242 beach)
- GEAR_ITEMS: 0 · lateSeason: **13** ✅ · Babel: 7.29.7 (8.x deferred)
- Sentry: active · Plausible: scoped ✅ · VPS: unverifiable from sandbox

**Open sprint items:**

| Item | Status | Age |
|------|--------|-----|
| ~~**GIG → AP_CONTINENT fix**~~ | ~~P2~~ — **FALSE POSITIVE. Already mapped.** Closed. | — |
| 3 generic-tag ski venues (whistler/beaver-creek/park-city-mountain) | P2 — next Content run | Day 2 |
| **4 venues staged** (alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil, +1) | P2 — gate: `validate-venues.mjs` pass | Day 2 |
| Week-2 retention email | **P0 — Jack only** | Day 5 |
| Supabase SQL paste | P0 (App Store) / P3 (web) | Day 32 |
| Plausible read + VPS health check | P0 / P1 — Jack only | Day 11 |
| LatAm beach gap | P3 — DEFER until Plausible | Day 2 |

---

## Bug Triage — July 11

| Bug | Severity | Status |
|-----|----------|--------|
| **Week-2 retention email unsent** | **P0** | Day 5, 5th consecutive flag. Today is the last optimal day — the 7–10 day window closes July 13. Jack only. |
| **Plausible data unread** | **P0** | Day 11. 375 venues, 11 days of user data, zero signal on what's working. Jack: plausible.io, 15 min. |
| **GIG/AP_CONTINENT (Content finding)** | ~~P2~~ | **FALSE POSITIVE. `GIG:"latam"` already at app.jsx:401.** ipanema-rio is fine. Do not re-flag. |
| **3 generic-tag ski venues** | P2 | whistler, beaver-creek, park-city-mountain — next Content run. |
| **4 staged venues unverified** | P2 | alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil, +1 — run `validate-venues.mjs` first. Gate holds. |
| VPS weather cache | P1 | Unverifiable from sandbox. Jack: `curl https://peakly-api.duckdns.org/health`. |
| Supabase SQL paste | P0 (App Store) / P3 (web) | Day 32. 2 min. Jack only. |
| Babel 8.x upgrade | P2 | DEFER post-500 MAU. |
| LatAm beach gap (3/242 in S.Am) | P3 | DEFER until Plausible confirms LatAm demand. |
| SRI hashes on CDN scripts | P3 | DEFER post-LLC. |
| Plausible dashboard domain update | P2 | Jack only. plausible.io → Settings → Domain → `j1mmychu.github.io/peakly`. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate-commit pattern · cross-category photos · Plausible domain (code side) · surf-legacy tags · cancun-beach dup (July 8) · lateSeason regression (July 11) · GIG/AP_CONTINENT (false positive July 11)

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Week-2 email** (Jack — TODAY, closes July 13) | First user research conversations + return-visitor signal | Day 5 |
| **Plausible read** (Jack, plausible.io) | All product prioritization — 11 days blind | Day 11 |
| **VPS health check** (Jack, local terminal) | Confirms weather reliability for return visitors | Day 27 |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 32 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 11

### Decision 1: Content July 11 GIG finding is a FALSE POSITIVE. No fix needed.

Content July 11 flagged `GIG` as missing from `AP_CONTINENT`. Verified: `GIG:"latam"` is already present at app.jsx:401. `ipanema-rio` (Galeão International, Rio de Janeiro) is correctly mapped and the continent filter works for this venue.

**NO ACTION: Adding GIG to the corrections table. This class of finding (airport missing from map) should be verified with `grep "GIG" app.jsx` before flagging.**

### Decision 2: HOLD the 4 staged venues until validate-venues.mjs confirms photo URLs.

Content July 11 re-staged alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil, and one additional venue. v84 set the gate: run `validate-venues.mjs` first, don't paste unverified Unsplash URLs.

That gate stands. The Unsplash photo URLs in the staged entries have not been verified against the validator. A 404 photo in a venue card is a visible quality regression to any user who opens that card. The venue itself doesn't help users more than a broken image hurts them.

**HOLD: All 4 staged venues. Gate: `validate-venues.mjs` returns all PASS. Then paste and ship.**

### Decision 3: Week-2 measurement framework — what we're reading July 11–17.

The return window is live. Here's the framework for interpreting whatever Plausible shows:

| Metric | Threshold | Read |
|--------|-----------|------|
| Organic return rate (ex-email) | <15% | First-run problem. Fix onboarding before any new features. |
| Organic return rate (ex-email) | 15–30% | Expected. Hold strategy, ship catalog quality. |
| Organic return rate (ex-email) | >30% | Product has pull. Accelerate distribution. |
| Week-1 unique visitors | <500 | Second Reddit post before July 14. |
| Week-1 unique visitors | 500–2K | Hold and watch Week-2. |
| Week-1 unique visitors | >2K | Double down on quality; Share-a-List as growth loop. |
| Beach filter share in July | <40% | Seasonal copy mismatch. Audit landing experience. |

Plausible can show all of this in one dashboard view. Jack: 15 minutes. Every agent decision for the next 2 weeks changes based on these numbers.

**DECIDE: Jack reads Plausible by end of July 11. Shares numbers in session if possible. If <500 unique visitors → second Reddit post by July 14.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Send the retention email NOW. The window closes July 13.**

This has been P0 for 5 consecutive reports. It's 3 sentences. Personal email from jjciluzzi@gmail.com. Subject: "Peakly updated for next weekend." Include one live link to the site and one open question ("where did you try to fly and what was wrong?"). The replies are irreplaceable early-user research. After July 13, the optimal return window is gone.

**2. Run `validate-venues.mjs` on the 4 staged venues — agent-executable.**

alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil are staged in the Content July 11 report. The gate before pasting is confirming photo URLs return 200 via the validator. If all pass, paste and commit. If any 404, swap the Unsplash ID. The GIG/AP_CONTINENT P2 was a false positive (already mapped) — no fix needed.

**3. Jack: Read Plausible before building anything else.**

11 days of real data. Venue filter behavior, bounce rate, session depth — all of it changes the Week-3 build priorities. The agents can't read it. Jack can. 15 minutes in a browser tab. This single read determines whether we add more venues, fix onboarding, or do a second Reddit post.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| 4 staged venues (unverified) | **HOLD.** validate-venues.mjs gate first. |
| LatAm beach expansion (3 more venues) | **DEFER.** No Plausible confirmation of LatAm demand. |
| Automated email digest | **DEFER.** Manual founder email first. Automation after PMF signal. |
| Hotel integrations | **CUT for v1.** |
| JSON-LD / structured data | **DEFER.** Post-1K users. SEO compounds on traffic that doesn't exist yet. |
| Venue deep links / permalink pages | **DEFER.** Post-100 detail-sheet views/day per venue. |
| Babel 8.x upgrade | **DEFER.** Post-500 MAU. Test in branch. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** |
| New venue categories (climbing, surf, hiking) | **CUT.** Ski + beach is the moat. |
| Lesotho (Afriski) ski venue | **DEFER.** No Africa skiing demand signal at current MAU. |

---

## Success Criteria — 8K vs 5K

**Week-2 gate (July 11–17):**
- Organic return rate < 15% → onboarding fix is the sprint, not catalog
- Organic return rate 15–30% → expected, hold course
- Organic return rate > 30% → product has pull, accelerate distribution

**The one-number question:** Unique visitors July 1–7. If <500 → second Reddit post. If 500–2K → watch Week-2. If >2K → double down on quality + Share-a-List. Jack reads Plausible today.

**For 8K not 5K:** organic sharing loop active by Week 4 (July 22+). Share-a-List generates ≥5 organic inbound visits/week by July 28 = loop working. If not by July 28, a second Reddit post is the path to 8K, not feature work.

---

## One Product Risk Nobody Is Talking About

**The Week-2 retention window has a hard close date nobody is tracking.**

v78 through v85 have all flagged the retention email as P0. The reason it keeps not happening isn't prioritization — it's that "send an email" sounds low-stakes and easy to defer by a day. But the 7–10 day re-engagement window is a real behavioral phenomenon, not a theory. A user who visited July 1 and receives a personal email July 13 is outside their peak re-engagement zone. By July 14, the window is effectively closed for the July 1–7 cohort.

The agents can ship code. They can't send an email from jjciluzzi@gmail.com. There is exactly one action available today that can't be delegated, can't be automated, and has a 48-hour expiry — and it's the same one that's been on the list for 5 days.

The product risk is that Week-2 data ends up uninterpretable because the email variable was never introduced, and we spend Week 3 making decisions based on organic return rate from a product that nobody was reminded to come back to.

---

*PM agent — 2026-07-11 (v85). v86 expected July 12. Priority action this run: GIG/AP_CONTINENT 1-line fix (agent-executable). All other opens are Jack-gated. If Jack shares Plausible data in session, v86 is a data-driven Week-2 sprint update.*
