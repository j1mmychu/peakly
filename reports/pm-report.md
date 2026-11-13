# Peakly PM Report v210 — 2026-11-13 (LAUNCH DAY +26)

**Status: 🔴 RED — VPS KNOWN-BROKEN (Day 97). App Review hard stop TODAY (Nov 14 is tomorrow — submit today). Whistler opens in 8 days. Thanksgiving in 8 days.**

> **Stale prompt notice — Day 38 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v209 → v210)

| Commit | What | Right call? |
|--------|------|-------------|
| `3318120` | DevOps report Nov 13 — VPS Day 97, App Review hard stop TODAY, cache 13d stale | ✅ routine |
| `65457b3` | Content report Nov 13 — CLEAN (404 venues), Thanksgiving 8d out, lateSeason 15 | ✅ routine |

**27 consecutive days with zero app code commits.** Correct. No code churn until App Review resolves.

---

## Overnight Activity

No app code changes. Two reports, same message:

- **DevOps (Red):** VPS Day 97. Cache stamp 13 days stale. App Review hard stop classified as "Nov 14 IS TODAY" (meaning submit Nov 13 or tomorrow is the absolute wall). Bracket-walk/eval discrepancy (406 vs 404) confirmed as bracket-walk overcounting nested objects — 404 is correct.
- **Content (88/100 Clean):** 404 venues, 0 integrity issues. Thanksgiving window opens in 8 days. Thin-tag 225 venues Day 14 — still deferred, still right.

**New branches from prior exploratory sessions (unchanged from v208/v209):** 15 stale `claude/*` branches plus `fix-appjsx-final`, `restore-appjsx`, `cursor/finish-peakly-ship-c015`, `master`, `test-small`. Delete after App Review resolves. Nothing to merge.

---

## Bug Triage

### 🚨 P0-A — App Review Guideline 2.1 reply: SUBMIT TODAY.

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Paste-ready reply:** `docs/APP_REVIEW_NOTES.md`
**Time required:** 10 minutes in App Store Connect.

This is not a code change. It is a copy-paste action. It has been ready for weeks.

**Window math as of Nov 13:**
- Submit today (Nov 13) → review 1–3 days → app live Nov 14–16 → **11–13 days before Thanksgiving ski window** ← still workable
- Submit tomorrow (Nov 14, hard stop) → app live Nov 15–17 → **9–11 days** ← marginal
- Submit Nov 15+ → Thanksgiving is effectively gone. Organic discovery during the most important ski weekend of the year happens without Peakly in the App Store.

**This is the only thing that matters today.**

### 🚨 P0-B — VPS Redeploy: Day 97. Whistler opens in 8 days.

No movement since Aug 11. Eight days to Whistler. The two most important ski traffic events of the year arrive while two-weekend scoring is broken.

**Active live breakage (unchanged):**
1. `forecast_days=7` → ski venues drop off front page beyond day 6 → peak ski traffic, invisible ski venues
2. `capacitor://localhost` missing from CORS → iOS shows zero live weather/flight data
3. `DELETE` missing from allowed methods → alert deletion silently fails
4. `_wxCache` in-memory → `pm2 restart` wipes cache → cold traffic spike risks Open-Meteo rate ceiling

**Fix — 10 minutes SSH (Jack only):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Verify `forecast_days:14`. No `npm install` needed.

**Hard deadline: Nov 20.** That's 7 days. If this doesn't happen before Whistler opens, ski venue scoring is broken during the highest-discovery-probability weekend of the year.

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 14.

Delete in GitHub UI → Branches. Two clicks each. No code risk. No downside. Still not done.

### P2 — Cache stamp `20261031a`: Day 13 stale.

DEFER. Auto-bumps on next app.jsx commit. No action needed until code lands.

### P2 — 21 stale non-main/master branches.

DELETE post-App Review. Only `fix-appjsx-final` and `restore-appjsx` are urgent deletes (rollback risk).

---

## This Week's Top 3 Priorities

**#1 — Submit App Review reply. Due: TODAY (Nov 13). Hard stop tomorrow (Nov 14).**
`docs/APP_REVIEW_NOTES.md` → App Store Connect → paste. 10 minutes. Everything else is irrelevant until this is done. If this goes into another day, the Thanksgiving window math breaks down beyond recovery.

**#2 — VPS Redeploy. Due: Nov 20 (Whistler opens Nov 21).**
Same 10-minute SSH action. Seven days left. This is the second most critical action. It follows App Review submission — not before, not instead of.

**#3 — Delete rollback bomb branches + stale branch cleanup.**
`fix-appjsx-final`, `restore-appjsx` → delete immediately. Remaining 19 `claude/*` and other stale branches → delete after Reddit launch. Housekeeping, but the rollback bombs are live risk.

---

## Explicit Product Decisions

