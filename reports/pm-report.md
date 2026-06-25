# Peakly PM Report — 2026-06-25 (v69)

> Supersedes v68 (June 24). **Status: RED.** Product is launch-ready minus one 45-minute tag pass. Reddit is Day 21. Peak summer beach + S-hemisphere ski window: week 2 of 8.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Stale from pre-May pivot. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price in product. Not a bug. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Not empty. |
| "Cache buster stale" | **Auto-bumped daily by DevOps.** Not stale. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13/14. Sandbox 403s are container egress blocks, not outages.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop reporting. |
| "GEAR_ITEMS" | **Count = 0. Amazon cut for v1. Final.** |
| "40 ski venues with single tags" | **197 venues (53%) have EMPTY tag arrays.** See Decision 1. |

---

## Shipped Since v68 (2026-06-24 → 2026-06-25)

| What | Verdict |
|------|--------|
| **Cache `20260624b` → `20260625a`** (DevOps, `2fd6059`) | ✅ Correct. Daily bump. |
| **Content report: venue freeze honored, zero-tag gap discovered** (`8e39db6`) | ✅ Right call on freeze. Tag finding is critical — see Decision 1. |

**Code state June 25:**
- `app.jsx`: 13,323 lines · cache `20260625a` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- All pre-launch code items ✅

---

## Bug Triage — June 25

| Bug | Severity | Status |
|-----|----------|-------|
| **Reddit post: Day 21** | **P0 (business)** | Jack only. Today. No more deferral. |
| **197 venues with 0 tags — filter system half-broken** | **P1** | 45-min Content agent fix. DO THIS TODAY before post. See Decision 1. |
| **VPS unverified since June 13** | **P1 pre-post** | Jack: `curl https://peakly-api.duckdns.org/health` before posting. From local terminal, not sandbox. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store) / P3 (web) | Jack: 2 min in Supabase SQL editor. Graceful fallback active until then. |
| **Duplicate commit pattern** (3x identical commits June 23) | P2 — **second strike** | Graduates to `known-skipped.md` this run. Root cause noted for future auto-push.sh work. |
| lateSeason count (25 total; quality varies) | P2 | DEFER July sprint. Snow-depth gate holds. |
| SRI on CDN scripts | P3 | DEFER post-launch. Final. |
| CSP meta | P3 | DEFER. Babel `unsafe-eval` makes strict CSP impossible. |

**Permanently closed — stop raising:**
- Peakly Pro price · Sentry DSN · Cache buster · VPS "Day X binary blocker" · DEAL_WEIGHT · GEAR_ITEMS · coronet-peak lateSeason · Killington lateSeason · EWR AP_CONTINENT

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Tag enrichment pass** (top 30 ski + top 30 beach) | Filter system works at launch | 45 min (agent) | **New today** |
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **21** |
| **VPS SSH verify** | Confident pricing + spike absorption | 5 min | 12 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 15 |
| LLC approval | REI +$6.16, Backcountry/GYG +$1.84/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | ~2h + Apple review | Post-launch |

---

## Explicit Product Decisions — June 25

### Decision 1: Tag enrichment is P1. Content agent does it TODAY, before or concurrent with the Reddit post.

The v68 characterization of "40 ski venues with single tags" was wrong. The real number: **197 venues (53%) have completely empty tag arrays.** This includes Kaanapali Beach Maui, Waikiki Beach Oahu, Cancún Beach, Bali Seminyak, Winter Park, Copper Mountain, Palisades Tahoe, Snowbird — the most recognizable names in the catalog.

When a Reddit user lands on Explore and taps the "Powder Day" filter pill, they miss 63 of 131 ski venues. When they tap "Snorkeling," they miss 134 of 239 beach venues. That is a broken feature, not cosmetic debt. Reddit comments don't distinguish between "intentionally missing" and "app is broken" — they write "tried to filter by beach type and got like 5 results, what?"

**Fix is low-risk.** Content agent adds 3–4 tags to top 30 ski + top 30 beach zero-tag venues (the ones with most Explore traffic by coordinate proximity to hub airports). Controlled vocabulary from the Content report. Zero structural change, zero smoke-test risk. 45 minutes.

**Action (Content agent, TODAY):** Tag enrichment pass — top 30 ski venues (Winter Park, Copper Mountain, Palisades Tahoe, Snowbird, Brighton, Solitude, Deer Valley, Crystal Mountain WA, Mt Bachelor, Sugar Bowl + 20 more) and top 30 beach venues (Kaanapali, Waikiki, Cancún, Seminyak, Patong, Playa del Carmen, Varadero, Langkawi, Ko Phi Phi + 21 more). 3–4 tags each from the controlled vocabulary in the Content report. Cache stamp auto-bumps to `20260625b`.

**Reddit post: after this commit lands, or same hour. Not blocked on the other 137 zero-tag venues — this covers the top-traffic names.**

---

### Decision 2: Reddit post order. Today, no exceptions.

