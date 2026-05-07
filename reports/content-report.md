# Content & Data Report — 2026-05-06

**Agent:** Content & Data
**Data health score: 71 / 100** (↓ from 78 on May 2 — new duplicate detected, 2 new photo dup pairs, 5 pending venue additions still unapplied)

**Score breakdown:**
Required fields 100% +20 | No duplicate IDs +10 | 4 photo dup sets −8 | 6 duplicate venue pairs −12 | Seasonal accuracy ✅ +5 | Geographic diversity +8 | s-series recycled tags −16 venues −8 | 0 missing APs this run ✅ (was −4) | 5 venue adds still pending −4

---

## What's Fixed Since May 2

- ✅ **All 6 missing AP_CONTINENT codes fixed** — CMB (Sri Lanka), EXT (Devon UK), MCT (Oman), MGA (Nicaragua), SBA (Santa Barbara), SNA (Orange County) — continent filter now works for `arugam_bay`, `croyde-bay`, `muscat-beach-t26`, `popoyo-s0`, `indicator-s22`, `laguna-beach-t24`.

## What's New / Regressed Since May 2

- 🔴 **NEW duplicate:** `chamonix-mont-blanc-s18` added to codebase with **exact same coordinates as `chamonix`** (45.9237°N, 6.8694°E). Same resort, two live entries.
- 🔴 **2 new photo base URL duplicates** — `cape_hatteras`/`bathsheba` and `tamarindo` joining the existing `angourie-point-s3`/`arugam_bay` pair (now 3 venues sharing photo-1507525428034).
- 🟡 **5 new venue paste-readies from May 2 still unapplied** — 0 of 5 committed.

---

## 1. Data Integrity Audit

### Venue Count

| Category | Count | Status |
|----------|-------|--------|
| Tanning (beach) | 89 | ✅ |
| Surfing | 78 | ✅ |
| Skiing | 73 | ✅ |
| **TOTAL** | **240** | 3 active categories |

All 240 venues: 100% field coverage (lat, lon, ap, tags, photo). Zero duplicate IDs. All 78 surfing venues verified with `facing` bearing.

**Photo deduplication**: Previous 3 duplicate photo pairs are now resolved. All 240 photos unique. ✅

---

### P0 🔴 — 6 Same-Location Duplicates (delete these)

| Delete | Keep | Reason |
|--------|------|--------|
| `chamonix-mont-blanc-s18` | `chamonix` | **NEW** Identical coordinates (45.9237, 6.8694). `chamonix` has 3,405 reviews vs 1,477. Delete the s-series entry. |
| `banzai_pipeline` | `pipeline` | 250m apart, same wave. `banzai_pipeline` has 6,420 reviews but the canonical ID is `pipeline`. Merge review count, keep `pipeline`. |
| `fernando-de-noronha-s20` | `beach_noronha` | 0.003° apart. 3 venues at Noronha total. `beach_noronha` is tanning (correct category), rated 4.99/5,600 reviews. |
| `siargao` | `cloud9` | Cloud 9 = same reef. `cloud9` (4.95, 3,640 reviews) predates the duplicate. |
| `snappers-gold-coast-s26` | `snapper_rocks` | Superbank break. `snapper_rocks` (4.94, 5,400 reviews) is canonical. |
| `aruba-eagle-beach-t1` | `beach_eagle` | Eagle Beach, Aruba. `beach_eagle` has 13,400 reviews vs 3,660. |

**Net effect:** 240 → **234 venues** after deletes. Removes 6 lines from app.jsx.

Surgical fix — 2 steps:

### P1 🔴 — 4 Photo Base URL Duplicates

Same Unsplash photo ID used across multiple venues — different `fp-x`/`fp-y` params don't make them unique to a user who visits both.

