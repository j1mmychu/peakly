# Peakly PM Report v208 — 2026-11-11 (LAUNCH DAY +24)

**Status: 🔴 RED — VPS KNOWN-BROKEN (Day 95). App Review reply still not submitted. 10 days to Whistler. 15 days to Thanksgiving.**

> **Stale prompt notice — Day 36 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v207 → v208)

| Commit | What | Right call? |
|--------|------|-------------|
| `2808441` | DevOps report Nov 11 — VPS Day 95, cache 11d stale, `.venue-baseline` restored | ✅ routine |
| `36a2f51` | Content report Nov 11 — CLEAN (404 venues), Thanksgiving/Whistler note | ✅ routine |

**25 consecutive days with zero app code commits.** Correct. Both Jack-gated blockers remain unresolved.

**Notable:** `.venue-baseline` is now confirmed on `origin/main` (file appears in today's git pull). DevOps "MISSING Day 3" flag is a false alarm — same methodology issue as before (sandbox running stale checkout). No data issue.

---

## Overnight Activity

Three signals, same pattern as prior 7 days:

- **DevOps:** VPS Day 95. Cache stamp 11d stale. `.venue-baseline` MISSING Day 3 (false alarm — file restored in today's pull). No new code commits. 21 branches.
- **Content:** CLEAN. 404 venues, 0 integrity issues. Thanksgiving 15 days, Whistler 10 days.
- **New branches this week:** `claude/analyze-test-coverage-WVIsT`, `claude/code-review-cleanup-HjoCS`, `claude/condense-alert-page-jzdLo`, `claude/enhance-loading-screen-rZ1dc`, `claude/fix-app-jsx-content`, `claude/implement-todo-lNL7W`, `claude/improve-peakly-ui-UHCHG`, `claude/improve-scoring-system-XYGY6`, `claude/product-reliability-assessment-w0poL`, `claude/redesign-front-page-EndKs`, `claude/review-peakly-ux-UQ0Qu`, `claude/simplify-alerts-page-2ejGB`, `claude/simplify-profile-page-Bi2Tc`, `claude/standardize-venue-data-CufiQ`, `claude/streamline-onboarding-account-97XRR`. **15 new exploratory agent branches.** Not merge candidates. Delete post-Reddit with the existing cleanup list.

---

## Bug Triage

### P0-A — App Review Guideline 2.1 reply: NOT SUBMITTED. 🚨 CLOSING WINDOW.

Submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e`. Paste-ready reply: `docs/APP_REVIEW_NOTES.md`.

**Window math updated for Day +24:**
- Submit today (Nov 11) → review 1–3 days → app live ~Nov 12–14 → **13–15 days before Thanksgiving** ← still strong
- Submit Nov 14 → app live ~Nov 15–17 → **10–12 days** ← acceptable
- Submit Nov 17 → app live ~Nov 18–20 → **7–9 days** ← marginal
- **Submit Nov 20 or later → NOT a Thanksgiving play.** Missed window.

**The hard stop is Nov 14.** Submit by end of day Thursday or the Thanksgiving ski window is gone.

### KNOWN-BROKEN — VPS Redeploy: Day 95. 🔧

Whistler opens in 10 days. This is no longer a theoretical problem — it's a countdown.

**Broken on live VPS:**
1. `forecast_days=7` → two-weekend scoring dead → ski venues invisible on front page beyond day 6
2. `capacitor://localhost` absent from CORS → iOS shows zero live data
3. `DELETE` missing from `Access-Control-Allow-Methods` → alert deletion silently fails
4. `_wxCache` in-memory only → pm2 restart wipes it → cold traffic spike risks Open-Meteo rate ceiling

**Fix is 10 minutes:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Verify `forecast_days:14` in health response. No `npm install` needed.

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 12.

No common ancestor with main. Merging via GitHub UI rewrites all commit history.

**Delete now:** GitHub → Branches → delete `fix-appjsx-final` and `restore-appjsx`. Two clicks each.

### P2 — Cache stamp `20261031a`: Day 11 stale.

Auto-push hook bumps the stamp on code changes. 25 days no code commits = 11 days stale stamp (started stale when code froze). Users cached at this stamp will get fresh code on first visit post-VPS-redeploy or next app.jsx change. Not a P0 — no regression, just housekeeping lag.

**Decision: DEFER.** Stamp bumps on next code commit. No manual bump needed.

### P2 — 36 branches on origin (21 non-main/master + 15 new from this week).

Reached 36 branches. Weekly agent sessions keep spawning exploratory branches.

**Decision:**
- 🔴 DELETE NOW: `fix-appjsx-final`, `restore-appjsx`
- 🟡 DELETE POST-REDDIT: All `claude/*` (28 branches), `cursor/*` (1), `test-small` (1)
- 🟢 KEEP: `main`, `master` (delete `master` after GitHub default branch changed)

---

## This Week's Top 3 Priorities

**#1 — App Review reply. Due: Nov 14 at the absolute latest.**
Open `docs/APP_REVIEW_NOTES.md`. Copy the paste-ready reply into App Store Connect. Done in 10 minutes. Every day this slips is a day off the Thanksgiving window. No other work matters until this is submitted.

**#2 — VPS Redeploy. Due: Before Whistler opens (Nov 21).**
10-minute SSH task. Ski season starts in 10 days. Two-weekend scoring is dead without it — ski venues fall off the front page exactly when ski traffic peaks. This is the highest-ROI 10 minutes in the project right now.

**#3 — Delete rollback bomb branches.**
Two clicks in GitHub UI. `fix-appjsx-final` and `restore-appjsx` have no common ancestor with main. They are live risks every time anyone opens a PR interface. Delete them today.

---

## Explicit Product Decisions

**Decision 1: Peakly Pro — DEFER indefinitely.**
Stored prompt asks about $9/mo vs $79/yr discrepancy. Pro UI was removed in April 2026. There is no Pro pricing showing anywhere. This "bug" does not exist. Status: not in codebase, not in roadmap. Revisit after 1K MAU.

**Decision 2: JSON-LD structured data — SHIP, but after App Review.**
SEO gap. Estimated impact: 10–20% organic search lift on venue-name queries. Implementation: 2–4 hours. No risk to app stability. Add to first post-launch sprint. Do NOT ship before App Review clears — zero code changes until iOS is live.

**Decision 3: 225 thin-tag venues (≤2 tags) — DEFER.**
Day 12 finding. Tags affect search corpus and filter accuracy. Enriching 225 venues is a 4–6 hour content task. Scheduled for the week after Reddit launch. Does not affect scoring, does not affect Thanksgiving traffic. Defer.

**Decision 4: Static h1 fallback — SHIP, after App Review.**
Same sprint as JSON-LD. 30-minute SEO fix. Bundle with structured data work.

**Decision 5: Branch cleanup (non-rollback-bombs) — DEFER to post-Reddit.**
28 claude/ branches are exploratory artifacts, not merge candidates. Clutters branch list but poses no data risk. Mass-delete in one session post-Reddit when Jack has hands on the repo.

---

## Features Rejected This Week

- **Scoring improvements** (branch `claude/improve-scoring-system-XYGY6`): The algorithm was audited in depth in August. No regression has been reported. Do not touch scoring 10 days before peak ski season. REJECTED — timing risk outweighs any improvement.
- **Front page redesign** (branch `claude/redesign-front-page-EndKs`): No user data showing the current design is a problem. Redesigning without usage data is guesswork. REJECTED — no signal.
- **Loading screen enhancement** (branch `claude/enhance-loading-screen-rZ1dc`): Nice-to-have. Zero evidence this is a retention or conversion issue. REJECTED — opportunity cost.
- **Alert page simplification** (branches `claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`): Alerts tab is APNS-gated on iOS and already clean on web. No user complaints. REJECTED — no problem to solve.
- **Profile page simplification** (branch `claude/simplify-profile-page-Bi2Tc`): Same. No user complaints. REJECTED.

---

## Success Criteria

**What defines success:**
- 90-day projection (from Reddit launch): 5K–8K users
- For 8K, not 5K, what has to be true:
  1. App Store live before Thanksgiving (Thanksgiving ski weekend is the highest organic discovery event of the year)
  2. VPS deployed before Whistler opens (without it, ski venues disappear on opening day)
  3. Reddit post lands in first 2 weeks of November (before Thanksgiving traffic peaks)
  4. At least one organic share or media pickup (product is good enough — it just needs exposure)

**Current trajectory:** Without App Review submission by Nov 14 and VPS deploy by Nov 21, the 90-day ceiling is closer to 5K than 8K. Both are 10-minute tasks. The gap between 5K and 8K is entirely execution, not product.

---

## One Product Risk Nobody Is Talking About

**The 25-day code freeze has been the right call, but the lack of any user feedback loop means we're shipping into a vacuum.** Once App Review clears and the Reddit post goes up, the first week of real user behavior will surface issues that no audit could catch — and there will be no PM report covering it because the daily agents don't have access to Plausible or Sentry data. Jack will need to be watching Sentry and Plausible manually during launch week and feeding critical findings back to the agent team. The post-launch monitoring plan doesn't exist yet. Build it before the Reddit post goes up, not after.

---

*Next report: v209, 2026-11-12. Same blockers expected unless App Review or VPS moves.*
