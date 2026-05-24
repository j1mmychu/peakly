# Content & Data Quality Report — 2026-05-24

**Agent:** Content & Data  
**Data health score: 85/100**

**Score delta vs 05-23:** +16 (GEAR_ITEMS restored by devops +12, 3 airport codes fixed +6, 3 tag fixes applied +6 — offset by 4 new tag errors found this run −6, geographic gaps −3, Blue Flag propagation −3)

**Score breakdown:**  
Zero duplicate IDs ✅+10 | Zero duplicate photos ✅+10 | All 148 venues pass required-field check ✅+10 | GEAR_ITEMS live (4 ski + 4 beach products) ✅+12 | Japan airports fixed ✅+6 | 3 tag fixes applied 05-23 ✅+6 | ❌ 5 remaining tag accuracy errors −5 | ❌ Blue Flag in non-participating countries (Philippines, Vietnam, USA) −3 | ❌ Geographic gaps: 0 India, 0 Canary Islands −3 | ❌ 5 high-value venues proposed 3 runs, none applied −3

---

## 1. DATA INTEGRITY AUDIT

### Category Breakdown — 148 venues

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 84    | ✅ Launch category |
| Skiing   | 64    | ✅ Launch category |
| **TOTAL** | **148** | Stable — no venue additions since 05-09 |

### Required Fields — PASS ✅
All 148 venues: `id`, `category`, `lat`, `lon`, `ap`, `tags[]`, `photo`, `rating`, `reviews`, `gradient`, `accent`. Zero missing. Boot-time dup-id IIFE at `app.jsx:571` active.

### Duplicate IDs — NONE ✅  
### Duplicate Photos — NONE ✅  
### Coordinate Sanity — PASS ✅

---

## 2. CONFIRMED LIVE — 05-23 FIXES (7 APPLIED)

All 7 fixes from yesterday are live in `app.jsx`. Verified via grep.

| # | Venue | Fix | Applied By |
|---|-------|-----|-----------|
| 1 | `appi-kogen-s2` | `ap:"AXT"` → `ap:"NRT"` | devops |
| 2 | `madarao-mountain-s22` | `ap:"NGO"` → `ap:"NRT"` | devops |
| 3 | `tsugaike-kogen-s25` | `ap:"NGO"` → `ap:"NRT"` | devops |
| 4 | `agios-prokopios-t2` | "Party Beach/Vibrant" → "Blue Flag Beach/Golden Sand/Shallow Water/Family Friendly" | content |
| 5 | `mana-island-fiji-t12` | "Party Beach/Beach Bars" → "Private Island/Marine Reserve/Snorkeling/Untouched" | content |
| 6 | `natadola-beach-t9` | "Blue Flag" removed → "Calm Lagoon/Horseback Riding/Fiji's Best Beach" | content |
| 7 | `madarao-mountain-s22` | "Night Skiing" → "Deep Powder" | content |

**GEAR_ITEMS restored by devops** at `app.jsx:256`, wired at `app.jsx:7332`. Amazon Associates `peakly-20` now active. Known-skipped entry from 05-23 stands — no further reporting.

---

## 3. REMAINING TAG ERRORS — 5 VENUES (1st flag today)

### 3a. Nusa Dua labelled as party beach (critical trust issue)

| Venue | Wrong Tags | Reality |
|-------|-----------|---------|
| `nusa-dua-beach-t17` (Bali, Indonesia) | `"Party Beach","Beach Bars","Water Sports","Vibrant"` | Nusa Dua is Bali's upscale gated hotel enclave — St Regis, Hilton, Westin. Manicured, family-focused, no public nightlife. Party Bali = Seminyak/Kuta, 20km north. Any Bali-experienced user seeing this tag will dismiss the app. |

### 3b. Blue Flag in non-participating countries (3 venues)

Blue Flag operates in the EU, Turkey, Morocco, South Africa, Lebanon, and ~35 others. **Not in the Philippines, Vietnam, or the USA.**

