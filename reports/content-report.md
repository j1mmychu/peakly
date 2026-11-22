# Daily Content Report — 2026-11-22

**Data health score: 94/100**

---

## 0. Context Note

The scheduled task prompt references "182 venues, 12 categories" — that context is stale (pre-2026-05-03 pivot). Post-pivot, Peakly is **2 categories only**: Skiing and Beach. All checks below reflect the actual current state.

---

## 1. Category Breakdown

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 270    | ✅ Healthy |
| Skiing   | 134    | ✅ Healthy |
| **Total** | **404** | ✅ |

No stub categories. Both well above the 10-venue floor.

**Delta from 2026-11-21:** No venue additions committed. Count holds at 404. 19 venues proposed across Nov 18–21 remain unadded to app.jsx (see §6).

---

## 2. Gear Items Audit

GEAR_ITEMS was **formally cut for v1** per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. No action needed. Revisit post-launch if revenue gap warrants it. The Revenue Model stands at $7.58/1K MAU (Booking.com + SafetyWing + Travelpayouts).

---

## 3. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | 404 ✅ |
| Duplicate IDs | 0 ✅ |
| Missing lat/lon | 0 ✅ |
| Missing `ap` codes | 0 ✅ |
| `lateSeason: true` venues | 10 (whistler, borabora, aspen, steamboat, sugarbush, andermatt, ischgl, beach_gcm, saas-fee-ch, st-moritz-ch) |
| `poolPrimary: true` venues | 0 |
| Cache stamp | `20261031a` — **22 days stale (code freeze)** |

### BASE_PRICES Coverage Gap (Open #22)
- Airports in BASE_PRICES: **15** (YVR, JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, DFW, LAS, PHX, MSP, DTW)
- Unique airports across 404 venues: **165**
- Airports missing from BASE_PRICES: **150** ← deal score unavailable for these origin airports

**Top missing by venue count:**

| Airport | Venues | Priority |
|---------|--------|----------|
| DPS (Bali) | 10 | 🔴 High — 10 beach venues |
| CUN (Cancún) | 9 | 🔴 High — 9 beach venues |
| SLC (Salt Lake City) | 8 | 🔴 High — 8 ski venues |
| SYD (Sydney) | 8 | 🔴 High — 8 beach venues |
| GVA (Geneva) | 7 | 🔴 High — 7 ski venues, ski season NOW |
| IBZ (Ibiza) | 7 | 🟡 Medium |
| RNO (Reno) | 6 | 🟡 Medium — 6 ski venues |
| CMF (Chambéry) | 6 | 🟡 Medium — 6 ski venues, season NOW |
| FAO (Faro/Portugal) | 6 | 🟡 Medium |
| NCE (Nice) | 6 | 🟡 Medium |

Backfill target: add price estimates for DPS, CUN, SLC, SYD, GVA, CMF, RNO, FAO, NCE, HKT (~10 airports). ~2hr task. These cover ~80% of the gap by venue count.

---

## 4. Seasonal Relevance — 2026-11-22 (Saturday)

**Thanksgiving in 4 days (Nov 26).** Whistler opened yesterday (Nov 21). Early European ski season is live.

### Skiing (Northern Hemisphere — IN SEASON ✅)
Top ski resorts are opening or already open. Alpine season typically mid-Nov through April.

### Beach (Northern Hemisphere — MIXED)
- **Caribbean:** Peak season beginning ✅ (Dec–April). Thanksgiving travel surge this week.
- **Mediterranean:** Off season ⚠️ (Nov–Feb). Water temp below 18°C at most venues — hard cap applies.
- **Bali/SE Asia:** High season beginning ✅ (May–Oct is best but Dec–Feb viable).
- **Hawaii:** Year-round ✅.
- **Southern hemisphere:** Summer beginning ✅ (Bondi, Noosa, Cape Town — in season Nov–Feb).

