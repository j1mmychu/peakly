# Peakly PM Report — 2026-07-25 (v99)

> Supersedes v98 (July 24). **Status: GREEN on code, AMBER on infrastructure, RED on distribution execution.** Day 25 post-launch. Code freeze day 11. **4 P0s shipped overnight** (commits `0c02590` / `fc1c194`). Second-post window opens in 7 days (Aug 1). Four gates now stand between this product and its next distribution push: VPS redeploy (technical, ~20 min SSH), weather cache disk persistence (~30 min code + VPS), photo approval (Jack, 15 min), and Plausible read (Jack, 15 min).

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **`20260724a` — auto-bumps on code change. Age alone ≠ stale.** Stop. |
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
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 373 = baseline. Stop.** |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only, incompatible with dev loop. Prod uses esbuild. Stop.** |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **`jackson-hole` FIXED July 20. Only `jacksonhole` exists. 373 unique IDs. Stop permanently.** |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21. Stop permanently.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1. Stop flagging.** |
| "Babel mobile parse wall (P1) unresolved" | **PERMANENTLY CLOSED July 22. esbuild ships since June 20.** Stop. |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild. Stop. |
| "venue count 374 / banff dup" | **FIXED 2026-07-24. banff deleted, count now 373. Stop.** |
| "pre-compile CI deadline July 24" | **FALSE CLOCK. esbuild CI has shipped since June 20. No action needed. Stop.** |
| "tahoe / palisades-tahoe dup" | **FALSE POSITIVE. Only `palisades-tahoe` exists in VENUES. grep confirms 1 result. Stop.** |
| "upcomingFridayISO UTC off-by-one" | **FIXED 2026-07-24 (`0c02590`). `localISODate()` at all 3 call sites. Stop.** |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "WishlistsTab alertedIds out-of-scope" | **FIXED 2026-07-24 (`0c02590`). Stop.** |

---

## Shipped Since v98 (2026-07-24 → 2026-07-25)

| Commit | What | Verdict |
|--------|------|---------|
| `0c02590` | **4 P0 fixes + 4 coord corrections + guard repair + 27 real venue photos** | ✅ Right call — every P0 was confirmed live and broke real users. Long overdue. |
| `fc1c194` | Cache bump `20260724a` to push fixes to existing users | ✅ Required alongside `0c02590` |
| `b67417f` | CLAUDE.md: current state update + mandatory git-fetch-first rule | ✅ Infrastructure — stops stale-clone reruns |
| `c885f06` | DevOps report 2026-07-25 | ✅ Routine |
| `d72f49d` | Content report 2026-07-25 (373 venues, BASE_PRICES P1 flagged) | ✅ Routine |

**Code state July 25:**
- `app.jsx`: 13,538 lines · cache `20260724a` · venue count 373 (131 ski / 242 beach)
- `.venue-baseline`: **373** ✅ matches
- `dist/app.min.js`: esbuild-compiled ✅
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅
- AP_CONTINENT: all codes present ✅
- Staged queue: **~16 venues** (Day 15/13/2 mix — see below)

**Verdict on overnight work:** The P0 audit and fixes were the right call. All four bugs had real user impact — wrong fare dates, dead refresh button, cloud-sync data loss, and a guaranteed ErrorBoundary crash on tab un-hide. These were confirmed present on origin before fixing and are now gone. The VPS-side fixes (items 5–15 in `AUDIT-2026-07-24.md`) are committed but require a VPS redeploy to activate.

---

## Bug Triage — July 25

