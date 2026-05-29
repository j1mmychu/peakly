# Peakly PM Report — 2026-05-28 (v41)

> Latest report. Supersedes v40 (May 27). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: YELLOW. Code is in the best shape it's been. Three P1 code fixes remain (val-d-isere-s16, outer-banks OAJ, BookingConfirmSheet on flights). VPS is Day 24 — it is the only thing between a good Reddit launch and a catastrophic one. June 7 is the date.**

---

## Shipped Since Last Report (2026-05-27 → 2026-05-28)

| What | Verdict |
|------|---------|
| **Cache buster 20260527a → 20260528a** (DevOps) | ✅ Daily reset. Clean. |
| **Supabase 2.106.0 → 2.106.2** (DevOps) | ✅ 2-patch maintenance bump. |
| **Babel 7.29.4 → 7.29.7** (DevOps) | ✅ JSX parse correctness fixes. |

### Content Agent Report — Flagged as Inaccurate

Today's content report scored GEAR_ITEMS as absent (−14 pts) and reported 148 venues. Both are wrong.

**Code verification (2026-05-28 app.jsx):**
- `GEAR_ITEMS` is defined at app.jsx:257 with 4 skiing items + 4 beach items. Amazon Associates `tag=peakly-20` present. Gate renders in VenueDetailSheet at lines 7321 and 7398. ✅
- Venue count: 153 (5 added in May 27 content commit: beach_maldives, beach_mirissa, beach_oludeniz, ski_mzaar, ski_oukaimeden). ✅

The content agent is analyzing stale code or a cached version. Its GEAR_ITEMS finding is a false positive. If GEAR_ITEMS is flagged a 4th time without code basis, it moves to known-skipped.

---

## Active Bug Triage — May 28

| Bug | Severity | Days Open | Action |
|-----|----------|-----------|--------|
| **VPS proxy not redeployed** — weather cache + weekend pricing dead | **P0** | **Day 24** | Jack only. SSH command below. Binary gate for June 7. Open-Meteo breaks at 44 DAU. Reddit sends 200+/hr in hour 1. |
| **SafetyWing CTA not in app.jsx** | **P0** | **Day 3** | Binary: ships in May 29 commit OR removed from Revenue Model same day. No half-states. |
| **val-d-isere-s16 still in VENUES** | **P1** | **Day 15 — FINAL FLAG #2** | app.jsx:566. Delete line. Update line 5266: `"val-d-isere-s16"` → `"tignes"`. Next report = known-skipped. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 15 — FINAL FLAG #2** | app.jsx:584. `"OAJ"` → `"ORF"`. Next report = known-skipped. |
| **BookingConfirmSheet on flights** | **P1** | **Day 17** | app.jsx:7435. Remove `setBookConfirm` for Aviasales. Open URL directly. Keep modal on Booking.com hotel only. Ships May 29. |
| **Bora Bora airport inconsistency** | **P2** | **Day 1** | `borabora` uses PPT, `matira-beach-t6` uses BOB. Standardize both to PPT (intercontinental gateway). May 29 commit. |
| **Seasonal ski empty state** | **P2** | **Day 14** | Not a June 7 gate (N-hem users default to beach). Post-launch fix. |
| **DevOps/Content buster race condition** | **P2** | **Recurring** | Reschedule DevOps cron 14:00 → 17:45. One cron edit. Structural fix. |

**VPS SSH command (3 minutes, copy-paste):**
```bash
ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull origin main && pm2 restart peakly-proxy && curl localhost:3001/health"
```
Expected `/health` response includes `weather_cache`, `poll_stats`, `apns_configured`. If those keys are missing, old binary is still running — check `pm2 list`.

---

## Revenue Model — May 28 Code-Verified

| Stream | Code Status | RPM |
|--------|-------------|-----|
| Booking.com (`aid=2311236`) | ✅ app.jsx:7450 | $6.90 |
| Amazon Associates (`peakly-20`) | ✅ app.jsx:257 `GEAR_ITEMS` live | $4.48 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ app.jsx:1962 | $0.14 |
| SafetyWing (`referenceID=peakly`) | ❌ NOT in app.jsx | $0 |
| REI (Avantlink) | LLC pending | $0 |
| Backcountry / GetYourGuide | LLC pending | $0 |

**Actual live RPM: $11.52/1K MAU.** SafetyWing ships tomorrow or the table drops it.

---

## Explicit Product Decisions — May 28

**Decision 1: June 7. Final. No slip.**

Beach-season hook is the right angle. N-hemisphere `seasonalDefaultCat` returns "beach" in May–August — users open on the correct tab automatically. June 7–8 is prime beach post window before summer competition peaks (r/travel and r/solotravel get flooded July 4 week). r/frugaltravel → r/solotravel → r/travel. 9–11am PST. Jack writes it. Not agent-drafted copy.

Code-complete deadline: June 4 EOD. VPS verified: June 4 noon PST. If VPS isn't verified by noon June 4, post slips to June 14. Binary. No extensions.

---

**Decision 2: SafetyWing — ships May 29 or removed from revenue table same day.**

Third report in a row with SafetyWing LIVE in CLAUDE.md and $0 in code. One anchor tag in VenueDetailSheet near Booking.com. Link: `https://safetywing.com/?referenceID=peakly`. Label: "Travel Insurance — SafetyWing". If the May 29 commit doesn't include it, CLAUDE.md Revenue Model removes it that same day. No more half-states.

---

**Decision 3: BookingConfirmSheet removed from flight CTA. Ships May 29.**

