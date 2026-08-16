# PM Report v121 — 2026-08-16

> Supersedes v120 (Aug 15). **Status: YELLOW.** Day 46. Reddit deadline Aug 22 — **6 days out**. Cache stamp: `20260816b`. Venues: **394** (131 ski / 263 beach). BASE_PRICES: **~133/162 unique APs (~82%)** — 75% target blown past. Photo gap: ~213 duplicate / generic photos across 394 venues (UNSPLASH_KEY still not received — T-6 days warning issued).

---

## Shipped Since v120

| Commit | What | Assessment |
|--------|------|------------|
| `30d448a` | DevOps 08-16: BASE_PRICES +17 APs (KBV/JNX/HUX/TPS/MLO/MBA/AIT/OSL/YKA/ZCO/RHO/MCT/TGD/SNA/TFS/CHQ/EWR), cache stamp 20260816a | ✅ **Best single-day BASE_PRICES execution to date.** Prioritized multi-venue APs first (KBV×3, JNX×3, HUX×3, TPS×3) — correct triage. Coverage 75%→85% against the pre-Content denominator of 157. |
| `323f232` | Content 08-16: +5 latam beach venues (latam was at 4 venues, now 9), full infrastructure (AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES), cache stamp 20260816b | ⚠️ **Bent the v120 moratorium, but the result is defensible.** 4 venues covering all of Latin America was an embarrassing gap. These 5 came with full deal badge coverage from day 1, satisfying the spirit of the moratorium exception. Venue moratorium is now **re-affirmed hard** — 394 is the final pre-Reddit count. |

**Permanent corrections — stop re-raising these:**
- **Open #23 (disk cache):** ✅ CLOSED. VPS 2026-08-11. Add to known-skipped.
- **Peakly Pro:** CUT. Zero instances in codebase. Not a bug.
- **Sentry DSN:** LIVE.
- **"182 venues / 12 categories":** 394 venues, 2 categories.
- **VPS down:** VPS CLOSED 2026-08-11 (Jack SSH). Sandbox 403 ≠ VPS outage.
- **BASE_PRICES discrepancy (DevOps 85% vs Content 82%):** DevOps ran before Content added 5 venues with 5 new APs, raising the denominator from 157→162. Both counts are correct for their moment in time. Content's final figure (133/162 = 82%) is authoritative.

---

## Bug Triage — Aug 16

