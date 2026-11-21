# Daily Content Report — 2026-11-21

**Data health score: 94/100**

---

## 1. Category Breakdown

> ⚠️ Scheduled task prompt references 12 categories and 182 venues — that context is stale. Post-2026-05-03 pivot, Peakly has **2 categories only**: Skiing and Beach.

| Category | Venues | Status |
|----------|--------|--------|
| Beach    | 270    | ✅ Healthy |
| Skiing   | 134    | ✅ Healthy |
| **Total** | **404** | ✅ |

No stub categories. Both well above the 10-venue floor.

**Delta from yesterday:** No code changes. Venue count holds at 404 (confirmed eval, not grep).

---

## 2. Data Integrity Audit

Full eval scan of all 404 venues:

| Check | Result |
|-------|--------|
| Duplicate IDs | 0 ✅ |
| Missing coordinates (lat/lon) | 0 ✅ |
| Missing airport codes (ap) | 0 ✅ |
| Missing tags arrays | 0 ✅ |
| Missing photos | 0 ✅ |
| Duplicate photo URLs | 0 ✅ |
| AP_CONTINENT coverage | 165/165 (100%) ✅ |
| AIRPORT_COORDS coverage | 165/165 (100%) ✅ |
| BASE_PRICES coverage | 165/165 (100%) ✅ |
| Invalid ratings (outside 0–5) | 0 ✅ |
| Venues with <100 reviews | 0 ✅ |
| lateSeason:true count | 15 ✅ |
| GEAR_ITEMS occurrences | 0 ✅ (intentionally cut for v1) |

**Catalog is clean. No critical data issues for Day 3 of ski season.**

### Notes on apparent non-issues

- **FOR / NAT airports**: show as "missing" under unquoted-key regex. Present as `"FOR": "latam"` and `"NAT": "latam"` in AP_CONTINENT. No gap.
- **Venues with ≤2 tags**: ~221 (55% of catalog). Legacy JS-format venues. Not a data integrity issue — scoring and search still work. Quality gap only.

---

## 3. Gear Items Audit

GEAR_ITEMS **formally cut for v1** — Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. **Do not restore.**

---

## 4. Seasonal Relevance — November 21, 2026 (Saturday)

**Whistler Blackcomb opened TODAY.** This is the highest-demand day of the year for the app.

| Segment | Venue count | Season status |
|---------|-------------|--------------|
| N hemisphere skiing (lat ≥ 0) | 111 | ✅ **IN SEASON** — opening weekend |
| S hemisphere skiing (lat < 0) | 23 | ⬇️ Out of season — AU/NZ/SA closed since Sep |
| Tropical beach (|lat| ≤ 15°) | 83 | ✅ **IN SEASON** year-round |
| S hemisphere beach (lat ≤ −15°) | 38 | ✅ **IN SEASON** — Southern summer Nov–Apr |
| N hemisphere temp beach (lat ≥ 15°) | 149 | ⚡ Shoulder/off season for US/Europe beaches |

**What's firing right now:**
- **Whistler Blackcomb** opens today (Nov 21) — the app's #1 ski venue by brand recognition, `lateSeason:true`
- **Thanksgiving travel peak starts Nov 25** — Caribbean demand already surging. CUN/SJU/SXM/MBJ/BGI are the key airports
- Val Thorens, Verbier, Tignes, Engelberg, Hintertux typically open this week — all `lateSeason:true` and in catalog
- South American ski season closed: 23 S-hemi ski venues now out of season and should rank low

---

## 5. Content Quality

### Tag coverage

| Tags per venue | Count | % of catalog |
|----------------|-------|--------------|
| 2 tags | ~221 | 55% |
| 3 tags | ~14 | 3% |
| 4 tags | ~168 | 42% |
| 5+ tags | 1 | <1% |

**221 venues with ≤2 tags — Day 21 unchanged.** Original JS-format venues (pre-batch) have 2 tags; JSON-batch entries mostly have 4. No enrichment has shipped.

### Top 5 thin-tag venues to fix first (highest traffic expected):

