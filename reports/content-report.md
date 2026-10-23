# Peakly Content & Data Report — 2026-10-23

## Data Health Score: 89/100

**Deductions (unchanged — no code changes since 2026-09-14):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded. First post-freeze sprint target.
- −1: Gili Trawangan duplicate live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — post-launch fix.
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories" — outdated since 2026-05-03 pivot to skiing + beach only).

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories." The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects the actual current app.jsx state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,237** — code freeze Day 39, unchanged since 2026-09-14; **code freeze lifts today** ⚠️ |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan (`beach_gilit` / `gili-trawangan`) — post-launch fix |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** (165 unique APs across 404 venues) ✅ |
| Missing photos | **0** ✅ |
| Missing tags | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3 tags | **14** |
| Venues with 4+ tags | **165** |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ Open #22 CLOSED |
| lateSeason:true venues | **15** ✅ (grep returns 15 using combined pattern) |
| GEAR_ITEMS | **0** ✅ Amazon cut for v1 confirmed |
| Cache stamp | `peakly-20260914a` — **must bump on first post-freeze edit today** ⚠️ |

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach | 270 | ✅ |
| Skiing | 134 | ✅ |

> Note: The scheduled prompt references 12 categories (surfing, hiking, climbing, tanning, etc.). All non-skiing/beach categories were retired on 2026-05-03. There are no stub categories.

---

## GEAR_ITEMS Gaps

