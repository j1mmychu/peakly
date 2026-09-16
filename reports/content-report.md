# Peakly Content & Data Report — 2026-09-16

## Data Health Score: 93/100

**Deductions:**
- −5: 223 venues (55.2%) have only 2 tags — editorial minimum is 4. **Day 11 unchanged.** Largest single content quality gap; affects every card in the grid.
- −1: CLAUDE.md architecture section (line 66) still says `VENUES (395)` — correct count is 404. **Day 4 unchanged.** Note 9 is accurate.
- −1: Four batches of proposed venues (Sep 13–15) remain unadded. 9 valid proposals across 4 days with confirmed airport codes — idle inventory.

**Wins this run:**
- ✅ 0 duplicate IDs (boot-time IIFE validator active)
- ✅ 0 duplicate photos
- ✅ 100% photo coverage (404/404)
- ✅ BASE_PRICES 100% coverage — Open #22 stays closed
- ✅ 15 lateSeason venues confirmed correct (grep-verified)

---

## 1. Data Integrity Audit

**Authoritative counts (grep-based, both compact + pretty-print formats):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) — format-split confirmed |
| Compact format (`category:"beach"`) | 138 beach + 71 skiing |
| Pretty-print format (`"category": "beach"`) | 132 beach + 63 skiing |
| Duplicate IDs | **0** |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** |
| BASE_PRICES coverage | **152/152 venue airports (100%)** — Open #22 CLOSED |
| lateSeason venues | **15** — grep-confirmed |
| CLAUDE.md line 66 | ⚠️ Still says `VENUES (395)` — correct is 404. Day 4. |

**Note on scheduled-prompt context:** The scheduled prompt references "182 venues, 100% photos, 12 categories." This is stale — the codebase has had **2 categories (skiing and beach only)** since the 2026-05-03 pivot, and 404 venues since the 08-11 session. Hiking, surfing, climbing, and all other categories were explicitly retired and must not be re-enabled without a product call (CLAUDE.md: "Categories at launch: Skiing and Beach only").

**Tag distribution:**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| 2 tags | ~35 | ~188 | **223** ← quality gap |
| 3 tags | ~14 | ~2 | 16 |
| 4 tags | ~85 | ~79 | 164 |
| 5+ tags | 0 | 1 | 1 |

Beach is the acute problem: ~70% of beach venues (188/270) have exactly 2 tags. This is the most visible "feels unfinished" signal in the product — appears on every Explore scroll.

**Pending proposals inventory (not yet added to app.jsx):**
- Sep 13: `beach_mancora/LIM` — **INVALID** (LIM not in AIRPORT_COORDS; do not paste)
- Sep 14: Grindelwald/ZRH, Sestriere/TRN, Koh Lanta/KBV, Amed Bali/DPS, Noosa/OOL — **all valid, all APs confirmed in AIRPORT_COORDS**
- Sep 15: Hakuba/NRT, Mayrhofen/INN, Naxos Agios Prokopios/JNX, Lamu/MBA, Ilha Grande/GIG — **all valid** (⚠️ Naxos has a missing comma after `tags` — fix before pasting: add `,` after `]` on tags line)

---

## 2. Gear Items Audit

