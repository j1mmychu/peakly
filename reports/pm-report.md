# Peakly PM Report v222 — 2026-11-25 (LAUNCH DAY +38)

**Status: 🔴 RED — Thanksgiving is TODAY. App Review MISSED +12 days. VPS Day 106. Code freeze Day 25.**

> **Stale prompt notice — Day 50 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v221 → v222)

| Commit | What | Right call? |
|--------|------|-------------|
| `7e5e061` | DevOps report Nov 25 — RED, Day 106 VPS, Thanksgiving TOMORROW | ✅ routine |
| `3f3890a` | Content report Nov 25 — 95/100, 404 venues, 35 backlog, 5 new proposals (Negril, Orient Beach SXM, Avoriaz 1800, Courmayeur, La Plagne) | ✅ routine |

**Zero app code commits for 25 consecutive days.** Code freeze holds. Correct.

**Overnight finding worth carrying forward:** DevOps and Content both flagged a `lateSeason:true` discrepancy (CLAUDE.md says 15, grep found 10). This was a **false alarm** — a methodology bug in the grep. The 15th venue has 10 compact-format entries (`lateSeason:true`) and 5 JSON-format entries (`"lateSeason": true`). Both are valid JS. `grep -c "lateSeason.*true" app.jsx` → **15**, matching CLAUDE.md exactly. No fix needed. Carrying this forward so agents stop re-flagging it.

---

## Overnight Activity (Nov 24 → Nov 25)

1. **Thanksgiving arrived.** The window for catching Thanksgiving browse traffic is now. It's not "in 2 days" anymore — it's today and tomorrow. App Review reply sent today = live tomorrow (Nov 26, Thanksgiving). App Review reply sent tomorrow = post-Thanksgiving. This is the actual last day.

2. **35-venue backlog, all frozen.** Today's 5 proposals: Negril/Seven Mile Beach (MBJ ✅), Orient Beach SXM (SXM — AIRPORT_COORDS gap noted by Content), Avoriaz 1800 (GVA ✅), Courmayeur (TRN ✅), La Plagne (CMF ✅). Negril and Orient Beach SXM are peak Thanksgiving/Christmas Caribbean destinations. SXM airport gap needs to be resolved before that venue can ship — flag for the post-freeze batch.

3. **VPS Day 106.** Unchanged. iOS CORS blocked, two-weekend scoring dead, alert deletion broken. If the App Review reply goes out today and Apple approves by tomorrow, the first App Store users hit a broken mobile experience. This cannot be deferred past the same afternoon as the reply.

4. **`fix-appjsx-final` Day 26, 597 commits ahead.** Still a live rollback bomb. Every day it exists it accumulates more divergence.

5. **22 stale branches.** +1 since yesterday. The count will continue climbing with every agent run that opens a branch. Needs a systematic delete pass.

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +12 days. Thanksgiving is TODAY.

**The window:** Reply today → live Nov 26 (Thanksgiving). Reply tomorrow → post-Thanksgiving. After today, the holiday is gone.

**Submission:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Reply:** `docs/APP_REVIEW_NOTES_SHORT.txt` — <4000 chars, paste-ready. No Mac needed.
**Full notes:** `docs/APP_REVIEW_NOTES.md`
**Phone path:** `docs/PHONE_ONLY_RELEASE.md`

If the Thanksgiving window is already closed (reply goes out Nov 25 PM or later), pivot messaging to **Christmas week (Dec 23–Jan 1)** — equal or larger ski search volume, strong Caribbean beach traffic. Not a failure, just a different launch window.

### 🚨 P0-B — VPS Redeploy: Day 106. Same afternoon as App Review reply.

