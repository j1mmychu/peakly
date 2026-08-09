# PM Report v114 — 2026-08-09

> Supersedes v113 (Aug 8). **Status: RED.** Day 40. VPS unredeployed — **Day 17**. Cache stamp ✅ current (`20260809a`). BASE_PRICES **corrected to 41.8% (61/146)** — prior 56.8% figure was wrong (see Section 2). **Aug 10 VPS gate is TOMORROW. 6 days to Aug 15 Reddit deadline. S-hemi ski window: 23 days.**

---

## Permanent Corrections — Stop Re-Raising These

| Claim | Reality |
|---|---|
| "Peakly Pro showing $9/mo" | **CUT. Zero instances in codebase.** Not a bug. |
| "Sentry DSN empty" | **LIVE** — `9416b032...` wired in `index.html:77` + `app.jsx:7`. |
| "Cache buster stale" | **✅ Current — `20260809a`**, bumped by DevOps this run. |
| "BASE_PRICES 56.8% covered (83/146)" | **WRONG — corrected to 41.8% (61/146).** Prior agents counted BASE_PRICES outer keys (91), not matched venue-AP entries (61). 30 of 91 BASE_PRICES airports have zero venues. See Section 2. |
| "Open #21 and #23 not fixed" | **CODE-COMPLETE** — committed to proxy.js, inert until VPS deploy. |
| "VPS is down / 403" | **Sandbox egress block, not VPS.** Last verified healthy 2026-07-24. Stop. |
| "182 venues / 12 categories" | **373 venues, 2 categories (skiing + beach only).** Pivot May 2026. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "lateSeason count = 14" | **9 confirmed by grep.** Always grep live. |

---

## Shipped Since v113

| Commit | What | Assessment |
|--------|------|------------|
| `8bdb500` | DevOps: BASE_PRICES S-hemi ski + Caribbean batch (CHC/BRC/MDZ/CPC/NQN/PLS/AXA/SXM), cache stamp `20260808a→20260809a` | ✅ **High-value.** All 23 S-hemi ski venues now have deal pricing. The launch hook for the Reddit post (Aug = peak NZ/Chile/Argentina ski season) is fully scoreable. |
| `ffbdbee` | Content: 90/100 health, BASE_PRICES corrected to 41.8%, 5 new proposals REC/CEB/OOL/NQY/SAL | ✅ Correction is important. Proposals logged but not shipped (moratorium). |

**Two things landed today.** The S-hemi ski pricing batch is the one that actually mattered — every in-season ski venue now has a deal signal. The coverage correction is a data-quality win (knowing the real number is worse than thinking you're at 56.8%).

---

## Bug Triage — Aug 9

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 17** | **P0** | Jack only. 3-minute SSH. Aug 10 gate is tomorrow. See Decision 1. |
| **BASE_PRICES: 41.8% real coverage — 85 venue APs missing deal score** | **P1** | Next batch: ALB/NAP/CAG/FAO/SPU/DLM (6 EU airports, 4 venues each = 24 venues). DevOps should paste on next run. |
| **19 stale branches on origin** | **P1** | No movement from Jack. `claude/improve-scoring-system-XYGY6` is the risk — scoring rewrite, unreviewed. See Decision 2. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) / P3 (web) | 2-min paste into Supabase SQL editor. iOS App Store gate only. Jack action. |
| **Photos: ~346/373 venues generic stock** | P2 | Needs UNSPLASH_KEY. Post-launch. |
| **Content backlog: 57 consecutive sessions unshipped** | P3 | Queue is broken. See Decision 3. |

---

## Three Product Decisions — Aug 9

### Decision 1: Aug 10 VPS Gate — Binary Call

**Tomorrow is the gate.** This is not a carry. Every day of delay costs:
- Two-weekend scoring is silently broken for 100% of users
- iOS native apps can't reach the proxy (CORS)
- Alert deletion has never worked
- S-hemi ski venues have deal pricing in the client code that the VPS can't serve

**The deploy is one command:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && \
  curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected response: `"forecast_days": 14`, `"disk_cache_enabled": true`, `"apns": "unconfigured"`.

**Decision: SHIP the VPS deploy by EOD Aug 10 or Reddit moves to Aug 22.** No middle ground. The app we are about to post about doesn't work properly until this runs. If it hasn't happened by Aug 11 morning, the Reddit post is off the table for this window and the PM will shift all priorities accordingly.

