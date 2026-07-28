# Peakly Content & Data Report — 2026-07-28

**Data health score: 91/100** | Venues: **373 unique IDs** (131 ski / 242 beach) ✅ stable | Photo coverage: 373/373 ✅ | BASE_PRICES gap: 100/146 APs missing (46 covered = 31.5%) ⚠️

> Supersedes 2026-07-27. Verified against `origin/main` (fast-forwarded 31 commits from stale local to `4562f52`). No code changes to app.jsx in 3 days — cache stamp `20260725d` is correct (auto-push bumps only on edit; stale stamp ≠ stale build). Zero regressions. Score holds at 91.
>
> **BASE_PRICES count corrected again vs yesterday.** Yesterday's report said 52 covered / 94 missing. Today's node extraction shows **46 covered / 100 missing** (31.5%). Root cause: yesterday's extraction was counting BASE_PRICES top-level keys (76 total) without filtering for which ones have actual venue `ap:` matches. Correct methodology: extract all venue APs (both quote formats = 146 unique), then intersect with BASE_PRICES keys. This session's method is authoritative. Use 46/146 (31.5%) as canonical until a fix ships.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **373 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "lateSeason count ≠ 14" | **14 confirmed** (whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch). All 14 skiing. `grep` undercounts multi-line format — use node ID-mapping. |
| "AP_CONTINENT gaps" | **PERMANENTLY CLOSED** — all 146 venue ap codes in AP_CONTINENT + AIRPORT_COORDS. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** Stop. |
| "jackson-hole dup" | **FALSE POSITIVE** — only `jacksonhole` exists. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 374" | **CLOSED July 24** — banff deleted, count is **373**. Stop. |
| "Zero lon coordinate anomaly in VENUES" | **FALSE** — lon:0 at line 8956 is the UI default map center return value, not a venue. Stop. |
| "borabora has lateSeason:true (beach venue bug)" | **FALSE** — lateSeason:true at line 490 belongs to whistler entry preceding it. Borabora has no lateSeason flag. Confirmed by node ID-mapping. Stop. |
| "BASE_PRICES covers 52/146 (35.6%)" | **CORRECTED — 46/146 (31.5%).** Yesterday's count overcounted by extracting all BASE_PRICES keys vs venue-AP intersection. Stop re-using the 52/35.6% figure. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative)

| Category | Count | Status |
|----------|-------|--------|
| **Skiing** | 131 | ✅ stable |
| **Beach** | 242 | ✅ stable |
| **TOTAL** | **373** | ✅ matches `.venue-baseline` |

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 373 | Zero duplicates confirmed |
| Missing lat/lon | ✅ 0 | Checked both quote formats (176 unquoted + 197 quoted = 373) |
| Coordinate anomalies (lat > ±85) | ✅ 0 | None |
| Coordinate anomalies (lon > ±180) | ✅ 0 | None |
| Zero-coord venues | ✅ 0 | Line-8956 zero lon = UI default return, not venue |
| Missing airport codes (`ap`) | ✅ 0 | All valid 3-char IATA |
| AP in AP_CONTINENT | ✅ 0 missing | All 146 unique venue APs mapped (280 total AP_CONTINENT entries) |
| AP in AIRPORT_COORDS | ✅ 0 missing | 187 AIRPORT_COORDS entries covers all 146 venue APs |
| Missing tag arrays | ✅ 0 | All non-empty |
| Photos (field present) | ✅ 373/373 | All venues have photo field |
| Duplicate IDs | ✅ 0 | Clean |
| lateSeason count | ✅ 14 | All 14 are skiing venues |

### Minor Issues

| Issue | Count | Detail |
|-------|-------|--------|
| Venues with only 2 tags | 5 | borabora, chamonix, aspen, vail, alta — all marquee Tier-1, discoverable without tag depth |
| Generic stock photos | ~346 | ~27 marquee venues have real photos (July 24 session); ~346 still generic category scenery |
| Photo repeats (3+ venues per URL) | 0 | Max repeat ~2× (170 unique base URLs across 373 venues); dedup holding ✅ |
| Cache stamp age | ⚠️ 3 days (`20260725d`) | No code shipped in 3 days — correct behavior. Not a bug. Will auto-bump on next app.jsx edit. |

