# Peakly PM Report — 2026-05-22 (v37)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: RED → ORANGE. Agents shipped meaningful data fixes today. Two P0s remain (GEAR_ITEMS + VPS). Memorial Day is 48 hours away. Reddit must go up by Saturday or the window closes.**

---

## Shipped Since Last Report (2026-05-21 → 2026-05-22)

| What | Right call? |
|------|-------------|
| **Cache buster bumped to 20260522a** (DevOps, commit 16fec21) — app.jsx / sw.js / index.html aligned. Was 9 days stale while 10+ commits landed after May 13. Users were on stale JS. | ✅ Right. Overdue by 8 days. |
| **pigeon-point-t27 deleted** (Content, commit 1aa1148) — exact dup of beach_tobago, same GPS pin, same TAB airport. 666 vs 5400 reviews. | ✅ Right. Pre-launch data hygiene matters. |
| **sarakiniko-beach-t16 deleted** (Content, same commit) — dup of beach_milos with wrong airport (JMK=Mykonos, correct is MLO=Milos). Would have broken flight pricing. | ✅ Right. Wrong IATA breaks the entire pricing chain. |
| **abasin lateSeason:true added** (Content, same commit) — "Longest Season CO" tag was self-contradicting without the flag. | ✅ Right. One token. Should have shipped May 15. |
| **idre-fjall-s6 airport MXX → OSL** (Content, same commit) — MXX has no commercial service. | ✅ Right direction. |
| **6 venue tag corrections** (Content, same commit) — Lovina, Hyams, Outer Banks, Stowe tags now accurate. "Party Beach" on Hyams (quiet family beach) was a trust-killer. | ✅ Right. Tags are visible UI. |
| **Supabase 2.45.4 → 2.106.0, Babel 7.24.7 → 7.29.4** (DevOps 05-17) — security + compat upgrades. | ✅ Right. Ship dependency upgrades before launch. |

**What was NOT right (May 15 → May 21):**
Seven consecutive days of daily agent reports with zero code response on GEAR_ITEMS and VPS. Both flagged as P0. Both have paste-ready or 3-command fixes. The agents surfaced them; the fixes didn't land. That's a process gap, not an agent gap.

---

## Active Bug Triage — May 22

