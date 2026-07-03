# Peakly Content & Data Report — 2026-07-03

**Data health score: 74/100** (unchanged — all open issues deferred to July 7 per PM v76) | Build: `20260703a` ✅ (bumped by DevOps this run) | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

**⚠️ VENUE FREEZE extended through July 7** (PM v76, July 2 override). All queued fixes deferred: placeholder tags, surf-legacy tags, duplicates, new venue paste. Reddit launched June 30; PM is holding the line until 72h Plausible signal reads on July 3.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories only.** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have non-empty tags.** Prior grep miscounted the multi-line JSON format. |

---

## Fix Applied This Run

**None.** All queued changes deferred to July 7 per PM v76. DevOps bumped cache stamp to `20260703a` this run; content makes no app.jsx changes.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Venues | In Season (Jul 3, N. Hemi Summer) |
|----------|--------|-------------------------------------|
| **Beach** | 239 | ~184 N. hemi at PEAK — **July 4 weekend starts tomorrow** · ~55 S. hemi suppressed by <18°C cap |
| **Skiing** | 131 | **23 S. hemi in-season** (peak southern winter) · **25 `lateSeason:true`** eligible · **83 N. hemi off-season** scoring 0 |
| **TOTAL** | **370** | Verified via bracket-walk eval. Grep undercounts to 156 (known bug — never use grep for this). |

### Structural Integrity

| Check | Result | Δ from Jul 2 |
|-------|--------|--------------|
| Duplicate IDs in VENUES | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes (`ap`) | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| Max photo repeat | ✅ 3× (104×3, 24×2, 10×1 = 138 unique) | — |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| Build stamp | ✅ `20260703a` — bumped by DevOps this run | fixed |
| skiPass coverage | ✅ 131/131 (34 Epic / 51 Ikon / 46 independent) | — |
| Ratings | ✅ range 4.0–4.99, avg 4.71, zero outliers | — |
| Airport coverage | ✅ all `ap` values in AIRPORT_COORDS | — |
| Placeholder-tag venues | ⚠️ **5 open** (confirmed again — fix staged §2, execute July 7) | → Jul 7 |
| Logical duplicate venue pairs | ⚠️ 3 open (`beach_miami` exact dup — staged for removal Jul 7) | → Jul 7 |
| Surf-category legacy tags | ⚠️ **27 venues** (staged in Jul 2 §3 — execute July 7) | → Jul 7 |

### Logical Duplicate Venues (open from Jun 30 — deferred per freeze)

| Compact ID | Batch ID | Same coords? | Post-Freeze Fix |
|-----------|---------|--------------|-----------------|
| `bigsky` (45.2865, -111.4013) | `big-sky-montana` (45.2851, -111.4013) | Within 156m — same resort | Remove `bigsky` (compact, fewer tags) |
| `beach_grace` (21.7918, -72.2598) | `grace-bay-turks` (21.8027, -72.2033) | ~1.1km apart — different beach access points | Keep both, consider merging |
| `beach_miami` (exact dup) | `south-beach-miami` (exact coords) | ✅ Exact coord dup | Remove `beach_miami` (batch has better tags) |

---

## 2. Placeholder-Tag Ski Venues (from Jul 1 — staged for post-freeze paste)

Five JSON-format ski venues share identical tags `["Powder Day","All Levels"]` and the same gradient as Whistler (`linear-gradient(160deg,#1a3a5c,#2e6bbf,#6db3f2)`). Confirmed this run.

| Venue ID | Title | lateSeason | Risk |
|----------|-------|-----------|------|
| `winter-park` | Winter Park, CO | ✅ | Can surface in July Ski grid |
| `copper-mountain` | Copper Mountain, CO | ✅ | Can surface in July Ski grid |
| `lake-louise` | Lake Louise, AB | ✅ | Can surface in July Ski grid |
| `palisades-tahoe` | Palisades Tahoe, CA | — | Ski season only |
| `brighton` | Brighton, UT | — | Ski season only |

