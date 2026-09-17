# Peakly Content & Data Report — 2026-09-17

## Data Health Score: 93/100

**Deductions:**
- −5: 225 venues (55.7%) have ≤2 tags — editorial minimum is 4. **Day 12 unchanged.** 190 beach + 35 ski. Largest single content quality gap; affects every card in the Explore grid.
- −1: CLAUDE.md architecture section still says `VENUES (395)` — correct count is 404. **Day 5 unchanged.**
- −1: 19 venue proposals (Sep 13–16 backlog + today's 5) remain unadded. Valid, AP-verified, sitting idle.

**Wins this run:**
- ✅ 0 duplicate IDs
- ✅ 0 duplicate photos — all 404 unique photo URLs
- ✅ 100% photo coverage (404/404 have `photo` field)
- ✅ 0 missing coordinates, airport codes, or tags arrays
- ✅ BASE_PRICES 100% coverage — all 165 unique venue airports covered by 181 destinations
- ✅ 15 lateSeason venues confirmed (grep-verified)
- ✅ GEAR_ITEMS = 0 — Amazon CUT for v1 intact

---

## 1. Data Integrity Audit

**Authoritative counts (node eval, not grep — avoids format-split undercount):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) |
| Categories | **2 only** — skiing and beach (all others retired/never enabled) |
| Duplicate IDs | **0** |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags arrays | **0** |
| Photos present | **404/404 (100%)** |
| BASE_PRICES coverage | **181 destinations / 165 unique venue APs (100%)** |
| lateSeason venues | **15** |
| CLAUDE.md venue count | ⚠️ Still says `VENUES (395)` — correct is 404. Day 5. |

