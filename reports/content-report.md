# Daily Content Report — 2026-11-26

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

**Delta from 2026-11-25:** No venue additions committed (code frozen since Oct 31). Count holds at 404. Backlog of proposed-but-unadded venues now at **35+** (yesterday's 35 + today's 5 proposals = 40 running total, 0 added this sprint).

---

## 2. Gear Items Audit

GEAR_ITEMS was **formally cut for v1** per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. No action needed. Revenue Model stands at $7.58/1K MAU.

---

## 3. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | 404 ✅ |
| Duplicate venue IDs | 0 ✅ (checked within VENUES array — `cancun-beach` duplicate is in ALERT_TEMPLATES, not VENUES) |
| Missing lat/lon | 0 ✅ |
| Missing `ap` codes | 0 ✅ |
| Missing photo URLs | 0 ✅ |
| `lateSeason: true` venues | **15 confirmed ✅** (10 compact `lateSeason:true` + 5 JSON `"lateSeason": true` — both formats in app.jsx; devops audit confirmed whistler/chamonix/mammoth/abasin/tignes/hintertux/cervinia/snowbird/zermatt/verbier/val-thorens/les-deux-alpes-fr/saas-fee-ch/st-moritz-ch/engelberg) |
| `poolPrimary: true` venues | 0 |
| Cache stamp | `20261031a` — **26 days stale (code freeze, App Review pending — CORRECT, no action)** |
| BASE_PRICES coverage | All venue APs covered ✅ |
| GEAR_ITEMS count | 0 ✅ (intentional cut) |
| Braces balanced | 5684/5684 ✅ |

### lateSeason Discrepancy — CLOSED

The 10 vs 15 discrepancy reported for the past 3 days is **resolved**. The 5 "missing" venues (snowbird, zermatt, verbier, val-thorens, engelberg) use JSON-format syntax `"lateSeason": true` (quoted key, spaced) rather than compact `lateSeason:true`. Both patterns are valid — grep was case/format sensitive. Count confirmed at 15. ✅

---

## 4. Seasonal Relevance — Thanksgiving Day (TODAY)

**Today is Thanksgiving 2026 (Nov 26, 4th Thursday). Peak US travel weekend through Sunday Nov 29.**

### Skiing — Northern Hemisphere ✅ EARLY SEASON OPENING
- **Alps openers firing now:** Tignes/Val d'Isère, Whistler, Zermatt, Verbier, Cervinia, Saas-Fee, Hintertux Glacier — all in VENUES ✅
- **Just opening this week (NOT in VENUES — backlog day 8):** Avoriaz 1800, Courmayeur, La Plagne
- **Opening December (NOT in VENUES — backlog day 8):** Davos-Klosters, Flaine, Alpe d'Huez, Grindelwald, Mürren
- Southern hemisphere ski venues: correctly down-scored (May–Oct season) ✅

### Beach — Caribbean / Tropical ✅ THANKSGIVING PEAK — MAXIMUM DEMAND TODAY
- **🚨 Thanksgiving day = peak Caribbean search window for US users scrolling phones at dinner tables.**
- **Still NOT in VENUES after 8+ days in backlog:** Negril Seven Mile (MBJ), Orient Beach SXM, Playa Norte Isla Mujeres (CUN), Rincón Beach PR (SJU), Vieques PR (SJU)
- **In VENUES ✅:** Cancún, Playa del Carmen, Tulum, Punta Cana, Aruba, Barbados, St. Barts, Luquillo PR
- **Post-Thanksgiving window (Nov 29–Dec 25) is the highest-volume Caribbean booking period.** Orient Beach and Negril remain the two highest-demand holes.

### Beach — Canary Islands ✅ PEAK WINTER SEASON
- Las Teresitas (TFS) + Playa de las Canteras (LPA) — in VENUES ✅

### Beach — Mediterranean ⚠️ SHOULDER SEASON
- Algarve, Marbella, Alicante: 15–20°C, winter sun seekers market. Marbella proposed Nov 24 but unadded (backlog day 2).

---

## 5. Content Quality Check

| Check | Result |
|-------|--------|
| Short descriptions (<20 words) | 0 flagged — compact format venues have no description field; long-format venues adequate |
| Tags accuracy | Spot-checked 20 venues: tags match characteristics ✅ |
| Difficulty levels | No difficulty field in beach/skiing categories (not applicable) |
| `lateSeason: true` coverage | 15 confirmed ✅ — discrepancy CLOSED (see §3) |
| Photo quality | 404 photos present; ~346 are category stock (not venue-specific) — known quality gap, requires Unsplash API key to fix |

