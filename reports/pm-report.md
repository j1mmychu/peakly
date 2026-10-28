# Peakly PM Report v194 — 2026-10-28 (LAUNCH DAY +10)

**Status: 🔴 RED — VPS Day 80. Today is Jack's SSH deadline (Oct 28 "preferred" per v192). Whistler opens Nov 10 = 13 days. Zero code shipped since Aug 11 (78 days). Sprint queue unchanged Day 5.**

> **Stale prompt notice — Day 22 (unchanged):** The stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface.

---

## Shipped Since Last Report (v193 → v194)

| Commit | What | Right call? |
|--------|------|-------------|
| `f811e24` | DevOps Oct 28 — RED, VPS Day 80 (Oct 30 deadline), PRECACHE mismatch day 4, venue count 404 confirmed | ✅ reporting |
| `28c9601` | Content Oct 28 — 88/100, 5 new venues added to queue (INN/SZG ski + KBV/NAP/LRH beach), queue at 15 | ✅ reporting |

**Five consecutive days post-code-freeze. Zero app.jsx / sw.js / index.html commits. Sprint queue untouched day 5.**

**New finding:** 15+ unmerged `claude/*` branches accumulated on origin (analyze-test-coverage, code-review-cleanup, condense-alert-page, enhance-loading-screen, fix-app-jsx-content, improve-peakly-ui, improve-scoring-system, redesign-front-page, review-peakly-ux, simplify-alerts-page, simplify-profile-page, streamline-onboarding-account, etc.). These are cloud agent exploration branches — nothing merged, nothing shipped. This is ambient noise. They do not block anything but Jack should be aware they exist and delete them after a quick review.

---

## Bug Triage

### P0-A — VPS Redeploy: Today Is The Day. 🚨

Today is Oct 28 — the "preferred" deadline from v192. Oct 30 is the hard deadline. **Jack, this is TODAY.**

The Whistler forecast window math: today's 14-day Open-Meteo window reaches Nov 11. Tomorrow still reaches Nov 10 (opening day). Oct 30 reaches Nov 9 — one day before opening, still technically usable for a screenshot but cutting it extremely close. **The window is open right now and closes within 48 hours.**

Four bugs blocked by this one 5-minute SSH action:
1. `forecast_days:7` → Two-weekend scoring broken, Whistler/Tignes invisible on front page
2. `capacitor://localhost` absent from CORS → Every iOS native API call silently blocked
3. `DELETE` absent from allowed methods → Alert deletion silently fails
4. `_wxCache` in-memory only → Cold cache on restart fans out 404 Open-Meteo requests simultaneously

