# Peakly PM Report — 2026-04-25 (v25)

**Filed by:** Product Manager agent
**Date:** 2026-04-25
**Status:** YELLOW — No code shipped today. Open-Meteo rate limit is now Day 9 unresolved and has formally crossed from P1 into P0. Any Reddit post before this is fixed is a self-inflicted bomb.

---

## Shipped Since Last Report (2026-04-24 → 2026-04-25)

| Commit | What | Right call? |
|--------|------|-------------|
| `1889d27` (Apr 25) | DevOps report | Neutral |
| `f760036` (Apr 25) | Merge + DevOps report | Neutral |

**Nothing shipped.** The right move today was to ship the weather proxy or complete the venue tag audit. Neither happened.

---

## Permanent Bug Triage — Do NOT Re-Flag Without Reading Code First

| Issue | Status | Evidence |
|-------|--------|----------|
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` → `"710303"` |
| Sentry DSN empty | **CLOSED** | `app.jsx:6-15` + `index.html` — live DSN |
| Email capture uses alert() | **CLOSED** | `app.jsx:3509` — real `fetch()` to `/api/waitlist` |
| **Peakly Pro showing $9/mo** | **CLOSED** | No Pro UI anywhere in `app.jsx`. Zero matches for `$9`, `per month`, or `/mo` strings. Removed 2026-03-26. The $79/yr figure appears only in waitlist copy, not as a price tag. |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema |
| cloudbreak-fiji-s21 safety tags | **CLOSED** | Removed Apr 22 |
| punta-roca-s12 "Beginner Friendly" | **CLOSED** | Removed Apr 22 |

---

## Active Bug Triage — April 25

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit** | **P0 (escalated from P1)** | ❌ Unresolved | Day 9 |
| **Batch venue tag audit** | P1 | ❌ ~6–8 `-s##` venues unaudited | Day 2 |
| **Cache buster `v=20260417a`** | P2 | ⚠️ 8 days old — bump on next push | Day 8 |
| **Strike alerts: no background worker** | P2 | ❌ Registers but never fires | Day 30+ |
| **fetchJson() response body timeout** | P2 | ❌ Slow-drip proxy can hang indefinitely | Day 2 |
| **No scoring explanation in onboarding** | P3 | ❌ New users have no context | Day 30+ |

### P0 Escalation: Open-Meteo Rate Limit

This was P1 for 8 days. It's P0 now because the Reddit post is the single highest-leverage growth action available, and the app cannot survive viral traffic without a server-side weather cache.

**Math:**
- 233 venues × ~1.5 calls = ~350 calls/cold session
- Open-Meteo free tier: 10,000/day
- Ceiling: ~28 cold sessions before quota burns for the day
- A single r/surfing post can send 50+ concurrent users
- Quota hit = empty condition scores = zero value proposition for everyone for the rest of the day

**Fix is fully spec'd in devops-report.md.** VPS proxy endpoints `/api/weather` and `/api/marine` with 30-min in-memory cache. Two-hour job. One `pm2 restart proxy`. This has been spec'd since April 17 and sat unbuilt for 9 days. That ends before the Reddit post.

### P1: Batch Venue Tag Audit

Confirmed unaudited `-s##` venues still carrying potentially wrong tags:
- `capbreton-s27` — tagged "All Levels." Capbreton has powerful beach break that regularly runs overhead+ during Atlantic swells. Misleading.
- `sagres-s6` — tagged "All Levels." Sagres surf runs strong with shore break and currents. Needs eyes.
- `tamarack-beach-s11` — "All Levels." Tamarack is genuinely mellow. Likely fine but needs confirmation.

45-minute job. Not deferrable past this week.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo weather proxy** | Dev + Jack (VPS access) | Before ANY Reddit post |
| **Batch venue tag audit** | Dev — 45 min | This week |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Ship weather proxy to VPS (P0 — non-negotiable)**
Spec is written. This is a deploy, not a design problem. Until it's live, there is no Reddit launch. Assign a specific day this week and do it.

**2. Complete batch venue tag audit**
45 minutes. Check every `-s##` surf venue for tag accuracy, especially skill-level claims. Close the last credibility liability before going viral.

**3. Ship "Next good window" line**
One line below any score < 60: "Next good window in ~X days" from the existing 7-day weather array. No new API calls. This has been on the list for 3 cycles — it ships this week. Decision is final.

---

## Explicit Product Decisions — April 25

**1. "Next good window" copy: SHIP this sprint.**
Has lived on the "next cycle" list for 3 consecutive reports. That's a decision to not ship, dressed up as a deferral. It's a 30-minute build. The D1 bounce problem ("conditions are bad, app is useless, I delete it") is solved by this one line. Ship it.

**2. Onboarding scoring explanation: CUT pre-Reddit.**
Reddit users are motivated and self-selecting. They will not bounce because they don't understand the score scale on day one. Add it post-launch when we have real retention data. Until then it's feature creep.

**3. Strike alerts background worker: DEFER to post-1K users.**
Zero users will trigger alerts in the first 30 days. Building the polling worker now is pure sunk cost. Alerts tab stays up as a waitlist signal. Ship the worker when 50+ people have set alerts.

**4. fetchJson() response body timeout: SHIP with weather proxy.**
Same VPS session. Add `AbortController` timeout on the proxy's upstream fetch. Free fix while the proxy file is already open.

**5. SRI on CDN scripts: DEFER indefinitely.**
CSP + SRI require careful testing with Babel Standalone's `unsafe-eval`. Risk of breaking the app on deploy outweighs the security benefit for a content app with no auth and no PII. Do not touch until post-1K.

---

## Success Criteria

**What defines success:**
- 1,000 MAU by end of May — minimum threshold for Pro waitlist credibility
- 5,000 MAU by end of July — enough signal for investor conversations + affiliate approvals post-LLC
- 100,000 downloads by end of year — north star

**What has to be true for 8K MAU at 90 days (not 5K):**

1. **Reddit post hits >500 upvotes** — requires the app not to break under traffic (weather proxy, P0)
2. **D1 retention > 35%** — requires the "next window" hook so users return when conditions are good
3. **Organic SEO picks up long-tail surf/ski queries** — requires 2+ more content pushes (new venues)
4. **PWA install prompt converts at >4%** — requires fast initial load; SW cache on repeat visits is the mitigation for Babel cold parse cost

The gap between 5K and 8K is almost entirely captured by items 1 and 2. Everything else is marginal.

---

## One Product Risk Nobody Is Talking About

**Our 7-day weather window is the wrong planning horizon.**

The people most likely to open Peakly are planning a trip 2–6 weeks out. "Should I book flights to Hossegor in 3 weeks?" is the highest-value question we could answer. Our weather data goes 7 days. For trip planning, the app is useless until the week before departure — which is usually too late to find cheap flights.

The Window Score (Roadmap Phase 2) is supposed to fix this. It requires extended forecast data (Open-Meteo goes to 16 days free). We're not surfacing it yet.

**Short-term mitigation with zero API cost:** for venues with scores < 60, show "Historically best months: [X, Y, Z]" derived from the venue's latitude and category season profile. Static data. Costs 2 hours. Closes the "useless for planning" perception gap for users hitting the app in the wrong season. Propose for next sprint after weather proxy ships.

---

## Venue Count

**233 venues** confirmed via code scan. CLAUDE.md says 229–231 — update to 233 on next CLAUDE.md refresh.

---

*Next report: 2026-04-26. If weather proxy hasn't shipped by then, it becomes the only item in this report.*
