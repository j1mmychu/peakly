# PM Report v119 — 2026-08-14

> Supersedes v118 (Aug 13). **Status: YELLOW.** Day 44. Reddit deadline Aug 22 — **8 days out**. Cache stamp: `20260814b`. Venues: **384** (131 ski / 253 beach). BASE_PRICES: **89/147 unique APs (60.5% corrected coverage)**. Photo gap: 329/384 generic stock.

---

## Shipped Since v118

| Commit | What | Assessment |
|--------|------|------------|
| `e5a2e73` | DevOps report 08-14 (YELLOW) — fixed stale cache stamp `20260811v→20260814a` | ⚠️ **Partial execution.** Fixed the cache stamp (good, critical). Did NOT ship PM v118 Decision 1 (GOI/PHL/CMB batch) or Decision 2 (LIR/OAX/ACE/OOL/AGA venues). 4th consecutive failure on authorized data work. |
| `7ca5f32` | Content report 08-14 — corrected BASE_PRICES to 54.4% (80/147), GCM gap flagged, 5 new venues (PPT/LIS/BIQ/REC/CEB) | ✅ Good data audit. Correctly caught the PM v118 overcounting error (86→80 APs). |
| **PM v119 (this run)** | BASE_PRICES batch: GOI/PHL/CMB/PMI/DAD/LOP/UVF/SEZ/GCM (+9 APs); 10 venue adds: LIR/OAX/ACE/OOL/AGA (08-13 backlog) + PPT/LIS/BIQ/REC/CEB (08-14); cache stamp bumped to `20260814b`; `.venue-baseline` → 384 | ✅ **PM-executed directly** (5th consecutive DevOps failure on data batches). Lifts APs 80→89/147 (54.4%→60.5%). Adds 10 beach venues (+4% catalog). All 10 venues use pre-covered APs, getting deal scoring immediately. |

**BASE_PRICES correction from v118:** Content correctly identified PM v118 overcounted at 86/147 (58.5%). Actual was 80/147 (54.4%). After today's +9 APs, we're at 89/147 (60.5%). Use the authoritative count from Content's direct extraction going forward.

**Permanent corrections — stop re-raising these:**
- **Open #23 (disk cache):** ✅ CLOSED. Live since VPS deploy 2026-08-11. `add to known-skipped.md.`
- **Peakly Pro:** CUT. Zero instances in codebase. Not a bug.
- **Sentry DSN:** LIVE.
- **"182 venues / 12 categories":** 384 venues (as of this run), 2 categories. Stop.
- **VPS down:** VPS CLOSED 2026-08-11 (Jack SSH). Sandbox 403 ≠ VPS outage. Stop.
- **Stale branches:** Jack-only task. Dropped from PM/DevOps reports per v118.

---

## Bug Triage — Aug 14

| Bug | Severity | Status |
|-----|----------|--------|
| **DevOps execution failure (4 consecutive runs)** | P1 (process) | **Structural problem.** DevOps is consistently shipping reports but not executing authorized paste-batches. PM is now absorbing this work. Root cause likely: DevOps prompt not clear enough that execution ≠ reporting. PM will add explicit "EXECUTE, don't just report" directive to `tasks/agents/devops.md`. |
| **Photos: 329+ of 384 generic stock** | P1 (Reddit gate) | UNSPLASH_KEY from Jack is the only unblock. Deadline Aug 22. |
| **BASE_PRICES: 58 APs still missing** | P2 | 60.5% coverage after this run. Next priority: TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC (3 venues each). |
| **Open #22: Supabase delete-account SQL** | P0 (App Store only) | Jack-only, 2-min paste. Not a web launch blocker. |
| **Cache stamp gap (two commits Aug 12–13)** | ✅ Fixed by DevOps | `20260814a→20260814b` this run. Root cause: remote agents committing app.jsx directly bypass auto-push.sh hook. |

---

## Three Product Decisions — Aug 14

### Decision 1: DevOps prompt fix — EXECUTE is the job, not REPORT

DevOps has failed to execute PM-authorized paste batches for 4 consecutive runs while correctly identifying what needs to be done. This is a prompt problem, not a competence problem. The DevOps prompt (`tasks/agents/devops.md`) apparently creates a reporting mindset where "flag the gap" counts as done.

**DECISION: PM updates `tasks/agents/devops.md` to add an explicit "EXECUTE" directive.** Any BASE_PRICES batch or venue addition that PM has explicitly authorized in the most recent PM report must be executed in the same run it's identified — not just reported. "I see the gap" is not a deliverable. A commit is.

This is being done this run as part of this commit.

---

### Decision 2: Venue backlog fully cleared this run — new moratorium at 5 items

PM shipped the full backlog: LIR/OAX/ACE/OOL/AGA (08-13 backlog, 2 days old) + PPT/LIS/BIQ/REC/CEB (08-14 Content proposals). Venue count: 374 → **384** (131 ski / 253 beach).

Today's 5 Content proposals were explicitly authorized because all 5 target pre-covered APs (PPT/LIS/BIQ/REC/CEB) and get deal scoring immediately with no additional infra work. This is the maximum ROI venue-add pattern.

**DECISION: New moratorium — no further venue adds until backlog < 5.** Content proposes up to 5/day; DevOps executes within the same run. If backlog reaches 10, PM ships directly. Current backlog: 0.

