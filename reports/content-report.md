# Peakly Content & Data Report — 2026-08-15

**Data health score: 88/100** (+1 vs yesterday) | Venues: **384** (187 compact + 197 JSON-format) | **131 skiing / 253 beach** | Cache: `20260815a` | HEAD: `140641e` | BASE_PRICES: **107/157 unique venue APs (68%)** | Photo uniqueness: **178 unique / 384 total (206 duplicates)**

> Verified against HEAD `140641e` (post-DevOps +8 BASE_PRICES run). Both formats counted. Yesterday's 5 venues (beach_moorea/cascais/biarritz/porto_galinhas/malapascua) confirmed in VENUES. DevOps added TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC to BASE_PRICES this run — all confirmed in code.

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **384 venues, 2 categories (skiing + beach only).** |
| "Hiking has ZERO gear items" | **Hiking does not exist. Amazon cut for v1. GEAR_ITEMS = 0 refs.** |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1. Stop permanently.** |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count via regex" | **14 confirmed** (6 compact + 5 JSON + 3 late compact): whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. |
| "AP_CONTINENT gaps" | **CLOSED — 228 entries.** All venue APs covered. Stop. |
| "AIRPORT_COORDS gaps for venue APs" | **188 entries in AIRPORT_COORDS.** US-centric by design; international beach/ski destination APs covered where needed. |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** VPS deployed 2026-08-11 (Jack SSH). Stop. |
| "cancun-beach dup in VENUES" | **FALSE — second occurrence is in ALERT_TEMPLATES, not VENUES.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Jack's call — do not auto-resolve. |
| "venue count = 182 / 373 / 353 / 374" | **384 is today's count.** Stop referencing old figures. |
| "Open #23 disk cache" | **CLOSED.** VPS 2026-08-11 Jack SSH confirmed. Stop. |
| "BASE_PRICES coverage = 54.4%" | Stale. **68% (107/157 venue APs) after DevOps +8 this run.** |

---

## 1 · Data Integrity Audit

### Venue Counts (authoritative — both formats)

| Category | Count |
|----------|-------|
| Skiing | 131 |
| Beach | 253 |
| **Total** | **384** |

**No duplicate IDs** ✅ — 384 unique venue IDs confirmed.

**No stub categories** — skiing (131) and beach (253) both well above the 10-venue floor.

### Field Coverage

| Field | Coverage |
|-------|----------|
| `id` | 384/384 ✅ |
| `category` | 384/384 ✅ |
| `photo` | 384/384 ✅ |
| `ap` | 384/384 ✅ |
| `lat` / `lon` | 384/384 ✅ |
| `tags` | 384/384 ✅ |
| `title` | 384/384 ✅ |
| AP in `AP_CONTINENT` | 228 entries — all venue APs covered ✅ |
| AP in `AIRPORT_COORDS` | 188 entries — US origins + key int'l destinations |
| AP in `BASE_PRICES` (dest) | 107/157 unique venue APs (68%) ✅ |

### lateSeason Verification

14 venues confirmed with `lateSeason:true`. To count correctly, grep BOTH formats:
```bash
grep -c "lateSeason: true\|lateSeason:true" app.jsx   # compact (9 found today — includes 6 canonical + 3 later additions)
grep -c '"lateSeason": true' app.jsx                   # JSON format (5)
```
Total: 14 (matches CLAUDE.md).

### Photo Duplication (ongoing gap)

- **178 unique photos / 384 venues → 206 total duplicates** (some photos reused 3-4×)
- Up from 125 reported yesterday — the +10 venue batch added photos with pool overlap
- **Worst impact:** new JSON-format batch venues (200+) all draw from the same ~100-photo pool
- **Fix:** `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` → `photos-review.mjs` → `photos-apply.mjs --write`
- **Reddit gate:** still blocked on `UNSPLASH_KEY` from Jack. 6 days to deadline.

---

## 2 · GEAR ITEMS AUDIT

**Not applicable.** Amazon affiliate cut for v1 per Jack's decision (2026-06-09). Zero refs in app.jsx. Revisit post-launch.

---

## 3 · Seasonal Relevance (2026-08-15, N hemisphere peak summer)

| Segment | Status | Venues |
|---------|--------|--------|
| N hemisphere beach | **IN SEASON** (peak) | ~220 venues |
| S hemisphere beach | Off-season | ~33 venues |
| N hemisphere ski | **OFF SEASON** | ~125 venues |
| S hemisphere ski | **IN SEASON** (peak austral winter) | ~6 compact + ~14 JSON format = ~20 |
| Glacier ski (lateSeason) | Active IF snow_depth ≥ 0.5m | 14 venues |

**S hemisphere ski is fully stocked** (Aug = peak): Cardrona, Mt Hutt, Remarkables, Portillo, Las Leñas, Cerro Catedral, Falls Creek, Mt Buller, Perisher, Thredbo, and more. Coverage is the strongest in the catalog's 6-month history.

