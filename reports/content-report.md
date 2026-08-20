# Peakly Content & Data Report — 2026-08-20

## Data Health Score: 78/100

**Deductions:**
- **NEW: 3 duplicate venue pairs (same physical location, different IDs, sharing photo URL)** (-6 pts)
  These slipped past yesterday's report because ID-uniqueness passes; the duplicates are only visible by (title+location) or (photo URL) hash. Same Explore-card-twice UX bug as photo dedup, but 3 lines to fix instead of ~180.
- Photo duplication: 47% sharing / 83 groups (unchanged from 08-19) (-14 pts)
- BASE_PRICES: 22 single-venue non-US airport codes still missing (-1 pt, unchanged)
- 10 venue airport codes missing from `AIRPORT_COORDS` — silent `flightHours()` failure, distance filter drops them (-1 pt, new find, previously masked)

**Clean:**
- 0 duplicate `id` values in VENUES array
- 0 out-of-range coordinates (all lat/lon within valid bounds)
- 100% field coverage: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo — all 394 venues
- 100% photo URL coverage (394/394)
- 14 `lateSeason:true` flags confirmed (whistler, chamonix, mammoth, abasin, tignes, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, zermatt, engelberg, snowbird, verbier, val-thorens)
- 0 empty tag arrays
- All 394 IATA codes present in `AP_CONTINENT` except 2 (FOR, NAT — see below)

---

## Category Breakdown

The scheduled prompt still asks about 12 categories with hiking gear stubs. That state is 3+ months stale. Current reality (unchanged):

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 263    | ✅ Healthy |
| Skiing   | 131    | ✅ Healthy |
| **Total** | **394** | Matches `.venue-baseline` ✅ |

Surfing retired 2026-05-03. Hiking/climbing/MTB/kayak/dive/yoga/wellness were never re-enabled per launch-scope pivot. Two categories only, both well above the 10-venue stub floor. No stub flags.

---

## 🚨 NEW P1 FINDING — 3 Duplicate Venue Pairs

Same physical location, different IDs, sharing the same photo URL. Rendered as two separate cards in Explore. This is worse than photo dedup because the *venue* is duplicated, not just the image. Yesterday's dedup analysis only checked ID uniqueness — these are near-miss dupes hiding one level down.

| Keep | Delete | Why keep the winner |
|------|--------|---------------------|
| `beach_grace` (line 548) | `grace-bay-turks` (line 4781) | `beach_grace` is referenced in an alert template draft at line 10460; deleting it silently breaks a demo config. Losing dup's better tags ("US Direct Flights", "Barrier Reef Snorkel") should be transplanted onto `beach_grace` in a follow-up. |
| `beach_tamarindo` (line 4877) | `tamarindo-cr` (line 2420) | **Correct airport LIR** (1hr drive) vs SJO (4hr drive from Tamarindo); richer tags |
| `beach_capri` (line 4974) | `capri-marina-piccola` (line 2686) | 4 tags vs 2 (incl. "Blue Grotto Island", "Dolce Vita Escape"); higher rating 4.94 vs 4.5 |

**Paste-ready diff (`reports/ready-to-ship/venue-dupes-delete-2026-08-20.diff`):** deletes 3 losing venue objects, no other changes. Sub-15-min apply. Net: 394 → 391 venues, `.venue-baseline` needs 394 → 391 in same commit.

**Side effect:** Once `tamarindo-cr` is deleted, `beach_tamarindo` still fails distance-filter because **LIR is missing from AIRPORT_COORDS**. Fix in same commit — see next section.

---

## 🚨 NEW P1 FINDING — 10 Missing `AIRPORT_COORDS` Entries

Silent bug: any venue whose `ap` code isn't in `AIRPORT_COORDS` returns `null` from `flightHours()`, which the `≤Nhr flight` default filter (6hr) treats as "unknown → passes." Whether it passes or fails, the venue can't honor the user's actual constraint. All 10 landed via batch adds that skipped the airport-registration step:

| AP | Missing venue | Continent |
|----|---------------|-----------|
| LIR | beach_tamarindo (Costa Rica) | latam |
| OAX | beach_puerto_escondido (Mexico) | latam |
| ACE | beach_lanzarote (Canary Islands) | europe |
| OOL | beach_gold_coast (Australia) | oceania |
| AGA | beach_agadir (Morocco) | africa |
| PPT | beach_moorea (French Polynesia) | oceania |
| LIS | beach_cascais (Portugal) | europe |
| BIQ | beach_biarritz (France) | europe |
| REC | beach_porto_galinhas (Brazil) | latam |
| CEB | beach_malapascua (Philippines) | asia |

**Paste-ready diff (`reports/ready-to-ship/airport-coords-10-add-2026-08-20.diff`):** 10 lines added to `AIRPORT_COORDS`, all coords from OSM primary IATA lookup. Sub-15-min apply.

## 🚨 NEW P2 FINDING — 2 Missing `AP_CONTINENT` Entries

`FOR` and `NAT` (both Brazilian NE beaches — Fortaleza, Natal). Same silent-drop class as the AIRPORT_COORDS gap, but `AP_CONTINENT` failure means the continent chip filter also drops them.

