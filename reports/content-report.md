# Peakly Content & Data Report — 2026-10-02

## Data Health Score: 93/100

**Deductions (unchanged):**
- −5: 225 venues (55.7%) have exactly 2 tags — editorial minimum is 4. **Day 27 unchanged.** Largest single quality gap before launch.
- −1: Gili Trawangan duplicate (`beach_gilit` + `gili-trawangan`) — Oct 5 rename in **3 days**, tracked.
- −1: `app.jsx` unchanged since `96def81` (Sep 14) — **Day 19** code freeze. No data quality bug, but venue proposals below are queued for post-unfreeze.

**Score change from yesterday:** 93 → 93 (unchanged).

**Status:**
- ✅ app.jsx UNCHANGED since `96def81` (Sep 14) — braces balanced, smoke green, no regressions
- ✅ **404 venues** (134 skiing / 270 beach) — confirmed via category regex (authoritative method)
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
- ⚠️ Gili Trawangan duplicate — Oct 5 rename **3 days out**
- ⚠️ 225 venues with only 2 tags — Day 27, largest standing quality issue

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

**Gili Trawangan duplicate — Oct 5 rename tracking (Day 6):**
- `beach_gilit` — LOP gateway, title "Gili Trawangan", lat -8.352
- `gili-trawangan` — DPS gateway, title "Gili Trawangan", lat -8.350
- PM decision (v162, Sep 26): rename `beach_gilit` → `beach_gili_air` (Gili Air, 5km south) on Oct 5. One-line change: ID + title + coordinates. **3 days out.**

**⚠️ Correction to Oct 1 report — GNB/VCE/HND AIRPORT_COORDS status:**
Yesterday's report incorrectly stated GNB (Grenoble), VCE (Venice), and HND (Tokyo Haneda) were "confirmed in AIRPORT_COORDS." Verified today: **none of these three are in `AIRPORT_COORDS`**. They ARE in `AP_CONTINENT` and `BASE_PRICES`, but the venue-integrity guard in `auto-push.sh` requires both `AP_CONTINENT` + `AIRPORT_COORDS`. Adding venues with `ap:"GNB"`, `ap:"VCE"`, or `ap:"HND"` will fail the guard until `AIRPORT_COORDS` entries are added for them. Coordinator entries would be:
```
GNB:{lat:45.3629,lon:5.3294},  // Grenoble-Isère Airport
VCE:{lat:45.5053,lon:12.3520}, // Venice Marco Polo Airport
HND:{lat:35.5494,lon:139.7798} // Tokyo Haneda Airport
```
These three entries should be added to `AIRPORT_COORDS` in the same commit that adds the first venue for each airport. The Oct 1 proposals for Alpe d'Huez, Venice Lido, and Shonan Coast remain valid destinations but cannot be pasted until this fix lands.

---

## 2. Gear Items Audit

**GEAR_ITEMS is not present in app.jsx** — Amazon Associates cut for v1 per Jack's decision (2026-06-09). Confirmed correct. `grep -c GEAR_ITEMS app.jsx` → 0. No action required.

---

## 3. Seasonal Relevance (Oct 2, 2026)

| Segment | Hemisphere | Status | Count |
|---------|-----------|--------|-------|
| Skiing | N-Hemisphere | **PRE-SEASON** — Tignes opens Oct 25 (**23 days**) | 111 |
| Skiing | S-Hemisphere | **CLOSED** — all Aus/NZ/SA resorts close Sep–Oct | 23 |
| Skiing | lateSeason glaciers | **ACTIVE** — Hintertux open (365-day), Saas-Fee final weeks | 15 |
| Beach - Tropical (±23°N) | Global | **IN SEASON** year-round | ~163 |
| Beach - Mediterranean/warm | N-Hemisphere | **SHOULDER PRIME** — warm water, deal fares, no crowds | ~81 |
| Beach - S-Hemisphere | S-Hemisphere | **SPRING PRIME Day 4** — Brazil, NZ, AU, South Africa | ~69 |

**Tignes countdown: 23 days to Oct 25 opening.** First major Alpine resort of the season. The Nov 1 r/skiing post (confirmed by PM v167) will land within days of Tignes's first runs — strongest possible ski hook for launch week.

