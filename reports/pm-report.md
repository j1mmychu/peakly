# Peakly PM Report — 2026-04-27 (v25)

**Filed by:** Product Manager agent
**Date:** 2026-04-27
**Status:** YELLOW. Zero code shipped in 4 days. Three known P1s unresolved. Reddit launch is blocked on one infrastructure decision that only Jack can make.

---

## Shipped Since Last Report (2026-04-24 → 2026-04-27)

| Commit | What | Right call? |
|--------|------|-------------|
| `1889d27` (Apr 25) | DevOps report only — no code | ❌ Wasted a day filing about what needs to ship |
| `f760036` (Apr 25) | Merge + DevOps report — no code | ❌ Same |

**Summary: 4 days of zero code.** Last code commit was April 23. Last PM report (Apr 24) had three explicit top priorities. None of them shipped. The report loop is real: the team is writing about what to build instead of building it.

---

## Permanent Bug Triage Corrections

| Issue | Status | Evidence |
|-------|--------|----------|
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. Removed 2026-03-26. Waitlist-only copy at $79/yr. |
| Sentry DSN empty | **CLOSED** | `app.jsx:8` — real DSN live. |
| Cache buster stale | **P3 (conditional)** | `v=20260422a` / `peakly-20260422` — 5 days old but matches last deploy. Bump on next push. |
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` → `"710303"` |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema |

---

## Active Bug Triage — April 27

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit** | **P1 LAUNCH BLOCKER** | ❌ No server-side cache. ~29 concurrent cold sessions burns 10K/day free quota | Day 10 |
| **fetchJson response body timeout** | **P1** | ❌ Only request timeout exists. Response body can hang indefinitely. Fix is 5 lines, written in devops-report.md. Not deployed. | Day 3 |
| **capbreton-s27 "All Levels" tag** | P2 | ❌ Capbreton is intermediate-only. Batch tag audit was declared done but this one slipped. | Day 5 |
| **"Next good window" copy** | P2 | ❌ Has been Priority #3 for 3 consecutive PM reports. Not shipped. | Day 14 |
| **Strike alerts: no background worker** | P2 | ❌ Alerts tab registers but never fires | Day 30+ |
| **No scoring explanation in onboarding** | P3 | ❌ Defer until Reddit comments prove users are confused | Day 30+ |

### P1 Detail: Open-Meteo Rate Limit (Day 10 — Unresolved)

Free tier: 10,000 calls/day. Cold session: ~235 venues × ~1.5 calls = ~353 calls/user. Hard ceiling: **~28 cold sessions before daily quota is gone.** One r/surfing post → 50 concurrent users → quota burns before lunchtime → every new visitor for the rest of the day sees zero scores.

**This is not a code problem. It's a deployment problem.** The spec has been written in two consecutive DevOps reports. It needs Jack to SSH into the VPS and deploy the `/api/weather` and `/api/marine` endpoints with 30-min in-memory cache. Estimated deployment time: 20 minutes.

**Reddit launch must not happen before this is deployed.**

### P1 Detail: fetchJson Body Timeout (Day 3 — One VPS Deploy)

Exact fix already written in `reports/devops-report.md`. Add `res.setTimeout(8000, ...)` to the response stream in `server/proxy.js`. Same deploy session as the weather proxy — stack them.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo weather proxy deploy** | Jack (VPS SSH) | Blocks Reddit launch |
| **fetchJson body timeout** | Jack (VPS SSH) | Ships in same deploy session |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Deploy server-side weather proxy + fetchJson fix to VPS**
One SSH session. 20 minutes. Spec is already written. This is the only thing between Peakly and a Reddit launch. Every other priority is secondary until this is live.

**2. Ship "Next good window" copy**
This has been Priority #3 for three consecutive reports. Either ship it this sprint or formally cut it — perpetual deferral is a decision to not build it. 30-minute change in `ListingCard`. The 7-day weather array is already in memory. Logic: find first day in `venue.weather.daily` where score would be >65, show "Next good window: ~X days." No new API calls.

**3. Fix capbreton-s27 tag**
Change `"All Levels"` → `"Intermediate"` in `app.jsx:496`. Five-second edit. The batch venue audit was declared complete in the April 24 report but this one wasn't caught.

---

## Explicit Product Decisions — April 27

**1. Open-Meteo weather proxy: SHIP BEFORE REDDIT — non-negotiable.**
Ten days of reports agreeing it's a launch blocker. The spec is written. The only remaining action is a VPS deploy. Do it this week or set a hard date.

**2. "Next good window" copy: SHIP THIS SPRINT or formally CUT.**
Three consecutive reports. Being "deferred" for 14 days is not a defer — it's a quiet cut. Name the decision.

**3. Strike alerts background worker: CUT until 500 MAU.**
Zero users using Alerts. VPS cron is non-trivial work. Not worth the build until there are users to fire alerts to. Hard cut.

**4. Onboarding scoring explanation: DEFER — trigger is 3+ Reddit comments.**
Don't build for imagined confusion. Build for observed confusion. Reddit launch is the research event.

**5. iOS App Store: DEFER until 500 MAU.**
PWA install is sufficient for launch. Native wrapper is polish, not acquisition.

**6. SRI / CSP hardening: CUT pre-launch.**
Could break Babel inline eval. Zero user-facing benefit before launch. Medium security risk that's acceptable given zero current users.

**7. Batch venue tag audit: CLOSED — one line remains.**
capbreton-s27 is the only confirmed outstanding issue. Fix in next code commit.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Window Score v1 | **DEFER** | Infrastructure first. Weather proxy is the prerequisite. |
| Forecast Horizon | **DEFER** | Requires Window Score first |
| Trips / Wishlists tabs | **DEFER** | 1K users minimum. Standing decision. |
| More venue additions | **DEFER this sprint** | 235 venues is enough for launch |
| Push notification worker | **CUT until 500 MAU** | Standing decision formalized |
| Competitive feature research | **CUT** | Analysis is not shipping |

---

## Success Criteria

**What defines success:**
- 1,000 MAU within 90 days of Reddit launch
- 30-day retention > 25%
- Flight CTR > 8% per session
- Email list > 500 before any paywall

**For 8K, not 5K, by day 90:**

The difference is compounding. 5K scenario: weather proxy not live on launch day, quota burns, Day 1 thread dies. No email capture, no return hook. Flat growth.

8K scenario: weather proxy live → 500 visitors all see valid scores → "Next good window" copy captures the bounce → email list grows to 300+ in week 1 → second-wave notification push compounds the Reddit wave → SEO traffic starts at week 4 from longtail venue searches.

**The single most important lever this week:** Deploy the weather proxy. Not code it. Deploy it. The code is written.

---

## The One Risk Nobody Is Talking About

**The team is shipping reports, not product.**

Since April 23, four days have passed with zero code changes. The DevOps report correctly identified the weather proxy as a P1 launch blocker on April 17. It's now April 27. The spec has been written twice across two DevOps reports. Three PM reports have called it non-negotiable. The deploy hasn't happened.

This is an execution gap, not a prioritization gap. The priorities are clear. The spec is clear. The risk is clear. The missing ingredient is a 20-minute VPS SSH session that only Jack can initiate.

Every day without the weather proxy is a day the Reddit launch can't happen. That's the actual risk.
