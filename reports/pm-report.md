# Peakly PM Report v172 — 2026-10-06

**Status: 🟡 YELLOW — VPS Day 58. 12 days to Oct 18 beach launch. Code freeze Day 23 clean. Two P1/P2 items CLOSED today (origin/master footgun gone, bracket-walker discrepancy explained). One blocker remains: VPS deploy.**

---

## Shipped Since Last Report (v171 → v172)

| Commit | What | Right call? |
|--------|------|-------------|
| `04089de` | DevOps Oct 6 — YELLOW, VPS Day 58, master footgun RESOLVED, bracket-walker 406 explained | ✅ Accurate. master branch confirmed deleted from remote. |
| `bf6b2c7` | Content Oct 6 — 87/100, lateSeason RESOLVED (15 confirmed), Val Thorens opens Oct 18 | ✅ Resolves two consecutive false alarms. Score correctly revised upward to 87. |

**Zero app.jsx/sw.js/index.html commits in 23 days. Code freeze holds.**

---

## ✅ Items Closed Since Yesterday

### CLOSED — `origin/master` Footgun

DevOps confirms `git branch -r` returns only `origin/main`. The branch is gone. This was a live production rollback risk for 13 days. It's done.

### CLOSED — Bracket-Walker 406 Discrepancy

Root cause confirmed: 2 `{lat,lon}` coordinate objects embedded in code comments at app.jsx lines 4723/4734 were being counted by the walker. Real venue count is 404. Not a product bug. Bracket-walker comment-stripping fix noted as a next-dev-session improvement (`src.replace(/\/\/[^\n]*/g, '')`), but doesn't warrant breaking freeze.

### CLOSED — lateSeason False Alarm (3-day streak ends)

Content confirms 15 lateSeason venues: 10 compact format + 5 JSON-key format. All 5 "missing" venues (snowbird, zermatt, verbier, val-thorens, engelberg) confirmed present in JSON-key format. Grep artifact — not a bug. Content score revised from 85 to 87.

---

## Bug Triage

### P1 — VPS Redeploy: Day 58. Oct 4 Deadline Missed.

**The only remaining blocker that matters.** Nothing has changed on this. The code is committed. The VPS is not a git clone. This requires 2 minutes of SSH from Jack.

**What breaks at launch without it:**
- Two-weekend scoring returns 7-day window for all 404 venues (Fri-Mon scoring incomplete)
- iOS CORS block on native app
- Alert deletion silently fails
- Rate limiter spoofable (takes first X-Forwarded-For, not last)
- Weather cache wiped on every pm2 restart

**The 3 commands (unchanged):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Verify `forecast_days:14` in the health response. That's the confirmation.

**12 days remain. This is not a drill.**

---

### P2 — Tag Density: 91 Venues (22.5%) at Exactly 2 Tags

Eval-confirmed. Affects `scoreVibeMatch` and search recall. Top-50 pass was scheduled for Oct 5, then deferred. **Decision v172: this moves to first post-launch commit, not pre-launch.** Reddit users don't filter by tag count. The search ranking gap is real but not launch-blocking.

---

### P2 — BASE_PRICES Gap: 155 of 165 APs Missing (93.9%)

No movement. Affects deal scoring for the entire non-US catalog. Backfill top ~15 APs by venue count before Reddit post. This one should be bundled with the first post-freeze edit session — it's a data pass, not a feature.

**Still not done. 12 days.**

---

### P3 — Gili Trawangan Duplicate

`beach_gilit/LOP` and `gili-trawangan/DPS` are two separate venue entries for essentially the same destination. Deferred to post-launch. Code frozen.

---

### P3 — SW PRECACHE Babel URL Mismatch

Dev-only. Production CI drops Babel. Post-launch.

---

## Three Product Decisions — Oct 6

### Decision 1: Oct 18 is locked. No scope additions, no code changes unless a P0 emerges from eval.

The master footgun is resolved. The lateSeason alarm was a false alarm. The bracket-walker was a false alarm. The code is clean at Day 23. There is no reason to touch app.jsx before launch.

**DECISION: Code freeze extends through Oct 17. Only an eval-confirmed P0 breaks it. Agent findings require eval verification. A finding that contradicts CLAUDE.md's documented counts is a false alarm until proven otherwise.**

### Decision 2: VPS is the only thing that can degrade launch quality — and it's still not done.

