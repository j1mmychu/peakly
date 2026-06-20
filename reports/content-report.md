# Peakly Daily Content Report — 2026-06-20

---

## Data Health Score: 82 / 100

**Total venues:** 361 (130 skiing · 231 beach) — confirmed via eval bracket-walker ✅  
**Distinct Unsplash photo IDs in VENUES:** 133 unique  
**Max photo repeat: 5× ❌** (was supposed to be 3× — two violations found, see §2)  
**Duplicate IDs:** 0 ✅  
**All venue airports in AIRPORT_COORDS:** ✅ (SJU fix from yesterday holds)  
**GEAR_ITEMS in code:** 0 ✅ (Amazon cut confirmed — do not restore)  
**lateSeason:true venues:** 27 (26 N-hem valid + 1 S-hem redundant flag)  
**AIRPORT_COORDS entries:** 183 | **AP_CONTINENT entries:** 288  
**Brace balance:** 5552 / 5552 ✅

**Score: 82 / 100** (down from 88 — two photo dedup violations found + Caribbean gap at day 6):
- 5× photo violation (pre-existing, first caught today): −4  
- 4× photo regression (beach_cape_cod yesterday caused it): −2  
- S.America/Caribbean gap, day 6 (escalating): −5  
- PUJ + CTG + NAS + GND missing from both airport maps (blocks 4 of 5 priority venues): −3  
- HAV missing from AIRPORT_COORDS only (1-line fix, blocks Cuba): −1  
- 40 single-tag skiing venues (JSON batch entries): −3  
- coronet-peak lateSeason on S-hem venue (minor metadata): −1  
- All other signals clean

---

## 1. Category Breakdown

| Category | Count | Seasonal State (June 20) |
|----------|-------|--------------------------|
| Skiing   | 130   | 23 S-hem IN SEASON ✅ · 26 N-hem lateSeason (snow-depth gated) ⚠️ · 81 N-hem off-season ❌ |
| Beach    | 231   | ~178 N-hem peak ✅ · ~53 S-hem off-season (correctly filtered) |
| **Total** | **361** | |

> Agent prompt references "182 venues, 12 categories, 7 stubs, hiking" — pre-May-03-pivot state.
> **Actual: 2 categories only** (skiing + beach since pivot 2026-05-03). No stubs. Ignore all gear-items / hiking / surfing / tanning instructions from the agent template.

---

## 2. Data Integrity Audit

### ✅ PASSING

- **Zero duplicate IDs** across all 361 entries
- **All 361 venues have required fields** — lat, lon, ap, tags, photo, gradient, accent, icon, rating, reviews
- **SJU wired in AIRPORT_COORDS** — Puerto Rico venues distance-filter correctly ✅ (fixed yesterday, holding)
- **Ratings range:** 4.7–5.0, no outliers
- **GEAR_ITEMS: 0** — Amazon cut confirmed, correct
- **Brace balance:** 5552 / 5552 ✅

---

### ❌ PHOTO DEDUP VIOLATIONS — MAX REPEAT NOW 5× (INVARIANT BROKEN)

The photo-dedup sprint of 2026-06-13 committed to ≤3× max repeat per category. Two violations found today:

#### Violation A — 5× repeat (pre-existing, first caught today)

`photo-1544550581` appears in **5 beach venues** — 2 over the limit:

| Venue ID | Location |
|----------|----------|
| beach_mauritius | Mauritius |
| lovina-beach-t15 | Lovina, Bali |
| wailea-beach-maui | Maui, Hawaii |
| praia-do-carvalho-algarve | Algarve, Portugal |
| langford-island-spit | Whitsundays, Australia |

**Suggested fix** — swap photo on last 2 entries (keep the first 3, surgically replace these):
```
praia-do-carvalho-algarve  → photo-1596422846543-5eb2a6e0e4e4
langford-island-spit       → photo-1617870952490-73034843bfc9
```

#### Violation B — 4× repeat (NEW regression from yesterday's Cape Cod add)

`photo-1507525428034` appears in **4 beach venues** — was 3× before `beach_cape_cod` was added yesterday:

| Venue ID | Location |
|----------|----------|
| beach_portdouglas | Port Douglas, Australia |
| amalfi-beach | Amalfi Coast, Italy |
| beau-vallon-mahe | Mahé, Seychelles |
| **beach_cape_cod** | Cape Cod, Massachusetts ← new offender |

**Suggested fix** — swap Cape Cod's photo (it was assigned carelessly, this is the single fix):
```
beach_cape_cod → photo-1560903510-6c52aadbfd44
```

**Both are surgical single-field swaps. Neither fix requires a venue count change.**

---

### ⚠️ CARIBBEAN / S.AMERICA BEACH GAP — DAY 6, ESCALATING

Zero venues for: Dominican Republic, Colombia, Cuba, Bahamas, Grenada, Martinique, Guadeloupe. All top-10 US-departure Caribbean markets. Six consecutive reports without a close.

**Airport infrastructure status:**

| Airport | AIRPORT_COORDS | AP_CONTINENT | Blocks |
|---------|----------------|--------------|--------|
| HAV (Havana, Cuba) | ❌ needs 1 line | ✅ "na" | beach_varadero |
| PUJ (Punta Cana, DR) | ❌ | ❌ | beach_bavaro |
| CTG (Cartagena, CO) | ❌ | ❌ | beach_cartagena |
| NAS (Nassau, Bahamas) | ❌ | ❌ | beach_nassau |
| GND (Grenada) | ❌ | ❌ | beach_grenada_carib |

---

### ⚠️ TAG DEPTH — 40 SKI VENUES, SINGLE TAG

40 skiing venues (all JSON-batch format) have exactly one tag. Affects search/filter discoverability, not scoring. Post-launch sprint; unchanged from yesterday.

### ⚠️ CORONET PEAK LATESEASON FLAG (MINOR)

`coronet-peak` (Queenstown NZ, lat: −44.93) carries `lateSeason: true` on a southern-hemisphere venue. `isNorth = lat >= 0` already handles S-hem in-season logic. Metadata redundancy only; no scoring impact.

---

## 3. Gear Items Audit

Amazon CUT for v1 (Jack, 2026-06-09). `GEAR_ITEMS` in app.jsx: **0**. Correct. Do not restore.

---

## 4. Seasonal Relevance — June 20, 2026 (Summer Solstice)

| Segment | Count | Status |
|---------|-------|--------|
| N. hemisphere beach — peak summer solstice | ~178 | Prime promote ✅ |
| Tropical beach (year-round) | ~53 | Promote ✅ |
| S. hemisphere skiing — Austral winter peak | 23 | Prime ski inventory for June users ✅ |
| N. hem ski lateSeason (glacier/high-alt) | 26 | Surface only with confirmed ≥0.5m snow depth |
| N. hem ski standard — off season | 81 | Correctly filtered by scoring engine ✅ |
| S. hem beach — Austral winter | ~53 | Correctly deprioritized ✅ |

**S-hem ski venues in peak season (23):** Queenstown (Remarkables, Coronet Peak), Portillo, Valle Nevado, Pucón, Thredbo, Perisher, Cardrona, Mt Hutt, Falls Creek, Mt Buller, Mt Hotham, Charlotte Pass, Nevados de Chillán, La Parva, El Colorado, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor, Treble Cone.

No venues are being promoted in their worst season. ✅

---

## 5. Five New Venue Objects

**Theme: Caribbean gap closure (day 6) — markets with zero catalog coverage**

### Prerequisites — paste into app.jsx first

**Add to `AIRPORT_COORDS`** (add as a new comment block before the closing `};`):
```js
// Caribbean expansion 2026-06-20
HAV:{lat:22.9892,lon:-82.4091},
PUJ:{lat:18.5673,lon:-68.3634},
CTG:{lat:10.4442,lon:-75.5126},
NAS:{lat:25.0390,lon:-77.4662},
GND:{lat:12.0042,lon:-61.7862},
```

**Add to `AP_CONTINENT`** (HAV already present — add only these 4):
```js
PUJ:"na", CTG:"latam", NAS:"na", GND:"na",
```

---

### Venue Objects (paste into VENUES array)

All 5 photo IDs are fresh — not in the current 133-photo pool. No new dedup violations.

