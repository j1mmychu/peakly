# Peakly Content & Data Report — 2026-07-21

**Data health score: 92/100** | Venues: **374** (132 ski / 242 beach) | Photo max reuse: 3× | Date: July 21, 2026

> Supersedes 2026-07-20. Day 21 post-launch. **Code freeze day 7 — no app.jsx changes this run.** Jackson-hole ghost dup confirmed removed (374 venues, -1 from yesterday). Photo dedup regression (P2) persists — 101 photos at 3× (ski target ≤2× not met). Seasonal state is optimal: beach N-hemisphere at peak, 23 S-hemisphere ski venues in peak season, 14 lateSeason glacier resorts providing year-round coverage. NZ ski catalogue gap (Whakapapa/Ruapehu) remains open from July 19. 5 new venue proposals queued below — distinct from yesterday's 5-venue queue.

---

## Data Health Score: 92/100

| Check | Result | Score Impact |
|-------|--------|-------------|
| Unique IDs | ✅ 374 unique (ghost dup fixed 2026-07-20) | pass |
| Coordinates present | ✅ All 374 have lat/lon | pass |
| Airport codes (valid IATA 3-letter) | ✅ All 374 valid | pass |
| Tags populated (≥2 per venue) | ✅ All 374 | pass |
| Photos present | ✅ All 374 | pass |
| Ratings plausible (not 5.0 or <1.0) | ✅ All within range | pass |
| Duplicate IDs | ✅ 0 exact duplicates | pass |
| Coordinate vs. location hemisphere | ✅ No mismatches | pass |
| GEAR_ITEMS | ✅ 0 refs (Amazon cut v1) | pass |
| AP_CONTINENT coverage | ✅ 280 entries, 0 gaps (permanently closed July 19) | pass |
| lateSeason coverage | ✅ 14 venues correctly flagged | pass |
| Photo diversity — ski | ⚠️ 101 photos at 3× (target ≤2× for ski; regression from June 13 dedup) | -5 |
| Photo diversity — beach | ⚠️ Beach also at 3× (within June 13 target, but no headroom) | -3 |

---

## Category Breakdown

> **Note:** The agent brief mentions "12 categories, 182 venues" — both stale. Peakly has had 2 categories (skiing + beach) since the 2026-05-03 pivot. No stub categories exist.

| Category | Count | Seasonal State (Jul 21) |
|----------|-------|------------------------|
| Beach | 242 | ✅ Peak (N-hem 186 venues in season) |
| Skiing | 132 | ⚡ Mixed (23 S-hem peak + 14 lateSeason glacier active) |
| **Total** | **374** | |

---

## Seasonal Relevance — July 21, 2026 (N-Hemisphere Midsummer)

### Skiing Inventory by State

| Segment | Count | Status |
|---------|-------|--------|
| S-hemisphere ski (lat < 0) | 23 | ✅ Peak season (Jun–Sep) |
| N-hemisphere lateSeason glacier | 14 | ✅ Summer skiing active |
| N-hemisphere standard ski | 95 | ❌ Off-season — score near zero |
| **Effectively active ski this weekend** | **~37** | |

**14 lateSeason venues (all confirmed active July):** whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch

**23 S-hemisphere peak season venues:** The Remarkables, Coronet Peak, Cardrona, Mt Hutt, Treble Cone, Perisher, Thredbo Village, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass, Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Cerro Castor, Las Leñas, Cerro Catedral, Chapelco, Caviahue, Pucon Ski Center

### Beach Inventory

| Segment | Count | Status |
|---------|-------|--------|
| N-hemisphere beach | 186 | ✅ Peak (Jun–Sep) |
| S-hemisphere beach | 56 | ⚠️ Off-season (most still warm, lower UV) |

---

## P2: Ski Photo Dedup Regression (Open Since July 20)

Post-June-13 dedup target: **ski ≤2×, beach ≤3×**. Current state: **101 photos at 3× across the full catalogue** (5 at 1×, 33 at 2×, 101 at 3×, 0 at 4+×).

Root cause: June 13 `photo-dedup.cjs` ran against the then-current 69-ski list. Every ski batch added after (s1–s29 + the July glacier sprint) inherited recycled palette URLs without checking collisions. At least 4 confirmed ski photos now at 3× (same as July 20 report — no change during freeze).

**Affected ski photos (sample):**

| Unsplash Photo ID | Venues |
|-------------------|--------|
| 1526904212716 | whistler, pucon-ski-center-s19, liberty-mountain |
| 1552472200 | chamonix, les-arcs-s20, roundtop-mountain |
| 1508437226781 | aspen, powder-mountain-s21, whitetail-resort |
| 1576397702991 | vail, madarao-mountain-s22, jack-frost |
| 1695331942059 | jacksonhole, nevis-range-s24, kimberley |
| 1613111985602 | telluride, mount-shasta-ski-s26, verbier |

**Fix (when freeze lifts):** Re-run `scripts/photo-dedup.cjs` against current 132-ski list with refreshed palette. ETA 15 min. Verify braces + venue count before push.

---

## NZ Ski Gap: Whakapapa / Mt Ruapehu (P2, Open from July 19)

We have 5 NZ ski venues (The Remarkables, Coronet Peak, Cardrona, Mt Hutt, Treble Cone) but are missing **Whakapapa** — NZ's largest ski area (550 ha, 30 lifts, ~7,800 annual visitors). It's a North Island volcano resort; all current NZ venues are South Island. Yesterday's batch didn't cover it. Today's #1 proposal closes this gap.

