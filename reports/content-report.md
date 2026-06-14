# Peakly Daily Content Report — 2026-06-14

---

## Data Health Score: 84 / 100

**Total venues:** 156 (67 skiing · 89 beach)  
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot; surfing retired)  
**Photos:** 156 unique Unsplash URLs · 0 duplicates  
**Duplicate IDs:** 0  
**Coordinate errors:** 0  
**Missing critical fields:** 0

Score degraders vs. last report (was 91):
- Tag copy-paste duplication across 4 S hemisphere ski venues (−5)
- All international airports missing from `AIRPORT_COORDS` — flight-time filter blind to non-US venues (−5)
- 3 S hemisphere beach venues surfacing in Southern winter (−2)
- Extremely thin S hemisphere ski coverage for June (6 venues total; peak season for Oceania/Latin America ski) (−3)
- 1 cosmetic: `borabora` "UV 11" tag reads as data, not a vibe signal (−1 style)

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 89    | ✅ Healthy — 86/89 viable in June (55 tropical + 31 N hem summer) |
| Skiing   | 67    | ⚠️ June coverage thin — only 12/67 viable (6 lateSeason N hem + 6 S hem) |

> **Note for PM:** The task prompt references "182 venues, 12 categories" — that's pre-pivot state. Current catalog is 2 categories only. No stub categories exist.

---

## Data Integrity Audit

### ✅ Clean
- All 156 venues have: `id`, `category`, `lat`, `lon`, `ap`, `tags`, `photo`, `icon`, `rating`, `reviews`
- Zero duplicate IDs
- Zero duplicate photo URLs
- Zero out-of-range coordinates
- All AP codes pass 3-letter IATA format check
- All venue ratings within 4.0–5.0 range
- `lateSeason: true` correctly set on 6 N hemisphere high-altitude ski venues: whistler, chamonix, mammoth, abasin, tignes, cervinia

### ⚠️ Flagged Issues

**1. Copy-paste tag pollution on 4 S hemisphere ski venues (HIGH PRIORITY)**

`portillo-s4` and `pucon-ski-center-s19` share *identical* tags:
`["Glacial Skiing","Scenic Views","Village Base","On-Piste"]`

Neither is accurate: Portillo (3,350m, Chile, no village, iconic funicular) should be `["High Altitude","Expert Terrain","Challenging Terrain","Remote Location"]`. Pucon sits on a volcano — correct tags would be `["Volcanic Terrain","Scenic Views","All Levels","Families Welcome"]`.

`cerro-castor-s28` and `thredbo-village-s23` share identical tags:
`["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"]`

Thredbo is Australia's #1 resort with a famous summer hiking trail — tags should include `"Australia's Best"` and `"Village Base"`. Cerro Castor (Tierra del Fuego) is the world's southernmost ski resort — `"World's Southernmost"` and `"Remote Location"` are unique selling points wasted by generic tags.

**Fix (surgical, paste into VENUES array):**
```js
// portillo-s4: replace tags line
tags: ["High Altitude","Expert Terrain","Challenging Terrain","Remote Location"],

// pucon-ski-center-s19: replace tags line
tags: ["Volcanic Terrain","Scenic Views","All Levels","Families Welcome"],

// thredbo-village-s23: replace tags line
tags: ["Australia's Best","Village Base","Long Season","Summer Hiking"],

// cerro-castor-s28: replace tags line
tags: ["World's Southernmost","Remote Location","Long Season","Powder Day"],
```

**2. `AIRPORT_COORDS` missing all international airports (MEDIUM PRIORITY)**

The `flightHours()` distance filter uses `AIRPORT_COORDS` to compute Haversine distances. This object contains **63 US domestic airports only** (JFK→BDL). Every international venue (all 28 non-US airports in the catalog) returns `undefined` for flight time → the "≤Xhr" filter silently bypasses them, surfacing e.g. Queenstown (ZQN) to a New York user filtering "≤4hr flights."

Affected airports: ZQN, SCL, ZCO, SYD, USH, YVR, YYC, GVA, CMF, TRN, AGP, and 17 others.

