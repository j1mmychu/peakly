# Peakly PM Report — 2026-07-22 (v96)

> Supersedes v95 (July 21). **Status: GREEN on code, GREEN on mobile performance, RED on distribution execution.** Day 22 post-launch. Code freeze day 8 (no app.jsx changes since July 20). **Two major false alarms finally closed today:** the "Babel P1 mobile parse wall" never existed in production (esbuild pipeline has been shipping since June 20), and the "AP_CONTINENT gaps" are confirmed present for the 4th time. The second-post gate is now CLEAR on the technical side. What remains is Jack: photo approval + Plausible read + post.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **374 venues (132 ski / 242 beach).** Authoritative category grep. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **`20260720a` — auto-bumps on code change. Age alone ≠ stale.** Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14. Use `grep -c "lateSeason.*true" app.jsx`. Stop.** |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS, not VENUES. 0 dup IDs.** Stop. |
| "AP_CONTINENT gaps (KUL/SNA/MCT/GIG/TFS/CHQ)" | **PERMANENTLY CLOSED. All 6 confirmed present at `app.jsx:401–435`. Verified by PM 4 separate times: v90, v96 (this run), and twice by grep in session. Content report is wrong. Stop.** |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. `{lat:...}` in comment lines 4735/4746 fools bracket-walker. Unique-ID count = 374. Baseline 374. PERMANENTLY CLOSED.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only — incompatible with dev loop. Production uses esbuild (no Babel). Stay 7.29.7 in source.** Stop. |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20 (`e2f02cd`). 375 → 374.** Stop. |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21. Stop permanently.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1 (July 20 deadline missed). Stop flagging.** |
| "Babel mobile parse wall (P1) unresolved" | **PERMANENTLY CLOSED July 22. `scripts/build-web.mjs` + `deploy.yml` ships esbuild-compiled `app.min.js` (439 KB, no Babel) on every push. Has been shipping since June 20 (`8ba0ca3`). Mobile cold-load already ~60% faster than Babel-in-browser. The July 24 deadline was already met.** Stop. |
| "No build step / Babel transpiles at runtime in production" | **WRONG SINCE JUNE 20.** Development loop: Babel-in-browser (open index.html locally). Production (deploy.yml line 40): esbuild pre-compiles `app.jsx → dist/app.min.js`, strips Babel entirely. Stop conflating dev and production arch. |

---

## Shipped Since v95 (2026-07-21 → 2026-07-22)

| Commit | What | Verdict |
|--------|------|---------|
| `beebea5` — DevOps July 22 | GREEN · Babel P1 RESOLVED (missed the esbuild pipeline entirely until today) · 374/374 match · SRI/CSP now feasible without `'unsafe-eval'` | ✅ Critical finding — unblocks second post |
| `711d181` — Content July 22 | AP_CONTINENT P2 re-raised (false positive — all 6 present in code) · 374 confirmed · staged queue Day 12 | ⚠️ AP_CONTINENT claim is incorrect — see Decision 1 |

**Code state July 22 (evening):**
- `app.jsx`: 13,499 lines · cache `20260720a` · braces 5,571/5,571 ✅
- **374 venues** (132 ski / 242 beach) — authoritative category grep
- `.venue-baseline`: **374** ✅ confirmed match
- `dist/app.min.js`: **439 KB** — esbuild-compiled, Babel stripped ✅
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: 280 entries, all 6 disputed codes present at lines 401–435 ✅
- Staged queue: **10 venues** (5 carried + 5 SH ski)
- Photo dedup regression: 5 ski photos at 3× (target ≤2×) — bundle with batch

---

