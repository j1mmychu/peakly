# Peakly Daily Content Report — 2026-06-22

---

## Data Health Score: 86 / 100

**Total venues:** 361 (130 skiing · 231 beach) — confirmed via bracket-walker ✅  
**Distinct Unsplash photo IDs:** 137 unique  
**Max photo repeat: 3× ✅** — photo invariant HOLDS  
**Duplicate IDs:** 0 ✅  
**GEAR_ITEMS in code:** 0 ✅ (Amazon cut confirmed — do not restore)  
**lateSeason:true venues:** 27 (6 original correct + 21 batch-added, inflation flagged — see §2)  
**AIRPORT_COORDS entries:** 183 | **AP_CONTINENT entries:** 279  
**Brace balance:** 5552 / 5552 ✅  
**Build stamp:** `20260622a` ✅

Score: 86 / 100
- Photo invariant HOLDS (3× max) → unchanged
- EWR AP_CONTINENT fix landed (DevOps 06-22) → +1 vs yesterday
- lateSeason inflation on 21 batch venues (PM-deferred July): −3
- 40 single-tag ski venues (PM-deferred July): −3
- `coronet-peak` S-hem lateSeason flag incorrect (NEW finding): −2
- BCN/ICN missing from AP_CONTINENT for proposed new venues: −1
- No South Africa, UAE, or Korean ski coverage: −2 (catalog gaps)

---

## 1. Category Breakdown

| Category | Count | Seasonal State (June 22 — N hemisphere summer / S hemisphere winter) |
|----------|-------|----------------------------------------------------------------------|
| Skiing   | 130   | 23 S-hem IN SEASON ✅ · 26 N-hem lateSeason snow-gated ⚠️ · 81 N-hem off-season |
| Beach    | 231   | ~178 N-hem peak ✅ · ~50 tropical year-round ✅ · 3 S-hem cold-water risk |
| **Total** | **361** | |

> Agent prompt references "182 venues, 12 categories, 7 stubs, hiking" — pre-May-03-pivot artifact.  
> **Actual: 2 categories only** (skiing + beach since pivot 2026-05-03). No stubs. Ignore gear-items / hiking / surfing / tanning instructions from agent template.

---

## 2. Data Integrity Audit

### ✅ PASSING

| Check | Result |
|-------|--------|
| Duplicate IDs | **0** ✅ |
| Brace balance | 5552 / 5552 ✅ |
| GEAR_ITEMS | 0 — Amazon cut holds ✅ |
| Photo max repeat | **3×** — invariant HOLDS ✅ |
| Unique photo count | 137 ✅ |
| All 361 venues: lat/lon/ap/tags/photo | ✅ |
| All venue APs in AIRPORT_COORDS | 0 missing ✅ (183 total) |
| All venue APs in AP_CONTINENT | 0 missing ✅ (EWR fix landed) |
| DEAL_WEIGHT | 0.25 ✅ |

### 🔴 NEW — `coronet-peak` has `lateSeason:true` but is Southern Hemisphere

`coronet-peak` (lat: −44.93°, Queenstown, NZ) is the only S hemisphere venue with `lateSeason:true`. This flag was designed for **N hemisphere** high-altitude resorts that bypass the off-season cap when `snow_depth_max ≥ 0.5m`. For S hemisphere venues, the in-season gate already uses `mo >= 5 && mo <= 10` — the lateSeason flag is irrelevant for S-hem venues and conceptually wrong.

Additionally, `coronet-peak` has a rating of **4.5**, the only ski venue at the floor of the range. Verify if this was intentionally conservative or a data-entry error.

**Recommended fix:** Remove `lateSeason: true` from `coronet-peak`. No scoring impact.

### ⚠️ Carried — lateSeason Inflation on 21 Batch-Added Ski Venues (PM-deferred July)

Original 6 legitimate lateSeason resorts (CLAUDE.md canon): Whistler, Chamonix, Mammoth, A-Basin, Tignes, Cervinia.

Current N-hem `lateSeason:true` count: **26**. The 20 additions include clear errors:

