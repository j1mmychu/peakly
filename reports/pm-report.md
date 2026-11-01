# Peakly PM Report v198 — 2026-11-01 (LAUNCH DAY +14)

**Status: 🟡 YELLOW — PR #20 shipped good App Review prep. VPS Day 85, 6 days to Nov 7. App Review Guideline 2.1 reply pending Jack. 20 unmerged branches unchanged.**

> **Stale prompt notice — Day 26 (unchanged):** Stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface.

---

## Shipped Since Last Report (v197 → v198)

| Commit | What | Right call? |
|--------|------|-------------|
| `6f0e744` | PR #20 — iOS 15.0 target, build 3, support.html, 100dvh viewport fix, PRECACHE cleared, cache `20261031a`, App Review notes (`docs/APP_REVIEW_NOTES.md`) | ✅ **Yes.** Every change here directly serves the App Review unblock. Cursor Agent co-authored — clean, targeted diff. |
| `6f61f11` | DevOps Nov 1 — RED, VPS Day 84, venue drift 406 vs baseline 404, 20 branches | ✅ reporting (note: "406 venues" is a DevOps counting error — eval gives 404, confirmed this run) |
| `2f40956` | Content Nov 1 — 88/100, data CLEAN, 225 thin-tag venues flagged, queue frozen | ✅ reporting, consistent with PM freeze directive |

**Zero new app.jsx logic commits. 20 days since the last feature/fix.**

---

## Overnight Activity: What Matters

### PR #20 — App Review Build 3. Right work, right timing.

The diff is clean and focused: iOS deployment target 15.0 (unblocks ITMS-90068), build number 3, `100dvh` viewport fix (iOS Safari tab-bar overlap was hiding bottom content), PRECACHE cleared (P1 Day 24/25 resolved), cache stamp fresh, `support.html` + Support link in Profile footer added (App Review Guideline 2.1 requires it), `docs/APP_REVIEW_NOTES.md` with a paste-ready Guideline 2.1 reply and shot list.

**This moves the App Review block from Jack needing to figure out what to say to Jack needing to paste and attach a recording.** That's meaningful progress.

### DevOps venue count drift (406 vs 404) is a DevOps counting error.

Verified this run: compact ids (209) + JSON ids (195) = 404. DevOps agent's bracket-walker returned 406 — unclear methodology, wrong. `.venue-baseline` is correctly `404`. No drift.

### `fix-appjsx-final` branch (597 commits, from May 13 base) — DO NOT MERGE BLINDLY.

The branch diverged from a May 13, 2026 base (`PEAKLY_BUILD = "20260513c"`). Merging it would roll back 5+ months of work including the PR #20 App Review fixes, the onboarding rewrite, photo improvements, and the scoring honesty pass. The top commits are "Restore app.jsx" which is a further red flag. This branch is almost certainly abandoned exploratory work from before the main line stabilized. Jack should close it without merging.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 85. Nov 7 = **6 days.** Whistler = 20 days. 🚨

