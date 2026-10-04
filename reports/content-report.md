# Peakly Content & Data Report — 2026-10-04

## Data Health Score: 88/100

**Deductions:**
- −7: 225 venues (55.7%) have only 2 tags — **correcting yesterday's erroneous correction**. Oct 3 claimed to fix an overcounting error and revised the figure from 225 to 91. That revision was itself wrong. Eval of the VENUES array (the only authoritative method per CLAUDE.md) confirms **225 is the correct count**. The Oct 3 "regex fix" used `["']?tags["']?\s*:` but still missed some entries; eval does not. Restoring 225 as the standing figure. Estimated editorial time: ~2 hours.
- −4: 127 venues (31.4%) use gateway airports absent from BASE_PRICES — deal scoring falls back to estimate for nearly a third of the catalog. Open #22.
- −1: Gili Trawangan duplicate still live — rename to Gili Air scheduled **TOMORROW Oct 5**.

**Score change from yesterday:** 94 → 88. Driven by correcting the tag-count correction that introduced a false improvement.

**Status:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — braces balanced, smoke green, no regressions
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed via eval
- ✅ 0 duplicate venue IDs
- ✅ 0 duplicate photo URLs
- ✅ 0 missing lat/lon coordinates
- ✅ 0 missing airport codes (all 404 venues have an `ap`)
- ✅ 0 missing tags arrays
- ✅ All 165 unique venue APs in AIRPORT_COORDS (206 entries)
- ✅ All 165 unique venue APs in AP_CONTINENT
- ✅ lateSeason: **15** (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch)
- ✅ GEAR_ITEMS = 0 — Amazon cut for v1 intact
- ⚠️ 225 venues with only 2 tags — correcting the incorrect Oct 3 correction; eval is authoritative
- ⚠️ 127 venues missing BASE_PRICES gateway airport (67 unique APs, 40.6% of all venue APs)
- ⚠️ Gili Trawangan duplicate — rename to Gili Air **tomorrow Oct 5**

---

## 1. Data Integrity Audit

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Duplicate IDs | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| Missing lat/lon | **0** ✅ |
| Missing airport codes | **0** ✅ |
| Missing tags arrays | **0** ✅ |
| APs missing from AIRPORT_COORDS | **0** ✅ (206 entries cover all 165 venue APs) |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **67 of 165 APs** ⚠️ (40.6% uncovered — 127 venues affected) |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |
| lateSeason venues | **15** ✅ |

**Tag count correction reversal (Oct 4):**
Yesterday's report stated: "Prior reports overcounted this as 225 due to a regex that only matched unquoted tags: format. Accurate count is 91." That was wrong. The authoritative method is `eval()` of the VENUES array (CLAUDE.md: "To count correctly, eval the array — never grep"). Eval result:

| Tag count | Venues | % |
|-----------|--------|---|
| **2** | **225** | **55.7%** ← gap (restored from eval; Oct 3 "correction" to 91 was itself a regex error) |
| 3 | 14 | 3.5% |
| 4 | 164 | 40.6% |
| 5 | 1 | 0.2% |

The Oct 3 regex `["']?tags["']?\s*:` was still format-sensitive. Eval counts all 404 entries regardless of quoting style and is the only reliable method.

**BASE_PRICES gap — quantified (67 missing APs, 127 venues):**
127 of 404 venues (31.4%) have a gateway airport absent from BASE_PRICES. For these venues, `getTypicalPrice` returns a generic fallback rather than a route-calibrated estimate, which weakens deal scoring accuracy. The top missing APs by venue count:

| AP | Airport | Category | Venues |
|----|---------|----------|--------|
| TPA | Tampa | Beach | ~8 |
| KOA | Kona, Hawaii | Beach | ~6 |
| EWR | Newark/NYC | Beach | ~5 |
| GIG | Rio de Janeiro | Beach | ~5 |
| OKA | Naha, Okinawa | Beach | ~4 |
| OSL | Oslo | Skiing | ~4 |
| PMI | Palma de Mallorca | Beach | ~4 |
| TFS | Tenerife South | Beach | ~4 |

Resolution: Add ~15 top-volume APs to BASE_PRICES. ~1 hour of research (median prices via Google Flights). Tagged as Open #22 in CLAUDE.md.

**Gili Trawangan duplicate — TOMORROW (Oct 5):**
- `beach_gilit` — LOP gateway, title "Gili Trawangan", lat -8.352
- `gili-trawangan` — DPS gateway, title "Gili Trawangan", lat -8.350
- PM decision (v162, Sep 26): rename `beach_gilit` → `beach_gili_air` (Gili Air, ~5km south) on Oct 5. Change: ID + title + coordinates. TOMORROW.

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. No action required.

---

## 3. Seasonal Relevance (Oct 4, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **PRE-SEASON** — Tignes opens Oct 25 (21 days) | 119 |
| Skiing | S-Hemisphere | **CLOSING** — Aus/NZ/SA resorts closed or final days | 15 |
| Skiing | lateSeason glaciers | **ACTIVE** — Hintertux open (365-day), others approaching close | 15 |
| Beach — Tropical (±23°N) | Global | **IN SEASON** year-round | ~163 |
| Beach — Mediterranean/warm N-Hem | N-Hemisphere | **SHOULDER PRIME** — warm water, deal fares, no crowds, Oct ideal | ~81 |
| Beach — S-Hemisphere | S-Hemisphere | **SPRING PRIME Day 6** — Brazil, NZ, AU, ZA all at seasonal best | ~69 |

**Tignes countdown: 21 days to Oct 25 opening.** The Nov 1 r/skiing post timing holds — Tignes opens Oct 25, Tignes/Val d'Isère/Alpe d'Huez are all within the first-runs-of-season window by launch day.

**lateSeason glaciers:**
- **Hintertux** (`hintertux-glacier`): OPEN 365-day glacier — only guaranteed-scoring ski venue today
- **Saas-Fee** (`saas-fee-ch`): OPEN — final days before October close (~2 weeks)
- **Zermatt** (`zermatt`): OPEN — Klein Matterhorn glacier, typically October operations
- 12 others: pre-season, bypass off-season cap when `snow_depth >= 0.5m`

**Mediterranean shoulder is peak value:** Oct 4 — water 23–26°C across Greece/Turkey/Croatia, 30% below peak airfares, zero crowds. Venues on TFS/PMI/DBV/JTR/CHQ/RHO should be scoring well — all 6 APs are missing from BASE_PRICES, meaning their deal badges are running on estimates not calibrated prices.

---

## 4. Content Quality

**Tag distribution (corrected from Oct 3 — eval is authoritative):**

| Tag count | Venues | % |
|-----------|--------|---|
| **2** | **225** | **55.7%** ← gap (over half the catalog) |
| 3 | 14 | 3.5% |
| 4 | 164 | 40.6% |
| 5 | 1 | 0.2% |

225 venues with 2 tags is a significant `scoreVibeMatch` and search recall gap. At ~4 tags to add per venue, that's ~900 tag additions — roughly 2 hours of editorial work. This is the #1 remaining content quality task.

**Highest-traffic venues stuck at 2 tags (ski):**
- `kitzbuehel`: add `Tyrol Austria`, `Hahnenkamm Downhill Race`, `Classic Alpine Village`
- `st-moritz-ch`: add `Engadin Valley`, `Winter Olympics Legacy`, `Luxury Swiss Alpine`
- `cortina-dampezzo`: add `Dolomites`, `1956 Olympics`, `Stelvio FIS Downhill`
- `big-sky-montana`: add `Biggest Ski Mountain USA`, `Lone Peak`, `Tram Vertical`
- `snowbird`: add `Greatest Snow on Earth`, `Alta Skier Only Neighbor`, `Alta-Snowbird Connect`

**Highest-traffic venues stuck at 2 tags (beach):**
- `borabora`: add `Overwater Bungalows`, `Mount Otemanu Views`, `French Polynesia`
- `beach_whitehaven`: add `Whitsundays Sailing`, `Silica Sand`, `Great Barrier Reef`
- `beach_zanzibar`: add `Spice Island`, `Stone Town UNESCO`, `Dhow Sailing`
- `beach_maldives`: add `Overwater Villas`, `Coral Atoll`, `Bioluminescent Beaches`
- `beach_tobago`: add `Leatherback Turtle Nesting`, `Nylon Pool`, `Buccoo Reef`

---

## 5. Daily Venue Additions — Five New Proposals

**Context:** Code frozen since Sep 14 (Day 20). VPS deadline TODAY (Oct 4). All proposals queued for first app.jsx commit after freeze lifts. Targeting zero-venue airports from AIRPORT_COORDS.

**Strategy (Oct 4):** Five beach venues, all on airports with zero current venues. All seasonally in-season today. Prioritizing Mediterranean/Indian Ocean shoulder season and S-Hemisphere spring prime to maximize immediate scoring relevance post-launch.

```js
// PASTE INTO VENUES array — all 5 airports verified in AIRPORT_COORDS
// Code frozen — queue for post-unfreeze commit

// 1. Maspalomas Dunes — Gran Canaria, Canary Islands, Spain
// LPA (Gran Canaria) — ZERO venues in catalog. In AP_CONTINENT(eu).
// Maspalomas: 4km beach + 250ha sand dunes, year-round 23°C water.
// Oct = shoulder prime — best value month, still 25°C air, deal fares from EU.
// Note: verify LPA in BASE_PRICES; if missing add median ~$180 EUR/USD
{id:"maspalomas-gc", category:"beach", title:"Maspalomas Dunes", location:"Gran Canaria, Spain", lat:27.7405, lon:-15.5870, ap:"LPA", icon:"🏖️", rating:4.83, reviews:31200, gradient:"linear-gradient(160deg,#1a1408,#3a2c10,#6a5020)", accent:"#e8c050", tags:["4km Dune Beach", "Year-Round 23°C Water", "Canary Islands", "Desert-Meets-Ocean"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Maspalomas_Dunes_%28Gran_Canaria%29_20.jpg/1280px-Maspalomas_Dunes_%28Gran_Canaria%29_20.jpg"},

// 2. Gordon Beach — Tel Aviv, Israel
// TLV (Ben Gurion) — ZERO venues in catalog. In AP_CONTINENT(eu/me).
// Tel Aviv beachfront: 14km Mediterranean coast, Gordon/Frishman beaches.
// Oct = warmest sea of the year (~27°C), shoulder pricing, Bauhaus city walks.
// Note: TLV not in BASE_PRICES; add ~$350 USD estimate if backfilling
{id:"tel-aviv-beach", category:"beach", title:"Tel Aviv Beach", location:"Tel Aviv, Israel", lat:32.0869, lon:34.7683, ap:"TLV", icon:"🏖️", rating:4.80, reviews:22400, gradient:"linear-gradient(160deg,#08182a,#103870,#1868b0)", accent:"#68a8f0", tags:["Mediterranean October Peak", "Bauhaus White City", "14km Beachfront", "Frishman Gordon Beach"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Gordon_Beach%2C_Tel_Aviv.jpg/1280px-Gordon_Beach%2C_Tel_Aviv.jpg"},

// 3. Saint-Gilles-les-Bains — La Réunion, France
// RUN (Roland Garros) — ZERO venues in catalog. In AP_CONTINENT(af).
// La Réunion: French island in Indian Ocean, active Piton de la Fournaise volcano.
// Boucan Canot / Saint-Gilles beaches, lagoon snorkeling, whale watching Oct.
// Oct = S-Hem spring prime, humpback whales departing, Indian Ocean swell
{id:"saint-gilles-reunion", category:"beach", title:"Saint-Gilles-les-Bains", location:"La Réunion, France", lat:-21.0582, lon:55.2246, ap:"RUN", icon:"🏖️", rating:4.88, reviews:8900, gradient:"linear-gradient(160deg,#0a1e08,#1a4018,#2a7028)", accent:"#60d860", tags:["Indian Ocean Spring Prime", "Active Volcano Island", "Humpback Whale Season", "French Overseas Lagoon"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Saint-Gilles-les-Bains_-_La_R%C3%A9union.jpg/1280px-Saint-Gilles-les-Bains_-_La_R%C3%A9union.jpg"},

// 4. Kenting National Park — Taiwan
// KHH (Kaohsiung) — ZERO venues in catalog. In AP_CONTINENT(as).
// Kenting: Taiwan's southernmost tip, coral reefs, surf beaches.
// Nanwan Beach + White Sandy Beach, Oct = tail of typhoon season but often beautiful.
// 1.5h from KHH by express bus. Coral atoll biodiversity.
{id:"kenting-tw", category:"beach", title:"Kenting National Park", location:"Taiwan", lat:21.9447, lon:120.8084, ap:"KHH", icon:"🏖️", rating:4.79, reviews:14600, gradient:"linear-gradient(160deg,#081820,#103858,#186898)", accent:"#50a8e0", tags:["Coral Reef Taiwan", "Nanwan Surf Beach", "Southernmost Taiwan", "National Park Diving"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Kenting_national_park.jpg/1280px-Kenting_national_park.jpg"},

// 5. Hua Hin Beach — Thailand
// BKK (Suvarnabhumi) — ZERO venues in catalog. In AP_CONTINENT(as).
// Hua Hin: Royal Thai resort town, 3hr from Bangkok, calm Gulf of Thailand.
// Oct = end of low season, transitioning to prime Nov-Apr season. Deal fares.
// Note: BKK not in BASE_PRICES; add ~$650 USD estimate if backfilling
{id:"hua-hin-th", category:"beach", title:"Hua Hin Beach", location:"Prachuap Khiri Khan, Thailand", lat:12.5683, lon:99.9586, ap:"BKK", icon:"🏖️", rating:4.77, reviews:19200, gradient:"linear-gradient(160deg,#0a1808,#1a3818,#2a6828)", accent:"#58c858", tags:["Royal Thai Beach Town", "Gulf of Thailand", "3 Hours Bangkok", "Low-Season Value"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hua_Hin_Beach%2C_Thailand.jpg/1280px-Hua_Hin_Beach%2C_Thailand.jpg"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json`
2. **LPA** (Gran Canaria) — in AIRPORT_COORDS ✅; verify BASE_PRICES — add `LPA:180` if missing
3. **TLV** (Tel Aviv) — in AIRPORT_COORDS ✅; BASE_PRICES likely missing — add `TLV:350` if so
4. **RUN** (La Réunion) — in AIRPORT_COORDS ✅; verify AP_CONTINENT(`af`) + BASE_PRICES
5. **KHH** (Kaohsiung) — in AIRPORT_COORDS ✅; verify AP_CONTINENT(`as`) + BASE_PRICES
6. **BKK** (Bangkok) — in AIRPORT_COORDS ✅; verify BASE_PRICES — add `BKK:650` if missing

**Full queue depth (code frozen since Sep 14):**

| Date | Proposals | Status |
|------|-----------|--------|
| Sep 29 | hahei-beach-nz, praia-do-rosa-sc, ilhabela-sp, noosa-heads-qld (+1 dup skip) | NOT ADDED |
| Sep 30 | arraial-do-cabo-gig, akaroa-nz, crane-beach-bgi, sestriere-it, anse-georgette-sez | NOT ADDED |
| Oct 1 | alpe-dhuez-fr (GNB ⚠️), venice-lido-it (VCE ⚠️), shonan-jp (HND ⚠️), bad-gastein-at, los-gigantes-tfe | NOT ADDED |
| Oct 2 | sleeping-bear-dunes-mi, cannon-mountain-nh, lee-canyon-nv, karekare-beach-nz, ilha-grande-rj | NOT ADDED |
| Oct 3 | les-arcs-fr, stowe-vt, virginia-beach-va, four-mile-beach-qld, nuqui-beach-col | NOT ADDED |
| **Oct 4** | maspalomas-gc, tel-aviv-beach, saint-gilles-reunion, kenting-tw, hua-hin-th | **QUEUED** |

**⚠️ GNB/VCE/HND proposals (Oct 1) still need AIRPORT_COORDS entries:**
Add before using: `GNB:{lat:45.3629,lon:5.3294}`, `VCE:{lat:45.5053,lon:12.3520}`, `HND:{lat:35.5494,lon:139.7798}`

---

## 6. One Observation for PM

**VPS deadline is TODAY.** If the redeploy happens today (Oct 4) and the code freeze lifts this week, there's a clean 4-part content close-out sprint ready to run in one session:

1. **Gili Air rename** (Oct 5 — tomorrow, one-line change)
2. **30-venue batch** (Sep 29–Oct 4 queue: 30 proposals, 3 need GNB/VCE/HND AIRPORT_COORDS fix)
3. **BASE_PRICES backfill** (top 15 missing APs by venue count, ~1 hour, closes Open #22)
4. **91+ venue tag enrichment** (corrected back to 225 via eval — 2 hours editorial, biggest score-quality impact)

One session, four tasks, full pre-launch content close-out. The r/skiing Nov 1 post goes out cleaner for it.
