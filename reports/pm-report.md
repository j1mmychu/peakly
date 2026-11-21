# Peakly PM Report v218 — 2026-11-21 (LAUNCH DAY +34)

**Status: 🔴 RED — App Review MISSED +8 days. Whistler opened TODAY. Thanksgiving in 5 days. VPS Day 105. Code freeze Day 21. The Whistler opportunity is live and we're not in the App Store.**

> **Stale prompt notice — Day 46 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v217 → v218)

| Commit | What | Right call? |
|--------|------|-------------|
| `98f9da8` | PR #21 merged — phone-only TestFlight + App Store listing workflows (`asc.mjs`, `ci-testflight.sh`, `.github/workflows/testflight.yml` + `asc-listing.yml`) | ✅ Right: unblocks listing-info submission from phone without a Mac |
| `faca1f2` | Content report Nov 21 — 94/100, 404 venues clean, 14 pending proposals (6 ski venues opening this weekend), 5 new venue objects ready | ✅ routine |
| `61c84f4` | DevOps report Nov 21 — RED, VPS Day 105, App Review MISSED +8d, Whistler opened today | ✅ routine |

**Zero app code commits for 21 consecutive days.** Code freeze holds. Code freeze is correct during active App Review.

**Notable new asset from PR #21:** `docs/PHONE_ONLY_RELEASE.md` documents the phone-only TestFlight path. `docs/APP_REVIEW_NOTES_SHORT.txt` is a paste-ready <4000-char version of the App Review reply formatted for the `asc-listing` workflow. This is the unblock: Jack can now paste the App Review reply and update listing info without a Mac. **No excuse left not to reply today.**

---

## Overnight Activity

What changed between v217 (Nov 20) and v218 (Nov 21):

1. **Whistler Blackcomb opened today, Saturday Nov 21.** This is the highest-discovery day of the year for a ski weekend app. We are not in the App Store. The window is live and ticking.

2. **PR #21 merged** — phone-only TestFlight + listing workflow. The tooling to reply to App Review from a phone now exists. `docs/APP_REVIEW_NOTES_SHORT.txt` has the truncated paste-ready reply. `docs/PHONE_ONLY_RELEASE.md` has the step-by-step. Barrier to replying is now zero.

3. **New stale branches:** `cursor/phone-testflight-c015` appeared post PR #21 merge (now +1, 20 stale total). The two dangerous branches (`fix-appjsx-final`, `restore-appjsx`) remain live.

