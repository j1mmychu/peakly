# Peakly PM Report v138 — 2026-09-02

**Status: 🟡 YELLOW — Zero code shipped in 6 days. 5 venues Day 5 (Trysil) carry-over. Venue search not started (Sep 14 deadline). Three false alarms in 2 days from agent team. VPS open items Day 39. October 11 Reddit date holds.**

---

## Shipped Since Last Report (v137 → v138)

| Commit | What | Right call? |
|--------|------|-------------|
| `a509db4` | DevOps report 2026-09-02 — React/Babel unpkg finding (false alarm — see below) | ⚠️ Report infrastructure is working; finding was wrong. |
| `66e4aca` | Content report 2026-09-02 — FOR/NAT AP_CONTINENT finding (false alarm — see below) | ⚠️ Report infrastructure is working; finding was wrong. |

**Code shipped: nothing.** Six consecutive days of reports with no app.jsx commits. Venues still not pasted.

---

## Bug Triage

### React/Babel loading from unpkg — CLOSED (DevOps false alarm)

DevOps v138 flagged React 18 + ReactDOM + Babel as loading from unpkg ("no SLA, blank-page risk"). **They already load from cdnjs.cloudflare.com.** Verified at `index.html:79-88`:

```
line 79:  <!-- React 18 + ReactDOM (UMD, no build step needed) — cdnjs has SLA, unpkg does not -->
line 80:  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
line 81:  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
line 87:  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js" ...
line 88:  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
```

The comment on line 79 even explains why cdnjs. DevOps agent is reading a stale snapshot. **No action needed.** This is false alarm #2 in 2 days.

### FOR/NAT missing from AP_CONTINENT — CLOSED (Content false alarm)

Content report deducted 1pt for `FOR` (Fortaleza) and `NAT` (Natal) being absent from AP_CONTINENT. **They are present.** Confirmed at `app.jsx:419` (`"FOR":"latam"`) and `app.jsx:439` (`"NAT":"latam"`). Line 392 even has an explicit comment: `// FOR/NAT already present (quoted-format block below) — not re-added here.`

Content agent failed the same check pattern that caught the Balearic false alarm yesterday (Sep 1): not running `grep -n` against the actual file before filing a missing-key finding. The two-format catalog (unquoted vs. quoted JSON keys) requires searching both blocks. **No action needed.** This is false alarm #3 in 2 days.

**Pattern:** Three consecutive false alarms — IBZ/PMI/MAH (Sep 1), unpkg (Sep 2), FOR/NAT (Sep 2). The agent correction loop is working (PM closes them), but each one costs a triage cycle. The fix is in the agent prompts: add an explicit `grep -n "<KEY>" app.jsx | head` step before filing any "missing" finding. **Jack: update `tasks/agents/content-data.md` and `tasks/agents/devops.md` to require a live grep before filing missing-key/CDN findings.**

### Peakly Pro price ($9/mo vs $79/yr) — CLOSED

Pro was cut. Not in app.jsx. Non-issue.

### Sentry DSN — CLOSED

DSN wired at `index.html:77` and `app.jsx:7-9`. Confirmed.

### Cache stamp — CONFIRMED LIVE

`PEAKLY_BUILD` = `20260902a` at `app.jsx:17`. `CACHE_NAME` = `peakly-20260902a` at `sw.js:2`. `index.html` query param = `?v=20260902a` at `index.html:395`. All in lockstep. ✅

### Plausible Analytics — P1, Jack-side action still outstanding

Fixed Aug 31 (`script.js` variant). DevOps confirms the correct script is in `index.html:32`. The verification step is Jack: log into plausible.io and confirm the site registration is exactly `j1mmychu.github.io/peakly`. **Day 11 post-launch without confirmed analytics data is a real problem.** 60-second check.

### VPS Disk Cache — Open #23 (P1, pre-Reddit gate, Day 39)

Unchanged. In-memory only. Jack SSH required.

### VPS Redeploy — Open #19 (P1, pre-Reddit gate, Day 39)

Unchanged. `forecast_days:14`, iOS CORS fix, alert deletion fix committed but not deployed.

---

## Three Product Decisions — Sep 2

### Decision 1: Agent false alarm protocol — ENFORCE starting today

Three false alarms in 2 days (Balearic, unpkg, FOR/NAT). The PM has closed all three, but the cost is real: each false alarm triggers a triage cycle in this report, a response from Content/DevOps in the next cycle, and a correction finding the cycle after. In a 5-agent team producing daily reports, a 3-false-alarm streak is a signal the verification step is broken, not the agents.

**Decision: add an explicit verification step to both agent prompts.** Content and DevOps must run `grep -n "<KEY>" app.jsx | head` (or equivalent) before filing any "missing" finding. Correcting a finding in the same run it was flagged is a pass; filing a finding without checking the file is a failure.

**Jack action: edit `tasks/agents/content-data.md` and `tasks/agents/devops.md` to add the grep verification step. This prevents repeat false alarms from the same category.**

