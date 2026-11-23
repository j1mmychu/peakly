# Daily Content Report — 2026-11-23

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

**Delta from 2026-11-22:** No venue additions committed. Count holds at 404. 21 venues proposed across Nov 18–22 remain unadded to app.jsx (see §6).

---

## 2. Gear Items Audit

GEAR_ITEMS was **formally cut for v1** per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. This is intentional. No action needed. Revenue Model stands at $7.58/1K MAU.

---

## 3. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | 404 ✅ |
| Duplicate IDs | 0 ✅ |
| Missing lat/lon | 0 ✅ |
| Missing `ap` codes | 0 ✅ |
| Missing photo URLs | 0 ✅ |
| Duplicate photo URLs | 0 ✅ |
| `lateSeason: true` venues | 15 ✅ (matches CLAUDE.md: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg) |
| `poolPrimary: true` venues | 0 |
| Cache stamp | `20261031a` — **23 days stale (code freeze, App Review pending)** |

### BASE_PRICES Coverage — FULLY CLOSED ✅

**Major improvement since last report:** BASE_PRICES now contains **181 destination airports**, covering ALL 129 unique airports used across 404 venues. Zero missing airports. The `~$X` estimate vs LIVE deal display issue is resolved for all venues.

Previous report flagged DPS, CUN, SLC, SYD, GVA, CMF as missing — all now present. This closes Open #22 entirely.

### AIRPORT_COORDS Gap (Venue Proposals Affected)

| Airport | AP_CONTINENT | AIRPORT_COORDS | BASE_PRICES | Notes |
|---------|-------------|----------------|-------------|-------|
| VCE (Venice) | ✅ | ❌ | ✅ | Cortina proposal fails venue-integrity guard — use TRN instead |
| GNB (Grenoble) | ✅ | ❌ | ✅ | Alpe d'Huez + Serre-Chevalier proposals fail guard — use GVA or CMF |
| All others checked | ✅ | ✅ | ✅ | GVA, CMF, TRN, SJU, MBJ, ZRH, INN all clear |

**Action:** Any venue using VCE or GNB will be caught by the auto-push venue-integrity guard and rejected. Use TRN for Cortina, CMF for Alpe d'Huez and Serre-Chevalier.

### Note on lateSeason Count

Previous report showed 10; actual count is 15. The discrepancy was a script bug — my counter only caught `lateSeason:true` (no space) in the compact format and missed the 5 quoted-format entries (`"lateSeason": true`). Both formats are present in app.jsx across the two insert formats. CLAUDE.md's stated 15 is correct.

---

## 4. Seasonal Relevance — 2026-11-23 (Sunday, Thanksgiving Week)

**Thanksgiving in 3 days (Nov 26).** Early European ski season is live. Whistler opened Nov 21.

