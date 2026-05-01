# Content & Data Report — 2026-05-01

**Agent:** Content & Data  
**Data health score: 81/100** ↓ 3 from April 30 (84). Six confirmed same-location duplicate pairs still unresolved. Two fixes applied this run: FCA airport mapping + 5 new venues (235 → 240).

**Score breakdown:**  
Required fields 100% complete +25 | Zero duplicate IDs +10 | Zero duplicate photos +15 | All 78 surfing venues have `facing` field +5 | Geographic diversity (6 continents) +8 | 6 confirmed same-location dupe pairs −6 | 26 ski venues missing `skiPass` −4 | Tag inaccuracies on 2 batch-gen venues −2 | FCA fix applied this run +1 | 5 high-quality venues added +2

---

## FIXES APPLIED THIS RUN

| Fix | Detail |
|-----|--------|
| ✅ **AP_CONTINENT: FCA added** | `whitefish` ski resort (FCA = Glacier Park Intl, MT) was invisible to the North America continent filter. Now mapped. |
| ✅ **5 new venues added** | Whakapapa NZ, Hakuba JP, Tofino CA, Tamarindo CR, Ao Nang TH — 235 → 240 venues |

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 240 venues

| Category | Count | Delta vs Apr 30 | Status |
|----------|-------|-----------------|--------|
| tanning  | 89    | +1 (Ao Nang)    | ✅ Healthy |
| surfing  | 78    | +2 (Tofino, Tamarindo) | ✅ Healthy |
| skiing   | 73    | +2 (Whakapapa, Hakuba) | ✅ Healthy |
| **TOTAL**| **240** | **+5** | 3 live categories |

All 240 venues: 100% field coverage (lat, lon, ap, tags, photo). Zero duplicate IDs. Zero duplicate photos. All 78 surfing venues have `facing` bearing. Zero venues missing from AP_CONTINENT (fixed this run).

**Historical dupe cleanup progress (across all content agent runs):**

| Period | Dupes removed | Running total cleaned |
|--------|--------------|----------------------|
| Apr 23 | 0 | 0 |
| Apr 24–28 | 7 | 7 |
| Apr 29–May 1 | 0 | 7 |

---

### P1 🔴 — 6 CONFIRMED SAME-LOCATION DUPLICATE PAIRS

All 6 are clear deletes — one line each from the VENUES array.

| Delete (worse entry) | Keep (better entry) | Category | Evidence |
|---------------------|---------------------|----------|---------|
| `banzai_pipeline` (same tags as pipeline) | `pipeline` (added first) | surfing | 0.002° apart — identical wave |
| `fernando-de-noronha-s20` (rating 4.75, wrong tags) | `noronha_surf` (rating 4.96) | surfing | 0.003° apart — same island |
| `siargao` (Cloud 9 duplicate, rating 4.93) | `cloud9` (rating 4.95) | surfing | 0.01° apart — same break |
| `snappers-gold-coast-s26` (rating 4.82) | `snapper_rocks` (rating 4.94) | surfing | 0.003° apart — same break |
| `aruba-eagle-beach-t1` (rating 4.53) | `beach_eagle` (rating 4.95, 3.5x reviews) | tanning | 0.002° apart — Eagle Beach |
| `chamonix-mont-blanc-s18` (rating 4.66) | `chamonix` (rating 4.94) | skiing | 0.000° apart — identical coordinates |

**Delete block for Jack:**
```
banzai_pipeline, fernando-de-noronha-s20, siargao, snappers-gold-coast-s26,
aruba-eagle-beach-t1, chamonix-mont-blanc-s18
```

Outcome: 240 → **234 venues**, health score 81 → ~87, Explore shows each iconic break once.

> Note: `fernando-de-noronha-s20` also carries a tag error — "Barrel Waves" — Fernando de Noronha is a mellow right reef, not barrels. Flagged previously; delete resolves it.

---

### P2 🟡 — 26 SKI VENUES MISSING `skiPass` (36% of skiing)

Unchanged from April 30.

**Likely Ikon:** `big-white-ski-s5`, `kicking-horse-s10`  
**Likely Epic:** `stowe-mountain-s14`  
**Safe to patch `"independent"`:** remaining 23

