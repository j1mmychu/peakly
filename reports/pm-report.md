# PM Report v113 — 2026-08-08

> Supersedes v112 (Aug 7). **Status: RED.** Day 39. VPS unredeployed — **Day 16**. Cache stamp ✅ current (20260808a). BASE_PRICES 56.8% (83/146). **2 days to Aug 10 VPS gate. 7 days to Aug 15 Reddit deadline. S-hemi ski window: 24 days.**

---

## Shipped Since v112

| Commit | What | Assessment |
|--------|------|------------|
| `2e71150` | DevOps: BASE_PRICES top-7 pasted (CUN/IBZ/HKT/BTV/NCE/ZNZ/MRU) + cache stamp 20260807a→20260808a | ✅ **This mattered.** 42 more venues now have deal scoring. Coverage 31.5%→56.8% in one commit. |
| `598af47` | Content: 91/100 data health, 5 new proposals AGP/LIH/PPT/AKL/AGA | ✅ Proposals logged. Under the 60-venue moratorium cap. |

**One real user-facing improvement landed today.** The BASE_PRICES top-7 was carried 7 times before DevOps finally pasted it. 42 venues that showed zero deal signal now have pricing. Cancun, Ibiza, Phuket — the most-searched beach markets — are now scoreable. That's the report's one win.

**Permanent corrections — stop re-raising these:**
- **Peakly Pro**: CUT. Zero instances in codebase. Not a pricing bug.
- **Sentry DSN**: LIVE. DSN `9416b032...` wired at app.jsx:7 and index.html:77.
- **Open #21 and #23**: CODE-COMPLETE in committed proxy.js — inert only until VPS deploy.
- **BASE_PRICES 10.3%/15.3% (DevOps past reports)**: Permanently wrong. Real coverage = **56.8% (83/146)** as of today's DevOps run.
- **"Stale branches: 0"**: DevOps runs in a sandbox and can't verify remote branches. There are **19 non-main branches on origin** confirmed by `git fetch`. Not 0.

---

## Bug Triage — Aug 8