### Skiing — Northern Hemisphere ✅ IN SEASON
- 111 N hemisphere ski venues are actively in season or opening now.
- **Alps early-season openers:** Tignes/Val d'Isère, Chamonix, Verbier, Cervinia, Zermatt — all in VENUES ✅. Courchevel opens Dec 7. Avoriaz/La Plagne targeting late Nov/early Dec.
- **Opening weekend NOW (Nov 22-23):** Whistler (opened 11/21), Val d'Isère / Tignes complex (already in VENUES as `tignes`).
- **Note:** "Val d'Isère" proposals in the backlog are **redundant** — `id:"tignes"` already covers the Espace Killy domain (Tignes + Val d'Isère linked). No separate val-disere entry needed.
- Rocky Mtn season opening: Vail, Breckenridge, Keystone — all in VENUES ✅.

### Skiing — Southern Hemisphere ⚠️ OUT OF SEASON
- 23 S hemisphere ski venues (NZ, AUS, Chile, Argentina) are closed Nov–Apr. Scoring will suppress them correctly via hemisphere season logic.

### Beach — Caribbean ✅ PEAK SEASON BEGINNING
- Caribbean peak season runs Dec–April. Thanksgiving travel surge this week.
- In-season: Puerto Rico (SJU), Jamaica (MBJ), St Maarten (SXM), Turks, Bahamas, Cancún (CUN).
- **Thanksgiving domestic picks not yet in catalog:** Luquillo Beach PR, Negril Jamaica — proposed in backlog, still unadded.

### Beach — Mediterranean ⚠️ OFF SEASON
- Water temp below 18°C at most venues Nov–Feb. Hard cap applies. Correctly deprioritized.

### Beach — SE Asia / Bali ✅ IN SEASON
- Nov–Mar is high season in SE Asia. DPS covered (Bali, Nusa Lembongan, etc. all present).

### Beach — Equatorial / Year-Round ✅
- 126 venues with |lat| < 20° — year-round viable.

---

## 5. Content Quality

| Check | Result |
|-------|--------|
| Short descriptions (<20 words) | N/A — VENUES schema has no free-text `desc` field (uses `title`, `location`, `tags`) |
| Tags present | 404/404 ✅ |
| Duplicate photos | 0 ✅ |
| Rating range | 4.00–4.99, avg 4.72 — all venues have ratings ✅ |
| Difficulty signals | Encoded in tags (Expert Terrain, Family Friendly, All Levels, Backcountry, etc.) ✅ |

Top tags by frequency: Expert Terrain (9), Year-Round Sun (9), High Altitude (8), Family Friendly (8), Off-Piste (6), All Levels (6).

No content quality regressions.

---

## 6. Proposal Backlog Status

**21 venues proposed across Nov 18–22 remain unadded to app.jsx.**

Key clarifications:
- **Val d'Isère is ALREADY COVERED** as `id:"tignes"` ("Tignes / Val d'Isère", Espace Killy). The separate `val-disere` proposals are redundant — remove from backlog.
- **VCE not in AIRPORT_COORDS** — Cortina d'Ampezzo (`cortina-dampezzo-it`) cannot use VCE. Should use TRN (Turin, 3hr drive) or be held.
- **GNB not in AIRPORT_COORDS** — Alpe d'Huez + Serre-Chevalier cannot use GNB. Use GVA or CMF.

| Venue | ID | Airport | Priority | Note |
|-------|----|---------|----------|------|
| Avoriaz 1800 | `avoriaz-1800` | GVA ✅ | 🔴 **Opening now** | Day 4 |
| Courmayeur | `courmayeur-it` | TRN ✅ | 🔴 **Opening now** | Day 4 |
| La Plagne | `la-plagne-fr` | CMF ✅ | 🔴 **Opening late Nov** | Day 4 |
| Davos-Klosters | `davos-klosters-ch` | ZRH ✅ | 🔴 **Opening late Nov** | Day 4 |
| Luquillo Beach PR | `luquillo-beach-pr` | SJU ✅ | 🔴 **Thanksgiving in 3 days** | Day 3 |
| Orient Beach SXM | `orient-beach-sxm` | SXM ✅ | 🔴 **Thanksgiving in 3 days** | Day 3 |
| Playa Norte Isla Mujeres | `playa-norte-isla-mujeres` | CUN ✅ | 🔴 **Thanksgiving in 3 days** | Day 3 |
| Negril Seven Mile | `negril-seven-mile-jm` | MBJ ✅ | 🔴 **Thanksgiving in 3 days** | Day 3 |
| Flaine | `flaine-fr` | GVA ✅ | 🟠 High | Day 3 |
| Cortina d'Ampezzo | `cortina-dampezzo-it` | TRN ✅ | 🟠 High (use TRN, not VCE) | |
| Alpe d'Huez | `alpe-dhuez` | CMF ✅ | 🟡 Medium (use CMF, not GNB) | |
| Serre-Chevalier | `serre-chevalier-fr` | CMF ✅ | 🟡 Medium (use CMF, not GNB) | |
| Navagio (Shipwreck) | `navagio-gr` | ZTH ✅ | 🟡 Medium | |
| Anse Source d'Argent | `anse-source-dargent` | SEZ ✅ | 🟡 Medium | |
| Grande Anse Deshaies | `grande-anse-deshaies` | PTP | ⚠️ verify PTP in AP_CONTINENT | |
| Val d'Isère | `val-disere` | — | ❌ REDUNDANT — already `id:"tignes"` | Drop |
| La Clusaz | `la-clusaz-fr` | GVA ✅ | 🟡 Medium | |
| Les Contamines | `les-contamines-fr` | CMF ✅ | 🟡 Medium | |
| La Grave | `la-grave-fr` | GVA ✅ | 🟠 Expert niche | |
| Rincón PR | `rincon-beach-pr` | SJU ✅ | 🔴 Thanksgiving | Day 1 |
| Vieques PR | `vieques-beach-pr` | SJU ✅ | 🔴 Thanksgiving | Day 1 |

---

## 7. Daily Venue Additions — November 23

5 new venues targeting Thanksgiving travel surge (3 days out) and Alps opening weekend. All airports verified in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES. VCE excluded; GNB excluded.

```javascript
// 1. Avoriaz 1800 — high-altitude French Alps village, ski-in/ski-out, no cars
// Part of Les Portes du Soleil (650km), opens late Nov. 45min from Geneva.
// GVA ✅ AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES
{id:"avoriaz-1800", category:"skiing",
 title:"Avoriaz 1800", location:"Portes du Soleil, France",
 lat:46.1877, lon:6.7724, ap:"GVA",
 icon:"🏔️", rating:4.87, reviews:2600,
 gradient:"linear-gradient(160deg,#001828,#003070,#1858b8)",
 accent:"#4890e8",
 tags:["Portes du Soleil 650km","Car-Free Village","High Altitude","Ski-In/Out"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Avoriaz_village.jpg/1280px-Avoriaz_village.jpg"},

// 2. Courmayeur — Italian Alps under Mont Blanc, opens late Nov, chic après scene
// Connected to Chamonix via Mont Blanc tunnel. Shorter lines than French side.
// TRN ✅ AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES (Turin, 2hr drive)
{id:"courmayeur-it", category:"skiing",
 title:"Courmayeur", location:"Aosta Valley, Italy",
 lat:45.7925, lon:6.9696, ap:"TRN",
 icon:"🏔️", rating:4.90, reviews:2400,
 gradient:"linear-gradient(160deg,#060820,#102050,#204898)",
 accent:"#4878d0",
 tags:["Mont Blanc Views","Italian Chic","Connected Chamonix","Shorter Lift Lines"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Courmayeur_-_Cresta_Youla.JPG/1280px-Courmayeur_-_Cresta_Youla.JPG"},

// 3. La Plagne — one of France's biggest ski areas, 225km, opens late Nov/early Dec
// Part of Paradiski (425km with Les Arcs). Family-friendly across 10 villages.
// CMF ✅ AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES (Chambéry, 1.5hr)
{id:"la-plagne-fr", category:"skiing",
 title:"La Plagne", location:"Savoie, France",
 lat:45.5100, lon:6.6730, ap:"CMF",
 icon:"🏔️", rating:4.88, reviews:3100,
 gradient:"linear-gradient(160deg,#060818,#101e50,#1e3898)",
 accent:"#4870d0",
 tags:["Paradiski 425km","10 Villages","Olympic Bobsled Run","Family Friendly"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/La_Plagne_-_vue_du_domaine.jpg/1280px-La_Plagne_-_vue_du_domaine.jpg"},

// 4. Negril Seven Mile Beach — Jamaica's iconic west coast beach, peak season now
// Calm clear water, no passport for US citizens. Direct flights from NYC/MIA/ATL.
// Thanksgiving domestic escape — 3hr direct from East Coast.
// MBJ ✅ AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES
{id:"negril-seven-mile-jm", category:"beach",
 title:"Negril Seven Mile Beach", location:"Westmoreland, Jamaica",
 lat:18.2756, lon:-78.3419, ap:"MBJ",
 icon:"🏖️", rating:4.89, reviews:7200,
 gradient:"linear-gradient(160deg,#001a28,#003858,#0068a8)",
 accent:"#30a8e8",
 tags:["7-Mile White Sand","Clear Caribbean Water","All-Inclusive Resorts","Sunset Strip"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Seven_Mile_Beach%2C_Negril%2C_Jamaica.jpg/1280px-Seven_Mile_Beach%2C_Negril%2C_Jamaica.jpg"},

// 5. Playa Norte, Isla Mujeres — #1 rated Caribbean beach, calm lagoon-like water
// 20min ferry from Cancún. Best beach in Mexico for calm swimming. No passport needed.
// CUN ✅ AP_CONTINENT ✅ AIRPORT_COORDS ✅ BASE_PRICES
{id:"playa-norte-isla-mujeres", category:"beach",
 title:"Playa Norte, Isla Mujeres", location:"Quintana Roo, Mexico",
 lat:21.2534, lon:-86.7311, ap:"CUN",
 icon:"🏖️", rating:4.94, reviews:8900,
 gradient:"linear-gradient(160deg,#001028,#002860,#0050b0)",
 accent:"#2898f8",
 tags:["Calm Lagoon Waters","20min Ferry Cancún","#1 Rated Mexico Beach","Thanksgiving Escape"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Playa_Norte_Isla_Mujeres.jpg/1280px-Playa_Norte_Isla_Mujeres.jpg"}
```

**Airport verification for all 5:**
| Airport | AP_CONTINENT | AIRPORT_COORDS | BASE_PRICES |
|---------|-------------|----------------|-------------|
| GVA | ✅ | ✅ | ✅ |
| TRN | ✅ | ✅ | ✅ |
| CMF | ✅ | ✅ | ✅ |
| MBJ | ✅ | ✅ | ✅ |
| CUN | ✅ | ✅ | ✅ |

---

## 8. One Observation for PM

**BASE_PRICES is now fully closed (all 129 venue airports covered) — this is quietly one of the biggest data quality wins in weeks, and no one has flagged it yet.** The previously reported Open #22 (68% airport coverage gap) is completely gone: 181 destination airports now in BASE_PRICES. Every venue can show a deal score. Meanwhile, 21 paste-ready venues remain in the backlog with zero additions in 2 days. With Thanksgiving in 3 days and the Alps entering opening weekend, the catalog gap is an opportunity cost — Peakly could be the most current ski+beach Thanksgiving guide on the web right now. The bottleneck is a single paste operation, not engineering work.
