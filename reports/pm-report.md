# Peakly PM Report v223 — 2026-11-26 (LAUNCH DAY +39, Thanksgiving)

**Status: 🔴 RED — Thanksgiving is TODAY. App Review MISSED +13 days. VPS Day 107. Code freeze Day 26.**

> **Stale prompt notice — Day 51 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v222 → v223)

| Commit | What | Right call? |
|--------|------|-------------|
| `27f3d49` | DevOps report Nov 26 — RED, Day 107 VPS, Thanksgiving TODAY peak risk | ✅ routine |
| `e4f56c1` | Content report Nov 26 — 95/100, 404 venues, 40-venue backlog, 5 new proposals (Negril, Key West, Davos-Klosters, Flaine, Alpe d'Huez) | ✅ routine |

**Zero app code commits for 26 consecutive days.** Code freeze holds. Correct until App Review resolves.

**Overnight:**
- lateSeason discrepancy officially CLOSED in both DevOps and Content reports. 15 confirmed. Stop flagging.
- Stale branch count down from 22 → 20 (net -2). Modest progress. 20 still open.
- 40-venue backlog continues to accumulate. All frozen until code freeze lifts.
- No new P0s introduced overnight.

---

## Overnight Activity (Nov 25 → Nov 26)

1. **Thanksgiving arrived.** The window everyone has been warning about is open right now. If Jack replies to App Review today, Apple's fastest known turnaround (24–48h over a holiday) means earliest live date: Nov 27–28. That still catches Black Friday ski search traffic (second biggest ski booking weekend after Christmas). Today is not fully lost.

2. **40-venue backlog.** Content now at 40 proposals (35 from yesterday + 5 new: Negril, Key West/Smathers, Davos-Klosters, Flaine, Alpe d'Huez). All Caribbean and Alps — peak Thanksgiving/Christmas demand. SXM airport gap still blocking Orient Beach SXM specifically. All 40 ship as single post-freeze batch.

3. **VPS Day 107.** In-memory weather cache on the live VPS is healthy but would reset on any `pm2 restart`. If Thanksgiving traffic spikes — even modest family-scrolling volume — and the VPS needs a restart, the cold cache could spike Open-Meteo above free tier before `_wxCache` refills. The disk-cache fix (Open #23) is committed, needs 1 SSH session.

4. **`fix-appjsx-final` Day 27, 647 commits ahead.** Still present. Still a bomb.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +13 days. Thanksgiving is HERE.

**Still the single most leveraged action in this entire project.** One person. One reply. 10 minutes.

Reply today (Nov 26) → Apple fastest approval Nov 27–28 → app live Black Friday weekend. Black Friday is the #2 ski booking weekend of the year. Still worth it.
Reply after today → pivot fully to Christmas week (Dec 23–Jan 1). Still a strong window, different messaging.

**Submission:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES_SHORT.txt` — <4000 chars, paste-ready.
**No Mac needed.** `docs/PHONE_ONLY_RELEASE.md` has the full path.

### 🚨 P0-B — VPS Redeploy: Day 107. Same afternoon as App Review reply.

Four live breakages. 15-minute SSH fix. Same commands as every prior report:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && pm2 status"
curl -s https://peakly-api.duckdns.org/health | jq .
```

Must happen same day as App Review reply. First App Store users on iOS hit broken two-weekend scoring, broken alert deletion, and blocked iOS CORS if this doesn't happen on launch day.

### 🚨 P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 27.

647 commits ahead. Single catastrophic risk in the project. Delete from GitHub while logged in for App Review reply. 30 seconds.

### P1 — SXM AIRPORT_COORDS gap (blocks Orient Beach SXM venue).

`SXM` missing from `AIRPORT_COORDS`. Two-line fix: add `SXM: {lat:18.0410, lon:-63.1089}` to `AIRPORT_COORDS` and `SXM` → `"north_america"` to `AP_CONTINENT`. First post-freeze commit, before the 40-venue batch.

### P2 — 20 stale branches.

DEFER. Systematic delete pass post-App Review. Not a live risk.

### P2 — Cache stamp `20261031a`: 26 days stale.

DEFER. Auto-bumps on next app.jsx commit. Correct behavior during freeze.

### ✅ CLOSED — lateSeason:true discrepancy.

15 confirmed. CLAUDE.md correct. Methodology bug in grep, not a code issue. Stop re-flagging.

### ✅ CLOSED — BASE_PRICES coverage.

100%. 181 airports. 0 gaps.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 13 days overdue. Reply TODAY for a shot at Black Friday (Nov 27–28).**
`docs/APP_REVIEW_NOTES_SHORT.txt`. No Mac. No Xcode. Just paste and submit. Black Friday ski search traffic is the last adjacent window before Christmas.

**#2 — VPS Redeploy. Same afternoon as the reply.**
Day 107. iOS broken on launch day without it. Bundle Open #23 disk cache — same session, 30 extra lines, documented and ready.

**#3 — Delete `fix-appjsx-final` + `restore-appjsx`. While logged into GitHub for P0-A.**
30 seconds. Removes the only catastrophic rollback risk in the project. No evaluation needed.

---

## Explicit Product Decisions

**Decision 1: Thanksgiving window is NOT fully closed — reply today still catches Black Friday.**
Apple's minimum turnaround is 24h when all information is in hand. A reply sent Nov 26 by end of day has a reasonable shot at approval Nov 27 or Nov 28 (Black Friday). Black Friday is #2 ski booking weekend of the year. The Thanksgiving browse window is narrowing but Black Friday is still open. Not "do it later" — do it today.

**Decision 2: Christmas week (Dec 23–Jan 1) is the confirmed fallback launch window if App Review slips past today.**
404 venues. BASE_PRICES 100%. Two-weekend scoring works post-VPS. Catalog is at peak depth for both ski (Alps fully open by Dec 23) and Caribbean beach. Reddit/HN post slots into Dec 23–28. Christmas week is not a consolation prize — ski search volume matches or exceeds Thanksgiving. Reframe internally as "Christmas launch" and stop calling it a miss.

**Decision 3: 40-venue backlog ships as a single batch. No piecemeal adds during freeze. No exceptions.**
Negril, Key West, Davos-Klosters, Flaine, Alpe d'Huez are all high-quality. SXM venue ships only after the airport gap fix is committed first. One commit, all 40, the moment freeze lifts post-App-Review.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. No algorithm changes during App Review.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Ship first. Zero users means zero signal.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Post-launch with analytics.
- **Alert page consolidation** (two branches) — REJECTED. Alerts tab iOS-gated until APNS live.
- **UX review suggestions** (`claude/review-peakly-UQ0Qu`) — REJECTED. No data, no changes.
- **Profile simplification** (`claude/simplify-profile-page-Bi2Tc`) — REJECTED. Code freeze.
- **Onboarding changes** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Rebuilt Aug 2026. No changes without A/B data.
- **Test coverage analysis** (`claude/analyze-test-coverage-WVIsT`) — REJECTED. No test suite exists in this project; the value here is zero.

---

## Success Criteria

**90-day projection (Feb 2027): 5K–8K users. What gets you to 8K:**
- App Review reply today → live Nov 27–28 (Black Friday) → first organic installs from holiday browse
- VPS deployed same day → iOS two-weekend scoring works from first user → no 1-star reviews
- 40-venue batch post-freeze → catalog depth competitive at Christmas (Alps fully open, Caribbean peak)
- Christmas week Reddit post (Dec 23–28) → ski + Caribbean double-peak → 2K+ organic in 72h
- VPS disk cache live → survives a Reddit traffic spike without Open-Meteo rate-limit

**What keeps you at 5K:**
- App Review reply slips past today → Black Friday gone, cold December launch
- VPS still undeployed on launch day → first iOS impressions damaged → 1-star reviews about "wrong dates" and broken alerts
- Reddit post delayed to January → ski season past peak, beach season not yet

---

## One Product Risk Nobody Is Talking About

**The App Review process is running 13 days without a reply. At some point Apple closes the submission and you re-queue.**

Apple's standard is to close a submission that hasn't received a reply within 30 days. We're at day 13. That's not imminent, but it's real. If this drags past day 25–28, the submission `468d466e` gets auto-closed, and Jack has to resubmit a fresh build, re-queue, and restart the review clock — adding another estimated 1–3 weeks. The window between "reply now" and "re-queue from scratch" is shrinking. Every day without a reply is a day of that clock running. This is not abstract. It's a concrete deadline that agents haven't been naming by number.
