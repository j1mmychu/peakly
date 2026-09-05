# Peakly PM Report v141 — 2026-09-05

**Status: 🟡 YELLOW — 5 new venues landed (RHO/GIG/SCL/OOL/PPT). BASE_PRICES gap fully closed. Venue count discrepancy between agents (405 vs 407) needs a single authoritative resolution. VPS Day 43 unchanged. 9 days to venue search deadline.**

---

## Shipped Since Last Report (v140 → v141)

| Commit | What | Right call? |
|--------|------|-------------|
| `2c52496` | Content report Sep 5 — 5 new venues (Rhodes GR, Rio GIG, Santiago SCL, Gold Coast OOL, Papeete PPT), AGP/AKL/GRU AIRPORT_COORDS fix noted as Day 2 carry-over | ✅ Right venues, right regions |
| `ef9a777` | DevOps report Sep 5 — venue count discrepancy surfaced (407 vs 405), 18 zombie branches, BASE_PRICES 183 airports confirmed | ✅ Audit is clean |

**5 new venues from Content's agent run today (RHO/GIG/SCL/OOL/PPT).** That's the 5 new adds per Content's report. Catalog now officially 405 per bracket-walker eval (authoritative) — DevOps DevOps shows 407 via its own method, a 2-venue discrepancy that needs a single truth source reconciliation.

**Big win: BASE_PRICES gap is fully closed.** Content confirms all 165 unique venue `ap` codes are now covered — zero gaps. This was at 68% coverage in July. Deal score is now honest across the full catalog.

---

## Bug Triage

### Venue count discrepancy — P2 (NEW)
DevOps says 407, Content says 405, PM v140 claimed 405. The eval-based bracket-walker is the authoritative method per CLAUDE.md. Content's eval says 405. DevOps says its eval shows 407. One of them has a stale app.jsx snapshot. Resolution: whoever runs next should call `node -e "const fs=require('fs');const src=fs.readFileSync('app.jsx','utf8');const m=src.match(/const VENUES\s*=\s*(\[[\s\S]*?\]);/);const v=eval(m[1]);console.log(v.length)"` on the live HEAD and that number is the truth. Update `.venue-baseline` to match. This is bookkeeping noise, not a code bug — no duplicate IDs (boot IIFE would catch those).

### AGP/AKL/GRU missing from AIRPORT_COORDS — P1 (Day 2 carry-over)
These 3 airports are present in `AP_CONTINENT` but missing from `AIRPORT_COORDS`. Distance filter silently fails for any venue whose `ap` is one of these — the filter lets them through unconditionally, meaning a user filtering to ≤4hr flights sees venues they physically couldn't reach in that window. **This breaks a core product promise.** Fix is 3 coordinate lookups and 3 additions to the `AIRPORT_COORDS` object. 10 minutes.

### VPS Redeploy (Open #19 + #23) — P0 (Day 43)
Same as v140. No change. One SSH session closes both. Without it: Open-Meteo ceiling unprotected, two-weekend scoring off, alert deletion broken, iOS native CORS blocked. **The Reddit spike will rate-limit Open-Meteo within 90 seconds.** This is day 43 of a 30-minute task.

### Venue text search — P1 (9 days to Sep 14)
Not started. Sep 14 deadline holds. After that, Reddit moves to Oct 18 (7 more days of delay, 7 fewer days of organic traction before ski pre-booking intent peaks). Minimum spec per v140 stands: `toLowerCase()` text filter on title+location+tags, input above category pills, count shown when active, clears on pill change.

### Zombie branches — P3
18 total (3 new: `claude/fix-app-jsx-content`, `master` now exposed on origin, `fix-appjsx-final`/`restore-appjsx`/`test-small` still present). No production risk. Delete in one batch post-Reddit. **Don't touch before Oct 11.**

### Cache stamp — CURRENT
`20260904a` is correct. No app.jsx logic changes today. Stamp updates on next app.jsx commit.

---

## Three Product Decisions — Sep 5

### Decision 1: AGP/AKL/GRU AIRPORT_COORDS — SHIP NOW

