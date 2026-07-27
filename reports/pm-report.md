# Peakly PM Report — 2026-07-27 (v101)

> Supersedes v100 (July 26). **Status: AMBER on infrastructure, AMBER on distribution.** Day 27 post-launch. P0 from v100 (APNS_LIVE=true + VPS not confirmed deployed) is now Day 3 unresolved. No code shipped today — only daily agent reports.

---

## Agent Prompt Corrections (permanent — stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **Auto-bumps on code change. 2-day-old stamp = no code shipped in 2 days. That's correct behavior, not a bug.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14. Use `grep -c "lateSeason.*true" app.jsx`.** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS not VENUES. 0 dup IDs.** Stop. |
| "AP_CONTINENT gaps (KUL/SNA/MCT/GIG/TFS/CHQ)" | **PERMANENTLY CLOSED. All 6 confirmed. Verified 5× by PM. Stop.** |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 373 = baseline. Stop.** |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only, incompatible with dev loop. Prod uses esbuild. Stop.** |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20. Only `jacksonhole` exists. Stop permanently.** |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21. Stop permanently.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1. Stop flagging.** |
| "Babel mobile parse wall (P1) unresolved" | **PERMANENTLY CLOSED July 22. esbuild ships since June 20.** Stop. |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild. Stop. |
| "venue count 374 / banff dup" | **FIXED 2026-07-24. banff deleted, count now 373. Stop.** |
| "pre-compile CI deadline July 24" | **FALSE CLOCK. esbuild CI has shipped since June 20. No action needed. Stop.** |
| "tahoe / palisades-tahoe dup" | **FALSE POSITIVE. Only `palisades-tahoe` exists in VENUES. Stop.** |
| "upcomingFridayISO UTC off-by-one" | **FIXED 2026-07-24 (`0c02590`). `localISODate()` at all 3 call sites. Stop.** |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "WishlistsTab alertedIds out-of-scope" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "BASE_PRICES covers only 15 airports (10.3%)" | **FALSE. 46/146 venue APs covered (31.5%). DevOps undercounted by 3x. Node extraction script only — not grep. Stop.** |
| "Cache stale = code stale" | **WRONG. Stamp `20260725d` is 2 days old because NO CODE shipped in 2 days. Auto-push bumps only on app.jsx/sw.js/index.html edits. Age of stamp ≠ users seeing old code.** |

---

## Shipped Since v100 (2026-07-26 → 2026-07-27)

| Commit | What | Verdict |
|--------|------|---------|
| `97d3830` | DevOps daily report 2026-07-27 (YELLOW) | ✅ Routine |
| `bfea47c` | Content daily report 2026-07-27 — 5 venue proposals (Malaga/Comporta/Biarritz/Porto de Galinhas/Whakapapa) | ✅ Routine — **proposals unacted-on, pending PM decision** |

**0 code commits today.** Two daily reports and nothing else. Second consecutive day of zero code output.

**Code state July 27:**
- `app.jsx`: 13,718 lines · cache `20260725d` (correct — no code changes since July 25) · **373 venues** (176 compact + 197 pretty-printed, eval-verified)
- `APNS_LIVE`: **true** ⚠️ VPS not confirmed deployed (unverifiable from sandbox)
- `lateSeason`: 14 · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- BASE_PRICES: **46/146 venue APs covered (31.5%)** — 100 APs missing

---

## Bug Triage — July 27

| Bug | Severity | Status |
|-----|----------|--------|
| **APNS_LIVE=true + VPS redeploy unconfirmed = broken alert promise to iOS users** | **P0** | Day 3. iOS users who open the Alerts tab register alerts that will silently never fire. Fix: SSH to VPS → copy `server/proxy.js` to `/opt/peakly-proxy/` → `pm2 restart peakly-proxy` → verify `/health` shows `apns: configured`. Bundle with Open #23 (weather cache disk persistence, ~30 lines). If VPS is blocked today: one-line stopgap — flip `APNS_LIVE = false`, commit, push. |
| **Plausible analytics unread** | **P1** | Day 27. No user data reviewed since launch. Can't make targeting decisions for August post without knowing venue views, device split, traffic sources. Jack: 15 min on plausible.io. Blocks second-post angle. |
| **BASE_PRICES gap: 100/146 venue APs missing** | **P1 (pre-Reddit)** | 68% of venues show guessed deal math. DevOps top-15 by venue count: CUN (9 venues), SLC (8), SYD (8), GVA (7), IBZ (7), DPS (7), RNO (6), CMF (6), HKT (6), BTV (5), NCE (5), ZNZ (5), MRU (5), SCL (5), YYC (5). DevOps provided ready-to-paste JS block in today's report. ~20 min research-verify + paste. Before Reddit. |
| **10 proposed venues unacted on across 2 days** | **P2** | July 26 batch blocked by missing AIRPORT_COORDS (BCN, PDL, SLL). July 27 batch (AGP, LIS, BIQ, REC, AKL) all in BASE_PRICES; AIRPORT_COORDS missing but safe-fallback (null → pass filter). Decision below. |
| **Photo gap: ~346 venues show generic stock** | **P2** | `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait`. Biggest remaining quality gap. |
| **15+ stale remote branches** | **P3** | Repo hygiene. DevOps listed exact delete commands. 5 min. |
| **dist/ tracked in git** | **P3** | `git rm -r --cached dist/ ios/App/App/public/ && git commit` after Xcode session. |
| **Supabase delete-account SQL paste** | P0 (App Store) / P3 (web) | Day 48. 2-min paste. iOS gate only. |

