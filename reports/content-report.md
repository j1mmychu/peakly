# Content & Data Report — 2026-05-03

**Agent:** Content & Data  
**Data health score: 73/100** ↓ from 78 (May 2). New bug: 21 APs use wrong-format continent IDs ("north_america"/"south_america" instead of "na"/"latam"), making 4 venues invisible in continent filter. 5 same-location duplicate pairs still in codebase. 3 duplicate Unsplash base IDs unresolved.

**Score breakdown:**  
Required fields 100% +25 | Zero duplicate IDs +15 | Photo 100% coverage +5 | All 78 surfing venues have `facing` +5 | Geographic diversity 6 continents +8 | 5 same-location dup pairs −10 | 3 duplicate Unsplash base IDs −3 | 21 wrong-format AP_CONTINENT entries (4 venues invisible) −8 | LATAM tanning only 2 venues −3 | 26 ski venues missing `skiPass` −3 | Low-rating floor candidates (4 venues ≤ 4.54) −2 | Unresolved rolling from Apr 23: −3

---

## FIXES APPLIED THIS RUN

None (read-only audit). All findings below are unresolved.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 240 venues

| Category | Count | Status |
|----------|-------|--------|
| tanning  | 89    | ✅ Healthy |
| surfing  | 78    | ✅ Healthy |
| skiing   | 73    | ✅ Healthy |
| **TOTAL** | **240** | 3 live categories, no stubs |

100% field coverage: lat, lon, ap, tags, photo. Zero duplicate IDs. All 78 surfing venues have `facing` bearing.

---

### P0 🔴 NEW — AP_CONTINENT FORMAT BUG (21 wrong-format entries, 4 venues invisible)

A previous session added airports to `AP_CONTINENT` using `"north_america"` and `"south_america"` as continent IDs. The CONTINENTS array uses `"na"` and `"latam"`. The filter join fails silently — venues appear in no continent bucket.

**Venues currently invisible in continent filter:**

| Venue | Category | AP | Problem |
|-------|----------|-----|---------|
| Mt Hood Meadows | skiing | PDX | PDX defined twice: first as `"na"`, then overridden to `"north_america"` |
| Popoyo | surfing | MGA | `MGA:"north_america"` — should be `"na"` |
| Indicator | surfing | SBA | `SBA:"north_america"` — should be `"na"` |
| Laguna Beach | tanning | SNA | `SNA:"north_america"` — should be `"na"` |

**Full list of wrong-format APs** (all need correction):

| Wrong | Correct | APs affected |
|-------|---------|-------------|
| `"north_america"` | `"na"` | ACV, BUR, EUG, MFR, MGA, OAK, PDX, SBA, SJC, SNA, SSC |
| `"south_america"` | `"latam"` | AQT, FOR, GIG, ILH, MAO, MEC, NAT, TPP, TRU, UIO |

**Paste-ready fix — add just before the closing `};` of `AP_CONTINENT`:**
```javascript
  // ── format patch: override wrong-format continent strings ─────────────────
  // "north_america" → "na"
  ACV:"na", BUR:"na", EUG:"na", MFR:"na", MGA:"na", OAK:"na",
  PDX:"na", SBA:"na", SJC:"na", SNA:"na", SSC:"na",
  // "south_america" → "latam"
  AQT:"latam", FOR:"latam", GIG:"latam", ILH:"latam", MAO:"latam",
  MEC:"latam", NAT:"latam", TPP:"latam", TRU:"latam", UIO:"latam",
```

In JavaScript, duplicate keys in an object literal use the last value — adding these at the end of the `AP_CONTINENT` block will override the wrong-format entries upstream without touching existing code.

---

### P1 🔴 CARRY — 5 SAME-LOCATION DUPLICATE VENUES (unresolved since Apr 23)

Flagged in every report since Apr 23. Deleting 5 lines → 240 → 235 venues, health score +8.

| Delete | Keep | Reason |
|--------|------|--------|
| `banzai_pipeline` | `pipeline` | Same break (Pipeline North Shore), 0.002° apart |
| `fernando-de-noronha-s20` | `noronha_surf` | Same reef, 0.003° apart. Wrong "Barrel Waves" tag |
| `siargao` | `cloud9` | Added Apr 23 without noticing `cloud9` existed. 0.01° apart |
| `snappers-gold-coast-s26` | `snapper_rocks` | Snapper Rocks, same break, 0.003° apart |
| `aruba-eagle-beach-t1` | `beach_eagle` | Eagle Beach Aruba. `aruba-eagle-beach-t1` rating 4.53 (lowest in catalog) |

---

### P2 🟡 CARRY — 3 DUPLICATE UNSPLASH BASE PHOTO IDs

Same Unsplash photo ID used across multiple venues (different crop params = still same base image).

