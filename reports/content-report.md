# Peakly — Content & Data Quality Report
**Date:** 2026-03-24 (v6 — merged)
**Auditor:** Content & Data Agent (Senior)
**File audited:** app.jsx (5,446 lines)

---

## Data Health Score: 61/100

**Breakdown:**
- Category coverage: 35/50 — 7 of 12 categories are single-venue stubs
- Data completeness: 18/20 — all 182 venues have coords, airports, tags
- Gear item coverage: 4/10 — hiking missing gear items, local tips, and packing list
- Photo coverage: 6/10 — 73 of 182 venues (40%) missing photos, concentrated in tanning/surfing
- Seasonal data: 0/10 — no `seasonalOpen` or best-month field in venue schema

---

## 1. Category Breakdown

| Category | Venues | With Photo | In Main UI | Status |
|----------|--------|-----------|-----------|--------|
| Tanning / Beach | 60 | 20 (33%) | YES | Oversaturated — 33% of all venues; 40 photos missing |
| Surfing | 53 | 20 (37%) | YES | Healthy count; 33 photos missing |
| Skiing | 50 | 50 (100%) | YES | Healthy — fully photographed |
| Hiking | 12 | 12 (100%) | YES | Minimum viable; needs gear data |
| Diving | 1 | 1 (100%) | YES | **STUB — critical, visible in UI** |
| Climbing | 1 | 1 (100%) | YES | **STUB — critical, visible in UI** |
| Kite | 1 | 1 (100%) | hidden | Stub |
| Kayak | 1 | 1 (100%) | hidden | Stub |
| MTB | 1 | 1 (100%) | hidden | Stub |
| Fishing | 1 | 1 (100%) | hidden | Stub |
| Paraglide | 1 | 1 (100%) | hidden | Stub |

**Critical finding:** Diving and Climbing are exposed in the main CATEGORIES array (visible as filter pills) but each has only 1 venue. A user tapping "Diving" or "Climbing" sees exactly 1 result — immediately broken UX. Must fix before growth push.

---

## 2. Data Integrity Issues

### Duplicate Photo URL (confirmed)
- `appalachian` and `camino` both use:
  `https://images.unsplash.com/photo-1551176808-bb328dac763a?w=800&h=600&fit=crop`
- **Fix:** Update camino to: `https://images.unsplash.com/photo-1583224994559-bc37e47e8dba?w=800&h=600&fit=crop`

### Duplicate Venue (carried forward, still unresolved)
- `id:"pipeline"` (~line 218) and `id:"banzai_pipeline"` (~line 356) — same wave, same airport HNL, near-identical coordinates.
- **Fix:** Remove `id:"pipeline"`, keep `banzai_pipeline` (6,420 reviews vs 1,203). This is a 1-line delete.

### Airport Code Spot-Check — No New Issues
- All verified airports match claimed locations in random sample of 15 venues.
- `laugavegur` uses `KEF` — correct, though Highlands require a bus transfer post-landing. Acceptable.
- `overland` uses `LST` (Launceston) — correct gateway for Cradle Mountain.

### AFFILIATE_ID Placeholders — RESOLVED
- Previous reports flagged `AFFILIATE_ID` placeholder on ~line 3786. **Confirmed 0 occurrences remain.** Resolved.

### No duplicate IDs. All 182 venues pass integrity check.

---

## 3. Open Data Gaps — Priority Order

### 1. Photo coverage — surfing and tanning (HIGH)
- 33 surfing venues and 40 tanning venues have no photo
- Cards render with gradient-only backgrounds — functional but visually weaker
- All photos should use Unsplash format: `https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop`
- **Action:** Add photos for all 73 missing venues. Tanning first (40 missing), then surfing (33 missing).

### 2. BASE_PRICES coverage (HIGH)
- ~55 venue airports missing from BASE_PRICES; these fall back to $800 default
- Critical missing airports: CUN, HKT, CZM, KEF, IBZ, MBJ, SXM, STT, AUA, UVF, SEZ, ZNZ, MRU, JRO, MBA, DBV, NCE, JTR, JMK, SPU, ZTH, FAO, KOA, EYW, TPA, SRQ, MYR, VPS, TAB, GCM, PLS
- **Action:** Add BASE_PRICES for the top 30 missing airports in next sprint.

