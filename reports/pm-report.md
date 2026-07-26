# Peakly PM Report — 2026-07-26 (v100)

> Supersedes v99 (July 25). **Status: AMBER on infrastructure, AMBER on distribution.** Day 26 post-launch. **New P0 introduced overnight**: `APNS_LIVE = true` flipped to client before VPS proxy fix is deployed — iOS users can now register alerts that will silently never fire. This is worse than having the tab gated. VPS redeploy is now urgent, not "pre-traffic gate."

---

## Agent Prompt Corrections (permanent — stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **373 venues (131 ski / 242 beach).** Eval-only count. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. 0 refs.** Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "Cache buster stale" | **Auto-bumps on code change.** Age alone ≠ stale. Stop. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Never flag from sandbox. Stop. |
| "DEAL_WEIGHT finding" | **Locked at 0.25.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop. |
| "lateSeason: any count other than 14" | **14. Use `grep -c "lateSeason.*true" app.jsx`.** Stop. |
| "placeholder tags" | **0 remaining. FIXED July 13.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "cancun-beach dup" | **FALSE POSITIVE — in PRESETS not VENUES. 0 dup IDs.** Stop. |
| "AP_CONTINENT gaps (KUL/SNA/MCT/GIG/TFS/CHQ)" | **PERMANENTLY CLOSED. All 6 confirmed. Verified 5× by PM. Stop.** |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift / 376 / 377 venues" | **ROOT CAUSE CLOSED July 21. Real count = 373 = baseline. Stop.** |
| "Babel 8.x upgrade available" | **Babel 8 ESM-only, incompatible with dev loop. Prod uses esbuild. Stop.** |
| "surf-legacy tags" | **Valid beach activity signals per PM v81 Decision 1.** Stop. |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20. Only `jacksonhole` exists. Stop permanently.** |
| "bracket-walker overcounts / +2 drift" | **ROOT CAUSE CLOSED July 21. Stop permanently.** |
| "retention email unsent" | **COHORT PERMANENTLY CLOSED per v94 Decision 1. Stop flagging.** |
| "Babel mobile parse wall (P1) unresolved" | **PERMANENTLY CLOSED July 22. esbuild ships since June 20.** Stop. |
| "No build step / Babel in production" | **WRONG SINCE JUNE 20.** Dev: Babel-in-browser. Prod: esbuild. Stop. |
| "venue count 374 / banff dup" | **FIXED 2026-07-24. banff deleted, count now 373. Stop.** |
| "pre-compile CI deadline July 24" | **FALSE CLOCK. esbuild CI has shipped since June 20. No action needed. Stop.** |
| "tahoe / palisades-tahoe dup" | **FALSE POSITIVE. Only `palisades-tahoe` exists in VENUES. Stop.** |
| "upcomingFridayISO UTC off-by-one" | **FIXED 2026-07-24 (`0c02590`). `localISODate()` at all 3 call sites. Stop.** |
| "onRefresh calls non-existent fetchAllWeather" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "cloud-sync pullNow state sync bug" | **FIXED 2026-07-24 (`0c02590`). Stop.** |
| "WishlistsTab alertedIds out-of-scope" | **FIXED 2026-07-24 (`0c02590`). Stop.** |

---

## Shipped Since v99 (2026-07-25 → 2026-07-26)

17 commits overnight. Sorted by verdict:

| Commit | What | Verdict |
|--------|------|---------|
| `1959f17` / `3165c1e` | APNS delivery fix: P1363 JWT + HTTP/2, alert id `crypto.randomUUID()`, splash watchdog, error-handler scoping, stale index.lock self-heal | ✅ Right call — confirmed broken on origin; the JWT and HTTP/2 bugs would have delivered zero pushes |
| `89cded3` | Fix: anchor weekend scoring to calendar dates (dateline bug); rank grid by confidence-discounted score | ✅ Right call — users crossing midnight would get wrong weekend window |
| `a634b6a` | Perf: paint from cache synchronously + 12-venue first-paint tier | ✅ Good — reduces perceived first-contentful-paint, no risk |
| `28d04b3` → `0c1c59b` → `b7cf1f9` → `991eabb` → `b529d2a` → `35ca37c` → `14d57f8` | iOS widget bridge fixes (Capacitor registration, leaflet/SW precache, pbxproj cleanup) | ⚠️ Right direction but 7 commits to fix widget bridge registration. No user-facing impact until Xcode wiring is done. Watch scope creep on iOS pre-App Store. |
| `495a0b9` | **`APNS_LIVE = true`** — VPS APNs key configured | ❌ **Premature.** Flipped the flag while VPS still runs the old proxy (DER JWT + HTTP/1.1). iOS users now see the Alerts tab and can register — but will never receive a push. A broken promise is worse than a hidden feature. Should have been gated behind VPS redeploy confirmation. |
| `87f8352` | chore: check in `dist/` + ios build artifacts for one-off Xcode build | ⚠️ Acceptable for the one-off. But `dist/` is gitignored and rebuilt by CI. Un-track after Xcode session: `git rm -r --cached dist/ && git commit`. |
| `c92c648` / `e0386d3` | DevOps + Content daily reports | ✅ Routine |