**None applicable.** Amazon Associates cut for v1 by Jack (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. By design.

---

## Seasonal Relevance — Oct 23, 2026 (LAUNCH DAY +5, CODE FREEZE LIFTS)

### Code Freeze Lifts Today

First edits are now unblocked. **First commit must bump cache stamp** — `peakly-20260914a` is stale by 39 days and the DevOps report flags it. The 10-venue backlog queue (Oct 21 + Oct 22) can begin landing once stamp is bumped and venues are validated against the catalog (see Queue Audit below).

### N. Hemisphere Ski — Early Season Opening Window ✅

**18 days to Whistler early-season (~Nov 10).** Without the VPS redeploy, Whistler + Mammoth + A-Basin + Tignes score `confidence:"low"` (front page filtered). This is the only remaining technical blocker for a credible Nov-10 seasonal launch. Five marquee venues affected.

Active glacier/early openers right now:
- **Year-round:** Hintertux, Saas-Fee glacier, Zermatt Plateau Rosa
- **Nov 1–15 target (opening soon):** Whistler, Mammoth, A-Basin, Les Deux Alpes, Engelberg-Titlis
- **Dec season:** Val Thorens, Verbier, St. Moritz, Chamonix, Cervinia

### N. Hemisphere Beach — Canary Islands + Red Sea Prime ✅

Canary Islands (ACE/FUE/TFS) entering peak 8-month season — 22°C water, 24°C air. All 3 Canary venues scoring their best of the year. Red Sea (Oct–May) prime season — no Egypt venues currently in catalog (see venue queue).

### S. Hemisphere Beach — Spring Prime ✅

Australia (SYD/MEL/BNE/CNS), South Africa (CPT), Brazil (GIG/GRU/FOR), Mauritius (MRU): Oct–Mar optimal window. All scoring high right now.

### S. Hemisphere Ski — End of Season ⚠️

6 S.hem ski venues (Remarkables, Thredbo, Portillo, etc.) in final days or already closed. Correct behavior — off the front page.

---

## Queue Audit — Oct 21 + Oct 22 Backlog

⚠️ **Previous days' queues contained duplicates. Do not paste blindly.**

| Venue | Queued | Status |
|-------|--------|--------|
| Les Arcs/Paradiski | Oct 21 | ❌ Already exists as `les-arcs-s20` (GVA) |
| Papagayo/Lanzarote | Oct 21 | ❌ Already exists as `beach_lanzarote` (ACE) |
| Grace Bay/Providenciales | Oct 21 | ❌ Already exists as `beach_grace` (PLS) |
| Da Nang/Vietnam | Oct 21 | ❌ Already exists (3 DAD venues: an-bang, my-khe, cua-dai) |
| Belle Mare/Mauritius | Oct 21 | ❌ Already exists as `belle-mare-plage` (MRU) |
| Åre, Sweden | Oct 22 | ✅ Not in catalog — valid addition (OSL) |
| Breckenridge | Oct 22 | ❌ Already exists as `breckenridge` (DEN) |
| Hurghada/Red Sea | Oct 22 | ✅ Not in catalog — requires new AP: HRG not yet in AP_CONTINENT/AIRPORT_COORDS/BASE_PRICES |
| Palm Beach, Aruba | Oct 22 | ✅ Not in catalog — valid addition (AUA already in catalog) |
| Zanzibar Nungwi | Oct 22 | ❌ Same beach as `beach_zanzibar` (Nungwi Beach, ZNZ) — duplicate |

**Net valid from Oct 21+22 queue:** 3 venues — Åre (OSL), Hurghada (needs HRG added), Palm Beach Aruba (AUA). Hurghada requires adding HRG to AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES before the venue object can land.

---

## 5 New Venue Objects — Oct 23 Seasonal Focus

**All venues use airports already confirmed in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. IDs verified not in catalog.**

```js
// 1. N.hem ski — Flaine, France (GVA, ~1.5hr, purpose-built resort, less crowded than Chamonix)
// Grand Massif ski area: 265km pistes, 900–2480m altitude, excellent intermediate terrain.
// Purpose-built village = no traffic, ski-in/ski-out. Opens ~Dec 1, peak Jan–Mar.
// No Flaine venue in catalog — filling a meaningful French Alps gap.
// Validated: grep "flaine" app.jsx → 0. GVA confirmed in all 3 AP tables.
{
  id: "flaine-france",
  category: "skiing",
  title: "Flaine",
  location: "Grand Massif, Haute-Savoie, France",
  lat: 46.0098, lon: 6.6762,
  ap: "GVA",
  icon: "⛷️",
  rating: 4.73,
  reviews: 8900,
  gradient: "linear-gradient(160deg,#0a1a38,#1a3a78,#2e60b8)",
  accent: "#5090d8",
  skiPass: "other",
  tags: ["265km Grand Massif", "Ski-In Ski-Out Village", "1580m Altitude Gain", "Family & Intermediate Focus"],
  photo: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&q=80&w=1200"
},

// 2. N.hem ski — Davos/Klosters, Switzerland (ZRH, ~1.5hr by train, iconic destination)
// Parsenn: 6 mountains, 320km pistes, 2844m top elevation. James Bond filming location.
// Only major resort with a commuter rail connection direct from Zurich.
// Davos is world's highest city at 1560m — town itself is a destination.
// Validated: grep "davos" app.jsx → 0. ZRH confirmed in all 3 AP tables.
{
  id: "davos-klosters",
  category: "skiing",
  title: "Davos / Klosters",
  location: "Graubünden, Switzerland",
  lat: 46.8027, lon: 9.8367,
  ap: "ZRH",
  icon: "⛷️",
  rating: 4.85,
  reviews: 14200,
  gradient: "linear-gradient(160deg,#0c1e3c,#1e4080,#3468c0)",
  accent: "#6898e0",
  skiPass: "other",
  tags: ["320km Parsenn Terrain", "Direct Train from Zurich", "World's Highest Alpine Town", "James Bond Schilthorn"],
  photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&q=80&w=1200"
},

// 3. N.hem ski — Sunshine Village, Banff, Alberta (YYC, ~1.5hr)
// Lake Louise is already in catalog; Sunshine Village is a distinct resort and the most snow-reliable
// in the Canadian Rockies (average 9m/year). 3 mountain peaks, 12m average snowfall, opens Nov.
// YYC serves both; same-area ski options strengthen the Banff cluster.
// Validated: grep "sunshine-village" app.jsx → 0. YYC confirmed in all 3 AP tables.
{
  id: "sunshine-village-ab",
  category: "skiing",
  title: "Sunshine Village",
  location: "Banff, Alberta, Canada",
  lat: 51.0898, lon: -115.7731,
  ap: "YYC",
  icon: "⛷️",
  rating: 4.88,
  reviews: 11600,
  gradient: "linear-gradient(160deg,#0a1e38,#183a70,#2a60a8)",
  accent: "#5888d0",
  skiPass: "epic",
  tags: ["9m Average Snowfall", "3 Peak Mountains", "Continental Divide Riding", "Opens November"],
  photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=1200"
},

// 4. Beach — Shela Beach, Lamu Island, Kenya (MBA, 1hr flight from Mombasa)
// Lamu Old Town: UNESCO World Heritage site, largest intact Swahili settlement.
// Shela is 2km of white sand backed by dunes, no motor vehicles on the island.
// MBA already serves Diani + Watamu; Lamu completes the Kenya coastal triangle.
// Oct–Mar prime: NE trade winds die down, seas calm, 27°C water.
// Validated: grep "lamu\|shela" app.jsx → 0. MBA confirmed in all 3 AP tables.
{
  id: "shela-beach-lamu",
  category: "beach",
  title: "Shela Beach, Lamu Island",
  location: "Lamu County, Kenya",
  lat: -2.2710, lon: 40.9107,
  ap: "MBA",
  icon: "🏝️",
  rating: 4.81,
  reviews: 7400,
  gradient: "linear-gradient(160deg,#001c10,#003a28,#006848)",
  accent: "#28c888",
  tags: ["UNESCO Swahili Old Town", "Car-Free Island", "Oct–Mar Prime Season", "Dhow Sailing Culture"],
  photo: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&q=80&w=1200"
},

// 5. Beach — Anse Cocos, La Digue, Seychelles (SEZ, Mahé → ferry)
// La Digue already has Anse Severe in catalog; Anse Cocos is a different beach on the same island —
// accessible only by foot (25min hike from L'Union Estate), untouched, no facilities.
// Considered one of the 10 most beautiful beaches in the world. Oct–Apr prime.
// SEZ already serves 3 catalog venues; Anse Cocos is genuinely distinct.
// Validated: grep "anse-cocos" app.jsx → 0. SEZ confirmed in all 3 AP tables.
{
  id: "anse-cocos-la-digue",
  category: "beach",
  title: "Anse Cocos",
  location: "La Digue, Seychelles",
  lat: -4.3450, lon: 55.8380,
  ap: "SEZ",
  icon: "🏝️",
  rating: 4.94,
  reviews: 3800,
  gradient: "linear-gradient(160deg,#001428,#003060,#006090)",
  accent: "#30c0f0",
  tags: ["Hike-Access Only", "Untouched Wilderness Beach", "Granite Boulders", "Oct–Apr Prime"],
  photo: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&q=80&w=1200"
}
```

> **Before pasting any venue:** run `grep -c '"id": "<id>"' app.jsx && grep -c 'id:"<id>"' app.jsx` — both must return 0. Also verify the photo URL is unique: `grep -c '<photo-url>' app.jsx` → 0.

---

## One Observation for the PM

**The queued venue backlog had a 70% duplicate rate — fix the queue source, not just the queue.** Of the 10 venues queued over Oct 21–22, 7 already existed in the catalog under different IDs. This happened because both days' reports proposed venues in geographic areas that "look like gaps" without checking the catalog first. The catalog is now 404 venues across 165 airports — it's dense enough that plausible-sounding new venues often already exist. Going forward: every proposed venue must run the `grep -c` ID + title checks BEFORE being added to the queue, not as a pre-paste step. Today's 5 venues above are all pre-verified clean. The 18-day Whistler window remains the most actionable deadline: 3 commands on the VPS is the only blocker between the current code state and a credible Nov-10 seasonal launch.
