# Content & Data Report — 2026-05-02

**Agent:** Content & Data  
**Data health score: 72/100** ↓ from 80 (Apr 23). Duplicate count grew; 3 photo dupes discovered; 36 APs missing from continent map.

**Score breakdown:**  
Required fields 100% +20 | No duplicate IDs +10 | 3 photo dup pairs (was claimed zero) +12 | All surfing venues have `facing` +5 | Geographic diversity +8 | 10 confirmed dup venue objects (6 from Apr 23 + 4 new) −10 | 36 APs missing from AP_CONTINENT (continent filter silently hides venues) −8 | 28 s-series ski venues missing `skiPass` −3 | Tag errors on deleted candidates −2

---

## FIXES APPLIED THIS RUN

None. This is a read-only audit run. All findings below are unresolved.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 237 venues

| Category | Count | Status |
|----------|-------|--------|
| tanning | 88 | ✅ Healthy |
| surfing | 77 | ✅ Healthy |
| skiing | 72 | ✅ Healthy |
| **TOTAL** | **237** | 3 live categories, no stubs |

**Note:** Effective clean count after removing all duplicates = ~226 venues.

---

### P1 🔴 — DUPLICATE VENUE OBJECTS (10 confirmed, 4 new since Apr 23)

Apr 23 identified 6 same-category duplicates. **4 more confirmed today.** The `siargao` venue added on Apr 23 duplicates the pre-existing `cloud9` entry. Total now 10 objects to delete.

| Delete (lower quality) | Keep | Category | Note |
|------------------------|------|----------|------|
| `aspen-snowmass-s7` (4.78) | `aspen` (4.97) | skiing | Apr 23 P1 |
| `arapahoe-basin-s9` | `abasin` | skiing | Apr 23 P1 — exact lat/lon match |
| `anchor-point-s19` | `anchor_point` | surfing | Apr 23 P1 |
| `taghazout-s10` | `taghazout` | surfing | Apr 23 P1 |
| `pasta-point-s24` | `pasta_point` | surfing | Apr 23 P1 — wrong tag (right vs left) |
| `pigeon-point-t27` | `beach_tobago` | tanning | Apr 23 P1 |
| `siargao` | `cloud9` | surfing | **NEW** — siargao added Apr 23 without noticing cloud9 exists |
| `snappers-gold-coast-s26` | `snapper_rocks` | surfing | **NEW** — same break, different ID |
| `aruba-eagle-beach-t1` | `beach_eagle` | tanning | **NEW** — 0.03° apart, same beach |
| `fernando-de-noronha-s20` | `noronha_surf` | surfing | **NEW** — third entry for this location; `beach_noronha` (tanning) is a separate cross-category entry and acceptable to keep |

Deleting these 10 lines: 237 → 227 venues. Health score +10.

---

### P2 🟡 — 3 DUPLICATE PHOTO URLs (new finding, missed in Apr 23 audit)

| Photo ID | Venue A | Venue B |
|----------|---------|---------|
| `photo-1507525428034-b723cf961d3e` | `angourie-point-s3` (Angourie Point) | `arugam_bay` (Arugam Bay) |
| `photo-1520175462-89499834c4c1` | `portillo-s4` (Portillo) | `perisher` (Perisher Blue) |
| `photo-1540202404-a2f29016b523` | `beach_praslin` (Anse Lazio) | `beach_phuquoc` (Long Beach Phu Quoc) |

**Quick fix for each:** swap the lower-priority venue's photo URL to a fresh Unsplash photo. Example replacements:
- `angourie-point-s3` → `photo-1528543606781-2f0dcc3a9faf?w=800&h=600&fit=crop`
- `portillo-s4` → `photo-1491555103944-7c647fd857e6?w=800&h=600&fit=crop`
- `beach_phuquoc` → `photo-1528127269322-539801943592?w=800&h=600&fit=crop`

---

### P3 🟡 — 36 APs MISSING FROM `AP_CONTINENT` (continent filter bug)

When a user filters by continent, `AP_CONTINENT[l.ap]` returns `null` for these venues → they vanish silently. 36 venues affected (~15% of catalog).

**Missing mappings to add to `AP_CONTINENT`:**

