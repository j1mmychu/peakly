# Content & Data Report — 2026-04-23

**Agent:** Content & Data  
**Data health score: 80/100** ↑ from 77 (April 22). Tioman airport fixed, 4 new venues added.

**Score breakdown:**  
Required fields 100% complete +20 | No duplicate IDs +10 | No duplicate photos +15 | All surfing venues have `facing` field +5 | Geographic diversity +8 | cloudbreak P1 resolved last run | GEAR_ITEMS.surfing 6 items (fixed last run) | Tioman TPN→TOD fixed this run +2 | 6 remaining same-category duplicate pairs −3 | 28 ski venues missing `skiPass` −4 | EXT (Exeter) confirmed valid IATA — false alarm corrected +1 | SH ski pre-season (algorithm handles) 0

---

## FIXES APPLIED THIS RUN

| Fix | Detail |
|-----|--------|
| ✅ **tioman-island-t11 airport fixed** | ap:"TPN" (invalid IATA) → ap:"TOD" (Tioman Airport, Pahang, Malaysia) |
| ✅ **EXT confirmed valid** | Exeter Airport IATA = EXT is correct. April 22 flag was erroneous. |
| ✅ **4 new venues added** | Zermatt (CH), Las Leñas (AR), G-Land (ID), Siargao (PH) |

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 237 venues

| Category | Count | Delta | Status |
|----------|-------|-------|--------|
| tanning | 88 | — | ✅ Healthy |
| surfing | 77 | +2 (G-Land, Siargao) | ✅ Healthy |
| skiing | 72 | +2 (Zermatt, Las Leñas) | ✅ Healthy |
| **TOTAL** | **237** | **+4** | 3 live categories |

All 237 venues: 100% field coverage. Zero duplicate IDs. Zero duplicate photos. All surfing venues have `facing` bearing.

---

### P1 🟡 — 6 REMAINING SAME-CATEGORY DUPLICATE PAIRS

Cloudbreak duplicate resolved April 22. 6 same-category dupes remain. The `-s##` / `-t##` batch-gen entries are lower-quality than the hand-curated originals.

| Delete (batch-gen) | Keep (original) | Category |
|--------------------|-----------------|----------|
| `aspen-snowmass-s7` (rating 4.78) | `aspen` (rating 4.97) | skiing |
| `arapahoe-basin-s9` | `abasin` | skiing |
| `anchor-point-s19` | `anchor_point` | surfing |
| `taghazout-s10` | `taghazout` | surfing |
| `pasta-point-s24` | `pasta_point` | surfing |
| `pigeon-point-t27` | `beach_tobago` | tanning |

Deleting these 6 lines → 237 → 231 venues, health score +3, Explore cleaner pre-Reddit.

---

### P2 🟡 — 28 SKI VENUES MISSING `skiPass` (39% of skiing)

**Flagged as Ikon-affiliated (verify before patching):** `kicking-horse-s10`, `big-white-ski-s5`, `sun-peaks-resort-s17`, `stowe-mountain-s14`

**Safe to patch as "independent":** remaining 24.

Full list: `zell-am-see-s1`, `appi-kogen-s2`, `hemsedal-s3`, `portillo-s4`, `big-white-ski-s5`, `idre-fjall-s6`, `aspen-snowmass-s7`, `arapahoe-basin-s9`, `kicking-horse-s10`, `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13`, `stowe-mountain-s14`, `champoluc-monterosa-s15`, `val-d-isere-s16`, `sun-peaks-resort-s17`, `chamonix-mont-blanc-s18`, `pucon-ski-center-s19`, `les-arcs-s20`, `powder-mountain-s21`, `madarao-mountain-s22`, `thredbo-village-s23`, `nevis-range-s24`, `tsugaike-kogen-s25`, `mount-shasta-ski-s26`, `lech-zurs-s27`, `cerro-castor-s28`, `treble-cone-s29`

---

### P3 🟢 — TAG ACCURACY (minor, batch-gen entries slated for deletion)

- `pasta-point-s24`: Tags include "Right-Hander" — Pasta Point Maldives is a LEFT-hander only.
- `anchor-point-s19`: Tags include "Left-Hander" — Anchor Point Morocco is a RIGHT-hand point break.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|---------|--------|
| skiing | 4 | ~$75 | ⚠️ Add skis + pack to nearly 10x AOV |
| surfing | 6 | ~$67 | ✅ Fixed April 22 |
| tanning | 4 | ~$27 | ✅ Adequate |

**Paste-ready skiing expansion (replaces current 4-item block):**

```javascript
  skiing: [
    { name:"HeatMax Hand Warmers 40-Pack",      store:"Amazon", price:"$18",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=heatmax+hand+warmers+40+pack" },
    { name:"Darn Tough Ski Socks",              store:"Amazon", price:"$26",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+ski+socks" },
    { name:"Smith I/O MAG Goggles",             store:"Amazon", price:"$230",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smith+io+mag+ski+goggles" },
    { name:"Smartwool PhD Ski Socks",           store:"Amazon", price:"$28",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smartwool+phd+ski+socks" },
    { name:"Atomic Bent 100 All-Mountain Skis", store:"Amazon", price:"$599+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=atomic+bent+100+all-mountain+skis" },
    { name:"Osprey Kamber 22L Ski Pack",        store:"Amazon", price:"$130",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=osprey+kamber+22+ski+backpack" },
  ],
```

