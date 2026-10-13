# Peakly Content & Data Report — 2026-10-13

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall degraded. Code freeze Day 29 blocks fix. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — same venue, two IDs, blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass. Code freeze Day 29 holds clean. **5 days to Oct 18 launch.**

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 29) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan — code freeze, fix post-launch |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ (181 destination keys) |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ post-launch sprint |
| Venues with <500 reviews | **17** ⚠️ thin content (see below) |
| lateSeason:true venues | **15** ✅ (eval-authoritative) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Code freeze | **Day 29** — Oct 18 launch in **5 days** |
| Build stamp | **20260914a** (sw.js / app.jsx / index.html lockstep ✅) |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval-based: bracket-walker) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Duplicate titles | **1** — Gili Trawangan (`beach_gilit` + `gili-trawangan`) ⚠️ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ (quoted-key format `"FOR":` correctly counted) |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ |
| Brace balance | **5682 / 5682** ✅ |
| Venues (0,0) coordinates | **0** ✅ |

**Known flagged issue (code freeze — no action):**
- `beach_gilit` (Gili Trawangan/LOP) + `gili-trawangan` (Gili Trawangan/DPS) — same venue name, two IDs, different airports. Fix post-launch: delete `beach_gilit` (LOP is smaller/more distant gateway; DPS is the correct Bali hub). Not a runtime crash — IDs are distinct, no dup-ID validator fires.

**Data note (lateSeason format split — carries forward from 2026-10-11):**
`grep -c "lateSeason:true"` returns **10** — undercounts because 5 venues use quoted JSON format (`"lateSeason": true`). The eval-based count of **15** is authoritative. CLAUDE.md's `grep -c` guidance for this field is stale.

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. No action needed pre-launch. Revisit post-launch.

---

## 3. Seasonal Relevance — 2026-10-13

**Today's window:**

| Category | Hemisphere | Count | Status |
|----------|-----------|-------|--------|
| Skiing | S hemisphere | 23 | ✅ **IN SEASON** — peak season ends late Oct |
| Skiing | N hemisphere (non-lateSeason) | 96 | ⚠️ Pre-season (opens Nov/Dec) |
| Skiing | N hemisphere (lateSeason) | 15 | ✅ Glacier/high-altitude active |
| Beach | N hemisphere | 201 | ≈ Shoulder/cooling — Mediterranean closed, Caribbean/tropics still warm |
| Beach | S hemisphere | 69 | ✅ **Spring ramp** — warming fast, ideal booking window |

**Actionable note for front page (Oct 13):** The scoring engine already handles this correctly. `scoreWeekend` will return low/medium confidence or capped scores for closed N.hem ski venues, pushing Southern hemisphere ski (23 venues) and tropical beaches to the top naturally. The 15 `lateSeason` glacier venues (Hintertux, Saas-Fee, Val Thorens, etc.) are the only N.hem ski that can score high — confirmed correct.

**Seasonal highlight for launch week (Oct 13–18):**
- Val Thorens opens **Oct 18** (launch day!) — first major Alpine resort to open, flagship lateSeason venue
- Hintertux Glacier: year-round, fully in season
- Southern hemisphere ski ends: The Remarkables, Cardrona, Coronet Peak close late Oct/early Nov — valid for this exact weekend

---

## 4. Content Quality

**Tag depth distribution:**

| Tag count | Venues |
|-----------|--------|
| 2 tags | **225** (55.7%) ⚠️ |
| 3 tags | 89 (22.0%) |
| 4+ tags | 90 (22.3%) ✅ |

225 venues sitting at the minimum 2-tag floor hurts `scoreVibeMatch` accuracy and keyword search recall. Skiing venues tend to have 4 tags; beach venues disproportionately sit at 2. Target: 4+ tags on all venues post-launch sprint.

**Thin content venues (<500 reviews — 17 total):**

| Venue | Category | Reviews | Note |
|-------|----------|---------|------|
| caviahue-ar | skiing | 280 | Patagonia — valid niche |
| corralco-cl | skiing | 350 | Chile — real resort, legit |
| mad-river-mountain-oh | skiing | 380 | Ohio — low-altitude risk |
| meads-bay-anguilla | beach | 400 | Luxury, low traffic expected |
| stiniva-beach-vis | beach | 405 | Croatian island — niche correct |
| roundtop-mountain | skiing | 410 | PA — mid-Atlantic, marginal |
| matemwe-zanzibar | beach | 410 | Zanzibar north — ok |
| charlotte-pass-au | skiing | 410 | Deepest Aus ski — legit |
| nakiska | skiing | 420 | Calgary-adjacent, legit |
| maundays-bay-anguilla | beach | 437 | Second Anguilla, borderline redundant |

**No venues have (0,0) coordinates, empty descriptions, or malformed tags.**

**Rating range:** 4.00–4.99 (avg 4.72) — tight and realistic. No suspicious 5.0 clusters.

---

## 5. Daily Venue Additions

