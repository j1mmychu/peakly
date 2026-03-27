# PM Report — 2026-03-27 (v16)

## Status: ORANGE — Good velocity, wrong priorities. Algorithm over-rotation is a launch risk.

We shipped 10+ commits overnight. Most were correct. Two decisions require a hard stop and course correction before the Reddit launch.

---

## Shipped Since v15

| Commit | What | Right call? |
|--------|------|-------------|
| `b2aa247` | 9-score algorithm improvements: wind direction for surfing, swell ratio, fishing seasonal, hiking elevation, score floor 20→5 | **MIXED. See risk section.** |
| `27be255` | Research-backed scoring: surfing water temp tiers, diving wind/current proxy, climbing humidity tiers, kayaking water temp | **RIGHT direction, wrong timing. See risk section.** |
| `518b690` | Hero card = highest-scoring venue always; Best Right Now carousel GO-only (≥80) | **RIGHT. Core UX improvement. Reduces misleading signals.** |
| `f36e1dd` | More button pinned outside scroll, geo prompt explainer, hide badges until weather loads, spring animations | **RIGHT. All high-value, low-risk polish.** |
| `082dd09` | Heart favorites auto-sync, top-10 airport search, date contrast, scroll lock, $1k default price | **RIGHT. Airport search was real friction.** |
| `5ac53cb` | Remove Peakly Pro UI entirely + add 192x192 icon to manifest for TWA | **RIGHT. Eliminates the $9/mo vs $79/yr confusion permanently. TWA readiness is free.** |
| `7a9d193` | Category pills equal-width, Ski/Board rename | **RIGHT. Visual consistency.** |
| `5aafc6b` | No hero card/badge until weather loads | **RIGHT. Prevents misleading WAIT state on cold load.** |
| `025ff9c` | Daily Content report | **RIGHT. Content team surfaced a critical issue (see below).** |

---

## Critical Finding: Algorithm Over-Rotation

**v15 explicitly DEFERRED surfing wind direction** — the PM report stated "requires adding coastOrientation data to ~300 surf venues. Not a pre-launch fix." That decision was overridden overnight. `b2aa247` shipped offshore/onshore wind logic and swell direction scoring.

The code is at lines 3142–3176. Here is the problem:

```js
const spotFacing = venue.facing ?? 270;  // Default: west-facing for ALL surf venues
```

**Zero surf venues have a `facing` property.** The algorithm defaults every surf break on earth to west-facing (270°). Barbados faces east. Nazaré faces west. J-Bay faces south. This means the swell direction logic produces wrong results for every non-west-facing break, which is at least half of the 203 surf venues. The algorithm now scores worse than the simpler version it replaced for eastern and southern hemisphere breaks.

**Same issue with `peakMonths` for fishing:** `venue.peakMonths ?? null` — zero fishing venues have this field. The seasonal fishing logic is dead code with a null fallback.

**Decision required:** FREEZE the scoring algorithm before launch. The algorithm has been modified 11+ times in 48 hours without calibration data. The correct next step is to gather signal (score votes, real user feedback post-Reddit) before further refinement — not more refinement before signal.

---

## Bug Triage

| Bug | Severity | Status |
|-----|----------|--------|
| **TP_MARKER = "YOUR_TP_MARKER"** — Every Aviasales flight click earns $0. Zero attribution. Zero commission. | **P0** | Jack: tp.media → Dashboard → Markers → copy → paste at line 3771 → push. 5 min. **Cycle 6.** |
| **All 203 surf venues default to west-facing** — `venue.facing ?? 270` — swell direction scoring applies wrong orientation to non-west-facing breaks worldwide | **P1** | Two options: (A) add `facing` data to surf venues (content work, 1–2 hrs), or (B) revert swell direction logic to pre-b2aa247, which was simpler and correct. Recommend (B) pre-launch. |
| **Photo diversity collapse** — 176 unique base Unsplash IDs for 2,226 venues. 3 base images cover 515 venues (23% of app). Content agent confirmed. | **P1** | Pre-Reddit must fix the top 3 base IDs (fishing, kayak). 2–3 session content job. |
| **Onboarding flow not built** — New users still land on Explore with no explanation of scoring. Called highest-impact dev item in v14 and v15. Still unbuilt. | **P1** | Dev, 3–4 hrs. Must ship before Reddit launch. |
| **`peakMonths` fishing seasonal logic** — dead code, field doesn't exist on any venue, falls through to null | **P2** | Either add `peakMonths` to fishing venues or remove the logic. Recommend remove pre-launch. |
| **REI 22 links earn $0** | **P2** | Jack: Avantlink signup, 30 min, no LLC needed. |
| **Splash screen 1.8s forced on every cold load** | **P3** | Monitor post-launch. |

---

## Known Blockers

| Blocker | Owner | Urgency |
|---------|-------|---------|
| TP_MARKER in app.jsx line 3771 | **Jack** — tp.media dashboard | **TODAY. Cycle 6.** |
| Scoring algorithm freeze decision | **PM + Jack** | **Before any more scoring commits.** |
| Photo diversity fix (top 3 base IDs) | **Dev** | Before Reddit launch |
| Onboarding flow | **Dev** | Before Reddit launch |
| REI Avantlink signup | **Jack** | This week. 30 min. |
| LLC approval | External | Unblocks Stripe, GetYourGuide, Backcountry |

---

## Priority Decisions — Top 3 This Sprint

