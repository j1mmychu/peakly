# Peakly PM Report v173 — 2026-10-07

**Status: 🟡 YELLOW — VPS Day 59 (Oct 4 deadline missed, 11 days to Oct 18 launch). Code freeze Day 24 clean. `origin/master` footgun RE-OPENED — yesterday's PM closure was incorrect. Two Jack actions required before Oct 18.**

---

## Shipped Since Last Report (v172 → v173)

| Commit | What | Right call? |
|--------|------|-------------|
| `5194b06` | DevOps Oct 7 — YELLOW, VPS Day 59, `origin/master` RE-OPENED | ⚠️ Surfaces a real mistake: PM v172 closed the footgun based on a DevOps report that was itself wrong. |
| `5d4858e` | Content Oct 7 — 87/100, code freeze Day 23 clean, stale PM prompt flagged | ✅ Clean. Flags a real meta-issue: this report's stored prompt has wrong venue count (182 vs 404). |

**Zero app.jsx/sw.js/index.html commits in 24 days. Code freeze holds.**

---

## ⚠️ Items Reopened Since Yesterday

### RE-OPENED — `origin/master` Footgun (P1)

DevOps Oct 6 incorrectly reported the branch deleted. DevOps Oct 7 confirms it's still alive: `origin/master → b6dc033 "auto: terms.html"`. That's a stale June 2026 auto-commit branch, 100+ commits behind main, carrying none of the current app.jsx.

**PM v172 closed this. That closure was wrong. Reopening.**

**Why it's P1:** GitHub Pages default-branch misconfiguration, a deploy.yml trigger on `master`, or any push to `master` could roll production back 100 commits. Pre-launch is the worst window for this. It's a 30-second fix that has been undone twice.

**Fix (Jack, 2 minutes):**
```bash
git push origin --delete master
git fetch --prune && git branch -r | grep master  # should return nothing
```

**This is Jack's second pre-launch action item alongside the VPS deploy.**

---

## Bug Triage

### P1 — VPS Redeploy: Day 59. Oct 4 Deadline Missed.

Nothing new to add. The situation is unchanged from yesterday. The code is committed. The VPS is not a git clone. It requires SSH.

**What degrades at launch without it:**
- Two-weekend scoring uses 7-day window (14-day committed but not deployed)
- iOS native CORS block
- Alert deletion silently fails
- Rate limiter spoofable
- Weather cache wiped on every pm2 restart

**3 commands (unchanged):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Verify `forecast_days:14` in the health response. That's the confirmation. **11 days remain.**

### P1 — `origin/master` Footgun (see above)

### P2 — Tag Density: 91 Venues (22.5%) at Exactly 2 Tags

Deferred to first post-launch commit. Reddit users don't filter by tag count. Stays here as a reminder.

### P2 — BASE_PRICES Gap: 155 of 165 APs Missing (93.9%)

No movement. **This is still the next content priority after the freeze lifts.** Affects deal scoring for the entire non-US catalog. Top-15 AP backfill, ~2hr data pass.

### P3 — Gili Trawangan Duplicate

Post-launch. Code frozen.

### P3 — SW PRECACHE Babel URL Mismatch

Dev-only. Post-launch.

### META — Stale Scheduled-Task Prompt (This Report's Input)

Content Oct 7 correctly flags this: the stored prompt for this PM routine still says "182 venues, 12 categories" with surfing, tanning, hiking listed. Current state is 404 venues, 2 categories (skiing, beach). Every PM run starts with incorrect baseline data in the prompt. This creates false-alarm risk: if the PM agent reasons from "182 venues" against current state showing 404, it looks like an anomaly.

**This prompt needs updating.** It's a meta-quality issue, not a product bug. Noting it here for Jack to update the cron task.

---

## Three Product Decisions — Oct 7

### Decision 1: `origin/master` closes before the Reddit post. Not optional.

Two PM reports (v171, v172) and one DevOps report have incorrectly marked this resolved. The branch is alive. Every week it sits there is another week the footgun is loaded.

**DECISION: Jack deletes `origin/master` before Oct 18. This is a 30-second action. It belongs on the same SSH session as the VPS deploy.**

Bundle it: `scp` proxy.js → `pm2 restart` → `git push origin --delete master` → `git fetch --prune` — all in one terminal session. Don't split across days.

### Decision 2: The stale PM prompt gets updated this week, not after launch.

If this report keeps importing "182 venues" as baseline context, it's going to generate false positives every run until someone notices. The fix is a 5-minute edit to the cron task's stored prompt. The correct baseline is in CLAUDE.md.

