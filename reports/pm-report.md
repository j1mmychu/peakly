# Peakly PM Report v206 — 2026-11-09 (LAUNCH DAY +22)

**Status: 🔴 RED — VPS KNOWN-BROKEN (Day 93). App Review reply still not submitted. 12 days to Whistler. 17 days to Thanksgiving.**

> **Stale prompt notice — Day 34 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v205 → v206)

| Commit | What | Right call? |
|--------|------|-------------|
| `60590e3` | DevOps report Nov 9 — VPS Day 93, `.venue-baseline` false alarm | ✅ routine |
| `c48fd68` | Content report Nov 9 — CLEAN (404 venues), BASE_PRICES 100% | ✅ routine |

**23 consecutive days with zero app code commits.** Still correct — no agent should be touching code without Jack's signal. The two human-gated blockers (App Review reply, VPS redeploy) have not moved.

---

## Overnight Activity

Two routine reports, one false alarm to correct:

- **DevOps:** Flagged `scripts/.venue-baseline` as MISSING (new P0). **This is a false alarm.** The file exists on origin/main (`scripts/.venue-baseline` = 404, last modified Nov 7). DevOps ran against a local checkout that hadn't pulled from origin — the stale-checkout class of error this file explicitly warns against in the git-fetch-first section. Actual state: venue guard is intact. No action required.
- **Content:** Data CLEAN. 404 venues, 0 integrity issues, all audits green. No change.
- **VPS:** Day 93. No movement. Second day past the Nov 7 deadline Jack set.

---

## Bug Triage

### P0-A — App Review Guideline 2.1 reply: STILL NOT SUBMITTED. 🚨

Submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e` is waiting on Jack. Paste-ready reply is in `docs/APP_REVIEW_NOTES.md`.

**Thanksgiving window math (Day +22):**
- Submit today (Nov 9) → review 1–3 days → app live ~Nov 10–12 → **~14–16 days before Thanksgiving**
- Submit Nov 12 → app live ~Nov 13–15 → ~11–13 days
- Submit Nov 15 → app live ~Nov 16–18 → ~8–10 days — now a material conversion loss
- Submit Nov 20 → app live ~Nov 21–23 → Whistler's opening weekend, 3–5 days before Thanksgiving — barely counts

Thanksgiving is Nov 26. App Review is 1–3 days. The useful window for capturing Thanksgiving discovery traffic closes around Nov 17. That is 8 days from today.

### KNOWN-BROKEN — VPS Redeploy: Day 93. No new deadline. 🔧

What is broken right now:
- **Two-weekend scoring** — Whistler opens Nov 21. Day-of visitors will see 1-week weather windows, not the Fri–Mon best-of-4 score that is Peakly's actual product.
- **Alert deletion silently fails** — user deletes alert, it stays on server, keeps pushing.
- **iOS native CORS-blocked** — every weather/flight call from the native app is rejected.
- **No disk cache** — post-Reddit traffic spike blows Open-Meteo free tier ceiling.

Fix is 10 minutes via SSH:
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

### P0-C — `fix-appjsx-final` rollback bomb: Day 10. Still not deleted.

Branch has no common ancestor with main. Merging via GitHub UI rewrites all commit history. Same for `restore-appjsx`.

**Delete now:** GitHub → Branches → `fix-appjsx-final` → Delete. Same for `restore-appjsx`. Two clicks each.

### P2 — DevOps stale-checkout methodology: needs process note.

DevOps falsely flagged `.venue-baseline` MISSING today because it ran without pulling from origin/main first. This is exactly the error CLAUDE.md's "git fetch FIRST" section exists to prevent. The DevOps agent prompt (`tasks/agents/devops.md`) should start with the same `git fetch && git log --oneline -3 origin/main` gate that this prompt uses. Not a code fix — a prompt fix for Jack.

### P2 — Cache stamp `20261031a` — Day 9 stale.

Auto-bumps on next app.jsx commit. No action until code ships.

### P2 — 19 unmerged branches on origin.

Rollback bombs first. Mass-delete `claude/*` experiments after Reddit launch.

### CLOSED — Open #22 BASE_PRICES Coverage

100% confirmed. Remove from CLAUDE.md Open Items on next app.jsx commit.

---

## This Week's Top 3 Priorities Only

**1. Jack: Submit App Review reply. (30 min — today, Nov 9).** The paste-ready text is in `docs/APP_REVIEW_NOTES.md`. Thanksgiving window math: submit today and there are ~14–16 days of iOS App Store coverage before the holiday. Wait until Nov 17 and that collapses to under a week. This is the highest-leverage action available to the product right now.

**2. Jack: VPS redeploy. (10 min — before Nov 21).** Two-weekend scoring is broken. Whistler opens in 12 days. That is the natural Reddit post hook. Post without fixing VPS and the day-of experience is broken on the product's signature feature.

**3. Jack: Delete `fix-appjsx-final` and `restore-appjsx` on GitHub. (2 min — anytime).** These are live rollback bombs on origin. No merge analysis needed — they have no common ancestor with main. Delete them, then assess the data-quality fixes separately if warranted (cherry-pick onto main, open a normal PR).

**Nothing else ships this week. No new features, no experiments, no branch work.**

---

## Explicit Product Decisions This Run

**DECISION 1: DevOps `.venue-baseline` MISSING flag — FALSE ALARM.** File is present and correct. This was a stale-checkout artifact in the DevOps agent. No action on venue guard. DevOps agent prompt should be updated to run `git pull` before analysis.

**DECISION 2: S-hemisphere ski dead weight (23 venues) — DEFER past v1.** Content flagged these 23 out-of-season venues as dead weight until May. They are not wrong — they're correctly scored out of season. Removing them pre-launch adds risk with zero user benefit. Post-launch, if analytics show zero engagement on them during their off-season, remove in a batch. Not now.

**DECISION 3: 225 thin-tag venues — DEFER past Reddit launch. Day 10.** Same decision, 10th day running. No new data changes this. Post-Reddit, with traffic data, prioritize by actual demand.

---

## Success Criteria Check

**90-day projection: 5K–8K users. The 8K path requires action in the next 8 days.**

| Action | Deadline | Impact if missed |
|--------|----------|-----------------|
| App Review reply | Nov 17 (material) | No iOS at Thanksgiving |
| VPS redeploy | Nov 21 (Whistler opens) | Broken scoring on Reddit launch day |
| Reddit post | Nov 21 (Whistler hook) | Loses the season-opening natural hook |

**Updated projections:**

- App Review submitted today + VPS before Nov 21 + Reddit Nov 21 → **7K–8K**
- App Review submitted this week + VPS before Nov 21 + Reddit Nov 21 → **6K–7K**
- VPS only + Reddit Nov 21 (no iOS) → **4K–5K** (web-only Thanksgiving, no App Store discovery)
- No action by Nov 21 → **3K–4K** (Reddit post without iOS, without correct scoring)

The delta between the 8K and 4K path is entirely Jack's App Review reply and SSH command. Combined: 40 minutes of work.

---

## One Product Risk Nobody Is Talking About

**The Whistler opening and App Review could both resolve in the same 72-hour window — and nobody is ready for that.**

If Jack submits the App Review reply today, the app could go live ~Nov 11–12. VPS redeploy happens the same day. Reddit post fires Nov 21 (Whistler opening, correct scoring, iOS live). All three things go right at once.

The risk: the first wave of users hits a product with 23 stale S-hemisphere ski venues that score 0 this time of year, 225 venues with thin tags that produce weak explore-feed signals, and a photo catalog that's still ~346 generic shots. The _scoring_ will be right. The _product quality_ behind the scoring will not.

The one fix worth doing before Reddit: a 30-minute pass to verify the top 10–15 venues that will naturally surface on Whistler opening weekend (Whistler, Mammoth, Verbier, Chamonix, Zermatt, Val-Thorens, Tignes) have accurate photos and tags. Not all 346 — just the 10–15 that will be in the first viewport of anyone who opens the app that weekend. If those look right, the first impression is right. That's 80/20 on photo quality.

This report has mentioned photos as a gap since v1. The difference now: we have a specific date (Nov 21), specific venues (the lateSeason opening cohort), and specific first-impression stakes (Reddit launch). The abstract "346 venues have generic photos" finding becomes "7 specific venues will be front-and-center on the most important day of the year — are those 7 right?"

---

*Next report: 2026-11-10. Tracking: App Review reply (did it go in today?), VPS (11 days to Whistler). Both are Jack-only. The Thanksgiving window does not wait.*
