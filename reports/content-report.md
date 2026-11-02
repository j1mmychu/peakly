# Peakly Content & Data Report — 2026-11-02

## Data Health Score: 88/100

**Deductions (unchanged from Nov 1):**
- −7: **225 venues have exactly 2 tags** (190 beach, 35 skiing) — thin tags hurt search/filter UX and feature labels. Tag enrichment is the single highest-leverage content improvement available without touching the venue freeze.
- −5: **Venue addition queue FROZEN** per PM v193–v197 decision, deferred indefinitely post-Reddit. Scored for the backlog, not for a data error.

> **⚠️ STALE TASK PROMPT NOTE:** This routine's stored prompt references "182 venues, 12 categories, hiking gear items." Actual state (verified by bracket-walk of VENUES array): **404 venues, 2 categories (skiing + beach), GEAR_ITEMS cut for v1.** All counts below are from live app.jsx, not CLAUDE.md memory.

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
| AP_CONTINENT coverage | 165/165 venue APs present ✅ |
| AIRPORT_COORDS coverage | 165/165 venue APs present ✅ |
| BASE_PRICES coverage | 165/165 venue APs covered (181 entries) ✅ |

**Integrity: CLEAN.** No regressions from Nov 1. All support tables fully aligned.

---

## 2. GEAR ITEMS AUDIT

Per CLAUDE.md: **GEAR_ITEMS cut for v1 (Jack's decision 2026-06-09, affirmed 2026-06-10).** `grep -c GEAR_ITEMS app.jsx` → 0. Intentional.

**No action required on gear items until Amazon is re-enabled post-launch.**

---

## 3. SEASONAL RELEVANCE (Nov 2, 2026)

| Segment | Count | Status |
|---------|-------|--------|
| N-hem ski | 111 | Early season — most resorts don't open until late Nov/Dec |
| N-hem ski (lateSeason) | 15 | ✅ **Open now** — glacier/high-altitude venues bypass off-season cap at ≥0.5m snow depth |
| S-hem ski | 23 | End of season — scoring correctly deprioritizes |
| N-hem beach | 201 | Off-season — UV/temp scoring handles naturally |
| S-hem beach | 69 | **Peak season** — Bora Bora, Zanzibar, Maldives, Mauritius, Brazil, Mozambique, Seychelles surfacing correctly |

**Seasonal alignment is correct.** The 15 `lateSeason: true` glacier venues (Whistler, Hintertux, Tignes, Val Thorens, Zermatt, Saas-Fee, Les Deux Alpes, Engelberg, St. Moritz, Chamonix, Mammoth, Verbier, Cervinia, A-Basin, Snowbird) are the right inventory to feature in early November. No misclassifications detected.

**Critical timing note:** Whistler opens ~Nov 21 (19 days). The VPS redeploy (P0-A, Nov 7 deadline) must land before then — two-weekend scoring is broken on the current live VPS, which means Whistler's opening weekend will score wrong if not fixed. This is not a content issue, but it affects the most high-profile early-season venue.

---

## 4. CONTENT QUALITY — TAG DISTRIBUTION

Tag density is the only remaining content quality gap.

| Tag Count | Venues | % of total |
|-----------|--------|------------|
| 2 tags | 225 | 55.7% |
| 3 tags | 14 | 3.5% |
| 4 tags | 164 | 40.6% |
| 5 tags | 1 | 0.2% |
| Average | — | **2.9 tags/venue** |

**Target: ≥4 tags per venue.** 225 venues are below threshold.

### Ski venues with thin tags (35 total, 2-tag candidates):
These are premium, high-traffic venues that deserve richer tag sets:
- `chamonix` — tags: "Off-Piste, Mont Blanc Views" → **add: Vallée Blanche, Steep & Deep, World's Longest Piste**
- `aspen` — tags: "Expert Terrain, Luxury Village" → **add: Celebrity Scene, Maroon Bells, Blue Sky Basin**
- `vail` — tags: "Back Bowls, All Levels" → **add: Après-Ski Strip, Legendary Back Bowls, Epic Pass Hub**
- `alta` — tags: "Ski Only, Deep Powder" → **add: No Snowboarders, Powder Stash, Snowbird Adjacent**
- `jacksonhole` — tags: "Teton Views, Expert+" → **add: Corbet's Couloir, Aerial Tram, Wolf Pack Powder**
- `telluride` — tags: "Box Canyon, Ski-In/Out Town" → **add: Colorado 14ers, Free Gondola, Gold Medal Town**
- `mammoth` — tags: "Sierra Nevada, Late Season" → **add: Earthquake Fault, Longest US Season, June Mountain**
- `steamboat` — tags: "Champagne Powder, Cowboy Style" → **add: Yampa Valley, Hot Springs, Rodeo Town**

### Beach venues with thin tags (190 total, top candidates):
- `borabora` — "UV 11, Crystal Water" → **add: Overwater Bungalows, Lagoon Snorkeling**
- `beach_gcm` — "World's Best Beach, Crystal Caribbean" → **add: Stingray City, Snorkeling Reef**
- `beach_grace` — "#1 Ranked Beach, Swim-Through Reef" → **add: Turquoise & Co Dive, Offshore Cays**
- `beach_eagle` — "Iconic Divi Tree, Year-Round Sun" → **add: Flat Calm Water, No Hawkers**
- `beach_stlucia` — "Piton Views, Volcano Backdrop" → **add: Coral Reef, Volcanic Black Sand**

---

## 5. VENUE ADDITIONS

**⛔ QUEUE FROZEN** per PM v197+ directive. No new venue objects added this run.

PM Decision (v198): "Venue addition queue stays FROZEN. DEFER indefinitely post-Reddit."

Once freeze lifts, priority queue (from prior sessions):
- S. hemisphere beach (in-season now): Cape Town (Clifton), Broome WA, Abel Tasman NZ
- Early-season ski: Stubai Glacier (Austria), Pitztal Glacier, Dachstein Glacier

---

## 6. PM-LEVEL OBSERVATION

**Nov 2 is 5 days before the VPS Nov 7 deadline.** The content deck is clean — zero integrity issues, 100% photo and AP coverage, seasonal alignment correct, GEAR_ITEMS intentionally off. The only content action worth agent time before Nov 7 is the tag-enrichment pass: 225 venues at 2 tags → 4 tags. This is in-place editing of existing objects — no new IDs, no venue-count change, no baseline impact, no auto-push guard risk.

**Proposed priority order for next content session:**
1. Tag enrichment — 35 ski venues first (highest traffic, early-season timing), then top 50 beach by rating
2. Post-Reddit: unfreeze venue queue, add S-hem beach for summer peak

**No blockers on content side for launch.** The Nov 7 VPS deadline is the only pre-launch gate that remains Jack-side.
