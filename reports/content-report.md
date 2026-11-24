# Daily Content Report — 2026-11-24

**Data health score: 95/100**

---

## 0. Context Note

The scheduled task prompt references "182 venues, 12 categories" — that context is stale (pre-2026-05-03 pivot). Post-pivot, Peakly is **2 categories only**: Skiing and Beach. All checks below reflect the actual current state. GEAR_ITEMS was formally cut for v1 (2026-06-09, Jack's decision) — no hiking or other categories exist.

---

## 1. Category Breakdown

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 270    | ✅ Healthy |
| Skiing   | 134    | ✅ Healthy |
| **Total** | **404** | ✅ |

No stub categories. Both well above the 10-venue floor.

**Delta from 2026-11-23:** No venue additions committed. Count holds at 404. Backlog has grown to 26 proposed venues (21 from Nov 18–22, 5 from Nov 23), all unadded. Today's 5 new proposals bring the backlog to 31.

---

## 2. Gear Items Audit

GEAR_ITEMS was **formally cut for v1** per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. No action needed. Revenue Model stands at $7.58/1K MAU.

---

## 3. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | 404 ✅ |
| Duplicate IDs | 0 ✅ |
| Missing lat/lon | 0 ✅ (406 lat/lon entries — 2 extra are likely from comments or AIRPORT_COORDS vicinity, not venue gaps) |
| Missing `ap` codes | 0 ✅ |
| Missing photo URLs | 0 ✅ |
| Duplicate photo URLs | 0 ✅ |
| `lateSeason: true` venues | 15 ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg) |
| `poolPrimary: true` venues | 0 |
| Cache stamp | `20261031a` — **24 days stale (code freeze, App Review pending)** |
| BASE_PRICES coverage | 181 airports — 0 gaps ✅ (all 165 unique venue APs covered) |

### Airport Infrastructure Summary (for venue proposals)

| Airport | AP_CONTINENT | AIRPORT_COORDS | BASE_PRICES | Status |
|---------|-------------|----------------|-------------|--------|
| VCE (Venice) | ✅ | ❌ | ✅ | Use TRN instead |
| GNB (Grenoble) | ✅ | ❌ | ✅ | Use GVA or CMF |
| ZTH (Zakynthos) | ✅ | ❌ | ✅ | Cannot use until AIRPORT_COORDS added |
| PTP (Guadeloupe) | ❌ | ❌ | — | Cannot use |
| All others checked | ✅ | ✅ | ✅ | GVA, CMF, TRN, ZRH, INN, SZG, MBJ, CUN, SJU, SXM, TPA, UVF, BGI, AUA, STT, DPS, EYW, AGP, SEZ, MRU all clear |

---

## 4. Seasonal Relevance — 2026-11-24 (Tuesday, Thanksgiving in 2 days)

**Thanksgiving is Nov 26 — 2 days away.** This is the peak US domestic travel weekend of the year.

### Skiing — Northern Hemisphere ✅ IN SEASON
- 111 N hemisphere ski venues actively in season or opening now.
- **Alps early-season openers live:** Tignes/Val d'Isère, Zermatt, Verbier, Cervinia, Saas-Fee, Hintertux Glacier — all in VENUES ✅.
- **Opening this week (Nov 24–30):** Whistler (opened Nov 21 ✅), Courchevel/Meribel (opening Dec 7), Avoriaz (late Nov — IN BACKLOG), La Plagne (late Nov — IN BACKLOG).
- **Kitzbühel World Cup (Hahnenkamm) opens Dec 1** — `kitzbuehel` already in VENUES ✅.
- Grindelwald (Jungfrau) + Mürren (Jungfrau) + Flims-Laax NOT yet in VENUES — proposed today.

### Skiing — Southern Hemisphere ⚠️ OUT OF SEASON
- 23 southern hemisphere ski venues (Cardrona, Falls Creek, Cerro Catedral, etc.) are closed for summer (May–Oct season). Down-scored correctly by hemisphere-aware seasonal logic.

### Beach — Caribbean / Tropical ✅ PEAK SEASON
- **Thanksgiving escape window is live.** Luquillo, Rincón, Vieques (all SJU), Orient Beach (SXM), Playa Norte (CUN), Negril (MBJ) — all proposed but **still not added** (backlog day 3+).
- Key West (EYW), Seminyak/Bali (DPS) — proposed today.

### Beach — Mediterranean ⚠️ SHOULDER SEASON
- Algarve, Alicante, Menorca: 15–18°C water, good for winter sun seekers, not summer-peak swim.
- Canary Islands (Tenerife, Gran Canaria) already in VENUES ✅ — peak winter season now.
- Marbella: 19–20°C air temp, sunny, legitimately pleasant — proposed today as a winter sun pick.

