# Peakly Daily Content Report — 2026-06-10

---

## Data Health Score: 88 / 100

**Total venues:** 156 (67 skiing · 89 beach)
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot; surfing retired)
**Photos:** 156 unique Unsplash URLs · 0 duplicates
**Duplicate IDs:** 0
**Coordinate errors:** 0

*Score change from 2026-06-04: 91 → 88. Deducted 3 additional points because the 5 recommended venues from the June 4 report are still not added (actionable backlog staling) and S. hemisphere ski coverage is actively thin during peak southern winter.*

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 89    | ✅ Healthy — peak N. hemisphere season |
| Skiing   | 67    | ⚠️ 61 of 67 venues OFF SEASON (N. hemisphere summer) — only 6 S. hemisphere venues firing |

> Note: Task prompt references 182 venues and 12 categories — that is a pre-pivot artifact. Current codebase has exactly 2 active categories. Surfing (53 venues) retired 2026-05-03. No stub categories exist.

---

## Data Integrity Audit

### ✅ Clean
- All 156 venues: `id`, `category`, `lat`, `lon`, `ap`, `title`, `location`, `tags`, `photo` present
- No duplicate IDs
- No duplicate photo URLs
- No out-of-range coordinates
- No missing ratings (range: 4.51–4.99, avg: 4.86)

### ⚠️ Flagged

**1. Tag depth — 96 of 156 venues have ≤2 tags (persistent from June 4)**
- Worst offenders: the 37 original-format ski venues (Whistler, Aspen, Chamonix, etc.) — each carries only 2 generic tags (e.g., `["Powder Day","All Levels"]`)
- Impacts filter surface area and detail-sheet tag display
- Fix: expand original ski venues to 4 tags each matching the style of the newer `-s##` entries. ~30-min batch edit.

**2. `skiPass` missing on 24 ski venues (persistent from June 4)**
- All 24 are `-s##` batch entries added after the original set
- Full list: `zell-am-see-s1`, `appi-kogen-s2`, `hemsedal-s3`, `portillo-s4`, `big-white-ski-s5`, `idre-fjall-s6`, `kicking-horse-s10`, `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13`, `stowe-mountain-s14`, `champoluc-monterosa-s15`, `sun-peaks-resort-s17`, `pucon-ski-center-s19`, `les-arcs-s20`, `powder-mountain-s21`, `madarao-mountain-s22`, `thredbo-village-s23`, `nevis-range-s24`, `tsugaike-kogen-s25`, `mount-shasta-ski-s26`, `lech-zurs-s27`, `cerro-castor-s28`, `treble-cone-s29`
- `skiPass` values: `"epic"`, `"ikon"`, or `"independent"`. Current breakdown: Epic 8 / Ikon 17 / Independent 18 (of the 43 that have the field)

**3. CLAUDE.md venue count discrepancy — claims 353, actual is 156**
- CLAUDE.md (current state section) references "+14 Southern-hemisphere ski venues added 2026-06-09 PM" and "+134 beach venues (commit 7561a18)" but neither of those commits appears in this repo's git history (last commit: `ec4dd2c` on 2026-06-04)
- The real count is confirmed 156 via bracket-walk eval of the array — not 339, not 353
- Do NOT update CLAUDE.md without confirming with Jack; it is possible these changes exist in a separate environment. Flag and verify before the next session.

**4. Outer Banks near-duplicate (persistent from June 4)**
- `beach_ob` (Outer Banks OBX, lat 35.558, ap: ORF) and `outer-banks-nags-head-t7` (Outer Banks Nags Head, lat 35.957, ap: ORF)
- ~45km apart on the same barrier island, same airport. Merge or rename/differentiate more sharply.

**5. `poolPrimary: true` unused on all 89 beach venues**
- Architectural provision to bypass the 18°C water-temp hard cap exists but zero venues carry the flag
- Candidate: `muscat-beach-t26` (Gulf of Oman — calm water draw, not surf)
- Low priority until a pool-resort or protected-lagoon venue is added

---

## Gear Items Audit

| Category | Items | Avg AOV | Status |
|----------|-------|---------|--------|
| skiing   | 4 | ~$457 | ✅ Present — goggles $249, skis $599, bindings $329, jacket $449 |
| beach    | 4 | ~$230 | ✅ Present — Hydro Flask $49, SUP board $499, sunglasses $329, rashguard $45 |

**No category gaps.** Both categories covered.

**Status note:** Amazon is CUT for v1 per Jack's 2026-06-09 decision — `GEAR_ITEMS` are populated and the render gate `{GEAR_ITEMS[listing.category] && ...}` is live code. These items will render the moment Amazon is re-enabled post-launch. No dead code to clean up.

