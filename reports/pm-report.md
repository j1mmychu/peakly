# Peakly PM Report v217 — 2026-11-20 (LAUNCH DAY +33)

**Status: 🔴 RED — App Review MISSED +7 days. Whistler opens TODAY (Nov 21 tomorrow). Thanksgiving in 6 days. VPS Day 104. The Whistler window is gone — Thanksgiving is now the only viable ski-season launch window this year.**

> **Stale prompt notice — Day 45 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v216 → v217)

| Commit | What | Right call? |
|--------|------|-------------|
| `c0c0dc9` | DevOps report Nov 20 — RED, VPS Day 104, App Review MISSED +7d, Whistler opens tomorrow | ✅ routine |
| `0eeafb9` | Content report Nov 20 — 94/100, 404 venues clean, 5 venue objects ready (Flaine, Serre-Chevalier, Cortina, Luquillo Beach PR, Orient Beach SXM) | ✅ routine |

**Zero app code commits for 20 consecutive days.** Code freeze holds. Correct call during active App Review.

---

## Overnight Activity

What changed since v216:

1. **Whistler opens today.** The window everyone built toward. App Store is not live. This is a miss. It's done. The question now is whether Thanksgiving (Nov 26) can still be caught — it can, if the App Review reply goes out today.

2. **VPS: Day 104** — still undeployed. Two-weekend scoring has been off for 104 days. If App Store approves while this sits, iOS users hit broken scoring on day one.

3. **Content score: 94/100** — up from 93. Five new venue objects confirmed ready: Flaine (FR), Serre-Chevalier (FR), Cortina d'Ampezzo (IT), Luquillo Beach (PR), Orient Beach (SXM). Code freeze keeps them out until App Review closes.

4. **19 stale branches** — unchanged. `fix-appjsx-final` (597 commits ahead, no common ancestor with main) remains the highest-risk artifact in the repo. Code freeze holding.

5. **Venue count confirmed 404** — DevOps confirms the 406 eval discrepancy is 2 comment lines near the VENUES block. `.venue-baseline` of 404 is correct. Stop re-investigating.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +7 days. Thanksgiving window (Nov 26) is 6 days out.

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES.md` — paste-ready. 10 minutes.

**Window math as of today (Nov 20):**

| Reply date | Likely live | Window | Verdict |
|-----------|-------------|--------|---------|
| **Today (Nov 20)** | Nov 21–22 | Thanksgiving 4 days away | 🟡 Tight but viable |
| Nov 21 | Nov 22–23 | 3 days before Thanksgiving | 🟡 Still catches it |
| Nov 25+ | Nov 26+ | Day of Thanksgiving | 🔴 Too late for discovery |
| Dec | Dec | Full ski season | ✅ still a full season, just later |

**Whistler is gone. Thanksgiving is the last viable 2026 ski-season launch window.** Reply today or accept Dec as the launch target.

### 🚨 P0-B — VPS Redeploy: Day 104. App Review reply and VPS deploy are the same afternoon.

Same 4 live breakages for 104 days:
- Two-weekend scoring: OFF (forecast_days 7, not 14)
- iOS CORS: blocked (`capacitor://localhost` missing)
- Alert deletion: broken (DELETE verb missing from CORS)
- Rate limiter: forgeable (reads first X-Forwarded-For, not last)

```bash
# Jack — 10 minutes, same SSH session as App Review reply:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
# verify: forecast_days:14, uptime <60s, apns:unconfigured
```

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 21.

`fix-appjsx-final` is 597 commits ahead of main with no common ancestor. One bad merge ends the project. Delete both at GitHub UI. 30 seconds. Same session as App Review reply.

### P2 — Cache stamp `20261031a`: 20 days stale.

DEFER. Auto-bumps on next app.jsx commit. Not actionable until code freeze lifts.

### P2 — Eval counter discrepancy (406 eval vs 404 baseline).

