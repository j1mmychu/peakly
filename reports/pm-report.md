# Peakly PM Report — 2026-04-24 (v24)

**Filed by:** Product Manager agent
**Date:** 2026-04-24
**Status:** GREEN shipping week. Critical safety fixes landed. Remaining work: batch venue tag audit + weather rate-limit fix before Reddit launch.

---

## Shipped Since Last Report (2026-04-17 → 2026-04-24)

| Commit | What | Right call? |
|--------|------|-------------|
| `22b671c` (Apr 22) | Cache bust 20260422a + tanning marine fetch fix | ✅ Marine data was dead for beaches |
| `d45d83b` (Apr 22) | Remove cloudbreak-fiji-s21 + 2 dupes, fix mislabeled tags | ✅ P1 safety liability closed |
| `faf12ef` (Apr 22) | Remove punta-roca-s12 + supertubos-peniche-s18, fix catanduanes/snappers tags | ✅ 5 safety/credibility fixes total |
| `34a0dc4` (Apr 22) | Content data fixes | ✅ |
| `4d7baf1` (Apr 23) | DevOps report | Neutral |
| `969e24a` (Apr 23) | 4 new venues + Tioman airport fix | ✅ Good data depth |
| `feb9fb3` (Apr 23) | PM report | Neutral |
| `60c686c` (Apr 24) | DevOps report | Neutral |
| `adeb5b2` (Apr 24) | DevOps report + app.jsx fixes + fetchJson timeout fix | ✅ |

**Summary:** After a 5-day freeze post-April 17, April 22-23 shipped the most important cleanup since April 12. Five mislabeled/duplicate venues removed. Cache bumped. Venue count now ~228.

---

## Permanent Bug Triage Corrections

Confirmed closed. Do NOT re-flag without reading live code first.

| Issue | Status | Evidence |
|-------|--------|----------|
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` → `"710303"`. Live since Apr 10. |
| Sentry DSN empty | **CLOSED** | `app.jsx:7-8` — real DSN. |
| Email capture uses alert() | **CLOSED** | `app.jsx:3503` — real `fetch()` to `/api/waitlist`. |
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. Removed 2026-03-26. $79/yr is waitlist-only copy. |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema. |
| cloudbreak-fiji-s21 "All Levels" | **CLOSED** | Removed Apr 22. |
| supertubos-peniche-s18 dupe | **CLOSED** | Removed Apr 22. |
| punta-roca-s12 "Beginner Friendly" | **CLOSED** | Removed Apr 22. |

---

## Active Bug Triage — April 24

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Batch venue tag accuracy (~10 remaining)** | **P1** | ❌ `indicator-s22`, `capbreton-s27`, `matanzas-s17` tagged "Beginner Friendly" — unaudited | Day 1 |
| **Open-Meteo rate limit** | **P1** | ❌ ~228 venues × 1.5 calls = ~342/cold session. ~29 sessions burns free daily quota | Day 18 |
| **Cache buster `v=20260417a` / sw `peakly-20260417`** | P2 | ⚠️ 7 days old but matches last deploy. Must bump on next push. | Day 7 |
| **Strike alerts: no background worker** | P2 | ❌ Alerts tab registers but never fires | Day 30+ |
| **No scoring explanation in onboarding** | P2 | ❌ OnboardingSheet collects prefs, doesn't explain what scores mean | Day 30+ |
| **fetchJson() response body timeout** | P2 | ❌ Slow-drip proxy can hang indefinitely. Fix spec in devops-report.md | Day 1 |

### P1 Detail: Batch Venue Tags

April 22 fixed 5 confirmed safety issues. But ~10-20 batch-gen venues (`-s##` IDs) remain unaudited. Flagged candidates: `indicator-s22`, `capbreton-s27`, `matanzas-s17` — all tagged "Beginner Friendly." These are real surf breaks. Audit must complete before Reddit launch. 45-minute job. Estimate 2–3 more wrong tags remain.

