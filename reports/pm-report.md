# Peakly PM Report — 2026-08-01 (v106)

> Supersedes v105 (July 31). **Status: RED.** Day 32. VPS unredeployed for **Day 9** — nine consecutive daily reports calling the same P0. Cache stamp fixed by DevOps today (`20260725d` → `20260801a`). Venue count stable at **373**. 25 proposals queued across 5 content sessions, 0 added. **14 days to Aug 15 Reddit deadline. 9 weeks of S-hemi ski window remaining.**

---

## Agent Prompt Corrections (permanent — stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **Auto-push bumps only on code edit. DevOps fixed today to `20260801a`. No code since July 31 = expected. Stop.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). Use `grep lateSeason app.jsx`. Stop. |
| "placeholder tags" | **FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 31 in 84ed91b.** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "AP_CONTINENT gaps (any)" | **FIXED July 29. 133/133 clean.** Stop. |
| "AIRPORT_COORDS gaps" | **FIXED July 31. 146/146 clean.** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 373. Stop.** |
| "Babel 8.x upgrade available" | **Incompatible with dev loop. Stop.** |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20.** Stop. |
| "bracket-walker overcounts" | **ROOT CAUSE CLOSED July 21. Stop.** |
| "retention email unsent" | **COHORT CLOSED per v94 Decision 1. Stop.** |
| "Babel mobile parse wall unresolved" | **CLOSED July 22. esbuild ships since June 20. Stop.** |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild. Stop. |
| "venue count 374 / banff dup" | **FIXED 2026-07-24. 373. Stop.** |
| "tahoe / palisades-tahoe dup" | **FALSE POSITIVE. Stop.** |
| "upcomingFridayISO UTC off-by-one" | **FIXED 2026-07-24. Stop.** |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24. Stop.** |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24. Stop.** |
| "WishlistsTab alertedIds out-of-scope" | **FIXED 2026-07-24. Stop.** |
| "BASE_PRICES covers 100% of airports" | **FALSE — DevOps Aug 1 corrected: 76/146 = 52%. 100 APs missing.** Do NOT stop raising BASE_PRICES gap. |
| "Tamarindo Costa Rica (LIR) not in catalog" | **FALSE. `tamarindo-cr` exists at ap:SJO.** Stop. |
| "APNS_LIVE=true, VPS deployed" | **VPS NOT REDEPLOYED.** `APNS_LIVE = false` since v102 stopgap. Flip true only after `/health` confirms `apns: configured`. Stop. |
| "LIH missing from BASE_PRICES and AP_CONTINENT" | **FALSE. LIH is in both. Was missing ONLY from AIRPORT_COORDS — FIXED July 31.** Stop. |
| "Grace Bay near-dup = problem" | **Two distinct entries, 5.6 km apart. KEEP BOTH (v104 Decision 1). Jack's call if merge later.** Stop. |
| "BASE_PRICES covers 31.5% (46/146)" | **CORRECTED Aug 1: 76/146 = 52%. DevOps re-eval confirmed. 100 APs still missing.** Use node eval, not manual count. |

---

## Shipped Since v105 (2026-07-31 → 2026-08-01)

| Commit | What | Verdict |
|--------|------|---------|
| `f4efd8c` | DevOps: cache stamp fixed (`20260725d` → `20260801a`), BASE_PRICES corrected to 76/146 | ✅ Right — stale SW was delivering 7-day-old code to cached users |
| `ff2e839` | Content: photo dedup full audit (170 unique/373, 88% sharing), 5 venue proposals (AGP/ACE/AGA/VCE/REC) staged | ✅ Good audit; proposals remain unimplemented |

**Zero net code-shipping commits in 7 days (July 26–Aug 1).** 25 venue proposals across 5 content sessions sit unimplemented.

