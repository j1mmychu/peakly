# Peakly PM Report v156 — 2026-09-20

**Status: 🔴 RED — VPS proxy.js Day 42. Sep 20 is TODAY — the hard deadline from v154. If undeployed by end of day, Oct 11 launch moves to Oct 18. Code freeze holding (Day 7). No regressions.**

---

## Shipped Since Last Report (v155 → v156)

| Commit | What | Right call? |
|--------|------|-------------|
| `4367f5b` | DevOps report Sep 20 (RED) | ✅ Routine. VPS deadline correctly called as TODAY. |
| `bd12891` | Content report Sep 20 | ✅ Routine. Flagged Sep 19 proposal quality issue (4 of 5 were dupes). |

**Zero code commits since `bb3ebc8` (venue search, Sep 13). Seven days. Correct. Code freeze holds.**

---

## Prompt Context Note

Scheduled prompt references "182 venues, Sentry DSN empty, cache buster stale, Peakly Pro $9/mo vs $79/yr." All four remain stale. For the record one final time:

- **Venues**: 404 (134 skiing / 270 beach). DevOps and Content both confirmed today.
- **Sentry DSN**: Wired — `9416b032...` at `index.html:77` and `app.jsx:8`.
- **Cache stamp**: `20260914a` — correct for a code freeze. 7 days old.
- **Peakly Pro**: UI formally CUT for v1. No pricing anywhere. Not a bug.

---

## Bug Triage

### P0s — None.

### P1 — VPS Redeploy: DEADLINE IS TODAY

**v155 said v156 would read either "VPS deployed — Oct 11 confirmed" or "VPS missed — Oct 18." This is that report.**