| Bug | Severity | Status |
|-----|----------|--------|
| **Photos: ~213 duplicates / generic stock across 394 venues** | P0 (Reddit gate) | **T-6 days. UNSPLASH_KEY still not received.** Pipeline code-complete; runtime is ~2 hours. Miss Aug 18 EOD → Reddit post slips to Aug 29. Not negotiable. |
| **BASE_PRICES: 29 APs still uncovered (18%)** | P2 | All 29 are single-venue destinations (Key West, Bocas del Toro, Kraków, etc.). Continent-fallback `~$X` pricing active. Deal badge absent but `~$X` shows. Acceptable pre-launch — 82% coverage means the hero feature works for >4 in 5 venues. |
| **Supabase delete-account SQL** | P0 (App Store only) | Jack-only, 2-min paste. Web Reddit launch unaffected. |
| **16 stale claude/* branches on origin** | P3 | Messy but not blocking. Cleanup post-Reddit. |

---

## Three Product Decisions — Aug 16

### Decision 1: BASE_PRICES sprint is OVER — declare victory at 82%

We set a 75% target in v119. We hit 70% in v120, 82% today. The remaining 29 uncovered APs are all single-venue destinations with limited direct US routing. Marginal ROI on the next few APs is low, and the hours are better spent on photo pipeline prep.

**DECISION: No further BASE_PRICES work until post-Reddit launch.** DevOps should NOT chase the remaining 29 APs as a top priority. If a Content run happens to include a paste-ready batch for a multi-venue AP, accept it. Otherwise, stop. The deal-score feature is functional at 82% — that's a win, not a gap.

---

### Decision 2: 394 venues is the pre-Reddit catalog — moratorium re-affirmed HARD

Content bent the moratorium today (latam gap justified the exception). The result is 394 venues, which is an excellent catalog for a spontaneous weekend app. Adding more without photo fixes is adding broken windows.

**DECISION: ZERO new venue additions until after Reddit launch.** No exceptions. Content can pipeline candidates for post-launch. The v120 moratorium exception (BASE_PRICES + verified photo) is also suspended — even good-data venues don't ship until photos are fixed or the Reddit post is live. 394 is the number.

---

### Decision 3: Photo gate is a countdown — Aug 18 EOD is the hard slip date

Six days to Reddit. The photo pipeline is code-complete. UNSPLASH_KEY is the only input missing. Time to run once key arrives: ~2 hours.

**DECISION: If UNSPLASH_KEY is not received by EOD Monday Aug 18, the Reddit launch date officially moves to Aug 29.** This is not a warning — it is the decision. The 8K user path requires a first impression that converts. Launching to r/skiing with 213 duplicate generic photos is a one-shot chance to get laughed off a 100K-member subreddit. We don't get a second first impression.

Jack: create a free Unsplash developer account at unsplash.com/developers (5 minutes, no LLC required, demo access tier works), share the `Access Key`. That's it. No other action needed from you.

---

## This Week's Top 3 Priorities

1. **Jack: UNSPLASH_KEY by EOD Aug 18** — Reddit launch gate. Countdown is live. Slip to Aug 29 is automatic otherwise.
2. **Dry-run the launch-day grid** — Before the Reddit post, someone (Jack or an agent) should load the live app on Aug 21, screenshot the Explore grid's top 10 cards, and verify they show compelling scores with real data. The smoke test doesn't cover this. If the top 10 are all "Score: 50" on a bad data day, delay 24h rather than post.
3. **Jack: Supabase delete-account SQL paste** — 2-min task, required before any iOS App Store submission. Not blocking web launch but clears the App Store path.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **More venue additions (any)** | Moratorium. 394 is the number. |
| **Remaining 29 BASE_PRICES APs** | Diminishing returns. 82% coverage is good enough. Move on. |
| **SRI on CDN scripts** | Medium risk to Babel eval. Post-launch hardening. |
| **JSON-LD / h1 static SEO** | Zero conversion impact at <100 MAU. Post-Reddit cleanup. |
| **iOS App Store submission** | Jack + Xcode dependency. Post-Reddit. |
| **Venue deep links** | Committed: build AFTER Reddit launch. Decision stands. |
| **Stale branch cleanup (16 claude/* branches)** | P3. Post-Reddit housekeeping. |

---

## Success Criteria

**90-day target: 5K–8K users.** Reddit launch Aug 22 (hard slip to Aug 29 if no UNSPLASH_KEY by Aug 18 EOD).

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Reddit post quality | 1 post, r/skiing or r/travel | **3 posts same week** (r/skiing + r/travel + r/frugaltravel) |
| Photo quality at launch | 213+ duplicates (current) | **Top 50 marquee venues with real photos** (UNSPLASH_KEY gate) |
| BASE_PRICES coverage | 82% (today) | **82% — sprint closed, 8K path doesn't require more** |
| Venue catalog | 394 (moratorium) | **394 — quality over quantity, moratorium holds** |
| Launch-day grid dry-run | Skipped | **Done Aug 21 — verify top 10 show compelling scores** |

---

## One Product Risk Nobody Is Talking About

The Aug 22 Reddit launch assumes a single post. The 8K path requires 3 subreddit posts in the same week (r/skiing, r/travel, r/frugaltravel). Posting the same link on the same day to multiple subreddits is a near-certain spam flag — Reddit's algorithm detects it and shadow-removes one or more posts silently, with no notification. The 3-post strategy needs to be staggered (Day 1 / Day 3 / Day 5), uses different angles for each community (skiing-centric vs travel deal vs budget travel), and the account posting needs some history. If Jack is posting from a fresh account, it's worth spending 2 days commenting in these subreddits before the post. One silently shadow-banned post is invisible to us and kills the 8K path without any warning signal.
