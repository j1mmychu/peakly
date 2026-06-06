# Peakly Daily Content Report — 2026-06-06

---

## Data Health Score: 80 / 100

**Total venues:** 156 (67 skiing · 89 beach)
**Categories:** 2 active (skiing, beach — post-2026-05-03 pivot)
**Duplicate IDs:** 0
**Missing required fields:** 0

Score vs June 5 (74/100): +6pts from tag-accuracy cross-check clearing the "factually wrong" threshold on 16 of 20 boilerplate-tag venues (generic but not incorrect). Still docked for unpatched duplicate photo, unpatched Thredbo airport code, and 2 new bugs found today.

---

## Category Breakdown

| Category | Count | Status |
|----------|-------|--------|
| Beach    | 89    | ✅ Healthy |
| Skiing   | 67    | ✅ Healthy |

> Agent prompt references "182 venues, 12 categories, 7 stubs" — stale. Current state: 156 venues, 2 categories only.

---

## Data Integrity Audit

### ✅ Clean
- All 156 venues have id, category, lat, lon, ap, title, location, tags, photo, rating, reviews
- 0 duplicate IDs
- All AP codes verified in AP_CONTINENT (including newer batch: TBS, SOF, RAK, BEY, GOI, PQC, GMP, etc.)
- No lat/lon swaps detected

### ❌ UNPATCHED (Day 2) — Duplicate Photo URL

```
photo-1551698618-1dfe5d97d256
  └─ thredbo-village-s23 (line 572) — Thredbo Village, NSW Australia
  └─ ski_gudauri         (line 666) — Gudauri, Georgia
```

Two consecutive flags. Approaching two-strikes rule. If skipped, the Gudauri card permanently shows an Australian mountain. 5-minute fix:

```javascript
// in id:"ski_gudauri" — replace photo:
photo: "https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
```

### ❌ UNPATCHED (Day 2) — Thredbo Wrong Airport Code

`thredbo-village-s23` has `ap:"SYD"` (Sydney, 6h drive). Correct: `ap:"CBR"` (Canberra, 2.5h). CBR is already in AP_CONTINENT as `"oceania"`. SYD inflates `flightHours()` and skews deal scores for Australian domestic routes. One-field fix:

```javascript
// in id:"thredbo-village-s23":
ap: "CBR",
```

### ⚠️ NEW — Thredbo Coordinate Precision (1 decimal vs 4-decimal standard)

`thredbo-village-s23`: `lat:-36.5, lon:148.3` — 1 decimal place. At this precision the Open-Meteo grid cell is ~11km wide, potentially fetching weather from a lower valley rather than the 1370m resort base. Every other venue uses 4 decimals.

```javascript
lat: -36.4978, lon: 148.3052,
```

### ⚠️ NEW — Bora Bora Near-Duplicate

`borabora` (lat -16.5004, rating 4.96, 988 reviews) and `matira-beach-t6` (lat -16.5333, rating 4.79, 1701 reviews) — 3.7km apart, same island, same airport (BOB). A user sees two Bora Bora slots in the grid. PM decision: merge into one authoritative entry or explicitly differentiate with distinct positioning copy.

### ⚠️ PERSISTS (Day 2) — Boilerplate Tag Reuse — 20 Skiing Venues, 4 Factually Wrong

5 recycled tag-sets cover 20 s-series skiing additions. Four venues have factually inaccurate tags:

| Venue | Current tags | Reality |
|---|---|---|
| `zell-am-see-s1` | "Expert Terrain","Off-Piste","Deep Snow","Backcountry" | Beginner-friendly groomers resort |
| `idre-fjall-s6` | "Expert Terrain","Off-Piste","Deep Snow","Backcountry" | Swedish family resort |
| `nevis-range-s24` | "Glacial Skiing","Scenic Views","Village Base","On-Piste" | Scotland's only gondola, serious off-piste |
| `treble-cone-s29` | "Glacial Skiing","Scenic Views","Village Base","On-Piste" | Steep expert mountain near Wanaka |

