# Peakly Content & Data Report — 2026-10-16

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 225 venues (55.7%) have exactly 2 tags — `scoreVibeMatch` and search recall degraded. Code freeze Day 32 blocks fix. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — same venue, two IDs, blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass. Code freeze Day 32 holds clean. **2 days to Oct 18 launch.**

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 32) |
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
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key format) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Build stamp | **20260914a** (sw.js / app.jsx / index.html lockstep ✅) |
| Code freeze | **Day 32** — Oct 18 launch in **2 days** |

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
`grep -c "lateSeason:true"` returns **10** — undercounts because 5 venues use quoted JSON format (`"lateSeason": true`). The eval-based count of **15** is authoritative.

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. No action needed pre-launch. Revisit post-launch.

---

## 3. Seasonal Relevance — 2026-10-16

**Today's window (T-2 days to launch):**

| Category | Hemisphere | Count | Status |
|----------|-----------|-------|--------|
| Skiing | S hemisphere | 23 | ⚠️ **FINAL WEEKEND** — most lifts close Oct 17–Nov 2 |
| Skiing | N hemisphere (non-lateSeason) | 96 | ⚠️ Pre-season (opens Nov/Dec) |
| Skiing | N hemisphere (lateSeason) | 15 | ✅ Glacier/high-altitude active — Hintertux, Cervinia, Saas-Fee, Val Thorens (opens tomorrow) |
| Beach | N hemisphere | 201 | ≈ Shoulder/cooling — Mediterranean winding down, Caribbean/tropics warm |
| Beach | S hemisphere | 69 | ✅ **Spring surge** — best-condition opening window now |

**Launch-weekend seasonal highlights (Oct 17–18):**
- **Val Thorens opens Oct 18** (launch day) — Europe's highest resort (3,200m), first major Alpine opening of the 2026/27 season. Top N.hem ski result for European users on day 1. No action needed — scoring surfaces it automatically.
- **Hintertux Glacier** — year-round, fully in season, top-scoring N.hem ski every weekend this week.
- **S.hem ski final call** — The Remarkables, Cardrona, Coronet Peak still scoring well this weekend; lifts closing Oct 17–Nov 2. Closing-weekend urgency is a real share hook for the launch post.
- **Caribbean peak** — Barbados, Turks & Caicos, St. Lucia pricing/scoring well as Mediterranean winds down.
- **S.hem beach spring surge** — Camps Bay, Noosa, Byron Bay entering their best-scoring window.

---

## 4. Content Quality

**Tag depth distribution (unchanged — code freeze):**

| Tag count | Venues |
|-----------|--------|
| 2 tags | **225** (55.7%) ⚠️ |
| 3 tags | **14** (3.5%) |
| 4+ tags | **165** (40.8%) ✅ |

225 venues at the 2-tag floor degrades `scoreVibeMatch` accuracy and keyword search recall. Beach venues are disproportionately undertailed. **Post-launch sprint target: lift all 225 to 4+ tags.** Blocked by code freeze until Oct 19+.

**Photo coverage:** 404/404 venues have unique photos ✅. No broken URLs detected.

**Rating range:** 4.00–4.99 (avg ~4.72) — tight and realistic. No suspicious 5.0 clusters.

---

## 5. Daily Venue Additions

**Context: Code freeze is active (Day 32 of 32). Oct 18 launch is 2 days out.**

No new venues should be added to `app.jsx` during the code freeze. The 5 objects below are **queued for the post-launch sprint** (target: first week of November, after confirming launch stability). These were first queued yesterday and are unchanged — no action needed today.

These target N.hem ski season opening (Nov 2026) and S.hem beach spring warmup — maximum seasonal relevance for the first month post-launch.

**Pre-launch note for Mt. Bachelor (#2 below):** `RDM` (Redmond/Bend, OR) will need to be added to `AP_CONTINENT`, `AIRPORT_COORDS`, and `BASE_PRICES` before this venue is active. Budget ~15 min for the data wiring step.

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

**T-2 days and the catalog is clean.** All 404 venues verified: zero missing coords, zero missing airports, zero duplicate IDs, 100% photo coverage, build stamp locked at `20260914a`. The only runtime risk carrying into launch is the Gili Trawangan dup (non-crashing, post-launch fix). The two known quality gaps (2-tag venues, stale cron prompt) are both non-functional and both deferred correctly. Code freeze Day 32 is the right call — the catalog does not need a last-minute touch. The post-launch sprint queue (5 venues above, starting Nov) is ready to run the moment the freeze lifts.