Same 4 live breakages. Same 15-minute SSH fix. Same commands as every prior report.

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && pm2 status"
curl -s https://peakly-api.duckdns.org/health | jq .
```

Non-negotiable. First App Store users on iOS hit a broken product if this doesn't happen on launch day.

### 🚨 P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 26.

Delete from GitHub while logged in for the App Review reply. 30 seconds. No evaluation, no cherry-picks.

### P1 — SXM (St. Maarten/Orient Beach) AIRPORT_COORDS gap.

Orient Beach SXM is in the content backlog. `SXM` is not in `AIRPORT_COORDS`. Without it, the venue can't ship (would fail the venue-integrity guard). Two options: (a) add SXM to AIRPORT_COORDS (SXM: Princess Juliana, lat 18.0410, lon -63.1089, continent `north_america`) before adding the venue, or (b) sub in `SJU` (San Juan, closest major hub). Option (a) is correct. First post-freeze commit.

### P2 — 22 stale branches.

DEFER except the two P0-C targets. Systematic delete pass post-App Review.

### P2 — Cache stamp `20261031a`: 25 days stale.

DEFER. Auto-bumps on next app.jsx commit. No action until code freeze lifts.

### ✅ CLOSED — lateSeason:true discrepancy (DevOps/Content Nov 25).

False alarm. `grep -c "lateSeason.*true" app.jsx` → **15** (10 compact + 5 JSON format = 15 total). CLAUDE.md count is correct. Stop re-flagging.

### ✅ CLOSED — BASE_PRICES coverage.

100% — 181 airports (confirmed), 0 gaps. Closed.

---

## This Week's Top 3 Priorities

**#1 — App Review reply. 12 days overdue. 10 minutes. Jack only. Last possible day for Thanksgiving.**
`docs/APP_REVIEW_NOTES_SHORT.txt`. No Mac needed. If this doesn't go out today, pivot to Christmas-week launch messaging.

**#2 — VPS Redeploy. Same afternoon as the App Review reply.**
Day 106. iOS CORS blocked = damaged first impressions on every App Store install. Bundle Open #23 (disk cache) into the same SSH session — documented and ready, 30 lines.

**#3 — Delete `fix-appjsx-final` + `restore-appjsx` from GitHub. While logged in for P0-A.**
30 seconds. Single catastrophic rollback risk in the project, Day 26.

---

## Explicit Product Decisions

**Decision 1: Post-Thanksgiving if App Review slips — PIVOT TO CHRISTMAS WEEK, don't treat as failure.**
Christmas week (Dec 23–Jan 1) is equal or larger search volume for ski destinations. If the reply goes out today PM and we miss Thanksgiving, the first Reddit/HN post slots into the Christmas window. The catalog is 404 venues, BASE_PRICES is 100%, two-weekend scoring works post-VPS. A Dec 1 App Store live date with a Dec 23 Reddit post is a viable path. Not the preferred path, but not a failure.

**Decision 2: 35-venue backlog — DEFER to first post-App Review commit as a single batch. No exceptions.**
Negril/Seven Mile Beach (MBJ) and Courmayeur (TRN) and Avoriaz 1800 (GVA) are genuinely high-quality additions. SXM venue requires airport gap fix first. All 35 ship together, one commit, the moment the freeze lifts. Piecemeal adds during code freeze are off the table.

**Decision 3: lateSeason discrepancy is a FALSE ALARM — do not add missing flags.**
All 15 venues listed in CLAUDE.md are confirmed flagged. The reporting agents had a grep methodology bug (not reading JSON-format keys). No code change needed. Update agent instructions to use `grep -c "lateSeason.*true"` not `grep -c "lateSeason:true"`.

---

## Features REJECTED This Week

- **Scoring improvements** (`claude/improve-scoring-system-XYGY6`) — REJECTED. No algorithm changes during App Review. The current algorithm passed smoke tests and ships.
- **Front page redesign** (`claude/redesign-front-page-EndKs`) — REJECTED. Code freeze. Ship first; optimize based on actual user behavior.
- **UI overhaul** (`claude/improve-peakly-ui-UHCHG`) — REJECTED. Post-launch with analytics. Zero users means zero signal.
- **Alert page consolidation** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`) — REJECTED. Alerts tab is iOS-gated until APNS live. UI-only change with no active users.
- **UX review suggestions** (`claude/review-peakly-ux-UQ0Qu`) — REJECTED. Same reasoning as UI overhaul.
- **Profile page simplification** (`claude/simplify-profile-page-Bi2Tc`) — REJECTED. Code freeze.
- **Onboarding changes** (`claude/streamline-onboarding-account-97XRR`) — REJECTED. Rebuilt Aug 2026. No changes without A/B data.

---

## Success Criteria

**90-day projection (Feb 2027): 5K–8K users. What gets you to 8K:**
- App Review reply today → live by Nov 26 → Thanksgiving organic discovery → installs before Christmas
- VPS deployed same day → iOS two-weekend scoring correct from first user → no 1-star reviews about "broken" features
- Reddit post Christmas week (Dec 23–28) → ski season peak + Caribbean Christmas demand → 2K+ organic in 72h
- 35-venue batch post-freeze → catalog depth competitive with Christmas destinations

**What keeps you at 5K:**
- App Review reply slips past today → misses Thanksgiving → cold December launch
- VPS still undeployed on launch day → first iOS impressions damaged
- Reddit post delayed to January → ski season past peak, beach season not yet

---

## One Product Risk Nobody Is Talking About

**The 35-venue backlog contains SXM (Orient Beach) with a broken airport code.**

`SXM` is not in `AIRPORT_COORDS`. If the venue ships with `ap:"SXM"`, the venue-integrity guard will catch it at commit time — which means it fails silently and blocks the commit, or it passes (if the guard has a gap) and ships with broken flight pricing and no continent routing. This isn't just a missing venue. It's a data integrity failure that can silently corrupt the batch commit that ships all 35 venues at once.

**The fix is trivial:** add `SXM: {lat:18.0410, lon:-63.1089}` to `AIRPORT_COORDS` and `SXM` → `"north_america"` to `AP_CONTINENT`. Two lines. First post-freeze commit, before the batch. Flag this for the first coding session.
