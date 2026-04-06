# Peakly PM Report — 2026-04-05 (v22)

**Filed by:** Product Manager agent  
**Date:** 2026-04-05  
**Status:** 3-day dead zone. Zero commits since April 2. TP_MARKER still unset on Day 12.

---

## Shipped Since Last Report (2026-04-02 → 2026-04-05)

**Nothing.**

Zero commits in 3 days. The last PM report (v21) identified 6 open issues, requested 4 sub-10-minute fixes, and named TP_MARKER as a P0 revenue blocker for the 12th consecutive day. None of it shipped.

This is not a prioritization problem. The fixes are identified, the code locations are documented, and none require design decisions. The bottleneck is execution.

---

## Bug Triage — April 5

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | ❌ STILL UNSET | **Day 12** |
| **app.jsx = 2.0 MB (Babel parse 5-10s on mobile)** | **P1** | ❌ No action taken | Day 3 |
| **fetchWeather() throws on 429** | **P1** | ❌ `if (!r.ok) throw new Error(...)` — crashes Explore tab | Day 9 |
| **venue.facing ?? 270 swell scoring bug** | **P1** | ❌ Still in code (`app.jsx:4683`) | Day 9 |
| **Email capture — no backend list** | **P1** | ❌ localStorage only, no POST to any ESP | Day 12 |
| **React CDN unpinned (`@18`)** | **P2** | ❌ `index.html:80–81` still `react@18` | Day 9 |

**Confirmed by code inspection (April 5):**
- `app.jsx:5316` — `const TP_MARKER = "YOUR_TP_MARKER";` — placeholder. Every flight click since March 24 earns $0.
- `app.jsx:4543` — `if (!r.ok) throw new Error("weather fetch failed");` — fetchWeather crashes on 429. fetchMarine correctly returns null. One-line fix that has been documented in 3 consecutive reports.
- `app.jsx:4683` — `const spotFacing = venue.facing ?? 270;` — no `venue.facing` in VENUES data. Every surf break defaults to west-facing. Swell efficiency calculation is wrong for ~80% of breaks.
- `app.jsx` — 10,976 lines, 2.0 MB. Zero progress on venues.json extraction.
- Email submit handler — fires Plausible event, clears field, shows alert. Does not POST to any email service.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **TP_MARKER placeholder** | Jack — tp.media → Markers → copy ID → replace in app.jsx → push | **P0. Day 12. $0 earned since March 24.** |
| **app.jsx 2.0 MB** | Dev — extract VENUES to `venues.json`, async fetch on init | P1. Mobile visitors bounce before React renders. |
| **Email capture no backend** | Dev — POST to Loops.so free webhook on onboarding submit | P1. Emails typed since launch go nowhere. |
| **venue.facing swell bug** | Dev — delete lines 4683–4691, no venue has this field | P1. Surf scores are wrong for most breaks. |
| **fetchWeather() 429 crash** | Dev — change `throw new Error(...)` to `return null;` on line 4543 | P1. One line. |
| **React CDN unpinned** | Dev — `index.html:80–81` — pin to `react@18.3.1` | P2. Single CDN breaking change kills all users. |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |

---

## This Week's Top 3 Priorities

### 1. JACK: TP_MARKER. Day 12. This is not a dev task.

No code change required. No branch. No PR.

1. Go to tp.media
2. Log in → Markers → copy your marker ID (looks like `123456`)
3. Open `app.jsx`, find line 5316: `const TP_MARKER = "YOUR_TP_MARKER";`
4. Replace `"YOUR_TP_MARKER"` with your actual marker ID
5. `push "fix: set TP_MARKER for flight affiliate tracking"`

Five minutes. Twelve days of zero flight commissions. This is the highest-ROI action available to Peakly right now — it doesn't require writing a line of code.

**Decision: SHIP. Jack. Today. This is blocking revenue, not features.**

### 2. DEV: 3 P1 fixes, under 20 minutes total

These have been in every report since March 27. They are documented to the line number. There is no ambiguity about what to do.

**a) fetchWeather() 429 crash — 1 minute:**
`app.jsx:4543` — change:
```
if (!r.ok) throw new Error("weather fetch failed");
```
to:
```
if (r.status === 429) return null;
if (!r.ok) throw new Error("weather fetch failed");
```
fetchMarine() already does this correctly. Copy the pattern.

**b) venue.facing swell bug — 5 minutes:**
`app.jsx:4683–4691` — delete the spotFacing/swellAngleDiff/swellEfficiency block entirely. No VENUES entry has a `facing` property — the `?? 270` default makes every break appear west-facing. Deleting this block removes wrong data from surf scoring. Surfing is a top-3 focus category.

**c) React CDN pin — 2 minutes:**
`index.html:80–81` — change `react@18` → `react@18.3.1` and `react-dom@18` → `react-dom@18.3.1`. One unpkg breaking change = instant global outage.

