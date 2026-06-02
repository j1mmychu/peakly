# Peakly PM Report — 2026-06-02 (v46)

> Latest report. Supersedes v45 (June 1). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: YELLOW. Code side is clean — 3 factually-wrong tag fixes shipped this session, cache 20260602a. VPS is the last binary gate (Day 29). Soft launch target June 3–4. Reddit June 7. Five days.**

---

## Shipped Since v45 (2026-06-01 → 2026-06-02)

| What | Verdict |
|------|---------|
| **3 copy-paste "Coral Reef" tag fixes** — playa-de-la-concha-t3 (San Sebastian, Basque Country), patara-beach-t18 (Turkish coast), lindos-beach-t23 (Rhodes, Greece). All three had identical copy-paste `["Natural Beauty","Protected Bay","Coral Reef","No Crowds"]` despite being at latitudes with no coral reefs. Fixed to venue-specific tags (Basque promenade, Lycian ruins + turtle nesting, Acropolis backdrop). | ✅ Right. Factually wrong tags visible in the venue detail sheet are a trust killer on launch day. |
| **Cache bump 20260601a → 20260602a** — app.jsx:17, sw.js:2, index.html:400. | ✅ Required on any ship touching app.jsx. |

**Context:** DevOps June 2 report incorrectly read cache as 20260528a — the June 1 commit (a31ea8a) had already deployed 20260601a. Underlying code was correct; agent data quality issue noted.

---

## Active Bug Triage — June 2

| Bug | Severity | Days Open | Fix |
|-----|----------|-----------|-----|
| **VPS proxy never redeployed** | **P0** | **Day 29** | Jack only. One command: `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"`. Without this: ~42 cache-cold sessions exhaust Open-Meteo free tier → grid empty. Soft launch posts go out June 3–4; if VPS isn't live before those posts, "broken" comments precede June 7. |
| **25 ski venues missing skiPass field** | **P2** | Day 5 | Not visible in current UI. Post-launch content sprint. |

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED |
| Peakly Pro $9/mo | ✅ CLOSED — Pro UI removed |
| GEAR_ITEMS absent | ✅ CLOSED — 2026-05-27 |
| val-d-isere-s16 dup | ✅ CLOSED — 2026-06-01 (156 venues) |
| outer-banks OAJ→ORF | ✅ CLOSED — 2026-06-01 |
| BookingConfirmSheet on flights | ✅ CLOSED — 2026-06-01 |
| SafetyWing CTA absent | ✅ CLOSED — 2026-06-01 |
| Bora Bora PPT→BOB | ✅ CLOSED — 2026-06-01 |
| Coral Reef tags (3 venues) | ✅ CLOSED — this session |
| Cache buster stale | ✅ CLOSED — 20260602a this session |
| APNS Capacitor gate (Path B) | ✅ CLOSED — app.jsx:8317 |
| Seasonal default June | ✅ NOT A BUG — `m >= 5 && m <= 8`, June = 6, returns "beach" correctly |

---

## Explicit Product Decisions — June 2

**Decision 1: Soft launch is conditional on VPS being live. VPS first, posts second.**

v45 called June 3–4 for niche sub posts. That logic assumes the app works under concurrent load. Without VPS: ~42 cache-cold sessions exhaust Open-Meteo → empty grid. A soft launch that generates "nothing loads" feedback on June 3 puts a "broken" comment on the thread before the June 7 main post. A failed soft launch is worse than no soft launch.

**VERDICT: VPS live → Jack confirms `/health` shows `wx_cache_size` field → then niche sub posts. In that order. If VPS isn't live by June 4 morning, skip soft launch and go direct June 7.**

---

**Decision 2: Content agent's Fernando de Noronha proposal REJECTED (duplicate). 4 others DEFERRED to June 8.**

Content agent proposed `fernando-de-noronha` as a new venue. It already exists as `beach_noronha` (app.jsx:512, lat -3.855, ap:"FEN"). Content agent did not check existing VENUES before proposing. Reject immediately — adding it would create two nearly-identical Fernando de Noronha entries in the grid.

Las Leñas, Valle Nevado (in-season S. hemisphere June skiing), Praia de Pipa, Sarakiniko (Greek island): valid additions but code freeze is June 1–7.

**VERDICT: Fernando de Noronha REJECTED. 4 others DEFERRED to June 8 batch. 156 venues ships June 7.**

---

**Decision 3: Reddit launch is June 7. No slip. The ski-beach overlap window is closing.**

Bansko, Valle Nevado, Cerro Castor, Thredbo all scoring now. By June 20 the N. hemisphere ski cards go blank. The combined ski+beach grid that makes the product interesting in June doesn't exist in July. Slipping costs ~150 ceiling users per day of delay plus the organic tail from a launch in an interesting window.

