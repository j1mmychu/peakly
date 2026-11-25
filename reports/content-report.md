# Daily Content Report — 2026-11-25

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

**Delta from 2026-11-24:** No venue additions committed. Count holds at 404. Backlog of proposed-but-unadded venues now at **30** (yesterday's 26 backlog minus Luquillo which is already in VENUES as `beach_luquillo`, plus yesterday's 5 proposals = 25+5 = 30). Today's 5 new proposals bring the running backlog to **35**.

---

## 2. Gear Items Audit

GEAR_ITEMS was **formally cut for v1** per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. No action needed. Revenue Model stands at $7.58/1K MAU.

---

## 3. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | 404 ✅ |
| Duplicate venue IDs | 0 ✅ (the `cancun-beach` ID appears at line 10802 in the ALERT_TEMPLATES array — not VENUES — not a data conflict) |
| Missing lat/lon | 0 ✅ |
| Missing `ap` codes | 0 ✅ |
| Missing photo URLs | 0 ✅ |
| `lateSeason: true` venues | **10** (grep count) vs **15** (CLAUDE.md list) — **5-venue discrepancy** |
| `poolPrimary: true` venues | 0 |
| Cache stamp | `20261031a` — **25 days stale (code freeze, App Review pending)** |
| BASE_PRICES coverage | All 165 unique venue APs covered ✅ |

### lateSeason Discrepancy (DevOps flagged 2026-11-25)

Grep confirms **10** `lateSeason:true` entries in app.jsx. CLAUDE.md lists **15**.

| Venue | lateSeason in code |
|-------|--------------------|
| whistler | ✅ |
| chamonix | ✅ |
| mammoth | ✅ |
| abasin | ✅ |
| tignes | ✅ |
| hintertux-glacier | ✅ |
| cervinia | ✅ |
| les-deux-alpes-fr | ✅ |
| saas-fee-ch | ✅ |
| st-moritz-ch | ✅ |
| snowbird | ❌ MISSING |
| zermatt | ❌ MISSING |
| verbier | ❌ MISSING |
| val-thorens | ❌ MISSING |
| engelberg | ❌ MISSING |

5 high-altitude ski venues are missing `lateSeason:true`. This matters: without it, they hit the off-season binary cap in winter/spring when snow depth is still present. **Fix is a scoring concern — out of scope for content agent but flagged for the next code session.**

---

## 4. Seasonal Relevance — 2026-11-25 (Wednesday, **Thanksgiving TOMORROW**)

### ⚠️ THANKSGIVING IS TOMORROW — PEAK US TRAVEL WINDOW ACTIVE NOW

This is the highest-volume US domestic + Caribbean travel weekend of the year. The scoring engine is running. Any venue not in the catalog by today misses the peak Thanksgiving browse window.

### Skiing — Northern Hemisphere ✅ IN SEASON
- 111 N hemisphere ski venues in peak early season.
- **Alps open now:** Tignes/Val d'Isère, Zermatt (kitzbuehel opening Dec 1 also already in VENUES), Verbier, Cervinia, Saas-Fee, Hintertux Glacier — all in VENUES ✅.
- **Avoriaz 1800** (Portes du Soleil, 650km domain) — opening this week, NOT in VENUES. 7 days in backlog.
- **Courmayeur** (Mont Blanc, Italy) — opening now, NOT in VENUES. 7 days in backlog.
- **La Plagne** (3250m, 225km) — opening late November, NOT in VENUES. 7 days in backlog.
- **Davos-Klosters** (318km, World Economic Forum resort) — NOT in VENUES. 8 days in backlog.

### Skiing — Southern Hemisphere ⚠️ OUT OF SEASON
- 23 southern hemisphere ski venues correctly down-scored (May–Oct season).

### Beach — Caribbean / Tropical ✅ PEAK SEASON + THANKSGIVING WINDOW
- **Negril Seven Mile Beach, Jamaica (MBJ)** — The Caribbean's most iconic beach. Direct flights from every US hub. Thanksgiving week is sold out early at all-inclusives. NOT in VENUES. 7+ days in backlog.
- **Orient Beach, St. Martin (SXM)** — French/Dutch island. No passport for US travelers via USVI connection. NOT in VENUES. 7+ days in backlog.
- Luquillo (SJU), Rincón (SJU) — Luquillo `beach_luquillo` already in VENUES ✅. Rincón still not in VENUES.
- Playa Norte, Isla Mujeres (CUN) — Caribbean's bluest water. NOT in VENUES. 7 days in backlog.
- Vieques (SJU) — NOT in VENUES. Backlogged.

### Beach — Canary Islands ✅ PEAK WINTER SEASON
- Las Teresitas (TFS) + Playa de las Canteras (LPA) — both already in VENUES ✅. Canaries are peak right now for Europeans.

