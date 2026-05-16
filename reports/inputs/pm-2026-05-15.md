# Peakly PM Report — 2026-05-15 (v34)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status:** YELLOW. The UX + APNS blitz of 05-13 was the most productive day since the pivot. DevOps P1 fixes landed today (surf meta, hardcoded URLs). Two P0s remain before Reddit: VPS SSH and GEAR_ITEMS restore. Reddit window closes at Memorial Day — May 22 is the hard edge.

---

## Shipped Since Last Report (2026-05-14 → 2026-05-15)

| What | Right call? |
|------|-------------|
| **DevOps P1-A: 6 stale "surf" references fixed in index.html** (commit 4d16e3d) — meta, title, OG, Twitter, JSON-LD, noscript `<h1>`. Venue count corrected 180+ → 154. | ✅ Right. 12 days of Google indexing Peakly as a surf app. Fixed before any more crawls. |
| **DevOps P1-B: 4 hardcoded alert URLs → FLIGHT_PROXY constant** (same commit) — lines 5115, 5127, 8577, 8601. | ✅ Right. Maintainability. One constant controls the domain, not four scattered string literals. |
| **Content report filed** (commit 597b614) — 2 new duplicate pairs surfaced (chamonix-s18, val-d-isere-s16), GEAR_ITEMS confirmed missing, data health score 65/100 baseline. | ✅ Right to file. Paste-ready GEAR_ITEMS fix included. |

**What was NOT the right call this week (already shipped, not rolling back):**
- Scoring honesty pass (18606a7) shipped without an algorithm critique as CLAUDE.md requires. Changes are directionally defensible. Process was not. Next scoring change requires a written critique in `~/.claude/plans/` before the commit. Hard rule, no exceptions.

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN | ✅ CLOSED — live at app.jsx:7 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed, CUT for v1 |
| Cache buster | ✅ CLEAN — `20260513j` aligned app.jsx / sw.js / index.html |
| SEO surf copy | ✅ CLOSED — 6 locations fixed today (DevOps 4d16e3d) |
| APNS App Store blocker | ✅ CLOSED — Capacitor gate live at app.jsx:8158 |
| Hardcoded alert proxy URLs | ✅ CLOSED — FLIGHT_PROXY wired today (DevOps 4d16e3d) |

---

## Active Bug Triage — May 15

