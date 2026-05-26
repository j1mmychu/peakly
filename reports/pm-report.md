# Peakly PM Report — 2026-05-26 (v39)

> Latest report. Supersedes v38 (May 25). Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: ORANGE. Memorial Day window is gone. GEAR_ITEMS shipped May 24 — Amazon now live. VPS Day 22. val-d-isere-s16 + outer-banks OAJ still open Day 13. SafetyWing documented as LIVE but has zero code. June 5 is the next Reddit window. 10 days.**

---

## Shipped Since Last Report (2026-05-22 → 2026-05-26)

| What | Commit | Right call? |
|------|--------|-------------|
| **GEAR_ITEMS restored** — `const GEAR_ITEMS` at app.jsx:257, wired at app.jsx:7332 | DevOps, 450891b (May 24) | ✅ Critical. Amazon was $0 for 15 days post-history-scrub. Now active. |
| **Cache buster `20260526a`** — DevOps May 26 fixed 4-day staleness (May 22 DevOps buster ran before May 22 Content changes) | DevOps, f43de14 | ✅ Correct. Buster timing structurally broken — DevOps runs at 14:00, Content at 15:00; same-day Content changes re-stale the buster. Fix: run DevOps last in daily queue. |
| **5 beach venue tag fixes** — nusa-dua, bulabog-boracay, an-bang, laguna-beach, playa-de-la-concha | Content, df499e7 (May 25) | ✅ Trust. Blue Flag doesn't exist in Philippines or Vietnam. |
| **Supabase 2.106.0 + Babel 7.29.4 re-applied** | DevOps, 59dd3be | ✅ Third time shipped. Content agent race condition reverts these. |
| **PM reports May 23–25** | Agents | ✅ Pressure maintained. |

**The Memorial Day Reddit window (May 24, 9–11am PST) passed.** Unknown if a post was made — not verifiable from git. If it was, it went out with GEAR_ITEMS live but outer-banks OBX flight pricing pointing at Jacksonville NC (70mi off) and a dup val-d-isere entry. Next confirmed window: June 5.

---

## Active Bug Triage — May 26

| Bug | Severity | Days Open | Action |
|-----|----------|-----------|--------|
| **VPS proxy not redeployed** | **P0** | **Day 22** | Jack: `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. Open-Meteo free tier breaks at 43 DAU. Reddit sends 200+ in hour 1. Binary gate for June 5 post. |
| **SafetyWing NOT in app.jsx** | **P0** | **Day 1** | Revenue Model says "LIVE $0.54/1K MAU." Zero SafetyWing code in app.jsx. Documentation lie. Ship a CTA (30 min) or remove "LIVE" from the table today. |
| **val-d-isere-s16 still in VENUES** | **P1** | **Day 13** | Delete approved May 13. app.jsx:564 + Quick Templates at app.jsx:5226 (change to `"tignes"`). Ships by May 28. |
| **outer-banks-nags-head-t7 ap:"OAJ"** | **P1** | **Day 13** | OAJ=Jacksonville NC, 70mi from OBX. Fix: `ap:"ORF"` at app.jsx:582. Ships with val-d-isere. |
| **Seasonal ski empty state missing** | **P1** | **Day 11** | June 1 in 6 days. N-hem ski grid thins to 3–4 venues. No copy explains why Explore looks broken. 10-min JSX fix. |
| **S. hemisphere ski season scoring** | **P1** | **NEW** | June 15: Perisher, Coronet Peak, Valle Nevado, Las Leñas open. `getSeasonalMultiplier` applies hemisphere flip via `hemFactor = lat > 0 ? 1 : -1`. Verify it actually works before June 5 post — if broken, S-hem ski venues score dead during peak powder. |
| **DevOps/Content race condition on buster** | **P1** | **NEW** | Third occurrence in 5 days. DevOps runs 14:00, Content 15:00. Fix: reschedule DevOps to 17:45. One cron edit. |
| **BookingConfirmSheet on flights** | **P2** | **Day 14** | Decision May 12: remove from flights. Still in place. Extra tap on highest-intent CTA. |
| **MapView loads unconditionally** | **P2** | **Day 14** | Gate behind `MAPVIEW_ENABLED = false`. No user validation. |

---

## Revenue Model Audit — May 26

| Stream | CLAUDE.md Status | Actual Code Status | RPM |
|--------|-----------------|-------------------|-----|
| Booking.com (`aid=2311236`) | LIVE | ✅ app.jsx:7380 | $6.90 |
| Amazon Associates (`peakly-20`) | LIVE | ✅ app.jsx:257 (added May 24) | $4.48 |
| Travelpayouts (TP_MARKER=710303) | LIVE | ✅ app.jsx:1962 | $0.14 |
| SafetyWing (`referenceID=peakly`) | LIVE | ❌ NOT IN app.jsx | $0 |
| REI (Avantlink) | $0 | N/A (LLC pending) | $0 |
| Backcountry / GetYourGuide | $0 | N/A (LLC pending) | $0 |

**Actual LIVE RPM: ~$11.52/1K MAU.** SafetyWing adds $0.54/1K if shipped — brings it to $12.06. The table should not say "LIVE" for a stream with zero code.

---

## Explicit Product Decisions — May 26

**Decision 1: June 5 is the Reddit target. Beach-first pitch.**

Memorial Day is gone. Accept it. June 5–7 is beach season prime in N. hemisphere. Post copy shifts:
- Lead: "Summer's here — here's where to fly for a beach weekend under $400"
- Keep ski hook: "...or catch last powder before resorts close"
- Subreddits: r/solotravel (300K) → r/frugaltravel → r/travel

Checklist 100% green by June 4 noon. Binary. No extensions.

**VERDICT: June 5 is the plan.**

---

**Decision 2: SafetyWing — SHIP or REMOVE. Today.**

Zero code, documented as LIVE. Two paths:
- **SHIP (30 min):** Add travel insurance CTA in VenueDetailSheet near Booking.com button. `https://safetywing.com/?referenceID=peakly`. One link, clear label.
- **REMOVE (2 min):** Drop the row from CLAUDE.md Revenue Model. Correct RPM note from $11.98 to $11.52.

