# Peakly PM Report — 2026-05-29 (v42)

> Latest report. Supersedes v41 (May 28). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: YELLOW → ORANGE. Code checklist is 5 items from green. Agents shipped real improvements this week. Reddit window is June 7. VPS is the only binary gate remaining that Jack controls. Day 25 with no movement. This is the risk that kills the launch, not the code.**

---

## Shipped Since v41 (2026-05-28 → 2026-05-29)

| What | Verdict |
|------|---------|
| **4 new venues added** (Content, commit 03fd3db) — beach_phuquoc, beach_goa (Palolem, India), ski_gudauri (Georgia), ski_bansko (Bulgaria). Total: 157. | ⚠️ Mixed. Data quality is clean. Timing is debatable — see Decision 1 below. |
| **2 tag accuracy fixes** — huatulco-santa-cruz-t4 and zlatni-rat-t14. Generic "Amenities"/"Family Friendly" copy replaced with venue-specific tags. | ✅ Right. Tags are visible UI. Trust signal. |
| **3 AP_CONTINENT entries added** — TBS (Tbilisi), SOF (Sofia), GOI (Goa). Required for new venues to score correctly. | ✅ Required. Missing = broken pricing chain. |
| **DevOps health pass** (commits ced5aee, 792a606) — Supabase 2.106.2 + Babel 7.29.7 confirmed current, cache buster 20260528a aligned, PRECACHE=[], Sentry non-empty. | ✅ Right. No code changes today = no buster bump needed. |

**What did NOT ship (carried from v41):**
- SafetyWing CTA (P0 per v41, now Day 4)
- val-d-isere-s16 delete (P1, Day 16)
- outer-banks OAJ → ORF (P1, Day 16)
- BookingConfirmSheet removed from flights (P1, Day 18)
- VPS proxy redeploy (P0, Day 25 — Jack only)
- APNS decision (P1, Day 16 past self-imposed deadline)

---

## Active Bug Triage — May 29

| Bug | Severity | Days Open | Fix |
|-----|----------|-----------|-----|
| **VPS proxy never redeployed** | **P0** | **Day 25** | Jack only. 3 min. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"`. Open-Meteo free tier breaks at 44 DAU. Reddit sends 200+/hr in hour 1. Without this: empty grid on first load = "it doesn't work" top comment = permanent reputational damage. |
| **SafetyWing CTA not in app.jsx** | **P0** | **Day 4** | One anchor in VenueDetailSheet. `https://safetywing.com/?referenceID=peakly`. Ships today's commit or removed from Revenue Model today. No half-states. |
| **val-d-isere-s16 in VENUES** | **P1** | **Day 16** | Dup of Tignes. Delete app.jsx:567. Change `"val-d-isere-s16"` → `"tignes"` at app.jsx:5301. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 16** | OAJ = Jacksonville NC, 70mi away. `"OAJ"` → `"ORF"` at app.jsx:585. Flight pricing broken. |
| **BookingConfirmSheet fires on flights** | **P1** | **Day 18** | Extra modal on highest-intent CTA. `setBookConfirm` at line 7470 → direct `window.open` + `logEvent`. Hotels keep modal. Flights: direct open. |
| **APNS decision** | **P1** | **Day 16 past 05-13 deadline** | Path A (configure push, 30–60 min) or Path B (gate Alerts behind `isNativePlatform()`, 5 min). No 3rd path. |
| **Bora Bora airport inconsistency** | **P2** | **Day 2** | borabora uses PPT, matira-beach-t6 uses BOB. Standardize to BOB (closer airport). Low impact. |
| **25 ski venues missing skiPass field** | **P2** | **Day 1** | Content flagged. Not a launch gate. Post-launch batch fix. |

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED — non-empty, verified May 29 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed |
| GEAR_ITEMS absent | ✅ CLOSED — shipped 2026-05-27 (commit 932943c) |
| Cache buster stale | ✅ CLOSED — 20260528a aligned |
| SEO surf copy | ✅ CLOSED |
| APNS Capacitor gate | ✅ CLOSED — app.jsx:8158 |
| pigeon-point-t27 + sarakiniko-beach-t16 | ✅ CLOSED |
| S. hemisphere ski scoring "bug" | ✅ CLOSED — was never a bug; scoreVenue:1224 correct |

---

## Explicit Product Decisions — May 29

**Decision 1: Content venue expansion pauses at 157 until after Reddit post.**

Nine venues added in the last 7 days. Data quality is clean. But each new venue is a potential data bug discovered post-Reddit. The Goa addition today is a concrete example: monsoon starts June 1 (two days from now). The venue will score near-zero for the entire summer. It's not wrong, but a new user on June 7 seeing Goa at score 3 with no context has a legitimate "is this broken?" moment. Bansko (Bulgaria, Dec–Apr season) has the same problem.

**VERDICT: Content agent holds at 157 venues through June 7. No new venue additions until after the Reddit post lands and first 100 Plausible sessions are analyzed. Content agent runs QA-only mode: tag accuracy, airport verification, known bugs — no new entries.**

---

**Decision 2: SafetyWing CTA ships in today's commit or gets cut from the Revenue Model today.**

Day 4 of this finding. May 28 report set the binary. Today is May 29. The code session is this one. If SafetyWing ships: RPM goes from $11.52 → $12.06/1K MAU. If it doesn't: pull it from the table with `NOT SHIPPED` status. No more phantom revenue.

**VERDICT: SafetyWing ships in today's commit. If commit doesn't happen: remove from CLAUDE.md Revenue Model by end of day.**

---

**Decision 3: APNS Path B ships before June 7. Path A deferred to App Store sprint.**