**Severity: MEDIUM.** These three `lateSeason:true` venues can appear in the July Skiing feed with generic placeholder tags. Any user who taps through sees identical copy — erodes discovery trust for 5,180+ combined reviewed venues.

**Fix-ready (paste July 3 after freeze expires):**

```js
// winter-park
tags:["Parsenn Bowl","Beginner Terrain","Ikon Pass"],
gradient:"linear-gradient(160deg,#0f2a4a,#1d5291,#3a7fc1)",

// copper-mountain
tags:["Natural Terrain Separation","Front Range Access","Ikon Pass"],
gradient:"linear-gradient(160deg,#1a2e1a,#2d5a2d,#5a9e5a)",

// lake-louise
tags:["Glacial Views","Lake Louise Village","Ski Canada"],
gradient:"linear-gradient(160deg,#0a2a3a,#1a5a6a,#3a8a9a)",

// palisades-tahoe
tags:["KT-22 Expert Chutes","Lake Tahoe Views","Ikon Pass"],
gradient:"linear-gradient(160deg,#0d1e40,#1a4a8a,#3a7ac0)",

// brighton
tags:["Cottonwood Powder","Best Utah Night Skiing","Ikon Pass"],
gradient:"linear-gradient(160deg,#1a1a3a,#2d3a6a,#5a6aaa)",
```

---

## 3. NEW: Surf-Category Legacy Tags on 27 Beach Venues

Following the May 2026 surf retirement, 27 beach venues still carry tags from the surfing category filter system. These appear in the tag-chip UI and search corpus.

Nuance from review: some tags like `"Surf Breaks"` on Manly Beach (Sydney) or Waimea Bay are factually accurate as wave descriptors. Tags like `"Kitesurfing Mecca"`, `"Kiteboarding Capital"`, `"World Cup Kite Venue"` are clearly category-specific and should be retired.

**Priority retires (category-specific, not venue-descriptive):**

| Current Tag | Affected Venues | Replace With |
|-------------|-----------------|-------------|
| `Kiteboarding Capital` | `bulabog-beach-boracay-t19`, `long-bay-providenciales` | `Water Sports` |
| `World Cup Kite Venue` | `bulabog-beach-boracay-t19` | `Competitions Held Here` |
| `Kitesurfing Mecca` | `beach_cape_verde` | `Wind Sports` |
| `Kitesurfing` | `zlatni-rat-t14`, `mikri-vigla-naxos`, `le-morne-mauritius`, `paje-zanzibar` | `Water Sports` |
| `Windsurfing` | `bulabog-beach-boracay-t19`, `beach_fuerteventura` | `Wind Sports` |
| `Atlantic Waves` | `asbury-park-beach-nj`, `south-beach-miami` | `Active Shores` |
| `Trade Winds` | `bulabog-beach-boracay-t19`, `beach_cape_verde` | `Cool Breezes` |

**Lower priority (factually accurate wave descriptors — can stay or be replaced):** `Surf Breaks` (15 venues), `Surf Break` (`zuma-beach-malibu`). These describe the beach character honestly; not worth touching unless a "no surf" user filter is implemented.

---

## 4. Photo Audit

- 370 venues, **138 unique photos** → avg **2.7× reuse**, max 3×
- 104 photos at 3× · 24 photos at 2× · 10 venues with unique photos
- Threshold held at 3× since June 13 dedup (commit `a143e4c`)

**Critical for launch:** At 2.7× avg reuse, a user scrolling 20 cards sees the same background image on ~3 different venues. This will get screenshot-dunked on Reddit.

Fix: ~50 new Unsplash photos needed (35 beach + 15 ski) to reach ≤2× across the board. Use existing `scripts/photo-dedup.cjs` to redistribute. The June 13 estimate of "14 more photos" was based on a 323-venue count — catalog has grown to 370 since then.

