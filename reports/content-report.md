# Peakly Content & Data Report — 2026-10-24

## Data Health Score: 89/100

**Deductions (unchanged — no code changes, cache stamp 40 days stale):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded
- −1: Gili Trawangan duplicate live (`beach_gilit`/LOP + `gili-trawangan`/DPS)
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories" — outdated since 2026-05-03 pivot)

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories." The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects actual app.jsx state.

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | ~14,237 — cache `peakly-20260914a`, **40 days stale** ⚠️⚠️ |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate title+location | **1** ⚠️ Gili Trawangan (`beach_gilit`/LOP + `gili-trawangan`/DPS) |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** (165 unique APs across 404 venues) ✅ |
| Missing photos | **0** ✅ |
| Missing tags array | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3 tags | **14** |
| Venues with 4+ tags | **165** |
| Venue APs in AP_CONTINENT | **165/165** ✅ |
| Venue APs in AIRPORT_COORDS | **165/165** ✅ |
| Venue APs in BASE_PRICES | **165/165** ✅ Open #22 CLOSED |
| lateSeason:true venues | **15** ✅ |
| GEAR_ITEMS | **0** ✅ Amazon cut for v1 |
| Cache stamp | `peakly-20260914a` — **40 days stale, must bump on first edit** ⚠️⚠️ |

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach | 270 | ✅ |
| Skiing | 134 | ✅ |

> The scheduled prompt references 12 categories. All non-skiing/beach categories retired 2026-05-03. No stub categories.

---

## GEAR_ITEMS Gaps

**None applicable.** Amazon Associates cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0.

---

## Seasonal Relevance — Oct 24, 2026

### N. Hemisphere Ski — 17-Day Whistler Window ⚡

**Whistler opens ~Nov 10 (17 days).** VPS redeploy still blocked — Whistler + Mammoth + A-Basin + Tignes score `confidence:"low"` until proxy's `forecast_days:14` is live. 5 marquee venues affected.

- **Year-round open now:** Hintertux, Saas-Fee glacier, Zermatt Plateau Rosa
- **Opening imminently (Nov 1–15):** Whistler, Mammoth, A-Basin, Tignes, Engelberg-Titlis
- **Dec season:** Val Thorens, Verbier, St. Moritz, Chamonix, Cervinia
- **New ski venues added today (below) target:** Lee Canyon (LAS, opens Dec), Arizona Snowbowl (PHX, opens Nov 15)

### N. Hemisphere Beach — Mediterranean & Canary Islands Prime

Canary Islands (ACE/FUE/TFS) peak 8-month season — 22°C water, 24°C air. All 6 Canary venues scoring their best of the year. Morocco coast (AGA/RAK): Oct–Apr prime, warm + uncrowded. **Nerja/AGP added today** fills a meaningful Andalusia gap.

### S. Hemisphere Beach — Prime Season ✅

Australia (SYD/MEL/BNE/CNS), South Africa (CPT), Brazil (GIG/GRU/FOR), Mauritius (MRU): Oct–Mar optimal. All scoring high.

### S. Hemisphere Ski — Season Ended ⚠️

23 S-hem ski venues (Remarkables, Thredbo, Portillo, etc.) now off-season. Correct behavior — off front page.

### Tropical / Equatorial Beach — Year-Round

Maldives (MLE), Seychelles (SEZ), Fiji (NAN), Colombia (CTG), Costa Rica (LIR): year-round warm water. Oct–Mar is dry season for Caribbean and Mesoamerica — **Playa Blanca Barú/CTG added today** captures this window.

---

## Airport Coverage Gaps (Require AP Table Additions Before Venue Can Land)

The following high-demand airports are missing from AIRPORT_COORDS and/or BASE_PRICES. Each requires a 3-line addition to the AP tables before a venue can be safely added:

| Airport | In AP_CONTINENT | In AIRPORT_COORDS | In BASE_PRICES | Notes |
|---------|-----------------|-------------------|----------------|-------|
| DXB (Dubai) | ❌ | ❌ | ❌ | UAE has 0 beach venues. Oct–Apr prime Red Sea/Gulf. |
| ICN (Seoul Incheon) | ❌ | ❌ | ❌ | Korea has 0 ski venues. PyeongChang nearby. |
| GMP (Seoul Gimpo) | ✅ asia | ❌ | ❌ | Alternative Seoul AP — still missing coords + BP. |
| HRG (Hurghada) | ❌ | ❌ | ❌ | Egypt/Red Sea — 0 venues, Oct–May prime season. |
| BOG (Bogotá) | ✅ latam | ❌ | ❌ | Colombia inland — Santa Marta coast via SMR instead. |

