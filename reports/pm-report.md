# Peakly PM Report — 2026-05-17 (v35)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status:** RED. Zero commits in 48 hours. Every P0 from the May 15 report is still open. Reddit window closes May 22 — that is 5 days. The May 15 report said "45 min of Jack-keyboard = launch-ready." 48 hours passed and none of those 45 minutes happened. This is no longer a PM problem; it is an execution problem.

---

## Shipped Since Last Report (2026-05-15 → 2026-05-17)

| What | Right call? |
|------|-------------|
| **Nothing.** Zero commits. | — |

**Honest assessment of prior shipped work (May 13–15):**

The front-page redesign (eb03498: stacked header, merged toolbar, slim hero) and the redesigned splash rotating teasers (e37223c) were directionally correct — the hero was cluttered. The Alerts redesign (86b5b6b) was contested: the correct call was to freeze Alerts UI until push actually works end-to-end. We shipped a third Alerts polish pass while the VPS is offline. That is energy misallocated.

The scoring honesty pass (18606a7) is the commit that worries me most. It changed variance penalty + caps + weights. Per CLAUDE.md, scoring changes require a written algorithm critique in `~/.claude/plans/` before the commit. That did not happen. I cannot audit whether those changes helped or hurt without a critique document. Process debt is on the board.

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN | ✅ CLOSED — live at app.jsx:7 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed, CUT for v1 |
| SEO surf/adventure copy | ✅ CLOSED — cleaned 05-15 |
| APNS App Store gate | ✅ CLOSED — `showAlertsTab` at app.jsx:8158 |
| Cache buster alignment | ⚠️ STALE — `20260513j` across all 3 files. Today is 05-17. Not broken, but 4 days since last bump; next ship must update. |

---

## Active Bug Triage — May 17

| Bug | Severity | Status | Jack action? |
|-----|----------|--------|-------------|
| **VPS proxy redeploy — NOT VERIFIED** | **P0** | ❌ Day 13 | ✅ YES — 3-command SSH, 10 min. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. Weekend-specific pricing dead. Weather cache/dedupe offline. Alerts polling not running. If this is not done by Monday May 19, the Reddit post cannot credibly claim live conditions + pricing. |
| **GEAR_ITEMS missing from app.jsx** | **P0** | ❌ Day 5 | ✅ YES — `grep -n GEAR_ITEMS app.jsx` returns nothing. Amazon Associates earns $0. CLAUDE.md Revenue Model claims $4.48/1K MAU — that number is false. Content report has paste-ready code. 15 min. |
| **3 venue duplicates + 1 wrong IATA** | **P1** | ❌ Day 5 | Approved in May 13 report, never shipped. (1) pigeon-point-t27: 666 reviews, 780m from beach_tobago (5400 reviews) — delete; (2) sarakiniko-beach-t16: `ap:"JMK"` wrong (Mykonos for Milos — 87mi off) — fix ap to `"MLO"` or delete if beach_milos is already there; (3) val-d-isere-s16: same ski domain as Tignes, weaker stats — delete; (4) outer-banks-nags-head-t7: `ap:"OAJ"` wrong (70mi away) — fix to `ap:"ORF"`. Wrong IATA codes break flight pricing. One batch commit, ~15 min. |
| **BookingConfirmSheet on flight CTAs** | **P2** | ❌ Day 6 | May 12 PM: remove from flights, keep on hotels. Still fires on flights at app.jsx:7311. Adds an unnecessary confirmation step before the highest-intent action. Code change: wrap `setBookConfirm` on the flight button in a direct `window.open` instead. 5 min. |
| **MapView loads Leaflet unconditionally** | **P2** | ❌ Day 6 | MAPVIEW_ENABLED gate never shipped. MapView renders at app.jsx:4384 on every Explore tab. Zero user validation. Gate it: `const MAPVIEW_ENABLED = false;` at the constants block, `{MAPVIEW_ENABLED && <MapView .../>}` at render. 3 min. |
| **Ski seasonal empty-state copy** | **P2** | ❌ NEW | When ski venues thin from the front page in late May, the grid silently shrinks with no explanation. See product risk section. |

**Net open P0/P1:** 3 items, ~40 min of keyboard time. They have been open for 5–13 days.

---

## Explicit Product Decisions — May 17

**Decision 1: BookingConfirmSheet on flights — CUT. Ship the removal.**

The booking confirm sheet made sense for an unfamiliar affiliate partner. Aviasales is the action: user tapped "Book Flight," they mean it. The sheet adds friction at the highest-intent moment and gives the impression Peakly doesn't trust its own CTA. For hotels (Booking.com), the confirm sheet is acceptable — it's a category switch, user needs a moment. For flights: direct `window.open`. Ship the removal this weekend. It is a 5-line change that has been "decided" for 6 days.

**Decision 2: MapView — GATE behind `MAPVIEW_ENABLED = false` before Reddit.**

MapView has never been seen by a real user. It is loading Leaflet (external CSS/JS) unconditionally on every Explore render, adding load time to the most important screen in the app. The correct MVP move was always "ship it behind a flag, validate with Reddit users, then remove the gate." The flag never shipped. Gate it now. If the Reddit post drives 1K sessions and 0 users request a map, we cut it in v2 and remove the dead code. If 200 users request it, we enable the flag and ship a known-working feature. This is not a close call. **VERDICT: GATE this weekend, 3 min, not optional.**

**Decision 3: Reddit launch by May 20. Non-negotiable.**

The ski-tail × Memorial Day overlap window is the widest organic launch moment this product will have in 2026. After May 22, ski venues thin, beach has to compete against peak-season established apps, and the Hacker News / r/travel seasonal cycle has moved on. The 90-day 8K ceiling requires May 20. The 5K floor is May 22. After that the trajectory drops ~150 users per day of delay.

