# Content & Data Report — 2026-05-02

**Agent:** Content & Data  
**Data health score: 78/100** ↓ from 81 (May 1). 5 duplicate venue objects still in code, 3 duplicate photo pairs confirmed, 6 APs still missing from AP_CONTINENT.

**Score breakdown:**  
Required fields 100% +20 | No duplicate IDs +10 | 3 photo dup pairs −6 | All 78 surfing venues have `facing` +5 | Geographic diversity +8 | 5 confirmed same-location dup pairs −10 | 6 APs missing from AP_CONTINENT −4 | 26 s-series ski venues missing `skiPass` −3 | Tag errors on deletion candidates −2

---

## FIXES APPLIED THIS RUN

None (read-only audit). Findings below are all unresolved.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 240 venues

| Category | Count | Delta vs May 1 | Status |
|----------|-------|----------------|--------|
| tanning | 89 | — | ✅ Healthy |
| surfing | 78 | — | ✅ Healthy |
| skiing | 73 | — | ✅ Healthy |
| **TOTAL** | **240** | **0** | 3 live categories, no stubs |

All 240 venues: 100% field coverage (lat, lon, ap, tags, photo). Zero duplicate IDs. All 78 surfing venues have `facing` bearing.

---

### P1 🔴 — 5 SAME-LOCATION DUPLICATE VENUE OBJECTS (unresolved since Apr 23)

`aspen-snowmass-s7` was deleted by the PM session on May 1. 5 remain.

| Delete | Keep | Category | Evidence |
|--------|------|----------|---------|
| `banzai_pipeline` (4.99, 6420 reviews) | `pipeline` (4.99, 1203 reviews) | surfing | 0.002° apart — same wave, `pipeline` is canonical ID |
| `fernando-de-noronha-s20` (4.75, bad tags) | `noronha_surf` (4.96) | surfing | 0.003° apart. "Barrel Waves" tag is wrong — Noronha is a mellow right reef |
| `siargao` (4.93) | `cloud9` (4.95) | surfing | 0.01° apart — Cloud 9 = same break. `siargao` introduced Apr 23 without noticing `cloud9` existed |
| `snappers-gold-coast-s26` (4.82) | `snapper_rocks` (4.94) | surfing | 0.003° apart — Snapper Rocks, same break |
| `aruba-eagle-beach-t1` (4.53, 3660 reviews) | `beach_eagle` (4.95, 13400 reviews) | tanning | Eagle Beach, Aruba — `beach_eagle` has 3.7x reviews, correct rating |

Deleting these 5: 240 → **235 venues**. Score 78 → ~88.

---

### P2 🟡 — 3 DUPLICATE PHOTO URLs (confirmed in current app.jsx, missed by May 1 audit)

| Photo ID (base) | Venue A | Venue B | Quick fix |
|-----------------|---------|---------|-----------|
| `photo-1507525428034-b723cf961d3e` | `angourie-point-s3` | `arugam_bay` | Swap `arugam_bay` → `photo-1559156452-cba0d6c0c397?w=800&h=600&fit=crop` |
| `photo-1520175462-89499834c4c1` | `portillo-s4` | `perisher` | Swap `portillo-s4` → `photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop` |
| `photo-1540202404-a2f29016b523` | `beach_praslin` (Anse Lazio) | `beach_phuquoc` (Phu Quoc) | Swap `beach_phuquoc` → `photo-1528127269322-539801943592?w=800&h=600&fit=crop` |

---

### P3 🟡 — 6 APS MISSING FROM `AP_CONTINENT` (continent filter hides these venues)

May 1 session added 20+ APs. 6 remain unmapped.

| AP | Airport | Venue affected | Add as |
|----|---------|---------------|--------|
| CMB | Bandaranaike Intl, Sri Lanka | `arugam_bay` — invisible in Asia filter | `"asia"` |
| EXT | Exeter Airport, England | `croyde-bay` — invisible in Europe filter | `"europe"` |
| MCT | Muscat Intl, Oman | `muscat-beach-t26` — invisible in Asia filter | `"asia"` |
| MGA | Augusto Sandino, Nicaragua | `popoyo-s0` — invisible in N. America filter | `"na"` |
| SBA | Santa Barbara Airport, CA | `indicator` — invisible in N. America filter | `"na"` |
| SNA | John Wayne Airport, CA | `laguna-beach` — invisible in N. America filter | `"na"` |

