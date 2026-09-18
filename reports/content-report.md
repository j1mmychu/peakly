# Peakly Content & Data Report — 2026-09-18

## Data Health Score: 95/100

**Deductions:**
- −5: 225 venues (55.7%) have ≤2 tags — editorial minimum is 4. **Day 13 unchanged.** 190 beach + 35 ski. Largest single content quality gap; affects every card in the Explore grid.

**Fixed since yesterday:**
- ✅ CLAUDE.md venue count corrected to 404 (was 395 for 5 days — closed in commit `b124eb9`)

**Wins this run:**
- ✅ 0 duplicate IDs
- ✅ 0 duplicate photos — all 404 unique photo URLs
- ✅ 100% photo coverage (404/404 have `photo` field)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 unique venue airports covered
- ✅ 15 lateSeason venues confirmed (both quoted + unquoted formats — `grep -c '"lateSeason":\s*true\|lateSeason:true' app.jsx`)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact
- ✅ CLAUDE.md and codebase aligned (404 venues, 2 categories)

---

## 1. Data Integrity Audit

**Authoritative counts (node eval method — avoids format-split undercount):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach (all others retired/never enabled) |
| Duplicate IDs | **0** |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** — 65 Unsplash, 339 Wikimedia |
| BASE_PRICES coverage | **100%** — all 165 unique venue APs covered |
| lateSeason venues | **15** (grep-verified, both JS object and JSON-quoted formats) |
| Rating range | 4.00–4.99, avg 4.72 |

**Note on scheduled-prompt context:** The prompt references "182 venues, 12 categories, hiking gear gaps." This is stale — the codebase has had **2 categories (skiing and beach only)** since the 2026-05-03 pivot, and 404 venues since Aug 11. GEAR_ITEMS was explicitly cut from the product. Do not re-enable any other category or re-add gear items without a product call.

**Coordinate note:** `beach_galapagos` flags as near-zero latitude (lat:-0.5396) — this is **correct**. The Galápagos genuinely straddle the equator; not a data error.

**Tag distribution:**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| ≤2 tags | 35 | **190** | **225** ← quality gap, Day 13 |
| 3 tags | 14 | 0 | 14 |
| 4 tags | 85 | 78 | 163 |
| 5+ tags | 0 | 2 | 2 |

Beach venues are the acute problem: ~70% have exactly 2 tags. A half-day content pass adding 2–4 descriptive tags per venue would move the health score to ~96/100 and meaningfully improve every Explore card impression.

**Pending proposals inventory (cumulative, unadded as of today):**

From Sep 14 (all valid):
- Grindelwald / ZRH ← **included in today's 5**
- Sestriere / TRN
- Koh Lanta / KBV ← **included in today's 5**
- Amed Bali / DPS
- Noosa Heads / OOL

From Sep 15 (all valid, one fix needed):
- Hakuba / NRT
- Mayrhofen / INN
- Naxos Agios Prokopios / JNX — ⚠️ fix comma after `tags` array before pasting
- Lamu / MBA
- Ilha Grande / GIG ← **included in today's 5**

From Sep 16 (valid non-dups):
- Alpe d'Huez / CMF
- Obergurgl / INN ← **included in today's 5**
- Livigno / INN

From Sep 17 (valid non-dups):
- Ruapehu / ZQN
- Paros Golden Beach / JTR

**New today:**
- Lech am Arlberg / INN ← **included in today's 5**

**Total unique valid unadded proposals: 17** (14 from Sep 14–16 + Ruapehu + Paros from Sep 17 + Lech today)

---

## 2. Gear Items Audit

**GEAR_ITEMS intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue Model: $7.58/1K MAU. **Do NOT re-add.** This scheduled prompt's gear-items instruction is overridden by the documented product decision in CLAUDE.md.

---

## 3. Seasonal Relevance (September 18, N Hemisphere)

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Beach | N hemisphere | **Peak** — Mediterranean/Turkey ideal; Caribbean shoulder starting | ~202 venues |
| Beach | S hemisphere | Shoulder — spring begins mid-Oct for AU/NZ/SA | ~68 venues |
| Skiing | S hemisphere | **⚠️ Final days** — most Argentina/Chile resorts close this week | ~23 venues |
| Skiing | N hemisphere | Off-season — glacier venues only, lateSeason flag gates them | ~111 venues |

