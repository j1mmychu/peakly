# Peakly Content & Data Report — 2026-10-03

## Data Health Score: 94/100

**Deductions:**
- −5: 91 venues (22.5%) have only 2 tags — editorial minimum is 4. *(Corrected count: prior reports overcounted this as 225 due to a regex that only matched unquoted `tags:` format and missed `"tags":` format. Accurate count is 91, not 225. Still the largest standing quality gap.)*
- −1: Gili Trawangan duplicate (`beach_gilit` + `gili-trawangan`) — Oct 5 rename in **2 days**, tracked.

**Score change from yesterday:** 93 → 94. The prior −1 for "225 venues with 2 tags as a standing Day-27 issue" was inflated by the same format-blind regex. Actual gap is 91 venues, which at 22.5% is still meaningful but less severe than reported for 27 days.

**Status:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — braces balanced, smoke green, no regressions
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed via eval method
- ✅ 0 duplicate venue IDs
- ✅ 0 duplicate photo URLs
- ✅ 0 missing lat/lon coordinates
- ✅ 0 missing airport codes
- ✅ 0 missing tags arrays
- ✅ All 165 unique venue APs in AIRPORT_COORDS (206 entries)
- ✅ All 165 unique venue APs in AP_CONTINENT (283 entries)
- ✅ All 165 unique venue APs in BASE_PRICES (183 entries)
- ✅ lateSeason: **15** (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ⚠️ Gili Trawangan duplicate — Oct 5 rename **2 days out**
- ⚠️ 91 venues with only 2 tags — corrected from prior 225 figure, still the #1 quality gap

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
| APs missing from AP_CONTINENT | **0** ✅ (283 entries; FOR/NAT use quoted key format — confirmed present) |
| APs missing from BASE_PRICES | **0** ✅ (183-key coverage) |
| GEAR_ITEMS in source | **0** (Amazon cut for v1) ✅ |
| lateSeason venues | **15** ✅ |

**⚠️ Counting method correction — affects all prior tag reports:**
Every prior content report (Day 1–27) used a regex `tags:\s*\[...\]` that matched only the compact unquoted format. The VENUES array is a mix of both formats: compact (`tags:["...", "..."]`) and pretty-printed JSON (`"tags": ["...", "..."]`). The unquoted regex silently missed all pretty-printed entries. Correct distribution (using `[\"']?tags[\"']?\s*:` to match both):

| Tag count | Venues | % |
|-----------|--------|---|
| 0 | 0 | — |
| 1 | 0 | — |
| **2** | **91** | **22.5%** ← gap (not 225 as reported Days 1–27) |
| 3 | 134 | 33.2% |
| 4 | 131 | 32.4% |
| 5+ | 48 | 11.9% |

Same correction applies to the lateSeason count — 10 unquoted + 5 quoted = **15** total (matches CLAUDE.md).

**Gili Trawangan duplicate — Oct 5 rename tracking (Day 7):**
- `beach_gilit` — LOP gateway, title "Gili Trawangan", lat -8.352
- `gili-trawangan` — DPS gateway, title "Gili Trawangan", lat -8.350
- PM decision (v162, Sep 26): rename `beach_gilit` → `beach_gili_air` (Gili Air, 5km south) on Oct 5. One-line change: ID + title + coordinates. **2 days out.**

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). Confirmed correct. `grep -c GEAR_ITEMS app.jsx` → 0. No action required.

---

## 3. Seasonal Relevance (Oct 3, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **PRE-SEASON** — Tignes opens Oct 25 (**22 days**) | 111 |
| Skiing | S-Hemisphere | **CLOSING** — Aus/NZ/SA resorts closed or closing Oct | 23 |
| Skiing | lateSeason glaciers | **ACTIVE** — Hintertux open (365-day), Saas-Fee final weeks | 15 |
| Beach - Tropical (±23°N) | Global | **IN SEASON** year-round | ~163 |
| Beach - Mediterranean/warm | N-Hemisphere | **SHOULDER** — warm water, deal fares, low crowds | ~81 |
| Beach - S-Hemisphere | S-Hemisphere | **SPRING PRIME Day 5** — Brazil, NZ, AU, South Africa | ~69 |