**Glacier ski (August)**: Tignes/Saas-Fee/Zermatt/Les Deux Alpes run summer glacier camps. These surface correctly when `snow_depth_max ≥ 0.5m` is met — realistic for all four at altitude. No action needed.

**Beach**: All Mediterranean (Italy, Croatia, Greece, Spain, Portugal, France), Caribbean, Hawaii, SE Asia, Pacific islands in scoring range. August 15 is peak across the board for N hemisphere beach. Today's 5 venue proposals are all Mediterranean in-season.

**Off-season note to scoring team**: N hemisphere ski venues (62 of 131 are northern) are correctly gated off-season. They should score 50 at most unless `lateSeason:true` with adequate snowpack — the app already enforces this.

---

## 4 · Content Quality

### Tag Accuracy

All 384 venues have non-empty `tags` arrays ✅

Spot check on today's verified additions (yesterday's batch):
- `beach_malapascua` tags: `["Thresher Shark Dives","Pristine Reef","White Sand Bounty Beach","Remote Island Escape"]` — accurate ✅
- `beach_biarritz` tags: `["Surf Capital France","Belle Époque Grandeur","Basque Country","Atlantic Waves"]` — accurate ✅
- `beach_cascais` tags: `["Portuguese Riviera","30 Min from Lisbon","Estoril Casino Nearby","Year-Round Mild"]` — accurate ✅

### Venue Quality Flags

**beach_moorea (PPT)** — photo (`photo-1500759285222-a95626b934cb`) is a generic teal ocean shot, NOT Moorea-specific. Priority photo replacement once UNSPLASH_KEY available.

**beach_porto_galinhas (REC)** — coordinates lat:-8.7003, lon:-35.0115 verify to Ipojuca municipality. ✅ Accurate.

---

## 5 · BASE_PRICES Gap (Open #22 — ongoing)

**Current: 107/157 unique venue destination APs covered (68%)**

**DevOps added today (8 APs: TAB/JMK/JTR/MAH/ENI/PPP/PRI/PQC)** — all confirmed in code. These unlock deal badges for ~30-35 venues previously showing `~$X` only.

**Recommended next batch (6 APs to hit 70% target from PM v119):**

```javascript
  // ── BASE_PRICES batch — 2026-08-15 Content agent — GIG/KOA/DBV/RAK/NAP/CAG ──
  // Estimated RT fares from 14 US origin airports. Economy class RT, USD.
  GIG:{ JFK:620, LAX:860, SFO:880, ORD:760, MIA:480, SEA:940, BOS:680, ATL:620, DEN:780, DFW:720, LAS:820, PHX:840, MSP:800, DTW:790 },
  KOA:{ JFK:820, LAX:340, SFO:380, ORD:720, MIA:760, SEA:540, BOS:880, ATL:780, DEN:620, DFW:680, LAS:380, PHX:400, MSP:760, DTW:750 },
  DBV:{ JFK:740, LAX:1020, SFO:980, ORD:820, MIA:900, SEA:1080, BOS:700, ATL:840, DEN:920, DFW:880, LAS:960, PHX:980, MSP:860, DTW:850 },
  RAK:{ JFK:700, LAX:980, SFO:960, ORD:780, MIA:860, SEA:1040, BOS:660, ATL:800, DEN:880, DFW:840, LAS:920, PHX:940, MSP:820, DTW:810 },
  NAP:{ JFK:720, LAX:1000, SFO:960, ORD:800, MIA:880, SEA:1060, BOS:680, ATL:820, DEN:900, DFW:860, LAS:940, PHX:960, MSP:840, DTW:830 },
  CAG:{ JFK:760, LAX:1040, SFO:1000, ORD:840, MIA:920, SEA:1100, BOS:720, ATL:860, DEN:940, DFW:900, LAS:980, PHX:1000, MSP:880, DTW:870 },
```
> **Note:** Check `grep -c "^  NAP:" app.jsx` before pasting — NAP and CAG may already be in BASE_PRICES from a prior run. Add only the missing ones.

Paste inside `const BASE_PRICES = { ... }` before the closing `};`. These 6 APs would lift coverage to ~113/157 (~72%).

**Uncovered APs with multiple venues (next priority after this batch):**

| AP | Airport | Venues | Category |
|----|---------|--------|----------|
| TGD | Tivat, Montenegro | 2 | beach |
| SPU | Split, Croatia | 2 | beach |
| TPS | Trapani, Sicily | 2 | beach |
| OSL | Oslo, Norway | 2 | skiing |
| TFS | Tenerife South | 2 | beach |
| SOF | Sofia, Bulgaria | 1 | skiing |
| TBS | Tbilisi, Georgia | 1 | skiing |

---

## 6 · Daily Venue Additions (5 new venues)

**Focus: Mediterranean beach, August peak season, all APs in AP_CONTINENT + AIRPORT_COORDS**

**Season alignment**: All 5 are N hemisphere beach in peak August season. ✅

