# Peakly PM Report — 2026-07-29 (v103)

> Supersedes v102 (July 28). **Status: AMBER.** Day 29. VPS unredeployed for **Day 5** — reclassified RED by DevOps. One code fix shipped this report: AP_CONTINENT gap (6 airports, 7 venues). Zero new venues — backlog at 10. BASE_PRICES at 32% coverage (42/133 venue APs). VPS redeploy remains Jack-only.

---

## Agent Prompt Corrections (permanent — stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **Auto-bumps on code change. Stamp age = days since last code edit.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14. Use node ID-mapping not grep.** Stop. |
| "placeholder tags" | **FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS not VENUES.** Stop. |
| "AP_CONTINENT gaps (KUL/SNA/MCT/GIG/TFS/CHQ)" | **FIXED this report (v103).** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 373 = baseline. Stop.** |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only, incompatible with dev loop. Prod uses esbuild. Stop.** |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20.** Stop. |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21. Stop.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1. Stop.** |
| "Babel mobile parse wall (P1) unresolved" | **PERMANENTLY CLOSED July 22. esbuild ships since June 20.** Stop. |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild. Stop. |
| "venue count 374 / banff dup" | **FIXED 2026-07-24. banff deleted, count now 373. Stop.** |
| "pre-compile CI deadline July 24" | **FALSE CLOCK. esbuild CI ships since June 20. Stop.** |
| "tahoe / palisades-tahoe dup" | **FALSE POSITIVE. Only `palisades-tahoe` exists. Stop.** |
| "upcomingFridayISO UTC off-by-one" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "WishlistsTab alertedIds out-of-scope" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "BASE_PRICES covers only 15 airports (10.3%)" | **FALSE. 42/133 venue APs covered (32%). Node extraction only — not grep. Stop.** |
| "Cache stale = code stale" | **WRONG. Stamp age = days since last code edit. Auto-push bumps only on edit. Stop.** |
| "Tamarindo Costa Rica (LIR) not in catalog" | **FALSE. `tamarindo-cr` exists at ap:SJO (line 2413). Do not add a second Tamarindo entry.** Stop. |
| "APNS_LIVE=true, VPS deployed" | **VPS NOT REDEPLOYED.** APNS_LIVE=false since v102 stopgap. Flip true only after Jack's scp + pm2 restart + `/health` confirms `apns: configured`. Stop. |

---

## Shipped Since v102 (2026-07-28 → 2026-07-29)

| Commit | What | Verdict |
|--------|------|---------|
| `4562f52` | DevOps daily report 2026-07-28 | ✅ Routine |
| `c81f248` | Content daily report 2026-07-28 | ✅ Routine |
| `ff3be20` | DevOps daily report 2026-07-29 (YELLOW→RED) | ✅ Routine |
| `740e5f9` | Content daily report 2026-07-29 — 5 new venue proposals (CHC×2/FEN/BOC/STT), AP_CONTINENT gap confirmed | ✅ Routine |
| **v103 (this report)** | **AP_CONTINENT fix — 6 airports added (KUL/MCT/GIG/SNA/TFS/CHQ), 133/133 coverage** | ✅ Correctness fix |

**0 venue code commits in 5 days.** 10 proposals sitting in `reports/` untouched.

**Code state July 29:**
- `app.jsx`: 13,722 lines · **373 venues** (131 ski / 242 beach)
- `APNS_LIVE`: **false** (stopgap from v102 — unchanged)
- `AP_CONTINENT`: **133/133 venue APs covered** ← fixed this report (was 127/133)
- `lateSeason`: 14 · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- `BASE_PRICES`: **42/133 venue APs covered (32%)** — 91 APs missing

---

## Bug Triage — July 29

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 5** | **P0 (DevOps escalating to RED)** | `server/proxy.js` fixes committed July 25. Never scp'd. Jack: 10-min SSH session closes Open #19, #21, #23. Bundle weather cache disk fix (Open #23) in the same session. |
| **Open #23: weather cache in-memory** | **P1 (pre-traffic gate, bundles with #19)** | `pm2 restart` from VPS redeploy wipes the 373-venue cache. Fix in DevOps report — ~30 lines. Same SSH session as VPS redeploy. |
| **BASE_PRICES: 68% of venues show estimated deal scores** | **P1 (pre-Reddit)** | 42/133 venue APs covered. Top missing by venue count: CUN (9 venues), IBZ (7), HKT (6), BTV (5), NCE/ZNZ/MRU (5 each). ~2hr research + paste. Required before any Reddit/HN post. |
| **Supabase delete-account SQL paste** | **P0 (App Store) / P3 (web)** | Day 50. 2-min paste into Supabase SQL editor. iOS App Store gate only. |
| **AP_CONTINENT gap (6 airports, 7 venues)** | **FIXED this report** | KUL/MCT/GIG/SNA/TFS/CHQ now in AP_CONTINENT. 133/133 coverage. |
| **10 venue proposals unshipped** | **P2** | Backlog: July 27 (Malaga/Comporta/Biarritz/Porto de Galinhas/Whakapapa), July 28 (LIH/ACE/CEB/VCE), July 29 (Porters/Mt Selwyn/Sancho/Starfish/Cinnamon Bay). All greenlit per v102 Decision 2 (minus LIR). |
| **18 stale remote branches** | **P3** | `git push origin --delete <branch>`. 5 minutes. Jack-optional. |
| **Photos: ~346/373 venues show generic stock** | **P2** | Biggest remaining quality gap. Needs `UNSPLASH_KEY`. |
| **Plausible analytics unread** | **P1** | Day 29. 15 minutes on plausible.io before next Reddit post. |

