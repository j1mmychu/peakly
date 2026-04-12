# Peakly PM Report — 2026-04-10 (v23)

**Filed by:** Product Manager agent  
**Status:** One fix shipped. Six priorities still open. New credibility threat discovered.**TP_MARKER Day 17.**

---

## Overnight Activity — April 8 → April 10

**Commits since last report: 3** (1 code, 2 content reports)

| Commit | What | Assessment |
|--------|------|------------|
| `1db7079` — DevOps | Push notification icons fixed, SW cache bumped to `peakly-20260409`, inter-batch delay added (1s), cache buster → v=20260409a | **Right call.** Silent push failures affect every user who set an alert. Shipping this was correct. |
| `3129564`, `f79ff26` — Content | Two content reports filed (duplicate commit, likely merge) | Reports only — no code. |

**Assessment:** One real fix in 48 hours. Progress, but the backlog from v22 is fully intact. The DevOps agent is shipping fixes. The core product blockers (TP_MARKER, venue deduplication, email capture) remain untouched.

---

## Bug Triage — April 10

| Bug | Severity | File/Line | Status | Days Open |
|-----|----------|-----------|--------|-----------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | `app.jsx:5316` | ❌ UNSET | **Day 17** |
| **995 duplicate venues — wrong difficulty tags** | **P0** | VENUES array | ❌ NEW CRITICAL | Day 1 |
| **Proxy has no rate limiting** | **P0** | `server/proxy.js` | ❌ Open door to quota theft | Day 1 |
| **venue.facing defaults to 270° west** | **P1** | `app.jsx:4683` | ❌ Unfixed | Day 14 |
| **fetchWeather() no 429 handler** | **P1** | `app.jsx:4540` | ❌ Unfixed | Day 14 |
| **Email capture no backend** | **P1** | `app.jsx:8884` | ❌ localStorage only | Day 17 |
| **app.jsx = 2.0 MB (11,000 lines)** | **P1** | — | ❌ Unfixed | Day 8 |
| **1,465 duplicate photos (39%)** | **P2** | VENUES array | ❌ Unfixed | Day 21+ |

### New P0: Venue Deduplication + Safety Tags

The content agent identified 995 batch-generated venues with `-s##` ID suffixes. Multiple world-famous spots appear 4–7× with contradictory data. The credibility risk is not abstract:

- **Cloudbreak, Fiji** — 7 entries, at least one tagged "Beginner Friendly." Cloudbreak is a heavy expert-only reef break. This is a liability, not just embarrassment.
- **Teahupo'o, Tahiti** — at least one entry tagged "Beach Break, All Levels." Teahupo'o is widely cited as the world's most dangerous wave.
- **Mundaka, Spain** — 6 entries, batch entry tagged "Beginner Friendly, Warm Water." Cold water. Expert only.

**r/surfing users will test Peakly by searching spots they know personally.** When they see Teahupo'o labeled "All Levels," the post writes itself: "This app is dangerous. Don't use it." One viral Reddit comment kills the launch. This is now P0.

### New P0: Proxy Rate Limiting

`server/proxy.js` has zero rate limiting. A single script or competitor can exhaust the Travelpayouts daily quota in minutes by calling `/api/flights/latest?origin=LAX&destination=BKK` in a loop. When quota is gone, every real user sees broken flight prices. Fix is 15 minutes on the VPS: `express-rate-limit`, 20 requests/IP/minute on `/api/flights`.

---

## Known Blockers

| Blocker | Owner | Action |
|---------|-------|--------|
| **TP_MARKER** | Jack | tp.media → Markers → copy ID → `app.jsx:5316` → push. 5 min. **Day 17.** |
| **Venue dedup** | Dev | Remove 800 `-s##` suffix duplicates from VENUES array. Keep named originals. ~2-3 hrs. |
| **Proxy rate limit** | Jack | SSH to VPS, `npm install express-rate-limit`, add 20 req/IP/min to `/api/flights`. 15 min. |
| **Email capture backend** | Dev | Loops.so free webhook in onboarding complete handler (`app.jsx:8884`). 30 min. |
| **venue.facing bug** | Dev | `app.jsx:4683` — replace directional multiplier with neutral (1.0) until facing data exists. 10 min. |
| **fetchWeather 429** | Dev | `app.jsx:4540` — add `if (r.status === 429) return null;` before generic `!r.ok` throw. 5 min. |
| **LLC** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe. |

---

## This Week's Top 3 Priorities

### 1. JACK: TP_MARKER. Still. Day 17.

This is the 12th consecutive PM report naming this as P0. The action has not changed. It is still a 5-minute string substitution at `app.jsx:5316`. No design decision required. No code review needed. Every user who clicked a flight link over the last 17 days earned Peakly $0 from Travelpayouts.

**Decision: SHIP. Jack. Today.**

### 2. DEV: Venue deduplication — ship before any new Reddit push

This is the week's most important engineering task, and it's newly P0. The fix is surgical:

1. For each venue where another entry exists within 0.05° lat/lon, keep the entry with no `-s##` suffix in the ID, discard the batch-generated duplicate.
2. Manually verify difficulty tags on the 9 flagged credibility risks (Cloudbreak, Teahupo'o, Mundaka, Nazaré, Punta de Lobos, Grandvalira, Fuerteventura, Mundaka, Kalymnos).
3. Final count will drop from 3,726 → ~2,900–3,100. This is fine. Quality beats count.

Do NOT launch another Reddit post until this ships. Credibility is the only thing the early adopter community cares about.

**Decision: SHIP this week. Blocks all future Reddit/social activity.**

### 3. JACK: Proxy rate limiting on VPS

15 minutes. SSH to the VPS, install `express-rate-limit`, add the middleware. The proxy is currently an open throttle on Travelpayouts quota. One bad actor kills flight prices for all real users.

**Decision: SHIP. Jack. Same session as TP_MARKER.**

---

## Explicit Product Decisions

**DECISION 1: Venue dedup is P0, not P1.**  
Wrong difficulty tags on Cloudbreak and Teahupo'o are a safety/liability issue, not a cosmetic one. The content agent identified this. It must ship before any community outreach. Upgraded from P1 to P0 as of this report.

**DECISION 2: No new Reddit posts until venue dedup ships.**  
The first viral negative comment from a surfer who knows Teahupo'o kills the launch window. Do not accept this risk.

**DECISION 3: venues.json extraction — DEFER one more week, dedup first.**  
Extracting VENUES to venues.json is still the right call for load time. But deduplication must happen first — otherwise we extract and deploy 800 known-bad entries. Dedup → extract, in that order. Estimated sequence: dedup this week, extract next week.

**DECISION 4: Push notification alerts — HOLD until dedup + TP_MARKER ship.**  
The push infrastructure is live and working (icons fixed yesterday). But sending alerts that drive users to venues with wrong difficulty tags is worse than not sending alerts. Fix data quality before activating push.

**DECISION 5: Photo deduplication — DEFER after venue dedup.**  
39% photo duplication is a P2, not P0. Fixing it before dedup wastes effort on venues that will be deleted. Order: dedup first, then reassign photos to surviving entries.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| **Venue expansion beyond 3,726** | **CUT** | Already have 800+ bad entries. Adding more before fixing dedup is net negative. |
| **Trips + Wishlists tab expose** | **DEFER to 1K users** | Standing decision. 3-tab nav is correct. |
| **Strike alerts server polling** | **DEFER to 100 alert subscribers** | Build audience before push system. Also: hold until data quality fixed. |
| **iOS App Store** | **DEFER to 500 validated users** | Validate PMF first. |
| **Google Play via PWABuilder** | **DEFER to post-1K** | $25, no code. Amplify proven demand. |
| **Amazon gear links** | **SHIP week 2, bundle with venues.json** | Right direction, low-effort. Still correct. |
| **Dark mode** | **CUT permanently** | No user signal. |
| **Score algorithm changes** | **CUT** | Algorithm freeze in effect since April PM report. No changes until post-Reddit. |

---

## Success Criteria

| Metric | 5K users (base case) | 8K users (upside case) |
|--------|---------------------|----------------------|
| TP_MARKER | Set this week | Already earning commissions |
| Venue data quality | Dedup shipped | + No credibility complaints on Reddit |
| Mobile load | 2.0 MB (5-10s) | <0.7 MB via venues.json extraction |
| Email list | 0 captured | 150+ in Loops.so |
| Proxy security | Open to abuse | Rate limited |

**What has to be true for 8K, not 5K:**  
A second Reddit post — after dedup ships and TP_MARKER is set — in a targeted community (r/surfing or r/skiing) with clean data and working flight commissions. The first post captured organic traffic. A second, better-targeted post is the clearest path to the next traffic event. It requires: venue data clean, TP_MARKER set, no broken surf scores on credible breaks.

---

## The Product Risk Nobody Is Talking About

**The agent team is doing its job. Jack isn't.**

The DevOps agent shipped a fix yesterday. The content agent identified a P0 safety issue. The PM agent has filed 12 consecutive reports naming the same 5-minute action. The pattern is clear: agent-generated insights are accumulating in `reports/` but not converting to shipped code or owner actions.

The fix is not a process change. It is two actions:
1. Jack sets TP_MARKER. Today. 5 minutes.
2. Jack adds rate limiting to the VPS proxy. Today. 15 minutes.

Everything else on the list is dev work that can be parallelized. But these two items require Jack specifically — the agent cannot access tp.media or SSH to the VPS. They've been on the list for 17 days. The agent team cannot move them. Only Jack can.

**The risk: if these items sit until Day 25, the pattern becomes permanent. The agent team produces reports that don't result in action. That's not a product problem — it's an execution problem.**

---

*PM agent v23 — 2026-04-10*  
*Filed for: Jack (jjciluzzi@gmail.com)*  
*Next milestone: TP_MARKER set + proxy rate limited by EOD April 10 (Jack). Venue dedup by April 14 (Dev).*
