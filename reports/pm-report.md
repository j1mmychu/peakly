# Peakly PM Report v224 — 2026-11-27 (LAUNCH DAY +40, Black Friday / Cyber Monday)

**Status: 🔴 RED — App Review MISSED +14 days (2 full weeks). Black Friday is TODAY. Cyber Monday travel booking in full swing. VPS Day 108 undeployed. Code freeze Day 27.**

> **Stale prompt notice — Day 52 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v223 → v224)

| Commit | What | Right call? |
|--------|------|-------------|
| `40cdce0` | DevOps report Nov 27 — RED, VPS Day 108, App Review MISSED +14d | ✅ routine |
| `ae54156` | Content report Nov 27 — 97/100, 404 venues, Black Friday peak, 5 new proposals (Davos-Klosters, Avoriaz, La Plagne, Orient Beach SXM, Playa Norte) | ✅ routine |

**Zero app code commits for 27 consecutive days.** Code freeze holds. Correct until App Review resolves.

**Overnight (Nov 26 → Nov 27):**
- Thanksgiving window closed. Black Friday is now live — #2 ski booking weekend of the year.
- Cyber Monday travel booking window opened. Ski searches are peaking globally.
- 40-venue backlog grew to ~45 proposals (Content added 5 more: Davos-Klosters, Avoriaz, La Plagne, Orient Beach SXM, Playa Norte). All frozen.
- 20 stale branches unchanged. Not a live risk.
- No new P0s introduced. All core checks green.

---

## Overnight Activity (Nov 26 → Nov 27)

**Black Friday is TODAY.** This is the moment the last 14 reports have been building toward. Ski search volume is at its seasonal peak. Peakly is not in the App Store. The app is fully ready — VPS redeploy is 15 minutes away; App Review reply is 10 minutes away. The only thing standing between this product and its best launch window is a single reply to Apple.

**The auto-close clock.** Apple's standard is 30 days before closing an unanswered submission. We are at day 14. That leaves ~16 days before `468d466e-ab22-4db5-bc51-d897a9bcfb8e` gets auto-closed. If it closes, Jack resubmits a fresh build, re-queues, and restarts the review clock — adding 1–3 weeks. The window between "reply now and catch Christmas" and "re-queue and miss ski season entirely" is a 16-day band. It is not abstract. It ends around Dec 13.

**Cyber Monday travel week.** Even if Black Friday specifically is missed, the Cyber Monday / travel-deal-week window (Nov 27–Dec 2) is live right now. Users booking Christmas ski trips are in full swing. First App Store impression during this window still converts.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +14 days. Black Friday is TODAY. Auto-close clock: ~16 days.

**Single highest-leverage action in the project.** One reply. 10 minutes. No Mac required.

- **Submission:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
- **Reply text:** `docs/APP_REVIEW_NOTES_SHORT.txt` — <4000 chars, paste-ready
- **Path:** `docs/PHONE_ONLY_RELEASE.md`

Reply TODAY (Nov 27) → Apple fastest approval Nov 28–29 → app live Cyber Monday weekend → first organic ski installs from peak booking traffic.
Reply by Dec 13 → catch Christmas week (Dec 23–Jan 1), still a strong window.
Past Dec 13 → submission auto-closes → re-queue → miss ski season peak entirely.

### 🚨 P0-B — VPS Redeploy: Day 108. Same afternoon as App Review reply.