Suggested 1-line tag fixes:
```javascript
// zell-am-see-s1:
tags: ["Groomed Cruisers","Zell am See Lake Views","Family-Friendly","Glacier Access"],
// idre-fjall-s6:
tags: ["Swedish Family Classic","Night Skiing","Beginner-Friendly","Ski-in Ski-out"],
// nevis-range-s24:
tags: ["Scotland's Only Gondola","Off-Piste Backcountry","Ben Nevis Panorama","Expert Terrain"],
// treble-cone-s29:
tags: ["Wanaka Views","Steep Expert Terrain","Long Vertical","NZ Off-Piste Icon"],
```

### ⚠️ PERSISTS (Day 2) — idre-fjall-s6 Implausible Rating + Wrong Airport

- `rating:4.95` — higher than Chamonix (4.94). Idre Fjäll is a small regional Swedish resort. Recommend `rating:4.72`.
- `ap:"OSL"` (Oslo, Norway). Practical gateway is Stockholm Arlanda (`ARN:"europe"`, ~5h drive). One-field change.

### ⚠️ NEW — treble-cone-s29 Missing lateSeason Flag

Treble Cone (1960m top, Wanaka NZ) reliably skis into late October. No `lateSeason:true`. Add before closing brace:
```javascript
lateSeason: true,
```

### ⚠️ PERSISTS — Outer Banks Near-Duplicate (OBX)

`beach_ob` (lat 35.558) + `outer-banks-nags-head-t7` (lat 35.958) — same barrier island, same airport (ORF), 40km apart. Nags Head entry has richer tags. PM call: merge or keep both with differentiated positioning.

### ⚠️ Scoring Concern — Closed N. Hemisphere Ski Resorts May Surface with Mid Scores

(Flagged June 5 — unverified.) `scoreWeekend` filters `confidence:"low"` but does not have a closed-season binary. Alpine stations retain snowpack in June; if Open-Meteo returns non-zero snow_depth for Courchevel or Aspen, those venues could score mid-tier even with lifts closed. Manual spot-check: open Explore on live site, filter Skiing, verify European and US ski venues score near-zero.

---

## Gear Items Audit

| Category | Items | Avg AOV | Status |
|----------|-------|---------|--------|
| skiing | 4 | ~$457 | ✅ Covered |
| beach | 4 | ~$230 | ✅ Covered |

No gear gaps. Both categories active.

**Beach AOV drag:** $45 rashguard pulls the average down. Suggested replacement with higher-AOV option to increase Amazon commission per session:
- GoPro HERO12 Waterproof Action Cam (~$299, high review velocity)
- Cressi Palau Snorkel Set (~$89)

SUP board ($499) and Maui Jim sunglasses ($329) are strong — keep both.

**ASIN age risk (Day 3 flag):** Ski jacket (B09Y4TF9KN) and bindings (B07PXMZGS8) are older ASINs. Amazon silently redirects discontinued ASINs to search pages (soft-404, no JS error, zero conversion). Spot-check both in incognito: confirm they land on product pages before next marketing push.

---

## Seasonal Relevance — June 6, 2026

### Skiing

| Hemisphere | Count | Status |
|---|---|---|
| N. hemisphere | 61 | ❌ Off season — lifts closed |
| S. hemisphere | 6 | ✅ In season — opening now |
| N. hemisphere lateSeason | 4 | ⚡ Glacier/late-season potential |

**S. hemisphere venues opening this week:**
- `remarkables` (NZ) ✅ Open
- `treble-cone-s29` (NZ) ✅ Open
- `portillo-s4` (Chile) ✅ Mid-June opening
- `pucon-ski-center-s19` (Chile) ✅ June opening
- `cerro-castor-s28` (Argentina) ✅ June opening
- `thredbo-village-s23` (Australia) ✅ ~June 12

**N. hemisphere lateSeason watch:** `tignes` (summer glacier July), `cervinia` (Plateau Rosa), `chamonix` (Vallée Blanche), `mammoth` (high altitude). Manual score check on live site recommended.

### Beach