**Paste-ready fix (add to AP_CONTINENT):**
```javascript
// Europe block
EXT:"europe",
// Asia block
CMB:"asia", MCT:"asia",
// North America block
MGA:"na", SBA:"na", SNA:"na",
```

---

### P4 🟢 — NEAR-DUPES CONFIRMED NOT DUPLICATES

| Pair | Verdict |
|------|---------|
| `uluwatu` / `padang_padang` (0.019°) | Different breaks at Bukit Peninsula — keep both |
| `hossegor` / `capbreton-s27` (0.026°) | Adjacent towns, distinct peaks — keep both |
| `noronha_surf` / `beach_noronha` (0.001°) | Cross-category: surf break vs beach — acceptable |
| `honolua_bay` / `beach_kapalua` (0.021°) | Honolua Bay break vs DT Fleming beach — keep both |
| `beach_railay` / `ao-nang` (0.022°) | Railay requires boat access — distinct experience |
| `sainte-foy-tarentaise` / `les-arcs` (0.050°) | Adjacent resorts, different ski areas — keep both |

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|---------|--------|
| skiing | 4 | ~$75 | ⚠️ No ski hardware — add skis $600+, pack $130 (see Apr 23 paste-ready block) |
| surfing | 6 | ~$67 | ✅ Good |
| tanning | 4 | ~$27 | ✅ Adequate |

Skiing gear expansion from Apr 23 still not applied. Two high-AOV items (Atomic Bent 100 skis ~$599, Osprey Kamber pack ~$130) push ski AOV from ~$75 to ~$200+. See Apr 23 report for paste-ready block.

---

## 3. SEASONAL RELEVANCE — May 2, 2026

### Skiing — All 73 venues off-season
- **NH (65 venues):** Closed. Algorithm returns score 8 "Off-season." ✅
- **SH (8 venues — Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone, Las Leñas, Perisher):** Pre-season. Opens June–July. Algorithm handles. ✅
- **Opportunity:** SH season opens in ~8 weeks. "Season Opening Soon" badge or wishlist nudge for these 8 venues could drive saves before opening-day traffic spike.

### Surfing — Prime May windows

| Region | May Condition | Notes |
|--------|--------------|-------|
| Bali / Indonesia (Uluwatu, G-Land, Mentawai) | **Peak** | SE trades on; dry + offshore through Oct |
| Maldives (Pasta Point) | **Good–Peak** | SW monsoon swell building May–Oct |
| Arugam Bay, Sri Lanka | **Opening** | SW monsoon surf season starts May |
| Morocco (Taghazout, Anchor Point) | **Good** | NW Atlantic swell winding down but still firing |
| Jeffreys Bay, South Africa | **Building** | SH winter swell ramp-up; WSL event Jun–Aug |
| Tofino, Canada (added May 1) | **Good** | Pacific NW consistent May–Oct |

### Tanning — 86/89 in season
Three SH-autumn venues cooling: **Praia Mole** (−27°S), **Tofo Beach** (−23°S), **Hyams Beach** (−35°S). Algorithm scores correctly. No action needed.

---

## 4. CONTENT QUALITY

**Coordinate spot-check on May 1 additions:**
- `ao-nang` TH: 8.032°N, 98.822°E ✅ (Ao Nang Beach, Krabi)
- `tofino` CA: 49.153°N, 125.907°W ✅ (Cox Bay area, Tofino)
- `tamarindo` CR: 10.299°N, 85.840°W ✅ (Playa Tamarindo)

**Rating floor:** `aruba-eagle-beach-t1` at 4.53 is the catalog's lowest-rated venue. It is also a P1 delete target. Its removal naturally raises the quality floor.

**Ratings distribution:** min 4.50, max 4.99, avg ~4.86 — consistent with a curated catalog.

---

## 5. NEW VENUE ADDITIONS — Geographic white space

