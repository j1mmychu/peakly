# Peakly Content & Data Report — 2026-09-14

## Data Health Score: 93/100

**Deductions:**
- −5: 223 venues (55.2%) have only 2 tags — editorial minimum is 4. **Day 9 unchanged.** (Slight improvement from 225 yesterday after semantic dup deletion.)
- −1: CLAUDE.md architecture section still says `VENUES (395)` — the correct count is 404. Note 9 is correct; only the architecture overview line is stale.
- −1: Yesterday's report proposed `beach_mancora` using `ap:"LIM"` — LIM is in `AP_CONTINENT` but **NOT** in `AIRPORT_COORDS`. The `flightHours()` distance filter would have crashed on that venue. Proposal flagged as invalid; not added to app.jsx.

**Wins this run:**
- ✅ Semantic dup `san-vito-lo-capo-t21` was **deleted** in commit `bb3ebc8` (Sep 13 afternoon). TPS now has one clean entry: `beach_san_vito_lo_capo`. Day-4 finding resolved.
- ✅ BASE_PRICES coverage confirmed at **152/152 venue airports** — Open #22 remains closed.
- ✅ Inline venue search shipped (`bb3ebc8`) — users can now search across title, location, and tags.

---

## 1. Data Integrity Audit

**Authoritative counts (regex+line-range, two-format aware):**

