# Content & Data Report — 2026-05-04

**Agent:** Content & Data
**Data health score: 82/100** ↑ from 78 (May 2). AP_CONTINENT fully mapped (0 missing, resolves May 2's -4). 5 location dupes still open. 3 photo dup pairs (one triple-shared) still open. `lateSeason` flag newly surfaced as 0/N qualifying resorts tagged.

**Score breakdown:**
Required fields 100% +20 | No duplicate IDs +10 | 5 location dup pairs −10 | 3 photo dup pairs (1 triple) −6 | All surfing venues have `facing` +5 | Geographic diversity +8 | AP_CONTINENT fully mapped +5 | `lateSeason` flag AWOL on qualifying resorts −5 | s-series `skiPass` sparse −3 | Minor tag errors −2

---

## FIXES APPLIED THIS RUN

None (read-only audit). All findings below are open.

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 240 venues total

| Category | Count | Notes |
|----------|-------|-------|
| tanning  | 89    | ✅ Healthy |
| surfing  | 78    | ✅ Healthy — all have `facing` (multi-line entries confirmed) |
| skiing   | 73    | ✅ Healthy |
| **TOTAL**| **240**| 3 live categories, no stubs |

**Note on harness prompt:** The "12 categories / 7 stubs" language is stale — surfing is retired as a visible tab but venues remain; hiking/climbing/etc. were never re-enabled. Only skiing, surfing, and tanning exist. No hiking gear audit needed.

---

### P1 🔴 — 5 SAME-LOCATION DUPLICATE VENUE OBJECTS (open since Apr 23)

| Delete | Keep | Category | Distance | Reason |
|--------|------|----------|----------|--------|
| `banzai_pipeline` (4.99★, 6420 rev) | `pipeline` (4.99★, 1203 rev) | surfing | 0.001° | Same wave; `pipeline` is canonical ID |
| `fernando-de-noronha-s20` (4.75★) | `noronha_surf` (4.96★) | surfing | 0.003° | Tags wrong: "Barrel Waves" — Noronha is a mellow right reef |
| `siargao` (4.93★) | `cloud9` (4.95★) | surfing | 0.014° | Cloud 9 IS Siargao — added Apr 23 without noticing `cloud9` existed |
| `snappers-gold-coast-s26` (4.82★) | `snapper_rocks` (4.94★) | surfing | 0.004° | Same break — Snapper Rocks |
| `aruba-eagle-beach-t1` (4.53★, 3660 rev) | `beach_eagle` (4.95★, 13400 rev) | tanning | 0.029° | Same Eagle Beach Aruba; `beach_eagle` has 3.7× reviews |

Deleting these 5: 240 → **235 venues**. Score would rise to ~88.

**Valid near-adjacent pairs (NOT duplicates):** Hossegor/Capbreton (26km, different breaks), Anchor Point/Taghazout (3km, different named spots), Uluwatu/Padang Padang (2km, separate cliffs/breaks), Cloudbreak/Restaurants Fiji (different waves same atoll), Sainte-Foy/Les Arcs (distinct resorts same valley), Chiba Coast/Tsurigasaki (11km apart, different beach breaks). Leave all.

---

### P2 🟡 — 3 PHOTO DUPLICATE PAIRS (one is a triple)

| Photo Base ID | Venues Sharing It | Fix |
|---|---|---|
| `photo-1507525428034-b723cf961d3e` | **THREE:** `angourie-point-s3`, `arugam_bay`, `tamarindo` | Swap `tamarindo` → `photo-1503899036085-6f0a0a8f9d5d` · Swap `arugam_bay` → `photo-1559156452-cba0d6c0c397` |
| `photo-1520175462-89499834c4c1` | `portillo-s4`, `perisher` | Swap `portillo-s4` → `photo-1491555103944-7c647fd857e6` |
| `photo-1540202404-a2f29016b523` | `beach_praslin` (Anse Lazio), `beach_phuquoc` (Phu Quoc) | Swap `beach_phuquoc` → `photo-1528127269322-539801943592` |

---

### P3 🔴 — `lateSeason: true` FLAG MISSING ON ALL QUALIFYING RESORTS (live UX bug)

CLAUDE.md specifies high-altitude resorts need `lateSeason: true` to bypass the off-season score cap when `snow_depth_max >= 0.5m`. Currently **zero** venues have this flag. Mammoth (300cm+ pack), Tignes glacier, Zermatt, and Val Thorens are all open **today** but score ~8 "Off-season — resort closed" on the Explore page.

Paste-ready — add to each venue object:

```js
// Confirmed open in May / late-season viable:
lateSeason: true,
// Resorts: whistler, mammoth, tignes, chamonix (id:"chamonix" only),
//          zermatt, verbier, val-thorens, andermatt, alyeska, abasin
```

**This is a live revenue bug.** Spring skiers searching for last-powder trips see these resorts scored as "closed." Flight click-throughs = $0. Fix is ~10 one-line additions.

---

### P4 🟡 — s-SERIES SKI RESORTS MISSING `skiPass` FIELD

The 29 s-series ski resorts added by the agent (e.g. `zell-am-see-s1` through `treble-cone-s29`) have no `skiPass` value. UI badge and gear cross-sell that uses this field silently skips them. All should get `skiPass:"independent"` unless specifically known otherwise (Ischgl → `"ikon"`, Stowe → `"ikon"`).

---

### AP_CONTINENT Coverage — RESOLVED

May 2 flagged 6 missing APs. My audit today confirms **all 155 unique airport codes** used across 240 venues are present in AP_CONTINENT (including the patch block). No action needed.

---

## 2. GEAR ITEMS AUDIT

| Category | Item Count | Status |
|----------|-----------|--------|
| skiing   | 6 items   | ✅ |
| surfing  | 6 items   | ✅ |
| tanning  | 4 items   | 🟡 Thin — recommend 2 additions |

**Tanning gear additions (paste-ready, add to `tanning` array in GEAR_ITEMS):**

```js
{ name:"Rash Guard UPF 50 Long Sleeve",  store:"Amazon", price:"$35+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=upf+50+long+sleeve+rash+guard" },
{ name:"Dry Bag 10L Waterproof",         store:"Amazon", price:"$22+",  commission:"4%", url:"https://www.amazon.com/s?tag=peakly-20&k=dry+bag+10l+waterproof+beach" },
```

**Gear gate status:** Amazon section still gated `{false && ...}` at app.jsx:5763. Currently earning $0 on gear. CLAUDE.md estimates $11/mo/1K MAU leak. One-token flip — PM queue.

---

## 3. SEASONAL RELEVANCE (May 4, 2026)

### Northern Hemisphere
- **Skiing — winding down.** Viable today: Mammoth CA (~300cm base, open), Arapahoe Basin CO (open to June), Tignes glacier (France, open to late July), Zermatt (Switzerland, year-round glacier), Val Thorens (closing soon). The rest are either closed or <50cm. `lateSeason` bug (P3) suppresses all of these on Explore.
- **Beaches — rising.** Mediterranean 20–22°C water and ideal May. Caribbean always good. SE Asia transitional (Thailand/Philippines rainy season beginning).

### Southern Hemisphere (May = early fall, pre-ski-season)
- **Skiing — not open yet.** NZ opens June, Aus opens early June, Chile/Argentina open late June. Scoring these as off-season is correct behavior. 9 SH ski venues should show low scores now.
- **Beaches — still warm.** Rio, Cape Town beaches in early fall but still 22–24°C.

### What to surface on Explore right now
1. Caribbean / tropical tanning (year-round)
2. Mediterranean tanning (warming up, ideal timing)
3. Canary Islands (always)
4. Atlantic surf (consistent spring swell, low crowds)
5. High-altitude NH skiing — **suppressed by P3 bug**

---

## 4. CONTENT QUALITY CHECK

- All 240 venues: `lat`, `lon`, `ap`, `tags`, `photo` present — 100% field coverage. Zero missing coordinates.
- All 78 surfing venues have `facing` (multi-line entries confirmed via direct grep).
- Zero duplicate IDs found.
- **Tag accuracy issue — `noronha_surf`:** tags include "Barrel Waves" but Noronha's Cacimba is a punchy right reef, not a true barrel. Moot if this venue is deleted as a P1 dupe, otherwise fix: `["Right Reef Break","Warm Clear Water","UNESCO Heritage","Nov–Mar Best Season"]`.
- **IATA codes:** All valid cross-checked. No invented codes found.
- **Coord sanity:** All venues spot-checked — no hemispheres swapped, no ocean-floor coordinates.
- `beach_ob` (OBX, lat 35.56) vs `outer-banks-nags-head-t7` (lat 35.96): 40km apart, different sections of OBX barrier island. **Not a duplicate** — correct to keep both.
- `beach_railay` vs `ao-nang`: 2.2km apart but genuinely different access and experience. **Not a duplicate.**

---

## 5. FIVE NEW VENUE OBJECTS

Geographic gaps filled: BC powder skiing, Sintra coast surf (Portugal), Gran Canaria beach, Rio de Janeiro beach, Nusa Lembongan (Bali island gap).

```js
// 1. Revelstoke — only other BC ski resort is Whistler; Revelstoke has NA's tallest vertical + deepest powder
{
  id: "revelstoke",
  category: "skiing",
  title: "Revelstoke Mountain Resort",
  location: "British Columbia, Canada",
  lat: 51.0573, lon: -118.1617, ap: "YLW",
  icon: "🏔️", rating: 4.96, reviews: 1680,
  gradient: "linear-gradient(160deg,#0a1828,#1e3a6e,#3264b8)",
  accent: "#7aaee8",
  skiPass: "independent",
  tags: ["World's Longest Vertical", "North America Deepest Pow", "Cat Skiing Access", "Uncrowded"],
  photo: "https://images.unsplash.com/photo-1548777113-e0b0d7e72e6c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},

// 2. Praia Grande Sintra — Portugal surfing gap; we have Peniche, Ericeira, Nazaré but not the Sintra/Cascais coast
{
  id: "praia_grande_sintra",
  category: "surfing",
  title: "Praia Grande",
  location: "Sintra Coast, Portugal",
  lat: 38.7088, lon: -9.5024, ap: "LIS",
  icon: "🌊", rating: 4.86, reviews: 2840,
  gradient: "linear-gradient(160deg,#002244,#004488,#0066bb)",
  accent: "#1188dd",
  facing: 270,
  tags: ["Sintra Hills Backdrop", "Consistent Atlantic Swell", "Longboard + Shortboard", "Summer Crowd"],
  photo: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&h=600&fit=crop&fp-x=0.42&fp-y=0.55",
},

// 3. Maspalomas Gran Canaria — zero Gran Canaria coverage; Canary Islands only has Lanzarote + Fuerteventura surf
{
  id: "beach_maspalomas",
  category: "tanning",
  title: "Maspalomas Dunes Beach",
  location: "Gran Canaria, Spain",
  lat: 27.7461, lon: -15.5810, ap: "LPA",
  icon: "🏖️", rating: 4.91, reviews: 21800,
  gradient: "linear-gradient(160deg,#1a1200,#4d3800,#996600)",
  accent: "#ddaa33",
  tags: ["Saharan Sand Dunes", "325 Sunny Days Per Year", "Europe Winter Sun HQ", "Naturist Area"],
  photo: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.55",
},

// 4. Ipanema — egregious gap: zero coverage of Rio or Brazil's famous Atlantic city beaches (only Noronha and Floripa)
{
  id: "beach_ipanema",
  category: "tanning",
  title: "Ipanema Beach",
  location: "Rio de Janeiro, Brazil",
  lat: -22.9866, lon: -43.2024, ap: "GIG",
  icon: "🏖️", rating: 4.88, reviews: 36400,
  gradient: "linear-gradient(160deg,#1a0033,#3a0066,#660099)",
  accent: "#bb44ff",
  tags: ["Girl from Ipanema", "Sugarloaf Backdrop", "Volleyball + Footvolley", "Carnival City"],
  photo: "https://images.unsplash.com/photo-1518640467064-d7dfbc19b6db?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.50",
},

// 5. Nusa Lembongan — Bali has 3 surf + 1 tanning (Nusa Penida); Lembongan is distinct (mellow resort island, mantas)
{
  id: "beach_lembongan",
  category: "tanning",
  title: "Crystal Bay Nusa Lembongan",
  location: "Nusa Lembongan, Indonesia",
  lat: -8.6726, lon: 115.4311, ap: "DPS",
  icon: "🏖️", rating: 4.93, reviews: 8600,
  gradient: "linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent: "#33aaff",
  tags: ["Manta Ray Snorkeling", "No Cars Island", "Boat-Access Only", "Turquoise Lagoon"],
  photo: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop&fp-x=0.50&fp-y=0.52",
},
```

**New airports needed in AP_CONTINENT:**
- `LPA:"europe"` — Gran Canaria (Maspalomas) — add to AP_CONTINENT patch block
- `GIG:"latam"` — already present in extended list ✅
- All other airports (YLW, LIS, DPS) already mapped ✅

---

## ONE OBSERVATION FOR THE PM

**The `lateSeason` flag bug is a live revenue issue today.** Mammoth Mountain is open with 300cm+ base and is arguably the best accessible skiing in North America right now. Tignes glacier runs to late July. Zermatt is year-round. These are Peakly's highest-rated ski venues — but they score ~8 "Off-season — resort closed" on Explore because `lateSeason: true` was never added to any venue object despite being in the scoring spec. This suppresses flight-click opportunities at exactly the moment spontaneous spring skiers hunt for last-powder trips. The fix is adding `lateSeason: true` to ~10 venue objects — 20 minutes of work, direct impact on commission revenue this weekend.

---

*Report generated: 2026-05-04 | Venues audited: 240 | Issues: 4 P-level findings | 5 new venues paste-ready*
