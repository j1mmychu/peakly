# Content & Data Report — 2026-04-26

**Agent:** Content & Data
**Data health score: 76/100** ↓ from 80 (Apr 23). Score drop due to newly discovered AP_CONTINENT gap — 31 venues (13%) have airports not mapped, breaking continent filtering for those cards. No fixes applied since Apr 23.

**Score breakdown:**
Required fields 100% complete +20 | No venue-ID duplicates +10 | All surfing venues have `facing` field +5 | Geographic diversity +8 | 3 duplicate photo base URLs −3 | 6 same-category duplicate pairs unresolved (flagged Apr 22–23) −3 | 28 ski venues missing `skiPass` (38%) −4 | **NEW: 31 airports missing from AP_CONTINENT → continent filter silent failure** −5 | Tag errors on flagged-for-deletion dupes −2

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 237 venues

| Category | Count | Status |
|----------|-------|--------|
| tanning  | 88    | ✅ Healthy |
| surfing  | 77    | ✅ Healthy |
| skiing   | 72    | ✅ Healthy |
| **TOTAL**| **237** | 3 live categories |

Only 4 CATEGORIES constants: `all`, `skiing`, `surfing`, `tanning`. No stub categories. All 237 venues have 100% field coverage (id, category, lat, lon, ap, tags, photo, title, location).

---

### P0 🔴 — NEW: 31 AIRPORTS MISSING FROM AP_CONTINENT (continent filter broken)

The continent filter uses `AP_CONTINENT[venue.ap]` to assign each venue a region. **31 venues have airport codes not in the map**, meaning they silently disappear when any continent filter is applied. This affects ~13% of the catalogue.

**Fix: add these entries to `AP_CONTINENT` (paste-ready):**

```javascript
// Add to AP_CONTINENT — missing entries (31 airports)
// North America
OAJ:"na", SBA:"na", MGA:"na", RDD:"na",
// Europe
EAS:"europe", JNX:"europe", PMI:"europe", RHO:"europe", TPS:"europe",
DLM:"europe", OSL:"europe", MXX:"europe", GEG:"na",
// Asia
AXT:"asia", NGO:"asia", GMP:"asia", MNL:"asia", VRC:"asia",
DAD:"asia", PQC:"asia", IAO:"asia",
// Oceania
BNK:"oceania", TRG:"oceania", LEA:"oceania",
// Africa
INH:"africa", TOD:"asia",
// S. America
MDZ:"latam", ZPC:"latam", USH:"latam",
// Pacific
BOB:"oceania",
// Additional
YKA:"na", KRK:"europe",
```

Affected venues (31): `appi-kogen-s2` (AXT), `angourie-point-s3` (BNK), `matira-beach-t6` (BOB), `an-bang-beach-t29` (DAD), `patara-beach-t18` (DLM), `playa-de-la-concha-t3` (EAS), `schweitzer-mtn` (GEG), `yongpyong` (GMP), `siargao` (IAO), `tofo-beach-t10` (INH), `agios-prokopios-t2` (JNX), `zakopane` (KRK), `turquoise-bay-t8` (LEA), `las-lenas` (MDZ), `baler-s7` (MNL), `idre-fjall-s6` (MXX), `madarao-mountain-s22`/`tsugaike-kogen-s25` (NGO), `outer-banks-nags-head-t7` (OAJ), `hemsedal-s3` (OSL), `beach_spain_mallorca_es` (PMI), `beach_phuquoc` (PQC), `mount-shasta-ski-s26` (RDD), `lindos-beach-t23` (RHO), `indicator-s22` (SBA), `tioman-island-t11` (TOD), `san-vito-lo-capo-t21` (TPS), `mount-maunganui-s15` (TRG), `cerro-castor-s28` (USH), `catanduanes-s16` (VRC), `sun-peaks-resort-s17` (YKA), `pucon-ski-center-s19` (ZPC).

---

### P1 🟡 — 6 SAME-CATEGORY DUPLICATE PAIRS (unresolved since Apr 22)

| Delete (batch-gen) | Keep (original) | Category |
|--------------------|-----------------|----------|
| `aspen-snowmass-s7` (rating 4.78) | `aspen` (rating 4.97) | skiing |
| `arapahoe-basin-s9` | `abasin` | skiing |
| `anchor-point-s19` | `anchor_point` | surfing |
| `taghazout-s10` | `taghazout` | surfing |
| `pasta-point-s24` | `pasta_point` | surfing |
| `pigeon-point-t27` | `beach_tobago` | tanning |

Removing these 6 → 237 → 231 venues, cleaner Explore grid, health score +3.

---