| Venue | ID | Current tags | Suggested additions |
|-------|-----|--------------|---------------------|
| Whistler Blackcomb | `whistler` | "Groomed Runs", "Powder Day" | "Peak 2 Peak Gondola", "lateSeason Glacier" |
| Chamonix-Mont-Blanc | `chamonix` | "Off-Piste", "Mont Blanc Views" | "Vallée Blanche", "Expert Altitude" |
| Val Thorens | `val-thorens` | "Highest Euro Resort", "Linked Domain" | "Les 3 Vallées", "lateSeason Open" |
| Bora Bora | `borabora` | "UV 11", "Crystal Water" | "Overwater Bungalows", "Lagoon Snorkel" |
| Verbier | `verbier` | "4 Vallées", "Expert Freeride" | "Mont Fort Summit", "Après-Ski Culture" |

---

## 6. Proposal Backlog Status

**14 proposals from Nov 18–20 reports remain unadded to app.jsx.**

| Date proposed | Venue | ID | Airport | Priority |
|---------------|-------|----|---------|----------|
| Nov 18 | Val d'Isère | `val-disere` | GVA | 🔴 **Day 3 — opening weekend NOW** |
| Nov 18 | Alpe d'Huez | `alpe-dhuez` | GNB | 🔴 **Day 3 — opening weekend NOW** |
| Nov 18 | Navagio (Shipwreck Beach) | `navagio-gr` | ZTH | 🟡 Medium |
| Nov 18 | Anse Source d'Argent | `anse-source-dargent` | SEZ | 🟡 Medium |
| Nov 18 | Grande Anse Deshaies | `grande-anse-deshaies` | PTP | 🟡 Medium |
| Nov 19 | Avoriaz 1800 | `avoriaz-s30` | GVA | 🔴 **Day 2 — opening weekend NOW** |
| Nov 19 | Courmayeur | `courmayeur-it` | TRN | 🔴 **Day 2 — opening weekend NOW** |
| Nov 19 | La Plagne | `la-plagne-fr` | CMF | 🔴 **Day 2 — opening weekend NOW** |
| Nov 19 | Davos-Klosters | `davos-klosters-ch` | ZRH | 🔴 **Day 2 — open late Nov** |
| Nov 20 | Flaine | `flaine-fr` | GVA | 🟠 High |
| Nov 20 | Serre-Chevalier | `serre-chevalier-fr` | GNB | 🟠 High |
| Nov 20 | Cortina d'Ampezzo | `cortina-dampezzo-it` | VCE | 🟠 High |
| Nov 20 | Luquillo Beach, PR | `luquillo-beach-pr` | SJU | 🟠 High — Thanksgiving |
| Nov 20 | Orient Beach, St Maarten | `orient-beach-sxm` | SXM | 🟠 High — Thanksgiving |

**6 of 14 pending venues are opening this exact weekend.** Each is paste-ready in prior reports.

---

## 7. Daily Venue Additions — November 21

5 new venues targeting the highest-priority gaps: 3 that have been pending for 3+ days (critical opening weekend) + 2 Thanksgiving Caribbean beaches. All use airports already in AP_CONTINENT, AIRPORT_COORDS, and BASE_PRICES.

