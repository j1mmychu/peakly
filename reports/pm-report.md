# Peakly PM Report v178 — 2026-10-12

**Status: 🔴 RED — VPS Day 64 (Oct 11–12 window ends TODAY. 6 days to Oct 18 launch, P0). `origin/master` footgun Day 6. Code freeze Day 28 clean.**

> **Stale prompt notice (Day 6):** Scheduled routine still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: 404 venues, 2 categories, Peakly Pro cut, Sentry live. Jack: update the cron task. 2 minutes. This is the sixth consecutive report generating false signal in the launch week.

---

## Shipped Since Last Report (v177 → v178)

| Commit | What | Right call? |
|--------|------|-------------|
| `c851ee9` | Content Oct 12 — 91/100, code freeze Day 28 clean, VPS SSH window may be missed | ✅ Accurate status. |
| `89b0858` | DevOps Oct 12 — RED, VPS Day 64, window missed, origin/master footgun Day 6 | ✅ Correct severity. |

**Zero app.jsx/sw.js/index.html commits. Code freeze Day 28. Correct.**

**VPS and master footgun: still not done. The Oct 11–12 window ends today.**

---

## Bug Triage

### P0 — VPS Redeploy: Day 64, 6 Days Left, Last-Chance Window Closes Today

The Oct 11–12 window was called in v175 as the final viable window before launch. Today (Oct 12) is the last day of it. This is not a projection — it is a countdown with a known end.

`server/proxy.js` is complete. The deploy is:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Look for: forecast_days:14 in weather response
```

10 minutes. What remains broken without it:

1. **Val Thorens (opens Oct 18 exactly)** — `forecast_days:14` needed to score its opening weekend on launch day. Without it, Day 7 scores `low` confidence and the venue disappears from the front page. The r/travel launch hook collapses.
2. **Open-Meteo rate ceiling** — disk cache not live. Launch traffic hits cold in-memory cache that wipes on restart. 429s on first impression.
3. **iOS native CORS blocked** — `capacitor://localhost` not in live allowlist. Every native API call fails.
4. **Alert deletion broken forever** — `DELETE` blocked at preflight. Silent failure since launch.

If this does not happen today, the next window is Oct 18 itself — launch day — with zero buffer and a cold cache.

### P1 — `origin/master` Footgun: Day 6

Still live. Still 511 commits behind main. Still triggers `deploy.yml`. An accidental push rolls the live site back to June 2026. 2-minute fix:

```bash
git push origin --delete master
git ls-remote --heads origin master  # confirm gone
```

Bundle with VPS. One SSH session. 12 minutes total including verification.

### P2 — Tag Depth (225/404 Venues, 55.7% at 2+ Tags)

`scoreVibeMatch` underperforms for 45% of catalog. Code frozen. First post-launch commit. Confirmed unchanged for 28 days.

### P2 — SW PRECACHE Babel Mismatch

`const PRECACHE = []` inconsistency. Code frozen. Post-launch. Day 8 unchanged.

### P3 — Gili Trawangan Duplicate

`beach_gilit` and `gili-trawangan` same island. No crash. Post-launch.

---

## Three Product Decisions — Oct 12

### Decision 1: VPS deploys today or the launch date is Oct 25.

There is no middle option. "Launching Oct 18 without the VPS deploy" is not a launch scenario — it is shipping with Val Thorens off the front page on the exact day it opens and with a cold cache hitting launch traffic. Both outcomes generate Reddit comments that hurt more than a one-week delay.

**DECISION: If VPS is not deployed by end of day Oct 12, launch shifts to Oct 25. The r/travel post does not go out Oct 18. Jack: the decision is whether to do 10 minutes of SSH work today.**

### Decision 2: The r/travel post draft is due today, not Oct 17.

The post goes live Oct 18. A post written the day of launch goes live with weak hooks, typos, and no time to reconsider the CTA. The draft should exist by end of Oct 12, reviewed Oct 16–17, published Oct 18.

