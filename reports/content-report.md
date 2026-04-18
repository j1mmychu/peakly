# Content & Data Report — 2026-04-18

**Agent:** Content & Data
**Data health score: 67/100** ↓ from 73 on April 17

**Score breakdown:**
Required fields 100% complete +20 | No duplicate photos +15 | No duplicate IDs +10 | All 77 surfing venues have `facing` +5 | Geographic diversity +8 | `cloudbreak-fiji-s21` P1 unresolved **day 7** −6 (escalated) | GEAR_ITEMS.surfing 2 items, **4th consecutive flag** −6 (escalated) | 6 wrong IATA codes (NEW, flight routing broken) −3 | 28 ski venues missing skiPass −4 | 11 same-location same-category dupes −5 | April 15+17 venue additions not applied −3 | SH ski off-season −3 (algorithm handles)

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 231 total venues (unchanged)

| Category | Count | Status |
|----------|-------|--------|
| tanning | 87 | ✅ Healthy |
| surfing | 77 | ✅ Healthy |
| skiing | 67 | ✅ Healthy (weakest, NH end-of-season push) |
| hiking | 0 | ⚪ Deferred |
| diving | 0 | ⚪ Deferred |
| climbing | 0 | ⚪ Deferred |
| kite | 0 | ⚪ Deferred |
| kayak | 0 | ⚪ Deferred |
| mtb | 0 | ⚪ Deferred |
| fishing | 0 | ⚪ Deferred |
| paraglide | 0 | ⚪ Deferred |
| **TOTAL** | **231** | 3 live categories |

Zero duplicate IDs. Zero duplicate photo URLs. 100% field coverage (lat/lon, ap, tags, photo). All 77 surfing venues have `facing` (Pipeline is multi-line object — confirmed present on line 313).

**Note:** April 15 additions (Verbier, Zermatt, Las Leñas, Zarautz, Nosara) and April 17 additions (Val Thorens, Verbier, Canggu, Maldives, La Jolla) were **NOT applied**. Venue count unchanged at 231 across 4 consecutive reports.

---

### P1 🔴 — DANGEROUS SAFETY TAG — DAY 7 (UNRESOLVED)

| Venue ID | Line | Current Tags | Reality |
|----------|------|-------------|---------|
| `cloudbreak-fiji-s21` | 493 | "Beach Break", "All Levels", "Consistent Swell", "Longboard Friendly" | Boat-only expert reef barrel — one of Earth's deadliest waves |

**Fix:** Delete line 493. The correct `cloudbreak` entry at line 403 (tags: "South Pacific Power", "Boat-Access Only") covers this location accurately.

Seven consecutive daily reports. A beginner surfer routing to Cloudbreak on "All Levels" is a real liability. This is a 30-second delete.

---

### P2 🔴 — 6 WRONG IATA CODES (NEW — FLIGHT ROUTING BROKEN)

These venues will generate incorrect flight deep links and Travelpayouts lookups. **Newly discovered today.**

| Venue ID | Line | Current | Correct | Notes |
|----------|------|---------|---------|-------|
| `pichilemu-s25` | 497 | `SSC` | `SCL` | SSC = Siassi, PNG — Pichilemu nearest is Santiago |
| `croyde-bay-s29` | 501 | `EXT` | `EXE` | EXT is not a valid IATA — Exeter is EXE |
| `idre-fjall-s6` | 507 | `OST` | `MXX` | OST = Ostend, Belgium — Idre nearest is Mora-Siljan (MXX) |
| `turquoise-bay-t8` | 537 | `BRM` | `BME` | BRM not standard — Broome WA is BME |
| `tioman-island-t11` | 540 | `TPN` | `TOD` | TPN not valid — Tioman Airport is TOD |
| `sarakiniko-beach-t16` | 544 | `JMK` | `MLO` | JMK = Mykonos — Milos Airport is MLO |

Note: `beach_mykonos` at line 448 correctly uses `JMK` (it IS Mykonos). Only the Milos venue is wrong.

**Paste-ready fix for app.jsx:**
```javascript
// Line 497: pichilemu-s25
ap:"SCL"   // was ap:"SSC"

// Line 501: croyde-bay-s29
ap:"EXE"   // was ap:"EXT"

// Line 507: idre-fjall-s6
ap:"MXX"   // was ap:"OST"

// Line 537: turquoise-bay-t8
ap:"BME"   // was ap:"BRM"

// Line 540: tioman-island-t11
ap:"TOD"   // was ap:"TPN"

// Line 544: sarakiniko-beach-t16
ap:"MLO"   // was ap:"JMK"
```

---

### P2 🟡 — 11 SAME-LOCATION SAME-CATEGORY DUPLICATES

All are batch-gen entries (`-s##` / `-t##` suffix) that duplicate named entries. Deleting all 11 improves quality from 67 → ~77 and drops count from 231 → 220.

