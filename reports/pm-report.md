# Peakly PM Report v189 — 2026-10-23 (LAUNCH DAY +5)

**Status: 🟡 YELLOW — Code freeze lifts today. VPS Day 75. `origin/master` Day 16. Whistler window: 18 days. Sprint begins now.**

> **Stale prompt notice — Day 17 (critical):** Stored cron still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage.** Jack: 2-minute cron edit in the Claude.ai interface. Every report that opens wrong burns credibility on what actually needs action.

---

## Shipped Since Last Report (v188 → v189)

| Commit | What | Right call? |
|--------|------|-------------|
| `2cfb700` | DevOps Oct 23 — RED, VPS Day 75, code freeze lifts today, origin/master footgun | ✅ reporting |
| `5774079` | Content Oct 23 — 89/100, code freeze lifts, 5 venues validated (Flaine/Davos/Sunshine Village/Lamu/Anse Cocos), 70% queue duplicate rate | ✅ reporting |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 39 ends today.**

One important signal from Content: **70% duplicate rate in the Oct 21–22 venue queue.** 7 of 10 proposed venues already existed in the 404-venue catalog under different IDs. The queue process needs an up-front ID check, not a pre-paste check. Content fixed this for today's 5 venues — all pre-verified clean. This matters because adding another 50 thin-tag venues to a 404-venue catalog that already has thin-tag issues makes the product worse, not better.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 75. Whistler Window = 18 Days 🚨

Same four broken features as yesterday. Not repeating the table — nothing changed. The fix is still 3 commands, 5 minutes. Hard deadline: **Nov 5** (buffer before Whistler ~Nov 10 opening). That is 13 days from today.

