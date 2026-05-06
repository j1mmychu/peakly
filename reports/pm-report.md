# Peakly PM Report — 2026-05-06 (v33)

**Filed by:** Product Manager agent
**Date:** 2026-05-06
**Status:** YELLOW → moving to RED on Reddit deadline. Two quick-ship P1s still unshipped after 3+ days. Open-Meteo cache Day 18 with no VPS session scheduled. Ski+beach seasonal window closes May 20 — 14 days.

---

## Shipped Since Last Report (May 5 → May 6)

| Commit | What | Right call? |
|--------|------|-------------|
| `0292537` (May 6, DevOps) | Cache bust → 20260506a, GEAR_ITEMS.tanning→beach fix, gear gate `{false&&}` removed at line 5763 | ✅ Necessary hygiene. Note: gear gate fixed again — see below. |
| `d62ac69` (May 6, Content) | Read-only audit | Neutral — no fixes applied. |

**Assessment:** Two agents ran today and shipped one real fix between them (gear category key). The gear gate has now been "fixed" twice in three days (May 4 DevOps + May 6 DevOps). The second fix suggests the May 4 fix either ran against a stale local branch or line-shifted after the Supabase commits. Both fixes are now in origin/main; current state confirmed open at app.jsx:6404 (`GEAR_ITEMS[listing.category] &&`). Not a regression risk going forward.

**Content agent integrity issue (critical):** Today's content report audited 240 venues (78 surfing, 89 tanning, 73 skiing). The live code has 151 venues (86 beach, 65 skiing, 0 surfing). The content agent ran against a local checkout 14 commits behind origin/main. Every finding in today's content report is based on pre-pivot data and is invalid. Do not action any content-report finding until the agent is configured to `git pull origin main` before running.

---

## Permanent Bug Triage — Do Not Re-Flag

| Issue | Evidence |
|-------|----------|
| Peakly Pro $9/mo | No Pro UI in codebase. |
| Sentry DSN empty | Real DSN at app.jsx:7-8. |
| TP_MARKER unset | app.jsx:1593 = "710303". |
| JSON-LD missing | index.html:34 — WebSite + WebApplication + Organization schema. |
| Gear gate closed | app.jsx:6404 `GEAR_ITEMS[listing.category] &&` — open. |
| Surfing venues | 0 in codebase. Retired May 3. |
| aruba-eagle-beach-t1 dupe | Deleted. |
| Weather cache 429 retry | fetchWeather has backoff retry on 429/5xx. |

---

## Active Bug Triage — May 6

| Bug | Severity | Status | Days Open | Impact |
|-----|----------|--------|-----------|--------|
| **Open-Meteo rate limit — no server-side cache** | **P0 PRE-SPIKE** | ❌ Unbuilt | **Day 18** | 151 venues × 1.5 calls = 226/cold session. ~44 concurrent cold users → 10K quota gone → all scores return 50 → app breaks silently. Hard gate before Reddit. |
| **index.html meta tags still advertise surfing** | **P1** | ❌ Open | **Day 3** | `<title>`, `<meta description>`, `og:description`, `twitter:description`, JSON-LD all say "surf." Google re-crawl will index Peakly as a surf app. Fix is 4 line edits. |
| **chamonix-mont-blanc-s18 duplicate venue** | **P1** | ❌ Open | **Day 1** | Identical coords (45.9237, 6.8694) + same airport (GVA) as canonical `chamonix`. Lower rating (4.66 vs 4.96), lower reviews (1,477 vs 3,405). One-line deletion. |
| **Reddit launch: no date set** | **P1 / Product gate** | ❌ Open | **Day 38** | Ski+beach seasonal overlap window closes ~May 20. Every day of delay reduces dual-sport audience reach. |
| **Supabase RLS unverified** | **P2** | ⚠️ Unknown | Day 2 | Anon key is intentionally public per Supabase design. If Row Level Security isn't configured on the project, any anon key holder can query all auth.users data. Verify before first user signs in. |
| **Email list fragmentation** | **P2** | ❌ Decision needed | Day 2 | Waitlist signups → VPS `waitlist.jsonl`. Magic-link auth → Supabase `auth.users`. Two separate email lists with no reconciliation. Compounds with every user. Needs a decision now, not after launch. |
| **PEAKLY_BUILD stamp mismatch** | **P3** | ❌ Minor | Day 2 | app.jsx PEAKLY_BUILD = "20260504h" but sw.js = "peakly-20260506". Sentry error tags will show wrong build version. 2-char fix. |
| **skiPass field missing on s-series ski venues** | **P3** | ❌ Deferred | Day 16 | Badge absent on ~29 venues. Scoring unaffected. Post-100 users. |
| **Strike alerts: no background worker** | **P3** | Deferred | Day 40+ | Zero users with active alerts. Post-500 MAU. |

