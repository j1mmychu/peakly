# Peakly PM Report — 2026-07-02 (v76)

> Supersedes v75 (July 1). **Status: RED on distribution, GREEN on code.** Day 28 of "launch-ready." v75 called July 1 the last viable day for the July 4 hook. It passed. Today (July 2) is the hard wall — post before 3 PM Pacific and the July 4 planning window is still open for US Redditors. After that, the hook is dead until Labor Day. Today's reports add a new pre-launch risk: **average photo reuse is 2.7×**, which will get screenshot-dunked if Redditors scroll 20+ cards. Decision below.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Pivot happened May 2026. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **`20260702a` — bumped by DevOps this run.** Auto-bumps on next app.jsx edit. Stop. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13. Sandbox 403s = egress block, not VPS outage. Stop.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1. Final.** |
| "Duplicate commit pattern" | **Known-skipped June 25 (second strike).** Stop. |
| "197 empty-tag venues" | **FALSE.** All 370 have tags. Stop. |
| "40 ski venues had 1 tag" | **FIXED June 26.** Stop. |
| "Plausible data-domain scoped wrong" | **Known. Deferred July 7.** Stop. |
| "lateSeason: 6 venues" | **25 venues.** Stop. |
| "venue count 372 by bracket-walker" | **370 is correct.** 2 airport-comment lines miscounted as venues. Stop. |
| "Venue freeze expires July 3" | **WRONG — see Decision 2 below. Freeze runs through July 7.** Stop. |

---

## Shipped Since v75 (2026-07-01 → 2026-07-02)

| What | Verdict |
|------|---------|
| **DevOps July 2** (`54b6cb3`) — YELLOW. Cache bumped 20260629a→20260702a (3 days stale → current), three-file lockstep confirmed. VPS unverifiable from sandbox. 370 venues, 5,565/5,565 braces, GEAR_ITEMS 0. | ✅ Correct housekeeping. Cache is now current. |
| **Content July 2** (`43c2edb`) — Score 74/100 (↓22 from July 1). **27 surf-legacy tags on beach venues** (new finding). 5 placeholder-tag ski venues carry from July 1. 3 duplicate venue pairs. 5 new venues staged but BLOCKED by freeze. Photo avg 2.7× reuse. | ⚠️ Score drop is real but all findings are detail-sheet-only or post-freeze items. See triage. |

**Zero app.jsx logic changes.** Venue freeze holding. No regressions.

**Code state July 2:**
- `app.jsx`: 13,443 lines · cache `20260702a` · braces 5,565/5,565
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- 138 unique photos · max repeat 3× · avg 2.7× reuse · 0 empty-tag venues · skiPass 131/131
- Sentry DSN: active · Plausible: wired · Supabase lazy-load: confirmed

---

## Bug Triage — July 2

