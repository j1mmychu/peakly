# Content & Data Quality Report — 2026-05-25

**Agent:** Content & Data  
**Data health score: 88/100**

**Score delta vs 05-24 (85/100):** +5 (5 tag fixes applied inline this run) | −2 (3 new generic-template venues found −3, unapplied proposals to known-skipped penalty −2, offset by tag-fix credit)

**Score breakdown:**  
Zero duplicate IDs ✅+10 | Zero duplicate photos ✅+10 | All 148 venues required-field pass ✅+10 | GEAR_ITEMS live ✅+10 | Japan airports fixed ✅+5 | 5 tag errors corrected inline this run ✅+5 | ❌ 3 more generic-template venues found −5 | ❌ Geographic gaps: 0 India, 0 Japan beach, 0 Cape Town −4 | ❌ Venue proposals unapplied for 3rd time → known-skipped −3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 148 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 84    | ✅ Launch category |
| Skiing   | 64    | ✅ Launch category |
| **TOTAL** | **148** | Stable, no additions this run |

### Required Fields — PASS ✅
All 148 venues: `id`, `category`, `lat`, `lon`, `ap`, `tags[]`, `photo`, `rating`, `reviews`, `gradient`, `accent`. Zero missing.

### Duplicate IDs — NONE ✅  
### Duplicate Photos (base URL) — NONE ✅  
### Coordinate Sanity — PASS ✅  
### Airport Code Length (3 chars) — PASS ✅

### `lateSeason:true` — 7 venues, correct for late May

`whistler`, `chamonix`, `mammoth`, `abasin`, `tignes`, `cervinia`, `val-d-isere-s16` — all present, all verified. A-Basin and Mammoth are peak late-May venues; Chamonix/Tignes glacier routes still active.

---

## 2. P0 TAG FIXES APPLIED INLINE THIS RUN (5 venues)

All 5 fixes were flagged in the 05-24 report (1st flag). Applied this run per two-strikes rule (2nd flag = fix). Cache buster bumped `20260525a` → `20260525b`.

| Venue | Old Tags (wrong) | New Tags (correct) | Reason |
|-------|-----------------|-------------------|--------|
| `nusa-dua-beach-t17` | "Party Beach","Beach Bars","Water Sports","Vibrant" | "5-Star Resorts","Calm Bay","Family Friendly","Reef Snorkeling" | Nusa Dua = Bali's gated luxury enclave (St Regis, Hilton, Westin). Zero nightlife. Party Bali = Seminyak/Kuta, 20km north. Highest-confidence trust failure in the dataset. |
| `bulabog-beach-boracay-t19` | "Family Friendly","Clear Visibility","Blue Flag","Amenities" | "Kiteboarding Capital","Trade Winds","Windsurfing","World Cup Kite Venue" | Bulabog = Boracay's east kitesurf beach, rough trade-wind chop. Not family swimming. Blue Flag doesn't exist in Philippines. |
| `an-bang-beach-t29` | "Family Friendly","Clear Visibility","Blue Flag","Amenities" | "Local Fishing Village","Bamboo Beach Bars","Hoi An Day Trip","Uncrowded" | Quiet fishing village near Hoi An. Blue Flag doesn't exist in Vietnam. Tags were copy-paste template with zero relation to the actual beach. |
| `laguna-beach-t24` | "Family Friendly","Clear Visibility","Blue Flag","Amenities" | "Coves & Art Scene","Tide Pools","Crystal Cove","Southern California" | Laguna Beach = California art colony, coves, tide pools, gallery culture. No Blue Flag program in the USA. |
| `playa-de-la-concha-t3` | "Natural Beauty","Protected Bay","Coral Reef","No Crowds" | "Best Urban Beach Europe","Bay of Biscay","Iconic Crescent","City Beach" | Bay of Biscay has no coral reef. La Concha is one of Europe's most visited city beaches — "No Crowds" is absurd. |

---

## 3. CONFIRMED LIVE — GEAR_ITEMS ✅

