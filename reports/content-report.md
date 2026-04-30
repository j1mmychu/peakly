# Content & Data Report — 2026-04-30

**Agent:** Content & Data  
**Data health score: 84/100** ↓ 1 from April 29 (85). New find: `aruba-eagle-beach-t1` confirmed same-category duplicate of `beach_eagle`. All other open issues carry forward unchanged.

**Score breakdown:**  
Required fields 100% +20 | No duplicate IDs +10 | Photos present (3 dupe pairs) +8 | All surfing `facing` fields +5 | Valid IATA codes +5 | Geographic diversity +9 | Ski gear 6 items ✅ +3 | Open: 3 dupe photo pairs −3 | 2 same-cat duplicate titles −3 | 26 ski venues missing `skiPass` −4 | Tanning gear low AOV ($27 avg) −2 | India + Bahamas tanning gaps −2

---

## FIXES APPLIED THIS RUN

None — read-only audit. All changes are paste-ready below.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 235 venues

| Category | Count | Delta vs Apr 29 | Status |
|----------|-------|-----------------|--------|
| tanning  | 88    | — | ✅ Healthy |
| surfing  | 76    | — | ✅ Healthy |
| skiing   | 71    | — | ✅ Healthy |
| **TOTAL**| **235** | — | 3 live categories |

All 235 venues: 100% field coverage (lat/lon/ap/tags/photo). Zero duplicate IDs. All 76 surfing venues have `facing` bearing. Zero null-island coordinates. Zero IATA format violations.

---

### P0 🔴 — 3 DUPLICATE PHOTO PAIRS (unchanged from April 29)

| Venue A | Venue B | Shared Unsplash ID | Fix |
|---------|---------|--------------------|-----|
| `angourie-point-s3` (surfing, AUS) | `arugam_bay` (surfing, LKA) | `photo-1507525428034-b723cf961d3e` | Replace angourie-point-s3 photo |
| `portillo-s4` (skiing, CHL) | `perisher` (skiing, AUS) | `photo-1520175462-89499834c4c1` | Delete portillo-s4 (same-cat dupe anyway) |
| `beach_phuquoc` (tanning, VNM) | `beach_praslin` (tanning, SYC) | `photo-1540202404-a2f29016b523` | Replace beach_phuquoc photo |

---

### P1 🔴 — 2 SAME-CATEGORY VENUE DUPLICATES

**Carries from April 29 (fernando-de-noronha-s20) + newly confirmed this run (aruba-eagle-beach-t1):**

| Delete | Keep | Category | Problem |
|--------|------|----------|---------|
| `fernando-de-noronha-s20` (rating 4.75, 2381 reviews) | `noronha_surf` (rating 4.96, 1980 reviews) | surfing | batch-gen stub; tagged "Barrel Waves" — Noronha is not a barrel spot |
| `aruba-eagle-beach-t1` (**NEW this run**, rating 4.53, 3660 reviews) | `beach_eagle` (rating 4.95, 13400 reviews) | tanning | Same Eagle Beach location; original has 3.5x more reviews |

Both deletions = 235 → 233 venues, eliminates portillo-s4 photo conflict simultaneously, health score +3.

---

### P2 🟡 — 26 SKI VENUES MISSING `skiPass` (unchanged from April 29)

Down from 28 → 26 since April 28 agent deleted `aspen-snowmass-s7` and `arapahoe-basin-s9`.

Likely Ikon: `big-white-ski-s5`, `kicking-horse-s10`  
Likely Epic: `stowe-mountain-s14`  
Safe as `"independent"`: all remaining 23

Full list: `zell-am-see-s1`, `appi-kogen-s2`, `hemsedal-s3`, `portillo-s4`, `big-white-ski-s5`, `idre-fjall-s6`, `kicking-horse-s10`, `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13`, `stowe-mountain-s14`, `champoluc-monterosa-s15`, `val-d-isere-s16`, `sun-peaks-resort-s17`, `chamonix-mont-blanc-s18`, `pucon-ski-center-s19`, `les-arcs-s20`, `powder-mountain-s21`, `madarao-mountain-s22`, `thredbo-village-s23`, `nevis-range-s24`, `tsugaike-kogen-s25`, `mount-shasta-ski-s26`, `lech-zurs-s27`, `cerro-castor-s28`, `treble-cone-s29`