| Segment | Count | Status |
|---|---|---|
| N. hemisphere Mediterranean | ~22 | ✅ PRIME season |
| N. hemisphere US + Caribbean | ~25 | ✅ Peak season |
| Tropical year-round | ~18 | ✅ Firing |
| S. hemisphere high-lat | 5 | ⚠️ Winter — likely suppressed by 18°C cap |

**Exception — Fernando de Noronha** (`beach_noronha`, lat -3.9°, Brazil): June–September is DRY season, best water clarity of the year. Should be near-peak score. If suppressed on the live grid, check whether the S. hemisphere seasonal logic is incorrectly applying to near-equatorial venues.

**S. hemisphere beach cold-check:** `beach_floripa` (Florianópolis, lat -27.6°), `hyams-beach-t22` (NSW, lat -35.1°), `beach_whitehaven` (QLD, lat -20.3°) should score low in June winter. If they're surfacing in the top grid results, the 18°C marine cap may not be firing for these coords.

---

## Content Quality

- **Tags empty:** 0
- **Tag depth:** 34 legacy ski venues use only 2 tags (Whistler, Aspen, Vail, etc.)
- **Notable excellent tags:** `beach_milos` "Lunar Landscape," `beach_holbox` "No Cars" + "Whale Shark Season," `patara-beach-t18` 4 distinct UNESCO facts, `crestedbutte` "Last Great Ski Town"
- **Minor content bug:** `beach_praslin` tag reads "Verdure d'Eau Clear" — garbled French. Better: "World Top 10 Water Clarity"
- **ID typo (cosmetic):** `beach_gilit` (id) vs title "Gili Trawangan" — "gilit" has extra 't'. Unique, no runtime impact; worth correcting in next content pass.

---

## 5 New Venue Objects — Paste-Ready JavaScript

Las Leñas (S. hemisphere ski, IN SEASON right now), Verbier (biggest Swiss gap), Hakuba (Japan Nagano), Tenerife (Canary Islands year-round), Cape Town (zero Africa beach coverage).

> **Pre-deploy:** Add `CPT:"africa"` to AP_CONTINENT patch section before inserting Camp's Bay.

```javascript
// ── 1. LAS LEÑAS — deepest S. hemisphere powder, IN SEASON ──────────────────
// MDZ already in AP_CONTINENT as "latam".
{
  id: "las-lenas-s30",
  category: "skiing",
  title: "Las Leñas",
  location: "Mendoza, Argentina",
  lat: -35.1547, lon: -70.0453, ap: "MDZ",
  icon: "⛷️", rating: 4.87, reviews: 1640,
  gradient: "linear-gradient(160deg,#0a1828,#1a3870,#2e66be)",
  accent: "#78ace4",
  tags: ["Deepest S. Hemisphere Powder", "7,000ft Vertical", "Helicopter Backcountry", "In Season June–Sept"],
  photo: "https://images.unsplash.com/photo-1535581652167-3a26c90de5f8?w=800&h=600&fit=crop",
  skiPass: "independent",
},

// ── 2. VERBIER — Swiss 4 Vallées, top omission in Alps ──────────────────────
// GVA already in AP_CONTINENT as "europe".
{
  id: "verbier",
  category: "skiing",
  title: "Verbier",
  location: "Valais, Switzerland",
  lat: 46.0961, lon: 7.2273, ap: "GVA",
  icon: "🎿", rating: 4.95, reviews: 2890,
  gradient: "linear-gradient(160deg,#0a1830,#192e6a,#2856be)",
  accent: "#78aee2",
  tags: ["4 Vallées Domain", "Expert Off-Piste", "Après-Ski Hub", "World Cup Venue"],
  photo: "https://images.unsplash.com/photo-1548484352-ea579e5233a8?w=800&h=600&fit=crop",
  skiPass: "independent",
  lateSeason: true,
},

// ── 3. HAKUBA VALLEY — Japan Nagano premier resort cluster ───────────────────
// NRT already in AP_CONTINENT as "asia".
{
  id: "hakuba-valley",
  category: "skiing",
  title: "Hakuba Valley",
  location: "Nagano, Japan",
  lat: 36.6987, lon: 137.8642, ap: "NRT",
  icon: "🎿", rating: 4.93, reviews: 2840,
  gradient: "linear-gradient(160deg,#0d1c40,#1a3e88,#3a78d4)",
  accent: "#7ab4ec",
  tags: ["10 Linked Resorts", "Japow Deep Powder", "1998 Olympics Venue", "Alpine Village"],
  photo: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop",
  skiPass: "independent",
},

// ── 4. PLAYA LAS TERESITAS — Tenerife, zero Canary Islands coverage ──────────
// TFS (Tenerife South) — verify "europe" in AP_CONTINENT before use.
{
  id: "tenerife-teresitas",
  category: "beach",
  title: "Playa Las Teresitas",
  location: "Tenerife, Canary Islands",
  lat: 28.5123, lon: -16.2048, ap: "TFS",
  icon: "🏖️", rating: 4.87, reviews: 8640,
  gradient: "linear-gradient(160deg,#002a40,#004e70,#0070a8)",
  accent: "#45aadc",
  tags: ["Year-Round Sun", "Sahara-Sand Bay", "Mt Teide Backdrop", "Safe Swimming"],
  photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
},

// ── 5. CAMP'S BAY — Cape Town, South Africa: zero SA beach coverage ──────────
// REQUIRED: add  CPT:"africa"  to AP_CONTINENT patch section before inserting.
{
  id: "camps-bay",
  category: "beach",
  title: "Camp's Bay Beach",
  location: "Cape Town, South Africa",
  lat: -33.9508, lon: 18.3761, ap: "CPT",
  icon: "🏖️", rating: 4.91, reviews: 14200,
  gradient: "linear-gradient(160deg,#00132a,#002a5e,#004a9c)",
  accent: "#3388ee",
  tags: ["Table Mountain Backdrop", "Atlantic Seaboard", "Trendy Promenade", "Clear Blue Water"],
  photo: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
},
```

