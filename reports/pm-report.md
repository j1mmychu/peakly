# PM Report — 2026-03-25 (v8)

## Status: YELLOW

Progress is real but we are not yet launch-ready. The app is visually polished for ~58% of venues, analytics are live, and all Phase 1 bugs are resolved. Still blocking: VPS proxy down (all prices are estimates), 72 venues without photos, Venue Detail Sheet is the primary conversion surface and it hasn't been touched. Today: fixed $9/mo → $79/yr pricing error (P1), updated cache buster.

---

## Shipped Since Last Report

| Item | Type | Right call? |
|------|------|-------------|
| UX 9.5: fontSize floor, hide thin pill counts, carousel price label | Polish | YES — cosmetic but correct. Eliminates visual noise. |
| All 12 agent reports v8 | Internal tooling | YES — shared brain matters, but this is meta-work not user-facing. |
| All 12 agent prompts upgraded to senior-level specs | Internal tooling | YES — better output quality from agents. Low time cost. |
| **$9/mo → $79/yr fix (this session)** | Bug fix | Required. P1 pricing error that erodes trust. |
| **Cache buster updated to v=20260325a (this session)** | Maintenance | Required. Stale cache = users on old code. |

**Opportunity cost assessment:** Yesterday was mostly internal tooling. Zero user-facing value shipped since the UX 9.5 polish. The 12-agent infrastructure is built — now it needs to generate results that translate into code changes or content, not just reports.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **Peakly Pro shows $9/mo (should be $79/yr)** | **P1** — pricing mismatch erodes trust with the exact users most likely to pay | **FIXED this session** |
| **VPS proxy ECONNREFUSED** — all flight prices are estimates | **P0** — core value prop (real flight prices) is broken for all users | Jack must SSH: `pm2 restart all` |
| **Sentry DSN empty** — zero visibility on production errors | **P1** — flying completely blind. If Reddit launch sends 500 people and the app crashes for 20% of them, we won't know. | Jack: sign up sentry.io, paste DSN |
| **Cache buster stale** (v=20260323b → 20260325a) | **P2** — users see old code after deploys | **FIXED this session** |
| **72 venues without photos** — gradient fallback only | **P2** — degrades visual quality for 42% of listings | Content task, 3-4 hrs |
| **HTTPS on VPS not configured** — mixed content | **P1** (blocks VPS fix from fully working) | Jack/DevOps: Cloudflare tunnel |

---

## Known Blockers

| Blocker | Unblocked by | Action |
|---------|-------------|--------|
| VPS proxy DOWN | Jack SSHing in | `pm2 restart all` on 104.131.82.242 |
| HTTPS on VPS | Jack/DevOps | Cloudflare free tunnel or Let's Encrypt |
| REI affiliate signup (18 live links earn $0) | Not blocked — just needs 30 min | Avantlink.com, no LLC required |
| Sentry DSN | Not blocked | sentry.io free tier, 5 min |
| LLC approval | External legal process | No action available |
| Placeholder AFFILIATE_IDs (REI, Backcountry, GetYourGuide) | LLC (partially) | Wait on LLC for GetYourGuide; REI via Avantlink now |

**JSON-LD structured data gap:** Missing schema.org WebApplication markup. Costs us rich snippets. Estimated SEO lift: 5-10 additional organic visits/day within 60 days. Not a crisis — schedule for Phase 4.

**Static h1 fallback:** React renders to `<div id="root">`, so crawlers see no h1 until JS executes. Impact is limited since Googlebot does execute JS, but it's a gap. Estimate: low impact, deprioritize.

---

## Priority Decisions — Top 3 This Week Only

**1. Add photos to 72 remaining venues** (Content agent, 3-4 hrs)
This is blocking Reddit launch quality. 42% of listings render without photos. Every one of those cards is a lost impression. Surfing and tanning venues are the worst hit. This is a pure data task — add Unsplash source URLs. No code change. Do this before any Reddit post goes out.

**2. Venue Detail Sheet polish — Phase 2.3** (UX agent, 4-6 hrs)
This is the conversion surface. When a user taps a card, the detail sheet must sell the trip. Currently it's functional but not compelling. Required: full-width photo hero, sticky "Book Flights" CTA, 7-day mini forecast bar, condition score breakdown, similar venues row. This is where Booking.com and Travelpayouts clicks happen. Nothing else matters until this is done.

