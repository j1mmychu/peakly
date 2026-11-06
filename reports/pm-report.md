# Peakly PM Report v203 — 2026-11-06 (LAUNCH DAY +19)

**Status: 🔴 RED — VPS deadline is TODAY (Nov 7 = tomorrow UTC, Nov 6 = today PST). App Review reply still pending. No app code in 20 days. Whistler opens in 15 days. The deadline arrived.**

> **Stale prompt notice — Day 31 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v202 → v203)

| Commit | What | Right call? |
|--------|------|-------------|
| `4808567` | DevOps report Nov 6 — VPS Day 90, Nov 7 deadline TOMORROW, `fix-appjsx-final` rollback bomb Day 6 | ✅ routine |
| `3c27897` | Content report Nov 6 — CLEAN (404 venues), 225 thin-tag venues Day 7, Whistler 15 days out | ✅ routine |

**Twenty consecutive days with zero app code commits.** This is correct. The human-gated blockers have not moved. Reports only.

---

## Overnight Activity: What Changed

Nothing of substance changed. The DevOps and Content agents filed clean routine reports. No app.jsx changes. No VPS update. No App Review reply. The 15+ automated `claude/*` branches on origin remain unmerged (correct).

**Nov 7 is tomorrow.** This is the third VPS deadline. The first was August 11 (missed). The second was two weeks ago (missed). This is the last one the PM is setting. After today, the VPS situation becomes a permanent product defect in the KNOWN-BROKEN state, not an "open item with a deadline."

---

## Bug Triage

### P0-A — VPS Redeploy: **DEADLINE IS TODAY/TOMORROW.** Day 90. 🚨

This is the third and final deadline. What breaks without this:
- Two-weekend scoring broken on 15 lateSeason venues during Whistler's opening (Nov 21)
- iOS native CORS-blocked on every flight price fetch
- Alert deletion silently fails forever
- Open-Meteo rate limit risk during Reddit spike (disk cache not live)

**Complete task (Jack, 10 min):**
```bash
ssh root@198.199.80.21
# From local machine first:
scp /path/to/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
# On VPS:
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Confirm: forecast_days:14, CORS includes capacitor://localhost
```
Bundle Open #23 (disk cache) — it's already in `server/proxy.js`, same file, same deploy.

**If this is not done by end of Friday Nov 7:** The PM is formally moving VPS redeploy to KNOWN-BROKEN status. It will stop receiving P0 treatment in reports. The product ships with the defect. Users on iOS native get CORS-blocked flight prices. That is the consequence of 90 days of deferral.

### P0-B — App Review Guideline 2.1 reply still pending.

`docs/APP_REVIEW_NOTES.md` has paste-ready text. Thanksgiving window math: submit today → review 1-3 days → app live Nov 7-10 → 18 days before Thanksgiving peak. Each day this slips is a day less of Thanksgiving-window coverage. This window does not come back.

### P0-C — `fix-appjsx-final` rollback bomb. Delete it. This is Day 6.

DevOps confirmed: 9,095 lines vs main's 14,256. Merging this deletes 6 months of work.
**Action: GitHub → Branches → delete `fix-appjsx-final`.** Two clicks. Zero risk. This has been the top ask for 6 days.

### P2 — Cache stamp `20261031a` — Day 7 stale.

Auto-bumps on the next app.jsx commit. The VPS redeploy should include a cache stamp bump. DevOps report has the exact `perl -pi` commands. Bundle this with P0-A.

### P2 — 21 unmerged branches on origin.

No change. Mass-delete after `fix-appjsx-final` is gone. All `claude/*` branches are pre-Reddit experiments — none ship before the launch gates clear.

---

## This Week's Top 3 Priorities Only

**1. Jack: Delete `fix-appjsx-final` on GitHub. (2 min)** This is Day 6. This one task eliminates the highest single-action risk in the repo. It is inexplicable that it hasn't happened yet.

**2. Jack: VPS redeploy + disk cache + cache stamp bump. (20 min, P0-A + Open #23 + P2).** The deadline is today. This is the last report that calls it a deadline.

**3. Jack: App Review Guideline 2.1 reply. (30 min, P0-B).** Thanksgiving window is narrowing by 24 hours per day. This week is the last week it matters.

**Nothing else ships this week. Nothing else is even discussed this week.**

---

## Explicit Product Decisions This Run

**DECISION 1: After Nov 7, VPS redeploy exits P0 and enters KNOWN-BROKEN.** It stops receiving deadline treatment. Reports will note the defect but won't set new deadlines. The product ships with CORS-blocked iOS flight prices and broken alert deletion. This is the consequence of three missed deadlines.

**DECISION 2: 225 thin-tag venues — DEFER past Reddit launch.** Content has flagged this for 7 days. Tag enrichment is correct work, but it's invisible to users. It doesn't affect the launch decision. Post-Reddit, with real user data on which venues are being viewed, tag enrichment gets prioritized by traffic. Not before.

**DECISION 3: All `claude/*` branch work — FROZEN until VPS + App Review clear.** The automated sessions have produced redesign-front-page, improve-scoring-system, improve-peakly-ui, simplify-alerts-page, streamline-onboarding. All are pre-Reddit speculation. None ship. The product is validated by Reddit users, not by automated session taste. After Reddit, pick the top-trafficked venue flows to improve and work from real data.

---

## Success Criteria Check

**90-day projection: 5K–8K users. What gets us to 8K vs 5K?**

The 8K path requires this exact sequence, all executable this week:
1. ✅ VPS redeploy by Nov 7 (two-weekend scoring correct before Whistler opens)
2. ✅ App Review reply submitted by Nov 7 (app live by Nov 8-10)
3. ✅ Reddit post Nov 21-23 during Whistler opening weekend (highest ski discovery moment of the year)

**Current trajectory without action: 5K.** The gap is 48 hours of Jack's time that hasn't been spent.

The window is not permanently closed. But Thanksgiving is 20 days away. The Reddit post drives installs. The App Store app captures them on mobile. The VPS makes the scores correct. All three need to work for the Thanksgiving window to convert.

---

## One Product Risk Nobody Is Talking About

**Whistler opens in 15 days. The scoring will be wrong when it does.**

Whistler is the top-ranked ski venue in the app. It has `lateSeason: true`. When it opens Nov 21, the two-weekend scoring window tries to fetch 14 days of forecast data from the proxy. The VPS is serving 7-day data. The second weekend (the ACTUAL opening weekend for most users who'd be booking 1-2 weeks ahead) will silently return no data and score as "unavailable."

The Reddit post is planned for the Whistler opening window. That means the most visible venue in the app will score incorrectly on the day users arrive from Reddit.

The VPS redeploy fixes this. That's what makes it a launch gate, not just infrastructure hygiene. The connection between "10-minute SSH session" and "top venue scores correctly on launch day" is not abstract. It is the specific thing that determines whether the Nov 21 Reddit moment converts or not.

---

*Next report: 2026-11-07. VPS deadline expires. This report will note the outcome — fixed or formally moved to KNOWN-BROKEN.*