---

### Decision 2: 19 Stale Branches — Close All Claude Branches Unopened

17 days of daily reports later, the branches remain. Jack has not reviewed them. This is the decision:

**CLOSE all `claude/*` branches WITHOUT merging.** All 15 of them.

Here's why:

1. **The scoring branch (`claude/improve-scoring-system-XYGY6`) is the live risk.** CLAUDE.md says "Do NOT modify scoring without an algorithm critique." There is no critique on file. If it merges, we launch with an unaudited scoring change and no rollback path except reverting a merge.

2. **The other branches are superseded.** UI redesigns, onboarding reworks, profile condensation — all authored against a codebase that has changed. Merging any of them risks conflicts and regressions 6 days before launch.

3. **The restore branches (`restore-appjsx`, `fix-appjsx-final`) are cleanup artifacts.** Not code we want.

4. **Keeping them open creates drift.** Each day they exist is another day a session might accidentally reference or merge stale work.

**Action for Jack:** `git push origin --delete claude/improve-scoring-system-XYGY6 claude/redesign-front-page-EndKs claude/condense-alert-page-jzdLo claude/simplify-alerts-page-2ejGB claude/standardize-venue-data-CufiQ claude/improve-peakly-ui-UHCHG claude/streamline-onboarding-account-97XRR claude/review-peakly-ux-UQ0Qu claude/simplify-profile-page-Bi2Tc claude/enhance-loading-screen-rZ1dc claude/implement-todo-lNL7W claude/product-reliability-assessment-w0poL claude/analyze-test-coverage-WVIsT claude/fix-app-jsx-content restore-appjsx fix-appjsx-final test-small master`

**Defer:** `claude/code-review-cleanup-HjoCS` — if this contains a code-review pass, it may be low-risk. Jack spot-checks this one before closing.

---

### Decision 3: Content Backlog Moratorium — Set a Ship Date or Kill the Queue

57 consecutive sessions. The content pipeline generates proposals; nothing ships. The queue is broken.

Two options:

**Option A — Kill the queue.** The 5 proposals from each of the last ~57 sessions are stale. Start fresh after launch with a venue add session where proposals are applied in the same run they're generated. Stop letting the backlog grow.

**Option B — Ship one batch now.** Today's 5 proposals (REC/CEB/OOL/NQY/SAL) are genuinely good — they all target BASE_PRICES-only airports, all have AIRPORT_COORDS included, all are ready-to-paste. The DevOps agent can paste them in the next run, the same way it pastes BASE_PRICES entries. If we're going to ship any venues before launch, these are the ones — every BASE_PRICES-only AP we add venues to is a venue that immediately has deal scoring.

**Decision: Option B — DevOps pastes the REC/CEB/OOL/NQY/SAL batch on the next run.** The backlog beyond these 5 is closed. All prior unshipped proposals from sessions 1-56 are archived, not ships. The moratorium on *new proposals beyond 5/session* holds. This clears the queue mechanically and adds 5 genuinely useful venues.

---

## This Week's Top 3 Priorities

1. **Jack deploys VPS by EOD Aug 10** — one command, closes Open #19/#21/#23 simultaneously, unblocks the Reddit post.
2. **Jack closes the 19 stale branches** — especially the scoring branch, before any session can touch it.
3. **DevOps pastes EU beach BASE_PRICES batch** (ALB/NAP/CAG/FAO/SPU/DLM) on next run — 24 more venues get deal scoring. Paste block:

```javascript
// European beach airports — 4 venues each, high-traffic routes. Paste into BASE_PRICES.
ALB:{ JFK:720, LAX:920, SFO:960, ORD:800, MIA:780, SEA:1050, BOS:760, ATL:820, DEN:880, DFW:840, LAS:900, PHX:880, MSP:860, DTW:850 },
NAP:{ JFK:680, LAX:880, SFO:920, ORD:760, MIA:740, SEA:1010, BOS:720, ATL:780, DEN:840, DFW:800, LAS:860, PHX:840, MSP:820, DTW:810 },
CAG:{ JFK:750, LAX:950, SFO:990, ORD:830, MIA:810, SEA:1080, BOS:790, ATL:850, DEN:910, DFW:870, LAS:930, PHX:910, MSP:890, DTW:880 },
FAO:{ JFK:540, LAX:740, SFO:780, ORD:620, MIA:600, SEA:870, BOS:580, ATL:640, DEN:700, DFW:660, LAS:720, PHX:700, MSP:680, DTW:670 },
SPU:{ JFK:700, LAX:900, SFO:940, ORD:780, MIA:760, SEA:1030, BOS:740, ATL:800, DEN:860, DFW:820, LAS:880, PHX:860, MSP:840, DTW:830 },
DLM:{ JFK:680, LAX:880, SFO:920, ORD:760, MIA:740, SEA:1010, BOS:720, ATL:780, DEN:840, DFW:800, LAS:860, PHX:840, MSP:820, DTW:810 },
```

---

## Features Rejected This Week

| Feature | Reason |
|---------|--------|
| **Scoring system rewrite** (stale branch) | No documented algorithm critique. CLAUDE.md hard rule. Violates the scoring freeze 6 days before launch. CLOSED. |
| **Front page redesign** (stale branch) | Design change 6 days before launch with no user feedback driving it. CLOSED. |
| **JSON-LD structured data** | Legitimate SEO lift but zero user-facing impact at <100 MAU. Post-launch. |
| **Static h1 SEO fallback** | Same rationale. Post-launch. |
| **SRI on CDN scripts** | Could break Babel inline eval. Risk/reward wrong pre-launch. DEFER post-launch security pass. |
| **Venue deep links** | Already decided: build AFTER Reddit launch. Don't relitigate. |

---

## Success Criteria

**90-day target: 5K–8K users.** What gets us to 8K vs 5K:

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit post | One post, moderate engagement | Thread stays active 48h, screenshots shared |
| S-hemi ski timing | Launch after the window closes | **Post this week** — Aug = peak NZ/Chile ski. The "ski weekend" angle is only fresh for ~3 more weeks. |
| VPS deployed | No | **Yes** — two-weekend scoring works, iOS users can actually use the app |
| Photo quality | 346/373 generic | At least marquee venues (top 30 by score) have real photos |
| BASE_PRICES coverage | 41.8% | **>60%** — more venues show deal badges, deal badge is the retention hook |

The VPS deploy and the timing of the Reddit post are the two variables that shift 5K to 8K. Both are Jack-only actions in the next 24–48 hours.

---

## One Product Risk Nobody Is Talking About

**The app is invisible to users without a home airport set.**

The `seasonalDefaultCat()` helper picks skiing or beach based on hemisphere + month. That's working. But `applyFilters()` has a `maxFlightHrs` default of 6 hours — and `flightHours()` requires a home airport to compute. A brand-new user who hasn't set a home airport gets the full unfiltered list, which is 373 venues. That sounds better but it's actually worse: without flight context, the deal score shows `~$XXX` estimates from BASE_PRICES for 58% of venues and nothing for the other 42%. The first impression is a wall of incomparable scores with inconsistent pricing.

The fix isn't hard — a "set your home airport" prompt before the grid renders, or at least before the first time the flight filter chip is shown. But nobody is building it because the onboarding branch is stale in a `claude/*` branch we're about to close. Worth flagging before the Reddit post sends first-time users into a cold, airportless state.

---

## Open Items Log

| # | Item | Owner | Status |
|---|------|-------|--------|
| 19 | VPS redeploy | Jack | **P0. Aug 10 gate = TOMORROW.** |
| 20 | Photos: 346/373 generic | Jack (UNSPLASH_KEY) | P2. Post-launch. |
| 21 | APNS HTTP/2 + P1363 | — | CODE-COMPLETE. Inert until VPS deploy. |
| 22 | Supabase delete-account SQL | Jack | P0 (App Store). 2-min paste. |
| 23 | Weather cache disk persistence | — | CODE-COMPLETE. Inert until VPS deploy. |
| NEW | 19 stale branches — scoring rewrite risk | Jack | **P1. Close by Aug 10.** |
| NEW | User onboarding: no airport → broken first impression | Product | P2. Pre-Reddit. |
| NEW | BASE_PRICES EU batch (ALB/NAP/CAG/FAO/SPU/DLM) | DevOps | P1. Next DevOps run. |