| Bug | Severity | Status | Jack action? |
|-----|----------|--------|-------------|
| **VPS proxy redeploy — STILL UNVERIFIED** | **P0** | ❌ Day 11 | ✅ YES — `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. 10 min. Weekend pricing broken. Weather cache/dedupe offline. Alerts polling not running. Cannot launch to Reddit without this. |
| **GEAR_ITEMS missing from app.jsx** | **P0** | ❌ Day 3 | ✅ YES — Content report has paste-ready code. Amazon Associates earns $0 until this lands. CLAUDE.md claims $4.48/1K MAU — that is false. 15 min to restore. |
| **4 venue duplicates to delete** | **P1** | ❌ Day 2–3 | One batch commit. All approved. (1) pigeon-point-t27 — 190m from beach_tobago, 666 vs 5400 reviews; (2) sarakiniko-beach-t16 — same beach as beach_milos, wrong airport ap:"JMK"; (3) chamonix-mont-blanc-s18 — same mountain as chamonix, weaker stats; (4) val-d-isere-s16 — same ski domain as tignes, weaker stats. Delete all 4. |
| **outer-banks-nags-head-t7 wrong airport** | **P1** | ❌ Day 2 | `ap:"OAJ"` (Jacksonville NC — 70mi away). Correct: `ap:"ORF"` (Norfolk). Breaks flight pricing. One field change. |
| **Scoring honesty pass — no algorithm critique** | **P2** | ⚠️ WATCH | Process debt. Not rolling back. Critique required before the NEXT scoring change. Hard rule. |
| **BookingConfirmSheet on flight CTAs** | **P2** | ❌ Day 4 | 05-12 PM: keep on hotels, remove on flights. Still in place. Adds friction on highest-intent CTA. |
| **Leaflet loads unconditionally** | **P2** | ❌ Day 4 | MapView never validated by a real user. Gate behind `MAPVIEW_ENABLED = false` as decided 05-12. |
| **52 N-hem ski venues — no off-season filter** | **P2** | ❌ NEW (Content) | By June 1, most N-hem ski venues score low-confidence and disappear from front page. No seasonal copy to explain why. See product risk section. |

**Net active P0/P1:** 6. Combined Jack-keyboard: ~45 min.

---

## Explicit Product Decisions — May 15

**Decision 1: GEAR_ITEMS — SHIP THIS WEEK. Elevated to P0.**  
CLAUDE.md Revenue Model says Amazon Associates is LIVE at $4.48/1K MAU. The code says GEAR_ITEMS doesn't exist. This is a shared brain actively lying about revenue. The content report has paste-ready code — not a design question, actual ready-to-paste JavaScript. Every day it stays dark: (a) the Revenue agent files incorrect LIVE status, (b) every "Book an experience" click earns $0 on Amazon, (c) the affiliate dashboard shows no traffic and the account risks review for inactivity. **VERDICT: SHIP this week. Content paste-ready code is the unblock. No further design decisions needed.**

**Decision 2: Venue duplicates — batch delete ALL 4 + outer-banks IATA fix in one commit.**  
pigeon-point was approved on 05-13 and didn't ship. That's an execution gap, not a product debate. Two new Content findings (chamonix-s18, val-d-isere-s16) are unambiguous duplicates — same mountain/domain, weaker stats. 5 one-line edits, one commit, one cache bump. Data health goes from 65 → ~75. **VERDICT: SHIP as a single batch commit. No further discussion on any of the 5 items.**

**Decision 3: Reddit launch window — May 20–22 is the hard edge.**  
Memorial Day weekend (May 24–26) is when spontaneous-travel search traffic spikes. The ski tail (Mammoth, Whistler, Tignes — `lateSeason: true`) runs through late May in the N. hemisphere. The overlap of "ski-tail users + beach pre-Memorial-Day users" is the widest launch window Peakly will have at this stage. After May 22: that overlap closes. After June 1: ski venues thin from the front page and the Reddit post screenshots look sparse. **VERDICT: Reddit by May 22. Requires VPS + GEAR_ITEMS this weekend. If they slip, the 90-day ceiling drops ~1.5K users.**

---

## This Week's Top 3 Priorities Only

**1. VPS redeploy.** 3-command SSH. 11 days on the list. Weekend-specific pricing, weather cache, and alerts polling are dead in production. Every deal score is miscalibrated. Nothing should be labeled "launch-ready" until `/health` shows `wxCache.size > 0`.

**2. GEAR_ITEMS restore.** Paste-ready code in content report. Amazon earns $0 until it lands. $4.48/1K MAU — at 5K users that's $22/mo already built. Zero engineering needed, just paste and ship.

**3. Batch data commit: 4 venue deletes + outer-banks IATA fix.** One commit. Data health 65 → ~75. Duplicate mountains confuse users who see the same venue twice in Explore. Ship before Reddit.

**Combined time: ~45 min. These three items = launch-ready state.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze until VPS live + Reddit posted. 8,928 lines, zero user validation. |
| SH skiing carousel ("Right now in the Southern Alps") | **DEFER 4–6 weeks** | Correct timing: when S. hemisphere season opens + after Reddit feedback exists. |
| Venue catalog expansion | **DEFER post-Reddit** | 147 venues (post 4 deletes) is clean. Adding pre-Reddit = adding potential data bugs. |
| Venue description fields | **DEFER post-launch** | 0/151 have them. Explore grid doesn't render them. Needs UX work before it adds value. |
| Maldives beach venue | **DEFER** | Correct addition eventually. Not a launch blocker. |
| Map clustering / satellite / filter-on-map | **DEFER post-launch** | Zero real-user validation of MapView. Gate it first. |
| Wishlists / Trips tab reveal | **DEFER** | 1K MAU gate. Hard lock. |
| Hotels in deal score | **CUT to v2** | Confirmed 05-07. Repeated. Done. |
| Peakly Pro resurrection | **CUT for v1** | Post-1K MAU if revenue data warrants. Not before. |

---

## Success Criteria — May 15

**Pre-launch checklist:**

1. ✅ **SEO meta clean** — zero "surf"/"adventure" strings. Done 05-15 (DevOps 4d16e3d).
2. ✅ **APNS gate shipped** — `showAlertsTab` logic at app.jsx:8158. Done 05-13.
3. ✅ **Cache buster aligned** — `20260513j` across app.jsx / sw.js / index.html.
4. ❌ **VPS proxy redeploy verified** — Day 11. `/health` must show `wxCache.size > 0`.
5. ❌ **GEAR_ITEMS restored** — Amazon earns $0 until this lands.
6. ❌ **4 venue duplicates deleted + outer-banks IATA fixed** — data health <70 is a pre-launch liability.
7. ❌ **Live 5-min smoke test** — human click-through: Explore from JFK/LAX, ScoreBreakdown, flight price, empty-state CTA, Booking.com link.

Items 4–7 = ~45 min of Jack-keyboard. None are design decisions. All are pure execution.

**90-day projection:**
- **8K ceiling** (Reddit by May 22): ski tail × Memorial Day overlap is the moment. Still achievable if VPS + GEAR_ITEMS ship this weekend.
- **5K–6K floor** (Reddit by June 1): ski venues thin, no ski-tail boost, competing against established beach apps at peak.
- **<4K** (Reddit after June 1): the window closed. Don't let this happen.

---

## One Product Risk Nobody Is Talking About

**The ski season is ending, and the front page is about to visibly thin — with no seasonal copy to explain why.**

By June 1, `scoreWeekend` returns `confidence: "low"` for most N-hem ski venues. The front page filters these out (by design — correct). What users see: the Explore grid quietly shrinks from 60 venues to ~35, then to ~20, and nobody explains why. A user who discovers Peakly in late May sees a thin, beach-heavy grid with half the skiing section missing and will not conclude "ah, confidence filtering is working." They'll conclude "this app is incomplete."

The filter-aware empty state (built 05-07) handles "nothing matches your filters." It does NOT handle "it's June and skiing is over."

The fix is 10 minutes of copy — one `if` block before the generic empty-state render:
- When `activeCat === "skiing"` AND grid returns <6 cards → heading "Ski season winding down" + subhead "Southern Alps season opens in June — try Beach, or check back in November."

Without this, the Reddit post in late May will be followed by "the skiing section is empty?" comments within 48 hours. First-impression perception problems in a subreddit take months to recover from.

**PM call: add the seasonal copy before Reddit launch. 10 minutes. Makes the ski-thinning look intentional, not broken.**
