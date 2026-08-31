# Peakly PM Report v136 — 2026-08-31

**Status: 🟡 YELLOW — Day 9 post-launch. September 1 tomorrow. Ski pre-booking window opens. 4 venues still unshipped (Day 3 carry-over). Plausible script variant bug fixed in this run. Reddit October target locked; specific week named below.**

---

## Shipped Since Last Report (v135 → v136)

| Commit | What | Right call? |
|--------|------|-------------|
| `95e8f70` | DevOps report 2026-08-31 — YELLOW, Plausible dark Day 9, script.hash.js wrong variant confirmed | ✅ Identified a shippable code fix. Right call. |
| `69cbba2` | Content report 2026-08-31 — 98/100, 4 venues Day 3 carry-over, Portofino gap identified, ski pre-booking window opens today | ✅ Good signal. Portofino (GVA airport) is a real gap, noted for October batch. |
| **This run** | **Plausible script.hash.js → script.js** (`index.html:32`) | ✅ **SHIPPED**. One-line fix. DevOps confirmed the hash variant is wrong for this SPA's routing model. Peakly uses `history.replaceState`, not hash routing. Fix is live with this commit. |

**Jack shipped: nothing (venues). Day 9. The 4 carry-overs are now 4 days old for Trysil/Camps Bay/Perhentian/Nusa — ski pre-booking peaked today and Trysil is still not in the catalog.**

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED
Pro was cut. Not in app.jsx. Non-issue.

### Sentry DSN — CLOSED
DSN `9416b032a46681d74645b056fcb08eb7` live in both `index.html:77` and `app.jsx:7`. Confirmed.

### Cache buster — CLOSED
`20260829a` is correct. No app.jsx edits until the 4 venues land.

### Plausible Analytics — **P0 / PARTIAL FIX SHIPPED**

**Code fix shipped this run:** `script.hash.js` → `script.js`. The hash variant fires on initial pageload but stops recording SPA tab-navigation events. For a non-hash-routing SPA like Peakly, this discards every in-session tab change. Fix is live.

**Jack-side action still required:** Log into plausible.io and verify the site is registered as exactly `j1mmychu.github.io/peakly` (exact string, case-sensitive, no trailing slash). If misregistered, all events are silently discarded at the Plausible server regardless of what the client does. This is the most likely cause of complete darkness and **cannot be fixed in code** — it's a dashboard configuration step that takes 60 seconds.

Until Jack verifies the Plausible registration, we are still flying blind. The code fix prevents future SPA navigation events from being dropped once the registration is correct.

### VPS Disk Cache — Open #23 (P1, pre-Reddit gate, unchanged)
Still in-memory only. Patch is ready in `server/proxy.js` (DevOps Aug 31 has the exact code block). VPS deploy is a Jack-only SSH action. Must land before the October Reddit post. Bundle with any other VPS maintenance.

---

## Three Product Decisions — Aug 31

### Decision 1: Plausible script variant — SHIPPED

`index.html:32` now loads `script.js` instead of `script.hash.js`. This is the correct variant for a tab-navigation SPA with no hash-based URL routing. The hash variant was a confirming bug in the analytics darkness — it doesn't explain zero *pageviews* but it explains zero *custom events* (venue taps, airport sets, book clicks) beyond the initial load.

The remaining blocker is the Plausible dashboard registration (Jack). One action, 60 seconds.

### Decision 2: October Reddit post — specific week locked

The October decision landed in v135. v136 names the week:

**Target: Saturday, October 11, 2026 (r/skiing, 8–10am ET)**

Rationale:
- October 4 is too early — NH resorts don't open lifts until mid-October and a "best ski weekend" hook needs actual conditions data to be credible, not just anticipation.
- October 11 lands after the first confirmed NH powder dusting window (typically Oct 7–14 at A-Basin, Mammoth, Snowbird) and before full-season crowds show up.
- r/skiing weekly discussion threads start Saturday AM ET. A 9am ET post targets the prime upvote window before the thread saturates.
- Pre-post gate checklist starts **October 4** (one week out): device test, VPS disk cache deployed, hero screenshot with real weekend scores, Plausible verified.

**If no NH resort reports first snow by October 10:** fall back to the SH ski angle ("Southern Hemisphere ski season ends in 3 weeks — here's what's still firing"). The app has 132 ski venues; several NZ/AUS/Chile resorts will be in their final powder weeks. The hook adapts; the date doesn't move.

