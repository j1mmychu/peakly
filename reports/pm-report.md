# Peakly PM Report — 2026-05-14 (v33)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status:** YELLOW. APNS gate shipped yesterday — biggest P0 off the list. Massive UX redesign also landed (10+ commits, 05-13). Two open items remain before Reddit: VPS restart (2 min) and a live smoke test. Feature freeze violated by 05-13 UX blitz — was probably worth it — but re-instated today, harder.

---

## Shipped Since Last Report (2026-05-13 → 2026-05-14)

| What | Right call? |
|------|-------------|
| **APNS Capacitor gate** (`showAlertsTab = !isNativePlatform() \|\| apnsConfigured`, app.jsx:8158) | ✅ Right. Closes the App Store launch blocker. Web Alerts unchanged. Polling worker preserved for v1.1. |
| **Scoring honesty pass** (commit 18606a7): variance penalty on split-weekend scores (cap −15), softer caps, tighter weights | ⚠️ CONTESTED — shipped without the algorithm critique required by CLAUDE.md. See Decision #1. |
| **Front page redesign** (#17): stacked header, merged toolbar, slim hero | ✅ Right. First impression matters. Reduces visual clutter before the user sees any venue. |
| **Splash screen** (#16): concrete weekend teasers, rotating value prop | ✅ Right. "Ski or beach this weekend?" is a stronger hook than generic welcome copy. |
| **Alerts page simplification** (#15): templates above fold, slim rows, killed Vibe Search | ✅ Right. Vibe Search was scope creep. Templates-first is the correct hierarchy. |
| **Alerts Create form** (#13): single-screen condensed | ✅ Right. Multi-screen form was unnecessary friction. |
| **Profile** (#12): one screen, killed noise | ✅ Right. Profile was bloated. Lean is correct pre-launch. |
| **VenueDetailSheet**: one-screen consolidation | ✅ Right. |
| **Compact ListingCard**: 4+ venues visible on mobile | ✅ Right. Core metric: user sees enough options to feel real choice. |
| **Onboarding**: 3 cleaner cards for App Store polish | ✅ Right. |
| **Content report 2026-05-14** (commit c8a70e4) | ✅ Right to file. 3 new data issues surfaced. |

**Build stamp:** `20260513j` — aligned across app.jsx / sw.js / index.html. ✅

**Net assessment:** 05-13 was the most productive day since the 05-03 pivot. The APNS gate is the most important single commit in 2 weeks. The UX blitz was large and fast but directionally correct. The scoring change is the one flag.

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN empty | ✅ CLOSED — DSN live at app.jsx:7 |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI fully removed, CUT for v1, not in codebase |
| Cache buster stale | ✅ CLOSED — `20260513j` aligned |
| SEO meta/OG/JSON-LD "surf"/"adventure" strings | ✅ CLOSED — cleaned 05-13 |
| Amazon gear gate `false &&` | ✅ CLOSED — gate flipped 05-04. But GEAR_ITEMS still P1 — see below. |
| APNS App Store blocker | ✅ CLOSED — Capacitor gate live at app.jsx:8158 |

---

## Active Bug Triage — May 14

| Bug | Severity | Status | Jack action? |
|-----|----------|--------|-------------|
| **VPS proxy redeploy — STILL UNVERIFIED** | **P0** | ❌ Day 10 | ✅ YES — `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. 2 min. Weekend-specific flight pricing, weather cache, alerts polling all dead in production. Cannot Reddit-launch without it. |
| **pigeon-point-t27 near-dup** | **P1** | ❌ Day 2 | Approved for delete in 05-13 PM Decision #3 — not executed. 190m from beach_tobago, same beach, 666 vs 5400 reviews. One-line VENUES delete + cache bump. |
| **sarakiniko-beach-t16 near-dup + wrong airport** | **P1** | ❌ NEW (Content 05-14) | Same beach as beach_milos. Uses `ap:"JMK"` (Mykonos — wrong island). beach_milos has correct `ap:"MLO"` + 8900 reviews. One-line delete. |
| **GEAR_ITEMS missing from app.jsx** | **P1** | ❌ Day 2 | Amazon Associates shows LIVE in CLAUDE.md at $4.48/1K MAU. `grep GEAR_ITEMS app.jsx` returns nothing. Revenue model is lying. See Decision #3. |
| **Scoring honesty pass — no algorithm critique** | **P2** | ⚠️ WATCH | CLAUDE.md: "Do NOT modify scoring without an algorithm critique." 18606a7 shipped without one. Changes are defensible; process was not followed. See Decision #1. |
| **outer-banks-nags-head-t7 wrong airport** | **P2** | ❌ NEW (Content 05-14) | `ap:"OAJ"` (Jacksonville, NC — 70mi away). Correct is `ORF` (Norfolk) or `RDU` (Raleigh). Breaks flight pricing for this venue. |
| **BookingConfirmSheet on flight CTAs** | **P2** | ❌ Day 3 | 05-12 PM: roll back on flights, keep on hotels. Still in place at app.jsx:7332. Adds friction on highest-intent CTA. |
| **Leaflet loads unconditionally** | **P2** | ❌ Day 3 | MapView exists but Leaflet loads on every Explore render even when hidden. Gate behind `MAPVIEW_ENABLED = false` as called on 05-12. |

**Net active P0/P1:** 4 (VPS + pigeon-point + sarakiniko + GEAR_ITEMS). Combined Jack-keyboard: ~15 min.

---

## Explicit Product Decisions — May 14

**Decision #1 — Scoring honesty pass: ACCEPT the changes, retroactive critique required.**

Variance penalty (split-weekend demotion) and softer caps are directionally correct — the commit message articulates 4 specific corrections. Not rolling back.

But: the process was violated. The CLAUDE.md rule ("do not modify scoring without an algorithm critique") exists to catch compounding errors in a multi-variable function. Every future scoring change requires an algorithm critique written in `~/.claude/plans/` before the commit lands. No exceptions. This is a rule reminder, not a revert.

**Decision #2 — Data cleanup: ALL THREE data errors delete in one batch commit this week.**

PM approved pigeon-point delete on 05-13 — it didn't ship. Adding sarakiniko-beach-t16 and outer-banks IATA fix. All three are 1-line deletes or field edits (Rule-1 eligible). One commit, one cache bump. No further product discussion needed — these are data errors.

**Decision #3 — GEAR_ITEMS: Restore the code OR correct CLAUDE.md by 2026-05-16.**

CLAUDE.md says Amazon Associates is live at $4.48/1K MAU. The code says GEAR_ITEMS doesn't exist. One of these is wrong. Check `git show a9aacf5 -- app.jsx` to see what the gear gate flip actually changed. If GEAR_ITEMS was deleted in a later refactor, restore it. If it was never properly added, update CLAUDE.md Revenue Model to $0 Amazon and note the shortfall. A shared brain that lies about revenue is worse than no shared brain. Binary choice, 15 min, decides by 05-16.

---

## This Week's Top 3 Priorities Only

**1. VPS redeploy — 2 min SSH.** No more deferral. The product cannot claim "cheap flights + live conditions" until the proxy is running the deployed code. Every day the VPS stays dark the deal scores are miscalibrated in production on the most important signal.

**2. 3 data-quality deletes + outer-banks IATA fix — one batch commit.** ~15 min. Cleans content health score from 80→87. Approved; just needs execution.

**3. Live 5-min smoke test on mobile before the Reddit post.** Check: Explore loads for JFK/LAX, ScoreBreakdown opens, flight price shows, filter empty state CTA appears, Booking.com link resolves. Only real QA gate before launch.

Feature freeze re-instated: no new app.jsx features until items 1–3 close.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze. 8,837 lines, zero user validation. Nothing new until VPS is live and Reddit post is out. |
| SH skiing carousel ("Right now in the Southern Alps") | **DEFER 4–6 weeks** | Good idea (Content 05-14). Correct timing is when S. hemisphere season opens + after Reddit feedback exists. |
| Venue catalog expansion | **DEFER post-Reddit** | 147 venues (post 3 deletes) is clean. More pre-Reddit = more potential data bugs. |
| Map clustering, satellite view, filter-on-map | **DEFER post-launch** | Zero usage data. MapView has never been tested by a real user. |
| Onboarding scoring explainer | **DEFER** | ScoreBreakdown covers tap-in trust. Pre-tap version needs Reddit data. |
| poolPrimary flag on beach venues | **DEFER** | Water-temp hard cap applies. Nice-to-have, not a launch blocker. |
| Wishlists / Trips tab reveal | **DEFER** | 1K MAU gate. Hard lock. |
| Hotels in deal score | **CUT to v2** | |
| Peakly Pro resurrection | **CUT** | Post-1K MAU, if revenue data supports it. |

---

## Success Criteria — May 14

Pre-launch readiness:

1. ✅ **SEO meta clean** — zero "surf"/"adventure" strings. Done 05-13.
2. ✅ **APNS gate shipped** — `showAlertsTab` logic live at app.jsx:8158. Done 05-13.
3. ❌ **VPS redeploy verified** — Day 10. `ssh root@198.199.80.21 'cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy'`.
4. ❌ **Live smoke test** — 5 min human click-through before Reddit post.

If 3 + 4 close this week: launch-ready. No other open items on the critical path.

**90-day projection:**
- **5K floor**: holds if Reddit by May 20.
- **8K path**: requires Reddit by May 17 (3 days). Ski-tail × Memorial Day beach overlap window closes mid-June. Every day past May 17 trims ~150 users from the ceiling. The 05-13 UX redesign raised first-impression quality — 8K is still realistic if the post goes out this week.
- **12K upside**: compact ListingCard, Quick Templates, ScoreBreakdown are differentiators. The ceiling is real but conditioned on strong Reddit engagement + App Store approval within 2 weeks.

---

## One Product Risk Nobody Is Talking About

**The scoring engine was changed 3 times in 10 days with no user feedback loop, and the product is about to Reddit-launch.**

Scoring honesty pass (05-13), scoreWeekend rewrite (05-03), 50/50 deal weight rebalance (05-04). Each change was individually defensible. Collectively, the scoring system is now materially different from the last algorithm audit. Scores may be better — or they may be sending users to venues with mediocre conditions while filtering good ones, because variance penalty + cap adjustments + weight shifts compound in non-obvious ways.

The risk isn't that any one change is wrong. The risk is that three compounding changes to a multi-variable scoring function, applied without a single real user session to validate outputs, could result in a Reddit launch where the first commenter posts "why is [world-class ski resort] scored lower than [mediocre beach]?"

The mitigation costs 5 minutes: before the Reddit post, open the live site from JFK, set category to Skiing, verify the top 3 results make sense to a skier. Repeat for Beach. If Vail scores 40 and a random Gulf Coast beach scores 85 in mid-May, something is broken — and you want to know before 10,000 people do.
