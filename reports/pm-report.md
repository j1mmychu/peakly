# Peakly PM Report v207 — 2026-11-10 (LAUNCH DAY +23)

**Status: 🔴 RED — VPS KNOWN-BROKEN (Day 94). App Review reply still not submitted. 11 days to Whistler. 16 days to Thanksgiving.**

> **Stale prompt notice — Day 35 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v206 → v207)

| Commit | What | Right call? |
|--------|------|-------------|
| `3100249` | DevOps report Nov 10 — VPS Day 94, eval/content discrepancy flagged | ✅ routine |
| `59c445c` | Content report Nov 10 — CLEAN (404 venues), Thanksgiving window note | ✅ routine |

**24 consecutive days with zero app code commits.** Still correct. The two Jack-gated blockers have not moved.

**New finding today:** DevOps flagged `eval=406` vs `content=404` venue count discrepancy. Content has consistently verified 404 via two-format regex (unquoted + quoted keys) with no integrity issues (0 dup IDs, 406 lat/lon entries explained as 2 non-venue uses). The discrepancy is a methodology difference (eval vs. regex), not a data corruption issue. No action on venue count.

---

## Overnight Activity

Three signals, one new finding:

- **DevOps:** VPS Day 94. `.venue-baseline` MISSING Day 2 (see note below). +2 new branches on origin (`claude/analyze-test-coverage-WVIsT`, one more). Eval/content venue discrepancy flagged for first time — addressed above.
- **Content:** Data CLEAN. 404 venues, 0 integrity issues. Thanksgiving window note added.
- **New branches:** Two new `claude/*` experiment branches appeared overnight. These are **not ship candidates** — they are remote worktrees from agent sessions. Add them to the branch cleanup list.

**On `.venue-baseline` MISSING (Day 2 from DevOps):** This was confirmed as a false alarm yesterday (Day 1). File is present on origin/main. DevOps continues flagging it because its local checkout is running stale — it is not pulling from origin before analysis. This will continue to report MISSING until the DevOps agent prompt is fixed to run `git pull origin main` before analysis. File is real, guard is intact. No action on the data side.

---

## Bug Triage

### P0-A — App Review Guideline 2.1 reply: STILL NOT SUBMITTED. 🚨

Submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e`. Paste-ready reply: `docs/APP_REVIEW_NOTES.md`.

**Thanksgiving window math (Day +23) — now CRITICAL:**
- Submit today (Nov 10) → review 1–3 days → app live ~Nov 11–13 → **13–15 days before Thanksgiving** ← still strong
- Submit Nov 13 → app live ~Nov 14–16 → **10–12 days** ← acceptable
- Submit Nov 17 → app live ~Nov 18–20 → **6–8 days** ← marginal, misses organic discovery build-up
- Submit Nov 20 → app live Nov 21–23 → Whistler opening day at best — **not a Thanksgiving play anymore**

The window where iOS App Store contributes meaningfully to Thanksgiving traffic **closes around Nov 15**. That is 5 days from today.

### KNOWN-BROKEN — VPS Redeploy: Day 94. 🔧

No change from yesterday. Whistler opens in 11 days. What breaks on opening day without this fix:

1. Two-weekend scoring returns `confidence:low` for any venue beyond day 6 → half ski catalog invisible on front page
2. iOS native app: zero live weather/flight data (CORS)
3. Alert deletion: silently fails, ghost alerts keep firing
4. Post-Reddit spike: no disk cache → Open-Meteo rate ceiling breach

**Fix is 10 minutes:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
No `npm install`. Verify: `forecast_days:14` in health response.

### P0-C — `fix-appjsx-final` rollback bomb: Day 11.

Branch has no common ancestor with main. Merging via GitHub UI rewrites all commit history. Same for `restore-appjsx`.

**Delete now:** GitHub → Branches → delete `fix-appjsx-final` and `restore-appjsx`. Two clicks each. These branches existing on origin is a live risk every time anyone opens a PR UI.

### P2 — 21 branches on origin (+2 new overnight).

21 total. 2 new `claude/*` experiment branches appeared today. These are exploratory agent runs — not code reviews, not features, not candidates for merge. Add to mass-delete list post-Reddit.

**Branches by risk:**
- 🔴 DELETE NOW: `fix-appjsx-final`, `restore-appjsx` (rollback bombs, no common ancestor)
- 🟡 DELETE AFTER REDDIT: all `claude/*` (13 experiment branches), `cursor/*` (1), `test-small` (1)
- 🟢 KEEP: `main`, `master` (master stays until GitHub default branch is changed, then delete)

### P2 — Cache stamp `20261031a` — Day 10 stale.

Auto-bumps on next app.jsx commit. No action until code ships.

### P2 — DevOps agent running stale (`.venue-baseline` false alarm pattern).

DevOps prompt at `tasks/agents/devops.md` doesn't run `git pull origin main` before analysis. Generating false alarms. Jack: add `git fetch && git pull origin main` as the first step in that file. 2-minute fix that eliminates a recurring false-alarm class.

### CLOSED — Open #22 BASE_PRICES Coverage

100% confirmed. Removed from active tracking.

---

## This Week's Top 3 Priorities Only

**1. Jack: Submit App Review reply. (30 min — today, Nov 10).** The paste-ready text is in `docs/APP_REVIEW_NOTES.md`. Today is likely the last day to get iOS live with meaningful runway before Thanksgiving. Nov 15 is the practical deadline; submit today and you have a 5-day buffer for a re-review if Apple comes back with another question.

**2. Jack: VPS redeploy. (10 min — before Nov 21).** Whistler opens in 11 days. That is the natural Reddit post hook. Posting without fixing VPS means users experience broken two-weekend scoring on the product's most important seasonal event. The fix is committed and sitting in `server/proxy.js` — it just hasn't been copied to the VPS.

**3. Jack: Delete `fix-appjsx-final` and `restore-appjsx` on GitHub. (2 min).** These are live rollback bombs. No analysis needed — no common ancestor with main means they cannot be safely merged through any normal flow. Just delete them.

**Nothing else ships this week. No new features, no experiments, no branch work.**

---

## Explicit Product Decisions This Run

**DECISION 1: Eval=406 vs content=404 discrepancy — FALSE ALARM, NO ACTION.** DevOps flagged a methodology difference (eval counting all lat/lon objects including 2 non-venue uses vs. regex counting venue objects). Content confirms 404 venues with 0 integrity issues. No data fix needed.

**DECISION 2: 2 new `claude/*` branches — DEFER DELETION to Reddit launch.** `claude/analyze-test-coverage-WVIsT` and the other new branch are not live risks (unlike the rollback bombs). Add to the post-Reddit mass cleanup. No cherry-picking or PR work from these.

**DECISION 3: 225 thin-tag venues — DEFER past Reddit launch. Day 11.** Same call, 11th day. No new data changes this. Post-Reddit analytics will reveal which venues actually get traffic; enrich those first.

---

## Success Criteria Check

**90-day projection: 5K–8K users. The 8K path requires action in the next 5 days (not 8 — that was yesterday's number).**

| Action | Deadline | Impact if missed |
|--------|----------|-----------------|
| App Review reply | Nov 15 (practical hard stop) | No iOS at Thanksgiving — lose 30–40% of potential user base |
| VPS redeploy | Nov 21 (Whistler opens) | Broken scoring on Reddit launch day |
| Reddit post | Nov 21 (Whistler hook) | Loses the season-opening natural hook + built-up iOS installs |

**Projections (updated for Day +23):**
- App Review today + VPS before Nov 21 + Reddit Nov 21 → **7K–8K**
- App Review by Nov 13 + VPS before Nov 21 + Reddit Nov 21 → **6K–7K**
- VPS only + Reddit Nov 21, no iOS → **4K–5K**
- No action by Nov 21 → **3K–4K**

The delta between 8K and 4K is 40 minutes of Jack's time. This is not a build problem. It is a "do the two things" problem.

---

## One Product Risk Nobody Is Talking About

**The 7 lateSeason photos are probably wrong — and those 7 venues will be in every new user's first viewport on Nov 21.**

v206 raised the abstract version of this ("346 venues have generic photos"). Here's the specific version: Whistler, Chamonix, Mammoth, Verbier, Zermatt, Tignes, Val-Thorens are the venues that will naturally surface on Whistler opening weekend. If the app review clears, VPS is fixed, and Jack posts to Reddit on Nov 21, those 7 venues are what every new user sees first.

A "generic powder shot" on Whistler is not catastrophic — it's what every other ski app does. But there's one failure mode that is: if any of those 7 venues shows a photo of a *different mountain* (the 2026-07-24 session confirmed this was real — before the marquee-venue photo pass, photos were generic stock, not venue-specific), that's the first thing a Whistler local sees when they open the app. Local knowledge kills social proof.

The 2026-07-24 session applied real photos to 27 marquee venues including all 7 of the above. Verify those 7 are still on correct photos — a 10-minute grep of the photo URLs for those venue IDs against the Unsplash queries used. This is not a build task — it is a verification task.

If those 7 are correct, the first-impression problem is solved for Reddit launch day. The other 339 venues are a post-launch project.

---

*Next report: 2026-11-11. Tracking: App Review reply (did it go in? what day is it in review?), VPS (10 days to Whistler). Both are Jack-only. The window is 5 days.*
