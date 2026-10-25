# Peakly PM Report v191 — 2026-10-25 (LAUNCH DAY +7)

**Status: 🔴 RED — VPS Day 77. Whistler window = 16 days. Cache stamp 41 days stale. `origin/master` footgun Day 18. Code freeze lifted 48 hours ago. Nothing shipped yet.**

> **Stale prompt notice — Day 19:** The stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage as of today.** Jack: 2-minute fix in the Claude.ai interface. Every report that opens with wrong numbers burns credibility on what actually needs action.

---

## Shipped Since Last Report (v190 → v191)

| Commit | What | Right call? |
|--------|------|-------------|
| `861823a` | DevOps Oct 25 — RED, VPS Day 77, PRECACHE mismatch confirmed, `origin/master` Day 18 | ✅ reporting |
| `d1f7c2c` | Content Oct 25 — **Open #22 resolved**: BASE_PRICES now 100% (404/404), 5 new venues queued (GIG×2 Brazil beach + TRN/SOF/INV ski), seasonal framing, data health 89/100 | ✅ significant milestone |

**Two full days post-code-freeze. Zero app.jsx / sw.js / index.html commits. The sprint queue is untouched.**

BASE_PRICES hitting 100% is the one genuine win today — Content closed Open #22 which has been open since July. That's the deal score working correctly for every venue now. Everything else is still exactly where v190 left it.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 77. Whistler Window = 16 Days 🚨

**Nov 5 = 11 days. Whistler likely opens Nov 10.** The Reddit post requires a real `forecast_days:14` screenshot showing Whistler on the front page. That screenshot cannot exist without the VPS redeploy. The window is 16 days and every day the sprint sits idle is a day the deadline gets harder.

Four features broken in production right now:
1. Two-weekend scoring disabled — Whistler/Tignes/Mammoth invisible on the front page for next-weekend planning
2. iOS native CORS blocked — every native API call fails
3. Alert deletion silently fails — `.catch(()=>{})` hides it; users think alerts are gone, they're not
4. Cache cold-flush on `pm2 restart` — traffic spike post-redeploy hits Open-Meteo free tier

**This is not a sprint item. This requires Jack's SSH session.** Everything else is unblocked right now.

### P0-B — `origin/master` Footgun: Day 18 🚨

`deploy.yml` deploys both `main` and `master`. A push to `origin/master` silently reverts the live site. There are 15+ `claude/*` branches on origin. Any stale clone that pushes to master triggers a revert to May 2026 code — 339 venues, old onboarding, old scoring.

**Fix: 30 seconds.** `git push origin --delete master` and remove the `master` trigger from `deploy.yml`. This is a sprint item and it should have shipped 48 hours ago.

### P1 — Sprint Queue Stalled (48 Hours Post-Freeze-Lift)

Cache stamp: `20260914a` — 41 days old. PRECACHE has `unpkg@7.29.7/babel.min.js` while `index.html` loads `cdnjs@7.24.7/babel.min.js`. These are different files on different CDNs. The service worker is precaching a URL that doesn't match what the app actually loads — meaning the cache entry is wasted bandwidth that will never be served from cache. Gili Trawangan duplicate is still live.

Items 1–5 of the sprint queue require no design decisions:
1. Cache stamp bump + PRECACHE fix (same edit, ~5 min)
2. `origin/master` delete + `deploy.yml` edit (~10 min)
3. Gili Trawangan dedup (~10 min)
4. JSON-LD structured data (~30 min, SEO 3-week lag starts when this ships)

Every day JSON-LD ships later is a day the Google indexing lag starts later. Whistler is 16 days away. This is now urgent.

### P2 — Tag Quality: 55.7% Thin-Tag Rate

225 of 404 venues have exactly 2 tags. `scoreVibeMatch` uses tags as a corpus — thin tags hurt "For you" precision. No movement since v189 locked the sprint queue. Tag batch 1 (50 venues minimum) is the gate for the 5 new venues Content queued today (GIG×2, TRN, SOF, INV).

---

## Three Product Decisions — Oct 25

### Decision 1: Sprint Items 1–4 ship today. Not EOD Oct 27. Today.

The code freeze lifted 48 hours ago. The sprint queue requires no design decisions and no Jack input — it's a cache stamp, a CDN URL fix, a branch delete, and a dedup. The Whistler window is 16 days and the JSON-LD SEO lag means every day the structured data ships late is a day fewer pages are indexed by the time the Reddit post goes up.

**DECISION: Items 1–4 ship in the next scheduled session. If they don't, the Nov 5 VPS deadline arrives with a stale cache, zero SEO head start, and a live footgun. There is no version of the Whistler launch plan that works with a 41-day-stale cache.**

### Decision 2: BASE_PRICES 100% coverage — Open #22 CLOSED.

Content closed it today. All 404 venues now have a base price for deal score calculation. The deal score is a headline feature and it was broken for 43% of the catalog until today. This is a significant quality milestone.

