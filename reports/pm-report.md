# Peakly PM Report — 2026-07-28 (v102)

> Supersedes v101 (July 27). **Status: AMBER.** Day 28 post-launch. P0 from v100 (APNS_LIVE=true + VPS unredeployed) is now **Day 4**. Zero code shipped in 3 days. 15 venue proposals unacted on across 2 agent cycles. **This report ships one code change: APNS_LIVE flipped back to false (stopgap, see below). VPS redeploy remains Jack-only SSH action.**

---

## Agent Prompt Corrections (permanent — stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **Auto-bumps on code change. Stamp age = days since last code edit. Correct behavior, not a bug.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14. Use node ID-mapping not grep.** Stop. |
| "placeholder tags" | **FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS not VENUES.** Stop. |
| "AP_CONTINENT gaps (KUL/SNA/MCT/GIG/TFS/CHQ)" | **PERMANENTLY CLOSED.** Stop. |
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
| "BASE_PRICES covers only 15 airports (10.3%)" | **FALSE. 46/146 venue APs covered (31.5%). Node extraction only — not grep. Stop.** |
| "Cache stale = code stale" | **WRONG. Stamp age = days since last code edit. Auto-push bumps only on edit. Stop.** |
| "Tamarindo Costa Rica (LIR) not in catalog" | **FALSE. `tamarindo-cr` exists at ap:SJO (line 2413). Do not add a second Tamarindo entry.** Stop. |
| "APNS_LIVE=true, VPS deployed" | **VPS NOT REDEPLOYED.** `APNS_LIVE` flipped back to `false` in this report (v102). Flip true after Jack's scp + pm2 restart + `/health` confirms `apns: configured`. Stop. |

---

## Shipped Since v101 (2026-07-27 → 2026-07-28)

| Commit | What | Verdict |
|--------|------|---------|
| `97d3830` | DevOps daily report 2026-07-27 | ✅ Routine |
| `bfea47c` | Content daily report 2026-07-27 — 5 venue proposals | ✅ Routine |
| `d608313` | PM report v101 | ✅ Routine |
| `4562f52` | DevOps daily report 2026-07-28 | ✅ Routine |
| `c81f248` | Content daily report 2026-07-28 — 5 venue proposals, BASE_PRICES 46/146 corrected | ✅ Routine |
| **v102 (this report)** | **APNS_LIVE flipped false — stopgap while VPS unredeployed** | ✅ P0 mitigation |

**0 code commits in 3 days.** Five daily reports and nothing else.

**Code state July 28:**
- `app.jsx`: 13,718 lines · **373 venues** (131 ski / 242 beach)
- `APNS_LIVE`: **false** ← changed this report (was `true` since July 25 despite VPS never updated)
- `lateSeason`: 14 · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- BASE_PRICES: **46/146 venue APs covered (31.5%)** — 100 APs missing

---

## Bug Triage — July 28

| Bug | Severity | Status |
|-----|----------|--------|
| **APNS_LIVE=true + VPS unredeployed — iOS alert promise broken** | **P0 → mitigated** | Day 4. `APNS_LIVE` flipped to `false` this report — iOS Alerts tab hidden again. Full fix: Jack SSH → `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/` → `pm2 restart peakly-proxy` → verify `/health` shows `apns: configured` → flip `APNS_LIVE = true` + push. Bundle with Open #23. |
| **Open #19: VPS redeploy unrealized** | **P1 (Jack-only SSH)** | Proxy.js fix committed July 25 (`3165c1e`). Never scp'd. All server-side P1s clear in one 10-min SSH session. |
| **Open #23: weather cache in-memory only** | **P1 (pre-traffic gate)** | `pm2 restart` wipes 373-venue cache → cold spike → Open-Meteo rate ceiling in <1hr. Bundle fix with VPS redeploy (same SSH session). |
| **15 venue proposals pending, 0 added** | **P2** | 10 from July 27 (5 Malaga/Comporta/Biarritz/Porto de Galinhas/Whakapapa) + 5 from July 28 (LIH/ACE/LIR/CEB/VCE). LIR REJECTED (see Decision 2). Ship the other 9 this week. |
| **BASE_PRICES gap: 100/146 APs missing** | **P1 (pre-Reddit)** | 31.5% coverage. Deal scores guessed for 68% of venues. Top-15 by venue count: CUN/SLC/SYD/GVA/IBZ/DPS/RNO/CMF/HKT/BTV/NCE/ZNZ/MRU/SCL/YYC. ~2hr research + paste. Required before Reddit/HN post. |
| **Plausible analytics unread** | **P1** | Day 28. No user behavior data reviewed. Cannot make targeting decisions for next post. Jack: 15 min on plausible.io. |
| **15 stale remote branches** | **P3** | `git push origin --delete <branch>` × 15. 5 minutes. |
| **Supabase delete-account SQL paste** | **P0 (App Store) / P3 (web)** | Day 49. 2-min paste into Supabase SQL editor. iOS gate only. |

---

## This Week's Top 3 Priorities

**1. Jack: VPS redeploy + APNS confirmation (25 min SSH — TODAY)**

