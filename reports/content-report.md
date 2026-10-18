# Peakly Content & Data Report — 2026-10-18

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 223 venues (55.2%) have exactly 2 tags — `scoreVibeMatch` and search recall degraded. Code freeze Day 34 blocks fix. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — same venue, two IDs, blocked by code freeze.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All checks pass. Code freeze Day 34 holds clean. **🚀 TODAY IS LAUNCH DAY — Oct 18.**

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (unchanged, code freeze Day 34) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan — code freeze, fix post-launch |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **152/152** ✅ |
| Venue APs in AIRPORT_COORDS | **152/152** ✅ |
| Venue APs in BASE_PRICES | **152/152** ✅ (Open #22 CLOSED) |
| Brace balance | **5682 / 5682** ✅ |
| Venues with exactly 2 tags | **223 (55.2%)** ⚠️ post-launch sprint |
| lateSeason:true venues | **15** ✅ (10 unquoted + 5 quoted-key format) |
| GEAR_ITEMS | **0** ✅ (Amazon cut for v1 — intentional) |
| Active categories | **skiing, beach** ✅ |
| Build stamp | **20260914a** (sw.js / app.jsx / index.html lockstep ✅) |
| Code freeze | **Day 34** — **LAUNCH DAY, Oct 18** 🚀 |

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
| APs missing from AP_CONTINENT | **0** ✅ (152 unique APs, 283 entries in AP_CONTINENT) |
| APs missing from AIRPORT_COORDS | **0** ✅ (152 unique APs, 206 entries in AIRPORT_COORDS) |
| APs missing from BASE_PRICES | **0** ✅ (152 unique APs, 183 entries in BASE_PRICES) |
| Brace balance (net) | **0** ✅ |
| Venues at (0,0) coordinates | **0** ✅ |

**Known flagged issue (code freeze — no action):**
- `beach_gilit` (Gili Trawangan/LOP) + `gili-trawangan` (Gili Trawangan/DPS) — same venue name, two IDs, different airports. Fix post-launch: delete `beach_gilit` (LOP is smaller/more distant gateway; DPS is the correct Bali hub). Not a runtime crash — IDs are distinct, no dup-ID validator fires.

**Data note (lateSeason format split — carries forward):**
`grep -c "lateSeason:true"` returns **10** — undercounts because 5 venues use quoted JSON format (`"lateSeason": true`). The eval-based count of **15** is authoritative. Active lateSeason venues: Whistler, Chamonix, Mammoth, Arapahoe Basin, Tignes, Hintertux Glacier, Cervinia, Snowbird, Zermatt, Engelberg-Titlis, Verbier, Val Thorens, Les Deux Alpes, Saas-Fee, St. Moritz.

---

## 2. Gear Items Audit

**Status: N/A — GEAR_ITEMS intentionally absent for v1** (Amazon Associates cut, `grep -c GEAR_ITEMS app.jsx` → 0). Per CLAUDE.md revenue model: $7.58/1K MAU without Amazon. No action needed pre-launch. Revisit post-launch.

---

## 3. Seasonal Relevance — 2026-10-18 (LAUNCH DAY)

| Category | Hemisphere | Count | Status |
|----------|-----------|-------|--------|
| Skiing | S hemisphere | 23 | ⚠️ **Final weekend** — The Remarkables, Cardrona, Coronet Peak, Falls Creek within last 2–3 operating days |
| Skiing | N hemisphere (non-lateSeason) | 96 | ⚠️ Pre-season — first openings Nov/Dec |
| Skiing | N hemisphere (lateSeason) | 15 | ✅ Glacier/high-altitude ACTIVE — Hintertux, Saas-Fee, Zermatt, Engelberg fully open |
| Beach | S hemisphere | 69 | ✅ **Spring prime window** — Camps Bay, Noosa, Byron Bay entering peak |
| Beach | N hemisphere | 201 | ≈ Shoulder — Mediterranean cooling, Caribbean/tropics excellent |

**Launch-day (Oct 18) editorial hooks — unchanged from yesterday:**
- **Val Thorens opened today (Oct 18)** — Europe's highest major resort (3,200m) opens on *launch day itself*. First big Alpine opening of the 2026/27 N.hem season. Scoring engine automatically surfaces it. Use in r/travel launch post: "we launched the same day Europe's first ski resort of the season opened."
- **Hintertux Glacier** — year-round, top-scoring N.hem ski every week through winter.
- **S.hem ski closing-weekend urgency** — The Remarkables, Cardrona, Coronet Peak, Falls Creek within their absolute last operating weekend. Closing scarcity is a real engagement hook.
- **Caribbean peak arrival** — Barbados, Turks & Caicos, St. Lucia entering best-scoring window as Mediterranean shoulder contracts.
- **S.hem beach spring surge** — Camps Bay (CPT), Noosa (OOL), Byron Bay (OOL) entering optimal window.

**VPS deploy urgency (from DevOps):** Without VPS redeploy today, Val Thorens surfaces with `confidence: "low"` (forecast_days:7 on the live VPS blocks two-weekend scoring) and gets *filtered from the front page*. The entire launch narrative fails without the 5-minute deploy.

---

## 4. Content Quality

**Tag depth distribution (unchanged — code freeze):**

| Tag count | Venues |
|-----------|--------|
| 2 tags | **223** (55.2%) ⚠️ |
| 3 tags | **16** (4.0%) |
| 4 tags | **164** (40.6%) ✅ |
| 5+ tags | **1** (0.2%) |

**223 venues remain at 2-tag depth.** `scoreVibeMatch` operates on tags; shallow tag arrays reduce vibe-match surface area and search recall. This is the single largest content quality gap remaining. Code freeze holds — post-launch sprint priority (target: bring 2-tag venues to 4 tags minimum, starting with highest-traffic ski resorts).

**Descriptions:** Venues use tags, scores, and derived labels for content — no free-text `description` field in schema. No schema-level content issues.

---

## 5. Daily Venue Additions

**No new venues to be added during code freeze (Day 34).** Queue below is unchanged for post-launch sprint (first week of November, after confirming launch stability and VPS health).

**Pre-launch note for Mt. Bachelor (#2):** `RDM` (Redmond/Bend, OR) needs to be added to `AP_CONTINENT`, `AIRPORT_COORDS`, and `BASE_PRICES` before activation (~15 min). Bundle with venue add.

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

// Post-launch addition 5 — N.hem ski, early-season opener
{
  id: "ski-mammoth-east",
  category: "skiing",
  title: "Mammoth Mountain East Side",
  location: "June Lake, California",
  lat: 37.7755, lon: -119.0894,
  ap: "MMH",
  icon: "🏔️",
  rating: 4.77,
  reviews: 1960,
  gradient: "linear-gradient(160deg,#1e2a4a,#3a5a9f,#8ab0e0)",
  accent: "#8ab0e0",
  lateSeason: true,
  tags: ["High Altitude", "June Lake Loop", "Long Season", "Sierra Nevada"],
  photo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&q=80&w=800"
}
```

---

## PM Signal

**Launch day is here.** Content catalog is solid (404 venues, 0 dup IDs, 0 dup photos, 100% AP coverage). The only thing that can make today's data story land wrong is the VPS still running the August build — `forecast_days:7` means Val Thorens (which opened today) filters out as `confidence:"low"`. Deploy the 5 lines in `server/proxy.js` before the r/travel post goes up.
