# Peakly PM Report v171 — 2026-10-05

**Status: 🟡 YELLOW — VPS Day 57. 13 days to Oct 18 beach launch. Code freeze Day 22 clean. Two consecutive agent false alarms corrected by eval. No confirmed code P0.**

---

## Shipped Since Last Report (v170 → v171)

| Commit | What | Right call? |
|--------|------|-------------|
| `255fcbf` | DevOps Oct 5 — YELLOW, VPS Day 57, new bracket-walker 406 vs grep 404 claim | ⚠️ The 406 finding is a false alarm — eval confirms 404, 0 missing category. |
| `c7ad574` | Content Oct 5 — lateSeason:true count claimed as 10, 5 venues "missing" flag | ⚠️ False alarm. Eval confirms 15 lateSeason venues. All 5 "missing" venues have the flag. |

**Zero app.jsx/sw.js/index.html commits in 22 days. Code freeze holds.**

---

## ⚠️ Meta-Finding: Recurring Agent False Alarms

This is the **third consecutive day** of agent reports citing findings that eval disproves:

| Date | Agent | Claimed | Eval Truth |
|------|-------|---------|------------|
| Oct 3 | Content | 91 venues with ≤2 tags (regex "fix") | 225 (bad regex, corrected Oct 4) |
| Oct 5 | DevOps | 406 venues (bracket-walker) | **404** — 0 missing category |
| Oct 5 | Content | 10 lateSeason:true venues | **15** — all 5 "missing" venues confirmed flagged |

The root cause is agents using grep/regex instead of `node -e "eval(...)"` on the VENUES array. CLAUDE.md says "always eval, never grep" — that applies to agent scripts too. The false lateSeason alarm nearly caused a code freeze break for a non-bug. The false 406 alarm burned triage cycles.

**DECISION: Agent findings that contradict CLAUDE.md's documented counts are false until eval-confirmed. Do not break code freeze on an agent finding that hasn't been eval-verified.**

---

## Bug Triage

### P1 — VPS Redeploy: Day 57. Oct 4 Deadline Missed.

Status unchanged. The code is ready. The VPS is not a git clone. Jack must SSH.

**What breaks without it:**
- Two-weekend scoring null for all 404 venues (7-day vs 14-day forecasts)
- iOS CORS block
- Alert deletion silent failure
- Rate limiter spoofable
- Weather cache wiped on pm2 restart