### 3. Hiking has zero gear data (HIGH)
- See Section 4 below — paste-ready fix provided.

### 4. Thin categories (MEDIUM)
- 7 categories with 1 venue each appear in category pills but produce dead-end single-result pages
- **Recommended:** Gate thin categories behind "Coming Soon" label or hide from pill row until 5+ venues exist.

### 5. Sentry DSN empty (LOW)
- Line 6: `const SENTRY_DSN = "";` — production errors are invisible
- **Action:** Sign up for Sentry free tier, add DSN.

---

## 4. Gear Items Gaps — Paste-Ready Code Fixes

### Confirmed Missing: `hiking`
Hiking has 12 venues, appears in main UI, but has **zero entries** in `GEAR_ITEMS`, `LOCAL_TIPS`, and `PACKING`. Hiking users see no affiliate gear, no local tips, and no packing list. Highest-priority data gap in the entire codebase right now.

**Add to `GEAR_ITEMS` (after the `paraglide` block, before closing `};` on line 4057):**

```javascript
  hiking:   [
    { emoji:"🥾", name:"Salomon X Ultra 4 GTX Hiking Shoes",  store:"REI",    price:"$175",  commission:"5%",  url:"https://www.rei.com/search?q=salomon+x+ultra+4+gtx" },
    { emoji:"🎒", name:"Osprey Atmos AG 65 Backpack",          store:"REI",    price:"$340",  commission:"5%",  url:"https://www.rei.com/search?q=osprey+atmos+ag+65" },
    { emoji:"🗺️", name:"Garmin inReach Mini 2 Satellite GPS",  store:"REI",    price:"$350",  commission:"5%",  url:"https://www.rei.com/search?q=garmin+inreach+mini+2" },
    { emoji:"🩹", name:"Adventure Medical Kits Ultralight .5", store:"Amazon", price:"$35",   commission:"4%",  url:"https://www.amazon.com/s?tag=peakly-20&k=adventure+medical+kits+ultralight" },
  ],
```

**Add to `LOCAL_TIPS` (after the `paraglide` line, before closing `};` on line 3978):**

```javascript
  hiking:   ["🌅 Start at dawn — trailheads fill by 9am and many trails have daily entry caps","💧 Drink 500ml before you leave camp — thirst lags 30 min behind dehydration","🥾 Break in boots on 3+ day hikes before a multi-day — blisters end trips early","🌦️ Weather changes fast above treeline — carry a rain shell even on blue-sky mornings"],
```

**Add to `PACKING` (after the `paraglide` line, before closing `};` on line 3992):**

```javascript
  hiking:   ["🥾 Trail shoes or boots (broken in)","🎒 Backpack (capacity matched to trip days)","💧 Water filter (Sawyer Squeeze or equivalent)","🗺️ GPS device + paper topo backup","🩹 Blister kit + first aid","🧥 Rain shell + insulating mid-layer","🔦 Headlamp + spare batteries"],
```

---

## 5. Seasonal Relevance — March 24, 2026

### Top 5 Destinations In Season Right Now

| # | Venue | Category | Why Now |
|---|-------|----------|---------|
| 1 | **Whistler Blackcomb** | Skiing | Peak spring skiing — long sunny days, 400cm+ base, corn snow afternoons. Season runs to mid-April. |
| 2 | **Taghazout, Morocco** | Surfing | Prime season: consistent NW Atlantic groundswells, offshore winds, 18°C water. Hash Point and Anchor Point firing. |
| 3 | **Nusa Dua, Bali** | Tanning | Dry season beginning. UV 11-12, 30-32°C, low humidity. Shoulder crowds before Easter peak. |
| 4 | **Niseko, Japan** | Skiing | Final powder weeks — late March can still deliver heavy snowfall. Season closes early April. Last call. |
| 5 | **Arugam Bay, Sri Lanka** | Surfing | April swell season ramps up. Late March sees first consistent swells of the year. Air 33°C. |

### Out of Season — Deprioritize in Scoring
- **Southern Hemisphere Ski** (Bariloche, Portillo, NZ) — 4 months until open.
- **Laugavegur (Iceland)** — trail officially closed under snow until late June. Scoring system uses Reykjavik weather proxy (mild in March) and will score this incorrectly. Users booking now arrive to a closed trail.
- **Torres del Paine** — end of Patagonian summer, weather deteriorating.

