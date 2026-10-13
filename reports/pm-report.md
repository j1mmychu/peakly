# Peakly PM Report v179 — 2026-10-13

**Status: 🔴 RED — VPS Day 65 (Oct 11–12 SSH window is PAST. 5 days to Oct 18 launch). `origin/master` footgun Day 7. Code freeze Day 29 clean.**

> **Stale prompt notice (Day 7):** Scheduled routine still references "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: 404 venues, 2 categories, Peakly Pro cut, Sentry live. Jack: update the cron task. 2 minutes. Seven consecutive reports generating false signal in launch week.

---

## Shipped Since Last Report (v178 → v179)

| Commit | What | Right call? |
|--------|------|-------------|
| `b5606f8` | Content Oct 13 — 91/100, code freeze Day 29 clean, 5 days to launch | ✅ Accurate status. |
| `debe9cf` | DevOps Oct 13 — RED, VPS Day 65, SSH window past, origin/master Day 7 | ✅ Correct severity. |

**Zero app.jsx/sw.js/index.html commits. Code freeze Day 29. Correct.**

**The Oct 11–12 SSH window is gone. VPS and master footgun remain unresolved with 5 days to Oct 18.**

---

## Bug Triage

### P0 — VPS Redeploy: Day 65, 5 Days Left, Last Viable Window Closed Yesterday

The Oct 11–12 window is past. The next opportunity is today or tomorrow — still viable, but the buffer is now zero. After Oct 15, any VPS work runs on launch-eve risk.

`server/proxy.js` is ready. Zero code changes needed. The deploy is:

```bash
# On your LOCAL machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then verify:
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Look for: forecast_days:14
```

10 minutes. What stays broken without it on Oct 18:

1. **Val Thorens** — `forecast_days:14` needed to score its opening weekend on launch day. Without it, the venue scores `low` confidence and disappears from the front page. The r/travel launch hook ("What's the skiing like from your airport this weekend?") collapses.
2. **Open-Meteo rate ceiling** — disk cache not live. Launch traffic hits a cold in-memory cache that wipes on restart. 429s on first impression.
3. **iOS native CORS blocked** — `capacitor://localhost` not in live allowlist. Every native API call fails.
4. **Alert deletion broken** — `DELETE` blocked at preflight. Users can't delete alerts. Silent failure.

**This is no longer a "schedule it carefully" problem. This is "do it today or tomorrow, or we ship a degraded product on Oct 18."**

### P1 — `origin/master` Footgun: Day 7

511 commits behind main. `deploy.yml` still deploys both `main` and `master`. An accidental push rolls the live site back to May 2026. One command:

```bash
git push origin --delete master
git ls-remote --heads origin master  # confirm gone
```

Bundle with VPS. One SSH session. 12 minutes total.

### P2 — Tag Depth (225/404 Venues, 55.7% at 2 Tags)

`scoreVibeMatch` underperforms for 45% of catalog. Code frozen. Post-launch sprint: tags → PRECACHE → dedup → photos → venues.

### P3 — Gili Trawangan Duplicate

`beach_gilit` and `gili-trawangan` same island. No crash. Post-launch.

---

## Three Product Decisions — Oct 13

### Decision 1: VPS today or tomorrow. Not Oct 15+.

Oct 11–12 was the "planned" window. It's gone. The window that remains is today (Oct 13) or tomorrow (Oct 14). Beyond that, a VPS restart on Oct 15–17 means launching against a cold cache — the rate-limiter protection is only as good as the cache that's had time to warm.

**DECISION: VPS deploy must happen Oct 13 or Oct 14. Jack: 10 minutes. The diff is on `server/proxy.js`. After Oct 14 the launch date is Oct 25, not Oct 18 — the Val Thorens narrative doesn't work with a cold cache and a 7-day forecast window.**

### Decision 2: r/travel post draft — now overdue.

The draft was due Oct 12. It's Oct 13. The post still doesn't exist. Writing it on Oct 17 (the day before launch) means no review cycle. Writing it on Oct 18 morning is shipping marketing copy with zero review.

Structure remains locked: one hook sentence ("What's the skiing like from your airport this weekend?"), Val Thorens opening weekend as the peg, one CTA (the link), no secondary asks.

