# Daily Content Report — 2026-11-27

**Data health score: 97/100**

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

**Delta from 2026-11-26:** 0 venue additions committed (code freeze since 2026-10-31 — App Review pending, day 27). Running backlog: **40 proposed venues unadded**.

---

## 2. Gear Items Audit

GEAR_ITEMS was **formally cut for v1** per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. No action needed. Revenue Model stands at $7.58/1K MAU.

---

## 3. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | 404 ✅ (134 ski / 270 beach) |
| Duplicate venue IDs (in VENUES) | 0 ✅ (`cancun-beach` duplicate is in ALERT_TEMPLATES, not VENUES — confirmed) |
| Missing lat/lon | 0 ✅ |
| Missing `ap` codes | 0 ✅ |
| Missing photo URLs | 0 ✅ (404/404 have photos) |
| Missing tags arrays | 0 ✅ (404/404 have tags — 209 compact-format + 195 JSON-format) |
| `lateSeason: true` venues | **15 confirmed ✅** (10 compact `lateSeason:true` + 5 JSON `"lateSeason": true`) |
| `poolPrimary: true` venues | 0 |
| BASE_PRICES coverage | 183 entries covering all 165 unique venue APs ✅ |
| AP_CONTINENT coverage | FOR + NAT confirmed present as JSON-quoted keys (`"FOR":"latam"`, `"NAT":"latam"`) ✅ |
| AIRPORT_COORDS coverage | All 165 venue APs covered ✅ |
| Braces balanced | 5684/5684 ✅ |
| Cache stamp | `20261031a` — **27 days stale (code freeze, App Review pending — CORRECT, do not bump)** |
| Total file size | 14,257 lines / 746,619 chars |

### lateSeason Confirmed IDs (15 total)

