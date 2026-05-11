# Peakly PM Report — 2026-05-11 (v31)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status:** YELLOW → ORANGE. APNS deadline 48 hours away. MapView shipped without user validation. Two factual claims in the prompt are wrong (Sentry is live; Pro price is gone). See details below.

---

## Shipped Since Last Report (2026-05-09 → 2026-05-11)

| What | Right call? |
|------|-------------|
| **MapView** (Leaflet, List/Map toggle in Explore) | **WRONG CALL** — pre-launch, no user demand, 40KB cold-load cost |
| **BookingConfirmSheet** (confirm before booking handoff) | **ACCEPTABLE** — reduces accidental taps, adds affiliate intent signal |
| **Build stamp `20260510l`** consistent across app/sw/index | ✅ |
| **JSON-LD description** — "surf" removed, replaced with current product copy | ✅ **FIXED THIS RUN** |
| **Zero commits since 05-09 23:23** | — |

---

## Factual Corrections

| Claim | Reality |
|-------|----------|
| "Sentry DSN empty" | **FALSE** — DSN configured at app.jsx:8, Sentry is live |
| "Pro price showing $9/mo" | **FALSE** — Pro UI fully removed 2026-04-16, formally CUT, nothing renders |
| "Cache buster stale" | **FALSE** — `20260510l` consistent across all three files |

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| APNS not configured | **P0** | ❌ Day 5 — deadline 05-13 EOD |
| VPS proxy redeploy unverified | **P0** | ❌ Day 5 |
| Live-site smoke test not run | **P1** | ❌ Day 3 |
| Auto-push gap for scheduled-task agents | **P1** | ❌ Day 3 |
| JSON-LD mentions "surf" (retired 05-03) | **P2** | ✅ FIXED — index.html:44 updated this run |
| Leaflet CDN loads unconditionally (40KB cold-start tax) | **P2** | ❌ NEW |

---

## Top 3 Priorities Only

1. **APNS by 05-13 EOD — or cut from iOS v1 with `Capacitor.isNativePlatform()` gate.** Binary. No more runway.
2. **`bash scripts/deploy-chain.sh`** — closes VPS verification + proxy smoke-test in one session. Script is already written.
3. **Lazy-load Leaflet behind the Map toggle** — removes 40KB from every cold start with <30 min of work.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| New map features (clustering, filters) | DEFER post-launch | No usage data yet — haven't earned retention features |
| Onboarding scoring explainer | DEFER | Wait for Reddit feedback first |
| Venue deep links | DEFER | Decided — build after Reddit launch |
| Hotels in deal score | CUT to v2 | Confirmed 05-07 strategic principle |
| Pro UI revival | CUT | Formally dead for v1, CLAUDE.md doc lag — needs update |
| REI/Backcountry/GYG affiliate links | BLOCKED | LLC approval gate, not a code decision |

---

## One Product Risk Nobody Is Talking About

**We're adding features to a product nobody has used yet.**

MapView was built with zero user demand, pre-launch, at the exact moment the APNS deadline is bearing down. The 100K goal is won on distribution — Reddit, App Store discovery, word of mouth. None of those channels care about a map view. They care about the 10-second first impression: does my home airport show venues, are the scores believable, does the flight price look real. Pre-launch energy should go entirely on acquisition hooks: correct brand copy in JSON-LD structured data, App Store listing quality, score clarity on first load. That's where the 100K is won — not in a map toggle.

---

## 90-Day Projection

- 8K path requires Reddit launch by 05-18 (ski tail + Memorial Day beach wave)
- Every week that slips: ~200 users lost from the projection
- APNS limbo is the only active App Store blocker; closing by 05-13 keeps 8K alive
- Slipping to 05-20 makes 5K the realistic ceiling