### 1. SHIP: Onboarding flow (Dev, 3–4 hrs)

This was #1 in v15. It is still unbuilt. The overnight sprint delivered 10 commits of algorithm tuning and UX polish, none of which were onboarding. A new user arriving from Reddit still lands on Explore with no explanation of what "73 / MAYBE" means, why they should set a home airport, or what the app actually does. This single gap is the largest driver of the difference between 5K and 8K users — not scoring precision, not photo polish, not geo prompts.

**SHIP before Reddit launch. Not after.**

### 2. FREEZE: Scoring algorithm (0 hrs dev, 5 min discussion)

The algorithm has shipped 11+ changes in 48 hours. The `venue.facing` bug means the new swell direction logic is actively wrong for east/south-facing surf breaks. The `peakMonths` logic is dead code. Further tuning without calibration data compounds these errors.

**Scoring algorithm is FROZEN from this commit forward until post-Reddit.** Two exceptions: (A) revert the `venue.facing ?? 270` swell direction default if it can't be properly populated, and (B) remove the dead `peakMonths` code. No new scoring logic until we have real user votes.

### 3. SHIP: Photo diversity fix — top 3 base IDs (Dev/Content, 2–3 sessions)

The Content agent confirmed: 23% of the app (515 venues) shares 3 base Unsplash images. A user browsing Fishing sees the same Alaskan river 203 times. A user scrolling Kayak sees the same ocean scene 200 times. When they post about Peakly on Reddit — which is the acquisition channel — they will screenshot the repetition and kill the thread. This is not a nice-to-have. Fix the top 3 offenders before launch.

**Priority order:** fishing (203 venues, 1 image), kayak (202 venues, 1 image), mixed mountain/snow (110 venues, 1 image).

---

## Features REJECTED This Week

| Feature | Verdict | Reason |
|---------|---------|--------|
| More scoring algorithm refinements | **FROZEN until post-Reddit** | 11 changes in 48 hrs with zero calibration data. Compounding errors, not improving signal. |
| Add `facing` orientation data to 203 surf venues | **DEFER to Phase 2** | Right solution but wrong timing. Revert the swell direction logic pre-launch instead. |
| Add `peakMonths` to fishing venues | **CUT pre-launch** | Remove dead code. Add post-launch when data modeling is done properly. |
| Central America venue expansion | **DEFER to post-1K** | 2,226 venues is sufficient. Photo diversity beats venue count. |
| Google Play listing via PWABuilder | **DEFER to post-launch** | $25 + a week. Not a launch blocker. Do after Reddit validation. |
| Trips + Wishlists tabs | **DEFER to 1K users** | Standing decision. Core flow first. |
| Hotel deep links per venue | **DEFER to post-1K** | Generic Booking.com link earns today. |
| Dark mode | **CUT** | No signal this moves any metric. |

---

## Success Criteria

**90-day target: 5K–8K users.** What separates 8K from 5K:

| Lever | 5K scenario | 8K scenario |
|-------|------------|------------|
| TP_MARKER | Unset at Reddit launch. $0 revenue. No attribution data. | Set before launch. Commission active from day 1. |
| Onboarding flow | None. Reddit users bounce within 30 seconds. | 3-screen onboarding. Bounce rate <30%. |
| Photo diversity | 23% of app shows 3 images. Reddit callout kills thread. | Top 3 offenders replaced before launch. |
| Scoring accuracy | `venue.facing` bug silently wrong for 100+ surf venues. | Algorithm frozen OR swell direction logic reverted. |
| Reddit launch date | Still drifting. v14 called April 1/7. Not confirmed. | Hard date set this week. Commit and hold it. |

**Trajectory: 5K if TP_MARKER still unset + no onboarding + photo callout on Reddit. 8K if all four blockers above are resolved before the launch post.**

---

## One Product Risk Nobody Is Talking About

**The `venue.facing ?? 270` default is algorithmically gaslighting the scoring system.** Every surf break on the east coast of any continent — Barbados, J-Bay, Hossegor (which faces southwest), Jeffreys Bay, the entire Brazilian coast — now has its swell direction scored against a west-facing default. A swell coming from the southwest (ideal for Hossegor) reads as slightly off-axis against the hardcoded 270° default. A swell from the east (typical for J-Bay) reads as directly opposed. The algorithm shipped this as an improvement. It is, for west-facing breaks only. For the other half of the world's surf, the score got worse and nobody knows. This will be the hardest class of scoring bug to catch without real-world users — because it only shows up when you know both the break orientation and the swell direction simultaneously. It needs to be frozen or reverted, not patched, before launch.

---

## Decisions Made

| Date | Decision |
|------|----------|
| 2026-03-27 | **Scoring algorithm FROZEN.** No new scoring logic until post-Reddit calibration. Exceptions: revert `venue.facing` swell direction if data can't be populated, remove dead `peakMonths` code. |
| 2026-03-27 | **Surfing wind direction decision from v15 was overridden overnight.** Future agent work must respect PM defers. |
| 2026-03-27 | **Photo diversity — P1 before launch.** Top 3 base IDs must be replaced before Reddit post. |
| 2026-03-27 | **Onboarding remains top dev priority.** Build before Reddit launch. |
| 2026-03-27 | **TP_MARKER → cycle 6. Jack action, today.** |
| 2026-03-27 | **Peakly Pro UI removal confirmed correct.** $9/mo confusion eliminated. |

---

*Next report: 2026-03-28*
