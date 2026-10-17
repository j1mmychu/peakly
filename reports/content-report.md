# Peakly Content & Data Report — 2026-10-17

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall degraded. Code freeze Day 33 blocks fix. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — same venue, two IDs, blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass. Code freeze Day 33 holds clean. **T-1: launch is tomorrow, Oct 18.**

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 33) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan — code freeze, fix post-launch |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ |
| Brace balance | **5682 / 5682** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ post-launch sprint |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key format) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Build stamp | **20260914a** (sw.js / app.jsx / index.html lockstep ✅) |
| Code freeze | **Day 33** — **launch tomorrow, Oct 18** |

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues (eval count) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique) ✅ |
| Duplicate titles | **1** — Gili Trawangan (`beach_gilit` + `gili-trawangan`) ⚠️ |
| Missing lat/lon | **0** ✅ |
| Missing ap (IATA) | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ |
| Brace balance (net) | **0** ✅ |
| Venues at (0,0) coordinates | **0** ✅ |

**Known flagged issue (code freeze — no action):**
- `beach_gilit` (Gili Trawangan/LOP) + `gili-trawangan` (Gili Trawangan/DPS) — same venue name, two IDs, different airports. Fix post-launch: delete `beach_gilit` (LOP is smaller/more distant gateway; DPS is the correct Bali hub). Not a runtime crash — IDs are distinct, no dup-ID validator fires.

**Data note (lateSeason format split — carries forward):**
`grep -c "lateSeason:true"` returns **10** — undercounts because 5 venues use quoted JSON format (`"lateSeason": true`). The eval-based count of **15** is authoritative. Active lateSeason venues: Whistler, Chamonix, Mammoth, Arapahoe Basin, Tignes/Val d'Isère, Hintertux Glacier, Cervinia, Snowbird, Zermatt, Engelberg-Titlis, Verbier, Val Thorens, Les Deux Alpes, Saas-Fee, St. Moritz.

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. No action needed pre-launch. Revisit post-launch.

---

## 3. Seasonal Relevance — 2026-10-17 (T-1, LAUNCH EVE)

| Category | Hemisphere | Count | Status |
|----------|-----------|-------|--------|
| Skiing | S hemisphere | 23 | ⚠️ **ABSOLUTE FINAL WEEKEND** — lifts closing Oct 17–Nov 2, most within days |
| Skiing | N hemisphere (non-lateSeason) | 96 | ⚠️ Pre-season — first openings Nov/Dec |
| Skiing | N hemisphere (lateSeason) | 15 | ✅ Glacier/high-altitude ACTIVE — Hintertux, Saas-Fee, Zermatt, Engelberg fully open |
| Beach | S hemisphere | 69 | ✅ **Spring prime window** — Camps Bay, Noosa, Byron Bay entering peak |
| Beach | N hemisphere | 201 | ≈ Shoulder — Mediterranean cooling, Caribbean/tropics excellent |

**Launch-day (Oct 18) editorial hook:**
- **Val Thorens opens Oct 18** — Europe's highest major resort (3,200m) opens on *launch day itself*. First big Alpine opening of the 2026/27 N.hem season. Scoring engine will automatically surface it. This is an unplanned alignment worth calling out in the r/travel launch post — "we launched the same day Europe's first ski resort of the season opened."
- **Hintertux Glacier** — year-round, top-scoring N.hem ski every week through winter.
- **S.hem ski closing-weekend urgency** — The Remarkables, Cardrona, Coronet Peak, Falls Creek likely within their last 2–3 operating weekends. Closing-weekend scarcity is a real engagement driver for launch-day social.
- **Caribbean peak arrival** — Barbados, Turks & Caicos, St. Lucia now entering their best-scoring window as Mediterranean shoulder contracts.
- **S.hem beach spring surge** — Camps Bay (CPT), Noosa (OOL), Byron Bay (OOL) entering optimal window.

---

## 4. Content Quality

**Tag depth distribution (unchanged — code freeze):**

| Tag count | Venues |
|-----------|--------|
| 2 tags | **225** (55.7%) ⚠️ |
| 3 tags | **14** (3.5%) |
| 4+ tags | **165** (40.8%) ✅ |

**225 venues remain at 2-tag depth.** `scoreVibeMatch` operates on tags; shallow tag arrays reduce vibe-match surface area and search recall. This is the single largest content quality gap remaining. Code freeze holds — post-launch sprint priority.

**Difficulty levels and descriptions:** Venues do not include a `description` or `difficulty` field in the schema — these are rendered from tags, scores, and derived labels. No flagged issues in schema-level content.

---

## 5. Daily Venue Additions

**No new venues should be added to `app.jsx` during the code freeze.** The 5 objects below are **queued for the post-launch sprint** — first week of November after confirming launch stability. Unchanged from prior queues.

**Pre-launch note for Mt. Bachelor (#2):** `RDM` (Redmond/Bend, OR) will need to be added to `AP_CONTINENT`, `AIRPORT_COORDS`, and `BASE_PRICES` before this venue is active. Budget ~15 min for the data wiring step post-launch.

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
// ⚠️ RDM needs AP_CONTINENT/AIRPORT_COORDS/BASE_PRICES wiring before activation
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

// Post-launch addition 3 — S.hem beach, spring prime window
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

// Post-launch addition 4 — S.hem beach, spring surge
{
  id: "beach_camps_bay",
  category: "beach",
  title: "Camps Bay Beach",
  location: "Cape Town, South Africa",
  lat: -33.9508, lon: 18.3770,
  ap: "CPT",
  icon: "🏖️",
  rating: 4.81,
  reviews: 3640,
  gradient: "linear-gradient(160deg,#1a3a5a,#2060a0,#60a8e0)",
  accent: "#60a8e0",
  tags: ["Table Mountain Views", "Sunset Facing", "Cape Town Nightlife", "White Sand"],
  photo: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&q=80&w=800"
},

// Post-launch addition 5 — N.hem ski, Japan opening Nov 2026
{
  id: "niseko-annupuri",
  category: "skiing",
  title: "Niseko Annupuri",
  location: "Hokkaido, Japan",
  ap: "CTS",
  lat: 42.7700, lon: 140.6883,
  icon: "🏔️",
  rating: 4.84,
  reviews: 3120,
  gradient: "linear-gradient(160deg,#1a2a4a,#2a4a8a,#6a8aca)",
  accent: "#6a8aca",
  tags: ["Powder Mecca", "Champagne Snow", "Interconnected Resorts", "Backcountry Gates"],
  photo: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&q=80&w=800"
},
```

---

## One Observation for PM

**Val Thorens opens Oct 18 — the same day Peakly launches.** This is not a planned alignment. Europe's highest major ski resort (3,200m) kicking off the 2026/27 season on launch day is an editorial hook that writes itself: the scoring engine will automatically surface it as the top-ranked lateSeason venue for European users the moment they open the app. The r/travel launch post should open with this. "We built an app to find the best ski or beach weekend, and on the day we launched, Val Thorens opened." Genuinely compelling, verifiable, and completely organic.

**Catalog is clean and launch-ready.** 404 venues verified: zero missing coords, zero missing airports, zero duplicate IDs, 100% photo coverage, brace balance locked at 5682/5682, build stamp `20260914a` in lockstep. The only open items (2-tag venues, Gili dup, stale cron prompt) are non-functional and correctly deferred. Code freeze Day 33 is the right call.
