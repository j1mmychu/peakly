# Peakly PM Report — 2026-03-30 (v19, Pre-Launch)

**Reddit launch target: Tomorrow — Tuesday March 31, 9–11am ET. 18 hours out.**

---

## Shipped Since Last Report (2026-03-29)

| Commit | Item | Verdict | Notes |
|--------|------|---------|-------|
| `dad5068` | Airport setup modal in onboarding | **RIGHT CALL** | Directly addresses the PM-v18 blocker: new users need a home airport to see meaningful flight prices. Good UX fix, executed correctly, ships before Reddit. |
| `d61e0c5` | Flight price caching + priority fetching + shimmer | **RIGHT CALL** | Priority-fetching top 10 venues by score first is exactly right. The shimmer placeholder is a polish detail that matters on first impression. Prevents API hammering on launch day. |
| `1e5a026` | **Fix broken flight booking button URL** | **CRITICAL FIX** | This was a P0 — the flight booking button was generating malformed Aviasales URLs. Users who clicked "Book" were going nowhere. Fixed: null/short date guard, JFK fallback for empty homeAirport. Without this, the entire flight CTA was dead. |
| `ee6f788` | Proxy server: /api/flights/latest + /api/alerts routes | **RIGHT CALL** | Server infrastructure for alerts is correct. In-memory store needs a persistent DB post-launch, but for Reddit day it handles 50–100 registrations fine. |
| `8f2585b` | Flight pricing: "from $X", last-seen timestamps | **RIGHT CALL** | Language fix + correct endpoint. |

**Assessment:** The flight booking URL fix (`1e5a026`) is the most important commit in this batch. It was a silent revenue killer — every flight click was broken. Shipping this 18 hours before Reddit is a near-miss. It should have been caught earlier.

**Opportunity cost concern:** `d61e0c5` is ~200 lines of refactoring with new state + caching logic the day before a launch. The risk of introducing a regression in the heavily-modified flight fetching layer, 18 hours before Reddit, is real. This is exactly the window where a new bug could go undetected.

---

## Blocked (Reddit launch in 18 hours)

| Blocker | Owner | Status | Days Stalled | Launch Risk |
|---------|-------|--------|-------------|-------------|
| **TP_MARKER placeholder** | Jack — tp.media dashboard | ❌ NOT DONE | **Day 7** | 🔴 HIGH — Every flight click tomorrow earns $0, zero attribution |
| **venue.facing swell revert** | Dev | ❌ NOT DONE | Day 3 | 🟡 MEDIUM — Wrong surf scores for ~half of breaks. Surfline users will notice |
| **React unpinned (@18 vs @18.3.1)** | Dev | ❌ NOT DONE | Day 3 | 🟡 MEDIUM — unpkg @18 resolves to latest minor. React could push a breaking change tonight |
| **Email server-side capture** | Dev | ❌ NOT DONE | Day 3 | 🟡 MEDIUM — Emails go to localStorage only. No list. No re-engagement. |
| **Photo diversity** | Dev/Content | ❌ NOT DONE | Day 3 | 🟡 MEDIUM — Same Unsplash photo for 200+ fishing/kayak venues. Reddit callout risk |
| **LLC approval** | External | Pending | — | 🟢 LOW — Not a launch blocker. Revenue gap, not UX gap |

---

## This Week's Top 3 Priorities (execution order)

### 1. JACK: Fix TP_MARKER. Right now. Before bed.

Day 7 of flagging this. Reddit is tomorrow morning. The math: 500 Reddit visitors × 10% flight click rate = 50 flight clicks at $0 commission, zero attribution data. Travelpayouts pays $1.80–2.40 per booking. At 5% booking conversion from 50 clicks, that is 2–3 bookings = $4–7 lost revenue on day 1 alone — plus no data on which destinations are converting.

This is a 5-minute action on tp.media dashboard.

**Decision: TP_MARKER set before the Reddit post goes live. The only action Jack must personally complete tonight.**

### 2. DEV: Two fixes before midnight

**React pin (2 min):** Change `@18` → `@18.3.1` in both unpkg CDN script tags in `index.html`. The `@18` tag resolves to whatever is latest in the 18.x range. If unpkg serves anything new tonight, it changes what users get. Pin it.

**venue.facing revert (20 min):** Delete `app.jsx` lines 4683–4692 (the `spotFacing`/`swellAlignment` block). Score swell by height + period only, same as pre-b2aa247. The `venue.facing ?? 270` default is wrong for ~half of global surf breaks. East-facing breaks (J-Bay, Brazilian coast, Caribbean) are penalized against a west-facing default. Surfline power-users on Reddit will notice wrong scores.