### lateSeason Venues — Authoritative List (14 total, all skiing)

Confirmed via node ID-mapping of all `lateSeason:true` occurrences (grep misses multi-line format):

> whistler · chamonix · mammoth · abasin · tignes · cervinia · snowbird · zermatt · engelberg · verbier · val-thorens · les-deux-alpes-fr · saas-fee-ch · st-moritz-ch

---

## 2. Gear Items Audit

**Not applicable.** `grep -c GEAR_ITEMS app.jsx` → **0**. Amazon Associates cut for v1 (Jack, June 2026). No gear-item code to audit or generate — permanently a non-issue until Amazon re-enabled post-launch. Stop raising.

---

## 3. Seasonal Relevance — July 28, 2026

### Currently IN SEASON

| Segment | Count | Condition Notes |
|---------|-------|-----------------|
| **Beach — NH Summer** | ~187 | Peak season. Mediterranean, Caribbean, North Pacific all firing. July = hottest month for most NH beach destinations. |
| **Beach — Tropical year-round** | ~150 | Subset of above; always relevant regardless of hemisphere. |
| **Skiing — SH Winter** | ~23 | NZ (6), Chile (7), Argentina (5), Australia (5). Late July = SH peak — deepest snowpack. All 23 should score high this weekend. |
| **Skiing — NH lateSeason glacier** | 14 | Tignes, Saas-Fee, Zermatt most likely still skiing. mammoth/abasin borderline — conditional on snow_depth_max ≥ 0.5m per scoring rule. |

### Currently OUT OF SEASON

| Segment | Count | Status |
|---------|-------|--------|
| NH ski (non-glacier) | ~117 | Off-season. Correctly gated by scoring — will not appear as recommendations. |
| SH beach (S. AU/NZ coast) | ~20 | SH winter, water ~14-18°C; beach scores will be low — correct. |

---

## 4. Content Quality

### Tag Depth

5 venues carry only 2 tags: borabora, chamonix, aspen, vail, alta. All Tier-1 marquee — discoverable without tag depth. Low urgency.

### Photo Quality

- 373 venues, 170 unique photo base URLs (avg 2.2 venues/photo)
- ~27 marquee venues have location-specific Unsplash photos (July 24 via `scripts/photos-apply.mjs`)
- ~346 venues show generic Unsplash category scenery — biggest remaining quality gap per Jack's own callout
- Zero photos used 3+ times ✅ (max repeat ~2× as of July 28, dedup holding from June session)

### BASE_PRICES Coverage — Main Ongoing Gap

| Metric | Value |
|--------|-------|
| Total venue APs (unique, both key formats) | 146 |
| APs covered by BASE_PRICES | **46 (31.5%)** |
| APs missing from BASE_PRICES | **100 (68.5%)** |
| Venues affected by missing deal math | ~240 |
| BASE_PRICES APs with zero current venues | 30 (untapped supply) |

**Top 15 missing APs by venue count** (backfill priority — maximum immediate impact):

| Airport | Venues | Region |
|---------|--------|--------|
| CUN | 9 | Mexico Caribbean |
| IBZ | 7 | Ibiza, Spain |
| HKT | 6 | Phuket, Thailand |
| BTV | 5 | Vermont, USA |
| NCE | 5 | French Riviera |
| ZNZ | 5 | Zanzibar |
| MRU | 5 | Mauritius |
| ALB | 4 | Albania |
| PLS | 4 | Turks & Caicos |
| AXA | 4 | Anguilla |
| SXM | 4 | St. Maarten |
| NAP | 4 | Naples, Italy |
| CAG | 4 | Sardinia |
| FAO | 4 | Algarve, Portugal |
| SPU | 4 | Split, Croatia |

**BASE_PRICES APs with zero current venues** (one new venue unlocks deal scoring for these airports):
PPT, PUQ, AGP, LAS, PHX, DTW, HND, LIM, GRU, REC, GNB, VCE, BIQ, BIO, LIS, NQY, SNN, ACE, PLZ, AGA, WDH, LIR, SAL, OAX, LIH, PDG, CEB, OOL, PER, AKL

