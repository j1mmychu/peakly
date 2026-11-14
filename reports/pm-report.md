# Peakly PM Report v211 — 2026-11-14 (LAUNCH DAY +27)

**Status: 🔴 RED — App Review hard stop MISSED. VPS Day 98 (Whistler opens in 7 days). 28 days no code commits.**

> **Stale prompt notice — Day 39 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v210 → v211)

| Commit | What | Right call? |
|--------|------|-------------|
| `643cee5` | DevOps report Nov 14 — VPS Day 98, App Review hard stop MISSED, cache 14d stale | ✅ routine |
| `a09d984` | Content report Nov 14 — 87/100, NEW FOR/NAT AP_CONTINENT gap, thin-tag 225 Day 15 | ✅ routine + new finding |

**28 consecutive days with zero app code commits.** Correct. No code churn until App Review resolves.

**New actionable finding from Content:** `beach_jericoacoara` and `beach_pipa_brazil` have `FOR`/`NAT` airports present in `AIRPORT_COORDS` but missing from `AP_CONTINENT`. Continent-aware scoring may mis-route these 2 venues. Fix is 2 lines (add `FOR: "latam"` and `NAT: "latam"` to AP_CONTINENT in app.jsx). This is the only new code-eligible finding today.

---

## Overnight Activity

No app code changes. Two reports, one new finding:

- **DevOps (Red):** App Review hard stop classified as MISSED (Nov 14 was yesterday). VPS Day 98. Cache stamp 14d stale. 19 stale branches unchanged. All structural integrity checks green (5684 braces, 404 venues, 15 lateSeason, Sentry DSN live).
- **Content (87/100):** Dropped 1 point. First content integrity gap in 15 days: `FOR` and `NAT` airports missing from AP_CONTINENT — 2 Brazilian beach venues may mis-route. Fix is surgical, 2 lines.

**New branches from prior exploratory sessions:** 15 stale `claude/*` branches plus `fix-appjsx-final`, `restore-appjsx`, `cursor/finish-peakly-ship-c015`, `master`, `test-small`. Delete after App Review resolves. Nothing to merge.

---

## Bug Triage

### 🚨 P0-A — App Review hard stop: PASSED. Reply NOW.

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Paste-ready reply:** `docs/APP_REVIEW_NOTES.md`

The Nov 14 hard stop has passed. The submission is in Guideline 2.1 (Information Needed) — Apple has not auto-rejected it; it is waiting for a reply. Every day of delay tightens the Whistler/Thanksgiving window further.

**Window math as of Nov 14:**
- Submit today (Nov 14) → review 1–3 days → app live Nov 15–17 → **8–10 days before Thanksgiving ski window** ← tight but workable
- Submit Nov 15 → app live Nov 16–18 → **5–7 days** ← marginal for Thanksgiving
- Submit Nov 16+ → Thanksgiving effectively gone for new installs; App Store discovery misses the highest-intent ski week of the year

**This is the only P0 that requires Jack's attention right now. 10 minutes.**

### 🚨 P0-B — VPS Redeploy: Day 98. Whistler opens Nov 21 (7 days).

No movement since Aug 11. Active live breakage (unchanged):
1. `forecast_days=7` → ski venues drop off front page beyond day 6 → breaks exactly at peak ski traffic
2. `capacitor://localhost` missing from CORS → iOS shows zero live weather/flight data
3. `DELETE` missing from allowed methods → alert deletion silently fails
4. `_wxCache` in-memory → `pm2 restart` wipes cache → cold traffic spike risks Open-Meteo rate ceiling

**Hard deadline: Nov 20.** Whistler opens Nov 21. If this misses, two-weekend scoring is broken on the highest-discovery-probability weekend of the year.

**Fix — 10 minutes SSH (Jack only):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Verify `forecast_days:14`. No `npm install` needed.

### P1-A — `FOR`/`NAT` missing from AP_CONTINENT (new, Day 1)

Two Brazilian beach venues (`beach_jericoacoara`, `beach_pipa_brazil`) have valid `AIRPORT_COORDS` entries but missing `AP_CONTINENT` mappings. Continent-aware scoring may mis-route. Fix:

```
// In AP_CONTINENT object in app.jsx:
FOR: "latam",
NAT: "latam",
```

This is 2 lines. It is the right thing to do before Reddit launch (data integrity). It does **not** require a cache-stamp change alone — but the auto-push hook will bump it on commit. Low risk. Ship it now or bundle with VPS code sprint.

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 15.

Delete in GitHub UI → Branches. Two clicks each. No code risk. No downside. Still not done.

### P2 — Cache stamp `20261031a`: Day 14 stale.

DEFER. Auto-bumps on next app.jsx commit. No action needed until code lands.

### P2 — 21 stale non-main/master branches.

DEFER to post-Reddit (except P0-C rollback bombs above).

---

## This Week's Top 3 Priorities

**#1 — Submit App Review reply. OVERDUE.**
`docs/APP_REVIEW_NOTES.md` → App Store Connect → paste + screen recording → Submit Reply. 10 minutes. The Thanksgiving window is bleeding out every hour this waits.

