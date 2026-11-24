# Peakly PM Report v221 — 2026-11-24 (LAUNCH DAY +37)

**Status: 🔴 RED — App Review MISSED +11 days. Thanksgiving in 2 days (Nov 26). VPS Day 105. Code freeze Day 24. The Thanksgiving window closes Thursday. This is the last report before it's gone.**

> **Stale prompt notice — Day 49 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v220 → v221)

| Commit | What | Right call? |
|--------|------|-------------|
| `b58d524` | DevOps report Nov 24 — RED, Day 105 VPS, App Review +11d, Thanksgiving 2d out | ✅ routine |
| `c06d578` | Content report Nov 24 — 95/100, 404 venues clean, 5 new proposals (Key West, Seminyak, Marbella, Grindelwald, Mürren) | ✅ routine |

**Zero app code commits for 24 consecutive days.** Code freeze holds. Correct during active App Review.

**Notable today:** 5 new venue proposals bring the backlog to 31 (26 from prior days + 5 today). All frozen correctly. Key West and Seminyak are genuinely high-quality additions for the Thanksgiving beach crowd — these belong in batch #1 the moment App Review closes.

---

## Overnight Activity

What changed between v220 (Nov 23) and v221 (Nov 24):

1. **Thanksgiving is now 2 days away.** This is the last PM report before the holiday window closes. If the App Review reply goes out today, Apple's typical 1-day turnaround means the app could be live by Wednesday night or Thursday morning — catching Thanksgiving browsing. If the reply slips to Wednesday, we're looking at Friday or later. The window is not gone yet, but it closes at midnight Thursday.

2. **Content confirms 31 pending venue proposals.** 5 new objects today: Key West/Smathers Beach (EYW ✅), Seminyak Bali (DPS ✅), Marbella (AGP ✅), Grindelwald First (GVA ✅), Mürren (GVA ✅). All use airports confirmed clear in AIRPORT_COORDS. Batch is ready to paste the moment the freeze lifts.

3. **VPS Day 105.** Two-weekend scoring dead. iOS CORS blocked. Alert deletion broken. Thanksgiving is in 2 days and the core differentiator doesn't work on mobile. This needs to land the same afternoon as the App Review reply.

4. **`fix-appjsx-final` now Day 25, holding at 597 commits ahead.** Still the only catastrophic rollback risk in the project. Still not deleted.

5. **21 stale branches.** One new branch (`cursor/phone-testflight-c015`) confirmed by DevOps. These are noise. Delete the two dangerous ones (`fix-appjsx-final`, `restore-appjsx`) now. The rest can wait.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +11 days. Thanksgiving in 2 days.

**Submission:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES_SHORT.txt` — <4000 chars, paste-ready. No Mac needed.
**Full notes:** `docs/APP_REVIEW_NOTES.md`
**Phone path:** `docs/PHONE_ONLY_RELEASE.md`

**Window math as of today (Nov 24):**

| Reply time | Likely App Store live | Thanksgiving verdict |
|-----------|----------------------|----------------------|
| **Today (Nov 24)** | Nov 25 | 🟡 Thanksgiving eve — holiday browsing starts |
| Nov 25 AM | Nov 25–26 | 🟠 Race condition — might catch Thursday |
| Nov 25 PM+ | Nov 26+ | 🔴 Post-Thanksgiving surge — holiday gone |

**One day left. Tomorrow is the last possible day to catch any Thanksgiving traffic. Reply today.**

### 🚨 P0-B — VPS Redeploy: Day 105. Must land same day as App Review reply.

4 live breakages. iOS users can't reach the proxy. Two-weekend scoring returns 7-day forecasts instead of 14. Alert deletion silently fails. Same SSH session, 10 minutes:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | jq .
```

### 🚨 P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 25.

Delete from GitHub while logged in for the App Review reply. 30 seconds. 597 commits of diverged history that could nuke main if merged.

### P2 — 21 stale branches.

DEFER except the two P0-C targets.

### P2 — Cache stamp `20261031a`: 24 days stale.

DEFER. Auto-bumps on next app.jsx commit. No action until code freeze lifts.

### P2 — Eval counter discrepancy (406 eval vs 404 baseline).

DEFER. Confirmed false alarm. First post-App Review commit.

### ✅ CLOSED — BASE_PRICES coverage.