As of this run: VPS still undeployed per DevOps Sep 20 (agent sandbox has no egress to verify live — last confirmed healthy was 2026-08-11 by Jack via SSH). The DevOps runbook is unchanged:

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health"
```

**If deployed today:** Oct 11 Reddit launch. Two-weekend scoring live. iOS native unblocked. Alert deletion fixed.

**If it slips past today:** Oct 18 launch. One ski opening weekend gone. The r/skiing post moves to a less optimal date on the ski calendar.

Starting v157, VPS status becomes a one-line flag, not a section. The report has done its job. Execution is Jack's.

### P1 — Tag Density (Day 15 Unchanged)

225/404 venues (55.7%) have ≤2 tags. 190/270 beach venues at minimum. Deferred to Oct 5 content run. Hold.

### P1 — Sep 19 Proposal Quality Issue (New)

Content surfaced that 4 of 5 venue proposals in the Sep 19 report were duplicates already in catalog (Kitzbühel, Les Arcs, Bansko, Arugam Bay — different IDs, same locations). Only `schladming-at` was genuinely new.

**Impact on Oct 5 run**: The 17-venue batch queued for Oct 5 may contain additional dupes from prior proposal rounds. Before the Oct 5 agent commit, run a cross-check against existing IDs and lat/lon coordinates. A duplicate venue that passes ID-uniqueness check (because it has a new ID) but duplicates coordinates is the specific failure mode to guard.

### P2 — 18 Stale Remote Branches

Confirmed: 15 `claude/` exploratory + `fix-appjsx-final`, `restore-appjsx`, `test-small`. Oct 5 cleanup decision stands. Non-blocking.

### P3 — dist/ Build Collision (Day 12 — Non-blocking)

CI rebuilds correctly on push. No action.

---

## Three Product Decisions — Sep 20

### Decision 1: VPS launch date fork — if no confirmation by v157, commit to Oct 18.

v155 set the deadline. This report observes it. v157 (Sep 21) will read one of two ways based on whether Jack deploys:
- **Deployed**: "Oct 11 confirmed. Two-weekend scoring live. Moving to pre-launch final checklist."
- **Not deployed**: "Oct 18 is the launch date. Ski tab viability check stays on Oct 5 schedule. r/skiing timing reevaluated."

PM reports stop escalating after v157. The decision tree is exhausted. Execution is Jack's.

**Decision: Accept Oct 18 as a valid launch date if VPS misses today — it does not kill the product, only the most optimal ski-calendar timing.**

### Decision 2: Oct 5 content run must include a duplicate-coordinate check.

Sep 19's proposal quality failure reveals a systematic gap: the agent proposes venues by name-matching without cross-checking existing lat/lon pairs. A venue 2 km from an existing catalog entry with a fresh ID will pass the `id` uniqueness validator and the brace balance check — and ship.

**Decision: Oct 5 run adds one pre-commit step: verify no staged venue coordinate falls within 50 km of an existing catalog entry.** `scripts/validate-venues.mjs` handles this for candidate JSON; the Oct 5 agent must run it before staging app.jsx changes.

### Decision 3: r/skiing post timing depends on Oct 5 viability check — no exceptions.

S-hemisphere ski season is closing now (Cardrona, Mt Hutt, Las Leñas winding down Sep 15–30). Oct 11 r/skiing post depends entirely on N-hemisphere glacier venues (Hintertux, Tignes, Saas-Fee, Val Thorens, etc.) scoring above the confidence threshold for that weekend's forecast.

The Oct 5 viability check is not optional. If fewer than 15 ski venues score viable on Oct 11 dates, r/skiing post moves to December (opening weekend framing). r/solotravel (beach) launches Oct 11 regardless.

**Decision: Confirmed from v155. No change. This is the plan.**

---

## This Week's Top 3

1. **VPS deploy — today** (Jack's action, 5 minutes, runbook in DevOps report).
2. **Oct 5 content run prep** — confirm 17-venue batch is dupe-free before the run. Add coordinate cross-check to the agent's pre-commit checklist.
3. **Hold code freeze through Oct 11** — seven days clean. Nothing touches app.jsx/sw.js/index.html before Oct 5 batch.

---

## Features REJECTED This Week

- **Any code change before Oct 5** — Code freeze. No exceptions. Regression risk is not worth any marginal quality gain in the final pre-launch stretch.
- **APNS wiring** — Uncommitted local fix exists. Post-launch v2. Not before Reddit launch.
- **Additional venue proposals before Oct 5** — Batch discipline. 17 proposals queued. No individual commits.
- **Branch pruning before Oct 5** — Non-blocking, Oct 5 sweep is the right window.
- **r/skiing post if ski tab is thin on Oct 11** — Confirmed rejected. Score first. Post only if viable.

---

## Success Criteria

### Metrics that define success

- **Day 1 (Oct 11 or Oct 18):** 500+ unique visitors, <30% bounce on Explore, 50+ wishlists saved.
- **Week 1:** 1,000 registered users (magic-link), 200+ alerts set.
- **90-day:** 5,000–8,000 MAU.

### What gets us to 8K not 5K?

Same three variables. Nothing has changed the equation:

1. **Flight pricing is LIVE on launch day.** VPS deployed. LIVE badges in the first Reddit screenshots, not `~$X` estimates. A screenshot showing "from ~$240" is 40% less shareable than "from $238 LIVE." This is the highest-leverage single action remaining.
2. **Tags feel rich on Explore.** Oct 5 run moves 190 beach venues from 2 tags to 4+. Thin venue cards bounce.
3. **Traffic spike survives.** VPS weather cache is the only Open-Meteo rate-limit protection. 66+ concurrent DAU on overlapping venues hits the free ceiling without it.

All three are unblocked by a single SSH session today.

---

## One Product Risk Nobody Is Talking About

**The Oct 5 agent run is a single automated commit touching every beach venue's tag array, staged venue additions, and a git remote sweep — one week before launch with no mandatory human review step.**

The auto-push guard (brace balance, venue count floor) does not catch:
- A stray `"` in a tag value that breaks venue filter rendering
- A duplicate coordinate that passes ID-uniqueness validation
- A batch with mismatched open/close braces inside the VENUES object that the bracket-walker miscounts

The mitigation from v155 stands: run `validate-venues.mjs` before staging, output diff stats (venue delta, brace balance, tag coverage), and cap to manual review if the diff exceeds 500 lines. **Jack should be available Oct 5 to eyeball the diff — this is not a fire-and-forget run.** A bad Oct 5 commit that surfaces on Oct 11 launch day collapses all three 8K success variables simultaneously.

---

*Report generated 2026-09-20 by the daily PM agent. v156.*