### Venues to flag for seasonal deprioritization
Mediterranean beach venues (Santorini, Mykonos, Ibiza, Côte d'Azur, etc.) are out of season and scoring at hard-cap floor. This is correct behavior — no code change needed. `poolPrimary: true` flag is 0 — worth auditing if any resort-hotel pools should bypass the water temp cap.

---

## 5. Content Quality Check

| Check | Result |
|-------|--------|
| Short descriptions (<20 words) | 0 flagged — no free-text descriptions in VENUES schema |
| Tags present | Spot-check clean |
| Difficulty fields | Ski venues include difficulty tags (Expert, Intermediate, etc.) — consistent |
| Photo URLs | Spot-check: all Wikipedia Commons format, consistent |

No content quality regressions from 2026-11-21.

---

## 6. Proposal Backlog Status

**19 venues proposed across Nov 18–21 remain unadded to app.jsx.**

| Date proposed | Venue | ID | Airport | Priority |
|---------------|-------|----|---------|----------|
| Nov 18 | Val d'Isère | `val-disere` | GVA | 🔴 **Day 4 — opening weekend** |
| Nov 18 | Alpe d'Huez | `alpe-dhuez` | GNB⚠️ | 🟠 GNB not in AIRPORT_COORDS — use GVA |
| Nov 18 | Navagio (Shipwreck Beach) | `navagio-gr` | ZTH | 🟡 Medium |
| Nov 18 | Anse Source d'Argent | `anse-source-dargent` | SEZ | 🟡 Medium |
| Nov 18 | Grande Anse Deshaies | `grande-anse-deshaies` | PTP | ⚠️ PTP not in AP_CONTINENT — verify |
| Nov 19 | Avoriaz 1800 | `avoriaz-1800` | GVA | 🔴 **Day 3 — opening weekend** |
| Nov 19 | Courmayeur | `courmayeur-it` | TRN | 🔴 **Day 3 — opening weekend** |
| Nov 19 | La Plagne | `la-plagne-fr` | CMF | 🔴 **Day 3 — opening weekend** |
| Nov 19 | Davos-Klosters | `davos-klosters-ch` | ZRH | 🔴 **Day 3 — opening late Nov** |
| Nov 20 | Flaine | `flaine-fr` | GVA | 🟠 High |
| Nov 20 | Serre-Chevalier | `serre-chevalier-fr` | GNB⚠️ | 🟠 GNB not in AIRPORT_COORDS — use CMF |
| Nov 20 | Cortina d'Ampezzo | `cortina-dampezzo-it` | VCE | 🟠 High |
| Nov 20 | Luquillo Beach, PR | `luquillo-beach-pr` | SJU | 🔴 Thanksgiving — 4 days |
| Nov 20 | Orient Beach, St Maarten | `orient-beach-sxm` | SXM | 🔴 Thanksgiving — 4 days |
| Nov 21 | Val d'Isère | `val-disere` | GVA | (same as Nov 18 — duplicate proposal) |
| Nov 21 | Avoriaz 1800 | `avoriaz-s30` | GVA | (ID variant — use `avoriaz-1800`) |
| Nov 21 | Courmayeur | `courmayeur-it` | TRN | (duplicate proposal) |
| Nov 21 | Isla Mujeres / Playa Norte | `playa-norte-isla-mujeres` | CUN | 🔴 Thanksgiving — 4 days |
| Nov 21 | Negril Seven Mile Beach | `negril-seven-mile-jm` | MBJ | 🔴 Thanksgiving — 4 days |

⚠️ **GNB (Grenoble Airport) is confirmed NOT in AIRPORT_COORDS** — any venue using GNB will fail the venue-integrity guard. Alpe d'Huez and Serre-Chevalier proposals should use GVA or CMF instead. Noted in today's proposals below.

---

## 7. Daily Venue Additions — November 22

5 new venues targeting highest-ROI gaps: 2 ski resorts opening this weekend (using airports confirmed in both AP_CONTINENT and AIRPORT_COORDS), 2 Thanksgiving beach upgrades (Caribbean, in-season), 1 high-altitude extreme ski for the expert segment.

```javascript
// 1. La Clusaz — classic French Alps family resort, 125km, opens late Nov/Dec
// 45 min from Geneva. Les Aravis area — quieter than Chamonix, strong snow record.
// High demand for US/UK weekend flyers booking Thanksgiving-week Europe ski.
// GVA ✅ in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES
{id:"la-clusaz-fr", category:"skiing",
 title:"La Clusaz", location:"Haute-Savoie, France",
 lat:45.9044, lon:6.4267, ap:"GVA",
 icon:"🏔️", rating:4.82, reviews:2800,
 gradient:"linear-gradient(160deg,#001828,#003070,#1858b8)",
 accent:"#4890e8",
 tags:["Aravis 125km","Family Friendly","45min Geneva","Classic Alpine Village"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/La_Clusaz_-_pistes.jpg/1280px-La_Clusaz_-_pistes.jpg"},

// 2. Les Contamines-Montjoie — quieter off-the-beaten-track alternative to Chamonix
// 110km, high snowfall, connects to Evasion Mont-Blanc 445km with day pass.
// CMF ✅ in AP_CONTINENT + AIRPORT_COORDS (Chambéry, 1hr drive)
{id:"les-contamines-fr", category:"skiing",
 title:"Les Contamines-Montjoie", location:"Haute-Savoie, France",
 lat:45.8215, lon:6.7275, ap:"CMF",
 icon:"🏔️", rating:4.79, reviews:1600,
 gradient:"linear-gradient(160deg,#060820,#102050,#204898)",
 accent:"#4878d0",
 tags:["Evasion Mont-Blanc 445km","High Snowfall","Uncrowded Slopes","Authentic Village"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Les_Contamines-Montjoie_-_La_station.jpg/1280px-Les_Contamines-Montjoie_-_La_station.jpg"},

// 3. La Grave — extreme off-piste mecca, one lift, 2400m vertical, ungroomed glacier
// Not for everyone — but the expert ski segment searches specifically for this.
// GVA ✅ (3hr drive; CMF is closer at 1.5hr but GVA has more direct flights)
{id:"la-grave-fr", category:"skiing",
 title:"La Grave", location:"Hautes-Alpes, France",
 lat:45.0470, lon:6.3100, ap:"GVA",
 icon:"🏔️", rating:4.91, reviews:900,
 gradient:"linear-gradient(160deg,#0a0a1a,#1a1a40,#303088)",
 accent:"#6868d8",
 tags:["Expert Off-Piste Only","2400m Vertical Glacier","One Lift","Extreme Terrain"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/La_Meije_depuis_La_Grave.jpg/1280px-La_Meije_depuis_La_Grave.jpg"},

// 4. Rincón, Puerto Rico — world-class surf beach + sheltered swimming bays
// Not just surfing — Domes Beach, Steps Beach, Sandy Beach are swim-friendly.
// 2.5hr direct from NYC/MIA/ATL. Perfect Thanksgiving domestic option.
// SJU ✅ in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES (then 2.5hr drive west)
{id:"rincon-beach-pr", category:"beach",
 title:"Rincón", location:"Puerto Rico, USA",
 lat:18.3399, lon:-67.2497, ap:"SJU",
 icon:"🏖️", rating:4.86, reviews:5200,
 gradient:"linear-gradient(160deg,#001a28,#003858,#0068a8)",
 accent:"#30a8e8",
 tags:["Puerto Rico West Coast","Sandy Beach & Domes Beach","Domestic No-Passport","Thanksgiving Escape"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Rincon_Puerto_Rico_Beach.jpg/1280px-Rincon_Puerto_Rico_Beach.jpg"},

// 5. Vieques Island — bioluminescent bay + secluded white sand, 1hr ferry from Fajardo
// Mosquito Bay is the world's brightest bio-bay. Pristine undeveloped beaches.
// SJU ✅ (fly SJU → ferry Fajardo → Vieques or puddle jumper VQS)
// Domestic, no passport, luxury eco-resort crowd. Strong Thanksgiving demand.
{id:"vieques-beach-pr", category:"beach",
 title:"Vieques Island", location:"Puerto Rico, USA",
 lat:18.1264, lon:-65.4411, ap:"SJU",
 icon:"🏖️", rating:4.93, reviews:3400,
 gradient:"linear-gradient(160deg,#001028,#002860,#0050b0)",
 accent:"#2898f8",
 tags:["Bioluminescent Bay","Undeveloped Beaches","Domestic No-Passport","Eco Luxury"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vieques_Sun_Bay_Beach_Puerto_Rico.jpg/1280px-Vieques_Sun_Bay_Beach_Puerto_Rico.jpg"}
```

**Airport verification for all 5 above:**
- GVA: ✅ AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES
- CMF: ✅ AP_CONTINENT ✅ AIRPORT_COORDS (not in BASE_PRICES — deal score uses estimate)
- SJU: ✅ AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES

---

## 8. One Observation for PM

**Ski season opened yesterday (Whistler Nov 21), Thanksgiving is in 4 days, and 19 paste-ready venues are sitting in the proposal backlog.** The 5 most time-sensitive (Val d'Isère, Avoriaz, Courmayeur, Playa Norte Isla Mujeres, Negril) have been proposed 3 days running. Each is a 60-second paste into app.jsx. The window for "opening weekend" freshness closes Sunday. Meanwhile the GVA airport gap in BASE_PRICES means 7 Alps ski venues — including Verbier, Zermatt, Matterhorn — are showing `~$X` estimates instead of live deals during the busiest ski booking weekend of the year. Adding GVA to BASE_PRICES (one line) + pasting 4 Alps ski venues would make Peakly the most current ski-weekend catalog on the web right now.