**DECISION: Write the draft today. 30 minutes. If it doesn't exist by Oct 14, the r/travel post does not go out Oct 18 — it gets punted to Oct 25 with the VPS launch. The two are coupled.**

### Decision 3: lateSeason early-season sanity check is a non-code pre-launch task.

15 venues have `lateSeason:true`. Val Thorens opens Oct 18 — launch day. If a `lateSeason` venue scores dishonestly high on early-October opening-day data (thin snowpack, the bypass masking it), a user reports bad conditions in the same Reddit thread driving the launch. This has never been tested against October opening-day data.

**DECISION: Jack opens the app Oct 15–17 and spot-checks the top 5 `lateSeason` venues (Whistler, Val Thorens, Chamonix, Tignes, Mammoth). If any score > 80 with obviously thin conditions, it's an honest-product flag. This is not a code change — it's a 10-minute manual check that has a plausible path to protecting the launch thread.**

---

## This Week's Top 3

1. **Jack: VPS deploy + delete `origin/master` — Oct 13 or 14. Last viable window. 12 minutes.** After Oct 14, launch date is Oct 25.
2. **Jack: Write the r/travel post draft — today, Oct 13.** 30 minutes. One hook, Val Thorens peg, one CTA. Overdue.
3. **Jack: lateSeason manual spot-check — before Oct 18.** Open the live app, check top 5 lateSeason venues. 10 minutes. Not a code task.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any code change before Oct 18 | Code freeze. Non-negotiable. |
| Merging any `claude/` branch to main | 16+ unvetted branches, freeze risk. Post-launch. |
| New venue additions | Post-launch sprint: tags → PRECACHE → dedup → photos → venues. |
| JSON-LD / structured data / h1 fallback | SEO gap, not a launch blocker. Post-launch. |
| Peakly Pro pricing fix ($9/mo vs $79/yr) | Pro is cut for v1. No one sees this price. Non-issue. |
| Thin-content venue cleanup (17 flagged by Content) | Code freeze. Post-launch. |
| Alert UX / any claude/ branch work | Freeze. Everything waits Oct 19+. |

---

## One Product Risk Nobody Is Talking About

**There are 16+ active `claude/` branches on origin (analyze-test-coverage, code-review-cleanup, condense-alert-page, enhance-loading-screen, fix-app-jsx-content, implement-todo, improve-peakly-ui, improve-scoring-system, product-reliability-assessment, redesign-front-page, review-peakly-ux, simplify-alerts-page, simplify-profile-page, standardize-venue-data, streamline-onboarding-account, plus others).** These represent months of exploratory AI sessions, none of which have been reviewed or vetted. They sit on origin indefinitely. The risk is not that they merge before launch — code freeze prevents that. The risk is what happens in the post-launch sprint when a session picks up one of these branches and continues work against a 3-month-old snapshot, then pushes to main. The branch will be stale, the diff will be large, and the merge will be ambiguous. **The 15-minute task post-Oct 18: `git branch -r | grep claude/ | ...` review pass — keep, archive, or delete. Every day these linger is a day someone might accidentally pick up wrong work.**

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | 8K requires VPS live + Val Thorens front-page on Oct 18 + clean first impressions. 5K doesn't need VPS. The gap is still `forecast_days:14`. |
| VPS deploy | 🔴 P0. Day 65. Window: Oct 13–14 only. |
| `origin/master` deleted | 🔴 P1. Day 7. Same SSH session as VPS. |
| Code freeze | ✅ Day 29 clean. 5 days to launch. |
| VENUES count (404) | ✅ 134 skiing / 270 beach. |
| lateSeason:true (15 venues) | ✅ Confirmed via eval. |
| BASE_PRICES (165/165 APs) | ✅ Closed (Open #22). |
| Data health score | ✅ 91/100. Two deductions are post-launch scope. |
| Val Thorens launch-day narrative | 🔴 At risk. Depends on VPS deploy Oct 13–14. |
| r/travel post draft | 🔴 Overdue (was Oct 12). Write today. |
| Post-launch sprint order | ✅ Locked: tags → PRECACHE → dedup → photos → venues → claude/ branch cleanup. |
| lateSeason early-season score sanity | ⚠️ Unverified. Manual spot-check before Oct 18 (non-code task). |