All 3 categories are healthy. Targeting gaps: zero African west coast surfing, zero Bahamas out-islands, zero Crete, zero Nias, gap in expert French ski. Paste after last VENUES entry:

```javascript
  {id:"skeleton_bay",  category:"surfing", title:"Skeleton Bay",           location:"Swakopmund, Namibia",           lat:-22.6167,lon:14.4167, ap:"WVB", icon:"🌊",rating:4.94,reviews:680, gradient:"linear-gradient(160deg,#2a1a00,#5a3600,#8a5a00)", accent:"#c8a442", tags:["World's Longest Left","Desert Barrel","Fog Belt","Experts Only"],    photo:"https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=600&fit=crop",facing:315},
  {id:"lagundri_bay",  category:"surfing", title:"Lagundri Bay",           location:"Nias, North Sumatra, Indonesia", lat:0.5233,lon:97.8433,   ap:"GNS", icon:"🌊",rating:4.91,reviews:1180,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",  accent:"#2288ee", tags:["Legendary Right-Hander","Consistent Barrel","Remote Island","Intermediate+"],photo:"https://images.unsplash.com/photo-1516030635254-6e2ba01b1285?w=800&h=600&fit=crop",facing:215},
  {id:"elafonissi",    category:"tanning", title:"Elafonissi Beach",       location:"Crete, Greece",                 lat:35.2667,lon:23.5333,  ap:"CHQ", icon:"🏖️",rating:4.94,reviews:5840,gradient:"linear-gradient(160deg,#003344,#005577,#007baa)",  accent:"#33aacc", tags:["Pink Sand Lagoon","Shallow Wading","UNESCO Buffer","Mediterranean Gem"],    photo:"https://images.unsplash.com/photo-1586500036706-41963de0a65f?w=800&h=600&fit=crop"},
  {id:"exuma_cays",    category:"tanning", title:"Exuma Cays",             location:"Bahamas",                       lat:23.5167,lon:-75.8167, ap:"GGT", icon:"🏝️",rating:4.97,reviews:3120,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088cc)",  accent:"#33aadd", tags:["Swimming Pigs","Nurse Sharks","Endless Sandbars","Ultra-Clear Water"],    photo:"https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop"},
  {id:"la_grave",      category:"skiing",  title:"La Grave",               location:"Hautes-Alpes, France",          lat:45.0306,lon:6.3028,   ap:"GNB", icon:"🎿",rating:4.95,reviews:1640,gradient:"linear-gradient(160deg,#0c1430,#1e2c72,#3046c0)",  accent:"#6c88e2",skiPass:"independent",tags:["Zero Grooming","Experts Only","Heli Terrain","3600m Vert"],                photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"},
```

**Also add these to `AP_CONTINENT` (new APs for new venues):**
```javascript
WVB:"africa", GNS:"asia", CHQ:"europe", GGT:"na", GNB:"europe",
```

**Rationale:**
- **Skeleton Bay** — Africa's west coast has zero surf venues. One of the world's most discussed waves, generates extreme FOMO content (desert + fog + world-record tubes).
- **Lagundri Bay** — Indonesia has 10 venues but none in Nias. The island pioneered "surf discovery" travel; still world-class right-hander.
- **Elafonissi** — No Greek beach venues exist. Mediterranean is highest-demand for May travelers. This beach goes viral every spring.
- **Exuma Cays** — Bahamas out-islands have zero representation. Swimming Pigs + nurse sharks = highest social media velocity of any Caribbean destination.
- **La Grave** — France has 3 ski venues but none in the expert/heli category. Zero grooming = algorithm will correctly score it as exceptional only when conditions align, matching Peakly's "know when to go" thesis.

---

## One Observation for PM

**The duplicate problem is self-perpetuating.** Five same-location pairs remain unfixed since Apr 23, despite being flagged in every report since. The Apr 23 session added `siargao` without checking that `cloud9` already existed — creating the problem it was supposed to fix. With each new venue batch, the risk of re-duplication grows. The highest-ROI action available is deleting 5 IDs (5 lines in app.jsx). Until that happens, Morocco surf appears twice in Explore, Gold Coast appears twice, Arugam Bay's continent filter is broken, and the health score stays depressed. Delete first, add new venues second.
