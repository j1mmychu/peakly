# Peakly PM Report — 2026-04-04 (v22)

<!-- Previous reports: pm-2026-04-03.md | pm-2026-04-02.md -->

**Filed by:** Product Manager agent  
**Status:** Day 4 post-Reddit launch. TP_MARKER still unset. Day 12. Zero revenue tracked from any flight click since launch.

---

## Shipped Since Last Report (2026-04-02 → 2026-04-04)

| Commit | What | Right call? |
|--------|------|-------------|
| *Nothing* | No code commits in 48 hours | ⚠️ We are 4 days post-Reddit launch. The TP_MARKER that generates flight revenue is still a placeholder. No commits have addressed it. |

**Opportunity cost:** Reddit launched March 31. It is now April 4. Four days of flight clicks = $0 revenue. TP_MARKER has appeared in every PM report since v12. This is not a reminder — it is a verdict on execution discipline.

---

## Bug Triage — April 4

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | ❌ STILL UNSET | **Day 12** |
| **fetchWeather() throws on 429** | **P1** | ❌ `app.jsx:4542` — `throw new Error` on any `!r.ok` | Day 9 |
| **venue.facing ?? 270 swell scoring bug** | **P1** | ❌ Still at `app.jsx:4683` | Day 9 |
| **app.jsx = 1.99 MB (10,976 lines)** | **P1** | ❌ Growing. Babel parse 5-10s on mobile | Day 2 |
| **Email capture — no backend list** | **P1** | ❌ localStorage only. Post-Reddit emails lost. | Day 12 |
| **React CDN unpinned (`@18`)** | **P2** | ❌ `index.html:80–81`. One breaking release = dead app. | Day 9 |
| **Photo duplication** | **P2** | ❌ Confirmed across 3,726 venues | Day 14+ |

**P0 escalation: TP_MARKER.** Every report since v12 has listed this as P0. Today is Day 12. If Reddit delivered 300 visitors with 8% flight click rate = 24 clicks = ~$12–36 in untracked Travelpayouts revenue. That money is gone. Fix takes 5 minutes. Jack: `app.jsx:5316`. Replace `"YOUR_TP_MARKER"` with your marker ID from tp.media dashboard. Push. Done.

**fetchWeather P1 upgrade:** `fetchMarine()` correctly returns `null` on any error. `fetchWeather()` throws. On Open-Meteo rate limit (429), fetchWeather throws and crashes the entire Explore tab. This is not cosmetic — it silently kills the core tab for users who hit the rate limit. fetchMarine handles it in 1 line. fetchWeather should match.

---

## Post-Reddit Launch Assessment (Days 1–4)

Reddit launched March 31. No data has been shared with this agent, but the following can be inferred from code state:

- **Revenue tracked:** $0. TP_MARKER unset for all 4 days of live Reddit traffic.
- **Email list built:** Unknown — emails captured in localStorage only. No Loops.so backend ever shipped.
- **Alert usage:** Unknown — no VPS polling endpoint, so alerts can be set but never fire.
- **Mobile experience:** 1.99 MB Babel parse → 5-10s blank screen → high bounce rate on Reddit mobile traffic (est. 70%+ of Reddit visits are mobile).

**The brutal audit:** We launched on Reddit with:
1. Flight links not earning commission (TP_MARKER placeholder)
2. No email capture backend (Reddit spike built zero re-engageable list)
3. Alerts UI that sets alerts but never fires them (no VPS endpoint)
4. 5-10 second mobile load time (Reddit is mobile-majority)

