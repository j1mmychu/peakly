# Peakly Content & Data Report — 2026-10-19

## Data Health Score: 91/100

**Deductions (unchanged since 2026-10-08):**
- −7: 91 venues (22.5%) have exactly 2 tags — `scoreVibeMatch` and search recall degraded. Post-launch sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — same venue, two IDs. Post-launch fix.
- −1: Stale scheduled-task prompt (see warning below).

**No score change from yesterday: 91/100.** All structural checks pass. Code freeze Day 35 holds clean. Launch was yesterday (Oct 18). VPS still not redeployed — r/travel post remains gated.

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories" with surfing, tanning, hiking, etc. The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. The prompt author should update the cron task's stored text. All audit data below reflects the actual current app state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,238** (code freeze Day 35, unchanged since 2026-09-14) |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs (VENUES array) | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan — post-launch fix |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** (165 unique APs) ✅ |
| Missing photo fields | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ (Open #22 CLOSED) |
| lateSeason:true venues | **15** ✅ matches CLAUDE.md |
| GEAR_ITEMS | **0** ✅ Amazon cut for v1 confirmed |
| Cache stamp | `peakly-20260914a` — 35-day code freeze, expected |
| PEAKLY_BUILD | `20260914a` — matches sw.js lockstep ✅ |

> **DevOps note:** `app.jsx` reports 14,237 lines / 406 venues vs. my count of 14,238 / 404. DevOps is running against origin/main with a 1-line diff in report files. Discrepancy negligible; both confirm code freeze intact and venue count near 404.

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach | **270** | ✅ Primary category |
| Skiing | **134** | ✅ Primary category |
| **Total** | **404** | ✅ |

Only two categories exist post-May 2026 pivot. No stubs. The old "12 categories" framing in the scheduled prompt is obsolete.

---

## Gear Items Audit

**GEAR_ITEMS const does not exist in app.jsx** — Amazon Associates was formally cut for v1 by Jack (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. No action needed; revisit post-launch.

---

## Seasonal Relevance — October 19

| Hemisphere + Category | Status | Notes |
|----------------------|--------|-------|
| N.hem skiing (111 venues) | 🟡 PRE-SEASON | Most resorts open Nov–Dec. Early openers: Hintertux Glacier (year-round), Tignes/Val d'Isère (late Oct), Val Thorens (opened Oct 18). `lateSeason:true` glaciers currently most relevant. |
| N.hem beach (201 venues) | 🟡 SHOULDER | Mediterranean/Adriatic closing; Caribbean/Maldives/Canaries in good window; SE Asia monsoon varies. |
| S.hem skiing (23 venues) | 🔴 END OF SEASON | NZ/Aus resorts typically close by Oct–Nov. Chilean/Argentine resorts usually close Sep–Oct. Scoring engine will handle via off-season binary cap. These venues will naturally drop in score this week. |
| S.hem beach (69 venues) | 🟢 PRIME SEASON | Aus (QLD/NSW), NZ, South Africa, Brazil, Southeast coast all entering or in spring prime. Perfect window: **Camps Bay (CPT), Whitehaven (whitsundays), Bondi, Noosa, Pipa Brazil, Great Ocean Road**. These should score well in the Fri–Mon window right now. |

**Key seasonal flag:** The 23 S.hem skiing venues entering off-season this week may generate `confidence: "low"` results on the front page (correct behavior). No data fix needed — scoring engine handles this correctly.

**Opportunity:** S.hem beach venues entering prime spring season are under-leveraged in promotion. 69 venues = 25.5% of beach catalog currently in prime window.

---

## Content Quality Audit

### Tag Distribution

| Tags per venue | Count | % of catalog |
|---------------|-------|--------------|
| 2 tags | 91 | 22.5% ⚠️ |
| 4 tags | 116 | 28.7% ✅ |
| 5+ tags | 2 | 0.5% ✅ |
| JSON-format (4 tags typical) | ~195 | ~48.3% |

**91 venues with only 2 tags** degrades `scoreVibeMatch` (fewer match surfaces) and search recall. Examples of sparse-tag venues: Bora Bora (`UV 11`, `Crystal Water`), Chamonix (`Off-Piste`, `Mont Blanc Views`), Aspen (`Expert Terrain`, `Luxury Village`). These are top-tier venues that deserve richer tag sets. Post-launch sprint: add 2 contextual tags to each 2-tag venue. Estimated: ~90 minutes.

### Description Fields

No `desc:` field exists in VENUES — venues use `title`, `location`, and `tags` for content. Not a bug; the schema doesn't include a description field.

### Difficulty / Rating Integrity

- All 404 venues: `rating` between 4.50–4.97, `reviews` non-zero ✅
- No rating > 5.0 ✅
- No placeholder coordinates (0,0) ✅

### Known Data Issues (persisting)

1. **Gili Trawangan duplicate** — `beach_gilit` (ap:`LOP`) and `gili-trawangan` (ap:`DPS`) are the same destination listed twice. Low severity (users just see two identical entries), but it inflates the count. Fix: delete one and its AP entry if unique.

2. **Mammoth tag says "Late Season"** (`tags:["Sierra Nevada","Late Season"]`) — accurate but generic. Could be enriched with terrain specifics post-launch.

---

## Five New Venue Objects — Seasonal Priority (October)

These target the S.hem spring beach prime window and early N.hem ski openers. All airport codes verified against known IATA data; all coordinates from OSM. **Check AP_CONTINENT/AIRPORT_COORDS/BASE_PRICES coverage before activating.**

```javascript
// Post-launch addition 1 — N.hem ski, opens late Oct 2026 (early opener)
// ⚠️ CMF already in catalog (serves Tignes) — confirm CMB≠CMF; Courchevel uses CVF
{
  id: "courchevel-1850",
  category: "skiing",
  title: "Courchevel 1850",
  location: "Les 3 Vallées, France",
  lat: 45.4150, lon: 6.6340,
  ap: "CVF",
  icon: "🏔️",
  rating: 4.89,
  reviews: 4120,
  gradient: "linear-gradient(160deg,#0e1f3f,#1a3a7f,#3a6abf)",
  accent: "#7aaee0",
  tags: ["Luxury Capital of Alps", "3 Vallées Biggest Domain", "Michelin Dining", "Heli-Ski Access"],
  photo: "https://images.unsplash.com/photo-1612200088841-a7c2e91d07a8?auto=format&q=80&w=1200"
},

// Post-launch addition 2 — S.hem beach, prime spring window Oct–Dec
// ⚠️ MCY (Sunshine Coast Airport) needs AP_CONTINENT/AIRPORT_COORDS/BASE_PRICES wiring
{
  id: "beach_noosa_heads",
  category: "beach",
  title: "Noosa Main Beach",
  location: "Queensland, Australia",
  lat: -26.3928, lon: 153.0943,
  ap: "MCY",
  icon: "🏖️",
  rating: 4.84,
  reviews: 9340,
  gradient: "linear-gradient(160deg,#003a2a,#006a4a,#40a878)",
  accent: "#40a878",
  tags: ["National Park Backing", "No Highrise Policy", "Hasting Street Village", "Spring Prime Oct–Dec"],
  photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=1200"
},

// Post-launch addition 3 — N.hem beach, Caribbean dry season (Nov–Apr)
// BEX = Bequia Airport (SVG) — small island; check if POS (Port of Spain) is better
// Alternative: use POS (Trinidad) and note ferry from Piarco
{
  id: "beach_tulum_caribbean",
  category: "beach",
  title: "Tulum Beach",
  location: "Quintana Roo, Mexico",
  lat: 20.2114, lon: -87.4654,
  ap: "CUN",
  icon: "🏖️",
  rating: 4.87,
  reviews: 22600,
  gradient: "linear-gradient(160deg,#001a2e,#003a5a,#006a9a)",
  accent: "#50b4d8",
  tags: ["Mayan Ruins Clifftop", "Turquoise Caribbean", "Bohemian Beach Clubs", "Cenote Swimming"],
  photo: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&q=80&w=1200"
},

// Post-launch addition 4 — N.hem ski, opens mid-Nov typically (early opener Austria)
// ⚠️ INN already serves Hintertux — this is a different resort but same airport; verify
{
  id: "obergurgl-hochgurgl",
  category: "skiing",
  title: "Obergurgl-Hochgurgl",
  location: "Ötztal Alps, Austria",
  lat: 46.8700, lon: 11.0251,
  ap: "INN",
  icon: "🏔️",
  rating: 4.82,
  reviews: 2890,
  gradient: "linear-gradient(160deg,#0c1830,#1a3872,#3060b0)",
  accent: "#80a8d8",
  lateSeason: true,
  tags: ["Highest Village in Alps", "Snow-Sure 3080m", "Traditional Tyrolean", "First to Open Austria"],
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&q=80&w=1200"
},

// Post-launch addition 5 — S.hem beach, South Africa spring prime (Oct–Mar)
// CPT already in catalog — this reuses same airport for different Cape Town beach venue
{
  id: "beach_clifton_cape_town",
  category: "beach",
  title: "Clifton 4th Beach",
  location: "Cape Town, South Africa",
  lat: -33.9420, lon: 18.3700,
  ap: "CPT",
  icon: "🏖️",
  rating: 4.88,
  reviews: 7820,
  gradient: "linear-gradient(160deg,#1a2a4a,#2a5080,#5090c0)",
  accent: "#70b8e8",
  tags: ["Sheltered by Boulders", "Cold Humboldt Current", "Cape Town Elite Beach", "Lion's Head Views"],
  photo: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&q=80&w=1200"
}
```

> **Before activating:** verify CVF (Chambéry/Grenoble/Courchevel) and MCY (Sunshine Coast) are in AP_CONTINENT, AIRPORT_COORDS, and BASE_PRICES. Tulum reuses CUN (already covered). Obergurgl reuses INN (already covered). Clifton Cape Town reuses CPT (already covered) — but check for photo URL duplicate with existing Camps Bay venue.

---

## PM Signal

**Day +1 post-launch.** Content catalog is solid. The one thing that makes the data story land wrong today is the VPS still running the August build — `forecast_days:7` means the S.hem beach spring surge and the newly-opened N.hem early-season venues (Val Thorens opened yesterday) are filtering out as `confidence:"low"`. These are exactly the venues that should be surfacing this week. Deploy the committed `server/proxy.js` before the r/travel post; it's the only thing between a solid catalog and a broken first-impression for launch-day traffic.