| Bug | Severity | Days Open | Jack action? |
|-----|----------|-----------|-------------|
| **VPS proxy redeploy — UNVERIFIED** | **P0** | **Day 18** | ✅ `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. Open-Meteo free tier breaks at 43 DAU. Reddit sends 200+ in hour 1. Don't post without this. |
| **GEAR_ITEMS missing from app.jsx** | **P0** | **Day 9** | ✅ Paste-ready code in `reports/content-report.md §2`. Amazon earns $0. Flagged 3 consecutive days by Content agent. Paste, commit, done. 15 min. |
| **val-d-isere-s16 still in VENUES** | **P1** | **Day 9** | Dup of tignes (same Espace Killy domain). Approved for delete May 13. Delete line 530 in app.jsx. Also remove `"val-d-isere-s16"` from Alerts Quick Template at line 5192. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 9** | Content fixed tags today, airport NOT fixed. OAJ=Jacksonville NC, 70mi away. Correct: `ap:"ORF"` (Norfolk). Line 548. Breaks flight pricing. |
| **Seasonal ski empty state missing** | **P1** | **Day 7** | June 1 is 10 days away. N-hem ski grid thins to <6 venues, no copy explains why. Looks broken on Reddit screenshots. 10-min fix. |
| **BookingConfirmSheet on flights** | **P2** | **Day 10** | Decision May 12: keep on hotels, remove on flights. Still in place. Extra tap on highest-intent CTA. |
| **MapView Leaflet loads unconditionally** | **P2** | **Day 10** | Gate behind `MAPVIEW_ENABLED = false`. Zero user validation. |

**Net P0/P1: 5. GEAR_ITEMS + val-d-isere-s16 + outer-banks IATA + seasonal copy = one commit, ~45 min. VPS is Jack-only (10 min).**

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed |
| Cache buster stale | ✅ CLOSED — `20260522a` aligned today |
| SEO surf copy | ✅ CLOSED — 05-15 |
| APNS Capacitor gate | ✅ CLOSED — live at app.jsx:8158 |
| pigeon-point-t27 duplicate | ✅ CLOSED — deleted today |
| sarakiniko-beach-t16 + wrong airport | ✅ CLOSED — deleted today |
| abasin lateSeason missing | ✅ CLOSED — added today |
| chamonix-mont-blanc-s18 duplicate | ✅ CLOSED — 05-13 |
| AP_CONTINENT PDX/SNA mismatch | ✅ CLOSED — PDX confirmed `"na"` at both definitions |
| ZPC invalid IATA for Pucon | ✅ CLOSED — already `ap:"ZCO"` (Temuco, valid) |

---

## Explicit Product Decisions — May 22

**Decision 1: Reddit by Saturday May 24 or defer to June 5. No middle ground.**

Memorial Day weekend (May 24–26) is the last ski-tail × beach pre-season overlap until November. Saturday 9–11am PST is the optimal post window. If VPS isn't verified by Friday noon May 23, the product degrades at 43 DAU — don't post into that. A Reddit post with a broken proxy is worse than no post: the first "it doesn't load" comment pins to the top permanently.

**Call: VPS verified by Friday noon → post Saturday morning. VPS not verified → defer to June 5 (beach-season, ~6K ceiling). Binary. No extensions.**

---

**Decision 2: GEAR_ITEMS ships today. Day 9. This is the last PM flag.**

Three consecutive Content agent flags. Nine consecutive PM flags. The paste-ready code has been in `reports/content-report.md §2` since May 15. Amazon Associates `peakly-20` earns $0 until this lands. CLAUDE.md Revenue Model says $4.48/1K MAU — that is a documented lie until this paste happens.

At 5K post-Reddit: $22/mo. At 10K: $45/mo. Not a design question. No open decisions. Paste → commit.

**VERDICT: GEAR_ITEMS ships in today's code session. If it doesn't ship today, remove Amazon from the Revenue Model table and mark it "never shipped." Stop tracking it as LIVE.**

---

**Decision 3: val-d-isere-s16 + outer-banks IATA close with GEAR_ITEMS in one commit.**

val-d-isere-s16 approved for deletion May 13. Nine days. One line in app.jsx + one reference in Alerts Quick Template (line 5192 → change to `"tignes"`).

outer-banks Content fixed tags today but left `ap:"OAJ"`. Flight pricing for Outer Banks is broken on live data. One field change: `"OAJ"` → `"ORF"`.

**VERDICT: Both in the same commit as GEAR_ITEMS. Cache bump to `20260522b`.**

---

## This Week's Top 3 Priorities Only

**1. Today: Code commit block.** GEAR_ITEMS paste + val-d-isere-s16 delete + outer-banks OAJ→ORF + seasonal ski copy. ~45 min. Cache bump 20260522a → 20260522b. This closes the entire pre-Reddit code checklist.

**2. Today/Friday: Jack VPS SSH.** 3 commands. 10 minutes. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. This is the binary gate for the Reddit post. Day 18. Every day it slips is another day of miscalibrated deal scores for anyone currently using the app.

**3. Saturday May 24: Reddit post.** r/skiing + r/solotravel + r/frugaltravel. 9–11am PST. Story-first: "I got tired of checking OnTheSnow AND Google Flights separately..." → screenshot of firing venue with deal price → link. Jack writes this — it needs his voice, not an AI draft. Do not post without the VPS verified.

**After these three: zero new features until 100 users are in Plausible.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze until Reddit posted + first 100 Plausible users analyzed. |
| Venue count expansion | **DEFER post-Reddit** | 148 venues (post today's deletes) is clean. Adding pre-Reddit = adding potential new data bugs. |
| Maldives beach venue | **DEFER** | Right eventually. Not this week. |
| S. hemisphere ski expansion | **DEFER post-Reddit** | June timing is correct. Not before the post. |
| Venue descriptions | **DEFER post-launch** | Tags carry signal. Descriptions are a content sprint, not a launch gate. |
| abasin July-4 open banner | **DEFER** | Surface when the date is close, not now. |
| MapView improvements | **DEFER post-launch** | Gate it first, validate later. |
| Wishlists / Trips tab reveal | **DEFER** | 1K MAU gate. Hard lock. |
| Hotels in deal score | **CUT to v2** | Confirmed dead four times. Removing from future reports. |
| Peakly Pro resurrection | **CUT for v1** | Post-1K MAU. Not before. |

---

## Success Criteria — May 22

**Pre-launch checklist:**

1. ✅ SEO meta clean — zero "surf"/"adventure" strings.
2. ✅ APNS Capacitor gate — `showAlertsTab` at app.jsx:8158.
3. ✅ Cache buster — `20260522a` aligned across all 3 files.
4. ✅ pigeon-point-t27 + sarakiniko-beach-t16 deleted.
5. ✅ abasin lateSeason:true — no longer self-contradicting.
6. ❌ **GEAR_ITEMS** — code agent ships today.
7. ❌ **val-d-isere-s16 deleted** — code agent ships today.
8. ❌ **outer-banks ap OAJ → ORF** — code agent ships today.
9. ❌ **Seasonal ski empty state** — code agent ships today.
10. ❌ **VPS proxy verified** — Jack SSH. Binary gate.
11. ❌ **5-min human smoke test** — Explore from JFK, ScoreBreakdown, flight price, Booking.com link.
12. ❌ **Reddit post written** — Jack's voice. Saturday 9–11am PST.

Items 6–9 = one commit block today. Items 10–12 = Jack actions.

**90-day projection:**

- **8K ceiling** (Reddit by May 24): ski tail × Memorial Day overlap. Achievable if VPS + code block ship today.
- **6K** (Reddit by June 5): beach-only post, no ski-tail hook, ~1,500 users left on the table.
- **4K** (Reddit after June 15): peak beach-app competition, no differentiated angle.

The gap between 8K and 4K is not a product gap — it's a Tuesday vs. Saturday gap.

---

## One Product Risk Nobody Is Talking About

**The Plausible analytics domain may be misconfigured and we won't know until after the Reddit post.**

`index.html` line 32: `data-domain="j1mmychu.github.io"`. Plausible fires events for the entire GitHub Pages domain, not specifically for the `/peakly` path. If Jack has other projects under `j1mmychu.github.io`, day-1 Reddit traffic analytics merge with everything else — or events get counted under the wrong property entirely.

The validation is 5 minutes: open `https://j1mmychu.github.io/peakly/` in an incognito tab, click around, check the Plausible realtime dashboard. If you see a pageview register under the right domain, you're good. If you see nothing, the domain needs to be `j1mmychu.github.io/peakly` in both the Plausible site config and the `data-domain` attribute.

If the data is wrong on day 1, the 90-day projection becomes a guess and product decisions based on "100 Plausible users" can't be trusted. Validate before Saturday. 5 minutes. Do not skip this.