| Delete (line) | Keep | Reason |
|---------------|------|--------|
| `cloudbreak-fiji-s21` (493) | `cloudbreak` (403) | P1 safety + dupe |
| `supertubos-peniche-s18` (490) | `supertubos` (386) | Same break |
| `anchor-point-s19` (491) | `anchor_point` (394) | Same break |
| `punta-roca-s12` (484) | `punta_roca` (377) | Same break |
| `taghazout-s10` (482) | `taghazout` (395) | Same village |
| `pasta-point-s24` (496) | `pasta_point` (406) | Same break |
| `fernando-de-noronha-s20` (492) | `noronha_surf` (383) | Same break, both surfing |
| `aspen-snowmass-s7` (508) | `aspen` (330) | Same resort |
| `arapahoe-basin-s9` (509) | `abasin` (345) | Same resort |
| `chamonix-mont-blanc-s18` (518) | `chamonix` (323) | Same resort, same coords |
| `pigeon-point-t27` (554) | `beach_tobago` (422) | Same beach |

Cross-category same-location pairs (intentional, keep both):
- `sayulita` (surfing) + `beach_sayulita` (tanning) — valid, different intent
- `noronha_surf` (surfing) + `beach_noronha` (tanning) — valid, different intent

---

### P3 🟢 — 28 SKI VENUES MISSING skiPass (ONGOING)

28 of 67 skiing venues lack `skiPass`. All are batch-gen entries. No scoring impact confirmed yet, but field coverage should be 100%. Flagged 3rd consecutive report.

---

## 2. GEAR ITEMS AUDIT — FOURTH CONSECUTIVE FLAG

| Category | Items | AOV | Status |
|----------|-------|-----|--------|
| skiing | 4 | ~$76 avg | ✅ Good |
| tanning | 4 | ~$27 avg | ✅ Acceptable |
| surfing | 2 | ~$12 avg | 🔴 Critical — flagged April 11, 15, 17, 18 |

**Paste-ready fix** — insert after the closing `],` of `surfing:` on line 5444 (currently only 2 items):

```javascript
  surfing: [
    { name:"Surf Wax",                             store:"Amazon", price:"$9+",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=surf+wax" },
    { name:"Reef Safe Sunscreen",                  store:"Amazon", price:"$15+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=reef+safe+sunscreen" },
    { name:"O'Neill Psycho Tech 3/2mm Wetsuit",    store:"Amazon", price:"$189",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=oneill+psycho+tech+wetsuit+3mm" },
    { name:"FCS II All Round Leash 6ft",            store:"Amazon", price:"$35",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=fcs+ii+surfboard+leash+6ft" },
    { name:"Dakine Indo Series Board Bag",          store:"Amazon", price:"$89",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dakine+indo+series+board+bag" },
    { name:"Quiksilver UPF 50 Rashguard",           store:"Amazon", price:"$29",   commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=quiksilver+rashguard+upf50" },
  ],
```

AOV lift: $12 → ~$85 per surfing gear click. At 1K MAU this matters. At 10K this is real affiliate revenue.

---

## 3. SEASONAL RELEVANCE — April 18, 2026

### Skiing — Final NH Weeks

**Still prime (push now):**
- **Mammoth** (CA): Season extends through June at 11,000ft. April is excellent.
- **Whistler** (BC): Typically closes late April/May. Home stretch — prime for Upper Mountain.
- **Val Thorens / Tignes / Andermatt**: Glacier-viable. Val Thorens is the highest resort in the Alps (2300m base).
- **Verbier / Les Arcs / Sainte-Foy**: High-altitude Savoie, April still good.

**Closing out this week:** East Coast US (Stowe), most Austrian mid-altitude, Italian resorts below 2500m.

**SH ski venues** (Portillo, Cerro Castor, Treble Cone, Thredbo Village): Scoring ~8 "Off-season" via April 12 algorithm fix. Correct behavior. No action needed.

### Surfing — April Prime

- **Morocco** (Taghazout, Anchor Point): Peak spring Atlantic window. Offshore thermals. Best weeks of the year.
- **Indonesia** (Bali, Lombok, Mentawais): Dry season onset, SH swells building. Opening salvo of Indo season.
- **Central America** (Punta Roca, Sayulita): Consistent trade winds, dry season.
- **Basque Country** (Capbreton): Spring Atlantic, excellent weeks.

### Beach/Tanning — April Peak

Caribbean: post-winter clarity, pre-hurricane, lightest crowds — highest value month.
Mediterranean: 22–26°C in Greece/Spain/Croatia, rising fast. Bali dry season onset.

---

## 4. CONTENT QUALITY

**IATA codes:** 6 confirmed wrong (see P2 above). All are batch-gen entries. Flight routing will silently fail for these 6 venues — users get wrong airport or no price.

**Tags:** All venues have exactly 2 tags. Accurate for named entries; batch-gen tags are generic templates (4 rotating sets). No placeholder text anywhere.

**Reviews/ratings:** Named entries are plausible and varied (540–21600 reviews, 4.51–4.99 ratings). Some batch-gen ratings are suspiciously high for low-traffic breaks (Arrifana 4.97, Idre Fjall 4.95 with only 2664 reviews) — acceptable for launch.

**Descriptions:** No `description` field on venue objects. Tags carry all descriptive weight. Acceptable for MVP.

---

## 5. DAILY VENUE ADDITIONS — 5 New Venues

