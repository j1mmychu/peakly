# Peakly PM Report — 2026-06-08 (v52)

> Supersedes v51 (June 7). **Status: RED — Launch day was yesterday. 50+ auto: commits shipped since v51, including a P0 revenue regression (GEAR_ITEMS removed) and a critical bug fix (beach water-temp field was wrong since launch). VPS still Day 35.**

---

## Shipped Since v51 (2026-06-07 → 2026-06-08)

| What | Verdict |
|------|---------|
| **`ocean_temperature_max` → `sea_surface_temperature_max` fix** | ✅ **Critical bug fix.** Beach venues had been scoring WITHOUT water-temp data since the May 3 launch. Open-Meteo's field was never named `ocean_temperature_max` — that name doesn't exist in their API. Silent failure for 36 days. Beach scoring is now correct for the first time. |
| **Date range filter removed from SearchSheet** | ✅ Correct. Product is 7-day only. Custom date pickers were dead UI. |
| **Exact-fare-only mode in `applyFilters`** | ⚠️ Correct intent, UX risk. Once all flight fetches complete, grid collapses to live-fare-only venues. See Decision 2. |
| **ServiceStatusPill on Profile tab** | ⚠️ Good transparency tool, but exposes "APNS: not configured" to end users. See Decision 3. |
| **AIRPORT_COORDS expanded** (20+ new entries: ASE, BTV, BZN, EYW, KOA, OGG, YKA, YLW, etc.) | ✅ Correct. Prevents silent `NaN` in `flightHours()` for venues using these airports. |
| **CORS moved before rate limiter in proxy.js** | ✅ Correct. 429 responses now include CORS headers. Without this, rate-limit errors looked like CORS errors to the browser. |
| **Rate limit bumped 60 → 600 req/min in proxy.js** | ✅ **Critical fix.** A single cold Peakly load fires ~235 calls in 5s. The 60/min cap was rate-limiting normal usage, not abuse. Was undeployed anyway, but the fix is correct. |
| **iOS build pipeline created** (`scripts/build-ios.mjs`, `scripts/build-ios.sh`) | ✅ Necessary for App Store Guideline 2.5.2 (offline requirement). Pre-transpiles JSX, vendors all CDN deps locally. Right code; timing (during code freeze) was grey area. |
| **DevOps June 8** — cache bumped `20260607ae` → `20260608a` | ✅ Cache is current. |
| **`GEAR_ITEMS` removed from app.jsx** | ❌ **P0 REVENUE REGRESSION.** Amazon Associates ($4.48/1K MAU) is dead. All 8 gear items gone. No warning, no flag in the commit message. |

---

## Bug Triage — June 8

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| **GEAR_ITEMS removed — Amazon Associates dead** | **P0** | **Day 1** | Restore immediately. Revenue regression introduced in `12ebc13` (Jack, June 7 18:42). |
| **VPS proxy unredeployed** | **P0** | **Day 35** | Jack. `ssh root@198.199.80.21 && cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy`. 3 minutes. |
| CORS localhost origins in prod proxy.js | P1 | Day 2 | Bundle with VPS redeploy SSH session. Same 3-minute window. |
| `ski_gudauri` + `thredbo-village-s23` duplicate photo | P1 | Day 1 | Content has ready replacement. Ship June 10. |
| OBX near-dup (`beach_ob` + `outer-banks-nags-head-t7`) | P2 | Day 5 | June 10. Needs localStorage migration guard. |
| `beach_gilit` ID typo | P2 | Day 2 | June 10. Functionally harmless, needs migration guard. |
| `borabora` "UV 11" tag leaking | P2 | Day 5 | June 10. Replace with `"Overwater Bungalows"`. |
| ICN not in `AP_CONTINENT` | P2 | Day 1 | June 10. Preemptive fix. |
| Cache-buster auto-bump not in auto-push.sh | P2 | Day 14 | June 10. DevOps has the 5-line script. |
| Eager Supabase script (80KB anon load) | P2 | Day 35 | June 10. Diff exists. |
| 34 ski venues with only 2 tags | P3 | Day 1 | Defer. |
| skiPass backfill (16–25 venues missing) | P3 | Day 11 | June 10. |

**Confirmed closed since v51:**
- ✅ APNS Capacitor gate: live at app.jsx:8327. Tab hides on iOS native when APNS unconfigured. Option B chosen — correct decision.
- ✅ Beach water-temp data: fixed (`sea_surface_temperature_max`). 36-day silent failure closed.
- ✅ Cache buster: `20260608a` — current.
- ✅ Sentry DSN: active.
- ✅ Peakly Pro: UI removed, no price visible.

---

## Known Blockers

| Blocker | What It Unlocks | ETA |
|---------|----------------|-----|
| Restore GEAR_ITEMS | Amazon revenue stream ($4.48/1K MAU) | Today |
| VPS SSH + pm2 restart | Weather proxy cache (67 DAU ceiling), CORS fix, correct weekend pricing | Today |
| LLC approval | REI + Backcountry + GetYourGuide = +$8.00/1K MAU (67% revenue uplift) | External |
| Apple Developer enrollment ($99) | App Store iOS submission | Post-launch |

---

## Explicit Product Decisions — June 8

### Decision 1: Restore GEAR_ITEMS today. This is not negotiable.

Amazon Associates was working. It was removed in a Jack auto-commit at 18:42 PDT on June 7 — **launch day** — in a 26-line deletion with no note in the commit message. This is exactly the kind of silent regression auto: commits enable: no code review, no feature context, no flag.

The constant and all 8 items (4 skiing, 4 beach) need to be restored verbatim. The last clean version is in `a676725` (June 7, before the deletion). One `git show a676725:app.jsx | grep -A 40 "const GEAR_ITEMS"` retrieves it.