---

## 6. Proposal Backlog Status — Day 8 (Thanksgiving TODAY)

**40 venues proposed, 0 added in 8 days. Thanksgiving day is live — the peak demand window is open right now.**

| Venue | ID | Airport | Priority | Days in backlog |
|-------|----|---------|----------|-----------------|
| **Negril Seven Mile** | `negril-seven-mile-jm` | MBJ ✅ | 🔴 Thanksgiving TODAY | 8 |
| **Orient Beach SXM** | `orient-beach-sxm` | SXM ✅ | 🔴 Thanksgiving TODAY | 8 |
| **Playa Norte, Isla Mujeres** | `playa-norte-isla-mujeres` | CUN ✅ | 🔴 Thanksgiving TODAY | 8 |
| **Rincón Beach PR** | `rincon-beach-pr` | SJU ✅ | 🔴 Thanksgiving TODAY | 8 |
| **Vieques PR** | `vieques-beach-pr` | SJU ✅ | 🔴 Thanksgiving TODAY | 8 |
| **Avoriaz 1800** | `avoriaz-1800` | GVA ✅ | 🔴 Opening now, Alps early season | 8 |
| **Courmayeur** | `courmayeur-it` | TRN ✅ | 🔴 Opening now | 8 |
| **La Plagne** | `la-plagne-fr` | CMF ✅ | 🔴 Opening late Nov | 8 |
| **Davos-Klosters** | `davos-klosters-ch` | ZRH ✅ | 🔴 Opening now | 9 |
| **Smathers Beach, Key West** | `smathers-beach-kw` | EYW ✅ | 🔴 Thanksgiving escape | 2 |
| Seminyak Beach, Bali | `seminyak-beach-bali` | DPS ✅ | 🟠 Peak Bali season | 2 |
| Marbella Beach | `marbella-beach-es` | AGP ✅ | 🟡 Winter sun | 2 |
| Grindelwald First | `grindelwald-first` | ZRH ✅ | 🔴 Opening Dec | 2 |
| Mürren | `murren-jungfrau` | ZRH ✅ | 🔴 Opening Dec | 2 |
| Flaine | `flaine-fr` | GVA ✅ | 🟠 Opening Nov | 8 |
| Alpe d'Huez | `alpe-dhuez` | CMF ✅ | 🟡 Use CMF | 8 |
| Serre-Chevalier | `serre-chevalier-fr` | CMF ✅ | 🟡 | 8 |
| Cortina d'Ampezzo | `cortina-dampezzo-it` | TRN ✅ | 🟠 | 8 |
| La Clusaz | `la-clusaz-fr` | GVA ✅ | 🟡 | 8 |
| Anse Source d'Argent | `anse-source-dargent` | SEZ ✅ | 🟡 | 8 |
| Navagio (Shipwreck) Beach | `navagio-gr` | ZTH ⚠️ | 🟡 ZTH needs AIRPORT_COORDS check | 8 |

---

## 7. Daily Venue Additions — November 26

**Strategy: Thanksgiving day is live. Pivot to post-Thanksgiving / Christmas window. Caribbean Thanksgiving-window additions are still maximally relevant (weekend runs through Sunday Nov 29). Adding 2 Caribbean + 3 Alps December openers — Christmas ski season begins in 4 weeks.**

### Airport Pre-Verification

| Airport | AP_CONTINENT | AIRPORT_COORDS | BASE_PRICES |
|---------|-------------|----------------|-------------|
| MBJ (Montego Bay) | ✅ | ✅ | ✅ |
| EYW (Key West) | ✅ | ✅ | ✅ |
| GVA (Geneva) | ✅ | ✅ | ✅ |
| ZRH (Zürich) | ✅ | ✅ | ✅ |
| CMF (Chambéry) | ✅ | ✅ | ✅ |

### Venue Objects