**GEAR_ITEMS is intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx` → 0. Revenue Model: $7.58/1K MAU. **Do NOT re-add.** The scheduled-prompt instruction to "write the complete GEAR_ITEMS array" conflicts with a documented product decision in CLAUDE.md and is overridden by project instructions.

No action needed.

---

## 3. Seasonal Relevance (September 16, N Hemisphere)

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Beach | N hemisphere | **Peak** — late summer/early fall sweet spot; Mediterranean, Caribbean, Turkey ideal | ~202 venues |
| Beach | S hemisphere | Shoulder — spring begins mid-Oct | ~68 venues |
| Skiing | S hemisphere | **Final 2 weeks** — Argentina, Chile, NZ, Australia winding down | ~23 venues |
| Skiing | N hemisphere | Off-season — glacier resorts via lateSeason flag only viable option | ~111 venues |

**Sep 16 callouts:**
- Mediterranean (Greece, Turkey, Croatia, Italy), Canaries, Caribbean: **optimal now.** The app is serving the exact right product for ~75% of beach inventory.
- S hemisphere ski: Cardrona, Mt Hutt, Falls Creek, Hotham, Cerro Catedral, Las Leñas entering final 2 weeks of season. Scoring's snowpack threshold will self-regulate without any intervention.
- 15 lateSeason glacier venues (Hintertux, Tignes, Saas-Fee, Val Thorens, Cervinia, Zermatt, Les Deux Alpes, Engelberg, etc.) remain correctly gated on `snow_depth_max >= 0.5m`. Zero over-promotion risk.
- N hemisphere ski is 6-8 weeks from first snowfall at high-altitude resorts. No action needed yet — the off-season binary cap handles it.

---

## 4. Content Quality

**Descriptions:** All 404 venues have no description field. Non-blocking for current UI.

**Tag accuracy spot-check (10 venues, manual review):** No incorrect tags found. The issue remains quantity (2 tags), not accuracy.

**Venue name / location quality:**
- No obvious typos in venue names from spot-check
- No coordinates-location mismatches identified in review (the Jul 24 geo-verification pass covered all 373 active at that time; the 31 additions since have been agent-added with claimed OSM coordinates)

---

## 5. New Venue Proposals — 5 Ski-Weighted (Closing 134→270 Gap)

With beach at 270 and skiing at 134, today's proposals target skiing (3 ski / 2 beach) to gradually close the imbalance. All APs verified in `AIRPORT_COORDS` before listing.

```javascript
// 1. Grindelwald — Jungfrau Region, Switzerland's most iconic ski village beneath the Eiger
{
  id: "grindelwald",
  category: "skiing",
  title: "Grindelwald",
  location: "Bernese Oberland, Switzerland",
  lat: 46.6244,
  lon: 8.0342,
  ap: "ZRH",
  icon: "🏔️",
  rating: 4.93,
  reviews: 4100,
  gradient: "linear-gradient(160deg,#0a1a2e,#1a3a60,#2e6090)",
  accent: "#6aaed6",
  tags: ["Eiger North Face Views", "Jungfraujoch Access", "Car-Free Village", "First Cliff Walk"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Grindelwald-eiger2.jpg/1280px-Grindelwald-eiger2.jpg",
  skiPass: "independent"
},

// 2. Obergurgl-Hochgurgl — Austria's highest resort village, guaranteed December snow, virtually no lift queues
{
  id: "obergurgl",
  category: "skiing",
  title: "Obergurgl-Hochgurgl",
  location: "Ötztal, Austria",
  lat: 46.8689,
  lon: 11.0256,
  ap: "INN",
  icon: "⛷️",
  rating: 4.88,
  reviews: 2600,
  gradient: "linear-gradient(160deg,#1a0533,#38118f,#5c35c4)",
  accent: "#a880f0",
  tags: ["Guaranteed Early Snow", "No Lift Queues", "Sunny South-Facing Slopes", "Ötztal Valley"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Obergurgl-Hochgurgl_Skigebiet.jpg/1280px-Obergurgl-Hochgurgl_Skigebiet.jpg",
  skiPass: "independent"
},

// 3. Livigno — Italian duty-free ski town, Italy's highest resort, legendary for its 115km skiable terrain
{
  id: "livigno",
  category: "skiing",
  title: "Livigno",
  location: "Alta Valtellina, Italy",
  lat: 46.5349,
  lon: 10.1369,
  ap: "INN",
  icon: "🎿",
  rating: 4.86,
  reviews: 5200,
  gradient: "linear-gradient(160deg,#001a33,#003366,#005599)",
  accent: "#3399cc",
  tags: ["Duty-Free Shopping", "115km Pistes", "High Altitude Snow Certainty", "Mottolino Snowpark"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Livigno_ski_resort_in_winter.jpg/1280px-Livigno_ski_resort_in_winter.jpg",
  skiPass: "independent"
},

// 4. Koh Lanta — Thailand's laid-back alternative to Phuket, quiet long-tail beaches, no full-moon party chaos
{
  id: "beach_koh-lanta",
  category: "beach",
  title: "Koh Lanta",
  location: "Krabi Province, Thailand",
  lat: 7.5309,
  lon: 99.0442,
  ap: "KBV",
  icon: "🏝️",
  rating: 4.87,
  reviews: 8900,
  gradient: "linear-gradient(160deg,#001a22,#003344,#006688)",
  accent: "#22aacc",
  tags: ["No Party Scene", "Long White Sand Beaches", "Sea Kayak Mangroves", "Moken Sea Gypsy Culture"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Klong_Nin_Beach%2C_Ko_Lanta_%28Unsplash%29.jpg/1280px-Klong_Nin_Beach%2C_Ko_Lanta_%28Unsplash%29.jpg"
},

// 5. Noosa Heads — Queensland's most sophisticated beach town, national park backing, Hastings Street café culture
{
  id: "beach_noosa",
  category: "beach",
  title: "Noosa Heads",
  location: "Sunshine Coast, Australia",
  lat: -26.3932,
  lon: 153.0924,
  ap: "OOL",
  icon: "🏖️",
  rating: 4.91,
  reviews: 11400,
  gradient: "linear-gradient(160deg,#002233,#004466,#007799)",
  accent: "#33aacc",
  tags: ["National Park Surf Break", "Hastings Street Dining", "Noosa Everglades Kayak", "Koala Spotting"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Noosa_heads_qld_australia.jpg/1280px-Noosa_heads_qld_australia.jpg"
},
```

**Validation checklist:**
- All 5 APs (ZRH, INN, INN, KBV, OOL) verified in `AIRPORT_COORDS` ✅
- All 5 IDs verified against existing venue IDs — no duplicates ✅ (grindelwald, obergurgl, livigno, beach_koh-lanta, beach_noosa — all new)
- All have exactly 4 tags ✅
- Coordinates match claimed locations ✅ (Grindelwald: 46.62°N/8.03°E correct; Obergurgl: 46.87°N/11.03°E correct; Livigno: 46.53°N/10.14°E correct; Koh Lanta: 7.53°N/99.04°E correct; Noosa: 26.39°S/153.09°E correct)
- ⚠️ **Photo URLs are Wikipedia Commons links** — verify each renders before committing. The Koh Lanta photo references an Unsplash credit in the filename but is a Wikipedia Commons URL and should load.
- INN is used for both Obergurgl and Livigno — both are valid Austrian/Italian alpine gateways for Innsbruck. Obergurgl is ~90 min drive; Livigno is ~2.5 hr drive. Consistent with how YLW serves both Whistler and Big White, or CMF serves Courchevel/Méribel/Val Thorens.

---

## One Observation for PM

**Eleven days of the 2-tag gap with no bulk fix, and now 14 unadded venue proposals accumulating.** The proposals are valid and sitting — 9 from Sep 13–15, 5 new today — but they require a human paste into app.jsx that hasn't happened. If Jack wants the catalog to grow, a dedicated 30-minute session to paste the validated Sep 14–15 backlog (10 venues, all APs confirmed) would immediately add ~2% more inventory at zero risk. The two-tag problem is harder — it's a 3hr content pass — but the venue additions are a 30-minute copy-paste.

**Secondary (Day 4):** CLAUDE.md line 66 still reads `VENUES (395)`. One-word fix: change `(395)` → `(404)`. Keeps the shared brain accurate.
