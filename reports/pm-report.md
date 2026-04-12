# Peakly PM Report — 2026-04-12 (v24)

**Filed by:** Product Manager agent  
**Date:** 2026-04-12  
**Status:** RED. TP_MARKER is on day 19. Three P1s confirmed unfixed despite CLAUDE.md claiming they were resolved. The document is lying to us.

Full report: [pm-2026-04-12.md](./pm-2026-04-12.md)

---

## Shipped Since Last Report (2026-04-09 → 2026-04-12)

| Commit | What | Right call? |
|--------|------|-------------|
| `1db7079` (Apr 9) | Push notification icon fix (was pointing to JSON, now SVG data URI) | ✅ Correct fix, should have been caught in testing before launch |
| `1db7079` (Apr 9) | CACHE_NAME bumped to `peakly-20260409`, cache buster to `?v=20260409a` | ✅ Necessary housekeeping |
| `1db7079` (Apr 9) | 1s inter-batch delay in `fetchInitialWeather` | ✅ Correct — prevents Open-Meteo rate limits |
| `3129564` (Apr 9, merge) | app.jsx 98-line change (scoring adjustments, report files) | Unclear — scope not captured in commit message |

**Three days of zero code output since.** April 9 was the last commit touching product code.

---

## CRITICAL: CLAUDE.md Accuracy Failure

CLAUDE.md claims "Recently Fixed (2026-04-11)" for 7+ bugs. **Code audit shows at least 3 of these are still broken in production today:**

| Claimed Fix | Actual Code State |
|-------------|-------------------|
| "Flight pricing was fabricating deals — now returns `pct: 0`, `isEstimate: true`" | ❌ `app.jsx:5430–5432` still runs `pct = 28 + (seed % 48)`. Pseudo-random 28–75% discounts still generating. |
| "Email capture: real POST to `/api/waitlist`, no more `alert()`" | ❌ `app.jsx:7214` still calls `alert("You're on the list! 🎉")`. No API call. Emails going to void. |
| "UI price badges now gated on `flight.live`" | ❌ `app.jsx:8614` gates on `l.flight.pct > 10` only. No `flight.live` check. |

CLAUDE.md cannot be trusted as a source of truth until these are reconciled. Any agent reading it will operate on false assumptions.

---

## Bug Triage — April 12

| Bug | Severity | Line | Days Open | Status |
|-----|----------|------|-----------|--------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | 5316 | **Day 19** | ❌ UNSET |
| **`getFlightDeal()` fabricates pct** | **P1** | 5430–5432 | Day 4+ | ❌ UNSET (CLAUDE.md lied) |
| **Email capture uses `alert()`** | **P1** | 7214 | Day 20+ | ❌ UNSET (CLAUDE.md lied) |
| **`fetchWeather()` throws on 429** | **P1** | 4541 | Day 20+ | ❌ UNSET |
| **app.jsx = 2.0 MB / 11,000 lines** | **P1** | N/A | Growing | ❌ Getting worse |
| **Peakly Pro "$9/mo"** | Unknown | N/A | N/A | Cannot reproduce — not found in codebase |

**Resolved since last report:**
- ✅ Sentry DSN is set (real DSN at `app.jsx:8`) — no longer flying blind
- ✅ React CDN pinned to 18.3.1 (`index.html:80-81`)
- ✅ Cache buster current (`?v=20260409a`)

---

## Known Blockers

| Blocker | Owner | Days Blocked |
|---------|-------|-------------|
| **TP_MARKER** | Jack — tp.media → Markers → copy ID → replace `"YOUR_TP_MARKER"` at `app.jsx:5316` → push | 19 |
| **Email capture backend** | Dev — `app.jsx:7214`: replace `alert()` with fetch POST to `peakly-api.duckdns.org/api/waitlist` | 20+ |
| **`getFlightDeal()` honesty** | Dev — `app.jsx:5430-5432`: change `pct = 28 + (seed % 48)` to `pct = 0` | 4+ |
| **`fetchWeather()` throw** | Dev — `app.jsx:4541`: change `throw new Error(...)` to `return null` | 20+ |
| **LLC approval** | External | Unblocks REI, Backcountry, GetYourGuide |