---

## This Week's Top 3 Priorities

**1. Jack: VPS deploy + APNS confirmation (25 min SSH, TODAY — Day 3 P0)**
We are actively deceiving iOS users who registered alerts. Day 3 of this is not acceptable. Correct sequence: `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/ && ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"` → `curl -s https://peakly-api.duckdns.org/health` → confirm `apns: configured`. Bundle Open #23 weather cache disk persistence (~30 lines in proxy.js) since it's the same SSH session. If VPS is blocked for external reasons, flip `APNS_LIVE = false` as a 2-minute stopgap commit right now and stop burning trust.

**2. Jack: Read Plausible analytics (15 min, this week — unlocks August post)**
Day 27 with zero user behavior data read. We don't know if anyone is using alerts, which venues get opened, where traffic comes from, or what device our users are on. Every decision about subreddit targeting, hook framing, and which venues to highlight in the next post is a guess. plausible.io, 15 minutes. Report back what the top 3 venues by pageview and the mobile % are — that determines the Aug 1 post angle.

**3. BASE_PRICES backfill + July 27 venue batch (dev, ~30 min total)**
Paste DevOps's ready-to-paste top-15 AP block into `app.jsx`'s BASE_PRICES section. Then paste Content's 5 July 27 venue entries (Malaga/Comporta/Biarritz/Porto de Galinhas/Whakapapa — all APs already in BASE_PRICES). Add AIRPORT_COORDS entries for those 5 APs (AGP, LIS, BIQ, REC, AKL) as a follow-on to enable proper flight-time filtering. Cache auto-bumps, push. Done.

---

## Decisions This Report

**Decision 1: July 27 venue batch — SHIP.**
All 5 APs (AGP/Malaga, LIS/Comporta, BIQ/Biarritz, REC/Porto de Galinhas, AKL/Whakapapa) are in BASE_PRICES. AIRPORT_COORDS entries are missing but that's the defined safe-fallback (returns null → pass flight-time filter, don't hide the venue). Content has been proposing for 2 days with 0 additions. Ship the July 27 batch. Add AIRPORT_COORDS as a P3 follow-on.

July 26 batch (Grandvalira/Cortina/Réunion/Azores/Salalah) remains **DEFERRED** until BCN, PDL, SLL get AIRPORT_COORDS entries — niche destinations hidden by a null flight-time filter is more harmful than familiar ones.

**Decision 2: Content agent brief changes for next 2 runs — DEFER new proposals.**
Content has generated 10 venue proposals and 0 have been added. The constraint is dev bandwidth to review + validate + ship them without regressions. For the next 2 runs: **no new venue proposals.** Instead, content agent should research accurate fare baselines for the 100 missing BASE_PRICES APs — verify top-15 fares against Kayak/Google Flights and report back a confidence-checked table. This directly unblocks the P1 deal-score fix.

**Decision 3: DevOps BASE_PRICES methodology — corrected and closed.**
DevOps has reported "10.3% coverage (15 APs)" for two consecutive days. Actual coverage: **46/146 = 31.5% (46 APs)**. The agent is likely running a pattern match that misses the nested `AP: { ORIGIN: price }` structure. Adding to the permanent corrections table. The gap is real but was overstated 3x. Correct mental model: backfill 25 more APs (from 46 to ~71/146) to hit 50% — not "backfill 131 APs."

---

## Features REJECTED This Week

| Feature | Decision | Reasoning |
|---------|----------|-----------|
| Venue deep links | DEFER (post-Reddit) | Decided weeks ago. Stop re-raising. |
| More venue proposals | DEFER (2 runs) | Proposals > capacity. Redirect to BASE_PRICES research. |
| SRI/CSP hardening | DEFER (post-traffic) | Medium break-risk; sub-1K users, not worth the stability risk now. |
| Photo fetch pipeline | DEFER until Unsplash key available | Infra works, key is the blocker. |

---

## Success Criteria & 90-Day Projection

**What separates 8K from 5K by Day 90:** One successful r/skiing or r/travel post at the right time with the right hook. That requires: (a) VPS live so alerts fire, (b) Plausible data to pick the right angle, (c) photos that don't embarrass us. We're 0/3 on the controllable blockers — Day 3 on the same P0.

**The kill metric:** Plausible shows zero alert registrations, or <5% return visit rate. Either means we launched and nobody cared enough to come back. Read Plausible before the August post.

---

## One Product Risk Nobody Is Talking About

**The deal score is fabricating prices for 68% of the catalog, and we can't detect the conversion damage.**

When `BASE_PRICES[ap]` is null, `getDealScore` falls back to continent-pair estimates that can be off by 2–3x for thin routes. A user in Boston sees "🔥 Strong deal — $380" for Zanzibar that actually costs $1,400. They click through to Aviasales, see the real fare, and leave — and we have zero Plausible events to know it happened.

The `~$XXX` estimate label reduces but doesn't eliminate the trust damage when the estimate is badly wrong. The fix isn't a disclaimer — it's accurate data. BASE_PRICES backfill for the top 25 APs covers ~80 venues and takes 20 minutes. Do it before any traffic post.

---

*Report generated: 2026-07-27. git HEAD: `bfea47c`. Verified against `origin/main` via `git pull` (29 commits fast-forwarded from `614a637`). VPS health unverifiable from sandbox (no network egress). Venue count: 373 verified (176 compact + 197 pretty-printed). BASE_PRICES: 46/146 venue APs (31.5% coverage), 100 missing.*
