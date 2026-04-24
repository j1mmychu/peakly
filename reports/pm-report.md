# Peakly PM Report — 2026-04-24 (v24)

**Filed by:** Product Manager agent
**Date:** 2026-04-24
**Status:** YELLOW — 7-day code freeze, P1 safety bug on production, rate-limit time bomb pre-launch.

---

## Shipped Since Last Report (2026-04-17 → 2026-04-24)

**Nothing shipped.** The only commit since April 17 was the PM report itself (`d039180`).

This is the third 6–7 day freeze in six weeks:
- April 2–8: freeze
- April 9–17: some fixes
- April 17–24: freeze

Pattern is clear. Execution cadence is the constraint, not scope.

---

## CLAUDE.md vs Reality — Status

Unlike April 17's report, the on-disk CLAUDE.md now matches reality. Venue count is 231 (content audit confirmed 87 tanning, 77 surfing, 67 skiing). Scoring fixes, algorithm holes, and TP_MARKER are all confirmed shipped in git. The drift issue from prior reports is resolved.

**Exception:** The "Peakly Pro $9/mo vs $79/yr" task in the agent prompt file is a ghost. This bug was confirmed closed on April 11 — no Pro pricing UI exists anywhere in app.jsx. The email waitlist is the only Pro surface. Stop triaging this.

---

## Bug Triage — April 24

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **`cloudbreak-fiji-s21` tagged "All Levels"** | **P1** | ❌ LIVE on production | Day 13 |
| **`supertubos-peniche-s18` duplicate** | P2 | ❌ LIVE (inferior duplicate, same break) | Day 7 |
| **Cache buster `v=20260417a`** | P1 | ⚠️ 7 days stale — users on old code | Day 7 |
| **Open-Meteo rate limit** | P1 | ❌ 231 venues, ~66 cold sessions = quota gone | Day 17 |
| **Strike alerts: no background worker** | P2 | ❌ Alert tab is a dead-end UX (registers but never fires) | Day 30+ |
| **No scoring explanation in onboarding** | P2 | ❌ OnboardingSheet collects prefs but never explains scores | Day 30+ |
| Sentry DSN | ✅ LIVE | `app.jsx:8` — configured and loading via CDN | — |
| TP_MARKER | ✅ SET | `app.jsx:1593` → `"710303"` | — |
| Peakly Pro $9/mo | ✅ CLOSED | No Pro UI in codebase. Ghost from March. Stop triaging. | — |

### P1 Detail: `cloudbreak-fiji-s21` (app.jsx line 493)

Tags: `"Beach Break", "All Levels", "Consistent Swell", "Longboard Friendly"`

Reality: Cloudbreak is a boat-access expert reef barrel off Tavarua, Fiji. It has killed and permanently injured surfers. A beginner routing here on "All Levels" is a liability. The correct `cloudbreak` entry already exists (line ~391, accurate tags). **Delete line 493. 30 seconds. 13 days overdue.**

### P1 Detail: Cache Buster

`index.html:346` → `app.jsx?v=20260417a`. Any code fix shipped today won't reach any user who loaded the app in the past week without a cache bump. Must bump to `20260424a` with every push.

### P1 Detail: Open-Meteo Rate Limit

231 venues × ~1.5 API calls each = ~346 calls per cold session. Open-Meteo free tier: 10,000 calls/day. That's **~29 cold sessions** before the daily quota burns. One r/surfing post drives 100+ visitors → quota gone in minutes → all subsequent users see blank condition scores → app's core value proposition disappears on the one day it matters most.

**Fix:** Add `/api/weather` endpoint to VPS proxy with 30-min in-memory cache. All users share server-side cache. DevOps report (April 17) already wrote the implementation in full. This requires VPS deploy — Jack must authorize or DevOps agent must own it.

---

## Known Blockers

| Blocker | Owner | Action |
|---------|-------|--------|
| **cloudbreak safety tag** | Dev — 30 sec | Delete line 493 from app.jsx + bump cache buster |
| **Open-Meteo rate limit** | DevOps + Jack | Deploy server-side weather proxy (spec ready in devops-report.md) |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |
| **Venue dedup (-8 batch dupes)** | Dev — 30 min | Drop to ~223 venues, quality ↑ from 73 → 80+ |

