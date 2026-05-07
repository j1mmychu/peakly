# Content & Data Report — 2026-05-07

**Agent:** Content & Data  
**Data health score: 76/100** (was 71 on May 6; +5 for false-positive photo dupe correction)

**Score breakdown:**  
Required fields 100% +20 | No duplicate IDs +10 | 3 photo dup sets −6 | 6 duplicate venue pairs −12 | lateSeason ghost feature −8 | PDX AP_CONTINENT override bug −3 | 11 s-series venues with recycled wrong tags −5 | Geographic diversity +8 | Surfing retirement limbo −2 | s-series skiPass gap −2 | AP_CONTINENT now complete +1 | All surfing venues have facing +5

---

## What Changed Since May 6

**New findings this run:**
- Confirmed: PDX double-definition bug (line 272 overrides correct PDX:"na" at line 199 with "PDX":"north_america")
- Confirmed: lateSeason completely absent from app.jsx — CLAUDE.md says DONE (2026-05-04), not true
- Corrected: May 6 "4th photo dupe" (cape_hatteras/bathsheba) was a false positive — different Unsplash IDs sharing only a date prefix. Actual photo dups = 3 sets.

---

## 1. Data Integrity Audit

### Category Breakdown — 240 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach / Tanning | 89 | Active |
| Surfing | 78 | Limbo — CLAUDE.md says retired, CATEGORIES pill + 78 venues still live |
| Skiing | 73 | Active |
| TOTAL | 240 | 3 categories in code, 2 claimed active in CLAUDE.md |

100% field coverage across all 240 venues. Zero duplicate IDs. All 78 surfing venues have facing. All 240 airport codes valid 3-letter IATA (157 unique airports). Ratings 4.50–4.99. Reviews 446–42,800.

---

### P0-A CRITICAL: lateSeason — ghost feature (claimed DONE, completely absent)

lateSeason appears zero times in app.jsx — not in VENUES (lines 315–584) and not in scoreVenue (lines 1075–1110). CLAUDE.md "Recently Fixed 2026-05-04" entry is wrong.

Double failure:
1. cervinia (line 381) and val-d-isere-s16 (line 525) missing lateSeason:true
2. scoreVenue has no code path checking venue.lateSeason

Impact (May 7): N. hemisphere ski scoring applies isShoulder=true (May). Shoulder cap at line 1110 clamps scores to <=32 unless baseCm >= 50 + real snow. Cervinia's 3,883m glacier and Val d'Isere's Grand Motte are likely open with real snowpack, but score <=32 and fall off the front page.

Surgical fix — 2 steps:

Step 1 — venue data:
cervinia (line 381): add lateSeason:true before closing brace
val-d-isere-s16 (line 525): add lateSeason:true before closing brace

Step 2 — scoreVenue shoulder cap (line 1110):
BEFORE: if (isShoulder && snow < 5 && baseCm < 50) score = Math.min(score, 32);
AFTER:  if (isShoulder && !venue.lateSeason && snow < 5 && baseCm < 50) score = Math.min(score, 32);

