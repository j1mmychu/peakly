# Peakly PM Report v180 — 2026-10-14

**Status: 🔴 RED — VPS Day 66. TODAY is the last viable window. 4 days to Oct 18 launch. `origin/master` footgun Day 8. SW PRECACHE mismatch Day 10. Code freeze Day 30 clean.**

> **Stale prompt notice (Day 8):** Scheduled routine still references "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: 404 venues, 2 categories, Peakly Pro cut, Sentry live. Jack: update the cron task. 2 minutes. Eight consecutive reports generating false signal in launch week.

---

## Shipped Since Last Report (v179 → v180)

| Commit | What | Right call? |
|--------|------|-------------|
| `fcd62e4` | Content Oct 14 — 91/100, code freeze Day 30 clean, 4 days to launch | ✅ Accurate status report. |
| `688445c` | DevOps Oct 14 — RED, VPS Day 66, PRECACHE mismatch Day 10, master footgun Day 8 | ✅ Correct severity. |

**Zero app.jsx/sw.js/index.html commits. Code freeze Day 30. Correct.**

**The Oct 13–14 SSH window is today. Not yesterday, not tomorrow — today. This is it.**

---

## Bug Triage

### P0 — VPS Redeploy: Day 66. TODAY IS THE LAST VIABLE WINDOW.

Yesterday's report said "Oct 13 or 14 — after Oct 14, launch date is Oct 25." Today is Oct 14. After today:
- Oct 15 = launch-eve risk
- Oct 16 = launch-eve
- Oct 17 = launch day -1, cold cache on warm-up day
- Oct 18 = launch day, degraded product

What breaks on Oct 18 if Jack doesn't SSH today:
1. **Val Thorens disappears from the front page.** VPS returns 7-day forecasts. Val Thorens opening weekend needs 14-day window. Front page filters `confidence: "low"`. The r/travel hook ("What's the skiing like this weekend?") peg collapses on day one.
2. **Open-Meteo 429s on launch traffic.** No disk cache. In-memory cache wipes on restart. First Reddit spike → cold cache → rate limit. First impression = broken.
3. **iOS CORS fail.** `capacitor://localhost` not in live CORS allowlist. Every native API call fails. App Store users get errors.
4. **Alert deletion silent-fails.** `DELETE` missing from `Access-Control-Allow-Methods`. Users can't delete alerts.

**The fix is 10 minutes and zero code changes:**

```bash
# On your LOCAL machine in the peakly repo root:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH and restart:
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: "forecast_days": 14, "disk_cache": "enabled", apns:configured
```

**If Jack does not SSH today (Oct 14), the Val Thorens narrative is gone and the 8K projection becomes 5K. The gap is one terminal window.**

### P1 — `origin/master` Footgun: Day 8

511 commits behind main. `deploy.yml` deploys both `main` and `master`. An accidental push rolls the live site back to May 2026. This takes 90 seconds to fix:

```bash
git push origin --delete master
git ls-remote --heads origin master  # confirm gone
```

Bundle with the VPS session. Same SSH window. 12 minutes total for both P0 + P1.

### P2 — SW PRECACHE Mismatch: Day 10

`sw.js` PRECACHE references `app.jsx` directly; production serves `dist/app.min.js`. Service worker caches the raw source but the page loads the compiled build. Users with stale SW can get mixed-version artifacts. Post-launch sprint — code freeze blocks, but worth watching at launch.

### P3 — Tag Depth (225/404 Venues, 55.7% at 2 Tags)

`scoreVibeMatch` underperforms on 45% of catalog. Post-launch sprint.

### P3 — Gili Trawangan Duplicate

`beach_gilit` + `gili-trawangan` same island, different airports (LOP vs DPS). No crash. Post-launch.

---

## Three Product Decisions — Oct 14

### Decision 1: VPS today. Non-negotiable. 10 minutes.

This is the last call. Oct 14 is the last day where a VPS restart has 3+ days of cache warm-up before launch traffic hits. Oct 15+ means launching with a cold cache and a 7-day forecast window.

**DECISION: Jack — SSH today (Oct 14). `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js` then `pm2 restart`. If this doesn't happen today, Oct 18 launch ships a degraded product. The honest decision is: VPS today, or announce Oct 25 launch to allow for warm-up time. There is no "Oct 18 launch + skip the VPS" version that delivers the product we promised.**

