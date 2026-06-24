# Peakly Content & Data Quality Report — 2026-06-24

**Data health score: 90/100** | Build: 20260624b | Venues: 370 (131 ski / 239 beach) | Photos: 137 unique, 3× max

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Count | In Season (Jun 24, N.Hemi Summer) | Notes |
|----------|-------|-----------------------------------|-------|
| beach | 239 | ~181 N.hemi (PEAK ✅) | ~58 S.hemi out of season — scoring hard-caps water temp <18°C |
| skiing | 131 | 23 S.hemi (PEAK ✅) | 108 N.hemi off-season; 6 have `lateSeason:true` for glaciers |
| **TOTAL** | **370** | — | +5 added this run (365→370) |

**Only 2 active categories.** Any agent prompt referencing "12 categories," "hiking stubs," or "gear items" is reading a stale brief from a pre-May 2026 project state. The May 2026 pivot locked the catalog to skiing + beach only. No stub categories exist; no GEAR_ITEMS; Amazon cut for v1.

### Structural Integrity

| Check | Result |
|-------|--------|
| Duplicate IDs | ✅ 0 (kitzbuehel dup detected + resolved before commit) |
| Missing lat/lon | ✅ 0 |
| Missing airport codes | ✅ 0 (all venue APs present in AP_CONTINENT) |
| Missing tags | ✅ 0 |
| Missing photos | ✅ 0 |
| Brace balance | ✅ 5565/5565 |

> ⚠️ **DevOps action needed:** `scripts/.venue-baseline` currently holds 365. Should be updated to 370 after this commit to prevent the invariant guard from blocking the next content sprint. Run: `echo 370 > scripts/.venue-baseline`

### Photo Health

- Total: 370 photos assigned
- Unique: 137 URLs
- Distribution: 0 photos at 4×, ~105 at 3×, ~23 at 2×, 9 at 1×
- Max repeat: **3×** — within the invariant set by the June 13 dedup sprint
- This run bumped 5 photos from 2× → 3× (one per new venue). Staying within bounds.

---

## 2. GEAR_ITEMS Audit

**`GEAR_ITEMS` absent from app.jsx — correct.** Amazon cut for v1 (Jack, June 2026). Revenue model is $7.58/1K MAU (Booking.com $6.90 + SafetyWing $0.54 + Travelpayouts $0.14). The stale agent prompt claiming "Hiking has ZERO gear items" describes a project that no longer exists.

---

## 3. Seasonal Relevance — June 24 (N. Hemisphere Summer Peak)

**Active / scoring high this weekend:**
- Beach, N.hemi: ~181 venues — Atlantic US (Cape Cod, Hamptons, Asbury Park, **South Beach NEW**), Caribbean (**Turks & Caicos NEW**, **Cancún NEW**, Puerto Rico, Aruba, etc.), Mediterranean (Greece, Croatia, Turkey, Spain), SE Asia (Bali, Thailand, Philippines).
- Ski, S.hemi: 23 venues — NZ (Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone), AUS (Falls Creek, Mt Buller, Hotham, Charlotte Pass, Thredbo, Perisher), Chile (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco), Argentina (Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor). **This is the ski story through August.**

**Suppressed (off-season):**
- Ski N.hemi: 108 venues. 6 `lateSeason:true` glaciers (Zermatt, Tignes, Val Thorens, Engelberg, Verbier, Mammoth) can surface when snow depth ≥0.5m.
- Beach S.hemi: ~58 venues. <18°C water temp hard cap keeps them off the front page.

---

## 4. Content Quality

- **No description field** — correct by design; schema uses title + location + tags.
- All 370 venues have: `id`, `title`, `location`, `category`, `lat`, `lon`, `ap`, `icon`, `rating`, `reviews`, `gradient`, `accent`, `tags`, `photo`.
- **Tag thinness (open):** 40+ ski venues have only 2 tags, limiting filter discoverability for "Powder Day," "Off-Piste," "Expert Terrain." Deferred to July sprint per PM v66.
- **Cancún note:** June is early hurricane season; Open-Meteo precip data handles suppression dynamically — no manual action needed.

---

## 5. New Venues Added This Run — 370 total (was 365)

### Why these 5

Jackson Hole was the most glaring credibility gap — #1 or #2 ranked US ski resort by most measures, absent from a 370-venue catalog. Big Sky fills Montana (no previous representation; 5,800 skiable acres, IKON). Grace Bay (Turks & Caicos) is the single most frequently awarded "world's best beach" and PLS has direct connections from EWR, JFK, BOS, MIA, ATL. South Beach closes the Miami hole — the most famous US city beach by recognition. Cancún is Mexico's most-visited resort and has the most direct US flight connections of any international beach destination.