The structure is locked from v177: one hook sentence ("What's the skiing like from your airport this weekend?"), one CTA (tap the link), no secondary asks. Write the body today.

**DECISION: r/travel post draft written by end of Oct 12. Jack owns this. It is a 30-minute task.**

### Decision 3: claude/ branch cleanup is post-launch, but one rule applies before Oct 18.

16+ active `claude/` branches exist on origin. Correct call from v177: all frozen until after Oct 18. But one additional rule: Jack does not open any new code sessions against `main` before launch. Any code change — however small — risks breaking the freeze. The only permitted pre-launch code action is the VPS `scp` + `pm2 restart`, which touches no files in the repo.

**DECISION: No code changes to main before Oct 18. The only permitted pre-launch action is the VPS deploy (which changes zero repo files). If a bug is found in the next 6 days, it waits unless it is a P0 crash.**

---

## This Week's Top 3

1. **Jack: VPS deploy + delete `origin/master` — TODAY. Last window. 12 minutes.** If it slips past Oct 12, launch date moves to Oct 25.
2. **Jack: Write the r/travel post draft — TODAY.** 30 minutes. Val Thorens opening weekend is the hook. One CTA. Write it while you have attention.
3. **Jack: Update cron prompts (PM/DevOps/Content).** 5 minutes. Six consecutive reports generating "182 venues" noise. Update it once, stop the noise for launch week.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any code change before Oct 18 | Code freeze. Non-negotiable. |
| Merging any `claude/` branch to main | Exploratory, unvetted, freeze risk. Post-launch. |
| New venue additions before launch | Post-launch sprint: tags → PRECACHE → dedup → photos → venues. |
| JSON-LD / structured data / h1 fallback | SEO gap but not a launch blocker. Post-launch. |
| Peakly Pro pricing fix ($9/mo vs $79/yr) | Pro is cut for v1. No one sees this price. Non-issue. |
| S.hem ski venue removal (going off-season) | Algorithm handles season gating correctly. No code change. |
| Alert improvements / UX fixes from claude/ branches | Freeze. Everything waits until Oct 19+. |

---

## One Product Risk Nobody Is Talking About

**Val Thorens opens Oct 18 — the same day as the launch — and there are currently 15 venues with `lateSeason:true`, meaning early-season scoring is intentionally permissive for them. If even one of those 15 venues scores incorrectly high on launch day (early-season snow data thin, score padded by the `lateSeason` bypass), a user who flies there based on Peakly's recommendation and finds bad conditions will post about it in the same r/travel thread driving the launch. One bad-conditions complaint in the launch thread is survivable. Two is a thread pattern. The `lateSeason` logic was written in May and has never been load-tested against early-October opening-day data. This is worth one manual check of the top 5 `lateSeason` venues before Oct 18 — not a code change, just Jack opening the app and verifying their scores look honest.**

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K users) | 8K requires VPS live, Val Thorens front-page on Oct 18, clean first impressions. 5K doesn't need VPS. The gap is still `forecast_days:14`. |
| VPS deploy | 🔴 P0. Day 64. Window ends today. |
| `origin/master` deleted | 🔴 P1. Day 6. Same SSH session as VPS. 2 minutes. |
| Code freeze | ✅ Day 28 clean. 6 days to launch. |
| VENUES count (404) | ✅ 134 skiing / 270 beach. |
| lateSeason:true (15 venues) | ✅ Confirmed via eval. |
| BASE_PRICES (165/165 APs) | ✅ Closed (Open #22). |
| Data health score | ✅ 91/100. Two deductions are post-launch scope. |
| Val Thorens launch-day narrative | 🔴 At risk. Entirely dependent on VPS deploy happening today. |
| r/travel post draft | 🔴 Not started. Should be written today, Oct 12. |
| Post-launch sprint order | ✅ Locked: tags → PRECACHE → dedup → photos → venues. |
| lateSeason early-season score sanity | ⚠️ Unverified. Manual check recommended before Oct 18. |
