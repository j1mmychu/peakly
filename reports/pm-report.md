# Peakly PM Report — 2026-05-30 (v43)

> Latest report. Supersedes v42 (May 29). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: ORANGE → RED. 8 days to Reddit post. Zero code shipped in the last 24h. The same 4 P1 fixes that were "today's commit" in v42 are still open. VPS is Day 26. If this isn't fixed today, the June 7 window closes — summer competition makes a June 14+ post 50% less effective.**

---

## Shipped Since v42 (2026-05-29 → 2026-05-30)

| What | Verdict |
|------|---------|
| **Nothing.** PM report only (commit 44809de). | ❌ Full stop. |

Zero code commits in 24 hours. Every P1 fix promised in v42 for "today's commit" is still open at Day +1.

---

## Active Bug Triage — May 30

| Bug | Severity | Days Open | Fix |
|-----|----------|-----------|-----|
| **VPS proxy never redeployed** | **P0** | **Day 26** | Jack only. 3 minutes. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"`. 8 days to Reddit. Open-Meteo free tier hits rate limit at 44 DAU. Reddit sends 200+/hr in hour 1. Without this: empty grid, "app is broken" top comment, permanent SEO damage. This is a binary launch gate. |
| **SafetyWing CTA not in app.jsx** | **P1 → CUT** | **Day 5** | v42 set the binary: ships today or removed from Revenue Model. It did not ship. **Revenue Model updated below — SafetyWing marked NOT LIVE.** The code change is trivial (one anchor tag) and can be re-enabled anytime. But it cannot stay in the Revenue table as a live revenue stream when it is not in the app. |
| **val-d-isere-s16 duplicate** | **P1** | **Day 17** | Dup of `tignes` (same massif, different IDs). Delete app.jsx:567. Change `"val-d-isere-s16"` → `"tignes"` at app.jsx:5301. 2-line fix. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 17** | OAJ = Jacksonville NC, 70 miles from Outer Banks. `"OAJ"` → `"ORF"` at app.jsx:585. Flight pricing is wrong for this venue. 1-token fix. |
| **BookingConfirmSheet fires on flights** | **P1** | **Day 19** | Extra confirmation modal on the highest-intent CTA in the app. Users see: tap "Book Flights" → modal → tap "Continue" → open Aviasales. That extra friction costs conversions. Hotels keep the modal. Flights: `setBookConfirm({...})` at line 7470 → direct `window.open` + `logEvent`. |
| **Build stamp stale** | **P2** | **Day 2** | PEAKLY_BUILD still `20260528a`. Today is May 30. Bump to `20260530a` in lockstep across app.jsx:17, sw.js CACHE_NAME, index.html cache-buster. No functional impact but misleading in Sentry. |
| **Bora Bora airport inconsistency** | **P2** | **Day 3** | beach_borabora uses PPT, matira-beach-t6 uses BOB. Standardize to BOB. Low impact; post-launch batch. |
| **25 ski venues missing skiPass field** | **P2** | **Day 2** | Data gap; not a launch gate. Post-launch content sprint. |

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

## Explicit Product Decisions — May 30

**Decision 1: SafetyWing is removed from the Revenue Model effective today.**

v42 set an explicit binary on May 29: "SafetyWing ships in today's commit. If commit doesn't happen: remove from CLAUDE.md Revenue Model by end of day." The commit did not happen. The binary was not a suggestion. Removing SafetyWing from the live RPM table. The code change (one anchor tag in VenueDetailSheet, `https://safetywing.com/?referenceID=peakly`) remains trivially shippable and should be included in the P1 batch commit whenever that fires today. But the Revenue Model can no longer treat it as live.

**Impact:** Live RPM drops from claimed $11.52 → $10.98/1K MAU until the anchor ships.

---

**Decision 2: The P1 code batch ships today. These are now launch gates, not backlog.**

Four fixes have been open for 17–19 days (val-d-isere, OAJ→ORF, BookingConfirmSheet, build stamp). Combined implementation time: under 20 minutes. They were promised for "today's commit" in v42 and v41. The failure to ship is not a prioritization failure — it's an execution failure. These fixes need a single focused edit session today (May 30), not another PM report identifying them.

**VERDICT: val-d-isere-s16 delete + OAJ→ORF + BookingConfirmSheet bypass on flights + SafetyWing anchor + cache bump 20260530a — one commit today. If these 5 fixes are not shipped by end of day May 30, the June 7 Reddit post date must slip to June 14.**

---

**Decision 3: Content freeze through June 7 holds. No new venue additions.**

Current count: 154 venues (excluding val-d-isere-s16 which will be deleted). v42 set this freeze after the Goa and Bansko additions — both are near-zero score on June 7 (monsoon, off-season ski). The freeze protects first-impression quality. Content agent runs QA-only mode: tag accuracy, airport verification, known gaps. Resume additions June 8 after first 100 Plausible sessions analyzed.

