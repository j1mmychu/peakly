# Peakly PM Report — 2026-07-07 (v81)

> Supersedes v80 (July 6). **Status: GREEN on code, YELLOW on distribution.** Day 7 post-launch. July 7 sprint partially executed — Plausible domain fix DONE, dup removal + tag fixes + 5 glacier venues pending. Plausible data unreadable from sandbox; Jack must read it before prioritizing any build work.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260707a` — bumped by DevOps today.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "Duplicate commit pattern" | **Known-skipped June 25.** Stop. |
| "197 empty-tag venues" | **FALSE. All 370 have ≥2 tags.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7 (DevOps `4001690`).** Stop. |
| "27 surf-legacy tags need removal" | **FALSE — see Decision 1. These are valid beach activity tags. Stop.** |
| "lateSeason: 6 venues" | **25 venues.** Stop. |

---

## Shipped Since v80 (2026-07-06 → 2026-07-07)

| What | Verdict |
|------|---------|
| **DevOps July 7** (`4001690`) — Plausible domain `j1mmychu.github.io` → `j1mmychu.github.io/peakly` + cache `20260706a`→`20260707a` | ✅ Sprint item 2 DONE. Plausible now tracks `/peakly/` specifically. **Jack: also update the Plausible dashboard site domain (plausible.io → Sites → Settings → Domain) or add a new site for the path.** |
| **Content July 7** (`52c329c`) — 370 venues, 0 cross-category photo issues, 2 dups confirmed (bigsky + beach_miami), 5 placeholder-tag venues staged, surf-legacy tag finding revised (26 tags are VALID beach activity tags) | ✅ Data quality audit complete. Sprint execution items clarified. |

**Code state July 7:**
- `app.jsx`: 13,443 lines · cache `20260707a` · braces 5,565/5,565
- **370 venues** (131 ski / 239 beach) → 368 post dup removal
- GEAR_ITEMS: 0 · lateSeason: 25 · 135 unique photos · max repeat 3×
- Sentry: active · Plausible: domain scoped ✅ · VPS: unverified (sandbox)

**Remaining July 7 sprint items (from v80 Decision 1):**

| Item | Status |
|------|--------|
| 1 — Read Plausible + Sentry | ⏳ Jack only — sandbox cannot access |
| 2 — Plausible domain fix | ✅ DONE (DevOps) |
| 3 — Remove 2 duplicate venues (368 venues) | ⏳ Pending |
| 4 — Fix 5 placeholder-tag ski venues | ⏳ Pending |
| 5 — Remove 27 surf-legacy tags | ❌ CANCELLED — Decision 1 |
| 6 — Add 5 glacier ski venues | ⏳ Pending photo URL verification |
| 7 — Supabase SQL paste | ⏳ Jack only |
| 8 — Draft Week-1 retention email | ⏳ Jack only — send July 10 |

---

## Bug Triage — July 7

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | Sandbox can't access plausible.io. Jack: read dashboard before touching any build work. |
| **VPS weather cache** — may have restarted (Day 7 post-launch) | **P1** | Jack: `curl https://peakly-api.duckdns.org/health`. If `wx_cache_size == 0`, warm it before the Week-2 return-visitor window (July 11–13). |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | Day 28 open. 2 minutes. Jack only. |
| **2 duplicate venues** (bigsky + beach_miami) | P2 | Sprint item 3. 10 min. |
| **5 placeholder-tag ski venues** | P2 | Sprint item 4. 15 min. |
| Surf-legacy tags | ~~P2~~ | **CANCELLED — tags are valid beach activity signals. See Decision 1.** |
| SRI on CDN scripts | P3 | DEFER post-LLC. |
| Plausible dashboard domain update | P2 | Jack only. plausible.io → Sites → Settings → Domain → `j1mmychu.github.io/peakly` |
| 14 orphaned `claude/` branches | P4 | No urgency. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X" outage framing · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays · cross-category photo contamination · Plausible domain (code side) · surf-legacy tags

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Plausible read** (Jack, plausible.io) | Sprint prioritization — all content decisions contingent on Week-1 data | Day 7 post-launch |
| **VPS health verify** (Jack, local terminal) | Confirms whether early-user weather data was clean | Day 23 |
| **Supabase SQL paste** (Jack) | iOS App Store Guideline 5.1.1(v) | Day 28 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |
| Apple Developer ($99) | App Store submission | Post-launch |

---

## Explicit Product Decisions — July 7

### Decision 1: CANCEL surf-legacy tag removal. The "27 tags" finding was wrong.

v80 sprint item 5 queued removal of 27 "surf-legacy" tags across 26 beach venues (tags like "Surf Breaks", "Kitesurfing", "Windsurfing"). Content report July 7 corrects this: these are **legitimate beach activity condition signals**, not artifacts of the retired Surfing category.

"Surf Breaks" on a beach card tells a surfer that the break has wave quality worth scoring. "Kitesurfing" and "Windsurfing" tell wind-sport travelers something real. These tags were correctly included when Surfing was retired — they describe the beach venue, not the old category.

**The retired-category tags that were correctly removed** were `category: "surfing"` entries and scoring logic for the surfing category. The beach-venue activity tags were never the problem.

**CANCEL: Sprint item 5. Remove from queue. Remove "27 surf-legacy tags" from all future bug reports.**

### Decision 2: The 5 glacier ski venues SHIP today, conditional on photo URL pass.