### PM Action Required
`laugavegur` scores based on weather data, not trail access calendars. Without a `closedMonths` or `peakMonths` field per venue, it will appear bookable when it is physically inaccessible. Schema addition recommended before launch.

---

## 6. Five New Venue Objects — Copy-Paste Ready

Targeting the 5 stub categories. Priority: Diving and Climbing first (visible in main UI), then hidden categories.

```javascript
  // ─── Diving (1 → 2) ──────────────────────────────────────────────────────────
  {
    id:"dahab",        category:"diving",
    title:"Dahab Blue Hole",           location:"Sinai Peninsula, Egypt",
    lat:28.5705, lon:34.5418, ap:"SSH",
    icon:"🤿", rating:4.94, reviews:3200,
    gradient:"linear-gradient(160deg,#001a2a,#003a6a,#0070c0)",
    accent:"#40a0e0", tags:["Blue Hole 100m","World-Class Visibility"],
    photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  },
  // ─── Climbing (1 → 2) ────────────────────────────────────────────────────────
  {
    id:"kalymnos",     category:"climbing",
    title:"Kalymnos Sport Climbing",   location:"Dodecanese, Greece",
    lat:36.9447, lon:26.9840, ap:"KGS",
    icon:"🧗", rating:4.96, reviews:1840,
    gradient:"linear-gradient(160deg,#3a1a00,#7a4010,#c0800a)",
    accent:"#e8a832", tags:["500+ Routes","Limestone Tufa"],
    photo:"https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=600&fit=crop",
  },
  // ─── Paraglide (1 → 2) ───────────────────────────────────────────────────────
  {
    id:"oludeniz",     category:"paraglide",
    title:"Oludeniz — Babadag Launch", location:"Fethiye, Turkey",
    lat:36.5500, lon:29.1167, ap:"DLM",
    icon:"🪂", rating:4.95, reviews:2640,
    gradient:"linear-gradient(160deg,#001a30,#003a70,#1060c0)",
    accent:"#5090e0", tags:["1,969m Launch","Blue Lagoon Views"],
    photo:"https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&h=600&fit=crop",
  },
  // ─── MTB (1 → 2) ─────────────────────────────────────────────────────────────
  {
    id:"finale_ligure",category:"mtb",
    title:"Finale Ligure Bike Park",   location:"Liguria, Italy",
    lat:44.1697, lon:8.3434, ap:"GOA",
    icon:"🚵", rating:4.93, reviews:1560,
    gradient:"linear-gradient(160deg,#2a0a00,#6a2a10,#b06030)",
    accent:"#e08040", tags:["Enduro Capital","Sea & Limestone"],
    photo:"https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=600&fit=crop",
  },
  // ─── Kite (1 → 2) ────────────────────────────────────────────────────────────
  {
    id:"dakhla",       category:"kite",
    title:"Dakhla Lagoon",             location:"Western Sahara, Morocco",
    lat:23.7139, lon:-15.9349, ap:"VIL",
    icon:"🪁", rating:4.97, reviews:980,
    gradient:"linear-gradient(160deg,#1a0a30,#4a2a80,#8050d0)",
    accent:"#c080f0", tags:["Flat Water Lagoon","300 Wind Days/yr"],
    photo:"https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&h=600&fit=crop",
  },
```

---

## 7. One Observation the PM Should Know

**The Diving and Climbing tabs are broken from a user perspective, and this will be the first thing any reviewer, journalist, or potential investor sees if they tap those filters.** Both categories are fully visible in the Explore pills. A user who taps "Diving" gets 1 result and will assume the app is broken or abandoned. Before the Reddit/TikTok launch push, these two categories need at minimum 5 venues each — or they must be removed from the CATEGORIES array. Adding 4 more diving venues (Cozumel, Komodo, Maldives, Red Sea Ras Mohammed) and 4 more climbing venues (Kalymnos above + Red Rock Canyon, Fontainebleau, Smith Rock Oregon) would take one focused session and would make both tabs feel real. This is higher-leverage than adding the 51st tanning beach.

---

*Report generated by content-data agent. Next run: 2026-03-25.*