17 days since the decision. The confirm modal fires when a user taps "Book Flights" on Aviasales — the highest-intent action in the app. Removing the friction here has zero downside and converts that intent directly to clicks. Booking.com (hotel) keeps the modal — larger purchase decision. Aviasales: direct open. One code change, ships May 29.

---

## This Week's Top 3 Priorities Only

**1. May 29 code commit.** SafetyWing CTA + BookingConfirmSheet flight removal + val-d-isere-s16 delete + outer-banks OAJ→ORF + Bora Bora PPT alignment. Cache bump 20260528a → 20260529a. After this commit, code checklist is 100% green.

**2. Jack: VPS SSH by June 4 noon.** Day 24. Without it: 44 DAU trips the rate limit, Explore shows an empty grid, the Reddit post fails in hour 1. Three minutes of SSH.

**3. Jack: Plausible validation + smoke test by June 5.** Incognito → browse → Plausible realtime → confirm events fire. Then: JFK → venue → ScoreBreakdown → "Book Flights" (confirm no modal after May 29 commit). 15 minutes. Don't post Saturday without this.

---

## Pre-Launch Checklist — June 7 Gate

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate | ✅ app.jsx:8158 |
| 3 | Duplicate venues deleted | ✅ |
| 4 | abasin lateSeason:true | ✅ |
| 5 | GEAR_ITEMS live | ✅ app.jsx:257 |
| 6 | Cache buster 20260528a | ✅ |
| 7 | Seasonal default "beach" N-hem | ✅ app.jsx:2150 |
| 8 | S-hemisphere ski scoring correct | ✅ scoreVenue:1224 |
| 9 | **SafetyWing CTA** | ❌ May 29 or removed |
| 10 | **val-d-isere-s16 deleted** | ❌ May 29. FINAL FLAG #2. |
| 11 | **outer-banks ap OAJ → ORF** | ❌ May 29. FINAL FLAG #2. |
| 12 | **BookingConfirmSheet removed from flights** | ❌ May 29 |
| 13 | **Bora Bora PPT alignment** | ❌ May 29 |
| 14 | **VPS proxy verified** | ❌ Jack, June 4 noon |
| 15 | **Plausible domain validated** | ❌ Jack, June 5 |
| 16 | **Smoke test** | ❌ Jack, June 5 |
| 17 | **Reddit post written** | ❌ Jack's voice, June 6 draft |

**8 of 17 green. Items 9–13 = one code commit May 29 (~45 min). Items 14–17 = Jack-only.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new functionality | **HARD BLOCK** | Feature freeze until after June 7 post and first 100 Plausible sessions |
| S-hemisphere ski scoring patch | **REJECTED** | Code is correct. Content agent finding was wrong. Verified against live scoreVenue:1224. |
| Venue count expansion | **DEFER to June 15** | 153 is clean. New venues = new data bugs at launch. |
| Seasonal ski empty state | **DEFER post-launch** | Not on critical path. Default is beach for N-hem users. |
| MapView improvements | **DEFER** | Gate first, measure demand, cut if nobody asks. |
| Hotels in deal score | **CUT** | Dead permanently. Off all future reports. |
| Peakly Pro | **CUT for v1** | Post-1K MAU. Hard stop. |
| Wishlists / Trips tab | **LOCKED** | 1K MAU gate. Will not revisit before that. |
| JSON-LD structured data | **DEFER week 2 post-launch** | 6–12 week SEO compounding. Not a launch gate. |

---

## Success Criteria — May 28

**90-day projection (June 7 post):**

| Scenario | Users | Gate |
|----------|-------|------|
| **Best case** | **6K–7K** | VPS live + cross-post r/frugaltravel + r/solotravel same morning |
| **Base case** | 4K–5K | VPS live + single sub post |
| **Worst case** | <2K | VPS down during spike → blank Explore grid → "doesn't work" pins top comment |

**For 7K not 4K:** cross-post on June 7 morning to r/frugaltravel AND r/solotravel with different framings (frugaltravel: price angle; solotravel: spontaneity angle). Not sequential days — same morning.

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed |
| GEAR_ITEMS absent | ✅ CLOSED — live at app.jsx:257 (May 24) |
| Cache buster stale | ✅ CLOSED — 20260528a today |
| SEO surf copy | ✅ CLOSED |
| APNS Capacitor gate | ✅ CLOSED |
| pigeon-point + sarakiniko dupes | ✅ CLOSED |
| abasin lateSeason missing | ✅ CLOSED |
| S-hemisphere ski scoring "bug" | ✅ CLOSED — not a bug |
| idre-fjall MXX→OSL | ✅ CLOSED |
| appi-kogen AXT→HNA | ✅ CLOSED |
| madarao/tsugaike NGO→NRT | ✅ CLOSED |

---

## One Product Risk Nobody Is Talking About

**The content agent is producing systematically inaccurate reports and we're building habit around trusting them.**

Today's content report asserted GEAR_ITEMS is absent (−14 pts) when it's been live since May 24. It reported 148 venues when the actual count is 153. These aren't edge cases — they're the two most prominent findings, and both are verifiably wrong from a single grep.

The risk is structural: if the PM report corrects the content agent every week, PM reports become content agent QA instead of product direction. If we stop correcting, inaccurate issue logs accumulate and code agents spend time fixing bugs that don't exist while real bugs sit.

**The fix:** The content agent prompt needs an explicit code-verification step before asserting any constant is missing: `grep -n "const GEAR_ITEMS" app.jsx`. One tool call. If it returns a result, the agent reads the constant and audits its contents instead of declaring it absent. Until this is fixed, every content report requires a PM-level accuracy check — which is waste at a time when the only thing that matters is getting to June 7 clean.

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
