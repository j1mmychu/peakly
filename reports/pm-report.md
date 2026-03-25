# PM Report — 2026-03-25 (v9)

**Author:** Product Manager Agent (Senior)
**Status:** YELLOW — Significant unreachable work sitting in a detached HEAD. Sync recovered.

---

## Session Notes

**Critical finding this session:** Local `master` was 27 commits behind `origin/master`. Synced and fast-forwarded. Additionally, a detached HEAD (`9f15470`) contains 2 commits ahead of `origin/master` that have never been pushed — including JSON-LD markup, Plausible event tracking, 10 new venue expansions, WCAG fixes, hiking gear items, and agent v9 reports. This work exists only locally and is not live. It needs to be pushed or it will be lost.

---

## Status Summary

Progress is real but we are not yet launch-ready. The app is visually polished for ~60% of venues, analytics are live (Plausible confirmed), and all Phase 1 bugs are resolved. Still blocking: VPS proxy down (all prices are estimates), 73 venues without photos, Venue Detail Sheet is the primary conversion surface and it hasn't been touched. Pricing fixed ($79/yr). Cache buster current (v=20260325a).

---

## Shipped Since Last Report (v8 → v9)

| Commit | Item | Right call? | On-100K goal? |
|--------|------|-------------|---------------|
| `53e1aed` | Fix Pro pricing $9/mo → $79/yr | YES — P1 trust issue resolved | YES |
| `53e1aed` | Cache buster → v=20260325a | YES — required maintenance | YES |
| `f77330c` | UX 9.5: fontSize floor, hide thin pill counts, carousel price label | YES — removes visual noise | MARGINALLY |
| `ab16300` | Plausible analytics enabled | YES — critical gap closed | YES — can measure now |
| `ed2178c` | SEO: canonical, robots.txt, sitemap.xml, title tag | YES — SEO foundation | YES |
| `85146a6` | Hero card photo, category-filtered Best Right Now | YES — polish matters | YES |
| `0d1b7a9 / 58bd62a / 9b0acd1` | All 12 agent prompts upgraded to senior-level specs | YES — output quality improved | INDIRECT |
| `6331d3a / 7772493` | Agent reports v6-v9 synced | NEUTRAL — meta-work only | NO |

**Opportunity cost assessment:** The agent infrastructure is mature. Daily reports are generating specific, actionable recommendations. The failure mode is now that those recommendations sit in commits that haven't been pushed to production (`9f15470`). Infrastructure is not the bottleneck — shipping is.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **VPS proxy ECONNREFUSED** — all users see estimated flight prices | **P0** — core value prop broken for 100% of users | OPEN. Jack must SSH: `pm2 restart all` |
| **Detached HEAD work not pushed** — 10 venues, JSON-LD, Plausible events unreachable | **P1** — lost work risk | OPEN. Needs push to origin/master |
| **Sentry DSN empty** — zero production error visibility | **P1** — flying blind before Reddit launch | OPEN. Jack: sentry.io free tier, 5 min |
| **HTTPS on VPS not configured** — mixed content even when VPS is running | **P1** — blocks real flight prices permanently | OPEN. Needs Cloudflare or Let's Encrypt |
| **73 venues without photos** (40% of listings) | **P2** — degrades visual quality for 73 cards | OPEN. Content agent task |
| **Diving/Climbing show 1 venue each in UI** — stub categories visible to all users | **P2** — tapping "Diving" returns 1 result; instant bounce | Partially fixed in detached HEAD (needs push) |
| **Duplicate venue: `id:"pipeline"` + `id:"banzai_pipeline"`** — same wave, same airport | **P3** — data integrity, inflated count | OPEN |

---

## Known Blockers

| Blocker | Owner | Unblocked by |
|---------|-------|-------------|
| VPS proxy DOWN | Jack | SSH into 104.131.82.242: `pm2 restart all` |
| HTTPS on VPS | Jack/DevOps | Cloudflare free tunnel or Let's Encrypt |
| Sentry DSN | Jack | Nothing — completely unblocked. sentry.io, 5 min |
| REI affiliate approval (18 links earn $0) | Jack | Avantlink signup — does NOT require LLC |
| LLC approval | External | No action available |
| Peakly Pro / Stripe | External (LLC) | LLC approval |
| GetYourGuide affiliate tag | External (LLC) | LLC approval |

**JSON-LD structured data gap:** Missing from current master index.html. Schema.org WebApplication markup is coded in detached HEAD `9f15470` — not yet live. Push that commit to fix this.

---

## Priority Decisions — Top 3 This Week

### 1. SHIP: Push detached HEAD work to origin/master (15 minutes)
The commit `9f15470` ("Ship all agent recommendations") exists locally in a detached HEAD and has never been pushed. It contains: JSON-LD structured data (SEO), Plausible event tracking (`Onboarding Complete`), 10 new venues (4 diving, 3 climbing, 3 kite — fixes the 1-venue stub categories), hiking gear items, WCAG color fixes, and v9 agent reports. All of this work is done and tested — it just needs `git push`. Every hour it sits unpushed is a loss.

**Action:** Create branch from `9f15470`, merge into master, push to origin/master.