Neither of these is a feature. Both are risk reduction. Both are reversible in under 5 minutes.

**Decision: Both ship tonight. Total time: 25 minutes. Non-negotiable.**

### 3. HOLD THE LINE: Code freeze until after Reddit

The `d61e0c5` flight caching refactor added ~200 lines to the most critical user flow the day before launch. **Zero additional commits to app.jsx** between midnight tonight and when the Reddit post is live and stable (March 31, 1pm ET minimum).

The only acceptable commits tonight: React pin (index.html, 1 line), venue.facing revert (app.jsx, ~10 lines deleted), TP_MARKER constant (1 line). Nothing else.

**Decision: Code freeze from midnight tonight to March 31 1pm ET.**

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| Onboarding email POST to server | **DEFER to April 1** | Don't ship email infrastructure on launch eve. Reddit list is small enough to manually capture if needed. |
| Photo diversity fix | **DEFER to April 1** | Touching content 18 hours before launch risks introducing errors. The callout risk is lower than a launch-day bug. |
| Proxy server persistent DB | **DEFER to 100 alerts** | In-memory store is correct for launch scale. Build after demand is validated. |
| Strike alerts server polling | **DEFER — cut for launch** | `/api/alerts` registers but nothing polls. Audit AlertsTab copy: soften any language promising push delivery. Don't promise functionality that doesn't exist. |
| Google Play via PWABuilder | **DEFER to 500 users** | Validate Reddit demand first. |
| Trips + Wishlists tabs | **DEFER to 1K users** | Standing decision since March 25. |
| Gear section re-enable | **CUT for launch** | `{false && GEAR_ITEMS...}` is correct. Revisit post-launch with real affiliate IDs. |

---

## Success Criteria

**90-day target: 6K–10K users.**

| Lever | 6K scenario | 10K scenario |
|-------|-------------|--------------|
| TP_MARKER | Set on day 3 after Reddit. Commission data lost for first 3 days. | Set before Reddit post. Every click attributed from minute 1. |
| Reddit thread quality | "I built a surf/ski conditions app" — generic, forgettable | Specific FOMO: "Pipeline is firing next Thursday. Flights from LAX: $220. Peakly called it 7 days out." |
| venue.facing bug | Surfline power-users notice wrong scores for J-Bay, Brazil, Caribbean. Thread derails. | Reverted tonight. No wrong scores. |
| Flight booking | Users who visited before March 29 may remember broken buttons. | All flight CTAs work. Shimmer → price snap is clean. First impression recovers. |
| Email list | 0 emails captured server-side. No re-engagement ever. | Email POST ships April 1. Reddit users re-engaged when next window opens. |

**What separates 10K from 6K is not features — it's one moment of genuine social proof in the Reddit thread.** One person posting "holy shit, it said my local break would fire Thursday and it did" is worth 1,000 MAU more than any feature shipped this week.

---

## One Product Risk Nobody Is Talking About

**The `d61e0c5` flight caching refactor ships 18 hours before Reddit.**

~200 lines of new logic touching `fetchTravelpayoutsPrice`, `ListingCard`, `FeaturedCard`, `CompactCard`, priority fetch queue, and new localStorage keys (`peakly_flights_{origin}_{dest}`). If there is a bug in cache invalidation logic, users could see stale prices indefinitely. If the priority fetch queue has a race condition, the hero card could spin on shimmer for the entire session.

Neither bug would be caught by a casual manual test. Both surface under real load with diverse origin airports — exactly the conditions of a Reddit spike.

The risk is acceptable because the broken URL bug in `1e5a026` was genuinely worse. But the lesson: stop shipping to the critical path on launch eve. Tonight's only commits are React pin + venue.facing revert.

---

## Decisions Made This Report

| Date | Decision |
|------|----------|
| 2026-03-30 | **Code freeze on app.jsx: midnight tonight to March 31 1pm ET.** Only exceptions: React pin, venue.facing revert, TP_MARKER constant. |
| 2026-03-30 | **Email server-side POST: defer to April 1.** Not shipping infrastructure on launch eve. |
| 2026-03-30 | **Photo diversity: defer to April 1.** Content risk lower than launch-day code risk. |
| 2026-03-30 | **TP_MARKER: Jack sets before Reddit post. Day 7. No exceptions.** |
| 2026-03-30 | **venue.facing revert: ships tonight.** 20-minute fix, zero feature risk. |
| 2026-03-30 | **Strike alert copy audit: soften push delivery language** in AlertsTab. Server-side polling doesn't exist yet. Don't promise it. |

---

*Next report: 2026-04-01 (post-Reddit launch retrospective)*