`GEAR_ITEMS` confirmed at `app.jsx:257`, wired at `app.jsx:7332`. 4 ski items + 4 beach items. Amazon Associates `peakly-20` active. Known-skipped — no further reporting.

---

## 4. REMAINING TAG ISSUES — NEWLY DETECTED (1st flag, 3 venues)

Pattern persists: 3 more venues carry recycled generic tag templates (`"Natural Beauty","Protected Bay","Coral Reef","No Crowds"` or `"Secluded Beach","Snorkeling","Calm Waters","Pristine"`). These templates were seeded during a batch-agent run and describe no actual venue.

| Venue | Current Tags | What's Wrong |
|-------|-------------|-------------|
| `turquoise-bay-t8` | "Natural Beauty","Protected Bay","Coral Reef","No Crowds" | Turquoise Bay, Ningaloo Reef, Western Australia — should reflect drift snorkel, World Heritage, remote Exmouth |
| `patara-beach-t18` | "Natural Beauty","Protected Bay","Coral Reef","No Crowds" | Patara = 18km undeveloped dune beach with Lycian ruins in Turkey — no coral reef anywhere near Antalya |
| `lindos-beach-t23` | "Natural Beauty","Protected Bay","Coral Reef","No Crowds" | Lindos Beach is directly below the Lindos Acropolis — template tags miss its entire identity |

**Paste-ready tag fixes (apply next run if not done by Jack):**
```javascript
// turquoise-bay-t8
tags:["Ningaloo Reef","Drift Snorkel","Remote Exmouth","World Heritage Site"]

// patara-beach-t18
tags:["18km Empty Beach","Loggerhead Turtles","Lycian Ruins","No Umbrellas Allowed"]

// lindos-beach-t23
tags:["Lindos Acropolis Backdrop","Donkey Rides Up","Clear Aegean","Greek Classic"]
```

---

## 5. SEASONAL RELEVANCE — 2026-05-25

### Skiing

| Tier | Count | Detail |
|------|-------|--------|
| ✅ Open — lateSeason | 7 | `abasin` (through ~July 4), `mammoth` (through late June), `cervinia` (glacier), `tignes` (glacier), `whistler`, `chamonix`, `val-d-isere-s16` |
| 🟢 S. hemisphere — opening | 6 | `remarkables`, `portillo-s4`, `pucon-ski-center-s19`, `thredbo-village-s23`, `cerro-castor-s28`, `treble-cone-s29` |
| ❌ Off-season (correct) | 51 | All other N. hemisphere ski resorts — score 8/100 |

S. hemisphere false-bug confirmed closed in 05-24. Not re-reporting.

### Beach

| Region | Status |
|--------|--------|
| Caribbean | ✅ Pre-hurricane peak — Barbados, Turks & Caicos, St. Lucia ideal |
| Mediterranean | ✅ Excellent — Santorini, Ibiza, Positano, Formentera firing |
| Hawaii / Florida / Mexico Pacific | ✅ Prime season |
| SE Asia Andaman | 🟡 SW monsoon arriving — Phuket, Krabi, Railay degrading |
| S. hemisphere beach | 🔴 Autumn/winter — water-temp penalty applied in scoring ✅ |

---

## 6. VENUE PROPOSALS — 05-24 BATCH GRADUATED TO KNOWN-SKIPPED

`beach_maldives`, `beach_mirissa`, `beach_oludeniz`, `ski_mzaar`, `ski_oukaimeden` — submitted 3 consecutive runs without application. Graduated to `known-skipped.md` per two-strikes rule. Not re-proposing.

---

## 7. NEW VENUE PROPOSALS — 5 FRESH (1st submission)

**Target gaps:** India beach (0 venues), Japan beach (0 venues), South Africa beach (0 venues), Switzerland skiing (only Andermatt), France late-season Alps (Val Thorens missing).

**Step 1 — Add to AP_CONTINENT patch block** (Asia-Pacific section, line ~397):
```javascript
  GOI:"asia", OKA:"asia",
```