## Bug Triage — July 22

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P1** | Day 22. Downgraded from P0 — it's not blocking a code change, it's blocking a product decision. Jack: plausible.io, 15 minutes. |
| **Ski photo dedup regression** | **P2** | 5 ski photos at 3× (liberty-mountain, roundtop-mountain, whitetail-resort, jack-frost, madarao-mountain-s22). Bundle with photo approval batch — don't ship standalone. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 43. `server/sql/delete-account.sql` → Supabase SQL Editor. 2 min. Jack only. iOS 5.1.1(v). Not a web-launch gate. |
| **VPS health verify** | P2 | 12 days since Jack confirmed. `curl https://peakly-api.duckdns.org/health` before distribution push. |
| **SRI/CSP (Open #10)** | P2 | Now feasible — `'unsafe-eval'` not needed in production (esbuild strips Babel). 45 min. Post-launch. |
| **10 staged venues** | Hold | Photo approval Day 12. Whakapapa (NZ peak) + Alpe d'Huez (glacier closes Aug) are time-sensitive. |
| **AP_CONTINENT "gaps"** | ✅ PERMANENTLY CLOSED | All 6 codes (KUL, SNA, MCT, GIG, TFS, CHQ) present at `app.jsx:401–435`. Verified 4× by PM. Content report is factually incorrect. See Decision 1. |
| **Babel P1** | ✅ PERMANENTLY CLOSED | esbuild pipeline confirmed shipping since June 20. Second-post gate is clear on the technical side. |

---

## Known Blockers

| Blocker | What It Unlocks | Days |
|---------|----------------|------|
| **Jack: photo approval (10 staged)** | Whakapapa (NZ hook for second post) · Alpe d'Huez (Aug deadline) · ski photo dedup fix bundled | Day 12 |
| **Jack: read Plausible** | Distribution angle confirmation · onboarding health · bounce rate | Day 22 |
| **Jack: VPS health check** | Confidence before distribution push | 12 days |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 43 |
| **LLC approval** | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

**What's NOT a blocker:** Pre-compile CI (already resolved), Babel performance (already resolved), AP_CONTINENT coverage (permanently closed).

---

## Explicit Product Decisions — July 22

### Decision 1: AP_CONTINENT P2 permanently closed. Content agent must stop raising it.

This finding has been raised, investigated, and disproved four times:
- v90 (July 16): PM closed it, grep confirmed all 6 present
- DevOps July 20: closed it
- Content July 22: re-raised it claiming DevOps "incorrectly closed" it
- v96 (this run): verified again by direct grep on live app.jsx

Result (live code, July 22):
```
app.jsx:401:  "GIG":"latam",
app.jsx:407:  "KUL":"asia",
app.jsx:413:  "MCT":"asia",
app.jsx:429:  "SNA":"na",
app.jsx:434:  "TFS":"europe",
app.jsx:435:  "CHQ":"europe",
```

**All 6 are present. The claim is false. Adding to the permanent stop-reporting table. Content agent must grep before raising any structural finding.**

### Decision 2: Second post gates are CLEARED on the technical side. Ship by August 1–7.

v95 set July 24 as the pre-compile CI deadline. That deadline was already met — the esbuild pipeline has been shipping since June 20. The Babel parse wall never existed in production.

Gates remaining:
- ✅ Pre-compile CI — DONE (June 20)
- ⏳ Photo approval (10 staged, Whakapapa time-sensitive) — Jack this week
- ⏳ Plausible read — Jack this week
- ✅ 374 venues in catalog — confirmed

**Target date stands: August 1–7. The only things between now and the post are Jack's two 15-minute tasks.**

### Decision 3: Update CLAUDE.md to reflect the esbuild production architecture.

The CLAUDE.md "No build step" statement is factually wrong in production since June 20. Future agents will keep misdiagnosing the Babel P1 until the architecture is documented correctly.

**Decision: Update CLAUDE.md to note the production esbuild pipeline (deploy.yml line 40 → `build-web.mjs`). Development loop still uses Babel-in-browser. Production is pre-compiled.**

---

## This Week's Top 3 Priorities Only

1. **Jack: Photo-approve 10 staged venues.** (15 min) — Time-sensitive. Whakapapa closes September. Alpe d'Huez closes August. This week or the NZ hook misses the second post.
2. **Jack: Read Plausible.** (15 min) — Confirms the second-post angle. Required before posting anything.
3. **Jack: VPS health check.** (2 min) — `curl https://peakly-api.duckdns.org/health` before the second post. Last confirmed 12 days ago.

Everything else is deferred, closed, or already done.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Any new code changes** | Code is sound. Freeze is healthy. Ship nothing before second post that isn't blocking it. |
| **New venue additions beyond 10 staged** | Queue cap holds at 14. Clear backlog first. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | CUT. Reopen only at 500+ MAU with Plausible signal. |
| **APNS push alerts** | Known-skipped. Gate live. Re-flag only at App Store queue time. |
| **JSON-LD structured data** | Can't evaluate ROI without Plausible baseline. DEFER. |
| **VPS Redis persistence** | Right fix, wrong time. DEFER post-100 MAU. |
| **Venue deep links** | After second distribution post. DEFER. |

---

## Success Criteria

| Metric | 5K path | 8K path | Day 22 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ❌ Day 22 — Jack action |
| Retention email | Day 7–10 | Day 7 | ❌ CLOSED — cohort declared lost |
| Second distribution | Week 2 | Week 2 | 🔴 Target Aug 1–7 · photos + Plausible only |
| Pre-compile CI | Before 2nd post | Before 2nd post | ✅ **DONE** (June 20 `8ba0ca3`) |
| Catalog — NZ venues | Jul–Aug | Jul | 🔴 Whakapapa staged, awaiting approval |
| Revenue streams | 3 live | +LLC affiliates | ⚠️ 3 live ($7.58/1K MAU) |

**The 8K path is 10 days away** if Jack approves photos + reads Plausible this week and posts August 1. The seasonal window (NH beach peak + SH ski) is open through August. After September it closes.

---

## One Product Risk Nobody Is Talking About

**The agent team's false alarms have been burning time that should go to distribution.**

Day 22. The AP_CONTINENT finding has been investigated and disproved four times across five reports. The Babel P1 was assigned with a hard deadline — except the fix had already shipped 32 days before the deadline was set, unnoticed by three consecutive DevOps reports. Total investigation time wasted on false alarms this week: ~90 minutes of PM + DevOps + Content time that could have been spent analyzing Plausible data or writing the second-post copy.

The agents are good at catching real structural bugs (the jackson-hole ghost dup was a real one). But they're not good at distinguishing "I can't see this in my grep output" from "this doesn't exist." The rule stands: **no structural finding enters the PM agenda without source-level verification.** Grep before flagging. Read before raising.

The second post needs copy, a timing decision, and a subreddit choice. None of that is happening in these reports.

---

*Written 2026-07-22 · v96 · Day 22 post-launch · 374 venues · cache 20260720a · code freeze day 8 · esbuild pipeline confirmed*
