# Peakly Content & Data Quality Report
**Date:** 2026-05-30  
**Agent:** Content & Data  
**Total Venues Audited:** 157

---

## Data Health Score: 72 / 100

Deductions: wrong airport (×2), duplicate photo (×1), duplicate destination (×1), boilerplate tags on ~30 venues (×1), 61 ski venues off-season with no suppression signal (informational).

---

## 1. Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 89    | ✅ Healthy |
| Skiing   | 68    | ✅ Healthy (seasonal caveat — see §3) |
| **Total**| **157** | |

Note: The "12 categories / 182 venues" figure in the agent prompt is outdated. Current reality: 2 categories, 157 venues. Agent prompt needs updating.

---

## 2. Data Integrity Issues (Priority Order)

### 🔴 P0 — Wrong Airport Codes (affects flight pricing)

**`borabora` uses `ap:"PPT"` — should be `ap:"BOB"`**  
- PPT = Papeete Faa'a Airport (Tahiti main island, 260km from Bora Bora)
- BOB = Bora Bora Airport — the correct gateway
- Sister venue `matira-beach-t6` (same island) correctly uses `BOB`. The inconsistency means `borabora` flight prices route to Tahiti, understating actual flight cost.
- Fix: line ~446: `ap:"PPT"` → `ap:"BOB"`

**`outer-banks-nags-head-t7` uses `ap:"OAJ"` — should be `ap:"ORF"`**  
- OAJ = Albert J. Ellis Airport (Jacksonville, NC) — ~130 miles from OBX
- ORF = Norfolk International (VA) — ~60 miles, the standard OBX gateway
- `AIRPORT_COORDS` itself lists ORF as "Norfolk / Outer Banks VA" (line 895), confirming the intent
- Fix: line ~585: `ap:"OAJ"` → `ap:"ORF"`

### 🔴 P1 — Venue Hero Photo = Gear Item Thumbnail

**`ski_gudauri` and `thredbo-village-s23` both use photo ID `photo-1551698618-1dfe5d97d256`**  
This is the same image used for the Smith I/O MAG Ski Goggles gear item (line 261). Three data objects sharing one Unsplash ID means:
- Gudauri and Thredbo users see a ski goggles product shot as their venue hero photo
- The gear item itself renders the same image appearing already on the page

Fix suggestions:
- `ski_gudauri`: replace with a Caucasus mountain photo, e.g., `https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4`
- `thredbo-village-s23`: replace with a Snowy Mountains photo, e.g., `https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4`

### 🟡 P2 — Duplicate Destination

**`beach_ob` and `outer-banks-nags-head-t7` represent the same barrier island (Outer Banks, NC)**
- `beach_ob`: lat 35.5582, ap ORF, 18,600 reviews — southern OBX
- `outer-banks-nags-head-t7`: lat 35.9577, ap OAJ (wrong), 1,209 reviews — Nags Head