This is the same P0 it has been for 85 days. Verified: `server/proxy.js` in HEAD contains all four fixes (forecast_days:14, disk cache, capacitor://localhost CORS, DELETE allowed, APNs HTTP/2 + P1363). Nothing new to investigate — this is execution, not analysis.

```bash
ssh root@198.199.80.21
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js  # or scp from local
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health
```

If it misses Nov 7, Whistler opens Nov 21 with broken two-weekend scoring. That's the worst possible timing for a ski app pre-Reddit.

### P0-B — App Review Guideline 2.1 reply. Jack needs to paste and attach.

`docs/APP_REVIEW_NOTES.md` has the paste-ready reply. Jack needs to:
1. Reply on the App Review page for submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
2. Attach a screen recording from a physical iPhone per the shot list
3. Set build 3 as the selected build if not already done

This is not a technical blocker — it's 30 minutes of Jack's time in App Store Connect.

### P1 — `fix-appjsx-final` branch risk (597 commits ahead of main, May 13 base)

If this ever accidentally gets merged or rebased onto main, it wipes five months of work. Jack should close/delete it now to remove the footgun.

### P2 — 20 unmerged origin branches (19 non-main)

Not urgent individually but collectively noisy. Most are named `claude/*` — exploratory work that went nowhere. Recommend a cleanup pass: close all `claude/*` branches that haven't had a commit in 30 days. Jack approves the sweep.

### P3 — DevOps agent venue counting methodology

Three consecutive runs now the DevOps agent has reported wrong venue counts (209, 406). The correct approach is: `compact ids + JSON ids`. Worth noting in `tasks/agents/devops.md` but not a launch blocker.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS redeploy before Nov 7. (10 minutes, SSH, P0-A)**
Verified runbook above. This is the only technical blocker that's purely an execution gap. Everything else can ship or wait.

**2. Jack: App Review Guideline 2.1 reply (30 min, App Store Connect, P0-B)**
`docs/APP_REVIEW_NOTES.md` has the exact paste. Attach the recording. The build is ready (build 3 via PR #20). There's no reason to wait.

**3. Jack: Close `fix-appjsx-final` and schedule a 20-branch cleanup sweep.**
5 minutes per branch to decide: merge (if genuinely ahead of main with good code), or close. Most are exploratory dead ends. `fix-appjsx-final` specifically must be closed — it's a 5-month-old base that would roll back the codebase.

---

## Explicit Product Decisions This Run

**DECISION 1: PR #20 was the right call. SHIPPED.**
Clean, targeted App Review prep. 100dvh fix was a real bug on iOS Safari. Support link was a Guideline 2.1 requirement. PRECACHE clear removes a stale-cache class of bugs. No regressions possible from this diff.

**DECISION 2: Venue addition queue stays FROZEN. DEFER indefinitely post-Reddit.**
Content agent flagged 225 thin-tag venues and a queue of 20+ proposals. The product doesn't need more venues to hit 1K users. It needs the App Review to clear and the Reddit post to go out. Venue count at 404 is more than sufficient signal diversity. Tag enrichment won't move the conversion needle before launch.

**DECISION 3: `fix-appjsx-final` branch — DO NOT MERGE, CLOSE. Jack to confirm.**
This is not a scheduling decision; it's a preservation call. The branch diverged 5 months ago from a base that's missing the onboarding rewrite, PR #20, and every scoring improvement since May. PM formally recommends closing it. If it contains genuinely valuable work, cherry-pick specific commits only — never merge the branch wholesale.

---

## Features REJECTED This Week

- **Tag enrichment (225 thin-tag venues):** Not a conversion lever. Users choose by score and category, not tags. REJECT until post-10K users.
- **JSON-LD / static h1 fallback:** SEO improvement, already cut from launch gate in v195. Still not worth the pre-launch complexity with App Review pending. REJECT.
- **APNS push alert wiring:** Blocked by Open #21. Code is fixed in repo, VPS not deployed. Cannot validate until after VPS redeploy. REJECT until VPS is confirmed live and APNS test-fire succeeds.
- **Any `claude/*` branch merge without Jack review:** Automated merge of exploratory branches without human review is how `fix-appjsx-final` persisted this long. REJECT.

---

## Success Criteria

**What defines success:**
- App Store approval: build 3 + Guideline 2.1 reply lands within 7 days
- VPS deployed before Nov 7 (Whistler open = first organic ski-season traffic)
- Reddit post lands with live weather + accurate weekend pricing for all users
- <5% Sentry ErrorBoundary rate in first 48h post-Reddit

**90-day projection: 5K vs 8K users:**

For 8K (not 5K):
- App Review clears before Whistler opens (Nov 21 is the deadline with meaning)
- VPS serves 14-day forecasts on day of Reddit post so the ski audience sees real November ski-season data
- At least one of the unmerged `claude/*` branches contains a genuine UX improvement that increases session depth (time on Explore, card taps per session)
- The 100dvh fix from PR #20 means iOS Safari users actually see the bottom nav — this was a real bug affecting all iPhone users browsing via Safari

**One product risk nobody is talking about:**

The app has 20 unmerged branches and an active App Review submission, but no record of what the live site currently looks like to a first-time user. The last time anyone ran a manual smoke test and wrote it down was Aug 11. The auto-push Playwright smoke runs against the Pages deploy — but does the live site, on a real iPhone, with real weather data, actually feel like a 5-star app? The gap between "passes smoke" and "feels polished" is where Reddit posts die. Before the post goes out, Jack should walk through the full first-run experience on an iPhone, screenshot every step, and fix anything that feels rough. That 1-hour session is worth more than any of the 20 pending branches.

---

## Branch Cleanup Recommendation (Jack action, ~30 min)

| Branch | Commits ahead of main | Recommendation |
|--------|----------------------|----------------|
| `fix-appjsx-final` | 597 (May 13 base — STALE) | ❌ CLOSE/DELETE |
| `restore-appjsx` | ~5 (May base) | ❌ CLOSE/DELETE |
| `cursor/finish-peakly-ship-c015` | 1 (same as PR #20) | ✅ Already merged via #20, DELETE |
| `test-small` | unknown | ❌ CLOSE |
| `master` | footgun Day 25 | ❌ DELETE |
| `claude/improve-scoring-system-XYGY6` | unknown | ⚠️ READ before closing — scoring changes need algorithm critique |
| All other `claude/*` | unknown | ❌ CLOSE unless Jack specifically wants one |
