# PM Report v115 — 2026-08-10

> Supersedes v114 (Aug 9). **Status: RED.** Day 41. VPS unredeployed — **Day 18. Aug 10 gate has passed with no deployment confirmed.** Cache stamp: `20260809a` (yesterday's — DevOps did not run today). BASE_PRICES: **42% real coverage (61/146)**. **Reddit deadline shifts to Aug 22** per Decision 1. 12 days remaining.

---

## Permanent Corrections — Stop Re-Raising These

| Claim | Reality |
|---|---|
| "Peakly Pro showing $9/mo" | **CUT. Zero instances in codebase.** Not a bug. |
| "Sentry DSN empty" | **LIVE** — `9416b032...` wired in `index.html:77` + `app.jsx:7`. |
| "Cache buster stale" | **`20260809a` — yesterday's.** DevOps MIA today (see Section 1). |
| "BASE_PRICES 56.8% covered" | **WRONG — 41.8% (61/146) is real.** 30 BP airports have zero venues. |
| "Open #21 and #23 not fixed" | **CODE-COMPLETE.** Inert until VPS deploy. |
| "VPS is down / 403" | **Sandbox egress block, not VPS.** Last verified healthy 2026-07-24. |
| "182 venues / 12 categories" | **373 venues, 2 categories (skiing + beach only).** Pivot May 2026. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "lateSeason count = 14" | **9 confirmed by grep.** Always grep live. |

---

## Shipped Since v114

| Commit | What | Assessment |
|--------|------|------------|
| `a8f0a88` | Content: 90/100 health, 4 ideal AP targets, 5 new proposals LIH/OOL/AGP/LIS/ACE | ✅ Data quality. LIH is actionable — see Decision 2. |

**One commit since v114.** Content report only. DevOps did not run today — no cache bump, no EU BASE_PRICES batch (ALB/NAP/CAG/FAO/SPU/DLM), no venue adds. The gap in the pipeline is the story today.

---

## Bug Triage — Aug 10

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 18** | **P0** | Aug 10 gate passed. Reddit moves to Aug 22. See Decision 1. |
| **DevOps MIA today** | **P1** | No DevOps commit for Aug 10. Cache not bumped. EU BASE_PRICES batch not applied. Pipeline reliability issue. |
| **19 stale branches on origin** | **P1** | Day 2, no action. `claude/improve-scoring-system-XYGY6` is the live risk. See Decision 3. |
| **BASE_PRICES: 42% coverage — 85 APs missing deal score** | **P1** | EU batch (ALB/NAP/CAG/FAO/SPU/DLM) still unshipped — queued for DevOps next run. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) / P3 (web) | 2-min paste into Supabase SQL editor. iOS App Store gate. Jack action. |
| **Photos: 346/373 generic stock** | P2 | Post-launch. Needs UNSPLASH_KEY. |

---

## Three Product Decisions — Aug 10

### Decision 1: VPS Gate Verdict — Reddit Moves to Aug 22

The Aug 10 gate was today. As of this report (16:00 UTC), there is no confirmation of VPS deployment. DevOps didn't run, no commit from Jack, no health-check result. The gate is passed.

**DECISION: Reddit post deadline moves from Aug 15 to Aug 22.**

This is not a punishment — it's product discipline. The app we're about to advertise still has:
- Two-weekend scoring silently broken for 100% of users
- iOS native CORS blocked outright
- Alert deletion silently returning wrong status
- S-hemi ski venues with deal pricing code that the VPS can't serve

Posting about it before the VPS deploy would generate bounce and no retention. The 7-day extension preserves the S-hemi ski window (now 22 days) and gives Jack a real landing zone.

**Hard gate for Aug 22:** VPS deployed AND confirmed healthy (curl to `/health` shows `forecast_days: 14`, `disk_cache_enabled: true`). No exceptions.

**The command hasn't changed:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && \
  curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

---

### Decision 2: Ship Poipu Beach, Kauai (LIH) — Approve Now

Content identified LIH as the only airport that is simultaneously:
- Already in `BASE_PRICES`
- Already in `AIRPORT_COORDS`
- A genuine August beach destination
- Has **zero current venues**

This is the ideal venue add: zero infrastructure cost, immediate deal scoring, Hawaii in August is as strong as the catalog gets.

**DECISION: SHIP beach_poipu (Poipu Beach, Kauai) on the next DevOps run.**

DevOps pastes this venue into VENUES (after the last beach entry):

```js
{id:"beach_poipu", category:"beach",
  title:"Poipu Beach", location:"Kauai, Hawaii",
  lat:21.8753, lon:-159.4685, ap:"LIH",
  icon:"🏖️", rating:4.94, reviews:9800,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#33bbff",
  tags:["Horseshoe Bay","Monk Seal Sanctuary","Year-Round Sun","World-Class Snorkeling"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"},
```

And update `.venue-baseline` from 373 to 374, cache stamp to `20260810a`.

The other 4 proposals (OOL/AGP/LIS/ACE) require new AIRPORT_COORDS entries. Approve those after LIH lands clean.

---

### Decision 3: Stale Branches — Final Warning, Aug 12 Hard Close

Day 2. 19 branches still open. `claude/improve-scoring-system-XYGY6` is a scoring rewrite that violates CLAUDE.md's "no scoring changes without algorithm critique" rule. It has been sitting unreviewed for 18+ days, accumulating drift against a codebase that has changed.

