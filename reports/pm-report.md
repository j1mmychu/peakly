# Peakly PM Report — 2026-04-17 (v24)

**Filed by:** Product Manager agent  
**Date:** 2026-04-17  
**Status:** TP_MARKER + email capture confirmed FIXED (were false alarms in prior reports). New P1: Cloudbreak Fiji and Punta Roca have wrong difficulty tags. Batch venue audit needed before Reddit launch.

Full report: [pm-2026-04-17.md](./pm-2026-04-17.md)

---

## Shipped Since Last Report (2026-04-08 → 2026-04-15)

| Commit | What | Right call? |
|--------|------|-------------|
| `1db7079` (Apr 9) | Fix push notification icons, SW cache bump to `peakly-20260409`, inter-batch delay (1s), cache buster to `v=20260409a` | ✅ Right call — icons were broken, rate limiting needed |
| `3129564` (Apr 9) | Merge content report + devops reports | Neutral — reports only, no product impact |

**Six days of silence after April 9.** Zero code commits April 10–15. Again.

**Pattern alert:** Second 6-day freeze in two weeks (previous: April 2–8). Reddit windows close. Every day of silence is compounding. This is the single biggest threat to the 100K goal.

---

## CLAUDE.md vs Reality — Critical Divergence

**This is the most important finding in this report.**

The CLAUDE.md in the session context references "Recently Fixed (2026-04-10 through 2026-04-12)" items — venue reduction to 231, 7 scoring algorithm fixes, wind direction fix, beach marine fetching, skiing season awareness, etc.

**None of those commits exist in git.** `git log` shows no commits after April 9. The last commit to CLAUDE.md itself was April 1 (`9d2692a`).

What's actually in the code right now:
- **Venues:** 3,726 total (704 ski + 703 surf + 705 tanning + 1,614 other). NOT 231.
- **Scoring bugs:** The April 10-12 algorithm holes listed in the session CLAUDE.md are unconfirmed — no matching commits.
- **CLAUDE.md on disk:** April 1 version — 3,726 venues, nothing about April 10-14 fixes.

**The shared brain is unreliable.** Don't trust CLAUDE.md's "recently fixed" section without a matching git commit hash. The on-disk file is ground truth.

---

## Bug Triage — April 15

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **TP_MARKER = "YOUR_TP_MARKER"** | **P0** | ❌ STILL UNSET | **Day 22** |
| **Email capture → `alert()` only** | **P0** | ❌ No backend POST. Every email gone. | Day 22+ |
| **Venue duplicates + mislabeled difficulty** | **P1** | ❌ Teahupo'o tagged "All Levels". Mundaka tagged "Beginner Friendly". Live on production. | Day 22+ |
| **Cache buster `v=20260409a`** | **P1** | ⚠️ 6 days old. Any fix pushed today won't reach cached users without a bump. | Day 6 |
| **app.jsx = 2.0MB / 11,000 lines** | **P1** | ❌ Babel parse on mobile = 5-10s blank screen. | Day 20+ |
| **fetchWeather() 429 crash** | **P1** | ❌ Still throws instead of returns null. Explore tab crashes on rate limit. | Day 22+ |
| **Peakly Pro price "$9/mo"** | **Unconfirmed** | Cannot find `$9/mo` in codebase. Needs live site verification. | Unknown |
| **Sentry DSN** | ✅ CONFIGURED | DSN set at `app.jsx:8`. Not flying blind. | — |

**TP_MARKER:** Day 22 = ~88 unattributed flight link clicks at 50 daily users × 8% CTR. If 20% converted at $8 commission avg = ~$140 permanently lost. Fix is one string substitution.

**Email capture is also P0.** `app.jsx:7214` does `alert("You're on the list!")`. No `fetch()`. No backend. The server has `/api/waitlist` — the client just isn't calling it. Every Reddit visitor who typed their email is permanently gone.

---

## Known Blockers

