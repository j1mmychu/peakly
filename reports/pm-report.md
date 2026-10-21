# Peakly PM Report v187 — 2026-10-21 (LAUNCH DAY +3)

**Status: 🔴 RED — VPS Day 73. Val Thorens hook expires TODAY (Oct 22 is the last morning; Oct 21 PM ET is post time if VPS ships in the next few hours). This report has been saying the same thing for 3 days. Either it ships tonight or the window is gone.**

> **Stale prompt notice — Day 15 (critical):** Stored cron still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage.** Jack: 2-minute cron edit. Every analysis from this prompt is miscalibrated by a stale premise.

---

## Shipped Since Last Report (v186 → v187)

| Commit | What | Right call? |
|--------|------|-------------|
| `4aacbbf` | DevOps Oct 21 — RED, VPS Day 73, Val Thorens hook expires tomorrow | ✅ reporting |
| `b8ef50e` | Content Oct 21 — 89/100, code freeze Day 37, 225 thin-tag venues | ✅ reporting |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 37. Correct.**

No feature work. No regressions. The product is stable. The only thing missing is the VPS deploy that's been committed to disk since Aug 11.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 73 🚨 TONIGHT IS THE LAST WINDOW

The Val Thorens "opening weekend" hook expires Oct 22. That's **today in the US** — an r/travel post on Oct 21 PM or Oct 22 AM ET catches the day-trip planners. Oct 23 is a normal alps post with no hook.

Broken on the live VPS right now:

| # | Broken feature | User impact |
|---|---|---|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. Val Thorens scores `confidence:"low"` → filtered off front page on launch day |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store = broken experience |
| 3 | `DELETE` absent from Allow-Methods | Alert deletion silently fails on every device |
| 4 | `_wxCache` in-memory only | Reddit spike → cold restart → Open-Meteo rate-limited = "conditions unavailable" for every new user |

Fix is committed. 3 commands, under 5 minutes:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expect: `"forecast_days": 14`, `"disk_cache": true`.

### P0-B — `origin/master` Footgun: Day 14 🚨

50+ commits behind `main`. `deploy.yml` deploys both. An accidental push rolls the live site back to May while the r/travel thread is live.

30-second fix (do this in the same terminal session as the VPS deploy):
```bash
git push origin --delete master
```

### P1 — Tag Quality: 225/404 venues at 2 tags (55.7%)

This is the biggest catalog quality gap. `scoreVibeMatch` and search recall are degraded for more than half the catalog. Not blocking launch — the venue still renders and scores correctly. Week 2 sprint target (Oct 23+).

### P2 — SW PRECACHE Mismatch

`sw.js` precaches Babel 7.29.7, `index.html` loads Babel 7.24.7. Wasted bandwidth, no offline benefit. Oct 23 sprint.

### P2 — Gili Trawangan Duplicate

`beach_gilit` (LOP) + `gili-trawangan` (DPS). No crash, no user impact. Single-line delete in Oct 23 sprint.

---

## Three Product Decisions — Oct 21

### Decision 1: Val Thorens window closes tonight.

This report has flagged "VPS tonight" for 3 consecutive days. The hook was "opening weekend" — today is the last day that's true. Tomorrow it's stale.

**DECISION: If VPS ships by midnight ET tonight → post r/travel by Oct 22 AM ET. If VPS doesn't ship by midnight → Val Thorens window is forfeit. Next hook: Whistler early-season (~Nov 10) or first major snowfall. Stop re-scheduling. One of these two outcomes happens tonight.**

### Decision 2: Code freeze lifts Oct 23 regardless of VPS status.

The freeze is 37 days old and has served its purpose. The post-launch sprint items are small and known: PRECACHE fix, Gili dedup, JSON-LD structured data, tag enrichment for 225 thin-tag venues.

**DECISION: Code freeze lifts Oct 23. Sprint order: (1) PRECACHE fix, (2) Gili Trawangan dedup, (3) JSON-LD + static h1, (4) tag enrichment batch 1 (50 venues). No new features until these ship.**

### Decision 3: The 5 queued Content venues are still DEFERRED.

Quality before quantity. 404 venues with 55% thin-tag is worse than 409 venues with the same problem.

**DECISION: 5 queued venues (Stubai Glacier + 4 others) DEFERRED until tag enrichment batch 1 is done. They're well-formed and ready — they wait.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy** — 3 commands, tonight. This is day 73. The window is now.
2. **Delete `origin/master`** — same terminal session. 30 seconds.
3. **Oct 23 sprint kickoff** — PRECACHE + Gili dedup. Small, safe, known.

---

## Features REJECTED This Week

- **JSON-LD structured data (pre-freeze)** — DEFERRED, not rejected. Good SEO value, ~2hr work. Belongs in Oct 23 sprint, not before launch.
- **Static h1 fallback** — DEFERRED. Same sprint as JSON-LD, bundle them.
- **New venues before tag enrichment** — REJECTED. 225 thin-tag venues is a worse user experience than the catalog gap. Fix quality first.
- **Any feature work before VPS + master cleanup** — REJECTED. Two P0s on the board. Nothing else ships until they're closed.

---

## One Product Risk Nobody Is Talking About

**The r/travel post itself.** Everyone's treating it as a solved problem gated only on VPS. It's not. A Reddit post lives or dies in the first 2 hours. The framing, the hook, the subreddit choice, the comment velocity — these matter as much as the product. We have a seasonal hook (Val Thorens opening weekend). We have a genuine product story (first app that combines conditions + flights + a confidence flag). Neither of those is in a draft post anywhere in this repo. The VPS ships and then the post needs to be actually good, not just posted.

---

## Success Criteria

**90-day projection: 5K–8K users. What gets us to 8K, not 5K:**

1. **r/travel post lands in the top 10 of the day** — not just posted, but hooks and holds. Val Thorens framing is the strongest seasonal angle available. This week or Whistler.
2. **VPS ships so Val Thorens actually appears on the front page** — right now it scores `confidence:"low"` with `forecast_days:7` and gets filtered. New users arriving from Reddit need to see the venue that was the hook.
3. **Tag enrichment gives search recall** — 225 venues returning wrong vibe matches → users who search "zen" or "party" get bad results → churn. Fix in Oct 23 sprint.
4. **JSON-LD + structured data** — SEO compound effect. A 81% SEO score with structured data is meaningfully better organic discovery in ski/beach trip searches. 3-week lag before it shows.

The difference between 5K and 8K is whether the r/travel post creates a real growth loop (saves → return visits → shares) or just delivers a one-day spike. That loop requires the product to be fast, honest, and visually compelling on first hit. It currently is — the VPS is the only thing that breaks it.
