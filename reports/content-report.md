# Peakly Content & Data Report — 2026-08-23

## Data Health Score: 95/100

**Deductions:**
- BASE_PRICES: 29 unique destination APs uncovered; 133/162 = 82.1% (−3 pts). Yesterday's report incorrectly stated 94% — see correction below.
- 6 major US hub airports (BOS, LAX, SEA, JFK, MIA, ORD) missing from BASE_PRICES as destination APs, collectively affecting 10 domestic venues (−2 pts)

**Clean:**
- 0 duplicate `id` values (391 unique IDs)
- 0 duplicate title+location combos
- 0 duplicate photo URLs (391/391 unique across all sources)
- 100% AIRPORT_COORDS coverage (203 entries, 0 venue APs missing)
- 100% AP_CONTINENT coverage (0 venue APs missing)
- 100% field coverage: id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo — all 391 venues
- 14 `lateSeason:true` flags: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
- 0 empty tag arrays; avg 2.8 tags/venue (min 2, max 5)
- 100% skiPass coverage on all 131 ski venues (epic: 34, ikon: 48, independent: 49)
- `.venue-baseline` = 391 ✅ matches actual venue count
- PEAKLY_BUILD: `20260823b` ✅

---

## Category Breakdown

The scheduled prompt references 12 categories and hiking gear stubs — that state is ~4 months stale. Current reality per the 2026-05-03 pivot:

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

## Photo Sources — Correction

Yesterday's report stated "391/391 unique Unsplash URLs." That was **incorrect**. Actual breakdown:

| Source | Count |
|--------|-------|
| Unsplash | 88 |
| Wikimedia Commons | 303 |
| Missing | 0 |
| **Total unique** | **391** |

All 391 photo URLs are unique (0 duplicates). Wikimedia Commons photos were introduced in an earlier session — the previous report failed to detect them. No action required: both sources render correctly, and all URLs are unique.

**Note:** Wikimedia Commons images carry CC attribution requirements that Unsplash images do not. If Peakly ever adds an attribution or credits page, the 303 Wikimedia photos would need attribution listed. Not a launch blocker, but worth tracking as a v2 consideration.

---

## BASE_PRICES Coverage — Corrected

**Actual: 133 of 162 unique venue destination APs are in BASE_PRICES = 82.1%**

Yesterday's report stated 94% (152/162). That was a measurement error — it counted the number of BASE_PRICES entries (152) rather than the number of *venue* destination APs that match a BASE_PRICES key (133). Today's DevOps report (82%) and today's audit independently confirm 82.1%.

### High-impact gaps (major US hubs)

| AP | Venues affected | Notes |
|----|----------------|-------|
| BOS | 3 (Sunday River, Sugarloaf, Cape Cod) | NE ski + beach, likely high-traffic US users |
| LAX | 2 (Manhattan Beach CA, Zuma/Malibu) | LA beaches — high weekend search probability |
| SEA | 2 (Crystal Mountain WA, Stevens Pass) | WA ski |
| JFK | 1 (Hamptons) | High-value beach destination |
| MIA | 1 (South Beach Miami) | High-value beach destination |
| ORD | 1 (Wilmot Mountain WI) | Midwest ski |
| CMH | 1 (Mad River Mountain OH) | Midwest ski |

**Total: 11 venues showing `~$X` estimates instead of deal scores** — all in the US domestic market where real-deal comparisons matter most. BOS/LAX/SEA are the immediate targets; JFK/MIA are prestige destinations. Adding these 6 APs to BASE_PRICES is a 30-minute task with outsize UX impact.

### Remaining 22 single-venue gaps

BOC (Bocas del Toro), FEN (Fernando de Noronha), SRQ (Sarasota), EYW (Key West), VPS (Destin FL), MYR (Myrtle Beach), BME (Broome AU), KRK (Kraków), GEG (Spokane), HNA (Hanamaki/Iwate), RDD (Redding CA), USH (Ushuaia), EAS (San Sebastián), LEA (Exmouth AU), INH (Inhambane MZ), KUL (Kuala Lumpur), BEY (Beirut), TBS (Tbilisi), SOF (Sofia), OKA (Okinawa), SID (Sal Cape Verde), DJE (Djerba).

These are lower priority — mostly remote eco or emerging destinations where users expect estimates.

---

## Seasonal Relevance (2026-08-23 — Launch +1)

| Segment | Venues | Season status |
|---------|--------|--------------|
| N. hemisphere beach | 199 | 🟢 **Prime** — peak UV + warmest water |
| S. hemisphere ski   | 23  | 🟢 **In season** — Andes/NZ/AU mid-winter |
| N. hemisphere ski   | 108 | 🔴 Off-season — 14 `lateSeason` venues may fire if snow depth ≥0.5m |
| S. hemisphere beach | 61  | 🟡 Cooler — water-temp hard cap will exclude most |

**In-season total: 222 of 391 (56.8%)** — 199 N-hemisphere beach venues at summer peak is an excellent launch backdrop. `scoreWeekend` + off-season binary cap correctly handles the rest.

---

## Content Quality

- All 391 venues have non-empty `tags` arrays (avg 2.8 per venue)
- No `description` field in data model — tags carry editorial voice by design
- `skiPass` on 100% of skiing venues
- `poolPrimary:true`: 0 venues (available for future hotel-pool beach additions)
- `lateSeason:true`: 14 high-altitude ski venues (list verified stable)

---

## Venue Addition Status — MORATORIUM ACTIVE

Per PM v124 (2026-08-19): **venue moratorium through 2026-08-30, pre-launch.** No venue additions until post-launch. Declining the scheduled prompt's 5-venue-addition request.

**Post-Aug-30 queue (suggested priorities):**
1. BOS/LAX/SEA/JFK/MIA base-price entries first — fix deal score for 11 existing venues before adding more
2. BOC — Bocas del Toro, Panama (BASE_PRICES entry also needed)
3. FEN — Fernando de Noronha, Brazil (premium eco, BASE_PRICES needed)
4. Zakynthos Shipwreck Beach / Navagio (ZTH — already in AIRPORT_COORDS)
5. Kefalonia Myrtos Beach (EFL — add to AIRPORT_COORDS + AP_CONTINENT)

---

## Observation for the PM

**Launch is +1 day and catalog health is solid at 95/100.** The single highest-ROI fix post-moratorium is filling BOS, LAX, SEA, JFK, and MIA into BASE_PRICES — these 6 entries restore deal-score coverage for 11 domestic US venues (Cape Cod, LA beaches, Maine ski, Hamptons, South Beach) that are the most likely first searches by the Reddit/US audience who just discovered the app. 30-minute task, immediate visible improvement for high-intent users. Queue for week 1 post-launch.

**Housekeeping flag:** yesterday's content report overstated BASE_PRICES coverage (94% vs actual 82%) due to a measurement error. Today's audit re-established the correct baseline. DevOps was right.