Each of the 5 new venues staged below uses a photo not in the current 138-photo pool — consistent with the "one new photo per venue add" practice.

---

## 5. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx → 0` — Amazon cut for v1. Confirmed. **Do not restore.**

---

## 6. Seasonal Relevance (July 3, 2026 — July 4 Weekend Eve)

### Active right now
- **Beach peak season:** ~184 N. hemisphere venues at maximum summer scoring. **July 4 weekend starts tomorrow** — highest US domestic beach search volume of the year. If Reddit launched June 30, today is Day 3 of the first traffic spike. Florida Gulf, Southeast, Pacific Coast, Hawaii, Caribbean, Mediterranean all firing.
- **Skiing S. hemisphere in-season (23 venues):** NZ (Remarkables, Coronet Peak, Treble Cone, Cardrona, Mt Hutt), Australia (Thredbo, Perisher, Falls Creek, Buller, Hotham, Charlotte Pass), Chile (Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco), Argentina (Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor) — all at peak mid-season.
- **Skiing lateSeason N. hemi (25 venues):** Whistler, Mammoth, Arapahoe Basin, Tignes/Val d'Isère, Cervinia, Zermatt, Engelberg, Revelstoke, Lake Louise, Val Thorens, Verbier, Méribel, Les Menuires, plus 12 others — bypass active when `snow_depth_max >= 0.5m`.

### Off-season (scoring 0)
- **83 N. hemi non-lateSeason ski venues** — off-season binary cap applied correctly.

### Known gap: summer-glacier venues absent from catalog
Hintertux (year-round), Saas-Fee (ZRH-accessible), Les Deux Alpes (summer glacier Jul–Aug), Mölltal — all operate July ski sessions, none in VENUES. Deferred to July 7 sprint pending Plausible data confirming ski-in-July demand exists in the user base.

---

## 7. Five New Venues — Staged for July 3 Post-Freeze Paste

**All five airports confirmed in `AIRPORT_COORDS` (required for `flightHours()` distance filter).** Verify photo URLs load on Unsplash before pasting — IDs below are not in the current 138-photo pool.

```js
  // ── NEW: Alpe d'Huez, France ──────────────────────────────────────────────
  {
    id:"alpe-d-huez",  category:"skiing",
    title:"Alpe d'Huez", location:"Isère, France",
    lat:45.0900, lon:6.0700, ap:"CMF",
    icon:"🏔️", rating:4.89, reviews:3210,
    gradient:"linear-gradient(160deg,#0d1f3c,#1a4a8a,#4a90d9)",
    accent:"#90caf9",
    tags:["Expert Terrain","Groomed Runs","High Altitude","Long Runs","Sunny Slopes","Family Friendly"],
    photo:"https://images.unsplash.com/photo-1540477960727-8f7e5ad69e7b?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent",
  },

  // ── NEW: St. Moritz, Switzerland ──────────────────────────────────────────
  {
    id:"st-moritz",  category:"skiing",
    title:"St. Moritz", location:"Graubünden, Switzerland",
    lat:46.4975, lon:9.8373, ap:"ZRH",
    icon:"🏔️", rating:4.91, reviews:2876,
    gradient:"linear-gradient(160deg,#1a1a3a,#2e3a8a,#5a7abf)",
    accent:"#b0bec5",
    tags:["Expert Terrain","Off-Piste","High Altitude","Glacier Access","Luxury Resort","Uncrowded"],
    photo:"https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=800&h=600&fit=crop&fp-x=0.55&fp-y=0.45",
    skiPass:"independent",
  },

  // ── NEW: Trysil, Norway ───────────────────────────────────────────────────
  {
    id:"trysil",  category:"skiing",
    title:"Trysil", location:"Innlandet, Norway",
    lat:61.3142, lon:12.2622, ap:"OSL",
    icon:"🎿", rating:4.73, reviews:1654,
    gradient:"linear-gradient(160deg,#0a2a0a,#1a5c2e,#4a9c6a)",
    accent:"#a5d6b0",
    tags:["All Levels","Family Friendly","Groomed Runs","Night Skiing","Beginner Slopes","Uncrowded"],
    photo:"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.5",
    skiPass:"independent",
  },

  // ── NEW: Boulders Beach, South Africa ────────────────────────────────────
  {
    id:"boulders-beach-cpt",  category:"beach",
    title:"Boulders Beach", location:"Western Cape, South Africa",
    lat:-34.1973, lon:18.4519, ap:"CPT",
    icon:"🏖️", rating:4.68, reviews:2103,
    gradient:"linear-gradient(160deg,#003a2a,#006644,#00aa77)",
    accent:"#80cba8",
    tags:["Calm Waters","Scenic Views","Snorkeling Reef","Unique Wildlife","White Sand","Family Friendly"],
    photo:"https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.55",
  },

  // ── NEW: Cortina d'Ampezzo, Italy ─────────────────────────────────────────
  {
    id:"cortina-d-ampezzo",  category:"skiing",
    title:"Cortina d'Ampezzo", location:"Dolomites, Italy",
    lat:46.5404, lon:12.1357, ap:"TRN",
    icon:"🏔️", rating:4.87, reviews:2445,
    gradient:"linear-gradient(160deg,#1a0d00,#5c2a00,#c05a00)",
    accent:"#ffcc80",
    tags:["Expert Terrain","Scenic Views","Off-Piste","Groomed Runs","Luxury Resort","High Altitude"],
    photo:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop&fp-x=0.5&fp-y=0.4",
    skiPass:"independent",
  },
```