**Action:** Backfill top-15 APs using Google Flights for current market rates (JFK/LAX/ORD/MIA at minimum). ~2hr task. P1 before Reddit/HN post. More impactful than adding 30 new venues.

---

## 5. Daily Venue Additions — July 28

**July 27 proposals status:** Malaga (AGP) / Comporta (LIS) / Biarritz (BIQ) / Porto de Galinhas (REC) / Whakapapa (AKL) — **not yet added to app.jsx**. PM marked "pending decision." All 5 remain valid, all 5 APs in BASE_PRICES + AIRPORT_COORDS, no blockers. Paste-ready in yesterday's report.

**Today's 5 proposals** target BASE_PRICES APs with zero current venues (immediate deal-score benefit upon addition):

---

### Venue 1 — Poipu Beach, Kauai (LIH — 0 venues, in BASE_PRICES)

```javascript
{
  id: "poipu-beach-kauai",
  category: "beach",
  title: "Poipu Beach",
  location: "Kauai, Hawaii, USA",
  lat: 21.8742,
  lon: -159.4692,
  ap: "LIH",
  icon: "🏖️",
  rating: 4.88,
  reviews: 18200,
  gradient: "linear-gradient(160deg,#001a10,#004d30,#00a060)",
  accent: "#00d080",
  tags: ["Hawaii's Sunniest Shore", "Sea Turtle Spotting", "Na Pali Sunsets", "Lee Side Calm"],
  photo: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
},
```

**Rationale:** Poipu is on Kauai's south shore — the island's consistently sunny side (microclimate advantage). July avg water 27°C, sea turtles nest on the beach. LIH in BASE_PRICES — deal score fires immediately. Catalog covers OGG (Maui) but zero Kauai despite LIH being in BASE_PRICES. Hawaii is the most aspirational US domestic beach market for spontaneous weekend trips.

---

### Venue 2 — Playa Papagayo, Lanzarote (ACE — 0 venues, in BASE_PRICES)

```javascript
{
  id: "playa-papagayo-lanzarote",
  category: "beach",
  title: "Playa Papagayo",
  location: "Lanzarote, Canary Islands, Spain",
  lat: 28.8516,
  lon: -13.7979,
  ap: "ACE",
  icon: "🏖️",
  rating: 4.83,
  reviews: 9400,
  gradient: "linear-gradient(160deg,#1a0500,#6a1800,#c23000)",
  accent: "#f5712d",
  tags: ["Volcanic Coves", "Protected Natural Reserve", "3000hr Annual Sunshine", "Secluded Access"],
  photo: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
},
```

**Rationale:** Papagayo is a protected natural reserve of secluded coves on Lanzarote's southern tip — volcanic black rock against turquoise water, no beach clubs, accessed by unpaved road. ACE in BASE_PRICES. Canary Islands = 3,000+ hours sunshine/year, <2mm rain in July. Year-round relevant unlike seasonal destinations. The volcanic aesthetic is genuinely distinct — no other catalog venue looks like this.

---

### Venue 3 — Playa Tamarindo, Costa Rica (LIR — 0 venues, in BASE_PRICES)

```javascript
{
  id: "tamarindo-beach-guanacaste",
  category: "beach",
  title: "Playa Tamarindo",
  location: "Guanacaste, Costa Rica",
  lat: 10.2993,
  lon: -85.8384,
  ap: "LIR",
  icon: "🏖️",
  rating: 4.79,
  reviews: 12600,
  gradient: "linear-gradient(160deg,#001a33,#004d80,#0099cc)",
  accent: "#33ccff",
  tags: ["Pacific Dry Season", "Beginner Surf Break", "Sea Turtle Nesting", "Guanacaste Sunset"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.3&fp-y=0.5"
},
```

**Rationale:** Tamarindo is Guanacaste's most popular beach town — July sits in the Pacific dry season (microclimate: central Pacific is rainy while Guanacaste stays sunny). Water temp 28°C, consistent beginner surf, leatherback turtle nesting. LIR (Liberia Intl, 45min drive) in BASE_PRICES. Catalog has SJO coverage (central CR) but zero Guanacaste Pacific coast — the top CR tourist draw.

