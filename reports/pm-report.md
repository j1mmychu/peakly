# Peakly PM Report v212 — 2026-11-15 (LAUNCH DAY +28)

**Status: 🔴 RED — App Review MISSED +2 days (reply NOW). VPS Day 99 (Whistler opens in 6 days). 29 days no code commits.**

> **Stale prompt notice — Day 40 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v211 → v212)

| Commit | What | Right call? |
|--------|------|-------------|
| `033a2b1` | Content report Nov 15 — 89/100, FOR/NAT false alarm corrected, catalog clean | ✅ routine + correction |
| `2bbc538` | DevOps report Nov 15 — Red, App Review MISSED +1d, VPS Day 99, FOR/NAT false alarm cleared | ✅ routine |

**29 consecutive days with zero app code commits.** Still correct. No code churn until App Review resolves.

**FOR/NAT false alarm closed:** Yesterday's Content report flagged `FOR` and `NAT` airports as missing from `AP_CONTINENT`. Confirmed false alarm — both are present in quoted-key format (`"FOR":"latam"`, `"NAT":"latam"` on lines 442/462). No fix needed. The 2 Brazilian beach venues are scoring correctly. Content score restored to 89/100.

---

## Overnight Activity

No app code changes. Two reports, one finding closed:

- **DevOps (Red):** App Review now MISSED +1 day. VPS at Day 99 (unchanged). Cache stamp 15d stale. All structural integrity checks green (5684 braces, 404 venues, 15 lateSeason). FOR/NAT false alarm cleared by DevOps cross-check.
- **Content (89/100):** Score recovered from 87 after false alarm correction. Catalog fully clean — 0 integrity issues across all 15 checks. 225 thin-tag venues remain the only standing deduction (Day 16, deferred).

---

## Bug Triage

### 🚨 P0-A — App Review: MISSED +2 days. Reply NOW.

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Paste-ready reply:** `docs/APP_REVIEW_NOTES.md`

The submission is Guideline 2.1 (Information Needed) — Apple has not auto-rejected it yet, but the window is narrowing. Whistler opens in **6 days (Nov 21)**. The window math has shifted further:

- Submit today (Nov 15) → review 1–3 days → app live Nov 16–18 → **5–7 days before Thanksgiving** ← marginal
- Submit Nov 16 → app live Nov 17–19 → **4–6 days** ← very tight
- Submit Nov 17+ → Thanksgiving effectively lost for new installs; App Store discovery misses the highest-intent ski week of the year

**This is a 10-minute action. The reply is already written.**

### 🚨 P0-B — VPS Redeploy: Day 99. Whistler opens Nov 21 (6 days).

No movement since Aug 11. Hard deadline Nov 20 (one day before Whistler opens). Active live breakage:
1. `forecast_days=7` → two-weekend scoring disabled when proxy is healthy
2. `capacitor://localhost` missing from CORS → iOS shows zero live weather/flight data
3. `DELETE` missing from allowed methods → alert deletion silently fails
4. `_wxCache` in-memory → `pm2 restart` wipes cache → cold traffic spike risks Open-Meteo rate ceiling

**Fix — 10 minutes SSH (Jack only):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Verify `forecast_days:14`. No `npm install` needed.

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 16.

Delete in GitHub UI → Branches. Two clicks each. No code risk. Still not done.

### P2 — Cache stamp `20261031a`: Day 15 stale.

DEFER. Auto-bumps on next app.jsx commit. No action needed until code lands.

### P2 — 21 stale non-main/master branches.

DEFER to post-Reddit (except P0-C rollback bombs above).

---

## This Week's Top 3 Priorities

**#1 — Submit App Review reply. OVERDUE by 2 days.**
`docs/APP_REVIEW_NOTES.md` → App Store Connect → paste + screen recording → Submit Reply. 10 minutes. The Thanksgiving window is bleeding out every day this waits.

**#2 — VPS Redeploy. Due: Nov 20 (5 days, hard).**
10-minute SSH. Must land before Whistler opens or two-weekend scoring is broken during peak ski traffic. `server/proxy.js` already committed — just needs to be copied to the VPS.

**#3 — Delete `fix-appjsx-final` and `restore-appjsx` branches (P0-C).**
Two clicks in GitHub UI. These are rollback bombs sitting in the branch list. Zero upside to leaving them. Zero risk to deleting them.

---

## Explicit Product Decisions