**3. Sentry DSN + REI affiliate signup** (Jack, 30-60 min total)
These are two unblocked, high-leverage Jack tasks that don't require development work:
- Sentry DSN: 5 min at sentry.io. Gives us crash visibility before Reddit launch.
- REI via Avantlink: 30 min. 18 live gear recommendation links currently earn $0. Estimated $4-5/1K RPM uplift. Does NOT require LLC.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Expose Trips + Wishlists tabs | **DEFER** | 3-tab nav is cleaner. Both tabs built but unpolished. Adding navigation before nailing the core loop (Explore → Detail → Book) dilutes focus. Revisit at 1K users. |
| PWA manifest / service worker | **DEFER** | Zero impact on the 100K goal right now. Mobile Safari prompts anyway. Build after Reddit launch. |
| GA4 analytics | **CUT** | Plausible is live. GA4 is redundant. Two analytics tools = two sources of truth. Stick with Plausible. |
| Add 50+ new venues (South America, Africa, SE Asia) | **DEFER** | Geographic expansion before nailing UX for existing 182 venues is wrong order. Fix conversion first. |
| Hotel affiliate links per venue | **DEFER** | Blocked by LLC for full affiliate program. Existing generic Booking.com links are fine. |
| Dark mode toggle | **CUT** | No signal it moves the 100K needle. Low demand, high cost. Not in next 12 months. |
| Offline support / service worker | **CUT** | Fundamentally incompatible with Peakly's live-data use case. Caching stale conditions creates wrong impressions. |

---

## Success Criteria

**90-day target:** 5K-8K users. What separates 8K from 5K:

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| Reddit launch | 1 post, moderate traction | 1 viral post (500+ upvotes) + 2 follow-up community posts |
| Venue Detail conversion | Users tap, don't click through | Detail sheet polished — generates Booking.com + flight clicks |
| Word of mouth | Single-session app | Users share specific venue links with friends |
| Content quality | 42% venues have no photos | 100% photo coverage, every listing looks editorial |
| Alerts | Nobody sets alerts | 10%+ of users set 1+ alert (retention driver) |

**Current trajectory:** 5K if we launch in current state. 8K requires: photos at 100%, polished detail sheet, one Reddit hit in r/surfing or r/skiing with a real condition alert screenshot.

---

## One Product Risk Nobody Is Talking About

**The scoring algorithm is a black box to users.** We show a score badge ("Epic", "Firing") but no user understands why Bali ranks higher than Mavericks today. This matters because: (1) users who distrust the score won't set alerts or share links — both are critical retention and growth mechanics; (2) when the score is wrong (VPS down, stale weather), users have no way to know. The fix is simple — a tap on the score badge shows a 3-line breakdown: "Wave height: 8ft (ideal). Wind: offshore (great). Swell period: 14s (excellent)." One modal, builds enormous trust. Add to Phase 2.3 Venue Detail Sheet work.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-25 | **$9/mo → $79/yr** fixed in app.jsx line 4561. P1 pricing error resolved. |
| 2026-03-25 | Cache buster updated to v=20260325a. |
| 2026-03-25 | GA4 CUT — Plausible is sufficient, two analytics tools creates noise. |
| 2026-03-25 | Offline/service worker CUT — fundamentally incompatible with Peakly's live-data use case. |
| 2026-03-25 | Dark mode CUT — no signal it moves the 100K needle. |
| 2026-03-25 | Trips + Wishlists DEFERRED — revisit at 1K users. 3-tab nav stays. |
| Ongoing | Reddit launch greenlit but gated on: photos at 100%, detail sheet polished. |
| Ongoing | VPS proxy fix is Jack's single highest-impact 15-minute task. |

---

## Blockers Summary

| # | Blocker | Owner | Urgency |
|---|---------|-------|---------|
| 1 | VPS proxy DOWN | Jack | Do today |
| 2 | Sentry DSN empty | Jack | Do before Reddit launch |
| 3 | REI affiliate signup | Jack | This week (30 min, unblocked) |
| 4 | HTTPS on VPS | Jack/DevOps | This week |
| 5 | 72 venues without photos | Content agent | Before Reddit launch |
| 6 | LLC approval | External | No action |

---

*Next report: 2026-03-31*
