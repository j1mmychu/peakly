# Content & Data Report: 2026-03-23 (v3)

**Author:** Content & Data Lead

---

## Data Health Score: 72/100

Up from 68 (v2). Duplicate pipeline ID is fixed (renamed to `banzai_pipeline`), 109 venues now have Unsplash photos, tanning category is in the CATEGORIES filter. Still dragged down by: 73 venues missing photos (40% of catalog), diving and climbing each have only 1 venue, 5 orphan categories invisible to users, and 58 airport codes missing from BASE_PRICES.

---

## Photo Coverage: 109/182 venues have photos (59.9%)

| Category | With Photo | Missing Photo | Total | Coverage |
|----------|-----------|---------------|-------|----------|
| Skiing   | 50        | 0             | 50    | 100%     |
| Hiking   | 12        | 0             | 12    | 100%     |
| Others*  | 7         | 0             | 7     | 100%     |
| Surfing  | 20        | 33            | 53    | 38%      |
| Tanning  | 20        | 40            | 60    | 33%      |

*Others = diving, climbing, kite, kayak, mtb, fishing, paraglide (1 each, all have photos)

The 73 missing photos are exclusively from the surfing and tanning venue expansion batch. These venues render with gradient-only cards — noticeably lower quality than photo cards.

---

## Total Venues: 182

| Category   | Count | In CATEGORIES Filter? | Status |
|------------|------:|:---------------------:|--------|
| Tanning    | 60    | YES                   | Healthy |
| Surfing    | 53    | YES                   | Healthy |
| Skiing     | 50    | YES                   | Healthy |
| Hiking     | 12    | YES                   | OK but thin |
| Diving     | 1     | YES                   | CRITICAL — 1 venue behind a nav pill |
| Climbing   | 1     | YES                   | CRITICAL — 1 venue behind a nav pill |
| Kite       | 1     | NO                    | Orphaned — hidden from users |
| Kayak      | 1     | NO                    | Orphaned — hidden from users |
| MTB        | 1     | NO                    | Orphaned — hidden from users |
| Fishing    | 1     | NO                    | Orphaned — hidden from users |
| Paraglide  | 1     | NO                    | Orphaned — hidden from users |

**Total: 182 venues across 11 categories**

---

## Issues Fixed (since v2)

1. **Duplicate pipeline ID resolved** — Second entry renamed from `id:"pipeline"` to `id:"banzai_pipeline"`. React key collisions and localStorage corruption risk eliminated.
2. **109 venues now have Unsplash photo URLs** — Up from 0 photos before the photo sprint. All skiing (50), hiking (12), and miscellaneous adventure (7) venues have full photo coverage.
3. **Tanning added to CATEGORIES** — 60 venues (33% of catalog) now browsable via "Beach & Tan" pill.
4. **AFFILIATE_ID placeholders removed** — All gear items use real product URLs.
5. **Zero duplicate IDs remaining** — All 182 venue IDs are unique.
6. **All 182 venues have valid coordinates, airport codes, and ratings** — No missing core data fields.

---

## Remaining Issues

### P0 — Must Fix

**1. Pipeline and Banzai Pipeline are content duplicates**
`pipeline` ("Pipeline, North Shore", line 218) and `banzai_pipeline` ("Banzai Pipeline", line 356) are the same wave on Oahu's North Shore. Different IDs now (so no key collision), but both appear in search results and use the exact same Unsplash photo URL. One should be removed — `banzai_pipeline` has more reviews (6,420 vs 1,203) and better tags.

**2. 73 venues missing photos**
33 surfing + 40 tanning venues have no `photo:` field. These are the venues most likely to appear on the homepage (tanning is the largest category) and they all show gradient-only cards.

### P1 — Should Fix

**3. Diving has 1 venue, Climbing has 1 venue**
Both have CATEGORIES filter pills. Users who tap "Diving" see a single card (Great Barrier Reef). Users who tap "Climbing" see Yosemite only. This makes the app feel empty.

**4. Five orphan categories (kite, kayak, mtb, fishing, paraglide)**
Each has 1 venue but no CATEGORIES filter pill. Only discoverable under "All" by scrolling. Either add them to CATEGORIES or consolidate under an "Adventure" category.

**5. 58 airport codes missing from BASE_PRICES**
Including major airports: JFK, LAX, MIA, CUN. Venues at these airports silently fail flight price estimation.

### P2 — Nice to Have

**6. Rating inflation** — 49/182 venues (27%) rated above 4.95. Three venues at 4.99. Reduces ranking discrimination.

**7. No off-season labeling** — Southern hemisphere ski resorts (Portillo, Perisher, Remarkables, Treble Cone, Corralco) are closed now with no explicit UI indicator.

**8. Torres del Paine approximate coordinates** — Using -51.0000, -73.0000 (rounded). Should be -50.9423, -73.4068.

---

## Spot Check: 5 Venues

