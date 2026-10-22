# Peakly PM Report v188 — 2026-10-22 (LAUNCH DAY +4)

**Status: 🔴 RED — VPS Day 74. Val Thorens hook is dead. Next window: Whistler ~Nov 10 (19 days). Same two P0s as yesterday. This report will be identical to v189 if the VPS doesn't ship.**

> **Stale prompt notice — Day 16 (critical):** Stored cron still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100% coverage.** Jack: 2-minute cron edit or these reports keep opening with a wrong premise.

---

## Shipped Since Last Report (v187 → v188)

| Commit | What | Right call? |
|--------|------|-------------|
| `cae6559` | DevOps Oct 22 — RED, VPS Day 74, Val Thorens hook gone | ✅ reporting |
| `c819fe5` | Content Oct 22 — 89/100, code freeze Day 38, Whistler window 19 days | ✅ reporting |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 38. Correct.**

Val Thorens expired Oct 22 AM as predicted. The last viable post day passed without the VPS shipping. That's the whole story.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 74 🚨 WHISTLER WINDOW = 19 DAYS

Val Thorens is gone. The next seasonal hook is Whistler early-season (~Nov 7–14). Four broken features on the live VPS (Aug 11 build):

| # | Broken feature | User impact |
|---|---|---|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. Early-season venues score `confidence:"low"` → filtered off front page |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked |
| 3 | `DELETE` absent from Allow-Methods | Alert deletion silently fails on every device |
| 4 | `_wxCache` in-memory only | Reddit spike → cold restart → Open-Meteo rate-limited = "conditions unavailable" for all new users |

Fix is committed. 3 commands, 5 minutes:
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

### P0-B — `origin/master` Footgun: Day 15 🚨

`origin/master` 50+ commits behind `origin/main`. `deploy.yml` deploys both. One bad push during a live Reddit session = full rollback to May.

```bash
git push origin --delete master
```

### P1 — Tag Quality: 225/404 thin (55.7%)

`scoreVibeMatch` and search recall degraded for majority of catalog. First post-freeze sprint.

### P2 — SW PRECACHE Mismatch / Gili Trawangan Dup

Bundle into Oct 23 sprint. Neither blocks launch.

---

## Three Product Decisions — Oct 22

### Decision 1: Val Thorens is done. Redirect to Whistler.

**DECISION: Val Thorens window is forfeit. Whistler early-season (~Nov 7–14) is the new deadline. The VPS must deploy by Nov 5 to leave buffer for a smoke-test. This is a hard date, not a suggestion. Nov 10 with a broken VPS is a repeat of Oct 18 with a broken VPS — same outcome.**

### Decision 2: Code freeze lifts Oct 23.

The freeze is 38 days old. Sprint order: (1) PRECACHE fix, (2) Gili Trawangan dedup, (3) JSON-LD + static h1, (4) tag enrichment batch 1 (50 venues). Strict scope — no new features, no new venues until the quality items land.

**DECISION: Code freeze lifts Oct 23. Venue additions wait until tag enrichment batch 1 is done.**

### Decision 3: The Reddit post needs to be written NOW — before VPS ships.

The post isn't in a draft anywhere in this repo. The VPS will ship and the post still won't exist. Whistler's angle is: "First powder weekend of the season — Peakly shows you if it's actually worth booking." That's a /r/skiing + /r/frugaltravel angle, not just /r/travel. A good draft takes 30 minutes. Write it while waiting on VPS.

**DECISION: Draft the r/skiing Whistler post and save it to `reports/ready-to-ship/whistler-reddit-post.md` before Nov 5. Format: show the actual weekend score UI, the confidence badge, the flight price. Proof of concept, not pitch.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy** — hard deadline Nov 5 (5 days before Whistler window). 3 commands.
2. **Delete `origin/master`** — same terminal session. 30 seconds.
3. **Write the Whistler Reddit post** — can be done now, no VPS required.

---

## Features REJECTED This Week

- **New venues before tag enrichment** — REJECTED. 225 thin-tag venues is the bigger quality gap. Adding 5 more thin-tag venues makes it worse, not better.
- **Any feature work before VPS + master cleanup** — REJECTED. Two P0s on the board. Nothing ships until they're closed.
- **Stale cron prompt update (by PM)** — The PM agent cannot update the stored cron prompt. Jack: 2-minute fix in the Claude.ai interface. Listed for awareness not action from this report.

---

## One Product Risk Nobody Is Talking About

**Whistler may not open on schedule.** Early-season ski openings are weather-dependent. Nov 10 is when Whistler historically opens — it could be Nov 3 or it could be Nov 21. If Whistler gets a big November dump early, the window compresses to days, not weeks. If it's late, the whole editorial angle weakens. The product risk: this report is treating "Whistler ~Nov 10" as a fixed anchor when it's a probabilistic range. Solution: monitor Whistler snowpack reports starting Nov 1 and be ready to post within 24h of a confirmed opening date, not 19 days from now. The flexibility to act fast is a function of having the VPS deployed and the Reddit post pre-drafted. Without either, speed is impossible.

---

## Success Criteria

**90-day projection: 5K–8K users. What gets us to 8K, not 5K:**

1. **Whistler post lands in top 10 of /r/skiing on opening day** — not just posted, but timed to the hour. The best ski Reddit posts go up the morning of the first powder day, not the week before.
2. **VPS ships so Whistler actually appears on front page** — right now it scores `confidence:"low"` with `forecast_days:7`. New users from Reddit need to see the venue that was the hook.
3. **Tag enrichment improves search recall** — 225 venues returning bad vibe matches → churn on second visit. Sprint Oct 23+.
4. **JSON-LD + structured data** — 3-week SEO compound lag. Earliest benefit is December. Ship it in the Oct 23 sprint.

The difference between 5K and 8K is still the same: whether the first Reddit post creates a loop (saves → return visits → shares) or a one-day spike. The loop requires the product to deliver on the promise of the post. The Whistler hook promises "know if it's worth booking this weekend." The product delivers that — but only if the VPS is running `forecast_days:14` so the front page shows Whistler with a high-confidence score on the weekend someone's deciding.
