# Peakly Content & Data Report — 2026-10-06

## Data Health Score: 85/100

**Deductions (unchanged from yesterday):**
- −7: 91 venues (22.5%) have exactly 2 tags — `scoreVibeMatch` and search recall gap. Confirmed via eval.
- −4: 155 of 165 unique venue APs absent from BASE_PRICES (93.9% uncovered) — affects deal scoring for the non-US catalog.
- −3: 5 venues missing `lateSeason:true` vs CLAUDE.md's stated 15 (see below). DevOps confirmed today that grep-only finds 10; quoted-key `"lateSeason": true` accounts for 5 more = **15 total** ✅ — discrepancy is resolved. Score deduction removed.
- −1: Gili Trawangan duplicate still live (beach_gilit/LOP + gili-trawangan/DPS). Code frozen.

**Score revision: 85 → 87** — the lateSeason discrepancy flagged yesterday is RESOLVED (DevOps confirmed all 15 are present in both compact and JSON-key formats). No new deductions. Score slightly higher but BASE_PRICES gap and tag depth remain open.

**Status:**
- ✅ **app.jsx UNCHANGED** since `96def81` (Sep 14) — code freeze Day 22 clean. Braces balanced, smoke green.
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed by DevOps today via dual-format category grep
- ✅ 0 duplicate venue IDs
- ✅ 0 duplicate photo URLs
- ✅ 0 missing lat/lon coordinates
- ✅ 0 missing airport codes (all 404 venues have an `ap`)
- ✅ 0 missing tags arrays
- ✅ All 165 unique venue APs in AIRPORT_COORDS (206 entries)
- ✅ All 165 unique venue APs in AP_CONTINENT
- ✅ GEAR_ITEMS = 0 — Amazon cut for v1 intact
- ✅ **lateSeason:true count = 15** — 10 compact format + 5 JSON-key format. CLAUDE.md is correct. Grep-only returns 10 (misleading) — always use grep with both patterns or the count from CLAUDE.md.
- ⚠️ 91 venues with exactly 2 tags — search and vibe-match gap, stable
- ⚠️ 155 of 165 APs missing from BASE_PRICES (only 15 US hubs covered)
- ⚠️ Gili Trawangan duplicate — rename to Gili Air still blocked by code freeze

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **155 of 165 APs** ⚠️ (93.9% uncovered) |
| GEAR_ITEMS in source | **0** ✅ (Amazon cut for v1) |
| lateSeason venues | **15** ✅ (10 compact + 5 JSON-key — grep-only misleads at 10) |

### lateSeason Status — RESOLVED ✅

DevOps confirmed today (Oct 6): the 15 lateSeason venues are present. The apparent "10 count" was a grep artifact — `grep "lateSeason:true"` only matches the compact format. The JSON-key format `"lateSeason": true` (5 venues in the batch-pasted section) requires a separate pass. Full list of 15:

Compact format (10): whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

JSON-key format (5): snowbird, zermatt, verbier, val-thorens, engelberg

**Val Thorens opens Oct 18** — exactly 12 days from today and the launch date. Its `lateSeason:true` flag IS present. Scoring will correctly bypass the off-season cap when snow depth ≥ 0.5m. ✅

---

## 2. Seasonal Relevance — 2026-10-06

**Today:** Northern Hemisphere, mid-October.

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Skiing N | North | ⚠️ Pre-season | Most resorts open Nov/Dec. lateSeason glacier resorts (Hintertux, Tignes, Saas-Fee) may be open now with Oct snowfall. |
| Skiing S | South | 🔴 End of season | Southern ski season May–Oct. Chilean/Argentinian resorts closing now. |
| Beach N | North | 🟡 Shoulder | Mediterranean post-peak. Caribbean entering prime season (Oct–Apr). Hawaii always-on. |
| Beach S | South | 🟢 Spring | Australia, Brazil, SA beaches warming. Bali/SE Asia always-on. |

**October opportunity:** Caribbean beach venues (Barbados BGI, Jamaica MBJ, Turks & Caicos PLS, Cayman GCM) enter peak season this month. Front-page scoring should naturally surface these as N-hem beaches cool. No manual intervention needed — `scoreWeekend` uses real weather data.

**Ski alert:** The 5 southern-hemisphere ski venues (Bariloche BRC, Mendoza MDZ, Chapelco CPC, Las Leñas NQN, Cardrona/Mt Hutt CHC) will score near 0 through October as S-hemisphere ski season ends. This is correct behavior — `isInSeason` handles hemisphere-aware gating.

---

## 3. Tag Depth Audit

| Tag count | Venues | % |
|-----------|--------|---|
| 1 tag | 0 | 0% |
| 2 tags | 91 | 22.5% |
| 3 tags | 195 | 48.3% |
| 4+ tags | 118 | 29.2% |

**91 venues stuck at 2 tags** — these are primarily from the mid-2026 batch pastes. Venues with ≥4 tags perform better in `scoreVibeMatch` (interest filters) and search recall. This is a post-launch content sprint item, not a launch blocker.

Worst-affected categories by volume: beach (batch venues predominate, many have only 2 generic tags like `["Beach","Swimming"]`).

---

## 4. BASE_PRICES Gap

Only 15 US hub airports (JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, DFW, LAS, PHX, MSP, DTW, EWR) are covered. 155 of 165 unique venue APs show `~$X` estimates rather than route-based pricing. 

Top missing APs by venue count (unchanged from prior reports):

| AP | Airport | Venues | Category |
|----|---------|--------|----------|
| DPS | Denpasar, Bali | ~10 | Beach |
| CUN | Cancún | ~9 | Beach |
| SLC | Salt Lake City | ~8 | Skiing |
| OGG | Maui | ~6 | Beach |
| ZQN | Queenstown | ~5 | Skiing |
| BOB | Bora Bora | ~4 | Beach |
| MLE | Malé, Maldives | ~4 | Beach |
| HKT | Phuket | ~4 | Beach |

These are high-traffic, aspirational destinations where a misleading `~$X` estimate has the most impact on deal score trust. A targeted backfill of the top 8 (~2 hours) would cover the majority of the accuracy gap.

---

## 5. Daily Venue Additions — BLOCKED

**Code is frozen** (Day 22 as of today, Oct 18 launch target). No new venues should be added until post-launch. The 404-venue catalog is healthy and complete for v1.

Venue stub categories do not apply — this project launched post-pivot (May 2026) with only **Skiing** and **Beach** categories. The scheduled task's references to "12 categories" and stub thresholds are artifacts of a pre-pivot configuration. Skiing (134 venues) and Beach (270 venues) are both well above any reasonable minimum threshold.

---

## 6. One Observation for PM

**Val Thorens opens Oct 18 — the launch date — and its `lateSeason:true` flag is confirmed present.** This is the highest-altitude resort in the Alps (2,300m base) and one of the earliest-opening venues in the catalog. If opening-weekend snow depth reaches ≥0.5m, it will score competitively on the front page the day Peakly launches. That's a genuine alignment: a real, verifiable "firing this weekend" venue on day one, at a resort the target audience knows. Worth testing the scoring output against a realistic Oct 18 forecast in the days before launch.

---

*Report generated: 2026-10-06. Code freeze Day 22. Next content sprint: post-launch (tag depth backfill, BASE_PRICES top-8 APs, Gili Trawangan rename → Gili Air).*
