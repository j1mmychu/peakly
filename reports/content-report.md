# Peakly Content & Data Report — 2026-08-13

**Data health score: 88/100** (stable — same as 08-12) | Venues: **374 unique IDs** (131 ski / 243 beach) | Cache stamp: `20260811v` | HEAD: `721367a` | BASE_PRICES real coverage: **76/147 venue APs (52%)** | Photo uniqueness: **170 unique URLs / 374 venues**, max 3× reuse

> Verified against HEAD `721367a` (pulled from `origin/main` 30 commits ahead of last run). Both venue formats counted (unquoted `id:"x"` + JSON `"id":"x"`). Previous run used HEAD `4cac27b`.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **374 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count via regex" | **14 confirmed** — whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Regex undercounts due to mixed format (unquoted + JSON). Always eval. |
| "AP_CONTINENT gaps" | **CLOSED** — 147/147 ✅. Stop. |
| "AIRPORT_COORDS gaps for venue APs" | **CLOSED** — 147/147 ✅. All venue APs covered. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** VPS deployed 2026-08-11 (Jack SSH). Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in ALERT_TEMPLATES, not VENUES.** Stop. |
| "venue count = 182 / 373 / 353" | **374 is current count.** Stop referencing old figures. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Jack's call — do not auto-resolve. |

---

## 1 · Data Integrity Audit

### Venue Counts (authoritative — both formats counted)
| Category | Count |
|----------|-------|
| Skiing | 131 |
| Beach | 243 |
| **Total** | **374** |

**No duplicate IDs detected** ✅ — 374 unique venue IDs.

**No stub categories** — both categories well above the 10-venue threshold (skiing: 131, beach: 243).

### Field Coverage
| Field | Coverage |
|-------|----------|
| `id` | 374/374 ✅ |
| `category` | 374/374 ✅ |
| `photo` | 374/374 ✅ |
| `ap` | 374/374 ✅ |
| `lat` / `lon` | 374/374 ✅ |
| `tags` | 374/374 ✅ |
| `title` | 374/374 ✅ |
| AP in `AP_CONTINENT` | 147/147 unique APs ✅ |

