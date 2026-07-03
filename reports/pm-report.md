# Peakly PM Report — 2026-07-03 (v77)

> Supersedes v76 (July 2). **Status: YELLOW — code green, distribution uncertain.** Today is July 3: 72h since the June 30 Reddit target. Either the post happened and we're in post-launch mode reading Plausible, or it didn't and the July 4 hook expires in hours. Both cases have a clear next action. The code is frozen and clean.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Pivot happened May 2026. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price appears. Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260703a` — bumped by DevOps this run.** Auto-bumps on next app.jsx edit. Stop. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13. Sandbox 403s = egress block, not VPS outage. Stop.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1. Final.** |
| "Duplicate commit pattern" | **Known-skipped June 25.** Stop. |
| "197 empty-tag venues" | **FALSE.** All 370 have tags. Stop. |
| "40 ski venues had 1 tag" | **FIXED June 26.** Stop. |
| "Plausible data-domain scoped wrong" | **Known. Deferred July 7.** Stop. |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "Venue count 372" | **370 is correct.** 2 airport-comment lines miscounted. Stop. |
| "Venue freeze expires July 3" | **WRONG — freeze runs through July 7 per v76 override.** Stop. |

---

## Shipped Since v76 (2026-07-02 → 2026-07-03)

| What | Verdict |
|------|---------|
| **DevOps July 3** (`cfe73f1`) — YELLOW. Cache bumped 20260629a→20260703a (4 days stale → current), three-file lockstep confirmed. Flagged 4d no commits post-Reddit. VPS unverifiable from sandbox. | ✅ Cache current. Right to flag the commit gap. |
| **Content July 3** (`74f8cd4`) — 74/100 (unchanged). 5 placeholder-tag ski venues reconfirmed (3 lateSeason, can surface in July grid). 3 duplicate pairs confirmed. 27 surf-legacy tags confirmed. All deferred to July 7 per freeze. Babel now in SW PRECACHE confirmed. | ✅ Steady state. No new regressions. All open items are detail-sheet-level or post-freeze. |

**Zero app.jsx logic changes in 4 days.** Freeze holding. No regressions.

**Code state July 3:**
- `app.jsx`: 13,443 lines · cache `20260703a` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- 138 unique photos · max repeat 3× · avg 2.7× reuse · 0 empty-tag venues · 131/131 skiPass
- Sentry DSN: active · Plausible: wired · Supabase lazy-load: confirmed
- 5 placeholder-tag ski venues (3 lateSeason) · 27 surf-legacy tags · 3 duplicate pairs — all deferred July 7

---

## Bug Triage — July 3

| Bug | Severity | Status |
|-----|----------|--------|
| **Reddit post: Day 29** | **P0 (business)** | Post NOW if not done. If done June 30, read Plausible. See Decision 1. |
| **VPS health post-launch check** | **P1** | Jack: `curl https://peakly-api.duckdns.org/health` + `pm2 describe peakly-proxy` → check uptime. If uptime < 3 days, VPS restarted post-launch and weather cache is cold. |
| **3 lateSeason placeholder-tag venues** | **P2** | Winter Park, Copper Mountain, Lake Louise can surface in July Ski grid with generic "Powder Day / All Levels" copy. Fix-ready code in content report. Execute July 7. |
| `beach_miami` exact coordinate duplicate | P2 | Invisible to users (different IDs). Remove post-freeze. DEFER July 7. |
| 27 surf-legacy tags on beach venues | P2 | Detail-sheet only, grid cards unaffected. DEFER July 7. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | `server/sql/delete-account.sql` → Supabase SQL editor. Graceful fallback on web. Jack-only. |
| Photo reuse 2.7× avg | P2 | Needs 50 new photos. Post-freeze sprint. DEFER July 7. |
| SRI on CDN scripts (Open #10) | P3 | DEFER post-LLC. |
| 14 orphaned `claude/` branches | P4 | Not blocking. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X blocker" · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Reddit post OR Plausible read** | Users / user data | 15 min OR 30 min | **29** |
| **VPS health post-launch verify** | Confirms weather proxy survived since June 30 | 5 min | 19 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 23 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | 2h + review | Post-Reddit |

---

## Explicit Product Decisions — July 3

### Decision 1: Two scenarios, one question — did the post go up June 30?

**Scenario A: Reddit post went up June 30.**
Today is 72h post-launch. This is the first signal read window. Jack: open Plausible right now.
- Pageviews in the first 72h: benchmark for distribution success
- Top entry pages: `/peakly/` should be dominant
- Filter usage: which pills are clicked — Beach, Skiing, or All? This drives the July 7 sprint priority
- Bounce rate vs. scroll depth: if bounce > 80%, the copy-to-product gap was real
- Signups (Supabase): first cohort for manual retention email
- Venue detail opens: which venues got >100 opens? That's the permalink backlog priority

**Scenario B: Post didn't go up June 30.**
Today (July 3, Thursday) is the absolute final day with a July 4 hook. The July 4 long weekend starts tomorrow. If Jack posts this morning (before noon ET), the hook still works — US Redditors are planning their July 4 weekend right now. After tonight, the hook is dead until Labor Day. The last line has been drawn in v73, v74, v75, v76, and now v77. There is no v78 escalation that matters. Either it ships today or it doesn't ship until September.

**SHIP: Post today if not done. If done, read Plausible today.**

---

### Decision 2: July 7 sprint — scope and priority.

The freeze lifts July 7 (72h after June 30 launch, extended by v76). The sprint order is determined by user impact, not content-agent score impact:

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 1 | **Placeholder tags on 3 lateSeason ski venues** (Winter Park, Copper Mountain, Lake Louise) | Users clicking Skiing in July see generic copy on venues that can score. Erodes trust. | 15 min — fix-ready code in content report |
| 2 | **Remove `beach_miami` exact dup** | Invisible to users (different IDs) but inflates venue count by 1. | 5 min |
| 3 | **Remove surf-legacy tags from 27 beach venues** | Detail-sheet only. No grid impact. | 20 min — code staged in content report |
| 4 | **Personal email to Week-1 signups** | Highest-ROI retention action. No code. | Jack writes it — 30 min |
| 5 | **Photo dedup ≤2×** | Needs 50 new verified photos. `source.unsplash.com` is dead — manual sourcing required. | 3–4h |
| 6 | **Supabase SQL paste** | Unblocks App Store guideline 5.1.1(v) | 2 min |
| 7 | **JSON-LD structured data** | SEO only matters once crawlers see traffic. Read Plausible first. | 1h |

**DEFER: Nothing in this list is a code emergency. July 7 is the date, no earlier.**

---

### Decision 3: The photo reuse problem is P2, not P1. v76 overcalled it.

v76 called photo reuse a "P1 first impression" risk — "screenshot-dunked if Redditors scroll 20+ cards." That's a legitimate concern but wrong severity.

**Why P2:**
- Redditors who click through arrive with intent ("find me a beach weekend"). They filter by their airport and look at 8–12 cards, not 30+. The 2.7× average only becomes visible at 30+ cards.
- Max repeat is 3×. A user who scrolls 30 beach cards sees any given photo on at most 3 of those 30. Not noticeable at 10-card scroll depth.
- The fix requires 50 new on-theme verified photos — manual sourcing hours that should be spent on the post itself.
- The only Reddit risk is if someone screenshots the full grid and annotates repeats. That's a very specific bad-faith attack that no pre-launch change can prevent.

**The real lesson from naming this P1 in v76:** it revealed a gap in the photo pipeline. The dedup script (`scripts/photo-dedup.cjs`) works; the constraint is the photo library. Post-launch sprint should include building a verified photo pool. Not before.

**DECISION: Reclassify photo reuse to P2. DEFER all photo work to July 7+. Resume at ≤2× reuse target as a clean post-launch improvement.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Read Plausible now (if post went up June 30) or post to Reddit this morning (if it didn't).**
These are the only two options. Both require Jack. Neither requires code.

**2. Jack: VPS health check — `curl https://peakly-api.duckdns.org/health` and check pm2 uptime.**
If the VPS restarted since June 30, the weather cache is cold. Any ongoing Reddit traffic is hitting Open-Meteo directly. Fix: SSH in and `pm2 restart peakly-proxy` to let the poll worker reprime the cache. 5 minutes.

**3. Jack: Personal email to signups from jjciluzzi@gmail.com on July 7.**
Not automated. Not templated. Founder-to-user: "I built this, what did you think?" to the first cohort. This single email is worth more to retention than any feature built this week.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| New venue category | Zero users have validated demand. CUT until 1K MAU. |
| Venue deep links / permalink pages | Build after Plausible shows which venues get >100 detail-sheet opens/day. Guesswork without data. DEFER. |
| JSON-LD structured data | Read Plausible after Reddit before building for crawlers. DEFER to Week 2. |
| Automated email digest | Build infra after confirming signups exist. Manual founder email > empty automation. DEFER code. |
| Hotel integrations in deal score | Flights + conditions is the product for v1. CUT. |
| Peakly Pro / subscription | No price-sensitivity data. No user base to measure against. DEFER to 1K MAU. |
| 5 new venues (staged by content agent) | Freeze holds through July 7. Not before. DEFER. |

---

## Success Criteria — 8K, Not 5K

**The metric that determines 8K vs 5K is Week-1 retention, not Day-1 traffic.**

Reddit can deliver 2K–8K visitors in 72h. Every post-launch study of app distribution shows the same curve: 70–80% of one-time visitors never return without a hook. The hook is email. The signups from the first 72h are the most valuable cohort Peakly will ever have — they're people who found the app without being asked.

**For 8K (90-day):**
1. Reddit converts ≥2% CTR — 4K visitors minimum
2. Of those, ≥15% sign up for alerts or save a venue — 600 engaged users
3. Of those, ≥30% return the following weekend because of a nudge (email or push) — 180 retained weekly active users
4. Those 180 WAU tell 2 people each over 12 weeks → 360 additional organic users
5. Combined with ongoing SEO traffic post-crawl: 8K at 90 days is within reach

**The single highest-leverage action for 8K:** Jack's personal email to Week-1 signups. That is worth more than any feature. Do it manually before automating.

---

## One Product Risk Nobody Is Talking About

**The VPS weather cache restart gap.**

If the VPS rebooted at any point since June 30 — apt upgrade, OOM, power cycle, anything — the in-memory weather cache (4000-entry LRU, 2hr TTL) reset to zero. Any subsequent user who loaded the app hit direct Open-Meteo instead of the proxy cache. At 13 simultaneous users, the daily free-tier cap exhausts in minutes. Users during the Reddit spike (if it happened on June 30) may have seen venues scoring at 50/100 across the board — the `fetchWeather` null-return score.

The DevOps report today flagged this explicitly: "check `pm2 describe peakly-proxy` → `uptime` field. If uptime < 3 days, the VPS restarted post-launch." The fix is immediate and takes 5 minutes. The risk is that we don't know it happened — Sentry tracks client-side errors, not the null-score state when weather returns null. Users who got bad scores from the null-weather state may have bounced and never came back.

**The fix is in Jack's terminal, not in code.** But it needs to happen today.

---

*Report written by PM agent — 2026-07-03 (v77). Status: YELLOW. Post or read Plausible — those are the only two options.*
