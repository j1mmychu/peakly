# Peakly PM Report v128 — 2026-08-23

**Status: YELLOW. Launch+1. Two code commits violated the 48h freeze decision from v127. Observation window data unavailable from sandbox. No P0/P1 confirmed.**

---

## Shipped Since Last Report (v127 → v128)

| Commit | What | Right call? |
|--------|------|-------------|
| `fff7d60` | Onboarding: skip location slide, fire geolocation immediately; widget bridge: remove `registerPlugin()` dependency | ⚠️ Shipped on launch night. v127 explicitly said "no code changes unless P0 crash." This was not a P0 crash. Was it worth the risk? |
| `73abdf1` | Widget: gate offer to 3+ sessions AND real data written before showing | ⚠️ Same launch-night violation. Tightening the widget gate is good hygiene but not launch-critical. |
| `a7e55e3` | DevOps report — GREEN, launch+1, BASE_PRICES 82% correction, 3 P3 housekeeping | ✅ Routine. |
| `ad4952f` | Content report — 95/100, BASE_PRICES 82% (corrected from 94%), 303 Wikimedia photos flagged, BOS/LAX/SEA destination gaps | ✅ Caught a real data correction. |

**The freeze violation matters.** Two changes landed on the night of a Reddit launch: onboarding flow changes and widget bridge fixes. Neither was a P0. Both touched the critical path. If they introduced a regression, we'd have no baseline to compare against (no traffic data yet, no Sentry comparison) and we'd have shipped a broken first impression to the initial Reddit cohort. This isn't about the specific changes — they look safe — it's about the pattern. On launch night, the risk/reward of any non-P0 commit is heavily negative.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr)
**CLOSED permanently.** Peakly Pro is cut. `grep -c PEAKLY_PRO app.jsx` → 0. Remove this from the triage checklist; it has appeared in 5+ consecutive reports against dead code.

### Sentry DSN
Live. DSN confirmed at `index.html:77` and `app.jsx:7–8`. `tracesSampleRate: 0.05`. Not flying blind.

### Cache buster
**`20260823b`** in app.jsx / sw.js / index.html — fully in lockstep. `dist/index.html` is `v=20260821b` (2 sub-suffixes behind, cosmetic, CI rebuilds fresh on push). Non-issue.

### BASE_PRICES correction — severity upgrade
**P2 → P1 candidate.** Content report corrected yesterday's 94% figure to **82% (133/162 destination APs covered)**. More importantly: **BOS, LAX, SEA, JFK, MIA, ORD are missing as destination airports** — these are major US hubs that serve as *destinations* for beach and ski venues. A user flying TO LAX-adjacent venues (Santa Monica, Malibu, Mammoth) gets the `~$X` estimate with no deal score, because we have no typical price to compare against. That's 10 venues directly affected. For a deal-scoring product, missing the top US hub airports as destinations is a quality gap, not a cosmetic one.

### Wikimedia Commons attribution — new finding
**P3.** Content confirmed 303 of 391 photos are Wikimedia Commons (not Unsplash as previously believed). Wikimedia CC licenses require attribution. We don't have a credits page. This is not a launch blocker for v1 but is a legal exposure if the app grows. Flagged for v2.

### 15 stale `claude/*` branches
**Housekeeping.** All 15 branches are from May–July 2026 (newest: `product-reliability-assessment-w0poL`, July 23). None are active, none have open PRs. They're clutter that makes `git branch -r` unreadable. Zero product risk but also zero urgency.

---

## Three Product Decisions — Aug 23

### Decision 1: The 48h observation window is now the active constraint. No code until Aug 24 EOD.

**DEFER everything.** The two launch-night commits slipped through. That can't happen again. From now until Aug 24 EOD, the only commits allowed are P0 fixes (blank grid for >1% of sessions per Sentry, or booking links returning 404 across the board). The widget and onboarding changes are done — don't touch them again until we have 48h of real user data. If Sentry shows nothing, that's the green light to resume normal velocity on Aug 25.

### Decision 2: SHIP BASE_PRICES destination backfill for the 6 missing major US hubs this week.

**SHIP — but after the observation window.** BOS, LAX, SEA, JFK, MIA, ORD as destination airports. These 6 airports alone cover at least 10 venues and the deal-scoring feature breaks without them. This is a ~2hr task (look up median fares from the top 14 US origins → each missing hub, add to `BASE_PRICES`). Target: Aug 25 or 26, first PR after the freeze lifts. This is the highest-leverage data fix on the board.