**Code state Aug 1:**
- `app.jsx` HEAD: **373 venues** (131 ski / 242 beach)
- `PEAKLY_BUILD`: `20260801a` ✅ (fixed today)
- `APNS_LIVE`: **false** (stopgap from v102)
- `AP_CONTINENT`: **133/133 venue APs** ✅
- `AIRPORT_COORDS`: **146/146** ✅
- `lateSeason`: 14 · `poolPrimary`: 0 · `GEAR_ITEMS`: 0 ✅
- `BASE_PRICES`: **76/146 venue APs covered (52%)** — 100 APs missing, 235 venues show `~$X`
- Photos: 170 unique across 373 venues (88% sharing rate) — Open #20 confirmed worse than assumed

---

## Overnight Activity — What Happened, Was It Right?

**Two report-only commits. No code changed. Correct assessment:**

DevOps fixed the cache stamp. Necessary — 7 days of stale SW means users who haven't cleared cache are running the July 25 build with the July 24 P0 fixes but missing any subsequent changes. Also corrected BASE_PRICES to 76/146 (was wrongly claimed as 100% in July 31 DevOps report).

Content ran a photo dedup audit: the June 13 dedup reduced max repeats (26×→3×) but the 88% sharing rate finding reveals it's still a first-impression problem. 170 unique photos across 373 venues is less than half what's needed for true uniqueness. Good to surface. Staged 5 valid venue proposals (AGP/ACE/AGA/VCE/REC).

**The execution gap is now at 25 proposals.** Every batch passed pre-validation. The pipeline to paste them is not broken — there's no technical blocker. The blocker is that nobody is pasting.

**Stale branches note:** `origin/claude/product-reliability-assessment-w0poL` (9 days old) contains a scoring regression harness (`scripts/`) not yet merged. Defer until post-launch.

---

## Bug Triage — Aug 1

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 9** | **P0** | Jack-only. 10-min SSH. Nine days. Bundle with Open #23. |
| **Open #23: weather cache in-memory only** | **P1 (bundle with #19)** | Add disk persistence BEFORE `pm2 restart`. 30-line fix in DevOps report. |
| **BASE_PRICES: 48% of venue APs unpriced, 235 venues show `~$X`** | **P1 (pre-Reddit gate)** | Top 5: CUN (9), IBZ (7), HKT (6), BTV (5), NCE (5) = 32 venues in ~2hr backfill. |
| **Open #21: APNs DER vs P1363 + HTTP/1.1 transport** | **P1** | Fix committed to server/proxy.js. Dead until VPS redeploy. |
| **Photo dedup: 170 unique/373 venues (88% sharing)** | **P2** | Needs `UNSPLASH_KEY`. Biggest quality gap, not a launch blocker. |
| **25 venue proposals staged, 0 implemented** | **P2 (pipeline)** | Valid work sitting in markdown. No technical blocker. |
| **Open #22: Supabase delete-account SQL paste** | **P0 (App Store) / P3 (web)** | 2-min paste. iOS App Store gate only. Web unaffected. |
| **Stale remote branches (15)** | **P3** | No user-facing impact. Post-launch housekeeping. |

---

## Three Product Decisions — Aug 1

**Decision 1: Content backlog cap — SUSPEND new venue proposals, pivot to BASE_PRICES research**

25 proposals, 0 added. More proposals aren't the bottleneck — paste execution is. Next content session: no new proposals. Research BASE_PRICES values for the top 10 missing airports by venue count (CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU/ALB/PLS/AXA = 52 venues). Provide median round-trip from JFK + spot-check notes. This converts agent effort into data Jack can paste in one shot.

**Decision 2: BASE_PRICES baseline is now 76/146 (52%), not 46/146 (31.5%)**

DevOps Aug 1 re-eval via node confirmed 76 keys, not 46. Previous PM reports understated coverage. 100 APs remain missing and 235 venues still show `~$X` — the gap is real — but the absolute number is better than we thought. Update all agent running totals. Node eval is authoritative: `node -e "...BASE_PRICES...matchAll..."`. Do not use manual counts.

**Decision 3: Scoring regression harness — DEFER, do not delete**

The `product-reliability-assessment-w0poL` branch has unmerged work (scoring regression test harness). Do not merge before Reddit launch — scoring is frozen and adding guardrails introduces risk without benefit. Do not delete — recoverable post-launch tooling. Review after the first Reddit push when the algorithm is back in play.

---

## This Week's Top 3 Priorities (Aug 1–7)