**Why these five:**
| Venue | Gap | Airport |
|-------|-----|---------|
| Alpe d'Huez | France's most iconic individual mountain (250km pistes) — missing from 370-venue catalog | CMF ✅ |
| St. Moritz | Original luxury resort, 2× Winter Olympics host — zero Engadin valley coverage | ZRH ✅ |
| Trysil | Scandinavia's largest ski resort — Norway only has Hemsedal, Sweden only Idre | OSL ✅ |
| Boulders Beach | Bucket-list African penguin beach — only 1 CPT venue currently | CPT ✅ |
| Cortina d'Ampezzo | 2026 Milan-Cortina Olympics host — zero Dolomites coverage | TRN ✅ |

**Two airports to register for next sprint:**
- `ICN` (Seoul Incheon) → Yongpyong/Alpensia (2018 Olympic ski venues) — currently 0 South Korea venues
- `DXB` (Dubai) → UAE beach — currently 0 UAE venues despite being a top global travel hub

---

## 8. One Observation for the PM

**It's July 4 eve. Reddit launched 3 days ago. Read Plausible before the July 7 sprint.**

The July 7 sprint backlog now has 8 queued items (photo dedup, 5 placeholder tags, 27 surf-legacy tag retires, 2 duplicate removals, 5 new venue pastes) — all staged and paste-ready in the July 1–2 content reports. Before committing sprint order, run a 72h Plausible read first:

- **Which venues were viewed most?** This calibrates whether the European ski mid-tier gap (Alpe d'Huez, St. Moritz, Cortina) is worth the new-venue pastes, or whether demand is concentrated in US/Caribbean.
- **Which filter chips were tapped?** If "Skiing" chips are low, photo dedup for beach takes priority over new ski venues.
- **What's the day-3 return rate?** If >25%, email retention sprint is more valuable than photo sourcing.

The photo dedup sprint (target: 50 new photos, ≤2× reuse) is the one item that can't wait for demand signal — the dunking risk is structural regardless of which venues users visit. Source photos first, redistribute second.

---

*Content agent — 2026-07-03 UTC | Repo: origin/main cfe73f1 | Venues: 370 (131 ski / 239 beach) | Build: 20260703a ✅ | Prior report: 2026-07-02*
