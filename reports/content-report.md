# Content & Data Report — 2026-04-29

**Agent:** Content & Data
**Data health score: 79/100** ↓ from 80 (April 23). Score corrected: previous report claimed "zero duplicate photos" — this run's full-ID regex audit found 3 confirmed duplicate Unsplash photo pairs that earlier regex missed. No new regressions; no fixes applied this run.

**Score breakdown:**
Required fields 100% +20 | No duplicate IDs +10 | All 237 photos present +8 (was +15, corrected for 3 dupe pairs) | All surfing `facing` fields +5 | Valid IATA codes +5 | Geographic diversity +8 | Categories ≥ 10 venues each +5 | Open: 6 same-category dupe venue pairs −4 | 28 ski venues missing `skiPass` −4 | Tag errors (Pasta Point, Anchor Point) −1 | Ski gear only 4 items −2 | Tanning gear only 4 low-AOV items −1 | Algo frozen (correct, no deduction) 0

---

## FIXES APPLIED THIS RUN

None. Report-only run.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 237 venues

| Category | Count | Status |
|----------|-------|--------|
| tanning  | 88    | ✅ Healthy |
| surfing  | 77    | ✅ Healthy |
| skiing   | 72    | ✅ Healthy |
| **TOTAL**| **237** | 3 live categories |

**Stub categories (< 10 venues):** None. All 3 live categories are healthy.
Note: Agent prompt references "12 categories / 182 venues" — this is a stale spec. Peakly has **3 live categories** as defined in CLAUDE.md. Hiking, climbing, MTB, kayak, dive, yoga, wellness remain deferred. Gear items for those categories are irrelevant until venues are added.

---

### P0 🔴 — 3 CONFIRMED DUPLICATE PHOTO PAIRS (corrected from April 23 false "zero")

Previous detection script used `[a-zA-Z0-9]+` regex on Unsplash photo IDs, which stopped at the first hyphen and produced false positives/negatives. This run uses full photo ID extraction.

| Venue A | Venue B | Shared Photo URL |
|---------|---------|-----------------|
| `angourie-point-s3` (Angourie Point, AUS) | `arugam_bay` (Arugam Bay, LKA) | `photo-1507525428034-b723cf961d3e` |
| `portillo-s4` (Portillo, CHL) | `perisher` (Perisher Blue, AUS) | `photo-1520175462-89499834c4c1` |
| `beach_praslin` (Anse Lazio, Seychelles) | `beach_phuquoc` (Long Beach Phu Quoc, VNM) | `photo-1540202404-a2f29016b523` |

**Fix per pair** — replace the lower-priority venue's photo (batch-gen `-s##`/`-t##` entries take priority for replacement):
- `angourie-point-s3`: replace with `https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop`
- `portillo-s4`: slated for deletion (same-category dupe of `portillo`) — close two birds with one stone
- `beach_phuquoc`: replace with `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop`

---

### P1 🟡 — 6 SAME-CATEGORY DUPLICATE VENUE PAIRS (carried from April 23)

| Delete (batch-gen) | Keep (original) | Category | Issue |
|--------------------|-----------------|----------|-------|
| `aspen-snowmass-s7` | `aspen` | skiing | duplicate resort |
| `arapahoe-basin-s9` | `abasin` | skiing | duplicate resort |
| `anchor-point-s19` | `anchor_point` | surfing | wrong tag (Left-Hander, should be Right) |
| `taghazout-s10` | `taghazout` | surfing | duplicate spot |
| `pasta-point-s24` | `pasta_point` | surfing | wrong tag (Right-Hander, Pasta Point is a LEFT) |
| `pigeon-point-t27` | `beach_tobago` | tanning | duplicate Pigeon Point Tobago |

Deleting these 6 → 237 → **231 venues**. Health score +3.

---

### P2 🟡 — 28 SKI VENUES MISSING `skiPass` (39% of skiing, carried from April 23)

**Likely Ikon-affiliated (verify before patching):** `kicking-horse-s10`, `big-white-ski-s5`, `sun-peaks-resort-s17`, `stowe-mountain-s14`

**Safe to patch as `"independent"`:** `zell-am-see-s1`, `appi-kogen-s2`, `hemsedal-s3`, `portillo-s4` (deletion candidate), `idre-fjall-s6`, `aspen-snowmass-s7` (deletion candidate), `arapahoe-basin-s9` (deletion candidate), `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13`, `champoluc-monterosa-s15`, `val-d-isere-s16`, `chamonix-mont-blanc-s18`, `pucon-ski-center-s19`, `les-arcs-s20`, `powder-mountain-s21`, `madarao-mountain-s22`, `thredbo-village-s23`, `nevis-range-s24`, `tsugaike-kogen-s25`, `mount-shasta-ski-s26`, `lech-zurs-s27`, `cerro-castor-s28`, `treble-cone-s29`

