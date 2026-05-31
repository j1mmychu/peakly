# Peakly PM Report — 2026-05-31 (v44)

> Latest report. Supersedes v43 (May 30). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: RED. June 7 is 7 days away. The P1 code batch has been "ships today" in 3 consecutive reports (v42, v43, v44). Still hasn't shipped. VPS is Day 27. These two things will determine whether the launch reaches 8K users or 2K.**

---

## Shipped Since v43 (2026-05-30 → 2026-05-31)

| What | Verdict |
|------|---------|
| **Cache buster bump 20260528a → 20260531a** (DevOps, commit 59b281c) — aligned across app.jsx:17, sw.js CACHE_NAME, index.html. | ✅ Closes the stale-build-stamp P2. |
| **Content QA report** (commit 40d73e6) — content agent confirmed in QA-only mode, no new venues. | ✅ Correct. Freeze holds through June 7. |

**What still hasn't shipped (carried from v43):**

| Item | Days Unshipped | Impact |
|------|----------------|--------|
| SafetyWing CTA | Day 7 | $0.54 RPM on table, not in code |
| val-d-isere-s16 delete | Day 19 | Duplicate venue in VENUES + broken Alert preset |
| outer-banks ap OAJ→ORF | Day 19 | Flight pricing broken for Nags Head |
| BookingConfirmSheet off flights | Day 21 | Friction modal on highest-intent CTA |

---

## Active Bug Triage — May 31

| Bug | Severity | Days Open | Fix |
|-----|----------|-----------|-----|
| **VPS proxy never redeployed** | **P0** | **Day 27** | Jack only. 3 min. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"`. Reddit sends 200+ req/hr in hour 1. Open-Meteo free tier rate-limits at 44 DAU. Without this: empty grid on first load = permanent "it's broken" record. |
| **SafetyWing CTA not in app.jsx** | **P1** | **Day 7** | One `<a>` tag in VenueDetailSheet. `https://safetywing.com/?referenceID=peakly`. Removed from Revenue Model (v43) — stays removed until it ships. |
| **val-d-isere-s16 duplicate** | **P1** | **Day 19** | Delete app.jsx:567. Change `"val-d-isere-s16"` → `"tignes"` at app.jsx:5301. 2-line fix. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 19** | OAJ = Jacksonville NC, 70mi from Outer Banks. `"OAJ"` → `"ORF"` at app.jsx:585. 1-token fix. |
| **BookingConfirmSheet fires on flights** | **P1** | **Day 21** | Line 7470: replace `setBookConfirm({...})` with `window.open(flightUrl, "_blank", "noopener,noreferrer"); logEvent(...)`. Hotels keep modal. Flights: direct open only. |
| **Build stamp** | ✅ CLOSED | — | DevOps bumped to 20260531a (commit 59b281c). |
| **Bora Bora airport inconsistency** | **P2** | **Day 4** | beach_borabora uses PPT, matira-beach-t6 uses BOB. Standardize to BOB. Bundle into P1 batch. |
| **25 ski venues missing skiPass field** | **P2** | **Day 3** | Not a launch gate. Post-launch content sprint. |

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED — non-empty, verified May 29 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed |
| GEAR_ITEMS absent | ✅ CLOSED — shipped 2026-05-27 |
| Cache buster stale (20260522a → 20260526a) | ✅ CLOSED — 20260528a |
| SEO surf copy | ✅ CLOSED |
| APNS Capacitor gate (Path B) | ✅ CLOSED — app.jsx:8290–8317, isNativePlatform gate live |
| pigeon-point-t27 + sarakiniko-beach-t16 | ✅ CLOSED |
| S. hemisphere ski scoring | ✅ CLOSED — scoreVenue:1224 correct |
| Amazon gear gate | ✅ CLOSED — GEAR_ITEMS live |

---

## Explicit Product Decisions — May 31

**Decision 1: The P1 batch is the only code priority before June 7.**

