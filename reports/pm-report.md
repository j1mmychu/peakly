# Peakly PM Report — 2026-05-21 (v36)

> Latest report. Full history in `reports/inputs/pm-YYYY-MM-DD.md`.

**Status: RED. Today is the last day of the May Reddit window. Zero code commits in 8 days. VPS is Day 17. GEAR_ITEMS is Day 8. Two new P1s surfaced today (AP_CONTINENT string mismatch + invalid Pucon IATA). The gap between 8K and 4K users closes tonight.**

---

## Shipped Since Last Report (2026-05-15 → 2026-05-21)

| What | Right call? |
|------|-------------|
| **Nothing.** Zero code commits in 8 days. | ❌ Not acceptable. Both P0s required paste-and-ship, not product decisions. |

The last meaningful commit was the DevOps P1 fix on 2026-05-15 (4d16e3d). The May 20 PM report flagged the same P0s. Neither triggered a code response. That pattern ends today.

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

## Active Bug Triage — May 21

| Bug | Severity | Days Open | Jack action? |
|-----|----------|-----------|-------------|
| **VPS proxy not verified live** | **P0** | **Day 17** | ✅ YES. `ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy && curl localhost:3001/health"`. Open-Meteo breaks at **43 DAU** without the proxy cache (DevOps 05-21 corrected math: 154 venues × ~231 calls/user ÷ 10K daily free tier = 43 users). Reddit sends 200+ in the first hour. |
| **GEAR_ITEMS missing from app.jsx** | **P0** | **Day 8** | ✅ YES (paste-ready). Code in `reports/content-report.md §2`. Amazon earns $0. CLAUDE.md says LIVE at $4.48/1K MAU — false for 8 days. |
| **AP_CONTINENT string mismatch — continent filter broken** | **P1** | **NEW** | `PDX` overridden to `"north_america"` (wrong) after a correct `"na"` definition — JS last-write-wins. `SNA` same bug. Mt Hood Meadows + Laguna Beach invisible when continent filter is active. 10 airports also map to `"south_america"` — any future S. America venue will silently vanish. Fix: patch the two offenders in the AP_CONTINENT block (see Content 05-21 report). |
| **ZPC not a real IATA code (Pucon venue)** | **P1** | **Day 2** | Pucon ski venue uses `ap:"ZPC"` — not a real IATA code. Flight pricing returns nothing; deal score is miscalibrated. Correct airport: `PMC` (Temuco/Maquehue, 110km, only commercial option) or remove the venue. |
| **3 venue duplicates approved but never deleted** | **P1** | **Day 6–8** | One batch commit: delete `pigeon-point-t27` (line 566), `sarakiniko-beach-t16` (line 556), `val-d-isere-s16` (line 530). All approved since May 13–15. |
| **outer-banks-nags-head-t7 wrong airport** | **P1** | **Day 8** | `ap:"OAJ"` (Jacksonville NC, 70mi away) → `ap:"ORF"` (Norfolk). Line 548. Breaks flight pricing. |
| **Ski-thinning empty state — no copy** | **P1** | **Day 6** | June 1 is 11 days away. Grid thins with no explanation. 10-min fix. See decision #3. Elevated from P2 — Reddit timing makes this pre-launch now. |
| **BookingConfirmSheet on flights** | **P2** | **Day 9** | Decided May 12: remove on flights, keep on hotels. Still in place. |

**Net P0/P1:** 7. Combined code time: ~45 min. VPS is Jack-only.

---

## Explicit Product Decisions — May 21

**Decision 1: GEAR_ITEMS ships TODAY. Day 8. Final warning.**

Eight days. The code is paste-ready in `reports/content-report.md §2`. Amazon Associates has been "LIVE" in the shared brain while earning $0. At 5K MAU post-Reddit that's $22/mo dark. Not a design question — a paste operation. If it doesn't ship before Reddit, update CLAUDE.md Revenue Model to $0 for Amazon. Don't run a post-launch revenue audit against a shared brain that's been lying for 9 days.

**VERDICT: SHIP today. Code agent pastes `content-report.md §2` into app.jsx Constants section. Bump cache to `20260521a`.**

**Decision 2: Batch data commit — 5 fixes + AP_CONTINENT patch + seasonal copy in one push.**

Add to the batch: AP_CONTINENT string fix (PDX `"north_america"` → `"na"`, SNA same) and ZPC → PMC for Pucon. All five previously approved items still unshipped. Combine with GEAR_ITEMS paste, cache bump to `20260521a`, and seasonal ski-thin copy. One commit closes 7 open items.

**VERDICT: Code agent ships this now. Venue count goes 150 → 147 after 3 deletes. Update index.html venue count accordingly.**

**Decision 3: Ski-thinning copy — elevated to pre-launch required. 10 minutes.**