Everything P1 server-side is one SSH session away:
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21
# Add disk cache while here (Open #23 — ~30 lines from DevOps report)
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health  # confirm apns: configured
```
Then: flip `APNS_LIVE = true` in app.jsx, commit, push. That closes Open #19, #21, and #23 in 25 minutes. This has been on the list for 4 days.

**2. BASE_PRICES backfill top-15 APs (~2hr, before Reddit)**

68% of venues show guessed deal math. This is the headline feature. Research CUN/SLC/SYD/GVA/IBZ/DPS/RNO/CMF/HKT/BTV/NCE/ZNZ/MRU/SCL/YYC fares via Google Flights (round-trip from JFK/LAX/ORD/MIA). Paste into `BASE_PRICES` block in `app.jsx`. Required before any Reddit/HN post. Two hours of work, permanent improvement to the product's core mechanic.

**3. Jack: Read Plausible (15 min — before next post)**

Day 28, zero data read. Which venues get the most opens, what device, where's traffic from — these three data points determine the angle for the next Reddit post. Without them the post is a guess. plausible.io, 15 minutes, go.

---

## Decisions This Report

**Decision 1: APNS_LIVE flipped to false — SHIPPED.**
Day 4 of iOS users seeing a broken alert registration UI is done. The July 25 flip to `true` (commit `495a0b9`) was premature — the .p8 key is on the VPS but `proxy.js` was never scp'd, so push delivery fails at HTTP/1.1 transport and DER signature. Reverting stops the user-trust burn. Flip back to `true` after Jack confirms `/health` shows `apns: configured`.

**Decision 2: 9 of 10 pending venue proposals — SHIP this week.**
July 27 batch: Malaga (AGP), Comporta (LIS), Biarritz (BIQ), Porto de Galinhas (REC), Whakapapa (AKL). July 28 batch: Poipu Beach/Kauai (LIH), Playa Papagayo/Lanzarote (ACE), Malapascua/Philippines (CEB), Lido di Venezia (VCE). All 9 APs in both BASE_PRICES and AIRPORT_COORDS. Zero blockers.

**LIR (Playa Tamarindo) REJECTED:** `tamarindo-cr` already exists at ap:SJO (app.jsx line 2413). Same physical location, same venue. Adding a second entry via LIR creates a catalog dup. Content agent: do not re-propose this.

**Decision 3: Content agent scope for July 29 run — BASE_PRICES research, no new venues.**
The agent proposed 15 venues in 3 days. None shipped. The bottleneck is dev bandwidth to review, validate, and merge batches without regressions. For the July 29 content run: no new venue proposals. Instead: verify round-trip fares for the top-15 missing APs (CUN/SLC/SYD/GVA/IBZ/DPS/RNO/CMF/HKT/BTV/NCE/ZNZ/MRU/SCL/YYC) via Google Flights from JFK/LAX/ORD/MIA. Return a confidence-checked fare table. This directly unblocks the P1 deal-score fix. **Carry this instruction forward until BASE_PRICES backfill ships.**

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Tamarindo Beach via LIR | `tamarindo-cr` already in catalog at ap:SJO. Same venue. Dup. |
| New venue proposals on July 29 agent run | Backlog at 15 unshipped. More proposals don't help. Research BASE_PRICES instead. |
| Open #10 (CSP / SRI on CDN scripts) | No user-facing value pre-launch. Medium risk. Defer post-1K. |
| dist/ git rm --cached | P3. Do after VPS redeploy session, not before. |
| Any scoring algorithm change | Locked. Not touching without a full six-hole audit critique first. |

---

## Success Criteria

**90-day projection: 5K–8K users. What gets to 8K, not 5K:**

1. **Second Reddit post within 2 weeks** — the first post's novelty window closes fast. A second post in r/skiing, r/solotravel, or r/digitalnomad while the domain is new is the growth lever. Requires: Plausible read (for angle), BASE_PRICES backfill (for deal-score credibility), APNS/VPS live (for screenshots). All three are sub-2hr tasks.

2. **Photos before second post** — 346 of 373 venues show generic stock. When someone clicks from Reddit and sees a random powder shot for Verbier, trust fails. `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`. Biggest remaining quality gap.

3. **VPS fully live (alerts + weekend pricing + weather cache)** — the deal-score differentiation Peakly's pitch is built on (live weekend fares + confidence flag) is currently degraded. A Reddit comment asking "how is this different from Hopper?" gets answered by the deal-score engine. That engine needs the VPS up.

---

## One Product Risk Nobody Is Talking About

**The agent pipeline is becoming a liability.**

Three consecutive daily cycles. Zero code shipped. The agents produced 15 venue proposals, multiple BASE_PRICES research outputs, and detailed DevOps runbooks — all sitting in `reports/` untouched. Each new run adds more proposals on top of unacted-on proposals.

When the pipeline produces output that never ships, agents optimize for output quality (better research, more detail) rather than ship velocity. The proposals drift further from what's actionable in a given dev session — already happening: July 26 batch deferred for AIRPORT_COORDS gaps, July 27 batch greenlit but unshipped, July 28 batch proposed before July 27 was even reviewed.

The fix isn't writing better reports. It's changing the pipeline architecture: block new venue proposals when backlog exceeds 5 unshipped (Decision 3 above is one cycle of this), or have the agent write directly to app.jsx and open a PR rather than writing to `reports/`. The current research-then-human-merges loop is slower than the velocity needed for 100K downloads.

---

*v102 authored 2026-07-28. `git fetch` succeeded — local HEAD verified against origin/main. One code change shipped this report: `APNS_LIVE = false` stopgap at app.jsx:12627.*