**Jack's exact commands:**
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-deploy 2>/dev/null || (cd /tmp/peakly-deploy && git pull)
cp /tmp/peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days_weather:14, apns:configured
```

### P0-B — Sprint Queue: Day 5 Overdue, BLOCKED-HUMAN-ACTION 🚨

Per v193 decision: these are BLOCKED-HUMAN-ACTION, not deferred. They require Jack to open a local Claude Code session. Auto-push hook only fires from there.

**Items in priority order (all <30 min total):**
1. Cache stamp: `20260914a` → `20261028a` + `PRECACHE = []` — fixes P1-A SW mismatch
2. `origin/master` delete + `deploy.yml` master trigger removal — Day 21 footgun
3. Gili Trawangan: remove `gili-trawangan/DPS`, keep `beach_gilit/LOP`, or add via-suffix labels — Day 5 dup
4. JSON-LD structured data (~30 min) — SEO 3-week lag, Whistler amplification window closing

### P1-A — PRECACHE→CDN Mismatch (Day 4)

`sw.js` pre-caches `unpkg@7.29.7/babel.min.js`. Production never loads Babel (esbuild strips it). Dev loads from `cdnjs@7.24.7`. SW is fetching a 1.1MB file from the wrong CDN that nobody requests. Fix: `PRECACHE = []`. Blocked on sprint item 1.

### P1-B — Venue Queue: 15 Deep, No Merge Path, Growing

Content added 5 more venues today despite the Day 3 freeze decision. Queue is now 15 (was 10 yesterday per v193 decision to halt at 10). The freeze decision isn't holding.

### P2 — 15+ Unmerged `claude/*` Branches on Origin

Cloud agent sessions from the past month left 15+ exploration branches on origin. None are merged. Some may contain useful work (redesign-front-page, improve-scoring-system, streamline-onboarding-account). Most are probably stale noise. **Jack should do a quick pass and delete them before they become confusing.** Not urgent, but worth a 10-minute cleanup.

---

## Three Product Decisions — Oct 28

### Decision 1: Jack SSH TODAY. This report is the last one that will ask nicely.

v192 set Oct 28 as the preferred date. v193 said "today or tomorrow." Today is Oct 28.

**DECISION: VPS SSH happens today (Oct 28) or tomorrow morning (Oct 29) at the absolute latest. If it doesn't happen by Oct 29 EOD, the Whistler screenshot window closes and the Reddit launch plan needs to be reconsidered — either launch with a weaker screenshot or wait until December. Both options cost weeks. The SSH takes 5 minutes. There is no good reason to delay.**

If this report reaches Jack and the VPS is still on the Aug 11 build: SSH now, before reading the rest of this report.

### Decision 2: Venue suggestion queue — HARD CAP at 15, freeze is FIRM, Content agent must enforce it.

v193 Decision 2 said halt new suggestions until queue drops below 3. Today Content added 5 more, bringing the queue to 15. The freeze decision from v193 was not enforced.

**DECISION: The venue suggestion queue is FROZEN at 15. Content agent must not add new venues until Jack ships the existing queue. This is a firm instruction, not a suggestion. The only exception: a venue that would be embarrassing to miss at launch (e.g., a top-10 globally recognized resort with zero representation). Everything else waits. The queue cannot grow faster than it ships — it's already at 15 with zero merge rate.**

To ship the queue: Jack opens a local session, runs `validate-venues.mjs` against the queued batch, pastes accepted entries into `VENUES`, commits. One session, ~20 minutes. This is the merge path.

### Decision 3: JSON-LD — SHIP this week or CUT it from the Reddit launch plan.

JSON-LD has been "ships next session" for 3+ weeks. Google's crawl lag is 2-3 weeks. If JSON-LD ships today, it MAY be indexed by Nov 10. If it ships after Nov 1, the Reddit post goes up before Google indexes the ski pages. The SEO amplification the PM team keeps citing doesn't exist unless JSON-LD lands this week.

**DECISION: JSON-LD either ships in the Oct 28–30 sprint session (30 min of Claude Code work) or is CUT from the Reddit launch criteria. "JSON-LD will boost SEO for the Reddit launch" is only true if it ships 2+ weeks before the post goes up. The post is targeting Nov 10. The math doesn't work after Oct 28. Jack: decide whether the 30 minutes is worth spending. If yes, open a local session. If no, remove JSON-LD from the launch criteria — it becomes a post-launch item.**

---

## Priority List — This Week Only

| # | Item | Decision | Blocks |
|---|------|----------|--------|
| 1 | VPS SSH (proxy.js redeploy) | SHIP TODAY | Two-weekend scoring, iOS CORS, alert delete, cache persistence |
| 2 | Sprint session (cache stamp + PRECACHE + master cleanup) | SHIP THIS WEEK | P1-A SW mismatch, origin/master footgun |
| 3 | JSON-LD | SHIP THIS WEEK or CUT | Reddit SEO amplification |

Everything else is deferred until after the Reddit launch.

---

## Features REJECTED This Week

- **New venue additions (15+):** REJECTED until queue ships. Queue grows faster than merge rate = infinite backlog. No value in adding more until the existing batch ships.
- **Tag depth enrichment (225 venues, 2 tags):** REJECTED until after Reddit launch. Quality gap, but not a launch blocker. Post-launch polish.
- **`origin/master` branch cleanup:** DEFERRED (not rejected — it's a footgun, but low blast radius pre-traffic). Combine with sprint session.
- **Gili Trawangan via-suffix labels:** DEFERRED. Low priority, cosmetic. Bundle with next venue batch.
- **Cloud agent branch cleanup (15+ `claude/*` branches):** DEFERRED. Not urgent. Jack 10-minute pass post-launch.
- **APNS push alerts:** DEFERRED to post-launch. Code is committed, VPS fix lands it partway, but the .p8 key setup is a separate Jack-action. Not needed for Reddit launch.

---

## One Product Risk Nobody Is Talking About

**The 15 unmerged `claude/*` branches are probably better code than what's on main.**

`redesign-front-page`, `improve-scoring-system`, `streamline-onboarding-account`, `improve-peakly-ui` — these branch names suggest substantive improvements were designed and built by cloud agents but never reviewed or merged. If even one of them contains a meaningful UX improvement, it's sitting unmerged while the team ships the current version to Reddit with a potentially worse experience.

The risk: Jack opens the Reddit post, gets 500 new users, and then discovers one of those branches had a front-page redesign that would have converted 2× better. Opportunity cost = those 500 users who saw the old version and bounced.

**Recommended action:** Before the Reddit post goes up, Jack spends 30 minutes doing a quick visual pass on each branch's diff. Keep what's an improvement. Delete the rest. This is a pre-launch activity, not post-launch polish.

---

## Success Criteria

**90-day projection: 5K–8K users. What has to be true for 8K, not 5K?**

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Reddit post | Good copy, decent screenshots | Great copy + Whistler screenshot + two-weekend scoring live |
| SEO | none | JSON-LD indexed before post |
| Product at first load | Current state works | Sprint items shipped — SW cache correct, no stale assets |
| Ski season timing | Post goes up, Whistler in forecast | Post goes up same week Whistler opens, forecast shows opening-week conditions |
| Word of mouth | Some virality | Share-a-list feature actively used |

**The delta between 5K and 8K is almost entirely determined by whether the VPS SSH and sprint session happen in the next 48 hours.**

---

## Standing Tracker

| Open # | Item | Status |
|--------|------|--------|
| #19 | VPS redeploy | 🚨 Day 80. Oct 30 deadline = 2 days. SSH TODAY. |
| Sprint | Cache stamp + PRECACHE + master cleanup | 🚨 Day 5, BLOCKED-HUMAN-ACTION |
| Sprint | JSON-LD | 🚨 SHIP OR CUT by Oct 30 |
| #21 | APNS HTTP/2 + JWT fix | ✅ code committed — needs VPS redeploy |
| P1-A | PRECACHE→CDN mismatch | ✅ fix known — blocked on sprint |
| P2 | Venue queue (15 pending) | ⚠️ FROZEN. No new additions. Ship existing queue. |
| P2 | Gili Trawangan near-dup | ⏳ Low priority, bundle with next venue batch |
| Cleanup | `claude/*` branches (15+) | ⏳ Jack 30-min pass before Reddit post |