**Revenue math:** At 5K MAU (conservative 90-day target), Amazon earns $22.40/month. Not life-changing, but it was **working** and got removed on launch day. That's not a product call — that's an accident.

**Action:** Restore GEAR_ITEMS and all render code before any other app.jsx changes today.

---

### Decision 2: Exact-fare-only mode is correct but needs a loading guard.

The new `applyFilters` logic collapses the grid to live-fare-only venues once all 156 flight fetches complete. This is the right product behavior — we shouldn't rank a $400 estimate alongside a confirmed $180 live fare. But the UX is jarring: after 30–60 seconds of loading, the grid can visibly shrink from 89 beach venues to whatever subset returned live fares.

**Two options:**

Option A (preferred): Add a transition state. While `anyFlightLoading === true`, show a subtle "Live prices loading…" indicator in the grid header. When it switches to false and the grid collapses, animate it. Users who see the context don't bounce.

Option B: Keep as-is. The grid collapsing is honest product behavior and most users won't notice a 5-second load window. Ship now; polish after launch feedback.

**Decision: Option B for now. Option A in June 10 sprint.** Don't block launch on animation polish.

---

### Decision 3: ServiceStatusPill stays but location is correct (Profile tab only).

The pill is on the Profile tab — not Explore. Users who open Profile will see "Weather proxy: down" and "iOS push: not configured" until the VPS deploys. This is useful for Jack during debugging and not visible to most casual users (Explore and Alerts are the primary tabs). 

However: "not configured" for APNS is confusing to anyone who has set an alert and wonders why they haven't gotten a push. The label should be "web-only mode" (alerts work, push delivery to iOS native doesn't). Low priority — change if user confusion shows up.

**Decision: KEEP. No changes. Revisit if Profile tab generates support questions.**

---

## This Week's Top 3 Priorities

1. **Restore GEAR_ITEMS** — Amazon Associates dead since June 7. 15-min fix. Do today.
2. **VPS redeploy** — Day 35. 3-min SSH. Bundle CORS localhost fix in same session.
3. **Confirm Reddit launch status** — Did the post go live June 7? Check Plausible for traffic. If not posted, post today.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Hotels in deal score | CUT for v1. Final. |
| Peakly Pro revival | CUT for v1. Post-1K MAU conversation only. |
| Trips / Wishlists tab unhide | Hard lock at 1K MAU gate. |
| 7-day window expansion (30/60/90d) | Product principle: 7-day is the moat. No. |
| Climbing / MTB / hiking re-enable | Never unlocked. Needs explicit product call + algorithm audit. |
| Venue deep links / individual pages | Post-launch SEO sprint, not now. |
| `poolPrimary: true` flag on venues | No live impact. Defer indefinitely. |

---

## Success Criteria

**North star:** 100K downloads.
**90-day projection:** 5K–8K users.

**For 8K, not 5K:**

| Condition | Status |
|-----------|--------|
| GEAR_ITEMS restored | ❌ Regressed June 7 |
| VPS proxy live before DAU > 67 | ❌ Day 35 |
| Reddit post reached top 10 | Unknown |
| Beach scoring correct (`sea_surface_temperature_max`) | ✅ Fixed June 7 |
| APNS gate live on iOS | ✅ Done (Option B) |
| ≥2% day-1 visitors return within 7 days | Not yet measurable |

The beach scoring fix is the most significant unheralded improvement in weeks. Beach venues were scoring as if water temperature didn't exist. That's now correct for the first time since launch. Don't let this get lost in the noise of the GEAR_ITEMS regression.

---

## Live RPM Tracker — June 8

| Stream | Status | RPM/1K MAU |
|--------|--------|------------|
| Booking.com | ✅ LIVE | $6.90 |
| ~~Amazon Associates~~ | ❌ **DEAD — GEAR_ITEMS removed** | ~~$4.48~~ → $0 |
| SafetyWing | ✅ LIVE | $0.54 |
| Travelpayouts | ✅ LIVE (weekend pricing inactive until VPS) | $0.14 |
| REI (Avantlink) | LLC pending | +$6.16 |
| Backcountry + GetYourGuide | LLC pending | +$1.84 |
| **Current live total** | | **$7.58/1K MAU** (was $11.98) |
| **With GEAR_ITEMS restored** | | **$12.06/1K MAU** |
| **With LLC affiliates** | | **$20.12/1K MAU** |

Restoring GEAR_ITEMS is the highest-leverage 15 minutes available today.

---

## One Product Risk Nobody Is Talking About

**The exact-fare-only filter has no loading state. A new user on launch day may see the grid load fully, then collapse.**

The flow: user opens Peakly → 156 venues render with condition scores → flight fetches run in background → 30–60 seconds later, all fetches complete → if only 20 venues returned live fares, grid instantly collapses to 20. No animation. No explanation. First-time Reddit users who were just browsing the full list suddenly see it shrink, with no context.

This is the same UX cliff as a slow paginated list suddenly hiding 80% of results after a network call completes. It reads as broken, not as "showing you only confirmed prices."

The fix is one line: show a "Confirming live prices..." badge in the grid header while `anyFlightLoading === true`. When it disappears, users understand the list refined. Without it, the collapse is confusing.

With the VPS proxy down (Day 35), Travelpayouts calls fail silently and no live fares return. So today, `liveOnly.length === 0` → fallback shows all estimates. The exact-fare cliff only triggers when the proxy IS live and flights load successfully. This means: the cliff appears on the same day the VPS redeploy fixes the 67-DAU ceiling. Both problems surface simultaneously on launch day.

Fix this in the June 10 sprint alongside the other UX items. But name it now so it doesn't get buried.