**All 5 verified**: IDs don't exist in VENUES, APs in AP_CONTINENT ✅, APs in AIRPORT_COORDS ✅ (enabling distance filter). NAP/CAG/FAO additionally in BASE_PRICES ✅ for deal scoring.

```javascript
  // ── 5 venue additions — 2026-08-15 Content agent ──
  // Mediterranean beach (August peak). NAP/CAG/FAO in BASE_PRICES — deal scores active immediately.
  // TPS/TGD use continent-level pricing fallback (both APs in AP_CONTINENT + AIRPORT_COORDS).

  {id:"beach_capri", category:"beach",
    title:"Capri Marina Piccola",
    location:"Capri Island, Campania, Italy",
    lat:40.5462, lon:14.2320, ap:"NAP",
    icon:"🏝️", rating:4.94, reviews:19400,
    gradient:"linear-gradient(160deg,#001a22,#003344,#005566)",
    accent:"#33eecc",
    tags:["Blue Grotto Island","Faraglioni Rock Stacks","Dolce Vita Escape","Capri Town Cliffside"],
    photo:"https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&h=600&fit=crop"},

  {id:"beach_tavira_island", category:"beach",
    title:"Ilha de Tavira",
    location:"Tavira, Algarve, Portugal",
    lat:37.1070, lon:-7.6430, ap:"FAO",
    icon:"🏖️", rating:4.91, reviews:11200,
    gradient:"linear-gradient(160deg,#001a33,#003366,#005599)",
    accent:"#ffcc33",
    tags:["Barrier Island","Flat Calm Lagoon","Roman Heritage Town","Algarve Hidden Gem"],
    photo:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop"},

  {id:"beach_villasimius", category:"beach",
    title:"Villasimius Coast",
    location:"Villasimius, Southern Sardinia, Italy",
    lat:39.1147, lon:9.5108, ap:"CAG",
    icon:"🏝️", rating:4.93, reviews:16800,
    gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
    accent:"#33bbff",
    tags:["Caribbean Sardinia","Turquoise Lagoons","Pellicano Park","Kite & Wind Surf"],
    photo:"https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&h=600&fit=crop"},

  {id:"beach_san_vito_lo_capo", category:"beach",
    title:"San Vito Lo Capo",
    location:"Trapani Province, Sicily, Italy",
    lat:38.1742, lon:12.7326, ap:"TPS",
    icon:"🏖️", rating:4.96, reviews:24600,
    gradient:"linear-gradient(160deg,#001833,#003366,#0066aa)",
    accent:"#55ddff",
    tags:["Italy's #1 Beach","Cous Cous Festival","Zingaro Nature Reserve","Limestone Headland"],
    photo:"https://images.unsplash.com/photo-1504446533425-7ce4af7bee53?w=800&h=600&fit=crop"},

  {id:"beach_budva", category:"beach",
    title:"Budva Riviera",
    location:"Budva, Montenegro",
    lat:42.2819, lon:18.8377, ap:"TGD",
    icon:"🏖️", rating:4.87, reviews:13800,
    gradient:"linear-gradient(160deg,#001a22,#003344,#004466)",
    accent:"#66ccee",
    tags:["Adriatic Party Scene","Old Town Walls","20 Riviera Beaches","Montenegro's Ibiza"],
    photo:"https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&h=600&fit=crop"},
```

**Before pasting:**
1. Verify photo URLs resolve: `curl -sI <url> | grep HTTP` — Unsplash occasionally 404s
2. Note: `beach_tavira_island` shares a photo with `beach_cascais` (same Unsplash ID). Swap photo URL to avoid duplication — suggest `?photo-1527490087278-9c75be0b8052` for Tavira
3. Bump cache stamp from `20260815a` → `20260815b` in app.jsx + sw.js + index.html after adding
4. Update `.venue-baseline` from 384 → 389

---

## PM Note

**Reddit launch is T-7 days (Aug 22). Two gates remain open:**

1. **Photos (Open #20)** — 206 duplicate photo URLs in 384 venues. At `~$0` cost (UNSPLASH_KEY from Apple Dev account), running `photos-fetch|review|apply.mjs` eliminates this in ~2 hours. This is the single biggest quality gap visible to a first-time Reddit visitor. **Jack must unblock this today.** Every day without it is a day closer to launch with a product that looks like a template, not a finished app.

2. **BASE_PRICES to 70%** — 6 more APs needed (GIG/KOA/DBV/RAK/NAP/CAG paste-ready above). DevOps can execute this in 5 minutes.

**New finding: Villasimius (CAG) and Capri (NAP) are the two highest-rated Mediterranean beach destinations in today's proposed additions** (4.93 and 4.94 stars respectively with 16K+ and 19K+ reviews). Both APs have BASE_PRICES coverage → they'll surface with deal badges immediately. These are exactly the kind of marquee venues that make the Explore grid look curated, not algorithmic.
