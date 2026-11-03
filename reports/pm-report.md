# Peakly PM Report v200 — 2026-11-03 (LAUNCH DAY +16)

**Status: 🔴 RED — Zero app code commits for 4 consecutive days. VPS Day 87, 4 days to Nov 7 deadline. App Review Guideline 2.1 reply still pending Jack. 21 unmerged branches. Whistler opens in 18 days. The product ships broken ski scoring for its flagship venue unless two manual tasks get done this week.**

> **Stale prompt notice — Day 28 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v199 → v200)

| Commit | What | Right call? |
|--------|------|-------------|
| `0ff4d8b` | Content report Nov 3 — 88/100, CLEAN, 225 thin-tag venues | ✅ routine |
| `85a86a4` | DevOps report Nov 3 — RED, VPS Day 86, 4 days, brace check suspicious | ✅ routine |

**Four consecutive days with zero app code commits.** Correct call — nothing to ship until the two human gates clear. But the clock is running.

---

## Overnight Activity: What Changed

### New: 21 branches on origin (was 20 yesterday).

A new `claude/*` branch appeared overnight. These automated branches are not a coding resource — they're a liability. Every one is a potential accidental merge vector and they add noise to every `git fetch`. The branch count has grown from 18 (Oct 30) to 21 in 4 days despite zero intentional feature work.

**Specific footgun elevated to P0:** `origin/fix-appjsx-final` is 597 commits on a May 13 base. It was created by an automated session and has never been reviewed for merge. An accidental `git merge fix-appjsx-final` would silently overwrite 5 months of commits — dropping the beach category pivot, all 404 venues, PR #20's App Store fixes, and the scoring rewrite. This cannot be recovered without a force-push. It needs to be deleted **before** the VPS redeploy session, because that session involves SSH and git commands and a distracted operator is exactly the failure mode.

### DevOps flagged "brace balance suspicious — depth 5."

DevOps's checker returned a non-zero depth on `app.jsx`. This warrants a second look before the next code change. The Content and DevOps bracket-walkers have historically disagreed (they use different methods). Content reports 404 venues / CLEAN. The depth-5 reading is most likely a checker bug, not a real imbalance — the app renders fine in production and PR #20 passed the smoke test. But don't ship new code to `app.jsx` before manually verifying: `node -e "const s=require('fs').readFileSync('app.jsx','utf8');let d=0,m=0;for(const c of s){if(c==='{')d++;else if(c==='}')d--;if(d<0){console.log('negative depth');process.exit(1);}m=Math.max(m,d);}console.log('final depth',d,'max',m);"` should return `final depth 0`.

### Cache stamp `20261031a` — Day 4 stale. Not actionable today.

No app code shipped. The auto-push hook will bump it on the next `app.jsx` commit. Not a user-facing issue — users aren't seeing stale JS because nothing changed. Stop treating this as a finding.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 87. Nov 7 = **4 days.** Whistler opens Nov 21 = **18 days.** 🚨

**This is the launch gate.** The `server/proxy.js` changes that enable two-weekend scoring (`forecast_days` 7→14), fix iOS CORS, fix alert deletion, and fix the rate limiter have been committed for 85+ days. They are sitting inert on the VPS because nobody has run the scp command.

If Nov 7 passes without this: Whistler opens on Nov 21 with broken two-weekend scoring. That's the ski flagship on the ski app, in peak pre-season, right before any Reddit push. Every user who opens the app during ski season gets the wrong score. That's not a soft launch — that's a broken product at the moment it matters most.

