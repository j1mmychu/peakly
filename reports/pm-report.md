# Peakly PM Report v123 — 2026-08-18

**Status: YELLOW → GREEN path visible. Launch gate is Jack's photo review hour, not the Unsplash key.**

---

## Shipped Since Last Report (since Aug 17 PM)

| Commit | What | Right call? |
|--------|------|-------------|
| `6e45fee` | **P0 fix: exact-fares grid filter was hiding 95% of venues** | YES — critical. See below. |
| `2b108b0` | Photos: 22 venues updated via Wikimedia Commons | YES — right tool, no API key needed |
| `73415a5` | Photos: 34 more venues + 39 wrong candidates flagged | YES |
| `0dcb301` | Photos: 56 more venues (Wikimedia) | YES |
| `dbeffa2` | DevOps report + cache stamp bump 20260818a | YES |
| `5ac9657` | Content report | YES |

**Photo sprint progress: 112 venues updated today. Estimated real-photo coverage: ~247/394 (63%). 83 duplicate groups remain.**

---

## The Silent P0 That Was Live on Production

`6e45fee` fixed a bug that was hiding ~95% of the venue catalog from any user who loaded the app after Travelpayouts finished loading prices.

**What happened:** The `applyFilters()` function promised graceful degradation — "show full list with estimates when Travelpayouts returns nothing." But its condition was `if (liveOnly.length > 0)`, meaning the instant even ONE venue got a live fare, the grid demoted to live-only mode. Travelpayouts returns live fares for ~20 of 394 venues (partial route coverage, not an outage). Result: every user who waited for flight prices to load saw 20 venues instead of 394.

**Severity:** P0, live on production. Any user session during daytime hours — when the Travelpayouts batch load completes — saw a 20-card grid. This is the explore page. The core product. Hidden.

**Fix:** Requires live fares to cover ≥40% of the on-screen set before committing to exact-fares-only mode. Correct call, conservative threshold (40% means Travelpayouts must be genuinely healthy for a category before we hide estimates).

**Product question nobody asked:** How long was this live? The `applyFilters` logic with the `> 0` threshold appears to have been there since the exact-fares feature shipped. Every session during price-load was affected. We don't know from Plausible alone — but bounce rates from load → no action could reflect this. Worth checking Plausible for any "all experiences" → zero-card sessions in the last 2 weeks.

---

## Blocked

| Blocker | Owner | Unblocks |
|---------|-------|---------|
| Unsplash API key + production access | Jack | ~150 remaining venues that Wikimedia Commons can't cover well (indoor spa, specific branded resorts, etc.) |
| Cloudflare CDN setup | Jack | Reddit spike protection. 30-minute browser task. |
| VPS photo cache pre-warm | Jack (SSH, day before Reddit post) | "conditions unavailable" at traffic spike |

**Revised assessment on Unsplash:** The Wikimedia pipeline is covering real ground without it. Today's 112-venue run proves the pipeline works and Wikimedia images are available for most outdoor/geographic venues. The remaining ~150 without real photos skew toward venues where Wikimedia has thin coverage (Caribbean resorts, branded ski areas). The Unsplash key is still needed to hit 90%+ quality — but it's no longer blocking 394 venues, it's blocking the last ~150.

---

## Three Product Decisions — Aug 18

### Decision 1: Aug 22 Reddit launch is alive. Aug 29 remains the safety date.

Yesterday's report killed Aug 22 due to the Wikimedia-only pipeline covering only 135/394 venues. Today's 112 additional updates change the math:

**New state:**
- ~247/394 venues have real photos (63%) — after today's 3 commits
- Wikimedia pipeline can run again tomorrow at 0 cost, covering more of the ~150 remaining
- At today's rate (112/day), by Aug 21 we could reach 370+ venues with real photos
- The Unsplash key accelerates the tail; it doesn't block progress anymore

**Revised decision:** Wikimedia can carry the photo sprint to ~90% by Aug 20–21. If the pipeline runs again tomorrow (Aug 19) and gets another 80–100 venues, we'll be at ~330/394 (~84%). That's a viable launch state — not perfect, but credible.

**DECISION: Aug 22 Reddit launch is back on the table. Contingency: if Wikimedia pipeline covers ≥330/394 venues by Aug 20 EOD, post Aug 22. If coverage stalls below 310, post Aug 29. This is now a content-pipeline decision, not a key-waiting decision. Daily photo commit progress is the signal.**

Jack: if you want to accelerate the tail (resorts with poor Wikimedia coverage), get the Unsplash key + production access. But the launch date no longer depends on it the way it did yesterday.

---

### Decision 2: Venue moratorium holds until after Reddit launch. No exceptions.

Five new venue objects appeared in the Content report (ZTH/GGT/CFU/BDA/AYT) and in the content report tail I can see full venue objects ready to paste. They look good. AYT (Antalya) and CFU (Corfu) are high-quality Mediterranean beach venues.

**But: moratorium is moratorium.** Reasons it holds:
- 394 is the established QA baseline. DevOps smoke tests, integrity guards, brace-balance checks all ran against 394.
- Adding venues 4 days before Reddit launch introduces a new failure mode (bad coordinates, broken photo URL, off-season score anomaly).
- The photo sprint is optimizing for 394 venues. Adding 5 more means 5 more generic photos on day one.
- The risk-reward is wrong: 5 more venues at launch = ~0.01% catalog improvement, but adds one more thing to break.