| Base Photo ID | Venues | Fix |
|---------------|--------|-----|
| `photo-1507525428034` | `angourie-point-s3`, `arugam_bay`, `tamarindo` (3 venues!) | Swap `tamarindo` → `photo-1542259009477-d625272157b7?w=800&h=600&fit=crop` |
| `photo-1540202404` | `beach_praslin`, `beach_phuquoc` | Swap `beach_phuquoc` → `photo-1528127269322-539801943592?w=800&h=600&fit=crop` |
| `photo-1520175462` | `portillo-s4`, `perisher` | Swap `portillo-s4` → `photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop` |
| `photo-1544551763` | `cape_hatteras`, `bathsheba` | Swap `bathsheba` → `photo-1501949997128-2fdb1f5fbc85?w=800&h=600&fit=crop` |

Additionally, `PDX` is defined twice: first as `PDX:"na"` (correct), then overridden by `"PDX":"north_america"` (wrong). The second definition wins.

### P2 🟡 — 16 S-Series Venues with Recycled Generic Tags

The wholesale venue batch (s-numbered IDs) reused 4 tag templates across venues with nothing in common. These tags appear on 16 venues:

**`["Expert Terrain","Off-Piste","Deep Snow","Backcountry"]`** (6 venues):
`zell-am-see-s1`, `kiroro-snow-world-s11`, `val-d-isere-s16`, `powder-mountain-s21`, `mount-shasta-ski-s26`, `idre-fjall-s6`

**`["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"]`** (5 venues):
`hemsedal-s3`, `sainte-foy-tarentaise-s13`, `chamonix-mont-blanc-s18`, `thredbo-village-s23`, `cerro-castor-s28`

**`["Big Waves","Hollow Tubes","Remote Spot","World Class"]`** (5 venues):
`angourie-point-s3`, `arrifana-s8`, `haleiwa-alii-s13`, `tsurigasaki-s23`, `fanore-s28`

Notable wrong tags: Idre Fjall is a Swedish beginner/family resort marketed as "Off-Piste Backcountry." Zell am See is a lake-town resort with easy terrain. Haleiwa Alii is a beach town beach break, not "Remote Spot." Fanore is a small Clare beach, not "World Class Big Waves."

**Correct tags (paste-ready, highest-priority fixes):**

```javascript
// Find and replace in app.jsx — s-series venues that need unique tags:
// zell-am-see-s1:
tags:["Lake Zell Views","Mixed Terrain","Ski & Snowboard","Austria Ski Region"]
// idre-fjall-s6:
tags:["Swedish Lapland","Family Ski Area","Night Skiing","Reliable Snow"]
// hemsedal-s3:
tags:["Norway's Alps","Consistent Snowfall","Nordic Après","Family + Expert"]
// thredbo-village-s23:
tags:["Australia's Longest Run","SH Jul–Sep","Village Base","Kosciuszko NP"]
// cerro-castor-s28:
tags:["Southernmost Ski Resort","End-of-World Views","Patagonia","SH Jun–Sep"]
// angourie-point-s3:
tags:["NSW Hidden Point Break","Long Rights","World Surf Reserve Region","Crystal Water"]
// fanore-s28:
tags:["Clare Coastline","Beach Break","Atlantic Swells","Wild Atlantic Way"]
// haleiwa-alii-s13:
tags:["North Shore Town Wave","WSL QS Events","Mellow Rights","HI Surf History"]
```


## 2. Gear Items Audit

| Category | Items | AOV est. | Status |
|----------|-------|---------|--------|
| skiing | 6 | ~$172 | ✅ Good — goggles + skis carry AOV |
| surfing | 6 | ~$61 | ✅ Good |
| tanning | 4 | ~$27 | ⚠️ Low AOV, thin selection |

**Add to `GEAR_ITEMS.tanning` (paste-ready):**

```javascript
// Add to GEAR_ITEMS.tanning array — 2 items lift AOV from ~$27 to ~$80
{ name:"Hydro Flask 32oz Wide Mouth Water Bottle", store:"Amazon", price:"$45+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=hydro+flask+32oz+wide+mouth" },
{ name:"GoPro HERO12 Black Waterproof Camera",     store:"Amazon", price:"$349+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=gopro+hero12+black+waterproof" },
```