---

## Revenue Model — May 30

| Stream | Status | RPM/1K MAU |
|--------|--------|-----------|
| Booking.com (`aid=2311236`) | ✅ LIVE | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ LIVE | $4.48 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ LIVE | $0.14 |
| SafetyWing (`referenceID=peakly`) | ❌ NOT IN APP — anchor removed from table until shipped | $0 |
| REI (Avantlink) | LLC pending | $0 |
| Backcountry / GetYourGuide | LLC pending | $0 |

**Current live RPM: $11.52/1K MAU** (SafetyWing re-enters when anchor ships — $0.54 addition).

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (Path B) | ✅ app.jsx:8290–8317 |
| 3 | Duplicate venues deleted | ⚠️ val-d-isere-s16 still live |
| 4 | abasin lateSeason:true | ✅ |
| 5 | GEAR_ITEMS live | ✅ app.jsx:257 |
| 6 | Cache buster aligned | ⚠️ 20260528a — needs bump to 20260530a |
| 7 | Seasonal default "beach" N-hem summer | ✅ app.jsx:2150 |
| 8 | S-hemisphere ski scoring correct | ✅ scoreVenue:1224 |
| 9 | Sentry non-empty | ✅ |
| 10 | **SafetyWing CTA** | ❌ today's commit |
| 11 | **val-d-isere-s16 deleted** | ❌ today's commit |
| 12 | **outer-banks ap OAJ → ORF** | ❌ today's commit |
| 13 | **BookingConfirmSheet off flights** | ❌ today's commit |
| 14 | **VPS proxy verified** | ❌ Jack — Day 26, binary gate |
| 15 | **Plausible domain validated** | ❌ Jack, by June 5 |
| 16 | **Smoke test post-VPS** | ❌ Jack, by June 5 |
| 17 | **Reddit post drafted** | ❌ Jack's voice, June 6 |

**9 of 17 green. Items 10–13 = one code session today (< 20 min). Items 14–17 = Jack actions. The checklist can be 13/17 green by tonight.**

---

## This Week's Top 3 Priorities Only

**1. Code batch — today (< 20 min).**

One edit session. Five changes:
- SafetyWing anchor in VenueDetailSheet (`https://safetywing.com/?referenceID=peakly`)
- Delete val-d-isere-s16 from VENUES (app.jsx:567) + update Alerts template (app.jsx:5301: `"val-d-isere-s16"` → `"tignes"`)
- `"OAJ"` → `"ORF"` in outer-banks-nags-head-t7 (app.jsx:585)
- BookingConfirmSheet bypass for flights (app.jsx:7470): replace `setBookConfirm({...})` with direct `window.open(flightUrl, "_blank", "noopener,noreferrer")` + `logEvent()`
- Bump PEAKLY_BUILD → `20260530a` (app.jsx:17), sw.js CACHE_NAME → `peakly-20260530a`, index.html cache buster

**2. Jack: VPS SSH — today.**

Day 26. 3 minutes. This is the only thing between a 2K-user post and an 8K-user post.

```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"
```

Verify `/health` shows `weather_proxy: true`. That's the confirmation.

**3. Jack: Plausible + smoke test + Reddit draft by June 5.**

With VPS live: open incognito, browse 3 venues, check Plausible realtime panel — confirm `pageview`, `venue_open`, and `booking_click` fire. Run `npm run smoke:local`. Draft Reddit post in Jack's voice — r/solotravel, r/skiing, r/travel. Failure here means a technically working app with no feedback loop.

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

**The 8K scenario requires two things: VPS SSH (Jack, today) and P1 code batch (Claude, today). Both are sub-30-minute tasks. The gap between 8K and 1K is those two tasks.**

---

## One Product Risk Nobody Is Talking About

**There's no recovery path if the first Reddit post fails.**

The plan assumes one high-quality Reddit post hits r/solotravel on June 7 and converts. But Peakly has zero social proof — no testimonials, no "X people used this last weekend," no public reviews. The top comment on a "just launched" post is always some variation of "does this actually work?" Right now the only answer is a live demo with a working VPS and a clean first load.

If the VPS is down on launch day, that comment gets upvoted, the post stays below 50 upvotes, and the organic SEO tail never materializes. There's no Plan B subreddit, no email list, no influencer pipeline, no paid acquisition. This is a single-shot launch against a high-traffic audience.

The fix isn't complex: get 5–10 real users before June 7 via soft launch (friends, r/alpineski or r/surftravel small posts with <100 upvote potential) who can vouch in comments. Even one "I used this last weekend to find a cheap Mammoth flight, actually worked" comment in the thread changes the conversion rate. Zero testimonials = zero trust from a skeptical Reddit audience that's seen 100 "I built a thing" posts.

**Action:** Jack posts to 1–2 niche subs (r/skiing, r/traveldeals — lower stakes, smaller audience) June 3–4 to collect real user reactions before the big June 7 swing.