| Bug | Severity | Status |
|-----|----------|--------|
| **VPS redeploy needed** | **P1 (pre-traffic gate)** | `server/proxy.js` fixes are committed but inert. Until deployed: two-weekend scoring is permanently off (proxy sends `forecast_days=7`), iOS native app CORS is blocked (`capacitor://localhost` absent from allowlist), alert deletion still fails (DELETE not in CORS methods), rate limiter is bypassable (XFF[0] vs XFF[last]). None of these are crashing the current web experience at ~0 MAU, but all four break before Reddit. SSH to 198.199.80.21: `cd /opt/peakly-proxy && [manual file copy] && pm2 restart peakly-proxy`. 20 min. |
| **Weather cache not persisted to disk** | **P1 (pre-traffic gate)** | `pm2 restart` clears `_wxCache` → cold-cache Reddit spike → 748 Open-Meteo calls in <60s → free-tier ceiling → all scores drop to 50. ~30-line fix in `server/proxy.js`. Bundle with VPS redeploy (both are server-side, one SSH). |
| **BASE_PRICES coverage gap** | **P1 (deal headline)** | Content correctly flagged: 100/146 venue airports absent from `BASE_PRICES`. ~68% of the catalog runs deal math on continent-pair estimates, including CUN, BOB, AUA, STT, SXM. The deal score is a headline feature — an empty or coarse estimate degrades the "cheap flight" pitch. Backfill the top 15 by venue count. ~2-hour research + data entry task. BEFORE any Reddit post. |
| **Plausible data unread** | **P1** | Day 25. Gates second-post angle. Jack: plausible.io, 15 min. |
| **Photo approval — ~16 staged venues** | **P1 (time-sensitive)** | Day 15. Alpe d'Huez summer glacier closes ~Aug 28. Whakapapa peaks Aug–Sep. Second-post hook dies without approval by ~July 28. Jack, 15 min. |
| **Ski photo dedup regression** | **P2** | 5 ski photos at 3×. Bundle with staged-venue batch approval — don't ship solo. |
| **Supabase SQL paste** | P0 (App Store) / P3 (web) | Day 46. 2-min paste. iOS 5.1.1(v). Not a web gate. |
| **SRI/CSP (Open #10)** | P2 | Feasible now (esbuild). After second post. |
| **APNS: DER vs P1363 + HTTP/1.1 vs HTTP/2** | P2 (inactive feature) | **Do not wire APNS until both bugs are fixed.** Not blocking v1 iOS. |
| **Stale remote branches (15+ claude/)** | P3 | Cosmetic. After second post. |

**Permanently closed:** AP_CONTINENT gaps · Babel P1 · retention email · bracket-walker · jackson-hole dup · cross-category photos · Plausible domain · placeholder tags · Peakly Pro price · Sentry DSN · VPS outage framing · DEAL_WEIGHT · GEAR_ITEMS · tahoe dup (false positive) · 4 P0s fixed 2026-07-24

---

## Known Blockers

| Blocker | What It Unlocks | Days Waiting |
|---------|----------------|------|
| **VPS redeploy** | Two-weekend scoring · iOS native CORS · alert deletion · rate limiter hardening | Day 1 (proxy.js committed but never deployed post-07-24 audit) |
| **Weather cache disk persistence** | Reddit-spike resilience | Day 2 (first raised 07-23) — bundle with VPS redeploy |
| **Jack: photo approval (~16 staged)** | Whakapapa/Alpe d'Huez second-post hooks · dedup fix bundled | Day 15 |
| **Jack: read Plausible** | Second-post angle · onboarding health | Day 25 |
| **BASE_PRICES top-15 backfill** | Deal score credibility at scale | New (content 07-25) |
| **Jack: Supabase SQL paste** | iOS App Store 5.1.1(v) | Day 46 |
| **LLC approval** | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External |

---

## Explicit Product Decisions — July 25

### Decision 1: VPS redeploy is P1, not P2. Ship this weekend.

DevOps called it P2 today. That's wrong. The audit confirmed: two-weekend scoring has been permanently off since launch (proxy sends `forecast_days=7`, client expects 14); the feature is dark even though the code for it shipped. Additionally, the iOS native app has never been able to reach the proxy (CORS missing `capacitor://localhost`). Alert deletion has never worked. This is not cosmetic — it's three features in the "what does Peakly do?" pitch that are silently broken.

The VPS deploy is a 20-minute SSH task. Jack must do it (the VPS is not a git clone — `git pull` fails there; see CLAUDE.md). The weather cache disk persistence fix should be bundled with the same deploy to avoid two SSH sessions.

**Decision: VPS redeploy is P1. Bundle with weather cache fix. Ship before second post, not after.**

### Decision 2: BASE_PRICES gap is a real P1. Backfill top 15 before Reddit.

Content flagged this correctly. The deal score is a headline feature — the second distribution post will almost certainly lead with "find cheap flights to great conditions." If 68% of airports return continent-pair estimates instead of real baseline prices, the deal signal is noise. Coarse estimates make "Strong deal" labels unreliable. That's a credibility problem in the thread where first impressions form.

The fix is data entry, not code: look up realistic round-trip fare baselines for the top 15 missing airports by venue count (BOB, AUA, STT, UVF, SXM, GCM, CUN, SJD, AXA and ~6 more) and add them to `BASE_PRICES`. ~2 hours. No code risk.

**Decision: BASE_PRICES top-15 backfill is P1. Ships before second post. Code freeze exception granted.**

### Decision 3: Content's 5 new proposals — HOLD. Clear the existing 16-venue queue first.

Content proposed 5 additional venues (distinct from the 16 staged). The queue is already at day 15 with no approval. Adding to it compounds the debt without fixing the root problem: Jack needs to approve what's staged before new venues matter. No new staging until the queue drops below 8.

**Decision: HOLD all 5 new proposals. Unblock the 16 staged first.**

---

## This Week's Top 3 Priorities Only

1. **VPS redeploy + weather cache disk persistence.** (~50 min total · Jack SSH) — Activates two-weekend scoring, hardens against Reddit spike, fixes iOS CORS. Both are server-side, both go in one deploy. Must land before second post.
2. **BASE_PRICES top-15 backfill.** (~2 hours · data entry · app.jsx only) — Deals headline needs real baselines. Ship before any distribution post.
3. **Jack: Approve 16 staged venues + read Plausible.** (~30 min combined) — Alpe d'Huez closes in 4 weeks. Plausible gates the post angle. Both are blocking.

Everything else is frozen.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **5 new venue proposals (Content 07-25)** | Queue cap. Clear the 16 staged first. |
| **tahoe / palisades-tahoe dedup** | False positive — only `palisades-tahoe` exists. No action. |
| **Any code changes beyond VPS fixes + BASE_PRICES** | Code freeze holds. Two exceptions only. |
| **Hotels in deal score** | No demand signal. v2. |
| **Peakly Pro revival** | CUT. Reopen only at 500+ MAU. |
| **APNS push alerts** | Known-skipped. Do not wire until DER/P1363 + HTTP/2 both fixed. |
| **JSON-LD structured data** | Can't evaluate ROI without Plausible baseline. DEFER. |
| **SRI/CSP** | After second post. |
| **Trans-dateline day misalignment (Asia/Pacific)** | Real bug. Deferred — fix deserves its own test pass, low user impact at current scale. |
| **poolPrimary field** | Dead — implemented in scoring, set on 0 venues. Remove in next cleanup pass. Not now. |

---

## Success Criteria

| Metric | 5K path | 8K path | Day 25 status |
|--------|---------|---------|---------------|
| Plausible read | Day 1 | Day 1 | ❌ Day 25 — Jack action |
| Second distribution | Week 2 | Week 2 | 🔴 Target Aug 1–7 · 4 gates |
| VPS redeploy | Before second post | Before second post | 🔴 Committed, not deployed |
| Weather cache resilience | Before first spike | Before first spike | 🔴 Not persisted to disk |
| BASE_PRICES top-15 | Before Reddit | Before Reddit | 🔴 New gate (Content 07-25) |
| Catalog — SH + summer ski | Jul–Aug | Jul | 🔴 16 staged, Day 15 awaiting approval |
| Revenue streams | 3 live | +LLC affiliates | ⚠️ 3 live ($7.58/1K MAU) |

**The 8K path is open but the clock is ticking.** Summer glaciers (Alpe d'Huez, Hintertux) close in 4–8 weeks. The seasonal angle for the second post — "you can ski in 3 continents this July" — has a hard expiry. Every week of delay on venue approval and VPS redeploy is a week of that window closing.

**What has to be true for 8K, not 5K:** The second post lands Aug 1–7 (not Aug 8+), it leads with a specific seasonal angle backed by scored venues (requires Plausible read + staging approval + two-weekend scoring on), and the infrastructure doesn't crater on arrival (weather cache fix + VPS hardening deployed).

---

## One Product Risk Nobody Is Talking About

**Two-weekend scoring has never worked in production.**

The proxy has always sent `forecast_days=7`. The client has always expected 14 and tried the proxy first. Since the VPS has been healthy for 44+ days, the proxy has served every weather request — with a 7-day window. The "next weekend" feature, the `confidence` flag, the whole "8-day horizon" pitch in the second-post copy: all dark. Users who checked Peakly for next weekend's conditions saw scores computed from the wrong data.

This isn't a new finding — AUDIT-2026-07-24.md documented it as P1. But it's been sitting for 24+ hours since the audit landed and there's still no VPS redeploy. The fix is committed. The SSH command is documented. The only thing standing between "never shipped this feature" and "feature works" is one 20-minute Jack task.

Before writing any copy about Peakly's "second weekend" visibility, ship the deploy.
