# Peakly PM Report v213 — 2026-11-16 (LAUNCH DAY +29)

**Status: 🔴 RED — App Review MISSED +3 days (reply NOW). VPS Day 100 (Whistler opens in 5 days). 30 days no code commits.**

> **Stale prompt notice — Day 41 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v212 → v213)

| Commit | What | Right call? |
|--------|------|-------------|
| `51c86bf` | Content report Nov 16 — 89/100, .venue-baseline drift FALSE ALARM confirmed (2 comment lats, not venues), Whistler in 6d | ✅ routine + drift resolved |
| `fd3e054` | DevOps report Nov 16 — Red, VPS Day 100, cache 16d stale, .venue-baseline drift raised | ✅ routine |

**30 consecutive days with zero app code commits.** Still correct. No code churn until App Review resolves.

**Venue-baseline drift false alarm closed:** DevOps flagged eval count 406 vs baseline 404. Content confirmed the 2 extra matches are coordinate comments in app.jsx code (`// CPT:{lat:...}` and `// GIG:{lat:...}`), not venue objects. Actual venue count = **404**, matching the baseline exactly. No baseline update needed.

---

## Overnight Activity

No app code changes. Two reports, one finding closed:

- **DevOps (Red):** VPS hits **Day 100** — same proxy.js sitting undeployed since Aug 11. App Review now MISSED +2d. Cache stamp 16d stale. Baseline drift raised as new finding.
- **Content (89/100):** Drift false alarm resolved — `.venue-baseline` is correct at 404. All 15 lateSeason venues confirmed. 225 thin-tag venues remain the only standing deduction (Day 17, deferred).

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +3 days. Whistler opens in 5 days (Nov 21).

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Paste-ready reply:** `docs/APP_REVIEW_NOTES.md`

The window math is now critical:

- Reply today (Nov 16) → review 1–3 days → app live Nov 17–19 → **2–4 days before Thanksgiving** ← still viable
- Reply Nov 17 → app live Nov 18–20 → **1–3 days before Thanksgiving** ← razor thin
- Reply Nov 18+ → Thanksgiving and Whistler opener both lost for new installs

**This is a 10-minute action. The reply is already written. 5 days to Whistler.**

### 🚨 P0-B — VPS Redeploy: Day 100. Whistler opens Nov 21 (5 days).

100 days with the same committed `server/proxy.js` changes sitting undeployed. Hard deadline Nov 20. Active live breakage:
1. `forecast_days=7` → two-weekend scoring disabled when proxy is healthy
2. `capacitor://localhost` missing from CORS → iOS shows zero live weather/flight data
3. `DELETE` missing from allowed methods → alert deletion silently fails
4. `_wxCache` in-memory → `pm2 restart` wipes cache → cold traffic spike risks Open-Meteo rate ceiling

**Fix — 10 minutes SSH (Jack only):**
```bash
ssh root@198.199.80.21
curl -sSL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js -o /opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Verify `forecast_days:14`. No `npm install` needed.

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 17.

Delete in GitHub UI → Branches. Two clicks each. Still not done.

### P2 — Cache stamp `20261031a`: Day 16 stale.

DEFER. Auto-bumps on next app.jsx commit.

### P2 — 19 stale non-main/master branches.

DEFER to post-Reddit (except P0-C rollback bombs above).

---

## This Week's Top 3 Priorities

**#1 — Submit App Review reply. OVERDUE by 3 days.**
`docs/APP_REVIEW_NOTES.md` → App Store Connect → paste + screen recording → Submit Reply. 10 minutes. The Thanksgiving and Whistler windows are both closing fast.

**#2 — VPS Redeploy. Due: Nov 20 (4 days, hard).**
10-minute SSH. Must land before Whistler opens or two-weekend scoring is broken during peak ski traffic week.

**#3 — Delete `fix-appjsx-final` and `restore-appjsx` branches (P0-C).**
Two clicks in GitHub UI. Rollback bombs with zero upside. This keeps getting deferred.

---

## Explicit Product Decisions

**Decision 1: App Review reply — SHIP NOW. Every day of delay costs days from the Thanksgiving window.**
Thanksgiving is the highest-intent ski discovery event we'll see until Christmas. We are losing real users every hour this waits.

**Decision 2: VPS redeploy — SHIP before Nov 20 (non-negotiable).**
Two-weekend scoring is the product's core moat. It is **broken in production** until this lands. Any user who opens the app during Whistler's opening weekend will see single-weekend scoring, not the best-2-of-4 Fri–Mon window we built. That's a failure of the product's core promise.

**Decision 3: 225 thin-tag venues — DEFER past Reddit launch (Day 17, unchanged).**
Tags affect search corpus, not scoring. Zero impact on the Thanksgiving/Whistler traffic window.

---

## Success Criteria

**90-day projection: 5K–8K users. What gets us to 8K, not 5K:**

| Lever | Impact | Status |
|-------|--------|--------|
| App Store live by Thanksgiving | +1,500 potential installs from holiday discovery | ❌ blocked on App Review reply |
| VPS deployed → two-weekend scoring live | Differentiating feature working as designed | ❌ Day 100 |
| Reddit launch with working scoring | First impression = core product promise met | ❌ blocked on both above |
| Whistler opener + Thanksgiving search peak | Highest organic discovery window of the year | ❌ window closing |

**The 8K scenario requires the App Store to be live before Thanksgiving and both P0s resolved.** We're currently on track for the 5K floor unless both blockers clear in the next 4 days.

---

## Features REJECTED This Week

- **Venue deep links** — DEFER post-Reddit. Right call, unchanged. Building during launch prep is scope creep.
- **JSON-LD structured data** — DEFER. SEO gap, yes, but won't move the needle in the 5-day window that matters.
- **Static h1 fallback** — DEFER. Same reasoning.
- **225 thin-tag venue enrichment** — DEFER post-Reddit.
- **Any new venues** — FROZEN per PM v193+ directive. Queue exists; fill it post-Reddit gate.

---

## One Product Risk Nobody Is Talking About

**The 29-claude/* branch proliferation is a code-churn signal, not a cleanup problem.**

The repo currently has 15+ `claude/*` branches, 2 `cursor/*` branches, and stale branches with names like `redesign-front-page-EndKs`, `improve-scoring-system-XYGY6`, `streamline-onboarding-account-97XRR`. These aren't just cleanup debt — they represent **29+ parallel attempts at uncoordinated changes** to the product while the app is under App Review. If any of those branches were accidentally merged or if the app.jsx on main drifted from what Apple reviewed, we could face a Guideline 2.3.1 violation (misrepresentation) or a fresh rejection for a different build than what was submitted.

**Current risk:** LOW (no merges visible in main log). **Potential risk:** HIGH if merged during App Review window.

**Recommendation:** Branch freeze. No new claude/* or cursor/* branches until App Review resolves and the app ships. This is a 5-day hold, not a policy change.

---

## Stale Prompt Fix Needed

The stored cron prompt still references: "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." All four are wrong. Fix: Claude.ai → Scheduled Tasks → Peakly Product Manager Agent → edit prompt. Update venue count to 404, categories to 2 (skiing + beach), remove Pro reference, remove Sentry DSN note. This notice has been in every report for 41 days.