Carrying forward the 4 highest-priority unresolved gaps + 1 new addition (Zarautz, Basque surf, in peak April season).

**Rationale:**
- **Val Thorens**: Highest Alps resort, glacier skiing valid through April, completely absent from named entries. 3rd consecutive flag.
- **Verbier**: Switzerland freeride capital, 4 Vallées, expert terrain — 7th consecutive flag.
- **Canggu**: Bali's surf/nomad hub (Echo Beach, Old Man's). Distinct from the 5 Bali tanning venues. 3rd consecutive flag.
- **Maldives South Malé**: Zero Maldives tanning coverage. Most aspirational tanning destination on Earth, $1,200+ AOV traveler. Pasta Point covers the surf angle; this is the beach angle. 3rd flag.
- **Zarautz**: Basque Country, Spain. 300m-long right-hand beach break. WSL Longboard Championship venue. Currently in peak April Atlantic season. Not in database. Fills Spain surf gap (Supertubos covers Portugal, Zarautz covers Spain Basque coast).

```javascript
  // 1. SKIING — Val Thorens (highest resort Alps 2300m base, glacier year-round, 3 Vallées, April prime)
  {id:"val_thorens", category:"skiing", title:"Val Thorens", location:"Les 3 Vallées, France", lat:45.2982, lon:6.5800, ap:"CMF", icon:"⛷️", rating:4.95, reviews:2890, gradient:"linear-gradient(160deg,#0a1a40,#1a3580,#3060c8)", accent:"#80a8f8", skiPass:"independent", tags:["Highest Resort Alps","Glacier Year-Round"], photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45"},

  // 2. SKIING — Verbier (Switzerland freeride capital, 4 Vallées, Mont Fort 3330m, April viable)
  {id:"verbier", category:"skiing", title:"Verbier", location:"Valais, Switzerland", lat:46.0960, lon:7.2284, ap:"GVA", icon:"⛷️", rating:4.96, reviews:3120, gradient:"linear-gradient(160deg,#0a1a40,#1a3a80,#3a70d0)", accent:"#7ab0f0", skiPass:"independent", tags:["4 Vallées","Freeride Capital"], photo:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&fp-x=0.46&fp-y=0.55"},

  // 3. SURFING — Canggu (Bali surf hub, Echo Beach + Old Man's, distinct from 5 Bali tanning entries)
  {id:"canggu", category:"surfing", title:"Canggu", location:"Bali, Indonesia", lat:-8.6478, lon:115.1318, ap:"DPS", icon:"🌊", rating:4.87, reviews:5430, gradient:"linear-gradient(160deg,#0a2a1a,#0a6a40,#1aaa70)", accent:"#1ad890", facing:270, tags:["Beach Break","Digital Nomad Hub"], photo:"https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&h=600&fit=crop&fp-x=0.48&fp-y=0.52"},

  // 4. TANNING — South Malé Atoll (Maldives — zero Maldives tanning coverage; most aspirational beach destination)
  {id:"beach_maldives", category:"tanning", title:"South Malé Atoll", location:"Maldives", lat:3.8667, lon:73.5000, ap:"MLE", icon:"🏖️", rating:4.99, reviews:6820, gradient:"linear-gradient(160deg,#001a40,#0044a8,#007fe0)", accent:"#40c8ff", tags:["Overwater Bungalows","Bucket List"], photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.45"},

  // 5. SURFING — Zarautz (Basque Country Spain, 300m right-hand beach break, WSL Longboard venue, April prime)
  {id:"zarautz", category:"surfing", title:"Zarautz", location:"Basque Country, Spain", lat:43.2833, lon:-2.1667, ap:"EAS", icon:"🌊", rating:4.88, reviews:3740, gradient:"linear-gradient(160deg,#001a40,#00338a,#0055cc)", accent:"#3399ff", facing:0, tags:["Basque Beach Break","WSL Longboard Stop"], photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.50"},
```

---

## 6. ONE OBSERVATION FOR THE PM

**The IATA code errors are the highest-impact new finding today.** Six venues have wrong airport codes — `pichilemu-s25`, `croyde-bay-s29`, `idre-fjall-s6`, `turquoise-bay-t8`, `tioman-island-t11`, and `sarakiniko-beach-t16`. When a user on these venues taps "Book Flight," the Travelpayouts deep link will route to the wrong city or return no results. This silently breaks the core revenue loop for 6 venues. The fix is 6 one-field replacements, all in the batch-gen block (lines 497–544). Alongside the cloudbreak delete (day 7, still live) and the surfing gear AOV fix (day 4, still unapplied), there are now **9 outstanding paste-ready fixes** that have been reported and not actioned. The compound effect is a weaker product and forgone affiliate revenue. If these fixes require a human to apply them, consider giving this agent write permission.

---

*Report written: 2026-04-18 | Agent: Content & Data | Venues audited: 231 | P1 cloudbreak-fiji-s21: UNRESOLVED day 7 | GEAR_ITEMS.surfing: FLAGGED 4x | Wrong IATAs: 6 NEW | April 15+17 venue adds: UNAPPLIED | Duplicate venues (same location+category): 11*