**Decision: SHIP. Bundle into one commit. No design decisions required. Pure risk reduction.**

### 3. DEV: Email capture POST — 30 minutes, P1 revenue

Every email typed into the waitlist form since launch is gone. The onboarding submit handler fires a Plausible event and clears the field — it does not save to any list. If Reddit brought 300 visitors and 5% entered their email, that's 15 lost leads.

Fix: Sign up for Loops.so free tier (2,500 contacts free, no LLC required). Get the ingest URL. Add `fetch()` POST to the email submit handler in `app.jsx`.

This directly supports the 8K-not-5K scenario: re-engagement email when a target venue window opens = return visits = retention = word-of-mouth.

**Decision: SHIP this week. Jack signs up for Loops.so. Dev wires the POST (one fetch call).**

---

## Explicit Product Decisions This Report

**DECISION 1: TP_MARKER is Jack's task, not a dev task. It cannot be delegated.**  
The marker ID lives in Jack's tp.media account. No dev has access to it. Jack must log in, copy the ID, and make a 5-line change. Dev cannot unblock this.

**DECISION 2: venues.json extraction — DEFER one more week, but hard deadline is April 12.**  
The 3 P1 fixes above are higher priority than the extraction because they affect scoring correctness and crash behavior. Extract venues.json the week of April 7–12. After that, no new feature work until it ships.

**DECISION 3: Strike alerts server polling — DEFER until 50 alert subscribers confirmed.**  
Push infrastructure is live. There is no evidence of 50 alert subscribers. Building the server before the audience exists is premature. Check Plausible for `set_alert` events first.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Trips + Wishlists tab expose | **DEFER to 1K users** | Core flow converts first. CLAUDE.md says "ACTION NEEDED" — ignore it. 3 tabs is correct. |
| iOS App Store | **DEFER to 500 validated users** | $99 + 4-week review cycle. PMF not validated. |
| More venue expansion | **CUT until venues.json ships** | File is 2.0 MB. Adding venues worsens load time. |
| Scoring algorithm changes | **FROZEN** | Per PM v16 decision: algorithm freeze until post-Reddit. Surf facing bug fix is a data fix, not a scoring change. |
| Amazon links for zero-affiliate categories | **SHIP week 2** (still) | Correct and low-effort. Bundle with next code drop. |
| Google Play via PWABuilder | **DEFER to week 3 post-Reddit** | Amplify existing users. Can't amplify what doesn't exist yet. |
| Dark mode | **CUT permanently** | No user signal. Reconfirmed cut. |

---

## Success Criteria & 90-Day Projection

**What defines success:**
- 100 users in first 48 hours post-Reddit = minimum viable signal (Reddit spike was ~4 days ago — check Plausible)
- Alert set-rate >5% of sessions = core value prop lands
- Flight click-rate >8% of sessions = monetization funnel working
- 30-day retention >20% = habit-forming

**5K vs 8K at 90 days — updated:**

| Lever | 5K scenario | 8K scenario |
|-------|-------------|-------------|
| TP_MARKER | Never set. $0 flight commissions. Can't validate monetization. | Set Day 1. First commission data informs pricing/volume thesis. |
| Mobile load time | 2.0 MB → 5-10s blank screen → bounce | venues.json async → <2s first paint → users see value |
| Email list | 0 contacts because no backend POST | 50-200 emails → re-engagement loop when conditions align |
| Surf scoring | venue.facing bug → wrong scores → r/surfing users don't trust it | Bug deleted → scores credible → NPS climbs in core category |
| 429 crash | One rate-limit spike kills Explore tab for all concurrent users | Graceful null → degraded but functional |

**Verdict:** Path to 8K requires 3 code fixes (< 20 minutes) and one Jack action (TP_MARKER). Nothing on this list is a new feature. All of it is fixing what's broken.

---

## The Product Risk Nobody Is Talking About

**The email list doesn't exist.**

Every PM report flags TP_MARKER and the 429 crash. Nobody is talking about the email capture. Since Reddit launch, users who liked the app enough to enter their email — the highest-intent users in the funnel — typed into a form that immediately discarded their address. The Plausible `email_capture` event fires, which means we know it's happening. We just don't know how many because the emails were never saved.

These are not anonymous visitors. These are people who are willing to give you their contact information. In acquisition economics, that signal is worth 10–20x a page view. The email list is the re-engagement mechanism — it's how you bring users back when a 3-day powder window opens at their target resort, or when Mavericks starts breaking.

Without the list, Peakly has no retention lever beyond hoping users remember to come back. With the list, you can fire a "Your window just opened" email in week 6 and get 30-day retention numbers that justify the next funding or growth push.

Loops.so is free for 2,500 contacts. This is a 30-minute fix. It has appeared in every report since April 1 and has not shipped.

---

*PM agent v22 — 2026-04-05*  
*Filed for: Jack (jjciluzzi@gmail.com)*