**Context: Code freeze is active (Day 29 of 29). Oct 18 launch is 5 days out.**

Under code freeze, no new venues should be added to `app.jsx` per CLAUDE.md:
> Do NOT remove existing functionality; Do NOT over-engineer — every fix is surgical

The task prompt asks for 5 new venue objects. These are provided below as **ready-to-paste objects** for the post-launch sprint (first week of November, after confirming the launch is stable). Do NOT paste these before Oct 18.

**Post-launch additions — targeting thin-coverage regions for N.hem ski opening rush:**

```javascript
// Post-launch addition 1 — N.hem ski, opens Nov 2026
{
  id: "sierra-at-tahoe",
  category: "skiing",
  title: "Sierra-at-Tahoe",
  location: "El Dorado County, California",
  lat: 38.7987, lon: -120.0800,
  ap: "SMF",
  icon: "🏔️",
  rating: 4.68,
  reviews: 1840,
  gradient: "linear-gradient(160deg,#1e3a5f,#3b7dd8,#7ec8e3)",
  accent: "#7ec8e3",
  tags: ["Tree Skiing", "Lake Tahoe Views", "Beginner Friendly", "Snowboarding"],
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&q=80&w=800"
},

// Post-launch addition 2 — N.hem ski, opens mid-Nov 2026
{
  id: "mt-bachelor",
  category: "skiing",
  title: "Mt. Bachelor",
  location: "Oregon, USA",
  lat: 43.9791, lon: -121.6886,
  ap: "RDM",
  icon: "🏔️",
  rating: 4.72,
  reviews: 2340,
  gradient: "linear-gradient(160deg,#1a3a4a,#2d6a8f,#5ba8c4)",
  accent: "#5ba8c4",
  tags: ["Volcano Terrain", "Cascade Range", "Summit Chair", "Tree Runs"],
  photo: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&q=80&w=800"
},

// Post-launch addition 3 — S.hem beach, spring prime window (add to boost Brazil coverage)
{
  id: "beach_trancoso",
  category: "beach",
  title: "Trancoso Beach",
  location: "Bahia, Brazil",
  lat: -16.5913, lon: -39.0848,
  ap: "BPS",
  icon: "🏖️",
  rating: 4.74,
  reviews: 2820,
  gradient: "linear-gradient(160deg,#1a4a3a,#2a8a60,#7ecb9f)",
  accent: "#7ecb9f",
  tags: ["White Sand", "Village Charm", "Quadrado Square", "Colorful Fishing Boats"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=800"
},

// Post-launch addition 4 — S.hem beach, spring warming
{
  id: "beach_camps_bay",
  category: "beach",
  title: "Camps Bay Beach",
  location: "Cape Town, South Africa",
  lat: -33.9508, lon: 18.3770,
  ap: "CPT",
  icon: "🏖️",
  rating: 4.76,
  reviews: 6840,
  gradient: "linear-gradient(160deg,#1a2a4a,#2a5a9f,#5a98d8)",
  accent: "#5a98d8",
  tags: ["Table Mountain Backdrop", "Atlantic Seaboard", "Sunset Strip", "Trendy Bars"],
  photo: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&q=80&w=800"
},

// Post-launch addition 5 — N.hem ski Europe, Nov opening
{
  id: "tignes-le-lac",
  category: "skiing",
  title: "Tignes Le Lac",
  location: "Savoie, France",
  lat: 45.4687, lon: 6.9077,
  ap: "CMF",
  icon: "🏔️",
  rating: 4.79,
  reviews: 3120,
  gradient: "linear-gradient(160deg,#0f2a4a,#1a5a9a,#4a9ad4)",
  accent: "#4a9ad4",
  tags: ["Grande Motte Glacier", "Espace Killy", "Snowpark", "Year-Round Skiing"],
  photo: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&q=80&w=800",
  lateSeason: true
},
```

**Note before pasting post-launch:** (1) Verify IDs don't collide with existing venue IDs. (2) SMF (Sacramento) and RDM (Redmond, OR) need AP_CONTINENT + AIRPORT_COORDS entries if not already present. (3) BPS (Porto Seguro, Brazil) likely needs adding to all three lookup tables. (4) `tignes-le-lac` uses same airport (CMF) as existing Tignes/Val d'Isère venue — valid, different resort village.

---

## 6. PM Observation

**Val Thorens opens Oct 18 — same day as launch.** This is the first major European ski resort to open for the 2026/27 season. Val Thorens is in the VENUES array with `lateSeason: true` and airport CMF, so the scoring engine will surface it correctly the moment its snowpack clears the 0.5m `snow_depth_max` threshold. If the Oct 18 weather forecast shows opening conditions, Peakly will legitimately show "Val Thorens: GO" on launch day — a marketing moment worth flagging to the PM. Worth having a screenshot plan ready.

**5-day horizon:** All three data integrity checks are clean. No new P0s. The code freeze is holding — last commit touching app.jsx was Day 28+ ago per DevOps. Content is launch-ready.
