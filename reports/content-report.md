# Content & Data Quality Report — 2026-06-01

**Agent:** Content & Data  
**Data health score: 85/100**

**Score breakdown:**  
Zero duplicate IDs +10 | All required fields on 157 venues +10 | All photos present +8 | GEAR_ITEMS live (both categories) +8 | ❌ Duplicate photo URL (thredbo + gudauri) −4 | ❌ Wrong tag "Coral Reef" on playa-de-la-concha-t3 −3 | ❌ Wrong airport on outer-banks-nags-head-t7 (OAJ vs ORF) −2 | ❌ 29 ski venues missing skiPass field (carry-forward) −6 | ❌ Generic copy-pasted tag sets on 5+ s-series ski venues −2

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 157 venues total

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 89    | ✅ Healthy (56.7%) |
| Skiing   | 68    | ✅ Healthy (43.3%) |
| **TOTAL** | **157** | |

> Note: The task prompt referenced "182 venues, 12 categories." Stale. Project pivoted 2026-05-03 to 2 categories (skiing + beach) only. Surfing retired. All stubs eliminated.

### Duplicate IDs — NONE ✅
Boot-time IIFE validator active at `app.jsx:684`.

### Duplicate Photo URLs — 🔴 ONE CONFIRMED

`thredbo-village-s23` (line 573) and `ski_gudauri` (line 667) both use Unsplash ID `photo-1551698618-1dfe5d97d256`. This ID also appears in the skiing gear item thumbnail (Smith goggles, line 261 — minor, different crop). Direct bash grep confirms; prior reports incorrectly marked this clean.

**Fix:** Swap `ski_gudauri` photo to a distinct Caucasus/Georgia mountain shot, e.g.:
```
photo:"https://images.unsplash.com/photo-1548704510-9b59e9e04b2c?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"
```

### Required Fields — PASS ✅
All 157 venues have: `id`, `category`, `lat`, `lon`, `ap`, `tags`, `photo`, `rating`, `reviews`, `gradient`, `accent`, `icon`.

### skiPass Coverage — 🔴 29 Skiing Venues Missing

The full s-series batch (added after original named venues) lacks `skiPass`. Affects pass-type filter UX for 43% of the skiing catalogue.

Paste-ready assignments:
- `big-white-ski-s5`: `"ikon"` | `kicking-horse-s10`: `"ikon"` | `stowe-mountain-s14`: `"epic"`
- Remaining 26 (`appi-kogen-s2`, `hemsedal-s3`, `portillo-s4`, `idre-fjall-s6`, `kiroro-snow-world-s11`, `morzine-s12`, `sainte-foy-tarentaise-s13`, `champoluc-monterosa-s15`, `val-d-isere-s16`, `sun-peaks-resort-s17`, `pucon-ski-center-s19`, `les-arcs-s20`, `powder-mountain-s21`, `madarao-mountain-s22`, `thredbo-village-s23`, `nevis-range-s24`, `tsugaike-kogen-s25`, `mount-shasta-ski-s26`, `lech-zurs-s27`, `cerro-castor-s28`, `treble-cone-s29`, `zell-am-see-s1`, `ski_mzaar`, `ski_oukaimeden`, `ski_gudauri`, `ski_bansko`): `"independent"`

### Tag Accuracy Flags

🔴 `playa-de-la-concha-t3` — tags include `"Coral Reef"`. San Sebastián is a cold Atlantic bay at 43°N. No reef exists. Replace with: `"World's Most Beautiful Urban Beach","Protected Concha Bay","Basque Food Capital Doorstep","Calm Atlantic Swimming"`.

🟡 Five s-series ski venues share the **identical** generic tag set `["Expert Terrain","Off-Piste","Deep Snow","Backcountry"]`: `zell-am-see-s1`, `kiroro-snow-world-s11`, `idre-fjall-s6`, `powder-mountain-s21`, `mount-shasta-ski-s26`. Copy-paste artifact. Each deserves at least 1 venue-specific signature tag.

### Airport Accuracy Flag

🟡 `outer-banks-nags-head-t7` — uses `ap:"OAJ"` (Jacksonville NC, ~110 mi). The existing `beach_ob` correctly uses `ap:"ORF"` (Norfolk VA, ~85 mi) — the standard OBX gateway. Should be `ORF`.

### Val d'Isère Near-Duplicate (carry-forward from 05-31 report)

`tignes` (line 489): "Tignes / Val d'Isère" · `lateSeason:true`  
`val-d-isere-s16` (line 567): "Val d'Isere" · `lateSeason:true`  
Both share `ap:"GVA"` and same Espace Killy ski domain. Consider deleting `val-d-isere-s16` and folding its best tags into `tignes`. Net: -1 venue, 0 information loss.

