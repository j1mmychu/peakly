# Peakly PM Report — 2026-06-13 (v49)

> Supersedes v48 (June 4). **9-day gap since last report.** Status: **ORANGE — Reddit launch window has passed with no confirmed outcome. App Store submission path is clear but unstarted. Revenue model is honest at $7.58/1K MAU.**

---

## Stale Bug Claims — Closed at Entry

The prompt flags three "bugs." All are stale:

| "Bug" | Status |
|-------|--------|
| Peakly Pro $9/mo vs $79/yr | **NOT A BUG.** Pro UI removed April 16. No price appears anywhere in the live product. Closed in v32 (2026-05-13). |
| Sentry DSN empty | **NOT A BUG.** DSN confirmed non-empty at `app.jsx:8` since 2026-05-13. Devops report June 4 verified: `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304...` ✅ |
| Cache buster stale | **NOT A BUG.** Auto-bumping is structural since June 8 (`scripts/auto-push.sh`). Buster resets to `${TODAY}a` on any new day and increments `a→z→aa` per-push. Class is architecturally dead. |

Stop re-triaging these. They don't exist.

---

## Shipped Since v48 (2026-06-04 → 2026-06-10)

This was the most productive week since the May 3 pivot. Per CLAUDE.md (authoritative):

| What Shipped | Right Call? |
|-------------|-------------|
| **+197 venues (156→353):** 14 S. hemisphere ski venues (NZ, AUS, Chile, Argentina) + 134-beach JSON batch | ✅ Summer N-hemisphere needs ski inventory. Beach depth matters. **Quality audit pending — see Risk section.** |
| **`<ScoringExplainer>` component** — one-time dismissible "how Peakly scores your weekend" card in Explore | ✅ Closes the trust gap for new users. Right moment to ship it. |
| **App Store readiness — account deletion** (`delete_user()` SQL + Profile UI, two-step `DELETE` confirm) | ✅ Mandatory for Guideline 5.1.1(v). Jack still needs to paste `server/sql/delete-account.sql` into Supabase. |
| **Cold-start reviewer-proof** — `weatherDown` banner, venues survive total weather failure, no blank grid | ✅ Correct. Apple reviewers test in hardened environments. This was the right P0 to fix. |
| **iOS alert copy honesty** (`ALERTS_AVAILABLE` gate on push-promise copy) | ✅ Prevents Guideline 2.3.3 rejection. |
| **VPS verified LIVE** — `/health` returns `wx_cache_size` populated, poll worker running | ✅ **Day 35+ resolved. The "VPS binary blocker" framing is permanently retired.** |
| **GEAR_ITEMS definitively cut (Open #16 resolved)** — DevOps daily run briefly re-restored it; reverted same day; `tasks/agents/devops.md` updated with standing do-not-touch directive | ✅ Right call. Revenue model stays $7.58/1K MAU honest. The restore/revert churn was a process failure, not a product one. |
| **Auto-push guard: eval counter** — venue-count check now eval-based (counts all 353), not grep-based (was blind to JSON-format batch entries, saw only 156) | ✅ Closes the invariant gap. |
| **Explore UX polish** — category pills enlarged, saved-venues strip removed from toolbar → relocated to Profile tab, grid ranked by `weekendScore` | ✅ Correct product call. Pills are the primary navigation; enlarging them was overdue. |
| **Save/account copy reframed** — "just your email, no password" voice instead of cloud-sync language | ✅ Email-first is the right product framing for a PWA pre-App-Store. |
| **+2 US airports** (IAH, PHL) now in `US_AIRPORTS` 4×4 grid | ✅ Minor, right. |
| **Cache stamp now `20260610s`** across app.jsx / sw.js / index.html | ✅ Structural auto-bump working as designed. |

**Net assessment:** The June 5–10 sprint was largely the right work — App Store compliance, VPS closure, content expansion. One concern: the 197-venue batch landed during/immediately before the planned Reddit launch window (see Risk section).

---

## The June 7 Reddit Launch — Unconfirmed

The v48 report set June 7 (Sunday) as the Reddit launch date with three substeps: r/solotravel first, then r/frugaltravel, then r/skiing. Today is June 13. **No launch outcome appears in CLAUDE.md, CHANGELOG.md, or any report.**

This is the most important open question in the product right now.

Three possibilities:
1. **Launch happened, no report filed** — outcome (karma count, traffic spike, Plausible events) is unknown to the agent team and to this report.
2. **Launch delayed** — a June 7 check of the app revealed the day-8 grid issue (predicted in v48), confidence scoring filtered out too many venues, and Jack deferred.
3. **Launch hasn't happened** — no action taken.

**If #1:** Jack needs to share Plausible data and any Sentry spikes. Revenue baseline is $7.58/1K MAU — at 100 initial users that's $0.76/mo. Absolute numbers are irrelevant right now; what matters is Day-1 retention (do people come back Saturday?).

**If #2 or #3:** We are now 6 days past a planned launch with no explanation. That's a decision-avoidance signal. The product is launch-ready. The window isn't closing (summer beach content is peak-relevant through August) but momentum is.

**Decision 1 (PM v49): Jack, reply with one of three answers before June 14:**
- A) "It launched on June 7 — here's what happened."
- B) "Delayed to [specific date]."
- C) "Not launching on Reddit — here's why and what the new plan is."