Saas-Fee, Les Deux Alpes, Alpe d'Huez, St. Moritz, Cortina d'Ampezzo are the five most-searched European summer ski destinations not in the catalog. This is a July credibility gap — any Redditor from the UK or Germany who opened the Skiing filter this week and looked for European glacier skiing found nothing.

Strategic case:
- **Saas-Fee** (ZRH): Only "Four Seasons" glacier resort in the Alps. Year-round skiing. Missing at launch is embarrassing.
- **Les Deux Alpes** (GNB): Largest glacier in Europe for summer skiing. Closes in August — this is literally the last month to surface it in the July carousel.
- Alpe d'Huez, St. Moritz, Cortina: Off-season N-hemi right now, but add catalog depth for October onwards.

Both ZRH and GNB are already in AIRPORT_COORDS and AP_CONTINENT. IDs grep-clean. The only gate is photo URL verification — run `node scripts/validate-venues.mjs` on the staged candidates before pasting. If any photo returns 404, swap the Unsplash ID.

**SHIP: All 5 staged ski venues today. Gate: photo URL verification only. Run `validate-venues.mjs` first.**

### Decision 3: Week-2 retention window is July 11–13. Jack must send the email by July 10.

The cohort: anyone who visited July 1–7 post-launch. The question: do they come back without being asked?

Target: ≥20% return rate on Days 7–10 without an email = product has intrinsic pull.

What that email should be (3 sentences, from Jack personally):

> "Hey — I built Peakly and you visited last week. Scores just updated for next weekend (July 11–14) — [link to beach] looks great from [common airport]. Still building — reply and tell me where you tried to fly and what was wrong."

That last sentence is the most important part. The email isn't just for retention — it's the first real user research conversation. Every reply is worth more than a month of analytics.

**Jack: draft and send July 10, one day before the return window opens. Manual. No automation.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Read Plausible before touching any code.**

The Week-1 data is in. 7 days of real user behavior. If beach filter dominated (expected), nothing changes. If Skiing filter drove unexpected bounce, there's a framing problem to fix before adding more ski venues. If total visitors are <500, the Reddit distribution underperformed and a second post should happen before the July 7 sprint. **Read the dashboard. Then decide what to build.**

**2. Execute remaining sprint items 3–4 + item 6 (photo-verified).**

- Remove 2 duplicate venues (bigsky + beach_miami): 10 min
- Fix 5 placeholder-tag ski venues (winter-park, copper-mountain, lake-louise, palisades-tahoe, brighton): 15 min
- Run `validate-venues.mjs` on 5 glacier venues, then paste: 30 min

Combined: ~55 minutes. Improves catalog quality and adds the July-relevant glacier inventory. Nothing here depends on Plausible data — ship regardless.

**3. Jack: Send Week-1 retention email July 10. VPS health check same day.**

The email is the highest-leverage non-code action this week. 3 sentences. Personal. The replies are user research you can't buy. The VPS check tells you whether early-user weather data was reliable — material if you're trying to explain any anomalies in the Plausible bounce data.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| Surf-legacy tag removal | **WRONG FINDING — tags are valid beach activity signals. Not removing.** |
| Automated weekly email digest | **DEFER.** Infrastructure before signups. Manual founder email first. |
| Hotel integrations | **CUT for v1.** Scope creep. |
| JSON-LD / structured data | **DEFER.** SEO compounds on traffic that doesn't exist yet. Post-100-users. |
| Venue deep links / permalink pages | **DEFER.** Build after Plausible shows >100 detail-sheet views/day per venue. |
| Photo dedup ≤2× | **DEFER.** Needs ~100 new verified Unsplash IDs. No API key in repo. |
| New venue categories (climbing, surf, hiking) | **CUT.** Ski + beach focus is the moat. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** P3. |
| Tag enrichment for 2-tag venues | **DEFER.** Wait for filter-click data to know which tags drive discovery. |

---

## Success Criteria — 8K vs 5K

**Gate metrics (unchanged from v80):**
1. **Week-1 unique visitors ≥ 2K** — if below, distribution underperformed; repost before building.
2. **Week-2 return rate ≥ 20%** — if below, onboarding hook becomes next build priority.
3. **Beach filter ≥ 40% of filter clicks in July** — if below, seasonal copy mismatch risk.

**For 8K not 5K:** organic referral loop kicks in by Week 4. "Share a weekend plan" must generate ≥5 organic referrals/week by July 28 without a second distribution push. If it doesn't, the ceiling is 5K and a second Reddit post is the path to 8K, not feature work.

---

## One Product Risk Nobody Is Talking About

**There are 7 days of real user data in Plausible right now, and nobody on the agent team can read it.**

The agents run in sandboxed containers with egress blocks. They can verify code structure, count venues, audit photos — but they can't hit plausible.io. This means every product decision this week (which venues to add, whether to fix the skiing filter UX, whether to send a second Reddit post) is being made without the one input that actually matters: what did real users do?

This isn't a technical problem. Plausible's dashboard is a link Jack opens in a browser. But if Jack doesn't look at it before approving the July 7 sprint, we're making decisions based on 6-week-old hypotheses instead of 7-day-old reality. That's the actual risk.

**The ask is simple: Jack reads plausible.io before writing any code today. That's it.**

---

*PM agent — 2026-07-07 (v81). v82 expected July 8. If Jack shares Plausible data in session, v82 becomes a data-driven sprint update. If not, v82 will flag the gap again.*