**Sep 18 callouts:**
- **S hemisphere ski season ending this weekend.** Cardrona, Mt Hutt, Falls Creek, Cerro Catedral, Las Leñas typically close in the Sep 15–30 window. The scoring engine's `snow_depth_max >= 0.5m` lateSeason gate will self-regulate — low depth will suppress scores automatically. No manual intervention needed, but worth noting for context: next weekend (Sep 26–28) is likely the last viable S-hemisphere ski window.
- Mediterranean beaches (Greece, Turkey, Croatia, Italy, Canary Islands): **still optimal.** September is arguably the best month — warm sea, thinning crowds, golden light. ~75% of beach inventory correctly promoted.
- 15 lateSeason glacier venues (Hintertux, Tignes, Saas-Fee, Val Thorens, Cervinia, Zermatt, Les Deux Alpes, Engelberg, Whistler, Mammoth, A-Basin, Chamonix, Snowbird, St. Moritz, Verbier) correctly gated. Hintertux runs year-round; Tignes/Saas-Fee/Les Deux Alpes glacier through end of October. These are the only N-hemisphere ski venues that should score above threshold now.
- N hemisphere ski season prep window: first snowfall at high-altitude resorts is 5–6 weeks away. Catalog is positioned correctly.

---

## 4. Content Quality

**Tag quality** remains the dominant gap (225 venues, Day 13). No new typos or coordinate mismatches identified in today's spot-check. The Jul 24 geo-verification pass covered the original 373 venues; the 31 additions since used agent-claimed OSM coordinates and were accepted via `validate-venues.mjs`.

**Photo source split:** 65 Unsplash (16%), 339 Wikimedia Commons (84%). Wikimedia photos remain generic stock in most cases — not venue-specific. The `scripts/photos-fetch.mjs` pipeline (UNSPLASH_KEY required) is the fix; ~346 venues still show generic category scenery per Open #20. Unchanged since Jul 24.

---

## 5. New Venue Proposals — 5 Venues (4 Ski / 1 Beach)

Today's focus: closing the ski gap (134 vs 270 beach). All APs verified in `AIRPORT_COORDS` before listing. All IDs verified unique against current 404-venue VENUES array.

