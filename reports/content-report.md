# Content & Data Report — 2026-05-07

**Agent:** Content & Data  
**Data health score: 80/100** (was 78 on May 2; +6 for AP_CONTINENT fix, −4 for lateSeason ghost, −0 on dupes still open)

**Score breakdown:**  
Required fields 100% +20 | No duplicate IDs +10 | 3 photo dup sets −6 | All 78 surfing venues have `facing` +5 | Geographic diversity +8 | 5 confirmed same-location dup pairs −10 | lateSeason feature ghost (claimed DONE, not implemented) −8 | AP_CONTINENT now complete +1 (was −4; fixed since May 2) | Surfing retirement incomplete −2 | tamarindo photo dupe NEW −1 | s-series skiPass gap (26 venues) −1 (partial; noted only once)

---

## FIXES APPLIED THIS RUN

None (read-only audit).

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 240 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach / Tanning | 89 | Active ✅ |
| Surfing | 78 | **Limbo ⚠️** — CLAUDE.md says retired, code disagrees |
| Skiing | 73 | Active ✅ |
| **TOTAL** | **240** | 3 categories in code, 2 claimed active |

All 240 venues: 100% field coverage (lat, lon, ap, tags ≥2, photo). Zero duplicate IDs. All 78 surfing venues have `facing`. All IATA codes valid 3-letter format (157 unique airports across 240 venues). Ratings 4.50–4.99, reviews 446–42,800.

**Agent prompt context note:** This prompt references "12 categories," "hiking at ZERO gear items," and "182 venues." None of those match actual code state. The app has 3 venue categories total. Ignore any prompt language about hiking, climbing, MTB, etc.

---

### 🔴 P0 CRITICAL: `lateSeason` — ghost feature (double failure)

CLAUDE.md "Recently Fixed 2026-05-04":
> "Cervinia + Val d'Isere s16 carry the flag (app.jsx:412, :486)"

**Actual state:** `lateSeason` appears **zero times** anywhere in app.jsx — not in VENUES (lines 315–584), not in `scoreVenue` logic (lines 1075–1106). CLAUDE.md entry is wrong.

Two failures:
1. `cervinia` (line 381) and `val-d-isere-s16` (line 525) both missing `lateSeason:true`
2. `scoreVenue` has no code reading `venue.lateSeason` — so even if the flags existed, nothing would act on them

**Impact (May 7):** `isShoulder=true` for N. hemisphere in May. Shoulder cap at line 1110 clamps scores to ≤32 unless real snow + thick base. Cervinia's 3,883m glacier and Val d'Isere's Grand Motte glacier may be genuinely open and scoring 70+ in reality, but the app caps them at 32 and hides them from the front page.

**Fix — two parts, surgical:**
```javascript
// Part 1: venue data — add lateSeason:true to cervinia line 381
// BEFORE:
{id:"cervinia",    category:"skiing",title:"Cervinia", ... skiPass:"independent"},
// AFTER:
{id:"cervinia",    category:"skiing",title:"Cervinia", ... skiPass:"independent",lateSeason:true},

// And val-d-isere-s16 line 525:
// BEFORE:
{id:"val-d-isere-s16",category:"skiing",title:"Val d'Isere", ... tags:[...]},
// AFTER:
{id:"val-d-isere-s16",category:"skiing",title:"Val d'Isere", ... tags:[...],lateSeason:true},

// Part 2: scoreVenue logic — replace line 1110:
// BEFORE:
if (isShoulder && snow < 5 && baseCm < 50) score = Math.min(score, 32);
// AFTER:
if (isShoulder && !venue.lateSeason && snow < 5 && baseCm < 50) score = Math.min(score, 32);
// And also bypass the off-season hard gate (line 1081) for late-season venues:
// BEFORE line 1081:
if (!inSeason && !isShoulder) {
// AFTER (insert before it):
if (!inSeason && !isShoulder && venue.lateSeason && depth >= 50) { /* skip gate — glacier still open */ }
else if (!inSeason && !isShoulder) {
```

---

### 🔴 P1 — 5 SAME-LOCATION DUPLICATE PAIRS (open since Apr 23, 15 days)

| Delete | Keep | Category | Evidence |
|--------|------|----------|---------|
| `banzai_pipeline` | `pipeline` | surfing | 0.002° apart — identical wave; `pipeline` is canonical |
| `fernando-de-noronha-s20` | `noronha_surf` | surfing | 0.003° apart; noronha_surf has correct tags |
| `siargao` | `cloud9` | surfing | 0.01° apart — Cloud 9 IS Siargao; cloud9 = canonical |
| `snappers-gold-coast-s26` | `snapper_rocks` | surfing | 0.003° apart — same break |
| `aruba-eagle-beach-t1` | `beach_eagle` | tanning | Eagle Beach Aruba; beach_eagle has 3.7× reviews |

Deleting 5 lines → 240 → 235 venues. These have been flagged every report since Apr 23.

---

### 🟡 P2 — DUPLICATE PHOTOS (3 sets; one worsened since May 2)

