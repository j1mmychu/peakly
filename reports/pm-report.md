# Peakly PM Report — 2026-07-24 (v98)

> Supersedes v97 (July 23). **Status: GREEN on code, GREEN on mobile performance, RED on distribution execution.** Day 24 post-launch. Code freeze day 10. **No new code commits since July 20.** The second-post window opens in 8 days (Aug 1). Three gates remain: weather cache disk persistence (technical, ~45 min), photo approval (Jack, 15 min), and Plausible read + VPS check (Jack, 20 min).

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **374 venues (132 ski / 242 beach).** Eval-only count. Stop. |
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
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS not VENUES. 0 dup IDs.** Stop. |
| "AP_CONTINENT gaps (KUL/SNA/MCT/GIG/TFS/CHQ)" | **PERMANENTLY CLOSED. All 6 confirmed at `app.jsx:401–435`. Verified 5× by PM. Stop.** |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 374 = baseline. Stop.** |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only, incompatible with dev loop. Prod uses esbuild. Stop.** |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **`jackson-hole` FIXED July 20 (`e2f02cd`). Only `jacksonhole` exists. Content Jul 23 + PM Jul 24 both verified: 374 unique IDs. Stop permanently.** |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21. Stop permanently.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1 (July 20 deadline missed). Stop flagging.** |
| "Babel mobile parse wall (P1) unresolved" | **PERMANENTLY CLOSED July 22. esbuild ships since June 20. Mobile cold-load already faster.** Stop. |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild via `deploy.yml` → `build-web.mjs`. Stop. |
| "venue count 375 / jackson-hole dup returned (Content Jul 23)" | **FALSE POSITIVE — PM grep July 24: only `jacksonhole` exists in VENUES. 374 unique IDs confirmed. Content is counting something outside the VENUES block. Stop.** |
| "pre-compile CI deadline July 24" | **FALSE CLOCK. esbuild CI has shipped since June 20. No action needed. Stop.** |

---

## Shipped Since v97 (2026-07-23 → 2026-07-24)

| Commit | What | Verdict |
|--------|------|---------|
| No code commits today | Day 4 of code freeze (since July 20) | ✅ Correct — code is sound, nothing ships until gates clear |

**Code state July 24:**
- `app.jsx`: 13,499 lines · cache `20260720a` · braces 5,571/5,571 ✅
- **374 unique venue IDs** (132 ski / 242 beach) — PM-verified July 24
- `.venue-baseline`: **374** ✅ matches
- `dist/app.min.js`: esbuild-compiled, Babel stripped ✅
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: all 6 previously-disputed codes present ✅
- Staged queue: **10 venues** (Day 14 awaiting Jack approval)
- Photo dedup regression: 5 ski photos at 3× — bundle with next batch

---

## Bug Triage — July 24