This is not a product failure. These are 4 fixable tactical failures that compounded on the most important traffic event to date. The window to fix them before the next traffic event (ProductHunt, influencer, Week 2 Reddit) is right now.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **TP_MARKER placeholder** | **Jack — 5 minutes. tp.media → Markers → copy ID → app.jsx:5316 → push** | **P0. Day 12. Do it now.** |
| **Email capture no backend** | Dev — Loops.so free tier, POST on onboarding complete, 30 min | P1. Next traffic spike = zero list again. |
| **app.jsx 1.99 MB** | Dev — extract VENUES to venues.json, load async | P1. Mobile bounce rate is high. |
| **venue.facing swell bug** | Dev — delete 5 lines at app.jsx:4683–4691 | P1. Serious surfers from r/surfing distrust scores. |
| **fetchWeather 429 throw** | Dev — 1 line fix at app.jsx:4542 | P1. Rate limit = Explore tab crash. |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **VPS /api/alerts endpoint** | Dev/Jack — needed for alerts to actually fire | P1. Alerts are set but silent. |

---

## This Week's Top 3 Priorities

### 1. JACK: TP_MARKER. Day 12. Every click since March 22 = $0.

`app.jsx:5316`. `"YOUR_TP_MARKER"`. Replace with your marker ID from tp.media → Markers. Push. This is revenue, not polish.

**If this isn't done in the next 24 hours, the next report will say Day 13. And the one after that, Day 14. This is the only item that Jack personally must do, and it has not been done in 12 days.**

**Decision: SHIP. Jack. Today.**

### 2. DEV: Fix the 4 sub-10-minute P1 code bugs (combined: ~30 minutes)

All confirmed in code. All unshipped since flagged. Combined 30 minutes of work:

**a) fetchWeather 429 fix (2 min):** `app.jsx:4542`
```
Change:  if (!r.ok) throw new Error("weather fetch failed");
To:      if (!r.ok) return null;
```
Prevents Explore tab crash on Open-Meteo rate limit.

**b) venue.facing swell fix (5 min):** Delete lines 4683–4691 in `app.jsx`. The `spotFacing`/`swellAlignment`/`swellAngleDiff` block uses `venue.facing ?? 270` — defaulting every venue without a `facing` property to west-facing. Most surf venues don't have this property. Result: wrong swell efficiency scores for the majority of surf breaks. Surf users on Reddit will notice.

**c) React CDN pin (2 min):** `index.html:80–81`
```
Change:  react@18/umd/react.production.min.js
To:      react@18.3.1/umd/react.production.min.js
(same for react-dom)
```
One CDN breaking change kills all users instantly. This is 2 minutes of insurance.

**d) Loops.so email capture (20 min):** In the onboarding email submit handler, add a `fetch()` POST to a Loops.so free-tier webhook. 2,500 contacts free. No LLC required. Current state: every email typed since launch is in localStorage only — inaccessible, not re-engageable. The Reddit spike came and went with zero email list built.

**Decision: SHIP all 4. No design decisions. No architecture changes.**

### 3. DEV: venues.json extraction — before the next traffic event

app.jsx is 1.99 MB. ~1.4 MB is VENUES data. Babel Standalone parses everything before React renders. On mid-range Android at 3G: 5-10 second blank screen. Reddit is 70%+ mobile.

Fix: Move VENUES array to `venues.json`. On component mount, `fetch('./venues.json').then(r=>r.json()).then(setVenues)`. Show shimmer while loading. app.jsx drops to ~600 KB. First-paint time cuts by ~60%.

This is the highest-ROI engineering task in the codebase. It is not a split of the React app — it is data extraction. Single-file architecture is preserved.

**Decision: SHIP before next traffic event. No new venues until this ships.**

---

## Explicit Product Decisions This Report

**DECISION 1: No new features until TP_MARKER, email capture, and fetchWeather 429 fix ship.**  
We are 4 days post-Reddit launch. The product is earning $0 in tracked commissions, has built $0 in email list, and crashes on rate limit. These are not nice-to-haves. They are launch readiness gaps that shipped to Reddit.

**DECISION 2: VPS /api/alerts endpoint — SHIP before ProductHunt.**  
Alerts are set in the app. They never fire. A user who set an alert for Tavarua at 85+ score will never hear from Peakly again. This is the core retention mechanism and it is broken. The infrastructure (SW push handler, alert localStorage format) is all done. The missing piece is the VPS polling endpoint. This must ship before the next traffic event.