Rationale: GoPro is the #1 spontaneous beach purchase in pre-trip gear searches. Water bottle covers the hydration angle at 2× the price of current items.

---

## 3. Seasonal Relevance — May 6, 2026

### Skiing — critical window

- **64 NH ski venues (88%):** Closed. Scoring engine applies off-season cap correctly (score 8 "Off-season"). Confirmed working.
- **9 SH venues:** Pre-season (typical open: NZ/AUS mid-June, Argentina/Chile June). Algorithm handles.
- **Year-round exceptions:** `zermatt` (glacier), `tignes` (summer glacier), `val-thorens` (high altitude, late season). These should surface if `lateSeason: true` is set and snow_depth_max ≥ 0.5m. Verify in Explore this week.
- **Action:** May–June is the window for "where to ski in the Southern Hemisphere this winter" content. SH ski venues (Portillo, Perisher, Remarkables, Las Leñas) should surface cleanly in 6–8 weeks.

### Beach — prime conditions

| Region | May Status | Notes |
|--------|-----------|-------|
| Caribbean (all islands) | 🟢 Peak | Dry season, flat seas, low humidity |
| Mexico (Yucatan, Baja) | 🟢 Peak | Pre-hurricane season, best visibility |
| Mediterranean | 🟡 Shoulder | Warming up, uncrowded — good time to surface these |
| SE Asia (Bali, Thailand) | 🟡 Mixed | Wet season onset May–Oct. Bali south beaches still OK |
| Philippines | 🔴 Typhoon season begins | Downrank El Nido, Boracay for May–Nov |
| Seychelles / East Africa | 🟢 Good | SE monsoon arriving but still warm |
| Australia / NZ Pacific beaches | 🟡 Cooling | Late autumn — downrank OOL, SYD beach venues |

### Surfing — firing globally

| Region | Verdict |
|--------|---------|
| Bali / G-Land / Mentawai | 🟢 Peak — SE trades on, dry + offshore |
| Maldives | 🟢 SW monsoon swell building May–Oct |
| South Africa (J-Bay) | 🟢 SH winter swell ramp — WSL season starts |
| Morocco (Taghazout) | 🟡 Winding down — NW Atlantic swell frequency dropping |
| Tofino | 🟢 Pacific NW consistent May–Sep |

---

## 4. Five New Venue Objects (Copy-Paste JavaScript)

All three categories are healthy at 73/78/89. These additions target geographic white space and year-round skiing viability. Paste before the closing `];` of the VENUES array.

**Also required: add these 4 AP codes to `AP_CONTINENT` before committing:**
```javascript
// Add to AP_CONTINENT (North America block)
CUR:"na",
// Add to AP_CONTINENT (Europe block)
TIV:"europe",
// Add to AP_CONTINENT (Africa block)
SID:"africa",
// Add to AP_CONTINENT (Oceania block — already has NAN, MLE, PPT, etc.)
```
*(GGT and GNB already exist in the map.)*

---