---

## This Week's Top 3 Priorities

**1. Jack: VPS redeploy + APNS confirmation (10-min SSH — TODAY, Day 5)**

Five consecutive days of broken server-side features. This is the only P0 requiring Jack. One session:
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21
# Add disk cache while here (30 lines from DevOps report — Open #23)
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: apns: "configured", forecast_days: 14
```
After `/health` confirms `apns: configured`: flip `APNS_LIVE = true` in app.jsx, push. Closes Open #19, #21, #23 in one session. This has been on the list for 5 days.

**2. BASE_PRICES backfill top 15 APs (~2hr, before any Reddit/HN post)**

68% of venues display estimated deal scores. The deal score is Peakly's primary differentiator. Top 15 missing APs by venues affected: **CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU/ALB/PLS/AXA/SXM/NAP/CAG/FAO/SPU**. Research round-trip fares from JFK/LAX/ORD/MIA via Google Flights, paste into `BASE_PRICES` block. Unlocks deal scoring for ~90 venues in a single session.

**3. Flush the venue backlog — ship the 10 pending proposals**

10 venue proposals are greenlit and sitting unacted on. The agent team has been blocked from proposing new venues (Decision 3, v102) pending this flush. Shipping the 10 pending venues is a direct code action that's been deferred 5 days. Each proposal has the full JS block ready in `reports/content-report.md` (July 27/28/29 editions). This is not a planning exercise — it's a paste.

---

## Decisions This Report

**Decision 1: AP_CONTINENT fix — SHIPPED.**
Content confirmed 6 missing airports (KUL/SNA/MCT/GIG/TFS/CHQ) causing 7 venues to potentially misroute continent filtering. Fixed in this report's code change. No scoring change, no brace risk, no VPS impact. 133/133 venue AP coverage confirmed via node eval.

**Decision 2: Content agent resumes venue proposals — capped at 3/run.**
v102 Decision 3 blocked new venue proposals to clear the backlog first. The backlog hasn't cleared because dev bandwidth is the bottleneck, not proposal quality. Unblocking the agent but capping proposals at 3/run (down from 5) — this paces the queue so it stays actionable. Content agent priority order for next run: (1) BASE_PRICES fare research (top 5 APs: CUN/IBZ/HKT/BTV/NCE), (2) up to 3 new venue proposals if research is done.

**Decision 3: DevOps report BASE_PRICES figure is WRONG — corrected.**
DevOps v99/v100/v101/v102 all report "10.3% coverage (15 airports)." Correct figure from node eval: **42/133 venue APs covered (32% coverage)**. The DevOps node extraction uses a grepping method that misses some BASE_PRICES entries. Use the node bracket-walk method (same as venue counting). Update devops.md prompt to use: `node -e "const c=require('fs').readFileSync('app.jsx','utf8');const bp=c.slice(c.indexOf('const BASE_PRICES = {')).match(/^\s{2}([A-Z]{3})\s*:/gm)||[];console.log(bp.length)"`. Carry this correction to all future reports.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Tamarindo Beach via LIR | `tamarindo-cr` already in catalog at ap:SJO. Same venue. Dup. |
| Peakly Pro price fix | $0 refs. Pro UI was removed April 16. This is a ghost. |
| Sentry DSN investigation | Already configured at app.jsx:8. Stop raising. |
| CSP / SRI on CDN scripts | No user-facing value pre-launch. Defer post-1K. |
| Scoring algorithm changes | Locked. Full six-hole audit required first. |
| More venue proposals before backlog flush | Cap at 3/run effective next content run. |

---

## Success Criteria

**90-day projection: 5K–8K users. What gets to 8K, not 5K:**

1. **VPS fully live this week** — the server-side product (live weekend fares, weather cache, alerts) is 5 days dark. The Reddit post can't credibly pitch "live weekend pricing" while the VPS is serving stale `proxy.js`. Fix #19 first; everything else follows.

2. **BASE_PRICES backfill before next post** — a Reddit comment asking "how does this compare to Hopper?" gets answered by deal scores. If 68% of venues show estimates, the first reply is "it's just guessing." CUN/IBZ/HKT are exactly the venues that show up in r/travel deal threads. Fix the data before the audience shows up.

3. **Photos before second Reddit post** — 346/373 venues show random stock photography. The click from Reddit goes to a venue card showing a generic powder shot for Verbier. Trust broken. `UNSPLASH_KEY` + `scripts/photos-fetch.mjs` → 8K, not 5K.

---

## One Product Risk Nobody Is Talking About

**Peak-season Southern hemisphere ski window is closing in 9 weeks.**

July 29. Southern hemisphere ski season peaks July–August. Peakly has 23 actively in-season Southern ski venues (ZQN/SCL/MEL/etc.) that differentiate it from OpenSnow and OnTheSnow, which go dark in northern summer. This is the strongest card in the deck for any July/August Reddit post to r/skiing or r/newzealand.

The window closes: NZ resorts close by October, Australian resorts by early September. After that, Peakly's ski inventory goes dormant again (only the 14 lateSeason northern venues survive summer). The unique timing of "world's only app combining southern ski + northern beach in peak season" is a July/August pitch only. If the Reddit post doesn't land before mid-August, this angle is gone for 9 months. VPS delay is the gating dependency.

---

*v103 authored 2026-07-29. `git fetch` succeeded — local HEAD verified against origin/main. Code change shipped this report: AP_CONTINENT gap fixed (6 airports — KUL/MCT/GIG/SNA/TFS/CHQ added). Cache stamp `20260725d` → auto-push will bump on commit.*