Every other code task is noise until four lines ship: (1) SafetyWing anchor, (2) val-d-isere-s16 delete, (3) OAJ→ORF, (4) BookingConfirmSheet bypass for flights. One edit session. Under 20 minutes. If the next code session touches anything other than these four items, that's the wrong session. No new features, no polish, no refactors until the batch is committed.

**VERDICT: P1 batch is the only code ask. Target June 1. Hard deadline June 3 (4 days before launch).**

---

**Decision 2: Venue count is 157. The "182" figure in the agent prompt is stale — retire it.**

The agent prompt's setup references 182 venues. Verified count today: 157. The gap reflects surf retirement and launch scoping. 157 clean venues beats 182 with data gaps. The 182 target has no product rationale — it's an artifact of a stale number. Content agent QA-only mode through June 8.

**VERDICT: 157 is the launch number. Update agent prompt's venue reference when next edited.**

---

**Decision 3: Soft launch on niche subs June 3–4 before the June 7 main post.**

The June 7 r/solotravel post has zero social proof. A "just launched" post without any "I tried it and it worked" comments in the thread will die below 50 upvotes. Fix: post to r/skiing + r/traveldeals June 3–4 (lower stakes, smaller audience) to generate real user reactions before the high-stakes swing. Even 5 users saying "this surfaced a Mammoth flight I booked" changes the conversion rate on June 7 materially.

**VERDICT: Jack posts to 2 niche subs June 3–4. June 7 main post goes regardless of soft-launch result.**

---

## Revenue Model — May 31 Code-Verified

| Stream | Status | RPM/1K MAU |
|--------|--------|-----------|
| Booking.com (`aid=2311236`) | ✅ LIVE — app.jsx:7450+ | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ LIVE — app.jsx:257 | $4.48 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ LIVE — app.jsx:1962 | $0.14 |
| SafetyWing (`referenceID=peakly`) | ❌ NOT IN APP — removed from live table per v43 | $0 until P1 batch ships |
| REI (Avantlink) | LLC pending | $0 |
| Backcountry / GetYourGuide | LLC pending | $0 |

**Live RPM: $11.52/1K MAU. Adds $0.54 when SafetyWing anchor ships.**

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (app.jsx:8317) | ✅ |
| 3 | Duplicate venues deleted | ❌ val-d-isere-s16 still live |
| 4 | abasin lateSeason:true | ✅ |
| 5 | GEAR_ITEMS live | ✅ app.jsx:257 |
| 6 | Cache buster aligned | ✅ 20260531a |
| 7 | Seasonal default "beach" N-hem summer | ✅ |
| 8 | S-hemisphere ski scoring correct | ✅ |
| 9 | Sentry non-empty | ✅ |
| 10 | **SafetyWing CTA** | ❌ P1 batch — target June 1 |
| 11 | **val-d-isere-s16 deleted** | ❌ P1 batch — target June 1 |
| 12 | **outer-banks ap OAJ → ORF** | ❌ P1 batch — target June 1 |
| 13 | **BookingConfirmSheet off flights** | ❌ P1 batch — target June 1 |
| 14 | **VPS proxy verified** | ❌ Jack — Day 27, binary launch gate |
| 15 | **Plausible domain validated** | ❌ Jack, by June 5 |
| 16 | **Smoke test post-P1-batch** | ❌ Jack, after June 1 commit |
| 17 | **Reddit post written** | ❌ Jack's voice, June 6 draft |

**10 of 17 green. 4 items are one code session. 4 items are Jack.**

---

## This Week's Top 3 Priorities Only

**1. P1 batch commit — one session, 4 code changes, < 20 min (target June 1)**

