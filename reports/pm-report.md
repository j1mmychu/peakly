# Peakly PM Report v174 — 2026-10-08

**Status: 🟡 YELLOW — VPS Day 60 (10 days to Oct 18 launch, still undeployed). `origin/master` footgun Day 2 (still live). Code freeze Day 24 clean. Three Content corrections today improve the data picture significantly.**

---

## Shipped Since Last Report (v173 → v174)

| Commit | What | Right call? |
|--------|------|-------------|
| `200a597` | DevOps Oct 8 — YELLOW, VPS Day 60, `origin/master` footgun Day 2, SW PRECACHE Babel mismatch Day 4 | ✅ Accurate. Same blockers, no movement. |
| `1ffa00c` | Content Oct 8 — 91/100, three corrections from yesterday | ✅ Good catch. Corrects three wrong figures that have been circulating for multiple days. |

**Zero app.jsx/sw.js/index.html commits in 24 days. Code freeze intact. This is correct.**

---

## Content Corrections — Three Data Points Corrected Today

| Metric | Prior reports (wrong) | Today (correct) | Impact |
|--------|----------------------|-----------------|--------|
| Venues with exactly 2 tags | 91 (22.5%) | **225 (55.7%)** | Tag sprint is more urgent post-launch |
| Unique photo URLs | 209 | **404** (all unique, no duplicates) | Photo gap is smaller than feared |
| BASE_PRICES AP coverage | 10/165 (6%) | **165/165 (100%)** | Open #22 is CLOSED |

**Open #22 is closed.** BASE_PRICES covers all 165 venue APs at 100%. The July 2026 CLAUDE.md entry flagging 68% missing was stale — the gap was closed in a prior session and the data is clean. No backfill sprint needed. Removing it from the P2 list.

---

## Bug Triage

### P1 — VPS Redeploy: Day 60. 10 Days Left.

10 days is no longer "this week" — it's "this weekend or it doesn't happen before launch."

What degrades at Reddit launch without it:
- Two-weekend scoring on 7-day window (14-day committed, not deployed) — the exact window Val Thorens opens Oct 18
- iOS native CORS block — any iPhone user who taps the App Store link (if that comes later) gets broken flight data
- Alert deletion silently fails on every attempt
- Weather cache (`_wxCache`) disk persistence unshipped — a cold `pm2 restart` the morning of launch, under traffic, exhausts Open-Meteo's free tier in minutes
- Rate limiter spoofable

**Three commands. 10 minutes SSH:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Confirm `forecast_days:14` in the health response.

**This is launch-critical. Not negotiable. Not a reminder. The deadline is now "this weekend."**

### P1 — `origin/master` Footgun: Day 2

Still live. `origin/master → b6dc033 "auto: terms.html"` — a June 2026 auto-commit, 100+ commits behind main. deploy.yml triggers on both `main` and `master`. A midnight push to the wrong branch during a launch-day fire drill ships 4-month-old code.

**Fix — 2 minutes, same SSH session as VPS:**
```bash
git push origin --delete master
git fetch --prune && git branch -r | grep master  # should return nothing
```

### P1 — SW PRECACHE Babel Mismatch (Dev-only, deferred)

Wrong CDN + wrong version. Fix: `const PRECACHE = []`. Code frozen. First commit post-launch. Not a launch blocker.

### P2 — Tag Depth: 225 of 404 Venues (55.7%) at 2 Tags

Corrected upward from prior figure of 91 (22.5%). `scoreVibeMatch` runs on tags — the vibe feature is underperforming for over half the catalog. Code frozen. First content sprint post-launch. Not a launch blocker.

### ~~P2 — BASE_PRICES Gap~~

**CLOSED.** 165/165 venue APs covered at 100%. Prior reports were wrong. Remove from tracker.

### P3 — Gili Trawangan Duplicate

Code frozen. Post-launch. `beach_gilit` (LOP) and `gili-trawangan` (DPS) both map to the same island.

### META — Stale Scheduled-Task Prompt

This PM routine still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Actual state: 404 venues, 2 categories (skiing + beach), Peakly Pro formally cut for v1, Sentry DSN confirmed configured. Every run starts with wrong baseline data. Jack needs to update the cron task prompt. Suggested replacement for the stale context block:

> *Current state: Live at j1mmychu.github.io/peakly. 404 venues (134 skiing / 270 beach). Plausible analytics live. Sentry DSN configured. Code freeze in effect through Oct 17. Oct 18 launch target. LLC pending (blocking REI/Backcountry/GYG affiliates). Peakly Pro: formally CUT for v1.*

---

## Three Product Decisions — Oct 8

### Decision 1: VPS deploy is now a weekend action, not a "this week" action.

With 10 days to launch, there are two weekends left: this one (Oct 11–12) and next (Oct 18 = launch). If it doesn't land this weekend, it lands the morning of launch day — which is exactly when the cache will be cold, traffic will spike, and Open-Meteo's free tier will blow. That's a product-killing first-impression scenario.