DEFER. Diagnostic tool only. Fix in first post-App Review commit alongside venue additions.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 7 days overdue. 10 minutes. Jack only.**
Thanksgiving window closes in 6 days. `docs/APP_REVIEW_NOTES.md` has the full paste-ready reply. The ski season that justified this entire push is here right now. This is the only action that moves the needle.

**#2 — VPS Redeploy. Same afternoon.**
104 days of broken two-weekend scoring. iOS users hit a broken product if the app goes live first. Bundle with the App Review reply — same SSH session, same 10 minutes.

**#3 — Delete `fix-appjsx-final` and `restore-appjsx` while at GitHub.**
597 commits ahead of main with no common base. This is an accidental merge away from a catastrophic rollback. While you're logged into GitHub for the App Review reply, delete these branches. 30 seconds.

---

## Explicit Product Decisions

**Decision 1: Whistler window — ACCEPT THE MISS. Thanksgiving is the new target.**
Whistler opens today. App Store is not live. The "reply today and catch Whistler" calculus is over. Thanksgiving (Nov 26) is the new primary window — it's a larger discovery event than a single resort opening and still a full ski-season launch. This is not a failure if the App Review reply goes out today.

**Decision 2: 5 new venue objects (Flaine, Serre-Chevalier, Cortina, Luquillo Beach PR, Orient Beach SXM) — DEFER to post-App Review first commit.**
All 5 are quality additions with verified data. Code freeze until App Review closes. These land as batch #1 the moment the review resolves — same session that bumps the cache stamp and fixes the eval counter.

**Decision 3: 19 stale claude/* branches — DEFER systematic cleanup to post-App Review, except `fix-appjsx-final` and `restore-appjsx` which are P0 deletion targets.**
Systematic branch cleanup is a 30-minute job that belongs after App Review. The two dangerous branches are targets of opportunity during the App Review GitHub session — 30 extra seconds while already logged in.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. Scoring changes require an algorithm audit. No audits during active App Review.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Code freeze. No frontend rewrites during active review — risks rejection loop.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Same reason. Post-launch if users signal specific friction.
- **Onboarding changes** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Rebuilt 2026-08-11. Working. No changes during App Review.
- **Alert page changes** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab is hidden on iOS until APNS is live. Zero iOS users benefit.
- **Test coverage analysis** (`claude/analyze-test-coverage-WVIsT`) — REJECTED. No test suite exists in this single-file SPA. Infrastructure work post-launch.
- **Profile page simplification** (`claude/simplify-profile-page-Bi2Tc`) — REJECTED. Code freeze. Profile works. Don't touch during active review.

---

## Success Criteria

**What defines success at 90 days (Feb 2027):**
- App Store live before Thanksgiving: captures holiday ski discovery surge
- VPS deployed: two-weekend scoring works for every iOS user from day one
- `fix-appjsx-final` deleted before any future coding session

**90-day projection: 5K–8K users. What gets you to 8K, not 5K:**
- App Store live before Thanksgiving (not December) — holiday discovery is 2–3× the normal rate
- VPS deployed so iOS two-weekend scoring actually works — a broken scoring feature on day one is a 1-star review machine
- One Reddit/HN post during Thanksgiving week — the product is ready, the story is clean (ski + beach, Fri–Mon confidence, honest forecasts)

**What goes wrong at 5K:**
- App Store delayed past Thanksgiving → misses holiday surge, launches cold in December
- VPS still broken → iOS users see wrong weekend scores, churn immediately
- Both above → closer to 2K than 5K

---

## One Product Risk Nobody Is Talking About

**The 20-day code freeze has accumulated context rot in every agent prompt.** The stored cron prompts still reference 182 venues, 12 categories, $9/mo Peakly Pro, and empty Sentry DSN. That's been wrong for 45 days. When the code freeze lifts and the first real coding session fires, any agent working from these stale prompts will make decisions based on a product that no longer exists. The App Review reply unlocks coding work — Jack should update the cron prompts the same afternoon. The 2-minute fix that this PM report has been asking for since Day 1.

---

*Report v217. Next: v218 on 2026-11-21. The only metric that matters between now and then: did the App Review reply go out.*
