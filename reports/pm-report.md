# Peakly PM Report — 2026-04-29 (v29)

**Filed by:** Product Manager agent
**Date:** 2026-04-29
**Status:** YELLOW. One infrastructure fix landed today (cache buster). Two content data issues surfaced. Open-Meteo proxy is Day 12. The window for a ski-season Reddit launch is closing.

---

## Shipped Since Last Report (2026-04-28 → 2026-04-29)

| Commit | What | Right call? |
|--------|------|-------------|
| `cf7d70f` (Apr 29) | Cache buster bumped 20260422a → 20260429a (users had 6-day-old code) | ✅ Should have been in the Apr 28 deploy but better today than never |
| `189e628` (Apr 29) | Content audit: 3 duplicate photo pairs identified, Fernando de Noronha surfing dupe flagged | ✅ Audit only — right to find before Reddit launch |

**Summary:** Minimal shipping day. Cache buster fix was overdue. Content agent surfaced legitimate pre-launch credibility issues. Weather proxy: still not deployed.

---

## Permanent Bug Triage — Confirmed Closed

Do NOT re-flag without reading live code first.

| Issue | Status | Evidence |
|-------|--------|----------|
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. Email waitlist only. Prompt is stale. |
| Sentry DSN empty | **CLOSED** | `app.jsx:6-15` — real DSN, initialized |
| Sentry tracesSampleRate burning quota | **CLOSED** | Fixed Apr 28 — 1.0 → 0.05 |
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` = "710303" |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema |
| fetchJson response body timeout | **CLOSED** | Fixed Apr 28 — `res.setTimeout(8000)` in server/proxy.js |
| "Next good window" missing | **CLOSED** | `bestWindow` built and rendered at listing card lines 2099 + 2290 |
| Duplicate venue pairs (6) | **CLOSED** | Deleted Apr 28 — 237 → 230 (+ 5 added = 235 net) |
| Whitefish airport GPI→FCA | **CLOSED** | Fixed Apr 28 |
| Cache buster stale (20260422a) | **CLOSED** | Bumped Apr 29 → v=20260429a |

---

## Active Bug Triage — April 29

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit — no server-side cache** | **P1 LAUNCH BLOCKER** | ❌ Day 12. Still hitting open-meteo.com directly. ~21 cold sessions/day before quota. | **Day 12** |
| **3 duplicate venue photos** | **P1** | ❌ angourie-point-s3/arugam_bay, portillo-s4/perisher, beach_phuquoc/beach_praslin all share a photo | Day 1 |
| **Fernando de Noronha surfing dupe** | **P1** | ❌ `fernando-de-noronha-s20` is a worse batch-gen copy of `noronha_surf` | Day 1 |
| **SW cache name mismatch** | P2 | ⚠️ `sw.js` still `peakly-20260422` but app.jsx is now `v=20260429a` | Day 1 |
| **26 ski venues missing `skiPass`** | P2 | ❌ Badge absent, scoring unaffected | Day 6 |
| **Strike alerts: no background worker** | P3 | ❌ Registers, never fires | Day 40+ |

### P1 Detail: Open-Meteo Rate Limit (Day 12)

Math from today's DevOps report:
- 295 coordinate pairs × 1 weather call + 165 surf/beach × 1 marine call = **460 API calls per cold load**
- Free tier: 10,000/day → **hard ceiling: 21 cold-load sessions per day**
- A single Reddit comment sending 25 simultaneous visitors exhausts the day's quota in one burst

**This is not a code problem.** Spec: add `/api/weather` and `/api/marine` to the VPS proxy with 30-min in-memory cache. Two new Express routes (~40 lines). Then change `app.jsx` lines 815–816 to route through the proxy and unwrap the response envelope. Total: 2-hour job. Fully specified in devops-report.md.

**This is the last technical gate before Reddit launch.**

### P1 Detail: Duplicate Photos

Three venue pairs share an Unsplash photo. On a grid of cards, this is immediately visible and screams "fake data." Credibility killer pre-launch.

| Fix | Action |
|-----|--------|
| `portillo-s4` shares photo with `perisher` | **Delete** `portillo-s4` — it's also a same-category stub vs hand-curated `portillo`. One deletion closes both issues. |
| `angourie-point-s3` shares photo with `arugam_bay` | **Replace** photo — new URL in content-report.md |
| `beach_phuquoc` shares photo with `beach_praslin` | **Replace** photo — new URL in content-report.md |

20-minute fix. Spec in content-report.md.

### P1 Detail: Fernando de Noronha Surfing Dupe

`fernando-de-noronha-s20` (batch-gen, rating 4.75, 2381 reviews) vs `noronha_surf` (hand-curated, rating 4.96, 1980 reviews). Same location, same category. Delete `fernando-de-noronha-s20`. 5-minute job.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo server-side weather proxy** | Jack (VPS SSH) | Before any Reddit post — Day 12 |
| **Reddit launch date: unnamed** | Jack | The entire roadmap is gated on naming this date |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Ship the weather proxy. Today.**
12 days is too long. The spec is written. The risk is named, quantified, and unambiguous. 21 cold-load sessions before the app breaks. That's one afternoon of organic traffic. Either this ships before the Reddit post or the Reddit post gets delayed indefinitely. Jack: SSH to VPS, copy the spec from devops-report.md, `pm2 restart proxy`, smoke test.

**2. Delete the 3 content P1s before launching.**
`portillo-s4` deletion + 2 photo replacements + `fernando-de-noronha-s20` deletion. Four targeted changes, 30 minutes total, all specs in content-report.md. Do this in the same commit as the proxy deploy.

**3. Name the Reddit launch date.**
The app is technically ready modulo the proxy. Pick a specific day in the first week of May. Every remaining task gets scoped to hit that date or gets cut. Without a date, this is not a launch — it's a perpetual pre-launch.

---

## Explicit Product Decisions — April 29

**1. Open-Meteo proxy: SHIP before Reddit. Hard deadline.**
Day 12 with no progress is an execution problem, not a planning problem. This decision has been made in every report since April 17. Making it again: proxy ships before any public post, full stop.

**2. Duplicate photo fix + Fernando de Noronha dupe: SHIP this session.**
Four clean deletions/replacements. Zero risk. No design decisions needed. Bundle with the proxy deploy commit.

**3. portillo-s4: DELETE.**
Closes a photo dupe and a same-category venue dupe simultaneously. One line removed. Venue count: 235 → 234.

**4. SW cache name mismatch: SHIP in same deploy.**
`sw.js` line 2: `peakly-20260422` → `peakly-20260429`. 30 seconds. Bundle it.

**5. skiPass backfill (26 venues): DEFER to post-Reddit.**
Not launch-blocking. 4 venues need affiliation verification. Safe to ship post-launch in a batch.

**6. Strike alerts background worker: CUT to post-500 users.**
No users using Alerts. Hard cut.

**7. iOS App Store: DEFER.**
Blocked on $99 Apple enrollment. External. PWA is the D0 path.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Push notification polling worker | **CUT** | No users |
| Window Score v1 | **DEFER** | Weather proxy is the prerequisite |
| Forecast Horizon | **DEFER** | Depends on Window Score |
| Wishlists / Trips reveal | **DEFER** | Locked at 1K users, standing decision |
| Additional venue batch | **DEFER** | 234 post-cleanup is enough pre-launch |
| SRI + CSP hardening | **DEFER** | Blocked by Babel eval. Post-launch. |

---

## Success Criteria

**Metrics that define success:**
- 1,000 MAU within 90 days of Reddit launch
- 30-day retention > 25%
- Flight CTR > 8% per session
- Email list > 500 before any paywall

**For 8K, not 5K, by day 90:**
The gap is entirely proxy + re-engagement. Proxy down → scores fail → Reddit thread dies in hour 2. Proxy live → 500 visitors → scoring holds → "next good window" converts bounces → email list compounds → 8K.

**One number:** The server-side weather cache is worth 3,000 users. Not metaphorically. Literally — without it, the app's value proposition disappears the moment it succeeds.

---

## The One Risk Nobody Is Talking About

**Ski season is closing and there's no launch date.**

NH ski resorts hit off-season scoring (score 8, "resort closed") from late May onward. The natural window for a cross-sport surf+ski Reddit post — where the app looks best because both categories are scoring well simultaneously — is the next 2–3 weeks. After that, the Explore grid will be dominated by surfing and beach scores, with ski venues showing "closed."

This is not a problem if the Reddit post goes out in the first week of May. It is a problem if "almost ready" persists through May.

Mitigation: Name the date. Deploy the proxy. Post. The app does not need to be perfect — it needs to be live while both categories are in season.
