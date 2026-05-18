# Peakly PM Report — 2026-05-18 (v35)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: RED.** Zero commits in 3 days. Reddit deadline is May 22 — 4 days away. Both P0s from the May 15 report are still open. VPS is now Day 14 unresolved. GEAR_ITEMS still missing. The Memorial Day window is actively closing.

---

## Shipped Since Last Report (2026-05-15 → 2026-05-18)

**Nothing.** Three full days of silence.

This is the most consequential 72-hour gap in the project's history. The May 22 Reddit window was set because Memorial Day (May 24–26) + ski-tail (Mammoth/Whistler/Tignes) is the widest acquisition overlap Peakly will have pre-summer. That window is now 4 days away. Both blocking items require Jack's keyboard, not code.

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN | ✅ CLOSED — live at app.jsx:7 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed, CUT for v1 |
| Cache buster | ✅ CLEAN — `20260513j` aligned; cosmetically stale but correct (reflects last actual code change) |
| SEO surf copy | ✅ CLOSED — 6 locations fixed 05-15 |
| APNS App Store blocker | ✅ CLOSED — Capacitor gate live |
| Hardcoded alert proxy URLs | ✅ CLOSED — FLIGHT_PROXY wired 05-15 |

---

## Active Bug Triage — May 18

| Bug | Severity | Days Open | Jack action? |
|-----|----------|-----------|-------------|
| **VPS proxy redeploy — UNVERIFIED** | **P0** | ❌ Day 14 | `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. 3 commands. 10 min. Weekend pricing broken. Weather cache offline. Alerts polling dead. |
| **GEAR_ITEMS missing from app.jsx** | **P0** | ❌ Day 6 | Content agent filed paste-ready code. Amazon earns $0 until this lands. |
| **4 venue duplicates still live** | **P1** | ❌ Day 5 | pigeon-point-t27 (190m from beach_tobago, 666 vs 5400 reviews), sarakiniko-beach-t16 (same beach as beach_milos, wrong airport JMK vs MLO), val-d-isere-s16 (same ski domain as tignes, weaker stats), outer-banks ap:"OAJ" → should be ap:"ORF". One batch commit. |
| **BookingConfirmSheet on flight CTAs** | **P2** | ❌ Day 7 | Decision: keep on hotels, remove on flights. Flight CTA at app.jsx:7311 still fires the sheet. Adds a tap of friction on the highest-intent action in the app. |
| **MapView not gated** | **P2** | ❌ Day 7 | `MAPVIEW_ENABLED = false` never added. Leaflet loads on every session. Zero real-user validation of map tab. |
| **Seasonal ski copy missing** | **P2** | ❌ Day 4 | By June 1, N-hem ski venues thin from ~64 to ~20 visible cards. No copy explains why. Per May 15 report: 10-minute fix before Reddit. Still not done. |

**Net: 2 P0s, 1 P1 with 4 sub-items, 3 P2s. Combined Jack-keyboard on P0+P1: ~55 min.**

---

## Explicit Product Decisions — May 18

**Decision 1: Reddit date slips to May 21 — the absolute floor.**

May 22 was the hard edge. Today is May 18. That gives one viable launch window: this **Wednesday or Thursday** (May 21–22). VPS + GEAR_ITEMS must ship today or tomorrow. If both clear by tonight, Wednesday launch is achievable. If either slips past tomorrow evening, the ski-tail × Memorial Day window closes and the 90-day ceiling drops from 8K to ~5.5K users. This is not a projection — it's arithmetic on seasonal intent data.

**VERDICT: May 21 is the new floor. May 22 is the wall. There is no May 23.**

**Decision 2: Drop BookingConfirmSheet from flight CTAs before Reddit.**

The sheet adds one confirmation tap between "I want to book this" and the Aviasales link. For hotels, that friction is appropriate — it's a high-stakes, multi-night decision. For flights, it's patronizing. The user tapped "Book flight," they know what they're doing. At Reddit launch, every tap of friction on the conversion CTA is a measurable drop in affiliate revenue. The May 12 PM report said "keep on hotels, remove on flights." That decision is 7 days stale and unimplemented. **VERDICT: SHIP before Reddit. One-line diff at app.jsx:7311 — remove the `setBookConfirm` call for flights, call `window.open(flightUrl, "_blank")` directly.**

**Decision 3: Seasonal ski copy — SHIP TODAY. Not optional.**

This was called out in the May 15 report as a 10-minute fix and a "makes the ski-thinning look intentional, not broken" change. It has been 3 days. Reddit launches into r/solotravel, r/skiing, or r/travel with peak engagement during Memorial Day weekend — which starts May 24. By then, `scoreWeekend` returns `confidence: "low"` for most N-hem ski venues. The Explore grid will show ~20–25 ski cards instead of 60+. Without the seasonal copy, the first comment on the Reddit post will be "the skiing section looks half-empty." That comment buries the post. The fix is one `if` block. **VERDICT: SHIP today alongside the batch venue deletes.**

---

## This Week's Top 3 Priorities Only

**1. VPS proxy redeploy.** Day 14. Weekend-specific pricing dead. Weather cache dead. Alerts polling dead. Every deal score in production is miscalibrated. 3 SSH commands. 10 minutes. The single highest-leverage action Jack can take today.

**2. GEAR_ITEMS restore + venue batch commit (ship together).** GEAR_ITEMS paste-ready code from content report. 4 venue deletes + outer-banks IATA fix. Seasonal ski copy. BookingConfirmSheet flight fix. These 4 changes go in one commit, one cache bump. Combined time: ~30 min. Dispatch in one ship because they're all "day of" launch prep items.

**3. Reddit post written and ready to schedule.** The post itself — body copy, screenshots, subreddit list — should be drafted today so the only action on May 21 is hitting submit. If the post isn't pre-written, the launch will slip to "after I write it," and that's how May 22 becomes June 1.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze. Reddit in 4 days. Zero user validation. 8,928 lines. |
| SH skiing carousel | **DEFER 4 weeks** | After Reddit feedback. After Memorial Day. After ski season opens in SH. |
| Venue catalog expansion | **DEFER post-Reddit** | 150 venues is clean. Adding pre-Reddit adds bugs. |
| Venue description fields | **DEFER post-launch** | 0/150 have them. Needs UX work before they add signal. |
| Leaflet satellite / filter-on-map | **DEFER post-launch** | Gate MapView first. Zero validation. |
| Wishlists / Trips tab reveal | **DEFER** | 1K MAU hard lock. Not negotiable. |
| Hotels in deal score | **CUT to v2** | Confirmed three times. Done. |
| Peakly Pro resurrection | **CUT for v1** | Post-1K MAU. Not before. |
| Southern Hemisphere ski carousel | **DEFER** | Mammoth/Whistler still have snow. Don't confuse the seasonal narrative mid-launch. |

---

## Pre-Launch Checklist — Real-Time State

| Item | Status |
|------|--------|
| SEO meta clean — zero "surf" strings | ✅ Done (05-15) |
| APNS Capacitor gate | ✅ Done (05-13) |
| Cache buster aligned | ✅ 20260513j clean |
| Sentry error monitoring | ✅ Live |
| VPS proxy verified (`/health` shows `wxCache.size > 0`) | ❌ Day 14 |
| GEAR_ITEMS restored (Amazon $4.48/1K MAU) | ❌ Day 6 |
| 4 venue duplicates deleted | ❌ Day 5 |
| outer-banks-nags-head IATA fixed (`ap:"ORF"`) | ❌ Day 5 |
| BookingConfirmSheet removed from flight CTAs | ❌ Day 7 |
| Seasonal ski copy ("Ski season winding down") | ❌ Day 4 |
| Live 5-min smoke test (human click-through) | ❌ Pending |
| Reddit post written and ready | ❌ Not started |

**8 of 13 checklist items open. Combined time on all 8: ~65 min + Reddit post writing.**

---

## Success Criteria — May 18

**Metrics that define success:**
- **Week 1 post-Reddit:** ≥800 unique users, ≥12% return visit rate, ≥1 Booking.com click per 40 sessions
- **Month 1:** 3K users, bounce rate <65%, Plausible shows ≥3 sessions/user for retained cohort
- **90-day:** 8K users (aggressive) / 5K users (base case)

**What has to be true for 8K, not 5K:**
1. Reddit post lands before May 22 with ski-tail still in season — ski screenshots are the hook, beach is the breadth
2. VPS live before Reddit so deal scores are calibrated and pricing shows real weekend fares
3. Zero first-impression bugs in the post's screenshots (duplicate venues, wrong IATA, bare BookingConfirmSheet friction)
4. At least one "wow this is actually useful" comment in the first 30 minutes — that requires the ski card showing a real fare + real score, not `~$XXX` estimate from a dead proxy

**90-day projection:**
- **8K** (Reddit by May 22, VPS live, GEAR_ITEMS live): ski tail × Memorial Day overlap captured. Still achievable if today's items ship.
- **5K–6K** (Reddit by May 26, VPS still uncertain): ski venues thinning, missing Memorial Day peak, competing against established beach content.
- **<4K** (Reddit after June 1): ski season over, ski photos look wrong, beach-app competitors dominate the surface area. Don't go here.

---

## One Product Risk Nobody Is Talking About

**The VPS being down for 14 days means Peakly has never been tested at real traffic.**

The Open-Meteo weather proxy with shared in-memory cache was specifically built for Reddit-spike protection (1000 simultaneous users → 1 upstream call per venue). That code has never run in production. The in-flight dedupe logic, the LRU cache, the 4s timeout + direct fallback — all of it is untested against real concurrent load.

When the Reddit post hits and 200 users open the app in the same 10-minute window, one of two things happens: (A) the proxy absorbs it cleanly, and the launch is smooth, or (B) the proxy is misconfigured or the `pm2 restart` surfaces a bug, and 200 users hit Open-Meteo directly, trigger rate limiting, and see a broken Explore grid with no scores.

Option B is the worst possible first impression — and we'd have no way to detect it without `/health` being live. The Sentry DSN is wired but it only catches client-side errors, not server-side rate-limit failures.

**PM call: VPS must be verified — `/health` endpoint checked, a single test flight-price call confirmed — before the Reddit post goes live. Not "probably fine," confirmed green.** If the proxy can't be verified before Wednesday, the Reddit post should be delayed one day, not posted blind.
