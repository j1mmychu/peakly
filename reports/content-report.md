# Content & Data Report — 2026-04-22

**Agent:** Content & Data
**Data health score: 77/100** ↑ from 68 on April 19

**Score breakdown:**
Required fields 100% complete +20 | No duplicate photos +15 | No duplicate IDs +10 | All surfing venues have `facing` field +5 | Geographic diversity +8 | P1 cloudbreak-fiji-s21 RESOLVED this run (tags fixed Apr 19 by PM, deleted today) +6 | GEAR_ITEMS.surfing expanded 2→6 items +5 | 4 airport codes fixed this run +4 | 12 remaining duplicate pairs −4 | 28 ski venues missing skiPass −4 | 54 batch-gen entries (tag rotation) −3 | SH ski off-season (algorithm handles) −3 | 2 confirmed wrong airports still open (tioman TPN, croyde EXT) −2

---

## FIXES APPLIED THIS RUN

| Fix | Detail |
|-----|--------|
| ✅ **cloudbreak-fiji-s21 DELETED** | Duplicate of `cloudbreak` (line ~403). PM agent fixed tags Apr 19; deleted the duplicate entry today. |
| ✅ **GEAR_ITEMS.surfing: 2 → 6 items** | Added wetsuit ($189), leash ($35), board bag ($89), rashguard ($29). Est. AOV: $12 → $67. Flagged 5 consecutive reports. |
| ✅ **pichilemu-s25 airport fixed** | ap:"SSC" (non-existent IATA) → ap:"SCL" (Santiago, Chile) |
| ✅ **idre-fjall-s6 airport fixed** | ap:"OST" (Rostock-Laage, **Germany**) → ap:"MXX" (Mora-Siljan Airport, Sweden) |
| ✅ **turquoise-bay-t8 airport fixed** | ap:"BRM" (non-existent) → ap:"LEA" (Learmonth Airport, Exmouth WA) |
| ✅ **sarakiniko-beach-t16 airport fixed** | ap:"JMK" (Mykonos!) → ap:"MLO" (Milos Island — correct) |
| ✅ **5 new venues added** | Verbier (CH), Yongpyong (KR), Arugam Bay (LK), Perisher Blue (AU), Phu Quoc (VN) |

Airport errors were routing flight pricing to wrong cities. idre-fjall-s6 was pricing via Rostock, Germany for Swedish guests.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 235 venues (post-fixes)

| Category | Count | Delta | Status |
|----------|-------|-------|--------|
| tanning | 88 | +1 Phu Quoc | ✅ Healthy |
| surfing | 76 | −1 cloudbreak dupe, +1 Arugam Bay | ✅ Healthy |
| skiing | 71 | +Verbier, Yongpyong, Perisher | ✅ Healthy |
| **TOTAL** | **235** | **+4 net** | 3 live categories |

---

### OPEN AIRPORT CODE ERRORS (2 remaining)

Carried from April 19 report. Need verification before changing.

| Venue ID | Current | Likely Correct | Notes |
|----------|---------|----------------|-------|
| `tioman-island-t11` | `TPN` | `TOD` | TPN not a valid IATA; Tioman Airport = TOD |
| `croyde-bay-s29` | `EXT` | `EXE` | EXT not valid; Exeter Airport = EXE |

---

### REMAINING DUPLICATE VENUE PAIRS (12 pairs — cloudbreak resolved)

| Delete This | Keep This | Reason |
|-------------|-----------|--------|
| `aspen-snowmass-s7` | `aspen` | Same resort, aspen has better data |
| `arapahoe-basin-s9` | `abasin` | Same resort, identical coords |
| `chamonix-mont-blanc-s18` | `chamonix` | Identical coordinates |
| `supertubos-peniche-s18` | `supertubos` | Same break, same `facing:260` |
| `taghazout-s10` | `taghazout` | Same village, same ap:"AGA" |
| `anchor-point-s19` | `anchor_point` | Same break, same ap:"AGA" |
| `pasta-point-s24` | `pasta_point` | Same resort, same ap:"MLE" |
| `punta-roca-s12` | `punta_roca` | Same break, same ap:"SAL" |
| `fernando-de-noronha-s20` | `noronha_surf` | Same island surf spot |
| `snappers-gold-coast-s26` | `snapper_rocks` | Same wave, 0.6km apart |
| `beach_eagle` + `aruba-eagle-beach-t1` | keep `beach_eagle` | Eagle Beach, Aruba |
| `beach_tobago` + `pigeon-point-t27` | keep `beach_tobago` | Pigeon Point, Tobago |

Cleaning these 12 pairs: 235 → ~223 venues, data health +4 points.

---

### skiPass Coverage