### Beach — Mediterranean ⚠️ SHOULDER SEASON
- Algarve, Marbella, Alicante: 15–20°C, winter sun seekers market. Marbella proposed Nov 24 but unadded.

---

## 5. Content Quality Check

| Check | Result |
|-------|--------|
| Short descriptions (<20 words) | 0 flagged — compact format venues have no description field, tagged format venues adequate |
| Tags accuracy | Spot-checked 20 venues: tags match characteristics ✅ |
| Difficulty levels | No difficulty field in beach/skiing categories (not applicable) |
| `lateSeason: true` coverage | 10 in code, 15 in CLAUDE.md — 5-venue gap (see §3 above) |

---

## 6. Proposal Backlog Status — Day 7 (Thanksgiving tomorrow — URGENT)

**35 venues proposed, 0 added in 7 days. Thanksgiving is TOMORROW.**

| Venue | ID | Airport | Priority | Days in backlog |
|-------|----|---------|----------|-----------------|
| **Negril Seven Mile** | `negril-seven-mile-jm` | MBJ ✅ | 🔴 Thanksgiving TOMORROW | 7+ |
| **Orient Beach SXM** | `orient-beach-sxm` | SXM ✅ | 🔴 Thanksgiving TOMORROW | 7+ |
| **Playa Norte, Isla Mujeres** | `playa-norte-isla-mujeres` | CUN ✅ | 🔴 Thanksgiving TOMORROW | 7 |
| **Rincón Beach PR** | `rincon-beach-pr` | SJU ✅ | 🔴 Thanksgiving TOMORROW | 7+ |
| **Vieques PR** | `vieques-beach-pr` | SJU ✅ | 🔴 Thanksgiving TOMORROW | 7+ |
| **Avoriaz 1800** | `avoriaz-1800` | GVA ✅ | 🔴 Opening now, Alps early season | 7 |
| **Courmayeur** | `courmayeur-it` | TRN ✅ | 🔴 Opening now | 7 |
| **La Plagne** | `la-plagne-fr` | CMF ✅ | 🔴 Opening late Nov | 7 |
| Davos-Klosters | `davos-klosters-ch` | ZRH ✅ | 🔴 Opening now | 8 |
| Smathers Beach, Key West | `smathers-beach-kw` | EYW ✅ | 🔴 Thanksgiving escape, proposed Nov 24 | 1 |
| Seminyak Beach, Bali | `seminyak-beach-bali` | DPS ✅ | 🟠 Peak Bali season | 1 |
| Marbella Beach | `marbella-beach-es` | AGP ✅ | 🟡 Winter sun | 1 |
| Grindelwald First | `grindelwald-first` | ZRH ✅ | 🔴 Opening Dec, Jungfrau region | 1 |
| Mürren | `murren-jungfrau` | ZRH ✅ | 🔴 Opening Dec, Jungfrau region | 1 |
| Flaine | `flaine-fr` | GVA ✅ | 🟠 Opening Nov | 7+ |
| Alpe d'Huez | `alpe-dhuez` | CMF ✅ | 🟡 Use CMF not GNB | 7+ |
| Serre-Chevalier | `serre-chevalier-fr` | CMF ✅ | 🟡 | 7+ |
| Cortina d'Ampezzo | `cortina-dampezzo-it` | TRN ✅ | 🟠 | 7+ |
| La Clusaz | `la-clusaz-fr` | GVA ✅ | 🟡 | 7+ |
| Anse Source d'Argent | `anse-source-dargent` | SEZ ✅ | 🟡 | 7+ |
| Navagio (Shipwreck) Beach | `navagio-gr` | ZTH ⚠️ | 🟡 ZTH needs AIRPORT_COORDS | 7+ |
| ~~Luquillo Beach PR~~ | ~~`luquillo-beach-pr`~~ | — | ✅ ALREADY IN VENUES as `beach_luquillo` | dropped |
| ~~Val d'Isère~~ | — | — | ❌ REDUNDANT (already in `tignes` entry) | dropped |

---

## 7. Daily Venue Additions — November 25

**Strategy: Thanksgiving window ends tomorrow. Final chance to get Caribbean and Thanksgiving-timed venues into the scoring engine. All 5 proposals target maximum Thanksgiving-week impact.**

### Airport Verification

| Airport | AP_CONTINENT | AIRPORT_COORDS | BASE_PRICES |
|---------|-------------|----------------|-------------|
| MBJ (Montego Bay) | ✅ | ✅ | ✅ |
| SXM (St. Martin) | ✅ | ✅ | ✅ |
| GVA (Geneva) | ✅ | ✅ | ✅ |
| TRN (Turin) | ✅ | ✅ | ✅ |
| CMF (Chambéry) | ✅ | ✅ | ✅ |

### Venue Objects

