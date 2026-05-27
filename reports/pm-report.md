# Peakly PM Report — 2026-05-27 (v40)

> Latest report. Supersedes v39 (May 26). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: ORANGE → YELLOW. GEAR_ITEMS live today — Amazon now earning. Cache buster fixed. 153 venues. VPS Day 23 (Jack-only gate). val-d-isere-s16 + outer-banks OAJ: FINAL FLAG — ships by May 29 or known-skipped. June 7 launch.**

---

## Shipped Since Last Report (2026-05-22 → 2026-05-27)

| What | Commit | Right call? |
|------|--------|-------------|
| **GEAR_ITEMS constant + wire-up** — Amazon Associates `peakly-20` now live in VenueDetailSheet | Content, 932943c (May 27) | ✅ Was $0 for 18 days. Took too long. Now live. |
| **Cache buster 20260527a** — 5-day staleness fixed today | DevOps, e8865ef (May 27) | ✅ Same structural race condition as last week. |
| **5 new venues** — beach_maldives, beach_mirissa, beach_oludeniz, ski_mzaar, ski_oukaimeden | Content, 932943c | ✅ Geographic gaps. Morocco/Lebanon ski = differentiated story nobody else has. |
| **9 tag corrections** — Fiji, Naxos, Japan ski venues, Vietnam, Turkey | Content, 932943c | ✅ Trust. "Blue Flag" in Fiji and Philippines was a flat lie. |
| **3 airport code fixes** — appi-kogen AXT→HNA, madarao + tsugaike NGO→NRT | Content, 932943c | ✅ AXT has zero scheduled service. Broken Travelpayouts results fixed. |
| **AP_CONTINENT entries** — HNA, RAK, CMN, BEY, CMB added | Content, 932943c | ✅ Would return `undefined` continent for new venues without this. |
| **Cache buster 20260526a** — fixed May 22 staleness | DevOps, f43de14 (May 26) | ✅ |
| **Supabase 2.106.0 + Babel 7.29.4 re-applied** | DevOps, 59dd3be (May 25) | ✅ Third time shipped — Content agent race condition reverts deps. |
| **5 beach venue tag fixes** — nusa-dua, bulabog-boracay, an-bang, laguna-beach, playa-de-la-concha | Content, df499e7 (May 25) | ✅ |

**Memorial Day Reddit window (May 24) passed.** Unknown if a post was made — not verifiable from git. If it was, it went out with GEAR_ITEMS live but outer-banks OBX flight pricing broken (OAJ=Jacksonville NC, 70mi away) and a dup val-d-isere entry. Those issues remain open today. June 7 is the launch date.

---

## Active Bug Triage — May 27

| Bug | Severity | Days Open | Action |
|-----|----------|-----------|--------|
| **VPS proxy redeploy** — Open-Meteo breaks at 43 DAU; Reddit sends 200+/hr | **P0** | **Day 23** | Jack only. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. 90 seconds. Binary gate for June 7 post. |
| **SafetyWing CTA absent** — CLAUDE.md Revenue Model says LIVE, zero code | **P0** | **Day 2** | Code agent: ship CTA in VenueDetailSheet OR remove "LIVE" from table. Decision below. |
| **val-d-isere-s16 still in VENUES** | **P1** | **Day 14 — FINAL FLAG** | Code agent. Delete app.jsx:566. Update app.jsx:5266 `"val-d-isere-s16"` → `"tignes"`. Goes to known-skipped next run if unshipped. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 14 — FINAL FLAG** | Code agent. Line 584: `"OAJ"` → `"ORF"`. Goes to known-skipped next run if unshipped. |
| **Seasonal ski empty state missing** | **P1** | **Day 13** | Code agent. June 1 = N-hem ski grid drops to 3–4 venues. Grid looks broken. 10-min JSX fix. |
| **DevOps/Content buster race condition** | **P1** | **3rd occurrence** | One cron edit: reschedule DevOps from 14:00 to 17:45. Structural fix. Will recur weekly without it. |
| **S. hemisphere ski scoring** | **CLOSED — NOT A BUG** | — | `scoreVenue:1224` already handles S. hem correctly (`inSeason = mo >= 5 && mo <= 10`). Content agent's bug report was incorrect. |
| **BookingConfirmSheet on flights** | **P2** | **Day 16** | Code agent. Remove from flights; keep on hotels. Extra tap on highest-intent CTA. |
| **MapView Leaflet loads unconditionally** | **P2** | **Day 16** | index.html:88–89. 40KB JS+CSS on every cold start. Gate behind viewMode check. |

