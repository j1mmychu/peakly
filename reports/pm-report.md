# Peakly PM Report — 2026-04-27 (v27)

**Filed by:** Product Manager agent
**Date:** 2026-04-27
**Status:** YELLOW. Two items shipped today (DevOps). The weather proxy is still the only thing blocking Reddit launch — day 10.

---

## Shipped Since Last Report (2026-04-26 → 2026-04-27)

| Commit | What | Right call? |
|--------|------|-------------|
| `91e7231` (Apr 27) | Cache bust 20260422a → 20260427a + proxy response body timeout fix | ✅ Both were outstanding P1/P2 items. Right call. |

**Summary:** One productive DevOps commit. Cache buster was 5 days stale; users on cached service workers were seeing the April 22 build. Proxy body timeout closed a hanging-connection risk. Both fixes were overdue. Open-Meteo rate limit and duplicate venues remain open.

---

## Permanent Bug Triage — Confirmed Closed

Do NOT re-flag without reading live code first.

| Issue | Status | Evidence |
|-------|--------|----------|
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. $79/yr is waitlist copy only. Prompt is stale. |
| Sentry DSN empty | **CLOSED** | `app.jsx:6-15` — real DSN, initialized. |
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` = "710303" |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema. |
| fetchJson response body timeout | **CLOSED** | Fixed Apr 27 — res.setTimeout(8000) in server/proxy.js |
| Cache buster stale | **CLOSED** | Bumped Apr 27 → v=20260427a / peakly-20260427 |
| "Next good window" not showing | **CLOSED** | bestWindow built, rendered at listing card lines 2099 and 2290. Live since March 27. |

---

## Active Bug Triage — April 27

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit — no server-side cache** | **P1 LAUNCH BLOCKER** | ❌ Unresolved. ~28 cold sessions burns 10K/day free quota. | **Day 10** |
| **6 confirmed duplicate venue pairs** | P1 | ❌ Still in codebase | Day 4 |
| **28 ski venues missing skiPass field** | P2 | ❌ Badge doesn't render, not scoring-critical | Day 4 |
| **Strike alerts: no background polling worker** | P2 | ❌ UI registers, never fires | Day 30+ |
| **No scoring explanation in onboarding** | P3 | ❌ Defer — no evidence users are confused yet | Day 30+ |

---

### P1 Detail: Open-Meteo Rate Limit (Day 10 — Still Not Deployed)

**Math:** 237 venues x ~1.5 calls = ~356 calls/cold session. Free tier: 10,000/day. Hard ceiling: ~28 concurrent cold sessions. One r/surfing post sending 50+ simultaneous new users → quota gone before lunchtime → every subsequent visitor sees blank condition scores for the rest of the day.

**This is not a code problem.** The spec has been written and re-written across 10 consecutive DevOps reports. It is a deployment action: SSH to VPS, add /api/weather and /api/marine endpoints with 30-min in-memory cache, restart the proxy. Estimated time: 20 minutes.

**Reddit launch must not happen before this is live.**

### P1 Detail: 6 Confirmed Duplicate Venue Pairs (Day 4)

| Delete | Keep | Category |
|--------|------|----------|
| aspen-snowmass-s7 | aspen | skiing |
| arapahoe-basin-s9 | abasin | skiing |
| anchor-point-s19 | anchor_point | surfing |
| taghazout-s10 | taghazout | surfing |
| pasta-point-s24 | pasta_point | surfing |
| pigeon-point-t27 | beach_tobago | tanning |

237 → 231 venues. 30-minute app.jsx edit. Bundle with the next code commit.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo server-side weather proxy** | Jack (VPS SSH) | Before any Reddit post |
| **6 duplicate venue deletions** | Dev — 30 min | Before Reddit |
| **Reddit launch date** | Jack — no date named | Entire roadmap is gated on this |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Deploy server-side Open-Meteo weather proxy to VPS**
This is the only hard gate on Reddit launch. Spec is written (devops-report.md). Needs one SSH session with Jack. If this doesn't ship this week, there is no Reddit post this week.

**2. Delete the 6 confirmed duplicate venue pairs**
30 minutes in app.jsx. 237 → 231 venues. Cleaner Explore, no duplicate cards. Bundle with any other code change.

**3. Name the Reddit launch date**
The app has been "almost ready" since April 17. Without a date, priorities float indefinitely. Pick a day. Work backwards from it. Everything gates on this.

---

## Explicit Product Decisions — April 27

**1. Open-Meteo proxy: SHIP this week or rename it "deferred."**
Day 10. It will not deploy itself. Jack needs to SSH in. Everything else is secondary.

**2. 6 duplicate venue deletions: SHIP in next code commit.**
Zero risk. 30 minutes. Overdue.

**3. 28 ski venues missing skiPass: DEFER to post-Reddit.**
Missing badge, not missing scoring. Not launch-critical.

**4. Strike alerts background worker: CUT to post-1K users.**
Hard cut. No users, no reason to build the polling loop.

**5. Onboarding scoring explanation: DEFER to post-Reddit.**
P3. Wait for Reddit comments to validate whether users are actually confused.

**6. SRI hashes + CSP meta tag: DEFER — stop re-flagging.**
Known item. CSP blocks Babel inline eval. Post-launch hardening sprint. Do not re-surface before 100 users.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Push notification polling worker | **CUT until 1K MAU** | No users. Non-trivial build. |
| iOS App Store build | **DEFER** | Blocked on $99 Apple enrollment. External. |
| Wishlists / Trips tab reveal | **DEFER** | Locked at 1K users by design. Do not revisit. |
| Additional venue batch | **DEFER** | At 237 pre-cleanup. Fix existing before adding. |
| Gear affiliate section | **DEFER** | LLC blocking REI. Wrong sprint. |

---

## Success Criteria

**5K MAU** = base case (organic SEO + 1 Reddit post that doesn't break)
**8K MAU** = requires all four:

1. **Weather proxy live on launch day.** Binary gate. Without it, viral traffic = broken app = dead thread.
2. **D7 retention > 20%.** bestWindow already helps. Working push alerts are the biggest D7 lever — deferred until 1K MAU, so D7 ceiling is lower until they ship.
3. **SEO compound by day 90.** JSON-LD live. Sitemap submitted. Monitor Search Console weekly — if impressions not growing by week 4, investigate.
4. **Two distributions.** r/surfing AND r/skiing posts in the same week. Same app, category-specific copy. Doubles addressable audience at launch.

---

## One Product Risk Nobody Is Talking About

**The app has been "almost ready" for 10 days — and there's no launch date.**

Every report since April 17 says "before Reddit." The proxy spec has been written. The dupes are identified. The bugs are fixed. The delay is not technical — it's a decision to not launch yet. That's fine if it's intentional. But if it's just inertia, the cost is compounding: every day without Reddit traffic is a day of zero organic discovery, zero email captures, and zero feedback to improve on.

The app is good enough to post today if the proxy ships tomorrow. Waiting for perfect is a decision to never ship. Jack names the date. Everything else falls into place.