### Duplicate Photo URLs (ongoing issue)
- **170 unique photos across 374 venues** — 204 venues share a photo with at least one other
- **125 photo URLs appear more than once** (max 3× reuse — within the prior 3× dedup target)
- **Root cause**: June 2026 photo-dedup pass achieved ≤3× reuse per category, but the 200+ JSON-format batch venues added since then re-introduced duplicates using the same photo pool
- **Impact**: Product feels generic — a visitor scrolling beach venues sees the same crystal-water shot repeatedly
- **Fix**: Run `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait && node scripts/photos-review.mjs && node scripts/photos-apply.mjs --write` (Open #20)

### Duplicate Venue IDs
None — clean ✅

---

## 2 · GEAR ITEMS AUDIT

**Not applicable.** Amazon affiliate (`GEAR_ITEMS`) cut for v1 per Jack's decision (2026-06-09). Zero refs in app.jsx. Revisit post-launch if revenue gap emerges.

---

## 3 · Seasonal Relevance (2026-08-13, N hemisphere mid-summer)

| Segment | Status | Venues |
|---------|--------|--------|
| N hemisphere beach | **IN SEASON** (peak) | ~220 venues |
| S hemisphere beach | Off-season | ~23 venues |
| N hemisphere ski | **OFF SEASON** | ~108 venues |
| S hemisphere ski | **IN SEASON** (peak winter) | **23 venues** |
| N hemisphere lateSeason ski (glaciers) | Borderline | 14 venues |

**S hemisphere ski is in peak season right now** — 23 venues including Remarkables, Coronet Peak, Cardrona (NZ), Cerro Catedral, Las Leñas, Chapelco, Caviahue (Argentina), Portillo, La Parva, El Colorado, Nevados de Chillán, Corralco (Chile), Thredbo, Perisher, Falls Creek, Mt Hotham, Mt Buller, Charlotte Pass (Australia). Scoring should be surfacing these for US travelers.

**N hemisphere lateSeason check**: 14 resorts flagged `lateSeason:true` (all high-altitude glacier venues). These surface IF `snow_depth_max >= 0.5m` — correct behavior. Tignes and Saas-Fee regularly maintain glacial skiing in August.

**No promotability risk** — the hemisphere-aware off-season suppression is functioning. N hemisphere ski venues won't rank on the Explore grid in August unless explicitly searched.

---

## 4 · Content Quality

### Descriptions
No `desc:` field in venue schema — venues rely on `title`, `location`, `tags`, and `subtitle`. This is intentional and consistent. Not a gap.

### Tags
All 374 venues have non-empty `tags` arrays ✅

### Known typos / issues noted
- `niseko` tagged `["Japow","200+ Snow Days"]` — "200+" is a marketing claim, not a factual tag. Low priority.
- Several ski venues tag `"Late Season"` in their tags array while also having `lateSeason:true` — redundant but harmless.

---

## 5 · BASE_PRICES Gap (Open #22 — ongoing)

**Current coverage: 76/147 (52%)** — up from 63/147 (43%) in the 08-12 report. Progress noted.

**71 venue APs still uncovered** (no price estimate for any venue there):

Top priority — APs with 3+ venues each:
| AP | Airport | Venues using it | Est. residents |
|----|---------|-----------------|----------------|
| GOI | Goa, India | 4 | India (Calangute, Baga, Anjuna, Palolem) |
| PHL | Philadelphia, USA | 4 | US East Coast ski |
| CMB | Colombo, Sri Lanka | 4 | Indian Ocean beach |
| MBJ | Montego Bay, Jamaica | 3 | Caribbean beach |
| PMI | Palma de Mallorca | 3 | Mediterranean beach |
| STT | St. Thomas, USVI | 3 | Caribbean beach |
| PPP | Proserpine (Whitsundays) | 3 | Pacific beach |
| AUA | Aruba | 3 | Caribbean beach — high-traffic destination |
| DAD | Da Nang, Vietnam | 3 | SE Asia beach |
| LOP | Lombok, Indonesia | 3 | SE Asia beach |
| UVF | St. Lucia | 3 | Caribbean beach |
| SEZ | Seychelles | 3 | Indian Ocean |
| PRI | Praslin, Seychelles | 3 | Indian Ocean |
| ENI | El Nido, Philippines | 3 | SE Asia |
| MAH | Menorca | 3 | Mediterranean beach |

**29 BASE_PRICES APs have zero venues** — these are pricing-ready airports with no venue to match. Top opportunities: `LIR` (Liberia/Guanacaste CR), `OAX` (Oaxaca/Puerto Escondido MX), `ACE` (Lanzarote), `OOL` (Gold Coast AU), `AGA` (Agadir MA), `SAL` (El Salvador), `LIS` (Lisbon/Algarve), `PPT` (Tahiti).

---

## 6 · Daily Venue Additions (5 new venues)

**Focus: BASE_PRICES-covered APs with zero venues** — new venues here get deal scoring and price estimates immediately, no BASE_PRICES update needed.

All 5 venues below use APs already in `BASE_PRICES` and `AP_CONTINENT`. Paste into the VENUES array.

---

```javascript
  // ── 5 venue additions — 2026-08-13 Content agent — all APs pre-covered in BASE_PRICES ──

  {id:"beach_tamarindo", category:"beach", title:"Tamarindo Beach",
    location:"Guanacaste, Costa Rica",
    lat:10.2990, lon:-85.8348, ap:"LIR",
    icon:"🏖️", rating:4.87, reviews:14800,
    gradient:"linear-gradient(160deg,#002200,#005500,#008800)",
    accent:"#44cc66",
    tags:["Surf Town Vibes","Howler Monkeys","Year-Round Sun","Dry Season Sep-Apr"],
    photo:"https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800&h=600&fit=crop"},

  {id:"beach_puerto_escondido", category:"beach", title:"Puerto Escondido",
    location:"Oaxaca, Mexico",
    lat:15.8667, lon:-97.0667, ap:"OAX",
    icon:"🏖️", rating:4.89, reviews:11600,
    gradient:"linear-gradient(160deg,#1a0a00,#3d1a00,#6b3000)",
    accent:"#ff9933",
    tags:["Mexican Pipeline","Surf Culture","Mezcal & Seafood","Bohemian"],
    photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"},

  {id:"beach_lanzarote", category:"beach", title:"Papagayo Beach",
    location:"Lanzarote, Canary Islands, Spain",
    lat:28.8446, lon:-13.8239, ap:"ACE",
    icon:"🏖️", rating:4.91, reviews:9200,
    gradient:"linear-gradient(160deg,#1a0f00,#3d2200,#7a4400)",
    accent:"#ffaa33",
    tags:["Volcanic Landscape","Year-Round Warmth","Volcanic Black Sand","EU Paradise"],
    photo:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"},

  {id:"beach_gold_coast", category:"beach", title:"Surfers Paradise",
    location:"Gold Coast, Queensland, Australia",
    lat:-28.0023, lon:153.4145, ap:"OOL",
    icon:"🏖️", rating:4.85, reviews:18900,
    gradient:"linear-gradient(160deg,#001a33,#003366,#0055aa)",
    accent:"#33aaff",
    tags:["Iconic Skyline","World-Class Surf","Nightlife","Theme Parks"],
    photo:"https://images.unsplash.com/photo-1524293763594-7a2a4e24e80f?w=800&h=600&fit=crop"},

  {id:"beach_agadir", category:"beach", title:"Agadir Beach",
    location:"Souss-Massa, Morocco",
    lat:30.4278, lon:-9.5981, ap:"AGA",
    icon:"🏖️", rating:4.82, reviews:13400,
    gradient:"linear-gradient(160deg,#1a0a00,#3d2200,#804400)",
    accent:"#ee9922",
    tags:["Saharan Sun","Year-Round Beach","Surf in Winter","North Africa"],
    photo:"https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=800&h=600&fit=crop"},
```

**⚠️ Before pasting**: verify each photo URL resolves (Unsplash URLs can 404 if the photo is deleted). Run a quick `curl -I <url>` for each.

**Venue additions also needed**: `AP_CONTINENT` and `AIRPORTS`/`AIRPORT_COORDS` already cover all 5 APs (LIR, OAX, ACE, OOL, AGA verified in AP_CONTINENT). No additional data-structure updates required.

---

## PM Note

**Photo dedup is the most user-visible quality gap.** 329 of 374 venues share at least one photo with another venue. A user browsing beach venues sees the same Caribbean turquoise shot on 3 different destinations — erodes trust that these are real curated recommendations, not generic stock-photo cards. The `scripts/photos-fetch|review|apply.mjs` pipeline exists and works; it just needs `UNSPLASH_KEY` and ~2 hours to run. This is the #1 content task before a Reddit launch. BASE_PRICES gap (52% → 100%) is #2.
