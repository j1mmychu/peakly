# Peakly PM Report v175 — 2026-10-09

**Status: 🟠 ORANGE — VPS Day 61 (9 days to Oct 18 launch, now P0 per DevOps). `origin/master` footgun Day 3 (still live). Code freeze Day 25 clean. Two days from the weekend Jack needs to fix both.**

> **Stale prompt notice (same as v174):** This scheduled routine still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Actual state: 404 venues, 2 categories, Peakly Pro cut, Sentry configured. Jack: update the cron task prompt before Oct 18.

---

## Shipped Since Last Report (v174 → v175)

| Commit | What | Right call? |
|--------|------|-------------|
| `7af5d48` | DevOps Oct 9 — upgraded VPS to P0, 9 days left | ✅ Correct escalation. The 10-day buffer is gone. |
| `62ac0bf` | Content Oct 9 — 91/100, code freeze clean, SH ski season context | ✅ Good. S.hemisphere ski context is useful for framing the post-launch catalog. |

**Three straight days: zero app.jsx/sw.js/index.html commits. Code freeze holding. This is correct.**

**Zero movement on either Jack-only action (VPS deploy, delete origin/master). Day 61 on VPS. Day 3 on footgun. Both require Jack on SSH. Both are now simultaneous risks 9 days from launch.**

---

## Bug Triage

### P0 — VPS Redeploy: Day 61, 9 Days Left

DevOps escalated this to P0 today. Correct call. At 9 days, "this weekend" (Oct 11–12) is the last window that isn't launch-day. If it slips to Oct 18 morning:
- Weather cache is cold at peak traffic
- Open-Meteo free tier blows under first-day load
- Two-weekend scoring shows `"low"` confidence on Val Thorens opening weekend — the exact editorial hook anchoring the launch narrative
- iOS native CORS blocked (App Store path)
- Alert deletion silent-fails on every tap

**Fix: 10 minutes SSH, Oct 11 or 12. Not Oct 17. Not Oct 18.**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Confirm `forecast_days:14` in the health output.

### P1 — `origin/master` Footgun: Day 3

Still live. `deploy.yml` triggers on both `main` and `master`. At 9 days to launch this is no longer theoretical. A midnight typo during a launch-day fire drill ships June 2026 code — 100+ commits behind main — to GitHub Pages production. Undoes everything.

**Fix: 2 minutes, same SSH session as the VPS deploy:**
```bash
git push origin --delete master
git ls-remote --heads origin master  # should return nothing
```
**Do this Oct 11 or 12. Same session as the VPS. Both in 15 minutes total.**

### P2 — Tag Depth: 225 of 404 Venues (55.7%) at Exactly 2 Tags

Unchanged. `scoreVibeMatch` underperforms for majority of catalog. Code frozen through Oct 17. First post-launch content commit. Not blocking launch.

### P2 — SW PRECACHE Babel Mismatch

Still present. `const PRECACHE = []` is the 30-second fix. Code frozen. First app.jsx commit post-launch. Not blocking launch.

### P3 — Gili Trawangan Duplicate

`beach_gilit` (LOP) + `gili-trawangan` (DPS) both map to same island. Code frozen. Post-launch. Fix: rename `beach_gilit` to Gili Air.

### ~~P2 — BASE_PRICES Gap~~ CLOSED (v174)

165/165 venue APs covered. Nothing to do.

---

## Three Product Decisions — Oct 9

### Decision 1: The Oct 11–12 weekend is non-negotiable for VPS + footgun.

Not a recommendation. A constraint. At 9 days, these are the last two weekday-buffer-protected days before launch. If they slip, Jack is deploying the morning of Oct 18 with a cold cache under live traffic — which is precisely when a cold cache turns into a product-killing first impression on Reddit.

**DECISION: VPS deploy + `origin/master` deletion happens Oct 11 or Oct 12. No later. If Jack can't be on SSH that weekend, he needs to block time now.**

### Decision 2: Post-launch sprint order is locked.

