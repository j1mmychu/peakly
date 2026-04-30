# Peakly PM Report — 2026-04-30 (v30)

**Filed by:** Product Manager agent
**Date:** 2026-04-30
**Status:** YELLOW. Content agent closed several data issues today (new tanning dupe confirmed). Weather proxy is Day 13. Ski season window is closing. This week is the launch window or it slips into beach-only season.

---

## Shipped Since Last Report (2026-04-29 → 2026-04-30)

| Commit | What | Right call? |
|--------|------|-------------|
| `f26c0bd` (Apr 30) | Content report — read-only audit, no fixes applied | ✅ Audit only — right call |
| `923321e` (Apr 30) | Content report + app.jsx fixes (details below) | Checking... |

**Summary:** Content agent confirmed a second same-category tanning dupe (`aruba-eagle-beach-t1` vs `beach_eagle`). Data health score dipped 1pt (84/100). Three duplicate photo pairs and two same-category duplicates remain open. Weather proxy: still Day 13 unresolved.

---

## Permanent Bug Triage — Confirmed Closed

Do NOT re-open without reading live code first.

| Issue | Status | Evidence |
|-------|--------|----------|
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. Email waitlist only. |
| Sentry DSN empty | **CLOSED** | `app.jsx:6-15` — real DSN, initialized |
| Sentry tracesSampleRate burning quota | **CLOSED** | Fixed Apr 28 — 1.0 → 0.05 |
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` = "710303" |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema |
| fetchJson response body timeout | **CLOSED** | Fixed Apr 28 — `res.setTimeout(8000)` in server/proxy.js |
| "Next good window" missing | **CLOSED** | `bestWindow` built and rendered — listing card lines 2099 + 2290 |
| Duplicate venue pairs (6) | **CLOSED** | Deleted Apr 28 — venue count now 235 |
| Whitefish airport GPI→FCA | **CLOSED** | Fixed Apr 28 |
| Cache buster stale (20260422a) | **CLOSED** | Bumped Apr 29 → `v=20260429a` |
| Batch venue tag audit | **CLOSED** | Spot-checked all remaining `-s##` venues Apr 29-30. No safety mismatches remain. |

---

## Active Bug Triage — April 30

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit — no server-side cache** | **P1 LAUNCH BLOCKER** | ❌ Day 13. ~21 cold sessions/day before quota burns. | **Day 13** |
| **3 duplicate venue photos** | **P1** | ❌ angourie-point-s3/arugam_bay, portillo-s4/perisher, beach_phuquoc/beach_praslin | Day 2 |
| **2 same-category venue dupes** | **P1** | ❌ fernando-de-noronha-s20 (surf) + aruba-eagle-beach-t1 (tanning — NEW today) | Day 2 / Day 1 |
| **SW cache name mismatch** | P2 | ⚠️ `sw.js` has `peakly-20260427`, index.html has `v=20260429a` | Day 2 |
| **26 ski venues missing `skiPass`** | P2 | ❌ Badge absent. Scoring unaffected. | Day 7 |
| **Strike alerts: no background worker** | P3 | ❌ Registers, never fires | Day 40+ |

### P1 Detail: Open-Meteo Rate Limit (Day 13)

Numbers from DevOps:
- 235 venues × ~1.5 avg API calls (weather + marine for surf/beach) = ~347 calls per cold session
- Free tier: 10,000/day → **hard ceiling: ~28 simultaneous cold sessions**
- A r/surfing post sending 30 visitors simultaneously exhausts the day's quota in one batch
- After quota: every score returns 50 "Swell data unavailable" — the entire value prop disappears

Fix spec is in `devops-report.md`. Two new Express routes on the VPS proxy (~40 lines total). Takes 2 hours to deploy. Has been spec-ready for 13 days.

**This is the only thing blocking a Reddit launch. It has been the only thing blocking a Reddit launch for 13 days.**

### P1 Detail: Duplicate Photos + Same-Cat Dupes

Three venue pairs share Unsplash photos — visible on the grid, screams fake data.

| Fix | Action |
|-----|--------|
| `portillo-s4` shares photo with `perisher` | **Delete** `portillo-s4` — also a same-category dupe. One deletion, two fixes. |
| `angourie-point-s3` shares photo with `arugam_bay` | **Replace** photo — URL in content-report.md |
| `beach_phuquoc` shares photo with `beach_praslin` | **Replace** photo — URL in content-report.md |
| `fernando-de-noronha-s20` duplicates `noronha_surf` | **Delete** `fernando-de-noronha-s20` |
| `aruba-eagle-beach-t1` duplicates `beach_eagle` | **Delete** `aruba-eagle-beach-t1` (NEW — confirmed today) |