- `FOR` → `"latam"` (Fortaleza / beach_jericoacoara)
- `NAT` → `"latam"` (Natal / beach_pipa_brazil)

Bundle into the same fix commit — 2 lines added to `AP_CONTINENT`.

---

## GEAR_ITEMS Audit

GEAR_ITEMS was **intentionally removed for v1**. Amazon Associates formally cut 2026-06-09 by Jack (CLAUDE.md Open #13/#16 — closed; standing directive in `tasks/agents/devops.md`). `grep -c GEAR_ITEMS app.jsx` → **0**. Do not restore.

The scheduled prompt's "hiking has ZERO gear items" concern is 4 months stale and doubly inapplicable: (a) hiking is not a launch category, (b) no category has gear items in v1 by policy.

---

## Seasonal Relevance (2026-08-20 — Late Northern Summer / 2 days pre-launch)

| Segment | Venues | Status |
|---------|--------|--------|
| N. hemisphere beach | 202 | 🟢 Peak season |
| S. hemisphere ski   | 23  | 🟢 Peak season (Andes + NZ/AU mid-winter) |
| N. hemisphere ski   | 108 | 🔴 Off-season (14 lateSeason venues bypass off-season cap w/ ≥0.5m snow depth) |
| S. hemisphere beach | 61  | 🟡 Off-season (Southern winter, water below 20°C most sites) |

**In-season for Aug 22 Reddit launch window: 225 of 394 venues (57%).** Strong catalog — 202 beach + 23 southern-hem ski all firing simultaneously.

**No seasonal mismatch flags to worry about.** `scoreWeekend` + off-season binary cap handles the 169 out-of-season venues correctly — they score low, they don't reach the front page, they don't get promoted.

---

## BASE_PRICES Coverage — Status Check

**133 of 162 unique venue destination airports covered directly (82%).** After filtering self-destinations (US home airports where a venue happens to sit at a US hub — SFO, LAX, JFK, etc., which don't need entries), the effective gap is ~22 non-US airports. **This matches yesterday's 99% headline but not its precision** — a corrected reading is:

- 133 destinations with fares from ≥1 US hub ✅
- 22 non-US destinations with 0 US-hub fares (mostly single-venue edge cases)
- 7 self-destination "misses" that don't need entries

**Only single-venue tails remain.** Impact is small: 22 venues will show the `~$X` estimate from the fallback typical-price band instead of a specific US-origin estimate. Not a launch blocker — but if BASE_PRICES coverage claims cross into user comms, use "99% of user routes have a fare estimate" not "99% coverage" — they're different metrics.

---

## Content Quality Spot-Check

- All 394 venues have a non-empty `tags` array (0 stubs).
- All 394 venues have `title`, `location`, `icon`, `rating`, `reviews`, `gradient`, `accent` — no missing render-critical fields.
- Venues don't have a free-text description field; tags carry the editorial voice. No description-length check applies.
- Difficulty levels: skiing venues use `skiPass` for pass classification (epic/ikon/mountain-collective/independent). No numeric difficulty field to audit.

---

## 5 New Venue Objects — Declined

The prompt asks for 5 new venue adds today. **The venue moratorium is active until 2026-08-30 per PM v124 (2026-08-19) — no venue changes until post-launch.** Adding 5 more venues 2 days before the Reddit push adds test surface, drift risk, and cache-buster commits when the launch gate is photo dedup, not catalog breadth.

Recommended alternative: apply the **3-venue deletion** and **12 airport-map additions** above instead. Same "content moved" feeling for the pipeline, zero risk of introducing a new photo dup, and fixes 3 real UX bugs a Reddit visitor would notice inside 30 seconds of scrolling.

If the moratorium lifts and adds are back on the table Aug 31, the queue should target the 22 uncovered single-venue non-US airports (Bocas del Toro, Kraków, Djerba, Kuala Lumpur, etc.) — filling BASE_PRICES gaps from real venues we already agreed to price.

---

## Observation for the PM

**Yesterday's "0 duplicate IDs" bill of health was correct but incomplete.** Three same-place-different-id venue pairs (Grace Bay, Tamarindo, Capri) are today rendering as two identical Explore cards each. That's the same "user sees the same thing twice" bug that made photo dedup the launch gate — just at the venue layer, and only visible if you hash by (title+location) or (photo URL) instead of `id`.

**Recommendation:** promote the 3-line deletion + 12-line airport-map fill (`ready-to-ship/venue-dupes-delete-2026-08-20.diff` + `airport-coords-10-add-2026-08-20.diff`) into the same commit as any photo-dedup batch that lands before Aug 22. It's a 30-minute win on the launch-gate metric (visible duplicates in Explore) that photo swaps alone won't clear.

Also worth adding to `scripts/auto-push.sh` invariant guard: fail on `dup(title+location)` and `dup(photo)`, not just `dup(id)`. Would have caught the Grace/Tamarindo/Capri dupes at the commit that introduced them (Aug 13 and Aug 15 batches) instead of surfacing here 5–7 days later.