**DECISION: Jack updates the PM scheduled-task prompt before Oct 10. Suggested replacement for the stale section: "Current state: Live at j1mmychu.github.io/peakly. 404 venues (134 skiing / 270 beach). Plausible analytics live. SEO score ~81%. LLC pending. Code freeze in effect through Oct 17."**

### Decision 3: Stale claude/* branches — cleanup after launch, not before.

15+ stale `claude/*` branches plus `fix-appjsx-final`, `restore-appjsx`, `test-small` are on origin. They're not launch blockers. The `origin/master` branch is the only one with actual rollback risk. 

**DECISION: Stale claude/* branch cleanup deferred to first post-launch housekeeping session. Do not break freeze or spend pre-launch time on it. `origin/master` is the only pre-launch deletion.**

---

## This Week's Top 3

1. **Jack: VPS deploy — SSH, 3 commands. Day 59. 11 days remain.** Two-weekend scoring, iOS CORS, and cache persistence all blocked.
2. **Jack: Delete `origin/master` — 30 seconds. Same SSH session as #1.** Rollback risk stays loaded until this is done.
3. **Jack: Update PM scheduled-task prompt — 5 minutes, before Oct 10.** Current prompt has wrong venue count and retired categories. Meta-quality fix that stops false alarms.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Breaking freeze for `origin/master` fix via code commit | Wrong tool. This is a git branch deletion, not a code change. |
| Tag enrichment pre-launch | Code frozen. Not Reddit-visible. Post-launch. |
| Full BASE_PRICES 165 AP backfill | Code frozen. Top-15 after freeze lifts. |
| Branch cleanup for all claude/* branches | Post-launch housekeeping. Not launch-blocking. |
| r/skiing post before Oct 18 | Needs real snow data. Nov 1 target. |
| Any new feature work before Oct 18 | 11 days. Code freeze. Ship what's there. |

---

## One Product Risk Nobody Is Talking About

**The VPS being undeployed isn't just a scoring issue — it's a first-impression issue for power users.**

The Reddit post will hit r/travel and r/skiing with users who check flight prices carefully. When a live fare shows a 14-day return trip on what's supposed to be a weekend deal (the exact bug that was fixed in the Aug 11 session: `duffelTripDays`/`duffelWrongLength` check), users call it out publicly. That fix is in app.jsx and shipping. But the underlying cause — the proxy returning wrong-window fares — is only fully corrected when the VPS runs the updated proxy.js with `forecast_days:14` and correct date filtering. Without the VPS redeploy, a fraction of fare results will still come back with wrong return dates for venues whose routes don't have cached Fri–Mon pairs. A power user on Reddit spotting a "$180 weekend deal" that books 14 days is a top-level comment that kills trust on launch day. The client-side sanity check demotes these to `~$X` estimates rather than showing them as LIVE — so it won't surface wrong, but it will show more estimates and fewer live fares than it should, making the deal engine look weaker than it is. Fix is the same fix. The VPS. Day 59.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Two-wave path intact. |
| Live fares + two-weekend scoring | 🔴 VPS Day 59. 11 days remain. |
| Code freeze | ✅ Day 24 clean. |
| lateSeason:true (15 venues) | ✅ Eval-confirmed. |
| VENUES count (404) | ✅ Eval-confirmed. |
| `origin/master` footgun | 🔴 REOPENED — yesterday's closure was incorrect. Still live. |
| Reddit beach post | ✅ Draft committed Sep 24. Jack review by Oct 11. |
| Val Thorens opens Oct 18 | ✅ lateSeason:true confirmed. Scoring ready (if VPS deployed). |
| Cache warm-up | ⚠️ Run after VPS deploy AND Oct 18 morning before posting. |
| r/skiing post | ⚠️ Nov 1 target. Conditions-first angle. No draft needed before Oct 18. |
| Tag enrichment (91 venues) | ⚠️ Post-launch. First post-freeze commit. |
| BASE_PRICES (top-15 APs) | ⚠️ Not started. Post-freeze target. |
| Stale claude/* branches | ⚠️ Post-launch cleanup. 15+ branches. |
| PM scheduled-task prompt | ⚠️ Stale — says 182 venues/12 categories. Jack update before Oct 10. |
| Agent eval discipline | 🟡 CLAUDE.md rule clear. One incorrect closure this cycle (master footgun). |

**For 8K not 5K:** VPS live before Oct 18. `origin/master` deleted before Oct 18. Val Thorens scoring on 14-day data. Cache warm on launch morning. Jack online 2 hours post-post for upvote momentum. r/skiing Nov 1 with real snow data. 11 days.
