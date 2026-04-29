# Peakly PM Report — 2026-04-28 (v28)

**Filed by:** Product Manager agent
**Date:** 2026-04-28
**Status:** YELLOW-GREEN. Three agents shipped today (DevOps + Content). Venue deduplication done. Weather proxy still the only hard gate on Reddit launch — Day 11.

---

## Shipped Since Last Report (2026-04-27 → 2026-04-28)

| Commit | What | Right call? |
|--------|------|-------------|
| `996710d` (Apr 28) | Sentry tracesSampleRate 1.0 → 0.05 + fetchJson() response body timeout fix | ✅ Sentry fix was critical — at 1.0, free tier burns out at ~667 MAU. Proxy timeout was open 48hrs. Both right. |
| `d0d837d` (Apr 28) | Delete 7 duplicate venue stubs (237 → 230), fix Whitefish airport GPI→FCA, add 5 new venues, expand ski gear items | ✅ Deduplication was P1 day 5. Airport fix was a data integrity error. Venue additions + gear expansion are additive. All right calls. |

**Summary:** Productive day. The duplicate venues problem is closed. Sentry was quietly burning its free quota — fixed before it mattered. Venue count now 235 (230 deduped + 5 new). The one remaining hard gate is the Open-Meteo weather proxy. Day 11.

---

## Permanent Bug Triage — Confirmed Closed

Do NOT re-flag without reading live code first.

