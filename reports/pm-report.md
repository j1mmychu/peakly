# Peakly PM Report v152 — 2026-09-16

**Status: 🟡 YELLOW — VPS proxy.js Day 37 undeployed (4 days to Sep 20 hard deadline). Zero code commits correct. Oct 11 Reddit gate intact but narrowing.**

---

## Shipped Since Last Report (v151 → v152)

| Commit | What | Right call? |
|--------|------|-------------|
| `b9a5435` | PM report v151 | ✅ Routine. |
| `8a050ea` | DevOps report 2026-09-16 | ✅ Routine. |
| `0d14e6f` | Content report 2026-09-16 | ✅ Routine. |

**Zero code commits since `bb3ebc8` (venue search, Sep 13).** Correct. The code freeze holds.

---

## Prompt Context Note

The scheduled prompt references "182 venues," "Sentry DSN empty," "cache buster stale," and "Peakly Pro $9/mo vs $79/yr." All four are stale:
- **Venues**: 404 (134 skiing / 270 beach), confirmed by DevOps and Content today.
- **Sentry DSN**: Wired in both `index.html:77` and `app.jsx:8` — DevOps confirmed.
- **Cache stamp**: `20260914a`, current — lockstep across app.jsx/sw.js/index.html.
- **Peakly Pro**: UI was CUT for v1 (documented in CLAUDE.md). No active pricing UI in the codebase. Not a bug — a product decision.

---

## Bug Triage

### P0s — None.

### P1 — VPS Redeploy (Day 37 — Jack-only, HARD DEADLINE SEP 20)

Unchanged from v151. Two proxy.js commits (`3152c96` Sep 9, `c760dfb` Sep 10) fix the fare-fallback logic. Without them: virtually zero LIVE fare badges on the live app. Users see `~$X` estimates everywhere. The flight pricing feature — the deal-score headline — is functionally broken.

**Sep 20 is the hard gate.** If not deployed by then, Reddit launch moves to Oct 18. Full stop.

```bash
# Jack: these two lines from your local machine
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health"
```

Verify: `health.uptime` resets to seconds; `/api/flights` returns a fare with `returnDate` within 7 days.

### P1 — Tag Density (Day 11 Unchanged)

223/404 venues (55%) have only 2 tags. Beach is acute: ~188/270 beach venues at 2 tags. This is the most visible "feels unfinished" signal in the product — appears on every Explore scroll.

The Oct 5–7 enrichment window stands. Content agent run on Oct 5 with explicit instructions to bulk-add tags to under-tagged beach venues.

### P2 — dist/ Build Collision (Day 8 — Non-Blocking)

GH Actions rebuilds `dist/` correctly on every push. Committed artifact is cosmetically wrong. Production unaffected. No action.

### P3 — CLAUDE.md Architecture Count (Day 5)

Line 66 still says `VENUES (395)`. Correct count is 404. Fixed inline with this report commit.

### P3 — 9 Valid Venue Proposals Sitting Unadded (Day 4)

Content agent has validated 9 new venues across Sep 13–15 (Grindelwald, Sestriere, Koh Lanta, Amed Bali, Noosa, Hakuba, Mayrhofen, Naxos Agios Prokopios, Ilha Grande) plus 1 invalid (Mancora/LIM — airport not in AIRPORT_COORDS). These are catalog enrichment, not features. Adding them doesn't violate the code freeze.

Decision below.

---

## Three Product Decisions — Sep 16

### Decision 1: VPS Sep 20 deadline — NO FURTHER EXTENSIONS

This is the fourth consecutive PM report repeating the same ask. v148 called it the only pre-Reddit gate. v150 set Sep 20 as the soft deadline. v151 made it hard. It's now Day 37.

**The decision stands: no Reddit post with broken flight pricing.** If the VPS isn't deployed by Sep 20 end-of-day, Oct 11 Reddit launch becomes Oct 18. There will be no v153 saying "we're extending again."

One action item. Five minutes. Jack's only blocker.

### Decision 2: Pending venue proposals — DEFER TO OCT 5 BATCH

9 valid venues are staged from content reports. Adding them piecemeal in individual commits between now and Oct 11 creates noise and risk. The Oct 5 tag-enrichment run is already planned — that's the right time to add these too. One focused content session: add 9 venues + enrich tags on 100+ beach venues.

**DEFER venue additions to Oct 5 content agent run. Do not add them individually before then.**

### Decision 3: claude/* remote branches — DELETE (standing from v151, still not done)

There are 12+ `claude/*` branches on origin right now, all rejected. Every agent session sees them. They were rejected for good reason. They are not getting merged.

**Jack: batch-delete on GitHub. The graveyard of abandoned worktrees is noise that costs every future agent session time.**

```bash
git fetch --prune
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
```

---

## This Week's Top 3

1. **VPS deploy by Sep 20** — Jack's one action. Everything else is noise until this lands.
2. **Do nothing else to the code** — freeze holds through Oct 11. Every temptation to ship one more thing between now and Reddit is wrong.
3. **Schedule Oct 5 content run** — tag enrichment + 9 pending venues. If this isn't calendared, it won't happen and we'll post to Reddit with a sparse catalog.

---

## Features REJECTED This Week

- **Any UI change before Oct 11** — the code freeze decision from v150 was correct and stands. Reddit's r/skiing and r/solotravel communities judge first impressions. Shipping features in the 3 weeks before a launch post is how bugs get introduced.
- **Adding venues individually before Oct 5** — small, repeated app.jsx commits create cache churn and integration risk for no meaningful catalog improvement. Batch on Oct 5.
- **claude/* branch resurrections** — every open claude/* branch was already evaluated and rejected. They don't get a second look pre-launch.

---

## Success Criteria

### What defines success?
- **Day 1 (Reddit post):** 500+ unique visitors, <30% bounce on Explore, 50+ wishlists saved.
- **Week 1:** 1,000 registered users (magic-link), 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K not 5K?

Three things have to be true simultaneously:
1. **Flight pricing works on launch day.** If the VPS isn't deployed, the deal score is fake and Reddit will notice. 8K assumes the product works.
2. **Photos feel premium, not generic.** Open #20 (346 venues with stock photos) is the #1 quality gap after VPS. Every photographer in r/skiing is going to screenshot the stock-photo powder shot on 26 different resorts.
3. **The product survives the first-hour traffic spike.** Open-Meteo rate limiting is still the unknown — if 500 concurrent users hit the same venue, we either have a VPS weather cache (deployed with #19) or we get throttled and serve empty cards. VPS deploy solves both.

8K is achievable if Jack deploys the VPS on Sep 20 and the Oct 5 content run ships. 5K is the floor if neither happens.

---

## One Product Risk Nobody Is Talking About

**The scoring model has never been A/B tested against user behavior.**

The Weekend Score is the product's core moat — it's what makes Peakly different from "just show me cheap flights." But nobody has ever validated that users actually trust or understand the score. The algorithm was critiqued (effervescent-jumping-hopper audit), the scoring explainer was shipped, but there's zero data on whether users who see a high-score venue actually book.

If the score systematically surfaces venues that feel wrong to users (e.g., a technical 88/100 ski resort that's actually in shoulder season), the bounce rate on venue detail sheets will be high and the word-of-mouth from the Reddit launch will be negative. This is the difference between 8K users who spread it and 5K who churn.

**What to do about it:** after Reddit launch, track Plausible's `book_click` event by weekend score decile. If high-score venues have lower book-click rates than mid-score venues, the algorithm has a trust gap. This is a v2 problem — but the data collection starts on day 1.

---

*Report generated 2026-09-16 by the daily PM agent.*