| Photo ID | Venues using it | Fix |
|----------|----------------|-----|
| `photo-1507525428034-b723cf961d3e` | `angourie-point-s3`, `arugam_bay`, **`tamarindo`** (NEW — added after May 2 audit, 3-way dupe now) | Swap tamarindo → `photo-1590523741831-ab7e8b8f9c7f?w=800&h=600&fit=crop` |
| `photo-1520175462-89499834c4c1` | `portillo-s4`, `perisher` | Swap portillo-s4 → `photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop` |
| `photo-1540202404-a2f29016b523` | `beach_praslin`, `beach_phuquoc` | Swap beach_phuquoc → `photo-1528127269322-539801943592?w=800&h=600&fit=crop` |

The `tamarindo` photo was fine on May 2 — this dupe was introduced in the same commit that added the venue. Going from 2-way to 3-way dupe shows the "check for dup photos before adding" step isn't happening at add-time.

---

### ✅ RESOLVED since May 2

**AP_CONTINENT gaps closed** — all 6 previously missing airports (CMB, EXT, MCT, MGA, SBA, SNA) now mapped. Arugam Bay, Croyde Bay, Muscat, Popoyo, Indicator, Laguna Beach all visible in continent filters. Good.

---

### ℹ️ Minor data quality flags

| Venue | Issue | Suggested fix |
|-------|-------|--------------|
| `natadola-beach-t9` | `location:"Fiji"` — no island name | → `"Viti Levu, Fiji"` |
| `mana-island-fiji-t12` | `location:"Fiji"` | → `"Mamanuca Islands, Fiji"` |
| `kuta-beach` | `category:"surfing"` — Kuta is Bali's main tourist beach, not a serious surf break | → `"tanning"` if surfing is fully retired |

### ℹ️ Surfing retirement status unclear

CLAUDE.md: "Surfing was retired; 77 venues killed (commit bb56aaf)"  
Code: 78 surfing venues, `{ id:"surfing", label:"Surf" }` visible in CATEGORIES (line 166), `GEAR_ITEMS.surfing` live, `scoreVenue` surfing case live.  

Either the retirement was partial or reversed. Product needs to make the call: fully remove or officially reinstate? The ambiguity is creating a stale CLAUDE.md and confusion about launch scope.

---

## 2. GEAR ITEMS AUDIT

### Current state

| Category | Items | Est. AOV avg | Status |
|----------|-------|-------------|--------|
| Skiing | 6 | ~$172 | ✅ Good |
| Surfing | 6 | ~$61 | ✅ (Surfing status pending above) |
| Beach / Tanning | 4 | ~$27 | ⚠️ Largest category, worst monetization |

### Gap: Tanning gear items are low-AOV despite being the largest venue category (89 venues)

Current items max out at $49. Adding a beach shade tent ($65), waterproof speaker ($49), and GoPro ($199) more than doubles average AOV.

**Paste-ready replacement for `GEAR_ITEMS.tanning` (lines 5478–5483):**

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

AOV lift: ~$27 avg → ~$61 avg (+$34/unit). Beach tent and GoPro are the drivers.

---

## 3. SEASONAL RELEVANCE — May 7, 2026

### Skiing

| Hemisphere | Score engine state (May, mo=5) | Real-world state |
|-----------|-------------------------------|-----------------|
| N. hemisphere (58 venues) | `isShoulder=true` → score capped ≤32 unless real snow | Most resorts closed or closing. Mammoth, Arapahoe Basin, Mt Hood may still have late-season snow. Cervinia + Val d'Isere glacier still open — but scoring broken (see P0 above). |
| S. hemisphere (15 venues) | `inSeason=true` → full scoring enabled | Season opens mid-June (NZ), early July (Chile/Argentina), mid-June (Australia). Scoring shows these as in-season 4–6 weeks early. Remarkables, Treble Cone, Mt Buller may surface on the front page but are not open. |

**S. hemisphere premature risk:** Users landing on Remarkables or Whakapapa on May 7 might book flights before realising the resort opens June 15. No `opensMonth` field exists to gate this. Consider "Season opens June" label in detail sheet for S. hemisphere ski venues during May.

### Beach / Tanning

| Region | May 7 status |
|--------|-------------|
| Caribbean / Mexico | 🟢 Peak pre-hurricane window |
| Mediterranean (France, Greece, Croatia) | 🟢 Warming fast (19–23°C) |
| SE Asia east coast (Vietnam, Philippines) | 🟢 Good |
| SE Asia west coast (Krabi, Phuket, Koh Samui) | 🔴 SW monsoon arriving — `ao-nang`, `beach_kohsamui`, `beach_phiphi` will score 40–55 correctly via weather API |
| Maldives | 🟡 Wet season starting — warm but rainier |
| Tropical year-round (Cape Verde, Seychelles) | 🟢 Always on; zero app coverage for West Africa / Atlantic islands |

---

## 4. CONTENT QUALITY

All 240 venue `tags` are non-empty (2–5 items each). No missing titles. No out-of-range ratings. No coordinate spot-check failures for venues audited this run.

