# Peakly PM Report v182 — 2026-10-16

**Status: 🔴 RED — VPS Day 68. Launch is Saturday Oct 18. T-2 days. `origin/master` footgun Day 10. r/travel draft still not confirmed. Code freeze Day 32 clean.**

> **Stale prompt — Day 10 (critical at T-2):** Scheduled routine still injects false signal: "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: 404 venues, 2 categories (skiing + beach only), Peakly Pro cut entirely, Sentry live. At T-2 days, stale context in launch-week analysis is a real risk. Jack: update the cron task. This is a 2-minute fix that stops ten daily reports from having to manually correct ghost data.

---

## Shipped Since Last Report (v181 → v182)

| Commit | What | Right call? |
|--------|------|-------------|
| `c83826e` | Content Oct 16 — 91/100, Val Thorens opens tomorrow | ✅ |
| `8c7283f` | DevOps Oct 16 — RED, VPS Day 68 | ✅ |

**Zero app.jsx / sw.js / index.html commits. Code freeze Day 32. Correct. The product is done.**

Val Thorens opens **tomorrow** (Oct 17). The r/travel hook is live — opening weekend skiing in the French Alps. It won't appear on the Peakly front page without the VPS deploy. These two facts are the entire launch-day story.

---

## Bug Triage

### P0-A — VPS Redeploy: Day 68 (T-2)

The window isn't closed — it's now emergency-only. Deploying today gives 48 hours of warm-up before Saturday traffic. Deploying tomorrow gives 24 hours. Either still beats launching cold.

**What breaks on Oct 18 without this (specific, user-visible):**

| Break | User impact |
|-------|-------------|
| `forecast_days: 7` not 14 | Two-weekend scoring disabled. The headline feature on the front page shows one weekend window, not two. Val Thorens doesn't surface — `confidence: "low"` filtered. The r/travel peg collapses. |
| No `capacitor://localhost` CORS | Every iOS App Store user gets a broken product. All proxy calls fail silently. App Store launch ships broken. |
| `DELETE` missing from CORS | Alert deletion silently fails. Users delete alerts, alerts stay live. Hidden by `.catch(()=>{})`. |
| In-memory `_wxCache` | Cold cache on Reddit spike = Open-Meteo rate limit within minutes. Every user who clicks the r/travel link gets "conditions unavailable." |

