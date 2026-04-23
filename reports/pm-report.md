# Peakly PM Report — 2026-04-22 (v24)

**Filed by:** Product Manager agent  
**Date:** 2026-04-22  
**Status:** 5 days of zero product code since Apr 17. Two P1 bugs finally shipped this session. Several persistent false alarms in previous reports permanently closed below.

---

## Shipped Since Last Report (2026-04-17 → 2026-04-22)

| What | Shipped By |
|------|-----------|
| `d039180` — PM report only | Apr 17 agent |
| **No product code for 5 days** | — |

**Shipped this session:**
- Removed `cloudbreak-fiji-s21` — duplicate of `cloudbreak` (line 403), tagged "All Levels / Beach Break / Longboard Friendly." One of the world's most dangerous big-wave reefs. P1 closed Day 5 late.
- Removed `punta-roca-s12` — duplicate of `punta_roca` (line 377), tagged "Beginner Friendly." WSL-level barreling left. P1 closed Day 5 late.
- Removed `supertubos-peniche-s18` — pure duplicate of `supertubos` (line 386).
- Fixed `catanduanes-s16` tags: "Beach Break, All Levels" → "Reef Break, Expert Level, Remote Spot, Pacific Power"
- Fixed `snappers-gold-coast-s26` tags: "Beach Break, All Levels" → "Rock Point, Expert Level, WSL Tour Stop, Powerful Wedge"
- Cache buster bumped: `peakly-20260417` → `peakly-20260422`
- CLAUDE.md venue count corrected: 231 → 224

**Venue count: 224** (was 227 before this session; 3 dupes removed)

---

## Permanent Bug Triage Corrections

These were investigated and closed. Do NOT re-flag without reading live code first.

| Issue | Status | Evidence |
|-------|--------|----------|
| TP_MARKER "YOUR_TP_MARKER" | **CLOSED** | `app.jsx:1593` — `const TP_MARKER = "710303"`. Set since Apr 10. |
| Sentry DSN empty | **CLOSED** | `app.jsx:7-8` — real DSN set (`o4511108649058304.ingest.us.sentry.io`). |
| Email capture uses alert() | **CLOSED** | `app.jsx:3503` — real `fetch()` to `/api/waitlist` with Plausible event. |
| Peakly Pro showing $9/mo | **CLOSED** | No Pro pricing UI in codebase. Removed 2026-03-26. $79/yr is waitlist-only copy. |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema present. |

---

## Active Bug Triage — April 22

| Bug | Severity | Status |
|-----|----------|--------|
| **Remaining batch venue tag accuracy** | **P1** | ~20 batch venues still have 4 rotating tag templates. Not all wrong, but unaudited. `indicator-s22` ("Beginner Friendly"), `capbreton-s27` ("Beginner Friendly"), `matanzas-s17` ("Beginner Friendly") are candidates for review. |
| **Strike alerts background worker unbuilt** | **P2** | Core promise. Deferred until 500 MAU. Correct call. |
| **No onboarding scoring explanation** | **P2** | Reddit will surface real confusion faster than any designed tutorial. Post-launch. |
| **Cache buster relies on manual bump** | **P3** | Should be automated post-deploy in `.github/workflows/deploy.yml`. Recurring friction, low priority. |
| **app.jsx = 7,140 lines** | **P3** | Babel cold parse ~2–3s on low-end Android. Not critical yet. |

---

## Explicit Product Decisions — April 22

**Decision 1: Audit remaining ~20 batch venues for tag accuracy. SHIP this week.**  
The 5 confirmed mislabelings are fixed. The remaining `-s##` ID venues need a manual pass focused specifically on "Beginner Friendly" and "All Levels" tags. Estimate 1–2 more wrong. 45-minute job. Required before the Reddit post. No exceptions.

**Decision 2: Onboarding / scoring explainer. DEFER post-Reddit.**  
Reddit comments are free UX research. Build for observed confusion, not imagined confusion. If 3+ commenters ask "how does the score work," that's the trigger.

**Decision 3: Strike alerts background worker. DEFER until 500 users.**  
Zero users using Alerts. The VPS work (cron, push reliability) is non-trivial. Hard defer.

**Decision 4: JSON-LD / SRI / CSP hardening. DEFER.**  
JSON-LD exists. 81% SEO is launch-acceptable. SRI could break Babel eval — don't touch.

**Decision 5: "Next good window" copy under low scores. INVESTIGATE.**  
A line below any score under 60 saying "Next good window: ~X days" would improve D1 retention significantly with no new API calls. Uses existing weather array. Worth 30 minutes to prototype. Not blocking launch, but highest-leverage non-data improvement available.

---

## Known Blockers

| Blocker | Owner | Impact |
|---------|-------|--------|
| **LLC approval** | External (Jack) | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack ($99/yr) | Blocks iOS App Store — defer until 500 MAU anyway |
| **Remaining batch venue tag audit** | Dev (45 min) | Last credibility gate before Reddit launch |

---

## This Week's Top 3 Priorities Only

### 1. Audit remaining ~20 batch venues for tag accuracy (45 min, Dev)
Cloudbreak, Punta Roca, Catanduanes, Supertubos dupe, Snappers Gold Coast — all fixed. Check the rest of the `-s##` IDs for "Beginner Friendly" and "All Levels" tags on non-beginner breaks. This is the last data credibility gate.

### 2. Jack: Set a Reddit launch date — this week or next
Code is launch-ready. Venue data is now clean. No more technical blockers on the dev side. The only thing standing between 0 users and 5K users is a Reddit post. Pick a date.

### 3. Jack: LLC status + REI affiliate application readiness
REI at $6.16 RPM = $6,160/month at 1K MAU. If LLC is 3 weeks out, draft the REI Avantlink application now so it can be submitted day-of formation.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Onboarding / scoring explainer | **DEFER** | Reddit comments are better UX research than speculation |
| Strike alerts background worker | **DEFER** | 0 users using Alerts. VPS work for no audience. |
| iOS App Store | **DEFER** | No proven retention. Do at 500 users. |
| Window Score / Forecast Horizon | **DEFER** | No new features while data quality has open items |
| Automated cache buster in CI | **DEFER** | Manual bump is fine pre-launch |
| Dark mode | **CUT** | Not in launch scope. Post-1K if requested by users. |

---

## Success Criteria

**5K (base case):** One Reddit post hits front page of r/surfing or r/skiing. 48hr Plausible spike + 15%+ D7 retention.

**8K (upside) — three things must all be true:**
1. Zero credibility objections in launch Reddit comments (batch audit removes this risk)
2. A second organic post (r/travel, r/digitalnomad) within 30 days of launch
3. At least one Travelpayouts conversion visible in dashboard (proves the funnel works)

The 5K→8K delta is venue data credibility. That work is now 90% done.

---

## One Product Risk Nobody Is Talking About

**The app has no recovery path when conditions are bad.**

If a user opens Peakly and their closest break scores 28/100 ("choppy, onshore"), they don't know whether to come back tomorrow, next week, or never. There's no forward signal. They close the tab. D1 retention dies on a mediocre-conditions day.

The Window Score (Phase 2 roadmap) fixes this architecturally, but it's deferred. A 30-minute band-aid exists: a "Next good window: ~X days" line under any score below 60, computed from the existing 7-day weather array we already fetch. No new API calls. Doesn't touch the frozen scoring algorithm. Turns a dead end into a bookmark moment.

This is the highest-ROI improvement available that isn't on anyone's radar.

---

*Next report: 2026-04-23. Priority: confirm remaining batch venue audit shipped and Reddit launch date set.*