June 1 is 11 days away. Reddit is today. Memorial Day travelers will check Peakly this weekend and see a visibly thin ski grid. The filter-aware empty state handles "no results for your filters" — it does NOT handle "it's May and N-hem ski season is ending." Without seasonal copy, the Explore grid just looks incomplete.

When `activeCat === "skiing"` AND sorted grid returns < 6 cards AND month is May–Oct:
- Heading: "Ski season winding down"
- Sub: "Southern Alps and late-season resorts still open. Try Beach, or check back in November."
- CTA: "Switch to Beach"

**VERDICT: SHIP in the same batch commit. 10 min. Not optional for a May Reddit launch.**

---

## This Week's Top 3 Priorities Only

**1. Mega batch commit: GEAR_ITEMS + AP_CONTINENT fix + 3 venue deletes + outer-banks IATA + ZPC fix + seasonal ski copy + cache bump to `20260521a`.**
~45 min. Code agent executes. Paste-ready code in content-report.md. Closes 7 open items. One commit. This is the entire pre-Reddit code checklist (minus VPS which is Jack-only).

**2. VPS redeploy — Jack SSH, 10 min, today.**
`ssh root@198.199.80.21 "cd /opt/peakly-proxy && git pull && pm2 restart peakly-proxy"`. Then `curl https://peakly-api.duckdns.org/health`. Day 17. Break-even is 43 DAU. Reddit sends 200+ in the first hour. The app goes dark without this.

**3. Post to Reddit today or defer to June 5.**
Today is the last day of the May window (ski-tail × Memorial Day overlap). If VPS + batch commit are done before noon PST, post today: r/skiing + r/solotravel + r/frugaltravel, 9–11am PST. Story-first post: "I got tired of checking OnTheSnow AND Google Flights separately..." → screenshot of a firing Whistler card with a deal price → link. If VPS isn't up by noon: defer to June 5 (beach-season window, 6K ceiling). Don't post with a broken proxy.

**After these three: zero new features until 100 users are in Plausible.**

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

## Success Criteria — May 21

**Pre-launch checklist:**

1. ✅ SEO meta clean — zero "surf"/"adventure" strings.
2. ✅ APNS Capacitor gate — `showAlertsTab` at app.jsx:8158.
3. ✅ Sentry DSN live.
4. ✅ Cache buster `20260513j` — aligned app.jsx / sw.js / index.html (DevOps 05-21 confirmed ✅).
5. ❌ **VPS proxy redeploy verified** — Day 17. `/health` must return `weather_cache` + `poll_stats`. Without it: app dark at 43 DAU.
6. ❌ **GEAR_ITEMS restored** — Day 8. Amazon earns $0. Paste-ready code in content-report.md.
7. ❌ **AP_CONTINENT fix** — NEW today. PDX/SNA venues broken on continent filter.
8. ❌ **Venue data cleanup** — 3 duplicates + outer-banks IATA + ZPC invalid code. Batch commit.
9. ❌ **Ski-thinning seasonal copy** — 11 days to June 1. Ship before Reddit.
10. ❌ **Live 5-min human smoke test** — Explore from JFK, ScoreBreakdown, flight price, filter CTA, Booking.com link. Jack's fingers, not Playwright.
11. ❌ **Reddit post written.** Today or defer to June 5.

**90-day projection:**
- **8K users**: Reddit today + VPS up. Ski-tail × Memorial Day overlap. Barely achievable — today is the day.
- **6K users**: Reddit June 5. Beach-season carry. Acceptable.
- **4K users**: Reddit after June 15. Ski tail gone, no moat angle. Don't let this happen.

The gap between 8K and 4K is resolved by the end of today.

---

## One Product Risk Nobody Is Talking About

**The VPS has been P0 for 17 days and we don't know if it's even running.**

Every PM and DevOps report since May 4 has flagged `git pull && pm2 restart` as the fix. It takes 10 minutes. It has not shipped. That's not a priority problem — that's a pattern problem. At some point the question stops being "when will this get done?" and becomes "is the process manager still alive?"

We don't know. The `/health` endpoint might be returning 502. The Let's Encrypt cert might have expired. The Node process might have crashed on startup from a bug in the polling worker. The DuckDNS record might have lapsed. None of these states are impossible after 17 days of no verification.

If Jack runs the SSH today and it goes wrong — `pm2 list` shows the process crashed, or the HTTPS cert is expired, or `git pull` fails on a conflict — there's time to debug before the post. That buffer closes the moment the Reddit post goes live.

**PM call: SSH before the Reddit post is written, not after. Verify `/health` responds correctly before any other pre-launch step. If the VPS is broken, the timeline moves to June 5 regardless of everything else being ready.**