**DECISION: Open #22 is formally closed. Do not reopen. The deal score is now honest across the full catalog. Monitor `getDealScore` output on the next session to confirm the ~$0 edge case (very cheap destinations hitting the absolute-savings floor) behaves correctly.**

### Decision 3: The 5 Content-queued venues ship with tag batch 1, not before.

Content queued GIG×2 (Brazil beach, two gateway airports), TRN (Turin ski), SOF (Sofia ski), INV (Inverness ski). All validated. Ready to paste.

**DECISION: These 5 venues do not ship until tag batch 1 (50 venues) ships. Adding venues with 2 thin tags to a catalog that's 55.7% thin makes the number worse. The gate is the tag batch. No exceptions.**

---

## This Week's Top 3 Priorities

1. **Sprint items 1–4 (cache stamp + PRECACHE fix + `origin/master` delete + Gili dedup)** — No design decisions. No VPS access needed. Should have shipped Oct 23. Ships next session.
2. **JSON-LD structured data** — Sprint item 5. SEO 3-week lag starts when this ships. Whistler is 16 days away. Every session this slips is a lost indexing day.
3. **VPS redeploy (Jack SSH)** — Hard deadline Nov 5. This is not a sprint task — it requires Jack's SSH session to the DigitalOcean droplet. The code is committed and waiting in `server/proxy.js` since Aug 11. Four production bugs unblock in 5 minutes.

---

## Features REJECTED This Week

- **`claude/*` branch merges** — CLOSED, same as v190. None were created through deliberate product decisions. Post-Whistler if the idea is still worth building, reintroduce from scratch.
- **New venue additions before tag batch 1** — DEFERRED. The 5 queued venues (GIG×2, TRN, SOF, INV) are validated and ready; they ship after tag batch 1. Adding thin-tag venues now makes the quality metric worse.
- **Gili Trawangan "from Lombok / from Bali" title differentiation** — DEFERRED. The dedup resolution is to remove `gili-trawangan/DPS` (DPS has 18 other venues, LOP has only this one) and keep `beach_gilit/LOP`. Renaming is scope creep on a dedup task.

---

## Success Criteria & 90-Day Projection

**5K users (base case):** Whistler post lands, Reddit karma carries organic traffic, App Store submission completes before ski season peak.

**8K users (upside case):** Requires all of:
- VPS ships before Nov 5 → two-weekend scoring live → Whistler appears on front page with a real score
- JSON-LD ships this week → Whistler-related pages indexed before the Reddit post → SEO traffic at launch instead of 3 weeks after
- Tag batch 1 ships → `scoreVibeMatch` precision improves → returning users get better "For you" results → retention edge

The difference between 5K and 8K is not a new feature. It's whether the infrastructure (VPS + SEO) is in place when the Reddit post lands. Those two items have hard deadlines that are currently being ignored.

---

## One Product Risk Nobody Is Talking About

**The Whistler window is 16 days, but the real deadline is closer to 10.**

The Nov 5 VPS deadline assumes a same-day VPS redeploy + a 5-day lead time for Whistler to appear in the forecast window. But the Reddit post itself needs preparation time: the screenshot, the copy, the subreddit selection, the timing (post on a Thursday for weekend traffic). Realistically, that's 2–3 days of prep after the VPS confirms Whistler is showing correctly.

That means the effective VPS deadline is ~Nov 2–3, not Nov 5. The report has been calling Nov 5 for two weeks. It should be calling Nov 2.

If the VPS ships Nov 4 and Whistler doesn't appear in the forecast window until Nov 6, the Reddit post misses the window entirely. The next natural Whistler hook is Dec when the full season opens — a 6-week delay.

---

## Open Items Tracker

| # | Item | Status | Deadline |
|---|------|--------|----------|
| 19 | VPS redeploy | 🔴 Day 77, Jack SSH | **Nov 2 (real deadline)** |
| 20 | Photos (~346 venues generic stock) | P2 — post-Whistler | — |
| 21 | APNS: HTTP/2 + P1363 JWT fix | P2 — parked | — |
| 22 | BASE_PRICES coverage | ✅ **CLOSED Oct 25** — 100% | — |
| 23 | Weather cache disk persistence | P1 — bundle with #19 | Nov 2 |
| Sprint-1 | Cache stamp + PRECACHE fix | 🔴 Overdue 48h | Today |
| Sprint-2 | `origin/master` footgun delete | 🔴 Overdue 48h | Today |
| Sprint-3 | Gili Trawangan dedup | 🔴 Overdue 48h | Today |
| Sprint-4 | JSON-LD structured data | 🔴 Not started | Today |
| Sprint-5 | Tag batch 1 (50 venues) | Not started | Oct 28 |
| Sprint-6 | 5 new venues (GIG×2/TRN/SOF/INV) | Blocked by Sprint-5 | Oct 29 |