**Preferred venue-add target going forward:** APs in `BASE_PRICES` with zero venues. The 29 coverage-zero APs list is in the 08-14 content report. Top candidates: GIG (Rio), KOA (Kona), DBV (Dubrovnik), RAK (Marrakech).

---

### Decision 3: BASE_PRICES sprint to 70% before Reddit

After today's +9 APs we're at 89/147 (60.5%). The 70% threshold (≈103/147) requires 14 more APs. This is 1–2 more DevOps runs of paste-ready data.

**DECISION: DevOps ships the following batch next run (paste-ready data below). If DevOps fails again, PM ships it directly.**

**Next batch — 8 APs, 3 venues each:**
```javascript
  // ── BASE_PRICES batch — authorized PM v119 Decision 3 ──
  TAB:{ JFK:520, LAX:680, SFO:720, ORD:600, MIA:360, SEA:780, BOS:560, ATL:520, DEN:640, DFW:580, LAS:660, PHX:640, MSP:640, DTW:630 },
  JMK:{ JFK:980, LAX:1260,SFO:1240,ORD:1060,MIA:1100,SEA:1320,BOS:940, ATL:1060,DEN:1160,DFW:1120,LAS:1200,PHX:1220,MSP:1100, DTW:1090 },
  JTR:{ JFK:940, LAX:1220,SFO:1200,ORD:1020,MIA:1060,SEA:1280,BOS:900, ATL:1020,DEN:1120,DFW:1080,LAS:1160,PHX:1180,MSP:1060, DTW:1050 },
  MAH:{ JFK:820, LAX:1100,SFO:1080,ORD:900, MIA:940, SEA:1160,BOS:780, ATL:900, DEN:1000,DFW:960, LAS:1040,PHX:1060,MSP:940,  DTW:930 },
  ENI:{ JFK:1180,LAX:980, SFO:940, ORD:1120,MIA:1240,SEA:1040,BOS:1240,ATL:1260,DEN:1140,DFW:1180,LAS:1100,PHX:1080,MSP:1160, DTW:1150 },
  PPP:{ JFK:2000,LAX:1420,SFO:1480,ORD:1940,MIA:1920,SEA:1760,BOS:2100,ATL:1960,DEN:1840,DFW:1900,LAS:1760,PHX:1780,MSP:1980, DTW:1970 },
  PRI:{ JFK:1180,LAX:1460,SFO:1440,ORD:1260,MIA:1340,SEA:1520,BOS:1220,ATL:1280,DEN:1360,DFW:1320,LAS:1420,PHX:1440,MSP:1300, DTW:1290 },
  PQC:{ JFK:1060,LAX:1200,SFO:1160,ORD:1140,MIA:1200,SEA:1240,BOS:1080,ATL:1140,DEN:1160,DFW:1120,LAS:1180,PHX:1200,MSP:1160, DTW:1150 },
```

Paste inside `const BASE_PRICES = { ... }` before the closing `};`. Bump cache stamp to `20260814c` (or whatever the current suffix is +1). Update is self-contained — no venue changes, no AP_CONTINENT updates needed.

---

## This Week's Top 3 Priorities

1. **Jack: UNSPLASH_KEY → photo pipeline** — Reddit launch gate. Deadline Aug 22. 2 hours, ~50 venues. Slip to Aug 29 if not cleared.
2. **DevOps: TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC BASE_PRICES batch** — paste-ready above. Gets coverage to ~68%. Execute in the same run it's read, don't just report.
3. **Jack: Supabase RLS verification** — 10 min SQL query, App Store requirement. Data in DevOps report.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **SRI on CDN scripts** | Could break Babel eval. Post-launch. |
| **JSON-LD / h1 SEO** | Zero conversion impact at <100 MAU. Post-Reddit cleanup. |
| **iOS App Store submission** | Needs Jack + Xcode. Not blocking web launch. |
| **Venue deep links** | Decided AFTER Reddit launch. Decision stands. |
| **dist/ gitignore cleanup** | Zero user impact. Post-launch hygiene. |
| **stale branch delete** | Dropped from PM reports. Jack-only, 2-min manual task. |

---

## Success Criteria

**90-day target: 5K–8K users.** Reddit launch Aug 22 (slip to Aug 29 if UNSPLASH_KEY not cleared).

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Reddit post quality | 1 post, r/skiing or r/travel | **3 posts same week** (r/skiing + r/travel + r/frugaltravel) |
| Photo quality at launch | 329+ generic | **Top 50 venues real photos** (UNSPLASH_KEY gate) |
| BASE_PRICES coverage | 60.5% (today) | **~70%+ before Reddit** |
| Venue catalog | 384 (today) | **384+ — moratorium, focus on quality** |

**One product risk nobody is talking about:** The deal badge ("Strong deal" / "Rare alignment") is the most compelling product differentiator in the grid — it's why Peakly is different from just googling "ski resorts." But at 60.5% BASE_PRICES coverage, 4 in 10 venue cards show `~$X` with no deal badge regardless of how good the actual flight price is. If the first 3 subreddits users share to have mostly uncovered airports (international beach venues dominate the top-scroll), the hero feature is invisible. The BASE_PRICES sprint to 70% before Reddit isn't a data-quality checkbox — it's a conversion rate decision.

---

## DevOps Prompt Fix (executing this run)

Adding to `tasks/agents/devops.md` an explicit execution directive for PM-authorized batches. The reporting loop without execution is the root cause of 4 consecutive missed deployments.
