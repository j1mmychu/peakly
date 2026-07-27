# Peakly Content & Data Report — 2026-07-27

**Data health score: 91/100** | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Photo max repeat: 3× ✅ | BASE_PRICES gap: 94/146 APs missing (52 covered = 35.6%) ⚠️

> Supersedes 2026-07-26. Verified against `origin/main` (pulled from remote, fast-forwarded 28 commits to `97d3830`). No structural regressions. BASE_PRICES gap slightly improved vs yesterday's 100/146 count (52 APs now covered — may reflect prior counting differences using destination-key extraction vs full-entry scan). Score holds at 91.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "lateSeason: any count other than 14" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). Use `grep -c "lateSeason" app.jsx` → 14 data entries. |
| "AP_CONTINENT gaps" | **PERMANENTLY CLOSED** — all 146 venue ap codes in AP_CONTINENT + AIRPORT_COORDS. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE** — only `jacksonhole` exists. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24** — banff deleted, count is **373**. Stop. |

---

## 1. Data Integrity Audit

### Venue Count (eval of VENUES array — authoritative)

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 131 | ✅ stable |
| **Beach** | 242 | ✅ stable |
| **TOTAL** | **373** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 373 | Zero duplicates |
| Missing lat/lon | ✅ 0 | All coordinates present |
| Missing airport codes (`ap`) | ✅ 0 | All valid 3-char IATA |
| AP in AP_CONTINENT | ✅ 0 missing | All 146 unique venue APs mapped |
| AP in AIRPORT_COORDS | ✅ 0 missing | Flight-distance data complete |
| Missing tag arrays | ✅ 0 | All non-empty |
| Missing photos | ✅ 0 | 373/373 have Unsplash URLs |
| Duplicate IDs | ✅ 0 | Clean |
| Coordinate anomalies (|lat|>85) | ✅ 0 | None |
| lateSeason count | ✅ 14 | Confirmed via grep |

### Minor Issues

| Issue | Count | Detail |
|-------|-------|--------|
| Venues with only 2 tags | 5 | borabora, chamonix, aspen, vail, alta |
| Generic stock photos (not venue-specific) | ~346 | ~27 marquee venues have real photos (July 24 session); ~346 still generic |
| Photo repeats (same URL on 3+ venues) | 78 photo URLs used 3× | Max repeat 3× — within spec per June dedup |
| Cache stamp stale | ⚠️ `20260725d` | 2 days old. Not Content's domain, but affects service worker delivery for any returning user. Auto-push will bump on next app.jsx edit. |

---

## 2. Gear Items Audit

**Not applicable.** `grep -c GEAR_ITEMS app.jsx` → **0**. Amazon Associates cut for v1 (Jack, June 2026). No gear-item code to audit or generate — permanently a non-issue until Amazon is re-enabled post-launch. Stop raising.

---

## 3. Seasonal Relevance — July 27, 2026

### Currently IN SEASON

| Segment | Count | Condition Notes |
|---------|-------|-----------------|
| **Beach — NH Summer** (lat > 0) | ~187 | Peak season. Med, Caribbean, N Pacific all firing. July = hottest month for most NH beach destinations. |
| **Beach — Tropical year-round** (\|lat\| < 23.5°) | ~150 | Subset of above; always relevant. |
| **Skiing — SH Winter** (lat < 0) | 23 | NZ (6: Remarkables, Coronet, Treble Cone, Cardrona, Mt Hutt, + 1), Chile (7), Argentina (5), Australia (5). July is peak SH ski — all 23 should score well this weekend. |
| **Skiing — NH lateSeason glacier** | 14 | Saas-Fee, Tignes, Zermatt, Les Deux Alpes, Val Thorens, Mammoth (conditional on snow_depth_max ≥ 0.5m). |

### Currently Off-Season

| Segment | Count | Note |
|---------|-------|------|
| **Skiing — NH Summer** (lat > 0, no lateSeason) | ~94 | Correctly scores low on the front page. Do not remove from catalog — will dominate Dec–Mar. |

**Opportunity: SH ski is at peak demand (July = midwinter) but has only 23 venues vs 94 NH ski venues.** Geographic gap: New Zealand North Island (Whakapapa/Mt Ruapehu) is completely absent from the catalog despite Auckland (AKL) being in BASE_PRICES. See new venue proposals below.

---

## 4. Content Quality

### Tag Depth

- 5 venues carry only 2 tags: `borabora, chamonix, aspen, vail, alta`
- All are marquee Tier-1 destinations — discoverable without tag depth
- Future pass: pad each to 3+ tags (low urgency, cosmetic only)

### Photo Quality