**VERDICT: Code agent ships SafetyWing CTA in next session. If session can't get to it, REMOVE the same day. No half-states after May 26.**

---

**Decision 3: val-d-isere-s16 + outer-banks OAJ → ORF by May 28. Last flag.**

Flagged May 13. One-line fixes each. Ship together in one commit by May 28. After that: these move to known-skipped and stop being tracked. The product ships without them.

**VERDICT: Code agent closes both by May 28.**

---

## Pre-Launch Checklist — May 26

| Item | Status |
|------|--------|
| SEO meta clean (no surf/adventure strings) | ✅ |
| APNS Capacitor gate (`showAlertsTab` at app.jsx:8158) | ✅ |
| Cache buster `20260526a` aligned | ✅ |
| pigeon-point-t27 + sarakiniko-beach-t16 deleted | ✅ |
| abasin lateSeason:true | ✅ |
| GEAR_ITEMS in app.jsx + wired | ✅ (shipped May 24) |
| **SafetyWing — SHIP CTA or REMOVE from table** | ❌ Decides today |
| **val-d-isere-s16 deleted** | ❌ By May 28 |
| **outer-banks ap OAJ → ORF** | ❌ By May 28 (same commit) |
| **Seasonal ski empty state** | ❌ By May 29 |
| **S. hemisphere ski scoring verified** | ❌ Before June 5 |
| **DevOps cron reschedule** (17:45 slot) | ❌ One edit |
| **VPS proxy verified** | ❌ Day 22 — Jack SSH, 3 min |
| **Plausible domain validation** | ❌ Jack: incognito → browse → check realtime. 5 min. |
| **5-min human smoke test** | ❌ Jack: Explore from JFK → venue detail → price → Booking.com |
| **Reddit post written** | ❌ Jack's voice. June 5 target. |

**7 of 16 green. 5 code-agent items. 4 Jack-only items.**

---

## This Week's Top 3 Priorities Only

**1. Code session by May 28: val-d-isere delete + outer-banks ORF + SafetyWing CTA + seasonal ski copy.**

Four fixes, one commit, ~45 min. Clears every open code-agent item. Cache bump to `20260527a` or `20260528a`.

**2. Jack: VPS SSH. 3 minutes. Today or tomorrow.**

`ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`

Day 22. Binary gate for June 5 post. Without this: Reddit traffic trips Open-Meteo rate limit, all venues score 0, first comment is "it doesn't work," that comment pins to the top forever.

**3. Jack: Plausible validation + smoke test. Before June 5.**

Incognito → browse → check Plausible realtime → confirm pageviews register. Then: Explore from JFK → venue detail → flight price → Booking.com. 10 minutes total. Do not post without this.

**After these three: feature freeze until 100 users in Plausible.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze until June 5 post + first 100 Plausible users analyzed. |
| Venue count expansion | **DEFER post-launch** | 148 is clean. New venues = new data bugs. |
| S. hemisphere ski venue expansion | **DEFER to June 10** | Verify scoring works first. |
| JSON-LD structured data | **DEFER week 2** | Not a Reddit-launch gate. |
| Static h1 fallback | **DEFER week 2** | Same. |
| MapView improvements | **DEFER** | Gate it first. |
| Wishlists / Trips reveal | **LOCKED** | 1K MAU gate. Hard. |
| Hotels in deal score | **CUT** | Dead. Removed from future reports. |
| Peakly Pro | **CUT for v1** | Post-1K MAU. |

---

## Success Criteria — May 26

**90-day projection (June 5 post):**

- **8K:** Beach post lands on r/solotravel. VPS holds under traffic spike. Checklist 100% green. Post timing 9–11am PST Thursday.
- **6K:** Standard Reddit bounce. Baseline if post is quality and VPS is running.
- **4K:** VPS fails during spike → blank venue cards → "doesn't work" pins top. Do not post without the VPS.

The 8K vs. 4K gap is entirely VPS. Not product. Not copy. VPS.

---

## One Product Risk Nobody Is Talking About

**The S. hemisphere ski season starts June 15 and we've never verified the hemisphere scoring flip actually works.**

`getSeasonalMultiplier` at app.jsx:~1844 applies `hemFactor = lat > 0 ? 1 : -1`. In theory, Perisher (lat:-36.4), Coronet Peak (lat:-45.0), Valle Nevado (lat:-33.4), Las Leñas (lat:-35.2) should score as peak season in June–August.

If the flip is broken, June Reddit posts in NZ/AU skiing communities send users to an app showing Coronet Peak at 12/100 during peak powder. A NZ user who clicks Skiing and sees their home mountain dead never comes back. The June 5 post may not be ski-targeted, but ski users will click. Verify the hemisphere logic before posting. It's a 5-minute code read of one function. Higher expected-value than any P2 on the list.
