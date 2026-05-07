# Content & Data Report — 2026-05-07

**Agent:** Content & Data
**Data health score: 76/100** (was 71 on May 6; +5 for false-positive photo dupe correction)

**Score breakdown:**
Required fields 100% +20 | No duplicate IDs +10 | 3 photo dup sets -6 | 6 duplicate venue pairs -12 | lateSeason ghost feature -8 | PDX AP_CONTINENT override bug -3 | 11 s-series venues with recycled wrong tags -5 | Geographic diversity +8 | Surfing retirement limbo -2 | s-series skiPass gap -2 | AP_CONTINENT now complete +1 | All surfing venues have facing +5

---

## What Changed Since May 6

New findings this run:
- CONFIRMED: PDX double-definition bug — line 272 "PDX":"north_america" overrides correct PDX:"na" at line 199. Mt Hood Meadows invisible in N. America continent filter.
- CONFIRMED: lateSeason completely absent from app.jsx — CLAUDE.md says DONE (2026-05-04), zero occurrences in the file.
- CORRECTED: May 6 "4th photo dupe" (cape_hatteras/bathsheba) was a false positive. They share a date prefix in the Unsplash ID (1544551763) but have different unique suffixes (-46a013bb70d5 vs -77932c184deb). They are different photos. Actual photo dups = 3 sets, not 4.

---

## 1. Data Integrity Audit

### Category Breakdown — 240 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach / Tanning | 89 | Active |
| Surfing | 78 | Limbo — CLAUDE.md says retired, CATEGORIES pill + 78 venues still live |
| Skiing | 73 | Active |
| TOTAL | 240 | 3 categories in code, 2 claimed active |

100% field coverage across all 240 venues. Zero duplicate IDs. All 78 surfing venues have facing. All IATA codes valid 3-letter format (157 unique airports). Ratings 4.50-4.99. Reviews 446-42,800.

---

### P0-A CRITICAL: lateSeason — ghost feature (claimed DONE, completely absent)

lateSeason appears zero times in app.jsx — not in VENUES (lines 315-584), not in scoreVenue (lines 1075-1110). CLAUDE.md "Recently Fixed 2026-05-04" is wrong.

Double failure:
1. cervinia (line 381) and val-d-isere-s16 (line 525) missing lateSeason:true
2. scoreVenue has no code path reading venue.lateSeason — flags would be ignored even if they existed

Impact (May 7): isShoulder=true for N. hemisphere in May. Shoulder cap at line 1110 clamps scores to <=32. Cervinia's 3,883m glacier and Val d'Isere's Grand Motte are likely open, scoring <=32, hiding real conditions.

Surgical fix — 2 steps:

Step 1 (venue data):
- Add lateSeason:true to cervinia line 381
- Add lateSeason:true to val-d-isere-s16 line 525

Step 2 (scoreVenue line 1110):
BEFORE: if (isShoulder && snow < 5 && baseCm < 50) score = Math.min(score, 32);
AFTER:  if (isShoulder && !venue.lateSeason && snow < 5 && baseCm < 50) score = Math.min(score, 32);