| Bug | Severity | Status |
|-----|----------|--------|
| **Weather cache not persisted to disk** | **P1 (new · pre-traffic gate)** | DevOps Jul 23 documented: `pm2 restart` clears `_wxCache`; 374 venues × 2 Open-Meteo calls = 748 requests in <60s on a cold cache → free-tier ceiling → all scores drop to 50. Reddit spike + cold cache = broken product at the worst moment. ~30-line fix in `server/proxy.js`. Must ship before second post. |
| **Plausible data unread** | **P1** | Day 24. Gate for second-post angle and audience targeting. Jack: plausible.io, 15 min. |
| **Photo approval — 10 staged venues** | **P1 (time-sensitive)** | Day 14. Alpe d'Huez summer glacier closes late August. Whakapapa peaks Aug–Sep. Second-post hook dies if not approved by ~July 28. |
| **Ski photo dedup regression** | **P2** | 5 ski photos at 3× (liberty-mountain, roundtop, whitetail, jack-frost, madarao-s22). Bundle with batch approval — don't ship solo. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 45. 2-minute paste. iOS 5.1.1(v). Not a web gate. |
| **VPS health verify** | P2 | 14 days since Jack confirmed. `curl https://peakly-api.duckdns.org/health`. 30 seconds. |
| **SRI/CSP (Open #10)** | P2 | Feasible now (esbuild strips `'unsafe-eval'`). 45 min. After second post. |
| **"jackson-hole dup" (Content report Jul 23)** | ✅ FALSE POSITIVE (third confirmation) | Only `jacksonhole` in VENUES. PM grep July 24 confirms. 374 is correct. Permanently closed. |

**Permanently closed:** AP_CONTINENT gaps · Babel P1 · retention email cohort · bracket-walker overcount · jackson-hole ghost dup · cross-category photos · Plausible domain · placeholder tags · Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · "pre-compile CI deadline Jul 24" (false clock)

---

## Known Blockers

| Blocker | What It Unlocks | Days Waiting |
|---------|----------------|------|
| **Weather cache disk persistence** | Reddit-spike resilience · pre-traffic safety gate | New (July 23) |
| **Jack: photo approval (10 staged)** | Whakapapa (SH ski hook) · Alpe d'Huez (Aug deadline) · dedup fix bundled | Day 14 |
| **Jack: read Plausible** | Second-post angle · onboarding health · bounce rate | Day 24 |
| **Jack: VPS health check** | Confidence before second post | 14 days |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 45 |
| **LLC approval** | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

**What's NOT a blocker:** Pre-compile CI (done June 20) · Babel performance (done June 20) · AP_CONTINENT coverage (permanently closed) · jackson-hole dup (false positive, closed)

---

## Explicit Product Decisions — July 24

### Decision 1: Weather cache disk persistence is a P1 pre-traffic gate. SHIP before second post.

DevOps July 23 documented a real failure mode: `pm2 restart` wipes the in-memory weather cache. On a Reddit surge, 374 venues need 748 Open-Meteo calls within 60 seconds → free-tier daily limit → all venue scores drop to 50 → the Explore grid looks dead to exactly the audience the post just delivered.

This is the only code change authorized during the freeze. It's ~30 lines in `server/proxy.js`:
- Startup: `JSON.parse(fs.readFileSync("/tmp/peakly-wx-cache.json"))` → restore surviving entries
- Every 10 min: `fs.writeFileSync("/tmp/peakly-wx-cache.json", JSON.stringify(_wxCache))`

Costs $0. Takes <1 hour including VPS redeploy. Must land before the second post, not after.

**SHIP: weather cache disk persistence. One authorized exception to the freeze.**

### Decision 2: Content agent's "jackson-hole dup returned" (July 23) is a false positive — permanently closed.

PM grep July 24:
```
grep 'id:"jackson-hole"\|"id":"jackson-hole"' app.jsx → 0 results
grep 'id:"jacksonhole"\|"id":"jacksonhole"' app.jsx → line 505 (1 result only)
```
Total unique VENUES IDs = **374**. Content is counting something outside the VENUES block (likely PRESETS or SEARCH_PRESETS). Third false positive in three weeks. Adding to permanent stop table. Content agent must scope ID counts to the VENUES array only.

**374 is correct. Stop.**

### Decision 3: Content's "5 new summer glacier venues" — HOLD until current 10-venue queue clears.

Content proposed Pitztal, Hintertux, Rettenbach, Kaunertaler (Austria), and Les Deux Alpes (already in VENUES as `les-deux-alpes-fr`). Pitztal and Hintertux are legitimate second-post hooks. However:
- 10 venues already staged and waiting 14 days for approval
- Les Deux Alpes already exists — reject the duplicate
- Adding to an uncleared queue compounds the approval debt
- Queue policy: max 14 pending

**HOLD all 4 new proposals. Pitztal + Hintertux are priority-1 when queue clears. Les Deux Alpes duplicate: REJECT.**

---

## This Week's Top 3 Priorities Only

1. **Ship weather cache disk persistence.** (~45 min · `server/proxy.js` · VPS redeploy) — Only authorized code change in freeze. Must land before second post. Pre-traffic safety gate.
2. **Jack: Approve 10 staged venues.** (15 min) — Alpe d'Huez and Whakapapa are the second-post hooks. Seasonal window closes in ~3 weeks. This is now urgent.
3. **Jack: Read Plausible + VPS health check.** (20 min combined) — Determines second-post angle and confirms infrastructure is ready for traffic.

Everything else is frozen or deferred.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **4 new summer glacier venues (Pitztal/Hintertux/Rettenbach/Kaunertaler)** | Queue cap. Clear the 10 staged first. |
| **Les Deux Alpes (Content proposal)** | Already exists as `les-deux-alpes-fr`. Duplicate. |
| **Any new code changes (except wx cache fix)** | Code freeze. One authorized exception only. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | CUT. Reopen only at 500+ MAU. |
| **APNS push alerts** | Known-skipped. Re-flag at App Store submission time only. |
| **JSON-LD structured data** | Can't evaluate ROI without Plausible baseline. DEFER. |
| **SRI/CSP** | After second post. |
| **Venue deep links** | After second distribution post. DEFER. |

---

## Success Criteria

| Metric | 5K path | 8K path | Day 24 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ❌ Day 24 — Jack action |
| Second distribution | Week 2 | Week 2 | 🔴 Target Aug 1–7 · 3 gates (wx cache + 2 Jack tasks) |
| Pre-compile CI | Before 2nd post | Before 2nd post | ✅ DONE (June 20 `8ba0ca3`) |
| Catalog — SH + summer ski | Jul–Aug | Jul | 🔴 10 staged, Day 14 awaiting approval |
| Photo dedup regression | 0 at 3× | 0 at 3× | ⚠️ 5 ski at 3× — bundle with batch |
| Revenue streams | 3 live | +LLC affiliates | ⚠️ 3 live ($7.58/1K MAU) |
| Weather cache resilience | Before first spike | Before first spike | 🔴 Not persisted to disk — new gate |

**The 8K path is still open.** The code is ready. The catalog is 80% ready. Three gates remain — one technical (~45 min), two Jack tasks (~35 min combined). All are doable this week.

---

## One Product Risk Nobody Is Talking About

**The second post could kill itself on arrival.**

The infrastructure is not spike-hardened. Peakly runs on a single DigitalOcean droplet with an in-memory weather cache that vaporizes on restart. A Reddit/HN surge means:

1. Traffic lands simultaneously on 374 venues.
2. Open-Meteo needs 748 calls in <60 seconds on a cold cache.
3. Free-tier daily limit: hit.
4. All venue scores: 50. Every card looks identical.
5. Users see a broken app, bounce, and report it in the thread.

This is not hypothetical — it's the documented behavior of the current architecture at >67 simultaneous cold users (DevOps July 23). The fix is 30 lines and costs nothing. It has to ship before the post, not after the thread is already cold.

The seasonal hook (summer skiing, Southern Hemisphere at peak) is the strongest Peakly has had. It will drive real clicks. Real clicks is exactly when this breaks. Ship the cache fix. Then post.

---

*Written 2026-07-24 · v98 · Day 24 post-launch · 374 venues · cache 20260720a · code freeze day 10 · second post target Aug 1–7 · weather cache disk persistence is the P1 gate*