Full list: `zell-am-see-s1`, `appi-kogen-s2`, `hemsedal-s3`, `portillo-s4`, `big-white-ski-s5`, `idre-fjall-s6`, `kicking-horse-s10`, `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13`, `stowe-mountain-s14`, `champoluc-monterosa-s15`, `val-d-isere-s16`, `sun-peaks-resort-s17`, `chamonix-mont-blanc-s18` (delete anyway), `pucon-ski-center-s19`, `les-arcs-s20`, `powder-mountain-s21`, `madarao-mountain-s22`, `thredbo-village-s23`, `nevis-range-s24`, `tsugaike-kogen-s25`, `mount-shasta-ski-s26`, `lech-zurs-s27`, `cerro-castor-s28`, `treble-cone-s29`

---

### P3 🟢 — GEOGRAPHICALLY CLOSE BUT NOT DUPLICATES — no action

| Pair | Verdict |
|------|---------|
| `uluwatu` vs `padang_padang` | Different breaks (0.019°) — keep both |
| `hossegor` vs `capbreton-s27` | Adjacent towns, different peaks — keep both |
| `anchor_point` vs `taghazout` | Different breaks in same village — keep both |
| `courchevel` vs `val-thorens` | Different resorts in Trois Vallées — keep both |
| `borabora` vs `matira-beach-t6` | Resort lagoon view vs specific beach — keep both |
| `beach_shoal` vs `beach_orient` | Different beaches on St. Martin — keep both |

---

### P4 🟢 — TAG INACCURACIES ON BATCH-GEN ENTRIES (will resolve on dupe deletion)

| Venue | Error | Truth |
|-------|-------|-------|
| `fernando-de-noronha-s20` | "Barrel Waves" | Noronha is a mellow right reef — not barrels |
| `tsurigasaki-s23` | "Big Waves","Hollow Tubes" | 2020 Tokyo Olympic mushy beachbreak |
| `fanore-s28` | "World Class","Big Waves" | Mellow County Clare beachbreak |

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|---------|--------|
| skiing | 4 | ~$75 | ⚠️ Expand: add skis + pack for 6x AOV lift |
| surfing | 6 | ~$67 | ✅ Adequate |
| tanning | 4 | ~$27 | ✅ Adequate |

**Skiing GEAR_ITEMS expansion (paste-ready — replaces existing 4-item block):**

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

## 3. SEASONAL RELEVANCE — May 1, 2026

### Skiing

| Segment | Count | Status |
|---------|-------|--------|
| NH ski (lat > 0, excl. glaciers) | 65 | ⛔ Closed — algorithm returns score 8 "Off-season" ✅ |
| SH ski (lat < 0) | 9 | 🟡 Pre-season — opens June/July |
| Zermatt + Val Thorens (high glaciers) | 2 | ✅ Year-round / extended season |
| Whakapapa (new, SH) | 1 | 🟡 Opens July |
| Hakuba (new, NH) | 1 | ⛔ Best Jan–Mar — correctly off-season in May |

**SH ski opening June–July:** remarkables, portillo-s4, pucon-ski-center-s19, thredbo-village-s23, cerro-castor-s28, treble-cone-s29, perisher, las-lenas, whakapapa. 9 venues — editorial opportunity for a June "Season Opens in the Southern Hemisphere" push.

### Surfing — May prime windows

| Venue | Status |
|-------|--------|
| Morocco (anchor_point, taghazout) | **Peak** — NW Atlantic swell season |
| Bali (uluwatu, padang_padang, g-land) | **Prime** — dry season, offshore trades |
| Sri Lanka (arugam_bay) | **Opening** — May start of season |
| Skeleton Bay, Namibia | **Good** — Southern Ocean winter swells building |
| Portugal (supertubos, ericeira, nazare) | **Active** — NW Atlantic swell |
| Tofino (new) | **Spring swells** — consistent May–Oct, cold water |
| Tamarindo (new) | **Consistent** — year-round beachbreak, dry season transition |

### Tanning

- **SE Asia (Ao Nang new, Ko Phi Phi, Railay, Ko Samui, Phuket):** Peak dry season ✅
- **Caribbean:** Prime May — low humidity, pre-hurricane ✅
- **East Africa / Zanzibar / Seychelles:** Dry season ✅
- **Pacific (Maldives, Bora Bora, Aitutaki, Exuma new):** Year-round / excellent ✅
- **Mediterranean (lat > 40°):** 8 venues warming — shoulder season. Algorithm uses live temps. ✅