4. **Content: 94/100.** 14 pending venue proposals including 6 ski venues opening this exact weekend (Avoriaz, Val d'Isère, Courmayeur, La Plagne, Isla Mujeres, Negril). Code freeze keeps them out until App Review closes.

5. **VPS: Day 105.** No change. Same 4 live breakages. iOS CORS still blocked.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +8 days. Thanksgiving window (Nov 26) now 5 days out.

**Submission:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`  
**Reply:** `docs/APP_REVIEW_NOTES.md` — paste-ready.  
**Phone path:** `docs/PHONE_ONLY_RELEASE.md` — no Mac required.  
**Short copy:** `docs/APP_REVIEW_NOTES_SHORT.txt` — <4000 chars for `asc-listing` workflow.

**Window math as of today (Nov 21, Whistler opening day):**

| Reply date | Likely live | Window verdict |
|-----------|-------------|----------------|
| **Today (Nov 21)** | Nov 22–23 | 🟡 Thanksgiving still catchable (3-4 days away) |
| Nov 22–23 | Nov 23–24 | 🟡 Thanksgiving eve — still viable |
| Nov 24+ | Nov 25+ | 🔴 Thanksgiving day or after — discovery window mostly gone |
| Dec | Dec | ✅ Full ski season, but no holiday discovery surge |

**Verdict: Every day this slips costs a skiing-weekend discovery opportunity. Reply today.**

### 🚨 P0-B — VPS Redeploy: Day 105.

Same 4 live breakages. Must land before or day-of App Store go-live.

```bash
# 10 minutes, same session as App Review reply:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
# verify: forecast_days:14, uptime <60s
```

### 🚨 P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 22.

`fix-appjsx-final` now 597 commits ahead of main with no common ancestor. One accidental merge = catastrophic rollback with no recovery path. Delete at GitHub while already logged in for the App Review reply. 30 seconds.

### P2 — 20 stale branches.

DEFER systematic cleanup to post-App Review. Exceptions: `fix-appjsx-final` and `restore-appjsx` are deletion targets on the same session as App Review reply.

### P2 — Cache stamp `20261031a`: 21 days stale.

DEFER. Auto-bumps on next app.jsx commit. Not actionable until code freeze lifts.

### P2 — Eval counter discrepancy (406 eval vs 404 baseline).

DEFER. Confirmed false alarm (2 lat-comment artifacts in bracket walk). Fix in first post-App Review commit.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 8 days overdue. 10 minutes. Jack only.**
PR #21 removed the last excuse — no Mac needed. `docs/APP_REVIEW_NOTES_SHORT.txt` is paste-ready. Thanksgiving is 5 days out. Whistler opened today. Reply today.

**#2 — VPS Redeploy. Same afternoon.**
105 days of broken two-weekend scoring. If the app goes live with this broken, every iOS user hitting the app this Thanksgiving weekend sees wrong scores. Same SSH session, 10 minutes, bundle with App Review.

**#3 — Delete `fix-appjsx-final` and `restore-appjsx` while at GitHub.**
While logged into GitHub for the App Review reply: delete both branches. 30 seconds. Eliminates the only catastrophic-failure risk in the entire project.

---

## Explicit Product Decisions

**Decision 1: 6 ski venue proposals (Avoriaz, Val d'Isère, Courmayeur, Val d'Isère additions, Isla Mujeres, Negril) — DEFER to first post-App Review commit.**
All 6 are quality additions timed perfectly for opening weekend. Code freeze is correct — adding venues during active App Review risks a new review cycle. These land as batch #1 the moment App Review closes. First commit priority, same session that bumps the cache stamp.

**Decision 2: Phone-only TestFlight workflow (PR #21) — ACCEPT as shipped.**
Right call. Unblocks the App Review reply path for a phone-only setup. `ci-testflight.sh` and `asc.mjs` are well-scoped. This was the right thing to build during code freeze — pure infrastructure, no app.jsx changes, no review risk.

**Decision 3: Post-App Review coding session sequencing — PLAN NOW.**
When App Review closes, the first session has a fixed order: (1) bump cache stamp + fix eval counter, (2) paste 6-14 pending venue objects, (3) VPS redeploy confirmation check, (4) systematic branch cleanup. Do not let the first post-freeze session sprawl into scoring changes, UI redesigns, or any of the 20 pending claude/* branches without an explicit product decision.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. Scoring changes require an algorithm audit. No audits during active App Review. Post-launch only.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Code freeze. No frontend rewrites during active review.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Same reason. Post-launch if users signal specific friction.
- **Onboarding changes** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Rebuilt 2026-08-11. Working. No changes during App Review.
- **Alert page changes** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab hidden on iOS until APNS live. Zero iOS users benefit.
- **Venue standardization** (`claude/standardize-venue-data-CufiQ`) — REJECTED. Data is clean at 94/100. No disruptive catalog changes during App Review.
- **Code review/cleanup** (`claude/code-review-cleanup-HjoCS`) — REJECTED. Code freeze. First post-launch cleanup pass goes through /simplify, not unreviewed claude/* branches.

---

## Success Criteria

**What defines success at 90 days (Feb 2027):**
- App Store live before Thanksgiving: captures holiday ski discovery surge
- VPS deployed before go-live: two-weekend scoring correct from day one
- One Reddit/HN post during Thanksgiving week: the product is ready, the story is clean

**90-day projection: 5K–8K users. What gets you to 8K, not 5K:**
- Reply today → App Store live by Nov 22–23 → Thanksgiving discovery surge → real organic installs before Christmas ski season peaks
- VPS deployed → iOS two-weekend scoring works → no 1-star reviews about broken scores
- 6 venue additions land immediately post-approval → catalog is fresh for peak ski season

**What keeps you at 5K:**
- App Review reply slips to Nov 24+ → misses Thanksgiving entirely → cold December launch, no holiday surge
- VPS still undeployed on go-live day → iOS two-weekend scoring broken → first impressions are damaged and don't come back

---

## One Product Risk Nobody Is Talking About

**The 20 stale claude/* branches are a product strategy leak.** Each one represents a direction an AI agent took without product sign-off — scoring rewrites, full page redesigns, onboarding overhauls. They're being correctly blocked by code freeze, but they don't go away when the freeze lifts. The first coding session after App Review approval will have 20 branches competing for attention, each with a commit message that sounds like a good idea. Without explicit REJECT decisions logged on each one, the next agent session could pick up one of these branches and merge it. The fix: on the same session Jack deletes `fix-appjsx-final` and `restore-appjsx`, do a 10-minute pass through the other 18 branches — explicitly close each as DEFER or REJECT with a one-sentence reason in a GitHub issue comment, then delete the branch. Closes the strategy leak permanently.

---

*Report v218. Next: v219 on 2026-11-22. The only metric that matters: did the App Review reply go out today.*