With BASE_PRICES confirmed clean, the post-launch queue is:
1. Tag enrichment (55.7% of venues at 2 tags — `scoreVibeMatch` impact is immediate)
2. PRECACHE fix + any CLAUDE.md cleanup (first app.jsx commit slot)
3. Gili Trawangan dedup
4. Photo improvements (pipeline exists, needs Unsplash key)
5. Venue additions (only after all existing venues have 4+ tags)

No reopening this order. Venue additions are last, not first.

**DECISION: Tag enrichment is the first post-launch commit. Venue additions come after every existing venue has 4+ tags.**

### Decision 3: S.hemisphere ski season wind-down is not a launch problem.

Content flagged 23 S.hemisphere ski venues going dormant post-launch (SH season ends Oct–Nov). These will score off-season correctly via the hemisphere-aware season gate. They don't need to be removed or tagged. Users in AUS/NZ/ARG/CHL are in the right season window anyway. The scoring engine handles this correctly without intervention.

**DECISION: No action on S.hemisphere ski venues pre-launch. The algorithm is correct. Don't touch it.**

---

## This Week's Top 3

1. **Jack: VPS deploy + delete origin/master — Oct 11 or 12, 15 minutes total.** Same SSH session. Not negotiable. The only true launch blocker still open.
2. **Jack: Update the PM/DevOps/Content scheduled-task prompts** — 5 minutes before Oct 10. Every agent run on stale baseline data risks false alarms the week of launch when signal quality is critical.
3. **Jack: Confirm you'll be online Oct 18 for 2 hours post-post.** Val Thorens opens Oct 18. The r/travel post drops that day. First-hour comments on Reddit require a human. This isn't a code task — it's a calendar block.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any code change before Oct 18 | Code frozen through Oct 17. Everything waits. |
| New venue additions | Tag sprint comes first, post-launch. |
| JSON-LD structured data | Post-launch SEO sprint. Not a launch blocker at current traffic. |
| Static h1 fallback | Same. SEO improvements post-launch. |
| Peakly Pro pricing fix | Pro is cut for v1. No discrepancy to fix. |
| r/skiing post | Needs real snow reports. Nov 1 target. Val Thorens angle is r/travel, not r/skiing. |

---

## One Product Risk Nobody Is Talking About

**The S.hemisphere ski venues going dormant post-launch will temporarily shrink the visible catalog for users in AUS/NZ/ARG/CHL — but the real risk is what happens to the *overall score distribution* on the front page in late October.**

When 23 S.hemisphere ski venues go off-season, and 119 N.hemisphere standard ski resorts are still pre-season (most open late Oct–Dec), the front page in late October will be almost entirely beach venues for most users — with only ~15 lateSeason glaciers holding up the ski side. A user who signed up Oct 18 because of a skiing subreddit post, checks back Nov 1, and sees nothing but Bali and Cancun — with Whistler nowhere in sight because it doesn't open until late November — will churn without understanding why.

The fix is honest: the app is working correctly. But the *communication* is missing. A "Ski season starts soon — set an alert for your resort" nudge in the Explore empty state (when skiing is selected and all results are off-season) would retain those users instead of losing them to a confusing blank grid. Small, surgical, post-launch content commit. Not under code freeze. Worth planning now.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | Two-wave path intact: r/travel Oct 18 (beach + Val Thorens), r/skiing Nov 1 (powder season). 8K requires VPS live. |
| VPS deploy | 🔴 P0. Day 61. Must happen Oct 11–12. |
| `origin/master` deleted | 🔴 P1. Day 3. Same session as VPS. |
| Code freeze | ✅ Day 25 clean. 9 days to launch. |
| VENUES count (404) | ✅ Confirmed. |
| lateSeason:true (15 venues) | ✅ Confirmed. |
| BASE_PRICES (165/165 APs) | ✅ Closed. |
| Data health score | ✅ 91/100. Two deductions are post-launch scope. |
| Val Thorens launch-day narrative | 🟡 Dependent on VPS deploy. Scoring will show low-confidence without forecast_days:14. |
