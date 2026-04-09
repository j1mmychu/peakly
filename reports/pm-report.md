# Peakly PM Report — 2026-04-09 (v24)

**Filed by:** Product Manager agent  
**Status:** One real code fix today (push icon, cache buster). TP_MARKER Day 16. New P0 from DevOps: proxy has zero rate limiting. React CDN pin resolved. Everything else still open.

Full report: [pm-2026-04-09.md](./pm-2026-04-09.md)

---

## Shipped Since Last Report (2026-04-02 → 2026-04-06)

| Commit | What | Right call? |
|--------|------|-------------|
| — | **Nothing shipped in 4 days** | ❌ This is the biggest risk in the codebase right now |

**Four days of inactivity after Reddit launch is a dead window.** Any Reddit visitors who bookmarked the app and returned are getting the same experience they left. No improvement. No follow-up. No urgency.

The last commit (2026-04-02) was a PM report file. The last code commit (2026-04-01) was a flight URL patch — the fourth patch in a week on fragile code that needed a clean rewrite.

---

## Bug Triage — April 6

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | ❌ STILL UNSET | **Day 13** |
| **app.jsx = 1.99 MB / 10,976 lines (Babel parse 5-10s mobile)** | **P1** | ❌ Getting worse with every venue add | Day 4 |
| **fetchWeather() throws on 429 — line 4541** | **P1** | ❌ fetchMarine() returns null on !ok. fetchWeather() throws. Crashes the tab on rate limit. | Day 14+ |
| **venue.facing ?? 270 swell scoring bug** | **P1** | ❌ Line 4683. Wrong surf scores for majority of breaks. | Day 11 |
| **Email capture — no backend** | **P1** | ❌ Emails going to localStorage void | Day 13+ |
| **React CDN unpinned — react@18** | **P2** | ❌ index.html:80–81. One CDN breaking change = all users dead. | Day 11 |
| **Photo duplication at 3,726 venues** | **P2** | ❌ Unsplash photo IDs reused across many venues | Day 14+ |

**New P1 confirmed: fetchWeather() throws on 429.**
`fetchMarine()` returns `null` on any error (`if (!r.ok) return null`). `fetchWeather()` throws (`if (!r.ok) throw new Error(...)`). When Open-Meteo rate-limits, the weather fetch crashes instead of gracefully degrading. The Explore tab breaks for all users simultaneously. This is a 5-line fix (line 4541: change throw to return null) that has been sitting unfixed for 2+ weeks while lower-priority work shipped.

---

## Known Blockers

| Blocker | Owner | Status |
|---------|-------|--------|
| **TP_MARKER placeholder** | Jack — tp.media → Markers → copy ID → app.jsx:5316 → push | **P0. Day 13. Every flight click since March 24 = $0.** |
| **app.jsx 1.99 MB** | Dev — extract VENUES to venues.json, fetch async on init | P1. Mobile bounce on cold load. Getting worse with each venue expansion. |
| **fetchWeather() 429 crash** | Dev — line 4541, change `throw` to `return null` | P1. Explore tab crashes on rate limit. 5-line fix. |
| **venue.facing swell bug** | Dev — delete lines 4683–4691 | P1. Wrong surf scores. Credibility risk on r/surfing. |
| **Email capture no backend** | Dev — Loops.so POST on onboarding complete | P1. Every Reddit visitor email is already lost. |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **VPS /api/flights/latest status** | Jack — `curl https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN` | Still unconfirmed. Proxy may be 404ing since March 29. |

---

## This Week's Top 3 Priorities

### 1. JACK: TP_MARKER. Day 13. This is the only P0 in the codebase.

`tp.media` → Markers → copy your marker ID → replace `"YOUR_TP_MARKER"` at `app.jsx:5316` → push.

Every flight affiliate click since March 24 has been unattributed and unmonetized. If Reddit brought 300 visitors and 8% clicked a flight link, that's 24+ lost conversions. The fix is 5 minutes. It has appeared in every PM report since v13.

**Decision: SHIP. Jack. Today. Not this week. Today.**

### 2. DEV: Ship the 3 unblocked P1 fixes (45 minutes total)

All three are surgical, confirmed bugs, no design decisions required:

**a) fetchWeather() 429 fix — 5 minutes.** `app.jsx:4541`: change `throw new Error("weather fetch failed")` to `return null`. fetchMarine() already does this correctly. This prevents the Explore tab from crashing when Open-Meteo rate-limits.

**b) venue.facing swell bug — 10 minutes.** Delete lines 4683–4691 (the `spotFacing`/`swellAlignment`/`swellAngleDiff` block). The `venue.facing ?? 270` default applies west-facing swell to all surf venues without explicit `facing` data, which is most of them. East-coast breaks, J-Bay, Brazilian northeast coast — all penalized incorrectly.

**c) React CDN pin — 2 minutes.** `index.html:80–81`: change `react@18` → `react@18.3.1` and `react-dom@18` → `react-dom@18.3.1`. One minor breaking change from the CDN kills all users simultaneously with zero warning.

**Decision: SHIP all three this week. Combine into one commit. No new features until these are done.**

### 3. DEV: Email capture backend — 30 minutes

Every email typed into the onboarding form since launch is permanently lost. Loops.so is free up to 2,500 contacts, requires no LLC, no Stripe, no backend deploy.

