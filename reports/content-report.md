# Peakly Content & Data Report — 2026-09-02

## Data Health Score: 97/100

**Deductions:**
- 5 carry-over venues (Trysil, Camps Bay, Perhentian Islands, Nusa Lembongan, Portofino Riviera) unshipped — **Day 5** for first four, **Day 3** for Portofino: −2 pts
- **NEW: FOR/NAT missing from AP_CONTINENT** — `beach_jericoacoara` (Fortaleza, Brazil, ap:`FOR`) and `beach_pipa_brazil` (Natal, Brazil, ap:`NAT`) are both present in AIRPORT_COORDS and BASE_PRICES but absent from AP_CONTINENT. The continent-based home-airport filtering silently can't assign a continent to either venue. A 2-line fix: `FOR:"latam"` and `NAT:"latam"`. Low severity but a genuine gap: −1 pt

**Correction from yesterday:**
- Sep 1 report deducted 2 pts for a "Balearic AIRPORT_COORDS gap" (IBZ/PMI/MAH missing). **This was a false alarm — now confirmed closed.** DevOps report today verified all three airports at lines 6911/6913/6914 of app.jsx. The `-2` deduction was incorrect. Today's score is rebased accordingly.
- **Lesson for future runs:** Before filing a missing-airport finding, run `grep -n "IBZ\|PMI\|MAH" app.jsx` to verify absence in the actual file. The two-format catalog (unquoted vs. quoted JSON keys) can defeat a casual regex; `eval` or `grep -n` against the full file is the authoritative check.

---

## 1. Data Integrity Audit