```javascript
// 1. Val d'Isère — Espace Killy with Tignes, France's most prestigious resort
// tignes is in catalog but tagged "Tignes / Val d'Isère" — Val d'Isère deserves its own entry.
// La Face downhill, courchevel-tier prestige, 300km total Espace Killy terrain.
// GVA ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
// Opens: typically Nov 26–Dec 5. Early snowfall 2026 may push to this week.
{id:"val-disere", category:"skiing",
 title:"Val d'Isère", location:"Savoie, France",
 lat:45.4479, lon:6.9779, ap:"GVA",
 icon:"🏔️", rating:4.93, reviews:4800,
 gradient:"linear-gradient(160deg,#001028,#002860,#0048a8)",
 accent:"#4080e0",
 tags:["Espace Killy 300km","La Face Downhill","Expert Prestige","High Altitude"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Val_d%27Is%C3%A8re_piste_de_ski.jpg/1280px-Val_d%27Is%C3%A8re_piste_de_ski.jpg"},

// 2. Avoriaz 1800 — car-free, snowiest French Alps village, gateway to Portes du Soleil
// 650km cross-border France-Switzerland terrain; snow-guaranteed at 1800m; iconic wooden architecture
// GVA ✅
// Opens: mid-Dec officially; snowpark and terrain features open earlier
{id:"avoriaz-1800", category:"skiing",
 title:"Avoriaz 1800", location:"Haute-Savoie, France",
 lat:46.1884, lon:6.7735, ap:"GVA",
 icon:"🏔️", rating:4.88, reviews:3200,
 gradient:"linear-gradient(160deg,#0a1428,#1a3060,#3060a8)",
 accent:"#5090d8",
 tags:["Car-Free Village","Portes du Soleil 650km","Snowiest French Alps","Snowpark Hub"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Avoriaz.jpg/1280px-Avoriaz.jpg"},

// 3. Courmayeur — Italian side of Mont Blanc massif, most stylish Italian ski resort
// 110km pistes, Skyway Monte Bianco cable car (3466m), aperitivo culture, via ferrata
// TRN ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
// Opens: typically late Nov / Dec
{id:"courmayeur-it", category:"skiing",
 title:"Courmayeur", location:"Aosta Valley, Italy",
 lat:45.7963, lon:6.9704, ap:"TRN",
 icon:"🏔️", rating:4.90, reviews:3600,
 gradient:"linear-gradient(160deg,#1a0a28,#401060,#8028b0)",
 accent:"#b058e8",
 tags:["Italian Mont Blanc","Skyway 3466m","Aperitivo Culture","Refined Ski Village"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Courmayeur_%28panorama%29.jpg/1280px-Courmayeur_%28panorama%29.jpg"},

// 4. Playa Norte, Isla Mujeres — Mexico's calmest most swimmable Caribbean beach, 20 min from Cancun
// Protected bay, no waves, turquoise shallows, no hawkers; golf-cart island; Dec–April peak
// CUN ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
{id:"playa-norte-isla-mujeres", category:"beach",
 title:"Playa Norte, Isla Mujeres", location:"Quintana Roo, Mexico",
 lat:21.2460, lon:-86.7415, ap:"CUN",
 icon:"🏖️", rating:4.95, reviews:9800,
 gradient:"linear-gradient(160deg,#001828,#003868,#0068b8)",
 accent:"#30b8f8",
 tags:["Calm No-Wave Bay","Turquoise Shallows","Golf Cart Island","Thanksgiving Escape"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Playa_Norte_Isla_Mujeres_2.jpg/1280px-Playa_Norte_Isla_Mujeres_2.jpg"},

// 5. Negril Seven Mile Beach, Jamaica — Jamaica's most famous beach, all-inclusive gateway
// 11km white sand, cliff diving at Rick's Café, calm shallow west-facing bay, direct NYC/ATL/MIA flights
// MBJ ✅ already in AP_CONTINENT / AIRPORT_COORDS / BASE_PRICES
{id:"negril-seven-mile-jm", category:"beach",
 title:"Negril Seven Mile Beach", location:"Westmoreland, Jamaica",
 lat:18.2690, lon:-78.3505, ap:"MBJ",
 icon:"🏖️", rating:4.88, reviews:7200,
 gradient:"linear-gradient(160deg,#001a10,#003828,#007848)",
 accent:"#30d888",
 tags:["Seven Mile White Sand","Rick's Café Cliff Diving","Sunset West-Facing","All-Inclusive Hub"],
 photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Negril_Beach_Jamaica.jpg/1280px-Negril_Beach_Jamaica.jpg"}
```

---

## 8. One Observation for PM

**Ski season opened today (Whistler Nov 21) and 14 paste-ready venues sit in proposal limbo — 6 of them are opening this exact weekend.** The catalog has zero val-disere, zero avoriaz, zero courmayeur entries, while users are actively booking the best ski weekend of the year. Each venue object above is paste-ready in under 60 seconds. The VPS (Day 105 undeployed, Open #19) means two-weekend scoring is still disabled — first ski weekend of the season is scoring on a 7-day window instead of Fri-Mon best-of-4. That's the highest-ROI unblock available today alongside pasting these venues.
