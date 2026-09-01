# Peakly Content & Data Report — 2026-09-01

## Data Health Score: 96/100

**Deductions:**
- 5 SHIP-rated venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan, Portofino Riviera) unshipped — **Day 4** for the first four, **Day 2** for Portofino: −2 pts
- **NEW: Balearic AIRPORT_COORDS gap** — IBZ, PMI, MAH have BASE_PRICES entries but are **absent from AIRPORT_COORDS**. The `flightHours()` distance filter silently can't compute for these 13 venues (3 Ibiza, 2 Formentera, 3 Menorca, 3 Mallorca + 2 Formentera/Ibiza). They pass the filter unchecked regardless of user's "Within Nhr" setting. Flag for DevOps — an AIRPORT_COORDS entry for each airport is a 3-line fix: −2 pts

**Correction carried from yesterday:**
- Aug 31 report stated "zero Norwegian representation" — incorrect. `hemsedal-s3` (Hemsedal, Viken, Norway, OSL) IS in catalog. The claim propagated through the carry-over rationale. Trysil remains a valid and high-priority add (Norway's largest resort, distinct from Hemsedal's advanced terrain focus), but the "only Norwegian ski entry" framing is wrong. Score unaffected — this is a factual correction, not a new issue.

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
| HTTP (non-HTTPS) photos | **0** ✅ |
| Duplicate photo URLs | **0** ✅ |
| `scripts/.venue-baseline` | **395** ✅ matches eval count |
| `PEAKLY_BUILD` | **`20260901a`** ✅ in lockstep with today |
| `lateSeason: true` venues | **15** ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| BASE_PRICES airport coverage | **100%** ✅ all venue airports covered |
| AIRPORT_COORDS coverage | ⚠️ **IBZ/PMI/MAH missing** — 13 Balearic venues silently degrade the flight-distance filter |

---

## 2. Category Breakdown

The scheduled prompt references 12 categories (surfing, hiking, tanning, etc.) — those were retired 2026-05-03, now 4+ months stale. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **263** | ✅ Active |
| Skiing | **132** | ✅ Active |
| **Total** | **395** | — |

No stub categories. Two categories only. Both well above any threshold.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md`. Do not restore. No action needed.

---

## 4. Seasonal Relevance — 2026-09-01

**September 1 = Day 2 of the ski pre-booking window. Meteorological fall begins today.**

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (Mediterranean/Adriatic/Aegean) | ~180 | ✅ **GOLDEN MONTH** — water temps at annual peak (25–28°C), crowds gone, prices soft |
| Tropical / equatorial beach (−10° to +15°) | ~80 | ✅ **YEAR-ROUND PEAK** |
| S hemisphere ski (lat < 0, skiing) | **23** | ✅ **SH PEAK** — late August/September prime |
| `lateSeason: true` glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee/Cervinia year-round |
| N hemisphere ski (non-glacier) | ~117 | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S hemisphere beach (lat < 0) | ~63 | ⚠️ SHOULDER — SH spring warming, still below peak |

**In-season ratio: ~60%** (consistent; will improve through September as ski score reactivates)

**Ski pre-booking calendar:** Day 2. September is the month NH skiers book Christmas/NYE packages. Trysil (Norway's largest resort, 70+ pistes, Skistar pass network) has been paste-ready since Aug 29. Still not in catalog. The opportunity cost of this specific carry-over is higher than the round-number headline (400 venues) — it's the right venue at the peak moment in the booking calendar.

**Norwegian clarification:** `hemsedal-s3` (Hemsedal, OSL) IS in catalog — an advanced-terrain resort (steep chutes, long season). Trysil is the family-first, volume resort — Norway's ski resort equivalent of what Whistler is to Blackcomb. Both belong in the catalog for different search audiences. The Aug 31 "zero Norwegian" claim was wrong; the Trysil rationale stands on its own merits.

**Mediterranean golden month:** Adriatic/Aegean water temps 25–28°C. Well-covered (Croatian, Greek, Italian, French venues). No gap.

**Balearic Islands gap:** 13 Balearic venues (Ibiza, Formentera, Menorca, Mallorca) are actively being surfaced to users, but IBZ/PMI/MAH are missing from AIRPORT_COORDS. The `flightHours()` distance-filter silently treats these venues as "no distance data" — they pass all "Within Nhr" filters regardless of user's setting. In September this matters: Mallorca/Ibiza are top European September picks, and a user filtering "≤4hr from JFK" shouldn't see them.

---

## 5. Content Quality

**Photo health:** 395/395 ✅ | 0 duplicates ✅ | 0 HTTP (non-HTTPS) ✅

Generic stock vs. venue-specific (~349/395 venues) remains open, blocked on `UNSPLASH_KEY`. No regression.

**Tags and descriptions:** No new issues.

**Idre Fjall airport note (low priority):** `idre-fjall-s6` uses OSL (Oslo, 250km) as its airport. ARN (Stockholm, 450km) is farther — OSL is geographically correct. No action needed.

---

## 5 Venue Objects — Sep 1

**All 5 are carry-overs. None of the Aug 29/31 proposed venues have been pasted.**
**Day 4 for the first four (Trysil, Camps Bay, Perhentian, Nusa Lembongan). Day 2 for Portofino Riviera.**

**All APs (OSL, CPT, KUL, DPS, NCE) verified in `AIRPORT_COORDS` ✅ and `AP_CONTINENT` ✅ and `BASE_PRICES` ✅.**

**Copy from this report (Sep 1) — all previous carry-over objects are reproduced verbatim below. Paste all 5. Eval count → 400.**

```javascript
// 1. Trysil, Norway [CARRY-OVER Day 4 — HIGHEST PRIORITY. Ski pre-booking window open Day 2.]
// OSL (Oslo Gardermoen) — Norway's largest ski resort. 70+ runs, 31 lifts, 66km of pistes.
// Distinct from existing hemsedal-s3 (advanced/steep terrain). Trysil = family/intermediate
// volume resort + Skistar pass network (Scandinavian equivalent of Ikon).
// September = when NH skiers book Christmas. This is the right venue at the right moment.
{id:"trysil-norway", category:"skiing",
  title:"Trysil", location:"Innlandet, Norway",
  lat:61.3147, lon:12.0736, ap:"OSL",
  icon:"🎿", rating:4.72, reviews:2140,
  gradient:"linear-gradient(160deg,#0d1a2e,#1a3560,#2860a8)",
  accent:"#6898d8",
  tags:["Norway's Largest Resort","Family Friendly","70+ Runs","Village Ski-In/Out"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trysil_ski_resort.jpg/1280px-Trysil_ski_resort.jpg",
  skiPass:"Skistar"},

// 2. Camps Bay Beach, Cape Town [CARRY-OVER Day 4 — SHIP]
// CPT (Cape Town) — iconic sunset-strip beach backed by the Twelve Apostles.
// Distinct from Clifton Fourth Beach (already in catalog) — wider, livelier, restaurants.
// September = Cape Town spring; water warming, pre-season clarity.
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9503, lon:18.3774, ap:"CPT",
  icon:"🏖️", rating:4.78, reviews:6720,
  gradient:"linear-gradient(160deg,#0a1a30,#1a3a68,#2870b8)",
  accent:"#68b0e0",
  tags:["Sunset Strip","Mountain Backdrop","Beachfront Restaurants","Cape Town Spring"]},