- SafetyWing anchor: one `<a href="https://safetywing.com/?referenceID=peakly">` in VenueDetailSheet insurance section
- val-d-isere-s16: delete app.jsx:567 + update app.jsx:5301 (`"val-d-isere-s16"` → `"tignes"`)
- OAJ→ORF: one token change at app.jsx:585
- BookingConfirmSheet bypass: app.jsx:7470, replace `setBookConfirm({...})` with `window.open(flightUrl, "_blank", "noopener,noreferrer"); logEvent(...)`
- Bora Bora BOB fix: free addition in same session
- Cache buster is already 20260531a ✅ — no bump needed unless today's session changes code

**2. Jack: VPS SSH — Day 27, no more slippage (T-7 hard deadline)**

```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"
```

Verify `/health` shows `weather_proxy: true`. This is the binary launch gate.

**3. Jack: Manual smoke test after P1 batch + niche sub soft launch June 3–4**

After the batch commits: open incognito, open 3 venues, tap "Book Flights" — verify no modal, Aviasales opens, Outer Banks shows ORF-based pricing, Val d'Isere not duplicated. Then confirm Plausible fires `booking_click`. Then write r/skiing + r/traveldeals posts for June 3–4 to generate early user reactions before June 7.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Additional venue additions** | Content freeze through June 7. Off-season venues added this week (Goa monsoon, Bansko ski-off) dilute first-impression quality without adding usable options for launch-day users. |
| **JSON-LD structured data** | Valid SEO lift (~15% impression growth at 3 months) but 0 impact on June 7 Reddit traffic. SEO compounds slowly. Reddit converts in hours. Do after post lands. |
| **Hotels in deal score** | Deferred to v2 per 2026-05-07 decision. No reopening. Flights+conditions is the moat; hotels add scope without improving the core promise. |
| **skiPass field for 25 venues** | Real data gap, not a launch gate. Users aren't making purchase decisions based on pass type in v1. Post-launch sprint. |
| **Pro UI revival** | Cut for v1 per PM 2026-05-08. Not reopening until 1K MAU and a real revenue gap is demonstrated. |

---

## 90-Day Projection

| Scenario | Users (90d) | Condition |
|----------|-------------|-----------|
| June 7 post + VPS live + P1s shipped | **6K–8K** | Post hits top 10 r/solotravel; proxy absorbs spike; BookingConfirm bypass improves conversion |
| June 7 post + VPS down | **1K–2K** | Empty grid in hour 1; "broken" comments kill organic tail permanently |
| Slip to June 14 | **3K–5K** | Summer competition ramps; r/solotravel moderators more skeptical of "just launched" posts; 35% effectiveness reduction |
| No Reddit post in June | **<1K** | Organic only |

**The gap between 8K and 2K is one SSH command. Day 27.**

---

## One Product Risk Nobody Is Talking About

**The June 7 post is a single-shot with no social proof and no regression detection window.**

Two failure modes that nobody has a plan for:

**Failure mode 1 — no social proof.** The top comment on every "I built a thing" Reddit post is "does this actually work?" Peakly has zero testimonials, zero "X people used this" signal, zero reviews. A skeptical first comment that gets 10 upvotes before the thread hits 50 views ends the post's momentum. The fix (niche sub soft launch June 3–4) is in Decision 3 above. If it doesn't happen, the June 7 post relies on product quality alone to overcome the "just launched" skepticism.

**Failure mode 2 — no manual smoke test after the P1 batch.** The DevOps smoke script catches parse/render failures. It doesn't catch: wrong flight URL from OAJ fix typo, SafetyWing anchor going to 404, val-d-isere-s16 deletion breaking another reference. If the P1 batch ships June 1 and has a silent regression, there's a 6-day window where the live site is broken and nobody notices until the Reddit post goes live. Sentry won't surface a wrong IATA code. Plausible won't surface it in time.

**The fix for failure mode 2:** Jack does a 10-minute manual check after the P1 batch commit. Open 3 venues. Tap "Book Flights" on each — verify no modal, Aviasales opens. Open Outer Banks — verify ORF-based pricing in the detail sheet. Open Tignes — verify val-d-isere is not a separate entry in search. That 10 minutes closes the 6-day blind spot. It cannot be delegated to a script.