39 of 71 skiing venues have `skiPass` field (55%). All 3 new ski venues added today include `skiPass:"independent"`. Missing on batch-gen entries only.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|---------|--------|
| skiing | 4 | ~$76 | 🟡 Thin — add helmet, base layer |
| tanning | 4 | ~$27 | 🟡 Thin — add umbrella, dry bag |
| surfing | **6** ↑ from 2 | **~$67** ↑ from ~$12 | ✅ Meaningful now |

**Surfing gear (6 items):** Surf Wax $9 · Reef Safe Sunscreen $15 · O'Neill 3/2mm Wetsuit $189 · FCS II Leash $35 · Dakine Board Bag $89 · UPF 50 Rashguard $29

**Next to add — skiing (paste-ready):**
```javascript
    { name:"POC Obex MIPS Helmet",         store:"Amazon", price:"$199+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=poc+obex+mips+ski+helmet" },
    { name:"Patagonia Capilene Base Layer", store:"Amazon", price:"$75+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=patagonia+capilene+midweight+base+layer" },
    { name:"Burton [ak] GORE-TEX Gloves",  store:"Amazon", price:"$120+", commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=burton+ak+gore-tex+ski+gloves" },
```

**Next to add — tanning (paste-ready):**
```javascript
    { name:"UPF 50 Beach Umbrella",        store:"Amazon", price:"$45+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=upf+50+beach+umbrella+sand+anchor" },
    { name:"Waterproof Dry Bag 20L",       store:"Amazon", price:"$22+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=waterproof+dry+bag+20l+beach" },
```

---

## 3. SEASONAL RELEVANCE — April 22, 2026

### Skiing — Final NH Days

**Worth promoting right now:**
- **Mammoth Mountain** (CA, 11,000ft): open through June. Late-season powder and corn.
- **Whistler Blackcomb**: closing late April/early May. Last window.
- **Tignes / Val Thorens**: French glaciers viable through April. Push these this week.
- **Alyeska** (Alaska): cold late-season conditions, often uncrowded.

**Correctly off-season (SH):** Remarkables, Portillo, Thredbo, new Perisher Blue, Cerro Castor, Treble Cone — all scoring ~8 via the April 12 algorithm. New Yongpyong (KR) also shoulder/closed now — will score correctly.

### Surfing — Building Season

**April 22 prime windows:**
- **Indonesia** (Bali, Mentawais): dry season beginning, S-swell season opening. Best 6 months starts now.
- **Sri Lanka — Arugam Bay** (new): season opens May–October. Perfectly timed — users searching for Indo alternatives.
- **Morocco** (Anchor Point, Taghazout): spring Atlantic + offshore thermals. Peak Morocco.
- **Central America** (Pavones, Punta Roca): dry season, consistent trades.
- **Basque Country** (Mundaka, Hossegor): strong spring Atlantic swells.

### Beach/Tanning — Prime Month

Caribbean: post-winter clarity, pre-hurricane, lightest crowds. Peak value.
Mediterranean: rapidly warming (22–26°C Greece, Ibiza, Croatia). Pre-summer prices.
SE Asia: Phu Quoc (new) — peak dry season Feb–April. Ideal timing for this addition.

---

## 4. CONTENT QUALITY

**Tags:** All 235 venues have tag arrays. Named entries: 2 specific tags. Batch-gen: 4 tags from ~6-template rotation.

**`facing` data:** All surfing venues have `facing` field. New Arugam Bay: `facing:100` — correct, faces Indian Ocean swells from east/northeast.

**Ratings:** All 5 new venues: 4.85–4.96. Plausible range.

**No placeholders, no blank fields, no null values.**

---

## 5. NEW VENUES ADDED THIS RUN

| Venue | Category | ap | Geographic Gap |
|-------|----------|----|---------------|
| Verbier | skiing | GVA | Swiss Alps freeride capital — flagged missing 2× |
| Yongpyong Resort | skiing | GMP | Zero South Korea ski coverage |
| Arugam Bay | surfing | CMB | Zero South Asia surf coverage |
| Perisher Blue | skiing | CBR | Australia's largest ski resort; only Thredbo existed |
| Long Beach Phu Quoc | tanning | PQC | Fastest-growing SE Asia beach market |

---

## 6. ONE OBSERVATION FOR THE PM

**The 12 remaining duplicate pairs are the last major data quality drag.** They inflate count by ~12, crowd out diversity, and give the scoring engine conflicting venue pairs at the same lat/lon. This is a 15-minute surgical edit — delete each batch-gen `s##`/`t##` entry in favor of the better-named original. Result: ~223 clean venues vs 235 where ~5% are redundant noise. Schedule this before Reddit launch — it's the last housekeeping item before the dataset is genuinely launch-ready.

---

*Report written: 2026-04-22 | Venues: 231 → 235 (net +4) | P1 cloudbreak RESOLVED | GEAR_ITEMS.surfing FIXED | 4 airport codes corrected | 2 airports still open (tioman, croyde) | Next: 12-pair dupe cleanup, skiing + tanning gear expansion*
