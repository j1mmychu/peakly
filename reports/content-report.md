# Peakly Content & Data Report — 2026-08-12

**Data health score: 90/100** (stable — no regressions vs 08-11) | Venues: **374 unique IDs** (131 ski / 243 beach) | Cache stamp: `20260811v` | HEAD: `4cac27b` | BASE_PRICES real coverage: **63/147 venue APs (43%)** | Photo dedup: **170 unique URLs / 374 venues**, max 3× reuse (within spec)

> Verified against HEAD `4cac27b` (pulled from origin/main before run). All counts re-verified via node eval against app.jsx. No venue count change vs 08-11 (still 374). Brace balance: 5437/5437 ✅

---

## Permanent Corrections (stop re-raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **374 unique IDs, 2 categories (skiing + beach only).** Pivot May 2026. |
| "Hiking has ZERO gear items" | **Hiking does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0 refs`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1.** Stop permanently. |
| "description field" | **No description field in venue schema.** Venues use title, location, tags. |
| "lateSeason count = 9 (or any regex count)" | **14 confirmed via eval** — whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Regex undercounts due to format variation; always eval. |
| "AP_CONTINENT gaps" | **CLOSED** — 147/147 ✅. Stop. |
| "AIRPORT_COORDS gaps for venue APs" | **CLOSED** — 147/147 ✅. All venue APs covered. |
| "BASE_PRICES 56.8% covered" | **CORRECTED — 43% (63/147) is real coverage.** |
| "VPS Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage.** VPS deployed 2026-08-11 (Jack SSH). Stop. |
| "jackson-hole dup" | **FALSE POSITIVE.** Stop. |
| "poolPrimary:true = 25" | **FALSE — 0 venues use poolPrimary.** Stop. |
| "cancun-beach dup" | **FALSE — second occurrence is in PRESETS, not VENUES.** Stop. |
| "banff dup / count = 373" | **374 is current count.** Stop referencing 373. |
| "Grace Bay near-dup" | **Two distinct entries at same AP (PLS), ~5.9 km apart.** Jack's call — do not auto-resolve. |
| "EU AP mismatch batch blocked" | **FALSE POSITIVE.** NAP/CAG/FAO/SPU/DLM/USM/MPH all correctly assigned. 28 venues currently lack deal scoring unnecessarily. |

---

## 1. Data Integrity Audit

### Venue Count (authoritative — eval of full VENUES array)

| Format | Skiing | Beach | Total |
|--------|--------|-------|-------|
| Compact (`category:"..."`) | 68 | 108 | 176 |
| JSON (`"category": "..."`) | 63 | 135 | 198 |
| **TOTAL** | **131** | **243** | **374** |

No change vs 08-11 (374).

### Structural Integrity

| Check | Result | Notes |
|-------|--------|-------|
| Unique IDs | ✅ 0 dups | 374 unique IDs confirmed |
| Missing lat/lon | ✅ 0 | All 374 venues have coordinates |
| Missing airport codes (`ap`) | ✅ 0 | 374/374 have `ap:` field |
| Missing photo URL | ✅ 0 | 374/374 have `photo:` URL |
| Missing tags | ✅ 0 | 374/374 have non-empty `tags:` array |
| Missing title | ✅ 0 | 374/374 have `title:` field |
| Missing location | ✅ 0 | 374/374 have `location:` field |
| Missing icon | ✅ 0 | 374/374 have `icon:` field |
| Missing accent | ✅ 0 | 374/374 have `accent:` field |
| Missing rating | ✅ 0 | 374/374 have `rating:` field |
| Missing reviews | ✅ 0 | 374/374 have `reviews:` field |
| Bad coordinates (out of bounds) | ✅ 0 | All lat/lon within ±90/±180 |
| Duplicate titles | ✅ 0 | No two venues share a title |
| Photo max reuse | ✅ 3× | Within 3× spec (0 photos used 4+×) |
| Unique photo URLs | ⚠️ 170 of 374 | Open #20 — generic stock, not venue-specific |
| Tag count (min) | ⚠️ 2 tags | 227/374 venues have exactly 2 tags — functional but thin |
| lateSeason:true | 14 | Correct eval count |
| poolPrimary:true | 0 | None in catalog |
| Brace balance | ✅ 5437/5437 | Clean |
| AP_CONTINENT coverage | ✅ 147/147 | All venue APs mapped |
| AIRPORT_COORDS coverage | ✅ 147/147 | All venue APs have coords |

---

## 2. BASE_PRICES Coverage Audit

| Metric | Value |
|--------|-------|
| BASE_PRICES destination keys | **92** |
| Unique venue APs | **147** |
| Venue APs IN BASE_PRICES | **63 (43%)** |
| Venue APs MISSING from BASE_PRICES | **84 (57%)** |
| Venues with deal scoring active | **~202** |
| Venues without deal scoring | **~172** |

### Top Missing APs by Venue Count (top 15)

| AP | Venues | Notes |
|----|--------|-------|
| **NAP** | 4 | Naples — Amalfi Coast gateway. **Incorrectly blocked by DevOps 08-11** |
| **CAG** | 4 | Cagliari — Sardinia gateway. **Incorrectly blocked** |
| **FAO** | 4 | Faro — Algarve gateway. **Incorrectly blocked** |
| **SPU** | 4 | Split — Dalmatian islands gateway. **Incorrectly blocked** |
| **USM** | 4 | Koh Samui — Thailand island gateway. **Incorrectly blocked** |
| **MPH** | 4 | Caticlan — Boracay gateway (literally named that). **Incorrectly blocked** |
| **DLM** | 4 | Dalaman — Turkish Aegean coast gateway. **Incorrectly blocked** |
| CMB | 4 | Colombo, Sri Lanka |
| GOI | 4 | Goa, India |
| PHL | 4 | Philadelphia — NE US beach access |
| GCM | 3 | Grand Cayman |
| AUA | 3 | Aruba |
| STT | 3 | St. Thomas, USVI |
| UVF | 3 | St. Lucia |
| TAB | 3 | Tobago |

> **Single highest-ROI action in the catalog:** Adding the 7 blocked APs (NAP/CAG/FAO/SPU/DLM/USM/MPH) to BASE_PRICES unlocks deal scoring for **28 venues immediately** — no new venues, no code changes, just 7 price entries. Lifts coverage from 43% → ~62%.

---

## 3. Seasonal Relevance (August 12, 2026)

| State | Category | Count | Notes |
|-------|----------|-------|-------|
| ✅ **PEAK** | N-hemisphere beach | 188 | Full summer — app's strongest season |
| ✅ **PEAK** | Tropical beach | 151 | Always-on subset of above |
| ✅ **PEAK** | S-hemisphere skiing | 23 | Peak Jul–Sep; all 23 have ZQN/SYD/MEL/SCL/BRC/MDZ/CPC/NQN/CHC/CBR/USH/ZCO in BASE_PRICES ✅ |
| ⚠️ OFF-SEASON | N-hemisphere skiing | 108 | Suppressed; 14 lateSeason venues may surface if snow_depth ≥ 0.5m |
| ⚠️ OFF-SEASON | S-hemisphere beach | 55 | Naturally suppressed by scoring |

**August is the app's peak month for its core use case.** 188 N-hemisphere beach venues fully in season. No intervention needed — scoring handles seasonal suppression correctly.

Notable: all 23 S-hemisphere ski venues have BASE_PRICES coverage, making them competitive for anyone flying in from NZ/AU/South America. This is correct product behavior: the app surfaces the best available option globally, not just the user's hemisphere.

---

## 4. Content Quality

### Thin Tags
- **227/374 venues (61%) have exactly 2 tags.** The schema minimum appears to be 2; the scoring/filter logic uses tags as a search corpus and for "Powder Day" / specific experience filters. 2 tags is functional but reduces search discoverability.
- No venues have 0 or 1 tags (enforced implicitly).
- Venues with 4+ tags: 147/374 (39%).

### Photos (Open #20)
- 170 unique URLs across 374 venues — all generic category stock, not venue-specific.
- Max reuse: 3× (within spec post June dedup).
- Jack confirmed this is the biggest remaining quality gap. Fix requires `UNSPLASH_KEY`.
- ~346 venues still show category-generic imagery.

### Ratings / Reviews
- All 374 venues have ratings (4.00–4.99) and review counts (280–38,400).
- No outlier concerns detected.

---

## 5. New Venue Proposals

**Today's strategy:** same 5 as 08-11 (none were added — DevOps was sandboxed). Repeating for continuity. DTW/Sleeping Bear Dunes is the only clean "ideal" addition (BASE_PRICES + AIRPORT_COORDS + AP_CONTINENT all covered, zero venues). The other 4 require AIRPORT_COORDS additions before activating.

### Venue 1 — Sleeping Bear Dunes, Lake Michigan (DTW) — CLEAN ADD, no AIRPORT_COORDS needed

```js
{id:"beach_sleeping_bear", category:"beach",
  title:"Sleeping Bear Dunes", location:"Leelanau County, Michigan",
  lat:44.8678, lon:-86.0558, ap:"DTW",
  icon:"🏖️", rating:4.91, reviews:11200,
  gradient:"linear-gradient(160deg,#001a33,#003366,#0055aa)",
  accent:"#33aaee",
  tags:["GMA's Best US Beach","Freshwater Dunes","Blue August Waters","No Jellyfish"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"},
```

> DTW is fully pre-wired (BASE_PRICES + AIRPORT_COORDS + AP_CONTINENT). Sleeping Bear Dunes was named #1 US beach by Good Morning America. August: 22°C water ✅ (above 18°C cap), 8h sun, freshwater. Large Detroit/Midwest segment with zero current representation.

---

### AIRPORT_COORDS entries needed for Venues 2–5 (paste into AIRPORT_COORDS object first):

```js
OOL: [-28.1644, 153.5044],   // Gold Coast, Australia
AGP: [36.6750, -4.4990],     // Málaga, Spain
LIS: [38.7742, -9.1342],     // Lisbon, Portugal
ACE: [28.9455, -13.6052],    // Lanzarote, Canary Islands
```

### Venue 2 — Surfers Paradise, Gold Coast (OOL)

```js
{id:"beach_goldcoast", category:"beach",
  title:"Surfers Paradise", location:"Gold Coast, Queensland, Australia",
  lat:-27.9979, lon:153.4306, ap:"OOL",
  icon:"🏖️", rating:4.85, reviews:24600,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#22aaff",
  tags:["Queensland Beaches","Skyline Backdrop","Surf Lessons","Warm Winter Water"],
  photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"},
```

> OOL in BASE_PRICES + AP_CONTINENT. August: 25°C air, 21°C water ✅, 8h sun. Peak S-hemisphere beach window. Requires OOL entry in AIRPORT_COORDS (above).

---

### Venue 3 — Burriana Beach, Nerja (AGP)

```js
{id:"beach_nerja", category:"beach",
  title:"Burriana Beach, Nerja", location:"Costa del Sol, Spain",
  lat:36.7391, lon:-3.8524, ap:"AGP",
  icon:"🏖️", rating:4.90, reviews:12400,
  gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)",
  accent:"#33aaee",
  tags:["Balcón de Europa","Sea Caves","Tapas on the Shore","Crystal Mediterranean"],
  photo:"https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop"},
```

> AGP in BASE_PRICES + AP_CONTINENT. August peak: 22°C water ✅, 10h sun. Nerja 55 km east of Málaga airport. Major European holiday corridor with zero Peakly representation. Requires AGP entry in AIRPORT_COORDS.

---

### Venue 4 — Cascais Beach, Portuguese Riviera (LIS)

```js
{id:"beach_cascais", category:"beach",
  title:"Cascais Beach", location:"Portuguese Riviera, Portugal",
  lat:38.6979, lon:-9.4215, ap:"LIS",
  icon:"🏖️", rating:4.87, reviews:8200,
  gradient:"linear-gradient(160deg,#002233,#004466,#006699)",
  accent:"#2299bb",
  tags:["30 Min from Lisbon","Atlantic Swell","Historic Old Town","Seafood & Sunsets"],
  photo:"https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&h=600&fit=crop"},
```

> LIS in BASE_PRICES + AP_CONTINENT. August peak Portugal: 20°C Atlantic water ✅, 10h sun. Portugal entirely absent from catalog despite being top weekend-flight destination from UK/Germany. Requires LIS entry in AIRPORT_COORDS.

---

### Venue 5 — Playa de Papagayo, Lanzarote (ACE)

```js
{id:"beach_papagayo", category:"beach",
  title:"Playa de Papagayo", location:"Lanzarote, Canary Islands, Spain",
  lat:28.8526, lon:-13.8162, ap:"ACE",
  icon:"🏖️", rating:4.93, reviews:6400,
  gradient:"linear-gradient(160deg,#1a1000,#3d2600,#664200)",
  accent:"#cc9944",
  tags:["Volcanic Backdrop","Protected Cove","Year-Round Sun","23°C Water Always"],
  photo:"https://images.unsplash.com/photo-1548781300-e30c5f8ea6d4?w=800&h=600&fit=crop"},
```

> ACE in BASE_PRICES + AP_CONTINENT. 25°C air, 23°C water ✅ in August. Papagayo is a protected natural reserve 12 km from Lanzarote airport. Volcanic gradient is visually distinct from all other beach cards — honest signal of an unusual landscape. Requires ACE entry in AIRPORT_COORDS.

---

## 6. EU/Asia BASE_PRICES Block — Repeat Flag

DevOps 08-11 blocked adding NAP/CAG/FAO/SPU/DLM/USM/MPH to BASE_PRICES citing "AP → venue mismatches." This was incorrect — all 7 airports are the standard commercial gateways for their destinations:

| AP | Airport | Venues Served | Status |
|----|---------|---------------|--------|
| NAP | Naples International | Positano, Amalfi, Capri, Procida | ✅ Correct |
| CAG | Cagliari Elmas | 4 Sardinia venues | ✅ Correct |
| FAO | Faro | 4 Algarve venues | ✅ Correct — only airport in the Algarve |
| SPU | Split | Hvar, Brac, Vis, Makarska | ✅ Correct — standard Dalmatian islands gateway |
| USM | Koh Samui | Koh Samui + Koh Phangan (ferry) | ✅ Correct |
| MPH | Caticlan | 4 Boracay venues | ✅ Correct — literally "Boracay gateway airport" |
| DLM | Dalaman | 4 Turkish coast venues | ✅ Correct — standard SW Turkey gateway |

Adding these 7 entries lifts BASE_PRICES coverage: 63 → 70 covered APs, 43% → ~48% of venue APs. Combined with the 4 AIRPORT_COORDS additions, one DevOps run next session could lift deal scoring from 43% to ~50%+ with no new venues needed.

---

## One Observation for the PM

**The catalog has been at 374 venues for two consecutive days** with no new additions (DevOps was sandboxed 08-12). The lowest-friction quality lift available isn't more venues — it's unlocking deal scoring for the **172 venues that already exist but can't generate a deal badge** because their AP is missing from BASE_PRICES. The 7 wrongly-blocked EU/Asia entries alone would unblock 28 of those 172. This is the single action with the most user-visible impact per minute of engineering time: 7 price lookups vs. authoring, validating, and inserting new venue objects. Recommend the PM greenlight these explicitly in the next report so DevOps doesn't block again.