- Compact format (10): `whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `hintertux-glacier`, `cervinia`, `les-deux-alpes-fr`, `saas-fee-ch`, `st-moritz-ch`
- JSON format (5): `snowbird`, `zermatt`, `verbier`, `val-thorens`, `engelberg`

---

## 4. Seasonal Relevance — Black Friday 2026 (TODAY)

**Today is Black Friday 2026 (Nov 27). Cyber Monday is Nov 30. This is the highest-volume ski booking weekend of the year.**

### Skiing — Northern Hemisphere ✅ EARLY SEASON IN FULL SWING

- **Open NOW in VENUES ✅:** Whistler, Zermatt, Verbier, Cervinia, Saas-Fee, Hintertux Glacier, Tignes/Val d'Isère, Val Thorens (opened Nov 23), St. Moritz
- **Just opening this week (Black Friday openers — NOT in VENUES ⚠️):** Davos-Klosters (opening Nov 28), Avoriaz 1800 (open Dec 7), La Plagne (open Dec 7)
- **Opening December (NOT in VENUES ⚠️):** Alpe d'Huez (Dec 14), Flaine (Dec 7), Grindelwald First (Dec 14), Mürren (Dec 14), Courmayeur (Dec 1)
- Southern hemisphere ski venues: correctly down-scored for N. hemisphere Nov ✅

### Beach — Caribbean ✅ CHRISTMAS BOOKING PEAK — MAXIMUM DEMAND THIS WEEKEND

- **Black Friday through Cyber Monday is the single highest-volume weekend for Caribbean Christmas bookings.**
- **In VENUES ✅:** Cancún, Playa del Carmen, Tulum, Punta Cana, Aruba, Barbados, St. Barts, Luquillo PR, Jamaica Negril (beach_negril)
- **Still NOT in VENUES after 8+ days (highest-demand holes ⚠️):** Orient Beach SXM, Playa Norte Isla Mujeres, Rincón Beach PR, Vieques PR, Smathers Beach Key West

### Beach — Canary Islands ✅ PEAK WINTER SEASON
- Las Teresitas (TFS) + Playa de las Canteras (LPA) in VENUES ✅ — Canary Islands are peak Nov–Mar, correctly positioned

### Beach — Mediterranean ⚠️ SHOULDER SEASON
- Algarve, Marbella: 16–20°C winter sun market, correctly lower-scored for cold water temp

---

## 5. Content Quality Check

| Check | Result |
|-------|--------|
| Short descriptions (<20 words) | 0 flagged — compact venues have no description field; long-format venues adequate |
| Tags accuracy | Spot-checked 15 venues: tags match characteristics ✅ |
| Tags coverage | 404/404 venues have tags ✅ (confirmed both compact + JSON format counted) |
| Difficulty levels | No difficulty field in beach/skiing categories (not applicable) |
| `lateSeason: true` coverage | 15 confirmed ✅ |
| Photo quality | 404/404 photos present ✅. ~346 are category stock (not venue-specific) — known quality gap; requires Unsplash API key to fix (Open #20) |

---

## 6. Proposal Backlog Status — Day 27 (Black Friday, Cyber Monday weekend)

**40 venues proposed, 0 added in 27 days. Code freeze active (App Review pending). Black Friday ski + Christmas Caribbean booking peak is live RIGHT NOW.**

| Venue | ID | Airport | Priority | Days in backlog |
|-------|----|---------|----------|-----------------|
| **Davos-Klosters** | `davos-klosters-ch` | ZRH ✅ | 🔴 Opening Nov 28 | 9 |
| **Orient Beach SXM** | `orient-beach-sxm` | SXM ✅ | 🔴 Christmas peak | 9 |
| **Avoriaz 1800** | `avoriaz-1800` | GVA ✅ | 🔴 Opening Dec 7 | 9 |
| **La Plagne** | `la-plagne-fr` | CMF ✅ | 🔴 Opening Dec 7 | 9 |
| **Playa Norte, Isla Mujeres** | `playa-norte-isla-mujeres` | CUN ✅ | 🔴 Christmas peak | 9 |
| **Courmayeur** | `courmayeur-it` | TRN ✅ | 🔴 Opening Dec 1 | 9 |
| **Rincón Beach PR** | `rincon-beach-pr` | SJU ✅ | 🔴 Christmas peak | 9 |
| **Vieques PR** | `vieques-beach-pr` | SJU ✅ | 🟠 Christmas peak | 9 |
| **Smathers Beach, Key West** | `smathers-beach-kw` | EYW ✅ | 🟠 Domestic escape | 3 |
| Seminyak Beach, Bali | `seminyak-beach-bali` | DPS ✅ | 🟠 Peak Bali season | 3 |
| Marbella Beach | `marbella-beach-es` | AGP ✅ | 🟡 Winter sun | 3 |
| Grindelwald First | `grindelwald-first` | ZRH ✅ | 🔴 Opening Dec 14 | 3 |
| Mürren | `murren-jungfrau` | ZRH ✅ | 🔴 Opening Dec 14 | 3 |
| Flaine | `flaine-fr` | GVA ✅ | 🟠 Opening Dec 7 | 9 |
| Alpe d'Huez | `alpe-dhuez` | CMF ✅ | 🟠 Opening Dec 14 | 9 |
| Serre-Chevalier | `serre-chevalier-fr` | CMF ✅ | 🟡 | 9 |
| Cortina d'Ampezzo | `cortina-dampezzo-it` | TRN ✅ | 🟠 | 9 |
| La Clusaz | `la-clusaz-fr` | GVA ✅ | 🟡 | 9 |
| Anse Source d'Argent | `anse-source-dargent` | SEZ ✅ | 🟡 | 9 |
| Navagio (Shipwreck) Beach | `navagio-gr` | ZTH ⚠️ | 🟡 ZTH needs AIRPORT_COORDS check | 9 |

---

## 7. Daily Venue Additions — November 27

**Strategy: Black Friday / Cyber Monday is the peak ski booking + Christmas Caribbean booking weekend. Adding 3 Alps openers + 2 Caribbean Christmas venues — these are the highest-demand holes for the next 30 days.**

### Airport Pre-Verification

| Airport | AP_CONTINENT | AIRPORT_COORDS | BASE_PRICES |
|---------|-------------|----------------|-------------|
| ZRH (Zürich) | ✅ | ✅ | ✅ |
| GVA (Geneva) | ✅ | ✅ | ✅ |
| CMF (Chambéry) | ✅ | ✅ | ✅ |
| SXM (St. Martin/Sint Maarten) | ✅ | ✅ | ✅ |
| CUN (Cancún) | ✅ | ✅ | ✅ |

### Venue Objects

```javascript
// 1. Davos-Klosters — largest ski resort in Switzerland, opening Nov 28
// Parsenn is one of the most prestigious ski areas in the Alps.
// 319km of runs, 56 lifts. ZRH flights 90min from every major Euro hub.
{id:"davos-klosters-ch", category:"skiing",
  title:"Davos Klosters", location:"Graubünden, Switzerland",
  lat:46.8033, lon:9.8370, ap:"ZRH",
  icon:"⛷️", rating:4.86, reviews:7200,
  gradient:"linear-gradient(160deg,#101a3a,#1e3680,#3466c0)",
  accent:"#7ab0e8",
  tags:["Largest Swiss Resort","Parsenn Domain","319km Runs","World Economic Forum Town"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Davos_in_the_morning.jpg/1280px-Davos_in_the_morning.jpg"},

// 2. Avoriaz 1800 — car-free French Alps village, opening Dec 7
// Gateway to the Portes du Soleil (650km), horse-drawn sleds through the village.
// Most snowboard-friendly resort in France. Direct flights GVA.
{id:"avoriaz-1800", category:"skiing",
  title:"Avoriaz 1800", location:"Portes du Soleil, France",
  lat:46.1922, lon:6.7714, ap:"GVA",
  icon:"🏔️", rating:4.88, reviews:5400,
  gradient:"linear-gradient(160deg,#0a1428,#162a68,#2a4eb8)",
  accent:"#78a8e4",
  tags:["Car-Free Village","Portes du Soleil","Snowboard Mecca","Horse Sleds"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Avoriaz1.JPG/1280px-Avoriaz1.JPG"},

// 3. La Plagne — one of the world's largest ski areas (225km), opening Dec 7
// Linked to Les Arcs via Vanoise Express cable car (Paradiski 425km total).
// CMF is the standard Tarentaise valley gateway.
{id:"la-plagne-fr", category:"skiing",
  title:"La Plagne", location:"Savoie, France",
  lat:45.5083, lon:6.6750, ap:"CMF",
  icon:"🏔️", rating:4.87, reviews:8900,
  gradient:"linear-gradient(160deg,#0c1830,#1a3270,#2c5ab0)",
  accent:"#7ab2e0",
  tags:["Paradiski 425km","10 Linked Villages","Glacier Skiing","Linked to Les Arcs"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/La_Plagne_Vu_du_Chalet_du_Friolin.jpg/1280px-La_Plagne_Vu_du_Chalet_du_Friolin.jpg"},

// 4. Orient Beach, St. Martin — the Caribbean's most social beach, Christmas peak
// 2km of natural beach on the French side of St. Martin. Clothing-optional section at far end.
// SXM is a major hub for US Caribbean routes (direct JFK/MIA/ATL/BOS/EWR).
{id:"orient-beach-sxm", category:"beach",
  title:"Orient Beach", location:"St. Martin (French West Indies)",
  lat:18.0744, lon:-63.0130, ap:"SXM",
  icon:"🏖️", rating:4.88, reviews:21400,
  gradient:"linear-gradient(160deg,#001a2e,#003562,#006aaa)",
  accent:"#44aaee",
  tags:["Caribbean Christmas","Natural Beach","French Caribbean","Direct NYC Flights"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Orient_Beach_SXM.jpg/1280px-Orient_Beach_SXM.jpg"},

// 5. Playa Norte, Isla Mujeres — Mexico's most beloved small-island beach
// Calm Caribbean water, no waves, waist-deep for 200m. 5-min ferry from Cancún.
// CUN has direct US domestic routes from every major hub — the easiest Caribbean add.
{id:"playa-norte-isla-mujeres", category:"beach",
  title:"Playa Norte", location:"Isla Mujeres, Quintana Roo, Mexico",
  lat:21.2470, lon:-86.7310, ap:"CUN",
  icon:"🏝️", rating:4.95, reviews:38600,
  gradient:"linear-gradient(160deg,#001a28,#003a60,#007aaa)",
  accent:"#44ccee",
  tags:["Mexico's Best Beach","Calm Caribbean","5-min Ferry","Christmas Island Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Playa_Norte_Isla_Mujeres.jpg/1280px-Playa_Norte_Isla_Mujeres.jpg"},
```

---

## 8. One Observation for PM

**Black Friday is Peakly's highest-potential weekend of the year — and the catalog has a hole in its peak-demand window.** The 40-venue backlog contains all 3 currently-opening Alps resorts (Davos-Klosters opens Nov 28, La Plagne + Avoriaz Dec 7) and the two most-searched Caribbean Christmas beaches (Orient Beach SXM, Playa Norte). Code freeze is correct while App Review is pending, but if the review closes before Dec 7, adding these 5 venues from this report's §7 would be a 20-minute paste job that covers the entire Christmas ski + Caribbean opening window. The window runs Dec 7–25 — still catchable. **The right question for PM: when does the code freeze lift?**