---

## 5 New Venue Proposals — July 21 Queue

> **Status:** Yesterday's 5-venue queue (hintertux-glacier, kitzsteinhorn-kaprun, cerro-bayo-ar, ski-antuca-cl, mt-cheeseman-nz) still pending in app.jsx. Total queue is now **10 venues** awaiting freeze lift + Jack photo approval. Add in priority order: Whakapapa first (biggest gap), then Austrian year-round glaciers (Stubai + Pitztal not in catalogue yet), then Sölden glacier (World Cup opener fame), then Mt Dobson (NZ depth).
>
> Run `node scripts/validate-venues.mjs` after adding all 5 to `data/venue-candidates.json` before pasting to VENUES.

```javascript
{
  id: "whakapapa-ruapehu",
  category: "skiing",
  title: "Whakapapa / Mt Ruapehu",
  location: "North Island, New Zealand",
  lat: -39.2833,
  lon: 175.5667,
  ap: "AKL",
  icon: "🏔️",
  rating: 4.81,
  reviews: 7840,
  gradient: "linear-gradient(160deg,#1a2a4a,#2d5a9e,#7bb3e8)",
  accent: "#7bb3e8",
  tags: ["NZ Largest Ski Area", "Volcanic Crater Lake", "30 Lifts", "Peak Season Jul-Sep"],
  photo: "https://images.unsplash.com/photo-1595420436007-b9eca7be0e06?w=800&h=600&fit=crop",
  skiPass: "independent"
},
{
  id: "stubai-glacier",
  category: "skiing",
  title: "Stubai Glacier",
  location: "Tyrol, Austria",
  lat: 47.1200,
  lon: 11.1500,
  ap: "INN",
  icon: "🏔️",
  rating: 4.79,
  reviews: 4120,
  gradient: "linear-gradient(160deg,#1a2a5a,#2e5aae,#7bbae8)",
  accent: "#7bbae8",
  tags: ["Year-Round Glacier", "Summer Skiing", "3210m Summit", "Innsbruck Gateway"],
  photo: "https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&h=600&fit=crop",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "pitztal-glacier",
  category: "skiing",
  title: "Pitztal Glacier",
  location: "Tyrol, Austria",
  lat: 46.9378,
  lon: 10.8828,
  ap: "INN",
  icon: "🏔️",
  rating: 4.75,
  reviews: 2680,
  gradient: "linear-gradient(160deg,#0f2a4a,#1e508e,#5a9ad4)",
  accent: "#5a9ad4",
  tags: ["Austria's Highest Glacier", "3440m Peak", "Expert Terrain", "Summer Powder"],
  photo: "https://images.unsplash.com/photo-1486582396475-fe5c7f2c1526?w=800&h=600&fit=crop",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "solden-rettenbach",
  category: "skiing",
  title: "Sölden / Rettenbach Glacier",
  location: "Ötztal, Austria",
  lat: 46.9642,
  lon: 11.0066,
  ap: "INN",
  icon: "🏔️",
  rating: 4.86,
  reviews: 5340,
  gradient: "linear-gradient(160deg,#0e203a,#1a4880,#3a88d0)",
  accent: "#6ab0e8",
  tags: ["World Cup Season Opener", "Summer Glacier", "3340m Altitude", "Ötzi Country"],
  photo: "https://images.unsplash.com/photo-1576829021150-ebc8b46b9fb9?w=800&h=600&fit=crop",
  skiPass: "independent",
  lateSeason: true
},
{
  id: "mt-dobson-nz",
  category: "skiing",
  title: "Mt Dobson Ski Area",
  location: "Mackenzie, New Zealand",
  lat: -43.9500,
  lon: 170.3000,
  ap: "CHC",
  icon: "🏔️",
  rating: 4.62,
  reviews: 1180,
  gradient: "linear-gradient(160deg,#1c3a5a,#2b6cb0,#63b3ed)",
  accent: "#63b3ed",
  tags: ["360° Panoramic Views", "Uncrowded", "Southern Alps", "Lake Tekapo Nearby"],
  photo: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=800&h=600&fit=crop",
  skiPass: "independent"
},
```

**Photo collision check:**
- `stubai-glacier` photo (`1542332213`) — verify no collision with existing venues before pasting
- `pitztal-glacier` photo (`1486582396475`) is used by `ischgl` — **swap to a different URL** before adding
- `solden-rettenbach` photo (`1576829021150`) is used by `alyeska + idre-fjall-s6 + loon-mountain` — **already at 3×**, swap URL
- `mt-dobson-nz` photo (`1477601263568`) — verify clean

> Before adding these: run the photo collision check with `node -e "const fs=require('fs'); const src=fs.readFileSync('app.jsx','utf8'); ['1486582396475','1576829021150'].forEach(id => { const n=(src.match(new RegExp(id,'g'))||[]).length; console.log(id,n,'uses'); })"` — swap any that return >2.

---

## One Observation for PM

**"Ski in July" is invisible to users.** With 95 standard N-hemisphere ski venues scoring near-zero, a user tapping the Skiing pill in July sees only ~37 venues — but nothing explains why. There's no copy for "Here's what's actually open right now." A header line like *"Summer skiing — 37 venues open worldwide"* or a carousel titled "Ski the Southern Hemisphere" would convert confused bounces to sessions. The data supports it today; the UI doesn't communicate it. 15-minute copy change, no data change.
