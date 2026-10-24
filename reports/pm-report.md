# Peakly PM Report v190 — 2026-10-24 (LAUNCH DAY +6)

**Status: 🔴 RED — VPS Day 76. Whistler window = 17 days. Cache stamp 40 days stale. `origin/master` footgun Day 17. Sprint queue unlocked, nothing shipped yet.**

> **Stale prompt notice — Day 18 (critical):** Stored cron still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage.** Jack: 2-minute cron edit in the Claude.ai interface. Every report that opens wrong burns credibility on what actually needs action.

---

## Shipped Since Last Report (v189 → v190)

| Commit | What | Right call? |
|--------|------|-------------|
| `579cd86` | DevOps Oct 24 — RED, VPS Day 76, PRECACHE mismatch, origin/master Day 17 | ✅ reporting |
| `220311c` | Content Oct 24 — 89/100, 5 new venues queued (LAS/PHX ski + AGP/CTG/AGA beach), AP gap inventory | ✅ reporting |

**Zero app.jsx / sw.js / index.html commits. Code freeze lifted yesterday. Sprint hasn't started.**

The code freeze was lifted Oct 23. It is now Oct 24. The sprint queue (cache stamp → origin/master delete → PRECACHE fix → Gili dedup → JSON-LD → tag batch 1 → 5 new venues) was locked in v189. None of it has shipped. The Whistler window is 17 days and counting.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 76. Whistler Window = 17 Days 🚨

**Nov 5 hard deadline = 12 days from today.** Whistler likely opens Nov 10. The front page cannot show a high-confidence Whistler score without `forecast_days:14` running on the VPS. The Reddit post cannot be finalized without that screenshot. The post is the Whistler window. The window is 17 days.

Four features broken until the VPS is updated:
1. Two-weekend scoring disabled (Whistler/Tignes/Mammoth invisible on front page)
2. iOS native CORS blocked (`capacitor://localhost` absent)
3. Alert deletion silently fails (`DELETE` absent from CORS)
4. Cache wipes on every `pm2 restart`

Fix: 3 SSH commands, 5 minutes. The code is committed and waiting in `server/proxy.js` since Aug 11.

### P0-B — `origin/master` Footgun: Day 17 🚨

One accidental push to master reverts the live site to May 2026 (339 venues, old onboarding, old scoring). `deploy.yml` deploys both branches. Fix is `git push origin --delete master` — 30 seconds.

This is the fourth consecutive report calling this out. Either it ships this sprint session or it stays live forever.

### P1 — Sprint Queue Not Started

Code freeze lifted yesterday. Cache stamp is 40 days stale. PRECACHE references a CDN URL that doesn't match the current build. Gili Trawangan duplicate is live. JSON-LD (3-week SEO lag) is not committed. Tag enrichment batch hasn't started.

Every day the sprint queue sits idle is a day the Whistler SEO lag starts later, the cache stays stale for returning users, and the 55.7% thin-tag rate keeps degrading `scoreVibeMatch` and search recall.

### P2 — 5 New Venues Queued (Not Yet Pasted)

Content queued 5 validated venues: **LAS ski**, **PHX ski**, **AGP beach**, **CTG beach**, **AGA beach**. All pre-checked for duplicate IDs. Ready to paste — but they go in after the quality sprint items per the v189 decision. This is a data point, not a blocker.

### P2 — Gili Trawangan Duplicate

`beach_gilit`/LOP and `gili-trawangan`/DPS are two entries for the same destination. Retention risk (see v189 One Product Risk). In sprint queue, slot 4.

---

## Three Product Decisions — Oct 24

### Decision 1: The sprint starts today, with a deadline.

The code freeze lifted yesterday. The sprint queue is locked. The Whistler window is 17 days. The sprint items do not require VPS access or design decisions. They are:

1. Cache stamp bump (first, required, ~5 min)
2. `origin/master` delete (30 seconds)
3. PRECACHE fix (bundle with stamp bump)
4. Gili Trawangan dedup (one VENUES delete, ~10 min)
5. JSON-LD structured data (SEO 3-week lag starts when this ships)
6. Tag enrichment batch 1 (~50 venues)
7. Paste 5 Content-validated new venues

