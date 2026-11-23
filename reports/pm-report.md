# Peakly PM Report v220 — 2026-11-23 (LAUNCH DAY +36)

**Status: 🔴 RED — App Review MISSED +10 days. Whistler open Day 3. Thanksgiving in 3 days (Nov 26). VPS Day 104. Code freeze Day 23. The Thanksgiving window is nearly gone.**

> **Stale prompt notice — Day 48 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v219 → v220)

| Commit | What | Right call? |
|--------|------|-------------|
| `3643785` | Content report Nov 23 — 95/100, 404 venues clean, BASE_PRICES confirmed fully closed (0 missing airports), 5 new venue objects ready | ✅ routine |
| `5d250fd` | DevOps report Nov 23 — RED, VPS Day 104, App Review MISSED +10d, BASE_PRICES confirmed 100% | ✅ routine |

**Zero app code commits for 23 consecutive days.** Code freeze holds. Correct during active App Review.

**Notable today:** Content agent confirms BASE_PRICES is now at **100% coverage** — 181 airports, 0 venue AP gaps. The GVA risk I flagged in v219 is already closed. The only remaining fix for the first post-App Review commit is the eval counter discrepancy (2 artifacts) and the 21 pending venue additions.

---

## Overnight Activity

What changed between v219 (Nov 22) and v220 (Nov 23):

1. **Thanksgiving is now 3 days away (Nov 26).** Whistler is Day 3 open. The highest-value discovery window of the year is burning. We are still not in the App Store. Each day the reply slips is a day of ski-peak traffic with zero App Store presence.

2. **BASE_PRICES confirmed fully closed.** Content agent ran a full audit: 181 destination airports, 0 missing for any of the 404 venues. The GVA risk flagged in v219 was already fixed before v219 published it. The deal engine is complete.

3. **21 pending venue proposals** continue accumulating (up from 19 yesterday). Still frozen correctly per code freeze. These become batch #1 when App Review clears.

4. **`fix-appjsx-final` now Day 24, dropping from 647 → 597 commits ahead.** The count is decreasing as main accumulates daily reports. Still a deletion-on-sight target. Still not deleted.

5. **`fix-appjsx-final` PR #21 merged.** DevOps confirms the TestFlight + ASC listing workflows landed. Phone-only release path is confirmed operational — no Mac required for the App Review reply.

6. **AIRPORT_COORDS gaps for new venue proposals (VCE, GNB) confirmed by Content.** These affect Cortina d'Ampezzo, Alpe d'Huez, Serre-Chevalier venue proposals. Use TRN/GVA/CMF instead when adding. Not blocking current catalog — zero existing venues affected.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +10 days. Thanksgiving window (Nov 26) in 3 days.

**Submission:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`  
**Reply (phone, no Mac):** `docs/APP_REVIEW_NOTES_SHORT.txt` — <4000 chars, paste-ready.  
**Full notes:** `docs/APP_REVIEW_NOTES.md`  
**Phone path:** `docs/PHONE_ONLY_RELEASE.md`

**Window math as of today (Nov 23):**

| Reply date | Likely App Store live | Thanksgiving verdict |
|-----------|----------------------|----------------------|
| **Today (Nov 23)** | Nov 24–25 | 🟡 Thanksgiving day — still catches holiday discovery |
| Nov 24 | Nov 25 | 🟡 Thanksgiving eve → day — diminishing |
| Nov 25+ | Nov 26+ | 🔴 Post-Thanksgiving window — holiday surge gone |
| Dec | Dec | ✅ Full ski season, no Thanksgiving |

**Three days left. After Nov 25, Thanksgiving is over. Reply today.**

### 🚨 P0-B — VPS Redeploy: Day 104.

4 live breakages. Same SSH session, 10 minutes. Must land day-of or before App Store go-live:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
```

Broken: two-weekend scoring (forecast_days:7 instead of 14), iOS CORS, alert deletion, rate limiter.

### 🚨 P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 24.

Delete both while logged into GitHub for the App Review reply. 30 seconds. Eliminates the only catastrophic-rollback vector in the project.

### P2 — 20 stale branches (unchanged).

DEFER to post-App Review except the two deletion targets above.

### P2 — Cache stamp `20261031a`: 23 days stale.

DEFER. Auto-bumps on next app.jsx commit. No action until code freeze lifts.

### P2 — Eval counter discrepancy (406 eval vs 404 baseline).

DEFER. Confirmed false alarm (2 lat-comment artifacts). First post-App Review commit fix.

### ✅ CLOSED — BASE_PRICES coverage.

