# Peakly PM Report v202 — 2026-11-05 (LAUNCH DAY +18)

**Status: 🔴 RED — VPS deadline in 2 days (Nov 7). App Review reply still pending. No app code in 19 days. Whistler opens in 16 days. Time is up.**

> **Stale prompt notice — Day 30 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v201 → v202)

| Commit | What | Right call? |
|--------|------|-------------|
| `669cadd` | DevOps report Nov 5 — `fix-appjsx-final` identified as 6-month rollback bomb | ✅ routine |
| `9717f5a` | Content report Nov 5 — CLEAN (404 venues), 225 thin-tag venues Day 6, Whistler 16 days out | ✅ routine |

**Nineteen consecutive days with zero app code commits.** Still the correct call. The two human-gated blockers (VPS redeploy + App Review reply) have not moved. The agents have held the line. The clock has not.

---

## Overnight Activity: What Changed

Nothing changed. That is the problem.

**Nov 7 is the day after tomorrow.** The VPS has been waiting for a 10-minute SSH session for 89 days. The App Review reply has been drafted and waiting for Jack's paste for weeks. Neither task requires code, design, or technical knowledge. Both are pure execution.

**New branches from origin fetch:** 15+ new `claude/*` branches appeared on origin during the fetch. These are automated session branches (code review, UI improvements, scoring changes, onboarding work). **None should be merged.** All are pre-Reddit gate experiments. They compound the branch sprawl problem.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 89. Nov 7 = **2 days.** Whistler opens Nov 21 = **16 days.** 🚨

**This is the last report before the Nov 7 deadline. If it's not done by Nov 7, the deadline is missed for the third time.**

What breaks without this by Whistler's opening day (Nov 21):
- Two-weekend scoring broken for all 15 lateSeason venues on their opening weekends
- iOS native app CORS-blocked on every flight price fetch
- Alert deletion silently fails
- Open-Meteo rate limit risk during Reddit spike (disk cache not live)

**Complete task (Jack, 10 min):**
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly peakly-deploy
cp peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
# Confirm: forecast_days:14, CORS includes capacitor://localhost
```
Bundle Open #23 (disk cache) — same file, same session. DevOps report has the diff.

### P0-B — App Review Guideline 2.1 reply still pending.

`docs/APP_REVIEW_NOTES.md` has paste-ready text. Build 3 is staged. 30-minute task.

**Thanksgiving window math:** App Review turnaround is 1-3 days. Reply submitted this week → app live by weekend of Nov 8-9. That's 18 days before Thanksgiving — the highest-traffic weekend discovery period for ski apps all year. Each day this slips is a day less of Thanksgiving-window exposure.

**If the reply doesn't go in this week, Thanksgiving is a loss.**

### P0-C — `fix-appjsx-final` rollback bomb. Delete it.

DevOps confirmed: this branch is 9,095 lines vs main's 14,256. Merging it deletes 6 months of work. **It is not a fix. It is a trap.**

Action required: GitHub → Branches → delete `fix-appjsx-final`. 2 clicks, zero risk, closes a P0 that has been sitting for 5 days.

If the original May 2026 IATA fixes in that branch are still needed, cherry-pick them onto main after verifying they're not already there. Do not merge the branch.

### P2 — Cache stamp `20261031a` — Day 6 stale.

Auto-bumps on the next app.jsx commit. The VPS redeploy commit will trigger this. Not independently actionable.

### P2 — 21+ unmerged branches on origin.

New branches appeared overnight from automated sessions. Mass-delete after `fix-appjsx-final` is gone. Use GitHub UI → Branches → filter merged/stale → delete all `claude/*` branches that aren't actively needed.

---

## This Week's Top 3 Priorities Only

**1. Jack: Delete `fix-appjsx-final` on GitHub. (2 min)** Still the fastest risk reduction available. This is the fifth time this has been the top ask.

**2. Jack: VPS redeploy + disk cache. (10–30 min, P0-A + Open #23).** Nov 7 is Thursday. It is the day after tomorrow. This is the last report before the deadline.

**3. Jack: App Review Guideline 2.1 reply. (30 min, P0-B).** Thanksgiving window is real. Submit this week.

**Nothing else ships this week.**

---

## Explicit Product Decisions This Run

**DECISION 1: Peakly Pro price discrepancy ($9/mo vs $79/yr) — DEFER indefinitely.** Pro UI was removed from the app. There is no price shown to users. This is a stale prompt artifact, not a live product bug. When Pro is re-evaluated post-launch, the pricing conversation happens then.

**DECISION 2: New `claude/*` branches from overnight sessions — CUT/IGNORE all.** Code review, UI improvements, scoring changes, onboarding work — none of these ship before the Reddit gate. The product is in a hold state pending real user validation. Automated sessions exploring improvements are fine; none of their outputs ship until the launch gates clear.

**DECISION 3: Whistler opening day (Nov 21) is the new soft launch deadline.** The VPS redeploy is not abstract infrastructure — it's the specific thing that determines whether the top-ranked ski venue scores correctly on its opening weekend. Nov 7 → VPS fixed → Reddit post possible → Whistler launch window. This sequence only works if Jack executes in the next 48 hours.

---

## Success Criteria Check

**90-day projection: 5K–8K users. What gets us to 8K?**

The 8K path requires three things to happen in sequence:
1. **VPS redeploy by Nov 7** — two-weekend scoring correct before Whistler opens
2. **App Review reply submitted this week** — app live by Nov 8-10
3. **Reddit post in the Nov 21-23 Whistler-opening window** — highest-intent ski discovery moment of the year

All three are executable. None require code. All require Jack to take action in the next 48-72 hours.

**Current trajectory: 5K.** The gap between 5K and 8K is 48 hours of Jack's time.

---

## One Product Risk Nobody Is Talking About

**The new `claude/*` branches are building a parallel product.**

Overnight, 15+ automated session branches appeared on origin: redesign-front-page, improve-scoring-system, improve-peakly-ui, simplify-alerts-page, streamline-onboarding. Each one is a well-intentioned improvement that modifies app.jsx.

None of these are wrong in isolation. But if Jack opens one of them in Xcode or loads it locally by accident — or if an automated session merges one — the production app changes without the launch-critical VPS and App Review gates being cleared first.

The branch sprawl is not just a cosmetic problem. It's a merge-accident waiting to happen. Mass-delete everything except `main` and `master` after the two P0s clear.

---

*Next report: 2026-11-06. VPS deadline is Nov 7. If it isn't done by that report, it is the third missed deadline.*
