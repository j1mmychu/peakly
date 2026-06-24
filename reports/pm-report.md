# Peakly PM Report — 2026-06-24 (v68)

> Supersedes v67 (June 23). **Status: RED.** Product is launch-ready. Reddit is Day 20. Peak summer beach season opened June 20. We are burning our best inventory window while adding venues nobody asked for.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Stale from pre-May pivot. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price in product. Not a bug. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Not empty. |
| "Cache buster stale" | **Auto-bumped daily by DevOps.** Not stale. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13. Sandbox 403s are container egress blocks, not outages.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop reporting. |
| "GEAR_ITEMS" | **Count = 0. Amazon cut for v1. Final.** |

---

## Shipped Since v67 (2026-06-23 → 2026-06-24)

| What | Verdict |
|------|--------|
| **Cache `20260623c` → `20260624a`** (DevOps, `055769f`) | ✅ Correct. Daily bump. |
| **+5 venues** — Jackson Hole (JAC), Big Sky (BZN), Grace Bay Turks & Caicos (PLS), South Beach Miami (MIA), Cancún (CUN) → **370 total** (Content, `33e8560`) | ⚠️ Right catalogs, wrong timing. See Decision 1. |
| **Cache `20260624a` → `20260624b`** (Content bump same day) | ✅ Structural. |
| **`.venue-baseline` updated 365 → 370** (this run) | ✅ Required. Content agent flagged it; applied now. |

**Code state June 24:**
- `app.jsx`: 13,278 lines · cache `20260624b` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25 (review pending July)
- All pre-launch code items ✅ — only Jack-only actions remain

---

## Bug Triage — June 24

| Bug | Severity | Status |
|-----|----------|-------|
| **Reddit post: Day 20** | **P0 (business)** | Jack only. Non-negotiable. See Decision 2. |
| **`.venue-baseline` stale (365 vs 370)** | **P1** | ✅ Fixed this run. |
| **VPS unverified since June 13** | **P1 pre-post** | Jack: `curl https://peakly-api.duckdns.org/health` before posting. Degraded (not broken) if down — direct Open-Meteo fallback fires. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store) / P3 (web) | Jack: 2 min in Supabase SQL editor. Web users get graceful fallback until then. |
| **Auto-push triple-commit noise** (3x identical commits June 23) | P2 | DevOps has the diff-check guard fix. Cosmetic — no user impact. Apply when auto-push is next touched. |
| lateSeason count (25 total; quality varies) | P2 | DEFER July sprint. Snow-depth gate suppresses bad actors. |
| 40+ single-tag ski venues | P3 | DEFER July sprint. |
| SRI on CDN scripts | P3 | DEFER post-launch. Final. |
| CSP meta | P3 | DEFER. Babel `unsafe-eval` blocks strict CSP structurally. |

**Permanently closed — stop raising:**
- Peakly Pro price · Sentry DSN · Cache buster · VPS "Day X binary blocker" · DEAL_WEIGHT · GEAR_ITEMS · coronet-peak lateSeason · Killington lateSeason · EWR AP_CONTINENT

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **20** |
| **VPS SSH verify** | Confident pricing + spike absorption | 5 min | 11 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 14 |
| LLC approval | REI +$6.16, Backcountry/GYG +$1.84/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | ~2h + Apple review | Post-launch |

---

## Explicit Product Decisions — June 24

### Decision 1: VENUE FREEZE. Effective immediately. No more venues until post-launch data.

370 venues is enough to launch. Jackson Hole, Big Sky, Grace Bay, South Beach, Cancún were the right catalog additions. They're also the last ones before launch.

The content agent is adding 5 venues per run. That sounds productive. It isn't. Zero Reddit users will complain about missing Jackson Hole before they see the app. They WILL complain if the 3 venues near their home airport show "conditions unavailable." Venue count is a vanity metric. Venue quality + scoring honesty is the actual product.

**Effective today:** Content agent shifts to quality-only work in July sprint — tag enrichment (40 ski venues with single tags), lateSeason audit (25 venues, remove sub-2500m N-hem flagging), Caribbean airport prereqs (Punta Cana/Nassau/Havana need AP_CONTINENT entries). **No new venues added until post-launch Plausible data tells us which geographies users are actually requesting.**

---

### Decision 2: Reddit post. Day 20. This is the last time this will be written.

