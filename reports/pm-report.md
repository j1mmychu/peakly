# Peakly PM Report — 2026-05-20 (v35)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: RED. Reddit window closes in 48 hours. Zero code commits in 5 days. Every P0 from May 15 is still open.**

---

## Shipped Since Last Report (2026-05-15 → 2026-05-20)

| What | Right call? |
|------|-------------|
| **Nothing.** Zero code commits in 5 days. | ❌ Not acceptable with Reddit window closing May 22. |

The last meaningful commit was the DevOps P1 fix on 2026-05-15 (4d16e3d). Since then: one PM report, one content report. Both identified the same open P0s. Neither triggered a code response. That pattern ends today.

---

## Permanent Bug Triage

| Issue | Status |
|-------|--------|
| Sentry DSN | ✅ CLOSED |
| Peakly Pro $9/mo vs $79/yr | ✅ CLOSED — Pro UI removed |
| APNS Capacitor gate | ✅ CLOSED — live at app.jsx:8158 |
| SEO surf copy | ✅ CLOSED — fixed 05-15 |
| Hardcoded alert proxy URLs | ✅ CLOSED — fixed 05-15 |

---

## Active Bug Triage — May 20

| Bug | Severity | Days Open | Jack action? |
|-----|----------|-----------|-------------|
| **VPS proxy not verified live** | **P0** | **Day 16** | ✅ YES — `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. One command. Weekend pricing, weather cache, alerts polling: all dead until this runs. |
| **GEAR_ITEMS missing from app.jsx** | **P0** | **Day 5** | Code agent: paste-ready code is in `reports/content-report.md:82–155`. Add after CATEGORIES in Constants section. Amazon earns $0 until it's in the file. CLAUDE.md says LIVE at $4.48/1K MAU — that is false. |
| **Cache buster 7 days stale** | **P1** | **Day 7** | DevOps fix 05-15 changed app.jsx but never bumped the cache. Users on SW `peakly-20260513j` are not seeing the hardcoded-URL fix. Bump to `20260520a` across app.jsx / sw.js / index.html on next commit. |
| **3 venue duplicates approved but never deleted** | **P1** | **Day 5–7** | One batch commit: delete `pigeon-point-t27` (line 566), `sarakiniko-beach-t16` (line 556), `val-d-isere-s16` (line 530). All approved since May 13–15. |
| **outer-banks-nags-head-t7 wrong airport** | **P1** | **Day 5** | `ap:"OAJ"` (Jacksonville NC, 70mi away) → `ap:"ORF"` (Norfolk). Line 548. Breaks flight pricing for this venue. |
| **Ski-thinning empty state — no copy** | **P2** | **Day 5** | Identified May 15. Still not shipped. Reddit users in late May see a thin ski grid with no explanation. 10-min fix. See decision #3. |
| **BookingConfirmSheet on flights** | **P2** | **Day 8** | Decided May 12: remove on flights, keep on hotels. Still in place. Unnecessary friction on highest-intent CTA. |

**Net P0/P1:** 5. Combined keyboard time: ~35 min. Reddit is in 48 hours.

---

## Explicit Product Decisions — May 20

**Decision 1: GEAR_ITEMS ships TODAY. Non-negotiable.**

Five days. The code is paste-ready in `reports/content-report.md`. The Revenue Model table has been lying about Amazon Associates being LIVE since May 15. At 5K MAU post-Reddit that's $22/mo sitting dark. At 100K MAU it's $448/mo. This is not a design question. It's a paste operation. If it doesn't ship before Reddit, update the Revenue Model to show $0 — don't launch with a false shared brain.

**VERDICT: SHIP today. Paste `reports/content-report.md:82–155` into app.jsx Constants section. Bump cache.**

**Decision 2: Batch data commit — all 5 fixes in one push.**

pigeon-point-t27 was approved on May 13. It's May 20. val-d-isere-s16 and sarakiniko-beach-t16 were approved May 15. outer-banks-nags-head-t7 IATA fix was called out May 15. None of these are design debates. They are execution gaps. Combine with cache bump (`20260520a`) and GEAR_ITEMS in one commit.

**VERDICT: SHIP as one commit today. 3 venue line-deletes + 1 IATA fix + GEAR_ITEMS paste + cache bump across 3 files.**

**Decision 3: Ski-thinning seasonal copy — SHIP before Reddit. 10 minutes.**

By Memorial Day weekend (the exact launch moment), most N-hemisphere ski venues score `confidence: "low"` and disappear from the front page. A new user sees a thin, beach-heavy grid with half the skiing section missing and no explanation. They bounce. They post "skiing section is empty?" in the same Reddit thread we used to launch.

The fix is one `if` block before the generic empty-state in the Explore grid. When `activeCat === "skiing"` AND grid returns < 6 cards:
- Heading: "Ski season winding down"
- Sub: "Southern Alps and late-season resorts still firing. Try Beach, or check back in November."
- CTA: "Switch to Beach"

This makes the thinning look designed, not broken.

**VERDICT: SHIP before Reddit post. 10 min. Not optional if launching before June 1.**

---

## This Week's Top 3 Priorities Only

**1. One batch commit: GEAR_ITEMS + 3 venue deletes + outer-banks IATA fix + cache bump to 20260520a.**
~30 min. Code agent can do it. GEAR_ITEMS code is paste-ready in content-report.md. Venue deletions are 3 line deletes. Cache bump is 3 file edits. This single commit closes 3 P0/P1 items and makes the shared brain honest.

**2. VPS redeploy — one SSH command. Jack must do this.**
`ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. Then `curl https://peakly-api.duckdns.org/health`. Day 16. Weekend pricing + weather cache + alerts polling are all dead without it. Not a code problem. A keyboard problem.

