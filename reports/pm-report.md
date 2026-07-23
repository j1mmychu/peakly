# Peakly PM Report — 2026-07-23 (v97)

> Supersedes v96 (July 22). **Status: GREEN on code, GREEN on mobile performance, RED on distribution execution.** Day 23 post-launch. Code freeze day 9. **Today's only new finding: Content report's "jackson-hole dup returned" is a FALSE POSITIVE** — verified by PM grep, only `jacksonhole` exists, 374 unique IDs confirmed. No regressions. Second-post window opens Aug 1–7 with 9 days to go; the only gates are Jack's two 15-minute tasks.

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
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS not VENUES. 0 dup IDs.** Stop. |
| "AP_CONTINENT gaps (KUL/SNA/MCT/GIG/TFS/CHQ)" | **PERMANENTLY CLOSED. All 6 confirmed at `app.jsx:401–435`. Verified 5× by PM. Stop.** |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 374 = baseline. Stop.** |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only, incompatible with dev loop. Prod uses esbuild. Stop.** |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **`jackson-hole` compact entry FIXED July 20 (`e2f02cd`). Only `jacksonhole` exists. 374 confirmed. Content report July 23 claim was FALSE POSITIVE. Stop.** |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21. Stop permanently.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1 (July 20 deadline missed). Stop flagging.** |
| "Babel mobile parse wall (P1) unresolved" | **PERMANENTLY CLOSED July 22. esbuild ships since June 20. Mobile cold-load already faster.** Stop. |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild via `deploy.yml` → `build-web.mjs`. Stop. |

---

## Shipped Since v96 (2026-07-22 → 2026-07-23)

| Commit | What | Verdict |
|--------|------|---------|
| `b5582c8` — DevOps July 23 | GREEN · freeze day 9 · 374/374 match · all v96 findings confirmed stable | ✅ |
| `ca87d94` — Content July 23 | Claimed "jackson-hole dup returned" (false positive, 375 IDs) · 5 summer glacier proposals | ⚠️ False positive confirmed by PM grep — see Decision 1 |

**Code state July 23:**
- `app.jsx`: 13,499 lines · cache `20260720a` · braces 5,571/5,571 ✅
- **374 unique venue IDs** (132 ski / 242 beach) — PM-verified, not Content's "375"
- `.venue-baseline`: **374** ✅ matches
- `dist/app.min.js`: **439 KB** — esbuild-compiled, Babel stripped ✅
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: all 6 disputed codes present ✅
- Staged queue: **10 venues** (Day 13 awaiting Jack approval)
- Photo dedup regression: 5 ski photos at 3× — bundle with next batch

---

## Bug Triage — July 23

