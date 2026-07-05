# Peakly Content & Data Report — 2026-07-05

**Data health score: 72/100** (open issues unchanged from Jul 4 — freeze lifts tomorrow Jul 7 🚨) | Build: `20260705a` ✅ | Venues: **370** (131 ski / 239 beach) | Max photo repeat: 3×

**⚠️ VENUE FREEZE through July 7** (PM v76, July 2 override). Freeze expires tomorrow — July 7 sprint execution window opens.

---

## Prompt Corrections (permanent — stop re-raising)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **370 venues, 2 categories only.** Pivot happened May 2026. |
| "Hiking has ZERO gear items" | **Hiking category does not exist.** Amazon cut for v1. `GEAR_ITEMS = 0`. |
| "7 categories are single-vendor stubs" | **Only skiing and beach exist.** All other categories retired. |
| "197 venues have empty tag arrays" | **FALSE — all 370 venues have non-empty tags.** Multi-line JSON format was miscounted. |
| "Add 5 new venue objects" | **VENUE FREEZE active through July 7.** 5 venues staged in §8 for tomorrow. |

---

## Fix Applied This Run

**None.** Verification pass only. All July 4 open findings confirmed unchanged. One new finding added: **cross-category photo contamination (§5)** — 2 beach venue cards likely rendering ski/mountain images. Flag for Jack visual review; staged fix also in §5.

---

## 1. Data Integrity Audit

### Venue Counts

| Category | Venues | In Season (Jul 5, N. Hemi Summer) |
|----------|--------|-------------------------------------------|
| **Beach** | 239 | **~184 N. hemi at PEAK** · ~55 S. hemi suppressed by <18°C cap |
| **Skiing** | 131 | **23 S. hemi at peak southern winter** (NZ/AUS/Andes) · **25 `lateSeason:true`** eligible · **83 N. hemi off-season** |
| **TOTAL** | **370** | Verified via bracket-walk eval. Never use grep — undercounts to 156. |

### Structural Integrity

| Check | Result | Δ from Jul 4 |
|-------|--------|--------------|
| Valid venue objects | ✅ 370 | — |
| Duplicate IDs | ✅ 0 | — |
| Missing lat/lon | ✅ 0 | — |
| Missing airport codes (`ap`) | ✅ 0 | — |
| Missing tags | ✅ 0 | — |
| Missing photos | ✅ 0 | — |
| Zero/single-tag venues | ✅ 0 | — |
| Max photo repeat (within-category) | ✅ 3× | — |
| Cross-category photo contamination | ⚠️ **2 beach venues** using ski photos | **NEW — see §5** |
| `lateSeason:true` venues | ✅ 25 | — |
| GEAR_ITEMS refs | ✅ 0 | — |
| Build stamp | ✅ `20260705a` | ↑ DevOps bumped |
| skiPass coverage | ✅ 131/131 (34 Epic / 51 Ikon / 46 independent) | — |
| Ratings | ✅ range 4.0–4.99, avg 4.71 | — |
| Airport coverage | ✅ all `ap` values in AIRPORT_COORDS | — |
| Placeholder-tag venues | ⚠️ **5 open** (staged §6, execute July 7) | unchanged |
| Logical duplicate venue pairs | ⚠️ **3 open** (staged §7, execute July 7) | unchanged |
| Surf-legacy tags | ⚠️ **27 venues** (staged Jul 2, execute July 7) | unchanged |
| Code hygiene comments (non-runtime) | ⚠️ 2 bare-object comments in VENUES | unchanged |

---

## 2. GEAR_ITEMS Audit

`grep -c GEAR_ITEMS app.jsx → 0` — Amazon cut for v1. Confirmed. **Do not restore.**

---

## 3. Seasonal Relevance (Jul 5, 2026)

### Beach — Peak

**~184 N. hemisphere beach venues** at maximum summer scoring — Mediterranean (Greece/Croatia/Italy/Spain/Turkey), Caribbean, US East Coast, Hawaii, SE Asia all firing. Yesterday was July 4 peak; post-holiday intent typically holds strong through Sunday Jul 6 as people search for next-weekend options.

US beach gap still open: ~17 continental US venues vs 222 international. If Plausible confirms US bounce on Beach filter >40%, the 5 staged venues (§8) can be biased toward US coastal on July 7.

**~55 S. hemisphere beach venues** suppressed by 18°C water-temp cap — correct for southern winter. Sydney cluster (7 venues at lat < −33) scores off the front page until October.

### Skiing — Southern Peak

**23 S. hemisphere venues at mid-peak winter:** NZ (Cardrona, Mt Hutt, Coronet Peak, Remarkables, Treble Cone), AUS (Falls Creek, Mt Buller, Hotham, Perisher, Charlotte Pass), Andes (Portillo, Valle Nevado, La Parva, El Colorado, Nevados de Chillán, Corralco, Cerro Catedral, Las Leñas, Chapelco, Caviahue, Cerro Castor, Pucon). Hemisphere gate `isNorth = lat >= 0` confirmed correct for all 23. These score as `inSeason` in July without needing `lateSeason` flag.