**#2 — VPS Redeploy. Due: Nov 20 (7 days, hard).**
Same 10-minute SSH. Must land before Whistler opens or two-weekend scoring is broken during peak ski traffic. No code changes required — committed `server/proxy.js` is ready.

**#3 — Fix FOR/NAT AP_CONTINENT gap.**
2 lines in app.jsx. One of the cleanest data integrity fixes possible. Brazilian beach venues are live with a mis-routing risk. Ship it in the same session as whatever code change triggers the next auto-push.

---

## Explicit Product Decisions

**Decision 1: FOR/NAT AP_CONTINENT fix — SHIP immediately.**
2-line fix, zero risk, real data integrity gap. This should not wait for Reddit launch.

**Decision 2: Peakly Pro ($9/mo vs $79/yr discrepancy) — STILL CUT.**
Pro UI was removed April 2026. No pricing is showing anywhere in the live app. Stale prompt artifact. Do not build Pro until after 1K MAU. Update the cron prompt.

**Decision 3: 225 thin-tag venues — DEFER to week after Reddit launch.**
Tags affect search corpus, not scoring. Zero impact on Thanksgiving traffic or App Review. Right call to continue deferring.

**Decision 4: JSON-LD structured data + static h1 fallback — SHIP in sprint 1 post-App-Review.**
~2–4 hours total, 10–20% organic SEO lift. No App Review risk. Bundle into the first post-review code sprint.

**Decision 5: Branch cleanup (non-rollback-bomb) — DEFER to post-Reddit.**
19 stale branches are noise, not risk. The `fix-appjsx-final` and `restore-appjsx` exceptions remain P0-C.

---

## Features Rejected This Week

- **Loading screen enhancement** (`claude/enhance-loading-screen-rZ1dc`): Zero user complaints about loading screens. No data showing this causes bounce. With App Review pending and no live users, this is pure aesthetics at the wrong moment. REJECTED.
- **Scoring system improvement** (`claude/improve-scoring-system-XYGY6`): Scoring changes require an algorithm audit per CLAUDE.md. No audit has been run. No user data to anchor changes to. REJECTED.
- **Front page redesign** (`claude/redesign-front-page-EndKs`): With App Review pending, any visual redesign introduces regression risk and may restart the App Review clock if it touches UI. REJECTED.
- **UX review** (`claude/review-peakly-ux-UQ0Qu`): Without real user data (Plausible drop-off analysis), UX hunches are speculation. Post-Reddit launch, we'll have signal. REJECTED.
- **Alert page condense/simplify** (`claude/condense-alert-page-jzdLo`, `claude/simplify-alerts-page-2ejGB`): Alerts are gated on iOS anyway. With App Review unresolved, changing alert UI is the wrong priority. REJECTED.
- **Profile page simplify** (`claude/simplify-profile-page-Bi2Tc`): No user data on where Profile causes friction. REJECTED.
- **Venue data standardize** (`claude/standardize-venue-data-CufiQ`): The catalog is frozen per post-PM-v193 directive. The 2-line FOR/NAT fix is the only data touch that's warranted. REJECTED as a larger project.

---

## Success Criteria

**90-day projection from Reddit launch (target: Reddit post Nov 21–25):**
- **5K users:** App Store live by Nov 20, VPS deployed before Whistler, Reddit post in November
- **8K users:** App Store live by Nov 15–17, VPS deployed before Whistler, Reddit post Nov 21–22 (hook: Whistler + Thanksgiving convergence), one organic share

**What has to be true for 8K, not 5K:**
1. App Review reply submitted TODAY → app live by Nov 15–17 → inside Thanksgiving planning window
2. VPS deployed by Nov 20 → two-weekend scoring works on Whistler opening weekend
3. Reddit post timed to Nov 21 (hook: "Whistler just opened — here's where the best ski conditions are right now")
4. Post-launch monitoring active before the Reddit spike
5. No "conditions unavailable" banner greeting the spike (requires disk cache fix — Open #23 — bundled with VPS redeploy)

**Current trajectory:** Both unresolved P0s are 10-minute Jack actions. The gap between 5K and 8K is execution, not engineering. Every day of App Review delay costs ~1–2 days of Thanksgiving window.

---

## One Product Risk Nobody Is Talking About

**The App Review reply has the highest single-action ROI of anything on the roadmap, and it's been ready for weeks.** The replay of a user's first Peakly session matters enormously for retention — and that first session is most likely to happen when the ski season is emotionally live for them: when Whistler announces its opening, when their ski trip group chat starts pinging, when they search "ski weekends from NYC" at Thanksgiving. Those moments are time-bound and irreplaceable. An app that isn't in the App Store when that search happens doesn't get a second chance at that user. The window to become the habitual ski-weekend app for the 2026–2027 season is literally right now, measured in days. The binary hasn't changed, the reply is drafted, and the submission is waiting. The only question is whether the reply gets sent.

---

*Next report: v212, 2026-11-15. If App Review reply submitted: status upgrades to AMBER. If VPS redeployed: Green on that item.*
