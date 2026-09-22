# Peakly PM Report v158 — 2026-09-22

**Status: 🔴 RED — VPS Day 44. Oct 18 launch confirmed. 26 days. Code freeze Day 9. No regressions.**

---

## Shipped Since Last Report (v157 → v158)

| Commit | What | Right call? |
|--------|------|-------------|
| `8db84de` | Content report Sep 22 | ✅ Routine. BASE_PRICES confirmed 100% coverage — resolves Open #22. |
| `1f3f3d2` | DevOps report Sep 22 (RED) | ✅ Flagged new `origin/master` branch (19 stale total). |

**Zero code commits since `bb3ebc8` (Sep 13). Nine days clean. Code freeze holds.**

---

## Bug Triage

### P0s — None (code side)

### P1 — VPS Redeploy: Day 44, 26 Days to Launch

Every day this sits undeployed is a day the app doesn't work as designed. Features broken since Aug 11:

| Feature | User Impact |
|---------|-------------|
| Two-weekend scoring | Front page shows one weekend instead of two |
| iOS native proxy | 403 on every native pricing/weather call |
| Alert deletion | Silently fails; alerts stack forever |
| Weather cache persistence | Cold start after restart hits Open-Meteo directly for all 404 venues |
| Rate limiter accuracy | Forgeable XFF — Open-Meteo ban risk during traffic spike |

**The fix: one 5-minute SSH session. The code has been committed and ready since Aug 11.**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
```

**Jack: this is the only blocker that requires you. Everything else is handled.**

### P1 — 19 Stale Remote Branches (One New: `origin/master`)

`origin/master` appeared yesterday — this is now 19 total. Unknown origin; likely a push to the wrong branch from somewhere. No merged code. Cleanup deadline passed Sep 20. Still targeting Oct 5 bundle unless Jack wants to burn it in the next 5 minutes.

**Flag: `origin/master` should be audited before deletion** — confirm it contains no unmerged work.

### P1 — Tag Density: 225 Venues at ≤2 Tags, Day 18

Deferred to Oct 5 content run. No change. Hold.

### P2 — S-Hemisphere Ski Season Closing This Week

Cardrona, Mt Hutt, Las Leñas, Cerro Catedral at end of season. `lateSeason` gate self-manages. No intervention needed. Expect these venues to naturally deprioritize. Not a bug.

### P3 — dist/ Build Collision (Day 14)

CI rebuilds correctly on push. Non-blocking.

---

## Three Product Decisions — Sep 22

### Decision 1: VPS deploy is a pre-content-run requirement, not a pre-launch requirement.

Previous framing made this "launch blocker" which it technically is — but the more precise framing is: **the VPS must be deployed before the Oct 5 content run**, not just before Oct 18. The reason: the Oct 5 content run adds 17 venues and fixes 225 tag entries. If the VPS cache wipes during that run's deploy (pm2 restart + cold cache + 421 venues all fetching at once), we hit Open-Meteo rate limits during the one moment we need the app to prove its data pipeline.

**Decision: VPS deploy deadline is Oct 4 (one day before content run). If it slips past Oct 4, hold the Oct 5 run until after VPS is confirmed deployed. No exceptions.**

### Decision 2: `origin/master` branch — investigate before Oct 5, delete if clean.

19 branches is noise. The new `origin/master` is unknown origin and worth 2 minutes to check. If it's a push accident (no unmerged work, diverges from main only in report commits), delete it. If it has unmerged code, it gets the same treatment as every other stale branch — audit, archive if needed, delete.

**Decision: `origin/master` gets audited before the Oct 5 cleanup run. If it contains anything, escalate to Jack immediately.**

### Decision 3: Reddit r/solotravel post on Oct 18 is unconditional. Lock the copy now.

The beach story is strong regardless of ski viability. 270 venues. Tropical prime season starting. No "is there snow yet?" uncertainty. r/solotravel on Oct 18 is the safe, high-confidence launch bet.

**Decision: Begin drafting the r/solotravel Reddit post now. Don't wait for Oct 5. One clean post, not a pitch — "I built this, here's what it does." 150 words max. Show a screenshot of a beach venue with a score and a real price. Draft lives in `reports/` not committed to `app.jsx`.**

---

## This Week's Top 3

1. **VPS deploy** — Jack, 5 minutes, must happen by Oct 4. Single highest-leverage action. Every other item unblocks after this.
2. **Audit `origin/master`** — 2 minutes. Don't let an unknown branch sit unexamined for 2 more weeks.
3. **Draft r/solotravel Reddit post** — 30 minutes. The Oct 18 launch copy should exist before Oct 5. Writing it now forces clarity on the product pitch before the content run, not after.

---

## Features REJECTED This Week

- **Any code change before Oct 5** — code freeze, no exceptions.
- **APNS wiring** — post-launch v2. Uncommitted local fix can wait until after v1 ships.
- **Branch cleanup before Oct 5** — still bundle with content run. One exception: if `origin/master` has unmerged code, that's an immediate escalation, not a scheduled cleanup.
- **New venue proposals** — 17 queued. Batch discipline holds. No individual adds.
- **JSON-LD / static h1 fallback SEO** — DEFER until post-launch. SEO score is 81%, good enough for launch. Marginal SEO improvements don't move the needle on a Reddit launch.

---

## Success Criteria

### What defines success

- **Launch day (Oct 18):** 500+ unique visitors, <30% bounce, 50+ wishlists saved.
- **Week 1:** 1,000 registered users, 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K, not 5K

Same three variables. One now tighter on timing:

1. **Live flight pricing on launch day.** VPS deployed by Oct 4. LIVE badges in first Reddit screenshots. This is the screenshot people share — `~$350` vs `$312 LIVE` is the difference between "nice app" and "this actually works."
2. **Tags feel rich on Explore.** Oct 5 run fixes 225 beach venues. A card with 2 generic tags bounces; a card with 4-5 specific tags (powder, treeline, après, groomed) makes the app feel curated.
3. **Traffic spike survives.** VPS weather cache is the only Open-Meteo rate-limit protection. Without it, 66+ simultaneous DAU hits the free-tier ceiling. The Oct 18 Reddit post could generate a spike in the first 30 minutes that kills the app for everyone who clicks.

All three still come down to one SSH session before Oct 5.

---

## One Product Risk Nobody Is Talking About

**The launch screenshot problem.**

When someone posts about Peakly on Reddit, the first thing people see is a screenshot. That screenshot will show whichever venue is at the top of the Explore grid — and 346 of 404 venues still have generic stock photos with zero connection to the actual place.

If the Oct 18 screenshot shows "Whistler" with a stock photo of *some mountain*, a r/skiing commenter will immediately post "that's not Whistler" and the thread becomes about photo accuracy, not the product. The product fails its first impression in the medium where first impressions are everything.

The Oct 5 content run is the last chance to fix at least the top 10-15 marquee venues (the ones most likely to surface on launch day based on score + location + season). Whistler, Chamonix, Zermatt, Bora Bora, Maldives — venues where a wrong photo is instantly recognizable to the target audience.

**Mitigation:** Add a "top 15 venue photo audit" to Oct 5 content run scope. The Unsplash script exists (`scripts/photos-fetch.mjs`). This requires `UNSPLASH_KEY` which Jack has. 2 hours of work with the pipeline already built. The downside of not doing it is a bad first screenshot on launch day.

**This is the one thing on the Oct 5 scope that should be added, not deferred.**

---

*Report generated 2026-09-22 by the daily PM agent. v158.*