### Decision 2: Carry-over venues — hard DEFER deadline set

Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan: **Day 5**. Portofino: **Day 3**. These are paste-ready JSON objects sitting in `reports/content-report.md`.

**Decision: hard deadline — September 7 for the first four, September 10 for Portofino.** If not pasted by those dates, the venues are formally DEFERRED to the October catalog batch and will not appear in the carry-over list again until October. The ski pre-booking window for Norway (Trysil's peak add value) runs through mid-October. After September 7, the urgency signal weakens materially.

**Jack action: paste the 5 JSON objects from `reports/content-report.md` into `app.jsx` VENUES array. 5 minutes. Auto-push handles the rest.**

### Decision 3: Venue text search — September 14 deadline is the Reddit gate

Venue search is the difference between the 5K and 8K paths. A Reddit commenter who searches for a specific resort and finds nothing kills the thread. This is not a nice-to-have.

**Decision: September 14 deadline holds. If venue search is not live by September 14, the Reddit gate moves to October 18 and the pre-post window shrinks from 7 to 3 days.** That's the consequence, stated plainly.

Minimum viable spec (2hr build, no new dependencies):
- Client-side `toLowerCase()` filter on `venue.title + venue.location + venue.tags.join(' ')`
- Single text input above category pills in ExploreTab
- Shows count when active ("Showing 3 of 395")
- Clears on category pill change
- No backend, no fuzzy matching

The build is unblocked and well-understood. The only blocker is starting it.

---

## This Week's Top 3 Priorities

**1. Jack: Plausible dashboard — 60 seconds. Now 11 days dark.**

plausible.io → Sites → verify `j1mmychu.github.io/peakly`. Every product decision about the Reddit post is made blind without this.

**2. Jack: Paste the 5 venues — 5 minutes, September 7 hard deadline.**

Trysil/Camps Bay/Perhentian/Nusa/Portofino JSON objects are in `reports/content-report.md`. Paste → auto-push does the rest. Trysil is Day 5 into ski pre-booking window. After September 7, it formally defers.

**3. Build venue text search — ship before September 14.**

Two-hour build. Client-side. No new dependencies. Spec above. September 14 is the Reddit gate. The Reddit post lives or dies on the first 20 comments, and a commenter who can't find their resort is a negative comment.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Arolla Ski Area | **DEFER to October** | December season start; zero user value before November |
| FOR/NAT AP_CONTINENT fix | **CLOSED — FALSE ALARM** | Both keys present at lines 419 and 439. Content prompt needs the grep verification step. |
| unpkg → cdnjs CDN swap | **CLOSED — FALSE ALARM** | Already on cdnjs at lines 79-88. DevOps agent read a stale file. |
| APNS fix commit | **DEFER** | Uncommitted since July 25 but VPS not deployed anyway; commit value is low until Open #19 lands |

---

## October 11 Reddit Gate — Pre-Post Checklist

**Date: Saturday October 11, 2026, r/skiing, 8–10am ET. Date does not move.**

Pre-post gate checklist starts **October 4** (7 days out):
- [ ] Plausible verified (Jack dashboard check — **currently unverified**)
- [ ] VPS disk cache deployed (Jack SSH — Open #23, Day 39)
- [ ] Venue text search live (September 14 gate — not started)
- [ ] Hero screenshot with real NH first-snow conditions
- [ ] Device test on iOS + Android
- [ ] 3 mock comments answered (Mammoth? Vail? where's Park City?)

**Current gate status: 0/6 confirmed.** Venue search is the only one an agent can ship directly.

---

## Success Criteria — 90-Day Projection

**5K–8K users — what gets us to 8K, not 5K:**

| Factor | 5K path | 8K path |
|--------|---------|---------|
| Reddit post performance | 500-800 upvotes, thread dies after 48h | 800+ upvotes, venue search works in comments, two follow-up posts |
| Venue search | Missing — first bad comment within 20 minutes | Live — "I searched for Vail and it worked" in first 10 comments |
| Plausible data | Dark — making decisions blind | Verified — know which venue cards convert before the spike |
| Catalog depth | 395 venues, 5 pending paste | 400+ venues, Trysil in pre-booking window |
| Score trust | Users bounce after one uncertain forecast | Confidence badge keeps them coming back Friday after Friday |

---

## One Product Risk Nobody Is Talking About

**The agent team is becoming a noise machine.**

Three false alarms in 2 days means the PM's primary job is closing false alarms, not making product decisions. The actual product decisions this run (Plausible, venue pastes, venue search) are unchanged from v136 and v137. The agents are generating reports, but the reports aren't moving the product.

The root cause: agents file findings based on pattern-matching against description files and prior reports rather than running verification steps against the actual codebase. A DevOps agent that doesn't `grep index.html` before flagging a CDN source isn't a DevOps agent — it's a memory bot.

The fix is cheap: add mandatory verification steps to the agent prompts. But if it doesn't happen, the agent reports will continue to require PM triage every day even when nothing is wrong. At 100K users, that's the daily 30 minutes that should be spent on real product decisions.