**Decision 1: App Review reply — SHIP NOW. The only P0 action that moves the needle today.**
Every hour of delay tightens the Thanksgiving window. The reply is ready. The build is uploaded. This is a pure execution gap, not a product gap.

**Decision 2: VPS redeploy — SHIP before Nov 20 (non-negotiable hard stop).**
Two-weekend scoring is the product's core moat. It is broken in production until this lands. The Whistler opening weekend is the year's highest-intent ski discovery event and we will serve broken scoring through it if this doesn't happen.

**Decision 3: 225 thin-tag venues — DEFER past Reddit launch (unchanged, Day 16).**
Tags affect search corpus, not scoring. Zero impact on the Thanksgiving/Whistler traffic window. Ship this in week 2 post-Reddit.

**Decision 4: FOR/NAT AP_CONTINENT fix — CUT (false alarm confirmed).**
Both airports are already correctly present in AP_CONTINENT in quoted-key format. No fix needed. P1-A from v211 is closed.

**Decision 5: JSON-LD structured data + static h1 fallback — SHIP in sprint 1 post-App-Review.**
~2–4 hours total, 10–20% organic SEO lift. No App Review risk. Bundle into the first post-review code sprint alongside the cache stamp bump.

---

## Features Rejected This Week

- **Loading screen enhancement** (`claude/enhance-loading-screen-rZ1dc`): Zero user complaints about loading screens. No data showing this causes bounce. With App Review pending, this is aesthetics at the wrong moment. REJECTED.
- **Scoring system improvement** (`claude/improve-scoring-system-XYGY6`): Scoring changes require an algorithm audit per CLAUDE.md. No user data to anchor changes to. REJECTED until post-Reddit with real usage data.
- **Front page redesign** (`claude/redesign-front-page-EndKs`): With App Review pending, any visual redesign introduces regression risk and may restart the review clock if it touches UI. REJECTED.
- **UX review** (`claude/review-peakly-ux-UQ0Qu`): Without real user data (Plausible drop-off analysis), UX hunches are speculation. REJECTED until post-Reddit.
- **Alert page condense/simplify** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`): Alerts gated on iOS. With App Review unresolved, changing alert UI is the wrong priority. REJECTED.
- **Profile page simplify** (`claude/simplify-profile-page-Bi2Tc`): No user data on where Profile causes friction. REJECTED.

---

## Success Criteria

**90-day projection from Reddit launch (target: Reddit post Nov 21–25):**
- **5K users:** App Store live by Nov 20, VPS deployed before Whistler, Reddit post in November
- **8K users:** App Store live by Nov 15–17 (now Nov 16–18 at earliest), VPS deployed before Whistler, Reddit post Nov 21–22 (hook: Whistler + Thanksgiving convergence), one organic share

**What has to be true for 8K, not 5K:**
1. App Review reply submitted TODAY → app live Nov 16–18 → inside Thanksgiving planning window
2. VPS deployed by Nov 20 → two-weekend scoring works on Whistler opening weekend
3. Reddit post timed to Nov 21 (hook: "Whistler just opened — here's where the best ski conditions are right now")
4. Post-launch monitoring active before the Reddit spike
5. No "conditions unavailable" banner greeting the spike (requires disk cache fix — Open #23 — bundled with VPS redeploy)

**Current trajectory:** Both unresolved P0s are still 10-minute Jack actions. The gap between 5K and 8K is execution, not engineering. The 8K scenario is now contingent on the App Review reply going out today.

---

## One Product Risk Nobody Is Talking About

**The cold-cache window.** When Jack does the VPS redeploy (must happen by Nov 20), `pm2 restart` wipes `_wxCache` in-memory — and Whistler opening weekend is the exact moment when traffic spikes. A cold VPS cache on Nov 21 could exceed Open-Meteo's free-tier rate ceiling within the first hour of a Reddit post, flipping every venue card to "conditions unavailable" at the precise moment new users are forming their first impression. Open #23 (disk persistence for `_wxCache`, ~30 lines) must be bundled into the same VPS SSH session as the redeploy, not deferred. It's a 20-minute addition to a session Jack already needs to open. If it ships without disk cache, the redeploy itself creates a new failure mode on the highest-traffic day of the year.

---

*Next report: v213, 2026-11-16. If App Review reply submitted: status upgrades to AMBER. If VPS redeployed: Green on P0-B.*