### P0 Detail: Open-Meteo Rate Limit (Day 18)

The math hasn't changed. It just got one day worse.

- 151 venues × ~1.5 API types = **226 calls per cold-cache user**
- Open-Meteo free tier: **10,000 calls/day**
- Break-even: **44 simultaneous cold-cache users**
- A Reddit post with modest traction sends 50–200 visitors in 30 minutes
- Result: quota burns, `fetchWeather` returns null, `scoreVenue` can't run, every card shows score 50 or blank, the value prop disappears, the Reddit thread dies

This is not a theoretical risk. This is the mechanism by which a successful Reddit launch becomes a failed one. The spec is in devops-report.md. Two Express routes in `server/proxy.js` + 2-line redirect in `app.jsx`. Requires Jack to SSH to 198.199.80.21. Estimated 2–4 hours including smoke test.

**This fix must ship before the Reddit post goes live. No exceptions.**

---

## Known Blockers

| Blocker | Owner | Status |
|---------|-------|--------|
| **Weather cache on VPS** | Jack (SSH to 198.199.80.21) | Gates Reddit launch. Schedule this week. |
| **Reddit launch date** | Jack | 14 days to May 20 seasonal close. Name the date today. |
| **LLC approval** | External | Unblocks REI (+$6.16 RPM), Backcountry, GetYourGuide. Not gating launch. |
| **Apple Developer $99** | Jack | Deferred post-1K MAU. |
| **Supabase RLS** | Jack (Supabase dashboard) | Verify before first user signs in. |

---

## This Week's Top 3 Priorities Only

**1. index.html SEO copy + chamonix-mont-blanc-s18 deletion + PEAKLY_BUILD stamp: one commit, 15 minutes, ship today.**

`index.html` title tag: "Peakly — Find Surf, Ski & Adventure Spots with Cheap Flights" → "Peakly — Find Ski & Beach Weekends with Cheap Flights." Four meta description lines swap "surf" out. This has been open 3 days with zero blockers. Every day it sits open, Google's crawl index drifts further from reality. Fix it while app.jsx is open for the chamonix deletion.

`chamonix-mont-blanc-s18`: identical coordinates to `chamonix`, lower reviews, wrong tags. Delete line 525. 30 seconds.

PEAKLY_BUILD stamp: bump "20260504h" → "20260506a" to match the live cache. Keeps Sentry error tags accurate.

**2. Jack: Schedule the VPS session this week. Non-negotiable.**

May 10 is 4 days away. May 20 (seasonal window close) is 14 days away. The VPS session takes 2–4 hours. There is no Reddit launch without it. This is the only blocker that requires Jack personally. Everything else can ship via agent. Block it on the calendar.

**3. Jack: Email fragmentation decision before any users sign in.**

Two email lists will diverge from day one if this isn't decided now. Options:
- **Option A (recommended):** On first Supabase sign-in success, also POST to `/api/waitlist` so both lists stay in sync. One Supabase auth `onAuthStateChange` hook, one fetch. ~10 lines.
- **Option B:** Disable waitlist form, go Supabase-only. Simpler but loses VPS list history.
- **Option C:** Accept fragmentation, build export script before first email campaign. Kicks can down the road.

Option A is the right call. Low effort, preserves both systems, prevents the lifecycle email nightmare.

