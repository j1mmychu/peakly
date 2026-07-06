# Peakly PM Report — 2026-07-06 (v80)

> Supersedes v79 (July 5). **Status: GREEN on code, YELLOW on distribution.** Photo contamination P1 shipped today — most-reviewed venue (South Beach Miami, 42,800 reviews) was showing a ski mountain and now shows a beach. Venue freeze lifted. July 7 sprint opens tomorrow.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Pivot May 2026. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price appears. Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260706a` — bumped by DevOps today.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403s = egress block. Not VPS outage. Stop.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25).** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "Duplicate commit pattern" | **Known-skipped June 25.** Stop. |
| "197 empty-tag venues" | **FALSE. All 370 have tags.** Stop. |
| "40 ski venues had 1 tag" | **FIXED June 26.** Stop. |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "Venue freeze active" | **LIFTED July 6 per v76. Sprint opens July 7.** Stop. |
| "Cross-category photo contamination open" | **FIXED July 6 by DevOps (`73db399`).** Stop. |

---

## Shipped Since v79 (2026-07-05 → 2026-07-06)

| What | Verdict |
|------|---------|
| **DevOps July 6** (`73db399`) — **P1 photo fix**: south-beach-miami (42,800 reviews) + grace-bay-turks (2,109 reviews) now show beach photos, not ski mountains. Cache `20260705a`→`20260706a` in lockstep. Braces 5,565/5,565. | ✅ High-impact fix. Most-reviewed venue was showing a snow mountain — trust repair. |
| **Content July 6** (`6183c55`) — 5 new venues staged (Alpe d'Huez, St. Moritz, Saas-Fee, Les Deux Alpes, Cortina d'Ampezzo). 2 duplicate removals confirmed (bigsky + beach_miami). 5 placeholder-tag fixes staged. 27 surf-legacy tag removals staged. Venue freeze confirmed expired. | ✅ Sprint-ready staging. Photo URLs need browser verification before commit. |

**Code state July 6:**
- `app.jsx`: 13,444 lines · cache `20260706a` · braces 5,565/5,565
- **370 venues** (131 ski / 239 beach) → **368 post-sprint** (–2 duplicates)
- GEAR_ITEMS: 0 · lateSeason: 25 · 138 unique photos · max repeat 3×
- Sentry DSN: active · Plausible: wired (`j1mmychu.github.io` — domain scope fix is July 7)

---

## Bug Triage — July 6

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P0** | Sandbox can't read it. Jack: open plausible.io before touching any July 7 code. The data drives the sprint direction. |
| **Photo contamination** — beach venues showing ski photos | ~~P1~~ | **FIXED July 6** (`73db399`). Closed. |
| **VPS weather cache restart risk** | **P1** | Unverifiable from sandbox. Day 6 post-launch. Jack: `curl https://peakly-api.duckdns.org/health` — if `wx_cache_size == 0`, cache flushed since launch. 2-min SSH fix. |
| **Plausible `data-domain` scope** (tracks full `j1mmychu.github.io`, not `/peakly/`) | P2 | July 7 sprint. 2-min fix. Update Plausible dashboard AND index.html tag. |
| **Duplicate venues** (bigsky + beach_miami) | P2 | July 7 sprint. Staged in content report. |
| **5 placeholder-tag ski venues** (3 lateSeason — visible in July grid) | P2 | July 7 sprint. Staged. |
| **27 surf-legacy tags** | P2 | July 7 sprint. Detail-sheet only. Staged. |
| **Supabase SQL paste** (delete-account.sql) | P0 (App Store) · P3 (web) | Jack-only. 2 min. Day 28 open. Unblocks iOS App Store. |
| SRI on CDN scripts (Open #10) | P3 | DEFER post-LLC. |
| 14 orphaned `claude/` branches | P4 | Not blocking. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays · photo contamination (fixed today)

---

## Known Blockers

| Blocker | What It Unlocks | Days Open |
|---------|----------------|-----------|
| **Plausible read** | Sprint direction — all content decisions contingent | Day 6 post-launch |
| **VPS health verify** | Confirms whether Week-1 weather data was clean | Day 23 |
| **Supabase SQL paste** | iOS App Store Guideline 5.1.1(v) | Day 28 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |
| Apple Developer ($99) | App Store submission | Post-launch |

---

## Explicit Product Decisions — July 6

### Decision 1: July 7 sprint scope — confirmed and ordered.

Item 0 (photo fix) is done. Sprint starts at item 1 tomorrow.

| Order | Task | Time |
|-------|------|------|
| **1** | **Read Plausible + Sentry before writing any code** | 30 min |
| **2** | **Fix Plausible domain scope** (`j1mmychu.github.io` → `j1mmychu.github.io/peakly`) | 2 min |
| **3** | **Remove 2 duplicate venues** (bigsky + beach_miami → 368 venues) | 10 min |
| **4** | **Fix 5 placeholder-tag ski venues** (winter-park, copper-mountain, lake-louise, palisades-tahoe, brighton) | 15 min |
| **5** | **Remove 27 surf-legacy tags** | 20 min |
| **6** | **Add 5 staged venues** (Alpe d'Huez, St. Moritz, Saas-Fee, Les Deux Alpes, Cortina d'Ampezzo) | 30 min |
| **7** | **Supabase SQL paste** (Jack-only) | 2 min |
| **8** | **Jack: draft Week-1 retention email** (send July 10) | 20 min |

Item 6 caveat: all 5 staged photo URLs need browser verification before commit — run `node scripts/validate-venues.mjs` first. If any photos return 404, swap the ID before pasting.

Items deferred past July 7: photo dedup ≤2× (needs ~50 new verified photos), SRI hashes, JSON-LD, venue deep links.

**SHIP: Items 1–5 unconditional. Item 6 on photo URL verification. Items 7–8 are Jack.**

---

### Decision 2: Saas-Fee and Les Deux Alpes are the strategic additions for July.

Of the 5 staged venues, two matter right now for the summer ski narrative:
- **Saas-Fee** (ZRH, `lateSeason: true`): Year-round glacier. Europe's most famous summer ski destination. Missing from a 131-venue catalog is a credibility gap.
- **Les Deux Alpes** (GNB, `lateSeason: true`): Glacier summer ski + snowpark. Closes in August — add now or miss the window.

Both airports (ZRH, GNB) already in AIRPORT_COORDS and AP_CONTINENT. IDs are novel (grep-clean). The other three (Alpe d'Huez, St. Moritz, Cortina) are off-season N-hemisphere venues — they won't appear in the July grid but add catalog depth for autumn.

**SHIP: All 5 staged venues on July 7, conditional on photo URL verification.**

---

### Decision 3: Week-2 retention window opens July 11–13. Measure it.

- **Cohort:** unique visitors July 1–7 (post-launch)
- **Return gate:** did those users return July 11–14?
- **Measurement:** Plausible returning vs. new visitor split July 12–13
- **Target:** ≥20% Day-7 return without an email = product has pull
- **Jack: send Week-1 email July 10** — 3 sentences, 1 question. Highest-leverage non-code action this week.

If return rate is <10%, the onboarding hook becomes the next build priority ahead of venue adds.

**SHIP: Measure July 12–13. Report in v81.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Read Plausible before the July 7 sprint starts.**

Non-negotiable. If 80% of visitors filtered Beach, that changes content priorities. If Skiing got 40%+ and bounced, there's a seasonal framing problem that needs a copy fix before more ski venues are added. If total Week-1 visits were <200, distribution underperformed and we need a second post before building anything. Read the dashboard first.

**2. Execute July 7 sprint items 1–5.**

Unconditional — none require Plausible data to decide. Plausible domain fix (2 min). Remove 2 duplicates. Fix 5 placeholder-tag venues. Remove 27 surf-legacy tags. All staged, combined ~50 minutes. Better product regardless of what the dashboard shows.

**3. Jack: VPS check + Week-1 retention email this week.**

`curl https://peakly-api.duckdns.org/health` tells you whether weather proxy was warm during launch week. If `wx_cache_size == 0`, a restart happened and early users saw degraded scores — alternative explanation for any bounce anomaly before blaming the product. The Week-1 email (July 10 send) is the highest-leverage retention lever that doesn't require code.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| New venue categories (climbing, hiking, surf) | **CUT.** 2-category focus is the brand moat. Zero users have validated expansion. |
| Automated weekly email digest | **DEFER.** Infrastructure for an empty list. Manual founder email first. |
| Hotel integrations in deal score | **CUT for v1.** Scope creep. |
| JSON-LD / structured data | **DEFER.** SEO compounds on existing traffic, not absence of it. Post-first-100-users. |
| Venue deep links / permalink pages | **DEFER.** Build after Plausible shows >100 detail-sheet views/day on specific venues. |
| Photo dedup ≤2× | **DEFER.** Needs ~50 new verified beach photos. No Unsplash API key. Post-launch. |
| SRI hashes on CDN scripts | **DEFER post-LLC.** P3. Months-open. |
| Tag enrichment for 238 two-tag venues | **DEFER.** Wait for July 7 filter-click data to prioritize which categories need it. |

---

## Success Criteria — 8K vs 5K

Three gate metrics (unchanged):

1. **Week-1 unique visitors ≥ 2K** — distribution signal. Below 2K = repost in a different subreddit.
2. **Week-2 return rate ≥ 20%** — retention gate. Below 20% = onboarding hook is next build priority.
3. **Beach filter ≥ 40% of filter clicks in July** — seasonal narrative check. Below 40% = copy mismatch risk.

For 8K not 5K: organic referral loop kicks in by Week 4. If "share a weekend plan" isn't driving 5+ organic referrals/week by July 28, the ceiling is 5K without a second distribution push.

---

## One Product Risk Nobody Is Talking About

**South Beach Miami — 42,800 reviews, most-reviewed venue in the catalog — was showing a ski mountain photo during launch week. Fixed today. The question is how many first-impression users tapped that card, saw snow, and concluded the app was broken.**

Before drawing conclusions from Week-1 bounce data, Jack should do a 30-minute browser smoke test across the top 20 venues by review count. If any others show obviously wrong photos (mountain on a beach card, beach on a ski card), fix those before reading Week-2 data. Otherwise you're optimizing against a noisy baseline.

The structural fix: add a cross-category photo check to the content agent's audit protocol. The current grep detects photo ID overlap but not category mismatch. A two-line check on each photo ID — "does this photo also appear on venues of the opposite category?" — would have caught this in June before launch. Low cost, prevents the same class of error on future batch adds.

---

*Report v80 — PM agent, 2026-07-06. July 7 sprint opens tomorrow. v81 expected July 7 after the sprint — first Plausible data read, post-launch venue additions.*