Four live breakages that break first iOS impressions:
- Two-weekend scoring disabled (iOS CORS blocked)
- Alert deletion silently fails
- Disk cache not live (cold restart spikes Open-Meteo)
- iOS native blocked from proxy entirely

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && pm2 status"
curl -s https://peakly-api.duckdns.org/health | jq .
```

### 🚨 P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 27.

647 commits ahead on `fix-appjsx-final`. One merge by an automated agent ends the project. Delete both branches from GitHub while logged in for the App Review reply. 30 seconds.

### P1 — SXM AIRPORT_COORDS gap (blocks Orient Beach SXM venue).

`SXM` missing from `AIRPORT_COORDS`. Two-line fix — first post-freeze commit, before the 40-venue batch.
```
SXM: {lat:18.0410, lon:-63.1089}  // AIRPORT_COORDS
"SXM": "north_america"             // AP_CONTINENT
```

### P2 — 20 stale remote branches.

DEFER. Systematic delete post-App Review, while logged into GitHub for the reply.

### P2 — Cache stamp `20261031a`: 27 days stale.

DEFER. Auto-bumps on next app.jsx commit. Correct during freeze.

### ✅ CLOSED — lateSeason:true count discrepancy.

15 confirmed (10 unquoted + 5 JSON-quoted). CLAUDE.md correct. Methodology was the bug. Stop flagging.

### ✅ CLOSED — BASE_PRICES coverage.

183 entries, 165 unique venue APs, 0 gaps. 100%.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 14 days overdue. Reply TODAY for Cyber Monday. Auto-close ~16 days out.**
`docs/APP_REVIEW_NOTES_SHORT.txt`. No Mac. No Xcode. One paste. This is the entire company right now.

**#2 — VPS Redeploy. Same afternoon as the reply.**
Day 108. First iOS users hit broken two-weekend scoring without it. Bundle Open #23 disk cache — documented, same SSH session, 30 extra lines.

**#3 — Delete `fix-appjsx-final` + `restore-appjsx`. While logged into GitHub for the reply.**
30 seconds. Only catastrophic risk in the codebase. Do it while already logged in.

---

## Explicit Product Decisions

**Decision 1: Black Friday window is NOT closed. Cyber Monday / travel booking week is live RIGHT NOW.**
Nov 27–Dec 2 is peak travel-deal-search week. Ski booking searches are at seasonal high. A reply today + fastest Apple turnaround = live Cyber Monday weekend. This is not "almost missed it" — it's "do it right now."

**Decision 2: Christmas week (Dec 23–Jan 1) is the locked fallback window. Not a consolation prize.**
404 venues. BASE_PRICES 100%. VPS ready to deploy. Alps fully open by Dec 23. Caribbean peak. Reddit post slots Dec 23–28. Ski + Caribbean double-peak with 40 new venues committed. Christmas week may actually outperform a cold Thanksgiving launch.

**Decision 3: 40-venue backlog ships as one batch immediately after first post-freeze code commit.**
SXM airport gap fix first (2 lines), then the full 40. No piecemeal adds. One commit, full batch, day freeze lifts. Davos-Klosters, Avoriaz, La Plagne are peak Alps inventory — every day without them is a gap.

---

## Features REJECTED This Week

- **Scoring overhaul** (`claude/improve-scoring-system-XYGY6`) — REJECTED. No algorithm changes during App Review. Zero users means zero signal to tune against.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Ship first. Ships run on data, not intuition.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Post-launch with analytics.
- **Alert page consolidation** (two branches: `claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts iOS-gated until APNS live. No value.
- **Code review cleanup** (`claude/code-review-cleanup-HjoCS`) — REJECTED. 14,256-line single-file monolith by design. Code quality reviews without tests are aesthetic work.
- **UX review suggestions** (`claude/review-peakly-ux-UQ0Qu`) — REJECTED. No users, no data, no changes.
- **Profile simplification** (`claude/simplify-profile-page-Bi2Tc`) — REJECTED. Code freeze.
- **Onboarding overhaul** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Rebuilt Aug 2026. No A/B data.
- **Test coverage analysis** (`claude/analyze-test-coverage-WVIsT`) — REJECTED permanently. No test suite exists and none should exist in a single-file no-build architecture. This is not a gap; it's the architecture.

---

## Success Criteria

**90-day projection (Feb 2027): 5K–8K users. What gets you to 8K:**
- Reply today → live Cyber Monday / Christmas → first installs during peak ski booking traffic
- VPS deployed same day → iOS two-weekend scoring works from first user → no 1-star reviews about broken dates
- 40-venue batch post-freeze → catalog depth competitive at Christmas (Alps fully open, Caribbean peak)
- Christmas week Reddit/HN post (Dec 23–28) → ski + Caribbean double-peak → 2K+ organic in 72h
- VPS disk cache live → survives a Reddit traffic spike without Open-Meteo rate-limit blowout

**What keeps you at 5K:**
- App Review reply slips past Dec 13 → submission auto-closes → re-queue → miss ski season peak entirely
- VPS still undeployed on launch day → first iOS impressions damaged → 1-star reviews
- Reddit post delayed to January → ski season past peak, beach not yet

---

## One Product Risk Nobody Is Talking About

**The Cyber Monday / travel-booking-week window (Nov 27–Dec 2) is live right now and nobody has named it as a distinct target.**

Every report for two weeks has been framed as "Thanksgiving" and then "Black Friday." Cyber Monday is a separate, often larger travel booking event — people book Christmas ski trips specifically this week because they've just been given time off and have credit card bandwidth from their holiday paycheck. It runs through Dec 2.

App Review fastest turnaround after a complete reply is 24–48h. A reply sent today (Nov 27) has a real shot at being live by Nov 29 (Sunday) or Nov 30 (Cyber Monday itself). That's not a consolation prize for missing Thanksgiving — that's arguably the better slot: people are actively booking Christmas ski trips, not just browsing.

The risk is treating this window as already missed. It isn't.
