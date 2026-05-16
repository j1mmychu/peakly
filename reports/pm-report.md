# Peakly PM Report — 2026-05-16 (v35)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status:** RED. T-4 days to Reddit hard edge (May 20). Zero commits overnight. VPS P0 is now Day 12 — 12 consecutive PM reports have listed the same 3-command SSH. GEAR_ITEMS P0 is Day 4. Both are execution gaps, not design questions. Nothing about the product improves today unless Jack opens a terminal.

---

## Shipped Since Last Report (2026-05-15 → 2026-05-16)

**Nothing shipped.** The last code commit was `4d16e3d` on 2026-05-15 14:13 UTC (DevOps: surf meta + hardcoded URL fixes). No overnight commits from any agent or manual session.

**Was the cadence right?**
The DevOps and Content agents filed accurate reports. The PM report correctly identified VPS + GEAR_ITEMS as the only blockers. None of that matters if the P0s don't close. Reporting quality is high. Execution velocity is zero.

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN | ✅ CLOSED — live at app.jsx:7 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed, CUT for v1 |
| SEO surf/adventure copy | ✅ CLOSED — 6 locations fixed 2026-05-15 |
| APNS App Store blocker | ✅ CLOSED — Capacitor gate live at app.jsx:8158 |
| Cache buster | ✅ CURRENT — `20260513j` aligned. No new code = no new bump needed. |

---

## Active Bug Triage — May 16

| Bug | Severity | Days Open | Jack action required? |
|-----|----------|-----------|-----------------------|
| **VPS proxy redeploy** | **P0** | **12** | ✅ YES. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. 5 min. This is day 12. Weekend pricing is wrong, weather cache is offline, alerts polling is not running. |
| **GEAR_ITEMS missing from app.jsx** | **P0** | **4** | ✅ YES. Amazon earns $0. Content report has paste-ready code. CLAUDE.md Revenue Model claims $4.48/1K MAU — this is false. 15 min. |
| **4 venue duplicates not deleted** | **P1** | **3** | ✅ YES (or code agent). Approved May 13–15, never shipped. (1) `pigeon-point-t27` — 190m from `beach_tobago`, 666 vs 5400 reviews. (2) `sarakiniko-beach-t16` — same beach as `beach_milos`, wrong ap:"JMK". (3) `val-d-isere-s16` — same ski domain as Tignes, weaker stats, lateSeason tag already on Tignes. (4) `chamonix-mont-blanc-s18` — dup of chamonix. Batch delete, one commit. |
| **outer-banks-nags-head-t7 wrong IATA** | **P1** | **3** | Code: `ap:"OAJ"` (Jacksonville NC, 70mi away). Correct: `ap:"ORF"` (Norfolk). Breaks flight pricing for this venue. One field change. |
| **MapView not gated** | **P2** | **5** | Decided May 12 to gate behind `MAPVIEW_ENABLED = false`. Never shipped. MapView still loads when `viewMode === "map"`. Leaflet renders unconditionally. No user has validated MapView. Low urgency but a broken decision. |
| **BookingConfirmSheet friction on flights** | **P2** | **5** | May 12 decision: keep on hotels, remove on flights. Still present. Medium-intent friction on highest-converting CTA. |
| **Ski season thinning — no seasonal copy** | **P2** | **2** | By June 1, N-hem ski venues disappear from front page (low confidence). Grid looks empty/broken with no explanation. 10-min copy fix. Should ship before Reddit. |

**Net open P0/P1: 6 items. Combined execution time: ~55 min.**

---

## Explicit Product Decisions — May 16

**Decision 1: VPS diagnosis — escalate from "redeploy" to "confirm it's alive."**

Twelve PM reports have listed the same 3-command SSH. Something is preventing this from happening — credentials lost, VPS unreachable, or it's genuinely being deprioritized. Before report 36 writes "VPS Day 13," we need an answer to: *is the VPS actually accessible?* Minimum test: `ping 198.199.80.21` or `curl -s https://peakly-api.duckdns.org/health`. If it's down or unreachable, the entire proxy infrastructure (weekend pricing + weather cache + alerts) needs a recovery path, not just a `pm2 restart`. **PM decision: before the end of today, Jack runs the connectivity check and reports back. If unreachable, that's a P0 infrastructure outage — not a redeploy ticket.**

**Decision 2: Venue data batch commit — SHIP TODAY. No more deferral.**

Four duplicate venues and one wrong IATA code have been approved for 3 days. Each day they stay: (a) users in Tobago, Milos, Val d'Isère, and Outer Banks see duplicate or mispriced venues, (b) flight pricing for Outer Banks fails, (c) data health score stays at 65. This is a code agent task, not a Jack task. The diffs are not complex. **VERDICT: SHIP in today's session. This is the last PM report that will list these as open.**

**Decision 3: Reddit launch — May 20 is the ceiling, not the target.**