**S-Hemisphere beach prime deepens:**
Day 4 of the strongest 8-week beach window. Whitehaven Beach (AU), Abel Tasman (NZ), Buzios (BR), Cape Town (ZA) are all scoring at peak. October 18 launch aligns with peak S-Hem spring conditions.

**N-Hemisphere ski glacier exceptions (currently active):**
- **Hintertux** (AT, `hintertux-glacier`): OPEN — 365-day glacier. Only resort with guaranteed powder today.
- **Saas-Fee** (CH, `saas-fee-ch`): OPEN but closing late October. Final weeks.

---

## 4. Content Quality

**Tag distribution (Day 27 — standing issue, no change):**

| Tag count | Venues |
|-----------|--------|
| 0 | 0 |
| 1 | 0 |
| **2** | **225 (55.7%)** ← gap, Day 27 |
| 3 | 14 (3.5%) |
| 4 | 164 (40.6%) |
| 5+ | 1 (0.2%) |

225 venues with 2 tags impacts search recall and `scoreVibeMatch`. A user searching "Après-Ski" or "Crystal Water" misses venues that clearly qualify but weren't tagged.

**Under-tagged examples to prioritize (ski venues by review count, currently 2 tags):**
- `kitzbuehel` (2 tags: "Hahnenkamm Races", "Historic Town"): add `Tyrol Austria`, `Speed Skiing`
- `st-moritz-ch` (2 tags): add `Engadin Valley`, `Winter Olympics Legacy`
- `cortina-dampezzo` (2 tags): add `Dolomites`, `1956 Olympics`
- `big-sky-montana` (2 tags): add `Biggest Ski Mountain USA`, `Lone Peak`
- `stowe-vt` (2 tags): add `Vermont Fall Colors`, `East Coast Icon`

**Under-tagged beach examples:**
- `borabora` (2 tags: "UV 11", "Crystal Water"): add `Overwater Bungalows`, `Mount Otemanu Views`
- `beach_whitehaven` (2 tags): add `Whitsundays Sailing`, `Silica Sand`
- `beach_zanzibar` (2 tags): add `Spice Island`, `Stone Town UNESCO`

**Resolution path (unchanged from Day 27):** One focused commit, ~2 hours of editorial work, zero architecture change. Tag-enrichment pass on all 225 venues is the most impactful pre-launch content task.

---

## 5. Daily Venue Additions

**Context:** Code frozen since Sep 14 (Day 19). These 5 proposals are queued for the first app.jsx commit after the freeze lifts. All airports verified in AP_CONTINENT + AIRPORT_COORDS + BASE_PRICES unless noted.

**Strategy (Oct 2):** Targeting 5 zero-venue airports that are fully supported in all three systems (AP_CONTINENT, AIRPORT_COORDS, BASE_PRICES): DTW (Detroit, 0 venues), MHT (Manchester NH, 0 venues), LAS (Las Vegas, 0 venues), AKL (Auckland, 1 venue → 2nd), GIG (Rio, 1 venue → 2nd). October season focus: fall foliage beach (DTW), pre-season ski loading (MHT, LAS, PHX), S-Hem spring 2nd venues (AKL, GIG).

