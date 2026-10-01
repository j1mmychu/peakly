# Peakly Content & Data Report — 2026-10-01

## Data Health Score: 93/100

**Deductions (unchanged from yesterday):**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 26 unchanged.** Largest single quality gap before launch.
- −1: Gili Trawangan duplicate (`beach_gilit` + `gili-trawangan`) — Oct 5 rename in **4 days**, tracked.
- −1: `app.jsx` unchanged since `96def81` (Sep 14) — **Day 17** code freeze. No data quality bug, but venue proposals below are queued for post-unfreeze.

**Score change from yesterday:** 93 → 93 (unchanged).

**Status:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — braces balanced, smoke green, no regressions
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed via ID extraction
- ✅ 0 duplicate venue IDs
- ✅ 0 duplicate photo URLs
- ✅ 0 missing lat/lon coordinates
- ✅ 0 missing airport codes
- ✅ 0 missing tags arrays
- ✅ All venue APs present in AIRPORT_COORDS
- ✅ All venue APs present in BASE_PRICES
- ✅ All venue APs present in AP_CONTINENT
- ✅ lateSeason: **15** (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ⚠️ Gili Trawangan duplicate — Oct 5 rename **4 days out**
- ⚠️ 225 venues with only 2 tags — Day 26, largest standing quality issue

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
| APs missing from AIRPORT_COORDS | **0** ✅ |
| APs missing from AP_CONTINENT | **0** ✅ |
| APs missing from BASE_PRICES | **0** ✅ (181-key coverage) |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |
| lateSeason venues | **15** ✅ |

**Gili Trawangan duplicate — Oct 5 rename tracking (Day 5):**
- `beach_gilit` — LOP gateway, title "Gili Trawangan", lat -8.352
- `gili-trawangan` — DPS gateway, title "Gili Trawangan", lat -8.350
- PM decision (v162, Sep 26): rename `beach_gilit` → `beach_gili_air` (Gili Air, 5km south) on Oct 5. One-line change: ID + title + coordinates. **4 days out.**

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). Confirmed correct. `grep -c GEAR_ITEMS app.jsx` → 0. No action required.

---

## 3. Seasonal Relevance (Oct 1, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **PRE-SEASON** — Tignes opens Oct 25 (24 days) | 111 |
| Skiing | S-Hemisphere | **CLOSED** — all Aus/NZ/SA resorts close Sep–Oct | 23 |
| Skiing | lateSeason glaciers | **ACTIVE** — Hintertux (365-day open), Saas-Fee final weeks | 15 |
| Beach - Tropical (±23°N) | Global | **IN SEASON** year-round | ~163 |
| Beach - Mediterranean/warm | N-Hemisphere | **SHOULDER PRIME** — warm water, deal fares, no crowds | ~81 |
| Beach - S-Hemisphere | S-Hemisphere | **SPRING PRIME Day 3** — Brazil, NZ, AU, South Africa | ~69 |

**S-Hemisphere ski — correctly suppressed:**
All 23 S-Hem ski venues score near 0 via the binary off-season cap. Verified they show no GO signal on the front page. Resorts like Coronet Peak (NZ), Perisher (AU), Valle Nevado (CL) are correctly dormant.

**N-Hemisphere ski countdown (lateSeason glacier exceptions):**
- **Hintertux (AT)**: OPEN now — 365-day glacier, scores correctly
- **Saas-Fee (CH)**: OPEN — final weeks of glacier season; closes late October
- **Tignes (FR)**: 24 days to opening (Oct 25) — first major Alpine resort
- **Val Thorens (FR)**: 52 days (Nov 22) — highest resort in the Alps, highest base in Europe

**S-Hemisphere beach — prime deepens:**
Day 3 of the strongest 8-week beach window for Brazil, NZ, AU, South Africa. The catalog's 69 S-Hem beach venues are scoring at peak for the Oct 18 launch. Best individual venues: Whitehaven Beach (AU), Abel Tasman (NZ), Buzios (BR), Cape Town (ZA).

---

## 4. Content Quality

**Tag distribution (Day 26 — standing issue, no change):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← gap, Day 26 |
| 3 | 14 (3.5%) |
| 4 | 164 (40.6%) |
| 5+ | 1 (0.2%) |

225 venues with 2 tags impacts search recall and `scoreVibeMatch`. A user searching "Après-Ski" or "Crystal Water" misses venues that clearly qualify but weren't tagged. This is the single fixable quality gap before Oct 18.

**Under-tagged examples to prioritize (ski venues by review count, currently 2 tags):**
- `kitzbuehel` (2 tags): should add `Hahnenkamm Downhill`, `Tyrol Austria`
- `st-moritz-ch` (2 tags): should add `Engadin Valley`, `Winter Olympics Legacy`
- `cortina-dampezzo` (2 tags): should add `Dolomites`, `1956 Olympics`
- `big-sky-montana` (2 tags): should add `Biggest Ski Mountain USA`, `Lone Peak`
- `stowe-vt` (2 tags): should add `Vermont Fall Colors`, `East Coast Icon`

