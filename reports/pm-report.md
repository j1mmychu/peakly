# Peakly PM Report v209 — 2026-11-12 (LAUNCH DAY +25)

**Status: 🔴 RED — VPS KNOWN-BROKEN (Day 96). App Review reply NOT submitted (2 days to hard stop Nov 14). Whistler opens in 9 days. Thanksgiving in 15 days.**

> **Stale prompt notice — Day 37 (still unchanged):** Stored cron prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface. This notice stays in every report until it's fixed.

---

## Shipped Since Last Report (v208 → v209)

| Commit | What | Right call? |
|--------|------|-------------|
| `f068960` | DevOps report Nov 12 — VPS Day 96, cache 12d stale, App Review 2d hard stop | ✅ routine |
| `ccbb917` | Content report Nov 12 — CLEAN (404 venues), Thanksgiving 9d out, lateSeason 15 | ✅ routine |

**26 consecutive days with zero app code commits.** Still correct. Both Jack-gated blockers remain unresolved.

---

## Overnight Activity

No app code changes. Three reports, all pointing at the same two items:

- **DevOps (Red):** VPS Day 96. Cache stamp 12 days stale. App Review hard stop Nov 14. `fix-appjsx-final` rollback bomb Day 13. No code commits.
- **Content (88/100 Clean):** 404 venues, 0 integrity issues. Thanksgiving window opens in 9 days (Nov 21 — same day Whistler opens). Thin-tag 225 venues Day 13.
- **New branches this session:** 15 new exploratory `claude/*` branches from prior sessions (see v208 for full list). Not merge candidates. Delete post-Reddit.

**Notable shift:** Nov 14 is now 2 days away. This is no longer "submit soon" — it's "submit today or tomorrow." The Thanksgiving ski window is the highest organic discovery event of the year for Peakly. Missing it is not a minor slip; it pushes the 90-day ceiling from 8K to 5K users.

---

## Bug Triage

### 🚨 P0-A — App Review Guideline 2.1 reply: NOT SUBMITTED. 2 days to hard stop.

**Submission ID:** `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
**Paste-ready reply:** `docs/APP_REVIEW_NOTES.md`

This is a copy-paste action in App Store Connect. Not a code change. Estimated time: 10 minutes.

**Window math as of Nov 12:**
- Submit today → review 1–3 days → app live Nov 13–15 → **12–14 days before Thanksgiving** ← strong window
- Submit Nov 14 (hard stop) → app live Nov 15–17 → **10–12 days** ← acceptable
- Submit Nov 15+ → app live Nov 16–18 → **9–11 days** ← marginal
- Submit Nov 20+ → Thanksgiving is gone. Full stop.

**Nov 14 is the absolute deadline.** Submit by EOD Thursday.

### 🚨 P0-B — VPS Redeploy: Day 96. Whistler opens in 9 days.

No movement. Nine days until Whistler. Fifteen days until Thanksgiving. The two most important ski traffic events of the year arrive while the VPS is running 96-day-old code that breaks two-weekend scoring.

**Active breakage on live VPS:**
1. `forecast_days=7` → ski venues drop off front page beyond day 6 → peak ski traffic, invisible ski venues
2. `capacitor://localhost` absent from CORS → iOS shows zero live weather/flight data
3. `DELETE` missing → alert deletion silently fails
4. `_wxCache` in-memory → pm2 restart after redeploy wipes cache → cold traffic spike risks Open-Meteo rate ceiling

**Fix — 10 minutes SSH:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
Verify `forecast_days:14` in health response.

### P0-C — `fix-appjsx-final` + `restore-appjsx` rollback bombs: Day 13.

No common ancestor with main. Two clicks to delete in GitHub UI. Still not done. These are live risk every time someone opens the PR interface.

### P2 — Cache stamp `20261031a`: Day 12 stale.

DEFER. Bumps automatically on next app.jsx commit. No action needed.

### P2 — 21 stale non-main/master branches.

DELETE post-Reddit. `fix-appjsx-final` and `restore-appjsx` are the only urgent deletes.

---

## This Week's Top 3 Priorities

**#1 — Submit App Review reply. Due: Nov 14 (2 days).**
`docs/APP_REVIEW_NOTES.md` → App Store Connect → copy-paste. 10 minutes. Everything else is irrelevant until this is done.