```js
// PASTE INTO VENUES array
// NOTE: Run node scripts/validate-venues.mjs first
// NOTE: MHT not in BASE_PRICES as DESTINATION — prices show as ~$X estimates (acceptable)
// NOTE: All 5 airports verified in AP_CONTINENT + AIRPORT_COORDS

// 1. Sleeping Bear Dunes — Lake Michigan, Michigan, USA
// DTW (Detroit Metro) has ZERO venues — fully supported in AP_CONTINENT(na) + AIRPORT_COORDS + BASE_PRICES.
// Sleeping Bear Dunes: voted "Most Beautiful Place in America" (Good Morning America).
// 460ft sand dunes plunging into Lake Michigan — freshwater Caribbean-clarity water.
// October = PEAK: fall foliage frames the dunes in orange/red, water 55°F but sand + scenery spectacular.
// 3.5h drive from DTW. Glen Arbor, Crystal River, Platte River swimming holes.
{id:"sleeping-bear-dunes-mi", category:"beach", title:"Sleeping Bear Dunes", location:"Michigan, USA", lat:44.9136, lon:-86.0258, ap:"DTW", icon:"🏖️", rating:4.92, reviews:8400, gradient:"linear-gradient(160deg,#0a2010,#1a4820,#3070a0)", accent:"#70b0e0", tags:["460ft Sand Dunes", "Fall Foliage Peak", "Freshwater Caribbean", "Most Beautiful USA"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Sleeping_Bear_Dunes_National_Lakeshore_P1013063.jpg/1280px-Sleeping_Bear_Dunes_National_Lakeshore_P1013063.jpg"},

// 2. Cannon Mountain — Franconia Notch, New Hampshire, USA
// MHT (Manchester-Boston Regional) has ZERO venues — in AP_CONTINENT(na) + AIRPORT_COORDS.
// NOTE: MHT not in BASE_PRICES destination rows — prices show as ~$X.
// Cannon Mountain: classic New England ski, Franconia Notch State Park.
// 265 acres, 2180ft vertical, aerial tramway since 1938. 80mi from MHT (90min drive).
// Pre-season now; opens Dec 1 typically. Loads for Nov 1 r/skiing launch window.
{id:"cannon-mountain-nh", category:"skiing", title:"Cannon Mountain", location:"New Hampshire, USA", lat:44.1573, lon:-71.6993, ap:"MHT", icon:"⛷️", rating:4.81, reviews:2640, gradient:"linear-gradient(160deg,#0c1830,#1a3a72,#2a62b0)", accent:"#7ab0e0", tags:["Franconia Notch", "Aerial Tramway 1938", "Classic New England Ski", "2180ft Vertical"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cannon_Mountain_Ski_Area.jpg/1280px-Cannon_Mountain_Ski_Area.jpg"},

// 3. Lee Canyon — Mt. Charleston, Nevada, USA
// LAS (Las Vegas Harry Reid) has ZERO venues — fully in AP_CONTINENT(na) + AIRPORT_COORDS + BASE_PRICES.
// Lee Canyon at Mt. Charleston: 45min from the Las Vegas Strip.
// 11,918ft summit, 1,500ft vertical, 200+ acres. Real mountain, not just a day-trip novelty.
// Pre-season (opens mid-Dec typically). Unique proposition: ski by day, Vegas by night.
{id:"lee-canyon-nv", category:"skiing", title:"Lee Canyon", location:"Nevada, USA", lat:36.3325, lon:-115.6712, ap:"LAS", icon:"⛷️", rating:4.74, reviews:1840, gradient:"linear-gradient(160deg,#1a0a30,#3a1a78,#5a30b8)", accent:"#9060f8", tags:["45min from Vegas Strip", "Mt. Charleston", "1500ft Vertical", "High Desert Ski"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Lee_Canyon_Ski_Area_Chairlift.jpg/1280px-Lee_Canyon_Ski_Area_Chairlift.jpg"},

// 4. Karekare Beach — Auckland, New Zealand
// AKL already has 1 venue (Piha Beach). Karekare is 5km south — distinct character.
// Wild black sand beach, The Piano (1993 film was shot here), 550-person legal limit.
// 40min drive from Auckland CBD. October = NZ spring prime: water 17°C, wild surf, cliff walks.
// Distinct from Piha: more isolated, no surf school, pure wilderness experience.
{id:"karekare-beach-nz", category:"beach", title:"Karekare Beach", location:"Auckland, New Zealand", lat:-36.9980, lon:174.4660, ap:"AKL", icon:"🏖️", rating:4.91, reviews:4200, gradient:"linear-gradient(160deg,#0a1c28,#1a3a58,#2a5888)", accent:"#6898c8", tags:["The Piano Film Location", "Wild Black Sand", "Spring Prime NZ", "500-Person Limit"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Karekare_Beach_-_New_Zealand.jpg/1280px-Karekare_Beach_-_New_Zealand.jpg"},

// 5. Ilha Grande — Rio de Janeiro State, Brazil
// GIG already has 1 venue (Ipanema area). Ilha Grande is 150km southwest — completely different.
// Car-free island (no motor vehicles allowed), 102 beaches, Atlantic Forest UNESCO.
// Accessible via 2h ferry from Angra dos Reis or Mangaratiba (near GIG, 2h total).
// October = Brazilian spring prime: water 24°C, trails green, crowds thin vs. Dec–Feb.
{id:"ilha-grande-rj", category:"beach", title:"Ilha Grande", location:"Rio de Janeiro State, Brazil", lat:-23.1600, lon:-44.2200, ap:"GIG", icon:"🏖️", rating:4.95, reviews:6700, gradient:"linear-gradient(160deg,#001a20,#003840,#005a60)", accent:"#40a0c0", tags:["102 Beaches", "Car-Free Island", "Atlantic Forest UNESCO", "Spring Prime Brazil"], photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ilha_Grande_-_Praia_Lopes_Mendes.jpg/1280px-Ilha_Grande_-_Praia_Lopes_Mendes.jpg"},
```

