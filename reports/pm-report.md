# Peakly PM Report v176 — 2026-10-10

**Status: 🔴 RED — VPS Day 62 (8 days to Oct 18 launch, P0). `origin/master` footgun Day 4. Code freeze Day 26 clean. Oct 11–12 is the window. It starts tomorrow.**

> **Stale prompt notice (Day 4):** This scheduled routine still references "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Actual state: 404 venues, 2 categories, Peakly Pro cut, Sentry configured. Jack: update the cron task prompt. It takes 2 minutes and stops generating false noise the week of launch when signal quality is critical.

---

## Shipped Since Last Report (v175 → v176)

| Commit | What | Right call? |
|--------|------|-------------|
| `e2c1e20` | DevOps Oct 10 — ORANGE, VPS Day 62, code freeze clean | ✅ Correct. Escalation tone is appropriate. |
| `0e75df7` | Content Oct 10 — 91/100, Val Thorens context, S.hem spring ramp | ✅ Good. Confirms catalog is clean. |

**Day 26 of code freeze. Zero app.jsx/sw.js/index.html commits. Correct.**

**Zero movement on either Jack-only blocker for the fourth straight day. The Oct 11–12 window opens tomorrow morning. This is the report.**

---

## Bug Triage

### P0 — VPS Redeploy: Day 62, 8 Days Left

**Tomorrow is Oct 11. The window is here.**

Still undeployed. `server/proxy.js` in the repo is correct and complete — disk cache, `forecast_days:14`, `capacitor://localhost` CORS, DELETE method, rate-limiter fix. All verified today by DevOps. None of it is live.

What breaks at launch if this doesn't happen:

1. **Val Thorens opening weekend (`low` confidence on Day 6–7)** — the editorial hook for the r/travel launch post. The exact venue the launch narrative is built around. Without `forecast_days:14`, it drops off the front page with a "low" confidence flag on its opening day.
2. **Open-Meteo free tier blown on first-hour traffic** — in-memory cache wipes on every pm2 restart; disk persistence isn't live; cold cache + launch traffic = 429s across the board = "conditions unavailable" for every new user's first impression.
3. **iOS CORS blocked** — `capacitor://localhost` not in live allowlist.
4. **Alert deletion silent-fails** — DELETE blocked at preflight since launch.

