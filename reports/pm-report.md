# Peakly PM Report v185 — 2026-10-19 (LAUNCH DAY +1)

**Status: 🔴 RED → Day +1 post-launch. VPS Day 71. Not redeployed. Val Thorens opening-weekend hook is burning. The gap between a soft launch and a real launch is one SSH session.**

> **Stale prompt notice — Day 13 (critical):** Stored cron still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage.** This miscalibrates every single analysis. Jack: 2-minute cron edit fixes it permanently.

---

## Shipped Since Last Report (v184 → v185)

| Commit | What | Right call? |
|--------|------|-------------|
| `56a2ac1` | Content Oct 19 — 91/100, Day +1, VPS still gated | ✅ reporting |
| `f2d0962` | DevOps Oct 19 — RED, VPS Day 71, VENUES 406 vs CLAUDE.md 404 | ✅ reporting |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 35. Correct.**

One note: DevOps counts 406 venues, Content counts 404. Discrepancy is a report-line-counting artifact — both confirm code freeze intact. Not a P0. Resolve by running `node -e "const src=require('fs').readFileSync('app.jsx','utf8'); eval(src.match(/const VENUES\s*=\s*(\[[\s\S]*?\]);/)[1]); console.log(VENUES.length)"` and updating CLAUDE.md next networked session.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 71 — IT IS LAUNCH DAY +1 🚨

Yesterday was the stated launch date. The r/travel post still hasn't gone up. The Val Thorens opening-weekend hook — the entire narrative anchor of this launch — has a hard expiry. By Oct 22–23 "opening weekend" is just "Val Thorens is open, so what?" That's 3–4 days from now.

**What's broken live right now:**

| Feature | User impact |
|---------|-------------|
| Two-weekend scoring | Off. VPS runs `forecast_days:7`. Front page shows one window. Val Thorens may be scored below its real conditions with `confidence:"low"` — hidden from the front page entirely. |
| iOS native experience | CORS blocked on every API call. App Store submission puts users into a broken app. |
| Alert deletion | Silently fails on every device. The `.catch(()=>{})` hides it. Retention killer from Day 1. |
| Reddit spike protection | Cold VPS restart wipes `_wxCache`. r/travel link fires → Open-Meteo rate-limited → "conditions unavailable" for every arriving user. The 10-minute window where you make or break the thread. |

All four fixes are committed in `server/proxy.js`. The operation is under 5 minutes:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Confirm post-deploy: `forecast_days: 14`, `disk_cache: true`, `apns: configured`.

**The Val Thorens hook expires Oct 22–23. After that, the r/travel post is generic timing, not a moment.**

### P0-B — `origin/master` Footgun: Day 13 🚨

50+ commits behind `main`. `deploy.yml` deploys both branches. An accidental `git push origin master` during post-launch activity rolls the live site back to May — while the r/travel thread is active and new users are arriving.

30-second fix during the VPS SSH session:

```bash
git push origin --delete master
```

### P1 — r/travel Post: Clock Running

The launch window is:
- **Tonight or tomorrow AM (Oct 20, 10am–2pm ET)** — if VPS ships today
- **Oct 21** — weekend traffic, still within opening-weekend narrative
- **Oct 22** — marginal, hook is stale
- **Oct 23+** — generic timing, no hook. Miss the window.

Draft: "We built an app that combines live Fri–Mon weather conditions with cheap flights to tell you if Val Thorens is worth flying to this weekend — and it's live. [Link]" Lead with the venue, not the product. r/travel cares about the trip, not the startup.

### P2 — SW PRECACHE Mismatch: Day 15

`sw.js` precaches `unpkg.com/babel@7.29.7`; `index.html` loads `cdnjs/babel@7.24.7`. Wasted bandwidth, zero offline benefit for the asset users actually load. Post-launch sprint, not during code freeze.

### P2 — Gili Trawangan Duplicate

`beach_gilit` (LOP) + `gili-trawangan` (DPS) — same venue, two IDs. No crash. Post-launch, single-line delete.

---

## Three Product Decisions — Oct 19

### Decision 1: The Val Thorens hook expires in 3–4 days. This is now urgent.

The launch date was Oct 18. The r/travel post hasn't gone up. Val Thorens opened Oct 17. By Oct 22–23 the opening-weekend narrative is gone and the post is just another gear/conditions post competing for attention.

**DECISION: VPS must ship today (Oct 19). If it doesn't ship by end of day, the r/travel post moves to generic timing (Oct 25 or later) and the seasonal hook is wasted. Oct 18–21 is the window. Today is the last day it's urgent.**

### Decision 2: Post-launch code freeze holds through at least Oct 22.

The temptation after a launch is to ship reactive fixes. The actual risk is introducing a regression while the r/travel thread is active and new users are forming first impressions. The P2s (PRECACHE mismatch, Gili Trawangan dup) are invisible to users. They don't justify breaking code freeze.

**DECISION: Code freeze holds through Oct 22 minimum. P0 only breaks it. The three post-launch sprint items (PRECACHE fix, Gili Trawangan, JSON-LD) queue for Oct 23+.**

### Decision 3: VENUES count discrepancy — resolve and update CLAUDE.md next networked session.

DevOps: 406. Content: 404. CLAUDE.md: 404. One of them is right. The eval-counter is authoritative. This is not a P0 but living with stale documentation is how the next agent confidently reports wrong data.

**DECISION: Next networked session — run the eval-counter one-liner, update CLAUDE.md `Current State` venue count to match. Takes 2 minutes. Prevents the next 10 reports from debating it.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy** — `scp + pm2 restart`. TODAY. Before the Val Thorens hook expires.
2. **Delete `origin/master`** — 30 seconds during the VPS SSH session. Do not skip this.
3. **r/travel post** — Tonight if VPS ships today. Oct 20–21 if it slips. After Oct 22, no hook.

Everything else waits.

---

## Features Rejected This Week

- **Venue photos sprint** — DEFER. 404 venues, ~0 users. Photos matter; they don't matter today. Post-1K.
- **Tag expansion (91 thin-tag venues)** — DEFER. Invisible to first-time users. Week 2 post-launch sprint.
- **JSON-LD structured data** — DEFER. SEO payoff 8–12 weeks out. Oct 23+ sprint.
- **Branch protection on `main`** — DEFER until immediately after VPS SSH session. GitHub settings toggle. Has been deferred 13 days. Do it in the same terminal session as the VPS deploy.
- **iOS venue deep links** — CUT. Decision from v160 stands. Revisit at 1K users.
- **Venue count discrepancy investigation** — DEFER (not reject). 2-minute task, next networked session.

---

## Success Criteria

**What defines success at 90 days:**
- 5K–8K users via organic SEO + r/travel + App Store
- 8K (not 5K) requires the r/travel post to go up Oct 19–21 with Val Thorens on the front page

**The gap between 5K and 8K is a single SSH session that hasn't happened in 71 days.**

---

## One Product Risk Nobody Is Talking About

**The opening-weekend timing dependency is invisible to the codebase.** The Val Thorens hook — the one narrative that makes this launch not just another app launch — is baked into the October 17 real-world event. It can't be shipped, committed, or tested. It's a calendar fact. If the VPS slips past Oct 22, there's no code fix that recovers the timing. The next natural hook (Whistler early season, Alps mid-season) is 3–4 weeks out, and none of them have the same "opening weekend" moment that Val Thorens October has. The product is launch-ready. The timing risk is entirely operational. This is the week where a 5-minute SSH session determines whether the 90-day projection is 5K or 8K users.