**October 11 is the date. No more discussion.**

### Decision 3: Venue search — Build starts September

v135 filed venue search as a P1 pre-Reddit gate. Naming it explicitly now so it gets built in September, not discussed.

**Scope (minimum viable):** Client-side text filter on the Explore grid. Fuzzy-match against `venue.title + venue.location + venue.tags`. Wire to a search input above the category pills. No new API, no new component, no SearchSheet changes. The SearchSheet is region/filter discovery — leave it alone.

**Why this is a P1:** A Reddit commenter who types "Mammoth" into Peakly's search and sees nothing kills the thread. "Where's Vail?" is a top-3 first comment on any ski app post. Text search is table stakes — a two-hour build that prevents a product-ending first impression.

**September build window is 4 weeks.** This ships before October 11.

---

## This Week's Top 3 Priorities

**1. Jack: Plausible dashboard — 60 seconds.**

plausible.io → Sites → verify the site is registered as exactly `j1mmychu.github.io/peakly`. If wrong: add the site with that exact domain. The code fix is already live (this run). Without the dashboard fix, we're still dark.

**2. Paste 4 venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan).**

Copy from Content report `69cbba2`. All 4 objects are clean and verified. Trysil is now 3 days late for the ski pre-booking window that opened today. Paste → auto-push commits. 5 minutes.

**3. Build venue text search in September — ship before October 4 pre-post gate.**

2-hour build. Client-side filter on `venue.title + venue.location + venue.tags`. Ship it this month.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Arolla Ski Area (paste now) | **DEFER to October** | December season start; 3 months of dead inventory |
| September Reddit post (any date) | **REJECTED** | Dead zone between beach and ski intent. October 11 is the date. |
| JSON-LD structured data | **DEFER** | Pre-analytics, can't validate if it moves needle. Post-first-1K-users. |
| Static h1 fallback | **DEFER** | Same as JSON-LD. |
| 400-venue milestone as Reddit hook | **REJECTED** | "We have 399 venues" is not a hook. Conditions + flight data is the hook. |
| Portofino venue (proposed by Content today) | **DEFER** | GVA airport, shoulder season (October add). Don't paste shoulder-season venues in September — dead in the sort for new users. |
| Score calibration display | **DEFER** | Still blind on analytics. Build this after reading Plausible week 1 data. |

---

## Success Criteria Check

**90-day projection: 5K–8K. What separates 8K from 5K?**

| Factor | 8K path | 5K path |
|--------|---------|---------|
| Reddit timing | October 11, first-powder hook, active planning intent | September post in trough, low velocity |
| Plausible verified | Read week 1 data, iterate by week 4 | Still dark at week 4 |
| Venue search | Live before Oct 4 pre-post gate | Missing, "no Mammoth" kills thread |
| VPS disk cache | Deployed before post, handles spike | Cold cache during spike = conditions unavailable for first 30min |
| Onboarding completion | >40% airport set rate | <25%, users see globally unsorted venues, bounce |

Same five factors as v135. None are blocked by external dependencies. All are in our control. The 8K path is the one where all five are done by October 4.

---

## One Product Risk Nobody Is Talking About

**The scoring engine is optimized for a user who already knows what Peakly is.**

The weekend score (0–100) works for someone who understands: Fri–Mon window, best-2-of-4 days, confidence flag. That's not the Reddit user. The Reddit user arrives with a specific question: "Is Mammoth good this weekend?" or "Where's a cheap beach trip right now?"

The current front page answers a different question: "Here are 395 venues ranked by a score you don't understand yet." The hero card shows a score, a period, and a confidence level. None of those mean anything to a first-time visitor.

**The specific risk:** The October Reddit post drives traffic, users land, see "Weekend Score 87 · HIGH", don't know what that means, and bounce before tapping. We'd have driven 5,000 people to the app and learned nothing useful because we never defined what "good first impression" looks like.

**The pre-post gate should include a specific hypothesis:** What does a "successful" Reddit cohort visit look like? Minimum: user sets an airport + taps at least one venue detail. That's a two-event sequence we can track in Plausible. Define it now, check it in week 1.

---

*v136 — written 2026-08-31. Next report due 2026-09-01.*