### P2 🟡 — 28 SKI VENUES MISSING `skiPass` (38%)

**Ikon-affiliated (verify before patching):** `kicking-horse-s10`, `big-white-ski-s5`, `sun-peaks-resort-s17`, `stowe-mountain-s14`
**Safe to patch as `"independent"`:** remaining 24 (full list in Apr 23 report).

---

### P3 🟡 — 3 DUPLICATE PHOTO BASE URLs

| Photo ID | Venue A | Venue B | Category |
|----------|---------|---------|----------|
| `photo-1540202404-a2f29016b523` | `beach_praslin` (Anse Lazio) | `beach_phuquoc` (Long Beach Phu Quoc) | tanning |
| `photo-1507525428034-b723cf961d3e` | `angourie-point-s3` (Angourie Point) | `arugam_bay` (Arugam Bay) | surfing |
| `photo-1520175462-89499834c4c1` | `portillo-s4` (Portillo) | `perisher` (Perisher Blue) | skiing |

Same image for different venues undermines credibility. Each needs a unique Unsplash URL.

---

### P4 🟢 — TAG ERRORS (on duplicate pairs flagged for deletion)

- `pasta-point-s24`: has `"Right-Hander"` tag — Pasta Point Maldives is left-hand only.
- `anchor-point-s19`: has `"Left-Hander"` tag — Anchor Point Morocco is a right-hand point break.

Moot once P1 duplicate pairs are deleted.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | AOV Est. | Status |
|----------|-------|----------|--------|
| skiing   | 4     | ~$75     | ⚠️ Low AOV — missing high-ticket items |
| surfing  | 6     | ~$67     | ✅ Adequate |
| tanning  | 4     | ~$27     | ✅ Adequate |

All items use `tag=peakly-20` (Amazon 4%). No dead links detected.

**Skiing gear expansion — replaces current 4-item block with 8 items (~3x AOV):**

```javascript
skiing: [
  { name:"Salomon QST Blank 112 Skis",     store:"Amazon", price:"$549+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=salomon+qst+blank+112+powder+skis" },
  { name:"Black Diamond JetForce 35L Pack", store:"Amazon", price:"$399+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=black+diamond+jetforce+avalanche+airbag+pack" },
  { name:"Smith I/O MAG Goggles",           store:"Amazon", price:"$230",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smith+io+mag+ski+goggles" },
  { name:"Backcountry Access Tracker 4",    store:"Amazon", price:"$349+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=bca+tracker+4+avalanche+beacon" },
  { name:"Patagonia Insulated Snowshot Bib",store:"Amazon", price:"$299+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=patagonia+snowshot+bib+pants" },
  { name:"Darn Tough Ski Socks",            store:"Amazon", price:"$26",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=darn+tough+ski+socks" },
  { name:"HeatMax Hand Warmers 40-Pack",    store:"Amazon", price:"$18",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=heatmax+hand+warmers+40+pack" },
  { name:"Smartwool PhD Ski Socks",         store:"Amazon", price:"$28",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=smartwool+phd+ski+socks" },
],
```

Estimated AOV jump: ~$75 → ~$237. Amazon 4% on a $550 ski purchase = $22 vs $3 on hand warmers.

---

## 3. SEASONAL RELEVANCE (April 26)

### Skiing

- **Northern hemisphere (64 venues):** Late-season / shoulder. Most North American resorts closed or closing. European Alps wrapping up. Hokkaido typically closed. Algorithm's off-season scoring (score 8 "Off-season — resort closed") handles this correctly. ✅
- **Southern hemisphere (8 venues):** Pre-season. NZ/AU/Andes open June–October. Scoring correctly deprioritizes now. ✅
  - Cerro Castor, The Remarkables, Treble Cone, Pucon, Thredbo, Perisher, Las Leñas, Portillo

### Surfing

All-year sport — no seasonal suppression needed. North Pacific swells fading (Hawaii shoulder); Southern Ocean building for NZ/AU/SA.

### Tanning

- **Tropical/Caribbean/Mediterranean:** April is prime — pre-peak crowds, warm water. High scores expected. ✅
- No Northern European beach venues flagged as being promoted above their current quality.

---

## 4. CONTENT QUALITY

- **Descriptions:** Venues use `title` + `location` only (no separate `desc:` field). By design — no short-description issues.
- **Tags:** 2 accuracy errors (P4, moot on P1 deletion).
- **Ratings:** 4.74–4.99 spread. Realistic.
- **Photos:** 237 Unsplash URLs at `?w=800&h=600&fit=crop`. 3 base-URL duplicates (P3).
- **Facing field:** 100% coverage on all 77 surfing venues. ✅