**DECISION: Jack deploys the VPS this weekend (Oct 11–12). Same SSH session: `scp` + `pm2 restart` + `git push origin --delete master` + health check. Four commands. The launch gate is now "weekend of Oct 11–12, not Oct 17."**

### Decision 2: Open #22 (BASE_PRICES gap) is CLOSED.

Content confirmed 165/165 venue APs covered at 100%. The CLAUDE.md entry saying "100 of 146 airports missing" is stale — it predates a prior session that closed the gap. Closing it now. No backfill sprint needed. Remove from open items.

**DECISION: Open #22 CLOSED. Update CLAUDE.md in the first post-launch commit to reflect this.**

### Decision 3: Tag enrichment is the #1 post-launch content sprint, not venue additions.

The corrected figure — 225 venues (55.7%) at exactly 2 tags — means vibe matching is underperforming for the majority of the catalog. A 30-minute tag audit (add `"Snorkeling"`, `"Sailing"`, `"Family Friendly"` etc. to ~100 venues) immediately improves the product's differentiation without adding venues that dilute quality.

**DECISION: First post-launch content commit = tag enrichment sprint (target: bring all venues to 4+ tags). Venue additions come second. No new venues until every existing venue has 4+ tags.**

---

## This Week's Top 3

1. **Jack: VPS deploy — this weekend. SSH, 4 commands, 15 minutes.** Not negotiable. Open-Meteo cache cold-start on launch morning is a product-killing event. Bundle: `scp proxy.js` + `pm2 restart` + `delete origin/master` + health check.
2. **Jack: Update PM scheduled-task prompt — 5 minutes, before Oct 10.** Every run on wrong baseline data risks false alarms on launch week when signal quality matters most.
3. **Team: Confirm Jack will be online Oct 18 for 2 hours post-post.** Val Thorens opens Oct 18 = Peakly's launch day. First 2 hours of upvote momentum on a skiing subreddit require a real human responding to comments. Not a code task — a logistics confirmation.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any code change before Oct 18 | Code frozen through Oct 17. PRECACHE fix, tag enrichment, Gili dedup — all post-launch. |
| Venue additions pre-launch | Code frozen. Post-launch tag sprint comes first anyway. |
| Breaking freeze for BASE_PRICES backfill | Moot. Gap is CLOSED. Nothing to backfill. |
| r/skiing post before Oct 18 | Needs real snow reports. Nov 1 target. Val Thorens launch-day angle stays in r/travel post, not r/skiing. |
| Peakly Pro pricing fix | Peakly Pro is cut for v1. Price is $0 and the feature is hidden. No discrepancy to fix. |

---

## One Product Risk Nobody Is Talking About

**The Val Thorens timing is a double-edged sword.**

Val Thorens opens Oct 18 = Peakly's launch day. That's a genuine editorial hook — "Europe's highest resort opens the same day we launch, and we're the only app that shows you the Fri–Mon window." It's compelling.

But it only works if the VPS is deployed. Without `forecast_days:14`, Val Thorens' opening weekend scores off 7-day data — and Oct 18 is day 0 of a 14-day window. The scoring engine will have lower confidence on Val Thorens specifically, which is the exact venue anchoring the launch narrative. A launch-day r/travel post about "ski weekends" that shows Val Thorens with a low-confidence flag ("Beyond reliable forecast") — because the proxy is still running 7-day — is the wrong story.

The fix is the same fix. The VPS. This weekend.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Two-wave path intact. 8K requires VPS live + val thorens narrative landing + r/skiing Nov 1. |
| Live fares + two-weekend scoring | 🔴 VPS Day 60. This weekend is the window. |
| Code freeze | ✅ Day 24 clean. 10 days to launch. |
| VENUES count (404) | ✅ Eval-confirmed. |
| lateSeason:true (15 venues) | ✅ Eval-confirmed. |
| BASE_PRICES (165/165 APs) | ✅ **CLOSED** — 100% coverage confirmed today. |
| Unique photos (404) | ✅ Corrected today — all 404 unique. |
| `origin/master` footgun | 🔴 Still live. Same SSH session as VPS. |
| Val Thorens opens Oct 18 | ✅ lateSeason:true confirmed. Scoring ready IF VPS deployed. |
| Reddit beach post | ✅ Draft committed Sep 24. Jack review by Oct 11. |
| r/skiing post | ⚠️ Nov 1 target. No draft needed pre-launch. |
| Tag enrichment (225 venues) | ⚠️ Post-launch sprint, #1 priority. 55.7% at 2 tags — worse than reported. |
| Stale PM prompt | ⚠️ Jack update before Oct 10. |
| SW PRECACHE Babel mismatch | ⚠️ First post-launch commit. |
| Gili duplicate | ⚠️ First post-launch commit. |

**For 8K not 5K:** VPS live before Oct 18. `origin/master` deleted. Val Thorens hook lands with full 14-day scoring confidence. Jack online Oct 18 morning. r/skiing post Nov 1 with real snow data. Reddit post reviewed and published Oct 18.

---

*v174 — 2026-10-08*