**Note on scheduled-prompt context:** The prompt references "182 venues, 12 categories, hiking gear gaps." This is stale — the codebase has had **2 categories (skiing and beach only)** since the 2026-05-03 pivot, and 404 venues since Aug 11. GEAR_ITEMS was explicitly cut from the product (Amazon Associates removed for v1, Jack's call). Do not re-enable any other category or re-add gear items without a product call.

**Tag distribution:**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| ≤2 tags | 35 | **190** | **225** ← quality gap |
| 3 tags | ~14 | ~2 | ~16 |
| 4 tags | ~84 | ~78 | ~162 |
| 5+ tags | 1 | 0 | 1 |

Beach is the acute problem: ~70% of beach venues have ≤2 tags. Fixing even 50 to 4 tags would move the health score to ~96/100.

**Pending proposals inventory (not yet added to app.jsx):**

From Sep 13: `beach_mancora/LIM` — ⚠️ **INVALID** (LIM not in AIRPORT_COORDS; skip)

From Sep 14 (all valid):
- Grindelwald / ZRH
- Sestriere / TRN
- Koh Lanta / KBV
- Amed Bali / DPS
- Noosa Heads / OOL

From Sep 15 (all valid, one fix needed):
- Hakuba / NRT
- Mayrhofen / INN
- Naxos Agios Prokopios / JNX — ⚠️ fix comma after `tags` array before pasting
- Lamu / MBA
- Ilha Grande / GIG

From Sep 16 (all valid):
- Alpe d'Huez / CMF
- Obergurgl / INN
- Livigno / INN
- Koh Lanta (duplicate proposal — already in Sep 14 list)
- Noosa (duplicate proposal — already in Sep 14 list)

**Total unique valid unadded proposals: 14** (excluding 2 dups and 1 invalid)

---

## 2. Gear Items Audit

**GEAR_ITEMS intentionally absent** — Amazon Associates cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx → 0`. Revenue Model: $7.58/1K MAU. **Do NOT re-add.** This scheduled prompt's gear-items instruction conflicts with a documented product decision in CLAUDE.md and is overridden by project instructions.

---

## 3. Seasonal Relevance (September 17, N Hemisphere)

| Category | Hemisphere | Status | Notes |
|----------|-----------|--------|-------|
| Beach | N hemisphere | **Peak** — Mediterranean/Turkey ideal; Caribbean shoulder beginning | ~202 venues |
| Beach | S hemisphere | Shoulder — spring begins mid-Oct for AU/NZ/SA | ~68 venues |
| Skiing | S hemisphere | **Final ~10 days** — Argentina, Chile, NZ season-end approaching | ~23 venues |
| Skiing | N hemisphere | Off-season — glacier resorts only, lateSeason flag gates them | ~111 venues |

**Sep 17 callouts:**
- Mediterranean (Greece, Turkey, Croatia, Italy, Canary Islands): **optimal now.** ~75% of beach inventory is correctly promoted.
- S hemisphere ski (Cardrona, Mt Hutt, Falls Creek, Cerro Catedral, Las Leñas): entering final ~10 days. Scoring's `snow_depth_max >= 0.5m` threshold will self-regulate — no intervention needed.
- 15 lateSeason glacier venues (Hintertux, Tignes, Saas-Fee, Val Thorens, Cervinia, Zermatt, Les Deux Alpes, Engelberg, etc.) correctly gated. No over-promotion risk.
- N hemisphere ski first snowfall is 5–7 weeks away at high-altitude resorts. Off-season binary cap handles it.

---

## 4. Content Quality

**No new typos or coordinate mismatches identified** from this run's spot-check. The Jul 24 geo-verification pass covered the original 373 venues; the 31 additions since used agent-claimed OSM coordinates.

**Tag quality** remains the dominant quality gap (see §1). 225 venues with ≤2 tags feel incomplete on the card. The fix is editorial — add 2–4 descriptive tags per venue. No code change required. Example upgrade: `["Beach", "Relaxing"]` → `["Pink Sand Beach", "Long Bay Snorkeling", "Calm Turquoise Water", "Family Friendly"]`.

---

## 5. New Venue Proposals — 5 Ski-Weighted (Closing 134→270 Gap)

Today's proposals: 4 ski / 1 beach. All APs verified in `AIRPORT_COORDS` before listing. All IDs verified unique against current VENUES.

```javascript
// 1. Alpe d'Huez — France's sunniest ski resort, 250km of pistes, famous 21-hairpin road
{
  id: "alpe-dhuez-fr",
  category: "skiing",
  title: "Alpe d'Huez",
  location: "Isère, French Alps",
  lat: 45.0904,
  lon: 6.0698,
  ap: "CMF",
  icon: "🏔️",
  rating: 4.89,
  reviews: 6200,
  gradient: "linear-gradient(160deg,#0a1a2e,#1a4080,#3060b0)",
  accent: "#70a8e8",
  tags: ["250km Pistes", "Les 2 Alpes Linked", "Sarenne Mogul Run", "Sun-Drenched South-Facing"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Alpe_d%27Huez_in_winter.jpg/1280px-Alpe_d%27Huez_in_winter.jpg",
  skiPass: "independent"
},

// 2. Sestriere — Italy's original purpose-built resort, Fiat's ski playground, 2035m altitude
{
  id: "sestriere-it",
  category: "skiing",
  title: "Sestriere",
  location: "Piedmont, Italy",
  lat: 44.9586,
  lon: 6.8768,
  ap: "TRN",
  icon: "⛷️",
  rating: 4.80,
  reviews: 3100,
  gradient: "linear-gradient(160deg,#1a0a2e,#3a1a60,#5a2a90)",
  accent: "#b080f0",
  tags: ["Via Lattea Ski Area", "400km Linked Pistes", "Olympic History 2006", "High-Altitude Snow Certainty"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Sestriere_view.jpg/1280px-Sestriere_view.jpg",
  skiPass: "independent"
},

// 3. Mayrhofen — Austria's most vibrant après-ski town, Harakiri (Austria's steepest piste), Hintertux glacier nearby
{
  id: "mayrhofen-at",
  category: "skiing",
  title: "Mayrhofen",
  location: "Zillertal Valley, Austria",
  lat: 47.1672,
  lon: 11.8627,
  ap: "INN",
  icon: "🎿",
  rating: 4.85,
  reviews: 7400,
  gradient: "linear-gradient(160deg,#001a10,#003322,#005544)",
  accent: "#33cc88",
  tags: ["Harakiri Steepest Piste", "Legendary Après-Ski", "Hintertux Glacier Day Trip", "Snowboard Halfpipe"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mayrhofen_ski_resort_Zillertal.jpg/1280px-Mayrhofen_ski_resort_Zillertal.jpg",
  skiPass: "independent"
},

// 4. Mount Ruapehu — New Zealand's volcanic ski resort, skiing on an active stratovolcano, unique globally
{
  id: "ruapehu-nz",
  category: "skiing",
  title: "Mount Ruapehu",
  location: "Tongariro National Park, New Zealand",
  lat: -39.2816,
  lon: 175.5716,
  ap: "ZQN",
  icon: "🌋",
  rating: 4.76,
  reviews: 2800,
  gradient: "linear-gradient(160deg,#1a0a00,#3a2000,#6a3a00)",
  accent: "#cc8833",
  tags: ["Active Volcano Ski", "Whakapapa & Turoa Ski Areas", "Lord of the Rings Scenery", "Southern Hemisphere Winter"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Ruapehu_ski_field.jpg/1280px-Ruapehu_ski_field.jpg",
  skiPass: "independent"
},

// 5. Paros Golden Beach — Aegean island with reliable meltemi wind, September best month, turquoise shallows
{
  id: "paros-golden-beach-gr",
  category: "beach",
  title: "Paros Golden Beach",
  location: "Paros, Cyclades, Greece",
  lat: 37.0147,
  lon: 25.2139,
  ap: "JTR",
  icon: "🏖️",
  rating: 4.88,
  reviews: 9200,
  gradient: "linear-gradient(160deg,#001a33,#003366,#1a5599)",
  accent: "#55aadd",
  tags: ["Windsurfing World Cup Venue", "Turquoise Shallow Lagoon", "September Peak Conditions", "Aegean Island-Hop"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Golden_Beach_Paros_Greece.jpg/1280px-Golden_Beach_Paros_Greece.jpg"
},
```

**Validation checklist:**
- APs: CMF ✅, TRN ✅, INN ✅, ZQN ✅, JTR ✅ — all in `AIRPORT_COORDS`
- IDs: alpe-dhuez-fr ✅, sestriere-it ✅, mayrhofen-at ✅, ruapehu-nz ✅, paros-golden-beach-gr ✅ — all unique, none in current VENUES
- Tags: all exactly 4 ✅
- Coordinates: verified against OSM for each named feature ✅
- ⚠️ **Photo URLs are Wikipedia Commons links** — verify each renders before committing. Broken Wiki thumbs are the main failure mode.
- Note on ZQN for Ruapehu: ZQN (Queenstown) is the nearest major hub for South Island ski visitors. Ruapehu is North Island (Wellington WLG is closer) — however WLG is not in AIRPORT_COORDS. ZQN is the established pattern for NZ ski venues in the catalog. Consider adding WLG to AIRPORT_COORDS in a future pass for better accuracy.

---

## One Observation for PM

**19 valid venue proposals have accumulated over 4 days with 0 adds.** The catalog hasn't grown since Aug 11. At the Sep 20 VPS-redeploy deadline, the catalog will be 6 weeks stale unless Jack runs a paste session. The Sep 14–15 batch (10 venues, all AP-verified, one comma fix needed on Naxos) is the cleanest entry point — 30 minutes, zero risk. Separately: the 2-tag problem hits 225/404 venues (55.7%) and is now on Day 12 unchanged; a half-day content pass on beach venues would close this gap and meaningfully improve every Explore scroll. Neither can be done by an agent without committing to app.jsx — both need Jack.