| Bug | Severity | Status |
|-----|----------|--------|
| **Reddit post: Day 28** | **P0 (business)** | Post before 3 PM Pacific today or the July 4 hook is dead. See Decision 1. |
| **Photo reuse 2.7× average** | **P1 (first impression)** | 104 of 138 unique photos appear on 3 different venues. A user scrolling 20+ beach cards will see repeats. Screenshot-dunking risk on Reddit. See Decision 3. |
| **VPS health check — hard gate** | **P0 pre-post** | 16 simultaneous cold-load users exhaust Open-Meteo's free tier if the proxy is down. Jack: `curl https://peakly-api.duckdns.org/health` before hitting publish. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | `server/sql/delete-account.sql` → Supabase SQL editor. Graceful fallback active on web. |
| 27 surf-legacy tags on beach venues | P2 | Detail-sheet only. Not visible on grid cards. DEFER to July 7. Kiteboarding/kitesurfing/windsurfing tags on retired surf venues. |
| 5 placeholder-tag ski venues | P2 | Detail-sheet only. DEFER to July 7. Fix-ready code in content report. |
| 3 logical venue duplicates | P2 | Not user-visible duplicates (different IDs). DEFER to July 7. |
| SRI on CDN scripts (Open #10) | P3 | DEFER post-LLC. 30 min fix, no user impact. |
| 14 orphaned `claude/` branches | P4 | Not blocking. |

**Permanently closed:** Peakly Pro price · Sentry DSN · VPS "Day X blocker" · DEAL_WEIGHT · GEAR_ITEMS · EWR AP_CONTINENT · duplicate-commit pattern

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **28** |
| **VPS health confirm (P0 gate)** | Prevents weather outage during Reddit spike | 30 sec | 18 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 22 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | 2h + review | Post-Reddit |

---

## Explicit Product Decisions — July 2

### Decision 1: Post to Reddit today before 3 PM Pacific. The July 4 hook expires tonight.

v75 called July 1 the last viable day. It wasn't posted. Here's the honest math for July 2:

- **Before 3 PM Pacific today:** July 4 weekend is ~24-48 hours out. US Redditors who see the post at lunch can still act. Open-Meteo forecasts July 3–6 at day 1–4 out — maximum confidence. Beach scores across the Caribbean, Mediterranean, and SE Asia are running at peak. NZ/Andes ski is at mid-season peak. This is as good as it gets.
- **Tonight or tomorrow July 3:** Most US users have made their July 4 plans. The "spontaneous weekend" framing falls flat when you're posting 12 hours before the holiday starts.
- **July 8+:** The July 4 hook is gone. The next US hook is Labor Day (September 1). Posting during the summer without a holiday peg is harder — the "this weekend" angle is always live but the urgency cue is weaker.

**SHIP: Reddit post, today, r/solotravel and r/frugaltravel simultaneously.** r/travel 48h later if the first two have traction. Post copy from v75 stands — update the "July 4 is 3 days out" to "July 4 is tomorrow."

Jack's own comment after posting (worth 3x more than the post copy for conversion): name your home airport, two specific venues that are scoring well this weekend, and what the score was. Real data beats marketing copy every time.

---

### Decision 2: Venue freeze extends through July 7. The content agent's "freeze expires July 3" is overridden.

The content report says "VENUE FREEZE active through July 3" — that's based on PM v68 (June 24). Multiple PM reports since have extended the freeze to "72h post-Reddit." Since the Reddit post hasn't happened, the freeze continues.

**DEFER: All 5 staged venues, surf-legacy tag fixes, placeholder-tag fixes, duplicate removal. July 7 sprint.**

The content score dropping to 74/100 is real but the 22-point drop comes from findings that are all detail-sheet-only or post-freeze items. The grid — what first-time Redditors see — is 100% structurally clean: 370 venues, unique IDs, all tags present, braces balanced, cache current.

---

### Decision 3: Ship with 2.7× photo reuse. It's a real risk, not a launch gate.

Today's content report named photo reuse as "will get screenshot-dunked on Reddit." That's honest and worth taking seriously. The math: 370 venues, 138 unique photos, 104 photos at 3× reuse. A user scrolling 30 beach cards will see the same background photo 2-3 times.

**Why this is not a launch gate:**
- The Reddit post drives users to the app with a specific "find my weekend" intent — they search by their airport and filter, they don't scroll the full catalog.
- Max repeat is 3× (photo appears on at most 3 different venues). Not 20×.
- The photo fix requires ~50 new verified on-theme photos. `source.unsplash.com` is dead; sourcing 50 photos manually takes hours we don't have before 3 PM.

**What to do about it:**
- If someone screenshot-dunks the photo reuse on Reddit, respond in the thread: "Fair point — working on sourcing 50 more unique venue photos, ETA July 7."
- First post-launch sprint (July 7): source 50 new photos, run `scripts/photo-dedup.cjs` to target ≤2× across all venues.

**DEFER photo fix to July 7. SHIP with 2.7× today.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Post to Reddit before 3 PM Pacific today. This is the only priority.**

28 days of "launch-ready" with 0 users. The July 4 hook expires tonight. No Plausible data exists to make any product decision. Everything — the photo fix, the surf-tag cleanup, the duplicate removal, the email retention strategy — is downstream of having users to calibrate against.

**2. Jack: VPS health confirm before hitting publish.**

`curl https://peakly-api.duckdns.org/health` — 30 seconds. If `wx_cache_size > 0`, the proxy is live. If it's down, `ssh ubuntu@198.199.80.21 "pm2 restart peakly-proxy"` before the spike arrives. This is P0 — 16 simultaneous cold-load users exhaust Open-Meteo's free tier without the proxy cache.

**3. Jack: July 7 sprint planning — photo fix first, everything else second.**

After Reddit: read Plausible at 6h, 24h, 72h. On July 7, the first sprint is:
1. Source 50 new unique beach/ski photos (target ≤2× reuse)
2. Run `scripts/photo-dedup.cjs` to redistribute
3. Fix 5 placeholder-tag ski venues (code in content report)
4. Remove surf-legacy category tags from 27 venues (code in content report)
5. Remove `bigsky` and `beach_miami` duplicates
6. Paste 5 staged new venues (if Plausible confirms demand in those regions)

Do not start any of this before July 7. The 72h post-Reddit signal is more valuable than the cleanup.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| 5 new staged venues (content agent) | Venue freeze runs through July 7. Adding venues before Reddit launch adds pre-launch regression risk. DEFER. |
| Surf-legacy tag cleanup (27 venues) | Detail-sheet only, invisible on grid. Not a launch gate. DEFER to July 7. |
| Placeholder-tag fix (5 ski venues) | Same. DEFER to July 7. |
| New venue category | 0 users have validated demand. CUT until 1K MAU. |
| Venue deep links / permalink pages | Build after Plausible shows actual venue demand. DEFER to July 7+ with data. |
| Hotel integrations | No demand signal. CUT for v1. |
| Automated email digest | Build after knowing Supabase signup rate. Manual founder email in Week 2 if >50 signups. DEFER as code. |
| SRI on CDN scripts | Medium-risk, 30 min. No user impact. DEFER to July 7. |
| JSON-LD / static h1 fallback | SEO matters post-launch. 0 crawl signal yet. DEFER to July 14. |

---

## Success Criteria — What Has to Be True for 8K, Not 5K?

1. **Reddit converts at ≥3% CTR** — Jack's own comment with real venue data is the multiplier. 3% on r/frugaltravel (2.1M members) at 200 upvotes = ~6K visitors in 72h.
2. **Week-1 retention ≥25%** — one manual email from Jack to Supabase signups by July 10. No automation needed at this scale.
3. **VPS proxy survives the spike** — must confirm hot before posting.
4. **Photo screenshot-dunking stays quiet** — if it surfaces in comments, respond honestly and ship the fix same day.
5. **Beach-dominant summer narrative holds** — don't change the grid default.

---

## One Product Risk Nobody Is Talking About

**The photo reuse problem could go viral in the wrong direction before the venue quality story does.**

If a Redditor scrolls the beach grid and notices the same photo on Bondi Beach, Cancun, and Ko Samui, they'll post a screenshot. That screenshot will get more upvotes than Peakly's own post. "AI startup uses 138 stock photos for 370 'unique' venues" is a better Reddit story than "this tool combines weather and flights." The fix (50 new photos) takes a day. The damage from a dunking post takes a week to fade.

The mitigation is speed: if it happens, respond immediately in the thread, ship the fix the same day, and post a follow-up comment. Acknowledging the limitation honestly before someone points it out ("we're at 370 venues but only 138 unique photos — sourcing more now") disarms the dunking. But this has to be reactive, not proactive — don't flag the limitation in the launch post itself.

**If photo reuse is screenshot-dunked in the thread: respond in 30 minutes, ship the photo dedup fix same day, post an update comment with "fixed."**

---

*Report written by PM agent — 2026-07-02 (v76). This is the 28th consecutive "launch-ready" report with 0 users. v77 will either be a launch metrics report or an explanation of why the July 4 window was missed entirely.*