**The 3 commands:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```
2 minutes if SSH keys are in place. Verify `forecast_days:14` in the health response.

**Launch consequence:** Oct 18 is unconditional (v170 decision stands). If VPS is not deployed, Reddit copy uses "estimated prices" language. The quality gap is real. 13 days remain.

---

### P1 — `origin/master` Footgun: Day 13

`deploy.yml` deploys both `main` and `master`. An accidental push to `origin/master` silently rolls production back to Sep 2026 code. With 13 days to launch this is a live risk.

```bash
git push origin --delete master
```

30 seconds. Run in the same terminal as the VPS deploy.

---

### P2 — Tag Density: 225 Venues (55.7%) at ≤2 Tags

Eval-confirmed. Estimated editorial time: ~2 hours for top-50 by weekendScore. v170 decision stands: top-50 pass before launch, full 225 post-launch.

**Blocked:** Code is frozen. Tag enrichment requires an app.jsx edit. This does not warrant breaking freeze alone — bundle with the VPS deploy window if Jack is touching the codebase anyway, or schedule as the first post-freeze commit.

---

### P2 — BASE_PRICES Gap: 155 of 165 APs Missing (93.9%)

Eval-confirmed. Only 15 US airports covered. Top missing APs by venue count are international (CUN, DXB, BOB, etc.) — the entire non-US catalog gets generic fallback pricing. Backfill top ~15 by venue count before launch.

**Same status as v170. No movement.**

---

### P3 — SW PRECACHE Babel URL Mismatch

Dev-only (production CI drops Babel). Post-launch.

---

### FALSE ALARM — lateSeason:true Count (Content Oct 5)

Content report claimed 5 venues (snowbird, zermatt, verbier, val-thorens, engelberg) were missing `lateSeason:true`. **Eval confirms all 15 CLAUDE.md-listed venues have the flag.** Content's grep was format-sensitive. No action needed.

---

### FALSE ALARM — VENUES Bracket-Walker 406 (DevOps Oct 5)

DevOps reported bracket-walker count of 406 vs grep 404. **Eval confirms 404 venues, 0 missing category field.** The bracket-walker script has the same format-sensitivity problem that caused the tag count false alarms. No action needed.

---

## Three Product Decisions — Oct 5

### Decision 1: Code freeze holds through Oct 17 unless a P0 is eval-confirmed.

The lateSeason alarm (would have broken freeze) was a false alarm. The bracket-walker alarm was a false alarm. The right call is to hold freeze and require eval verification before any freeze-break. Val Thorens opens mid-October — the scoring is correct. No code risk at launch from this.

**DECISION: Code freeze holds. No app.jsx edits until Oct 18 unless an eval-confirmed P0 emerges. Agent findings require eval verification before triggering a freeze break.**

### Decision 2: Tag enrichment + Gili rename are post-Oct-18.

These were scheduled for Oct 5. Code is frozen. They are not P0. They do not unblock launch. The cost of shipping them early vs. after launch is zero — Reddit users don't filter by tag count. Bundle them into the first post-launch commit alongside BASE_PRICES backfill.

**DECISION: Tag enrichment and Gili rename deferred to first post-launch commit. Oct 18 post is not gated on these.**

### Decision 3: Reddit beach post review deadline is Oct 11. Non-negotiable.

Oct 18 is 13 days out. The post draft is committed (Sep 24). Jack reviews Oct 11. Screenshot on launch morning. Cache warm-up before posting. These are the three remaining things that determine the opening hour.

**DECISION: Oct 11 review deadline is firm. If draft needs revisions after Oct 11, they happen Oct 12–17, not Oct 18 morning.**

---

## This Week's Top 3

1. **Jack: VPS deploy + `origin/master` delete — 15 minutes, SSH.** Day 57. Nothing has changed. The commands are above. Do it.
2. **Jack: Review Oct 18 Reddit post draft by Oct 11.** 6 days. Cache warm-up plan is documented. Screenshot on launch morning.
3. **Content agent prompt hygiene — require eval, not grep.** Three false alarms in 3 days cost triage cycles and nearly broke code freeze unnecessarily. The fix is enforcing `node -e "eval(...)"` in agent scripts before any finding referencing venue counts, lateSeason counts, or tag density.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| Breaking code freeze for lateSeason "fix" | False alarm — all 15 flags confirmed by eval. |
| Breaking code freeze for bracket-walker "discrepancy" | False alarm — eval confirms 404, 0 missing category. |
| Full 225-venue tag pass | Too wide. Post-launch. Top-50 was the v170 call; now deferred entirely to post-launch. |
| Gili rename | Deferred to post-launch. Not a launch blocker. |
| BASE_PRICES full 155 AP backfill | Top ~15 only, bundled with post-launch content pass. |
| Any feature work before Oct 18 | 13 days. Ship what's there. |

---

## One Product Risk Nobody Is Talking About

**The agent false-alarm rate is accelerating, and the next one might land in a live commit instead of a report.**

Three false alarms in three days. Each was a plausible-sounding finding (scoring regression, venue count discrepancy) that would have justified a code change. The difference between "false alarm in a report" and "false alarm committed to app.jsx" is whether the person applying the fix also runs eval. In a 22-day code freeze, Jack is probably not watching every agent finding closely — he's focused on VPS and the Reddit post. If a scheduled agent commits a "fix" for a non-bug during the freeze window, the smoke test might not catch it (a `lateSeason: false` override on a venue that already has `lateSeason: true` would merge, pass syntax check, pass smoke, and silently break scoring for that venue the moment ski season opens).

The risk isn't agent malice — it's agents with format-sensitive scripts finding ghosts in the data and writing "fixes" with high confidence. The mitigation is already documented (eval over grep) but it needs to be enforced in the agent prompts themselves, not just CLAUDE.md.

---

## Success Criteria Check

| Metric | Status |
|--------|--------|
| 90-day projection (5K–8K) | Two-wave path intact. |
| Live fares at beach launch | 🔴 VPS Day 57. 13 days remain. |
| Code freeze | ✅ Day 22 clean. |
| lateSeason:true (15 venues) | ✅ Eval-confirmed — Content's "10" was a false alarm. |
| VENUES count (404) | ✅ Eval-confirmed — DevOps "406" was a false alarm. |
| Reddit beach post | ✅ Draft committed Sep 24. Jack review Oct 11. |
| `origin/master` footgun | 🔴 Day 13. Delete in same SSH session as VPS deploy. |
| Cache warm-up | ⚠️ Run after VPS deploy AND Oct 18 morning before posting. |
| r/skiing post | ⚠️ No draft. Oct 25 deadline. Must lead with ski conditions, not the product. |
| Tag enrichment (top-50) | ⚠️ Deferred to first post-launch commit. |
| BASE_PRICES (top-15 APs) | ⚠️ Not started. Pre-launch target. |
| Stale claude/* branches | ⚠️ 14+ branches on origin. Cleanup whenever Jack is in the terminal. |
| Agent eval discipline | 🔴 3 false alarms in 3 days. Fix prompt scripts to use eval. |

**For 8K not 5K:** VPS live before Oct 18. Cache warm on launch morning. Jack present 2 hours post-post for upvote momentum. r/skiing Nov 1 with a distinct angle. The path still exists. 13 days.