**Pre-paste checklist:**
1. Run `node scripts/validate-venues.mjs` with these in `data/venue-candidates.json`
2. **DTW** (Detroit) — ✅ AP_CONTINENT(`na`) + AIRPORT_COORDS + BASE_PRICES confirmed; **0 existing venues**
3. **MHT** (Manchester NH) — ✅ AP_CONTINENT(`na`) + AIRPORT_COORDS confirmed; ⚠️ NOT in BASE_PRICES as destination (prices show as `~$X`)
4. **LAS** (Las Vegas) — ✅ AP_CONTINENT(`na`) + AIRPORT_COORDS + BASE_PRICES confirmed; **0 existing venues**
5. **AKL** (Auckland) — ✅ AP_CONTINENT(`oceania`) + AIRPORT_COORDS + BASE_PRICES confirmed; 1 existing venue (Piha)
6. **GIG** (Rio de Janeiro) — ✅ AP_CONTINENT(`latam`) + AIRPORT_COORDS + BASE_PRICES confirmed; 1 existing venue (Ipanema area)

**⚠️ Prior proposals needing AIRPORT_COORDS fix before use:**
The Oct 1 proposals (Alpe d'Huez/GNB, Venice Lido/VCE, Shonan Coast/HND) require adding their airports to `AIRPORT_COORDS` first. See correction in §1 above. Bad Gastein/SZG and Los Gigantes/TFS from Oct 1 are fine — SZG + TFS are already in AIRPORT_COORDS.

**Full queue depth tracking (code frozen since Sep 14):**

| Date | Proposals (5/day) | Status |
|------|-------------------|--------|
| Sep 29 | hahei-beach-coromandel-nz, praia-do-rosa-sc, ilhabela-sp-brazil, noosa-heads-qld (+zakopane dup skip) | NOT ADDED |
| Sep 30 | arraial-do-cabo-gig, akaroa-banks-peninsula-nz, crane-beach-barbados-bgi, sestriere-it, anse-georgette-praslin-sez | NOT ADDED |
| Oct 1 | alpe-dhuez-fr (GNB ⚠️ needs AIRPORT_COORDS), venice-lido-it (VCE ⚠️ same), shonan-kamakura-jp (HND ⚠️ same), bad-gastein-at, los-gigantes-tfe | NOT ADDED |
| **Oct 2** | sleeping-bear-dunes-mi, cannon-mountain-nh, lee-canyon-nv, karekare-beach-nz, ilha-grande-rj | **QUEUED** |

---

## 6. One Observation for PM

**Oct 4 VPS deadline is tomorrow at this time — 48h window closes today by end of day to hit the pre-traffic gate.** DevOps has flagged this as P1 for 54 days. Once the VPS is redeployed, the code freeze lifts and all 20+ queued venue proposals (Sep 29–Oct 2) can land in a single commit alongside the Gili Trawangan rename. That means the Oct 5 rename + the 4-day backlog + tag enrichment for 225 venues could all ship in one session — a clean content sprint before the Nov 1 r/skiing post. The Oct 1 airport-coords corrections (GNB/VCE/HND) are a 3-line add; include them in that commit and unlock 3 high-quality European venues that were previously blocked.

Tignes countdown: **23 days to Oct 25 opening.** The launch week snow hook is on schedule.