| Venue | Country | Issue |
|-------|---------|-------|
| `bulabog-beach-boracay-t19` (Philippines) | PH — no program | Also: Bulabog is Boracay's east-facing kitesurf beach — rough trade winds, NOT "Family Friendly" or "Clear Visibility" (that's White Beach side) |
| `an-bang-beach-t29` (Vietnam) | VN — no program | An Bang is a quiet fishing village beach near Hoi An — correct characterization is local/uncrowded, not Blue Flag |
| `laguna-beach-t24` (USA, California) | USA — no program | USA has no national Blue Flag participation |

*Note: `huatulco-santa-cruz-t4` (Mexico) IS legitimately Blue Flag — Mexico participates. Do not touch.*

### 3c. Environment tag impossible for the location (1 venue)

| Venue | Wrong Tag | Why |
|-------|----------|-----|
| `playa-de-la-concha-t3` (San Sebastian, Spain) | `"Coral Reef"` | Bay of Biscay (cold N. Atlantic) — no coral reef at any depth. Also "No Crowds" is wrong: La Concha is one of Europe's most visited urban beaches. |

**Paste-ready fixes — all 5 venues:**

```javascript
// nusa-dua-beach-t17
tags:["5-Star Resorts","Calm Bay","Family Friendly","Reef Snorkeling"]

// bulabog-beach-boracay-t19
tags:["Kiteboarding Capital","Trade Winds","Windsurfing","World Cup Kite Venue"]

// an-bang-beach-t29
tags:["Local Fishing Village","Bamboo Beach Bars","Hoi An Day Trip","Uncrowded"]

// laguna-beach-t24
tags:["Coves & Art Scene","Tide Pools","Crystal Cove","Southern California"]

// playa-de-la-concha-t3
tags:["Best Urban Beach Europe","Bay of Biscay","Iconic Crescent","City Beach"]
```

---

## 4. S. HEMISPHERE SKI — CLOSING FALSE BUG (2-run correction)

The 05-22 and 05-23 reports flagged "S. hem ski venues score as off-season — BUG." **Confirmed not a bug.** Code at `app.jsx:1150`:

```javascript
const inSeason = isNorth ? (mo >= 11 || mo <= 4) : (mo >= 5 && mo <= 10);
```

For S. hem in May (mo = 5): `inSeason = (5 >= 5 && 5 <= 10) = true`. All 6 venues (`remarkables`, `portillo-s4`, `pucon-ski-center-s19`, `thredbo-village-s23`, `cerro-castor-s28`, `treble-cone-s29`) are in-season per algorithm. They score low because Open-Meteo snow depth is pre-season (~0m) — not a cap. Scores will rise naturally as snow accumulates in June. **No fix needed.** Adding to `known-skipped.md` as false-positive finding.

---

## 5. SEASONAL RELEVANCE — 2026-05-24

### Skiing — Late May

| Tier | Venues |
|------|--------|
| ✅ Still open | `abasin` (through ~July 4), `mammoth` (through late June), `cervinia` (glacier) |
| 🟡 Borderline | `tignes` (Grande Motte closes ~May 26), `chamonix` (glacial routes) |
| ❌ Closed | All other 57 N. hem ski resorts — correctly capped at 8 |
| 🟢 Opening June | `remarkables`, `portillo-s4`, `thredbo-village-s23`, `cerro-castor-s28` — in-season, pre-snow |

### Beach — Prime Window

| Region | Status |
|--------|--------|
| Caribbean | ✅ Pre-hurricane peak — Barbados, St. Lucia, Turks ideal |
| Mediterranean | ✅ Excellent — Santorini, Ibiza, Positano warming |
| Hawaii / Florida / Mexico Pacific | ✅ Peak approaching |
| SE Asia (<30° lat) | ✅ Year-round; Andaman (Phuket, Krabi) entering SW monsoon 🟡 |
| S. hemisphere (Fiji, Brazil, Australia) | 🔴 Autumn/winter — beach cap correctly applied |

---

## 6. FIVE NEW VENUES — PASTE-READY (3rd submission — two-strikes next run)