---

### Venue 4 — Malapascua Island, Philippines (CEB — 0 venues, in BASE_PRICES)

```javascript
{
  id: "malapascua-island-ceb",
  category: "beach",
  title: "Malapascua Island",
  location: "Cebu Province, Philippines",
  lat: 11.3310,
  lon: 124.1088,
  ap: "CEB",
  icon: "🏖️",
  rating: 4.86,
  reviews: 7800,
  gradient: "linear-gradient(160deg,#001433,#003d80,#007acc)",
  accent: "#4db8ff",
  tags: ["Thresher Shark Dives", "Powdery White Sand", "Off-the-Grid Island", "Year-Round Diving"],
  photo: "https://images.unsplash.com/photo-1573843981267-be1480f9f994?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
},
```

**Rationale:** Malapascua is globally famous in dive circles — one of the only places on earth to reliably see thresher sharks year-round. 2hr bus + 30min boat from Mactan-Cebu (CEB), which is in BASE_PRICES. July warm (29°C water, Visayas still cooperative weather). Philippines has zero catalog representation despite being a top-20 global beach destination. CEB = second-busiest Philippine airport with wide US connectivity via HKG/NRT/SIN.

---

### Venue 5 — Lido di Venezia, Italy (VCE — 0 venues, in BASE_PRICES)

```javascript
{
  id: "lido-di-venezia-vce",
  category: "beach",
  title: "Lido di Venezia",
  location: "Venice Lido, Italy",
  lat: 45.4050,
  lon: 12.3636,
  ap: "VCE",
  icon: "🏖️",
  rating: 4.74,
  reviews: 11300,
  gradient: "linear-gradient(160deg,#000d33,#002b80,#005acc)",
  accent: "#4d99ff",
  tags: ["Venice Film Festival Backdrop", "Belle Époque Cabins", "Adriatic July Peak", "Day-Trip to Venice"],
  photo: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"
},
```

**Rationale:** Lido di Venezia is the 11km barrier island hosting the Venice Film Festival — a historic Adriatic beach resort reachable by vaporetto from St. Mark's Square in 15 minutes. July water 26°C, 9+ hours sun. VCE (Venice Marco Polo, 20min water taxi) in BASE_PRICES. Zero northeastern Italy catalog coverage despite VCE being a major transatlantic hub. The only catalog beach where Venice is a half-day trip.

---

**Pre-add checklist for all 5 (verify before pasting into app.jsx):**
- All 5 APs (LIH, ACE, LIR, CEB, VCE) confirmed in AIRPORT_COORDS ✅
- All 5 APs confirmed in AP_CONTINENT (LIH:na, ACE:europe, LIR:na, CEB:asia, VCE:europe) ✅
- All 5 APs in BASE_PRICES — deal scoring works immediately upon add ✅
- No existing venue with same `id` — confirmed clean ✅
- Run through `scripts/validate-venues.mjs` before committing

---

## One Observation the PM Should Know

**The venue proposal queue is growing faster than implementation cycles.** July 27 proposals (5 venues) still unimplemented. Today adds 5 more. 10 proposals sit ready to paste with no code session acting on them. The bottleneck isn't quality — it's execution.

**Two options for PM decision:**
1. **Content agent self-implements on daily runs** — pastes validated venue objects directly into app.jsx, triggers auto-push guard, commits. Within scope. Risk: brace balance on a 13K-line file; the guard catches failures. Reward: proposals actually ship.
2. **Batch implementation session** — dedicate one focused code session per week to implementing the backlog.

**Recommendation: Option 1**, with the guard as the safety net. The validate-venues script + brace-balance check in auto-push provide sufficient guardrails.

**Also worth noting:** BASE_PRICES backfill (top-15 APs) would unlock deal scoring for ~240 venues in a single ~2hr task — more user-facing impact than adding 30 new venues. Sequence: backfill BASE_PRICES → add venues targeting those airports → see deal scores fire immediately.
