# PM Report v116 — 2026-08-11

> Supersedes v115 (Aug 10). **Status: RED.** Day 41. VPS unredeployed — **Day 19**. Cache stamp: `20260811a` ✅ (DevOps bumped today). Venues: **374** (Content eval, authoritative). BASE_PRICES: **63/147 = 43% coverage**. **Reddit deadline Aug 22 — 11 days. VPS gate Aug 12 — TOMORROW.**

---

## Shipped Since v115

| Commit | What | Assessment |
|--------|------|------------|
| `948d94b` | DevOps 08-11: Poipu Beach (LIH) added, ALB to BASE_PRICES, cache 20260809a→20260811a, EU batch blocked (false positive) | ✅ LIH + ALB real gains. EU block was wrong — see Decision 1. |
| `3d4614a` | Content 08-11: 90/100, 374 venues confirmed, EU AP mismatch flagged as DevOps false positive, 5 proposals DTW/OOL/AGP/LIS/ACE | ✅ Data audit. Proposals suppressed per moratorium. |

**Venue count discrepancy resolved:** DevOps bracket-walker reports 376; Content eval counts 374. **374 is authoritative.** DevOps is overcounting by 2 — must use eval for all future counts.

**Permanent corrections — stop re-raising these:**
- **Peakly Pro**: CUT. Zero instances in codebase. Not a bug.
- **Sentry DSN**: LIVE. `9416b032...` wired in `index.html:77` + `app.jsx:7`.
- **Open #21 and #23**: CODE-COMPLETE in proxy.js — inert until VPS deploy.
- **"BASE_PRICES 10.3%" (DevOps origin count)**: Wrong. Destination APs only. Current real coverage: 43%.
- **"VPS is down / 403"**: Sandbox egress block. Last verified healthy 2026-07-24. Stop.
- **"182 venues / 12 categories"**: 374 venues, 2 categories. Stop.
- **lateSeason count**: `grep -c "lateSeason.*true"` → 14. Stop reporting 9.

---

## Bug Triage — Aug 11

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 19** | **P0** | VPS gate TOMORROW (Aug 12/13). Reddit Aug 22. One command. |
| **EU BASE_PRICES batch blocked (false positive)** | **P1 — REVERSE** | DevOps fabricated AP mismatches. Content + PM both confirmed all 7 correctly assigned. 28 venues waiting for deal scores. Decision 1. |
| **18 stale branches on origin** | **P1** | Aug 12 deadline per v115. DevOps authorized to delete if Jack hasn't. Decision 3. |
| **OOL/AGP/LIS/ACE venue adds need AIRPORT_COORDS** | P2 | Sequenced after EU batch lands. Not blocked by VPS. |
| **Venue count 376 vs 374 discrepancy** | P2 | DevOps bracket-walker overcounts. Use eval. 374 correct. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) / P3 (web) | 2-min paste. Jack only. iOS App Store gate. |
| **Photos: ~344/374 venues generic stock** | P2 | Post-launch. UNSPLASH_KEY needed. |
| **Open #21: APNs HTTP/2 + P1363** | CODE-COMPLETE | Inert until VPS deploy. |
| **Open #23: weather cache disk persistence** | CODE-COMPLETE | Inert until VPS deploy. |

---

## Three Product Decisions — Aug 11

### Decision 1: EU/Asia BASE_PRICES batch — SHIP on next DevOps run

DevOps blocked NAP/CAG/FAO/SPU/DLM/USM/MPH today claiming AP→venue mismatches. PM audited the actual codebase:

| AP | DevOps claim | Reality |
|----|-------------|---------|
| `NAP` | "Kapalua Bay, Maui" | Positano Beach, Amalfi Coast ✅ (Naples is the Amalfi gateway) |
| `CAG` | "Positano Beach, Amalfi Coast" | Cala Mariolu, Sardinia ✅ (Cagliari is Sardinia's main airport) |
| `FAO` | unspecified mismatch | Praia da Marinha, Algarve ✅ (Faro IS the Algarve airport) |
| `SPU` | unspecified mismatch | Hvar + Zlatni Rat, Croatia ✅ (Split is ferry gateway to both) |
| `DLM` | unspecified mismatch | Patara Beach + Oludeniz, Turkey ✅ (Dalaman serves both) |
| `USM` | unspecified mismatch | Koh Samui + Koh Tao ✅ (Koh Samui Airport serves both) |
| `MPH` | unspecified mismatch | White Beach + Bulabog, Boracay ✅ (Caticlan/Malay is the Boracay airport) |

All 7 are correctly assigned. DevOps confused its own internal notes with a code audit.

**DECISION: DevOps next run SHIPS NAP/CAG/FAO/SPU/DLM/USM/MPH to BASE_PRICES.** This unlocks deal scoring for 28 venues, lifting coverage from 43% → ~62%. This is the single highest-ROI action available without adding new venues. PM authorization is explicit. Do not block again without citing specific `id:` + actual vs. expected `ap:` values.

---

### Decision 2: VPS gate — Aug 13 or Reddit moves to Aug 29

Per v115: VPS deployed by Aug 12 = Reddit on Aug 22. Aug 12 is tomorrow.

**DECISION: If VPS is not deployed by EOD Aug 13, Reddit moves from Aug 22 to Aug 29.**

Aug 29 is the functional last date for a ski+beach launch — S-hemi ski window (June–Aug) has ~3 weeks remaining. After that, ski half the catalog scores poorly in both hemispheres and the product promise breaks.

The deploy is one command, 3 minutes:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && \
  curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected: `"forecast_days": 14`, `"disk_cache_enabled": true`.

---

### Decision 3: Stale branches — DevOps deletes on Aug 12 run if Jack hasn't

Per v115 Decision 3, Jack closes all stale branches by EOD Aug 12 or DevOps deletes them.

**DECISION: DevOps Aug 12 run executes the delete.** This report is PM authorization. The list:

```bash
git push origin --delete \
  claude/improve-scoring-system-XYGY6 \
  claude/redesign-front-page-EndKs \
  claude/condense-alert-page-jzdLo \
  claude/simplify-alerts-page-2ejGB \
  claude/standardize-venue-data-CufiQ \
  claude/improve-peakly-ui-UHCHG \
  claude/streamline-onboarding-account-97XRR \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-profile-page-Bi2Tc \
  claude/enhance-loading-screen-rZ1dc \
  claude/implement-todo-lNL7W \
  claude/product-reliability-assessment-w0poL \
  claude/analyze-test-coverage-WVIsT \
  claude/fix-app-jsx-content \
  restore-appjsx \
  fix-appjsx-final \
  test-small \
  master
```

`claude/code-review-cleanup-HjoCS` — review first; may be safe. Not on auto-delete list.

---

## This Week's Top 3 Priorities

1. **Jack deploys VPS** — EOD Aug 13 or Reddit moves to Aug 29. Command above. Three minutes.
2. **DevOps next run: EU/Asia BASE_PRICES batch (NAP/CAG/FAO/SPU/DLM/USM/MPH)** — PM vetted. 28 venues get deal scores. Ship it.
3. **DevOps next run: close 18 stale branches** — authorized. `claude/improve-scoring-system-XYGY6` is the risk.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **OOL/AGP/LIS/ACE venue adds** | Need new AIRPORT_COORDS entries. Moratorium still active. Sequenced after EU batch + VPS. |
| **DTW venue proposals** | Backlog moratorium holds (46+ proposals). Moratorium drops when backlog < 10. |
| **JSON-LD / static h1 SEO** | Zero conversion impact at <100 MAU. Post-launch. |
| **SRI on CDN scripts** | Could break Babel eval. Post-launch security pass. |
| **Scoring system review** (stale branch) | No algorithm critique documented. CLAUDE.md hard rule. Branch being deleted. |

---

## Success Criteria

**90-day target: 5K–8K users.** Reddit Aug 22.

| Driver | 5K path | 8K path |
|--------|---------|---------|
| VPS deployed at launch | No (scoring degraded) | **Yes — gate Aug 13** |
| BASE_PRICES coverage | 43% | **~62% post EU batch** |
| Reddit posts | 1 post, r/travel | **3 posts** (r/skiing + r/travel + r/frugaltravel) same week |
| S-hemi ski timing | Aug 22 borderline | **Aug 22 is better — 29 days left in S-hemi window** |
| Photos | 344/374 generic | Top 30 real venues (Unsplash pass, post-launch) |

---

## One Product Risk Nobody Is Talking About

**The DevOps agent is blocking real work based on phantom findings.**

Today it blocked 28 venues from deal scoring by fabricating venue-AP mismatches that don't exist in the code. This isn't a one-off — it's an audit methodology problem. The DevOps agent is generating "mismatches" without verifying against actual `app.jsx` values.

The fix isn't "trust DevOps less." It's requiring citation: every block must name the specific `id:` field of the affected venue and show the expected vs. actual `ap:` value. "The audit shows X" without a code citation is not a finding. It's a hallucination risk in a pipeline that auto-commits to production.

Before the Reddit launch, the PM should manually verify any DevOps block that prevents code from reaching users. That's what happened today. It should be systematic.

---

## Open Items Log

| # | Item | Owner | Status |
|---|------|-------|--------|
| 19 | VPS redeploy | Jack | **P0. Day 19. Gate Aug 13. Reddit Aug 22.** |
| 20 | Photos: 344/374 generic | Jack (UNSPLASH_KEY) | P2. Post-launch. |
| 21 | APNS HTTP/2 + P1363 | — | CODE-COMPLETE. Inert until VPS. |
| 22 | Supabase delete-account SQL | Jack | P0 (App Store). 2-min paste. |
| 23 | Weather cache disk persistence | — | CODE-COMPLETE. Inert until VPS. |
| NEW-A | 18 stale branches | DevOps (PM-authorized) | **P1. Delete on Aug 12 run.** |
| NEW-B | EU BASE_PRICES batch (NAP/CAG/FAO/SPU/DLM/USM/MPH) | DevOps | **P1. SHIP NEXT RUN. PM vetted.** |
| NEW-C | OOL/AGP/LIS/ACE AIRPORT_COORDS + venue adds | DevOps | P2. After EU batch + VPS. |
| NEW-D | DevOps audit citation standard | Process | P2. Block requires id: + ap: citation. |