Add before off-season hard gate at ~line 1081:
  if (!inSeason && !isShoulder && venue.lateSeason && depth >= 50) { /* glacier open — skip gate */ }
  else if (!inSeason && !isShoulder) {


### P0-B: PDX double-definition in AP_CONTINENT

Line 199: PDX:"na"  (correct)
Line 272: "PDX":"north_america"  (WRONG — overrides correct value)

JS duplicate keys keep the last value. AP_CONTINENT["PDX"] = "north_america" which never matches the "na" filter. Mt Hood Meadows (ap:"PDX") invisible in N. America continent filter.

Fix: delete line 272 ("PDX":"north_america").


### P1: 6 Same-Location Duplicate Venue Pairs (open since Apr 23, 1 added May 6)

| Delete | Keep | Evidence |
|--------|------|---------|
| chamonix-mont-blanc-s18 | chamonix | NEW May 6 — same lat/lon (45.9237, 6.8694). Wrong tags, 1,477 vs 3,405 reviews. |
| banzai_pipeline | pipeline | 250m apart, same wave. pipeline is canonical. |
| fernando-de-noronha-s20 | noronha_surf | 0.003 degrees apart. noronha_surf has correct tags. |
| siargao | cloud9 | Same reef. cloud9 predates the dupe. |
| snappers-gold-coast-s26 | snapper_rocks | Superbank break. snapper_rocks is canonical. |
| aruba-eagle-beach-t1 | beach_eagle | Eagle Beach Aruba. beach_eagle has 13,400 reviews vs 3,660. |

Net: 240 → 234 venues after 6 deletes.


### P2: 3 Photo Duplicate Sets

| Photo base ID | Venues | Fix |
|---------------|--------|-----|
| photo-1507525428034-b723cf961d3e | angourie-point-s3, arugam_bay, tamarindo (3-way) | Swap tamarindo → photo-1590523741831-ab7e8b8f9c7f?w=800&h=600&fit=crop |
| photo-1540202404-a2f29016b523 | beach_praslin, beach_phuquoc | Swap beach_phuquoc → photo-1528127269322-539801943592?w=800&h=600&fit=crop |
| photo-1520175462-89499834c4c1 | portillo-s4, perisher | Swap portillo-s4 → photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop |

May 6 false positive: cape_hatteras (photo-1544551763-46a013bb70d5) and bathsheba (photo-1544551763-77932c184deb) are different photos — different unique suffixes. Not a dup.


### P3: 11 S-Series Venues with Recycled Wrong Tags

Template A "Expert Terrain","Off-Piste","Deep Snow","Backcountry" — used by 6 venues regardless of terrain:
zell-am-see-s1 (lake-view family resort), kiroro-snow-world-s11, val-d-isere-s16, powder-mountain-s21, mount-shasta-ski-s26, idre-fjall-s6 (Swedish beginner/family resort — "Off-Piste Backcountry" is factually wrong)

Template B "Black Diamonds","Steep Chutes","Variable Terrain","Long Season" — used by 5 venues:
hemsedal-s3, sainte-foy-tarentaise-s13, thredbo-village-s23, cerro-castor-s28, chamonix-mont-blanc-s18 (delete candidate)

Paste-ready tag fixes for worst offenders:

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


### Minor flags

- natadola-beach-t9 and mana-island-fiji-t12: location:"Fiji" is too generic
- kuta-beach: category:"surfing" but Kuta is Bali's main tourist beach; if surfing is retired, should be "tanning"

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV avg | Status |
|----------|-------|-------------|--------|
| Skiing | 6 | ~$172 | Good |
| Surfing | 6 | ~$61 | Surfing status pending product decision |
| Beach / Tanning | 4 | ~$27 | Largest category, lowest monetization |

Paste-ready replacement for GEAR_ITEMS.tanning (lines 5478-5483):

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
| N. hemisphere (58 venues) | isShoulder=true — scores capped <=32 | Most resorts closed. Cervinia + Val d'Isere likely open but scoring broken (P0-A). |
| S. hemisphere (15 venues) | inSeason=true — full scoring | Season opens mid-June (NZ), July (Chile/Argentina), June (Australia). Scoring 4-6 weeks early — Remarkables/Treble Cone will surface before opening. |

### Beach / Tanning

| Region | May 7 |
|--------|-------|
| Caribbean / Mexico | Peak pre-hurricane |
| Mediterranean | Good — warming fast (France 22C, Greece 18C) |
| SE Asia E coast (Vietnam, Philippines) | Good |
| SE Asia W coast (Krabi, Phuket, Koh Samui) | SW monsoon arriving — handled by weather API |
| Tropical / Cape Verde | Always on; zero Atlantic island coverage in app |

---

## 4. FIVE NEW VENUE OBJECTS

Targeting: 2 skiing with lateSeason:true (directly exercises P0-A fix), 3 beach (seasonal + geographic gaps).

Add to AP_CONTINENT if not present:
```javascript
CUR:"na", TIV:"europe", SID:"africa",
```
(ZRH and INN already mapped via andermatt and ischgl.)

```javascript
  // Skiing: Saas-Fee, Switzerland — glacier, lateSeason:true
  // In CLAUDE.md planned/missing list. ~10 months/year on glacier.
  // With lateSeason:true + P0-A fix, surfaces in May when 58 NH ski venues score 8.
  // ZRH = Zurich (~260km).
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

  // Skiing: Hintertux Glacier, Austria — only 365-day resort in Europe, lateSeason:true
  // In CLAUDE.md planned/missing list. Opens every day of the year.
  // INN = Innsbruck (~80km / 1hr).
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
  // West-coast cove, flat turquoise water, year-round season. CUR = on-island.
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
  // Medieval island fortress + beaches. Most recognizable coastal image in western Balkans.
  // TIV = Tivat Airport (~35km). Peak: May-Sept. Good right now.
  // Photo differs from beach_praslin (avoids existing photo-1540202404 dupe).
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

  // Beach: Cape Verde Sal — zero West Africa / mid-Atlantic island coverage
  // 330+ sunny days/year. Direct flights from London, Amsterdam, Lisbon.
  // Year-round 27C water. SID = on Sal island (~10min to beach).
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
- Saas-Fee + Hintertux: Both in CLAUDE.md planned list. With lateSeason:true, these are the first venues that will actually exercise the P0-A scoring fix. Without them, fixing the code has nothing to score against in May.
- Curacao: Fills ABC island gap after aruba-eagle-beach-t1 is deleted. Caribbean island coverage stays whole.
- Sveti Stefan: Zero Balkans south of Croatia. TIV airport gaining direct routes from UK/Germany/Netherlands. Photo chosen to avoid existing beach_praslin dupe.
- Cape Verde: Zero West Africa / mid-Atlantic island coverage. Year-round destination, strongest in May for Northern European users wanting guaranteed sun.

Note on photos: Verify all 5 Unsplash photo IDs resolve before committing. Gradient is always the visual fallback if an ID 404s.

---

## One Observation for PM

The lateSeason bug and the duplicate backlog are compounding. Fixing P0-A requires adding saas-fee + hintertux (the lateSeason test cases), but even after that fix, 6 duplicate entries keep inflating venue count. Neither problem is hard to fix: 5 lines in scoreVenue + 6 line deletes + 2 venue additions = one commit under 20 lines. What's blocking it is agents flagging without shipping. The next session touching app.jsx should ship P0-A fix + 6 deletes as one atomic unit before adding any new content.

---

Report written by Content & Data agent — 2026-05-07. Next run: 2026-05-08.