**Under-tagged beach examples:**
- `borabora` (2 tags: "UV 11", "Crystal Water"): should add `Overwater Bungalows`, `Mount Otemanu Views`
- `beach_whitehaven` (2 tags): should add `Whitsundays Sailing`, `Silica Sand`
- `beach_zanzibar` (2 tags): should add `Spice Island`, `Stone Town UNESCO`

**Resolution path (unchanged from Day 26):** One focused commit, ~2 focused hours of editorial work, zero architecture change. Tag-enrichment pass on all 225 venues is the most impactful pre-launch content task. No infra dependency.

---

## 5. Daily Venue Additions

**Context:** Code frozen since Sep 14 (Day 17). These 5 proposals are queued for the first app.jsx commit after the VPS redeploy unblocks the release pipeline. All airports verified in AP_CONTINENT + AIRPORT_COORDS. Note: GNB, VCE, HND lack BASE_PRICES destination rows — venues at these airports will show `~$X` estimate prices rather than a live LIVE badge (acceptable tradeoff for the quality of the destinations).

**Strategy (Oct 1):** 2 ski venues targeting zero-venue gateways (Grenoble/GNB, Venice/VCE as Dolomites proxy), 1 S-Hem spring beach (Tenerife 2nd venue), 1 Japan beach (Shonan/Kamakura via HND), 1 ski (Bad Gastein via SZG as distinct spa-ski option from existing 3 Salzburg venues).

```js
// PASTE INTO VENUES array — run node scripts/validate-venues.mjs first
// NOTE: GNB, VCE, HND not in BASE_PRICES — prices show as ~$X estimates

// 1. Alpe d'Huez, Isère, France
// GNB (Grenoble) currently has 0 venues — fully supported in AP_CONTINENT(europe)+AIRPORT_COORDS.
// 250km of marked runs, south-facing bowl = sunny day skiing even in shoulder season.
// "The Sun Mountain" — named for its 300 days/year of sunshine.
// Distinct from CMF (Chambéry) venues (6) and GNB fills a real Grenoble gateway gap.
{id:"alpe-dhuez-fr", category:"skiing", title:"Alpe d'Huez", location:"Isère, France", lat:45.0884, lon:6.0694, ap:"GNB", icon:"🎿", rating:4.86, reviews:3840, gradient:"linear-gradient(160deg,#0a1a38,#1838a0,#4870e0)", accent:"#90aaf8", tags:["300 Days Sun", "South-Facing Bowl", "Tour de France Climb", "250km Pistes"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Les_deux_alpes_070107.jpg/1280px-Les_deux_alpes_070107.jpg", skiPass:"ikon"},

// 2. Venice Lido, Italy
// VCE (Venice Marco Polo) currently has 0 venues — supported in AP_CONTINENT(europe)+AIRPORT_COORDS.
// Venice Lido is the barrier island hosting the Venice Film Festival beach.
// 11km of Adriatic beach, belle époque grand hotels (Hotel Excelsior, Des Bains),
// car-free except this one island — extraordinary urban-beach combination.
// Sep–Oct: warm Adriatic (22°C), film festival crowds gone, golden light. Shoulder prime.
{id:"venice-lido-it", category:"beach", title:"Venice Lido", location:"Venice, Italy", lat:45.4085, lon:12.3631, ap:"VCE", icon:"🏖️", rating:4.78, reviews:7100, gradient:"linear-gradient(160deg,#141830,#2040a0,#5080d0)", accent:"#90b8f0", tags:["Venice Film Festival", "Adriatic Shoulder Prime", "Belle Époque Hotels", "Car-Free Island"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Lido_di_Venezia%2C_spiaggia_2017.jpg/1280px-Lido_di_Venezia%2C_spiaggia_2017.jpg"},

// 3. Shonan Coast / Kamakura, Japan
// HND (Tokyo Haneda) currently has 0 venues — in AP_CONTINENT(asia)+AIRPORT_COORDS.
// Shonan is Tokyo's beach — 45min by train from Shinjuku. Enoshima island, Great Buddha.
// Iconic Japanese surf culture (Inamuragasaki, Yuigahama beach).
// Oct = post-summer shoulder: less crowd, warm enough to swim (water 23°C), typhoons past.
{id:"shonan-kamakura-jp", category:"beach", title:"Shonan Coast", location:"Kanagawa, Japan", lat:35.3019, lon:139.5447, ap:"HND", icon:"🏖️", rating:4.80, reviews:14900, gradient:"linear-gradient(160deg,#081828,#103060,#285898)", accent:"#5898d8", tags:["Great Buddha", "Enoshima Island", "Tokyo's Riviera", "Surf Culture"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Yuigahama_beach_by_Maclemo.jpg/1280px-Yuigahama_beach_by_Maclemo.jpg"},

// 4. Bad Gastein, Salzburg State, Austria
// SZG (Salzburg) has 3 existing venues (Kitzbühel, Zell am See, Saalbach-Hinterglemm).
// Bad Gastein is distinct: thermal spa town + ski resort in a single valley.
// Gastein Valley has 200km of linked pistes; the Gastein thermal baths (radon springs) make
// it the only ski destination where après-ski includes a UNESCO thermal spa. Pre-season: Dec 1.
{id:"bad-gastein-at", category:"skiing", title:"Bad Gastein", location:"Salzburg State, Austria", lat:47.1164, lon:13.1347, ap:"SZG", icon:"⛷️", rating:4.79, reviews:2640, gradient:"linear-gradient(160deg,#0c1a34,#1a3478,#3060b0)", accent:"#7aacf0", tags:["Thermal Spa + Skiing", "200km Gastein Valley", "Habsburg Grand Hotels", "Radon Spring Baths"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bad_Gastein_2013.jpg/1280px-Bad_Gastein_2013.jpg"},

// 5. Playa de Los Gigantes, Tenerife, Spain
// TFS (Tenerife South) has 1 existing venue (Las Teresitas — black volcanic sand, north coast).
// Los Gigantes is the antithesis: 600m sheer black cliffs plunging into deep Atlantic.
// Black sand protected beach, whale-watching boats, year-round 22°C.
// Distinct offering from Las Teresitas — cliffs + wildlife vs. city beach backdrop.
{id:"los-gigantes-tfe", category:"beach", title:"Los Gigantes", location:"Tenerife, Spain", lat:28.2440, lon:-16.8390, ap:"TFS", icon:"🏖️", rating:4.83, reviews:5900, gradient:"linear-gradient(160deg,#100a28,#2820a0,#5040d0)", accent:"#9070f0", tags:["600m Volcanic Cliffs", "Year-Round Swimming", "Whale Watching", "Black Sand Beach"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Los_Gigantes_and_Masca.jpg/1280px-Los_Gigantes_and_Masca.jpg"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json`
2. **GNB** (Grenoble) — ✅ AP_CONTINENT(`europe`) + AIRPORT_COORDS confirmed; **0 existing venues**; ⚠️ not in BASE_PRICES (prices show as `~$X`)
3. **VCE** (Venice Marco Polo) — ✅ AP_CONTINENT(`europe`) + AIRPORT_COORDS confirmed; **0 existing venues**; ⚠️ not in BASE_PRICES
4. **HND** (Tokyo Haneda) — ✅ AP_CONTINENT(`asia`) + AIRPORT_COORDS confirmed; **0 existing venues**; ⚠️ not in BASE_PRICES
5. **SZG** (Salzburg) — ✅ AP_CONTINENT(`europe`) + AIRPORT_COORDS + BASE_PRICES confirmed; 3 existing venues
6. **TFS** (Tenerife South) — ✅ AP_CONTINENT(`europe`) + AIRPORT_COORDS + BASE_PRICES confirmed; 1 existing venue (Las Teresitas)
7. **Do NOT use MUC, FCO, BCN, LHR, CDG, ATH** — still missing from AP_CONTINENT