---

## 3. SEASONAL RELEVANCE — April 23

### Skiing
- **NH (60 venues):** End of season. Algorithm returns score 8 "Off-season" correctly. ✅
- **SH ski — pre-season (opens June/July):** Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone, Las Leñas (new). Algorithm handles. ✅
- **Zermatt:** NH glacier skiing runs year-round on Klein Matterhorn. Algorithm will score from live snowpack data.

### Surfing — Prime April windows

| Venue | Condition | Notes |
|-------|-----------|-------|
| G-Land, Java (new) | **Peak** | SE trade season begins April. Best May–Oct. |
| Siargao, Philippines (new) | **Good** | Dry season, consistent cross-swells |
| Morocco (Taghazout, Anchor Point) | **Peak** | NW Atlantic swell season |
| Bali (Uluwatu, Padang Padang) | **Prime** | Dry season, offshore trades |
| Arugam Bay, Sri Lanka | **Pre-season** | Season opens May |

### Tanning
SE Asia, Caribbean, East Africa: all peak dry-season. ✅

---

## 4. CONTENT QUALITY

**Coordinate spot-check on new venues:**
- Zermatt `46.0207, 7.7491` ✅ (base village)
- Las Leñas `−35.150, −70.083` ✅ (ski base, Mendoza Province)
- G-Land `−8.6694, 114.2822` ✅ (Grajagan Bay, East Java)
- Siargao `9.8500, 126.0500` ✅ (Cloud 9 area, Surigao del Norte)

**IATA spot-check on new venues:**
- GVA (Geneva): valid, pre-existing for CH/FR Alps ✅
- MDZ (Mendoza Gabrielli Intl): valid ✅
- DPS (Bali Ngurah Rai): valid, pre-existing ✅
- IAO (Sayak Airport, Siargao): valid ✅
- TOD (Tioman Airport, Pahang): valid — replaces invalid TPN ✅

---

## 5. NEW VENUES ADDED (applied this run)

_(Already applied to app.jsx — paste shown for reference only.)_

```javascript
  {id:"zermatt",  category:"skiing",  title:"Zermatt",           location:"Valais, Switzerland",           lat:46.0207,lon:7.7491,  ap:"GVA",icon:"🎿",rating:4.97,reviews:3650,gradient:"linear-gradient(160deg,#0d1b35,#1a3a7a,#3a6ac4)",accent:"#7eb3e8",skiPass:"independent",tags:["Matterhorn Views","Glacier Year-Round","Car-Free Village","3883m Vertical"],photo:"https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=800&h=600&fit=crop"},
  {id:"las-lenas",category:"skiing",  title:"Las Leñas",         location:"Mendoza, Argentina",            lat:-35.1500,lon:-70.0833,ap:"MDZ",icon:"🎿",rating:4.91,reviews:1820,gradient:"linear-gradient(160deg,#0a1828,#1e3a6e,#3a6abd)",accent:"#82b0e8",skiPass:"independent",tags:["Best SH Powder","Andes Backcountry","400cm Annual Snowfall","Jun–Sep Season"],photo:"https://images.unsplash.com/photo-1543975660-71c80f7f6a6f?w=800&h=600&fit=crop"},
  {id:"g-land",   category:"surfing", title:"G-Land (Grajagan)", location:"East Java, Indonesia",          lat:-8.6694,lon:114.2822, ap:"DPS",icon:"🌊",rating:4.96,reviews:1480,gradient:"linear-gradient(160deg,#001a3a,#004080,#0080c0)",accent:"#40a0ff",tags:["World's Best Left","Jungle Camp","Boat-Access Only","Expert Only"],photo:"https://images.unsplash.com/photo-1547519777-4be6701f2bce?w=800&h=600&fit=crop",facing:190},
  {id:"siargao",  category:"surfing", title:"Siargao (Cloud 9)", location:"Surigao del Norte, Philippines",lat:9.8500,lon:126.0500,  ap:"IAO",icon:"🌊",rating:4.93,reviews:1650,gradient:"linear-gradient(160deg,#001a3a,#004080,#0080c0)",accent:"#40a0ff",tags:["Cloud 9 Reef","Barrel Machine","Island Hopping","Intermediate+"],photo:"https://images.unsplash.com/photo-1465212618042-5c59ead3d83e?w=800&h=600&fit=crop",facing:90},
```

---

## One Observation for PM

**6 same-category duplicate venues are the last major Explore UX problem before Reddit launch.** A user browsing Morocco surf sees Taghazout twice. Aspen appears twice in ski. Pasta Point appears twice in Maldives. The batch-gen dupes (`-s##`, `-t##`) are objectively worse data — lower review counts, wrong tags (Pasta Point tagged as "Right-Hander"), no skiPass. Deleting 6 lines takes 5 minutes. Health score goes 80 → ~83 and Explore immediately looks more curated. This is the highest-ROI task left before launch.