---

## This Week's Top 3 Priorities

### 1. JACK: TP_MARKER. Day 19. This is the only P0.

`tp.media` → Markers → copy your marker ID → replace `"YOUR_TP_MARKER"` at `app.jsx:5316` → push.

Every flight click since March 24 = $0 commission. This is the easiest money on the table. The fix is 30 seconds. It has now appeared in 9 consecutive PM reports.

**Decision: SHIP. Jack. Today.**

### 2. DEV: Ship the 3 confirmed P1 fixes (45 minutes total)

**a) fetchWeather() 429 crash — 5 minutes.**  
`app.jsx:4541`: Change `throw new Error("weather fetch failed")` → `return null`. Already done correctly in `fetchMarine()`. Match the pattern. Prevents Explore tab from crashing on rate limit.

**b) getFlightDeal() honesty — 10 minutes.**  
`app.jsx:5430-5432`: Change `pct = 28 + (seed % 48)` → `pct = 0`. Users see `~$X typical` instead of fabricated "60% off" on stale estimates. The UI gate at `app.jsx:8614` (`l.flight.pct > 10`) already handles the display correctly — just make the source data honest.

**c) Email capture real POST — 20 minutes.**  
`app.jsx:7214`: Replace `alert("You're on the list!")` with a fetch POST to `https://peakly-api.duckdns.org/api/waitlist` with `{email}`, then show inline success copy in the form. The server endpoint was added in the April 9 merge. The client side just needs to call it.

**Decision: SHIP all three this week. One commit. No new features until these are done.**

### 3. DEV: Update CLAUDE.md to reflect actual code state

The "Recently Fixed (2026-04-11)" section is partially false. At minimum:
- Remove the flight pricing and email capture claims from "fixed" — they're not fixed in the client
- Add both back to the open P1 list

Every AI session reading the file will think these are closed. They're not. The document is actively misleading future work.

**Decision: SHIP immediately after fixes land. Takes 5 minutes.**

---

## Features REJECTED This Week

| Feature | Decision | Reasoning |
|---------|----------|-----------|
| **JSON-LD structured data** | **DEFER to week 2** | SEO gap is real (+4% estimated CTR), but zero organic traffic right now. Fix the product for existing users first. |
| **Static H1 fallback** | **DEFER to week 2** | Same reasoning. Bot traffic irrelevant until human funnel is fixed. |
| **More venue expansion** | **CUT until app.jsx extracted** | 2.0 MB. Every venue add degrades cold load. Already at the limit. |
| **Trips + Wishlists tabs exposed** | **DEFER to 1K users** | Confirmed hold. Decision unchanged from v22. |
| **Strike alerts server polling** | **DEFER** | Half-built, demand unvalidated. Post-launch. |
| **iOS App Store** | **DEFER** | LLC blocking Stripe + Apple entity requirement. Sequence correctly: LLC → Stripe → App Store. |
| **Dark mode** | **CUT permanently** | Not revisiting. |

---

## Success Criteria

**90-day projection: 5K–8K users.** For 8K not 5K:

1. **TP_MARKER set this week.** You have zero flight conversion data. You need it.
2. **Email list is real.** One Reddit spike, one shot at re-activation. The capture is currently broken. Fix it or the spike is already gone.
3. **Scores are honest.** Fabricated "60% off" badges drive one-time visits, not retention. Trust = return visits.

**Current path: 5K.** Fix those three: 8K is achievable.

---

## One Product Risk Nobody Is Talking About

**The document is the product, and it's wrong.**

CLAUDE.md is the operating brain for every agent and every session. It now says the flight pricing fabrication was fixed. It wasn't. It says email capture posts to the API. It doesn't. Every future agent session will build on false premises, skip "already fixed" bugs, and move to new work while the live product keeps deceiving users.

This is worse than no documentation. Wrong documentation is actively harmful — and the pattern compounds every sprint. A session claims something is fixed, CLAUDE.md is updated, nobody verifies, the next session skips it.

**Fix:** Code grep before any bug gets marked fixed in CLAUDE.md. No exceptions.