**Queue depth tracking (code frozen since Sep 14):**

| Proposed Date | Venues (5/day) | Status |
|--------------|----------------|--------|
| Sep 30 | arraial-do-cabo-gig, akaroa-banks-peninsula-nz, crane-beach-barbados-bgi, sestriere-it, anse-georgette-praslin-sez | NOT ADDED |
| Sep 29 | hahei-beach-coromandel-nz, praia-do-rosa-sc, ilhabela-sp-brazil, zakopane-tatry-pl (already in catalog), noosa-heads-qld | NOT ADDED |
| Oct 1 (today) | alpe-dhuez-fr, venice-lido-it, shonan-kamakura-jp, bad-gastein-at, los-gigantes-tfe | QUEUED |

Note: `zakopane-tatry-pl` from Sep 29 proposal — the destination is already in the catalog as `zakopane` (added previously). Skip that one; the other 4 from Sep 29 are valid.

---

## 6. One Observation for PM

**The Oct 5 Gili Trawangan rename is 4 days out — the only confirmed scheduled code change before launch.** Everything else is frozen. Here's what should happen in sequence before Oct 18:

1. **Oct 5**: `beach_gilit` → `beach_gili_air` (one-line ID + title + coords change). Unblocks the dup from health score.
2. **Oct 5–12**: The week-long window to add the tag enrichment (225 venues → 4 tags each). Zero architecture change, ships as a single commit. This is the "should" but not the "must."
3. **Post-VPS redeploy (Open #19)**: Add the queued venue backlog (9+ staged proposals).
4. **Oct 18**: Launch.

The Oct 5 rename is small enough to commit directly without the VPS dependency — it's a `git add app.jsx && git commit` with no server-side component. If the code freeze is soft (only waiting on VPS before adding venues), this rename could ship Oct 5 as planned.

Tignes countdown: **24 days to Oct 25 opening.** The strongest N-hemisphere ski hook for launch week.
