# Peakly PM Report — 2026-05-19 (v36)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: RED. VPS is Day 15. GEAR_ITEMS dark Day 7. Reddit window closes in 3 days. The pre-launch checklist is 4/10.**

Other agents are shipping (DevOps bumped cache buster to `20260519a` today, Content filed). Code is moving. The two P0s that only Jack can unblock have not moved in 15 and 7 days respectively.

---

## Shipped Since Last PM Report (2026-05-18 → 2026-05-19)

| What | Assessment |
|------|------------|
| **DevOps: cache buster bumped `20260513j` → `20260519a`** (commit 0c92685) — fixed a missed bump from the 05-15 deploy. Users on stale SWs were serving old app.jsx. | ✅ Right call. Correctness fix. |
| **DevOps report filed** (commit 0c92685) — audited Supabase + Babel dep currency; 1 P1 Supabase bump flagged. | ✅ Right call. |
| **Content report filed** (commit 2e29fd2) — data health audit, venue coverage, GEAR_ITEMS status confirmed missing. | ✅ Right call to file. |
| **PM report filed for May 18** (commit 921e548) — correctly escalated P0 stall. | ✅ Right call. |

**What has NOT shipped in 4 days:** VPS redeploy (P0, Jack only), GEAR_ITEMS (P0, paste-and-ship), 4 venue deletes (P1), BookingConfirmSheet on flights (P1), seasonal ski copy (P1).

---

## Bug Triage — May 19

**Permanently closed:**
- ✅ Sentry DSN — live (app.jsx:8)
- ✅ Peakly Pro $9/mo display — CUT for v1, UI removed
- ✅ Cache buster stale — FIXED today by DevOps → `20260519a`
- ✅ SEO surf copy — fixed 05-15 (DevOps 4d16e3d)
- ✅ APNS App Store gate — live at app.jsx:8158
- ✅ Hardcoded alert proxy URLs — FLIGHT_PROXY wired 05-15
- ✅ chamonix-mont-blanc-s18 duplicate — confirmed not in VENUES

**Active:**