```javascript
// Europe (add to europe block)
KRK:"europe", EXT:"europe", OSL:"europe", MXX:"europe", EAS:"europe", JNX:"europe",
TPS:"europe", RHO:"europe", DLM:"europe", GMP:"europe", TRG:"europe", MAN:"europe",

// Asia
AXT:"asia", NGO:"asia", GMP:"asia", CMB:"asia", DAD:"asia", PQC:"asia",
IAO:"asia", VRC:"asia", MNL:"asia", BNK:"oceania",

// Oceania
BNK:"oceania", TRG:"oceania",

// North America / Caribbean
OAJ:"na", SNA:"na", GEG:"na",

// South America
ZPC:"latam", USH:"latam", MDZ:"latam", ZPC:"latam",

// Africa
INH:"africa", LEA:"oceania", MCT:"asia", BOB:"oceania",

// Other
MGA:"na", YKA:"na", SBA:"na", RDD:"na",
```

**Correct grouped additions (paste into AP_CONTINENT):**

```javascript
// Europe additions
KRK:"europe", EXT:"europe", OSL:"europe", MXX:"europe", EAS:"europe",
JNX:"europe", TPS:"europe", RHO:"europe", DLM:"europe",
// Asia additions
AXT:"asia",  NGO:"asia",  GMP:"asia",  CMB:"asia",  DAD:"asia",
PQC:"asia",  IAO:"asia",  VRC:"asia",  MNL:"asia",  TOD:"asia",
// Oceania additions
BNK:"oceania", TRG:"oceania", LEA:"oceania",
// North America additions
OAJ:"na", SNA:"na", GEG:"na", YKA:"na", SBA:"na", RDD:"na", MGA:"na",
// South America additions
ZPC:"latam", USH:"latam",
// Africa additions
INH:"africa", WVB:"africa",
// Middle East / Indian Ocean
MCT:"asia", BOB:"oceania",
```

---

### P4 🟢 — 28 SKIING VENUES MISSING `skiPass` (s-series batch)

Unchanged from Apr 23. Safe default: patch all 28 as `skiPass:"independent"`. Exceptions confirmed in Apr 23 report (Kicking Horse, Big White, Sun Peaks, Stowe → likely Ikon).

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Est. AOV | Status |
|----------|-------|---------|--------|
| skiing | 4 | ~$75 | ⚠️ No ski hardware — add high-AOV items (skis $600+, pack $130) |
| surfing | 6 | ~$67 | ✅ Good |
| tanning | 4 | ~$27 | ✅ Adequate |

Skiing gear expansion from Apr 23 report still not applied. Paste-ready block unchanged — see Apr 23 report.

---

## 3. SEASONAL RELEVANCE — May 2, 2026

### Skiing — All 72 venues off-season
- **NH (62 venues):** Closed. Algorithm returns score 8 "Off-season" correctly.
- **SH (8 venues — Remarkables, Portillo, Pucon, Thredbo, Cerro Castor, Treble Cone, Las Leñas, Perisher):** Pre-season. SH ski opens June–July. Algorithm handles.
- **Zermatt:** Klein Matterhorn glacier skiing runs year-round but at reduced capacity. Will score from live snowpack.
- **PM note:** Skiing tab is dead in May. Consider pinning a "Coming June" contextual banner for SH ski venues.

### Surfing — 54/77 in prime season

| Region | Condition | Notes |
|--------|-----------|-------|
| Indonesia (Uluwatu, Padang Padang, G-Land, Mentawai) | **Peak** | SE trades on; dry season through Oct |
| Morocco (Taghazout, Anchor Point) | **Prime winding down** | Atlantic swell season peaks Oct–Apr; still good May |
| Maldives (Pasta Point) | **Good** | SW monsoon approaching; peak surf May–Oct |
| Arugam Bay, Sri Lanka | **Opening** | SW monsoon surf season begins May |
| North Atlantic (Thurso, Lahinch, Newquay) | **Marginal** | Water 11°C, wetsuits required |
| High-lat Southern Hemisphere (Jeffreys Bay, Punta Lobos) | **Peak** | SH winter swell building; J-Bay WSL event window Jun–Aug |

### Tanning — 84/88 in season

Three SH-autumn venues currently fading: **Praia Mole** (Brazil, −27°S), **Tofo Beach** (Mozambique, −24°S), **Hyams Beach** (Australia, −35°S). Their scores will reflect cooling conditions — algorithm handles correctly.

---

## 4. CONTENT QUALITY

**Coordinate spot-check (new t/s-series venues):**
- `muscat-beach-t26` Oman: 23.588°N, 58.397°E ✅ (Muscat Beach near Al Qurum)
- `an-bang-beach-t29` Vietnam: 15.921°N, 108.337°E ✅ (Hội An coast, correct)
- `pigeon-point-t27` Tobago: 11.167°N, 60.833°W ✅ (correct, but DUPLICATE of `beach_tobago`)
- `aruba-eagle-beach-t1` Aruba: 12.562°N, 70.056°W ✅ (correct, but DUPLICATE of `beach_eagle`)