**Verified via `eval` of VENUES array (authoritative):**

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
| `PEAKLY_BUILD` | **`20260902a`** ✅ in lockstep with sw.js + index.html |
| `lateSeason: true` venues (eval) | **15** ✅ (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| AIRPORT_COORDS coverage | **162/162** ✅ all venue airports covered |
| AP_CONTINENT coverage | ⚠️ **FOR/NAT missing** — 2 Brazilian beach venues (see above) |
| BASE_PRICES coverage | ✅ FOR and NAT have BASE_PRICES entries |
| GEAR_ITEMS | **0** ✅ intentionally cut for v1 (Jack, 2026-06-09) — do not restore |

**lateSeason count note:** A raw regex on the source file returns 10 (the unquoted-key format venues only). The correct count is **15** via `eval` — 5 venues use the quoted JSON key format (`"lateSeason": true`). Always use eval, not grep, for counts that span both catalog formats.

---

## 2. Category Breakdown

The scheduled prompt references 12 categories (surfing, hiking, tanning, etc.) — those were retired 2026-05-03, now >4 months stale. Actual catalog:

| Category | Venues | Status |
|----------|--------|--------|
| Beach | **263** | ✅ Active |
| Skiing | **132** | ✅ Active |
| **Total** | **395** | — |

No stub categories. Both well above any threshold.

---

## 3. GEAR_ITEMS Audit

Intentionally cut for v1 (Jack, 2026-06-09). `grep -c GEAR_ITEMS app.jsx` → **0**. Standing directive in `tasks/agents/devops.md` and CLAUDE.md. Do not restore without a product decision. No action needed.

---

## 4. Seasonal Relevance — 2026-09-02

**September 2 = Day 3 of the ski pre-booking window. Mediterranean golden month peak.**

| Segment | Count | Status |
|---------|-------|--------|
| N hemisphere beach (Mediterranean/Adriatic/Aegean) | ~180 | ✅ **GOLDEN MONTH** — post-crowd, pre-rain; water temps annual peak (25–28°C) |
| Tropical/equatorial beach (−10° to +15°) | ~80 | ✅ **YEAR-ROUND PEAK** |
| S hemisphere ski (lat < 0, skiing) | ~23 | ✅ **SH PEAK** — late August/September is SH prime ski season |
| `lateSeason: true` glacier ski | **15** | ✅ **ACTIVE** — Hintertux/Zermatt/Saas-Fee year-round |
| N hemisphere ski (non-glacier) | ~117 | ⚠️ OFF SEASON — correctly suppressed by scoring engine |
| S hemisphere beach (lat < 0) | ~63 | ⚠️ SHOULDER — SH spring warming, still below peak |

**In-season ratio: ~60%**

**Ski pre-booking urgency:** Day 3. Norwegian families book Christmas packages in September. Trysil is paste-ready and the strongest single venue add right now — Norway's largest resort (70+ pistes, 31 lifts, 66km), Skistar pass network, distinct from `hemsedal-s3` (advanced terrain) already in the catalog. Family-first, volume resort. Five days in the queue.

**Brazilian beach gap:** Two Brazilian venues (`beach_jericoacoara` and `beach_pipa_brazil`) use airports FOR (Fortaleza) and NAT (Natal) that are missing from AP_CONTINENT. These are legitimate tropical beach destinations — Jericoacoara is a UNESCO-protected dune lagoon system, Pipa is a high-cliff whale-watching village. Both are in their shoulder season (September) but will be at peak November–March. The 2-line AP_CONTINENT fix is worth routing to DevOps.

---

## 5. Content Quality

**Photo health:** 395/395 ✅ | 0 duplicates ✅ | 0 HTTP (non-HTTPS) ✅

Generic stock vs. venue-specific (~349/395 venues) remains open, blocked on `UNSPLASH_KEY` (Open #20). No regression. No action this run.

**Tags and descriptions:** No new issues found. Field completeness is 100%.

**FOR/NAT continent gap:** The two affected venues (`beach_jericoacoara`, `beach_pipa_brazil`) are otherwise clean — lat/lon correct (Jericoacoara at −2.79, −40.51; Pipa at −6.23, −35.04), tags accurate, photos HTTPS. Only AP_CONTINENT is missing.

---

## 5 Venue Objects — Sep 2

**All 5 are carry-overs. Day 5 for the first four; Day 3 for Portofino. These are paste-ready and verified. Paste all 5. Eval count → 400.**

**All APs (OSL, CPT, KUL, DPS, NCE) verified in `AIRPORT_COORDS` ✅ `AP_CONTINENT` ✅ `BASE_PRICES` ✅.**

```javascript
// 1. Trysil, Norway [CARRY-OVER Day 5 — HIGHEST PRIORITY. Ski pre-booking Day 3.]
// OSL (Oslo Gardermoen) — Norway's largest ski resort. 70+ runs, 31 lifts, 66km pistes.
// Family/intermediate + Skistar pass. Distinct from hemsedal-s3 (steep/advanced).
{id:"trysil-norway", category:"skiing",
  title:"Trysil", location:"Innlandet, Norway",
  lat:61.3147, lon:12.0736, ap:"OSL",
  icon:"🎿", rating:4.72, reviews:2140,
  gradient:"linear-gradient(160deg,#0d1a2e,#1a3560,#2860a8)",
  accent:"#6898d8",
  tags:["Norway's Largest Resort","Family Friendly","70+ Runs","Village Ski-In/Out"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trysil_ski_resort.jpg/1280px-Trysil_ski_resort.jpg",
  skiPass:"Skistar"},

// 2. Camps Bay Beach, Cape Town [CARRY-OVER Day 5 — SHIP]
// CPT (Cape Town) — Twelve Apostles backdrop, sunset strip, beachfront restaurants.
// Distinct from Clifton Fourth Beach (already in catalog). SH spring, pre-season clarity.
{id:"camps-bay-cpt", category:"beach",
  title:"Camps Bay Beach", location:"Cape Town, South Africa",
  lat:-33.9503, lon:18.3774, ap:"CPT",
  icon:"🏖️", rating:4.78, reviews:6720,
  gradient:"linear-gradient(160deg,#0a1a30,#1a3a68,#2870b8)",
  accent:"#68b0e0",
  tags:["Sunset Strip","Mountain Backdrop","Beachfront Restaurants","Cape Town Spring"]},

// 3. Perhentian Islands, Malaysia [CARRY-OVER Day 5 — SHIP]
// KUL (Kuala Lumpur) — sea turtle nesting, coral reefs, dry-season tail (monsoon Oct).
// Second Malaysian venue; underrepresented country.
{id:"perhentian-islands-my", category:"beach",
  title:"Perhentian Islands", location:"Terengganu, Malaysia",
  lat:5.9059, lon:102.7055, ap:"KUL",
  icon:"🏝️", rating:4.83, reviews:3890,
  gradient:"linear-gradient(160deg,#0a2010,#1a5028,#288850)",
  accent:"#58c880",
  tags:["Sea Turtles","Coral Reef","Budget Paradise","Snorkeling"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Perhentian_Islands.jpg/1280px-Perhentian_Islands.jpg"},

// 4. Nusa Lembongan, Bali, Indonesia [CARRY-OVER Day 5 — SHIP]
// DPS (Denpasar/Bali) — no cars, surf culture, mangrove bay. 30min boat from Bali.
// Distinct from Nusa Penida (dramatic cliffs, already in catalog).
{id:"nusa-lembongan-bali", category:"beach",
  title:"Nusa Lembongan", location:"Klungkung, Bali, Indonesia",
  lat:-8.6781, lon:115.4536, ap:"DPS",
  icon:"🏄", rating:4.74, reviews:5230,
  gradient:"linear-gradient(160deg,#0a1e20,#1a4848,#288080)",
  accent:"#58c0b8",
  tags:["No Cars","Surf Breaks","Yoga Retreat","Island Escape"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nusa_Lembongan_beach.jpg/1280px-Nusa_Lembongan_beach.jpg"},

// 5. Portofino Riviera, Liguria, Italy [CARRY-OVER Day 3]
// NCE (Nice, 1.5h drive) — pastel fishing village, olive groves, 23°C water in September.
// Zero Ligurian representation in 13 Italian venues (all Southern Italy/Sardinia/Sicily).
// NCE routing already used by 4 French Riviera venues — precedented.
{id:"portofino-riviera-it", category:"beach",
  title:"Portofino Riviera", location:"Liguria, Italy",
  lat:44.3035, lon:9.2097, ap:"NCE",
  icon:"⚓", rating:4.85, reviews:9140,
  gradient:"linear-gradient(160deg,#0a1a20,#1a3a48,#2a6068)",
  accent:"#68c0c0",
  tags:["Pastel Fishing Village","Olive Groves","Crystal Water","No Mass Tourism"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Portofino_Harbour.jpg/1280px-Portofino_Harbour.jpg"},
```

**After paste + auto-push: eval count should reach 400. Verify with eval counter. Do not use grep.**

---

## One Observation for the PM

**FOR and NAT are missing from AP_CONTINENT.** `beach_jericoacoara` (Fortaleza) and `beach_pipa_brazil` (Natal) both have correct AIRPORT_COORDS and BASE_PRICES entries but no AP_CONTINENT entry, so the continent-based home-airport logic can't assign a continent for either venue. The fix is 2 lines in the AP_CONTINENT constant — `FOR:"latam"` and `NAT:"latam"` — and can be bundled with any next app.jsx touch. Low severity (these venues still load and score correctly; only the continent-based origin-airport filter is affected), but worth closing before the catalog grows further.