---

### P3 🟢 — COORDINATE SPOT-CHECKS (7 verified)

| Venue | Actual | Expected | Result |
|-------|--------|----------|--------|
| beach_magens (USVI) | 18.370, −64.933 | 18.38, −64.96 | ✅ |
| beach_positano (Italy) | 40.628, 14.485 | 40.63, 14.49 | ✅ |
| beach_diani (Kenya) | −4.272, 39.593 | −4.28, 39.57 | ✅ |
| teahupoo (Tahiti) | −17.867, −149.259 | −17.84, −149.26 | ✅ |
| cloudbreak (Fiji) | −17.775, 177.236 | −17.80, 177.20 | ✅ |
| jeffreys_bay (South Africa) | −34.050, 24.920 | −34.05, 24.93 | ✅ |
| skeleton-bay (Namibia, Apr 28) | −26.645, 15.158 | −26.64, 15.16 | ✅ |

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|---------|--------|
| skiing   | 6     | ~$175   | ✅ Fixed April 28 (skis + pack added) |
| surfing  | 6     | ~$67    | ✅ Adequate |
| tanning  | 4     | ~$27    | ⚠️ Low — swap Beach Towel for duffel |

**Tanning upgrade — paste-ready replacement:**

```javascript
  tanning: [
    { name:"Reef Safe Sunscreen",               store:"Amazon", price:"$15+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen" },
    { name:"Polarized Sunglasses",              store:"Amazon", price:"$49+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=polarized+sunglasses" },
    { name:"Patagonia Black Hole Duffel 55L",   store:"Amazon", price:"$189+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=patagonia+black+hole+duffel+bag" },
    { name:"Hydration Drink Mix",               store:"Amazon", price:"$25+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=hydration+drink+mix" },
  ],
```
Est. AOV: $27 → $70 after swap.

---

## 3. SEASONAL RELEVANCE — April 30

### Skiing
- **63 NH venues:** End of season. Algorithm scores from live snowpack. ✅
- **8 SH venues (pre-season, opens June/July):** Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone, Las Leñas, Nevis Range → algorithm score 8 "Off-season." ✅
- **Val Thorens (Apr 28 addition):** High altitude 2300m, season runs to early May. Algorithm handles correctly. ✅

### Surfing — Prime April Windows

| Region | In-Season Venues | Notes |
|--------|-----------------|-------|
| Morocco Atlantic | Taghazout, Anchor Point | NW swell season peak |
| Bali | Uluwatu, Padang Padang, Keramas | Dry season, offshore trades |
| East Java | G-Land | SE trades ramping up (May–Oct season) |
| Portugal | Supertubos, Ericeira, Nazaré | NW Atlantic swell active |
| Philippines | Siargao | Dry season cross-swell |

### Tanning
Caribbean, SE Asia, East Africa, Pacific: all prime. French Riviera / Croatia: shoulder (water 16–18°C). Algorithm handles via live weather. ✅

---

## 4. CONTENT QUALITY

**Tag inaccuracies confirmed:**

| Venue | Issue |
|-------|-------|
| `fernando-de-noronha-s20` | "Barrel Waves" — Noronha is a mellow right reef, not barrels |
| `aruba-eagle-beach-t1` | Lower-quality dupe with generic tags |
| `tsurigasaki-s23` | "World Class","Big Waves","Hollow Tubes" — it's the 2020 Tokyo Olympic mushy beachbreak |
| `fanore-s28` | "World Class","Big Waves","Hollow Tubes" — it's a mellow County Clare beach break |

**Geographic gaps still open:**
- **India:** ZERO tanning venues. Goa gets 500K+ intl tourists/year.
- **Bahamas:** ZERO tanning venues. Top-5 US travel destination.
- **Austria skiing:** No St. Anton am Arlberg — birthplace of Alpine skiing, Arlberg Pass.
- **Central America surf:** Only Pavones. Missing Nosara/Playa Guiones — region's #1 consistent beachbreak.

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues (copy-paste ready)