| Blocker | Owner | Action |
|---------|-------|--------|
| **TP_MARKER** | Jack — 5 min | `tp.media → Markers → copy ID → app.jsx:5316 → push` |
| **Email capture** | Dev — 30 min | Replace `alert()` at line 7214 with POST to `/api/waitlist` |
| **Venue dedup + labels** | Dev — 2 hrs | Remove `-s##` batch dupes, fix mislabeled difficulty on 3-4 venues |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## Explicit Product Decisions — April 15

**1. TP_MARKER: SHIP. TODAY. Jack only.**
Not a product decision. One copy-paste. Day 22. Not acceptable.

**2. Email capture → real backend: SHIP this week.**
`app.jsx:7214` — replace `alert()` with `fetch("https://peakly-api.duckdns.org/api/waitlist", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) })`. If `/api/waitlist` isn't live, fall back to Loops.so free-tier webhook (no backend deploy needed). Deadline: end of week.

**3. Venue dedup + difficulty labels: SHIP this week.**
Teahupo'o ("All Levels") and Mundaka ("Beginner Friendly") are live on production. When r/surfing finds this it kills launch credibility with the highest-value users. Surgical fix: grep `-s##` IDs, remove batch dupes, fix ~4 wrong difficulty tags. 2 hours max.

**4. Window Score / Forecast Horizon: DEFER.**
No new features while P0s are open. Every engineering hour on roadmap while basics are broken is opportunity cost at best, launch-killer at worst.

**5. iOS App Store: DEFER until 500 users.**
No point burning $99 + Xcode time until browser retention is proven. PWA install prompt on iOS is the MVP path. App Store post-traction.

**6. JSON-LD structured data: DEFER.**
81% SEO is launch-acceptable. One hour of JSON-LD adds 2-3 SEO points. Same hour fixing venue credibility protects the launch. Venue data wins.

---

## This Week's Top 3 Priorities Only

**1. TP_MARKER** — Jack, 5 minutes. Day 22 of $0 affiliate revenue ends today.

**2. Email capture → real backend** — Dev, 30 minutes. No more `alert()`.

**3. Venue dedup + fix Teahupo'o/Mundaka labels** — Dev, 2 hours. Credibility protection before next Reddit post.

Everything else deferred until these three are done.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Window Score v1 | **DEFER** | P0s still open |
| JSON-LD structured data | **DEFER** | 81% SEO is fine for launch |
| iOS App Store submission | **DEFER** | Premature — no retention data yet |
| Trips / Wishlists tab launch | **DEFER** | 1K users minimum per design decision |
| Peakly Pro pricing UI | **INVESTIGATE** | Can't confirm $9/mo in code — live site check first |

---

## Success Criteria

**Metrics that define success:**
- 1,000 MAU within 90 days of a real Reddit launch
- 30-day retention > 25%
- Flight CTR > 8% per session
- Email list > 500 before any paywall

**For 8K users, not 5K, by day 90:**
- TP_MARKER set BEFORE next Reddit post
- Email list built BEFORE next distribution spike (re-engagement is the difference)
- Venue credibility intact (no "Teahupo'o beginner" screenshots circulating)
- Mobile load under 3s (venues.json extraction is the unlock)

**5K scenario:** Launch again with broken TP_MARKER, no email list, mislabeled venues. Growth flatlines at early adopter cohort. No re-engagement.

**8K scenario:** Fix P0s first. Clean data. Build list on the way up. Second Reddit post + 300 email notifications = retention flywheel starts.

---

## The One Risk Nobody Is Talking About

**CLAUDE.md drift is a confidence trap.**

The session context says 231 venues with clean data and scoring fixes. The actual repo has 3,726 venues with live credibility bugs. The gap between what the "shared brain" says shipped and what actually shipped is growing.

If Jack or any agent reads CLAUDE.md and believes the venue cleanup happened, they won't fix it. A document that's confidently wrong is more dangerous than no document.

**Process fix required:** Every session that updates CLAUDE.md must link the corresponding git commit hash. No commit hash = no fix. This rule prevents the next silent 6-day regression.