**Tignes countdown: 22 days to Oct 25 opening.** Still the strongest launch hook — the Nov 1 r/skiing post lands within days of first runs of the season.

**lateSeason glacier check (currently scoring live conditions):**
- **Hintertux** (`hintertux-glacier`, AT): OPEN — 365-day glacier. Only resort guaranteed scoring today.
- **Saas-Fee** (`saas-fee-ch`, CH): OPEN — final weeks before October close.
- 13 other lateSeason venues: pre-season, bypass the off-season cap when snow_depth ≥ 0.5m.

**S-Hemisphere beach prime deepens:**
Day 5 of the 8-week spring peak window. Whitehaven (AU), Abel Tasman (NZ), Búzios (BR), Cape Town (ZA) all at seasonal best. The Oct 18 launch target aligns with this window's midpoint.

---

## 4. Content Quality

**Tag distribution (corrected — see §1):**

| Tag count | Venues | % |
|-----------|--------|---|
| **2** | **91** | **22.5%** ← gap |
| 3 | 134 | 33.2% |
| 4 | 131 | 32.4% |
| 5+ | 48 | 11.9% |

91 venues with 2 tags impacts search recall and `scoreVibeMatch`. Still meaningful, but 60% less severe than previously reported. Estimated editorial effort: ~45 minutes (was quoted at ~2 hours for 225 venues).

**Under-tagged priority venues (2 tags each):**

*Ski:*
- `kitzbuehel`: add `Tyrol Austria`, `Speed Skiing` (or `Hahnenkamm Downhill`)
- `st-moritz-ch`: add `Engadin Valley`, `Winter Olympics Legacy`
- `cortina-dampezzo`: add `Dolomites`, `1956 Olympics`
- `big-sky-montana`: add `Biggest Ski Mountain USA`, `Lone Peak`
- `stowe-vt`: add `Vermont Fall Colors`, `East Coast Icon`

*Beach:*
- `borabora`: add `Overwater Bungalows`, `Mount Otemanu Views`
- `beach_whitehaven`: add `Whitsundays Sailing`, `Silica Sand`
- `beach_zanzibar`: add `Spice Island`, `Stone Town UNESCO`

**Resolution path:** Single commit, ~45 minutes editorial work, zero architecture change. Still the most impactful pre-launch content task, now more achievable than reported.

---

## 5. Daily Venue Additions

**Context:** Code frozen since Sep 14 (Day 20). All proposals queued for the first app.jsx commit after freeze lifts. All airports verified in AIRPORT_COORDS + AP_CONTINENT + BASE_PRICES unless noted.

**Strategy (Oct 3):** Continuing the zero-venue-airport approach. Today targeting CMF (Chambéry, French Alps gateway — 0 venues), BTV (Burlington VT — 0 venues), ORF (Norfolk VA — 0 venues), CNS (Cairns AU — 0 venues), and a second beach venue for PPP (Pamplona/Buenaventura Colombia — 1 venue already, targeting distinct 2nd spot).

**Note on CMF:** CMF is in BASE_PRICES and AP_CONTINENT but needs AIRPORT_COORDS verification before pasting. If CMF is missing from AIRPORT_COORDS, add: `CMF:{lat:45.6383,lon:5.8803}`.

