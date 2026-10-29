# Peakly PM Report v195 — 2026-10-29 (LAUNCH DAY +11)

**Status: 🔴 RED — VPS Day 81. Oct 30 hard deadline is TOMORROW. Zero code shipped since Aug 11 (79 days). Sprint queue Day 6 overdue.**

> **Stale prompt notice — Day 23 (unchanged):** The stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface.

---

## Shipped Since Last Report (v194 → v195)

| Commit | What | Right call? |
|--------|------|-------------|
| `00404a7` | DevOps Oct 29 — RED, VPS Day 81, venue count discrepancy flagged (DevOps said 406; Content corrected to 404 — proposed venues were never committed) | ✅ reporting |
| `7af21ec` | Content Oct 29 — 88/100, 5 new venue proposals (Noosa/PlayaDelCarmen/Seminyak/Cortina/ByronBay), Whistler window analysis, clarified DevOps venue count error | ✅ reporting |

**Six consecutive days post-code-freeze. Zero app.jsx / sw.js / index.html commits. VPS unchanged. Sprint queue Day 6.**

**Venue count clarification:** Content confirms 404 is correct — yesterday's DevOps "406" was based on Content's proposed venues (never committed). CLAUDE.md is accurate. No action needed.

**Whistler opening date correction:** Prior reports (v192–v194) cited Nov 10 as the opening date. Today's Content report says Nov 21 (23 days). Nov 21 aligns with historical Whistler opening patterns and is the authoritative number going forward. The VPS `forecast_days:14` window still matters — Oct 30 redeploy still catches Nov 21 within range by Nov 7+.

---

## Bug Triage

### P0-A — VPS Redeploy: Tomorrow Is The Hard Deadline. 🚨

Oct 30 = tomorrow. This is the hard date from v192. Four bugs unblocked by one 5-minute SSH action:

1. `forecast_days:7` → Two-weekend scoring broken, Whistler invisible on front page
2. `_wxCache` in-memory only → `pm2 restart` fans out 404 concurrent Open-Meteo requests → Open-Meteo free tier blown in seconds during a Reddit spike
3. `capacitor://localhost` absent from CORS → iOS native API calls silently blocked
4. `DELETE` absent from allowed methods → Alert deletion has never worked

**Whistler math:** Oct 30 redeploy + `forecast_days:14` window reaches Nov 13. Whistler opens Nov 21 = within the forecast window 8 days after redeploy. ✅ Still viable. Nov 1 deploy still works. Nov 7 is the latest viable deploy date before the forecast window closes on opening weekend. **Every day of further delay tightens the margin.**