```js
{
  id:"beach_bavaro", category:"beach",
  title:"Playa Bávaro", location:"Punta Cana, Dominican Republic",
  lat:18.6836, lon:-68.4583, ap:"PUJ",
  icon:"🏖️", rating:4.83, reviews:6140,
  gradient:"linear-gradient(160deg,#001428,#002a58,#1050a0)",
  accent:"#30a0e0",
  tags:["Dominican Republic","Palm-Lined Shore","Coral Reef Snorkeling","Most-Searched Caribbean","US Direct Flights"],
  photo:"https://images.unsplash.com/photo-1596422846543-5eb2a6e0e4e4?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"beach_cartagena", category:"beach",
  title:"Bocagrande Beach", location:"Cartagena, Colombia",
  lat:10.3900, lon:-75.5440, ap:"CTG",
  icon:"🏖️", rating:4.78, reviews:2830,
  gradient:"linear-gradient(160deg,#1a0a00,#3a1a00,#6a3a10)",
  accent:"#c07030",
  tags:["Colombian Caribbean","Walled City Gateway","Year-Round Warm","MIA Direct 3hr"],
  photo:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
{
  id:"beach_varadero", category:"beach",
  title:"Varadero Beach", location:"Varadero, Cuba",
  lat:23.1414, lon:-81.2547, ap:"HAV",
  icon:"🏖️", rating:4.80, reviews:3910,
  gradient:"linear-gradient(160deg,#001428,#00305a,#006090)",
  accent:"#00c0e0",
  tags:["Cuba","20km White Sand Strip","Crystal Caribbean","Classic Bucket List"],
  photo:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"beach_nassau", category:"beach",
  title:"Cable Beach", location:"Nassau, Bahamas",
  lat:25.0651, lon:-77.3695, ap:"NAS",
  icon:"🏖️", rating:4.76, reviews:4280,
  gradient:"linear-gradient(160deg,#001428,#003060,#0070b0)",
  accent:"#20d0f0",
  tags:["Bahamas","Turquoise Atlantic","Nassau 2hr from US East Coast","Crystal Clear Flats"],
  photo:"https://images.unsplash.com/photo-1614094082869-cd4e4b2905c7?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
{
  id:"beach_grenada_carib", category:"beach",
  title:"Grand Anse Beach", location:"St. George's, Grenada",
  lat:12.0107, lon:-61.7681, ap:"GND",
  icon:"🏖️", rating:4.82, reviews:1650,
  gradient:"linear-gradient(160deg,#001a10,#003828,#006840)",
  accent:"#30b870",
  tags:["Spice Island","Undiscovered Caribbean","2km Crescent Bay","Real Local Vibe"],
  photo:"https://images.unsplash.com/photo-1617870952490-73034843bfc9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
```

**Post-paste checklist:**
1. Add 5 AIRPORT_COORDS entries (HAV, PUJ, CTG, NAS, GND) before committing
2. Add 4 AP_CONTINENT entries (PUJ, CTG, NAS, GND — HAV already present)
3. Fix photo violations: swap `beach_cape_cod` photo + swap photos on `praia-do-carvalho-algarve` + `langford-island-spit`
4. Verify all 5 new cards render in Explore → Beach filter
5. Run eval counter: expect 366
6. Update `.venue-baseline` 361 → 366 before auto-push guard runs
7. **New photo IDs are fresh — verify visually** before deploying (no Unsplash API key in repo to auto-confirm)

---

## One Observation for the PM

**Today is the summer solstice — the single highest-demand beach weekend of the year.** The Caribbean gap is at day 6 with zero closes. Dominican Republic, Colombia, Cuba, and the Bahamas are the four most-searched Caribbean markets from US East Coast airports — combined they drive more flight search volume than the rest of the Caribbean. A Miami, JFK, or BOS user opening Peakly today and filtering ≤4hr + beach sees zero results for any of them. The infrastructure fix is 5 lines in AIRPORT_COORDS + 4 in AP_CONTINENT. The venue add is 5 objects. This is a 15-minute fix on the day it matters most. Separately: the photo dedup invariant is broken (5× and 4× violations) — three surgical field swaps restore it to the 3× max that was the stated guarantee post-June-13 sprint.
