# Peakly PM Report v196 — 2026-10-30 (LAUNCH DAY +12)

**Status: 🔴 RED — VPS Oct 30 hard deadline MISSED. Day 82. 80 days since last code commit. 15 new unmerged `claude/*` branches appeared overnight. Whistler opens Nov 21 — 22 days.**

> **Stale prompt notice — Day 24 (unchanged):** The stored cron prompt still says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: **404 venues (134 skiing / 270 beach), 2 categories, Pro cut, Sentry live, BASE_PRICES 100%.** Jack: 2-minute fix in the Claude.ai interface.

---

## Shipped Since Last Report (v195 → v196)

| Commit | What | Right call? |
|--------|------|-------------|
| `d1806ca` | DevOps Oct 30 — RED, VPS deadline missed (today), 15 new claude/* branches flagged, .venue-baseline missing | ✅ reporting |
| `e6998e1` | Content Oct 30 — 88/100, GNB/VCE AIRPORT_COORDS gap, 5 new venue proposals (Sölden/Obertauern/Alpe-d'Huez/Bombinhas/Bazaruto), Nov 14 as VPS hard deadline | ✅ reporting |

**Seven consecutive days post-code-freeze. Zero app.jsx / sw.js / index.html commits. VPS unchanged. Sprint queue Day 7.**

---

## Overnight Activity: 15 New Claude Branches

Today's fetch surfaced 15 new `claude/*` branches on origin that did not exist yesterday:

```
claude/analyze-test-coverage-WVIsT
claude/code-review-cleanup-HjoCS
claude/condense-alert-page-jzdLo
claude/enhance-loading-screen-rZ1dc
claude/fix-app-jsx-content
claude/implement-todo-lNL7W
claude/improve-peakly-ui-UHCHG
claude/improve-scoring-system-XYGY6
claude/product-reliability-assessment-w0poL
claude/redesign-front-page-EndKs
claude/review-peakly-ux-UQ0Qu
claude/simplify-alerts-page-2ejGB
claude/simplify-profile-page-Bi2Tc
claude/standardize-venue-data-CufiQ
claude/streamline-onboarding-account-97XRR
```

Plus: `fix-appjsx-final`, `restore-appjsx`, `test-small`.

**These are the highest-priority item for Jack to review before ANY push to main.** Branch names like `fix-app-jsx-content`, `restore-appjsx`, and `improve-scoring-system` suggest substantive code changes that could conflict with or overwrite the Aug 11 production baseline. The names `redesign-front-page` and `simplify-alerts-page` are especially concerning — these are core flows and any unreviewed redesign landing in main could break the product.

**None of these are in main. Risk is potential, not live. But if any branch gets merged to main (or to master, which triggers deploy), it ships unreviewed.**

---

## Bug Triage

### P0-A — VPS Redeploy: TODAY WAS THE DEADLINE. MISSED. 🚨

Day 82. Oct 30 hard deadline passed. Four production bugs remain live:

| Bug | User impact |
|-----|-------------|
| `forecast_days:7` on VPS | Whistler invisible in two-weekend scoring until Nov 7 (7 days left) |
| `_wxCache` in-memory | Reddit spike = 404 simultaneous Open-Meteo requests = rate ceiling hit = weather down |
| `capacitor://localhost` absent from CORS | iOS native: no weather, no pricing |
| `DELETE` blocked by CORS | Alert deletion has never worked |

**Hard deadline math:** Nov 7 is the LAST viable date for the VPS redeploy. `forecast_days:14` from Nov 7 reaches Nov 21 (Whistler opening day). Nov 8 or later = Whistler won't appear in the two-weekend window on opening day. The margin is 8 days and shrinking by one per day.

**Jack's 5-minute fix:**
```bash
rsync -av ~/peakly/server/proxy.js root@198.199.80.21:/opt/peakly-proxy/
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

### P0-B — 15+ Unmerged `claude/*` Branches: REVIEW BEFORE REDDIT POST 🚨

New today. These branches represent unreviewed code changes. Before posting to Reddit:

1. Jack must review each branch for whether it improves or degrades the product
2. Merge what's worth keeping; delete the rest
3. Especially scrutinize: `fix-app-jsx-content`, `restore-appjsx`, `improve-scoring-system`, `redesign-front-page`

This is a 60-90 min review session, not a 5-minute action. It needs to happen before the Reddit post, not after. A branch that auto-deploys stale or broken code to main would be catastrophic at launch timing.

### P1-A — Sprint Queue: Day 7, BLOCKED-HUMAN-ACTION

Still pending (all <30 min in a local Claude Code session):
1. Cache stamp `20260914a` → `20261030a` + `PRECACHE = []`
2. `deploy.yml` master trigger removal
3. `.venue-baseline` file missing (auto-push venue guard will fail on next app.jsx commit)
4. JSON-LD (optional, ship before Nov 7 if possible)

### P1-B — Venue Proposals Queue: 20+ Frozen

Content added 5 more today despite the freeze. Queue now exceeds 20. The Content agent is not respecting the cap. New directive in Decision 2.

### P2 — Tag Depth: 225 Venues at 2 Tags

55.7% of catalog has only 2 tags. Impacts `scoreVibeMatch` and search recall. Not a launch blocker but meaningful quality debt.

---

## Three Product Decisions — Oct 30

### Decision 1: VPS Nov 7 is the final, non-negotiable deadline.

Oct 30 passed without action. The new hard deadline is **Nov 7** — the last date a `forecast_days:14` deployment can reach Whistler's Nov 21 opening weekend. Missing this deadline means the flagship ski launch timing (Whistler opening day) will feature broken two-weekend scoring.

**DECISION: SSH by Nov 7 or the Reddit launch timing must shift to December (post-Whistler-opening when more ski inventory is in-season anyway). No further extensions.**

### Decision 2: Content agent must stop proposing venues. Hard stop.

The queue is at 20+ and growing despite two explicit freeze decisions (v193, v195). Content is adding 5 venues per day regardless of the directive. The issue is the stored prompt — it incentivizes venue proposals and there's no counter-incentive.

**DECISION: The stored Content agent prompt must be updated to remove the daily venue proposal section until the queue is cleared. Jack: edit the scheduled Content routine to comment out the "suggest 5 new venues" instruction. Until the prompt is changed, the queue will keep growing. This is a 2-minute change in the Claude.ai scheduler interface.**

### Decision 3: `claude/*` branch review is now a pre-Reddit-launch gate.

15 branches on origin representing unreviewed code. Some of them (redesign-front-page, improve-scoring-system) could represent significant regressions if merged. Treating this as routine branch cleanup underestimates the risk.

**DECISION: Branch review is added to the Reddit launch checklist as a gate. No Reddit post until Jack has reviewed all 15+ branches and either merged, closed, or deleted each one. Estimated time: 60-90 minutes in a local session.**

---

## Priority List — This Week Only

| # | Item | Decision | Deadline | Owner |
|---|------|----------|----------|-------|
| 1 | VPS SSH (proxy.js redeploy) | SHIP | **Nov 7 (hard)** | Jack |
| 2 | Review + close all 15 `claude/*` branches | SHIP | Before Reddit post | Jack |
| 3 | Sprint session (cache stamp + PRECACHE + master cleanup) | SHIP | Before Reddit post | Jack |

Everything else deferred.

---

## Features REJECTED This Week

- **New venue proposals:** REJECTED. Queue at 20+, growing, zero merges. Stop adding.
- **Tag depth enrichment (225 venues, 2 tags):** DEFERRED post-launch. Quality debt, not launch blocker.
- **APNS push setup:** DEFERRED. Not needed for Reddit launch, requires Jack's .p8 key enrollment.
- **Photo replacement (~360 generic venues):** DEFERRED. Needs Unsplash API key. Post-launch.
- **Scoring system redesign:** REJECTED until reviewed. A `claude/*` branch for this exists unreviewed — do not touch scoring until the branch is evaluated and the CLAUDE.md algorithm critique process is followed.

---

## Success Criteria

**90-day projection: 5K–8K users. What gets us to 8K:**
1. Reddit launch timing hits Whistler opening week (needs VPS Nov 7)
2. Zero regressions from unreviewed branches landing in main
3. Venue queue clears before launch (20 new venues = more destinations = more search surface)
4. JSON-LD indexed before Whistler opening (needs ship by Nov 7)

**At 5K, the model shows $38/mo revenue. At 8K it shows $61/mo. Gap is almost entirely timing — launch during ski season opening vs. mid-season.**

---

## One Product Risk Nobody Is Talking About

**The 15 `claude/*` branches are not just a branch hygiene problem — they may represent a parallel product.**

Branch names like `redesign-front-page`, `improve-peakly-ui`, `simplify-alerts-page`, `simplify-profile-page`, `streamline-onboarding-account`, and `improve-scoring-system` suggest a comprehensive UI/UX rework was attempted in parallel cloud sessions. If these branches were generated from automated agents (which the naming pattern suggests), there may be significant divergence from the production baseline — and significant risk that a well-intentioned merge breaks something the Aug 11 smoke test validated.

The risk isn't that bad code exists in branches — it's that **Jack might merge one of these on the assumption it's safe without knowing what the others touched**. A merge conflict isn't the danger; a clean merge of incompatible assumptions is.

**Action before Reddit post:** Jack should spend 5 minutes listing what each branch changed (`git diff main...<branch> --stat`) before doing anything else. Delete any branch that touches `app.jsx` in a way that's incompatible with the current 404-venue, 14,237-line production file. The restore-appjsx branch name alone suggests something went wrong in a session.

---

*Report written: 2026-10-30 by PM agent v196. Next: VPS redeploy needed by Nov 7.*