**The fix is 5 minutes:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: forecast_days:14, disk_cache:"enabled", uptime <60s
```

If `forecast_days` returns 7 — old file is still running. Re-scp and restart again.

### P0-B — `origin/master` Footgun: Day 10 (30 seconds to fix)

50 commits behind `main`. `deploy.yml` deploys both. A stale push to `master` on launch day rolls the live site back to May. No alerting exists. First signal would be users reporting broken venues and wrong venue counts during the Reddit spike.

This is a 30-second fix. There is no argument for waiting:
```bash
git push origin --delete master
```

Do this before or immediately after the VPS session.

### P1 — r/travel Draft: Status Unknown

Was due Oct 12. If it doesn't exist today, it will be written Oct 17 with zero review time. The draft is gated on VPS: the Val Thorens hook requires Val Thorens to actually appear on the front page. If VPS isn't deployed today, the draft can't be finalized anyway — the CTA ("see Val Thorens on Peakly this weekend") would be false.

**Minimum viable draft structure (30 minutes):**
1. Hook: Val Thorens opening weekend — opening day is tomorrow (Oct 17)
2. What Peakly does in one sentence
3. Link + single CTA: no secondary asks
4. One image if available

### P2 — SW PRECACHE Mismatch: Day 12

`sw.js` precaches `app.jsx`; production serves `dist/app.min.js`. Post-launch sprint. Code freeze blocks.

### P2 — Venue Count Discrepancy

DevOps: 404. Content: 404. Resolved. Both confirmed via bracket counting. Authoritative: 404 (134 skiing / 270 beach). The earlier 406 was a stale DevOps read.

---

## Three Product Decisions — Oct 16

### Decision 1: VPS ships today or we admit Oct 18 is a partial launch.

Not a decision to "try." Binary: either `scp + pm2 restart` happens today, or the product launches Saturday with:
- No Val Thorens on the front page
- iOS users getting CORS errors
- Alert deletion broken
- Cold cache on the first traffic spike

**DECISION (Jack's call): Ship VPS today, or publicly acknowledge we're launching a degraded product and tell the first wave of users the proxy will be fixed within the week. Silence is not a decision. One or the other, today.**

### Decision 2: The r/travel post ships if and only if VPS is done.

The Val Thorens peg is the entire hook. Val Thorens won't show on the front page without the 14-day forecast window. Posting "check Val Thorens on Peakly this weekend" with a product that doesn't show Val Thorens is worse than not posting at all — the first reply burns credibility that took months to build.

**DECISION: r/travel post is conditional on VPS confirmed healthy. If VPS ships today → write the draft tonight, post Saturday morning. If VPS slips → move Reddit launch to Oct 21. Product launch (App Store + organic) still happens Oct 18 either way.**

### Decision 3: The 16 `claude/` branches need a decision before launch weekend.

They exist on `origin`. Any of them can be accidentally merged via GitHub UI during launch chaos. Most represent unvetted AI-generated changes to app.jsx. Post-launch sprint is fine for cleanup, but `branch protection on main` takes 30 seconds in GitHub settings and blocks accidental merges.

**DECISION: Enable "Require PR review before merge" on the `main` branch in GitHub repo settings before Oct 18. 30 seconds. Prevents a category of disaster that has no detection mechanism in the current setup.**

---

## This Week's Top 3

1. **VPS deploy OR explicit decision to launch degraded.** Jack: `scp + pm2 restart`. 5 minutes. Today. Bundle with `git push origin --delete master` (30 seconds).
2. **r/travel draft.** Only if VPS is confirmed. 30 minutes. Post it Saturday morning.
3. **Branch protection on `main`.** GitHub settings → Branches → Require review before merge. 30 seconds.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|---------|
| Any app.jsx/sw.js change | Code freeze Day 32. Post-launch. |
| Merging any `claude/` branch | Unvetted, launch week. Post-launch audit. |
| Gili Trawangan dedup | Code freeze. Post-launch sprint #3. |
| Tag depth fix (225 thin venues) | Code freeze. Post-launch sprint #1. |
| SW PRECACHE fix | Code freeze. Post-launch sprint #2. |
| JSON-LD structured data | Not a launch blocker. Post-launch. |
| BASE_PRICES audit | Content confirmed 165/165 coverage. Non-issue. |
| New venue additions | 5 in queue (Content). Post-launch sprint #5. |
| App Store submission | Unblocked by iOS widget + capacitor work — this is actually ready. Is Jack submitting before Oct 18? Silence = no. |

---

## Post-Launch Sprint Order (confirmed)

1. Tags — 225 thin-tag venues (unblocks `scoreVibeMatch`, search recall)
2. SW PRECACHE — point at `dist/app.min.js`
3. Gili Trawangan dedup — delete `beach_gilit`
4. Photos — 346 venues still generic stock
5. New venues — 5 post-launch queue items (Content)
6. `claude/` branch audit — 16 branches need triage

---

## Success Criteria

**5K vs 8K at 90 days — the swing factor:**

5K path: Organic + App Store discovery. No Reddit. Generic photos. Thin tag search. No Val Thorens story.

8K path: VPS live → Val Thorens on front page → r/travel post lands cleanly → product delivers what the post promises → word-of-mouth compounds. The entire delta is in the next 24 hours.

The product quality is there. The infrastructure gap is one SSH session.

---

## One Product Risk Nobody Is Talking About

The stale scheduled-task prompt. It's been running for 10 days with ghost context: 182 venues, 12 categories, Peakly Pro at $9/mo, Sentry empty. Each daily run has to manually correct this noise before any real analysis can happen. At T-2 days, the risk isn't cosmetic — it's that a report with incorrect baseline facts (wrong venue count, wrong revenue model) could drive a wrong product call. The prompt author (an authorized session on this account) stored text that was accurate in May. It isn't now. Five months of product changes are invisible to the cron context.

The immediate fix is trivial (update the stored cron prompt — 2 minutes). The deeper issue: scheduled tasks that run on stale context are a quiet category of PM failure. They produce reports that look right but are subtly wrong, and nobody catches it until something ships that shouldn't have. The 10-day streak is proof this pattern persists.

---

**v182 close: T-2 days. Val Thorens opens tomorrow. The product is done. The VPS window is now or never. One SSH session separates a complete launch from a degraded one.**
