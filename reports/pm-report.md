# Peakly PM Report v125 — 2026-08-20

**Status: GREEN with one caveat. Photo dedup is ALREADY CLEARED (2% sharing, not 47%). Aug 22 launch is unblocked on product. Cloudflare + 2 paste-ready diffs are the only work left.**

---

## The Biggest Finding This Run: Our Launch-Gate Metric Was Wrong

**Yesterday's PM v124 decision — "Aug 22 iff photo dedup drops to <25%" — was made on stale/wrong data. Real number is 2%.**

I re-measured photo duplication from `app.jsx` this morning with a broader regex that catches both compact JSX (`photo:"..."`) and JSON-style batch entries (`"photo": "..."`) — same class of counting bug that let the "156 venues" ghost persist for weeks in 2026-06:

```
Total venues with photo: 394
Unique URLs:             391
Dup groups:              3
Total duped venues:      6
% dedup sharing:         2%
```

The 3 remaining dup groups are exactly the 3 duplicate venue pairs Content flagged today (Grace Bay, Tamarindo, Capri) — same physical place, different id, same photo. **Deleting the 3 loser venues per Content's diff clears photo dedup to 100%.** There are no "83 dup groups" and no "186 duped venues" left in the tree. The `d1bddb5` overnight photo sprint (379/394 real venue images) closed the gap.

**Direct implication:** the entire Aug 22 vs Aug 29 debate from PM v124 is resolved. Aug 22 is the target. The gate is Cloudflare + shipping the two ready-to-ship diffs — both single-day work, both Jack-adjacent.

---

## Shipped Since Last Report (v124 → v125)

| Commit | What | Right call? |
|--------|------|-------------|
| `d1bddb5` | Photos: real venue images pushing coverage to 379/394 unique URLs | ✅ **Perfect** — closed the launch-gate metric. This was the P0. |
| `1e27990` | Fix: hero card could surface closed/off-season resorts when live fare resolved first | ✅ Correctness win — reviewer-proof for Aug 22 |
| `854bb1c` | Photos: 292 venues via Wikimedia Commons | ✅ Same sprint, same purpose |
| `492958c` | DevOps report + cache stamp bump `20260818a`→`20260820a` | ✅ Required — 3 app.jsx commits landed without a stamp bump; dev-path testers would have served stale code |
| `99eb7d8` | Content report + 2 ready-to-ship diffs (venue-dupes-delete, airport-coords-10-add) | ✅ Found real bugs. See caveat below on the diff mechanics. |

**No code commits touched user-facing behavior overnight beyond photo replacements and the hero-card fix.** Right posture 2 days from launch.

**Opportunity cost check:** the photo pipeline burned agent budget for 3 days on the wrong headline metric (unique-URL coverage). The v123→v124 pivot to "dedup <25%" caught the framing error but not the fact that we were *already close to done*. Cost: ~2 agent-days of unnecessary anxiety. Lesson below.

---

## Bug Triage

### The venue-dupes diff is CORRUPT — `git apply --check` fails at line 46.