**Jack's exact commands — 5 minutes:**
```bash
ssh root@198.199.80.21
cd /tmp && rm -rf peakly-deploy && git clone https://github.com/j1mmychu/peakly.git peakly-deploy
cp /tmp/peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

### P0-B — Sprint Queue: Day 6, BLOCKED-HUMAN-ACTION 🚨

Items still pending (all <30 min total in a local Claude Code session):
1. Cache stamp: `20260914a` → `20261029a` + `PRECACHE = []` — fixes SW mismatch
2. `deploy.yml` master trigger removal — Day 22 footgun
3. JSON-LD (~30 min) — see Decision 3 below for final call

### P1-A — PRECACHE→CDN Mismatch (Day 22)

`sw.js` pre-caches `unpkg@7.29.7/babel.min.js` — a 1.1MB file nobody requests in production. Fix is `PRECACHE = []`. Blocked on sprint.

### P2 — 15+ Unmerged `claude/*` Branches

15 cloud-agent exploration branches on origin, none merged. Not urgent but Jack should do a 30-minute review before the Reddit post — see Product Risk below.

---

## Three Product Decisions — Oct 29

### Decision 1: VPS SSH by Oct 30. Final warning.

This is the last PM report that can realistically flag this before the Whistler window becomes a scramble. Oct 30 is tomorrow. The fix is 5 minutes. The downside of not doing it is: Reddit users on Whistler's opening weekend get the wrong two-weekend window, and an Open-Meteo free-tier spike takes down weather on the exact day that matters most.

**DECISION: SSH by end of day Oct 30. If the VPS isn't redeployed by then, the Reddit launch plan must be reconsidered — either accept degraded scoring or delay to December when more ski inventory is in-season. The 5-minute action is worth more than any other item on this list.**

### Decision 2: Venue suggestion queue — 15 is the final cap. No additions until queue ships.

Content added 5 more proposals today despite the v193/v194 freeze decision. The queue is now 20 (15 prior + 5 today). The freeze is not holding. Queue grows faster than merge rate = infinite backlog.

**DECISION: The venue queue is CAPPED at 20 and FROZEN. No new additions regardless of quality. The Content agent must stop proposing venues until Jack opens a local session and commits the existing batch. To merge: run `validate-venues.mjs` against the queued batch, paste accepted entries into VENUES, commit. One session, ~20 minutes. This is not optional guidance — it is a directive.**

### Decision 3: JSON-LD — CUT from Reddit launch criteria.

v194 set "SHIP by Oct 30 or CUT" as the deadline. Today is Oct 29. Google's crawl lag is 2-3 weeks. Whistler opens Nov 21. For JSON-LD to be indexed by Nov 21, it must ship by Nov 7. That's still technically achievable (8 days away), but the window is tightening, and the sprint session hasn't happened yet.

Revised call: JSON-LD is not a Reddit launch blocker, but it IS worth shipping before Nov 7 if the sprint session happens this week. The SEO value accrues over months — it's never wasted.

**DECISION: JSON-LD is no longer required for the Reddit post, but should ship in the sprint session IF it happens before Nov 7. If the sprint session doesn't happen by Nov 7, JSON-LD becomes a post-launch item. Remove it from the launch gate checklist. The Reddit post can and should go up when the VPS is redeployed and Whistler is in the forecast window — JSON-LD should not be the reason the post gets delayed.**

---

## Priority List — This Week Only

| # | Item | Decision | Deadline |
|---|------|----------|----------|
| 1 | VPS SSH (proxy.js redeploy) | SHIP | **Oct 30 (tomorrow)** |
| 2 | Sprint session (cache stamp + PRECACHE + master cleanup ± JSON-LD) | SHIP | Before Nov 7 |
| 3 | Review + merge venue queue (20 pending) | SHIP | Before Reddit post |

Everything else is deferred until after the Reddit launch.

---

## Features REJECTED This Week

- **New venue proposals beyond the 20 in queue:** REJECTED. Queue grows faster than merge rate. Zero tolerance for additions until backlog clears.
- **Tag depth enrichment (225 venues, 2 tags):** REJECTED until post-launch. Quality gap, not a launch blocker.
- **APNS push setup:** DEFERRED. Code committed and unlocked by VPS redeploy, but the .p8 key enrollment is a separate Jack-action. Not needed for Reddit launch.
- **Photo replacement (~360 generic venues):** DEFERRED. Needs Unsplash API key. Post-launch quality improvement.
- **`claude/*` branch review:** DEFERRED to a dedicated 30-min session before Reddit post. Not urgent enough to block the VPS work.

---

## One Product Risk Nobody Is Talking About

**The Whistler opening date changed between reports and nobody caught it.**

Prior PM reports (v192–v194) cited Nov 10 as Whistler's opening day. Today's Content report says Nov 21 — a full 11 days later. These reports have been driving the VPS deadline framing ("must redeploy before Nov 10") for 3+ reports. If Nov 21 is correct (and it likely is — Whistler historically opens around US Thanksgiving), the timeline pressure is actually softer than stated, but the VPS redeploy is still essential for the Reddit post to show meaningful two-weekend scoring.

The deeper risk: if we're getting the opening date wrong by 11 days in PM reports, we may be getting other data-dependent product decisions wrong too. The agents are working from memory on venue-specific facts. This is a signal to verify any claim that's driving a hard deadline against a primary source before anchoring a launch plan to it.

**Action:** Before writing the Reddit post, Jack should verify Whistler's opening date on their actual website. If it's Nov 21, the VPS Oct 30 deadline is still correct (gives 21 days of forecast overlap) but the "launch post on opening day" framing needs updating.

---

## Success Criteria

**90-day projection: 5K–8K users. What has to be true for 8K, not 5K?**

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Reddit post | Good copy, decent screenshots | Whistler confirmed in forecast, two-weekend scoring live, PRECACHE clean |
| VPS | Not deployed | **Deployed** — cache persistence protects against Open-Meteo spike |
| Sprint items | Not shipped | Cache stamp current, SW clean, master footgun removed |
| Venue catalog | 404, some thin tags | 404+ merged from queue, top venues have richer tags |
| Timing | Post goes up any week | Post goes up same week as a major resort opening |

**The delta between 5K and 8K is almost entirely the VPS redeploy + sprint session happening this week.**

---

## Standing Tracker

| Open # | Item | Status |
|--------|------|--------|
| #19 | VPS redeploy | 🚨 **Day 81. Oct 30 = TOMORROW. SSH TODAY.** |
| Sprint | Cache stamp + PRECACHE + master cleanup | 🚨 Day 6, BLOCKED-HUMAN-ACTION |
| Sprint | JSON-LD | ⚠️ No longer launch-blocking. Ship in sprint if before Nov 7, else post-launch. |
| #21 | APNS HTTP/2 + JWT fix | ✅ code committed — blocked on VPS redeploy |
| P1-A | PRECACHE→CDN mismatch | ✅ fix known — blocked on sprint |
| P2 | Venue queue (20 pending) | ⚠️ FROZEN. Hard cap. Ship existing batch before adding more. |
| P2 | Gili Trawangan near-dup | ⏳ Low priority, bundle with venue queue merge |
| Cleanup | `claude/*` branches (15+) | ⏳ Jack 30-min pass before Reddit post |