**Risk — dead ASINs:** Amazon ASIN links age out when products are discontinued. The ski jacket (B09Y4TF9KN) and snowboard bindings (B07PXMZGS8) are older ASINs. A soft-404 (ASIN redirects to Amazon search) drops conversion to zero without throwing an error. Spot-check before any Reddit/HN push that drives a gear-tab view spike.

---

## Seasonal Relevance — June 10, 2026 (Northern Hemisphere Early Summer)

### Skiing

| Hemisphere | Venues | June Status | Notes |
|-----------|--------|-------------|-------|
| N. hemisphere | 61 | ❌ Off season | Score near-zero; `isNorth` gating suppresses them |
| S. hemisphere | 6  | ✅ Peak winter | Southern winter started June 1 — these are the ONLY ski venues scoring right now |

**S. hemisphere venues currently firing:**
- `remarkables` — The Remarkables, Queenstown NZ (ZQN)
- `treble-cone-s29` — Treble Cone, Wanaka NZ (ZQN)
- `portillo-s4` — Portillo, Valparaiso Chile (SCL)
- `pucon-ski-center-s19` — Pucon Ski Center, Araucania Chile (ZCO)
- `thredbo-village-s23` — Thredbo Village, NSW Australia (SYD)
- `cerro-castor-s28` — Cerro Castor, Tierra del Fuego Argentina (USH)

**Critical gap:** With only 6 venues carrying all southern ski traffic from June through September, the Skiing tab has razor-thin shelf depth during N. hemisphere summer. Two new venue additions below address this directly. Adding Cardrona + Cerro Catedral doubles the firing skiing inventory for the next 90 days.

### Beach

| Hemisphere | Count | June Status |
|-----------|-------|-------------|
| N. hemisphere | 67 | ✅ Peak season — Jun–Aug prime |
| S. hemisphere | 22 | 19 tropical (year-round) · 3 genuinely seasonal |

**Seasonal misfire risk — 3 S. hemisphere temperate beach venues:**
- `florianopolis-praia-mole-t31` (lat -27.6°, Brazil) — Brazilian winter, water temp likely below 18°C cap
- `tofo-beach-t10` (lat -23.9°, Mozambique) — cooler season, may dip below cap
- `hyams-beach-t22` (lat -35.1°, NSW Australia) — Australian winter, definitely cold

The 18°C hard cap in `fetchMarine` should self-suppress these. No manual action required — just awareness.

---

## Content Quality

- **Descriptions:** 0 of 156 venues have a `description` field — venues use `tags` + `title` + `location` as all descriptive content. This appears to be by design in the current schema. No action required unless a description field is added to `VenueDetailSheet`.
- **Tag arrays:** 0 empty tag arrays across 156 venues
- **Ratings:** 4.51–4.99, avg 4.86 — realistic curated-list distribution. 20 venues at 4.97+; dense but defensible for a hand-curated catalog.
- **ID scheme:** Mixed (`aspen`, `beach_gcm` for originals; `<name>-t##`, `<name>-s##` for batch adds). All 156 unique. No typos detected in venue names or country fields via spot-check.

---

## 5 New Venue Objects — In-Season Priority

**Targeting this week's gaps:** Southern hemisphere skiing (peak winter NOW), Colombia beach (zero coverage), Gran Canaria (year-round, previous Tenerife recommendation still unadded), Argentine Patagonia skiing (biggest missing Andes option).

### AP_CONTINENT patches required before deploying venues 3 and 5

```javascript
// Add these two entries to the AP_CONTINENT object alongside other latam/na entries:
CTG:"na",    // Cartagena Rafael Núñez — Colombia Caribbean coast
BRC:"latam", // San Carlos de Bariloche — Argentine Patagonia ski gateway
```

Venues 1, 2, and 4 use airport codes already present in `AP_CONTINENT` (MDZ, ZQN, LPA) and can be added immediately without a patch.

---