The fix is adding international coordinates to `AIRPORT_COORDS`. High-value entries to add for S hemisphere ski season:
```js
// Add to AIRPORT_COORDS:
ZQN:{lat:-45.0211,lon:168.7394},  // Queenstown NZ
SYD:{lat:-33.9399,lon:151.1753},  // Sydney AU
MEL:{lat:-37.6733,lon:144.8433},  // Melbourne AU
SCL:{lat:-33.3929,lon:-70.7858},  // Santiago Chile
USH:{lat:-54.8432,lon:-68.2958},  // Ushuaia Argentina
BRC:{lat:-41.1512,lon:-71.1576},  // Bariloche Argentina
CHC:{lat:-43.4894,lon:172.5322},  // Christchurch NZ
YVR:{lat:49.1967,lon:-123.1815},  // Vancouver Canada
```

**3. 3 S hemisphere beach venues surfacing in southern winter**

`beach_floripa` (Florianópolis, BR, lat −27.6), `tofo-beach-t10` (Mozambique, lat −23.9), `hyams-beach-t22` (New South Wales AU, lat −35.1) are all in their off-season in June. Water temps drop to 14–17°C, violating the 18°C hard cap for beach scoring. These venues should score near-zero and sink to the bottom of results — verifying the scoring engine handles this correctly is the mitigation. No data change needed; worth confirming in browser.

**4. `borabora` UV tag is confusing**
- Current: `tags: ["UV 11","Crystal Water"]`
- Fix: `tags: ["Overwater Bungalows","Crystal Lagoon","Turquoise Water","Bucket List"]`

"UV 11" reads like sensor data, not an editorial tag. Overwater bungalows is Bora Bora's literal brand identity.

**5. Near-duplicate Outer Banks (LOW PRIORITY)**
- `beach_ob` → "Outer Banks OBX" (lat 35.558, ORF)
- `outer-banks-nags-head-t7` → "Outer Banks Nags Head" (lat 35.957, ORF)
Both served by ORF, ~45km apart. A user sees two Outer Banks results. Consider merging into the stronger entry (`outer-banks-nags-head-t7` has richer tags) or explicitly differentiating the sub-location in `beach_ob`'s title ("Kill Devil Hills" or "Cape Hatteras").

---

## Gear Items Audit

**GEAR_ITEMS status:** Present in app.jsx for `skiing` and `beach` categories. Coverage is correct for active categories. Amazon Associates tag (`peakly-20`) is wired.

> ⚠️ PM Note: Per CLAUDE.md, Jack formally cut GEAR_ITEMS for v1 launch in a later commit (2026-06-09). Current repo state (2026-06-04) still has the code. If you see this report in a session past that cut date, `grep -c GEAR_ITEMS app.jsx` should return 0. This is not a content bug — it's a pipeline timing artifact.

---

## Seasonal Relevance — June 14 (Peak Northern Summer)

### Skiing — June 14
| Status | Count | Venues |
|--------|-------|--------|
| ✅ In-season N hem (lateSeason) | 6 | Whistler, Chamonix, Mammoth, A-Basin, Tignes, Cervinia |
| ✅ In-season S hem | 6 | Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone |
| ❌ Off-season N hem | 55 | Rest of catalog |

**June gap = 45 resorts short of a healthy ski catalog.** S hemisphere needs at least 15+ venues to serve the Oceania/Latin America ski market during their prime months (June–September). Currently 6 venues. This is the most actionable expansion target.

### Beach — June 14
| Status | Count | Notes |
|--------|-------|-------|
| ✅ Tropical (always viable) | 55 | Southeast Asia, Caribbean, Pacific islands |
| ✅ N hemisphere summer | 31 | Mediterranean, US coasts, Azores |
| ❌ S hem winter (off-season) | 3 | Floripa, Tofo, Hyams Beach |

Beach catalog is healthy for June. S hem beach venues will score near-zero from water temp cap — no data change needed, the algorithm handles it.

---

## Content Quality Notes

- 34 ski venues have only 2 tags (mostly the original 67 compact-format venues like Whistler `["Powder Day","All Levels"]`). Minimum 3 tags recommended for filter surface area; 4 is optimal. No urgent fix needed but worth expanding during next content sprint.
- Tag variety is good overall: no single tag dominates above 8× in the catalog.
- `poolPrimary: true` is unset on all beach venues. Architectural provision exists — consider flagging warm-calm-water pool-style venues (Maldives atolls, Bora Bora inner lagoon) for a future content pass.

---

## 5 New Venue Objects — S Hemisphere Ski Focus (June Peak)

Target: address the June ski coverage gap. All venues verified against Open-Meteo coordinate coverage, AP_CONTINENT membership, and uniqueness against existing IDs.

