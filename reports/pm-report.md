# Peakly PM Report v140 — 2026-09-04

**Status: 🟡 YELLOW — 10 venues shipped (395→405). Carry-over queue cleared. Open-Meteo P0 and VPS P1s remain the only true pre-Reddit gate items. One code blocker: venue text search by Sep 14.**

---

## Shipped Since Last Report (v139 → v140)

| Commit | What | Right call? |
|--------|------|-------------|
| This run | **10 venues added (395→405)** — 5 carry-overs (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan, Portofino Riviera) + 5 new (Sierra Nevada ES, Piha Beach NZ, Viña del Mar CL, Cape Tribulation AU, Ilhabela BR) | ✅ Every single one was sitting paste-ready. Carry-overs Day 7 deadline cleared. 4 AP gaps closed (AGP/AKL/GRU/SCL beach). |
| This run | Cache stamp → `20260904a`, venue baseline → 405 | ✅ Required |
| `c75e8d0` | DevOps report 2026-09-04 | ✅ Clean audit |
| `3405dc3` | Content report 2026-09-04 — 4 new AP gaps identified | ✅ |

**Code shipped: 10 venues. First app.jsx commit in 8 days.** Carry-over queue is empty. Sep 7 deadline is satisfied 3 days early.

---

## Bug Triage

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED
Pro was cut for v1. Zero live references. Non-issue.

### Sentry DSN — CLOSED
DSN `9416b032a46681d74645b056fcb08eb7` wired at `index.html:77`. Live.

### Cache stamp — UPDATED
`20260904a` across app.jsx / sw.js / index.html after today's venue additions. In lockstep.

### Open-Meteo capacity — P0 (unchanged)
395→405 venues doesn't materially change the math: ~810 requests/cold-refresh, ~9,720/day at zero users vs 10,000 free limit. Still at 97% of ceiling with zero users. The VPS proxy cache (Open #23) is the only fix. Requires the same SSH session as Open #19. Status: Jack-only action, day 42.

### VPS Redeploy (Open #19) — P0 (coupled to #23)
Same SSH session closes both. `forecast_days:14` fix, iOS CORS, alert deletion, disk weather cache. Pre-Reddit gate. Day 42.

### Venue text search — P1
10 days to September 14 deadline. Minimum spec is a 2-hour build. Not started. This is the only code item left before Reddit launch (after VPS).

### Zombie branches — P3
17 `claude/*` branches and misc. Dead weight, no production risk. Delete batch is a 5-minute cleanup. Defer to after Reddit launch.

---

## Three Product Decisions — Sep 4

### Decision 1: Venue search — SHIP by Sep 14 or Reddit moves to Oct 18

Deadline holds. Minimum viable spec (no backend, no deps):
- `toLowerCase()` filter on `venue.title + venue.location + venue.tags.join(' ')`
- Text input above category pills in ExploreTab
- Count shown when active ("Showing 3 of 405")
- Clears on category pill change

This is 1–2 hours of work in a single file. Missing it is a scheduling failure, not a technical one. **SHIP.**

### Decision 2: VPS SSH session — must happen before Oct 11 Reddit post

No change to the decision from v139. The session closes Open #19 + #23 together. Without it: two-weekend scoring off, iOS native blocked, and the Reddit spike rate-limits Open-Meteo within the first hour. **SHIP (Jack action).**

### Decision 3: Carry-over venues — DONE

All 5 carry-overs are live. Sep 7 hard deadline cleared. 5 fresh venues added in the same batch. The next venue batch should wait until after the Reddit post unless a clear search-intent gap surfaces (like AGP/Spain did today).

**DEFER new venue additions until post-Reddit-launch** unless an AP gap with >5 venue potential is identified. The 405 catalog is sufficient for launch.

---

## This Week's Top 3 Priorities Only

1. **VPS SSH session (Jack)** — Open #19 + #23. One session, one `pm2 restart`. Verify with `/health`. Must happen before Oct 11. Open-Meteo ceiling is the technical gun to the head.
2. **Venue text search** — ship by Sep 14. Unblocks Reddit launch. 1–2 hour build in app.jsx only.
3. **Supabase delete-account SQL** — Jack pastes `server/sql/delete-account.sql` into Supabase SQL editor. Required for App Store 5.1.1(v). 5 minutes. Blocking App Store submission.

---

## Features REJECTED This Week

- **Photo accuracy (Open #20)** — DEFER. Needs Unsplash API key. Not a launch blocker. Generic stock doesn't kill conversion; wrong weather data does.
- **APNS/push (Open #21)** — DEFER. The `Capacitor.isNativePlatform()` gate already lets iOS ship without it. Don't touch the .p8 until the HTTP/2 + JWT P1363 fix is deployed and tested.
- **Zombie branch cleanup** — DEFER until post-Reddit. No production risk, pure overhead.
- **JSON-LD structured data** — DEFER. SEO compound interest is real but the gain accrues over months, not before Oct 11.
- **Sierra Nevada ski season accuracy** (December–May season, currently off-season) — NOT a rejection, but note: the venue is in the catalog correctly. The scoring engine will correctly suppress it when conditions are poor. No special handling needed.

---

## One Product Risk Nobody Is Talking About

**The VPS has been "48 hours away" for 42 days.** The pattern is: SSH session gets deprioritized every time something feels more urgent. But the Open-Meteo ceiling means this is no longer deferrable — it's the difference between a Reddit launch that works and one that rate-limits in hour one. The risk isn't technical unknowns; it's the same scheduling failure that's kept carry-over venues in report limbo for a week.

The actual action takes under 30 minutes. The cost of not doing it before Oct 11 is a catastrophic first impression with no recovery. If the SSH session keeps slipping, consider whether a different path (paying for Open-Meteo's commercial plan, or migrating the cache to a service Jack doesn't have to SSH into) is the realistic answer.

---

## Success Criteria

**What defines 8K users at 90 days vs. 5K:**

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit post | Single post, moderate traction | Post hits front page or top of r/skiing or r/travel |
| App quality | VPS works, search works | VPS works, search works + photos are venue-specific |
| Word of mouth | Low share rate | Share-a-list feature drives organic loops |
| Timing | Post any weekend | Post first weekend of October (peak ski pre-booking intent) |

October 11 is the right date. The product has to be ready. Two items are on the critical path: VPS + venue search. Both are unblocked. Neither is a technical mystery.

---

*Report generated 2026-09-04. Venue count: 405 (134 skiing / 271 beach). Cache: 20260904a.*