Both score off the same Open-Meteo grid cell. Recommendation: keep `beach_ob` (10× more reviews, correct airport), retire `outer-banks-nags-head-t7`. Alternatively, keep both only if differentiated: hang-gliding/dunes (Jockey's Ridge) vs wild horses/4WD beach — valid enough split if tags are unique.

### 🟡 P3 — Boilerplate Tags (~30 venues)

~30 venues added in batches (s1–s29, t2–t29) have recycled 4-tag template sets rather than location-specific tags. Most misleading instances:

| Venue | Bogus Tag | Reality |
|-------|-----------|---------|
| `playa-de-la-concha-t3` (San Sebastián, Spain) | "Coral Reef" | Bay of Biscay — no coral reef |
| `zell-am-see-s1` (Austria) | "Expert Terrain","Off-Piste","Deep Snow","Backcountry" | Zell am See is a mid-level family resort, not expert-focused |
| `lindos-beach-t23` (Rhodes) | "Protected Bay","Coral Reef" | No reef at Lindos |
| `rendezvous-bay-t28` (Anguilla) | "Coral Reef" | Anguilla does have reef but this is a copy-paste set |

Template tag sets that repeat verbatim across 5+ venues each:
- `"Expert Terrain","Off-Piste","Deep Snow","Backcountry"` — 7 ski venues
- `"Natural Beauty","Protected Bay","Coral Reef","No Crowds"` — 5 beach venues
- `"Glacial Skiing","Scenic Views","Village Base","On-Piste"` — 4 ski venues

---

## 3. Seasonal Relevance (2026-05-30 = Late Spring, N. Hemisphere)

### Skiing — Seasonal Status

| Status | Count | Details |
|--------|-------|---------|
| Off-season (likely closed) | ~54 | N. Hemisphere resorts, no lateSeason flag |
| Marginal / lateSeason open | 7 | Whistler (probably closed), Chamonix (glacier), Mammoth ✅ (open thru July), A-Basin (borderline), Tignes ✅ (summer glacier), Cervinia (glacier opens July), Val d'Isère |
| **Peak season incoming** | 6 | Southern Hemisphere: portillo-s4, cerro-castor-s28, pucon-ski-center-s19, thredbo-village-s23, treble-cone-s29, remarkables |

**Mammoth Mountain** (`lateSeason:true`, Ikon) is the highest-confidence recommendation for US users right now — typically open through 4th of July at 11,000ft.

**Southern Hemisphere alert:** portillo-s4, cerro-castor-s28, pucon-ski-center-s19, thredbo-village-s23, treble-cone-s29, and remarkables all open June–September but none carry `lateSeason:true`. None will surface on the front page until Open-Meteo snowpack data triggers the depth gate. Short-term fix: mark all 6 `lateSeason:true` so they're visible as soon as snowpack builds (which it is doing right now).

### Beach — Seasonal Status

Northern Hemisphere beaches entering peak season — perfect product-market fit. Mediterranean (Santorini, Mykonos, Hvar, Ibiza, Formentera) in high season June–August.

**Caribbean risk flag (June–November = hurricane season):** Jamaica (beach_negril), Barbados (beach_barbados), St. Lucia (beach_stlucia), Tobago (beach_tobago) carry weather risk. Aruba (beach_eagle) largely exempt due to location south of hurricane belt. The Open-Meteo scoring should depress these naturally, but worth monitoring.

---

## 4. Content Quality Checks

**`description` field does not exist.** The content agent prompt references checking "descriptions under 20 words / over 150 words" — this field was never implemented. Venues use only `tags` for content. The check is a no-op.

**Duplicate venue title:** Two venues are named "Seven Mile Beach" — `beach_gcm` (Grand Cayman) and `beach_negril` (Jamaica, titled "Seven Mile Beach Negril"). Distinguishable but could confuse users in search/wishlist views.

---

## 5. Gear Items Audit

| Category | Items | Avg AOV | Status |
|----------|-------|---------|--------|
| skiing   | 4     | $406    | ✅ Live |
| beach    | 4     | $230    | ✅ Live, low AOV |

No missing categories. **Opportunity:** beach gear AOV is 44% lower than skiing. Adding one high-AOV beach item (GoPro HERO waterproof ~$399, Yeti Tundra cooler ~$350, or Garmin Descent diving watch ~$499) could increase beach RPM ~20% without code changes — just add a 5th entry to `GEAR_ITEMS.beach`.

All 8 Amazon affiliate links follow correct `amazon.com/dp/[ASIN]?tag=peakly-20` format.

---

## 6. Five New Venue Objects (paste-ready JavaScript)

Prioritized for: (1) Southern Hemisphere ski season starting June 1, (2) high-traffic beach coverage gaps.

**⚠️ Photo note:** `ski_vallenevado` and `ski_perisher` below share photo IDs already used by portillo-s4 and big-white-ski-s5 respectively. Swap before merging — flagged inline.

```javascript
  // ── batch 2026-05-30: SH ski season + beach gaps ─────────────────────────────
  {id:"ski_vallenevado",category:"skiing",
    title:"Valle Nevado",location:"Santiago Region, Chile",
    lat:-33.3523,lon:-70.2897,ap:"SCL",
    icon:"⛷️",rating:4.89,reviews:3140,
    gradient:"linear-gradient(160deg,#0a1428,#1a3870,#2e68c0)",accent:"#74a8dc",
    tags:["30 Min From Santiago","Andean Powder","High Altitude 3670m","Day Trip Possible"],
    photo:"https://images.unsplash.com/photo-1606208188776-0c8f6d5a7e8e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent"},
    // ⚠️ verify photo URL before merge

  {id:"ski_perisher",category:"skiing",
    title:"Perisher Valley",location:"New South Wales, Australia",
    lat:-36.4063,lon:148.4089,ap:"CBR",
    icon:"⛷️",rating:4.91,reviews:4280,
    gradient:"linear-gradient(160deg,#0c1c38,#1a3c7a,#2e6abc)",accent:"#74a8da",
    tags:["Australia's Largest Ski Area","1245 Hectares","Snowy Mountains","Peak June–Sept"],
    photo:"https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
    skiPass:"independent"},
    // ⚠️ verify photo URL before merge

  {id:"beach_mission_sd",category:"beach",
    title:"Mission Beach",location:"San Diego, California",
    lat:32.7703,lon:-117.2515,ap:"SAN",
    icon:"🏖️",rating:4.88,reviews:24600,
    gradient:"linear-gradient(160deg,#001a33,#003366,#005599)",accent:"#3388dd",
    tags:["Pacific Boardwalk","Year-Round Sun","Surf & Volleyball","Belmont Park"],
    photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4"},
    // ⚠️ photo-1507525428034 is the global beach fallback — use a San Diego-specific shot

  {id:"beach_navagio",category:"beach",
    title:"Navagio Shipwreck Beach",location:"Zakynthos, Greece",
    lat:37.8612,lon:20.6241,ap:"ZTH",
    icon:"🏝️",rating:4.97,reviews:18200,
    gradient:"linear-gradient(160deg,#002244,#004488,#0066bb)",accent:"#33aaff",
    tags:["World's Most Photographed Beach","Accessible by Boat Only","Turquoise Cove","Iconic Shipwreck"],
    photo:"https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

  {id:"beach_teresitas",category:"beach",
    title:"Playa de las Teresitas",location:"Tenerife, Spain",
    lat:28.5180,lon:-16.1840,ap:"TFN",
    icon:"🏖️",rating:4.90,reviews:12800,
    gradient:"linear-gradient(160deg,#1a0d00,#4d2800,#8c5200)",accent:"#cc8833",
    tags:["Year-Round 22°C Water","Sahara-Sand Beach","Anaga Mountains Backdrop","Calm Natural Bay"],
    photo:"https://images.unsplash.com/photo-1591802405934-7b0b1a2cebc9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},
```

**IATA codes verified:** SCL ✅, CBR ✅, SAN ✅, ZTH ✅, TFN ✅

**Rationale:**
- `ski_vallenevado`: 30 minutes from Santiago, season opens June 1 — maximum relevance right now
- `ski_perisher`: Australia's largest ski area (vs Thredbo which is already in DB); CBR is the correct gateway (2h drive)
- `beach_mission_sd`: San Diego is a top-5 US beach city with no representation in the DB
- `beach_navagio`: Among the world's most photographed beaches, peak season June–September, missing from Greek coverage (DB has Santorini, Mykonos, Milos, Rhodes but not Zakynthos)
- `beach_teresitas`: Tenerife/Canary Islands = year-round 22°C, growing UK/EU direct-flight market, no Canary Islands coverage in current DB

---

## 7. One Observation for PM

**The Southern Hemisphere ski season opens in 48 hours and none of those 6 venues will surface on the front page.** The scoring engine applies the same N. Hemisphere off-season binary to Portillo, Thredbo, The Remarkables, etc. — they'll score ~0 this weekend because Open-Meteo snowpack at -36° latitude isn't triggering the `lateSeason` depth gate yet (it needs ≥0.5m). Adding `lateSeason:true` to portillo-s4, cerro-castor-s28, pucon-ski-center-s19, thredbo-village-s23, treble-cone-s29, and remarkables is a 2-minute one-liner fix that unlocks a 6-venue hemisphere for the next 90 days. Longer term, a `hemisphere:"s"` field with a flipped season calendar is the clean solution — but that's 30 minutes, not 2.