### Coordinate Spot Checks — PASS ✅
Sampled 15 venues across continents; all lat/lon verified accurate for claimed locations.

---

## 2. GEAR ITEMS AUDIT

| Category | Items | Top AOV Item | Avg AOV | Status |
|----------|-------|-------------|---------|--------|
| skiing | 4 | Atomic Bent Chetler Skis — $599 | $406 | ✅ Active |
| beach | 4 | Aqua Marina Inflatable SUP — $499 | $230 | ✅ Active |

All items use `tag=peakly-20`. ASIN formats valid. No dead links detected.

**No categories with zero gear items.** (Task prompt referenced "hiking" — not an active category.)

**Beach AOV improvement (paste-ready, carried forward from 05-31 report):**  
Swap `$45 Nautica Rashguard` for a GoPro — waterproof camera maps naturally to beach intent, lifts avg AOV from $230 to $307.

```javascript
// In GEAR_ITEMS.beach — replace the Nautica entry with:
{ title:"GoPro HERO12 Black Action Camera", desc:"Waterproof 33ft · HyperSmooth 6.0 stabilization", price:349,
  url:"https://www.amazon.com/dp/B0CDP1YLRH?tag=peakly-20",
  img:"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&h=120&fit=crop" },
```

---

## 3. SEASONAL RELEVANCE — June 1, 2026

### Northern Hemisphere Skiing — OFF SEASON
Standard NH season ended. ~61 venues should score near-zero. The 7 `lateSeason:true` venues:
- **Still viable in June:** Mammoth Mountain (CA), Arapahoe Basin (CO — famous through July 4), Tignes Grande Motte glacier (FR), Val d'Isère glacier (FR)
- **Likely closed by now:** Whistler (~closes late April), Chamonix (~late April), Cervinia (borderline — glacier sometimes open June)

### Southern Hemisphere Skiing — 🟢 PEAK SEASON STARTING
These 6 venues are the **entire active ski inventory** on the front page this weekend:
- Cerro Castor (Argentina, `USH`) — open since ~May 15
- Remarkables + Treble Cone (New Zealand, `ZQN`) — opens mid-June
- Thredbo Village (Australia, `SYD`) — opens ~June 8
- Portillo + Pucon (Chile, `SCL`/`ZCO`) — opens late June

**Action:** Verify `scoreWeekend` surfaces these 6 venues confidently. If Skiing pill on Explore shows empty grid this weekend, that is a conversion problem (see PM Observation below).

### Northern Hemisphere Beaches — 🟢 PRIME
Mediterranean (June = peak), US Atlantic/Gulf (strong), Caribbean (year-round), Hawaii (year-round). 55+ beach venues scoring well.

### Southern Hemisphere Beaches — OFF SEASON
Florianópolis, Whitehaven, Cable Beach, Seychelles, Mauritius, Mozambique — June = winter/off. Scoring suppresses naturally.

### Monsoon Caution
`beach_railay`, `beach_phiphi`, `beach_kohsamui` (Andaman/Gulf monsoon May–Oct), `beach_goa` (monsoon Jun–Sep) — all will score near-zero automatically via Open-Meteo. No UI change needed; avoid editorial pushes of these during this window.

---

## 4. CONTENT QUALITY

### Tag Depth
App uses `tags` arrays (2–4 strings) in place of prose descriptions — by design, no `desc` field. Tags are overall strong. Exceptions:
- `playa-de-la-concha-t3`: wrong content (§1 above)
- 5 s-series ski venues: copy-paste identical tags (§1 above)
- 4 s-series beach venues from 05-31 report still outstanding: `turquoise-bay-t8`, `patara-beach-t18`, `lindos-beach-t23`, `rendezvous-bay-t28` (carry-forward — all use `["Natural Beauty","Protected Bay","Coral Reef","No Crowds"]`)

### Ratings Sanity
Range: 4.51–4.99. Mean: ~4.86. Synthetic ratings — known product decision. Portillo's 4.54 / 446 reviews reflects its boutique scale (accurate). Seychelles + Aitutaki at 4.99 = intentional prestige signal.

---

## 5. NEW VENUE OBJECTS — Copy-Paste Ready

Targeting geographic gaps: South Africa (zero beach venues), Rio de Janeiro (iconic, missing), Swedish Alpine skiing (Åre is the Nordic flagship), Argentina powder skiing (Las Leñas is Portillo-tier, currently in peak season), Dominican Republic (major Caribbean gap — zero DR venues).

