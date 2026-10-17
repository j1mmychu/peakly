# Peakly PM Report v183 — 2026-10-17

**Status: 🔴 RED — LAUNCH EVE. T-1. VPS Day 69 still undeployed. Val Thorens opened today. `origin/master` footgun Day 11. Code freeze Day 33 clean.**

> **Stale prompt — Day 11 (critical at T-1):** Stored cron still injects "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: 404 venues, 2 categories, Pro cut, Sentry live. Jack: this is a 2-minute cron edit. At T-1 it's actively misleading launch-week analysis.

---

## Shipped Since Last Report (v182 → v183)

| Commit | What | Right call? |
|--------|------|-------------|
| `eaa59cb` | Content Oct 17 — 91/100, Val Thorens opens today | ✅ |
| `c797686` | DevOps Oct 17 — RED, VPS Day 69 launch eve | ✅ |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 33. Correct. The product is ready.**

Val Thorens opened **today** (Oct 17). Without the VPS deploy, it does not appear on the Peakly front page. The r/travel hook — "Opening weekend in the French Alps" — evaporates if the fix isn't live before launch tomorrow.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 69 — **LAST CALL** 🚨

Launch is tomorrow, Oct 18. This is not "getting urgent." It is the day. Either the VPS ships today or we launch degraded and tell users week 1 that the headline feature (two-weekend scoring) is broken.

**What breaks tomorrow without this:**

| Feature | User-facing reality |
|---------|---------------------|
| Two-weekend scoring | Disabled. `forecast_days: 7` on the running VPS. Front page shows one weekend window, not two. Val Thorens filtered as `confidence: "low"`. The entire launch narrative fails. |
| iOS App Store users | CORS error on every proxy call. `capacitor://localhost` missing from running VPS. iOS launch = broken iOS. |
| Alert deletion | Silently fails. User taps delete, UI confirms, server keeps the alert. `.catch(()=>{})` hides it. Day-1 user retention damage. |
| Reddit spike | Cold `_wxCache` on `pm2 restart` + traffic spike = Open-Meteo rate-limited in under 5 minutes. Every user from r/travel link gets "conditions unavailable." |

All four fixes are in the committed `server/proxy.js`. The fix is a file copy and a process restart:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Confirm: `forecast_days: 14`, `disk_cache: "enabled"`, `apns: "configured"`.

### P0-B — `origin/master` Footgun: Day 11 — **30 seconds** 🚨

50 commits behind `main`. `deploy.yml` deploys both branches. An accidental push to `master` tomorrow during launch chaos rolls the live site back to May. First signal: users report broken venues and wrong venue counts while the r/travel post is live.

```bash
git push origin --delete master
```

This cannot wait. Do it before or immediately after the VPS session.

### P1 — r/travel Draft: Conditional on VPS

Val Thorens hook is alive today. But the post cannot go out if the front page doesn't show Val Thorens — which requires the VPS deploy. The logical sequence:
1. VPS ships today
2. Draft written tonight (30 minutes)
3. Post goes live tomorrow morning before peak Reddit traffic (10am–2pm ET)

If VPS slips to tomorrow: move Reddit to Oct 21. Product launch (App Store + organic SEO) proceeds Oct 18 either way.

### P2 — SW PRECACHE Mismatch: Day 13

`sw.js` precaches `app.jsx`; production serves `dist/app.min.js`. Post-launch sprint. Code freeze blocks — correct to leave it.

### P2 — Gili Trawangan Duplicate

`beach_gilit` (LOP) + `gili-trawangan` (DPS) — same venue, two IDs. Confirmed by Content. Code freeze blocks — post-launch sprint, one surgical delete.

### P3 — lateSeason Count Discrepancy

DevOps grep returns 10; Content bracket-counting returns 15 (10 unquoted + 5 quoted-key format). Content is authoritative. **15 venues confirmed.** CLAUDE.md is correct. DevOps grep is the unreliable counter (the lesson from the venue-count debacle). No action needed.

