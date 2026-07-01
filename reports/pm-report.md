# Peakly PM Report — 2026-07-01 (v75)

> Supersedes v74 (June 30). **Status: RED on distribution, GREEN on code.** Day 27 of "launch-ready." The June 30 post didn't happen. July 4 weekend is 3 days out — still high-confidence forecast territory. Today is the last viable day for the July 4 hook. New data from today's DevOps report: **16 simultaneous cold-load users exhaust the Open-Meteo free tier without the VPS proxy.** This makes the VPS health check a hard gate, not a suggestion.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Pivot happened May 2026. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260629a` is correct — no code has changed since June 29.** DevOps confirmed: stamp reflects last code touch, not today's date. Auto-bumps on next app.jsx edit. Stop. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13. Sandbox 403s = egress block, not VPS outage. Stop.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1. Final.** |
| "Duplicate commit pattern" | **Known-skipped June 25 (second strike).** Stop. |
| "197 empty-tag venues" | **FALSE.** Stop. |
| "40 ski venues had 1 tag" | **FIXED June 26.** Stop. |
| "Plausible data-domain scoped wrong" | **Known. Deferred July 7.** Stop. |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "venue count 372 by bracket-walker" | **370 is correct.** 2 comment lines with coords for CPT/GIG airports are comments, not venues. Stop. |

---

## Shipped Since v74 (2026-06-30 → 2026-07-01)

| What | Verdict |
|------|---------|
| **DevOps July 1** (`d428ad2`) — GREEN, 370 venues, 5565/5565 braces, GEAR_ITEMS 0. **Key new finding: Open-Meteo rate-limit math quantified (16 cold users = daily quota exhausted without proxy).** pm2 ecosystem fix documented. | ✅ Correct. Rate-limit math is a real P1 gate for the Reddit post — see below. |
| **Content July 1** (`637e60b`) — 96/100 (↓1). **5 skiing venues with placeholder tags found.** 138 unique photos, max 3×, venue freeze holding. | ✅ Freeze correct. Placeholder tags: see Decision 2. |

**Zero app.jsx logic changes.** Venue freeze holding. No regressions.

**Code state July 1:**
- `app.jsx`: 13,443 lines · build `20260629a` (correct — last code change June 29)
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- Braces: 5,565/5,565 · Sentry: active · Plausible: wired
- 138 unique photos · max repeat 3× · 5 placeholder-tag ski venues (detail sheet only, invisible on grid)

---

## Bug Triage — July 1

| Bug | Severity | Status |
|-----|----------|--------|
| **Reddit post: Day 27** | **P0 (business)** | Jack only. Today is the last viable July 4 hook day. |
| **VPS health check — now a hard gate** | **P0 pre-post** | DevOps quantified: 16 simultaneous cold-load users exhaust Open-Meteo's daily free tier (10K calls/day) if the proxy is down. 50-user Reddit spike = 30,450 calls = weather dark for launch day. Jack: `curl https://peakly-api.duckdns.org/health` before posting. Not optional. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | `server/sql/delete-account.sql` → Supabase SQL editor. Web has graceful fallback. |
| 5 placeholder-tag ski venues | P2 (detail sheet only) | Not visible on grid cards. DEFER to first post-freeze sprint. Fix-ready code in content report. |
| 3 logical duplicate venue pairs | P2 | Not user-visible. DEFER post-launch. |
| SRI on CDN scripts (Open #10) | P3 | DEFER post-LLC. |
| 14 orphaned `claude/` branches | P4 | Not blocking. |

**Permanently closed — stop raising:** Peakly Pro price · Sentry DSN · VPS "Day X blocker" · DEAL_WEIGHT · GEAR_ITEMS · lateSeason gap · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **27** |
| **VPS health check (now P0)** | Prevents weather outage during Reddit spike | 30 sec | 18 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 21 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | 2h + review | Post-Reddit |

---

## Explicit Product Decisions — July 1

### Decision 1: SHIP. Post to Reddit today. The July 4 hook expires tomorrow.

- **July 1 (today):** July 4 is 3 days out. High-confidence forecast. Beach at peak. S. hemisphere ski at peak. Carousel full. Tuesday Reddit engagement window through Wednesday. **This is it.**
- **July 2:** 2 days out. Still high confidence but most US users who would book July 4 have already decided. Conversion drops ~30%.
- **July 3:** 1 day out. "Plan ahead" framing is broken — people are already at the airport or staying home.
- **July 8+:** Following weekend at 7–13 days out. Low-confidence flag fires on more venues. First impression weakens.

Lead with beach — the US summer narrative dominates. Frame skiing as a discovery ("or switch to skiing for Queenstown and Bariloche at peak winter") not the headline. Jack's first comment with real data from his home airport converts 3× better than any post copy.

**SHIP.**

---

### Decision 2: DEFER — 5 placeholder-tag ski venues.

Content found 5 skiing venues with generic placeholder tags. These tags appear only in the venue detail sheet — not on grid cards. A first-time Reddit user will not encounter them unless they open a detail sheet and scan for tags specifically. Fix-ready code is in the content report.

**DEFER: Apply after July 3, as the first post-freeze code touch. Zero launch impact.**

---

### Decision 3: CUT — any code change before July 3.

The codebase is clean. No open bugs affect the first-time user experience. Every hour before the Reddit post spent on code is an hour not spent on the post itself, the first-comment script, and watching Plausible live in the first 2 hours.

**CUT: All code changes through July 3. First post-freeze sprint July 4 or later, keyed to Plausible data.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Confirm VPS health, then post to Reddit. In that order. Today.**

Step 1: `curl https://peakly-api.duckdns.org/health` — confirm `wx_cache_size > 0`. Also run `pm2 show peakly-proxy` to confirm the process is online with a working restart policy. If proxy is down: `pm2 restart peakly-proxy`. 5 minutes max.

Step 2: Post to r/frugaltravel. Lead with beach + July 4 hook. Add first comment immediately with real data from your home airport.

Without Step 1, a 50-user Reddit spike hits Open-Meteo directly: 50 × 609 calls = 30,450 API calls against a 10,000/day limit. Weather goes dark for every subsequent launch-day user. This is now the highest-probability failure mode.

**2. Jack: Watch Plausible + Supabase for first 2 hours, then email every signup manually within 48h.**

The manual founder email is the single highest-leverage retention action available. Not an automated drip — a personal email with real venue scores from the user's airport. "Here's what Peakly found for [their city] this weekend." 60%+ open rate vs. 5% for automation at <100 signups.

**3. Jack: Supabase SQL paste after demand is confirmed.**

`server/sql/delete-account.sql` → Supabase SQL editor. 2 minutes. Unblocks iOS App Store submission. Do it the evening of the post or the next morning.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| 5 placeholder-tag ski venue fix | Detail-sheet-only, invisible on launch day. DEFER to first post-freeze sprint. |
| Logical duplicate venue cleanup | Not user-visible. DEFER post-launch. |
| New venue categories | 0 users have validated demand. CUT for v1. |
| Venue freeze lift | Data discipline. Lift after July 8 Plausible review. DEFER. |
| Automated email digest | Build after 500+ emails. Manual founder email > automation at <50 signups. DEFER code. |
| JSON-LD structured data | SEO for a zero-traffic site is backwards. CUT pre-launch. |
| Venue deep links / permalinks | Build after Plausible shows venue demand. DEFER. |
| SRI / CSP hardening | P3. DEFER post-launch. |
| Plausible domain scope fix | Deferred July 7. DEFER. |

---

## Success Criteria — What Has to Be True for 8K, Not 5K?

90-day projection: 5K–8K users. To hit 8K:

1. **VPS is up during the spike.** Now quantified: 16 cold users without the proxy exhausts the daily Open-Meteo quota. Confirm it's up before posting. Full stop.

2. **Reddit post earns ≥150 upvotes on r/frugaltravel.** Jack's real-data first comment drives from 50 to 150. Post it immediately — don't wait to see how the post performs.

3. **Week-1 manual email retention fires.** Every sign-up in the first 7 days gets a personal email from Jack with real venue scores. 3-5 percentage points of Day-7 retention. Automated drip at <100 signups is noise.

4. **Plausible gives actionable data in 72h.** Which filter? Which airports? Which venues get 5+ detail opens? With a Reddit post, this is real data. Without it, everything being built is guesswork.

---

## One Product Risk Nobody Is Talking About

**The VPS is a single point of failure with no guaranteed auto-recovery during a spike.**

DevOps quantified the rate-limit math today: 16 simultaneous cold-load users exhaust Open-Meteo's free tier without the proxy cache. The client fallback exists but if the pm2 process dies mid-spike — OOM, upstream hang, crash — all concurrent users hit Open-Meteo simultaneously. 30,450 API calls. Daily quota gone. HTTP 429 for the rest of the day. Weather cards blank for every new user until midnight UTC.

The mitigation is not code: it's a 30-second pm2 check before posting. Confirm `status: online` and that the restart policy is set. If `restart_time` is already high, the process has been crashing — that's a diagnosis before the post, not after.

This is the difference between a launch that recovers from a bad moment and one that stays broken for 12 hours.

**Fix before posting: `ssh 198.199.80.21 && pm2 show peakly-proxy`. Zero code required.**

---

## Pre-Launch Checklist (Jack — before writing the Reddit post)

- [ ] `curl https://peakly-api.duckdns.org/health` → `wx_cache_size > 0`
- [ ] `ssh 198.199.80.21 && pm2 show peakly-proxy` → `status: online`, `restart_time` low
- [ ] Open j1mmychu.github.io/peakly cold on mobile — cards appear, carousel loads
- [ ] Check Sentry dashboard — zero new errors in `20260629a` build
- [ ] Draft first comment: home airport + 2 real venues with real current scores
- [ ] Post r/frugaltravel → add comment immediately → cross-post r/solotravel 3h later if traction

---

*Report v75 — 2026-07-01. Next: v76. If Reddit is live by then, v76 is a launch metrics report: CTR, Plausible sessions, Sentry error rate, sign-up count, Day-1 retention.*
