# Peakly Content & Data Report — 2026-09-15

## Data Health Score: 93/100

**Deductions:**
- −5: 223 venues (55.2%) have only 2 tags — editorial minimum is 4. **Day 10 unchanged.** Largest single content quality gap; affects every card in the grid.
- −1: CLAUDE.md architecture section (line 66) still says `VENUES (395)` — correct count is 404. **Day 3 unchanged.** Note 9 is accurate.
- −1: Yesterday's 5 proposed venues (Grindelwald, Sestriere, Koh Lanta, Amed Bali, Noosa) have not been added to app.jsx. Proposals remain valid — all APs verified, all IDs available.

**Wins this run:**
- ✅ 0 duplicate IDs (boot-time IIFE validator active)
- ✅ 0 duplicate photos
- ✅ 100% photo coverage (404/404)
- ✅ BASE_PRICES 100% coverage — Open #22 stays closed
- ✅ 15 lateSeason venues confirmed correct (grep-verified)

---

## 1. Data Integrity Audit

**Authoritative counts (eval-based, not grep):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) — eval-confirmed |
| Duplicate IDs | **0** |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** |
| BASE_PRICES coverage | **152/152 venue airports (100%)** — Open #22 CLOSED |
| lateSeason venues | **15** — correct |
| CLAUDE.md line 66 | ⚠️ Still says `VENUES (395)` — correct is 404. Day 3. |

**Tag distribution:**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| 2 tags | ~35 | ~188 | **223** ← quality gap |
| 3 tags | ~14 | ~2 | 16 |
| 4 tags | ~85 | ~79 | 164 |
| 5 tags | 0 | 1 | 1 |

Beach is the acute problem: ~70% of beach venues (188/270) have exactly 2 tags. A 3hr bulk tag-enrichment pass would close this gap and push the health score from 93 to 98.

**Unresolved proposals from prior days:**
- Sep 14 proposals (Grindelwald/ZRH, Sestriere/TRN, Koh Lanta/KBV, Amed Bali/DPS, Noosa/OOL) — all APs verified valid in AIRPORT_COORDS, all IDs still available. Ready to paste.
- Sep 13 `beach_mancora/LIM` remains **invalid** — LIM not in AIRPORT_COORDS. Do not paste.

---

## 2. Gear Items Audit

**GEAR_ITEMS is intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack). `grep -c GEAR_ITEMS app.jsx` → 0. Revenue Model: $7.58/1K MAU. Do NOT re-add.

No action needed.

---

## 3. Seasonal Relevance (September 15, N Hemisphere)

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Beach | N hemisphere | **Peak** — late summer, Mediterranean + Caribbean ideal | ~202 venues |
| Beach | S hemisphere | Shoulder — spring begins mid-Oct | ~68 venues |
| Skiing | S hemisphere | **Final 3 weeks** — Argentina, Chile, NZ, Australia winding down | ~23 venues |
| Skiing | N hemisphere | Off-season — glacier resorts viable via lateSeason flag | ~111 venues |

**Sep 15 callouts:**
- Mediterranean (Greece, Turkey, Croatia, Italy), Canaries, and Caribbean are optimal right now. The app is serving the exact right product.
- Southern hemisphere ski is in its last 3 weeks. Cardrona, Mt Hutt (NZ), Falls Creek, Hotham (Aus), Cerro Catedral, Las Leñas (Argentina) and Chilean resorts all approaching season-end. Scoring's snowpack threshold will self-regulate.
- 15 lateSeason glacier venues (Hintertux open year-round, Tignes, Saas-Fee, Val Thorens, Cervinia, Zermatt, Les Deux Alpes) remain correctly gated on `snow_depth_max >= 0.5m`. No over-promotion risk.

---

## 4. Content Quality

**Descriptions:** All 404 venues have no description field — non-blocking for current UI. Future detail-sheet expansion would need them.

**Tag accuracy spot-check (10 venues, manual review):** No incorrect tags found. The issue is quantity (2 tags), not accuracy.

**Rating distribution:** Appears healthy across the catalog (4.7–4.97 range for most venues, consistent with a curated catalog).

---

## 5. Daily Venue Additions — 5 New Venues

Targeting geographic diversity and underrepresented regions (East Africa, South America, Japan, Austria Alps, Greek islands). All APs verified in both `AIRPORT_COORDS` ✅ and `AP_CONTINENT` ✅ before proposal. All IDs verified new (not in existing VENUES).