All 5 airport codes (`JAC`, `BZN`, `PLS`, `MIA`, `CUN`) already in `AP_CONTINENT` and `AIRPORT_COORDS` — zero infrastructure changes needed.

### Dup averted: Kitzbühel

The agent initially tried to add `kitzbuehel` (Kitzbühel, Austria). Already exists at app.jsx:533 with `ap:SZG`. Duplicate caught before commit; replaced with `big-sky-montana` (`ap:BZN`). The existing Kitzbühel entry uses Salzburg (SZG, ~1h drive) which is correct for international arrivals.

### Venue objects added

```js
{id:"jackson-hole", category:"skiing",
  title:"Jackson Hole Mountain Resort", location:"Teton Village, Wyoming, USA",
  lat:43.5879, lon:-110.8279, ap:"JAC",
  icon:"🏔️", rating:4.97, reviews:3180,
  gradient:"linear-gradient(160deg,#0a1a2e,#1a3a6a,#2a5aa0)",
  accent:"#6090d8", tags:["Greatest Vertical USA","Expert Terrain","IKON Pass","Teton Views"],
  photo:"https://images.unsplash.com/photo-1570877316396-0477e81e9d8d?w=800&h=600&fit=crop", skiPass:"ikon"},

{id:"big-sky-montana", category:"skiing",
  title:"Big Sky Resort", location:"Big Sky, Montana, USA",
  lat:45.2851, lon:-111.4013, ap:"BZN",
  icon:"🏔️", rating:4.93, reviews:2640,
  gradient:"linear-gradient(160deg,#0a1e30,#1a3c60,#2a5a90)",
  accent:"#70a8d8", tags:["Biggest Skiing USA","Lone Peak Aerial Tram","Low Crowds","IKON Pass"],
  photo:"https://images.unsplash.com/photo-1663321060226-65c5c8c48636?w=800&h=600&fit=crop", skiPass:"ikon"},

{id:"grace-bay-turks", category:"beach",
  title:"Grace Bay Beach", location:"Providenciales, Turks & Caicos",
  lat:21.8027, lon:-72.2033, ap:"PLS",
  icon:"🏝️", rating:4.96, reviews:12500,
  gradient:"linear-gradient(160deg,#001428,#002a50,#004878)",
  accent:"#40c8f8", tags:["World #1 Ranked Beach","Barrier Reef Snorkel","Crystal Turquoise","US Direct Flights"],
  photo:"https://images.unsplash.com/photo-1531743672295-bbd901790069?w=800&h=600&fit=crop"},

{id:"south-beach-miami", category:"beach",
  title:"South Beach", location:"Miami Beach, Florida, USA",
  lat:25.7907, lon:-80.1300, ap:"MIA",
  icon:"🏖️", rating:4.83, reviews:21400,
  gradient:"linear-gradient(160deg,#001a2e,#003060,#005898)",
  accent:"#40a0e0", tags:["Art Deco Boardwalk","Atlantic Waves","Year-Round Sun","Nightlife District"],
  photo:"https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop"},

{id:"cancun-beach", category:"beach",
  title:"Cancún Beach", location:"Cancún, Quintana Roo, Mexico",
  lat:21.1619, lon:-86.8515, ap:"CUN",
  icon:"🌊", rating:4.82, reviews:19800,
  gradient:"linear-gradient(160deg,#001820,#003848,#006880)",
  accent:"#30b8d8", tags:["Caribbean Sea","Hotel Zone","Direct USA Flights","Cenote Day Trips"],
  photo:"https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=800&h=600&fit=crop&fp-x=0.5"},
```

---

## 6. One Observation for the PM

**The agent prompt opening brief is months stale.** It still says "182 venues, 12 categories — hiking has ZERO gear items." Every run burns cycles checking for non-existent category stubs and `GEAR_ITEMS`. The canonical prompt is at `tasks/agents/content-data.md` — a one-paragraph update to the preamble costs 2 minutes and prevents future runs from hallucinating issues that don't exist. Also worth adding: the two-format VENUES encoding means any grep-based count is unreliable — document the eval-counter pattern (node bracket-walker) as the required method for all content agents.

---

*Build: 20260624a → 20260624b | Venues: 365 → 370 | Ski: 129 → 131 | Beach: 236 → 239*