Content confirmed 0 missing airports as of today. Closed. No longer a P2.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 10 days overdue. 10 minutes. Jack only.**
No Mac needed. `docs/APP_REVIEW_NOTES_SHORT.txt` is paste-ready. After Nov 25, Thanksgiving is gone. This is the only action that matters this week.

**#2 — VPS Redeploy. Same afternoon as the App Review reply.**
104 days of broken two-weekend scoring. iOS CORS blocked. Alert deletion broken. Same SSH session, 10 minutes. These are not cosmetic bugs — two-weekend scoring is the product's core differentiator.

**#3 — Delete `fix-appjsx-final` and `restore-appjsx` while at GitHub.**
While logged in for the App Review reply. 30 seconds. The only catastrophic rollback risk in the project. No reason to let it live another day.

---

## Explicit Product Decisions

**Decision 1: 21 pending venue proposals — DEFER to first post-App Review commit.**
La Clusaz, Les Contamines, La Grave, Rincón PR, Vieques PR, Avoriaz, Courmayeur, La Plagne, Negril, Playa Norte, plus 11 others are quality, timely additions. Code freeze is correct during active App Review. These are batch #1 the day App Review closes. For Cortina d'Ampezzo, Alpe d'Huez, Serre-Chevalier: use TRN/GVA/CMF as the ap code, not VCE/GNB (AIRPORT_COORDS gaps flagged by Content today).

**Decision 2: BASE_PRICES closure — SHIP, confirmed DONE.**
Content confirmed 0 missing airports. The deal engine is complete. No further action needed on BASE_PRICES. This item is closed.

**Decision 3: Post-App Review coding session sequencing — LOCKED (unchanged from v219).**
When App Review closes, first session executes in this exact order:
1. Bump cache stamp + fix eval counter (2 lat-comment artifacts)
2. Paste 21 pending venue objects (batch, single commit — use TRN/GVA/CMF for the 3 AIRPORT_COORDS-gap venues)
3. VPS redeploy confirmation check (verify proxy.js is deployed)
4. Delete 20 stale branches systematically
5. No scoring changes. No UI rewrites. No claude/* branch merges without explicit sign-off.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. No algorithm changes during App Review. Revisit only if users report scoring failures post-launch.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Code freeze. Existing front page passed smoke tests and ships.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Post-launch, only if analytics show friction. At zero users, this is pure guessing.
- **Alert page consolidation** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab is iOS-gated until APNS live. No iOS user benefits from a UI-only change here.
- **Loading screen enhancement** (`claude/enhance-loading-screen-rZ1dc`) — REJECTED. The 3-5s Babel wall was eliminated by the production esbuild. This is solving a solved problem.
- **Test coverage analysis** (`claude/analyze-test-coverage-WVIsT`) — REJECTED. Single-file React SPA with no test infrastructure. Adding test coverage before launch is a category error — ship, then add tests if regression history warrants them.

---

## Success Criteria

**What defines success at 90 days (Feb 2027):**
- App Store live before Thanksgiving: captures holiday ski discovery surge
- VPS deployed before go-live: two-weekend scoring correct from day one
- One Reddit/HN post during ski season opening: clean story, catalog ready

**90-day projection: 5K–8K users. What gets you to 8K, not 5K:**
- Reply today → App Store live by Nov 24–25 → Thanksgiving discovery traffic → real organic installs before Christmas peaks
- VPS deployed → iOS two-weekend scoring works from first user → no 1-star reviews on scoring accuracy
- 21 venue additions land immediately post-approval → catalog is fresh for peak ski season

**What keeps you at 5K:**
- App Review reply slips past Nov 25 → misses Thanksgiving entirely → cold December launch, no holiday surge
- VPS still undeployed → first iOS users see broken two-weekend scoring → first impressions damaged before any word-of-mouth

---

## One Product Risk Nobody Is Talking About

**The 23-day code freeze has created compounding context rot in the agent team.** Content is now on Day 21 of proposing venues that cannot be added. DevOps is on Day 104 of flagging the same VPS redeploy. The daily reports are drifting toward being logs of their own staleness rather than surfacing new signal. The real risk: when App Review closes and the code freeze lifts, the first commit will be pressured to land 21 venue additions + cache bump + eval fix + whatever else has been queuing — all in one session, without adequate review. The sequencing decision in v219/v220 exists to prevent this from becoming a rush job. Stick to the sequence. Don't try to clear all 21 days of backlog in one hour.

---

*Report v220. Next: v221 on 2026-11-24. The only metric that matters: did the App Review reply go out today. Thanksgiving is 3 days away.*