---

## Three Product Decisions — Oct 17

### Decision 1: VPS ships today or we publicly set launch expectations.

This is the 70th day this has been flagged. The product is code-frozen and waiting. The VPS fix is already written. The window is today.

**DECISION: Jack deploys the VPS today before midnight, OR we announce to the first wave of users that two-weekend scoring, iOS native, and alert deletion will be fixed within 48 hours of launch. No third option. Pick one.**

### Decision 2: r/travel post gates on VPS confirmation, not on the calendar.

The Val Thorens opening-day hook is real and timely. But running the post while Val Thorens doesn't surface on the Peakly front page is worse than silence — the first user who checks will reply publicly that the product doesn't show what the post promises.

**DECISION: r/travel post ships if and only if `curl https://peakly-api.duckdns.org/health` returns `forecast_days: 14` before tonight. If not, Reddit launch moves to Oct 21. App Store + organic proceeds Oct 18 regardless.**

### Decision 3: Branch protection on `main` activates today.

16 `claude/` branches exist on origin. Zero code review process. An accidental merge during launch-day chaos is undetectable until users report regressions. The fix is a GitHub settings toggle — "Require PR approvals before merging" on `main`.

**DECISION: Enable branch protection on `main` before Oct 18. 30 seconds in GitHub repo settings → Branches → Add rule for `main`. Require 1 approval. This is not optional at launch.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy** — `scp + pm2 restart`. TODAY. Not tomorrow. Today.
2. **Delete `origin/master`** — 30 seconds. Do it during the VPS SSH session.
3. **Write and schedule the r/travel post** — conditional on #1. 30 minutes. Draft tonight, post tomorrow 10am ET.

---

## Features Rejected This Week

- **Venue photos sprint** (Open #20) — DEFER. Code freeze holds. Photos are the biggest remaining quality gap but zero users exist yet to notice them. Post-1K-users task.
- **Gili Trawangan duplicate fix** — DEFER. One-line surgical delete but code freeze is 33 days clean. Break the freeze for a P2 data issue 24 hours before launch? No.
- **Tag expansion (225 venues with 2 tags)** — DEFER. Post-launch sprint. Affects search recall and vibe matching but invisible to a first-time user who doesn't know what the app is yet.
- **JSON-LD structured data** — DEFER. SEO compounds over months, not days. Week 2 task after the launch spike settles.

---

## Success Criteria

**What defines success at 90 days:**
- 5K–8K users: achievable via organic SEO + r/travel + App Store discovery
- 8K (not 5K) requires: a r/travel post that lands in the top 5 of the thread + Val Thorens on the front page on opening weekend + iOS App Store live within 2 weeks of web launch
- Leading indicator: Plausible shows >200 unique visitors in the first 48 hours post-Reddit

**What has to be true for 8K:**
1. VPS is live before the r/travel post — Val Thorens needs to surface
2. r/travel post goes up Oct 18–19 (opening weekend energy is real, it decays fast)
3. App Store submission happens this month (Oct 18–31 window; App Store review takes 1–3 days)

**90-day projection unchanged: 5K–8K.** The delta between 5K and 8K is almost entirely VPS + the r/travel post timing. Both are in Jack's hands today.

---

## One Product Risk Nobody Is Talking About

**The Plausible analytics event taxonomy is untested under real traffic.** Every conversion funnel decision for the next 90 days will be made from Plausible data. But `book_click`, `alert_registered_server`, `scoring_explainer`, `install_pwa`, `cloud_sync` events have never fired at scale — only in development. A misconfigured domain, an adblocker hitting >40% of users, or a Plausible event that doesn't trigger in the prod esbuild build (Babel-stripped) could leave the team navigating blind. Before the r/travel post goes live, verify one real `book_click` event fires in the Plausible live view. It's a 2-minute manual check. Without it, 90 days of data could be garbage.