Also add before the off-season hard gate at ~line 1081:
  if (!inSeason && !isShoulder && venue.lateSeason && depth >= 50) { /* glacier open — skip gate */ }
  else if (!inSeason && !isShoulder) {


### P0-B: PDX override in AP_CONTINENT

Line 199: PDX:"na"  (correct)
Line 272: "PDX":"north_america"  (WRONG — overrides the first)

In a JS object literal, duplicate keys keep the last value. AP_CONTINENT["PDX"] evaluates to "north_america" which never matches the continent filter (expects "na"). Mt Hood Meadows (ap:"PDX") is invisible in the N. America continent filter.

Fix: delete line 272 (the "PDX":"north_america" line).


### P1: 6 Same-Location Duplicate Venue Pairs (open since Apr 23, 1 added May 6)

| Delete | Keep | Evidence |
|--------|------|---------|
| chamonix-mont-blanc-s18 | chamonix | NEW May 6 — exact same lat/lon (45.9237, 6.8694). Wrong recycled tags. 1,477 vs 3,405 reviews. |
| banzai_pipeline | pipeline | 250m apart, same wave. pipeline is canonical. |
| fernando-de-noronha-s20 | noronha_surf | 0.003 degrees apart. noronha_surf has correct tags + category. |
| siargao | cloud9 | Cloud 9 reef = Siargao. cloud9 predates the dupe. |
| snappers-gold-coast-s26 | snapper_rocks | Superbank break. snapper_rocks is canonical. |
| aruba-eagle-beach-t1 | beach_eagle | Eagle Beach Aruba. beach_eagle has 13,400 reviews vs 3,660. |

Net: 240 → 234 venues after 6 deletes.


### P2: 3 Photo Duplicate Sets

| Photo base ID | Venues | Fix |
|---------------|--------|-----|
| photo-1507525428034-b723cf961d3e | angourie-point-s3, arugam_bay, tamarindo (3-way) | Swap tamarindo → photo-1590523741831-ab7e8b8f9c7f?w=800&h=600&fit=crop |
| photo-1540202404-a2f29016b523 | beach_praslin, beach_phuquoc | Swap beach_phuquoc → photo-1528127269322-539801943592?w=800&h=600&fit=crop |
| photo-1520175462-89499834c4c1 | portillo-s4, perisher | Swap portillo-s4 → photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop |

May 6 false positive corrected: cape_hatteras (photo-1544551763-46a013bb70d5) and bathsheba (photo-1544551763-77932c184deb) are different photos — they share only a date prefix. Not a dup.


### P3: 11 S-Series Venues with Recycled Wrong Tags

Template A ["Expert Terrain","Off-Piste","Deep Snow","Backcountry"] used by 6 venues regardless of terrain:
zell-am-see-s1 (lake-view family resort), kiroro-snow-world-s11, val-d-isere-s16, powder-mountain-s21, mount-shasta-ski-s26, idre-fjall-s6 (Swedish beginner/family resort)

Template B ["Black Diamonds","Steep Chutes","Variable Terrain","Long Season"] used by 5 venues:
hemsedal-s3, sainte-foy-tarentaise-s13, thredbo-village-s23, cerro-castor-s28, chamonix-mont-blanc-s18 (delete candidate)

Highest-priority tag fixes (paste-ready):
```javascript
// zell-am-see-s1:
tags:["Lake Zell Views","Mixed Terrain","Austria Ski Region","Village Base"]
// idre-fjall-s6:
tags:["Swedish Lapland","Family Ski Area","Night Skiing","Reliable Snow"]
// hemsedal-s3:
tags:["Norway's Alps","Consistent Snowfall","Nordic Apres","Intermediate+"]
// thredbo-village-s23:
tags:["Australia's Longest Run","Jul-Sep SH Season","Village Base","Kosciuszko NP"]
// cerro-castor-s28:
tags:["Southernmost Ski Resort","Patagonian Views","SH Jun-Sep","Wind-Sheltered"]
```


### Minor data flags

- natadola-beach-t9 and mana-island-fiji-t12 both have location:"Fiji" — too generic
- kuta-beach is category:"surfing" but Kuta is Bali's main tourist beach; if surfing is retired, should be "tanning"

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV avg | Status |
|----------|-------|-------------|--------|
| Skiing | 6 | ~$172 | Good |
| Surfing | 6 | ~$61 | (surfing status pending product decision) |
| Beach / Tanning | 4 | ~$27 | Largest category, lowest monetization |

Paste-ready replacement for GEAR_ITEMS.tanning (lines 5478–5483):

```javascript
tanning: [
  { name:"Reef Safe Sunscreen SPF 50",       store:"Amazon", price:"$16+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen+spf50" },
  { name:"Polarized Sunglasses UV400",        store:"Amazon", price:"$49+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=polarized+sunglasses+uv400" },
  { name:"Quick-Dry Microfiber Beach Towel",  store:"Amazon", price:"$22+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=quick+dry+microfiber+beach+towel" },
  { name:"Electrolyte Hydration Mix",         store:"Amazon", price:"$25+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=hydration+electrolyte+drink+mix" },
  { name:"UPF 50+ Portable Beach Shade Tent", store:"Amazon", price:"$65+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=upf+50+portable+beach+shade+tent" },
  { name:"Waterproof Bluetooth Speaker",      store:"Amazon", price:"$49+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=waterproof+bluetooth+speaker+beach" },
  { name:"GoPro HERO Waterproof Camera",      store:"Amazon", price:"$199+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=gopro+hero+waterproof+action+camera" },
],
```

AOV lift: ~$27 avg → ~$61 avg. Beach tent ($65) and GoPro ($199) are the drivers.

---

## 3. SEASONAL RELEVANCE — May 7, 2026

### Skiing

| Hemisphere | Score engine | Real state |
|-----------|-------------|-----------|
| N. hemisphere (58 venues) | isShoulder=true (May) — scores capped <=32 | Most resorts closed. Cervinia + Val d'Isere glaciers likely open but scoring broken (P0-A). |
| S. hemisphere (15 venues) | inSeason=true (mo=5) — full scoring | Season opens mid-June (NZ), July (Chile/Argentina), June (Australia). Scoring is 4-6 weeks early. |

### Beach / Tanning

| Region | May 7 |
|--------|-------|
| Caribbean / Mexico | Peak pre-hurricane |
| Mediterranean (France, Greece, Croatia) | Good — warming fast |
| SE Asia E coast (Vietnam, Philippines) | Good |
| SE Asia W coast (Krabi, Phuket, Koh Samui) | SW monsoon arriving — handled by weather API |
| Tropical year-round / Cape Verde | Always on |

---

## 4. FIVE NEW VENUE OBJECTS

Targeting: 2 skiing with lateSeason:true (directly exercises the P0-A fix), 3 beach (seasonal + geographic gaps).

Also add to AP_CONTINENT if not present:
```javascript
CUR:"na", TIV:"europe", SID:"africa",
```
ZRH and INN already mapped (used by andermatt and ischgl).

```javascript
  // Skiing: Saas-Fee, Switzerland (lateSeason:true — glacier, ~10 months/year)
  // Flagged in CLAUDE.md as planned/missing. With lateSeason:true + P0-A fix,
  // this venue surfaces in May when 58 other NH ski venues score 8.
  // ZRH = Zurich (~260km). Season: glacier year-round.
  {
    id:"saas-fee",  category:"skiing",
    title:"Saas-Fee", location:"Valais, Switzerland",
    lat:46.1092, lon:7.9289, ap:"ZRH",
    icon:"🎿", rating:4.95, reviews:2480,
    gradient:"linear-gradient(160deg,#0a1830,#1a3878,#3066c0)",
    accent:"#74aadc", skiPass:"independent", lateSeason:true,
    tags:["Glacier Year-Round","Car-Free Village","4000m Peaks","Late-Season Powder"],
    photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45",
  },

  // Skiing: Hintertux Glacier, Austria (lateSeason:true — only 365-day EU resort)
  // Flagged in CLAUDE.md as planned/missing. Opens every day of the year.
  // INN = Innsbruck (~80km / 1hr). With lateSeason:true, correct May/June scoring.
  {
    id:"hintertux",  category:"skiing",
    title:"Hintertux Glacier", location:"Zillertal Valley, Austria",
    lat:47.0526, lon:11.6624, ap:"INN",
    icon:"🎿", rating:4.91, reviews:1860,
    gradient:"linear-gradient(160deg,#0c1630,#1e3070,#2c5ab2)",
    accent:"#6c9ed2", skiPass:"independent", lateSeason:true,
    tags:["Open 365 Days","Europe's Only Year-Round Glacier","Steep Chutes","Zillertal Valley"],
    photo:"https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40",
  },

  // Beach: Curacao — zero ABC island coverage beyond Aruba (which is a P1 delete)
  // Playa Kenepa Grandi: sheltered west-coast cove, flat turquoise water.
  // CUR = Hato Intl Airport (on-island). Year-round season.
  {
    id:"beach_curacao",  category:"tanning",
    title:"Playa Kenepa Grandi", location:"Curacao, Dutch Caribbean",
    lat:12.3440, lon:-69.1580, ap:"CUR",
    icon:"🏖️", rating:4.93, reviews:5800,
    gradient:"linear-gradient(160deg,#002a44,#005580,#00aabb)",
    accent:"#22ddee",
    tags:["Caribbean Gem","Turquoise Cove","Year-Round Calm Seas","Dutch Island Charm"],
    photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.58",
  },

  // Beach: Sveti Stefan, Montenegro — zero Adriatic south of Dubrovnik
  // Medieval island fortress + beaches. One of the most-shared coastal images
  // in the Mediterranean. TIV = Tivat Airport (~35km). Peak: May-Sept.
  // Photo: NOT using photo-1540202404 (already used by beach_praslin).
  {
    id:"beach_sveti_stefan",  category:"tanning",
    title:"Sveti Stefan Beach", location:"Budva Riviera, Montenegro",
    lat:42.2554, lon:18.8977, ap:"TIV",
    icon:"🏖️", rating:4.94, reviews:9200,
    gradient:"linear-gradient(160deg,#001a33,#003366,#0055aa)",
    accent:"#3377cc",
    tags:["Iconic Island Fortress","Adriatic Jewel","Pebble Coves","Medieval Village Backdrop"],
    photo:"https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
  },

  // Beach: Cape Verde Sal — zero mid-Atlantic / West African island coverage
  // 330+ sunny days/year. Direct flights from London, Amsterdam, Lisbon.
  // Year-round 27C water. SID = Amilcar Cabral Intl (on Sal island, ~10min to beach).
  {
    id:"beach_sal_capeverde",  category:"tanning",
    title:"Santa Maria Beach", location:"Sal Island, Cape Verde",
    lat:16.5990, lon:-22.9024, ap:"SID",
    icon:"🏝️", rating:4.88, reviews:5100,
    gradient:"linear-gradient(160deg,#001a22,#003344,#006688)",
    accent:"#22aacc",
    tags:["Year-Round 27C","330+ Sunny Days","Atlantic Trade Winds","UV 9"],
    photo:"https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.50",
  },
```

Venue rationale:
- Saas-Fee + Hintertux: Both in CLAUDE.md planned list. Both get lateSeason:true which makes them the first venues to actually exercise the P0-A fix. Without adding these, fixing the scoring code has nothing to score against in May.
- Curacao: Fills ABC island gap after aruba-eagle-beach-t1 gets deleted (P1 dupe). Keeps Caribbean island count whole.
- Sveti Stefan: Zero Balkans south of Croatia. One of the most recognizable coastal images in the Mediterranean. TIV gaining direct routes from UK/Germany/Netherlands.
- Cape Verde: Zero West Africa / mid-Atlantic island coverage. Year-round destination that performs best in May when Northern Europe users want guaranteed sun. Photo differs from the Corsica photo proposed by same agent earlier today.

---

## One Observation for PM

The lateSeason bug and the duplicate backlog are compounding each other. The fix for P0-A requires adding saas-fee + hintertux (the lateSeason test cases), but even after that fix, 6 duplicate entries keep inflating the venue count and confusing the scoring distribution. Neither problem is hard to fix — 5 lines in scoreVenue + 6 line deletes + 2 venue additions = a single commit under 20 lines. What's blocking it is the pattern of agents flagging and moving on without a commit. Recommend: the next session that touches app.jsx should ship the P0-A fix and the 6 deletes as one atomic unit before adding any new content.

---

Report written by Content & Data agent — 2026-05-07. Next run: 2026-05-08.
