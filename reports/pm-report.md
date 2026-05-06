# Peakly PM Report — 2026-05-05 (v32)

**Filed by:** Product Manager agent  
**Date:** 2026-05-05  
**Status:** YELLOW. Pivot landed clean. Execution is flowing. But two wrong-sequence calls happened overnight, and the one gating action before Reddit launch still requires Jack to SSH into the VPS. Ski+beach seasonal window: ~14 days left.

---

## Shipped Since Last Report (May 4 PM → May 5)

| Commit | What | Right call? |
|--------|------|-------------|
| `a9aacf5` (May 4, Jack) | Merge pivot + seasonal-default category | ✅ Correct. Beach in summer, Ski in winter. |
| `3bbe88e` (May 4, Jack) | Estimate price labels (~$X), carousel fallback, PWA install nudge | ✅ Correct. B.1, B.2, B.3 from the plan. Outsized trust signals. |
| `ab692d3` + `b92f653` + `028162a` + `011b8dc` (May 4–5, Jack) | **Supabase cloud sync** — magic-link auth, lazy-load, anon key wired | ❌ **Wrong sequence.** Right feature, wrong phase. 4 commits on auth infrastructure at 0 MAU while the Reddit post hasn't gone live and the weather cache is still unbuilt. See below. |
| `079bc8d` (May 5) | Deal algorithm honesty pass — seasonal typical, staleness gate, savings floor | ✅ Correct. Was explicitly flagged. Honest pricing is table stakes. |
| `1b04be6` (May 5, DevOps) | Cache bust → 20260505a, fetchMarine 3x retry with backoff | ✅ Correct hygiene. fetchMarine retry mirrors fetchWeather. |
| aruba-eagle-beach-t1 | Deleted (ready-to-ship diff applied) | ✅ Closed P1 open 12+ days. |
| `18fd13f` (May 5, Content) | Read-only audit | Neutral. |

**Assessment of Supabase cloud sync:** The May 4 PM report's top 3 were (1) lateSeason + aruba dupe, (2) weather cache, (3) Reddit post. Items 1 and aruba-dupe shipped. Items 2 and 3 did not. Supabase shipped instead. Cloud sync is a correct long-term feature that belongs at 500–1K MAU, after product-market fit is confirmed and after there's user data worth syncing. Building it at zero users inverts the priority stack. It's shipped now, so it's moot — freeze cloud sync scope here until post-50 users.