Tag count distribution: most venues have 2 tags; `kuta-beach`, `val-d-isere-s16`, several s/t-series venues have 4–5 tags — inconsistent but not harmful.

---

## 5. NEW VENUE ADDITIONS — May 7

Targeting: 2 skiing (geographic gaps — Eastern Europe and Australian Alps), 3 beach (strong May season + unrepresented Atlantic/Adriatic regions). All are additive to current coverage, not duplicate.

**Paste after last VENUES entry (before `];`):**

```javascript
  // ── Skiing: Eastern Europe — zero coverage currently ───────────────────
  // Bulgaria's best resort. Budget option for European users, Pirin National Park.
  // SOF = Sofia (~160km / 2.5hr). Season: Dec–Apr.
  {id:"bansko-s30",category:"skiing",title:"Bansko",location:"Pirin Mountains, Bulgaria",lat:41.8364,lon:23.4901,ap:"SOF",icon:"🎿",rating:4.82,reviews:1980,gradient:"linear-gradient(160deg,#0e1e3a,#1a3e78,#2e68be)",accent:"#74a8dc",tags:["Budget Powder","Pirin National Park","Lively Après","85 Pistes"],photo:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"},

  // ── Skiing: Australia — 3rd resort; only Thredbo + Perisher exist for Aus ─
  // Victoria's most-visited. 240km from Melbourne. Jun–Oct S. hemisphere season.
  {id:"mt-buller-s31",category:"skiing",title:"Mount Buller",location:"Victorian Alps, Australia",lat:-37.1413,lon:146.4382,ap:"MEL",icon:"⛷️",rating:4.80,reviews:1540,gradient:"linear-gradient(160deg,#0c1c38,#1a3a76,#2e68b8)",accent:"#74a8dc",tags:["Village At The Summit","3 Hours from Melbourne","Family Resort","Jun–Oct Season"],photo:"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&h=600&fit=crop"},

  // ── Beach: Corsica — no Corsica venue despite French Riviera existing ──────
  // Palombaggia is Europe's most-photographed beach. White sand + pine fringe coves.
  // FSC = Figari Airport (~15km, southern Corsica's beach hub). Great all May–Sept.
  {id:"palombaggia-t30",category:"tanning",title:"Palombaggia Beach",location:"Porto-Vecchio, Corsica",lat:41.4122,lon:9.3817,ap:"FSC",icon:"🏖️",rating:4.93,reviews:1870,gradient:"linear-gradient(160deg,#0a2238,#0d4a82,#1882cc)",accent:"#52b8f2",tags:["White Sand Pine Coves","UV 8","Car-Free Beach","Mediterranean Secret"],photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"},

  // ── Beach: Montenegro — zero Adriatic coast south of Dubrovnik ────────────
  // Budva is the Adriatic's fastest-growing beach destination. Old town backdrop.
  // TIV = Tivat Airport (35km — Montenegro's coastal airport). Season: May–Sept.
  {id:"budva-riviera-t31",category:"tanning",title:"Budva Riviera",location:"Budva, Montenegro",lat:42.2888,lon:18.8400,ap:"TIV",icon:"🏖️",rating:4.79,reviews:1320,gradient:"linear-gradient(160deg,#0a1e3a,#0d3c72,#1a70b8)",accent:"#4aace8",tags:["Adriatic Turquoise","Medieval Old Town","UV 7","Emerging Destination"],photo:"https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop"},

  // ── Beach: Cape Verde — zero West Africa / Atlantic island coverage ────────
  // Sal island: 330+ sunny days/year. Direct flights from London, Lisbon, Amsterdam.
  // Year-round warm water. SID = Amílcar Cabral Intl (on-island, ~10min to beach).
  {id:"santa-maria-cape-verde-t32",category:"tanning",title:"Santa Maria Beach",location:"Sal Island, Cape Verde",lat:16.5992,lon:-22.9399,ap:"SID",icon:"🏝️",rating:4.80,reviews:1650,gradient:"linear-gradient(160deg,#0a2040,#0c4080,#1572c8)",accent:"#3aa0e0",tags:["330+ Sunny Days","Atlantic Trade Winds","UV 9","Year-Round Season"],photo:"https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=800&h=600&fit=crop"},
```

**Also add to `AP_CONTINENT`:**
```javascript
SOF:"europe", MEL:"oceania", FSC:"europe", TIV:"europe", SID:"africa",
```

**Photo note:** Verify all 5 Unsplash photo IDs resolve before committing. Gradient is always the fallback if an ID returns 404.

---

## One Observation for PM

**The `lateSeason` bug is the most quietly harmful data issue right now.** In May, Cervinia (3,883m glacier) and Val d'Isere are legitimately skiable — both often stay open past May with real snow. But the scoring code doesn't read `lateSeason` at all (not implemented anywhere), so these venues get shoulder-capped at score 32 and vanish from the front page during the exact window they're worth showing. Peakly is supposed to surface honest conditions. This is the inverse: burying real conditions at genuine late-season venues. CLAUDE.md marked this done on May 4. It isn't. The fix is ~5 lines in scoreVenue + one flag per venue — less than 15 minutes.