**#2 — VPS Redeploy. Due: Before Nov 21 (Whistler opens).**
The 10-minute SSH task above. Ski season launches with two-weekend scoring broken if this doesn't happen. Nine days left.

**#3 — Delete rollback bomb branches.**
GitHub UI → Branches → delete `fix-appjsx-final` → delete `restore-appjsx`. Two clicks each. No downside. The only reason this isn't done yet is inertia.

---

## Explicit Product Decisions

**Decision 1: Peakly Pro ($9/mo vs $79/yr discrepancy) — CUT.**
The stored cron prompt flags this as a live bug. It is not. Pro UI was removed from the codebase in April 2026. No pricing is showing. The "discrepancy" is a stale prompt artifact. Update the cron prompt. Do not build Pro until after 1K MAU.

**Decision 2: JSON-LD structured data — SHIP in sprint 1 post-App-Review.**
10–20% organic lift on venue-name searches. 2–4 hour implementation. No App Review risk. First item in the post-launch sprint.

**Decision 3: Static h1 fallback — SHIP in sprint 1 post-App-Review.**
Bundle with JSON-LD. 30 minutes. No reason to defer past that sprint.

**Decision 4: 225 thin-tag venues — DEFER to week after Reddit launch.**
Tags affect search corpus, not scoring. Zero impact on Thanksgiving traffic. Deferred.

**Decision 5: Post-launch monitoring plan — SHIP before Reddit post.**
This is now urgent. The agents cannot see Plausible or Sentry. When the Reddit post lands and real users hit the app, issues will surface that no audit caught. Jack needs a manual monitoring protocol for launch week — Sentry errors, Plausible drop-offs, Open-Meteo rate limit warnings from the VPS health endpoint. A 1-page checklist. Needs to exist before the Reddit post goes up, not after.

---

## Features Rejected This Week

- **Test coverage analysis** (`claude/analyze-test-coverage-WVIsT`): There are no tests. This is a Babel-in-browser SPA with no test harness. Writing tests now is premature infrastructure. REJECTED.
- **Code review cleanup** (`claude/code-review-cleanup-HjoCS`): With App Review pending and 26 days of no code changes, any code churn introduces regression risk. REJECTED — wrong timing.
- **Onboarding streamline** (`claude/streamline-onboarding-account-97XRR`): Onboarding was rebuilt in August. No user complaints. REJECTED — no signal.
- **Venue data standardization** (`claude/standardize-venue-data-CufiQ`): Content confirms 0 integrity issues on 404 venues. No standardization problem exists to solve. REJECTED.

---

## Success Criteria

**90-day projection from Reddit launch:**
- **5K users:** App Store live by Nov 20, VPS deployed before Whistler, Reddit post in November
- **8K users:** App Store live by Nov 15, VPS deployed before Whistler, Reddit post before Thanksgiving, one organic share or media pickup

**What has to be true for 8K, not 5K:**
1. App Review reply submitted by Nov 14 → app live by Nov 15–17 → 10+ days of Thanksgiving window
2. VPS deployed by Nov 20 → ski venues visible during Whistler opening weekend
3. Reddit post timed to Nov 21–25 (Whistler + Thanksgiving ski weekend convergence is the perfect hook)
4. Post-launch monitoring catches and resolves any P0 within 24 hours of Reddit spike

**Current trajectory:** Both unresolved blockers are 10-minute Jack actions, not engineering work. The gap between 5K and 8K is entirely execution, not product.

---

## One Product Risk Nobody Is Talking About

**There is no post-launch recovery plan.** When the Reddit post goes up and 500 people hit the app simultaneously, the VPS `_wxCache` starts cold (it was just restarted for the redeploy). Every user triggers live Open-Meteo requests. The free tier handles ~66 concurrent users on the same venue set before rate-limiting starts. With a Reddit spike, that threshold is crossed in seconds. The fallback (direct Open-Meteo from the client) exists, but if Open-Meteo rate-limits the VPS IP, the proxy becomes a bottleneck instead of protection. The 30-line disk-cache fix (Open #23) has been open since July. It's the difference between a smooth launch and a "conditions unavailable" banner greeting the Reddit spike. This should be deployed alongside the VPS redeploy. Same SSH session. Same restart.

---

*Next report: v210, 2026-11-13. If App Review has been submitted, this report will look very different.*