This breaks the distance filter for venues like Málaga (AGP), Auckland (AKL), and São Paulo (GRU). These are high-traffic tourist airports with significant venue coverage (Spain's Costa del Sol, New Zealand, Brazil). A user in SFO filtering to ≤6hr flights should not see a Malaga beach listed as within range. **10-minute fix. Ship it.** This is a P1 because it silently corrupts the core product promise (spontaneous, reachable weekend).

### Decision 2: Venue count discrepancy — RESOLVE THIS RUN

Every agent is running off a different number. PM says 405, DevOps says 407, Content says 405. Pick one method (eval-based bracket-walker, per CLAUDE.md), run it on live HEAD, write the result to `.venue-baseline`, and every agent uses that going forward. The discrepancy is almost certainly that DevOps is reading a different part of the file or including something the bracket-walker doesn't. **Bookkeeping failure, not a code bug. Resolve with eval, move on.**

### Decision 3: Photo sprint — DEFER until post-Reddit

Content reports 225 venues (56%) with only 2 tags and 405 venues with generic stock photos. This is a real quality gap. But: the Open-Meteo ceiling means any traffic event that exposes the photo gap also exposes the rate limit catastrophe first. Fix the infrastructure that survives the spike. Then fix photos. Venue-specific photos are a meaningful quality investment, but they require the Unsplash API key Jack holds and editorial review — not an agent task. **DEFER to post-VPS, post-Reddit.**

---

## This Week's Top 3 Priorities Only

1. **Fix AGP/AKL/GRU AIRPORT_COORDS** — 10 minutes, breaks distance filter, P1. Ship before next venue batch.
2. **VPS SSH session (Jack)** — Open #19 + #23. Day 43. Must happen before Oct 11. Open-Meteo ceiling is not a theoretical risk; it's a guaranteed failure mode at Reddit-scale traffic.
3. **Venue text search** — 9 days to Sep 14 deadline. 1–2 hour build. Minimum spec unchanged from v140. Every day this slips is a day closer to pushing Reddit from Oct 11 to Oct 18.

---

## Features REJECTED This Week

- **New venue additions** — DEFER until post-Reddit. 405 is sufficient for launch; adding more before shipping the search feature is backwards. Users can't find what's already there.
- **Tag enrichment (225 venues with 2 tags)** — DEFER. Search uses existing tags as a signal, but 2 tags is fine for MVP. Enrichment is a content sprint, not a launch blocker.
- **JSON-LD structured data** — DEFER. SEO compounds over months; not relevant to Oct 11.
- **APNS/push (Open #21)** — DEFER. Gate is live. Don't wire the .p8 until HTTP/2 + JWT P1363 fix is deployed and verified.
- **Photo accuracy (Open #20)** — DEFER. Needs Unsplash API key, editorial review. Not a launch blocker.
- **Zombie branch cleanup** — DEFER. No production risk. One `git push origin --delete` batch after Reddit.

---

## One Product Risk Nobody Is Talking About

**BASE_PRICES is now fully covered — but the deal score still has no user-visible confidence signal.** When a live Travelpayouts fare comes back as stale (>14 days old, already demoted to `~$X`), the estimate is still shown with the same visual treatment as a fresh estimate. Users have no way to know if the `~$420` on a Bora Bora card is based on a realistic route price or a stale fare from two weeks ago that's since moved 30%. The `duffelWrongLength` check from August catches wrong-length trips, but not staleness on correctly-scoped trips. With zero actual traffic, this is theoretical. With a Reddit spike, you'll have 500 people clicking on deals that are priced off stale data. The fix is already half-done (the `duffelTripDays` check exists) — staleness just needs its own branch in the same logic. But this is a post-VPS, post-search priority. Flag it here so it doesn't get lost.

---

## Success Criteria

**What defines 8K users at 90 days vs. 5K:**

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit post | Decent traction, second page | Front page, r/skiing + r/travel crosspost |
| App quality | VPS works, search works | VPS works, search works, distance filter is honest |
| Word of mouth | Low share rate | Share-a-list feature drives organic loops |
| Timing | Post any weekend | Post first weekend of October (peak ski pre-booking intent) |
| Error rate | Some users see rate limits | VPS proxy absorbs the spike |

October 11 remains the target. Two items are on the critical path: VPS (Jack, SSH) + venue search (Claude, 1–2hr build). Both unblocked. Neither is a mystery.

---

*Report generated 2026-09-05. Venue count: 405 (authoritative — bracket-walker eval; reconcile with DevOps 407 count this run). Cache: 20260904a. Next cache bump: on next app.jsx commit.*