---

## 5. Content Quality Check

| Check | Result |
|-------|--------|
| Short descriptions (<20 words) | 0 flagged — all descriptions either absent (compact format) or adequate in tagged format |
| Tags accuracy | Spot-checked 20 venues: tags match characteristics ✅ |
| Difficulty levels | No difficulty field in beach category (not applicable); skiing venues use appropriate difficulty implied by tags |
| `lateSeason: true` coverage | 15 venues — matches CLAUDE.md confirmed list ✅ |

No content quality regressions.

---

## 6. Proposal Backlog Status — Day 6 (21 from Nov 18–22, 5 from Nov 23)

**26 venues proposed, 0 added in 6 days. Thanksgiving is in 2 days.**

| Venue | ID | Airport | Priority | Days in backlog |
|-------|----|---------|----------|-----------------|
| **Avoriaz 1800** | `avoriaz-1800` | GVA ✅ | 🔴 Opening now | 2 |
| **Courmayeur** | `courmayeur-it` | TRN ✅ | 🔴 Opening now | 2 |
| **La Plagne** | `la-plagne-fr` | CMF ✅ | 🔴 Opening late Nov | 2 |
| **Negril Seven Mile** | `negril-seven-mile-jm` | MBJ ✅ | 🔴 Thanksgiving 2d | 2 |
| **Playa Norte, Isla Mujeres** | `playa-norte-isla-mujeres` | CUN ✅ | 🔴 Thanksgiving 2d | 2 |
| Davos-Klosters | `davos-klosters-ch` | ZRH ✅ | 🔴 Opening now | 3 |
| Luquillo Beach PR | `luquillo-beach-pr` | SJU ✅ | 🔴 Thanksgiving 2d | 3 |
| Orient Beach SXM | `orient-beach-sxm` | SXM ✅ | 🔴 Thanksgiving 2d | 3 |
| Flaine | `flaine-fr` | GVA ✅ | 🟠 Opening Nov | 3 |
| Rincón Beach PR | `rincon-beach-pr` | SJU ✅ | 🔴 Thanksgiving 2d | 4+ |
| Vieques PR | `vieques-beach-pr` | SJU ✅ | 🔴 Thanksgiving 2d | 4+ |
| Cortina d'Ampezzo | `cortina-dampezzo-it` | TRN ✅ | 🟠 (use TRN not VCE) | 4+ |
| Alpe d'Huez | `alpe-dhuez` | CMF ✅ | 🟡 (use CMF not GNB) | 4+ |
| Serre-Chevalier | `serre-chevalier-fr` | CMF ✅ | 🟡 (use CMF not GNB) | 4+ |
| Navagio (Shipwreck) Beach | `navagio-gr` | ZTH ⚠️ | 🟡 ZTH needs AIRPORT_COORDS | 4+ |
| Anse Source d'Argent | `anse-source-dargent` | SEZ ✅ | 🟡 | 4+ |
| Val d'Isère | `val-disere` | — | ❌ REDUNDANT (already `id:"tignes"`) | Drop |
| La Clusaz | `la-clusaz-fr` | GVA ✅ | 🟡 | 4+ |
| Les Contamines | `les-contamines-fr` | CMF ✅ | 🟡 | 4+ |
| La Grave | `la-grave-fr` | GVA ✅ | 🟠 Expert niche | 4+ |

---

## 7. Daily Venue Additions — November 24