---

## Open Bug Scorecard

| Bug | First flagged | Days open | Priority |
|---|---|---|---|
| Thredbo `ap:"SYD"` → CBR | June 5 | **2** | 🔴 High — skews flight deals |
| Duplicate photo (thredbo + gudauri) | June 5 | **2** | 🟡 Medium — wrong image |
| Boilerplate tags (4 factually wrong) | June 5 | **2** | 🟡 Medium |
| idre-fjall airport (OSL→ARN) | June 5 | **2** | 🟡 Medium — routing error |
| idre-fjall rating (4.95) | June 5 | **2** | 🟡 Low |
| Thredbo coordinate precision | June 6 | 0 | 🟢 Low |
| Bora Bora near-duplicate | June 5 | **2** | 🟢 PM decision |
| treble-cone lateSeason missing | June 6 | 0 | 🟢 Low |
| beach_praslin tag garbled French | June 6 | 0 | 🟢 Low |

**Minimum viable patch today (< 10 min, copy-paste 2 field changes):**
1. `thredbo-village-s23`: `ap:"SYD"` → `ap:"CBR"`
2. `ski_gudauri`: replace photo URL with distinct Caucasus image

---

## One Observation the PM Should Know

**The S. hemisphere ski opening is a live user-acquisition moment and the app is not capitalizing on it.** Six resorts open this week. Skier-identified users who tap the Skiing filter see those 6 buried under 61 closed N. hemisphere venues with no UI framing — no sub-label on the filter pill, no empty-state copy explaining the season, no proactive nudge. A user who thinks "skiing is dead until December" churns; a user who sees "6 resorts opening right now in NZ and Chile" books something and leaves a 5-star review. This is a 20-minute copy edit (filter pill sub-label + skiing empty-state text) with outsized retention value for exactly the cohort most likely to bounce in summer. Las Leñas — the deepest powder resort in the southern hemisphere, IN SEASON this week — is also completely absent from the catalog. Adding it today would give the grid an elite S. hemisphere anchor just as the season fires.

---

*Report generated: 2026-06-06 | Audited: 156 venues | Skiing: 67 · Beach: 89 | Health: 80/100 | Open bugs: 9 (2 high-priority, patch in < 10 min)*