### Decision 3: CUT stale branch cleanup from any roadmap slot; Jack can delete them in 30 seconds.

**CUT as a tracked task.** This is a `git push origin --delete` operation, not a product decision. It belongs on a housekeeping checklist, not the PM roadmap. One command: `git push origin --delete $(git branch -r | grep 'origin/claude/' | sed 's|origin/||')`. Jack does this, it takes 30 seconds, it's done.

---

## This Week's Top 3 Priorities Only

**1. Jack: Check Sentry + Plausible today (Aug 23).**
The only thing that matters right now is whether the launch post generated traffic and whether Sentry caught any crashes. Open both dashboards. If Sentry is clean and Plausible shows >100 sessions, the product is working. If Sentry shows ErrorBoundary events or blank-grid patterns, that's a P0 and the v128 freeze lifts immediately. No AI agent can do this check — it requires auth access Jack holds.

**2. BASE_PRICES destination backfill — Aug 25 after freeze lifts.**
Fill BOS, LAX, SEA, JFK, MIA, ORD as destination keys in `BASE_PRICES`. Pull 14 values each (one per origin airport already in the matrix). Source: Google Flights median weekend fares, same methodology as the existing entries. This directly improves deal scoring for the venues most likely to appear on a US user's Explore grid.

**3. Wikimedia attribution — decide the policy before it becomes an issue.**
303 photos carry CC license requirements. The decision is binary: (a) add a `/credits` page listing all 303 Wikimedia URLs and their licenses (4hr task, no user-facing value), or (b) replace Wikimedia photos with Unsplash (public domain, no attribution required) as venues get updated. Option (b) is the right call — do it organically as photos get refreshed, not as a one-shot sprint. Make the decision now so agents stop re-flagging it.

---

## Features REJECTED This Week

- **JSON-LD structured data** — CUT in v127, stays CUT. Reddit traffic doesn't care about structured data.
- **Static h1 fallback for SEO** — CUT in v127, stays CUT. Same reasoning.
- **Unit test harness (vitest)** — there's a stale `claude/analyze-test-coverage-WVIsT` branch with a vitest setup. DEFER indefinitely. Single-file Babel-transpiled SPA with no CI test runner configured. Wrong complexity for this stage.
- **Front page redesign (stale branch)** — `claude/redesign-front-page-EndKs` is from May 2026 and 607 commits behind main. DEAD. Never merge; delete the branch.
- **Alerts page redesign (stale branch)** — same. DEAD.

---

## One Product Risk Nobody Is Talking About

**The onboarding change shipped on launch night skips the location slide entirely.** The commit assumes geolocation fires immediately and sets the airport silently. On iOS Safari, `getCurrentPosition` is blocked by default until the user grants permission in a permission prompt — which may not appear at all if the user has globally denied location for the browser. The old 2-slide flow gave users a visible fallback (the airport picker was always on screen). The new single-screen flow fires geolocation silently and only shows the manual picker if `geoState === "done" && !airport`. If geolocation hangs or is silently blocked (not "denied", just indefinitely pending), `geoState` stays `"idle"`, the condition `geoState === "done" && !airport` is never true, and **the user gets no airport set and no visible way to set one.** First-time launch. Explore grid shows global results. No personalization. First impression permanently damaged.

This was already partially addressed — the timeout was extended from 2s/4s to 10s in an earlier session. But "silently blocked" is not "timed out." If location is blocked without a denial event, the timeout never fires either. A user on iOS Safari with location globally blocked could sit on a blank-looking personalization state forever. Check the geolocation fallback path in `fff7d60` carefully before the observation window closes.

---

## Success Criteria

**What defines success at 90 days:**

| Metric | 5K users | 8K users |
|--------|----------|----------|
| Reddit/HN post quality | One r/skiing post gets traction | r/skiing + r/solotravel + HN, at least 2 of 3 land |
| Bounce rate | <70% | <55% |
| Booking link clicks | >5% of sessions | >8% |
| Alerts created | >200 | >500 |
| Return visits | >25% weekly return | >35% weekly return |

**What has to be true for 8K, not 5K:**
The deal-scoring feature has to be visibly credible on first use. A user landing from Reddit who sees `~$XXX` on most cards (because BASE_PRICES gaps = no deal score) has no reason to believe we have better flight data than Google Flights. BASE_PRICES backfill and the live proxy working on their specific route is what makes the product credible. That's the single biggest delta between the 5K and 8K outcomes.

---

*Report written: 2026-08-23 by automated PM agent. Source: `git log`, `app.jsx`, `reports/devops-report.md`, `reports/content-report.md`.*