---

## Revenue Model Audit — May 27

| Stream | CLAUDE.md Status | Actual Code | RPM |
|--------|-----------------|-------------|-----|
| Booking.com (`aid=2311236`) | LIVE | ✅ app.jsx:7380 | $6.90 |
| Amazon Associates (`peakly-20`) | LIVE | ✅ app.jsx:257 **SHIPPED TODAY** | $4.48 |
| Travelpayouts (TP_MARKER=710303) | LIVE | ✅ app.jsx:1962 | $0.14 |
| SafetyWing (`referenceID=peakly`) | LIVE | ❌ NOT IN app.jsx | $0.54 (if shipped) |
| REI (Avantlink) | $0 | N/A (LLC pending) | +$6.16 |
| Backcountry / GetYourGuide | $0 | N/A (LLC pending) | +$1.84 |

**Actual LIVE RPM today: ~$11.52/1K MAU.** SafetyWing decision (ship or remove) adds or zeros the $0.54 line.

---

## Explicit Product Decisions — May 27

**Decision 1: June 7 is the Reddit launch. Beach-first pitch. June 4 = code-complete deadline.**

Memorial Day is gone. June 7–8 weekend is beach season prime in N. hemisphere. Post copy:
- Lead: "Summer's here — I built an app that shows you the best beach weekend you can fly to for under $400"
- Keep ski hook: "...or grab last powder at the glaciers still open"
- Subreddits: r/solotravel → r/frugaltravel → r/travel, 9–11am PST
- Jack writes this. Not an AI draft.

Code-complete: June 4 EOD. VPS verified: June 4 EOD. No extensions. Same binary as every prior report.

**VERDICT: June 7. Non-negotiable.**

---

**Decision 2: SafetyWing — SHIP in next commit. Last chance.**

LIVE in the Revenue Model for weeks with zero code. Next code commit (by May 29) ships the CTA OR removes "LIVE" from the table the same day. One link: `https://safetywing.com/?referenceID=peakly`. Label: "Travel Insurance – SafetyWing". Goes in VenueDetailSheet near Booking.com. If the commit doesn't include it, table gets corrected to $11.52 live RPM and SafetyWing is marked "pending code." No more half-states.

**VERDICT: SHIP in May 29 commit or REMOVE same day.**

---

**Decision 3: S. hemisphere ski scoring — NOT A BUG. No code change.**

Content agent flagged that S. hem ski venues (Remarkables, Thredbo, Portillo, etc.) score near-zero during peak powder season. I read `scoreVenue:1224`:

```javascript
const isNorth = (venue.lat || 0) >= 0;
const inSeason = isNorth ? (mo >= 11 || mo <= 4) : (mo >= 5 && mo <= 10);
```

For S. hem ski venues (lat < 0), `inSeason = mo >= 5 && mo <= 10`. May = mo 5. `5 >= 5 = true`. The off-season cap of 8 does NOT apply. Existing code handles this correctly. The proposed patch was redundant with live code.

Per CLAUDE.md: "Do NOT modify scoring without an algorithm critique." Critique result: no change needed.

**VERDICT: Reject the patch. Tell Content agent to verify with live Open-Meteo snow depth data on Portillo in late June — if still low then, revisit the lateSeason flag approach.**

---

## Pre-Launch Checklist — May 27

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean (no surf/adventure strings) | ✅ |
| 2 | APNS Capacitor gate (`showAlertsTab` at app.jsx:8158) | ✅ |
| 3 | pigeon-point-t27 + sarakiniko-beach-t16 deleted | ✅ |
| 4 | abasin lateSeason:true | ✅ |
| 5 | GEAR_ITEMS in app.jsx + wired | ✅ **SHIPPED TODAY** |
| 6 | Cache buster 20260527a | ✅ **FIXED TODAY** |
| 7 | **SafetyWing CTA** | ❌ By May 29 or removed same day |
| 8 | **val-d-isere-s16 deleted** | ❌ FINAL FLAG. By May 29. |
| 9 | **outer-banks ap OAJ → ORF** | ❌ FINAL FLAG. By May 29. |
| 10 | **Seasonal ski empty state** | ❌ By June 1 (5 days) |
| 11 | **DevOps cron reschedule 17:45** | ❌ One edit. Structural fix. |
| 12 | **BookingConfirmSheet removed from flights** | ❌ Before launch |
| 13 | **VPS proxy verified** | ❌ Day 23. Jack-only. June 4 deadline (binary gate). |
| 14 | **Plausible domain validation** | ❌ Jack: incognito → browse → check realtime. 5 min. |
| 15 | **5-min human smoke test** | ❌ Jack: Explore from JFK → detail → price → Booking.com |
| 16 | **Reddit post written** | ❌ Jack's voice. June 6 draft, June 7 post. |