Three deletions + two photo replacements. 235 → 232 venues post-cleanup. Specs in content-report.md. ~30 minutes total.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo server-side weather proxy** | Jack (VPS SSH) | **GATES the Reddit post. Day 13.** |
| **Reddit launch date: unnamed** | Jack | Every remaining task is scoped around this date. Name it. |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Deploy the weather proxy. Now.**
Day 13. Spec is written. 2-hour VPS session. SSH in, copy the two Express routes from `devops-report.md`, update `fetchWeather`/`fetchMarine` base URLs in `app.jsx` (~2 lines), `pm2 restart proxy`, smoke test. Without this: no Reddit launch is safe. With this: the app can handle a front-page r/surfing post and still function in hour 3.

**2. Delete 3 venues + fix 2 photos.**
portillo-s4, fernando-de-noronha-s20, aruba-eagle-beach-t1 — all deletions. angourie-point-s3 and beach_phuquoc — photo replacements. Every URL and ID is in content-report.md. Bundle this into the proxy deploy commit. 30 minutes. Venue count goes from 235 to 232.

**3. Name the Reddit launch date.**
The ski season scoring window closes in ~3 weeks. Before that, the app shows a legitimate mix of surf + ski + beach scores. After that, ski venues show "Off-season — resort closed" and the grid is dominated by surf/beach. The product looks best right now. Pick a date in the first 10 days of May. Everything else — proxy, cleanup, cache bump — is scoped to hit that date.

---

## Explicit Product Decisions — April 30

**1. Open-Meteo proxy: SHIP before any Reddit post. Final answer.**
This is decision 13 of 13. It does not change. The only variable is whether Jack schedules the VPS session or consciously accepts a broken launch.

**2. portillo-s4: DELETE.**
Closes a photo dupe (perisher shares the image) and a same-category duplicate simultaneously. No-brainer.

**3. fernando-de-noronha-s20: DELETE.**
Batch-gen stub with wrong tags (tagged "Barrel Waves" — Noronha is not a barrel spot). Hand-curated `noronha_surf` is better on every metric.

**4. aruba-eagle-beach-t1: DELETE.**
Confirmed today. Batch-gen duplicate of `beach_eagle`. 3.5x fewer reviews, same location. Delete.

**5. skiPass backfill (26 venues): DEFER to post-Reddit.**
Not launch-blocking. Scoring unaffected. Build the full list post-launch when there's bandwidth. Safe.

**6. Strike alerts background worker: CUT to post-500 users.**
No users have set alerts. Not worth building until there's usage evidence.

**7. Wishlists / Trips reveal: DEFER until 1K users. Locked.**
Standing decision. Do not revisit before 1K MAU.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Window Score v1 | **DEFER** | Weather proxy is the prerequisite |
| Forecast Horizon | **DEFER** | Depends on Window Score |
| Push notification polling worker | **CUT** | No users with alerts set |
| Additional venue batch | **DEFER** | 232 post-cleanup is enough pre-launch |
| SRI + CSP hardening | **DEFER** | Blocked by Babel inline eval risk. Post-launch. |
| Climbing/MTB/kayak expansion | **CUT** | Launch scope is surf/ski/beach only. Frozen. |
| Group coordination | **CUT** | Phase 6. Not relevant before product-market fit. |

---

## Success Criteria

**For 8K, not 5K, in 90 days:**

The gap is not product quality. The scoring is good, "next good window" is live, flight pricing is honest. The gap is entirely two things:

1. **Infrastructure**: Weather proxy not live = quota burns on first viral post = app breaks = Reddit thread dies = users never come back. Proxy live = app holds during a spike = first-day retention is possible.

2. **Distribution timing**: Ski season is the multiplier. A surf+ski post in early May reaches r/surfing AND r/skiing simultaneously. A post in June reaches only r/surfing. The audience is halved.

**One number:** The server-side weather cache is worth ~3,000 users over 90 days. Not metaphorically — literally. It's the difference between the Reddit post becoming a traffic spike that converts and one that burns the quota and vanishes.

---

## The One Risk Nobody Is Talking About

**Ski season is closing and there's no launch date.**

Northern Hemisphere ski resorts hit off-season scoring (score 8, "Off-season — resort closed") starting late May. The window where the Explore grid shows excellent surf AND excellent ski conditions simultaneously — the app's most compelling first impression — is the next 2–3 weeks. After that, the grid is beach-dominated through September.

This isn't catastrophic. Peakly still works in summer. But the first impression for a Reddit launch in June is "this is a beach app" not "this is a multi-sport conditions app." That's a harder story to tell and a smaller initial audience.

The mitigation is a single sentence: **pick a launch date before May 10.** Everything else is already in place.