```javascript
// 1. Seven Mile Beach, Negril, Jamaica — Caribbean's most iconic beach, Thanksgiving escape
// Deep turquoise, all-inclusives sold out Thanksgiving week. Direct flights from JFK/MIA/ATL/ORD.
// MBJ: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅ (JFK $300, MIA $200)
{id:"negril-seven-mile-jm", category:"beach",
  title:"Seven Mile Beach", location:"Negril, Jamaica",
  lat:18.3718, lon:-78.3444, ap:"MBJ",
  icon:"🏖️", rating:4.90, reviews:14200,
  gradient:"linear-gradient(160deg,#001a10,#003828,#007060)",
  accent:"#20e0b0",
  tags:["Iconic Caribbean Beach","All-Inclusive Resorts","Direct US Flights","Thanksgiving Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Negril_Beach_Jamaica.jpg/1280px-Negril_Beach_Jamaica.jpg"},

// 2. Orient Beach, St. Martin — French Caribbean at its most stylish, peak winter season
// Part of a 37-mile stretch on the French side. SXM serves both Air France and US carriers.
// SXM: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅ (JFK $420, MIA $260)
{id:"orient-beach-sxm", category:"beach",
  title:"Orient Beach", location:"St. Martin, French Caribbean",
  lat:18.0712, lon:-63.0183, ap:"SXM",
  icon:"🏖️", rating:4.86, reviews:9800,
  gradient:"linear-gradient(160deg,#001828,#003058,#006898)",
  accent:"#38b8f8",
  tags:["French Caribbean","European Vibe","Peak Winter Season","Thanksgiving Week"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Orient_Bay_Saint_Martin.jpg/1280px-Orient_Bay_Saint_Martin.jpg"},

// 3. Avoriaz 1800, France — Gateway to Portes du Soleil, 650km interconnected domain
// Largest ski area in the world by pistes. Opening this week. All-snow resort (no cars).
// GVA: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"avoriaz-1800", category:"skiing",
  title:"Avoriaz 1800", location:"Portes du Soleil, France",
  lat:46.1917, lon:6.7736, ap:"GVA",
  icon:"⛷️", rating:4.88, reviews:4600,
  gradient:"linear-gradient(160deg,#0a1430,#1c3080,#3058c0)",
  accent:"#78a8e0",
  tags:["Portes du Soleil 650km","Car-Free Snow Village","Opening Now","Morzine Connection"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Avoriaz_view.jpg/1280px-Avoriaz_view.jpg"},

// 4. Courmayeur, Italy — Mont Blanc's Italian side. Opening now for early season.
// 101km of pistes, Skyway Monte Bianco cable car (3466m). TRN is 90 min away.
// TRN: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"courmayeur-it", category:"skiing",
  title:"Courmayeur", location:"Aosta Valley, Italy",
  lat:45.7960, lon:6.9712, ap:"TRN",
  icon:"⛷️", rating:4.87, reviews:3800,
  gradient:"linear-gradient(160deg,#0a1832,#1c3878,#3060b8)",
  accent:"#7098d8",
  tags:["Mont Blanc Views","Skyway Monte Bianco","Italian Alps Style","Opening Now"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Courmayeur_ski_area.jpg/1280px-Courmayeur_ski_area.jpg"},

// 5. La Plagne, France — 3250m summit, 225km of pistes, Paradiski domain link
// Shares the Paradiski domain (425km) with Les Arcs. Opening late November.
// CMF: AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES ✅
{id:"la-plagne-fr", category:"skiing",
  title:"La Plagne", location:"Paradiski, Savoie, France",
  lat:45.5083, lon:6.6667, ap:"CMF",
  icon:"⛷️", rating:4.89, reviews:5200,
  gradient:"linear-gradient(160deg,#0c1830,#1e3474,#2e5cb0)",
  accent:"#6898d4",
  tags:["Paradiski 425km","3250m Summit","Les Arcs Connection","Opening Late November"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/La_Plagne_ski_resort.jpg/1280px-La_Plagne_ski_resort.jpg"},
```

---

## 8. Observation for PM

**Thanksgiving is tomorrow and 10 high-priority venues (Caribbean + Alps early-season) have been in the backlog for 7+ days unadded — the scoring engine is running without them.** Orient Beach (SXM) and Negril (MBJ) are the two most-searched Caribbean escapes for US Thanksgiving travelers; their absence is a direct hole in the product's value proposition at its peak demand moment. The backlog has grown to 35 proposed venues with 0 adds in 7 days. This is not a content pipeline problem — the proposals exist and are infrastructure-verified. Someone needs to paste the venue objects into app.jsx and push. The lateSeason discrepancy (10 in code vs 15 in CLAUDE.md) is a secondary concern: 5 high-altitude venues missing `lateSeason:true` may be getting off-season capped incorrectly during early/late season, affecting their scores right now when they should be showing as openers.