**Verified:** `git apply --check reports/ready-to-ship/venue-dupes-delete-2026-08-20.diff` → `error: corrupt patch at line 46`. The second hunk header is malformed (the note at the diff's bottom acknowledges line-number drift and suggests `--3way`, but `--3way` also fails on the malformed header).

**Severity: P1.** The finding is real (I re-verified the 3 dup groups myself). The fix is trivial (delete 3 venue objects, bump `.venue-baseline` 394→391). But the diff as-shipped won't apply. Someone has to do the deletes by hand or regenerate the diff cleanly.

**Recommended action:** the next Content agent run OR Jack should delete the 3 losing venue objects manually — `tamarindo-cr` (line ~2420), `capri-marina-piccola` (line ~2686), `grace-bay-turks` (line ~4781). Grep for each `id:` string, delete the object. `.venue-baseline` 394→391 in the same commit.

### Peakly Pro price discrepancy ($9/mo vs $79/yr) — not a real bug.

Same as v124 — the prompt's stale context. `grep "PEAKLY_PRO\|isPro" app.jsx` → zero references. Amazon + Pro both formally CUT for v1 in April. No action.

### Sentry DSN — live and verified.

DevOps 2026-08-20 confirmed: DSN `9416b032a46681d74645b056fcb08eb7` in `index.html:77` + `app.jsx:7–8`, `Sentry.captureException` wired at `app.jsx:174`. Not flying blind.

### Cache buster — current at `20260820a`.

Verified in `app.jsx:17`, `sw.js:2`, `index.html:395`. All three in lockstep. Not stale.

---

## Current Launch State (2026-08-20)

| Metric | Status | Note |
|--------|--------|------|
| Venues | **394** (131 ski / 263 beach) | 3 hidden dupes; deleting brings it to 391 real venues |
| Photo dedup | **2% sharing / 3 dup groups / 6 duped venues** ✅ | Cleared. All 3 groups = the 3 venue dupes. |
| BASE_PRICES | **160/162 APs covered (99%)** | 22 non-US single-venue tails deferred to post-Reddit |
| AIRPORT_COORDS gaps | **10 venues silently fail `flightHours()`** | ready-to-ship diff pending apply |
| AP_CONTINENT gaps | **2 (FOR, NAT)** | continent-chip filter silently drops them; ready-to-ship diff pending |
| Exact-fares filter | ✅ Fixed (`6e45fee`) | ≥40% live coverage before grid becomes exact-fares |
| Hero card | ✅ Fixed (`1e27990`) | Off-season resorts no longer promotable via fare-resolves-first race |
| Sentry | ✅ Live | Error monitoring confirmed |
| Plausible | ✅ Live | 4 events wired |
| Cloudflare | ❌ **Outstanding — the last Jack-owned launch blocker** | 30-min browser task |
| VPS | ✅ Verified 2026-08-11 (Jack) | Disk cache, CORS, DELETE alerts, apns:configured |
| Cache stamp | ✅ `20260820a` in all 3 files | |

---

## Three Product Decisions — Aug 20

### Decision 1: SHIP the airport-coords-10-add diff today. Manual-apply the venue-dupes deletes today.

**SHIP.** The airport-coords diff is a 10-line addition to `AIRPORT_COORDS` + 2-line addition to `AP_CONTINENT`. Currently 10 beach venues (Tamarindo, Puerto Escondido, Lanzarote, Gold Coast, Agadir, Moorea, Cascais, Biarritz, Porto de Galinhas, Malapascua) silently bypass the distance filter — a Reddit visitor from JFK setting "≤6hr flight" gets Malapascua (Philippines) in their results. That's a "why is this here" bounce trigger. Applying the diff is a 5-minute agent task.

The venue-dupes diff is corrupt but the finding is verified. Whoever the next actor is (Jack manually, or the next Content run regenerating the diff), the deletes MUST happen before Aug 22 or the Reddit hero shot risk is a scroll that shows the same beach card twice.

**Both fixes are surgical, both close visible-in-first-30-seconds bugs, both must land before the post. Deadline: Aug 21 EOD.**

### Decision 2: CUT the Aug 29 fallback. Aug 22 is the target, full stop.

**CUT.** PM v124 kept Aug 29 as a fallback "if dedup stalls above 30%." Dedup is at 2%. The only remaining launch-day risks are:
1. Cloudflare (Jack, 30 min)
2. Two paste-ready diffs (Content or Jack)

Both are same-day work. Neither requires waiting a week. Keeping Aug 29 on the table is a psychological escape hatch that dilutes urgency. If Cloudflare doesn't land by Aug 21 EOD, we push to Aug 25 (Monday), not Aug 29. The gap between "ready today" and "ready in 9 days" isn't earned by any actual product work — it's just calendar padding.

**Aug 22 (Friday) or Aug 25 (Monday). Nothing later.** Weekday morning post either way.

### Decision 3: SHIP a metrics-verification step before every PM decision going forward.

**SHIP as agent-workflow change.** The v124 "47% dedup" number was wrong for at least 2 reports running. It drove a launch-timeline decision (Aug 22 → possibly Aug 29). No agent — not Content, not PM, not DevOps — actually re-measured it against the code before publishing the decision. Content copy-pasted a stale deduction; DevOps quoted Content's number in its own report; PM keyed the launch gate off the DevOps quote.

Structural fix: **the PM prompt should require re-computing the top-3 headline metrics from source code before committing to a decision.** For photo dedup that's a 5-second `node -e` one-liner (see DevOps report §7 for the exact script). Same discipline that prevents the "156 venues" grep-undercount pattern that keeps recurring here. Add to `tasks/agents/product-manager.md`.

---

## This Week's Top 3 Priorities

**1. Jack: Cloudflare CDN — this is the only Jack-owned launch blocker.**
Same ask as v124 and v123. Zero code changes. 30 minutes in a browser. Without it, a Reddit spike hits GitHub Pages directly. If Cloudflare isn't live by Aug 21 EOD, the post moves to Aug 25.

**2. Content agent or Jack: apply both ready-to-ship diffs.**
`airport-coords-10-add-2026-08-20.diff` — clean, applies with `git apply`. Do it. `venue-dupes-delete-2026-08-20.diff` — corrupt at hunk 2, needs manual apply (3 grep-and-delete operations) or a regenerated diff from the next Content run. Do it. Both close visible bugs.

**3. Jack: pre-warm the VPS the morning of the post.**
`curl -s https://peakly-api.duckdns.org/health` — verify `wx_cache_size > 200`. If cold (post-restart), hit the top 30 venue coords manually via `/api/weather` to warm the disk cache before Reddit traffic lands. Prevents the Open-Meteo burst-ceiling risk DevOps §8 called out.

---

## Features REJECTED This Week

| Feature | Reason |
|---------|--------|
| **Adding 5 new venues (ZTH/GGT/CFU/BDA/AYT + staged others)** | Moratorium holds. Deleting 3 dupes brings us to 391. Earliest add: Aug 30. |
| **JSON-LD structured data / static h1** | Zero conversion impact at <100 MAU. Post-launch SEO pass. Still rejected from v124. |
| **Plausible custom events (detail-sheet-open, book-click-sheet, alert-set, carousel-rendered)** | Tempting because we're going in blind on user behavior — but a 20-min app.jsx edit 2 days before launch is exactly the "surgical change on the wrong day" risk we should avoid. Ship day 3 post-Reddit. |
| **SRI / CSP hardening (Open #10)** | Medium risk to apply, zero launch-day user impact. Post-launch. |
| **APNS / push alerts** | Two open bugs (HTTP/2 transport, JWT DER vs P1363). Do not touch pre-launch. Web is push-free by product decision. |
| **BASE_PRICES for remaining 22 airports** | 99% coverage is ship-ready. First post-Reddit cycle. |
| **Photo pipeline rerun today** | ALREADY DONE. 2% dedup. Any more time on photos is opportunity-cost against the two ready-to-ship diffs. |
| **iOS App Store submission** | Requires Jack + Mac + Xcode. Post-Reddit. |

---

## Success Criteria

**5K vs 8K path, unchanged from v124 — but the deltas are more achievable now:**

| Driver | 5K path | 8K path |
|--------|---------|---------|
| Photo dedup | Any amount of duplicates in first 30s of scroll | ✅ **Already at 2%. Grid will not repeat.** |
| Post timing | Any afternoon | Weekday 9–11am ET, r/skiing + r/frugaltravel staggered 48h |
| Cloudflare | Not configured, GitHub Pages throttle risk | Live before post |
| Viral hook | Standard Reddit post text | Post body includes 2-3 real screenshots (hero card + 2 venue detail sheets) |
| Retention signal | Single-session | Users check back next weekend — alerts as the mechanism (web-side, since iOS APNS gated off) |
| VPS warm | Cold cache | `wx_cache_size >200` morning of post |
| Distance filter accuracy | 10 beach venues silently ignore user's flight-hours setting | ✅ Fixed by airport-coords diff |
| Venue duplication | 3 pairs of same-place-different-id rendering twice | ✅ Fixed by venue-dupes diff |

**The 8K path is now Cloudflare + 2 diffs + a well-crafted post. Nothing else is in the way.**

---

## Blocked

| Blocker | Owner | Unblocks | ETA |
|---------|-------|----------|-----|
| Cloudflare DNS config | Jack (30 min browser) | Reddit spike protection | Must land Aug 21 EOD |
| Apply airport-coords diff | Content agent or Jack | Distance filter honors user constraint on 10 beach venues | Aug 21 EOD |
| Apply venue-dupes deletes (diff is corrupt — manual) | Content agent or Jack | Explore stops showing 3 venues twice | Aug 21 EOD |
| VPS pre-warm | Jack (SSH morning of post) | Cold cache under Reddit spike | Day-of |
| Unsplash key + production access | Jack | Post-launch enhancement — Wikimedia sprint already delivered the launch product | Post-Reddit |
| LLC formation | Jack | REI / Backcountry / GetYourGuide affiliate approvals | Post-Reddit |
| iOS App Store | Jack + Mac + Xcode | Native launch (not pre-Reddit critical path) | Post-Reddit |

---

## One Product Risk Nobody Is Talking About

**Our agents are systematically drifting from ground truth on the numbers that drive product decisions.**

Yesterday's Content report said "47% sharing / 83 groups (unchanged from 08-19)." That number was demonstrably wrong when written — the `d1bddb5` photo sprint had already landed, dropping actual dedup to 2%. The DevOps report today quoted "47%" back in its P2 issue. The PM v124 launch-gate decision was made on that same wrong number.

**Nobody re-measured before deciding.** The metric was carried forward from previous reports as if it were an unchanging fact. This is the same failure pattern as the "156 venues" ghost that persisted for weeks in June — a report's number becomes canonical because no one thinks to re-run the source-of-truth check.

The launch-day risk isn't that we shipped on wrong data (we caught it). The risk is that **the first 48h of Reddit traffic will produce a firehose of Plausible signal that nobody in the agent chain will actually re-derive from raw data.** Bounce rate reported as "68%" in a week-3 report will be "68%" in the week-6 report, and the product decisions after Reddit will be made on numbers that stopped being true days earlier.

**Mitigation:** the Decision 3 change above (PM prompt must re-measure top-3 metrics from source before committing to decisions) is the structural fix. Also add to `tasks/agents/content-data.md`: "before any deduction quotes a percentage, re-derive it in-line from the source file with a scripted count." A metric without a re-derivable script attached is not a metric — it's folklore.

---

## Handoff Notes for Next Agent

- **Photo dedup is DONE.** Do not schedule another photo pipeline run before launch. Any commit that touches app.jsx in the next 48h is a launch-day risk unless it's applying one of the two ready-to-ship diffs.
- **Cache stamp is current** at `20260820a`. Only bump if the ready-to-ship diffs apply.
- **Two ready-to-ship diffs to land by Aug 21 EOD.** Airport-coords is clean; venue-dupes is corrupt and needs manual apply.
- **Cloudflare is the one Jack-owned launch blocker.** Chase it in tomorrow's report.
- **If any agent quotes a percentage in a report, verify it against source code first.** No exceptions.

---

*Report generated 2026-08-20 (v125). Photo dedup is 2%, not 47% — Aug 22 launch is unblocked on product. Cloudflare + 2 diffs are the last work. Structural finding: agent metric-drift is a real risk and needs a re-measure discipline.*