The pre-post sequence is now:
1. **Agent: Tag enrichment commit** (45 min, concurrent with Jack's VPS check)
2. **Jack: `curl https://peakly-api.duckdns.org/health`** (5 min, from local terminal)
3. **Jack: Reddit post** (15 min)
4. **Jack: Stay in thread for 3 hours.** First comment with personal data ("found $180 RT to Cancún, score 88") is the difference between 3K and 8K at 90 days.

Post to r/frugaltravel first, r/solotravel second (1 hour later).

Post copy (unchanged from v68):
> *"Built a free app that finds the best beach or ski spot to fly to THIS weekend — live weather + real flight prices from your home airport + a confidence score that tells you when the forecast is too shaky to trust. 370 spots globally. Brutally honest about uncertainty. Feedback welcome. [link]"*

There is no Day 22.

---

### Decision 3: Duplicate commit guard — graduate to known-skipped.

Second consecutive appearance of the triple-commit pattern (June 23: 3x identical "Delete tahoe duplicate" commits). The fix is a pre-commit diff-check in auto-push.sh. This is a 30-minute DevOps task. Per the two-strikes rule, it moves to `reports/known-skipped.md` this run. Re-flags if it causes a broken deploy or wasted run time.

---

## This Week's Top 3 Priorities Only

**1. Agent: Tag enrichment pass. Today, before or same hour as Reddit post.**

Top 30 ski + top 30 beach venues. 3–4 tags each. Controlled vocabulary from Content report §4. Commit, auto-push, cache `20260625b`. Then Jack posts.

**2. Jack: Reddit post. Today.**

Sequence above. Stay in thread. VPS check is prerequisite — 5 minutes before posting.

**3. Jack: Supabase SQL paste.**

`server/sql/delete-account.sql` → Supabase SQL editor. 2 minutes. App Store gate. Do it while in the thread.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|-------|
| New venue additions (any) | **FREEZE. Final until Plausible data.** | 370 is enough. No demand signal yet. |
| Caribbean (Punta Cana, Nassau) | **DEFER July sprint** | Airport prereqs missing; not a launch lever. |
| S. America beach venues | **DEFER July sprint** | No demand signal. |
| Remaining 167 zero-tag venues | **DEFER July sprint** | Top 60 fixed pre-launch covers the traffic names. |
| lateSeason cleanup (sub-2500m N-hem audit) | **DEFER July sprint** | Snow-depth gate holds through launch. |
| Scoring algorithm changes | **REJECT until post-launch baseline** | No user data. Blast radius unacceptable. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU if warranted. |
| Wishlists / Trips tab unhide | **LOCKED at 1K MAU gate.** | |
| JSON-LD enhancements | **DEFER.** | Live. Working. SEO gap is not a launch blocker. |

---

## Pre-Launch Checklist — June 25

| # | Item | Status |
|---|------|-------|
| 1–20 | All code items (scoring, cold-start, alerts honesty, account deletion UI, book_click, ToS links, ScoringExplainer, ALERTS_AVAILABLE, photo dedup) | ✅ All green |
| 21 | `tahoe` duplicate deleted | ✅ June 23 |
| 22 | `.venue-baseline` correct at 370 | ✅ |
| 23 | **Tag enrichment — top 60 venues** | ❌ **Content agent: TODAY** |
| 24 | **VPS `/health` green** | ❓ Jack: verify before posting (from local terminal) |
| 25 | **Supabase account deletion SQL** | ❌ Jack: 2 min |
| 26 | **Reddit post live** | ❌ **Jack: TODAY. Day 21.** |

---

## 90-Day Projection — June 25

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| Post today + top-5 + Jack in thread | **5K–8K** | VPS confirmed. Tags fixed. First data-point comment in hour 1. |
| Post today without staying in thread | **2K–3K** | Post sinks without human momentum. |
| Post today + VPS down | **<1K** | Weather fails at spike. "Broken at launch" comment kills momentum. |
| Slips to July 1 | **2K–4K** | -40% ceiling vs today. July 4 weekend noise. |
| Slips to August | **<2K** | Summer peak over. 100K goal moves to 2027. |

**For 8K not 5K:** tags fixed before post, VPS confirmed, Jack in thread, personal fare data comment within 30 minutes of posting, top-5 in r/frugaltravel within 6 hours.

---

## Revenue Model — June 25

| Stream | Status | RPM/1K MAU |
|--------|--------|------------|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS verify pending) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI / Backcountry / GYG | LLC pending | +$8.00/1K MAU when unlocked |

**Live RPM: $7.58/1K MAU.** Revenue is a rounding error at current MAU. Launch is the only lever.

---

## One Product Risk Nobody Is Talking About

**The filter system is a trap for the exact users we most want to retain.**

The Reddit launch will bring two types of users: browsers (scroll the grid, tap a card, book or bail) and power users (immediately try to filter by "Powder Day" or "Family Friendly"). The browsers will have a great experience. The power users — the ones with highest LTV, most likely to return, most likely to share — will tap a filter and see a broken half-empty grid.

Power users become advocates or detractors in hour one. Getting the tag pass done today isn't just about fixing a P1 — it's about making sure the users most likely to be enthusiastic evangelists don't hit a dead wall on their first interaction with the one feature that proves the product understands what they care about.

The filter system is how Peakly proves it's not just another list of destinations. Fix it before the world sees it.

---

*Written 2026-06-25 | PM v69 | Build: 20260625a | Venues: 370 (131 ski / 239 beach) | Reddit: Day 21 — post TODAY after tag pass*
