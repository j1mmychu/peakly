# Peakly PM Report v205 — 2026-11-08 (LAUNCH DAY +21)

**Status: 🔴 RED — VPS KNOWN-BROKEN (Day 92). App Review reply still not submitted. 12 days to Whistler opening. Thanksgiving window closing at 24h/day.**

> **Stale prompt notice — Day 33 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v204 → v205)

| Commit | What | Right call? |
|--------|------|-------------|
| `e1e1959` | DevOps report Nov 8 — VPS Day 92, Open #22 BASE_PRICES CLOSED | ✅ routine |
| `4d46987` | Content report Nov 8 — CLEAN (404 venues), BASE_PRICES 100% confirmed | ✅ routine |

**22 consecutive days with zero app code commits.** Still correct — no human-gated blockers have moved. App Review reply remains unsubmitted. VPS remains undeployed.

---

## Overnight Activity

Nothing actionable changed. Two routine reports filed clean:

- **Content:** Data is CLEAN. 404 venues, 0 integrity issues, BASE_PRICES now confirmed 100% (Open #22 formally closed). The repeated 68% coverage claim in CLAUDE.md's Open Items is now stale — update on next manual edit.
- **DevOps:** VPS Day 92 (yesterday's Nov 7 deadline passed silently). `fix-appjsx-final` now Day 9 as an un-deleted rollback bomb. Cache stamp `20261031a` is 8 days stale — only matters when the next code change lands.

**One thing genuinely improved:** BASE_PRICES Open #22 is closed. 100% airport coverage confirmed by DevOps via `eval()`. This had been listed as an open blocker for 3+ months. It's done. Update CLAUDE.md's Open #22 on next app.jsx commit.

---

## Bug Triage

### P0-A — App Review Guideline 2.1 reply: STILL NOT SUBMITTED. CRITICAL. 🚨

Submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e` is waiting. `docs/APP_REVIEW_NOTES.md` has paste-ready reply text.

**Updated Thanksgiving window math (now Day +21):**
- Submit today (Nov 8) → review 1–3 days → app live ~Nov 9–11 → ~17 days before Thanksgiving
- Submit Nov 10 → app live ~Nov 11–13 → ~15 days before peak
- Submit Nov 14 → app live ~Nov 15–17 → ~11 days — conversion impact becomes material
- Submit Nov 17 → app live ~Nov 18–20 → ~8 days — Whistler opening without iOS App Store

Thanksgiving is Nov 26. The window is closing. This is 30 minutes of work with paste-ready text already written.

### KNOWN-BROKEN — VPS Redeploy: Day 92. No new deadline. 🔧

Exited P0 treatment per v204. Still the fix that unlocks:
- Two-weekend scoring (Whistler Nov 21 will show wrong data without it)
- Alert deletion (currently silently fails)
- iOS native CORS (currently blocked)
- Disk cache (protects against Open-Meteo rate limits on traffic spikes)

Fix is 10 minutes via SSH. The window before the Whistler moment closes Nov 21 — 13 days.

### P0-C — `fix-appjsx-final` rollback bomb: Day 9. Still not deleted.

Branch forks from initial commit. 597 commits behind main. Would silently erase 5,161 lines of shipped code if merged. Same for `restore-appjsx`.

**Delete now:** GitHub → Branches → `fix-appjsx-final` → Delete. Same for `restore-appjsx`. Two clicks each.

### P2 — Cache stamp `20261031a` — Day 8 stale.

Auto-bumps on next app.jsx commit. No action needed until code ships.

### P2 — 19 unmerged branches on origin.

Delete the rollback bombs first. Mass-delete `claude/*` experiments after Reddit launch.

### CLOSED — Open #22 BASE_PRICES Coverage

Confirmed 100% coverage of all 165 unique venue airport codes. Was listed as "68% missing" in CLAUDE.md Open Items — that number was wrong and is now stale. Remove from Open Items on next app.jsx commit.

---

## This Week's Top 3 Priorities Only

**1. Jack: Submit App Review reply. (30 min — today, Nov 8).** The paste-ready text is in `docs/APP_REVIEW_NOTES.md`. Every day without a reply is 24 hours of Thanksgiving coverage gone. App Store matters more than any other action this week.

**2. Jack: VPS redeploy. (10 min — before Nov 21).** Two-weekend scoring is broken for Whistler opening. 13 days left before the Reddit moment. `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && pm2 restart peakly-proxy`.

**3. Jack: Delete `fix-appjsx-final` and `restore-appjsx` on GitHub. (2 min — anytime).** Live rollback bombs sitting on origin for 9 days. Two clicks each.

**Nothing else ships this week. No new features, no experiments, no branch work.**

---

## Explicit Product Decisions This Run

**DECISION 1: Open #22 BASE_PRICES is CLOSED.** 100% airport coverage confirmed by independent eval. This finding no longer requires tracking. Remove from CLAUDE.md Open Items on next app.jsx commit.

**DECISION 2: 225 thin-tag venues — DEFER past Reddit launch. Day 9.** No new data, same decision. Post-Reddit, with traffic data showing which venues are viewed, tag enrichment is prioritized by actual demand. Building it in a vacuum is the wrong order of operations.

**DECISION 3: All `claude/*` branch experiments — FROZEN, do not evaluate or merge pre-Reddit.** The automated branch sessions (redesign-front-page, improve-scoring-system, improve-peakly-ui, simplify-alerts-page, streamline-onboarding, simplify-profile-page, condense-alert-page, analyze-test-coverage, product-reliability-assessment, standardize-venue-data, review-peakly-ux, code-review-cleanup, enhance-loading-screen, implement-todo, fix-app-jsx-content, condense-alert-page) produced speculative changes with no user data to guide them. Post-Reddit, evaluate 2–3 that touch the highest-traffic flows. Delete the rest.

---

## Success Criteria Check

**90-day projection: 5K–8K users. The 8K path requires action today.**

Three levers left before Thanksgiving:

| Action | Window closes | Impact if missed |
|--------|--------------|-----------------|
| App Review reply | Nov 14 (material drop-off) | No iOS at Thanksgiving |
| VPS redeploy | Nov 21 (Whistler opens) | Wrong scoring on Reddit launch day |
| Reddit post | Nov 21 (Whistler opening) | Miss the natural hook |

The 8K path requires all three. The 5K path is achievable with just the Reddit post (web PWA). Current trajectory is 5K if no action this week, 7K–8K if App Review and VPS both land before Nov 21.

**Current best-case with App Review reply submitted today:**
- App live ~Nov 9–11
- VPS redeployed before Nov 21
- Reddit post Nov 21 with correct two-weekend scoring
- Thanksgiving coverage: ~17 days
- **Realistic: 7K–8K**

---

## One Product Risk Nobody Is Talking About

**The iOS App Store miss is becoming self-reinforcing.**

Every day without the App Review reply widens the gap between web and native experiences. Users who find Peakly on the web before the app is live will form habits around the PWA — and PWA users don't install native apps retroactively. The iOS onboarding, widget, and push notifications are all inaccessible to them. When the app finally ships, the best early adopters (the ones enthusiastic enough to install a PWA) are the ones least likely to switch to native.

The first 1,000 users are disproportionately influential. They write the first reviews. They share it. They define the word-of-mouth narrative. If those users are locked to the web because the App Review reply sat unsubmitted for 3+ weeks, the native iOS experience — which exists, works, and passes smoke tests — never gets its moment.

This is recoverable. It's recoverable today. It is not recoverable in December.

---

*Next report: 2026-11-09. Tracking: App Review reply (did it go in?), VPS (days to Whistler = 12). Both are Jack-only actions. The window is not infinite.*
