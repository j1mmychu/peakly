# Peakly PM Report v186 — 2026-10-20 (LAUNCH DAY +2)

**Status: 🔴 RED → Day +2 post-launch. VPS Day 72. Val Thorens opening-weekend hook expires in 2 days (Oct 22–23). The r/travel post has not gone up. This is the last day it's urgent.**

> **Stale prompt notice — Day 14 (critical):** Stored cron still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage.** Jack: 2-minute cron edit. Every analysis from this prompt is miscalibrated by the stale premise.

---

## Shipped Since Last Report (v185 → v186)

| Commit | What | Right call? |
|--------|------|-------------|
| `95b262c` | DevOps Oct 20 — RED, VPS Day 72, 404 venues confirmed | ✅ reporting |
| `c19ae46` | Content Oct 20 — 89/100 (corrected tag count: 225 thin-tag venues) | ✅ reporting |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 36. Correct.**

DevOps today confirms **404 venues** — matches CLAUDE.md. Yesterday's 406 was a counting artifact. No action needed.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 72 🚨 FINAL CALL

The Val Thorens opening-weekend hook expires **tonight or tomorrow**. Oct 22 is the last credible window to post "opening weekend" framing on r/travel. Oct 23+ is just another alps post.

Broken on the live VPS right now:

| # | Broken feature | User impact |
|---|---|---|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. High-altitude venues score `confidence:"low"` — filtered off front page. Val Thorens may be invisible on launch day. |
| 2 | `capacitor://localhost` missing from CORS | Every iOS native API call blocked. App Store is a broken experience. |
| 3 | `DELETE` absent from Allow-Methods | Alert deletion silently fails on every device, Day 1. |
| 4 | `_wxCache` in-memory only | r/travel spike + cold restart = Open-Meteo rate-limited = "conditions unavailable" for every new user during the 10-minute window that makes or breaks the thread. |

Fix is committed. 3 commands, under 5 minutes:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expect post-deploy: `"forecast_days": 14`, `"disk_cache": true`.

### P0-B — `origin/master` Footgun: Day 13 🚨

50+ commits behind `main`. `deploy.yml` deploys both branches. Accidental push to master during post-launch activity rolls the live site back to May while the r/travel thread is active.

30-second fix:

```bash
git push origin --delete master
```

Do this in the same terminal session as the VPS deploy.

### P1 — Tag Quality: 225/404 Venues at 2 Tags (55.7%)

Content corrected their count today — it's 225 thin-tag venues, not 91. `scoreVibeMatch` and search recall are degraded for more than half the catalog. This is a Week 2 post-launch task, not an emergency, but the magnitude is worse than previously understood.

### P2 — SW PRECACHE Mismatch: Day 16

`sw.js` precaches Babel 7.29.7, `index.html` loads Babel 7.24.7. Wasted bandwidth, no offline benefit for the asset users actually load. Fix in the first post-freeze sprint, Oct 23+.

### P2 — Gili Trawangan Duplicate

`beach_gilit` (LOP) + `gili-trawangan` (DPS). No crash. Post-launch, single-line delete.

---

## Three Product Decisions — Oct 20

### Decision 1: Oct 20 is the last day to ship the r/travel post with a seasonal hook.

If VPS ships today, post tonight or tomorrow morning (Oct 21 AM ET is ideal — weekday morning, r/travel peak traffic). If VPS doesn't ship today, the Val Thorens hook is gone by Oct 22. Next natural hook is Whistler early-season (~Nov 10) or Alps mid-season (~Dec 1). Both are 3–6 weeks out and neither has the same "opening weekend" moment.

**DECISION: r/travel post goes up today or tomorrow only if VPS ships first. If VPS slips past Oct 21, defer the post to the next natural hook (Whistler, ~Nov 10) and stop treating the Val Thorens window as recoverable. Posting without VPS risks a rate-limit apocalypse on the first wave of users — that's worse than a delayed post.**

### Decision 2: Code freeze lifts Oct 23 for the post-launch sprint.

The freeze has been right. The product is stable. The three post-launch sprint items are known (PRECACHE fix, Gili Trawangan dedup, JSON-LD structured data). The 225 thin-tag venues are now the biggest quality gap in the catalog and need a fix window.

**DECISION: Code freeze lifts Oct 23. First sprint: PRECACHE fix + Gili Trawangan + JSON-LD. Second sprint: tag enrichment for the 225 thin-tag venues (batch of 50 at a time, validate with validate-venues.mjs). No new features until these three ship.**

### Decision 3: The 5 new seasonal venues from Content are queued, not prioritized.

Content shipped 5 well-formed venue objects today (Stubai Glacier + 4 others). All pass the airport coverage check. All serve the early-ski moment. The catalog is at 404 — quality (tags) matters more than quantity right now.

**DECISION: The 5 Content venues are DEFERRED to the Oct 23 post-launch sprint, behind PRECACHE + Gili dedup. They're good work, but 404 venues with 55% at 2 tags is worse than 409 venues with the same problem. Fix the existing catalog first.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy** — `scp + pm2 restart`. TODAY. 5 minutes. Day 72.
2. **Delete `origin/master`** — do it in the same terminal session. No separate step.
3. **r/travel post** — tonight or Oct 21 AM ET if VPS ships. Otherwise, no hook; schedule for Whistler (~Nov 10).

Everything else waits until Oct 23.

---

## Features Rejected This Week

- **5 new venue objects (Content)** — DEFER to Oct 23 sprint, behind tag enrichment. 404 → 409 adds less value than improving tag quality on existing 225 thin-tag venues.
- **Venue photos sprint** — DEFER. Post-1K. Zero users to impress right now.
- **JSON-LD / structured data** — DEFER to Oct 23 sprint. SEO payoff 8–12 weeks out.
- **Branch protection on `main`** — DEFER to VPS SSH session. Has been deferred 14 days. Do it then.
- **iOS venue deep links** — CUT. Decision from v160 stands. Revisit at 1K users.
- **Peakly Pro pricing fix ($9/mo vs $79/yr)** — CUT. Pro UI was removed. This prompt references a removed feature. No action.
- **Sentry DSN** — NOT a bug. DevOps confirms it's configured. This prompt's premise is wrong.

---

## Success Criteria

**What defines success at 90 days:**
- 5K–8K users via organic SEO + r/travel + App Store
- For **8K not 5K**: VPS ships today, r/travel post goes up Oct 20–21, Val Thorens is on the front page and scoring correctly
- For **5K only**: VPS ships eventually, r/travel post goes up on next hook, organic SEO does the work

**The difference between 8K and 5K is one SSH session that has been available for 72 days.**

---

## One Product Risk Nobody Is Talking About

**The tag quality problem just got worse.** Content's corrected count shows 225/404 venues (55.7%) have only 2 tags. `scoreVibeMatch` — the filter that lets users say "I want powder + après ski" or "remote beach + surfing" — is degraded on more than half the catalog. This isn't a data gap, it's a UX gap: users who filter by vibe and get weak matches will assume the product doesn't know their preference, not that the venues are under-tagged. It silently erodes retention for users who explore beyond the first-card defaults. The fix exists (Content has the batch format, validate-venues.mjs handles validation) but it requires a post-freeze session and systematic effort. If the r/travel post drives 500+ users and 20% try vibe filtering, a significant chunk get a mediocre match result from day one. That's the retention risk that doesn't show up in the launch checklist.