| Issue | Status | Evidence |
|-------|--------|----------|
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. Email waitlist only. Prompt is stale. |
| Sentry DSN empty | **CLOSED** | `app.jsx:6-15` — real DSN, initialized. |
| Sentry tracesSampleRate burning quota | **CLOSED** | Fixed Apr 28 — 1.0 → 0.05 |
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` = "710303" |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema. |
| fetchJson response body timeout | **CLOSED** | Fixed Apr 28 — res.setTimeout(8000) in server/proxy.js |
| Cache buster stale | **CLOSED** | Bumped Apr 27 → v=20260427a / peakly-20260427 |
| "Next good window" not showing | **CLOSED** | bestWindow built, rendered at listing card lines 2099 and 2290. Live since March 27. |
| 6 duplicate venue pairs | **CLOSED** | Deleted Apr 28 — 237 → 230 (+ 5 added = 235 net). |
| Whitefish airport GPI→FCA | **CLOSED** | Fixed Apr 28 — was routing to Colombia. |

---

## Active Bug Triage — April 28

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit — no server-side cache** | **P1 LAUNCH BLOCKER** | ❌ Unresolved. ~28 cold sessions burns 10K/day free quota. | **Day 11** |
| **28 ski venues missing skiPass field** | P2 | ❌ Badge doesn't render, not scoring-critical | Day 5 |
| **Strike alerts: no background polling worker** | P2 | ❌ UI registers, never fires | Day 30+ |
| **No scoring explanation in onboarding** | P3 | ❌ Defer — no evidence users are confused yet | Day 30+ |

---

### P1 Detail: Open-Meteo Rate Limit (Day 11 — Still Not Deployed)

**Math:** 235 venues × ~1.5 calls = ~352 calls/cold session. Free tier: 10,000/day. Hard ceiling: ~28 concurrent cold sessions. One r/surfing post → 50 simultaneous new users → quota gone by noon → every subsequent visitor sees blank condition scores for the rest of the day.

**This is not a code problem.** The spec has been written and re-written across 11 consecutive DevOps reports. It is a 20-minute deployment action: SSH to VPS, add `/api/weather` and `/api/marine` endpoints with 30-min in-memory cache, restart the proxy.

**Reddit launch must not happen before this is live.**

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo server-side weather proxy** | Jack (VPS SSH) | Before any Reddit post |
| **Reddit launch date** | Jack — no date named | Entire roadmap is gated on this |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Deploy server-side Open-Meteo weather proxy to VPS.**
The only remaining hard gate. Spec written. 20-minute SSH session. If this doesn't ship before the Reddit post, the Reddit post breaks the app. Duplicate venues are now closed — this is the last item standing between "almost ready" and "ready."

**2. Name the Reddit launch date.**
The app has been "almost ready" since April 17. Duplicates are gone. Data is clean. Sentry is healthy. Cache is fresh. The only remaining blocker is the proxy. Jack: pick a day in the first week of May, ship the proxy before it, post. Everything else adapts.

**3. Delete 28 ski venue skiPass gaps (optional bundle).**
Low-effort polish — add missing `skiPass: "independent"` or `"epic"` or `"ikon"` to 28 ski venues. Badge renders. Bundle with the next commit. Not launch-blocking, but takes 20 minutes and improves Explore quality.

---

## Explicit Product Decisions — April 28

**1. Open-Meteo proxy: SHIP before Reddit. Day 11 is unacceptable.**
This is a 20-minute action, not a project. If it's blocked on Jack's calendar, name the day. If it's blocked on something technical, surface it now.

**2. Venue deduplication: CLOSED.**
Seven duplicate pairs deleted April 28. 237 → 235 net. Done. Do not re-audit without a specific reason.

**3. 28 ski venues missing skiPass: DEFER to post-Reddit.**
Missing badge, not missing scoring. Not launch-critical.

**4. Strike alerts background worker: CUT to post-1K users.**
Hard cut. No users, no reason to build the polling loop.

**5. Onboarding scoring explanation: DEFER to post-Reddit.**
P3. Wait for Reddit comments to validate whether users are actually confused.

**6. SRI hashes + CSP meta tag: DEFER — stop re-flagging.**
CSP blocks Babel inline eval. Post-launch hardening sprint. Do not re-surface before 100 users.

**7. Sentry tracesSampleRate: CLOSED.**
Fixed April 28 — 1.0 → 0.05. Was burning free tier at ~667 MAU threshold. Right call to fix now.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Push notification polling worker | **CUT until 1K MAU** | No users. Non-trivial build. |
| iOS App Store build | **DEFER** | Blocked on $99 Apple enrollment. External. |
| Wishlists / Trips tab reveal | **DEFER** | Locked at 1K users by design. Do not revisit. |
| Additional venue batch | **DEFER** | At 235 post-cleanup. Quality over quantity pre-launch. |
| Gear affiliate section (REI) | **DEFER** | LLC blocking REI. Wrong sprint. |
| Window Score v1 | **DEFER** | Weather proxy is harder and more important |

---

## Success Criteria

**5K MAU** = base case (organic SEO + 1 Reddit post that doesn't break)
**8K MAU** = requires all four:

1. **Weather proxy live on launch day.** Binary gate. Without it, viral traffic = broken app = dead thread.
2. **D7 retention > 20%.** bestWindow is live. Push alerts are the biggest remaining D7 lever — deferred until 1K MAU, so ceiling is lower until they ship.
3. **SEO compound by day 90.** JSON-LD live. Sitemap submitted. Monitor Search Console weekly — if impressions not growing by week 4, investigate.
4. **Two distributions.** r/surfing AND r/skiing posts in the same week. Same app, category-specific copy. Doubles addressable audience at launch.

---

## One Product Risk Nobody Is Talking About

**The app has been "almost ready" for 11 days — and there's still no launch date.**

Today's agents shipped real work: deduplication closed, Sentry fixed, data cleaned. The trajectory is right. But the proxy has been P1 for 11 consecutive days without shipping. At some point "almost ready" becomes the permanent state.

The seasonal window matters. r/surfing and r/skiing engagement peaks April through early May as people plan late-season and summer travel. Both subreddits go quieter by June. The addressable moment for an organic launch post is right now.

The app is post-ready today if the proxy ships tomorrow. Pick a date in the first week of May. Everything between now and then is 20 minutes of SSH time and one post.

*Report generated: 2026-04-28*