| Bug | Severity | Status |
|-----|----------|--------|
| **Plausible data unread** | **P1** | Day 23. Not a code blocker — a product decision blocker. Jack: plausible.io, 15 min. Gate for second post angle. |
| **Photo approval — 10 staged venues** | **P1 (time-sensitive)** | Day 13. Alpe d'Huez summer glacier closes August. Whakapapa (NZ) anchors the second-post southern-hemisphere hook. This week or the hook is gone. |
| **Ski photo dedup regression** | **P2** | 5 ski photos at 3× (liberty-mountain, roundtop, whitetail, jack-frost, madarao-s22). Bundle with batch approval — don't ship solo. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 44. 2-minute paste. iOS 5.1.1(v). Not a web gate. |
| **VPS health verify** | P2 | 13 days since Jack confirmed. `curl https://peakly-api.duckdns.org/health` before second post. 30 seconds. |
| **SRI/CSP (Open #10)** | P2 | Feasible now (esbuild strips `'unsafe-eval'`). 45 min. Post second post. |
| **"jackson-hole dup" (Content report)** | ✅ FALSE POSITIVE | Only `jacksonhole` exists in VENUES. Unique-ID count = 374, matches baseline. See Decision 1. |

**Permanently closed:** AP_CONTINENT gaps · Babel P1 · retention email cohort · bracket-walker overcount · jackson-hole ghost dup · cross-category photos · Plausible domain · placeholder tags · Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS

---

## Known Blockers

| Blocker | What It Unlocks | Days Waiting |
|---------|----------------|------|
| **Jack: photo approval (10 staged)** | Whakapapa (SH ski hook) · Alpe d'Huez (Aug deadline) · dedup fix bundled | Day 13 |
| **Jack: read Plausible** | Second-post angle · onboarding health · bounce rate | Day 23 |
| **Jack: VPS health check** | Confidence before second post | 13 days |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 44 |
| **LLC approval** | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

**What's NOT a blocker:** Pre-compile CI (done June 20) · Babel performance (done June 20) · AP_CONTINENT coverage (permanently closed) · jackson-hole dup (false positive, closed)

---

## Explicit Product Decisions — July 23

### Decision 1: Content report's "jackson-hole dup returned" is a false positive. Closed.

Content report today stated: `jacksonhole` (compact) and `jackson-hole` (batch) both present, unique IDs = 375. PM verification:

```bash
grep -n '"jackson-hole"\|id:"jackson-hole"' app.jsx
# → no output (0 results)

grep -n '"jacksonhole"\|id:"jacksonhole"' app.jsx  
# → line 505: {id:"jacksonhole", ...}  (1 result)
```

Node unique-ID count within VENUES array: **374**. Matches baseline. Content agent is apparently misidentifying `jackson-hole` from the `SEARCH_PRESETS` or `VENUE_PRESETS` block (not VENUES). The July 20 fix (`e2f02cd`) held.

**Adding to stop-reporting table. Content must grep `id:"..."` patterns inside the VENUES array only, not the whole file.**

### Decision 2: Second-post window is August 1–7. This is the target.

Two gates cleared: pre-compile CI (June 20) + AP_CONTINENT (July 22). Two Jack actions remaining:
- Photo approval: unlocks Whakapapa (NZ SH ski) + Alpe d'Huez (Aug summer glacier) — the two best second-post hooks
- Plausible read: confirms which user segment to target (ski vs beach, US vs EU)

If both happen before August 1, the post goes August 1–7. The northern-beach / southern-ski seasonal overlap is the strongest angle in the product calendar — it closes in September.

**SHIP: Second post August 1–7. DEFER: Everything else.**

### Decision 3: Content's "5 summer glacier proposals" — HOLD, not queued.

Content proposed 5 new venues today (Pitztal, Hintertux, Rettenbach, Kaunertaler, Les Deux Alpes). These are legitimate summer ski venues. However:
- The staged queue is already at 10 (Day 13 waiting)
- Adding more venues without clearing the backlog compounds the approval debt
- Les Deux Alpes is already in VENUES (`les-deux-alpes-fr`)

**HOLD all 5 until current queue is approved. Max queue = 14. Don't add to a full queue.**

---

## This Week's Top 3 Priorities Only

1. **Jack: Approve 10 staged venues.** (15 min) — Alpe d'Huez and Whakapapa are the hooks for second post. The window closes August. Do it this week.
2. **Jack: Read Plausible.** (15 min) — Required to know which audience and angle for the second post. Day 23. Not optional.
3. **Jack: VPS health check.** (2 min) — Before the second post goes live. `curl https://peakly-api.duckdns.org/health`.

Everything else is frozen or deferred.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **5 new summer glacier venues (Content proposal)** | Queue cap. Clear backlog first. |
| **Any new code changes** | Code is sound. Nothing ships until second post lands. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | CUT. Reopen only at 500+ MAU. |
| **APNS push alerts** | Known-skipped. Gate live. Re-flag at App Store submission time only. |
| **JSON-LD structured data** | Can't evaluate ROI without Plausible baseline. DEFER. |
| **SRI/CSP** | 45 min of real work. After second post. |
| **Venue deep links** | After second distribution post. DEFER. |

---

## Success Criteria

| Metric | 5K path | 8K path | Day 23 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ❌ Day 23 — Jack action |
| Second distribution | Week 2 | Week 2 | 🔴 Target Aug 1–7 · 2 Jack tasks remaining |
| Pre-compile CI | Before 2nd post | Before 2nd post | ✅ DONE (June 20 `8ba0ca3`) |
| Catalog — SH + summer ski | Jul–Aug | Jul | 🔴 10 staged, awaiting approval |
| Photo dedup regression | 0 at 3× | 0 at 3× | ⚠️ 5 ski at 3× — bundle with batch |
| Revenue streams | 3 live | +LLC affiliates | ⚠️ 3 live ($7.58/1K MAU) |

**The 8K path is still open** through August if the second post goes August 1–7 with the SH ski / summer glacier hook. After September the seasonal window closes and the catalog advantage shrinks. The code is ready. The catalog is 80% ready. The blockers are two Jack tasks.

---

## One Product Risk Nobody Is Talking About

**The second post's hook has an expiration date.**

The strongest angle right now: "It's summer in North America — you can still ski." Alpe d'Huez summer glacier (France), Pitztal/Hintertux (Austria), Whakapapa (NZ peak), Southern-hemisphere resorts at peak. This is the single most counterintuitive, share-worthy hook in the product calendar — the exact thing that makes someone forward the link.

Alpe d'Huez summer skiing closes in late August. Whakapapa peaks August–September. A second post in early August rides all of these simultaneously. A second post in late August loses Alpe d'Huez. A post in September loses half the story.

The code is done. The venues are staged. The seasonal window is open for 9 more days of August 1–7 targeting.

**This is not a "we'll figure it out" risk. It's a calendar.** The summer glacier angle expires in ~3 weeks regardless of what we ship.

---

*Written 2026-07-23 · v97 · Day 23 post-launch · 374 venues · cache 20260720a · code freeze day 9 · second post target Aug 1–7*