### Decision 2: r/travel draft — 2 days overdue. Write it today.

Was due Oct 12. It's Oct 14. If the draft doesn't exist by today, writing it Oct 17 means zero review cycle. Writing it Oct 18 morning means shipping unreviewed marketing copy into the one impression that matters.

Structure is locked: one hook sentence ("What's the skiing like from your airport this weekend?"), Val Thorens opening weekend as the peg, one CTA (the link), no secondary asks. 30 minutes to write it.

**DECISION: r/travel draft today. If it doesn't exist by Oct 15, the r/travel post is cut from Oct 18. The launch still happens — it just doesn't get the Reddit amplification. The two are decoupled if the draft doesn't exist.**

### Decision 3: lateSeason manual spot-check — 4 days remaining.

15 venues have `lateSeason:true`. Val Thorens opens Oct 18 — launch day. If any lateSeason venue scores > 80 with thin opening-day snowpack, a user reports bad conditions in the launch thread and the launch post becomes the record of the problem.

**DECISION: Jack opens the live app Oct 15–17, checks top 5 lateSeason venues (Val Thorens, Whistler, Chamonix, Tignes, Mammoth). If any score > 80 with obviously thin conditions, report it here — we have 2–3 days to assess. This is a 10-minute manual check with a plausible path to protecting the launch thread. Not a code task.**

---

## This Week's Top 3

1. **Jack: VPS deploy + delete `origin/master` — TODAY, Oct 14. Last viable window. 12 minutes total.**
2. **Jack: Write the r/travel post draft — today, Oct 14. 30 minutes. 2 days overdue.**
3. **Jack: lateSeason manual spot-check — before Oct 18. 10 minutes. Open the live app, check top 5 venues.**

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any code change before Oct 18 | Code freeze. Non-negotiable. |
| Merging any `claude/` branch to main | 16+ unvetted branches, freeze risk. Post-launch. |
| SW PRECACHE fix | Code freeze. Post-launch sprint. |
| New venue additions | Post-launch sprint: tags → PRECACHE → dedup → photos → venues. |
| JSON-LD / structured data / h1 fallback | SEO gap, not a launch blocker. Post-launch. |
| Gili Trawangan dedup | Code freeze. Post-launch. |
| Alert UX improvements | Freeze. Everything waits Oct 19+. |
| Tag depth improvements (225 thin venues) | Code freeze. Post-launch sprint. |

---

## One Product Risk Nobody Is Talking About

**The r/travel post and the VPS deploy are decoupled in everyone's mind — but they're not.** If Val Thorens doesn't appear on the front page (no VPS = 7-day forecast = `confidence: "low"` = filtered out), the r/travel hook ("What's the skiing like from your airport this weekend?") has no anchor. A user clicks the link, sees zero ski results for early-season, and the post dies on arrival — or worse, generates negative comments. The entire r/travel strategy is built on Val Thorens being front-and-center on Oct 18. No VPS = no Val Thorens = no r/travel hook = the launch is a link drop with no story. **These two tasks are not parallel — VPS is a dependency of the r/travel post. If Jack can only do one today, it's the VPS.**

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | 8K requires VPS live + Val Thorens front-page on Oct 18. 5K doesn't. The difference is today's SSH session. |
| VPS deploy | 🔴 P0. Day 66. **TODAY IS THE LAST VIABLE WINDOW.** |
| `origin/master` deleted | 🔴 P1. Day 8. Same SSH session as VPS. 2 minutes. |
| SW PRECACHE mismatch | 🟡 Day 10. Code freeze blocks. Monitor at launch. |
| Code freeze | ✅ Day 30 clean. 4 days to launch. |
| VENUES count (404) | ✅ 134 skiing / 270 beach. |
| lateSeason:true (15 venues) | ✅ Confirmed. 10 compact + 5 JSON-format. |
| BASE_PRICES (165/165 APs) | ✅ Closed (Open #22). |
| Data health score | ✅ 91/100. Two deductions post-launch scope. |
| Val Thorens launch-day narrative | 🔴 At risk. Depends on VPS deploy TODAY. |
| r/travel post draft | 🔴 2 days overdue (was Oct 12). Write today. |
| Post-launch sprint order | ✅ Locked: tags → PRECACHE → dedup → photos → venues → claude/ branch cleanup. |
| lateSeason early-season score sanity | ⚠️ Unverified. Manual spot-check Oct 15–17 (non-code task). |