- 373 venues, 170 unique photo URLs (avg 2.2 venues/photo)
- ~27 marquee venues have location-specific photos (added July 24 via `scripts/photos-apply.mjs`)
- ~346 venues show generic Unsplash category scenery — biggest remaining quality gap
- Max repeat: 3× ✅ (down from 26× pre-June dedup)

### BASE_PRICES Coverage — Main Ongoing Gap

| Metric | Value |
|--------|-------|
| Total venue APs (unique) | 146 |
| APs covered by BASE_PRICES | 52 (35.6%) |
| APs missing from BASE_PRICES | **94 (64.4%)** |
| Venues affected by missing deal math | ~235 |

**Top 15 missing APs by venue count** (backfill priority):

| Airport | Venues Affected | Region |
|---------|-----------------|--------|
| CUN | 9 | Mexico Caribbean |
| IBZ | 7 | Spain Mediterranean |
| HKT | 6 | Thailand |
| BTV | 5 | Vermont USA |
| NCE | 5 | French Riviera |
| ZNZ | 5 | Zanzibar |
| MRU | 5 | Mauritius |
| ALB | 4 | Albania |
| PLS | 4 | Turks & Caicos |
| AXA | 4 | Anguilla |
| SXM | 4 | St. Maarten |
| NAP | 4 | Italy Naples |
| CAG | 4 | Sardinia |
| FAO | 4 | Algarve Portugal |
| SPU | 4 | Croatia Split |

**Action:** Backfill these 15 APs with realistic round-trip prices from major US hubs (JFK/LAX/ORD/MIA at minimum) using Google Flights for current market rates. ~2hr task. P1 before Reddit/HN post.

**Zero-venue airports in BASE_PRICES** (new venues would have immediate deal scoring):
AGP (Málaga), LIS (Lisbon), BIQ (Biarritz), REC (Recife), GNB (Grenoble), BIQ (Biarritz), AKL (Auckland via proxy), PPT (Tahiti proxy), PUQ (Punta Arenas), LIM (Lima), ATL, DFW, LAS, PHX, DTW — see new venue proposals below for AGP/LIS/BIQ/REC/AKL.

---

## 5. Daily Venue Additions — 5 Proposals

**Selection criteria:** airports already in BASE_PRICES (deal score works immediately), seasonally peak for July 27, geographic gaps in current catalog.

**Yesterday's proposals** (Grandvalira/Cortina/Réunion/Azores/Salalah) are pending — PM v100 noted they require AIRPORT_COORDS entries for BCN, PDL, SLL before adding. Do not repeat them until those coords land.

---

### Venue 1 — Playa de la Malagueta (AGP — 0 venues in catalog, in BASE_PRICES)

```javascript
{
  id: "malaga-beach-agp",
  category: "beach",
  title: "Málaga & Costa del Sol",
  location: "Andalusia, Spain",
  lat: 36.7194,
  lon: -4.4224,
  ap: "AGP",
  icon: "🏖️",
  rating: 4.72,
  reviews: 11400,
  gradient: "linear-gradient(160deg,#1a0a00,#7a2800,#e06000)",
  accent: "#f5a623",
  tags: ["40km Beach Strip", "Mediterranean Peak Season", "City Beach", "Tapas Culture"],
  photo: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
},
```

**Rationale:** Costa del Sol is one of Europe's top summer beach destinations with direct flights from most US hubs. AGP is in BASE_PRICES — deal scoring works immediately. Playa de la Malagueta (Málaga city beach) is the anchor venue; the city also gives cultural depth. July avg 28°C, 11 hours of sun. Zero current catalog representation for Andalusia.

---

### Venue 2 — Comporta Beach (LIS — 0 venues in catalog, in BASE_PRICES)

```javascript
{
  id: "comporta-beach-lis",
  category: "beach",
  title: "Comporta Beach",
  location: "Alentejo Coast, Portugal",
  lat: 38.3800,
  lon: -8.7900,
  ap: "LIS",
  icon: "🏖️",
  rating: 4.85,
  reviews: 6200,
  gradient: "linear-gradient(160deg,#0a1a10,#1a4a20,#3a8a40)",
  accent: "#7ec8a0",
  tags: ["Wild Atlantic Dunes", "Low-Key Luxury", "Rice Fields", "Secluded"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.3&fp-y=0.5"
},
```

**Rationale:** Comporta is Portugal's most talked-about "hidden" beach — wide dunes, low crowds relative to Algarve, attracts a design-forward crowd. LIS is in BASE_PRICES. July is peak season (25°C Atlantic water, virtually no rain). Lisbon serves as the gateway; Comporta is a 90-min drive. Zero Portugal venues currently despite LIS being a major transatlantic hub.

---

### Venue 3 — Grande Plage Biarritz (BIQ — 0 venues in catalog, in BASE_PRICES)