100% — 181 airports, 0 gaps. Closed.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 11 days overdue. 10 minutes. Jack only. Last chance for Thanksgiving.**
`docs/APP_REVIEW_NOTES_SHORT.txt` is paste-ready, <4000 chars, no Mac needed. After tomorrow morning, Thanksgiving is gone.

**#2 — VPS Redeploy. Same afternoon.**
Day 105. iOS CORS blocked means first App Store users hit a broken product. This is not negotiable. 10 minutes via SSH.

**#3 — Delete `fix-appjsx-final` + `restore-appjsx` from GitHub while logged in.**
30 seconds. While at GitHub for the App Review reply. The only catastrophic rollback risk in the project.

---

## Explicit Product Decisions

**Decision 1: 31 pending venue proposals — DEFER to first post-App Review commit (batch, single session).**
Key West/Smathers (EYW), Seminyak Bali (DPS), Marbella (AGP), Grindelwald First (GVA), Mürren (GVA) are today's 5. All have clean airport infrastructure. These are quality, timely additions for the ski season and holiday beach traffic. Paste all 31 as a single batch commit when the freeze lifts. VCE/GNB/ZTH venue proposals still deferred — AIRPORT_COORDS gaps require TRN/GVA/CMF substitution.

**Decision 2: Post-Thanksgiving strategy if App Review slips to Dec — SHIP anyway, pivot message.**
If the reply goes out Wednesday Nov 25 PM or later and we miss Thanksgiving entirely: don't treat it as a launch failure. Pivot message to Christmas week (Dec 23–Jan 1) — equal or larger ski search volume. The catalog is at 404 venues, BASE_PRICES is 100%, two-weekend scoring works (post-VPS). A Dec 1 App Store launch with a "Christmas ski weekends" Reddit post is a viable path. Not the preferred path, but not a failure.

**Decision 3: 21 stale branches — systematic delete post-App Review, no cherry-picks.**
The `claude/*` and `cursor/*` branches all contain agent-generated diffs that have NOT been reviewed against the code freeze rules. Zero merges without explicit Jack sign-off. Delete the branches; don't evaluate them. If a specific feature from one of them is worth shipping, it gets a fresh implementation against the unfrozen codebase, not a 24-day-old merge.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. No algorithm changes during App Review. The current algorithm passed smoke tests and ships.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Code freeze. Ship first, optimize based on actual user behavior data.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Post-launch with analytics. Zero users means zero signal.
- **Alert page consolidation** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab is iOS-gated until APNS live. UI-only change serves no active users.
- **UX review suggestions** (`claude/review-peakly-ux-UQ0Qu`) — REJECTED. Same reasoning as UI overhaul. Ship, measure, then iterate.
- **Profile page simplification** (`claude/simplify-profile-page-Bi2Tc`) — REJECTED. Code freeze.
- **Onboarding changes** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Onboarding was rebuilt in Aug 2026. No changes without A/B data.

---

## Success Criteria

**90-day projection (Feb 2027): 5K–8K users. What gets you to 8K:**
- App Review reply today → live by Nov 25 → Thanksgiving discovery traffic → real organic installs before Christmas
- VPS deployed same day → iOS two-weekend scoring correct from first user → no 1-star reviews
- Reddit post during Christmas week (Dec 23–28) → ski season peak → 2K+ organic users in 72h
- 31 venue additions post-freeze → catalog depth competitive for Christmas destinations

**What keeps you at 5K:**
- App Review reply slips past Nov 25 → misses Thanksgiving → cold December launch, no holiday surge
- VPS still undeployed on launch day → first iOS impressions damaged
- Reddit post delayed to January → ski season past peak, beach season not yet

---

## One Product Risk Nobody Is Talking About

**The VPS weather cache (`_wxCache`) is still in-memory only.**

When Jack SSHs in to do the Day 105 redeploy, `pm2 restart peakly-proxy` wipes the cache. If a Reddit/HN post goes live within hours of the VPS restart — which is exactly the plan — a cold cache hit by even 50 simultaneous users could exceed Open-Meteo's free-tier rate ceiling before the cache refills. The ~30-line disk persistence fix for this (Open #23) has been documented since July 25 and has never been merged.

**The fix:** bundle it into the same SSH session as the VPS redeploy. It's already written and documented in `server/proxy.js` commit history. Skipping it is a single Reddit post away from a production incident on launch day.
