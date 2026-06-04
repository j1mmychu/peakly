# Peakly Daily Content Report — 2026-06-04

---

## Data Health Score: 91 / 100

**Total venues:** 156 (67 skiing · 89 beach)  
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot; surfing retired)  
**Photos:** 155 unique Unsplash URLs · 0 duplicates  
**Duplicate IDs:** 0  
**Coordinate errors:** 0

---

## Category Breakdown

| Category | Count | Status      |
|----------|-------|-------------|
| Beach    | 89    | ✅ Healthy   |
| Skiing   | 67    | ✅ Healthy   |

> Note: Task prompt references 182 venues and 12 categories — that reflects a pre-pivot state. Current codebase has 2 categories only. Surfing (53 venues) was retired 2026-05-03. No stub categories exist.

---

## Data Integrity Audit

### ✅ Clean
- All 156 venues have: `id`, `category`, `lat`, `lon`, `ap`, `title`, `location`, `tags`, `photo`
- No duplicate IDs
- No duplicate photo URLs
- No out-of-range coordinates (all lat within ±90, lon within ±180)
- All venue AP codes resolve in `AP_CONTINENT` (earlier audit found KUL/SNA/MCT as missing — **false alarm**: those codes are present in the quoted-key section of `AP_CONTINENT` starting at line 373)

### ⚠️ Flagged

**1. Near-duplicate: Outer Banks appears twice**
- `beach_ob` — "Outer Banks OBX" · lat 35.558, ap: ORF · 2 tags
- `outer-banks-nags-head-t7` — "Outer Banks Nags Head" · lat 35.957, ap: ORF · 4 tags
- Both are North Carolina barrier islands served by the same airport (ORF). A user searching OBX gets two results ~45km apart. Consider merging into one authoritative entry or explicitly differentiating the second as "Nags Head" only.

**2. Anguilla / St. Martin cluster — 3 venues within 15km**
- `beach_shoal` (Shoal Bay, Anguilla), `beach_orient` (Orient Bay, St-Martin), `rendezvous-bay-t28` (Rendezvous Bay, Anguilla)
- All served by nearby airports (AXA / SXM). Different islands, different vibes — keep, but worth noting for Caribbean density.

**3. `lateSeason: true` missing from two clearly qualifying resorts not yet in dataset**
- **Val Thorens** — Europe's highest resort (2300m), reliably skiable June–July
- **Verbier** — high-altitude Swiss resort, long season, glacier access
- Both suggested as new venues below; add `lateSeason:true` when inserting.
- Among existing 6 flagged venues, all are correct. CLAUDE.md says 7 — discrepancy is stale documentation.

**4. `poolPrimary: true` unused on all 89 beach venues**
- Architectural provision exists to bypass the 18°C water-temp hard cap. Zero venues carry this flag. Candidate: `muscat-beach-t26` (Gulf of Oman, warm but low wave activity — the draw is calm clear water, not surf). Low priority until a pool-resort venue is added.

**5. Tag depth inconsistency — 34 ski venues have only 2 tags**
- High-profile resorts like Whistler (`["Powder Day","All Levels"]`) and Aspen (`["Expert Terrain","Luxury Village"]`) use generic 2-tag entries while newer additions have 4. Not critical but affects filter surface area and detail-sheet richness.
- `borabora` has `["UV 11","Crystal Water"]` — "UV 11" as a tag is atypical; "Overwater Bungalows" or "Turquoise Lagoon" would be more scan-friendly.

---

## Gear Items Audit

| Category | Status |
|----------|--------|
| skiing   | ✅ 4 items — goggles $249, skis $599, bindings $329, jacket $449 · avg AOV ~$457 |
| beach    | ✅ 4 items — Hydro Flask $49, SUP board $499, sunglasses $329, rashguard $45 · avg AOV ~$230 |

**No gaps.** Both categories covered.

**Potential dead link risk:** Amazon ASIN-based links age out when products are discontinued. The ski jacket (B09Y4TF9KN) and snowboard bindings (B07PXMZGS8) are older ASINs — recommend a spot-check for 404s before the next Reddit push. Soft-404s (redirects to search page) won't throw an error but will drop conversion to zero.

---

## Seasonal Relevance (June 4, 2026 — Northern Hemisphere Early Summer)

### Skiing

| Hemisphere | Venue Count | June Status |
|-----------|-------------|-------------|
| N. hemisphere | 61 | ❌ OFF SEASON — summer; will score near-zero |
| S. hemisphere | 6  | ✅ IN SEASON — southern winter just starting |

**S. hemisphere venues currently firing:** The Remarkables (NZ), Portillo (Chile), Pucon Ski Center (Chile), Thredbo Village (Australia), Cerro Castor (Argentina), Treble Cone (NZ).

### Beach

| Hemisphere | Count | June Status |
|-----------|-------|-------------|
| N. hemisphere | 67 | ✅ PEAK SEASON — June through August prime time |
| S. hemisphere | 22 | 19 tropical (year-round) · 3 genuinely seasonal |

**Seasonal misfire risk for 3 S. hemisphere beach venues:**
- Praia Mole Florianópolis (lat -27.6°) — Brazilian winter, cold water likely
- Tofo Beach Mozambique (lat -23.9°) — cooler, possible below-cap water temp
- Hyams Beach NSW (lat -35.1°) — Australian winter, definitely cold

The scoring engine applies the 18°C hard cap via `fetchMarine`, so these should self-suppress. Worth a manual spot-check on the live site to confirm they're not surfacing with inflated scores.

---

## Content Quality