**Tag accuracy issues on batch-gen entries (safe to ignore if deleting them):**
- `pasta-point-s24`: tagged "Right-Hander" — Pasta Point is a LEFT-hander. Flagged Apr 23, still wrong.
- `anchor-point-s19`: tagged "Left-Hander" — Anchor Point Morocco is a RIGHT-hand point break.
- `snappers-gold-coast-s26`: title "Snappers Gold Coast" vs "Snapper Rocks" — inconsistent naming.

**Ratings sanity:**
- All 237 venues: min 4.50, max 4.99, avg 4.86. Range is realistic for a curated catalog.
- `muscat-beach-t26` at 4.71 is the lowest-rated venue — worth monitoring if it should be elevated or swapped.

---

## 5. NEW VENUE ADDITIONS — Geographic gaps in surfing/tanning

All 3 categories are healthy. Targeting geographic white space for May in-season additions. Skiing intentionally skipped (all off-season).

**Add all 5 below to `VENUES` array after the last tanning entry:**

```javascript
  {id:"skeleton_bay",  category:"surfing",  title:"Skeleton Bay",           location:"Swakopmund, Namibia",       lat:-22.6167,lon:14.4167,  ap:"WVB", icon:"🌊",rating:4.93,reviews:710, gradient:"linear-gradient(160deg,#1a1a0a,#4a3a00,#8a6a00)", accent:"#c8a442", tags:["World's Longest Left","Desert Barrel","Fog Belt","Expert Only"],   photo:"https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=600&fit=crop", facing:315},
  {id:"lagundri_bay",  category:"surfing",  title:"Lagundri Bay, Nias",     location:"North Sumatra, Indonesia",  lat:0.5233, lon:97.8433,   ap:"GNS", icon:"🌊",rating:4.91,reviews:1240,gradient:"linear-gradient(160deg,#002244,#004488,#0066cc)",          accent:"#2288ee", tags:["Legendary Right","Consistent Barrel","Intermediate+","Remote"],   photo:"https://images.unsplash.com/photo-1516030635254-6e2ba01b1285?w=800&h=600&fit=crop", facing:215},
  {id:"elafonissi",    category:"tanning",  title:"Elafonissi Beach",       location:"Crete, Greece",             lat:35.2667,lon:23.5333,   ap:"CHQ", icon:"🏖️",rating:4.94,reviews:5840,gradient:"linear-gradient(160deg,#003344,#005577,#007baa)",          accent:"#33aacc", tags:["Pink Sand Lagoon","Shallow Wading","Wildflowers","UNESCO Buffer"],photo:"https://images.unsplash.com/photo-1586500036706-41963de0a65f?w=800&h=600&fit=crop"},
  {id:"exuma_cays",    category:"tanning",  title:"Exuma Cays",             location:"Bahamas",                   lat:23.5167,lon:-75.8167,  ap:"GGT", icon:"🏝️",rating:4.97,reviews:3120,gradient:"linear-gradient(160deg,#003355,#0055aa,#0088cc)",          accent:"#33aadd", tags:["Swimming Pigs","Nurse Sharks","Sandbars","Ultra-Clear Water"],  photo:"https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop"},
  {id:"la_grave",      category:"skiing",   title:"La Grave",               location:"Hautes-Alpes, France",      lat:45.0306,lon:6.3028,    ap:"GNB", icon:"🎿",rating:4.95,reviews:1640,gradient:"linear-gradient(160deg,#0c1430,#1e2c72,#3046c0)",          accent:"#6c88e2", skiPass:"independent", tags:["No Grooming","Expert Only","Heli Drop Terrain","3600m Vertical"], photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"},
```

**New APs to add to `AP_CONTINENT`:**
```javascript
WVB:"africa", GNS:"asia", CHQ:"europe", GGT:"na", GNB:"europe",
```

---

## One Observation for PM

**The duplicate problem is getting worse, not better.** April 23 identified 6 dupes and said "deleting 6 lines takes 5 minutes." Today there are 10. The April 23 run *added* `siargao` without checking that `cloud9` already existed at the same location — the agent created the problem it was supposed to fix. The next time a batch of venues is generated, this will happen again unless there's a pre-paste dedup check. The highest-ROI immediate action remains: delete the 10 confirmed duplicate IDs listed in P1 above (10 lines in app.jsx). Health score goes 72 → 82.