**8 of 16 green. Items 7–12 = code agent. Items 13–16 = Jack-only.**

---

## This Week's Top 3 Priorities Only

**1. Code commit by May 29: val-d-isere delete + outer-banks ORF + SafetyWing CTA + seasonal ski copy.**

Four fixes, one commit. ~45 min. Clears every open P0/P1 code item. Cache bump to `20260529a`. After this, the code checklist is clean.

**2. Jack: VPS SSH by June 4. 90 seconds.**

`ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`

Day 23. Binary gate. Without this: 200 concurrent Reddit users trips the Open-Meteo rate limit; all venues score 0; first comment is "it doesn't work"; that comment pins forever. The VPS is the difference between 6K and 2K users in 90 days.

**3. Jack: Plausible validation + smoke test by June 5.**

Incognito tab → browse the app → Plausible realtime → confirm pageviews register. Then: Explore from JFK → open a venue → ScoreBreakdown → flight price → Booking.com link. 10 minutes. Do not post without this.

**After these three: feature freeze until 100 users are in Plausible.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze. P0/P1s still open. |
| S. hemisphere ski scoring patch | **REJECTED** | Existing code is correct. Bug report was wrong. |
| Venue count expansion (beyond today) | **DEFER post-launch** | 153 is clean. New venues = new data bugs at launch. |
| JSON-LD structured data | **DEFER week 2** | Not a Reddit-launch gate. |
| MapView improvements | **DEFER** | Validate usage first. |
| Wishlists / Trips reveal | **LOCKED** | 1K MAU gate. Hard lock. |
| Hotels in deal score | **CUT** | Dead. Off the list permanently. |
| Peakly Pro | **CUT for v1** | Post-1K MAU. Not revisiting before that. |

---

## Success Criteria — May 27

**90-day projection (June 7 post):**

| Scenario | Users | Condition |
|----------|-------|-----------|
| Best case | 6K | VPS verified + post hits r/solotravel 50+ upvotes |
| Base case | 4.5K | VPS verified + standard Reddit bounce |
| Worst case | 2K | VPS fails during spike OR "doesn't work" top comment |

The difference between 6K and 2K is one SSH command. Not product. Not copy. VPS.

**What has to be true for 6K not 4.5K:**
1. VPS verified before posting.
2. Post timing: Saturday June 7, 9–11am PST.
3. First screenshot shows a real deal (live price, score > 75, green label).
4. No stale data bugs visible in the screenshot (the May 29 commit fixes this).

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed |
| GEAR_ITEMS absent | ✅ CLOSED — shipped May 27 |
| Cache buster stale | ✅ CLOSED — 20260527a |
| SEO surf copy | ✅ CLOSED — 05-15 |
| APNS Capacitor gate | ✅ CLOSED — live at app.jsx:8158 |
| pigeon-point-t27 + sarakiniko-beach-t16 | ✅ CLOSED — deleted 05-22 |
| abasin lateSeason missing | ✅ CLOSED — 05-22 |
| S. hemisphere ski scoring "bug" | ✅ CLOSED — not a bug; scoreVenue:1224 handles correctly |

---

## One Product Risk Nobody Is Talking About

**We have 153 venues and no retention hook for Monday–Thursday.**

Every score, label, and CTA is optimized for "this weekend." That's the product. But users who open the app Monday–Thursday see a product that doesn't apply — the weekend window is stale, scores don't refresh until Thursday, and there's no reason to open the app until Friday.

This matters for the 100K goal because the App Store and Google Play rank by retention and daily active usage, not install volume. A Reddit spike drives installs. Retention drives ranking. Ranking drives organic growth. Without a mid-week value hook, the spike becomes a burst → cliff: D0 spike, D7 drop, D30 near-zero.

Strike Alerts is already built and the push worker is deployed (unverified — needs VPS SSH). A "window locked in: [venue] is a GO for this weekend" push on Wednesday, when the Open-Meteo 7-day window becomes reliable, is the lowest-effort retention fix. One timing tweak in proxy.js's `checkAlerts` interval. No client changes needed.

**Recommendation:** post first, measure D7 retention in Plausible. If D7 retention is <15% (industry baseline for weather-adjacent apps is 20–25%), this is the fix. Have the hypothesis written down before the post so we recognize the pattern when we see it. We're writing it down now.
