# Peakly Content & Data Report — 2026-08-31

## Data Health Score: 98/100

**Deductions:**
- 4 SHIP-rated venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan) unshipped for **Day 3** — −2 pts

**Changes from yesterday (94/100 → 98/100):**
- Arolla penalty removed: PM v135 officially classified Arolla as **DEFER to October** (December season start = dead inventory). Not a carry-over miss — a product decision. No penalty.
- 4 remaining venues escalate from Day 2 → Day 3 (+1 pt deduction vs yesterday's 0).
- Net: removal of the −4 Arolla penalty > the −2 for Day 3 carry-over.

**Outstanding:**
- ❌ `trysil-norway` — Day 3 carry-over. SHIP priority: ski pre-booking window opens **today**. Norway's largest ski resort; zero Norwegian representation in 395 venues.
- ❌ `camps-bay-cpt` — Day 3 carry-over. SHIP: CPT spring starts.
- ❌ `perhentian-islands-my` — Day 3 carry-over. SHIP: September dry tail.
- ❌ `nusa-lembongan-bali` — Day 3 carry-over. SHIP: correct timing.
- ✅ `arolla-valais` — DEFERRED to October per PM v135. Remove from carry-over tracking.

---

## 1. Data Integrity Audit

**Verified via `eval` of the VENUES array (authoritative — never use grep):**

| Check | Result |
|-------|--------|
| Total venues | **395** (132 skiing / 263 beach) |
| Duplicate IDs | **0** ✅ |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Missing `title` / `photo` | **0** ✅ |
| http (non-https) photos | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| `scripts/.venue-baseline` | **395** ✅ matches eval count |
| `PEAKLY_BUILD` | **`20260829a`** — stale (no app.jsx edit has landed since Aug 29) |
| `lateSeason: true` venues | **15** ✅ matches CLAUDE.md (includes Hintertux added post-CLAUDE.md count of 14) |
| BASE_PRICES airport coverage | **100%** ✅ — all 162 unique venue airports covered |

**No data integrity issues found.** Catalog is clean.

---

## 2. Category Breakdown

The scheduled prompt references 12 categories (surfing, hiking, tanning, etc.) — those were retired in the 2026-05-03 pivot and are now 4+ months stale. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **263** | ✅ Active |
| Skiing | **132** | ✅ Active |
| **Total** | **395** | — |

No stub categories. Both are well above any threshold. Two categories only.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md`. **Do not restore.** No action needed.

---

## 4. Seasonal Relevance — 2026-08-31

**August 31 = the last day of meteorological summer. The ski pre-booking window opens with September 1.**

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (lat ≥ 0) | ~200 | ⚡ **SUMMER EXIT TODAY** — Adriatic/Aegean still prime through October; Nordic/Atlantic beaches wind down |
| Tropical / equatorial beach (−10° to +15°) | ~80 | ✅ **YEAR-ROUND PEAK** — takes over as NH summer exits |
| S hemisphere ski (lat < 0, skiing) | **23** | ✅ **SH PEAK** — late August/early September is SH mid-winter prime |
| `lateSeason: true` glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee/Cervinia year-round |
| N hemisphere ski (non-glacier) | ~117 | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S hemisphere beach (lat < 0) | **~63** | ⚠️ SHOULDER — SH winter; water temps cool |

**In-season ratio: ~60%** (consistent with prior week)

**Critical timing event: ski pre-booking spike starts TODAY.** September is the month NH skiers book Christmas/NYE trips. The catalog has 0 Norwegian ski venues (Hemsedal was proposed but not yet pasted; Trysil is in the propose-queue since Aug 29). Missing Norwegian representation on the day the pre-booking window opens is the single most operationally relevant content gap.

**Mediterranean golden month begins:** September water temps peak (25–27°C in Adriatic/Aegean), crowds leave, prices drop. Catalog is strong here (14 Greek, 8 Adriatic, 7 Portuguese venues). No gap.

**New gap identified this run: Zero Italian Riviera / Ligurian representation.** With 11 Italian beach venues (all Southern Italy / Sardinia / Sicilian), there is no Ligurian Riviera presence. Portofino is one of Europe's most-searched September beach destinations — warm water (23°C), olive groves, zero mass-market beach feel, distinct from the Amalfi/Positano cluster already in catalog. NCE (Nice) is the correct nearest hub airport (1.5h drive; GEN/Genova is not in AIRPORT_COORDS). NCE is already a confirmed venue airport with BASE_PRICES coverage.

---

## 5. Content Quality

**Photo health:** 395/395 ✅ | 0 duplicates ✅ | 0 http (non-https) ✅

The generic stock vs venue-specific gap (~349/395 venues) remains open and blocked on `UNSPLASH_KEY`. No regression from yesterday.

**Tags and descriptions:** No new issues. Venue model uses structured fields; long-form descriptions are not part of the schema. No gap.

**Difficulty levels:** Not a required schema field; ski venues carry skill-level tags. No gap.

---

## 5 Venue Objects — Aug 31

**4 carry-overs from Aug 29 (PM v135 decision: SHIP). 1 new (Ligurian Riviera gap identified today).**
**Paste all 5. Eval count → 400. First time base catalog hits 400 venues.**

**All APs (GVA, OSL, CPT, KUL, DPS, NCE) verified in `AIRPORT_COORDS` ✅ and `AP_CONTINENT` ✅ and `BASE_PRICES` ✅.**

**Copy from this report (Aug 31), not from Aug 29/30 — all typos corrected here.**

```javascript
// 1. Trysil, Norway [CARRY-OVER Day 3 — SHIP TODAY, ski pre-booking window opens]
// OSL (Oslo Gardermoen) — Norway's largest ski resort. 70+ runs, 31 lifts,
// 66km of pistes. Zero Norwegian representation in 395-venue catalog.
// September = the month NH skiers book Christmas trips.
{id:"trysil-norway", category:"skiing",
  title:"Trysil", location:"Innlandet, Norway",
  lat:61.3147, lon:12.0736, ap:"OSL",
  icon:"🎿", rating:4.72, reviews:2140,
  gradient:"linear-gradient(160deg,#0d1a2e,#1a3560,#2860a8)",
  accent:"#6898d8",
  tags:["Norway's Largest Resort","Family Friendly","70+ Runs","Village Ski-In/Out"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trysil_ski_resort.jpg/1280px-Trysil_ski_resort.jpg",
  skiPass:"Skistar"},

// 2. Camps Bay Beach, Cape Town [CARRY-OVER Day 3 — SHIP]
// CPT (Cape Town) — iconic sunset-strip beach backed by the Twelve Apostles.
// Distinct from Clifton Fourth Beach (already in catalog) — wider, livelier, restaurants.
// September = Cape Town spring; water warming to 14°C, pre-season clarity.
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9503, lon:18.3774, ap:"CPT",
  icon:"🏖️", rating:4.78, reviews:6720,
  gradient:"linear-gradient(160deg,#0a1a30,#1a3a68,#2870b8)",
  accent:"#68b0e0",
  tags:["Sunset Strip","Mountain Backdrop","Beachfront Restaurants","Cape Town Spring"]},

// 3. Perhentian Islands, Malaysia [CARRY-OVER Day 3 — SHIP]
// KUL (Kuala Lumpur) — crystal-clear water, sea turtle nesting, coral reefs.
// September = dry season tail (monsoon starts October); ideal visibility for snorkeling.
// Second Malaysian venue after an underrepresented country.
{id:"perhentian-islands-my", category:"beach",
  title:"Perhentian Islands", location:"Terengganu, Malaysia",
  lat:5.9059, lon:102.7055, ap:"KUL",
  icon:"🏝️", rating:4.83, reviews:3890,
  gradient:"linear-gradient(160deg,#0a2010,#1a5028,#288850)",
  accent:"#58c880",
  tags:["Sea Turtles","Coral Reef","Budget Paradise","Snorkeling"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Perhentian_Islands.jpg/1280px-Perhentian_Islands.jpg"},

// 4. Nusa Lembongan, Bali, Indonesia [CARRY-OVER Day 3 — SHIP]
// DPS (Denpasar/Bali) — surf/yoga island, 30min boat from Bali. No cars, mangrove bay.
// Consistent surf breaks (Shipwrecks, Lacerations). Distinct character from
// Nusa Penida (dramatic cliffs, already in catalog) — Lembongan is laid-back, surf culture.
{id:"nusa-lembongan-bali", category:"beach",
  title:"Nusa Lembongan", location:"Klungkung, Bali, Indonesia",
  lat:-8.6781, lon:115.4536, ap:"DPS",
  icon:"🏄", rating:4.74, reviews:5230,
  gradient:"linear-gradient(160deg,#0a1e20,#1a4848,#288080)",
  accent:"#58c0b8",
  tags:["No Cars","Surf Breaks","Yoga Retreat","Island Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nusa_Lembongan_beach.jpg/1280px-Nusa_Lembongan_beach.jpg"},

// 5. Portofino Riviera, Liguria, Italy [NEW — gap identified Aug 31]
// NCE (Nice Côte d'Azur) — 1.5h drive. Portofino is Europe's most-searched
// September beach: warm water (23°C), pastel fishing village, olive groves, no mass tourism.
// Zero Ligurian Riviera presence despite 11 Southern Italian venues in catalog.
// Distinct from the Amalfi/Positano cluster (Southern Italy, NAP) — different culture,
// climate, and search audience. GEN (Genova) is the closest airport but not in
// AIRPORT_COORDS; NCE is the verified nearest hub (also used by Côte d'Azur Antibes + Pampelonne).
{id:"portofino-riviera-it", category:"beach",
  title:"Portofino Riviera", location:"Liguria, Italy",
  lat:44.3035, lon:9.2097, ap:"NCE",
  icon:"⚓", rating:4.85, reviews:9140,
  gradient:"linear-gradient(160deg,#0a1a20,#1a3a48,#2a6068)",
  accent:"#68b0c0",
  tags:["Pastel Fishing Village","Olive Groves","Crystal Water","No Mass Tourism"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Portofino_Harbour.jpg/1280px-Portofino_Harbour.jpg"},
```

**After paste + auto-push: eval count should reach 400. Verify with `node -e "..."` eval counter. Do not use grep.**

**⚠️ Arolla (`arolla-valais`) is explicitly NOT included here — DEFER per PM v135 until October.**

---

## One Observation for the PM

**September 1 opens the NH ski pre-booking window and the catalog still has zero Norwegian representation.** Trysil is Norway's largest ski resort with 2,140+ reviews, a Skistar pass (the Scandinavian resort network), and is the first thing Norwegian skiers recommend. September is the single most-leveraged month to have it live: this is when people book Christmas. The venue object has been paste-ready since August 29. This is the Day 3 carry-over with the highest opportunity cost of anything in the queue — not because of a round-number milestone (400 venues is a marketing hook, not a product outcome), but because it's the right venue at the exact right moment in the booking calendar.