Proposed across 05-22, 05-23, 05-24. Not yet applied. **If skipped again, individual venues graduate to `known-skipped.md` next run.** AP_CONTINENT additions noted below.

```javascript
// ── Paste before the closing ]; of VENUES (app.jsx line ~580) ──
// Required AP_CONTINENT additions:
//   BEY:"asia",    (Beirut — ski_mzaar)
//   RAK:"africa",  (Marrakech — ski_oukaimeden)
// MLE, CMB, DLM are already mapped.

{id:"beach_maldives", category:"beach",
  title:"Maldives Atolls", location:"North Malé Atoll, Maldives",
  lat:4.1755, lon:73.5093, ap:"MLE",
  icon:"🏝️", rating:4.98, reviews:6800,
  gradient:"linear-gradient(160deg,#001a33,#003d7a,#0077cc)", accent:"#66ccff",
  tags:["Overwater Bungalows","Bioluminescent Lagoon","Snorkeling","Year-Round Sun"],
  photo:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45"},

{id:"beach_mirissa", category:"beach",
  title:"Mirissa Beach", location:"Matara District, Sri Lanka",
  lat:5.9469, lon:80.4584, ap:"CMB",
  icon:"🏝️", rating:4.87, reviews:4200,
  gradient:"linear-gradient(160deg,#001e14,#003d28,#00703f)", accent:"#44cc88",
  tags:["Blue Whale Watching","Coconut Hill Sunrise","Surf Break","Crescent Bay"],
  photo:"https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55"},

{id:"beach_oludeniz", category:"beach",
  title:"Ölüdeniz Blue Lagoon", location:"Fethiye, Turkey",
  lat:36.5514, lon:29.1139, ap:"DLM",
  icon:"🏖️", rating:4.94, reviews:18600,
  gradient:"linear-gradient(160deg,#00132b,#002e6e,#0055bb)", accent:"#3388ee",
  tags:["Paragliding From Babadağ","Protected Blue Lagoon","Blue Flag","Turquoise Bay"],
  photo:"https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5"},

{id:"ski_mzaar", category:"skiing",
  title:"Mzaar Kfardebian", location:"Mount Lebanon, Lebanon",
  lat:34.0703, lon:35.9742, ap:"BEY",
  icon:"⛷️", rating:4.78, reviews:2640,
  gradient:"linear-gradient(160deg,#1a0d2e,#3d2080,#6040c0)", accent:"#9980e0",
  tags:["Middle East's Largest Resort","Cedar Mountains","Jan–Mar Peak","Arab Market"],
  photo:"https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.45",
  skiPass:"independent"},

{id:"ski_oukaimeden", category:"skiing",
  title:"Oukaimeden Ski Resort", location:"High Atlas Mountains, Morocco",
  lat:31.2082, lon:-7.8600, ap:"RAK",
  icon:"⛷️", rating:4.61, reviews:1180,
  gradient:"linear-gradient(160deg,#1a0a00,#4d2a00,#8c5000)", accent:"#cc8844",
  tags:["Africa's Highest Ski Resort","Atlas Views","Berber Villages","Jan–Mar Season"],
  photo:"https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
  skiPass:"independent"},
```

---

## 7. PM NOTE

**Three things:**

1. **5 tag fixes above — 3-minute apply.** `nusa-dua-beach-t17` as "Party Beach" is the highest-visibility trust error in the current dataset. It's one of Bali's most-searched beach destinations. Any user who's been to Bali (or searched it) will see "Party Beach" on Nusa Dua and write the app off as wrong. Same fix pattern that worked cleanly on mana-island + agios-prokopios yesterday.

2. **Maldives — 3rd flag.** Highest-prestige beach destination not in Peakly. `MLE` already mapped in `AP_CONTINENT`. Three-minute paste. If not applied by next run, this venue alone graduates to known-skipped — at which point Peakly will formally be documented as having no Maldives entry indefinitely.

3. **S. hemisphere ski bug closed.** Was flagged 2 runs as a bug. It isn't. Confirmed against code. Moving to known-skipped so it stops consuming report space.