The new wrinkle: code freeze lifts today. The first post-freeze app.jsx commit is coming. If that commit touches the proxy or weather layer (it shouldn't — sprint is PRECACHE, dedup, JSON-LD, tags), the gap between live code and VPS code widens further. It won't, but this is the last chance to treat VPS as "behind one version" vs "behind two."

### P0-B — `origin/master` Footgun: Day 16 🚨

Still live. `deploy.yml` still deploys both `main` and `master`. `master` still points to May 2026. One accidental push rolls back 5 months. This is an unforced error that requires exactly 30 seconds to fix. If it hasn't happened by the end of today's sprint session, it never will — it's a 30-second terminal command.

### P1 — Tag Quality: 225/404 (55.7%) thin tags

First post-freeze sprint target. `scoreVibeMatch` and search recall degraded for majority of catalog. This is what "code freeze lifts" was waiting for.

### P2 — Cache Stamp Stale (`peakly-20260914a`)

The DevOps and Content reports both flag this. First post-freeze edit MUST bump the cache stamp in lockstep (app.jsx, sw.js, index.html per auto-push.sh rules). This is a structural requirement of the pipeline, not a nice-to-have.

### P2 — Gili Trawangan Duplicate (live)

`beach_gilit`/LOP and `gili-trawangan`/DPS both live in the 404-venue catalog. Different airports, same destination. Users saving one and later searching for the other get two separate scoring profiles for the same beach. This is a retention risk (see "one product risk" below), not just a data item.

### P3 — Stale `dist/index.html`

DevOps confirmed this is not a production bug (CI rebuilds dist/ on every push). It's a misleading artifact in the repo. Bundle with first sprint commit — no standalone effort.

---

## Three Product Decisions — Oct 23

### Decision 1: Sprint order is locked.

Code freeze is lifted. The sprint queue is:

1. **Cache stamp bump** — must be first, required by pipeline
2. **`origin/master` delete** — 30 seconds, same terminal session
3. **PRECACHE fix** — SW mismatch, bundle into stamp bump commit
4. **Gili Trawangan dedup** — one delete from VENUES, swap LOP→DPS or vice versa
5. **JSON-LD structured data** — 3-week SEO lag starts today; every day it slips costs a day in December
6. **Tag enrichment batch 1** — 50 venues, `scoreVibeMatch` repair
7. **5 validated new venues (Flaine, Davos, Sunshine Village, Lamu, Anse Cocos)** — paste after tags, not before

**DECISION: New venues are #7 in this sprint, not #1. The 5 Content-queued venues are ready to paste but they're going in after the quality items. A sixth thin-tag venue does not move the product forward.**

### Decision 2: The Whistler Reddit post gets drafted this sprint.

The post doesn't exist anywhere in this repo. It's been on the priority list since v188 ("write it now, no VPS required"). It still doesn't exist. The argument for drafting it before VPS ships: the post requires a screenshot of Whistler showing a high-confidence weekend score — which requires the VPS to be running `forecast_days:14`. So the post can't be finalized without the VPS. But the body copy, the hook, the subreddit strategy, and the proof-of-concept framing can all be drafted now. The finalized score screenshot gets inserted when VPS ships.

**DECISION: Draft the r/skiing Whistler post to `reports/ready-to-ship/whistler-reddit-post.md` this sprint. Body copy only, [SCREENSHOT PLACEHOLDER] for the score UI. 30-minute task. The post should not be written the morning of the Whistler opening — it should be ready to post with one screenshot insertion.**

### Decision 3: No new features in the Oct 23 sprint.

There are 15+ `claude/*` branches on origin that haven't been merged (redesign-front-page, improve-scoring-system, streamline-onboarding, etc.). Code freeze is lifted. The temptation is real. None of them ship in the Oct 23 sprint.

**DECISION: Oct 23 sprint = quality + infrastructure only. Zero new features. Branches evaluated post-Whistler if they pass a "does this serve the 100K goal?" screen. Most will be CLOSED, not merged.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy by Nov 5** — Whistler window is 18 days. 3 commands. Jack's SSH. Nothing else unblocks the full product.
2. **Start the Oct 23 quality sprint** — cache stamp, origin/master, PRECACHE, Gili dedup, JSON-LD, tag batch 1, in that order.
3. **Write the Whistler Reddit post** — body copy today, screenshot on VPS deployment day.

---

## Features REJECTED This Week

- **`claude/*` branches (redesign, scoring, onboarding, etc.)** — REJECTED. No feature work until Whistler window either lands or passes. Evaluate post-Nov 10.
- **New venue additions before tag enrichment** — REJECTED. The 5 queued venues are good but they go in after tag batch 1, not before. Catalog quality > catalog size at 404 venues.
- **Any stale prompt update from this agent** — CAN'T DO. The PM agent cannot update the stored cron prompt. Jack: 2-minute fix in Claude.ai interface. Day 17.
- **SEO beyond JSON-LD in sprint 1** — REJECTED. JSON-LD + static h1 are the highest-impact SEO items (structured data compounds over weeks). Everything else deferred.

---

## One Product Risk Nobody Is Talking About

**The Gili Trawangan duplicate is a retention bug disguised as a data-hygiene item.**

`beach_gilit` (Lombok, LOP) and `gili-trawangan` (Bali, DPS) are two separate entries for the same group of islands. They use different airports, which means they return different flight prices, different weather (same lat/lon ≈ same scores), and different deal scores. A user who saves `beach_gilit` after a great score and later searches "Gili" sees both — the one they saved and a slightly different-priced "competitor." If `gili-trawangan` has a worse deal score that week, the product looks inconsistent. If it has a better one, the product looks like it's gaming the ranking. Neither is the real product. This dedup is in the sprint queue but it's not being framed as the retention issue it actually is.

---

## 90-Day Projection: What Gets Us to 8K, Not 5K

The gap between 5K and 8K is still:
1. **Whistler post timing** — top 10 of /r/skiing on opening day, not the week before
2. **VPS `forecast_days:14`** — Whistler has to show high-confidence on the front page when Reddit users arrive
3. **Tag enrichment** — second-visit retention. Users who search for "powder" or "warm water" and get bad matches churn before the loop can form

The 8K scenario requires all three. The 5K scenario happens if the Whistler post lands with a mediocre ranking or VPS ships two days after the opening-day spike. The gap is mostly execution speed on things already decided.

---

*v189 written 2026-10-23. Next P0 horizon: VPS Nov 5 hard deadline.*