**DECISION: Items 1–5 ship by EOD Oct 25. Items 6–7 ship by EOD Oct 28. If they don't, Nov 5 VPS deadline arrives with a stale cache and zero SEO head start.**

### Decision 2: The `claude/*` branches are CLOSED, not evaluated.

There are 15+ `claude/*` branches on origin (redesign-front-page, improve-scoring-system, streamline-onboarding-account, simplify-alerts-page, etc.). v189 said "evaluate post-Whistler." Evaluating them takes time and creates pressure to merge something.

**DECISION: All `claude/*` branches are CLOSED now. Jack: `git push origin --delete claude/[branch-name]` for each, or let them expire. The Oct 24 sprint is quality + infrastructure. The Whistler post is the product launch. Branch cleanup is distraction from that.**

Reasoning: none of these branches were created by the product owner through deliberate design decisions. They are exploratory agent outputs. The cost of evaluating 15 branches is higher than the cost of discarding them. Any genuinely good idea can be reintroduced after the Whistler launch as a deliberate change.

### Decision 3: No new venue additions until tag batch 1 ships.

Content's 5 queued venues (LAS, PHX, AGP, CTG, AGA) are ready. They will not be pasted until tag batch 1 (50 venues minimum) ships. Adding a venue with 2 thin tags to a catalog where 55.7% already have thin tags doesn't move the quality metric.

**DECISION: Tag batch 1 is the gate for new venue additions. No exceptions. This means the 5 queued venues sit in the queue until batch 1 ships.**

---

## This Week's Top 3 Priorities Only

1. **Start and finish the quality sprint (cache stamp → origin/master → PRECACHE → Gili dedup → JSON-LD)** — Items 1–5, EOD Oct 25. Zero design decisions required. All of this is plumbing that enables everything else.
2. **VPS redeploy by Nov 5** — Hard deadline, 12 days. Three SSH commands. Nothing else produces a Whistler screenshot.
3. **Tag enrichment batch 1 by Oct 28** — 55.7% thin-tag rate is the biggest quality gap. Repairs `scoreVibeMatch` and search recall. Gates new venue additions.

---

## Features REJECTED This Week

- **`claude/*` branch merges** — CLOSED. None were created through deliberate product decisions. Evaluate from scratch post-Whistler if the idea is still worth building.
- **New venue additions before tag batch 1** — REJECTED. Catalog quality > catalog size at 404 venues. The 5 queued venues wait.
- **Any post-Whistler roadmap planning** — REJECTED. We are 17 days from the launch event. Planning what comes after it is premature. Build what ships the Whistler post first.
- **Stale cron prompt update from this agent** — CAN'T DO. Jack: 2-minute fix in Claude.ai interface, Day 18.

---

## One Product Risk Nobody Is Talking About

**The sprint queue has been "locked" for 24 hours and nothing has shipped.**

v189 declared the sprint queue locked and the code freeze lifted. Oct 24's reports from DevOps and Content confirm zero app.jsx commits. The risk isn't that the sprint items are wrong — they're right. The risk is that the sprint queue becomes a recurring report item rather than a shipping item. Each daily cycle the queue sits idle, the Whistler window shrinks by one day, the JSON-LD SEO lag starts one day later, and the cache stays stale for another day of returning users.

The 17-day Whistler window is not recoverable. The opening day spike on r/skiing happens once. If the sprint queue is still "locked but not started" on Nov 1, the Whistler post window is 9 days and the JSON-LD structured data has had 8 days to index instead of 15.

This is not a planning problem. It's an execution gap. The next agent session that touches app.jsx ships items 1–5.

---

## 90-Day Projection: What Gets Us to 8K, Not 5K

Unchanged from v189 — the gap between 5K and 8K is:
1. **Whistler post timing** — top 10 of r/skiing on opening day
2. **VPS `forecast_days:14`** — Whistler shows high-confidence when Reddit users arrive
3. **Tag enrichment** — second-visit retention; search recall for "powder" and "warm water"

All three require the sprint to actually ship. The 5K scenario is where the sprint stays a recurring report item. The 8K scenario is where it ships this week.

---

*v190 written 2026-10-24. Hard deadline: VPS Nov 5 (12 days). Sprint items 1–5: EOD Oct 25.*