```javascript
  // ── batch 2026-06-01: Cape Town · Rio · Åre · Las Leñas · Punta Cana ─────────
  {id:"beach_clifton",category:"beach",
    title:"Clifton 4th Beach",location:"Cape Town, South Africa",
    lat:-33.9368,lon:18.3775,ap:"CPT",
    icon:"🏖️",rating:4.94,reviews:12800,
    gradient:"linear-gradient(160deg,#002233,#004466,#006699)",accent:"#3399cc",
    tags:["Boulder-Framed Atlantic","Lion's Head Backdrop","Cape Town Glamour Beach","Calm Swimming Cove"],
    photo:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"beach_ipanema",category:"beach",
    title:"Ipanema Beach",location:"Rio de Janeiro, Brazil",
    lat:-22.9868,lon:-43.2022,ap:"GIG",
    icon:"🏖️",rating:4.91,reviews:38600,
    gradient:"linear-gradient(160deg,#002244,#004488,#0077bb)",accent:"#33aaff",
    tags:["Girl From Ipanema","Arpoador Sunset Rock","Dois Irmãos Twin Peaks","Rio's Cultural Heartbeat"],
    photo:"https://images.unsplash.com/photo-1516571748831-5d81767b788d?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

  {id:"ski_are",category:"skiing",
    title:"Åre Ski Resort",location:"Jämtland, Sweden",
    lat:63.3983,lon:13.0816,ap:"OSD",
    icon:"⛷️",rating:4.89,reviews:3420,
    gradient:"linear-gradient(160deg,#0c1c38,#1a3c7a,#2e6cbe)",accent:"#78aade",
    tags:["Sweden's #1 Resort","Scandinavian Après-Ski","2027 World Championship Venue","Nordic High Terrain"],
    photo:"https://images.unsplash.com/photo-1531329090067-c8a98a5a8a80?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
    skiPass:"independent"},

  {id:"ski_laslenas",category:"skiing",
    title:"Las Leñas Ski Resort",location:"Mendoza Province, Argentina",
    lat:-35.1500,lon:-70.0667,ap:"MDZ",
    icon:"⛷️",rating:4.92,reviews:2180,
    gradient:"linear-gradient(160deg,#001428,#003066,#0050aa)",accent:"#6699dd",
    tags:["World-Class Dry Andean Powder","Season Jun–Oct","Steep Off-Piste Backcountry","Southern Andes Epic"],
    photo:"https://images.unsplash.com/photo-1519003300449-424ad0405076?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
    skiPass:"independent"},

  {id:"beach_puntacana",category:"beach",
    title:"Bávaro Beach",location:"Punta Cana, Dominican Republic",
    lat:18.6834,lon:-68.4539,ap:"PUJ",
    icon:"🏖️",rating:4.90,reviews:34200,
    gradient:"linear-gradient(160deg,#003355,#005588,#0088cc)",accent:"#33bbee",
    tags:["20km White Sand Stretch","Year-Round Trade Winds","Turquoise Caribbean Lagoon","All-Inclusive Hub"],
    photo:"https://images.unsplash.com/photo-1569682734144-a6e1553cb4f3?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

**AP_CONTINENT entries required alongside (add to the block in app.jsx):**
```javascript
  CPT:"africa",  // Cape Town International → beach_clifton
  GIG:"latam",   // Rio Galeão International → beach_ipanema
  OSD:"europe",  // Åre Östersund Airport → ski_are
  MDZ:"latam",   // Mendoza El Plumerillo → ski_laslenas
  PUJ:"na",      // Punta Cana International → beach_puntacana (Caribbean = na)
```

---

## PM Observation

**It is June 1. The front page has a ski inventory crisis.** Of 68 skiing venues, ~61 are closed for the Northern Hemisphere summer. The 7 `lateSeason:true` venues shrink this weekly. The 6 Southern Hemisphere venues — Cerro Castor, Remarkables, Treble Cone, Thredbo, Portillo, Pucon — are the **entire active ski catalogue** right now (and Portillo/Pucon don't even open until late June). Confirm `scoreWeekend` is surfacing these SH venues with confidence ≠ `"low"`. If the Skiing pill on Explore returns a near-empty grid, that's a brand trust problem: the app promises ski weekends and then delivers nothing in the core season for European and US users.

Tactical options to consider:
1. **Quick win:** Add `lateSeason:true` to `cerro-castor-s28`, `remarkables`, `treble-cone-s29` — they deserve the flag as June is literally their peak season, not a late-season edge case.
2. **Editorial nudge:** Consider a "Southern Hemisphere season just opened" carousel (similar to "Best Right Now" but geographically framed) — surfaced only in June–September when NH skiing is dark.

---

*Report generated by content-data agent. Next run: 2026-06-02.*