---

## This Week's Top 3 Priorities Only

**1. Delete cloudbreak-fiji-s21 + supertubos-peniche-s18 + bump cache buster**
30 minutes total. P1 safety liability gone. Touches only lines 490 and 493. No risk. No reason to wait.

**2. Deploy server-side weather proxy to VPS**
Non-negotiable before Reddit launch. The spec is already written (devops-report.md). Without it, a successful launch = broken app. With it, 10K visitors can cold-load the app and scoring works for all of them.

**3. Add scoring explanation to onboarding**
The OnboardingSheet (app.jsx:5171) walks users through name/sport/airport. It never explains *why scores matter* or what "best window" means. First-time users who don't get it bounce. One extra step, 3 bullets, 30 min. This is the retention unlock for the 5K → 8K delta.

Everything else deferred.

---

## Explicit Product Decisions — April 24

**1. cloudbreak-fiji-s21: SHIP TODAY.**
Delete line 493. Not a discussion. Liability on production for 13 days.

**2. Weather proxy: SHIP before Reddit launch.**
Without it, launch success = launch failure. This is the single highest-risk unresolved item. Treat it as a P0 blocker for any next Reddit post.

**3. Onboarding scoring explanation: SHIP this week.**
Not a big feature. One step added to OnboardingSheet. "Here's how the score works: conditions + flights + timing = your window. Higher = go now." 30 minutes. Directly increases activation rate.

**4. Venue dedup (8 batch-gen entries): SHIP this week.**
30 minutes. Drop ~8 dupes. Score: 73 → 80. These are orphaned batch-gen entries with wrong difficulty tags and inferior data vs. the canonical entries already in the list.

**5. Strike alerts background worker: DEFER.**
Alerts tab has no real users yet. Build this when 50+ users have set alerts. Before then, it's gold-plating.

**6. iOS App Store: DEFER until 500 users.**
$99 + Xcode time + App Store review process. PWA install on iOS is the 0-day path. Native post-traction.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Window Score v1 | **DEFER** | Server-side weather proxy is harder and more important |
| Forecast Horizon | **DEFER** | Requires Window Score to mean anything |
| Trips / Wishlists tab launch | **DEFER** | 1K users minimum, per standing decision |
| JSON-LD structured data | **DEFER this sprint** | 81% SEO is fine pre-launch; fix P1s first |
| Peakly Pro pricing UI | **DEFER** | No users, no LLC, no Stripe. Email waitlist is correct strategy. |
| New venue additions | **DEFER** | Fix data quality before adding volume. 73/100 is the problem, not count. |

---

## Success Criteria

**What defines success:**
- 1,000 MAU within 90 days of Reddit launch
- 30-day retention > 25%
- Flight CTR > 8% per session
- Email list > 500 before paywall

**For 8K users, not 5K, by day 90:**

The 5K scenario: Launch with weather quota gap. First 200 visitors fill the quota. Subsequent visitors see 0 scores. Subreddit thread: "app is broken." Thread dies. No re-engagement loop.

The 8K scenario: Weather proxy live. Reddit post drives 500 visitors; scoring works for all of them. Onboarding explains scores; 60% activate vs. 30% today. Email list of 200+ pre-launch means re-engagement on second post. Retention flywheel starts.

**The exact lever:** Ship the weather proxy before any Reddit post. Everything else is noise until that's done.

---

## The One Risk Nobody Is Talking About

**Execution cadence, not feature scope, is the 100K blocker.**

Three 6–7 day freezes in six weeks. The app is functionally good. The algorithm is solid. The data (mostly) works. Peakly will not reach 100K downloads because it lacks features — it will fail because it builds momentum in bursts separated by week-long gaps.

Reddit timing is perishable. r/surfing and r/skiing have news cycles. A post that would have blown up in week 1 of a swell season lands flat in week 2. Peakly's window for "first mover in live-conditions + flights" is not infinite. Every week of freeze is a week of compound disadvantage against any competitor who ships daily.

The product risk is not what's on the roadmap. It's whether anyone is actually shipping.