---

### P3 🟢 — TAG ACCURACY (batch-gen slated for deletion)

- `pasta-point-s24`: Tagged "Right-Hander" — Pasta Point Maldives is a **LEFT-hander** only.
- `anchor-point-s19`: Tagged "Left-Hander" — Anchor Point Morocco is a **RIGHT-hand** point break.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|----------|--------|
| skiing   | 4     | ~$75     | ⚠️ Needs skis/pack — see paste below to ~10x AOV |
| surfing  | 6     | ~$67     | ✅ Fixed April 22 |
| tanning  | 4     | ~$27     | ⚠️ Low AOV — add water sports gear |

**Paste-ready skiing expansion** (replaces current 4-item block at app.jsx:5442):

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

**Paste-ready tanning expansion** (replaces current 4-item block at app.jsx:5456):

```javascript
  tanning: [
    { name:"Reef Safe Sunscreen SPF 50",        store:"Amazon", price:"$15+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen+spf+50" },
    { name:"Polarized Sunglasses",              store:"Amazon", price:"$49+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=polarized+sunglasses" },
    { name:"Quick-Dry Beach Towel",             store:"Amazon", price:"$19+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=quick+dry+beach+towel" },
    { name:"Hydration Drink Mix",               store:"Amazon", price:"$25+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=liquid+iv+hydration+multiplier" },
    { name:"Cressi Snorkel Set",                store:"Amazon", price:"$39+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=cressi+snorkel+set+adult" },
    { name:"Rash Guard UPF 50",                 store:"Amazon", price:"$29+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=rashguard+upf+50+swim+shirt" },
  ],
```

---

## 3. SEASONAL RELEVANCE — April 29

### Skiing — Late Season / Pre-Season
- **NH ski (64 venues):** Season over for virtually all NA and European resorts. Algorithm returns score 8 "Off-season" correctly. Only **Zermatt** (Klein Matterhorn glacier, 3883m) and **Hintertux** (Zillertal) run year-round — both will score from live snowpack data.
- **SH ski (8 venues):** Pre-season. Remarkables, Las Leñas, Portillo, Thredbo, Cerro Castor, Treble Cone, Perisher, Pucon all open June–August. Algorithm handles correctly.
- **Action needed:** None. Algorithm manages this.

### Surfing — Several Prime Windows Right Now
| Region | Condition | Notes |
|--------|-----------|-------|
| Morocco (Taghazout, Anchor Point) | **Peak** | NW Atlantic groundswell season, offshore NE trades |
| Bali (Uluwatu, Padang Padang, Keramas) | **Prime** | Dry season begins, SE offshore trades optimal |
| G-Land, Java | **Peak** | SE trade season starts — best May–Oct |
| Hossegor / Landes, France | **Good** | Spring NW swell windows before summer crowds |
| Arugam Bay, Sri Lanka | **Opening** | Season starts mid-May; not quite prime yet |
| Raglan, NZ | **Shoulder** | Late SH autumn — still surfable but declining |

### Tanning — Splits by Region
- **SE Asia (Thailand, Philippines, Bali):** ✅ Prime dry season — all scoring high
- **Maldives / Seychelles:** ✅ Prime clear-sky period before April showers
- **Mediterranean:** Entering shoulder season (late April getting warm, not peak UV yet)
- **Caribbean:** ⚠️ Hurricane season pre-ramp (May–November); algorithm will downgrade via humidity penalty as humidity rises
- **Indian Ocean East Africa (Zanzibar, Diani):** ✅ Long rains start late April — algorithm will flag via precipitation

---

## 4. CONTENT QUALITY

- **All 237 venues:** 100% field coverage (id, category, title, location, lat, lon, ap, icon, rating, reviews, gradient, accent, tags, photo) ✅
- **All 77 surfing venues:** `facing` bearing present ✅
- **Rating range:** 4.50–4.99 (avg 4.86) — realistic spread ✅
- **All venues ≥ 2 tags** ✅
- **Zero duplicate IDs** ✅
- **Zero suspicious coordinates** — geographic spot-checks pass ✅
- **All IATA codes:** valid 3-letter uppercase format ✅

