# Peakly Daily Briefing — 2026-04-10

**Overall Status:** 🔴 **RED** — Code freeze Day 5-7 (depending on branch). ProductHunt launch is **5 days out (April 15)**. Zero P1 bugs have moved in a week. Agents are screaming into a folder.

## What Shipped
- **Nothing.** Last product commit is `ce730cf` (April 5, "pre-fetch weather during onboarding") on `main`. No code has shipped in 5+ days. Agents keep filing reports; nothing merges.

## Decisions Made Today
- **PM:** Recommends **slipping ProductHunt to April 22** unless the quick-win bundle + dedup + emoji ship by end-of-day Sunday April 12. Proposes a "shipbot" scheduled task that auto-PRs trivial fixes.
- **Growth:** Hard rule — **slip to April 22 if the 4 critical P1s (dedup, photo dedup, emoji, email capture) aren't shipped by Sunday midnight PT**. Will stop writing "launch April 15" until there's code evidence.
- **DevOps:** Add **rate limiting to the VPS proxy** before launch (~10 lines in `server/proxy.js`, 15 min). Only pre-launch infra change being recommended. Also flags a historical Duffel test token in git history — rotate it.
- **UX:** **"Design work stops until the backlog ships."** No new proposals until the 6 unfixed items (emoji, score votes, cache buster, SW bump, hero overlay, alerts empty state) land. Total cleanup = ~30 min of actual work.
- **Revenue:** Wants authorization to ship a **single-commit unblock package**: un-hide gear section, bump cache buster, add "Great Deal" badge, add localStorage fallback for email capture. Awaiting green light.
- **Content/Data:** Data Health Score **58/100**. Dedup is the launch blocker — especially Teahupo'o tagged "Beach Break, All Levels" (legal/safety hazard). 686 airport codes missing from AIRPORT_CITY (Vail, Queenstown, Zurich, Innsbruck render as raw IATA codes).

## Top 3 Actions Needed

1. **🔥 BREAK THE CODE FREEZE TODAY.** Ship the ~46-minute quick-win bundle: bump cache buster to `v=20260410a`, delete score vote buttons, kill emoji from category pills + VenueDetailSheet headers + share button, fix `venue.facing ?? 270` swell fallback, bump SW to `peakly-20260410`. One commit. The UX report has copy-paste code ready at `reports/ux-2026-04-10.md`.

2. **🔥 Replace `TP_MARKER = "YOUR_TP_MARKER"` at app.jsx:5316.** Day 19 of this blocker. 5-minute paste from the tp.media dashboard. Every flight click on ProductHunt launch day earns **$0** without this. The single biggest preventable revenue miss of the launch.

3. **🔥 Make a launch date call: April 15 or April 22.** Growth + PM both recommend slipping. Drifting into next week with no decision is the worst outcome. Need the call by end of day today — tomorrow's reports get rewritten around whichever date is real.

## Numbers
- **Venues:** 3,726 total (242 duplicates, 60.7% unique photos, 2,112 in top-3 focus categories)
- **Site:** Presumed UP (sandbox egress blocked — spot-check `j1mmychu.github.io/peakly/` in browser)
- **HTTPS:** ✅ Done (Caddy + Let's Encrypt on peakly-api.duckdns.org)
- **Design Score:** **4/10** (downgraded from 5 — not because it got worse, because nothing shipped)
- **Data Health:** 58/100
- **Revenue Readiness:** SOFT LAUNCH — 2 of 7 streams earning (Booking.com + SafetyWing). Current RPM **$12.06/1K MAU**; fixable to **$24.68** with ~2 hours of Jack work.
- **app.jsx:** 10,993 lines, ~1.95 MB cold load
- **Cache buster:** `v=20260331a` (10 days stale)
- **Code freeze:** **Day 5-7** depending on branch
- **Emoji references still live:** **1,296** (decided CUT 16 days ago)

## Jack's To-Do (Do These Today — In Order)

1. **Paste TP_MARKER value** from tp.media → `app.jsx:5316`. 5 minutes. Day 19. No excuses.
2. **Open Claude Code** and run the one-liner from `reports/ux-2026-04-10.md` (bottom) to ship the UX backlog cleanup in ~30 min. Then `push "ship UX backlog"`.
3. **Decide: April 15 or April 22.** Reply to the PM + Growth reports with the call.
4. **Register peakly.app domain.** Namecheap or Cloudflare. LLC approved March 25. 30 minutes.
5. **Post the "missed window" question in r/surfing** (template in growth report). Build karma for launch.
6. **Authorize the Revenue agent's unblock package** (un-hide gear section + email localStorage fallback). Unlocks ~$4.62 RPM.
7. **Before launch week:** Add rate limiting to VPS proxy (DevOps report has the 10-line snippet). Rotate the Duffel test token.

---

**The bottom line:** Every agent is saying the same thing in different words — **the problem isn't the product, it's that nothing is shipping.** 46 minutes of engineering would clear most of the P1 backlog. ProductHunt is 5 days away. Ship something today or slip the launch.

Sources:
- [PM Report](computer:///sessions/epic-focused-gauss/mnt/peakly-github/reports/pm-2026-04-10.md)
- [Growth Report](computer:///sessions/epic-focused-gauss/mnt/peakly-github/reports/growth-2026-04-10.md)
- [DevOps Report](computer:///sessions/epic-focused-gauss/mnt/peakly-github/reports/devops-2026-04-10.md)
- [UX Report](computer:///sessions/epic-focused-gauss/mnt/peakly-github/reports/ux-2026-04-10.md)
- [Revenue Report](computer:///sessions/epic-focused-gauss/mnt/peakly-github/reports/revenue-2026-04-10.md)
- [Content/Data Report](computer:///sessions/epic-focused-gauss/mnt/peakly-github/reports/content-2026-04-10.md)