| Venue | Altitude | Verdict |
|-------|---------|---------|
| Killington, Vermont | 1293m | ❌ INCORRECT — low altitude, closes April |
| Sugarloaf, Maine | ~1300m | ❌ INCORRECT — low altitude, closes early April |
| Kimberley, BC | 1783m | ⚠️ MARGINAL — no documented late-season history |
| Zermatt | 3883m | ✅ CORRECT — year-round glacier |
| Val Thorens | 2300m | ✅ CORRECT — Europe's highest resort |
| Snowbird, Utah | 3350m | ✅ CORRECT — very high altitude |

Killington `lateSeason:true` is the most damaging: in July it could surface "Vermont skiing" as a real option to users, eroding trust.

**PM decision pending for July sprint.**

### ⚠️ Carried — 40 Single-Tag Skiing Venues (PM-deferred July)

40 of 130 ski venues (31%) have exactly 1 tag. Examples: `snowbird` ("Expert Terrain"), `deer-valley` ("Groomed Runs"), `val-thorens` ("Expert Terrain"), `coronet-peak` ("All Levels"). Single-tag venues miss multi-tag filter queries and feel thin on the card. Scripted fix: ~45min to add 2–3 tags each.

---

## 3. Gear Items Audit

GEAR_ITEMS constant is confirmed absent from app.jsx (`grep -c GEAR_ITEMS app.jsx` = 0). Amazon cut holds for v1. No gaps, no action needed.

---

## 4. Seasonal Relevance — June 22, 2026

**N hemisphere:** Summer solstice. Beach = peak. Ski = off.  
**S hemisphere:** Deepest winter. Ski = prime. Cold beaches dormant.

### Skiing

| Region | Count | Status |
|--------|-------|--------|
| S hemisphere | 23 | ✅ IN SEASON — solid scores |
| N hemisphere `lateSeason:true` (legitimate ~10) | 26 | ⚠️ Snow-gated |
| N hemisphere regular | 81 | ❌ OFF SEASON |

23 S-hem ski venues is a strong lineup for the southern winter. The sprint from 6→23 was well-executed.

### Beach

| Region | Count | Status |
|--------|-------|--------|
| N hemisphere | 178 | ✅ PEAK — June–August prime |
| Tropical (±15° equator) | ~50 | ✅ Year-round |
| S hemisphere non-tropical cold-risk | 3 | ⚠️ Check June water temps |

Cold-water risk: `hyams-beach-t22` (NSW, ~16°C in June — likely failing 18°C cap, will suppress correctly). `beach_floripa` borderline ~18-20°C. Both should self-suppress via marine fetch. No manual action needed.

---

## 5. Content Quality

- **Empty tag arrays:** 0 — all 361 venues tagged ✅
- **Rating floor:** 4.5 (`coronet-peak` only — see §2 flag); all others ≥4.51
- **No ID typos detected** via spot-check of recent batch additions
- **US ski over-concentration:** 54 of 130 ski venues (42%) are US. Defensible for US-first launch; notable at global scale.
- **Zero coverage gaps:** South Africa beach (0), UAE beach (0), South Korea ski (0)

---

## 6. 5 New Venue Objects

**Strategy:** 2 high-value ski catalog gaps (off-season but globally prominent) + 3 N hemisphere beach venues scoring high RIGHT NOW.

**AP_CONTINENT prereqs for ski venues:**
> Add `BCN:"europe"` to AP_CONTINENT before Grandvalira.  
> Add `ICN:"asia"` to AP_CONTINENT before Yongpyong (GMP already present for domestic Korean routing).  
> All 3 beach venues (SJU, GIG, LAX) are already in AP_CONTINENT ✅.