**DECISION 3: Venue expansion — FROZEN until venues.json ships.**  
app.jsx is 1.99 MB. Any new venue makes mobile load time worse. Freeze. 3,726 venues is more than enough. Unfreeze only after venues.json extraction ships.

**DECISION 4: ProductHunt launch — NOT before Week 2 post-Reddit.**  
The growth report suggested ProductHunt if Reddit delivered 200+ users. Correct instinct. But do NOT launch ProductHunt until TP_MARKER is set, email capture backend is live, and alerts fire. Sending ProductHunt traffic to a broken funnel wastes the launch slot.

**DECISION 5: Trips + Wishlists tabs — DEFERRED to 1K users.**  
Standing decision. Unchanged. Core flow (Explore → Detail → Book) is the only thing that matters pre-1K. Three tabs is correct.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Venue expansion beyond 3,726 | **FROZEN** | File size. Hurts mobile load. No new venues until venues.json ships. |
| Strike alerts server polish | **DEFER to 100 subscribers** | Build the list before building the infrastructure. Ship basic endpoint first. |
| iOS App Store (Capacitor) | **DEFER to 500 validated users** | $99 + 4-week review. Validate PMF first. |
| Google Play via PWABuilder | **SHIP post-Week-2** | $25, no code. Correct timing: amplify after Reddit traction is measured. |
| Dark mode | **CUT permanently** | No user signal. Not in 6 months. Unchanged. |
| Amazon links for zero-affiliate categories | **DEFER to Week 2** | Correct low-effort addition. Fix P1s first. |
| Scoring algorithm changes | **FROZEN** | Algorithm freeze per v16. Unchanged. |
| Trips + Wishlists tab exposure | **DEFER to 1K users** | Unchanged. |

---

## Success Criteria & 90-Day Projection

**Minimum viable signal from Reddit (Day 4):**
- 100+ visitors = minimum viable signal
- >5% alert set rate = value prop lands
- >8% flight click rate = monetization funnel working
- >20% 30-day retention = habit-forming product

**5K vs 8K at 90 days:**

| Lever | 5K scenario | 8K scenario |
|-------|-------------|-------------|
| TP_MARKER | Fixed Week 2 (lost first $50 in commissions) | Fixed TODAY |
| Mobile load time | 5-10s blank screen throughout | venues.json ships Week 1, <2s on mobile |
| Email list | 0 re-engageable emails from Reddit | 50+ emails captured → re-engagement campaign |
| Alerts | Still silent at Week 4 | VPS endpoint ships Week 1, first alert fires |
| Next traffic event | ProductHunt into broken funnel | ProductHunt into fixed, earning funnel |

**Verdict:** The 8K path requires fixing what's broken before the next traffic event. All 4 items are fixable this week. None require design decisions. The 5K path is what happens if we keep discussing them in reports.

---

## The Product Risk Nobody Is Talking About

**We set alerts for users who will never hear from us, and they don't know it.**

The alert flow works: users see the AlertsTab, set a venue + score threshold + price cap, and walk away trusting they'll get notified when conditions align. But the VPS `/api/alerts` endpoint that would poll those conditions and fire push notifications was never deployed. The app has been live for 4 days post-Reddit launch.

A user who found Peakly on Reddit, explored venues, found their dream surf break, set a score-85 alert for Pipeline, and walked away — they believe Peakly is watching for them. It isn't. When Pipeline goes off in 6 weeks, they won't get a notification. They'll never know Peakly existed.

This is the core retention mechanic. Every alert that silently never fires is a user who churns without knowing why. If Reddit brought 200 users and 10% set alerts, that's 20 people currently expecting a notification that will never come. Fix the VPS endpoint before the next traffic event. The infrastructure is done. The endpoint is the missing piece.

---

*PM agent v22 — 2026-04-04*  
*Filed for: Jack (jjciluzzi@gmail.com)*  
*Next report: 2026-04-07 (post-Week-1 Reddit debrief)*