- **Empty descriptions:** 0 (venues use `tags` arrays rather than free text)
- **Empty tag arrays:** 0
- **Rating range:** 4.51–4.99 across 156 venues — realistic distribution
- **Ratings at 4.97+:** 20 venues — concentration is high but not implausible for a curated list
- **ID scheme:** Mixed (`aspen`, `beach_gcm` for originals; `<name>-t##`, `<name>-s##` for newer additions). All unique. No typos detected in venue names or country fields via spot-check.

---

## 5 New Venue Objects — Geographic Gap Fill

Targeting: Swiss Alps (Verbier: iconic, glaring omission), French Alps highest resort (Val Thorens), East Asia ski (South Korea = 0 venues), Canary Islands beach (year-round, 0 venues), SE Australian coast (Byron Bay, 0 venues).

```javascript
// ── 1. VERBIER — Swiss Alps icon, 4 Vallées domain ───────────────────────────
{
  id:"verbier",
  category:"skiing",
  title:"Verbier",
  location:"Valais, Switzerland",
  lat:46.0961, lon:7.2273, ap:"GVA",
  icon:"🎿", rating:4.95, reviews:2890,
  gradient:"linear-gradient(160deg,#0a1830,#192e6a,#2856be)",
  accent:"#78aee2",
  tags:["4 Vallées Domain","Expert Off-Piste","Après-Ski Hub","World Cup Venue"],
  photo:"https://images.unsplash.com/photo-1548484352-ea579e5233a8?w=800&h=600&fit=crop",
  skiPass:"independent",
  lateSeason:true,
},

// ── 2. VAL THORENS — Europe's highest resort, snow-guaranteed ─────────────────
{
  id:"val-thorens",
  category:"skiing",
  title:"Val Thorens",
  location:"Savoie, France",
  lat:45.2970, lon:6.5825, ap:"CMF",
  icon:"⛷️", rating:4.94, reviews:3160,
  gradient:"linear-gradient(160deg,#0c1a36,#1a3676,#2c60ba)",
  accent:"#7aaede",
  tags:["Europe's Highest Resort","Trois Vallées","Snow-Guaranteed","Late-Season Glacier"],
  photo:"https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=800&h=600&fit=crop",
  skiPass:"independent",
  lateSeason:true,
},

// ── 3. YONGPYONG — South Korea, 2018 Winter Olympics alpine venue ─────────────
// ap: GMP (Seoul Gimpo, in AP_CONTINENT as "asia"). Also add ICN:"asia" to the
// AP_CONTINENT patch section for future Korean venues using Incheon international.
{
  id:"yongpyong",
  category:"skiing",
  title:"Yongpyong Resort",
  location:"Pyeongchang, South Korea",
  lat:37.6597, lon:128.6645, ap:"GMP",
  icon:"🎿", rating:4.87, reviews:3240,
  gradient:"linear-gradient(160deg,#0a1c36,#163a78,#2a62c2)",
  accent:"#76acde",
  tags:["2018 Olympic Alpine Venue","Dragon Park Terrain","KTX Train Access","Night Skiing"],
  photo:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop",
  skiPass:"independent",
},

// ── 4. PLAYA LAS TERESITAS — Tenerife, year-round Canary Islands beach ────────
// TFS (Tenerife South) already in AP_CONTINENT as "europe". No patch needed.
{
  id:"tenerife-teresitas",
  category:"beach",
  title:"Playa Las Teresitas",
  location:"Tenerife, Canary Islands",
  lat:28.5123, lon:-16.2048, ap:"TFS",
  icon:"🏖️", rating:4.87, reviews:8640,
  gradient:"linear-gradient(160deg,#002a40,#004e70,#0070a8)",
  accent:"#45aadc",
  tags:["Year-Round Sun","Sahara-Sand Bay","Mt Teide Backdrop","Safe Swimming"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
},

// ── 5. BYRON BAY — Australia's east coast, iconic lighthouse headland ─────────
// BNK (Ballina Byron Gateway) already in AP_CONTINENT as "oceania". No patch needed.
{
  id:"byron-bay",
  category:"beach",
  title:"Main Beach Byron Bay",
  location:"New South Wales, Australia",
  lat:-28.6474, lon:153.6020, ap:"BNK",
  icon:"🏝️", rating:4.90, reviews:11200,
  gradient:"linear-gradient(160deg,#001e30,#00406a,#0060a0)",
  accent:"#40a8dc",
  tags:["Australia's Most Easterly Point","Humpback Whale Migrations","Lighthouse Headland Walk","Chilled Beach Town"],
  photo:"https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?w=800&h=600&fit=crop",
},
```

**One AP_CONTINENT patch recommended** — add to the `// ── patch` section before deploying Korean venues:
```javascript
ICN:"asia",  // Incheon International — primary gateway for all Korean venues
```

---

## One Observation the PM Should Know

**June means the app is a beach app for the next 4 months, but the UI doesn't communicate that.** With 61 of 67 ski venues scoring near-zero through September, users who self-identify as skiers and tap the Skiing filter will see a mostly dead list — a handful of Southern Hemisphere resorts they've never heard of (Portillo, Cerro Castor) plus weak scores. The `seasonalDefaultCat` logic already defaults the pill to Beach in summer, which is the right call. But there's no proactive messaging: no *"Ski season is winding down — 6 southern resorts still firing"* state, no banner, no empty-state copy explaining why. This is a retention risk: skier users will think the app is broken rather than seasonal. A 20-word empty-state copy change and a seasonal sub-label on the Skiing filter pill ("Off-season · 6 resorts open") would close this gap in under an hour and meaningfully reduce ski-user bounce through summer.

---

*Report generated: 2026-06-04 | Audited: 156 venues | Categories: skiing (67), beach (89) | Photos: 155 unique*
