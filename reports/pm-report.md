# Peakly PM Report v155 — 2026-09-19

**Status: 🟠 ORANGE — VPS proxy.js Day 41 undeployed. Sep 20 hard deadline is TOMORROW. Code freeze holding (Day 6). 18 stale remote branches confirmed (same accumulation class as May 9). Reddit launch Oct 11 still achievable only if Jack deploys VPS tonight.**

---

## Shipped Since Last Report (v154 → v155)

| Commit | What | Right call? |
|--------|------|-------------|
| `5d16e84` | Content report Sep 19 | ✅ Routine. Venue integrity clean. 225/404 tag gap Day 14. |
| `6f4fe9e` | DevOps report Sep 19 | ✅ Routine. ORANGE status, 18 stale branches surfaced. Brace balance clean. |

**Zero code commits since `bb3ebc8` (venue search, Sep 13). Six days.** Correct. Code freeze holds through Oct 11.

---

## Prompt Context Note

Scheduled prompt references "182 venues, Sentry DSN empty, cache buster stale, Peakly Pro $9/mo vs $79/yr." All four are stale artifacts — same note as v152/v153/v154. Stop re-flagging these:

- **Venues**: 404 (134 skiing / 270 beach). Authoritative.
- **Sentry DSN**: Wired — `9416b032...` at `index.html:77` and `app.jsx:8`. Not empty.
- **Cache stamp**: `20260914a` — correct. No code has shipped since Sep 14. Freeze.
- **Peakly Pro**: UI formally CUT for v1. No pricing anywhere. Not a bug.

---

## Bug Triage

### P0s — None.

### P1 — VPS Redeploy (Day 41 — SEP 20 HARD DEADLINE TOMORROW EOD)

This is v155. Final pre-deadline report.

**Tomorrow's outcome determines the launch date.**

| Outcome | Launch | First Reddit post | Ski tab risk |
|---------|--------|------------------|--------------|
| VPS deployed by Sep 20 EOD | **Oct 11** | r/solotravel + r/skiing | Glacier venues scoring live |
| VPS slips past Sep 20 | Oct 18 | One ski opening weekend gone | Marginal |