| Check | Result |
|-------|--------|
| Total venues | **404** (134 skiing / 270 beach) — eval-confirmed |
| Duplicate IDs | **0** (boot-time IIFE validator active) |
| Missing coordinates | **0** |
| Missing airport codes | **0** |
| Missing tags | **0** |
| Photos present | **404/404 (100%)** |
| BASE_PRICES coverage | **152/152 venue airports (100%)** — Open #22 CLOSED |
| lateSeason venues | **15** (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| CLAUDE.md accuracy | ⚠️ Architecture section says `VENUES (395)` — stale; Note 9 correctly says 404 |

**Tag distribution (full catalog, 404 venues):**

| Tag count | Skiing | Beach | Total |
|-----------|--------|-------|-------|
| 2 tags | ~35 | ~188 | **223** ← quality gap |
| 3 tags | ~14 | ~2 | 16 |
| 4 tags | ~85 | ~79 | 164 |
| 5+ tags | 0 | 1 | 1 |

Beach category is disproportionately under-tagged: ~70% of beach venues (188/270) have exactly 2 tags. A bulk tag-enrichment pass would move the health score from 93 to 98 and make cards significantly more compelling. Estimated effort: ~3hr for the full catalog.

**AP error in yesterday's proposal (corrective note):**
- `beach_mancora` was proposed with `ap:"LIM"` (Lima, Peru)
- LIM is in `AP_CONTINENT` ✅ but NOT in `AIRPORT_COORDS` ❌
- The `flightHours()` function would return `null` → distance filter would skip the venue
- **Corrective action:** Mancora should use a different airport. The nearest AP in AIRPORT_COORDS is none for northern Peru — Mancora has no direct international airport code in the current system. Drop from the proposals or add LIM to AIRPORT_COORDS first.

---

## 2. Gear Items Audit

**GEAR_ITEMS is intentionally absent from app.jsx** — Amazon Associates was formally cut for v1 on 2026-06-09 (Jack's call). `grep -c GEAR_ITEMS app.jsx` → 0. Revenue Model stays $7.58/1K MAU. Do NOT re-add.

No action needed.

---

## 3. Seasonal Relevance (September 14, N Hemisphere)

| Category | Hemisphere | Status | Count |
|----------|-----------|--------|-------|
| Beach | N hemisphere | **Peak season** (late summer, still warm) | ~202 |
| Beach | S hemisphere | Off-season (winter ending, spring starts Oct) | ~68 |
| Skiing | S hemisphere | **In season** — prime window ending mid-Oct | ~23 |
| Skiing | N hemisphere | Off-season — opening day 5–8 weeks away | ~111 |

**September 14 callouts:**
- **Northern hemisphere beach is at peak right now.** Mediterranean (Greece, Turkey, Spain, Croatia, Italy), Canaries, Azores, and Caribbean all at optimal temp + sun. App is serving the exact right product for right now.
- **Southern ski is in its final 4 weeks.** Argentina (Bariloche/Catedral, Mendoza, Chapelco), Chile (Nevados de Chillán, La Parva, El Colorado), NZ (Cardrona, Mt Hutt), and Australia (Falls Creek, Hotham) all approaching end-of-season. Scoring will naturally deprioritize once snowpack falls below threshold.
- **15 lateSeason glacier venues** remain viable in N hemisphere: Hintertux (open year-round), Tignes, Saas-Fee, Val Thorens, Cervinia, Zermatt, Les Deux Alpes at high elevation. Correctly gated on `snow_depth_max >= 0.5m`.
- **No venues incorrectly promoted.** The confidence flag and seasonal cap are doing their jobs.

---

## 4. Content Quality

**Descriptions:** All 404 venues have empty `description` fields. Non-blocking for current UI, but a future detail-sheet expansion would need them. Full catalog fill-in is a dedicated session task.

**Top 2-tag venues that most need enrichment (strategic priority — these get the most impressions):**

| ID | Current Tags | Suggested Tags to Add |
|----|-------------|----------------------|
| `borabora` | "UV 11, Crystal Water" | "Overwater Bungalows", "Manta Ray Snorkel" |
| `beach_gcm` | "World's Best Beach, Crystal Caribbean" | "Seven Mile Strip", "Calm Year-Round" |
| `beach_stlucia` | "Piton Views, Volcano Backdrop" | "Sulfur Spring Swim", "Rainforest Zip-Line" |
| `beach_magens` | "Protected Horseshoe, Palm-Lined Shore" | "No Crowds", "Safest Swimming STT" |
| `beach_zanzibar` | "Spice Island, Dhow Sunset Cruises" | "White Coral Sand", "Swimming with Turtles" |
| `beach_floripa` | "Brazil's Most Beautiful, Beach + Lagoon" | "Lagoa da Conceição", "Magic Island Life" |
| `beach_ob` | "Wild Horses, Barrier Island Drive" | "Cape Hatteras Lighthouse", "OBX Fishing" |

The 2-tag problem: 223 venues × 2 missing tags = ~446 tag writes needed. Recommend a dedicated pass before any Reddit/HN launch push, as tag content is the primary UX element on the card grid.

---

## 5. Daily Venue Additions — New Proposals (September 14)

**Gap analysis:** 404 venues strong, but 4 clear geographic gaps remain:
- **Switzerland ski:** ZRH has 3 venues — Grindelwald is the most famous missing resort globally
- **Italy ski:** TRN has Cervinia/Champoluc — the 2006 Olympics venue (Sestriere) is absent
- **Thailand beach:** KBV has Railay + Ao Nang + Phra Nang — Koh Lanta is the next major island, currently missing
- **Bali beach:** DPS has multiple venues but East Bali (Amed) is the dive capital and entirely absent
- **Queensland beach:** OOL has only Surfers Paradise — Noosa Heads (30min north) is consistently ranked Australia's best beach

**AP validation (all 5 confirmed present in both AP_CONTINENT and AIRPORT_COORDS):** ZRH ✅, TRN ✅, KBV ✅, DPS ✅, OOL ✅

```javascript
// 1. Grindelwald / Jungfrau — Switzerland's most iconic ski destination, missing from the 134-resort catalog
{
  id: "grindelwald",
  category: "skiing",
  title: "Grindelwald First & Jungfrau",
  location: "Bernese Oberland, Switzerland",
  lat: 46.6242,
  lon: 8.0333,
  ap: "ZRH",
  icon: "🏔️",
  rating: 4.94,
  reviews: 5800,
  gradient: "linear-gradient(160deg,#001a44,#003388,#0055cc)",
  accent: "#4499ee",
  tags: ["UNESCO World Heritage", "Eiger North Face", "Jungfraujoch Top of Europe", "Ski Safari"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Grindelwald_002.jpg/1280px-Grindelwald_002.jpg",
  skiPass: "independent"
},

// 2. Sestriere / Via Lattea — 2006 Winter Olympics venue, Italy's premier high-altitude freeride area
{
  id: "sestriere",
  category: "skiing",
  title: "Sestriere / Via Lattea",
  location: "Piedmont, Italy",
  lat: 44.9611,
  lon: 6.8703,
  ap: "TRN",
  icon: "🏔️",
  rating: 4.82,
  reviews: 3200,
  gradient: "linear-gradient(160deg,#1a1a3a,#2a2a7a,#3a3acc)",
  accent: "#7777ee",
  tags: ["2006 Winter Olympics", "Via Lattea 400km", "Sun-Baked Plateau", "Freestyle Park"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Sestriere%2C_1997.jpg/1280px-Sestriere%2C_1997.jpg",
  skiPass: "independent"
},

// 3. Koh Lanta Long Beach — Thailand's most laid-back island, KBV already has Railay/Ao Nang/Phra Nang
{
  id: "koh-lanta-beach",
  category: "beach",
  title: "Koh Lanta Long Beach",
  location: "Krabi, Thailand",
  lat: 7.5766,
  lon: 99.0519,
  ap: "KBV",
  icon: "🏝️",
  rating: 4.88,
  reviews: 7600,
  gradient: "linear-gradient(160deg,#002233,#004455,#007788)",
  accent: "#22aacc",
  tags: ["No Crowds No Nightlife", "Sunset West Coast", "Long Sandy Walk", "Island-Hop by Ferry"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Long_Beach_Koh_Lanta.jpg/1280px-Long_Beach_Koh_Lanta.jpg"
},

// 4. Amed Beach — East Bali diving mecca; USAT Liberty wreck, away from Kuta crowds; DPS covers all Bali
{
  id: "amed-bali",
  category: "beach",
  title: "Amed Beach",
  location: "East Bali, Indonesia",
  lat: -8.3389,
  lon: 115.6573,
  ap: "DPS",
  icon: "🏝️",
  rating: 4.87,
  reviews: 5100,
  gradient: "linear-gradient(160deg,#1a0a00,#3a1a00,#663000)",
  accent: "#cc8844",
  tags: ["USAT Liberty Wreck Dive", "Black Volcanic Sand", "Mt. Agung Sunrise", "Jukung Fishing Boats"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Amed_Bali.jpg/1280px-Amed_Bali.jpg"
},

// 5. Noosa Main Beach — Noosa Heads, Queensland; OOL has only Surfers Paradise; consistently #1 Aus beach
{
  id: "beach_noosa",
  category: "beach",
  title: "Noosa Main Beach",
  location: "Sunshine Coast, Queensland, Australia",
  lat: -26.3947,
  lon: 153.0906,
  ap: "OOL",
  icon: "🏖️",
  rating: 4.91,
  reviews: 9800,
  gradient: "linear-gradient(160deg,#001a33,#003366,#0066aa)",
  accent: "#33aaee",
  tags: ["National Park Backed Beach", "Surf Breaks", "Noosa Village Walk", "Koalas in the Dunes"],
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Noosa_Main_Beach_1.jpg/1280px-Noosa_Main_Beach_1.jpg"
},
```

**Validation checklist:**
- All 5 APs (ZRH, TRN, KBV, DPS, OOL) in both `AP_CONTINENT` ✅ and `AIRPORT_COORDS` ✅
- All 5 IDs verified new — no duplicates with existing VENUES ✅
- All have exactly 4 tags ✅
- Note: `beach_mancora` (LIM) from Sep 13 proposal is **invalid** — LIM not in AIRPORT_COORDS. Do not paste.

---

## One Observation for PM

**The 2-tag gap is the #1 launch-blocking content risk.** 223 venues (55%) showing thin tag content is more visible than any infrastructure gap — it's on every card, every scroll, every user session. Fixing it before the Reddit/HN post would remove the single largest "feels unfinished" signal. The fix is additive (no scoring, no architecture changes), entirely within CLAUDE.md bounds, and takes ~3hr in a single content pass. Recommend scheduling it as the dedicated task for the next free session before any launch traffic.

**Secondary note:** CLAUDE.md's architecture section still reads `VENUES (395)` — the correct figure is 404. The change is one word in Note 3 of the File Structure section. Low priority but worth fixing to keep the shared brain clean.