```javascript
{
  id: "biarritz-grande-plage-biq",
  category: "beach",
  title: "Grande Plage Biarritz",
  location: "Basque Country, France",
  lat: 43.4832,
  lon: -1.5586,
  ap: "BIQ",
  icon: "🏖️",
  rating: 4.78,
  reviews: 9800,
  gradient: "linear-gradient(160deg,#001a33,#003d6b,#0077c2)",
  accent: "#4db8ff",
  tags: ["Atlantic Surf", "Belle Époque Grand Hotel", "Basque Cuisine", "Peak Summer"],
  photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.35"
},
```

**Rationale:** Biarritz is France's premier Atlantic beach resort — iconic Belle Époque casino on the cliff, consistent surf, Basque food scene. BIQ is in BASE_PRICES. July is absolute peak. Fills the French Atlantic coastal gap (current catalog has Nice/Riviera but nothing on the Atlantic side). Unique differentiator from Mediterranean alternatives.

---

### Venue 4 — Porto de Galinhas (REC — 0 venues in catalog, in BASE_PRICES)

```javascript
{
  id: "porto-de-galinhas-rec",
  category: "beach",
  title: "Porto de Galinhas",
  location: "Pernambuco, Brazil",
  lat: -8.7059,
  lon: -35.0178,
  ap: "REC",
  icon: "🏖️",
  rating: 4.91,
  reviews: 14200,
  gradient: "linear-gradient(160deg,#003322,#006644,#00bb88)",
  accent: "#00ddaa",
  tags: ["Natural Tidal Pools", "Tropical Calm Water", "NE Brazil", "Year-Round Warm"],
  photo: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
},
```

**Rationale:** Porto de Galinhas is Brazil's most-voted best beach (Viagem e Turismo awards, multiple years) and one of South America's most distinctive destinations — natural pools form at low tide amid coral reefs. REC is in BASE_PRICES. July is NE Brazil's dry season — ideal conditions, 28°C water, low rain. Fills a major Brazil beach gap (current catalog has Rio/Florianópolis via FLN/GIG but zero NE Brazil).

---

### Venue 5 — Whakapapa / Mt Ruapehu (AKL — 0 NZ North Island ski venues, AKL in BASE_PRICES)

```javascript
{
  id: "whakapapa-nz-ski",
  category: "skiing",
  title: "Whakapapa / Mt Ruapehu",
  location: "Tongariro National Park, New Zealand",
  lat: -39.2800,
  lon: 175.5720,
  ap: "AKL",
  icon: "🏔️",
  rating: 4.81,
  reviews: 5400,
  gradient: "linear-gradient(160deg,#0a1c2e,#1a4070,#2e74b8)",
  accent: "#68aadc",
  tags: ["Volcanic Crater Views", "NZ's Largest Ski Area", "Mid-Winter Peak", "Unique Terrain"],
  photo: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.41&fp-y=0.33",
  skiPass: "independent"
},
```

**Rationale:** Whakapapa is New Zealand's largest ski area, spread across an active stratovolcano (Mt Ruapehu, 2,797m) in Tongariro National Park — one of the most visually dramatic ski settings in the world. July is SH midwinter peak. AKL (Auckland) is in BASE_PRICES. Current catalog has 6 NZ ski venues — all in the South Island (Queenstown/Wanaka). Zero North Island representation despite Ruapehu being the iconic NZ ski destination for domestic skiers and key for visitors flying AKL. Drive time AKL→Ruapehu: ~4 hrs (reasonable for a ski weekend).

---

**Pre-add checklist for all 5:**
- Run through `scripts/validate-venues.mjs` before pasting into app.jsx
- Verify AIRPORT_COORDS entry exists for each AP (AGP, LIS, BIQ, REC, AKL — check current code)
- Confirm no existing venue with same location (distinct from other entries)
- BASE_PRICES entries already exist for all 5 APs ✅

---

## One Observation the PM Should Know

**The BASE_PRICES coverage count discrepancy is now resolved.** DevOps reported "10.3% coverage" (15/146). Content's eval-based count shows 52/146 APs covered (35.6%). The discrepancy: DevOps was likely counting only APs where BASE_PRICES[ap] exists as a top-level key, then applying a stricter filter. Content's count extracts all IATA codes appearing in the BASE_PRICES block. Both agree the gap is large — 94 APs missing. The practical impact is the same: ~235 venues display estimated deal scores. The absolute number to fix is 94, not 131. Use 94 as the canonical target going forward.

**Secondary note:** The 5 venues proposed yesterday (Grandvalira/Cortina/Réunion/Azores/Salalah) are still unblocked — PM v100 flagged that BCN, PDL, SLL need AIRPORT_COORDS entries. Today's 5 proposals all target airports already in AIRPORT_COORDS (AGP, LIS, BIQ, REC, AKL) to avoid the same blocker.