**VERDICT: June 7. Hard. Post goes up regardless of soft-launch result or social proof status.**

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS SSH before niche sub posts. Day 29.**
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"
```
Confirm `/health` shows `"wx_cache_size"` field (proves new binary running). If absent, `pm2 list` to debug. Must happen before any Reddit posts go up.

**2. Jack: Niche sub posts June 3–4 (only after VPS is live).**
r/skiing + r/traveldeals. Short, personal, specific. "Found a Mammoth Lakes flight from SFO for $89 this weekend — built a tool that surfaces these." Real airport. Real venue that's firing. Link. Not a pitch deck.

**3. Jack: Human click-through before June 7.**
Incognito → set home airport → open venue → "Book Flights" (confirm Aviasales opens directly, no modal) → "Hotels" (confirm BookingConfirmSheet + Booking.com) → ScoreBreakdown → Plausible realtime. 15 minutes. Irreplaceable by Playwright.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Fernando de Noronha addition | **REJECTED** | Duplicate of beach_noronha already in VENUES. |
| Las Leñas / Valle Nevado / Praia de Pipa / Sarakiniko | **DEFER to June 8** | Code freeze. Good venues, wrong week. |
| skiPass backfill (25 venues) | **DEFER post-launch** | Not visible in current UI. Zero June 7 impact. |
| JSON-LD structured data | **DEFER post-launch** | Zero impact on Reddit-day traffic. |
| Home airport onboarding nudge | **DEFER to first patch** | High trust value. First sprint after launch. |
| APNS Path A | **DEFER to v1.1** | Path B live. App Store not on June 7 path. |
| S. hemisphere ski carousel | **DEFER post-launch** | Validate with real user data first. |
| Wishlists / Trips tab | **LOCKED** | 1K MAU gate. Not moving. |
| Hotels in deal score | **CUT** | Final. Third time confirmed. |

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (Path B) | ✅ app.jsx:8317 |
| 3 | val-d-isere-s16 deleted | ✅ 156 venues |
| 4 | outer-banks ap OAJ → ORF | ✅ |
| 5 | BookingConfirmSheet off flights | ✅ |
| 6 | SafetyWing CTA live | ✅ VenueDetailSheet |
| 7 | Bora Bora PPT → BOB | ✅ |
| 8 | GEAR_ITEMS live | ✅ Amazon Associates active |
| 9 | Seasonal default "beach" June N-hem | ✅ confirmed correct |
| 10 | Sentry non-empty | ✅ |
| 11 | Coral Reef tag errors fixed | ✅ this session |
| 12 | Cache buster aligned | ✅ 20260602a |
| 13 | **VPS proxy redeployed** | ❌ Jack, before June 3 posts |
| 14 | **Niche sub soft launch** | ❌ Jack, June 3–4 (after VPS) |
| 15 | **Human click-through** | ❌ Jack, June 4–5 |
| 16 | **Reddit post drafted** | ❌ Jack's voice, June 5 deadline |

**12 of 16 green. Items 13–16 = Jack actions. Code side is done.**

---

## Revenue Model — June 2

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ GEAR_ITEMS live | $4.48 |
| SafetyWing (`referenceID=peakly`) | ✅ VenueDetailSheet | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ (weekend pricing unlocks on VPS redeploy) | $0.14 |
| REI (Avantlink) | LLC pending | $0 |
| Backcountry / GetYourGuide | LLC pending | $0 |

**Current live RPM: $12.06/1K MAU.**

---

## 90-Day Projection

| Scenario | Users (90d) | Gating condition |
|----------|-------------|-----------------|
| June 7 + VPS live + niche sub social proof | **7K–8K** | Top 10 in subreddit, ≥1 "I booked this" comment |
| June 7 + VPS live, no soft launch | **5K–6K** | Clean product, no pre-existing proof |
| June 7 + VPS NOT live | **1K–2K** | Empty grid in hour 1 |
| Post slips to June 14+ | **1.5K–2K** | Ski season closing, summer competition |

**What has to be true for 8K not 5K:** VPS live (no empty grid), niche sub generates ≥1 genuine positive comment, June 7 post hits 9–11am EST, Plausible shows <40% bounce in first 2 hours.

---

## One Product Risk Nobody Is Talking About

**The Content agent proposed Fernando de Noronha as a new venue — which already exists in the codebase as `beach_noronha`. The agent is generating venue proposals without checking the existing VENUES array.**

This is caught today. Post-launch, when venue additions accelerate toward the 100K-user push, an undetected duplicate creates two nearly-identical entries in the grid that look like a broken app to users who know the destination.

The fix is one sentence added to `tasks/agents/content-data.md` pre-flight checklist: "Before proposing any new venue, verify the target id and lat/lon (±0.1°) don't already exist in VENUES." Add this after June 7 — it's a 2-minute edit that closes a class of bug permanently.