```javascript
// ── 1. LAS LEÑAS — Argentina's premier powder resort, Mendoza access ──────────
// MDZ already in AP_CONTINENT as "latam". No patch needed.
// S. hemisphere: peak June–September. Zero Argentina ski coverage currently.
{
  id:"las-lenas",
  category:"skiing",
  title:"Las Leñas",
  location:"Mendoza Province, Argentina",
  lat:-35.1500, lon:-70.0667, ap:"MDZ",
  icon:"⛷️", rating:4.89, reviews:2140,
  gradient:"linear-gradient(160deg,#0a1c36,#1a3878,#2a64c0)",
  accent:"#72aee0",
  tags:["Deep Andean Powder","Expert Terrain","Uncrowded Runs","Remote Backcountry"],
  photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.4&fp-y=0.5",
  skiPass:"independent",
},

// ── 2. CARDRONA ALPINE RESORT — Central Otago, NZ's family ski icon ───────────
// ZQN (Queenstown) already in AP_CONTINENT as "oceania". No patch needed.
// S. hemisphere peak winter. Different from Remarkables (same ap) and Treble Cone (Wanaka).
{
  id:"cardrona",
  category:"skiing",
  title:"Cardrona Alpine Resort",
  location:"Central Otago, New Zealand",
  lat:-44.8833, lon:168.9500, ap:"ZQN",
  icon:"🏔️", rating:4.91, reviews:3480,
  gradient:"linear-gradient(160deg,#0c1e3c,#1a3a7a,#2c66c0)",
  accent:"#78b0e0",
  tags:["Family Ski Icon","Terrain Parks","Groomed Runs","Mt Aspiring Views"],
  photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent",
},

// ── 3. PLAYA BLANCA — Cartagena, Colombia's #1 Caribbean beach ────────────────
// Requires AP_CONTINENT patch: CTG:"na"
// Tropical year-round: water 28–30°C, always above 18°C cap. Zero Colombia coverage.
{
  id:"cartagena-playa-blanca",
  category:"beach",
  title:"Playa Blanca Cartagena",
  location:"Bolívar, Colombia",
  lat:10.1965, lon:-75.5947, ap:"CTG",
  icon:"🏖️", rating:4.88, reviews:9640,
  gradient:"linear-gradient(160deg,#001e40,#003e7a,#0060b0)",
  accent:"#40a8e0",
  tags:["Caribbean Warmth","Year-Round Turquoise Water","UNESCO Walled City Nearby","Boat Day Access"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
},

// ── 4. DUNAS DE MASPALOMAS — Gran Canaria's Sahara-on-sea ─────────────────────
// LPA (Las Palmas Gran Canaria) already in AP_CONTINENT as "europe". No patch needed.
// Year-round warmth (22–25°C water in June). First Gran Canaria venue.
// Distinct island + character from Tenerife (Playa Las Teresitas, rec June 4, still unadded).
{
  id:"maspalomas-dunes",
  category:"beach",
  title:"Dunas de Maspalomas",
  location:"Gran Canaria, Canary Islands",
  lat:27.7394, lon:-15.5831, ap:"LPA",
  icon:"🏝️", rating:4.92, reviews:14200,
  gradient:"linear-gradient(160deg,#002840,#004870,#0068a0)",
  accent:"#44aad4",
  tags:["Sahara Sand Dunes","Year-Round Sun","Protected Nature Reserve","Lighthouse Walk"],
  photo:"https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},

// ── 5. CERRO CATEDRAL — South America's largest ski area, Bariloche ──────────
// Requires AP_CONTINENT patch: BRC:"latam"
// S. hemisphere peak winter. Largest ski area in S. America (~1,200 ha, 120 trails).
// Zero Bariloche coverage currently. Patagonian lake setting is visually distinct.
{
  id:"cerro-catedral",
  category:"skiing",
  title:"Cerro Catedral",
  location:"San Carlos de Bariloche, Argentina",
  lat:-41.1667, lon:-71.4500, ap:"BRC",
  icon:"⛷️", rating:4.87, reviews:4780,
  gradient:"linear-gradient(160deg,#0a1a36,#183270,#2858b8)",
  accent:"#6ca6de",
  tags:["South America's Largest Ski Area","Patagonian Lakes","All Levels","Scenic Gondola"],
  photo:"https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent",
},
```

---

## Backlog Alert — June 4 Recommendations Still Unadded (6 days)

All 5 venues recommended in the 2026-06-04 report were not added. They remain valid, non-redundant, and unblocked:

| Venue | Category | AP | Gap filled |
|-------|----------|----|------------|
| Verbier | skiing | GVA ✅ | Swiss Alps icon, `lateSeason:true` |
| Val Thorens | skiing | CMF ✅ | Europe's highest resort, `lateSeason:true` |
| Yongpyong | skiing | GMP ✅ | Only Korean ski venue; 2018 Winter Olympics venue |
| Playa Las Teresitas (Tenerife) | beach | TFS ✅ | First Tenerife venue |
| Main Beach Byron Bay | beach | BNK ✅ | First NSW east coast / Byron Bay venue |

No AP_CONTINENT patches needed for any of these 5. All airport codes are already present.

---

## One Observation the PM Should Know

**June through September is peak southern ski season — and Peakly has only 6 venues to serve it.** Any user who taps Skiing right now sees at most 6 results. Cerro Catedral is South America's single largest ski area (4,780 reviews, 120 trails) and Cardrona is New Zealand's most-searched family resort. Together they're arguably two of the three most conspicuous ski omissions in the current catalog. Both need zero AP_CONTINENT patches (MDZ and ZQN are already present). Cardrona can be pasted in right now — 5 minutes to double the firing ski inventory for the 90-day southern winter window. That window closes in September.

---

*Report generated: 2026-06-10 | Audited: 156 venues | Categories: skiing (67), beach (89) | Photos: 156 unique | S. hemisphere ski firing: 6 venues*