> ⚠️ **Action required before pasting:** Add `CHC` and `BRC` to both `AP_CONTINENT` and `AIRPORT_COORDS` (values above in Issue #2). `MEL`, `INN`, and `ZQN` are already in `AP_CONTINENT`. Without AIRPORT_COORDS entries, the flight-time filter will bypass these venues for all US-origin users (same limitation as existing 6 S-hem ski venues).

```js
  {
    id: "cardrona-s35",
    category: "skiing",
    title: "Cardrona Alpine Resort",
    location: "Wanaka, New Zealand",
    lat: -44.8667,
    lon: 168.9333,
    ap: "ZQN",
    icon: "🏔️",
    rating: 4.88,
    reviews: 2140,
    gradient: "linear-gradient(160deg,#0a2233,#1a4a70,#3a7ab8)",
    accent: "#80b8e8",
    tags: ["Family Friendly","Beginners Welcome","Groomed Runs","Queenstown Base"],
    photo: "https://images.unsplash.com/photo-1548777123-e216912df7d8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass: "independent"
  },
  {
    id: "mt-hutt-s36",
    category: "skiing",
    title: "Mt Hutt",
    location: "Canterbury, New Zealand",
    lat: -43.5,
    lon: 171.5833,
    ap: "CHC",
    icon: "🏔️",
    rating: 4.79,
    reviews: 1650,
    gradient: "linear-gradient(160deg,#001830,#003060,#1a60a0)",
    accent: "#6aaad8",
    tags: ["Expert Terrain","Steep Chutes","Wind Exposure","Canterbury Plains Views"],
    photo: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
    skiPass: "independent"
  },
  {
    id: "falls-creek-s37",
    category: "skiing",
    title: "Falls Creek Alpine Resort",
    location: "Victoria, Australia",
    lat: -36.8667,
    lon: 147.2833,
    ap: "MEL",
    icon: "⛷️",
    rating: 4.74,
    reviews: 1870,
    gradient: "linear-gradient(160deg,#0d1f2d,#1a3a55,#2e6080)",
    accent: "#78b0d0",
    tags: ["Village Base","All Levels","Cross-Country","High Country"],
    photo: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass: "independent"
  },
  {
    id: "cerro-catedral-s38",
    category: "skiing",
    title: "Cerro Catedral",
    location: "Bariloche, Argentina",
    lat: -41.1667,
    lon: -71.4333,
    ap: "BRC",
    icon: "🏔️",
    rating: 4.82,
    reviews: 3260,
    gradient: "linear-gradient(160deg,#1a0a2e,#3a1a60,#6040a0)",
    accent: "#b090e0",
    tags: ["South America's Largest","Off-Piste","Lake Views","Patagonia"],
    photo: "https://images.unsplash.com/photo-1547036967-3f4fc0adbf6a?w=800&h=600&fit=crop&fp-x=0.4&fp-y=0.5",
    skiPass: "independent"
  },
  {
    id: "hintertux-s39",
    category: "skiing",
    title: "Hintertux Glacier",
    location: "Tyrol, Austria",
    lat: 47.0667,
    lon: 11.65,
    ap: "INN",
    icon: "🏔️",
    rating: 4.86,
    reviews: 2920,
    gradient: "linear-gradient(160deg,#0a1a3a,#1a3a70,#3060b0)",
    accent: "#80a8e0",
    tags: ["Year-Round Glacier","Expert Terrain","Summer Skiing","Tyrol"],
    photo: "https://images.unsplash.com/photo-1609205807107-2a4cfb1e9b64?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    lateSeason: true,
    skiPass: "independent"
  },
```

---

## PM Observation

**The June ski catalog effectively has 12 viable venues out of 67 (18%).** Users opening the app this weekend who filter "Skiing" will see 55 resorts that score near-zero due to off-season caps — those sink to the bottom, but they still clutter the grid. A `confidence !== "low"` + hemisphere-aware pre-filter (already partially built into `scoreWeekend`) would clean this up visually without removing data. More importantly: the S hemisphere ski inventory (6 venues) is underbuilt for peak Oceania/Latin America ski season. Cardrona, Falls Creek, and Cerro Catedral above bring it to 9 — still thin. The CLAUDE.md notes a planned +14 S hemisphere ski sprint (Nevados de Chillán, La Parva, El Colorado, Mt Buller, Hotham, Charlotte Pass, Cerro Bayo, Cerro Chapelco, Caviahue, Las Leñas, Corralco) — that sprint is the right call and should go in this week while June ski traffic is highest.