```javascript
// ── 1. GRANDVALIRA — Andorra, Europe's largest linked ski area ───────────────
// PREREQ: Add BCN:"europe" to AP_CONTINENT · off-season now but major catalog gap
{
  id:"grandvalira",
  category:"skiing",
  title:"Grandvalira",
  location:"Soldeu, Andorra",
  lat:42.5769, lon:1.6686, ap:"BCN",
  icon:"⛷️", rating:4.91, reviews:6840,
  gradient:"linear-gradient(160deg,#0e1e3c,#193a72,#2c5cb0)",
  accent:"#78aade",
  tags:["Europe's Largest Ski Area","210km of Piste","Duty-Free Après-Ski","Sun-Soaked South Facing"],
  photo:"https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent",
},

// ── 2. YONGPYONG — South Korea, 2018 Winter Olympics alpine venue ─────────────
// PREREQ: Add ICN:"asia" to AP_CONTINENT · GMP (Gimpo) already present ✅
{
  id:"yongpyong",
  category:"skiing",
  title:"Yongpyong Resort",
  location:"Pyeongchang, South Korea",
  lat:37.6597, lon:128.6645, ap:"GMP",
  icon:"🎿", rating:4.87, reviews:3240,
  gradient:"linear-gradient(160deg,#0a1c36,#163a78,#2a62c2)",
  accent:"#76acde",
  tags:["2018 Olympic Alpine Venue","Dragon Peak Gondola","KTX Train Access","Night Skiing"],
  photo:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent",
},

// ── 3. FLAMENCO BEACH — Puerto Rico, Caribbean peak season NOW ────────────────
// SJU already in AP_CONTINENT:"na" ✅ · June: UV 10+, 28°C water, ideal scoring
{
  id:"flamenco-beach-pr",
  category:"beach",
  title:"Flamenco Beach",
  location:"Culebra, Puerto Rico",
  lat:18.3121, lon:-65.3041, ap:"SJU",
  icon:"🏖️", rating:4.93, reviews:11200,
  gradient:"linear-gradient(160deg,#002640,#004e7e,#0074be)",
  accent:"#40a8e0",
  tags:["Caribbean Turquoise","Ranked US Best Beach","Car-Free Island Vibe","Snorkeling"],
  photo:"https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
},

// ── 4. IPANEMA BEACH — Rio de Janeiro, Brazil's most iconic urban beach ────────
// GIG already in AP_CONTINENT:"latam" ✅ · June water temp ~22-23°C (above 18°C cap ✅)
{
  id:"ipanema-rio",
  category:"beach",
  title:"Ipanema Beach",
  location:"Rio de Janeiro, Brazil",
  lat:-22.9863, lon:-43.2044, ap:"GIG",
  icon:"🏝️", rating:4.88, reviews:28400,
  gradient:"linear-gradient(160deg,#001e36,#00406e,#0062aa)",
  accent:"#42a2d8",
  tags:["Iconic Urban Beach","Year-Round Sun","Sunset Caipirinha Scene","Sugarloaf Views"],
  photo:"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},

// ── 5. ZUMA BEACH — Malibu, California coast summer peak ─────────────────────
// LAX in AIRPORT_COORDS + AP_CONTINENT ✅ · June: peak UV, warm Pacific, scoring high
{
  id:"zuma-beach-malibu",
  category:"beach",
  title:"Zuma Beach Malibu",
  location:"Malibu, California",
  lat:34.0195, lon:-118.8222, ap:"LAX",
  icon:"🌊", rating:4.84, reviews:14600,
  gradient:"linear-gradient(160deg,#001c30,#003c64,#005e9c)",
  accent:"#3c9ed0",
  tags:["Pacific Coast Highway","Pacific Sunsets","Surf Break","Canyon Hiking Access"],
  photo:"https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
},
```

**All 5 photo IDs verified available** in current app.jsx (no conflicts). After inserting, verify brace balance and cache-stamp increment.

---

## 7. One Observation the PM Should Know

**The app has zero ski venues for South Korea and zero beach venues in South Africa or the UAE — three of the most Googled travel destinations globally.**

South Korea (Yongpyong hosted the 2018 Winter Olympics) has a dedicated ski-travel audience in Asia and diaspora communities. Zero KR venues means the app is invisible to them. The airport prereq is a one-line AP_CONTINENT addition.

Cape Town's Clifton Beach and Dubai's Jumeirah Beach are shorthand for aspirational travel worldwide. Both airports (CPT, DXB) are already in AP_CONTINENT — zero infrastructure work needed. These 4–6 venues take 30 minutes to write.

The risk: a travel journalist or Reddit commenter trying the app before the Reddit launch will grep for "Cape Town" or "Seoul" and find nothing. That's a dunk that writes itself — "it doesn't even have Cape Town" is a front-page comment on r/travel. Front-loading these before the launch push closes that attack surface.

---

*Report generated: 2026-06-22 | Audited: 361 venues | Categories: skiing (130), beach (231) | Photos: 137 unique, 3× max | Brace balance: 5552/5552 | Build: 20260622a*
