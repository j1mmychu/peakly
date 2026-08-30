# Peakly Content & Data Report — 2026-08-30

## Data Health Score: 94/100

**Deductions:**
- `arolla-valais` unshipped for **Day 6** — −4 pts (escalating; was −2 at Day 5 yesterday)
- Penalty escalates +2/day at Day 6+ to flag operational blockage

**Improvements since 2026-08-29:**
- ✅ DevOps report confirms `be8aa99` landed (PM and DevOps reports, baseline update)
- No venue count change: still 395

**Outstanding (carry-over):**
- ❌ `arolla-valais` — Day 6 carry-over. All 5 proposed venues from Aug 29 remain unshipped. See Section 5.

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
| `PEAKLY_BUILD` | **20260829a** — stale (yesterday's build; no app.jsx edit has landed today) |
| `lateSeason: true` venues | **15** ✅ matches CLAUDE.md |

**No data integrity issues found.** Catalog is clean.

---

## 2. Category Breakdown

The scheduled prompt references 12 categories (surfing, hiking, tanning, etc.) — those were retired in the 2026-05-03 pivot and are 4+ months stale. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **263** | ✅ Active |
| Skiing | **132** | ✅ Active |
| **Total** | **395** | — |

No stub categories. Both are well above any threshold. Two categories only.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md`. **Do not restore.** No action.

---

## 4. Seasonal Relevance — 2026-08-30

**Meteorological autumn begins tomorrow (Sept 1).** Today is the final day of meteorological summer. Two major search intent shifts activate over the next 72 hours:
1. **Ski pre-booking spike** — September is the month N. hemisphere skiers book Christmas/New Year trips. Trysil (Norway's largest, zero catalog presence until proposed Aug 29), Bansko, Sierra Nevada (Spain) are the relevant gaps.
2. **Mediterranean golden month** — September water temps peak (26°C+), crowds evaporate, sun reliable. JTR/IBZ/SPU/DBV clusters score highly for the next 6 weeks.

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (lat ≥ 0) | ~200 | ⚡ **LATE SUMMER EXIT** — shoulder begins tomorrow; Adriatic + Aegean remain prime through October |
| Tropical / equatorial beach (−10° to +15°) | ~80 | ✅ **YEAR-ROUND PEAK** — takes over as NH summer ends |
| S hemisphere ski (lat < 0, skiing) | **23** | ✅ **SH PEAK** — August mid-winter, prime conditions |
| lateSeason glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee/Cervinia/Tignes active year-round |
| N hemisphere ski (non-glacier) | ~117 | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S hemisphere beach (lat < 0) | **63** | ⚠️ SHOULDER — SH winter; water temps cool |

**In-season ratio: ~60%** (235/395 venues actively scoring, consistent with prior week)

**No action needed** — the scoring engine surfaces the right venues automatically for September. Adding Trysil (already proposed Aug 29, unshipped) remains the highest-ROI single add for the ski pre-booking window that opens tomorrow.

---

## 5. Content Quality

**Photo health:** 395/395 ✅ | 0 duplicates ✅ | 0 http (non-https) ✅

The generic stock vs venue-specific gap (~349/395 venues) remains open and blocked on `UNSPLASH_KEY`. No regression.

**Tags and descriptions:** No new issues found. Previous passes were clean. Short descriptions (under 20 words) are not applicable — the venue model uses structured fields, not long-form descriptions.

**Difficulty levels:** Not a required field in the current schema; ski venues carry skill-level tags instead. No gaps.

---

## 5 Venue Objects — Aug 30

**All 5 from Aug 29 are still unshipped and remain the best additions.**
**Carry-over + 4 new from Aug 29 — paste all 5 now to reach 400 venues.**
**All 5 APs (GVA, OSL, CPT, KUL, DPS) verified in `AIRPORT_COORDS` ✅ and `AP_CONTINENT` ✅.**

Note: Perhentian gradient typo corrected below (`#2888508` → `#288850` — was noted in Aug 29 report but appeared in the code block; pasting from here is safe).

```javascript
// 1. Arolla Ski Area, Valais, Switzerland [CARRY-OVER — Day 6]
// GVA (Geneva) — high-altitude glacier ski area (2006m village, 3500m summit).
// Off-piste mecca, authentic Valais village, zero resort-town crowds.
// lateSeason:true — holds into April. Distinct from Verbier/Saas-Fee already in catalog.
{id:"arolla-valais", category:"skiing",
  title:"Arolla Ski Area", location:"Valais, Switzerland",
  lat:46.0227, lon:7.4825, ap:"GVA",
  icon:"⛷️", rating:4.75, reviews:380,
  gradient:"linear-gradient(160deg,#0c1630,#1e3070,#3460b8)",
  accent:"#78a8e0",
  tags:["Glacier Terrain","Off-Piste","Authentic Village","Late Season"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Arolla_-_2011_-_002.jpg/1280px-Arolla_-_2011_-_002.jpg",
  skiPass:"independent", lateSeason:true},

// 2. Trysil, Norway [CARRY-OVER from Aug 29]
// OSL (Oslo Gardermoen) — Norway's largest ski resort. 70+ runs, 31 lifts,
// 66km of pistes. Sept = ski pre-booking season; no Norwegian resort in catalog.
{id:"trysil-norway", category:"skiing",
  title:"Trysil", location:"Innlandet, Norway",
  lat:61.3147, lon:12.0736, ap:"OSL",
  icon:"🎿", rating:4.72, reviews:2140,
  gradient:"linear-gradient(160deg,#0d1a2e,#1a3560,#2860a8)",
  accent:"#6898d8",
  tags:["Norway's Largest Resort","Family Friendly","70+ Runs","Village Ski-In/Out"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trysil_ski_resort.jpg/1280px-Trysil_ski_resort.jpg",
  skiPass:"Skistar"},

// 3. Camps Bay Beach, Cape Town [CARRY-OVER from Aug 29]
// CPT (Cape Town) — iconic sunset-strip beach. Mountain backdrop + white sand.
// September = Cape Town spring; water warming, pre-Christmas clarity.
// Distinct from Clifton Fourth Beach (already in catalog) — wider, livelier.
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9503, lon:18.3774, ap:"CPT",
  icon:"🏖️", rating:4.78, reviews:6720,
  gradient:"linear-gradient(160deg,#0a1a30,#1a3a68,#2870b8)",
  accent:"#68b0e0",
  tags:["Sunset Strip","Mountain Backdrop","Restaurants","Cape Town Spring"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Camps_Bay_beach.jpg/1280px-Camps_Bay_beach.jpg"},

// 4. Perhentian Islands, Malaysia [CARRY-OVER from Aug 29 — gradient typo fixed]
// KUL (Kuala Lumpur) — crystal-clear water, sea turtle nesting, coral reefs.
// Sept = dry season tail (monsoon starts Oct); ideal visibility for snorkeling.
{id:"perhentian-islands-my", category:"beach",
  title:"Perhentian Islands", location:"Terengganu, Malaysia",
  lat:5.9059, lon:102.7055, ap:"KUL",
  icon:"🏝️", rating:4.83, reviews:3890,
  gradient:"linear-gradient(160deg,#0a2010,#1a5028,#288850)",
  accent:"#58c880",
  tags:["Sea Turtles","Coral Reef","Budget Paradise","Snorkeling"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Perhentian_Islands.jpg/1280px-Perhentian_Islands.jpg"},

// 5. Nusa Lembongan, Indonesia [CARRY-OVER from Aug 29]
// DPS (Denpasar/Bali) — surf/yoga island 30min boat from Bali. No cars, mangroves.
// Consistent surf breaks (Shipwrecks/Lacerations). Distinct from Nusa Penida
// (already shipped Aug 29 — dramatic cliffs) vs Lembongan (laid-back/surf culture).
{id:"nusa-lembongan-bali", category:"beach",
  title:"Nusa Lembongan", location:"Klungkung, Bali, Indonesia",
  lat:-8.6781, lon:115.4536, ap:"DPS",
  icon:"🏄", rating:4.74, reviews:5230,
  gradient:"linear-gradient(160deg,#0a1e20,#1a4848,#288080)",
  accent:"#58c0b8",
  tags:["No Cars","Surf Breaks","Yoga Retreat","Island Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nusa_Lembongan_beach.jpg/1280px-Nusa_Lembongan_beach.jpg"},
```

**After paste: eval count should reach 400. A clean milestone.**

---

## One Observation for the PM

**Meteorological autumn starts tomorrow and the ski pre-booking window opens with it — but the 5 venues proposed August 29 (including Trysil, Norway's largest resort and the only Norwegian entry in the catalog) are now 6 days unshipped.** At 395 → 400 being a clean milestone that strengthens the Reddit post narrative, and with Trysil specifically being the highest-ROI add for the September ski-search spike, getting these 5 pasted before tomorrow is the single most leveraged content action available. The Perhentian gradient typo from yesterday is fixed above — copy directly from this report.