**DECISION: Venue moratorium holds. ZTH/GGT/CFU/BDA/AYT staged for first post-Reddit batch. Earliest add: Aug 30.**

---

### Decision 3: Plausible funnel audit before Reddit post

The exact-fares P0 fix raises a question: are there other silent UX failures we're not measuring? We have Plausible events for `book_click`, `cloud_sync`, `install_pwa`, `scoring_explainer`. We don't have events for:
- Zero-venue empty state shown (filter collapse)
- Carousel not rendered (carouselReady=false at session end)
- Detail sheet opened (are users actually clicking into venues?)
- Flight-link clicked (did they actually go to Aviasales?)

Without these, we're launching into Reddit and reading bounce rate as a proxy for "did it work." That's too blunt.

**DECISION: DEFER detailed Plausible event additions until post-Reddit (they require app.jsx edits, which touches the smoke-test pipeline days before launch). BUT: Jack should manually check Plausible right now for the last 14 days — specifically session length and bounce rate. If avg session < 30 seconds and bounce > 70%, the exact-fares P0 was likely a major driver. Knowing this before the Reddit post helps calibrate "how good is 'baseline good'."**

---

## This Week's Top 3 Priorities

**1. Photo sprint: keep the Wikimedia pipeline running daily through Aug 20.**
Target: ≥330/394 venues with real photos. Today's 3-commit run proved the pipeline outputs clean results. Run again Aug 19. DevOps or Content agent can automate this — it requires no API key and produces high-confidence results (Wikimedia Commons attribution + known-good images). This is now the critical path to Aug 22 launch.

**2. Jack: Cloudflare CDN before Reddit post.**
30-minute browser task, $0. Unchanged from yesterday. The exact-fares P0 meant users were seeing 20 venues — a Reddit-scale spike on 20 venues is better than on 394, so the risk was actually lower. But now that 394 venues render, a traffic spike needs CDN protection. This needs to be done Aug 19–20 at the latest.

**3. Jack: manual Plausible check + VPS health verification.**
Before the Reddit post: (a) log into Plausible, check bounce rate and session length for the last 14 days, (b) SSH to VPS and verify `/health` shows `wx_cache_size > 200` and `apns: configured` status. If cache is cold (< 50), trigger a manual warm by hitting the top 50 venue coordinates through the proxy endpoint. Docs: `curl -s https://peakly-api.duckdns.org/health`.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Venue additions (ZTH/GGT/CFU/BDA/AYT)** | Moratorium holds. Post-Reddit batch. |
| **Plausible custom events (detail-sheet, flight-link)** | App.jsx edits too close to launch. Post-Reddit. |
| **SRI / CSP hardening** | Post-launch. Medium risk to apply, zero launch impact. |
| **JSON-LD / static h1 SEO** | Zero conversion impact at <100 MAU. |
| **iOS App Store submission** | Requires Jack + Mac + Xcode. Post-Reddit. |
| **APNS / push alerts** | Uncommitted fix for HTTP/2 + JWT P1363 issues. Do not touch pre-launch. |
| **Unsplash photo pipeline for remaining ~150** | Wikimedia is covering ground without it. Not the launch gate anymore. |

---

## Success Criteria

**Primary launch date: Aug 22 (if Wikimedia covers ≥330/394 by Aug 20 EOD). Backup: Aug 29.**

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Photo quality | 247/394 (63%) real — today | **330/394 (84%) by Aug 20 via Wikimedia pipeline** |
| Exact-fares filter | Was showing 20/394 (BROKEN) | **Fixed: 6e45fee live on origin — all 394 visible** |
| Cloudflare CDN | Not set up | **Jack browser task, Aug 19** |
| Plausible data | No session/funnel data | **Jack checks before Reddit post — bounce rate baseline** |
| Reddit post timing | Any time | **Weekday morning 9–11am ET, r/skiing + r/frugaltravel staggered 48h** |
| VPS pre-warmed | Default | **SSH verify wx_cache_size >200 same morning** |

---

## One Product Risk Nobody Is Talking About

**The 40% exact-fares threshold may be too high or too low, and we have no data to calibrate it.**

The fix in `6e45fee` chose 40% as the threshold for "Travelpayouts is healthy enough to go exact-fares-only." 40% means: if more than 4 in 10 venues in the current filtered view have live fares, hide the venues with estimates.

The problem: we don't know what the actual live coverage rate is per category, per home airport, per time of day. It's possible that for skiing from JFK in winter, Travelpayouts returns live fares for 60% of venues — which means the fix correctly shows exact-fares-only. But for beach from a smaller airport like BNA, coverage might be 15% — in which case the fix correctly shows estimates for everyone.

If coverage for common routes on common days is between 40–60%, the threshold will flip the grid in and out of exact-fares mode as prices load — some users see 394 venues, others see 200. That's not a bug, but it's an inconsistent experience we can't observe without Plausible events tracking it.

The fix is better than before. But the 40% number is a product decision masquerading as an implementation detail, and nobody picked it with data. Watch for post-Reddit user feedback about "the app shows different numbers of venues." If it surfaces, the threshold needs data, not intuition.

---

*Report generated 2026-08-18. One P0 fixed overnight (exact-fares grid, 95% of catalog hidden — now resolved). Photo sprint at 63% real coverage. Aug 22 launch back on the table pending Wikimedia pipeline progress. Cloudflare still outstanding (Jack, 30 min).*