**Fix. One session. 10 minutes:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Confirm: forecast_days:14 visible in health output
```

**Do this Oct 11 or 12. Non-negotiable.**

### P1 — `origin/master` Footgun: Day 4, 561 Commits Behind

Still live. `deploy.yml` triggers on both `main` and `master`. 8 days from launch, any accidental push to master ships June 2026 code to GitHub Pages. Undoes 5 months of work instantly. Takes 2 minutes to fix in the same SSH session.

```bash
git push origin --delete master
git ls-remote --heads origin master  # confirm empty
```

**Bundle with the VPS deploy. Same session. 12 minutes total for both blockers.**

### P2 — Tag Depth: 225/404 Venues at Exactly 2 Tags

`scoreVibeMatch` underperforms for 55.7% of catalog. Code frozen. First post-launch commit. Not a launch risk.

### P2 — SW PRECACHE Babel Mismatch

`const PRECACHE = []` is the fix. Code frozen. Post-launch. Day 6.

### P3 — Gili Trawangan Duplicate

`beach_gilit` and `gili-trawangan` are the same island. No crash. Post-launch.

---

## Three Product Decisions — Oct 10

### Decision 1: The window is tomorrow. No more extensions.

There is no "Oct 13" option that doesn't carry risk. At 8 days, a Monday deploy still leaves only 6 days of verified-live behavior before launch traffic. Oct 11–12 is the last weekend with a full business-week buffer. A 10-minute SSH session fixes both remaining blockers in one shot.

**DECISION: VPS deploy + `origin/master` deletion happens Oct 11 or Oct 12. If Jack is blocked both days, the launch date moves — because launching without `forecast_days:14` on Val Thorens opening weekend is launching with your editorial hook broken.**

### Decision 2: Post-launch sprint order confirmed and frozen.

1. Tag enrichment (55.7% at 2 tags — `scoreVibeMatch` impact is the highest-leverage first commit)
2. SW PRECACHE fix + CLAUDE.md prompt update (10-minute housekeeping, first app.jsx slot)
3. Gili Trawangan dedup
4. Photo improvements (Unsplash key required)
5. Venue additions (only after all existing venues have 4+ tags)

No reopening this order. Post-launch commits go in this sequence.

**DECISION: Tag enrichment is the first post-launch commit. Venue additions are last.**

### Decision 3: The "ski season starts soon" empty-state nudge is worth planning now.

v175 surfaced a legitimate post-launch retention risk: N.hemisphere ski resorts are pre-season in late October (most open late Oct–Dec). A user who found Peakly via the r/travel Val Thorens post on Oct 18, comes back Nov 1 with the skiing filter active, and sees a near-empty grid — with Whistler off-season, Chamonix off-season, and the lateSeason glaciers as the only results — will churn without understanding why. The app is working correctly; the communication is missing.

The fix is a single "Ski season starts soon — set an alert for your resort" nudge in the Explore empty state when skiing is selected and all results are filtered as off-season. One content commit, no scoring changes.

**DECISION: Add the ski-season empty-state nudge as the second or third post-launch commit (after tag enrichment + PRECACHE). Scope it as a copy change only — no scoring, no new state.**

---

## This Week's Top 3

1. **Jack: VPS deploy + delete `origin/master` — Oct 11 or Oct 12. 12 minutes. One SSH session.** The launch editorial hook (Val Thorens opening weekend, forecast confidence) depends on `forecast_days:14` being live. This is not optional.
2. **Jack: Update the PM/DevOps/Content cron task prompts.** 5 minutes. Every agent run on stale data this week adds noise at the worst time. "182 venues" is 4 months out of date.
3. **Jack: Block 2 hours on Oct 18 for Reddit response.** The r/travel post drops launch day. First-hour comment quality determines the trajectory. No tool can do this. Calendar block now.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any code change before Oct 18 | Code freeze through Oct 17. No exceptions. |
| New venue additions | Post-launch. Tag sprint comes first. |
| JSON-LD / h1 fallback | SEO post-launch sprint. Not a launch blocker. |
| Peakly Pro pricing fix | Pro is cut for v1. Nothing to fix. |
| r/skiing post | Needs real snow reports. Nov 1 target. |
| S.hemisphere ski venue removal | Algorithm handles off-season correctly. No intervention needed. |

---

## One Product Risk Nobody Is Talking About

**The launch post goes up the same day Val Thorens opens. The r/travel hook is "this exact ski resort opens today — here's the window." If the VPS isn't live, Peakly will show Val Thorens with `low` confidence, or not show it at all. Every r/travel commenter who taps through and sees "Beyond reliable forecast" on the launch-day venue will say so in the thread. The first 10 comments define the narrative. A broken editorial hook on launch day is not a P0 infrastructure bug — it's a reputation event.**

This is why the VPS deploy is P0 and not P1. It's not about infrastructure reliability. It's about whether the product does what the launch post promises, in the exact moment when it matters most.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | 8K requires VPS live on launch day. 5K doesn't. The gap is `forecast_days:14`. |
| VPS deploy | 🔴 P0. Day 62. Window opens tomorrow (Oct 11). |
| `origin/master` deleted | 🔴 P1. Day 4. Same session as VPS. |
| Code freeze | ✅ Day 26 clean. 8 days to launch. |
| VENUES count (404) | ✅ Confirmed. |
| lateSeason:true (15 venues) | ✅ Confirmed. |
| BASE_PRICES (165/165 APs) | ✅ Closed. |
| Data health score | ✅ 91/100. Two deductions are post-launch scope. |
| Val Thorens launch-day narrative | 🔴 At risk. Depends entirely on VPS deploy. |
| Post-launch sprint order | ✅ Locked (tags → PRECACHE → dedup → photos → venues). |