**Venue count:** 151 active (86 beach, 65 skiing). Surfing retired. 7 ski venues carry `lateSeason:true` (Mammoth, Tignes, Cervinia, Val d'Isere, Chamonix + 2 more).

---

## Permanent Bug Triage — Confirmed Closed (Stop Flagging)

| Issue | Evidence |
|-------|----------|
| Peakly Pro showing $9/mo | No Pro UI in codebase. Removed. Stop flagging. |
| Sentry DSN empty | Real DSN at app.jsx:7-8. |
| TP_MARKER unset | app.jsx:1593 = "710303". |
| JSON-LD missing | index.html:34. |
| Gear gate closed | `GEAR_ITEMS[listing.category]` — open, earning. |
| aruba-eagle-beach-t1 dupe | Deleted. |
| Surfing venues | 0 in codebase. Retired. |

---

## Active Bug Triage — May 5

| Bug | Severity | Status | Days Open |
|-----|----------|--------|-----------|
| **Open-Meteo rate limit — no server-side cache** | **P0 PRE-SPIKE** | ❌ Still unbuilt. 151 venues × ~1.5 calls = 226/cold session. 10K free tier = ~44 concurrent cold users. One Reddit spike → quota burns → all scores return 50 → app breaks. | **Day 17** |
| **3 photo duplicate pairs (one triple)** | **P1** | ❌ angourie-point-s3/arugam_bay/tamarindo (triple), portillo-s4/perisher, beach_phuquoc/beach_praslin. Screams fake data on the grid. | Day 6 |
| **index.html still advertises "surf" in 4 SEO fields** | **P1** | ❌ meta description, og:description, twitter:description, title tag, JSON-LD description all mention surfing. Google will index Peakly as a surfing app 2 weeks after surfing was retired. | Day 2 |
| **Reddit launch: no date set** | **P1** | ❌ May 10 soft deadline is 5 days away. No post drafted. Ski+beach seasonal window closes ~May 20. | Day 37+ |
| **Supabase RLS configuration unverified** | **P2** | ⚠️ Anon key is intentionally public per Supabase design. But if Row Level Security isn't configured on the project, anon key holders can read/write all user data. Verify before any user data is stored. | Day 1 |
| **skiPass field missing on 29 s-series ski venues** | **P3** | ❌ Badge absent, gear cross-sell silently skips them. Scoring unaffected. | Day 15 |
| **Strike alerts: no background worker** | **P3** | Deferred. Zero users with alerts set. Post-500 MAU. | — |

### P0 Detail: Open-Meteo Weather Cache (Day 17)

Math, one more time: 151 active venues, ~1.5 API calls each = 226 calls per cold-cache user. Open-Meteo free tier: 10,000/day. Break-even: 44 simultaneous cold-cache users. A single Reddit post linking the app can easily send 50–100 users in the first hour. Result: quota burns, every score returns 50 "data unavailable," value prop disappears. Reddit thread dies. No second launch.

The spec is ready. Two Express routes in proxy.js (~40 lines) + 2-line app.jsx change to redirect fetchWeather/fetchMarine to `peakly-api.duckdns.org/api/weather`. VPS is 198.199.80.21. SSH only. Estimated: 2–4 hours including `pm2 restart proxy` + smoke test.

**This fix requires Jack on the VPS. No agent can deploy this. It gates the Reddit post.**

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| **VPS weather cache session** | Jack (SSH to 198.199.80.21) | Gates Reddit launch. Schedule this week. |
| **Reddit launch date** | Jack | 5 days to May 10 deadline. Name it now. |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide. Not gating launch. |
| **Apple Developer enrollment** | Jack — $99/yr | Blocks iOS App Store. Deferred. |

---

## This Week's Top 3 Priorities Only

**1. Photo dupes + index.html SEO cleanup — one commit, 20 minutes, ship today.**

Photo dups: 5 swaps (tamarindo, arugam_bay, portillo-s4, beach_phuquoc — URLs in content-report.md). The triple share (angourie/arugam/tamarindo) is the worst — three cards on the grid with identical images screams "this is a bot-generated app." Kill it.

SEO cleanup: 4 lines in index.html still say "surf." After the 2026-05-03 pivot, Google will continue indexing Peakly as a surfing app. Swap in ski+beach copy. The title tag still says "Find Surf, Ski & Adventure Spots" — fix it while you're in the file. These are 6 characters each, 5 minutes total. Bundle into the photo commit.

This has been open 6 days. There is no reason it's still open.

**2. Jack: Book VPS session for Open-Meteo weather cache. This week. Non-negotiable.**

This is not a "sometime before launch" item. This is the difference between a successful Reddit launch and a broken one. The spec has been written and sitting for 17 days. The only variable is Jack scheduling the SSH session. Block 2 hours on the calendar. Deploy. Smoke test. Done.

Without this: do not post to Reddit. The first spike kills the app.

**3. Jack: Set the Reddit launch date. Today.**

It's May 5. The May 10 deadline was self-imposed and is now 5 days away. The ski+beach seasonal window where the app shows both ski and beach venues scoring well simultaneously — the most compelling first impression — closes around May 20 when high-altitude resorts start hitting off-season. Mammoth closes early June. Tignes glacier runs later, but the powder is gone.

Pick May 8 or 9. Write 3 sentences: "I built this to find ski/beach weekends when conditions + cheap flights align. Here's today's best: [screenshot of Explore grid showing 3 good venues]." Post to r/skiing, r/travel, or r/solotravel. The product is ready. The post isn't.

---

## Explicit Product Decisions — May 5

**1. Photo dupes: SHIP TODAY. No more deferrals.**
Six consecutive reports have flagged this. Three of the five pairs are now surfing venues gone from the pivot. Two remain (portillo/perisher, beach_phuquoc/beach_praslin) plus the triple (angourie/arugam/tamarindo). 5 photo URL swaps. 10 minutes. This is a judgment call on my end: continuing to defer this while prepping for Reddit launch is a credibility mistake.

**2. index.html surfing meta tags: SHIP WITH PHOTO FIX.**
"Find Surf, Ski & Adventure Spots" is the current page title. That is not what Peakly is anymore. Ski + beach only. The SEO description has "surf" four times. Google's crawl index has the wrong product description. Fix this before the Reddit traffic hits and before Google re-crawls. 10-minute edit, zero risk.

**3. Supabase cloud sync: FREEZE SCOPE HERE.**
It's shipped. Don't add more features on top of it. Don't add server-side writes, subscription tiers, or sync UI until post-50 users confirm it's being used. Verify RLS is configured on the Supabase project before any user data is stored. If RLS isn't set up, disable writes and treat it as read-only until verified.

**4. GetYourGuide partner_id: DEFER until post-Reddit.**
Revenue agent flagged this again. Adding GYG partner_id is a 1-line change from generic URL to commissioned URL. Do it — but after Reddit, not during pre-launch cleanup. Clean up the launch window; close the revenue gap in day 3 of post-launch.

**5. skiPass field backfill (29 s-series venues): DEFER to post-100 users.**
P3. Scoring unaffected. Badge absent but not blocking. Not in pre-launch scope.

**6. Wishlists / Trips reveal: LOCKED at 1K users.**
Standing decision. Not re-opening before 1K confirmed MAU.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| More Supabase auth features | **CUT (this phase)** | Freeze at current state. 0 MAU. Wrong phase for auth complexity. |
| New venue batches | **DEFER** | Catalog stable at 151. Pre-launch freeze. |
| Climbing/MTB/kayak categories | **PERMANENT CUT** | Launch scope is ski + beach. Requires full product decision to revisit. |
| SRI / CSP hardening | **DEFER** | Babel eval incompatibility blocks CSP without a build step. Post-launch. |
| Venue deep links | **DEFER** | Explicit pre-launch decision. Post-Reddit. |
| Push notification background worker | **CUT to post-500 MAU** | Zero users with alerts. |

---

## Success Criteria

**For 8K, not 5K, in 90 days — what has to be true:**

1. **Weather cache live before Reddit.** Without it: spike breaks the app, thread dies, no recovery. 3K user swing.
2. **Reddit post lands in the ski+beach overlap window (before May 20).** After that, ski grid goes off-season and the dual-sport angle disappears. 2K user swing.
3. **D1 retention > 40%.** The Weekend Score + distance filter are the two features most likely to drive return visits. But we have no D1 telemetry. Plausible doesn't report D1. Supabase could track return visits by auth session — but we need to instrument this. Flag for next session.
4. **At least 50 email captures before Reddit post.** A launch with 0 signups = one-time spike. With 50 = second post. Check `server/data/waitlist.jsonl` for current count.

**90-day math:**
- Cache + May Reddit + lateSeason ski = 7K–8K
- June Reddit + any app breakage during spike = 4K plateau, no recovery
- The gap between 5K and 8K is entirely decided in the next 72 hours (VPS session + launch date).

---

## The One Risk Nobody Is Talking About

**The Supabase magic-link flow creates a parallel email list that will never merge with the VPS waitlist.**

Users who sign up via the waitlist form → `server/data/waitlist.jsonl` (VPS flat file).  
Users who sign in via Supabase magic-link → Supabase `auth.users` table.

These are two separate email lists. There's no ETL, no reconciliation, no way to send a "Peakly is live on the App Store" email to both groups without manually exporting and deduplicating. The longer this runs, the worse the fragmentation gets. If the app gets 2K users in the first Reddit spike and 60% use magic-link auth, there are 1,200 email addresses in Supabase and 0 in the waitlist. Any future lifecycle email campaign misses 60% of the user base.

**Decision needed:** Pick one email source of truth and route all signups there. Options:
- Make magic-link auth also POST to `/api/waitlist` on first sign-in
- Disable the waitlist form and go Supabase-only
- Accept the fragmentation and build an export script before the first email campaign

This needs a decision before any traffic arrives, not after.