Today is May 16. May 20 is a Tuesday. Memorial Day weekend (May 24–26) is when spontaneous travel search peaks. The ideal post timing is **Saturday May 17 or Sunday May 18** — weekend morning, peak Reddit traffic, before the Memorial Day news cycle crowds it out. That means VPS + GEAR_ITEMS need to close today, venue batch needs to ship today, and a 5-minute human smoke test happens tonight. If VPS is genuinely broken (see Decision 1), the post still goes out without live flight pricing — we label prices as estimates (~$X) and the copy leads with conditions, not deals. **The post cannot slip past May 22. May 17–18 is the target.**

---

## This Week's Top 3 Priorities Only

**1. VPS: connectivity check + redeploy or declare infrastructure failure.**
Not "redeploy when you get to it." A diagnostic answer by EOD today. If it's alive: `git pull && pm2 restart`, done. If it's not: escalate to recovery plan. The ambiguity is the problem.

**2. GEAR_ITEMS + venue batch commit — code agent can do both.**
Paste-ready code in content report for GEAR_ITEMS. Four 1-line deletes + one field change for venue batch. One commit, one cache bump, done. Amazon earns $0 until GEAR_ITEMS ships — at projected 5K users that's $22/mo sitting unearned.

**3. Reddit post draft — write it today, post it this weekend.**
Not a feature. Not a code change. Write 300 words in r/solotravel or r/skiing draft format. Lead with the score transparency angle ("it tells you *when not to go*"). Include one screenshot of ScoreBreakdown. This should exist before the weekend, not after.

**Everything else is explicitly blocked until these three close.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx features | **HARD BLOCK** | 8,837 lines. Feature freeze until Reddit posted + first 48h of user feedback reviewed. |
| Venue catalog expansion | **DEFER post-Reddit** | 150 venues (146 post-batch-delete) is clean. Adding pre-Reddit = adding potential data bugs. |
| SH skiing carousel | **DEFER 4–6 weeks** | Right idea, wrong timing. S. hemisphere season opens in June. |
| Map clustering / satellite / filter-on-map | **DEFER post-launch** | Zero user validation of MapView. Gate it first. |
| Wishlists / Trips tab reveal | **DEFER** | 1K MAU gate. Hard lock. |
| Hotels in deal score | **CUT to v2** | Confirmed 05-07, 05-12, 05-13, 05-15. Not reopening. |
| Peakly Pro resurrection | **CUT for v1** | Post-1K MAU. Formally dead for now. |
| Venue description fields | **DEFER post-launch** | 0/150 have them. UX work needed before it adds value. |
| Onboarding scoring explainer | **DEFER** | ScoreBreakdown handles trust inline. Needs Reddit feedback to know what to explain. |

---

## Success Criteria — May 16

**Pre-launch checklist (unchanged from May 15, because nothing shipped):**

1. ✅ **SEO meta clean** — zero "surf"/"adventure" in index.html. Done 05-15.
2. ✅ **APNS gate shipped** — `showAlertsTab` at app.jsx:8158. Done 05-13.
3. ✅ **Cache buster aligned** — `20260513j` across all 3 files.
4. ❌ **VPS redeploy verified** — Day 12. `/health` must show `wxCache.size > 0`.
5. ❌ **GEAR_ITEMS restored** — Amazon earns $0 until this lands.
6. ❌ **Venue batch commit** — 4 dups deleted + outer-banks IATA fixed. Data health 65 → ~75.
7. ❌ **Live 5-min human smoke test** — Explore from JFK/LAX, ScoreBreakdown, flight price, empty-state CTA, Booking.com link.

**3 of 7 done. 4 of 7 = ~1 hour of execution.**

**90-day projection:**

| Scenario | Users | Condition |
|----------|-------|-----------|
| Post by May 18 (this weekend) | **8K–12K** | VPS live, GEAR_ITEMS in, strong first impression, ski-tail × Memorial Day overlap |
| Post by May 22 | **6K–8K** | Partial window capture, ski venues start thinning |
| Post by June 1 | **4K–5K** | Ski tail gone, competing as beach-only vs established apps at Memorial Day peak |
| Post after June 1 | **<4K** | Window closed |

The delta between May 18 and June 1 is 4K–8K users — purely a function of execution speed on two P0s.

---

## One Product Risk Nobody Is Talking About

**The five UX redesigns that shipped May 12–15 have never been tested together as a single flow.**

In the span of 4 days: the splash screen got a new value prop (a470b32), the front page got a stack-header redesign (eb03498), the Alerts page was simplified (e37223c), the Profile was condensed (08d0b9d), and the VenueDetailSheet was consolidated (8161fc3). Each change was individually defensible. No one has walked through the full cold-start → explore → detail → alert → profile flow since all five landed.

The risk: a transition break, a missing prop, a z-index collision, or a state management issue that only surfaces across multiple tabs. The smoke test catches "does it render." It does not catch "does tapping Set Alert from a detail sheet still open the right Alerts tab, or does it open a blank screen because the Profile condensation changed state shape?"

Plausible shows events — it does not show whether the event sequence makes sense. The only real guard here is a human walking the full flow on a phone before the Reddit post goes out. This is the QA call the May 13 report identified and every report since has echoed. It's still not done. If the Reddit post goes out before this happens, the first negative comment will identify something in this stack that 4 days of agent reports missed.

**PM call: this is the gate condition for the Reddit post. Walk the full flow first.**