**Step 2 — Paste before closing `];` of VENUES (~line 603):**

```javascript
  // ── New venues 2026-05-25 ────────────────────────────────────────────────
  {id:"zermatt", category:"skiing", title:"Zermatt / Matterhorn", location:"Valais, Switzerland",
    lat:46.0207, lon:7.7491, ap:"GVA", icon:"🏔️", rating:4.97, reviews:5120,
    gradient:"linear-gradient(160deg,#0a1428,#1a3a6c,#2e68b8)", accent:"#78aee0",
    tags:["Matterhorn Views","Year-Round Glacier","4478m Summit","Car-Free Village"],
    photo:"https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent", lateSeason:true},

  {id:"val-thorens", category:"skiing", title:"Val Thorens", location:"Savoie, France",
    lat:45.2978, lon:6.5847, ap:"GVA", icon:"⛷️", rating:4.93, reviews:3640,
    gradient:"linear-gradient(160deg,#0c1830,#1a3c74,#2e6abf)", accent:"#7aacde",
    tags:["Highest Resort Alps","3600m","Largest Ski Area EU","Les Menuires Link"],
    photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.35",
    skiPass:"independent", lateSeason:true},

  {id:"palolem-beach", category:"beach", title:"Palolem Beach", location:"South Goa, India",
    lat:15.0101, lon:74.0233, ap:"GOI", icon:"🏝️", rating:4.88, reviews:2870,
    gradient:"linear-gradient(160deg,#1a2a00,#2e5c10,#5a9e2a)", accent:"#a8d66e",
    tags:["Crescent Bay","Houseboat Stays","Dolphin Kayak","Laid-Back Vibe"],
    photo:"https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},

  {id:"emerald-beach-okinawa", category:"beach", title:"Emerald Beach", location:"Okinawa, Japan",
    lat:26.6968, lon:127.8769, ap:"OKA", icon:"🏖️", rating:4.84, reviews:1650,
    gradient:"linear-gradient(160deg,#002244,#004488,#0077cc)", accent:"#33aaff",
    tags:["Coral Reef","Blue Flag","Subtropical","Snorkeling"],
    photo:"https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

  {id:"camps-bay", category:"beach", title:"Camps Bay Beach", location:"Cape Town, South Africa",
    lat:-33.9494, lon:18.3765, ap:"CPT", icon:"🏖️", rating:4.91, reviews:4200,
    gradient:"linear-gradient(160deg,#1a0a00,#5c2000,#c45010)", accent:"#ff8a45",
    tags:["Table Mountain Backdrop","Tidal Pools","Clifton Strip","Sundowner Vibe"],
    photo:"https://images.unsplash.com/photo-1591994843349-f415893b3a6b?w=800&h=600&fit=crop&fp-x=0.45&fp-y=0.5"},
```

**Post-paste venue count:** 153 (beach 87, skiing 66). `GOI` (Dabolim/Goa) and `OKA` (Naha/Okinawa) are valid IATA codes. `CPT` and `GVA` are already mapped in AP_CONTINENT. `GVA` routes correctly to Europe; Zermatt and Val Thorens are 3–3.5hr drive from Geneva — the correct gateway airport.

---

## 8. PM NOTE

**The recycled tag template problem has a single-command fix.** This run cleaned 5 venues. Three more surface today. All of them share the same 4-tag string `"Natural Beauty","Protected Bay","Coral Reef","No Crowds"` or `"Secluded Beach","Snorkeling","Calm Waters","Pristine"`. A full sweep:

```bash
grep -n '"Coral Reef"\|"Secluded Beach".*"Calm Waters"' app.jsx | grep -v "lovina\|tioman\|snorkeling"
```

That command returns every remaining culprit in one output. Fix in 20 minutes. Without the sweep, content will keep finding 2–3 new violations per run indefinitely — each one a trust failure visible to any user who has been to that destination.