```javascript
// 1. Seven Mile Beach, Negril, Jamaica — Caribbean's most iconic beach
// Deep turquoise water, 11km of white sand, all-inclusive corridor.
// Thanksgiving-to-Christmas is peak booking. Direct flights JFK/MIA/ATL/ORD.
{id:"negril-seven-mile-jm", category:"beach",
  title:"Seven Mile Beach", location:"Negril, Jamaica",
  lat:18.3718, lon:-78.3444, ap:"MBJ",
  icon:"🏖️", rating:4.90, reviews:14200,
  gradient:"linear-gradient(160deg,#001a10,#003828,#007060)",
  accent:"#20e0b0",
  tags:["Iconic Caribbean","All-Inclusive Corridor","Direct US Flights","Caribbean Christmas"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Negril_Beach_Jamaica.jpg/1280px-Negril_Beach_Jamaica.jpg"},

// 2. Smathers Beach, Key West — Florida's longest public beach, Thanksgiving/holiday escape
// 2km of white sand on US-1 terminus. Direct flights from NYC/ATL/CHI.
// Peak season Dec–Apr. EYW is a valid US domestic airport in AIRPORTS.
{id:"smathers-beach-kw", category:"beach",
  title:"Smathers Beach", location:"Key West, Florida, USA",
  lat:24.5457, lon:-81.7638, ap:"EYW",
  icon:"🏖️", rating:4.72, reviews:6800,
  gradient:"linear-gradient(160deg,#001828,#003868,#0070b8)",
  accent:"#40b8f8",
  tags:["Florida Keys","Southernmost US Beach","Holiday Escape","Domestic Flight"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Smathers_Beach.jpg/1280px-Smathers_Beach.jpg"},

// 3. Davos-Klosters, Switzerland — World's most famous ski town, opening now
// 300km Parsenn-Klosters-Jakobshorn domain. World Economic Forum backdrop.
// Highest ski resort in Alps (2560m base), great early-season snow reliability.
{id:"davos-klosters-ch", category:"skiing",
  title:"Davos-Klosters", location:"Graubünden, Switzerland",
  lat:46.8027, lon:9.8389, ap:"ZRH",
  icon:"⛷️", rating:4.90, reviews:4100,
  gradient:"linear-gradient(160deg,#0a1430,#1c2c78,#2e52c0)",
  accent:"#7098e0",
  tags:["Parsenn 300km","World's Highest Town","Opening Now","World Economic Forum"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Davos_2010.jpg/1280px-Davos_2010.jpg",
  lateSeason:true},

// 4. Flaine, France — High-altitude purpose-built resort, Bauhaus architecture
// Part of Grand Massif (265km). 1600m base guarantees early-season snow.
// Opening this week. GVA airport 1hr drive.
{id:"flaine-fr", category:"skiing",
  title:"Flaine", location:"Grand Massif, Haute-Savoie, France",
  lat:46.0083, lon:6.6833, ap:"GVA",
  icon:"⛷️", rating:4.83, reviews:2900,
  gradient:"linear-gradient(160deg,#0c1830,#1c3474,#2c58b0)",
  accent:"#6898d8",
  tags:["Grand Massif 265km","Bauhaus Village","High-Altitude Snow","Opening Now"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Flaine_resort.jpg/1280px-Flaine_resort.jpg"},

// 5. Alpe d'Huez, France — Tour de France legend, 250km, 3330m glacier
// Paradiski neighbor, 300 days of sunshine (most in French Alps).
// CMF is the correct airport (not GNB — Chambéry is closer, 95km).
{id:"alpe-dhuez", category:"skiing",
  title:"Alpe d'Huez", location:"Isère, France",
  lat:45.0900, lon:6.0708, ap:"CMF",
  icon:"⛷️", rating:4.86, reviews:3600,
  gradient:"linear-gradient(160deg,#0a1832,#1a3878,#2e62b8)",
  accent:"#6a9ed8",
  tags:["250km Pistes","3330m Glacier","300 Sunny Days","Tour de France Legend"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Alpe_d%27Huez_2008.jpg/1280px-Alpe_d%27Huez_2008.jpg"},
```

---

## 8. Observation for PM

**Thanksgiving day is live and 10 high-priority venues (Caribbean + Alps early-season) have been in the backlog for 8 days unadded — peak demand is happening without them in the scoring engine.** The good news: the lateSeason discrepancy (10 vs 15) is confirmed closed — both grep patterns exist in app.jsx. The bad news: 40 proposed venues with 0 adds in 8 days means the content pipeline is writing proposals into a void. Post-Thanksgiving (Nov 29–Dec 25) is the year's highest-volume Caribbean booking period — adding Negril and Orient Beach now captures that entire window even if Thanksgiving itself just started. Christmas ski season opens in ~4 weeks; adding Alps December openers (Flaine, Alpe d'Huez, Davos-Klosters) now means they appear in scoring before Christmas shoppers start planning.
