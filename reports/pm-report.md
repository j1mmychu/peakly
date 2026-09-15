# Peakly PM Report v151 — 2026-09-15

**Status: 🟡 YELLOW — VPS proxy.js Day 36 undeployed (flight fares broken). No code commits today. Oct 11 Reddit gate still standing, but Jack's one action item is now overdue.**

---

## Shipped Since Last Report (v150 → v151)

| Commit | What | Right call? |
|--------|------|-------------|
| `96def81` | Cache stamp bump to `20260914a` + PM report v150 | ✅ Correct. Fixed 4-day cache stale on venue search. |
| `76953c8` | DevOps report 2026-09-15 | ✅ Routine. |
| `c179056` | Content report 2026-09-15 | ✅ Routine. |

**Zero code commits since `bb3ebc8` (venue search, Sep 13).** This is correct — per Decision 3 of v150, no features between now and Oct 11. The quiet is intentional.

---

## Bug Triage

### P0s — None.

### P1 — VPS Redeploy (Day 36 — Jack-only, OVERDUE)

`proxy.js` has two undeployed commits (`3152c96` Sep 09, `c760dfb` Sep 10) that fix the fare-fallback logic. Without them, the proxy returns no fare for ~99% of routes because Travelpayouts' matrix rarely has an exact-Friday departure. Users see `~$X` estimates everywhere. **The flight pricing feature is functionally broken.**

The Sep 20 soft deadline from v150 is 5 days away. If Jack hasn't acted by now, he needs to today.

**Deploy (5 minutes, Jack only):**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health"
```

Verify: `health.uptime` resets to seconds; `/api/flights` returns a fare with `returnDate` within 7 days.

**If VPS is not deployed by Sep 20, move Reddit launch to Oct 18. Do not post to Reddit with broken flight pricing.**

### P1 — Tag Density (Day 11 Unchanged)

223/404 venues (55%) have only 2 tags. Beach is acute: ~188/270 beach venues at 2 tags. Inline search is live; the catalog is the bottleneck now.

The Oct 5–7 enrichment window from v150 stands. That's 20 days out — still comfortable if it starts on schedule.

### P2 — dist/ Build Collision (Day 7 — Production Unaffected)

GH Actions rebuilds `dist/` correctly on every push. The committed artifact is cosmetically wrong. Non-blocking. No action.

### P3 — CLAUDE.md Architecture Count Stale (Day 4)

Line 66 says `VENUES (395)`. Correct count is 404. Fix in-line when any CLAUDE.md edit happens next. Not worth a standalone commit.

---

## Three Product Decisions — Sep 15

### Decision 1: VPS deploy deadline — SEP 20 IS HARD

This has been "Jack's one action item" for 36 days. v148 called it the only pre-Reddit gate. v150 set Sep 20 as the soft deadline. Nothing moved.

**The deadline is now hard.** If VPS is not deployed by Sep 20 end-of-day, the Oct 11 Reddit launch date must slip to Oct 18. That's the decision. No extensions.

Flight pricing broken = leading feature of the product doesn't work = Reddit post will get "the prices are wrong" in comments = bounce. The product is incomplete without it.

### Decision 2: Tag enrichment — START OCT 5, NO EXCEPTIONS

The content report confirms 223 under-tagged venues (Day 11 unchanged). The window is Oct 5–7. This is the agent's job, not Jack's. A scheduled content-agent run on Oct 5 with explicit instructions to bulk-add tags to under-tagged beach venues gets this done in one session.

**SCHEDULE a dedicated tag-enrichment run for Oct 5.** Target: under 100 venues at 2 tags before Oct 11 post.

### Decision 3: Open `claude/*` branches — DELETE THEM

There are 11+ `claude/*` branches open in the remote. Every one of them was rejected in v150 (UI redesign, scoring improvements, alert simplification, loading screen, onboarding, profile simplify). They've been sitting for weeks. They're not getting merged pre-launch. Every time a new agent session runs, it sees them and reconsiders — which is wasted cycles.

**DELETE all `claude/*` branches.** Jack can run `git push origin --delete claude/<name>` for each, or batch-delete via GitHub UI. If any of them contain work worth saving, it should be cherry-picked to a named branch with a proper description. The graveyard of half-finished agent worktrees is noise.

---

## This Week's Top 3 (Sep 15)

**#1 (Jack): VPS redeploy by Sep 20.** Hard deadline. Closes Opens #19, #21, #23. Unlocks flight pricing, two-weekend scoring, iOS CORS, alert deletion. 5 minutes. The app is not launch-ready without it.

**#2 (Jack): Delete `claude/*` remote branches.** 11+ stale branches are noise. Batch-delete now; keeps the repo clean and stops agents from relitigating rejected features.

**#3 (Agent, Oct 5): Tag enrichment sprint.** 223 under-tagged venues. Target: <100 at 2 tags. Required for search to work at scale on launch day.

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| UI redesign (`claude/redesign-front-page-EndKs`) | **CUT pre-launch** | Regression risk outweighs gain. Revisit post-Oct 11. |
| Scoring improvements (`claude/improve-scoring-system-XYGY6`) | **CUT pre-launch** | Algorithm critique required per CLAUDE.md. Not a pre-launch item. |
| Alert page simplification | **CUT pre-launch** | Functional. No blocking issue. |
| Loading screen enhancement | **CUT pre-launch** | Not a conversion problem. Fix real bugs first. |
| Profile simplification | **CUT pre-launch** | Not a launch blocker. |
| Onboarding streamline | **CUT pre-launch** | Onboarding already optimized in Aug. Don't touch it again. |
| 5 new venues (Grindelwald, Sestriere, Koh Lanta, Amed Bali, Noosa) | **DEFER** | Content agent proposals. Valid. Add during Oct 5 enrichment sprint, not as a standalone commit. |

---

## Success Metrics

| Metric | 5K scenario (pessimistic) | 8K scenario (target) |
|--------|---------------------------|----------------------|
| Reddit post timing | Oct 18 (VPS slips past Sep 20) | Oct 11 (VPS done by Sep 20) |
| Tag density at launch | 55% under-tagged (no enrichment) | <25% under-tagged (Oct 5 sprint) |
| Flight pricing | Broken (~$X estimates everywhere) | Live fares for most routes |
| Two-weekend scoring | Off | Live |
| VPS uptime on spike | Cold cache, rate-limited | Disk-cached + weather proxy live |

**The fork is Sep 20.** One action (VPS redeploy) determines whether this is the 5K or 8K outcome. Everything else is execution.

---

## One Product Risk Nobody Is Talking About

**There are zero analytics on search.** Venue search shipped `bb3ebc8` without a Plausible event on search interactions. We will have no data on what users are searching for, which searches return zero results, or whether search is driving venue views. The Reddit spike is the first real signal on whether the catalog actually surfaces what people want. Without instrumentation, we'll be flying blind and won't know if "powder" returns 0 results is a content problem or a code problem.

A `search_query` + `search_results_count` Plausible event on the search input (debounced, 500ms) is a 20-line add. It should go in before Oct 11. No regression risk — pure addition. This is the lowest-effort, highest-learning item on the board right now.

---

*Report generated: 2026-09-15. Next run: 2026-09-16.*