**1. Jack: VPS redeploy + disk cache fix (10-min SSH — today, Day 9)**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 'pm2 restart peakly-proxy'
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, cors includes capacitor://localhost
```

After `/health` confirms: flip `APNS_LIVE = true` in app.jsx and push.

**2. BASE_PRICES backfill — CUN + IBZ + HKT + BTV + NCE (~2hr)**

32 venues flip from `~$X` to live deal scoring. CUN is 9 Caribbean beach venues from US hubs — the most visible deal-score gap in the catalog. Research-verified spot-checks against Google Flights before paste.

```javascript
CUN: {min:320, typical:480, peak:680},
IBZ: {min:580, typical:780, peak:1100},
HKT: {min:800, typical:1050, peak:1400},
BTV: {min:200, typical:290, peak:380},
NCE: {min:520, typical:720, peak:980},
```

**3. Paste the AGP/ACE/AGA/VCE/REC venue batch (15 min, no dependencies)**

All 5 at BASE_PRICES-covered airports. AIRPORT_COORDS additions included in content report. Paste-ready. This is 373→378 with zero decisions required.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **New venue proposals (beyond the 25 queued)** | Pipeline backlog is the bottleneck, not proposal quality. Suspend. |
| **Venue deep links / JSON-LD structured data** | Deferred — build after Reddit launch |
| **Google Play Store / PWABuilder** | LLC is the gate |
| **REI / Backcountry / GetYourGuide affiliate onboarding** | LLC pending. Not our bottleneck. |
| **Pro UI revival** | CUT for v1. 0 refs. Do not revisit until 1K MAU. |
| **Photo pipeline (Unsplash)** | Valid P2, blocked on `UNSPLASH_KEY`. Post-launch or whenever key is available. |
| **Scoring regression harness merge** | Post-launch tooling. Scoring is frozen. |
| **Stale branch cleanup** | No user-facing impact. Post-launch. |

---

## Success Criteria

**North star:** 100K downloads of an app people use weekly.

**90-day projection: 5K–8K users. What must be true for 8K, not 5K:**

| Gate | Status | Urgency |
|------|--------|---------|
| Reddit/HN launch before Aug 15 | ❌ Not yet | **14 days.** S-hemi ski hook expires Sept. US beach season peak now. |
| VPS deployed (14-day wx, real pricing, iOS CORS) | ❌ **Day 9** | This is the launch gate. |
| BASE_PRICES ≥70% coverage | ⚠️ 52% today | 27 more APs needed to hit 70%. ~4hr backfill. |
| Photos: venue-specific on top 50 | ❌ ~27/373 real | Degrades first impression. Not blocking launch. |
| App Store live (iOS) | ❌ APNS + LLC + Xcode | Not the primary 90-day driver — web/PWA is. |

The difference between 5K and 8K is posting before Aug 15 with a product that doesn't look broken under scrutiny. That means VPS live and BASE_PRICES above 60%. Everything else is polish.

---

## One Product Risk Nobody Is Talking About

**The agent loop is optimizing for agent-visible metrics, not user-visible outcomes.**

Nine days of P0 VPS reports. 25 proposals staged. Photo audits quantified to two decimal places. BASE_PRICES corrected from 31.5% to 52%. All of this is legitimate signal work — and none of it has moved the needle on the actual risk: nobody has posted on Reddit yet.

The agents can't post on Reddit. They can't SSH to the VPS. They can't paste venues into app.jsx. Everything they're producing is pre-work for human execution that hasn't happened. Meanwhile, the S-hemisphere ski hook — the sharpest launch angle available right now ("best ski weekends from your city, August through September, Southern Hemisphere") — is burning down. It expires in 9 weeks. The Reddit post timing is the lever; VPS and BASE_PRICES are preconditions, not the bottleneck.

The risk: the team (agents + Jack) continues producing high-quality analysis of a product that doesn't have users, while the window when the product pitch is sharpest closes. No amount of BASE_PRICES backfill or photo dedup changes the math on that. The SSH session and the Reddit post are the only things that matter this week.

---

*v106 — written 2026-08-01 by PM agent. Supersedes v105.*