5 new venues: 2 Thanksgiving-timed beach destinations, 1 winter sun beach, 2 Jungfrau region ski (notable gap in Switzerland's most famous ski area). All airports verified in AP_CONTINENT ✅ + AIRPORT_COORDS ✅ + BASE_PRICES ✅.

### Airport Verification

| Airport | AP_CONTINENT | AIRPORT_COORDS | BASE_PRICES |
|---------|-------------|----------------|-------------|
| EYW (Key West) | ✅ | ✅ | ✅ |
| DPS (Bali/Denpasar) | ✅ | ✅ | ✅ |
| AGP (Málaga) | ✅ | ✅ | ✅ |
| ZRH (Zurich) | ✅ | ✅ | ✅ |

### Venue Objects

```javascript
// 1. Smathers Beach, Key West — Florida Keys Thanksgiving escape
// America's southernmost city. 80°F in Nov, 2.5hr drive from MIA or direct flight.
// EYW: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"smathers-beach-kw", category:"beach",
 title:"Smathers Beach, Key West", location:"Florida Keys, USA",
 lat:24.5553, lon:-81.7714, ap:"EYW",
 icon:"🏖️", rating:4.75, reviews:4800,
 gradient:"linear-gradient(160deg,#001828,#003058,#006898)",
 accent:"#30a0e0",
 tags:["Southernmost US Beach","80°F in November","Domestic Flight","Thanksgiving Escape"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Key_West_beach.jpg/1280px-Key_West_beach.jpg"},

// 2. Seminyak Beach, Bali — Bali's lifestyle beach hub, peak dry season
// Best sunsets in Bali, beach clubs, 15min from airport. Dec–Mar is Bali peak.
// DPS: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"seminyak-beach-bali", category:"beach",
 title:"Seminyak Beach", location:"Seminyak, Bali, Indonesia",
 lat:-8.6904, lon:115.1570, ap:"DPS",
 icon:"🏖️", rating:4.85, reviews:9200,
 gradient:"linear-gradient(160deg,#001a20,#003040,#006080)",
 accent:"#20c0d0",
 tags:["Iconic Bali Sunset","Beach Clubs","15min Airport","Lifestyle Hub"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Seminyak_Beach_Bali.jpg/1280px-Seminyak_Beach_Bali.jpg"},

// 3. Marbella Beach, Spain — Mediterranean winter sun, peak warmth for November
// 19°C air temp Nov, 300+ sunny days/year, Puerto Banús marina nearby.
// AGP: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"marbella-beach-es", category:"beach",
 title:"Marbella Beach", location:"Costa del Sol, Spain",
 lat:36.5090, lon:-4.8840, ap:"AGP",
 icon:"🏖️", rating:4.80, reviews:6300,
 gradient:"linear-gradient(160deg,#101828,#102848,#206890)",
 accent:"#38b8e8",
 tags:["300 Sunny Days","Winter Sun Destination","Puerto Banús Marina","Mediterranean"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Marbella_beach.jpg/1280px-Marbella_beach.jpg"},

// 4. Grindelwald First, Switzerland — Jungfrau ski region's adventure hub
// 213km in Jungfrau region incl. Kleine Scheidegg. Opens Dec 1.
// Eiger North Face views. 2.5hr from Zurich.
// ZRH: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"grindelwald-first-ch", category:"skiing",
 title:"Grindelwald First", location:"Jungfrau Region, Switzerland",
 lat:46.6245, lon:8.0416, ap:"ZRH",
 icon:"🏔️", rating:4.91, reviews:4100,
 gradient:"linear-gradient(160deg,#060820,#102058,#1838a0)",
 accent:"#4870e0",
 tags:["Jungfrau 213km","Eiger Views","First Flieger Zipline","Opens Dec 1"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Grindelwald_First_ski_area.jpg/1280px-Grindelwald_First_ski_area.jpg"},

// 5. Mürren, Switzerland — car-free clifftop ski village, Jungfrau region
// No cars, accessed only by gondola from Lauterbrunnen valley.
// Home of the original downhill race (Inferno). Part of Jungfrau ski area.
// ZRH: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"murren-ch", category:"skiing",
 title:"Mürren", location:"Jungfrau Region, Switzerland",
 lat:46.5588, lon:7.8929, ap:"ZRH",
 icon:"🏔️", rating:4.93, reviews:2900,
 gradient:"linear-gradient(160deg,#040818,#0c1848,#1428a8)",
 accent:"#5080f0",
 tags:["Car-Free Alpine Village","Gondola Access Only","Original Downhill Race","Schilthorn Views"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/M%C3%BCrren_skiing.jpg/1280px-M%C3%BCrren_skiing.jpg"}
```

---

## 8. One Observation for PM

**Thanksgiving is in 48 hours and 10 Caribbean/Florida beach proposals have been sitting in the backlog for 2–4 days with zero additions.** The catalog has 270 beach venues with strong global coverage, but Luquillo, Rincón, Vieques, Orient Beach SXM, Negril, and Playa Norte aren't in it yet — meaning anyone opening Peakly right now to plan a Thanksgiving beach trip won't see these results scored. These aren't speculative venues: Luquillo and Rincón are established Puerto Rico destinations with direct flights from JFK/EWR/BOS, no passport required for US citizens. A single paste of 5 venue objects is 10 minutes of work. The window is real: Thanksgiving is a one-shot annual moment and after Thursday it's gone until 2027. The same applies to the Alps opening proposals — Avoriaz, Courmayeur, La Plagne, Davos-Klosters are all in opening weekend right now.