On onboarding complete, `fetch()` POST to Loops.so free-tier webhook with `{email, name}`. This is the entire implementation. Without it, Peakly has no list to reactivate after the Reddit spike fades.

**Decision: SHIP this week. The list we should have been building since March 24 is gone. Don't lose the next batch.**

---

## Features REJECTED This Week

| Feature | Decision | Reasoning |
|---------|----------|-----------|
| **More venue expansion** | **CUT until app.jsx extracted** | app.jsx is already 1.99 MB. Adding venues makes mobile load worse. Every venue added now is costing conversion. No more venues until VENUES is extracted to venues.json. |
| **Trips + Wishlists tabs exposed** | **DEFER** | Core flow first. Reddit visitors are top-of-funnel. More tabs = confusion. Post-1K users. |
| **Strike alerts server polling** | **DEFER** | Infrastructure half-built. Demand not validated. Phase 2. |
| **Google Play Store via PWABuilder** | **DEFER to after email backend** | $25, correct direction. Irrelevant if we can't re-engage users we already have. |
| **Amazon gear links (5 zero-revenue categories)** | **DEFER to week 2** | +$1.50–2.00 RPM potential. Not the constraint right now. |
| **Scoring algorithm changes** | **CUT** | Freeze holds. Per v16 decision. Stability over perfection until post-Reddit data shows specific gaps. |
| **Dark mode** | **CUT permanently** | Repeated decision. Not in next 6 months. |

---

## Success Criteria

| Metric | 5K users (base case) | 8K users (upside case) |
|--------|---------------------|----------------------|
| TP_MARKER set | Before next post | Before next post (identical requirement) |
| Email re-engagement | 50+ emails, re-engage at day 7 | 150+ emails, automated day-7 follow-up → 20% return |
| VPS proxy confirmed live | Confirmed before next post | Confirmed before next post |
| Second Reddit post | Not posted | r/skiing or r/solotravel cross-post within 7 days of first |
| Week-2 retention | 5% of Reddit visitors return | 15% return via email + UX improvement on load time |
| Mobile load time | Still 5-10s on Android | < 2s via venues.json extraction |

**The 8K path requires two things: (1) a second Reddit post this week, and (2) email re-engagement to pull back week-1 visitors. Both require the email backend to be live first.**

---

## One Product Risk Nobody Is Talking About

**The 4-day shipping gap is the symptom of a prioritization failure, not a resourcing failure.**

Between April 2 and April 6, no code shipped. During that same window:
- TP_MARKER remained a placeholder (Day 13 of $0 affiliate attribution)
- fetchWeather() continued to throw on rate limits instead of returning null
- The email capture form continued collecting emails into localhost void
- The React CDN continued running unpinned

These are not hard problems. The fetchWeather() fix is one line. The React pin is two lines. TP_MARKER is a copy-paste from a dashboard. Together they take 20 minutes.

The risk is that Peakly has entered a pattern where agent reports correctly identify P0/P1 issues and they remain unfixed across multiple reporting cycles, while lower-priority work (flight URL patches, splash screen animations, GitHub Actions) continues to ship. Reports are not a substitute for shipping.

**The 4-day gap cost more than any bug in the codebase. Every day TP_MARKER is unset after a Reddit spike is a day the affiliate relationship generates $0 instead of data.**

---

## Decisions Made This Report

| Date | Decision |
|------|----------|
| 2026-04-06 | **TP_MARKER: P0. Day 13. Jack ships before end of day.** |
| 2026-04-06 | **fetchWeather() 429: SHIP. app.jsx:4541. One-line fix. This week.** |
| 2026-04-06 | **venue.facing swell bug: SHIP. app.jsx:4683–4691. Delete block. This week.** |
| 2026-04-06 | **React CDN pin: SHIP. index.html:80–81. Two lines. This week.** |
| 2026-04-06 | **Email backend: SHIP. Loops.so POST. 30 min. This week.** |
| 2026-04-06 | **No more venue expansions until app.jsx VENUES extracted to venues.json. Performance is now the constraint.** |
| 2026-04-06 | **Second Reddit post: EXECUTE this week. r/skiing or r/solotravel. TP_MARKER must be set first.** |

---

## 4-Bug Fix Checklist (Execute In Order, ~45 Minutes Total)

- [ ] **Jack:** Copy TP_MARKER from tp.media → replace `"YOUR_TP_MARKER"` at `app.jsx:5316` → push (5 min)
- [ ] **Jack:** `curl "https://peakly-api.duckdns.org/api/flights/latest?origin=JFK&destination=BCN"` — confirm 200 or 404 (2 min)
- [ ] **Dev:** `app.jsx:4541` — change `throw new Error("weather fetch failed")` → `return null` (5 min)
- [ ] **Dev:** `app.jsx:4683–4691` — delete venue.facing/swellAlignment block (10 min)
- [ ] **Dev:** `index.html:80–81` — pin `react@18` → `react@18.3.1`, `react-dom@18` → `react-dom@18.3.1` (2 min)
- [ ] **Dev:** Add Loops.so POST to onboarding email capture (30 min)
- [ ] **Dev:** Bump cache buster in index.html script tag
- [ ] **Jack:** Second Reddit post — r/skiing or r/solotravel (after above ships)

---

*Next report: 2026-04-07 | Filed by PM agent (v22)*