### P1 Detail: Open-Meteo Rate Limit

~228 venues × ~1.5 calls = ~342 API calls per cold session. Open-Meteo free tier: 10,000/day. Ceiling: ~29 cold sessions before quota burns for the day. One r/surfing post → 100 visitors → quota gone → scoring breaks → the app's entire value prop disappears on the day it matters most. Fix spec written in devops-report.md (server-side weather proxy, 30-min in-memory cache). Requires VPS deploy.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Batch venue tag audit** | Dev — 45 min | Before Reddit |
| **Open-Meteo server-side weather proxy** | DevOps + Jack | Before Reddit |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Finish batch venue tag audit**
45 minutes. Check every `-s##` surfing venue for "Beginner Friendly" / "All Levels" accuracy. Last credibility gap before Reddit. Non-negotiable.

**2. Ship server-side weather proxy to VPS**
Launch killer if unresolved. Spec is written. Needs a VPS deploy session. Without it, a successful Reddit post = broken app within hours.

**3. "Next good window" copy below low scores**
One line under any score < 60: "Next good window: ~X days away" using the existing 7-day weather array. No new API calls. Directly addresses D1 bounce ("conditions suck, when should I come back?"). 30-minute build. Highest-leverage non-infrastructure feature available.

---

## Explicit Product Decisions — April 24

**1. Batch venue tag audit: SHIP this week.**
April 22 closed 5 confirmed issues. ~10–20 more `-s##` venues are unaudited. Close the list before the Reddit post.

**2. Weather proxy: SHIP before any Reddit post.**
Non-negotiable. Single highest-risk unresolved infrastructure item. Secondary to nothing.

**3. "Next good window" line: SHIP this sprint.**
Low effort, high retention impact. 30-minute code change in listing card UI. Has been "worth investigating" for two report cycles. Ship it.

**4. Onboarding scoring explanation: DEFER post-Reddit.**
Reddit comments are free UX research. Build for observed confusion, not imagined. Trigger: 3+ commenters ask "how does scoring work."

**5. Strike alerts background worker: DEFER until 500 users.**
Zero users using Alerts. VPS cron work is non-trivial. Hard defer.

**6. iOS App Store: DEFER until 500 users.**
PWA install on iOS is the day-0 path. Native after traction is proven.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Window Score v1 | **DEFER** | Weather proxy is harder and more important |
| Forecast Horizon | **DEFER** | Requires Window Score first |
| Trips / Wishlists tab | **DEFER** | 1K users minimum, standing decision |
| More venue additions | **DEFER this sprint** | Finish tag audit on existing 228 first |
| SRI / CSP hardening | **DEFER** | Could break Babel inline eval. Zero user benefit pre-launch. |

---

## Success Criteria

**What defines success:**
- 1,000 MAU within 90 days of Reddit launch
- 30-day retention > 25%
- Flight CTR > 8% per session
- Email list > 500 before any paywall

**For 8K, not 5K, by day 90:**

5K scenario: Reddit post with weather quota gap. 100 visitors drain the Open-Meteo daily quota. Hours 2–24 of the post: every new user sees zero scores. Thread dies. No re-engagement loop.

8K scenario: Weather proxy live. 500+ visitors, scoring works for all of them. "Next good window" copy converts visitors who see bad conditions but want to know when to return. Email list of 300+ means a second notification push compounds the first wave.

**The single most important lever:** Weather proxy before Reddit. Everything else is secondary.

---

## The One Risk Nobody Is Talking About

**The app has no answer to "when should I come back?"**

Peakly's core loop is: see scores → book flights → go. But for every user who arrives and sees mediocre conditions today, there is no hook. They bounce. They don't return.

The "Next good window" line is a 30-minute fix. The 7-day weather array is already in memory. It's the difference between sending users away empty-handed and earning a save, a return, and eventually a booking.

This feature has been flagged in two consecutive PM reports as "worth investigating." It has not shipped. The cost of shipping it is less than the cost of writing about not shipping it.