"We'll see" is not an answer.

---

## Bug Triage — June 13

| Bug | Severity | Days Open | Status |
|-----|----------|-----------|--------|
| Account deletion SQL not yet pasted into Supabase | **P1** | Day 3 | **Jack action.** Client ships graceful fallback but App Store review will test deletion. Must be active before submission. |
| SRI on CDN scripts | P2 | Day 40+ | DEFER post-launch. Requires hash generation + browser regression test for Babel unsafe-eval. |
| CSP meta tag | P2 | Day 40+ | DEFER post-launch. Same constraint as SRI. |
| Eager Supabase `<script>` (80KB on anon load) | P2 | Day 38 | Diff exists (`reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff`). **SHIP this week — 30-second apply. No excuse.** |
| Unsplash `&auto=format&q=75` missing on 353 photo URLs | P2 | Day 39 | Sed block in devops-2026-05-06.md. **SHIP this week — single command, ~7MB mobile savings.** |
| 197 new venues — no human quality audit documented | **P1** | Day 4 | See Risk section. |
| APNS not configured | P3 | Day 31+ | Parked. `isNativePlatform()` gate live. iOS v1 ships without push. |
| skiPass field missing on ~16-25 ski venues | P3 | Day 42 | DEFER. Filter works correctly (missing = excluded from pass-specific results). |

---

## Known Blockers — June 13

| Blocker | What It Unlocks | Who | ETA |
|---------|----------------|-----|-----|
| **Jack: answer the launch question** | Trajectory for next 90 days | Jack | June 14 |
| **Jack: paste `server/sql/delete-account.sql` into Supabase** | App Store 5.1.1(v) compliance | Jack | Before App Store submission |
| **Apple Developer enrollment ($99/yr)** | App Store submission | Jack | Jack's call |
| LLC approval | REI (+$6.16/1K MAU), Backcountry (+$0.64), GetYourGuide (+$1.20) | External | Unknown |
| APNS .p8 key + pm2 env vars | iOS push alerts | Jack | Post-launch |

---

## Explicit Product Decisions — June 13

**Decision 1: Reddit launch answer required by June 14.** (See above. Not repeating it.)

---

**Decision 2: Eager Supabase script — SHIP this week. Final.**

This finding has been in known-skipped since May 9. It was re-flagged for post-launch and it's now post-launch (or post-planned-launch). The diff is already written. 30 seconds to apply. Shipping 80KB to every anonymous user on first paint is indefensible at any traffic level. The "re-flag if bounce rate > 65%" condition is backwards — we should fix it before we have enough users to measure bounce.

**Action (Claude Code):** `cd ~/peakly && git apply reports/ready-to-ship/eager-supabase-delete-2026-05-08.diff && git add index.html && git commit -m "Remove eager Supabase script; lazy-load path handles it"`

---

**Decision 3: App Store submission date — set a target or formally defer to 2026-Q3.**

App Store readiness work is substantially done:
- ✅ Account deletion (client + SQL pending)
- ✅ Cold-start reviewer-proof
- ✅ iOS alert copy honest
- ✅ APNS gate live (iOS ships without push)
- ✅ Info.plist location string
- ✅ Privacy Manifest

What's left:
- Apple Developer enrollment ($99)
- Xcode build + `npx cap add ios`
- Account deletion SQL deployed (Supabase)
- App Store screenshots (requires a device or simulator)

This is **3–5 days of focused Jack time** if enrollment is approved quickly. Apple review typically takes 24–48h. A submission before June 30 is realistic if enrollment starts now.