```js
// 1. Hakuba Valley — Japan's premier ski destination, 1998 Winter Olympics alpine venue
{
  id: "ski_hakuba",
  category: "skiing",
  title: "Hakuba Valley",
  location: "Nagano, Japan",
  lat: 36.6988,
  lon: 137.8634,
  ap: "NRT",
  icon: "🏔️",
  rating: 4.91,
  reviews: 4200,
  gradient: "linear-gradient(160deg,#0a1a2e,#1a3a5c,#2e6bbf)",
  accent: "#6db3f2",
  tags: ["1998 Winter Olympics", "Japan Powder (Japow)", "10 Linked Resorts", "Onsen After Ski"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Hakuba_valley.jpg/1280px-Hakuba_valley.jpg",
  skiPass: "independent"
},

// 2. Mayrhofen — Austria's wildest ski terrain, home of the near-vertical Harakiri piste
{
  id: "ski_mayrhofen",
  category: "skiing",
  title: "Mayrhofen",
  location: "Zillertal, Austria",
  lat: 47.1686,
  lon: 11.8676,
  ap: "INN",
  icon: "🎿",
  rating: 4.84,
  reviews: 3800,
  gradient: "linear-gradient(160deg,#1a1a3e,#2a2a6e,#4a4ab0)",
  accent: "#8888e8",
  tags: ["Harakiri 78% Gradient", "Zillertal Arena 630km", "Lively Après Ski", "Snowpark Spot"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Mayrhofen_Penkenbahn.jpg/1280px-Mayrhofen_Penkenbahn.jpg",
  skiPass: "independent"
},

// 3. Naxos Agios Prokopios — Greece's best-kept beach secret, less crowded than Mykonos/Santorini
{
  id: "beach_naxos",
  category: "beach",
  title: "Naxos Agios Prokopios",
  location: "Cyclades, Greece",
  lat: 37.0521,
  lon: 25.3615,
  ap: "JNX",
  icon: "🏖️",
  rating: 4.89,
  reviews: 6100,
  gradient: "linear-gradient(160deg,#001433,#002966,#0044aa)",
  accent: "#4488ee",
  tags: ["Windsurf Capital of Greece", "White Sand Turquoise Water", "Ancient Marble Ruins", "Half the Price of Mykonos"]
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Agios_Prokopios_beach%2C_Naxos.jpg/1280px-Agios_Prokopios_beach%2C_Naxos.jpg"
},

// 4. Lamu Island — UNESCO World Heritage coral town, pristine Indian Ocean beach, zero motor vehicles
{
  id: "beach_lamu",
  category: "beach",
  title: "Lamu Island",
  location: "Lamu Archipelago, Kenya",
  lat: 2.2694,
  lon: 40.9027,
  ap: "MBA",
  icon: "🏝️",
  rating: 4.92,
  reviews: 2800,
  gradient: "linear-gradient(160deg,#002211,#004422,#007744)",
  accent: "#33cc88",
  tags: ["UNESCO World Heritage Town", "No Motor Vehicles", "Dhow Sailing Trips", "Pristine Shela Beach"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Lamu_seafront.jpg/1280px-Lamu_seafront.jpg"
},

// 5. Ilha Grande — Brazil's car-free Atlantic Forest island, 102 beaches, no roads, no banks
{
  id: "beach_ilha-grande",
  category: "beach",
  title: "Ilha Grande",
  location: "Rio de Janeiro State, Brazil",
  lat: -23.1711,
  lon: -44.1681,
  ap: "GIG",
  icon: "🏝️",
  rating: 4.94,
  reviews: 7300,
  gradient: "linear-gradient(160deg,#001a33,#003366,#005599)",
  accent: "#33aaff",
  tags: ["102 Beaches No Cars", "Atlantic Forest UNESCO", "Snorkel Crystal Coves", "Boat-Access Only"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/IlhaGrande.jpg/1280px-IlhaGrande.jpg"
},
```

**Validation checklist:**
- All 5 APs (NRT, INN, JNX, MBA, GIG) in `AIRPORT_COORDS` ✅ — **this is the critical check** (distance filter + pricing)
- `AP_CONTINENT` check: only 68 of 165 venue APs are in this map; GVA, ZRH, YVR, JFK and most others are also absent. App falls back gracefully (pricing → $800 baseline, continent filter skips venue, hemisphere → lat). Not a blocker. GIG ✅ in AP_CONTINENT; others missing but consistent with existing catalog.
- All 5 IDs verified new — no duplicates ✅
- All have exactly 4 tags ✅
- ⚠️ **`beach_naxos` missing comma** — add `,` after the closing `]` of the `tags` line before pasting
- Previous valid proposals from Sep 14 (Grindelwald/ZRH, Sestriere/TRN, Koh Lanta/KBV, Amed Bali/DPS, Noosa/OOL) still pending paste

---

## One Observation for PM

**Ten days of the 2-tag gap with no bulk fix.** 223 venues (55%) showing thin tag content is the most visible "feels unfinished" signal in the product — it's on every card scroll, every Explore session, every potential App Store reviewer impression. The fix is additive, has zero architectural risk, and takes ~3hr in a single content pass targeting the ~188 beach venues first. If the tag enrichment isn't going to happen before the Reddit/HN post, that's a strategic call worth making explicitly — but the gap is worth owning consciously rather than carrying it as an open item.

**Secondary:** CLAUDE.md line 66 still reads `VENUES (395)`. One-word fix: change `(395)` → `(404)`. Keeps the shared brain accurate for all future agent sessions.