12 days. The Reddit post is drafted. The cache warm-up plan is documented. Val Thorens opens on launch day. The site looks good. The one gap is live pricing accuracy (two-weekend scoring) and iOS CORS. Jack: the VPS is 2 minutes of SSH. Everything else is blocked behind it.

**DECISION: VPS deploy is Jack's single pre-launch action item. Everything else is ready.**

### Decision 3: r/skiing post is Nov 1 deadline, not a launch-day dependency.

The beach launch is Oct 18. The ski season opens mid-October. The r/skiing post should lead with actual conditions data, not a launch announcement. It's strongest if posted when there are real snow reports to cite — early November, after the first real ski dumps, is the right window.

**DECISION: r/skiing post targets Nov 1 with a conditions-first angle ("First powder days of the season — here's what's actually firing"). Not a launch-day commitment. No draft needed before Oct 18.**

---

## This Week's Top 3

1. **Jack: VPS deploy — 2 minutes, SSH, 3 commands above. Day 58.** Nothing else matters until this is done.
2. **Jack: Review Oct 18 Reddit beach post draft by Oct 11.** 5 days. It's committed at Sep 24. Read it, flag anything off. Screenshot on launch morning before posting.
3. **BASE_PRICES backfill — bundle with first post-freeze edit.** Top ~15 APs by venue count. Affects the deal score headline on international venues. Not launch-blocking but it's the next content priority after the freeze lifts.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Tag enrichment pre-launch | Deferred to post-launch. Not Reddit-visible. |
| Breaking freeze for bracket-walker "fix" | False alarm. Not a product bug. |
| Breaking freeze for lateSeason "fix" | False alarm. All 15 confirmed present. |
| Gili rename/dedup | Post-launch. Not a user-facing regression. |
| Full BASE_PRICES 165 AP backfill | Post-launch. Top-15 is the pre-launch target. |
| r/skiing post before Oct 18 | Wrong timing. Needs real snow data, not launch hype. |
| Any new feature work before Oct 18 | 12 days. Ship what's there. |

---

## One Product Risk Nobody Is Talking About

**Val Thorens opens on launch day (Oct 18), and if the VPS is still undeployed, it'll score on 7-day data instead of 14-day.**

Val Thorens with `lateSeason:true` is one of the strongest early-season ski cards in the catalog. On Oct 18, it will surface prominently. The scoring is correct in the code — `forecast_days:14` is committed in proxy.js. But it only matters if the VPS is running the new code.

If the VPS is still on the old 7-day proxy when the Reddit post goes live, Peakly's single strongest opening-weekend ski card will be scored on half the data it could have. This isn't a crash — users see a score, it just might be lower than it should be, or miss the best days of the extended window. The "confidence: low" flag (day 6+) could surface unnecessarily on what should be a high-confidence early-season pick.

The fix is the same fix. The VPS. Day 58.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Two-wave path intact. |
| Live fares + two-weekend scoring | 🔴 VPS Day 58. 12 days remain. |
| Code freeze | ✅ Day 23 clean. |
| lateSeason:true (15 venues) | ✅ Eval-confirmed. False alarm resolved. |
| VENUES count (404) | ✅ Eval-confirmed. |
| `origin/master` footgun | ✅ RESOLVED — branch deleted from remote. |
| Reddit beach post | ✅ Draft committed Sep 24. Jack review by Oct 11. |
| Val Thorens opens Oct 18 | ✅ lateSeason:true confirmed. Scoring ready. |
| Cache warm-up | ⚠️ Run after VPS deploy AND Oct 18 morning before posting. |
| r/skiing post | ⚠️ Nov 1 target. No draft needed before Oct 18. |
| Tag enrichment (91 venues) | ⚠️ Deferred to first post-launch commit. |
| BASE_PRICES (top-15 APs) | ⚠️ Not started. Pre-launch target (bundle with first post-freeze edit). |
| Stale claude/* branches | ⚠️ 14+ branches on origin. Cleanup when Jack is in terminal. |
| Agent eval discipline | 🟡 Improving — 3 false alarms in 3 days now all resolved. CLAUDE.md rule is clear. |

**For 8K not 5K:** VPS live before Oct 18. Val Thorens scoring on 14-day data. Cache warm on launch morning. Jack online 2 hours post-post for upvote momentum. r/skiing Nov 1 with a distinct angle. 12 days.