**Code state July 26:**
- `app.jsx`: 13,718 lines · cache **`20260725d` — STALE (should be `20260726a`)** · 373 venues
- `.venue-baseline`: **373** ✅
- `dist/app.min.js`: 457 KB ✅ (esbuild)
- `APNS_LIVE`: **true** ⚠️ (VPS not yet deployed — active broken promise)
- lateSeason: **14** · poolPrimary: 0 · GEAR_ITEMS: 0 ✅

---

## Bug Triage — July 26

| Bug | Severity | Status |
|-----|----------|--------|
| **APNS_LIVE=true + VPS not deployed = broken alert promise to iOS users** | **P0** | Any iOS user who registers an alert today will silently never receive it. Fix: either redeploy VPS today (correct fix) or flip `APNS_LIVE = false` as a stopgap (stopgap). The VPS fix is committed in repo — it just needs to be copied to `/opt/peakly-proxy` and `pm2 restart peakly-proxy`. |
| **Cache stamp stale: `20260725d` (yesterday)** | **P1** | 17 commits shipped overnight. Service worker won't invalidate cached assets for returning users. Bump to `20260726a` in lockstep: `app.jsx:17`, `sw.js:2`, `dist/index.html`. auto-push.sh handles on next Edit/Write. |
| **VPS redeploy** | **P1 (now urgent)** | `server/proxy.js` has: P1363 JWT + HTTP/2 for APNs, `forecast_days=14`, CORS `capacitor://localhost`, DELETE for alerts, rate-limiter XFF last-entry. Until deployed: APNS broken, two-weekend scoring off, iOS native CORS blocked, alert deletion fails. Bundle with weather-cache disk persistence (#23). |
| **BASE_PRICES: 68% of airports missing** | **P1 (pre-Reddit)** | Content confirmed: 100/146 venue airports absent. Deal score degrades to continent-pair estimates for CUN, BOB, AUA, STT, SXM and ~230 more venues. Backfill top 15 by venue count. ~2hr research + data entry. Before Reddit. |
| **5 proposed venues missing AIRPORT_COORDS entries** | **P2 (blocks venue adds)** | Content proposed Grandvalira (BCN), Cortina (VCE), Réunion (RUN), Azores (PDL), Salalah (SLL). VCE and RUN are in `AP_CONTINENT` but absent from `AIRPORT_COORDS` — flight-time filter returns null. BCN, PDL, SLL fully absent. Add the 5 coord entries before adding the venues. |
| **dist/ force-tracked in git** | **P2** | `dist/` is gitignored; CI rebuilds it. Tracking it creates repo confusion and bloat. `git rm -r --cached dist/ && git commit` after Xcode session. |
| **Plausible data unread** | **P1** | Day 26. Jack: plausible.io, 15 min. Gates second-post targeting. |
| **Photo batch approval (~16 staged venues)** | **P1 (time-sensitive)** | Alpe d'Huez glacier closes ~Aug 28. Jack, 15 min. Second-post hook weakens without approval by ~July 28. |
| **Supabase delete-account SQL paste** | P0 (App Store) / P3 (web) | Day 47. 2-min paste. iOS 5.1.1(v). Not a web gate. |
| **SRI/CSP (Open #10)** | P2 | After second post. |

---

## This Week's Top 3 Priorities

**1. VPS redeploy + APNS alignment (Jack — 25 min SSH, TODAY)**
The APNS_LIVE=true flag with a broken VPS is an active P0. Every hour it runs, iOS users register alerts they'll never receive. Correct sequence: SSH → copy proxy files → `npm install` → `pm2 restart` → verify `/health` shows `apns: configured` → confirm `APNS_LIVE = true` is correct. Bundle weather-cache disk persistence (#23) — same session. If VPS can't happen today, flip `APNS_LIVE = false` as a stopgap commit in the next 2 hours.

**2. BASE_PRICES backfill — top 15 airports by venue count (dev, ~2hr)**
68% of airports return guessed deal math. The deal score is the product's core differentiator. Concrete targets: CUN (multiple beach venues), BOB, AUA, STT, SXM, and the top remaining EU/APAC gateways. Before Reddit.

**3. Cache stamp bump to `20260726a` + Plausible data read (dev 5 min, Jack 15 min)**
Stale cache means 17 overnight commits aren't reaching returning users. Five-minute fix that should happen with the next any code touch. Plausible read gates second-post angle — Jack pulls top venues, traffic sources, device split, then picks subreddit and hook for the Aug 1 window.

---

## Decisions This Report

**Decision 1: APNS_LIVE = false stopgap OR VPS redeploy — pick one, do it today.**
The current state (APNS_LIVE=true + broken VPS) is P0. It's not a "watch and see." If VPS redeploy can happen today: do it, verify, done. If not: flip `APNS_LIVE = false` as a one-line commit to stop the broken-promise exposure until the VPS is ready. "Both are deferred" is not an option.

**Decision 2: Hold the 5 proposed venues until AIRPORT_COORDS entries are confirmed.**
Grandvalira, Cortina, Réunion, Azores, Salalah are all legitimate additions. But VCE and RUN are in `AP_CONTINENT` without `AIRPORT_COORDS` entries — the flight-time filter silently passes them as "unknown distance." Add the 5 coord rows first, then add the venues. Batching both into one commit is the right move.

**Decision 3: iOS widget Xcode wiring DEFERRED until after second Reddit post.**
The Swift code is complete. Xcode wiring is a Jack-machine manual task with zero user-facing impact until App Store submission. It does not help the 100K goal before iOS distribution is actually live. Scope it for post-second-post, pre-App Store submission sprint.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **JSON-LD structured data** | Zero organic search traffic to benefit yet. GSC isn't showing impressions because nobody is linking here. Ship after first Reddit seeding drives enough traffic that structured data has something to amplify. |
| **Static h1 fallback** | Same reasoning as JSON-LD. SEO optimizations compound on existing traffic; premature before distribution. |
| **Venue deep links** | Already decided post-Reddit launch. Holds. No change. |
| **Group coordination** | Roadmap item 6. Not until 1K users. |
| **Hotel pricing in deal score** | v2. Lean-before-launch principle holds. Flights + conditions is the v1 pitch. |

---

## Success Criteria

**90-day target: 8K users (not 5K).** What has to be true for 8K vs 5K:

1. **Two Reddit posts land well** — r/skiing (October, ski season opener) + r/travel (anytime). Each good post drives 500–2K organic. Timing the ski post to early-October season buzz is the single highest-leverage action available.
2. **VPS is deployed before any post** — two-weekend scoring being silently off means the product's headline feature (Fri–Mon window confidence) is degraded. If a Reddit user checks back the following weekend and gets wrong window data, they churn.
3. **Deal scores feel real** — BASE_PRICES backfill for top-traffic airports. A "Strong deal" badge on a CUN flight that's actually just a continent-pair estimate kills the trust that drives word-of-mouth.
4. **First load works on mobile without visible errors** — especially iOS cold-start, which the App Store reviewer will see.

The difference between 5K and 8K is distribution timing + product trust, not features.

**Current gates to first Reddit post (Aug 1 window):**
- [ ] VPS redeploy (Jack, 25 min) — **URGENT**
- [ ] BASE_PRICES top-15 backfill (dev, 2hr)
- [ ] Plausible read (Jack, 15 min)
- [ ] Photo batch approval (Jack, 15 min)

Three of four require Jack.

---

## One Product Risk Nobody Is Talking About

**The confidence-discounted grid ranking in `89cded3` is unverified across timezones.** The dateline fix + confidence-discounted sort changes which venues appear at the top of Explore on Friday/Saturday evening. A US-West user browsing at 7pm Friday and a US-East user browsing at the same clock time are now in different "weekend windows." Nobody has checked what the top-10 grid looks like from each coast after this change. If the sort buries genuinely great weekends behind low-confidence ones, first impressions on the Reddit wave will be weak and the product looks uncertain. Before the post: load Explore on mobile at ~6pm Pacific Friday and confirm the top venues make sense. Five minutes. High-leverage gut check.

---

*Next run: v101, 2026-07-27. Top priority: confirm APNS/VPS P0 resolved.*