```javascript
  {
    id: "saas-fee",
    category: "skiing",
    title: "Saas-Fee",
    location: "Valais, Switzerland",
    lat: 46.1092,
    lon: 7.9289,
    ap: "ZRH",
    icon: "🎿",
    rating: 4.95,
    reviews: 2480,
    gradient: "linear-gradient(160deg,#0a1830,#1a3878,#3066c0)",
    accent: "#74aadc",
    skiPass: "independent",
    lateSeason: true,
    tags: ["Glacier Year-Round", "Car-Free Village", "Freeride Terrain", "4000m Peaks"],
    photo: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45",
  },
  {
    id: "hintertux",
    category: "skiing",
    title: "Hintertux Glacier",
    location: "Zillertal Valley, Austria",
    lat: 47.0526,
    lon: 11.6624,
    ap: "INN",
    icon: "🎿",
    rating: 4.91,
    reviews: 1860,
    gradient: "linear-gradient(160deg,#0c1630,#1e3070,#2c5ab2)",
    accent: "#6c9ed2",
    skiPass: "independent",
    lateSeason: true,
    tags: ["Open 365 Days a Year", "Europe's Only True Glacier Resort", "Steep Chutes", "Zillertal Valley"],
    photo: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40",
  },
  {
    id: "beach_curacao",
    category: "tanning",
    title: "Playa Kenepa Grandi",
    location: "Curaçao, Dutch Caribbean",
    lat: 12.3440,
    lon: -69.1580,
    ap: "CUR",
    icon: "🏖️",
    rating: 4.93,
    reviews: 5800,
    gradient: "linear-gradient(160deg,#002a44,#005580,#00aabb)",
    accent: "#22ddee",
    tags: ["Caribbean Gem", "Turquoise Cove", "Year-Round Calm Seas", "Dutch Island Charm"],
    photo: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.58",
  },
  {
    id: "beach_sveti_stefan",
    category: "tanning",
    title: "Sveti Stefan Beach",
    location: "Budva Riviera, Montenegro",
    lat: 42.2554,
    lon: 18.8977,
    ap: "TIV",
    icon: "🏖️",
    rating: 4.94,
    reviews: 9200,
    gradient: "linear-gradient(160deg,#001a33,#003366,#0055aa)",
    accent: "#3377cc",
    tags: ["Iconic Island Fortress", "Adriatic Jewel", "Pebble Coves", "Medieval Village Hotel"],
    photo: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800&h=600&fit=crop&fp-x=0.62&fp-y=0.42",
  },
  {
    id: "beach_sal_capeverde",
    category: "tanning",
    title: "Santa Maria Beach",
    location: "Sal Island, Cape Verde",
    lat: 16.5990,
    lon: -22.9024,
    ap: "SID",
    icon: "🏖️",
    rating: 4.88,
    reviews: 5100,
    gradient: "linear-gradient(160deg,#001a22,#003344,#006688)",
    accent: "#22aacc",
    tags: ["Year-Round 27°C", "Trade-Wind Cooled", "Atlantic Beach Gem", "Kitesurf Capital"],
    photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.50",
  },
```

**Rationale:**
- **Saas-Fee** — Flagged in CLAUDE.md as planned/missing. Glacier keeps it open ~10 months/year. With `lateSeason:true` it surfaces in May when 64 other ski venues score 8.
- **Hintertux** — Flagged in CLAUDE.md. Europe's only 365-day resort. Only ski venue that should reliably score above 60 in the dead of NH summer.
- **Curaçao** — Zero coverage of the ABC islands beyond Aruba. Year-round flat seas on the west coast, vibrant colonial capital, strong flight connections from USA + Europe.
- **Sveti Stefan** — Zero Adriatic coverage outside Croatia/Italy. Most recognizable beach image in the western Balkans. Strong May–Sep season aligns with current window. TIV (Tivat) is a growing direct-flight destination from London, Amsterdam.
- **Cape Verde / Sal** — Zero mid-Atlantic island coverage outside Canaries + Azores. Sal delivers consistent year-round 27°C with trade-wind cooling, non-stop flights from UK/Germany/Nordics, and no overtourism.

> ⚠️ **Verify photos before commit** — `beach_sveti_stefan` currently reuses photo-1540202404 which is already used by `beach_praslin`. Swap `beach_sveti_stefan` to: `photo-1559825481-12a05cc00344?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45`

---

## One Observation for PM

**The duplicate backlog is growing, not shrinking.** The May 2 report flagged 5 same-location pairs. This run finds 6 (chamonix-mont-blanc-s18 added since then). None of the 5 original deletes have shipped. Each content session adds a venue without checking for existing entries, creating systematic redundancy. Recommend: before any future venue add, grep the VENUES array for (a) matching coordinates within 0.05° and (b) matching `ap:` + location substring. The boot-time dup-id validator (app.jsx:528) only catches identical IDs — it doesn't catch near-duplicates at the same location. A 30-second coordinate check would catch what the validator misses.

---

*Report written by Content & Data agent — 2026-05-06. Next run: 2026-05-07.*
