# Peakly PM Report v204 — 2026-11-07 (LAUNCH DAY +20)

**Status: 🔴 RED — VPS deadline has officially PASSED (Nov 7 = today). App Review reply still pending. No app code in 21 days. Whistler opens in 14 days. Entering critical window.**

> **Stale prompt notice — Day 32 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice will stay in every report until it's fixed.

---

## Shipped Since Last Report (v203 → v204)

| Commit | What | Right call? |
|--------|------|-------------|
| `50711ad` | DevOps report Nov 7 — VPS Day 91, deadline PASSED, `fix-appjsx-final` Day 7 | ✅ routine |
| `1f78b47` | Content report Nov 7 — CLEAN (404 venues), lateSeason 15 confirmed, Day 8 thin-tag | ✅ routine |

**21 consecutive days with zero app code commits.** Still correct — no human-gated blockers have moved. No code should ship until VPS is redeployed and App Review is answered.

---

## Overnight Activity

Nothing changed. DevOps and Content filed clean routine reports. The lateSeason count discrepancy (DevOps said 10, Content said 15) is resolved — Content's eval-based method is authoritative, count is 15. Branch count dropped from 21 to 19 (two were deleted upstream).

**The Nov 7 VPS deadline expired unactioned.** This is the third missed deadline. As promised in v203, this report formally reclassifies the VPS status.

---

## Bug Triage

### P0-A — App Review Guideline 2.1 reply: STILL PENDING. This is now the last pre-launch gate. 🚨

The App Store submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e` is waiting for a reply. `docs/APP_REVIEW_NOTES.md` has paste-ready text. Thanksgiving window math:

- Submit reply **today (Nov 7)** → review 1–3 days → app live by Nov 8–10 → 18 days before Thanksgiving peak
- Submit reply **Nov 10** → app live Nov 11–13 → 14 days before peak
- Submit reply **Nov 14** → app live Nov 15–17 → 10 days before peak — this is where conversion materially suffers

Each day without a reply is 24 hours of Thanksgiving coverage gone. This is the highest-leverage 30-minute action in the product right now. Nothing else matters until this is submitted.

### KNOWN-BROKEN (formerly P0) — VPS Redeploy: Day 91. Deadline EXPIRED. Reclassified.

Per the commitment in v203: the VPS redeploy exits P0 treatment after Nov 7. It is now KNOWN-BROKEN. The product ships with these defects:

- Two-weekend scoring returns single-weekend data (second weekend silently empty)
- Alert deletion silently fails on all platforms
- iOS native CORS-blocked on flight/weather fetches
- Disk cache not live (pm2 restart wipes wx cache)

**This will visibly hurt the Whistler moment (Nov 21).** That is the consequence of three missed deadlines. It is documented. The fix remains: `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/ && pm2 restart peakly-proxy` — 10 minutes at any time.

The PM will note VPS status in every report. It won't set new deadlines for it.

### P0-C — `fix-appjsx-final` rollback bomb: Day 8. Still not deleted.

This branch forks from the **initial commit** and would silently overwrite 6 months of work if merged. It has been the top 2-minute action request for 8 days.

**Delete it:** GitHub → Branches → `fix-appjsx-final` → Delete. Same for `restore-appjsx` (same risk profile).

No new deadline. It's just sitting as a live landmine.

### P2 — Cache stamp `20261031a` — Day 8 stale.

Auto-bumps on next app.jsx commit. Not actionable until VPS redeploy triggers a cache bump anyway.

### P2 — 19 unmerged branches on origin.

`fix-appjsx-final` deletion first. Then mass-delete the `claude/*` experiments.

---

## This Week's Top 3 Priorities Only

**1. Jack: App Review reply. (30 min — today, Nov 7).** `docs/APP_REVIEW_NOTES.md` has the text. The Thanksgiving window is closing by 24h/day. Nothing else ships while the app is not on the App Store.

**2. Jack: VPS redeploy. (10 min — this weekend at latest).** It's KNOWN-BROKEN, not P0, but Whistler opens Nov 21 and the second-weekend scoring will be visibly wrong on the launch day Reddit post. The fix window before the Reddit moment closes Nov 21.

**3. Jack: Delete `fix-appjsx-final` on GitHub. (2 min).** A live rollback bomb sitting on origin for 8 days. Two clicks.

**Nothing else ships this week. No new features, no branch work, no experiments.**

---

## Explicit Product Decisions This Run

**DECISION 1: VPS redeploy is now KNOWN-BROKEN, not P0.** No more PM deadlines for it. It remains fixable in 10 minutes at any time. The consequence (wrong Whistler scoring on Nov 21 Reddit day) is documented. Jack's call.

**DECISION 2: 225 thin-tag venues — DEFER past Reddit launch.** Day 8 of this finding. Post-Reddit, with traffic data showing which venues are viewed, tag enrichment is prioritized by actual demand. Not before. DEFER is the same decision as yesterday and will be the same next week.

**DECISION 3: All `claude/*` branch work — FROZEN, do not evaluate or merge until post-Reddit.** The automated sessions (redesign-front-page, improve-scoring-system, improve-peakly-ui, simplify-alerts-page, streamline-onboarding, simplify-profile-page, condense-alert-page) are all pre-Reddit speculation produced with no user data. None of them ship. Post-Reddit, evaluate the 2–3 most-trafficked flows against real user behavior, then pick one to improve.

---

## Success Criteria Check

**90-day projection: 5K–8K users. The gap is narrowing.**

The 8K path required: (1) VPS by Nov 7, (2) App on App Store by Nov 8–10, (3) Reddit post Nov 21 (Whistler opening). Path (1) missed. Path (2) is still open today — if the App Review reply goes in now, the app can be live before Thanksgiving. Path (3) is still achievable.

**Current best-case trajectory with App Review reply submitted today:**
- App live ~Nov 9–11
- Reddit post Nov 21 (Whistler opening)
- Scoring partially correct (single-weekend, not two-weekend — Whistler won't show second weekend)
- Thanksgiving window: ~16–19 days of coverage
- Realistic: 6K–7K. 8K required the VPS too.

**Current worst-case trajectory without App Review reply this week:**
- App Store miss before Thanksgiving
- Reddit post web-only
- 3K–4K, primarily web PWA installs

---

## One Product Risk Nobody Is Talking About

**The 19 open branches are a morale and focus drain that compounds over time.**

Right now there are 19 unmerged branches on origin, most of them automated Claude experiments. Each one represents a path not taken. Each automated session that produces a "redesign-front-page" or "improve-scoring-system" branch adds cognitive overhead: someone has to look at it, evaluate it, decide whether to merge or delete it. That overhead accumulates.

More concretely: the next human who touches the GitHub repo will see 19 branches suggesting that work is in flight across multiple directions simultaneously. It signals chaos, not launch focus. When Jack goes to submit the App Review reply or demo the app to a potential partner, those branches are visible.

Delete the rollback bombs this week. After Reddit launch (not before), do a 30-minute branch cleanup: evaluate the automated work in bulk, cherry-pick anything genuinely useful onto a single PR, delete the rest. The branches should reflect what's actually shipping, not what automated sessions thought might be interesting.

---

*Next report: 2026-11-08. Tracking: App Review reply status (did it go in?), VPS (did it get fixed before Whistler?). Both are Jack-only. This report can only observe and pressure.*
