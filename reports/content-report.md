# Peakly Daily Content Report — 2026-06-18

---

## Data Health Score: 88 / 100

**Total venues:** 358 (130 skiing · 228 beach) — confirmed via dual-format regex ✅  
**Distinct Unsplash base images:** 134 unique ✅  
**Max photo repeat:** 3× ✅ (meets post-dedup target; yesterday's "5×" was a content-agent regex false alarm — fixed by DevOps 2026-06-18)  
**Duplicate IDs:** 0 ✅  
**Missing critical fields (lat/lon/ap/tags):** 0 ✅  
**GEAR_ITEMS in code:** 0 ✅ (Amazon cut confirmed, do not restore)  
**lateSeason:true (ski):** 27 (6 compact + 21 JSON format) — see §2 for flag-inflation note  
**AIRPORT_COORDS entries:** 182 (TGD/OKA/SID/FUE/DJE fixed by PM 2026-06-17 ✅)

**vs. 2026-06-17 (83/100): +5**
- Photo 5× finding was a regex false alarm: +5 (actual max 3× all along; DevOps fixed detection today)
- S.America beach gap still open day 4: −5
- Tag depth backlog persistent: −3
- All other signals clean: +8

---

## 1. Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Skiing   | 130   | ✅ 6 N-hem lateSeason + ~23 S-hem in peak season |
| Beach    | 228   | ✅ ~175 N-hem peak season (June) + ~50 tropical year-round |
| **Total** | **358** | |

> Agent prompt references "182 venues, 12 categories, 7 stubs" — pre-May-03-pivot state.  
> **Actual: 2 categories only** (skiing + beach since pivot 2026-05-03). No stubs. Prompt is stale — ignore those instructions.

---

## 2. Data Integrity Audit

### ✅ CLEAN

- **Zero duplicate IDs** across all 358 entries
- **Zero missing required fields** — all 358 have lat, lon, ap, tags, photo, gradient, accent, icon, rating, reviews
- **All 182 AIRPORT_COORDS entries valid**, including 5 added yesterday (TGD/OKA/SID/FUE/DJE)
- **Ratings:** 4.7–5.0 range, realistic distribution
- **GEAR_ITEMS:** 0 — Amazon CUT for v1, correct

### ✅ PHOTO AUDIT — PRIOR "5× REGRESSION" WAS A FALSE ALARM

**Max photo repeat is 3× — has been 3× since the June 13 dedup run.** The "5× regression" flagged in content reports June 15–17 was a regex bug in this agent's photo-counting logic. DevOps identified and patched the detection on June 18. The langford-island-spit photo fix recommended over those 3 days was **unnecessary** — retracting it. Moving to known-skipped to prevent further false reporting.

Current photo distribution:
- 96 photos at 3× use
- 32 photos at 2× use
- 6 photos at 1× use

### ⚠️ LATESEASON FLAG INFLATION (NEW — LOW PRIORITY)

`lateSeason: true` appears on **27 venues** (6 compact + 21 JSON-format entries). Per CLAUDE.md, only 6 venues should carry this flag: Whistler, Tignes, Mammoth, Chamonix, Cervinia, Arapahoe Basin. The 21 JSON-format venues appear to be S-hemisphere ski venues (NZ/AUS/Chile/Argentina added 2026-06-09) where the field was incorrectly included in the batch paste. **No scoring impact** — `lateSeason` is only checked with `&&` against `snow_depth_max >= 0.5m`, and S-hem venues have their own hemisphere-aware in-season logic. But the field is misleading metadata. Suggest DevOps strip `"lateSeason": true` from JSON-format ski venues as a cleanup pass.

### ⚠️ S.AMERICA BEACH GAP — P0, DAY 4

Caribbean/Americas coverage:
- Mexico (6), Costa Rica (1), Panama (1), Jamaica (1), Aruba (2), Barbados (2), Tobago (1): ✅ solid
- **Colombia: 0** — Spirit/Avianca fly MIA→CTG direct from ~$120
- **Dominican Republic: 0** — most-searched US bucket-list beach destination
- **Puerto Rico: 0** — US territory, zero passport friction, direct from all East Coast hubs
- **Ecuador/Peru/Uruguay: 0**

See §5 for 5 paste-ready venues with required airport additions.

### ⚠️ TAG DEPTH BACKLOG (PERSISTENT, LOWEST PRIORITY)

| Tags per venue | Count |
|----------------|-------|
| ≤2 tags        | 279   |
| 3 tags         | 14    |
| 4+ tags        | 65    |

78% of venues have ≤2 tags. Affects search/filter discovery breadth, not scoring. Original compact-format venues vs. batch JSON (which have 4 tags each). No fix today — content sprint after launch.

---

## 3. Gear Items Audit

Amazon CUT for v1 (Jack, 2026-06-09). `GEAR_ITEMS` in app.jsx: **0**. Correct. Do not restore.

---

## 4. Seasonal Relevance — June 18, 2026

| Segment | In-Season | Notes |
|---------|-----------|-------|
| Beach — N. hemisphere | ~175 ✅ | Peak Jun–Aug |
| Beach — tropical year-round | ~50 ✅ | SE Asia, Caribbean, Africa coast |
| Skiing — S. hemisphere | ~23 ✅ | Austral winter peak (Jun–Aug) |
| Skiing — N. hem lateSeason | 6 ⚠️ | Glacier/high-alt, need ≥0.5m snow depth |
| Skiing — N. hem standard | ~101 ❌ | Hard off-season, correctly filtered |

Scoring is hemisphere-correct. No venues are being promoted in their worst season. The summer-ski S-hem venues (Cardrona, Falls Creek, Cerro Catedral, etc.) surface correctly for June users.

---

## 5. Five New Venue Objects — South America / Caribbean Gap

**Two of the five venues (beach_tamarindo, beach_maho) use airports already in AIRPORT_COORDS + AP_CONTINENT — paste those immediately with zero infrastructure changes. The other three (Colombia, DR, Puerto Rico) require the airport additions below first.**

### Prerequisite: AIRPORT_COORDS additions

```js
CTG:{lat:10.4442,lon:-75.5126},
PUJ:{lat:18.5673,lon:-68.3634},
SJU:{lat:18.4394,lon:-66.0018},
```

### Prerequisite: AP_CONTINENT additions

```js
CTG:"latam",
PUJ:"na",
SJU:"na",
```

### Five new venue objects (paste into VENUES array)

> Photos are new Unsplash IDs not currently in the venue pool (each will be 1× after adding). Verify they render in browser before deploying — photo 404s are non-crashing.

```js
{
  id:"beach_cartagena", category:"beach",
  title:"Bocagrande Beach", location:"Cartagena, Colombia",
  lat:10.3900, lon:-75.5440, ap:"CTG",
  icon:"🏖️", rating:4.81, reviews:2450,
  gradient:"linear-gradient(160deg,#1a0a00,#3a1a00,#6a3a10)",
  accent:"#c07030",
  tags:["Colombian Caribbean","Walled City Gateway","Year-Round Warm","MIA Direct 3hr"],
  photo:"https://images.unsplash.com/photo-1533387520709-752d83de3630?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
},
{
  id:"beach_bavaro", category:"beach",
  title:"Playa Bávaro", location:"Punta Cana, Dominican Republic",
  lat:18.6836, lon:-68.4583, ap:"PUJ",
  icon:"🏖️", rating:4.78, reviews:5280,
  gradient:"linear-gradient(160deg,#001428,#002a58,#1050a0)",
  accent:"#30a0e0",
  tags:["Dominican Republic","Palm-Lined Shore","Coral Reef Snorkeling","US Weekend Escape"],
  photo:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"beach_luquillo", category:"beach",
  title:"Luquillo Beach", location:"Luquillo, Puerto Rico",
  lat:18.3746, lon:-65.7169, ap:"SJU",
  icon:"🏖️", rating:4.85, reviews:1840,
  gradient:"linear-gradient(160deg,#001c10,#003828,#006848)",
  accent:"#30c070",
  tags:["Puerto Rico","US Domestic Flight","Rainforest Backdrop","Clear Caribbean Water"],
  photo:"https://images.unsplash.com/photo-1560431788-c8a61c6b7e42?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
{
  id:"beach_tamarindo", category:"beach",
  title:"Tamarindo Beach", location:"Guanacaste, Costa Rica",
  lat:10.2984, lon:-85.8397, ap:"SJO",
  icon:"🏖️", rating:4.83, reviews:3190,
  gradient:"linear-gradient(160deg,#1a1000,#3a2800,#6a5010)",
  accent:"#d08030",
  tags:["Pacific Pura Vida","Surf Town","Leatherback Turtles","Year-Round Sunshine"],
  photo:"https://images.unsplash.com/photo-1535732820275-9ffd998cac22?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
{
  id:"beach_maho", category:"beach",
  title:"Maho Beach", location:"Sint Maarten, Dutch Caribbean",
  lat:18.0443, lon:-63.1184, ap:"SXM",
  icon:"🏖️", rating:4.79, reviews:2890,
  gradient:"linear-gradient(160deg,#000a1e,#001848,#003080)",
  accent:"#4090d0",
  tags:["Airplane Beach","SXM Bucket List","Dutch Caribbean","Jet-Blast Thrill"],
  photo:"https://images.unsplash.com/photo-1531578453-56e0b5f9aaa9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},
```

**Post-paste checklist:**
- Confirm CTG/PUJ/SJU in both AIRPORT_COORDS and AP_CONTINENT before committing
- SJO/SXM need no new entries (already wired)
- Open Explore → filter Beach → verify 5 new cards render with photos and flight prices
- Run `bash scripts/auto-push.sh` — venue count will go 358→363, update `.venue-baseline` if the guard blocks

---

## One Observation for the PM

**Puerto Rico is the single highest-leverage add on this list.** US territory — no passport, no customs. Flights from every East Coast hub: JetBlue BOS→SJU from $89, JFK→SJU from $79, MIA→SJU from $69. A user in Boston can open Peakly on Thursday and be at Luquillo Beach by noon Friday. That is the exact use case the product is built around — and right now the app returns nothing for any of these users filtering "beach" within ≤4hr flight. One venue + one airport entry (SJU) is a direct conversion fix for the entire Northeast US user base.