**Stale claims corrected this run:**
- "Zero duplicate photos" (April 23) → **3 confirmed dupe pairs** found via full photo-ID matching
- "182 venues / 12 categories" (agent prompt spec) → outdated; actual is 237 venues / 3 live categories

---

## 5. NEW VENUE OBJECTS — 5 for April 29

Targeting geographic gaps. Photos flagged ⚠️ = verify URL returns correct image before pushing.

```javascript
  // ─── April 29 additions ────────────────────────────────────────────────────
  {
    id:"playa-hermosa-cr", category:"surfing",
    title:"Playa Hermosa", location:"Puntarenas, Costa Rica",
    lat:9.5707, lon:-84.6153, ap:"SJO",
    icon:"🌊", rating:4.87, reviews:1140,
    gradient:"linear-gradient(160deg,#002a1a,#005c38,#00a86b)",
    accent:"#34d399",
    tags:["Pacific Beach Break","Consistent Barrels","Intermediate+","Dry Season Peak"],
    photo:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", // ⚠️ verify
    facing:270,
  },
  {
    id:"weligama",         category:"surfing",
    title:"Weligama Bay", location:"Southern Province, Sri Lanka",
    lat:5.9729, lon:80.4300, ap:"CMB",
    icon:"🌊", rating:4.79, reviews:890,
    gradient:"linear-gradient(160deg,#002040,#005080,#00a0c0)",
    accent:"#38bdf8",
    tags:["Beginner Friendly","Long Lefts","Warm Water","Year-Round Swell"],
    photo:"https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=800&h=600&fit=crop", // ⚠️ verify
    facing:180,
  },
  {
    id:"are-sweden",       category:"skiing",
    title:"Åre", location:"Jämtland, Sweden",
    lat:63.3975, lon:13.0818, ap:"OSD",
    icon:"🎿", rating:4.88, reviews:2310,
    gradient:"linear-gradient(160deg,#0d1b2e,#1a3660,#2d6bae)",
    accent:"#7eb8e0",
    skiPass:"independent",
    tags:["Scandinavia's Biggest","1274m Vertical","Nordic Light","Feb–Apr Peak"],
    photo:"https://images.unsplash.com/photo-1476900543704-4312b78632f8?w=800&h=600&fit=crop", // ⚠️ verify
  },
  {
    id:"bansko",           category:"skiing",
    title:"Bansko", location:"Blagoevgrad, Bulgaria",
    lat:41.8400, lon:23.4875, ap:"SOF",
    icon:"🎿", rating:4.81, reviews:1760,
    gradient:"linear-gradient(160deg,#0a1828,#1e3a6e,#3a6abd)",
    accent:"#82b0e8",
    skiPass:"independent",
    tags:["Budget Powder","Pirin Mountains","Lively Apres","1270m Vertical"],
    photo:"https://images.unsplash.com/photo-1454156446000-6a4d91e45b03?w=800&h=600&fit=crop", // ⚠️ verify
  },
  {
    id:"palolem-goa",      category:"tanning",
    title:"Palolem Beach", location:"Goa, India",
    lat:15.0100, lon:74.0230, ap:"GOI",
    icon:"🏝️", rating:4.83, reviews:1580,
    gradient:"linear-gradient(160deg,#1a2a00,#3a6000,#70b830)",
    accent:"#a3e635",
    tags:["Crescent Bay","Pre-Monsoon Prime","Budget Paradise","Fishing Boats"],
    photo:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop", // ⚠️ verify
  },
```

**Geographic rationale:**
- Playa Hermosa CR: fills Central America surfing gap (only Pavones + Popoyo + Punta Roca exist); Pacific season peaking now
- Weligama: south coast Sri Lanka vs existing east coast Arugam Bay; beginner-tier contrast; April south swell starting
- Åre: Scandinavia only has Hemsedal (Norway) + Idre Fjall (Sweden); Åre is 2× the scale of either
- Bansko: sole Eastern European ski venue is Zakopane (Poland); Bulgaria fills the gap, covers budget ski travelers
- Palolem Goa: only Indian beach in entire tanning list; prime condition window closing May as monsoon approaches — time-sensitive addition

---

## One Observation for PM

**The 3 confirmed duplicate photo pairs are a quiet credibility leak.** A user browsing Portillo (Chile) and Perisher (Australia) — completely different mountains on different continents — sees the exact same hero photo. Same for Sri Lanka vs. Australia surf spots. This took 5 weeks to catch because the detection script had a regex bug. Worth fixing in the next push alongside the 6 same-venue duplicates: total 9 objects to clean up, one focused 30-minute fix, Explore looks dramatically more curated before Reddit launch.