**Decision 1: Peakly Pro ($9/mo vs $79/yr discrepancy) — CUT. Still cut.**
Stored cron prompt keeps flagging this. Pro UI was removed April 2026. No pricing is showing anywhere in the live app. Stale prompt artifact, not a live bug. Update the cron prompt. Do not build Pro until after 1K MAU.

**Decision 2: Post-launch monitoring plan — SHIP before Reddit post.**
When the Reddit post goes up, real user issues will surface that no audit caught. Jack needs a 1-page monitoring checklist: Sentry error rate, Plausible drop-off at key funnel steps, VPS `/health` for `wx_cache_size` and uptime, Open-Meteo rate limit warnings. This takes 30 minutes to draft and prevents "conditions unavailable" from being the first impression 500 users get. It needs to exist before the Reddit post, not after. No agent can build this — it requires Jack's access to Sentry/Plausible dashboards.

**Decision 3: 225 thin-tag venues — DEFER to week after Reddit launch.**
Tags affect search corpus, not scoring. Zero impact on Thanksgiving traffic or App Store review. This can wait.

**Decision 4: JSON-LD structured data + static h1 fallback — SHIP in sprint 1 post-App-Review.**
~2–4 hours total, 10–20% organic SEO lift on venue-name searches. No App Review risk. Bundle into the first post-review code sprint. Not before.

**Decision 5: Branch cleanup (non-rollback-bomb stale branches) — DEFER to post-Reddit.**
19 stale branches are noise, not risk. The `fix-appjsx-final` and `restore-appjsx` exceptions are P0-C above.

---

## Features Rejected This Week

- **Loading screen enhancement** (`claude/enhance-loading-screen-rZ1dc`): Zero user complaints about loading screens. No data showing this causes bounce. With App Review pending and no live users, this is pure aesthetics at the wrong moment. REJECTED — no signal, wrong timing.
- **Scoring system improvement** (`claude/improve-scoring-system-XYGY6`): Scoring is not frozen, but changes without an algorithm audit are prohibited per CLAUDE.md. No audit has been run. REJECTED — process, not now.
- **Front page redesign** (`claude/redesign-front-page-EndKs`): With App Review pending and 27 days of no code commits, any visual redesign introduces regression risk and restarts the App Review clock if it touches UI. REJECTED — wrong timing.
- **UX review** (`claude/review-peakly-ux-UQ0Qu`): Without real user data (Plausible drop-off analysis), UX hunches are speculation. Post-Reddit launch, we'll have signal. REJECTED — no data yet.
- **Scoring system improvement** + **Loading screen** combined: Both are "make it nicer" work in a week where the app isn't even in the App Store yet. REJECTED.

---

## Success Criteria

**90-day projection from Reddit launch (target: Reddit post Nov 21–25):**
- **5K users:** App Store live by Nov 20, VPS deployed before Whistler, Reddit post in November
- **8K users:** App Store live by Nov 15, VPS deployed before Whistler, Reddit post Nov 21–22 (Whistler opening + Thanksgiving convergence hook), one organic share or media pickup

**What has to be true for 8K, not 5K:**
1. App Review reply submitted today → app live by Nov 14–16 → 10–12 days of Thanksgiving window in the App Store
2. VPS deployed by Nov 20 → two-weekend scoring works during Whistler opening weekend
3. Reddit post timed to Nov 21 (hook: "Whistler just opened — here's where the best weekend conditions are right now")
4. Post-launch monitoring catches and resolves any P0 within 24 hours of Reddit spike
5. No "conditions unavailable" banner greeting the spike (requires disk cache fix — Open #23 — bundled with VPS redeploy)

**Current trajectory:** Both unresolved P0s are 10-minute Jack actions. The gap between 5K and 8K is execution, not engineering.

---

## One Product Risk Nobody Is Talking About

**The Thanksgiving timing is tighter than it looks from the outside.** The "Thanksgiving window" means US users planning ski weekends for Nov 27–30. That planning window opens ~7–10 days before — meaning Nov 17–20. App Store review takes 1–3 days. If the reply goes in today (Nov 13), the app could be live by Nov 14–16, which puts it inside the planning window. If the reply goes in Nov 15, the app is live Nov 16–18 — still marginally inside. But Thanksgiving is not just a ski discovery event — it's the first weekend many users will check Peakly to see if Whistler is worth flying to. If the app isn't in the App Store when that search happens, those users go to OnTheSnow and don't come back. The window to capture first-weekend ski users who become habitual Peakly users is exactly now. The delay isn't just "fewer downloads" — it's lower LTV because the habitual use case (checking every weekend) doesn't form without the first emotional hit.

---

*Next report: v211, 2026-11-14. If App Review has been submitted, the status changes to AMBER. If VPS has been redeployed, it changes to GREEN on that item.*