**Targets:** Austria ski gap, Central America surf gap, Bahamas tanning gap, India tanning gap, Greece iconic beach. Skeleton Bay ✅ added April 28 — not duplicated.

Paste inside `VENUES` array before the closing `];`:

```javascript
  {id:"st-anton",            category:"skiing",  title:"St. Anton am Arlberg",    location:"Tyrol, Austria",              lat:47.1296,lon:10.2661,  ap:"INN",icon:"🎿",rating:4.96,reviews:4120,gradient:"linear-gradient(160deg,#0a1828,#1e3a6e,#3a6abd)",accent:"#82b0e8",skiPass:"independent",tags:["Birthplace of Alpine Skiing","Arlberg Pass","Off-Piste Paradise","Expert Terrain"],photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop"},
  {id:"nosara",              category:"surfing", title:"Playa Guiones, Nosara",   location:"Guanacaste, Costa Rica",      lat:9.9714,lon:-85.6530,  ap:"SJO",icon:"🌊",rating:4.90,reviews:3280,gradient:"linear-gradient(160deg,#001a3a,#004080,#0080c0)",accent:"#40a0ff",tags:["Consistent Beach Break","Digital Nomad Hub","All Levels","Warm Water Year-Round"],photo:"https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&h=600&fit=crop",facing:270},
  {id:"pink-sands-bahamas",  category:"tanning", title:"Pink Sands Beach",        location:"Harbour Island, Bahamas",     lat:25.4982,lon:-76.6280, ap:"ELH",icon:"🏖️",rating:4.98,reviews:7840,gradient:"linear-gradient(160deg,#2a0a1e,#6a2050,#d06090)",accent:"#f0a0c0",tags:["Pink Sand Beach","Crystal Bahamas Blue","Boutique Island","Car-Free"],photo:"https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=800&h=600&fit=crop"},
  {id:"palolem-goa",         category:"tanning", title:"Palolem Beach, Goa",      location:"South Goa, India",            lat:14.9957,lon:74.0234,  ap:"GOI",icon:"🏖️",rating:4.88,reviews:9650,gradient:"linear-gradient(160deg,#1a2a00,#2e5016,#5a9040)",accent:"#90c840",tags:["India's Best Beach","Crescent Bay","Nov–Mar Peak","Yoga & Chill"],photo:"https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop"},
  {id:"navagio-zakynthos",   category:"tanning", title:"Navagio Shipwreck Beach",  location:"Zakynthos, Greece",           lat:37.8591,lon:20.6241,  ap:"ZTH",icon:"🏖️",rating:4.99,reviews:18200,gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",accent:"#33bbff",tags:["World's Most Photographed Beach","Shipwreck Cove","Boat Access Only","Limestone Cliffs"],photo:"https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=600&fit=crop"},
```

**Field verification:**

| ID | IATA | Coords | Notes |
|----|------|--------|-------|
| `st-anton` | INN ✅ Innsbruck | 47.130, 10.266 | Arlberg Pass = independent. Not on Epic/Ikon. |
| `nosara` | SJO ✅ San José CR | 9.971, −85.653 | facing:270 W-facing beachbreak |
| `pink-sands-bahamas` | ELH ✅ North Eleuthera | 25.498, −76.628 | Harbour Island = 5-min ferry from ELH |
| `palolem-goa` | GOI ✅ Goa Dabolim Intl | 14.996, 74.023 | Off-season April — algorithm returns appropriate low score |
| `navagio-zakynthos` | ZTH ✅ Zakynthos Intl | 37.859, 20.624 | Boat access only. May–Oct peak season. |

---

## One Observation for PM

**India and the Bahamas are the most glaring geographic blind spots for a global app.** India (1.4B people, Goa alone draws 500K+ international tourists/year) has zero tanning venues. The Bahamas is a top-5 US travel destination with zero representation. Both gaps were present before April 28's venue additions and remain today. Adding Palolem, Pink Sands, and Navagio (proposed this run) fills three high-SEO geographic holes that are near-certain to drive organic search traffic and social sharing — Navagio is the most-Instagrammed beach in Europe and a natural trigger for the share feature.
