# Peakly PM Report v201 — 2026-11-04 (LAUNCH DAY +17)

**Status: 🔴 RED — Five consecutive days zero app code commits. VPS Day 88, 3 days to Nov 7 deadline. App Review Guideline 2.1 reply still pending Jack. 21 unmerged branches. Whistler opens in 17 days.**

> **Stale prompt notice — Day 29 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v200 → v201)

| Commit | What | Right call? |
|--------|------|-------------|
| `41c4d06` | DevOps report Nov 4 — RED, VPS Day 87, 3 days, brace check flagged | ✅ routine |
| `b47ef99` | Content report Nov 4 — 88/100, CLEAN, 225 thin-tag venues, DevOps 406 count is methodology artifact | ✅ routine |

**Five consecutive days with zero app code commits.** Still the correct call — nothing should ship until the two human gates (VPS + App Review) clear. Clock is running.

**Notable: Content confirms 404 venues CLEAN.** DevOps "406" count is a methodology artifact (picking up non-venue `id:` fields). `.venue-baseline = 404` is correct. No action needed.

---

## Overnight Activity: What Changed

No new branches appeared. No app code merged. No VPS redeploy confirmed. Status is static — which is the problem.

**The Nov 7 VPS deadline is now 3 days away.** That is one working day buffer before the weekend. If Jack doesn't execute the scp command by end of day Thursday Nov 6, the deadline is missed. The Whistler opening (Nov 21) is 17 days out. The gap is closing.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 88. Nov 7 = **3 days.** Whistler opens Nov 21 = **17 days.** 🚨

Same as yesterday. Same as the day before. Same as 85 days ago when the proxy.js was first committed.

**What breaks without this by Nov 21:**
- Two-weekend scoring is off (`forecast_days` = 7, not 14) — Whistler, Chamonix, Verbier, all 15 lateSeason venues score wrong in the exact window of their opening weekends
- iOS native app CORS-blocked on every flight price fetch
- Alert deletion silently fails (DELETE preflight blocked)
- Open-Meteo cold-start risk during Reddit spike (Open #23, disk cache)

**The complete task (Jack, 10 minutes):**
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly peakly-deploy
cp peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
# Verify: forecast_days:14, apns:configured
```

Bundle Open #23 (disk cache) in the same session — it's in the same `server/proxy.js` file. The DevOps report has the ~30-line diff.

### P0-B — App Review Guideline 2.1 reply. Still pending.

`docs/APP_REVIEW_NOTES.md` has paste-ready text, recording shot list, screenshot checklist. Build 3 is staged. 30-minute task.

**New time-pressure factor:** App Review cycles average 1-3 days once a reply is submitted. If the reply goes in this week, there is a real chance the app is live before Thanksgiving — the highest-traffic weekend discovery period of the year for ski apps. If the reply waits until next week, Thanksgiving is a loss.

### P0-C — `origin/fix-appjsx-final` still not deleted.

This has been P0/P1 for 4 days. It's 597 commits on a May 13 base. The only action required is 2 clicks on GitHub: Branches → delete. The longer it sits, the higher the probability that an automated session or a distracted checkout wrecks 5 months of work.

**This is the easiest P0 in the history of the product. 2 clicks. No code. No risk.**

### P2 — Cache stamp `20261031a` — Day 5 stale.

No user-visible issue. Auto-push will bump it on the next app.jsx commit. Not actionable until VPS redeploy lands.

### P2 — 21 unmerged branches.

Unchanged. All are automated session branches or stale experiments. None should be merged. GitHub UI → Branches → mass delete after `fix-appjsx-final` is gone.

---

## This Week's Top 3 Priorities Only

**1. Jack: Delete `fix-appjsx-final` on GitHub. (2 min)** This is the cheapest risk reduction available. 2 clicks. Do it now.

**2. Jack: VPS redeploy + disk cache. (30 min, P0-A + Open #23)** Nov 7 is Thursday. Execute today or tomorrow. After Thursday the deadline is missed.

**3. Jack: App Review Guideline 2.1 reply. (30 min, P0-B)** A Thanksgiving-window App Store launch is still possible if this goes in this week.

**Nothing else ships this week.** All agent branches are deferred. No feature work until real users validate.

---

## Explicit Product Decisions This Run

**DECISION 1: Peakly Pro price discrepancy ($9/mo vs $79/yr) — DEFER.** Peakly Pro UI was removed from the app (2026-04-16). There is no active pricing display in the product. The stored cron prompt references a stale state. When Pro is re-evaluated post-launch, the price decision belongs in that conversation. Not a live bug.

**DECISION 2: JSON-LD structured data — DEFER past Reddit launch.** SEO impact is real (confirmed gap) but it's a discoverability investment with a 4-8 week lag time. The Reddit launch is the immediate growth lever. JSON-LD belongs in the first post-launch SEO sprint, not before.

**DECISION 3: 225 thin-tag venues — DEFER past 1K users.** Content has flagged this for 5 days. The venues function correctly. Tags power search and the Powder Day filter. Until we have users generating search data, we don't know which tags matter most. Enrich based on what users actually search for, not what looks right in the data.

---

## Success Criteria Check

**90-day projection: 5K–8K users. What gets us to 8K?**

The same two tasks as yesterday, with updated urgency:

1. **App Store live before Thanksgiving (Nov 27)** — that requires the App Review reply going in by end of this week. App Review turnaround is 1-3 days. If the reply lands Thursday, the app could be live by Saturday or Monday. That's the Thanksgiving window. Miss this week = miss Thanksgiving.

2. **VPS healthy through the Reddit spike** — the r/skiing subreddit typically surges in November as resorts approach opening. The Reddit post should not go until the VPS redeploy is confirmed. The VPS deadline is Nov 7. These two deadlines are aligned.

**Current trajectory: 5K.** Both tasks clearing this week gets us back to an 8K trajectory. Neither task is technical — they're execution.

---

## One Product Risk Nobody Is Talking About

**Whistler opens November 21. It's currently the top-ranked ski venue.**

If a user opens Peakly on November 22 — the first weekend after Whistler opens — and the two-weekend scoring is still broken (because VPS wasn't redeployed), they see wrong scores for the most famous ski resort in North America. That user tells their friends "Peakly got Whistler wrong." That's not a retention problem. That's a reputation problem.

The window to fix this is Nov 7. That's the actual stakes of the VPS deadline — not abstract infrastructure hygiene, but the specific scenario of a user checking the flagship venue on its opening weekend.

---

*Next report: PM v202 — 2026-11-05*
