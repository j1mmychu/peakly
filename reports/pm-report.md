# Peakly PM Report v184 — 2026-10-18 (LAUNCH DAY)

**Status: 🔴 RED → LAUNCH DAY. VPS Day 70 still not deployed. Val Thorens is open. The clock is running.**

> **Stale prompt notice — Day 12 (critical):** Stored cron still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues, 2 categories (skiing + beach), Pro cut, Sentry live, BASE_PRICES 100% coverage (Open #22 CLOSED)**. Jack: 2-minute cron edit. This has been miscalibrating every launch-week analysis.

---

## Shipped Since Last Report (v183 → v184)

| Commit | What | Right call? |
|--------|------|-------------|
| `c7bb660` | Content Oct 18 — 91/100, Launch Day, code freeze Day 34 | ✅ |
| `2fbd0d9` | DevOps Oct 18 — RED, VPS Day 70, BASE_PRICES Open #22 CLOSED | ✅ |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 34. Correct.**

Significant new information: **BASE_PRICES Open #22 is CLOSED.** DevOps confirmed 186 keys defined, 152 distinct venue APs — 100% coverage. This was listed as a P1 pre-launch gap at 68% coverage. It's done. Drop it from the open list.

Val Thorens opened yesterday (Oct 17). Today is the "Opening Weekend in the French Alps" hook. This window is alive right now and decays by the hour. The r/travel post is gated on one thing: the VPS deploy.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 70 — LAUNCH DAY 🚨

It is October 18. The product is code-frozen and launch-ready. The VPS is running the August 11 build. This is the only thing between Peakly and a real launch.

**What is broken right now for every user:**

| Feature | Reality without VPS deploy |
|---------|---------------------------|
| Two-weekend scoring | Off. `forecast_days: 7` on running VPS. Front page shows one window. Val Thorens gets `confidence: "low"` and disappears from front page. |
| iOS native users | CORS blocked. `capacitor://localhost` not in VPS allow-list. App Store launch = broken iOS experience. |
| Alert deletion | Silently fails. Every tap confirms in UI, server ignores it. `.catch(()=>{})` hides the error. Day-1 retention damage. |
| Reddit spike protection | `_wxCache` in-memory only. `pm2 restart` wipes it. r/travel link fires → cold cache → Open-Meteo rate-limited in under 5 minutes → every user sees "conditions unavailable." |

All four fixes are already written and committed in `server/proxy.js`. The operation is:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Confirm: `forecast_days: 14`, `disk_cache: "enabled"`, `apns: "configured"`.

**This is 5 minutes. It has been 70 days. It is the last thing before launch.**

### P0-B — `origin/master` Footgun: Day 12 — 30 seconds 🚨

50 commits behind `main`. `deploy.yml` deploys both. Accidental push to `master` during launch-day chaos rolls the live site back to May. Run during the VPS SSH session:

```bash
git push origin --delete master
```

### P1 — r/travel Post: Conditional on VPS

The Val Thorens opening-weekend hook is live TODAY. Sequence:
1. VPS ships (confirms `forecast_days: 14`)
2. Draft written/posted tonight or tomorrow AM (10am–2pm ET peak Reddit window)

If VPS slips: Reddit moves to Oct 21. App Store + organic SEO proceeds Oct 18 regardless. The opening-weekend hook has a 4–5 day shelf life max.

### P2 — SW PRECACHE Mismatch: Day 14

`sw.js` precaches `unpkg.com/babel@7.29.7`; `index.html` loads `cdnjs/babel@7.24.7`. Wasted bandwidth, no offline benefit for the actual loaded asset. Post-launch sprint. Code freeze holds.

### P2 — Gili Trawangan Duplicate

`beach_gilit` (LOP) + `gili-trawangan` (DPS) — same venue. No runtime crash, IDs are distinct. Delete `beach_gilit` post-launch. Code freeze holds.

---

## Resolved This Report

- ✅ **Open #22 (BASE_PRICES coverage)** — CLOSED. 186 airports defined, 152 distinct venue APs, 100% coverage. Was flagged at 68%. Done.

---

## Three Product Decisions — Oct 18

### Decision 1: Launch is today, but not complete until VPS ships.

The web product is ready. Organic SEO and App Store submission can proceed Oct 18 without VPS. The Reddit post cannot — it requires Val Thorens to surface on the front page.

**DECISION: Split the launch. Web goes live today (already is). r/travel post gates strictly on VPS. If VPS ships today, post tonight or tomorrow 10am ET. If not, Oct 21 is the next viable window (weekend traffic + still opening-weekend narrative).**

### Decision 2: BASE_PRICES Open #22 is CLOSED — remove from tracking.

It has been a standing open item for months. DevOps confirmed 100% coverage this morning. Stop allocating PM attention to a resolved issue.

**DECISION: Remove Open #22 from the open list in CLAUDE.md next networked session.**

### Decision 3: Post-launch sprint scope is locked to three items only.

The temptation after launch will be to ship everything. That's how you introduce regressions during the highest-scrutiny week of the product's life. Three items only, in order:

1. Fix SW PRECACHE mismatch (P2, 30-minute fix)
2. Fix Gili Trawangan duplicate (P2, one-line delete)
3. JSON-LD structured data (SEO, Week 2)

Everything else — photos, tag expansion, venue detail deep links, branch protection, JSON-LD — queues behind these three.

**DECISION: No app.jsx commits in the first 72 hours post-launch unless a P0 surfaces. Hold the freeze.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy** — `scp + pm2 restart`. 5 minutes. TODAY. Before the Reddit post.
2. **Delete `origin/master`** — 30 seconds. During the VPS SSH session.
3. **r/travel post** — Conditional on #1. Draft tonight, post tomorrow 10am ET if VPS ships today; Oct 21 if it slips.

---

## Features Rejected This Week

- **Venue photos sprint** (Open #20) — DEFER. 404 venues, 0 users. Post-1K task. Photos matter enormously but not before the first 200 people see the product.
- **Tag expansion** — DEFER. 55% thin-tag venues affects search recall but is invisible to a first-time user. Post-launch sprint, Week 2.
- **JSON-LD structured data** — DEFER. SEO payoff is 8–12 weeks out. After the launch spike, not during it.
- **Branch protection on `main`** — DEFER to immediately post-launch. This should have been done last week. Do it the moment the VPS session closes — it's a GitHub settings toggle, not a code change.
- **iOS deep links for venue detail sheets** — CUT. Decision from v160 stands. First-use UX doesn't need this. Revisit at 1K users.

---

## Success Criteria

**What defines success at 90 days:**
- 5K–8K users via organic SEO + r/travel + App Store
- 8K (not 5K) requires: r/travel post lands top 5 of thread + Val Thorens on front page on opening weekend + iOS App Store live within 2 weeks

**What has to be true for 8K:**
1. VPS ships before the r/travel post — Val Thorens must surface
2. r/travel post goes up Oct 18–21 (opening weekend energy decays by Oct 22)
3. App Store submission this month (review 1–3 days; window Oct 18–31)

**90-day projection: 5K–8K.** The gap between 5K and 8K is entirely VPS + the r/travel timing. Both are Jack's call today.

---

## One Product Risk Nobody Is Talking About

**The 16 `claude/` branches on origin are a silent liability.** Zero code review process, `deploy.yml` deploys both `main` and `master`. If any of those branches gets accidentally merged or rebased during post-launch chaos — one missed `--no-ff`, one wrong terminal tab — stale venue data or a broken component lands on the live site with zero warning while the r/travel thread is active. The fix isn't just deleting `master`; it's also enabling branch protection on `main` so merges require a PR. This is a 60-second GitHub settings toggle that has been deferred for 12 days. Do it during the VPS SSH session.