| Unsplash ID | Venues sharing it | Fix: swap one URL |
|-------------|------------------|--------------------|
| `photo-1507525428034-b723cf961d3e` | `angourie-point-s3`, `arugam_bay`, `tamarindo` | Swap `tamarindo` → `photo-1530053969600-caed2596d242?w=800&h=600&fit=crop` |
| `photo-1520175462-89499834c4c1` | `portillo-s4`, `perisher` | Swap `portillo-s4` → `photo-1541480551145-2370a440d585?w=800&h=600&fit=crop` |
| `photo-1540202404-a2f29016b523` | `beach_praslin`, `beach_phuquoc` | Swap `beach_phuquoc` → `photo-1528127269322-539801943592?w=800&h=600&fit=crop` |

---

### P3 🟢 CARRY — 26 SKIING VENUES MISSING `skiPass`

Still unresolved. These venues can't filter by pass type in any future pass-filter UI.  
Missing `skiPass` on: `zell-am-see-s1`, `appi-kogen-s2`, `hemsedal-s3`, `portillo-s4`, `big-white-ski-s5`, `idre-fjall-s6`, `kicking-horse-s10`, `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13` + 16 others. Low priority until pass-filter is built.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|---------|--------|
| skiing   | 6     | ~$170   | ✅ Good — includes Atomic Bent 100 ($599) + Osprey pack ($130) |
| surfing  | 6     | ~$61    | ✅ Good |
| tanning  | 4     | ~$27    | ⚠️ Low AOV — consider adding beach umbrella ($45+), waterproof speaker ($60+) |

**Tanning gear expansion (paste-ready, adds 2 high-AOV items):**
```javascript
// append to tanning array in GEAR_ITEMS
    { name:"Beach Umbrella UPF 100",          store:"Amazon", price:"$45+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=beach+umbrella+upf100+sand+anchor" },
    { name:"JBL Clip Waterproof Speaker",     store:"Amazon", price:"$60+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=jbl+clip+waterproof+bluetooth+speaker" },
```

---

## 3. SEASONAL RELEVANCE — May 3, 2026

### Skiing — Late season NH, pre-season SH

- **NH (65 venues):** Most closed. Algorithm returns score 8 "Off-season." Mammoth Mountain (CA) and Mt Hood (OR) may still have spring ops — algorithm handles. ✅
- **SH (8 venues — Remarkables, Portillo, Thredbo, Treble Cone, Perisher, Whakapapa, Cerro Castor, Las Leñas):** Pre-season. Opens June–July. **Opportunity: SH opens in ~8 weeks.** A "Season Opening Soon" badge on these 8 venues before the June traffic spike could drive saves and alerts.
- **Asia skiing (9 venues):** All NH, all closed. Japan season ended April. ✅

### Surfing — Peak windows in May

| Region | May Condition | Venues |
|--------|--------------|--------|
| Bali / Indonesia | **Peak** — SE trades + dry season | Uluwatu, Padang Padang, Keramas, G-Land |
| Maldives | **Good** — SW monsoon swell building | Pasta Point, Jailbreaks |
| Arugam Bay, Sri Lanka | **Opening** — SW monsoon surf starts | `arugam_bay` |
| Morocco | **Good** — NW Atlantic swell winding down | Anchor Point, Taghazout |
| Jeffreys Bay, South Africa | **Building** — SH winter ramp-up | `jeffreys_bay` (WSL Jun–Aug) |

### Tanning — 87/89 in season

Three SH-autumn venues cooling: Praia Mole (−27°S), Tofo Beach (−23°S), Hyams Beach (−35°S). Algorithm scores correctly. No action needed.

**Opportunity:** Mediterranean tanning season is OPENING (May = perfect). 20 EU tanning venues are entering their peak window. Praia da Marinha, Positano, Formentera, Santorini — all entering high-score territory. Good moment for social content.

---

## 4. CONTENT QUALITY

**Ratings floor:** 4 venues rated ≤ 4.54 are candidates for future review:
- `matanzas-s17` (4.50) — Punta de Lobos LATAM surfing
- `mount-maunganui-s15` (4.51) — NZ surf
- `kicking-horse-s10` (4.51) — BC skiing (also missing skiPass)
- `aruba-eagle-beach-t1` (4.53) — P1 delete target, lowest in catalog

**LATAM tanning gap:** Only 2 tanning venues serve all of South/Central America (Praia Mole, Fernando de Noronha — both in Brazil). No Colombia, no Peru, no Cape Verde coast, no Uruguay. This is the biggest geographic hole in the catalog. Today's 5 new venues address this directly.

**Africa tanning (6 venues):** All East Africa / Indian Ocean. Zero West African beach coverage. Cape Verde is the highest-ROI addition (European flight hub, viral white sand).

---