---

## Explicit Product Decisions — May 6

**1. index.html SEO cleanup: SHIP TODAY.** 3 days open. No technical debt. It's a title tag.

**2. chamonix-mont-blanc-s18: DELETE TODAY.** Bundle with #1.

**3. Content agent audit findings (May 6): DISCARD.** The agent ran against a pre-pivot local branch. All 240-venue findings are invalid. Do not action venue deletions, photo swaps, or tag changes from today's content report until it re-runs against current origin/main.

**4. New venue proposals (Revelstoke, Maspalomas, Ipanema, Nusa Lembongan): DEFER to post-Reddit.** Catalog stable at 151. Pre-launch freeze. After Reddit: prioritize Ipanema (zero Rio coverage) and Maspalomas (zero Canary Islands coverage).

**5. GetYourGuide partner_id: SHIP WEEK OF MAY 12.** One-line change, +$1.68 RPM. Too small to touch during pre-launch sprint but too easy to leave open post-launch. Ship it on Day 2 of Reddit response.

**6. More Supabase features: CUT THIS PHASE.** Freeze cloud sync scope at current state until 50 confirmed active users. No subscription tiers, no server-side writes, no sync UI expansion.

**7. Wishlists / Trips reveal: LOCKED at 1K MAU.** Standing decision. Not revisiting.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| More Supabase auth features | **CUT this phase** | 0 MAU. Wrong time for auth complexity. |
| New venue batches | **DEFER post-Reddit** | Pre-launch catalog freeze. |
| Climbing/MTB/kayak categories | **PERMANENT CUT** | Launch scope is ski + beach. Full product decision required to revisit. |
| SRI / CSP hardening | **DEFER** | Babel eval incompatibility. Post-launch security pass. |
| Venue deep links | **DEFER** | Explicit pre-launch decision. Post-Reddit. |
| Push notification background worker | **CUT to post-500 MAU** | Zero active alert users. |
| skiPass field backfill | **DEFER to post-100 users** | P3. Scoring unaffected. |

---

## Success Criteria

**For 8K, not 5K, at 90 days:**

1. **Weather cache live before Reddit post.** Without it: one spike = broken app = no recovery. This one variable accounts for a 3K MAU swing.
2. **Reddit post before May 20.** The ski+beach dual-sport angle is the strongest first impression. After May 20, high-altitude venues start hitting off-season scores and the grid loses its skiing story. Missing this window means a beach-only launch in June — weaker hook, half the subreddit audience.
3. **D1 retention > 40%.** The Weekend Score + distance filter are the two features most likely to drive return visits. We have no D1 telemetry. Plausible doesn't report D1 retention. Supabase return-session tracking is possible but unbuilt. Flag this for next session — instrument it before Reddit so the data exists from day one.
4. **50 email captures before Reddit.** Check `server/data/waitlist.jsonl` for current count. A launch with 0 pre-existing subscribers = one-time spike. With 50 = second wave on follow-up.

**90-day math:** Cache + May Reddit + lateSeason ski = 7K–8K. June Reddit + any quota hit = 4K plateau. The delta between 5K and 8K is decided entirely by whether the VPS session and Reddit post both happen before May 20.

---

## One Product Risk Nobody Is Talking About

**The content agent is generating authoritative-sounding reports against a 14-commit-stale codebase.**

Today's content report lists 240 venues (78 surfing, 89 tanning) with detailed duplicate and photo audits — all against code that doesn't match production. If Jack reads the report without knowing this, he might delete venues that were already deleted, swap photos that were already swapped, or re-introduce surfing venues that were deliberately retired. The finding-to-fix pipeline is only as good as the data the agents see.

The fix is one line: add `git fetch origin main && git reset --hard origin/main` (or `git pull origin main`) to the content and DevOps agent scripts before they read app.jsx. Until that's added, treat any content or DevOps finding that references venue counts, categories, or line numbers as potentially stale. Cross-reference against `wc -l app.jsx` (currently 7,172 lines) and venue counts (86 beach, 65 skiing, 0 surfing) before actioning.
