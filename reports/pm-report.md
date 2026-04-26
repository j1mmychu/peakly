# Peakly PM Report — 2026-04-26 (v25)

**Filed by:** Product Manager agent  
**Date:** 2026-04-26  
**Status:** YELLOW — 4-day code freeze while the single biggest launch blocker sits unresolved. Weather proxy is the only thing that matters right now.

---

## Shipped Since Last Report (2026-04-24 → 2026-04-26)

| Commit | What | Right call? |
|--------|------|-------------|
| `1889d27` (Apr 25) | DevOps report only | Neutral — no code |
| `f760036` (Apr 25) | Merge + PM report backfills | Neutral — no code |

**Summary:** Zero app.jsx changes in 4 days. Last code push was April 22. The app is stable but static while a P1 launch blocker has been open for 9 days.

---

## Permanent Bug Triage — Confirmed Closed

Do NOT re-flag without reading live code first.

| Issue | Status | Evidence |
|-------|--------|----------|
| Peakly Pro showing $9/mo | **CLOSED** | No Pro UI in codebase. `$79/yr` is waitlist copy only. Prompt is stale. |
| Sentry DSN empty | **CLOSED** | `app.jsx:6-15` — real DSN, initialized. |
| TP_MARKER unset | **CLOSED** | `app.jsx:1593` → `"710303"` |
| JSON-LD missing | **CLOSED** | `index.html:34` — WebSite + WebApplication + Organization schema. |
| fetchJson missing timeout | **CLOSED** | `AbortController` present in all three fetch sites (lines 899, 935, 1436). |
| "Next good window" not showing | **CLOSED** | `bestWindow` built, rendered at lines 2099 and 2290. Shows day + score when a better window exists in the 7-day forecast. |

---

## Active Bug Triage — April 26

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit — no server-side cache** | **P1** | ❌ Unresolved | **Day 9** |
| **6 confirmed duplicate venue pairs** | P1 | ❌ Still in codebase | Day 3 |
| **28 ski venues missing `skiPass` field** | P2 | ❌ Unresolved | Day 3 |
| **Cache buster `v=20260422a` / sw `peakly-20260422`** | P2 | ⚠️ 4 days old — bump on next push | Day 4 |
| **Strike alerts: no background polling worker** | P2 | ❌ UI registers, never fires | Day 30+ |
| **No scoring explanation in onboarding** | P3 | ❌ OnboardingSheet collects prefs, doesn't explain scores | Day 30+ |

---

### P1 Detail: Open-Meteo Rate Limit (Day 9 — Recurring)

The math: 237 venues × ~1.5 calls = ~356 calls/cold session. Free tier: 10,000/day. Hard ceiling: **~28 cold sessions** before daily quota is gone. One decent Reddit post sends 100+ concurrent users. The app's entire value prop — live condition scores — disappears for the rest of the day. No alerting fires because the failure is client-side and silent (spinners forever).

Fix spec has been written in devops-report.md for 9 days. It's a 4-hour VPS deploy. Nothing else is blocking Reddit launch more than this.

**This has been flagged P1 in every report since April 17. It needs a deploy session with Jack.**

---

### P1 Detail: 6 Duplicate Venue Pairs (Day 3)

Content report (Apr 23) confirmed these batch-gen duplicates should be deleted:

| Delete | Keep | Category |
|--------|------|----------|
| `aspen-snowmass-s7` | `aspen` | skiing |
| `arapahoe-basin-s9` | `abasin` | skiing |
| `anchor-point-s19` | `anchor_point` | surfing |
| `taghazout-s10` | `taghazout` | surfing |
| `pasta-point-s24` | `pasta_point` | surfing |
| `pigeon-point-t27` | `beach_tobago` | tanning |

237 → 231 venues. 30-minute cleanup. Cleaner Explore pre-Reddit. Do it before any viral push.

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **Open-Meteo server-side weather proxy** | DevOps + Jack (VPS session) | Before any Reddit post |
| **6 duplicate venue deletions** | Dev — 30 min | Before Reddit |
| **Reddit launch date** | Jack — needs to name a date | Everything else is gated on this |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide, Stripe |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store |

---

## This Week's Top 3 Priorities Only

**1. Deploy server-side Open-Meteo weather proxy to VPS**  
This is the only thing that decides whether a successful Reddit post = a good day or a broken one. Spec is written. Needs a Jack + dev VPS session. If this doesn't ship this week, there is no Reddit post this week. Full stop.

**2. Delete the 6 confirmed duplicate venue pairs**  
30 minutes in app.jsx. Brings venue count to 231. Cleaner Explore, no duplicate cards. Unblocks the cache bump (bump both sw.js and index.html in the same commit).

**3. Name the Reddit launch date**  
Every priority decision for two weeks has been gated on "before Reddit." Without a date, everything stays in perpetual pre-launch purgatory. Jack picks a day, work backwards. Infrastructure must be ready 48 hours before that date.

---

## Explicit Product Decisions — April 26

**1. Open-Meteo proxy: SHIP this week or there is no Reddit launch this week.**  
9 days. The spec is ready. This is not a planning item anymore.

**2. 6 duplicate venue deletions: SHIP this week.**  
Zero risk. 30 minutes. Bundle with cache bump so it's one commit.

**3. 28 ski venues missing `skiPass`: DEFER to post-Reddit.**  
Missing field doesn't break scoring or display — the `skiPass` badge just doesn't render. Not launch-critical.

**4. Strike alerts background worker: DEFER to post-1K users.**  
Alerts tab UX is intact. Server-side polling is a multi-hour build with zero users to serve today.

**5. Onboarding scoring explanation: DEFER to post-Reddit.**  
Score is intuitive (higher = better). The retention risk of a confusing first experience is lower than shipping without a working weather stack.

**6. SRI hashes + CSP meta tag: DEFER — document it.**  
CSP will break Babel inline eval. Dedicated hardening sprint post-100 users. Stop re-flagging it daily; it's a known deferred item.

---

## Features Rejected This Week

| Feature | Reason |
|---------|---------|
| Gear affiliate section re-enable | REI blocked on LLC approval. Wrong sprint. |
| Push notification polling worker | 4–8 hour build, no users to serve. Post-1K. |
| iOS App Store build | Blocked on $99 Apple enrollment. External. |
| Wishlists / Trips tab reveal | Locked at 1K users. Do not revisit. |
| Additional venue batch | At 237 (pre-cleanup). Depth > breadth at launch. |

---

## Success Criteria

**5K MAU** = base case (organic SEO + 1 Reddit post that doesn't break)  
**8K MAU** = requires all four of the following to be true:

1. **Weather proxy live on launch day.** Without it, viral traffic = broken app = no word of mouth. Binary gate.
2. **D7 retention > 20%.** The `bestWindow` feature helps. Working push alerts are the biggest D7 lever available. Defer alerts, accept that D7 ceiling is lower.
3. **SEO compound by day 90.** JSON-LD is live. Sitemap submitted. Need Google to index venue depth. Monitor Search Console weekly — if impressions aren't growing by week 4, something is wrong.
4. **Two distributions, not one.** r/surfing AND r/skiing posts in the same week doubles the addressable audience. Write category-specific copy for both. Same app, different angle.

---

## One Product Risk Nobody Is Talking About

**There is no launch date.**

Every report since April 10 says "before Reddit." There is no date on the calendar. Without a hard ship date, the weather proxy stays "almost done," the dupe cleanup stays "soon," and the Reddit post stays "when it's ready." The app is good enough to launch today if the proxy ships. Waiting for perfect is how you wait forever. Jack needs to name the date, then work backwards from it.

---

*Next report: 2026-04-27*