Path A (configure APNS) has been pending 16 days past deadline. It blocks App Store but not the Reddit launch. Path B — gate Alerts tab on `isNativePlatform()` (5 min) — preserves web alerts, removes the App Store review blocker, and doesn't require Apple enrollment before June 7.

**VERDICT: Path B ships this week (target May 30 commit). APNS Path A deferred to App Store sprint. App Store is not on the critical path for Reddit launch.**

---

## This Week's Top 3 Priorities Only

**1. Today, May 29: Code commit block (~45 min).**
- SafetyWing anchor tag in VenueDetailSheet
- val-d-isere-s16 delete (app.jsx:567) + Alerts template update (app.jsx:5301)
- outer-banks OAJ → ORF (app.jsx:585)
- BookingConfirmSheet removed from flight CTA (app.jsx:7470 → direct window.open)
- Cache bump 20260528a → 20260529a

**2. Jack: VPS SSH today or tomorrow.** Day 25. 3 minutes. 9 days to Reddit post.

```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"
```

**3. Jack: Plausible validation + smoke test + Reddit draft by June 5.**
- Incognito → browse app → Plausible realtime → confirm events fire
- Explore from JFK → venue → ScoreBreakdown → flight CTA (no modal after commit)
- Draft Reddit post in your own voice
- Post Saturday June 7, 9–11am PST: r/solotravel → r/frugaltravel → r/skiing (1hr apart)

**Zero new features. Zero new venues. Zero new infra between now and June 7.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| New venue additions | **HOLD to June 8** | 157 is clean. QA-only mode through launch. |
| 25 ski venues skiPass backfill | **DEFER post-launch** | Not visible in UI. Not a Reddit gate. |
| JSON-LD structured data | **DEFER post-launch** | Zero impact on day-1 Reddit traffic. |
| Bora Bora PPT→BOB | **DEFER to next commit** | P2. Don't block today's commit block for this. |
| SRI on CDN scripts | **DEFER post-launch** | Security hardening. Right to do, wrong timing. |
| CSP meta tag | **DEFER** | Same as SRI. |
| MapView improvements | **DEFER** | Validate usage first. |
| Wishlists / Trips reveal | **LOCKED** | 1K MAU gate. |
| Hotels in deal score | **CUT** | Dead. Off the list permanently. |
| Peakly Pro | **CUT for v1** | Post-1K MAU. |

---

## Revenue Model — May 29 Code-Verified

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ app.jsx:7450+ | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ app.jsx:257 GEAR_ITEMS live | $4.48 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ app.jsx:1962 | $0.14 |
| SafetyWing (`referenceID=peakly`) | ❌ NOT in app.jsx — ships today or REMOVED | $0 |
| REI (Avantlink) | LLC pending | $0 |
| Backcountry / GetYourGuide | LLC pending | $0 |

**Current live RPM: $11.52/1K MAU.** SafetyWing adds $0.54 if it ships today.

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate | ✅ app.jsx:8158 |
| 3 | Duplicate venues deleted | ✅ |
| 4 | abasin lateSeason:true | ✅ |
| 5 | GEAR_ITEMS live | ✅ app.jsx:257 |
| 6 | Cache buster aligned | ✅ 20260528a |
| 7 | Seasonal default "beach" N-hem summer | ✅ app.jsx:2150 |
| 8 | S-hemisphere ski scoring correct | ✅ scoreVenue:1224 |
| 9 | Sentry non-empty | ✅ |
| 10 | **SafetyWing CTA** | ❌ today's commit or REMOVED |
| 11 | **val-d-isere-s16 deleted** | ❌ today's commit |
| 12 | **outer-banks ap OAJ → ORF** | ❌ today's commit |
| 13 | **BookingConfirmSheet off flights** | ❌ today's commit |
| 14 | **APNS Path B gate** | ❌ May 30 commit |
| 15 | **VPS proxy verified** | ❌ Jack, today/tomorrow |
| 16 | **Plausible domain validated** | ❌ Jack, by June 5 |
| 17 | **Smoke test** | ❌ Jack, by June 5 |
| 18 | **Reddit post written** | ❌ Jack's voice, June 6 draft |

**9 of 18 green. Items 10–14 = one commit today. Items 15–18 = Jack actions.**

---

## 90-Day Projection

| Scenario | Users (90d) | Condition |
|----------|-------------|-----------|
| June 7 post + VPS live | **6K–8K** | Post hits top 10 r/solotravel + proxy cache absorbs spike |
| June 7 post + VPS down | **2K–3K** | Empty grid in hour 1; "broken" pins; bounce rate kills organic tail |
| Post after June 20 | **2K** | Peak summer competition, no differentiated window |
| No post in June | **<1K** | Organic SEO only |

**The gap between 8K and 2K is one SSH command. Day 25.**

---

## One Product Risk Nobody Is Talking About

**The content agent is optimizing for venue count and data completeness while the product is optimizing for first-impression quality on a specific 2-hour window on June 7. Those two goals are not currently aligned.**

beach_goa (Palolem) scores near-zero starting June 1 — monsoon season. ski_bansko (Bulgaria) scores near-zero now — December–April season. Both venues are correct data. But a user opening the app on June 7 from a US airport and seeing either in the grid at score 3 with "Off season" has a legitimate "is this app broken?" reaction. They don't know why those venues appear. The app doesn't explain it contextually in a way that reads as intentional.

The scoring is right. The framing for a brand-new user who has zero context isn't. The filter defaults (Beach, 6hr max flight) mostly protect against this for most users. But the content agent's mandate doesn't include "does this venue create a bad first impression on launch day." That's a product lens, not a data lens.

**The fix isn't removing the venues.** It's ensuring the seasonal empty-state copy is sharp enough that when a user sees a near-zero score, they understand why. That copy work belongs in the same commit as the other P1s today.