### 2. SHIP: Venue Detail Sheet polish (UX agent, 4–6 hrs)
This is the primary conversion surface — where Booking.com clicks and Travelpayouts clicks happen. Current state: functional but not compelling. Required changes: full-width photo hero at top, sticky "Book Flights" CTA, 7-day mini forecast bar, condition score tap-to-explain breakdown ("Wave: 8ft — ideal. Wind: offshore. Swell period: 14s"), similar venues row. Without this, the app is a listicle, not a tool. This is a prerequisite for Reddit launch, not a follow-up.

### 3. DEFER to Jack: VPS restart + Sentry DSN + REI signup (30 min total)
Three tasks requiring Jack's direct action, none require development:
- VPS: `ssh root@104.131.82.242` → `pm2 restart all` — restores real flight prices instantly
- Sentry: sentry.io free tier → paste DSN into `SENTRY_DSN` on line 6 of app.jsx
- REI: avantlink.com signup (30 min) → 18 live gear links go from earning $0 to tracked commissions (~$4-5 RPM uplift at scale)

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Add 50+ new venues (South America, Africa, SE Asia) | **DEFER** | Fix conversion surface before expanding inventory. Quality over quantity. |
| Hotel affiliate deep links per venue | **DEFER** | Generic Booking.com links work. Per-venue deep links are a v2 feature, not launch-gating. |
| Trip insurance CTA (World Nomads) | **DEFER** | SafetyWing is already live. Adding a second insurance brand splits attention and confuses users. |
| Add LAS, PHX, MSP, DTW to AIRPORTS array | **DEFER** | Already in BASE_PRICES. Adding to AIRPORTS array has zero visible impact until users search from those cities. Do after Reddit launch. |
| Seasonal ratings per venue | **DEFER** | No analytics to validate demand. Ship after 1K users prove retention. |
| Expand LOCAL_TIPS for all 235+ venues | **DEFER** | No data showing users read local tips. Validate with Plausible first. |
| PWA manifest + service worker | **DEFER** | Zero signal that "install to home screen" is blocking adoption. Revisit at 2K users. |
| Dark mode | **CUT** | No signal this moves the 100K needle. Complexity cost high; reward negligible. Not in next 12 months. |
| Offline support | **CUT** | Fundamentally incompatible with Peakly's live-data use case. Stale conditions create wrong impressions. |

---

## Success Criteria — 90-Day Targets

**Goal: 5K–8K users. What separates 8K from 5K:**

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| Reddit launch | 1 post with moderate traction | 1 viral post (500+ upvotes) showing a live condition alert screenshot |
| Venue Detail Sheet | Users tap and bounce back | Polished detail sheet → Booking.com and flight clicks tracked in Plausible |
| Photo coverage | 40% venues have photos | 100% photo coverage — every card looks editorial |
| Retention | Single-session, no return | 10%+ of users set 1+ alert → return when it fires |
| Word of mouth | App is useful | Users share venue links before a trip; links drive organic acquisition |
| VPS flight prices | All estimates ("est.") | Real prices → increased click-through on flight CTAs |

**Current trajectory:** 5K if we launch in current state. 8K requires: photos at 100%, polished detail sheet, VPS proxy restored, one Reddit hit in r/surfing or r/skiing.

---

## One Product Risk Nobody Is Talking About

**The 1-venue stub categories are live and broken in production today.** Diving and Climbing both appear as category filter pills — but each returns exactly 1 venue. A user who finds Peakly because they're planning a dive trip taps "Diving," sees 1 result, and concludes the app is a prototype. The fix is already written (4 diving + 3 climbing + 3 kite venues in detached HEAD `9f15470`) — the risk is that it never gets pushed. This is a production bug masquerading as a backlog item.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-25 | **$9/mo → $79/yr** fixed in app.jsx line 4561. P1 trust error resolved. |
| 2026-03-25 | Cache buster updated: v=20260325a |
| 2026-03-25 | **GA4: CUT** — Plausible is live and sufficient. Two analytics tools = noise. |
| 2026-03-25 | **Offline/service worker: CUT** — Fundamentally incompatible with Peakly's live-data use case. |
| 2026-03-25 | **Dark mode: CUT** — No signal it moves 100K needle. |
| 2026-03-25 | **Trips + Wishlists: DEFERRED** — Revisit at 1K users. 3-tab nav stays. |
| Ongoing | Reddit launch gated on: photos at 100%, detail sheet polished, VPS restored. |

---

## Blockers Summary

| # | Blocker | Owner | Urgency |
|---|---------|-------|---------|
| 1 | Push detached HEAD `9f15470` to origin/master | Dev | Do TODAY — prevents work loss |
| 2 | VPS proxy DOWN | Jack | Do today |
| 2 | Sentry DSN empty | Jack | Do before Reddit launch |
| 3 | Sentry DSN empty | Jack | Do before Reddit launch (5 min) |
| 4 | HTTPS on VPS | Jack/DevOps | This week |
| 5 | 73 venues without photos | Content agent | Before Reddit launch |
| 6 | Venue Detail Sheet polish | UX agent | Before Reddit launch |
| 7 | REI affiliate signup (Avantlink) | Jack | This week (30 min, unblocked) |
| 8 | LLC approval | External | No action available |

---

*Next report: 2026-03-26*