N-hemisphere summer beach peak runs June 20 – August 20. We have burned 4 days of peak window. Every week of delay costs ~15% of the 90-day addressable audience (summer beach users drop off after Labor Day; the frugal-travel Reddit audience's interest in "where to go this weekend" weakens in fall).

The product is done. The pre-launch checklist has been green on all code items since June 10. The only remaining items are Jack-only actions that take 30 minutes total.

**There is no more technical work to do before the Reddit post.** If it isn't happening, the actual blocker needs to be named: Reddit karma too low? Post copy not ready? Jack's personal schedule? Address the real constraint — not the technical one.

Post order and copy from v67 are correct. Use them.

---

### Decision 3: lateSeason audit is a July sprint item. DEFER. Stop raising it pre-launch.

DevOps counts 25 `lateSeason: true` venues. Content says 6 legitimate glaciers. The delta (19 batch-format venues carrying the flag incorrectly) is suppressed by the snow_depth gate — they require `snow_depth_max >= 0.5m` to surface, which most won't see in summer. No user gets a bad venue score from this before July. Killington and coronet-peak (the ones that COULD fire incorrectly on US users) are already fixed.

**July sprint scope for lateSeason:** Remove flag from sub-2500m N-hem resorts in the batch section (Sugarloaf ME, Loon Mountain NH, Sunday River ME, and 5-8 others TBD). Keep flag on confirmed glaciers only: Zermatt, Tignes, Val Thorens, Engelberg, Verbier, Mammoth.

**This does not ship before Reddit post.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Reddit post. Today. r/frugaltravel first, then r/solotravel hour 2.**

Before posting:
```bash
# From Jack's local terminal (not sandbox — sandboxes block duckdns):
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
curl -s -o /dev/null -w "%{http_code}" https://j1mmychu.github.io/peakly/
```
Expected: VPS returns JSON with `wx_cache_size`. Site returns 200. Then post.

Post copy (first-person, no marketing):
> *"Built a free app that finds the best beach or ski spot to fly to THIS weekend — live weather + real flight prices from your home airport + a confidence score that tells you when the forecast is too shaky to trust. 370 spots globally. Brutally honest about uncertainty. Feedback welcome. [link]"*

**2. Jack: Supabase SQL paste.** While at the desk anyway, 2 minutes. `server/sql/delete-account.sql` → Supabase SQL editor.

**3. Agents: No new venue additions. Quality work only.** Tag enrichment + lateSeason audit queued for July sprint, not before launch.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|-------|
| New venue additions (any) | **FREEZE until post-launch data** | 370 is enough. Venue count isn't the problem. Distribution is. |
| Caribbean (Punta Cana, Nassau, Havana) | **DEFER July sprint** | Airport prereqs needed; not a launch day lever. |
| S. America beach venues | **DEFER July sprint** | No Plausible data supporting demand yet. |
| Tag enrichment (40 ski venues) | **DEFER July sprint** | Filter discoverability only. |
| lateSeason cleanup | **DEFER July sprint** | Snow-depth gate holds until then. |
| Seoul ski coverage | **DEFER July sprint** | Zero urgency pre-launch. |
| Scoring algorithm changes | **REJECT until post-launch data** | No user baseline. Pre-launch blast radius. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU if warranted. |
| SRI + CSP | **DEFER. Final.** | Babel `unsafe-eval` makes strict CSP impossible. |
| Wishlists / Trips tab unhide | **LOCKED at 1K MAU gate.** | No change. |

---

## Pre-Launch Checklist — June 24

| # | Item | Status |
|---|------|-------|
| 1–20 | All code items (scoring, cold-start, alerts honesty, account deletion UI, book_click, ToS links, ScoringExplainer, ALERTS_AVAILABLE, photo dedup) | ✅ All green |
| 21 | `tahoe` duplicate deleted (365 venues) | ✅ June 23 |
| 22 | `.venue-baseline` updated 365 → 370 | ✅ This run |
| 23 | **VPS `/health` green** | ❓ Jack: verify before posting (from local terminal) |
| 24 | **Supabase account deletion SQL** | ❌ Jack: 2 min |
| 25 | **Reddit post live** | ❌ **Jack: TODAY. Day 20.** |

---

## 90-Day Projection — June 24

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| Post today + r/frugaltravel top-5 | **3K–5K** | VPS confirmed, Jack in thread 3h with real fare data |
| Post today + strong personal data comment | **5K–8K** | First comment "found $180 RT to Cancún, score 88" → front page push |
| Post today + VPS down | **<1K** | Weather fails under spike, "broken at launch" narrative |
| Slips to July 7 | **2K–3K** | -30% ceiling. July 4 weekend noise. Beach narrative weakens. |
| Slips to August | **<2K** | Summer peak over. 100K goal moves to 2027. |

**For 8K not 5K:** Same levers as v67. VPS confirmed. Jack in thread. Personal data point comment. Top-5 in 6h. The levers haven't changed because we haven't launched.

---

## Revenue Model — June 24

| Stream | Status | RPM/1K MAU |
|--------|--------|------------|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS verify pending) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI / Backcountry / GYG | LLC pending | +$8.00/1K MAU when unlocked |

**Live RPM: $7.58/1K MAU.** Revenue is meaningless at current MAU. Launch is the only lever.

---

## One Product Risk Nobody Is Talking About

**We are burning peak summer inventory window while optimizing a product that has no users.**

This is the meta-risk. Every PM report since June 4 has said "post today." Every day the post slips, the agents add venues, fix lateSeason flags, audit photos, and bump cache stamps. All of that is internally coherent quality work. None of it matters if the product never reaches users.

The risk is not a technical one. The risk is that "launch-ready" becomes a permanent state — always one more fix, one more venue, one more verification — while the window where Peakly's beach + ski thesis is most compelling (N-hemisphere summer, S-hemisphere ski peak, both simultaneously) passes.

N-hemisphere beach season is June–August. S-hemisphere ski season is June–September. This is the only 8-week window where both halves of the catalog score high simultaneously. We are in week 1 of that window.

**There is nothing left to build. The action is distribution. Post today.**

---

*Written 2026-06-24 | PM v68 | Build: 20260624b | Venues: 370 (131 ski / 239 beach) | Reddit: Day 20 — TODAY, no exceptions*
