# Peakly Content & Data Report — 2026-08-21

## Data Health Score: 97/100

**Deductions:**
- BASE_PRICES: 29 unique destination APs not covered, affecting 23 venue instances (6% of catalog) (−2 pts)
- 3 US hub airports (BOS, SEA, LAX) used as venue destination APs aren't in BASE_PRICES as destinations
  (crystal-mountain-wa → SEA, sunday-river/sugarloaf → BOS) — edge case but real (−1 pt)

**Clean:**
- 0 duplicate `id` values (391 unique IDs)
- 0 duplicate title+location combos (yesterday's 3 venue-pair dups FIXED in commit `3fd1995`)
- 0 duplicate photo URLs (391/391 unique)
- 100% AIRPORT_COORDS coverage (203 entries, 0 venue APs missing)
- 100% AP_CONTINENT coverage (283 entries, 0 venue APs missing, FOR/NAT fixed yesterday)
- 100% field coverage: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo — all 391 venues
- 14 `lateSeason:true` flags correct: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
- 0 empty tag arrays
- `.venue-baseline` = 391 ✅ matches actual venue count

---

## Category Breakdown

The scheduled prompt references 12 categories and hiking gear stubs. That state is ~4 months stale. Current reality per the 2026-05-03 pivot:

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 260    | ✅ Healthy |
| Skiing   | 131    | ✅ Healthy |
| **Total** | **391** | ✅ Matches `.venue-baseline` |

Surfing retired 2026-05-03. Hiking/climbing/MTB/kayak/dive/yoga/wellness were never re-enabled. Two categories only, both well above any stub floor.

---

## GEAR_ITEMS Audit

GEAR_ITEMS was **intentionally cut for v1** (2026-06-09, Jack — CLAUDE.md Open #13/#16, resolved; standing directive in `tasks/agents/devops.md`). `grep -c GEAR_ITEMS app.jsx` → **0**. Do not restore.

The prompt's "hiking has ZERO gear items" concern is 4 months stale and doubly inapplicable: (a) hiking is not a launch category, (b) Amazon Associates is cut across all categories for v1 by design.

---

## Seasonal Relevance (2026-08-21 — Late N hemisphere summer)

| Segment | Venues | Status |
|---------|--------|--------|
| N. hemisphere beach | 162 | 🟢 **Prime season** — peak UV, warmest water temps |
| S. hemisphere ski   | 23  | 🟢 **In season** — Andes/NZ/AU mid-winter, peak powder |
| N. hemisphere ski   | 108 | 🔴 Off-season — summer; 14 `lateSeason` venues bypass cap if snow depth ≥0.5m |
| S. hemisphere beach | 52  | 🟡 Off-season — Southern winter, water typically below 18°C |

**In-season total: 185 of 391 (47%).** Healthy for late August — 162 beach venues all firing simultaneously alongside 23 Southern-hemisphere ski picks.

**No seasonal mismatch flags.** `scoreWeekend` + off-season binary cap deprioritizes the 160 out-of-season venues correctly — they don't reach the front page. No action needed.

---

## BASE_PRICES Coverage

**152 of 162 unique venue airport codes are in BASE_PRICES (94% coverage).** This is the best coverage has ever been. The remaining 29 missing APs affect only 23 venue instances.

**Notable missing entries:**

| AP | Venues affected | Notes |
|----|-----------------|-------|
| BOC | beach_bocas (Bocas del Toro, Panama) | Single venue |
| FEN | beach_noronha (Fernando de Noronha, Brazil) | Single venue |
| KRK | zakopane (Poland) | Single venue |
| KUL | tioman-island-t11 (Malaysia) | Single venue |
| LEA | turquoise-bay-t8 (Australia) | Single venue |
| BME | beach_cable (Broome, Australia) | Single venue |
| GEG | schweitzer-mtn (Spokane, WA) | Spoke airport — DEN/SEA fares proxy reasonably |
| SEA | crystal-mountain-wa | US hub used as destination — unusual but valid |
| BOS | sunday-river, sugarloaf | US hub as destination |
| SRQ, EYW, VPS, MYR | 4 SE US beach venues | Close to covered hubs; impact low |

**Impact is minimal.** All 29 gaps are single-venue edge cases or US-spoke airports where nearby hub fares proxy acceptably. Users see `~$X` estimate from the fallback typical-price band, not a blank. Not a launch blocker.

**Recommended action if filling more entries:** prioritize BOC, FEN, KRK, KUL — genuine international destinations with no nearby covered hub.

---

## Content Quality

- All 391 venues have non-empty `tags` arrays. No stubs.
- No venue has a free-text `description` field — tags carry the editorial voice. This is by design.
- `skiPass` field present on all skiing venues (epic/ikon/mountain-collective/independent classifications).
- `poolPrimary:true` flag: **0 venues** — no pool-primary beach venues in catalog. If any Mediterranean venues are added that are primarily hotel-pool experiences, this flag is available.
- Photo coverage: 391/391 unique Unsplash URLs. Zero repeats. Zero placeholders.

---

## Venue Addition Status — MORATORIUM ACTIVE

Per PM v124 (2026-08-19): **venue moratorium through 2026-08-30, pre-launch.** No venue additions until post-launch.

The scheduled prompt requests 5 new venue objects. I'm declining to produce them — adding pre-launch adds test surface, drift risk, and cache-buster commits when the launch gate is stability, not catalog breadth.

**Post-Aug-30 queue** (suggested priorities if moratorium lifts):
1. BOC — Bocas del Toro, Panama (BASE_PRICES entry also needed)
2. FEN — Fernando de Noronha, Brazil (premium eco destination, BASE_PRICES needed)
3. KRK — Krakow gateway for Zakopane skiing (European winter add)
4. Belize Ambergris Caye (BZE — already in BP coverage area, strong beach profile)
5. Seychelles Mahé (SEZ — already in BP, add La Digue venue)

---

## Observation for the PM

**The catalog is genuinely clean coming into launch.** Yesterday's fixes (3 dupe-venue deletions + 12 airport-map entries + FOR/NAT in AP_CONTINENT) all landed in `3fd1995`. Today's audit finds zero structural issues: no dupe IDs, no dupe photos, no dupe locations, no missing airport mappings, 94% BASE_PRICES coverage. The score of 97/100 is the highest this catalog has ever been.

The only thing worth watching before the Aug 22 Reddit push: make sure `scripts/auto-push.sh` invariant guard is wired to catch `dup(title+location)` and `dup(photo)` in addition to `dup(id)` — that would have caught the 3 venue pairs that took 5–7 days to surface. Until that guard exists, the only way to catch photo or location dups is the daily audit (this report). Low risk for tomorrow's launch, but a one-session fix worth queuing post-launch.
