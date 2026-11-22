# Peakly PM Report v219 — 2026-11-22 (LAUNCH DAY +35)

**Status: 🔴 RED — App Review MISSED +9 days. Whistler open Day 2. Thanksgiving in 4 days. VPS Day 103. Code freeze Day 22. The holiday discovery window is burning.**

> **Stale prompt notice — Day 47 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v218 → v219)

| Commit | What | Right call? |
|--------|------|-------------|
| `25e1308` | Content report Nov 22 — 94/100, 404 venues clean, 19 pending proposals (5 opening weekend NOW), 5 new venue objects ready | ✅ routine |
| `8401208` | DevOps report Nov 22 — RED, VPS Day 103, App Review MISSED +9d | ✅ routine |

**Zero app code commits for 22 consecutive days.** Code freeze holds. Correct during active App Review.

**Nothing changed in the product today.** The only open variable is whether Jack replies to the App Review request.

---

## Overnight Activity

What changed between v218 (Nov 21) and v219 (Nov 22):

1. **Whistler is now Day 2 open.** Thanksgiving is 4 days away (Nov 26). This is the peak ski discovery window of the year. We are not in the App Store.

2. **No new commits to main except daily reports.** Code freeze holding correctly.

3. **19 pending venue proposals** accumulating in content-report.md. 5 are venues with opening weekends happening *right now* (La Clusaz, Les Contamines, La Grave, Rincón PR, Vieques PR). These are blocked by code freeze.

4. **GVA BASE_PRICES gap newly flagged by Content.** Geneva Airport serves Verbier, Zermatt, Chamonix, Courmayeur — the highest-value ski venues in the catalog — and has zero BASE_PRICES entry. Users flying to any of these get `~$X` with no deal scoring.

5. **`fix-appjsx-final` now Day 23, 647 commits ahead of main.** Still a deletion target. Still not deleted.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +9 days. Thanksgiving window (Nov 26) in 4 days.

**Submission:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES.md` — paste-ready.
**Phone path:** `docs/PHONE_ONLY_RELEASE.md` — no Mac required.
**Short copy:** `docs/APP_REVIEW_NOTES_SHORT.txt` — <4000 chars.

**Window math as of today (Nov 22, Whistler Day 2):**

| Reply date | Likely App Store live | Thanksgiving verdict |
|-----------|----------------------|----------------------|
| **Today (Nov 22)** | Nov 23–24 | 🟡 Thanksgiving eve viable — 2-3 days of holiday discovery |
| Nov 23 | Nov 24–25 | 🟡 Thanksgiving day — some discovery, reduced |
| Nov 24+ | Nov 25+ | 🔴 Post-Thanksgiving — holiday surge gone |
| Dec | Dec | ✅ Full ski season, but no Thanksgiving surge |

**Every day that slips is a day of Thanksgiving ski-discovery traffic with no App Store presence. Reply today.**

### 🚨 P0-B — VPS Redeploy: Day 103.

Same 4 live breakages. Must land before or day-of App Store go-live:
- Two-weekend scoring disabled (forecast_days:7 instead of 14)
- iOS native calls blocked (CORS missing capacitor://localhost)
- Alert deletion silently fails (DELETE verb not in Access-Control-Allow-Methods)
- Rate limiter forgeable (reading first X-Forwarded-For instead of last)

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
```

### 🚨 P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 23.

647 commits ahead of main. One accidental merge = catastrophic rollback. Delete both at GitHub while already logged in for the App Review reply.

### P2 — 20 stale branches.

DEFER systematic cleanup to post-App Review. Exceptions: `fix-appjsx-final` and `restore-appjsx` are deletion-on-sight targets.

### P2 — Cache stamp `20261031a`: 22 days stale.

DEFER. Auto-bumps on next app.jsx commit. Not actionable until code freeze lifts.

### P2 — Eval counter discrepancy (406 eval vs 404 baseline).

DEFER. Confirmed false alarm (2 lat-comment artifacts). Fix in first post-App Review commit.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 9 days overdue. 10 minutes. Jack only.**
No Mac needed. `docs/APP_REVIEW_NOTES_SHORT.txt` is paste-ready. Thanksgiving is 4 days out. Whistler is Day 2 open. This is the highest-value 10 minutes in the project right now.

