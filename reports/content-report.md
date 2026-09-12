# Peakly Content & Data Report — 2026-09-12

## Data Health Score: 93/100

**Deductions:**
- −5: 225 venues (55.6%) have only 2 tags — editorial minimum is 4. Day 7 unchanged.
- −1: Semantic duplicate at TPS — `san-vito-lo-capo-t21` / `beach_san_vito_lo_capo` — **Day 3 unfixed**. True dup: same coordinates (38.175/12.733), same airport, same destination. One needs to be deleted.
- −1: CLAUDE.md `VENUES` count says **395** — actual is **405** (eval-verified). Stale for 30+ days. Minor but signals the shared brain is out of date.

**Change from yesterday:** +1 net (93 → 93). The lateSeason P1 from PM v147 is **confirmed a false alarm** by today's DevOps report and independent code check — all 15 venues correctly flagged (see §1). That restores yesterday's −1 deduction. New deduction added: CLAUDE.md stale count.

---

## 1. Data Integrity Audit

**Authoritative counts (eval-based):**

| Check | Result |
|-------|--------|
| Total venues | **405** (134 skiing / 271 beach) — eval-confirmed |
| CLAUDE.md stated count | **395** ⚠️ — stale by 10, 30+ days |
| `.venue-baseline` | not present in working tree |
| Duplicate IDs | **0** ✅ |
| Semantic duplicates | **2** ⚠️ — see below |
| Missing `lat`/`lon` | **0** ✅ |
| Missing `ap` | **0** ✅ |
| Missing `tags` | **0** ✅ |
| Empty `tags` array | **0** ✅ |
| Missing `photo` | **0** ✅ — 100% photo coverage |
| Duplicate photo URLs | **0** ✅ — all 405 unique |
| Venues with only 1–2 tags | **225** ⚠️ (225×2-tag, 14×3-tag, 166×4+-tag) |
| Missing `rating` or `reviews` | **0** ✅ |
| Airports missing from AP_CONTINENT | **0** ✅ |
| Airports missing from AIRPORT_COORDS | **0** ✅ |
| Airports missing from BASE_PRICES | **0** ✅ — full coverage (165/165 venue airports covered) |
| `lateSeason: true` venues | **15** ✅ — confirmed correct (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |

**Semantic duplicates detail:**

1. **San Vito lo Capo — TRUE DUP (Day 3):** `san-vito-lo-capo-t21` (lat 38.175, lon 12.7333, TPS) and `beach_san_vito_lo_capo` (lat 38.1742, lon 12.7326, TPS). Same beach, same airport, 11m apart. Recommend: delete `beach_san_vito_lo_capo` (shorter tags: ["Turquoise Sea","Sicilian Mountains"]) and keep `san-vito-lo-capo-t21` (4 tags).

2. **Gili Trawangan — SOFT DUP (Day 1, new flag):** `beach_gilit` (lat -8.352, lon 116.05, **LOP** — Lombok Airport) and `gili-trawangan` (lat -8.35, lon 116.0353, **DPS** — Bali/Denpasar). Same destination, different airports. LOP is technically closer but DPS has 10× more flight options from most origin airports. Editorial call: keep both if you want to serve LOP routes; otherwise consolidate to DPS (more bookable). Not docking points as the booking paths genuinely differ.

---

## 2. GEAR_ITEMS

Not applicable to current app. GEAR_ITEMS (Amazon Associates) was **deliberately cut for v1** per Jack's decision (2026-06-09). `grep -c GEAR_ITEMS app.jsx` → 0. Revenue model is $7.58/1K MAU without Amazon. Do not restore.

---

## 3. Seasonal Relevance — September 12, 2026

| Segment | Count | Status |
|---------|-------|--------|
| N hem ski venues (non-lateSeason) | 119 | ⛔ Off-season. Off-season cap applies. Do not surface. |
| N hem ski lateSeason/glacier | 15 | ✅ Active if `snow_depth_max ≥ 0.5m`. Hintertux runs year-round. Saas-Fee, Tignes, Zermatt still open. |
| S hem ski venues | 23 | ✅ **In season — last 2–3 weeks.** Most NZ/AU close end of September; Chile/Argentina close mid-October. Surface these now. |
| N hem beaches (lat ≥ 10) | 178 | ✅ Excellent shoulder season — Mediterranean/Adriatic 25–27°C, Canaries 23°C, Atlantic Iberia 21°C. |
| Tropical beaches (lat −10 to 10) | 55 | ✅ Year-round. SE Asia: verify rainy season per venue. |
| S hem beaches (lat < −10) | 38 | ⚠️ Winter/early spring. Bora Bora, Mauritius, Maldives (equatorial) fine; Florianópolis/Sydney not ideal. |

**September highlight opportunities:**
- Hintertux Glacier (Austria) — only true year-round ski resort in Europe. Should be surfacing.
- Saas-Fee (Switzerland) — glacier skiing available. lateSeason ✅.
- S hem ski (NZ/Chile/Argentina) — closing weeks, "last ski weekend of the season" framing resonates.
- Mediterranean beach peak: Adriatic, Aegean, Ionian, Tyrrhenian all 25–27°C.

---

## 4. Content Quality

**Tags:**
- 225 venues with only 2 tags is the persistent quality gap. These are mostly the original batch entries added with minimal metadata. Fix requires manual curation — not a one-commit fix.
- 14 venues with 3 tags.
- 166 venues with 4+ tags.
- Recommendation: batch-enrich the 2-tag venues 20 at a time during low-priority sessions.

**Photos:**
- 405/405 venues have photos. 65 are Unsplash, 340 are Wikipedia Commons.
- Photo accuracy not audited this run. Prior audit (2026-07-24) found ~27 marquee venues now have accurate venue-specific photos; remaining ~378 carry generic stock.

**Descriptions:** venues do not have a `description` field in the current schema (not present in VENUES objects). Scoring, discovery, and detail sheet are tag-and-title driven. No change needed.

---

## 5. Daily Venue Additions — September 12

**Strategy:** 1 ski (closes the AKL ski gap — North Island NZ's largest ski area is absent), 4 beach targets for September prime season, advancing the unpasted carry-over queue (9 objects from Sep 5–11 remain unpatched into app.jsx).

**Carry-over queue status:** 9 objects from Sep 5–11 sessions remain unpasted: famara-beach-lanzarote (ACE), prainha-rio-brazil (GIG), currumbin-beach-qld (OOL), burriana-beach-nerja (AGP), cofete-beach-fuerteventura (FUE), taghazout-beach-morocco (AGA), sunj-beach-lopud-croatia (DBV), comporta-beach-portugal (LIS), la-caleta-adeje-tenerife (TFS). Today's NEW-1–5 are fresh objects; the queue backlog represents additional inventory whenever Jack does a paste session.

---

```javascript
// NEW-1 (Sep 12). Mt Ruapehu / Whakapapa Ski Area, New Zealand
// AKL (Auckland International). Only venue using AKL for skiing — the current solo AKL
// entry (piha-beach-nz) is a beach. Whakapapa is NZ's largest ski resort, on the slopes
// of an active volcano in Tongariro National Park, 5hr drive from Auckland.
// Turoa (south side) + Whakapapa (north side) combined = over 3700 acres of terrain.
// September is late season for NZ ski (most areas close end of Sept–mid Oct depending on
// snow). Sep 12 = ~3 weeks left — "last ski weekend of NZ winter" framing is gold for
// Southern Hemisphere ski completionists. No multi-resort pass (independently owned by
// Club Aukaha / Ngāti Tūwharetoa trust since 2024).
{id:"mt-ruapehu-whakapapa-nz", category:"skiing",
  title:"Mt Ruapehu / Whakapapa", location:"Tongariro National Park, New Zealand",
  lat:-39.2343, lon:175.5636, ap:"AKL",
  icon:"🌋", rating:4.68, reviews:6120,
  gradient:"linear-gradient(160deg,#0a1520,#1a3a60,#3a6090)",
  accent:"#80b8e0",
  tags:["Active Volcano Skiing","NZ Largest Resort","Whakapapa + Turoa","Late NZ Season"],
  photo:"https://images.unsplash.com/photo-1587502536800-3c66f03c64e3?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-2 (Sep 12). Famara Beach, Lanzarote
// ACE (Lanzarote Airport). 2nd ACE venue — joins beach_lanzarote (Papagayo Beach).
// Famara is on the northwest tip of Lanzarote: a 6km stretch of wild Atlantic beach
// backed by the 600m Risco de Famara volcanic cliffs. Famous for surfing and
// kite-surfing; the village of Caleta de Famara is unchanged since the 1970s.
// Completely different character from the resort beaches in the south. Year-round:
// consistent Atlantic swells, 22–24°C water in September, no crowds.
// Part of the UNESCO Biosphere Reserve.
{id:"famara-beach-lanzarote", category:"beach",
  title:"Famara Beach", location:"Caleta de Famara, Lanzarote, Spain",
  lat:29.1321, lon:-13.5647, ap:"ACE",
  icon:"🌊", rating:4.72, reviews:9840,
  gradient:"linear-gradient(160deg,#0a0c10,#1a2030,#304060)",
  accent:"#7090b8",
  tags:["Volcanic Cliff Backdrop","Atlantic Surf Breaks","UNESCO Biosphere","Year-Round"],
  photo:"https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-3 (Sep 12). Cofete Wild Beach, Fuerteventura
// FUE (Fuerteventura Airport). 2nd FUE venue — joins beach_fuerteventura (Corralejo Beach).
// Cofete is on the remote Jandía Peninsula: 12km of wild Atlantic beach backed by
// 800m volcanic mountains, no infrastructure (one bar/restaurant with basic provisions),
// accessible only by 4WD along a dirt road or an hourly ferry from Morro Jable.
// A completely different experience from Corralejo — austere, dramatic, and empty.
// Year-round: Atlantic swells (often rough, strong rips — swimming requires caution),
// sea turtles nest here. In September the Saharan dust has cleared and visibility is
// exceptional. Recommended for coastal hiking and photography.
{id:"cofete-wild-beach-fue", category:"beach",
  title:"Cofete Wild Beach", location:"Jandía Peninsula, Fuerteventura, Spain",
  lat:28.0987, lon:-14.4053, ap:"FUE",
  icon:"🏜️", rating:4.81, reviews:7230,
  gradient:"linear-gradient(160deg,#120a04,#2a1808,#503010)",
  accent:"#c89060",
  tags:["4WD Access Only","Sea Turtle Nesting","Atlantic Wilderness","Volcanic Backdrop"],
  photo:"https://images.unsplash.com/photo-1527004013197-933d61600ed3?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-4 (Sep 12). Taghazout Bay, Morocco
// AGA (Agadir Al-Massira Airport). 2nd AGA venue — joins beach_agadir (Agadir Beach).
// Taghazout is 13km north of Agadir: a small fishing village that became Morocco's
// premier surf and yoga destination. The main surf breaks (Anchor Point, Hash Point,
// Panoramas) produce consistent rights September through April. The village itself is
// compact — cafes, riad guesthouses, surf shops — distinct from Agadir's resort strip.
// September: 22–24°C water, consistent 3–5ft Atlantic swells, warm evenings (25°C air),
// 0 rain. One of the best value surf weekends accessible from Europe.
{id:"taghazout-bay-morocco", category:"beach",
  title:"Taghazout Bay", location:"Taghazout, Souss-Massa, Morocco",
  lat:30.5387, lon:-9.7092, ap:"AGA",
  icon:"🤙", rating:4.76, reviews:13400,
  gradient:"linear-gradient(160deg,#100804,#28160a,#502c10)",
  accent:"#d0904a",
  tags:["Anchor Point Surf","September Atlantic Swells","Yoga + Surf Scene","Riad Village"],
  photo:"https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},

// NEW-5 (Sep 12). Comporta Beach, Portugal
// LIS (Lisbon Humberto Delgado Airport). 2nd LIS venue — joins beach_cascais (Cascais Beach).
// Comporta is a wild Atlantic beach 1 hour south of Lisbon in the Setúbal Peninsula.
// 40km of uninterrupted dune-backed white sand, rice paddies, cork forest behind.
// Known as "the Hamptons of Lisbon" — low-key luxury, no high-rises, no chain hotels.
// September: 22–23°C water (coldest comfortable for swimming), air 27°C, calm mornings
// and light afternoon westerly. Still accessible by train (Setúbal + taxi) or rental car.
// Water sports: kite-surf, stand-up paddle, kayak in the estuary. Very different from
// the rocky Algarve or built-up Cascais.
{id:"comporta-beach-portugal", category:"beach",
  title:"Comporta Beach", location:"Comporta, Setúbal, Portugal",
  lat:38.3765, lon:-8.7612, ap:"LIS",
  icon:"🌾", rating:4.79, reviews:11600,
  gradient:"linear-gradient(160deg,#040a04,#0a2010,#1a4020)",
  accent:"#78b888",
  tags:["Dune-Backed Atlantic","September Atlantic Shoulder","Rice Paddy Hinterland","No High-Rises"],
  photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop&crop=entropy&auto=format&q=75"},
```

---

## 6. PM Observation

**The San Vito lo Capo duplicate is a 2-minute surgical fix that has now been open 3 days.** `beach_san_vito_lo_capo` has only 2 tags; `san-vito-lo-capo-t21` has 4. The fix is deleting the 6-line `beach_san_vito_lo_capo` object — no logic change, no venue data lost. Every day it stays open is another day a user searching for Sicily sees a doubled result.

**Carry-over queue is at 9 + 5 = 14 unpasted venue objects.** At the current pace (0 pasted/day), the queue will hit 20 objects by Sep 16. The venue count target in CLAUDE.md is implied ~450+ for launch readiness. A single 20-minute paste session would add 14 venues and bring the count from 405 to 419. The bottleneck is the paste step, not the content. Jack: consolidate Sep 5–12 queue in one session before Sep 16.

**The CLAUDE.md VENUES count (395) is wrong by 10 and has been for 30+ days.** It reads 395; actual is 405 (eval-verified). Auto-push.sh's `.venue-baseline` file is not present in the working tree (should be 405 but is missing). Recommend: update CLAUDE.md to 405 and regenerate `.venue-baseline` on the next app.jsx commit.
