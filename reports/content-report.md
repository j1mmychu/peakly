# Peakly Content & Data Report — 2026-08-22

## Data Health Score: 97/100

**Deductions:**
- BASE_PRICES: 10 unique destination APs not covered (down from 29 yesterday — 152/162 APs = 94%) (−2 pts)
- 3 US hub airports (BOS, SEA, LAX) used as venue destination APs aren't in BASE_PRICES as destinations (−1 pt)

**Clean:**
- 0 duplicate `id` values (391 unique IDs)
- 0 duplicate title+location combos
- 0 duplicate photo URLs (391/391 unique)
- 100% AIRPORT_COORDS coverage (203 entries, 0 venue APs missing)
- 100% AP_CONTINENT coverage (0 venue APs missing)
- 100% field coverage: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo — all 391 venues
- 14 `lateSeason:true` flags: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
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

---

## Seasonal Relevance (2026-08-22 — Launch Day)

| Segment | Venues | Status |
|---------|--------|--------|
| N. hemisphere beach | 162 | 🟢 **Prime season** — peak UV, warmest water temps |
| S. hemisphere ski   | 23  | 🟢 **In season** — Andes/NZ/AU mid-winter, peak powder |
| N. hemisphere ski   | 108 | 🔴 Off-season — summer; 14 `lateSeason` venues bypass cap if snow depth ≥0.5m |
| S. hemisphere beach | 52  | 🟡 Winter — water below 18°C hard cap excludes most from scoring |

**In-season total: 185 of 391 (47%).** Ideal for a Reddit launch today — 162 N-hemisphere beach venues firing in peak European/US summer heat, backed by 23 live S-hemisphere ski destinations for any skiing-minded visitor.

No seasonal mismatch flags. `scoreWeekend` + off-season binary cap correctly deprioritizes the 160 out-of-season venues.

---

## BASE_PRICES Coverage

**152 of 162 unique venue airport codes are in BASE_PRICES (94% coverage).** Remaining gaps are 10 APs affecting single venues each — mostly remote eco destinations (Fernando de Noronha, Bocas del Toro, Broome) where no hub price proxy is clean. Users see `~$X` estimate from the typical-price band, not a blank.

**Not a launch blocker.** Post-launch priority if filling: BOC, FEN, KRK, KUL.

---

## Content Quality

- All 391 venues: non-empty `tags` arrays. Zero stubs.
- No free-text `description` field — tags carry editorial voice by design.
- `skiPass` on all skiing venues (epic/ikon/mountain-collective/independent).
- `poolPrimary:true`: 0 venues (flag available for future hotel-pool beach additions).
- Photos: 391/391 unique Unsplash URLs. Zero repeats.

---

## Venue Addition Status — MORATORIUM ACTIVE

Per PM v124 (2026-08-19): **venue moratorium through 2026-08-30, pre-launch.** No venue additions until post-launch.

The scheduled prompt requests 5 new venue objects. Declining — adding pre-launch adds test surface, drift risk, and cache-buster commits when the launch gate is stability, not catalog breadth.

**Post-Aug-30 queue** (suggested priorities if moratorium lifts):
1. BOC — Bocas del Toro, Panama (BASE_PRICES entry also needed)
2. FEN — Fernando de Noronha, Brazil (premium eco destination, BASE_PRICES needed)
3. Zakynthos Shipwreck Beach / Navagio (ZTH — add to AIRPORT_COORDS; AP_CONTINENT entry exists)
4. Kefalonia Myrtos Beach (EFL — add to AIRPORT_COORDS + AP_CONTINENT)
5. Corfu Paleokastritsa (CFU — add to AIRPORT_COORDS + AP_CONTINENT)

---

## Observation for the PM

**Today is the Aug 22 Reddit launch.** Catalog health is launch-ready: 97/100, zero structural issues, 185/391 venues in prime season, BASE_PRICES at 94% coverage. The one pre-launch guard worth adding post-launch: extend `scripts/auto-push.sh` to catch duplicate photo URLs and duplicate title+location combos (not just duplicate IDs) — this would have surfaced yesterday's venue-pair issues in ~5 days less time. Low-risk, one-session fix, queue for week 1 post-launch.