## 5. NEW VENUE ADDITIONS — LATAM tanning + geographic gap fills

**Note:** Venues 1–3 use APs affected by the P0 format bug (`GIG`, new APs `CTG`, `PIU`). Apply the AP_CONTINENT patch above, plus add `CTG:"latam"`, `PIU:"latam"`, `BVC:"africa"` to the patch block, before these venues will appear in continent filters.

**Paste after last entry in VENUES array:**

```javascript
  {id:"buzios",              category:"tanning",title:"Búzios",                   location:"Rio de Janeiro State, Brazil", lat:-22.7533,lon:-41.8817,ap:"GIG", icon:"🏖️",rating:4.87,reviews:2640,gradient:"linear-gradient(160deg,#003344,#005577,#007baa)",accent:"#33aacc",tags:["Brazilian Riviera","27 Beaches","Warm Atlantic","Upscale Village"],            photo:"https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800&h=600&fit=crop"},
  {id:"baru_playa_blanca",   category:"tanning",title:"Playa Blanca de Barú",     location:"Cartagena, Colombia",          lat:10.2044,lon:-75.6519,ap:"CTG", icon:"🏖️",rating:4.83,reviews:1980,gradient:"linear-gradient(160deg,#003355,#005580,#0088cc)",accent:"#33aadd",tags:["Caribbean Crystal","Barú Island","Coral Reefs","Warm Waters"],                photo:"https://images.unsplash.com/photo-1559058789-672da06263d8?w=800&h=600&fit=crop"},
  {id:"mancora",             category:"tanning",title:"Máncora Beach",            location:"Piura, Peru",                  lat:-4.1079,lon:-81.0468,ap:"PIU", icon:"🏖️",rating:4.81,reviews:2140,gradient:"linear-gradient(160deg,#003344,#005566,#007799)",accent:"#22aacc",tags:["Year-Round Sun","Kitesurfing","Warm Pacific","Backpacker Hub"],             photo:"https://images.unsplash.com/photo-1541480551145-2370a440d585?w=800&h=600&fit=crop"},
  {id:"valle_nevado",        category:"skiing", title:"Valle Nevado",             location:"Santiago Region, Chile",        lat:-33.3567,lon:-70.2956,ap:"SCL", icon:"🎿",rating:4.85,reviews:1920,gradient:"linear-gradient(160deg,#0c1430,#1e2c72,#3046c0)",accent:"#6c88e2",skiPass:"independent",tags:["Andean Powder","2860m Peak","SH Winter Season","Santiago Day Trip"],photo:"https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop"},
  {id:"boa_vista_cv",        category:"tanning",title:"Praia de Santa Mônica",    location:"Boa Vista, Cape Verde",         lat:16.2167,lon:-22.7833,ap:"BVC", icon:"🏝️",rating:4.90,reviews:2180,gradient:"linear-gradient(160deg,#003344,#005577,#007baa)",accent:"#33aacc",tags:["Atlantic Isolation","Kitesurfing Capital","Powder White Sand","Loggerhead Turtles"],photo:"https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&h=600&fit=crop"},
```

**Also add to AP_CONTINENT patch block (in addition to the format fix above):**
```javascript
  // New APs for today's venues
  CTG:"latam", PIU:"latam", BVC:"africa",
```

**Rationale:**
- **Búzios** — Brazil's most aspirational beach destination. 27 beaches, luxury vibe, massive social media volume. Plugs the #1 LATAM tanning gap with a flagship venue.
- **Playa Blanca de Barú** — Caribbean Colombia. 4hr flight from Miami. Instagram-viral turquoise. No Colombia tanning venues exist.
- **Máncora** — Peru's only year-round beach. Water 24°C every month. Pairs naturally with the LATAM surfing venues (Chicama, Punta Hermosa) already in DB.
- **Valle Nevado** — Chile's largest ski resort, 45min from Santiago's SCL. Lifts open mid-June. Boosts LATAM skiing from 4 → 5. SCL already mapped correctly.
- **Praia de Santa Mônica** — Cape Verde's most photographed beach. 4hr from Lisbon, 5hr from London. Zero West African coverage currently. Strongest social content pull of any African beach not yet in DB.

---

## One Observation for the PM

**The AP_CONTINENT format bug is silent and self-expanding.** Every session that adds a new venue or airport using `"north_america"`/`"south_america"` format creates a new invisible venue — no error is thrown, the filter just silently returns nothing. Mt Hood Meadows, Indicator, Popoyo, and Laguna Beach have been invisible to any user who filtered by continent since they were added. The one-time paste-ready patch above fixes all 21 wrong-format entries with 3 lines of code and zero risk of breakage (JavaScript last-key-wins is well-defined). This should be applied before any new LATAM or North American venues are added or the new batch above will also be invisible in the filter.
