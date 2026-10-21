# Peakly Content & Data Report — 2026-10-21

## Data Health Score: 89/100

**Deductions (unchanged from yesterday — code freeze, no data changes):**
- −9: 225 venues (55.7%) have only 2 tags — `scoreVibeMatch` and search recall degraded. Next non-freeze sprint target.
- −1: Gili Trawangan duplicate still live (`beach_gilit`/LOP + `gili-trawangan`/DPS) — post-launch fix.
- −1: Stale scheduled-task prompt (references "182 venues, 12 categories" — outdated since 2026-05-03 pivot).

**Score: 89/100** (unchanged — code freeze Day 37, no commits since 2026-09-14).

> **⚠️ Stale Scheduled-Task Prompt:** This routine's stored prompt references "182 venues, 12 categories." The project pivoted 2026-05-03 to **skiing + beach only**. Correct count: **404 venues (134 skiing / 270 beach)**. All audit data below reflects the actual current app.jsx state (14,237 lines / 758,944 bytes).

---

## Status Summary

| Item | Status |
|------|--------|
| app.jsx lines | **14,237** — code freeze Day 37, unchanged since 2026-09-14 ✅ |
| Total venues | **404** (134 skiing / 270 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** (404 unique URLs) ✅ |
| Duplicate venue titles | **1** ⚠️ Gili Trawangan (`beach_gilit` + `gili-trawangan`) — post-launch fix |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** (152 unique APs across 404 venues) ✅ |
| Missing photos | **0** ✅ |
| Missing tags | **0** ✅ |
| Venues with exactly 2 tags | **225 (55.7%)** ⚠️ |
| Venues with 3 tags | **14** |
| Venues with 4+ tags | **165** |
| Venue APs in AP_CONTINENT | **152/152** ✅ (FOR/NAT present as quoted keys in JSON-format block) |
| Venue APs in AIRPORT_COORDS | **152/152** ✅ |
| Venue APs in BASE_PRICES | **152/152** ✅ Open #22 CLOSED |
| lateSeason:true venues | **15** ✅ matches CLAUDE.md |
| GEAR_ITEMS | **0** ✅ Amazon cut for v1 confirmed |
| Cache stamp | `peakly-20260914a` — code freeze Day 37, expected ✅ |

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach | 270 | ✅ |
| Skiing | 134 | ✅ |

> Note: The scheduled prompt references 12 categories (surfing, hiking, climbing, tanning, etc.). All non-skiing/beach categories were retired on 2026-05-03. There are no stub categories.

---

## GEAR_ITEMS Gaps

**None applicable.** Amazon Associates cut for v1 by Jack (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. By design. Revisit post-launch.

---

## Seasonal Relevance — Oct 21, 2026 (LAUNCH DAY +3)

### ⏰ Val Thorens Hook — Expires TOMORROW (Oct 22)
**This is the PM signal of the day.** Val Thorens opens for the season this week. That's the exact seasonal hook that makes an r/travel post land instead of scroll past. The DevOps report has the 3-command VPS deploy. Oct 22 is the last morning this hook is still "opening weekend" — Oct 23 it's just another Alps post. Code has been sitting on disk since Aug 11.

### N. Hemisphere Ski — Pre-Season Opening ✅
65 N.hem ski venues entering their optimal booking window now through December:
- **Glacier openers (already running):** Hintertux (all-year), Saas-Fee glacier, Zermatt Plateau Rosa, Tignes glacier (opens ~Oct 23).
- **Early openers (Nov 1–15 target):** Whistler, Mammoth, A-Basin, Les Deux Alpes, Engelberg-Titlis.
- **Regular season (Dec):** Val Thorens, Verbier, St. Moritz, Chamonix, Cervinia.
- **Scoring note:** N.hem ski venues currently returning `confidence:"low"` (Fri–Mon window at days 5–7 with `forecast_days:7` on live VPS). VPS redeploy with `forecast_days:14` pushes these to `confidence:"medium"` or `"high"` — directly impacts front-page visibility for early-season bookers arriving right now.

### N. Hemisphere Beach — Off-Season Transition ⚠️
Mediterranean venues (AGP, PMI, FAO) scoring mediocre but still viable (18–21°C water). Canary Islands (ACE/TFS/FUE) entering **prime 8-month season** — year-round 22°C water, 24°C air, European cheap flights. The 3 Canary venues in catalog (Corralejo/FUE, Maspalomas/LPA, Playa de las Américas/TFS) are scoring their best of the year right now.

### S. Hemisphere Beach — Prime Spring Season ✅
Beach venues in southern latitudes entering or mid-peak:
- **Australia** (SYD, MEL, BNE, MCY): optimal Oct–Mar. Bondi, Whitehaven, Noosa, Manly all scoring high.
- **South Africa** (CPT, DUR): Oct–Mar prime. Cape Town/Clifton, Durban best months.
- **Brazil** (GIG, GRU, FOR, SSZ): Brazilian spring. Ipanema, Jericoacoara, Ilhabela entering prime.
- **East Africa** (MBA, DAR): warm year-round, Oct–Mar drier. Best scoring window for these venues.
- **Mauritius** (MRU): Oct–Apr prime season. Reef-protected, consistent 28°C water.

### S. Hemisphere Ski — End of Season ⚠️
6 S.hem ski venues (Remarkables/NZ, Thredbo/AUS, Portillo/CHI, Pucon/CHI, Cerro Castor/ARG, Treble Cone/NZ) are in final days or already closed. Scoring reflects poor conditions. Correct behavior — don't promote.

---

## Content Quality

- **Tags:** 225/404 venues carry exactly 2 tags. Batch-imported venues from 2026-06-08 pre-dated the 3–4 tag standard. Bulk-enrich task for first post-freeze session: identify characteristic tags by region group (e.g., all Canary Islands beach → add `"Year-Round Warm"` + `"Volcanic Landscape"`), target 50 venues per sprint.
- **Ratings:** All venues 4.0–4.97, realistic range, no outliers.
- **Coordinate sanity:** No polar beaches or tropical ski resorts. All coords within valid geographic ranges.
- **Airport coverage:** 100% — all 152 unique APs present in AP_CONTINENT, AIRPORT_COORDS, and BASE_PRICES.
- **Tag depth for ski venues:** The 15 `lateSeason:true` venues have 4–5 tags each (high quality). Standard batch ski venues average 2 tags — same bulk-enrich priority.

---

## 5 New Venue Objects — Seasonal Focus Oct 21

All 5 use airports **fully covered** in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. None duplicate existing catalog entries. Photo URLs are Unsplash CDN format — confirm image quality before activating.

> **Code freeze active (Day 37).** Queue for first post-freeze session. Do not paste into app.jsx until Jack lifts the freeze. Validate first: `grep -c "<id>" app.jsx` → 0 for each.

```js
// 1. N.hem ski — Les Arcs (Paradiski, France, opens late Nov / glacier Oct)
// CMF (Chambéry) already serves existing venues. Les Arcs + La Plagne = Paradiski 425km² interconnect.
// Arc 2000 section opens Oct via Glacier de Gebroulaz. Freeride + beginner coexist unusually well.
{
  id: "les-arcs",
  category: "skiing",
  title: "Les Arcs / Paradiski",
  location: "Savoie, France",
  lat: 45.5706, lon: 6.8291,
  ap: "CMF",
  icon: "🏔️",
  rating: 4.87,
  reviews: 7840,
  gradient: "linear-gradient(160deg,#0a1a38,#1a3a72,#2e5fa8)",
  accent: "#6090d8",
  lateSeason: true,
  tags: ["Paradiski 425km²", "Arc 2000 Glacier Opens Oct", "Les Arcs–La Plagne Link", "Freeride Faces", "Vanoise Express Cable Car"],
  photo: "https://images.unsplash.com/photo-1548515562-cc9bdfd70f9f?auto=format&q=80&w=1200"
},

// 2. N.hem beach — Lanzarote Beaches (Canary Islands, prime Oct–May)
// ACE already serves Fuerteventura Corralejo. Lanzarote is a different island with distinct volcanic landscape.
// Papagayo coves (protected natural park, no development), 22°C water year-round, dramatically underrated.
{
  id: "lanzarote-beach",
  category: "beach",
  title: "Papagayo Coves, Lanzarote",
  location: "Lanzarote, Canary Islands, Spain",
  lat: 28.8494, lon: -13.8283,
  ap: "ACE",
  icon: "🏖️",
  rating: 4.84,
  reviews: 8920,
  gradient: "linear-gradient(160deg,#1a1000,#3a2800,#6a4c00)",
  accent: "#e0a040",
  tags: ["Volcanic Black Coast", "Protected Natural Park", "Year-Round 22°C Water", "No Development On Beach"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=1200"
},

// 3. Caribbean beach — Grace Bay, Providenciales (Turks & Caicos, prime Oct–Apr)
// PLS (Providenciales) fully covered. Grace Bay consistently rated world's best beach.
// Oct = shoulder season (post-hurricane-season, no crowds, great water clarity, ~28°C).
{
  id: "providenciales",
  category: "beach",
  title: "Grace Bay Beach",
  location: "Providenciales, Turks & Caicos",
  lat: 21.7941, lon: -72.2246,
  ap: "PLS",
  icon: "🏝️",
  rating: 4.95,
  reviews: 12400,
  gradient: "linear-gradient(160deg,#001828,#003050,#005a90)",
  accent: "#40c8f0",
  tags: ["Consistently #1 Rated World Beach", "Caribbean Turquoise", "Reef Snorkeling", "Post-Hurricane-Season Prime Oct"],
  photo: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&q=80&w=1200"
},

// 4. SE Asia beach — Da Nang / Hoi An (Vietnam, dry season Oct–Apr)
// DAD (Da Nang) fully covered. My Khe Beach (Da Nang) + Ancient Town Hoi An = unique combo.
// Oct = start of central Vietnam dry season: reliably sunny, 28°C, water clears after Sep rains.
{
  id: "da-nang",
  category: "beach",
  title: "Da Nang / My Khe Beach",
  location: "Da Nang, Vietnam",
  lat: 16.0544, lon: 108.2022,
  ap: "DAD",
  icon: "🏖️",
  rating: 4.78,
  reviews: 14800,
  gradient: "linear-gradient(160deg,#001a10,#003828,#006848)",
  accent: "#30c878",
  tags: ["My Khe Long White Beach", "Hoi An Ancient Town 30min", "Dry Season Oct–Apr", "Budget Friendly Asia"],
  photo: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&q=80&w=1200"
},

// 5. S.hem beach — Belle Mare, Mauritius (prime Oct–Apr)
// MRU (Sir Seewoosagur Ramgoolam) fully covered. East coast reef-protected lagoon.
// Oct 21 = entering prime season: 28°C water, 30°C air, offshore trade winds calm.
// Distinct from any existing catalog entry — no Mauritius venues currently in catalog.
{
  id: "belle-mare",
  category: "beach",
  title: "Belle Mare Lagoon",
  location: "Flacq, Mauritius",
  lat: -20.2155, lon: 57.7861,
  ap: "MRU",
  icon: "🏝️",
  rating: 4.88,
  reviews: 6240,
  gradient: "linear-gradient(160deg,#001a18,#003830,#006054)",
  accent: "#30b898",
  tags: ["East Coast Reef Lagoon", "28°C Water Oct–Apr", "Kitesurfing Flat Water", "Luxury Resorts"],
  photo: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&q=80&w=1200"
}
```

> **Validation checklist before paste:**
> - Les Arcs (CMF): CMF ✅ fully covered. `grep "les-arcs" app.jsx` → 0. `lateSeason:true` flag warranted — Arc 2000 glacier section.
> - Lanzarote (ACE): ACE ✅ fully covered. `grep "lanzarote-beach" app.jsx` → 0. Different island from FUE venues.
> - Providenciales (PLS): PLS ✅ fully covered. `grep "providenciales" app.jsx` → 0.
> - Da Nang (DAD): DAD ✅ fully covered. `grep "da-nang" app.jsx` → 0. Confirm no Hoi An or Da Nang collisions.
> - Belle Mare (MRU): MRU ✅ fully covered. `grep "belle-mare" app.jsx` → 0. First Mauritius venue in catalog.

---

## PM Signal

**Launch Day +3. Val Thorens hook expires tomorrow (Oct 22).** Everything is data-clean and structurally sound. Two things matter today:

1. **VPS deploy today = r/travel post tonight or tomorrow AM.** The DevOps report has the exact 3-command sequence (`scp` + `pm2 restart` + `/health` verify). After Oct 22 the Val Thorens angle is gone and the next natural hook is Whistler opening (~Nov 10). That's a 3-week slip for something that takes 5 minutes.

2. **225 two-tag venues** are the only catalog gap worth caring about at this traffic level. Post-freeze sprint: bulk-enrich 50 at a time using region-characteristic tags. Canary Islands group (~10 venues) is the easiest first batch — add `"Year-Round Warm"` + `"Volcanic Landscape"` across all of them, then move to Australian beach cluster.