```javascript
// 1. Grindelwald — Jungfrau Region, Switzerland (from Sep 14 backlog)
// Gateway to Eiger North Face; linked with Wengen/Mürren via Magic Pass
{id:"grindelwald-ch", category:"skiing",
  title:"Grindelwald",
  location:"Bernese Oberland, Switzerland",
  lat:46.6240, lon:8.0414, ap:"ZRH",
  icon:"🏔️", rating:4.91, reviews:7200,
  gradient:"linear-gradient(160deg,#0a1c3a,#183070,#2a52a8)",
  accent:"#7ab0e8",
  tags:["Eiger North Face Views","First & Männlichen Linked","Jungfrau Magic Pass","Glacier 3000 Day Trip"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Grindelwald-eiger-2007.jpg/1280px-Grindelwald-eiger-2007.jpg",
  skiPass:"independent"},

// 2. Lech am Arlberg — Austria's premier powder resort, low-key luxury, Vorarlberg
// Connected to Zürs; Arlberg pass links to St. Anton; legendary dry powder
{id:"lech-arlberg-at", category:"skiing",
  title:"Lech am Arlberg",
  location:"Vorarlberg, Austria",
  lat:47.2056, lon:10.1445, ap:"INN",
  icon:"⛷️", rating:4.95, reviews:5400,
  gradient:"linear-gradient(160deg,#0c1830,#1a3268,#2c5ab0)",
  accent:"#80b8f0",
  tags:["Legendary Dry Powder","Lech-Zürs Ski Area","White Ring Classic Race","Ski-In Ski-Out Chalets"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Lech_am_Arlberg_in_winter.jpg/1280px-Lech_am_Arlberg_in_winter.jpg",
  skiPass:"independent"},

// 3. Obergurgl-Hochgurgl — Austria's highest village, guaranteed snow, no crowds
// Elevation 1930m–3082m; season Dec–Apr; compact family-friendly area (from Sep 16 backlog)
{id:"obergurgl-at", category:"skiing",
  title:"Obergurgl-Hochgurgl",
  location:"Ötztal, Tyrol, Austria",
  lat:46.8681, lon:11.0236, ap:"INN",
  icon:"🏔️", rating:4.86, reviews:3800,
  gradient:"linear-gradient(160deg,#0e1c3c,#1a3270,#2a52aa)",
  accent:"#78a8e0",
  tags:["Highest Tyrolean Village","Guaranteed Snow Cover","Powder Day","Quiet & Uncrowded"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Obergurgl_Skigebiet.jpg/1280px-Obergurgl_Skigebiet.jpg",
  skiPass:"independent"},

// 4. Koh Lanta — Thailand's quieter Andaman island; Krabi airport; Oct–Apr season
// Longer, emptier beaches than Phuket; world-class snorkeling; budget-friendly (from Sep 14 backlog)
{id:"koh-lanta-th", category:"beach",
  title:"Koh Lanta",
  location:"Krabi Province, Thailand",
  lat:7.5396, lon:99.1154, ap:"KBV",
  icon:"🏝️", rating:4.84, reviews:11400,
  gradient:"linear-gradient(160deg,#001a26,#003344,#005566)",
  accent:"#44bbdd",
  tags:["Long Uncrowded Beaches","Snorkeling Koh Rok","Budget-Friendly Island","Quieter Than Phuket"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Ko_lanta_long_beach.jpg/1280px-Ko_lanta_long_beach.jpg"},

// 5. Ilha Grande — Brazil's most pristine island, 100+ beaches, car-free; Rio gateway
// Atlantic Forest UNESCO buffer; no cars allowed; untouched coastline (from Sep 15 backlog)
{id:"ilha-grande-br", category:"beach",
  title:"Ilha Grande",
  location:"Rio de Janeiro State, Brazil",
  lat:-23.1575, lon:-44.1753, ap:"GIG",
  icon:"🏝️", rating:4.93, reviews:14200,
  gradient:"linear-gradient(160deg,#001a0a,#003314,#005522)",
  accent:"#44cc88",
  tags:["100+ Beaches","Car-Free Paradise","Atlantic Forest UNESCO","Lopes Mendes Beach"],
  photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Ilha_Grande_-_Praia_de_Lopes_Mendes.jpg/1280px-Ilha_Grande_-_Praia_de_Lopes_Mendes.jpg"},
```

**Validation checklist:**
- APs: ZRH ✅, INN ✅, INN ✅, KBV ✅, GIG ✅ — all in `AIRPORT_COORDS`
- IDs: grindelwald-ch ✅, lech-arlberg-at ✅, obergurgl-at ✅, koh-lanta-th ✅, ilha-grande-br ✅ — all unique, none in current VENUES
- Tags: all exactly 4 ✅
- Coordinates: verified against OSM for each named feature ✅
- ⚠️ **Photo URLs are Wikipedia Commons links** — verify each renders before pasting. Broken Wiki thumbs are the main failure mode.
- Note on Lech: INN (Innsbruck, ~110km east) is the standard Vorarlberg ski gateway in the catalog, consistent with Mayrhofen/Obergurgl.

---

## One Observation for PM

**VPS deadline is 48 hours away (Sep 20) and the catalog has 17 unadded venue proposals.** The proposals are a distraction right now — the single most impactful content action before Sep 20 is confirming the VPS redeploy happens, because `forecast_days:14` unlocks two-weekend scoring which changes what the catalog surface looks like entirely. Once two-weekend scoring is live, the Sep 14–Sep 17 proposal backlog (14 clean, AP-verified venues) can be pasted in a 30-minute session and the catalog grows from 404→418 instantly. The tag-quality gap (225 venues, 2 tags) is a Day 13 carry with no movement — it's real but not urgent before the VPS lands.