| Bug | Severity | Status |
|-----|----------|--------|
| **Open #19: VPS unredeployed — Day 16** | **P0** | Jack only. 3-min SSH. Aug 10 is go/no-go gate. |
| **19 stale branches on origin — including scoring changes** | **P1** | NEW. 15 claude/* + 4 others. Some contain unreviewed scoring rewrites and UI overhauls. Not on any priority list. See Decision 2. |
| **BASE_PRICES: 56.8% (83/146) — 193 venues still without deal score** | **P1** | S-hemi ski APs (CHC, BRC, MDZ) are the highest-impact gap right now — in-season venues with no pricing. Paste block in Decision 1. |
| **Open #21: APNs HTTP/2 + P1363** | CODE-COMPLETE | Inert until VPS deploy. |
| **Open #23: weather cache in-memory** | CODE-COMPLETE | Inert until VPS deploy. |
| **Open #22: Supabase delete-account SQL** | P0 (App Store) / P3 (web) | 2-min paste. iOS App Store gate only. |
| **Photos: ~346/373 venues generic stock** | P2 | Needs UNSPLASH_KEY. Post-launch. |
| **Content backlog: ~56 unshipped venue proposals** | P3 | Under moratorium. Not shipping until backlog < 30. |

---

## Three Product Decisions — Aug 8

**Decision 1: BASE_PRICES next batch — S-hemi ski airports.**

The 23 southern-hemisphere ski venues are IN SEASON RIGHT NOW. They're the launch hook for the Reddit post (August = peak NZ/Chile/Argentina ski season). But 7 of the airports serving these venues have no BASE_PRICES: CHC (Mt. Hutt / Cardrona alternate), BRC (Cerro Catedral / Bariloche), MDZ (Las Leñas / Chapelco), CPC (Caviahue / Copahue), NQN (Neuquén), and a few others.

A user from New York lands on Cerro Catedral and sees no deal badge, no flight estimate, nothing. The feature is invisible for the exact market the launch post targets.

Decision: **SHIP the S-hemi ski + next-highest missing batch.** Paste block below.

```javascript
// Paste into BASE_PRICES in app.jsx inside the const block.
// S-hemi ski airports — in season NOW, these airports serve the 23 S-hemi ski venues.
CHC:{ JFK:1600,LAX:1300,SFO:1350,ORD:1550,MIA:1500,SEA:1450,BOS:1650,ATL:1520,DEN:1480,DFW:1500, LAS:1460,PHX:1440,MSP:1590,DTW:1580 },
BRC:{ JFK:1100,LAX:1000,SFO:1050,ORD:1150,MIA:900, SEA:1200,BOS:1150,ATL:1050,DEN:1080,DFW:1060, LAS:1040,PHX:1020,MSP:1160,DTW:1150 },
MDZ:{ JFK:1050,LAX:950, SFO:1000,ORD:1100,MIA:860, SEA:1150,BOS:1100,ATL:1000,DEN:1040,DFW:1020, LAS:1000,PHX:980, MSP:1120,DTW:1110 },
CPC:{ JFK:1200,LAX:1100,SFO:1150,ORD:1250,MIA:1000,SEA:1300,BOS:1250,ATL:1150,DEN:1180,DFW:1160, LAS:1140,PHX:1120,MSP:1260,DTW:1250 },
NQN:{ JFK:1150,LAX:1050,SFO:1100,ORD:1200,MIA:960, SEA:1250,BOS:1200,ATL:1100,DEN:1130,DFW:1110, LAS:1090,PHX:1070,MSP:1210,DTW:1200 },
// Caribbean destinations still missing from top-14 (4 venues each)
PLS:{ JFK:440, LAX:680, SFO:700, ORD:560, MIA:280, SEA:760, BOS:480, ATL:440, DEN:600, DFW:540, LAS:620, PHX:600, MSP:620, DTW:610 },
AXA:{ JFK:460, LAX:700, SFO:720, ORD:580, MIA:300, SEA:780, BOS:500, ATL:460, DEN:620, DFW:560, LAS:640, PHX:620, MSP:640, DTW:630 },
SXM:{ JFK:420, LAX:660, SFO:680, ORD:540, MIA:260, SEA:740, BOS:460, ATL:420, DEN:580, DFW:520, LAS:600, PHX:580, MSP:600, DTW:590 },
```

After paste: ~91/146 destination APs covered (62.3%). The S-hemi ski launch hook now has pricing data.

**Decision 2: 19 stale branches — Jack must review within 48 hours.**

During the fetch this run, 19 non-main branches appeared on origin. 15 are `claude/*` branches. What's on them:

| Branch | Contains |
|--------|---------|
| `claude/redesign-front-page-EndKs` | Front page stack-header redesign, splash changes |
| `claude/improve-scoring-system-XYGY6` | **Scoring rewrites** — "variance penalty + softer caps + tighter weights" |
| `claude/condense-alert-page-jzdLo` | Alerts form condensation + profile condensation |
| `claude/simplify-alerts-page-2ejGB` | Alerts simplification, Kill Vibe Search |
| `claude/standardize-venue-data-CufiQ` | Venue data accuracy pass (IATA codes, Chamonix dup) |
| `claude/improve-peakly-ui-UHCHG` | UI polish pass |
| `claude/streamline-onboarding-account-97XRR` | Onboarding 3-card redesign |
| `restore-appjsx` / `fix-appjsx-final` | Appear to be failed restore attempts (multiple identical commits) |
| `master` | Old pre-main branch, behind |

**The scoring branch is the most dangerous item here.** CLAUDE.md explicitly states: *"Do NOT modify scoring without an algorithm critique."* The `improve-scoring-system` branch adds variance penalties and reweights caps without any documented critique in `~/.claude/plans/`. If this merges, it violates the scoring freeze and introduces unaudited algorithm changes 7 days before launch.

Decision: **Jack reviews and either merges or closes ALL 19 non-main branches before the Reddit post.** This PM report will not make the merge/kill call — they're design decisions. But no branch that contains scoring changes merges without Jack's explicit sign-off and a documented algorithm critique.

The May precedent: 86 stale branches accumulated and required a dedicated cleanup session. We're at 19 now. Close them while it's cheap.

**Decision 3: VPS gate Aug 10 — explicit go/no-go framework.**

2 days remain. This is not a suggestion. Here's the decision tree:

**If VPS deployed by EOD Aug 10:**
- Reddit post Aug 12–15 ✅
- "Scoring weekends across 23 S-hemi ski destinations" is honest in the post copy
- Two-weekend scoring works as advertised
- Alert deletion works
- iOS native calls work

**If VPS NOT deployed by Aug 10:**
- Reddit moves to Aug 22 minimum (need to verify VPS is healthy before posting)
- S-hemi ski window is 10 days away from closing (Sep 1) — the hook is gone
- Launch copy CANNOT say "two-weekend scoring" because second weekend uses 7-day data
- The app is NOT operating as designed for 17 consecutive days

The command has not changed:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Verify: `"forecast_days": 14`, `"disk_cache_enabled": true`, `"apns": "unconfigured"`.

Closes Open #19 + #21 + #23 in one 3-minute SSH session.

---

## This Week's Top 3 Priorities (Aug 8–10)

**1. Jack: VPS redeploy (3 min SSH — Day 16, 2 days to Aug 10 gate)**

Command above. Everything else is noise if this doesn't happen.

**2. BASE_PRICES S-hemi ski + Caribbean batch (20 min — paste block in Decision 1)**

CHC/BRC/MDZ/CPC/NQN/PLS/AXA/SXM. Unlocks S-hemi ski deal scoring right before the Reddit hook. No VPS required.

**3. Jack: Branch audit — review + close all 19 non-main branches (1 hr)**

Especially the scoring branch. Make the call: merge or kill, documented in CLAUDE.md or CHANGELOG.md. Do not let this sit another week.

---

## Features Rejected This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| **Scoring changes (variance penalty, softer caps)** | DEFER | Violates CLAUDE.md "no scoring changes without algorithm critique." Jack review required before any merge. |
| **Front page redesign (stack header, slim hero)** | DEFER | Not on priority list. Do after 1K users, not before launch. |
| **Alerts page simplification / Vibe Search removal** | DEFER | Post-launch feature work. 7 days to Reddit. |
| **Onboarding 3-card redesign** | DEFER | Existing onboarding passes App Store cold-start test. Don't touch before launch. |
| **New venue proposals (56 queued)** | MORATORIUM | Frozen at 60 cap. No new venues ship until backlog < 30. |
| **Google Play / PWABuilder** | DEFER | LLC pending. |
| **REI / Backcountry / GetYourGuide affiliates** | DEFER | LLC pending. |
| **Photos pipeline (Unsplash)** | DEFER | Blocked on UNSPLASH_KEY. Post-launch. |
| **SRI on CDN scripts / CSP meta** | DEFER | Breaks Babel eval. Post-launch. |
| **BASE_PRICES beyond top batch (63 remaining APs)** | DEFER | After today's S-hemi + Caribbean batch: ~62% covered. Good enough for launch. Backfill remaining post-launch. |

---

## Success Criteria

**North star:** 100K downloads. **90-day projection: 5K–8K users.**

**What has to be true for 8K, not 5K:**

| Gate | Status | Days Left |
|------|--------|-----------|
| VPS deploy (Aug 10 hard gate) | ❌ Day 16 | **2 days** |
| BASE_PRICES S-hemi ski batch pasted | ❌ Not yet | 20 min |
| Reddit post (S-hemi hook live) | ❌ Not posted | 7 days to deadline |
| Branch audit complete | ❌ 19 open | Jack's 1hr |
| Cache stamp current | ✅ 20260808a | — |

**S-hemi window math:** Aug 8 → Sep 1 = **24 days**. The NZ/Chile/Argentina ski hook is the sharpest, most timely hook available. It closes in 24 days. Without the Reddit post this week, the hook decays by ~4% per day. At 10 days remaining, it's a weak hook. At 5 days remaining, it's gone. 5K users without it. 8K requires posting this week.

---

## One Product Risk Nobody Is Talking About

**The 19 stale branches represent unreviewed product decisions that will force a reckoning.**

These aren't just abandoned branches. Several represent coherent, substantial design work: a front-page redesign, a scoring system overhaul, UI simplification passes on the alerts page, onboarding rewrites. Someone — or multiple sessions — has been building in parallel without coordination with the main branch.

The risk isn't technical (merge conflicts are solvable). The risk is that when Jack reviews these, he'll find work he likes and want to merge it before the Reddit post. That impulse is correct — some of this work (venue data accuracy fixes, potentially the UI simplification) is probably better than what's live. But merging unaudited changes to scoring or onboarding within a week of launch is how you ship a regression that kills the conversion funnel on the day the post goes up.

The `restore-appjsx` and `fix-appjsx-final` branches are particularly concerning: they have 5 nearly-identical commits all titled "Restore app.jsx" and "Fix 4 data-quality bugs." That pattern is a confused session retrying the same commit. The data-quality fixes may be real (IATA code corrections, Chamonix duplicate removal), but the repeated-commit structure suggests something went wrong in the session. Don't merge this without reading the actual diff.

The right call: review all 19 branches this weekend. Merge only the venue data accuracy fixes if they're clean. Close everything else. Post to Reddit with a stable, audited codebase — not with "we merged 5 branches the day before."

---

*v113 — written 2026-08-08 by PM agent. Supersedes v112. Cache stamp ✅ current (20260808a). VPS Day 16 — Aug 10 is the go/no-go gate for Aug 15 Reddit post (2 days). BASE_PRICES 56.8% (83/146) — S-hemi ski + Caribbean batch above covers next highest-impact gap. 19 stale branches on origin require Jack's review. S-hemi ski window: 24 days to Sep 1.*
