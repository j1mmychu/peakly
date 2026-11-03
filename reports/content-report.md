# Peakly Content & Data Report — 2026-11-03

## Data Health Score: 88/100

**Deductions (unchanged from Nov 2):**
- −7: **225 venues have exactly 2 tags** (190 beach, 35 skiing) — thin tags reduce filter/search richness. Tag enrichment remains the highest-leverage content improvement available within the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193–v197 decision, deferred post-Reddit gate. Scored for the backlog, not a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified by bracket-walk of VENUES array): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All counts below are from live app.jsx, not memory.

---

## 1. DATA INTEGRITY AUDIT

| Check | Result |
|-------|--------|
| Total venues | **404** |
| Skiing | 134 |
| Beach | 270 |
| Categories | 2 (skiing, beach) — correct post-pivot |
| Duplicate IDs | **0** ✅ |
| Missing coordinates | **0** ✅ |
| Missing airport codes (ap) | **0** ✅ |
| Missing tags | **0** ✅ |
| Missing photos | **0** ✅ (100% coverage) |
| Missing titles | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Bad category values | **0** ✅ |
| `scripts/.venue-baseline` | **404** — matches actual count ✅ |
| AP_CONTINENT coverage | 165/165 venue APs present ✅ (283 total entries, FOR/NAT in quoted-key block) |
| AIRPORT_COORDS coverage | 165/165 venue APs present ✅ |
| BASE_PRICES coverage | Destination × origin matrix verified ✅ |

**Integrity: CLEAN.** No regressions from Nov 2. All support tables fully aligned.

**Note on app.jsx:** No changes to the venue catalog since commit `6f0e744` (2026-10-18, App Review build 3). Cache stamp is `20261031a` — 3 days behind today per DevOps report, but that's a non-content issue (no venue data changed, just stamp staleness from no auto-push hook fires).

---

## 2. GEAR ITEMS AUDIT

Per CLAUDE.md: **GEAR_ITEMS cut for v1 (Jack's decision 2026-06-09, affirmed 2026-06-10).** `grep -c GEAR_ITEMS app.jsx` → 0. Intentional.

**No action required on gear items until Amazon is re-enabled post-launch.**

---

## 3. SEASONAL RELEVANCE (Nov 3, 2026)

| Segment | Count | Status |
|---------|-------|--------|
| N-hem ski | 111 | Early season — most NH resorts open late Nov/Dec |
| N-hem ski (lateSeason) | 15 | ✅ **Open now** — glacier/high-altitude venues bypass off-season cap at ≥0.5m snow depth |
| S-hem ski | 23 | End of season — scoring correctly deprioritizes |
| N-hem beach | 201 | Off-season — UV/temp scoring handles naturally |
| S-hem beach | 69 | **Peak season** — Bora Bora, Zanzibar, Maldives, Mauritius, Brazil, Mozambique, Seychelles surfacing correctly |

**Seasonal alignment is correct.** The 15 `lateSeason: true` glacier venues (Whistler, Hintertux, Tignes, Val Thorens, Zermatt, Saas-Fee, Les Deux Alpes, Engelberg, St. Moritz, Chamonix, Mammoth, Verbier, Cervinia, A-Basin, Snowbird) are the right inventory for early November.

**Critical timing (unchanged from Nov 2):** Whistler opens ~Nov 21 (18 days). Two-weekend scoring is broken on the live VPS until the Nov 7 P0-A redeploy lands. Whistler's opening weekend will score wrong without it. Not a content issue — flagging for PM/DevOps awareness.

---

## 4. CONTENT QUALITY — TAG DISTRIBUTION

Tag density is the only remaining content quality gap.

| Tag Count | Venues | % of total |
|-----------|--------|------------|
| 2 tags | 225 | 55.7% |
| 3 tags | 14 | 3.5% |
| 4 tags | 164 | 40.6% |
| 5 tags | 1 | 0.2% |
| **Average** | — | **2.9 tags/venue** |

**Target: ≥4 tags per venue.** 225 venues are below threshold. No change from Nov 2.

### High-priority ski venues with 2 tags (sample — top by rating):
- `chamonix` — "Off-Piste, Mont Blanc Views" → **add: Vallée Blanche, Steep & Deep**
- `aspen` — "Expert Terrain, Luxury Village" → **add: Maroon Bells, Blue Sky Basin**
- `vail` — "Back Bowls, All Levels" → **add: Après-Ski Strip, Epic Pass Hub**
- `verbier` — "Freeride Mecca, Après-Ski" → **add: 4 Vallées, Mont Fort Views**
- `cervinia` — "High Altitude, Late Season" → **add: Matterhorn Glacier, Italy-Switzerland Link**

### High-priority beach venues with 2 tags (sample — top by rating):
- `beach_maldives_rangali` — check and add coral/dive/overwater tags
- `beach_bora_bora_t1` — add lagoon/overwater/snorkeling tags
- `beach_zanzibar_t1` — add spice island/PADI dive/Stone Town tags
- `beach_seychelles_t1` — add granite rocks/wildlife/inner islands tags

---

## 5. VENUE ADDITIONS

**Queue FROZEN per PM directive (v193+).** No new venues added today.

The 5-venue slots in the original task prompt are suspended until PM lifts the freeze (currently tied to Reddit gate + App Review resolution). When the freeze lifts, top priority targets are: additional S-hem beach (Australia east coast, South Africa Western Cape), early-season N-hem ski (Verbier area gaps), and Canary Islands beach (year-round warm weather, currently under-represented).

---

## One Observation for the PM

**Score: 88/100 — fourth consecutive day with no data regressions.**

The venue catalog is genuinely clean. The 225 thin-tag venues remain the only meaningful content gap, and they're a UX polish task, not a correctness issue. From a data quality standpoint, there is nothing blocking launch.

The VPS Nov 7 deadline is still the pre-traffic gate for content quality to matter: broken two-weekend scoring means even the best venue data won't produce honest scores for users arriving after a Reddit post. Content is launch-ready; infra is not.