**DECISION: Jack closes all claude/* branches by EOD Aug 12, or PM closes them in the Aug 12 DevOps run.**

The list (same as v114, Decision 2):

```
claude/improve-scoring-system-XYGY6  ← highest risk: scoring rewrite, no critique on file
claude/redesign-front-page-EndKs
claude/condense-alert-page-jzdLo
claude/simplify-alerts-page-2ejGB
claude/standardize-venue-data-CufiQ
claude/improve-peakly-ui-UHCHG
claude/streamline-onboarding-account-97XRR
claude/review-peakly-ux-UQ0Qu
claude/simplify-profile-page-Bi2Tc
claude/enhance-loading-screen-rZ1dc
claude/implement-todo-lNL7W
claude/product-reliability-assessment-w0poL
claude/analyze-test-coverage-WVIsT
claude/fix-app-jsx-content
restore-appjsx
fix-appjsx-final
test-small
master
```

`claude/code-review-cleanup-HjoCS` — Jack reviews this one before closing; it may be low-risk.

If Jack hasn't closed them by Aug 12, DevOps runs: `git push origin --delete <all of the above>`.

The scoring branch is the live risk. Every day it sits open is a day a session can accidentally touch it. There is no algorithm critique in `~/.claude/plans/effervescent-jumping-hopper.md` for the current codebase state. The branch merges as-is over our collective dead bodies.

---

## This Week's Top 3 Priorities

1. **Jack deploys VPS** — the one command, 3 minutes, closes #19/#21/#23. New deadline: EOD Aug 12 (Reddit Aug 22 is at risk if this slips further).
2. **DevOps next run: bump cache to `20260810a`, paste LIH venue (Decision 2), paste EU BASE_PRICES batch (ALB/NAP/CAG/FAO/SPU/DLM)** — three mechanical actions in one run.
3. **Jack closes 19 stale branches** — especially `claude/improve-scoring-system-XYGY6`. Hard close by Aug 12.

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **OOL/AGP/LIS/ACE venue adds** | Require new AIRPORT_COORDS entries. Ship LIH first (zero infrastructure cost), then these in a subsequent run after LIH confirms clean. |
| **Scoring system rewrite** (stale branch) | No algorithm critique documented. CLAUDE.md hard rule. CLOSED. |
| **Front page redesign** (stale branch) | No user feedback driving it, 12 days before launch. CLOSED. |
| **JSON-LD / static h1 SEO** | Zero user-facing impact at <100 MAU. Post-launch. |
| **SRI on CDN scripts** | Could break Babel inline eval. Security pass is post-launch. |
| **REC/CEB/NQY/SAL venue adds** | These don't hit BASE_PRICES airports that already have AIRPORT_COORDS. LIH first, these when the pipeline has headroom. Not blocked, just sequenced. |

---

## Success Criteria

**90-day target: 5K–8K users.** Reddit post window shifts to Aug 22.

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit post | One post, average engagement | Thread active 48h, screenshots shared |
| S-hemi ski timing | Post after peak | **Aug 22 is still inside the window (~15 days left)** |
| VPS deployed | No | **Yes — deadline Aug 12, gate before post** |
| BASE_PRICES coverage | 42% | **>55% post EU batch + LIH** |
| Photo quality | 346/373 generic | Top 30 marquee venues with real photos (Unsplash pass) |
| Stale branches closed | No | **Yes — clean repo before launch** |

At 8K we need the VPS working and the Reddit post landing while the S-hemi ski window is still open. Aug 22 is the boundary. Aug 29 is out of the question.

---

## One Product Risk Nobody Is Talking About

**DevOps didn't run today. The pipeline has a single point of failure.**

DevOps is the workhorse: it bumps the cache stamp, applies BASE_PRICES batches, will paste venue adds. When it doesn't run — as today — the cache goes stale, batches don't ship, and nothing in the pipeline catches it. There is no alerting, no retry, no fallback commit. The pipeline is silent on failure.

This matters more in the next 12 days than it did in the past 40. If DevOps skips two consecutive runs before Reddit, we arrive at the post with a stale cache, incomplete deal scoring, and a codebase that hasn't been smoke-checked. The fix is a basic health check: if DevOps has no commit in 26 hours, the PM report should flag it and PushNotification should fire. This report is doing that manually today. It needs to be structural.

---

## Open Items Log

| # | Item | Owner | Status |
|---|------|-------|--------|
| 19 | VPS redeploy | Jack | **P0. Day 18. Reddit = Aug 22. EOD Aug 12 new gate.** |
| 20 | Photos: 346/373 generic | Jack (UNSPLASH_KEY) | P2. Post-launch. |
| 21 | APNS HTTP/2 + P1363 | — | CODE-COMPLETE. Inert until VPS deploy. |
| 22 | Supabase delete-account SQL | Jack | P0 (App Store). 2-min paste. |
| 23 | Weather cache disk persistence | — | CODE-COMPLETE. Inert until VPS deploy. |
| NEW-A | 19 stale branches — scoring rewrite risk | Jack | **P1. Close by EOD Aug 12.** |
| NEW-B | LIH venue (Poipu Beach) approved | DevOps | Ship next run. Zero infra cost. |
| NEW-C | EU BASE_PRICES batch (ALB/NAP/CAG/FAO/SPU/DLM) | DevOps | Ship next run. 24 venues get deal scoring. |
| NEW-D | DevOps pipeline reliability | Infrastructure | Flag if DevOps MIA >26h. Currently MIA today. |