**Decision:** SHIP to App Store by June 30 OR formally defer to Q3 (July 15 earliest, post-LLC). Pick one. "When it's ready" is not a date.

---

## This Week's Top 3 Priorities Only

**1. Jack: answer the launch question (June 14 deadline).** One sentence. Everything else gates on this.

**2. Apply the two deferred one-liners** (Supabase script + Unsplash photo optimization). Both have diffs written. Both take under 2 minutes combined. Shipping them this week closes two P2s that have been open 38+ days.

**3. Quality audit on the 197 new venues before next promotion.** Content agent should spot-check 20 random venues from the June 5-9 batch (tags, photos, airport codes, scoring behavior). File findings in `reports/inputs/content-2026-06-13.md`. If any venue scores ≥85 on a hemisphere/season mismatch, that's a P1 before the next Reddit or HN post.

**Zero new features this week.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Venue deep links / individual pages | **DEFER post-launch** | No change to previous decision. SEO benefit takes weeks. Build after 1K users. |
| Hotels in deal score | **CUT. Final.** | v2 if demand validates. Not revisiting before 10K users. |
| Wishlists / Trips tab | **LOCKED at 1K MAU gate** | No change. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU. The $9/mo/$79/yr question is moot — there's no Pro UI. |
| Additional S. hemisphere venues | **DEFER** | 353 is enough for launch. Audit the existing batch before adding more. |
| GetYourGuide / REI / Backcountry affiliate wiring | **DEFER** | LLC blocks approval. No action possible until LLC clears. |
| Group coordination | **DEFER to v2** | Post-launch roadmap. |
| Crowd intelligence | **DEFER to v2** | Same. |

---

## 90-Day Projection — Updated June 13

| Scenario | Users (90d from June 13) | What Has to Be True |
|----------|--------------------------|---------------------|
| Reddit launch this week (June 14-16) + post reaches top 10 | **5K–8K** | Post gets upvoted in r/solotravel. VPS holds the spike. Day-1 retention > 20%. |
| Reddit launch happened June 7, no traction yet | **1K–3K** | Organic SEO + word of mouth only. Growth is slow. |
| Reddit + App Store submission before June 30 | **8K–12K** | Two acquisition channels live simultaneously. The combo is the moat. |
| No launch action through June | **<500** | Organic only. The 100K goal slips into 2027. |

**For 8K not 5K:** The delta is the App Store channel. Reddit gets you awareness in a community that already tracks snow/beach conditions. App Store gets you distribution among people who search "best ski weekend" on their phone. Both channels target the same user. Running them concurrently — even one month apart — compounds growth faster than sequential.

---

## Revenue Model — June 13

| Stream | Code Status | RPM/1K MAU |
|--------|-------------|------------|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live | $0.14 |
| Amazon Associates (`peakly-20`) | ❌ CUT for v1 (Jack, June 9). GEAR_ITEMS = 0. | $0 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $7.58/1K MAU.** LLC approval doubles it to ~$15.67. At 8K MAU (90-day optimistic): ~$60/mo → ~$125/mo post-LLC. Revenue doesn't matter until 10K MAU. The goal right now is users.

---

## One Product Risk Nobody Is Talking About

**The 197 new venues haven't been seen by a human.**

`validate-venues.mjs` checks field completeness (required keys, coordinate bounds, AP_CONTINENT coverage). It does not check:
- Whether the Unsplash photo actually shows the venue (wrong photo, wrong vibe)
- Whether the tags match what a user would search for
- Whether the airport code produces real flight results from common origins
- Whether the venue scores correctly in the Fri–Mon window during June (the exact moment new users will see it)

The 134-beach batch was pasted as pretty-printed JSON, accepted 134/134 by the validator, and shipped. That's excellent throughput but zero human review on any individual entry. At 353 venues, a 5% error rate = 17 venues that confuse or mislead new users. One bad first impression on a venue that prominently surfaces in the carousel ("Why is this rated 4.92 with a photo of a parking lot?") can tank the Reddit thread before it gains traction.

**The fix is 2 hours:** spot-check 20 random venues from the new batch in the live app. Open each detail sheet. Confirm the photo, the score makes sense for this weekend, the Book CTA goes somewhere real. File anything wrong. This is the highest-ROI task a human can do right now that an agent cannot.

Jack or a trusted friend should do this before the next promotional post goes live.