| Venue | Category | Coords | Airport | Rating | Photo | Verdict |
|-------|----------|--------|---------|--------|-------|---------|
| Taos Ski Valley | skiing | 36.5953, -105.4475 | SAF | 4.92 | YES | PASS |
| Chamonix-Mont-Blanc | skiing | 45.9237, 6.8694 | GVA | 4.94 | YES | PASS |
| White Beach Boracay | tanning | 11.9674, 121.9248 | MPH | 4.92 | NO | Missing photo |
| Sayulita | surfing | 20.87, -105.44 | PVR | 4.85 | NO | Missing photo |
| Hanalei Bay | surfing | 22.2152, -159.4986 | LIH | 4.93 | NO | Missing photo |

**Result:** 2/5 pass clean. 3/5 fail only on missing photo — all core data (coords, airport, rating) is correct across all 5. Confirms the photo gap is the dominant remaining issue.

---

## Gap Analysis: Weakest Categories

### Suggested venues for 3 weakest filterable categories:

**Diving (currently 1 — needs 4+ more):**
1. **Great Blue Hole, Belize** (BZE) — 124m deep sinkhole, stalactite caves, world-famous
2. **Raja Ampat, Indonesia** (SOQ) — highest marine biodiversity on Earth, 1,500+ fish species
3. **Sipadan Island, Malaysian Borneo** (BKI) — barracuda tornados, permit-only access

**Climbing (currently 1 — needs 4+ more):**
1. **Kalymnos, Greece** (KGS) — sport climbing mecca, 3,500+ limestone routes
2. **Fontainebleau, France** (CDG) — world's premier bouldering, 30,000+ problems
3. **Railay Beach, Thailand** (KBV) — deep-water soloing + sport routes, stunning limestone cliffs

**Hiking (currently 12 — could grow to 15+):**
1. **Torres del Paine W-Trek, Chile** (PUQ) — iconic Patagonia trek, already have PUQ airport mapped
2. **Dolomites Alta Via 1, Italy** (VCE) — dramatic limestone spires, hut-to-hut trekking
3. **Kilimanjaro, Tanzania** (JRO) — bucket-list summit, accessible to non-technical hikers

---

## Seasonal Picks: Top 5 for Week of March 23, 2026

Late March: Northern Hemisphere spring skiing at altitude, Caribbean/Mexico dry season peak, North Shore winter swell tail end, Nepal pre-monsoon window opening.

| Rank | Venue | Category | Why This Week |
|------|-------|----------|---------------|
| 1 | **Zermatt** | Skiing | Europe's highest lift-served terrain. Deep late-season snowpack, spring sun, long days. Season runs through late April. Rating: 4.98. |
| 2 | **Pipeline, North Shore** | Surfing | Final weeks of the North Shore winter swell window. Still firing, thinning crowds. Rating: 4.99. |
| 3 | **Whistler Blackcomb** | Skiing | Massive spring base depth. World Ski & Snowboard Festival season. Warm afternoons, cold mornings = corn snow. Rating: 4.97. |
| 4 | **Mentawai Islands** | Surfing | Early-season Indian Ocean swells starting. The sweet spot before May peak-season crowds arrive. Rating: 4.98. |
| 5 | **Anse Source d'Argent** | Tanning | Seychelles inter-monsoon calm. Light winds, 85F, turquoise water. Before Easter price spike. Rating: 4.99. |

All 5 have photos and complete data — ready for homepage featuring.

**Avoid this week:** Southern hemisphere ski resorts (all closed until June), Bora Bora (peak wet/cyclone month), Kenai River (frozen, salmon run starts mid-June).

---

## Decision Made

**Add Unsplash photos to the 73 missing venues as the next content sprint.** This is now the single highest-impact improvement available. The duplicate pipeline issue is a data hygiene fix (1 minute), but photo coverage directly affects every user's first impression — 40% of venues look visibly worse without real imagery. Tanning (our largest category at 60 venues) has only 33% photo coverage, meaning most users' first browse of beach destinations shows gradient cards. Prioritize tanning photos first (40 venues), then surfing (33 venues). Target: 100% photo coverage by end of week.

---

## Action Items

| Priority | Action | Effort | Status |
|----------|--------|--------|--------|
| ~~P0~~ | ~~Fix duplicate pipeline ID~~ | ~~1 min~~ | DONE (v3) |
| ~~P0~~ | ~~Add tanning to CATEGORIES~~ | ~~1 min~~ | DONE (v2) |
| ~~P0~~ | ~~Add photos to 109 venues~~ | ~~45 min~~ | DONE (v3) |
| P0 | Add Unsplash photos to remaining 73 venues | 30 min | OPEN |
| P0 | Remove content-duplicate `pipeline` entry (keep `banzai_pipeline`) | 1 min | OPEN |
| P1 | Add 3+ diving venues (Blue Hole, Raja Ampat, Sipadan) | 5 min | OPEN |
| P1 | Add 3+ climbing venues (Kalymnos, Fontainebleau, Railay) | 5 min | OPEN |
| P1 | Add BASE_PRICES entries for 58 missing airport codes | 30 min | OPEN |
| P2 | Recalibrate rating distribution (reduce inflation) | 15 min | OPEN |
| P2 | Add season metadata + closed-resort labeling | 20 min | OPEN |
| P2 | Fix Torres del Paine approximate coordinates | 1 min | OPEN |
| P3 | Resolve 5 orphan categories (add to filter or consolidate) | 5 min | OPEN |