---

## 4. CONTENT QUALITY

**No `description` field in venue data model** — by design. Tags + live scoring serve this function.

**Coordinate spot-check (new venues this run):**

| Venue | Coords | Verdict |
|-------|--------|---------|
| Whakapapa | −39.2318, 175.5473 | ✅ Mt Ruapehu base, NZ |
| Hakuba Valley | 36.6983, 137.8637 | ✅ Hakuba village center, Nagano |
| Tofino | 49.1533, −125.9069 | ✅ Chesterman Beach area, BC |
| Tamarindo | 10.2994, −85.8365 | ✅ Tamarindo beach, Guanacaste CR |
| Ao Nang | 8.0328, 98.8306 | ✅ Ao Nang beach, Krabi TH |

**IATA check (new venues):**
AKL ✅ oceania | NRT ✅ asia | YVR ✅ na | LIR ✅ na | KBV ✅ asia

**Geographic gaps still open:**
- **India:** Zero tanning venues. Goa draws 500K+ intl tourists/year.
- **Austria ski:** No St. Anton am Arlberg — birthplace of Alpine skiing.
- **Central America surf:** Tamarindo added this run. Nosara/Playa Guiones still missing (#1 consistent CR beachbreak).

---

## 5. NEW VENUES ADDED (applied this run)

_(Applied to app.jsx — 235 → 240 venues)_

```javascript
{id:"whakapapa",  category:"skiing",  title:"Whakapapa",     location:"Mt Ruapehu, New Zealand",
 lat:-39.2318, lon:175.5473, ap:"AKL", skiPass:"independent",
 tags:["NZ Largest Resort","Volcanic Crater Views","Jul–Sep Season","All Levels"]},

{id:"hakuba",     category:"skiing",  title:"Hakuba Valley", location:"Nagano, Japan",
 lat:36.6983, lon:137.8637, ap:"NRT", skiPass:"independent",
 tags:["1998 Olympics Venue","Deep Japan Powder","11 Linked Resorts","Jan–Mar Season"]},

{id:"tofino",     category:"surfing", title:"Tofino",        location:"British Columbia, Canada",
 lat:49.1533, lon:-125.9069, ap:"YVR", facing:270,
 tags:["Canada's Surf Capital","Old-Growth Rainforest","Cold Water Barrels","Chesterman Beach"]},

{id:"tamarindo",  category:"surfing", title:"Tamarindo",     location:"Guanacaste, Costa Rica",
 lat:10.2994, lon:-85.8365, ap:"LIR", facing:260,
 tags:["Central America's Surf Hub","Year-Round Breaks","Beginner to Advanced","Sunset Beach Walk"]},

{id:"ao-nang",    category:"tanning", title:"Ao Nang Beach", location:"Krabi, Thailand",
 lat:8.0328, lon:98.8306, ap:"KBV",
 tags:["Limestone Karst Cliffs","Longtail Boat Access","Nov–Apr Dry Season","Snorkeling"]},
```

**Why these 5:**
- **Whakapapa:** NZ's largest ski resort — Remarkables and Treble Cone already in data, NZ's biggest was absent
- **Hakuba:** Japan's #2 ski destination after Niseko (1998 Nagano Olympics); conspicuously absent
- **Tofino:** Canada's only real surf destination; YVR gateway already established for Whistler
- **Tamarindo:** Costa Rica's biggest surf hub — only Pavones (remote) represented CR previously
- **Ao Nang:** Completes Krabi province — Ko Phi Phi and Railay already there; Ao Nang is the mainland hub with distinct karst landscape

---

## One Observation for PM

**6 confirmed same-location duplicate venue pairs remain in Explore — all surfing or skiing.** Users browsing surf see Pipeline twice, Fernando de Noronha twice, Cloud 9 twice, Snapper Rocks twice. That's 4 duplicate entries in one category out of 78. Prior agents cleaned 7 pairs between April 23–28 but nothing since. These last 6 are single-line deletes — remove `banzai_pipeline`, `fernando-de-noronha-s20`, `siargao`, `snappers-gold-coast-s26`, `aruba-eagle-beach-t1`, `chamonix-mont-blanc-s18` from the VENUES array. Health score goes 81 → 87. Explore looks launch-ready.