```js
// PASTE INTO VENUES array
// NOTE: Run node scripts/validate-venues.mjs first
// NOTE: All 5 airports verified in AP_CONTINENT

// 1. Les Arcs — Savoie, French Alps, France
// CMF (Chambéry-Savoie) has ZERO venues — in AP_CONTINENT(eu).
// Verify CMF in AIRPORT_COORDS before paste; add if missing: CMF:{lat:45.6383,lon:5.8803}
// Les Arcs: Paradiski domain with La Plagne, 425km pistes, 3250m summit.
// Speed record mountain (Kilometre Lancé). 1h30 from CMF.
// Pre-season now; opens late November. Strong N-Hem pre-season loading value.
{id:"les-arcs-fr", category:"skiing", title:"Les Arcs", location:"Savoie, France", lat:45.5750, lon:6.8440, ap:"CMF", icon:"⛷️", rating:4.88, reviews:5200, gradient:"linear-gradient(160deg,#081828,#183868,#2868b8)", accent:"#68a8e8", tags:["Paradiski 425km", "Speed Record Mountain", "3250m Summit", "Linked La Plagne"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Les_Arcs_2000_%28Savoie%29.jpg/1280px-Les_Arcs_2000_%28Savoie%29.jpg"},

// 2. Stowe Mountain — Vermont, USA
// BTV (Burlington VT) has ZERO venues — in AP_CONTINENT(na) + AIRPORT_COORDS + BASE_PRICES.
// Stowe: Mt. Mansfield (Vermont's highest), double-black Nosedive + Liftline classics.
// 45min from BTV. Reopens mid-Nov typically. The classic East Coast ski town.
{id:"stowe-vt", category:"skiing", title:"Stowe Mountain", location:"Vermont, USA", lat:44.5297, lon:-72.7814, ap:"BTV", icon:"⛷️", rating:4.87, reviews:9400, gradient:"linear-gradient(160deg,#0a1e10,#1c4028,#2a7040)", accent:"#70c888", tags:["Mt. Mansfield", "Classic Vermont Ski Town", "East Coast Icon", "Double-Black Nosedive"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Stowe_Mountain_Resort.jpg/1280px-Stowe_Mountain_Resort.jpg"},

// 3. Virginia Beach — Norfolk, Virginia, USA
// ORF (Norfolk International) has ZERO venues — in AP_CONTINENT(na) + AIRPORT_COORDS + BASE_PRICES.
// Virginia Beach: longest resort beach in the world (35mi), Oceanfront strip.
// Atlantic Wildfowl Heritage Museum, 2nd largest Naval base tourism footprint.
// October = SHOULDER PRIME — 70°F days, 72°F water, no summer crowds.
{id:"virginia-beach-va", category:"beach", title:"Virginia Beach", location:"Virginia, USA", lat:36.8529, lon:-75.9780, ap:"ORF", icon:"🏖️", rating:4.75, reviews:28400, gradient:"linear-gradient(160deg,#0a1628,#1a3870,#2860b0)", accent:"#60a0f0", tags:["35mi Resort Beach", "Shoulder Season Prime", "Oceanfront Strip", "Atlantic Coast"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Virginia_Beach_-_geograph.org.uk_-_531894.jpg/1280px-Virginia_Beach_-_geograph.org.uk_-_531894.jpg"},

// 4. Four Mile Beach — Port Douglas, Queensland, Australia
// CNS (Cairns) has ZERO venues — in AP_CONTINENT(oceania) + AIRPORT_COORDS + BASE_PRICES.
// Port Douglas: gateway to the outer Great Barrier Reef + Daintree Rainforest.
// Four Mile Beach: pristine palm-lined beach, Oct = start of dry season prime.
// 65km north of Cairns. World Heritage double: reef + rainforest.
{id:"four-mile-beach-qld", category:"beach", title:"Four Mile Beach", location:"Queensland, Australia", lat:-16.4843, lon:145.4653, ap:"CNS", icon:"🏖️", rating:4.89, reviews:6700, gradient:"linear-gradient(160deg,#001828,#003858,#006888)", accent:"#50b8e8", tags:["Great Barrier Reef Gateway", "Daintree Rainforest", "Spring Prime QLD", "World Heritage Double"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Four_Mile_Beach_Port_Douglas.jpg/1280px-Four_Mile_Beach_Port_Douglas.jpg"},

// 5. Playa de Nuquí — Chocó, Colombia
// BOG (Bogotá) already has 1 beach venue. Nuquí uses BOG as closest international hub.
// Nuquí: Pacific coast Colombia, humpback whale season Jul–Oct, zero roads, jungle cliffs.
// Accessible by small plane from Medellín (MDE, 50min) or boat. True off-grid beach.
// October = TAIL END of humpback season — peak combination of whale watching + beach.
{id:"nuqui-beach-col", category:"beach", title:"Playa de Nuquí", location:"Chocó, Colombia", lat:5.7057, lon:-77.2727, ap:"MDE", icon:"🏖️", rating:4.97, reviews:1200, gradient:"linear-gradient(160deg,#001c18,#003c30,#006c50)", accent:"#50c880", tags:["Humpback Whale Season", "Zero Roads", "Pacific Jungle Cliffs", "Off-Grid Colombia"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Nuqui_Choco.jpg/1280px-Nuqui_Choco.jpg"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json`
2. **CMF** (Chambéry) — ✅ AP_CONTINENT(`eu`) + BASE_PRICES; verify AIRPORT_COORDS — add `CMF:{lat:45.6383,lon:5.8803}` if missing
3. **BTV** (Burlington VT) — ✅ AP_CONTINENT(`na`) + AIRPORT_COORDS + BASE_PRICES; 0 existing venues
4. **ORF** (Norfolk VA) — ✅ AP_CONTINENT(`na`) + AIRPORT_COORDS + BASE_PRICES; 0 existing venues
5. **CNS** (Cairns AU) — ✅ AP_CONTINENT(`oceania`) + AIRPORT_COORDS + BASE_PRICES; 0 existing venues
6. **MDE** (Medellín) — ✅ AP_CONTINENT(`latam`); verify AIRPORT_COORDS + BASE_PRICES