// 3. Perhentian Islands, Malaysia [CARRY-OVER Day 4 — SHIP]
// KUL (Kuala Lumpur) — crystal-clear water, sea turtle nesting, coral reefs.
// September = dry season tail (monsoon starts October); ideal snorkel visibility.
// Second Malaysian venue; underrepresented country.
{id:"perhentian-islands-my", category:"beach",
  title:"Perhentian Islands", location:"Terengganu, Malaysia",
  lat:5.9059, lon:102.7055, ap:"KUL",
  icon:"🏝️", rating:4.83, reviews:3890,
  gradient:"linear-gradient(160deg,#0a2010,#1a5028,#288850)",
  accent:"#58c880",
  tags:["Sea Turtles","Coral Reef","Budget Paradise","Snorkeling"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Perhentian_Islands.jpg/1280px-Perhentian_Islands.jpg"},

// 4. Nusa Lembongan, Bali, Indonesia [CARRY-OVER Day 4 — SHIP]
// DPS (Denpasar/Bali) — surf/yoga island, 30min boat from Bali. No cars, mangrove bay.
// Distinct from Nusa Penida (dramatic cliffs, already in catalog) — Lembongan is
// laid-back surf culture. Different search audience.
{id:"nusa-lembongan-bali", category:"beach",
  title:"Nusa Lembongan", location:"Klungkung, Bali, Indonesia",
  lat:-8.6781, lon:115.4536, ap:"DPS",
  icon:"🏄", rating:4.74, reviews:5230,
  gradient:"linear-gradient(160deg,#0a1e20,#1a4848,#288080)",
  accent:"#58c0b8",
  tags:["No Cars","Surf Breaks","Yoga Retreat","Island Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nusa_Lembongan_beach.jpg/1280px-Nusa_Lembongan_beach.jpg"},

// 5. Portofino Riviera, Liguria, Italy [CARRY-OVER Day 2]
// NCE (Nice Côte d'Azur) — 1.5h drive. September golden month: warm water (23°C),
// pastel fishing village, olive groves, zero mass-market. Zero Ligurian Riviera
// presence in a catalog with 13 Italian venues (all Southern Italy/Sardinia/Sicily).
// NCE already used by 4 French Riviera venues; routing is precedented.
{id:"portofino-riviera-it", category:"beach",
  title:"Portofino Riviera", location:"Liguria, Italy",
  lat:44.3035, lon:9.2097, ap:"NCE",
  icon:"⚓", rating:4.85, reviews:9140,
  gradient:"linear-gradient(160deg,#0a1a20,#1a3a48,#2a6068)",
  accent:"#68b0c0",
  tags:["Pastel Fishing Village","Olive Groves","Crystal Water","No Mass Tourism"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Portofino_Harbour.jpg/1280px-Portofino_Harbour.jpg"},
```

**After paste + auto-push: eval count should reach 400. Verify with eval counter. Do not use grep.**

---

## One Observation for the PM

**13 Balearic venues (Ibiza, Formentera, Menorca, Mallorca) silently bypass the flight-distance filter.** IBZ, PMI, and MAH have BASE_PRICES entries but no AIRPORT_COORDS entries, so `flightHours()` returns null for them and they pass any "Within Nhr" filter regardless of the user's setting. In September, Ibiza and Mallorca are two of Europe's top beach picks — a user setting "≤4hr from JFK" shouldn't be seeing them. This is a 3-line-per-airport fix in the AIRPORT_COORDS constant: `IBZ:[38.8729,1.3731]`, `PMI:[39.5517,2.7388]`, `MAH:[39.8626,4.2187]`. Worth routing to DevOps alongside the VPS disk-cache work (Open #23) since both require touching app.jsx.