**The complete task (Jack, 10 minutes):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, apns:configured
```

**Bundle with this (20 extra minutes, same SSH session):**
- Open #23: disk cache for `_wxCache` in `server/proxy.js`. ~30 lines. Prevents the Open-Meteo cold-start wipeout during the Reddit spike. If you restart pm2 and immediately 200 users hit it, they all go direct to Open-Meteo. That's a "conditions unavailable" first impression for the exact users you need to convert.

### P0-B — App Review Guideline 2.1 reply. 4 weeks and counting.

`docs/APP_REVIEW_NOTES.md` has the exact paste-ready text and recording shot list. Build 3 is staged. This is a 30-minute task:
1. Record screen on physical iPhone per shot list
2. Paste the reply from `docs/APP_REVIEW_NOTES.md` into the App Review page
3. Attach the recording
4. Select build 3 in App Store Connect

Every day this waits is a day the App Store slot is dark. Organic search and browse drives 30-40% of installs in this category. Zero App Store installs until this clears.

### P1 — `origin/fix-appjsx-final` — 597 commits, May 13 base, not closable by automation.

**Escalating to P0 co-priority.** This branch is an existential rollback risk on origin. Before the VPS SSH session, before any Reddit post, before any new feature work: Jack needs to go to GitHub → Branches → delete `fix-appjsx-final`. It cannot be merged, it should not be reviewed, and every day it sits there is a day a wrong branch checkout could nuke 5 months of work. 2 clicks.

### P2 — 21 unmerged branches

19 `claude/*` + `cursor/*` branches plus `restore-appjsx` and `test-small`. None are candidates for merge. Recommend: GitHub UI → Branches → delete all `claude/*`, `cursor/*`, `restore-appjsx`, `test-small` in a single sweep. ~15 minutes. Reduces noise and eliminates merge accidents.

---

## This Week's Top 3 Priorities Only

**1. Jack: Delete `fix-appjsx-final` on GitHub. (2 min)** Do this first — before the SSH session, before anything else. It's the only task that costs almost nothing but prevents a catastrophic accident.

**2. Jack: VPS redeploy + disk cache. (30 min, P0-A + P0/Open #23)** The scp command. The pm2 restart. The disk cache patch while you're in the file. The health check. Bundle Open #23 into the same session — you're already there.

**3. Jack: App Review Guideline 2.1 reply. (30 min, P0-B)** Record. Paste. Attach. Submit. `docs/APP_REVIEW_NOTES.md` has everything you need.

**Nothing else ships this week.** These three tasks unlock: App Store distribution, correct ski scoring for Whistler opening, Reddit launch viability, and a clean git state. Everything else is noise until these are done.

---

## Explicit Product Decisions This Run

**DECISION 1: Branch cleanup — SHIP (Jack, GitHub UI, this week).** 21 branches on origin is not a background item anymore. The `fix-appjsx-final` footgun is a P0 risk. Closing branches is not optional maintenance — it's launch hygiene. Target: `fix-appjsx-final` deleted today, all `claude/*`/`cursor/*`/`restore-appjsx`/`test-small` deleted this week.

**DECISION 2: Open #23 disk cache — SHIP, bundled with VPS redeploy.** This has been deferred for 85 days as "not urgent." It becomes urgent the moment the Reddit post lands. The cost to ship it is zero additional downtime (same SSH session, same pm2 restart). The cost to not ship it is a "conditions unavailable" first impression for every Reddit user who hits a cold cache after the restart. Bundle it.

**DECISION 3: New feature requests during the App Review wait — DEFER all.** The automated agents have spawned 15 `claude/*` branches covering UI redesigns, scoring improvements, UX rewrites, alert simplifications, and more. None of these should be reviewed, merged, or even read until the App Store slot is live and there are real users to validate against. Building features for zero users is waste. The product is good enough to convert users — it just needs to be in front of them.

---

## Success Criteria Check

**90-day projection: 5K–8K users. What gets us to 8K?**

The delta hasn't changed — it's still the same two tasks:

1. **App Store distribution live before Thanksgiving** — organic search discovery is the compounding channel. Every week the slot is dark is compounding installs lost, not just one week lost.
2. **VPS healthy through the Reddit spike** — a broken "conditions unavailable" first impression during the r/skiing post is a permanent reputation hit with the exact audience we need. It won't self-correct.

The 8K number requires both of these to land in the next 2 weeks. The 5K number is what happens if they land in December. The math is straightforward — this is a timing game, and the clock is visible.

**Current trajectory: 5K.** If both tasks clear this week: **8K is still achievable.**

---

## One Product Risk Nobody Is Talking About

**The automated agent branches are shipping to a branch graveyard, and someone is paying for all of it.**

In the last 10 days, at least 15 automated Claude sessions opened branches covering: UI redesigns, scoring system improvements, front-page redesigns, UX reviews, onboarding overhauls, profile simplifications, alert condensing, code review cleanup, test coverage analysis, venue standardization. None were merged. None were reviewed. None were requested by Jack.

These sessions consume tokens (Anthropic billing), write code nobody reads, and leave branches that are an active merge risk. The cursor session (`cursor/finish-peakly-ship-c015`) suggests another AI tool was also pointed at the repo.

**The product risk: the codebase is being worked on by agents who don't share context.** If even one of these sessions ships something to main before Jack reviews it, the live site could regress. The `deploy.yml` triggers on push to main — there's no human gate between "automated session pushes a commit" and "GitHub Pages serves it to real users."

The fix is not technical. It's access control: audit which scheduled routines have write access to this repo and whether any of them are configured to merge or push to main. The agent team (PM/DevOps/Content) should write reports only, never push app code.

---

*Next report: PM v201 — 2026-11-04*