The deploy takes 5 minutes. The runbook is in the DevOps report. The agent cannot SSH. Jack can.

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s localhost:3001/health | python3 -m json.tool"
```

From v154 forward: PM reports state VPS status in one line. Full runbook lives in DevOps report.

**v156 will read either "VPS deployed — Oct 11 confirmed" or "VPS missed — Oct 18."**

### P1 — Tag Density (Day 14 Unchanged)

225/404 venues (55.7%) have ≤2 tags. 190/270 beach venues (~70%) are at minimum threshold. Visible to every first-time Explore user.

Fix is the Oct 5 content run. Defer and hold. No exceptions pre-freeze.

### P1 (NEW) — 18 Stale Remote Branches

DevOps surfaced 18 unmerged remote branches today: 15 `claude/` exploratory worktrees plus `fix-appjsx-final`, `restore-appjsx`, `test-small`. This is the same accumulation pattern that hit 86 worktrees on May 9 and cost an hour of cleanup.

None of these branches carry code that should merge. They represent abandoned agent attempts — parallel sessions that opened branches and never closed them.

**Severity**: Not blocking launch. Not causing regressions. But each stale branch is a surface for a confused agent session to merge the wrong thing, or for Jack to accidentally build from the wrong head. Post-Oct 11 cleanup task, not pre-launch.

**Decision below.**

### P2 — Pending Venue Proposals (17 valid, unstaged)

Same 17 as v154. One count reconfirmed by Content today. All deferred to Oct 5 batch. No action until then.

### P3 — dist/ Build Collision (Day 11 — Non-blocking)

CI rebuilds correctly on push. No action.

---

## Three Product Decisions — Sep 19

### Decision 1: VPS is Jack's call. Today is the last day.

The agent has documented this six consecutive reports. The consequence framework is clear. v156 reads the outcome. No further escalation needed in PM reports — if it slips, Oct 18 is the date, and the ski post gets evaluated against an October ski calendar on that date.

**Decision: PM reports shift VPS to a one-line status after v155. The report has done its job; execution is Jack's.**

### Decision 2: Stale remote branches — DEFER to post-Oct 11, but flag now.

18 unmerged branches is a real accumulation problem. The May 9 cleanup took an hour and required force-deleting 86 refs. This is the same trajectory.

However: deleting remote branches requires `git push origin --delete <branch>` for each, and doing that sweep now adds 18 git operations against a frozen codebase, risking a conflict with the CI pipeline on a week where zero production errors is the goal.

**Decision: Prune all 18 stale branches on Oct 5 alongside the content run.** Add this to the Oct 5 run checklist explicitly. If the count hits 25+ before Oct 5, re-evaluate.

### Decision 3: Ski-tab viability check is the Oct 5 run's highest-stakes task.

v153 raised this: on Oct 11 Reddit launch day, the ski tab depends on ~15 N-hemisphere glacier venues (Hintertux, Tignes, Saas-Fee, Val Thorens, Cervinia, Zermatt, etc.) scoring above the confidence threshold. S-hemisphere ski season is ending this weekend (Cardrona, Mt Hutt, Las Leñas close Sep 15–30). If the glacier venues don't produce viable Oct 11 scores, launching to r/skiing with a near-empty tab would be worse than not launching there at all.

**Decision: Oct 5 run includes an explicit dry-run score of all 134 ski venues against Oct 11 weekend dates.** If fewer than 15 ski venues score above the confidence threshold, the r/skiing post moves to December. r/solotravel (beach) launches on Oct 11 regardless. This is not optional — a bad first impression on r/skiing is permanent.

---

## This Week's Top 3

1. **VPS deploy today** — Jack's only action. Tonight. The deadline is tomorrow but tonight is the last safe window.
2. **Oct 5 run checklist confirmed** — Four tasks: 17 venue additions, tag enrichment (190 beach venues), ski-tab viability check, stale branch pruning. Read `tasks/agents/content-data.md` before Oct 5 to confirm scope coverage.
3. **Hold the code freeze through Oct 11** — No commits to app.jsx/sw.js/index.html except the Oct 5 batch. Six days clean. Keep it that way.

---

## Features REJECTED This Week

- **Any code change before Oct 11 except the Oct 5 batch** — Code freeze. Regression risk outweighs any marginal gain.
- **Adding venues before Oct 5** — 17 proposals queued. Batch add. No individual commits.
- **APNS wiring** — Uncommitted local fix exists. Do not land before Reddit launch. Defer to post-launch v2.
- **Branch pruning now** — Non-blocking, 18 branches. Oct 5 sweep is safer than a pre-launch git sweep.
- **r/skiing post if ski tab is thin** — Decision 3 above. Score first. Post only if ≥15 venues are viable on Oct 11 dates.

---

## Success Criteria

### What defines success?

- **Day 1 (Oct 11 Reddit post):** 500+ unique visitors, <30% bounce on Explore, 50+ wishlists saved.
- **Week 1:** 1,000 registered users (magic-link), 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K not 5K?

Three variables. No new signal changes the equation:

1. **Flight pricing works on Day 1.** VPS deployed by Sep 20. LIVE badges, not `~$X` estimates, in the first Reddit screenshots.
2. **Tags feel rich on Explore.** Oct 5 run enriches ≥190 beach venues from 2 tags to 4+. A "Best beach weekend" search that returns thin, under-described venues is a bounce. Four tags is the minimum that makes a card feel considered.
3. **Traffic spike survives.** The VPS weather cache (bundled in the proxy deploy) is the only protection against an Open-Meteo rate-limit event during a Reddit front-page spike. Without the cache, 66+ concurrent DAU on overlapping venues hits the free-tier ceiling. This is not theoretical — it happened to similar projects.

---

## One Product Risk Nobody Is Talking About

**Oct 5 is carrying four tasks with one automated run and no human review step.**

17 venue additions. Tag enrichment on 190 venues. Ski-tab viability check. 18 stale branch deletions. That's a diff touching every part of `app.jsx`'s VENUES array, every beach venue's tag array, and the git remote refs — simultaneously, one week before launch.

The auto-push guard (brace balance, venue count floor) catches structural breaks. It does not catch:
- A tag value with a stray `"` that passes JS eval but breaks the venue filter
- A venue coordinate that validates locally but maps to the wrong region
- A batch paste where two venues share an `id` field (the boot-time validator catches this, but only after the page loads — not in CI)

**Mitigation**: Before committing the Oct 5 diff, run `node scripts/validate-venues.mjs` on the staged entries. Output the diff stats (venue count delta, brace balance, tag coverage) as a pre-commit checkpoint. If the diff exceeds 500 lines, stage for manual review before pushing. Jack should be available to eyeball the diff on Oct 5 — this is not a fire-and-forget automated run.

A bad Oct 5 commit that ships silently to production on Oct 8 and isn't caught until Oct 11 Reddit launch day is the single scenario that collapses all three success variables simultaneously.

---

*Report generated 2026-09-19 by the daily PM agent. v155.*