**25 N. hemisphere `lateSeason:true` glaciers** eligible at `snow_depth ≥ 0.5m` — Tignes, Zermatt/Cervinia summer glacier, Chamonix, Verbier peak summer glacier sessions are real ops.

**83 N. hemi off-season** correctly capped at `score = 8`.

---

## 4. Tag Distribution

| Tag Count | Venues |
|-----------|--------|
| 0 | ✅ 0 |
| 1 | ✅ 0 |
| 2 | 238 |
| 3 | 14 |
| 4 | 117 |
| 5+ | 1 |

238 venues at minimum 2-tag depth — unchanged. Tag enrichment deferred to July 7 sprint based on Plausible filter-click data.

---

## 5. NEW: Cross-Category Photo Contamination ⚠️

**Two beach venue cards are almost certainly rendering mountain/ski photos.** This is a live, user-visible quality issue.

| Beach venue | Review count | Photo URL (partial) | Also used by (ski) |
|---|---|---|---|
| South Beach Miami (`south-beach-miami`) | **42,800** — most-reviewed venue in catalog | `...1605540436563-5bca919ae766` | Kiroro Snow World · Mount Snow |
| Grace Bay Beach (`grace-bay-turks`) | 2,109 | `...1531743672295-bbd901790069` | Andermatt · Engelberg-Titlis |

The photo IDs were assigned to ski venues first (Andermatt, Engelberg, Kiroro, Mount Snow), strongly suggesting they're mountain/snow images. When the beach batch was pasted, these IDs were reused by accident.

**Jack: verify in 30 seconds** — open app, tap South Beach Miami, check if the hero photo shows snow. If yes, swap these two photo URLs:

```
south-beach-miami: replace photo with any of these unused/underused beach Unsplash IDs
  → https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop  (open ocean/beach)
  → https://images.unsplash.com/photo-1500854784-a582d3283fb4?w=800&h=600&fit=crop  (Miami/urban beach)

grace-bay-turks: replace photo with any turquoise-water beach photo
  → https://images.unsplash.com/photo-1414609245224-aea9a7afaef8?w=800&h=600&fit=crop  (turquoise Caribbean)
```

This is a one-line edit per venue in `app.jsx` — fix is <5 minutes. Execute before July 7 sprint if possible; South Beach Miami's review count makes it high-priority.

---

## 6. Placeholder-Tag Ski Venues (staged — execute July 7)

Five JSON-format ski venues share identical placeholder tags `["Powder Day","All Levels"]` and the same gradient as Whistler — **unchanged from Jul 4**.

| Venue ID | Title | lateSeason | Risk |
|----------|-------|-----------|------|
| `winter-park` | Winter Park, CO | ✅ | Surfaces in July lateSeason grid |
| `copper-mountain` | Copper Mountain, CO | ✅ | Surfaces in July lateSeason grid |
| `lake-louise` | Lake Louise, AB | ✅ | Surfaces in July lateSeason grid |
| `palisades-tahoe` | Palisades Tahoe, CA | — | Off-season |
| `brighton` | Brighton, UT | — | Off-season |

**Fix-ready (paste July 7):**

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

## 7. Logical Duplicate Venues (staged — execute July 7)

**Unchanged from Jul 4.**

| Compact ID | Batch ID | Same coords? | Fix |
|-----------|---------|--------------|-----|
| `bigsky` (45.2865, -111.4013) | `big-sky-montana` (45.2851, -111.4013) | ~156m — same resort | Remove `bigsky` (fewer tags) |
| `beach_grace` (21.7918, -72.2598) | `grace-bay-turks` (21.8027, -72.2033) | ~1.1km apart | Keep both — different sections |
| `beach_miami` | `south-beach-miami` (exact coords) | ✅ Exact dup | Remove `beach_miami` |

Also pending (Jul 4): rewrite 2 bare-object inline comments in VENUES array (lines 4736, 4747) to plain prose so parsing tools don't miscounts them as venues.

---

## 8. Five Venues Staged for July 7 (Post-Freeze)

All airports confirmed in AIRPORT_COORDS. Photo IDs are not in the current 138-pool — each adds a net-new unique.

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

---

## One Observation for the PM

**The freeze lifts tomorrow (July 7) and South Beach Miami is almost certainly showing a snow mountain photo.** With 42,800 reviews it's the most-reviewed venue in the catalog — it gets tapped. If the Reddit launch drove any traffic, a meaningful number of users saw the wrong image. The photo swap is a single-line edit, 5 minutes, and doesn't touch anything freeze-sensitive. It's worth doing today rather than bundling into the sprint. Everything else (placeholder tags, duplicates, surf-legacy) can wait for tomorrow's sprint as planned.

---

*Content agent — 2026-07-05 UTC | Repo: bf5936e | Venues: 370 (131 ski / 239 beach) | Build: 20260705a ✅ | Prior report: 2026-07-04*
