# Peakly PM Report v150 — 2026-09-14

**Status: 🟡 YELLOW — Cache stamp P1 fixed this run. VPS Day 35 undeployed. Oct 11 Reddit launch on track if Jack SSHes this week.**

---

## Shipped Since Last Report (v149 → v150)

| Commit | What | Right call? |
|--------|------|-------------|
| `bb3ebc8` | **Inline venue search** — search input above category pills, substring match across title/location/tags, result count, hero/carousels suppressed during search | ✅ Was the P0 with a hard deadline. Shipped day-of. |
| `bb3ebc8` | **Semantic dup deleted** — `san-vito-lo-capo-t21` gone (100m from `beach_san_vito_lo_capo`). 405→404 venues | ✅ Quick cleanup bundled correctly. |
| This run | **Cache stamp bumped to `20260914a`** — `app.jsx`, `sw.js`, `index.html` in lockstep | ✅ P1. Venue search was invisible to cached users for 4 days. Fixed now. |

---

## Bug Triage

### P0s — None.

### P1 — Cache Stamp Stale → **FIXED THIS RUN**

`bb3ebc8` (venue search) modified `app.jsx` without bumping `PEAKLY_BUILD` or `sw.js CACHE_NAME`. Result: users with the old SW cached were served the old app.jsx and never saw inline search. Bumped to `20260914a` in this commit. Will push with this report.

Root cause: the `auto-push.sh` hook handles cache bumps for the *hook* path, but this commit was made outside it (scheduled agent / direct git push). The hook needs a note that cloud agent commits bypass it — the manual bump pattern is the fallback.

**No recurrence risk today.** The bump is in this commit.

### P1 — VPS Redeploy (Day 35 — Jack-only)

Unchanged. `proxy.js` correct in repo since Aug 11. Not deployed.

Blocks: two-weekend scoring, iOS native CORS, alert deletion, APNs.

**Deploy (Jack, SSH):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && curl -s localhost:3001/health"
```

**This is the only pre-Reddit gate remaining.** If not done by Sep 20, Oct 11 target is at risk.

### P2 — dist/ Build Collision (Day 6 — Production Unaffected)

The `dist/` committed to git is the iOS vendor-bundle artifact, not the web build. GH Actions rebuilds correctly on every push, so users are never affected. The git tree is cosmetically polluted.

**No action until it causes a real symptom.** Not worth a standalone commit.

### P2 — Tag Density Gap (Day 10 Unchanged)

223/404 venues have only 2 tags (55%). Beach is worst: ~188/270 beach venues at 2 tags. Inline search quality is directly proportional to tag richness. "2 results" for "powder" or "turquoise" after the Reddit post is a bounce.

**Target: <100 venues at 2 tags before Oct 11.**

### P3 — CLAUDE.md Architecture Line Stale

Architecture section says `VENUES (395)` — correct count is 404. Note 9 is accurate. 5-minute fix when someone edits CLAUDE.md next.

---

## Three Product Decisions — Sep 14

### Decision 1: Reddit launch date — HOLD AT OCT 11

VPS redeploy (Jack SSH, ~15 min) is the only remaining gate. If done before Sep 20, Oct 11 is comfortable. If done Sep 20–28, Oct 11 still works but there's no buffer. Past Sep 28, fall back to Oct 18.

**HOLD Oct 11. Zero other gates exist. This is Jack's one action item.**

### Decision 2: Tag enrichment batch — SCHEDULE OCT 5–7

223 under-tagged venues is a launch-week quality problem. Users from the Reddit post search for specific things ("powder day," "clear water," "family beach") and get weak results because 55% of the catalog barely exists in search. Four hours of editorial work would reduce under-tagged venues from 223 to under 100.

**SCHEDULE batch content session Oct 5–7. No tools needed — copy-edit pass on existing venues in app.jsx. Target: 2-tag venues below 100.**

### Decision 3: Features in the Oct 11 Reddit post window — DEFER EVERYTHING EXCEPT BUG FIXES

Multiple `claude/*` branches are open (UI redesign, scoring improvements, alert simplification, loading screen enhancement, onboarding streamline, profile simplify). None of these should land before Oct 11. The risk profile is wrong: any of them could introduce a regression that burns the launch spike.

**CUT all feature branches until Oct 11 is confirmed shipped and the VPS is redeployed. Only bug fixes and tag enrichment between now and launch.**

---

## This Week's Top 3 (Sep 14)

**#1 (Jack): VPS redeploy.** Day 35. Pre-Reddit gate. 15 minutes. Closes Opens #19, #21, #23 simultaneously. If not done this week, the Oct 11 date pressure becomes real.

**#2 (Agent): Tag enrichment batch.** Schedule Oct 5–7. 4 hours. Moves venue discoverability from 45% to 75%+ before launch spike. The difference between 5K and 8K 90-day users is whether people find what they're looking for in search.

**#3 (Agent): Verify smoke tests pass.** Cache stamp was stale 4 days. Run `npm run smoke` after this push lands. If search is broken in headless, diagnose before the Reddit post.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| UI redesign (`claude/redesign-front-page-EndKs`) | **DEFER** | Launch window. Regression risk outweighs marginal UX gain. |
| Scoring improvements (`claude/improve-scoring-system-XYGY6`) | **DEFER** | Scoring changes require algorithm critique per CLAUDE.md. Not a pre-launch item. |
| Alert page simplification (`claude/simplify-alerts-page-2ejGB` / `condense-alert-page-jzdLo`) | **DEFER** | Alerts tab is already functional. Cosmetic refactor before launch is scope creep. |
| Loading screen enhancement (`claude/enhance-loading-screen-rZ1dc`) | **DEFER** | Not a conversion problem. Fix real bugs first. |
| Profile page simplification (`claude/simplify-profile-page-Bi2Tc`) | **DEFER** | Same reasoning — not a launch blocker. |
| Onboarding streamline (`claude/streamline-onboarding-account-97XRR`) | **DEFER** | Onboarding already collapsed from 4→2 screens in Aug. Don't touch it again pre-launch. |

---

## Success Metrics

| Metric | 5K scenario (pessimistic) | 8K scenario (target) |
|--------|---------------------------|----------------------|
| Reddit post timing | Oct 18 (VPS slips) | Oct 11 (VPS done this week) |
| Tag density at launch | 55% under-tagged | <25% under-tagged |
| Search UX | Weak discovery | Venue search actually surfaces right things |
| VPS uptime during spike | Cold cache, rate-limited | Disk-cached + weather proxy live |
| Two-weekend scoring | Off (VPS undeployed) | Live (two-weekend window = product moat) |

**What has to be true for 8K, not 5K:** VPS deployed before Oct 11. Tag enrichment done week of Oct 5. Zero P0 regressions on launch day.

---

## One Product Risk Nobody Is Talking About

**The inline search ships with no debounce and no minimum-char threshold.** A user typing a single letter (e.g. "a") triggers a full-catalog substring scan across 404 venues × 3 fields on every keystroke. On a low-end phone during the Reddit spike, this is a jank risk. It's vanilla JS array filtering so it's fast, but it's worth a mental model check: at 404 venues it's fine. At 4,000 venues it wouldn't be. We're not at 4,000, so this is a non-issue for launch — but the architecture doesn't scale if the catalog grows past ~1,000. Note it and move on.

---

*Report generated: 2026-09-14. Next run: 2026-09-15.*