| Bug | Severity | Days Open | Owner |
|-----|----------|-----------|-------|
| **VPS proxy redeploy** | **P0** | ❌ Day 15 | JACK ONLY — `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. 10 min. Weekend pricing broken, weather cache offline, alerts polling dead. |
| **GEAR_ITEMS missing** | **P0** | ❌ Day 7 | JACK — Content report (05-15) has paste-ready code. Amazon earns $0. CLAUDE.md Revenue Model says "$4.48/1K MAU LIVE" — that's been false for 7 days. |
| **4 venue duplicates in VENUES** | **P1** | ❌ Day 4 | Claude — (1) pigeon-point-t27 (190m from beach_tobago, 666 vs 5400 reviews); (2) sarakiniko-beach-t16 (same beach as beach_milos, wrong ap:"JMK"); (3) val-d-isere-s16 (same ski domain as Tignes, weaker stats); (4) outer-banks-nags-head-t7 (dup of beach_ob, ap:"OAJ" wrong + 1,209 vs 18,600 reviews — delete, don't fix IATA). One batch commit. |
| **BookingConfirmSheet on flight CTAs** | **P1** | ❌ Day 7 | Claude — Decision 05-12: remove on flights, keep on hotels. app.jsx:7311 still fires the confirm sheet for `kind:"flight"`. Route directly to `window.open(flightUrl, "_blank")`. |
| **Seasonal ski empty-state copy missing** | **P1** | ❌ Day 4 | Claude — N-hem ski grid thins to ~8 cards by June 1. No copy explains why. Users see "broken app," not "seasonal filter working correctly." |
| **Leaflet loads unconditionally** | **P2** | ❌ Day 7 | Claude — Gate behind `const MAPVIEW_ENABLED = false`. Decision: 05-12. |

**Net active: 2 P0s (Jack only), 3 P1s + 1 P2 (Claude-executable). Combined Claude work: ~30 min.**

---

## Explicit Product Decisions — May 19

**Decision 1: May 21 EOD is the actual Reddit deadline.**

Reddit's peak engagement on r/travel and r/skiing is Friday morning Pacific. To hit that slot for May 23 (Friday), the site needs to be launch-ready by Thursday May 22 early morning — which means code-complete and smoke-tested by May 21 EOD. Two days. VPS + GEAR_ITEMS must close today or tomorrow. After May 21: post what you have. An imperfect launch beats missing the ski-tail × Memorial Day window entirely. **VERDICT: May 21 EOD. No extension.**

**Decision 2: outer-banks-nags-head-t7 — DELETE, not IATA-fix.**

Four consecutive reports flagged this as a wrong-airport correction (OAJ → ORF). Confirmed today: it's also a full duplicate of `beach_ob`, which covers the same Outer Banks geography with 18,600 vs 1,209 reviews, 4.89 vs 4.72 rating, and already has the correct ORF airport. The correct fix is deletion, not a field edit. beach_ob represents this destination. **VERDICT: DELETE in the venue batch commit. 4 total deletes, one commit, data health ~65 → ~78.**

**Decision 3: Seasonal ski empty-state — SHIP before Reddit. Non-negotiable.**

By June 1, `scoreWeekend` returns `confidence: "low"` for most N-hem ski venues; they drop from the front page (by design — correct behavior). A new user who selects Skiing in late May sees 5–10 cards with zero explanation. Current copy: "Quiet for skiing this weekend. Other categories may be firing." — reads as a bug, not a feature. Fix: add one `if` branch before the generic empty state. When `activeCat === "skiing"` AND grid < 8 results AND month is May–September → heading "Ski season wrapping up in the Northern Alps" + subhead "Southern hemisphere season opens in June — try Beach, or check back in November." **VERDICT: SHIP with the venue batch. 10 minutes. Not optional before Reddit.**

---

## This Week's Top 3 Priorities Only

**1. VPS redeploy (Jack, ~10 min).** One SSH command. Day 15. Every deal score in production is miscalibrated. Every user sees wrong weekend prices. This is the single biggest gap between what we built and what users are experiencing. Cannot post to Reddit with this broken.

**2. Venue deletes + P1 code fixes (Claude, ~30 min).** One commit: delete 4 venue duplicates + route flight CTAs past BookingConfirmSheet + add seasonal ski empty-state copy + gate Leaflet. All Claude-executable. These should ship today while Jack handles the VPS.

**3. GEAR_ITEMS restore (Jack, ~15 min).** Paste-ready code from May 15 content report. Amazon Associates earns $0 until this lands. $4.48/1K MAU × even 1K Reddit users = real money that's already turned off.

**After these three: Reddit post. Nothing else.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any net-new feature | **HARD BLOCK** | Feature freeze until VPS live + Reddit posted. No exceptions. |
| Southern hemisphere ski carousel | **DEFER 2 weeks** | Build it after Reddit tells us if skiing is what users care about. |
| JSON-LD structured data | **DEFER post-Reddit** | SEO compounds over 6–8 weeks. Not a Reddit launch signal. |
| Venue catalog expansion | **DEFER post-Reddit** | Net-deleting 4 this week. Launch at 146 clean venues. |
| Share-a-list Supabase SQL deploy | **DEFER post-Reddit** | v2 viral feature. Wrong timing pre-launch. |
| Hotels in deal score | **CUT to v2** | Final answer. Stop asking. |
| Peakly Pro revival | **CUT for v1** | Post-1K MAU only if revenue data forces it. |

---

## Success Criteria

**Pre-launch checklist:**

| Item | Status |
|------|--------|
| SEO meta clean (no surf/adventure copy) | ✅ DONE |
| Sentry DSN populated | ✅ DONE |
| APNS gate for iOS App Store | ✅ DONE |
| Cache buster aligned | ✅ DONE — `20260519a` as of today |
| VPS proxy verified (`/health` shows `wxCache.size > 0`) | ❌ Day 15 |
| GEAR_ITEMS in app.jsx | ❌ Day 7 |
| 4 venue duplicates deleted | ❌ Day 4 |
| BookingConfirmSheet removed from flight CTAs | ❌ Day 7 |
| Seasonal ski empty-state copy | ❌ Day 4 |
| Live 5-min smoke test (human click-through) | ❌ Pending above |

**4 of 10 done. 6 remain. ~1.5 hours of total work. 2 days to hard deadline.**

**90-day projection:**
- **8K (stretch):** Reddit by May 21, VPS live, ski-tail × Memorial Day overlap captured. Requires closing the stall today.
- **5K–6K (base):** Reddit May 25–28, ski venues thinned, no tail-season boost.
- **<4K:** Reddit in June. The "skiing + beach" pitch reads as a beach-only app in screenshots. Window closed.

**The 3K gap between 5K and 8K is determined by whether Jack does the VPS SSH today.**

---

## One Product Risk Nobody Is Talking About

**We are building features onto a product that produces wrong deal scores for every user.**

The VPS proxy — with its shared weather cache, deduplication, and weekend-specific Travelpayouts pricing — has been down for 15 days. Every venue score on the live site is using direct Open-Meteo calls with no shared cache (meaning each of N concurrent users makes N upstream calls) and month-cheapest flight prices instead of upcoming-Friday-specific prices. The "scoring honesty pass" shipped on May 13 made the scores more accurate in theory. In practice, they're running on stale inputs.

The risk: we post to Reddit, 3,000 people hit the site, the scores look wrong (they are), and someone notices that "Zermatt is showing a 78 in mid-May but there's been no snow for two weeks." The wrong-score problem is not cosmetic — it's the core product promise. Every day the VPS is down is a day the product is lying to users about whether conditions are worth booking.

**Fix: one SSH command. Today.**