**#2 — VPS Redeploy. Same afternoon.**
103 days of broken two-weekend scoring. If the app goes live with this undeployed, iOS users on Thanksgiving weekend see wrong scores. Same SSH session, 10 minutes.

**#3 — Delete `fix-appjsx-final` and `restore-appjsx` while at GitHub.**
While logged into GitHub for the App Review reply: 30 seconds. Eliminates the only catastrophic-rollback risk in the project.

---

## Explicit Product Decisions

**Decision 1: 19 pending venue proposals (including 5 opening-weekend venues) — DEFER to first post-App Review commit.**
La Clusaz, Les Contamines, La Grave, Rincón PR, Vieques PR, and 14 others are quality additions timed for peak season. Code freeze is correct — adding venues during active App Review risks triggering a new review cycle. These land as batch #1 the moment App Review closes. First commit priority.

**Decision 2: GVA BASE_PRICES gap — ADD in first post-App Review commit.**
Geneva Airport is the gateway to Verbier, Zermatt, Chamonix, Courmayeur — the highest-scoring ski venues in the catalog. These venues have zero deal scoring for users flying SFO/JFK/etc. to GEV. This is a revenue and quality gap. Estimated 30 minutes. Bundle with venue batch #1 post-App Review.

**Decision 3: Post-App Review coding session sequencing — LOCKED.**
When App Review closes, the first session executes in this order only:
1. Bump cache stamp + fix eval counter
2. Paste 19 pending venue objects
3. Add GVA + other high-impact BASE_PRICES gaps
4. VPS redeploy confirmation check
5. Delete 20 stale branches (systematic, not cherry-pick)

No scoring changes. No UI rewrites. No claude/* branch merges without explicit product sign-off. This sequence, nothing else.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. Scoring changes require an algorithm audit. No audits during active App Review. Revisit post-launch only if users report specific scoring failures.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Code freeze. The current front page shipped and passed smoke tests. No rewrites during App Review.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Post-launch, only if analytics show specific friction points. Not a priority at 0 users.
- **Alert page changes** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab is hidden on iOS until APNS live. Zero iOS users benefit. Ship APNS first, then revisit UI.
- **Loading screen enhancement** (`claude/enhance-loading-screen-rZ1dc`) — REJECTED. The 3-5s Babel wall was eliminated by the production build (esbuild, Babel stripped). No loading screen problem exists.
- **Profile page simplification** (`claude/simplify-profile-page-Bi2Tc`) — REJECTED. Profile was rebuilt in the Aug 11 session. Working. No changes without user-reported friction.

---

## Success Criteria

**What defines success at 90 days (Feb 2027):**
- App Store live before Thanksgiving: captures holiday ski discovery surge
- VPS deployed before go-live: two-weekend scoring correct from day one
- One Reddit/HN post during Thanksgiving week: the product is ready, the story is clean

**90-day projection: 5K–8K users. What gets you to 8K, not 5K:**
- Reply today → App Store live by Nov 23–24 → 2-3 days of Thanksgiving discovery → real organic installs before Christmas peaks
- VPS deployed → iOS two-weekend scoring works from first user → no 1-star reviews on scoring accuracy
- 19 venue additions land immediately post-approval → catalog is fresh for peak ski season including opening-weekend venues

**What keeps you at 5K:**
- App Review reply slips to Nov 24+ → misses Thanksgiving entirely → cold December launch, no holiday surge
- VPS still undeployed on go-live day → first iOS users see broken two-weekend scoring → first impressions damaged

---

## One Product Risk Nobody Is Talking About

**The GVA gap will tank your highest-value ski venues on day one.** Verbier, Zermatt, Chamonix, and Courmayeur will all render deal scores correctly for US users flying out of the 15 covered airports — but those are not the airports people fly to reach these venues. The natural routing is through Geneva (GVA) or Zurich (ZRH) or Lyon (LYS). A user in New York or LA booking a Zermatt weekend will see `~$X` with no deal label — not because there's no deal, but because BASE_PRICES has no GVA entry and the deal engine can't fire. These are the venues with the highest word-of-mouth potential (Zermatt, Verbier, Chamonix are the names). Missing deal labels on them is a silent quality failure on the highest-prestige part of the catalog. Fix is 15 minutes in the first post-App Review commit.

---

*Report v219. Next: v220 on 2026-11-23. The only metric that matters: did the App Review reply go out today.*