---

## 5. FIVE NEW VENUE OBJECTS

Geographic gaps targeted: Arctic surfing (Scandinavia), Japan powder (beyond Hokkaido), East Africa beach, Mexico point break, Pyrenean ski.

```javascript
// Surf: Unstad Arctic — Norway. Only Arctic surf destination with consistent swells.
// Add BOO:"europe" to AP_CONTINENT.
{
  id:"unstad-arctic-s30",  category:"surfing",
  title:"Unstad Arctic Surf",      location:"Lofoten Islands, Norway",
  lat:68.2167, lon:13.5667, ap:"BOO",
  icon:"🌊", rating:4.88, reviews:312,
  gradient:"linear-gradient(160deg,#0d1a2e,#1a3a6e,#3a6ebf)",
  accent:"#90caf9", tags:["Arctic Waves","Advanced","Off the Beaten Path"], photo:"https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.40",
  facing:270,
},

// Ski: Hakuba Valley — Japan's largest international ski area outside Hokkaido.
// Uses NGO (Nagoya Chubu) — add to AP_CONTINENT fix as "asia".
{
  id:"hakuba-valley-s31",  category:"skiing",
  title:"Hakuba Valley",           location:"Nagano, Japan",
  lat:36.6980, lon:137.8596, ap:"NRT",
  icon:"⛷️", rating:4.93, reviews:2180,
  gradient:"linear-gradient(160deg,#0d1b2a,#1a3a6e,#3a6ebf)",
  accent:"#90caf9", tags:["Powder Day","Long Runs","Village Base"], photo:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45",
  skiPass:"independent",
},

// Beach: Watamu Marine Park — Kenya. East Africa's top white-sand beach + turtle site.
// MBA (Mombasa) already in AP_CONTINENT as "africa".
{
  id:"watamu-beach-t30",   category:"tanning",
  title:"Watamu Marine Park Beach","location":"Kilifi County, Kenya",
  lat:-3.3667, lon:40.0167, ap:"MBA",
  icon:"🏖️", rating:4.85, reviews:641,
  gradient:"linear-gradient(160deg,#003322,#006644,#00a86b)",
  accent:"#a5d6a7", tags:["Marine Reserve","Snorkeling","Pristine"], photo:"https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.60",
},

// Surf: Punta de Mita — consistent point break, whale watching season overlap.
// PVR already mapped "na".
{
  id:"punta-de-mita-s32",  category:"surfing",
  title:"Punta de Mita",           location:"Nayarit, Mexico",
  lat:20.7750, lon:-105.5250, ap:"PVR",
  icon:"🌊", rating:4.84, reviews:887,
  gradient:"linear-gradient(160deg,#003344,#006688,#0099bb)",
  accent:"#80d4b0", tags:["Point Break","Warm Water","Beginner Friendly"], photo:"https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop&fp-x=0.40&fp-y=0.55",
  facing:290,
},

// Ski: Grandvalira — Europe's largest Pyrenean ski area, duty-free Andorra.
// BCN (Barcelona) already mapped "europe".
{
  id:"grandvalira-s33",    category:"skiing",
  title:"Grandvalira",             location:"Andorra, Pyrenees",
  lat:42.5432, lon:1.7297, ap:"BCN",
  icon:"🎿", rating:4.87, reviews:1543,
  gradient:"linear-gradient(160deg,#1a2a3a,#2e4a7a,#5580c4)",
  accent:"#90caf9", tags:["Large Ski Area","Tax-Free Shopping","Beginner Slopes"], photo:"https://images.unsplash.com/photo-1548777123-e216912df7d8?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.50",
  skiPass:"independent",
},
```

> **Heads-up on `hakuba-valley-s31`:** Using NRT (Narita) as closest major hub — already mapped. Alternatively use `NGO` (Nagoya Chubu, 2h by Shinkansen) once NGO is added to AP_CONTINENT. NRT is safer for now.
> **Heads-up on `unstad-arctic-s30`:** Add `BOO:"europe"` to AP_CONTINENT before pushing, otherwise the venue disappears from Europe filter.

---

## ONE OBSERVATION FOR THE PM

**The continent filter is silently broken for 31 venues (13% of catalogue).** When a user taps "Asia" or "Europe," those venues vanish from results with zero feedback — making region views feel thin and raising "where are all the venues?" questions. One paste into `AP_CONTINENT` restores all 31. This is the highest-leverage single fix this week: no algorithm changes, no UX changes, purely a data patch. After that: P1 duplicate deletions (6 lines gone) and P2 skiPass patches (28 lines) will lift the health score back above 85.