VPS + GEAR_ITEMS must close by Sunday May 18. Human click-through (5 min) on Monday May 19. Reddit post: Monday May 19 or Tuesday May 20 at latest.

**If VPS is still not verified by Sunday evening:** post to Reddit anyway with a note in comments that flight prices are "updated weekly" — softer claim, doesn't oversell the live-proxy feature that isn't live. The VPS is a quality amplifier, not a launch blocker. Don't let infrastructure perfectionism kill the launch window.

---

## This Week's Top 3 Priorities Only

**1. VPS redeploy — Jack SSH, 10 min, by Sunday May 18.**
3 commands. The pricing and weather cache features are dark in production. If it slips past Sunday, launch without it (see Decision 3 — it's quality, not a blocker).

**2. GEAR_ITEMS restore — paste code, 15 min, by Sunday May 18.**
Amazon earns $0. The content report has paste-ready code. This is not a design decision. The shared brain is lying about revenue. Fix it.

**3. Batch data commit (P1 venues + BookingConfirmSheet + MapView gate) — by Monday May 19.**
Four data fixes + two code fixes = one commit. 25 min. Cleans data health from 65 → ~75, removes friction on the highest-intent CTA, stops Leaflet loading on every Explore render.

**Everything else is noise until these three close. Feature freeze is in effect.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze until Reddit posted and first 48h of data exists. 8,837 lines, zero user validation on 14 days of changes. |
| Additional Alerts UI polish | **CUT pre-launch** | Third pass shipped without push working end-to-end. No more Alerts UI changes until VPS is live and a push actually delivers. |
| Southern Hemisphere skiing carousel | **DEFER 6 weeks** | Correct timing: when NZ/AUS season opens in June, post-Reddit. |
| Venue catalog expansion | **DEFER post-Reddit** | 150 venues (post-deletes: ~147) is clean. Adding pre-Reddit = adding data bugs to an unvalidated dataset. |
| Venue description fields | **DEFER post-launch** | 0/150 have them. Explore grid doesn't render them. Needs UX design before it adds value. |
| MapView features (clustering, satellite) | **CUT to v2** | Zero real-user validation. Gate it first, validate demand, then build features on a validated base. |
| Wishlists / Trips tab reveal | **DEFER** | 1K MAU gate. Hard lock. |
| Hotels in deal score | **CUT to v2** | Confirmed 05-07, repeated. Done. |
| Peakly Pro resurrection | **CUT for v1** | Post-1K MAU if revenue data warrants. |
| JSON-LD structured data | **DEFER post-launch** | SEO gap (~10-15% lift estimate), medium effort, zero urgency before first traffic spike. |

---

## Success Criteria — May 17

**Pre-launch checklist:**

1. ✅ **SEO meta clean** — zero "surf"/"adventure" strings. Done 05-15.
2. ✅ **APNS gate shipped** — `showAlertsTab` at app.jsx:8158. Done 05-13.
3. ✅ **Cache buster aligned** — `20260513j` across all 3 files. (Needs bump on next ship.)
4. ❌ **VPS proxy verified** — Day 13. Must show `wxCache.size > 0` at `/health`. Soft deadline: Sunday May 18. Hard deadline: launch anyway.
5. ❌ **GEAR_ITEMS restored** — Day 5. Amazon earns $0 until this lands.
6. ❌ **3 venue deletes + 2 IATA fixes** — Day 5. Data health <70 is pre-launch liability.
7. ❌ **BookingConfirmSheet removed from flights** — Day 6. Highest-intent CTA is gated behind friction.
8. ❌ **MapView gated** — Day 6. Leaflet loads unconditionally on every Explore render.
9. ❌ **Live 5-min smoke test** — Human click-through: Explore from JFK/LAX, deal score, ScoreBreakdown open/close, flight CTA (no confirm sheet), Booking.com link, filter empty state.
10. ❌ **Reddit post drafted** — Subreddit: r/skiing, r/solotravel, or r/digitalnomad. Screenshot: Explore grid with 2-3 strong weekend scores + flight prices.

**Items 4–9 = ~55 min combined. None require design decisions. All are pure execution.**

**90-day projection (updated):**
- **8K ceiling**: Reddit by May 20. Requires VPS + GEAR_ITEMS this weekend.
- **6K floor**: Reddit May 22. Ski-tail effect partially captured; Memorial Day beach traffic included.
- **<4K**: Reddit after May 25. Ski season over, peak beach already crowded with established apps, the window closed.
- **Honest current trajectory**: If the same velocity as the last 48 hours (zero commits) holds through the weekend, Reddit doesn't happen before May 22, and the ceiling drops to 5K.

---

## One Product Risk Nobody Is Talking About

**The scoring honesty pass (commit 18606a7) changed algorithm weights without a required critique document. Nobody knows if the scores got better or worse.**

The commit modified variance penalty, soft caps, and tiebreaker weights. CLAUDE.md is explicit: "Do not modify scoring without an algorithm critique." The critique didn't happen. What this means in practice: the current deal scores on the front page may be ranking venues differently than the original algorithm intended, and there is no documented baseline to compare against. If a user posts to Reddit "why is [obviously bad venue] ranked #1?" the answer is "we don't know, we changed the weights without writing down why."

Before the Reddit post, someone needs to manually check the Explore grid from JFK, LAX, and LHR and confirm the top 5 venues in each category make intuitive sense. If they do, file a retroactive critique in `~/.claude/plans/` and close the debt. If they don't, revert to the pre-18606a7 weights and do the critique before re-applying changes.

**The fix is 10 minutes of human eyeballing the app. It is not optional before a Reddit launch where every comment will be a user questioning why their airport's results look weird.**