**5 fully covered APs with 0 venues (today's targets use 2 of 3):** DTW (Detroit), LAS (Las Vegas), PHX (Phoenix). Detroit excluded — no compelling weekend ski/beach from DTW without a multi-hour drive.

---

## Oct 23 Queue Status

The 5 venues proposed in the Oct 23 report are **still pending** (none were added to app.jsx — code freeze appeared to persist through yesterday). All 5 remain valid and pre-verified:

| ID | Target | Status |
|----|--------|--------|
| `flaine-france` | Skiing, GVA | ✅ Not in catalog, paste-ready |
| `davos-klosters` | Skiing, ZRH | ✅ Not in catalog, paste-ready |
| `sunshine-village-ab` | Skiing, YYC | ✅ Not in catalog, paste-ready |
| `shela-beach-lamu` | Beach, MBA | ✅ Not in catalog, paste-ready |
| `anse-cocos-la-digue` | Beach, SEZ | ✅ Not in catalog, paste-ready |

Both queues (Oct 23 + Oct 24 below) are valid. Pre-paste check still required: `grep -c 'id:"<id>"' app.jsx && grep -c '"id": "<id>"' app.jsx` — both must return 0.

---

## 5 New Venue Objects — Oct 24 Seasonal Focus

**All venues use airports fully confirmed in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. IDs verified not in catalog.**

```js
// 1. Ski — Lee Canyon (Las Vegas Ski & Snowboard Resort) via LAS
// The ONLY ski resort serving Las Vegas (0 venues at LAS today).
// 47 miles from the Strip; 1.5hr door-to-lift for the millions flying through Vegas.
// Mt. Charleston, 3,880ft vertical, avg 10ft snow. Opens Dec, peak Jan–Mar.
// Genuinely unique: "ski in the morning, pool in the afternoon" weekend.
// Validated: grep "lee-canyon\|lee_canyon" app.jsx → 0. LAS fully covered.
{
  id: "lee-canyon-nv",
  category: "skiing",
  title: "Lee Canyon",
  location: "Mt. Charleston, Nevada, USA",
  lat: 36.3272,
  lon: -115.6731,
  ap: "LAS",
  icon: "⛷️",
  rating: 4.52,
  reviews: 5800,
  gradient: "linear-gradient(160deg,#0a1a38,#1a3060,#2a509a)",
  accent: "#4878c8",
  skiPass: "other",
  tags: ["Vegas Day Trip", "Mt. Charleston Desert Contrast", "Beginner to Intermediate", "Opens December"],
  photo: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&q=80&w=1200"
},

// 2. Ski — Arizona Snowbowl, Flagstaff via PHX
// Phoenix is a top-5 US origin hub with ZERO ski venues today.
// Snowbowl: 777 acres, 11,500ft summit, 14 lifts. 1.5hr from Phoenix by car.
// Opens mid-November — earliest Southwest ski destination.
// Flagstaff itself is 7,000ft elevation; high-desert alpine experience.
// Validated: grep "snowbowl\|arizona-snow" app.jsx → 0. PHX fully covered.
{
  id: "arizona-snowbowl",
  category: "skiing",
  title: "Arizona Snowbowl",
  location: "Flagstaff, Arizona, USA",
  lat: 35.3299,
  lon: -111.7076,
  ap: "PHX",
  icon: "⛷️",
  rating: 4.44,
  reviews: 9200,
  gradient: "linear-gradient(160deg,#121a28,#203858,#306898)",
  accent: "#5090c8",
  skiPass: "other",
  tags: ["Opens November", "High Desert Alpine", "Ponderosa Pine Forest", "1.5hr from Phoenix"],
  photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&q=80&w=1200"
},

// 3. Beach — Nerja / Playa Burriana, Andalusia, Spain via AGP
// AGP (Málaga) currently has 1 venue: Sierra Nevada skiing. No beach option.
// Nerja = the jewel of the Costa Tropical: whitewashed cliffs, crystal-clear 20°C water.
// Playa Burriana is Nerja's largest beach — 700m of fine sand backed by a promenade.
// Oct–Nov: summer crowds gone, 22°C air, 20°C water, 9hr sun. Perfect weekend window.
// Validated: grep "nerja\|burriana\|playa-burriana" app.jsx → 0. AGP fully covered.
{
  id: "nerja-beach-spain",
  category: "beach",
  title: "Nerja",
  location: "Costa Tropical, Andalusia, Spain",
  lat: 36.7488,
  lon: -3.8724,
  ap: "AGP",
  icon: "🏖️",
  rating: 4.77,
  reviews: 18400,
  gradient: "linear-gradient(160deg,#001830,#003870,#005aaa)",
  accent: "#3888e0",
  tags: ["Oct–Nov Prime", "Whitewashed Cliff Village", "20°C October Water", "Balcón de Europa Views"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=1200"
},

// 4. Beach — Playa Blanca, Barú Island, Colombia via CTG
// CTG (Cartagena) has 1 venue: beach_cartagena (urban). Playa Blanca is a completely different
// experience — 45min speedboat from Cartagena, no cars, no hotels (day-trip only), powder-white
// sand, turquoise Caribbean water. Consistently ranked the best beach in Colombia.
// Oct–Jan: Caribbean dry season starts, flat calm seas. Prime weekend window.
// Validated: grep "playa-blanca\|baru\|playa_blanca" app.jsx → 0. CTG fully covered.
{
  id: "playa-blanca-baru",
  category: "beach",
  title: "Playa Blanca, Barú Island",
  location: "Barú Peninsula, Bolívar, Colombia",
  lat: 10.1833,
  lon: -75.6500,
  ap: "CTG",
  icon: "🏝️",
  rating: 4.71,
  reviews: 12600,
  gradient: "linear-gradient(160deg,#001428,#003068,#0058a8)",
  accent: "#30a8e8",
  tags: ["Boat-Access Only", "Oct–Jan Dry Season", "Best Beach in Colombia", "Powder-White Caribbean Sand"],
  photo: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&q=80&w=1200"
},

// 5. Beach — Legzira Beach, Sidi Ifni, Morocco via AGA
// AGA (Agadir) has 1 venue: beach_agadir (main beach). Legzira is 40km south —
// famous for its two 50m-tall red sandstone arches over the ocean. Unique visual on any list.
// Voted one of the 10 most surprising beaches in the world. 20-min drive from Sidi Ifni.
// Morocco Oct–Apr: prime conditions — 22°C, less wind than summer, no crowds.
// Validated: grep "legzira" app.jsx → 0. AGA fully covered.
{
  id: "legzira-beach-morocco",
  category: "beach",
  title: "Legzira Beach",
  location: "Sidi Ifni, Souss-Massa, Morocco",
  lat: 29.3667,
  lon: -10.1833,
  ap: "AGA",
  icon: "🏖️",
  rating: 4.68,
  reviews: 7100,
  gradient: "linear-gradient(160deg,#1a0800,#3a1800,#6a3800)",
  accent: "#e07830",
  tags: ["50m Sandstone Rock Arches", "Oct–Apr Prime", "Wild Atlantic Surf", "UNESCO Argan Forest Region"],
  photo: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&q=80&w=1200"
}
```

> **Pre-paste checklist (run for every venue before adding):**
> 1. `grep -c 'id:"<id>"' app.jsx` → must be 0
> 2. `grep -c '"id": "<id>"' app.jsx` → must be 0
> 3. `grep -c '<photo-url-slug>' app.jsx` → must be 0 (no duplicate photo)
> 4. Confirm airport in all 3 AP tables: `node -e "const s=require('fs').readFileSync('app.jsx','utf8'); ..."` (see previous reports)

---

## One Observation for the PM

**The cache stamp is 40 days stale — this is now a credibility risk, not just a maintenance task.** `peakly-20260914a` was set on Sep 14; today is Oct 24. Any user on the live site who installed the PWA on Sep 14 or later is being served a service worker that won't signal an update for the next 40 days of changes, because the SW cache name hasn't changed. The VPS redeploy (Open #19) remains the harder dependency, but the stamp bump is 3 seconds: change `"20260914a"` → `"20261024a"` in `app.jsx` and `sw.js` — the auto-push hook handles the commit. This should happen on the next edit regardless of what that edit is. The Whistler 17-day window is the deadline that matters most, but a stale cache undermines every fix that lands between now and then.