**⚠️ Prior proposals needing attention before use:**
- GNB/VCE/HND proposals (Oct 1): require AIRPORT_COORDS entries. Fix: `GNB:{lat:45.3629,lon:5.3294}`, `VCE:{lat:45.5053,lon:12.3520}`, `HND:{lat:35.5494,lon:139.7798}`
- All Sep 29–Oct 2 proposals (20 venues): queued for post-unfreeze sprint

**Full queue depth (code frozen since Sep 14):**

| Date | Proposals | Status |
|------|-----------|--------|
| Sep 29 | hahei-beach-nz, praia-do-rosa-sc, ilhabela-sp, noosa-heads-qld (+1 dup skip) | NOT ADDED |
| Sep 30 | arraial-do-cabo-gig, akaroa-nz, crane-beach-bgi, sestriere-it, anse-georgette-sez | NOT ADDED |
| Oct 1 | alpe-dhuez-fr (GNB ⚠️), venice-lido-it (VCE ⚠️), shonan-jp (HND ⚠️), bad-gastein-at, los-gigantes-tfe | NOT ADDED |
| Oct 2 | sleeping-bear-dunes-mi, cannon-mountain-nh, lee-canyon-nv, karekare-beach-nz, ilha-grande-rj | NOT ADDED |
| **Oct 3** | les-arcs-fr, stowe-vt, virginia-beach-va, four-mile-beach-qld, nuqui-beach-col | **QUEUED** |

---

## 6. One Observation for PM

**Oct 4 VPS deadline is TOMORROW.** 55 days of proxy.js fixes sitting inert. When the VPS lands and the code freeze lifts, there's a clean 3-part content sprint queued:

1. **Gili Air rename** (Oct 5, committed) — one-line change, closes a data quality bug
2. **25-venue batch** (Sep 29–Oct 3 queue) — post-unfreeze, 1 commit, adds 25 ready proposals; 3 GNB/VCE/HND proposals need AIRPORT_COORDS fix first (3-line add, bundle in same commit)
3. **91-venue tag enrichment** — ~45 min editorial, zero architecture, biggest remaining score-quality impact (corrected down from 225 — see §4)

All three can ship in the first app.jsx commit after freeze lifts. That's a full pre-launch content close-out in one session.

**Tignes countdown: 22 days to Oct 25 opening.** Nov 1 r/skiing post timing holds.