**3. Write the Reddit post. Today.**
The post doesn't exist. Reddit window closes May 22. Treat the post as a product artifact: story hook (1 paragraph) → what it does (2 sentences, no jargon) → Whistler screenshot with firing score → deal price → link. Post in r/skiing + r/solotravel + r/frugaltravel between 9–11am PST on a Tuesday or Wednesday.

**After these three: nothing else ships until we have Reddit feedback.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Any new app.jsx feature | **HARD BLOCK** | Feature freeze until Reddit posted + VPS verified. 8,837 lines, zero user validation. |
| Maldives beach venue | **DEFER post-Reddit** | Correct eventually. Pre-Reddit additions risk new data bugs. |
| S-hemisphere ski expansion | **DEFER post-Reddit** | Right call for June when N-hem thins. Not today. |
| Venue description fields | **DEFER** | Explore doesn't render them. Needs UX work first. |
| abasin lateSeason flag | **DEFER** | Low-risk post-launch fix. |
| Any new Alerts UI | **FREEZE** | Push doesn't deliver end-to-end until VPS live + APNS keys. Freeze holds. |
| Map features | **DEFER post-launch** | Zero real-user validation. MapView still gated correctly. |
| Hotels in deal score | **CUT v2** | Confirmed 05-07. Final. |
| Wishlists / Trips reveal | **DEFER** | 1K MAU gate. Hard lock. |

---

## Success Criteria — May 20

**Pre-launch checklist:**

1. ✅ SEO meta clean — zero "surf"/"adventure" strings.
2. ✅ APNS Capacitor gate — `showAlertsTab` at app.jsx:8158.
3. ✅ Sentry DSN live.
4. ⚠️ Cache buster — was 20260513j; stale since 05-15 DevOps fix. Must bump to 20260520a today.
5. ❌ **VPS proxy redeploy verified** — Day 16. `/health` must show `wxCache.size > 0`.
6. ❌ **GEAR_ITEMS restored** — Amazon earns $0. Paste-ready. No excuse.
7. ❌ **Venue data health** — 3 approved duplicates + wrong IATA still in code. Pre-Reddit liability.
8. ❌ **Ski-thinning seasonal copy** — thin grid looks broken without explanation.
9. ❌ **Live human smoke test** — Explore from JFK, ScoreBreakdown, flight price, empty state, Booking.com link. Not a script.
10. ❌ **Reddit post written and queued.**

**90-day projection:**
- **8K users**: Reddit by May 22, ski-tail × Memorial Day overlap. Requires VPS + GEAR_ITEMS TODAY.
- **5K–6K users**: Reddit late May, ski grid thinning, no peak-overlap boost.
- **<4K users**: Reddit in June. N-hem ski season over. No moat.

The gap between 8K and 4K is this weekend.

---

## One Product Risk Nobody Is Talking About

**The Reddit launch post doesn't exist, and a bad Reddit launch is worse than no Reddit launch.**

A Reddit launch is not: post link, get users. It's: (1) right subreddits (r/skiing, r/solotravel, r/frugaltravel, r/travel — NOT r/webdev); (2) a story post, not a product link; (3) a specific use case lead ("I built this because I was last-minute checking Whistler and couldn't find one place that combined snow conditions AND cheap flights"); (4) screenshots showing the confidence flag and a real deal price — not just the app icon; (5) posted 9–11am PST Tuesday–Wednesday for best upvote velocity.

Posting without these elements doesn't get 5K users. It gets 12 upvotes and a "cool, but why would I use this over Google Flights?" comment that buries the thread. Once a Reddit thread dies, it doesn't come back.

**PM call: write the post today, treat it as a product artifact. The copy matters as much as the code.**
